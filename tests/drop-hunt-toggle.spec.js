const { test, expect } = require('@playwright/test');

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

async function openDrops(page){
 await page.evaluate(()=>{selectedWorld='7';selectedMap='7-4';renderMapPicker();hdWSShowElement('guide',false);hdMapActivateTab('drop')});
 await expect(page.locator('[data-map-pane="drop"]')).toHaveClass(/active/);
 return page.locator('[data-map-pane="drop"] [data-hd-map-drop-ship="神威"]').first();
}

test('drop hunt toggle: a second mobile tap clears hunting and stays cleared after reload',async({page})=>{
 const errors=[];await boot(page,errors);const chip=await openDrops(page);
 await expect(chip).toHaveAttribute('aria-pressed','false');await chip.tap();await expect(chip).toHaveClass(/hunting/);await expect(chip).toHaveAttribute('title','タップで掘り目標を解除');
 await chip.tap();await expect(chip).not.toHaveClass(/hunting/);await expect(chip).not.toContainText('掘り中');await expect(chip).toHaveAttribute('aria-pressed','false');
 expect(await page.evaluate(()=>hdDropHunts().length)).toBe(0);
 await page.reload();await page.waitForFunction(()=>document.body.dataset.hdReady==='1');const reloaded=await openDrops(page);await expect(reloaded).not.toHaveClass(/hunting/);
 await reloaded.tap();await expect(reloaded).toHaveClass(/hunting/);expect(await page.evaluate(()=>hdDropHunts().length)).toBe(1);expect(errors).toEqual([]);
});

test('drop hunt toggle: only the selected ship map and node is removed and undo restores recorded runs',async({page})=>{
 await boot(page);const chip=await openDrops(page);const target=await chip.evaluate(el=>({ship:el.dataset.hdMapDropShip,map:el.dataset.hdMapDropMap,node:el.dataset.hdMapDropNode}));
 await page.evaluate(target=>{hdDropSave([{id:'active',...target,runs:27,s:19,a:8,obtained:false},{id:'history',...target,runs:10,obtained:true},{id:'other-node',...target,node:'別マス',obtained:false},{id:'other-map',...target,map:'6-3',obtained:false},{id:'other-ship',...target,ship:'春日丸',obtained:false}])},target);
 await expect(chip).toHaveClass(/hunting/);await chip.tap();await expect(chip).not.toHaveClass(/hunting/);
 expect(await page.evaluate(()=>hdDropHunts().map(x=>x.id))).toEqual(['history','other-node','other-map','other-ship']);
 await page.locator('#hdToastRegion .hd-toast-action').tap();await expect(chip).toHaveClass(/hunting/);
 expect(await page.evaluate(()=>hdDropHunts().find(x=>x.id==='active'))).toMatchObject({runs:27,s:19,a:8});
 await chip.tap();await chip.tap();await page.locator('#hdToastRegion .hd-toast-action').tap();expect(await page.evaluate(()=>hdDropHunts().filter(x=>x.ship==='神威'&&x.map==='7-4'&&x.node===hdDropHunts().find(x=>x.id==='history').node&&!x.obtained).length)).toBe(1);
});

test('drop hunt toggle: record deletion undo and obtained changes immediately refresh map indicators',async({page})=>{
 await boot(page);const chip=await openDrops(page);await chip.tap();const id=await page.evaluate(()=>hdDropHunts()[0].id);
 await page.evaluate(()=>hdWSShowElement('dropHuntingDb',false));await page.locator(`[data-hd-hunt-delete="${id}"]`).tap();await expect(chip).not.toHaveClass(/hunting/);
 await page.locator('#hdToastRegion .hd-toast-action').tap();await expect(chip).toHaveClass(/hunting/);
 await page.locator(`[data-hd-hunt-obtained="${id}"]`).tap();await expect(chip).not.toHaveClass(/hunting/);
 await page.locator(`[data-hd-hunt-obtained="${id}"]`).tap();await expect(chip).toHaveClass(/hunting/);
});
