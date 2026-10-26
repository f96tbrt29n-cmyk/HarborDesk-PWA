const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});
async function setup(page){
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
 return page.evaluate(()=>{
  const names=['長門改','陸奥改','妙高改二','羽黒改二','赤城改','飛鷹改'],desired=[['35.6cm連装砲','35.6cm連装砲','零式水上偵察機','三式弾'],[],['20.3cm連装砲','20.3cm連装砲','零式水上偵察機','三式弾 ★4'],[],['試製烈風 後期型','試製烈風 後期型','流星改','彗星'],['試製烈風 後期型','試製烈風 後期型','流星改','彗星']];
  const rows=names.map((name,i)=>({id:'port-'+i,name,masterId:hdShipDbMasterRowFor(name).id,gameShipId:8300+i,level:99,gameLos:100,gameGearSlots:Array.from({length:hdShipDbSlotProfile(hdFEFindShip(name)).count},(_,j)=>desired[i][j]||''),gameGearExpansion:'',gameSlotEx:0,metadata:{keep:i}}));
  const inventory=[['35.6cm連装砲',2,0],['20.3cm連装砲',2,0],['零式水上偵察機',2,0],['三式弾',1,0],['三式弾',1,4],['試製烈風 後期型',4,0],['流星改',2,0],['彗星',2,0]].map(([name,count,star])=>({name,count,star}));
  localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,JSON.stringify(inventory));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,metadata:{keep:true}}));
  saveCustomFleets({'4-5':[{id:'port',name:'合成：利用者指定2艦（十分な人数の根拠ではない）',metadata:{keep:true},routePreset:MAP_PLANS['4-5'].presets[1],ships:rows.map((r,i)=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:i===0?'35.6cm連装砲 /  / 零式水上偵察機 / 三式弾':i>=4?desired[i].join(' / '):'',metadata:{keep:i}}))},{id:'other',name:'別編成',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',ships:[],metadata:{keep:true}}]});hdMapRouteSet('4-5',1);hdMSNOpen('4-5');
  const c=hdOCContext('4-5','port',1),p=hdOCBuild(c).plan;
  return {beforeHasControls:document.querySelectorAll('#mapStrategyNavigator [data-hd-oc-port-ship]').length,initialGeneric:hdSECapabilityMeasure(p,'cap-land-soft'),types:rows.map(r=>hdFEFindShip(r.name).type),catalog:inventory.map(r=>({name:r.name,category:hdFEFind(r.name)?.category})),reference:{keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(loadCustomFleets()['4-5'][1]),otherMap:JSON.stringify(loadCustomFleets()['1-1'])}};
 });
}
async function finish(info,e,errors){e.pageerrors=errors;const file=info.outputPath('route-guidance-evidence.json');await fs.promises.writeFile(file,JSON.stringify(e,null,2));await info.attach('route-guidance-evidence',{path:file,contentType:'application/json'})}
async function setupRilanka(page){
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
 return page.evaluate(()=>{
  const names=['妙高改','羽黒改','赤城改','加賀改','時雨改','綾波改'],desired=[['20.3cm連装砲','','零式水上観測機','三式弾'],[],['流星改','彗星一二型甲','流星改','試製烈風 後期型'],['流星改','彗星一二型甲','試製烈風 後期型','彩雲'],['10cm連装高角砲','10cm連装高角砲','三式水中探信儀'],['10cm連装高角砲','10cm連装高角砲','三式水中探信儀']];
  const rows=names.map((name,i)=>({id:'rilanka-'+i,name,masterId:hdShipDbMasterRowFor(name).id,gameShipId:9300+i,level:60,gameLos:55,gameGearSlots:Array.from({length:hdShipDbSlotProfile(hdFEFindShip(name)).count},(_,j)=>desired[i][j]||''),gameGearExpansion:'',gameSlotEx:0,metadata:{keep:i}}));
  const inventory=[['20.3cm連装砲',4,0],['零式水上観測機',2,0],['三式弾',1,0],['三式弾',1,4],['流星改',3,0],['彗星一二型甲',2,0],['試製烈風 後期型',2,0],['彩雲',1,0],['10cm連装高角砲',4,0],['三式水中探信儀',2,0]].map(([name,count,star])=>({name,count,star}));
  localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,JSON.stringify(inventory));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,metadata:{keep:true}}));
  saveCustomFleets({'4-3':[{id:'rilanka',name:'合成：指定2艦（十分な人数の根拠ではない）',metadata:{keep:true},routePreset:MAP_PLANS['4-3'].presets[0],ships:rows.map((r,i)=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:desired[i].join(' / '),metadata:{keep:i}}))},{id:'other',metadata:{keep:true},ships:[]}],'4-5':[{id:'other-map',metadata:{keep:true},ships:[]}]});hdMapRouteSet('4-3',0);hdMSNOpen('4-3');
  return {reference:{keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(loadCustomFleets()['4-3'][1]),otherMap:JSON.stringify(loadCustomFleets()['4-5'])},initial:hdOCPortMeasure(hdOCBuild(hdOCContext('4-3','rilanka',0)).plan)};
 });
}
test('rilanka selected cruiser sets allocate per hull and preserve settings through save load and edit',async({page},info)=>{
 const e={},errors=[];page.on('pageerror',x=>errors.push(x.message));try{
  e.setup=await setupRilanka(page);const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  await expect(panel.locator('[data-hd-oc-port]')).toContainText('海域突破にはB勝利以上');await expect(panel.locator('[data-hd-oc-port-ship]')).toHaveCount(2);
  await panel.locator('[data-hd-oc-port-ship="0"]').check();await panel.locator('[data-hd-oc-port-ship="1"]').check();
  await expect(panel.locator('[data-hd-oc-port]')).toContainText('総必要 4・担当艦への現在配備 1・所持総数 8');
  await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toBeVisible();
  e.result=await page.evaluate(()=>{const c=hdOCContext('4-3','rilanka',0),r=HD_OC_CACHE.get('4-3:rilanka:0');return {goals:hdOCPortMeasure(r.plan),search:r.search,route:hdFERouteRequirementData(r.plan),master:hdFEMasterValidation(r.plan),usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),regressions:hdOCGoalRegressions(hdOCMeasure(hdOCBuild(c).plan,hdSEChecks('4-3').rows),r.measure)}});
  expect(e.result.goals.map(x=>x.counts)).toEqual([{main:2,recon:1,type3:1},{main:2,recon:1,type3:1}]);expect(e.result.goals.every(x=>x.ok)).toBe(true);expect(e.result.regressions).toEqual([]);expect(e.result.master.valid).toBe(true);expect(e.result.route.minimumSpeed).toBe(10);for(const [k,n] of Object.entries(e.result.usage))expect(n).toBeLessThanOrEqual(e.result.stock[k]);
  await panel.locator('[data-hd-oc-apply]').click();await page.reload({waitUntil:'load'});await page.waitForFunction(()=>typeof hdMSNOpen==='function'&&document.body.dataset.hdReady==='1');await page.evaluate(()=>hdMSNOpen('4-3'));
  await expect(panel.locator('[data-hd-oc-port-ship="0"]')).toBeChecked();await expect(panel.locator('[data-hd-oc-port-ship="1"]')).toBeChecked();
  e.after=await page.evaluate(ref=>{const f=loadCustomFleets(),c=hdOCContext('4-3','rilanka',0);return {state:document.readyState,goals:hdOCPortMeasure(hdOCBuild(c).plan),metadata:c.fleet.metadata,shipMetadata:c.fleet.ships.map(s=>s.metadata),refs:c.fleet.portAttackersByRoute,other:JSON.stringify(f['4-3'][1])===ref.other,otherMap:JSON.stringify(f['4-5'])===ref.otherMap,exact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v)}},e.setup.reference);
  expect(e.after).toMatchObject({state:'complete',metadata:{keep:true},other:true,otherMap:true,exact:true});expect(e.after.goals.every(x=>x.ok)).toBe(true);expect(e.after.shipMetadata).toEqual(Array.from({length:6},(_,keep)=>({keep})));
  await panel.locator('[data-hd-oc-port-ship="1"]').uncheck();await page.evaluate(()=>{hdMapRouteSet('4-5',1);hdMSNOpen('4-5')});await expect(panel.locator('[data-hd-oc-port-ship]:checked')).toHaveCount(0);
  await page.evaluate(()=>hdMSNOpen('4-3'));await expect(panel.locator('[data-hd-oc-port-ship="0"]')).toBeChecked();await expect(panel.locator('[data-hd-oc-port-ship="1"]')).not.toBeChecked();await panel.locator('[data-hd-oc-port-clear]').click();await expect(panel.locator('[data-hd-oc-port-ship]:checked')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await finish(info,e,errors)}
});
test('rilanka shortage and unknown settings distinguish stock compatibility slot conflict and bounded search',async({page},info)=>{
 const e={},errors=[];page.on('pageerror',x=>errors.push(x.message));try{
  e.setup=await setupRilanka(page);await page.evaluate(()=>{localStorage.setItem(HD_FL_KEY,JSON.stringify(hdFLRows().filter(x=>!(x.name==='三式弾'&&Number(x.star)===4))));hdMSNOpen('4-3')});const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  await panel.locator('[data-hd-oc-port-ship="0"]').check();await panel.locator('[data-hd-oc-port-ship="1"]').check();await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toBeVisible();
  await expect(panel.locator('[data-hd-oc-port]')).toContainText('このセットだけの所持不足 1個');await expect(panel.locator('[data-hd-oc-port]')).toContainText('三式弾 あと1個');await expect(panel.locator('[data-hd-oc-port]')).toContainText('全目標の確定調達数ではありません');await expect(panel.locator('[data-hd-oc-port]')).toContainText('手持ちで不可能とは断定しません');
  e.cases=await page.evaluate(()=>{const c=hdOCContext('4-3','rilanka',0),b=hdOCBuild(c),r=HD_OC_CACHE.get('4-3:rilanka:0'),recon=b.inventory.find(x=>x.name==='零式水上観測機'),shell=b.inventory.find(x=>x.name==='三式弾'),carrier=b.slots.find(x=>x.si===2),p=hdFOClone(b.plan);p.sourceFleet.portAttackersByRoute['4-3:0']=[p.sourceFleet.portAttackersByRoute['4-3:0'][0]];
   const fixed=hdOCPortSeed(p,b.inventory,b.slots.filter(s=>s.si!==0||s.index!==1),hdSEChecks('4-3').rows,[],80),stale=hdFOClone(r.plan);stale.ships[0].masterId++;
   return {goals:hdOCPortMeasure(r.plan),search:r.search,shortages:r.shortages.map(x=>x.goalKind),fixed:{found:!!fixed.plan,limited:fixed.limited},carrierType3:hdOCPortFits('type3',carrier,shell),zeroRecon:hdOCPortFits('recon',{...b.slots[0],capacity:0},recon),stale:hdOCPortMeasure(stale),staleHtml:hdOCPortHtml(c,{plan:stale},'')};});
  expect(e.cases.goals.filter(x=>x.ok).length).toBeLessThan(2);expect(e.cases.search).toMatchObject({status:'incomplete',exhaustive:false,maxExamined:500});expect(e.cases.shortages).not.toContain('port-attacker-set');expect(e.cases.fixed.found).toBe(false);expect(e.cases.carrierType3).toBe(false);expect(e.cases.zeroRecon).toBe(false);expect(e.cases.stale[0]).toMatchObject({unresolved:true,ok:false});
  await page.evaluate(()=>{const f=loadCustomFleets();f['4-3'][0].portAttackersByRoute['4-3:0'][0].masterId++;saveCustomFleets(f);hdMSNOpen('4-3')});await expect(panel.locator('[data-hd-oc-port-result]').first()).toContainText('未確認');await expect(panel.locator('[data-hd-oc-port-result]').first()).toContainText('再指定');expect(errors).toEqual([]);
 }finally{await finish(info,e,errors)}
});
test('central port sets use each selected hull and persist through real search save load and route changes',async({page},info)=>{
 const e={},errors=[];page.on('pageerror',x=>errors.push(x.message));try{
  e.setup=await setup(page);const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  await panel.locator('[data-hd-oc-port-ship="0"]').check();await panel.locator('[data-hd-oc-port-ship="2"]').check();
  await expect(panel.locator('[data-hd-oc-port]')).toContainText('十分とは確認していません');
  await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toBeVisible();
  e.result=await page.evaluate(()=>{const r=HD_OC_CACHE.get('4-5:port:1');return {goals:hdOCPortMeasure(r.plan),usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),regressions:hdOCGoalRegressions(hdOCMeasure(hdOCBuild(hdOCContext('4-5','port',1)).plan,hdSEChecks('4-5').rows),r.measure),search:r.search,master:hdFEMasterValidation(r.plan),gear:r.plan.ships.map(s=>hdOCShipGear(s))}});
  expect(e.result.goals.map(x=>x.counts)).toEqual([{main:2,recon:1,type3:1},{main:2,recon:1,type3:1}]);expect(e.result.goals.every(x=>x.ok)).toBe(true);expect(e.result.regressions).toEqual([]);expect(e.result.master.valid).toBe(true);for(const [key,n] of Object.entries(e.result.usage))expect(n).toBeLessThanOrEqual(e.result.stock[key]);
  await panel.locator('[data-hd-oc-apply]').click();await page.reload({waitUntil:'load'});await page.waitForFunction(()=>typeof hdMSNOpen==='function'&&document.body.dataset.hdReady==='1');await page.evaluate(()=>hdMSNOpen('4-5'));
  await expect(panel.locator('[data-hd-oc-port-ship="0"]')).toBeChecked();await expect(panel.locator('[data-hd-oc-port-ship="2"]')).toBeChecked();
  e.after=await page.evaluate(ref=>{const f=loadCustomFleets(),c=hdOCContext('4-5','port',1),b=hdOCBuild(c);return {state:document.readyState,goals:hdOCPortMeasure(b.plan),refs:c.fleet.portAttackersByRoute,metadata:c.fleet.metadata,other:JSON.stringify(f['4-5'][1])===ref.other,otherMap:JSON.stringify(f['1-1'])===ref.otherMap,exact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v)}},e.setup.reference);
  expect(e.after.state).toBe('complete');expect(e.after.goals.every(x=>x.ok)).toBe(true);expect(e.after).toMatchObject({metadata:{keep:true},other:true,otherMap:true,exact:true});
  await panel.locator('[data-hd-oc-port-ship="2"]').uncheck();await panel.locator('[data-hd-oc-port-ship="3"]').check();await expect(panel.locator('[data-hd-oc-port-ship="0"]')).toBeChecked();
  await page.evaluate(()=>{hdMapRouteSet('4-5',0);hdMSNOpen('4-5')});await expect(panel.locator('[data-hd-oc-port]')).toHaveCount(0);
  await page.evaluate(()=>{hdMapRouteSet('4-5',1);hdMSNOpen('4-5')});await expect(panel.locator('[data-hd-oc-port-ship="0"]')).toBeChecked();await expect(panel.locator('[data-hd-oc-port-ship="2"]')).not.toBeChecked();await expect(panel.locator('[data-hd-oc-port-ship="3"]')).toBeChecked();
  await panel.locator('[data-hd-oc-port-clear]').click();await expect(panel.locator('[data-hd-oc-port-ship="0"]')).not.toBeChecked();expect(errors).toEqual([]);
 }finally{await finish(info,e,errors)}
});
test('central port incomplete search displays the named stock deficit without a victory or procurement claim',async({page},info)=>{
 const e={},errors=[];page.on('pageerror',x=>errors.push(x.message));try{
  e.setup=await setup(page);const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  e.boundary=await page.evaluate(()=>{hdOCPortSave(hdOCContext('4-5','port',1),0,true);hdOCPortSave(hdOCContext('4-5','port',1),2,true);const b=hdOCBuild(hdOCContext('4-5','port',1)),req=hdSEChecks('4-5').rows,cut=hdOCPortSeed(b.plan,b.inventory,b.slots,req,b.unknown,1),exact=hdOCPortSeed(b.plan,b.inventory,b.slots,req,b.unknown,8);return {cut:{examined:cut.examined,limited:cut.limited,found:!!cut.plan},exact:{examined:exact.examined,limited:exact.limited,goals:exact.plan&&hdOCPortMeasure(exact.plan)}}});
  expect(e.boundary.cut).toEqual({examined:1,limited:true,found:false});expect(e.boundary.exact.examined).toBe(8);expect(e.boundary.exact.limited).toBe(false);expect(e.boundary.exact.goals.map(x=>x.counts)).toEqual([{main:2,recon:1,type3:1},{main:2,recon:1,type3:1}]);
  // Extra owned star stack deliberately expands the joint-set search beyond
  // 800 operations; the original single-stack shortage exhausts at 544 instead.
  await page.evaluate(()=>{const rows=hdFLRows().filter(x=>!(x.name==='三式弾'&&Number(x.star)===4));rows.push({name:'35.6cm連装砲',star:1,count:2});localStorage.setItem(HD_FL_KEY,JSON.stringify(rows));hdMSNOpen('4-5')});
  await panel.locator('[data-hd-oc-port-ship="0"]').check();await panel.locator('[data-hd-oc-port-ship="2"]').check();await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toBeVisible();
  e.result=await page.evaluate(()=>{const r=HD_OC_CACHE.get('4-5:port:1');return {goals:hdOCPortMeasure(r.plan),search:r.search,shortages:r.shortages.map(x=>x.goalKind)}});expect(e.result.goals.filter(x=>x.ok).length).toBeLessThan(2);expect(e.result.search).toMatchObject({status:'incomplete',maxExamined:500,exhaustive:false});expect(e.result.shortages).not.toContain('port-attacker-set');
  await expect(panel.locator('[data-hd-oc-port]')).toContainText('このセットだけの所持不足 1個');await expect(panel.locator('[data-hd-oc-port-result]').filter({hasText:'妙高改二'})).toContainText('三式弾 あと1個');await expect(panel.locator('[data-hd-oc-port]')).toContainText('手持ちで不可能とは断定しません');expect(errors).toEqual([]);
  expect(e.result.search.portSeed).toMatchObject({examined:800,maxOperations:800,limited:true});expect(e.result.search.reasons).toContain('port-seed-limit');
  await expect(panel.locator('[data-hd-oc-search-status]')).toContainText('500/500');await expect(panel.locator('[data-hd-oc-search-status]')).toContainText('800/800');
  e.savedReference=await page.evaluate(()=>({other:JSON.stringify(loadCustomFleets()['4-5'][1]),keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1'].map(k=>[k,localStorage.getItem(k)])}));
  await panel.locator('[data-hd-oc-apply]').click();await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');await page.evaluate(()=>hdMSNOpen('4-5'));
  await expect(panel.locator('[data-hd-oc-saved-search]')).toContainText('保存時');await expect(panel.locator('[data-hd-oc-saved-search]')).toContainText('500/500');await expect(panel.locator('[data-hd-oc-saved-search]')).toContainText('担当艦セットの操作上限');
  e.after=await page.evaluate(ref=>({state:document.readyState,search:hdOCContext('4-5','port',1).fleet.searchAssessment,other:JSON.stringify(loadCustomFleets()['4-5'][1])===ref.other,exact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v)}),e.savedReference);expect(e.after).toMatchObject({state:'complete',other:true,exact:true});expect(e.after.search.reasons).toEqual(e.result.search.reasons);
  await page.evaluate(()=>{hdMapRouteSet('4-5',0);hdMSNOpen('4-5')});await expect(panel.locator('[data-hd-oc-saved-search]')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await finish(info,e,errors)}
});
test('central port finite allocations distinguish split sets stock slots compatibility unknown and preserved goals',async({page},info)=>{
 const e={},errors=[];page.on('pageerror',x=>errors.push(x.message));try{
  e.setup=await setup(page);
  e.cases=await page.evaluate(()=>{
   const c=hdOCContext('4-5','port',1);hdOCPortSave(c,0,true);hdOCPortSave(hdOCContext('4-5','port',1),2,true);const b=hdOCBuild(hdOCContext('4-5','port',1)),req=hdSEChecks('4-5').rows;
   const seed=hdOCPortSeed(b.plan,b.inventory,b.slots,req,b.unknown),ready=hdOCPortMeasure(seed.plan),usage=hdFOAssignedUsage(seed.plan);
   const split=hdFOClone(seed.plan);split.ships[0].items.find(x=>hdOCPortPart('type3',x)).name='';split.ships[1].items=[{name:'三式弾',star:0,slotIndex:0}];
   const poor=b.inventory.filter(x=>!(x.name==='三式弾'&&x.star===4)),short=hdOCPortSeed(b.plan,poor,b.slots,req,b.unknown,80);
   const shortage=hdOCPortHtml(hdOCContext('4-5','port',1),{plan:split},'');
   const fixed=b.slots.filter(s=>!(s.si===2&&s.index===3)),fixedResult=hdOCPortSeed(b.plan,b.inventory,fixed,req,b.unknown,80);
   const recon=b.inventory.find(x=>x.name==='零式水上偵察機'),bb=b.slots.find(x=>x.si===0),carrier=b.slots.find(x=>x.si===4);
   const stale=hdFOClone(seed.plan);stale.ships[0].masterId++;const staleResult=hdOCPortMeasure(stale);const deleted=hdFOClone(seed.plan);deleted.ships.splice(0,1);
   const raw=localStorage.getItem(CUSTOM_FLEET_KEY),oldGet=Storage.prototype.getItem,oldSet=Storage.prototype.setItem,faults=[];let fault='',writes=0;
   Storage.prototype.getItem=function(k){if(k===CUSTOM_FLEET_KEY){if(fault==='null')return null;if(fault==='throw')throw Error('injected read');if(fault==='json')return '{'}return Reflect.apply(oldGet,this,[k])};
   Storage.prototype.setItem=function(k,v){writes++;return Reflect.apply(oldSet,this,[k,v])};
   try{for(fault of ['null','throw','json']){let stopped=false;try{hdOCPortSave(c,0,false)}catch{stopped=true}faults.push({fault,stopped,writes,exact:Reflect.apply(oldGet,localStorage,[CUSTOM_FLEET_KEY])===raw})}}finally{Storage.prototype.getItem=oldGet;Storage.prototype.setItem=oldSet;}
   return {seed:{examined:seed.examined,limited:seed.limited,goals:ready,usage},split:hdOCPortMeasure(split),generic:hdSECapabilityMeasure(split,'cap-land-soft').count,short:!!short.plan,shortage,fixed:!!fixedResult.plan,incompatible:hdOCPortFits('recon',carrier,recon),zeroCapacity:hdOCPortFits('recon',{...bb,capacity:0},recon),stale:staleResult,deleted:hdOCPortMeasure(deleted),faults,regressions:hdOCGoalRegressions(hdOCMeasure(b.plan,req),hdOCMeasure(seed.plan,req))};
  });
  const r=e.cases;expect(r.seed.goals.every(x=>x.ok)).toBe(true);expect(r.split.map(x=>x.ok)).toEqual([false,true]);expect(r.generic).toBeGreaterThan(0);expect(r.short).toBe(false);expect(r.fixed).toBe(false);expect(r.incompatible).toBe(false);expect(r.zeroCapacity).toBe(false);expect(r.stale[0].unresolved).toBe(true);expect(r.deleted[0].unresolved).toBe(true);expect(r.regressions).toEqual([]);for(const f of r.faults)expect(f).toMatchObject({stopped:true,writes:0,exact:true});expect(r.shortage).toContain('長門改に三式弾 あと1個');expect(errors).toEqual([]);
 }finally{await finish(info,e,errors)}
});
