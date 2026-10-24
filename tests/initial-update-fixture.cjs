'use strict';
const { createHash } = require('node:crypto');
const { registrationRouteFixture } = require('./registration-route-fixture.cjs');
const hash = source => createHash('sha256').update(source).digest('hex');

// Shared isolated delivery policy. The input already has the existing
// continuation markers. Full-app callers retain all of the remaining source.
function initialUpdateSource(source, phase, suppress) {
    if (!['initial','reloaded'].includes(phase) || typeof suppress !== 'boolean') throw Error('invalid initial update policy');
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
}

// Isolated B only. Phase is selected by the HTTP server before the existing
// reload action, never inferred from storage, worker state or HTML fetch count.
function initialUpdateFixture(productSource, suppressInitialUpdate) {
  if (typeof suppressInitialUpdate !== 'boolean') throw Error('invalid initial update policy');
  const base = registrationRouteFixture(productSource, 'B');
  const initial = initialUpdateSource(base.versioned, 'initial', suppressInitialUpdate), reloaded = initialUpdateSource(base.versioned, 'reloaded', false);
  return { ...base, versioned: initial, reloadedVersioned: reloaded,
    sources: { ...base.sources, initialEntrySHA256: hash(initial), reloadedEntrySHA256: hash(reloaded), suppressInitialUpdate } };
}
module.exports = { initialUpdateFixture, initialUpdateSource };
