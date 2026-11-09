import {useEffect,useState} from 'react';
import {EmbeddedRevolutPayment,type CheckoutAdapter} from '../storefront/payments/RevolutPayment';
import {getRevolutConfig,type RevolutConfig} from '../storefront/api/publicApi';
import {Button} from '../design-system/components/Button';
import {SelectField} from '../design-system/components/SelectField';
import {Copy,Heading,Panel} from '../storefront/storefrontStyles';
import {fittingApi,type Fitting} from './fittingApi';
export function FittingOnlinePayment({data,endpoint,token,onUpdate,onMethod}:{data:Fitting;endpoint:string;token:string;onUpdate:()=>void;onMethod:(online:boolean)=>void}){
 const [config,setConfig]=useState<RevolutConfig|null>(null),[open,setOpen]=useState(false),[method,setMethod]=useState<'online'|'qr'>(data.paymentOptions?.defaultMethod??'qr');
 useEffect(()=>{const c=new AbortController();void getRevolutConfig(c.signal).then(setConfig,()=>{});return()=>c.abort();},[]);
 const active=Boolean(open||data.cardPayment?.active),review=Boolean(data.cardPayment?.reviewRequired);
 useEffect(()=>{onMethod(active||method==='online'||review);},[active,method,review,onMethod]);
 const payable=data.status==='pending'&&data.paymentStatus==='unpaid'&&new Date(data.expiresAt).getTime()>Date.now()&&!review;
 const online=data.paymentOptions?.gateway==='revolut';
 if(!payable&&!active&&!review)return null;
 const adapter:CheckoutAdapter<Fitting>={identity:endpoint+token,
  create:signal=>{if(endpoint.startsWith('/fittings/')){try{sessionStorage.setItem('anirakids.fitting-return.'+data.number,token);}catch{throw new Error('Private return link unavailable');}}return fittingApi(endpoint+'/revolut/create',{method:'POST',token,signal});},
  sync:cancel=>fittingApi(endpoint+'/revolut/'+(cancel?'cancel':'sync'),{method:'POST',token}),active:r=>Boolean(r.cardPayment?.active),
  returnUrl:window.location.origin+'/zkouska/'+data.number+'?paymentReturn=1',
 };
 return <Panel><Heading>Platba zkoušky</Heading>
 {review?<Copy role="alert">Platbu jsme přijali, ale termín vyžaduje kontrolu. Další platbu neposílejte. Kontaktujte nás s číslem zkoušky.</Copy>:null}
 {!active&&payable&&online?<SelectField label="Způsob platby" value={method} onChange={e=>setMethod(e.target.value as 'online'|'qr')}><option value="online">Online platba</option>{data.paymentOptions?.qrEnabled?<option value="qr">Bankovní převod s QR kódem</option>:null}</SelectField>:null}
 {active?<EmbeddedRevolutPayment adapter={adapter} config={config} canPay={payable} onReceipt={()=>onUpdate()} onClose={()=>{setOpen(false);onUpdate();}}/>:payable&&online&&method==='online'?config?<Button onClick={()=>setOpen(true)}>Zaplatit online – 200 Kč</Button>:<Copy role="status">Online platba momentálně není dostupná. Obnovte stránku nebo nás kontaktujte.</Copy>:null}
 </Panel>;
}
