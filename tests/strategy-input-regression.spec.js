const { test, expect } = require('@playwright/test');
const { installStrategyInputDiagnostics } = require('./strategy-input-diagnostics.cjs');
// Keep expensive database snapshots out of this targeted first-failure trace scope.
test.use({ viewport:{width:390,height:844}, hasTouch:true, isMobile:true, serviceWorkers:'block', trace:'retain-on-failure' });
installStrategyInputDiagnostics(test, { recordSuccess: process.env.HD_STRATEGY_RECORD_SUCCESS === '1' });

async function boot(page, errors = []) {
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/Failed to load resource/i.test(text)) return;
    errors.push(`console: ${text}`);
  });

  await page.context().route('**/*', async route => {
    const req = route.request();
    let url;
    try { url = new URL(req.url()); } catch { return route.continue(); }
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.protocol === 'blob:' || url.protocol === 'data:') {
      return route.continue();
    }
    if (req.resourceType() === 'image') {
      const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
      return route.fulfill({ status: 200, contentType: 'image/png', body: pixel });
    }
    return route.fulfill({ status: 204, body: '' });
  });

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, { timeout: 30000 });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('#shipDatabase')).toHaveCount(1, { timeout: 30000 });
  await page.waitForFunction(() =>
    typeof window.hdWSApply === 'function' &&
    typeof window.hdPHRender === 'function' &&
    typeof window.hdQNCategoryRows === 'function' &&
    typeof window.hdKcCurrentFleets === 'function',
    null,
    { timeout: 30000 }
  );
}

async function openApp(page) {
  await page.route('**/*',route=>{const url=new URL(route.request().url());return ['127.0.0.1','localhost'].includes(url.hostname)?route.continue():route.fulfill({status:204,body:''})});
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof homeGuideRender === 'function' && typeof hdShipDbAcquisitionRows === 'function' && typeof hdDropAllTargets === 'function' && typeof HD_CONSTRUCTION_RECIPES !== 'undefined', null, { timeout: 30000 });
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, { timeout: 30000 });
}

test('release smoke: priority strategy view combines completion and map filters and persists', async ({ page }) => {
  // Two full app loads and native actions need their complete assertion windows.
  test.setTimeout(90000);
  await boot(page);
  await page.evaluate(()=>{hdSelectGuideMap('6-5');hdWSShowElement('home',false);const s=homeGuideState();s.custom.push({id:'priority-local',category:'map',title:'優先の海域目標',scope:'map',map:'6-5',priority:'high'},{id:'priority-global',category:'map',title:'優先の共通目標',scope:'global',priority:'high'},{id:'priority-other',category:'map',title:'別海域の優先目標',scope:'map',map:'6-4',priority:'high'},{id:'priority-normal',category:'map',title:'通常目標',scope:'global'},{id:'priority-import',category:'quest',title:'優先の取り込み任務',scope:'map',map:'6-5',source:'oneTimeQuest',ref:'B175',priority:'high'});s.done.push('map:6-5:map:priority-local','shared:oneTimeQuest:B175');homeGuideSave(s)});
  const before=await page.evaluate(()=>homeGuideState());const filter=page.locator('[data-home-guide-priority-only]');
  await filter.click();await expect(filter).toBeFocused();await expect(filter).toHaveAttribute('aria-pressed','true');await expect(page.locator('#homeGuideSteps .home-guide-step')).toHaveCount(3);await expect(page.locator('.home-guide-filter-state')).toHaveText('表示：全件・優先のみ 3件');
  await expect(page.locator('details[data-group="gear"] .home-guide-empty')).toHaveText('この分類に表示条件に合う優先目標はありません。');
  await page.locator('[data-home-guide-pending]').click();await expect(page.locator('.home-guide-filter-state')).toHaveText('表示：未完了・優先のみ 1件');
  await page.locator('[data-home-guide-completed]').click();await expect(page.locator('.home-guide-filter-state')).toHaveText('表示：完了済み・優先のみ 2件');
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body?.dataset.hdReady==='1');await page.evaluate(()=>{hdSelectGuideMap('6-5');hdWSShowElement('home',false)});await expect(filter).toHaveAttribute('aria-pressed','true');await expect(page.locator('[data-home-guide-priority="priority-import"]')).toHaveCount(1);
  await page.locator('#homeGuideMapSelect').selectOption('6-4');await expect(page.locator('.home-guide-filter-state')).toHaveText('表示：完了済み・優先のみ 0件');await page.locator('[data-home-guide-completed]').click();await expect(page.locator('.home-guide-filter-state')).toHaveText('表示：全件・優先のみ 2件');
  expect(await page.evaluate(()=>homeGuideState())).toEqual(before);
});

test('release smoke: strategy goal priorities reorder manual and imported goals without changing completion', async ({ page }) => {
  await boot(page);
  await page.evaluate(()=>{
    hdSelectGuideMap('6-5');hdWSShowElement('home',false);const state=homeGuideState();
    state.custom.push({id:'priority-normal',category:'quest',title:'通常の目標',scope:'map',map:'6-5'},{id:'priority-invalid',category:'quest',title:'古い保存データの目標',scope:'global',priority:'unknown'},{id:'priority-later',category:'quest',title:'あとで取り組む目標',scope:'map',map:'6-5',priority:'later'},{id:'priority-imported',category:'quest',title:'候補から追加した任務',scope:'map',map:'6-5',source:'oneTimeQuest',ref:'B175'},{id:'priority-other',category:'quest',title:'別海域の優先目標',scope:'map',map:'6-4',priority:'high'});
    state.done.push('shared:oneTimeQuest:B175');homeGuideSave(state);
  });
  const group=page.locator('details[data-group="quest"]');await group.locator('summary').click();
  await expect(page.locator('[data-home-guide-priority="priority-normal"]')).toHaveValue('normal');await expect(page.locator('[data-home-guide-priority="priority-invalid"]')).toHaveValue('normal');
  await page.locator('[data-home-guide-priority="priority-imported"]').focus();await page.locator('[data-home-guide-priority="priority-imported"]').selectOption('high');
  await expect(group.locator('.home-guide-step').first().locator('strong')).toHaveText('候補から追加した任務');
  await expect(group.locator('.home-guide-step').last().locator('strong')).toHaveText('あとで取り組む目標');
  expect(await page.evaluate(()=>document.activeElement?.dataset.homeGuidePriority)).toBe('priority-imported');
  const before=await page.evaluate(()=>homeGuideState());expect(before.done).toContain('shared:oneTimeQuest:B175');expect(before.custom.find(x=>x.id==='priority-imported')).toMatchObject({source:'oneTimeQuest',ref:'B175',map:'6-5',priority:'high'});
  await page.locator('#homeGuideMapSelect').selectOption('6-4');await expect(group.locator('.home-guide-step').first().locator('strong')).toHaveText('別海域の優先目標');
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body?.dataset.hdReady==='1');await page.evaluate(()=>{hdSelectGuideMap('6-5');hdWSShowElement('home',false);});await group.locator('summary').click();
  await expect(group.locator('.home-guide-step').first().locator('strong')).toHaveText('候補から追加した任務');
  expect(await page.evaluate(()=>homeGuideState())).toEqual(before);
});

test('release smoke: strategy goal editing keeps failed changes and saves once on retry', async ({ page }) => {
  await boot(page);
  await page.evaluate(()=>{hdSelectGuideMap('6-5');hdWSShowElement('home',false);const state=homeGuideState();state.custom.push({id:'edit-failed',category:'map',title:'保存前の目標',scope:'map',map:'6-5'});homeGuideSave(state);});
  await page.locator('[data-home-guide-edit-open="edit-failed"]').click();
  const form=page.locator('[data-home-guide-edit="edit-failed"]');await form.locator('[name="title"]').fill('保存後の目標');
  await page.evaluate(()=>{const original=Storage.prototype.setItem;window.restoreEditStorage=()=>{Storage.prototype.setItem=original};Storage.prototype.setItem=function(key,value){if(key===HD_HOME_GUIDE_KEY)throw new DOMException('Full','QuotaExceededError');return original.call(this,key,value)}});
  await form.locator('button[type="submit"]').click();await expect(form.locator('[name="title"]')).toHaveValue('保存後の目標');
  expect(await page.evaluate(()=>homeGuideState().custom.find(x=>x.id==='edit-failed').title)).toBe('保存前の目標');
  await page.evaluate(()=>window.restoreEditStorage());
  await form.locator('button[type="submit"]').click();await expect(form).toHaveCount(0);
  expect(await page.evaluate(()=>homeGuideState().custom.filter(x=>x.id==='edit-failed').map(x=>x.title))).toEqual(['保存後の目標']);
});

test('strategy integration: prerequisite checkbox and cleared map share one completion state', async ({ page }) => {
  // Two app loads and three map changes share this budget. Keep the individual
  // readiness (30s) and assertion (12s) deadlines; do not abort a valid final step.
  test.setTimeout(180000);
  await openApp(page);
  await page.locator('#homeGuideMapSelect').selectOption('6-5');
  await page.locator('[data-hd-strategy-import-all="6-5"]').click();
  const unlock=page.locator('[data-group="map"] .home-guide-step').filter({hasText:'6-4 のクリアを確認'}).locator('[data-home-guide-toggle]');
  await expect(unlock).toHaveAttribute('aria-pressed','false');
  await unlock.click();
  expect(await page.evaluate(() => homeGuideState().cleared.includes('6-4'))).toBe(true);
  await expect(unlock).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.hd-strategy-preview')).not.toContainText('6-4 → 6-5');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, {timeout:30000});
  await expect(unlock).toHaveAttribute('aria-pressed','true');
  await page.locator('#homeGuideMapSelect').selectOption('6-4');
  await page.locator('[data-home-guide-clear]').click();
  await page.locator('#homeGuideMapSelect').selectOption('6-5');
  await expect(unlock).toHaveAttribute('aria-pressed','false');
  expect(await page.evaluate(() => homeGuideState().cleared.includes('6-4'))).toBe(false);
});

test('release smoke: strategy goal deletion undo preserves newer changes and shared imported completion', async ({ page }) => {
  await boot(page);await page.evaluate(()=>{hdSelectGuideMap('6-5');hdWSShowElement('home',false);const s=homeGuideState();s.custom.push({id:'delete-import',title:'取り込んだ任務',category:'map',scope:'map',map:'6-5',priority:'high',source:'oneTimeQuest',ref:'B175'},{id:'delete-other',title:'別海域の同じ任務',category:'quest',scope:'map',map:'6-4',source:'oneTimeQuest',ref:'B175'});s.done.push('shared:oneTimeQuest:B175');homeGuideSave(s)});const imported=await page.evaluate(()=>homeGuideState().custom.find(x=>x.id==='delete-import'));await page.locator('[data-home-guide-delete="delete-import"]').click();
  await page.evaluate(()=>{const s=homeGuideState();s.custom.push({id:'delete-new',title:'削除後に追加した目標',category:'map',scope:'global'});s.done.push('global:map:delete-new');s.cleared.push('6-3');homeGuideSave(s);hdSelectGuideMap('6-4')});await page.locator('#hdToastRegion .hd-toast-action').click();expect(await page.evaluate(()=>homeGuideState().custom.find(x=>x.id==='delete-import'))).toEqual(imported);expect(await page.evaluate(()=>homeGuideState().custom.map(x=>x.id))).toEqual(['delete-import','delete-other','delete-new']);expect(await page.evaluate(()=>homeGuideState().done)).toEqual(expect.arrayContaining(['shared:oneTimeQuest:B175','global:map:delete-new']));expect(await page.evaluate(()=>homeGuideState().cleared)).toContain('6-3');
  await page.locator('#homeGuideMapSelect').selectOption('6-5');await expect(page.locator('[data-home-guide-priority="delete-import"]')).toHaveValue('high');await expect(page.locator('[data-home-guide-toggle="shared:oneTimeQuest:B175"]')).toHaveAttribute('aria-pressed','true');
});

test('release smoke: strategy goal deletion undo keeps failed deletions and retries failed restoration', async ({ page }) => {
  await boot(page);await page.evaluate(()=>{hdSelectGuideMap('6-5');hdWSShowElement('home',false);const s=homeGuideState();s.custom.push({id:'delete-failure',title:'削除を試す目標',category:'map',scope:'map',map:'6-5'});homeGuideSave(s)});await page.locator('[data-home-guide-edit-open="delete-failure"]').click();await page.locator('[data-home-guide-edit="delete-failure"] [name="title"]').fill('残す下書き');
  await page.evaluate(()=>{const original=Storage.prototype.setItem;window.restoreDeleteStorage=()=>Storage.prototype.setItem=original;window.failDeleteStorage=()=>{Storage.prototype.setItem=function(k,v){if(k===HD_HOME_GUIDE_KEY)throw new DOMException('Full','QuotaExceededError');return original.call(this,k,v)}};window.failDeleteStorage()});await page.locator('[data-home-guide-delete="delete-failure"]').click();await expect(page.locator('[data-home-guide-edit="delete-failure"] [name="title"]')).toHaveValue('残す下書き');await expect(page.locator('#hdToastRegion .hd-toast-action')).toHaveCount(0);await page.evaluate(()=>window.restoreDeleteStorage());await page.locator('[data-home-guide-delete="delete-failure"]').click();await page.evaluate(()=>window.failDeleteStorage());await page.locator('#hdToastRegion .hd-toast-action').click();await expect(page.locator('[data-home-guide-priority="delete-failure"]')).toHaveCount(0);await expect(page.locator('#hdToastRegion')).toHaveClass(/show/);await expect(page.locator('#hdToastRegion')).toContainText('復元を保存できなかった');await page.evaluate(()=>window.restoreDeleteStorage());await page.locator('#hdToastRegion .hd-toast-action').click();await expect(page.locator('[data-home-guide-edit="delete-failure"] [name="title"]')).toHaveValue('残す下書き');expect(await page.evaluate(()=>homeGuideState().custom.filter(x=>x.id==='delete-failure').length)).toBe(1);
});

test('release smoke: strategy goal editing excludes imported goals and removes deleted drafts', async ({ page }) => {
  await boot(page);
  await page.evaluate(()=>{hdSelectGuideMap('6-5');hdWSShowElement('home',false);const state=homeGuideState();state.custom.push({id:'edit-delete',category:'map',title:'削除する目標',scope:'map',map:'6-5'},{id:'edit-imported',category:'map',title:'自動の候補目標',scope:'map',map:'6-5',source:'unlock',ref:'6-4'});homeGuideSave(state);});
  await expect(page.locator('[data-home-guide-edit-open="edit-imported"]')).toHaveCount(0);
  await page.locator('[data-home-guide-edit-open="edit-delete"]').click();await page.locator('[data-home-guide-edit="edit-delete"] [name="title"]').fill('削除する編集下書き');
  await page.locator('[data-home-guide-delete="edit-delete"]').click();await expect(page.locator('[data-home-guide-edit="edit-delete"]')).toHaveCount(0);
  expect(await page.evaluate(()=>({draft:homeGuideDraftStore()[homeGuideEditDraftKey('edit-delete')],goals:homeGuideState().custom.map(x=>x.id)}))).toEqual({draft:undefined,goals:['edit-imported']});
});

test('release smoke: deferred strategy goals filter persists and combines with completion and search', async ({ page }) => {
  // This scenario exercises every filter and then reloads the app.
  test.setTimeout(90000);
  await boot(page);
  await page.evaluate(()=>{hdSelectGuideMap('6-5');hdWSShowElement('home',false);const s=homeGuideState();s.custom.push(
    {id:'later-pending',category:'map',title:'あとで装備を準備',priority:'later',scope:'map',map:'6-5'},
    {id:'later-done',category:'map',title:'あとで任務を確認',priority:'later',scope:'global',map:''},
    {id:'later-high',category:'map',title:'優先する目標',priority:'high',scope:'global',map:''});s.done.push(homeGuideGoalKey(s.custom.find(x=>x.id==='later-done')));homeGuideSave(s)});
  const before=await page.evaluate(()=>homeGuideState());
  const filter=page.locator('[data-home-guide-later-only]');await filter.click();
  await expect(page.locator('.home-guide-filter-state')).toHaveText('表示：全件・あとでのみ 2件');
  await page.locator('[data-home-guide-pending]').click();await expect(page.locator('.home-guide-filter-state')).toHaveText('表示：未完了・あとでのみ 1件');
  await page.locator('[data-home-guide-completed]').click();await expect(page.locator('.home-guide-filter-state')).toHaveText('表示：完了済み・あとでのみ 1件');
  await page.locator('[data-home-guide-search]').fill('装備');await expect(page.locator('.home-guide-filter-state')).toHaveText('表示：完了済み・あとでのみ・検索中 0件');await page.locator('[data-home-guide-search-clear]').click();
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body?.dataset.hdReady==='1');await page.evaluate(()=>{hdSelectGuideMap('6-5');hdWSShowElement('home',false)});await expect(filter).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-home-guide-priority-only]').click();await expect(filter).toHaveAttribute('aria-pressed','false');await expect(page.locator('[data-home-guide-priority-only]')).toHaveAttribute('aria-pressed','true');
  await filter.click();await expect(page.locator('[data-home-guide-priority-only]')).toHaveAttribute('aria-pressed','false');expect(await page.evaluate(()=>homeGuideState())).toEqual(before);
});
