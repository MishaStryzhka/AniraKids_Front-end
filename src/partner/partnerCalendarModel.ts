export interface CalendarRental {
  startDate: string;
  endDate: string;
  status: string;
}
export interface CalendarFitting {
  date: string;
  status: string;
}
export function rentalsOnDay<T extends CalendarRental>(
  items: T[],
  day: string
): T[] {
  return items.filter(
    item =>
      ['pending', 'confirmed', 'prepared', 'rented', 'returned'].includes(
        item.status
      ) &&
      item.startDate.slice(0, 10) <= day &&
      item.endDate.slice(0, 10) >= day
  );
}
export function fittingsOnDay<T extends CalendarFitting>(
  items: T[],
  day: string
): T[] {
  return items.filter(
    item =>
      ['pending', 'review', 'confirmed', 'completed'].includes(item.status) &&
      item.date === day
  );
}
