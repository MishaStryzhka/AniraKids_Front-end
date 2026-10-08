import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BookingStatusPage, reservationStatusPath } from './BookingStatusPage';
import { getReservationStatus } from '../api/publicApi';
import { receipt } from './bookingFixtures';
jest.mock('../api/publicApi', () => ({ ...jest.requireActual('../api/publicApi'), getReservationStatus: jest.fn() }));
const read = getReservationStatus as jest.MockedFunction<typeof getReservationStatus>;
const number = 'AK-2030-ABC123', token = 'a'.repeat(43);
beforeEach(() => read.mockReset());
test('incomplete link never requests a reservation', () => {
  render(<MemoryRouter initialEntries={['/stav-rezervace']}><BookingStatusPage /></MemoryRouter>);
  expect(screen.getByRole('alert')).toHaveTextContent('není úplný');
  expect(read).not.toHaveBeenCalled();
});
test('private link reads current state and refreshes without creating a booking', async () => {
  read.mockResolvedValueOnce({ ...receipt, reservationNumber: number, status: 'pending' })
    .mockResolvedValueOnce({ ...receipt, reservationNumber: number, status: 'confirmed', expiresAt: null });
  render(<MemoryRouter initialEntries={[reservationStatusPath(number, token)]}><BookingStatusPage /></MemoryRouter>);
  expect(await screen.findByText('Stav: Čeká na potvrzení')).toBeInTheDocument();
  expect(read).toHaveBeenCalledWith(number, token, expect.any(AbortSignal));
  fireEvent.click(screen.getByRole('button', { name: 'Aktualizovat stav rezervace' }));
  expect(await screen.findByText('Stav: Potvrzená')).toBeInTheDocument();
});
test('failed refresh hides payment instructions rather than claiming current state', async () => {
  read.mockRejectedValue(new Error('offline'));
  render(<MemoryRouter initialEntries={[reservationStatusPath(number, token)]}><BookingStatusPage /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('nepodařilo načíst');
  expect(screen.queryByText('Stav: Čeká na potvrzení')).not.toBeInTheDocument();
});
