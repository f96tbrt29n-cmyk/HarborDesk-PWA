// Local diagnostic server only. Never imported by the app or production SW.
// Cloning/reading a response and posting messages can perturb scheduling: compare
// against the untouched SW and blocked-SW controls before drawing conclusions.
(() => {
  const worker = Date.now(), tracked = /\/(training-planner|equipment-catalog-extra[34])\.js$/;
  let next = 0;
  const selected = req => { try { const u = new URL(typeof req === 'string' ? req : req.url); return u.origin === self.location.origin && tracked.test(u.pathname); } catch { return false; } };
  const emit = (stage, id, req, extra = {}) => {
    const url = new URL(typeof req === 'string' ? req : req.url); url.search = ''; url.hash = '';
    const data = { tag: 'hd-reload-probe', worker, at: Date.now(), stage, id, url: url.href, ...extra };
    self.clients.matchAll({ includeUncontrolled: true }).then(cs => cs.forEach(c => c.postMessage(data))).catch(() => {});
  };
  const fetchOriginal = self.fetch.bind(self);
  self.fetch = (req, options) => {
    if (!selected(req)) return fetchOriginal(req, options);
    const id = ++next; emit('network-start', id, req);
    return fetchOriginal(req, options).then(response => {
      emit('network-headers', id, req, { status: response.status });
      response.clone().arrayBuffer().then(body => emit('network-body-complete', id, req, { bytes: body.byteLength })).catch(() => emit('network-body-failed', id, req));
      return response;
    }, error => { emit('network-failed', id, req); throw error; });
  };
  const match = self.caches.match.bind(self.caches);
  self.caches.match = (req, options) => {
    if (!selected(req)) return match(req, options);
    const id = ++next; emit('cache-match-start', id, req);
    return match(req, options).then(response => { emit('cache-match-end', id, req, { hit: !!response }); return response; });
  };
  const put = Cache.prototype.put;
  Cache.prototype.put = function(req, response) {
    if (!selected(req)) return put.call(this, req, response);
    const id = ++next; emit('cache-put-start', id, req);
    return put.call(this, req, response).then(value => { emit('cache-put-complete', id, req); return value; }, error => { emit('cache-put-failed', id, req); throw error; });
  };
  const listen = self.addEventListener.bind(self);
  self.addEventListener = (type, handler, options) => {
    if (type !== 'fetch') return listen(type, handler, options);
    return listen(type, event => {
      if (!selected(event.request)) return handler(event);
      const id = ++next; emit('fetch-event', id, event.request);
      const respond = event.respondWith.bind(event);
      event.respondWith = promise => respond(Promise.resolve(promise).then(response => {
        emit('handoff-response', id, event.request, { status: response?.status });
        return response;
      }, error => { emit('handoff-failed', id, event.request); throw error; }));
      return handler(event);
    }, options);
  };
})();
