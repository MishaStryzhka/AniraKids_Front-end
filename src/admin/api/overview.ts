import { adminApiClient, buildAdminRequestConfig } from './client';
import { AdminApiError, normalizeAdminApiError } from './errors';
import { isDateOnly } from '../calendar/calendarDates';
export interface OverviewRow { id: string; number: string; name: string; product: string; startDate: string; endDate: string; status: string; }
export interface OverviewGroup { total: number; items: OverviewRow[]; }
export interface OverviewFittingRow {id:string;number:string;name:string;product:string;date:string;time:string;status:'pending'|'review'|'confirmed';}
export interface OverviewFittingGroup {total:number;items:OverviewFittingRow[];}
export interface OverviewFittings {review:OverviewFittingGroup;pending:OverviewFittingGroup;today:OverviewFittingGroup;}
export interface AdminOverview { today: string; loadedAt: string; pickups: OverviewGroup; returns: OverviewGroup; pending: OverviewGroup; deposits: OverviewGroup; unpaid: number; overdue: number; maintenance: number; drafts: number; fittings?:OverviewFittings|null; }
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
  const fittingGroup=(v:unknown):OverviewFittingGroup=>{
    if(!record(v)||!count(v.total)||!Array.isArray(v.items)||v.items.length>10||v.items.length>Number(v.total))return invalid();
    const ids=new Set<string>();
    const items=v.items.map((r):OverviewFittingRow=>{
      if(!record(r)||['id','number','name','product'].some(k=>typeof r[k]!=='string')||!r.id||ids.has(String(r.id))||!isDateOnly(r.date)||typeof r.time!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(r.time)||!['pending','review','confirmed'].includes(String(r.status)))return invalid();
      ids.add(String(r.id));return {id:String(r.id),number:String(r.number),name:String(r.name),product:String(r.product),date:r.date,time:r.time,status:r.status as OverviewFittingRow['status']};
    });
    return {total:Number(v.total),items};
  };
  let fittings:OverviewFittings|null=null;
  if(value.fittings!==null&&value.fittings!==undefined){
    if(!record(value.fittings))return invalid();
    fittings={review:fittingGroup(value.fittings.review),pending:fittingGroup(value.fittings.pending),today:fittingGroup(value.fittings.today)};
  }
  return {today:value.today,loadedAt:value.loadedAt,unpaid:Number(value.unpaid),overdue:Number(value.overdue),maintenance:Number(value.maintenance),drafts:Number(value.drafts),pickups:group(value.pickups),returns:group(value.returns),pending:group(value.pending),deposits:group(value.deposits),fittings};
}
export async function getAdminOverview(token: string, signal: AbortSignal) {
  try { const response = await adminApiClient.get('/admin/overview',buildAdminRequestConfig(token,signal)); return parseAdminOverview(response.data); }
  catch(error) { throw normalizeAdminApiError(error); }
}
