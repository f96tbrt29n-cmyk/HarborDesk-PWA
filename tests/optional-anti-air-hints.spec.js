'use strict';
const {test,expect:baseExpect}=require('@playwright/test');
const versionFixture=require('../app-version.json');
const expect=baseExpect.configure({timeout:12000});
test.setTimeout(45000);
test.use({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true});

// Display-only coverage. Existing save/edit/load cases remain the evidence for
// the unchanged save path; these cases do not repeat search, apply or editing.
function seedOptionalAaFixture(){
 const layouts=[
  {map:'4-2',index:0,names:['赤城改','加賀改','阿武隈改二','秋月改','夕立改二','時雨改二']},
  {map:'4-2',index:1,names:['赤城改','加賀改','秋月改','夕立改二','時雨改二','綾波改二']},
  {map:'2-4',index:0,names:['赤城改','加賀改','阿武隈改二','秋月改','夕立改二','時雨改二']}
 ];
 const roster=[],fleets={'1-1':[{id:'optional-aa-other',name:'keep other fleet',memo:'keep other memo',metadata:{keep:true},ships:[]}]};
 for(const [group,layout] of layouts.entries()){
  const id='optional-aa-'+layout.map+'-'+layout.index;
  const rows=layout.names.map((name,index)=>{
   const db=hdFEFindShip(name),master=db&&hdShipDbMasterRowFor(db),profile=db&&hdShipDbSlotProfile(db);
   if(!master||!Number.isInteger(profile?.count))throw Error('fixed optional-AA hull material missing');
   return {id:id+'-'+index,name,masterId:master.id,gameShipId:640000+group*10+index,level:90,gameSlotEx:0,gameAswGearKnown:true,gameGearSlots:Array(profile.count).fill(''),gameGearExpansion:'',metadata:{keep:group*10+index}};
  });
  roster.push(...rows);
  (fleets[layout.map]??=[]).push({id,name:'synthetic optional AA display '+layout.index,memo:'keep memo',openingAswCount:0,routePreset:{...MAP_PLANS[layout.map].presets[layout.index]},metadata:{keep:true,nested:{order:['first','second']}},ships:rows.map(row=>({ship:row.name,rosterId:row.id,masterId:row.masterId,gameShipId:row.gameShipId,gear:'',metadata:row.metadata}))});
 }
 localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(roster));
 localStorage.setItem(HD_FL_KEY,'[]');
 localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,metadata:{keep:true}}));
 localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:roster.slice(0,6).map(row=>({gameShipId:row.gameShipId,gearKnown:true}))}]));
 localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
 saveCustomFleets(fleets);
 localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify([{id:'optional-aa-untouched',map:'1-1',gearItems:[],metadata:{keep:true}}]));
 localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));
 hdMapRouteSet('4-2',0);hdMapRouteSet('2-4',0);
 // Saved values stay in test memory. Only exact-match flags leave checkpoints.
 return {values:[CUSTOM_FLEET_KEY,SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1',HD_PROCUREMENT_KEY].map(key=>[key,localStorage.getItem(key)]),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])};
}

function optionalAaModelVector(map,index){
 const c=hdOCContext(map,'optional-aa-'+map+'-'+index,index),built=hdOCBuild(c),se=hdSEChecks(map).rows,fe=hdFEEquipmentRequirements(built.plan,se),measure=hdOCMeasure(built.plan,se,built.unknown);
 const vector=JSON.stringify({se:se.map(x=>({kind:x.kind,minCount:x.minCount,generatedFromMap:x.generatedFromMap})),fe:fe.map(x=>({kind:x.kind,minCount:x.minCount,purpose:x.purpose,generatedFromMap:x.generatedFromMap})),goals:measure.goals.map(x=>({kind:x.kind,minCount:x.minCount,count:x.count,purpose:x.purpose,shipIndex:x.shipIndex,unresolved:x.unresolved}))});
 return {vector,aaGoalCount:measure.goals.filter(x=>x.kind==='cap-aa'||x.kind==='防空').length,aaCheckCount:se.filter(x=>x.kind==='cap-aa'||x.kind==='防空').length};
}

function inspectOptionalAa({ref,vectorRef,map,index,doc,vectorSource}){
 const model=(0,eval)('('+vectorSource+')')(map,index);
 return {sameDocument:doc==null?null:doc===performance.timeOrigin,readyState:document.readyState,storageExact:ref.values.every(([key,value])=>localStorage.getItem(key)===value),stableKeyCount:ref.values.length,otherPlannerExact:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,goalVectorExact:model.vector===vectorRef,aaGoalCount:model.aaGoalCount,aaCheckCount:model.aaCheckCount};
}

async function boot(page){
 await page.route('**/*',route=>{
  const request=route.request(),url=new URL(request.url());
  const version=(url.origin==='https://raw.githubusercontent.com'&&url.pathname==='/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json')||(url.origin==='http://127.0.0.1:4173'&&url.pathname==='/app-version.json');
  if(request.method()==='GET'&&version)return route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:versionFixture.version,build:versionFixture.build})});
  return ['localhost','127.0.0.1'].includes(url.hostname)?route.continue():route.fulfill({status:204,body:''});
 });
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCPanel==='function'&&typeof hdSEOptionalAaAdviceHtml==='function'&&typeof hdSelectGuideMap==='function');
}

async function checkHint(host,map,scope){
 const hint=host.locator(`[data-hd-optional-aa="${map}"][data-hd-optional-aa-scope="${scope}"]`);
 await expect(hint).toHaveCount(1);await expect(hint).toBeVisible();await expect(hint).toHaveAttribute('data-hd-optional-aa-status','ready');
 await expect(hint).toContainText('対空装備の任意候補');
 await expect(hint).toContainText('同じ艦に載せる任意の構成例です。部品数は構成例の内訳で、艦隊に必要な組数を示すものではありません。この案内では必要組数・不足数を判定しません。');
 await expect(hint).toContainText('通行条件・対空CIの発動・勝利を保証しません');
 await expect(hint.locator('input,select,button,[data-hd-oc-acquire],[data-hd-equip-add],[data-hd-se-capability]')).toHaveCount(0);
 const examples=hint.locator('[data-hd-optional-aa-examples]');if(await examples.getAttribute('open')===null)await examples.locator('summary').click();await expect(examples).toHaveJSProperty('open',true);
 await expect(hint.locator('[data-hd-optional-aa-recipe]')).toHaveCount(6);
 await expect(hint.locator('[data-hd-optional-aa-recipe="akizuki-radar"]')).toBeVisible();await expect(hint.locator('[data-hd-optional-aa-recipe="akizuki-radar"]')).toContainText('秋月型：高角砲2＋電探');
 await expect(hint.locator('[data-hd-optional-aa-recipe="director-radar"]')).toBeVisible();await expect(hint.locator('[data-hd-optional-aa-recipe="director-radar"]')).toContainText('汎用：高角砲＋高射装置＋対空電探');
 await expect(hint.locator('[data-hd-optional-aa-recipe="akizuki-radar"]')).toContainText('対象：秋月型');await expect(hint.locator('[data-hd-optional-aa-recipe="director-radar"]')).toContainText('対象：秋月型以外');await expect(hint.locator('[data-hd-optional-aa-recipe="akizuki-radar"] [data-hd-optional-aa-part="ha"]')).toHaveAttribute('data-hd-optional-aa-count','2');
 await expect(hint.locator('[data-hd-optional-aa-recipe="akizuki-radar"] [data-hd-optional-aa-part="radar"]')).toHaveAttribute('data-hd-optional-aa-count','1');
 await expect(hint.locator('[data-hd-optional-aa-recipe="director-radar"] [data-hd-optional-aa-part="director"]')).toHaveAttribute('data-hd-optional-aa-count','1');
 await expect(hint).not.toContainText('購入必須');await expect(hint).not.toContainText(/あと\s*\d+\s*(?:個|組)/);
 if(map==='2-4'){await expect(hint).toContainText('経路はランダム');await expect(hint).toContainText('進む場合');await expect(hint).toContainText('L');await expect(hint).toContainText('M');}
 else{await expect(hint).toContainText('ACL');await expect(hint).toContainText('BDCL');await expect(hint).toContainText('敵編成');}
 return {hintCount:1,recipeCount:6,componentCountAssertions:3,sameHullAndOptionalLabel:true,representativeComponentCountsExact:true,noTargetOrProcurementControl:true,applicabilityMatches:true};
}

async function checkpoint(page,args){
 const value=await page.evaluate(({source,args})=>(0,eval)('('+source+')')(args),{source:inspectOptionalAa.toString(),args:{...args,vectorSource:optionalAaModelVector.toString()}});
 expect(value).toMatchObject({storageExact:true,stableKeyCount:7,otherPlannerExact:true,goalVectorExact:true,aaGoalCount:0,aaCheckCount:0});
 if(args.doc!=null)expect(value).toMatchObject({sameDocument:true,readyState:'complete'});
 return value;
}

function sharedSummary(evidence,project,retry){
 const integer=value=>Number.isSafeInteger(value)&&value>=0?value:null,boolean=value=>typeof value==='boolean'?value:null;
 return {schemaVersion:1,unit:'optional-anti-air-hints',entry:evidence.entry,project:['chromium','webkit'].includes(project)?project:null,sourceSHA:/^[0-9a-f]{40}$/.test(process.env.GITHUB_SHA||'')?process.env.GITHUB_SHA:null,version:versionFixture.version,stage:evidence.stage,retry:integer(retry),pageerrorCount:integer(evidence.pageerrorCount),checkpoints:evidence.checkpoints.map(row=>({id:row.id,hintCount:integer(row.hintCount),recipeCount:integer(row.recipeCount),componentCountAssertions:integer(row.componentCountAssertions),sameHullAndOptionalLabel:boolean(row.sameHullAndOptionalLabel),representativeComponentCountsExact:boolean(row.representativeComponentCountsExact),noTargetOrProcurementControl:boolean(row.noTargetOrProcurementControl),applicabilityMatches:boolean(row.applicabilityMatches),sameDocument:boolean(row.sameDocument),storageExact:boolean(row.storageExact),stableKeyCount:integer(row.stableKeyCount),otherPlannerExact:boolean(row.otherPlannerExact),goalVectorExact:boolean(row.goalVectorExact),aaGoalCount:integer(row.aaGoalCount),aaCheckCount:integer(row.aaCheckCount)})),saveEditReexecuted:false,storageValueBodiesIncluded:false};
}

for(const entry of ['navigator','map-gear'])test(`optional anti-air hints ${entry} shows scoped examples without adding targets and survives display reload`,async({page},info)=>{
 const evidence={entry,stage:'boot',checkpoints:[],pageerrorCount:null},errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  await boot(page);evidence.stage='seed';
  const ref=await page.evaluate(source=>(0,eval)('('+source+')')(),seedOptionalAaFixture.toString());
  const vectors=await page.evaluate(source=>{const vector=(0,eval)('('+source+')');return {'4-2:0':vector('4-2',0).vector,'4-2:1':vector('4-2',1).vector,'2-4:0':vector('2-4',0).vector};},optionalAaModelVector.toString());
  evidence.stage='open-entry';
  if(entry==='navigator'){
   await page.evaluate(()=>hdMSNOpen('4-2'));
   for(const index of [0,1]){
    evidence.stage='index-'+index;
    await page.locator('#hdMapStrategyRoute').selectOption(String(index));
    await page.locator('#hdMapStrategyFleet').selectOption('optional-aa-4-2-'+index);
    const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await expect(panel).toHaveAttribute('data-hd-oc-route',String(index));
    const ui=await checkHint(panel,'4-2','selected'),state=await checkpoint(page,{ref,vectorRef:vectors['4-2:'+index],map:'4-2',index});
    evidence.checkpoints.push({id:'selected-'+index,...ui,...state});
   }
  }else{
   await page.locator('[data-hd-ws-group="guide"]').click();
   await page.evaluate(()=>hdSelectGuideMap('2-4'));
   await page.locator('#selectedMapCard [data-map-tab="gear"]').click();
   const host=page.locator('[data-map-pane="gear"] #hdMapEquipRecommend');await expect(host).toBeVisible();
   evidence.stage='map-gear';
   const ui=await checkHint(host,'2-4','map'),state=await checkpoint(page,{ref,vectorRef:vectors['2-4:0'],map:'2-4',index:0});
   evidence.checkpoints.push({id:'map-before-load',...ui,...state});
  }
  evidence.stage='reload';await page.reload({waitUntil:'load'});
  await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdSEOptionalAaAdviceHtml==='function'&&typeof hdMSNOpen==='function');
  const doc=await page.evaluate(()=>performance.timeOrigin);evidence.stage='after-load';
  if(entry==='navigator'){
   await page.evaluate(()=>hdMSNOpen('4-2'));
   await expect(page.locator('#hdMapStrategyRoute')).toHaveValue('1');
   await expect(page.locator('#hdMapStrategyFleet')).toHaveValue('optional-aa-4-2-1');
   const panel=page.locator('#mapStrategyNavigator .hd-oc-panel'),ui=await checkHint(panel,'4-2','selected'),state=await checkpoint(page,{ref,vectorRef:vectors['4-2:1'],map:'4-2',index:1,doc});
   evidence.checkpoints.push({id:'selected-after-load',...ui,...state});
  }else{
   await page.locator('[data-hd-ws-group="guide"]').click();
   await expect(page.locator('#selectedMapCard')).toContainText('2-4');
   await page.locator('#selectedMapCard [data-map-tab="gear"]').click();
   const host=page.locator('[data-map-pane="gear"] #hdMapEquipRecommend');await expect(host).toBeVisible();
   const ui=await checkHint(host,'2-4','map'),state=await checkpoint(page,{ref,vectorRef:vectors['2-4:0'],map:'2-4',index:0,doc});
   evidence.checkpoints.push({id:'map-after-load',...ui,...state});
  }
  expect(errors).toEqual([]);evidence.stage='completed';
 }finally{
  evidence.pageerrorCount=errors.length;
  const fs=require('node:fs/promises'),file=info.outputPath('optional-aa-ui-summary.json');
  await fs.writeFile(file,JSON.stringify(sharedSummary(evidence,info.project.name,info.retry),null,2)+'\n');
  await info.attach('optional-aa-ui-summary',{path:file,contentType:'application/json'});
 }
});
