// Node-side evidence survives navigation; used only by the three CI reload cases.
const fs = require('node:fs/promises');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { reloadNativeProbe } = require('./reload-native-probe.cjs');
function observeReload(page, testInfo) {
  const startedAt = Date.now(), started = performance.now(), events = [], ids = new WeakMap(), sized = new WeakSet();
  let nextId = 0, closed = false, failed = false, reloadStarted = false, reloadPending = false, nativeStall = false, instrumentSW = false;
  const native = [], nativeDocuments = new Map(), swSeen = new Set();
  let nativeDropped = 0;
  const workerInfo = w => w ? { url: safeUrl(w.url), state: String(w.state || '') } : null;
  const stages = new Set(['init','ready-state','native-dcl','window-load','pagehide','script-load','script-error','register-call','register-resolved','register-rejected','registration-initial','registration-controller','registration-stalled','registration-query-failed','controllerchange','updatefound','sw-state','stall-loading','sw-stage','probe-subscribe-failed']);
  const nativeConsole = message => {
    const text = message.text();
    if (!text.startsWith('__HD_RELOAD_NATIVE__') || text.length > 16384) return;
    let data; try { data = JSON.parse(text.slice('__HD_RELOAD_NATIVE__'.length)); } catch { return; }

    if (!stages.has(data.stage) || typeof data.doc !== 'number') return;
    const item = { ms: Math.round(performance.now() - started), stage: data.stage, doc: data.doc, at: data.at, readyState: data.readyState, lastScript: safeUrl(data.lastScript), url: safeUrl(data.url), controller: workerInfo(data.controller), worker: workerInfo(data.worker) };
    if (data.registration) item.registration = { scope: safeUrl(data.registration.scope), installing: workerInfo(data.registration.installing), waiting: workerInfo(data.registration.waiting), active: workerInfo(data.registration.active) };
    if (data.stage === 'sw-stage') {
      const w = data.sw || {}, key = w.worker + ':' + w.seq;
      if (swSeen.has(key)) return; swSeen.add(key);
      item.sw = { worker: w.worker, seq: w.seq, id: w.id, at: w.at, stage: String(w.stage || ''), url: safeUrl(w.url), status: w.status, hit: w.hit, source: ['network','cache','none','unknown'].includes(w.source) ? w.source : undefined, contentLength: /^\d+$/.test(w.contentLength || '') ? w.contentLength : undefined };
    }
    const summary = nativeDocuments.get(item.doc) || { doc: item.doc, scriptLoads: 0, scriptErrors: 0 };
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
    const body = JSON.stringify({ test: testInfo.title, startedAt, events, instrumentSW, profile: { swSource: instrumentSW ? 'test-instrumented' : 'unmodified', serviceWorkers: testInfo.project?.use?.serviceWorkers || 'allow' }, nativeSummary: [...nativeDocuments.values()], nativeDetailsReason: retainNative ? failed && (reloadPending || nativeStall) ? 'reload-wait-failure' : 'diagnostic-control' : 'summary-only', nativeDropped, nativeEvents: retainNative ? native : [] }, null, 2);
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
    await page.addInitScript(reloadNativeProbe, { instrumentSW });
  };
  return retain;
}
module.exports = { observeReload };
