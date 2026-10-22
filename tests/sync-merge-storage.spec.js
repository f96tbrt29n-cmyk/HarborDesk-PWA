const {test,expect}=require('@playwright/test');
const {syncVersionFixture}=require('./sync-version-fixture.cjs');
test.use({serviceWorkers:'block',trace:{mode:'retain-on-failure',snapshots:false,screenshots:true,sources:true}});
function bundle(kind){
 const ship={api_id:987,api_ship_id:1,api_lv:30,api_nowhp:13,api_maxhp:13,api_cond:49,api_slot:[],api_slot_ex:0};
 const item={api_id:501,api_slotitem_id:1,api_level:0,api_alv:7};
 // The partial case is a supported normalized record, not a claim about a raw endpoint response.
 const records=kind==='full'?[
  {endpoint:'/kcsapi/api_get_member/ship2',at:200,payload:{api_result:1,api_data:{api_ship_data:[ship]}}},
  {endpoint:'/kcsapi/api_get_member/slot_item',at:201,payload:{api_result:1,api_data:[item]}}
 ]:[{endpoint:'normalized-partial',at:200,payload:{api_result:1,api_data:{api_ship_data:[ship],api_slot_item:[item]}}}];
 return JSON.stringify({format:'harbordesk-kancolle-import',version:2,captureId:'merge-read-fixture',records});
}
async function setup(page,kind,seed='existing'){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await syncVersionFixture(page);
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdKcReceiveFromClipboard==='function');
 await page.waitForLoadState('load');await page.waitForFunction(()=>HD_CURRENT_ASSETS_PROMISE===null);
 const raw=bundle(kind);
 const flags=await page.evaluate(({raw,seed})=>{
  const keys=['harbordesk-custom-fleets-v1','harbordesk-equipment-v1','harbordesk-ship-roster-v1','harbordesk-fleet-calculator-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1','harbordesk-kancolle-equipment-detail-v1','harbordesk-kancolle-last-success-at-v1'];
  const nativeGet=Storage.prototype.getItem,nativeSet=Storage.prototype.setItem;
  const roster=[{id:'ship-main',name:'睦月',masterId:1,gameShipId:987,level:20,source:'kancolle-import',memo:'保持する艦娘メモ',tags:['主力'],remodel:'保持する改造メモ',gear:'保持する装備メモ',customMeta:{retain:true}},
   {id:'ship-manual',name:'Верный',masterId:147,level:85,source:'manual',memo:'保持する別艦',tags:['任務用']},
   {id:'ship-missing',name:'如月',masterId:2,gameShipId:988,level:15,source:'kancolle-import'}];
  const equipment=[{id:'equip-main',name:'12cm単装砲',masterEquipId:1,count:1,star:0,targetStar:10,source:'kancolle-import',assigned:'睦月',memo:'保持する装備メモ',customMeta:{retain:true}},
   {id:'equip-stale',name:'12.7cm連装砲',masterEquipId:2,count:1,star:0,targetStar:0,source:'kancolle-import'},
   {id:'equip-plan',name:'10cm連装高角砲',masterEquipId:3,count:2,star:3,targetStar:8,source:'equipment-plan',memo:'保持する改修計画'}];
  const details=[{gameEquipId:501,masterEquipId:1,star:0,alv:1},{gameEquipId:502,masterEquipId:2,star:0,alv:0}];
  const sync={syncedAt:1000,lastSuccessAt:1000,sources:[],admiralLevel:80,snapshot:{ships:3,equipment:4,resources:{}},transferReceipt:{keys:['prior'],endpoints:{}}};
  for(const [key,value] of [[keys[0],{}],[keys[3],{retained:true}],[keys[5],blankState()]])localStorage.setItem(key,JSON.stringify(value));
  if(seed==='existing')for(const [key,value] of [[keys[1],equipment],[keys[2],roster],[keys[4],sync],[keys[6],details]])localStorage.setItem(key,JSON.stringify(value));
  if(seed==='existing')localStorage.setItem(keys[7],'1000');
  const parsed=hdKcParseImport(raw);
  window.mergeReadFault={keys,nativeGet,roster,equipment,details,reference:keys.map(k=>nativeGet.call(localStorage,k)),allReference:Object.fromEntries(Object.keys(localStorage).map(k=>[k,nativeGet.call(localStorage,k)])),returnReference:nativeGet.call(sessionStorage,'harbordesk-kc-return-game-v1'),mode:'none',target:'',writes:[],successEvents:0,successToasts:0};
  window.addEventListener('hd:kancolle-sync',()=>mergeReadFault.successEvents++);
  const toast=window.hdToastAction;window.hdToastAction=function(...args){if(String(args[0]).startsWith('同期完了'))mergeReadFault.successToasts++;return toast?.apply(this,args)};
  Storage.prototype.getItem=function(key){if(this===localStorage&&key===mergeReadFault.target){if(mergeReadFault.mode==='null')return null;if(mergeReadFault.mode==='throw')throw Error('isolated merge read unavailable');if(mergeReadFault.mode==='json')return '{invalid';if(mergeReadFault.mode==='empty-json')return ''}return nativeGet.call(this,key)};
  Storage.prototype.setItem=function(key,value){if(this===localStorage)mergeReadFault.writes.push(mergeReadFault.keys.includes(key)?key:'other');return nativeSet.call(this,key,value)};
  Object.defineProperty(navigator,'clipboard',{value:{readText:async()=>raw},configurable:true});
  return {ships:parsed.completeShips,equipment:parsed.completeSlotItems};
 },{raw,seed});
 expect(flags).toEqual({ships:kind==='full',equipment:kind==='full'});
 await page.locator('#hdGlobalSyncStatus').click();
 return errors;
}
async function receive(page){
 const button=page.locator('#hdSyncStatusDialog [data-hd-kc-receive]');
 const alert=page.waitForEvent('dialog').then(async d=>{const message=d.message();await d.accept();return message});
 await button.click();const message=await alert;await expect(button).toBeEnabled();return message;
}
async function observe(page){return page.evaluate(()=>{
 const f=mergeReadFault,values=f.keys.map(k=>f.nativeGet.call(localStorage,k));let readIsNull=null,readError=null;
 try{readIsNull=localStorage.getItem(f.target)===null}catch(e){readError=e.name}
 const e=JSON.parse(values[1]||'[]').find(x=>x.id==='equip-main');
 return {writes:f.writes.filter(k=>k!=='other'),otherWriteCount:f.writes.filter(k=>k==='other').length,allExact:values.every((v,i)=>v===f.reference[i]),allNonNull:values.every(v=>v!==null),
  allLocalExact:Object.keys(localStorage).length===Object.keys(f.allReference).length&&Object.entries(f.allReference).every(([k,v])=>f.nativeGet.call(localStorage,k)===v),
  keys:f.keys.map((key,i)=>({key,present:values[i]!==null,exact:values[i]===f.reference[i]})),
  own:Object.prototype.hasOwnProperty.call(localStorage,f.target),readIsNull,readError,manualEquipmentPreserved:e?.memo==='保持する装備メモ'&&e?.targetStar===10,
  successEvents:f.successEvents,successToasts:f.successToasts,returnFlagExact:f.nativeGet.call(sessionStorage,'harbordesk-kc-return-game-v1')===f.returnReference,
  receiveState:HD_KC_RECEIVE_RESULT?.state};
})}
async function verifyApplied(page,kind,seed,info){
 const result=await page.evaluate(({kind,seed})=>{
  const f=mergeReadFault,get=k=>f.nativeGet.call(localStorage,k),rows=JSON.parse(get(f.keys[2])),equipment=JSON.parse(get(f.keys[1])),details=JSON.parse(get(f.keys[6])),sync=JSON.parse(get(f.keys[4]));
  const ship=rows.find(x=>x.gameShipId===987),gear=equipment.find(x=>x.masterEquipId===1&&x.star===0),plan=equipment.find(x=>x.id==='equip-plan'),other=rows.find(x=>x.id==='ship-manual');
  const written=Object.fromEntries(f.keys.map(k=>[k,f.writes.filter(x=>x===k).length]));
  return {allNonNull:f.keys.every(k=>get(k)!==null),writesCorrect:f.writes.filter(k=>k!=='other').length===5&&[1,2,4,6,7].every(i=>written[f.keys[i]]===1),
   otherKeysExact:f.keys.every((k,i)=>[1,2,4,6,7].includes(i)||get(k)===f.reference[i]),
   rosterUpdated:ship?.level===30&&ship.gameShipId===987,
   detailUpdated:details.find(x=>x.gameEquipId===501)?.alv===7,
   partialDetailsPreserved:seed==='absent'?details.length===1:kind==='partial'?details.some(x=>JSON.stringify(x)===JSON.stringify(f.details[1])):details.length===1,
   manualPreserved:seed==='absent'||ship.id==='ship-main'&&ship.memo===f.roster[0].memo&&JSON.stringify(ship.tags)===JSON.stringify(f.roster[0].tags)&&ship.gear===f.roster[0].gear&&ship.remodel===f.roster[0].remodel&&JSON.stringify(ship.customMeta)===JSON.stringify(f.roster[0].customMeta)&&JSON.stringify(other)===JSON.stringify(f.roster[1])&&gear.id==='equip-main'&&gear.memo===f.equipment[0].memo&&gear.targetStar===10&&gear.assigned==='睦月'&&JSON.stringify(gear.customMeta)===JSON.stringify(f.equipment[0].customMeta),
   missingRowsCorrect:seed==='absent'?rows.length===1&&equipment.length===1:kind==='full'?!rows.some(x=>x.id==='ship-missing')&&!equipment.some(x=>x.id==='equip-stale')&&plan?.count===0&&plan.targetStar===8&&plan.memo===f.equipment[2].memo&&plan.syncMissing===true:rows.some(x=>x.id==='ship-missing')&&equipment.some(x=>x.id==='equip-stale')&&JSON.stringify(plan)===JSON.stringify(f.equipment[2]),
   successEvents:f.successEvents,successToasts:f.successToasts,receiveState:HD_KC_RECEIVE_RESULT?.state,
   successTimestampValid:Number(get(f.keys[7]))>1000&&sync.lastSuccessAt===Number(get(f.keys[7])),receiptSaved:Array.isArray(sync.transferReceipt?.keys)&&sync.transferReceipt.keys.length===(seed==='absent'?1:2)};
 },{kind,seed});
 await info.attach('sync-merge-applied',{body:JSON.stringify(result),contentType:'application/json'});
 expect(result).toEqual({allNonNull:true,writesCorrect:true,otherKeysExact:true,rosterUpdated:true,detailUpdated:true,partialDetailsPreserved:true,manualPreserved:true,missingRowsCorrect:true,successEvents:1,successToasts:1,receiveState:'success',successTimestampValid:true,receiptSaved:true});
}
const faults=[];
for(const mode of ['null','throw','json']){
 for(const kind of ['full','partial'])faults.push({target:'equipment',index:1,mode,kind});
 faults.push({target:'roster',index:2,mode,kind:'full'},{target:'detail',index:6,mode,kind:'partial'});
}
faults.push({target:'equipment',index:1,mode:'empty-json',kind:'full'});
for(const {target,index,mode,kind} of faults)test(`sync merge ${kind} ${target} ${mode} aborts without partial writes and recovers`,async({page},info)=>{
 const errors=await setup(page,kind);
 await page.evaluate(({index,mode})=>{mergeReadFault.target=mergeReadFault.keys[index];mergeReadFault.mode=mode},{index,mode});
 const message=await receive(page),result=await observe(page);
 await info.attach('sync-merge-read-fault',{body:JSON.stringify({target,mode,kind,...result}),contentType:'application/json'});
 expect(result).toMatchObject({writes:[],allExact:true,allNonNull:true,own:true,successEvents:0,successToasts:0,returnFlagExact:true,receiveState:'error'});
 if(mode==='null')expect(result.readIsNull).toBe(true);if(mode==='throw')expect(result.readError).toBe('Error');
 expect(message).toContain('同期できなかった');expect(message).toContain('同期していません');expect(errors).toEqual([]);
 await page.evaluate(()=>mergeReadFault.mode='none');
 expect(await receive(page)).toContain('同期したよ');await verifyApplied(page,kind,'existing',info);expect(errors).toEqual([]);
});
for(const seed of ['existing','absent'])for(const kind of ['full','partial'])test(`sync merge normal ${kind} ${seed} preserves the intended merge contract`,async({page},info)=>{
 const errors=await setup(page,kind,seed);expect(await receive(page)).toContain('同期したよ');await verifyApplied(page,kind,seed,info);expect(errors).toEqual([]);
});
