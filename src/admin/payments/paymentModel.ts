import {
  isFee,
  type PaymentMethod,
  type PaymentOperation,
  type PaymentType,
  type ReservationPayments,
} from '../api/reservationPayments';
export type PaymentDraft = {
  type: PaymentType;
  amount: string;
  method: PaymentMethod;
  reference: string;
  note: string;
};
export const emptyPaymentDraft = (): PaymentDraft => ({
  type: 'advance_received',
  amount: '',
  method: 'bank_transfer',
  reference: '',
  note: '',
});
export const paymentTypeLabels: Record<PaymentType, string> = {
  advance_received: 'Přijatá rezervační záloha',
  rental_received: 'Přijaté nájemné',
  deposit_received: 'Přijatá vratná kauce',
  rental_refunded: 'Vrácené nájemné / záloha',
  deposit_refunded: 'Vrácená kauce',
  cancellation_fee: 'Uplatněný storno poplatek',
  cancellation_fee_reversed: 'Zrušení storno poplatku',
};
export const methodLabel = (method: PaymentMethod) =>
  method === 'cash' ? 'Hotově' : 'Bankovním převodem';
export function paymentDraftErrors(draft: PaymentDraft, status: string) {
  const errors: Partial<Record<keyof PaymentDraft, string>> = {};
  if (!/^[1-9]\d*$/.test(draft.amount.trim()) || Number(draft.amount) > 1000000)
    errors.amount = 'Zadejte celé číslo od 1 do 1 000 000 Kč.';
  if (draft.reference.trim().length > 120)
    errors.reference = 'Reference může mít maximálně 120 znaků.';
  if (draft.note.trim().length > 500)
    errors.note = 'Poznámka může mít maximálně 500 znaků.';
  if (
    (isFee(draft.type) ||
      draft.type.endsWith('_refunded') ||
      (status === 'cancelled' && draft.type.endsWith('_received'))) &&
    draft.note.trim().length < 5
  )
    errors.note = 'Uveďte důvod v délce alespoň 5 znaků.';
  if (isFee(draft.type)) {
    if (status !== 'cancelled')
      errors.type = 'Storno poplatek lze posoudit pouze u zrušené rezervace.';
  }
  return errors;
}
export function paymentOperation(
  draft: PaymentDraft,
  payments: ReservationPayments
): PaymentOperation {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return {
    operationId: `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`,
    expectedRevision: payments.revision,
    type: draft.type,
    amount: Number(draft.amount.trim()),
    ...(!isFee(draft.type) ? { method: draft.method } : {}),
    ...(draft.reference.trim() ? { reference: draft.reference.trim() } : {}),
    ...(draft.note.trim() ? { note: draft.note.trim() } : {}),
  };
}
export type ReservationMutationLock = {
  current: 'reservation' | 'payments' | null;
};
