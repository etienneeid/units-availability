import { months } from 'src/utils/constants';

/**
 * Returns a start date for the flexibility interval
 *
 * @param {string} firstMonth
 * @returns string
 */
export const getIntervalStartDate = (firstMonth: string): string => {
  // get current date
  const now = new Date();
  // get the current month index
  const currentMonthIndex = now.getMonth() + 1;

  let intervalStartDate = '';
  const intervalStartYear = now.getFullYear();

  if (currentMonthIndex == months[firstMonth]) {
    const nowSplit = now.toLocaleDateString().split('/');
    intervalStartDate = `${nowSplit[2]}-${nowSplit[0]}-${nowSplit[1]}`;
  } else if (currentMonthIndex > months[firstMonth]) {
    intervalStartDate = `${intervalStartYear + 1}-${months[firstMonth]}-01`;
  } else {
    intervalStartDate = `${intervalStartYear}-${months[firstMonth]}-01`;
  }

  return intervalStartDate;
};

/**
 * Returns an end date for the flexibility interval
 *
 * @param {string} lastMonth
 * @returns string
 */
export const getIntervalEndDate = (lastMonth: string): string => {
  // get current date
  const now = new Date();
  // get the current month index
  const currentMonthIndex = now.getMonth() + 1;

  let year = now.getFullYear();
  if (currentMonthIndex > months[lastMonth]) {
    year = year + 1;
  }

  const endDateSplit = new Date(year, months[lastMonth], 0)
    .toLocaleDateString()
    .split('/');

  return `${endDateSplit[2]}-${endDateSplit[0]}-${endDateSplit[1]}`;
};
