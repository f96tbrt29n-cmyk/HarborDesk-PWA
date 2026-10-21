'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const http = require('node:http');
const { EventEmitter } = require('node:events');
const { PREFIX, instrumentRegistrationSource, observeRegistrationContinuation } = require('./pwa-registration-continuation.cjs');
const { observeApplicationRegistration, waitForApplicationRegistration } = require('./pwa-registration-ready.cjs');
const source = fs.readFileSync(path.join(__dirname, '../update-manager.js'), 'utf8');
const transformed = instrumentRegistrationSource(source);
const entry = text => text.slice(0, text.indexOf('const HD_RELEASE_META_RAW='));

function realm(register, { instrumented = true, brokenDelivery = false, update } = {}) {
  const records = [], warnings = [], listeners = {};
  const registration = { update: update || (() => Promise.resolve()) };
  const worker = { controller: { scriptURL: 'https://fixture.invalid/sw.js?private=NEVER', state: 'activated' },
    register, ready: Promise.resolve(registration), addEventListener: (name, listener) => { listeners[name] = listener; } };
  const scope = { navigator: { serviceWorker: worker },
    console: { debug: message => { if (brokenDelivery) throw Error('diagnostic delivery failure'); records.push(JSON.parse(message.slice(PREFIX.length))); }, warn: (...args) => warnings.push(args) },
    performance: { timeOrigin: 1000, now: () => records.length }, document: { readyState: 'complete' },
    location: { origin: 'https://fixture.invalid', pathname: '/' }, URL };
  scope.window = scope;
  vm.runInNewContext(entry(instrumented ? transformed.source : source), scope, { filename: 'isolated-update-manager.js' });
  return { scope, worker, registration, records, warnings, listeners, stages: () => records.filter(x => x.callId === 1).map(x => x.stage) };
}

test('only isolated source changes: guarded anchors, hash, no extra Promise reactions or waits', () => {
  assert.notEqual(transformed.originalSha256, transformed.servedSha256);
  assert.equal(fs.readFileSync(path.join(__dirname, '../update-manager.js'), 'utf8'), source);
  assert.throws(() => instrumentRegistrationSource(source.replace('const reg=await', 'const reg = await')), /anchor changed/);
  for (const token of [/\.then\(/g, /\.catch\(/g, /\.finally\(/g, /setTimeout\(/g, /\.register\(/g, /\.update\(/g, /waitUntil\(/g]) {
    assert.equal([...transformed.source.matchAll(token)].length, [...source.matchAll(token)].length, String(token));
  }
  assert.equal(transformed.source.slice(transformed.source.indexOf('const HD_RELEASE_META_RAW=')), source.slice(source.indexOf('const HD_RELEASE_META_RAW=')));
});

test('native receiver/arguments/result preserved; synchronous return and existing await continuation are separate', async () => {
  let release, thenReads = 0, receiver, args;
  const thenable = { get then() { thenReads++; return resolve => { release = resolve; }; } };
  const r = realm(function (...values) { receiver = this; args = values; return thenable; });
  const attempt = r.scope.hdEnsureServiceWorker();
  assert.equal(receiver, r.worker);
  assert.equal(args[0], './sw.js?v=580'); assert.equal(args[1].scope, './'); assert.equal(args.length, 2);
  assert.deepEqual(r.stages(), ['register-before', 'register-returned']);
  assert.equal(r.scope.HD_SERVICE_WORKER_STATUS, 'registering');
  await Promise.resolve();
  assert.equal(thenReads, 1, 'only the existing await may assimilate the native return');
  release(r.registration);
  assert.equal(await attempt, r.registration);
  assert.deepEqual(r.stages(), ['register-before','register-returned','await-resumed','registered-assigned']);
  assert.equal(r.records.find(x => x.stage === 'registered-assigned').status, 'registered');
  r.listeners.controllerchange();
  assert.equal(r.records.at(-1).stage, 'controllerchange');
  assert.equal(r.records.at(-1).controller.state, 'activated');
  assert.equal(JSON.stringify(r.records).includes('NEVER'), false);
});

test('synchronous native throw, awaited rejection, and later update throw keep original catch behavior', async () => {
  for (const mode of ['sync', 'reject', 'update']) {
    const failure = Error(mode);
    for (const instrumented of [false, true]) {
      let r;
      r = realm(() => { if (mode === 'sync') throw failure; return mode === 'reject' ? Promise.reject(failure) : Promise.resolve(r.registration); },
        { instrumented, update: () => { if (mode === 'update') throw failure; return Promise.resolve(); } });
      assert.equal(await r.scope.hdEnsureServiceWorker(), null);
      assert.equal(r.scope.HD_SERVICE_WORKER_STATUS, 'error');
      assert.equal(r.warnings.length, 1); assert.equal(r.warnings[0][1], failure);
      if (instrumented) {
        const expected = ['register-before'];
        if (mode !== 'sync') expected.push('register-returned');
        if (mode === 'update') expected.push('await-resumed','registered-assigned');
        assert.deepEqual(r.stages(), [...expected, 'catch-entered','error-assigned']);
        assert.equal(r.records.at(-1).status, 'error');
      }
    }
  }
});

test('diagnostic delivery exceptions cannot change the original success or product error', async () => {
  for (const reject of [false, true]) {
    const failure = Error('product error'); let r;
    r = realm(() => reject ? Promise.reject(failure) : Promise.resolve(r.registration), { brokenDelivery: true });
    assert.equal(await r.scope.hdEnsureServiceWorker(), reject ? null : r.registration);
    if (reject) assert.equal(r.warnings[0][1], failure);
    else assert.equal(r.warnings.length, 0);
  }
});

async function fixture(t, options) {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'pwa-continuation-'));
  t.after(() => fsp.rm(dir, { recursive: true }));
  const page = new EventEmitter(), context = {}, frame = { url: () => 'https://fixture.invalid/' };
  page.context = () => context; page.mainFrame = () => frame;
  let reads = 0;
  page.evaluate = async () => { reads++; return { status: 'registering', statusType: 'string', document: { timeOrigin: 1000, at: 2, readyState: 'complete', url: frame.url(), mainFrame: true } }; };
  const info = { outputPath: name => path.join(dir, name), attach: async () => {} };
  const state = observeApplicationRegistration(page, info);
  const probe = observeRegistrationContinuation(page, info, state.identity, options);
  return { dir, page, state, probe, reads: () => reads, read: async () => JSON.parse(await fsp.readFile(info.outputPath('pwa-registration-continuation.json'), 'utf8')) };
}
const event = (stage, id = 1) => PREFIX + JSON.stringify({ stage, callId: id, registrationURL: './sw.js?v=580', scope: './', status: 'registering',
  document: { timeOrigin: 1000, at: id, readyState: 'complete', url: 'https://fixture.invalid/?private=NEVER' }, controller: null });

test('failed original poll preserves received continuation/server history without a post-failure evaluate', async t => {
  const f = await fixture(t);
  f.probe.transform(source);
  for (const stage of ['register-before','register-returned']) f.page.emit('console', { type: () => 'debug', text: () => event(stage) });
  const failure = Error('original registration wait failure');
  const poll = (read, options) => ({ async toBe(value) { assert.equal(options.timeout, 12000); assert.equal('intervals' in options, false); assert.equal(value, true); await read(); throw failure; } });
  try { await assert.rejects(waitForApplicationRegistration(f.page, f.state, poll), error => error === failure); }
  finally { await f.probe.finish(); }
  const report = await f.read();
  assert.equal(f.reads(), 1);
  assert.deepEqual(report.events.map(x => x.stage), ['register-before','register-returned']);
  assert.deepEqual(report.identity, f.state.identity);
  assert.ok(report.events.every(x => Number.isFinite(x.nodePerformanceMs) && x.document.timeOrigin === 1000));
  assert.equal(report.sources[0].originalSha256, transformed.originalSha256);
  assert.equal(JSON.stringify(report).includes('NEVER'), false);
  await f.probe.finish(); assert.equal(f.page.listenerCount('console'), 0);
});

test('event and server limits/drop, malformed messages, failure-close and cleanup remain distinguishable', async t => {
  const f = await fixture(t, { limit: 2, serverLimit: 2 });
  for (let i = 0; i < 5; i++) f.page.emit('console', { type: () => 'debug', text: () => event('register-before', i) });
  f.page.emit('console', { type: () => 'debug', text: () => PREFIX + 'invalid' });
  const req = new EventEmitter(); req.url = '/sw.js?v=580&private=NEVER';
  const res = new EventEmitter(); res.statusCode = 200; res.writableFinished = false; res.destroyed = false;
  f.probe.serverRequest(req, res); req.emit('aborted'); f.probe.beginCleanup(); res.emit('close');
  await f.state.finish(); await f.probe.finish();
  const report = await f.read();
  assert.equal(report.droppedEvents, 3); assert.equal(report.droppedServer, 1); assert.equal(report.invalidMessages, 1);
  assert.deepEqual(report.events.map(x => x.callId), [3, 4]);
  assert.deepEqual(report.server.map(x => x.stage), ['request-aborted','response-close-before-finish']);
  assert.equal(report.server.at(-1).cleanup, true);
  assert.equal(JSON.stringify(report).includes('NEVER'), false);
});

test('real HTTP server logs bare/versioned SW accepted/finish/normal close without consuming a Response', async t => {
  const f = await fixture(t), server = http.createServer((req, res) => { f.probe.serverRequest(req, res); res.writeHead(200); res.end('unchanged SW bytes'); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  for (const url of ['/sw.js', '/sw.js?v=580']) {
    const result = await new Promise((resolve, reject) => http.get(`http://127.0.0.1:${server.address().port}${url}`, res => {
      let body = ''; res.on('data', chunk => body += chunk); res.on('end', () => resolve(body));
    }).on('error', reject));
    assert.equal(result, 'unchanged SW bytes');
  }
  await f.state.finish(); await f.probe.finish();
  const report = await f.read();
  assert.deepEqual(report.server.map(x => x.stage), ['accepted','response-finish','response-close-after-finish','accepted','response-finish','response-close-after-finish']);
  assert.deepEqual(report.server.filter(x => x.stage === 'accepted').map(x => x.url), ['/sw.js','/sw.js?v=580']);
  assert.ok(report.server.filter(x => x.stage === 'response-finish').every(x => x.writableFinished));
});
