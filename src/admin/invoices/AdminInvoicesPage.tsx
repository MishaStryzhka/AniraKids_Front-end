import {useCallback,useEffect,useRef,useState} from 'react';
import styled from 'styled-components';
import {useAuth} from '../../hooks/useAuth';
import {useAdminAccess} from '../auth/AdminAccessBoundary';
import {adminApiClient,buildAdminRequestConfig} from '../api/client';
import {normalizeAdminApiError} from '../api/errors';
import {fittingAdmin} from '../../fittings/fittingApi';
import {Button} from '../../design-system/components/Button';
import {Input} from '../../design-system/components/Input';
import {SelectField} from '../../design-system/components/SelectField';
import {Dialog} from '../../design-system/components/Dialog';
import {Panel,Stack,Heading,Copy,Actions} from '../../storefront/storefrontStyles';
import {pragueToday} from '../calendar/calendarDates';
const Page=styled.div`display:grid;gap:24px;min-width:0;overflow-wrap:anywhere;`;
interface Snapshot {buyer:{name:string;address:string;ico:string;email:string};lines:{description:string;amount:number}[];total:number;paid:number;balance:number;deposit:number;serviceDate:string;originalNumber?:string;}
interface Invoice {_id:string;number:string;sourceNumber:string;sourceType:string;issuedAt:string;snapshot:Snapshot;email?:{status:string};}
interface Preview {fingerprint:string;snapshot:Snapshot;}
const money=(n:number)=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK'}).format(n);
const errors:Record<string,string>={INVOICE_SOURCE_NOT_FOUND:'Zkouška nebo rezervace nebyla nalezena.',INVOICE_SERVICE_NOT_COMPLETED:'Fakturu lze vystavit po proběhlé zkoušce nebo vrácení pronajatých šatů.',INVOICE_PAYMENTS_UNRECONCILED:'Nejdříve je nutné doplnit evidenci starších plateb.',INVOICE_PREVIEW_CHANGED:'Údaje se změnily. Načtěte nový náhled.',INVOICE_TOTAL_MISMATCH:'Součet položek nesouhlasí s cenou rezervace. Opravte evidenci před vystavením.',INVOICE_EMAIL_ALREADY_ATTEMPTED:'Odeslání již bylo zahájeno. Ověřte doručení; opakované odeslání je blokováno.',INVOICE_EMAIL_UNCERTAIN:'Doručení se nepodařilo potvrdit. Ověřte jej v e-mailu. PDF můžete stáhnout.',VALIDATION_ERROR:'Zkontrolujte číslo, jméno, adresu a případné osmimístné IČO.',INVOICE_PERIOD_TOO_LARGE:'Vyberte kratší období.'};
export function AdminInvoicesPage(){
 const {token}=useAuth(),{handleRequestError}=useAdminAccess();
 const [period,setPeriod]=useState(pragueToday().slice(0,7)),[annual,setAnnual]=useState(false),[items,setItems]=useState<Invoice[]>([]),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[reload,setReload]=useState(0);
 const [type,setType]=useState('fitting'),[number,setNumber]=useState(''),[buyerName,setName]=useState(''),[buyerAddress,setAddress]=useState(''),[buyerIco,setIco]=useState(''),[preview,setPreview]=useState<Preview|null>(null);
 const [intent,setIntent]=useState<{action:'send'|'correct';item:Invoice}|null>(null),[reason,setReason]=useState('');const lock=useRef(false);
 const selectedPeriod=annual?period.slice(0,4):period;
 const fail=useCallback((e:unknown)=>{if(!handleRequestError(e))setError(errors[(e as {code?:string})?.code||'']||'Výsledek se nepodařilo ověřit. Obnovte přehled před další akcí.');},[handleRequestError]);
 useEffect(()=>{const c=new AbortController();setLoading(true);setItems([]);fittingAdmin<{items:Invoice[]}>(token??'',`/admin/invoices?period=${selectedPeriod}`,undefined,c.signal).then(v=>{if(!c.signal.aborted)setItems(v.items);}).catch(e=>{if(!c.signal.aborted)fail(e);}).finally(()=>{if(!c.signal.aborted)setLoading(false);});return()=>c.abort();},[token,selectedPeriod,reload,fail]);
 async function run(work:()=>Promise<void>){if(lock.current)return;lock.current=true;setBusy(true);setError('');setMessage('');try{await work();}catch(e){fail(e);}finally{lock.current=false;setBusy(false);}}
 const input={type,number,buyerName,buyerAddress,buyerIco};
 async function download(url:string,name:string){try{const response=await adminApiClient.get(url,{...buildAdminRequestConfig(token??''),responseType:'blob'});const href=URL.createObjectURL(response.data),a=document.createElement('a');a.href=href;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);}catch(e){throw normalizeAdminApiError(e);}}
 return <Page>
 <Copy>GlamGarb Rentals s.r.o. · Nejsme plátci DPH. Faktury vystavujte po poskytnutí služby. Přijaté zálohy a vratná kauce se evidují v platbách.</Copy>
 {error?<Copy role="alert">{error}</Copy>:null}{message?<Copy role="status">{message}</Copy>:null}
 <Panel><Stack><Heading>Nová faktura</Heading><SelectField label="Služba" value={type} disabled={busy} onChange={e=>{setType(e.target.value);setPreview(null);}}><option value="fitting">Zkouška – 200 Kč</option><option value="reservation">Pronájem šatů</option></SelectField>
 <Input label="Číslo zkoušky / rezervace" value={number} maxLength={80} disabled={busy} onChange={e=>{setNumber(e.target.value);setPreview(null);}}/>
 <Input label="Jméno nebo firma odběratele" value={buyerName} maxLength={200} disabled={busy} onChange={e=>{setName(e.target.value);setPreview(null);}}/>
 <Input label="Adresa odběratele" value={buyerAddress} maxLength={400} disabled={busy} onChange={e=>{setAddress(e.target.value);setPreview(null);}}/>
 <Input label="IČO odběratele (volitelné)" value={buyerIco} maxLength={8} disabled={busy} onChange={e=>{setIco(e.target.value);setPreview(null);}}/>
 <Button disabled={busy||!number.trim()||!buyerName.trim()||!buyerAddress.trim()} onClick={()=>run(async()=>{setPreview(await fittingAdmin<Preview>(token??'','/admin/invoices/preview',input));})}>Zkontrolovat náhled</Button>
 {preview?<Panel><Stack><Heading>Náhled před vystavením</Heading><Copy>{preview.snapshot.buyer.name} · {preview.snapshot.buyer.address}</Copy><Copy>E-mail z rezervace: {preview.snapshot.buyer.email}</Copy><Copy>Datum služby: {preview.snapshot.serviceDate}</Copy>{preview.snapshot.lines.map((l,i)=><Copy key={i}>{l.description}: {money(l.amount)}</Copy>)}<strong>Celkem {money(preview.snapshot.total)}</strong><Copy>Uhrazeno {money(preview.snapshot.paid)} · Zbývá {money(preview.snapshot.balance)}</Copy><Copy>Vratná kauce zvlášť: {money(preview.snapshot.deposit)}</Copy><Copy>Po vystavení se údaje na faktuře nemění. E-mail se odešle až samostatným potvrzením.</Copy><Button disabled={busy} onClick={()=>run(async()=>{const v=await fittingAdmin<{invoice:Invoice}>(token??'','/admin/invoices',{...input,fingerprint:preview.fingerprint});setMessage(`Faktura ${v.invoice.number} je vystavena.`);setPreview(null);setPeriod(pragueToday().slice(0,7));setReload(x=>x+1);})}>Vystavit fakturu</Button></Stack></Panel>:null}
 </Stack></Panel>
 <Actions><Input label="Měsíc vystavení" type="month" value={period} disabled={busy} onChange={e=>{if(e.target.value)setPeriod(e.target.value);}}/><label><input type="checkbox" checked={annual} disabled={busy} onChange={e=>setAnnual(e.target.checked)}/> Celý rok</label><Button disabled={busy||loading} variant="secondary" onClick={()=>run(()=>download(`/admin/invoices/export?period=${selectedPeriod}`,`faktury-${selectedPeriod}.zip`))}>Export pro účetní (ZIP)</Button><Button disabled={busy} variant="secondary" onClick={()=>setReload(x=>x+1)}>Obnovit</Button></Actions>
 {loading?<Copy role="status">Načítání faktur…</Copy>:!items.length?<Copy>V tomto období nejsou vystavené faktury.</Copy>:null}
 {items.map(i=><Panel key={i._id}><Stack><Heading>{i.sourceType==='correction'?'Opravný doklad':'Faktura'} {i.number}</Heading><Copy>{i.snapshot.buyer.name} · {i.sourceNumber}</Copy><strong>{money(i.snapshot.total)}</strong><Copy>Stav při vystavení: uhrazeno {money(i.snapshot.paid)}, zbývalo {money(i.snapshot.balance)}.</Copy>{i.email?<Copy>E-mail: {i.email.status==='sent'?'odesláno':i.email.status==='sending'?'odesílání zahájeno':'doručení neověřeno'}</Copy>:null}<Actions><Button variant="secondary" disabled={busy} onClick={()=>run(()=>download(`/admin/invoices/${i._id}/pdf`,`${i.number}.pdf`))}>Stáhnout PDF</Button><Button variant="secondary" disabled={busy||!!i.email} onClick={()=>setIntent({action:'send',item:i})}>Odeslat zákazníkovi</Button>{i.sourceType!=='correction'&&!items.some(c=>c.snapshot.originalNumber===i.number)?<Button variant="secondary" disabled={busy} onClick={()=>{setReason('');setIntent({action:'correct',item:i});}}>Vystavit plné storno</Button>:null}</Actions></Stack></Panel>)}
 <Dialog open={!!intent} title={intent?.action==='send'?'Odeslat fakturu':'Plné storno faktury'} onEscape={()=>!busy&&setIntent(null)}><Stack>{error?<Copy role="alert">{error}</Copy>:null}<Copy>{intent?.item.number}</Copy>{intent?.action==='send'?<Copy>Odeslat PDF na {intent.item.snapshot.buyer.email}?</Copy>:<><Copy>Vystaví se samostatný opravný doklad na celou částku. Původní faktura zůstane zachována. Peníze se nevracejí automaticky; případnou vratku zaznamenejte zvlášť v platbách.</Copy><Input label="Důvod storna" value={reason} maxLength={500} onChange={e=>setReason(e.target.value)}/></>}
 <Actions><Button disabled={busy||(intent?.action==='correct'&&reason.trim().length<5)} onClick={()=>run(async()=>{if(!intent)return;await fittingAdmin(token??'',`/admin/invoices/${intent.item._id}/${intent.action}`,intent.action==='send'?{}:{reason});setMessage(intent.action==='send'?'Faktura byla předána k odeslání.':'Opravný doklad byl vystaven.');setIntent(null);setReload(x=>x+1);})}>Potvrdit</Button><Button disabled={busy} variant="secondary" onClick={()=>setIntent(null)}>Zpět</Button></Actions></Stack></Dialog>
 </Page>;
}
