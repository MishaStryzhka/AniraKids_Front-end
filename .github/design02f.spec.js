const { test, expect } = require('@playwright/test');

const widths = [375, 390, 430, 768, 1024, 1440];

for (const width of widths) {
  test(`navigation contract at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4173/');
    const header = page.locator('[data-storefront-header]');
    await expect(header).toBeVisible();

    const size = await header.boundingBox();
    expect(size).not.toBeNull();
    expect(Math.abs(size.height - (width < 1024 ? 60 : 72))).toBeLessThan(2);

    const overflow = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(overflow.viewport + 1);
    expect(overflow.body).toBeLessThanOrEqual(overflow.viewport + 1);

    if (width < 1024) {
      await expect(page.locator('[data-menu-trigger]')).toBeVisible();
      await expect(page.locator('[data-search-trigger]:visible')).toBeVisible();
      await expect(page.locator('a[aria-label^="Rezervace"]:visible')).toBeVisible();
      await expect(page.locator('[data-desktop-utilities]')).toBeHidden();
      const logoBox = await page.locator('[data-brand-logo]:visible').boundingBox();
      expect(logoBox).not.toBeNull();
      expect(Math.abs((logoBox.x + logoBox.width / 2) - width / 2)).toBeLessThan(2);
    } else {
      await expect(page.locator('[data-menu-trigger]')).toBeHidden();
      await expect(page.locator('[data-desktop-utilities]')).toBeVisible();
      for (const label of ['Dívčí šaty', 'Chlapecké obleky', 'Novinky', 'Pronájem']) {
        await expect(page.locator('nav[aria-label="Hlavní navigace"]').getByRole('link', { name: label, exact: true })).toBeVisible();
      }
    }
  });
}

test('mobile menu retains header, traps focus and restores scroll/focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('[data-storefront-header]').waitFor();
  await page.evaluate(() => {
    const spacer = document.createElement('div');
    spacer.style.height = '2400px';
    document.querySelector('main').appendChild(spacer);
    window.scrollTo(0, 600);
  });
  await page.waitForTimeout(50);
  const before = await page.evaluate(() => window.scrollY);

  const trigger = page.locator('[data-menu-trigger]');
  await trigger.focus();
  await trigger.click();

  const menu = page.locator('#mobile-menu');
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  expect(Math.abs(box.y - 60)).toBeLessThan(2);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  expect(await page.evaluate(() => document.querySelector('main').hasAttribute('inert'))).toBe(true);
  expect(await page.evaluate(() => document.querySelector('[data-brand-logo]').closest('[inert]') !== null)).toBe(true);
  expect(await page.evaluate(() => document.querySelector('a[aria-label^="Rezervace"]').closest('[inert]') !== null)).toBe(true);

  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() =>
    document.activeElement.closest('#mobile-menu') !== null ||
    document.activeElement.hasAttribute('data-menu-trigger')
  )).toBe(true);

  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  const after = await page.evaluate(() => window.scrollY);
  expect(Math.abs(after - before)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.querySelector('main').hasAttribute('inert'))).toBe(false);
});

test('mobile search is full-screen, focused and restores trigger', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('http://127.0.0.1:4173/');
  const trigger = page.locator('[data-search-trigger]').first();
  await trigger.focus();
  await trigger.click();

  const shell = page.locator('section[aria-label="Vyhledávání"]');
  await expect(shell).toBeVisible();
  const box = await shell.boundingBox();
  expect(Math.abs(box.y)).toBeLessThan(1);
  expect(Math.abs(box.height - 900)).toBeLessThan(2);

  await expect(page.getByRole('searchbox', { name: 'Hledat' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Zavřít vyhledávání', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.querySelector('main').hasAttribute('inert'))).toBe(true);

  await page.keyboard.press('Escape');
  await expect(shell).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('search survives tablet to desktop transition', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('[data-search-trigger]').first().click();
  const input = page.getByRole('searchbox', { name: 'Hledat' });
  await input.fill('Amelia');

  await page.setViewportSize({ width: 1024, height: 900 });
  const moved = page.getByRole('searchbox', { name: 'Hledat' });
  await expect(moved).toHaveValue('Amelia');
  await expect(moved).toBeFocused();
});

test('open mobile menu closes cleanly when crossing 768 to desktop', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('[data-menu-trigger]').click();
  await expect(page.locator('#mobile-menu')).toBeVisible();

  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(page.locator('#mobile-menu')).toHaveCount(0);
  expect(await page.evaluate(() => document.querySelector('main').hasAttribute('inert'))).toBe(false);
  expect(await page.evaluate(() => getComputedStyle(document.body).position)).not.toBe('fixed');
  await expect(page.locator('[data-brand-logo]:visible')).toBeFocused();
});

test('open mobile menu closes cleanly when crossing 390 to desktop', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('[data-menu-trigger]').click();
  await expect(page.locator('#mobile-menu')).toBeVisible();

  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(page.locator('#mobile-menu')).toHaveCount(0);
  expect(await page.evaluate(() => document.querySelector('main').hasAttribute('inert'))).toBe(false);
  expect(await page.evaluate(() => getComputedStyle(document.body).position)).not.toBe('fixed');
  await expect(page.locator('[data-brand-logo]:visible')).toBeFocused();
});

test('desktop search and canonical route current state', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('http://127.0.0.1:4173/saty');

  const primaryNav = page.locator('nav[aria-label="Hlavní navigace"]');
  const dresses = primaryNav.getByRole('link', { name: 'Dívčí šaty', exact: true });
  await expect(dresses).toHaveAttribute('aria-current', 'page');

  expect(await page.locator('[data-search-trigger]').first().evaluate(el => el.tagName)).toBe('BUTTON');
  expect(await page.locator('[data-desktop-utilities]').getByRole('link', { name: 'Oblíbené' }).evaluate(el => el.tagName)).toBe('A');
  expect(await page.locator('[data-desktop-utilities]').getByRole('link', { name: 'Rezervace' }).evaluate(el => el.tagName)).toBe('A');

  const searchTrigger = page.locator('[data-search-trigger]:visible');
  await searchTrigger.focus();
  await searchTrigger.click();

  const layer = page.locator('section[aria-label="Vyhledávání"]');
  await expect(layer).toBeVisible();
  const box = await layer.boundingBox();
  expect(Math.abs(box.y - 72)).toBeLessThan(2);
  await expect(page.getByRole('searchbox', { name: 'Hledat' })).toBeFocused();
  expect(await page.evaluate(() => document.querySelector('main').hasAttribute('inert'))).toBe(true);
  expect(await page.evaluate(() => document.querySelector('[data-desktop-utilities]').closest('[inert]') !== null)).toBe(true);

  await page.keyboard.press('Escape');
  await expect(layer).toHaveCount(0);
  await expect(searchTrigger).toBeFocused();

  await primaryNav.getByRole('link', { name: 'Pronájem', exact: true }).click();
  await expect(primaryNav.getByRole('link', { name: 'Pronájem', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.goBack();
  await expect(dresses).toHaveAttribute('aria-current', 'page');

  await page.goto('http://127.0.0.1:4173/produkt/test');
  await expect(page.locator('[data-storefront-header]')).toBeVisible();
  await expect(page.locator('nav[aria-label="Hlavní navigace"] [aria-current="page"]')).toHaveCount(0);

  await page.goto('http://127.0.0.1:4173/pronajem#jak-funguje-pronajem');
  await expect(primaryNav.getByRole('link', { name: 'Pronájem', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('route change while mobile menu is open releases inert and scroll lock', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('[data-menu-trigger]').click();
  await expect(page.locator('#mobile-menu')).toBeVisible();

  await page.locator('#mobile-menu').getByRole('link', { name: 'Dívčí šaty', exact: true }).click();
  await expect(page).toHaveURL(/\/saty$/);
  await expect(page.locator('#mobile-menu')).toHaveCount(0);
  expect(await page.evaluate(() => document.querySelector('main').hasAttribute('inert'))).toBe(false);
  expect(await page.evaluate(() => getComputedStyle(document.body).position)).not.toBe('fixed');
});

test('reduced motion collapses navigation transitions', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1024, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  const duration = await page.locator('[data-search-trigger]').first().evaluate(el => getComputedStyle(el).transitionDuration);
  const values = duration.split(',').map(value => {
    const v = value.trim();
    if (v.endsWith('ms')) return parseFloat(v) / 1000;
    if (v.endsWith('s')) return parseFloat(v);
    return 0;
  });
  expect(values.every(value => value <= 0.001)).toBe(true);
  await context.close();
});


test('reservation route owns focused layout and not storefront layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('http://127.0.0.1:4173/rezervace');

  await expect(page.locator('[data-focused-reservation-header]')).toBeVisible();
  await expect(page.locator('[data-storefront-header]')).toHaveCount(0);

  await expect(page.getByRole('button', { name: 'Zpět' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Ukončit rezervaci' })).toBeDisabled();

  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(page.locator('[data-focused-reservation-header]')).toBeVisible();
  await expect(page.locator('[data-storefront-header]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Zpět', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Ukončit', exact: true })).toBeDisabled();
});
