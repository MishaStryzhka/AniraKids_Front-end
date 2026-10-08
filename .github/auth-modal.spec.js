const { test, expect } = require('@playwright/test');
const fs = require('fs');
const evidence = 'test-evidence/payments';
fs.mkdirSync(evidence, { recursive: true });
async function openAuth(page, width) {
  await page.goto('http://127.0.0.1:4173/');
  if (width < 1024) await page.locator('[data-menu-trigger]').click();
  await page.getByRole('button', { name: 'Přihlásit se', exact: true }).click();
  return page.getByRole('dialog', { name: 'Registrace a přihlášení' });
}
for (const width of [390, 768, 1440]) {
  test(`auth fits viewport, preserves draft on backdrop, closes explicitly at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    const modal = await openAuth(page, width);
    const email = modal.locator('input[name="email"]');
    await email.fill('fixture@example.test');
    await page.mouse.click(3, 3);
    await expect(modal).toBeVisible();
    await expect(email).toHaveValue('fixture@example.test');
    const bounds = await modal.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(15);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 15);
    const close = modal.getByRole('button', { name: 'Zavřít' });
    const button = await close.boundingBox();
    expect(button.width).toBeGreaterThanOrEqual(44);
    expect(button.x + button.width).toBeLessThanOrEqual(width);
    expect(
      await modal.evaluate(el => el.scrollWidth <= el.clientWidth + 1)
    ).toBe(true);
    expect(await email.evaluate(el => getComputedStyle(el).fontSize)).toBe(
      '16px'
    );
    await modal.getByRole('button', { name: 'Autorizace' }).click();
    await expect
      .poll(() => page.evaluate(() => document.body.style.overflowY))
      .toBe('hidden');
    await page.screenshot({
      path: `${evidence}/auth-${width}.png`,
      fullPage: true,
    });
    await close.click();
    await expect(modal).toBeHidden();
    await expect
      .poll(() => page.evaluate(() => document.body.style.overflowY))
      .not.toBe('hidden');
  });
}
test('successful login unmount restores scrolling without reload; Escape closes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.route('**/api/users/login', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'fixture-only',
        user: {
          _id: 'fixture',
          email: 'fixture@example.test',
          firstName: 'Test',
          role: 'user',
          favorites: [],
          pickupAddresses: [],
        },
      }),
    })
  );
  let modal = await openAuth(page, 390);
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
  await page.locator('[data-menu-trigger]').click();
  await page.getByRole('button', { name: 'Přihlásit se', exact: true }).click();
  modal = page.getByRole('dialog', { name: 'Registrace a přihlášení' });
  await modal.getByRole('button', { name: 'Autorizace' }).click();
  await modal.locator('input[name="login"]').fill('fixture@example.test');
  await modal.locator('input[name="password"]').fill('FixtureOnly123!');
  await modal
    .getByRole('button', { name: 'Přihlásit se', exact: true })
    .click();
  await expect(modal).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflowY))
    .not.toBe('hidden');
  await page.evaluate(() => {
    const spacer = document.createElement('div');
    spacer.style.height = '2400px';
    document.body.appendChild(spacer);
    window.scrollTo(0, 0);
  });
  await page.mouse.move(200, 500);
  await page.mouse.wheel(0, 600);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(100);
});
