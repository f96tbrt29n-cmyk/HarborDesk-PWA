// Retain the first failed attempt, even when the normal CI retry later passes.
// Only synthetic browser-test input is recorded; no storage values or text.
const TARGET = /prerequisite checkbox and cleared map|priority strategy view combines completion|priorities reorder manual|editing keeps failed changes/;
function installStrategyInputDiagnostics(test) {
  test.beforeEach(async ({ page }, info) => {
    if (!TARGET.test(info.title)) return;
    await page.addInitScript(() => {
      const events = [];
      window.__hdStrategyInputDiagnostics = events;
      const identify = node => node?.nodeType === 1 ? {
        tag: node.tagName, id: node.id, data: { ...node.dataset },
        connected: node.isConnected,
        group: node.closest('details.home-guide-group')?.dataset.group,
        open: node.closest('details.home-guide-group')?.open,
        rect: (() => { const r = node.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height }; })()
      } : null;
      const record = (type, event) => {
        events.push({
          at: performance.now(), type,
          pointerId: event?.pointerId, pointerType: event?.pointerType,
          x: event?.clientX, y: event?.clientY, detail: event?.detail,
          defaultPrevented: event?.defaultPrevented,
          target: identify(event?.target), focus: identify(document.activeElement),
          scrollY: window.scrollY,
          compact: document.body?.classList.contains('hd-header-compact'),
          keyboard: document.body?.classList.contains('hd-keyboard-open')
        });
        if (events.length > 256) events.shift();
      };
      for (const type of ['pointerdown', 'pointerup', 'pointercancel', 'click', 'focusin', 'toggle']) {
        document.addEventListener(type, event => {
          // A moved control can release on body/another node. Keep that evidence
          // too, rather than silently dropping the most relevant pointerup.
          if (!event.target.closest?.('#homeGuideSteps') &&
              !['pointerdown','pointerup','pointercancel','click'].includes(type)) return;
          record(type, event);
          if (type === 'click') queueMicrotask(() => record('click-result', event));
        }, true);
      }
      window.addEventListener('scroll', event => record('scroll', event), { passive: true });
      window.addEventListener('hd:workspace-changed', event => record('workspace-changed', event));
      window.addEventListener('blur', event => record('window-blur', event));
      document.addEventListener('DOMContentLoaded', () => {
        let previous = '';
        new MutationObserver(() => {
          const next = ['hd-header-compact', 'hd-keyboard-open'].map(name => document.body.classList.contains(name)).join(':');
          if (next !== previous) { previous = next; record('header-state'); }
        }).observe(document.body, { attributes:true, attributeFilter:['class'] });
      });
    });
  });
  test.afterEach(async ({ page }, info) => {
    if (!TARGET.test(info.title) || info.status === info.expectedStatus) return;
    const events = await page.evaluate(() => window.__hdStrategyInputDiagnostics || []).catch(() => []);
    await info.attach('strategy-input-events', {
      body: Buffer.from(JSON.stringify(events, null, 2)), contentType: 'application/json'
    });
  });
}

module.exports = { installStrategyInputDiagnostics };
