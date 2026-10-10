const { test, expect } = require('@playwright/test');
const APP_BUILD = require('../app-version.json').build;

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  serviceWorkers: 'block'
});

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

test('release smoke: deferred filter preserves drafts and reveals new normal goals after saving succeeds', async ({ page }) => {
  await boot(page);await page.evaluate(()=>{hdSelectGuideMap('6-5');hdWSShowElement('home',false);const s=homeGuideState();s.custom.push({id:'later-edit',category:'map',title:'保留目標',scope:'map',map:'6-5',priority:'later'});homeGuideSave(s)});
  await page.locator('[data-home-guide-edit-open="later-edit"]').click();const edit=page.locator('[data-home-guide-edit="later-edit"]');await edit.locator('[name="title"]').fill('編集下書き');await page.locator('[data-home-guide-later-only]').click();
  await page.locator('[data-home-guide-priority="later-edit"]').selectOption('normal');await expect(edit).toHaveCount(0);await page.locator('[data-home-guide-later-only]').click();await expect(edit.locator('[name="title"]')).toHaveValue('編集下書き');
  await page.locator('[data-home-guide-later-only]').click();const add=page.locator('[data-home-guide-add="map"]');await add.locator('[name="title"]').fill('今から進める目標');
  await page.evaluate(()=>{const original=Storage.prototype.setItem;window.restoreLaterStorage=()=>Storage.prototype.setItem=original;Storage.prototype.setItem=function(k,v){if(k===HD_HOME_GUIDE_KEY)throw new DOMException('Full','QuotaExceededError');return original.call(this,k,v)}});
  await add.locator('button[type="submit"]').click();await expect(page.locator('[data-home-guide-later-only]')).toHaveAttribute('aria-pressed','true');await expect(add.locator('[name="title"]')).toHaveValue('今から進める目標');await page.evaluate(()=>window.restoreLaterStorage());
  await add.locator('button[type="submit"]').click();await expect(page.locator('[data-home-guide-later-only]')).toHaveAttribute('aria-pressed','false');await expect(page.locator('.home-guide-step strong').filter({hasText:'今から進める目標'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
