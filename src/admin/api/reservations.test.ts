import { adminApiClient, buildAdminRequestConfig } from './client';
import {
  getAdminReservationDetail,
  listAdminReservations,
  parseReservationDetail,
  parseReservationList,
  reservationListParams,
} from './reservations';
import {
  reservationDetailFixture as detail,
  reservationListFixture as row,
  reservationListResponseFixture as list,
} from '../reservations/reservationFixtures';
jest.mock('./client', () => ({
  adminApiClient: { get: jest.fn() },
  buildAdminRequestConfig: jest.fn(),
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
const get = adminApiClient.get as jest.Mock;
beforeEach(() => {
  jest.clearAllMocks();
  (buildAdminRequestConfig as jest.Mock).mockImplementation(
    (token, signal) => ({
      baseURL: 'https://api.test/api/v2',
      headers: { Authorization: `Bearer ${token}` },
      signal,
    })
  );
});
test('list sends only supported query, trimmed search, fixed20 and inclusive rental dates', async () => {
  const response = {
    ...list,
    pagination: { page: 2, limit: 20, total: 21, pages: 2 },
  };
  get.mockResolvedValue({ data: response });
  const signal = new AbortController().signal;
  expect(
    await listAdminReservations({
      token: 'token',
      signal,
      query: {
        page: 2,
        q: ' Jana ',
        status: 'cancelled',
        paymentStatus: 'refunded',
        rentalMode: 'studio',
        from: '2026-12-01',
        to: '2027-01-31',
      },
    })
  ).toEqual(response);
  expect(get).toHaveBeenCalledWith(
    '/admin/reservations',
    expect.objectContaining({
      signal,
      headers: { Authorization: 'Bearer token' },
      params: {
        page: 2,
        limit: 20,
        q: 'Jana',
        status: 'cancelled',
        paymentStatus: 'refunded',
        rentalMode: 'studio',
        from: '2026-12-01',
        to: '2027-01-31',
      },
    })
  );
});
test('detail is a direct object, checks requested identity, preserves missing inventory snapshots and whole Kč', async () => {
  get.mockResolvedValue({ data: detail });
  expect(
    await getAdminReservationDetail({ token: 'token', reservationId: 'r1' })
  ).toEqual(detail);
  expect(get).toHaveBeenCalledWith(
    '/admin/reservations/r1',
    expect.any(Object)
  );
  expect(parseReservationDetail(detail).totalDue).toBe(1700);
  expect(parseReservationDetail(detail).items[0].inventoryCurrent).toBeNull();
  get.mockResolvedValue({ data: { ...detail, id: 'another' } });
  await expect(
    getAdminReservationDetail({ token: 'token', reservationId: 'r1' })
  ).rejects.toMatchObject({ code: 'ADMIN_RESERVATION_INVALID_RESPONSE' });
});
test('unknown server enums remain valid data for localized presentation fallbacks', () => {
  expect(
    parseReservationList({
      ...list,
      items: [
        {
          ...row,
          status: 'future',
          paymentStatus: 'future',
          rentalMode: 'future',
        },
      ],
    }).items
  ).toHaveLength(1);
});
test.each([
  null,
  { items: null, pagination: list.pagination },
  { ...list, pagination: { ...list.pagination, total: 22, pages: 1 } },
  { ...list, items: [{ ...row, totalDue: 17.5 }] },
  { ...list, items: [{ ...row, pendingExpired: null }] },
  { ...list, items: [{ ...row, startDate: '2026-02-30' }] },
])('malformed list is rejected, not shown as empty (%j)', value =>
  expect(() => parseReservationList(value)).toThrow()
);
test.each([
  { product: detail },
  { ...detail, expiresAt: undefined },
  { ...detail, items: [{ ...detail.items[0], inventoryCurrent: {} }] },
  { ...detail, endDate: '2026-12-01' },
])('malformed detail is rejected (%j)', value =>
  expect(() => parseReservationDetail(value)).toThrow()
);
test('invalid search or date interval never becomes a request; q empty omitted; no invented 366day list bound', () => {
  expect(() =>
    reservationListParams({ page: 1, q: 'a'.repeat(201) })
  ).toThrow();
  expect(() =>
    reservationListParams({ page: 1, from: '2027-01-01', to: '2026-01-01' })
  ).toThrow();
  expect(
    reservationListParams({
      page: 1,
      q: ' ',
      from: '2020-01-01',
      to: '2026-01-01',
    })
  ).toEqual({ page: 1, limit: 20, from: '2020-01-01', to: '2026-01-01' });
});

test('list rejects a pagination echo that does not match the requested page or fixed limit', async () => {
  get.mockResolvedValue({ data: list });
  await expect(
    listAdminReservations({ token: 'token', query: { page: 2 } })
  ).rejects.toMatchObject({ code: 'ADMIN_RESERVATION_INVALID_RESPONSE' });
  get.mockResolvedValue({
    data: { ...list, pagination: { page: 1, limit: 10, total: 1, pages: 1 } },
  });
  await expect(
    listAdminReservations({ token: 'token', query: { page: 1 } })
  ).rejects.toMatchObject({ code: 'ADMIN_RESERVATION_INVALID_RESPONSE' });
});
