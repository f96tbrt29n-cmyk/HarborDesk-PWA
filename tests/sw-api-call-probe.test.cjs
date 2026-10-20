const {test}=require('node:test'),assert=require('node:assert/strict');
const {installSWCallProbe}=require('./sw-api-call-probe.cjs');
test('call-only observer preserves receiver, arguments, synchronous throw and return identity without touching then',()=>{
 const oldLocation=global.location;global.location={href:'http://localhost/'};
 try {
  const sentinel={},calls=[],promise=new Proxy({}, {get(){throw Error('do not inspect promise properties')}});
  const script={toString(){throw Error('observer must not convert input')}}, options={get scope(){throw Error('observer must not read options')}};
  function native(...args){calls.push({receiver:this,args});if(this===sentinel)throw sentinel;return promise}
  const container={register:native},prototype={update:native},original=Object.getOwnPropertyDescriptor(container,'register');
  const probe=installSWCallProbe(container,prototype);
  assert.equal(container.register(script,options),promise);assert.equal(calls[0].receiver,container);assert.equal(calls[0].args[0],script);assert.equal(calls[0].args[1],options);
  assert.equal(prototype.update.call(container),promise);assert.equal(calls[1].receiver,container);
  assert.throws(()=>container.register.call(sentinel,script),error=>error===sentinel);
  assert.equal(probe.records.length,3);assert.ok(probe.records[2].syncThrow);assert.equal(probe.records[0].returned.id,probe.records[1].returned.id);
  probe.restore();assert.deepEqual(Object.getOwnPropertyDescriptor(container,'register'),original);assert.equal(prototype.update,native);
 } finally { if(oldLocation===undefined)delete global.location;else global.location=oldLocation; }
});
