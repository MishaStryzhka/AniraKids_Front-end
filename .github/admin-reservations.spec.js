const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const APP = 'http://127.0.0.1:4173';
const EVIDENCE =
  process.env.ADMIN_RESERVATIONS_EVIDENCE_DIR ||
  'test-evidence/admin-reservations';
fs.mkdirSync(EVIDENCE, { recursive: true });
const customer = {
  firstName: 'Jana',
  lastName: 'Nováková-Svobodová',
  email: 'reservation.fixture@example.test',
  phone: '+420 123 456 789',
};
const row = (id, extra = {}) => ({
  id,
  reservationNumber: `AK-2026-${id}`,
  status: 'pending',
  paymentStatus: 'unpaid',
  rentalMode: 'external',
  startDate: '2026-10-07',
  endDate: '2026-10-09',
  expiresAt: '2026-10-07T10:15:00Z',
  pendingExpired: true,
  customer,
  itemCount: 2,
  subtotal: 1200,
  deposit: 500,
  totalDue: 1700,
  createdAt: '2026-10-07T10:00:00Z',
  updatedAt: '2026-10-07T10:00:00Z',
  ...extra,
});
const rows = [
  row('001'),
  row('002', {
    status: 'returned',
    paymentStatus: 'paid',
    pendingExpired: false,
    rentalMode: 'studio',
  }),
  row('003', {
    status: 'cancelled',
    paymentStatus: 'refunded',
    pendingExpired: false,
  }),
];
const detail = id => ({
  ...row(id),
  customerSnapshot: customer,
  notes: 'Zákaznice si přeje vyzvednout před polednem.',
  items: [
    {
      productId: 'p1',
      variantId: 'v1',
      inventoryItemId: 'i1',
      productNameSnapshot:
        'Slavnostní dětské šaty Sofia s dlouhým názvem produktu',
      sizeSnapshot: '98–104',
      rentalPriceSnapshot: 1200,
      depositSnapshot: 500,
      inventoryCurrent: null,
    },
  ],
});
async function mocks(page) {
  const state = {
    requests: [],
    writes: [],
    errors: [],
    malformed: false,
    fail: false,
    access: false,
    deferPage2: false,
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
    url => url.origin === 'http://admin-api.test',
    async route => {
      const request = route.request(),
        url = new URL(request.url());
      const json = (status, body) =>
        route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
      if (request.method() !== 'GET') {
        state.writes.push(request.method());
        return route.abort('failed');
      }
      if (url.pathname === '/api/v2/admin/products')
        return json(200, {
          items: [],
          pagination: { page: 1, limit: 1, total: 0, pages: 0 },
        });
      state.requests.push({
        pathname: url.pathname,
        params: Object.fromEntries(url.searchParams),
        authorization: request.headers().authorization,
      });
      if (state.access)
        return json(403, { error: { code: 'ADMIN_FORBIDDEN' } });
      if (url.pathname === '/api/v2/admin/reservations/calendar')
        return json(200, {
          items: [
            {
              id: '001',
              reservationNumber: 'AK-2026-001',
              status: 'pending',
              rentalMode: 'external',
              startDate: '2026-10-07',
              endDate: '2026-10-09',
              occupiedThrough: '2026-10-11',
              customerName: 'Jana Nováková',
              items: [],
            },
          ],
        });
      if (url.pathname === '/api/v2/admin/reservations') {
        const pageNumber = Number(url.searchParams.get('page'));
        if (pageNumber === 2 && state.deferPage2)
          await new Promise(resolve => {
            state.release = resolve;
          });
        if (state.fail)
          return json(500, {
            error: { code: 'FAILED', message: 'private raw backend message' },
          });
        if (state.malformed)
          return json(200, {
            items: [{ bad: true }],
            pagination: { page: pageNumber, limit: 20, total: 1, pages: 1 },
          });
        const items =
          pageNumber > 2 ? [] : pageNumber === 2 ? [row('021')] : rows;
        return json(200, {
          items,
          pagination: { page: pageNumber, limit: 20, total: 21, pages: 2 },
        });
      }
      const id = url.pathname.split('/').pop();
      if (id === 'missing')
        return json(404, { error: { code: 'RESERVATION_NOT_FOUND' } });
      return json(200, detail(id));
    }
  );
  return state;
}
async function ready(page, path = '/admin/rezervace') {
  await page.goto(APP + path);
  await expect(
    page.getByRole('heading', { name: 'Rezervace', exact: true })
  ).toBeVisible();
  await expect(page.getByText('Počet rezervací: 21')).toBeVisible();
}
async function capture(page, name) {
  await page.screenshot({
    path: path.join(EVIDENCE, name + '.png'),
    fullPage: true,
  });
}
async function clean(page, state) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  ).toBeLessThanOrEqual(1);
  expect(state.writes).toEqual([]);
  expect(state.errors).toEqual([]);
}
for (const width of [375, 390, 430, 768, 1024, 1440])
  test('list and detail responsive ' + width, async ({ page }) => {
    const state = await mocks(page);
    await page.setViewportSize({ width, height: 1000 });
    await ready(page);
    await expect(
      page
        .getByText('Čekání vypršelo', { exact: true })
        .filter({ visible: true })
    ).toBeVisible();
    if (width === 1440) {
      // Each word in the compact desktop badges must fit on one visual line.
      for (const label of [
        'Čeká na potvrzení',
        'Čekání vypršelo',
        'Nezaplaceno',
        'Vrácená platba',
      ]) {
        const unbroken = await page
          .getByText(label, { exact: true })
          .filter({ visible: true })
          .evaluate(element => {
            const text = element.firstChild;
            return [...text.textContent.matchAll(/\S+/g)].every(match => {
              const range = document.createRange();
              range.setStart(text, match.index);
              range.setEnd(text, match.index + match[0].length);
              return range.getClientRects().length === 1;
            });
          });
        expect(unbroken).toBe(true);
      }
    }
    await capture(page, 'list-' + width);
    await clean(page, state);
    const link = page.getByRole('link', { name: 'AK-2026-001', exact: true });
    const box = await link.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    await link.click();
    await expect(
      page.getByRole('heading', { name: 'Detail rezervace', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'AK-2026-001', exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('Aktuální údaje o fyzickém kusu nejsou k dispozici.')
    ).toBeVisible();
    await expect(page.getByText('1 700 Kč', { exact: true })).toBeVisible();
    await expect(page.getByText('Obsazeno do', { exact: true })).toHaveCount(0);
    await capture(page, 'detail-' + width);
    await clean(page, state);
  });
test('submit-only private search, URL filters, pagination, detail and verified back context', async ({
  page,
}) => {
  const state = await mocks(page);
  await ready(page);
  const initial = state.requests.length;
  await page.getByLabel('Hledat rezervaci').fill(customer.email);
  await page.getByLabel('Stav', { exact: true }).selectOption('pending');
  expect(state.requests).toHaveLength(initial);
  await page
    .getByRole('button', { name: 'Použít filtry', exact: true })
    .click();
  await expect.poll(() => state.requests.at(-1).params.q).toBe(customer.email);
  expect(page.url()).toBe(APP + '/admin/rezervace?status=pending');
  await page
    .getByRole('button', { name: 'Přejít na stránku 2', exact: true })
    .click();
  await expect(
    page.getByRole('link', { name: 'AK-2026-021', exact: true })
  ).toBeVisible();
  await page.getByRole('link', { name: 'AK-2026-021', exact: true }).click();
  await page
    .getByRole('link', { name: 'Zpět na rezervace', exact: true })
    .click();
  await expect(
    page.getByRole('link', { name: 'AK-2026-021', exact: true })
  ).toBeVisible();
  expect(page.url()).toBe(APP + '/admin/rezervace?status=pending&page=2');
  await expect(page.getByLabel('Hledat rezervaci')).toHaveValue(customer.email);
  expect(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage })
    )
  ).not.toContain(customer.email);
  await clean(page, state);
});
test('invalid date URL does not fetch; corrected dates and out-of-range page recover', async ({
  page,
}) => {
  const state = await mocks(page);
  await page.goto(APP + '/admin/rezervace?from=2027-01-01&to=2026-12-31');
  await expect(page.getByRole('alert')).toContainText(
    'Datum od nesmí být pozdější než datum do.'
  );
  expect(state.requests).toHaveLength(0);
  await page.getByLabel('Do', { exact: true }).fill('2027-01-31');
  await page
    .getByRole('button', { name: 'Použít filtry', exact: true })
    .click();
  await expect(page.getByText('Počet rezervací: 21')).toBeVisible();
  expect(state.requests.at(-1).params).toMatchObject({
    from: '2027-01-01',
    to: '2027-01-31',
    limit: '20',
  });
  await page.goto(APP + '/admin/rezervace?page=999');
  await expect(
    page.getByText('Na této stránce nejsou žádné rezervace')
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Přejít na první stránku', exact: true })
    .click();
  await expect(
    page.getByRole('link', { name: 'AK-2026-001', exact: true })
  ).toBeVisible();
  await clean(page, state);
});
test('malformed and failed reads remain errors, retry recovers, detail404 has safe back', async ({
  page,
}) => {
  const state = await mocks(page);
  state.malformed = true;
  await page.goto(APP + '/admin/rezervace');
  await expect(page.getByRole('alert')).toContainText(
    'Rezervace se nepodařilo načíst'
  );
  await expect(page.getByText('Žádné rezervace', { exact: true })).toHaveCount(
    0
  );
  state.malformed = false;
  state.fail = true;
  await page.getByRole('button', { name: 'Zkusit znovu' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Rezervace se nepodařilo načíst'
  );
  await expect(page.getByText('private raw backend message')).toHaveCount(0);
  state.fail = false;
  await page.getByRole('button', { name: 'Zkusit znovu' }).click();
  await expect(page.getByText('Počet rezervací: 21')).toBeVisible();
  await page.goto(APP + '/admin/rezervace/missing');
  await expect(page.getByText('Rezervace nebyla nalezena')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Zpět na rezervace' })
  ).toHaveAttribute('href', '/admin/rezervace');
  await clean(page, state);
});
test('obsolete page response cannot overwrite reset filters and calendar links open real detail', async ({
  page,
}) => {
  const state = await mocks(page);
  await ready(page);
  state.deferPage2 = true;
  await page
    .getByRole('button', { name: 'Přejít na stránku 2', exact: true })
    .click();
  await expect(page.getByText('Načítání rezervací…')).toBeVisible();
  await expect.poll(() => Boolean(state.release)).toBe(true);
  await page.getByRole('button', { name: 'Vyčistit filtry' }).click();
  await expect(
    page.getByRole('link', { name: 'AK-2026-001', exact: true })
  ).toBeVisible();
  state.release();
  await expect(
    page.getByRole('link', { name: 'AK-2026-021', exact: true })
  ).toHaveCount(0);
  await page.goto(APP + '/admin/kalendar');
  await page.getByRole('link', { name: 'AK-2026-001', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'AK-2026-001', exact: true })
  ).toBeVisible();
  await page.getByRole('link', { name: 'Zpět na kalendář' }).click();
  await expect(
    page.getByRole('heading', { name: 'Kalendář pronájmů', exact: true })
  ).toBeVisible();
  await clean(page, state);
});
test('forbidden reads are owned by the existing Admin boundary', async ({
  page,
}) => {
  const state = await mocks(page);
  state.access = true;
  await page.goto(APP + '/admin/rezervace');
  await expect(
    page.getByText('Nemáte oprávnění k administraci.')
  ).toBeVisible();
  await expect(page.locator('[data-admin-reservations-page]')).toHaveCount(0);
  await clean(page, state);
});
