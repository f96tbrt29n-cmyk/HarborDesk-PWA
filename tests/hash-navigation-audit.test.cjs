'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { PREFIX, ANCHOR, instrumentHashSource, readHashObservation, createHashEvidence, observeHashNavigation } = require('./hash-navigation-audit.cjs');
const source = fs.readFileSync(path.join(__dirname, '../workspace-tabs.js'), 'utf8');

function realm({ instrumented = true, limit = 16, brokenConsole = false, productFailure = '' } = {}) {
  const order = [], records = [], timers = []; let handler;
  const failure = Error('original product failure');
  const scope = { URL, performance: { timeOrigin: 1234, now: () => 10 }, document: { readyState: 'complete' },
    location: { href: 'https://fixture.invalid/?credential=NEVER#guide', hash: '#guide' },
    hdWSState: { group: 'guide', sections: { guide: 'hdFleetSuggester' } },
    console: { debug: text => { if (brokenConsole) throw Error('diagnostic only'); records.push(text); } },
    addEventListener: (name, callback) => { assert.equal(name, 'hashchange'); handler = callback; },
    hdWSInitialAnchorId() { order.push('read-current-hash'); if (productFailure === 'read') throw failure; return scope.location.hash.slice(1); },
    hdWSMarkUserNavigation() { order.push('mark-user'); if (productFailure === 'mark') throw failure; scope.__HD_WORKSPACE_USER_NAV_EPOCH = 1; },
    hdWSOpenAnchorId(...args) { order.push(['open', ...args]); if (productFailure === 'open') throw failure; return true; },
    setTimeout(callback, ms) { order.push(['schedule', ms]); if (productFailure === 'schedule') throw failure; timers.push(callback); return 7; }
  };
  scope.window = scope;
  vm.runInNewContext(instrumented ? instrumentHashSource(ANCHOR, limit).source : ANCHOR, scope);
  return { scope, order, records, timers, handler, failure };
}

test('only the actual handler gains one entry record; product source and existing operations stay unchanged', () => {
  const changed = instrumentHashSource(source);
  assert.notEqual(changed.originalSha256, changed.servedSha256);
  assert.equal(fs.readFileSync(path.join(__dirname, '../workspace-tabs.js'), 'utf8'), source);
  assert.throws(() => instrumentHashSource(source + ANCHOR), /anchor changed/);
  for (const token of ['setTimeout(', 'addEventListener(', 'hdWSInitialAnchorId()', 'hdWSMarkUserNavigation()', 'hdWSOpenAnchorId(id,true)']) {
    assert.equal(changed.source.split(token).length, source.split(token).length, token);
  }
  const prefix = source.slice(0, source.indexOf(ANCHOR)), suffix = source.slice(source.indexOf(ANCHOR) + ANCHOR.length);
  assert.ok(changed.source.startsWith(prefix) && changed.source.endsWith(suffix));
  assert.equal(/\.then\(|\.catch\(|waitUntil|fetch\(|Storage\.|setInterval\(/.test(instrumentHashSource(ANCHOR).source), false);
});

test('handler return, original ordering and deferred operation remain the same, including product throws', () => {
  for (const productFailure of ['', 'read', 'mark', 'schedule', 'open']) {
    const plain = realm({ instrumented: false, productFailure }), probed = realm({ productFailure });
    for (const r of [plain, probed]) {
      const event = { oldURL: 'https://fixture.invalid/#hdFleetSuggester', newURL: 'https://fixture.invalid/#guide' };
      if (['read','mark','schedule'].includes(productFailure)) assert.throws(() => r.handler(event), e => e === r.failure);
      else {
        assert.equal(r.handler(event), undefined);
        assert.equal(r.order.some(x => Array.isArray(x) && x[0] === 'open'), false);
        if (productFailure === 'open') assert.throws(() => r.timers[0](), e => e === r.failure);
        else r.timers[0]();
      }
    }
    assert.deepEqual(probed.order, plain.order);
  }
});

test('entry captures event/current mismatch BEFORE the original handler reads or increments; only hashes are retained', () => {
  const r = realm(); r.scope.location.hash = '#hdFleetSuggester'; r.scope.location.href = 'https://fixture.invalid/?NEVER#hdFleetSuggester';
  r.handler({ oldURL: 'https://fixture.invalid/?NEVER#hdFleetSuggester', newURL: 'https://fixture.invalid/?NEVER#guide' });
  const events = r.records.map(s => JSON.parse(s.slice(PREFIX.length)));
  assert.deepEqual(events.map(e => e.stage), ['installed', 'entry']);
  assert.equal(events[1].newHash, '#guide'); assert.equal(events[1].currentHash, '#hdFleetSuggester');
  assert.equal(events[1].userEpoch, 0); assert.equal(r.scope.__HD_WORKSPACE_USER_NAV_EPOCH, 1);
  assert.equal(JSON.stringify(events).includes('NEVER'), false); assert.equal(JSON.stringify(events).includes('https:'), false);
  r.handler({ oldURL: 'https://fixture.invalid/#kcimport=NEVER', newURL: 'https://fixture.invalid/#guide?NEVER' });
  assert.equal(r.records.at(-1).includes('NEVER'), false);
});

test('no hash event is distinct from installation; browser limit/drop/capture errors do not change the handler', () => {
  const r = realm({ limit: 2 }); assert.equal(r.records.length, 1);
  for (let n = 0; n < 4; n++) r.handler({ oldURL: 'https://x/#home', newURL: 'https://x/#guide' });
  const stats = r.scope.__HD_HASH_ENTRY_STATUS__();
  assert.equal(stats.emitted, 2); assert.equal(stats.dropped, 3); assert.equal(stats.atCapacity, true); assert.equal(r.timers.length, 4);
  const broken = realm({ brokenConsole: true }); broken.handler({});
  assert.equal(broken.scope.__HD_HASH_ENTRY_STATUS__().errors, 2); assert.equal(broken.timers.length, 1);
  const getter = realm(); getter.handler({ get oldURL() { throw Error('diagnostic read'); } });
  assert.equal(getter.scope.__HD_HASH_ENTRY_STATUS__().errors, 1); assert.equal(getter.timers.length, 1);
});

test('the same existing evaluate actions/results are sampled; snapshot failure cannot change the operation or its throw', () => {
  const r = realm(); let opens = 0, extraReads = 0;
  r.scope.hdFSOpen = () => { opens++; };
  r.scope.document.getElementById = () => ({ hidden: false, classList: { contains: () => false } });
  const sample = kind => vm.runInNewContext('(' + readHashObservation.toString() + ')(' + JSON.stringify(kind) + ')', r.scope);
  assert.equal(sample('open').value.section, 'hdFleetSuggester'); assert.equal(opens, 1);
  assert.equal(sample('navigate').value, undefined); assert.equal(r.scope.location.hash, '#guide');
  assert.equal(sample('poll').value.userEpoch, 0); assert.equal(sample('after').value.fleetVisible, true);
  r.scope.__HD_HASH_ENTRY_STATUS__ = () => { extraReads++; throw Error('diagnostic snapshot'); };
  assert.equal(sample('poll').diagnostic.captureFailure, true); assert.equal(extraReads, 1);
  const failure = Error('open failed'); r.scope.hdFSOpen = () => { throw failure; };
  assert.throws(() => sample('open'), e => e === failure); assert.equal(extraReads, 1);
});

test('bounded Node receive/poll history preserves original exceptions and writes collected JSON after failure without more reads', async () => {
  const evidence = createHashEvidence({ eventLimit: 1, sampleLimit: 2 }), r = realm();
  for (const text of r.records) evidence.receive(text);
  const hostile = JSON.parse(r.records[0].slice(PREFIX.length)); hostile.extraURL = 'https://NEVER.invalid/';
  evidence.receive(PREFIX + JSON.stringify(hostile)); assert.equal(evidence.report.droppedEvents, 1);
  evidence.receive(PREFIX + '{bad'); assert.equal(evidence.report.invalidMessages, 1);
  assert.equal(JSON.stringify(evidence.report).includes('NEVER'), false);
  let reads = 0; const failure = Error('original evaluate failure');
  const read = async () => { reads++; return { value: { section: 'guide', userEpoch: 1 }, diagnostic: { emitted: 1 } }; };
  assert.equal((await evidence.sample('poll', read)).section, 'guide');
  await assert.rejects(evidence.sample('poll', async () => { reads++; throw failure; }), e => e === failure);
  await evidence.sample('poll', read); assert.equal(evidence.report.droppedSamples, 1);
  assert.equal(evidence.report.samples[1].evaluateError, true);
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'hash-audit-contract-'));
  try {
    await evidence.save({ outputPath: file => path.join(dir, file), attach: async () => {} });
    assert.equal(reads, 3); const saved = JSON.parse(await fsp.readFile(path.join(dir, 'hash-navigation-audit.json'), 'utf8'));
    assert.equal(saved.samples.length, 2); assert.equal(saved.installation, 'handler-installed');
  } finally { await fsp.rm(dir, { recursive: true }); }
});

test('fixture only intercepts the target module and saves source/JSON; finish never evaluates the page', async () => {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'hash-route-contract-')); let handler, fetches = 0, fulfilled;
  const listeners = {};
  try {
    const page = { on: (n, f) => { listeners[n] = f; }, off: n => { delete listeners[n]; },
      route: async (pattern, f) => { assert.equal(pattern, '**/workspace-tabs.js*'); handler = f; },
      evaluate: () => { throw Error('extra read forbidden'); } };
    const audit = await observeHashNavigation(page, { outputPath: file => path.join(dir, file), attach: async () => {} });
    let fallback = false;
    await handler({ request: () => ({ url: () => 'https://external.invalid/workspace-tabs.js' }), fallback: async () => { fallback = true; } });
    assert.equal(fallback, true);
    const response = { text: async () => source, headers: () => ({ 'content-length': String(source.length), 'content-type': 'text/javascript' }) };
    await handler({ request: () => ({ url: () => 'http://127.0.0.1:4173/workspace-tabs.js?v=580' }), fetch: async () => { fetches++; return response; }, fulfill: async v => { fulfilled = v; } });
    assert.equal(fetches, 1); assert.equal(fulfilled.response, response); assert.equal(fulfilled.headers['content-length'], undefined);
    assert.equal(fulfilled.body, instrumentHashSource(source).source);
    await assert.rejects(audit.sample('poll', async () => { throw Error('failed predicate'); }));
    await audit.finish(true);
    assert.equal(JSON.parse(await fsp.readFile(path.join(dir, 'hash-navigation-audit.json'), 'utf8')).samples[0].evaluateError, true);
    assert.equal(await fsp.readFile(path.join(dir, 'hash-workspace-original.js'), 'utf8'), source);
  } finally { await fsp.rm(dir, { recursive: true }); }
});
