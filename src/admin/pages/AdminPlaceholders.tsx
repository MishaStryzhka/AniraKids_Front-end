import { useRef, useState } from 'react';
import { AlertCircle, ArrowRight, CalendarDays, Check, ChevronRight, RefreshCw } from 'lucide-react';
import styled from 'styled-components';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { Button } from '../../design-system/components/Button';
import { IconButton } from '../../design-system/components/IconButton';
import { NavigationLink } from '../../design-system/components/NavigationLink';
import { useAuth } from '../../hooks/useAuth';
import { useAdminAccess } from '../auth/AdminAccessBoundary';
import { useReservationRead } from '../reservations/useReservationRead';
import { getAdminOverview, type OverviewGroup, type OverviewRow, type OverviewFittingGroup } from '../api/overview';
import { adminRoutes, buildAdminReservationDetailPath } from '../navigation/adminRoutes';
import {fittingDateLabel,fittingStatusLabels} from '../../fittings/fittingApi';
import { reservationDateRange } from '../reservations/reservationPresentation';

const Page = styled.div`max-width:1120px;display:grid;gap:24px;min-inline-size:0;padding-top:24px;@media(min-width:1024px){padding-top:32px;}`;
const Header = styled.header`display:flex;align-items:center;justify-content:space-between;gap:12px;h1{margin:0 0 4px;font-size:28px;line-height:36px;letter-spacing:-.6px;}p{margin:0;font-size:13px;color:${t.color.text.secondary};} >div:last-child{display:grid;justify-items:center;flex-shrink:0;}small{font-size:10px;color:${t.color.text.secondary};}`;
const Columns = styled.div`display:grid;gap:26px;align-items:start;>div{min-width:0;display:grid;gap:26px;}@media(min-width:1200px){grid-template-columns:minmax(0,1.35fr) minmax(260px,1fr);gap:30px;}`;
const Section = styled.section`display:grid;gap:12px;min-width:0;scroll-margin-top:24px;&:focus-visible{outline:2px solid ${t.color.focus.ring};outline-offset:4px;}`;
const Title = styled.h2`margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-.25px;`;
const Copy = styled.p`margin:0;color:${t.color.text.secondary};font-size:13px;line-height:1.6;`;
const Card = styled.article`min-width:0;background:${t.color.bg.surface};border:1px solid ${t.color.border.subtle};border-radius:12px;overflow-wrap:anywhere;`;
const Details = styled.div`padding:16px;display:grid;gap:5px;h3{margin:6px 0 0;font-size:17px;font-weight:600;}p{margin:0;font-size:13px;color:${t.color.text.secondary};}`;
const Meta = styled.div`display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;small{font-size:11px;color:${t.color.text.secondary};}`;
const Badge = styled.span<{$late?:boolean}>`font-size:11px;font-weight:600;border-radius:5px;padding:4px 8px;background:${p=>p.$late?t.color.status.danger.bg:t.color.status.warning.bg};color:${p=>p.$late?t.color.status.danger.strong:t.color.text.primary};`;
const Dates = styled.div`display:flex;align-items:center;gap:8px;margin-top:9px;font-size:13px;svg{flex-shrink:0;color:${t.color.text.secondary};}`;
const OpenLink = styled(NavigationLink)`display:flex;justify-content:space-between;gap:8px;padding:10px 16px;min-height:46px;border-top:1px solid ${t.color.border.subtle};background:${t.color.bg.subtle};border-radius:0 0 12px 12px;font-size:12px;font-weight:600;`;
const QueueList = styled.div`display:grid;gap:10px;`;
const More = styled.details`summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-size:13px;color:${t.color.text.secondary};} > div{margin-top:8px;}`;
const Notice = styled.div<{$urgent?:boolean}>`border:1px solid ${t.color.border.subtle};border-radius:10px;background:${p=>p.$urgent?t.color.status.danger.bg:t.color.bg.subtle};padding:12px;display:flex;align-items:center;gap:12px;svg{flex-shrink:0;}strong{display:block;font-size:13px;font-weight:600;}p{margin:2px 0 0;font-size:12px;color:${t.color.text.secondary};}button,a{margin-left:auto;flex-shrink:0;min-width:44px;justify-content:center;}`;
const Empty = styled.div`padding:16px;display:flex;align-items:center;gap:12px;border:1px dashed ${t.color.border.subtle};border-radius:10px;background:${t.color.bg.surface};svg{flex-shrink:0;color:${t.color.text.secondary};}strong{font-size:13px;font-weight:500;}p{font-size:12px;margin:3px 0 0;color:${t.color.text.secondary};}`;
const Tabs = styled.div`display:flex;gap:4px;padding:4px;background:${t.color.bg.subtle};border-radius:9px;`;
const Tab = styled.button<{$active:boolean}>`flex:1;min-width:0;min-height:44px;border:0;border-radius:6px;padding:8px;font:inherit;font-size:13px;cursor:pointer;color:${t.color.text.primary};background:${p=>p.$active?t.color.bg.surface:'transparent'};font-weight:${p=>p.$active?600:400};&:focus-visible{outline:2px solid ${t.color.focus.ring};outline-offset:2px;}span{margin-left:6px;font-size:12px;}`;
const Rows = styled.div`padding:0 14px;border:1px solid ${t.color.border.subtle};border-radius:11px;background:${t.color.bg.surface};`;
const RowLink = styled(NavigationLink)`display:flex;width:100%;gap:10px;min-height:52px;padding:10px 0;font-size:13px;border-bottom:1px solid ${t.color.border.subtle};&:last-child{border-bottom:0;}strong{margin-left:auto;}svg{flex-shrink:0;}`;
const RowButton = styled.button`display:flex;align-items:center;width:100%;gap:10px;min-height:52px;padding:10px 0;font:inherit;font-size:13px;text-align:left;color:${t.color.text.secondary};border:0;border-bottom:1px solid ${t.color.border.subtle};background:none;cursor:pointer;&:last-child{border-bottom:0;}strong{margin-left:auto;}svg{flex-shrink:0;}&:focus-visible{outline:2px solid ${t.color.focus.ring};outline-offset:2px;}`;
const SmallLink = styled(NavigationLink)`font-size:13px;justify-self:start;gap:8px;`;
const fullDay = (value:string) => new Intl.DateTimeFormat('cs-CZ',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
const clock = (value:string) => new Intl.DateTimeFormat('cs-CZ',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Prague'}).format(new Date(value));

function ReservationCard({row,kind,today}:{row:OverviewRow;kind:'pending'|'pickups'|'returns'|'deposits';today:string}) {
 const late=kind==='returns'&&row.endDate<today;
 const label=kind==='pending'?'Čeká na potvrzení':kind==='deposits'?'Kauce k vypořádání':late?'Po termínu vrácení':kind==='pickups'?(row.startDate<today?'Nevyřízené předání':'K vydání'):'K vrácení';
 return <Card><Details><Meta><Badge $late={late}>{label}</Badge><small>{row.number}</small></Meta><h3>{row.name||'Jméno neuvedeno'}</h3><p>{row.product}</p><Dates><CalendarDays size={16} aria-hidden="true"/><span>{reservationDateRange(row.startDate,row.endDate)}</span></Dates></Details><OpenLink variant="plain" to={buildAdminReservationDetailPath(row.id)} aria-label={`Otevřít rezervaci ${row.number}`}>Otevřít rezervaci<ArrowRight size={16} aria-hidden="true"/></OpenLink></Card>;
}
function Queue({group,kind,today}:{group:OverviewGroup;kind:'pending'|'pickups'|'returns'|'deposits';today:string}) {
 return <QueueList>{group.items.slice(0,3).map(row=><ReservationCard key={row.id} row={row} kind={kind} today={today}/>)}{group.items.length>3?<More><summary>Další rezervace ({group.items.length-3})</summary><QueueList>{group.items.slice(3).map(row=><ReservationCard key={row.id} row={row} kind={kind} today={today}/>)}</QueueList></More>:null}{group.total>group.items.length?<Copy>Zobrazeno {group.items.length} z {group.total}. <NavigationLink variant="plain" to={adminRoutes.reservations}>Všechny rezervace →</NavigationLink></Copy>:null}</QueueList>;
}
function FittingQueue({group}:{group:OverviewFittingGroup}){
 const cards=(items:OverviewFittingGroup['items'])=>items.map(row=><Card key={row.id}><Details><Meta><Badge>{fittingStatusLabels[row.status]}</Badge><small>{row.number}</small></Meta><h3>{row.name||'Jméno neuvedeno'}</h3>{row.product?<p>{row.product}</p>:null}<Dates><CalendarDays size={16} aria-hidden="true"/><span>{fittingDateLabel(row.date)} · {row.time}</span></Dates></Details><OpenLink variant="plain" to={adminRoutes.fittings+'/'+encodeURIComponent(row.id)} aria-label={`Otevřít zkoušku ${row.number}`}>Otevřít zkoušku<ArrowRight size={16} aria-hidden="true"/></OpenLink></Card>);
 return <QueueList>{cards(group.items.slice(0,3))}{group.items.length>3?<More><summary>Další zkoušky ({group.items.length-3})</summary><QueueList>{cards(group.items.slice(3))}</QueueList></More>:null}{group.total>group.items.length?<Copy>Zobrazeno {group.items.length} z {group.total}. <NavigationLink variant="plain" to={adminRoutes.fittings}>Všechny zkoušky →</NavigationLink></Copy>:null}</QueueList>;
}
export function AdminHomePage() {
 const {token}=useAuth();const {handleRequestError}=useAdminAccess();const [revision,setRevision]=useState(0);const [tab,setTab]=useState<'pickups'|'returns'>('pickups');const [depositsOpen,setDepositsOpen]=useState(false);const todayRef=useRef<HTMLElement>(null);
 const state=useReservationRead({requestKey:'overview',token:token??'',revision,onAccessError:handleRequestError,read:signal=>getAdminOverview(token??'',signal)});
 const refresh=()=>setRevision(v=>v+1);
 const showReturns=()=>{setTab('returns');todayRef.current?.scrollIntoView({block:'start'});todayRef.current?.focus({preventScroll:true});};
 return <Page data-admin-overview><Header><div><h1>Přehled</h1>{state.kind==='success'?<p>{fullDay(state.data.today)}</p>:null}</div><div><IconButton aria-label="Obnovit" title="Obnovit přehled" disabled={state.kind==='loading'} onClick={refresh} icon={<RefreshCw size={20} aria-hidden="true"/>}/>{state.kind==='success'?<small>Aktualizováno {clock(state.data.loadedAt)}</small>:null}</div></Header>
 {state.kind==='loading'?<Copy role="status">Načítání přehledu…</Copy>:null}
 {state.kind==='error'||state.kind==='not-found'?<Card role="alert"><Details><Title>Přehled se nepodařilo načíst</Title><Copy>Zkuste to prosím znovu.</Copy><Button onClick={refresh}>Zkusit znovu</Button></Details></Card>:null}
 {state.kind==='success'?<Columns><div>
 <Section aria-labelledby="attention-title"><Title id="attention-title">Vyžaduje pozornost</Title>
 {state.data.overdue>0?<Notice $urgent><AlertCircle size={20} aria-hidden="true"/><div><strong>Po termínu vrácení: {state.data.overdue}</strong><p>Ověřte nevrácené kusy.</p></div><IconButton aria-label="Zobrazit nevyřízená vrácení" onClick={showReturns} icon={<ArrowRight size={18} aria-hidden="true"/>}/></Notice>:null}
 {state.data.fittings&&state.data.fittings.review.total>0?<><Copy><strong>Platby za zkoušky k ověření: {state.data.fittings.review.total}</strong></Copy><FittingQueue group={state.data.fittings.review}/></>:null}
 {state.data.fittings&&state.data.fittings.pending.total>0?<More><summary>Zkoušky čekající na platbu: {state.data.fittings.pending.total}</summary><FittingQueue group={state.data.fittings.pending}/></More>:null}
 {state.data.pending.total>0?<Queue group={state.data.pending} kind="pending" today={state.data.today}/>:null}
 {state.data.unpaid>0?<Notice><AlertCircle size={20} aria-hidden="true"/><div><strong>Platby k ověření: {state.data.unpaid}</strong><p>Aktivní rezervace bez úplné úhrady</p></div><SmallLink variant="plain" to={adminRoutes.reservations} aria-label="Otevřít rezervace pro ověření plateb"><ArrowRight size={20} aria-hidden="true"/></SmallLink></Notice>:null}
 {!state.data.overdue&&!state.data.pending.total&&!state.data.unpaid&&!state.data.fittings?.review.total&&!state.data.fittings?.pending.total?<Empty><Check size={20} aria-hidden="true"/><div><strong>{state.data.fittings?'Vše je vyřízeno':'Rezervace jsou vyřízené'}</strong><p>{state.data.fittings?'Žádné rezervace ani platby za zkoušky k ověření.':'Žádné rezervace ani jejich platby k ověření.'}</p></div></Empty>:null}
 </Section>
 <Section ref={todayRef} tabIndex={-1} aria-labelledby="today-title"><Title id="today-title">Dnes</Title><Tabs role="group" aria-label="Dnešní úkoly"><Tab type="button" $active={tab==='pickups'} aria-pressed={tab==='pickups'} onClick={()=>setTab('pickups')}>K vydání <span>{state.data.pickups.total}</span></Tab><Tab type="button" $active={tab==='returns'} aria-pressed={tab==='returns'} onClick={()=>setTab('returns')}>K vrácení <span>{state.data.returns.total}</span></Tab></Tabs>
 <Copy>Zahrnuje i starší nevyřízené rezervace.</Copy>
 {state.data[tab].total>0?<Queue group={state.data[tab]} kind={tab} today={state.data.today}/>:<Empty><Check size={20} aria-hidden="true"/><div><strong>{tab==='pickups'?'Dnes není nic k vydání':'Dnes není nic k vrácení'}</strong><p>Ani žádné starší nevyřízené rezervace.</p></div></Empty>}
 <SmallLink variant="plain" to={adminRoutes.calendar}>Otevřít kalendář <ArrowRight size={15} aria-hidden="true"/></SmallLink></Section>
 {state.data.fittings?<Section aria-labelledby="fittings-today-title"><Title id="fittings-today-title">Dnešní zkoušky ({state.data.fittings.today.total})</Title>{state.data.fittings.today.total?<FittingQueue group={state.data.fittings.today}/>:<Copy>Dnes nejsou žádné aktivní zkoušky.</Copy>}<SmallLink variant="plain" to={adminRoutes.fittings}>Všechny zkoušky <ArrowRight size={15} aria-hidden="true"/></SmallLink></Section>:null}
 </div><div>
 <Section aria-labelledby="finance-title"><Title id="finance-title">Platby a kauce</Title><Rows><RowButton type="button" aria-expanded={depositsOpen} aria-controls="overview-deposits" onClick={()=>setDepositsOpen(v=>!v)}>Nevypořádané kauce<strong>{state.data.deposits.total}</strong><ChevronRight size={16} aria-hidden="true"/></RowButton><RowButton type="button" onClick={showReturns}>Po termínu vrácení<strong>{state.data.overdue}</strong><ChevronRight size={16} aria-hidden="true"/></RowButton></Rows><div id="overview-deposits" hidden={!depositsOpen}>{state.data.deposits.total?<Queue group={state.data.deposits} kind="deposits" today={state.data.today}/>:<Copy>Žádné evidované kauce k vypořádání.</Copy>}</div><Copy>Úhrady ověřujte podle bankovního účtu a pokladny. Kauce zahrnují ukončené rezervace s dosud nevrácenou evidovanou kaucí.</Copy></Section>
 <Section aria-labelledby="products-title"><Title id="products-title">Produkty</Title><Rows><RowLink variant="plain" to={`${adminRoutes.products}?status=draft`}>Rozpracované<strong>{state.data.drafts}</strong><ChevronRight size={16} aria-hidden="true"/></RowLink><RowLink variant="plain" to={adminRoutes.products}>Kusy v údržbě<strong>{state.data.maintenance}</strong><ChevronRight size={16} aria-hidden="true"/></RowLink></Rows><SmallLink variant="plain" to={adminRoutes.products}>Všechny produkty <ArrowRight size={15} aria-hidden="true"/></SmallLink></Section>
 </div></Columns>:null}</Page>;
}
