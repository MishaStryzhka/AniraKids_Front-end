const { ledger } = require('./payment-fixtures');
const { test, expect } = require('@playwright/test');
const fs = require('fs'),
  path = require('path');
const APP = 'http://127.0.0.1:4173';
const EVIDENCE =
  process.env.ADMIN_RESERVATION_LIFECYCLE_EVIDENCE_DIR ||
  'test-evidence/admin-reservation-lifecycle';
fs.mkdirSync(EVIDENCE, { recursive: true });
const targets = {
  confirm: 'confirmed',
  prepare: 'prepared',
  rent: 'rented',
  return: 'returned',
  cancel: 'cancelled',
};
const base = id => ({
  id,
  reservationNumber: 'AK-2026-' + id,
  customerSnapshot: {
    firstName: 'Jana',
    lastName: 'Nováková',
    email: 'fixture@example.test',
    phone: '+420 123 456 789',
  },
  items: [
    {
      productId: 'p1',
      variantId: 'v1',
      inventoryItemId: 'i1',
      productNameSnapshot: 'Slavnostní šaty Sofia',
      sizeSnapshot: '98',
      rentalPriceSnapshot: 1200,
      depositSnapshot: 500,
      inventoryCurrent: {
        internalCode: 'AK-001',
        status: 'active',
        condition: 'good',
      },
    },
  ],
  status: 'pending',
  paymentStatus: 'unpaid',
  rentalMode: 'external',
  startDate: '2026-10-07',
  endDate: '2026-10-09',
  expiresAt: '2026-10-07T10:15:00Z',
  pendingExpired: true,
  subtotal: 1200,
  deposit: 500,
  totalDue: 1700,
  notes: 'Původní poznámka',
});
async function setup(page) {
  const state = {
    records: { r1: base('r1'), r2: base('r2') },
    mutations: [],
    reads: [],
    errors: [],
    mode: 'normal',
    defer: false,
    release: null,
  };
  page.on('pageerror', error => state.errors.push(error.message));
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
        url = new URL(request.url()),
        parts = url.pathname.split('/'),
        action = parts.at(-1),
        id = request.method() === 'GET' ? action : parts.at(-2);
      const json = (status, body) =>
        route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
      if (request.method() === 'GET' && url.pathname.endsWith('/payments'))
        return json(200, { payments: ledger(url.pathname.split('/').at(-2)) });
      if (url.pathname === '/api/v2/admin/products')
        return json(200, {
          items: [],
          pagination: { page: 1, limit: 1, total: 0, pages: 0 },
        });
      if (!url.pathname.startsWith('/api/v2/admin/reservations/'))
        return route.abort('failed');
      if (request.method() === 'GET') {
        state.reads.push(id);
        return json(200, state.records[id]);
      }
      state.mutations.push({
        id,
        action,
        method: request.method(),
        body: request.postDataJSON(),
      });
      const mode = state.mode;
      if (state.defer)
        await new Promise(resolve => {
          state.release = resolve;
        });
      if (mode === 'forbidden')
        return json(403, { error: { code: 'ADMIN_FORBIDDEN' } });
      if (mode === 'conflict')
        return json(409, {
          error: {
            code: 'RESERVATION_CONFIRMATION_CONFLICT',
            message: 'raw private error',
          },
        });
      const record = state.records[id];
      if (action === 'notes') {
        if (request.postDataJSON().notes)
          record.notes = request.postDataJSON().notes;
        else delete record.notes;
      } else {
        record.status = targets[action];
        record.pendingExpired = false;
        record.expiresAt = null;
        if (action === 'cancel') {
          record.cancellationReason = request.postDataJSON().reason;
          record.cancelledAt = '2026-10-07T12:00:00Z';
        }
      }
      if (mode === 'network') return route.abort('failed');
      if (mode === 'malformed')
        return json(200, { reservation: { id: 'wrong' } });
      return json(200, {
        reservation: {
          id: record.id,
          reservationNumber: record.reservationNumber,
          status: record.status,
          paymentStatus: record.paymentStatus,
          pendingExpired: record.pendingExpired,
          ...(record.notes === undefined ? {} : { notes: record.notes }),
          ...(record.cancellationReason
            ? {
                cancellationReason: record.cancellationReason,
                cancelledAt: record.cancelledAt,
              }
            : {}),
        },
      });
    }
  );
  return state;
}
async function ready(page, id = 'r1') {
  await page.goto(APP + '/admin/rezervace/' + id);
  await expect(
    page.getByRole('heading', { name: 'AK-2026-' + id, exact: true })
  ).toBeVisible();
}
async function capture(page, name) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  ).toBeLessThanOrEqual(1);
  await page.screenshot({
    path: path.join(EVIDENCE, name + '.png'),
    fullPage: true,
  });
}
for (const width of [390, 1440])
  test(
    'lifecycle, editable notes and safe dialog at ' + width,
    async ({ page }) => {
      const state = await setup(page);
      await page.setViewportSize({ width, height: 1000 });
      await ready(page);
      await expect(
        page.getByText('Čekání vypršelo', { exact: true })
      ).toBeVisible();
      await capture(page, 'pending-' + width);
      await page
        .getByRole('button', { name: 'Zrušit rezervaci', exact: true })
        .click();
      const dialog = page.getByRole('dialog', { name: 'Zrušit rezervaci' });
      await expect(
        dialog.getByRole('button', { name: 'Zpět', exact: true })
      ).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(
        dialog.getByRole('textbox', { name: 'Důvod zrušení' })
      ).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(
        dialog.getByRole('button', { name: 'Zpět', exact: true })
      ).toBeFocused();
      await capture(page, 'cancel-dialog-' + width);
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await page
        .getByLabel('Poznámky', { exact: true })
        .fill(' Uložená poznámka ');
      await page.getByRole('button', { name: 'Uložit poznámky' }).click();
      await expect(page.getByText('Poznámky byly uloženy.')).toBeVisible();
      await expect(page.getByLabel('Poznámky', { exact: true })).toHaveValue(
        'Uložená poznámka'
      );
      await page.getByLabel('Poznámky', { exact: true }).fill('');
      await page.getByRole('button', { name: 'Uložit poznámky' }).click();
      await expect(page.getByText('Poznámky byly uloženy.')).toBeVisible();
      for (const [label, status] of [
        ['Potvrdit rezervaci', 'Potvrzená'],
        ['Připravit rezervaci', 'Připravená'],
        ['Předat zákazníkovi', 'Vypůjčená'],
        ['Přijmout vrácení', 'Vrácená'],
      ]) {
        await page.getByRole('button', { name: label, exact: true }).click();
        await expect(page.getByText(status, { exact: true })).toBeVisible();
        await expect(
          page.getByLabel('Aktuální stav rezervace', { exact: true })
        ).toBeFocused();
      }
      await expect(
        page.getByRole('button', { name: 'Zrušit rezervaci', exact: true })
      ).toHaveCount(0);
      await expect(
        page.getByText('Nezaplaceno', { exact: true })
      ).toBeVisible();
      await capture(page, 'returned-' + width);
      expect(state.mutations.map(item => item.action)).toEqual([
        'notes',
        'notes',
        'confirm',
        'prepare',
        'rent',
        'return',
      ]);
      expect(state.mutations.slice(0, 2).map(item => item.body)).toEqual([
        { notes: 'Uložená poznámka' },
        { notes: '' },
      ]);
      expect(state.errors).toEqual([]);
    }
  );
test('cancellation requires reason and shows only observed cancellation after fresh GET', async ({
  page,
}) => {
  const state = await setup(page);
  await ready(page);
  await page
    .getByRole('button', { name: 'Zrušit rezervaci', exact: true })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Zrušit rezervaci' });
  await dialog
    .getByRole('button', { name: 'Zrušit rezervaci', exact: true })
    .click();
  await expect(dialog.getByRole('alert')).toContainText(
    'Zadejte důvod zrušení.'
  );
  expect(state.mutations).toHaveLength(0);
  await dialog.getByLabel('Důvod zrušení').fill(' Žádost zákaznice ');
  await dialog
    .getByRole('button', { name: 'Zrušit rezervaci', exact: true })
    .click();
  await expect(page.getByText('Zrušená', { exact: true })).toBeVisible();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByText('Žádost zákaznice', { exact: true })
  ).toBeVisible();
  expect(state.mutations).toEqual([
    {
      id: 'r1',
      action: 'cancel',
      method: 'POST',
      body: { reason: 'Žádost zákaznice' },
    },
  ]);
  expect(state.reads).toEqual(['r1', 'r1']);
  await capture(page, 'cancelled');
});
for (const mode of ['network', 'malformed'])
  test(
    mode + ' outcome blocks repeats until explicit GET observes server state',
    async ({ page }) => {
      const state = await setup(page);
      await page.setViewportSize({ width: 390, height: 1000 });
      await ready(page);
      state.mode = mode;
      await page.getByRole('button', { name: 'Potvrdit rezervaci' }).click();
      const alert = page.getByRole('alert');
      await expect(alert).toContainText(
        'Výsledek změny rezervace není potvrzený'
      );
      await expect(alert).toBeFocused();
      await expect(
        page.getByRole('button', { name: 'Potvrdit rezervaci' })
      ).toBeDisabled();
      await expect(
        page.getByRole('button', { name: 'Zrušit rezervaci', exact: true })
      ).toBeDisabled();
      await page
        .getByLabel('Poznámky', { exact: true })
        .fill('draft after unknown');
      await expect(
        page.getByRole('button', { name: 'Uložit poznámky' })
      ).toBeDisabled();
      expect(state.reads).toEqual(['r1']);
      expect(state.mutations).toHaveLength(1);
      await capture(page, 'unknown-' + mode);
      await page.getByRole('button', { name: 'Načíst aktuální stav' }).click();
      await expect(
        page.getByRole('button', { name: 'Připravit rezervaci' })
      ).toBeEnabled();
      await expect(
        page.getByText('Aktuální stav rezervace byl načten.')
      ).toBeVisible();
      await expect(page.getByLabel('Poznámky', { exact: true })).toHaveValue(
        'draft after unknown'
      );
      expect(state.mutations).toHaveLength(1);
    }
  );
test('conflict has localized copy and fresh GET recovery, with no mutation replay', async ({
  page,
}) => {
  const state = await setup(page);
  await ready(page);
  state.mode = 'conflict';
  await page.getByRole('button', { name: 'Potvrdit rezervaci' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Rezervaci nelze potvrdit'
  );
  await expect(page.getByText('raw private error')).toHaveCount(0);
  await page.getByRole('button', { name: 'Načíst aktuální stav' }).click();
  await expect(
    page.getByRole('button', { name: 'Potvrdit rezervaci' })
  ).toBeEnabled();
  expect(state.mutations).toHaveLength(1);
  expect(state.reads).toHaveLength(2);
});
test('duplicate click is one request; newer notes text keeps focus through delayed response', async ({
  page,
}) => {
  const state = await setup(page);
  await ready(page);
  state.defer = true;
  const notes = page.getByLabel('Poznámky', { exact: true });
  await notes.fill('submitted');
  await page
    .getByRole('button', { name: 'Uložit poznámky' })
    .evaluate(button => {
      button.click();
      button.click();
    });
  await expect.poll(() => state.mutations.length).toBe(1);
  await expect.poll(() => Boolean(state.release)).toBe(true);
  await notes.fill('newer typing');
  state.release();
  await expect(page.getByText('Poznámky byly uloženy.')).toBeVisible();
  await expect(notes).toHaveValue('newer typing');
  await expect(notes).toBeFocused();
  expect(state.mutations).toHaveLength(1);
});
test('late access error from a departed reservation cannot affect the new detail', async ({
  page,
}) => {
  const state = await setup(page);
  await ready(page);
  state.mode = 'forbidden';
  state.defer = true;
  await page.getByRole('button', { name: 'Potvrdit rezervaci' }).click();
  await expect.poll(() => Boolean(state.release)).toBe(true);
  await page.evaluate(() => {
    history.pushState(null, '', '/admin/rezervace/r2');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(
    page.getByRole('heading', { name: 'AK-2026-r2', exact: true })
  ).toBeVisible();
  state.release();
  await expect(
    page.getByRole('heading', { name: 'AK-2026-r2', exact: true })
  ).toBeVisible();
  await expect(page.getByText('Nemáte oprávnění k administraci.')).toHaveCount(
    0
  );
  await expect(
    page.getByRole('button', { name: 'Potvrdit rezervaci' })
  ).toBeEnabled();
  expect(state.errors).toEqual([]);
});
