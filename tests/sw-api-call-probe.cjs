// Isolated calibration only. Not installed in application/reload fixtures.
function installSWCallProbe(container, registrationPrototype) {
  'use strict'; // Preserve null/undefined receivers instead of sloppy-mode coercion.
  const records = [], identities = new WeakMap(), restorers = [];
  let nextIdentity = 0, callId = 0;
  const identity = value => {
    if (value === null || !['object','function'].includes(typeof value)) return { type: typeof value };
    if (!identities.has(value)) identities.set(value, ++nextIdentity);
    return { type: typeof value, id: identities.get(value) };
  };
  const argument = value => {
    // Do not stringify objects, read scope getters or eagerly perform WebIDL conversion.
    if (typeof value !== 'string') return identity(value);
    try {
      const u = new URL(value, location.href), v = u.searchParams.get('v');
      u.username = ''; u.password = ''; u.hash = ''; u.search = '';
      if (/^\d+$/.test(v || '')) u.searchParams.set('v',v);
      return { type: 'string', url: u.href };
    } catch { return { type: 'string' }; }
  };
  const wrap = (owner, method) => {
    const original = owner[method], descriptor = Object.getOwnPropertyDescriptor(owner,method);
    owner[method] = function(...args) {
      const id = ++callId;
      const record = { doc: performance.timeOrigin, at: performance.now(), callId: id, method, receiver: identity(this), args: args.map(argument) };
      records.push(record);
      try {
        const result = Reflect.apply(original,this,args);
        // Never access .then/.catch or install a promise reaction. Settlement and
        // native internal requests remain unobserved, deliberately.
        record.returned = identity(result);
        return result;
      } catch (error) { record.syncThrow = identity(error); throw error; }
    };
    restorers.push(() => descriptor ? Object.defineProperty(owner,method,descriptor) : delete owner[method]);
  };
  wrap(container,'register'); wrap(registrationPrototype,'update');
  return { records, restore() { restorers.reverse().forEach(fn=>fn()); } };
}
module.exports = { installSWCallProbe };
