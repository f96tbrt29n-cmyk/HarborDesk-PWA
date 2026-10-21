// Outside the normal fixed browser CI list. Each route is executed once with
// fresh origin/context. No outage experiment or user storage is involved.
const { test, expect } = require('@playwright/test');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { registrationRouteFixture } = require('./registration-route-fixture.cjs');
const { observeRegistrationContinuation } = require('./pwa-registration-continuation.cjs');
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'allow' });
for (const route of ['A','B','C']) test('registration route '+route, async ({ page, browser }, info) => {
  const root = path.resolve(__dirname, '..'), update = await fs.readFile(path.join(root, 'update-manager.js'), 'utf8');
  const sw = await fs.readFile(path.join(root, 'sw.js'));
  const fixture = registrationRouteFixture(update, route);
  const report = { route, browser: browser.version(), freshContext: true, nodeStartedPerformanceMs: performance.now(), sources: fixture.sources,
    swSHA256: createHash('sha256').update(sw).digest('hex'), samples: [], droppedSamples: 0, events: [], droppedEvents: 0, outcome: 'not-entered' };
  const probe = observeRegistrationContinuation(page, info, { page: 'one page per route', context: info.project.name+'-'+route });
  const append = (list, value, dropped) => { if (list.length === 64) { list.shift(); report[dropped]++; } list.push(value); };
  const event = (kind, data = {}) => append(report.events, { kind, nodePerformanceMs: performance.now(), ...data }, 'droppedEvents');
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); event('pageerror', { name: error.name }); });
  page.on('domcontentloaded', () => event('domcontentloaded'));
  page.on('load', () => event('load'));
  page.on('console', message => { if (message.type() === 'warning' && /registration failed/.test(message.text())) event('registration-warning'); });
  const server = http.createServer(async (req, res) => {
    probe.serverRequest(req, res);
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      const synthetic = pathname === '/' || pathname === '/index.html' ? fixture.html : pathname === '/route-app-entry.js' ? fixture.bare : pathname === '/route-update-entry.js' ? fixture.versioned : null;
      const body = synthetic !== null ? Buffer.from(synthetic) : await fs.readFile(file);
      const types = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.html': 'text/html' };
      res.writeHead(200, { 'Content-Type': pathname === '/' ? 'text/html' : types[path.extname(pathname)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(body);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  report.origin = `http://127.0.0.1:${server.address().port}`;
  try {
    event('initial-navigation-request'); await page.goto(report.origin, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#registration-fixture')).toBeVisible();
    await expect.poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), { timeout: 20000 }).toBeGreaterThan(0);
    // Same preparation boundary as product pwa.spec; do not wait for controller
    // or actual register completion before this one reload.
    event('reload-request'); await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#registration-fixture')).toBeVisible();
    report.outcome = 'waiting';
    await expect.poll(async () => {
      const pending = { nodePerformanceMs: performance.now(), outcome: 'pending' };
      append(report.samples, pending, 'droppedSamples');
      try {
        const sample = await page.evaluate(() => ({ bare: window.__hdBareRegistrationState, versioned: window.HD_SERVICE_WORKER_STATUS,
          document: { timeOrigin: performance.timeOrigin, at: performance.now(), readyState: document.readyState, url: location.origin + location.pathname } }));
        Object.assign(pending, sample, { receivedNodePerformanceMs: performance.now(), outcome: 'value' });
        const registered = state => ['registered','ready'].includes(state);
        return (route === 'B' || registered(sample.bare)) && (route === 'A' || registered(sample.versioned));
      } catch (error) { pending.outcome = 'evaluate-error'; throw error; }
    }, { timeout: 12000, message: 'applicable register awaits must complete in the reloaded document' }).toBe(true);
    report.outcome = 'registered';
    expect(errors).toEqual([]);
    report.outcome = 'passed';
  } finally {
    // No evaluate/storageState after failure. Preserve original first attempt.
    probe.beginCleanup(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    await probe.finish();
    const file = info.outputPath('registration-route-result.json'); await fs.writeFile(file, JSON.stringify(report, null, 2)+'\n');
    await info.attach('registration-route-result', { path: file, contentType: 'application/json' });
  }
});
