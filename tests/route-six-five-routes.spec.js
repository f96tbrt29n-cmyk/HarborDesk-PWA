'use strict';
const {test,expect}=require('@playwright/test');
const versionFixture=require('../app-version.json');
const {install:installNavigation,snapshot:snapshotNavigation}=require('./route-navigation-observer.cjs');
test.use({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true,trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});

// Two finite synthetic synchronized inputs, not game-native stats/bonus or victory proof.
// Upper CV0 is derived from the complete ordered branch table, not an outing record.
// The ready CAV hulls keep the same CA-class route counts and provide legal water-fighter slots.
// BareLOS41/HQ120 + recon6*1.2*3 + waterfighter1*.6*2 + radar4*.6 gives the literal score below.
// Graph role corrections expose the existing optional night example on both paths and ASW on the lower path.
// Two torpedoes and lower sonar/projector satisfy those existing examples, not source-mandatory quantities.
// Unselected numeric air/base objectives stay unresolved; no goal is deleted or replaced by zero.
const fullScore=6*Math.sqrt(41)+3*(3*6*1.2+2*1*.6+4*.6)-48,emptyScore=6*Math.sqrt(41)-48;
function hd65Fixture(state,index,variant=''){
 const upper=index===0,cv=upper&&(state==='stock'||variant==='cv'),id='six-five-'+index;
 const names=upper?(cv?['長門改二','赤城改','鳥海改二','妙高改二','夕立改二','時雨改二']:['長門改二','陸奥改二','鳥海改二','妙高改二','夕立改二','時雨改二']):['長門改二','鳥海改二','摩耶改二','矢矧改二乙','夕立改二','時雨改二'];
 if(state==='ready'){if(upper){names[2]='鈴谷改二';names[3]='熊野改二'}else{names[1]='鈴谷改二';names[2]='熊野改二'}}
 if(state==='unknown')names[5]='合成・6-5艦情報未登録';
 const recon='零式水上観測機',attack='流星',fighter='二式水戦改',ha='10cm連装高角砲＋高射装置',radar='13号対空電探改',torpedo='61cm四連装(酸素)魚雷',sonar='三式水中探信儀',projector='三式爆雷投射機';
 for(const name of [recon,attack,fighter,ha,radar,torpedo,sonar,projector])if(!hdFEFind(name))throw Error('fixture item missing: '+name);
 if(hdFEFind(recon).stats.索敵!==6||hdFEFind(attack).stats.索敵!==1||hdFEFind(fighter).stats.索敵!==1||hdFEFind(radar).stats.索敵!==4)throw Error('fixture scouting stat changed');
 const gear=names.map((_,i)=>i===0?[recon,recon,recon]:i===1&&cv?[attack]:i===(upper?2:1)||i===(upper?3:2)?[fighter]:i===3&&!upper?[sonar,projector]:i===4?[ha,radar]:i===5?[torpedo,torpedo]:[]);
 const rows=names.map((name,i)=>{const db=hdFEFindShip(name),m=db&&hdShipDbMasterRowFor(db),p=db&&hdShipDbSlotProfile(db),slots=Array.from({length:p?.count||0},(_,j)=>state==='ready'?(gear[i][j]||''):'');return {id:id+'-'+i,name,masterId:m?.id||0,gameShipId:19500+index*10+i,level:99,gameLos:41+slots.reduce((sum,x)=>sum+(Number(hdFEFind(x)?.stats?.索敵)||0),0),gameSlotEx:0,gameAswGearKnown:true,gameGearSlots:slots,gameGearExpansion:'',metadata:{keep:i}}});
 const counts=new Map();if(state==='ready')for(const row of rows)for(const x of row.gameGearSlots)if(x)counts.set(x,(counts.get(x)||0)+1);
 localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,JSON.stringify([...counts].map(([name,count])=>({name,count,star:0}))));
 localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify(state==='unknown'?{metadata:{keep:true}}:{admiralLevel:120,metadata:{keep:true}}));localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));
 const fleet={id,memo:'keep memo',openingAswCount:0,routePreset:{...MAP_PLANS['6-5'].presets[index]},metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:state==='unknown'&&i===5?'合成・6-5性能未登録装備':r.gameGearSlots.map((x,j)=>state==='ready'&&(i===0&&j===0||i===(upper?2:1)&&j===0||!upper&&i===3&&j===1||cv&&i===1&&j===0)?'':x).join(' / '),metadata:{keep:i}}))};
 const fullFleet={...fleet,ships:fleet.ships.map((s,i)=>({...s,gear:state==='unknown'&&i===5?s.gear:rows[i].gameGearSlots.join(' / ')}))};
 return {state,index,upper,cv,id,names,rows,counts:[...counts],fleet,fullFleet};
}

for(const index of [0,1])for(const state of ['ready','stock','unknown'])test(`6-5 ${index===0?'ACDGM':'BFIJM'} ${state} preserves selected branch and optional combat distinctions through save and load`,async({page},info)=>{
 const upper=index===0,path=upper?'ACDGM':'BFIJM',safe=upper?50:35;
 const evidence={state,index,path,scope:'6-5 selected upper CV0 or lower BB1/CAclass2/CL1/DD2; synthetic synchronized bareLOS41; ready upper finite9/lower finite11 owned, air/base unselected; no native stats/bonus/arrival/optimality/victory proof',samples:[],navigation:[],navigationCollectionFailures:0,navigationObservation:'existing bounded workspace-entry wrappers add stack-capture overhead; no timer, wait, pin or forced click'},errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('**/*',r=>{
   const u=new URL(r.request().url()),version=(u.origin==='https://raw.githubusercontent.com'&&u.pathname==='/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json')||(u.origin==='http://127.0.0.1:4173'&&u.pathname==='/app-version.json');
   if(r.request().method()==='GET'&&version)return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:versionFixture.version,build:versionFixture.build})});
   return ['localhost','127.0.0.1'].includes(u.hostname)?r.continue():r.fulfill({status:204,body:''});
  });
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
  const ref=await page.evaluate(({state,index,fixtureSource,installSource})=>{
   (0,eval)('('+installSource+')')();const f=(0,eval)('('+fixtureSource+')')(state,index);
   localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
   // Empty corps means unconfigured, not a fixed aircraft purchase count; retain other-map metadata too.
   localStorage.setItem('harbordesk-land-base-v1',JSON.stringify({'6-5':{metadata:{keep:true},corps:[]},'1-1':{metadata:{keep:true},corps:[]}}));
   saveCustomFleets({'6-5':[{...f.fleet,name:'合成：6-5選択経路'+index},{id:'other-route',metadata:{keep:true},routePreset:{...MAP_PLANS['6-5'].presets[1-index]},routeAssessment:{status:'manual',metadata:{keep:true}},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
   // A sentinel only: this case does not prove durability of a newly created procurement plan.
   localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify([{id:'untouched',map:'1-1',metadata:{keep:true},gearItems:[]}]));localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));
   hdMapRouteSet('6-5',index);hdMSNOpen('1-1');const all=loadCustomFleets();
   return {id:f.id,shipNames:f.names,custom:localStorage.getItem(CUSTOM_FLEET_KEY),keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1','harbordesk-land-base-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(all['6-5'][1]),otherMap:JSON.stringify(all['1-1']),procurement:localStorage.getItem(HD_PROCUREMENT_KEY),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated']),identities:JSON.stringify(all['6-5'][0].ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))};
  },{state,index,fixtureSource:hd65Fixture.toString(),installSource:installNavigation.toString()});
  await page.locator('#hdMapStrategyMap').selectOption('6-5');await page.locator('#hdMapStrategyRoute').selectOption(String(index));await page.locator('#hdMapStrategyFleet').selectOption(ref.id);
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  evidence.preflight=await page.evaluate(({index,id})=>{
   const b=hdOCBuild(hdOCContext('6-5',id,index)),holder=document.createElement('div'),path=index===0?['S1','A','C','D','G','M']:['S2','B','F','I','J','M'];holder.innerHTML=hdMapSvg('6-5',MAP_DETAILS['6-5']);
   const namedMaster=hdFEMasterValidation({...b.plan,ships:b.plan.ships.map(s=>({...s,items:s.items.filter(x=>x.name)}))});
   return {route:hdFERoute(b.plan),measure:hdOCMeasure(b.plan,hdSEChecks('6-5').rows,b.unknown),scouting:hdFEPlanScouting(b.plan,hdOCAssigned(b.plan)),referenceScouting:hdFEScouting(b.plan,hdOCAssigned(b.plan)),gameMatch:hdFEGameMatch(b.plan),master:hdFEMasterValidation(b.plan),namedMaster,preservationIssues:b.plan.preservationIssues||[],diagram:{bossId:holder.querySelector('.hd-map-node.boss')?.getAttribute('data-hd-node-id'),nodes:[...holder.querySelectorAll('.hd-map-node')].map(n=>n.getAttribute('data-hd-node-id')),orderedPathsExist:path.slice(1).every((n,i)=>HD_MAP_GRAPHS['6-5'].edges.some(([a,b])=>a===path[i]&&b===n))}};
  },{index,id:ref.id});
  expect(evidence.preflight.diagram).toMatchObject({bossId:'M',orderedPathsExist:true});for(const n of (upper?['S1','A','C','D','G','M']:['S2','B','F','I','J','M']))expect(evidence.preflight.diagram.nodes).toContain(n);
  if(state==='ready'){
   expect(evidence.preflight.gameMatch.status).toBe('partial');expect(evidence.preflight.master).toMatchObject({valid:false,shipsChecked:6,invalid:[]});expect(evidence.preflight.master.unresolved.length).toBeGreaterThan(0);expect(evidence.preflight.master.unresolved.every(x=>x.name==='')).toBe(true);expect(evidence.preflight.namedMaster.valid).toBe(true);expect(evidence.preflight.scouting).toMatchObject({status:'manual',available:false,score:null,reason:'bonus'});
   expect(evidence.preflight.referenceScouting.score).toBeCloseTo(fullScore-23.4,8);expect(evidence.preflight.measure.goals.find(g=>g.kind==='los-value')).toMatchObject({ok:false,unresolved:true,minCount:safe});
  }
  if(state==='stock'){
   evidence.knownMismatch=await page.evaluate(({index,id})=>{
    const c=hdOCContext('6-5',id,index),make=names=>hdFEPlanFromSavedFleet('6-5',{...c.fleet,ships:names.map(ship=>({ship,gear:''}))}),bad=index===0?['長門改二','陸奥改二','赤城改','加賀改','夕立改二','時雨改二']:['長門改二','赤城改','鳥海改二','矢矧改二乙','夕立改二','時雨改二'];
    const p=make(bad),mixed=make([...bad.slice(0,5),'合成・別の未登録艦']),m=hdOCMeasure(p,hdSEChecks('6-5').rows);return {route:hdFERoute(p),knownAndUnknown:hdFERoute(mixed),reviews:hdOCReview(p,m),shortageGoals:hdOCShortageGoals(m).map(g=>g.kind)};
   },{index,id:ref.id});
   expect(evidence.knownMismatch.route.status).toBe('missing');expect(evidence.knownMismatch.knownAndUnknown.status).toBe('missing');expect(evidence.knownMismatch.reviews.find(x=>x.id==='route')).toMatchObject({kind:'missing',action:'route'});expect(evidence.knownMismatch.reviews.find(x=>x.id==='route').next).toContain('艦種・隻数');expect(evidence.knownMismatch.shortageGoals).not.toContain('route-requirements');
  }
  async function search(){
   await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toBeVisible();
   const sample=await page.evaluate(({index,id})=>{
    const r=HD_OC_CACHE.get('6-5:'+id+':'+index);return {route:hdFERoute(r.plan),search:r.search,measure:r.measure,readiness:r.readiness,master:hdFEMasterValidation(r.plan),scouting:hdFEPlanScouting(r.plan,hdOCAssigned(r.plan)),air:hdFEAirCheck('6-5',hdFEAir(hdOCAssigned(r.plan)),r.plan),reviews:hdOCReview(r.plan,r.measure),gameMatch:hdFEGameMatch(r.plan),names:r.plan.ships.map(s=>s.ship),usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),shortages:r.shortages.map(g=>({kind:g.goalKind||g.kind,shortfall:g.shortfall,stockGap:hdOCStockGap(g),stock:g.stock,aswTargets:g.aswTargets,carrierTargets:g.carrierTargets?.map(t=>({...t,slots:t.slots.map(slot=>({...slot,capacity:hdShipDbSlotProfile(hdFEFindShip(t.ship)).slots[slot.index]}))}))})),preservationIssues:r.plan.preservationIssues||[]};
   },{index,id:ref.id});evidence.samples.push(sample);
   expect(sample.names).toEqual(ref.shipNames);expect(sample.search).toMatchObject({status:'incomplete',maxExamined:10000,maxDepth:24,exhaustive:false});expect(sample.search.portSeed.maxOperations).toBe(800);expect(sample.measure.speedTarget).toBe(0);
   for(const [k,n]of Object.entries(sample.usage))expect(n).toBeLessThanOrEqual(sample.stock[k]||0);
   expect(sample.measure.goals.some(g=>['speed-ship','low-speed-ships','radar-ships','drum-ships','port-attacker-set'].includes(g.kind))).toBe(false);
   await panel.locator('[data-hd-required-route] summary').click();const checks=panel.locator('[data-hd-required-route]'),notes=page.locator(`#mapStrategyNavigator [data-hd-route-requirements="6-5:${index}"]`);
   await expect(notes).toContainText(path);await expect(notes).toContainText(String(safe));await expect(panel.locator(`[data-hd-se-route-scope="${path}"]`)).toContainText('任意装備例');await expect(panel.locator('[data-hd-se-capability="cap-asw"]')).toHaveCount(upper?0:1);
   expect(sample.measure.goals.find(g=>g.kind==='cap-night-auto')).toMatchObject({minCount:1,purpose:'recommendation'});if(upper)expect(sample.measure.goals.some(g=>g.kind==='cap-asw')).toBe(false);else expect(sample.measure.goals.find(g=>g.kind==='cap-asw')).toMatchObject({minCount:1,purpose:'recommendation'});await expect(panel.locator('[data-hd-oc-search-status]')).toContainText('手持ち装備の不足を証明するものではありません');
   expect(sample.air).toMatchObject({status:'manual',reason:'route'});expect(sample.measure.goals.find(g=>g.kind==='air-value')).toMatchObject({ok:false,unresolved:true});expect(sample.reviews.find(r=>r.id==='air')).toMatchObject({kind:'manual'});expect(sample.reviews.find(r=>r.id==='base')).toMatchObject({kind:'data'});await expect(panel.locator('[data-hd-oc-review-id="base"]')).toContainText('出撃部隊が未設定');
   if(state==='ready'){
    expect(sample.route.status).toBe('ready');expect(sample.measure.requiredChecks.every(c=>c.ok)).toBe(true);expect(sample.master.valid).toBe(true);expect(sample.gameMatch.status).toBe('ready');expect(sample.scouting).toMatchObject({status:'ready',available:true,coef:3});expect(sample.scouting.score).toBeCloseTo(fullScore,8);
    for(const [name,count]of [['零式水上観測機',3],['二式水戦改',2],['10cm連装高角砲+高射装置',1],['13号対空電探改',1],['61cm四連装(酸素)魚雷',2],...(!upper?[["三式水中探信儀",1],["三式爆雷投射機",1]]:[])]){expect(sample.usage[name+'@@0']).toBe(count);expect(sample.stock[name+'@@0']).toBe(count)}
    expect(sample.measure.goals.find(g=>g.kind==='los-value')).toMatchObject({ok:true,minCount:safe});expect(sample.measure.goals.find(g=>g.kind==='cap-aa')).toMatchObject({ok:true,count:1,minCount:1,purpose:'recommendation'});expect(sample.measure.goals.find(g=>g.kind==='制空')).toMatchObject({ok:true,count:2,minCount:2,purpose:'recommendation'});expect(sample.measure.goals.find(g=>g.kind==='cap-night-auto')).toMatchObject({ok:true,count:1,minCount:1,purpose:'recommendation'});if(!upper)expect(sample.measure.goals.find(g=>g.kind==='cap-asw')).toMatchObject({ok:true,count:1,minCount:1,purpose:'recommendation'});
    expect(sample.measure.goals.some(g=>g.kind==='cap-carrier-attack')).toBe(false);expect(sample.measure.goals.filter(g=>g.kind!=='air-value').every(g=>g.ok)).toBe(true);expect(sample.shortages).toEqual([]);expect(sample.search.reasons).toContain('air-target-unselected');expect(sample.readiness.registeredReady).toBe(false);
   }else if(state==='stock'){
    expect(sample.route.status).toBe('missing');expect(sample.master.valid).toBe(true);expect(sample.gameMatch.status).toBe('ready');expect(sample.usage).toEqual({});expect(sample.scouting).toMatchObject({status:'partial',available:true,coef:3});expect(sample.scouting.score).toBeCloseTo(emptyScore,8);expect(sample.scouting.checks.every(x=>!Object.hasOwn(x,'failBelow'))).toBe(true);
    const los=sample.measure.goals.find(g=>g.kind==='los-value');expect(los).toMatchObject({ok:false,minCount:safe});expect(!!los.unresolved).toBe(false);expect(los.count).toBeCloseTo(emptyScore,8);const losCard=panel.locator('.hd-oc-shortage').filter({hasText:'索敵分岐の安全域に必要なもの'});await expect(losCard).toContainText('33式 -9.58 / 安全域 '+safe);await expect(losCard.locator('[data-hd-oc-procure]')).toHaveCount(0);expect(sample.shortages.find(g=>g.kind==='los-value').stockGap).toBe(0);await expect(losCard).not.toContainText(/59\.58\s*個|44\.58\s*個|配備不足\s*60個|配備不足\s*45個/);
    if(upper){const attack=sample.shortages.find(g=>g.kind==='cap-carrier-attack');expect(attack).toMatchObject({shortfall:1,stock:{complete:false,parts:[{part:'carrierAttackPlane',have:0,need:1}]}});expect(attack.carrierTargets.map(t=>({ship:t.ship,count:t.count,status:t.status,unknownSlots:t.unknownSlots}))).toEqual([{ship:'赤城改',count:1,status:'candidate',unknownSlots:false}]);for(const t of attack.carrierTargets)for(const slot of t.slots){expect(slot.capacity).toBeGreaterThan(0);expect(slot.candidates.length).toBeGreaterThan(0)}const card=panel.locator('.hd-oc-shortage').filter({hasText:'空母の攻撃機配備に必要なもの'});await expect(card).toContainText('艦上攻撃機・艦上爆撃機：所持0 / この装備例に必要1・あと1個');for(const text of ['赤城改：艦上攻撃機・艦上爆撃機1個','流星','第1枠','戦闘上の推奨で、経路の必須条件ではありません','未所持品を含む','他の目標と共用','購入数量を保証しません'])await expect(card.locator('[data-hd-oc-carrier-targets]')).toContainText(text)}
    else{
     expect(sample.measure.goals.some(g=>g.kind==='cap-carrier-attack')).toBe(false);const asw=sample.shortages.find(g=>g.kind==='cap-asw');expect(asw).toMatchObject({shortfall:1,stock:{complete:false,recipe:{id:'sonar-projector'},parts:[{part:'sonar',have:0,need:1},{part:'projector',have:0,need:1}]}});expect(asw.aswTargets.filter(t=>t.status==='candidate').map(t=>t.ship)).toEqual(['矢矧改二乙','夕立改二','時雨改二']);
     for(const target of asw.aswTargets.filter(t=>t.status==='candidate'))expect(target.parts[0].slots.some(a=>target.parts[1].slots.some(b=>a.index!==b.index))).toBe(true);const card=panel.locator('.hd-oc-shortage').filter({hasText:'対潜シナジーに必要なもの'});for(const text of ['この装備例に必要1・あと1個','矢矧改二乙','ソナー1個','爆雷投射機1個','三式水中探信儀','三式爆雷投射機','通常第1枠','同じ艦の別々の通常枠','先制対潜の成立人数ではありません','全候補艦への配備を求めるものではありません','他の目標と枠を共用','購入数量を保証しません'])await expect(card).toContainText(text);await expect(card.locator('[data-hd-oc-procure]')).toHaveCount(0);
    }
    expect(sample.readiness.registeredReady).toBe(false);
   }else{
    expect(sample.route.status).toBe('manual');expect(sample.scouting).toMatchObject({status:'manual',available:false,score:null,reason:'sync'});expect(sample.preservationIssues.length).toBeGreaterThan(0);expect(sample.shortages.some(g=>g.kind==='los-value')).toBe(false);expect(sample.readiness.registeredReady).toBe(false);await expect(checks).toContainText('未確認');await expect(panel.locator('[data-hd-oc-reviews]')).toContainText('艦娘情報が未登録');
   }
   evidence.ui={checks:await checks.innerText(),notes:await notes.innerText(),goals:await panel.locator('.hd-oc-goal').allInnerTexts(),shortages:await panel.locator('.hd-oc-shortage').allInnerTexts()};return sample;
  }
  evidence.stage='first-search';await search();await panel.locator('[data-hd-oc-apply]').click();
  if(state==='unknown'){await expect(page.getByText(/元の保存編成は上書きしません/)).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem(CUSTOM_FLEET_KEY))).toBe(ref.custom)}
  else{await page.locator('#mapStrategyNavigator [data-hd-msn-action="fleet"]').click();await page.locator(`#customFleetPanel [data-cf-id="${ref.id}"] [data-cf-edit]`).click();await page.locator('#customFleetMemo').fill('keep memo / edited');await page.locator('#customFleetDialog button[value="default"]').click()}
  evidence.saved=await page.evaluate(ref=>{const all=loadCustomFleets(),f=all['6-5'][0];return {sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(all['6-5'][1])===ref.other,otherMap:JSON.stringify(all['1-1'])===ref.otherMap,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities,metadata:f.metadata,memo:f.memo,routeAssessment:f.routeAssessment?.status,searchAssessment:f.searchAssessment,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===ref.custom}},ref);
  expect(evidence.saved).toMatchObject({sourcesExact:true,other:true,otherMap:true,procurement:true,otherPlanner:true,identitiesExact:true,metadata:{keep:true},memo:state==='unknown'?'keep memo':'keep memo / edited'});if(state==='unknown')expect(evidence.saved.customExact).toBe(true);else{expect(evidence.saved.routeAssessment).toBe(state==='stock'?'missing':'ready');expect(evidence.saved.searchAssessment).toMatchObject({status:'incomplete',exhaustive:false});expect(evidence.saved.searchAssessment.reasons.length).toBeGreaterThan(0)}
  const beforeReload=await page.evaluate(snapshotSource=>({saved:localStorage.getItem(CUSTOM_FLEET_KEY),navigation:(0,eval)('('+snapshotSource+')')()}),snapshotNavigation.toString());const saved=beforeReload.saved;evidence.navigation.push(beforeReload.navigation);
  await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');const doc=await page.evaluate(installSource=>{(0,eval)('('+installSource+')')();return performance.timeOrigin},installNavigation.toString());await page.evaluate(()=>hdMSNOpen('6-5'));await expect(page.locator('#hdMapStrategyRoute')).toHaveValue(String(index));
  evidence.stage='after-load-search';await search();evidence.load=await page.evaluate(({ref,saved,doc})=>{const f=loadCustomFleets()['6-5'][0];return {sameDocument:performance.timeOrigin===doc,readyState:document.readyState,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===saved,sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,route:hdFERoute(hdFEPlanFromSavedFleet('6-5',f)).status,searchAssessment:f.searchAssessment}},{ref,saved,doc});
  expect(evidence.load).toMatchObject({sameDocument:true,readyState:'complete',customExact:true,sourcesExact:true,otherPlanner:true,procurement:true,route:state==='unknown'?'manual':state==='stock'?'missing':'ready'});if(state!=='unknown')expect(evidence.load.searchAssessment).toEqual(evidence.saved.searchAssessment);expect(errors).toEqual([]);evidence.stage='completed';
 }finally{try{evidence.navigation.push(await page.evaluate(snapshotNavigation))}catch{evidence.navigationCollectionFailures++}evidence.pageerrors=errors;const p=info.outputPath('route-guidance-evidence.json');await require('node:fs/promises').writeFile(p,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:p,contentType:'application/json'})}
});
