import type {CalendarRentalMode, CalendarReservation} from '../api/reservationCalendar';
import type {StatusBadgeTone} from '../../design-system/components/StatusBadge';
import type {DateOnly} from './calendarDates';
export const calendarStatusPresentation: Record<string, {label: string; tone: StatusBadgeTone}> = {
  pending: {label: 'Čeká na potvrzení', tone: 'warning'},
  confirmed: {label: 'Potvrzená', tone: 'info'},
  prepared: {label: 'Připravená', tone: 'info'},
  rented: {label: 'Vypůjčená', tone: 'success'},
  returned: {label: 'Vrácená', tone: 'neutral'},
};
export function reservationStatusPresentation(status: string) {
  return Object.prototype.hasOwnProperty.call(calendarStatusPresentation, status)
    ? calendarStatusPresentation[status] : {label: 'Neznámý stav', tone: 'neutral' as StatusBadgeTone};
}
export const rentalModeLabels: Record<CalendarRentalMode, string> = {studio: 'Studio', external: 'Mimo studio'};
export function reservationsForDay(items: CalendarReservation[], day: DateOnly): CalendarReservation[] {
  return items.filter(item => item.startDate <= day && day <= item.occupiedThrough)
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.reservationNumber.localeCompare(b.reservationNumber, 'cs') || a.id.localeCompare(b.id));
}
export function reservationDayCounts(items: CalendarReservation[], day: DateOnly) {
  let rental = 0, cleaning = 0;
  for (const item of items) {
    if (item.startDate > day || day > item.occupiedThrough) continue;
    if (day <= item.endDate) rental++; else cleaning++;
  }
  return {rental, cleaning};
}
export function formatPragueLoadedAt(value: Date): string {
  return new Intl.DateTimeFormat('cs-CZ', {timeZone: 'Europe/Prague', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(value);
}
