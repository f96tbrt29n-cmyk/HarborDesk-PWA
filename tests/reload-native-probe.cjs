// Serialized as an init script in the three isolated reload tests only.
function reloadNativeProbe({ instrumentSW = false } = {}) {
  const prefix = '__HD_RELOAD_NATIVE__', doc = performance.timeOrigin;
  const sw = navigator.serviceWorker, watched = new WeakSet(), registrations = new WeakSet(), subscribed = new WeakSet();
  let lastScript = '', sequence = 0;
  const url = value => { try { const u = new URL(value, location.href), v = u.searchParams.get('v'); u.username = ''; u.password = ''; u.hash = ''; u.search = ''; if (/^\d+$/.test(v || '')) u.searchParams.set('v', v); return u.href; } catch { return ''; } };
  const worker = w => w ? { url: url(w.scriptURL), state: w.state } : null;
  const emit = (stage, extra = {}) => console.debug(prefix + JSON.stringify({ stage, doc, at: performance.now(), readyState: document.readyState, lastScript, controller: worker(sw?.controller), ...extra }));
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
  sw?.addEventListener('controllerchange', () => { emit('controllerchange'); watchWorker(sw.controller); inspect('registration-controller'); });
  if (sw) {
    const register = sw.register;
    sw.register = function(script, options) {
      let target = script;
      if (instrumentSW) { const u = new URL(script, location.href); u.searchParams.set('hd_reload_probe', '1'); target = u.href; }
      emit('register-call', { url: url(target), sequence: ++sequence });
      const promise = register.call(this, target, options);
      promise.then(r => snapshot(r, 'register-resolved'), () => emit('register-rejected'));
      return promise; // Preserve the native return promise, including rejection.
    };
  }
  document.addEventListener('readystatechange', () => emit('ready-state'));
  document.addEventListener('load', event => {
    if (event.target?.tagName === 'SCRIPT' && event.target.src) {
      lastScript = url(event.target.src); emit('script-load', { url: lastScript });
    }
  }, true);
  window.addEventListener('load', () => emit('window-load'), { once: true });
  document.addEventListener('error', event => { if (event.target?.tagName === 'SCRIPT') emit('script-error', { url: url(event.target.src) }); }, true);
  // Diagnostic watchdog, not a test wait. Healthy documents cancel it at DCL.
  // No timeout/assertion is changed, and no DOM snapshot/layout/network is read.
  const watchdog = setTimeout(() => {
    if (document.readyState !== 'loading') return;
    emit('stall-loading'); inspect('registration-stalled');
  }, 30000);
  document.addEventListener('DOMContentLoaded', () => { clearTimeout(watchdog); emit('native-dcl'); }, { once: true });
  window.addEventListener('pagehide', () => emit('pagehide'), { once: true });
}
module.exports = { reloadNativeProbe };
