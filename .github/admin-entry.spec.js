const { test, expect } = require('@playwright/test');
const fs = require('fs');
const APP = 'http://127.0.0.1:4173';
fs.mkdirSync('test-evidence/admin-entry', { recursive: true });

async function setup(page, { guest = false, status = 200, delayed = false } = {}) {
  const state = { probes: 0, writes: [], errors: [], release: null };
  page.on('pageerror', error => state.errors.push(error.message));
  if (!guest) await page.addInitScript(() => localStorage.setItem('persist:auth', JSON.stringify({ token: JSON.stringify('admin-entry-fixture') })));
  await page.route('https://example.test/**', route => {
    const pathname = new URL(route.request().url()).pathname;
    if (route.request().method() !== 'GET') state.writes.push(pathname);
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(pathname === '/api/users/current' ? { user: { _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', firstName: 'Jana', email: 'jana@example.test', emailVerified: true } } : { favorites: [] }) });
  });
  await page.route('http://admin-api.test/**', async route => {
    const request = route.request(), pathname = new URL(request.url()).pathname;
    if (request.method() !== 'GET') state.writes.push(pathname);
    if (pathname === '/api/v2/admin/products') {
      state.probes++;
      if (delayed) { await new Promise(resolve => { state.release = resolve; }); delayed = false; }
      if (status === 'network') return route.abort('failed');
      return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(status === 200 ? { items: [], total: 0 } : { error: { code: status === 403 ? 'ADMIN_FORBIDDEN' : 'ADMIN_API_DISABLED', message: 'Unavailable' } }) });
    }
    if (pathname === '/api/v2/admin/overview') {
      const group = { total: 0, items: [] };
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ today: '2026-10-13', loadedAt: '2026-10-13T12:00:00Z', pending: group, pickups: group, returns: group, deposits: group, overdue: 0, unpaid: 0, maintenance: 0, drafts: 0 }) });
    }
    return route.fulfill({ contentType: 'application/json', body: '{"items":[],"total":0}' });
  });
  await page.goto(APP + '/ucet');
  if (!guest) await expect(page.locator('#firstName')).toHaveValue('Jana');
  return state;
}
async function visibleEntry(page, width) {
  if (width < 1024) await page.getByRole('button', { name: 'Otevřít menu' }).click();
  const link = page.getByRole('link', { name: 'Administrace', exact: true });
  await expect(link).toBeVisible();
  return link;
}

for (const width of [375, 390, 430, 768, 1024, 1440]) {
  test('admin entry and header layout at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const state = await setup(page);
    const link = await visibleEntry(page, width);
    await page.evaluate(() => document.fonts.ready);
    await expect(link).toHaveAttribute('href', '/admin');
    const box = await link.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    if (width >= 1024) {
      const nav = await page.getByRole('navigation', { name: 'Hlavní navigace' }).boundingBox();
      const last = await page.getByRole('navigation', { name: 'Hlavní navigace' }).getByRole('link', { name: 'Pronájem', exact: true }).boundingBox();
      const utilities = await page.locator('[data-desktop-utilities]').boundingBox();
      expect(last.x + last.width).toBeLessThanOrEqual(utilities.x);
      expect(nav.x).toBeGreaterThanOrEqual(0);
      await expect(link).toHaveAttribute('title', 'Administrace');
      await link.focus();
      expect(await link.evaluate(el => getComputedStyle(el).outlineWidth)).toBe('2px');
    }
    if ([390, 1024, 1440].includes(width)) await page.screenshot({ path: 'test-evidence/admin-entry/entry-' + width + '.png' });
    await link.click();
    await expect(page).toHaveURL(APP + '/admin');
    await expect(page.getByRole('heading', { level: 1, name: 'Přehled administrace' })).toBeVisible();
    expect(state.probes).toBe(2); // The destination independently verifies permission.
    expect(state.writes).toEqual([]); expect(state.errors).toEqual([]);
  });
}

test('entry remains hidden until the server confirms permission', async ({ page }) => {
  const state = await setup(page, { delayed: true });
  await expect.poll(() => state.probes).toBe(1);
  await expect(page.locator('a[href="/admin"]')).toHaveCount(0);
  state.release();
  await expect(page.getByRole('link', { name: 'Administrace', exact: true })).toBeVisible();
});

for (const status of [403, 503, 'network']) {
  test('entry stays hidden when access check returns ' + status, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1000 });
    const state = await setup(page, { status });
    await expect.poll(() => state.probes).toBe(1);
    await page.getByRole('button', { name: 'Otevřít menu' }).click();
    await expect(page.locator('a[href="/admin"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Můj účet', exact: true })).toBeVisible();
    if (status === 403) {
      await page.goto(APP + '/admin');
      await expect(page.getByText('Nemáte oprávnění k administraci.')).toBeVisible();
    }
    expect(state.writes).toEqual([]); expect(state.errors).toEqual([]);
  });
}

test('guests never see the entry or trigger an admin request', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  const state = await setup(page, { guest: true });
  await page.getByRole('button', { name: 'Otevřít menu' }).click();
  await expect(page.getByRole('button', { name: 'Přihlásit se', exact: true })).toBeVisible();
  await expect(page.locator('a[href="/admin"]')).toHaveCount(0);
  expect(state.probes).toBe(0);
});
