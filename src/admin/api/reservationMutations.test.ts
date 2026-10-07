import { adminApiClient, buildAdminRequestConfig } from './client';
import {
  changeAdminReservation,
  parseReservationMutation,
  reservationTargets,
  type ReservationTransition,
} from './reservationMutations';
jest.mock('./client', () => ({
  adminApiClient: { post: jest.fn(), patch: jest.fn() },
  buildAdminRequestConfig: jest.fn(),
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
const receipt = {
  id: 'r1',
  reservationNumber: 'AK-1',
  status: 'confirmed',
  paymentStatus: 'unpaid',
  pendingExpired: false,
};
const post = adminApiClient.post as jest.Mock,
  patch = adminApiClient.patch as jest.Mock;
beforeEach(() => {
  jest.clearAllMocks();
  (buildAdminRequestConfig as jest.Mock).mockImplementation(
    (token, signal) => ({
      headers: { Authorization: `Bearer ${token}` },
      signal,
    })
  );
});
test.each([
  'confirm',
  'prepare',
  'rent',
  'return',
  'cancel',
] as ReservationTransition[])(
  '%s uses one explicit POST, correct target and wrapped receipt',
  async action => {
    post.mockResolvedValue({
      data: { reservation: { ...receipt, status: reservationTargets[action] } },
    });
    const signal = new AbortController().signal;
    await changeAdminReservation({
      token: 'token',
      reservationId: 'r1',
      signal,
      change: {
        action,
        ...(action === 'cancel' ? { reason: '  Žádost zákaznice  ' } : {}),
      },
    });
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith(
      `/admin/reservations/r1/${action}`,
      action === 'cancel' ? { reason: 'Žádost zákaznice' } : {},
      expect.objectContaining({
        headers: { Authorization: 'Bearer token' },
        signal,
      })
    );
    expect(patch).not.toHaveBeenCalled();
  }
);
test('notes PATCH trims, clears with empty string, and permits missing notes in cleared receipt', async () => {
  patch.mockResolvedValueOnce({
    data: { reservation: { ...receipt, notes: 'Nová poznámka' } },
  });
  await changeAdminReservation({
    token: 'token',
    reservationId: 'r1',
    change: { action: 'notes', notes: ' Nová poznámka ' },
  });
  expect(patch).toHaveBeenLastCalledWith(
    '/admin/reservations/r1/notes',
    { notes: 'Nová poznámka' },
    expect.any(Object)
  );
  patch.mockResolvedValueOnce({ data: { reservation: receipt } });
  await changeAdminReservation({
    token: 'token',
    reservationId: 'r1',
    change: { action: 'notes', notes: ' ' },
  });
  expect(patch).toHaveBeenLastCalledWith(
    '/admin/reservations/r1/notes',
    { notes: '' },
    expect.any(Object)
  );
});
test.each([
  receipt,
  { reservation: { ...receipt, id: 'another' } },
  { reservation: { ...receipt, status: 'pending' } },
  { reservation: { ...receipt, pendingExpired: null } },
  { reservation: { ...receipt, updatedAt: 'invalid' } },
])(
  'malformed or mismatched success is rejected for unknown-outcome recovery',
  value => {
    expect(() =>
      parseReservationMutation(value, 'r1', { action: 'confirm' })
    ).toThrow();
  }
);
test('notes success must match requested trimmed value; unknown payment enum remains safe', () => {
  expect(() =>
    parseReservationMutation(
      { reservation: { ...receipt, notes: 'old' } },
      'r1',
      { action: 'notes', notes: 'new' }
    )
  ).toThrow();
  expect(
    parseReservationMutation(
      { reservation: { ...receipt, paymentStatus: 'future' } },
      'r1',
      { action: 'confirm' }
    ).paymentStatus
  ).toBe('future');
});
test('invalid reason/notes never reaches transport, transport failure is never retried', async () => {
  for (const change of [
    { action: 'cancel' as const, reason: ' ' },
    { action: 'cancel' as const, reason: 'x'.repeat(501) },
    { action: 'notes' as const, notes: 'x'.repeat(1501) },
  ])
    await expect(
      changeAdminReservation({ token: 'token', reservationId: 'r1', change })
    ).rejects.toMatchObject({ code: 'ADMIN_RESERVATION_INVALID_CHANGE' });
  expect(post).not.toHaveBeenCalled();
  expect(patch).not.toHaveBeenCalled();
  post.mockRejectedValue(new Error('offline'));
  await expect(
    changeAdminReservation({
      token: 'token',
      reservationId: 'r1',
      change: { action: 'confirm' },
    })
  ).rejects.toThrow();
  expect(post).toHaveBeenCalledTimes(1);
});
