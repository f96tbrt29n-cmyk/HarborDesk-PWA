const {test,expect}=require('@playwright/test');
const {syncVersionFixture}=require('./sync-version-fixture.cjs');
test.use({serviceWorkers:'block'});

async function setup(page,seed='existing'){
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await syncVersionFixture(page);
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof renderEquipment==='function');
 await page.waitForLoadState('load');
 await page.waitForFunction(()=>HD_CURRENT_ASSETS_PROMISE===null);
 await page.evaluate(seed=>{
  const keys=['harbordesk-custom-fleets-v1','harbordesk-equipment-v1','harbordesk-ship-roster-v1','harbordesk-fleet-calculator-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1'];
  const originalGet=Storage.prototype.getItem,originalSet=Storage.prototype.setItem;
  if(originalGet.call(localStorage,HD_EQUIP_KEY)!==null)throw Error('fresh fixture must start without equipment data');
  const rows=[{id:'ledger-existing',name:'零式水上観測機',count:2,star:4,targetStar:8,source:'kancolle-import',masterEquipId:59,memo:'retain plan'},
   {id:'ledger-other',name:'33号水上電探',count:1,star:6,targetStar:6,assigned:'赤城改',memo:'retain other row'}];
  keys.forEach((key,i)=>{if(i===1){if(seed!=='absent')localStorage.setItem(key,JSON.stringify(seed==='empty'?[]:rows));return}localStorage.setItem(key,JSON.stringify(i===2?[{name:'赤城改',masterId:277,gameShipId:882,level:90}]:i===5?blankState():{}))});
  renderEquipment();renderDashboard();
  window.equipmentFault={keys,originalGet,reference:keys.map(key=>originalGet.call(localStorage,key)),rows,mode:'none',writes:0};
  Storage.prototype.getItem=function(key){if(key===HD_EQUIP_KEY){if(equipmentFault.mode==='null')return null;if(equipmentFault.mode==='throw')throw Error('isolated ledger read unavailable');if(equipmentFault.mode==='json')return '{invalid'}return originalGet.call(this,key)};
  Storage.prototype.setItem=function(key,value){if(key===HD_EQUIP_KEY)equipmentFault.writes++;return originalSet.call(this,key,value)};
 },seed);
 await page.locator('#hdWorkspaceNav [data-hd-ws-group="arsenal"]').click();
 await page.locator('#hdWorkspaceSectionSelect').selectOption('equipmentBook');
 await expect(page.locator('#addEquipment')).toBeVisible();
 return errors;
}
async function observe(page){
 return page.evaluate(()=>{
  const f=equipmentFault,values=f.keys.map(key=>f.originalGet.call(localStorage,key));
  let readIsNull=null,readError=null;
  try{readIsNull=localStorage.getItem(HD_EQUIP_KEY)===null}catch(error){readError=error.name}
  return {writes:f.writes,allExact:values.every((value,i)=>value===f.reference[i]),allNonNull:values.every(value=>value!==null),
   keys:values.map((value,i)=>({key:f.keys[i],present:value!==null,exact:value===f.reference[i]})),
   own:Object.prototype.hasOwnProperty.call(localStorage,HD_EQUIP_KEY),readIsNull,readError,
   dialogOpen:document.getElementById('equipmentDialog').open,warning:!!document.querySelector('[data-hd-equipment-storage-error]')};
 });
}
async function open(page,operation){
 if(operation==='edit')await page.locator('[data-eq-edit="ledger-existing"]').click();else await page.locator('#addEquipment').click();
 await expect(page.locator('#equipmentDialog')).toBeVisible();
 await page.locator('#equipmentName').fill(operation==='edit'?'零式水上観測機':'彩雲');
 await page.locator('#equipmentCount').fill('3');
}
async function arm(page,mode){
 await page.evaluate(mode=>document.addEventListener('submit',function once(event){
  if(event.target.id!=='equipmentForm'||event.submitter?.value==='cancel')return;
  document.removeEventListener('submit',once,true);equipmentFault.mode=mode;
 },true),mode);
}
for(const mode of ['null','throw','json'])for(const operation of ['add','edit'])test(`equipment form ${mode} ${operation} refuses overwrite and recovers through the real UI`,async({page},info)=>{
 const errors=await setup(page);await open(page,operation);
 await arm(page,mode);await page.locator('#equipmentDialog button[value="default"]').click();
 // Capture the controlled operation's result before any assertion, not after failure.
 const result=await observe(page);await info.attach('ledger-read-fault',{body:JSON.stringify({mode,operation,...result}),contentType:'application/json'});
 expect(result).toMatchObject({writes:0,allExact:true,allNonNull:true,own:true,dialogOpen:true,warning:true});
 if(mode==='throw')expect(result.readError).toBe('Error');
 await expect(page.locator('[data-hd-equipment-storage-error]')).toContainText('保存していません');
 expect(errors).toEqual([]);
 await page.evaluate(()=>equipmentFault.mode='none');
 await page.locator('#equipmentDialog button[value="default"]').click();
 await expect(page.locator('#equipmentDialog')).not.toBeVisible();
 const recovered=await page.evaluate(operation=>{
  const f=equipmentFault,rows=JSON.parse(f.originalGet.call(localStorage,HD_EQUIP_KEY)),old=rows.find(x=>x.id==='ledger-existing'),other=rows.find(x=>x.id==='ledger-other');
  return {writes:f.writes,count:rows.length,otherExact:JSON.stringify(other)===JSON.stringify(f.rows[1]),
   oldPreserved:operation==='add'?JSON.stringify(old)===JSON.stringify(f.rows[0]):old.source==='kancolle-import'&&old.masterEquipId===59&&old.count===3,
   added:operation==='add'?rows.some(x=>x.name==='彩雲'&&x.count===3):true,
   otherKeysExact:f.keys.every((key,i)=>key===HD_EQUIP_KEY||f.originalGet.call(localStorage,key)===f.reference[i]),
   allNonNull:f.keys.every(key=>f.originalGet.call(localStorage,key)!==null)};
 },operation);
 await info.attach('ledger-read-recovery',{body:JSON.stringify(recovered),contentType:'application/json'});
 expect(recovered).toEqual({writes:1,count:operation==='add'?3:2,otherExact:true,oldPreserved:true,added:true,otherKeysExact:true,allNonNull:true});
 await expect(page.locator('#equipmentList')).toContainText('33号水上電探');expect(errors).toEqual([]);
});
for(const seed of ['absent','empty'])test(`equipment form ${seed} storage permits first creation then normal edit`,async({page},info)=>{
 const errors=await setup(page,seed),before=await observe(page);
 expect(before.own).toBe(seed==='empty');expect(before.readIsNull).toBe(seed==='absent');
 await open(page,'add');await page.locator('#equipmentDialog button[value="default"]').click();
 await expect(page.locator('#equipmentDialog')).not.toBeVisible();
 await page.locator('#equipmentList [data-eq-edit]').click();await page.locator('#equipmentCount').fill('5');await page.locator('#equipmentStar').fill('7');
 await page.locator('#equipmentDialog button[value="default"]').click();await expect(page.locator('#equipmentDialog')).not.toBeVisible();
 const result=await page.evaluate(()=>{const f=equipmentFault,rows=JSON.parse(f.originalGet.call(localStorage,HD_EQUIP_KEY));return {writes:f.writes,count:rows.length,name:rows[0].name,amount:rows[0].count,star:rows[0].star,otherKeysExact:f.keys.every((key,i)=>key===HD_EQUIP_KEY||f.originalGet.call(localStorage,key)===f.reference[i]),allNonNull:f.keys.every(key=>f.originalGet.call(localStorage,key)!==null)}});
 await info.attach('ledger-normal-create-edit',{body:JSON.stringify(result),contentType:'application/json'});
 expect(result).toEqual({writes:2,count:1,name:'彩雲',amount:5,star:7,otherKeysExact:true,allNonNull:true});expect(errors).toEqual([]);
});
