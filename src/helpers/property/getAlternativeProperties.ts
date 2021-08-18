import { getManager } from 'typeorm';
import { CheckAvailabilityDto } from 'src/dtos/check-availability.dto';
import { Property } from 'src/entities/property.entity';
import { IAlternative } from 'src/interfaces/property-availability-check-result.interface';
import {
  flexibilityIncrementDays,
  fridaySaturdayWeekendCities,
} from 'src/utils/constants';
import { FlexibilityType } from 'src/enums/flexibility-type.enum';
import { getIntervalEndDate } from 'src/utils/getFlexibilityMonthsDates';
import { getSortedDistinctMonths } from 'src/utils/getSortedDistinctMonths';
import { getDiffDaysBetweenDates } from 'src/utils/getDiffDaysBetweenDates';
import { Reservation } from 'src/entities/reservation.entity';
import { Availability } from 'src/entities/availability.entity';
import { addDays } from 'src/utils/addDays';
import { formatDbDate } from 'src/utils/formatDbDate';

/**
 * Returns alternative properties according to the provided filters
 *
 * @param {CheckAvailabilityDto} checkAvailabilityDto
 * @returns IAlternative[]
 */
export const getAlternativeProperties = async (
  checkAvailabilityDto: CheckAvailabilityDto,
): Promise<IAlternative[] | []> => {
  // the date to start searching from
  let startDate: string;

  // the number of available days to search for
  let nbOfDays = 0;

  // the day index of the start of the weekend
  let weekendStartDayIndex = 0;

  if (checkAvailabilityDto.date) {
    // the start date is the next day of the provided start date
    startDate = checkAvailabilityDto.date.start;

    // get the number of days the client was searching for
    nbOfDays = getDiffDaysBetweenDates(
      checkAvailabilityDto.date.start,
      checkAvailabilityDto.date.end,
    );
  } else {
    const distinctSortedMonths = getSortedDistinctMonths(
      checkAvailabilityDto.flexible.months,
    );

    // the start date is the day after the end date of the months list
    startDate = getIntervalEndDate(
      distinctSortedMonths[distinctSortedMonths.length - 1],
    );
    nbOfDays = flexibilityIncrementDays[checkAvailabilityDto.flexible.type];

    // if the provided type is weekend
    if (checkAvailabilityDto.flexible.type == FlexibilityType.weekend) {
      weekendStartDayIndex = fridaySaturdayWeekendCities.includes(
        checkAvailabilityDto.city,
      )
        ? 5
        : 6;
    }
  }

  startDate = addDays(startDate, 1);

  // sub-query to replace reservation3.checkout by startDate incase it's null
  const coalesceStartDate = await getManager()
    .createQueryBuilder(Property, 'prop2')
    .select(`COALESCE(reservation3.checkOut + interval '1 day', :startDate)`)
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
      `((${flexibilityReservationStartDate.getQuery()}), (:nbOfDays + 1) * interval '1 day') OVERLAPS (reservation2.checkIn, reservation2.checkOut)`,
    );

  const flexibilityOverlappingAvailabilityBlockedCount = await getManager()
    .createQueryBuilder(Availability, 'availability')
    .select('COUNT(id)')
    .where('availability.propertyId = property.id')
    .andWhere('availability.isBlocked = true')
    .andWhere(
      `((${flexibilityReservationStartDate.getQuery()}), (:nbOfDays + 1) * interval '1 day') OVERLAPS (availability.startDate, availability.endDate)`,
    );

  const alternativeQuery = await getManager()
    .createQueryBuilder(Property, 'property')
    .select('property.id', 'id')
    .addSelect(`(${coalesceStartDate.getQuery()})`, 'availableStarting')
    .innerJoin('property.building', 'building');

  alternativeQuery
    .leftJoin(
      'property.reservations',
      'reservation3',
      `reservation3.checkOut >= :startDate::date`,
      {
        startDate,
        nbOfDays,
      },
    )
    .where(
      `(
      (${flexibilityOverlappingReservationsCount.getQuery()}) + 
      (${flexibilityOverlappingAvailabilityBlockedCount.getQuery()})) = 0`,
    )
    .setParameters({ startDate, weekendStartDayIndex, nbOfDays })
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
    alternativeQuery.andWhere('property.propertyType = :propertyType', {
      propertyType: checkAvailabilityDto.apartmentType,
    });
  }

  const alternativeResult = await alternativeQuery
    .orderBy(`(${coalesceStartDate.getQuery()})`, 'ASC')
    // .groupBy('property.id')
    .getRawMany();

  // return alternativeResult;
  return alternativeResult.map((element) => {
    return {
      ...element,
      availableStarting: formatDbDate(element.availableStarting),
    };
  });
};
