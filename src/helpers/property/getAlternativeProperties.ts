import { Brackets, getManager } from 'typeorm';
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

/**
 * Returns alternative properties according to the provided filters
 *
 * @param {CheckAvailabilityDto} checkAvailabilityDto
 * @returns IAlternative[]
 */
export const getAlternativeProperties = async (
  checkAvailabilityDto: CheckAvailabilityDto,
): Promise<IAlternative[] | []> => {
  let alternativeQuery = await getManager()
    .createQueryBuilder(Property, 'property')
    .select(['property.id AS id', 'no.idea.what AS availableStarting'])
    .distinct(true)
    .innerJoin('property.building', 'building')
    .where('building.city = :city', { city: checkAvailabilityDto.city })
    .andWhere('property.amenities <@ :...amenities', {
      amenities: checkAvailabilityDto.amenities,
    });

  if (checkAvailabilityDto.apartmentType) {
    alternativeQuery = alternativeQuery.andWhere(
      'property.propertyType = :propertyType',
      {
        propertyType: checkAvailabilityDto.apartmentType,
      },
    );
  }

  // the date to start searching from
  let startDate: string;
  // the number of available days to search for
  let nbOfDays = 0;
  // the day index of the start of the weekend
  let weekendStartDayIndex = 0;

  if (checkAvailabilityDto.date) {
    startDate = checkAvailabilityDto.date.start;

    // get the number of days the client was searching for
    nbOfDays = getDiffDaysBetweenDates(
      checkAvailabilityDto.date.start,
      checkAvailabilityDto.date.end,
    );
    // and fetch the closest alternative
    // starting from the start date
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

  alternativeQuery = alternativeQuery
    .leftJoin(
      'property.reservations',
      'reservation',
      "reservation.checkIn >= DATE :start + interval '1 day'",
      { start: startDate },
    )
    .leftJoin(
      'property.availabilities',
      'availability',
      "availability.endDate >= DATE :start + interval '1 day'",
      { start: startDate },
    )
    .leftJoin(
      'property.reservations',
      'reservation2',
      "reservation2.checkOut >= DATE :startDate + interval '1 day'",
      { startDate },
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
                  ) * interval '1 day', :nbOfDays * interval '1 day')
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
                  ) * interval '1 day' + :nbOfDays * interval '1 day'),
                    COALESCE(reservation.checkOut, DATE :startDate + (
                      CASE 
                        WHEN NOT :weekendStartDayIndex > 0 
                          THEN 0
                          ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate) > 0 
                            THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                            ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                          END
                      END
                    ) * interval '1 day' + 2 * :nbOfDays * interval '1 day')
                  )
                `,
              { startDate, nbOfDays, weekendStartDayIndex },
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
                  ) * interval '1 day', :nbOfDays * interval '1 day')
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
                    ) * interval '1 day' + :nbOfDays * interval '1 day'),
                    COALESCE(availability.endDate, DATE :startDate + (
                      CASE 
                        WHEN NOT :weekendStartDayIndex > 0 
                          THEN 0
                          ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate) > 0 
                            THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                            ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                          END
                      END
                    ) * interval '1 day' + 2 * :nbOfDays * interval '1 day')
                  )
                `,
                { startDate, nbOfDays, weekendStartDayIndex },
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
                    :nbOfDays * interval '1 day'
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
                    ) * interval '1 day' + :nbOfDays * interval '1 day'),
                    COALESCE(reservation.checkOut, DATE :startDate + (
                      CASE 
                        WHEN NOT :weekendStartDayIndex > 0 
                          THEN 0
                          ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate) > 0 
                            THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                            ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                          END
                      END
                    ) * interval '1 day' + 2 * :nbOfDays * interval '1 day')
                  )
                `,
              { startDate, nbOfDays, weekendStartDayIndex },
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
                    :nbOfDays * interval '1 day'
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
                    ) * interval '1 day' + :nbOfDays * interval '1 day'),
                    COALESCE(availability.endDate, DATE :startDate + (
                      CASE 
                        WHEN NOT :weekendStartDayIndex > 0 
                          THEN 0
                          ELSE CASE WHEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate) > 0 
                            THEN :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                            ELSE 7 + :weekendStartDayIndex - EXTRACT(ISODOW FROM DATE :startDate)
                          END
                      END
                    ) * interval '1 day' + 2 * :nbOfDays * interval '1 day')
                  )
                `,
                { startDate, nbOfDays, weekendStartDayIndex },
              )
              .andWhere('availability.isBlocked = true');
          }),
        );
      }),
    );

  alternativeQuery = alternativeQuery.andWhere(
    'availability.isBlocked = false',
  );

  const matchResult = alternativeQuery.printSql().getRawMany();

  return matchResult;
};
