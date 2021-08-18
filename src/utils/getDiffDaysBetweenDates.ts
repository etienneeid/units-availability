/**
 * Returns the number of days between two dates
 *
 * @param {string} startDate
 * @param {string} endDate
 * @returns number
 */
export const getDiffDaysBetweenDates = (
  startDate: string,
  endDate: string,
): number => {
  const start = Number(new Date(startDate));
  const end = Number(new Date(endDate));

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};
