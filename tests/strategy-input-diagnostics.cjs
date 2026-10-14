// Retain the first failed attempt, even when the normal CI retry later passes.
// Only synthetic browser-test input is recorded; no storage values or text.
const TARGET = /prerequisite checkbox and cleared map|priority strategy view combines completion|priorities reorder manual|editing keeps failed changes|strategy goal deletion undo preserves newer changes|strategy goal deletion undo keeps failed deletions|strategy goal editing excludes imported goals|deferred strategy goals filter persists|strategy goal search keeps input composition caret and hidden edit drafts/;
function installStrategyInputDiagnostics(test, { recordSuccess = false } = {}) {
  const archived = new WeakMap();
  const prefix = '[hd-strategy-input-pagehide]';
  const readEvents = page => page.evaluate(() => new Promise(resolve => {
    // Allow the post-dispatch snapshot and the app's queued render to finish.
    setTimeout(() => setTimeout(() => resolve(window.__hdStrategyInputDiagnostics || []), 0), 0);
  })).catch(() => []);
  test.beforeEach(async ({ page }, info) => {
    if (!TARGET.test(info.title)) return;
    const previous = [];
    archived.set(page, previous);
    const archive = events => {
      if (!events.length) return;
      // pagehide may arrive too, so replace rather than duplicate a document.
      const earlier = previous.filter(event => event.timeOrigin !== events[0].timeOrigin);
      previous.splice(0, previous.length, ...earlier, ...events);
      if (previous.length > 768) previous.splice(0, previous.length - 768);
    };
    const reload = page.reload.bind(page);
    page.reload = async (...args) => {
      // Chromium can discard console events while destroying the old context.
      // Read only this test's metadata before the explicit test reload.
      archive(await readEvents(page));
      return reload(...args);
    };
    page.on('console', message => {
      if (message.type() !== 'debug' || !message.text().startsWith(prefix)) return;
      try { archive(JSON.parse(message.text().slice(prefix.length))); } catch {}
    });
    await page.addInitScript(({ prefix, searchDraft }) => {
      const events = [];
      let pressedTarget = null;
      let sequence = 0;
      const nodes = new WeakMap();
      window.__hdStrategyInputDiagnostics = events;
      const identify = node => node?.nodeType === 1 ? {
        nodeId: nodes.has(node) ? nodes.get(node) : (nodes.set(node, ++sequence), sequence),
        tag: node.tagName, id: node.id, data: { ...node.dataset },
        connected: node.isConnected,
        group: node.closest('details.home-guide-group')?.dataset.group,
        open: node.closest('details.home-guide-group')?.open,
        rect: (() => { const r = node.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height }; })()
      } : null;
      const record = (type, event, extra = {}) => {
        events.push({
          at: performance.now(), timeOrigin: performance.timeOrigin, type, ...extra,
          pointerId: event?.pointerId, pointerType: event?.pointerType,
          button: event?.button, buttons: event?.buttons, isPrimary: event?.isPrimary,
          pressedTarget: identify(pressedTarget),
          hitTarget: event && Number.isFinite(event.clientX) ? identify(document.elementFromPoint(event.clientX,event.clientY)) : null,
          x: event?.clientX, y: event?.clientY, detail: event?.detail,
          defaultPrevented: event?.defaultPrevented,
          target: identify(event?.target), focus: identify(document.activeElement),
          scrollY: window.scrollY,
          compact: document.body?.classList.contains('hd-header-compact'),
          keyboard: document.body?.classList.contains('hd-keyboard-open'),
          ...(searchDraft ? { spatial: {
            viewport: { width:innerWidth, height:innerHeight, visual:window.visualViewport ? {width:visualViewport.width,height:visualViewport.height,offsetTop:visualViewport.offsetTop,offsetLeft:visualViewport.offsetLeft} : null },
            editButton: identify(document.querySelector('[data-home-guide-edit-open="search-edit"]')),
            header: identify(document.querySelector('.topbar')),
            transitions: (document.querySelector('.topbar')?.getAnimations?.() || []).map(a=>({property:a.transitionProperty || null,state:a.playState,time:a.currentTime}))
          }} : {}),
          view: {
            guide: identify(document.getElementById('homeGuideSteps')),
            editForms: document.querySelectorAll('#homeGuideSteps [data-home-guide-edit]').length,
            laterPressed: document.querySelector('[data-home-guide-later-only]')?.getAttribute('aria-pressed'),
            toastActions: document.querySelectorAll('#hdToastRegion .hd-toast-action').length
          }
        });
        if (events.length > 256) events.shift();
      };
      // Only this newly failing case needs JavaScript scroll caller attribution.
      // Browser-protocol scrolling bypasses these wrappers; absence is not proof
      // that layout, anchoring or another browser scroll did not occur.
      if (searchDraft) {
        for (const [owner, method] of [[window,'scrollTo'],[window,'scrollBy'],[Element.prototype,'scrollIntoView']]) {
          const original = owner[method];
          owner[method] = function(...args) {
            record('script-scroll', null, {method,scrollTarget:identify(this),stack:new Error().stack});
            return original.apply(this,args);
          };
        }
      }
      for (const type of ['pointerdown', 'pointerup', 'pointercancel', 'click', 'focusin', 'toggle', ...(searchDraft ? ['pointermove'] : [])]) {
        document.addEventListener(type, event => {
          // A moved control can release on body/another node. Keep that evidence
          // too, rather than silently dropping the most relevant pointerup.
          if (!event.target.closest?.('#homeGuideSteps') &&
              !['pointerdown','pointerup','pointercancel','click'].includes(type)) return;
          if (type === 'pointerdown') pressedTarget = event.target;
          record(type, event);
          // Native dispatch can run microtasks before downstream listeners.
          // Observe cancellation after dispatch and its queued render task.
          if (type === 'click') setTimeout(() => setTimeout(() => record('click-result', event), 0), 0);
        }, true);
      }
      window.addEventListener('scroll', event => record('scroll', event), { passive: true });
      window.addEventListener('hd:workspace-changed', event => record('workspace-changed', event));
      window.addEventListener('blur', event => record('window-blur', event));
      // Archive metadata before a reload; successful multi-page cases must keep
      // their first click too. No user input or storage values are included.
      window.addEventListener('pagehide', () => console.debug(prefix + JSON.stringify(events)));
      document.addEventListener('DOMContentLoaded', () => {
        let previous = '';
        new MutationObserver(() => {
          const next = ['hd-header-compact', 'hd-keyboard-open'].map(name => document.body.classList.contains(name)).join(':');
          if (next !== previous) { previous = next; record('header-state'); }
        }).observe(document.body, { attributes:true, attributeFilter:['class'] });
      });
    }, { prefix, searchDraft: info.title.includes('strategy goal search keeps input composition caret and hidden edit drafts') });
  });
  test.afterEach(async ({ page }, info) => {
    if (!TARGET.test(info.title) || (!recordSuccess && info.status === info.expectedStatus)) return;
    const current = await readEvents(page);
    const events = [...(archived.get(page) || []).filter(event => event.timeOrigin !== current[0]?.timeOrigin), ...current];
    await info.attach('strategy-input-events', {
      body: Buffer.from(JSON.stringify(events, null, 2)), contentType: 'application/json'
    });
  });
}

module.exports = { installStrategyInputDiagnostics };
