import {parseFulfillment, type Fulfillment} from '../booking/fulfillment';
import { PublicApiError, object, string, money } from './publicValidation';
import {
  parseBookingPolicy,
  parseReceiptPayment,
  type ReceiptPayment,
} from './bookingPolicy';
import { isDateOnly, monthCalendarDays } from '../../admin/calendar/calendarDates';
export { PublicApiError, object, string, money } from './publicValidation';
export type RentalMode = 'studio' | 'external';
export type Pricing = {
  rentalPrice: number;
  deposit: number;
  totalDue: number;
};
export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  category?: string;
  gender?: string;
  color?: string;
  rentalPriceFrom?: number;
  photos: Array<{ url: string; alt?: string }>;
};
export type PublicVariant = {
  id: string;
  size: string;
  pricing: Record<RentalMode, Pricing | null>;
};
export type PublicProduct = ProductCard & {
  description?: string;
  seo?: { title: string; description: string; noIndex: boolean };
  variants: PublicVariant[];
};
export type Selection = {
  productId: string;
  variantId: string;
  rentalMode: RentalMode;
  startDate: string;
  endDate: string;
};
export type Availability = Selection & {
  additionalDressDiscount?: number;
  available: boolean;
  checkedAt: string;
  pricing: Pricing;
};
export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};
export type ReservationSelection = Pick<Selection, 'productId' | 'variantId'>;
export type BookingQuote = Availability & { items?: Availability[] };
export type ReservationBody = Selection & Fulfillment & {
  fittingDiscount?: import('../../fittings/FittingDiscount').FittingDiscountSelection;
  referralToken?: string;
  items?: ReservationSelection[];
  customer: Customer;
  notes?: string;
};
export type Receipt = Fulfillment & {
  fittingDiscount?: {number:string;amount:number};
  guestAccessToken?: string;
  payment?: ReceiptPayment | null;
  reservationNumber: string;
  status: string;
  rentalMode: RentalMode;
  startDate: string;
  endDate: string;
  expiresAt: string | null;
  items?: ReservationItem[];
  item: ReservationItem;
  subtotal: number;
  deposit: number;
  totalDue: number;
  paymentStatus: string;
};
export type ReservationItem = {
    productId: string;
    variantId: string;
    productName: string;
    size: string;
    rentalPrice: number;
    deposit: number;
};
export const receiptItems = (receipt: Receipt): ReservationItem[] => receipt.items ?? [receipt.item];
export const objectId = (v: unknown): v is string =>
  typeof v === 'string' && /^[a-f\d]{24}$/.test(v);
const instant = (v: unknown): v is string =>
  typeof v === 'string' &&
  /^\d{4}-\d{2}-\d{2}T/.test(v) &&
  Number.isFinite(Date.parse(v));
const invalid = (): never => {
  throw new PublicApiError('INVALID_RESPONSE');
};
export const isMode = (v: unknown): v is RentalMode =>
  v === 'studio' || v === 'external';
export function parsePricing(v: unknown): Pricing {
  if (
    !object(v) ||
    !money(v.rentalPrice) ||
    !money(v.deposit) ||
    !money(v.totalDue) ||
    v.totalDue !== v.rentalPrice + v.deposit
  )
    return invalid();
  return {
    rentalPrice: v.rentalPrice,
    deposit: v.deposit,
    totalDue: v.totalDue,
  };
}
function parseCard(v: unknown): ProductCard {
  if (
    !object(v) ||
    !objectId(v.id) ||
    !string(v.slug, 160) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug) ||
    !string(v.name) ||
    !Array.isArray(v.photos) ||
    v.photos.length > 100 ||
    (v.category !== undefined && !string(v.category, 100)) ||
    (v.gender !== undefined && !string(v.gender, 100)) ||
    (v.color !== undefined && !string(v.color)) ||
    (v.rentalPriceFrom !== undefined && !money(v.rentalPriceFrom))
  )
    return invalid();
  const photos = v.photos.map(p => {
    if (
      !object(p) ||
      !string(p.url, 4000) ||
      !/^https?:\/\//i.test(p.url) ||
      (p.alt !== undefined && typeof p.alt !== 'string')
    )
      return invalid();
    return {
      url: p.url,
      ...(p.alt === undefined ? {} : { alt: p.alt as string }),
    };
  });
  return {
    ...(v.rentalPriceFrom === undefined ? {} : { rentalPriceFrom: v.rentalPriceFrom as number }),
    id: v.id,
    slug: v.slug,
    name: v.name,
    photos,
    ...(v.category === undefined ? {} : { category: v.category as string }),
    ...(v.gender === undefined ? {} : { gender: v.gender as string }),
    ...(v.color === undefined ? {} : { color: v.color as string }),
  };
}
export type CatalogueQuery = {
  ids?: string;
  category?: 'dress' | 'suit' | 'accessory' | 'other' | 'set';
  gender?: 'girls' | 'boys' | 'women' | 'men' | 'unisex' | 'children';
  color?: string;
  size?: string;
  familyLook?: 'true';
  rentalMode?: RentalMode;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort: 'name' | 'newest' | 'priceAsc' | 'priceDesc';
  page: number;
  limit: number;
};
export type Catalogue = {
  items: ProductCard[];
  facets?: { colors: string[]; sizes: string[] };
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
export function parseCatalogue(v: unknown, query: CatalogueQuery): Catalogue {
  if (
    !object(v) ||
    !Array.isArray(v.items) ||
    v.page !== query.page ||
    v.limit !== query.limit ||
    !money(v.total) ||
    !money(v.totalPages) ||
    v.totalPages !== Math.ceil(v.total / query.limit) ||
    v.items.length > query.limit
  )
    return invalid();
  let facets: Catalogue['facets'];
  if (v.facets !== undefined) {
    if (!object(v.facets)) return invalid();
    const values = (value: unknown): string[] => {
      if (!Array.isArray(value) || value.length > 10000 || !value.every(item => string(item, 100))) return invalid();
      return value as string[];
    };
    facets = { colors: values(v.facets.colors), sizes: values(v.facets.sizes) };
  }
  const items = v.items.map(parseCard);
  if (new Set(items.map(p => p.id)).size !== items.length) return invalid();
  return {
    items,
    ...(facets ? { facets } : {}),
    page: query.page,
    limit: query.limit,
    total: v.total,
    totalPages: v.totalPages,
  };
}
export function parseProduct(v: unknown, slug?: string): PublicProduct {
  if (!object(v) || !object(v.product)) return invalid();
  const p = v.product,
    card = parseCard(p);
  if (
    (slug !== undefined && card.slug !== slug) ||
    !Array.isArray(p.variants) ||
    p.variants.length > 1000 ||
    (p.description !== undefined && typeof p.description !== 'string')
  )
    return invalid();
  if (p.seo !== undefined && (!object(p.seo) || !string(p.seo.title, 70) || !string(p.seo.description, 180) || typeof p.seo.noIndex !== 'boolean')) return invalid();
  const variants = p.variants.map(v => {
    if (
      !object(v) ||
      !objectId(v.id) ||
      !string(v.size, 100) ||
      !object(v.pricing)
    )
      return invalid();
    return {
      id: v.id,
      size: v.size,
      pricing: {
        studio:
          v.pricing.studio === null ? null : parsePricing(v.pricing.studio),
        external:
          v.pricing.external === null ? null : parsePricing(v.pricing.external),
      },
    };
  });
  if (new Set(variants.map(v => v.id)).size !== variants.length)
    return invalid();
  return {
    ...card,
    ...(p.seo === undefined ? {} : { seo: p.seo as NonNullable<PublicProduct['seo']> }),
    variants,
    ...(p.description === undefined
      ? {}
      : { description: p.description as string }),
  };
}
export function sameSelection(a: Selection, b: Selection) {
  return (
    a.productId === b.productId &&
    a.variantId === b.variantId &&
    a.rentalMode === b.rentalMode &&
    a.startDate === b.startDate &&
    a.endDate === b.endDate
  );
}
export function parseAvailability(
  v: unknown,
  expected: Selection
): Availability {
  if (!object(v) || !object(v.availability)) return invalid();
  const a = v.availability;
  if (
    !sameSelection(a as Availability, expected) ||
    typeof a.available !== 'boolean' ||
    !instant(a.checkedAt)
  )
    return invalid();
  return {
    productId: expected.productId,
    variantId: expected.variantId,
    rentalMode: expected.rentalMode,
    startDate: expected.startDate,
    endDate: expected.endDate,
    available: a.available,
    ...(a.additionalDressDiscount===20?{additionalDressDiscount:20}:{}),
    checkedAt: a.checkedAt,
    pricing: parsePricing(a.pricing),
  };
}
function parseReservationItem(item: unknown): ReservationItem {
  if (!object(item) || !objectId(item.productId) || !objectId(item.variantId) ||
      !string(item.productName) || !string(item.size, 100) ||
      !money(item.rentalPrice) || !money(item.deposit)) return invalid();
  return { productId: item.productId, variantId: item.variantId, productName: item.productName,
    size: item.size, rentalPrice: item.rentalPrice, deposit: item.deposit };
}
export function parseReceipt(v: unknown, expected?: Selection & Fulfillment & { items?: ReservationSelection[] }): Receipt {
  if (!object(v) || !object(v.reservation)) return invalid();
  const r = v.reservation;
  let fulfillment: Fulfillment;
  try { fulfillment = parseFulfillment(r); } catch { return invalid(); }
  const shippingPrice=r.shippingPrice===undefined?0:r.shippingPrice;
  if(!money(shippingPrice))return invalid();
  const discount=r.fittingDiscount;
  if(discount!==undefined&&(!object(discount)||discount.amount!==200||typeof discount.number!=='string'||!/^ZK-[A-F0-9]{12}$/.test(discount.number)))return invalid();
  const fittingDiscount=discount as {number:string;amount:number}|undefined;
  const item = parseReservationItem(r.item);
  const items = r.items === undefined ? [item] :
    Array.isArray(r.items) && r.items.length > 0 && r.items.length <= 20
      ? r.items.map(parseReservationItem) : invalid();
  if (JSON.stringify(items[0]) !== JSON.stringify(item) ||
      !string(r.reservationNumber, 100) || !string(r.status, 100) ||
      !isMode(r.rentalMode) || !isDateOnly(r.startDate) || !isDateOnly(r.endDate) ||
      r.endDate < r.startDate || (r.expiresAt !== null && !instant(r.expiresAt)) ||
      !string(r.paymentStatus, 100) || !money(r.subtotal) || !money(r.deposit) ||
      !money(r.totalDue) || r.subtotal !== items.reduce((n, i) => n + i.rentalPrice, 0)-(fittingDiscount?.amount||0)+shippingPrice ||
      r.deposit !== items.reduce((n, i) => n + i.deposit, 0) ||
      r.totalDue !== r.subtotal + r.deposit) return invalid();
  const selection = { productId: item.productId, variantId: item.variantId,
    rentalMode: r.rentalMode, startDate: r.startDate, endDate: r.endDate };
  if (expected) {
    if(expected.fulfillmentMethod === 'balikovna_address' && (fulfillment.fulfillmentMethod!=='balikovna_address'||JSON.stringify(fulfillment.deliveryAddress)!==JSON.stringify(parseFulfillment(expected).deliveryAddress)))return invalid();
    if (expected.fulfillmentMethod === 'balikovna' &&
        (fulfillment.fulfillmentMethod !== 'balikovna' || JSON.stringify(fulfillment.balikovnaPoint) !== JSON.stringify(parseFulfillment(expected).balikovnaPoint))) return invalid();
    const expectedItems = expected.items ?? [expected];
    if (!sameSelection(selection, expected) || expectedItems.length !== items.length ||
        expectedItems.some((i, index) => i.productId !== items[index].productId ||
          i.variantId !== items[index].variantId)) return invalid();
  }
  return {
    ...fulfillment,...(r.shippingPrice===undefined?{}:{shippingPrice}),
    ...(isGuestAccessToken(v.guestAccessToken) ? { guestAccessToken: v.guestAccessToken } : {}),
    reservationNumber: r.reservationNumber, status: r.status, rentalMode: r.rentalMode,
    startDate: r.startDate, endDate: r.endDate, expiresAt: r.expiresAt as string | null,
    item, ...(r.items === undefined ? {} : { items }),
    ...(fittingDiscount?{fittingDiscount}:{}),
    subtotal: r.subtotal, deposit: r.deposit, totalDue: r.totalDue, paymentStatus: r.paymentStatus,
    ...(r.payment === undefined ? {} : { payment: r.payment === null ? null :
      parseReceiptPayment(r.payment, {
        reservationNumber: r.reservationNumber, subtotal: r.subtotal, deposit: r.deposit,
        status: r.status, expiresAt: r.expiresAt as string | null,
      }) }),
  };
}
export function publicApiBase() {
  const base = process.env.REACT_APP_V2_API_BASE_URL?.trim();
  return base ? base.replace(/\/+$/, '') : null;
}
async function request(path: string, init: RequestInit = {}) {
  const base = publicApiBase();
  if (!base) throw new PublicApiError('NOT_CONFIGURED');
  let response: Response;
  try {
    response = await fetch(base + path, {
      ...init,
      credentials: 'omit',
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new PublicApiError('NETWORK');
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new PublicApiError(
      'INVALID_RESPONSE',
      response.ok ? null : response.status
    );
  }
  if (!response.ok)
    throw new PublicApiError(
      object(body) && object(body.error) && string(body.error.code, 100)
        ? body.error.code
        : 'REQUEST_FAILED',
      response.status
    );
  return { body, status: response.status };
}
export async function getCatalogue(
  query: CatalogueQuery,
  signal?: AbortSignal
) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return parseCatalogue(
    (await request('/catalogue/products?' + params, { signal })).body,
    query
  );
}
export async function getPublicProduct(slug: string, signal?: AbortSignal) {
  return parseProduct(
    (
      await request('/catalogue/products/' + encodeURIComponent(slug), {
        signal,
      })
    ).body,
    slug
  );
}
export async function getAvailability(
  selection: Selection,
  signal?: AbortSignal
) {
  const { productId, variantId, rentalMode, startDate, endDate } = selection;
  const query = { variantId, rentalMode, startDate, endDate };
  return parseAvailability(
    (
      await request(
        '/catalogue/products/' +
          encodeURIComponent(productId) +
          '/availability?' +
          new URLSearchParams(query),
        { signal }
      )
    ).body,
    selection
  );
}
export async function postReservation(
  body: ReservationBody,
  key: string,
  signal?: AbortSignal,
  token?: string
) {
  const result = await request('/reservations', {
    method: 'POST',
    body: JSON.stringify(body.items ? {
      items: body.items, rentalMode: body.rentalMode, startDate: body.startDate,
      ...(body.fittingDiscount?{fittingDiscount:body.fittingDiscount}:{}),
      ...(body.referralToken?{referralToken:body.referralToken}:{}),
      ...(body.fulfillmentMethod ? {fulfillmentMethod:body.fulfillmentMethod} : {}),
      ...(body.deliveryTariff ? {deliveryTariff:body.deliveryTariff} : {}),
      ...(body.deliveryAddress ? {deliveryAddress:body.deliveryAddress} : {}),
      ...(body.balikovnaPoint ? {balikovnaPoint:body.balikovnaPoint} : {}),
      endDate: body.endDate, customer: body.customer, ...(body.notes === undefined ? {} : { notes: body.notes }),
    } : body),
    headers: { 'Idempotency-Key': key, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    signal,
  });
  if (result.status !== 200 && result.status !== 201) return invalid();
  return parseReceipt(result.body, body);
}

export async function getBookingPolicy(signal?: AbortSignal) {
  return parseBookingPolicy(
    (await request('/booking-policy', { signal })).body
  );
}

export const isGuestAccessToken = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);

export async function getReservationStatus(number: string, token: string, signal?: AbortSignal): Promise<Receipt> {
  if (!/^AK-\d{4}-[A-Z0-9]{6}$/.test(number) || !isGuestAccessToken(token))
    throw new PublicApiError('RESERVATION_NOT_FOUND', 404);
  const result = await request('/reservations/' + encodeURIComponent(number), {
    headers: { Authorization: 'Reservation ' + token },
    cache: 'no-store', signal,
  });
  const receipt = parseReceipt(result.body);
  if (receipt.reservationNumber !== number) return invalid();
  return { ...receipt, guestAccessToken: token };
}

export async function getAccountReservations(token: string, page: number, signal?: AbortSignal): Promise<{ items: Receipt[]; total: number; page: number }> {
  const result = await request(`/account/reservations?page=${page}`, { signal, headers: { Authorization: `Bearer ${token}` } });
  const data = result.body;
  if (!object(data) || !Array.isArray(data.items) || !Number.isSafeInteger(data.total) || (data.total as number) < 0 || data.page !== page) throw new PublicApiError('INVALID_RESPONSE');
  return { items: data.items.map(item => parseReceipt(item)), total: data.total as number, page };
}

export type CalendarQuery = Pick<Selection, 'productId' | 'variantId' | 'rentalMode'> & {
  month: string;
  startDate?: string;
};
export type RentalCalendar = CalendarQuery & {
  today: string;
  checkedAt: string;
  days: Array<{ date: string; available: boolean }>;
};
export function parseRentalCalendar(value: unknown, query: CalendarQuery): RentalCalendar {
  if (!object(value) || !object(value.calendar)) return invalid();
  const calendar = value.calendar;
  const dates = monthCalendarDays(query.month);
  if (calendar.productId !== query.productId || calendar.variantId !== query.variantId ||
      calendar.rentalMode !== query.rentalMode || calendar.month !== query.month ||
      calendar.startDate !== (query.startDate ?? null) ||
      !isDateOnly(calendar.today) || !instant(calendar.checkedAt) ||
      !Array.isArray(calendar.days) || calendar.days.length !== dates.length) return invalid();
  const today = calendar.today;
  const days = calendar.days.map((day, index) => {
    if (!object(day) || day.date !== dates[index] || typeof day.available !== 'boolean' ||
        (day.available && (day.date < today || (query.startDate && day.date < query.startDate))))
      return invalid();
    return { date: day.date, available: day.available };
  });
  return {...query, today: calendar.today, checkedAt: calendar.checkedAt, days};
}
export async function getRentalCalendar(query: CalendarQuery, signal?: AbortSignal) {
  const { productId, ...params } = query;
  return parseRentalCalendar((await request(
    '/catalogue/products/' + encodeURIComponent(productId) + '/availability-calendar?' +
    new URLSearchParams(params as Record<string, string>),
    { signal, cache: 'no-store' }
  )).body, query);
}

export async function getAccountReservationStatus(number: string, token: string, signal?: AbortSignal): Promise<Receipt> {
  if (!/^AK-\d{4}-[A-Z0-9]{6}$/.test(number) || !token) throw new PublicApiError('RESERVATION_NOT_FOUND', 404);
  const result = await request('/reservations/' + encodeURIComponent(number), {
    headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal,
  });
  const receipt = parseReceipt(result.body);
  if (receipt.reservationNumber !== number) return invalid();
  return receipt;
}
export type ReservationPaymentAccess = {kind:'account'|'guest';token:string};
export async function reportReservationPayment(
  number: string, access: ReservationPaymentAccess,
  body: {operationId:string;kind:'advance'|'full'|'cash';amount:number}, signal?: AbortSignal
): Promise<Receipt> {
  if (!/^AK-\d{4}-[A-Z0-9]{6}$/.test(number) || !access.token ||
      (access.kind === 'guest' && !isGuestAccessToken(access.token))) throw new PublicApiError('RESERVATION_NOT_FOUND',404);
  const result = await request('/reservations/'+encodeURIComponent(number)+'/payment-report', {
    method:'POST',headers:{Authorization:(access.kind === 'guest' ? 'Reservation ' : 'Bearer ')+access.token},
    body:JSON.stringify(body),signal,cache:'no-store',
  });
  const receipt = parseReceipt(result.body);
  if (receipt.reservationNumber !== number) return invalid();
  return {...receipt,...(access.kind === 'guest' ? {guestAccessToken:access.token} : {})};
}
export async function claimReservation(number: string, guestAccessToken: string, token: string, signal?: AbortSignal): Promise<Receipt> {
  if (!/^AK-\d{4}-[A-Z0-9]{6}$/.test(number) || !isGuestAccessToken(guestAccessToken) || !token)
    throw new PublicApiError('RESERVATION_NOT_FOUND', 404);
  const result = await request('/account/reservations/' + encodeURIComponent(number) + '/claim', {
    method: 'POST', headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ guestAccessToken }), signal,
  });
  const receipt = parseReceipt(result.body);
  if (receipt.reservationNumber !== number) return invalid();
  return receipt;
}
