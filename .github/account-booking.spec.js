const { test, expect } = require('@playwright/test');
const { policy } = require('./payment-fixtures');
const fs = require('fs');
const APP = 'http://127.0.0.1:4173';
const API = 'http://admin-api.test';
const EVIDENCE = 'test-evidence/account-booking';
fs.mkdirSync(EVIDENCE, { recursive: true });
const profile = {
  _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', firstName: 'Jana', lastName: 'Nováková',
  email: 'jana@example.test', primaryPhoneNumber: '+420777123456',
};
const product = {
  id: '111111111111111111111111', slug: 'sofia', name: 'Sofia',
  category: 'dress', description: 'Slavnostní šaty.', color: 'Bílá', photos: [],
  variants: [{
    id: '222222222222222222222222', size: '98',
    pricing: { studio: { rentalPrice: 500, deposit: 1000, totalDue: 1500 }, external: null },
  }],
};
async function setup(page, { guest = false, delayProfile = false } = {}) {
  const state = { posts: [], errors: [], historyReads: 0, releaseProfile: null };
  page.on('pageerror', error => state.errors.push(error.message));
  if (!guest) await page.addInitScript(() => {
    localStorage.setItem('persist:auth', JSON.stringify({ token: JSON.stringify('test-session') }));
  });
  await page.route('**/api/users/current', async route => {
    if (delayProfile) await new Promise(resolve => { state.releaseProfile = resolve; });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: profile }) });
  });
  await page.route(url => url.origin === API, async route => {
    const request = route.request(), url = new URL(request.url());
    const json = body => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    if (request.method() !== 'GET') {
      state.posts.push(url.pathname);
      return route.fulfill({ status: 500 });
    }
    if (url.pathname === '/api/v2/booking-policy') return json(policy);
    if (url.pathname === '/api/v2/catalogue/products/sofia') return json({ product });
    if (url.pathname === '/api/v2/catalogue/products') return json({ items: [product], page: 1, limit: 12, total: 1, totalPages: 1 });
    if (url.pathname === '/api/v2/account/reservations') {
      state.historyReads++;
      return json({ items: [], total: 0, page: Number(url.searchParams.get('page')) });
    }
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":{"code":"NOT_FOUND"}}' });
  });
  return state;
}
async function enterBooking(page) {
  await page.goto(APP + '/produkt/sofia');
  await page.getByRole('button', { name: 'Vybrat velikost a termín' }).click();
}
async function capture(page, name) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: EVIDENCE + '/' + name + '.png', fullPage: true });
}
for (const width of [390, 768, 1440]) {
  test('empty account history and profile contacts at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const state = await setup(page);
    await page.goto(APP + '/ucet/rezervace');
    const catalogue = page.getByRole('link', { name: 'Prohlédnout nabídku' });
    await expect(catalogue).toBeVisible();
    await expect(catalogue).toHaveAttribute('href', '/novinky');
    await expect(page.getByRole('link', { name: 'Vybrat šaty' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^(Předchozí|Další)$/ })).toHaveCount(0);
    await expect(page.getByText('Strana 1')).toHaveCount(0);
    await expect(page.locator('summary', { hasText: 'Rezervace bez přihlášení' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Můj profil', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Aktualizovat seznam' })).toHaveCount(0);
    await capture(page, 'empty-history-' + width);
    const reads = state.historyReads;
    await page.reload();
    await expect.poll(() => state.historyReads).toBeGreaterThan(reads);
    await expect(catalogue).toBeVisible();
    const box = await catalogue.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
    await catalogue.click();
    await page.getByRole('link', { name: 'Prohlédnout Sofia' }).click();
    await page.getByRole('button', { name: 'Vybrat velikost a termín' }).click();
    await expect(page.getByLabel('Jméno', { exact: true })).toHaveValue(profile.firstName);
    await expect(page.getByLabel('Příjmení', { exact: true })).toHaveValue(profile.lastName);
    await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue(profile.email);
    await expect(page.getByLabel('Telefon', { exact: true })).toHaveValue(profile.primaryPhoneNumber);
    await page.getByLabel('Jméno', { exact: true }).fill('Eva');
    await expect(page.getByLabel('Jméno', { exact: true })).toBeFocused();
    await capture(page, 'prefilled-booking-' + width);
    expect(state.posts).toEqual([]);
    expect(state.errors).toEqual([]);
  });
}
test('late profile preserves typed and cleared fields after returning to the product', async ({ page }) => {
  const state = await setup(page, { delayProfile: true });
  await enterBooking(page);
  await page.getByLabel('Jméno', { exact: true }).fill('Eva');
  await page.getByLabel('E-mail', { exact: true }).fill('typed@example.test');
  await page.getByLabel('E-mail', { exact: true }).fill('');
  await expect.poll(() => Boolean(state.releaseProfile)).toBe(true);
  state.releaseProfile();
  await expect(page.getByLabel('Příjmení', { exact: true })).toHaveValue(profile.lastName);
  await expect(page.getByLabel('Jméno', { exact: true })).toHaveValue('Eva');
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Zpět', exact: true }).click();
  await page.getByRole('link', { name: 'Dokončit rezervaci', exact: true }).click();
  await expect(page.getByLabel('Jméno', { exact: true })).toHaveValue('Eva');
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('');
  expect(state.posts).toEqual([]);
});
test('guest booking remains editable with empty contacts', async ({ page }) => {
  const state = await setup(page, { guest: true });
  await enterBooking(page);
  for (const name of ['Jméno', 'Příjmení', 'E-mail', 'Telefon'])
    await expect(page.getByLabel(name, { exact: true })).toHaveValue('');
  await page.getByLabel('Jméno', { exact: true }).fill('Eva');
  await expect(page.getByLabel('Jméno', { exact: true })).toHaveValue('Eva');
  expect(state.posts).toEqual([]);
});

const ownedReceipt = {
  reservationNumber:'AK-2030-OWN001',status:'pending',rentalMode:'studio',
  startDate:'2030-10-10',endDate:'2030-10-11',expiresAt:'2030-10-08T13:00:00Z',
  item:{productId:product.id,variantId:product.variants[0].id,productName:'Sofia',size:'98',rentalPrice:500,deposit:1000},
  subtotal:500,deposit:1000,totalDue:1500,paymentStatus:'unpaid',
};
for (const width of [390,768,1440]) {
  test('authenticated creation appears in history and refresh uses same account '+width,async({page})=>{
    await page.setViewportSize({width,height:1000});
    await page.clock.install({time:new Date('2030-10-07T12:00:00Z')});
    const state=await setup(page);
    let posted=null, reads=0;
    await page.route(API+'/api/v2/catalogue/products/'+product.id+'/availability?**', route=>{
      const q=Object.fromEntries(new URL(route.request().url()).searchParams);
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({availability:{
        ...q,productId:product.id,available:true,pricing:product.variants[0].pricing.studio,checkedAt:'2030-10-07T12:00:00Z'}})});
    });
    await page.route(API+'/api/v2/reservations', async route=>{
      posted={authorization:route.request().headers().authorization,body:route.request().postDataJSON()};
      return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({reservation:ownedReceipt})});
    });
    await page.route(API+'/api/v2/reservations/'+ownedReceipt.reservationNumber,route=>{
      expect(route.request().headers().authorization).toBe('Bearer test-session'); reads++;
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reservation:ownedReceipt})});
    });
    await page.route(API+'/api/v2/account/reservations?**',route=>{
      expect(route.request().headers().authorization).toBe('Bearer test-session');
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({items:posted?[{reservation:ownedReceipt}]:[],total:posted?1:0,page:1})});
    });
    await enterBooking(page);
    await expect(page.getByLabel('E-mail',{exact:true})).toHaveValue(profile.email);
    await page.getByLabel('Velikost',{exact:true}).selectOption(product.variants[0].id);
    await page.getByLabel('Od',{exact:true}).fill('2030-10-10');
    await page.getByLabel('Do',{exact:true}).fill('2030-10-11');
    await page.getByLabel('Jméno',{exact:true}).focus();
    await expect(page.getByText('Termín je aktuálně dostupný',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Rezervovat',exact:true}).click();
    await expect(page.getByRole('heading',{name:ownedReceipt.reservationNumber,exact:true})).toBeVisible();
    expect(posted.authorization).toBe('Bearer test-session');
    expect(posted.body.customerId).toBeUndefined();
    expect(await page.evaluate(()=>sessionStorage.getItem('anirakids.booking.v1'))).not.toContain('test-session');
    await page.getByRole('button',{name:'Aktualizovat stav rezervace'}).click();
    await expect.poll(()=>reads).toBe(1);
    await page.getByRole('link',{name:'Otevřít aktuální stav rezervace'}).click();
    await expect(page.getByRole('heading',{name:/AK-2030-OWN001/})).toBeVisible();
    await capture(page,'owned-history-'+width);
    expect(state.errors).toEqual([]);
  });
  test('stored guest reservation can be linked without another booking '+width,async({page})=>{
    await page.setViewportSize({width,height:1000});
    const state=await setup(page);
    await page.addInitScript(r=>sessionStorage.setItem('anirakids.booking.v1',JSON.stringify({
      version:1,kind:'receipt',receipt:{...r,guestAccessToken:'g'.repeat(43)}
    })),ownedReceipt);
    let linked=false, claims=0;
    await page.route(API+'/api/v2/account/reservations?**',route=>route.fulfill({status:200,
      contentType:'application/json',body:JSON.stringify({items:linked?[{reservation:ownedReceipt}]:[],total:linked?1:0,page:1})}));
    await page.route(API+'/api/v2/account/reservations/'+ownedReceipt.reservationNumber+'/claim',route=>{
      expect(route.request().headers().authorization).toBe('Bearer test-session');
      expect(route.request().postDataJSON()).toEqual({guestAccessToken:'g'.repeat(43)});
      linked=true;claims++;
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reservation:ownedReceipt})});
    });
    await page.goto(APP+'/ucet/rezervace');
    const claim=page.getByRole('button',{name:'Připojit rezervaci k účtu'});
    await expect(claim).toBeVisible();
    await expect(page.locator('summary', { hasText: 'Rezervace bez přihlášení' })).toBeVisible();
    expect(claims).toBe(0);
    expect((await claim.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await claim.click();
    await expect(page.getByRole('heading',{name:/AK-2030-OWN001/})).toBeVisible();
    await expect(page.locator('summary', { hasText: 'Rezervace bez přihlášení' })).toHaveCount(0);
    expect(claims).toBe(1);
    expect(state.posts).toEqual([]);
    await capture(page,'recovered-history-'+width);
    expect(state.errors).toEqual([]);
  });
}

for (const width of [390, 768, 1440]) {
  for (const guest of [false, true]) {
    test('draft hub and matching product only ' + width + ' guest=' + guest, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      const state = await setup(page, { guest });
      const other = { ...product, id: '333333333333333333333333', slug: 'ema', name: 'Ema' };
      await page.route(API + '/api/v2/catalogue/products?**', route => route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ items: [product, other], page: 1, limit: 12, total: 2, totalPages: 1 })
      }));
      await page.route(API + '/api/v2/catalogue/products/ema', route => route.fulfill({
        status: 200, contentType: 'application/json', body: JSON.stringify({ product: other })
      }));
      await enterBooking(page);
      await page.getByLabel('Velikost', { exact: true }).selectOption(product.variants[0].id);
      await page.getByLabel('Jméno', { exact: true }).fill('Eva');
      await page.getByRole('button', { name: /^Ukončit/ }).click();
      const cards = page.locator('li').filter({ has: page.getByRole('heading', { name: 'Sofia', exact: true }) });
      await expect(cards.getByRole('link', { name: 'Dokončit rezervaci', exact: true })).toBeVisible();
      const otherCard = page.locator('li').filter({ has: page.getByRole('heading', { name: 'Ema', exact: true }) });
      await expect(otherCard.getByRole('link', { name: 'Dokončit rezervaci', exact: true })).toHaveCount(0);
      await page.getByRole('link', { name: 'Prohlédnout Ema' }).click();
      await expect(page.getByRole('link', { name: 'Dokončit rezervaci', exact: true })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Vybrat velikost a termín' })).toBeVisible();
      await page.getByRole('link', { name: /^Moje rezervace/ }).filter({ visible: true }).click();
      await expect(page).toHaveURL(APP + '/ucet/rezervace');
      await expect(page.getByText('Rozpracované', { exact: true })).toBeVisible();
      await expect(page.getByText('Zatím zde nejsou žádné rezervace.')).toHaveCount(0);
      const resume = page.getByRole('link', { name: 'Dokončit rezervaci', exact: true });
      await expect(resume).toBeVisible();
      await resume.focus();
      await expect(resume).toBeFocused();
      const box = await resume.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      await capture(page, 'draft-hub-' + width + '-' + guest);
      await resume.press('Enter');
      await expect(page.getByRole('group', { name: 'Sofia', exact: true }).getByLabel('Velikost', { exact: true })).toHaveValue(product.variants[0].id);
      await expect(page.getByLabel('Jméno', { exact: true })).toHaveValue('Eva');
      await page.getByRole('button', { name: 'Zpět', exact: true }).click();
      await expect(page.getByRole('link', { name: 'Dokončit rezervaci', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Vybrat velikost a termín' })).toHaveCount(0);
      expect(state.posts).toEqual([]);
      expect(state.errors).toEqual([]);
      if (guest) expect(state.historyReads).toBe(0);
    });
  }
}

for (const width of [390, 768, 1440]) {
  test('two garments share dates, calendar, one POST and complete history ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.clock.install({ time: new Date('2030-10-07T12:00:00Z') });
    const state = await setup(page);
    const second = { ...product, id: '444444444444444444444444', slug: 'ema', name: 'Ema',
      variants: [{ id: '555555555555555555555555', size: 'M',
        pricing: { studio: { rentalPrice: 700, deposit: 1500, totalDue: 2200 }, external: null } }] };
    await page.route(API + '/api/v2/catalogue/products?**', route => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({ items: [product, second], page: 1, limit: 12, total: 2, totalPages: 1 })
    }));
    await page.route(API + '/api/v2/catalogue/products/ema', route => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({ product: second })
    }));
    await page.route('**/availability-calendar?**', route => {
      const url = new URL(route.request().url()), q = Object.fromEntries(url.searchParams);
      const id = url.pathname.split('/')[5];
      const count = new Date(Number(q.month.slice(0, 4)), Number(q.month.slice(5)), 0).getDate();
      const days = Array.from({ length: count }, (_, index) => {
        const date = q.month + '-' + String(index + 1).padStart(2, '0');
        return { date, available: date >= '2030-10-07' && (!q.startDate || date >= q.startDate) &&
          !(id === second.id && (date === '2030-10-12' || (q.startDate && q.startDate <= '2030-10-12' && date >= '2030-10-12'))) };
      });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ calendar: {
        ...q, productId: id, startDate: q.startDate ?? null, today: '2030-10-07', checkedAt: '2030-10-07T12:00:00Z', days
      } }) });
    });
    await page.route('**/availability?**', route => {
      const url = new URL(route.request().url()), q = Object.fromEntries(url.searchParams);
      const selected = url.pathname.includes(second.id) ? second : product;
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ availability: {
        ...q, productId: selected.id, available: true, checkedAt: '2030-10-07T12:00:00Z',
        pricing: selected.variants[0].pricing.studio,
      } }) });
    });
    const basketReceipt = { ...ownedReceipt, reservationNumber: 'AK-2030-MULTI1',
      items: [ownedReceipt.item, { productId: second.id, variantId: second.variants[0].id,
        productName: second.name, size: 'M', rentalPrice: 700, deposit: 1500 }],
      subtotal: 1200, deposit: 2500, totalDue: 3700 };
    let posted = [];
    await page.route(API + '/api/v2/reservations', route => {
      posted.push(route.request().postDataJSON());
      expect(route.request().headers().authorization).toBe('Bearer test-session');
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reservation: basketReceipt }) });
    });
    await page.route(API + '/api/v2/account/reservations?**', route => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({ items: posted.length ? [{ reservation: basketReceipt }] : [], total: posted.length ? 1 : 0, page: 1 })
    }));
    await enterBooking(page);
    await page.getByLabel('Velikost', { exact: true }).selectOption(product.variants[0].id);
    await page.getByLabel('Od', { exact: true }).fill('2030-10-10');
    await page.getByLabel('Do', { exact: true }).fill('2030-10-11');
    await page.getByRole('link', { name: 'Přidat další produkt' }).click();
    await page.getByRole('link', { name: 'Prohlédnout Ema' }).click();
    await page.getByRole('button', { name: 'Vybrat velikost a termín' }).click();
    await expect(page.getByRole('group', { name: 'Sofia', exact: true }).getByLabel('Velikost', { exact: true })).toHaveValue(product.variants[0].id);
    await expect(page.getByLabel('Od', { exact: true })).toHaveValue('2030-10-10');
    await page.getByRole('group', { name: 'Ema', exact: true }).getByLabel('Velikost', { exact: true }).selectOption(second.variants[0].id);
    await expect(page.locator('button[data-date="2030-10-12"]')).toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('button[data-date="2030-10-11"]')).toHaveAttribute('aria-disabled', 'false');
    await page.getByRole('button', { name: /^Ukončit/ }).click();
    await expect(page.getByRole('link', { name: 'Dokončit rezervaci', exact: true })).toHaveCount(2);
    await page.getByRole('link', { name: /^Moje rezervace/ }).filter({ visible: true }).click();
    await expect(page.getByText('Rozpracované', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sofia', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ema', exact: true })).toBeVisible();
    await capture(page, 'multi-draft-' + width);
    await page.reload();
    await expect(page.getByText('Rozpracované', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ema', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Dokončit rezervaci', exact: true }).click();
    await page.getByRole('button', { name: 'Ověřit dostupnost' }).click();
    await expect(page.getByText('Termín je aktuálně dostupný', { exact: true })).toBeVisible();
    await capture(page, 'multi-checkout-' + width);
    await page.getByRole('button', { name: 'Rezervovat', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Rezervace byla vytvořena', exact: true })).toBeVisible();
    expect(posted).toHaveLength(1);
    expect(posted[0].items).toEqual([
      { productId: product.id, variantId: product.variants[0].id },
      { productId: second.id, variantId: second.variants[0].id }
    ]);
    expect(posted[0].startDate).toBe('2030-10-10');
    expect(posted[0].endDate).toBe('2030-10-11');
    await expect(page.getByRole('heading', { name: 'Sofia', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ema', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Otevřít aktuální stav rezervace' }).click();
    await expect(page.getByText('Sofia · Velikost 98', { exact: true })).toBeVisible();
    await expect(page.getByText('Ema · Velikost M', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dokončit rezervaci', exact: true })).toHaveCount(0);
    await capture(page, 'multi-history-' + width);
    expect(state.errors).toEqual([]);
  });
}
