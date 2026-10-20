import {PartnerApiError} from '../../partner/api';
import {fittingError} from '../../fittings/fittingApi';
export async function adminBookingApi(path:string,token:string,body?:unknown,key?:string,signal?:AbortSignal){
 const base=process.env.REACT_APP_V2_API_BASE_URL?.replace(/\/+$/,'');
 if(!base)throw new Error('Připojení není nastavené.');
 const endpoint=path==='create-reservation'?'reservations':path==='create-fitting'?'fittings':'booking-catalogue';
 let response:Response;
 try{response=await fetch(base+'/admin/'+endpoint,{method:body===undefined?'GET':'POST',credentials:'omit',cache:'no-store',signal,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',...(key?{'Idempotency-Key':key}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});}
 catch(e){if(signal?.aborted)throw e;throw new Error('Výsledek není ověřený. Zopakujte stejný požadavek pro ověření vytvoření.');}
 let data;try{data=await response.json();}catch{throw new Error('Výsledek není ověřený. Zopakujte stejný požadavek.');}
 if(!response.ok){const code=data.error?.code;const message:Record<string,string>={ADMIN_FORBIDDEN:'K této akci nemáte oprávnění.',ADMIN_UNAUTHORIZED:'Přihlaste se znovu.',NO_AVAILABLE_INVENTORY:'Oblečení již není v tomto termínu dostupné.',IDEMPOTENCY_KEY_REUSED:'Požadavek se změnil. Ověřte předchozí rezervaci.',PAST_START_DATE:'Vyberte dnešní nebo budoucí datum.'};throw new PartnerApiError(message[code]||fittingError({code}),response.status,code);}
 return data;
}
