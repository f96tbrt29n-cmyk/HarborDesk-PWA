const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { reloadNativeProbe } = require('./reload-native-probe.cjs');

test('passive native probe leaves registration untouched and records loading state without extra fetch', async () => {
  const listeners = new Map(), records = [], cleared = [];
  const target = prefix => ({ addEventListener: (name, fn) => listeners.set(prefix + name, fn) });
  const active = { ...target('worker:'), scriptURL: 'http://localhost/sw.js?v=580', state: 'activated' };
  const reg = { ...target('reg:'), scope: 'http://localhost/', active, waiting: null, installing: null };
  const originalPromise = Promise.resolve(reg), calls = [];
  const sw = { ...target('sw:'), controller: active, getRegistration: () => Promise.resolve(reg), register: function(...args) { calls.push({ receiver: this, args }); return originalPromise; } };
  const document = { ...target('document:'), readyState: 'loading' };
  const nativeRegister = sw.register;
  let watchdog;
  vm.runInNewContext('(' + reloadNativeProbe.toString() + ')({instrumentSW:false})', {
    URL, location: { href: 'http://localhost/' }, performance: { timeOrigin: 1000, now: () => 1 },
    navigator: { serviceWorker: sw }, document, window: target('window:'),
    console: { debug: text => records.push(JSON.parse(text.slice('__HD_RELOAD_NATIVE__'.length))) },
    setTimeout: (fn, ms) => { assert.equal(ms, 30000); watchdog = fn; return 1; }, clearTimeout: id => cleared.push(id),
    fetch: () => { throw new Error('probe must not fetch'); },
  });
  assert.equal(sw.register, nativeRegister);
  assert.equal(sw.register('./sw.js'), originalPromise);
  assert.equal(calls[0].receiver, sw); assert.deepEqual(calls[0].args, ['./sw.js']);
  await new Promise(resolve => setImmediate(resolve));
  listeners.get('document:load')({ target: { tagName: 'SCRIPT', src: 'http://localhost/training-planner.js?v=580' } });
  assert.equal(records.at(-1).stage, 'script-load');
  assert.equal(records.at(-1).readyState, 'loading');
  watchdog(); await new Promise(resolve => setImmediate(resolve));
  assert.ok(records.some(x => x.stage === 'registration-stalled' && x.registration.active.state === 'activated'));
  document.readyState = 'interactive'; listeners.get('document:DOMContentLoaded')();
  assert.deepEqual(cleared, [1]); assert.equal(records.at(-1).stage, 'native-dcl');
  const count = records.length; watchdog(); assert.equal(records.length, count);
});
