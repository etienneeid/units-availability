import { InconsecutiveMonthsListException } from 'src/exceptions/InconsecutiveMonthsList.exception';
import { months } from 'src/utils/constants';

/**
 * Checks if the months in the provided list are consecutive
 *
 * @param {string[]} sortedMonths
 *
 * @throws InconsecutiveMonthsListException
 */
export const checkMonthsConsecutiveness = (sortedMonths: string[]): void => {
  // get the current month index
  const currentMonthIndex = new Date().getMonth() + 1;

  for (let i = 0; i < sortedMonths.length; i++) {
    const index =
      currentMonthIndex > months[sortedMonths[i]]
        ? months[sortedMonths[i]] + 12
        : months[sortedMonths[i]];
    const nextIndex =
      currentMonthIndex > months[sortedMonths[i + 1]]
        ? months[sortedMonths[i + 1]] + 12
        : months[sortedMonths[i + 1]];

    if (nextIndex - index > 1) {
      throw new InconsecutiveMonthsListException();
    }
  }
};
