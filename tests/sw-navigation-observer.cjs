// Passive browser-side boundary records for the explicit, isolated runtime only.
// No response bodies, worker API hooks, Promise reactions, or storage reads.
function observeNavigation(page, { limit = 128, clock = () => Number(process.hrtime.bigint()) / 1e6 } = {}) {
  const started = clock(), events = [], requestIds = new WeakMap();
  let sequence = 0, commits = 0, dropped = 0;
  const record = (kind, details = {}) => {
    if (events.length >= limit) { dropped++; return; }
    events.push({ at: clock() - started, kind, commitSequence: commits, ...details });
  };
  const selected = request => request.isNavigationRequest() || new URL(request.url()).pathname === '/first.js';
  const identify = request => {
    if (!requestIds.has(request)) requestIds.set(request, ++sequence);
    return { requestId: requestIds.get(request), url: request.url(), navigation: request.isNavigationRequest(),
      mainFrame: request.frame() === page.mainFrame() };
  };
  const handlers = {
    request: request => { if (selected(request)) record('request', identify(request)); },
    response: response => {
      const request = response.request();
      if (selected(request)) record('response', { ...identify(request), status: response.status() });
    },
    requestfinished: request => { if (selected(request)) record('requestfinished', identify(request)); },
    requestfailed: request => {
      if (selected(request)) record('requestfailed', { ...identify(request), failure: request.failure()?.errorText });
    },
    framenavigated: frame => {
      if (frame === page.mainFrame()) { commits++; record('main-frame-commit', { url: frame.url() }); }
    },
    domcontentloaded: () => record('domcontentloaded'),
    crash: () => record('page-crash')
  };
  for (const [event, handler] of Object.entries(handlers)) page.on(event, handler);
  return {
    mark: record,
    snapshot: () => ({ clock: 'Node process.hrtime (relative ms, observer receipt time)', limit, dropped,
      documentIdentity: 'main-frame commit sequence only; no native document/loader ID', events: events.map(e => ({ ...e })) }),
    dispose: () => { for (const [event, handler] of Object.entries(handlers)) page.off(event, handler); }
  };
}
module.exports = { observeNavigation };
