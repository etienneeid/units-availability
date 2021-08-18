import { flexibilityIncrementDays, months } from 'src/utils/constants';
import { FlexibilityType } from 'src/enums/flexibility-type.enum';
import { IncompatibleFlexibilityException } from 'src/exceptions/IncompatibleFlexibility.exception';

/**
 * Checks if the provided month(s) are compatible with the provided type
 *
 * @param {FlexibilityType} flexibleType
 * @param {string[]} sortedMonths
 *
 * @throws IncompatibleFlexibilityException
 */
export const validateFlexibilityTypeVSMonths = (
  flexibleType: FlexibilityType,
  sortedMonths: string[],
): void => {
  // get current date
  const now = new Date();

  // get the current month index
  const currentMonthIndex = now.getMonth() + 1;

  // if the months list contains 1 month and it's the current month
  if (
    sortedMonths.length == 1 &&
    currentMonthIndex == months[sortedMonths[0]]
  ) {
    // get the end of month date
    const endOfMonth = new Date(now.getFullYear(), currentMonthIndex, 0);

    // difference in days between today and the end of the month
    const daysDifference = endOfMonth.getDate() - now.getDate();

    const daysToCheck = flexibilityIncrementDays[flexibleType];

    if (daysToCheck > daysDifference) {
      throw new IncompatibleFlexibilityException();
    }
  }
};
