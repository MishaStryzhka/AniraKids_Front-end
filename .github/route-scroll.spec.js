const { test, expect } = require('@playwright/test');
const { policy } = require('./payment-fixtures');
const APP = 'http://127.0.0.1:4173';

async function setup(page) {
  const state = { errors: [], holdCatalogue: false, release: null };
  page.on('pageerror', error => state.errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('persist:auth', JSON.stringify({ token: JSON.stringify('scroll-test-session') }));
  });
  await page.route('**/api/users/current', route => route.fulfill({ json: { user: {
    _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', firstName: 'Jana', lastName: 'Nováková',
    email: 'jana@example.test', primaryPhoneNumber: '+420777123456',
  } } }));
  await page.route('**/api/users/favorites/storefront', route => route.fulfill({ json: { ids: [] } }));
  await page.route('http://admin-api.test/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/v2/site-settings') return route.fulfill({json:{cooperationActive:true,sections:{suits:true,familyLooks:false}}});
    if (url.pathname.endsWith('/booking-policy')) return route.fulfill({ json: policy });
    if (url.pathname.endsWith('/catalogue/products')) {
      if (state.holdCatalogue) await new Promise(resolve => { state.release = resolve; });
      return route.fulfill({ json: {
        items: Array.from({ length: 12 }, (_, i) => ({
          id: String(i + 1).padStart(24, '0'), slug: 'saty-' + i,
          name: 'Šaty ' + i, category: 'dress', photos: [], rentalPriceFrom: 500,
        })), page: 1, limit: 12, total: 12, totalPages: 1,
      } });
    }
    if (url.pathname.endsWith('/favorites')) return route.fulfill({ json: { ids: [] } });
    if (url.pathname.endsWith('/account/fittings')) return route.fulfill({json:{items:[],total:0,page:1,limit:20}});
    if (url.pathname.endsWith('/account/reservations')) return route.fulfill({ json: { items: [], page: 1, total: 0 } });
    return route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND' } } });
  });
  return state;
}

async function scrollTo(page, y) {
  await page.evaluate(y => window.scrollTo(0, y), y);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
  // Allow the scroll event to reach the same handlers used by touch/wheel input.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function navigate(page, width, name) {
  if (width < 1024) {
    await page.locator('[data-menu-trigger]').click();
    await expect(page.locator('#mobile-menu')).toBeVisible();
    await page.locator('#mobile-menu').getByRole('link', { name, exact: true }).click();
    await expect(page.locator('#mobile-menu')).toHaveCount(0);
  } else {
    await page.locator('[data-storefront-header]').getByRole('link', { name, exact: true }).click();
  }
}

for (const width of [375, 390, 430, 768, 1024, 1440]) {
  test('catalogue navigation, Back and Forward restore the right scroll at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const state = await setup(page);
    await page.goto(APP + '/saty');
    await expect(page.getByRole('link', { name: 'Prohlédnout Šaty 11', exact: true })).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await scrollTo(page, 1200);
    if (width < 1024) {
      await page.locator('[data-menu-trigger]').click();
      await page.keyboard.press('Escape');
      await expect(page.locator('#mobile-menu')).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => Math.abs(window.scrollY - 1200))).toBeLessThanOrEqual(1);
    }
    await navigate(page, width, 'Dámské šaty');
    await expect(page.getByRole('heading', { name: 'Dámské šaty', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Prohlédnout Šaty 11', exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await scrollTo(page, 900);

    // Back must wait for catalogue data before restoring a deep position.
    state.holdCatalogue = true;
    await page.goBack();
    await expect.poll(() => typeof state.release).toBe('function');
    state.holdCatalogue = false;
    state.release();
    await expect.poll(() => page.evaluate(() => Math.abs(window.scrollY - 1200))).toBeLessThanOrEqual(1);
    await page.goForward();
    await expect.poll(() => page.evaluate(() => Math.abs(window.scrollY - 900))).toBeLessThanOrEqual(1);

    await navigate(page, width, 'Dívčí šaty');
    await expect(page.getByRole('link', { name: 'Prohlédnout Šaty 11', exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    expect(state.errors).toEqual([]);
    await page.screenshot({ path: 'test-evidence/customer-booking/route-scroll-' + width + '.png' });
  });
}

for (const width of [390, 1440]) {
  test('account to favorites starts at the top at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 });
    const state = await setup(page);
    await page.goto(APP + '/ucet');
    await expect(page.getByRole('button', { name: 'Odhlásit se', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox').first()).toBeVisible();
    await scrollTo(page, 450);
    await navigate(page, width, 'Oblíbené');
    await expect(page.getByRole('heading', { name: 'Oblíbené', exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    expect(state.errors).toEqual([]);
  });

  test('footer navigation and anchors at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 });
    const state = await setup(page);
    await page.goto(APP + '/faq');
    await page.locator('footer').getByRole('link', { name: 'Jak funguje pronájem', exact: true }).click();
    await expect(page).toHaveURL(APP + '/pronajem#jak-funguje-pronajem');
    await expect.poll(() => page.locator('#jak-funguje-pronajem').evaluate(el =>
      Math.abs(el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop || '0'))
    )).toBeLessThan(1);
    await page.locator('footer').getByRole('link', { name: 'Kontakt', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Kontakt', exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    expect(state.errors).toEqual([]);
  });
}
