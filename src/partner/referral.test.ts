import { getReferralToken } from './referral';
import { discountQuotes } from './discount';
import { parseBody } from '../storefront/booking/bookingModel';
import { body } from '../storefront/booking/bookingFixtures';
beforeEach(() => localStorage.clear());
test('referral expires and malformed storage cannot break booking', () => {
  localStorage.setItem(
    'anirak.referral.v1',
    JSON.stringify({ token: 'signed.token', expiresAt: Date.now() + 10000 })
  );
  expect(getReferralToken()).toBe('signed.token');
  localStorage.setItem(
    'anirak.referral.v1',
    JSON.stringify({ token: 'signed.token', expiresAt: Date.now() - 1 })
  );
  expect(getReferralToken()).toBeUndefined();
  localStorage.setItem('anirak.referral.v1', 'broken');
  expect(getReferralToken()).toBeUndefined();
});
test('retry preserves original referral despite a later click', () => {
  localStorage.setItem(
    'anirak.referral.v1',
    JSON.stringify({ token: 'new.token', expiresAt: Date.now() + 10000 })
  );
  expect(
    parseBody({ ...body, referralToken: 'original.token' }).referralToken
  ).toBe('original.token');
});
test('highest eligible dress is full price, discounts preserve deposits and order', () => {
  const items = [500, 700, 900].map((rentalPrice, index) => ({
    ...body,
    available: true,
    checkedAt: new Date().toISOString(),
    additionalDressDiscount: index < 2 ? 20 : undefined,
    pricing: { rentalPrice, deposit: 1000, totalDue: rentalPrice + 1000 },
  }));
  const result = discountQuotes(items);
  expect(result.map(i => i.pricing.rentalPrice)).toEqual([400, 700, 900]);
  expect(result.map(i => i.pricing.deposit)).toEqual([1000, 1000, 1000]);
  expect(items[0].pricing.rentalPrice).toBe(500);
});
