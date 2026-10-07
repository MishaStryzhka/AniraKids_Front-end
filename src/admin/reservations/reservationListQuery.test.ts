import {
  buildReservationSearch,
  parseReservationSearch,
  validateReservationDates,
} from './reservationListQuery';
import {
  customerName,
  money,
  reservationPayment,
  reservationStatus,
} from './reservationPresentation';
jest.mock('../api/client', () => ({
  adminApiClient: { get: jest.fn() },
  buildAdminRequestConfig: jest.fn(),
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
test('public URL state has only canonical filters and page, never customer search', () => {
  const state = parseReservationSearch(
    new URLSearchParams(
      'q=private-email&status=cancelled&paymentStatus=refunded&page=2&limit=100&foo=bar'
    )
  );
  expect(buildReservationSearch(state).toString()).toBe(
    'status=cancelled&paymentStatus=refunded&page=2'
  );
  expect(
    parseReservationSearch(
      new URLSearchParams('status=bad&page=0&from=invalid')
    ).page
  ).toBe(1);
});
test('date draft validation is calendar only and permits one-sided filters', () => {
  expect(validateReservationDates('2024-02-29', '2024-03-01')).toBeNull();
  expect(validateReservationDates('2026-02-29', '')).toBe(
    'Zadejte platné datum.'
  );
  expect(validateReservationDates('2027-01-01', '2026-12-31')).toBe(
    'Datum od nesmí být pozdější než datum do.'
  );
  expect(validateReservationDates('', '2026-12-31')).toBeNull();
});
test('money is integer Kč, names and future enums have safe copy', () => {
  expect(money(1700).replace(/\s/g, '')).toBe('1700Kč');
  expect(
    customerName({ firstName: ' ', lastName: '', email: '', phone: '' })
  ).toBe('Jméno neuvedeno');
  expect(reservationStatus('cancelled').label).toBe('Zrušená');
  expect(reservationPayment('__proto__').label).toBe('Neznámý stav platby');
});
