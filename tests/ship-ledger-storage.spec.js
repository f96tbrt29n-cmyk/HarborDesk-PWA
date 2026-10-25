const {test,expect}=require('@playwright/test');
const {syncVersionFixture}=require('./sync-version-fixture.cjs');
test.use({serviceWorkers:'block'});

async function setup(page,seed='existing'){
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await syncVersionFixture(page);
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof renderShipRoster==='function');
 await page.waitForLoadState('load');
 await page.waitForFunction(()=>HD_CURRENT_ASSETS_PROMISE===null);
 await page.evaluate(seed=>{
  const keys=['harbordesk-custom-fleets-v1','harbordesk-equipment-v1','harbordesk-ship-roster-v1','harbordesk-fleet-calculator-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1'];
  const originalGet=Storage.prototype.getItem,originalSet=Storage.prototype.setItem;
  if(originalGet.call(localStorage,SHIP_ROSTER_KEY)!==null)throw Error('fresh fixture must start without roster data');
  const rows=[{id:'roster-existing',name:'赤城改',masterId:277,type:'正規空母',level:'90',remodel:'改',gear:'保持する装備メモ',memo:'保持する手動メモ',tags:['主力'],createdAt:1000,updatedAt:2000,source:'kancolle-import',gameShipId:890,gameSlot:[101,102,-1,-1],gameSlotEx:0,gameStats:{saku:45},captureId:'preserve-sync'},
   {id:'roster-other',name:'Верный',masterId:147,type:'駆逐艦',level:'85',memo:'保持する別行',tags:['任務用'],gameShipId:891,source:'kancolle-import',createdAt:1001,updatedAt:2001}];
  keys.forEach((key,i)=>{if(i===2){if(seed!=='absent')localStorage.setItem(key,JSON.stringify(seed==='empty'?[]:rows));return}localStorage.setItem(key,JSON.stringify(i===0?[]:i===1?[{id:'other-equipment',name:'零式水上観測機',count:2,star:4}]:i===5?blankState():{}))});
  renderShipRoster();refreshShipRosterOptions();
  window.shipLedgerFault={keys,originalGet,reference:keys.map(key=>originalGet.call(localStorage,key)),rows,mode:'none',writes:0,successToasts:0};
  const originalToast=window.hdToast;
  window.hdToast=function(...args){if(/艦娘情報を更新|艦娘を登録/.test(String(args[0])))shipLedgerFault.successToasts++;return originalToast?.apply(this,args)};
  Storage.prototype.getItem=function(key){if(key===SHIP_ROSTER_KEY){if(shipLedgerFault.mode==='null')return null;if(shipLedgerFault.mode==='throw')throw Error('isolated roster read unavailable');if(shipLedgerFault.mode==='json')return '{invalid'}return originalGet.call(this,key)};
  Storage.prototype.setItem=function(key,value){if(key===SHIP_ROSTER_KEY)shipLedgerFault.writes++;return originalSet.call(this,key,value)};
 },seed);
 await page.locator('#hdWorkspaceNav [data-hd-ws-group="fleet"]').click();
 await page.locator('#hdWorkspaceSectionSelect').selectOption('roster');
 await expect(page.locator('#addShipRoster')).toBeVisible();
 return errors;
}
async function observe(page){
 return page.evaluate(()=>{
  const f=shipLedgerFault,values=f.keys.map(key=>f.originalGet.call(localStorage,key));
  let readIsNull=null,readError=null;
  try{readIsNull=localStorage.getItem(SHIP_ROSTER_KEY)===null}catch(error){readError=error.name}
  return {writes:f.writes,successToasts:f.successToasts,allExact:values.every((value,i)=>value===f.reference[i]),allNonNull:values.every(value=>value!==null),
   keys:values.map((value,i)=>({key:f.keys[i],present:value!==null,exact:value===f.reference[i]})),
   own:Object.prototype.hasOwnProperty.call(localStorage,SHIP_ROSTER_KEY),readIsNull,readError,
   dialogOpen:document.getElementById('shipRosterDialog').open,warning:!!document.querySelector('[data-hd-roster-storage-error]')};
 });
}
async function open(page,operation){
 if(operation==='edit')await page.locator('[data-roster-edit="roster-existing"]').click();else await page.locator('#addShipRoster').click();
 await expect(page.locator('#shipRosterDialog')).toBeVisible();
 await page.locator('#rosterName').fill(operation==='edit'?'赤城改':'夕立改二');
 await page.locator('#rosterLevel').fill('94');
 await page.locator('#rosterMemo').fill('保存する変更');
}
async function arm(page,mode){
 await page.evaluate(mode=>document.addEventListener('submit',function once(event){
  if(event.target.id!=='shipRosterForm'||event.submitter?.value==='cancel')return;
  document.removeEventListener('submit',once,true);shipLedgerFault.mode=mode;
 },true),mode);
}
for(const mode of ['null','throw','json'])for(const operation of ['add','edit'])test(`ship form ${mode} ${operation} refuses overwrite and recovers through the real UI`,async({page},info)=>{
 const errors=await setup(page);await open(page,operation);
 await arm(page,mode);await page.locator('#shipRosterDialog button[value="default"]').click();
 // Normal operation evidence before assertions; native reads bypass the injected fault.
 const result=await observe(page);await info.attach('roster-read-fault',{body:JSON.stringify({mode,operation,...result}),contentType:'application/json'});
 expect(result).toMatchObject({writes:0,successToasts:0,allExact:true,allNonNull:true,own:true,dialogOpen:true,warning:true});
 if(mode==='null')expect(result.readIsNull).toBe(true);
 if(mode==='throw')expect(result.readError).toBe('Error');
 await expect(page.locator('[data-hd-roster-storage-error]')).toContainText('保存していません');
 await expect(page.locator('#rosterLevel')).toHaveValue('94');await expect(page.locator('#rosterMemo')).toHaveValue('保存する変更');
 expect(errors).toEqual([]);
 await page.evaluate(()=>shipLedgerFault.mode='none');
 await page.locator('#shipRosterDialog button[value="default"]').click();
 await expect(page.locator('#shipRosterDialog')).not.toBeVisible();
 const recovered=await page.evaluate(operation=>{
  const f=shipLedgerFault,rows=JSON.parse(f.originalGet.call(localStorage,SHIP_ROSTER_KEY)),old=rows.find(x=>x.id==='roster-existing'),other=rows.find(x=>x.id==='roster-other');
  const expected={...f.rows[0],level:'94',memo:'保存する変更',updatedAt:old?.updatedAt};
  return {writes:f.writes,successToasts:f.successToasts,count:rows.length,otherExact:JSON.stringify(other)===JSON.stringify(f.rows[1]),
   oldPreserved:JSON.stringify(old)===JSON.stringify(operation==='add'?f.rows[0]:expected),
   added:operation==='add'?rows.some(x=>x.name==='夕立改二'&&x.level==='94'&&x.memo==='保存する変更'):true,
   otherKeysExact:f.keys.every((key,i)=>key===SHIP_ROSTER_KEY||f.originalGet.call(localStorage,key)===f.reference[i]),
   allNonNull:f.keys.every(key=>f.originalGet.call(localStorage,key)!==null)};
 },operation);
 await info.attach('roster-read-recovery',{body:JSON.stringify(recovered),contentType:'application/json'});
 expect(recovered).toEqual({writes:1,successToasts:1,count:operation==='add'?3:2,otherExact:true,oldPreserved:true,added:true,otherKeysExact:true,allNonNull:true});
 await expect(page.locator('#shipRosterList')).toContainText('Верный');expect(errors).toEqual([]);
});
for(const seed of ['absent','empty'])test(`ship form ${seed} storage permits first creation then normal edit`,async({page},info)=>{
 const errors=await setup(page,seed),before=await observe(page);
 expect(before.own).toBe(seed==='empty');expect(before.readIsNull).toBe(seed==='absent');
 await open(page,'add');await page.locator('#shipRosterDialog button[value="default"]').click();
 await expect(page.locator('#shipRosterDialog')).not.toBeVisible();
 await page.locator('#shipRosterList [data-roster-edit]').click();await page.locator('#rosterLevel').fill('95');await page.locator('#rosterMemo').fill('通常編集');
 await page.locator('#shipRosterDialog button[value="default"]').click();await expect(page.locator('#shipRosterDialog')).not.toBeVisible();
 const result=await page.evaluate(()=>{const f=shipLedgerFault,rows=JSON.parse(f.originalGet.call(localStorage,SHIP_ROSTER_KEY));return {writes:f.writes,successToasts:f.successToasts,count:rows.length,name:rows[0].name,level:rows[0].level,memo:rows[0].memo,otherKeysExact:f.keys.every((key,i)=>key===SHIP_ROSTER_KEY||f.originalGet.call(localStorage,key)===f.reference[i]),allNonNull:f.keys.every(key=>f.originalGet.call(localStorage,key)!==null)}});
 await info.attach('roster-normal-create-edit',{body:JSON.stringify(result),contentType:'application/json'});
 expect(result).toEqual({writes:2,successToasts:2,count:1,name:'夕立改二',level:'95',memo:'通常編集',otherKeysExact:true,allNonNull:true});expect(errors).toEqual([]);
});
