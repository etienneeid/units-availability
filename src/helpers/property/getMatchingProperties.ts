import { Brackets, getManager } from 'typeorm';
import { CheckAvailabilityDto } from 'src/dtos/check-availability.dto';
import { Property } from 'src/entities/property.entity';
import { Reservation } from 'src/entities/reservation.entity';
import { Availability } from 'src/entities/availability.entity';
import {
  flexibilityIncrementDays,
  fridaySaturdayWeekendCities,
} from 'src/utils/constants';
import { FlexibilityType } from 'src/enums/flexibility-type.enum';
import {
  getIntervalEndDate,
  getIntervalStartDate,
} from 'src/utils/getFlexibilityMonthsDates';
import { getSortedDistinctMonths } from 'src/utils/getSortedDistinctMonths';
import { addDays } from 'src/utils/addDays';
import { jumpToNextWeekend } from 'src/utils/jumpToNextWeekend';

/**
 * Returns the ids of the properties matching the filtering params
 *
 * @param {CheckAvailabilityDto} checkAvailabilityDto
 * @returns number[]
 */
export const getMatchingProperties = async (
  checkAvailabilityDto: CheckAvailabilityDto,
): Promise<number[] | []> => {
  // when equals to 0 it means that
  // the provided flexible type is other than weekend
  let weekendStartDayIndex = 0;

  // add 1 day to the end date for the overlaps to work properly
  const dateOverlappingReservationsCount = await getManager()
    .createQueryBuilder(Reservation, 'reservation')
    .select('COUNT(id)')
    .where('reservation.propertyId = property.id')
    .andWhere(
      `(:start::date, :end::date + interval '1 day') OVERLAPS (reservation.checkIn, reservation.checkOut)`,
    );

  const dateOverlappingAvailabilityBlockedCount = await getManager()
    .createQueryBuilder(Availability, 'availability')
    .select('COUNT(id)')
    .where('availability.propertyId = property.id')
    .andWhere('availability.isBlocked = true')
    .andWhere(
      `(:start::date, :end::date + interval '1 day') OVERLAPS (availability.startDate, availability.endDate)`,
    );

  const matchQuery = await getManager()
    .createQueryBuilder(Property, 'property')
    .select('property.id', 'id')
    .distinct(true)
    .innerJoin('property.building', 'building');

  if (checkAvailabilityDto.date) {
    matchQuery.where(
      `(
        (${dateOverlappingReservationsCount.getQuery()}) + 
        (${dateOverlappingAvailabilityBlockedCount.getQuery()})) = 0`,
      {
        start: checkAvailabilityDto.date.start,
        end: checkAvailabilityDto.date.end,
      },
    );
  } else {
    const distinctSortedMonths = getSortedDistinctMonths(
      checkAvailabilityDto.flexible.months,
    );

    const startDate = getIntervalStartDate(distinctSortedMonths[0]);
    const endDate = getIntervalEndDate(
      distinctSortedMonths[distinctSortedMonths.length - 1],
    );
    const flexibilityTypeDays =
      flexibilityIncrementDays[checkAvailabilityDto.flexible.type];

    // if the provided type is weekend
    if (checkAvailabilityDto.flexible.type == FlexibilityType.weekend) {
      weekendStartDayIndex = fridaySaturdayWeekendCities.includes(
        checkAvailabilityDto.city,
      )
        ? 5
        : 6;
    }

    // sub-query to replace unavailability.endDate by startDate incase it's null
    const coalesceStartDate = await getManager()
      .createQueryBuilder(Property, 'prop2')
      .select(`COALESCE(unavailability.endDate + interval '1 day', :startDate)`)
      .limit(1);

    // sub-query to jump to next weekend
    const flexibilityReservationStartDate = await getManager()
      .createQueryBuilder(Property, 'prop')
      .select(
        `
        CASE
          WHEN NOT :weekendStartDayIndex > 0
            THEN (${coalesceStartDate.getQuery()})
            ELSE CASE 
              WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM (${coalesceStartDate.getQuery()})) > 0
              THEN (${coalesceStartDate.getQuery()}) + (:weekendStartDayIndex - EXTRACT(ISODOW FROM (${coalesceStartDate.getQuery()}))) * interval '1 day'
              ELSE (${coalesceStartDate.getQuery()}) + (7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM (${coalesceStartDate.getQuery()}))) * interval '1 day'
            END
        END`,
      )
      .limit(1);

    // add 1 day to the end date for the overlaps to work properly
    const flexibilityOverlappingReservationsCount = await getManager()
      .createQueryBuilder(Reservation, 'reservation2')
      .select('COUNT(id)')
      .where('reservation2.propertyId = property.id')
      .andWhere(
        `((${flexibilityReservationStartDate.getQuery()}), (:flexibilityTypeDays + 1) * interval '1 day') OVERLAPS (reservation2.checkIn, reservation2.checkOut)`,
      );

    const flexibilityOverlappingAvailabilityBlockedCount = await getManager()
      .createQueryBuilder(Availability, 'availability')
      .select('COUNT(id)')
      .where('availability.propertyId = property.id')
      .andWhere('availability.isBlocked = true')
      .andWhere(
        `((${flexibilityReservationStartDate.getQuery()}), (:flexibilityTypeDays + 1) * interval '1 day') OVERLAPS (availability.startDate, availability.endDate)`,
      );

    matchQuery
      .leftJoin(
        `(SELECT
          property_id AS propertyId,
          check_in AS startDate,
          check_out AS endDate
        FROM reservation
        UNION
        SELECT
          property_id AS propertyId,
          start_date AS startDate,
          end_date AS endDate
        FROM availability
        WHERE is_blocked = true)`,
        'unavailability',
        `unavailability.propertyId = property.id AND unavailability.endDate BETWEEN :startDate::date AND :endDate::date - :flexibilityTypeDays * interval '1 day'`,
        {
          startDate,
          endDate,
          flexibilityTypeDays,
        },
      )
      .where(
        new Brackets((q1) => {
          q1.where(
            `(
            (${dateOverlappingReservationsCount.getQuery()}) + 
            (${dateOverlappingAvailabilityBlockedCount.getQuery()})) = 0`,
            {
              start: jumpToNextWeekend(startDate, weekendStartDayIndex),
              end: addDays(
                jumpToNextWeekend(startDate, weekendStartDayIndex),
                flexibilityTypeDays,
              ),
            },
          ).orWhere(`(
            (${flexibilityOverlappingReservationsCount.getQuery()}) + 
            (${flexibilityOverlappingAvailabilityBlockedCount.getQuery()})) = 0`);
        }),
      )
      .setParameters({ startDate, weekendStartDayIndex, flexibilityTypeDays });
  }

  matchQuery
    .andWhere('building.city = :city', {
      city: checkAvailabilityDto.city,
    })
    .andWhere(
      'property.amenities::varchar[] @> ARRAY [:...amenities]::varchar[]',
      {
        amenities: checkAvailabilityDto.amenities,
      },
    );

  if (checkAvailabilityDto.apartmentType) {
    matchQuery.andWhere('property.propertyType = :propertyType', {
      propertyType: checkAvailabilityDto.apartmentType,
    });
  }

  const matchResult = await matchQuery.getRawMany();

  return matchResult.map((element) => element.id);
};
