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
