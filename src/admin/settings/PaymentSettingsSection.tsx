import {useEffect,useRef,useState} from 'react';
import {useAuth} from '../../hooks/useAuth';
import {useAdminAccess} from '../auth/AdminAccessBoundary';
import {adminApiClient,buildAdminRequestConfig} from '../api/client';
import {normalizeAdminApiError} from '../api/errors';
import {Button} from '../../design-system/components/Button';
import {SelectField} from '../../design-system/components/SelectField';
import {CheckboxField} from '../../design-system/components/CheckboxField';
import {Actions,Copy,Stack} from '../../storefront/storefrontStyles';
import type {PaymentOptions} from '../../storefront/payments/paymentOptions';
interface Settings extends PaymentOptions {revision:number;configured:boolean;providers:{revolut:boolean;globalpayments:boolean};}
export function PaymentSettingsSection({onDirty}:{onDirty:(v:boolean)=>void}){
 const {token}=useAuth(),{handleRequestError}=useAdminAccess();
 const [value,setValue]=useState<Settings|null>(null),[saved,setSaved]=useState<Settings|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState(false),[reload,setReload]=useState(0);
 const request=useRef<AbortController|null>(null),locked=useRef(false);
 const dirty=JSON.stringify(value)!==JSON.stringify(saved);
 useEffect(()=>{onDirty(dirty||busy);return()=>onDirty(false);},[dirty,busy,onDirty]);
 useEffect(()=>{
  const c=new AbortController();request.current=c;setValue(null);setSaved(null);setError('');
  void adminApiClient.get<Settings>('/admin/payment-settings',buildAdminRequestConfig(token||'',c.signal)).then(r=>{if(!c.signal.aborted){setValue(r.data);setSaved(r.data);}}).catch(e=>{if(!c.signal.aborted&&!handleRequestError(normalizeAdminApiError(e)))setError('Nastavení plateb se nepodařilo načíst.');});
  return()=>{c.abort();request.current?.abort();};
 },[token,reload,handleRequestError]);
 async function save(){
  if(!value||locked.current)return;locked.current=true;setBusy(true);setError('');setSuccess(false);
  const c=new AbortController();request.current=c;
  try{const {gateway,qrEnabled,defaultMethod,revision}=value;const r=await adminApiClient.patch<Settings>('/admin/payment-settings',{gateway,qrEnabled,defaultMethod,revision},buildAdminRequestConfig(token||'',c.signal));if(!c.signal.aborted){setValue(r.data);setSaved(r.data);setSuccess(true);}}
  catch(e){if(!c.signal.aborted&&!handleRequestError(normalizeAdminApiError(e)))setError('Změnu nelze uložit. Ověřte připojení brány a povolte alespoň jeden způsob platby. Pokud nastavení změnil jiný správce, načtěte je znovu.');}
  finally{locked.current=false;if(!c.signal.aborted)setBusy(false);}
 }
 const change=(patch:Partial<Settings>)=>{setValue(v=>v?{...v,...patch}:v);setSuccess(false);};
 return <Stack><Copy>Nastavení platí pro nové pronájmy i zkoušky. Existující rezervace si ponechají původní možnosti platby a rozpracované platby bude možné dokončit.</Copy>
 {value?<form onSubmit={e=>{e.preventDefault();void save();}}><fieldset disabled={busy} style={{border:0,padding:0,margin:0,minWidth:0,display:'grid',gap:20}}><legend>Platební možnosti</legend>
 <SelectField label="Online platební brána" value={value.gateway} onChange={e=>{const gateway=e.target.value as PaymentOptions['gateway'];change({gateway,...(gateway==='off'?{qrEnabled:true,defaultMethod:'qr'}:{})});}}>
 <option value="off">Vypnuto</option><option value="revolut" disabled={!value.providers.revolut}>Revolut{!value.providers.revolut?' — Nepřipojeno':''}</option><option value="globalpayments" disabled>Global Payments — Nepřipojeno</option></SelectField>
 <CheckboxField label="Povolit bankovní převod s QR kódem" checked={value.qrEnabled} onChange={e=>change({qrEnabled:e.target.checked,...(!e.target.checked&&value.gateway==='revolut'?{defaultMethod:'online'}:{})})}/>
 <SelectField label="Výchozí způsob platby" value={value.defaultMethod} onChange={e=>change({defaultMethod:e.target.value as PaymentOptions['defaultMethod']})}><option value="online" disabled={value.gateway==='off'}>Online platba</option><option value="qr" disabled={!value.qrEnabled}>QR převod</option></SelectField>
 <Copy>Revolut: karta a dostupné peněženky podle zařízení zákazníka. QR převod potvrzuje administrátor. Global Payments bude možné aktivovat po dokončení integrace.</Copy>
 {!value.configured?<Copy>Dosud nebylo uloženo společné nastavení. Pronájmy používají stávající platby, zkoušky QR převod.</Copy>:null}
 <Actions><Button type="submit" disabled={!dirty||(!value.qrEnabled&&value.gateway==='off')}>Uložit platby</Button><Button type="button" variant="secondary" disabled={!dirty} onClick={()=>{setValue(saved);setSuccess(false);setError('');}}>Zrušit změny</Button></Actions>
 </fieldset></form>:!error?<Copy role="status">Načítání plateb…</Copy>:null}
 {error?<><Copy role="alert">{error}</Copy><Button variant="secondary" disabled={busy} onClick={()=>setReload(x=>x+1)}>Načíst znovu</Button></>:null}
 {success?<Copy role="status">Nastavení plateb bylo uloženo.</Copy>:null}
 </Stack>;
}
