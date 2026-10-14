const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block',viewport:{width:390,height:844},hasTouch:true,isMobile:true});
async function boot(page){
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
}
async function north(page){await boot(page);await page.evaluate(()=>{
 const names=['扶桑改二','鈴谷改二','熊野改二','妙高改二','羽黒改二','那智改二'];
 const ships=names.map((ship,i)=>({ship,gameShipId:9000+i,masterId:hdShipDbMasterRowFor({name:ship}).id,rosterId:'invariant-'+i,gear:i===0?' / / / 零式水上観測機':i===1||i===2?'零式水上観測機 / ドラム缶(輸送用)':'零式水上観測機'}));
 localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(ships.map(s=>({id:s.rosterId,name:s.ship,gameShipId:s.gameShipId,masterId:s.masterId,level:99,gameSlotEx:0,gameLos:121+s.gear.split(' / ').reduce((n,x)=>n+(Number(hdFEFind(x)?.stats?.索敵)||0),0),gameGearSlots:s.gear.split(' / '),gameGearExpansion:'',gameAswGearKnown:true}))));
 localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:ships.map(s=>({gameShipId:s.gameShipId,gearKnown:true}))}]));
 localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120}));
 localStorage.setItem(HD_FL_KEY,JSON.stringify([{name:'零式水上観測機',count:6},{name:'ドラム缶(輸送用)',count:2}]));
 saveCustomFleets({'2-5':[{id:'north',name:'北不変条件',openingAswCount:0,routePreset:{...MAP_PLANS['2-5'].presets[0]},ships}]});
 });}
test('fulfilled named route condition stays protected while another mandatory condition is missing',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
 const p={map:'7-3',preset:MAP_PLANS['7-3'].presets[0],ships:['羽黒改二','時雨改二','矢矧改二','阿武隈改二'].map(ship=>({ship,items:[]})),openingAswCount:0};
 const before=hdOCMeasure(p,[]),q=hdFOClone(p);q.ships[0].ship='妙高改二';const after=hdOCMeasure(q,[]);
 return {before:hdFERoute(p).status,after:hdFERoute(q).status,regressions:hdOCGoalRegressions(before,after)};
 });expect(r.before).not.toBe('ready');expect(r.after).not.toBe('ready');expect(r.regressions.length).toBeGreaterThan(0);
});
test('optimizer saving preserves route, individual IDs and empty slot positions after reload',async({page})=>{
 await north(page);const r=await page.evaluate(()=>{
 const source=loadCustomFleets()['2-5'][0],p=hdFEPlanFromSavedFleet('2-5',source);p.index=0;p.suggestion={preset:source.routePreset,info:hdFSPresetInfo(source.routePreset),slots:p.ships.map(s=>({profile:{type:s.type,row:hdFERoster().find(r=>r.id===s.rosterId)}}))};
 hdFOStandardPlan=()=>p;hdFSMap=()=> '2-5';hdFOSavePreset(0,'stable');const saved=loadCustomFleets()['2-5'].find(f=>f.source==='optimizer-preset');const normalize=f=>hdFEPlanFromSavedFleet('2-5',f).ships.map(s=>({rosterId:s.rosterId,gameShipId:s.gameShipId,masterId:s.masterId,items:s.items.map(x=>[x.slotIndex,x.name,x.star]),expansion:s.expansion}));return {source,saved,sourceSlots:normalize(source),savedSlots:normalize(saved)};
 });expect(r.saved.routePreset).toEqual(r.source.routePreset);expect(r.saved.openingAswCount).toBe(0);
 expect(r.savedSlots).toEqual(r.sourceSlots);
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 expect(await page.evaluate(id=>hdFERouteRequirementData(hdFEPlanFromSavedFleet('2-5',loadCustomFleets()['2-5'].find(f=>f.id===id))).los.coef,r.saved.id)).toBe(1);
});
test('planner import revalidates the actual plan instead of trusting cached fulfilled goals',async({page})=>{
 await north(page);const r=await page.evaluate(()=>{
 const c=hdOCContext('2-5','north',0),p=hdOCBuild(c).plan,measure=hdOCMeasure(p,[]);p.ships[1].items=p.ships[1].items.filter(x=>x.name!=='ドラム缶(輸送用)');
 const result={plan:p,measure,signature:hdOCSignature(c)};hdFCImportOwnedPlan(c,result);const s=hdFCState('2-5',hdFCSelection('2-5'));
 return {cached:measure.goals.find(g=>g.kind==='drum-ships').ok,final:result.measure.goals.find(g=>g.kind==='drum-ships').ok,actual:hdOCMeasure(p,[]).goals.find(g=>g.kind==='drum-ships').ok,assessment:s.proposal.assessment};
 });expect(r.cached).toBe(true);expect(r.actual).toBe(false);expect(r.final).toBe(false);expect(r.assessment.status).toBe('missing');expect(r.assessment.checks.some(c=>c.id==='equipment')).toBe(true);
});
test('automatic selection prefers required historical hulls over higher-level substitutes',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
 const names=['妙高改二','羽黒改二','足柄改二','時雨改二','夕立改二','綾波改二','島風改'];
 localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(names.map((name,i)=>({id:'named-'+i,name,masterId:hdShipDbMasterRowFor({name}).id,gameShipId:700+i,level:i===0?99:50}))));
 return [0,1].map(i=>{const s=hdFSGenerate('7-3',MAP_PLANS['7-3'].presets[i],i);return {names:s.slots.map(x=>x.profile?.row.name),ids:s.slots.map(x=>x.profile?.row.id)}});
 });expect(r[0].names).toContain('羽黒改二');expect(r[1].names).toContain('羽黒改二');expect(r[1].names).toContain('足柄改二');for(const x of r)expect(new Set(x.ids).size).toBe(x.ids.length);
});
test('unknown route cannot report complete even with a satisfied equipment set',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
 hdSEChecks=()=>({rows:[],adv:{}});hdFEEnemyAirCandidates=()=>[];
 return hdOCMeasure({map:'2-5',preset:{name:'未登録ルート',ships:'駆逐1'},ships:[{ship:'時雨改二',items:[{name:'10cm連装高角砲＋高射装置',slotIndex:0},{name:'13号対空電探改',slotIndex:1}]}],openingAswCount:0},[{kind:'cap-aa',label:'対空CI',minCount:1}]);
 });expect(r.goals.find(g=>g.kind==='cap-aa').ok).toBe(true);expect(r.complete).toBe(false);
});
test('all 37 maps and 53 examples connect individually sourced mandatory checks and preserve recommendations separately',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
 const rows=Object.values(HD_MAP_ROUTE_REQUIREMENTS).flat();
 const audit=rows.map(d=>{const p={map:d.map,preset:MAP_PLANS[d.map].presets[d.index],ships:[],openingAswCount:0},m=hdOCMeasure(p,[]);return {map:d.map,index:d.index,path:d.path,engine:d.engine||'contract',routing:d.routing,source:d.source,provisional:!!d.scopeIncomplete,los:d.los,conditions:d.conditions,protected:m.requiredChecks.map(c=>({condition:c.condition,status:c.status})),targets:d.equipmentTargets||[],complete:m.complete}});
 return {maps:Object.keys(HD_MAP_ROUTE_REQUIREMENTS).length,audit};
 });expect(r.maps).toBe(37);expect(r.audit).toHaveLength(53);for(const x of r.audit){expect(x.source).toContain('https://');expect(x.complete).toBe(false);if(x.engine==='contract')expect(x.protected.length).toBeGreaterThanOrEqual(x.conditions.length);}
 await test.info().attach('37-map-route-invariant-audit',{body:Buffer.from(JSON.stringify(r,null,2)),contentType:'application/json'});
});
test('ship alternatives cannot discard a fulfilled AA set to improve aggregate ASW scoring',async({page})=>{
 await boot(page);const r=await page.evaluate(async()=>{
 hdSEChecks=()=>({rows:[{kind:'cap-aa',label:'対空CI',minCount:1},{kind:'対潜',label:'対潜装備',minCount:2},{kind:'cap-asw',label:'対潜シナジー',minCount:1}],adv:{}});hdFEEnemyAirCandidates=()=>[];
 localStorage.setItem(HD_FL_KEY,JSON.stringify(['10cm連装高角砲＋高射装置','13号対空電探改','三式水中探信儀','三式爆雷投射機'].map(name=>({name,count:1}))));
 const rows=['時雨改二','夕立改二'].map((name,i)=>({id:'alt-'+i,name,gameShipId:800+i,masterId:hdShipDbMasterRowFor({name}).id,level:70,gear:''}));localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));
 saveCustomFleets({'1-1':[{id:'alt',openingAswCount:0,ships:[{ship:rows[0].name,rosterId:rows[0].id,gameShipId:rows[0].gameShipId,masterId:rows[0].masterId,gear:'10cm連装高角砲＋高射装置 / 13号対空電探改 / 三式水中探信儀'}]}]});
 const c=hdOCContext('1-1','alt',0),result=hdOCSearch(c),before=result.measure.goals.find(g=>g.kind==='cap-aa').ok,found=await hdOCFindAlternatives(c,result,{maxCandidates:2,maxExamined:150});
 return {before,proposal:found.proposal&&found.proposal.measure.goals.find(g=>g.kind==='cap-aa').ok};
 });expect(r.before).toBe(true);expect(r.proposal===null||r.proposal===true).toBe(true);
});
test('changing synchronized HQ or stock invalidates a proposal without changing six saved data keys',async({page})=>{
 await north(page);const r=await page.evaluate(()=>{
 const keys=['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1','harbordesk-custom-fleets-v1','harbordesk-fleet-calculator-v1'];
 localStorage.setItem('harbordesk-pwa-v1',JSON.stringify({resources:{fuel:4321,ammo:8765,steel:1234,bauxite:9876},memo:'保持確認'}));
 hdFCSaveAll({'2-5':{north:{...hdFCDefaultState('2-5','north'),hqLevel:120}}});
 const c=hdOCContext('2-5','north',0),result=hdOCSearch(c);localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:100}));const before=keys.map(k=>localStorage.getItem(k));const imported=hdFCImportOwnedPlan(c,result);return {imported,before,after:keys.map(k=>localStorage.getItem(k))};
 });expect(r.imported).toBe(false);expect(r.before.every(x=>x!==null)).toBe(true);expect(r.after).toEqual(r.before);
});
test('mode switching and compare saving use the refined fleet rather than regenerating a quick plan',async({page})=>{
 await north(page);const r=await page.evaluate(()=>{
 const source=loadCustomFleets()['2-5'][0],p=hdFEPlanFromSavedFleet('2-5',source);p.index=0;p.suggestion={index:0,routeIndex:0,preset:source.routePreset,info:hdFSPresetInfo(source.routePreset),slots:p.ships.map(s=>({profile:{type:s.type,row:hdFERoster().find(r=>r.id===s.rosterId)}}))};
 HD_FL_CACHE['2-5:0']=p;hdFSMap=()=> '2-5';let generated=0;hdFLGenerate=()=>{generated++;const q=hdFOClone(p);q.ships.forEach(s=>s.items=[]);HD_FL_CACHE['2-5:0']=q;return q;};
 const card=document.createElement('article');card.innerHTML='<div class="hd-fl-host"></div>';document.body.append(card);
 const keys=[];for(const mode of Object.keys(HD_FO_MODES)){hdFOApply(0,card,mode);keys.push(hdOCKey(HD_FL_CACHE['2-5:0']));}
 const standard=hdFOStandardPlan(0);return {generated,keys,original:hdOCKey(p),standard:hdOCKey(standard),drums:hdOCMeasure(standard,[]).goals.find(g=>g.kind==='drum-ships')};
 });expect(r.generated).toBe(0);for(const key of r.keys)expect(key).toBe(r.original);expect(r.standard).toBe(r.original);expect(r.drums.ok).toBe(true);
});
test('empty saved and synchronized gear slots do not become phantom slash equipment',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
 const p=hdFEPlanFromSavedFleet('1-1',{ships:[{ship:'時雨改二',gear:' /  / 三式水中探信儀 / [増設] 改良型艦本式タービン'}]});
 return {tokens:hdFEGearTokens(' /  / 三式水中探信儀'),items:p.ships[0].items,expansion:p.ships[0].expansion,plain:hdFEGearTokens('三式水中探信儀 /  / ')};
 });expect(r.tokens).toEqual(['','','三式水中探信儀']);expect(r.items).toHaveLength(1);expect(r.items[0]).toMatchObject({slotIndex:2,name:'三式水中探信儀'});expect(r.expansion.name).toBe('改良型艦本式タービン');expect(r.plain).toEqual(['三式水中探信儀','','']);
});
test('mandatory drum distribution may supersede a recommendation but never an explicit strategy target',async({page})=>{
 await north(page);const r=await page.evaluate(()=>{
 const p=hdFEPlanFromSavedFleet('2-5',loadCustomFleets()['2-5'][0]);p.openingAswCount=0;
 p.ships[1].items=[{name:'90mm単装高角砲',slotIndex:0},{name:'94式高射装置',slotIndex:1}];p.ships[2].items=p.ships[2].items.filter(x=>x.name!=='ドラム缶(輸送用)');
 const q=hdFOClone(p);q.ships[1].items=[{name:'ドラム缶(輸送用)',slotIndex:0}];q.ships[2].items.push({name:'ドラム缶(輸送用)',slotIndex:1});
 const result=generatedFromMap=>{const goals=[{kind:'cap-aa',baseKind:'防空',label:'対空CI',minCount:1,generatedFromMap}],before=hdOCMeasure(p,goals),after=hdOCMeasure(q,goals);return {before:before.goals.find(g=>g.kind==='cap-aa'),after:after.goals.find(g=>g.kind==='drum-ships'),lost:hdOCGoalRegressions(before,after).map(g=>g.kind)}};
 return {recommended:result(true),explicit:result(false)};
 });expect(r.recommended.before.ok).toBe(true);expect(r.recommended.after.ok).toBe(true);expect(r.recommended.lost).not.toContain('cap-aa');expect(r.explicit.lost).toContain('cap-aa');
});
test('all registered examples select fleets matching structural route predicates with available master hulls',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
 const rows=hdShipDbMasterRows().filter(s=>hdFEFindShip(s.name)).map((s,i)=>({id:'audit-'+i,name:s.name,masterId:Number(s.id),gameShipId:200000+i,level:99,gear:''}));
 localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));
 const audits=Object.values(HD_MAP_ROUTE_REQUIREMENTS).flat().map(d=>{
  const s=hdFSGenerate(d.map,MAP_PLANS[d.map].presets[d.index],d.index),p={map:d.map,preset:s.preset,routeInfo:s.info,ships:s.slots.filter(x=>x.profile).map(x=>({ship:x.profile.row.name,masterId:x.profile.row.masterId,items:[]}))};
  const checks=hdOCRequiredChecks(p).filter(c=>['fleetCount','typeCount','namedCount','flagshipType'].includes(c.condition.kind));
  return {map:d.map,index:d.index,names:p.ships.map(x=>x.ship),missing:checks.filter(c=>!c.ok).map(c=>c.detail)};
 });return audits;
 });await test.info().attach('53-example-structural-selection-audit',{body:Buffer.from(JSON.stringify(r,null,2)),contentType:'application/json'});
 expect(r.filter(x=>x.missing.length)).toEqual([]);
});
test('duplicated roster records cannot select the same synchronized ship in two fleet positions',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
 const names=['時雨改二','時雨改二','夕立改二','綾波改二','島風改'];
 localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(names.map((name,i)=>({id:'duplicate-'+i,name,masterId:hdShipDbMasterRowFor({name}).id,gameShipId:i<2?999:999+i,level:99}))));
 const s=hdFSGenerate('1-3',MAP_PLANS['1-3'].presets[0],0);return s.slots.flatMap(x=>x.profile?[x.profile.row.gameShipId]:[]);
 });expect(new Set(r).size).toBe(r.length);expect(r.filter(x=>x===999)).toHaveLength(1);
});
test('optimization waits for mandatory condition evaluation without mutating the input plan',async({page})=>{
 await north(page);const r=await page.evaluate(()=>{
 const p=hdFEPlanFromSavedFleet('2-5',loadCustomFleets()['2-5'][0]),before=hdOCKey(p),evaluate=hdOCMeasure;hdOCMeasure=undefined;const out=hdFOOptimize(p,'boss');hdOCMeasure=evaluate;return {before,after:hdOCKey(out),input:hdOCKey(p),changes:out.optimization.changes};
 });expect(r.after).toBe(r.before);expect(r.input).toBe(r.before);expect(r.changes).toEqual([]);
});
test('verified CFJ selection finds one owned light carrier and five destroyers instead of requiring two example carriers',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
 const names=['瑞鳳改二','時雨改二','夕立改二','綾波改二','島風改','雪風改'];
 localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(names.map((name,i)=>({id:'cfj-'+i,name,gameShipId:3000+i,masterId:hdShipDbMasterRowFor({name}).id,level:70}))));
 localStorage.setItem(HD_OC_ROUTE_GOAL_KEY,JSON.stringify({'1-3:auto:1-3:0':'cfj'}));
 const s=hdFSGenerate('1-3',MAP_PLANS['1-3'].presets[0],0),p={map:'1-3',preset:s.preset,suggestion:s,routeInfo:s.info,routeGoal:'cfj',ships:s.slots.map(x=>({ship:x.profile?.row.name||'',items:[]}))};
 return {missing:s.missing,names:p.ships.map(x=>x.ship),route:hdFERoute(p)};
 });expect(r.missing).toEqual([]);expect(r.names).toHaveLength(6);expect(r.names.filter(n=>n==='瑞鳳改二')).toHaveLength(1);expect(r.route.status).toBe('ready');expect(r.route.branch.fixedPath).toBe(true);
});
test('verified AE selection accepts four owned destroyers without inventing a mandatory example light cruiser',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{
 const names=['時雨改二','夕立改二','綾波改二','島風改'];localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(names.map((name,i)=>({id:'ae-'+i,name,masterId:hdShipDbMasterRowFor({name}).id,level:70}))));
 const s=hdFSGenerate('1-2',MAP_PLANS['1-2'].presets[0],0),p={map:'1-2',preset:s.preset,suggestion:s,routeInfo:s.info,ships:s.slots.map(x=>({ship:x.profile?.row.name||'',items:[]}))};return {missing:s.missing,names:p.ships.map(x=>x.ship),route:hdFERoute(p)};
 });expect(r.missing).toEqual([]);expect(r.names).toHaveLength(4);expect(r.route.status).toBe('ready');
});
test('unknown source equipment cannot be erased by applying an incomplete proposal',async({page})=>{
 await boot(page);const before=await page.evaluate(()=>{
 saveCustomFleets({'1-2':[{id:'unknown-source',name:'未登録装備保存',openingAswCount:0,routePreset:MAP_PLANS['1-2'].presets[0],ships:[{ship:'時雨改二',rosterId:'unknown-dd',gear:'未登録の保存装備 /  / 12.7cm連装砲'}]}]});
 localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify([{id:'unknown-dd',name:'時雨改二',level:99}]));localStorage.setItem(HD_FL_KEY,'[]');
 const c=hdOCContext('1-2','unknown-source',0),result=hdOCSearch(c);HD_OC_CACHE.set('1-2:unknown-source:0',result);
 const button=document.createElement('button');button.setAttribute('data-hd-oc-apply','');button.dataset.hdOcMap='1-2';button.dataset.hdOcFleet='unknown-source';button.dataset.hdOcRoute='0';button.id='unknown-apply';document.body.append(button);
 return {raw:localStorage.getItem(CUSTOM_FLEET_KEY),issues:result.plan.preservationIssues,complete:result.measure.complete};
 });expect(before.issues).toContain('時雨改二：未登録の保存装備の性能・搭載条件が未登録');expect(before.complete).toBe(false);
 await page.locator('#unknown-apply').click();expect(await page.evaluate(()=>localStorage.getItem(CUSTOM_FLEET_KEY))).toBe(before.raw);
});

test('reset to a quick standard cannot drop fulfilled route equipment',async({page})=>{
 await north(page);const r=await page.evaluate(()=>{
 const p=hdFEPlanFromSavedFleet('2-5',loadCustomFleets()['2-5'][0]);HD_FL_CACHE['2-5:0']=p;hdFSMap=()=> '2-5';
 hdFLGenerate=()=>{const q=hdFOClone(p);q.ships.forEach(s=>s.items=[]);HD_FL_CACHE['2-5:0']=q;return q;};hdFLRender=()=>{};
 hdFOReset(0,document.createElement('article'));return {before:hdOCKey(p),after:hdOCKey(HD_FL_CACHE['2-5:0'])};
 });expect(r.after).toBe(r.before);
});
