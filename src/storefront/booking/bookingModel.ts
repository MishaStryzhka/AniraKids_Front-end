import {parseFulfillment, type Fulfillment} from './fulfillment';
import {validFittingDiscount} from '../../fittings/fittingDiscountModel';
import { isDateOnly, pragueToday } from '../../admin/calendar/calendarDates';
import {getReferralToken} from '../../partner/referral';
import {
  isMode,
  object,
  objectId,
  parseReceipt,
  parseProduct,
  type Customer,
  type PublicProduct,
  type Receipt,
  type ReservationBody,
  type Selection,
} from '../api/publicApi';
export type ContactDraft = Customer & { notes: string };
export type DraftItem = { product: PublicProduct; variantId: string };
export type BookingDraft = Fulfillment & {
  additionalItems?: DraftItem[];
  product: PublicProduct;
  selection: Selection;
  contact: ContactDraft;
};
export const draftItems = (draft: BookingDraft): DraftItem[] => [
  { product: draft.product, variantId: draft.selection.variantId }, ...(draft.additionalItems ?? []),
];
export const draftSelections = (draft: BookingDraft): Selection[] =>
  draftItems(draft).map(item => ({ ...draft.selection, productId: item.product.id, variantId: item.variantId }));
export function draftSelectionsValid(draft: BookingDraft) {
  return draftSelections(draft).every((selection, index) =>
    Object.keys(selectionErrors(selection)).length === 0 &&
    Boolean(draftItems(draft)[index].product.variants.find(v => v.id === selection.variantId)?.pricing[selection.rentalMode]));
}
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
    ...(selection.rentalMode === 'external' ? {deliveryTariff:'2026-10' as const,fulfillmentMethod: draft.fulfillmentMethod ?? 'pickup', ...(draft.fulfillmentMethod === 'balikovna' ? {balikovnaPoint:draft.balikovnaPoint} : draft.fulfillmentMethod === 'balikovna_address' ? {deliveryAddress:draft.deliveryAddress} : {})} : {}),
    ...(getReferralToken()?{referralToken:getReferralToken()}:{}),
    ...(draft.additionalItems?.length ? { items: draftItems(draft).map(item => ({
      productId: item.product.id, variantId: item.variantId,
    })) } : {}),
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
    (v.fittingDiscount !== undefined && !validFittingDiscount(v.fittingDiscount)) ||
    (v.notes !== undefined && typeof v.notes !== 'string') ||
    (v.referralToken !== undefined && (typeof v.referralToken !== 'string' || v.referralToken.length>1200))
  )
    throw new Error('Invalid attempt');
  let items: ReservationBody['items'];
  if (v.items !== undefined) {
    if (!Array.isArray(v.items) || !v.items.length || v.items.length > 20 ||
        v.items.some(item => !object(item) || !objectId(item.productId) || !objectId(item.variantId)))
      throw new Error('Invalid attempt items');
    items = v.items.map(item => ({ productId: item.productId as string, variantId: item.variantId as string }));
    if (items[0].productId !== v.productId || items[0].variantId !== v.variantId)
      throw new Error('Invalid attempt primary item');
  }
  const customer = v.customer as Customer,
    contact = { ...customer, notes: (v.notes as string | undefined) ?? '' };
  if (Object.keys(contactErrors(contact)).length)
    throw new Error('Invalid attempt');
  return {
    ...parseFulfillment(v),
    ...(v.deliveryTariff==='2026-10'?{deliveryTariff:'2026-10' as const}:{}),
    ...(items ? { items } : {}),
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
    ...(v.fittingDiscount === undefined ? {} : {fittingDiscount:v.fittingDiscount as import('../../fittings/FittingDiscount').FittingDiscountSelection}),
    ...(v.referralToken === undefined ? {} : { referralToken: v.referralToken as string }),
  };
}
export const SESSION_KEY = 'anirakids.booking.v1';
export const MAX_ENVELOPE_LENGTH = 24000;
export type Attempt = {
  version: 1;
  kind: 'attempt';
  accountId?: string;
  key: string;
  body: ReservationBody;
};
export type StoredBooking =
  | Attempt
  | { version: 1; kind: 'receipt'; receipt: Receipt; accountId?: string };
export const isUuid = (v: unknown): v is string =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
    v
  );
export function parseStored(raw: string): StoredBooking {
  if (raw.length > MAX_ENVELOPE_LENGTH) throw new Error('Invalid storage');
  const v: unknown = JSON.parse(raw);
  if (!object(v) || v.version !== 1) throw new Error('Invalid storage');
  if (v.accountId !== undefined && !objectId(v.accountId)) throw new Error('Invalid booking owner');
  const owner = v.accountId === undefined ? {} : { accountId: v.accountId as string };
  if (v.kind === 'attempt' && isUuid(v.key))
    return { version: 1, kind: 'attempt', ...owner, key: v.key, body: parseBody(v.body) };
  if (v.kind === 'receipt')
    return {
      version: 1,
      kind: 'receipt',
      ...owner,
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
export function newAttempt(body: ReservationBody, accountId?: string): Attempt {
  if (accountId !== undefined && !objectId(accountId)) throw new Error('Invalid booking owner');
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  const key = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  return { version: 1, kind: 'attempt', key, body: parseBody(body), ...(accountId ? { accountId } : {}) };
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

export const DRAFT_SESSION_KEY = 'anirakids.draft.v1';
// Save garment selections only. Contacts are never copied into this draft cache.
export function persistDraft(draft: BookingDraft | null) {
  if (!draft) {
    sessionStorage.removeItem(DRAFT_SESSION_KEY);
    if (sessionStorage.getItem(DRAFT_SESSION_KEY) !== null) throw new Error('Draft storage unavailable');
    return;
  }
  const raw = JSON.stringify({ version: 1, selection: draft.selection,
    ...(draft.selection.rentalMode === 'external' ? {fulfillmentMethod:draft.fulfillmentMethod,balikovnaPoint:draft.balikovnaPoint,deliveryAddress:draft.deliveryAddress} : {}),
    items: draftItems(draft).map(item => ({ product: item.product, variantId: item.variantId })) });
  if (raw.length > 500000) throw new Error('Draft too large');
  sessionStorage.setItem(DRAFT_SESSION_KEY, raw);
  if (sessionStorage.getItem(DRAFT_SESSION_KEY) !== raw) throw new Error('Draft storage unavailable');
}
export function loadDraft(): BookingDraft | null {
  const raw = sessionStorage.getItem(DRAFT_SESSION_KEY);
  if (raw === null) return null;
  if (raw.length > 500000) throw new Error('Invalid draft');
  const value: unknown = JSON.parse(raw);
  if (!object(value) || value.version !== 1 || !Array.isArray(value.items) ||
      !value.items.length || value.items.length > 20 || !object(value.selection))
    throw new Error('Invalid draft');
  const items = value.items.map((item): DraftItem => {
    if (!object(item) || (item.variantId !== '' && !objectId(item.variantId))) throw new Error('Invalid draft item');
    return { product: parseProduct({ product: item.product }), variantId: item.variantId as string };
  });
  const selection = value.selection;
  if (new Set(items.map(item => item.product.id)).size !== items.length ||
      !isMode(selection.rentalMode) ||
      (selection.startDate !== '' && !isDateOnly(selection.startDate)) ||
      (selection.endDate !== '' && !isDateOnly(selection.endDate))) throw new Error('Invalid draft selection');
  const fulfillment = value.fulfillmentMethod === 'balikovna_address' ? {fulfillmentMethod:'balikovna_address' as const,deliveryAddress:typeof value.deliveryAddress==='object' && value.deliveryAddress ? value.deliveryAddress as import('./fulfillment').DeliveryAddress : undefined} : value.fulfillmentMethod === 'balikovna' && value.balikovnaPoint === undefined ? {fulfillmentMethod:'balikovna' as const} : parseFulfillment({...value,rentalMode:selection.rentalMode});
  return { ...fulfillment, product: items[0].product, additionalItems: items.slice(1), contact: emptyContact(),
    selection: { productId: items[0].product.id, variantId: items[0].variantId,
      rentalMode: selection.rentalMode, startDate: selection.startDate as string, endDate: selection.endDate as string } };
}
