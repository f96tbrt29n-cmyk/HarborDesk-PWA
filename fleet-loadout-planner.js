const HD_FL_KEY='harbordesk-equipment-v1';
const HD_FL_CACHE={};

function hdFLEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdFLNorm(s){return String(s||'').normalize('NFKC').replace(/\s+/g,'').replace(/･/g,'・')}
function hdFLCatalog(){
 const cat=Array.isArray(window.HD_EQUIPMENT_CATALOG)?window.HD_EQUIPMENT_CATALOG:(typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG:[]);
 return Array.isArray(cat)?cat:[];
}
function hdFLRows(){try{const x=JSON.parse(localStorage.getItem(HD_FL_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function hdFLInventoryStackKey(name,star=0){return hdFLNorm(name)+'@@'+Math.max(0,Number(star)||0)}
let hdFLCatalogIndex=null;
function hdFLCatalogByName(){
 const catalog=hdFLCatalog(),coverage=window.HD_EQUIPMENT_PERFORMANCE_COVERAGE;
 if(!hdFLCatalogIndex||hdFLCatalogIndex.catalog!==catalog||hdFLCatalogIndex.length!==catalog.length||hdFLCatalogIndex.coverage!==coverage)hdFLCatalogIndex={catalog,length:catalog.length,coverage,byName:new Map(catalog.map(x=>[hdFLNorm(x.name),x]))};
 return hdFLCatalogIndex.byName;
}
function hdFLInventory(){
 const rows=hdFLRows(),m=new Map();if(!rows.length)return m;
 const byName=hdFLCatalogByName();
 for(const row of rows){
  const norm=hdFLNorm(row.name),star=Math.max(0,Number(row.star)||0),key=hdFLInventoryStackKey(row.name,star),count=Math.max(0,Number(row.count)||0);if(!norm||!count)continue;
  const meta=byName.get(norm)||(typeof hdFEFind==='function'?hdFEFind(row.name):null)||{name:row.name,category:row.category||'',stats:{},tags:[],role:''},cur=m.get(key)||{key,norm,name:row.name,count:0,star,maxStar:star,item:meta};
  cur.count+=count;m.set(key,cur);
 }
 return m;
}
function hdFLType(slot){return slot?.profile?.type||''}
function hdFLRoles(slot){return slot?.profile?.roles||[]}
// api_slot_ex: 0 = not expanded, -1 = expanded and empty, positive = equipped.
// Reference: KC3Kai src/library/objects/Ship.js (ex_item API semantics).
// Missing sync information is not evidence of an unlocked expansion slot.
function hdFLHasExpansion(row){
 const value=row?.gameSlotEx;
 return value!==null&&value!==undefined&&String(value).trim()!==''&&Number.isInteger(Number(value))&&(Number(value)===-1||Number(value)>0);
}
function hdFLIsCarrier(type){return ['軽空母','正規空母','装甲空母'].includes(type)}
function hdFLIsBattleship(type){return ['戦艦','高速戦艦','航空戦艦'].includes(type)}
function hdFLIsCruiser(type){return ['軽巡洋艦','重雷装巡洋艦','重巡洋艦','航空巡洋艦','練習巡洋艦'].includes(type)}
function hdFLIsDestroyer(type){return ['駆逐艦','海防艦'].includes(type)}
function hdFLShipDbItem(slot){
 const name=String(slot?.profile?.row?.name||'').trim();if(!name)return null;
 if(typeof hdShipDbResolveShip==='function')return hdShipDbResolveShip({name,type:slot?.profile?.type||'',masterId:Number(slot?.profile?.row?.masterId)||Number(slot?.profile?.master?.id)||0},slot?.profile?.roles||[]);
 if(typeof HD_SHIP_DATABASE==='undefined')return null;
 return HD_SHIP_DATABASE.find(x=>x.final===name)||null;
}
function hdFLMasterProfile(slot){
 const ship=hdFLShipDbItem(slot);
 return ship&&typeof hdShipDbSlotProfile==='function'?hdShipDbSlotProfile(ship):null;
}
function hdFLCompatibleAt(item,slot,index){
 if(!hdFLCompatible(item,slot))return false;
 const profile=hdFLMasterProfile(slot);
 if(profile&&typeof hdShipDbSlotRejects==='function'&&hdShipDbSlotRejects(profile,Number(index)||0,item))return false;
 return true;
}
function hdFLSlotCapacity(slot,index){
 const p=hdFLMasterProfile(slot);return p&&Array.isArray(p.slots)?p.slots[index]??null:null;
}
function hdFLCompatible(item,slot){
 const exact=hdFLShipDbItem(slot);
 if(exact&&typeof hdShipDbMasterCompatible==='function'){
  const master=hdShipDbMasterCompatible(item,exact);
  if(master!==null)return master;
 }
 const type=hdFLType(slot),cat=String(item.category||''),roles=hdFLRoles(slot);
 if(/陸上攻撃機|陸軍戦闘機|局地戦闘機/.test(cat))return false;
 if(/艦上戦闘機|艦上攻撃機|艦上爆撃機|艦上偵察機/.test(cat))return hdFLIsCarrier(type);
 if(/大口径主砲/.test(cat))return hdFLIsBattleship(type);
 if(/中口径主砲/.test(cat))return hdFLIsCruiser(type);
 if(/小口径主砲/.test(cat))return hdFLIsDestroyer(type)||['軽巡洋艦','練習巡洋艦'].includes(type);
 if(/水上戦闘機/.test(cat))return ['航空巡洋艦','航空戦艦','水上機母艦'].includes(type)||roles.includes('水戦')||roles.includes('制空補助');
 if(/水上偵察機/.test(cat))return hdFLIsBattleship(type)||['軽巡洋艦','重巡洋艦','航空巡洋艦','航空戦艦','水上機母艦'].includes(type);
 if(/対艦強化弾/.test(cat))return hdFLIsBattleship(type);
 if(/魚雷/.test(cat))return hdFLIsDestroyer(type)||['軽巡洋艦','重雷装巡洋艦','重巡洋艦','航空巡洋艦','潜水艦','潜水空母'].includes(type);
 if(/ソナー|爆雷/.test(cat))return hdFLIsDestroyer(type)||['軽巡洋艦','練習巡洋艦','軽空母'].includes(type)||roles.some(r=>String(r).includes('対潜'));
 if(/上陸用舟艇|特型内火艇/.test(cat))return roles.some(r=>['対地','輸送'].includes(r))||['水上機母艦','揚陸艦'].includes(type);
 if(/大型電探/.test(cat))return !hdFLIsDestroyer(type);
 return true;
}
function hdFLScoreBase(item,own){
 const s=item.stats||{};return (Number(s.火力)||0)*1.2+(Number(s.雷装)||0)*1.1+(Number(s.爆装)||0)+(Number(s.対空)||0)*.9+(Number(s.索敵)||0)*.75+(Number(s.対潜)||0)*.75+(Number(s.命中)||0)*.7+(own.maxStar||0)*.35;
}
function hdFLSlotKind(slot,index){
 const type=hdFLType(slot),profile=hdFLMasterProfile(slot);
 if(hdFLIsCarrier(type)){
  if(profile?.slots?.length){
   const order=profile.slots.map((cap,i)=>({cap,i})).sort((a,b)=>b.cap-a.cap||a.i-b.i);
   const min=[...order].sort((a,b)=>a.cap-b.cap||b.i-a.i)[0]?.i;
   if(index===min)return 'recon';
   if(index===order[0]?.i)return 'airAttack';
   if(index===order[1]?.i)return 'fighter';
   return 'airAttack';
  }
  return ['airAttack','fighter','airAttack','recon'][index]||'utility';
 }
 if(hdFLIsBattleship(type))return ['largeGun','largeGun','recon','ap','utility'][index]||'utility';
 if(type==='重雷装巡洋艦')return ['torpedo','torpedo','utility'][index]||'utility';
 if(['重巡洋艦','航空巡洋艦'].includes(type))return ['mediumGun','mediumGun','recon','utility'][index]||'utility';
 if(['軽巡洋艦','練習巡洋艦'].includes(type))return ['smallMediumGun','smallMediumGun','utility','utility','utility'][index]||'utility';
 if(hdFLIsDestroyer(type))return ['smallGun','smallGun','utility','utility'][index]||'utility';
 if(['潜水艦','潜水空母'].includes(type))return ['torpedo','torpedo'][index]||'utility';
 if(type==='水上機母艦')return ['waterAir','recon','utility','utility'][index]||'utility';
 return 'utility';
}
function hdFLSlotCount(slot){
 const master=hdFLMasterProfile(slot);if(master)return master.count;
 const type=hdFLType(slot),roles=hdFLRoles(slot),name=slot?.profile?.row?.name||'';
 if(roles.includes('4スロット')||/矢矧改二|夕張改二|最上改二特/.test(name))return 4;
 if(hdFLIsCarrier(type)||hdFLIsBattleship(type)||['重巡洋艦','航空巡洋艦','航空戦艦'].includes(type))return 4;
 if(['潜水艦','潜水空母'].includes(type))return 2;
 return 3;
}
function hdFLKindMatch(item,kind){
 const cat=String(item.category||''),tags=item.tags||[];
 if(kind==='smallGun')return /小口径主砲/.test(cat);
 if(kind==='mediumGun')return /中口径主砲/.test(cat);
 if(kind==='smallMediumGun')return /小口径主砲|中口径主砲/.test(cat);
 if(kind==='largeGun')return /大口径主砲/.test(cat);
 if(kind==='torpedo')return /魚雷/.test(cat)||tags.includes('甲標的');
 if(kind==='recon')return /水上偵察機|艦上偵察機/.test(cat)||tags.includes('索敵');
 if(kind==='fighter')return /艦上戦闘機/.test(cat)||tags.includes('艦戦');
 if(kind==='airAttack')return /艦上攻撃機|艦上爆撃機/.test(cat)||tags.includes('艦攻')||tags.includes('艦爆');
 if(kind==='waterAir')return /水上戦闘機|水上偵察機/.test(cat);
 if(kind==='ap')return /対艦強化弾/.test(cat)||tags.includes('徹甲弾');
 return true;
}
function hdFLNeedTags(needs){
 const map={
  '対潜':['対潜','ソナー','爆雷'],'制空':['制空','艦戦','水戦'],'防空':['防空','対空CI'],'対地':['対地','集積地','上陸'],
  '索敵':['索敵','電探','水偵','艦偵'],'夜戦':['夜戦','魚雷CI'],'輸送':['輸送'],'電探':['電探'],'高速化':['高速化','機関'],'煙幕':['煙幕']
 };
 return [...new Set((needs||[]).flatMap(n=>map[n.kind]||[]))];
}
function hdFLPick(inv,remaining,slot,slotIndex,kind,needTags,gearMemo){
 const candidates=[];
 for(const own of inv.values()){
  const left=remaining.get(own.key)||0;
  if(left<=0||!hdFLCompatibleAt(own.item,slot,slotIndex)||!hdFLKindMatch(own.item,kind))continue;
  const tags=own.item.tags||[],needHit=tags.filter(t=>needTags.includes(t)).length;
  let score=hdFLScoreBase(own.item,own)+needHit*16;
  if(kind==='utility'&&needHit===0)score-=8;
  if(gearMemo&&String(gearMemo).includes(own.name))score+=24;
  const cap=hdFLSlotCapacity(slot,slotIndex);
  if(cap!=null&&['airAttack','fighter'].includes(kind))score+=Math.sqrt(Math.max(0,cap))*2;
  if(cap!=null&&kind==='recon')score+=Math.max(0,12-cap)*.35;
  candidates.push({own,score});
 }
 candidates.sort((a,b)=>b.score-a.score||b.own.maxStar-a.own.maxStar||a.own.name.localeCompare(b.own.name,'ja'));
 const best=candidates[0];if(!best)return null;
 remaining.set(best.own.key,(remaining.get(best.own.key)||0)-1);return best.own;
}
function hdFLRebalanceExpansion(inv,remaining,suggestion,ships,targetIndex,ship,context=''){
 if(typeof hdShipDbExpansionInfo!=='function')return null;const candidates=[];
 for(let si=0;si<ships.length;si++){
  const sourceSlot=suggestion.slots[si];if(!sourceSlot?.profile)continue;
  for(const normal of (ships[si].items||[])){
   const own=inv.get(normal.stackKey);if(!own)continue;
   const info=hdShipDbExpansionInfo(own.item,ship,own.maxStar||0);
   if(!info.allowed||!(Number(info.reqStar)>0))continue;
   const replacements=[...inv.values()].filter(rep=>rep.key!==own.key&&rep.norm===own.norm&&(remaining.get(rep.key)||0)>0&&rep.maxStar<own.maxStar&&hdFLCompatibleAt(rep.item,sourceSlot,normal.slotIndex)&&hdFLKindMatch(rep.item,normal.kind));
   replacements.sort((a,b)=>b.maxStar-a.maxStar||a.name.localeCompare(b.name,'ja'));
   const replacement=replacements[0];if(!replacement)continue;
   const bonus=info.mode==='special'?24:info.mode==='global'?16:0,score=(typeof hdShipDbEquipPower==='function'?hdShipDbEquipPower(own.item,context):hdFLScoreBase(own.item,own))+(own.maxStar||0)*2+bonus-(own.maxStar-replacement.maxStar)*.25;
   candidates.push({sourceIndex:si,normal,own,replacement,info,score});
  }
 }
 candidates.sort((a,b)=>b.score-a.score||b.own.maxStar-a.own.maxStar||b.replacement.maxStar-a.replacement.maxStar);
 const best=candidates[0];if(!best)return null;
 remaining.set(best.replacement.key,Math.max(0,(remaining.get(best.replacement.key)||0)-1));
 remaining.set(best.own.key,(remaining.get(best.own.key)||0)+1);
 best.normal.name=best.replacement.name;best.normal.star=best.replacement.maxStar||0;best.normal.stackKey=best.replacement.key;best.normal.norm=best.replacement.norm;best.normal.category=best.replacement.item.category||best.normal.category||'';
 return best;
}
function hdFLExpansionMissingCandidate(ship,context=''){
 if(!ship||typeof hdShipDbExpansionInfo!=='function')return null;const rows=[];
 for(const item of hdFLCatalog()){
  let info=hdShipDbExpansionInfo(item,ship,0),reqStar=0;
  if(!info.allowed&&Number(info.reqStar)>0){reqStar=Number(info.reqStar)||0;info=hdShipDbExpansionInfo(item,ship,reqStar)}
  if(!info.allowed)continue;
  const bonus=info.mode==='special'?24:info.mode==='global'?16:0,score=(typeof hdShipDbEquipPower==='function'?hdShipDbEquipPower(item,context):0)+bonus-reqStar*.3;
  rows.push({name:item.name,item,reqStar,reason:info.reason||'',mode:info.mode||'',score});
 }
 rows.sort((a,b)=>b.score-a.score||a.reqStar-b.reqStar||a.name.localeCompare(b.name,'ja'));return rows[0]||null;
}
function hdFLRequiredTotalForName(ships,name){
 const key=hdFLNorm(name);if(!key)return 1;let n=0;
 for(const row of ships){for(const x of (row.items||[]))if(hdFLNorm(x.name)===key)n++;if(row.expansion&&hdFLNorm(row.expansion.name)===key)n++}
 return n+1;
}
function hdFLProcureExpansion(planIndex,shipIndex){
 const map=typeof hdFSMap==='function'?hdFSMap():'',key=map+':'+planIndex,plan=HD_FL_CACHE[key]||hdFLGenerate(planIndex),row=plan?.ships?.[Number(shipIndex)],miss=row?.expansionMissing;if(!map||!row||!miss)return false;
 if(typeof hdPLAddExpansionRequirement!=='function')return false;
 const ok=hdPLAddExpansionRequirement(map,row.ship,row.masterId,miss.name,miss.reqStar,miss.reason,miss.requiredTotal||1);
 if(ok&&typeof hdPLOpenList==='function')hdPLOpenList();return ok;
}
function hdFLGenerate(index){
 const map=typeof hdFSMap==='function'?hdFSMap():'',suggestion=typeof hdFSPlans==='function'?hdFSPlans(map)[Number(index)]:null;if(!map||!suggestion)return null;
 const inv=hdFLInventory(),remaining=new Map([...inv].map(([k,v])=>[k,v.count])),needTags=hdFLNeedTags(suggestion.needs),ships=[],missing=[];
 suggestion.slots.forEach((slot,i)=>{
  if(!slot.profile){ships.push({ship:'',type:'',items:[],missing:['艦娘未選択'],master:false,expansion:null});return}
  const count=hdFLSlotCount(slot),items=[],slotMissing=[],memo=slot.profile.row.gear||'',master=hdFLMasterProfile(slot);
  for(let n=0;n<count;n++){
   const kind=hdFLSlotKind(slot,n),picked=hdFLPick(inv,remaining,slot,n,kind,needTags,memo),capacity=hdFLSlotCapacity(slot,n);
   if(picked)items.push({name:picked.name,star:picked.maxStar,stackKey:picked.key,norm:picked.norm,category:picked.item.category||'',kind,slotIndex:n,capacity});
   else{slotMissing.push(kind);missing.push({ship:slot.profile.row.name,kind,slotIndex:n,capacity})}
  }
  ships.push({ship:slot.profile.row.name,gameShipId:Number(slot.profile.row.gameShipId)||0,masterId:Number(slot.profile.row.masterId)||Number(master?.id)||0,type:slot.profile.type||'',items,missing:slotMissing,master:!!master,expansion:null,expansionMissing:null});
 });
 // Optional expansion-slot suggestions, only after every normal slot has been allocated.
 ships.forEach((row,i)=>{
  const slot=suggestion.slots[i],ship=hdFLShipDbItem(slot);
  if(!hdFLHasExpansion(slot?.profile?.row)||!ship||typeof hdShipDbExpansionCandidates!=='function')return;
  const context=[...(suggestion.needs||[]).map(x=>x.kind||''),slot?.profile?.row?.gear||''].join(' ');
  let pick=hdShipDbExpansionCandidates(ship,remaining,context)[0],rebalance=null;
  if(!pick){rebalance=hdFLRebalanceExpansion(inv,remaining,suggestion,ships,i,ship,context);if(rebalance){const rows=hdShipDbExpansionCandidates(ship,remaining,context);pick=rows.find(x=>x.own.key===rebalance.own.key)||rows[0]||null}}
  if(pick&&Number(pick.score)>0){
   const moved=rebalance&&pick.own.key===rebalance.own.key?`・★条件のため${ships[rebalance.sourceIndex].ship}の通常枠を★${rebalance.replacement.maxStar||0}へ自動入替`:'';
   row.expansion={name:pick.own.name,star:pick.own.maxStar||0,stackKey:pick.own.key,reason:(pick.info?.reason||'')+moved,mode:pick.info?.mode||'',rebalanced:!!moved};
   remaining.set(pick.own.key,Math.max(0,(remaining.get(pick.own.key)||0)-1));return;
  }
  const miss=hdFLExpansionMissingCandidate(ship,context);if(miss)row.expansionMissing={...miss,requiredTotal:hdFLRequiredTotalForName(ships,miss.name)};
 });
 const used={};for(const s of ships){for(const x of s.items)used[x.name]=(used[x.name]||0)+1;if(s.expansion)used[s.expansion.name]=(used[s.expansion.name]||0)+1}
 const owned={};for(const x of inv.values())owned[x.name]=(owned[x.name]||0)+x.count;
 const plan={map,index:Number(index),suggestion,ships,missing,used,owned,masterBacked:ships.filter(x=>x.master).length,createdAt:Date.now()};hdFLUpdateAssessment(plan);HD_FL_CACHE[map+':'+index]=plan;return plan;
}
// Use the same route/equipment targets for quick allocation and owned-fleet search.
function hdFLRequirements(plan){return typeof hdSEChecks==='function'?hdSEChecks(plan.map).rows.filter(x=>x.kind!=='基地航空隊').map(x=>({...x,minCount:Math.max(1,Number(x.minCount)||1)})):[]}
function hdFLContext(plan){
 const label=x=>x.name+(x.star?` ★${x.star}`:'');
 return {map:plan.map,index:plan.suggestion.routeIndex??plan.index,preset:plan.suggestion.preset||null,fleet:{id:`auto:${plan.map}:${plan.index}`,name:`${plan.map} 自動配備`,routePreset:plan.suggestion.preset||null,ships:plan.ships.map(s=>({ship:s.ship,masterId:s.masterId,gameShipId:s.gameShipId,gear:[...Array.from({length:s.ship?hdFLSlotCount({profile:{row:{name:s.ship},type:s.type}}):0},(_,i)=>{const x=s.items.find(x=>x.slotIndex===i);return x?label(x):''}),...(s.expansion?[`[増設] ${label(s.expansion)}`]:[])].join(' / ')}))}};
}
function hdFLAssessment(plan){
 if(typeof hdOCMeasure!=='function')return null;
 plan.preset=plan.suggestion.preset||null;plan.routeInfo=plan.suggestion.info||(plan.preset&&typeof hdFSPresetInfo==='function'?hdFSPresetInfo(plan.preset):null);
 const unknown=plan.ships.filter(s=>s.ship&&!s.master).map(s=>`${s.ship}：艦娘のスロット情報が未登録`),requirements=hdFLRequirements(plan);
 const measure=hdOCMeasure(plan,requirements,unknown);
 const air=hdFEAirCheck(plan.map,hdFEAir(hdFEAssigned(plan)));if(air.status==='manual')for(const g of measure.goals)if(g.kind==='air-value')g.unresolved=true;
 return {measure,requirements,profiles:typeof hdSEProfiles==='function'?hdSEProfiles(plan.map):[],reviews:typeof hdOCReview==='function'?hdOCReview(plan,measure):[]};
}
function hdFLNumericRemedies(plan,goal){
 if(!['air-value','los-value'].includes(goal.kind)||goal.unresolved||!Number.isFinite(goal.count)||!Number.isFinite(goal.minCount))return [];
 const kind=goal.kind==='air-value'?'制空':'索敵',usage=hdFOAssignedUsage(plan),inventory=[...hdFLInventory().values()].filter(x=>hdOCItemMatches(kind,x)),catalog=hdFLCatalog().filter(x=>hdOCItemMatches(kind,x)).sort((a,b)=>hdOCScore(kind,b)-hdOCScore(kind,a)),options=[];
 const requirements=plan.assessment?.requirements||hdFLRequirements(plan),before=plan.assessment?.measure||hdOCMeasure(plan,requirements);
 for(const [si,ship] of plan.ships.entries()){
  const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);if(!profile)continue;
  for(let index=0;index<profile.count;index++){
   const slot={si,index,db,profile,capacity:profile.slots[index]},old=ship.items.find(x=>x.slotIndex===index),candidates=new Map();
   // Check every owned stack, including weaker equipment below the catalog leaders.
   for(const x of inventory)if(hdOCCompatible(slot,x))candidates.set(x.key,x);
   // Acquisition examples are shortlisted only after this ship's compatibility check.
   let added=0;
   for(const item of catalog){const key=hdFLInventoryStackKey(item.name),candidate={key,name:item.name,star:0,item,count:0};if(candidates.has(key)||!hdOCCompatible(slot,candidate))continue;candidates.set(key,candidate);if(++added===5)break}
   for(const candidate of candidates.values()){
    if(hdFOStackKey(old)===candidate.key)continue;
    const trial=hdFOClone(plan);trial.ships[si].items=trial.ships[si].items.filter(x=>x.slotIndex!==index);trial.ships[si].items.push(hdOCEquipment(candidate,slot));
    const value=goal.kind==='air-value'?hdFEAir(hdFEAssigned(trial)).basePower:hdFEScouting(trial,hdFEAssigned(trial)).score,gain=value-goal.count;if(!Number.isFinite(value)||!(gain>0))continue;
    const after=hdOCMeasure(trial,requirements),target=after.goals.find(g=>g.kind===goal.kind&&g.label===goal.label),tradeoffs=before.goals.filter(g=>g.ok&&after.goals.some(n=>n.kind===g.kind&&n.label===g.label&&!n.ok)).map(g=>g.label),free=Math.max(0,candidate.count-(usage[candidate.key]||0));
    options.push({name:candidate.name,star:candidate.star,ship:ship.ship,slot:index+1,old:old?.name||'空き枠',gain,value,available:free>0,owned:candidate.count,free,remaining:Math.max(0,goal.minCount-value),targetReady:target?target.ok:value>=goal.minCount,tradeoffs});
   }
  }
 }
 // Prefer preserving satisfied requirements before chasing the largest numeric gain.
 options.sort((a,b)=>a.tradeoffs.length-b.tradeoffs.length||Number(b.targetReady)-Number(a.targetReady)||b.gain-a.gain);
 const seen=new Set(),unique=options.filter(x=>{const key=hdFLInventoryStackKey(x.name,x.star);if(seen.has(key))return false;seen.add(key);return true});
 return [...unique.filter(x=>x.available).slice(0,3),...unique.filter(x=>x.owned&&!x.available).slice(0,1),...unique.filter(x=>!x.owned).slice(0,3)];
}
function hdFLRemediesHtml(goal,options){
 const esc=hdFLEsc,number=n=>goal.kind==='los-value'?Number(n).toFixed(2):Math.ceil(Number(n)),metric=goal.kind==='air-value'?'基礎制空':'33式索敵';
 return [['手持ちで補える交換',x=>x.available],['所持しているがこの配備案で使用中',x=>x.owned&&!x.available],['入手して補う候補',x=>!x.owned]].map(([title,filter])=>{
  const rows=options.filter(filter);if(!rows.length)return '';
  return `<div class="hd-fl-remedy-group"><h5>${esc(title)}</h5>${rows.map(x=>`<p class="hd-fl-remedy"><b>${esc(x.name)}${x.star?' ★'+x.star:''}</b>（${x.available?'手持ちで交換可能':x.owned?'所持品を他の枠に配備中':'入手候補'}）<br>所持 ${x.owned}個・この配備案で未使用 ${x.free}個<br>${esc(x.ship)} 第${x.slot}：${esc(x.old)}と交換すると${metric} ${number(goal.count)} → ${number(x.value)}（+${number(x.gain)}）。${x.remaining?`目安まであと ${number(x.remaining)}`:x.targetReady?'登録済みのこの項目を充足':'基礎値の目安に到達。連戦損耗などの判定は未充足・要確認'}。${x.tradeoffs.length?`<strong>ただし ${esc(x.tradeoffs.join('・'))} が不足します。</strong>`:'現在充足している装備条件を維持する候補です。'}${x.owned&&!x.available?'転用元の装備条件も見直してね。':''}${!x.owned&&typeof hdEquipWikiUrl==='function'?`<br><a class="guide-link" href="${esc(hdEquipWikiUrl(x.name))}" target="_blank" rel="noopener">入手方法を攻略Wikiで確認 ↗</a>`:''}他の条件は再配備で確認。</p>`).join('')}</div>`;
 }).join('');
}
function hdFLSetRemedies(plan,goal){
 if(goal.ok||goal.unresolved||typeof HD_SE_RECIPES==='undefined'||!HD_SE_RECIPES[goal.kind])return [];
 const inventory=hdFLInventory(),catalog=hdFLCatalog(),usageBefore=hdFOAssignedUsage(plan),requirements=plan.assessment?.requirements||hdFLRequirements(plan),before=plan.assessment?.measure||hdOCMeasure(plan,requirements),options=[];
 for(const [si,ship] of plan.ships.entries()){
  const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);if(!profile)continue;
  for(const recipe of HD_SE_RECIPES[goal.kind]){
   if(!hdSERecipeAllows(recipe,ship)||recipe.parts.length>profile.count)continue;
   const slots=Array.from({length:profile.count},(_,index)=>({si,index,db,profile,capacity:profile.slots[index]}));
   const parts=recipe.parts.map(part=>({part,choices:slots.flatMap(slot=>{
    const old=ship.items.find(x=>x.slotIndex===slot.index),owned=[...inventory.values()].filter(x=>hdSEPartMatches(part,x)&&hdOCCompatible(slot,x));
    owned.sort((a,b)=>Number(hdFOStackKey(old)===b.key)-Number(hdFOStackKey(old)===a.key)||Number(b.count>(usageBefore[b.key]||0))-Number(a.count>(usageBefore[a.key]||0))||hdOCScore(goal.kind,b)-hdOCScore(goal.kind,a));
    const rows=owned.slice(0,3),example=catalog.filter(x=>hdSEPartMatches(part,x)&&hdOCCompatible(slot,{item:x,star:0})).sort((a,b)=>hdOCScore(goal.kind,b)-hdOCScore(goal.kind,a)).find(x=>!inventory.has(hdFLInventoryStackKey(x.name)));
    if(example)rows.push({key:hdFLInventoryStackKey(example.name),name:example.name,star:0,item:example,count:0});
    return rows.map(row=>({slot,row}));
   })})).sort((a,b)=>a.choices.length-b.choices.length);
   const taken=new Set(),chosen=[];let leaves=0;
   const place=index=>{
    if(leaves>=24)return;
    if(index<parts.length){for(const choice of parts[index].choices){if(taken.has(choice.slot.index))continue;taken.add(choice.slot.index);chosen.push(choice);place(index+1);chosen.pop();taken.delete(choice.slot.index)}return}
    leaves++;
    const trial=hdFOClone(plan),changes=[];
    for(const {slot,row} of chosen){const old=ship.items.find(x=>x.slotIndex===slot.index);trial.ships[si].items=trial.ships[si].items.filter(x=>x.slotIndex!==slot.index);trial.ships[si].items.push(hdOCEquipment(row,slot));if(hdFOStackKey(old)!==row.key)changes.push({slot:slot.index+1,old:old?.name||'空き枠',name:row.name,star:row.star})}
    if(!changes.length)return;
    const after=hdOCMeasure(trial,requirements),target=after.goals.find(g=>g.kind===goal.kind&&g.label===goal.label);if(!target||target.count<=goal.count)return;
    const usage=hdFOAssignedUsage(trial),missing=Object.entries(usage).filter(([key,count])=>count>(inventory.get(key)?.count||0)).map(([key,count])=>({name:inventory.get(key)?.name||chosen.find(x=>x.row.key===key)?.row.name||key.split('@@')[0],star:inventory.get(key)?.star||chosen.find(x=>x.row.key===key)?.row.star||0,need:count-(inventory.get(key)?.count||0),owned:inventory.get(key)?.count||0}));
    const tradeoffs=before.goals.filter(g=>g.ok&&after.goals.some(n=>n.kind===g.kind&&n.label===g.label&&!n.ok)).map(g=>g.label);
    options.push({ship:ship.ship,recipe:recipe.name,recipeId:recipe.id,changes,missing,available:!missing.length,tradeoffs,count:target.count,targetReady:target.ok});
   };place(0);
  }
 }
 options.sort((a,b)=>a.tradeoffs.length-b.tradeoffs.length||Number(b.targetReady)-Number(a.targetReady)||a.missing.reduce((n,x)=>n+x.need,0)-b.missing.reduce((n,x)=>n+x.need,0)||a.changes.length-b.changes.length);
 const seen=new Set(),unique=options.filter(x=>{const key=JSON.stringify([x.ship,x.recipeId,x.available,x.missing.map(m=>[m.name,m.star,m.need]).sort()]);if(seen.has(key))return false;seen.add(key);return true});
 return [...unique.filter(x=>x.available).slice(0,2),...unique.filter(x=>!x.available).slice(0,2)];
}
function hdFLSetRemediesHtml(goal,options){
 const esc=hdFLEsc;
 return [['手持ちでセットを完成できる交換',x=>x.available],['不足分の補充が必要なセット',x=>!x.available]].map(([title,filter])=>{
  const rows=options.filter(filter);if(!rows.length)return '';
  return `<div class="hd-fl-remedy-group"><h5>${title}</h5>${rows.map(x=>`<article class="hd-fl-set-remedy"><b>${esc(x.ship)}：${esc(x.recipe)}</b>${x.changes.map(c=>`<p>第${c.slot}：${esc(c.old)} → ${esc(c.name)}${c.star?' ★'+c.star:''}</p>`).join('')}${x.missing.map(m=>`<p><strong>${esc(m.name)}${m.star?' ★'+m.star:''}：この配備案には追加で${m.need}個必要</strong>（所持${m.owned}個）。${m.owned?'所持品を転用する場合は、転用元の条件も確認してね。':''}${typeof hdEquipWikiUrl==='function'?` <a class="guide-link" href="${esc(hdEquipWikiUrl(m.name))}" target="_blank" rel="noopener">入手方法を確認 ↗</a>`:''}</p>`).join('')}<p>${x.available?'交換後':'不足分を補充して交換した場合'}の同じ艦の推奨セット ${goal.count} → ${x.count} / 目安 ${goal.minCount}組。${x.targetReady?'この装備セットの目安を充足。':`あと${Math.max(0,goal.minCount-x.count)}組必要。`}${x.tradeoffs.length?`<strong>ただし ${esc(x.tradeoffs.join('・'))} が不足します。</strong>`:'現在充足している装備条件を維持する候補です。'}</p><small>通常スロットでの交換案です。ゲーム側にも同じ装備を配備し、ほかの条件は再配備で確認してね。</small></article>`).join('')}</div>`;
 }).join('');
}
function hdFLAssessmentHtml(plan){
 const a=plan.assessment;if(!a)return '<p class="hd-fl-note">攻略条件の判定を読み込み中。再配備して確認してね。</p>';
 const esc=hdFLEsc,goals=a.measure.goals;
 return `<section class="hd-fl-checks"><h4>攻略に必要な装備・数値</h4><p>${plan.searching?'海域の対策装備を手持ちから配備中…':goals.length&&goals.every(g=>g.ok)?'登録済みの装備目安は充足。下の注意点も確認してね。':'不足・未判定の項目があります。補う装備と注意点を確認してね。'}</p>${goals.map(g=>{
  const numeric=['air-value','los-value'].includes(g.kind),profile=a.profiles.find(x=>x.kind===g.kind),stock=!g.ok&&typeof HD_SE_RECIPES!=='undefined'&&HD_SE_RECIPES[g.kind]?hdSECapabilityStock(plan,g.kind):null;
  const remedies=!g.ok&&!g.unresolved&&numeric?(plan.numericRemedies?.[g.kind]||[]):[];
  const examples=!g.ok&&!numeric&&!stock?hdSECandidates(g.kind,3).filter(x=>plan.ships.some(s=>{const db=hdFEFindShip(s.ship);return db&&hdShipDbEquipCompatible(x,db)})).map(x=>x.name):[];
  return `<article class="hd-fl-check ${g.ok?'ready':g.unresolved?'manual':'missing'}" data-hd-fl-goal="${esc(g.kind)}"><b>${esc(g.label)}：${g.ok?'充足':g.unresolved?'未判定':'不足'}</b><p>${esc(g.detail)}</p>${profile?`<small>${esc(profile.importance)}：${esc(profile.reason)} ${esc(profile.note)}</small>`:''}${stock?`<p><b>補う装備：</b>${esc(stock.recipe.name)}。同じ艦に組み合わせて配備。</p>${stock.parts.map(p=>`<small>${esc(p.label)}：所持 ${p.have}/${p.need} ${esc(p.items.length?p.items.join('、'):HD_SE_PARTS[p.part].examples.join('、'))}</small>`).join('')}${stock.complete?'<p>手持ちにセットあり。装備できる艦・配備枠・他の条件との両立を見直してね。探索で見つからない組み合わせもあります。</p>':''}`:''}${hdFLRemediesHtml(g,remedies)}${!g.ok&&numeric&&!g.unresolved&&!remedies.length?'<p>この編成の確認済み枠で、単独の交換により数値を増やす候補は見つかりません。搭載数・艦種・複数枠の変更や補充を見直してね。</p>':''}${examples.length?`<p>補う装備候補：${esc(examples.join('、'))}</p>`:''}</article>`;
 }).join('')}${goals.filter(g=>!g.ok&&plan.setRemedies?.[g.kind]?.length).map(g=>`<div data-hd-fl-set-goal="${esc(g.kind)}"><h4>${esc(g.label)}を補う配備案</h4>${hdFLSetRemediesHtml(g,plan.setRemedies[g.kind])}</div>`).join('')}<h4>攻略する上での注意点</h4>${[...new Set([...a.measure.manual,...a.reviews.map(x=>`${x.title}：${x.reason} ${x.next}`)])].map(x=>`<p>${esc(x)}</p>`).join('')||'<p>登録済みの装備目安です。ゲーム側にも同じ装備を配備してね。</p>'}${plan.searchError?'<p>対策装備の探索を完了できませんでした。再配備でやり直してね。</p>':''}<small>制空は熟練度なしの基礎値。対策装備の推奨とルートの必須条件は区別して確認。探索で見つからない組み合わせもあります。</small></section>`;
}
function hdFLUpdateAssessment(plan,remedies=false){
 plan.assessment=hdFLAssessment(plan);plan.assessmentKey=typeof hdOCKey==='function'?hdOCKey(plan):'';
 if(remedies&&plan.assessment){plan.numericRemedies={};plan.setRemedies={};for(const g of plan.assessment.measure.goals)if(!g.ok&&!g.unresolved){if(['air-value','los-value'].includes(g.kind))plan.numericRemedies[g.kind]=hdFLNumericRemedies(plan,g);else if(typeof HD_SE_RECIPES!=='undefined'&&HD_SE_RECIPES[g.kind])plan.setRemedies[g.kind]=hdFLSetRemedies(plan,g)}}
}
async function hdFLRefine(plan,host){
 if(typeof hdOCSearchSteps!=='function'||!plan.assessment)return;
 if(!plan.ships.some(s=>s.master)||plan.assessment.measure.goals.every(g=>g.ok)){hdFLUpdateAssessment(plan,true);host.innerHTML=hdFLPlanHtml(plan);if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(host);return}
 const key=plan.map+':'+plan.index,c=hdFLContext(plan),signature=hdOCSignature(c),steps=hdOCSearchSteps(c,{maxExamined:3000,maxDepth:12});
 const current=()=>HD_FL_CACHE[key]===plan&&hdOCSignature(c)===signature&&hdFSMap()===plan.map;
 const paint=()=>{const target=host.isConnected?host:document.querySelector(`[data-hd-fl-generate="${plan.index}"]`)?.closest('.hd-fs-card')?.querySelector('.hd-fl-host');if(target){target.innerHTML=hdFLPlanHtml(plan);if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(target)}};
 plan.searching=true;paint();
 try{
  await new Promise(resolve=>setTimeout(resolve,25));
  let result;
  while(current()){const step=steps.next();if(step.done){result=step.value;break}await new Promise(resolve=>setTimeout(resolve,0))}
  if(!current()||!result)return;
  const assigned=new Set();for(const row of plan.ships){const i=result.plan.ships.findIndex((s,i)=>!assigned.has(i)&&(row.gameShipId?Number(s.gameShipId)===Number(row.gameShipId):s.ship===row.ship));if(i<0)continue;assigned.add(i);row.items=result.plan.ships[i].items;row.expansion=result.plan.ships[i].expansion;if(row.expansion)row.expansionMissing=null;row.missing=Array.from({length:hdFLSlotCount(plan.suggestion.slots[plan.ships.indexOf(row)])},(_,i)=>i).filter(i=>!row.items.some(x=>x.slotIndex===i)).map(i=>hdFLSlotKind(plan.suggestion.slots[plan.ships.indexOf(row)],i))}
  plan.missing=plan.ships.flatMap(s=>s.missing.map(kind=>({ship:s.ship,kind})));plan.used={};for(const s of plan.ships)for(const x of [...s.items,...(s.expansion?[s.expansion]:[])])plan.used[x.name]=(plan.used[x.name]||0)+1;
  plan.optimized=true;hdFLUpdateAssessment(plan,true);
 }catch(error){if(current())plan.searchError=true}
 finally{steps.return();plan.searching=false;if(current())paint();else if(host.isConnected&&!HD_FL_CACHE[key])host.innerHTML='<p>同期や装備条件が変わりました。再配備して確認してね。</p>'}
}

function hdFLCalculator(index){
 const plan=hdFLCachedPlan(index);if(!plan||plan.searching||typeof hdFCImportOwnedPlan!=='function')return false;
 const c=hdFLContext(plan);if(!hdFCImportOwnedPlan(c,{plan,signature:hdOCSignature(c)}))return false;
 if(typeof hdSelectGuideMap==='function')hdSelectGuideMap(plan.map);if(typeof hdFEOpenCalculator==='function')hdFEOpenCalculator();return true;
}
function hdFLKindLabel(k){return ({smallGun:'小口径主砲',mediumGun:'中口径主砲',smallMediumGun:'主砲',largeGun:'大口径主砲',torpedo:'魚雷',recon:'偵察/索敵',fighter:'艦戦',airAttack:'艦攻/艦爆',waterAir:'水上機',ap:'徹甲弾',utility:'海域向け装備'})[k]||k}
const HD_FL_OASW_REMEDIES=new WeakMap();
function hdFLOaswScope(plan,index){const s=plan.ships[index];return `${plan.map}:${plan.index}:${index}:${s.gameShipId?'synced':plan.createdAt||'session'}`}
function hdFLOaswRaw(ship){return [...ship.items||[],...(ship.expansion?[ship.expansion]:[])].reduce((sum,x)=>sum+(Number(hdFEFind(x.name)?.stats?.対潜)||0),0)}
function hdFLOaswRemedies(plan,si,scope=hdFLOaswScope(plan,si)){
 const ship=plan.ships[si],current=hdFEOpeningAsw(ship,scope);if(current.status==='ready'||(!current.needsValue&&!current.equipmentCondition))return [];
 const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);if(!profile)return [];
 const requirements=plan.assessment?.requirements||hdFLRequirements(plan),signature=JSON.stringify([si,scope,hdFEAswKey(ship,scope),hdFEAswConfirmed()[hdFEAswKey(ship,scope)],plan.ships.map(s=>[s.ship,s.masterId,s.gameShipId,s.items,s.expansion]),requirements,localStorage.getItem(HD_FL_KEY),localStorage.getItem('harbordesk-ship-roster-v1'),localStorage.getItem('harbordesk-kancolle-sync-v1')]);
 const cached=HD_FL_OASW_REMEDIES.get(plan)||new Map();if(cached.get(si)?.signature===signature)return cached.get(si).options;
 const inventory=hdFLInventory(),usageBefore=hdFOAssignedUsage(plan),rawBefore=hdFLOaswRaw(ship),choices=[],proposals=[];
 const relevant=item=>(Number(item.stats?.対潜)||0)>0;
 for(let index=0;index<profile.count;index++){
  const slot={si,index,db,profile,capacity:profile.slots[index]},old=ship.items.find(x=>x.slotIndex===index),rows=[...inventory.values()].filter(x=>relevant(x.item)&&hdOCCompatible(slot,x));
  const examples=new Map();for(const item of hdFLCatalog().filter(relevant).sort((a,b)=>(Number(b.stats?.対潜)||0)-(Number(a.stats?.対潜)||0))){if(!hdOCCompatible(slot,{item,star:0}))continue;const count=examples.get(item.category)||0;if(count>=3)continue;examples.set(item.category,count+1);const key=hdFLInventoryStackKey(item.name);if(!inventory.has(key))rows.push({key,name:item.name,star:0,item,count:0})}
  for(const row of rows)if(hdFOStackKey(old)!==row.key)choices.push({slot,row,old});
 }
 const evaluate=changes=>{
  const trial=hdFOClone(plan),target=trial.ships[si];for(const {slot,row} of changes){target.items=target.items.filter(x=>x.slotIndex!==slot.index);target.items.push(hdOCEquipment(row,slot))}
  // Different equipment must never inherit a manual value; synced values require an exact gear match.
  const state=hdFEOpeningAsw(target,scope+':equipment-remedy');if(state.status!=='ready'&&!state.needsValue)return;
  const raw=hdFLOaswRaw(target);if(current.needsValue&&!(raw>rawBefore)&&!(state.threshold<current.threshold))return;
  const usage=hdFOAssignedUsage(trial),keys=new Set(changes.map(x=>x.row.key)),missing=[...keys].flatMap(key=>{const own=inventory.get(key),row=changes.find(x=>x.row.key===key).row,need=Math.max(0,(usage[key]||0)-(own?.count||0));return need?[{name:row.name,star:row.star,need,owned:own?.count||0}]:[]});
  proposals.push({trial,state,raw,gain:raw-rawBefore,available:!missing.length,missing,changes:changes.map(({slot,row,old})=>({slot:slot.index+1,name:row.name,star:row.star,old:old?.name||'空き枠',owned:inventory.get(row.key)?.count||0,free:Math.max(0,(inventory.get(row.key)?.count||0)-(usageBefore[row.key]||0))}))});
 };
 for(const choice of choices)evaluate([choice]);
 // If one exchange cannot complete the equipment condition, search two distinct normal slots.
 if(!proposals.some(x=>x.available)&&current.equipmentCondition){
  const shortlist=new Map();for(const choice of choices.filter(x=>/ソナー|爆雷|艦上攻撃機|艦上爆撃機|水上爆撃機|回転翼機|対潜哨戒機/.test(x.row.item.category)).sort((a,b)=>Number((b.row.count||0)>(usageBefore[b.row.key]||0))-Number((a.row.count||0)>(usageBefore[a.row.key]||0))||(Number(b.row.item.stats?.対潜)||0)-(Number(a.row.item.stats?.対潜)||0))){const key=JSON.stringify([choice.slot.index,choice.row.item.category,choice.row.count>0]),rows=shortlist.get(key)||[];if(rows.length<2){rows.push(choice);shortlist.set(key,rows)}}
  const rows=[...shortlist.values()].flat();for(let a=0;a<rows.length;a++)for(let b=a+1;b<rows.length;b++)if(rows[a].slot.index!==rows[b].slot.index)evaluate([rows[a],rows[b]]);
 }
 const before=plan.assessment?.measure||hdOCMeasure(plan,requirements);for(const proposal of proposals){const after=hdOCMeasure(proposal.trial,requirements);proposal.tradeoffs=before.goals.filter(g=>g.ok&&after.goals.some(n=>n.kind===g.kind&&n.label===g.label&&!n.ok)).map(g=>g.label);delete proposal.trial}
 proposals.sort((a,b)=>a.tradeoffs.length-b.tradeoffs.length||Number(b.state.status==='ready')-Number(a.state.status==='ready')||(a.state.threshold||0)-(b.state.threshold||0)||a.missing.reduce((n,x)=>n+x.need,0)-b.missing.reduce((n,x)=>n+x.need,0)||a.changes.length-b.changes.length||b.gain-a.gain);
 const seen=new Set(),unique=proposals.filter(x=>{const key=JSON.stringify([x.available,x.changes.map(c=>[c.name,c.star]).sort()]);if(seen.has(key))return false;seen.add(key);return true}),options=[...unique.filter(x=>x.available).slice(0,2),...unique.filter(x=>!x.available&&x.changes.some(c=>c.owned>0)).slice(0,1),...unique.filter(x=>!x.available&&x.changes.every(c=>!c.owned)).slice(0,2)];cached.set(si,{signature,options});HD_FL_OASW_REMEDIES.set(plan,cached);return options;
}
function hdFLOaswRemediesHtml(plan,index,scope=hdFLOaswScope(plan,index)){
 const options=hdFLOaswRemedies(plan,index,scope);if(!options.length)return '';
 const esc=hdFLEsc;return `<details class="hd-fl-oasw-remedies"><summary>先制対潜を補う装備候補</summary><small>この配備案に対する個別の交換案です。複数の候補を同時に使う場合は、所持数と他の条件を再確認してね。</small>${options.map(x=>`<article class="hd-fl-set-remedy"><b>${x.available?'手持ちで交換可能':'補充・他の配備枠からの転用が必要'}</b>${x.changes.map(c=>`<p>第${c.slot}：${esc(c.old)} → <strong>${esc(c.name)}${c.star?' ★'+c.star:''}</strong><br>所持 ${c.owned}個・この配備案で未使用 ${c.free}個</p>`).join('')}${x.missing.map(m=>`<p>${esc(m.name)}${m.star?' ★'+m.star:''}：この配備案には追加で${m.need}個必要${typeof hdEquipWikiUrl==='function'?` <a class="guide-link" href="${esc(hdEquipWikiUrl(m.name))}" target="_blank" rel="noopener">入手方法 ↗</a>`:''}</p>`).join('')}<p>装備の素対潜合計 ${x.raw-x.gain} → ${x.raw}${x.gain>0?`（+${x.gain}）`:''}。これはゲームの表示対潜値ではありません。</p><p>${x.state.status==='ready'?`この交換案は先制対潜条件を満たします。${x.state.source?esc(x.state.reason):''}`:x.state.value!=null?`${esc(x.state.reason)}。この同期値では発動不可です。`:`装備条件を満たす交換案です。交換後のゲーム表示対潜 ${x.state.threshold}以上を再同期・入力で確認してね。発動可否はまだ未判定です。`}</p>${x.tradeoffs.length?`<p><strong>ただし ${esc(x.tradeoffs.join('・'))} が不足します。</strong></p>`:'<small>登録済みの充足している装備条件を維持する候補です。</small>'}<small>通常スロットだけの交換案です。ゲーム側にも装備し、再配備して全体を確認してね。</small></article>`).join('')}</details>`;
}
function hdFLOaswHtml(plan,index){const scope=hdFLOaswScope(plan,index);return hdFEOpeningAswHtml(plan.ships[index],scope,`data-hd-oasw-map="${hdFLEsc(plan.map)}" data-hd-oasw-plan="${plan.index}" data-hd-oasw-ship="${index}"`,hdFLOaswRemediesHtml(plan,index,scope))}
function hdFLPlanHtml(plan){
 if(typeof hdOCKey==='function'&&plan.assessmentKey!==hdOCKey(plan))hdFLUpdateAssessment(plan,true);
 const used=Object.entries(plan.used).map(([n,c])=>`${hdFLEsc(n)} ×${c} / 所持${plan.owned[n]||0}`).join('、');
 return `<div class="hd-fl-plan">
  <div class="hd-fl-summary"><div><strong>手持ち装備の自動配備</strong><span>所持数＋艦別装備可否＋実スロット制限を反映</span></div><b class="${plan.missing.length?'warn':'ok'}">${plan.missing.length?`未配備 ${plan.missing.length}枠`:'主要枠を配備'}</b></div>
  <div class="hd-fl-master-status">マスター同期 ${plan.masterBacked||0}/${plan.ships.filter(x=>x.ship).length}隻</div>
  <p class="hd-fl-note">先制対潜は昼戦開始の通常艦隊での装備・対潜値条件です。連合艦隊では第二艦隊が対象。対潜シナジーの充足とは別に判定します。</p><div class="hd-fl-ships">${plan.ships.map((s,i)=>{const image=s.ship&&typeof hdShipImageThumbHtml==='function'?hdShipImageThumbHtml(Number(s.masterId)>0?{id:Number(s.masterId),name:s.ship}:s.ship,'loadout-thumb'):'';return `<div class="hd-fl-ship"><div class="hd-fl-ship-head"><span>${i+1}</span>${image}<div><strong>${hdFLEsc(s.ship||'艦娘未選択')}</strong><small>${hdFLEsc(s.type||'')}${s.master?'・マスター判定':''}</small></div></div><div class="hd-fl-items">${s.items.map(x=>`<span>${hdFLEsc(x.name)}${x.star?` ★${x.star}`:''}<small>第${(x.slotIndex??0)+1}スロ${x.capacity!=null?`・${x.capacity}機`:''}</small></span>`).join('')||'<em>配備なし</em>'}</div>${s.expansion?`<div class="hd-fl-expansion"><i>増設候補</i><b>${hdFLEsc(s.expansion.name)}${s.expansion.star?` ★${s.expansion.star}`:''}</b><small>${hdFLEsc(s.expansion.reason)}</small></div>`:''}${s.expansionMissing?`<div class="hd-fl-expansion missing"><i>増設不足</i><b>${hdFLEsc(s.expansionMissing.name)}${s.expansionMissing.reqStar?` ★${s.expansionMissing.reqStar}+`:''}</b><small>${hdFLEsc(s.expansionMissing.reason)}</small><button type="button" class="ghost small" data-hd-fl-procure-expansion="${plan.index}" data-hd-fl-ship-index="${i}">調達リストへ</button></div>`:''}${typeof hdFEOpeningAswHtml==='function'?hdFLOaswHtml(plan,i):''}${s.missing.length?`<small class="hd-fl-missing">未配備: ${s.missing.map(hdFLKindLabel).join(' / ')}</small>`:''}</div>`}).join('')}</div>
  ${used?`<div class="hd-fl-usage"><b>在庫使用:</b> ${used}</div>`:''}
  ${hdFLAssessmentHtml(plan)}
  <button type="button" class="ghost small" data-hd-fl-calculator="${plan.index}" ${plan.searching?'disabled':''}>この配備で制空・索敵を確認</button>
  <div class="hd-fl-actions"><button type="button" class="primary small" data-hd-fl-save="${plan.index}" ${plan.searching?'disabled':''}>この装備込みで保存</button><button type="button" class="primary small" data-hd-fl-prepare="${plan.index}" ${plan.searching?'disabled':''}>保存して出撃準備へ</button><button type="button" class="ghost small" data-hd-fl-regenerate="${plan.index}">再配備</button><button type="button" class="ghost small" data-hd-fl-ledger>装備台帳</button></div>
  <p class="hd-fl-note">※詳細100隻に加え、公式マスター全865形態も通常スロット数・搭載数・装備カテゴリ可否を反映。位置別制限・補強増設ルールもマスターIDが解決できる艦は同じ判定を使う。</p>
 </div>`;
}
function hdFLRender(index,card){
 const plan=hdFLGenerate(index);if(!plan||!card)return;
 let host=card.querySelector('.hd-fl-host');if(!host){host=document.createElement('div');host.className='hd-fl-host';card.appendChild(host)}
 host.innerHTML=hdFLPlanHtml(plan);if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(host);host.scrollIntoView({behavior:'smooth',block:'nearest'});hdFLRefine(plan,host);
}
function hdFLCachedPlan(index){
 const map=typeof hdFSMap==='function'?hdFSMap():'';
 return map?HD_FL_CACHE[map+':'+index]||null:null;
}
function hdFLInstall(){
 if(window.__hdFleetLoadoutInstalled||typeof hdFSSuggestionHtml!=='function')return false;window.__hdFleetLoadoutInstalled=true;
 const prev=hdFSSuggestionHtml;hdFSSuggestionHtml=function(s){
  let html=prev(s);
  const btn=`<button type="button" class="ghost small" data-hd-fl-generate="${s.index}">手持ち装備を自動配備</button>`,cached=hdFLCachedPlan(s.index),planHtml=cached?hdFLPlanHtml(cached):'';
  html=html.replace('</div></article>',`${btn}</div><div class="hd-fl-host">${planHtml}</div></article>`);return html;
 };
 if(typeof hdFSRender==='function')hdFSRender();return true;
}
function hdFLSave(index){
 const map=typeof hdFSMap==='function'?hdFSMap():'',key=map+':'+index,plan=HD_FL_CACHE[key]||hdFLGenerate(index);if(!map||!plan||plan.searching)return;
 const s=plan.suggestion,all=typeof loadCustomFleets==='function'?loadCustomFleets():{};all[map]=all[map]||[];
 const name=map+' 自動提案＋装備｜'+(s.preset.name||('候補'+(s.index+1)));
 const ships=Array.from({length:6},(_,i)=>{const slot=s.slots[i],r=slot?.profile?.row,p=plan.ships[i];const normal=Array.from({length:r?hdFLSlotCount(slot):0},(_,n)=>{const x=p?.items?.find(x=>x.slotIndex===n);return x?x.name+(x.star?` ★${x.star}`:''):''});if(p?.expansion)normal.push(`[増設] ${p.expansion.name}${p.expansion.star?` ★${p.expansion.star}`:''}`);return {ship:r?.name||'',gameShipId:Number(r?.gameShipId)||0,masterId:Number(p?.masterId)||Number(r?.masterId)||0,gear:normal.join(' / ')}});
 const memo='HarborDesk手持ち装備自動配備。所持数に加え、詳細100隻＋公式マスター全865形態の通常スロット数・搭載数・装備可否を反映。';
 const old=all[map].find(x=>x.name===name),id=old?.id||(typeof cfUid==='function'?cfUid():'fl-'+Date.now()+'-'+Math.random().toString(16).slice(2));
 const item={id,name,ships,memo,routePreset:{...s.preset},createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};all[map]=old?all[map].map(x=>x.id===id?item:x):all[map].concat(item);
 if(typeof saveCustomFleets==='function')saveCustomFleets(all);else localStorage.setItem('harbordesk-custom-fleets-v1',JSON.stringify(all));
 if(typeof hdMapRouteSet==='function')hdMapRouteSet(map,s.routeIndex);
 if(typeof hdSortieSetSelection==='function')hdSortieSetSelection(map,id);if(typeof renderCustomFleets==='function')renderCustomFleets(map);if(typeof hdSPSRender==='function')hdSPSRender();
 const b=document.querySelector(`[data-hd-fl-save="${index}"]`);if(b){b.textContent='装備込みで保存したよ';setTimeout(()=>b.textContent='この装備込みで保存',1300)}
 return item;
}
function hdFLSaveAndPrepare(index){
 const saved=hdFLSave(index);if(!saved)return false;
 if(typeof hdSPSOpen==='function')setTimeout(()=>hdSPSOpen(),40);
 else if(typeof hdWSShowElement==='function')setTimeout(()=>hdWSShowElement('hdSortiePreparation',true),40);
 return true;
}
function hdFLInvalidate(){
 for(const k of Object.keys(HD_FL_CACHE))delete HD_FL_CACHE[k];
 document.querySelectorAll('.hd-fl-oasw').forEach(el=>{el.classList.remove('ready','missing');el.classList.add('manual');el.innerHTML='<b>先制対潜：未判定</b><p>同期・装備情報が更新されました。再配備して確認してね。</p>'});
}
document.addEventListener('click',e=>{
 const gen=e.target.closest?.('[data-hd-fl-generate]'),regen=e.target.closest?.('[data-hd-fl-regenerate]');
 const trigger=gen||regen;
 if(!trigger)return;
 const index=gen?gen.dataset.hdFlGenerate:regen.dataset.hdFlRegenerate,card=trigger.closest('.hd-fs-card');
 if(card){hdFLRender(index,card);e.__hdFLRenderHandled=true}
},true);
document.addEventListener('click',e=>{
 const gen=e.target.closest?.('[data-hd-fl-generate]');if(gen){if(e.__hdFLRenderHandled)return;hdFLRender(gen.dataset.hdFlGenerate,gen.closest('.hd-fs-card'));return}
 const regen=e.target.closest?.('[data-hd-fl-regenerate]');if(regen){if(e.__hdFLRenderHandled)return;hdFLRender(regen.dataset.hdFlRegenerate,regen.closest('.hd-fs-card'));return}
 const calc=e.target.closest?.('[data-hd-fl-calculator]');if(calc){hdFLCalculator(calc.dataset.hdFlCalculator);return}
 const save=e.target.closest?.('[data-hd-fl-save]');if(save){hdFLSave(save.dataset.hdFlSave);return}
 const prepare=e.target.closest?.('[data-hd-fl-prepare]');if(prepare){hdFLSaveAndPrepare(prepare.dataset.hdFlPrepare);return}
 const procure=e.target.closest?.('[data-hd-fl-procure-expansion]');if(procure){hdFLProcureExpansion(procure.dataset.hdFlProcureExpansion,procure.dataset.hdFlShipIndex);return}
 if(e.target.closest?.('[data-hd-fl-ledger]')){if(typeof hdWSShowElement==='function')hdWSShowElement('equipmentBook',true);return}
});
window.addEventListener('storage',e=>{if(e.key===null||[HD_FL_KEY,'harbordesk-ship-roster-v1','harbordesk-kancolle-sync-v1','harbordesk-map-routes-v1','harbordesk-oasw-confirmed-v1'].includes(e.key))hdFLInvalidate()});
window.addEventListener('hd:ship-images-changed',()=>{document.querySelectorAll('.hd-fl-host').forEach(host=>{if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(host)})});
window.addEventListener('hd:equipment-changed',hdFLInvalidate);
window.addEventListener('hd:kancolle-sync',hdFLInvalidate);
window.addEventListener('hd:ship-identity-changed',hdFLInvalidate);
window.addEventListener('load',()=>setTimeout(()=>{if(!hdFLInstall())setTimeout(hdFLInstall,500)},650));
hdFLInstall();

window.addEventListener('hd:map-air-changed',hdFLInvalidate);
window.addEventListener('hd:map-route-changed',e=>{for(const [key,plan] of Object.entries(HD_FL_CACHE))if(plan.map===e.detail?.map&&(plan.suggestion.routeIndex??plan.index)!==Number(e.detail.index))delete HD_FL_CACHE[key]});

document.addEventListener('change',e=>{const input=e.target.closest?.('[data-hd-oasw-value]');if(!input)return;const plan=HD_FL_CACHE[input.dataset.hdOaswMap+':'+input.dataset.hdOaswPlan],ship=plan?.ships?.[Number(input.dataset.hdOaswShip)];if(!ship)return;const value=hdFEAswNumber(input.value);if(input.value.trim()!==''&&value==null){input.setCustomValidity('0〜500の整数で入力してね');input.reportValidity();return}input.setCustomValidity('');const scope=input.closest('[data-hd-oasw-scope]').dataset.hdOaswScope,key=hdFEAswKey(ship,scope),saved=hdFEAswConfirmed();if(value==null)delete saved[key];else saved[key]=value;try{localStorage.setItem(HD_FE_OASW_CONFIRM_KEY,JSON.stringify(Object.fromEntries(Object.entries(saved).slice(-80))))}catch{hdToast('対潜値を保存できませんでした','warn');return}input.closest('.hd-fl-oasw').outerHTML=hdFLOaswHtml(plan,Number(input.dataset.hdOaswShip))});
