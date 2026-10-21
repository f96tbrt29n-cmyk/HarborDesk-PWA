'use strict';
const { createHash } = require('node:crypto');
const { registrationRouteFixture } = require('./registration-route-fixture.cjs');
const hash = source => createHash('sha256').update(source).digest('hex');

// Isolated B only. Phase is selected by the HTTP server before the existing
// reload action, never inferred from storage, worker state or HTML fetch count.
function initialUpdateFixture(productSource, suppressInitialUpdate) {
  if (typeof suppressInitialUpdate !== 'boolean') throw Error('invalid initial update policy');
  const base = registrationRouteFixture(productSource, 'B');
  const build = (phase, suppress) => {
    let source = base.versioned;
    const change = (from, to) => {
      if (source.split(from).length !== 2) throw Error('initial update fixture anchor changed');
      source = source.replace(from, to);
    };
    change('      document:{timeOrigin:', '      updateControl:{phase:__hdUpdateDocumentPhase,suppress:__hdSuppressExplicitUpdate},document:{timeOrigin:');
    change('    reg.update().catch(()=>{});', `    __hdRegProbe('explicit-update-site',__hdRegProbeCall);
    if(__hdSuppressExplicitUpdate){
      __hdRegProbe('explicit-update-suppressed',__hdRegProbeCall);
    }else{
      reg.update().catch(()=>{});
      __hdRegProbe('explicit-update-expression-returned',__hdRegProbeCall);
    }`);
    return `const __hdUpdateDocumentPhase=${JSON.stringify(phase)};\nconst __hdSuppressExplicitUpdate=${suppress};\n` + source;
  };
  const initial = build('initial', suppressInitialUpdate), reloaded = build('reloaded', false);
  return { ...base, versioned: initial, reloadedVersioned: reloaded,
    sources: { ...base.sources, initialEntrySHA256: hash(initial), reloadedEntrySHA256: hash(reloaded), suppressInitialUpdate } };
}
module.exports = { initialUpdateFixture };
