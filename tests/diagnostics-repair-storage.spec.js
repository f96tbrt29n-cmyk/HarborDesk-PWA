const {test,expect}=require('@playwright/test');
const {syncVersionFixture}=require('./sync-version-fixture.cjs');
test.use({serviceWorkers:'block'});

async function setup(page,seed='existing'){
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await syncVersionFixture(page);
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdDXRepairShipIdentity==='function');
 await page.waitForLoadState('load');
 await page.waitForFunction(()=>HD_CURRENT_ASSETS_PROMISE===null);
 await page.evaluate(seed=>{
  const keys=['harbordesk-custom-fleets-v1','harbordesk-equipment-v1','harbordesk-ship-roster-v1','harbordesk-fleet-calculator-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1'];
  const originalGet=Storage.prototype.getItem,originalSet=Storage.prototype.setItem;
  if(originalGet.call(localStorage,keys[2])!==null)throw Error('fixture requires a fresh isolated roster');
  const rows=[{id:'repair-target',name:'長門改二（誤記）',masterId:541,level:99,memo:'保持する手動メモ',gear:'保持する装備メモ',tags:['主力'],gameShipId:890,gameSlot:[101,102,-1,-1],source:'kancolle-import',createdAt:1000,updatedAt:2000},
   {id:'other-row',name:'Верный',masterId:147,level:85,memo:'別行保持',gameShipId:891,createdAt:1001,updatedAt:2001}];
  const fleets={'5-5':[{id:'saved-fleet',name:'保持する編成',ships:[{ship:'長門改二（別表記）',masterId:541,gear:'保持する装備位置',gameShipId:890}],memo:'保持する編成メモ',metadata:{keep:true}}]};
  if(seed==='healthy'){rows[0].name='長門改二';fleets['5-5'][0].ships[0].ship='長門改二'}
  keys.forEach((key,i)=>{
   if(i===2){if(seed==='absent')return;localStorage.setItem(key,seed==='json'?'{invalid':seed==='blank'?'':JSON.stringify(seed==='empty'?[]:rows));return}
   localStorage.setItem(key,JSON.stringify(i===0?fleets:i===1?[{id:'keep-equipment',name:'零式水上観測機',count:2,star:4}]:i===5?blankState():{keep:true}));
  });
  window.repairFault={keys,rows,fleets,originalGet,originalSet,mode:'none',target:keys[2],writes:[],completed:0,reference:keys.map(key=>originalGet.call(localStorage,key))};
  window.addEventListener('hd:ship-identity-changed',()=>repairFault.completed++);
  Storage.prototype.getItem=function(key){const f=repairFault;if(key===f.target){if(f.mode==='null')return null;if(f.mode==='throw')throw Error('isolated repair read unavailable');if(f.mode==='json')return '{invalid';if(f.mode==='blank')return ''}return originalGet.call(this,key)};
  Storage.prototype.setItem=function(key,value){if(repairFault.keys.includes(key))repairFault.writes.push(key);return originalSet.call(this,key,value)};
 },seed);
 await page.locator('#hdWorkspaceNav [data-hd-ws-group="settings"]').click();
 await page.locator('#hdWorkspaceSectionSelect').selectOption('diagnosticsCenter');
 await page.evaluate(()=>hdDXRender());
 return errors;
}
async function observe(page){
 return page.evaluate(()=>{
  const f=repairFault,values=f.keys.map(key=>f.originalGet.call(localStorage,key));
  let readIsNull=null,readError=null;try{readIsNull=localStorage.getItem(f.target)===null}catch(error){readError=error.name}
  return {writes:f.writes.slice(),completed:f.completed,allExact:values.every((value,i)=>value===f.reference[i]),
   otherKeysExact:values.every((value,i)=>[0,2].includes(i)||value===f.reference[i]),
   keys:values.map((value,i)=>({key:f.keys[i],present:value!==null,exact:value===f.reference[i]})),
   own:Object.prototype.hasOwnProperty.call(localStorage,f.target),readIsNull,readError,
   warning:!!document.querySelector('[data-hd-dx-storage-error]')};
 });
}
async function clickRepair(page,mode='none',target='roster'){
 await page.evaluate(({mode,target})=>document.addEventListener('click',function once(event){
  if(!event.target.closest?.('[data-dx-ship-identity]'))return;
  document.removeEventListener('click',once,true);repairFault.mode=mode;repairFault.target=repairFault.keys[target==='fleet'?0:2];
 },true),{mode,target});
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('[data-dx-ship-identity]').click();
}
async function repaired(page,seed){
 return page.evaluate(seed=>{
  const f=repairFault,roster=JSON.parse(f.originalGet.call(localStorage,f.keys[2])),fleets=JSON.parse(f.originalGet.call(localStorage,f.keys[0]));
  const expectedRows=['absent','empty'].includes(seed)?[]:[{...f.rows[0],name:'長門改二',updatedAt:roster[0]?.updatedAt},f.rows[1]];
  const expectedFleet=JSON.parse(JSON.stringify(f.fleets));expectedFleet['5-5'][0].ships[0].ship='長門改二';
  return {writes:f.writes.slice(),completed:f.completed,rosterExact:JSON.stringify(roster)===JSON.stringify(expectedRows),fleetExact:JSON.stringify(fleets)===JSON.stringify(expectedFleet),
   otherKeysExact:f.keys.every((key,i)=>[0,2].includes(i)||f.originalGet.call(localStorage,key)===f.reference[i]),
   warning:!!document.querySelector('[data-hd-dx-storage-error]')};
 },seed);
}
const cases=[['null','roster'],['throw','roster'],['json','roster'],['blank','roster'],['null','fleet']];
for(const [mode,target] of cases)test(`identity repair ${target} ${mode} stops writes and recovers through the real button`,async({page},info)=>{
 const errors=await setup(page);
 await clickRepair(page,mode,target);
 const fault=await observe(page);await info.attach('repair-read-fault',{body:JSON.stringify({mode,target,...fault}),contentType:'application/json'});
 expect(fault).toMatchObject({writes:[],completed:0,allExact:true,otherKeysExact:true,own:true,warning:true});
 if(mode==='null')expect(fault.readIsNull).toBe(true);
 if(mode==='throw')expect(fault.readError).toBe('Error');
 await expect(page.locator('[data-hd-dx-storage-error]')).toContainText('修復していません');expect(errors).toEqual([]);
 await page.evaluate(()=>repairFault.mode='none');
 await clickRepair(page);
 const result=await repaired(page,'existing');await info.attach('repair-read-recovery',{body:JSON.stringify(result),contentType:'application/json'});
 expect(result).toEqual({writes:['harbordesk-ship-roster-v1','harbordesk-custom-fleets-v1'],completed:1,rosterExact:true,fleetExact:true,otherKeysExact:true,warning:false});
 await expect(page.locator('[data-dx-ship-identity]')).toHaveCount(0);expect(errors).toEqual([]);
});
for(const seed of ['absent','empty'])test(`identity repair ${seed} roster preserves normal repair of saved fleets`,async({page},info)=>{
 const errors=await setup(page,seed);await clickRepair(page);
 const result=await repaired(page,seed);await info.attach('repair-normal',{body:JSON.stringify(result),contentType:'application/json'});
 expect(result).toEqual({writes:['harbordesk-ship-roster-v1','harbordesk-custom-fleets-v1'],completed:1,rosterExact:true,fleetExact:true,otherKeysExact:true,warning:false});expect(errors).toEqual([]);
});
test('identity diagnostics offers no repair for healthy data and keeps exact strings',async({page},info)=>{
 const errors=await setup(page,'healthy');await expect(page.locator('[data-dx-ship-identity]')).toHaveCount(0);
 const result=await observe(page);await info.attach('repair-not-needed',{body:JSON.stringify(result),contentType:'application/json'});
 expect(result).toMatchObject({writes:[],completed:0,allExact:true,otherKeysExact:true,warning:false});expect(errors).toEqual([]);
});
