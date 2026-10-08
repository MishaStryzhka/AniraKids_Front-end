import { PublicApiError, object, string, money } from './publicValidation';
import {
  parseBookingPolicy,
  parseReceiptPayment,
  type ReceiptPayment,
} from './bookingPolicy';
import { isDateOnly } from '../../admin/calendar/calendarDates';
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
  color?: string;
  photos: Array<{ url: string; alt?: string }>;
};
export type PublicVariant = {
  id: string;
  size: string;
  pricing: Record<RentalMode, Pricing | null>;
};
export type PublicProduct = ProductCard & {
  description?: string;
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
export type ReservationBody = Selection & {
  customer: Customer;
  notes?: string;
};
export type Receipt = {
  guestAccessToken?: string;
  payment?: ReceiptPayment | null;
  reservationNumber: string;
  status: string;
  rentalMode: RentalMode;
  startDate: string;
  endDate: string;
  expiresAt: string | null;
  item: {
    productId: string;
    variantId: string;
    productName: string;
    size: string;
    rentalPrice: number;
    deposit: number;
  };
  subtotal: number;
  deposit: number;
  totalDue: number;
  paymentStatus: string;
};
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
    (v.color !== undefined && !string(v.color))
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
    id: v.id,
    slug: v.slug,
    name: v.name,
    photos,
    ...(v.category === undefined ? {} : { category: v.category as string }),
    ...(v.color === undefined ? {} : { color: v.color as string }),
  };
}
export type CatalogueQuery = {
  category?: 'dress' | 'suit';
  q?: string;
  sort: 'name' | 'newest';
  page: number;
  limit: number;
};
export type Catalogue = {
  items: ProductCard[];
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
  const items = v.items.map(parseCard);
  if (new Set(items.map(p => p.id)).size !== items.length) return invalid();
  return {
    items,
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
    checkedAt: a.checkedAt,
    pricing: parsePricing(a.pricing),
  };
}
export function parseReceipt(v: unknown, expected?: Selection): Receipt {
  if (!object(v) || !object(v.reservation)) return invalid();
  const r = v.reservation,
    item = r.item;
  if (
    !string(r.reservationNumber, 100) ||
    !string(r.status, 100) ||
    !isMode(r.rentalMode) ||
    !isDateOnly(r.startDate) ||
    !isDateOnly(r.endDate) ||
    r.endDate < r.startDate ||
    (r.expiresAt !== null && !instant(r.expiresAt)) ||
    !string(r.paymentStatus, 100) ||
    !object(item) ||
    !objectId(item.productId) ||
    !objectId(item.variantId) ||
    !string(item.productName) ||
    !string(item.size, 100) ||
    !money(item.rentalPrice) ||
    !money(item.deposit) ||
    !money(r.subtotal) ||
    !money(r.deposit) ||
    !money(r.totalDue) ||
    r.subtotal !== item.rentalPrice ||
    r.deposit !== item.deposit ||
    r.totalDue !== r.subtotal + r.deposit
  )
    return invalid();
  const selection = {
    productId: item.productId,
    variantId: item.variantId,
    rentalMode: r.rentalMode,
    startDate: r.startDate,
    endDate: r.endDate,
  };
  if (expected && !sameSelection(selection, expected)) return invalid();
  // Retain only the scoped capability (session storage); never retain customer data.
  return {
    ...(isGuestAccessToken(v.guestAccessToken) ? { guestAccessToken: v.guestAccessToken } : {}),
    reservationNumber: r.reservationNumber,
    status: r.status,
    rentalMode: r.rentalMode,
    startDate: r.startDate,
    endDate: r.endDate,
    expiresAt: r.expiresAt as string | null,
    item: {
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      size: item.size,
      rentalPrice: item.rentalPrice,
      deposit: item.deposit,
    },
    subtotal: r.subtotal,
    deposit: r.deposit,
    totalDue: r.totalDue,
    paymentStatus: r.paymentStatus,
    ...(r.payment === undefined
      ? {}
      : {
          payment:
            r.payment === null
              ? null
              : parseReceiptPayment(r.payment, {
                  reservationNumber: r.reservationNumber,
                  subtotal: r.subtotal,
                  deposit: r.deposit,
                  status: r.status,
                  expiresAt: r.expiresAt as string | null,
                }),
        }),
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
  signal?: AbortSignal
) {
  const result = await request('/reservations', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Idempotency-Key': key },
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
