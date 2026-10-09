import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccountReservationsPage } from './AccountReservationsPage';
const mockRead = jest.fn();
const mockAuth = { token: 'test-session', isLoggedIn: true, isRefreshing: false };
jest.mock('../../hooks/useAuth', () => ({ useAuth: () => mockAuth }));
jest.mock('../../storefront/usePublicRead', () => ({ usePublicRead: (...args: unknown[]) => mockRead(...args) }));
function view() { return render(<MemoryRouter><AccountReservationsPage /></MemoryRouter>); }
test('empty history explains guest links and offers the catalogue', () => {
  mockRead.mockReturnValue({ data: { items: [], total: 0 }, loading: false }); view();
  expect(screen.getByText('Zatím zde nejsou žádné rezervace.')).toBeInTheDocument();
  expect(screen.getByText(/soukromým odkazem/)).toBeInTheDocument();
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
