// Node-side evidence survives navigation; used only by the three CI reload cases.
const fs = require('node:fs/promises');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
function observeReload(page, testInfo) {
  const startedAt = Date.now(), started = performance.now(), events = [], ids = new WeakMap(), sized = new WeakSet();
  let nextId = 0, closed = false;
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
    if (request.sizes && observedUrl(request.url()) && !sized.has(request)) {
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
    for (const [name, handler] of Object.entries(handlers)) page.off(name, handler);
    for (const [name, handler] of Object.entries(contextHandlers)) context.off(name, handler);
    closed = true;
    const body = JSON.stringify({ test: testInfo.title, startedAt, events }, null, 2);
    const target = testInfo.outputPath('reload-navigation-evidence.json');
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, body);
    await testInfo.attach('reload-navigation-evidence', { path: target, contentType: 'application/json' });
    return { events };
  };
  retain.mark = phase => record('phase', { phase });
  retain.errors = () => events.filter(event => event.kind === 'pageerror');
  retain.installSWProbe = async () => {
    await page.exposeBinding('__hdReloadSWProbe', (_, data) => {
      if (data?.tag !== 'hd-reload-probe' || typeof data.stage !== 'string') return;
      const { stage, id, worker, at, url, status, bytes, hit } = data;
      record('sw-probe', { stage, id, worker, at, url: safeUrl(url), status, bytes, hit });
    });
    await page.addInitScript(() => {
      navigator.serviceWorker?.addEventListener('message', e => {
        if (e.data?.tag === 'hd-reload-probe') window.__hdReloadSWProbe(e.data).catch(() => {});
      });
      const register = navigator.serviceWorker?.register.bind(navigator.serviceWorker);
      if (register) navigator.serviceWorker.register = (url, options) => {
        const target = new URL(url, location.href); target.searchParams.set('hd_reload_probe', '1');
        return register(target.href, options);
      };
    });
  };
  return retain;
}
module.exports = { observeReload };
