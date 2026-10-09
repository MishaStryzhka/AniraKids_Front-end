import {adminApiClient, buildAdminRequestConfig} from './client';
import {AdminApiError, normalizeAdminApiError} from './errors';
import {isCalendarRange, isDateOnly, type DateOnly} from '../calendar/calendarDates';

export type CalendarReservationStatus = string;
export type CalendarRentalMode = 'studio' | 'external';
export interface CalendarReservationItem {
  inventoryItemId: string;
  productName: string;
  size: string;
}
export interface CalendarReservation {
  id: string;
  reservationNumber: string;
  status: CalendarReservationStatus;
  rentalMode: CalendarRentalMode;
  startDate: DateOnly;
  endDate: DateOnly;
  occupiedThrough: DateOnly;
  customerName: string;
  items: CalendarReservationItem[];
  expiresAt?: string;
}
export interface CalendarBlock {id:string;productId:string|null;productName:string;internalCode:string;reason:string;startDate:DateOnly;endDate:DateOnly;}
export interface ReservationCalendarResponse {items: CalendarReservation[];blocks?:CalendarBlock[];blocksTruncated?:boolean;}
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
function invalidResponse(): never {
  throw new AdminApiError({code: 'ADMIN_CALENDAR_INVALID_RESPONSE', kind: 'unexpected', message: 'Unusable reservation calendar response.'});
}
export function parseReservationCalendarResponse(value: unknown): ReservationCalendarResponse {
  if (!isRecord(value) || !Array.isArray(value.items)) return invalidResponse();
  const ids = new Set<string>();
  const items = value.items.map((row): CalendarReservation => {
    if (!isRecord(row) || !isText(row.id) || ids.has(row.id) || !isText(row.reservationNumber) ||
      !isText(row.status) || !['studio', 'external'].includes(row.rentalMode as string) ||
      !isDateOnly(row.startDate) || !isDateOnly(row.endDate) || !isDateOnly(row.occupiedThrough) ||
      row.startDate > row.endDate || row.endDate > row.occupiedThrough || typeof row.customerName !== 'string' || !Array.isArray(row.items)) return invalidResponse();
    ids.add(row.id);
    const inventoryIds = new Set<string>();
    const products = row.items.map((item): CalendarReservationItem => {
      if (!isRecord(item) || !isText(item.inventoryItemId) || inventoryIds.has(item.inventoryItemId) ||
        !isText(item.productName) || !isText(item.size)) return invalidResponse();
      inventoryIds.add(item.inventoryItemId);
      return {inventoryItemId: item.inventoryItemId, productName: item.productName, size: item.size};
    });
    if (row.expiresAt !== undefined && (typeof row.expiresAt !== 'string' || !Number.isFinite(Date.parse(row.expiresAt)))) return invalidResponse();
    return {id: row.id, reservationNumber: row.reservationNumber, status: row.status as CalendarReservationStatus,
      rentalMode: row.rentalMode as CalendarRentalMode, startDate: row.startDate, endDate: row.endDate,
      occupiedThrough: row.occupiedThrough, customerName: row.customerName, items: products,
      ...(row.expiresAt === undefined ? {} : {expiresAt: row.expiresAt as string})};
  });
  if (value.blocks === undefined) return {items};
  if (!Array.isArray(value.blocks) || typeof value.blocksTruncated !== 'boolean') return invalidResponse();
  const blockIds = new Set<string>();
  const blocks = value.blocks.map((r):CalendarBlock => {
    if (!isRecord(r) || !isText(r.id) || blockIds.has(r.id) || !(r.productId===null || isText(r.productId)) || !isText(r.productName) || !isText(r.internalCode) || !isText(r.reason) || !isDateOnly(r.startDate) || !isDateOnly(r.endDate) || r.startDate>r.endDate) return invalidResponse();
    blockIds.add(r.id);
    return {id:r.id,productId:r.productId,productName:r.productName,internalCode:r.internalCode,reason:r.reason,startDate:r.startDate,endDate:r.endDate};
  });
  return {items,blocks,blocksTruncated:value.blocksTruncated};
}
export async function getAdminReservationCalendar(input: {token: string; from: DateOnly; to: DateOnly; signal?: AbortSignal}): Promise<ReservationCalendarResponse> {
  if (!isCalendarRange(input.from, input.to)) throw new AdminApiError({code: 'ADMIN_CALENDAR_INVALID_RANGE', kind: 'unexpected', message: 'Calendar range must contain between 1 and 366 valid calendar days.'});
  try {
    const response = await adminApiClient.get('/admin/reservations/calendar', {...buildAdminRequestConfig(input.token, input.signal), params: {from: input.from, to: input.to}});
    return parseReservationCalendarResponse(response.data);
  } catch (error) {throw normalizeAdminApiError(error);}
}
