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

    return { initial, doneSamePeriod, samePeriodCount, nextCycle };
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
  expect(errors).toEqual([]);
});
