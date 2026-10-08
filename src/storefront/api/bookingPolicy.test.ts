import {
  parseBookingPolicy,
  parseReceiptPayment,
  validCzechIban,
} from './bookingPolicy';
import { getBookingPolicy, parseReceipt } from './publicApi';
import {
  bookingPolicyFixture as policy,
  receipt,
  receiptPaymentFixture as payment,
} from '../booking/bookingFixtures';
test('policy uses direct guest response, valid Czech bank and manual terms only', async () => {
  process.env.REACT_APP_V2_API_BASE_URL = 'https://public.test/api/v2';
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, status: 200, json: async () => policy });
  expect(await getBookingPolicy()).toEqual(policy);
  expect(global.fetch).toHaveBeenCalledWith(
    'https://public.test/api/v2/booking-policy',
    expect.objectContaining({
      credentials: 'omit',
      headers: { Accept: 'application/json' },
    })
  );
  expect(() => parseBookingPolicy({ policy })).toThrow();
  expect(() =>
    parseBookingPolicy({
      ...policy,
      cancellation: { feeAmount: 200, automatic: true },
    })
  ).toThrow();
  expect(validCzechIban(policy.bank.iban)).toBe(true);
  expect(validCzechIban(policy.bank.iban.replace('CZ07', 'CZ08'))).toBe(false);
  expect(() =>
    parseBookingPolicy({
      ...policy,
      bank: { ...policy.bank, accountNumber: '123/0800' },
    })
  ).toThrow();
});
test('receipt retains sanitized payment information, legacy receipts and later statuses remain valid', () => {
  expect(
    parseReceipt({
      reservation: { ...receipt, payment, guestAccessToken: 'secret' },
    })
  ).toEqual({ ...receipt, payment });
  expect(parseReceipt({ reservation: receipt })).toEqual(receipt);
  expect(
    parseReceipt({ reservation: { ...receipt, payment: null } }).payment
  ).toBeNull();
  expect(
    parseReceipt({
      reservation: {
        ...receipt,
        status: 'confirmed',
        payment: { ...payment, advanceBalance: 0, paymentInstructions: null },
      },
    }).status
  ).toBe('confirmed');
});
test.each([
  { amount: 201 },
  { currency: 'EUR' },
  { message: 'OTHER' },
  { qrPayload: 'SPD*1.0*ACC:OTHER' },
  { iban: 'CZ0808000000006644781399' },
])('inconsistent payment instructions fail closed %j', change => {
  expect(() =>
    parseReceiptPayment(
      {
        ...payment,
        paymentInstructions: { ...payment.paymentInstructions, ...change },
      },
      receipt
    )
  ).toThrow();
});
