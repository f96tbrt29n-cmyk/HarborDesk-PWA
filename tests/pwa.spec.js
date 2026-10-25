const { test, expect } = require('@playwright/test');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { waitForApplicationRegistration, observeApplicationRegistration } = require('./pwa-registration-ready.cjs');
const { observeRegistrationContinuation } = require('./pwa-registration-continuation.cjs');
const { createApplicationUpdateComparison } = require('./pwa-initial-update-comparison.cjs');
const { waitForInitialRegistration } = require('./pwa-initial-registration-ready.cjs');
const { build } = require('../app-version.json');
const { observeStorage } = require('./pwa-storage-audit.cjs');
const { observeReload } = require('./reload-evidence.cjs');
const { KEYS, seedPreparedStorage, readPreparedStorage, comparePreparedStorage, verifyPreparedStorageUI } = require('./pwa-prepared-storage.cjs');

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

async function offlineRegression({ page, context, browserName }, testInfo, prepared = false, storage = false) {
  if (prepared && (testInfo.project.metadata.registrationContinuation ||
    typeof testInfo.project.metadata.pwaInitialUpdateSuppression === 'boolean' || testInfo.project.metadata.pwaInitialRegistrationGate)) {
    throw Error('permanent prepared case requires unmodified product delivery');
  }
  const steps = [], messages = [];
  let seeded, baseline;
  const storageAudit = storage ? await observeStorage(page, testInfo, {scriptErrorBoundary:true,keyPresence:true}) : null;
  const reloadEvidence = storage ? observeReload(page, testInfo, {storageHeaders:true}) : null;
  if (reloadEvidence) await reloadEvidence.installNativeEvents({parserBoundary:true});
  const onConsole = message => {
    if (storage && ['error','warning'].includes(message.type()) && messages.length < 64) messages.push({type:message.type(),nodeEpochMs:Date.now(),message:message.text().replace(/https?:\/\/[^\s)]+/g, raw=>{try {const u=new URL(raw);return u.origin+u.pathname;}catch{return '[url]';}})});
  };
  if(storage)page.on('console',onConsole);
  const mark = (stage, detail = {}) => { if (prepared) steps.push({ stage, nodeEpochMs: Date.now(), ...detail }); };
  const registrationEvidence = observeApplicationRegistration(page, testInfo);
  // Opt-in isolated delivery only. The default fixture and product files keep
  // their original bytes; do not install Promise settlement observers.
  const continuation = testInfo.project.metadata.registrationContinuation === true
    ? observeRegistrationContinuation(page, testInfo, registrationEvidence.identity) : null;
  const comparison = typeof testInfo.project.metadata.pwaInitialUpdateSuppression === 'boolean'
    ? createApplicationUpdateComparison(continuation, testInfo, testInfo.project.metadata.pwaInitialUpdateSuppression) : null;
  const initialGate = testInfo.project.metadata.pwaInitialRegistrationGate === true;
  if (initialGate && (!comparison || testInfo.project.metadata.pwaInitialUpdateSuppression !== false)) throw Error('isolated initial gate requires current real-app delivery');
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
  if (storage) {
    await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFCSaveState==='function');
    await page.evaluate(seedPreparedStorage);
    seeded=await readPreparedStorage(page);
    expect(seeded.values.every(value=>value!==null)).toBe(true);
    mark('six-key-fixture-seeded');
  }
  if (prepared) {
    mark('initial-preparation-start');
    await waitForInitialRegistration(page, testInfo, { scope: server.origin + '/', scriptURL: server.origin + '/sw.js?v=' + build });
    mark('initial-preparation-passed');
  }

  // Reload once so the active service worker controls the page as it would in normal PWA use.
  // Isolated preparation control only; default/original preparation is unchanged.
  if (initialGate) await comparison.waitForInitialContinuation(expect.poll);
  comparison?.beforeOriginalReload();
  mark('online-reload-request');
  await page.reload({ waitUntil: 'domcontentloaded' });
  mark('online-reload-dcl');
  comparison?.mark('reload-domcontentloaded');
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  comparison?.mark('registration-wait-start');
  await waitForApplicationRegistration(page, registrationEvidence);
  mark('subsequent-registration-passed');
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
  mark('native-cache-scope-assertions-passed', storage ? {sw} : {});
  if (storage) {
    await page.waitForLoadState('load');
    await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
    await verifyPreparedStorageUI(page,expect);
    baseline=await readPreparedStorage(page);
    expect(baseline.values.every(value=>value!==null)).toBe(true);
    mark('normalized-online-baseline', {document:baseline.document,at:baseline.at,readyState:baseline.readyState,
      keys:KEYS.map((key,i)=>({key,present:baseline.values[i]!==null,length:baseline.values[i]?.length??0,changedSinceSeed:baseline.values[i]!==seeded.values[i]}))});
    await storageAudit.mark('online-baseline');
  }

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
  mark('offline-force-update-refused-cache-maintained-errors-zero');

  // WebKit's emulated offline navigation reported an internal browser error.
  // A stopped origin tests the real service-worker fallback in both engines.
  await context.setOffline(false);
  await server.stop();
  await expect(async () => {
    await expect(fetch(server.origin)).rejects.toThrow();
  }).toPass({ timeout: 5000 });
  if (browserName === 'chromium') await context.setOffline(true);
  comparison?.mark('original-stopped-origin-reload-request');
  if(storage)await storageAudit.mark('pre-reload');
  mark('stopped-origin-reload-request', {offlineEmulation:browserName==='chromium'});
  reloadEvidence?.mark('reload-start');
  await page.reload({ waitUntil: 'domcontentloaded' });
  mark('stopped-origin-reload-dcl');
  reloadEvidence?.mark('reload-domcontentloaded');
  const finalDocument=storage ? await page.evaluate(()=>({timeOrigin:performance.timeOrigin,url:location.origin+location.pathname})) : null;
  comparison?.mark('stopped-origin-reload-domcontentloaded');
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => Object.values(window.HD_MODULE_STATUS || {}).filter(x => x !== 'ok').length)).toBe(0);
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBeTruthy();
  if (prepared) mark('offline-ui-and-controller-passed', await page.evaluate(() => ({
    status: window.HD_SERVICE_WORKER_STATUS,
    document: { timeOrigin: performance.timeOrigin, at: performance.now(), readyState: document.readyState, url: location.origin + location.pathname }
  })));
  expect(errors, `page errors: ${errors.join('\n')}`).toEqual([]);
  mark('final-errors-zero');
  if (storage) {
    await page.waitForLoadState('load');
    await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
    await storageAudit.mark('post-load-before-comparison');
    const restored=await readPreparedStorage(page);
    // Persist flags, never value bodies, even if the comparison fails.
    mark('post-load-storage-observed',{document:restored.document,at:restored.at,readyState:restored.readyState,
      keys:KEYS.map((key,i)=>({key,present:restored.values[i]!==null,length:restored.values[i]?.length??0,exactMatch:restored.values[i]===baseline.values[i]}))});
    const exact=comparePreparedStorage(baseline,restored,finalDocument);
    mark('post-load-six-keys-exact',exact);
    await verifyPreparedStorageUI(page,expect);
    mark('offline-storage-ui-restored');
    expect(errors, `page errors: ${errors.join('\n')}`).toEqual([]);
    mark('post-load-ui-errors-zero');
  }
  comparison?.passed();
  } catch(error) { reloadEvidence?.failure(); throw error; }
  finally {
    if(storage)page.off('console',onConsole);
    try { await storageAudit?.finish(); }
    finally { await reloadEvidence?.(); }
    try { await registrationEvidence.finish(); }
    finally {
      try { continuation?.beginCleanup(); await context.setOffline(false); await server.stop(); }
      finally {
        try { await continuation?.finish(); }
        finally {
          try { await comparison?.finish(); }
          finally {
            if (prepared) {
              const file = testInfo.outputPath('pwa-prepared-offline-steps.json');
              await fs.mkdir(path.dirname(file), { recursive: true });
              await fs.writeFile(file, JSON.stringify({ productDelivery: 'unmodified', storageCase:storage, consoleMessages:messages, steps }, null, 2) + '\n');
              await testInfo.attach('pwa-prepared-offline-steps', { path: file, contentType: 'application/json' });
            }
          }
        }
      }
    }
  }
}

// Keep the original early-reload preparation and all following assertions.
test('PWA service worker caches app shell and survives offline reload', async ({ page, context, browserName }, info) => offlineRegression({ page, context, browserName }, info));

// Separate coverage: preparing the first document must not erase the early
// reload failure path above. This case shares its entire subsequent assertion path.
test('PWA prepared registration survives offline update refusal and stopped-origin reload', async ({ page, context, browserName }, info) => offlineRegression({ page, context, browserName }, info, true));

// Offline storage coverage is separate from the original prepared/early reload cases.
test('PWA prepared storage survives stopped-origin reload after load', async ({page,context,browserName},info)=>offlineRegression({page,context,browserName},info,true,true));
