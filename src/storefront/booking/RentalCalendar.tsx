import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { Button } from '../../design-system/components/Button';
import { Copy, Stack } from '../storefrontStyles';
import { getRentalCalendar, type Selection } from '../api/publicApi';
import { usePublicRead } from '../usePublicRead';
import {
  formatCalendarDay, formatCalendarMonth, monthCalendarDays, mondayWeekday,
  pragueToday, shiftCalendarMonth,
} from '../../admin/calendar/calendarDates';

const Shell = styled(Stack)`
  max-inline-size: 440px;
  inline-size: 100%;
  min-inline-size: 0;
`;
const Header = styled.div`
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 8px;
  text-align: center;
`;
const Nav = styled.button`
  min-inline-size: 44px; min-block-size: 44px;
  border: 1px solid ${t.color.border.default};
  border-radius: ${t.radius[2]};
  background: ${t.color.bg.surface};
  color: ${t.color.text.primary};
  font: inherit;
  cursor: pointer;
  &:focus-visible { outline: 2px solid ${t.color.focus.ring}; outline-offset: 2px; }
  &:disabled { cursor: default; color: ${t.color.text.muted}; }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
  text-align: center;
`;
const Day = styled.button<{ $selected: boolean; $range: boolean }>`
  min-block-size: 44px;
  padding: 0;
  border: 1px solid ${p => p.$selected ? t.color.action.primary.bg : t.color.border.subtle};
  border-radius: ${t.radius[1]};
  background: ${p => p.$selected ? t.color.action.primary.bg : p.$range ? t.primitive.color.brand[50] : t.color.bg.surface};
  color: ${p => p.$selected ? t.color.text.inverse : t.color.text.primary};
  font: inherit;
  cursor: pointer;
  &[aria-disabled='true'] {
    color: ${t.color.text.muted};
    background: ${t.color.bg.subtle};
    cursor: default;
  }
  &[data-unavailable='true'] { text-decoration: line-through; }
  &:focus-visible { outline: 2px solid ${t.color.focus.ring}; outline-offset: 1px; z-index: 1; }
`;
const Legend = styled(Copy)`
  font-size: ${t.type.bodySm.size};
  color: ${t.color.text.secondary};
`;

export function RentalCalendar({ selection, enabled, onChange }: {
  selection: Selection;
  enabled: boolean;
  onChange: (startDate: string, endDate: string) => void;
}) {
  const today = pragueToday();
  const [month, setMonth] = useState(() => (selection.startDate || today).slice(0, 7));
  const [focused, setFocused] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const choosingEnd = Boolean(selection.startDate && !selection.endDate);
  const query = {
    productId: selection.productId, variantId: selection.variantId,
    rentalMode: selection.rentalMode, month,
    ...(choosingEnd ? { startDate: selection.startDate } : {}),
  };
  // A manually entered start can move forward beyond the visible month.
  const visibleMonth = choosingEnd && month < selection.startDate.slice(0, 7)
    ? selection.startDate.slice(0, 7) : month;
  query.month = visibleMonth;
  const read = usePublicRead(enabled ? JSON.stringify(query) : null, signal => getRentalCalendar(query, signal));
  const reload = useRef(read.reload);
  reload.current = read.reload;
  useEffect(() => {
    const refresh = () => reload.current();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  const dates = monthCalendarDays(visibleMonth);
  const first = read.data?.days.find(day => day.available)?.date || dates[0];
  const tabDay = dates.includes(focused) ? focused : first;
  const move = (offset: number) => {
    setMonth(shiftCalendarMonth(visibleMonth, offset));
    setFocused('');
  };
  const prompt = !enabled ? 'Nejprve vyberte velikost a způsob pronájmu.'
    : choosingEnd ? 'Vyberte datum vrácení.'
    : selection.startDate && selection.endDate ? 'Termín je vybraný. Novým výběrem změníte začátek.'
    : 'Vyberte první den pronájmu.';
  return <Shell ref={root} aria-label="Kalendář dostupnosti">
    <Header>
      <Nav type="button" aria-label="Předchozí měsíc"
        disabled={visibleMonth <= (choosingEnd ? selection.startDate : today).slice(0, 7)}
        onClick={() => move(-1)}>‹</Nav>
      <strong>{formatCalendarMonth(visibleMonth)}</strong>
      <Nav type="button" aria-label="Následující měsíc"
        disabled={visibleMonth >= '9998-12'} onClick={() => move(1)}>›</Nav>
    </Header>
    <Copy role="status">{read.loading ? 'Načítání dostupných dnů…' : prompt}</Copy>
    {read.error ? <div role="alert">
      <Copy>Dostupné dny se nepodařilo načíst.</Copy>
      <Button variant="secondary" onClick={read.reload}>Načíst dostupné dny znovu</Button>
    </div> : null}
    <Grid role="group" aria-label={formatCalendarMonth(visibleMonth) + '. ' + prompt} aria-busy={read.loading}>
      {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(day => <span key={day} aria-hidden="true">{day}</span>)}
      {Array.from({length: mondayWeekday(dates[0])}, (_, index) => <span key={'empty-' + index} />)}
      {dates.map((date, index) => {
        const available = read.data?.days[index].available === true;
        const selected = date === selection.startDate || date === selection.endDate;
        const state = !read.data ? 'dostupnost není ověřena' : available ? 'dostupné' : 'nedostupné';
        return <Day key={date} type="button" data-date={date}
          tabIndex={date === tabDay ? 0 : -1}
          aria-disabled={!available}
          data-unavailable={Boolean(read.data && !available)}
          aria-pressed={selected}
          aria-current={date === (read.data?.today || today) ? 'date' : undefined}
          aria-label={formatCalendarDay(date, true) + ', ' + state + (selected ? ', vybráno' : '')}
          $selected={selected} $range={Boolean(selection.startDate && selection.endDate && date > selection.startDate && date < selection.endDate)}
          onFocus={() => setFocused(date)}
          onKeyDown={event => {
            const offsets: Record<string, number> = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7};
            const offset = offsets[event.key];
            if (offset === undefined) return;
            event.preventDefault();
            const next = dates[Math.max(0, Math.min(dates.length - 1, index + offset))];
            root.current?.querySelector<HTMLButtonElement>('[data-date="' + next + '"]')?.focus();
          }}
          onClick={() => {
            if (!available) return;
            if (choosingEnd) onChange(selection.startDate, date);
            else onChange(date, '');
          }}>{Number(date.slice(-2))}</Day>;
      })}
    </Grid>
    <Legend>Volné dny lze vybrat. Přeškrtnuté dny nejsou dostupné.</Legend>
    {choosingEnd ? <Button variant="ghost" onClick={() => onChange('', '')}>Změnit začátek pronájmu</Button> : null}
    <Legend>Dostupnost zahrnuje čas na čištění. Termín potvrdíme při odeslání rezervace.</Legend>
  </Shell>;
}
