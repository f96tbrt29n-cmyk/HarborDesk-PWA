const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block',viewport:{width:390,height:844},hasTouch:true,isMobile:true});
const keys=['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1','harbordesk-custom-fleets-v1','harbordesk-fleet-calculator-v1'];
test('prerequisite import preserves six non-null saved keys including sparse gear and calculator on reload',async({page})=>{
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 const before=await page.evaluate(keys=>{
  const ship='時雨改二',masterId=hdShipDbMasterRowFor({name:ship}).id;
  localStorage.setItem(keys[0],JSON.stringify([{id:'import-preservation',name:ship,masterId,gameShipId:777,level:99,gameSlotEx:0,gameGearSlots:['三式水中探信儀','','三式爆雷投射機'],gameGearExpansion:'',gameAswGearKnown:true}]));
  localStorage.setItem(keys[1],JSON.stringify([{name:'三式水中探信儀',count:1},{name:'三式爆雷投射機',count:1}]));
  localStorage.setItem(keys[2],JSON.stringify({admiralLevel:120,resources:{fuel:4321,ammo:8765,steel:1234,bauxite:9876}}));
  localStorage.setItem(keys[3],JSON.stringify({...state,resources:{fuel:4321,ammo:8765,steel:1234,bauxite:9876},memo:'専用の取込保持検証'}));
  saveCustomFleets({'1-2':[{id:'import-preservation',name:'保持する編成',ships:[{ship,masterId,rosterId:'import-preservation',gameShipId:777,gear:'三式水中探信儀 /  / 三式爆雷投射機'}]}]});
  hdFCSaveState('1-2','import-preservation',{...hdFCDefaultState('1-2','import-preservation'),hqLevel:120,branchCoef:1,extraMemo:'計算プラン保持'});
  return keys.map(k=>localStorage.getItem(k));
 },keys);
 expect(before.every(x=>x!==null)).toBe(true);
 const imported=await page.evaluate(()=>hdStrategyImportMap('6-5'));expect(imported).toBeGreaterThan(0);
 expect(await page.evaluate(()=>homeGuideState().custom.some(x=>x.source==='unlock'&&x.ref==='6-4'))).toBe(true);
 expect(await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),keys)).toEqual(before);
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 expect(await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),keys)).toEqual(before);
 expect(await page.evaluate(()=>loadCustomFleets()['1-2'][0].ships[0])).toMatchObject({rosterId:'import-preservation',gameShipId:777,gear:'三式水中探信儀 /  / 三式爆雷投射機'});
});
