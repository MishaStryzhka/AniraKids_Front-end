import {
  reservationStatuses,
  reservationPaymentStatuses,
  reservationRentalModes,
  type ReservationListQuery,
} from '../api/reservations';
import { isDateOnly } from '../calendar/calendarDates';
export type ReservationUrlState = Omit<ReservationListQuery, 'q'>;
function option<T extends string>(
  value: string | null,
  allowed: readonly T[]
): T | undefined {
  return value !== null && allowed.includes(value as T)
    ? (value as T)
    : undefined;
}
export function parseReservationSearch(
  params: URLSearchParams
): ReservationUrlState {
  const raw = params.get('page'),
    page =
      raw &&
      /^\d+$/.test(raw) &&
      Number.isSafeInteger(Number(raw)) &&
      Number(raw) > 0
        ? Number(raw)
        : 1;
  const from = params.get('from'),
    to = params.get('to');
  return {
    page,
    status: option(params.get('status'), reservationStatuses),
    paymentStatus: option(
      params.get('paymentStatus'),
      reservationPaymentStatuses
    ),
    rentalMode: option(params.get('rentalMode'), reservationRentalModes),
    ...(isDateOnly(from) ? { from } : {}),
    ...(isDateOnly(to) ? { to } : {}),
  };
}
export function buildReservationSearch(
  state: ReservationUrlState
): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of [
    'status',
    'paymentStatus',
    'rentalMode',
    'from',
    'to',
  ] as const)
    if (state[key]) params.set(key, state[key]!);
  if (state.page > 1) params.set('page', String(state.page));
  return params;
}
export function validateReservationDates(
  from: string,
  to: string
): string | null {
  if ((from && !isDateOnly(from)) || (to && !isDateOnly(to)))
    return 'Zadejte platné datum.';
  if (from && to && from > to)
    return 'Datum od nesmí být pozdější než datum do.';
  return null;
}
