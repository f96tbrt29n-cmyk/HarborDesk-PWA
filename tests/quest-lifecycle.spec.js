const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test('periodic quest checklist lifecycle blocks completed progress and allows next-cycle re-add', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(3500);

  const result = await page.evaluate(() => {
    window.alert = () => {};
    state.quests = [];
    save();

    const q = HD_QUESTS.find(x => x.id === 'Bd1');
    if (!q) throw new Error('Bd1 missing');

    hdAddQuestToChecklist(q);
    const first = state.quests.find(x => x.sourceId === 'Bd1');
    const initial = {
      count: state.quests.filter(x => x.sourceId === 'Bd1').length,
      accepted: hdQuestAcceptedInChecklist(q),
      autoExercise: hdAutoQuestAccepted('Bd1'),
      autoActivity: hdALIsAccepted(q),
      key: first?.sourcePeriodKey || ''
    };

    first.done = true;
    save();
    hdRenderQuestDb();

    const doneSamePeriod = {
      accepted: hdQuestAcceptedInChecklist(q),
      completed: hdQuestCompletedThisPeriod(q),
      label: hdQuestChecklistButtonText(q),
      autoExercise: hdAutoQuestAccepted('Bd1'),
      autoActivity: hdALIsAccepted(q)
    };

    hdAddQuestToChecklist(q);
    const samePeriodCount = state.quests.filter(x => x.sourceId === 'Bd1').length;

    first.sourcePeriodKey = 'D:2000-01-01';
    save();
    hdAddQuestToChecklist(q);

    const rows = state.quests.filter(x => x.sourceId === 'Bd1');
    const nextCycle = {
      count: rows.length,
      active: rows.filter(x => !x.done).length,
      accepted: hdQuestAcceptedInChecklist(q),
      label: hdQuestChecklistButtonText(q),
      newKey: rows.find(x => !x.done)?.sourcePeriodKey || ''
    };

    const current = rows.find(x => !x.done);
    current.sourcePeriodKey = 'D:1999-01-01';
    save();
    hdQuestSyncChecklistPeriods();
    const afterExpiryRows = state.quests.filter(x => x.sourceId === 'Bd1');
    const stale = afterExpiryRows.find(x => x.id === current.id);
    const expiredCycle = {
      accepted: hdQuestAcceptedInChecklist(q),
      staleDone: !!stale?.done,
      staleExpired: !!stale?.expired,
      autoExercise: hdAutoQuestAccepted('Bd1'),
      autoActivity: hdALIsAccepted(q)
    };
    hdAddQuestToChecklist(q);
    const afterReadd = state.quests.filter(x => x.sourceId === 'Bd1');

    return { initial, doneSamePeriod, samePeriodCount, nextCycle, expiredCycle, afterExpiryReadd:{count:afterReadd.length,active:afterReadd.filter(x=>!x.done).length} };
  });

  expect(result.initial.count).toBe(1);
  expect(result.initial.accepted).toBeTruthy();
  expect(result.initial.autoExercise).toBeTruthy();
  expect(result.initial.autoActivity).toBeTruthy();
  expect(result.initial.key).not.toBe('');

  expect(result.doneSamePeriod.accepted).toBeFalsy();
  expect(result.doneSamePeriod.completed).toBeTruthy();
  expect(result.doneSamePeriod.label).toBe('今周期完了');
  expect(result.doneSamePeriod.autoExercise).toBeFalsy();
  expect(result.doneSamePeriod.autoActivity).toBeFalsy();
  expect(result.samePeriodCount).toBe(1);

  expect(result.nextCycle.count).toBe(2);
  expect(result.nextCycle.active).toBe(1);
  expect(result.nextCycle.accepted).toBeTruthy();
  expect(result.nextCycle.label).toBe('追加済み');
  expect(result.nextCycle.newKey).not.toBe('');
  expect(result.expiredCycle.accepted).toBeFalsy();
  expect(result.expiredCycle.staleDone).toBeTruthy();
  expect(result.expiredCycle.staleExpired).toBeTruthy();
  expect(result.expiredCycle.autoExercise).toBeFalsy();
  expect(result.expiredCycle.autoActivity).toBeFalsy();
  expect(result.afterExpiryReadd.count).toBe(3);
  expect(result.afterExpiryReadd.active).toBe(1);
  expect(errors).toEqual([]);
});


test('boss win and sortie logging count boss arrival exactly once', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(3500);

  const result = await page.evaluate(() => {
    window.alert = () => {};
    state.quests = [];
    save();
    localStorage.setItem('harbordesk-quest-progress-v1', '{}');
    localStorage.setItem('harbordesk-activity-log-v1', '[]');

    const bw1 = HD_QUESTS.find(x => x.id === 'Bw1');
    if (!bw1) throw new Error('Bw1 missing');
    hdAddQuestToChecklist(bw1);

    hdALRecord('boss-win');
    const manual = JSON.parse(localStorage.getItem('harbordesk-quest-progress-v1') || '{}').Bw1?.values || [];

    localStorage.setItem('harbordesk-quest-progress-v1', '{}');
    localStorage.setItem('harbordesk-activity-log-v1', '[]');
    hdSLApplyActivity({ result:'S', battles:1, boss:true, map:'2-1' });
    const sortie = JSON.parse(localStorage.getItem('harbordesk-quest-progress-v1') || '{}').Bw1?.values || [];

    return { manual, sortie };
  });

  expect(result.manual[2]).toBe(1);
  expect(result.manual[3]).toBe(1);
  expect(result.sortie[0]).toBe(1);
  expect(result.sortie[1]).toBe(1);
  expect(result.sortie[2]).toBe(1);
  expect(result.sortie[3]).toBe(1);
  expect(errors).toEqual([]);
});
