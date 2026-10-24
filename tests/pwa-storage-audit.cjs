// Dedicated fixture diagnostics only. Never writes a sentinel or restores data.
const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const KEYS = ['harbordesk-custom-fleets-v1','harbordesk-equipment-v1','harbordesk-ship-roster-v1','harbordesk-fleet-calculator-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1'];
function storageProbe({ keys, contextId, pageId, scriptErrorBoundary = false, keyPresence = false }) {
  if (window !== window.top) return;
  const proto = Storage.prototype, get = proto.getItem, keyAt = proto.key, doc = performance.timeOrigin;
  let storage, storageError, count = 0, operation = 0, scope = 'application-or-runtime';
  try { storage = window.localStorage; } catch (error) { storageError = error.name; }
  const digest = value => {
    if (value === null) return { present: false, length: 0 };
    let hash = 2166136261;
    const end = Math.min(value.length, 65536);
    for (let i = 0; i < end; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
    return { present: true, length: value.length, prefixFnv32: (hash >>> 0).toString(16), truncated: end < value.length };
  };
  const snapshot = (stage, mutation, storageEvent) => {
    if (count++ >= 256) return;
    try {
      if (stage === 'fixture-start') scope = 'fixture';
      if (stage === 'fixture-end') scope = 'application-or-runtime';
      const url = new URL(location.href); url.username = ''; url.password = ''; url.search = ''; url.hash = '';
      let enumeration, currentEnumeration;
      const read = area => {
        const rows = keys.map(key => {
          const readStartedAt = keyPresence ? performance.now() : undefined;
          let row;
          try { const value=Reflect.apply(get, area, [key]);row={ key, readAt:performance.now(), ...digest(value) }; }
          catch (error) { row={ key, readAt:performance.now(), error:error.name, errorScope:'getItem' }; }
          if (keyPresence) {
            row.readStartedAt=readStartedAt;
            row.ownStartedAt=performance.now();
            try { row.ownProperty=Object.prototype.hasOwnProperty.call(area,key); }
            catch (error) { row.ownProperty=null;row.ownError=error.name; }
            row.ownReadAt=performance.now();
          }
          return row;
        });
        if (keyPresence) {
          const scan={startedAt:performance.now(),limit:128,scanned:0,lengthBefore:null,lengthAfter:null,truncated:false,changed:false,complete:false,errors:[]};
          const matches=new Map(), seen=new Set();
          try { scan.lengthBefore=area.length; }
          catch (error) { scan.errors.push({stage:'length-before',at:performance.now(),name:error.name}); }
          scan.lengthBeforeAt=performance.now();
          if (Number.isInteger(scan.lengthBefore) && scan.lengthBefore>=0) {
            scan.truncated=scan.lengthBefore>scan.limit;
            for(let i=0;i<Math.min(scan.lengthBefore,scan.limit);i++) {
              try {
                const name=Reflect.apply(keyAt,area,[i]),at=performance.now();scan.scanned++;
                if(typeof name!=='string'||seen.has(name))scan.changed=true;
                if(typeof name==='string')seen.add(name);
                // Outside key names are transient only, never emitted.
                if(keys.includes(name)&&!matches.has(name))matches.set(name,{index:i,at});
              } catch(error) { scan.errors.push({stage:'key',index:i,at:performance.now(),name:error.name});break; }
            }
          }
          try { scan.lengthAfter=area.length; }
          catch (error) { scan.errors.push({stage:'length-after',at:performance.now(),name:error.name}); }
          scan.lengthAfterAt=performance.now();
          scan.changed=scan.changed||(scan.lengthBefore!==scan.lengthAfter);
          scan.complete=Number.isInteger(scan.lengthBefore)&&scan.lengthBefore>=0&&Number.isInteger(scan.lengthAfter)&&scan.lengthAfter>=0&&!scan.truncated&&!scan.changed&&!scan.errors.length&&scan.scanned===scan.lengthBefore;
          scan.endedAt=performance.now();
          for(const row of rows) {
            row.enumerated=scan.complete?matches.has(row.key):null;
            if(matches.has(row.key))row.enumerationMatch=matches.get(row.key);
          }
          if(area===storage)enumeration=scan;else currentEnumeration=scan;
        }
        return rows;
      };
      const values = storageError ? keys.map(key => ({key,error:storageError,errorScope:'storage-getter'})) : read(storage);
      let storageIdentitySame, currentValues, currentStorageError;
      try { const current = window.localStorage; storageIdentitySame = current === storage; if (!storageIdentitySame) currentValues = read(current); }
      catch (error) { currentStorageError = error.name; }
      const controller = navigator.serviceWorker?.controller;
      let worker = null;
      if (controller) { const u = new URL(controller.scriptURL); const v=u.searchParams.get('v'); worker={url:u.origin+u.pathname+(/^\d+$/.test(v||'')?'?v='+v:''),state:controller.state}; }
      console.debug('__HD_STORAGE_AUDIT__' + JSON.stringify({ stage, scope, sequence: count, limit: 256, contextId, pageId, doc, at: performance.now(), url: url.href, origin: location.origin, readyState: document.readyState, controller:worker, values, enumeration, currentEnumeration, storageAccessError:storageError, storageIdentitySame, currentValues, currentStorageError, getItemUnchanged:proto.getItem===get, mutation, storageEvent }));
    } catch { /* Observation must not change Storage return values or exceptions. */ }
  };
  // First observation precedes wrappers and does not depend on DCL/app execution.
  snapshot('init');
  for (const method of ['setItem','removeItem','clear']) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, method), original = descriptor.value;
    Object.defineProperty(proto, method, { ...descriptor, value: function(...args) {
      let mutation;
      try { if (this === storage && (method === 'clear' || typeof args[0] === 'string' && keys.includes(args[0]))) {
        const caller = String(new Error().stack || '').split('\n').slice(1,6).map(line => line.replace(/https?:\/\/[^\s)]+/g, raw => { try { const u = new URL(raw); return u.origin + u.pathname; } catch { return '[url]'; } })).join('\n');
        mutation = { id:++operation, method, key: method === 'clear' ? undefined : args[0], caller };
        snapshot('mutation-before', mutation);
      } } catch { /* Never change native argument coercion or receiver checks. */ }
      let result;
      try { if(mutation)mutation.callStartedAt=performance.now(); } catch {}
      try { result = Reflect.apply(original, this, args); }
      catch (error) { try { if(mutation)snapshot('mutation-failed',{...mutation,callReturnedAt:performance.now(),error:error.name}); } catch {} throw error; }
      try { if (mutation) snapshot('mutation', {...mutation,callReturnedAt:performance.now()}); } catch {}
      return result;
    } });
  }
  Object.defineProperty(window, '__hdStorageAuditSnapshot', { value: snapshot, configurable: true });
  for (const name of ['DOMContentLoaded','readystatechange']) document.addEventListener(name, () => snapshot(name));
  for (const name of ['load','pagehide','pageshow']) window.addEventListener(name, () => snapshot(name));
  window.addEventListener('storage', event => {
    const observedAt = performance.now();
    let details;
    try {
      const key = event.key;
      const source = new URL(event.url);
      source.username = ''; source.password = ''; source.search = ''; source.hash = '';
      details = {
        observedAt,
        keyKind: key === null ? 'null' : keys.includes(key) ? 'target' : 'other',
        ...(keys.includes(key) ? { key } : {}),
        oldValueIsNull: event.oldValue === null,
        newValueIsNull: event.newValue === null,
        storageAreaSame: storage ? event.storageArea === storage : null,
        url: ['http:','https:'].includes(source.protocol) ? source.href : ''
      };
    } catch (error) { details = { observedAt, error: error.name }; }
    // The original event snapshot performs the same reads, exactly once.
    snapshot('storage', undefined, details);
  });
  document.addEventListener('load', event => {
    if (event.target?.tagName === 'SCRIPT') {
      try { if (new URL(event.target.src).pathname.endsWith('/app.js')) snapshot('app-script-loaded'); } catch {}
    }
  }, true);
  // One passive boundary, only in the two opted-in reload cases. No recovery or reads
  // after failure; this runs during the original script error event instead.
  if (scriptErrorBoundary) {
    let observed = false;
    document.addEventListener('error', event => {
      if (observed || event.target?.tagName !== 'SCRIPT') return;
      observed = true;
      snapshot('first-script-error');
    }, true);
  }
  navigator.serviceWorker?.addEventListener('controllerchange', () => snapshot('controllerchange'));
}
async function observeStorage(page, testInfo, { scriptErrorBoundary = false, keyPresence = false } = {}) {
  if (testInfo.project.metadata?.storageAudit === false) return { mark: async () => {}, timeline:()=>[], finish: async () => {} };
  const context = page.context(), browser = context.browser(), contextId = randomUUID(), events = [];
  let dropped = 0;
  const record = (kind, data = {}) => { if (events.length < 1024) events.push({ kind, receivedAt: Date.now(), ...data }); else dropped++; };
  const consoleHandler = message => {
    const text = message.text(); if (!text.startsWith('__HD_STORAGE_AUDIT__') || text.length > 16384) return;
    try { record('storage', JSON.parse(text.slice('__HD_STORAGE_AUDIT__'.length))); } catch {}
  };
  const safeUrl = value => { try { const u=new URL(value);u.username='';u.password='';u.search='';u.hash='';return u.href; } catch { return ''; } };
  const listeners = [[page,'console',consoleHandler],[page,'crash',()=>record('page-crash')],[page,'close',()=>record('page-close')],[context,'page',()=>record('context-new-page')],[context,'close',()=>record('context-close')],
    [page,'request',r=>{if(r.isNavigationRequest())record('navigation-request',{url:safeUrl(r.url())});}],
    [page,'framenavigated',frame=>{if(frame===page.mainFrame())record('navigation-commit',{url:safeUrl(frame.url())});}]];
  if (browser) listeners.push([browser,'disconnected',()=>record('browser-disconnected')]);
  for (const [target,name,fn] of listeners) target.on(name,fn);
  record('install', { contextId, pageId: 'existing-fixture-page', existingPages: context.pages().length, storageStateConfigured: !!testInfo.project.use?.storageState, retry:testInfo.retry, workerIndex:testInfo.workerIndex, serviceWorkers:testInfo.project.use?.serviceWorkers||'allow', scriptErrorBoundary, keyPresence });
  await page.addInitScript(storageProbe, { keys: KEYS, contextId, pageId: 'existing-fixture-page', scriptErrorBoundary, keyPresence });
  return {
    timeline: () => events.slice(),
    mark: stage => page.evaluate(stage => window.__hdStorageAuditSnapshot?.(stage), stage),
    finish: async () => {
      // No evaluation/Storage reads on failure; preserve browser-emitted history.
      for (const [target,name,fn] of listeners) target.off(name,fn);
      const target = testInfo.outputPath('pwa-storage-audit.json');
      await fs.mkdir(path.dirname(target), { recursive:true });
      await fs.writeFile(target, JSON.stringify({ version:2, hash:'prefix FNV32, non-cryptographic; equality assertions remain exact', presence:{enabled:keyPresence,limit:128,nonAtomic:true,order:'getItem then ownProperty for each target; length-before, key scan, length-after'}, dropped, events }));
      await testInfo.attach('pwa-storage-audit', { path:target, contentType:'application/json' });
    }
  };
}
module.exports = { storageProbe, observeStorage, KEYS };
