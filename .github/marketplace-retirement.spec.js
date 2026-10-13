const { test, expect } = require('@playwright/test');
const { policy } = require('./payment-fixtures');
const APP = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';
const profile = { _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', firstName: 'Jana', lastName: 'Nováková',
  email: 'jana@example.test', emailVerified: true, primaryPhoneNumber: '+420777123456',
  // Old responses/session shapes must not restore the retired UI.
  typeUser: 'owner', billingDetails: { name: 'Archived' }, bankAccount: { IBAN: 'Archived' } };
async function setup(page, signedIn = true) {
  const state = { errors: [], retiredRequests: [], writes: [] };
  page.on('pageerror', error => state.errors.push(error.message));
  page.on('request', request => {
    const path = new URL(request.url()).pathname;
    if (/^\/api\/(product|order)(\/|$)|update-billing-details|update-bank-account|\/api\/users\/favorites\/(add|remove)/.test(path)) state.retiredRequests.push(path);
    if (path.startsWith('/api/') && !['GET', 'OPTIONS'].includes(request.method())) state.writes.push(path);
  });
  if (signedIn) await page.addInitScript(() => localStorage.setItem('persist:auth', JSON.stringify({ token: JSON.stringify('fixture-session') })));
  await page.route('**/api/users/current', route => route.fulfill({ json: { user: profile } }));
  await page.route('**/api/users/favorites/storefront', route => route.fulfill({ json: { ids: [] } }));
  await page.route('http://admin-api.test/**', route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/booking-policy')) return route.fulfill({ json: policy });
    if (url.pathname.endsWith('/account/reservations')) return route.fulfill({ json: { items: [], total: 0, page: 1 } });
    if (url.pathname.endsWith('/catalogue/products')) return route.fulfill({ json: { items: [], page: 1, limit: 12, total: 0, totalPages: 0 } });
    return route.fulfill({ status: 404 });
  });
  return state;
}
const links = [
  ['/my-account', '/ucet'], ['/my-account/profile', '/ucet'],
  ['/my-account/rent-out', '/ucet'], ['/my-account/rent-out/add-product', '/ucet'],
  ['/my-account/rent-out/update-product/fixture', '/ucet'],
  ['/my-account/wallet', '/ucet'], ['/my-account/chat', '/ucet'],
  ['/my-account/my-orders/order/fixture', '/ucet/rezervace'],
  ['/my-account/my-purchases/purchase/fixture', '/ucet/rezervace'],
  ['/my-account/rent-in', '/ucet/rezervace'],
  ['/my-account/cart', '/rezervace'], ['/cart', '/rezervace'],
  ['/my-account/favorite', '/oblibene'], ['/favorite', '/oblibene'],
];
for (const signedIn of [true, false]) test('historical links resolve without marketplace API calls: signed in ' + signedIn, async ({ page }) => {
  const state = await setup(page, signedIn);
  for (const [oldPath, currentPath] of links) {
    await page.goto(APP + oldPath);
    await expect(page).toHaveURL(APP + currentPath);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByText(/STÁT SE PRONAJÍMATELEM|BillingDetails|BankAccount/)).toHaveCount(0);
  }
  expect(state.errors).toEqual([]);
  expect(state.retiredRequests).toEqual([]);
  expect(state.writes).toEqual([]);
});
for (const width of [375, 390, 430, 768, 1024, 1440]) test('former owner profile and current about page at ' + width, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  const state = await setup(page);
  await page.goto(APP + '/ucet');
  await expect(page.getByLabel('Jméno', { exact: true })).toHaveValue(profile.firstName);
  await expect(page.getByText(/STÁT SE PRONAJÍMATELEM|BillingDetails|BankAccount|Archived/)).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'test-evidence/customer-booking/retired-owner-profile-' + width + '.png' });
  await page.goto(APP + '/aboutUs');
  await expect(page.getByText('Pronájem z našeho katalogu', { exact: true })).toBeVisible();
  await expect(page.getByText(/pasivní příjem|monetizaci|nabízet a pronajímat své věci|Pronajímatel mě požádal/)).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  expect(state.errors).toEqual([]);
  expect(state.retiredRequests).toEqual([]);
});
