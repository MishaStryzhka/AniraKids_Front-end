const {test, expect} = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const APP = 'http://127.0.0.1:4173';
const EVIDENCE = process.env.ADMIN_FE02C01_EVIDENCE_DIR || 'test-evidence/admin-fe02c01';
fs.mkdirSync(EVIDENCE, {recursive: true});
const LOCAL_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2296%22 height=%22128%22%3E%3Crect width=%2296%22 height=%22128%22 fill=%22%23ddd%22/%3E%3C/svg%3E';
const UPLOAD_FILE = {name: 'fixture.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=', 'base64')};
const photo = (id, url = LOCAL_IMAGE) => ({publicId: id, url, alt: id});
const product = {
  id: 'p1', name: 'Sofia', slug: 'sofia', description: '', category: 'dress', gender: 'girls',
  color: 'Bílá', occasion: [], ageTags: [], brand: '', familyLookGroup: '', rentalEnabled: false,
  saleEnabled: false, defaultDeposit: 0, seo: {noIndex: false}, photos: [photo('a'), photo('b')],
  status: 'draft', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', rentalPrices: {},
};
const adminOrigin = 'http://admin-api.test';
const productsPath = '/api/v2/admin/products';
const matchesAdminProducts = url => url.origin === adminOrigin &&
  (url.pathname === productsPath || url.pathname.startsWith(`${productsPath}/`));
const states = new WeakMap();
const output = (name, value) => fs.writeFileSync(path.join(EVIDENCE, name), JSON.stringify(value, null, 2));
const json = (route, body, status = 200) => route.fulfill({status, contentType: 'application/json', body: JSON.stringify(body)});
const requestIdentity = request => {
  const url = new URL(request.url());
  // Diagnostics record routes, never query values, credentials or headers.
  return {method: request.method(), origin: url.origin, path: url.pathname};
};
async function mocks(page, seed = product, options = {}) {
  const state = {detailHits: 0, currentProduct: structuredClone(seed), requests: [], unexpected: [], sdkStubs: [], sign: 0, provider: 0, complete: []};
  const failures = [...(options.completeFailures || [])];
  states.set(page, state);
  // The isolated suite never falls through to external .test/provider/production networking.
  await page.route(url => /^https?:$/.test(url.protocol) && url.origin !== APP, async route => {
    state.unexpected.push(requestIdentity(route.request()));
    await route.abort('failed');
  });
  // These two globally mounted scripts are unrelated to the authenticated Product editor.
  // Stub their exact script paths; do not allow a broader Google origin or any API request.
  await page.route(url => (url.origin === 'https://maps.googleapis.com' && url.pathname === '/maps/api/js') ||
    (url.origin === 'https://accounts.google.com' && url.pathname === '/gsi/client'), async route => {
    expect(route.request().method()).toBe('GET');
    expect(route.request().resourceType()).toBe('script');
    state.sdkStubs.push(requestIdentity(route.request()));
    await route.fulfill({status: 200, contentType: 'application/javascript', body: '/* isolated SDK fixture: unused on Product editor */'});
  });
  await page.addInitScript(() => localStorage.setItem('persist:auth', JSON.stringify({token: JSON.stringify('admin-test-token')})));
  await page.route('https://example.test/api/users/current', route => json(route, {user: {_id: 'admin-user'}}));
  await page.route('https://example.test/api/users/favorites/storefront', route => {
    expect(route.request().method()).toBe('GET');
    return json(route, {favorites: []});
  });
  await page.route(matchesAdminProducts, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    state.requests.push({method, path: url.pathname});
    const detailPath = `${productsPath}/${state.currentProduct.id}`;
    if (method === 'GET' && url.pathname === productsPath) {
      const probe = url.searchParams.get('limit') === '1';
      return json(route, {items: probe ? [] : [state.currentProduct], pagination: {page: 1, limit: probe ? 1 : 20, total: probe ? 0 : 1, pages: probe ? 0 : 1}});
    }
    if (method === 'GET' && url.pathname === detailPath) {
      state.detailHits++;
      return json(route, {product: state.currentProduct, variants: []});
    }
    if (method === 'DELETE' && url.pathname === `${detailPath}/photos`) {
      const body = request.postDataJSON();
      state.currentProduct.photos = state.currentProduct.photos.filter(p => p.publicId !== body.publicId);
      return json(route, {product: state.currentProduct});
    }
    if (method === 'PATCH' && url.pathname === `${detailPath}/photos/order`) {
      const body = request.postDataJSON();
      expect([...body.publicIds].sort()).toEqual(state.currentProduct.photos.map(p => p.publicId).sort());
      state.currentProduct.photos = body.publicIds.map(id => state.currentProduct.photos.find(p => p.publicId === id));
      return json(route, {product: state.currentProduct});
    }
    if (method === 'PATCH' && url.pathname === `${detailPath}/photos`) {
      const body = request.postDataJSON();
      state.currentProduct.photos = state.currentProduct.photos.map(p => p.publicId === body.publicId ? {...p, alt: body.alt} : p);
      return json(route, {product: state.currentProduct});
    }
    if (options.upload && method === 'POST' && url.pathname === `${detailPath}/photos/sign`) {
      state.sign++;
      if (options.signGate) await options.signGate;
      return json(route, {upload: {cloudName: 'fixture', apiKey: 'fixture-key', signature: 'fixture-signature', resourceType: 'image',
        params: {timestamp: 1, folder: 'products/p1', public_id: 'x', overwrite: false, allowed_formats: 'jpg,jpeg,png,webp'}}});
    }
    if (options.upload && method === 'POST' && url.pathname === `${detailPath}/photos/complete`) {
      const body = request.postDataJSON();
      state.complete.push(body.publicId);
      expect(body.publicId).toBe('products/p1/x');
      const failure = failures.shift();
      if (failure === 'network') return route.abort('failed');
      if (failure === '502') return json(route, {error: {code: 'CLOUDINARY_OPERATION_FAILED', message: 'fixture provider uncertainty'}}, 502);
      if (!state.currentProduct.photos.some(p => p.publicId === body.publicId)) state.currentProduct.photos.push(photo(body.publicId));
      return json(route, {product: state.currentProduct});
    }
    state.unexpected.push(requestIdentity(request));
    return route.abort('failed');
  });
  if (options.upload) await page.route('https://api.cloudinary.com/v1_1/fixture/image/upload', route => {
    state.provider++;
    if (options.onProviderUpload) options.onProviderUpload(route.request());
    expect(route.request().method()).toBe('POST');
    expect(route.request().headers().authorization).toBeUndefined();
    if (options.providerUnknown) return route.abort('failed');
    return json(route, {public_id: 'products/p1/x'});
  });
  return state;
}
async function capture(page, name) {
  await page.screenshot({path: path.join(EVIDENCE, `${name}.png`), fullPage: false});
  output(`${name}.json`, await page.evaluate(() => ({
    viewport: {width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth},
    active: {tag: document.activeElement?.tagName, action: document.activeElement?.getAttribute('data-media-action'),
      photoId: document.activeElement?.closest('[data-photo-id]')?.getAttribute('data-photo-id'), id: document.activeElement?.id},
    dialogCount: document.querySelectorAll('[role="dialog"]').length,
  })));
}
async function chooseFile(page, file = UPLOAD_FILE) {
  await page.getByRole('button', {name: 'Přidat fotografii'}).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('dialog').getByRole('button', {name: 'Vybrat fotografii', exact: true}).click();
  await (await chooser).setFiles(file);
}
async function assertSelectedActions(page, buttonName, evidenceName) {
  const actions = page.locator('[data-product-photo-upload] .selected-actions');
  const parent = actions.locator('..');
  const primary = actions.getByRole('button', {name: buttonName, exact: true});
  await expect(primary).toBeVisible();
  const actionsBox = await actions.boundingBox();
  const parentBox = await parent.boundingBox();
  const primaryBox = await primary.boundingBox();
  expect(Math.abs(actionsBox.width - parentBox.width)).toBeLessThanOrEqual(1);
  expect(primaryBox.width).toBeGreaterThan(144);
  expect(primaryBox.height).toBeGreaterThanOrEqual(44);
  expect(primaryBox.height).toBeLessThanOrEqual(56);
  if (page.viewportSize().width < 768) expect(Math.abs(primaryBox.width - actionsBox.width)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  output(`${evidenceName}-geometry.json`, {viewport: page.viewportSize(), actions: actionsBox, selected: parentBox, primary: primaryBox});
  await actions.scrollIntoViewIfNeeded();
  await capture(page, evidenceName);
}
test.afterEach(async ({page}, testInfo) => {
  const state = states.get(page);
  if (state) {
    await testInfo.attach('mock-network-summary', {body: JSON.stringify({requests: state.requests, unexpected: state.unexpected, sdkStubs: state.sdkStubs}), contentType: 'application/json'});
    expect(state.unexpected).toEqual([]);
  }
});

test('admin products matcher has exact origin and path boundaries', () => {
  expect(matchesAdminProducts(new URL(`${adminOrigin}${productsPath}?page=1`))).toBe(true);
  expect(matchesAdminProducts(new URL(`${adminOrigin}${productsPath}/p1`))).toBe(true);
  expect(matchesAdminProducts(new URL(`${adminOrigin}${productsPath}/p1/photos/order`))).toBe(true);
  expect(matchesAdminProducts(new URL(`http://other.test${productsPath}/p1`))).toBe(false);
  expect(matchesAdminProducts(new URL(`${adminOrigin}${productsPath}-other`))).toBe(false);
  expect(matchesAdminProducts(new URL(`${adminOrigin}/api/v2/admin/reservations`))).toBe(false);
});
test('detail request is intercepted as 200 JSON before editor hydration', async ({page}) => {
  const state = await mocks(page);
  const observed = page.waitForResponse(response => response.url() === `${adminOrigin}${productsPath}/p1`);
  await page.goto(`${APP}/admin/produkty/p1`);
  const response = await observed;
  expect(response.request().method()).toBe('GET');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  expect(await response.json()).toEqual({product, variants: []});
  expect(state.detailHits).toBe(1);
  await expect(page.getByLabel('Název')).toHaveValue('Sofia');
  await expect(page.getByRole('heading', {name: 'Fotografie'})).toBeVisible();
});
for (const width of [375, 390, 430, 768, 1024, 1440]) test(`media responsive ${width}`, async ({page}) => {
  await mocks(page);
  await page.setViewportSize({width, height: 1000});
  await page.goto(`${APP}/admin/produkty/p1`);
  const media = page.locator('[data-product-media-section]');
  const heading = page.getByRole('heading', {name: 'Fotografie'});
  await expect(heading).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await expect(page.getByText('2 / 10 uložených')).toBeVisible();
  const image = media.locator('img').first();
  await expect(image).toHaveJSProperty('complete', true);
  await expect(image).toHaveJSProperty('naturalWidth', 96);
  const formBox = await page.locator('[data-product-core-form]').boundingBox();
  const dividerBox = await media.locator('hr').first().boundingBox();
  const headingBox = await heading.boundingBox();
  expect(Math.round(dividerBox.y - formBox.y - formBox.height)).toBe(48);
  expect(Math.round(headingBox.y - dividerBox.y - dividerBox.height)).toBe(32);
  const item = media.locator('[data-photo-id]').first();
  const itemBox = await item.boundingBox();
  const removeBox = await item.getByRole('button', {name: 'Odebrat fotografii'}).boundingBox();
  const earlierBox = await item.getByRole('button', {name: 'Posunout dříve'}).boundingBox();
  const laterBox = await item.getByRole('button', {name: 'Posunout později'}).boundingBox();
  const badge = item.getByText('Hlavní fotografie').locator('..');
  const badgeBox = await badge.boundingBox();
  const textBox = await badge.locator('..').boundingBox();
  const badgeStyle = await badge.evaluate(element => ({background: getComputedStyle(element).backgroundColor, height: element.getBoundingClientRect().height}));
  expect(badgeStyle.background).toBe('rgb(244, 240, 236)');
  expect(badgeStyle.height).toBeGreaterThanOrEqual(28);
  expect(badgeBox.width).toBeLessThan(textBox.width);
  if (width < 768) {
    expect(removeBox.y).toBeGreaterThan(itemBox.y + 120);
    expect(removeBox.width).toBeGreaterThan(itemBox.width * 0.75);
    expect(Math.abs(earlierBox.width - laterBox.width)).toBeLessThanOrEqual(1);
    expect(Math.round(laterBox.x - earlierBox.x - earlierBox.width)).toBe(8);
  }
  output(`geometry-${width}.json`, {width, viewport: await page.evaluate(() => ({w: innerWidth, h: innerHeight, scrollWidth: document.documentElement.scrollWidth})),
    form: formBox, divider: dividerBox, heading: headingBox, item: itemBox, remove: removeBox,
    earlier: earlierBox, later: laterBox, badge: badgeBox, badgeStyle, imageLoaded: true});
  await page.screenshot({path: path.join(EVIDENCE, `responsive-${width}.png`), fullPage: true});
  await chooseFile(page);
  await assertSelectedActions(page, 'Nahrát fotografii', `selected-upload-actions-${width}`);
});
test('dirty order actions keep frozen 16px list rhythm', async ({page}) => {
  await mocks(page);
  await page.goto(`${APP}/admin/produkty/p1`);
  await page.getByRole('button', {name: 'Posunout později'}).first().click();
  const listBox = await page.locator('[data-photo-list]').boundingBox();
  const actionsBox = await page.locator('[data-order-actions]').boundingBox();
  expect(Math.round(actionsBox.y - listBox.y - listBox.height)).toBe(16);
  output('order-spacing.json', {list: listBox, actions: actionsBox, gap: actionsBox.y - listBox.y - listBox.height});
});
test('media order makes combined leave risk and can stay', async ({page}) => {
  await mocks(page);
  await page.goto(`${APP}/admin/produkty/p1`);
  await page.getByRole('button', {name: 'Posunout později'}).first().click();
  await page.getByRole('link', {name: 'Produkty', exact: true}).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Neuložené nebo nedokončené změny');
  await expect(dialog.getByRole('button', {name: 'Zůstat'})).toBeFocused();
  await dialog.getByRole('button', {name: 'Zůstat'}).click();
  await expect(page).toHaveURL(/\/admin\/produkty\/p1$/);
});
test('short viewport keeps combined dialog actions reachable', async ({page}) => {
  await mocks(page);
  await page.setViewportSize({width: 390, height: 360});
  await page.goto(`${APP}/admin/produkty/p1`);
  await page.getByRole('button', {name: 'Posunout později'}).first().click();
  const toggle = page.locator('[data-admin-nav-toggle]');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const navigation = page.locator('#admin-mobile-navigation');
  await expect(navigation).toBeVisible();
  const invokingLink = navigation.getByRole('link', {name: 'Produkty', exact: true});
  await invokingLink.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', {name: 'Neuložené nebo nedokončené změny', exact: true})).toBeVisible();
  await expect(dialog).toHaveCount(1);
  await expect(dialog.getByRole('button', {name: 'Zůstat'})).toBeFocused();
  await expect(dialog.getByRole('button', {name: 'Zůstat'})).toBeVisible();
  await expect(dialog.getByRole('button', {name: 'Odejít', exact: true})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await capture(page, 'short-height-dialog-390x360');
  await dialog.getByRole('button', {name: 'Zůstat'}).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/admin\/produkty\/p1$/);
  await expect(page.getByRole('button', {name: 'Uložit pořadí'})).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toBeVisible();
  await expect(invokingLink).toBeVisible();
  await expect(invokingLink).toBeFocused();
});
test('reorder focus follows same photo at both edges with native keyboard and no PATCH', async ({page}) => {
  const state = await mocks(page, {...product, photos: [photo('a'), photo('b'), photo('c')]});
  await page.goto(`${APP}/admin/produkty/p1`);
  const b = page.locator('[data-photo-id="b"]');
  await b.getByRole('button', {name: 'Posunout později'}).click();
  await expect(b.getByRole('button', {name: 'Posunout dříve'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(b.getByRole('button', {name: 'Posunout dříve'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(b.getByRole('button', {name: 'Posunout později'})).toBeFocused();
  await expect(b.getByText('Hlavní fotografie')).toBeVisible();
  expect(state.currentProduct.photos.map(p => p.publicId)).toEqual(['a', 'b', 'c']);
  expect(state.requests.filter(r => r.method === 'PATCH')).toHaveLength(0);
  await capture(page, 'reorder-first-position-focus');
});
test('delete success focuses next surviving photo then previous at last position', async ({page}) => {
  await mocks(page, {...product, photos: [photo('a'), photo('b'), photo('c')]});
  await page.goto(`${APP}/admin/produkty/p1`);
  await page.locator('[data-photo-id="b"]').getByRole('button', {name: 'Odebrat fotografii'}).click();
  await page.getByRole('dialog').getByRole('button', {name: 'Odebrat fotografii'}).click();
  await expect(page.locator('[data-photo-id="c"] [data-media-action]').first()).toBeFocused();
  await capture(page, 'delete-middle-next-focus');
  await page.locator('[data-photo-id="c"]').getByRole('button', {name: 'Odebrat fotografii'}).click();
  await page.getByRole('dialog').getByRole('button', {name: 'Odebrat fotografii'}).click();
  await expect(page.locator('[data-photo-id="a"] [data-media-action]').first()).toBeFocused();
  await capture(page, 'delete-last-previous-focus');
});
test('allowed final-photo deletion focuses file trigger and cancel restores delete trigger', async ({page}) => {
  await mocks(page, {...product, photos: [photo('a')]});
  await page.goto(`${APP}/admin/produkty/p1`);
  const trigger = page.getByRole('button', {name: 'Odebrat fotografii'});
  await trigger.click();
  await page.getByRole('dialog').getByRole('button', {name: 'Zrušit'}).click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('dialog').getByRole('button', {name: 'Odebrat fotografii'}).click();
  await expect(page.getByRole('button', {name: 'Přidat fotografii'})).toBeFocused();
  await expect(page.getByText('Produkt zatím nemá žádné fotografie.')).toBeVisible();
  await capture(page, 'delete-final-file-trigger');
});
test('cancelling a selected upload restores the final-photo deletion trigger', async ({page}) => {
  const state = await mocks(page, {...product, photos: [photo('a')]});
  await page.goto(`${APP}/admin/produkty/p1`);
  await chooseFile(page);
  await page.getByRole('dialog').getByRole('button', {name: 'Zrušit'}).click();
  await expect(page.getByRole('button', {name: 'Přidat fotografii'})).toBeFocused();
  await page.getByRole('button', {name: 'Odebrat fotografii'}).click();
  await page.getByRole('dialog').getByRole('button', {name: 'Odebrat fotografii'}).click();
  await expect(page.getByRole('button', {name: 'Přidat fotografii'})).toBeFocused();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(state.requests.filter(r => r.method === 'POST')).toHaveLength(0);
  await capture(page, 'cancel-selected-then-delete-final');
});
test('broken image uses deliberate fallback while successful image stays loaded', async ({page}) => {
  await mocks(page, {...product, photos: [photo('ok'), photo('broken', 'data:image/png;base64,broken')]});
  await page.goto(`${APP}/admin/produkty/p1`);
  await expect(page.locator('[data-photo-id="ok"] img')).toHaveJSProperty('naturalWidth', 96);
  await expect(page.getByText('Náhled fotografie nelze zobrazit')).toBeVisible();
  await page.getByRole('heading', {name: 'Fotografie'}).scrollIntoViewIfNeeded();
  await capture(page, 'loaded-image-and-deliberate-fallback');
});
test('mocked browser upload retains same-ID COMPLETE retry and never reuploads after lost response', async ({page}) => {
  const state = await mocks(page, {...product, photos: []}, {upload: true, completeFailures: ['network']});
  await page.goto(`${APP}/admin/produkty/p1`);
  await page.getByLabel('Barva').fill('Růžová');
  await chooseFile(page);
  await page.getByRole('button', {name: 'Nahrát fotografii'}).click();
  const media = page.locator('[data-product-media-section]');
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('Připojení fotografie není potvrzené');
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('Fotografie byla nahrána, ale její připojení k produktu se nepodařilo potvrdit.');
  await assertSelectedActions(page, 'Zkusit připojit znovu', 'confirmed-provider-unconfirmed-attachment');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', {name: 'Pokračovat v nahrávání'}).click();
  await page.getByRole('button', {name: 'Zkusit připojit znovu'}).click();
  await expect(media.getByText('1 / 10 uložených')).toBeVisible();
  await expect(media.locator('[data-photo-id="products/p1/x"] img')).toHaveJSProperty('naturalWidth', 96);
  expect(state.sign).toBe(1);
  expect(state.provider).toBe(1);
  expect(state.complete).toEqual(['products/p1/x', 'products/p1/x']);
  await expect(page.getByLabel('Barva')).toHaveValue('Růžová');
  expect(state.requests.filter(r => r.method === 'PATCH' && r.path === `${productsPath}/p1`)).toHaveLength(0);
  await capture(page, 'same-id-recovery-saved-once');
});
test('unknown provider outcome and 502 keep one truthful recovery action', async ({page}) => {
  const state = await mocks(page, {...product, photos: []}, {upload: true, providerUnknown: true, completeFailures: ['502']});
  await page.goto(`${APP}/admin/produkty/p1`);
  await chooseFile(page);
  await page.getByRole('button', {name: 'Nahrát fotografii'}).click();
  await page.getByRole('button', {name: 'Ověřit a připojit'}).click();
  const media = page.locator('[data-product-media-section]');
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('Služba fotografie nepotvrdila, zda soubor existuje.');
  const retry = page.getByRole('dialog').getByRole('button', {name: /^(Ověřit a připojit|Zkusit ověřit znovu)$/});
  await expect(retry).toHaveCount(1);
  await expect(retry).toBeEnabled();
  await assertSelectedActions(page, 'Ověřit a připojit', 'unknown-provider-502-recovery');
  await retry.click();
  await expect(media.getByText('1 / 10 uložených')).toBeVisible();
  expect(state.sign).toBe(1);
  expect(state.provider).toBe(1);
  expect(state.complete).toEqual(['products/p1/x', 'products/p1/x']);
});


test('upload modal handles invalid files, replacement, focus and browser Back with one dialog', async ({page}) => {
  const state = await mocks(page);
  await page.goto(`${APP}/admin/produkty`);
  await page.getByRole('link', {name: /^Sofia/}).first().click();
  await chooseFile(page);
  const dialog = page.getByRole('dialog', {name: 'Přidat fotografii'});
  await expect(dialog).toHaveCount(1);
  await expect(page.locator('#root')).toHaveAttribute('inert', '');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', {name: 'Zrušit'})).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', {name: 'Upravit fotografii'})).toBeFocused();
  const chooser = page.waitForEvent('filechooser');
  await dialog.getByRole('button', {name: 'Vybrat jinou fotografii'}).click();
  await (await chooser).setFiles({name: 'bad.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>')});
  await expect(dialog.getByRole('status')).toContainText('Použijte obrázek');
  await expect(dialog.getByText('fixture.png')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(page.getByRole('dialog')).toContainText('Neuložené nebo nedokončené změny');
  await page.getByRole('dialog').getByRole('button', {name: 'Zůstat'}).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('fixture.png')).toBeVisible();
  await expect(page.locator('#root')).toHaveAttribute('inert', '');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#root')).not.toHaveAttribute('inert', '');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(page.getByRole('button', {name: 'Přidat fotografii'})).toBeFocused();
  expect(state.requests.filter(r => r.method === 'POST')).toHaveLength(0);
});


test('pending upload stays in its modal until attachment is confirmed', async ({page}) => {
  await page.setViewportSize({width: 390, height: 640});
  let release;
  const signGate = new Promise(resolve => {release = resolve;});
  const state = await mocks(page, {...product, photos: []}, {upload: true, signGate});
  await page.goto(`${APP}/admin/produkty/p1`);
  await chooseFile(page);
  const dialog = page.getByRole('dialog', {name: 'Přidat fotografii'});
  await dialog.getByRole('button', {name: 'Nahrát fotografii'}).click();
  await expect(dialog.getByRole('status')).toContainText('Připravujeme bezpečné nahrání');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Tab');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', {name: 'Zrušit'})).toBeDisabled();
  await expect(dialog.locator('[data-product-photo-upload]')).toBeFocused();
  release();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('1 / 10 uložených')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Přidat fotografii'})).toBeFocused();
  expect(state.sign).toBe(1);
  expect(state.provider).toBe(1);
  expect(state.complete).toEqual(['products/p1/x']);
});


async function cropFixture(page) {
  const data = await page.evaluate(() => {
    const canvas = document.createElement('canvas');canvas.width=600;canvas.height=400;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='rgb(180,40,40)';ctx.fillRect(0,0,200,400);
    ctx.fillStyle='rgb(20,160,80)';ctx.fillRect(200,0,200,400);
    ctx.fillStyle='rgb(40,40,180)';ctx.fillRect(400,0,200,400);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  return {name:'crop-fixture.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')};
}
for (const width of [390,768,1440]) test(`photo editor crop and upload ${width}`, async ({page}) => {
  await page.setViewportSize({width,height:852});
  const state=await mocks(page,{...product,photos:[]},{upload:true,onProviderUpload:request => {
    const body=request.postDataBuffer();
    expect(body.toString('latin1')).toContain('filename="crop-fixture-orez.png"');
    const start=body.indexOf(Buffer.from([137,80,78,71,13,10,26,10]));
    expect(start).toBeGreaterThan(0);
    expect(body.readUInt32BE(start+16)).toBe(100);
    expect(body.readUInt32BE(start+20)).toBe(100);
  }});
  await page.goto(`${APP}/admin/produkty/p1`);
  await page.getByLabel('Barva').fill('Růžová');
  await chooseFile(page,await cropFixture(page));
  const edit=page.getByRole('button',{name:'Upravit fotografii',exact:true});
  const box=await edit.boundingBox();expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);
  await edit.click();
  const editor=page.getByRole('dialog',{name:'Upravit fotografii',exact:true});
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await editor.getByLabel('Poměr stran').selectOption('square');
  await editor.getByLabel('Přiblížení').press('End');
  await expect(editor.getByLabel('Přiblížení')).toHaveValue('4');
  await capture(page,`photo-crop-editor-${width}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await editor.getByRole('button',{name:'Uložit',exact:true}).click();
  const upload=page.getByRole('dialog',{name:'Přidat fotografii',exact:true});
  await expect(upload).toBeVisible();
  await expect(upload.getByText('crop-fixture-orez.png')).toBeVisible();
  const preview=upload.getByRole('img',{name:'Náhled vybrané fotografie'});
  await expect(preview).toHaveJSProperty('naturalWidth',100);
  await expect(preview).toHaveJSProperty('naturalHeight',100);
  const pixel=await preview.evaluate(img => {const canvas=document.createElement('canvas');canvas.width=100;canvas.height=100;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);return [...ctx.getImageData(0,0,1,1).data];});
  expect(pixel).toEqual([20,160,80,255]);
  expect(state.sign).toBe(0);expect(state.provider).toBe(0);expect(state.complete).toEqual([]);
  await upload.getByRole('button',{name:'Nahrát fotografii'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('1 / 10 uložených')).toBeVisible();
  expect(state.sign).toBe(1);expect(state.provider).toBe(1);expect(state.complete).toEqual(['products/p1/x']);
  await expect(page.getByLabel('Barva')).toHaveValue('Růžová');
});

test('crop cancel preserves the original; browser Back keeps one dialog and restores the crop draft', async ({page}) => {
  const state=await mocks(page);
  await page.goto(`${APP}/admin/produkty`);
  await page.getByRole('link',{name:/^Sofia/}).first().click();
  await chooseFile(page,await cropFixture(page));
  const original=await page.getByRole('img',{name:'Náhled vybrané fotografie'}).getAttribute('src');
  await page.getByRole('button',{name:'Upravit fotografii',exact:true}).click();
  const editor=page.getByRole('dialog',{name:'Upravit fotografii',exact:true});
  await editor.getByLabel('Poměr stran').selectOption('square');
  await editor.getByLabel('Přiblížení').press('End');
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.getByRole('dialog').getByRole('button',{name:'Zůstat'}).click();
  await expect(editor).toBeVisible();
  await expect(editor.getByLabel('Poměr stran')).toHaveValue('square');
  await expect(editor.getByLabel('Přiblížení')).toHaveValue('4');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog',{name:'Přidat fotografii'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Upravit fotografii',exact:true})).toBeFocused();
  await expect(page.getByRole('img',{name:'Náhled vybrané fotografie'})).toHaveAttribute('src',original);
  await expect(page.getByText('crop-fixture.png')).toBeVisible();
  await expect(page.locator('#root')).toHaveAttribute('inert','');
  await page.getByRole('dialog').getByRole('button',{name:'Zrušit',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#root')).not.toHaveAttribute('inert','');
  expect(state.requests.filter(r=>r.method==='POST')).toHaveLength(0);
});
