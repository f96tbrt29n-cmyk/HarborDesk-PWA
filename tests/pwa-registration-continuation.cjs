'use strict';
const { createHash } = require('node:crypto');
const { performance } = require('node:perf_hooks');
const fs = require('node:fs/promises');
const path = require('node:path');
const PREFIX = 'HD_REGISTRATION_CONTINUATION ';
const hash = source => createHash('sha256').update(source).digest('hex');

// Only the isolated pwa.spec server opts in. Never rewrite the product file or
// SW. No extra Promise reactions, API wrappers, timers, fetches or storage reads.
function instrumentRegistrationSource(source) {
  const replaceOnce = (from, to) => {
    if (source.split(from).length !== 2) throw new Error('registration diagnostic source anchor changed');
    source = source.replace(from, to);
  };
  const originalSha256 = hash(source);
  const helper = `let __hdRegProbeSequence=0;
function __hdRegProbe(stage,callId){
  try{
    const controller=navigator.serviceWorker.controller;
    console.debug(${JSON.stringify(PREFIX)}+JSON.stringify({stage,callId,
      document:{timeOrigin:performance.timeOrigin,at:performance.now(),readyState:document.readyState,url:location.origin+location.pathname},
      registrationURL:'./sw.js?v='+HD_APP_BUILD,scope:'./',status:window.HD_SERVICE_WORKER_STATUS,
      controller:controller?{url:new URL(controller.scriptURL).origin+new URL(controller.scriptURL).pathname,state:controller.state}:null}));
  }catch(__hdRegProbeDeliveryError){/* diagnostic delivery only; never catch product operations */}
}
try{navigator.serviceWorker.addEventListener('controllerchange',()=>__hdRegProbe('controllerchange',0));}catch(__hdRegProbeListenerError){}
__hdRegProbe('probe-installed',0);
`;
  replaceOnce('async function hdEnsureServiceWorker(){', helper + 'async function hdEnsureServiceWorker(){\n  const __hdRegProbeCall=++__hdRegProbeSequence;');
  replaceOnce('    const reg=await navigator.serviceWorker.register(`./sw.js?v=${HD_APP_BUILD}`,{scope:\'./\'});',
    `    __hdRegProbe('register-before',__hdRegProbeCall);
    const __hdRegProbeNativeResult=navigator.serviceWorker.register(\`./sw.js?v=\${HD_APP_BUILD}\`,{scope:'./'});
    __hdRegProbe('register-returned',__hdRegProbeCall);
    const reg=await __hdRegProbeNativeResult;
    __hdRegProbe('await-resumed',__hdRegProbeCall);`);
  replaceOnce("    window.HD_SERVICE_WORKER_STATUS='registered';", "    window.HD_SERVICE_WORKER_STATUS='registered';\n    __hdRegProbe('registered-assigned',__hdRegProbeCall);");
  replaceOnce("  }catch(err){\n    window.HD_SERVICE_WORKER_STATUS='error';", "  }catch(err){\n    __hdRegProbe('catch-entered',__hdRegProbeCall);\n    window.HD_SERVICE_WORKER_STATUS='error';\n    __hdRegProbe('error-assigned',__hdRegProbeCall);");
  return { source, originalSha256, servedSha256: hash(source) };
}

function observeRegistrationContinuation(page, testInfo, identity, { limit = 64, serverLimit = 32 } = {}) {
  if (![limit, serverLimit].every(n => Number.isInteger(n) && n > 0 && n <= 64)) throw new Error('invalid continuation evidence limit');
  const report = { schema: 1, identity, nodeStartedPerformanceMs: performance.now(), nodeStartedEpochMs: Date.now(),
    clock: 'nodePerformanceMs is process-wide Node performance.now; browser timeOrigin/at is a separate clock',
    documentIdentity: 'browser timeOrigin correlation, not native document/request ID',
    limits: { events: limit, server: serverLimit, policy: 'retain newest; drop oldest' },
    droppedEvents: 0, droppedServer: 0, invalidMessages: 0, events: [], server: [], sources: [] };
  let closed = false, requestId = 0, cleanup = false;
  const now = () => ({ nodePerformanceMs: performance.now(), nodeEpochMs: Date.now() });
  const append = (list, item, maximum, dropped) => { if (list.length >= maximum) { list.shift(); report[dropped]++; } list.push(item); };
  const receive = message => {
    const text = message.text();
    if (!text.startsWith(PREFIX) || closed) return;
    try {
      if (text.length > 2048) throw new Error('oversize');
      const value = JSON.parse(text.slice(PREFIX.length));
      const stages = ['probe-installed','register-before','register-returned','await-resumed','registered-assigned','catch-entered','error-assigned','controllerchange'];
      if (!stages.includes(value.stage) || !Number.isInteger(value.callId) || !Number.isFinite(value.document?.timeOrigin) || !Number.isFinite(value.document?.at) ||
          !/^\.\/sw\.js(?:\?v=\d+)?$/.test(value.registrationURL) || value.scope !== './') throw new Error('invalid event');
      const safeURL = raw => { const url = new URL(raw); return url.origin + url.pathname; };
      append(report.events, { ...now(), stage: value.stage, callId: value.callId,
        document: { timeOrigin: value.document.timeOrigin, at: value.document.at, readyState: value.document.readyState,
          url: safeURL(value.document.url) }, registrationURL: value.registrationURL, scope: value.scope, status: value.status,
        controller: value.controller ? { url: safeURL(value.controller.url), state: value.controller.state } : null }, limit, 'droppedEvents');
    } catch { report.invalidMessages++; }
  };
  page.on('console', receive);
  return {
    transform(source) {
      const result = instrumentRegistrationSource(source);
      if (!report.sources.some(x => x.servedSha256 === result.servedSha256)) report.sources.push({ originalSha256: result.originalSha256, servedSha256: result.servedSha256 });
      return result.source;
    },
    // Only sw.js metadata: finish is server-side flushing, not browser body
    // completion. close after finish is normal, not an aborted response.
    serverRequest(req, res) {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname !== '/sw.js' || closed) return;
      const id = ++requestId, version = url.searchParams.get('v');
      const safe = version !== null && /^\d+$/.test(version) ? '/sw.js?v=' + version : '/sw.js';
      const record = stage => { if (!closed) append(report.server, { ...now(), requestId: id, stage, url: safe,
        cleanup, statusCode: res.statusCode, writableFinished: res.writableFinished, destroyed: res.destroyed }, serverLimit, 'droppedServer'); };
      record('accepted');
      res.once('finish', () => record('response-finish'));
      res.once('close', () => record(res.writableFinished ? 'response-close-after-finish' : 'response-close-before-finish'));
      req.once('aborted', () => record('request-aborted'));
    },
    beginCleanup() { cleanup = true; },
    async finish() {
      if (closed) return;
      closed = true; report.closed = now(); page.off('console', receive);
      const file = testInfo.outputPath('pwa-registration-continuation.json');
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(report, null, 2) + '\n');
      if (testInfo.attach) await testInfo.attach('pwa-registration-continuation', { path: file, contentType: 'application/json' });
    }
  };
}
module.exports = { PREFIX, instrumentRegistrationSource, observeRegistrationContinuation };
