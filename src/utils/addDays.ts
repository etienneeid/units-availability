/**
 * Returns the given date incremented by the given number of days
 *
 * @param {string} date
 * @param {number} days
 * @returns string
 */
export const addDays = (date: string, days: number): string => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);

  const newDateSplit = newDate.toLocaleDateString().split('/');

  return `${newDateSplit[2]}-${newDateSplit[0]}-${newDateSplit[1]}`;
};
