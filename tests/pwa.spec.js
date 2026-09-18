const { test, expect } = require('@playwright/test');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

// Give this test its own origin so a real server outage does not affect other tests.
async function startOfflineTestServer() {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      const body = await fs.readFile(file);
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const stop = () => new Promise((resolve, reject) => {
    if (!server.listening) { resolve(); return; }
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  });
  return { origin, stop };
}


test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test('PWA service worker caches app shell and survives offline reload', async ({ page, context, browserName }) => {
  const server = await startOfflineTestServer();
  try {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(server.origin + '/', { waitUntil: 'domcontentloaded' });
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
  expect(sw.scope).toBe(server.origin + '/');

  const cacheNameBefore = sw.current;
  await context.setOffline(true);
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

  // WebKit's emulated offline navigation reported an internal browser error.
  // A stopped origin tests the real service-worker fallback in both engines.
  await context.setOffline(false);
  await server.stop();
  await expect(async () => {
    await expect(fetch(server.origin)).rejects.toThrow();
  }).toPass({ timeout: 5000 });
  if (browserName === 'chromium') await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => Object.values(window.HD_MODULE_STATUS || {}).filter(x => x !== 'ok').length)).toBe(0);
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBeTruthy();
  expect(errors, `page errors: ${errors.join('\n')}`).toEqual([]);
  } finally {
    await context.setOffline(false);
    await server.stop();
  }
});
