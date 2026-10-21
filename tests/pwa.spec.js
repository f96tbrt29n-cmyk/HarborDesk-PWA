const { test, expect } = require('@playwright/test');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { waitForApplicationRegistration, observeApplicationRegistration } = require('./pwa-registration-ready.cjs');
const { observeRegistrationContinuation } = require('./pwa-registration-continuation.cjs');
const { createApplicationUpdateComparison } = require('./pwa-initial-update-comparison.cjs');

// Give this test its own origin so a real server outage does not affect other tests.
async function startOfflineTestServer(probe = null, comparison = null) {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer(async (req, res) => {
    const requestPhase = comparison?.phase();
    probe?.serverRequest(req, res);
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      let body = await fs.readFile(file);
      if (probe && pathname === '/update-manager.js') body = Buffer.from(comparison
        ? comparison.transform(body.toString('utf8'), requestPhase, res) : probe.transform(body.toString('utf8')));
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

test('PWA service worker caches app shell and survives offline reload', async ({ page, context, browserName }, testInfo) => {
  const registrationEvidence = observeApplicationRegistration(page, testInfo);
  // Opt-in isolated delivery only. The default fixture and product files keep
  // their original bytes; do not install Promise settlement observers.
  const continuation = testInfo.project.metadata.registrationContinuation === true
    ? observeRegistrationContinuation(page, testInfo, registrationEvidence.identity) : null;
  const comparison = typeof testInfo.project.metadata.pwaInitialUpdateSuppression === 'boolean'
    ? createApplicationUpdateComparison(continuation, testInfo, testInfo.project.metadata.pwaInitialUpdateSuppression) : null;
  const server = await startOfflineTestServer(continuation, comparison);
  try {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  comparison?.mark('initial-navigation-request');
  await page.goto(server.origin + '/', { waitUntil: 'domcontentloaded' });
  comparison?.mark('initial-domcontentloaded');
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });

  await expect.poll(async () => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), { timeout: 20000 }).toBeGreaterThan(0);
  comparison?.mark('original-initial-preparation-passed');

  // Reload once so the active service worker controls the page as it would in normal PWA use.
  comparison?.beforeOriginalReload();
  await page.reload({ waitUntil: 'domcontentloaded' });
  comparison?.mark('reload-domcontentloaded');
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  comparison?.mark('registration-wait-start');
  await waitForApplicationRegistration(page, registrationEvidence);
  comparison?.mark('registration-wait-passed');

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
  comparison?.mark('original-native-cache-scope-assertions-passed');

  const cacheNameBefore = sw.current;
  comparison?.mark('original-offline-update-check');
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
  comparison?.mark('original-offline-update-and-errors-passed');

  // WebKit's emulated offline navigation reported an internal browser error.
  // A stopped origin tests the real service-worker fallback in both engines.
  await context.setOffline(false);
  await server.stop();
  await expect(async () => {
    await expect(fetch(server.origin)).rejects.toThrow();
  }).toPass({ timeout: 5000 });
  if (browserName === 'chromium') await context.setOffline(true);
  comparison?.mark('original-stopped-origin-reload-request');
  await page.reload({ waitUntil: 'domcontentloaded' });
  comparison?.mark('stopped-origin-reload-domcontentloaded');
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => Object.values(window.HD_MODULE_STATUS || {}).filter(x => x !== 'ok').length)).toBe(0);
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBeTruthy();
  expect(errors, `page errors: ${errors.join('\n')}`).toEqual([]);
  comparison?.passed();
  } finally {
    try { await registrationEvidence.finish(); }
    finally {
      try { continuation?.beginCleanup(); await context.setOffline(false); await server.stop(); }
      finally {
        try { await continuation?.finish(); }
        finally { await comparison?.finish(); }
      }
    }
  }
});
