import { getDateAddDays } from './getDateAddDays';

/**
 * Returns the date of the next closest weekend for the given date
 *
 * @param {string} date
 * @param {number} weekendStartDayIndex
 * @returns string
 */
export const jumpToNextWeekend = (
  date: string,
  weekendStartDayIndex: number,
): string => {
  let finalDate = date;
  if (weekendStartDayIndex) {
    const jsDate = new Date(date);

    // make sunday's index equal to 7
    const dateDayIndex = jsDate.getDay() || 7;

    let diffDays = weekendStartDayIndex - dateDayIndex;

    if (diffDays < 0) {
      diffDays = 7 + diffDays;
    }

    finalDate = getDateAddDays(date, diffDays);
  }
  return finalDate;
};
