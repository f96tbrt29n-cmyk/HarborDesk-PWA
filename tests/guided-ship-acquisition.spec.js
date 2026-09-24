const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });

async function openApp(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof homeGuideRender === 'function' && typeof hdShipDbAcquisitionRows === 'function' && typeof hdDropAllTargets === 'function' && typeof HD_CONSTRUCTION_RECIPES !== 'undefined', null, { timeout: 30000 });
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, { timeout: 30000 });
}

test('guide: steps open the right screen and survive a reload', async ({ page }) => {
  await openApp(page);
  const steps = page.locator('#homeGuideSteps .home-guide-step');
  await expect(steps).toHaveCount(7);
  await expect(page.locator('#homeGuideCount')).toHaveText('0/7 完了');
  await steps.first().locator('[data-home-guide-toggle]').click();
  await expect(page.locator('#homeGuideCount')).toHaveText('1/7 完了');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, { timeout: 30000 });
  await expect(page.locator('#homeGuideCount')).toHaveText('1/7 完了');
  await steps.first().locator('[data-home-guide-toggle]').click();
  await expect(page.locator('#homeGuideCount')).toHaveText('0/7 完了');
  await steps.first().locator('[data-home-jump="kancolleImport"]').click();
  await expect(page.locator('#kancolleImport')).toBeVisible();
});

test('guide: completed map advances to the next map and restarts per-map steps', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { hdSelectGuideMap('2-4'); homeGuideRender(); });
  await expect(page.locator('.home-guide-map')).toContainText('2-4');
  await expect(page.locator('#homeGuideSteps .home-guide-step').nth(4)).toContainText('任務');
  for(const button of await page.locator('[data-home-guide-toggle]').all()) await button.dispatchEvent('click');
  await expect(page.locator('#homeGuideCount')).toHaveText('7/7 完了');
  await expect(page.locator('[data-home-guide-restart]')).toContainText('2-5');
  await page.locator('[data-home-guide-restart]').click();
  await expect(page.locator('#homeGuideCount')).toHaveText('2/7 完了');
  await expect(page.locator('.home-guide-map')).toContainText('2-5');
  await expect(page.locator('#homeGuideSteps .home-guide-step.current')).toContainText('海域');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, { timeout: 30000 });
  await expect(page.locator('#homeGuideCount')).toHaveText('2/7 完了');
  await expect(page.locator('.home-guide-map')).toContainText('2-5');
});

test('guide: next-map progression crosses world boundaries', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => {
    hdSelectGuideMap('1-6');
    localStorage.setItem('harbordesk-guide-steps-v1', JSON.stringify(['sync','fleet','map','gear','quests','sortie','expeditions']));
    homeGuideRender();
  });
  await expect(page.locator('[data-home-guide-restart]')).toContainText('2-1');
  await page.locator('[data-home-guide-restart]').click();
  await expect(page.locator('.home-guide-map')).toContainText('2-1');
  await expect(page.locator('#worldPicker .world-chip.active')).toHaveAttribute('data-world','2');
  await expect(page.locator('#mapPicker .map-button.active')).toHaveAttribute('data-map','2-1');
});

test('ship database: acquisition shows sourced drops and exact construction recipes', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible();
  await page.locator('[data-hd-ws-group="fleet"]').click();
  await page.evaluate(() => { hdEnsureShipDatabase(); window.hdWSShowElement?.('shipDatabase', true); hdRenderShipDatabase(); });
  await expect(page.locator('#shipDatabase')).toBeVisible();
  await page.locator('[data-hd-shipdb-compact]').click();
  await expect(page.locator('#hdShipDbList')).not.toHaveClass(/hd-compact/);
  const search = page.locator('#hdShipDbSearch');
  await search.fill('明石');
  await page.waitForTimeout(180);
  await expect(page.locator('#hdShipDbList .hd-shipdb-head strong').first()).toContainText('明石');
  const drops = page.locator('#hdShipDbList .hd-shipdb-acquisition').first();
  await expect(drops).toBeVisible();
  await drops.evaluate(el => { el.open = true; });
  await expect(drops).toHaveJSProperty('open', true);
  await expect(drops).toContainText('1-5');
  await expect(drops).toContainText('ドロップ海域');
  const dropButton=drops.locator('[data-hd-shipdb-acquire-drop]');
  await expect(dropButton).toBeVisible();
  await dropButton.click();
  await expect(page.locator('#hdDropSearch')).toHaveValue('明石');
  await page.evaluate(() => window.hdWSShowElement?.('shipDatabase', false));
  await expect(page.locator('#shipDatabase')).toBeVisible();
  await search.fill('大和');
  await page.waitForTimeout(180);
  await expect(page.locator('#hdShipDbList .hd-shipdb-head strong').first()).toContainText('大和');
  const build = page.locator('#hdShipDbList .hd-shipdb-acquisition').first();
  await expect(build).toBeVisible();
  await build.evaluate(el => { el.open = true; });
  await expect(build).toHaveJSProperty('open', true);
  await expect(build).toContainText('大型・大和型');
  const buildButton=build.locator('[data-hd-shipdb-acquire-build]');
  await expect(buildButton).toBeVisible();
  await buildButton.click();
  await expect(page.locator('#hdConstructionSearch')).toHaveValue('大和');
  await page.evaluate(() => window.hdWSShowElement?.('shipDatabase', true));
  await search.fill('1-5');
  await expect(page.locator('#hdShipDbList .hd-shipdb-head strong').filter({ hasText: '明石' }).first()).toContainText('明石');
  await search.fill('大和型・大型戦艦');
  await expect(page.locator('#hdShipDbList .hd-shipdb-head strong').filter({ hasText: '大和' }).first()).toContainText('大和');
  const rows = await page.evaluate(() => ({ known: hdShipDbAcquisitionRows('明石').drop?.ship, unknown: hdShipDbAcquisitionRows('未収録艦名').drop, hasBuild: hdShipDbAcquisitionRows('大和').recipes.length > 0 }));
  expect(rows).toEqual({ known: '明石', unknown: null, hasBuild: true });
});
