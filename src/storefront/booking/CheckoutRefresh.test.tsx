import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {BookingPage} from './BookingPage';
import {BookingStatusPage, reservationStatusPath} from './BookingStatusPage';
import {useBooking} from './BookingProvider';
import {getReservationStatus} from '../api/publicApi';
import {deferred, receipt} from './bookingFixtures';

jest.mock('./BookingProvider', () => ({useBooking: jest.fn()}));
jest.mock('../api/publicApi', () => ({...jest.requireActual('../api/publicApi'), getReservationStatus: jest.fn()}));
jest.mock('../payments/PaymentInformation', () => ({
  ...jest.requireActual('../payments/PaymentInformation'),
  ReceiptPaymentInformation: () => <input aria-label="Checkout input" />,
}));
const verified = {...receipt, reservationNumber: 'AK-2030-ABC123', expiresAt: '2099-01-01T00:00:00Z'};
beforeEach(() => jest.clearAllMocks());
test('booking refresh preserves checkout DOM and keyboard focus', async () => {
  const state = {stored: {kind: 'receipt', receipt: verified}, receiptVerified: true,
    busy: false, error: null, refreshStatus: jest.fn()};
  (useBooking as jest.Mock).mockReturnValue(state);
  const view = render(<MemoryRouter><BookingPage /></MemoryRouter>);
  await waitFor(() => expect(screen.getByRole('heading', {name: 'Rezervace byla vytvořena'})).toHaveFocus());
  const input = screen.getByLabelText('Checkout input');
  fireEvent.change(input, {target: {value: 'partially entered'}});
  input.focus();
  (useBooking as jest.Mock).mockReturnValue({...state, busy: true});
  view.rerender(<MemoryRouter><BookingPage /></MemoryRouter>);
  expect(screen.getByLabelText('Checkout input')).toBe(input);
  (useBooking as jest.Mock).mockReturnValue({...state, stored: {...state.stored, receipt: {...verified}}});
  view.rerender(<MemoryRouter><BookingPage /></MemoryRouter>);
  await act(async () => {});
  expect(input).toHaveValue('partially entered');
  expect(input).toHaveFocus();
});
test('private status refresh preserves checkout until the authoritative response', async () => {
  const pending = deferred<typeof verified>();
  (getReservationStatus as jest.Mock).mockResolvedValueOnce(verified).mockReturnValueOnce(pending.promise);
  render(<MemoryRouter initialEntries={[reservationStatusPath(verified.reservationNumber, 'a'.repeat(43))]}><BookingStatusPage /></MemoryRouter>);
  const input = await screen.findByLabelText('Checkout input');
  fireEvent.change(input, {target: {value: 'partially entered'}});
  fireEvent.click(screen.getByRole('button', {name: 'Aktualizovat stav rezervace'}));
  expect(screen.getByLabelText('Checkout input')).toBe(input);
  await act(async () => pending.resolve({...verified}));
  expect(screen.getByLabelText('Checkout input')).toBe(input);
  expect(input).toHaveValue('partially entered');
});
