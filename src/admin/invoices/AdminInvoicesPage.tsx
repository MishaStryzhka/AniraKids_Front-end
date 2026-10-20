import {invoiceAutomationMessage} from './automationStatus';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Plus,RefreshCw,Search,SlidersHorizontal} from 'lucide-react';
import styled from 'styled-components';
import {useAuth} from '../../hooks/useAuth';
import {useAdminAccess} from '../auth/AdminAccessBoundary';
import {adminApiClient,buildAdminRequestConfig} from '../api/client';
import {normalizeAdminApiError} from '../api/errors';
import {fittingAdmin} from '../../fittings/fittingApi';
import {Button} from '../../design-system/components/Button';
import {IconButton} from '../../design-system/components/IconButton';
import {Input} from '../../design-system/components/Input';
import {SelectField} from '../../design-system/components/SelectField';
import {Dialog} from '../../design-system/components/Dialog';
import {Panel,Stack,Heading,Copy,Actions} from '../../storefront/storefrontStyles';
import {formatCalendarMonth,isDateOnly,pragueToday} from '../calendar/calendarDates';
import {useAdminPageAction,useAdminPageTitleAction} from '../layout/AdminLayout';
import {CountButton,FilterCount,ListToolbar} from '../bookings/listToolbar';
const Page=styled.div`display:grid;gap:24px;min-width:0;overflow-wrap:anywhere;`;
const Controls=styled.div`display:grid;gap:16px;&[hidden]{display:none;}`;
const PeriodToggle=styled.label`display:flex;align-items:center;gap:8px;min-height:44px;`;
const ExportRow=styled.div`display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;min-width:0;>button{margin-inline-start:auto;}`;
const normalizeSearch=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs-CZ');
interface Snapshot {buyer:{name:string;address:string;ico:string;email:string};lines:{description:string;amount:number}[];total:number;paid:number;balance:number;deposit:number;serviceDate:string;originalNumber?:string;}
interface Invoice {_id:string;number:string;sourceNumber:string;sourceType:string;issuedAt:string;snapshot:Snapshot;email?:{status:string;attemptedAt?:string};automatic?:boolean;}
interface Preview {fingerprint:string;snapshot:Snapshot;}
const money=(n:number)=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK'}).format(n);
const errors:Record<string,string>={INVOICE_AUTOMATION_NOT_ELIGIBLE:'Není potvrzena platba za platnou službu. Samotná vratná kauce nestačí.',INVOICE_CUSTOMER_INCOMPLETE:'U rezervace chybí jméno nebo platný e-mail klienta.',INVOICE_EMAIL_CHANGED:'Stav odesílání se změnil. Obnovte přehled.',INVOICE_EMAIL_IN_PROGRESS:'Odesílání ještě může probíhat. Vyčkejte deset minut a obnovte přehled.',INVOICE_PDF_FAILED:'PDF se nepodařilo připravit. Zkuste odeslání znovu.',INVOICE_SOURCE_NOT_FOUND:'Zkouška nebo rezervace nebyla nalezena.',INVOICE_SERVICE_NOT_COMPLETED:'Fakturu lze vystavit po proběhlé zkoušce nebo vrácení pronajatých šatů.',INVOICE_PAYMENTS_UNRECONCILED:'Nejdříve je nutné doplnit evidenci starších plateb.',INVOICE_PREVIEW_CHANGED:'Údaje se změnily. Načtěte nový náhled.',INVOICE_TOTAL_MISMATCH:'Součet položek nesouhlasí s cenou rezervace. Opravte evidenci před vystavením.',INVOICE_EMAIL_ALREADY_ATTEMPTED:'Odeslání již bylo zahájeno. Ověřte doručení; opakované odeslání je blokováno.',INVOICE_EMAIL_UNCERTAIN:'Doručení se nepodařilo potvrdit. Ověřte jej v e-mailu. PDF můžete stáhnout.',VALIDATION_ERROR:'Zkontrolujte číslo, jméno, adresu a případné osmimístné IČO.',INVOICE_PERIOD_TOO_LARGE:'Vyberte kratší období.'};
export function AdminInvoicesPage(){
 const {token}=useAuth(),{handleRequestError}=useAdminAccess();
 const [creating,setCreating]=useState(false),[searchOpen,setSearchOpen]=useState(false),[filtersOpen,setFiltersOpen]=useState(false),[search,setSearch]=useState('');
 const searchInput=useRef<HTMLInputElement>(null);
 const toolbarRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(searchOpen)searchInput.current?.focus();},[searchOpen]);
 const [period,setPeriod]=useState(pragueToday().slice(0,7)),[annual,setAnnual]=useState(false),[items,setItems]=useState<Invoice[]>([]),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[reload,setReload]=useState(0);
 const [pending,setPending]=useState<Array<{type:string;number:string;errorCode:string|null}>>([]),[autoIntent,setAutoIntent]=useState<{type:string;number:string}|null>(null);
 const [type,setType]=useState('fitting'),[number,setNumber]=useState(''),[buyerName,setName]=useState(''),[buyerAddress,setAddress]=useState(''),[buyerIco,setIco]=useState(''),[preview,setPreview]=useState<Preview|null>(null);
 const [intent,setIntent]=useState<{action:'send'|'correct';item:Invoice}|null>(null),[reason,setReason]=useState('');const lock=useRef(false);
 const selectedPeriod=annual?period.slice(0,4):period;
 const query=normalizeSearch(search.trim());
 const newestFirst=useMemo(()=>[...items].sort((a,b)=>Date.parse(b.issuedAt)-Date.parse(a.issuedAt)||b.number.localeCompare(a.number,'cs-CZ',{numeric:true})),[items]);
 const visibleItems=query?newestFirst.filter(i=>normalizeSearch([i.number,i.sourceNumber,i.snapshot.buyer.name,i.snapshot.buyer.email,i.snapshot.buyer.ico].join(' ')).includes(query)):newestFirst;
 const filterCount=Number(annual||period!==pragueToday().slice(0,7));
 const toolbar=useMemo(()=><ListToolbar ref={toolbarRef}>
  <IconButton aria-label="Hledat faktury" title="Hledat faktury" aria-expanded={searchOpen} aria-controls="invoice-search" icon={<Search aria-hidden="true"/>} onClick={()=>setSearchOpen(v=>!v)}/>
  <CountButton aria-label={filterCount?`Filtry (${filterCount})`:'Filtry'} title="Filtry" aria-expanded={filtersOpen} aria-controls="invoice-filters" icon={<><SlidersHorizontal aria-hidden="true"/>{filterCount?<FilterCount>{filterCount}</FilterCount>:null}</>} onClick={()=>setFiltersOpen(v=>!v)}/>
  <Button data-invoice-create variant="secondary" disabled={busy} onClick={()=>{setError('');setCreating(true);}}><Plus size={20} aria-hidden="true"/> Nová faktura</Button>
 </ListToolbar>,[searchOpen,filtersOpen,filterCount,busy]);
 const refreshAction=useMemo(()=><IconButton aria-label="Obnovit faktury" title="Obnovit faktury" disabled={busy} loading={loading} icon={<RefreshCw aria-hidden="true"/>} onClick={()=>setReload(v=>v+1)}/>,[busy,loading]);
 useAdminPageAction(toolbar);
 useAdminPageTitleAction(refreshAction);
 const fail=useCallback((e:unknown)=>{if(!handleRequestError(e))setError(errors[(e as {code?:string})?.code||'']||'Výsledek se nepodařilo ověřit. Obnovte přehled před další akcí.');},[handleRequestError]);
 useEffect(()=>{const c=new AbortController();setLoading(true);setItems([]);Promise.all([fittingAdmin<{items:Invoice[]}>(token??'',`/admin/invoices?period=${selectedPeriod}`,undefined,c.signal),fittingAdmin<{items:Array<{type:string;number:string;errorCode:string|null}>}>(token??'','/admin/invoices/pending',undefined,c.signal)]).then(([v,q])=>{if(!c.signal.aborted){setItems(v.items);setPending(q.items);}}).catch(e=>{if(!c.signal.aborted)fail(e);}).finally(()=>{if(!c.signal.aborted)setLoading(false);});return()=>c.abort();},[token,selectedPeriod,reload,fail]);
 async function run(work:()=>Promise<void>){if(lock.current)return;lock.current=true;setBusy(true);setError('');setMessage('');try{await work();}catch(e){fail(e);}finally{lock.current=false;setBusy(false);}}
 const input={type,number,buyerName,buyerAddress,buyerIco};
 async function download(url:string,name:string){try{const response=await adminApiClient.get(url,{...buildAdminRequestConfig(token??''),responseType:'blob'});const href=URL.createObjectURL(response.data),a=document.createElement('a');a.href=href;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);}catch(e){throw normalizeAdminApiError(e);}}
 return <Page data-admin-invoices-page>
 <Copy>GlamGarb Rentals s.r.o. · Nejsme plátci DPH. Po potvrzení platby za zkoušku nebo první platby nájemného se faktura vystaví a odešle automaticky. Částečná úhrada je na faktuře oddělena od zbývající ceny. Vratná kauce není cenou služby.</Copy>
 {error?<Copy role="alert">{error}</Copy>:null}{message?<Copy role="status">{message}</Copy>:null}
 {pending.length?<Panel><Stack><Heading>Nedokončené automatické faktury</Heading>{pending.map(p=><div key={p.type+p.number}><Copy>{p.number} · {p.errorCode?(errors[p.errorCode]||'Vystavení se nepodařilo dokončit.'):'Čeká na dokončení.'}</Copy><Button disabled={busy} variant="secondary" onClick={()=>setAutoIntent({type:p.type,number:p.number})}>Dokončit a odeslat {p.number}</Button></div>)}</Stack></Panel>:null}
 <Dialog open={creating&&!autoIntent} title="Nová faktura" onEscape={()=>!busy&&setCreating(false)}><Stack>
 {error?<Copy role="alert">{error}</Copy>:null}
 <SelectField label="Služba" value={type} disabled={busy} onChange={e=>{setType(e.target.value);setPreview(null);}}><option value="fitting">Zkouška – 200 Kč</option><option value="reservation">Pronájem šatů</option></SelectField>
 <Input label="Číslo zkoušky / rezervace" value={number} maxLength={80} disabled={busy} onChange={e=>{setNumber(e.target.value);setPreview(null);}}/>
 <Copy>Pro dříve potvrzenou platbu lze fakturu doplnit z kontaktních údajů rezervace. Existující doklad se nevystaví podruhé.</Copy>
 <Button variant="secondary" disabled={busy||!number.trim()} onClick={()=>setAutoIntent({type,number:number.trim()})}>Vystavit a odeslat z přijaté platby</Button>
 <Copy>Ruční vystavení po poskytnutí služby, například s firemními fakturačními údaji:</Copy>
 <Input label="Jméno nebo firma odběratele" value={buyerName} maxLength={200} disabled={busy} onChange={e=>{setName(e.target.value);setPreview(null);}}/>
 <Input label="Adresa odběratele" value={buyerAddress} maxLength={400} disabled={busy} onChange={e=>{setAddress(e.target.value);setPreview(null);}}/>
 <Input label="IČO odběratele (volitelné)" value={buyerIco} maxLength={8} disabled={busy} onChange={e=>{setIco(e.target.value);setPreview(null);}}/>
 <Button disabled={busy||!number.trim()||!buyerName.trim()||!buyerAddress.trim()} onClick={()=>run(async()=>{setPreview(await fittingAdmin<Preview>(token??'','/admin/invoices/preview',input));})}>Zkontrolovat náhled</Button>
 {preview?<Panel><Stack><Heading>Náhled před vystavením</Heading><Copy>{preview.snapshot.buyer.name} · {preview.snapshot.buyer.address}</Copy><Copy>E-mail z rezervace: {preview.snapshot.buyer.email}</Copy><Copy>Datum služby: {preview.snapshot.serviceDate}</Copy>{preview.snapshot.lines.map((l,i)=><Copy key={i}>{l.description}: {money(l.amount)}</Copy>)}<strong>Celkem {money(preview.snapshot.total)}</strong><Copy>Uhrazeno {money(preview.snapshot.paid)} · Zbývá {money(preview.snapshot.balance)}</Copy><Copy>Vratná kauce zvlášť: {money(preview.snapshot.deposit)}</Copy><Copy>Po vystavení se údaje na faktuře nemění. E-mail se odešle až samostatným potvrzením.</Copy><Button disabled={busy} onClick={()=>run(async()=>{const v=await fittingAdmin<{invoice:Invoice}>(token??'','/admin/invoices',{...input,fingerprint:preview.fingerprint});setMessage(`Faktura ${v.invoice.number} je vystavena.`);setPreview(null);setCreating(false);setNumber('');setName('');setAddress('');setIco('');setSearch('');setAnnual(false);setPeriod(pragueToday().slice(0,7));setReload(x=>x+1);})}>Vystavit fakturu</Button></Stack></Panel>:null}
 <Button variant="secondary" disabled={busy} onClick={()=>setCreating(false)}>Zavřít</Button>
 </Stack></Dialog>
 <Controls id="invoice-search" hidden={!searchOpen}><Input ref={searchInput} label="Hledat fakturu" placeholder="Číslo faktury, rezervace, jméno nebo e-mail" maxLength={200} value={search} onChange={e=>setSearch(e.target.value)}/><Copy>Hledání v právě vybraném období.</Copy>{search?<Button variant="secondary" onClick={()=>setSearch('')}>Vymazat hledání</Button>:null}</Controls>
 <Controls id="invoice-filters" hidden={!filtersOpen}><Actions><Input label="Měsíc vystavení" type="month" value={period} disabled={busy} onChange={e=>{if(isDateOnly(e.target.value+'-01'))setPeriod(e.target.value);}}/><PeriodToggle><input type="checkbox" checked={annual} disabled={busy} onChange={e=>setAnnual(e.target.checked)}/> Celý rok</PeriodToggle><Button variant="secondary" disabled={busy} onClick={()=>{setPeriod(pragueToday().slice(0,7));setAnnual(false);}}>Aktuální měsíc</Button></Actions></Controls>
 <ExportRow><Copy>Období: {annual?period.slice(0,4):formatCalendarMonth(period)}</Copy><Button disabled={busy||loading} variant="secondary" onClick={()=>run(()=>download(`/admin/invoices/export?period=${selectedPeriod}`,`faktury-${selectedPeriod}.zip`))}>Export pro účetní (ZIP)</Button></ExportRow>
 {!loading&&items.length>0&&!visibleItems.length?<Copy>Žádné faktury neodpovídají hledání v tomto období.</Copy>:null}
 {loading?<Copy role="status">Načítání faktur…</Copy>:!items.length?<Copy>V tomto období nejsou vystavené faktury.</Copy>:null}
 {visibleItems.map(i=><Panel key={i._id}><Stack><Heading>{i.sourceType==='correction'?'Opravný doklad':'Faktura'} {i.number}</Heading><Copy>{i.snapshot.buyer.name} · {i.sourceNumber}</Copy><strong>{money(i.snapshot.total)}</strong><Copy>Stav při vystavení: uhrazeno {money(i.snapshot.paid)}, zbývalo {money(i.snapshot.balance)}.</Copy><Copy>E-mail: {i.email?.status==='sent'?'odesláno':i.email?.status==='sending'?'odesílání zahájeno':i.email?.status==='failed'?'doručení neověřeno':'čeká na odeslání'}</Copy>{i.automatic?<Copy>Vystaveno automaticky po potvrzení platby.</Copy>:null}<Actions><Button variant="secondary" disabled={busy} onClick={()=>run(()=>download(`/admin/invoices/${i._id}/pdf`,`${i.number}.pdf`))}>Stáhnout PDF</Button><Button variant="secondary" disabled={busy||(i.email?.status==='sending'&&(!i.email.attemptedAt||Date.now()-Date.parse(i.email.attemptedAt)<600000))} onClick={()=>setIntent({action:'send',item:i})}>{i.email?.attemptedAt?'Znovu odeslat zákazníkovi':'Odeslat zákazníkovi'}</Button>{i.sourceType!=='correction'&&!items.some(c=>c.snapshot.originalNumber===i.number)?<Button variant="secondary" disabled={busy} onClick={()=>{setReason('');setIntent({action:'correct',item:i});}}>Vystavit plné storno</Button>:null}</Actions></Stack></Panel>)}
 <Dialog open={!!intent} title={intent?.action==='send'?'Odeslat fakturu':'Plné storno faktury'} onEscape={()=>!busy&&setIntent(null)}><Stack>{error?<Copy role="alert">{error}</Copy>:null}<Copy>{intent?.item.number}</Copy>{intent?.action==='send'?<><Copy>Odeslat PDF na {intent.item.snapshot.buyer.email}?</Copy>{intent.item.email?.attemptedAt?<Copy>Předchozí pokus již mohl být doručen. Ověřte jej před opakováním; klient může dostat další kopii stejné faktury.</Copy>:null}</>:<><Copy>Vystaví se samostatný opravný doklad na celou částku. Původní faktura zůstane zachována. Peníze se nevracejí automaticky; případnou vratku zaznamenejte zvlášť v platbách.</Copy><Input label="Důvod storna" value={reason} maxLength={500} onChange={e=>setReason(e.target.value)}/></>}
 <Actions><Button disabled={busy||(intent?.action==='correct'&&reason.trim().length<5)} onClick={()=>run(async()=>{if(!intent)return;const result=await fittingAdmin<{sent?:boolean}>(token??'',`/admin/invoices/${intent.item._id}/${intent.action}`,intent.action==='send'?(intent.item.email?.attemptedAt?{retry:true,expectedAttemptedAt:intent.item.email.attemptedAt}:{}):{reason});setMessage(intent.action==='send'?(result.sent?'Faktura byla předána k odeslání.':'Odeslání nebylo potvrzeno. Zkontrolujte stav e-mailu v přehledu.'):'Opravný doklad byl vystaven.');setIntent(null);setReload(x=>x+1);})}>Potvrdit</Button><Button disabled={busy} variant="secondary" onClick={()=>setIntent(null)}>Zpět</Button></Actions></Stack></Dialog>
 <Dialog open={!!autoIntent} resolveRestoreFocus={previous=>previous?.isConnected&&previous!==document.body?previous:toolbarRef.current?.querySelector<HTMLButtonElement>('[data-invoice-create]')??null} title="Faktura z přijaté platby" onEscape={()=>!busy&&setAutoIntent(null)}><Stack>{error?<Copy role="alert">{error}</Copy>:null}<Copy>{autoIntent?.number}</Copy><Copy>Faktura se vystaví z kontaktních údajů rezervace a odešle na e-mail klienta. U částečné platby bude uvedena celá cena služby, uhrazená část a zbývající částka. Kauce zůstává samostatně.</Copy><Actions><Button disabled={busy} onClick={()=>run(async()=>{if(!autoIntent)return;const result=await fittingAdmin(token??'','/admin/invoices/process',autoIntent);setMessage(invoiceAutomationMessage(result));setAutoIntent(null);setCreating(false);setPreview(null);setSearch('');setAnnual(false);setPeriod(pragueToday().slice(0,7));setReload(v=>v+1);})}>Potvrdit vystavení a odeslání</Button><Button variant="secondary" disabled={busy} onClick={()=>setAutoIntent(null)}>Zpět</Button></Actions></Stack></Dialog>
 </Page>;
}
