import { adminApiClient, buildAdminRequestConfig } from './client';
import { AdminApiError, normalizeAdminApiError } from './errors';
export type ReservationTransition =
  | 'confirm'
  | 'prepare'
  | 'rent'
  | 'return'
  | 'cancel';
export type ReservationChange =
  | { action: ReservationTransition; reason?: string }
  | { action: 'notes'; notes: string };
export const reservationTargets: Record<ReservationTransition, string> = {
  confirm: 'confirmed',
  prepare: 'prepared',
  rent: 'rented',
  return: 'returned',
  cancel: 'cancelled',
};
export interface ReservationMutationReceipt {
  id: string;
  reservationNumber: string;
  status: string;
  paymentStatus: string;
  pendingExpired: boolean;
  expiresAt?: string;
  notes?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  updatedAt?: string;
}
function invalid(): never {
  throw new AdminApiError({
    code: 'ADMIN_RESERVATION_INVALID_RESPONSE',
    kind: 'unexpected',
    message: 'Unusable reservation mutation response.',
  });
}
const object = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));
const text = (value: unknown): value is string => typeof value === 'string';
const nonempty = (value: unknown): value is string =>
  text(value) && value.trim().length > 0;
export function parseReservationMutation(
  value: unknown,
  reservationId: string,
  change: ReservationChange
): ReservationMutationReceipt {
  if (!object(value) || !object(value.reservation)) return invalid();
  const item = value.reservation;
  if (
    item.id !== reservationId ||
    !nonempty(item.reservationNumber) ||
    !nonempty(item.status) ||
    !nonempty(item.paymentStatus) ||
    typeof item.pendingExpired !== 'boolean'
  )
    return invalid();
  if (
    change.action !== 'notes' &&
    item.status !== reservationTargets[change.action]
  )
    return invalid();
  for (const key of ['notes', 'cancellationReason'] as const)
    if (item[key] !== undefined && !text(item[key])) return invalid();
  for (const key of ['expiresAt', 'cancelledAt', 'updatedAt'] as const)
    if (
      item[key] !== undefined &&
      (!text(item[key]) || !Number.isFinite(Date.parse(item[key] as string)))
    )
      return invalid();
  if (change.action === 'notes' && (item.notes ?? '') !== change.notes.trim())
    return invalid();
  return {
    id: reservationId,
    reservationNumber: item.reservationNumber,
    status: item.status,
    paymentStatus: item.paymentStatus,
    pendingExpired: item.pendingExpired,
    ...(item.expiresAt === undefined
      ? {}
      : { expiresAt: item.expiresAt as string }),
    ...(item.notes === undefined ? {} : { notes: item.notes as string }),
    ...(item.cancelledAt === undefined
      ? {}
      : { cancelledAt: item.cancelledAt as string }),
    ...(item.cancellationReason === undefined
      ? {}
      : { cancellationReason: item.cancellationReason as string }),
    ...(item.updatedAt === undefined
      ? {}
      : { updatedAt: item.updatedAt as string }),
  };
}
export async function changeAdminReservation(input: {
  token: string;
  reservationId: string;
  change: ReservationChange;
  signal?: AbortSignal;
}): Promise<ReservationMutationReceipt> {
  const { change } = input;
  const value =
    change.action === 'notes'
      ? change.notes.trim()
      : change.action === 'cancel'
        ? (change.reason?.trim() ?? '')
        : undefined;
  if (
    (change.action === 'notes' && value!.length > 1500) ||
    (change.action === 'cancel' && (!value || value.length > 500))
  )
    throw new AdminApiError({
      code: 'ADMIN_RESERVATION_INVALID_CHANGE',
      kind: 'unexpected',
      message: 'Invalid reservation change.',
    });
  const path = `/admin/reservations/${encodeURIComponent(input.reservationId)}/${change.action}`;
  const body =
    change.action === 'notes'
      ? { notes: value }
      : change.action === 'cancel'
        ? { reason: value }
        : {};
  try {
    const config = buildAdminRequestConfig(input.token, input.signal);
    const response =
      change.action === 'notes'
        ? await adminApiClient.patch(path, body, config)
        : await adminApiClient.post(path, body, config);
    return parseReservationMutation(response.data, input.reservationId, change);
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}
