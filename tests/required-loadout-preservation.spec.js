const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block',viewport:{width:390,height:844},hasTouch:true,isMobile:true});
async function prepare(page,twoShips=false){
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
 await page.evaluate(twoShips=>{
  localStorage.setItem(HD_FL_KEY,JSON.stringify([{name:'10cm連装高角砲＋高射装置',count:1},{name:'13号対空電探改',count:1},{name:'三式水中探信儀',count:1},{name:'三式爆雷投射機',count:1}]));
  hdSEChecks=()=>({rows:[{kind:'cap-aa',label:'対空カットイン',minCount:1},{kind:'対潜',label:'対潜装備',minCount:2},{kind:'cap-asw',label:'対潜シナジー',minCount:1}],adv:{}});hdFEEnemyAirCandidates=()=>[];
  const ships=[{ship:'時雨改二',gear:'10cm連装高角砲＋高射装置 / 13号対空電探改 / 三式水中探信儀'},...(twoShips?[{ship:'夕立改二',gear:''}]:[])];
  saveCustomFleets({'1-1':[{id:'preserve',name:'装備維持',openingAswCount:0,ships}]});
 },twoShips);
}
test('owned search keeps a satisfied AA set when ASW sets cannot coexist in three slots',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{const c=hdOCContext('1-1','preserve',0),b=hdOCBuild(c),before=hdOCMeasure(b.plan,hdSEChecks('1-1').rows),result=hdOCSearch(c);return {before,result}});
 expect(r.before.goals.find(g=>g.kind==='cap-aa').ok).toBe(true);
 expect(r.result.measure.goals.find(g=>g.kind==='cap-aa').ok).toBe(true);
 expect(r.result.measure.complete).toBe(false);expect(r.result.shortages.some(g=>g.goalKind==='cap-asw')).toBe(true);
});
test('owned search adds ASW on another ship while preserving AA and inventory',async({page})=>{
 await prepare(page,true);const r=await page.evaluate(()=>{const result=hdOCSearch(hdOCContext('1-1','preserve',0));return {result,usage:hdFOAssignedUsage(result.plan),stock:[...hdFLInventory().values()],invalid:hdFEMasterValidation(result.plan).invalid}});
 expect(r.result.measure.goals.every(g=>g.ok)).toBe(true);expect(r.invalid).toEqual([]);for(const x of r.stock)expect(r.usage[x.key]||0).toBeLessThanOrEqual(x.count);
});
test('quick refinement keeps AA equipment in saved fleet and calculator and displays unresolved ASW',async({page})=>{
 await prepare(page);const r=await page.evaluate(async()=>{
  const c=hdOCContext('1-1','preserve',0),built=hdOCBuild(c),plan=built.plan;
  plan.index=0;plan.createdAt=Date.now();plan.suggestion={index:0,routeIndex:0,preset:{...c.preset,openingAswCount:0},slots:plan.ships.map(s=>({profile:{type:s.type,row:{name:s.ship,masterId:hdFEFindShip(s.ship).id}}}))};
  plan.missing=[];plan.used={};plan.owned={};hdFLUpdateAssessment(plan);HD_FL_CACHE['1-1:0']=plan;hdFSMap=()=> '1-1';
  const host=document.createElement('div');document.body.append(host);await hdFLRefine(plan,host);
  const saved=hdFLSave(0),context=hdFLContext(plan),imported=hdFCImportOwnedPlan(context,{plan,signature:hdOCSignature(context)});
  return {goals:plan.assessment.measure.goals,saved,imported,gear:hdFCState('1-1',`owned:${context.fleet.id}:0`).gear,html:host.textContent};
 });
 expect(r.goals.find(g=>g.kind==='cap-aa').ok).toBe(true);expect(r.goals.find(g=>g.kind==='cap-asw').ok).toBe(false);
 expect(r.saved.ships[0].gear).toContain('10cm連装高角砲＋高射装置');expect(r.saved.ships[0].gear).toContain('13号対空電探改');expect(r.imported).not.toBe(false);expect(r.gear.some(g=>g.name==='13号対空電探改')).toBe(true);expect(r.html).toContain('対潜シナジー：不足');expect(r.html).toContain('対策不足 2項目');
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');expect(await page.evaluate(id=>loadCustomFleets()['1-1'].find(f=>f.id===id).ships[0].gear,r.saved.id)).toBe(r.saved.ships[0].gear);
});
test('all optimizer modes preserve satisfied equipment sets instead of trading them for ASW totals',async({page})=>{
 await prepare(page);const r=await page.evaluate(()=>{
  const c=hdOCContext('1-1','preserve',0),plan=hdOCBuild(c).plan;
  return Object.keys(HD_FO_MODES).map(mode=>{const out=hdFOOptimize(plan,mode);return {mode,goals:hdOCMeasure(out,hdSEChecks('1-1').rows).goals,usage:hdFOAssignedUsage(out)}});
 });
 for(const x of r){expect(x.goals.find(g=>g.kind==='cap-aa').ok,x.mode).toBe(true);expect(x.goals.find(g=>g.kind==='cap-asw').ok,x.mode).toBe(false);expect(Object.values(x.usage).every(n=>n<=1),x.mode).toBe(true)}
});

// Independent finite oracle: six ordinary DD slots, optional sonar/projector
// and AA pairs on the same hull. No application matcher, score or search is used.
function finiteSetOracle(stock,aswTarget,aaTarget=0){
 const symbols=['',...Object.keys(stock)],slots=6;
 for(let code=0;code<symbols.length**slots;code++){
  let n=code;const ships=[[],[]],used={};let valid=true;
  for(let i=0;i<slots;i++){const item=symbols[n%symbols.length];n=Math.floor(n/symbols.length);ships[Math.floor(i/3)].push(item);if(item&&(used[item]=(used[item]||0)+1)>stock[item]){valid=false;break}}
  if(!valid)continue;
  const asw=ships.filter(s=>s.some(x=>x==='sonar0'||x==='sonar6')&&s.includes('projector')).length;
  const aa=ships.filter(s=>s.includes('ha')&&s.includes('radar')).length;
  if(asw>=aswTarget&&aa>=aaTarget)return true;
 }return false;
}
async function finiteFixture(page,{projectors=2,aa=false}={}){
 await prepare(page,true);await page.evaluate(({projectors,aa})=>{
  const names=['時雨改二','夕立改二'],sonar='三式水中探信儀',gun='12.7cm連装砲';
  const gears=aa?['10cm連装高角砲＋高射装置 / 13号対空電探改 / '+sonar+' ★6',sonar+' / 三式爆雷投射機 / '+gun]:[sonar+' ★6 / '+gun+' / '+gun,sonar+' ★6 / '+gun+' / '+gun];
  const rows=names.map((name,i)=>({id:'finite-'+i,name,gameShipId:9100+i,masterId:hdShipDbMasterRowFor({name}).id,level:99,gameSlotEx:0,gameAsw:70,gameLos:40,gameGearSlots:hdFEGearTokens(gears[i]),gameGearExpansion:'',gameAswGearKnown:true}));
  localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:88}));
  localStorage.setItem('harbordesk-pwa-v1',JSON.stringify({resources:{fuel:4321,ammo:3456,steel:4567,bauxite:5678},memo:'finite inventory preservation'}));
  hdFCSaveAll({'1-1':{manual:hdFCDefaultState('1-1','manual')}});
  localStorage.setItem(HD_FL_KEY,JSON.stringify([{name:sonar,star:0,count:1},{name:sonar,star:6,count:1},{name:'三式爆雷投射機',count:projectors},{name:gun,count:6},...(aa?[{name:'10cm連装高角砲＋高射装置',count:1},{name:'13号対空電探改',count:1}]:[])]));
  hdSEChecks=()=>({rows:[...(aa?[{kind:'cap-aa',label:'明示対空CI',minCount:1}]:[]),{kind:'cap-asw',label:'明示対潜2組',minCount:2}],adv:{}});
  saveCustomFleets({'1-1':[{id:'finite',name:'有限在庫専用',openingAswCount:0,ships:rows.map((r,i)=>({ship:r.name,rosterId:r.id,gameShipId:r.gameShipId,masterId:r.masterId,gear:gears[i]}))}]});
  window.finiteKeys=['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1','harbordesk-custom-fleets-v1','harbordesk-fleet-calculator-v1'];
  window.finiteRun=()=>{const c=hdOCContext('1-1','finite',0),steps=hdOCSearchSteps(c,{maxExamined:800,maxDepth:6});let n;do{n=steps.next()}while(!n.done);return {c,result:n.value}};
  window.finiteUsage=p=>{
   // Count physical slots independently, including expansions, by name and star.
   const counts={};for(const s of p.ships)for(const x of [...s.items,s.expansion].filter(x=>x?.name)){const k=x.name+'@'+(Number(x.star)||0);counts[k]=(counts[k]||0)+1}
   return Object.entries(counts).map(([key,count])=>({key,count,owned:hdFLRows().filter(x=>x.name+'@'+(Number(x.star)||0)===key).reduce((n,x)=>n+Number(x.count),0)}));
  };
 },{projectors,aa});
}
test('finite mixed-star inventory repairs duplicated source gear and survives save reload and planner import',async({page})=>{
 expect(finiteSetOracle({sonar0:1,sonar6:1,projector:2},2)).toBe(true);
 await finiteFixture(page);const r=await page.evaluate(()=>{
  const before=finiteKeys.map(k=>localStorage.getItem(k)),{c,result}=finiteRun(),usage=finiteUsage(result.plan),goals=result.measure.goals;
  const searchPreserved=finiteKeys.map(k=>localStorage.getItem(k));
  const imported=hdFCImportOwnedPlan(c,result),state=hdFCState(c.map,hdFCSelection(c.map));
  const fleets=loadCustomFleets();fleets['1-1'][0].ships=result.plan.ships.map(s=>({...c.fleet.ships.find(x=>x.gameShipId===s.gameShipId),gear:hdOCShipGear(s)}));saveCustomFleets(fleets);
  return {before,searchPreserved,usage,goals,imported,gear:state.gear.map(x=>[x.name,x.star||0,x.slotIndex]),planGear:result.plan.ships.flatMap(s=>s.items).map(x=>[x.name,x.star||0,x.slotIndex]),saved:finiteKeys.map(k=>localStorage.getItem(k))};
 });expect(r.before.every(x=>x!==null)).toBe(true);expect(r.searchPreserved).toEqual(r.before);expect(r.goals.find(g=>g.kind==='cap-asw')).toMatchObject({ok:true,count:2});
 for(const x of r.usage)expect(x.count,x.key).toBeLessThanOrEqual(x.owned);
 expect(r.usage.filter(x=>x.key.startsWith('三式水中探信儀@')).map(x=>[x.key,x.count]).sort()).toEqual([['三式水中探信儀@0',1],['三式水中探信儀@6',1]]);
 expect(r.imported).not.toBe(false);expect(r.gear).toEqual(r.planGear);
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 const after=await page.evaluate(()=>{const keys=['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1','harbordesk-custom-fleets-v1','harbordesk-fleet-calculator-v1'];const f=loadCustomFleets()['1-1'][0];return {keys:keys.map(k=>localStorage.getItem(k)),ships:f.ships.map(x=>({id:x.gameShipId,roster:x.rosterId})),asw:hdSECapabilityMeasure(hdFEPlanFromSavedFleet('1-1',f),'cap-asw').count}});
 expect(after.keys).toEqual(r.saved);expect(after.ships).toEqual([{id:9100,roster:'finite-0'},{id:9101,roster:'finite-1'}]);expect(after.asw).toBe(2);
});
test('finite projector shortage names the missing part and quantity without duplicating one owned item',async({page})=>{
 expect(finiteSetOracle({sonar0:1,sonar6:1,projector:1},2)).toBe(false);
 await finiteFixture(page,{projectors:1});const r=await page.evaluate(()=>{const {c,result}=finiteRun();HD_OC_CACHE.set('1-1:finite:0',result);const shortage=result.shortages.find(g=>g.goalKind==='cap-asw');return {goal:result.measure.goals.find(g=>g.kind==='cap-asw'),shortage,usage:finiteUsage(result.plan),html:hdOCPanel(c.map,c.fleet.id,0),complete:result.measure.complete}});
 expect(r.complete).toBe(false);expect(r.goal).toMatchObject({ok:false,count:1});for(const x of r.usage)expect(x.count,x.key).toBeLessThanOrEqual(x.owned);
 expect(r.shortage.stock.parts.some(x=>x.need===2&&x.have===1&&x.label.includes('投射'))).toBe(true);expect(r.shortage.candidates).toContain('三式爆雷投射機');
 expect(r.html).toContain('あと1個');expect(r.html).toContain('三式爆雷投射機');expect(r.html).toContain('明示対潜2組');expect(r.html).toContain('入手方法を見る');
});
test('finite set conflicts preserve explicit AA and stock through every optimizer mode',async({page})=>{
 expect(finiteSetOracle({sonar0:1,sonar6:1,projector:2,ha:1,radar:1},2,1)).toBe(false);
 await finiteFixture(page,{aa:true});const r=await page.evaluate(()=>{
  const {result}=finiteRun(),before=result.measure,variants=Object.keys(HD_FO_MODES).map(mode=>{const p=hdFOOptimize(result.plan,mode);return {mode,usage:finiteUsage(p),goals:hdOCMeasure(p,hdSEChecks('1-1').rows).goals}});
  const shortage=result.shortages.find(g=>g.goalKind==='cap-asw');return {before,variants,stock:hdSECapabilityStock(result.plan,'cap-asw',2),search:result.search,shortage,stockHtml:hdOCCapabilityStockHtml(shortage)};
 });expect(r.stock.complete).toBe(true);expect(r.search).toMatchObject({status:'incomplete',exhaustive:false});expect(r.before.goals.find(g=>g.kind==='cap-aa').ok).toBe(true);expect(r.before.goals.find(g=>g.kind==='cap-asw').ok).toBe(false);
 expect(r.shortage.stock.parts.every(x=>x.have>=x.need)).toBe(true);
 expect(r.stockHtml).toContain('この装備例の所持数は足りています');expect(r.stockHtml).toContain('装備枠');expect(r.stockHtml).not.toContain('あと1個');
 for(const v of r.variants){expect(v.goals.find(g=>g.kind==='cap-aa').ok,v.mode).toBe(true);expect(v.goals.find(g=>g.kind==='cap-asw').ok,v.mode).toBe(false);for(const x of v.usage)expect(x.count,v.mode+' '+x.key).toBeLessThanOrEqual(x.owned)}
});
