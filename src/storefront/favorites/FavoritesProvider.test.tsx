import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FavoritesProvider, useFavorites } from './FavoritesProvider';
import { favoritesRequest } from './favoritesApi';
import { guestFavoritesKey, readGuestFavorites } from './favoritesStorage';
let mockAuth = { token: null as string | null, isLoggedIn: false };
jest.mock('../../hooks/useAuth', () => ({ useAuth: () => mockAuth }));
jest.mock('./favoritesApi', () => ({ favoritesRequest: jest.fn() }));
const api = jest.mocked(favoritesRequest);
const a = '111111111111111111111111', b = '222222222222222222222222';
function Probe() {
  const favorites = useFavorites();
  return <><p data-testid="ids">{favorites.ids.join(',')}</p><p data-testid="error">{favorites.error}</p><button disabled={favorites.loading || !!favorites.error} onClick={() => favorites.toggle(a)}>Toggle</button><button onClick={favorites.retry}>Retry</button></>;
}
const view = () => <FavoritesProvider><Probe /></FavoritesProvider>;
beforeEach(() => { mockAuth = { token: null, isLoggedIn: false }; localStorage.clear(); api.mockReset(); });
test('guest saves without API or sign-in, survives reload and removes', () => {
  const mounted = render(view()); fireEvent.click(screen.getByText('Toggle'));
  expect(readGuestFavorites()).toEqual([a]); expect(api).not.toHaveBeenCalled(); mounted.unmount();
  render(view()); expect(screen.getByTestId('ids')).toHaveTextContent(a); fireEvent.click(screen.getByText('Toggle')); expect(readGuestFavorites()).toEqual([]);
});
test('login merges guest list, clears it after success, logout hides account data', async () => {
  localStorage.setItem(guestFavoritesKey, JSON.stringify([a])); const mounted = render(view());
  api.mockResolvedValue([a, b]); mockAuth = { token: 'account-A', isLoggedIn: true }; mounted.rerender(view());
  await waitFor(() => expect(screen.getByTestId('ids')).toHaveTextContent(b));
  expect(api).toHaveBeenCalledWith('account-A', 'POST', [a], undefined, expect.any(AbortSignal)); expect(readGuestFavorites()).toEqual([]);
  mockAuth = { token: null, isLoggedIn: false }; mounted.rerender(view()); expect(screen.getByTestId('ids')).toBeEmptyDOMElement();
});
test('failed merge retains guest choices and retries safely', async () => {
  localStorage.setItem(guestFavoritesKey, JSON.stringify([a])); mockAuth = { token: 'account-A', isLoggedIn: true }; api.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce([a]); render(view());
  await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Offline')); expect(readGuestFavorites()).toEqual([a]);
  fireEvent.click(screen.getByText('Retry')); await waitFor(() => expect(screen.getByTestId('ids')).toHaveTextContent(a)); expect(readGuestFavorites()).toEqual([]);
});
test('late account response never restores data after logout', async () => {
  let resolve!: (ids: string[]) => void; api.mockReturnValue(new Promise(done => { resolve = done; })); mockAuth = { token: 'account-A', isLoggedIn: true }; const mounted = render(view());
  mockAuth = { token: null, isLoggedIn: false }; mounted.rerender(view()); await act(async () => resolve([b])); expect(screen.getByTestId('ids')).toBeEmptyDOMElement();
});
test('account removal uses explicit credentials and persists server result', async () => {
  mockAuth = { token: 'account-A', isLoggedIn: true }; api.mockResolvedValueOnce([a]).mockResolvedValueOnce([]); render(view());
  await waitFor(() => expect(screen.getByText('Toggle')).toBeEnabled()); fireEvent.click(screen.getByText('Toggle'));
  await waitFor(() => expect(api).toHaveBeenCalledWith('account-A', 'DELETE', undefined, a));
  await waitFor(() => expect(screen.getByTestId('ids')).toBeEmptyDOMElement());
});
test('corrupt storage is harmless and cross-tab guest changes update the list', () => {
  localStorage.setItem(guestFavoritesKey, '{bad'); render(view()); expect(screen.getByTestId('ids')).toBeEmptyDOMElement();
  localStorage.setItem(guestFavoritesKey, JSON.stringify([a, a, 'invalid'])); act(() => window.dispatchEvent(new StorageEvent('storage', { key: guestFavoritesKey })));
  expect(screen.getByTestId('ids').textContent).toBe(a);
});
