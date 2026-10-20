// Serialized as an init script in focused reload tests only.
function reloadNativeProbe({ instrumentSW = false, resourceTiming = true, parserBoundary = false, parserLoadBoundary = 40, parserSingleScript = false } = {}) {
  const prefix = '__HD_RELOAD_NATIVE__', doc = performance.timeOrigin;
  const sw = navigator.serviceWorker, watched = new WeakSet(), registrations = new WeakSet(), subscribed = new WeakSet();
  let lastScript = '', sequence = 0;
  const url = value => { try { const u = new URL(value, location.href), v = u.searchParams.get('v'); u.username = ''; u.password = ''; u.hash = ''; u.search = ''; if (/^\d+$/.test(v || '')) u.searchParams.set('v', v); return u.href; } catch { return ''; } };
  const worker = w => w ? { url: url(w.scriptURL), state: w.state } : null;
  const emit = (stage, extra = {}) => console.debug(prefix + JSON.stringify({ stage, doc, at: performance.now(), readyState: document.readyState, lastScript, controller: worker(sw?.controller), ...extra }));
  const boundaryNames = ['quest-database.js','expedition-database.js','home-dashboard.js','update-manager.js','map-strategy-navigator.js','strategy-goals.js'];
  const loaded = new WeakSet(), errored = new WeakSet();
  const boundaryLoad = parserLoadBoundary === 42 ? 42 : 40, parserReasons = new Set();
  // Opt-in DOM metadata only, at existing events. No mutation observer, layout,
  // fetch, body read, evaluation marker, new timer or registration wrapper.
  const parserSnapshot = reason => {
    if (!parserBoundary || parserReasons.has(reason)) return;
    parserReasons.add(reason);
    const collection = document.scripts, truncated = collection.length > 128;
    const nodes = Array.prototype.slice.call(collection,0,128);
    const scripts = boundaryNames.map(name => {
      const matches = nodes.filter(node => { try { const u = new URL(node.src, location.href); return u.origin === location.origin && u.pathname === '/' + name; } catch { return false; } });
      const node = matches[0], matching = { matchCount: matches.length, ordinals: matches.slice(0,4).map(node => nodes.indexOf(node)+1), matchesTruncated: matches.length > 4 };
      // First matching node metadata is not proof of a static HTML node.
      // A negative result beyond the scan limit is unknown, not absent.
      return node ? { name, present: true, ...matching, ordinal: nodes.indexOf(node) + 1, connected: node.isConnected, url: url(node.src), async: node.async, defer: node.defer, type: String(node.type || '').slice(0,32), loadObserved: loaded.has(node), errorObserved: errored.has(node) } : { name, present: truncated ? null : false, ...matching };
    });
    const single = parserSingleScript && reason === 'loading-watchdog' && !truncated && nodes.length === 1 ? nodes[0] : null;
    // Identity of the sole current node, not evidence of parser insertion history
    // or execution. Only the existing watchdog in the opted-in carrier case.
    const singleScript = single ? { url: /^https?:/.test(single.src || '') ? url(single.src) : '', type: String(single.type || '').slice(0,32), async: single.async, defer: single.defer, connected: single.isConnected, loadObserved: loaded.has(single), errorObserved: errored.has(single) } : undefined;
    emit('parser-boundary', { reason, scripts, scriptCount: nodes.length, truncated, ...(singleScript ? { singleScript } : {}) });
  };
  // Completion entries only: an absent entry is not a failed request. Do not
  // fetch/read bodies, alter the timing buffer, inspect layout, or wrap fetch.
  let resourceObserver, resourceCount = 0, resourceDropped = 0, resourceBufferFull = 0;
  const resourceFields = ['startTime','duration','workerStart','fetchStart','requestStart','responseStart','responseEnd','transferSize','encodedBodySize','decodedBodySize'];
  const recordResources = entries => {
    for (const entry of entries) {
      let source; try { source = new URL(entry.name, location.href); } catch { continue; }
      if (source.origin !== new URL(location.href).origin || !source.pathname.endsWith('.js')) continue;
      if (resourceCount >= 128) { resourceDropped++; continue; }
      const timing = {};
      for (const key of resourceFields) if (Number.isFinite(entry[key]) && entry[key] >= 0) timing[key] = entry[key];
      resourceCount++;
      emit('resource-complete', { url: url(source.href), timing, initiatorType: String(entry.initiatorType || '').slice(0,32) });
    }
  };
  const resourceSummary = () => {
    if (!resourceObserver) return;
    recordResources(resourceObserver.takeRecords());
    emit('resource-summary', { resourceCount, resourceDropped, resourceBufferFull });
  };
  const subscribe = w => {
    if (!instrumentSW || !w || subscribed.has(w)) return;
    subscribed.add(w);
    const channel = new MessageChannel();
    channel.port1.onmessage = event => {
      if (event.data?.tag === 'hd-reload-buffer') emit('sw-stage', { sw: event.data });
    };
    try { w.postMessage({ tag: 'hd-reload-buffer', action: 'subscribe' }, [channel.port2]); } catch { emit('probe-subscribe-failed', { worker: worker(w) }); }
  };
  const watchWorker = w => {
    if (!w || watched.has(w)) return;
    watched.add(w); subscribe(w);
    w.addEventListener('statechange', () => { emit('sw-state', { worker: worker(w) }); subscribe(sw?.controller); });
  };
  const snapshot = (r, stage) => {
    if (!r) return;
    emit(stage, { registration: { scope: url(r.scope), installing: worker(r.installing), waiting: worker(r.waiting), active: worker(r.active) } });
    [r.installing, r.waiting, r.active].forEach(watchWorker);
    if (!registrations.has(r)) { registrations.add(r); r.addEventListener('updatefound', () => snapshot(r, 'updatefound')); }
  };
  const inspect = stage => sw?.getRegistration().then(r => snapshot(r, stage)).catch(() => emit('registration-query-failed'));
  emit('init'); watchWorker(sw?.controller); inspect('registration-initial');
  if (resourceTiming && typeof PerformanceObserver === 'function') {
    try {
      resourceObserver = new PerformanceObserver(list => recordResources(list.getEntries()));
      resourceObserver.observe({ type: 'resource', buffered: true });
      performance.addEventListener?.('resourcetimingbufferfull', () => { resourceBufferFull++; });
      emit('resource-observer', { observerState: 'observing' });
    } catch { resourceObserver = null; emit('resource-observer', { observerState: 'unavailable' }); }
  } else emit('resource-observer', { observerState: resourceTiming ? 'unavailable' : 'disabled' });
  sw?.addEventListener('controllerchange', () => { emit('controllerchange'); watchWorker(sw.controller); inspect('registration-controller'); });
  // Leave native registration untouched in unmodified-SW observations.
  if (sw && instrumentSW) {
    const register = sw.register;
    sw.register = function(script, options) {
      let target = script;
      if (instrumentSW) { const u = new URL(script, location.href); u.searchParams.set('hd_reload_probe', '1'); target = u.href; }
      emit('register-call', { url: url(target), sequence: ++sequence });
      const promise = register.call(this, target, options);
      promise.then(r => snapshot(r, 'register-resolved'), () => emit('register-rejected'));
      // Same returned promise, but the rejection observer changes unhandled-
      // rejection bookkeeping/timing. This is an instrumented control only.
      return promise;
    };
  }
  document.addEventListener('readystatechange', () => emit('ready-state'));
  document.addEventListener('load', event => {
    if (event.target?.tagName === 'SCRIPT' && event.target.src) {
      loaded.add(event.target);
      lastScript = url(event.target.src); emit('script-load', { url: lastScript });
      if (parserBoundary && new URL(lastScript).pathname === (boundaryLoad === 42 ? '/home-dashboard.js' : '/quest-database.js')) parserSnapshot('script-' + boundaryLoad + '-load');
    }
  }, true);
  window.addEventListener('load', () => emit('window-load'), { once: true });
  document.addEventListener('error', event => { if (event.target?.tagName === 'SCRIPT') { errored.add(event.target); emit('script-error', { url: url(event.target.src) }); } }, true);
  // Diagnostic watchdog, not a test wait. Healthy documents cancel it at DCL.
  // No timeout/assertion is changed. Optional metadata never reads layout/network.
  const watchdog = setTimeout(() => {
    if (document.readyState !== 'loading') return;
    resourceSummary();
    parserSnapshot('loading-watchdog');
    emit('stall-loading'); inspect('registration-stalled');
  }, 30000);
  document.addEventListener('DOMContentLoaded', () => { clearTimeout(watchdog); resourceSummary(); parserSnapshot('dcl'); emit('native-dcl'); }, { once: true });
  window.addEventListener('pagehide', () => emit('pagehide'), { once: true });
}
module.exports = { reloadNativeProbe };
