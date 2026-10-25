import {useEffect,useRef,useState} from 'react';
import {getReferralToken} from '../partner/referral';
import {useLocation,useNavigate,useParams,useSearchParams} from 'react-router-dom';
import styled from 'styled-components';
import {CalendarClock} from 'lucide-react';
import {useAuth} from '../hooks/useAuth';
import {usePublicRead} from '../storefront/usePublicRead';
import {FittingAccountClaim} from './FittingAccountClaim';
import {Button} from '../design-system/components/Button';
import {Input} from '../design-system/components/Input';
import {Dialog} from '../design-system/components/Dialog';
import {Page,Panel,Stack,Title,Copy,Actions,RouteLink,Heading} from '../storefront/storefrontStyles';
import {pragueToday,addCalendarDays} from '../admin/calendar/calendarDates';
import {fittingApi,fittingError,fittingStatusLabels,fittingDateLabel,FittingApiError,type Slots,type Fitting,type FittingRequest} from './fittingApi';
const Content=styled.div`width:100%;max-width:720px;margin:auto;display:grid;gap:24px;min-width:0;`;
const Times=styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:10px;`;
const Fields=styled.div`display:grid;gap:16px;@media(min-width:768px){grid-template-columns:1fr 1fr;}`;
const ErrorPanel=styled(Panel)`border:2px solid #a32929;background:#fff5f5;color:#702020;scroll-margin-top:100px;`;
const QR=styled.img`display:block;width:min(100%,260px);height:auto;margin:auto;background:white;`;
const STORAGE='anirakids.fitting-attempt.v1';
function savedAttempt():FittingRequest|null{try{const v=JSON.parse(sessionStorage.getItem(STORAGE)||'null');return v&&/^[a-f0-9]{64}$/.test(v.token)&&v.operationId&&v.date&&v.email?v:null;}catch{return null;}}
function randomToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');}

export function FittingPage(){
 const {isLoggedIn,user}=useAuth();
 return <FittingForm key={isLoggedIn?String(user?.userID||user?._id||'loading'):'guest'}/>;
}
function FittingForm(){
 const {user,token:authToken,isLoggedIn,isRefreshing}=useAuth();
 const accountId=isLoggedIn?String(user?.userID||user?._id||''):'';
 const sessionPending=isRefreshing||Boolean(authToken&&(!isLoggedIn||!accountId));
 const [params]=useSearchParams(),navigate=useNavigate();
 const [attempt,setAttempt]=useState(savedAttempt),attemptRef=useRef(attempt);
 const [date,setDate]=useState(attempt?.date||pragueToday()),[time,setTime]=useState(attempt?.time||'');
 const [edited,setContact]=useState<Partial<{name:string;email:string;phone:string}>>({});
 const profile=isLoggedIn&&!isRefreshing?user:null;
 const contact={name:attempt?.name??edited.name??[profile?.firstName,profile?.lastName].filter(Boolean).join(' '),email:attempt?.email??edited.email??profile?.email??'',phone:attempt?.phone??edited.phone??profile?.primaryPhoneNumber??''};
 const accountBlocked=Boolean(attempt&&(attempt.accountId||'')!==accountId);
 const [slots,setSlots]=useState<Slots|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState(false),[revision,setRevision]=useState(0);
 const busyRef=useRef(false);
 const [errorCode,setErrorCode]=useState('');
 const errorRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(error){errorRef.current?.focus({preventScroll:true});errorRef.current?.scrollIntoView?.({block:'center'});}},[error]);
 const mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 useEffect(()=>{const c=new AbortController();setSlots(null);setLoading(true);setError('');fittingApi<Slots>('/fittings/slots?date='+date,{signal:c.signal}).then(v=>{setSlots(v);setLoading(false);}).catch(e=>{if(!c.signal.aborted){setError(fittingError(e));setLoading(false);}});return()=>c.abort();},[date,revision]);
 async function submit(){
  if(busyRef.current||sessionPending||accountBlocked)return;busyRef.current=true;setBusy(true);setError('');
  try{
   const request=attemptRef.current||{...contact,date,time,accountId,...(getReferralToken()?{referralToken:getReferralToken()}:{}),operationId:crypto.randomUUID(),token:randomToken(),...(params.get('product')?{productId:params.get('product')!}:{})};
   sessionStorage.setItem(STORAGE,JSON.stringify(request));attemptRef.current=request;setAttempt(request);
   const {accountId:requestOwner,...body}=request;
   const result=await fittingApi<Fitting>('/fittings',{method:'POST',body,token:requestOwner?authToken:undefined});
   if(!mounted.current)return;
   sessionStorage.removeItem(STORAGE);
   navigate('/zkouska/'+result.number+'#'+request.token,{replace:true});
  }catch(e){
   if(!mounted.current)return;
   if(e instanceof FittingApiError&&[400,409,404].includes(e.status)){setContact(contact);sessionStorage.removeItem(STORAGE);attemptRef.current=null;setAttempt(null);setTime('');}
   setErrorCode(e instanceof FittingApiError?e.code:'');
   setError(fittingError(e));
  }finally{busyRef.current=false;setBusy(false);}
 }
 return <Page><Content><Title>Rezervovat zkoušku</Title><Copy>30 minut · 200 Kč · jeden zákazník v daném čase</Copy><Copy>Po absolvování zaplacené zkoušky můžete 200 Kč jednou započíst jako zálohu na pronájem oblečení. Zkouška sama o sobě nerezervuje oblečení na termín pronájmu.</Copy>
 {sessionPending?<Copy role="status">Načítáme účet…</Copy>:null}{accountBlocked?<Copy role="alert">Tento zápis patří jiné relaci. Přihlaste se k účtu, ze kterého jste jej odeslali.</Copy>:null}
 {error?<ErrorPanel ref={errorRef} role="alert" tabIndex={-1} aria-labelledby="fitting-error-title"><Heading id="fitting-error-title">{attempt?'Ověřte výsledek odeslání':'Zkoušku se nepodařilo rezervovat'}</Heading><Copy>{error}</Copy><Actions>{!attempt&&errorCode!=='PENDING_FITTING_EXISTS'?<Button variant="secondary" onClick={()=>setRevision(x=>x+1)}>Obnovit nabídku</Button>:null}{isLoggedIn?<RouteLink to="/ucet/rezervace">Moje zkoušky</RouteLink>:null}<RouteLink to="/kontakt">Kontaktovat ANIRAK</RouteLink></Actions></ErrorPanel>:null}
 {attempt?<Panel><Heading>Rozpracovaný zápis</Heading><Copy>{fittingDateLabel(attempt.date)} v {attempt.time}. Nejprve ověřte výsledek předchozího odeslání.</Copy><Button onClick={submit} disabled={busy||sessionPending||accountBlocked}>{busy?'Ověřování…':'Ověřit a pokračovat'}</Button></Panel>:<form onSubmit={e=>{e.preventDefault();void submit();}}><Stack>
 <Panel>{slots?.address?<Copy><strong>{slots.placeName}</strong><br/>{slots.address}</Copy>:null}<Heading><CalendarClock size={22} aria-hidden="true"/> Vyberte termín</Heading><Input label="Datum zkoušky" type="date" min={pragueToday()} max={addCalendarDays(pragueToday(),90)} value={date} disabled={busy} required onChange={e=>{setDate(e.target.value);setTime('');}}/>
 {loading?<Copy role="status">Načítání volných časů…</Copy>:slots?.enabled?<><Copy>Časy jsou uvedené v českém čase. Zápis je možný nejméně 2 hodiny předem, až 90 dní dopředu.</Copy>{slots.slots.length?<Times aria-label="Volné časy">{slots.slots.map(value=><Button key={value} type="button" variant={time===value?'primary':'secondary'} aria-pressed={time===value} disabled={busy} onClick={()=>setTime(value)}>{value}</Button>)}</Times>:<Copy>Na tento den nejsou volné časy. Vyberte jiné datum.</Copy>}</>:slots?<Copy>Termíny zkoušek právě připravujeme. Pro domluvení nás prosím kontaktujte.</Copy>:null}
 </Panel>
 {slots?.enabled?<Panel><Heading>Kontaktní údaje</Heading><Fields><Input label="Jméno a příjmení" autoComplete="name" required minLength={2} maxLength={160} value={contact.name} disabled={busy} onChange={e=>setContact({...contact,name:e.target.value})}/><Input label="E-mail" type="email" autoComplete="email" required maxLength={254} value={contact.email} disabled={busy} onChange={e=>setContact({...contact,email:e.target.value})}/><Input label="Telefon" type="tel" autoComplete="tel" required minLength={5} maxLength={32} value={contact.phone} disabled={busy} onChange={e=>setContact({...contact,phone:e.target.value})}/></Fields><Copy>Použijte stejný e-mail i pro následnou rezervaci oblečení.</Copy><Copy>Po odeslání zaplaťte 200 Kč QR převodem do 60 minut a zvolte „Platba odeslána“. Termín potvrdíme po ověření platby.</Copy><Copy>Odesláním objednáváte placenou zkoušku za 200 Kč. <RouteLink to="/ochrana-osobnich-udaju">Ochrana osobních údajů</RouteLink></Copy>{!time&&!busy&&!loading?<Copy>Pro pokračování vyberte čas zkoušky výše.</Copy>:null}<Button type="submit" disabled={!time||busy||loading||sessionPending}>{busy?'Odesílání…':'Rezervovat a přejít k platbě 200 Kč'}</Button></Panel>:null}
 </Stack></form>}
 <Actions><RouteLink to="/kontakt">Kontakt</RouteLink><RouteLink to="/novinky">Zpět na nabídku</RouteLink></Actions></Content></Page>;
}
export function FittingStatusPage(){
 const {number=''}=useParams(),location=useLocation();
 const {token,isLoggedIn,isRefreshing}=useAuth();
 return <FittingStatus key={number+location.hash+(location.hash?'':isLoggedIn&&!isRefreshing?token:'guest')}/>;
}
function FittingStatus(){
 const {number=''}=useParams(),location=useLocation(),token=location.hash.slice(1);
 const {token:accountToken,isLoggedIn,isRefreshing}=useAuth();
 const endpoint=(token?'/fittings/':'/account/fittings/')+number;
 const accessToken=token||(isLoggedIn&&!isRefreshing?accountToken:'');
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[qr,setQr]=useState(''),[qrError,setQrError]=useState(false),[revision,setRevision]=useState(0),[notice,setNotice]=useState(''),[cancel,setCancel]=useState(false);
 const lock=useRef(false);
 const read=usePublicRead(accessToken&&!busy?endpoint+':'+accessToken+':'+revision:null,signal=>fittingApi<Fitting>(endpoint,{token:accessToken,signal}));
 const data=read.data;
 useEffect(()=>{const timer=window.setInterval(()=>setRevision(x=>x+1),30000);return()=>clearInterval(timer);},[]);
 const payload=data?.paymentInstructions?.qrPayload;
 useEffect(()=>{let active=true;setQr('');setQrError(false);if(payload)import('qrcode').then(({default:QRCode})=>QRCode.toDataURL(payload,{width:520,margin:4})).then(url=>{if(active)setQr(url);}).catch(()=>{if(active)setQrError(true);});return()=>{active=false;};},[payload,revision]);
 async function action(path:string){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await fittingApi<Fitting>(endpoint+'/'+path,{method:'POST',token:accessToken});setRevision(x=>x+1);setCancel(false);}catch(e){setError(fittingError(e));}finally{lock.current=false;setBusy(false);}}
 return <Page><Content><Title>Vaše zkouška</Title>{!accessToken?<Panel><Copy>Pro otevření zkoušky se přihlaste ke svému účtu nebo použijte celý soukromý odkaz.</Copy><RouteLink to="/ucet">Přihlásit se</RouteLink></Panel>:null}{error||read.error?<Panel role="alert"><Copy>{error||fittingError(read.error)}</Copy><Button onClick={()=>setRevision(x=>x+1)}>Obnovit stav</Button></Panel>:null}{data?<>
 <Panel><Heading>{fittingDateLabel(data.date)} · {data.time}</Heading><Copy>30 minut · {data.number}</Copy><strong>{fittingStatusLabels[data.status]}</strong><Copy>Adresa: {data.address}</Copy>{data.product?<Copy>Vybraný produkt: {data.product.name}</Copy>:null}</Panel>
 {data.paymentInstructions?<Panel><Heading>Zaplaťte 200 Kč QR převodem</Heading>{qr?<QR src={qr} alt="QR platba za zkoušku 200 Kč"/>:qrError?<Copy>QR kód se nepodařilo načíst. Použijte údaje k převodu níže.</Copy>:<Copy role="status">Vytváření QR kódu…</Copy>}<Copy>Účet: <strong>{data.paymentInstructions.accountNumber}</strong><br/>Částka: <strong>200 Kč</strong><br/>Zpráva pro příjemce: <strong>{data.number}</strong></Copy><Copy>Platbu odešlete a nahlaste do {new Intl.DateTimeFormat('cs-CZ',{timeZone:'Europe/Prague',hour:'2-digit',minute:'2-digit'}).format(new Date(data.expiresAt))}. Jinak se čas uvolní.</Copy><Button disabled={busy} onClick={()=>action('payment-sent')}>Platba odeslána</Button><Copy>Tlačítko pouze nahlásí převod. Přijetí platby ověří administrátor.</Copy></Panel>:null}
 {data.status==='review'?<Panel><Heading>Ověřujeme vaši platbu</Heading><Copy>Termín pro vás držíme. Po ověření převodu se zde zobrazí potvrzení. Stav můžete kdykoli obnovit.</Copy></Panel>:null}
 {data.status==='confirmed'?<Panel><Heading>Těšíme se na vás</Heading><Copy>Platba 200 Kč byla potvrzena. Pokud si oblečení pronajmete, částku započteme do ceny. Doplatek na místě můžete uhradit hotově nebo kartou.</Copy></Panel>:null}
 {['expired','cancelled'].includes(data.status)?<Panel><Copy>Zápis již není aktivní. Pokud jste odeslali platbu, kontaktujte nás s číslem {data.number}, abychom ji mohli dohledat a domluvit další postup.</Copy>{data.paymentStatus==='refunded'?<Copy>Vrácení platby bylo zaznamenáno.</Copy>:null}<RouteLink to="/kontakt">Kontakt</RouteLink></Panel>:null}
 {data.status==='completed'&&data.paymentStatus==='paid'?<Panel><Copy>Zkouška proběhla. Při rezervaci oblečení můžete zaplacených 200 Kč jednou započíst jako zálohu. Pokud už rezervaci máte, kontaktujte nás a platbu prověříme ručně.</Copy><RouteLink to={token?'/saty#fitting='+number+'&token='+token:'/saty'}>Vybrat šaty a započíst 200 Kč</RouteLink></Panel>:null}
 {!isLoggedIn&&token?<Panel><Heading>Uschovejte si soukromý odkaz</Heading><Copy>{token?'Potvrzení sledujte na této stránce. Odkaz umožňuje spravovat váš zápis; nesdílejte ho s dalšími osobami.':'Tato zkouška je dostupná po přihlášení k vašemu účtu.'}</Copy><Input label="Soukromý odkaz na zkoušku" readOnly value={window.location.href} onFocus={e=>e.currentTarget.select()}/><Actions><Button variant="secondary" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);setNotice('Odkaz byl zkopírován.');}catch{setNotice('Odkaz vyberte a zkopírujte z pole výše.');}}}>Kopírovat odkaz</Button><Button variant="secondary" disabled={busy} onClick={()=>setRevision(x=>x+1)}>Obnovit stav</Button></Actions>{notice?<Copy role="status">{notice}</Copy>:null}</Panel>:null}
 <Actions>{['pending','review','confirmed'].includes(data.status)?<Button variant="ghost" disabled={busy} onClick={()=>setCancel(true)}>Zrušit zkoušku</Button>:null}</Actions>
 {token?<FittingAccountClaim number={number} privateToken={token}/>:null}
 </>:!error&&!read.error&&accessToken?<Copy role="status">Načítání zápisu…</Copy>:null}
 <Dialog open={cancel} title="Zrušit zkoušku?" description="Termín se uvolní pro další zákazníky. Pokud jste již zaplatili, další postup vyřešíme individuálně. Zrušení samo nevrací peníze." onEscape={()=>!busy&&setCancel(false)}><Actions><Button disabled={busy} onClick={()=>setCancel(false)}>Ponechat termín</Button><Button variant="secondary" disabled={busy} onClick={()=>action('cancel')}>Zrušit zkoušku</Button></Actions></Dialog>
 </Content></Page>;
}
