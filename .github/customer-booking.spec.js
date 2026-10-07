const { test, expect } = require('@playwright/test');
const fs = require('fs'),
  path = require('path');
const APP = 'http://127.0.0.1:4173',
  API = 'http://admin-api.test',
  EVIDENCE =
    process.env.CUSTOMER_BOOKING_EVIDENCE_DIR ||
    'test-evidence/customer-booking';
fs.mkdirSync(EVIDENCE, { recursive: true });
const P = '111111111111111111111111',
  V = '222222222222222222222222';
const product = {
  id: P,
  slug: 'sofia',
  name: 'Sofia',
  description: 'Slavnostní šaty pro výjimečné chvíle.',
  category: 'dress',
  color: 'Bílá',
  photos: [],
  variants: [
    {
      id: V,
      size: '98',
      pricing: {
        studio: { rentalPrice: 500, deposit: 1000, totalDue: 1500 },
        external: { rentalPrice: 800, deposit: 1000, totalDue: 1800 },
      },
    },
    {
      id: '333333333333333333333333',
      size: '104',
      pricing: {
        studio: null,
        external: { rentalPrice: 900, deposit: 1200, totalDue: 2100 },
      },
    },
  ],
};
function receipt(body) {
  return {
    reservationNumber: 'AK-2030-001',
    status: 'pending',
    rentalMode: body.rentalMode,
    startDate: body.startDate,
    endDate: body.endDate,
    expiresAt: '2030-10-07T13:00:00Z',
    item: {
      productId: P,
      variantId: body.variantId,
      productName: 'Sofia',
      size: '98',
      rentalPrice: 500,
      deposit: 1000,
    },
    subtotal: 500,
    deposit: 1000,
    totalDue: 1500,
    paymentStatus: 'unpaid',
  };
}
async function setup(page) {
  const state = {
    posts: [],
    reads: [],
    errors: [],
    mode: 'normal',
    records: new Map(),
    release: null,
    defer: false,
    deferQuote: false,
    releaseQuote: null,
    empty: false,
  };
  page.on('pageerror', error => state.errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await page.clock.setFixedTime(new Date('2030-10-07T12:00:00Z'));
  await page.addInitScript(() =>
    localStorage.setItem(
      'persist:auth',
      JSON.stringify({ token: JSON.stringify('legacy-token-must-not-leak') })
    )
  );
  await page.route('**/api/users/current', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { _id: 'legacy-user' } }),
    })
  );
  await page.route(
    url => url.origin === API,
    async route => {
      const req = route.request(),
        url = new URL(req.url());
      const json = (status, body) =>
        route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
      if (req.method() === 'OPTIONS')
        return route.fulfill({
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'content-type,idempotency-key',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          },
        });
      state.reads.push({
        method: req.method(),
        url: url.pathname,
        query: url.search,
        authorization: req.headers().authorization,
      });
      if (
        req.method() === 'GET' &&
        url.pathname === '/api/v2/catalogue/products'
      )
        return json(200, {
          items: state.empty ? [] : [product],
          page: Number(url.searchParams.get('page') || 1),
          limit: Number(url.searchParams.get('limit') || 12),
          total: state.empty ? 0 : 1,
          totalPages: state.empty ? 0 : 1,
        });
      if (
        req.method() === 'GET' &&
        url.pathname === '/api/v2/catalogue/products/sofia'
      )
        return json(200, { product });
      if (req.method() === 'GET' && url.pathname.endsWith('/availability')) {
        const selection = Object.fromEntries(url.searchParams);
        if (state.deferQuote)
          await new Promise(resolve => (state.releaseQuote = resolve));
        return json(200, {
          availability: {
            ...selection,
            productId: P,
            available: state.mode !== 'unavailable',
            checkedAt: '2030-10-07T12:00:00Z',
            pricing: { rentalPrice: 500, deposit: 1000, totalDue: 1500 },
          },
        });
      }
      if (req.method() === 'POST' && url.pathname === '/api/v2/reservations') {
        const body = req.postDataJSON(),
          key = req.headers()['idempotency-key'];
        state.posts.push({
          key,
          body,
          authorization: req.headers().authorization,
          raw: req.postData(),
        });
        if (state.defer)
          await new Promise(resolve => (state.release = resolve));
        if (state.mode === 'conflict')
          return json(409, {
            error: {
              code: 'NO_AVAILABLE_INVENTORY',
              message: 'private server detail',
            },
          });
        if (state.mode === 'mismatch')
          return json(409, {
            error: { code: 'IDEMPOTENCY_KEY_REUSED', message: 'private' },
          });
        const existing = state.records.get(key);
        if (existing)
          return json(200, {
            reservation: { ...existing, status: 'confirmed' },
            guestAccessToken: 'secret-never-store',
          });
        const created = receipt(body);
        state.records.set(key, created);
        if (state.mode === 'network') return route.abort('failed');
        if (state.mode === 'malformed')
          return json(201, {
            reservation: { ...created, totalDue: 1 },
            guestAccessToken: 'secret-never-store',
          });
        return json(201, {
          reservation: created,
          guestAccessToken: 'secret-never-store',
        });
      }
      return json(404, {
        error: { code: 'PRODUCT_NOT_FOUND', message: 'private' },
      });
    }
  );
  return state;
}
async function begin(page, captureProduct = false) {
  await page.goto(APP + '/saty');
  await page.getByRole('link', { name: 'Prohlédnout Sofia' }).click();
  await expect(
    page.getByRole('heading', { name: 'Sofia', exact: true })
  ).toBeVisible();
  if (captureProduct)
    await capture(page, 'product-' + page.viewportSize().width);
  await page.getByRole('button', { name: 'Vybrat velikost a termín' }).click();
  await page.getByLabel('Velikost', { exact: true }).selectOption(V);
  await page.getByLabel('Od', { exact: true }).fill('2030-10-10');
  await page.getByLabel('Do', { exact: true }).fill('2030-10-11');
}
async function quote(page) {
  await page.getByRole('button', { name: 'Ověřit dostupnost' }).click();
  await expect(page.getByText('Termín je aktuálně dostupný')).toBeVisible();
}
async function contact(page) {
  await page.getByLabel('Jméno', { exact: true }).fill('Jana');
  await page.getByLabel('Příjmení').fill('Nováková');
  await page.getByLabel('E-mail').fill('jana@example.test');
  await page.getByLabel('Telefon').fill('+420777123456');
  await page.getByLabel('Poznámka', { exact: true }).fill('Prosím připravit.');
}
async function capture(page, name) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  ).toBeLessThanOrEqual(1);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: path.join(EVIDENCE, name + '.png'),
    fullPage: true,
  });
}
for (const width of [390, 1440])
  test(
    'guest catalogue to receipt and deliberate new booking ' + width,
    async ({ page }) => {
      const state = await setup(page);
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(APP + '/saty');
      await expect(
        page.getByRole('link', { name: 'Prohlédnout Sofia' })
      ).toBeVisible();
      await capture(page, 'catalogue-' + width);
      await begin(page, true);
      await quote(page);
      await page
        .getByRole('button', { name: 'Rezervovat', exact: true })
        .click();
      await expect(page.getByLabel('Jméno', { exact: true })).toBeFocused();
      const fieldBox = await page
        .getByLabel('Jméno', { exact: true })
        .boundingBox();
      const headerBox = await page
        .locator('[data-focused-reservation-header]')
        .boundingBox();
      expect(fieldBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
      await contact(page);
      await capture(page, 'booking-' + width);
      await page
        .getByRole('button', { name: 'Rezervovat', exact: true })
        .click();
      await expect(
        page.getByRole('heading', { name: 'Rezervace byla vytvořena' })
      ).toBeFocused();
      await expect(page.getByText('Stav: Čeká na potvrzení')).toBeVisible();
      await capture(page, 'receipt-' + width);
      expect(state.posts).toHaveLength(1);
      expect(state.posts[0].key).toMatch(
        /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/
      );
      expect(state.reads.every(r => !r.authorization)).toBe(true);
      expect(page.url()).not.toContain('jana');
      const saved = await page.evaluate(() =>
        sessionStorage.getItem('anirakids.booking.v1')
      );
      expect(saved).not.toContain('jana@example.test');
      expect(saved).not.toContain('secret-never-store');
      expect(
        await page.evaluate(() => JSON.stringify(history.state))
      ).not.toContain('jana@example.test');
      await page.reload();
      await expect(page.getByText('AK-2030-001')).toBeVisible();
      expect(state.posts).toHaveLength(1);
      await page
        .getByRole('button', { name: 'Vytvořit novou rezervaci' })
        .click();
      await expect(page).toHaveURL(APP + '/pronajem');
      expect(
        await page.evaluate(() =>
          sessionStorage.getItem('anirakids.booking.v1')
        )
      ).toBeNull();
      expect(state.errors).toEqual([]);
    }
  );
for (const mode of ['network', 'malformed'])
  test(
    mode +
      ' unknown survives reload and navigation; explicit replay uses immutable body and key',
    async ({ page }) => {
      const state = await setup(page);
      await begin(page);
      await quote(page);
      await contact(page);
      state.mode = mode;
      await page
        .getByRole('button', { name: 'Rezervovat', exact: true })
        .click();
      await expect(
        page.getByRole('heading', { name: 'Výsledek rezervace není potvrzený' })
      ).toBeVisible();
      await capture(page, 'unknown-' + mode);
      expect(state.posts).toHaveLength(1);
      await page.reload();
      await expect(
        page.getByRole('heading', { name: 'Výsledek rezervace není potvrzený' })
      ).toBeVisible();
      expect(state.posts).toHaveLength(1);
      await page.getByRole('button', { name: 'Ukončit', exact: true }).click();
      await page.getByRole('link', { name: 'Prohlédnout Sofia' }).click();
      await expect(
        page.getByRole('link', { name: 'Otevřít rezervaci' })
      ).toBeVisible();
      await page.getByRole('link', { name: 'Otevřít rezervaci' }).click();
      await page.getByRole('button', { name: 'Ověřit stav rezervace' }).click();
      await expect(page.getByText('Stav: Potvrzená')).toBeVisible();
      expect(state.posts).toHaveLength(2);
      expect(state.posts[1].key).toBe(state.posts[0].key);
      expect(state.posts[1].raw).toBe(state.posts[0].raw);
      expect(state.records.size).toBe(1);
    }
  );
test('409 inventory conflict preserves contact, invalidates quote and allows reselection', async ({
  page,
}) => {
  const state = await setup(page);
  await begin(page);
  await quote(page);
  await contact(page);
  state.mode = 'conflict';
  await page.getByRole('button', { name: 'Rezervovat', exact: true }).click();
  await expect(
    page.getByText('Tento termín není dostupný. Vyberte prosím jiný termín.')
  ).toBeVisible();
  await expect(page.getByLabel('E-mail')).toHaveValue('jana@example.test');
  await expect(
    page.getByRole('button', { name: 'Rezervovat', exact: true })
  ).toBeDisabled();
  await expect(page.getByText('private server detail')).toHaveCount(0);
  expect(state.posts).toHaveLength(1);
  expect(
    await page.evaluate(() => sessionStorage.getItem('anirakids.booking.v1'))
  ).toBeNull();
});
test('single-flight survives leaving route while request is pending', async ({
  page,
}) => {
  const state = await setup(page);
  await begin(page);
  await quote(page);
  await contact(page);
  state.defer = true;
  await page
    .getByRole('button', { name: 'Rezervovat', exact: true })
    .evaluate(button => {
      button.click();
      button.click();
    });
  await expect.poll(() => Boolean(state.release)).toBe(true);
  await page.getByRole('button', { name: 'Ukončit', exact: true }).click();
  await page.getByRole('link', { name: /Rezervace — máte/ }).click();
  await expect(page.getByText('Odesílání rezervace…')).toBeVisible();
  state.release();
  await expect(page.getByText('AK-2030-001')).toBeVisible();
  expect(state.posts).toHaveLength(1);
});
test('late availability cannot enable changed selection; keyboard field validation works', async ({
  page,
}) => {
  const state = await setup(page);
  await begin(page);
  state.deferQuote = true;
  await page.getByRole('button', { name: 'Ověřit dostupnost' }).click();
  await expect.poll(() => Boolean(state.releaseQuote)).toBe(true);
  await page.getByLabel('Do', { exact: true }).fill('2030-10-12');
  state.releaseQuote();
  await expect(page.getByText('Termín je aktuálně dostupný')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Rezervovat', exact: true })
  ).toBeDisabled();
  await page.getByLabel('Od', { exact: true }).fill('2030-10-15');
  await page.getByRole('button', { name: 'Ověřit dostupnost' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Do', { exact: true })).toBeFocused();
  expect(state.posts).toHaveLength(0);
});
test('session storage failure prevents POST until explicit retry', async ({
  page,
}) => {
  const state = await setup(page);
  await begin(page);
  await quote(page);
  await contact(page);
  await page.evaluate(() => {
    window.bookingOriginalSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'anirakids.booking.v1') throw new Error('Unavailable');
      return window.bookingOriginalSet.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Rezervovat', exact: true }).click();
  await expect(
    page.getByText('Rezervaci nyní nelze bezpečně odeslat')
  ).toBeVisible();
  expect(state.posts).toHaveLength(0);
  await page.evaluate(() => {
    Storage.prototype.setItem = window.bookingOriginalSet;
  });
  await page.getByRole('button', { name: 'Zkusit znovu', exact: true }).click();
  await page.getByRole('button', { name: 'Rezervovat', exact: true }).click();
  await expect(page.getByText('AK-2030-001')).toBeVisible();
  expect(state.posts).toHaveLength(1);
});
test('catalogue route mapping, empty, search and unavailable product are honest', async ({
  page,
}) => {
  const state = await setup(page);
  state.empty = true;
  for (const [route, key, value] of [
    ['/saty', 'category', 'dress'],
    ['/obleky', 'category', 'suit'],
    ['/novinky', 'sort', 'newest'],
    ['/hledani?q=Sofia', 'q', 'Sofia'],
  ]) {
    await page.goto(APP + route);
    await expect(
      page.getByText('Momentálně nejsou dostupné žádné produkty.')
    ).toBeVisible();
    expect(new URLSearchParams(state.reads.at(-1).query).get(key)).toBe(value);
  }
  await page.goto(APP + '/produkt/missing');
  await expect(
    page.getByRole('heading', { name: 'Produkt není dostupný' })
  ).toBeVisible();
  expect(state.posts).toHaveLength(0);
});
test('unavailable quote and idempotency mismatch never claim success or enable new-key retry', async ({
  page,
}) => {
  const state = await setup(page);
  await begin(page);
  state.mode = 'unavailable';
  await page.getByRole('button', { name: 'Ověřit dostupnost' }).click();
  await expect(
    page.getByText('Tento termín není dostupný', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Rezervovat', exact: true })
  ).toBeDisabled();
  state.mode = 'normal';
  await quote(page);
  await contact(page);
  state.mode = 'mismatch';
  await page.getByRole('button', { name: 'Rezervovat', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Výsledek rezervace není potvrzený' })
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Vytvořit novou rezervaci' })
  ).toHaveCount(0);
  expect(state.posts).toHaveLength(1);
});
test('public no-env view makes no backend request', async ({ page }) => {
  test.skip(
    process.env.BOOKING_SKIP_NO_ENV === '1',
    'Local configured build; no-env build verified in CI'
  );
  const requests = [];
  page.on('request', req => {
    if (req.url().includes('/api/v2')) requests.push(req.url());
  });
  await page.goto('http://127.0.0.1:4174/pronajem');
  await expect(page.getByText('Katalog nyní není dostupný.')).toBeVisible();
  expect(requests).toEqual([]);
});
