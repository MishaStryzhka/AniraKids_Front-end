import { act, renderHook, waitFor } from '@testing-library/react';
import { usePartnerEntryAccess } from './usePartnerEntryAccess';
import { partnerApi } from './api';
let mockAuth: any;
jest.mock('../hooks/useAuth', () => ({ useAuth: () => mockAuth }));
jest.mock('./api', () => ({ partnerApi: jest.fn() }));
const probe = partnerApi as jest.Mock;
const access = { enabled: true, partnerId: 'blaze', role: 'administrator' };
beforeEach(() => {
  probe.mockReset();
  mockAuth = {
    token: 'staff',
    user: { _id: 'staff-id' },
    isLoggedIn: true,
    isRefreshing: false,
  };
});
test.each(['administrator', 'photographer'])(
  'exposes entry after server confirms %s',
  async role => {
    probe.mockResolvedValue({ ...access, role });
    const { result } = renderHook(usePartnerEntryAccess);
    expect(result.current).toBe(false);
    await waitFor(() => expect(result.current).toBe(true));
  }
);
test('guests do not probe', () => {
  mockAuth.isLoggedIn = false;
  const { result } = renderHook(usePartnerEntryAccess);
  expect(result.current).toBe(false);
  expect(probe).not.toHaveBeenCalled();
});
test('disabled partner stays hidden', async () => {
  probe.mockResolvedValue({ ...access, enabled: false });
  const { result } = renderHook(usePartnerEntryAccess);
  await act(async () => {});
  expect(result.current).toBe(false);
});
test('account change ignores late permission from previous user', async () => {
  let allow: any;
  probe
    .mockImplementationOnce(
      () =>
        new Promise(r => {
          allow = r;
        })
    )
    .mockRejectedValue(new Error());
  const { result, rerender } = renderHook(usePartnerEntryAccess);
  mockAuth = { ...mockAuth, token: 'customer', user: { _id: 'customer' } };
  rerender();
  await act(async () => allow(access));
  expect(result.current).toBe(false);
});
test('focus checks revocation', async () => {
  probe.mockResolvedValueOnce(access).mockRejectedValue(new Error());
  const { result } = renderHook(usePartnerEntryAccess);
  await waitFor(() => expect(result.current).toBe(true));
  await act(async () => window.dispatchEvent(new Event('focus')));
  expect(result.current).toBe(false);
});
