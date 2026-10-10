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
 const kind=goal.kind==='air-value'?'制空':'索敵',usage=hdFOAssignedUsage(plan),inventory=[...hdFLInventory().values()],catalog=hdFLCatalog(),candidates=new Map();
 const score=x=>hdOCScore(kind,x);
 for(const x of inventory.filter(x=>hdOCItemMatches(kind,x)).sort((a,b)=>score(b)-score(a)).slice(0,5))candidates.set(x.key,x);
 for(const item of catalog.filter(x=>hdOCItemMatches(kind,x)).sort((a,b)=>score(b)-score(a)).slice(0,5)){const key=hdFLInventoryStackKey(item.name);if(!candidates.has(key))candidates.set(key,{key,name:item.name,star:0,item,count:0})}
 const options=[];
 for(const [si,ship] of plan.ships.entries()){
  const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);if(!profile)continue;
  for(let index=0;index<profile.count;index++)for(const candidate of candidates.values()){
   const slot={si,index,db,profile,capacity:profile.slots[index]},old=ship.items.find(x=>x.slotIndex===index);
   if(!hdOCCompatible(slot,candidate)||hdFOStackKey(old)===candidate.key)continue;
   const trial=hdFOClone(plan);trial.ships[si].items=trial.ships[si].items.filter(x=>x.slotIndex!==index);trial.ships[si].items.push(hdOCEquipment(candidate,slot));
   const value=goal.kind==='air-value'?hdFEAir(hdFEAssigned(trial)).basePower:hdFEScouting(trial,hdFEAssigned(trial)).score;
   const gain=value-goal.count;if(!(gain>0))continue;
   const free=candidate.count-(usage[candidate.key]||0)+(hdFOStackKey(old)===candidate.key?1:0);
   options.push({trial,name:candidate.name,star:candidate.star,ship:ship.ship,slot:index+1,old:old?.name||'空き枠',gain,value,available:free>0,owned:candidate.count,remaining:Math.max(0,goal.minCount-value)});
  }
 }
 // Concrete single-slot improvements; an acquisition suggestion is not an allocation.
 options.sort((a,b)=>Number(b.available)-Number(a.available)||b.gain-a.gain);
 return [...new Map(options.map(x=>[x.name+'@@'+x.star,x])).values()].slice(0,3).map(({trial,...x})=>{const after=hdOCMeasure(trial,plan.assessment?.requirements||hdFLRequirements(plan));x.tradeoffs=(plan.assessment?.measure.goals||[]).filter(g=>g.ok&&after.goals.some(n=>n.kind===g.kind&&n.label===g.label&&!n.ok)).map(g=>g.label);return x});
}
function hdFLAssessmentHtml(plan){
 const a=plan.assessment;if(!a)return '<p class="hd-fl-note">攻略条件の判定を読み込み中。再配備して確認してね。</p>';
 const esc=hdFLEsc,goals=a.measure.goals,number=(n,k)=>k==='los-value'?Number(n).toFixed(2):Math.ceil(Number(n));
 return `<section class="hd-fl-checks"><h4>攻略に必要な装備・数値</h4><p>${plan.searching?'海域の対策装備を手持ちから配備中…':goals.length&&goals.every(g=>g.ok)?'登録済みの装備目安は充足。下の注意点も確認してね。':'不足・未判定の項目があります。補う装備と注意点を確認してね。'}</p>${goals.map(g=>{
  const numeric=['air-value','los-value'].includes(g.kind),profile=a.profiles.find(x=>x.kind===g.kind),stock=!g.ok&&typeof HD_SE_RECIPES!=='undefined'&&HD_SE_RECIPES[g.kind]?hdSECapabilityStock(plan,g.kind):null;
  const remedies=!g.ok&&!g.unresolved&&numeric?(plan.numericRemedies?.[g.kind]||[]):[];
  const examples=!g.ok&&!numeric&&!stock?hdSECandidates(g.kind,3).filter(x=>plan.ships.some(s=>{const db=hdFEFindShip(s.ship);return db&&hdShipDbEquipCompatible(x,db)})).map(x=>x.name):[];
  return `<article class="hd-fl-check ${g.ok?'ready':g.unresolved?'manual':'missing'}" data-hd-fl-goal="${esc(g.kind)}"><b>${esc(g.label)}：${g.ok?'充足':g.unresolved?'未判定':'不足'}</b><p>${esc(g.detail)}</p>${profile?`<small>${esc(profile.importance)}：${esc(profile.reason)} ${esc(profile.note)}</small>`:''}${stock?`<p><b>補う装備：</b>${esc(stock.recipe.name)}。同じ艦に組み合わせて配備。</p>${stock.parts.map(p=>`<small>${esc(p.label)}：所持 ${p.have}/${p.need} ${esc(p.items.length?p.items.join('、'):HD_SE_PARTS[p.part].examples.join('、'))}</small>`).join('')}${stock.complete?'<p>手持ちにセットあり。装備できる艦・配備枠・他の条件との両立を見直してね。探索で見つからない組み合わせもあります。</p>':''}`:''}${remedies.map(x=>`<p class="hd-fl-remedy"><b>${esc(x.name)}${x.star?' ★'+x.star:''}</b>（${x.available?'手持ちで交換可能':x.owned?'所持品を他の枠に配備中':'入手候補'}）<br>${esc(x.ship)} 第${x.slot}：${esc(x.old)}と交換すると${g.kind==='air-value'?'基礎制空':'33式索敵'} ${number(g.count,g.kind)} → ${number(x.value,g.kind)}（+${number(x.gain,g.kind)}）。${x.remaining?`目安まであと ${number(x.remaining,g.kind)}`:'この数値の目安に到達'}。${x.tradeoffs.length?'ただし '+esc(x.tradeoffs.join('・'))+' が不足します。':''}他の条件は再配備で確認。</p>`).join('')}${!g.ok&&numeric&&!g.unresolved&&!remedies.length?'<p>この編成の確認済み枠で、単独の交換により数値を増やす候補は見つかりません。搭載数・艦種・複数枠の変更や補充を見直してね。</p>':''}${examples.length?`<p>補う装備候補：${esc(examples.join('、'))}</p>`:''}</article>`;
 }).join('')}<h4>攻略する上での注意点</h4>${[...new Set([...a.measure.manual,...a.reviews.map(x=>`${x.title}：${x.reason} ${x.next}`)])].map(x=>`<p>${esc(x)}</p>`).join('')||'<p>登録済みの装備目安です。ゲーム側にも同じ装備を配備してね。</p>'}${plan.searchError?'<p>対策装備の探索を完了できませんでした。再配備でやり直してね。</p>':''}<small>制空は熟練度なしの基礎値。対策装備の推奨とルートの必須条件は区別して確認。探索で見つからない組み合わせもあります。</small></section>`;
}
function hdFLUpdateAssessment(plan,remedies=false){
 plan.assessment=hdFLAssessment(plan);plan.assessmentKey=typeof hdOCKey==='function'?hdOCKey(plan):'';
 if(remedies&&plan.assessment){plan.numericRemedies={};for(const g of plan.assessment.measure.goals)if(!g.ok&&!g.unresolved&&['air-value','los-value'].includes(g.kind))plan.numericRemedies[g.kind]=hdFLNumericRemedies(plan,g)}
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
function hdFLPlanHtml(plan){
 if(typeof hdOCKey==='function'&&plan.assessmentKey!==hdOCKey(plan))hdFLUpdateAssessment(plan,true);
 const used=Object.entries(plan.used).map(([n,c])=>`${hdFLEsc(n)} ×${c} / 所持${plan.owned[n]||0}`).join('、');
 return `<div class="hd-fl-plan">
  <div class="hd-fl-summary"><div><strong>手持ち装備の自動配備</strong><span>所持数＋艦別装備可否＋実スロット制限を反映</span></div><b class="${plan.missing.length?'warn':'ok'}">${plan.missing.length?`未配備 ${plan.missing.length}枠`:'主要枠を配備'}</b></div>
  <div class="hd-fl-master-status">マスター同期 ${plan.masterBacked||0}/${plan.ships.filter(x=>x.ship).length}隻</div>
  <div class="hd-fl-ships">${plan.ships.map((s,i)=>{const image=s.ship&&typeof hdShipImageThumbHtml==='function'?hdShipImageThumbHtml(Number(s.masterId)>0?{id:Number(s.masterId),name:s.ship}:s.ship,'loadout-thumb'):'';return `<div class="hd-fl-ship"><div class="hd-fl-ship-head"><span>${i+1}</span>${image}<div><strong>${hdFLEsc(s.ship||'艦娘未選択')}</strong><small>${hdFLEsc(s.type||'')}${s.master?'・マスター判定':''}</small></div></div><div class="hd-fl-items">${s.items.map(x=>`<span>${hdFLEsc(x.name)}${x.star?` ★${x.star}`:''}<small>第${(x.slotIndex??0)+1}スロ${x.capacity!=null?`・${x.capacity}機`:''}</small></span>`).join('')||'<em>配備なし</em>'}</div>${s.expansion?`<div class="hd-fl-expansion"><i>増設候補</i><b>${hdFLEsc(s.expansion.name)}${s.expansion.star?` ★${s.expansion.star}`:''}</b><small>${hdFLEsc(s.expansion.reason)}</small></div>`:''}${s.expansionMissing?`<div class="hd-fl-expansion missing"><i>増設不足</i><b>${hdFLEsc(s.expansionMissing.name)}${s.expansionMissing.reqStar?` ★${s.expansionMissing.reqStar}+`:''}</b><small>${hdFLEsc(s.expansionMissing.reason)}</small><button type="button" class="ghost small" data-hd-fl-procure-expansion="${plan.index}" data-hd-fl-ship-index="${i}">調達リストへ</button></div>`:''}${s.missing.length?`<small class="hd-fl-missing">未配備: ${s.missing.map(hdFLKindLabel).join(' / ')}</small>`:''}</div>`}).join('')}</div>
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
window.addEventListener('storage',e=>{if(e.key===null||[HD_FL_KEY,'harbordesk-ship-roster-v1','harbordesk-kancolle-sync-v1','harbordesk-map-routes-v1'].includes(e.key))hdFLInvalidate()});
window.addEventListener('hd:ship-images-changed',()=>{document.querySelectorAll('.hd-fl-host').forEach(host=>{if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(host)})});
window.addEventListener('hd:equipment-changed',hdFLInvalidate);
window.addEventListener('hd:kancolle-sync',hdFLInvalidate);
window.addEventListener('hd:ship-identity-changed',hdFLInvalidate);
window.addEventListener('load',()=>setTimeout(()=>{if(!hdFLInstall())setTimeout(hdFLInstall,500)},650));
hdFLInstall();

window.addEventListener('hd:map-air-changed',hdFLInvalidate);
window.addEventListener('hd:map-route-changed',e=>{for(const [key,plan] of Object.entries(HD_FL_CACHE))if(plan.map===e.detail?.map&&(plan.suggestion.routeIndex??plan.index)!==Number(e.detail.index))delete HD_FL_CACHE[key]});
