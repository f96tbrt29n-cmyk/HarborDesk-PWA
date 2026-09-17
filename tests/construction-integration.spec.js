const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test('construction timer immediately updates command center and navigation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(3000);

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-construction-timers-v1', '[]');
    hdStartConstructionTimer(1, 'CI');
  });

  const timers = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-construction-timers-v1') || '[]'));
  expect(timers.some(x => x.name === '建造 CI')).toBeTruthy();

  await page.evaluate(() => hdWSShowElement?.('home', false));
  await expect(page.locator('#hdCommandCenter')).toContainText('建造 CI');

  const homeBadge = await page.locator('[data-hd-ws-group="home"] [data-hd-ws-badge]').textContent();
  expect(Number(homeBadge)).toBeGreaterThan(0);

  await page.evaluate(() => hdCCJump?.('constructionDb'));
  await expect(page.locator('[data-hd-ws-group="arsenal"]')).toHaveClass(/active/);
  await expect(page.locator('#constructionDb')).not.toHaveClass(/hd-ws-hidden/);
  await expect(page.locator('#constructionDb')).toBeVisible();

  await page.evaluate(() => {
    hdSaveConstructionTimers([]);
    renderConstructionTimers();
    hdConstructionNotify();
  });
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-construction-timers-v1') || '[]'));
  expect(after).toEqual([]);
  expect(errors).toEqual([]);
});
