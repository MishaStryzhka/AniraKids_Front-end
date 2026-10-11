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
    const guestNote = page.getByText('Rezervace vytvořené bez přihlášení otevřete jejich soukromým odkazem.');
    await expect(guestNote).not.toBeVisible();
    await capture(page, 'empty-history-' + width);
    const summary = page.locator('summary', { hasText: 'Rezervace bez přihlášení' });
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(guestNote).toBeVisible();
    const reads = state.historyReads;
    await page.getByRole('button', { name: 'Aktualizovat seznam' }).click();
    await expect.poll(() => state.historyReads).toBeGreaterThan(reads);
    await expect(catalogue).toBeVisible();
    for (const target of [catalogue, page.getByRole('button', { name: 'Aktualizovat seznam' })]) {
      const box = await target.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
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
  await page.getByRole('button', { name: 'Vybrat velikost a termín' }).click();
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
    expect(claims).toBe(0);
    expect((await claim.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await claim.click();
    await expect(page.getByRole('heading',{name:/AK-2030-OWN001/})).toBeVisible();
    expect(claims).toBe(1);
    expect(state.posts).toEqual([]);
    await capture(page,'recovered-history-'+width);
    expect(state.errors).toEqual([]);
  });
}
