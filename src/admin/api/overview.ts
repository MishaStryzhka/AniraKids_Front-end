import { adminApiClient, buildAdminRequestConfig } from './client';
import { AdminApiError, normalizeAdminApiError } from './errors';
import { isDateOnly } from '../calendar/calendarDates';
export interface OverviewRow { id: string; number: string; name: string; product: string; startDate: string; endDate: string; status: string; }
export interface OverviewGroup { total: number; items: OverviewRow[]; }
export interface AdminOverview { today: string; loadedAt: string; pickups: OverviewGroup; returns: OverviewGroup; pending: OverviewGroup; deposits: OverviewGroup; unpaid: number; overdue: number; maintenance: number; drafts: number; }
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const count = (v: unknown) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
function invalid(): never { throw new AdminApiError({code:'ADMIN_OVERVIEW_INVALID_RESPONSE',kind:'unexpected',message:'Invalid overview response'}); }
export function parseAdminOverview(value: unknown): AdminOverview {
  if (!record(value) || !isDateOnly(value.today) || typeof value.loadedAt !== 'string' || !Number.isFinite(Date.parse(value.loadedAt))) return invalid();
  for (const key of ['unpaid','overdue','maintenance','drafts']) if (!count(value[key])) return invalid();
  const group = (v: unknown): OverviewGroup => {
    if (!record(v) || !count(v.total) || !Array.isArray(v.items) || v.items.length > 10 || v.items.length > Number(v.total)) return invalid();
    const ids = new Set<string>();
    const items = v.items.map((r): OverviewRow => {
      if (!record(r) || ['id','number','name','product','status'].some(k=>typeof r[k] !== 'string') || !r.id || ids.has(String(r.id)) || !isDateOnly(r.startDate) || !isDateOnly(r.endDate) || r.startDate > r.endDate) return invalid();
      ids.add(String(r.id));
      return {id:String(r.id),number:String(r.number),name:String(r.name),product:String(r.product),status:String(r.status),startDate:r.startDate,endDate:r.endDate};
    });
    return {total:Number(v.total),items};
  };
  return {today:value.today,loadedAt:value.loadedAt,unpaid:Number(value.unpaid),overdue:Number(value.overdue),maintenance:Number(value.maintenance),drafts:Number(value.drafts),pickups:group(value.pickups),returns:group(value.returns),pending:group(value.pending),deposits:group(value.deposits)};
}
export async function getAdminOverview(token: string, signal: AbortSignal) {
  try { const response = await adminApiClient.get('/admin/overview',buildAdminRequestConfig(token,signal)); return parseAdminOverview(response.data); }
  catch(error) { throw normalizeAdminApiError(error); }
}
