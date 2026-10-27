import { object } from '../api/publicValidation';
export type BalikovnaPoint = { id: string; name: string; address: string; zip: string };
export type DeliveryAddress = {street:string;city:string;zip:string;country:'CZ'};
export type Fulfillment = { deliveryTariff?: '2026-10'; fulfillmentMethod?: 'pickup' | 'balikovna' | 'balikovna_address'; balikovnaPoint?: BalikovnaPoint; deliveryAddress?: DeliveryAddress; shippingPrice?:number };
export const shippingPrice = (v:Fulfillment,mode:string) => mode !== 'external' ? 0 : v.fulfillmentMethod === 'balikovna' ? 89 : v.fulfillmentMethod === 'balikovna_address' ? 119 : 0;
export function parseAddress(v:unknown):DeliveryAddress {if(!object(v)||typeof v.street!=='string'||!v.street.trim()||v.street.length>200||typeof v.city!=='string'||!v.city.trim()||v.city.length>100||typeof v.zip!=='string'||!/^\d{5}$/.test(v.zip)||v.country!=='CZ')throw new Error('Invalid address');return {street:v.street.trim(),city:v.city.trim(),zip:v.zip,country:'CZ'};}
export const deliveryNotice = 'Cena zahrnuje doručení k vám. Způsob a cenu vrácení domluvíme před potvrzením rezervace.';
export function parsePoint(v: unknown): BalikovnaPoint {
  if (!object(v) || typeof v.id !== 'string' || !/^B?[0-9]{1,20}$/.test(v.id) ||
      typeof v.zip !== 'string' || !/^[0-9]{5}$/.test(v.zip) ||
      typeof v.name !== 'string' || !v.name.trim() || v.name.length > 200 ||
      typeof v.address !== 'string' || !v.address.trim() || v.address.length > 400) throw new Error('Invalid pickup point');
  return { id: v.id, name: v.name.trim(), address: v.address.trim(), zip: v.zip };
}
export function parseFulfillment(v: Record<string, unknown>): Fulfillment {
  if (v.fulfillmentMethod === undefined && v.balikovnaPoint === undefined) return {};
  if (v.rentalMode !== 'external') throw new Error('Delivery is only available outside the studio');
  if (v.fulfillmentMethod === 'pickup' && v.balikovnaPoint === undefined) return { fulfillmentMethod: 'pickup' };
  if (v.fulfillmentMethod === 'balikovna_address') return {fulfillmentMethod:'balikovna_address',deliveryAddress:parseAddress(v.deliveryAddress)};
  if (v.fulfillmentMethod === 'balikovna') return { fulfillmentMethod: 'balikovna', balikovnaPoint: parsePoint(v.balikovnaPoint) };
  throw new Error('Invalid delivery');
}
export function fulfillmentError(v: Fulfillment, rentalMode: string): string | undefined {
  if(rentalMode === 'external' && v.fulfillmentMethod === 'balikovna_address'){try{parseAddress(v.deliveryAddress);return;}catch{return 'Vyplňte ulici a číslo domu, město a platné PSČ.';}}
  if (rentalMode !== 'external' || v.fulfillmentMethod !== 'balikovna') return;
  try { parsePoint(v.balikovnaPoint); } catch { return 'Vyberte výdejní místo Balíkovny.'; }
}
// Only accept the documented provider message from the exact iframe we opened.
export function pointFromMessage(event: MessageEvent, source: Window | null): BalikovnaPoint | null {
  if (!source || event.source !== source || event.origin !== 'https://b2c.cpost.cz' ||
      !object(event.data) || event.data.message !== 'pickerResult' ||
      !object(event.data.point) || event.data.point.type !== 'BALIKOVNY') return null;
  try { return parsePoint({ ...event.data.point, id: String(event.data.point.id) }); } catch { return null; }
}
