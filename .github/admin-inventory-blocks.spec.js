const { test, expect } = require('@playwright/test');
const fs = require('fs'),
  path = require('path');
const APP = 'http://127.0.0.1:4173',
  API = 'http://admin-api.test';
const EVIDENCE =
  process.env.ADMIN_INVENTORY_BLOCKS_EVIDENCE_DIR ||
  'test-evidence/admin-inventory-blocks';
fs.mkdirSync(EVIDENCE, { recursive: true });
const product = {
  id: 'p1',
  name: 'Sofia',
  slug: 'sofia',
  description: 'Slavnostní šaty',
  category: 'dress',
  gender: 'girls',
  color: 'Bílá',
  occasion: [],
  ageTags: [],
  brand: '',
  familyLookGroup: '',
  rentalEnabled: false,
  saleEnabled: false,
  defaultDeposit: 0,
  seo: { noIndex: true },
  photos: [],
  status: 'draft',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  rentalPrices: {},
};
const inv = (id, status = 'active') => ({
  id,
  variantId: 'v1',
  internalCode: id === 'i1' ? 'AK-001' : 'AK-002',
  status,
  condition: 'good',
  notes: '',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});
const variants = [
  {
    id: 'v1',
    productId: 'p1',
    size: '98',
    status: 'active',
    sortOrder: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    inventory: [inv('i1'), inv('i2', 'maintenance')],
  },
];
const block = (id = 'b1', inventoryItemId = 'i1') => ({
  id,
  inventoryItemId,
  startDate: '2026-10-10',
  endDate: '2026-10-11',
  reason: 'repair',
  notes: 'Kontrola zipu',
  createdBy: 'internal-admin-id',
  createdAt: '2026-10-07T12:00:00Z',
});
async function setup(page) {
  const state = {
    blocks: { i1: [], i2: [block('b2', 'i2')] },
    reads: [],
    writes: [],
    errors: [],
    mode: 'normal',
    defer: false,
    release: null,
  };
  page.on('pageerror', error => state.errors.push(error.message));
  await page.clock.setFixedTime(new Date('2026-10-07T12:00:00Z'));
  await page.addInitScript(() =>
    localStorage.setItem(
      'persist:auth',
      JSON.stringify({ token: JSON.stringify('admin-test-token') })
    )
  );
  await page.route('**/api/users/current', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { _id: 'admin-user' } }),
    })
  );
  await page.route(
    url => url.origin === API,
    async route => {
      const req = route.request(),
        url = new URL(req.url()),
        parts = url.pathname.split('/'),
        method = req.method();
      const json = (status, body) =>
        route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
      if (method === 'GET' && url.pathname === '/api/v2/admin/products')
        return json(200, {
          items: [],
          pagination: { page: 1, limit: 1, total: 0, pages: 0 },
        });
      if (method === 'GET' && url.pathname === '/api/v2/admin/products/p1')
        return json(200, { product, variants });
      if (url.pathname.endsWith('/availability-blocks')) {
        const id = parts.at(-2);
        if (method === 'GET') {
          state.reads.push({ id, params: [...url.searchParams.keys()] });
          return json(200, { items: state.blocks[id] });
        }
        state.writes.push({ method, id, body: req.postDataJSON() });
        const mode = state.mode;
        if (state.defer)
          await new Promise(resolve => {
            state.release = resolve;
          });
        if (mode === 'conflict')
          return json(409, {
            error: {
              code: 'AVAILABILITY_BLOCK_CONFLICT',
              message: 'private raw error',
            },
          });
        const created = {
          ...block('b' + (state.writes.length + 10), id),
          ...req.postDataJSON(),
        };
        state.blocks[id].push(created);
        if (mode === 'network') return route.abort('failed');
        if (mode === 'malformed')
          return json(201, {
            availabilityBlock: { ...created, inventoryItemId: 'wrong' },
          });
        return json(201, { availabilityBlock: created });
      }
      if (
        method === 'DELETE' &&
        url.pathname.startsWith('/api/v2/admin/availability-blocks/')
      ) {
        const id = parts.at(-1);
        state.writes.push({ method, id });
        for (const item of Object.keys(state.blocks))
          state.blocks[item] = state.blocks[item].filter(
            block => block.id !== id
          );
        if (state.mode === 'network-delete') return route.abort('failed');
        return route.fulfill({ status: 204 });
      }
      return route.abort('failed');
    }
  );
  return state;
}
const row = (page, id = 'i1') => page.locator(`[data-inventory-id="${id}"]`);
const panel = (page, id = 'i1') =>
  row(page, id).getByRole('region', { name: 'Ruční blokování' });
async function ready(page) {
  await page.goto(APP + '/admin/produkty/p1');
  await expect(
    row(page).getByRole('button', { name: 'Ruční blokování' })
  ).toBeVisible();
}
async function open(page, id = 'i1') {
  await row(page, id).getByRole('button', { name: 'Ruční blokování' }).click();
  await expect(
    panel(page, id).getByText('Naplánovaná blokování')
  ).toBeVisible();
}
async function draft(page) {
  const region = panel(page);
  await region.getByRole('button', { name: 'Přidat blokování' }).click();
  await region.getByLabel('Začátek').fill('2026-10-10');
  await region.getByLabel('Konec').fill('2026-10-11');
  await region.getByLabel('Důvod').selectOption('repair');
  await region.getByLabel('Poznámka', { exact: true }).fill(' Kontrola zipu ');
}
async function capture(page, name) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  ).toBeLessThanOrEqual(1);
  await page.screenshot({
    path: path.join(EVIDENCE, name + '.png'),
    fullPage: true,
  });
  const detail = (await page.getByRole('dialog').count())
    ? page.getByRole('dialog')
    : panel(page);
  await detail.screenshot({ path: path.join(EVIDENCE, name + '-detail.png') });
}
for (const width of [390, 1440])
  test(
    'lazy blocks create/delete and safe confirmation ' + width,
    async ({ page }) => {
      const state = await setup(page);
      await page.setViewportSize({ width, height: 1000 });
      await ready(page);
      expect(state.reads).toEqual([]);
      await open(page);
      expect(state.reads).toEqual([{ id: 'i1', params: [] }]);
      await expect(
        panel(page).getByText('Žádná ruční blokování', { exact: true })
      ).toBeVisible();
      await draft(page);
      await capture(page, 'form-' + width);
      await panel(page)
        .getByRole('button', { name: 'Uložit blokování' })
        .click();
      await expect(
        panel(page).getByText('Blokování bylo vytvořeno.')
      ).toBeVisible();
      await expect(
        panel(page).getByText('10. října 2026 – 11. října 2026')
      ).toBeVisible();
      await expect(page.getByText('internal-admin-id')).toHaveCount(0);
      await capture(page, 'list-' + width);
      await panel(page)
        .getByRole('button', { name: 'Odstranit', exact: true })
        .click();
      const dialog = page.getByRole('dialog', { name: 'Odstranit blokování' });
      await expect(dialog).toContainText('AK-001');
      await expect(dialog.getByRole('button', { name: 'Zpět' })).toBeFocused();
      await capture(page, 'delete-dialog-' + width);
      await dialog.getByRole('button', { name: 'Odstranit blokování' }).click();
      await expect(
        panel(page).getByText('Blokování bylo odstraněno.')
      ).toBeVisible();
      await expect(
        panel(page).getByText('Žádná ruční blokování', { exact: true })
      ).toBeVisible();
      expect(state.writes.map(write => write.method)).toEqual([
        'POST',
        'DELETE',
      ]);
      expect(state.writes[0].body).toEqual({
        startDate: '2026-10-10',
        endDate: '2026-10-11',
        reason: 'repair',
        notes: 'Kontrola zipu',
      });
      expect(state.errors).toEqual([]);
    }
  );
test('inactive inventory can view/delete only, and invalid dates preserve form with focused field', async ({
  page,
}) => {
  const state = await setup(page);
  await ready(page);
  await open(page, 'i2');
  await expect(
    panel(page, 'i2').getByRole('button', { name: 'Přidat blokování' })
  ).toBeDisabled();
  await panel(page, 'i2')
    .getByRole('button', { name: 'Odstranit', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Odstranit blokování' })
    .click();
  await expect(
    panel(page, 'i2').getByText('Blokování bylo odstraněno.')
  ).toBeVisible();
  await open(page);
  await draft(page);
  await panel(page).getByLabel('Začátek').fill('2026-10-06');
  await panel(page).getByRole('button', { name: 'Uložit blokování' }).click();
  await expect(
    panel(page).getByText('Začátek nesmí být v minulosti.')
  ).toBeVisible();
  await expect(panel(page).getByLabel('Začátek')).toBeFocused();
  expect(state.writes.map(write => write.method)).toEqual(['DELETE']);
  await panel(page)
    .getByRole('button', { name: 'Zrušit', exact: true })
    .click();
  await expect(
    panel(page).getByRole('button', { name: 'Přidat blokování' })
  ).toBeFocused();
});
for (const mode of ['network', 'malformed', 'conflict'])
  test(
    mode + ' create preserves draft, collapse barrier and explicit recovery',
    async ({ page }) => {
      const state = await setup(page);
      await ready(page);
      await open(page);
      await draft(page);
      state.mode = mode;
      await panel(page)
        .getByRole('button', { name: 'Uložit blokování' })
        .click();
      await expect(panel(page).getByRole('alert')).toBeVisible();
      await expect(panel(page).getByText('private raw error')).toHaveCount(0);
      await row(page).getByRole('button', { name: 'Ruční blokování' }).click();
      await expect(
        row(page).getByRole('button', { name: 'Upravit', exact: true })
      ).toBeDisabled();
      await expect(
        row(page, 'i2').getByRole('button', { name: 'Upravit', exact: true })
      ).toBeEnabled();
      expect(state.reads).toHaveLength(1);
      await row(page).getByRole('button', { name: 'Ruční blokování' }).click();
      await expect(panel(page).getByLabel('Začátek')).toHaveValue('2026-10-10');
      await capture(page, 'recovery-' + mode);
      await panel(page)
        .getByRole('button', { name: 'Načíst blokování' })
        .click();
      await expect(
        panel(page).getByText('Aktuální blokování byla načtena.')
      ).toBeVisible();
      await expect(
        panel(page).getByLabel('Poznámka', { exact: true })
      ).toHaveValue(' Kontrola zipu ');
      expect(state.writes).toHaveLength(1);
    }
  );
test('unknown delete recovers observed absence without claiming request causality', async ({
  page,
}) => {
  const state = await setup(page);
  state.blocks.i1 = [block()];
  await ready(page);
  await open(page);
  state.mode = 'network-delete';
  await panel(page)
    .getByRole('button', { name: 'Odstranit', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Odstranit blokování' })
    .click();
  await expect(
    panel(page).getByText('Výsledek odstranění blokování není potvrzený')
  ).toBeVisible();
  await panel(page).getByRole('button', { name: 'Načíst blokování' }).click();
  await expect(
    panel(page).getByText('Žádná ruční blokování', { exact: true })
  ).toBeVisible();
  await expect(panel(page).getByText('Blokování bylo odstraněno.')).toHaveCount(
    0
  );
  expect(state.writes).toHaveLength(1);
});
test('double click is single request and pending collapsed panel keeps same-item writes disabled', async ({
  page,
}) => {
  const state = await setup(page);
  await ready(page);
  await open(page);
  await draft(page);
  state.defer = true;
  await panel(page)
    .getByRole('button', { name: 'Uložit blokování' })
    .evaluate(button => {
      button.click();
      button.click();
    });
  await expect.poll(() => Boolean(state.release)).toBe(true);
  await row(page).getByRole('button', { name: 'Ruční blokování' }).click();
  await expect(
    row(page).getByRole('button', { name: 'Upravit', exact: true })
  ).toBeDisabled();
  await expect(
    row(page).getByRole('button', { name: 'Přesunout do údržby', exact: true })
  ).toBeDisabled();
  state.release();
  await row(page).getByRole('button', { name: 'Ruční blokování' }).click();
  await expect(
    panel(page).getByText('Blokování bylo vytvořeno.')
  ).toBeVisible();
  expect(state.writes).toHaveLength(1);
});
