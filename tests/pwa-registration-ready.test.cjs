'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { waitForApplicationRegistration } = require('./pwa-registration-ready.cjs');

// Use the actual registration entry, not a second implementation of its state
// transitions. This is a controlled contract, not a natural WebKit reproduction.
const source = fs.readFileSync(path.join(__dirname, '../update-manager.js'), 'utf8');
const entry = source.slice(0, source.indexOf("const HD_RELEASE_META_RAW="));
function realm() {
  let resolve, reject;
  const registration = { active: { scriptURL: 'https://fixture.invalid/sw.js' }, update: () => Promise.resolve() };
  const pending = new Promise((yes, no) => { resolve = yes; reject = no; });
  const calls = [], warnings = [];
  const scope = {
    navigator: { serviceWorker: {
      controller: registration.active,
      ready: Promise.resolve(registration),
      register(...args) { calls.push(args); return pending; }
    } },
    console: { warn: (...args) => warnings.push(args) }
  };
  scope.window = scope;
  const context = vm.createContext(scope);
  vm.runInContext(entry, context, { filename: 'update-manager.js' });
  return { scope, context, registration, resolve, reject, calls, warnings,
    read: fn => vm.runInContext('(' + fn.toString() + ')()', context) };
}

test('existing native controller/ready cannot satisfy application registration while new register is pending', async () => {
  const r = realm();
  const attempt = r.scope.hdEnsureServiceWorker();
  assert.equal(await r.scope.navigator.serviceWorker.ready, r.registration);
  assert.ok(r.scope.navigator.serviceWorker.controller);
  assert.equal(r.scope.HD_SERVICE_WORKER_STATUS, 'registering');
  // The old one-shot registered/ready assertion fails under this condition.
  assert.equal(['registered', 'ready'].includes(r.scope.HD_SERVICE_WORKER_STATUS), false);
  let reads = 0;
  const page = { async evaluate(fn) {
    const value = r.read(fn);
    reads++;
    if (reads === 1) {
      assert.equal(value, false);
      r.resolve(r.registration);
    }
    return value;
  } };
  await waitForApplicationRegistration(page);
  assert.ok(reads >= 2, 'must not pass on the pending sample');
  assert.equal(await attempt, r.registration);
  assert.equal(r.calls.length, 1);
  assert.equal(r.calls[0][0], './sw.js?v=' + vm.runInContext('HD_APP_BUILD', r.context));
  assert.equal(r.calls[0][1].scope, './');
  assert.equal(r.scope.HD_SERVICE_WORKER_STATUS, 'ready');
  assert.equal(r.warnings.length, 0);
});

test('failed new register remains error despite an existing ready registration', async () => {
  const r = realm(), failure = new Error('controlled register failure');
  const attempt = r.scope.hdEnsureServiceWorker();
  await r.scope.navigator.serviceWorker.ready;
  r.reject(failure);
  assert.equal(await attempt, null);
  assert.equal(r.scope.HD_SERVICE_WORKER_STATUS, 'error');
  assert.equal(['registered', 'ready'].includes(r.scope.HD_SERVICE_WORKER_STATUS), false);
  assert.equal(r.warnings.length, 1);
  assert.equal(r.warnings[0][1], failure);
});
