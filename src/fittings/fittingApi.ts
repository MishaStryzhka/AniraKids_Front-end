import {adminApiClient,buildAdminRequestConfig} from '../admin/api/client';
import {normalizeAdminApiError} from '../admin/api/errors';
export interface FittingSettings {enabled:boolean;address:string;weekly:Array<{day:number;enabled:boolean;start:string;end:string}>;blockedDates:string[];}
export interface Slots {enabled:boolean;date:string;slots:string[];price:number;durationMinutes:number;}
export interface Fitting {number:string;date:string;time:string;durationMinutes:number;price:number;address:string;status:'pending'|'review'|'confirmed'|'completed'|'cancelled'|'expired';paymentStatus:'unpaid'|'paid'|'refunded';expiresAt:string;product?:{id:string;name:string;slug:string};paymentInstructions:{amount:number;accountNumber:string;message:string;qrPayload:string}|null;}
export interface AdminFitting extends Fitting {id:string;revision:number;customer:{name:string;email:string;phone:string};audit:Array<{action:string;at:string;by:string}>;credit:{reservationId:string;reservationNumber:string}|null;}
export interface FittingRequest {operationId:string;token:string;date:string;time:string;name:string;email:string;phone:string;productId?:string;}
export const fittingStatusLabels:Record<Fitting['status'],string>={pending:'Čeká na platbu',review:'Ověřit platbu',confirmed:'Potvrzená',completed:'Proběhla',cancelled:'Zrušená',expired:'Platnost vypršela'};
export class FittingApiError extends Error {constructor(public code:string,public status:number){super(code);}}
export const fittingError=(e:unknown)=>{
 const code=(e as {code?:string})?.code;
 const messages:Record<string,string>={VALIDATION_ERROR:'Zkontrolujte vyplněné údaje, časy a adresu.',SLOT_UNAVAILABLE:'Tento čas už není dostupný. Vyberte jiný.',SLOT_OR_PENDING_CONFLICT:'Čas už je obsazený nebo máte jinou zkoušku čekající na platbu. Obnovte nabídku nebo otevřete svůj předchozí zápis.',FITTING_NOT_FOUND:'Zápis nebyl nalezen. Otevřete celý soukromý odkaz včetně části za #.',FITTING_CONFLICT:'Zápis se mezitím změnil. Obnovte přehled a ověřte aktuální stav.',FITTING_ALREADY_CREDITED:'Tato zkouška už byla započtena do jiné rezervace.',CREDIT_RESERVATION_MISMATCH:'Rezervace musí mít stejný e-mail, být otevřená a nesmí už mít započtenou jinou zkoušku.',CREDIT_BALANCE_TOO_LOW:'K úhradě nájemného zbývá méně než 200 Kč. Započtení vyžaduje kontrolu plateb.',RESERVATION_NOT_FOUND:'Rezervace s tímto číslem nebyla nalezena.',PRODUCT_UNAVAILABLE:'Vybraný produkt již není dostupný.',PAYMENT_CONFLICT:'Platby se změnily. Obnovte přehled a zkuste to znovu.',FITTING_NOT_CREDITABLE:'Započíst lze pouze zaplacenou a dokončenou zkoušku.'};
 return messages[code||'']||'Výsledek se nepodařilo ověřit. Obnovte stav nebo zopakujte stejnou akci.';
};
export async function fittingApi<T>(path:string,options:{method?:string;body?:unknown;token?:string;signal?:AbortSignal}={}):Promise<T>{
 const base=process.env.REACT_APP_V2_API_BASE_URL?.replace(/\/+$/,'');if(!base)throw new FittingApiError('UNAVAILABLE',503);
 const response=await fetch(base+path,{method:options.method||'GET',signal:options.signal,credentials:'omit',cache:'no-store',headers:{'Content-Type':'application/json',...(options.token?{Authorization:'Bearer '+options.token}:{})},...(options.body?{body:JSON.stringify(options.body)}:{})});
 const data=await response.json();if(!response.ok)throw new FittingApiError(data.error?.code||'UNAVAILABLE',response.status);return data;
}
export async function fittingAdmin<T>(token:string,path:string,body?:unknown,signal?:AbortSignal):Promise<T>{
 try{const config=buildAdminRequestConfig(token,signal);return (body?await adminApiClient.request({url:path,method:path.endsWith('fitting-settings')?'PATCH':'POST',data:body,...config}):await adminApiClient.get(path,config)).data;}
 catch(e){throw normalizeAdminApiError(e);}
}
export const fittingDateLabel=(date:string)=>new Intl.DateTimeFormat('cs-CZ',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
