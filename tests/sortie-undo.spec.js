const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test('sortie delete restores quest progress even after activity history is trimmed', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(3500);

  const setup = await page.evaluate(() => {
    window.alert = () => {};
    window.confirm = () => true;

    state.quests = [];
    save();
    localStorage.setItem('harbordesk-quest-progress-v1', '{}');
    localStorage.setItem('harbordesk-activity-log-v1', '[]');
    localStorage.setItem('harbordesk-sortie-log-v1', '[]');

    const q = HD_QUESTS.find(x => x.id === 'Bw1');
    if (!q) throw new Error('Bw1 missing');
    hdAddQuestToChecklist(q);
    const all = hdQPStore();
    all.Bw1 = { periodKey: hdQPPeriodKey(q), values: [0,0,0,0], updatedAt: Date.now() };
    hdQPSave(all);

    hdSLEnsure();
    const map = document.getElementById('hdSLMap');
    const result = document.getElementById('hdSLResult');
    const battles = document.getElementById('hdSLBattles');
    const boss = document.getElementById('hdSLBoss');
    map.value = '1-1';
    result.value = 'S';
    battles.value = '1';
    boss.checked = true;
    hdSLRecord();

    const sortie = hdSLLoad()[0];
    const afterRecord = hdQPStore().Bw1?.values || [];
    return {
      id: sortie?.id || '',
      refs: sortie?.activityRefs || [],
      afterRecord
    };
  });

  expect(setup.id).not.toBe('');
  expect(setup.refs.length).toBeGreaterThan(0);
  expect(setup.afterRecord).toEqual([1,1,1,1]);

  const afterDelete = await page.evaluate(id => {
    // Simulate long-term use where the activity history has already trimmed this sortie's records.
    localStorage.setItem('harbordesk-activity-log-v1', '[]');
    hdSLDelete(id);
    const q = HD_QUESTS.find(x => x.id === 'Bw1');
    const row = hdQPStore().Bw1;
    return {
      values: row?.periodKey === hdQPPeriodKey(q) ? row.values : null,
      sortieExists: hdSLLoad().some(x => x.id === id),
      activityCount: hdALLoad().length
    };
  }, setup.id);

  expect(afterDelete.values).toEqual([0,0,0,0]);
  expect(afterDelete.sortieExists).toBeFalsy();
  expect(afterDelete.activityCount).toBe(0);
  expect(errors).toEqual([]);
});
