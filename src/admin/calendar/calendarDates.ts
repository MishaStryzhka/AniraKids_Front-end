/** Calendar dates are civil days. UTC is used only for calendar arithmetic,
 * never to reinterpret a server day as a local timestamp. */
const DAY_MS = 86400000;
export type DateOnly = string;
export type CalendarMonth = string;
function utcDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}
export function isDateOnly(value: unknown): value is DateOnly {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = utcDate(year, month, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
}
function toUtcDate(value: DateOnly): Date {
  if (!isDateOnly(value)) throw new Error('Invalid calendar date');
  const [year, month, day] = value.split('-').map(Number);
  return utcDate(year, month, day);
}
function fromUtcDate(date: Date): DateOnly {
  const year = date.getUTCFullYear();
  if (year < 1 || year > 9999) throw new Error('Calendar date outside supported range');
  return `${String(year).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}
export function pragueToday(now = new Date()): DateOnly {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Prague', year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(now);
  const get = (kind: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === kind)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function addCalendarDays(value: DateOnly, days: number): DateOnly {
  if (!Number.isInteger(days)) throw new Error('Invalid calendar day offset');
  const date = toUtcDate(value); date.setUTCDate(date.getUTCDate() + days);
  return fromUtcDate(date);
}
export function shiftCalendarMonth(month: CalendarMonth, offset: number): CalendarMonth {
  if (!/^\d{4}-\d{2}$/.test(month) || !Number.isInteger(offset)) throw new Error('Invalid calendar month');
  const date = toUtcDate(`${month}-01`); date.setUTCMonth(date.getUTCMonth() + offset);
  return fromUtcDate(date).slice(0, 7);
}
export function calendarMonthRange(month: CalendarMonth): {from: DateOnly; to: DateOnly} {
  const from = `${month}-01`; const date = toUtcDate(from);
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  return {from, to: fromUtcDate(date)};
}
export function isCalendarRange(from: unknown, to: unknown): boolean {
  return isDateOnly(from) && isDateOnly(to) && from <= to &&
    (toUtcDate(to).getTime() - toUtcDate(from).getTime()) / DAY_MS < 366;
}
export function monthCalendarDays(month: CalendarMonth): DateOnly[] {
  const {from, to} = calendarMonthRange(month);
  const result: DateOnly[] = [];
  for (let value = from; value <= to; value = addCalendarDays(value, 1)) {
    result.push(value);
    if (value === to) break;
  }
  return result;
}
export function mondayWeekday(value: DateOnly): number {return (toUtcDate(value).getUTCDay() + 6) % 7;}
/** Complete Monday–Sunday rows; adjacent-month dates are presentation only. */
export function monthCalendarGridDays(month: CalendarMonth): Array<DateOnly | null> {
  const days = monthCalendarDays(month);
  const leading = mondayWeekday(days[0]);
  const length = Math.ceil((leading + days.length) / 7) * 7;
  return Array.from({length}, (_, index) => {
    const offset = index - leading;
    // The date picker intentionally stops at years 0001 and 9999.
    if ((month === '0001-01' && offset < 0) || (month === '9999-12' && offset >= days.length)) return null;
    return addCalendarDays(days[0], offset);
  });
}
export function formatCalendarDay(value: DateOnly, weekday = false): string {
  return new Intl.DateTimeFormat('cs-CZ', {timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric', ...(weekday ? {weekday: 'long' as const} : {})}).format(toUtcDate(value));
}
export function formatCalendarMonth(month: CalendarMonth): string {
  return new Intl.DateTimeFormat('cs-CZ', {timeZone: 'UTC', month: 'long', year: 'numeric'}).format(toUtcDate(`${month}-01`));
}
