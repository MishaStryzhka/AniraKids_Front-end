import { adminRoutes } from '../navigation/adminRoutes';
import {
  buildReservationSearch,
  parseReservationSearch,
} from './reservationListQuery';
export function reservationSearchFromState(state: unknown): string {
  const value = (state as { reservationSearch?: unknown } | null)
    ?.reservationSearch;
  return typeof value === 'string' && value.trim().length <= 200
    ? value.trim()
    : '';
}
export type ReservationBackContext =
  | { kind: 'list'; search: string; q: string }
  | { kind: 'calendar' };
export function reservationBackContext(
  state: unknown
): ReservationBackContext | null {
  const value = (state as { reservationBack?: unknown } | null)
    ?.reservationBack;
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (record.kind === 'calendar') return { kind: 'calendar' };
  if (
    record.kind !== 'list' ||
    typeof record.search !== 'string' ||
    typeof record.q !== 'string' ||
    record.q.trim().length > 200
  )
    return null;
  return {
    kind: 'list',
    search: buildReservationSearch(
      parseReservationSearch(new URLSearchParams(record.search))
    ).toString(),
    q: record.q.trim(),
  };
}
export const reservationListBackLink = (
  context: ReservationBackContext | null
) => ({
  to:
    context?.kind === 'list'
      ? `${adminRoutes.reservations}${context.search ? '?' + context.search : ''}`
      : adminRoutes.reservations,
  state:
    context?.kind === 'list' ? { reservationSearch: context.q } : undefined,
});
