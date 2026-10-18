import {useEffect,useRef,useState} from 'react';
import styled from 'styled-components';
import {Button} from '../../design-system/components/Button';
import {Input} from '../../design-system/components/Input';
import {CheckboxField} from '../../design-system/components/CheckboxField';
import {designTokens as t} from '../../design-system/tokens/designTokens';
import {useAuth} from '../../hooks/useAuth';
import {useAdminAccess} from '../auth/AdminAccessBoundary';
import {fittingAdmin,fittingError,type FittingSettings} from '../../fittings/fittingApi';
const Card=styled.section`border:1px solid ${t.color.border.subtle};border-radius:12px;background:${t.color.bg.surface};padding:24px;display:grid;gap:20px;min-width:0;h2{margin:0;display:flex;gap:10px;align-items:center;font-size:20px;}p{margin:0;line-height:1.6;color:${t.color.text.secondary};}@media(max-width:767px){padding:16px;}`;
const Day=styled.div`display:grid;gap:12px;grid-template-columns:minmax(130px,1fr) 130px 130px;align-items:center;border-top:1px solid ${t.color.border.subtle};padding-top:14px;@media(max-width:600px){grid-template-columns:1fr 1fr;>:first-child{grid-column:1/-1;}}`;
const Actions=styled.div`display:flex;gap:12px;flex-wrap:wrap;align-items:center;`;
const days=['Neděle','Pondělí','Úterý','Středa','Čtvrtek','Pátek','Sobota'];
export function FittingSettingsSection({onDirty}:{onDirty:(value:boolean)=>void}){
 const {token}=useAuth(),{handleRequestError}=useAdminAccess();
 const [draft,setDraft]=useState<FittingSettings|null>(null),[baseline,setBaseline]=useState(''),[error,setError]=useState(''),[success,setSuccess]=useState(false),[busy,setBusy]=useState(false),[revision,setRevision]=useState(0),[blocked,setBlocked]=useState('');
 const request=useRef<AbortController|null>(null),lock=useRef(false);
 const dirty=!!draft&&JSON.stringify(draft)!==baseline;
 useEffect(()=>{onDirty(dirty||busy);return()=>onDirty(false);},[dirty,busy,onDirty]);
 useEffect(()=>{const c=new AbortController();request.current=c;setDraft(null);setError('');fittingAdmin<FittingSettings>(token??'','/admin/fitting-settings',undefined,c.signal).then(v=>{if(!c.signal.aborted){setDraft(v);setBaseline(JSON.stringify(v));}}).catch(e=>{if(!c.signal.aborted&&!handleRequestError(e))setError(fittingError(e));});return()=>{c.abort();request.current?.abort();};},[token,revision,handleRequestError]);
 async function save(){if(!draft||!dirty||lock.current)return;lock.current=true;setBusy(true);setError('');setSuccess(false);const c=new AbortController();request.current=c;
 try{const v=await fittingAdmin<FittingSettings>(token??'','/admin/fitting-settings',draft,c.signal);if(!c.signal.aborted){setDraft(v);setBaseline(JSON.stringify(v));setSuccess(true);}}
 catch(e){if(!c.signal.aborted&&!handleRequestError(e))setError(fittingError(e));}finally{lock.current=false;if(!c.signal.aborted)setBusy(false);}}
 function change(value:FittingSettings){setDraft(value);setSuccess(false);}
 return <Card aria-label="Zkoušky">
 <p>30 minut · 200 Kč QR převodem · jeden zákazník současně. Zaplacená zkouška se může jednou započíst do ceny pronájmu.</p>
 {!draft?error?<><p role="alert">{error}</p><Button onClick={()=>setRevision(x=>x+1)}>Načíst nastavení zkoušek</Button></>:<p role="status">Načítání nastavení zkoušek…</p>:<form onSubmit={e=>{e.preventDefault();void save();}}><fieldset disabled={busy} style={{border:0,padding:0,margin:0,minWidth:0,display:'grid',gap:20}}><legend style={{position:'absolute',clipPath:'inset(100%)'}}>Nastavení zkoušek</legend>
 <CheckboxField label="Povolit online zápis na zkoušky" checked={draft.enabled} onChange={e=>change({...draft,enabled:e.target.checked})}/>
 <Input label="Adresa zkoušky" required={draft.enabled} maxLength={500} value={draft.address} onChange={e=>change({...draft,address:e.target.value})}/>
 <p>Adresu klient uvidí po vytvoření zápisu. Existující zápisy si ponechají původní adresu; při přesunu se použije aktuální. Časy jsou v pásmu Europe/Prague. Nové termíny lze rezervovat 2 hodiny až 90 dní dopředu.</p>
 {[1,2,3,4,5,6,0].map(day=>{const row=draft.weekly.find(d=>d.day===day)!;const update=(patch:Partial<typeof row>)=>change({...draft,weekly:draft.weekly.map(d=>d.day===day?{...d,...patch}:d)});return <Day key={day}><CheckboxField label={days[day]} checked={row.enabled} onChange={e=>update({enabled:e.target.checked})}/><Input label={`${days[day]} od`} type="time" step={1800} required value={row.start} disabled={!row.enabled} onChange={e=>update({start:e.target.value})}/><Input label={`${days[day]} do`} type="time" step={1800} required value={row.end} disabled={!row.enabled} onChange={e=>update({end:e.target.value})}/></Day>;})}
 <div><h3>Nedostupné dny</h3><Actions><Input label="Datum bez zkoušek" type="date" value={blocked} onChange={e=>setBlocked(e.target.value)}/><Button type="button" variant="secondary" disabled={!blocked||draft.blockedDates.includes(blocked)} onClick={()=>{change({...draft,blockedDates:[...draft.blockedDates,blocked].sort()});setBlocked('');}}>Přidat den</Button></Actions><Actions style={{marginTop:12}}>{draft.blockedDates.map(date=><Button type="button" variant="secondary" key={date} aria-label={`Odebrat nedostupný den ${date}`} onClick={()=>change({...draft,blockedDates:draft.blockedDates.filter(d=>d!==date)})}>{date} ×</Button>)}</Actions></div>
 <p>Změna rozvrhu ani vypnutí zápisu neruší už objednané zkoušky. Spravujte je v části Zkoušky.</p>
 <Actions><Button type="submit" disabled={!dirty||busy}>{busy?'Ukládání…':'Uložit zkoušky'}</Button><Button type="button" variant="secondary" disabled={!dirty||busy} onClick={()=>{setDraft(JSON.parse(baseline));setError('');setSuccess(false);}}>Zrušit změny zkoušek</Button></Actions>
 {error?<p role="alert">{error}</p>:null}{success?<p role="status">Nastavení zkoušek bylo uloženo.</p>:null}
 </fieldset></form>}
 </Card>;
}
