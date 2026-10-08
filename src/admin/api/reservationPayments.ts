import { adminApiClient, buildAdminRequestConfig } from './client';
import { AdminApiError, normalizeAdminApiError } from './errors';
export const paymentTypes = [
  'advance_received',
  'rental_received',
  'deposit_received',
  'rental_refunded',
  'deposit_refunded',
  'cancellation_fee',
  'cancellation_fee_reversed',
] as const;
export type PaymentType = (typeof paymentTypes)[number];
export type PaymentMethod = 'bank_transfer' | 'cash';
export type PaymentOperation = {
  operationId: string;
  expectedRevision: number;
  type: PaymentType;
  amount: number;
  method?: PaymentMethod;
  reference?: string;
  note?: string;
};
export type PaymentEntry = Omit<PaymentOperation, 'expectedRevision'> & {
  recordedAt: string;
  recordedBy: string;
};
export type ReservationPayments = {
  reservationId: string;
  revision: number;
  currency: 'CZK';
  legacyUnreconciled: boolean;
  advanceRequired: number;
  rentalTotal: number;
  depositRequired: number;
  rentalReceived: number;
  rentalRefunded: number;
  rentalNet: number;
  depositReceived: number;
  depositRefunded: number;
  depositHeld: number;
  cancellationFee: number;
  rentalBalance: number;
  advanceBalance: number;
  refundableRental: number;
  entries: PaymentEntry[];
};
const object = (v: unknown): v is Record<string, unknown> =>
  Boolean(v && typeof v === 'object' && !Array.isArray(v));
const text = (v: unknown, max = 1000): v is string =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const integer = (v: unknown): v is number =>
  typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
export const isPaymentUuid = (v: unknown): v is string =>
  typeof v === 'string' &&
  /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/.test(v);
export const isFee = (type: PaymentType) =>
  type === 'cancellation_fee' || type === 'cancellation_fee_reversed';
const invalid = (): never => {
  throw new AdminApiError({
    code: 'ADMIN_PAYMENT_INVALID_RESPONSE',
    message: 'Unusable payment response.',
    kind: 'unexpected',
  });
};
export function parsePayments(
  v: unknown,
  reservationId: string
): ReservationPayments {
  if (!object(v) || !object(v.payments)) return invalid();
  const p = v.payments;
  const amounts = [
    'advanceRequired',
    'rentalTotal',
    'depositRequired',
    'rentalReceived',
    'rentalRefunded',
    'rentalNet',
    'depositReceived',
    'depositRefunded',
    'depositHeld',
    'cancellationFee',
    'rentalBalance',
    'advanceBalance',
    'refundableRental',
  ] as const;
  if (
    p.reservationId !== reservationId ||
    p.currency !== 'CZK' ||
    !integer(p.revision) ||
    typeof p.legacyUnreconciled !== 'boolean' ||
    !amounts.every(key => integer(p[key])) ||
    !Array.isArray(p.entries) ||
    p.entries.length > 500
  )
    return invalid();
  const entries = p.entries.map(e => {
    if (
      !object(e) ||
      !isPaymentUuid(e.operationId) ||
      !paymentTypes.includes(e.type as PaymentType) ||
      !integer(e.amount) ||
      e.amount < 1 ||
      e.amount > 1000000 ||
      !text(e.recordedAt) ||
      !/^\d{4}-\d{2}-\d{2}T/.test(e.recordedAt) ||
      !Number.isFinite(Date.parse(e.recordedAt)) ||
      !text(e.recordedBy) ||
      (e.reference !== undefined &&
        (typeof e.reference !== 'string' || e.reference.length > 120)) ||
      (e.note !== undefined &&
        (typeof e.note !== 'string' || e.note.length > 500))
    )
      return invalid();
    const type = e.type as PaymentType;
    if (
      isFee(type)
        ? e.method !== undefined
        : !['bank_transfer', 'cash'].includes(e.method as string)
    )
      return invalid();
    return {
      operationId: e.operationId,
      type,
      amount: e.amount,
      ...(e.method === undefined ? {} : { method: e.method as PaymentMethod }),
      ...(e.reference === undefined
        ? {}
        : { reference: e.reference as string }),
      ...(e.note === undefined ? {} : { note: e.note as string }),
      recordedAt: e.recordedAt,
      recordedBy: e.recordedBy,
    };
  });
  if (new Set(entries.map(e => e.operationId)).size !== entries.length)
    return invalid();
  return {
    reservationId,
    revision: p.revision,
    currency: 'CZK',
    legacyUnreconciled: p.legacyUnreconciled,
    ...Object.fromEntries(amounts.map(key => [key, p[key]])),
    entries,
  } as ReservationPayments;
}
export function operationMatches(
  entry: PaymentEntry,
  operation: PaymentOperation
) {
  return (
    entry.operationId === operation.operationId &&
    entry.type === operation.type &&
    entry.amount === operation.amount &&
    entry.method === operation.method &&
    (entry.reference ?? '') === (operation.reference ?? '') &&
    (entry.note ?? '') === (operation.note ?? '')
  );
}
export async function getReservationPayments(input: {
  token: string;
  reservationId: string;
  signal?: AbortSignal;
}) {
  try {
    const response = await adminApiClient.get(
      `/admin/reservations/${encodeURIComponent(input.reservationId)}/payments`,
      buildAdminRequestConfig(input.token, input.signal)
    );
    return parsePayments(response.data, input.reservationId);
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}
export async function appendReservationPayment(input: {
  token: string;
  reservationId: string;
  operation: PaymentOperation;
  signal?: AbortSignal;
}) {
  try {
    const response = await adminApiClient.post(
      `/admin/reservations/${encodeURIComponent(input.reservationId)}/payments`,
      input.operation,
      buildAdminRequestConfig(input.token, input.signal)
    );
    if (response.status !== 200) return invalid();
    const payments = parsePayments(response.data, input.reservationId);
    const entry = payments.entries.find(
      e => e.operationId === input.operation.operationId
    );
    if (!entry || !operationMatches(entry, input.operation)) return invalid();
    return payments;
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}
