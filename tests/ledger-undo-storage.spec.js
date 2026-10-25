const {test,expect}=require('@playwright/test');
const {syncVersionFixture}=require('./sync-version-fixture.cjs');
test.use({serviceWorkers:'block',...(process.env.CI?{trace:{mode:'retain-on-failure',snapshots:false,screenshots:true,sources:true}}:{})});

async function setup(page,ledger,last=false){
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await syncVersionFixture(page);
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof renderEquipment==='function'&&typeof renderShipRoster==='function');
 await page.waitForLoadState('load');await page.waitForFunction(()=>HD_CURRENT_ASSETS_PROMISE===null);
 await page.evaluate(({ledger,last})=>{
  const keys=['harbordesk-custom-fleets-v1','harbordesk-equipment-v1','harbordesk-ship-roster-v1','harbordesk-fleet-calculator-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1'];
  const target=ledger==='equipment'?HD_EQUIP_KEY:SHIP_ROSTER_KEY;
  const get=Storage.prototype.getItem,set=Storage.prototype.setItem;
  const equipment=[{id:'undo-target',name:'零式水上観測機',count:2,star:4,memo:'retain deleted row',source:'kancolle-import',masterEquipId:59,metadata:{capture:'retained'}},
   {id:'undo-other',name:'33号水上電探',count:1,star:6,memo:'retain remaining row',assigned:'赤城改',metadata:{manual:true}}];
  const roster=[{id:'undo-target',name:'赤城改',masterId:277,type:'正規空母',level:'90',gameShipId:890,gameSlot:[101,102,-1,-1],source:'kancolle-import',memo:'retain deleted row',metadata:{capture:'retained'}},
   {id:'undo-other',name:'Верный',masterId:147,type:'駆逐艦',level:'85',memo:'retain remaining row',tags:['任務用'],metadata:{manual:true}}];
  keys.forEach((key,i)=>{let value=i===1?equipment:i===2?roster:i===5?blankState():{};if(key===target&&last)value=value.slice(0,1);localStorage.setItem(key,JSON.stringify(value))});
  renderEquipment();renderShipRoster();refreshShipRosterOptions();
  const f=window.undoFault={keys,target,get,original:keys.map(key=>get.call(localStorage,key)),mode:'none',writes:0,otherWrites:0,success:0};
  Storage.prototype.getItem=function(key){if(this===localStorage&&key===target){if(f.mode==='null')return null;if(f.mode==='throw')throw Error('isolated undo read unavailable');if(f.mode==='json')return '{invalid';if(f.mode==='empty-json')return ''}return get.call(this,key)};
  Storage.prototype.setItem=function(key,value){if(this===localStorage&&f.keys.includes(key)){if(key===target)f.writes++;else f.otherWrites++}return set.call(this,key,value)};
  const toast=window.hdToast;window.hdToast=function(...args){if(args[0]==='元に戻したよ')f.success++;return toast.apply(this,args)};
 },{ledger,last});
 await page.locator(`#hdWorkspaceNav [data-hd-ws-group="${ledger==='equipment'?'arsenal':'fleet'}"]`).click();
 await page.locator('#hdWorkspaceSectionSelect').selectOption(ledger==='equipment'?'equipmentBook':'roster');
 await page.locator(`[data-${ledger==='equipment'?'eq':'roster'}-delete="undo-target"]`).click();
 await expect(page.locator('#hdToastRegion .hd-toast-action')).toBeVisible();
 const deleted=await page.evaluate(()=>{
  const f=undoFault;f.remaining=f.get.call(localStorage,f.target);f.writes=0;f.otherWrites=0;
  f.button=document.querySelector('#hdToastRegion .hd-toast-action');f.timer=HD_TOAST_TIMER;
  return {count:JSON.parse(f.remaining).length,own:Object.prototype.hasOwnProperty.call(localStorage,f.target),nonnull:f.remaining!==null,allNonNull:f.keys.every(key=>f.get.call(localStorage,key)!==null)};
 });
 expect(deleted).toEqual({count:last?0:1,own:true,nonnull:true,allNonNull:true});
 return errors;
}
async function observe(page){
 return page.evaluate(()=>{
  const f=undoFault,raw=f.get.call(localStorage,f.target),host=document.getElementById('hdToastRegion');
  let readNull=null,readError=null;try{readNull=localStorage.getItem(f.target)===null}catch(error){readError=error.name}
  return {mode:f.mode,writes:f.writes,otherWrites:f.otherWrites,success:f.success,remainingExact:raw===f.remaining,
   restoredExact:raw===f.original[f.keys.indexOf(f.target)],allNonNull:f.keys.every(key=>f.get.call(localStorage,key)!==null),
   otherKeysExact:f.keys.every((key,i)=>key===f.target||f.get.call(localStorage,key)===f.original[i]),
   own:Object.prototype.hasOwnProperty.call(localStorage,f.target),readNull,readError,
   undoVisible:host.classList.contains('show'),sameButton:host.querySelector('button')===f.button,
   sameDeadlineTimer:HD_TOAST_TIMER===f.timer,warning:host.textContent.includes('復元していません')};
 });
}
for(const ledger of ['equipment','ship']){
 for(const mode of ['null','throw','json','empty-json'])test(`${ledger} undo ${mode} preserves remaining ledger and can retry before the original deadline`,async({page},info)=>{
  const errors=await setup(page,ledger);
  await page.evaluate(mode=>undoFault.mode=mode,mode);
  await page.locator('#hdToastRegion .hd-toast-action').click();
  const failed=await observe(page);await info.attach('undo-read-fault',{body:JSON.stringify({ledger,...failed}),contentType:'application/json'});
  expect(failed).toMatchObject({writes:0,otherWrites:0,success:0,remainingExact:true,restoredExact:false,allNonNull:true,otherKeysExact:true,own:true,undoVisible:true,sameButton:true,sameDeadlineTimer:true,warning:true});
  if(mode==='null')expect(failed.readNull).toBe(true);if(mode==='throw')expect(failed.readError).toBe('Error');expect(errors).toEqual([]);
  await page.evaluate(()=>undoFault.mode='none');
  await page.locator('#hdToastRegion .hd-toast-action').click();
  const recovered=await observe(page);await info.attach('undo-read-recovery',{body:JSON.stringify({ledger,...recovered}),contentType:'application/json'});
  expect(recovered).toMatchObject({writes:1,otherWrites:0,success:1,restoredExact:true,allNonNull:true,otherKeysExact:true,undoVisible:false});
  await expect(page.locator(`[data-${ledger==='equipment'?'eq':'roster'}-delete="undo-target"]`)).toBeVisible();expect(errors).toEqual([]);
 });
 for(const last of [false,true])test(`${ledger} undo normal ${last?'last row':'multiple rows'} restores exact strings and metadata`,async({page},info)=>{
  const errors=await setup(page,ledger,last);
  await page.locator('#hdToastRegion .hd-toast-action').click();
  const result=await observe(page);await info.attach('undo-normal',{body:JSON.stringify({ledger,last,...result}),contentType:'application/json'});
  expect(result).toMatchObject({writes:1,otherWrites:0,success:1,restoredExact:true,allNonNull:true,otherKeysExact:true,undoVisible:false});expect(errors).toEqual([]);
 });
}
