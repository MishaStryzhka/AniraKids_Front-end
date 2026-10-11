import { product, receipt, body } from '../../storefront/booking/bookingFixtures';
import { initialDraft, type BookingDraft, type StoredBooking } from '../../storefront/booking/bookingModel';
import { claimReservation } from '../../storefront/api/publicApi';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccountReservationsPage } from './AccountReservationsPage';
const mockRead = jest.fn();
const mockBooking = { stored: null as StoredBooking | null, draft: null as BookingDraft | null, busy: false, storageBlocked: false, accountBlocked: false };
jest.mock('../../storefront/booking/BookingProvider', () => ({ useBookingOptional: () => mockBooking }));
jest.mock('../../storefront/api/publicApi', () => ({ ...jest.requireActual('../../storefront/api/publicApi'), claimReservation: jest.fn() }));
const mockAuth = { token: 'test-session', isLoggedIn: true, isRefreshing: false };
jest.mock('../../hooks/useAuth', () => ({ useAuth: () => mockAuth }));
jest.mock('../../storefront/usePublicRead', () => ({ usePublicRead: (...args: unknown[]) => mockRead(...args) }));
beforeEach(() => { mockAuth.isLoggedIn = true; mockRead.mockReset(); mockBooking.stored = null; mockBooking.draft = null; mockBooking.busy = false; mockBooking.storageBlocked = false; mockBooking.accountBlocked = false; (claimReservation as jest.Mock).mockReset(); });
function view() { return render(<MemoryRouter><AccountReservationsPage /></MemoryRouter>); }
test('empty history offers the catalogue without unrelated controls', () => {
  mockRead.mockReturnValue({ data: { items: [], total: 0 }, loading: false }); view();
  expect(screen.getByText('Zatím zde nejsou žádné rezervace.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Prohlédnout nabídku' })).toHaveAttribute('href', '/novinky');
  expect(screen.queryByRole('link', { name: 'Vybrat šaty' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Předchozí' })).not.toBeInTheDocument();
  expect(screen.queryByText('Strana 1')).not.toBeInTheDocument();
  expect(screen.queryByText('Rezervace bez přihlášení')).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Můj profil' })).not.toBeInTheDocument();
});
test('history failure offers retry without showing cached reservations', () => {
  mockRead.mockReturnValue({ error: new Error('offline'), loading: false, reload: jest.fn() }); view();
  expect(screen.getByRole('alert')).toHaveTextContent('nepodařilo');
  expect(screen.getByRole('button', { name: 'Zkusit znovu' })).toBeInTheDocument();
});
test('logged-out visitors cannot load account history', () => {
  mockAuth.isLoggedIn = false;
  mockRead.mockReturnValue({}); view();
  expect(mockRead).toHaveBeenLastCalledWith(null, expect.any(Function));
  expect(screen.getByRole('button', { name: 'Přihlásit se' })).toBeInTheDocument();
  mockAuth.isLoggedIn = true;
});

test('one page has no pagination or redundant refresh button', () => {
  const reload = jest.fn();
  mockRead.mockReturnValue({ data: { items: [], total: 20 }, loading: false, reload });
  view();
  expect(screen.queryByRole('button', { name: 'Další' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Aktualizovat seznam' })).not.toBeInTheDocument();
});
test('multiple pages remain reachable and an emptied later page can return to page one', () => {
  mockRead.mockReturnValue({ data: { items: [], total: 21 }, loading: false, reload: jest.fn() });
  const rendered = view();
  expect(screen.getByRole('button', { name: 'Předchozí' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Další' }));
  expect(mockRead).toHaveBeenLastCalledWith('test-session:2', expect.any(Function));
  mockRead.mockReturnValue({ data: { items: [], total: 0 }, loading: false, reload: jest.fn() });
  rendered.rerender(<MemoryRouter><AccountReservationsPage /></MemoryRouter>);
  expect(screen.getByRole('button', { name: 'Předchozí' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Zpět na první stránku' }));
  expect(mockRead).toHaveBeenLastCalledWith('test-session:1', expect.any(Function));
  expect(screen.queryByRole('button', { name: 'Předchozí' })).not.toBeInTheDocument();
});

test('guest receipt is explicitly linked using its secret, without creating another reservation', async () => {
  const reload = jest.fn();
  mockRead.mockReturnValue({ data: { items: [], total: 0 }, loading: false, reload });
  mockBooking.stored = { version: 1, kind: 'receipt', receipt: { ...receipt, guestAccessToken: 'a'.repeat(43) } };
  (claimReservation as jest.Mock).mockResolvedValue(receipt);
  view();
  expect(screen.getByText('Rezervace bez přihlášení')).toBeInTheDocument();
  expect(claimReservation).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Připojit rezervaci k účtu' }));
  await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
  expect(claimReservation).toHaveBeenCalledWith(receipt.reservationNumber, 'a'.repeat(43), 'test-session', expect.anything());
  expect(screen.getByRole('status')).toHaveTextContent('připojena');
  expect(screen.queryByText('Rezervace bez přihlášení')).not.toBeInTheDocument();
});
test('unknown claim result stays retryable and does not claim success', async () => {
  mockRead.mockReturnValue({ data: { items: [], total: 0 }, loading: false, reload: jest.fn() });
  mockBooking.stored = { version: 1, kind: 'receipt', receipt: { ...receipt, guestAccessToken: 'a'.repeat(43) } };
  (claimReservation as jest.Mock).mockRejectedValue(new Error('offline'));
  view();
  fireEvent.click(screen.getByRole('button', { name: 'Připojit rezervaci k účtu' }));
  await screen.findByRole('alert');
  expect(screen.queryByText('Rezervace byla připojena k vašemu účtu.')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Připojit rezervaci k účtu' })).toBeEnabled();
});

test.each([true, false])('draft is reachable with logged-in=%s and does not show empty history', loggedIn => {
  mockAuth.isLoggedIn = loggedIn;
  mockBooking.draft = initialDraft(product);
  mockRead.mockReturnValue({ data: { items: [], total: 0 }, loading: false });
  view();
  expect(screen.getByText('Rozpracované')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Dokončit rezervaci' })).toHaveAttribute('href', '/rezervace');
  expect(screen.queryByText('Zatím zde nejsou žádné rezervace.')).not.toBeInTheDocument();
});
test('draft remains visible when history fails', () => {
  mockBooking.draft = initialDraft(product);
  mockRead.mockReturnValue({ error: new Error('offline'), reload: jest.fn() });
  view();
  expect(screen.getByRole('link', { name: 'Dokončit rezervaci' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Zkusit znovu' })).toBeInTheDocument();
});
test('unknown submission is recovery, never an editable draft', () => {
  mockBooking.draft = initialDraft(product);
  mockBooking.stored = { version: 1, kind: 'attempt', key: 'test-key', body };
  mockRead.mockReturnValue({ data: { items: [], total: 0 }, loading: false });
  view();
  expect(screen.queryByText('Rozpracované')).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Dokončit rezervaci' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Otevřít rezervaci' })).toBeInTheDocument();
});
