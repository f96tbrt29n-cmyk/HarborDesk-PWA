const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

async function boot(page, errors = []) {
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(3500);
}

test('planning and tracking modules persist changes and rerender', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const result = await page.evaluate(async () => {
    window.alert = () => {};
    window.confirm = () => true;

    hdDropSave([]);
    hdAddDropTarget('CI掘り艦', '1-1', 'B');
    hdRenderDropHunts();
    const hunt = hdDropHunts()[0];

    const materialId = HD_MATERIALS[0]?.id;
    if (!materialId) throw new Error('material database empty');
    hdMatSetStock(materialId, 7);
    const materialStock = hdMatLoadStock();

    const eoMap = HD_EO_MAPS[0], eoStage = eoMap?.stages?.[0];
    if (!eoMap || !eoStage) throw new Error('EO database empty');
    const eoBefore = hdEOStageValue(eoMap, eoStage, hdEOLoad());
    hdEOSetStage(eoMap.id, eoStage.id, 1);
    const eoAfter = hdEOStageValue(eoMap, eoStage, hdEOLoad());

    const roster = JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1') || '[]');
    roster.push({ id:'ci-training-ship', name:'CI育成艦', level:10, remodel:'', memo:'' });
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify(roster));
    hdTrainingUpdate('ci-training-ship', { active:true, target:20, priority:3, runs:0, exercises:0 });
    hdRenderTrainingPlanner();
    const training = hdTrainingLoad()['ci-training-ship'];

    const exp = HD_EXPEDITIONS[0];
    if (!exp) throw new Error('expedition database empty');
    hdEFSaveSlot(2, exp.id);
    const slot = hdEFSlots()[2];

    const daily = hdDOState();
    daily.quests = true;
    hdDOSaveState(daily);
    hdDORender();

    const snapshotOk = await hdPHCreateSnapshot('CI監査');
    const snapshots = await hdPHGetSnapshots();

    const diagnostics = await hdDXCollect();

    return {
      hunt: { ship:hunt?.ship, map:hunt?.map, node:hunt?.node },
      material: materialStock[materialId],
      eoBefore, eoAfter,
      training,
      slot: slot?.expeditionId,
      expeditionId: exp.id,
      daily: hdDOState().quests,
      snapshotOk,
      snapshotCount: snapshots.length,
      diagnosticInvalid: diagnostics.local.invalid,
      moduleErrors: diagnostics.modules.errors,
      moduleLoading: diagnostics.modules.loading
    };
  });

  expect(result.hunt).toEqual({ ship:'CI掘り艦', map:'1-1', node:'B' });
  expect(result.material).toBe(7);
  expect(result.eoAfter).toBeGreaterThanOrEqual(result.eoBefore);
  expect(result.training.active).toBeTruthy();
  expect(result.training.target).toBe(20);
  expect(result.slot).toBe(result.expeditionId);
  expect(result.daily).toBeTruthy();
  expect(result.snapshotOk).toBeTruthy();
  expect(result.snapshotCount).toBeGreaterThan(0);
  expect(result.diagnosticInvalid).toBe(0);
  expect(result.moduleErrors).toEqual([]);
  expect(result.moduleLoading).toEqual([]);

  await page.evaluate(() => hdWSShowElement?.('dropHuntingDb', false));
  await expect(page.locator('#hdDropHuntList')).toContainText('CI掘り艦');
  await page.evaluate(() => hdWSShowElement?.('trainingPlanner', false));
  await expect(page.locator('#hdTrainingList')).toContainText('CI育成艦');
  await page.evaluate(() => hdWSShowElement?.('dailyOpsCenter', false));
  await expect(page.locator('[data-do-check="quests"]')).toBeChecked();

  expect(errors).toEqual([]);
});

test('settings and diagnostics controls remain operable after workspace switching', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  await page.evaluate(() => hdWSShowElement?.('notificationCenter', false));
  const notification = page.locator('[data-notify-setting="expedition"]');
  const wasChecked = await notification.isChecked();
  await notification.click();
  expect(await notification.isChecked()).toBe(!wasChecked);

  const stored = await page.evaluate(() => hdDONotifyCfg().expedition);
  expect(stored).toBe(!wasChecked);

  await page.evaluate(() => hdWSShowElement?.('dataQualityAudit', false));
  await page.locator('[data-audit-refresh]').click();
  await expect(page.locator('#hdDataAudit')).toContainText('データ品質');

  await page.evaluate(() => hdWSShowElement?.('diagnosticsCenter', false));
  await page.locator('[data-dx-recheck]').click();
  await expect(page.locator('#hdDiagnosticsCenter')).toContainText('診断・復旧センター');
  await expect(page.locator('#hdDiagnosticsCenter')).not.toContainText('追加モジュール読込エラー');

  expect(errors).toEqual([]);
});
