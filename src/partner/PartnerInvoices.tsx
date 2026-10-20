import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../design-system/components/Button';
import { Input } from '../design-system/components/Input';
import { ReservationCard as Card, ReservationCardRow as Row } from '../components/reservations/reservationCardStyles';
import { partnerApi, downloadPartnerInvoice } from './api';

const Fields = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin:16px 0;label{display:grid;gap:6px;}`;
const money = (n:number) => new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK'}).format(n);
const todayMonth = () => new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Prague'}).format(new Date()).slice(0,7);
const defaults = () => ({revision:0,enabled:false,name:'',address:'',ico:'',register:'',vatPayer:false,dic:'',vatRate:0,iban:'',accountNumber:'',recipientEmail:'',prefix:'BLAZE',startPeriod:todayMonth(),consentConfirmed:false});
const labels:Record<string,string>={name:'Obchodní název dodavatele Blaze',address:'Sídlo dodavatele',ico:'IČO dodavatele',register:'Údaj o zápisu v rejstříku',dic:'DIČ',iban:'IBAN (CZ)',accountNumber:'Číslo účtu',recipientEmail:'E-mail odběratele ANIRAK',prefix:'Řada faktur',startPeriod:'První účtované období'};
const statuses:Record<string,string>={pending:'Čeká na odeslání',sending:'Odesílání — doručení zatím neověřeno',sent:'Odesláno',failed:'Doručení není potvrzeno',not_applicable:'Bez e-mailu'};
export function PartnerInvoices({token}:{token:string}){
 const [data,setData]=useState<any>(null),[form,setForm]=useState<any>(defaults),[vat,setVat]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[period,setPeriod]=useState('');
 const load=useCallback(async()=>{const d=await partnerApi('billing',token);setData(d);if(d.settings?.name){const clean:any=defaults();for(const k of Object.keys(clean))if(d.settings[k]!==undefined)clean[k]=d.settings[k];setForm(clean);setVat(d.settings.vatPayer?'yes':'no');}},[token]);
 useEffect(()=>{let active=true;partnerApi('billing',token).then(d=>{if(!active)return;setData(d);if(d.settings?.name){const clean:any=defaults();for(const k of Object.keys(clean))if(d.settings[k]!==undefined)clean[k]=d.settings[k];setForm(clean);setVat(d.settings.vatPayer?'yes':'no');}}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[token]);
 const act=async(fn:()=>Promise<unknown>)=>{setBusy(true);setError('');try{await fn();await load();}catch(e){setError(e instanceof Error?e.message:'Operace selhala.');}finally{setBusy(false);}};
 return <Card>
  <h2>Měsíční faktury Blaze → ANIRAK</h2>
  <p>Vyúčtování odměn za kalendářní měsíc. Datum vystavení: poslední den ve 23:59 (Praha), dokončení po půlnoci. Splatnost 14 dní. Jeden e-mail s PDF a rozpisem. Kauce ani převzaté peníze klientů se nefakturují.</p>
  {error&&<p role="alert">{error}</p>}
  {!data?<Button variant="secondary" disabled={busy} onClick={()=>act(load)}>Načíst faktury</Button>:<>
   <p><strong>{data.settings?.enabled?'Automatické vystavování zapnuto':'Automatické vystavování vypnuto'}</strong></p>
   {!data.cronConfigured&&<p role="alert">Automatický plánovač zatím není nakonfigurován. Kontaktujte správce systému.</p>}
   {(data.trackingError||data.settings?.lastError)&&<p role="alert">Vyúčtování vyžaduje kontrolu. Evidence odměn nebo poslední běh selhal. Kontaktujte správce systému; nevystavujte náhradní fakturu ručně.</p>}
   {data.settings?.lastRunAt&&<p>Poslední kontrola: {new Date(data.settings.lastRunAt).toLocaleString('cs-CZ',{timeZone:'Europe/Prague'})}</p>}
   <details><summary>Nastavení fakturace</summary>
    <p>Odběratel: GlamGarb Rentals s.r.o. (ANIRAK), IČO 19970561. Vyplňte skutečné údaje dodavatele Blaze. Sjednané odměny se považují za částky včetně případné DPH.</p>
    <form onSubmit={e=>{e.preventDefault();if(!vat){setError('Vyberte režim DPH dodavatele Blaze.');return;}void act(()=>partnerApi('billing-settings',token,form));}}>
     <Fields>{Object.entries(labels).map(([key,label])=><Input key={key} label={label} aria-label={label} type={key==='recipientEmail'?'email':key==='startPeriod'?'month':'text'} required={!['register','dic'].includes(key)} disabled={busy||(!!data.settings?.trackingStartedAt&&['prefix','startPeriod'].includes(key))} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>)}
      <label>Režim DPH dodavatele<select aria-label="Režim DPH dodavatele" required value={vat} disabled={busy} onChange={e=>{setVat(e.target.value);setForm({...form,vatPayer:e.target.value==='yes',vatRate:e.target.value==='yes'?21:0});}}><option value="">Vyberte</option><option value="no">Neplátce DPH</option><option value="yes">Plátce DPH</option></select></label>
      {vat==='yes'&&<label>Sazba DPH<select aria-label="Sazba DPH" value={form.vatRate} disabled={busy} onChange={e=>setForm({...form,vatRate:Number(e.target.value)})}><option value={21}>21 %</option><option value={12}>12 %</option></select></label>}
     </Fields>
     <p><label><input type="checkbox" checked={form.consentConfirmed} required disabled={busy} onChange={e=>setForm({...form,consentConfirmed:e.target.checked})}/> Potvrzuji správnost údajů a oprávnění vystavovat faktury jménem dodavatele Blaze.</label></p>
     <p><label><input type="checkbox" checked={form.enabled} disabled={busy} onChange={e=>setForm({...form,enabled:e.target.checked})}/> Zapnout automatické vystavování a odesílání faktur</label></p>
     <p>Uložením začne evidence odměn. Již uzavřené měsíce se nemění; pozdější opravy se promítnou do dalšího vyúčtování. Historické odměny bez doloženého data se automaticky nepřebírají.</p>
     <Button type="submit" disabled={busy}>Uložit nastavení fakturace</Button>
    </form>
   </details>
   <Row><Button variant="secondary" disabled={busy} onClick={()=>act(load)}>Obnovit faktury</Button></Row>
   {!data.items.length&&<p>Zatím nebylo uzavřeno žádné období.</p>}
   {data.items.map((item:any)=><Card key={item._id}>
    <Row><h3>{item.number||`Vyúčtování ${item.period}`}</h3><strong>{money(item.snapshot.total)}</strong></Row>
    <p>Období: {item.period} · {item.status==='issued'?'Vystaveno':item.status==='credit'?'Záporný zůstatek převeden do dalšího období':'Nulové vyúčtování — bez faktury'}</p>
    {item.status==='issued'&&<p>Splatnost: {item.snapshot.dueDate} · {statuses[item.email?.status]||'Neznámý stav e-mailu'}</p>}
    <details><summary>Rozpis odměn</summary>{item.snapshot.lines.map((l:any,i:number)=><p key={i}>{l.description}: <strong>{money(l.amount)}</strong></p>)}</details>
    {item.status==='issued'&&<Row><Button variant="secondary" disabled={busy} onClick={()=>act(()=>downloadPartnerInvoice(token,item._id,item.number))}>Stáhnout PDF</Button>
     {item.email?.status==='pending'&&<Button disabled={busy} onClick={()=>act(()=>partnerApi('billing-send',token,{id:item._id}))}>Odeslat fakturu</Button>}
     {['failed','sending'].includes(item.email?.status)&&<Button variant="secondary" disabled={busy} onClick={()=>{if(window.confirm('Doručení předchozího e-mailu není ověřené. Nejprve zkontrolujte poštu příjemce. Opravdu chcete fakturu odeslat znovu?'))void act(()=>partnerApi('billing-send',token,{id:item._id,retry:true,expectedAttemptedAt:item.email.attemptedAt}));}}>Znovu odeslat po kontrole doručení</Button>}
    </Row>}
   </Card>)}
   {data.settings?.enabled&&<details><summary>Ruční uzavření dokončeného období</summary><p>Stejné období nelze vystavit podruhé. E-mail lze odeslat u vytvořené faktury.</p><Row><Input label="Období k uzavření" aria-label="Období k uzavření" type="month" value={period} onChange={e=>setPeriod(e.target.value)}/><Button disabled={busy||!period} onClick={()=>act(()=>partnerApi('billing-close',token,{period}))}>Uzavřít období</Button></Row></details>}
  </>}
 </Card>;
}
