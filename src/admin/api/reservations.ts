import { adminApiClient, buildAdminRequestConfig } from './client';
import { AdminApiError, normalizeAdminApiError } from './errors';
import { isDateOnly } from '../calendar/calendarDates';
export const RESERVATIONS_PAGE_SIZE = 20;
export const reservationStatuses = [
  'pending',
  'confirmed',
  'prepared',
  'rented',
  'returned',
  'cancelled',
] as const;
export const reservationPaymentStatuses = [
  'unpaid',
  'paid',
  'refunded',
] as const;
export const reservationRentalModes = ['studio', 'external'] as const;
export interface ReservationCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
export interface ReservationListItem {
  id: string;
  reservationNumber: string;
  status: string;
  paymentStatus: string;
  rentalMode: string;
  startDate: string;
  endDate: string;
  expiresAt?: string;
  pendingExpired: boolean;
  customer: ReservationCustomer;
  itemCount: number;
  subtotal: number;
  deposit: number;
  totalDue: number;
  createdAt: string;
  updatedAt: string;
}
export interface ReservationListResponse {
  items: ReservationListItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
export interface ReservationDetailItem {
  productId: string;
  variantId: string;
  inventoryItemId: string;
  productNameSnapshot: string;
  sizeSnapshot: string;
  rentalPriceSnapshot: number;
  depositSnapshot: number;
  inventoryCurrent: null | {
    internalCode: string;
    status: string;
    condition: string;
  };
}
export interface ReservationDetail {
  id: string;
  reservationNumber: string;
  customerId?: string;
  customerSnapshot: ReservationCustomer;
  items: ReservationDetailItem[];
  rentalMode: string;
  startDate: string;
  endDate: string;
  status: string;
  expiresAt: null | string;
  pendingExpired: boolean;
  paymentStatus: string;
  subtotal: number;
  deposit: number;
  totalDue: number;
  fulfillmentMethod?: string;
  notes?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface ReservationListQuery {
  page: number;
  q?: string;
  status?: (typeof reservationStatuses)[number];
  paymentStatus?: (typeof reservationPaymentStatuses)[number];
  rentalMode?: (typeof reservationRentalModes)[number];
  from?: string;
  to?: string;
}
type ObjectValue = Record<string, unknown>;
const object = (value: unknown): value is ObjectValue =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));
const text = (value: unknown): value is string => typeof value === 'string';
const nonempty = (value: unknown): value is string =>
  text(value) && value.trim().length > 0;
const integer = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const timestamp = (value: unknown): value is string =>
  text(value) && Number.isFinite(Date.parse(value));
function invalid(): never {
  throw new AdminApiError({
    code: 'ADMIN_RESERVATION_INVALID_RESPONSE',
    kind: 'unexpected',
    message: 'Unusable reservation response.',
  });
}
function customer(value: unknown): ReservationCustomer {
  if (
    !object(value) ||
    !text(value.firstName) ||
    !text(value.lastName) ||
    !text(value.email) ||
    !text(value.phone)
  )
    return invalid();
  return {
    firstName: value.firstName,
    lastName: value.lastName,
    email: value.email,
    phone: value.phone,
  };
}
function common(value: unknown) {
  if (
    !object(value) ||
    !nonempty(value.id) ||
    !nonempty(value.reservationNumber) ||
    !nonempty(value.status) ||
    !nonempty(value.paymentStatus) ||
    !nonempty(value.rentalMode) ||
    !isDateOnly(value.startDate) ||
    !isDateOnly(value.endDate) ||
    value.startDate > value.endDate ||
    typeof value.pendingExpired !== 'boolean' ||
    !integer(value.subtotal) ||
    !integer(value.deposit) ||
    !integer(value.totalDue)
  )
    return invalid();
  return {
    id: value.id,
    reservationNumber: value.reservationNumber,
    status: value.status,
    paymentStatus: value.paymentStatus,
    rentalMode: value.rentalMode,
    startDate: value.startDate,
    endDate: value.endDate,
    pendingExpired: value.pendingExpired,
    subtotal: value.subtotal,
    deposit: value.deposit,
    totalDue: value.totalDue,
  };
}
export function parseReservationList(value: unknown): ReservationListResponse {
  if (
    !object(value) ||
    !Array.isArray(value.items) ||
    !object(value.pagination)
  )
    return invalid();
  const pagination = value.pagination;
  if (
    !integer(pagination.page) ||
    pagination.page < 1 ||
    !integer(pagination.limit) ||
    pagination.limit < 1 ||
    pagination.limit > 100 ||
    !integer(pagination.total) ||
    !integer(pagination.pages) ||
    pagination.pages !== Math.ceil(pagination.total / pagination.limit) ||
    value.items.length > pagination.limit
  )
    return invalid();
  const ids = new Set<string>();
  const items = value.items.map((row): ReservationListItem => {
    const base = common(row);
    if (
      !object(row) ||
      ids.has(base.id) ||
      !integer(row.itemCount) ||
      !timestamp(row.createdAt) ||
      !timestamp(row.updatedAt) ||
      (row.expiresAt !== undefined && !timestamp(row.expiresAt))
    )
      return invalid();
    ids.add(base.id);
    return {
      ...base,
      customer: customer(row.customer),
      itemCount: row.itemCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      ...(row.expiresAt === undefined
        ? {}
        : { expiresAt: row.expiresAt as string }),
    };
  });
  return {
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: pagination.pages,
    },
  };
}
export function parseReservationDetail(value: unknown): ReservationDetail {
  const base = common(value);
  if (
    !object(value) ||
    !Array.isArray(value.items) ||
    !(value.expiresAt === null || timestamp(value.expiresAt))
  )
    return invalid();
  const ids = new Set<string>();
  const items = value.items.map((item): ReservationDetailItem => {
    if (
      !object(item) ||
      !nonempty(item.productId) ||
      !nonempty(item.variantId) ||
      !nonempty(item.inventoryItemId) ||
      ids.has(item.inventoryItemId) ||
      !nonempty(item.productNameSnapshot) ||
      !nonempty(item.sizeSnapshot) ||
      !integer(item.rentalPriceSnapshot) ||
      !integer(item.depositSnapshot)
    )
      return invalid();
    ids.add(item.inventoryItemId);
    let inventoryCurrent: ReservationDetailItem['inventoryCurrent'] = null;
    if (item.inventoryCurrent !== null) {
      const current = item.inventoryCurrent;
      if (
        !object(current) ||
        !nonempty(current.internalCode) ||
        !nonempty(current.status) ||
        !nonempty(current.condition)
      )
        return invalid();
      inventoryCurrent = {
        internalCode: current.internalCode,
        status: current.status,
        condition: current.condition,
      };
    }
    return {
      productId: item.productId,
      variantId: item.variantId,
      inventoryItemId: item.inventoryItemId,
      productNameSnapshot: item.productNameSnapshot,
      sizeSnapshot: item.sizeSnapshot,
      rentalPriceSnapshot: item.rentalPriceSnapshot,
      depositSnapshot: item.depositSnapshot,
      inventoryCurrent,
    };
  });
  const optional: Partial<ReservationDetail> = {};
  for (const key of [
    'customerId',
    'fulfillmentMethod',
    'notes',
    'cancellationReason',
  ] as const) {
    if (value[key] !== undefined) {
      if (!text(value[key])) return invalid();
      optional[key] = value[key] as string;
    }
  }
  for (const key of ['cancelledAt', 'createdAt', 'updatedAt'] as const) {
    if (value[key] !== undefined) {
      if (!timestamp(value[key])) return invalid();
      optional[key] = value[key] as string;
    }
  }
  return {
    ...base,
    ...optional,
    customerSnapshot: customer(value.customerSnapshot),
    items,
    expiresAt: value.expiresAt as string | null,
  };
}
export function reservationListParams(query: ReservationListQuery) {
  const q = query.q?.trim();
  if (
    !Number.isSafeInteger(query.page) ||
    query.page < 1 ||
    (q?.length ?? 0) > 200 ||
    (query.from !== undefined && !isDateOnly(query.from)) ||
    (query.to !== undefined && !isDateOnly(query.to)) ||
    (query.from && query.to && query.from > query.to)
  )
    throw new AdminApiError({
      code: 'ADMIN_RESERVATION_INVALID_QUERY',
      kind: 'unexpected',
      message: 'Invalid reservation query.',
    });
  return {
    page: query.page,
    limit: RESERVATIONS_PAGE_SIZE,
    ...(q ? { q } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
    ...(query.rentalMode ? { rentalMode: query.rentalMode } : {}),
    ...(query.from ? { from: query.from } : {}),
    ...(query.to ? { to: query.to } : {}),
  };
}
export async function listAdminReservations(input: {
  token: string;
  query: ReservationListQuery;
  signal?: AbortSignal;
}): Promise<ReservationListResponse> {
  const params = reservationListParams(input.query);
  try {
    const response = await adminApiClient.get('/admin/reservations', {
      ...buildAdminRequestConfig(input.token, input.signal),
      params,
    });
    const value = parseReservationList(response.data);
    if (
      value.pagination.page !== input.query.page ||
      value.pagination.limit !== RESERVATIONS_PAGE_SIZE
    )
      return invalid();
    return value;
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}
export async function getAdminReservationDetail(input: {
  token: string;
  reservationId: string;
  signal?: AbortSignal;
}): Promise<ReservationDetail> {
  try {
    const response = await adminApiClient.get(
      `/admin/reservations/${encodeURIComponent(input.reservationId)}`,
      buildAdminRequestConfig(input.token, input.signal)
    );
    const value = parseReservationDetail(response.data);
    if (value.id !== input.reservationId) return invalid();
    return value;
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}
