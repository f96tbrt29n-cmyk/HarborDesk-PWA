const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

test('HarborDesk boots and major navigation works', async ({ page }) => {
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') runtimeErrors.push(`console: ${msg.text()}`);
  });

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(3000);

  const requiredIds = [
    'home','guide','roster','quests','expeditions','equipmentBook',
    'questDatabase','shipDatabase','sortieLog','backup','diagnosticsCenter',
    'hdQuickNavButton','hdGlobalSearchDialog'
  ];
  for (const id of requiredIds) {
    await expect(page.locator(`#${id}`), `missing #${id}`).toHaveCount(1);
  }

  const moduleState = await page.evaluate(() => ({ ...(window.HD_MODULE_STATUS || {}) }));
  const failedModules = Object.entries(moduleState).filter(([, state]) => state === 'error' || state === 'loading');
  expect(failedModules, `module failures: ${JSON.stringify(failedModules)}`).toEqual([]);

  const duplicateIds = await page.evaluate(() => {
    const counts = new Map();
    document.querySelectorAll('[id]').forEach(el => counts.set(el.id, (counts.get(el.id) || 0) + 1));
    return [...counts.entries()].filter(([, count]) => count > 1);
  });
  expect(duplicateIds, `duplicate ids: ${JSON.stringify(duplicateIds)}`).toEqual([]);

  const missingAnchors = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')]
    .map(a => a.getAttribute('href'))
    .filter(href => href && href !== '#' && !document.getElementById(decodeURIComponent(href.slice(1)))));
  expect([...new Set(missingAnchors)], `broken internal links: ${JSON.stringify(missingAnchors)}`).toEqual([]);

  for (const group of ['home','guide','fleet','quest','expedition','arsenal','records','settings']) {
    const tab = page.locator(`[data-hd-ws-group="${group}"]`);
    await tab.click();
    await expect(tab).toHaveClass(/active/);
    const visibleCount = await page.locator(`main section[data-hd-workspace-group="${group}"]:not(.hd-ws-hidden)`).count();
    expect(visibleCount, `no visible section for ${group}`).toBeGreaterThan(0);
  }

  await page.evaluate(() => window.hdWSShowElement?.('personalHomeCenter', false));
  await expect(page.locator('#personalHomeCenter')).not.toHaveClass(/hd-ws-hidden/);
  await expect(page.locator('#hdPersonalHome [data-hd-gs-open]'), 'personal home should expose global search').toHaveCount(1);

  await page.evaluate(() => window.hdWSApply?.('home', 'home'));
  await page.evaluate(() => window.hdGSOpen?.('6-5'));
  await page.locator('[data-hd-gs-cat="map"]').click();
  await expect(page.locator('.hd-gs-result').first()).toBeVisible();
  await page.locator('.hd-gs-result').first().click();
  await expect(page.locator('[data-hd-ws-group="guide"]'), 'map search result should open guide workspace').toHaveClass(/active/);
  await expect(page.locator('#guide')).not.toHaveClass(/hd-ws-hidden/);

  await page.evaluate(() => window.hdQNJump?.('backup'));
  await expect(page.locator('[data-hd-ws-group="settings"]')).toHaveClass(/active/);
  await expect(page.locator('#backup')).not.toHaveClass(/hd-ws-hidden/);

  expect(runtimeErrors, `runtime errors: ${runtimeErrors.join('\n')}`).toEqual([]);
});
