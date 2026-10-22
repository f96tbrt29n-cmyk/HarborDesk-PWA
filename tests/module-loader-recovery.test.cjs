const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../update-manager.js'),'utf8');
function recoveryFixture(schedule=queueMicrotask){
  let calls=0,finish;
  const context=vm.createContext({window:{},queueMicrotask:schedule,console,
    load:()=>{calls++;return new Promise(resolve=>{finish=resolve;});}});
  const prefix=source.slice(0,source.indexOf('function hdInitLoadedModules('));
  const ensure=source.slice(source.indexOf('let HD_CURRENT_ASSETS_PROMISE=null;'),source.indexOf('window.hdEnsureCurrentAssets='));
  vm.runInContext(prefix+'\nfunction hdLoadCurrentAssets(){return load()}\n'+ensure,context);
  return {context,calls:()=>calls,finish:()=>finish(),run:code=>vm.runInContext(code,context)};
}
test('late completion coalesces recovery after the original bounded asset pass',async()=>{
  const f=recoveryFixture();const initial=f.run('hdEnsureCurrentAssets()');
  assert.equal(f.calls(),1);
  f.run('hdResumeTimedOutAssets();hdResumeTimedOutAssets();');
  assert.equal(f.calls(),1);
  f.finish();await initial;await Promise.resolve();
  assert.equal(f.calls(),2);
  const recovery=f.run('hdEnsureCurrentAssets()');assert.equal(f.calls(),2);
  f.finish();await recovery;await Promise.resolve();assert.equal(f.calls(),2);
});
test('late completion after the asset pass finished schedules one shared recovery',async()=>{
  const f=recoveryFixture();const initial=f.run('hdEnsureCurrentAssets()');
  f.finish();await initial;
  f.run('hdResumeTimedOutAssets();hdResumeTimedOutAssets();');await Promise.resolve();
  assert.equal(f.calls(),2);
  const recovery=f.run('hdEnsureCurrentAssets()');f.finish();await recovery;
  assert.equal(f.calls(),2);
});
test('unexpected recovery rejection remains observable rather than becoming success',async()=>{
  const callbacks=[],error=new Error('isolated initialization failure');
  const f=recoveryFixture(fn=>callbacks.push(fn));
  f.context.load=()=>Promise.reject(error);
  f.run('hdResumeTimedOutAssets()');
  assert.equal(callbacks.length,1);
  await assert.rejects(callbacks[0](),actual=>actual===error);
});

function pendingFixture(){
  const scripts=[],notices=[],timers=[];
  const make=()=>({dataset:{},attrs:{},setAttribute(k,v){this.attrs[k]=v;},
    remove(){this.isConnected=false;}});
  const document={
    querySelector:()=>scripts.find(s=>s.isConnected)||null,
    getElementById:id=>notices.find(n=>n.id===id)||null,createElement:make,
    body:{appendChild(s){s.isConnected=true;scripts.push(s);},prepend(n){notices.push(n);}}
  };
  const context=vm.createContext({window:{},document,queueMicrotask,console:{warn(){}},
    setTimeout(fn,ms){timers.push({fn,ms});return timers.length;},clearTimeout(){}});
  vm.runInContext(source.slice(0,source.indexOf('function hdInitLoadedModules(')),context);
  return {scripts,notices,timers,run:code=>vm.runInContext(code,context)};
}
test('a deadline returns false visibly and retains the unknown attempt until late load',async()=>{
  const f=pendingFixture(),call="hdLoadScript('data-test','./pending.js')";
  const first=f.run(call);f.timers.find(t=>t.ms===12000).fn();
  assert.equal(await first,false);assert.equal(f.run(call),first);
  assert.equal(f.scripts.length,1);assert.equal(f.notices[0].hidden,false);
  assert.equal(f.run("window.HD_MODULE_STATUS['./pending.js']"),'error');
  assert.equal(f.timers.filter(t=>t.ms===80).length,0);
  f.scripts[0].onload();assert.equal(await f.run(call),true);
  assert.equal(f.scripts.length,1);assert.equal(f.notices[0].hidden,true);
});
test('a genuine error arriving after the deadline still permits one retry',async()=>{
  const f=pendingFixture(),call="hdLoadScript('data-test','./pending.js')";
  const first=f.run(call);f.timers.find(t=>t.ms===12000).fn();assert.equal(await first,false);
  f.scripts[0].onerror();f.timers.find(t=>t.ms===80).fn();
  assert.equal(f.scripts.length,2);assert.equal(f.scripts[0].isConnected,false);
  assert.equal(f.run(call),first);
  f.scripts[1].onload();assert.equal(await f.run(call),true);
  assert.equal(f.scripts.length,2);assert.equal(f.run("window.HD_MODULE_STATUS['./pending.js']"),'ok');
});
