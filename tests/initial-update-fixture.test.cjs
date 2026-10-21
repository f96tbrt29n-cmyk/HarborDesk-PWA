'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const { registrationRouteFixture } = require('./registration-route-fixture.cjs');
const { initialUpdateFixture } = require('./initial-update-fixture.cjs');
const { observeRegistrationContinuation } = require('./pwa-registration-continuation.cjs');
const source = require('node:fs').readFileSync(path.join(__dirname, '../update-manager.js'), 'utf8');
const control = initialUpdateFixture(source, false), comparison = initialUpdateFixture(source, true);

test('only initial suppression constant differs; reloaded source and all other B assets are byte equal', () => {
  const base = registrationRouteFixture(source, 'B');
  assert.equal(control.versioned.replace('const __hdSuppressExplicitUpdate=false;', 'const __hdSuppressExplicitUpdate=true;'), comparison.versioned);
  assert.equal(control.reloadedVersioned, comparison.reloadedVersioned);
  assert.match(control.reloadedVersioned, /const __hdSuppressExplicitUpdate=false;/);
  for (const fixture of [control, comparison]) { assert.equal(fixture.html, base.html); assert.equal(fixture.bare, base.bare); }
  assert.equal(control.sources.originalUpdateSHA256, comparison.sources.originalUpdateSHA256);
  assert.equal(control.sources.reloadedEntrySHA256, comparison.sources.reloadedEntrySHA256);
  assert.throws(() => initialUpdateFixture(source, 'invalid'), /invalid/);
});

async function run(code, { updateFailure, registerFailure, deliveryFailure = false } = {}) {
  const events = [], warnings = [], registerCalls = [], updateCalls = [], handlers = [];
  let release;
  const updatePromise = new Promise(resolve => { release = resolve; });
  let catches = 0, receiver, args;
  // Assert the original catch receiver and rejection handler registration, not
  // just equal source text. This is an artificial VM contract, not a browser.
  updatePromise.catch = function (...values) { catches++; receiver = this; args = values; return Promise.prototype.catch.apply(this, values); };
  const registration = { update(...values) { updateCalls.push({ receiver: this, args: values }); if (updateFailure) throw updateFailure; return updatePromise; } };
  const worker = { controller: null, ready: Promise.resolve(registration), addEventListener() {},
    register(...values) { registerCalls.push({ receiver: this, args: values }); return registerFailure ? Promise.reject(registerFailure) : Promise.resolve(registration); } };
  const scope = { navigator: { serviceWorker: worker }, console: { debug: text => { if (deliveryFailure) throw Error('diagnostic delivery'); events.push(text); }, warn: (...values) => warnings.push(values) },
    performance: { timeOrigin: 1000, now: () => events.length }, document: { readyState: 'complete' }, location: { origin: 'http://fixture.invalid', pathname: '/' }, URL };
  scope.window = scope; scope.addEventListener = (name, handler) => handlers.push(handler);
  vm.runInNewContext(code, scope); for (const handler of handlers) handler();
  // The existing function must progress while update remains pending.
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  return { events, warnings, registration, worker, registerCalls, updateCalls, scope, catches, receiver, args, release };
}

test('initial control calls update once, suppression skips it, both reloaded documents call it without awaiting update completion', async () => {
  for (const [code, expected] of [[control.versioned,1],[comparison.versioned,0],[control.reloadedVersioned,1],[comparison.reloadedVersioned,1]]) {
    const r = await run(code);
    assert.equal(r.registerCalls.length, 1); assert.equal(r.registerCalls[0].receiver, r.worker);
    assert.equal(r.registerCalls[0].args[0], './sw.js?v=580'); assert.equal(r.registerCalls[0].args[1].scope, './');
    assert.equal(r.updateCalls.length, expected); assert.equal(r.catches, expected);
    if (expected) { assert.equal(r.updateCalls[0].receiver, r.registration); assert.deepEqual(r.updateCalls[0].args, []); assert.equal(r.receiver instanceof Promise, true); assert.equal(typeof r.args[0], 'function'); }
    assert.equal(r.scope.HD_SERVICE_WORKER_STATUS, 'ready', 'must not wait for the pending update');
    const events = r.events.map(text => JSON.parse(text.slice(text.indexOf('{'))));
    assert.equal(events.filter(e => e.stage === 'explicit-update-site').length, 1);
    assert.equal(events.filter(e => e.stage === (expected ? 'explicit-update-expression-returned' : 'explicit-update-suppressed')).length, 1);
    r.release();
  }
});

test('register rejection never counts as reaching update; synchronous update throw keeps original catch/error', async () => {
  const registerFailure = Error('native register rejection');
  const failed = await run(control.versioned, { registerFailure });
  assert.equal(failed.scope.HD_SERVICE_WORKER_STATUS, 'error'); assert.equal(failed.updateCalls.length, 0);
  assert.equal(failed.events.some(e => e.includes('explicit-update-site')), false);
  assert.equal(failed.warnings[0][1], registerFailure);
  const updateFailure = Error('native update throw');
  const updated = await run(control.versioned, { updateFailure });
  assert.equal(updated.scope.HD_SERVICE_WORKER_STATUS, 'error'); assert.equal(updated.warnings[0][1], updateFailure);
  assert.equal(updated.updateCalls.length, 1); assert.equal(updated.catches, 0);
});

test('source adds no Promise observers or timers and preserves original rejection/ready statements', () => {
  const base = registrationRouteFixture(source, 'B').versioned;
  for (const f of [control, comparison]) for (const code of [f.versioned, f.reloadedVersioned]) {
    for (const token of [/\.then\(/g,/\.catch\(/g,/\.finally\(/g,/setTimeout\(/g,/setInterval\(/g,/\.update\(/g,/waitUntil\(/g]) assert.equal([...code.matchAll(token)].length, [...base.matchAll(token)].length);
    assert.ok(code.includes('reg.update().catch(()=>{});'));
    assert.ok(code.includes("navigator.serviceWorker.ready.then(()=>{window.HD_SERVICE_WORKER_STATUS='ready'}).catch(()=>{});"));
  }
});

test('diagnostic delivery failure does not turn suppression into a call or prevent the original control update', async () => {
  for (const [code, expected] of [[control.versioned,1],[comparison.versioned,0]]) {
    const r = await run(code, { deliveryFailure: true });
    assert.equal(r.scope.HD_SERVICE_WORKER_STATUS, 'ready'); assert.equal(r.updateCalls.length, expected);
    assert.equal(r.warnings.length, 0); assert.equal(r.events.length, 0); r.release();
  }
});

test('update phase and operation markers persist with document identity; invalid metadata is rejected', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'initial-update-'));
  t.after(() => fs.rm(dir, { recursive: true }));
  const page = new EventEmitter(), recorder = observeRegistrationContinuation(page, { outputPath: name => path.join(dir, name) }, { page: 'controlled' });
  for (const code of [control.versioned, comparison.versioned, control.reloadedVersioned]) {
    const r = await run(code);
    for (const text of r.events) page.emit('console', { text: () => text }); r.release();
  }
  const prefix = 'HD_REGISTRATION_CONTINUATION ';
  page.emit('console', { text: () => prefix + JSON.stringify({ stage:'explicit-update-site',callId:1,registrationURL:'./sw.js?v=580',scope:'./',
    document:{timeOrigin:1000,at:1,url:'http://fixture.invalid/',readyState:'complete'},updateControl:{phase:'invalid',suppress:true} }) });
  await recorder.finish();
  const report = JSON.parse(await fs.readFile(path.join(dir, 'pwa-registration-continuation.json'), 'utf8'));
  assert.equal(report.invalidMessages, 1); assert.equal(report.droppedEvents, 0);
  assert.deepEqual(report.events.filter(e => e.stage === 'explicit-update-site').map(e => e.updateControl),
    [{ phase:'initial',suppress:false },{ phase:'initial',suppress:true },{ phase:'reloaded',suppress:false }]);
  assert.ok(report.events.every(e => e.document.timeOrigin === 1000));
});
