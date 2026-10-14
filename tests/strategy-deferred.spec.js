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
