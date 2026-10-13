const { test, expect } = require('@playwright/test');
const fs = require('fs');
const APP = 'http://127.0.0.1:4173';
const evidence = 'test-evidence/avatar-editor';
fs.mkdirSync(evidence, { recursive: true });

async function setup(page) {
  const state = { requests: [], errors: [], fail: false, hold: false, release: null, user: {
    _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', firstName: 'Jana', lastName: 'Nováková',
    email: 'jana@example.test', emailVerified: true, nickname: '@jana', primaryPhoneNumber: '+420777123456',
  } };
  page.on('pageerror', error => state.errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('persist:auth', JSON.stringify({ token: JSON.stringify('avatar-fixture-session') }));
  });
  await page.route('https://example.test/**', async route => {
    const request = route.request(), pathname = new URL(request.url()).pathname;
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (pathname === '/api/users/current') return json({ user: state.user });
    if (pathname === '/api/users/favorites/storefront') return json({ favorites: [] });
    if (pathname === '/api/users/current/update' && request.method() === 'PATCH') {
      const fields = await new Response(request.postDataBuffer(), { headers: { 'Content-Type': request.headers()['content-type'] } }).formData();
      state.requests.push([...fields.keys()]);
      if (state.hold) await new Promise(resolve => { state.release = resolve; });
      if (state.fail) return json({ message: 'Upload failed' }, 500);
      const file = fields.get('avatar');
      expect(file.type).toBe('image/jpeg');
      expect(file.name).toBe('avatar.jpg');
      state.user.avatar = 'data:image/jpeg;base64,' + Buffer.from(await file.arrayBuffer()).toString('base64');
      return json({ user: state.user });
    }
    return json({});
  });
  await page.route('http://admin-api.test/**', route => route.fulfill({ contentType: 'application/json', body: '{"items":[],"total":0}' }));
  await page.goto(APP + '/ucet');
  await expect(page.locator('#firstName')).toHaveValue('Jana');
  return state;
}
async function chooseImage(page, width = 1600, height = 600) {
  const data = await page.evaluate(({ width, height }) => {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#eadfd4'; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#7a6254'; ctx.fillRect(width / 3, 0, width / 3, height);
    return canvas.toDataURL('image/png').split(',')[1];
  }, { width, height });
  await page.locator('#avatarUrl').setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: Buffer.from(data, 'base64') });
  await expect(page.getByRole('button', { name: 'Uložit', exact: true })).toBeEnabled();
}

for (const width of [320, 390, 430, 768, 1024, 1440]) {
  test('landscape and portrait crops stay inside dialog at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const state = await setup(page);
    for (const [w, h] of [[1800, 500], [500, 1800]]) {
      await chooseImage(page, w, h);
      const dialog = page.getByRole('dialog');
      const box = await dialog.boundingBox();
      const preview = await page.getByLabel('Náhled profilové fotografie').boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(15);
      expect(box.x + box.width).toBeLessThanOrEqual(width - 15);
      expect(preview.x).toBeGreaterThanOrEqual(box.x);
      expect(preview.x + preview.width).toBeLessThanOrEqual(box.x + box.width);
      expect(await dialog.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
      await expect(page.locator('.reactEasyCrop_CropAreaRound')).toBeVisible();
      await page.getByRole('slider', { name: 'Přiblížení' }).fill('1.8');
      await expect(page.getByRole('slider')).toHaveValue('1.8');
      for (const name of ['Uložit', 'Zrušit']) expect((await page.getByRole('button', { name, exact: true }).boundingBox()).height).toBeGreaterThanOrEqual(44);
      if (w > h && [390, 1440].includes(width)) await page.screenshot({ path: evidence + '/landscape-' + width + '.png' });
      await page.getByRole('button', { name: 'Zrušit' }).click();
      await expect(dialog).toHaveCount(0);
    }
    expect(state.requests).toEqual([]);
    expect(state.errors).toEqual([]);
  });
}

test('Uložit uploads only the avatar, waits for the server, preserves draft fields and survives reload', async ({ page }) => {
  const state = await setup(page);
  await page.locator('#firstName').fill('Rozpracováno');
  await chooseImage(page);
  state.hold = true;
  await page.getByRole('button', { name: 'Uložit', exact: true }).click();
  await expect.poll(() => state.requests.length).toBe(1);
  expect(state.requests[0]).toEqual(['avatar']);
  await expect(page.getByRole('button', { name: 'Ukládání…' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Zrušit' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeVisible();
  state.release();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText('Profilová fotografie byla uložena.');
  await expect(page.locator('#firstName')).toHaveValue('Rozpracováno');
  await expect(page.getByRole('button', { name: 'Uložit změny' })).toBeEnabled();
  await expect(page.getByRole('img', { name: 'avatar', exact: true })).toHaveAttribute('src', state.user.avatar);
  const dimensions = await page.getByRole('img', { name: 'avatar', exact: true }).evaluate(image => [image.naturalWidth, image.naturalHeight]);
  expect(dimensions[0]).toBe(dimensions[1]); expect(dimensions[0]).toBeGreaterThan(0); expect(dimensions[0]).toBeLessThanOrEqual(1024);
  await page.reload();
  await expect(page.getByRole('img', { name: 'avatar', exact: true })).toHaveAttribute('src', state.user.avatar);
  await expect(page.locator('#firstName')).toHaveValue('Jana');
  await expect(page.getByRole('button', { name: 'Uložit změny' })).toBeDisabled();
  expect(state.errors).toEqual([]);
});

test('failed upload retains crop for retry and an avatar-only save leaves the profile clean', async ({ page }) => {
  const state = await setup(page);
  await chooseImage(page);
  await page.getByRole('slider').fill('2');
  state.fail = true;
  await page.getByRole('button', { name: 'Uložit', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Fotografii se nepodařilo uložit. Zkuste to prosím znovu.');
  await expect(page.getByRole('slider')).toHaveValue('2');
  await expect(page.getByRole('button', { name: 'Uložit', exact: true })).toBeEnabled();
  state.fail = false;
  await page.getByRole('button', { name: 'Uložit', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Uložit změny' })).toBeDisabled();
  expect(state.requests).toEqual([['avatar'], ['avatar']]);
  expect(state.errors).toEqual([]);
});
