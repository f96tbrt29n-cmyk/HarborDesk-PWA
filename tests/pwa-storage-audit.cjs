// Dedicated fixture diagnostics only. Never writes a sentinel or restores data.
const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const KEYS = ['harbordesk-custom-fleets-v1','harbordesk-equipment-v1','harbordesk-ship-roster-v1','harbordesk-fleet-calculator-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1'];
function storageProbe({ keys, contextId, pageId }) {
  if (window !== window.top) return;
  let storage;
  try { storage = window.localStorage; } catch { return; }
  const proto = Storage.prototype, get = proto.getItem, doc = performance.timeOrigin;
  let count = 0;
  const digest = value => {
    if (value === null) return { present: false, length: 0 };
    let hash = 2166136261;
    const end = Math.min(value.length, 65536);
    for (let i = 0; i < end; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
    return { present: true, length: value.length, prefixFnv32: (hash >>> 0).toString(16), truncated: end < value.length };
  };
  const snapshot = (stage, mutation) => {
    if (count++ >= 256) return;
    try {
      const url = new URL(location.href); url.username = ''; url.password = ''; url.search = ''; url.hash = '';
      const values = keys.map(key => {
        try { return { key, ...digest(Reflect.apply(get, storage, [key])) }; }
        catch (error) { return { key, error: error.name }; }
      });
      const controller = navigator.serviceWorker?.controller;
      console.debug('__HD_STORAGE_AUDIT__' + JSON.stringify({ stage, sequence: count, limit: 256, contextId, pageId, doc, at: performance.now(), url: url.href, origin: location.origin, readyState: document.readyState, controller: controller ? { url: new URL(controller.scriptURL).pathname, state: controller.state } : null, values, mutation }));
    } catch { /* Observation must not change Storage return values or exceptions. */ }
  };
  for (const method of ['setItem','removeItem','clear']) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, method), original = descriptor.value;
    Object.defineProperty(proto, method, { ...descriptor, value: function(...args) {
      // Delegate first: retain native coercion, receiver checks, throws and result.
      const result = Reflect.apply(original, this, args);
      try { if (this === storage && (method === 'clear' || typeof args[0] === 'string' && keys.includes(args[0]))) {
        const caller = String(new Error().stack || '').split('\n').slice(1,6).map(line => line.replace(/https?:\/\/[^\s)]+/g, raw => { try { const u = new URL(raw); return u.origin + u.pathname; } catch { return '[url]'; } })).join('\n');
        snapshot('mutation', { method, key: method === 'clear' ? undefined : args[0], caller });
      } } catch { /* Audit failure must not alter a successful native write. */ }
      return result;
    } });
  }
  Object.defineProperty(window, '__hdStorageAuditSnapshot', { value: snapshot, configurable: true });
  for (const name of ['DOMContentLoaded','readystatechange']) document.addEventListener(name, () => snapshot(name));
  for (const name of ['load','pagehide','pageshow','storage']) window.addEventListener(name, () => snapshot(name));
  navigator.serviceWorker?.addEventListener('controllerchange', () => snapshot('controllerchange'));
  snapshot('init');
}
async function observeStorage(page, testInfo) {
  if (testInfo.project.metadata?.storageAudit === false) return { mark: async () => {}, finish: async () => {} };
  const context = page.context(), browser = context.browser(), contextId = randomUUID(), events = [];
  let dropped = 0;
  const record = (kind, data = {}) => { if (events.length < 1024) events.push({ kind, receivedAt: Date.now(), ...data }); else dropped++; };
  const consoleHandler = message => {
    const text = message.text(); if (!text.startsWith('__HD_STORAGE_AUDIT__') || text.length > 16384) return;
    try { record('storage', JSON.parse(text.slice('__HD_STORAGE_AUDIT__'.length))); } catch {}
  };
  const listeners = [[page,'console',consoleHandler],[page,'crash',()=>record('page-crash')],[page,'close',()=>record('page-close')],[context,'page',()=>record('context-new-page')],[context,'close',()=>record('context-close')]];
  if (browser) listeners.push([browser,'disconnected',()=>record('browser-disconnected')]);
  for (const [target,name,fn] of listeners) target.on(name,fn);
  record('install', { contextId, pageId: 'existing-fixture-page', existingPages: context.pages().length, storageStateConfigured: !!testInfo.project.use?.storageState });
  await page.addInitScript(storageProbe, { keys: KEYS, contextId, pageId: 'existing-fixture-page' });
  return {
    mark: stage => page.evaluate(stage => window.__hdStorageAuditSnapshot?.(stage), stage),
    finish: async () => {
      // No evaluation/Storage reads on failure; preserve browser-emitted history.
      for (const [target,name,fn] of listeners) target.off(name,fn);
      const target = testInfo.outputPath('pwa-storage-audit.json');
      await fs.mkdir(path.dirname(target), { recursive:true });
      await fs.writeFile(target, JSON.stringify({ version:1, hash:'prefix FNV32, non-cryptographic; equality assertions remain exact', dropped, events }));
      await testInfo.attach('pwa-storage-audit', { path:target, contentType:'application/json' });
    }
  };
}
module.exports = { storageProbe, observeStorage, KEYS };
