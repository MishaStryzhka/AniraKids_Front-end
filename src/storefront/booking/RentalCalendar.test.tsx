import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RentalCalendar } from './RentalCalendar';
import { getRentalCalendar, parseRentalCalendar, type CalendarQuery, type RentalCalendar as CalendarData, type Selection } from '../api/publicApi';
import { monthCalendarDays } from '../../admin/calendar/calendarDates';
jest.mock('../api/publicApi', () => ({...jest.requireActual('../api/publicApi'), getRentalCalendar: jest.fn()}));
jest.mock('../../admin/calendar/calendarDates', () => ({...jest.requireActual('../../admin/calendar/calendarDates'), pragueToday: () => '2032-02-01'}));
const get = getRentalCalendar as jest.MockedFunction<typeof getRentalCalendar>;
const initial: Selection = {productId:'a'.repeat(24), variantId:'b'.repeat(24), rentalMode:'studio', startDate:'', endDate:''};
const data = (q: CalendarQuery): CalendarData => ({...q, today:'2032-02-01', checkedAt:'2032-02-01T12:00:00Z',
  days:monthCalendarDays(q.month).map(date=>({date, available: date !== '2032-02-04' && (!q.startDate || date >= q.startDate)}))});
function Harness({enabled=true}: {enabled?:boolean}) {
  const [selection, setSelection] = useState(initial);
  return <>
    <RentalCalendar enabled={enabled} selection={selection} onChange={(startDate,endDate)=>setSelection({...selection,startDate,endDate})}/>
    <output data-testid="range">{selection.startDate}/{selection.endDate}</output>
    <button onClick={()=>setSelection({...selection,variantId:'c'.repeat(24)})}>Other size</button>
  </>;
}
beforeEach(()=>{get.mockReset();get.mockImplementation(async q=>data(q));});
const day = (date: string) => document.querySelector<HTMLButtonElement>('[data-date="'+date+'"]')!;
test('month loads on size selection, disabled day cannot be selected, start drives return availability', async()=>{
  render(<Harness/>);
  await waitFor(()=>expect(day('2032-02-03')).toHaveAttribute('aria-disabled','false'));
  expect(screen.getByText('únor 2032')).toBeInTheDocument();
  expect(day('2032-02-29')).toBeInTheDocument();
  fireEvent.click(day('2032-02-04'));
  expect(screen.getByTestId('range')).toHaveTextContent('/');
  fireEvent.click(day('2032-02-03'));
  await waitFor(()=>expect(get).toHaveBeenLastCalledWith(expect.objectContaining({startDate:'2032-02-03'}),expect.anything()));
  await waitFor(()=>expect(day('2032-02-05')).toHaveAttribute('aria-disabled','false'));
  expect(day('2032-02-02')).toHaveAttribute('aria-disabled','true');
  fireEvent.click(day('2032-02-05'));
  expect(screen.getByTestId('range')).toHaveTextContent('2032-02-03/2032-02-05');
  await waitFor(()=>expect(day('2032-02-02')).toHaveAttribute('aria-disabled','false'));
});
test('keyboard arrows focus days; complete range can restart and a same-day rental works', async()=>{
  render(<Harness/>);
  await waitFor(()=>expect(day('2032-02-02')).toHaveAttribute('aria-disabled','false'));
  act(() => day('2032-02-02').focus());
  fireEvent.keyDown(day('2032-02-02'),{key:'ArrowRight'});
  expect(day('2032-02-03')).toHaveFocus();
  fireEvent.click(day('2032-02-03'));
  await waitFor(()=>expect(day('2032-02-03')).toHaveAttribute('aria-disabled','false'));
  fireEvent.click(day('2032-02-03'));
  expect(screen.getByTestId('range')).toHaveTextContent('2032-02-03/2032-02-03');
  await waitFor(()=>expect(day('2032-02-08')).toHaveAttribute('aria-disabled','false'));
  fireEvent.click(day('2032-02-08'));
  expect(screen.getByTestId('range')).toHaveTextContent('2032-02-08/');
  fireEvent.click(screen.getByRole('button',{name:'Změnit začátek pronájmu'}));
  expect(screen.getByTestId('range').textContent).toBe('/');
  await waitFor(()=>expect(day('2032-02-02')).toHaveAttribute('aria-disabled','false'));
});
test('cross-month selection retains start; no request before size and no false availability on errors', async()=>{
  const view=render(<Harness enabled={false}/>);
  expect(get).not.toHaveBeenCalled();
  expect(day('2032-02-01')).toHaveAttribute('aria-disabled','true');
  view.rerender(<Harness/>);
  await waitFor(()=>expect(day('2032-02-28')).toHaveAttribute('aria-disabled','false'));
  fireEvent.click(day('2032-02-28'));
  fireEvent.click(screen.getByRole('button',{name:'Následující měsíc'}));
  await waitFor(()=>expect(get).toHaveBeenLastCalledWith(expect.objectContaining({month:'2032-03', startDate:'2032-02-28'}),expect.anything()));
  await waitFor(()=>expect(day('2032-03-02')).toHaveAttribute('aria-disabled','false'));
  fireEvent.click(day('2032-03-02'));
  expect(screen.getByTestId('range')).toHaveTextContent('2032-02-28/2032-03-02');
  get.mockRejectedValue(new Error('offline'));
  fireEvent.click(screen.getByRole('button',{name:'Následující měsíc'}));
  await screen.findByText('Dostupné dny se nepodařilo načíst.');
  expect(day('2032-04-01')).toHaveAttribute('aria-disabled','true');
  get.mockImplementation(async q=>data(q));
  fireEvent.click(screen.getByRole('button',{name:'Načíst dostupné dny znovu'}));
  await waitFor(()=>expect(day('2032-04-01')).toHaveAttribute('aria-disabled','false'));
});
test('stale size response cannot expose selectable days',async()=>{
  let resolve!: (value:CalendarData)=>void;
  get.mockImplementationOnce(()=>new Promise(r=>{resolve=r;}));
  render(<Harness/>);
  fireEvent.click(screen.getByRole('button',{name:'Other size'}));
  await waitFor(()=>expect(day('2032-02-03')).toHaveAttribute('aria-disabled','false'));
  get.mockRejectedValue(new Error('offline'));
  fireEvent.click(screen.getByRole('button',{name:'Následující měsíc'}));
  await screen.findByText('Dostupné dny se nepodařilo načíst.');
  await act(async()=>resolve(data({...initial,month:'2032-02'})));
  expect(day('2032-03-03')).toHaveAttribute('aria-disabled','true');
});
test('strict public calendar contract rejects missing days, wrong selection and optimistic past dates',()=>{
  const query={productId:initial.productId,variantId:initial.variantId,rentalMode:initial.rentalMode,month:'2032-02'};
  const valid={calendar:{...data(query),startDate:null}};
  expect(parseRentalCalendar(valid,query).days).toHaveLength(29);
  for(const change of [
    {variantId:'c'.repeat(24)}, {startDate:'2032-02-02'},
    {days:valid.calendar.days.slice(1)}, {today:'2032-02-02'},
    {days:valid.calendar.days.map((day,i)=>i===0?{...day,date:'2032-02-02'}:day)},
  ]) expect(()=>parseRentalCalendar({calendar:{...valid.calendar,...change}},query)).toThrow();
});
