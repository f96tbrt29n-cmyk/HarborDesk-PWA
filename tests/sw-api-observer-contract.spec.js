const {test,expect}=require('@playwright/test');
const {installSWCallProbe}=require('./sw-api-call-probe.cjs');
test.describe('isolated SW API observer calibration (not natural failure evidence)',()=>{
 test('native register/update preserve receiver conversions and returned promise with call-only observation',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/tests/fixtures/sw-api-observer/blank.html');
  await page.evaluate(source=>{window.installCalibration=eval('('+source+')')},installSWCallProbe.toString());
  const result=await page.evaluate(async()=>{
   const sw=navigator.serviceWorker,proto=ServiceWorkerRegistration.prototype,register=sw.register,update=proto.update;
   // Forwarding sentinels retain each actual native result; no reaction is added by the observer.
   let nativeReturn,registerReceiver,updateReceiver,registerArgs;
   sw.register=function(...args){registerReceiver=this;registerArgs=args;return nativeReturn=Reflect.apply(register,this,args)};
   proto.update=function(...args){updateReceiver=this;return nativeReturn=Reflect.apply(update,this,args)};
   const probe=installCalibration(sw,proto);let conversions=0,scopeReads=0;
   const script={toString(){conversions++;return './worker.js'}},options={get scope(){scopeReads++;return './'}};
   const pending=sw.register(script,options),sameRegister=pending===nativeReturn;
   const registration=await pending;
   const pendingUpdate=registration.update(),sameUpdate=pendingUpdate===nativeReturn;await pendingUpdate;
   const originalArgs=registerArgs[0]===script&&registerArgs[1]===options, receivers=registerReceiver===sw&&updateReceiver===registration;
   const recordCount=probe.records.length,opaqueArgs=probe.records[0].args.every(x=>!('url'in x));
   // Invalid receiver: compare observed native outcome with direct native outcome (engines may reject instead of throwing).
   async function invalid(fn){try{const value=Reflect.apply(fn,{},['./worker.js']);try{await value;return 'resolved'}catch(e){return 'rejected:'+e.name}}catch(e){return 'throw:'+e.name}}
   const baselineInvalid=await invalid(register),observedInvalid=await invalid(sw.register);
   const recordedReceivers=probe.records[0].receiver.id!==probe.records[1].receiver.id;
   probe.restore();sw.register=register;proto.update=update;await registration.unregister();
   return {sameRegister,sameUpdate,conversions,scopeReads,recordCount,opaqueArgs,recordedReceivers,originalArgs,receivers,baselineInvalid,observedInvalid};
  });
  expect(result).toMatchObject({sameRegister:true,sameUpdate:true,conversions:1,scopeReads:1,recordCount:2,opaqueArgs:true,recordedReceivers:true,originalArgs:true,receivers:true});
  expect(errors).toEqual([]);
  expect(result.observedInvalid).toBe(result.baselineInvalid);
 });
 test('same returned Promise with a rejection reaction changes unhandled-rejection observation',async({page})=>{
  await page.goto('http://127.0.0.1:4173/tests/fixtures/sw-api-observer/blank.html');
  // Artificial promise model only: not a real access-control failure or a normal app pageerror check.
  const result=await page.evaluate(()=>new Promise(resolve=>{
   const received=[],sentinel='artificial-observer-barrier';let observed=0;
   window.addEventListener('unhandledrejection',event=>{
    received.push(event.reason);
    if(event.reason===sentinel)resolve({received,observed});
   });
   const original=Promise.reject('artificial-call-only');
   const callOnly=()=>original;
   const other=Promise.reject('artificial-with-reaction');
   const outcomeObserver=()=>{other.then(()=>{},()=>{observed++});return other};
   window.calibrationIdentity=callOnly()===original&&outcomeObserver()===other;
   Promise.reject(sentinel);
  }));
  expect(await page.evaluate(()=>window.calibrationIdentity)).toBe(true);
  expect(result.received).toEqual(['artificial-call-only','artificial-observer-barrier']);expect(result.observed).toBe(1);
 });
});
