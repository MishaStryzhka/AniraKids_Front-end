import {
  appendReservationPayment,
  getReservationPayments,
} from './reservationPayments';
import { adminApiClient, buildAdminRequestConfig } from './client';
import {
  recordedPaymentFixture as recorded,
  paymentOperationFixture as operation,
} from '../payments/paymentFixtures';
jest.mock('./client', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn() },
  buildAdminRequestConfig: jest.fn(),
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
beforeEach(() => {
  (buildAdminRequestConfig as jest.Mock).mockReturnValue({
    headers: { Authorization: 'Bearer fixture' },
  });
});
test('read and append keep scope, auth config and exact operation body', async () => {
  (adminApiClient.get as jest.Mock).mockResolvedValue({
    data: { payments: recorded },
  });
  expect(
    await getReservationPayments({ token: 'fixture', reservationId: 'r1' })
  ).toEqual(recorded);
  (adminApiClient.post as jest.Mock).mockResolvedValue({
    status: 200,
    data: { payments: recorded },
  });
  expect(
    await appendReservationPayment({
      token: 'fixture',
      reservationId: 'r1',
      operation,
    })
  ).toEqual(recorded);
  expect(adminApiClient.post).toHaveBeenCalledWith(
    '/admin/reservations/r1/payments',
    operation,
    { headers: { Authorization: 'Bearer fixture' } }
  );
});
test.each([
  { ...recorded, reservationId: 'r2' },
  { ...recorded, entries: [] },
  { ...recorded, entries: [{ ...recorded.entries[0], amount: 201 }] },
])('mismatched/missing append receipt remains unknown', async payments => {
  (adminApiClient.post as jest.Mock).mockResolvedValue({
    status: 200,
    data: { payments },
  });
  await expect(
    appendReservationPayment({
      token: 'fixture',
      reservationId: 'r1',
      operation,
    })
  ).rejects.toMatchObject({ code: 'ADMIN_PAYMENT_INVALID_RESPONSE' });
});
