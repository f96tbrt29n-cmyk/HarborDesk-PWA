// Serialized only into the opted-in carrier reload test. Entry records only:
// no fetch/timer/SW replacement and no observation of the returned Promise.
function versionCallProbe(sites) {
  'use strict';
  sites = sites || {};
  if (window !== window.top) return;
  const doc = performance.timeOrigin, prefix = '__HD_VERSION_CALL__';
  const names = ['hdCheckForUpdate','hdFetchLatestVersion','hdFetchVersionMeta'];
  const installed = new Map();
  let sequence = 0, active = null, loadSeen = document.readyState === 'complete', deliveryFailures = 0;
  const emit = (stage, detail = {}) => {
    try { console.debug(prefix + JSON.stringify({ stage, doc, timeOrigin:doc, at:performance.now(),
      readyState:document.readyState, deliveryFailures, ...detail })); }
    catch { deliveryFailures++; } // Diagnostic delivery only; never catch the application call.
  };
  const locations = () => {
    try {
      return String(new Error().stack || '').split('\n').map(line => /update-manager\.js(?:\?[^\s):]*)?:(\d+):(\d+)/.exec(line))
        .filter(Boolean).slice(0,8).map(m => ({ line:Number(m[1]), column:Number(m[2]) }));
    } catch { return []; }
  };
  const install = reason => {
    const added = [];
    for (const api of names) {
      const original = window[api];
      if (typeof original !== 'function' || installed.get(api) === original) continue;
      const wrapper = { call() {
        // Do not inspect/coerce arguments. A strict non-async method preserves
        // receiver, synchronous throw and the exact object/Promise returned.
        const caller = locations(), previous = active;
        const origin = caller.some(s => s.line === sites.automaticLine) ? 'automatic-load-timer'
          : caller.some(s => (sites.explicitLines || []).includes(s.line)) ? 'explicit-update-check'
          : previous?.origin || 'unclassified';
        const role = api !== 'hdFetchVersionMeta' ? 'entry'
          : caller.some(s => s.line === sites.externalLine) ? 'external-callsite'
          : caller.some(s => s.line === sites.localLine) ? 'local-callsite' : 'unclassified';
        const current = { id:++sequence, origin };
        emit('call', { api, id:current.id, parentId:previous?.id || 0, origin, role, caller });
        active = current;
        try { return Reflect.apply(original, this, arguments); }
        finally { active = previous; }
      } }.call;
      window[api] = wrapper; installed.set(api, wrapper); added.push(api);
    }
    emit('install', { reason, added, installedCount:installed.size,
      afterWindowLoadOrComplete:loadSeen || document.readyState === 'complete' });
  };
  emit('init');
  window.addEventListener('load', () => { loadSeen = true; });
  document.addEventListener('load', event => {
    if (event.target?.tagName !== 'SCRIPT') return;
    let matches = false;
    try { matches = new URL(event.target.src, location.href).pathname.endsWith('/update-manager.js'); } catch {}
    if (matches) install('update-manager-script-load');
  }, true);
  if (names.some(name => typeof window[name] === 'function')) install('init-existing-functions');
}
module.exports = { versionCallProbe };
