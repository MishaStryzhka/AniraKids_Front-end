const { test, expect } = require('@playwright/test');
const APP = 'http://127.0.0.1:4173';
async function fixture(page, role = 'administrator') {
  const state = { writes: [], errors: [] };
  page.on('pageerror', e => state.errors.push(e.message));
  await page.addInitScript(() =>
    localStorage.setItem(
      'persist:auth',
      JSON.stringify({ token: JSON.stringify('partner-fixture') })
    )
  );
  await page.route(
    url => /^https?:$/.test(url.protocol) && url.origin !== APP,
    async route => {
      const req = route.request(),
        url = new URL(req.url()),
        p = url.pathname,
        json = (body, status = 200) => route.fulfill({ status, json: body });
      if (p === '/api/users/current')
        return json({
          user: { _id: '111111111111111111111111', firstName: 'Blaze' },
        });
      if (p.endsWith('/favorites/storefront')) return json({ ids: [] });
      if (p === '/maps/api/js' || p === '/gsi/client')
        return route.fulfill({
          contentType: 'application/javascript',
          body: '',
        });
      if (p === '/api/v2/site-settings')
        return json({
          sections: {
            girlsDresses: true,
            womenDresses: true,
            suits: true,
            familyLooks: false,
          },
        });
      if (p === '/api/v2/admin/access')
        return json({ error: { code: 'ADMIN_FORBIDDEN' } }, 403);
      if (p === '/api/v2/partner/access')
        return json({
          userId: '111111111111111111111111',
          owner: false,
          role,
          partnerId: 'blaze',
          name: 'Blaze Photostudio',
          enabled: true,
          referralCode: 'blaze-photographer',
        });
      if (p === '/api/v2/referrals/blaze')
        return json({
          token: 'signed.referral',
          expiresAt: Date.now() + 86400000,
          name: 'Blaze',
        });
      if (p === '/api/v2/partner/catalogue')
        return json({
          items: [
            {
              id: '222222222222222222222222',
              name: 'Dětské šaty DET001',
              slug: 'det001',
              variants: [
                {
                  id: '333333333333333333333333',
                  size: '74–80–86',
                  pieces: [
                    {
                      id: '444444444444444444444444',
                      code: 'DET001-01',
                      status: 'active',
                      condition: 'good',
                    },
                  ],
                },
              ],
            },
          ],
        });
      if (p === '/api/v2/partner/reservations')
        return json({
          items: [
            {
              id: '555555555555555555555555',
              number: 'AK-2026-BLAZE1',
              status: 'confirmed',
              startDate: '2026-10-20',
              endDate: '2026-10-20',
              rentalMode: 'studio',
              customer: {
                firstName: 'Jana',
                lastName: 'Nová',
                email: 'jana@example.test',
                phone: '+420777111222',
              },
              items: [
                {
                  productId: '222222222222222222222222',
                  name: 'Dětské šaty DET001',
                  size: '74–80–86',
                },
              ],
              subtotal: 800,
              deposit: 0,
              source: 'partner',
              payment: { rentalBalance: 0, revision: 1 },
              instructions: {},
            },
          ],
        });
      if (p === '/api/v2/partner/fittings') return json({ items: [] });
      if (p === '/api/v2/partner/balance')
        return json({
          earned: 400,
          collected: 0,
          balance: 400,
          lines: [{ kind: 'rental', number: 'AK-2026-BLAZE1', amount: 400 }],
          settlements: [],
          revision: 0,
        });
      if (p === '/api/v2/partner/members')
        return json({
          items: [
            {
              id: '111111111111111111111111',
              email: 'photographer@example.test',
              role: 'photographer',
              active: true,
              referralCode: 'blaze-photo',
              revision: 1,
            },
          ],
        });
      if (p === '/api/v2/partner/reservations/555555555555555555555555') {
        state.writes.push(req.postDataJSON());
        return json({ ok: true });
      }
      return json({ error: { code: 'NOT_FOUND' } }, 404);
    }
  );
  return state;
}
for (const width of [390, 768, 1440])
  test('partner cabinet and shared balance ' + width, async ({ page }) => {
    const state = await fixture(page);
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(APP + '/partner');
    await expect(
      page.getByRole('heading', { name: 'Přehled', exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('AK-2026-BLAZE1', { exact: true })
    ).toBeVisible();
    await expect(page).toHaveURL(APP+'/partner/blaze');
    const headerEntry=page.locator('[data-storefront-header]').getByRole('link',{name:'Administrace',exact:true});
    await expect(headerEntry).toBeVisible();
    await expect(headerEntry).toHaveAttribute('href','/partner/blaze');
    await headerEntry.click();
    await page
      .getByRole('link', { name: 'Platby a vyúčtování', exact: true })
      .click();
    await expect(page.getByText('ANIRAK má předat Blaze')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth
      )
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      path: 'test-evidence/partner/balance-' + width + '.png',
      fullPage: true,
    });
    await page.getByRole('link', { name: 'Tým a odkazy', exact: true }).click();
    await expect(page.getByText('photographer@example.test')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Uložit přístup' })
    ).toHaveCount(0);
    expect(state.errors).toEqual([]);
  });
test('photographer sees assigned work and personal referral without balances', async ({
  page,
}) => {
  const state = await fixture(page, 'photographer');
  await page.goto(APP + '/partner');
  await expect(
    page.getByRole('heading', { name: 'Můj doporučující odkaz' })
  ).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Partnerské menu' });
  await expect(
    nav.getByRole('link', { name: 'Platby a vyúčtování' })
  ).toHaveCount(0);
  await expect(nav.getByRole('link', { name: 'Tým a odkazy' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Připraveno', exact: true }).click();
  await expect.poll(() => state.writes.length).toBe(1);
  expect(state.writes[0]).toEqual({ action: 'prepare' });
  expect(state.errors).toEqual([]);
});
test('signed referral is captured without changing existing reservation storage', async ({
  page,
}) => {
  await fixture(page);
  await page.goto(APP + '/partner?ref=blaze');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('anirak.referral.v1') || 'null')
            ?.token
      )
    )
    .toBe('signed.referral');
});
