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
const { instrumentRegistrationSource } = require('./pwa-registration-continuation.cjs');
const { initialUpdateSource } = require('./initial-update-fixture.cjs');
const { createApplicationUpdateComparison } = require('./pwa-initial-update-comparison.cjs');
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

test('full-app delivery changes only initial policy, keeps the full update UI/timers and following source', () => {
  const instrumented = instrumentRegistrationSource(source).source;
  const initial = initialUpdateSource(instrumented, 'initial', false);
  const suppressed = initialUpdateSource(instrumented, 'initial', true);
  assert.equal(initial.replace('const __hdSuppressExplicitUpdate=false;', 'const __hdSuppressExplicitUpdate=true;'), suppressed);
  for (const code of [initial, suppressed, initialUpdateSource(instrumented, 'reloaded', false)]) {
    assert.equal(code.slice(code.indexOf('const HD_RELEASE_META_RAW=')), source.slice(source.indexOf('const HD_RELEASE_META_RAW=')));
    for (const token of [/\.then\(/g,/\.catch\(/g,/\.finally\(/g,/setTimeout\(/g,/setInterval\(/g,/\.update\(/g,/\.register\(/g,/waitUntil\(/g]) assert.equal([...code.matchAll(token)].length, [...source.matchAll(token)].length);
  }
  assert.equal(control.sources.initialEntrySHA256, '193a19d5774c9cb95b1a7589876781065dfddaba7a5ff6a682e9bda092c05cc0');
  assert.equal(comparison.sources.initialEntrySHA256, '3ba6281836337222b57c99d96de27d448b3192387928df9c804b29433a8ceb1d');
  assert.throws(() => initialUpdateSource(instrumented, 'unknown', false), /invalid/);
  assert.throws(() => initialUpdateSource(instrumented.replace('    reg.update().catch(()=>{});', ''), 'initial', true), /anchor/);
});

test('real-app fixture confirms preparation from received history without extra reads or waits; following update stays enabled', async t => {
  for (const suppress of [false,true]) {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pwa-app-update-'));
    t.after(() => fs.rm(dir, { recursive:true }));
    let timeline = [];
    const probe = { transform: text => instrumentRegistrationSource(text).source, timeline: () => timeline.slice() };
    const info = { project:{name:'isolated-contract'}, outputPath:(...names) => path.join(dir,...names) };
    const fixture = createApplicationUpdateComparison(probe, info, suppress);
    const response = new EventEmitter();response.writableFinished = false;
    const served = fixture.transform(source, fixture.phase(), response);
    const entry = text => text.slice(0,text.indexOf('const HD_RELEASE_META_RAW=')) + "\nwindow.addEventListener('load',()=>hdEnsureServiceWorker());";
    const initial = await run(entry(served));
    timeline = initial.events.map(text => JSON.parse(text.slice(text.indexOf('{'))));
    assert.equal(initial.updateCalls.length, suppress ? 0 : 1);
    fixture.beforeOriginalReload(); assert.equal(fixture.phase(), 'reloaded');
    const followingSource = fixture.transform(source, fixture.phase(), response);
    const following = await run(entry(followingSource));
    assert.equal(following.updateCalls.length, 1); assert.match(followingSource, /const __hdSuppressExplicitUpdate=false;/);
    timeline.push(...following.events.map(text => JSON.parse(text.slice(text.indexOf('{')))));
    response.writableFinished = true;response.emit('finish');response.emit('close');
    fixture.passed();await fixture.finish();
    const report = JSON.parse(await fs.readFile(path.join(dir,'pwa-app-update-comparison.json'),'utf8'));
    assert.equal(report.initialPreparation.confirmed,true);
    assert.equal(report.initialPreparation.boundary.boundaries.at(-1).stage,suppress?'explicit-update-suppressed':'explicit-update-expression-returned');
    assert.equal(report.originalTestPassed,true);assert.equal(report.droppedMarks,0);assert.equal(report.droppedDeliveries,0);
    assert.ok(report.followingBoundaries.some(e=>e.stage==='explicit-update-expression-returned'));
    assert.deepEqual(report.deliveries.filter(e=>e.phase==='initial').map(e=>e.stage),['body-prepared','response-finish','response-close-after-finish']);
    const files = await fs.readdir(path.join(dir,'pwa-update-sources'));
    assert.equal(files.length,3);assert.equal(await fs.readFile(path.join(dir,'pwa-update-sources','product-update-manager.js'),'utf8'),source);
    initial.release();following.release();
  }
});

test('missing preparation is not fabricated; failure history/source/drop are retained without post-failure evaluation', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pwa-app-failure-'));t.after(()=>fs.rm(dir,{recursive:true}));
  const probe = { transform: text=>instrumentRegistrationSource(text).source, timeline:()=>[] };
  const info = {outputPath:(...names)=>path.join(dir,...names)};
  assert.throws(()=>createApplicationUpdateComparison(null,info,true),/required/);
  const fixture = createApplicationUpdateComparison(probe,info,true);
  for(let i=0;i<35;i++)fixture.transform(source,'initial');
  fixture.beforeOriginalReload();fixture.mark('registration-wait-start');await fixture.finish();await fixture.finish();
  const report = JSON.parse(await fs.readFile(path.join(dir,'pwa-app-update-comparison.json'),'utf8'));
  assert.equal(report.initialPreparation.confirmed,false);assert.equal(report.originalTestPassed,false);
  assert.equal(report.lastStage,'registration-wait-start');assert.equal(report.deliveries.length,32);assert.equal(report.droppedDeliveries,3);
  assert.deepEqual(report.followingBoundaries,[]);
});

test('real-app fixture does not catch source errors or alter the original PWA preparation, deadlines and assertions', () => {
  const fixture = createApplicationUpdateComparison({transform:()=>{throw Error('original transform failure')},timeline:()=>[]},{outputPath:()=>''},false);
  assert.throws(()=>fixture.transform(source,'initial'),/original transform failure/);
  const current = require('node:fs').readFileSync(path.join(__dirname,'pwa.spec.js'),'utf8');
  assert.ok(current.includes("await waitForApplicationRegistration(page, registrationEvidence);"));
  assert.ok(current.includes("await expect.poll(async () => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), { timeout: 20000 }).toBeGreaterThan(0);"));
  // Keep the original two shared checks, plus the storage-only post-load check.
  assert.equal([...current.matchAll(/expect\(errors,/g)].length,3);
  const sharedChecks=current.slice(0,current.indexOf("  mark('final-errors-zero');"));
  assert.equal([...sharedChecks.matchAll(/expect\(errors,/g)].length,2);
  assert.ok(current.includes("await expect.poll(() => page.evaluate(() => Object.values(window.HD_MODULE_STATUS || {}).filter(x => x !== 'ok').length)).toBe(0);"));
  assert.equal(current.includes('test.setTimeout'),false);
  assert.equal(current.includes('storageState('),false);
});

const initialGateEvents = () => ['await-resumed','registered-assigned','explicit-update-site','explicit-update-expression-returned'].map(stage => ({ stage, callId:1,
  document:{timeOrigin:1000,at:2,readyState:'complete',url:'http://fixture.invalid/'},updateControl:{phase:'initial',suppress:false} }));

test('isolated initial gate waits only on received current-source boundaries with the original12s/default poll', async t => {
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'pwa-initial-gate-'));t.after(()=>fs.rm(dir,{recursive:true}));
  let timeline=[],reads=0;
  const probe={timeline:()=>{reads++;return timeline.slice()}};
  const fixture=createApplicationUpdateComparison(probe,{outputPath:(...names)=>path.join(dir,...names)},false);
  const poll=(read,options)=>({async toBe(expected){
    assert.equal(expected,true);assert.equal(options.timeout,12000);assert.equal('intervals' in options,false);
    assert.equal(read(),false);
    timeline=initialGateEvents().slice(0,3);assert.equal(read(),false,'site is not the update-expression return');
    timeline=initialGateEvents();assert.equal(read(),true);
  }});
  await fixture.waitForInitialContinuation(poll);
  assert.equal(fixture.phase(),'initial','gate must not reload or change delivery phase');assert.equal(reads,3);
  fixture.beforeOriginalReload();
  await fixture.finish();const report=JSON.parse(await fs.readFile(path.join(dir,'pwa-app-update-comparison.json'),'utf8'));
  assert.equal(report.initialGate.outcome,'passed');assert.equal(report.initialGate.boundary.boundaries.at(-1).stage,'explicit-update-expression-returned');
  assert.equal(report.initialPreparation.confirmed,true);assert.match(report.initialPreparation.rule,/changed isolated preparation/);
  assert.equal(report.originalTestPassed,false);
});

test('failed isolated initial gate preserves original error/history and does not enter reload or read after failure', async t => {
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'pwa-initial-gate-fail-'));t.after(()=>fs.rm(dir,{recursive:true}));
  let reads=0;const probe={timeline:()=>{reads++;return []}};
  const fixture=createApplicationUpdateComparison(probe,{outputPath:(...names)=>path.join(dir,...names)},false);
  const failure=Error('original gate deadline');
  const poll=read=>({async toBe(){assert.equal(read(),false);throw failure}});
  await assert.rejects(fixture.waitForInitialContinuation(poll),e=>e===failure);
  assert.equal(fixture.phase(),'initial');await fixture.finish();
  const report=JSON.parse(await fs.readFile(path.join(dir,'pwa-app-update-comparison.json'),'utf8'));
  assert.equal(report.initialGate.outcome,'failed');assert.equal(report.lastStage,'initial-continuation-gate-failed');
  assert.equal(report.initialPreparation,null);assert.equal(report.marks.some(e=>e.stage==='original-reload-request'),false);
  assert.equal(reads,2,'one poll plus final received-history copy only, no browser/native read');
});

test('initial gate cannot silently resume the completed update-suppression comparison', async () => {
  let polls=0;
  const fixture=createApplicationUpdateComparison({timeline:()=>[]},{outputPath:()=>''},true);
  await assert.rejects(fixture.waitForInitialContinuation(()=>{polls++}),/current update enabled/);
  assert.equal(polls,0);assert.equal(fixture.phase(),'initial');
});
