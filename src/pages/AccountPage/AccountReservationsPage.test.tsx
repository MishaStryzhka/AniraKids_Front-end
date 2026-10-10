import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccountReservationsPage } from './AccountReservationsPage';
const mockRead = jest.fn();
const mockAuth = { token: 'test-session', isLoggedIn: true, isRefreshing: false };
jest.mock('../../hooks/useAuth', () => ({ useAuth: () => mockAuth }));
jest.mock('../../storefront/usePublicRead', () => ({ usePublicRead: (...args: unknown[]) => mockRead(...args) }));
beforeEach(() => { mockAuth.isLoggedIn = true; mockRead.mockReset(); });
function view() { return render(<MemoryRouter><AccountReservationsPage /></MemoryRouter>); }
test('empty history explains guest links and offers the catalogue', () => {
  mockRead.mockReturnValue({ data: { items: [], total: 0 }, loading: false }); view();
  expect(screen.getByText('Zatím zde nejsou žádné rezervace.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Prohlédnout nabídku' })).toHaveAttribute('href', '/novinky');
  expect(screen.queryByRole('link', { name: 'Vybrat šaty' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Předchozí' })).not.toBeInTheDocument();
  expect(screen.queryByText('Strana 1')).not.toBeInTheDocument();
  expect(screen.getByText(/soukromým odkazem/).closest('details')).not.toHaveAttribute('open');
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

test('one page has no pagination and refresh remains available', () => {
  const reload = jest.fn();
  mockRead.mockReturnValue({ data: { items: [], total: 20 }, loading: false, reload });
  view();
  expect(screen.queryByRole('button', { name: 'Další' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Aktualizovat seznam' }));
  expect(reload).toHaveBeenCalledTimes(1);
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
