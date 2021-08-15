import { months } from 'src/utils/constants';

/**
 * Removes duplicate months entries and sorts the list
 *
 * @param {string[]} monthsList
 * @returns string[]
 */
export const getSortedDistinctMonths = (monthsList: string[]): string[] => {
  // get the current month index
  const currentMonthIndex = new Date().getMonth() + 1;

  // remove duplicate entries
  const distinctMonths = Array.from(new Set(monthsList));

  // if a past month is in the list consider it in the next year
  const sortedMonths = distinctMonths.sort((a, b) => {
    const aMonthIndex =
      currentMonthIndex > months[a] ? months[a] + 12 : months[a];
    const bMonthIndex =
      currentMonthIndex > months[b] ? months[b] + 12 : months[b];

    return aMonthIndex - bMonthIndex;
  });
  return sortedMonths;
};
