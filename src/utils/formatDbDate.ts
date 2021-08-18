/**
 * Return the date in the YYY-MM-DD format
 *
 * @param {string} date
 * @returns string
 */
export const formatDbDate = (date: string): string => {
  const stringifiedDate = JSON.stringify(date);
  return stringifiedDate.substring(1).split('T')[0];
};
