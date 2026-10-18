import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProductDetailPage } from './ProductDetailPage';
import { BookingProvider, useBooking } from './booking/BookingProvider';
import { body, product, receipt } from './booking/bookingFixtures';
import { newAttempt, persistBooking, SESSION_KEY } from './booking/bookingModel';
import { loadGuestReservationLinks } from './booking/guestReservationLinks';

const mockSetCategory = jest.fn();
const mockProduct = product;
jest.mock('../layouts/StorefrontLayout', () => ({ useStorefrontOutletContext: () => ({ setProductPrimaryCategory: mockSetCategory }) }));
jest.mock('./favorites/FavoriteButton', () => ({ FavoriteButton: () => null, FavoritesFeedback: () => null }));
jest.mock('./usePublicRead', () => ({ usePublicRead: () => ({ data: mockProduct }) }));
const session = { accountId: 'aaaaaaaaaaaaaaaaaaaaaaaa', token: 'test-session' };
function Draft() {
  const booking = useBooking();
  return <div>{booking.draft?.product.name} — {booking.stored ? 'old result' : 'new draft'}</div>;
}
function view() {
  return render(<MemoryRouter initialEntries={['/produkt/sofia']}><BookingProvider session={session}>
    <Routes><Route path="/produkt/:slug" element={<ProductDetailPage />} />
      <Route path="/rezervace" element={<Draft />} /></Routes>
  </BookingProvider></MemoryRouter>);
}
beforeEach(() => {
  sessionStorage.clear();
  Object.defineProperty(globalThis, 'crypto', { value: require('crypto').webcrypto, configurable: true });
});
test.each([true, false])('created receipt allows an explicit fresh product selection, account=%s', account => {
  const completed = { ...receipt, guestAccessToken: 'a'.repeat(43) };
  persistBooking({ version: 1, kind: 'receipt', receipt: completed, ...(account ? { accountId: session.accountId } : {}) });
  const rendered = view();
  expect(screen.getByText(/již byla vytvořena/)).toHaveTextContent('Čeká na potvrzení');
  expect(screen.queryByText(/rozpracovanou rezervaci/)).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Zobrazit předchozí rezervaci' })).toHaveAttribute('href', '/rezervace');
  fireEvent.click(screen.getByRole('button', { name: 'Vytvořit novou rezervaci' }));
  expect(screen.getByText('Sofia — new draft')).toBeInTheDocument();
  expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  expect(loadGuestReservationLinks()).toEqual(account ? [] : [{ reservationNumber: receipt.reservationNumber, guestAccessToken: completed.guestAccessToken }]);
  rendered.unmount();
  // Reload restores the fresh draft, not the completed result.
  render(<MemoryRouter><BookingProvider session={session}><Draft /></BookingProvider></MemoryRouter>);
  expect(screen.getByText('Sofia — new draft')).toBeInTheDocument();
});
test('unresolved submission still requires recovery before a new booking', () => {
  persistBooking(newAttempt(body));
  const saved = sessionStorage.getItem(SESSION_KEY);
  view();
  expect(screen.getByText('Nejprve ověřte výsledek předchozího odeslání rezervace.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Vytvořit novou rezervaci' })).not.toBeInTheDocument();
  expect(sessionStorage.getItem(SESSION_KEY)).toBe(saved);
});

test('studio price has no deposit row while external price retains its deposit', () => {
  view();
  const studio = screen.getAllByText('Studio (Blaze)')[0].parentElement!;
  const external = screen.getAllByText('Mimo studio')[0].parentElement!;
  expect(within(studio).queryByText('Vratná kauce')).not.toBeInTheDocument();
  expect(within(studio).getByText('Cena pronájmu')).toBeInTheDocument();
  expect(within(external).getByText('Vratná kauce')).toBeInTheDocument();
});
