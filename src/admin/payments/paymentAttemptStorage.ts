import {
  isFee,
  isPaymentUuid,
  paymentTypes,
  type PaymentOperation,
} from '../api/reservationPayments';
const key = (adminId: string, reservationId: string) => {
  if (!adminId || !reservationId) throw new Error('Missing payment owner');
  return `anirakids:payment-attempt:v1:${encodeURIComponent(adminId)}:${encodeURIComponent(reservationId)}`;
};
function parse(value: unknown): PaymentOperation {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid payment attempt');
  const v = value as PaymentOperation;
  if (
    !isPaymentUuid(v.operationId) ||
    !Number.isSafeInteger(v.expectedRevision) ||
    v.expectedRevision < 0 ||
    !paymentTypes.includes(v.type) ||
    !Number.isSafeInteger(v.amount) ||
    v.amount < 1 ||
    v.amount > 1000000 ||
    (isFee(v.type)
      ? v.method !== undefined
      : !['cash', 'bank_transfer'].includes(v.method ?? '')) ||
    (v.reference !== undefined &&
      (typeof v.reference !== 'string' ||
        v.reference.length > 120 ||
        v.reference !== v.reference.trim())) ||
    (v.note !== undefined &&
      (typeof v.note !== 'string' ||
        v.note.length > 500 ||
        v.note !== v.note.trim()))
  )
    throw new Error('Invalid payment attempt');
  return {
    operationId: v.operationId,
    expectedRevision: v.expectedRevision,
    type: v.type,
    amount: v.amount,
    ...(v.method ? { method: v.method } : {}),
    ...(v.reference ? { reference: v.reference } : {}),
    ...(v.note ? { note: v.note } : {}),
  };
}
export function loadPaymentAttempt(
  adminId: string,
  reservationId: string
): PaymentOperation | null {
  const raw = sessionStorage.getItem(key(adminId, reservationId));
  if (raw === null) return null;
  if (raw.length > 4000) throw new Error('Invalid payment attempt');
  return parse(JSON.parse(raw));
}
export function savePaymentAttempt(
  adminId: string,
  reservationId: string,
  attempt: PaymentOperation | null
) {
  const name = key(adminId, reservationId);
  if (attempt === null) sessionStorage.removeItem(name);
  else sessionStorage.setItem(name, JSON.stringify(parse(attempt)));
}
