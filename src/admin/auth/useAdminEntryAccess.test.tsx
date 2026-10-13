import { act, renderHook, waitFor } from '@testing-library/react';
import { useAdminEntryAccess } from './useAdminEntryAccess';
import { probeAdminAccess } from '../api/client';

let mockAuth: any;
jest.mock('../../hooks/useAuth', () => ({ useAuth: () => mockAuth }));
jest.mock('../api/client', () => ({ probeAdminAccess: jest.fn() }));
const probe = probeAdminAccess as jest.Mock;
beforeEach(() => {
  probe.mockReset();
  mockAuth = { token: 'admin-session', user: { _id: 'admin-user' }, isLoggedIn: true, isRefreshing: false };
});

test.each(['guest', 'refreshing'])('does not probe or expose the entry while %s', state => {
  mockAuth = state === 'guest' ? { token: null, user: null, isLoggedIn: false, isRefreshing: false } : { ...mockAuth, isRefreshing: true };
  const { result } = renderHook(useAdminEntryAccess);
  expect(result.current).toBe(false);
  expect(probe).not.toHaveBeenCalled();
});

test('waits for server confirmation and aborts when unmounted', async () => {
  let allow!: () => void;
  probe.mockReturnValue(new Promise<void>(resolve => { allow = resolve; }));
  const { result, unmount } = renderHook(useAdminEntryAccess);
  expect(result.current).toBe(false);
  await act(async () => allow());
  expect(result.current).toBe(true);
  const signal = probe.mock.calls[0][0].signal;
  unmount(); expect(signal.aborted).toBe(true);
});

test.each(['forbidden', 'network_error', 'admin_disabled'])('%s keeps the entry hidden', async kind => {
  probe.mockRejectedValue({ kind });
  const { result } = renderHook(useAdminEntryAccess);
  await act(async () => {});
  expect(result.current).toBe(false);
});

test('logout removes access immediately and late results cannot restore it', async () => {
  let allow!: () => void;
  probe.mockReturnValue(new Promise<void>(resolve => { allow = resolve; }));
  const { result, rerender } = renderHook(useAdminEntryAccess);
  mockAuth = { token: null, user: null, isLoggedIn: false, isRefreshing: false };
  rerender();
  expect(result.current).toBe(false);
  expect(probe.mock.calls[0][0].signal.aborted).toBe(true);
  await act(async () => allow());
  expect(result.current).toBe(false);
});

test('switching accounts never reuses the previous confirmation', async () => {
  probe.mockResolvedValueOnce(undefined).mockRejectedValueOnce({ kind: 'forbidden' });
  const { result, rerender } = renderHook(useAdminEntryAccess);
  await waitFor(() => expect(result.current).toBe(true));
  mockAuth = { ...mockAuth, token: 'customer-session', user: { _id: 'customer-user' } };
  rerender(); expect(result.current).toBe(false);
  await act(async () => {});
  expect(result.current).toBe(false);
  expect(probe.mock.calls[1][0].token).toBe('customer-session');
});

test('returning to the window rechecks access and hides a revoked entry', async () => {
  probe.mockResolvedValueOnce(undefined).mockRejectedValueOnce({ kind: 'forbidden' });
  const { result } = renderHook(useAdminEntryAccess);
  await waitFor(() => expect(result.current).toBe(true));
  await act(async () => window.dispatchEvent(new Event('focus')));
  expect(result.current).toBe(false);
  expect(probe).toHaveBeenCalledTimes(2);
});
