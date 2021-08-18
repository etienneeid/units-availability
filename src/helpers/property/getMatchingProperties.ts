import { Brackets, getManager } from 'typeorm';
import { CheckAvailabilityDto } from 'src/dtos/check-availability.dto';
import { Property } from 'src/entities/property.entity';
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

/**
 * Returns the ids of the properties matching the filtering params
 *
 * @param {CheckAvailabilityDto} checkAvailabilityDto
 * @returns number[]
 */
export const getMatchingProperties = async (
  checkAvailabilityDto: CheckAvailabilityDto,
): Promise<number[] | []> => {
  let matchQuery = await getManager()
    .createQueryBuilder(Property, 'property')
    .select('property.id', 'id')
    .distinct(true)
    .innerJoin('property.building', 'building')
    .where('building.city = :city', { city: checkAvailabilityDto.city })
    .andWhere('property.amenities <@ :...amenities', {
      amenities: checkAvailabilityDto.amenities,
    });

  if (checkAvailabilityDto.apartmentType) {
    matchQuery = matchQuery.andWhere('property.propertyType = :propertyType', {
      propertyType: checkAvailabilityDto.apartmentType,
    });
  }

  if (checkAvailabilityDto.date) {
    matchQuery = matchQuery
      .leftJoin(
        'property.reservations',
        'reservation',
        'reservation.checkIn >= DATE :start',
        { start: checkAvailabilityDto.date.start },
      )
      .leftJoin(
        'property.availabilities',
        'availability',
        'availability.endDate >= DATE :start',
        { start: checkAvailabilityDto.date.start },
      )
      .andWhere(
        'NOT (reservation.checkIn, reservation.checkOut) OVERLAPS (DATE :checkIn, DATE :checkOut)',
        {
          checkIn: checkAvailabilityDto.date.start,
          checkOut: checkAvailabilityDto.date.end,
        },
      )
      .andWhere(
        'NOT (availability.startDate, availability.endDate) OVERLAPS (DATE :startDate, DATE :endDate)',
        {
          startDate: checkAvailabilityDto.date.start,
          endDate: checkAvailabilityDto.date.end,
        },
      )
      .andWhere('availability.isBlocked = true');
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

    let weekendStartDayIndex = 0;
    // if the provided type is weekend
    if (checkAvailabilityDto.flexible.type == FlexibilityType.weekend) {
      weekendStartDayIndex = fridaySaturdayWeekendCities.includes(
        checkAvailabilityDto.city,
      )
        ? 5
        : 6;
    }

    matchQuery = matchQuery
      .leftJoin(
        'property.reservations',
        'reservation',
        'reservation.checkIn >= DATE :start',
        { start: getIntervalStartDate(distinctSortedMonths[0]) },
      )
      .leftJoin(
        'property.availabilities',
        'availability',
        'availability.endDate >= DATE :start',
        { start: getIntervalStartDate(distinctSortedMonths[0]) },
      )
      .leftJoin(
        'property.reservations',
        'reservation2',
        "reservation2.checkOut BETWEEN DATE :startDate AND DATE :endDate - :flexibilityTypeDays * interval '1 day'",
        {
          startDate,
          endDate,
          flexibilityTypeDays,
        },
      )
      .andWhere(
        new Brackets((q1) => {
          q1.where(
            new Brackets((q2) => {
              q2.where(
                `NOT
                  (DATE :startDate + (
                    CASE 
                      WHEN NOT :weekendStartDayIndex > 0 
                        THEN 0
                        ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate) > 0 
                          THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                          ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                        END
                    END
                  ) * interval '1 day', :flexibilityTypeDays * interval '1 day')
                    OVERLAPS
                  (
                    COALESCE(reservation.checkIn, DATE :startDate + (
                    CASE 
                      WHEN NOT :weekendStartDayIndex > 0 
                        THEN 0
                        ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate) > 0 
                          THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                          ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                        END
                    END
                  ) * interval '1 day' + :flexibilityTypeDays * interval '1 day'),
                    COALESCE(reservation.checkOut, DATE :startDate + (
                      CASE 
                        WHEN NOT :weekendStartDayIndex > 0 
                          THEN 0
                          ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate) > 0 
                            THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                            ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                          END
                      END
                    ) * interval '1 day' + 2 * :flexibilityTypeDays * interval '1 day')
                  )
                `,
                { startDate, flexibilityTypeDays, weekendStartDayIndex },
              )
                .andWhere(
                  `NOT
                  (DATE :startDate + (
                    CASE 
                      WHEN NOT :weekendStartDayIndex > 0 
                        THEN 0
                        ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate) > 0 
                          THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                          ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                        END
                    END
                  ) * interval '1 day', :flexibilityTypeDays * interval '1 day')
                    OVERLAPS
                  (
                    COALESCE(availability.startDate, DATE :startDate + (
                      CASE 
                        WHEN NOT :weekendStartDayIndex > 0 
                          THEN 0
                          ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate) > 0 
                            THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                            ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                          END
                      END
                    ) * interval '1 day' + :flexibilityTypeDays * interval '1 day'),
                    COALESCE(availability.endDate, DATE :startDate + (
                      CASE 
                        WHEN NOT :weekendStartDayIndex > 0 
                          THEN 0
                          ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate) > 0 
                            THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                            ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                          END
                      END
                    ) * interval '1 day' + 2 * :flexibilityTypeDays * interval '1 day')
                  )
                `,
                  { startDate, flexibilityTypeDays, weekendStartDayIndex },
                )
                .andWhere('availability.isBlocked = true');
            }),
          ).orWhere(
            new Brackets((q3) => {
              q3.where(
                `NOT
                  (
                    COALESCE (reservation2.checkOut + interval '1 day', DATE :startDate) + (
                      CASE 
                        WHEN NOT :weekendStartDayIndex > 0 
                          THEN 0
                          ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM COALESCE (reservation2.checkOut + interval '1 day', DATE :startDate)) > 0 
                            THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM COALESCE (reservation2.checkOut + interval '1 day', DATE :startDate))
                            ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM COALESCE (reservation2.checkOut + interval '1 day', DATE :startDate))
                          END
                      END
                    ) * interval '1 day',
                    :flexibilityTypeDays * interval '1 day'
                  ) 
                    OVERLAPS
                  (
                    COALESCE(reservation.checkIn, DATE :startDate + (
                      CASE 
                        WHEN NOT :weekendStartDayIndex > 0 
                          THEN 0
                          ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate) > 0 
                            THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                            ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                          END
                      END
                    ) * interval '1 day' + :flexibilityTypeDays * interval '1 day'),
                    COALESCE(reservation.checkOut, DATE :startDate + (
                      CASE 
                        WHEN NOT :weekendStartDayIndex > 0 
                          THEN 0
                          ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate) > 0 
                            THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                            ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                          END
                      END
                    ) * interval '1 day' + 2 * :flexibilityTypeDays * interval '1 day')
                  )
                `,
                { startDate, flexibilityTypeDays, weekendStartDayIndex },
              )
                .andWhere(
                  `NOT
                  (
                    COALESCE (reservation2.checkOut + interval '1 day', DATE :startDate) + (
                      CASE 
                        WHEN NOT :weekendStartDayIndex > 0 
                          THEN 0
                          ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM COALESCE (reservation2.checkOut + interval '1 day', DATE :startDate)) > 0 
                            THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM COALESCE (reservation2.checkOut + interval '1 day', DATE :startDate))
                            ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM COALESCE (reservation2.checkOut + interval '1 day', DATE :startDate))
                          END
                      END
                    ) * interval '1 day', 
                    :flexibilityTypeDays * interval '1 day'
                  )
                    OVERLAPS
                  (
                    COALESCE(availability.startDate, DATE :startDate + (
                      CASE 
                        WHEN NOT :weekendStartDayIndex > 0 
                          THEN 0
                          ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate) > 0 
                            THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                            ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                          END
                      END
                    ) * interval '1 day' + :flexibilityTypeDays * interval '1 day'),
                    COALESCE(availability.endDate, DATE :startDate + (
                      CASE 
                        WHEN NOT :weekendStartDayIndex > 0 
                          THEN 0
                          ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate) > 0 
                            THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                            ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                          END
                      END
                    ) * interval '1 day' + 2 * :flexibilityTypeDays * interval '1 day')
                  )
                `,
                  { startDate, flexibilityTypeDays, weekendStartDayIndex },
                )
                .andWhere('availability.isBlocked = true');
            }),
          );
        }),
      );

    matchQuery = matchQuery.andWhere('availability.isBlocked = false');
  }

  const matchResult = matchQuery.printSql().getRawMany();

  return matchResult;
};
