import {useMemo, useState} from 'react';
import styled from 'styled-components';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {Button} from '../../design-system/components/Button';
import {SelectField} from '../../design-system/components/SelectField';
import {Spinner} from '../../design-system/components/Spinner';
import {StatusBadge} from '../../design-system/components/StatusBadge';
import {designTokens as t} from '../../design-system/tokens/designTokens';
import {useAuth} from '../../hooks/useAuth';
import {useAdminAccess} from '../auth/AdminAccessBoundary';
import {calendarMonthRange, formatCalendarDay, formatCalendarMonth, mondayWeekday, monthCalendarDays, pragueToday, shiftCalendarMonth} from './calendarDates';
import {formatPragueLoadedAt, rentalModeLabels, reservationDayCounts, reservationsForDay, reservationStatusPresentation} from './reservationCalendarModel';
import {useReservationCalendar} from './useReservationCalendar';

const Announcement = styled.p`position:absolute;inline-size:1px;block-size:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;`;
const Page = styled.div`display:grid;gap:${t.space[6]};min-inline-size:0;`;
const Copy = styled.p`margin:0;color:${t.color.text.secondary};font-size:${t.type.bodySm.size};line-height:${t.type.bodySm.lineHeight};overflow-wrap:anywhere;`;
const Toolbar = styled.div`display:flex;align-items:center;flex-wrap:wrap;gap:${t.space[3]};@media(max-width:767px){display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);}`;
const MonthNavigation = styled.div`display:flex;align-items:center;gap:${t.space[2]};min-inline-size:0;flex:1 1 320px;@media(max-width:767px){grid-column:1/-1;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;}`;
const MonthTitle = styled.h2`margin:0;min-inline-size:0;flex:1;text-align:center;font:600 22px/30px ${t.font.family.ui};`;
const ArrowButton = styled(Button)`flex:0 0 44px;inline-size:44px;padding-inline:0;`;
const State = styled.div`display:grid;gap:${t.space[3]};padding:${t.space[6]};border:1px solid ${t.color.border.subtle};border-radius:${t.radius[2]};background:${t.color.bg.surface};min-inline-size:0;justify-items:start;`;
const StateTitle = styled.h2`margin:0;font:${t.font.weight.semibold} ${t.type.bodyLg.size}/${t.type.bodyLg.lineHeight} ${t.font.family.ui};`;
const Loading = styled.div`display:flex;gap:${t.space[3]};align-items:center;`;
const Content = styled.div`display:grid;gap:${t.space[6]};min-inline-size:0;margin-block-start:${t.space[4]};`;
const Calendar = styled.section`min-inline-size:0;@media(max-width:767px){display:none;}`;
const Weekdays = styled.div`display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:${t.space[2]};margin-block-end:${t.space[2]};text-align:center;color:${t.color.text.secondary};font-size:${t.type.bodySm.size};`;
const Days = styled.div`display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:${t.space[2]};`;
const DayButton = styled(Button)`display:grid;justify-items:start;align-content:start;gap:${t.space[1]};padding:${t.space[2]};min-block-size:104px;text-align:start;white-space:normal;
  >span{display:grid;justify-items:start;text-align:start;font-size:${t.type.bodySm.size};line-height:${t.type.bodySm.lineHeight};}
  &[aria-current="date"]{box-shadow:inset 0 0 0 1px ${t.color.focus.ring};}
`;
const DayNumber = styled.strong`font-size:${t.type.bodyMd.size};`;
const DayCount = styled.span`font-size:${t.type.caption.size};line-height:${t.type.caption.lineHeight};overflow-wrap:anywhere;`;
const MobileDay = styled.div`@media(min-width:768px){display:none;}`;
const Agenda = styled.section`display:grid;gap:${t.space[4]};min-inline-size:0;`;
const AgendaTitle = styled.h2`margin:0;font:600 20px/28px ${t.font.family.ui};overflow-wrap:anywhere;`;
const Cards = styled.ul`list-style:none;padding:0;margin:0;display:grid;gap:${t.space[4]};`;
const Card = styled.li`display:grid;gap:${t.space[3]};padding:${t.space[4]};border:1px solid ${t.color.border.subtle};border-radius:${t.radius[2]};background:${t.color.bg.surface};min-inline-size:0;overflow-wrap:anywhere;`;
const CardHeading = styled.h3`margin:0;font:${t.font.weight.semibold} ${t.type.bodyLg.size}/${t.type.bodyLg.lineHeight} ${t.font.family.ui};`;
const CardMeta = styled.div`display:flex;flex-wrap:wrap;align-items:center;gap:${t.space[2]};`;
const Details = styled.dl`display:grid;gap:${t.space[2]};margin:0;>div{display:grid;gap:${t.space[1]};}dt{color:${t.color.text.secondary};font-size:${t.type.bodySm.size};}dd{margin:0;overflow-wrap:anywhere;}`;
const ProductItems = styled.ul`margin:0;padding-inline-start:${t.space[6]};display:grid;gap:${t.space[1]};`;
const weekdays = ['Po','Út','St','Čt','Pá','So','Ne'];

export function AdminReservationCalendarPage() {
  const {token} = useAuth();
  const {handleRequestError} = useAdminAccess();
  const today = pragueToday();
  const [month, setMonth] = useState(() => today.slice(0,7));
  const [selectedDay, setSelectedDay] = useState(today);
  const [revision, setRevision] = useState(0);
  const state = useReservationCalendar({month,token:token??'',revision,onAccessError:handleRequestError});
  const days = useMemo(() => monthCalendarDays(month),[month]);
  const items = state.kind === 'success' ? state.items : null;
  const agenda = useMemo(() => items ? reservationsForDay(items,selectedDay) : [],[items,selectedDay]);
  const navigateMonth = (offset:number) => {
    const next=shiftCalendarMonth(month,offset);setMonth(next);setSelectedDay(`${next}-01`);
  };
  const goToday = () => {const now=pragueToday();setMonth(now.slice(0,7));setSelectedDay(now);};
  const loading=state.kind==='loading';
  return <Page data-admin-calendar-page>
    <Copy>Přehled rezervací a navazujícího obsazení. Nezobrazuje ruční blokace ani úplnou dostupnost inventáře.</Copy>
    <Toolbar>
      <MonthNavigation aria-label="Výběr měsíce">
        <ArrowButton variant="secondary" size="compact" aria-label="Předchozí měsíc" disabled={month==='0001-01'} onClick={()=>navigateMonth(-1)}><ChevronLeft size={20} aria-hidden="true"/></ArrowButton>
        <MonthTitle id="calendar-month-title">{formatCalendarMonth(month)}</MonthTitle>
        <ArrowButton variant="secondary" size="compact" aria-label="Další měsíc" disabled={month==='9999-12'} onClick={()=>navigateMonth(1)}><ChevronRight size={20} aria-hidden="true"/></ArrowButton>
      </MonthNavigation>
      <Button variant="secondary" size="compact" onClick={goToday}>Dnes</Button>
      <Button variant="secondary" size="compact" disabled={loading} onClick={()=>setRevision(value=>value+1)}>Obnovit</Button>
    </Toolbar>
    <div aria-busy={loading||undefined}>
      {loading?<State role="status"><Loading><Spinner size="sm"/><span>Načítání kalendáře…</span></Loading></State>:null}
      {state.kind==='error'?<State role="alert"><StateTitle>Kalendář se nepodařilo načíst</StateTitle><Copy>Zkuste to prosím znovu.</Copy><Button onClick={()=>setRevision(value=>value+1)}>Zkusit znovu</Button></State>:null}
      {state.kind==='success'?<>
        <Announcement role="status" aria-live="polite">{formatCalendarDay(selectedDay,true)}. Počet rezervací: {agenda.length}.</Announcement>
        <Copy data-calendar-loaded>Naposledy načteno: {formatPragueLoadedAt(state.loadedAt)}</Copy>
        {state.items.length===0?<State><StateTitle>Žádné rezervace v tomto období</StateTitle></State>:null}
        <Content>
          <Calendar aria-labelledby="calendar-month-title">
            <Weekdays aria-hidden="true">{weekdays.map(day=><span key={day}>{day}</span>)}</Weekdays>
            <Days>{Array.from({length:mondayWeekday(calendarMonthRange(month).from)},(_,index)=><div aria-hidden="true" key={`blank-${index}`}/>)}
              {days.map(day=>{const counts=reservationDayCounts(state.items,day);return <DayButton key={day} size="compact" variant={day===selectedDay?'primary':'secondary'} aria-pressed={day===selectedDay} aria-current={day===today?'date':undefined}
                aria-label={`${formatCalendarDay(day,true)}. Pronájmy: ${counts.rental}. Čištění: ${counts.cleaning}.`} onClick={()=>setSelectedDay(day)} data-calendar-day={day}>
                <DayNumber>{Number(day.slice(-2))}</DayNumber><DayCount>Pronájmy: {counts.rental}</DayCount><DayCount>Čištění: {counts.cleaning}</DayCount>
              </DayButton>;})}
            </Days>
          </Calendar>
          <MobileDay><SelectField label="Vybraný den" value={selectedDay} onChange={event=>setSelectedDay(event.target.value)}>{days.map(day=><option key={day} value={day}>{formatCalendarDay(day,true)}</option>)}</SelectField></MobileDay>
          <Agenda aria-labelledby="calendar-agenda-title">
            <AgendaTitle id="calendar-agenda-title">{formatCalendarDay(selectedDay,true)}</AgendaTitle>
            {agenda.length===0?<Copy>Žádné rezervace pro vybraný den</Copy>:<Cards>{agenda.map(reservation=>{const status=reservationStatusPresentation(reservation.status);return <Card key={reservation.id} data-calendar-reservation={reservation.id}>
              <CardHeading>{reservation.reservationNumber}</CardHeading>
              <div>{reservation.customerName.trim()||'Jméno neuvedeno'}</div>
              <CardMeta><StatusBadge tone={status.tone}>{status.label}</StatusBadge><span>{rentalModeLabels[reservation.rentalMode]}</span>{selectedDay>reservation.endDate?<StatusBadge tone="neutral">Navazující obsazení / čištění</StatusBadge>:null}</CardMeta>
              <Details><div><dt>Termín</dt><dd>{formatCalendarDay(reservation.startDate)} – {formatCalendarDay(reservation.endDate)}</dd></div><div><dt>Obsazeno do</dt><dd>{formatCalendarDay(reservation.occupiedThrough)}</dd></div></Details>
              <ProductItems>{reservation.items.map(item=><li key={item.inventoryItemId}>{item.productName} · velikost {item.size}</li>)}</ProductItems>
            </Card>;})}</Cards>}
          </Agenda>
        </Content>
      </>:null}
    </div>
  </Page>;
}
