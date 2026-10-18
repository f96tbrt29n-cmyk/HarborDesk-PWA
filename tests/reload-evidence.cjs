// Node-side evidence survives navigation; used only by the three CI reload cases.
const fs = require('node:fs/promises');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
function observeReload(page, testInfo) {
  const started = performance.now(), events = [];
  const record = (kind, data = {}) => events.push({ ms: Math.round(performance.now() - started), kind, ...data });
  const handlers = {
    request: request => record('request', { url: request.url(), type: request.resourceType(), navigation: request.isNavigationRequest() }),
    requestfailed: request => record('requestfailed', { url: request.url(), failure: request.failure() }),
    response: response => record('response', { url: response.url(), status: response.status(), fromServiceWorker: response.fromServiceWorker() }),
    framenavigated: frame => { if (frame === page.mainFrame()) record('navigation', { url: frame.url() }); },
    domcontentloaded: () => record('domcontentloaded'),
    load: () => record('load'),
    pageerror: error => record('pageerror', { name: error.name, message: error.message, stack: error.stack || '' }),
  };
  // Page events can miss requests forwarded by a Service Worker. Limit the
  // context view to the public upstream checks and Service Worker script.
  const context = page.context();
  const observedUrl = url => {
    try {
      const value = new URL(url);
      return /^https:\/\/api\.github\.com\/repos\/(Tibowl\/api_start2|poooi\/poi)\/commits\//i.test(url) || value.pathname.endsWith('/sw.js');
    } catch { return false; }
  };
  const contextHandlers = {
    request: request => { if (observedUrl(request.url())) record('context-request', { url: request.url(), type: request.resourceType() }); },
    requestfailed: request => { if (observedUrl(request.url())) record('context-requestfailed', { url: request.url(), failure: request.failure() }); },
    response: response => { if (observedUrl(response.url())) record('context-response', { url: response.url(), status: response.status(), fromServiceWorker: response.fromServiceWorker(), allowOrigin: response.headers()['access-control-allow-origin'] || '' }); },
  };
  for (const [name, handler] of Object.entries(contextHandlers)) context.on(name, handler);
  for (const [name, handler] of Object.entries(handlers)) page.on(name, handler);
  const retain = async () => {
    // No page.evaluate on failure: a blocked page must not delay artifact retention.
    for (const [name, handler] of Object.entries(handlers)) page.off(name, handler);
    for (const [name, handler] of Object.entries(contextHandlers)) context.off(name, handler);
    const body = JSON.stringify({ test: testInfo.title, events }, null, 2);
    const target = testInfo.outputPath('reload-navigation-evidence.json');
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, body);
    await testInfo.attach('reload-navigation-evidence', { path: target, contentType: 'application/json' });
    return { events };
  };
  retain.mark = phase => record('phase', { phase });
  retain.errors = () => events.filter(event => event.kind === 'pageerror');
  return retain;
}
module.exports = { observeReload };
