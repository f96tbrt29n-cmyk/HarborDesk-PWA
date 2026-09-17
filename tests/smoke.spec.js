const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function boot(page, runtimeErrors = []) {
  page.on('pageerror', error => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') runtimeErrors.push(`console: ${msg.text()}`);
  });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(3500);
}

async function expectActuallyVisible(page, id) {
  const result = await page.evaluate(targetId => {
    const el = document.getElementById(targetId);
    if (!el) return { exists: false, visible: false, hiddenAncestor: null };
    let node = el;
    while (node) {
      if (node.classList?.contains('hd-ws-hidden')) return { exists: true, visible: false, hiddenAncestor: node.id || node.tagName };
      node = node.parentElement;
    }
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return { exists: true, visible: r.width > 0 && r.height > 0 && style.display !== 'none' && style.visibility !== 'hidden', hiddenAncestor: null };
  }, id);
  expect(result.exists, `missing #${id}`).toBeTruthy();
  expect(result.visible, `#${id} not actually visible; hidden ancestor=${result.hiddenAncestor}`).toBeTruthy();
}

test('HarborDesk boots and all workspace navigation works', async ({ page }) => {
  const runtimeErrors = [];
  await boot(page, runtimeErrors);

  const requiredIds = [
    'home','guide','roster','quests','expeditions','equipmentBook',
    'questDatabase','shipDatabase','sortieLog','backup','diagnosticsCenter',
    'notificationCenter','dataQualityAudit','grandOperations','sortieCostForecast',
    'hdQuickNavButton','hdGlobalSearchDialog'
  ];
  for (const id of requiredIds) await expect(page.locator(`#${id}`), `missing #${id}`).toHaveCount(1);

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

  const expectedGroups = {
    grandOperations: 'guide',
    shipProfilesPlus: 'fleet',
    expeditionOptimizer: 'expedition',
    equipmentVariants: 'arsenal',
    optimizationImprovement: 'arsenal',
    sortieCostForecast: 'records',
    farmingAnalytics: 'records',
    notificationCenter: 'settings',
    dataQualityAudit: 'settings',
    diagnosticsCenter: 'settings'
  };
  const groupMap = await page.evaluate(ids => Object.fromEntries(ids.map(id => [id, document.getElementById(id)?.dataset.hdWorkspaceGroup || null])), Object.keys(expectedGroups));
  expect(groupMap).toEqual(expectedGroups);

  for (const group of ['home','guide','fleet','quest','expedition','arsenal','records','settings']) {
    const tab = page.locator(`[data-hd-ws-group="${group}"]`);
    await tab.click();
    await expect(tab).toHaveClass(/active/);
    const ids = await page.locator('#hdWorkspaceSubtabs [data-hd-ws-section]').evaluateAll(buttons => buttons.map(b => b.dataset.hdWsSection));
    if (!ids.length) {
      const visibleCount = await page.locator(`main section[data-hd-workspace-group="${group}"]:not(.hd-ws-hidden)`).count();
      expect(visibleCount, `no visible section for ${group}`).toBeGreaterThan(0);
    }
    for (const id of ids) {
      await page.locator(`[data-hd-ws-section="${id}"]`).click();
      await expectActuallyVisible(page, id);
    }
  }

  await page.evaluate(() => window.hdWSShowElement?.('home', false));
  await expectActuallyVisible(page, 'home');
  await expectActuallyVisible(page, 'hdCommandCenter');

  await page.evaluate(() => window.hdWSShowElement?.('personalHomeCenter', false));
  await expectActuallyVisible(page, 'personalHomeCenter');
  await expect(page.locator('#hdPersonalHome [data-hd-gs-open]'), 'personal home should expose global search').toHaveCount(1);

  await page.evaluate(() => window.hdWSApply?.('home', 'home'));
  await page.evaluate(() => window.hdGSOpen?.('6-5'));
  await page.locator('[data-hd-gs-cat="map"]').click();
  await expect(page.locator('.hd-gs-result').first()).toBeVisible();
  await page.locator('.hd-gs-result').first().click();
  await expect(page.locator('[data-hd-ws-group="guide"]'), 'map search result should open guide workspace').toHaveClass(/active/);
  await expectActuallyVisible(page, 'guide');

  await page.evaluate(() => window.hdQNJump?.('backup'));
  await expect(page.locator('[data-hd-ws-group="settings"]')).toHaveClass(/active/);
  await expectActuallyVisible(page, 'backup');

  expect(runtimeErrors, `runtime errors: ${runtimeErrors.join('\n')}`).toEqual([]);
});

test('Core CRUD and cross-feature buttons work', async ({ page }) => {
  const runtimeErrors = [];
  await boot(page, runtimeErrors);

  await page.evaluate(() => window.hdWSShowElement?.('expeditions', false));
  await page.locator('#addExpedition').click();
  await page.locator('#timerName').fill('CI遠征');
  await page.locator('#timerMinutes').fill('15');
  await page.locator('#timerSave').click();
  await expect(page.locator('#expeditionList')).toContainText('CI遠征');

  await page.evaluate(() => window.hdWSShowElement?.('docks', false));
  await page.locator('#addDock').click();
  await page.locator('#timerName').fill('CI入渠');
  await page.locator('#timerMinutes').fill('5');
  await page.locator('#timerSave').click();
  await expect(page.locator('#dockList')).toContainText('CI入渠');

  await page.evaluate(() => window.hdWSShowElement?.('quests', false));
  await page.locator('#addQuest').click();
  await page.locator('#questName').fill('CI任務');
  await page.locator('#questDialog button[value="default"]').click();
  await expect(page.locator('#questList')).toContainText('CI任務');

  await page.evaluate(() => window.hdWSShowElement?.('resources', false));
  await page.locator('#fuel').fill('12345');
  await page.locator('#ammo').fill('23456');
  await page.locator('#steel').fill('34567');
  await page.locator('#bauxite').fill('45678');
  await page.locator('#saveResources').click();
  const resources = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-pwa-v1')).resources);
  expect(resources.fuel).toBe('12345');
  expect(resources.bauxite).toBe('45678');

  await page.evaluate(() => window.hdWSShowElement?.('roster', false));
  await page.locator('#addShipRoster').click();
  await page.locator('#rosterName').fill('CIテスト艦');
  await page.locator('#rosterLevel').fill('99');
  await page.locator('#shipRosterDialog button[value="default"]').click();
  await expect(page.locator('#shipRosterList')).toContainText('CIテスト艦');
  const roster = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')));
  expect(roster.some(x => x.name === 'CIテスト艦' && String(x.level) === '99')).toBeTruthy();

  await page.evaluate(() => window.hdWSShowElement?.('equipmentBook', false));
  await page.locator('#addEquipment').click();
  await page.locator('#equipmentName').fill('CIテスト装備');
  await page.locator('#equipmentCategory').fill('テスト');
  await page.locator('#equipmentCount').fill('3');
  await page.locator('#equipmentDialog button[value="default"]').click();
  await expect(page.locator('#equipmentList')).toContainText('CIテスト装備');
  const equipment = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-equipment-v1')));
  expect(equipment.some(x => x.name === 'CIテスト装備' && Number(x.count) === 3)).toBeTruthy();

  await page.evaluate(() => window.hdCCJump?.('questDatabase'));
  await expect(page.locator('[data-hd-ws-group="quest"]')).toHaveClass(/active/);
  await expectActuallyVisible(page, 'questDatabase');

  await page.evaluate(() => window.hdWSShowElement?.('grandOperations', false));
  await page.locator('[data-go-new]').click();
  await page.locator('[data-go-support]').click();
  await expect(page.locator('[data-hd-ws-group="fleet"]')).toHaveClass(/active/);
  await expectActuallyVisible(page, 'supportFleetPlanner');

  await page.evaluate(() => window.hdWSShowElement?.('grandOperations', false));
  await page.locator('[data-go-base]').click();
  await expect(page.locator('[data-hd-ws-group="guide"]')).toHaveClass(/active/);
  await expectActuallyVisible(page, 'landBasePlanner');

  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-pwa-v1')));
  expect(state.expeditions.some(x => x.name === 'CI遠征')).toBeTruthy();
  expect(state.docks.some(x => x.name === 'CI入渠')).toBeTruthy();
  expect(state.quests.some(x => x.name === 'CI任務')).toBeTruthy();

  expect(runtimeErrors, `runtime errors: ${runtimeErrors.join('\n')}`).toEqual([]);
});
