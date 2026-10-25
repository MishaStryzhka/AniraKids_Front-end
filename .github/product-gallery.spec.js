const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const APP = 'http://127.0.0.1:4173';
const EVIDENCE = 'test-evidence/product-gallery';
const states = new WeakMap();
fs.mkdirSync(EVIDENCE, { recursive: true });

async function setup(page, { count = 4, broken = false, name = 'Sofia' } = {}) {
  const state = { unexpected: [], errors: [] };
  states.set(page, state);
  page.on('pageerror', error => state.errors.push(error.message));
  const photos = Array.from({ length: count }, (_, index) => ({ url: `${APP}/fixtures/gallery-${index}.jpg`, alt: `${name} – pohled ${index + 1}` }));
  const product = { id: '111111111111111111111111', slug: 'sofia', name, category: 'dress', gender: 'girls',
    description: 'Slavnostní šaty pro výjimečné chvíle.', color: 'Krémová', photos, variants: [] };
  await page.route(url => /^https?:$/.test(url.protocol) && url.origin !== APP, async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/v2/site-settings') return route.fulfill({json:{cooperationActive:true,sections:{suits:true,familyLooks:false}}});
    if (route.request().method() === 'GET') {
      if ((url.origin === 'https://maps.googleapis.com' && url.pathname === '/maps/api/js') ||
          (url.origin === 'https://accounts.google.com' && url.pathname === '/gsi/client'))
        return route.fulfill({ contentType: 'application/javascript', body: '/* isolated SDK fixture */' });
      if (url.origin === 'http://admin-api.test' && url.pathname === '/api/v2/catalogue/products/sofia')
        return route.fulfill({ json: { product } });
      if (url.origin === 'http://admin-api.test' && url.pathname === '/api/v2/catalogue/products')
        return route.fulfill({ json: { items: [product], page: 1, limit: 12, total: 1, totalPages: 1 } });
      if (url.origin === 'https://example.test' && url.pathname === '/api/users/favorites/storefront')
        return route.fulfill({ json: { ids: [] } });
    }
    state.unexpected.push({ method: route.request().method(), origin: url.origin, path: url.pathname });
    return route.abort();
  });
  await page.route(`${APP}/fixtures/gallery-*.jpg`, route => {
    const index = Number(new URL(route.request().url()).pathname.match(/gallery-(\d+)/)[1]);
    if (broken && index === 0) return route.fulfill({ status: 404, body: '' });
    const image = ['product-card-1.jpg', 'product-card-2.jpg', 'product-card-3.jpg', 'big-photo-product-card.jpg'][index % 4];
    return route.fulfill({ contentType: 'image/jpeg', body: fs.readFileSync(path.join('src/images', image)) });
  });
}
test.afterEach(async ({ page }) => {
  const state = states.get(page);
  if (state) { expect(state.unexpected).toEqual([]); expect(state.errors).toEqual([]); }
});

for (const width of [375, 390, 430, 768, 1440]) test(`product gallery thumbnails, lightbox and keyboard at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  await setup(page);
  await page.goto(`${APP}/produkt/sofia`);
  const gallery = page.getByRole('region', { name: 'Fotografie: Sofia', exact: true });
  const thumbs = gallery.getByRole('group', { name: 'Náhledy fotografií' });
  await expect(thumbs.getByRole('button')).toHaveCount(4);
  await thumbs.getByRole('button', { name: 'Zobrazit fotografii 3 ze 4' }).click();
  await expect(gallery.getByRole('status')).toHaveText('3 / 4');
  await gallery.getByRole('button', { name: 'Další fotografie', exact: true }).click();
  await expect(gallery.getByRole('status')).toHaveText('4 / 4');
  await gallery.getByRole('button', { name: 'Další fotografie', exact: true }).click();
  await expect(gallery.getByRole('status')).toHaveText('1 / 4');
  await gallery.getByRole('button', { name: 'Předchozí fotografie', exact: true }).click();
  await expect(gallery.getByRole('status')).toHaveText('4 / 4');
  await page.screenshot({ path: `${EVIDENCE}/gallery-${width}.png`, fullPage: false });
  await gallery.getByRole('button', { name: 'Zvětšit fotografii 4: Sofia', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Fotografie: Sofia', exact: true });
  const close = dialog.getByRole('button', { name: 'Zavřít galerii' });
  await expect(close).toBeFocused();
  await expect(page.locator('#root')).toHaveAttribute('inert', '');
  const scroll = await page.evaluate(() => scrollY);
  const box = await dialog.boundingBox();
  if (width < 768) {
    expect(box).toEqual({ x: 0, y: 0, width, height: 1000 });
    const imageBox = await dialog.getByRole('img').boundingBox();
    expect(imageBox).toEqual(box);
    await expect(dialog.getByRole('group', { name: 'Náhledy fotografií' })).toHaveCount(0);
  } else {
    expect(box.x).toBeGreaterThanOrEqual(15); expect(box.y).toBeGreaterThanOrEqual(15);
    expect(box.x + box.width).toBeLessThanOrEqual(width - 15);
    expect(box.y + box.height).toBeLessThanOrEqual(985);
  }
  await expect(dialog.getByRole('img', { name: 'Sofia – pohled 4', exact: true })).toHaveCSS('object-fit', 'contain');
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('status')).toHaveText('1 / 4');
  await dialog.getByRole('button', { name: width < 768 ? 'Další fotografie' : 'Zobrazit fotografii 2 ze 4', exact: true }).click();
  await expect(dialog.getByRole('status')).toHaveText('2 / 4');
  await close.focus(); await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: width < 768 ? 'Další fotografie' : 'Zobrazit fotografii 4 ze 4', exact: true })).toBeFocused();
  await page.keyboard.press('Tab'); await expect(close).toBeFocused();
  await page.screenshot({ path: `${EVIDENCE}/lightbox-${width}.png`, fullPage: false });
  await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0);
  const trigger = gallery.getByRole('button', { name: 'Zvětšit fotografii 2: Sofia', exact: true });
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  await expect(page.locator('#root')).not.toHaveAttribute('inert', '');
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  await trigger.click(); await close.click(); await expect(trigger).toBeFocused();
  await trigger.click();
  if (width < 768) {
    await page.mouse.click(4, 4); await expect(dialog).toBeVisible(); await close.click();
  } else await page.mouse.click(4, 4);
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});

test('horizontal touch swipe changes the photo without opening the viewer; vertical movement stays scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 852 }); await setup(page); await page.goto(`${APP}/produkt/sofia`);
  const gallery = page.getByRole('region', { name: 'Fotografie: Sofia', exact: true });
  const trigger = gallery.getByRole('button', { name: /^Zvětšit fotografii/ });
  await expect(trigger).toHaveCSS('touch-action', 'pan-y pinch-zoom');
  const point = { pointerId: 1, pointerType: 'touch', isPrimary: true };
  await trigger.dispatchEvent('pointerdown', { ...point, clientX: 300, clientY: 300 });
  await trigger.dispatchEvent('pointerup', { ...point, clientX: 120, clientY: 310 });
  await trigger.dispatchEvent('click');
  await expect(gallery.getByRole('status')).toHaveText('2 / 4'); await expect(page.getByRole('dialog')).toHaveCount(0);
  await trigger.dispatchEvent('pointerdown', { ...point, clientX: 200, clientY: 300 });
  await trigger.dispatchEvent('pointerup', { ...point, clientX: 190, clientY: 460 });
  await expect(gallery.getByRole('status')).toHaveText('2 / 4');
  await trigger.click();
  const dialog = page.getByRole('dialog');
  const image = dialog.getByRole('img', { name: 'Sofia – pohled 2', exact: true });
  await image.dispatchEvent('pointerdown', { ...point, clientX: 250, clientY: 300 });
  await image.dispatchEvent('pointerup', { ...point, clientX: 80, clientY: 310 });
  await expect(dialog.getByRole('status')).toHaveText('3 / 4');
});

test('short viewport keeps close and photo navigation visible with a long product name', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 360 });
  await setup(page, { name: 'Dlouhé krémové slavnostní dětské šaty s velkými volány' });
  await page.goto(`${APP}/produkt/sofia`);
  await page.getByRole('button', { name: /^Zvětšit fotografii/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Zavřít galerii' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Další fotografie', exact: true }).click();
  await expect(dialog.getByRole('status')).toHaveText('2 / 4');
  const box = await dialog.boundingBox(); expect(box).toEqual({ x: 0, y: 0, width: 390, height: 360 });
  await expect(dialog.getByRole('group', { name: 'Náhledy fotografií' })).toHaveCount(0);
  await page.screenshot({ path: `${EVIDENCE}/lightbox-short.png` });
});

test('one photo opens a viewer without redundant navigation', async ({ page }) => {
  await setup(page, { count: 1 }); await page.goto(`${APP}/produkt/sofia`);
  await page.getByRole('button', { name: 'Zvětšit fotografii 1: Sofia' }).click();
  const dialog = page.getByRole('dialog'); await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('status')).toHaveText('1 / 1');
  await expect(dialog.getByRole('button', { name: /fotografi[ei]/ })).toHaveCount(0);
  await expect(dialog.getByRole('group')).toHaveCount(0);
});

test('missing and failed photos have a deliberate fallback and remaining photos still work', async ({ page }) => {
  await setup(page, { broken: true }); await page.goto(`${APP}/produkt/sofia`);
  const gallery = page.getByRole('region', { name: 'Fotografie: Sofia', exact: true });
  await expect(gallery.getByText('Fotografie není k dispozici.')).toBeVisible();
  await gallery.getByRole('button', { name: 'Další fotografie', exact: true }).click();
  await expect(gallery.getByRole('img', { name: 'Sofia – pohled 2', exact: true })).toBeVisible();
  await page.unrouteAll(); await setup(page, { count: 0 }); await page.reload();
  await expect(page.getByText('Fotografie není k dispozici.')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Zvětšit fotografii/ })).toHaveCount(0);
});

test('browser Back releases the modal and returning to the product starts with the first photo', async ({ page }) => {
  await setup(page); await page.goto(`${APP}/saty`);
  await page.getByRole('link', { name: 'Prohlédnout Sofia', exact: true }).scrollIntoViewIfNeeded();
  const catalogueScroll = await page.evaluate(() => scrollY);
  await page.getByRole('link', { name: 'Prohlédnout Sofia', exact: true }).click();
  await page.getByRole('button', { name: 'Zobrazit fotografii 3 ze 4' }).click();
  await page.getByRole('button', { name: 'Zvětšit fotografii 3: Sofia' }).click();
  await expect(page.getByRole('dialog')).toBeVisible(); await page.goBack();
  await expect(page).toHaveURL(`${APP}/saty`); await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#root')).not.toHaveAttribute('inert', '');
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(catalogueScroll);
  await page.getByRole('link', { name: 'Prohlédnout Sofia', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Fotografie: Sofia', exact: true }).getByRole('status')).toHaveText('1 / 4');
});

for (const width of [390, 1440]) test(`product share and QR code ${width}`, async ({page}) => {
  await page.setViewportSize({width,height:900});
  await setup(page,{count:1});
  await page.addInitScript(() => {
    Object.defineProperty(navigator,'share',{value:undefined,configurable:true});
    Object.defineProperty(navigator,'clipboard',{value:{writeText:async value => {window.copiedLink=value;}},configurable:true});
  });
  await page.goto(`${APP}/produkt/sofia?tracking=private#test`);
  await page.getByRole('button',{name:'Sdílet produkt',exact:true}).click();
  await expect(page.getByText('Odkaz byl zkopírován.',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>window.copiedLink)).toBe(`${APP}/produkt/sofia`);
  const trigger=page.getByRole('button',{name:'Zobrazit QR kód produktu'});
  await trigger.click();
  const dialog=page.getByRole('dialog',{name:'QR kód produktu'});
  await expect(dialog.getByRole('img',{name:'QR kód: Sofia'})).toHaveAttribute('src',/^data:image\/png;base64,/);
  await expect(dialog.getByLabel('Odkaz na produkt')).toHaveValue(`${APP}/produkt/sofia`);
  await expect(dialog.getByRole('button',{name:'Zavřít',exact:true})).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({path:`test-evidence/product-gallery/share-qr-${width}.png`});
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
  await page.screenshot({path:`test-evidence/product-gallery/share-icons-${width}.png`});
});

test('native sharing cancellation and blocked clipboard fallback',async({page})=>{
  await setup(page,{count:1});
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'share',{value:async data=>{window.sharedData=data;throw new DOMException('Cancelled','AbortError');},configurable:true});
    Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('Denied');}},configurable:true});
  });
  await page.goto(`${APP}/produkt/sofia`);
  const share=page.getByRole('button',{name:'Sdílet produkt',exact:true});await share.click();
  expect(await page.evaluate(()=>window.sharedData)).toEqual({title:'Sofia',url:`${APP}/produkt/sofia`});
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.evaluate(()=>Object.defineProperty(navigator,'share',{value:undefined}));
  await share.click();const dialog=page.getByRole('dialog',{name:'Sdílet produkt'});
  await expect(dialog.getByLabel('Odkaz na produkt')).toHaveValue(`${APP}/produkt/sofia`);
  await expect(dialog.getByRole('status')).toHaveText('Odkaz zkopírujte z pole níže.');
  await dialog.getByLabel('Odkaz na produkt').focus();
  expect(await dialog.getByLabel('Odkaz na produkt').evaluate(el=>el.selectionEnd-el.selectionStart)).toBe(`${APP}/produkt/sofia`.length);
});
