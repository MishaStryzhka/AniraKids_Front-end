const mockAuth={token:'account-session',isLoggedIn:true,isRefreshing:false};
jest.mock('../../hooks/useAuth',()=>({useAuth:()=>mockAuth}));
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter,Routes,Route } from 'react-router-dom';
import { BookingStatusPage, reservationStatusPath } from './BookingStatusPage';
import { getReservationStatus, getAccountReservationStatus } from '../api/publicApi';
import { receipt } from './bookingFixtures';
jest.mock('../api/publicApi', () => ({ ...jest.requireActual('../api/publicApi'), getReservationStatus: jest.fn(), getAccountReservationStatus: jest.fn() }));
const read = getReservationStatus as jest.MockedFunction<typeof getReservationStatus>;
const number = 'AK-2030-ABC123', token = 'a'.repeat(43);
beforeEach(() => read.mockReset());
test('incomplete link never requests a reservation', () => {
  render(<MemoryRouter initialEntries={['/stav-rezervace']}><Routes><Route path="/stav-rezervace" element={<BookingStatusPage/>}/><Route path="/rezervace/:reservationNumber" element={<BookingStatusPage/>}/></Routes></MemoryRouter>);
  expect(screen.getByRole('alert')).toHaveTextContent('není úplný');
  expect(read).not.toHaveBeenCalled();
});
test('private link reads current state and refreshes without creating a booking', async () => {
  read.mockResolvedValueOnce({ ...receipt, reservationNumber: number, status: 'pending' })
    .mockResolvedValueOnce({ ...receipt, reservationNumber: number, status: 'confirmed', expiresAt: null });
  render(<MemoryRouter initialEntries={[reservationStatusPath(number, token)]}><Routes><Route path="/stav-rezervace" element={<BookingStatusPage/>}/><Route path="/rezervace/:reservationNumber" element={<BookingStatusPage/>}/></Routes></MemoryRouter>);
  expect(await screen.findByText('Čeká na potvrzení')).toBeInTheDocument();
  expect(read).toHaveBeenCalledWith(number, token, expect.any(AbortSignal));
  fireEvent.click(screen.getByRole('button', { name: 'Aktualizovat stav rezervace' }));
  expect(await screen.findByText('Potvrzená')).toBeInTheDocument();
});
test('failed refresh hides payment instructions rather than claiming current state', async () => {
  read.mockRejectedValue(new Error('offline'));
  render(<MemoryRouter initialEntries={[reservationStatusPath(number, token)]}><Routes><Route path="/stav-rezervace" element={<BookingStatusPage/>}/><Route path="/rezervace/:reservationNumber" element={<BookingStatusPage/>}/></Routes></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('nepodařilo načíst');
  expect(screen.queryByText('Čeká na potvrzení')).not.toBeInTheDocument();
});

test('account detail uses bearer access and never creates a guest capability',async()=>{
 (getAccountReservationStatus as jest.Mock).mockResolvedValue({...receipt,reservationNumber:number});
 render(<MemoryRouter initialEntries={['/stav-rezervace?reservation='+number]}><Routes><Route path="/stav-rezervace" element={<BookingStatusPage/>}/><Route path="/rezervace/:reservationNumber" element={<BookingStatusPage/>}/></Routes></MemoryRouter>);
 expect(await screen.findByRole('heading',{name:number})).toBeInTheDocument();
 expect(getAccountReservationStatus).toHaveBeenCalledWith(number,'account-session',expect.any(AbortSignal));
 expect(read).not.toHaveBeenCalled();
 expect(screen.queryByText(/Tento soukromý odkaz/)).not.toBeInTheDocument();
});

test('legacy guest email links still resolve after redirect to the numbered route',async()=>{
 read.mockResolvedValue({...receipt,reservationNumber:number});
 render(<MemoryRouter initialEntries={['/stav-rezervace#'+new URLSearchParams({reservation:number,token})]}><Routes><Route path="/stav-rezervace" element={<BookingStatusPage/>}/><Route path="/rezervace/:reservationNumber" element={<BookingStatusPage/>}/></Routes></MemoryRouter>);
 expect(await screen.findByRole('heading',{name:number})).toBeInTheDocument();
 expect(read).toHaveBeenCalledWith(number,token,expect.any(AbortSignal));
 expect(reservationStatusPath(number,token)).toBe('/rezervace/'+number+'#token='+token);
});
