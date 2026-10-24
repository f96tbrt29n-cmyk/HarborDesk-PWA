'use strict';
const { instrumentRegistrationSource } = require('./pwa-registration-continuation.cjs');
const { createHash } = require('node:crypto');
const hash = value => createHash('sha256').update(value).digest('hex');

// Mechanism control, NOT a product bootstrap or a replacement registration
// strategy. Product files/SW are served unchanged; only these fixture URLs and
// the synthetic index differ. No native API wrapping or settlement observers.
function registrationRouteFixture(productUpdateSource, route) {
  if (!['A','B','C'].includes(route)) throw new Error('unknown route');
  const transformed = instrumentRegistrationSource(productUpdateSource);
  let versioned = transformed.source.slice(0, transformed.source.indexOf('const HD_RELEASE_META_RAW='));
  const change = (from, to) => {
    if (versioned.split(from).length !== 2) throw new Error('route fixture anchor changed');
    versioned = versioned.replace(from, to);
  };
  // Allow the same recorder to name the fixture's bare call unambiguously.
  change('function __hdRegProbe(stage,callId){', "function __hdRegProbe(stage,callId,registrationURL='./sw.js?v='+HD_APP_BUILD){");
  change("registrationURL:'./sw.js?v='+HD_APP_BUILD,scope:'./'", "registrationURL,scope:'./'");
  if (route !== 'A') versioned += "\nwindow.addEventListener('load',()=>{hdEnsureServiceWorker()});\n";
  // The product bare entry uses .catch only. This isolated counterpart awaits
  // the *same single call* to define a measurable completion gate, rather than
  // adding a second then/catch observer to its Promise. This changes reaction
  // semantics/timing and is explicitly not an exact product reproduction.
  const bare = "window.__hdBareRegistrationState='idle';\n" + (route === 'B' ? '' : `
window.addEventListener('load',async()=>{
  const callId=1001;
  try{
    window.__hdBareRegistrationState='registering';
    __hdRegProbe('register-before',callId,'./sw.js');
    const nativeResult=navigator.serviceWorker.register('./sw.js');
    __hdRegProbe('register-returned',callId,'./sw.js');
    const registration=await nativeResult;
    __hdRegProbe('await-resumed',callId,'./sw.js');
    window.__hdBareRegistrationState='registered';
    __hdRegProbe('registered-assigned',callId,'./sw.js');
  }catch(error){
    __hdRegProbe('catch-entered',callId,'./sw.js');
    window.__hdBareRegistrationState='error';
    __hdRegProbe('error-assigned',callId,'./sw.js');
    console.warn('HarborDesk isolated bare registration failed',error);
  }
});\n`);
  return { html: '<!doctype html><meta charset="utf-8"><title>Isolated registration routes</title><main id="registration-fixture">Registration mechanism control</main><script src="/route-app-entry.js"></script><script src="/route-update-entry.js"></script>',
    bare, versioned, sources: { originalUpdateSHA256: transformed.originalSha256, bareEntrySHA256: hash(bare), versionedEntrySHA256: hash(versioned) } };
}
module.exports = { registrationRouteFixture };
