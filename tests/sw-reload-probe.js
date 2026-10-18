// Test-server opt-in only. Bounded event buffer, no extra body reader or fetch.
// Normal SW bytes remain untouched unless hd_reload_probe=1 is requested.
(() => {
  const worker = Date.now(), tracked = /\/(ship-database|training-planner|equipment-catalog-extra[34])\.js$/;
  const history = [], ports = [];
  let next = 0, sequence = 0;
  const selected = req => { try { const u = new URL(typeof req === 'string' ? req : req.url); return u.origin === self.location.origin && tracked.test(u.pathname); } catch { return false; } };
  const emit = (stage, id, req, extra = {}) => {
    const url = new URL(typeof req === 'string' ? req : req.url), v = url.searchParams.get('v');
    url.search = ''; url.hash = ''; if (/^\d+$/.test(v || '')) url.searchParams.set('v', v);
    const data = { tag: 'hd-reload-buffer', worker, seq: ++sequence, at: Date.now(), stage, id, url: url.href, ...extra };
    history.push(data); if (history.length > 128) history.shift();
    for (const port of ports) port.postMessage(data);
  };
  self.addEventListener('message', event => {
    if (event.data?.tag !== 'hd-reload-buffer' || event.data.action !== 'subscribe' || !event.ports[0]) return;
    const port = event.ports[0]; ports.push(port); if (ports.length > 4) ports.shift().close();
    for (const data of history) port.postMessage(data);
  });
  const fetchOriginal = self.fetch.bind(self);
  self.fetch = (req, options) => {
    if (!selected(req)) return fetchOriginal(req, options);
    const id = ++next; emit('network-start', id, req);
    return fetchOriginal(req, options).then(response => {
      emit('network-headers', id, req, { status: response.status });
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
    // Cache.put consumes the original SW's clone. Do not create/read a third one.
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
