const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test('PWA service worker registers and creates HarborDesk cache', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });

  await expect.poll(async () => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), { timeout: 20000 }).toBeGreaterThan(0);
  const sw = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    const regs = await navigator.serviceWorker.getRegistrations();
    return {
      status: window.HD_SERVICE_WORKER_STATUS,
      scripts: regs.map(r => r.active?.scriptURL || r.waiting?.scriptURL || r.installing?.scriptURL || ''),
      caches: await caches.keys(),
      controlled: !!navigator.serviceWorker.controller,
      scope: reg.scope
    };
  });

  expect(sw.scripts.some(x => /\/sw\.js(?:\?|$)/.test(x)), `service workers: ${JSON.stringify(sw.scripts)}`).toBeTruthy();
  expect(sw.caches.some(x => x.startsWith('harbordesk-pwa-v')), `caches: ${JSON.stringify(sw.caches)}`).toBeTruthy();
  expect(['registered','ready']).toContain(sw.status);
  expect(sw.scope).toContain('127.0.0.1:4173');
  expect(errors, `page errors: ${errors.join('\n')}`).toEqual([]);
});
