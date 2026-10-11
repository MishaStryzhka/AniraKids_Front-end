const { test, expect } = require('@playwright/test');
const { ledger } = require('./payment-fixtures');
const fs = require('fs');
const evidence = 'test-evidence/payments';
fs.mkdirSync(evidence, { recursive: true });
function detail() {
  return {
    id: 'r1',
    reservationNumber: 'AK-2030-001',
    status: 'pending',
    paymentStatus: 'unpaid',
    pendingExpired: false,
    rentalMode: 'external',
    startDate: '2030-10-10',
    endDate: '2030-10-11',
    expiresAt: '2030-10-07T13:00:00Z',
    customerSnapshot: {
      firstName: 'Jana',
      lastName: 'Testová',
      email: 'fixture@example.test',
      phone: '+420777123456',
    },
    items: [
      {
        productId: 'p1',
        variantId: 'v1',
        inventoryItemId: 'i1',
        productNameSnapshot: 'Sofia',
        sizeSnapshot: '98',
        rentalPriceSnapshot: 500,
        depositSnapshot: 2000,
        inventoryCurrent: null,
      },
    ],
    subtotal: 500,
    deposit: 2000,
    totalDue: 2500,
  };
}
async function setup(page) {
  const state = {
    record: detail(),
    payments: ledger('r1', 200),
    writes: [],
    mode: 'normal',
    errors: [],
  };
  page.on('pageerror', e => state.errors.push(e.message));
  await page.addInitScript(() =>
    localStorage.setItem(
      'persist:auth',
      JSON.stringify({ token: JSON.stringify('fixture-admin-token') })
    )
  );
  await page.route('**/api/users/current', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { _id: 'admin1' } }),
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
      if (url.pathname === '/api/v2/admin/products')
        return json(200, {
          items: [],
          pagination: { page: 1, limit: 1, total: 0, pages: 0 },
        });
      if (url.pathname.endsWith('/payments')) {
        if (request.method() === 'GET')
          return json(200, { payments: state.payments });
        const body = request.postDataJSON();
        state.writes.push(body);
        if (state.mode === 'conflict')
          return json(409, {
            error: {
              code: 'PAYMENT_CONFLICT',
              message: 'private backend text',
            },
          });
        if (state.mode === 'unknown-missing') return route.abort('failed');
        if (
          !state.payments.entries.some(e => e.operationId === body.operationId)
        ) {
          const { expectedRevision, ...entry } = body;
          state.payments.entries.push({
            ...entry,
            recordedAt: '2030-10-07T12:00:00Z',
            recordedBy: 'admin1',
          });
          state.payments.revision++;
          if (
            body.type === 'advance_received' ||
            body.type === 'rental_received'
          ) {
            state.payments.rentalReceived += body.amount;
            state.payments.rentalNet += body.amount;
            state.payments.rentalBalance -= body.amount;
            state.payments.advanceBalance = Math.max(
              0,
              200 - state.payments.rentalNet
            );
            state.payments.refundableRental += body.amount;
          }
          if (body.type === 'deposit_received') {
            state.payments.depositReceived += body.amount;
            state.payments.depositHeld += body.amount;
          }
          if (body.type === 'rental_refunded') {
            state.payments.rentalRefunded += body.amount;
            state.payments.rentalNet -= body.amount;
            state.payments.refundableRental -= body.amount;
          }
          if (body.type === 'cancellation_fee') {
            state.payments.cancellationFee += body.amount;
            state.payments.refundableRental -= body.amount;
          }
        }
        if (state.mode === 'unknown-recorded') return route.abort('failed');
        return json(200, { payments: state.payments });
      }
      if (request.method() === 'GET') return json(200, state.record);
      state.record.status = url.pathname.endsWith('/cancel')
        ? 'cancelled'
        : 'confirmed';
      state.record.updatedAt = '2030-10-07T12:01:00Z';
      return json(200, {
        reservation: {
          id: 'r1',
          reservationNumber: state.record.reservationNumber,
          status: state.record.status,
          paymentStatus: state.record.paymentStatus,
          pendingExpired: false,
        },
      });
    }
  );
  return state;
}
async function open(page) {
  await page.goto('http://127.0.0.1:4173/admin/rezervace/r1');
  await expect(
    page.getByRole('button', { name: 'Zapsat platbu' })
  ).toBeEnabled();
}
async function prepare(
  page,
  type = 'advance_received',
  amount = '200',
  note = ''
) {
  await page.getByRole('button', { name: 'Zapsat platbu' }).click();
  await page.getByLabel('Druh operace').selectOption(type);
  await page.getByLabel('Částka (Kč)').fill(amount);
  if (note) await page.getByLabel('Důvod / poznámka').fill(note);
  await page.getByRole('button', { name: 'Zkontrolovat zápis' }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Potvrdit platební operaci',
  });
  await expect(dialog.getByRole('button', { name: 'Zpět' })).toBeFocused();
  return dialog;
}
for (const width of [390, 768, 1440])
  test(`separate advance/deposit/history and explicit confirmation at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const state = await setup(page);
    await open(page);
    await expect(page.getByLabel('Druh operace')).toHaveCount(0);
    await expect(page.getByText('Vrácené nájemné', { exact: true })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Zapsat platbu', exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Potvrdit rezervaci' })
    ).toBeDisabled();
    const panel = page.getByRole('region', { name: 'Platební evidence' });
    await expect(panel.getByText('Zatím nebyla zaznamenána žádná platba.')).toBeVisible();
    await expect(panel.getByRole('heading', { name: 'Nájemné' })).toHaveCount(0);
    await expect(panel.locator('summary')).toHaveCount(0);
    await expect(panel.getByRole('button', { name: 'Aktualizovat platby' })).toHaveCount(0);
    await panel.screenshot({ path: `${evidence}/empty-${width}.png` });
    const dialog = await prepare(page);
    expect(await page.getByLabel('Druh operace').locator('option').evaluateAll(options => options.map(o => o.value))).toEqual(['advance_received', 'rental_received', 'deposit_received']);
    await dialog.getByRole('button', { name: 'Potvrdit zápis' }).dblclick();
    await expect(page.getByRole('button', { name: 'Zapsat platbu', exact: true })).toBeEnabled();
    expect(state.writes).toHaveLength(1);
    await expect(panel.getByText('Zatím nebyla zaznamenána žádná platba.')).toHaveCount(0);
    await expect(panel.getByRole('heading', { name: 'Nájemné' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Potvrdit rezervaci' })
    ).toBeEnabled();
    expect(state.record.status).toBe('pending');
    await page.getByRole('button', { name: 'Potvrdit rezervaci' }).click();
    await expect(page.getByText('Potvrzená', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Zapsat platbu' })
    ).toBeEnabled();
    await (await prepare(page, 'deposit_received', '2000'))
      .getByRole('button', { name: 'Potvrdit zápis' })
      .click();
    await page.getByText('Historie plateb (2)', { exact: true }).click();
    await expect(page.getByText('Přijatá vratná kauce · 2 000 Kč')).toBeVisible();
    await page
      .getByRole('region', { name: 'Platební evidence' })
      .screenshot({ path: `${evidence}/ledger-${width}.png` });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1
      )
    ).toBe(true);
    expect(state.errors).toEqual([]);
  });
test('unknown append survives reload, absent GET permits only original replay; recorded GET reconciles without new write', async ({
  page,
}) => {
  const state = await setup(page);
  await open(page);
  state.mode = 'unknown-missing';
  await (await prepare(page))
    .getByRole('button', { name: 'Potvrdit zápis' })
    .click();
  await expect(
    page.getByText('Výsledek platební operace není potvrzený')
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Zopakovat původní požadavek' })
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Zopakovat původní požadavek' })
  ).toBeEnabled();
  await expect(
    page.getByRole('button', { name: 'Zapsat platbu' })
  ).toBeDisabled();
  state.mode = 'normal';
  await page
    .getByRole('button', { name: 'Zopakovat původní požadavek' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Zapsat platbu' })
  ).toBeEnabled();
  expect(state.writes[1]).toEqual(state.writes[0]);
  state.mode = 'unknown-recorded';
  await (await prepare(page, 'rental_received', '300'))
    .getByRole('button', { name: 'Potvrdit zápis' })
    .click();
  await expect(
    page.getByText('Výsledek platební operace není potvrzený')
  ).toBeVisible();
  await page.getByRole('button', { name: 'Aktualizovat platby' }).click();
  await expect(
    page.getByText('Původní operace je zaznamenána v platební historii.')
  ).toBeVisible();
  expect(state.writes).toHaveLength(3);
});
test('refund and conditional cancellation fee require reason; 409 reconciles and preserves draft', async ({
  page,
}) => {
  const state = await setup(page);
  state.record.status = 'cancelled';
  state.payments = {
    ...ledger('r1', 200),
    rentalReceived: 200,
    rentalNet: 200,
    advanceBalance: 0,
    rentalBalance: 300,
    refundableRental: 200,
  };
  await open(page);
  await page.getByRole('button', { name: 'Zapsat platbu' }).click();
  await page.getByLabel('Druh operace').selectOption('cancellation_fee');
  await page.getByLabel('Částka (Kč)').fill('100');
  await page.getByRole('button', { name: 'Zkontrolovat zápis' }).click();
  await expect(page.getByLabel('Důvod / poznámka')).toBeFocused();
  await page.getByLabel('Důvod / poznámka').fill('Individuálně posouzeno');
  await page.getByRole('button', { name: 'Zkontrolovat zápis' }).click();
  state.mode = 'conflict';
  await page.getByRole('button', { name: 'Potvrdit zápis' }).click();
  await expect(
    page.getByText('Platební evidence se změnila. Načtěte aktuální stav.')
  ).toBeVisible();
  expect(state.writes[0].method).toBeUndefined();
  await page.getByRole('button', { name: 'Aktualizovat platby' }).click();
  await expect(page.getByLabel('Důvod / poznámka')).toHaveValue(
    'Individuálně posouzeno'
  );
  state.mode = 'normal';
  await page.getByRole('button', { name: 'Zkontrolovat zápis' }).click();
  await page.getByRole('button', { name: 'Potvrdit zápis' }).click();
  await page.getByText('Historie plateb (1)', { exact: true }).click();
  await expect(page.getByText('Uplatněný storno poplatek · 100 Kč')).toBeVisible();
  await (await prepare(page, 'rental_refunded', '100', 'Vráceno zákaznici'))
    .getByRole('button', { name: 'Potvrdit zápis' })
    .click();
  await expect(
    page.getByText('Vrácené nájemné / záloha · 100 Kč')
  ).toBeVisible();
});

test('refund choices follow balances after refresh and never silently change an edited operation', async ({ page }) => {
  const state = await setup(page);
  state.payments.rentalReceived = 200;
  state.payments.rentalNet = 200;
  state.payments.refundableRental = 200;
  await open(page);
  await page.getByRole('button', { name: 'Zapsat platbu', exact: true }).click();
  const select = page.getByLabel('Druh operace');
  await expect(select.locator('option[value="rental_refunded"]')).toHaveCount(1);
  await expect(select.locator('option[value="deposit_refunded"]')).toHaveCount(0);
  await expect(select.locator('option[value="cancellation_fee"]')).toHaveCount(0);
  await select.selectOption('rental_refunded');
  await page.getByLabel('Částka (Kč)').fill('100');
  await page.getByLabel('Důvod / poznámka').fill('Vráceno zákaznici');
  state.payments.refundableRental = 0;
  await page.getByRole('button', { name: 'Aktualizovat platby' }).click();
  await expect(select.locator('option:checked')).toHaveText('Vyberte dostupnou operaci');
  await page.getByRole('button', { name: 'Zkontrolovat zápis' }).click();
  await expect(page.getByText('Tato operace už není dostupná. Vyberte jiný druh operace.')).toBeVisible();
  expect(state.writes).toHaveLength(0);
  state.payments.depositHeld = 2000;
  await page.getByRole('button', { name: 'Aktualizovat platby' }).click();
  await expect(select.locator('option[value="deposit_refunded"]')).toHaveCount(1);
});
