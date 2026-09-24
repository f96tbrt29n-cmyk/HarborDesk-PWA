const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });

async function boot(page, errors = []) {
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  await page.addInitScript(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('harbordesk-ship-image-config-v1') || '{}');
      localStorage.setItem('harbordesk-ship-image-config-v1', JSON.stringify({ ...raw, autoSource: false }));
    } catch {
      localStorage.setItem('harbordesk-ship-image-config-v1', JSON.stringify({ remoteTemplate: '', autoSource: false }));
    }
  });
  await page.context().route('**/*', async route => {
    const req = route.request();
    let url;
    try { url = new URL(req.url()); } catch { return route.continue(); }
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.protocol === 'blob:' || url.protocol === 'data:') return route.continue();
    if (req.resourceType() === 'image') {
      const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
      return route.fulfill({ status: 200, contentType: 'image/png', body: pixel });
    }
    return route.fulfill({ status: 204, body: '' });
  });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(1200);
}

test('diagnose synced fleet HP and cond through sortie readiness', async ({ page }) => {
  const errors = [];
  await page.addInitScript(() => {
    const syncedAt = Date.now() - 3600000;
    sessionStorage.setItem('harbordesk-session-guide-view-v1', JSON.stringify({world:'5',map:'5-5',filter:'map',query:'5-5'}));
    localStorage.setItem('harbordesk-kancolle-fleets-v1', JSON.stringify([{
      deckId:1,name:'第1艦隊',mission:[0,0,0,0],syncedAt,
      ships:[{gameShipId:1,masterId:84,name:'加賀改',level:99,gear:'',nowHp:10,maxHp:40,cond:32}]
    }]));
  });
  await boot(page, errors);
  const diag = await page.evaluate(() => {
    window.hdSelectGuideMap?.('5-5');
    const sourceBefore = JSON.parse(localStorage.getItem('harbordesk-kancolle-fleets-v1') || '[]');
    const copied = window.hdKcCopyFleetToCustom?.(1,'5-5') || null;
    const customAfterCopy = JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1') || '{}');
    if (copied?.id) window.hdKcSelectFleetForSortie?.('5-5',copied.id);
    const fleets = typeof loadCustomFleets === 'function' ? (loadCustomFleets()['5-5'] || []) : (customAfterCopy['5-5'] || []);
    const selectedId = typeof hdSortieSelection === 'function' ? hdSortieSelection('5-5') : '';
    const selectedFleet = fleets.find(x => String(x.id) === String(selectedId)) || fleets[0] || null;
    const auto = typeof hdSortieAutoChecks === 'function' && selectedFleet ? hdSortieAutoChecks('5-5',selectedFleet) : null;
    document.querySelector('[data-map-tab="mine"]')?.click();
    window.hdRenderSortieReadiness?.();
    const dom = [...document.querySelectorAll('#hdSortieReadiness .hd-sortie-next,#hdSortieReadiness .hd-sortie-auto-row')].map(x => ({
      text:x.textContent || '',
      action:x.querySelector('[data-hd-sortie-action]')?.dataset.hdSortieAction || ''
    }));
    return {
      sourceBefore,
      copied,
      customAfterCopy,
      selectedId,
      selectedFleet,
      checks:auto?.checks || [],
      dom,
      errors
    };
  });
  console.log('SORTIE_DIAG '+JSON.stringify(diag));
  expect(diag.sourceBefore[0]?.ships?.[0]).toMatchObject({nowHp:10,maxHp:40,cond:32});
  expect(diag.copied?.ships?.[0]).toMatchObject({nowHp:10,maxHp:40,cond:32});
  expect(diag.selectedFleet?.ships?.[0]).toMatchObject({nowHp:10,maxHp:40,cond:32});
  expect(diag.checks.some(x => x.label === '耐久' && x.action === 'home')).toBe(true);
  expect(diag.checks.some(x => x.label === '疲労' && x.action === 'home')).toBe(true);
  expect(diag.dom.some(x => x.text.includes('耐久') && x.action === 'home')).toBe(true);
  expect(diag.dom.some(x => x.text.includes('疲労') && x.action === 'home')).toBe(true);
  expect(errors).toEqual([]);
});
