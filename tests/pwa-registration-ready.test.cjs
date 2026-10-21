'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const fsp = require('node:fs/promises');
const os = require('node:os');
const { EventEmitter } = require('node:events');
const { waitForApplicationRegistration, observeApplicationRegistration } = require('./pwa-registration-ready.cjs');

async function fixture(t, evaluate, limits) {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'pwa-registration-'));
  t.after(() => fsp.rm(dir, { recursive: true }));
  const page = new EventEmitter(), owner = {}, frame = { url: () => 'https://fixture.invalid/?token=NEVER-RECORD#private' };
  page.context = () => owner; page.mainFrame = () => frame; page.evaluate = evaluate;
  const file = path.join(dir, 'pwa-registration-state.json'), attachments = [];
  const evidence = observeApplicationRegistration(page, { outputPath: name => path.join(dir, name), attach: async (name, data) => attachments.push({ name, ...data }) }, limits);
  return { page, evidence, file, frame, attachments, read: async () => JSON.parse(await fsp.readFile(file, 'utf8')) };
}
function sample(status, timeOrigin = 1000) {
  return { status, statusType: typeof status, document: { timeOrigin, at: 25, readyState: 'complete', url: 'https://fixture.invalid/?token=NEVER-RECORD', mainFrame: true } };
}
// Drives the real sample/save implementation without adding browser executions
// or waiting 12 seconds in each artificial failure contract.
function controlledPoll(count, failure) {
  return (read, options) => ({ async toBe(expected) {
    assert.equal(options.timeout, 12000); assert.equal('intervals' in options, false); assert.equal(expected, true);
    for (let i = 0; i < count; i++) if (await read() === true) return;
    throw failure;
  } });
}

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
    console: { warn: (...args) => warnings.push(args) },
    performance: { timeOrigin: 1000, now: () => 1 }, document: { readyState: 'complete' },
    location: { origin: 'https://fixture.invalid', pathname: '/' }
  };
  scope.window = scope;
  scope.top = scope;
  const context = vm.createContext(scope);
  vm.runInContext(entry, context, { filename: 'update-manager.js' });
  return { scope, context, registration, resolve, reject, calls, warnings,
    read: fn => vm.runInContext('(' + fn.toString() + ')()', context) };
}

test('existing native controller/ready cannot satisfy application registration while new register is pending', async t => {
  const r = realm();
  const attempt = r.scope.hdEnsureServiceWorker();
  assert.equal(await r.scope.navigator.serviceWorker.ready, r.registration);
  assert.ok(r.scope.navigator.serviceWorker.controller);
  assert.equal(r.scope.HD_SERVICE_WORKER_STATUS, 'registering');
  // The old one-shot registered/ready assertion fails under this condition.
  assert.equal(['registered', 'ready'].includes(r.scope.HD_SERVICE_WORKER_STATUS), false);
  let reads = 0;
  const f = await fixture(t, async fn => {
    const value = r.read(fn);
    reads++;
    if (reads === 1) {
      assert.equal(value.status, 'registering');
      r.resolve(r.registration);
    }
    return value;
  });
  await waitForApplicationRegistration(f.page, f.evidence);
  assert.ok(reads >= 2, 'must not pass on the pending sample');
  assert.equal(await attempt, r.registration);
  assert.equal(r.calls.length, 1);
  assert.equal(r.calls[0][0], './sw.js?v=' + vm.runInContext('HD_APP_BUILD', r.context));
  assert.equal(r.calls[0][1].scope, './');
  assert.equal(r.scope.HD_SERVICE_WORKER_STATUS, 'ready');
  assert.equal(r.warnings.length, 0);
  const report = await f.read();
  assert.equal(report.wait.outcome, 'passed');
  assert.equal(report.samples[0].state.category, 'registering');
  assert.equal(report.samples.at(-1).state.category, 'ready');
  assert.equal(f.attachments.length, 1);
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

test('all states, undefined and unexpected values retain one-read document metadata before success', async t => {
  const values = ['idle','registering','error','unsupported',undefined,'unknown-NEVER-RECORD',null,12,false,{ token: 'NEVER-RECORD' },'registered'];
  let reads = 0;
  const f = await fixture(t, async () => sample(values[reads], 1000 + reads++));
  await waitForApplicationRegistration(f.page, f.evidence, controlledPoll(values.length, Error('must pass')));
  const r = await f.read();
  assert.equal(reads, values.length);
  assert.deepEqual(r.samples.map(s => s.state.category), ['idle','registering','error','unsupported','undefined','unexpected','unexpected','unexpected','unexpected','unexpected','registered']);
  assert.deepEqual(r.samples.map(s => s.document.timeOrigin), values.map((_, i) => 1000 + i));
  assert.ok(r.samples.every(s => s.nodeMs >= 0 && s.nodeEpochMs > 0 && s.received.nodeMs >= s.nodeMs && s.document.at === 25));
  assert.equal(r.samples[5].state.string.length, values[5].length);
  assert.ok(!JSON.stringify(r).includes('NEVER-RECORD'));
  assert.equal(r.wait.outcome, 'passed');
});

test('evaluate rejection remains the original exception and writes the preceding state and error history', async t => {
  const error = new TypeError('navigation destroyed execution context; NEVER-RECORD');
  let reads = 0;
  const f = await fixture(t, async () => { if (++reads === 1) return sample('idle'); throw error; });
  await assert.rejects(waitForApplicationRegistration(f.page, f.evidence), e => e === error);
  const r = await f.read();
  assert.equal(reads, 2); assert.equal(r.wait.outcome, 'failed');
  assert.equal(r.samples[0].state.category, 'idle');
  assert.equal(r.samples[1].outcome, 'evaluate-error');
  assert.equal(r.samples[1].document, null);
  assert.equal(r.samples[1].state, undefined);
  assert.equal(r.samples[1].error.name, 'TypeError');
  assert.ok(!JSON.stringify(r).includes('NEVER-RECORD'));
  assert.equal(f.attachments.length, 1);
});

test('controlled poll failure saves non-success history without post-failure evaluate and finish is idempotent', async t => {
  const failure = Error('controlled poll deadline'), values = ['idle','registering','error']; let reads = 0;
  const f = await fixture(t, async () => sample(values[reads++]));
  await assert.rejects(waitForApplicationRegistration(f.page, f.evidence, controlledPoll(3, failure)), e => e === failure);
  await f.evidence.finish();
  const r = await f.read();
  assert.equal(reads, 3); assert.equal(f.attachments.length, 1);
  assert.equal(r.wait.outcome, 'failed');
  assert.deepEqual(r.samples.map(s => s.state.category), values);
  for (const name of ['pageerror','console','framenavigated','load','domcontentloaded']) assert.equal(f.page.listenerCount(name), 0);
});

test('sample and event caps drop oldest records while success is still judged from the same read', async t => {
  let reads = 0;
  const f = await fixture(t, async () => sample(++reads === 5 ? 'ready' : 'registering'), { sampleLimit: 2, eventLimit: 2 });
  f.page.emit('framenavigated', f.frame); f.page.emit('load'); f.page.emit('domcontentloaded');
  f.page.emit('console', { type: () => 'warning', text: () => 'HarborDesk Service Worker registration failed NEVER-RECORD' });
  f.page.emit('pageerror', Error('NEVER-RECORD'));
  await waitForApplicationRegistration(f.page, f.evidence, controlledPoll(5, Error('must pass')));
  const r = await f.read();
  assert.equal(reads, 5); assert.equal(r.samples.length, 2); assert.equal(r.droppedSamples, 3);
  assert.deepEqual(r.samples.map(s => s.sequence), [4, 5]); assert.equal(r.samples[1].state.category, 'ready');
  assert.equal(r.events.length, 2); assert.equal(r.droppedEvents, 3);
  assert.deepEqual(r.events.map(e => e.kind), ['registration-warning', 'pageerror']);
  assert.ok(!JSON.stringify(r).includes('NEVER-RECORD'));
});

test('a document change is retained per sample and absence of sampling is distinct from undefined', async t => {
  let reads = 0;
  const f = await fixture(t, async () => sample(++reads === 1 ? undefined : 'ready', reads === 1 ? 1000 : 2000));
  f.page.emit('framenavigated', f.frame);
  await waitForApplicationRegistration(f.page, f.evidence, controlledPoll(2, Error('must pass')));
  const r = await f.read();
  assert.deepEqual(r.samples.map(s => s.document.timeOrigin), [1000, 2000]);
  assert.equal(r.samples[0].state.category, 'undefined');
  assert.equal(r.events[0].document, null);
  assert.equal(r.events[0].url, 'https://fixture.invalid/');
  const noRead = await fixture(t, async () => { throw Error('must not evaluate'); });
  await noRead.evidence.finish();
  const empty = await noRead.read(); assert.equal(empty.wait.outcome, 'not-entered'); assert.deepEqual(empty.samples, []);
});

test('a value serialized as undefined is still unexpected when its same-read original type was function or symbol', async t => {
  const values = [{ ...sample(undefined), statusType: 'function' }, { ...sample(undefined), statusType: 'symbol' }, sample(undefined), sample('ready')];
  let reads = 0; const f = await fixture(t, async () => values[reads++]);
  await waitForApplicationRegistration(f.page, f.evidence, controlledPoll(4, Error('must pass')));
  const r = await f.read();
  assert.deepEqual(r.samples.map(s => [s.state.category, s.state.type]), [['unexpected','function'],['unexpected','symbol'],['undefined','undefined'],['ready','string']]);
});
