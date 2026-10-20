// Node-side evidence survives navigation; used only by focused reload cases.
const fs = require('node:fs/promises');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { reloadNativeProbe } = require('./reload-native-probe.cjs');
function observeReload(page, testInfo) {
  const startedAt = Date.now(), started = performance.now(), events = [], ids = new WeakMap(), sized = new WeakSet();
  let nextId = 0, closed = false, failed = false, reloadStarted = false, reloadPending = false, nativeStall = false, instrumentSW = false, resourceTiming = true, parserBoundary = false, parserLoadBoundary = 40, parserSingleScript = false;
  const native = [], nativeDocuments = new Map(), swSeen = new Set();
  let nativeDropped = 0;
  const workerInfo = w => w ? { url: safeUrl(w.url), state: String(w.state || '') } : null;
  const stages = new Set(['init','ready-state','native-dcl','window-load','pagehide','script-load','script-error','register-call','register-resolved','register-rejected','registration-initial','registration-controller','registration-stalled','registration-query-failed','controllerchange','updatefound','sw-state','stall-loading','sw-stage','probe-subscribe-failed','resource-complete','resource-observer','resource-summary','parser-boundary']);
  const nativeConsole = message => {
    const text = message.text();
    if (!text.startsWith('__HD_RELOAD_NATIVE__') || text.length > 16384) return;
    let data; try { data = JSON.parse(text.slice('__HD_RELOAD_NATIVE__'.length)); } catch { return; }

    if (!stages.has(data.stage) || typeof data.doc !== 'number') return;
    if (data.stage === 'parser-boundary' && !['script-'+parserLoadBoundary+'-load','loading-watchdog','dcl'].includes(data.reason)) return;
    const item = { ms: Math.round(performance.now() - started), stage: data.stage, doc: data.doc, at: data.at, readyState: data.readyState, lastScript: safeUrl(data.lastScript), url: safeUrl(data.url), controller: workerInfo(data.controller), worker: workerInfo(data.worker) };
    if (data.stage === 'resource-complete') {
      item.timing = {};
      for (const key of ['startTime','duration','workerStart','fetchStart','requestStart','responseStart','responseEnd','transferSize','encodedBodySize','decodedBodySize']) if (Number.isFinite(data.timing?.[key]) && data.timing[key] >= 0) item.timing[key] = data.timing[key];
      item.initiatorType = String(data.initiatorType || '').slice(0,32);
    }
    if (data.stage === 'resource-observer' && ['observing','unavailable','disabled'].includes(data.observerState)) item.observerState = data.observerState;
    if (data.stage === 'resource-summary') for (const key of ['resourceCount','resourceDropped','resourceBufferFull']) if (Number.isInteger(data[key]) && data[key] >= 0) item[key] = data[key];
    if (data.stage === 'parser-boundary') {
      item.reason = data.reason;
      item.scripts = (Array.isArray(data.scripts) ? data.scripts : []).slice(0,6).filter(s => ['quest-database.js','expedition-database.js','home-dashboard.js','update-manager.js','map-strategy-navigator.js','strategy-goals.js'].includes(s.name)).map(s => {
        const value = { name: s.name, present: s.present === true ? true : s.present === false && data.truncated === false ? false : null };
        if (Number.isInteger(s.matchCount) && s.matchCount >= 0 && s.matchCount <= 128) value.matchCount = s.matchCount;
        value.ordinals = (Array.isArray(s.ordinals) ? s.ordinals : []).filter(n=>Number.isInteger(n)&&n>0&&n<=128).slice(0,4);
        value.matchesTruncated = s.matchesTruncated === true;
        if (value.present) {
          value.url = safeUrl(s.url);
          if (Number.isInteger(s.ordinal) && s.ordinal > 0 && s.ordinal <= 128) value.ordinal = s.ordinal;
          for (const key of ['connected','async','defer','loadObserved','errorObserved']) value[key] = s[key] === true;
          value.type = ['','text/javascript','application/javascript','module'].includes(s.type) ? s.type : 'other';
        }
        return value;
      });
      item.scriptCount = Number.isInteger(data.scriptCount) ? Math.max(0,Math.min(128,data.scriptCount)) : null;
      item.truncated = data.truncated === true;
      if (parserBoundary && parserSingleScript && data.reason === 'loading-watchdog' && data.scriptCount === 1 && data.truncated === false && data.singleScript && typeof data.singleScript === 'object') {
        const s = data.singleScript, source = safeUrl(s.url);
        item.singleScript = { url: /^https?:/.test(source) ? source : '', type: ['','text/javascript','application/javascript','module'].includes(s.type) ? s.type : 'other' };
        for (const key of ['connected','async','defer','loadObserved','errorObserved']) item.singleScript[key] = s[key] === true;
      }
    }
    if (data.registration) item.registration = { scope: safeUrl(data.registration.scope), installing: workerInfo(data.registration.installing), waiting: workerInfo(data.registration.waiting), active: workerInfo(data.registration.active) };
    if (data.stage === 'sw-stage') {
      const w = data.sw || {}, key = w.worker + ':' + w.seq;
      if (swSeen.has(key)) return; swSeen.add(key);
      item.sw = { worker: w.worker, seq: w.seq, id: w.id, at: w.at, stage: String(w.stage || ''), url: safeUrl(w.url), status: w.status, hit: w.hit, source: ['network','cache','none','unknown'].includes(w.source) ? w.source : undefined, contentLength: /^\d+$/.test(w.contentLength || '') ? w.contentLength : undefined };
    }
    const summary = nativeDocuments.get(item.doc) || { doc: item.doc, scriptLoads: 0, scriptErrors: 0 };
    if (item.stage === 'parser-boundary' && item.scripts) {
      summary.parserBoundaries = summary.parserBoundaries || [];
      summary.parserBoundaryLimit = 3;
      summary.parserBoundaryDropped = summary.parserBoundaryDropped || 0;
      if (summary.parserBoundaries.some(b=>b.reason===item.reason) || summary.parserBoundaries.length >= 3) summary.parserBoundaryDropped++;
      else summary.parserBoundaries.push({ ms: item.ms, at: item.at, reason: item.reason, scripts: item.scripts, scriptCount: item.scriptCount, truncated: item.truncated, ...(item.singleScript ? { singleScript: item.singleScript } : {}) });
    }
    if (item.stage === 'resource-complete') {
      summary.resources = summary.resources || [];
      if (summary.resources.length < 128) summary.resources.push({ ms: item.ms, at: item.at, url: item.url, timing: item.timing, initiatorType: item.initiatorType });
    }
    if (item.observerState) summary.resourceObserver = item.observerState;
    if (item.stage === 'resource-summary') {
      summary.resourceStatsAt = item.at;
      for (const key of ['resourceCount','resourceDropped','resourceBufferFull']) summary[key] = item[key];
    }
    Object.assign(summary, { readyState: item.readyState, lastScript: item.lastScript, controller: item.controller });
    if (item.registration) summary.registration = item.registration;
    if (item.stage === 'script-load') summary.scriptLoads++;
    if (item.stage === 'script-error') summary.scriptErrors++;
    if (item.stage === 'native-dcl') summary.dclAt = item.at;
    if (item.stage === 'stall-loading') { nativeStall = true; summary.stallAt = item.at; }
    nativeDocuments.set(item.doc, summary);
    native.push(item); if (native.length > 1024) { native.shift(); nativeDropped++; }
  };
  const record = (kind, data = {}) => { if (!closed) events.push({ ms: Math.round(performance.now() - started), kind, ...data }); };
  const requestId = r => { if (!r) return null; if (!ids.has(r)) ids.set(r, ++nextId); return ids.get(r); };
  // Do not retain credentials, arbitrary query strings, request headers or bodies.
  const safeUrl = url => { try { const u = new URL(url); u.username = ''; u.password = ''; u.hash = ''; const v = u.searchParams.get('v'); u.search = ''; if (['127.0.0.1','localhost'].includes(u.hostname) && /^\d+$/.test(v || '')) u.searchParams.set('v',v); return u.href; } catch { return ''; } };
  const requestInfo = r => {
    let owner = 'unknown';
    try { owner = r.serviceWorker?.() ? 'service-worker' : r.frame?.() ? 'frame' : 'unknown'; } catch { /* WebKit worker ownership may be unavailable. */ }
    return { id: requestId(r), url: safeUrl(r.url()), owner };
  };
  const finished = (kind, request) => {
    record(kind, { ...requestInfo(request), timing: request.timing?.() || null });
    // Never wait for a blocked browser to finish collecting diagnostics.
    if (reloadStarted && request.sizes && observedUrl(request.url()) && !sized.has(request)) {
      sized.add(request);
      request.sizes().then(sizes => record(kind + '-sizes', { ...requestInfo(request), sizes })).catch(() => record(kind + '-sizes-unavailable', { ...requestInfo(request) }));
    }
  };
  const handlers = {
    request: request => record('request', { ...requestInfo(request), type: request.resourceType(), navigation: request.isNavigationRequest() }),
    requestfinished: request => finished('requestfinished', request),
    requestfailed: request => record('requestfailed', { ...requestInfo(request), failure: request.failure() }),
    response: response => record('response', { id: requestId(response.request?.()), url: safeUrl(response.url()), status: response.status(), fromServiceWorker: response.fromServiceWorker(), contentLength: response.headers?.()['content-length'] || '' }),
    framenavigated: frame => { if (frame === page.mainFrame()) record('navigation', { url: safeUrl(frame.url()) }); },
    domcontentloaded: () => record('domcontentloaded'),
    load: () => record('load'),
    console: nativeConsole,
    pageerror: error => record('pageerror', { name: error.name, message: error.message, stack: error.stack || '' }),
  };
  // Page events can miss requests forwarded by a Service Worker. Limit the
  // context view to public upstream checks and local document/scripts. Sizes
  // are fetched once per request, never for unrelated assets.
  const context = page.context();
  const observedUrl = url => {
    try {
      const value = new URL(url);
      return /^https:\/\/api\.github\.com\/repos\/(Tibowl\/api_start2|poooi\/poi)\/commits\//i.test(url) || ['127.0.0.1','localhost'].includes(value.hostname) && (value.pathname.endsWith('.js') || value.pathname === '/');
    } catch { return false; }
  };
  const contextHandlers = {
    request: request => { if (observedUrl(request.url())) record('context-request', { ...requestInfo(request), type: request.resourceType() }); },
    requestfinished: request => { if (observedUrl(request.url())) finished('context-requestfinished', request); },
    requestfailed: request => { if (observedUrl(request.url())) record('context-requestfailed', { ...requestInfo(request), failure: request.failure() }); },
    response: response => { if (observedUrl(response.url())) record('context-response', { id: requestId(response.request?.()), url: safeUrl(response.url()), status: response.status(), fromServiceWorker: response.fromServiceWorker(), allowOrigin: response.headers()['access-control-allow-origin'] || '', contentLength: response.headers()['content-length'] || '' }); },
  };
  for (const [name, handler] of Object.entries(contextHandlers)) context.on(name, handler);
  for (const [name, handler] of Object.entries(handlers)) page.on(name, handler);
  const retain = async () => {
    // No page.evaluate on failure: a blocked page must not delay artifact retention.
    record('capture-end');
    for (const [name, handler] of Object.entries(handlers)) page.off(name, handler);
    for (const [name, handler] of Object.entries(contextHandlers)) context.off(name, handler);
    closed = true;
    const retainNative = !!testInfo.project?.metadata?.keepNative || failed && (reloadPending || nativeStall);
    const body = JSON.stringify({ test: testInfo.title, startedAt, events, instrumentSW, profile: { swSource: instrumentSW ? 'test-instrumented' : 'unmodified', serviceWorkers: testInfo.project?.use?.serviceWorkers || 'allow', resourceTiming, parserBoundary, parserLoadBoundary, parserSingleScript }, nativeSummary: [...nativeDocuments.values()], nativeDetailsReason: retainNative ? failed && (reloadPending || nativeStall) ? 'reload-wait-failure' : 'diagnostic-control' : 'summary-only', nativeDropped, nativeEvents: retainNative ? native : [] }, null, 2);
    const target = testInfo.outputPath('reload-navigation-evidence.json');
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, body);
    await testInfo.attach('reload-navigation-evidence', { path: target, contentType: 'application/json' });
    return { events };
  };
  retain.mark = phase => {
    if (phase === 'reload-start' || phase === 'controlled-navigation-start') { reloadStarted = true; reloadPending = true; }
    if (phase === 'reload-domcontentloaded' || phase === 'controlled-domcontentloaded') reloadPending = false;
    record('phase', { phase });
  };
  retain.timeline = () => events.slice();
  retain.nativeTimeline = () => native.slice();
  retain.nativeSummary = () => [...nativeDocuments.values()];
  retain.failure = () => { failed = true; };
  retain.errors = () => events.filter(event => event.kind === 'pageerror');
  retain.installNativeEvents = async (options = {}) => {
    instrumentSW = !!options.instrumentSW;
    resourceTiming = (options.resourceTiming ?? testInfo.project?.metadata?.resourceTiming) !== false;
    parserBoundary = !!options.parserBoundary;
    parserLoadBoundary = options.parserLoadBoundary === 42 ? 42 : 40;
    parserSingleScript = !!options.parserSingleScript;
    await page.addInitScript(reloadNativeProbe, { instrumentSW, resourceTiming, parserBoundary, parserLoadBoundary, parserSingleScript });
  };
  return retain;
}
module.exports = { observeReload };
