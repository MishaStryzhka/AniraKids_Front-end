const { test, expect } = require('@playwright/test');

const APP = 'http://127.0.0.1:4173';
const APP_NO_ENV = 'http://127.0.0.1:4174';
const ADMIN_PRODUCTS = '**/admin/products**';

async function seedToken(page, token = 'admin-test-token') {
  await page.addInitScript(value => {
    localStorage.setItem('persist:auth', JSON.stringify({ token: JSON.stringify(value) }));
  }, token);
}

async function mockCurrentUser(page, options = {}) {
  const { delayMs = 0, status = 200 } = options;
  await page.route('**/api/users/current', async route => {
    if (delayMs) await new Promise(resolve => setTimeout(resolve, delayMs));
    if (status !== 200) {
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ message: 'invalid session' }) });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { _id: 'admin-user', firstName: 'Admin' } }),
    });
  });
}

async function mockProbe(page, input = {}) {
  const { status = 200, code, abort = false } = input;
  let authorization = null;
  let attempts = 0;
  await page.route(ADMIN_PRODUCTS, async route => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith('/admin/products') && url.searchParams.get('limit') !== '1') {
      const pageNumber = Number(url.searchParams.get('page') || '1');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          pagination: { page: pageNumber, limit: 20, total: 0, pages: 0 },
        }),
      });
      return;
    }

    attempts += 1;
    authorization = route.request().headers().authorization || null;
    if (abort) {
      await route.abort('failed');
      return;
    }
    if (status === 200) {
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
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code, message: code } }),
    });
  });
  return { authorization: () => authorization, attempts: () => attempts };
}

async function openAuthorizedAdmin(page, path = '/admin') {
  await seedToken(page);
  await mockCurrentUser(page);
  const probe = await mockProbe(page);
  await page.goto(`${APP}${path}`);
  await expect(page.locator('[data-admin-layout]')).toBeVisible();
  return probe;
}

test('guest /admin shows login-required state without storefront shell', async ({ page }) => {
  await page.goto(`${APP}/admin`);
  await expect(page.getByText('Pro přístup do administrace se přihlaste.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Přihlásit se' })).toBeVisible();
  await expect(page.locator('[data-storefront-header]')).toHaveCount(0);
  await expect(page.locator('[data-focused-reservation-header]')).toHaveCount(0);
});

test('auth refresh shows loading state before authorization probe', async ({ page }) => {
  await seedToken(page);
  await mockCurrentUser(page, { delayMs: 1200 });
  await page.goto(`${APP}/admin`);
  await expect(page.getByText('Ověřujeme přihlášení…')).toBeVisible();
});

test('probe 200 renders AdminLayout and sends bearer token', async ({ page }) => {
  const probe = await openAuthorizedAdmin(page);
  await expect(page.getByRole('heading', { name: 'Přehled administrace' })).toBeVisible();
  expect(probe.authorization()).toBe('Bearer admin-test-token');
});

test('401 ADMIN_UNAUTHORIZED renders session state', async ({ page }) => {
  await seedToken(page);
  await mockCurrentUser(page);
  await mockProbe(page, { status: 401, code: 'ADMIN_UNAUTHORIZED' });
  await page.goto(`${APP}/admin`);
  await expect(page.getByText('Přihlášení vypršelo nebo není platné.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Obnovit přihlášení' })).toBeVisible();
});

test('403 ADMIN_FORBIDDEN renders forbidden state', async ({ page }) => {
  await seedToken(page);
  await mockCurrentUser(page);
  await mockProbe(page, { status: 403, code: 'ADMIN_FORBIDDEN' });
  await page.goto(`${APP}/admin`);
  await expect(page.getByText('Nemáte oprávnění k administraci.')).toBeVisible();
});

test('503 ADMIN_API_DISABLED renders unavailable state', async ({ page }) => {
  await seedToken(page);
  await mockCurrentUser(page);
  await mockProbe(page, { status: 503, code: 'ADMIN_API_DISABLED' });
  await page.goto(`${APP}/admin`);
  await expect(page.getByText('Administrace je momentálně nedostupná.')).toBeVisible();
});

test('503 ADMIN_API_CONFIGURATION_ERROR renders controlled configuration state', async ({ page }) => {
  await seedToken(page);
  await mockCurrentUser(page);
  await mockProbe(page, { status: 503, code: 'ADMIN_API_CONFIGURATION_ERROR' });
  await page.goto(`${APP}/admin`);
  await expect(page.getByText('Administrace není správně nakonfigurována.')).toBeVisible();
});

test('network failure renders retry state and retry can recover', async ({ page }) => {
  await seedToken(page);
  await mockCurrentUser(page);
  let attempts = 0;
  await page.route(ADMIN_PRODUCTS, async route => {
    attempts += 1;
    if (attempts === 1) {
      await route.abort('failed');
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  });
  await page.goto(`${APP}/admin`);
  await expect(page.getByText('Administraci se nepodařilo načíst')).toBeVisible();
  await page.getByRole('button', { name: 'Zkusit znovu' }).click();
  await expect(page.locator('[data-admin-layout]')).toBeVisible();
  expect(attempts).toBe(2);
});

test('missing REACT_APP_V2_API_BASE_URL renders configuration state without Admin request', async ({ page }) => {
  await seedToken(page);
  await mockCurrentUser(page);
  let adminRequestSeen = false;
  await page.route(ADMIN_PRODUCTS, async route => {
    adminRequestSeen = true;
    await route.abort();
  });
  await page.goto(`${APP_NO_ENV}/admin`);
  await expect(page.getByText('Administrace není správně nakonfigurována.')).toBeVisible();
  expect(adminRequestSeen).toBe(false);
});

test('nested product route marks Produkty active and Admin stays outside other layouts', async ({ page }) => {
  await openAuthorizedAdmin(page, '/admin/produkty/test-product');
  await expect(page.locator('nav[aria-label="Navigace administrace"]:visible').getByRole('link', { name: 'Produkty' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('[data-storefront-header]')).toHaveCount(0);
  await expect(page.locator('[data-focused-reservation-header]')).toHaveCount(0);
});

for (const width of [375, 390, 430, 768, 1024, 1440]) {
  test(`Admin foundation responsive contract at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openAuthorizedAdmin(page, '/admin/produkty');
    await expect(page.locator('[data-admin-page-title]')).toHaveText('Produkty');

    const overflow = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    expect(overflow.document).toBeLessThanOrEqual(overflow.viewport + 1);
    expect(overflow.body).toBeLessThanOrEqual(overflow.viewport + 1);

    if (width < 1024) {
      await expect(page.locator('[data-admin-mobile-header]')).toBeVisible();
      await expect(page.locator('[data-admin-sidebar]')).toBeHidden();
      const toggle = page.locator('[data-admin-nav-toggle]');
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(page.locator('#admin-mobile-navigation')).toBeVisible();
      await expect(page.locator('#admin-mobile-navigation').getByRole('link', { name: 'Produkty' })).toHaveAttribute('aria-current', 'page');
    } else {
      await expect(page.locator('[data-admin-sidebar]')).toBeVisible();
      await expect(page.locator('[data-admin-mobile-header]')).toBeHidden();
      await expect(page.locator('[data-admin-sidebar]').getByRole('link', { name: 'Produkty' })).toHaveAttribute('aria-current', 'page');
    }
  });
}