'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');

// Require a complete, ordered gate in one initial document/call. A missing
// marker is a preparation/observation limit, not a native Promise diagnosis.
function initialUpdateBoundary(events) {
  const stages = ['await-resumed','registered-assigned','explicit-update-site','explicit-update-expression-returned'];
  for (const first of events) {
    if (first.stage !== stages[0] || first.updateControl?.phase !== 'initial' || first.updateControl.suppress !== false) continue;
    const matches = events.filter(e => e.callId === first.callId && e.document.timeOrigin === first.document.timeOrigin && e.updateControl?.phase === 'initial' && e.updateControl.suppress === false);
    let index = -1;
    const matched = [];
    for (const stage of stages) {
      index = matches.findIndex((e, i) => i > index && e.stage === stage);
      if (index < 0) break;
      matched.push(matches[index]);
    }
    if (matched.length === stages.length) return { callId:first.callId, document:first.document, boundaries:matched };
  }
  return null;
}

async function openFollowingPage(initialPage, disposition, event) {
  if (!['keep','close'].includes(disposition)) throw Error('invalid initial document disposition');
  const context = initialPage.context();
  event('initial-disposition', { disposition, closed:initialPage.isClosed() });
  if (disposition === 'close') {
    event('initial-close-request'); await initialPage.close(); event('initial-close-complete', { closed:initialPage.isClosed() });
  } else event('initial-kept', { closed:initialPage.isClosed() });
  event('following-new-page-request');
  const following = await context.newPage();
  event('following-new-page-created', { sharedContext:following.context() === context, initialClosed:initialPage.isClosed() });
  return following;
}

function scopedInfo(info, label) {
  return { outputPath:name => info.outputPath(label+'-'+name), attach:(name, options) => info.attach(label+'-'+name, options) };
}
async function retainInitialDocumentResult(info, report) {
  const file = info.outputPath('initial-document-result.json');
  await fs.mkdir(path.dirname(file), { recursive:true });
  await fs.writeFile(file, JSON.stringify(report, null, 2)+'\n');
  await info.attach('initial-document-result', { path:file, contentType:'application/json' });
}
module.exports = { initialUpdateBoundary, openFollowingPage, scopedInfo, retainInitialDocumentResult };
