const { test, expect } = require('@playwright/test');
const APP = 'http://127.0.0.1:4173';
async function fixture(page, role = 'administrator') {
  const state = { writes: [], errors: [], pending: false, failure: null, deposit: 0 };
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
      if (p === '/api/v2/partner/fittings')
        return json({items: [
          {id:'fitting-active', number:'ZK-CALENDAR', date:'2026-10-20', time:'16:00', status:'pending', paymentStatus:'unpaid', customer:{name:'Eva Kalendářová', email:'eva@example.test',phone:'+420777111222'}},
          {id:'fitting-expired', number:'ZK-EXPIRED', date:'2026-10-20', time:'17:00', status:'expired', paymentStatus:'unpaid', customer:{name:'Expired client'}}
        ]});
      if (p === '/api/v2/partner/reservations')
        return json({
          items: [
            {
              id: '555555555555555555555555',
              number: 'AK-2026-BLAZE1',
              status: state.pending ? 'pending' : 'confirmed',
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
              deposit: state.deposit,
              source: 'partner',
              payment: { rentalBalance: 0, revision: 1, depositHeld: 0 },
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
        if (state.failure === 'network') return route.abort('failed');
        if (state.failure === 'html') return route.fulfill({status:502,contentType:'text/html',body:'Bad gateway'});
        if (state.failure) return json({error:{code:state.failure,requestId:'12345678-1234-1234-1234-123456789abc'}},state.failure === 'INTERNAL_ERROR' ? 500 : 409);
        state.pending = false;
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

for (const width of [390, 768, 1440]) test('combined partner calendar ' + width, async ({page}) => {
  const state = await fixture(page);
  await page.setViewportSize({width, height:1000});
  await page.goto(APP + '/partner/blaze?section=calendar');
  await page.getByLabel('Rok', {exact:true}).selectOption('2026');
  await page.getByLabel('Měsíc', {exact:true}).selectOption('10');
  const day = page.locator('[data-calendar-day="2026-10-20"]');
  await expect(day).toHaveAttribute('aria-label', /Zkoušky: 1. Pronájmy: 1./);
  await day.click();
  await expect(page.getByText('AK-2026-BLAZE1', {exact:true})).toBeVisible();
  await expect(page.getByText(/Eva Kalendářová/)).toBeVisible();
  await expect(page.getByText(/ZK-EXPIRED/)).toHaveCount(0);
  await expect(page.getByRole('button', {name:'Obnovit',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button', {name:'Nová rezervace',exact:true})).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({path:'test-evidence/partner/calendar-'+width+'.png',fullPage:true});
  await page.locator('[data-calendar-day="2026-10-21"]').click();
  await expect(page.getByText('V tento den nejsou žádné zkoušky.')).toBeVisible();
  await expect(page.getByText('V tento den nejsou žádné pronájmy.')).toBeVisible();
  await page.getByLabel('Měsíc',{exact:true}).selectOption('11');
  await expect(page.locator('[data-calendar-day="2026-11-01"]')).toHaveAttribute('aria-pressed','true');
  expect(state.errors).toEqual([]);
});

test('calendar does not present incomplete counts when fittings fail', async ({page}) => {
  await fixture(page);
  await page.route('**/api/v2/partner/fittings?*', route => route.fulfill({status:503,json:{error:{code:'UNAVAILABLE'}}}));
  await page.goto(APP + '/partner/blaze?section=calendar');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('[data-calendar-day]')).toHaveCount(0);
});

for (const width of [390,1440]) test('failed confirmation is visible at the action and success refreshes status '+width,async({page})=>{
 const state=await fixture(page);state.pending=true;state.failure='PAYMENT_ADVANCE_REQUIRED';
 await page.setViewportSize({width,height:700});
 await page.goto(APP+'/partner/blaze?section=reservations');
 await expect(page.getByLabel('Odpovědný člen týmu')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Přiřadit obsluhu',exact:true})).toHaveCount(0);
 const confirm=page.getByRole('button',{name:'Potvrdit rezervaci',exact:true});
 await confirm.click();
 const alert=page.getByRole('alert');
 await expect(alert).toContainText('nejprve zaznamenejte přijetí požadované zálohy');
 await expect(alert).toBeFocused();
 await expect(alert).toBeInViewport();
 await expect(alert).not.toContainText('12345678-1234-1234-1234-123456789abc');
 await expect(alert).toHaveAttribute('data-request-id','12345678-1234-1234-1234-123456789abc');
 await expect(page.getByRole('button',{name:'Obnovit stav',exact:true})).toHaveCount(0);
 expect(await alert.evaluate((el)=>!!el.previousElementSibling?.textContent?.includes('Potvrdit rezervaci'))).toBe(true);
 await expect(confirm).toBeEnabled();
 for(const failure of ['INTERNAL_ERROR','network','html']){
  state.failure=failure;await confirm.click();await expect(alert).toBeVisible();await expect(confirm).toBeEnabled();
  await expect(alert).toContainText(failure==='INTERNAL_ERROR'?'Operaci se nepodařilo potvrdit':'Výsledek operace není ověřený');
 }
 state.failure=null;await confirm.click();
 await expect(page.getByRole('status').filter({hasText:'Potvrzení bylo úspěšně uloženo.'})).toBeVisible();
 await expect(confirm).toHaveCount(0);
 await expect(page.getByText('Potvrzená',{exact:true})).toBeVisible();
 expect(state.writes).toHaveLength(5);expect(state.errors).toEqual([]);
});

for(const width of [390,1440]) test('cash form submits payment and reports failures '+width,async({page})=>{
 const state=await fixture(page);state.failure='CONFLICT';
 await page.setViewportSize({width,height:700});
 await page.goto(APP+'/partner/blaze?section=reservations');
 await page.getByText('Platby a QR',{exact:true}).click();
 await page.getByLabel('Přijatá hotovost v Kč').fill('600');
 await page.getByRole('button',{name:'Zaznamenat přijatou hotovost',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('Údaje se změnily');
 expect(state.writes).toHaveLength(1);
 expect(state.writes[0]).toMatchObject({action:'payment',payment:{amount:600,type:'rental_received',method:'cash',expectedRevision:1}});
 const operation=state.writes[0].payment.operationId;
 state.failure=null;
 await page.getByRole('button',{name:'Zaznamenat přijatou hotovost',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:'Změna byla úspěšně uložena.'})).toBeVisible();
 expect(state.writes).toHaveLength(2);expect(state.writes[1].payment.operationId).toBe(operation);
 expect(state.errors).toEqual([]);
});

test('employee deposit amount is fixed to the full required deposit',async({page})=>{
 const state=await fixture(page);state.deposit=2000;
 await page.goto(APP+'/partner/blaze?section=reservations');
 await page.getByText('Platby a QR',{exact:true}).click();
 await page.getByLabel('Druh hotovostní platby').selectOption('deposit_received');
 await expect(page.getByLabel('Přijatá hotovost v Kč')).toHaveValue('2000');
 await expect(page.getByLabel('Přijatá hotovost v Kč')).toHaveAttribute('readonly','');
 await page.getByRole('button',{name:'Zaznamenat přijatou hotovost',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:'Změna byla úspěšně uložena.'})).toBeVisible();
 expect(state.writes[0].payment).toMatchObject({type:'deposit_received',amount:2000,method:'cash'});
});
