const {test,expect}=require('@playwright/test');
const routeVersionFixture=require('../app-version.json');

// Conditional M-to-P LOS belongs to the existing fixed smoke file list.
{
 const scoutingTest=test.extend({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true,trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});
 for(const state of ['exempt','required-ready','required-missing','unknown'])scoutingTest(`5-4 M-to-P scouting ${state} preserves the saved proposal`,async({page},info)=>{
  const evidence={state,scope:'synthetic 5-4 central; conditional M-to-P scouting only'},errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.route('**/*',r=>{const u=new URL(r.request().url()),v=(u.origin==='https://raw.githubusercontent.com'&&u.pathname==='/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json')||(u.origin==='http://127.0.0.1:4173'&&u.pathname==='/app-version.json');if(r.request().method()==='GET'&&v)return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:routeVersionFixture.version,build:routeVersionFixture.build})});return ['localhost','127.0.0.1'].includes(u.hostname)?r.continue():r.fulfill({status:204,body:''})});
   await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
   const ref=await page.evaluate(state=>{
    const names=['金剛改二','榛名改二','鈴谷改二','熊野改二','時雨改二','雪風改'];if(state==='unknown')names[2]='合成・速力未登録';
    const bb='35.6cm連装砲',ca='20.3cm(3号)連装砲',recon='零式水上観測機',radar='33号水上電探',fish='61cm四連装(酸素)魚雷',t='改良型艦本式タービン',can='新型高温高圧缶',fast=['exempt','unknown'].includes(state);
    const gear=fast?[[bb,bb,t,can],[bb,bb,t,can],state==='unknown'?[]:[ca,ca,t,can],[ca,ca,t,can],[fish,t,can],[fish,t,can]]:state==='required-ready'?[[bb,bb,recon,radar],[bb,bb,recon,radar],[ca,ca,recon],[ca,ca,recon],[fish,fish],[]]:[[bb,bb],[bb,bb],[ca,ca],[ca,ca],[fish,fish],[]];
    const rows=names.map((name,i)=>{const db=hdFEFindShip(name),m=db&&hdShipDbMasterRowFor(db),profile=db&&hdShipDbSlotProfile(db),slots=Array.from({length:profile?.count||0},(_,j)=>gear[i][j]||'');return {id:'m-scout-'+i,name,masterId:m?.id||0,gameShipId:15400+i,level:99,gameSlotEx:0,...(state==='exempt'?{}:{gameLos:(state==='required-ready'?49:16)+slots.reduce((n,x)=>n+(Number(hdFEFind(x)?.stats?.索敵)||0),0)}),gameAswGearKnown:true,gameGearSlots:slots,gameGearExpansion:'',metadata:{keep:i}}});
    const counts=new Map();for(const row of rows)for(const name of row.gameGearSlots)if(name)counts.set(name,(counts.get(name)||0)+1);
    localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,JSON.stringify([...counts].map(([name,count])=>({name,count,star:0}))));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({...(state==='exempt'?{}:{admiralLevel:120}),metadata:{keep:true}}));localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
    saveCustomFleets({'5-4':[{id:'m-scout',name:'合成：M→P索敵免除',memo:'keep memo',openingAswCount:0,routePreset:MAP_PLANS['5-4'].presets[0],metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:r.gameGearSlots.map((x,j)=>i===0&&j===1?'':x).join(' / '),metadata:{keep:i}}))},{id:'other',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
    localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify([{id:'untouched',map:'1-1',metadata:{keep:true},gearItems:[]}]));localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));hdMapRouteSet('5-4',0);hdMSNOpen('1-1');
    const all=loadCustomFleets();return {custom:localStorage.getItem(CUSTOM_FLEET_KEY),procurement:localStorage.getItem(HD_PROCUREMENT_KEY),keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(all['5-4'][1]),otherMap:JSON.stringify(all['1-1']),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated']),identities:JSON.stringify(all['5-4'][0].ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))};
   },state);
   await page.locator('#hdMapStrategyMap').selectOption('5-4');await page.locator('#hdMapStrategyRoute').selectOption('0');await page.locator('#hdMapStrategyFleet').selectOption('m-scout');const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
   evidence.before=await page.evaluate(()=>hdOCBuild(hdOCContext('5-4','m-scout',0)).plan.ships[0].items.filter(x=>x.name==='35.6cm連装砲').length);expect(evidence.before).toBe(1);
   async function search(){
    await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toBeVisible();
    const r=await page.evaluate(()=>{const r=HD_OC_CACHE.get('5-4:m-scout:0');return {route:hdFERoute(r.plan),scouting:hdFEPlanScouting(r.plan,hdOCAssigned(r.plan)),exemption:hdFEScoutingExemption(r.plan),master:hdFEMasterValidation(r.plan),measure:r.measure,search:r.search,usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),gear:r.plan.ships.map(s=>s.items),names:r.plan.ships.map(s=>s.ship),shortages:r.shortages.map(g=>({kind:g.goalKind||g.kind,stockGap:hdOCStockGap(g)}))}});(evidence.samples??=[]).push(r);
    expect(r.search.maxExamined).toBe(10000);expect(r.measure.speedTarget).toBe(0);expect(r.gear[0].filter(x=>x.name==='35.6cm連装砲')).toHaveLength(2);for(const [k,n]of Object.entries(r.usage))expect(n).toBeLessThanOrEqual(r.stock[k]);
    expect(r.names).toEqual(['金剛改二','榛名改二',state==='unknown'?'合成・速力未登録':'鈴谷改二','熊野改二','時雨改二','雪風改']);
    await panel.locator('[data-hd-required-route] summary').click();const checks=panel.locator('[data-hd-required-route]');await expect(checks).toContainText('M→P');await expect(checks).toContainText('D→E');await expect(checks).toContainText('元の艦種');await expect(panel.locator('[data-hd-route-requirements="5-4:0"]')).toContainText('渦潮対策の電探は任意');
    const m=r.route.contract.checks.find(x=>x.condition.any&&x.condition.reason?.startsWith('M→P'));
    if(state==='exempt'){
     expect(r.exemption.status).toBe('ready');expect(m.status).toBe('ready');expect(r.route.status).toBe('ready');expect(r.scouting).toMatchObject({notRequired:true,available:false,score:null,reason:'exempt'});expect(r.measure.scoutingExempt).toBe(true);expect(r.measure.goals.some(g=>['los-value','索敵'].includes(g.kind))).toBe(false);expect(r.shortages.some(g=>['los-value','索敵'].includes(g.kind))).toBe(false);await expect(checks).toContainText('索敵条件は非適用');expect(await panel.locator('[data-hd-oc-acquire="索敵"]').count()).toBe(0);expect(r.master.valid).toBe(true);
    }else if(state==='required-ready'){
     expect(r.exemption.status).toBe('missing');expect(m.status).toBe('ready');expect(r.route.status).toBe('ready');expect(r.scouting.available).toBe(true);expect(r.scouting.coef).toBe(2);expect(r.scouting.score).toBeGreaterThanOrEqual(45);expect(r.measure.goals.find(g=>g.kind==='los-value')).toMatchObject({ok:true,minCount:45});expect(r.master.valid).toBe(true);
    }else if(state==='required-missing'){
     // Independent synthetic arithmetic: six sqrt(16), no equipment LOS,
     // coefficient2 and HQ120 =>24-48=-24, below the documented safe45.
     expect(r.exemption.status).toBe('missing');expect(m.status).toBe('missing');expect(r.route.status).toBe('missing');expect(r.scouting.score).toBe(-24);expect(r.measure.goals.find(g=>g.kind==='los-value')).toMatchObject({ok:false,minCount:45,count:-24});expect(r.shortages.find(g=>g.kind==='los-value').stockGap).toBe(0);expect(r.master.valid).toBe(true);
    }else{
     expect(r.exemption.status).toBe('manual');expect(m.status).toBe('manual');expect(r.route.status).toBe('manual');expect(r.scouting.notRequired===true).toBe(false);expect(r.scouting.status).toBe('manual');expect(r.master.valid).toBe(false);await expect(checks).toContainText('速力未判定');expect(r.shortages.some(g=>g.kind==='los-value')).toBe(false);
    }
    evidence.ui={checks:await checks.innerText(),goals:await panel.locator('.hd-oc-goal').allInnerTexts(),shortages:await panel.locator('.hd-oc-shortage').allInnerTexts()};return r;
   }
   await search();await panel.locator('[data-hd-oc-apply]').click();
   if(state==='unknown'){await expect(page.getByText(/元の保存編成は上書きしません/)).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem(CUSTOM_FLEET_KEY))).toBe(ref.custom);}
   else{await page.locator('#mapStrategyNavigator [data-hd-msn-action="fleet"]').click();await page.locator('#customFleetPanel [data-cf-id="m-scout"] [data-cf-edit]').click();await page.locator('#customFleetMemo').fill('keep memo / edited');await page.locator('#customFleetDialog button[value="default"]').click();}
   evidence.preserved=await page.evaluate(ref=>{const a=loadCustomFleets(),f=a['5-4'][0];return {sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(a['5-4'][1])===ref.other,otherMap:JSON.stringify(a['1-1'])===ref.otherMap,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities,metadata:f.metadata,memo:f.memo}},ref);
   expect(evidence.preserved).toMatchObject({sourcesExact:true,other:true,otherMap:true,procurement:true,otherPlanner:true,identitiesExact:true,metadata:{keep:true},memo:state==='unknown'?'keep memo':'keep memo / edited'});
   const saved=await page.evaluate(()=>localStorage.getItem(CUSTOM_FLEET_KEY));await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');const doc=await page.evaluate(()=>performance.timeOrigin);await page.evaluate(()=>hdMSNOpen('5-4'));await search();
   evidence.load=await page.evaluate(({ref,saved,doc})=>({sameDocument:performance.timeOrigin===doc,readyState:document.readyState,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===saved,sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement}),{ref,saved,doc});expect(evidence.load).toEqual({sameDocument:true,readyState:'complete',customExact:true,sourcesExact:true,otherPlanner:true,procurement:true});expect(errors).toEqual([]);
  }finally{evidence.pageerrors=errors;const p=info.outputPath('route-guidance-evidence.json');await require('node:fs/promises').writeFile(p,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:p,contentType:'application/json'})}
 });
}
test.use({serviceWorkers:'block',hasTouch:true,isMobile:true});
async function prepare(page,map,index,names,gear=[]){
 await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCRequiredChecks==='function');
 await page.evaluate(({map,index,names,gear})=>{
  const rows=names.map((name,i)=>({id:'boundary-'+i,name,gameShipId:8500+i,masterId:hdShipDbMasterRowFor({name}).id,level:99,gameSlotEx:0,gameLos:100,gameGearSlots:gear,gameGearExpansion:'',gameAswGearKnown:true}));
  localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120}));
  localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));
  const fleet={id:'boundary',openingAswCount:0,routePreset:{...MAP_PLANS[map].presets[index]},ships:rows.map(r=>({ship:r.name,rosterId:r.id,gameShipId:r.gameShipId,masterId:r.masterId,gear:gear.join(' / ')}))};
  window.boundaryPlan=hdFEPlanFromSavedFleet(map,fleet);boundaryPlan.openingAswCount=0;
 },{map,index,names,gear});
}
test('5-3 conditional speed accepts either one slow battleship or two fast battleships without ANDing both branches',async({page})=>{
 await prepare(page,'5-3',0,['長門改二','妙高改二','矢矧改二','時雨改二','夕立改二','綾波改二']);
 const r=await page.evaluate(()=>{
  const status=p=>hdOCRequiredChecks(p).find(x=>x.condition.any)?.status;
  const one=hdFOClone(boundaryPlan),twoFast=hdFOClone(one);twoFast.ships[0].ship='金剛改二';twoFast.ships[0].masterId=hdShipDbMasterRowFor({name:'金剛改二'}).id;twoFast.ships[1].ship='榛名改二';twoFast.ships[1].masterId=hdShipDbMasterRowFor({name:'榛名改二'}).id;
  const mixed=hdFOClone(twoFast);mixed.ships[0].ship=one.ships[0].ship;mixed.ships[0].masterId=one.ships[0].masterId;
  return {one:status(one),fast:status(twoFast),mixed:status(mixed),lost:hdOCGoalRegressions(hdOCMeasure(one,[]),hdOCMeasure(mixed,[])).filter(x=>x.mandatory).length};
 });expect(r).toEqual({one:'ready',fast:'ready',mixed:'missing',lost:1});
});
test('4-5 fast-plus route and coefficient2 scouting71 route never inherit each other requirements',async({page})=>{
 await prepare(page,'4-5',0,['金剛改二','榛名改二','鈴谷改二','熊野改二','矢矧改二','時雨改二'],['改良型艦本式タービン','新型高温高圧缶']);
 const r=await page.evaluate(()=>{
  const a=hdOCRequiredChecks(boundaryPlan),long=hdFOClone(boundaryPlan);long.preset={...MAP_PLANS['4-5'].presets[1]};long.routeInfo=hdFSPresetInfo(long.preset);long.sourceFleet.routePreset=long.preset;
  const b=hdOCRequiredChecks(long);return {shortSpeed:a.find(x=>x.condition.kind==='minSpeed'),shortLos:a.some(x=>x.condition.kind==='scoutingValue'),longSpeed:b.some(x=>x.condition.kind==='minSpeed'),longLos:b.find(x=>x.condition.kind==='scoutingValue')?.condition};
 });expect(r.shortSpeed).toMatchObject({status:'ready',condition:{rank:15}});expect(r.shortLos).toBe(false);expect(r.longSpeed).toBe(false);expect(r.longLos).toMatchObject({coef:2,min:71});
});
test('6-4 light cruiser flagship remains independently protected when the route still has other unmet goals',async({page})=>{
 await prepare(page,'6-4',0,['矢矧改二','金剛改二','鈴谷改二','時雨改二','夕立改二','綾波改二']);
 const r=await page.evaluate(()=>{const p=boundaryPlan,q=hdFOClone(p);[q.ships[0],q.ships[1]]=[q.ships[1],q.ships[0]];return {before:hdOCRequiredChecks(p).find(x=>x.condition.kind==='flagshipType').status,after:hdOCRequiredChecks(q).find(x=>x.condition.kind==='flagshipType').status,lost:hdOCGoalRegressions(hdOCMeasure(p,[]),hdOCMeasure(q,[])).filter(x=>x.condition?.kind==='flagshipType').length};});
 expect(r).toEqual({before:'ready',after:'missing',lost:1});
});
test('7-3 second route checks each historical hull and rejects replacing only Ashigara',async({page})=>{
 await prepare(page,'7-3',1,['羽黒改二','足柄改二','神風改','時雨改二','夕立改二','綾波改二']);
 const r=await page.evaluate(()=>{const p=boundaryPlan,q=hdFOClone(p);q.ships[1].ship='妙高改二';q.ships[1].masterId=hdShipDbMasterRowFor({name:'妙高改二'}).id;return {before:hdOCRequiredChecks(p).filter(x=>x.condition.kind==='namedCount').map(x=>x.status),lost:hdOCGoalRegressions(hdOCMeasure(p,[]),hdOCMeasure(q,[])).filter(x=>x.condition?.kind==='namedCount').length};});
 expect(r.before.length).toBeGreaterThan(0);expect(r.before.every(x=>x==='ready')).toBe(true);expect(r.lost).toBeGreaterThan(0);
});
// Registered safe thresholds are route-specific. Scores below these targets
// do not prove that random or partially documented routes are unreachable.
for(const [map,index,coef,min] of [
 ['2-5',1,1,34],['4-5',1,2,71],['7-2',1,4,69],['7-5',2,4,63],
 ['3-5',0,4,28],['3-5',1,4,40],['5-5',0,2,80],['5-5',1,2,66],
 ['6-1',0,4,25],['6-2',0,3,50],['6-3',0,3,38],['6-5',0,3,50],['6-5',1,3,35]
])test(`${map} example${index+1} exact numeric route boundary uses coefficient${coef} threshold${min}`,async({page})=>{
 await prepare(page,map,index,['矢矧改二','鈴谷改二','熊野改二','時雨改二','夕立改二','綾波改二']);
 const r=await page.evaluate(({coef,min})=>{
  const p=boundaryPlan,condition=hdOCRequiredChecks(p).find(x=>x.condition.kind==='scoutingValue').condition,ships=hdFERouteShips(p);
  // Isolate threshold/unknown/coef comparison from the separately tested 33-formula.
  // These are numeric-layer fixtures, not claims of attainable ship stats or full route readiness.
  const scouting=hdFEScouting,match=hdFEGameMatch;let sample={available:true,coef,score:min};
  hdFEGameMatch=()=>({status:'ready'});hdFEScouting=()=>sample;
  const check=()=>hdFEBranchPredicate(condition,ships,p);
  try{const exact=check();sample={...sample,score:min-.01};const below=check();sample={...sample,score:min+.01};const above=check();sample={...sample,coef:coef===4?1:4};const wrongCoef=check();sample={available:false,coef,score:null};const unknown=check();return {condition,exact,below,above,wrongCoef,unknown};}finally{hdFEScouting=scouting;hdFEGameMatch=match;}
 },{coef,min});
 expect(r.condition).toMatchObject({coef,min});expect(r.exact.status).toBe('ready');expect(r.below.status).toBe('missing');expect(r.below.detail).toContain('あと');expect(r.above.status).toBe('ready');expect(r.wrongCoef.status).toBe('manual');expect(r.unknown.status).toBe('manual');
});
test('small finite sonar inventory has an independent exhaustive oracle and bounded search never proves shortage',async({page})=>{
 await prepare(page,'1-2',0,['時雨改二','夕立改二','綾波改二','島風改']);
 const r=await page.evaluate(()=>{
  // Four known three-slot destroyers, one compatible item kind, target two items.
  // Exhaust all 2^12 assignments independently of search candidates/scoring.
  const oracle=stock=>{for(let mask=0;mask<(1<<12);mask++){let used=0;for(let i=0;i<12;i++)used+=(mask>>i)&1;if(used<=stock&&used>=2)return true}return false};
  // Occupy all twelve slots: otherwise the ordinary-slot fill legitimately
  // completes this tiny fixture even after the bounded search stops.
  const guns=Array(3).fill('12.7cm連装砲');boundaryPlan.sourceFleet.ships.forEach(s=>s.gear=guns.join(' / '));
  const roster=hdFERoster();roster.forEach(s=>s.gameGearSlots=guns);localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(roster));
  hdSEChecks=()=>({rows:[{kind:'対潜',label:'有限在庫の装備数fixture',minCount:2}],adv:{}});hdFEEnemyAirCandidates=()=>[];
  const run=(stock,depth)=>{
   localStorage.setItem(HD_FL_KEY,JSON.stringify([{name:'三式水中探信儀',count:stock},{name:'12.7cm連装砲',count:12}]));const c={map:'1-2',index:0,preset:MAP_PLANS['1-2'].presets[0],fleet:boundaryPlan.sourceFleet};
   const steps=hdOCSearchSteps(c,{maxExamined:200,maxDepth:depth});let next;do{next=steps.next()}while(!next.done);const out=next.value;
   return {oracle:oracle(stock),goal:out.measure.goals.find(g=>g.kind==='対潜'),search:out.search,usage:hdFOAssignedUsage(out.plan),html:hdOCSearchStatusHtml(out)};
  };
  return {enough:run(2,2),short:run(1,2),bounded:run(2,1)};
 });
 expect(r.enough.oracle).toBe(true);expect(r.enough.goal.ok).toBe(true);expect(r.enough.goal.count).toBe(2);
 expect(r.short.oracle).toBe(false);expect(r.short.goal.ok).toBe(false);expect(r.short.goal.count).toBeLessThanOrEqual(1);
 expect(r.bounded.oracle).toBe(true);expect(r.bounded.goal.ok).toBe(false);expect(r.bounded.search).toMatchObject({status:'incomplete',exhaustive:false});expect(r.bounded.html).toContain('不足を証明するものではありません');
});

// Registered 7-3 second example: preserve Haguro/Ashigara and the DD count.
// This covers the speed predicate, not all branches, sufficient combat gear or victory.
const sevenRouteTest=test.extend({trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});
sevenRouteTest.describe('7-3 second route speed',()=>{
 sevenRouteTest.use({viewport:{width:390,height:844}});
 for(const state of ['ready','stock','type-mismatch','unknown'])sevenRouteTest(`7-3 second route speed ${state} preserves named hulls and saved data`,async({page},info)=>{
  const evidence={state,scope:'registered speed condition; synthetic owned inventory and identities'},errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.route('**/*',r=>{
    const u=new URL(r.request().url()),version=(u.origin==='https://raw.githubusercontent.com'&&u.pathname==='/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json')||(u.origin==='http://127.0.0.1:4173'&&u.pathname==='/app-version.json');
    if(r.request().method()==='GET'&&version)return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:routeVersionFixture.version,build:routeVersionFixture.build})});
    return ['localhost','127.0.0.1'].includes(u.hostname)?r.continue():r.fulfill({status:204,body:''});
   });
   await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
   const reference=await page.evaluate(state=>{
    const names=['羽黒改二','足柄改二',state==='unknown'?'合成・艦情報未登録':state==='type-mismatch'?'阿武隈改二':'最上改二特','Samuel B.Roberts改','時雨改二','雪風改'];
    const hasTurbine=state==='ready'||state==='type-mismatch';
    const parts=[['61cm四連装(酸素)魚雷','61cm四連装(酸素)魚雷'],[],['発煙装置(煙幕)','発煙装置(煙幕)'],hasTurbine?['改良型艦本式タービン']:[],['三式水中探信儀','三式爆雷投射機'],[]];
    const rows=names.map((name,i)=>{const db=hdFEFindShip(name),master=db&&hdShipDbMasterRowFor(db),profile=db&&hdShipDbSlotProfile(db);return {id:'seven-speed-'+i,name,masterId:master?.id||0,gameShipId:13100+i,level:99,gameSlotEx:0,gameGearSlots:Array.from({length:profile?.count||0},(_,j)=>state==='unknown'?'':parts[i][j]||''),gameGearExpansion:'',gameAswGearKnown:true,metadata:{keep:i}}});
    const inventory=state==='unknown'?[]:[{name:'61cm四連装(酸素)魚雷',count:2},{name:'発煙装置(煙幕)',count:2},{name:'三式水中探信儀',count:1},{name:'三式爆雷投射機',count:1},...(hasTurbine?[{name:'改良型艦本式タービン',count:1}]:[])];
    localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,JSON.stringify(inventory));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,metadata:{keep:true}}));localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
    saveCustomFleets({'7-3':[{id:'speed-seven',name:'合成：7-3速度',memo:'keep memo',openingAswCount:0,routePreset:MAP_PLANS['7-3'].presets[1],metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:i===3?'':r.gameGearSlots.join(' / '),metadata:{keep:i}}))},{id:'other',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
    localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));hdMapRouteSet('7-3',1);hdMSNOpen('1-1');
    const all=loadCustomFleets();return {custom:localStorage.getItem(CUSTOM_FLEET_KEY),keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(all['7-3'][1]),otherMap:JSON.stringify(all['1-1']),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated']),identities:JSON.stringify(all['7-3'][0].ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))};
   },state);
   await page.locator('#hdMapStrategyMap').selectOption('7-3');await page.locator('#hdMapStrategyRoute').selectOption('1');await page.locator('#hdMapStrategyFleet').selectOption('speed-seven');
   const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
   async function search(){
    await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toBeVisible();
    const r=await page.evaluate(()=>{const r=HD_OC_CACHE.get('7-3:speed-seven:1');return {route:hdFERoute(r.plan),goals:r.measure.goals,readiness:r.readiness,search:r.search,usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),master:hdFEMasterValidation(r.plan),names:r.plan.ships.map(s=>s.ship),gear:r.plan.ships.map(s=>s.items),shortages:r.shortages.map(g=>({kind:g.goalKind||g.kind,stockGap:hdOCStockGap(g)}))}});
    (evidence.samples??=[]).push(r);expect(r.search.maxExamined).toBe(10000);for(const [k,n]of Object.entries(r.usage))expect(n).toBeLessThanOrEqual(r.stock[k]);
    expect(r.names.slice(0,2)).toEqual(['羽黒改二','足柄改二']);expect(r.route.contract.checks.filter(c=>c.condition.kind==='namedCount').every(c=>c.status==='ready')).toBe(true);
    await panel.locator('[data-hd-required-route] summary').click();const checks=panel.locator('[data-hd-required-route]');await expect(checks).toContainText('高速統一');await expect(checks).toContainText('羽黒');await expect(checks).toContainText('足柄');
    const speed=r.route.contract.checks.find(c=>c.condition.kind==='minSpeed'),cruisers=r.route.contract.checks.find(c=>c.condition.reason?.startsWith('I→J'));
    await expect(checks).toContainText('ACDGJP / ACDGIJP');await expect(checks).toContainText('G→J/G→Iは未確認');await expect(checks).toContainText('固定・ランダムとは判定しません');
    expect(r.shortages.some(g=>g.kind==='route-requirements')).toBe(false);
    expect((await panel.locator('.hd-oc-shortage').allInnerTexts()).some(s=>/重巡級|G分岐/.test(s))).toBe(false);
    if(state==='ready'){
     expect(speed.status).toBe('ready');expect(cruisers).toMatchObject({status:'ready',count:3});expect(r.route.status).toBe('manual');expect(r.master.valid).toBe(true);expect(r.gear[3].some(x=>x.name==='改良型艦本式タービン')).toBe(true);
     evidence.invalidControl=await page.evaluate(()=>{const p=hdFOClone(HD_OC_CACHE.get('7-3:speed-seven:1').plan);p.ships[0].items.push({name:'改良型艦本式タービン',slotIndex:99});const speed=hdFEShipSpeed(p.ships[0]);return {invalid:speed.invalid.length,rank:speed.rank,check:hdFERouteContract(p).checks.find(c=>c.condition.kind==='minSpeed')}});
     expect(evidence.invalidControl.invalid).toBeGreaterThan(0);expect(evidence.invalidControl.rank).toBe(10);expect(evidence.invalidControl.check).toMatchObject({status:'manual',count:5});
    }else if(state==='type-mismatch'){
     expect(speed.status).toBe('ready');expect(cruisers).toMatchObject({status:'missing',count:2,gap:1});expect(r.route.status).toBe('missing');expect(r.master.valid).toBe(true);await expect(checks).toContainText('重巡洋艦＋航空巡洋艦 2隻');await expect(checks).toContainText('装備購入で解決する不足とは扱いません');
    }else if(state==='stock'){
     expect(cruisers).toMatchObject({status:'ready',count:3});
     expect(speed.status).toBe('missing');expect(r.route.status).toBe('missing');expect(r.master.valid).toBe(true);expect(r.shortages.find(g=>g.kind==='speed-turbine').stockGap).toBe(1);
     await expect(panel.locator('.hd-oc-goal').filter({hasText:'Samuel B.Roberts改 の高速条件'})).toContainText('タービン1個');
     await expect(panel.locator('.hd-oc-shortage').filter({hasText:'高速化用タービンに必要なもの'})).toContainText('同種の所持 0個');
     await expect(panel.locator('[data-hd-oc-search-status]')).toContainText('不足を証明するものではありません');
    }else{
     // Unknown CAV data coexists with the known, unequipped slow Samuel.
     // The known speed shortage wins overall; the unknown hull stays unresolved.
     expect(cruisers).toMatchObject({status:'manual',count:2});expect(speed).toMatchObject({status:'missing',count:4});expect(r.route.status).toBe('missing');expect(r.goals.find(g=>g.kind==='speed-ship'&&g.shipIndex===2)).toMatchObject({ok:false,unresolved:true});expect(r.goals.find(g=>g.kind==='speed-ship'&&g.shipIndex===3)).toMatchObject({ok:false,unresolved:false});expect(r.shortages.some(g=>g.kind==='speed-turbine')).toBe(true);await expect(checks).toContainText('速力未判定');await expect(checks).toContainText('不足: Samuel B.Roberts改');
    }
    evidence.ui={checks:await checks.innerText(),goals:await panel.locator('.hd-oc-goal').allInnerTexts(),shortages:await panel.locator('.hd-oc-shortage').allInnerTexts()};return r;
   }
   evidence.first=await search();await panel.locator('[data-hd-oc-apply]').click();
   if(state==='unknown'){await expect(page.getByText(/元の保存編成は上書きしません/)).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem(CUSTOM_FLEET_KEY))).toBe(reference.custom);}
   else{
    await page.locator('#mapStrategyNavigator [data-hd-msn-action="fleet"]').click();await page.locator('#customFleetPanel [data-cf-id="speed-seven"] [data-cf-edit]').click();await page.locator('#customFleetMemo').fill('keep memo / edited');await page.locator('#customFleetDialog button[value="default"]').click();
   }
   evidence.preserved=await page.evaluate(ref=>{const a=loadCustomFleets(),f=a['7-3'][0];return {sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(a['7-3'][1])===ref.other,otherMap:JSON.stringify(a['1-1'])===ref.otherMap,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities,metadata:f.metadata,memo:f.memo}},reference);
   expect(evidence.preserved).toMatchObject({sourcesExact:true,other:true,otherMap:true,otherPlanner:true,identitiesExact:true,metadata:{keep:true},memo:state==='unknown'?'keep memo':'keep memo / edited'});
   const saved=await page.evaluate(()=>localStorage.getItem(CUSTOM_FLEET_KEY));
   await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');const doc=await page.evaluate(()=>performance.timeOrigin);await page.evaluate(()=>hdMSNOpen('7-3'));evidence.after=await search();
   evidence.load=await page.evaluate(({ref,saved,doc})=>({sameDocument:performance.timeOrigin===doc,readyState:document.readyState,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===saved,sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner}),{ref:reference,saved,doc});
   expect(evidence.load).toEqual({sameDocument:true,readyState:'complete',customExact:true,sourcesExact:true,otherPlanner:true});expect(errors).toEqual([]);
  }finally{evidence.pageerrors=errors;const p=info.outputPath('route-guidance-evidence.json');await require('node:fs/promises').writeFile(p,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:p,contentType:'application/json'})}
 });
});

// Keep these cases in the fixed normal-smoke file list; options are scoped to this test type.
{
 const version=require('../app-version.json');
 const fiveFourTest=test.extend({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true,trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});
for(const state of ['ready','two-low','unknown'])fiveFourTest(`5-4 D-to-E original battleship ${state} preserves the saved proposal`,async({page},info)=>{
 const evidence={state,scope:'synthetic owned fleet; original D-to-E hull category only'},errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('**/*',r=>{const u=new URL(r.request().url()),v=(u.origin==='https://raw.githubusercontent.com'&&u.pathname==='/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json')||(u.origin==='http://127.0.0.1:4173'&&u.pathname==='/app-version.json');if(r.request().method()==='GET'&&v)return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:version.version,build:version.build})});return ['localhost','127.0.0.1'].includes(u.hostname)?r.continue():r.fulfill({status:204,body:''})});
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
  const ref=await page.evaluate(state=>{
   const names=state==='ready'?['金剛改二','榛名改二']:state==='two-low'?['長門改二','陸奥改二']:['長門改二','合成・元艦種未登録'];names.push('鈴谷改二','熊野改二','時雨改二','雪風改');
   const bb='35.6cm連装砲',ca='20.3cm(3号)連装砲',recon='零式水上観測機',radar='33号水上電探',fish='61cm四連装(酸素)魚雷';
   const gear=[[bb,bb,recon,radar],state==='unknown'?[]:[bb,bb,recon,radar],[ca,ca,recon],[ca,ca,recon],[fish,fish],[]];
   const rows=names.map((name,i)=>{const db=hdFEFindShip(name),m=db&&hdShipDbMasterRowFor(db),profile=db&&hdShipDbSlotProfile(db),slots=Array.from({length:profile?.count||0},(_,j)=>gear[i][j]||'');return {id:'central-'+i,name,masterId:m?.id||0,gameShipId:14500+i,level:99,gameSlotEx:0,gameLos:49+slots.reduce((n,x)=>n+(Number(hdFEFind(x)?.stats?.索敵)||0),0),gameAswGearKnown:true,gameGearSlots:slots,gameGearExpansion:'',metadata:{keep:i}}});
   const counts=new Map();for(const row of rows)for(const name of row.gameGearSlots)if(name)counts.set(name,(counts.get(name)||0)+1);
   localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,JSON.stringify([...counts].map(([name,count])=>({name,count,star:0}))));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,metadata:{keep:true}}));localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
   saveCustomFleets({'5-4':[{id:'central',name:'合成：5-4元の艦種',memo:'keep memo',openingAswCount:0,routePreset:MAP_PLANS['5-4'].presets[0],metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:r.gameGearSlots.map((x,j)=>i===0&&j===1?'':x).join(' / '),metadata:{keep:i}}))},{id:'other',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));hdMapRouteSet('5-4',0);hdMSNOpen('1-1');
   const all=loadCustomFleets();return {custom:localStorage.getItem(CUSTOM_FLEET_KEY),keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(all['5-4'][1]),otherMap:JSON.stringify(all['1-1']),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated']),identities:JSON.stringify(all['5-4'][0].ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))};
  },state);
  await page.locator('#hdMapStrategyMap').selectOption('5-4');await page.locator('#hdMapStrategyRoute').selectOption('0');await page.locator('#hdMapStrategyFleet').selectOption('central');const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  evidence.before=await page.evaluate(()=>hdOCBuild(hdOCContext('5-4','central',0)).plan.ships[0].items.filter(x=>x.name==='35.6cm連装砲').length);expect(evidence.before).toBe(1);
  async function search(){
   await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toBeVisible();
   const r=await page.evaluate(()=>{const r=HD_OC_CACHE.get('5-4:central:0');return {route:hdFERoute(r.plan),master:hdFEMasterValidation(r.plan),measure:r.measure,search:r.search,usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),gear:r.plan.ships.map(s=>s.items),names:r.plan.ships.map(s=>s.ship),shortages:r.shortages.map(g=>g.goalKind||g.kind)}});(evidence.samples??=[]).push(r);
   expect(r.search.maxExamined).toBe(10000);expect(r.measure.speedTarget).toBe(0);expect(r.names.slice(0,2)).toEqual(state==='ready'?['金剛改二','榛名改二']:state==='two-low'?['長門改二','陸奥改二']:['長門改二','合成・元艦種未登録']);
   expect(r.gear[0].filter(x=>x.name==='35.6cm連装砲')).toHaveLength(2);for(const [k,n] of Object.entries(r.usage))expect(n).toBeLessThanOrEqual(r.stock[k]);expect(r.shortages.some(x=>['route-requirements','speed-ship','speed-turbine','speed-boiler'].includes(x))).toBe(false);
   await panel.locator('[data-hd-required-route] summary').click();const checks=panel.locator('[data-hd-required-route]');await expect(checks).toContainText('D→E');await expect(checks).toContainText('装備購入ではなく編成を見直す');
   const low=r.route.contract.checks.find(x=>x.condition.kind==='slowBattleshipCount');
   if(state==='ready'){expect(low).toMatchObject({status:'ready',count:0});expect(r.master.valid).toBe(true);expect(r.route.contract.status).toBe('ready');}
   else if(state==='two-low'){expect(low).toMatchObject({status:'missing',count:2,max:1});expect(r.route.status).toBe('missing');expect(r.master.valid).toBe(true);await expect(checks).toContainText('1隻超過');await expect(checks).toContainText('ボス到達不可能や購入必須を意味しない');}
   else{expect(low).toMatchObject({status:'manual',count:1});expect(r.route.status).toBe('manual');expect(r.master.valid).toBe(false);await expect(checks).toContainText('未判定');}
   return r;
  }
  await search();await panel.locator('[data-hd-oc-apply]').click();
  if(state==='unknown'){await expect(page.getByText(/元の保存編成は上書きしません/)).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem(CUSTOM_FLEET_KEY))).toBe(ref.custom);}
  else{await page.locator('#mapStrategyNavigator [data-hd-msn-action="fleet"]').click();await page.locator('#customFleetPanel [data-cf-id="central"] [data-cf-edit]').click();await page.locator('#customFleetMemo').fill('keep memo / edited');await page.locator('#customFleetDialog button[value="default"]').click();}
  evidence.preserved=await page.evaluate(ref=>{const a=loadCustomFleets(),f=a['5-4'][0];return {sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(a['5-4'][1])===ref.other,otherMap:JSON.stringify(a['1-1'])===ref.otherMap,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities,metadata:f.metadata,memo:f.memo}},ref);
  expect(evidence.preserved).toMatchObject({sourcesExact:true,other:true,otherMap:true,otherPlanner:true,identitiesExact:true,metadata:{keep:true},memo:state==='unknown'?'keep memo':'keep memo / edited'});
  const saved=await page.evaluate(()=>localStorage.getItem(CUSTOM_FLEET_KEY));await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');const doc=await page.evaluate(()=>performance.timeOrigin);await page.evaluate(()=>hdMSNOpen('5-4'));await search();
  evidence.load=await page.evaluate(({ref,saved,doc})=>({sameDocument:performance.timeOrigin===doc,readyState:document.readyState,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===saved,sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner}),{ref,saved,doc});expect(evidence.load).toEqual({sameDocument:true,readyState:'complete',customExact:true,sourcesExact:true,otherPlanner:true});expect(errors).toEqual([]);
 }finally{evidence.pageerrors=errors;const p=info.outputPath('route-guidance-evidence.json');await require('node:fs/promises').writeFile(p,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:p,contentType:'application/json'})}
});
}

// Keep these cases in the fixed normal-smoke file list; options are scoped to this test type.
{
 const version=require('../app-version.json');
 const submarineTest=test.extend({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true,trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});
for(const state of ['submarine','carrier','tender','unknown','known-and-unknown'])submarineTest(`5-4 D-to-E submarine ${state} preserves the saved proposal`,async({page},info)=>{
 const evidence={state,scope:'synthetic owned fleet; D-to-E submarine exclusion only'},errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('**/*',r=>{const u=new URL(r.request().url()),v=(u.origin==='https://raw.githubusercontent.com'&&u.pathname==='/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json')||(u.origin==='http://127.0.0.1:4173'&&u.pathname==='/app-version.json');if(r.request().method()==='GET'&&v)return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:version.version,build:version.build})});return ['localhost','127.0.0.1'].includes(u.hostname)?r.continue():r.fulfill({status:204,body:''})});
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
  const ref=await page.evaluate(state=>{
   const names=['金剛改二','榛名改二',state==='carrier'?'伊58改':state==='tender'?'大鯨':state==='unknown'?'合成・艦情報未登録':'伊168',state==='known-and-unknown'?'合成・艦情報未登録':'熊野改二','時雨改二','雪風改'];
   const bb='35.6cm連装砲',ca='20.3cm(3号)連装砲',recon='零式水上観測機',radar='33号水上電探',fish='61cm四連装(酸素)魚雷';
   const gear=[[bb,bb,recon,radar],[bb,bb,recon,radar],[],state==='known-and-unknown'?[]:[ca,ca,recon],[fish,fish],[]];
   const rows=names.map((name,i)=>{const db=hdFEFindShip(name),m=db&&hdShipDbMasterRowFor(db),profile=db&&hdShipDbSlotProfile(db),slots=Array.from({length:profile?.count||0},(_,j)=>gear[i][j]||'');return {id:'central-'+i,name,masterId:m?.id||0,gameShipId:14500+i,level:99,gameSlotEx:0,gameLos:49+slots.reduce((n,x)=>n+(Number(hdFEFind(x)?.stats?.索敵)||0),0),gameAswGearKnown:true,gameGearSlots:slots,gameGearExpansion:'',metadata:{keep:i}}});
   const counts=new Map();for(const row of rows)for(const name of row.gameGearSlots)if(name)counts.set(name,(counts.get(name)||0)+1);
   localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,JSON.stringify([...counts].map(([name,count])=>({name,count,star:0}))));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,metadata:{keep:true}}));localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
   saveCustomFleets({'5-4':[{id:'central',name:'合成：5-4潜水艦除外',memo:'keep memo',openingAswCount:0,routePreset:MAP_PLANS['5-4'].presets[0],metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:r.gameGearSlots.map((x,j)=>i===0&&j===1?'':x).join(' / '),metadata:{keep:i}}))},{id:'other',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));hdMapRouteSet('5-4',0);hdMSNOpen('1-1');
   const all=loadCustomFleets();return {custom:localStorage.getItem(CUSTOM_FLEET_KEY),keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(all['5-4'][1]),otherMap:JSON.stringify(all['1-1']),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated']),identities:JSON.stringify(all['5-4'][0].ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))};
  },state);
  await page.locator('#hdMapStrategyMap').selectOption('5-4');await page.locator('#hdMapStrategyRoute').selectOption('0');await page.locator('#hdMapStrategyFleet').selectOption('central');const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  evidence.before=await page.evaluate(()=>hdOCBuild(hdOCContext('5-4','central',0)).plan.ships[0].items.filter(x=>x.name==='35.6cm連装砲').length);expect(evidence.before).toBe(1);
  async function search(){
   await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toBeVisible();
   const r=await page.evaluate(()=>{const r=HD_OC_CACHE.get('5-4:central:0');return {route:hdFERoute(r.plan),master:hdFEMasterValidation(r.plan),measure:r.measure,search:r.search,usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),gear:r.plan.ships.map(s=>s.items),names:r.plan.ships.map(s=>s.ship),types:hdFERouteShips(r.plan).map(s=>({type:s.type,known:s.typeKnown})),shortages:r.shortages.map(g=>g.goalKind||g.kind)}});(evidence.samples??=[]).push(r);
   expect(r.search.maxExamined).toBe(10000);expect(r.measure.speedTarget).toBe(0);expect(r.names).toEqual(['金剛改二','榛名改二',({submarine:'伊168',carrier:'伊58改',tender:'大鯨',unknown:'合成・艦情報未登録','known-and-unknown':'伊168'})[state],state==='known-and-unknown'?'合成・艦情報未登録':'熊野改二','時雨改二','雪風改']);
   expect(r.gear[0].filter(x=>x.name==='35.6cm連装砲')).toHaveLength(2);for(const [k,n] of Object.entries(r.usage))expect(n).toBeLessThanOrEqual(r.stock[k]);expect(r.shortages.some(x=>['route-requirements','speed-ship','speed-turbine','speed-boiler'].includes(x))).toBe(false);
   await panel.locator('[data-hd-required-route] summary').click();const checks=panel.locator('[data-hd-required-route]');await expect(checks).toContainText('D→E');await expect(checks).toContainText('装備購入ではなく編成を見直す');
   const condition=r.route.contract.checks.find(x=>x.condition.kind==='typeCount'&&x.condition.types.includes('潜水艦')),low=r.route.contract.checks.find(x=>x.condition.kind==='slowBattleshipCount');
   expect(condition.condition).toMatchObject({types:['潜水艦','潜水空母'],matchPolicy:'exact',min:0,max:0});expect(low).toMatchObject({status:'ready',count:0,max:1});
   const failed=['submarine','carrier','known-and-unknown'].includes(state),unknown=['unknown','known-and-unknown'].includes(state);
   expect(condition).toMatchObject({status:failed?'missing':unknown?'manual':'ready',count:failed?1:0,max:0,excess:failed?1:0});expect(r.master.valid).toBe(!unknown);
   expect(r.route.contract.status).toBe(failed?'missing':unknown?'manual':'ready');
   // Tender is excluded from this count; the canonical CAV2 example scope is
   // still unmet. This does not certify the whole route for a tender fleet.
   expect(r.route.status).toBe(failed?'missing':'manual');
   if(!unknown)expect(r.types[2]).toEqual({type:({submarine:'潜水艦',carrier:'潜水空母',tender:'潜水母艦'})[state],known:true});
   if(failed){await expect(checks).toContainText('1隻超過');await expect(checks).toContainText('ボス到達不可能や購入必須を意味しない');}
   if(unknown){await expect(checks).toContainText('未判定');expect(condition.detail).toContain('未判定');}
   await expect(checks).toContainText('潜水母艦はこの数に含めない');
   return r;
  }
  await search();await panel.locator('[data-hd-oc-apply]').click();
  if(['unknown','known-and-unknown'].includes(state)){await expect(page.getByText(/元の保存編成は上書きしません/)).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem(CUSTOM_FLEET_KEY))).toBe(ref.custom);}
  else{await page.locator('#mapStrategyNavigator [data-hd-msn-action="fleet"]').click();await page.locator('#customFleetPanel [data-cf-id="central"] [data-cf-edit]').click();await page.locator('#customFleetMemo').fill('keep memo / edited');await page.locator('#customFleetDialog button[value="default"]').click();}
  evidence.preserved=await page.evaluate(ref=>{const a=loadCustomFleets(),f=a['5-4'][0];return {sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(a['5-4'][1])===ref.other,otherMap:JSON.stringify(a['1-1'])===ref.otherMap,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities,metadata:f.metadata,memo:f.memo}},ref);
  expect(evidence.preserved).toMatchObject({sourcesExact:true,other:true,otherMap:true,otherPlanner:true,identitiesExact:true,metadata:{keep:true},memo:['unknown','known-and-unknown'].includes(state)?'keep memo':'keep memo / edited'});
  const saved=await page.evaluate(()=>localStorage.getItem(CUSTOM_FLEET_KEY));await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');const doc=await page.evaluate(()=>performance.timeOrigin);await page.evaluate(()=>hdMSNOpen('5-4'));await search();
  evidence.load=await page.evaluate(({ref,saved,doc})=>({sameDocument:performance.timeOrigin===doc,readyState:document.readyState,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===saved,sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner}),{ref,saved,doc});expect(evidence.load).toEqual({sameDocument:true,readyState:'complete',customExact:true,sourcesExact:true,otherPlanner:true});expect(errors).toEqual([]);
 }finally{evidence.pageerrors=errors;const p=info.outputPath('route-guidance-evidence.json');await require('node:fs/promises').writeFile(p,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:p,contentType:'application/json'})}
});
}
