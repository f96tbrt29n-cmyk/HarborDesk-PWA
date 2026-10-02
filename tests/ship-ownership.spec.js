const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block'});
async function boot(page){
 await page.route('**/*',route=>{const url=new URL(route.request().url());return ['127.0.0.1','localhost'].includes(url.hostname)?route.continue():route.fulfill({status:204,body:''})});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdShipSameFamily==='function');
}
test('renamed remodels share ownership and acquisition, while exact equipment forms remain separate',async({page})=>{
 await boot(page);
 const actual=await page.evaluate(()=>{
  const ships=window.HD_KANCOLLE_MASTER_SNAPSHOT.allShips;
  const row=name=>Object.values(ships).find(x=>x.name===name);
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'古い名前',masterId:147,level:85},{name:'龍鳳改',masterId:318,level:70}]));
  return {
   renamed:hdDropOwned('響'),carrier:hdDropOwned('大鯨'),unrelated:hdDropOwned('暁'),
   detailed:!!hdShipDbOwned({base:'響',final:'Верный'}),
   exactBase:!!hdShipDbMasterOwned(row('響')),exactFinal:!!hdShipDbMasterOwned(row('Верный')),
   base:hdShipDbAcquisitionRows('Верный').base,drop:hdShipDbAcquisitionRows('Верный').drop?.ship,
   carrierBase:hdShipDbAcquisitionRows('龍鳳改').base,
   prefix:hdShipSameFamily('大和に似た艦','大和'),legacyId:hdShipSameFamily({id:35,name:'暁'},'響'),
   cycle:hdShipSameFamily('鈴谷改二','鈴谷航改二')
  };
 });
 expect(actual).toEqual({renamed:true,carrier:true,unrelated:false,detailed:true,exactBase:false,exactFinal:true,base:'響',drop:'響',carrierBase:'大鯨',prefix:false,legacyId:false,cycle:true});
});
test('missing drop list updates after complete game sync and keeps its filter and query',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page);
 await page.evaluate(()=>hdDropOpenSearch('響',false));
 await page.locator('#hdDropMissingOnly').check();
 await expect(page.locator('#hdDropDbList')).toContainText('響');
 await page.evaluate(()=>hdKcHandleBridgeImport(JSON.stringify({format:'harbordesk-kancolle-import',version:2,captureId:'ownership',records:[{endpoint:'/kcsapi/api_port/port',at:100,payload:{api_result:1,api_data:{api_ship:[{api_id:987,api_ship_id:147,api_lv:85,api_slot:[]}],api_deck_port:[],api_material:[]}}}]})));
 await expect(page.locator('#hdDropDbList .hd-drop-card')).toHaveCount(0);
 await expect(page.locator('#hdDropSearch')).toHaveValue('響');
 await expect(page.locator('#hdDropMissingOnly')).toBeChecked();
 await page.evaluate(()=>rosterSave([]));
 await expect(page.locator('#hdDropDbList')).toContainText('響');
 await page.evaluate(()=>{
  hdWSShowElement('shipDatabase',false);
  const search=document.getElementById('hdShipDbSearch');search.value='響';search.dispatchEvent(new Event('input'));
  const include=document.getElementById('hdShipDbIncludeMaster');include.checked=false;include.dispatchEvent(new Event('change'));
  const missing=document.getElementById('hdShipDbMissingOnly');missing.checked=true;missing.dispatchEvent(new Event('change'));
 });
 await expect(page.locator('#hdShipDbList .hd-shipdb-card')).toHaveCount(1);
 await page.evaluate(()=>rosterSave([{name:'Верный',masterId:147,level:85}]));
 await expect(page.locator('#hdShipDbList .hd-shipdb-card')).toHaveCount(0);
 await page.evaluate(()=>{const include=document.getElementById('hdShipDbIncludeMaster');include.checked=true;include.dispatchEvent(new Event('change'))});
 await expect(page.locator('#hdShipDbList .hd-shipdb-card')).toHaveCount(0);
 await page.evaluate(()=>rosterSave([]));
 await expect(page.locator('#hdShipDbList .hd-shipdb-card').first()).toBeAttached();
 expect(errors).toEqual([]);
});
