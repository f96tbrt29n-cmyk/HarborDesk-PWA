const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test('PWA service worker caches app shell and survives offline reload', async ({ page, context }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });

  await expect.poll(async () => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), { timeout: 20000 }).toBeGreaterThan(0);

  // Reload once so the active service worker controls the page as it would in normal PWA use.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(1200);

  const sw = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    const regs = await navigator.serviceWorker.getRegistrations();
    const cachesNow = await caches.keys();
    const current = cachesNow.find(x => x.startsWith('harbordesk-pwa-v')) || '';
    const cache = current ? await caches.open(current) : null;
    return {
      status: window.HD_SERVICE_WORKER_STATUS,
      scripts: regs.map(r => r.active?.scriptURL || r.waiting?.scriptURL || r.installing?.scriptURL || ''),
      caches: cachesNow,
      current,
      hasIndex: !!(cache && await cache.match('./index.html')),
      controlled: !!navigator.serviceWorker.controller,
      scope: reg.scope
    };
  });

  expect(sw.scripts.some(x => /\/sw\.js(?:\?|$)/.test(x)), `service workers: ${JSON.stringify(sw.scripts)}`).toBeTruthy();
  expect(sw.current, `caches: ${JSON.stringify(sw.caches)}`).not.toBe('');
  expect(sw.hasIndex, 'current PWA cache should include index.html').toBeTruthy();
  expect(sw.controlled).toBeTruthy();
  expect(['registered','ready']).toContain(sw.status);
  expect(sw.scope).toContain('127.0.0.1:4173');

  const cacheNameBefore = sw.current;
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });

  const offlineUpdate = await page.evaluate(async expected => {
    const alerts = [];
    window.alert = msg => alerts.push(String(msg));
    const before = await caches.keys();
    const result = await hdForceUpdate();
    await new Promise(r => setTimeout(r, 100));
    const after = await caches.keys();
    return {
      result,
      alerts,
      before,
      after,
      online: navigator.onLine,
      stillCached: after.includes(expected)
    };
  }, cacheNameBefore);

  expect(offlineUpdate.online).toBeFalsy();
  expect(offlineUpdate.result).toBeFalsy();
  expect(offlineUpdate.stillCached).toBeTruthy();
  expect(offlineUpdate.alerts.join(' ')).toContain('オフライン');
  expect(errors, `page errors: ${errors.join('\n')}`).toEqual([]);

  await context.setOffline(false);
});
