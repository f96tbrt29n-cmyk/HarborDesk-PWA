// Synthetic parser control only. No product source, storage API or SW registration.
const http = require('node:http');
const { performance } = require('node:perf_hooks');
const html = '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/preceding.css"></head><body><script src="/first.js"></script><script src="/following.js"></script></body></html>';
const script = name => ['start','end'].map(phase => `console.debug('__HD_CONTROL_EXEC__'+JSON.stringify({script:${JSON.stringify(name)},phase:${JSON.stringify(phase)},doc:performance.timeOrigin,at:performance.now(),readyState:document.readyState}));`).join('\n');
async function createControlServer(condition, observe = () => {}) {
  if (!['css','script'].includes(condition)) throw Error('unknown control condition');
  const heldPath = condition === 'css' ? '/preceding.css' : '/first.js';
  const bodies = { '/': ['text/html',html], '/preceding.css': ['text/css','body { color: #123; }'], '/first.js': ['text/javascript',script('first')], '/following.js': ['text/javascript',script('following')] };
  const events = [], pending = new Set(); let released = false, sequence = 0;
  const record = (phase, fields = {}) => { const event = { mono: performance.now(), phase, ...fields }; events.push(event); observe(event); };
  const server = http.createServer((req,res) => {
    const id = ++sequence, path = new URL(req.url,'http://localhost').pathname;
    record('request-accepted',{id,path});
    res.on('finish',()=>record('response-finish',{id,path}));
    res.on('close',()=>record('response-close',{id,path,writableFinished:res.writableFinished}));
    res.on('error',()=>record('response-error',{id,path}));
    const entry = bodies[path];
    const send = () => {
      pending.delete(send); if (res.destroyed) return;
      const body = entry?.[1] || '';
      res.writeHead(entry ? 200 : 204,{'Content-Type':entry?.[0] || 'text/plain','Content-Length':Buffer.byteLength(body),'Cache-Control':'no-store'});
      record('headers-written',{id,path,bytes:Buffer.byteLength(body)});
      res.end(body); record('end-called',{id,path});
    };
    if (path === heldPath && !released) { pending.add(send); record('response-held',{id,path}); }
    else send();
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  const release = () => { if (released) return; released = true; record('release',{path:heldPath}); for (const send of [...pending]) send(); };
  return { origin:'http://127.0.0.1:'+server.address().port, events, heldPath, release,
    async close() { release(); server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); }
  };
}
module.exports = { createControlServer, html };
