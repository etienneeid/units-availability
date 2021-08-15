import { CheckAvailabilityDto } from 'src/dtos/check-availability.dto';
import { getSortedDistinctMonths } from './getSortedDistinctMonths';
import { checkMonthsConsecutiveness } from './checkMonthsConsecutiveness';
import { InvalidDateFilterValuesException } from 'src/exceptions/InvalidDateFilterValues.exception';
import { MultipleTimeFiltersException } from 'src/exceptions/MultipleTimeFilters.exception';
import { NoTimeFiltersException } from 'src/exceptions/NoTimeFilters.exception';
import { PastStartDateException } from 'src/exceptions/PastStartDate.exception';
import { validateFlexibilityTypeVSMonths } from './validateFlexibilityTypeVSMonths';

/**
 * Checks the validity of the date and flexibility parameters
 *
 * @param {CheckAvailabilityDto} checkAvailabilityDto
 *
 * @throws NoTimeFiltersException
 * @throws MultipleTimeFiltersException
 * @throws PastStartDateException
 * @throws InvalidDateFilterValuesException
 */
export const validateDateAndFlexibility = (
  checkAvailabilityDto: CheckAvailabilityDto,
): void => {
  const now = new Date();

  if (!checkAvailabilityDto.date && !checkAvailabilityDto.flexible) {
    throw new NoTimeFiltersException();
  }

  if (checkAvailabilityDto.date && checkAvailabilityDto.flexible) {
    throw new MultipleTimeFiltersException();
  }

  if (checkAvailabilityDto.date) {
    const startDate = new Date(checkAvailabilityDto.date.start);
    const endDate = new Date(checkAvailabilityDto.date.end);

    if (Number(now) > Number(startDate)) {
      throw new PastStartDateException();
    }

    if (startDate > endDate) {
      throw new InvalidDateFilterValuesException();
    }
  } else {
    const distinctSortedMonths = getSortedDistinctMonths(
      checkAvailabilityDto.flexible.months,
    );
    checkMonthsConsecutiveness(distinctSortedMonths);
    validateFlexibilityTypeVSMonths(
      checkAvailabilityDto.flexible.type,
      distinctSortedMonths,
    );
  }
};
