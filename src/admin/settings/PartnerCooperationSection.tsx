import {useEffect,useState} from 'react';
import {useAuth} from '../../hooks/useAuth';
import {partnerApi} from '../../partner/api';
import {Button} from '../../design-system/components/Button';
import {useSiteSettings} from '../../siteSettings/SiteSettingsProvider';

export function PartnerCooperationSection(){
 const {token}=useAuth(),{reload}=useSiteSettings();
 const [active,setActive]=useState<boolean|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let current=true;setActive(null);partnerApi('access',token||'').then(v=>{if(current)setActive(v.cooperationActive===true);}).catch(()=>{if(current)setError('Stav spolupráce se nepodařilo načíst. Obnovte stránku.');});return()=>{current=false;};},[token]);
 async function toggle(){
  if(active===null||busy)return;setBusy(true);setError('');
  try{await partnerApi('cooperation',token||'',{active:!active});const state=await partnerApi('access',token||'');setActive(state.cooperationActive===true);reload();}
  catch{setError('Změnu se nepodařilo ověřit. Obnovte stránku před dalším pokusem.');setActive(null);}
  finally{setBusy(false);}
 }
 return <div style={{display:'grid',gap:12,marginTop:16}}>
  <strong role="status">{active===null?(error?'Stav se nepodařilo ověřit':'Načítání stavu…'):active?'Spolupráce aktivní':'Spolupráce není aktivní'}</strong>
  <p style={{margin:0}}>Spolupráci aktivujte až po podpisu smlouvy. Aktivací zpřístupníte pronájem ve studiu Blaze, partnerské odkazy a odměny za nové rezervace.</p>
  <p style={{margin:0}}>Nové zkoušky: {active===null?'Adresa bude zobrazena po načtení stavu':active?'Blaze Photostudio · Plzeňská 782/112, 150 00 Praha':'ANIRAK · Kytlická 862/2, Praha'}. Existující rezervace si zachovají své podmínky.</p>
  <Button disabled={active===null||busy} onClick={toggle} aria-busy={busy||undefined}>{busy?'Ukládání…':active?'Deaktivovat spolupráci':'Aktivovat spolupráci'}</Button>
  {error?<p role="alert">{error}</p>:null}
 </div>;
}
