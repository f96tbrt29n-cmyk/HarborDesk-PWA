'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const { registrationRouteFixture } = require('./registration-route-fixture.cjs');
const { observeRegistrationContinuation } = require('./pwa-registration-continuation.cjs');
const source = require('node:fs').readFileSync(path.join(__dirname, '../update-manager.js'), 'utf8');

async function run(route, fail = false) {
  const fixture = registrationRouteFixture(source, route), handlers = [], calls = [], records = [], warnings = [];
  const registration = { update: () => Promise.resolve() };
  const failure = Error('controlled native rejection');
  const worker = { controller: null, ready: Promise.resolve(registration), addEventListener() {},
    register(...args) { calls.push({ receiver: this, args }); return fail ? Promise.reject(failure) : Promise.resolve(registration); } };
  const scope = { navigator: { serviceWorker: worker }, console: { debug: message => records.push(message), warn: (...args) => warnings.push(args) },
    performance: { timeOrigin: 1000, now: () => records.length }, document: { readyState: 'complete' }, location: { origin: 'http://fixture.invalid', pathname: '/' }, URL };
  scope.window = scope; scope.addEventListener = (name, handler) => { assert.equal(name, 'load'); handlers.push(handler); };
  const context = vm.createContext(scope);
  vm.runInContext(fixture.bare, context); vm.runInContext(fixture.versioned, context);
  // Both entries are dispatched without awaiting the previous load listener.
  const returned = handlers.map(fn => fn());
  await Promise.all(returned); await Promise.resolve(); await Promise.resolve();
  return { fixture, scope, calls, records, warnings, failure, worker };
}

test('A/B/C use one real call per enabled entry, bare before versioned, original receivers/arguments', async () => {
  for (const route of ['A','B','C']) {
    const r = await run(route);
    const expected = route === 'A' ? ['./sw.js'] : route === 'B' ? ['./sw.js?v=580'] : ['./sw.js','./sw.js?v=580'];
    assert.deepEqual(r.calls.map(c => c.args[0]), expected);
    assert.ok(r.calls.every(c => c.receiver === r.worker));
    if (route !== 'B') { assert.equal(r.calls[0].args.length, 1); assert.equal(r.scope.__hdBareRegistrationState, 'registered'); }
    if (route !== 'A') { assert.equal(r.calls.at(-1).args[1].scope, './'); assert.equal(r.scope.HD_SERVICE_WORKER_STATUS, 'ready'); }
    if (route === 'A') assert.equal(r.scope.HD_SERVICE_WORKER_STATUS, 'idle', 'bare completion never substitutes product state');
    assert.match(r.fixture.html, /route-app-entry\.js.*route-update-entry\.js/);
  }
});

test('bare and versioned native rejection enter their own catch; no false completion', async () => {
  const r = await run('C', true);
  assert.equal(r.scope.__hdBareRegistrationState, 'error'); assert.equal(r.scope.HD_SERVICE_WORKER_STATUS, 'error');
  assert.equal(r.warnings.length, 2); assert.ok(r.warnings.every(x => x[1] === r.failure));
  assert.equal(r.records.filter(x => x.includes('await-resumed')).length, 0);
});

test('shared bounded recorder accepts safe bare/versioned identity and persists both outcomes', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'registration-route-'));
  t.after(() => fs.rm(dir, { recursive: true }));
  const page = new EventEmitter(), report = observeRegistrationContinuation(page, { outputPath: n => path.join(dir, n) }, { page: 'controlled' });
  const r = await run('C', true);
  for (const text of r.records) page.emit('console', { text: () => text });
  await report.finish();
  const saved = JSON.parse(await fs.readFile(path.join(dir, 'pwa-registration-continuation.json'), 'utf8'));
  assert.equal(saved.invalidMessages, 0); assert.equal(saved.droppedEvents, 0);
  assert.deepEqual(saved.events.filter(e => e.stage === 'register-before').map(e => e.registrationURL), ['./sw.js','./sw.js?v=580']);
  assert.equal(saved.events.filter(e => e.stage === 'error-assigned').length, 2);
  assert.ok(saved.events.every(e => e.document.timeOrigin === 1000));
});

test('fixture is opt-in, guarded and contains no timers, storage, fetch or new Promise observers', () => {
  assert.throws(() => registrationRouteFixture(source, 'unknown'), /unknown route/);
  for (const route of ['A','B','C']) {
    const f = registrationRouteFixture(source, route);
    assert.equal(/setTimeout|setInterval|localStorage|sessionStorage|fetch\(|waitUntil|\.then\(|\.catch\(/.test(f.bare), false);
    assert.equal(f.versioned.includes('hdCheckForUpdate'), false);
    assert.equal(f.versioned.includes('setTimeout'), false);
    assert.equal((f.bare.match(/\.register\(/g) || []).length, route === 'B' ? 0 : 1);
  }
});
