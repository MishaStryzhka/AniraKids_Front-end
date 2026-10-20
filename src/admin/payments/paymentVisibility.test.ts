import { isEmptyPaymentLedger, visiblePaymentTypes } from './paymentModel';
import { paymentLedgerFixture } from './paymentFixtures';
test('empty means no history or received amounts and never unresolved legacy data', () => {
  const p = { ...paymentLedgerFixture, entries: [], rentalReceived: 0, rentalRefunded: 0, rentalNet: 0, depositReceived: 0, depositRefunded: 0, depositHeld: 0, cancellationFee: 0, legacyUnreconciled: false };
  expect(isEmptyPaymentLedger(p)).toBe(true);
  expect(isEmptyPaymentLedger({ ...p, fittingCredit: 200 })).toBe(false);
  expect(visiblePaymentTypes({ ...p, fittingCredit: 200, advanceBalance: 0 }, 'pending')).not.toContain('advance_received');
  expect(isEmptyPaymentLedger({ ...p, legacyUnreconciled: true })).toBe(false);
  expect(isEmptyPaymentLedger({ ...p, rentalReceived: 200, rentalRefunded: 200 })).toBe(false);
  expect(visiblePaymentTypes(p, 'pending')).toEqual(['advance_received', 'rental_received', 'deposit_received']);
  expect(visiblePaymentTypes({ ...p, refundableRental: 200, depositHeld: 2000 }, 'confirmed')).toContain('rental_refunded');
  expect(visiblePaymentTypes({ ...p, refundableRental: 200, depositHeld: 2000 }, 'confirmed')).toContain('deposit_refunded');
  expect(visiblePaymentTypes(p, 'cancelled')).toContain('cancellation_fee');
  expect(visiblePaymentTypes(p, 'cancelled')).not.toContain('cancellation_fee_reversed');
  expect(visiblePaymentTypes({ ...p, cancellationFee: 100 }, 'cancelled')).toContain('cancellation_fee_reversed');
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

test('deposit receipt is unavailable without an outstanding deposit, but held funds remain refundable', () => {
  const p = {...paymentLedgerFixture, depositRequired:0, depositHeld:0};
  expect(visiblePaymentTypes(p, 'confirmed')).not.toContain('deposit_received');
  expect(visiblePaymentTypes({...p, depositHeld:2000}, 'confirmed')).toContain('deposit_refunded');
  expect(visiblePaymentTypes({...p, depositRequired:2000,depositHeld:2000}, 'confirmed')).not.toContain('deposit_received');
});
