const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const {routeAuditNumericCondition}=require('./fixtures/route-audit-numeric-condition.cjs');
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
const guidanceTest=test.extend({trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});
async function boot(page){
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCFindAlternatives==='function');
}
async function fleet(page,{count=2,base=50,stock=2,realRoute=false}={}){
 await boot(page);
 await page.evaluate(({count,base,stock,realRoute})=>{
  const names=['占守改','国後改','択捉改','松輪改'].slice(0,count);
  const rows=names.map((name,i)=>{const master=hdShipDbMasterRowFor(name),profile=hdShipDbSlotProfile(hdFEFindShip(name));return {id:'asw-'+i,name,masterId:master.id,gameShipId:100+i,level:80,gameAsw:base,gameLos:36,gameAswGearKnown:true,gameGearSlots:Array(profile.count).fill(''),gameGearExpansion:'',gameSlotEx:0}});
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:20}));
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'三式水中探信儀',count:stock,star:0},{name:'三式爆雷投射機',count:stock,star:0}]));
  saveCustomFleets({'1-5':[{id:'oasw-fleet',name:'先制対潜統合',openingAswCount:count,ships:rows.map(r=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:''}))}]});
  if(!realRoute){
   hdMSNPresets=()=>[{name:'対潜テストルート',ships:'海防艦'+count,openingAswCount:count}];
   hdSEChecks=()=>({rows:[{kind:'cap-asw',label:'対潜シナジー',minCount:1}],adv:{}});hdFEEnemyAirCandidates=()=>[];
   HD_MAP_ADVANCED_DATA['1-5']={los:{coef:1,checks:[{safe:1,failBelow:0}]}};
  }
  hdMSNOpen('1-5');
 },{count,base,stock,realRoute});
}
async function aswRouteFleet(page,map,index,names,stock=names.length){
 await boot(page);
 await page.evaluate(({map,index,names,stock})=>{
  const rows=names.map((name,i)=>({id:'route-asw-'+i,name,masterId:hdShipDbMasterRowFor(name).id,gameShipId:7300+i,level:160,gameAsw:90,gameLos:40,gameAswGearKnown:true,gameGearSlots:Array(hdShipDbSlotProfile(hdFEFindShip(name)).count).fill(''),gameGearExpansion:'',gameSlotEx:0,metadata:{keep:i}}));
  localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,JSON.stringify([{name:'三式水中探信儀',count:stock},{name:'三式爆雷投射機',count:stock}]));
  localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,metadata:{keep:true}}));
  localStorage.setItem(HD_OC_ASW_TARGET_KEY,JSON.stringify({'1-1:unrelated:0':6}));
  saveCustomFleets({[map]:[{id:'route-asw',name:'対潜目標の合成編成',metadata:{keep:true},routePreset:MAP_PLANS[map].presets[index],ships:rows.map(r=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:'',metadata:{keep:r.id}}))}],'1-1':[{id:'unrelated',name:'対象外',ships:[],metadata:{keep:true}}]});
  hdMapRouteSet(map,index);hdMSNOpen(map);
 },{map,index,names,stock});
}
async function aswRouteRecord(page,map,index){
 await expect(page.locator('#mapStrategyNavigator .hd-oc-panel .hd-oc-result')).toBeVisible();
 return page.evaluate(({map,index})=>{const r=HD_OC_CACHE.get(`${map}:route-asw:${index}`),g=r.measure.goals.find(x=>x.kind==='opening-asw'),usage={};for(const s of r.plan.ships)for(const x of [...s.items,s.expansion].filter(x=>x?.name)){usage[x.name]=(usage[x.name]||0)+1}return {goal:g,sets:r.measure.goals.find(x=>x.kind==='cap-asw'),shortages:r.shortages.map(x=>({kind:x.goalKind,unresolved:x.unresolved,parts:x.stock?.parts.map(p=>({part:p.part,need:p.need,have:p.have}))})),usage,route:hdFERoute(r.plan).status,readiness:hdOCReadiness(r.plan,r.measure)}},{map,index});
}
async function aswRouteSaveReload(page,map,index,evidence){
 const before=await page.evaluate(map=>{const keys=[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1'];return {keys,values:keys.map(k=>localStorage.getItem(k)),other:JSON.stringify(loadCustomFleets()['1-1']),ids:loadCustomFleets()[map][0].ships.map(s=>s.gameShipId)}},map);
 await page.locator('#mapStrategyNavigator .hd-oc-panel [data-hd-oc-apply]').click();
 await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCContext==='function');await page.evaluate(map=>hdMSNOpen(map),map);
 const saved=await page.evaluate(({map,index,before})=>{const c=hdOCContext(map,'route-asw',index),f=c.fleet;return {complete:document.readyState==='complete',goal:hdOCOaswTarget(c),stored:f.openingAswCount,exact:before.keys.every((k,i)=>localStorage.getItem(k)===before.values[i]),presence:before.values.map(v=>v!==null),other:JSON.stringify(loadCustomFleets()['1-1'])===before.other,ids:f.ships.map(s=>s.gameShipId),fleetMetadata:f.metadata,shipMetadata:f.ships.map(s=>s.metadata),otherGoal:hdOCOaswTargets()['1-1:unrelated:0']}},{map,index,before});
 evidence.saved=saved;expect(saved.complete).toBe(true);expect(saved.exact).toBe(true);expect(saved.other).toBe(true);expect(saved.ids).toEqual(before.ids);expect(saved.fleetMetadata).toEqual({keep:true});expect(saved.shipMetadata).toEqual(before.ids.map((_,i)=>({keep:'route-asw-'+i})));expect(saved.otherGoal).toBe(6);return saved;
}
async function finishAswRoute(info,evidence,errors){evidence.pageerrors=errors;const file=info.outputPath('route-guidance-evidence.json');await fs.promises.writeFile(file,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:file,contentType:'application/json'});}
guidanceTest('remaining ASW goals stay unselected or explicit zero while equipment sets still search and save',async({page},info)=>{
 const evidence={scope:'19 registered routes: connection-only table; real 1-6 CL1 DD5 operations, no claim of a sufficient OASW count',stages:[]},errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await aswRouteFleet(page,'1-6',0,['阿武隈改二','夕立改二','時雨改二','綾波改二','島風改','雪風改']);
  const audit=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/route-goal-guidance-audit.json'),'utf8')),rows=audit.rows.filter(x=>x.guidanceAudit['先制対潜'].class==='C'&&x.map!=='1-5'&&x.id!=='7-2/0/default');
  evidence.connections=await page.evaluate(rows=>rows.map(({id,map,index})=>{const preset=MAP_PLANS[map].presets[index],c={map,index,preset,fleet:{id:'connection-only',ships:[]}},value=hdOCOaswTarget(c),plan={map,preset,routeIndex:index,ships:[]};return {id,map,index,selected:value!=null,target:value??null,choose:hdOCOaswRecommendation(c)?.choose,sets:hdFEEquipmentRequirements(plan,hdSEChecks(map).rows).filter(x=>x.kind==='cap-asw').map(x=>x.minCount)}}),rows);
  expect(evidence.connections).toHaveLength(19);for(const x of evidence.connections){expect(x.selected,x.id).toBe(false);expect(x.target,x.id).toBe(null);expect(x.choose,x.id).toBe(true);expect(x.sets,x.id).toEqual([x.map==='7-4'?3:1]);}
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel'),input=panel.locator('[data-hd-oc-asw-target]');await expect(input).toHaveValue('');await expect(panel.locator('[data-hd-oc-asw-source]')).toContainText('人数を指定');
  await panel.locator('[data-hd-oc-search]').click();const unspecified=await aswRouteRecord(page,'1-6',0);evidence.stages.push(unspecified);expect(unspecified.goal).toMatchObject({minCount:null,count:null,unresolved:true,ok:false});expect(unspecified.sets).toMatchObject({minCount:1,ok:true});expect(unspecified.shortages.some(x=>x.kind==='opening-asw')).toBe(false);expect(unspecified.route).toBe('ready');
  await input.fill('0');await input.press('Tab');await expect(panel.locator('[data-hd-oc-asw-source]')).toContainText('明示0');await panel.locator('[data-hd-oc-search]').click();const zero=await aswRouteRecord(page,'1-6',0);evidence.stages.push(zero);expect(zero.goal).toBeUndefined();expect(zero.sets).toMatchObject({minCount:1,ok:true});expect(zero.shortages.some(x=>x.kind==='opening-asw')).toBe(false);
  for(const count of Object.values(zero.usage))expect(count).toBeLessThanOrEqual(6);
  const saved=await aswRouteSaveReload(page,'1-6',0,evidence);expect(saved.goal).toBe(0);expect(saved.stored).toBe(0);await expect(input).toHaveValue('0');await page.evaluate(()=>{window.dispatchEvent(new CustomEvent('hd:kancolle-sync',{detail:{synthetic:true}}));hdMSNOpen('1-6')});await expect(input).toHaveValue('0');expect(errors).toEqual([]);
 }finally{await finishAswRoute(info,evidence,errors)}
});
guidanceTest('route-scoped ASW goals preserve legacy counts through preset map switches and save reload',async({page},info)=>{
 const evidence={scope:'4-2 scope isolation; route1 preview/save is deliberately not a claim of route legality; positive route0 final search uses real CV2 CL1 DD3',stages:[]},errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await aswRouteFleet(page,'4-2',0,['赤城改','加賀改','阿武隈改二','夕立改二','時雨改二','綾波改二']);
  await page.evaluate(()=>{const all=loadCustomFleets();all['4-2'][0].openingAswCount=2;all['1-6']=[{id:'route-asw',name:'設定切替専用・空編成',metadata:{keep:true},ships:[],routePreset:MAP_PLANS['1-6'].presets[0]}];saveCustomFleets(all);hdMSNOpen('4-2')});
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel'),input=panel.locator('[data-hd-oc-asw-target]'),route=page.locator('#hdMapStrategyRoute'),map=page.locator('#hdMapStrategyMap');await expect(input).toHaveValue('2');
  await route.selectOption('1');await expect(route).toHaveValue('1');evidence.afterRouteSwitch=await input.inputValue();await expect(input).toHaveValue('');
  expect(await page.evaluate(()=>loadCustomFleets()['4-2'][0].openingAswCount)).toBe(2);
  await panel.locator('[data-hd-oc-search]').click();const preview=await aswRouteRecord(page,'4-2',1);evidence.stages.push(preview);expect(preview.goal).toMatchObject({minCount:null,unresolved:true,ok:false});
  const unselected=await aswRouteSaveReload(page,'4-2',1,evidence);evidence.unselectedSave=unselected;expect(unselected.goal).toBeUndefined();expect(unselected.stored).toBeUndefined();expect(await page.evaluate(()=>hdOCOaswTargets()['4-2:route-asw:0'])).toBe(2);
  const otherBefore=await page.evaluate(()=>JSON.stringify(loadCustomFleets()['1-6']));await map.selectOption('1-6');await expect(input).toHaveValue('');await input.fill('5');await input.press('Tab');await map.selectOption('4-2');await expect(input).toHaveValue('');await route.selectOption('0');await expect(input).toHaveValue('2');
  await input.fill('3');await input.press('Tab');await page.evaluate(()=>{window.dispatchEvent(new CustomEvent('hd:kancolle-sync',{detail:{synthetic:true}}));hdMSNOpen('4-2')});await expect(input).toHaveValue('3');
  await panel.locator('[data-hd-oc-search]').click();const result=await aswRouteRecord(page,'4-2',0);evidence.stages.push(result);expect(result.goal.minCount).toBe(3);expect(result.goal.count).toBeGreaterThanOrEqual(3);expect(result.goal.ok).toBe(true);expect(result.sets).toMatchObject({minCount:1,ok:true});expect(result.route).toBe('ready');for(const count of Object.values(result.usage))expect(count).toBeLessThanOrEqual(6);
  const saved=await aswRouteSaveReload(page,'4-2',0,evidence);expect(saved.goal).toBe(3);expect(saved.stored).toBe(3);expect(await page.evaluate(()=>hdOCOaswTargets()['1-6:route-asw:0'])).toBe(5);expect(await page.evaluate(()=>JSON.stringify(loadCustomFleets()['1-6']))).toBe(otherBefore);expect(errors).toEqual([]);
 }finally{await finishAswRoute(info,evidence,errors)}
});
guidanceTest('source-backed destroyer ASW target drives real owned search and keeps user override',async({page},info)=>{
 const evidence={scope:'real 1-5 preset2 destroyer4; source example target, not passage necessity; synthetic observed stats',stages:[]},errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await aswRouteFleet(page,'1-5',2,['夕立改二','時雨改二','綾波改二','島風改']);
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel'),input=panel.locator('[data-hd-oc-asw-target]');
  evidence.initial=await input.inputValue();await expect(input).toHaveValue('4');await expect(panel.locator('[data-hd-oc-asw-source]')).toContainText('推奨');
  await panel.locator('[data-hd-oc-search]').click();const r=await aswRouteRecord(page,'1-5',2);evidence.stages.push(r);
  expect(r.goal).toMatchObject({count:4,minCount:4,ok:true,missingCount:0,manualCount:0});expect(r.sets).toMatchObject({count:4,minCount:4,ok:true});expect(r.usage).toEqual({'三式水中探信儀':4,'三式爆雷投射機':4});expect(r.route).toBe('ready');
  const auto=await page.evaluate(()=>{hdSelectGuideMap('1-5');hdFSOpen();const list=hdFSPlans('1-5'),index=list.findIndex(x=>x.routeIndex===2),p=hdFLGenerate(index);return hdFLAssessment(p).measure.goals.find(x=>x.kind==='opening-asw')});evidence.automatic=auto;expect(auto.minCount).toBe(4);
  await page.evaluate(()=>hdMSNOpen('1-5'));await input.fill('2');await input.press('Tab');await page.evaluate(()=>{window.dispatchEvent(new CustomEvent('hd:kancolle-sync',{detail:{synthetic:true}}));hdMSNOpen('1-5')});await expect(input).toHaveValue('2');
  await panel.locator('[data-hd-oc-search]').click();const saved=await aswRouteSaveReload(page,'1-5',2,evidence);expect(saved.goal).toBe(2);expect(saved.stored).toBe(2);expect(errors).toEqual([]);
 }finally{await finishAswRoute(info,evidence,errors)}
});
guidanceTest('7-1 ASW review counts mixed states and preserves the chosen goal after value clearing',async({page},info)=>{
 const evidence={scope:'real 7-1 preset0, current legal allocation replay for independent 100/99/missing-stat boundaries',stages:[]},errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await aswRouteFleet(page,'7-1',0,['阿武隈改二','夕立改二','時雨改二','綾波改二','島風改']);const panel=page.locator('#mapStrategyNavigator .hd-oc-panel'),input=panel.locator('[data-hd-oc-asw-target]');await expect(input).toHaveValue('4');
  await page.evaluate(()=>{const roster=hdFERoster(),fleets=loadCustomFleets();roster.forEach((r,i)=>{r.gameGearSlots=['三式水中探信儀','三式爆雷投射機',''];if(i===4)delete r.gameAsw;else r.gameAsw=i<2?100:99;fleets['7-1'][0].ships[i].gear='三式水中探信儀 / 三式爆雷投射機'});localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(roster));saveCustomFleets(fleets);const c=hdOCContext('7-1','route-asw',0),b=hdOCBuild(c);b.plan.ships.forEach(s=>{s.items=s.items.filter(x=>x.name)});const measure=hdOCMeasure(b.plan,hdFLRequirements(b.plan),b.unknown);HD_OC_CACHE.set('7-1:route-asw:0',{plan:b.plan,measure,signature:hdOCSignature(c),fleetId:'route-asw',shortages:[],examined:0,search:{status:'incomplete',exhaustive:false,examined:0,reasons:['current-allocation-review']}});hdMSNOpen('7-1')});
  const first=await aswRouteRecord(page,'7-1',0);evidence.stages.push(first);expect(first.goal).toMatchObject({count:2,missingCount:2,manualCount:1,minCount:4,unresolved:true,ok:false});expect(first.goal.ships.map(x=>x.state.status)).toEqual(['ready','ready','missing','missing','manual']);
  await expect(panel.locator('.hd-oc-goal').filter({hasText:'先制対潜艦の目標'})).toContainText('不足2隻・未判定1隻');await expect(panel.locator('[data-hd-oc-asw-ships]')).toContainText('必要 100（あと1）');
  const value=panel.locator('[data-hd-oc-oasw-ship="4"][data-hd-oasw-value]');await value.fill('100');await value.press('Tab');const known=await aswRouteRecord(page,'7-1',0);evidence.stages.push(known);expect(known.goal).toMatchObject({count:3,missingCount:2,manualCount:0,unresolved:false});
  await value.fill('');await value.press('Tab');const unknown=await aswRouteRecord(page,'7-1',0);evidence.stages.push(unknown);expect(unknown.goal.manualCount).toBe(1);expect(unknown.shortages.some(g=>g.kind==='opening-asw')).toBe(false);
  await input.fill('2');await input.press('Tab');await page.evaluate(()=>hdMSNOpen('7-1'));await expect(input).toHaveValue('2');await panel.locator('[data-hd-oc-search]').click();const saved=await aswRouteSaveReload(page,'7-1',0,evidence);expect(saved.goal).toBe(2);expect(saved.stored).toBe(2);expect(errors).toEqual([]);
 }finally{await finishAswRoute(info,evidence,errors)}
});
guidanceTest('7-2 first gauge asks for an ASW goal and reports four-set inventory shortage before recovery',async({page},info)=>{
 const evidence={scope:'real 7-2 preset0 CL1 DD3; do not reuse the different five-ship leveling example',stages:[]},errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await aswRouteFleet(page,'7-2',0,['阿武隈改二','夕立改二','時雨改二','綾波改二'],1);const panel=page.locator('#mapStrategyNavigator .hd-oc-panel'),input=panel.locator('[data-hd-oc-asw-target]');await expect(input).toHaveValue('');await expect(panel.locator('[data-hd-oc-asw-source]')).toContainText('人数を指定');
  await panel.locator('[data-hd-oc-search]').click();const poor=await aswRouteRecord(page,'7-2',0);evidence.stages.push(poor);expect(poor.goal).toMatchObject({count:null,minCount:null,unresolved:true,ok:false});expect(poor.sets).toMatchObject({minCount:4,count:1,ok:false});const parts=poor.shortages.find(g=>g.kind==='cap-asw').parts;expect(parts.map(p=>[p.need,p.have])).toEqual([[4,1],[4,1]]);await expect(panel.locator('[data-hd-oc-capability-stock]')).toContainText('あと3個');
  await input.fill('3');await input.press('Tab');await page.evaluate(()=>{localStorage.setItem(HD_FL_KEY,JSON.stringify([{name:'三式水中探信儀',count:4},{name:'三式爆雷投射機',count:4}]));window.dispatchEvent(new Event('hd:equipment-changed'));hdMSNOpen('7-2')});await expect(input).toHaveValue('3');
  await panel.locator('[data-hd-oc-search]').click();const recovered=await aswRouteRecord(page,'7-2',0);evidence.stages.push(recovered);expect(recovered.goal).toMatchObject({minCount:3,count:4,ok:true});expect(recovered.sets).toMatchObject({minCount:4,count:4,ok:true});expect(recovered.usage).toEqual({'三式水中探信儀':4,'三式爆雷投射機':4});
  const saved=await aswRouteSaveReload(page,'7-2',0,evidence);expect(saved.goal).toBe(3);expect(saved.stored).toBe(3);expect(errors).toEqual([]);
 }finally{await finishAswRoute(info,evidence,errors)}
});
guidanceTest('unknown opening ASW is not a confirmed equipment shortage and survives save reload before recovery',async({page},info)=>{
 const evidence={scope:'real 1-5 preset0, four synthetic DE individuals; target4 is a user-selected ASW goal, not a new route requirement',stages:[]},errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await fleet(page,{count:4,stock:4,realRoute:true});
  const audit=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/route-goal-guidance-audit.json'),'utf8'));
  evidence.connections=await page.evaluate(rows=>rows.map(({id,map,index,goal})=>{
   const preset=MAP_PLANS[map].presets[index],sourceFleet={id:'connection-only'},plan={map,preset,sourceFleet,routeIndex:index,routeInfo:hdFSPresetInfo(preset),routeGoal:goal,ships:[]};
   plan.openingAswCount=hdOCOaswTarget({map,preset,fleet:sourceFleet,index});
   const requirements=hdFEEquipmentRequirements(plan,hdSEChecks(map).rows),m=hdOCMeasure(plan,requirements),data=hdFERouteRequirementData(plan);
   return {id,map,index,goal,los:data.los,targets:requirements.map(({kind,minCount,generatedFromMap})=>({kind,minCount,generatedFromMap})),aswTarget:plan.openingAswCount,speedTarget:hdFEPlanSpeedTarget(plan),conditions:m.requiredChecks.map(c=>c.condition),goals:m.goals.map(({kind,minCount,unresolved,purpose})=>({kind,minCount,unresolved,purpose})),targetData:{equipmentTargets:data.equipmentTargets,carrierAttackTarget:data.carrierAttackTarget,waterAttackTarget:data.waterAttackTarget},airOptional:typeof hdSEAirOptional==='function'&&hdSEAirOptional(map)};
  }),audit.rows);
  expect(evidence.connections).toHaveLength(59);
  for(let i=0;i<audit.rows.length;i++){
   const expected=audit.rows[i],actual=evidence.connections[i];expect(actual.id).toBe(expected.id);expect(actual.los).toEqual(expected.scouting);
   if(expected.scouting.kind==='required'){const condition=routeAuditNumericCondition(expected.scouting);expect(actual.conditions).toContainEqual(condition);}
   for(const c of expected.conditions)if(c.kind==='equipmentShips'&&c.match==='drum')expect(actual.goals).toContainEqual(expect.objectContaining({kind:'drum-ships',minCount:c.min}));
  }
  const reference=await page.evaluate(()=>{
   const rows=hdFERoster();for(const row of rows){delete row.gameAsw;delete row.gameAswBaseline;}
   localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));
   const fleets=loadCustomFleets(),f=fleets['1-5'][0];f.routePreset=MAP_PLANS['1-5'].presets[0];f.metadata={keep:true};f.ships.forEach(s=>{s.gear='三式水中探信儀 / 三式爆雷投射機'});
   fleets['1-1']=[{id:'guidance-other',name:'別編成',ships:[],metadata:{keep:true}}];saveCustomFleets(fleets);hdMSNOpen('1-5');
   const keys=[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1'];
   return {keys,values:keys.map(k=>localStorage.getItem(k)),other:JSON.stringify(fleets['1-1']),ids:f.ships.map(s=>s.gameShipId)};
  });
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel'),goal=panel.locator('.hd-oc-goal').filter({hasText:'先制対潜艦の目標'});
  const observe=async label=>{
   const row=await page.evaluate(()=>{const r=HD_OC_CACHE.get('1-5:oasw-fleet:0');return {goals:r.measure.goals.map(({kind,count,minCount,ok,unresolved,detail,purpose})=>({kind,count,minCount,ok,unresolved,detail,purpose})),shortages:r.shortages.map(({goalKind,unresolved,shortfall})=>({goalKind,unresolved,shortfall})),route:hdFERoute(r.plan).status,readiness:hdOCReadiness(r.plan,r.measure),search:r.search}});
   evidence.stages.push({label,...row});return row;
  };
  await panel.locator('[data-hd-oc-search]').click();await expect(goal).toContainText('未判定');
  const unknown=await observe('unknown');expect(unknown.goals.find(g=>g.kind==='cap-asw')).toMatchObject({count:4,minCount:4,ok:true});expect(unknown.route).toBe('ready');
  expect(unknown.goals.find(g=>g.kind==='opening-asw')).toMatchObject({count:0,minCount:4,ok:false,unresolved:true});
  expect(unknown.shortages.some(g=>g.goalKind==='opening-asw')).toBe(false);
  await expect(panel.locator('.hd-oc-shortage').filter({hasText:'先制対潜艦の目標に必要なもの'})).toHaveCount(0);
  await expect(panel.locator('[data-hd-oc-asw-ships]')).toContainText('未判定');
  await panel.locator('[data-hd-oc-apply]').click();
  const stored=await page.evaluate(reference=>{const f=loadCustomFleets()['1-5'][0];return {exact:reference.keys.every((k,i)=>localStorage.getItem(k)===reference.values[i]),other:JSON.stringify(loadCustomFleets()['1-1'])===reference.other,ids:f.ships.map(s=>s.gameShipId),metadata:f.metadata}},reference);
  evidence.saved=stored;expect(stored).toEqual({exact:true,other:true,ids:reference.ids,metadata:{keep:true}});
  await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
  await page.evaluate(()=>hdMSNOpen('1-5'));await panel.locator('[data-hd-oc-search]').click();await expect(goal).toContainText('未判定');
  await observe('after-load-unknown');
  const after=await page.evaluate(reference=>({state:document.readyState,exact:reference.keys.every((k,i)=>localStorage.getItem(k)===reference.values[i]),other:JSON.stringify(loadCustomFleets()['1-1'])===reference.other}),reference);
  evidence.after=after;expect(after).toEqual({state:'complete',exact:true,other:true});
  await page.evaluate(()=>{const rows=hdFERoster(),f=loadCustomFleets()['1-5'][0];for(const row of rows){const tokens=hdFEGearTokens(f.ships.find(s=>s.gameShipId===row.gameShipId).gear),count=hdShipDbSlotProfile(hdFEFindShip(row.name)).count;row.gameAsw=70;row.gameGearSlots=Array.from({length:count},(_,i)=>tokens[i]||'');row.gameGearExpansion='';row.gameAswGearKnown=true;}localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));hdMSNRender()});
  await panel.locator('[data-hd-oc-search]').click();await expect(goal).toContainText('充足');
  const recovered=await observe('synced-value-recovery');expect(recovered.goals.find(g=>g.kind==='opening-asw')).toMatchObject({count:4,minCount:4,ok:true,unresolved:false});expect(errors).toEqual([]);
 }finally{
  evidence.pageerrors=errors;const file=info.outputPath('route-guidance-evidence.json');await fs.promises.writeFile(file,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:file,contentType:'application/json'});
 }
});
test('opening ASW search equips two distinct ships from owned stacks and counts real capabilities',async({page})=>{
 await fleet(page);
 const r=await page.evaluate(()=>{const c=hdOCContext('1-5','oasw-fleet',0),result=hdOCSearch(c);return {result,readiness:hdOCReadiness(result.plan,result.measure),stock:[...hdFLInventory().values()],usage:hdFOAssignedUsage(result.plan)}});
 const goal=r.result.measure.goals.find(x=>x.kind==='opening-asw');expect(goal).toMatchObject({count:2,minCount:2,ok:true});expect(goal.ships.every(x=>x.state.status==='ready')).toBe(true);
 expect(r.readiness.registeredReady).toBe(true);expect(r.readiness.complete).toBe(false);
 for(const row of r.stock)expect(r.usage[row.key]||0).toBeLessThanOrEqual(row.count);
});
test('opening ASW positive target remains unmet when synced ASW and baseline are absent',async({page})=>{
 await fleet(page,{count:1,stock:1});
 const r=await page.evaluate(()=>{
  const rows=hdFERoster();for(const row of rows){delete row.gameAsw;delete row.gameAswBaseline;}
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));
  const result=hdOCSearch(hdOCContext('1-5','oasw-fleet',0));
  return {goal:result.measure.goals.find(x=>x.kind==='opening-asw'),readiness:hdOCReadiness(result.plan,result.measure)};
 });
 expect(r.goal).toMatchObject({minCount:1,count:0,ok:false,unresolved:true});
 expect(r.goal.ships).toHaveLength(1);expect(r.goal.ships[0].state.status).toBe('manual');
 expect(r.readiness.registeredReady).toBe(false);
});
test('opening ASW positive target cannot reuse one owned sonar for two ships',async({page})=>{
 await fleet(page,{count:2,base:60,stock:1});
 const r=await page.evaluate(()=>{
  const result=hdOCSearch(hdOCContext('1-5','oasw-fleet',0));
  return {goal:result.measure.goals.find(x=>x.kind==='opening-asw'),usage:hdFOAssignedUsage(result.plan),stock:[...hdFLInventory().values()],readiness:hdOCReadiness(result.plan,result.measure)};
 });
 expect(r.goal).toMatchObject({minCount:2,count:1,ok:false});
 for(const row of r.stock)expect(r.usage[row.key]||0).toBeLessThanOrEqual(row.count);
 expect(r.readiness.registeredReady).toBe(false);
});
test('opening ASW lower bounds never turn unverified bonus deficits or missing gear into success',async({page})=>{
 await fleet(page,{base:49,stock:1});
 const r=await page.evaluate(()=>{
  const result=hdOCSearch(hdOCContext('1-5','oasw-fleet',0));const row=hdFERoster()[0],profile=hdShipDbSlotProfile(hdFEFindShip(row.name)),ship={ship:row.name,masterId:row.masterId,gameShipId:row.gameShipId,items:[{name:'三式水中探信儀',slotIndex:0,capacity:0}]};
  const low=hdFEOpeningAsw(ship);row.gameAsw=60;row.gameGearSlots=Array.from({length:profile.count},(_,i)=>i?'':'三式水中探信儀');localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([row]));const exact=hdFEOpeningAsw(ship);ship.items[0].name='四式水中聴音機';const swapped=hdFEOpeningAsw(ship);return {result,low,exact,swapped};
 });
 expect(r.result.measure.goals.find(x=>x.kind==='opening-asw').ok).toBe(false);expect(r.low).toMatchObject({status:'manual',lowerBound:true,value:59,shortfall:1});expect(r.exact.status).toBe('ready');expect(r.swapped.status).toBe('manual');
});
test('opening ASW importer retains a naked baseline only across matching level remodel and modernization',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const parsed=hdKcImportEmpty(),mid=hdShipDbMasterRowFor('夕立改二').id,eid=[...hdKcMasterEquipMap()].find(([,x])=>x.name==='三式水中探信儀')[0];
  const ship={api_id:71,api_ship_id:mid,api_lv:90,api_slot:[-1,-1,-1],api_slot_ex:0,api_taisen:[90,130],api_kyouka:[0,0,0,0,0,0,0]};parsed.ships.set(71,ship);hdKcMergeRoster(parsed);
  ship.api_slot=[10,-1,-1];ship.api_taisen=[100,130];parsed.slotItems.set(10,{api_id:10,api_slotitem_id:eid});hdKcMergeRoster(parsed);const kept=hdFERoster().find(x=>x.gameShipId===71).gameAswBaseline;
  const proposed={ship:'夕立改二',masterId:mid,gameShipId:71,items:[{name:'四式水中聴音機',slotIndex:0,capacity:0}]},state=hdFEOpeningAsw(proposed);
  ship.api_lv=91;hdKcMergeRoster(parsed);const leveled=hdFERoster().find(x=>x.gameShipId===71).gameAswBaseline;
  ship.api_lv=90;ship.api_slot=[-1,-1,-1];ship.api_taisen=[90,130];hdKcMergeRoster(parsed);ship.api_slot=[10,-1,-1];ship.api_kyouka[6]=1;hdKcMergeRoster(parsed);const modernized=hdFERoster().find(x=>x.gameShipId===71).gameAswBaseline;
  return {kept,state,leveled,modernized};
 });
 expect(r.kept.value).toBe(90);expect(r.state).toMatchObject({status:'ready',value:102,lowerBound:true});expect(r.leveled).toBeNull();expect(r.modernized).toBeNull();
});
test('opening ASW importer rejects incomplete slot arrays as evidence for a naked baseline',async({page})=>{
 await boot(page);
 const results=await page.evaluate(()=>{
  const mid=hdShipDbMasterRowFor('夕立改二').id,eid=[...hdKcMasterEquipMap()].find(([,x])=>x.name==='三式水中探信儀')[0];
  return [[],[-1],[null,null,null],['','',''],[-2,-1,-1]].map(api_slot=>{
   localStorage.setItem('harbordesk-ship-roster-v1','[]');const parsed=hdKcImportEmpty();
   const ship={api_id:71,api_ship_id:mid,api_lv:90,api_slot,api_slot_ex:0,api_taisen:[90,130],api_kyouka:[0,0,0,0,0,0,0]};parsed.ships.set(71,ship);hdKcMergeRoster(parsed);
   const row=hdFERoster()[0],before={known:row.gameAswGearKnown,baseline:row.gameAswBaseline};
   ship.api_slot=[10,-1,-1];ship.api_taisen=[100,130];parsed.slotItems.set(10,{api_id:10,api_slotitem_id:eid});hdKcMergeRoster(parsed);
   const state=hdFEOpeningAsw({ship:'夕立改二',masterId:mid,gameShipId:71,items:[{name:'四式水中聴音機',slotIndex:0,capacity:0}]});return {before,state};
  });
 });
 for(const r of results){expect(r.before).toEqual({known:false,baseline:null});expect(r.state.status).toBe('manual');expect(r.state.value??null).toBeNull();}
});
test('incomplete ship slots preserve previous equipment identity and unrelated ledgers even with a complete inventory',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const parsed=hdKcImportEmpty(),mid=hdShipDbMasterRowFor('夕立改二').id,eid=[...hdKcMasterEquipMap()].find(([,x])=>x.name==='三式水中探信儀')[0];
  const ship={api_id:71,api_ship_id:mid,api_lv:90,api_slot:[-1,10,-1],api_slot_ex:0,api_taisen:[100,130]};parsed.ships.set(71,ship);parsed.slotItems.set(10,{api_id:10,api_slotitem_id:eid});hdKcMergeRoster(parsed);
  const row=hdFERoster()[0];row.memo='保持するメモ';localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([row]));
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'三式水中探信儀',count:1}]));localStorage.setItem('harbordesk-kancolle-materials-v1',JSON.stringify({fuel:12345}));
  localStorage.setItem('harbordesk-pwa-v1',JSON.stringify({resources:{fuel:12345,ammo:23456,steel:34567,bauxite:45678}}));
  hdFCSaveState('1-5','preserved',{hqLevel:75,ships:[{name:row.name,gameShipId:71}],gear:[{name:'三式水中探信儀',slotIndex:1,star:0,slot:0}]});
  saveCustomFleets({'1-5':[{id:'preserved',ships:[{ship:row.name,rosterId:row.id,gameShipId:71,masterId:mid,gear:row.gear}]}]});
  const keys=['harbordesk-equipment-v1','harbordesk-kancolle-materials-v1','harbordesk-pwa-v1',CUSTOM_FLEET_KEY,HD_FC_KEY],values=keys.map(k=>localStorage.getItem(k));
  ship.api_slot=[];ship.api_taisen=[90,130];parsed.completeSlotItems=true;hdKcMergeRoster(parsed);const after=hdFERoster()[0];
  return {before:row,after,unrelatedPreserved:JSON.stringify(values)===JSON.stringify(keys.map(k=>localStorage.getItem(k))),state:hdFEOpeningAsw({ship:row.name,masterId:mid,gameShipId:71,items:[{name:'三式水中探信儀',slotIndex:1,capacity:0}]})};
 });
 expect(r.after).toMatchObject({id:r.before.id,gameShipId:71,gear:r.before.gear,gameGearSlots:r.before.gameGearSlots,gameGearExpansion:r.before.gameGearExpansion,memo:'保持するメモ',gameAswGearKnown:false});
 expect(r.unrelatedPreserved).toBe(true);expect(r.state.status).toBe('manual');
});
test('documented 37 maps and 53 presets remain available to the existing route selector',async({page})=>{
 const doc=fs.readFileSync(path.join(__dirname,'../docs/route-condition-coverage-ja.md'),'utf8');
 const documented=[...doc.matchAll(/^\| (\d+-\d+) \| (\d+) \|/gm)].map(m=>({map:m[1],count:Number(m[2])})).sort((a,b)=>a.map.localeCompare(b.map));
 await boot(page);
 const actual=await page.evaluate(()=>Object.keys(MAP_PLANS).map(map=>({map,count:hdMSNPresets(map).length})).sort((a,b)=>a.map.localeCompare(b.map)));
 expect(actual).toEqual(documented);expect(actual).toHaveLength(37);expect(actual.reduce((n,r)=>n+r.count,0)).toBe(53);
});
test('linked fleet sync retains sparse slots expansion and saved individual IDs when ship slots are missing',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const parsed=hdKcImportEmpty(),mid=hdShipDbMasterRowFor('夕立改二').id,eid=[...hdKcMasterEquipMap()].find(([,x])=>x.name==='三式水中探信儀')[0],gun=[...hdKcMasterEquipMap()].find(([,x])=>x.name==='25mm連装機銃')[0];
  const ship={api_id:71,api_ship_id:mid,api_lv:90,api_slot:[-1,10,-1],api_slot_ex:11,api_taisen:[100,130]};parsed.ships.set(71,ship);parsed.decks.set(1,{api_id:1,api_name:'保持テスト',api_ship:[71]});
  parsed.slotItems.set(10,{api_id:10,api_slotitem_id:eid});parsed.slotItems.set(11,{api_id:11,api_slotitem_id:gun});hdKcMergeRoster(parsed);hdKcApplyDecks(parsed);
  const roster=hdFERoster()[0],fleet=hdKcCopyFleetToCustom(1,'1-5');fleet.ships[0].rosterId=roster.id;saveCustomFleets({'1-5':[fleet]});
  const before=hdKcCurrentFleets()[0].ships[0],savedBefore=loadCustomFleets()['1-5'][0].ships[0],planBefore=hdFEPlanFromSavedFleet('1-5',fleet);
  ship.api_slot=[];ship.api_slot_ex=null;parsed.completeSlotItems=true;hdKcMergeRoster(parsed);hdKcApplyDecks(parsed);
  const after=hdKcCurrentFleets()[0].ships[0],savedAfter=loadCustomFleets()['1-5'][0].ships[0],match=hdFEGameMatch(planBefore);
  ship.api_slot=[-1,-1,-1];ship.api_slot_ex=0;hdKcMergeRoster(parsed);hdKcApplyDecks(parsed);const cleared=loadCustomFleets()['1-5'][0].ships[0];
  return {before,after,savedBefore,savedAfter,planBefore,match,cleared};
 });
 expect(r.planBefore.ships[0].items).toEqual([expect.objectContaining({name:'三式水中探信儀',slotIndex:1})]);expect(r.planBefore.ships[0].expansion.name).toBe('25mm連装機銃');
 expect(r.after).toMatchObject({gearSlots:r.before.gearSlots,gearExpansion:r.before.gearExpansion,gearKnown:false});
 expect(r.savedAfter).toMatchObject({gameShipId:71,rosterId:r.savedBefore.rosterId,gear:r.savedBefore.gear});expect(r.match.status).toBe('manual');expect(r.match.detail).toContain('装備情報未確認');
 expect(r.cleared.gear).toBe('');expect(r.cleared.gameShipId).toBe(71);
});
test('opening ASW legacy baseline without complete slot evidence stays unverified without deleting saved data',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const parsed=hdKcImportEmpty(),mid=hdShipDbMasterRowFor('夕立改二').id,eid=[...hdKcMasterEquipMap()].find(([,x])=>x.name==='三式水中探信儀')[0];
  parsed.ships.set(71,{api_id:71,api_ship_id:mid,api_lv:90,api_slot:[10,-1,-1],api_slot_ex:0,api_taisen:[100,130],api_kyouka:[0,0,0,0,0,0,0]});parsed.slotItems.set(10,{api_id:10,api_slotitem_id:eid});hdKcMergeRoster(parsed);
  const row=hdFERoster()[0];row.memo='旧データを保持';row.gameAswBaseline={value:90,level:90,masterId:mid,mods:row.gameAswMods};localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([row]));
  const before=localStorage.getItem('harbordesk-ship-roster-v1'),ship={ship:row.name,masterId:mid,gameShipId:71,items:[{name:'四式水中聴音機',slotIndex:0,capacity:0}]},changed=hdFEOpeningAsw(ship);
  ship.items[0].name='三式水中探信儀';const exact=hdFEOpeningAsw(ship);return {changed,exact,unchanged:before===localStorage.getItem('harbordesk-ship-roster-v1')};
 });
 expect(r.changed.status).toBe('manual');expect(r.exact).toMatchObject({status:'ready',value:100,source:'同じ装備での同期値'});expect(r.unchanged).toBe(true);
});
test('opening ASW goal edits invalidate proposals and confirmed values update the integrated result',async({page})=>{
 await fleet(page,{base:49,stock:1});const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').tap();
 await expect(panel.locator('[data-hd-oc-asw-ships]')).toContainText('先制対潜');await expect(panel.locator('[data-hd-oc-readiness]')).not.toContainText('登録範囲の条件を充足');
 const input=panel.locator('[data-hd-oc-oasw-ship][data-hd-oasw-value]').first();await input.fill('60');
 expect(await page.evaluate(()=>{const active=document.activeElement;hdMSNRender();return active===document.activeElement&&active.isConnected})).toBe(true);
 await input.press('Tab');
 await expect(panel.locator('[data-hd-oc-asw-ships]')).toContainText('入力したゲーム表示値 60');
 await panel.locator('[data-hd-oc-asw-target]').fill('1');await panel.locator('[data-hd-oc-asw-target]').press('Tab');await expect(panel.locator('[data-hd-oc-apply]')).toHaveCount(0);
 expect(await page.evaluate(()=>hdOCOaswTarget(hdOCContext('1-5','oasw-fleet',0)))).toBe(1);
});
test('opening ASW saves individual IDs and gear then reloads and reflects synchronized HQ in the planner',async({page})=>{
 await fleet(page);const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').tap();await expect(panel.locator('[data-hd-oc-readiness]')).toContainText('登録範囲の条件を充足');
 const proposed=await page.evaluate(()=>HD_OC_CACHE.get('1-5:oasw-fleet:0').plan.ships);
 await panel.locator('[data-hd-oc-calculator]').tap();await expect(page.locator('[data-hd-fc-hq]')).toHaveValue('20');
 await page.evaluate(()=>hdMSNOpen('1-5'));await panel.locator('[data-hd-oc-apply]').tap();
 const saved=await page.evaluate(()=>loadCustomFleets()['1-5'][0]);expect(saved.openingAswCount).toBe(2);expect(saved.ships.map(x=>x.gameShipId)).toEqual(proposed.map(x=>x.gameShipId));expect(saved.ships.every(x=>x.gear.includes('三式水中探信儀'))).toBe(true);
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFEOpeningAsw==='function');
 const actual=await page.evaluate(()=>{const p=hdFEPlanFromSavedFleet('1-5',loadCustomFleets()['1-5'][0]);return {ids:p.ships.map(x=>x.rosterId),states:p.ships.map(x=>hdFEOpeningAsw(x).status),calculator:hdFCLoadAll()}});
 expect(actual.ids).toEqual(saved.ships.map(x=>x.rosterId));expect(actual.states).toEqual(['ready','ready']);expect(Object.values(actual.calculator).find(x=>x.proposal).hqLevel).toBe(20);
});
test('owned alternatives select distinct matching ships near the recommended level and refuse stale data',async({page})=>{
 await fleet(page);
 const r=await page.evaluate(async()=>{
  const all=loadCustomFleets();all['1-5'][0].ships[0]={ship:'択捉改',gear:''};saveCustomFleets(all);
  const rows=hdFERoster();rows.push({...rows[0],id:'low',gameShipId:999,level:1});localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));
  const c=hdOCContext('1-5','oasw-fleet',0),result=hdOCSearch(c),before=localStorage.getItem(CUSTOM_FLEET_KEY),found=await hdOCFindAlternatives(c,result,{maxCandidates:8,maxExamined:350});
  const unchanged=before===localStorage.getItem(CUSTOM_FLEET_KEY);localStorage.setItem('harbordesk-equipment-v1','[]');let stale=false;try{await hdOCFindAlternatives(c,result)}catch(e){stale=e.code==='HD_OC_STALE'}return {found,unchanged,stale};
 });
 expect(r.found.proposal).not.toBeNull();expect(r.found.proposal.plan.ships.map(x=>x.gameShipId)).toEqual([100,101]);expect(r.found.proposal.replacements[0].level).toBe(80);expect(r.found.proposal.alternativeAssessment.registeredReady).toBe(true);expect(r.unchanged).toBe(true);expect(r.stale).toBe(true);
});
test('all registered maps expose unknown conditions and reject inventory overflow in the integrated gate',async({page})=>{
 await fleet(page);
 const r=await page.evaluate(()=>{
  const maps=Object.keys(MAP_PLANS),coverage=maps.map(map=>hdOCReadiness({map,ships:[]},{goals:[],complete:false}).registeredReady);
  const result=hdOCSearch(hdOCContext('1-5','oasw-fleet',0));localStorage.setItem('harbordesk-equipment-v1','[]');return {count:maps.length,coverage,overflow:hdOCReadiness(result.plan,result.measure)};
 });
 expect(r.count).toBeGreaterThanOrEqual(37);expect(r.coverage.every(x=>x===false)).toBe(true);expect(r.overflow.status).toBe('missing');expect(r.overflow.checks.find(x=>x.id==='inventory').detail).toContain('所持0');
});

test('owned alternative UI preserves chosen identities through save reload and planner reflection',async({page})=>{
 await fleet(page);await page.evaluate(()=>{const all=loadCustomFleets();all['1-5'][0].ships[0]={ship:'択捉改',gear:''};saveCustomFleets(all);hdMSNRender()});
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').tap();await expect(panel.locator('[data-hd-oc-missing-ships]')).toContainText('入手方法');
 await panel.locator('[data-hd-oc-alternatives]').tap();await expect(panel.locator('[data-hd-oc-replacements]')).toContainText('択捉改 → 占守改');
 expect(await page.evaluate(()=>Object.values(hdFCLoadAll()).find(x=>x.proposal).ships[0].gameShipId)).toBe(100);
 await panel.locator('[data-hd-oc-apply]').tap();expect(await page.evaluate(()=>loadCustomFleets()['1-5'][0].ships[0])).toMatchObject({ship:'占守改',rosterId:'asw-0',gameShipId:100});
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCShipOwnership==='function');
 expect(await page.evaluate(()=>hdOCShipOwnership(hdFEPlanFromSavedFleet('1-5',loadCustomFleets()['1-5'][0])).every(x=>x.status==='ready'))).toBe(true);
});
