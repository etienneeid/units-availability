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
    intervalStartDate = now.toISOString().split('T')[0];
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

  return new Date(year, months[lastMonth], 0).toISOString().split('T')[0];
};
