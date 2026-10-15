import {useEffect,useRef,useState} from 'react';
import {useLocation,useNavigate,useParams,useSearchParams} from 'react-router-dom';
import styled from 'styled-components';
import {CalendarClock} from 'lucide-react';
import {Button} from '../design-system/components/Button';
import {Input} from '../design-system/components/Input';
import {Dialog} from '../design-system/components/Dialog';
import {Page,Panel,Stack,Title,Copy,Actions,RouteLink,Heading} from '../storefront/storefrontStyles';
import {pragueToday,addCalendarDays} from '../admin/calendar/calendarDates';
import {fittingApi,fittingError,fittingStatusLabels,fittingDateLabel,FittingApiError,type Slots,type Fitting,type FittingRequest} from './fittingApi';
const Content=styled.div`width:100%;max-width:720px;margin:auto;display:grid;gap:24px;min-width:0;`;
const Times=styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:10px;`;
const Fields=styled.div`display:grid;gap:16px;@media(min-width:768px){grid-template-columns:1fr 1fr;}`;
const QR=styled.img`display:block;width:min(100%,260px);height:auto;margin:auto;background:white;`;
const STORAGE='anirakids.fitting-attempt.v1';
function savedAttempt():FittingRequest|null{try{const v=JSON.parse(sessionStorage.getItem(STORAGE)||'null');return v&&/^[a-f0-9]{64}$/.test(v.token)&&v.operationId&&v.date&&v.email?v:null;}catch{return null;}}
function randomToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');}

export function FittingPage(){
 const [params]=useSearchParams(),navigate=useNavigate();
 const [attempt,setAttempt]=useState(savedAttempt),attemptRef=useRef(attempt);
 const [date,setDate]=useState(attempt?.date||pragueToday()),[time,setTime]=useState(attempt?.time||'');
 const [contact,setContact]=useState({name:attempt?.name||'',email:attempt?.email||'',phone:attempt?.phone||''});
 const [slots,setSlots]=useState<Slots|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState(false),[revision,setRevision]=useState(0);
 const busyRef=useRef(false);
 useEffect(()=>{const c=new AbortController();setSlots(null);setLoading(true);setError('');fittingApi<Slots>('/fittings/slots?date='+date,{signal:c.signal}).then(v=>{setSlots(v);setLoading(false);}).catch(e=>{if(!c.signal.aborted){setError(fittingError(e));setLoading(false);}});return()=>c.abort();},[date,revision]);
 async function submit(){
  if(busyRef.current)return;busyRef.current=true;setBusy(true);setError('');
  try{
   const request=attemptRef.current||{...contact,date,time,operationId:crypto.randomUUID(),token:randomToken(),...(params.get('product')?{productId:params.get('product')!}:{})};
   sessionStorage.setItem(STORAGE,JSON.stringify(request));attemptRef.current=request;setAttempt(request);
   const result=await fittingApi<Fitting>('/fittings',{method:'POST',body:request});
   sessionStorage.removeItem(STORAGE);
   navigate('/zkouska/'+result.number+'#'+request.token,{replace:true});
  }catch(e){
   if(e instanceof FittingApiError&&[400,409,404].includes(e.status)){sessionStorage.removeItem(STORAGE);attemptRef.current=null;setAttempt(null);setTime('');}
   setError(fittingError(e));
  }finally{busyRef.current=false;setBusy(false);}
 }
 return <Page><Content><Title>Rezervovat zkoušku</Title><Copy>30 minut · 200 Kč · jeden zákazník v daném čase</Copy><Copy>Pokud si oblečení pronajmete, zaplacených 200 Kč započteme do ceny pronájmu. Zkouška sama o sobě nerezervuje oblečení na termín pronájmu.</Copy>
 {attempt?<Panel><Heading>Rozpracovaný zápis</Heading><Copy>{fittingDateLabel(attempt.date)} v {attempt.time}. Nejprve ověřte výsledek předchozího odeslání.</Copy><Button onClick={submit} disabled={busy}>{busy?'Ověřování…':'Ověřit a pokračovat'}</Button></Panel>:<form onSubmit={e=>{e.preventDefault();void submit();}}><Stack>
 <Panel><Heading><CalendarClock size={22} aria-hidden="true"/> Vyberte termín</Heading><Input label="Datum zkoušky" type="date" min={pragueToday()} max={addCalendarDays(pragueToday(),90)} value={date} disabled={busy} required onChange={e=>{setDate(e.target.value);setTime('');}}/>
 {loading?<Copy role="status">Načítání volných časů…</Copy>:slots?.enabled?<><Copy>Časy jsou uvedené v českém čase. Zápis je možný nejméně 2 hodiny předem, až 90 dní dopředu.</Copy>{slots.slots.length?<Times aria-label="Volné časy">{slots.slots.map(value=><Button key={value} type="button" variant={time===value?'primary':'secondary'} aria-pressed={time===value} disabled={busy} onClick={()=>setTime(value)}>{value}</Button>)}</Times>:<Copy>Na tento den nejsou volné časy. Vyberte jiné datum.</Copy>}</>:slots?<Copy>Termíny zkoušek právě připravujeme. Pro domluvení nás prosím kontaktujte.</Copy>:null}
 </Panel>
 {slots?.enabled?<Panel><Heading>Kontaktní údaje</Heading><Fields><Input label="Jméno a příjmení" autoComplete="name" required minLength={2} maxLength={160} value={contact.name} disabled={busy} onChange={e=>setContact({...contact,name:e.target.value})}/><Input label="E-mail" type="email" autoComplete="email" required maxLength={254} value={contact.email} disabled={busy} onChange={e=>setContact({...contact,email:e.target.value})}/><Input label="Telefon" type="tel" autoComplete="tel" required minLength={5} maxLength={32} value={contact.phone} disabled={busy} onChange={e=>setContact({...contact,phone:e.target.value})}/></Fields><Copy>Použijte stejný e-mail i pro následnou rezervaci oblečení.</Copy><Copy>Po odeslání zaplaťte 200 Kč QR převodem do 30 minut a zvolte „Platba odeslána“. Termín potvrdíme po ověření platby.</Copy><Copy>Odesláním objednáváte placenou zkoušku za 200 Kč. <RouteLink to="/ochrana-osobnich-udaju">Ochrana osobních údajů</RouteLink></Copy><Button type="submit" disabled={!time||busy||loading}>{busy?'Odesílání…':'Rezervovat a přejít k platbě 200 Kč'}</Button></Panel>:null}
 </Stack></form>}
 {error?<Panel role="alert"><Copy>{error}</Copy>{!attempt?<Button variant="secondary" onClick={()=>setRevision(x=>x+1)}>Obnovit nabídku</Button>:null}</Panel>:null}
 <Actions><RouteLink to="/kontakt">Kontakt</RouteLink><RouteLink to="/novinky">Zpět na nabídku</RouteLink></Actions></Content></Page>;
}
export function FittingStatusPage(){
 const {number=''}=useParams(),location=useLocation(),token=location.hash.slice(1);
 const [data,setData]=useState<Fitting|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[qr,setQr]=useState(''),[qrError,setQrError]=useState(false),[revision,setRevision]=useState(0),[notice,setNotice]=useState(''),[cancel,setCancel]=useState(false);
 const lock=useRef(false);
 useEffect(()=>{const c=new AbortController();setError('');fittingApi<Fitting>('/fittings/'+number,{token,signal:c.signal}).then(setData).catch(e=>{if(!c.signal.aborted)setError(fittingError(e));});return()=>c.abort();},[number,token,revision]);
 useEffect(()=>{const timer=window.setInterval(()=>setRevision(x=>x+1),30000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{setData(null);},[number,token]);
 const payload=data?.paymentInstructions?.qrPayload;
 useEffect(()=>{let active=true;setQr('');setQrError(false);if(payload)import('qrcode').then(({default:QRCode})=>QRCode.toDataURL(payload,{width:520,margin:4})).then(url=>{if(active)setQr(url);}).catch(()=>{if(active)setQrError(true);});return()=>{active=false;};},[payload,revision]);
 async function action(path:string){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{setData(await fittingApi<Fitting>('/fittings/'+number+'/'+path,{method:'POST',token}));setCancel(false);}catch(e){setError(fittingError(e));}finally{lock.current=false;setBusy(false);}}
 return <Page><Content><Title>Vaše zkouška</Title>{error?<Panel role="alert"><Copy>{error}</Copy><Button onClick={()=>setRevision(x=>x+1)}>Obnovit stav</Button></Panel>:null}{data?<>
 <Panel><Heading>{fittingDateLabel(data.date)} · {data.time}</Heading><Copy>30 minut · {data.number}</Copy><strong>{fittingStatusLabels[data.status]}</strong><Copy>Adresa: {data.address}</Copy>{data.product?<Copy>Vybraný produkt: {data.product.name}</Copy>:null}</Panel>
 {data.paymentInstructions?<Panel><Heading>Zaplaťte 200 Kč QR převodem</Heading>{qr?<QR src={qr} alt="QR platba za zkoušku 200 Kč"/>:qrError?<Copy>QR kód se nepodařilo načíst. Použijte údaje k převodu níže.</Copy>:<Copy role="status">Vytváření QR kódu…</Copy>}<Copy>Účet: <strong>{data.paymentInstructions.accountNumber}</strong><br/>Částka: <strong>200 Kč</strong><br/>Zpráva pro příjemce: <strong>{data.number}</strong></Copy><Copy>Platbu odešlete a nahlaste do {new Intl.DateTimeFormat('cs-CZ',{timeZone:'Europe/Prague',hour:'2-digit',minute:'2-digit'}).format(new Date(data.expiresAt))}. Jinak se čas uvolní.</Copy><Button disabled={busy} onClick={()=>action('payment-sent')}>Platba odeslána</Button><Copy>Tlačítko pouze nahlásí převod. Přijetí platby ověří administrátor.</Copy></Panel>:null}
 {data.status==='review'?<Panel><Heading>Ověřujeme vaši platbu</Heading><Copy>Termín pro vás držíme. Po ověření převodu se zde zobrazí potvrzení. Stav můžete kdykoli obnovit.</Copy></Panel>:null}
 {data.status==='confirmed'?<Panel><Heading>Těšíme se na vás</Heading><Copy>Platba 200 Kč byla potvrzena. Pokud si oblečení pronajmete, částku započteme do ceny. Doplatek na místě můžete uhradit hotově nebo kartou.</Copy></Panel>:null}
 {['expired','cancelled'].includes(data.status)?<Panel><Copy>Zápis již není aktivní. Pokud jste odeslali platbu, kontaktujte nás s číslem {data.number}, abychom ji mohli dohledat a domluvit další postup.</Copy>{data.paymentStatus==='refunded'?<Copy>Vrácení platby bylo zaznamenáno.</Copy>:null}<RouteLink to="/kontakt">Kontakt</RouteLink></Panel>:null}
 {data.status==='completed'?<Copy>Zkouška proběhla. Započtení 200 Kč do konkrétní rezervace vyřídí administrátor.</Copy>:null}
 <Panel><Heading>Uschovejte si soukromý odkaz</Heading><Copy>Potvrzení sledujte na této stránce. Odkaz umožňuje spravovat váš zápis; nesdílejte ho s dalšími osobami.</Copy><Input label="Soukromý odkaz na zkoušku" readOnly value={window.location.href} onFocus={e=>e.currentTarget.select()}/><Actions><Button variant="secondary" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);setNotice('Odkaz byl zkopírován.');}catch{setNotice('Odkaz vyberte a zkopírujte z pole výše.');}}}>Kopírovat odkaz</Button><Button variant="secondary" disabled={busy} onClick={()=>setRevision(x=>x+1)}>Obnovit stav</Button>{['pending','review','confirmed'].includes(data.status)?<Button variant="ghost" disabled={busy} onClick={()=>setCancel(true)}>Zrušit zkoušku</Button>:null}</Actions>{notice?<Copy role="status">{notice}</Copy>:null}</Panel>
 </>:!error?<Copy role="status">Načítání zápisu…</Copy>:null}
 <Dialog open={cancel} title="Zrušit zkoušku?" description="Termín se uvolní pro další zákazníky. Pokud jste již zaplatili, další postup vyřešíme individuálně. Zrušení samo nevrací peníze." onEscape={()=>!busy&&setCancel(false)}><Actions><Button disabled={busy} onClick={()=>setCancel(false)}>Ponechat termín</Button><Button variant="secondary" disabled={busy} onClick={()=>action('cancel')}>Zrušit zkoušku</Button></Actions></Dialog>
 </Content></Page>;
}
