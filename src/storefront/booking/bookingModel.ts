import { isDateOnly, pragueToday } from '../../admin/calendar/calendarDates';
import {
  isMode,
  object,
  objectId,
  parseReceipt,
  type Customer,
  type PublicProduct,
  type Receipt,
  type ReservationBody,
  type Selection,
} from '../api/publicApi';
export type ContactDraft = Customer & { notes: string };
export type BookingDraft = {
  product: PublicProduct;
  selection: Selection;
  contact: ContactDraft;
};
export const emptyContact = (): ContactDraft => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',
});
export const initialDraft = (product: PublicProduct): BookingDraft => ({
  product,
  selection: {
    productId: product.id,
    variantId: '',
    rentalMode: 'studio',
    startDate: '',
    endDate: '',
  },
  contact: emptyContact(),
});
export function selectionErrors(v: Selection, today = pragueToday()) {
  const errors: Partial<Record<keyof Selection, string>> = {};
  if (!objectId(v.variantId)) errors.variantId = 'Vyberte velikost.';
  if (!isMode(v.rentalMode)) errors.rentalMode = 'Vyberte způsob pronájmu.';
  if (!isDateOnly(v.startDate))
    errors.startDate = 'Zadejte platné datum začátku.';
  else if (v.startDate < today)
    errors.startDate = 'Začátek nesmí být v minulosti.';
  if (!isDateOnly(v.endDate)) errors.endDate = 'Zadejte platné datum konce.';
  else if (isDateOnly(v.startDate) && v.endDate < v.startDate)
    errors.endDate = 'Konec nesmí být dříve než začátek.';
  return errors;
}
export function contactErrors(v: ContactDraft) {
  const errors: Partial<Record<keyof ContactDraft, string>> = {};
  for (const key of ['firstName', 'lastName'] as const)
    if (!v[key].trim() || v[key].trim().length > 100)
      errors[key] = 'Zadejte údaj v délce 1 až 100 znaků.';
  if (
    v.email.trim().length > 254 ||
    !/^\S+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())
  )
    errors.email = 'Zadejte platný e-mail.';
  if (v.phone.trim().length < 5 || v.phone.trim().length > 32)
    errors.phone = 'Zadejte telefon v délce 5 až 32 znaků.';
  if (v.notes.trim().length > 1500)
    errors.notes = 'Poznámka může mít maximálně 1500 znaků.';
  return errors;
}
export function reservationBody(draft: BookingDraft): ReservationBody {
  const { selection, contact } = draft;
  return {
    ...selection,
    customer: {
      firstName: contact.firstName.trim(),
      lastName: contact.lastName.trim(),
      email: contact.email.trim().toLowerCase(),
      phone: contact.phone.trim(),
    },
    ...(contact.notes.trim() ? { notes: contact.notes.trim() } : {}),
  };
}
export function parseBody(v: unknown): ReservationBody {
  if (
    !object(v) ||
    !objectId(v.productId) ||
    !objectId(v.variantId) ||
    !isMode(v.rentalMode) ||
    !isDateOnly(v.startDate) ||
    !isDateOnly(v.endDate) ||
    v.startDate > v.endDate ||
    !object(v.customer) ||
    !['firstName', 'lastName', 'email', 'phone'].every(
      key => typeof (v.customer as Record<string, unknown>)[key] === 'string'
    ) ||
    (v.notes !== undefined && typeof v.notes !== 'string')
  )
    throw new Error('Invalid attempt');
  const customer = v.customer as Customer,
    contact = { ...customer, notes: (v.notes as string | undefined) ?? '' };
  if (Object.keys(contactErrors(contact)).length)
    throw new Error('Invalid attempt');
  return {
    productId: v.productId,
    variantId: v.variantId,
    rentalMode: v.rentalMode,
    startDate: v.startDate,
    endDate: v.endDate,
    customer: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
    },
    ...(v.notes === undefined ? {} : { notes: v.notes as string }),
  };
}
export const SESSION_KEY = 'anirakids.booking.v1';
export const MAX_ENVELOPE_LENGTH = 24000;
export type Attempt = {
  version: 1;
  kind: 'attempt';
  key: string;
  body: ReservationBody;
};
export type StoredBooking =
  | Attempt
  | { version: 1; kind: 'receipt'; receipt: Receipt };
export const isUuid = (v: unknown): v is string =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    v
  );
export function parseStored(raw: string): StoredBooking {
  if (raw.length > MAX_ENVELOPE_LENGTH) throw new Error('Invalid storage');
  const v: unknown = JSON.parse(raw);
  if (!object(v) || v.version !== 1) throw new Error('Invalid storage');
  if (v.kind === 'attempt' && isUuid(v.key))
    return { version: 1, kind: 'attempt', key: v.key, body: parseBody(v.body) };
  if (v.kind === 'receipt')
    return {
      version: 1,
      kind: 'receipt',
      receipt: parseReceipt({ reservation: v.receipt, guestAccessToken: object(v.receipt) ? v.receipt.guestAccessToken : undefined }),
    };
  throw new Error('Invalid storage');
}
export function loadBooking(): StoredBooking | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw === null ? null : parseStored(raw);
}
export function persistBooking(value: StoredBooking | null) {
  if (value === null) {
    sessionStorage.removeItem(SESSION_KEY);
    if (sessionStorage.getItem(SESSION_KEY) !== null)
      throw new Error('Storage unavailable');
    return;
  }
  const raw = JSON.stringify(value);
  parseStored(raw);
  sessionStorage.setItem(SESSION_KEY, raw);
  if (sessionStorage.getItem(SESSION_KEY) !== raw)
    throw new Error('Storage unavailable');
}
export function newAttempt(body: ReservationBody): Attempt {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  const key = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  return { version: 1, kind: 'attempt', key, body: parseBody(body) };
}
export const modeLabel = (mode: string) =>
  mode === 'studio'
    ? 'Studio'
    : mode === 'external'
      ? 'Mimo studio'
      : 'Neznámý režim';
export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'Čeká na potvrzení',
    confirmed: 'Potvrzená',
    prepared: 'Připravená',
    rented: 'Pronajatá',
    returned: 'Vrácená',
    cancelled: 'Zrušená',
  };
  return Object.prototype.hasOwnProperty.call(labels, status)
    ? labels[status]
    : 'Neznámý stav';
}
export const formatMoney = (value: number) =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(value);
