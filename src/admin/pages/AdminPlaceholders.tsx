import { useState } from 'react';
import styled from 'styled-components';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { Button } from '../../design-system/components/Button';
import { NavigationLink } from '../../design-system/components/NavigationLink';
import { useAuth } from '../../hooks/useAuth';
import { useAdminAccess } from '../auth/AdminAccessBoundary';
import { useReservationRead } from '../reservations/useReservationRead';
import { getAdminOverview, type OverviewGroup } from '../api/overview';
import { adminRoutes, buildAdminReservationDetailPath } from '../navigation/adminRoutes';
import { formatCalendarDay } from '../calendar/calendarDates';
import { formatPragueLoadedAt } from '../calendar/reservationCalendarModel';
const Page = styled.div`display:grid;gap:${t.space[6]};min-inline-size:0;`;
const Toolbar = styled.div`display:flex;flex-wrap:wrap;gap:${t.space[3]};align-items:center;`;
const Grid = styled.div`display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${t.space[4]};@media(max-width:1000px){grid-template-columns:repeat(2,minmax(0,1fr));}@media(max-width:600px){grid-template-columns:minmax(0,1fr);}`;
const Card = styled.section`min-inline-size:0;display:grid;align-content:start;gap:${t.space[3]};padding:${t.space[6]};border:1px solid ${t.color.border.subtle};border-radius:${t.radius[2]};background:${t.color.bg.surface};overflow-wrap:anywhere;scroll-margin-top:100px;`;
const Title = styled.h2`margin:0;font:600 20px/28px ${t.font.family.ui};`;
const Copy = styled.p`margin:0;color:${t.color.text.secondary};line-height:1.6;`;
const Number = styled.strong`font:600 32px/1.2 ${t.font.family.ui};`;
const List = styled.ul`display:grid;gap:${t.space[4]};list-style:none;padding:0;margin:0;li{display:grid;gap:${t.space[1]};padding-block-end:${t.space[3]};border-bottom:1px solid ${t.color.border.subtle};}`;
function Queue({id,title,group,empty}:{id:string;title:string;group:OverviewGroup;empty:string}) {
 return <Card id={id}><Title>{title} ({group.total})</Title>{group.items.length?<List>{group.items.map(r=><li key={r.id}><NavigationLink variant="plain" to={buildAdminReservationDetailPath(r.id)}>{r.number}</NavigationLink><span>{r.name || 'Jméno neuvedeno'}</span><Copy>{r.product}</Copy><Copy>{formatCalendarDay(r.startDate)} – {formatCalendarDay(r.endDate)}</Copy></li>)}</List>:<Copy>{empty}</Copy>}{group.total>group.items.length?<Copy>Zobrazeno prvních 10. Další najdete v rezervacích.</Copy>:null}</Card>;
}
export function AdminHomePage() {
 const {token}=useAuth(); const {handleRequestError}=useAdminAccess(); const [revision,setRevision]=useState(0);
 const state=useReservationRead({requestKey:'overview',token:token??'',revision,onAccessError:handleRequestError,read:signal=>getAdminOverview(token??'',signal)});
 const refresh=()=>setRevision(v=>v+1);
 return <Page><Toolbar><NavigationLink variant="plain" to={adminRoutes.calendar}>Otevřít kalendář</NavigationLink><NavigationLink variant="plain" to={adminRoutes.reservations}>Všechny rezervace</NavigationLink><Button variant="secondary" disabled={state.kind==='loading'} onClick={refresh}>Obnovit</Button></Toolbar>
 {state.kind==='loading'?<Copy role="status">Načítání přehledu…</Copy>:null}
 {state.kind==='error'||state.kind==='not-found'?<Card role="alert"><Title>Přehled se nepodařilo načíst</Title><Copy>Zkuste to prosím znovu.</Copy><Button onClick={refresh}>Zkusit znovu</Button></Card>:null}
 {state.kind==='success'?<><Copy>Dnes {formatCalendarDay(state.data.today)} · Aktualizováno {formatPragueLoadedAt(new Date(state.data.loadedAt))}. Časy podle Prahy.</Copy>
 <Grid>{[
  ['K potvrzení',state.data.pending.total,'#pending'],['K vydání dnes a dříve',state.data.pickups.total,'#pickups'],['K vrácení dnes a dříve',state.data.returns.total,'#returns'],['Po termínu vrácení',state.data.overdue,'#returns'],['Nezaplacené aktivní rezervace',state.data.unpaid,adminRoutes.reservations],['Nevypořádané kauce',state.data.deposits.total,'#deposits'],
 ].map(([label,count,href])=><Card key={String(label)}><Title>{label}</Title><Number>{count}</Number>{String(href).startsWith('#')?<a href={String(href)}>Zobrazit</a>:<NavigationLink variant="plain" to={String(href)}>Otevřít rezervace</NavigationLink>}</Card>)}</Grid>
 <Copy>Vydání a vrácení zahrnují i starší nevyřízené rezervace. Kauce jsou počty ukončených rezervací s dosud nevrácenou evidovanou kaucí. Platby ověřujte podle bankovního účtu a pokladny.</Copy>
 <Grid><Queue id="pending" title="Čekají na potvrzení" group={state.data.pending} empty="Žádné platné rezervace nečekají na potvrzení."/><Queue id="pickups" title="Připravit a vydat" group={state.data.pickups} empty="Pro dnešek není nic k vydání."/><Queue id="returns" title="Převzít zpět" group={state.data.returns} empty="Pro dnešek není nic k vrácení."/><Queue id="deposits" title="Vypořádat kauce" group={state.data.deposits} empty="Žádné evidované kauce k vypořádání."/><Card><Title>Produkty a inventář</Title><Copy>Kusy v údržbě: {state.data.maintenance}</Copy><Copy>Rozpracované produkty: {state.data.drafts}</Copy><NavigationLink variant="plain" to={adminRoutes.products}>Spravovat produkty</NavigationLink></Card></Grid>
 </>:null}</Page>;
}
