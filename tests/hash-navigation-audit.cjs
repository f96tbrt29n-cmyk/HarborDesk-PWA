'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { performance } = require('node:perf_hooks');
const PREFIX = 'HD_HASH_ENTRY ';
const ANCHOR = "window.addEventListener('hashchange',()=>{const id=hdWSInitialAnchorId();if(id){hdWSMarkUserNavigation();setTimeout(()=>hdWSOpenAnchorId(id,true),0)}});";
const sha256 = value => createHash('sha256').update(value).digest('hex');

// Only this test's served copy changes. The record is INSIDE the real handler,
// before its original first statement. No extra listener, timer or API wrapper.
function instrumentHashSource(source, limit = 16) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 32) throw Error('invalid hash entry limit');
  if (source.split(ANCHOR).length !== 2) throw Error('hash handler source anchor changed');
  const injected = `{
 const audit={limit:${limit},attempted:0,emitted:0,dropped:0,errors:0};
 const safe=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{0,96}$/.test(value)?value:'<redacted>';
 const hash=value=>{try{const h=new URL(value).hash;return !h?'':/^#[A-Za-z0-9_-]{1,96}$/.test(h)?h:'<redacted>'}catch{return '<unavailable>'}};
 window.__HD_HASH_ENTRY_STATUS__=()=>({...audit,atCapacity:audit.emitted>=audit.limit,timeOrigin:performance.timeOrigin});
 function record(stage,event){
  const sequence=++audit.attempted;
  if(audit.emitted>=audit.limit){audit.dropped++;return}
  try{
   const state=window.hdWSState,group=state?.group||'';
   console.debug(${JSON.stringify(PREFIX)}+JSON.stringify({stage,sequence,
    document:{id:'timeOrigin:'+performance.timeOrigin,timeOrigin:performance.timeOrigin,at:performance.now(),readyState:document.readyState},
    oldHash:stage==='entry'?hash(event.oldURL):null,newHash:stage==='entry'?hash(event.newURL):null,currentHash:hash(location.href),
    group:safe(group),section:safe(state?.sections?.[group]||''),guideSection:safe(state?.sections?.guide||''),
    userEpoch:Number(window.__HD_WORKSPACE_USER_NAV_EPOCH)||0}));
   audit.emitted++;
  }catch{audit.errors++}
 }
 ${ANCHOR.replace("()=>{const id=", "(event)=>{record('entry',event);const id=")}
 record('installed');
}`;
  const served = source.replace(ANCHOR, injected);
  return { source: served, originalSha256: sha256(source), servedSha256: sha256(served) };
}

// Each branch is one pre-existing evaluate from the test. No extra page read is
// added after failure; the original value/exception is kept for its assertion.
function readHashObservation(kind) {
  const readStartedAt = performance.now();
  let value;
  if (kind === 'open') {
    window.hdFSOpen();
    value = { section: window.hdWSState?.sections?.guide || '', userEpoch: Number(window.__HD_WORKSPACE_USER_NAV_EPOCH) || 0 };
  } else if (kind === 'navigate') {
    location.hash = '#guide';
  } else if (kind === 'poll') {
    value = { section: window.hdWSState?.sections?.guide || '', userEpoch: Number(window.__HD_WORKSPACE_USER_NAV_EPOCH) || 0 };
  } else if (kind === 'after') {
    const fleet = document.getElementById('hdFleetSuggester');
    value = { section: window.hdWSState?.sections?.guide || '',
      fleetVisible: !!fleet && !fleet.hidden && !fleet.classList.contains('hd-ws-hidden') };
  } else throw Error('unknown hash observation');
  let diagnostic;
  try { diagnostic = window.__HD_HASH_ENTRY_STATUS__?.() || { installation: 'not-observed' }; }
  catch { diagnostic = { captureFailure: true }; }
  return { value, diagnostic, document: { timeOrigin: performance.timeOrigin, readStartedAt, readFinishedAt: performance.now() } };
}

function createHashEvidence({ eventLimit = 32, sampleLimit = 32 } = {}) {
  if (![eventLimit, sampleLimit].every(n => Number.isInteger(n) && n > 0 && n <= 64)) throw Error('invalid hash evidence limit');
  const report = { schema: 1, clock: 'Node epoch/performance and browser document clocks are separate',
    documentIdentity: 'timeOrigin correlation, not a native document ID',
    limits: { events: eventLimit, samples: sampleLimit, policy: 'retain earliest; count dropped' },
    events: [], samples: [], sources: [], droppedEvents: 0, droppedSamples: 0, invalidMessages: 0,
    sourceFailures: 0, installation: 'not-observed', startedNodeEpochMs: Date.now() };
  let sequence = 0;
  const now = () => ({ nodeEpochMs: Date.now(), nodePerformanceMs: performance.now() });
  const append = (key, value, limit, dropped) => { if (report[key].length < limit) report[key].push(value); else report[dropped]++; };
  return {
    report,
    receive(text) {
      if (!text.startsWith(PREFIX)) return;
      try {
        if (text.length > 2048) throw Error('oversize');
        const e = JSON.parse(text.slice(PREFIX.length));
        const safe = s => typeof s === 'string' && /^(?:[A-Za-z0-9_-]{0,96}|<redacted>)$/.test(s);
        const hash = s => s === null || typeof s === 'string' && /^(?:|#[A-Za-z0-9_-]{1,96}|<redacted>|<unavailable>)$/.test(s);
        if (!['installed','entry'].includes(e.stage) || !Number.isInteger(e.sequence) || e.sequence < 1 ||
            !Number.isFinite(e.document?.timeOrigin) || !Number.isFinite(e.document?.at) ||
            e.document.id !== 'timeOrigin:' + e.document.timeOrigin ||
            ![e.oldHash,e.newHash,e.currentHash].every(hash) || ![e.group,e.section,e.guideSection].every(safe) || !Number.isFinite(e.userEpoch)) throw Error('invalid event');
        append('events', { ...now(), stage: e.stage, sequence: e.sequence,
          document: { id: e.document.id, timeOrigin: e.document.timeOrigin, at: e.document.at,
            readyState: ['loading','interactive','complete'].includes(e.document.readyState) ? e.document.readyState : 'unknown' },
          oldHash: e.oldHash, newHash: e.newHash, currentHash: e.currentHash,
          group: e.group, section: e.section, guideSection: e.guideSection, userEpoch: e.userEpoch }, eventLimit, 'droppedEvents');
        if (e.stage === 'installed') report.installation = 'handler-installed';
      } catch { report.invalidMessages++; }
    },
    async sample(stage, read) {
      const sample = { sequence: ++sequence, stage, ...now() };
      append('samples', sample, sampleLimit, 'droppedSamples');
      try {
        const result = await read();
        Object.assign(sample, { received: now(), value: result.value, diagnostic: result.diagnostic, document: result.document });
        return result.value;
      } catch (error) { sample.evaluateError = true; sample.received = now(); throw error; }
    },
    async save(testInfo) {
      report.finishedNodeEpochMs = Date.now();
      const file = testInfo.outputPath('hash-navigation-audit.json');
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(report, null, 2) + '\n');
      await testInfo.attach('hash-navigation-audit', { path: file, contentType: 'application/json' });
    }
  };
}

async function observeHashNavigation(page, testInfo) {
  const evidence = createHashEvidence();
  const listener = message => evidence.receive(message.text());
  page.on('console', listener);
  await page.route('**/workspace-tabs.js*', async route => {
    const url = new URL(route.request().url());
    if (!['127.0.0.1','localhost'].includes(url.hostname) || url.pathname !== '/workspace-tabs.js') return route.fallback();
    const response = await route.fetch();
    const original = await response.text();
    let body = original;
    try {
      const transformed = instrumentHashSource(original);
      body = transformed.source;
      evidence.report.sources.push({ originalSha256: transformed.originalSha256, servedSha256: transformed.servedSha256 });
      await fs.writeFile(testInfo.outputPath('hash-workspace-original.js'), original);
      await fs.writeFile(testInfo.outputPath('hash-workspace-served.js'), body);
    } catch { evidence.report.sourceFailures++; }
    // A changed body must not reuse the original byte length/encoding header.
    const headers = { ...response.headers() }; delete headers['content-length']; delete headers['content-encoding'];
    await route.fulfill({ response, headers, body });
  });
  return { sample: evidence.sample, async finish(failed = false) {
    page.off('console', listener);
    try { await evidence.save(testInfo); }
    catch (error) { if (!failed) throw error; console.error('hash evidence could not be saved', error.name); }
  } };
}
module.exports = { PREFIX, ANCHOR, instrumentHashSource, readHashObservation, createHashEvidence, observeHashNavigation };
