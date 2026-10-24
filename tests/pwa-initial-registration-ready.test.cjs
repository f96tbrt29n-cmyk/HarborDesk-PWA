'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { waitForInitialRegistration } = require('./pwa-initial-registration-ready.cjs');

const target = { scope: 'https://fixture.invalid/', scriptURL: 'https://fixture.invalid/sw.js?v=580' };
function value(status = 'ready', overrides = {}) {
  return { status, document: { timeOrigin: 1000, at: 10, readyState: 'complete', url: target.scope },
    registration: { scope: target.scope, active: { scriptURL: target.scriptURL, state: 'activated' } }, ...overrides };
}
async function fixture(t, read) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pwa-initial-'));
  t.after(() => fs.rm(dir, { recursive: true }));
  let reads = 0, attachments = 0;
  return {
    page: { async evaluate(fn, scope) { assert.equal(scope, target.scope); return read(fn, ++reads); } },
    info: { outputPath: name => path.join(dir, name), async attach() { attachments++; } },
    count: () => ({ reads, attachments }),
    report: async () => JSON.parse(await fs.readFile(path.join(dir, 'pwa-initial-preparation.json'), 'utf8'))
  };
}
function pollFor(count, failure) {
  return (read, options) => ({ async toBe(expected) {
    assert.equal(options.timeout, 12000); assert.equal('intervals' in options, false); assert.equal(expected, true);
    for (let i = 0; i < count; i++) if (await read()) return;
    throw failure;
  } });
}

test('initial preparation rejects controller/count substitutes, wrong target and unactivated workers before the matching app state', async t => {
  const cases = [value('idle'), value('registering'), value('error'), value('ready', { status: undefined }), value('ready', { registration: null }),
    value('ready', { registration: { scope: 'https://fixture.invalid/elsewhere/', active: value().registration.active } }),
    value('ready', { registration: { scope: target.scope, active: { scriptURL: 'https://fixture.invalid/sw.js', state: 'activated' } } }),
    value('ready', { registration: { scope: target.scope, active: { scriptURL: target.scriptURL, state: 'activating' } } }), value('registered')];
  // Passing no native register/ready/controller object is required: the condition
  // is application state plus this exact target registration, not native count.
  const f = await fixture(t, (_, n) => cases[n - 1]);
  await waitForInitialRegistration(f.page, f.info, target, pollFor(cases.length, Error('must pass')));
  assert.equal(f.count().reads, cases.length);
  assert.equal((await f.report()).outcome, 'passed');
});

test('browser read uses the target scope and same-read document/app state without register, update or ready reactions', async t => {
  const calls = [];
  const scope = { navigator: { serviceWorker: { async getRegistration(arg) { calls.push(arg); return value().registration; } } },
    performance: { timeOrigin: 1000, now: () => 10 }, document: { readyState: 'complete' },
    location: { origin: 'https://fixture.invalid', pathname: '/' }, window: { HD_SERVICE_WORKER_STATUS: 'ready' } };
  const realm = vm.createContext(scope);
  const f = await fixture(t, fn => vm.runInContext('(' + fn.toString() + ')(' + JSON.stringify(target.scope) + ')', realm));
  await waitForInitialRegistration(f.page, f.info, target, pollFor(1, Error('must pass')));
  assert.deepEqual(calls, [target.scope]);
  const r = await f.report();
  assert.equal(r.samples[0].document.timeOrigin, 1000); assert.equal(r.samples[0].status, 'ready');
});

test('evaluate errors and changed documents fail with the original evidence and no post-failure read', async t => {
  const original = new TypeError('controlled context destruction');
  const f = await fixture(t, (_, n) => { if (n === 1) return value('registering'); throw original; });
  await assert.rejects(waitForInitialRegistration(f.page, f.info, target, pollFor(3, Error('deadline'))), error => error === original);
  assert.deepEqual(f.count(), { reads: 2, attachments: 1 });
  assert.equal((await f.report()).outcome, 'failed');
  const g = await fixture(t, (_, n) => value(n === 1 ? 'registering' : 'ready', { document: { ...value().document, timeOrigin: n === 1 ? 1000 : 2000 } }));
  await assert.rejects(waitForInitialRegistration(g.page, g.info, target, pollFor(2, Error('deadline'))), /document changed/);
  assert.equal(g.count().reads, 2); assert.equal((await g.report()).samples.at(-1).document.timeOrigin, 2000);
});

test('deadline preserves bounded state history and drop count without another evaluate', async t => {
  const failure = Error('controlled 12-second deadline');
  const f = await fixture(t, () => value('registering'));
  await assert.rejects(waitForInitialRegistration(f.page, f.info, target, pollFor(66, failure)), error => error === failure);
  const r = await f.report();
  assert.equal(r.samples.length, 64); assert.equal(r.dropped, 2); assert.equal(r.outcome, 'failed');
  assert.deepEqual(f.count(), { reads: 66, attachments: 1 });
});

test('dedicated command selects only the new raw-delivery case and retains 45s, both engines and retries zero', () => {
  const config = require('../playwright.pwa-prepared.config.cjs');
  assert.equal(config.timeout, 45000); assert.equal(config.retries, 0); assert.equal(config.workers, 1);
  assert.equal(config.webServer, undefined);
  assert.deepEqual(config.projects.map(p => p.use.browserName), ['chromium', 'webkit']);
  assert.ok(config.projects.every(p => !p.metadata));
  assert.ok(config.grep.test('chromium pwa.spec.js PWA prepared registration survives offline update refusal and stopped-origin reload'));
  assert.ok(!config.grep.test('PWA service worker caches app shell and survives offline reload'));
  const scripts = require('../package.json').scripts;
  assert.equal(scripts['test:pwa:prepared'], 'playwright test --config=playwright.pwa-prepared.config.cjs');
  assert.ok(!scripts['test:browser'].includes('pwa.spec.js'));
});
