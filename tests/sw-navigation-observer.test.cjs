const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { observeNavigation } = require('./sw-navigation-observer.cjs');
function fixture(options) {
  const page = new EventEmitter(), frame = { url: () => 'http://127.0.0.1:1/' };
  page.mainFrame = () => frame;
  const request = { url: frame.url, frame: () => frame, isNavigationRequest: () => true,
    failure: () => ({ errorText: 'controlled navigation failure' }) };
  let ticks = 0;
  const observer = observeNavigation(page, { clock: () => ++ticks, ...options });
  return { page, frame, request, observer };
}
test('passive response, finish, commit and DCL stay distinct without reading body', () => {
  const { page, frame, request, observer } = fixture();
  page.emit('request', request);
  page.emit('response', { request: () => request, status: () => 200,
    body: () => { throw Error('must not read response body'); } });
  page.emit('requestfinished', request); page.emit('framenavigated', frame); page.emit('domcontentloaded');
  const s = observer.snapshot();
  assert.deepEqual(s.events.map(e => e.kind), ['request','response','requestfinished','main-frame-commit','domcontentloaded']);
  assert.deepEqual(s.events.slice(0,3).map(e => e.requestId), [1,1,1]);
  assert.deepEqual(s.events.map(e => e.commitSequence), [0,0,0,1,1]);
  assert.equal(s.dropped, 0); observer.dispose(); assert.equal(page.listenerCount('response'), 0);
});
test('failure is not a response, and unrelated requests are not collected', () => {
  const { page, request, observer } = fixture();
  page.emit('request', { url: () => 'http://127.0.0.1:1/app.js', isNavigationRequest: () => false });
  page.emit('request', request); page.emit('requestfailed', request);
  assert.deepEqual(observer.snapshot().events.map(e => e.kind), ['request','requestfailed']);
  assert.equal(observer.snapshot().events[1].failure, 'controlled navigation failure');
});
test('bounded records expose drop and snapshots do not mutate retained evidence', () => {
  const { observer } = fixture({ limit: 2 });
  observer.mark('navigation-fallback-start'); observer.mark('server-request'); observer.mark('server-destroy');
  const s = observer.snapshot(); assert.equal(s.limit, 2); assert.equal(s.events.length, 2); assert.equal(s.dropped, 1);
  s.events[0].kind = 'changed'; assert.equal(observer.snapshot().events[0].kind, 'navigation-fallback-start');
});
