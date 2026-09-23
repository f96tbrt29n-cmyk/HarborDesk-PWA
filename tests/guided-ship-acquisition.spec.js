const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });

async function openApp(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof homeGuideRender === 'function' && typeof hdShipDbAcquisitionRows === 'function' && typeof hdDropAllTargets === 'function' && typeof HD_CONSTRUCTION_RECIPES !== 'undefined', null, { timeout: 30000 });
}

test('guide: steps open the right screen and survive a reload', async ({ page }) => {
  await openApp(page);
  const steps = page.locator('#homeGuideSteps .home-guide-step');
  await expect(steps).toHaveCount(7);
  await expect(page.locator('#homeGuideCount')).toHaveText('0/7 完了');
  await steps.first().locator('[data-home-guide-toggle]').click();
  await expect(page.locator('#homeGuideCount')).toHaveText('1/7 完了');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#homeGuideCount')).toHaveText('1/7 完了');
  await steps.first().locator('[data-home-guide-toggle]').click();
  await expect(page.locator('#homeGuideCount')).toHaveText('0/7 完了');
  await steps.first().locator('[data-home-jump="kancolleImport"]').click();
  await expect(page.locator('#kancolleImport')).toBeVisible();
});

test('ship database: acquisition shows sourced drops and exact construction recipes', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { hdEnsureShipDatabase(); hdRenderShipDatabase(); });
  const search = page.locator('#hdShipDbSearch');
  await search.fill('明石');
  const drops = page.locator('#hdShipDbList .hd-shipdb-acquisition').first();
  await expect(drops).toBeVisible();
  await drops.locator('summary').click();
  await expect(drops).toContainText('1-5');
  await expect(drops).toContainText('ドロップ海域');
  await drops.locator('[data-hd-shipdb-acquire-drop]').click();
  await expect(page.locator('#hdDropSearch')).toHaveValue('明石');
  await page.evaluate(() => window.hdWSShowElement?.('shipDatabase', true));
  await search.fill('大和');
  const build = page.locator('#hdShipDbList .hd-shipdb-acquisition').first();
  await build.locator('summary').click();
  await expect(build).toContainText('大型・大和型');
  await build.locator('[data-hd-shipdb-acquire-build]').click();
  await expect(page.locator('#hdConstructionSearch')).toHaveValue('大和');
  const rows = await page.evaluate(() => ({ known: hdShipDbAcquisitionRows('明石').drop?.ship, unknown: hdShipDbAcquisitionRows('未収録艦名').drop, hasBuild: hdShipDbAcquisitionRows('大和').recipes.length > 0 }));
  expect(rows).toEqual({ known: '明石', unknown: null, hasBuild: true });
});
