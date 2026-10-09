import {MemoryRouter} from 'react-router-dom';
import {act,fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import {getAdminReservationCalendar,type CalendarReservation} from '../api/reservationCalendar';
import {AdminReservationCalendarPage} from './AdminReservationCalendarPage';
jest.mock('../../hooks/useAuth',()=>({useAuth:()=>({token:'token'})}));
const mockAccess=jest.fn(()=>false);
jest.mock('../auth/AdminAccessBoundary',()=>({useAdminAccess:()=>({handleRequestError:mockAccess})}));
jest.mock('../api/reservationCalendar',()=>({getAdminReservationCalendar:jest.fn()}));
jest.mock('./calendarDates',()=>({...jest.requireActual('./calendarDates'),pragueToday:()=> '2026-10-07'}));
const get=getAdminReservationCalendar as jest.MockedFunction<typeof getAdminReservationCalendar>;
const row:CalendarReservation={id:'r1',reservationNumber:'AK-001',status:'returned',rentalMode:'external',startDate:'2026-10-05',endDate:'2026-10-06',occupiedThrough:'2026-10-09',customerName:'Jana Nováková',items:[{inventoryItemId:'i1',productName:'Šaty Sofia',size:'98'}]};
function deferred<T>(){let resolve!:(value:T)=>void,reject!:(error:unknown)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no});return{promise,resolve,reject};}
beforeEach(()=>jest.clearAllMocks());
test('returned reservation includes full source range, authoritative cleaning date, snapshot products and a real reservation detail link',async()=>{
 get.mockResolvedValue({items:[row]});render(<MemoryRouter><AdminReservationCalendarPage/></MemoryRouter>);await screen.findByText('AK-001');expect(screen.getByText('Vrácená')).toBeInTheDocument();expect(screen.getByText('Mimo studio')).toBeInTheDocument();expect(screen.getByText('Navazující obsazení / čištění')).toBeInTheDocument();expect(screen.getByText('5. října 2026 – 6. října 2026')).toBeInTheDocument();expect(screen.getByText('9. října 2026')).toBeInTheDocument();expect(screen.getByText('Šaty Sofia · velikost 98')).toBeInTheDocument();expect(screen.getByRole('link',{name:'AK-001'})).toHaveAttribute('href','/admin/rezervace/r1');expect(screen.getByText(/Naposledy načteno:/)).toBeInTheDocument();
 const selected=screen.getByRole('button',{name:/středa 7. října 2026/});expect(selected).toHaveAttribute('aria-pressed','true');expect(selected).toHaveAttribute('aria-current','date');
});
test('day selection changes only agenda, counts distinguish rental/cleaning and unknown status survives',async()=>{
 get.mockResolvedValue({items:[{...row,status:'future',customerName:''}]});render(<MemoryRouter><AdminReservationCalendarPage/></MemoryRouter>);await screen.findByText('AK-001');expect(screen.getByText('Neznámý stav')).toBeInTheDocument();expect(screen.getByText('Jméno neuvedeno')).toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Vybraný den'),{target:{value:'2026-10-05'}});expect(screen.queryByText('Navazující obsazení / čištění')).not.toBeInTheDocument();expect(screen.getByRole('button',{name:/pondělí 5. října 2026. Pronájmy: 1. Čištění: 0/})).toHaveAttribute('aria-pressed','true');
 fireEvent.change(screen.getByLabelText('Vybraný den'),{target:{value:'2026-10-10'}});expect(screen.getByText('Žádné rezervace pro vybraný den')).toBeInTheDocument();expect(get).toHaveBeenCalledTimes(1);
});
test('month navigation immediately clears previous calendar and uses correct complete month range',async()=>{
 get.mockResolvedValueOnce({items:[row]});render(<MemoryRouter><AdminReservationCalendarPage/></MemoryRouter>);await screen.findByText('AK-001');const pending=deferred<{items:CalendarReservation[]}>();get.mockReturnValue(pending.promise);
 fireEvent.click(screen.getByRole('button',{name:'Další měsíc'}));expect(screen.queryByText('AK-001')).not.toBeInTheDocument();expect(screen.getByText('Načítání kalendáře…')).toBeInTheDocument();expect(get).toHaveBeenLastCalledWith(expect.objectContaining({from:'2026-11-01',to:'2026-11-30'}));
 await act(async()=>pending.resolve({items:[]}));expect(screen.getByText('Žádné rezervace v tomto období')).toBeInTheDocument();expect(screen.getByText('Žádné rezervace pro vybraný den')).toBeInTheDocument();
 get.mockResolvedValue({items:[]});fireEvent.click(screen.getByRole('button',{name:'Dnes'}));await waitFor(()=>expect(get).toHaveBeenLastCalledWith(expect.objectContaining({from:'2026-10-01',to:'2026-10-31'})));expect(await screen.findByLabelText('Vybraný den')).toHaveValue('2026-10-07');
});
test('failed reload removes old data and retry recovers without raw backend error text',async()=>{
 get.mockResolvedValueOnce({items:[row]});render(<MemoryRouter><AdminReservationCalendarPage/></MemoryRouter>);await screen.findByText('AK-001');get.mockRejectedValueOnce(new Error('private raw server'));fireEvent.click(screen.getByRole('button',{name:'Obnovit'}));
 const error=await screen.findByRole('alert');expect(error).toHaveTextContent('Kalendář se nepodařilo načíst');expect(screen.queryByText('AK-001')).not.toBeInTheDocument();expect(screen.queryByText('private raw server')).not.toBeInTheDocument();get.mockResolvedValueOnce({items:[row]});fireEvent.click(within(error).getByRole('button',{name:'Zkusit znovu'}));await screen.findByText('AK-001');
});

test('manual blocks show on their inclusive day and link to the owning product',async()=>{
 get.mockResolvedValue({items:[],blocks:[{id:'b1',productId:'p1',productName:'Blokované šaty',internalCode:'DRESS-1',reason:'repair',startDate:'2026-10-07',endDate:'2026-10-07'}],blocksTruncated:false});
 render(<MemoryRouter><AdminReservationCalendarPage/></MemoryRouter>);
 expect(await screen.findByRole('link',{name:'Blokované šaty'})).toHaveAttribute('href','/admin/produkty/p1');
 expect(screen.getByText('DRESS-1 · Oprava')).toBeInTheDocument();
 expect(screen.getByRole('button',{name:/středa 7. října 2026.*Blokace: 1/})).toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Vybraný den'),{target:{value:'2026-10-08'}});
 expect(screen.queryByText('Blokované šaty')).not.toBeInTheDocument();
});
