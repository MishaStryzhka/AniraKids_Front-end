import {
  emptyPaymentDraft,
  paymentDraftErrors,
  paymentOperation,
} from './paymentModel';
import {
  isPaymentUuid,
  parsePayments,
  operationMatches,
} from '../api/reservationPayments';
import {
  paymentLedgerFixture as ledger,
  paymentOperationFixture as operation,
  recordedPaymentFixture as recorded,
} from './paymentFixtures';
import {
  loadPaymentAttempt,
  savePaymentAttempt,
} from './paymentAttemptStorage';
Object.defineProperty(globalThis, 'crypto', {
  value: require('crypto').webcrypto,
  configurable: true,
});
beforeEach(() => sessionStorage.clear());
test.each(['0', '-1', '1.2', '1000001', 'abc'])(
  'rejects invalid whole Kč amount %s',
  amount =>
    expect(
      paymentDraftErrors({ ...emptyPaymentDraft(), amount }, 'pending').amount
    ).toBeDefined()
);
test('refund/fee and cancelled receipts require reasons; fees only cancelled, no cash method', () => {
  const draft = {
    ...emptyPaymentDraft(),
    amount: '200',
    type: 'cancellation_fee' as const,
  };
  expect(paymentDraftErrors(draft, 'pending')).toHaveProperty('type');
  expect(paymentDraftErrors(draft, 'cancelled')).toHaveProperty('note');
  const valid = { ...draft, note: ' Individuálně posouzeno ' };
  expect(paymentDraftErrors(valid, 'cancelled')).toEqual({});
  const body = paymentOperation(valid, ledger);
  expect(body.method).toBeUndefined();
  expect(body.note).toBe('Individuálně posouzeno');
  expect(isPaymentUuid(body.operationId)).toBe(true);
  expect(
    paymentDraftErrors({ ...draft, type: 'rental_refunded' }, 'returned')
  ).toHaveProperty('note');
  expect(
    paymentDraftErrors({ ...draft, type: 'advance_received' }, 'cancelled')
  ).toHaveProperty('note');
  expect(
    paymentDraftErrors(
      { ...valid, reference: 'x'.repeat(121), note: 'x'.repeat(501) },
      'cancelled'
    )
  ).toMatchObject({ reference: expect.any(String), note: expect.any(String) });
});
test('scoped ledger parsing rejects wrong currency/identity, malformed amounts and duplicate operations', () => {
  expect(parsePayments({ payments: recorded }, 'r1')).toEqual(recorded);
  for (const change of [
    { reservationId: 'r2' },
    { currency: 'EUR' },
    { rentalBalance: -1 },
    { entries: [recorded.entries[0], recorded.entries[0]] },
  ])
    expect(() =>
      parsePayments({ payments: { ...recorded, ...change } }, 'r1')
    ).toThrow();
  expect(
    operationMatches(recorded.entries[0], {
      ...operation,
      expectedRevision: 99,
    })
  ).toBe(true);
  expect(
    operationMatches(recorded.entries[0], { ...operation, amount: 201 })
  ).toBe(false);
});
test('immutable attempt survives reload per admin/reservation; malformed stored payload fails closed', () => {
  savePaymentAttempt('admin1', 'r1', operation);
  expect(loadPaymentAttempt('admin1', 'r1')).toEqual(operation);
  expect(loadPaymentAttempt('admin2', 'r1')).toBeNull();
  expect(loadPaymentAttempt('admin1', 'r2')).toBeNull();
  sessionStorage.setItem('anirakids:payment-attempt:v1:admin1:r1', '{broken');
  expect(() => loadPaymentAttempt('admin1', 'r1')).toThrow();
});

jest.mock('../api/client', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn() },
  buildAdminRequestConfig: jest.fn(),
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
