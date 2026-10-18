import {useSearchParams} from 'react-router-dom';
import {useEffect,useRef,useState} from 'react';
import styled from 'styled-components';
import {Button} from '../../design-system/components/Button';
import {Input} from '../../design-system/components/Input';
import {Dialog} from '../../design-system/components/Dialog';
import {SelectField} from '../../design-system/components/SelectField';
import {useAuth} from '../../hooks/useAuth';
import {useAdminPermissions} from '../auth/permissions';
import {useAdminAccess} from '../auth/AdminAccessBoundary';
import {pragueToday} from '../calendar/calendarDates';
import {fittingAdmin,fittingApi,fittingError,fittingStatusLabels,fittingDateLabel,type AdminFitting,type Slots} from '../../fittings/fittingApi';
import {Panel,Stack,Heading,Copy,Actions,RouteLink} from '../../storefront/storefrontStyles';
import {designTokens as t} from '../../design-system/tokens/designTokens';
const Page=styled.div`display:grid;gap:24px;min-width:0;`;
const Toolbar=styled(Actions)`align-items:flex-end;>button,>a{min-height:44px;}@media(max-width:767px){align-items:stretch;}`;
const Badge=styled.span`border-radius:20px;background:${t.color.bg.subtle};color:${t.color.text.secondary};font-size:13px;padding:5px 10px;`;
const Card=styled(Panel)`overflow-wrap:anywhere;`;
const labels:Record<string,string>={confirm:'Potvrdit přijetí 200 Kč',complete:'Označit jako proběhlou',cancel:'Zrušit zkoušku',refund:'Zaznamenat vrácení 200 Kč','late-payment':'Zaznamenat pozdní platbu 200 Kč',reschedule:'Přesunout termín',credit:'Započíst 200 Kč do pronájmu'};
export function AdminFittingsPage(){
 const [search]=useSearchParams();
 const requestedDay=search.get('date')??'';
 const initialDay=/^20\d{2}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(requestedDay)?requestedDay:'';
 const access=useAdminPermissions();
 const {token}=useAuth(),{handleRequestError}=useAdminAccess();
 const today=pragueToday(),[month,setMonth]=useState((initialDay||today).slice(0,7)),[day,setDay]=useState(initialDay),[filter,setFilter]=useState('all');
 const [items,setItems]=useState<AdminFitting[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0),[busy,setBusy]=useState(false),[success,setSuccess]=useState('');
 const [intent,setIntent]=useState<{item:AdminFitting;action:string}|null>(null),[newDate,setNewDate]=useState(today),[newTime,setNewTime]=useState(''),[slots,setSlots]=useState<Slots|null>(null),[reservationNumber,setReservationNumber]=useState('');
 const lock=useRef(false),active=useRef(true),[truncated,setTruncated]=useState(false);
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 useEffect(()=>{const c=new AbortController();setLoading(true);setError('');setItems([]);const last=new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate();fittingAdmin<{items:AdminFitting[];truncated?:boolean}>(token??'',`/admin/fittings?from=${day||month+'-01'}&to=${day||month+'-'+last}`,undefined,c.signal).then(v=>{if(!c.signal.aborted){setItems(v.items);setTruncated(!!v.truncated);setLoading(false);}}).catch(e=>{if(!c.signal.aborted&&!handleRequestError(e)){setError(fittingError(e));setLoading(false);}});return()=>c.abort();},[token,month,day,revision,handleRequestError]);
 useEffect(()=>{if(intent?.action!=='reschedule')return;const c=new AbortController();setSlots(null);setNewTime('');fittingApi<Slots>('/fittings/slots?date='+newDate,{signal:c.signal}).then(setSlots).catch(e=>{if(!c.signal.aborted)setError(fittingError(e));});return()=>c.abort();},[newDate,intent?.action]);
 async function act(){if(!intent||lock.current)return;lock.current=true;setBusy(true);setError('');setSuccess('');try{await fittingAdmin(token??'',`/admin/fittings/${intent.item.id}/actions`,{action:intent.action,revision:intent.item.revision,...(intent.action==='reschedule'?{date:newDate,time:newTime}:{}),...(intent.action==='credit'?{reservationNumber}:{} )});if(active.current){setSuccess('Změna byla uložena.');setIntent(null);setRevision(x=>x+1);}}
 catch(e){if(active.current&&!handleRequestError(e))setError(fittingError(e));}finally{lock.current=false;if(active.current)setBusy(false);}}
 const visible=items.filter(i=>filter==='all'||(filter==='review'?i.status==='review':filter==='refund'?(i.status==='cancelled'||i.status==='expired')&&i.paymentStatus==='paid':i.status===filter));
 return <Page><Toolbar><Input label="Měsíc" type="month" value={month} disabled={busy} onChange={e=>{if(e.target.value){setMonth(e.target.value);setDay('');}}}/><Input label="Den (volitelné)" type="date" value={day} disabled={busy} onChange={e=>{setDay(e.target.value);if(e.target.value)setMonth(e.target.value.slice(0,7));}}/><SelectField label="Stav zkoušky" value={filter} onChange={e=>setFilter(e.target.value)} ><option value="all">Vše</option><option value="pending">Čeká na platbu</option><option value="review">Ověřit platbu</option><option value="confirmed">Potvrzené</option><option value="completed">Proběhlé</option><option value="refund">Zrušené s přijatou platbou</option></SelectField>{access.owner||access.permissions.includes('settings')?<RouteLink to="/admin/nastaveni#zkousky">Nastavení zkoušek</RouteLink>:null}</Toolbar>


 {error&&!intent?<Copy role="alert">{error}</Copy>:null}{success?<Copy role="status">{success}</Copy>:null}{loading?<Copy role="status">Načítání zkoušek…</Copy>:null}{truncated?<Copy role="alert">Přehled je příliš rozsáhlý. Vyberte konkrétní den pro úplný seznam.</Copy>:null}
 {!loading&&!visible.length&&!error?<Copy>Pro tento výběr nejsou žádné zkoušky.</Copy>:null}
 {visible.map(item=><Card key={item.id}><Actions><Heading>{fittingDateLabel(item.date)} · {item.time}</Heading><Badge>{fittingStatusLabels[item.status]}</Badge><Badge>{item.paymentStatus==='paid'?'Zaplaceno 200 Kč':item.paymentStatus==='refunded'?'Vráceno 200 Kč':'Platba nepotvrzena'}</Badge></Actions><strong>{item.customer.name}</strong><Copy>{item.customer.email} · {item.customer.phone}</Copy><Copy>{item.number} · {item.address}</Copy>{item.product?<RouteLink to={'/produkt/'+encodeURIComponent(item.product.slug)}>{item.product.name}</RouteLink>:null}{item.credit?<Copy>Započteno do rezervace <RouteLink to={'/admin/rezervace/'+item.credit.reservationId}>{item.credit.reservationNumber}</RouteLink></Copy>:null}<Actions>
 {(['pending','review'].includes(item.status)?['confirm','cancel']:item.status==='confirmed'?['complete','reschedule','cancel']:['expired','cancelled'].includes(item.status)?item.paymentStatus==='paid'?['refund']:item.paymentStatus==='unpaid'?['late-payment']:[]:item.status==='completed'&&item.paymentStatus==='paid'&&!item.credit?['credit']:[]).filter(action=>action!=='credit'||access.owner||access.permissions.includes('reservations')).map(action=><Button key={action} variant="secondary" disabled={busy} onClick={()=>{setError('');setReservationNumber('');setIntent({item,action});}}>{labels[action]}</Button>)}
 </Actions></Card>)}
 <Dialog open={!!intent} title={intent?labels[intent.action]:''} onEscape={()=>!busy&&setIntent(null)}><Stack><Copy>{intent?.item.customer.name} · {intent?.item.number}</Copy>
 {intent?.action==='confirm'||intent?.action==='late-payment'?<Copy>Potvrďte pouze po ověření skutečně přijatého převodu 200 Kč se správnou zprávou pro příjemce. Pozdní platba neobnovuje uvolněný termín.</Copy>:intent?.action==='refund'?<Copy>Tato akce pouze zaznamená, že jste již vrátili 200 Kč. Sama peníze neodesílá.</Copy>:intent?.action==='cancel'?<Copy>Termín se uvolní. Případné vrácení platby vyřešte samostatně; peníze se automaticky nevracejí.</Copy>:intent?.action==='complete'?<Copy>Označte až po uskutečnění zkoušky. Poté lze započíst zaplacených 200 Kč do pronájmu.</Copy>:null}
 {intent?.action==='credit'?<><Copy>Zadejte číslo otevřené rezervace stejného klienta (shodný e-mail). Zkoušku lze započíst jednou; sníží doplatek nájemného o 200 Kč. Vratná kauce se nemění.</Copy><Input label="Číslo rezervace" placeholder="AK-2026-…" value={reservationNumber} disabled={busy} onChange={e=>setReservationNumber(e.target.value)}/></>:null}
 {intent?.action==='reschedule'?<><Input label="Nové datum" type="date" min={today} value={newDate} disabled={busy} onChange={e=>setNewDate(e.target.value)}/><SelectField label="Nový čas" value={newTime} disabled={busy} onChange={e=>setNewTime(e.target.value)} ><option value="">{slots?'Vyberte volný čas':'Načítání…'}</option>{(slots?.slots||[]).map(time=><option value={time} key={time}>{time}</option>)}</SelectField><Copy>O změně termínu a adresy informujte klienta. Změna se zobrazí také na jeho soukromém odkazu.</Copy></>:null}
 {error?<Copy role="alert">{error}</Copy>:null}<Actions><Button disabled={busy} onClick={()=>setIntent(null)}>Zpět</Button><Button variant="secondary" disabled={busy||(intent?.action==='reschedule'&&!newTime)||(intent?.action==='credit'&&!reservationNumber.trim())} onClick={act}>{busy?'Ukládání…':'Potvrdit'}</Button></Actions></Stack></Dialog>
 </Page>;
}
