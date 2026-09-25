const { test, expect } = require('@playwright/test');

const APP = 'http://127.0.0.1:4173';
const ADMIN_PRODUCTS = '**/admin/products**';

const products = [
  {
    id: 'product-active-rental',
    name: 'Šaty Sofia',
    slug: 'saty-sofia',
    category: 'dress',
    gender: 'girls',
    rentalEnabled: true,
    saleEnabled: false,
    photos: [
      { url: 'https://images.example.test/first.jpg', publicId: 'p/first' },
      { url: 'https://images.example.test/second.jpg', publicId: 'p/second' },
    ],
    status: 'active',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-25T18:42:00.000Z',
  },
  {
    id: 'product-draft-sale',
    name: 'Oblek Oliver',
    slug: 'oblek-oliver',
    category: 'suit',
    gender: 'boys',
    rentalEnabled: false,
    saleEnabled: true,
    photos: [],
    status: 'draft',
    createdAt: '2026-09-02T10:00:00.000Z',
    updatedAt: '2026-09-24T12:15:00.000Z',
  },
  {
    id: 'product-archived-both',
    name: 'Set Mia',
    slug: 'set-mia',
    rentalEnabled: true,
    saleEnabled: true,
    photos: [{ url: 'https://images.example.test/broken.jpg', publicId: 'p/broken' }],
    status: 'archived',
    createdAt: '2026-09-03T10:00:00.000Z',
    updatedAt: '2026-09-23T09:30:00.000Z',
  },
  {
    id: 'product-neither',
    name: 'Doplněk Luna',
    slug: 'doplnek-luna',
    category: 'accessory',
    gender: 'unisex',
    rentalEnabled: false,
    saleEnabled: false,
    photos: [],
    status: 'active',
    createdAt: '2026-09-04T10:00:00.000Z',
    updatedAt: '2026-09-22T08:05:00.000Z',
  },
];

function responseFor(url, items = products, overrides = {}) {
  const page = Number(url.searchParams.get('page') || '1');
  return {
    items,
    pagination: {
      page,
      limit: 20,
      total: items.length,
      pages: items.length ? 1 : 0,
      ...overrides,
    },
  };
}

async function seedToken(page) {
  await page.addInitScript(() => {
    localStorage.setItem('persist:auth', JSON.stringify({ token: JSON.stringify('admin-test-token') }));
  });
}

async function installAdminMocks(page, listHandler = url => responseFor(url)) {
  const state = {
    probeRequests: 0,
    listRequests: [],
    detailRequests: [],
  };

  await seedToken(page);

  await page.route('**/api/users/current', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { _id: 'admin-user', firstName: 'Admin' } }),
    });
  });

  await page.route('https://images.example.test/**', async route => {
    if (route.request().url().endsWith('/broken.jpg')) {
      await route.abort('failed');
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="white"/></svg>',
    });
  });

  await page.route(ADMIN_PRODUCTS, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const isCollection = url.pathname.endsWith('/admin/products');

    if (!isCollection) {
      state.detailRequests.push(url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ product: products[0], variants: [] }),
      });
      return;
    }

    if (url.searchParams.get('limit') === '1') {
      state.probeRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          pagination: { page: 1, limit: 1, total: 0, pages: 0 },
        }),
      });
      return;
    }

    state.listRequests.push(url);
    const result = await listHandler(url, state.listRequests.length);

    if (result && result.__error) {
      await route.fulfill({
        status: result.status || 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { code: result.code || 'TEST_ERROR', message: 'test error' },
        }),
      });
      return;
    }

    if (result && result.__delay) {
      await new Promise(resolve => setTimeout(resolve, result.__delay));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(result.body),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(result),
    });
  });

  return state;
}

async function openProducts(page, path = '/admin/produkty') {
  await page.goto(`${APP}${path}`);
  await expect(page.locator('[data-admin-products-page]')).toBeVisible();
}

test('canonical URL and strict API serializer reject browser-only/unknown query keys', async ({ page }) => {
  const state = await installAdminMocks(page, url =>
    responseFor(url, products, { page: 2, total: 25, pages: 2 })
  );

  await openProducts(
    page,
    '/admin/produkty?limit=50&search=Amelia&saleEnabled=true&unknown=x&status=active&page=2'
  );

  await expect(page.locator('[data-admin-products-list]')).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/produkty\?status=active&page=2$/);

  expect(state.probeRequests).toBe(1);
  expect(state.listRequests).toHaveLength(1);

  const request = state.listRequests[0];
  expect(request.searchParams.get('status')).toBe('active');
  expect(request.searchParams.get('page')).toBe('2');
  expect(request.searchParams.get('limit')).toBe('20');
  for (const key of ['search', 'saleEnabled', 'unknown']) {
    expect(request.searchParams.has(key)).toBe(false);
  }
  expect(state.detailRequests).toHaveLength(0);
  await expect(page.getByRole('searchbox')).toHaveCount(0);
});

test('filter changes reset page to 1 and browser Back reconstructs state', async ({ page }) => {
  const state = await installAdminMocks(page, url =>
    responseFor(url, products, {
      page: Number(url.searchParams.get('page') || '1'),
      total: 40,
      pages: 2,
    })
  );

  await page.setViewportSize({ width: 1024, height: 900 });
  await openProducts(page, '/admin/produkty?category=dress&page=2');

  await expect(page.getByLabel('Kategorie')).toHaveValue('dress');
  await page.getByLabel('Status').selectOption('active');

  await expect(page).toHaveURL(/\/admin\/produkty\?status=active&category=dress$/);
  await expect.poll(() => state.listRequests.at(-1)?.searchParams.get('page')).toBe('1');
  await expect(page.getByLabel('Status')).toHaveValue('active');

  await page.goBack();
  await expect(page).toHaveURL(/\/admin\/produkty\?category=dress&page=2$/);
  await expect(page.getByLabel('Status')).toHaveValue('');
  await expect(page.getByLabel('Kategorie')).toHaveValue('dress');
  await expect.poll(() => state.listRequests.at(-1)?.searchParams.get('page')).toBe('2');
});

test('stale positive page is replaced with final valid page and refetched once', async ({ page }) => {
  const state = await installAdminMocks(page, url => {
    const requested = Number(url.searchParams.get('page') || '1');
    if (requested === 99) {
      return responseFor(url, [], { page: 99, total: 25, pages: 2 });
    }
    return responseFor(url, [products[0]], { page: 2, total: 25, pages: 2 });
  });

  await openProducts(page, '/admin/produkty?page=99');

  await expect(page).toHaveURL(/\/admin\/produkty\?page=2$/);
  await expect(page.getByText('Šaty Sofia').first()).toBeVisible();
  expect(state.listRequests.map(url => url.searchParams.get('page'))).toEqual(['99', '2']);
  await expect(page.getByText('Zatím tu nejsou žádné produkty')).toHaveCount(0);
  await expect(page.getByText('Žádné produkty neodpovídají vybraným filtrům')).toHaveCount(0);
});

test('zero-result stale page canonicalizes to page 1 without a redundant refetch', async ({ page }) => {
  const state = await installAdminMocks(page, url =>
    responseFor(url, [], { page: Number(url.searchParams.get('page') || '1'), total: 0, pages: 0 })
  );

  await openProducts(page, '/admin/produkty?page=9');

  await expect(page).toHaveURL(/\/admin\/produkty$/);
  await expect(page.getByText('Zatím tu nejsou žádné produkty')).toBeVisible();
  expect(state.listRequests).toHaveLength(1);
});

test('loading shell remains visible and populated rows expose frozen status/commercial data', async ({ page }) => {
  await installAdminMocks(page, url => ({
    __delay: 250,
    body: responseFor(url, products),
  }));

  await page.setViewportSize({ width: 1440, height: 1000 });
  await openProducts(page);

  await expect(page.getByRole('heading', { name: 'Produkty' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Přidat produkt' })).toBeVisible();
  await expect(page.getByLabel('Status')).toBeVisible();
  await expect(page.getByText('Načítání produktů…')).toBeVisible();

  await expect(page.locator('[data-admin-products-table]')).toBeVisible();

  const activeRow = page.locator('tbody tr').filter({ hasText: 'Šaty Sofia' });
  await expect(activeRow.getByText('Aktivní')).toBeVisible();
  await expect(activeRow.getByText('Pronájem: Ano')).toBeVisible();
  await expect(activeRow.getByText('Prodej: Ne')).toBeVisible();

  const draftRow = page.locator('tbody tr').filter({ hasText: 'Oblek Oliver' });
  await expect(draftRow.getByText('Koncept')).toBeVisible();
  await expect(draftRow.getByText('Pronájem: Ne')).toBeVisible();
  await expect(draftRow.getByText('Prodej: Ano')).toBeVisible();

  const archivedRow = page.locator('tbody tr').filter({ hasText: 'Set Mia' });
  await expect(archivedRow.getByText('Archivovaný')).toBeVisible();
  await expect(archivedRow.getByText('Pronájem: Ano')).toBeVisible();
  await expect(archivedRow.getByText('Prodej: Ano')).toBeVisible();

  const neitherRow = page.locator('tbody tr').filter({ hasText: 'Doplněk Luna' });
  await expect(neitherRow.getByText('Pronájem: Ne')).toBeVisible();
  await expect(neitherRow.getByText('Prodej: Ne')).toBeVisible();

  await expect(archivedRow.getByText('Neuvedeno').first()).toBeVisible();
});

test('initial empty and filtered empty are distinct states', async ({ page }) => {
  await installAdminMocks(page, url =>
    responseFor(url, [], { page: Number(url.searchParams.get('page') || '1'), total: 0, pages: 0 })
  );

  await page.setViewportSize({ width: 1024, height: 900 });
  await openProducts(page);

  await expect(page.getByText('Zatím tu nejsou žádné produkty')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Přidat první produkt' })).toHaveAttribute('href', '/admin/produkty/novy');

  await page.getByLabel('Status').selectOption('draft');
  await expect(page).toHaveURL(/status=draft/);
  await expect(page.getByText('Žádné produkty neodpovídají vybraným filtrům')).toBeVisible();
  await expect(page.getByText('Zkuste filtry upravit nebo je zrušte.')).toBeVisible();
});

test('error retry repeats the exact canonical query', async ({ page }) => {
  let actualAttempt = 0;
  const state = await installAdminMocks(page, url => {
    actualAttempt += 1;
    if (actualAttempt === 1) return { __error: true, status: 500 };
    return responseFor(url, [products[0]], { total: 1, pages: 1 });
  });

  await openProducts(page, '/admin/produkty?status=active&category=dress');

  await expect(page.getByText('Produkty se nepodařilo načíst')).toBeVisible();
  await page.getByRole('button', { name: 'Zkusit znovu' }).click();
  await expect(page.getByText('Šaty Sofia').first()).toBeVisible();

  expect(state.listRequests).toHaveLength(2);
  expect(state.listRequests[0].search).toBe(state.listRequests[1].search);
});

test('thumbnail uses photos[0], missing/failed image shares the quiet fallback, and list does no detail N+1', async ({ page }) => {
  const state = await installAdminMocks(page);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await openProducts(page);
  await expect(page.locator('[data-admin-products-table]')).toBeVisible();

  const firstRow = page.locator('tbody tr').filter({ hasText: 'Šaty Sofia' });
  await expect(firstRow.locator('[data-product-thumbnail] img')).toHaveAttribute('src', 'https://images.example.test/first.jpg');

  const missingRow = page.locator('tbody tr').filter({ hasText: 'Oblek Oliver' });
  await expect(missingRow.locator('[data-thumbnail-fallback]')).toBeVisible();

  const brokenRow = page.locator('tbody tr').filter({ hasText: 'Set Mia' });
  await brokenRow.scrollIntoViewIfNeeded();
  await expect(brokenRow.locator('[data-thumbnail-fallback]')).toBeVisible();

  expect(state.detailRequests).toHaveLength(0);
});

test('create and product identity navigation remain semantic links', async ({ page }) => {
  const state = await installAdminMocks(page);
  await page.setViewportSize({ width: 1024, height: 900 });
  await openProducts(page);

  const create = page.getByRole('link', { name: 'Přidat produkt' });
  expect(await create.evaluate(element => element.tagName)).toBe('A');
  await expect(create).toHaveAttribute('href', '/admin/produkty/novy');

  const productLink = page.locator('tbody tr').filter({ hasText: 'Šaty Sofia' }).getByRole('link');
  expect(await productLink.evaluate(element => element.tagName)).toBe('A');
  await expect(productLink).toHaveAttribute('href', '/admin/produkty/product-active-rental');

  expect(state.detailRequests).toHaveLength(0);
});

test('numbered pagination exposes aria-current and updates canonical page state', async ({ page }) => {
  await installAdminMocks(page, url => {
    const requested = Number(url.searchParams.get('page') || '1');
    return responseFor(url, [products[0]], { page: requested, total: 240, pages: 12 });
  });

  await openProducts(page, '/admin/produkty?page=5');

  await expect(page.getByRole('button', { name: 'Stránka 5, aktuální' })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: 'Přejít na stránku 6' }).click();
  await expect(page).toHaveURL(/\/admin\/produkty\?page=6$/);
  await expect(page.getByRole('button', { name: 'Stránka 6, aktuální' })).toHaveAttribute('aria-current', 'page');
});

for (const width of [375, 390, 430, 768, 1024, 1440]) {
  test(`Products responsive contract at ${width}px without horizontal document overflow`, async ({ page }) => {
    await installAdminMocks(page);
    await page.setViewportSize({ width, height: 1000 });
    await openProducts(page);
    await expect(page.locator('[data-admin-products-list]')).toBeVisible();

    const create = page.getByRole('link', { name: 'Přidat produkt' });
    await expect(create).toBeVisible();

    const overflow = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(overflow.viewport + 1);
    expect(overflow.body).toBeLessThanOrEqual(overflow.viewport + 1);

    const filterButton = page.getByRole('button', { name: /^Filtry/ });
    const selects = [
      page.getByLabel('Status'),
      page.getByLabel('Kategorie'),
      page.getByLabel('Určení'),
      page.getByLabel('Pronájem'),
    ];

    if (width < 768) {
      await expect(filterButton).toBeVisible();
      await expect(selects[0]).toBeHidden();
      await filterButton.click();
      for (const select of selects) await expect(select).toBeVisible();

      const boxes = await Promise.all(selects.map(select => select.boundingBox()));
      for (let index = 1; index < boxes.length; index += 1) {
        expect(Math.abs(boxes[index].x - boxes[0].x)).toBeLessThan(2);
        expect(boxes[index].y).toBeGreaterThan(boxes[index - 1].y);
      }
    } else {
      await expect(filterButton).toBeHidden();
      for (const select of selects) await expect(select).toBeVisible();

      const boxes = await Promise.all(selects.map(select => select.boundingBox()));
      if (width < 1024) {
        expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThan(2);
        expect(Math.abs(boxes[2].y - boxes[3].y)).toBeLessThan(2);
        expect(boxes[2].y).toBeGreaterThan(boxes[0].y);
      } else {
        for (const box of boxes.slice(1)) {
          expect(Math.abs(box.y - boxes[0].y)).toBeLessThan(2);
        }
      }
    }

    const thumbnail = page.locator('[data-product-thumbnail]:visible').first();
    const thumbnailBox = await thumbnail.boundingBox();

    if (width < 1024) {
      await expect(page.locator('[data-admin-products-stacked]')).toBeVisible();
      await expect(page.locator('[data-admin-products-table]')).toBeHidden();
      expect(await page.locator('[data-admin-products-stacked] [data-product-row]').first().evaluate(el => el.tagName)).toBe('A');

      if (width < 768) {
        expect(Math.abs(thumbnailBox.width - 64)).toBeLessThan(2);
        expect(Math.abs(thumbnailBox.height - 80)).toBeLessThan(2);
      } else {
        expect(Math.abs(thumbnailBox.width - 72)).toBeLessThan(2);
        expect(Math.abs(thumbnailBox.height - 90)).toBeLessThan(2);
      }
    } else {
      await expect(page.locator('[data-admin-products-stacked]')).toBeHidden();
      await expect(page.locator('[data-admin-products-table]')).toBeVisible();
      expect(Math.abs(thumbnailBox.width - 48)).toBeLessThan(2);
      expect(Math.abs(thumbnailBox.height - 64)).toBeLessThan(2);

      const headers = await page.locator('[data-admin-products-table] thead th:visible').allTextContents();
      if (width < 1440) {
        expect(headers).toEqual(['Produkt', 'Stav', 'Nabídka', 'Aktualizováno']);
        await expect(page.locator('tbody tr').first().getByText('saty-sofia')).toBeHidden();
      } else {
        expect(headers).toEqual(['Produkt', 'Stav', 'Kategorie', 'Určení', 'Nabídka', 'Aktualizováno']);
      }
    }
  });
}
