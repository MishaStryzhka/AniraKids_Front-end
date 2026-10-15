const { test, expect } = require('@playwright/test');
const { policy } = require('./payment-fixtures');
const APP = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';
const product = { id: '111111111111111111111111', slug: 'dam001', name: 'Dámské šaty DAM001', color: 'Červená', category: 'dress', photos: [] };

async function setup(page) {
  const state = { queries: [], errors: [], releaseSlow: null };
  page.on('pageerror', error => state.errors.push(error.message));
  await page.route('**/api/users/favorites/storefront', route => route.fulfill({ json: { ids: [] } }));
  await page.route('http://admin-api.test/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/v2/site-settings') return route.fulfill({json:{sections:{suits:true,familyLooks:false}}});
    if (url.pathname.endsWith('/booking-policy')) return route.fulfill({ json: policy });
    if (!url.pathname.endsWith('/catalogue/products')) return route.fulfill({ status: 404 });
    const q = url.searchParams.get('q') || '';
    const limit = Number(url.searchParams.get('limit'));
    state.queries.push(q);
    if (q === 'slow') await new Promise(resolve => { state.releaseSlow = resolve; });
    if (q === 'error') return route.fulfill({ status: 503, json: { error: { code: 'UNAVAILABLE' } } });
    const items = q === 'missing' ? [] : [{ ...product, ...(q === 'slow' ? { slug: 'old', name: 'Starý výsledek' } : {}) }];
    await route.fulfill({ json: { items, page: 1, limit, total: items.length, totalPages: items.length ? 1 : 0 } }).catch(() => {});
  });
  return state;
}

for (const width of [375, 390, 430, 768, 1024, 1440]) {
  test('search suggestions, clearing, full results and focus at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const state = await setup(page);
    await page.goto(APP + '/hledani?q=DAM001');
    const trigger = page.locator('[data-search-trigger]:visible');
    await trigger.click();
    const layer = page.locator('section[aria-label="Vyhledávání"]');
    const input = layer.getByRole('searchbox', { name: 'Hledat' });
    await expect(input).toHaveValue('DAM001');
    await expect(input).toBeFocused();
    await expect(layer.getByRole('link', { name: /Dámské šaty DAM001/ })).toBeVisible();
    expect(await page.locator('main').evaluate(el => el.inert)).toBe(true);
    await layer.getByRole('button', { name: 'Vymazat hledání' }).click();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('');
    await expect(layer.getByRole('link')).toHaveCount(0);
    await input.fill('D');
    await expect(layer.getByText('Zadejte alespoň 2 znaky názvu nebo kódu modelu.')).toBeVisible();
    expect(state.queries).not.toContain('D');
    await input.fill('DAM');
    await expect(layer.getByRole('link', { name: /Dámské šaty DAM001/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: 'test-evidence/customer-booking/search-' + width + '.png' });
    await layer.getByRole('button', { name: 'Hledat v katalogu' }).click();
    await expect(page).toHaveURL(APP + '/hledani?q=DAM');
    await expect(layer).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Hledat produkt' })).toHaveValue('DAM');
    expect(await page.locator('main').evaluate(el => el.inert)).toBe(false);
    await trigger.click();
    await page.keyboard.press('Escape');
    await expect(layer).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(state.errors).toEqual([]);
  });
}

test('late search response cannot replace a newer query; empty and error states recover', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const state = await setup(page);
  await page.goto(APP + '/hledani');
  await page.locator('[data-search-trigger]:visible').click();
  const layer = page.locator('section[aria-label="Vyhledávání"]');
  const input = layer.getByRole('searchbox');
  await input.fill('slow');
  await expect.poll(() => typeof state.releaseSlow).toBe('function');
  await input.fill('DAM');
  await expect(layer.getByRole('link', { name: /Dámské šaty DAM001/ })).toBeVisible();
  state.releaseSlow();
  await expect(layer.getByText('Starý výsledek')).toHaveCount(0);
  await input.fill('missing');
  await expect(layer.getByText('Žádné výsledky.')).toBeVisible();
  await input.fill('error');
  await expect(layer.getByText('Výsledky se nepodařilo načíst.')).toBeVisible();
  await expect(layer.getByRole('button', { name: 'Hledat v katalogu' })).toBeEnabled();
  await input.fill('DAM');
  await expect(layer.getByRole('link', { name: /Dámské šaty DAM001/ })).toBeVisible();
  await layer.getByRole('link', { name: /Dámské šaty DAM001/ }).click();
  await expect(page).toHaveURL(APP + '/produkt/dam001');
  await expect(layer).toHaveCount(0);
  expect(state.errors).toEqual([]);
});
