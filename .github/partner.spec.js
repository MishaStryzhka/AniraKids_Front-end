const { test, expect } = require('@playwright/test');
const APP = 'http://127.0.0.1:4173';
async function fixture(page, role = 'administrator') {
  const state = { writes: [], errors: [], pending: false, failure: null, deposit: 0, fittingCredit: 0, rentalPaid: 800 };
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
              subtotal: 800 - state.fittingCredit,
              deposit: state.deposit,
              source: 'partner',
              payment: {
                rentalBalance: 800 - state.fittingCredit - state.rentalPaid,
                ...(role === 'administrator' ? {
                  revision: 1, depositHeld: 0, fittingCredit: state.fittingCredit,
                  advanceBalance: Math.max(0, 200 - state.fittingCredit - state.rentalPaid),
                } : {}),
              },
              instructions: {
                fullPaymentInstructions: state.fittingCredit && state.rentalPaid < 800 - state.fittingCredit ? {
                  qrPayload: `SPD*1.0*ACC:CZ0708000000006644781399*AM:${(800 - state.fittingCredit - state.rentalPaid + state.deposit).toFixed(2)}*CC:CZK*MSG:AK-2026-BLAZE1*PT:IP`,
                } : null,
              },
            },
          ],
        });
      if (p === '/api/v2/partner/fittings') return json({ items: [] });
      if (p === '/api/v2/partner/balance')
        return json({
          earned: 600,
          collected: 0,
          balance: 600,
          lines: [{ kind: 'rental', number: 'AK-2026-BLAZE1', amount: 400, rentalPrice: 800, rewardBasis: 800, rewardRate: 50, status: 'returned' }, {kind:'rental',number:'AK-2026-WAIT01',amount:0,rentalPrice:900,rewardBasis:700,rewardRate:50,status:'confirmed'},{kind:'fitting',number:'ZK-CREDITED',amount:0,reason:'studio_rental'},{kind:'fitting',number:'ZK-EARNED',amount:200,reason:'fitting'},{kind:'fitting',number:'ZK-PENDING',amount:0,reason:'fitting'}],
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
    for(const [number,gross,total] of [['ZK-CREDITED','200 Kč','0 Kč'],['ZK-EARNED','200 Kč','200 Kč'],['ZK-PENDING','0 Kč','0 Kč']]) {
      const card=page.getByText(number,{exact:true}).locator('../..');
      await expect(card.locator('dl > div').filter({hasText:'Odměna za zkoušku'}).locator('dd')).toHaveText(gross);
      await expect(card.locator('dl > div').filter({hasText:'Celkem'}).locator('dd')).toHaveText(total);
      if(number==='ZK-CREDITED')await expect(card.locator('dl > div').filter({hasText:'Odečet odměny'}).locator('dd')).toHaveText('−200 Kč');
      else await expect(card.getByText(/Odečet odměny/)).toHaveCount(0);
    }

    for (const [number,price,formula,total] of [['AK-2026-BLAZE1','800 Kč','800 Kč × 50 %','400 Kč'],['AK-2026-WAIT01','900 Kč','700 Kč × 50 %','0 Kč']]) {
      const card=page.getByText(number,{exact:true}).locator('../..');
      await expect(card.locator('dl > div').filter({hasText:'Cena pronájmu'}).locator('dd')).toHaveText(price);
      await expect(card.locator('dl > div').filter({hasText:'Výpočet odměny Blaze'}).locator('dd')).toHaveText(formula);
      await expect(card.locator('dl > div').filter({hasText:'Celkem'}).locator('dd')).toHaveText(total);
    }
    await expect(page.getByText('Odměna se započítá po vrácení oděvu.')).toBeVisible();
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

for (const width of [375, 390, 430, 768, 1024, 1440])
  test('Blaze shows paid fitting as advance and only the remaining rent ' + width, async ({page}) => {
    const state = await fixture(page);
    state.fittingCredit = 200;
    state.rentalPaid = 0;
    await page.setViewportSize({width, height:1000});
    await page.goto(APP + '/partner/blaze?section=reservations');
    await expect(page.getByText('Cena pronájmu: 800 Kč', {exact:true})).toBeVisible();
    await expect(page.getByText('Rezervační záloha (součást nájemného): 200 Kč · uhrazeno ze zkoušky', {exact:true})).toBeVisible();
    await expect(page.getByText('Zbývá doplatit nájemné: 600 Kč', {exact:true})).toBeVisible();
    // The credit and balance are visible before opening payment controls.
    await page.getByText('Platby a QR', {exact:true}).click();
    const kind = page.getByLabel('Druh hotovostní platby');
    await expect(kind.locator('option[value="advance_received"]')).toHaveCount(0);
    await expect(kind).toHaveValue('rental_received');
    const qr = require('qrcode');
    const expectedQr = qr.create(
      'SPD*1.0*ACC:CZ0708000000006644781399*AM:600.00*CC:CZK*MSG:AK-2026-BLAZE1*PT:IP'
    ).modules;
    const qrImage = page.getByRole('img', {name:'QR kód', exact:true});
    await expect(qrImage).toBeVisible();
    // Compare QR modules, independent of browser/server PNG encoding.
    const modules = await qrImage.evaluate(async (img, size) => {
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = img.naturalWidth;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const scale = img.naturalWidth / (size + 4);
      return Array.from({length:size * size}, (_, index) => {
        const x = Math.floor((index % size + 2.5) * scale);
        const y = Math.floor((Math.floor(index / size) + 2.5) * scale);
        return ctx.getImageData(x, y, 1, 1).data[0] < 128 ? 1 : 0;
      });
    }, expectedQr.size);
    expect(modules).toEqual(Array.from(expectedQr.data));
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({path:'test-evidence/partner/fitting-advance-'+width+'.png',fullPage:true});
    await page.getByLabel('Přijatá hotovost v Kč').fill('600');
    await page.getByRole('button', {name:'Zaznamenat přijatou hotovost', exact:true}).click();
    await expect.poll(() => state.writes.length).toBe(1);
    expect(state.writes[0].payment).toMatchObject({type:'rental_received', amount:600, method:'cash'});
    expect(state.errors).toEqual([]);
  });

test('Blaze includes other recorded rent without subtracting the fitting twice', async ({page}) => {
  const state = await fixture(page);
  state.fittingCredit = 200;
  state.rentalPaid = 200;
  await page.goto(APP + '/partner/blaze?section=reservations');
  await expect(page.getByText('Cena pronájmu: 800 Kč', {exact:true})).toBeVisible();
  await expect(page.getByText('Rezervační záloha (součást nájemného): 200 Kč · uhrazeno ze zkoušky', {exact:true})).toBeVisible();
  await expect(page.getByText('Zbývá doplatit nájemné: 400 Kč', {exact:true})).toBeVisible();
  expect(state.errors).toEqual([]);
});

test('Blaze still accepts an unpaid advance without a fitting credit', async ({page}) => {
  const state = await fixture(page);
  state.pending = true;
  state.rentalPaid = 0;
  await page.goto(APP + '/partner/blaze?section=reservations');
  await expect(page.getByText('Cena pronájmu: 800 Kč', {exact:true})).toBeVisible();
  await expect(page.getByText('Zbývá doplatit nájemné: 800 Kč', {exact:true})).toBeVisible();
  await expect(page.getByText(/uhrazeno ze zkoušky/)).toHaveCount(0);
  await page.getByText('Platby a QR', {exact:true}).click();
  await page.getByLabel('Druh hotovostní platby').selectOption('advance_received');
  await page.getByLabel('Přijatá hotovost v Kč').fill('200');
  await page.getByRole('button', {name:'Zaznamenat přijatou hotovost', exact:true}).click();
  await expect.poll(() => state.writes.length).toBe(1);
  expect(state.writes[0].payment).toMatchObject({type:'advance_received', amount:200, method:'cash'});
  expect(state.errors).toEqual([]);
});
