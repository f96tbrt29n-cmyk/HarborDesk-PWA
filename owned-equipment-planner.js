/* Search the registered inventory against the selected fleet's equipment targets. */
const HD_OC_CACHE=new Map();
const HD_OC_PENDING=new Map();
const HD_OC_ASW_TARGET_KEY='harbordesk-opening-asw-targets-v1';
const HD_OC_ROUTE_GOAL_KEY='harbordesk-route-goals-v1';
const HD_OC_ASW_SET_CHOICE_KEY='harbordesk-asw-set-choices-v1';
// A user-selected equipment preparation goal, not a route or victory rule.
// Each registered source specifies a same-hull set, not a sufficient count.
function hdOCPortRoute(c){
 const index=Number(c.index??c.routeIndex);
 if(c.map==='4-5'&&index===1)return {key:'4-5:1',label:'中央対地担当セット',title:'中央ルートの対地担当艦',types:'戦艦・重巡系',source:'https://zekamashi.net/kancolle-kouryaku/4-5/',sourceLabel:'中央の旧編成例（戦艦2・重巡2・空母1・軽空母1）と港湾向け装備構成',scope:'港湾棲姫向けの装備構成。中央K経由の索敵条件は別に確認します。'};
 if(c.map==='4-3'&&index===0)return {key:'4-3:0',label:'4-3対地担当セット',title:'4-3の対地担当艦',types:'重巡系',source:'https://zekamashi.net/kancolle-kouryaku/4-3/',sourceLabel:'初攻略の編成画像（正規空母2・重巡2・駆逐2）と三式弾の解説',scope:'港湾棲姫へ攻撃する重巡系の装備例です。登録例は高速統一、ボス前は逸れあり。海域突破にはB勝利以上でよく、このセットは通行必須ではありません。'};
 return null;
}
function hdOCPortScope(c){return !!hdOCPortRoute(c)}
function hdOCPortRef(ship){return {gameShipId:Number(ship.gameShipId)||0,rosterId:String(ship.rosterId||''),masterId:Number(ship.masterId)||0,ship:String(ship.ship||'')}}
function hdOCPortSame(a,b){return !!a&&!!b&&(a.gameShipId>0?Number(b.gameShipId)===a.gameShipId:a.rosterId?String(b.rosterId)===a.rosterId:false)&&Number(b.masterId)===a.masterId&&b.ship===a.ship}
function hdOCPortEligible(ship,c){const db=hdFEFindShip(ship.ship),type=c?.map==='4-3'?/重巡|航巡|航空巡洋/:/戦艦|重巡|航巡|航空巡洋/;return !!db&&type.test(db.type)&&!!(Number(ship.gameShipId)||ship.rosterId)&&Number(ship.masterId)>0}
function hdOCPortTargets(plan){
 const route=hdOCPortRoute(plan);if(!route)return [];
 const refs=plan.sourceFleet?.portAttackersByRoute?.[route.key];if(refs==null)return [];
 if(!Array.isArray(refs))return [{ship:'担当艦設定',index:-1,unresolved:true,reason:'保存した担当艦指定を確認できません。再指定してください'}];
 const ownership=hdOCShipOwnership(plan);
 return refs.map((ref,n)=>{const indices=(plan.ships||[]).flatMap((s,i)=>hdOCPortSame(ref,hdOCPortRef(s))?[i]:[]),index=indices.length===1?indices[0]:-1,ship=plan.ships[index],valid=ship&&hdOCPortEligible(ship,plan)&&ownership[index]?.status==='ready'&&!refs.slice(0,n).some(x=>hdOCPortSame(ref,x));return {ref,index,ship:ref?.ship||'担当艦',unresolved:!valid,reason:valid?'':'指定個体・改造形態・台帳を確認できません。別艦へ移さず、担当艦を再指定してください'};});
}
function hdOCPortPart(part,row){const item=row?.item||hdFEFind(row?.name)||row,cat=item?.category||'';return part==='main'?/主砲/.test(cat):part==='recon'?cat==='水上偵察機':typeof hdSEPartMatches==='function'&&hdSEPartMatches('type3',row)}
function hdOCPortSlots(plan,si){
 const ship=plan.ships[si],db=ship&&hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);if(!profile)return [];
 const slots=Array.from({length:profile.count},(_,index)=>({si,index,expansion:false,db,profile,capacity:profile.slots[index]}));
 if(hdFEExpansionAvailability(ship).allowed)slots.push({si,index:0,expansion:true,db,profile,capacity:null});return slots;
}
function hdOCPortFits(part,slot,row){return hdOCPortPart(part,row)&&hdOCCompatible(slot,row)&&!(part==='recon'&&(slot.expansion||!(Number(slot.capacity)>0)))}
function hdOCPortMeasure(plan){
 return hdOCPortTargets(plan).map(t=>{
  const counts={main:0,recon:0,type3:0},slots=t.index<0?[]:hdOCPortSlots(plan,t.index),ship=plan.ships[t.index],seen=new Set();
  for(const slot of slots){const x=slot.expansion?ship.expansion:ship.items?.find(x=>x.slotIndex===slot.index),item=x?.name&&hdFEFind(x.name);if(!item)continue;const id=slot.expansion?'ex':slot.index;if(seen.has(id))continue;seen.add(id);for(const part of Object.keys(counts))if(hdOCPortFits(part,slot,{...x,item}))counts[part]++;}
  const matched=Math.min(2,counts.main)+Math.min(1,counts.recon)+Math.min(1,counts.type3),ok=!t.unresolved&&matched===4;
  return {...t,kind:'port-attacker-set',shipIndex:t.index,label:t.ship+'：'+hdOCPortRoute(plan).label,minCount:1,count:ok?1:0,counts,ok,ratio:t.unresolved?0:matched/4,detail:t.unresolved?t.reason:`同じ艦内：主砲 ${counts.main}/2・水上偵察機 ${counts.recon}/1・三式弾 ${counts.type3}/1。${ok?'装備構成を確認（攻撃発動・勝利の保証ではありません）':'この担当艦のセットは未完成です'}`};
 });
}
function hdOCPortReadFleets(){
 const raw=localStorage.getItem(CUSTOM_FLEET_KEY);if(raw===null&&Object.prototype.hasOwnProperty.call(localStorage,CUSTOM_FLEET_KEY))throw Error('保存編成を読み取れません');
 const all=raw===null?{}:JSON.parse(raw);if(!all||typeof all!=='object'||Array.isArray(all))throw Error('保存編成の形式を確認できません');return all;
}
function hdOCPortSave(c,index,checked){
 if(!hdOCPortScope(c)||!c.fleet)throw Error('対象ルートではありません');
 const all=hdOCPortReadFleets(),fleet=all[c.map]?.find(x=>String(x.id)===String(c.fleet.id));if(!fleet)throw Error('保存編成が見つかりません');
 const plan=hdFEPlanFromSavedFleet(c.map,fleet),ship=plan.ships[index],key=hdOCPortRoute(c).key,old=fleet.portAttackersByRoute;
 if(old!=null&&(!old||typeof old!=='object'||Array.isArray(old)))throw Error('担当艦設定を確認できません');
 let refs=old?.[key]??[];if(!Array.isArray(refs))throw Error('担当艦設定を確認できません');
 if(index<0){refs=[]}else{
  if(!ship||!hdOCPortEligible(ship,c)||hdOCShipOwnership(plan)[index]?.status!=='ready')throw Error('艦娘の個体・改造形態を確認してください');
  const ref=hdOCPortRef(ship);refs=refs.filter(x=>!hdOCPortSame(ref,x));if(checked)refs.push(ref);
 }
 fleet.portAttackersByRoute={...old,[key]:refs};saveCustomFleets(all);
}
// Bounded joint-set seed. Reserve all slots outside selected, mutable hulls.
// Never create inventory or relax an already satisfied goal to install a set.
function hdOCPortSeed(plan,inventory,slots,requirements,unknown=[],limit=800){
 const targets=hdOCPortTargets(plan);if(!targets.length||targets.some(t=>t.unresolved))return {plan:null,examined:0,limited:false};
 const mutable=slots.filter(s=>targets.some(t=>t.index===s.si)),trial=hdFOClone(plan),baseline=hdOCMeasure(plan,requirements,unknown),initialUsage=hdFOAssignedUsage(plan),available=new Map(inventory.map(r=>[r.key,r.count-(initialUsage[r.key]||0)])),original=new Map();
 const id=s=>`${s.si}:${s.expansion?'ex':s.index}`;
 for(const slot of mutable){const ship=trial.ships[slot.si],x=slot.expansion?ship.expansion:ship.items[slot.index];original.set(id(slot),x);if(x?.name)available.set(hdFOStackKey(x),(available.get(hdFOStackKey(x))||0)+1);if(slot.expansion)ship.expansion=null;else ship.items[slot.index]={name:'',slotIndex:slot.index,capacity:slot.capacity};}
 const tasks=[];for(const t of targets){const fixed=hdOCPortMeasure(trial).find(x=>x.index===t.index);for(const [part,need] of [['recon',1],['type3',1],['main',2]])for(let n=fixed.counts[part];n<need;n++)tasks.push({si:t.index,part});}
 let examined=0,found=null;const used=new Set();
 function visit(n){
  if(found)return;
  if(n===tasks.length){
   const candidate=hdFOClone(trial),remaining=new Map(available);
   for(const slot of mutable){if(used.has(id(slot)))continue;const old=original.get(id(slot)),key=hdFOStackKey(old);if(!old?.name||!(remaining.get(key)>0))continue;remaining.set(key,remaining.get(key)-1);if(slot.expansion)candidate.ships[slot.si].expansion=old;else candidate.ships[slot.si].items[slot.index]=old;}
   const measure=hdOCMeasure(candidate,requirements,unknown);if(!hdOCGoalRegressions(baseline,measure).length&&measure.score>=baseline.score)found=candidate;return;
  }
  if(examined>=limit)return;
  const task=tasks[n],options=mutable.filter(s=>s.si===task.si&&!used.has(id(s))).flatMap(slot=>inventory.filter(r=>(available.get(r.key)||0)>0&&hdOCPortFits(task.part,slot,r)).map(row=>({slot,row}))).sort((a,b)=>Number(hdFOStackKey(original.get(id(b.slot)))===b.row.key)-Number(hdFOStackKey(original.get(id(a.slot)))===a.row.key)||hdFLScoreBase(b.row.item,b.row)-hdFLScoreBase(a.row.item,a.row));
  for(const {slot,row} of options){if(examined>=limit)break;examined++;const key=id(slot),ship=trial.ships[slot.si];used.add(key);available.set(row.key,available.get(row.key)-1);if(slot.expansion)ship.expansion=hdOCEquipment(row,slot);else ship.items[slot.index]=hdOCEquipment(row,slot);visit(n+1);if(found)return;used.delete(key);available.set(row.key,available.get(row.key)+1);if(slot.expansion)ship.expansion=null;else ship.items[slot.index]={name:'',slotIndex:slot.index,capacity:slot.capacity};}
 }
 visit(0);return {plan:found,examined,limited:!found&&examined>=limit};
}
function hdOCPortHtml(c,result,attrs){
 if(!hdOCPortScope(c)||!c.fleet)return '';
 const route=hdOCPortRoute(c),plan=result?.plan||Object.assign(hdFEPlanFromSavedFleet(c.map,c.fleet),{routeIndex:c.index}),targets=hdOCPortMeasure(plan),esc=hdFEEsc,ownership=hdOCShipOwnership(plan),inventory=[...hdFLInventory().values()],usage=hdFOAssignedUsage(plan),labels={main:'主砲',recon:'水上偵察機',type3:'三式弾'};
 const controls=plan.ships.map((s,i)=>{if(!(c.map==='4-3'?/重巡|航巡|航空巡洋/:/戦艦|重巡|航巡|航空巡洋/).test(hdFEFindShip(s.ship)?.type||''))return '';const usable=hdOCPortEligible(s,c)&&ownership[i]?.status==='ready';return `<label><input type="checkbox" data-hd-oc-port-ship="${i}" ${attrs} ${targets.some(t=>!t.unresolved&&t.index===i)?'checked':''} ${usable?'':'disabled'}>${esc(s.ship)}${usable?'':'（個体・台帳・形態を確認）'}</label>`}).join('');
 const stock=Object.entries(labels).map(([part,label])=>{const rows=inventory.filter(r=>hdOCPortPart(part,r)),need=targets.length*(part==='main'?2:1),have=rows.reduce((n,r)=>n+r.count,0),free=rows.reduce((n,r)=>n+Math.max(0,r.count-(usage[r.key]||0)),0),count=targets.reduce((n,t)=>n+Math.min(part==='main'?2:1,t.counts[part]),0);return `<p>${label}：総必要 ${need}・担当艦への現在配備 ${count}・所持総数 ${have}・艦隊内未配備 ${free}。${have<need?'このセットだけの所持不足 '+(need-have)+'個。':'所持総数だけでは配備可否を確定できません。'}他目標との競合があるため、全目標の確定調達数ではありません。</p>`}).join('');
 const details=targets.map(t=>`<div data-hd-oc-port-result><b>${esc(t.label)}：${t.ok?'装備構成成立':t.unresolved?'未確認':'未完成'}</b><p>${esc(t.detail)}</p>${t.unresolved?'':Object.entries(labels).map(([part,label])=>{const gap=Math.max(0,(part==='main'?2:1)-t.counts[part]);if(!gap)return '';const slots=hdOCPortSlots(plan,t.index),catalog=hdFLCatalog().filter(item=>slots.some(slot=>hdOCPortFits(part,slot,{item,star:0}))),owned=inventory.filter(r=>slots.some(slot=>hdOCPortFits(part,slot,r))),usable=owned.reduce((n,r)=>n+r.count,0),free=owned.reduce((n,r)=>n+Math.max(0,r.count-(usage[r.key]||0)),0);return `<p>${esc(t.ship)}に${label} あと${gap}個。装備可能な手持ち総数 ${usable}・未配備で使える手持ち ${free}。${!catalog.length?'搭載不可または有効な搭載枠なし。':slots.length<4?'4点セットの枠不足。':usable<gap?'装備可能な在庫が不足。他艦の必要数・改修別在庫も確認してください。':'枠・他目標との競合、または探索未完了。配備を再確認してください。'}${catalog.length?'適合する装備例：'+esc(catalog.slice(0,3).map(x=>x.name).join('、')):''}</p>`}).join('')}</div>`).join('');
 return `<fieldset data-hd-oc-port><legend>${esc(route.title)}（利用者指定）</legend><p>各担当艦に主砲2＋水上偵察機1＋三式弾1を配備します。${esc(route.types)}の装備構成の目標です。指定隻数が攻略に十分とは確認していません。通行必須条件・攻撃発動・勝利保証とは別です。</p><p>${esc(route.scope)}</p>${controls}<button type="button" class="ghost small" data-hd-oc-port-clear ${attrs}>担当艦の指定を解除</button><p>${targets.length?'各艦の指定・形態を確認してください。':'担当艦は未指定です。上で艦を選んでから配備を探索してください。'}削除・形態変更後は再指定してください。三式弾単独・ロケットの汎用対地目標は別に維持します。</p><a href="${esc(route.source)}" target="_blank" rel="noopener noreferrer">出典：${esc(route.sourceLabel)}</a><small>他の編成へ攻略条件全体を保証しません。偵察機は正の搭載枠が必要で、出撃時の搭載補給・弾着条件は別確認です。</small>${details}${targets.length?stock:''}${result?'<p>探索は候補・組合せ上限つきです。未完成だけでは手持ちで不可能とは断定しません。</p>':''}</fieldset>`;
}
function hdOCRouteGoal(c){
 const data=typeof MAP_PLANS!=='undefined'?MAP_PLANS[c.map]?.routeBranches:null;if(!data?.goals)return '';
 let stored;try{stored=JSON.parse(localStorage.getItem(HD_OC_ROUTE_GOAL_KEY)||'{}')[`${c.map}:${c.fleet?.id||''}`]}catch{}
 const value=stored??c.fleet?.routeGoal??data.defaultGoal;return value===''?data.defaultGoal:value;
}
function hdOCRouteGoalHtml(c,attrs){const goals=MAP_PLANS[c.map]?.routeBranches?.goals;if(!goals)return '';const current=hdOCRouteGoal(c),known=typeof current==='string'&&Object.prototype.hasOwnProperty.call(goals,current);return `<label>ルート目標<select data-hd-oc-route-goal ${attrs}>${known?'':`<option value="${hdFEEsc(current)}" selected>未登録の目標・選び直してください</option>`}${Object.entries(goals).map(([id,g])=>`<option value="${hdFEEsc(id)}" ${current===id?'selected':''}>${hdFEEsc(g.label)}</option>`).join('')}</select></label><small>経由がランダムでも、全候補が登録した目標経路に入るか検証します。戦闘勝利は保証しません。</small>${known&&goals[current].airNotRequired?'<small data-hd-oc-route-air>この選択経路に数値制空目標はありません。別経路や任意の制空計算とは区別します。</small>':''}`}
// ASW equipment-set quantity is separate from the opening-ASW headcount.
// Missing settings retain only the documented compatibility families' old model.
// Explicit unselected/off/count states are not interchangeable.
function hdOCAswSetKey(c){
 const id=c?.fleet?.id;if(c?.map!=='1-5'||c.index!==1||!['string','number'].includes(typeof id)||typeof id==='number'&&!Number.isFinite(id)||!String(id).trim())return null;
 return `${c.map}:${id}:${c.index}`;
}
function hdOCAswSetStored(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return {state:'invalid',reason:'unsupported-active-choice'};
 if(value.state==='count'&&Number.isInteger(value.count)&&value.count>=1&&value.count<=4)return {state:'count',count:value.count};
 if(['off','unselected'].includes(value.state)&&!Object.prototype.hasOwnProperty.call(value,'count'))return {state:value.state};
 return {state:'invalid',reason:'unsupported-active-choice'};
}
function hdOCAswSetRead(c){
 const key=hdOCAswSetKey(c);if(key===null)return {error:'fleet-required',key,root:null,present:false};
 let raw;try{raw=localStorage.getItem(HD_OC_ASW_SET_CHOICE_KEY);if(raw===null&&Object.prototype.hasOwnProperty.call(localStorage,HD_OC_ASW_SET_CHOICE_KEY))return {error:'storage-read',key,root:null,present:false}}catch{return {error:'storage-read',key,root:null,present:false}}
 if(raw!==null&&typeof raw!=='string')return {error:'storage-read',key,root:null,present:false};
 let root;try{root=raw===null?{}:JSON.parse(raw)}catch{return {error:'storage-json',key,root:null,present:false}}
 if(!root||typeof root!=='object'||Array.isArray(root))return {error:'storage-shape',key,root:null,present:false};
 const present=Object.prototype.hasOwnProperty.call(root,key);return {error:null,key,root,present,active:present?root[key]:undefined};
}
function hdOCAswSetInput(c){
 if(c?.map!=='1-5'||c.index!==1)return null;
 if(!c.fleet)return {snapshot:undefined,signatureToken:undefined};
 const stored=hdOCAswSetRead(c),snapshot=stored.error?{state:'invalid',reason:stored.error}:stored.present?hdOCAswSetStored(stored.active):undefined;
 return {snapshot,signatureToken:snapshot===undefined?undefined:{...snapshot}};
}
function hdOCAswSetContextPlan(c){
 const plan=hdFEPlanFromSavedFleet(c.map,c.fleet);plan.preset=c.preset;plan.routeInfo=c.preset?hdFSPresetInfo(c.preset):null;plan.routeIndex=c.index;return plan;
}
function hdOCAswSetApply(plan,choice){
 if(choice?.snapshot!==undefined&&choice.scope?.applicable!==false)plan.aswSetSelection={...choice.snapshot};return plan;
}
function hdOCAswSetCapture(c){
 const input=hdOCAswSetInput(c);if(!input||typeof hdFEOneFiveAswScope!=='function'||typeof hdFEOneFiveAswSelection!=='function')return null;
 const plan=hdOCAswSetContextPlan(c);hdOCAswSetApply(plan,input);const scope=hdFEOneFiveAswScope(plan),selection=hdFEOneFiveAswSelection(plan);return {...input,plan,scope,selection};
}
function hdOCAswSetHasOtherGoal(plan,requirements){
 if(Number.isInteger(plan.openingAswCount)&&plan.openingAswCount>0&&plan.openingAswCount<=7)return true;
 return (requirements||[]).some(row=>row.kind!=='cap-asw'&&Number.isFinite(Number(row.minCount))&&Number(row.minCount)>0&&(row.purpose==='strategy'||row.purpose==='route'||row.generatedFromMap===false||row.kind?.startsWith('cap-night-')&&hdSENightPolicy(plan.map)!=='auto'));
}
function hdOCAswSetCanSearch(choice,c=null,requirements=null,plan=null){
 if(!choice?.scope?.applicable)return true;
 if(choice.selection.state==='invalid')return false;
 if(choice.selection.state!=='unselected')return true;
 const current=plan||(c?{...choice.plan,openingAswCount:hdOCOaswTarget(c)}:choice.plan),rows=requirements||hdFEEquipmentRequirements(current,hdSEChecks(current.map).rows);
 return hdOCAswSetHasOtherGoal(current,rows);
}
function hdOCAswSetRequire(choice,c=null,requirements=null,plan=null){
 if(hdOCAswSetCanSearch(choice,c,requirements,plan))return;
 const invalid=choice?.selection?.state==='invalid',error=new Error(invalid?'保存した対潜組数設定を確認できません。元の値は変更していません':'対潜装備セットの比較目標が未選択です。組数か「比較しない」を選んでください');error.code=invalid?'HD_OC_ASW_SET_INVALID':'HD_OC_ASW_SET_UNSELECTED';throw error;
}
function hdOCAswSetSave(c,value){
 const stored=hdOCAswSetRead(c);if(stored.error||stored.present&&hdOCAswSetStored(stored.active).state==='invalid')throw Error('保存済みの対潜組数設定を確認できません');
 const plan=hdOCAswSetContextPlan(c),scope=typeof hdFEOneFiveAswScope==='function'?hdFEOneFiveAswScope(plan):null;if(!scope?.applicable)throw Error('対象経路ではありません');
 const next={...stored.root};
 if(value==='legacy'){if(!scope.legacyAllowed)throw Error('この編成は既存例モデルの適用範囲外です');if(stored.present)throw Error('明示した設定は既存例への復帰で削除しません。必要なら利用者指定3組を選んでください');return false}
 else{
  let selected;if(value==='unselected'||value==='off')selected={state:value};else if(['1','2','3','4'].includes(value))selected={state:'count',count:Number(value)};else throw Error('対潜組数は未選択・比較しない・1〜4組から選んでください');
  const previous=stored.present?hdOCAswSetStored(stored.active):null;if(previous&&previous.state===selected.state&&previous.count===selected.count)return false;
  const retained={...(stored.present?stored.active:{}),...selected};if(selected.state!=='count')delete retained.count;next[stored.key]=retained;
 }
 localStorage.setItem(HD_OC_ASW_SET_CHOICE_KEY,JSON.stringify(next));return true;
}
function hdOCAswSetUserGoal(plan,goal,data=null){
 if(plan?.map!=='1-5'||goal?.kind!=='cap-asw'||goal.generatedFromMap===true||goal.purpose!=='strategy'||!Object.prototype.hasOwnProperty.call(plan,'aswSetSelection')||typeof hdFEOneFiveAswSelection!=='function')return false;
 const route=data||hdFERouteRequirementData(plan);if(route?.map!=='1-5'||route.index!==1||route.path!=='ADFGJ')return false;
 const choice=hdFEOneFiveAswSelection(plan);return choice.state==='count'&&Number.isInteger(choice.count)&&choice.count>=1&&choice.count<=4&&goal.minCount===choice.count;
}
function hdOCAswSetHtml(c,attrs,choice=hdOCAswSetCapture(c)){
 if(!choice?.scope?.applicable)return '';
 const state=choice.selection.state,value=state==='legacy-default'?'legacy':state==='count'?String(choice.selection.count):state,esc=hdFEEsc;
 const options=[...(choice.scope.legacyAllowed&&state==='legacy-default'?[['legacy','既存例モデル：3組（互換・表示のみ）']]:[]),['unselected','未選択（組数を指定）'],['off','比較しない'],...Array.from({length:4},(_,i)=>[String(i+1),`利用者指定：${i+1}組`])];
 const note=state==='legacy-default'?'既存の編成例に限る3組の比較モデルです。新たな推奨数・通行必須数ではありません。':state==='off'?'対潜装備セットは今回の比較対象外です。0組充足の判定ではありません。':state==='count'?`利用者指定の${choice.selection.count}組を比較します。3組へ引き上げません。`:state==='invalid'?'保存した組数設定を確認できません。元の値を変更せず、探索を止めています。':'組数は未選択です。組数か「比較しない」を選んでください。別に指定した目標の探索はできますが、対潜セットは数量・調達を評価しません。';
 return `<label>対潜装備セットの比較目標 <select data-hd-oc-asw-sets ${attrs} ${c.fleet&&state!=='invalid'?'':'disabled'}>${state==='invalid'?'<option value="invalid" selected>保存済み設定を確認できません</option>':''}${options.map(([id,label])=>`<option value="${id}" ${value===id?'selected':''} ${id==='legacy'?'disabled':''}>${esc(label)}</option>`).join('')}</select></label><small data-hd-oc-asw-set-source>${esc(note)} 同じ艦のソナー＋投射機の組数です。先制対潜の人数・発動条件、通行必須条件、購入数・勝利保証とは別です。</small>`;
}
function hdOCOaswTargets(){try{return JSON.parse(localStorage.getItem(HD_OC_ASW_TARGET_KEY)||'{}')||{}}catch{return {}}}
function hdOCOaswKey(c,index=c.index??0){return `${c.map}:${c.fleet?.id||''}:${index}`}
function hdOCOaswFleetGoal(c){
 const value=c.fleet?.openingAswCount;if(value==null)return null;
 if(!c.fleet.routePreset)return {value,kind:'legacy'};
 const saved=hdMapPresetRequirements(c.map,c.fleet.routePreset),current=hdMapPresetRequirements(c.map,c.preset);
 return saved&&current&&saved.index===current.index?{value,kind:'saved'}:null;
}
function hdOCOaswChoice(c){
 const value=hdOCOaswTargets()[hdOCOaswKey(c)];
 return value!=null?{value,kind:'user'}:hdOCOaswFleetGoal(c)??(c.preset?.openingAswCount!=null?{value:c.preset.openingAswCount,kind:'preset'}:{value:undefined,kind:'none'});
}
function hdOCOaswPreserveFleetGoal(c){
 const value=c.fleet?.openingAswCount,saved=c.fleet?.routePreset&&hdMapPresetRequirements(c.map,c.fleet.routePreset);
 if(value==null||!saved||saved.index===c.index)return;
 // A deliberate save of a different route must retain the old scoped goal.
 // Reuse the existing goal map; never reconstruct it after a failed read.
 const raw=localStorage.getItem(HD_OC_ASW_TARGET_KEY);
 if(raw===null&&Object.prototype.hasOwnProperty.call(localStorage,HD_OC_ASW_TARGET_KEY))throw Error('人数目標の保存値を読み取れません');
 const targets=raw===null?{}:JSON.parse(raw);
 if(!targets||typeof targets!=='object'||Array.isArray(targets))throw Error('人数目標の保存形式を確認できません');
 const key=hdOCOaswKey(c,saved.index);if(targets[key]!=null)return;
 localStorage.setItem(HD_OC_ASW_TARGET_KEY,JSON.stringify({...targets,[key]:value}));
}
function hdOCOaswRecommendation(c){
 const route=typeof hdMapPresetRequirements==='function'?hdMapPresetRequirements(c.map,c.preset||c.fleet?.routePreset):null;
 const r=route?.openingAsw||(typeof HD_MAP_ADVANCED_DATA!=='undefined'?HD_MAP_ADVANCED_DATA[c.map]?.openingAsw:null);
 if(!r){const needs=route&&(!route.equipmentKinds||route.equipmentKinds.includes('対潜'))&&hdSEChecks(c.map).rows.some(x=>['対潜','cap-asw'].includes(x.kind));return needs?{choose:true,note:'このルート・編成例に適用できる先制対潜人数の根拠は未登録です。「先制対潜艦の配備目標」で人数を指定してください。対潜装備セットの推奨目標は別に維持します。'}:null;}
 if(r.shipTypes){const ships=c.fleet?.ships||[];if(ships.length!==r.fleetSize||ships.some(s=>!r.shipTypes.includes(hdFEFindShip(s.ship)?.type)))return {...r,recommended:undefined,note:r.note+' この配備は対象編成と異なるため、人数を指定してください。'};}
 return r;
}
function hdOCOaswTarget(c){
 const specified=hdOCOaswChoice(c).value;
 const route=typeof hdMapPresetRequirements==='function'?hdMapPresetRequirements(c.map,c.preset):null,needs=(!route?.equipmentKinds||route.equipmentKinds.includes('対潜'))&&hdSEChecks(c.map).rows.some(x=>['対潜','cap-asw'].includes(x.kind));
 const recommendation=hdOCOaswRecommendation(c),value=specified??recommendation?.recommended??(recommendation?.choose?undefined:needs?1:0);
 if(value==null&&recommendation?.choose)return undefined;
 return Number.isInteger(Number(value))&&Number(value)>=0&&Number(value)<=7?Number(value):recommendation?.choose?undefined:needs?1:0;
}
function hdOCOaswTargetHtml(c,attrs){
 const value=hdOCOaswTarget(c),r=hdOCOaswRecommendation(c),choice=hdOCOaswChoice(c),explicit=choice.value;
 const origin=value==null?'推奨人数が一意に定まらないため未指定です。人数を指定してください（0隻は人数目標を設けない選択）。':explicit!=null?(value===0?'明示0隻：人数目標を設けない選択です。':choice.kind==='legacy'?`保存済みの目標 ${value}隻（適用ルート未特定の旧保存値）。推測で変更せず保持します。`:`利用者指定・保存済みの目標 ${value}隻。推奨値で上書きしません。`):r?.recommended!=null?`対象編成向けの攻略推奨 ${r.recommended}${r.upper?'〜'+r.upper:''}隻を初期目標に採用。`:`海域の人数推奨は未登録。${value}隻は仮の初期目標で、十分な人数を保証しません。`;
 return `<label>先制対潜艦の配備目標 <input type="number" min="0" max="7" step="1" inputmode="numeric" placeholder="人数を指定" data-hd-oc-asw-target ${attrs} value="${value??''}" ${c.fleet?'':'disabled'}></label><small data-hd-oc-asw-source>${hdFEEsc(origin)}${r?.note?' '+hdFEEsc(r.note):''} 対潜装備セットの組数とは別で、ルート通行の必須条件ではありません。${r?.source?` <a href="${hdFEEsc(r.source)}" target="_blank" rel="noopener noreferrer">人数目標の出典</a>`:''}</small>`;
}
function hdOCOaswScope(plan,index){return `owned:${plan.map}:${plan.sourceFleet?.id||plan.index||''}:${index}`}
function hdOCOaswMeasure(plan){
 const context=plan.sourceFleet?{map:plan.map,fleet:plan.sourceFleet,preset:plan.preset,index:plan.routeIndex??plan.index??0}:plan.suggestion&&typeof hdFLContext==='function'?hdFLContext(plan):{map:plan.map,fleet:{ships:plan.ships||[]},preset:plan.preset,index:plan.routeIndex??plan.index??0};
 const target=plan.openingAswCount??hdOCOaswTarget(context);
 if(target==null)return {kind:'opening-asw',label:'先制対潜艦の目標',count:null,minCount:null,ok:false,unresolved:true,ratio:0,ships:[],detail:'人数目標が未指定です。出典と編成を確認して人数を指定してください。0隻は人数目標を設けない選択です。'};
 if(!target)return {kind:'opening-asw',label:'先制対潜艦の目標',count:0,minCount:0,ok:true,unresolved:false,ratio:1,ships:[],detail:'先制対潜の人数目標は0隻（人数目標を設けない選択）です'};
 const ships=(plan.ships||[]).map((ship,index)=>({ship:ship.ship,index,state:ship.ship?hdFEOpeningAsw(ship,hdOCOaswScope(plan,index)):null})).filter(x=>x.state);
 const count=ships.filter(x=>x.state.status==='ready').length,missingCount=ships.filter(x=>x.state.status==='missing').length,manualCount=ships.filter(x=>x.state.status==='manual').length,unresolved=count<target&&manualCount>0;
 const progress=ships.map(x=>x.state.status==='ready'?1:x.state.value!=null&&x.state.threshold?Math.min(.99,x.state.value/x.state.threshold):x.state.equipmentCondition?.25:0).sort((a,b)=>b-a).slice(0,target).reduce((n,x)=>n+x,0);
 return {kind:'opening-asw',label:'先制対潜艦の目標',count,missingCount,manualCount,minCount:target,ok:count>=target,unresolved,ratio:target?Math.min(1,progress/target):1,ships,detail:`発動条件を確認できた艦 ${count} / 目標 ${target}隻${count<target?`（あと${target-count}隻）`:''}。内訳：成立${count}隻・不足${missingCount}隻・未判定${manualCount}隻。これは攻略用の配備目標で、ルート固定の必須条件ではありません。`};
}
function hdOCContext(map,fleetId='',route=''){
 const fleets=typeof hdSPSFleets==='function'?hdSPSFleets(map):[],fleet=fleetId?fleets.find(x=>String(x.id)===String(fleetId)):(typeof hdSPSFleet==='function'?hdSPSFleet(map):null);
 const presets=typeof hdMSNPresets==='function'?hdMSNPresets(map):[],index=route===''?(typeof hdMSNRouteIndex==='function'?hdMSNRouteIndex(map,presets):0):Number(route);
 return {map,fleet,preset:presets[index]||null,index};
}
function hdOCSignature(c,aswSetChoice=undefined){const values=[c.map,c.fleet,c.preset,typeof HD_APP_BUILD==='undefined'?null:HD_APP_BUILD,hdOCRouteGoal(c),typeof MAP_PLANS!=='undefined'?MAP_PLANS[c.map]?.routeBranches:null,hdOCOaswTarget(c),hdFEAswConfirmed(),hdSENightPolicy(c.map),hdFLRows(),hdFERoster(),localStorage.getItem('harbordesk-kancolle-sync-v1'),typeof hdMapAirSelection==='function'?hdMapAirSelection(c.map):null],choice=aswSetChoice===undefined?hdOCAswSetInput(c):aswSetChoice;if(choice?.signatureToken!==undefined)values.push(choice.signatureToken);return JSON.stringify(values)}
function hdOCUseFleet(map,id){
 if(!hdSPSFleets(map).some(f=>String(f.id)===String(id)))return false;
 if(typeof hdMSNFleetByMap!=='undefined')hdMSNFleetByMap[map]=id;
 if(typeof hdSortieSetSelection==='function')hdSortieSetSelection(map,id);
 hdMSNOpen(map);return true;
}
function hdOCOpenFleetPicker(map,fleetId=''){
 let dialog=document.getElementById('hdOCFleetPicker');
 if(!dialog){dialog=document.createElement('dialog');dialog.id='hdOCFleetPicker';document.body.appendChild(dialog)}
 const fleets=hdSPSFleets(map),selected=fleets.find(f=>String(f.id)===String(fleetId))?.id||fleets[0]?.id||'';
 dialog.innerHTML=`<form method="dialog"><h3>${hdFEEsc(map)} の艦隊を選ぶ・保存する</h3>${fleets.length?`<label>保存済みの艦隊<select data-hd-oc-fleet-picker>${fleets.map(f=>`<option value="${hdFEEsc(f.id)}" ${String(f.id)===String(selected)?'selected':''}>${hdFEEsc(f.name||'名称なし')}</option>`).join('')}</select></label>`:'<p>この海域の保存編成はまだありません。新しい編成を保存してね。</p>'}<div class="dialog-actions"><button type="button" class="primary" data-hd-oc-fleet-use ${fleets.length?'':'disabled'}>この艦隊を使う</button><button type="button" class="ghost" data-hd-oc-fleet-new>新しい編成を保存</button><button value="cancel" class="ghost">閉じる</button></div></form>`;
 dialog.querySelector('[data-hd-oc-fleet-use]').onclick=()=>{
  const id=dialog.querySelector('[data-hd-oc-fleet-picker]')?.value;
  if(!hdSPSFleets(map).some(f=>String(f.id)===String(id))){hdToast('編成が更新されたので、もう一度選んでね','warn');hdOCOpenFleetPicker(map,id);return}
  dialog.close();hdOCUseFleet(map,id);
 };
 dialog.querySelector('[data-hd-oc-fleet-new]').onclick=()=>{
  if(typeof openCustomFleetDialog!=='function'){hdToast('編成の保存画面を読み込めなかったよ','warn');return}
  const ids=new Set(hdSPSFleets(map).map(f=>String(f.id)));
  dialog.close();hdSelectGuideMap(map);openCustomFleetDialog();
  const editor=document.getElementById('customFleetDialog');editor.returnValue='';
  editor.addEventListener('close',()=>{
   if(editor.returnValue!=='default')return;
   const created=hdSPSFleets(map).find(f=>!ids.has(String(f.id)));
   if(created)hdOCUseFleet(map,created.id);
  },{once:true});
 };
 if(!dialog.open)dialog.showModal();
}
function hdOCCompatible(slot,candidate){
 const meta=candidate.item,db=slot.db;if(!db||!meta)return false;
 if(slot.expansion)return hdShipDbExpansionInfo(meta,db,candidate.star).allowed;
 return hdShipDbEquipCompatible(meta,db)&&!hdShipDbSlotRejects(slot.profile,slot.index,meta)&&(!HD_FE_AIR_CATS.has(meta.category)||Number(slot.capacity)>0);
}
function hdOCEquipment(candidate,slot){return {name:candidate.name,star:candidate.star,stackKey:candidate.key,category:candidate.item.category,slotIndex:slot.index,capacity:slot.capacity}}
function hdOCBuild(c,aswSetChoice=undefined){
 const plan=hdFEPlanFromSavedFleet(c.map,c.fleet);plan.preset=c.preset;plan.routeInfo=c.preset?hdFSPresetInfo(c.preset):null;plan.routeIndex=c.index;plan.openingAswCount=hdOCOaswTarget(c);plan.routeGoal=hdOCRouteGoal(c);hdOCAswSetApply(plan,aswSetChoice===undefined?hdOCAswSetCapture(c):aswSetChoice);
 plan.preservationIssues=[];
 const inventory=[...hdFLInventory().values()],counts=new Map(inventory.map(x=>[x.key,x.count])),slots=[],unknown=[];
 for(let si=0;si<plan.ships.length;si++){
  const ship=plan.ships[si],db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);
  if(!profile){plan.preservationIssues.push(`${ship.ship}：艦娘のスロット情報が未登録`);unknown.push(`${ship.ship}：艦娘のスロット情報が未登録`);ship.items=[];ship.expansion=null;continue}
  const unregistered=[...(ship.items||[]),...(ship.expansion?[ship.expansion]:[])].filter(x=>x.name&&!hdFEFind(x.name));
  for(const x of unregistered)plan.preservationIssues.push(`${ship.ship}：${x.name}の性能・搭載条件が未登録`);
  const original=ship.items;ship.items=Array.from({length:profile.count},(_,index)=>({name:'',slotIndex:index,capacity:profile.slots[index]}));
  const add=(index,expansion=false)=>{
   const slot={si,index,expansion,db,profile,capacity:expansion?null:profile.slots[index]},old=expansion?ship.expansion:original.find(x=>x.slotIndex===index),key=old?hdFLInventoryStackKey(old.name,old.star):'',candidate=inventory.find(x=>x.key===key);
   const value=candidate&&counts.get(key)>0&&hdOCCompatible(slot,candidate)?hdOCEquipment(candidate,slot):null;
   if(value)counts.set(key,counts.get(key)-1);
   if(expansion)ship.expansion=value;else if(value)ship.items[index]=value;
   slots.push(slot);
  };
  for(let i=0;i<profile.count;i++)add(i);
  const matches=hdFERoster().filter(row=>ship.gameShipId?Number(row.gameShipId)===Number(ship.gameShipId):ship.rosterId?String(row.id||'')===String(ship.rosterId):ship.masterId?Number(row.masterId)===Number(ship.masterId):String(row.name||'').trim()===String(ship.ship||'').trim());
  const expanded=matches.length===1&&typeof hdFLHasExpansion==='function'&&hdFLHasExpansion(matches[0]);
  if(expanded)add(0,true);else ship.expansion=null;
 }
 return {plan,inventory,slots,unknown};
}
function hdOCAssigned(plan){return hdFEAssigned(plan).filter(x=>x.name)}
function hdOCSpeedPart(item){
 const meta=hdFOItemMeta(item),name=item?.name||meta.name,turbine=/タービン/.test(name)||(meta.tags||[]).some(x=>String(x).includes('タービン'));
 return turbine?'turbine':hdFOItemMatches('高速化',item)?'boiler':'';
}
function hdOCItemMatches(kind,item){if(kind==='port-attacker-set')return ['main','recon','type3'].some(part=>hdOCPortPart(part,item));if(['drum-ships','ドラム缶'].includes(kind))return hdFOItemMeta(item).name==='ドラム缶(輸送用)';if(kind==='radar-ships')return /電探/.test(hdFOItemMeta(item).category||'');if(kind==='opening-asw')return Number(hdFOItemMeta(item).stats?.対潜)>0; if(typeof HD_SE_RECIPES!=='undefined'&&HD_SE_RECIPES[kind])return HD_SE_RECIPES[kind].some(r=>r.parts.some(part=>hdSEPartMatches(part,item)));return kind==='speed-turbine'?hdOCSpeedPart(item)==='turbine':kind==='speed-boiler'?hdOCSpeedPart(item)==='boiler':hdFOItemMatches(kind,item)}
// Keep each verified mandatory predicate, even while a different predicate
// leaves the overall route incomplete. OR alternatives remain a single check.
function hdOCRequiredChecks(plan,route=hdFERoute(plan),sameEvaluation=false){
 const data=route.contract?.data,rows=route.contract?.checks||route.branch?.checks||[];
 // Normalize once for this synchronous evaluation; never cache across plans or sync changes.
 let ships;
 const flatten=c=>Array.isArray(c?.all)?c.all.flatMap(flatten):[c];
 return rows.flatMap(row=>flatten(row.condition).map(condition=>{
  // Only hdOCMeasure passes a freshly computed contract from this synchronous evaluation.
  const check=sameEvaluation&&route.contract&&condition===row.condition&&condition.kind!=='unverified'?row:hdFEBranchPredicate(condition,ships||(ships=hdFERouteShips(plan)),plan);
  const id=JSON.stringify([plan.map,data?.index??route.branch?.goal??null,condition]);
  return {...check,id,kind:'route-condition',mandatory:true,condition,
   label:typeof hdMapRequirementConditionText==='function'?hdMapRequirementConditionText(condition):row.label||check.detail,
   ok:check.status==='ready',unresolved:check.status==='manual'};
 }));
}
function hdOCRequiredChecksHtml(plan,measure){
 const route=hdFERoute(plan),ceio=plan?.map==='2-5'&&route.contract?.data?.index===1&&route.contract.data.path==='CEIO',label=s=>s==='ready'?'成立':s==='missing'?'不成立':ceio&&s==='partial'?'ランダム域（固定O未成立）':'未確認';
 return `<details data-hd-required-route><summary>経路の必須条件：${label(route.status)}</summary>${(measure.requiredChecks||[]).map(c=>`<p><b>${hdFEEsc(c.label)}：${label(c.status)}</b> ${hdFEEsc(c.detail)}</p>`).join('')}<p>${hdFEEsc(route.detail)}</p></details>`;
}
function hdOCShipGear(ship){
 const count=hdFEFindShip(ship.ship)&&hdShipDbSlotProfile(hdFEFindShip(ship.ship)).count||Math.max(0,...(ship.items||[]).map(x=>x.slotIndex+1));
 const label=x=>x?.name?x.name+(x.star?' ★'+x.star:''):'';
 const normal=Array.from({length:count},(_,i)=>label((ship.items||[]).find(x=>x.slotIndex===i)));
 return [...normal,...(ship.expansion?[`[増設] ${label(ship.expansion)}`]:[])].join(' / ');
}
function hdOCRevalidateResult(result){
 if(!result?.plan)return null;
 const requirements=typeof hdFLRequirements==='function'?hdFLRequirements(result.plan):hdSEChecks(result.plan.map).rows;
 result.measure=hdOCMeasure(result.plan,requirements);
 result.readiness=hdOCReadiness(result.plan,result.measure);
 return result.readiness;
}
function hdOCMeasure(plan,requirements,unknown=[]){
 unknown=[...new Set([...unknown,...(plan.preservationIssues||[])])];
 requirements=hdFEEquipmentRequirements(plan,requirements);
 const aswSets=typeof hdFEOneFiveAswSelection==='function'?hdFEOneFiveAswSelection(plan,requirements):null,aswSetUnresolved=aswSets?.applicable&&['unselected','invalid'].includes(aswSets.state),aswSetBlocks=aswSetUnresolved&&(aswSets.state==='invalid'||!hdOCAswSetHasOtherGoal(plan,requirements));
 const items=hdOCAssigned(plan),air=hdFEAirCheck(plan.map,hdFEAir(items),plan),scouting=hdFEPlanScouting(plan,items),speedTarget=hdFEPlanSpeedTarget(plan),speedGoals=speedTarget?(plan.ships||[]).flatMap((s,shipIndex)=>s.ship?[{...hdFESpeedGoal(s,speedTarget),shipIndex,targetRank:speedTarget}]:[]):[];
 const goals=requirements.filter(r=>!['opening-asw','radar-ships','drum-ships','port-attacker-set'].includes(r.kind)&&(!speedTarget||r.kind!=='高速化')).map(r=>{const cap=typeof HD_SE_RECIPES!=='undefined'&&HD_SE_RECIPES[r.kind]?hdSECapabilityMeasure(plan,r.kind):null,m=cap||hdFEKindCount(r.kind,items),count=r.kind==='高速化'?plan.ships.reduce((n,ship)=>n+Number(hdFEKindCount('高速化',hdOCAssigned({ships:[ship]})).count>0),0):Number(m.count)||0;return {...r,count,...(cap?.unresolved?{unresolved:true}:{}),ok:count>=r.minCount,detail:cap?`同じ艦の推奨セット ${count} / 目安 ${r.minCount}組${r.kind==='cap-night-auto'&&cap.matches?.length?'（'+cap.matches.map(x=>x.ship+'：'+x.attacks.join('・')).join(' / ')+ '）':''}` :r.kind==='高速化'?`同じ艦の標準セット ${count} / 目安 ${r.minCount}組`:`配備 ${count} / 目安 ${r.minCount}`,ratio:cap?Math.min(1,count?count/r.minCount:cap.ratio/r.minCount):Math.min(1,count/r.minCount)}});
 if(air.enemy&&!(typeof hdSEAirOptional==='function'&&hdSEAirOptional(plan.map)))goals.push({kind:'air-value',label:air.goal==='superiority'?'制空優勢の目安':`制空${HD_MAP_AIR_GOALS[air.goal]}の目安`,count:air.ours,minCount:air.required,ok:air.status==='ready',unresolved:air.status==='manual',ratio:air.status==='manual'?0:Math.min(1,air.ours/Math.max(1,air.required),air.routeLoss?.known?air.routeLoss.minimumRatio:1),detail:air.status==='manual'?`制空の充足は未判定：${air.detail}`:`基礎制空 ${air.ours} / 目安 ${air.required}（あと ${Math.max(0,air.required-air.ours)}）${air.routeLoss?.firstGap?`。連戦モデル ${air.routeLoss.firstGap.id}・${air.routeLoss.firstGap.round}回目であと${air.routeLoss.firstGap.gap}不足`:''}`});
 if(scouting.available){const target=Math.max(...scouting.checks.map(x=>Number(x.safe)||0)),ceio=plan.map==='2-5'&&scouting.route==='CEIO';goals.push({kind:'los-value',label:ceio?'Iの固定Oを目指す索敵条件':'索敵分岐の安全域',count:scouting.score,minCount:target,ok:scouting.status==='ready',...(ceio?{knownRandom:scouting.status==='partial',routeAim:'fixed-O'}:{}),ratio:Math.max(0,Math.min(1,scouting.score/Math.max(1,target))),detail:ceio?`${scouting.detail}。${scouting.status==='partial'?'31以上34未満はランダム域で、固定Oは未成立です。':scouting.status==='missing'?'31未満はIからHへ進む条件です。':'Iの固定O条件は成立しています。他の分岐・戦闘勝利は別です。'}固定O条件34を目指す差は ${Math.max(0,target-scouting.score).toFixed(2)}。装備の必要個数や購入必須を示しません。`:`33式 ${scouting.score.toFixed(2)} / 安全域 ${target}（あと ${Math.max(0,target-scouting.score).toFixed(2)}）`})}
 if(scouting.reason==='bonus'){const target=Math.max(...scouting.checks.map(x=>Number(x.safe)||0));goals.push({kind:'los-value',label:'索敵分岐の安全域',count:null,minCount:target,ok:false,unresolved:true,ratio:0,...(plan.map==='2-5'&&scouting.route==='CEIO'?{referenceScore:scouting.referenceScore,routeAim:'fixed-O'}:{}),detail:scouting.detail})}
 goals.push(...hdOCPortMeasure(plan));
 const oasw=hdOCOaswMeasure(plan);if(oasw.minCount||oasw.unresolved)goals.push(oasw);
 // A global turbine/can total does not prove that a low-speed ship is sped up.
 const route=hdFERoute(plan),speedRequired=!!speedTarget;let lowSpeedAlternative;
 if(route.branch?.requiredRadar){const m=hdFEBranchPredicate({kind:'equipmentShips',match:'radar',min:route.branch.requiredRadar,max:7},hdFERouteShips(plan),plan);goals.push({kind:'radar-ships',label:'ルート用電探装備艦',count:m.count||0,minCount:route.branch.requiredRadar,ok:m.status==='ready',unresolved:m.status==='manual',ratio:m.ratio,detail:m.detail})}
 if(route.branch?.available){const b=route.branch;goals.push({kind:'route-branches',label:b.path+'の分岐条件',count:b.checks.filter(x=>x.status==='ready').length,minCount:b.checks.length,ok:route.status==='ready',unresolved:route.status==='manual',ratio:b.checks.length?b.checks.reduce((n,x)=>n+x.ratio,0)/b.checks.length:0,detail:route.detail})}
 if(route.contract){const r=route.contract;goals.push({...((r.data.map==='2-5'&&r.data.index===1&&r.data.path==='CEIO'&&route.status==='partial')?{knownRandom:true}:{}),kind:'route-requirements',label:r.data.path+'の攻略条件',count:r.checks.filter(x=>x.status==='ready').length,minCount:r.checks.length,ok:route.status==='ready',unresolved:route.status==='manual',ratio:r.checks.length?r.checks.reduce((n,x)=>n+x.ratio,0)/r.checks.length:0,detail:r.detail});
  for(const check of r.checks){let c=check.condition,m=check;
   if(r.data.keepLowUnless&&c.any?.[1]===r.data.keepLowUnless&&c.any[0]?.kind==='speedCount'){lowSpeedAlternative=check.children?.[1]?.status==='ready';if(check.children?.[1]?.status!=='missing')continue;c=c.any[0];m=check.children[0];}
   if(c.kind==='equipmentShips'&&c.match==='drum'||c.kind==='speedCount'&&c.rank===5)goals.push({kind:c.kind==='speedCount'?'low-speed-ships':'drum-ships',...(c.kind==='speedCount'?{routeLowSpeed:true}:{}),label:c.kind==='speedCount'?'低速艦の維持':'ルート用ドラム缶装備艦',count:m.count||0,minCount:c.min,ok:m.status==='ready',unresolved:m.status==='manual',ratio:m.ratio,detail:m.detail});}
 }
 goals.push(...speedGoals);
 const speedSets=speedTarget?0:Math.max(0,...requirements.filter(x=>x.kind==='高速化').map(x=>Number(x.minCount)||0));
 const speedMinimum=part=>speedGoals.reduce((n,g)=>{const recipes=hdFESpeedRecipes(g.speed.group,speedTarget,g.speed.base);return n+(recipes.length?Math.min(...recipes.map(r=>part==='turbine'?(r.t||0):Math.max(r.n||0,r.c||0))):0)},0);
 for(const [part,label] of [['turbine','高速化用タービン'],['boiler','高速化用の缶']]){const required=Math.max(speedSets,speedMinimum(part));if(!required)continue;
  const count=items.filter(x=>hdOCSpeedPart(x)===part).length;
  goals.push({kind:'speed-'+part,label,count,minCount:required,ok:count>=required,ratio:Math.min(1,count/required),detail:`配備 ${count} / ${speedTarget?'速力条件の最低必要数':'標準セットの目安'} ${required}個。各艦の必要な組み合わせ・改修値も確認してね`});
 }
 const manual=[...unknown];if(aswSetUnresolved)manual.push(aswSets.state==='invalid'?'対潜装備セット：保存した組数設定を確認できません。元の値を保持しています':'対潜装備セット：組数未選択のため数量・調達は未評価です');for(const row of hdFLRows())if(Number(row.count)>0&&!hdFEFind(row.name))manual.push(`装備性能が未登録：${row.name}。台帳の装備名を確認`);
 if(speedGoals.some(g=>g.unresolved))manual.push('艦娘の速力区分が未登録のため未判定：'+speedGoals.filter(g=>g.unresolved).map(g=>g.label).join('、'));
 if(typeof hdSEAirOptional==='function'&&hdSEAirOptional(plan.map))manual.push('1-6下ルート：制空優勢は必須ではありません。対空CI・対潜装備を優先し、水戦や水爆は搭載できる軽巡での選択肢');
 else if(air.status==='manual')manual.push(`制空：${air.detail}`);
 if(!scouting.available&&!scouting.notRequired)manual.push(`索敵：${scouting.detail}`);
 if(route.requirements?.some(x=>!x.ok))manual.push(`艦種の変更が必要：${route.detail}`);
 if(route.status==='manual')manual.push(`ルート：${route.detail}`);
 if(hdSEChecks(plan.map).adv?.base?.available)manual.push('基地航空隊の機体・行動半径は基地航空隊プランナーで確認');
 const ptContract=plan.map==='7-5'?(route.contract?.data||hdFERouteRequirementData(plan)):null,sevenFiveSecondPT=ptContract?.map==='7-5'&&ptContract.index===1&&ptContract.path==='ABDFJOQ';
 for(const goal of goals){goal.purpose=['route-branches','route-requirements','radar-ships','drum-ships','low-speed-ships','speed-ship','los-value'].includes(goal.kind)?'route':goal.kind==='cap-pt'&&sevenFiveSecondPT?goal.purpose==='strategy'||goal.generatedFromMap!==true?'strategy':'recommendation':goal.generatedFromMap&&!(goal.kind.startsWith('cap-night-')&&hdSENightPolicy(plan.map)!=='auto')?'recommendation':'strategy';}
 const requiredChecks=hdOCRequiredChecks(plan,route,true);
 const score=goals.reduce((s,g)=>s+g.ratio*100+(g.ok?25:0),0)+requiredChecks.reduce((n,c)=>n+(c.ok?10000:Math.max(0,c.ratio||0)*1000),0);
 return {goals,requiredChecks,manual,score,scoutingExempt:scouting.reason==='exempt',routeStatus:route.status,speedTarget,...(lowSpeedAlternative===undefined?{}:{lowSpeedAlternative}),complete:goals.length>0&&goals.every(x=>x.ok&&!x.unresolved)&&!unknown.length&&air.reason!=='anti-air'&&route.status==='ready'&&!aswSetBlocks};
}
// An unresolved goal lacks evidence; it is not a confirmed equipment deficit.
function hdOCShortageGoals(measure){return measure.goals.filter(x=>!x.ok&&!x.unresolved&&!x.knownRandom&&!['route-branches','route-requirements','port-attacker-set'].includes(x.kind))}
// Equal-scored intermediate states may approach the observed loadout without
// treating its unknown bonus as a numeric LOS value or an achieved target.
function hdOCScoutingDistance(plan,measure){
 if(!measure.goals.some(g=>g.kind==='los-value'&&g.unresolved))return null;
 // The general matcher can fall back to another roster entry. That is not
 // evidence for this individual or remodel, nor for unobserved empty slots.
 const ships=(plan?.ships||[]).filter(s=>s?.ship),rows=hdFERoster();
 if(!ships.length||!Array.isArray(rows)||new Set(ships.map(s=>Number(s.gameShipId))).size!==ships.length)return null;
 for(const ship of ships){
  const gameId=Number(ship.gameShipId),masterId=Number(ship.masterId);
  if(!Number.isInteger(gameId)||gameId<=0||!Number.isInteger(masterId)||masterId<=0)return null;
  const matches=rows.filter(r=>Number(r?.gameShipId)===gameId),row=matches.length===1?matches[0]:null;
  if(!row||Number(row.masterId)!==masterId||String(row.name||'').trim()!==String(ship.ship).trim()||!Array.isArray(ship.items)||!Array.isArray(row.gameGearSlots)||row.gameGearSlots.length!==ship.items.length||Array.from(row.gameGearSlots).some(x=>typeof x!=='string')||typeof row.gameGearExpansion!=='string')return null;
 }
 const match=hdFEGameMatch(plan);return match.fleetMatch&&!match.unknown?match.gearMismatch:null;
}
// Search policy within a primary-rank tie: observed distances first, then lower
// distances. Unknown distances remain unknown and do not imply invalidity.
function hdOCScoutingOrder(a,b){
 const knownA=Number.isFinite(a.scoutingDistance),knownB=Number.isFinite(b.scoutingDistance);
 return knownA&&knownB?a.scoutingDistance-b.scoutingDistance:knownA?-1:knownB?1:0;
}
function hdOCKey(plan){return JSON.stringify(plan.ships.map(s=>[(s.items||[]).map(x=>hdFOStackKey(x)),hdFOStackKey(s.expansion)]))}
function hdOCScore(kind,row){const item=row.item||row,s=item.stats||{};if(kind==='opening-asw')return Number(s.対潜)||0;if(kind==='制空')return Number(s.対空)||0;if(kind==='索敵')return ((Number(s.索敵)||0)+hdFEImproveCoef(item)*Math.sqrt(Number(row.star)||0))*hdFEEquipCoef(item);return hdFLScoreBase(item,row)}
function hdOCGoalIdentity(goal){if(goal.id&&goal.mandatory)return goal.id;if(goal.kind==='speed-ship')return JSON.stringify([goal.kind,goal.shipIndex,goal.targetRank]);return JSON.stringify([goal.kind,goal.label,goal.shipIndex??null])}
function hdOCGoalRegressions(before,after){
 const current=new Map([...(after.goals||[]),...(after.requiredChecks||[])].map(g=>[hdOCGoalIdentity(g),g]));
 const previous=new Map((before.requiredChecks||[]).map(g=>[hdOCGoalIdentity(g),g]));
 const requiredImproved=(after.requiredChecks||[]).some(g=>g.ok&&!previous.get(hdOCGoalIdentity(g))?.ok);
 return [...(before.goals||[]),...(before.requiredChecks||[])].filter(g=>!(after.scoutingExempt&&(g.kind==='los-value'||g.kind==='索敵'&&g.generatedFromMap))&&!(g.kind==='low-speed-ships'&&g.routeLowSpeed===true&&after.lowSpeedAlternative===true)&&!(g.kind==='speed-ship'&&after.speedTarget===0&&after.routeStatus==='ready')&&g.ok&&!g.unresolved&&(g.purpose!=='recommendation'||!requiredImproved)&&(!current.get(hdOCGoalIdentity(g))?.ok||current.get(hdOCGoalIdentity(g))?.unresolved));
}
// Reuse an observed loadout as a candidate, never as an extra inventory source.
// Exact per-hull slots/star labels retain the synchronized fit-bonus context.
function hdOCSynchronizedSeed(plan,inventory,slots){
 if(typeof hdFCProposalRoster!=='function'||hdOCShipOwnership(plan).some(x=>x.status!=='ready'))return null;
 const roster=hdFERoster(),rows=plan.ships.map(ship=>{const row=hdFCProposalRoster(ship);return row&&roster.filter(x=>Number(x.gameShipId)===Number(row.gameShipId)).length===1?row:null;});
 if(rows.some((row,si)=>!row||!Number(row.gameShipId)||row.gameAswGearKnown===false||!Array.isArray(row.gameGearSlots)||row.gameGearSlots.length!==plan.ships[si].items.length||Array.from(row.gameGearSlots).some(x=>typeof x!=='string')||typeof row.gameGearExpansion!=='string'))return null;
 const seed=hdFOClone(plan),remaining=new Map(inventory.map(x=>[x.key,x.count]));
 for(const slot of slots){
  const label=slot.expansion?rows[slot.si].gameGearExpansion:rows[slot.si].gameGearSlots[slot.index],parsed=hdFEParseGearLabel(label),key=label?hdFLInventoryStackKey(parsed.name,parsed.star):'';
  if(!slot.expansion&&parsed.expansion)return null;
  let value=slot.expansion?null:{name:'',slotIndex:slot.index,capacity:slot.capacity};
  if(label){const candidate=inventory.find(x=>x.key===key);if(!candidate||!(remaining.get(key)>0)||!hdOCCompatible(slot,candidate))return null;value=hdOCEquipment(candidate,slot);remaining.set(key,remaining.get(key)-1);}
  if(slot.expansion)seed.ships[slot.si].expansion=value;else seed.ships[slot.si].items[slot.index]=value;
 }
 if(!hdFEMasterValidation(seed).valid||hdFEGameMatch(seed).status!=='ready')return null;
 return seed;
}
// This is a fixed-input result, not a reduced candidate budget. Only stop when
// every changeable target already has its maximum ratio, and the remaining
// checks cannot change by moving equipment on these same ships.
function hdOCHFixedInputStop(plan,measure,inventory){
 if(plan.map!=='3-2'||plan.routeGoal!=='fastPlus'||Number(plan.routeIndex)!==0||plan.ships.length!==6)return '';
 const goals=measure.goals||[],checks=measure.requiredChecks||[],pending=goals.filter(g=>!g.ok||g.unresolved),aggregate=g=>['route-branches','route-requirements'].includes(g.kind);
 if(!pending.length||!checks.length||goals.some(g=>g.ok&&(g.unresolved||g.ratio!==1)))return '';
 const radarCheck=c=>c.condition?.kind==='equipmentShips'&&c.condition.match==='radar'&&c.condition.min===1;
 if(!(goals.filter(g=>g.kind==='speed-ship').length===6&&checks.some(radarCheck)))return '';
 const unknown=new Set(plan.ships.flatMap((s,i)=>hdFEFindShip(s.ship)?[]:[i]));
 if(!unknown.size&&!(measure.manual||[]).length&&!inventory.some(r=>r.count>0&&hdOCItemMatches('radar-ships',r))&&pending.some(g=>g.kind==='radar-ships')&&pending.every(g=>aggregate(g)||['radar-ships','電探'].includes(g.kind)&&g.count===0&&!g.unresolved)&&checks.every(c=>c.ok||radarCheck(c)&&c.status==='missing'&&c.count===0))return 'route-radar-stock';
 const onlyShipData=(measure.manual||[]).every(x=>(plan.preservationIssues||[]).includes(x)||x.startsWith('ルート：')||x.startsWith('艦娘の速力区分が未登録のため未判定：'));
 if(unknown.size&&onlyShipData&&[...unknown].every(i=>!(plan.ships[i].items||[]).some(x=>x.name)&&!plan.ships[i].expansion?.name)&&pending.every(g=>aggregate(g)&&g.unresolved||g.kind==='speed-ship'&&g.unresolved&&!g.speed?.known&&unknown.has(g.shipIndex))&&checks.every(c=>c.ok||c.unresolved&&(c.condition?.kind==='typeCount'&&c.condition.types?.length&&c.condition.types.every(t=>['軽巡','駆逐','補給艦'].includes(t))||c.condition?.kind==='minSpeed'&&c.condition.rank===15)))return 'route-ship-data';
 return '';
}
// An unselected combat-air target is fixed input for this search. Equipment
// cannot select battle nodes. Keep it unresolved in scoring/readiness/storage,
// but do not enumerate after all other equipment objectives are satisfied.
function hdOCUnselectedAir(map){return typeof hdMapAirData==='function'&&!!hdMapAirData(map)&&typeof hdMapAirTarget==='function'&&hdMapAirTarget(map)?.selected===false}
function hdOCSearchPendingGoals(goals,airUnselected=false){
 return (goals||[]).filter(g=>g.kind!=='route-requirements'&&!(g.kind==='opening-asw'&&g.unresolved&&g.minCount==null)&&!(airUnselected&&g.kind==='air-value'&&g.unresolved));
}
// The selected 5-4 central example can retain an unavailable recommendation
// after its changeable targets are satisfied. Return that incomplete proposal
// instead of repeating equipment swaps which cannot improve the fixed inputs.
function hdOCFiveFourFixedInputStop(plan,measure,inventory,airUnselected=false){
 if(plan.map!=='5-4'||Number(plan.routeIndex)!==0||plan.ships.length!==6)return '';
 const data=hdFERouteRequirementData(plan),los=data?.los,exempt=los?.exemptWhen;
 if(data?.index!==0||data.path!=='ADEHIJMP'||los?.kind!=='required'||los.coef!==2||los.checks?.length!==1||los.checks[0].safe!==45||exempt?.all?.length!==2)return '';
 const [submarine,speed]=exempt.all;
 if(submarine.kind!=='typeCount'||submarine.matchPolicy!=='exact'||submarine.min!==0||submarine.max!==0||JSON.stringify(submarine.types)!==JSON.stringify(['潜水艦','潜水空母'])||speed.kind!=='minSpeed'||speed.rank!==15)return '';
 const checks=measure.requiredChecks||[],ready=c=>c.ok&&!c.unresolved&&c.ratio===1;
 const branch=checks.find(c=>c.condition?.any?.length===2&&c.condition.any[0]===exempt&&c.condition.any[1].kind==='scoutingValue'&&c.condition.any[1].coef===2&&c.condition.any[1].min===45);
 if(!branch||!(data.conditions||[]).every(condition=>checks.some(c=>c.condition===condition)))return '';
 const active=hdOCSearchPendingGoals(measure.goals,airUnselected),pending=active.filter(g=>!g.ok||g.unresolved);
 if(!pending.length||pending.some(g=>!g.generatedFromMap||g.purpose!=='recommendation'||!['電探','索敵'].includes(g.kind)||g.count!==0||g.ratio!==0||g.unresolved||!(g.minCount>0))||active.some(g=>!pending.includes(g)&&!ready(g)))return '';
 // Check both search matching and the evaluator's actual counters. Unknown
 // item performance, including omitted ledger rows, cannot prove fixed stock.
 if(!Array.isArray(inventory)||hdFLRows().some(r=>Number(r.count)>0&&!hdFEFind(r.name)))return '';
 for(const row of inventory){
  const item=hdFEFind(row.name);
  if(!item||!Number.isFinite(row.count)||row.count<0||!Number.isFinite(row.star)||row.star<0||row.star>10)return '';
  if(!row.count)continue;
  const candidate={...row,item};
  if(['電探','索敵'].some(kind=>hdOCItemMatches(kind,candidate)||hdFEKindCount(kind,[{name:row.name,star:row.star,meta:item}]).count!==0)||hdOCScore('索敵',candidate)!==0)return '';
 }
 if(measure.scoutingExempt){
  if(!checks.every(ready))return '';
  // Losing the exemption must not introduce a newly satisfied numeric goal.
  // Bare LOS and HQ are synchronized inputs; equipment swaps cannot add them.
  const hq=hdFCSyncedHq(),bare=plan.ships.map(hdFCProposalShipLos);
  if(hq>0&&bare.every(x=>x!==null&&Number.isFinite(x)&&x>=0)&&bare.reduce((n,x)=>n+Math.sqrt(x),0)-Math.ceil(hq*.4)+2*(6-plan.ships.length)>=45)return '';
  return 'five-four-fixed-stock';
 }
 if(measure.routeStatus!=='manual'||branch.ok||!branch.unresolved)return '';
 const ships=hdFERouteShips(plan),unknown=ships.filter(s=>!hdFEFindShip(s.ship.ship)),known=ships.filter(s=>hdFEFindShip(s.ship.ship));
 if(ships.length!==6||!unknown.length||!known.length||unknown.some(s=>(s.ship.items||[]).length||s.ship.expansion)||known.some(s=>!s.typeKnown||!s.speedInfo.known||s.speedInfo.rank<15||s.speedInfo.invalid.length||s.speedInfo.expansionUnconfirmed||[...(s.ship.items||[]),s.ship.expansion].some(x=>x?.name&&!hdFEFind(x.name))))return '';
 if(checks.some(c=>c!==branch&&!ready(c)&&!['fleetCount','typeCount','slowBattleshipCount','unverified'].includes(c.condition?.kind)))return '';
 const raw=hdFEScouting(plan,[]),speedBranch=hdFEBranchPredicate(exempt,ships,plan);
 if(!raw.available||raw.coef!==2||!Number.isFinite(raw.score)||raw.score>0||speedBranch.status!=='manual'||branch.ratio!==Math.max(speedBranch.ratio,Math.max(0,raw.score/45)))return '';
 return 'five-four-fixed-data';
}
function* hdOCSearchSteps(c,limits={},aswSetChoice=undefined){
 const aswChoice=aswSetChoice===undefined?hdOCAswSetCapture(c):aswSetChoice;if(aswChoice?.selection?.state==='invalid')hdOCAswSetRequire(aswChoice,c);
 // Joint sets are seeded as a unit before the ordinary beam. Bound subsequent
 // substitutions for these selected port-set routes: an unavailable unrelated goal must not keep the UI searching
 // through 10,000 expensive fleet evaluations. An incomplete result stays such.
 const portKey=hdOCPortRoute(c)?.key,portSearch=!!portKey&&Array.isArray(c.fleet?.portAttackersByRoute?.[portKey])&&c.fleet.portAttackersByRoute[portKey].length>0;
 const maxExamined=Math.max(50,Math.min(portSearch?500:10000,Number(limits.maxExamined)||10000)),maxDepth=Math.max(1,Math.min(24,Number(limits.maxDepth)||24));
 const signature=hdOCSignature(c,aswChoice),airUnselected=hdOCUnselectedAir(c.map);
 const {plan,inventory,slots,unknown}=hdOCBuild(c,aswChoice),requirements=hdFEEquipmentRequirements(plan,hdSEChecks(c.map).rows);hdOCAswSetRequire(aswChoice,c,requirements,plan);
 const routeData=hdFERouteRequirementData(plan);for(const condition of routeData?.conditions||[])if(condition.kind==='equipmentShips'&&condition.match==='drum')requirements.push({kind:'drum-ships',label:'ルート用ドラム缶装備艦',minCount:condition.min});
 // Keep the raw conditional recommendation for candidate re-evaluation: a
 // later loadout can lose the exemption. hdOCMeasure filters each current plan.
 if(routeData?.los.exemptWhen)for(const row of hdSEChecks(c.map).rows)if(row.kind==='索敵'&&row.generatedFromMap&&!requirements.some(r=>r.kind===row.kind))requirements.push(row);
 if(plan.openingAswCount)requirements.push({kind:'opening-asw',label:'先制対潜艦',minCount:plan.openingAswCount});
 if(hdFEBranchRoute(plan).requiredRadar)requirements.push({kind:'radar-ships',label:'ルート用電探装備艦',minCount:hdFEBranchRoute(plan).requiredRadar});
 if(hdOCPortTargets(plan).length)requirements.push({kind:'port-attacker-set',label:hdOCPortRoute(plan).label,minCount:hdOCPortTargets(plan).length});
 const relevant=inventory.filter(x=>requirements.some(r=>hdOCItemMatches(r.kind,x))||hdFOItemMatches('制空',x)||hdFOItemMatches('索敵',x)||hdFOItemMatches('高速化',x));
 // Keep the strongest candidates for each compatible slot and each distinct target.
 let candidatePruned=0;
 const choices=slots.map(slot=>{const compatible=relevant.filter(x=>hdOCCompatible(slot,x)),picked=new Map();for(const kind of new Set([...requirements.map(x=>x.kind),'制空','索敵','高速化'])){
  if(kind==='port-attacker-set')for(const part of ['main','recon','type3'])for(const x of compatible.filter(x=>hdOCPortFits(part,slot,x)).sort((a,b)=>hdFLScoreBase(b.item,b)-hdFLScoreBase(a.item,a)).slice(0,3))picked.set(x.key,x);
  if(typeof HD_SE_RECIPES!=='undefined'&&HD_SE_RECIPES[kind])for(const part of new Set(HD_SE_RECIPES[kind].flatMap(r=>r.parts))){for(const x of compatible.filter(x=>hdSEPartMatches(part,x)).sort((a,b)=>hdOCScore(kind,b)-hdOCScore(kind,a)).slice(0,3))picked.set(x.key,x)}
  const sorted=compatible.filter(x=>hdOCItemMatches(kind,x)).sort((a,b)=>hdOCScore(kind,b)-hdOCScore(kind,a));
  for(const x of sorted.slice(0,5))picked.set(x.key,x);if(kind==='高速化')for(const turbine of [true,false])for(const x of sorted.filter(x=>/タービン/.test(x.name)===turbine).slice(0,3))picked.set(x.key,x);
 }candidatePruned+=compatible.filter(x=>!picked.has(x.key)).length;return [...picked.values(),...(routeData?.keepLow||requirements.some(r=>r.kind.startsWith('cap-night-')&&(!slot.expansion||HD_SE_RECIPES[r.kind]?.some(x=>x.ship==='night-sub')))?[{key:'',name:'',star:0,item:{name:'',category:'',stats:{}},count:Infinity}]:[])]});
 const initial={plan,measure:hdOCMeasure(plan,requirements,unknown)},seen=new Set([hdOCKey(plan)]);let beam=[initial],best=initial,examined=0,depth=0,beamPruned=false;
 let fixedInputStop=hdOCHFixedInputStop(plan,initial.measure,inventory);
 const portSeed=hdOCPortSeed(plan,inventory,slots,requirements,unknown);
 if(portSeed.plan){best={plan:portSeed.plan,measure:hdOCMeasure(portSeed.plan,requirements,unknown)};beam=[best,initial];seen.add(hdOCKey(best.plan));}
 const synchronized=initial.measure.complete||fixedInputStop?null:hdOCSynchronizedSeed(plan,inventory,slots);
 if(synchronized){
  const candidate={plan:synchronized,measure:hdOCMeasure(synchronized,requirements,unknown)};
  if(!hdOCGoalRegressions(initial.measure,candidate.measure).length&&candidate.measure.score>best.measure.score){best=candidate;beam=[candidate,initial];seen.add(hdOCKey(synchronized));}
 }
 for(;!fixedInputStop&&depth<Math.min(slots.length,maxDepth)&&!hdOCSearchPendingGoals(best.measure.goals,airUnselected).every(x=>x.ok)&&examined<maxExamined;depth++){
  if(c.map==='5-4'){fixedInputStop=hdOCFiveFourFixedInputStop(best.plan,best.measure,inventory,airUnselected);if(fixedInputStop)break;}
  const next=[];
  enumerate: for(const state of beam){const used=hdFOAssignedUsage(state.plan);
   for(let i=0;i<slots.length;i++){const slot=slots[i],old=slot.expansion?state.plan.ships[slot.si].expansion:state.plan.ships[slot.si].items[slot.index];
    for(const candidate of choices[i]){
     if(hdFOStackKey(old)===candidate.key)continue;
     let donor=null;if((used[candidate.key]||0)>=candidate.count){donor=slots.find(other=>{if(other.si===slot.si&&other.index===slot.index&&other.expansion===slot.expansion)return false;const item=other.expansion?state.plan.ships[other.si].expansion:state.plan.ships[other.si].items[other.index];return hdFOStackKey(item)===candidate.key});if(!donor)continue;}
     const trial=hdFOClone(state.plan),value=slot.expansion&&!candidate.name?null:hdOCEquipment(candidate,slot);if(slot.expansion)trial.ships[slot.si].expansion=value;else trial.ships[slot.si].items[slot.index]=value;
     if(donor){const replacement=old?.name?inventory.find(x=>x.key===hdFOStackKey(old)):null,newItem=replacement&&hdOCCompatible(donor,replacement)?hdOCEquipment(replacement,donor):null;if(donor.expansion)trial.ships[donor.si].expansion=newItem;else trial.ships[donor.si].items[donor.index]=newItem||{name:'',slotIndex:donor.index,capacity:donor.capacity};}
     const key=hdOCKey(trial);if(seen.has(key))continue;if(examined>=maxExamined)break enumerate;seen.add(key);examined++;
     const measure=hdOCMeasure(trial,requirements,unknown),row={plan:trial,measure,scoutingDistance:hdOCScoutingDistance(trial,measure)};
     // Intermediate swaps may break a set, but the delivered plan must keep
     // every confirmed target satisfied by the best equipment so far.
     if(!hdOCGoalRegressions(best.measure,measure).length&&measure.score>best.measure.score)best=row;
     next.push(row);
     if(examined%50===0)yield examined;
    }
   }
  }
  next.sort((a,b)=>hdOCGoalRegressions(initial.measure,a.measure).length-hdOCGoalRegressions(initial.measure,b.measure).length||b.measure.score-a.measure.score||hdOCScoutingOrder(a,b));beamPruned ||= next.length>5;beam=next.slice(0,5);if(!beam.length)break;
 }
 // Fill remaining ordinary slots with owned basic weapons after satisfying the targets.
 const usage=hdFOAssignedUsage(best.plan);
 for(const slot of slots.filter(x=>!x.expansion)){
  const ship=best.plan.ships[slot.si];if(ship.items[slot.index]?.name)continue;
  const kind=hdFLSlotKind({profile:{type:ship.type,row:{name:ship.ship}}},slot.index);
  const candidates=inventory.filter(x=>(usage[x.key]||0)<x.count&&hdOCCompatible(slot,x)&&hdFLKindMatch(x.item,kind)).sort((a,b)=>hdFLScoreBase(b.item,b)-hdFLScoreBase(a.item,a));
  const candidate=candidates.find(row=>{const trial=hdFOClone(best.plan);trial.ships[slot.si].items[slot.index]=hdOCEquipment(row,slot);const after=hdOCMeasure(trial,requirements,unknown);return !hdOCGoalRegressions(best.measure,after).length});
  if(candidate){ship.items[slot.index]=hdOCEquipment(candidate,slot);usage[candidate.key]=(usage[candidate.key]||0)+1;best.measure=hdOCMeasure(best.plan,requirements,unknown);}
 }
 best.measure=hdOCMeasure(best.plan,requirements,unknown);
 const speedNeed=best.measure.goals.find(x=>x.kind==='speed-turbine')?.minCount||0;
 const shortages=hdOCShortageGoals(best.measure).map(goal=>{
  if(goal.kind==='low-speed-ships')return {...goal,goalKind:goal.kind,owned:0,placement:true,shortfall:Math.max(0,goal.minCount-goal.count),candidates:[],detail:goal.detail+'。低速艦を編成するか、高速化装備を外して速力を再確認。'};
  if(goal.kind==='opening-asw')return {...goal,goalKind:goal.kind,kind:'対潜',owned:0,placement:false,shortfall:goal.minCount-goal.count,candidates:inventory.filter(x=>hdOCItemMatches('opening-asw',x)).map(x=>x.name),asw:true};
  if(typeof HD_SE_RECIPES!=='undefined'&&HD_SE_RECIPES[goal.kind]){const contract=['1-5','3-1','7-4','7-5'].includes(c.map)?hdFERouteRequirementData(best.plan):null,oneFiveRecommendation=c.map==='1-5'&&contract?.map==='1-5'&&contract.index===1&&contract.path==='ADFGJ'&&goal.generatedFromMap===true&&goal.purpose==='recommendation',oneFiveUser=hdOCAswSetUserGoal(best.plan,goal,contract),threeOneCarrierRecommendation=c.map==='3-1'&&contract?.map==='3-1'&&contract.index===0&&contract.path==='CFG'&&goal.generatedFromMap===true&&goal.purpose==='recommendation',sevenFourRecommendation=c.map==='7-4'&&contract?.map==='7-4'&&contract.index===0&&contract.path==='ABEJLP'&&goal.generatedFromMap===true&&goal.purpose==='recommendation',sevenFiveFirstRecommendation=c.map==='7-5'&&contract?.map==='7-5'&&contract.index===0&&contract.path==='ABDFGHK'&&goal.generatedFromMap===true&&goal.purpose==='recommendation',sevenFiveSecondRecommendation=c.map==='7-5'&&contract?.map==='7-5'&&contract.index===1&&contract.path==='ABDFJOQ'&&goal.generatedFromMap===true&&goal.purpose==='recommendation',profile=hdSEProfiles(c.map).find(x=>x.kind===goal.kind),stock=hdSECapabilityStock(best.plan,goal.kind,goal.minCount),optionalAswProjection=goal.kind==='cap-asw'&&(c.map==='1-6'&&c.index===0||c.map==='7-5'&&contract?.index===2&&contract.path==='ABDFJOPT')?hdOCOptionalAswProjection(best.plan,goal,stock,{inventory,slots}):null,softLandProjection=['4-3','4-5'].includes(c.map)&&goal.kind==='cap-land-soft'?hdOCSoftLandProjection(c,best.plan,goal,requirements,best.measure,slots):null,twoAreaCarrierReference=['2-1','2-2','2-3','2-4'].includes(c.map)&&goal.kind==='cap-carrier-attack'?hdOCTwoAreaCarrierReference(best.plan,goal,stock,{inventory,slots}):null;return {...goal,...(twoAreaCarrierReference?{twoAreaCarrierReference}:{}),...(softLandProjection?{softLandProjection}:{}),...(optionalAswProjection?{optionalAswProjection}:{}),kind:profile?.baseKind||goal.baseKind||goal.label||goal.kind,goalKind:goal.kind,capability:true,stock,...((['1-3','1-4'].includes(c.map)&&hdOCStarterCarrierScope(best.plan,goal)||threeOneCarrierRecommendation||['3-3','3-4','4-1','4-2','4-4','4-5','5-1','5-2','5-5','6-2','6-5','7-2'].includes(c.map))&&goal.kind==='cap-carrier-attack'?{carrierTargets:hdOCThreeThreeCarrierTargets(best.plan,goal)}:{}),...((['4-1','4-2','4-4','4-5','6-5','7-1','7-2'].includes(c.map)||oneFiveRecommendation||oneFiveUser||sevenFourRecommendation||sevenFiveFirstRecommendation||sevenFiveSecondRecommendation)&&goal.kind==='cap-asw'?{aswTargets:hdOCFourOneAswTargets(best.plan,goal,stock),...(oneFiveUser?{aswScopeNote:`利用者指定の${goal.minCount}組を比較しています。各組は同じ艦の別々の通常枠へ配備します。通行必須数・先制対潜人数・全編成への必要十分数・購入数量とは別で、他目標との枠競合や探索未完了を区別してください。`}:oneFiveRecommendation?{aswScopeNote:'対潜組数は選択中の任意比較目標です。元の航空戦艦1＋駆逐3の四隻例では対潜3組を比較しますが、通行必須・先制対潜人数・全編成への必要十分数・購入数量ではありません。'}:c.map==='7-2'&&hdFERouteRequirementData(best.plan)?.path==='CEG'&&goal.minCount===4&&goal.generatedFromMap&&goal.purpose==='recommendation'?{aswScopeNote:'4組は元の軽巡1＋駆逐3向けの戦闘比較目標です。別の有効編成の必要・十分な組数は未確認で、購入数量ではありません。'}:sevenFourRecommendation?{aswScopeNote:'対潜3組は元の航空戦艦1＋重巡1＋雷巡1＋駆逐2＋海防1の六隻例に対する任意の戦闘比較目標です。先制対潜人数・通行の必須条件・全編成への必要十分数・購入数量ではありません。'}:sevenFiveFirstRecommendation?{aswScopeNote:'対潜シナジー1組は第1目標Kへの既存の任意比較目標です。F→G・H→Kを選ぶ経路の通行必須・先制対潜人数・全編成への必要十分数・購入数量ではありません。'}:sevenFiveSecondRecommendation?{aswScopeNote:'対潜シナジー1組は第2目標Qへの既存の任意比較目標です。通行必須・先制対潜人数・全編成への必要十分数・購入数量ではありません。'}:{})}:{}),...((c.map==='5-1'||c.map==='7-3'&&hdFERouteRequirementData(best.plan)?.index===0||sevenFourRecommendation)&&goal.kind==='cap-night-auto'?{nightTargets:['night-main','night-main-secondary','night-mixed'].includes(stock?.recipe?.id)?hdOCSurfaceNightTargets(best.plan,goal,stock):hdOCFiveOneNightTargets(best.plan,goal,stock)}:{}),...(c.map==='6-1'&&goal.kind==='cap-night-auto'?{subNightTargets:hdOCSixOneNightTargets(best.plan,goal,stock)}:{}),...((c.map==='6-4'||sevenFiveSecondRecommendation)&&goal.kind==='cap-land-mixed'?{landTargets:hdOCSixFourLandTargets(best.plan,goal,stock),...(sevenFiveSecondRecommendation?{landScopeNote:'第2目標Q向けの既存の任意比較です。この装備例1組は通行必須・砲台撃破・全編成への必要十分数・購入数量ではありません。'}:{})}:{}),...(sevenFiveSecondRecommendation&&goal.kind==='cap-pt'?{ptTargets:hdOCSevenFiveSecondPTTargets(best.plan,goal,stock),ptScopeNote:'既存の汎用PT装備モデルの任意比較です。第2目標Qでの十分性は未確認で、PT・砲台の撃破、ゲージ進行、到達・勝利を保証しません。1組は通行必須・購入数量ではなく、単品のPT対策目安と足して追加の必要組数にしません。2部品例を第2固有の3部品例の成立へ読み替えません。'}:{}),...((c.map==='6-3'||oneFiveRecommendation)&&goal.kind==='cap-water-attack'?{waterTargets:hdOCSixThreeWaterTargets(best.plan,goal),...(oneFiveRecommendation?{waterScope:'one-five-bbv'}:{})}:{}),owned:stock?.parts?.length?Math.min(...stock.parts.map(p=>Math.floor(p.have/(p.need/goal.minCount)))):0,placement:true,shortfall:Math.max(1,goal.minCount-goal.count),candidates:stock?.parts.filter(x=>x.have<x.need).flatMap(x=>HD_SE_PARTS[x.part].examples)||[]}}
  const kind=goal.kind==='air-value'?'制空':goal.kind==='los-value'?'索敵':goal.kind==='radar-ships'?'電探':goal.kind==='drum-ships'?'ドラム缶':goal.kind==='speed-ship'?'高速化':goal.kind;
  const compatible=hdFLCatalog().filter(x=>hdOCItemMatches(kind,x)&&slots.some(slot=>hdOCCompatible(slot,{item:x,star:0}))).sort((a,b)=>hdOCScore(kind,b)-hdOCScore(kind,a));
  const candidates=(kind==='高速化'?['turbine','boiler'].flatMap(part=>compatible.filter(x=>hdOCSpeedPart(x)===part).slice(0,1)):compatible.slice(0,3)).map(x=>x.name);
  const ownedCount=part=>inventory.filter(x=>hdOCSpeedPart(x)===part).reduce((n,x)=>n+x.count,0);
  const owned=kind==='高速化'?Math.min(ownedCount('turbine'),ownedCount('boiler')):inventory.filter(x=>hdOCItemMatches(kind,x)).reduce((n,x)=>n+x.count,0);
  const placementInfo=kind==='高速化'?{}:hdOCPlacementInfo(kind,inventory,slots,hdFLCatalog());
  return {...goal,...placementInfo,routeEquipment:['radar-ships','drum-ships'].includes(goal.kind),goalKind:goal.kind,kind,owned,placement:!goal.speedActual&&(placementInfo.usableOwned??owned)>=(kind==='高速化'?Math.max(1,speedNeed):goal.minCount)&&!['air-value','los-value'].includes(goal.kind),shortfall:Math.max(0,goal.minCount-goal.count),candidates};
 });
 best.plan.ships.forEach(s=>{s.items=s.items.filter(x=>x.name)});
 const airInputWait=airUnselected&&best.measure.goals.some(g=>g.kind==='air-value'&&g.unresolved)&&hdOCSearchPendingGoals(best.measure.goals,true).every(g=>g.ok);
 const reasons=[...(airInputWait?['air-target-unselected']:[]),...(fixedInputStop?[fixedInputStop]:[]),...(portSeed.limited?['port-seed-limit']:[]),...(examined>=maxExamined?['combination-limit']:[]),...(depth>=maxDepth&&maxDepth<slots.length?['depth-limit']:[]),...(candidatePruned?['candidate-limit']:[]),...(beamPruned?['beam-limit']:[])];
 const search={status:best.measure.complete?'targets-met':'incomplete',exhaustive:false,examined,maxExamined,maxDepth,candidatePruned,portSeed:{examined:portSeed.examined,maxOperations:800,limited:portSeed.limited},scope:{map:c.map,routeIndex:c.index},reasons:reasons.length?reasons:['bounded-search']};
 best.plan.search=search;
 return {...best,search,readiness:hdOCReadiness(best.plan,best.measure),shortages,examined,signature,fleetId:c.fleet.id};
}
function hdOCSearch(c){const steps=hdOCSearchSteps(c);let step;do{step=hdFEWithShipLookup(()=>steps.next())}while(!step.done);return step.value}
async function hdOCSearchAsync(c){
 const aswChoice=hdOCAswSetCapture(c);hdOCAswSetRequire(aswChoice,c);const signature=hdOCSignature(c,aswChoice),steps=hdOCSearchSteps(c,{},aswChoice);
 // Give the loading state a paint opportunity before evaluating combinations.
 await new Promise(resolve=>setTimeout(resolve,25));
 while(true){
  const current=hdOCContext(c.map,c.fleet.id,c.index);
  if(hdOCSignature(current)!==signature){steps.return();const error=new Error('Owned search data changed');error.code='HD_OC_STALE';throw error}
  const step=hdFEWithShipLookup(()=>steps.next());if(step.done)return step.value;
  await new Promise(resolve=>setTimeout(resolve,0));
 }
}
// Named placement candidates for the selected 3-3 ACGM, 3-4 ACEGJP and 4-x optional
// carrier attack target. These are catalog-compatible exchange slots, never a
// joint allocation or purchase requirement. Other routes keep their presentation.
function hdOCStarterCarrierScope(plan,goal){
 if(!['1-3','1-4'].includes(plan?.map)||goal?.kind!=='cap-carrier-attack'||goal.generatedFromMap!==true||goal.purpose!=='recommendation')return false;
 const contract=hdFERouteRequirementData(plan),data=typeof MAP_PLANS==='undefined'?null:MAP_PLANS[plan.map]?.routeBranches,path=plan.map==='1-3'?'CFJ / A(DB)EFJ':'BCF(E)HL / AD(EH/GJ)L';
 if(contract?.map!==plan.map||contract.index!==0||contract.path!==path||contract.carrierAttackTarget!==true||plan.routeIndex!=null&&plan.routeIndex!==0||data?.path!==path)return false;
 const id=plan.routeGoal==null||plan.routeGoal===''?data.defaultGoal:plan.routeGoal,ids=plan.map==='1-3'?['normal','cfj']:['normal','j-avoid'];
 return typeof id==='string'&&ids.includes(id)&&!!hdFEBranchGoal(data,id);
}
function hdOCTwoAreaCarrierReference(plan,goal,stock,context={}){
 if(!['2-1','2-2','2-3','2-4'].includes(plan?.map)||goal?.kind!=='cap-carrier-attack'||goal.generatedFromMap!==true||goal.purpose!=='recommendation')return null;
 const canonical=typeof MAP_PLANS==='undefined'?null:MAP_PLANS[plan.map]?.presets?.[0],preset=plan?.suggestion?.preset||plan?.preset||plan?.sourceFleet?.routePreset;
 if(!canonical||!preset||['name','ships','gear','use','source','flagship'].some(key=>preset[key]!==canonical[key]))return null;
 const contract=hdFERouteRequirementData(plan),path=({'2-1':'C(E)DH','2-2':'CE(GH)K','2-3':'ボス方面・経路ランダム','2-4':'ボス方面・経路ランダム'})[plan.map],knownCarriers=(plan.ships||[]).filter(ship=>['軽空母','正規空母','装甲空母'].includes(hdFEFindShip(ship.ship)?.type)).length;
 if(contract?.map!==plan.map||contract.index!==0||contract.path!==path||contract.carrierAttackTarget!==true||plan.routeIndex!=null&&plan.routeIndex!==0||knownCarriers===0||goal.minCount!==knownCarriers||stock?.recipe?.id!=='carrier-attack'||stock.recipe.ship!=='carrier-attack'||stock.recipe.parts?.length!==1||stock.recipe.parts[0]!=='carrierAttackPlane')return null;
 const inventoryKnown=Array.isArray(context.inventory),inventory=inventoryKnown?context.inventory:[],usage=hdFOAssignedUsage(plan),inventoryRows=inventory.filter(row=>hdFEFind(row.name)&&Number.isFinite(row.count)&&row.count>0&&hdSEPartMatches('carrierAttackPlane',row)).map(row=>({name:row.name,star:Number(row.star)||0,registered:row.count,assigned:usage[row.key]||0,unused:Math.max(0,row.count-(usage[row.key]||0)),key:row.key})).sort((a,b)=>Number(b.assigned>0)-Number(a.assigned>0)),inventoryTotals=inventoryRows.reduce((sum,row)=>({registered:sum.registered+row.registered,assigned:sum.assigned+row.assigned,unused:sum.unused+row.unused}),{registered:0,assigned:0,unused:0}),inventoryUnknown=inventory.filter(row=>!Number.isFinite(row.count)||row.count>0&&!hdFEFind(row.name)).length;
 const allCatalog=hdFLCatalog().filter(item=>hdSEPartMatches('carrierAttackPlane',item)),catalog=[...new Map([...inventoryRows.map(row=>hdFEFind(row.name)).filter(Boolean),...allCatalog].map(item=>[item.name,item])).values()].slice(0,12);let unknownHulls=0;
 const rows=(plan.ships||[]).flatMap((ship,shipIndex)=>{
  const db=hdFEFindShip(ship.ship);if(!db){unknownHulls++;return []}if(!['軽空母','正規空母','装甲空母'].includes(db.type)||hdSECapabilityMeasure({ships:[ship]},goal.kind).count>0)return [];
  const profile=hdShipDbSlotProfile(db),master=hdShipDbMasterRowFor(db),valid=!!profile&&!!master&&Number.isInteger(profile.count)&&profile.count>=0&&Array.isArray(profile.slots)&&profile.count===profile.slots.length&&profile.count===(master.slots||[]).length&&Number(profile.id)===Number(master.id)&&(!Number(ship.masterId)||Number(ship.masterId)===Number(master.id)),slots=[];let unknownSlots=valid?0:1,blockedSlots=0;
  if(valid)for(let index=0;index<profile.count;index++){
   const capacity=profile.slots[index];if(!Number.isFinite(capacity)||capacity<0){unknownSlots++;continue}if(capacity===0){blockedSlots++;continue}
   const slot={si:shipIndex,index,db,profile,capacity},candidates=[];for(const item of catalog){const allowed=hdShipDbMasterCompatible(item,db);if(allowed===null){unknownSlots++;continue}if(allowed===false||!hdOCCompatible(slot,{item,star:0}))continue;candidates.push(item.name);if(candidates.length===3)break}
   if(candidates.length){const current=(ship.items||[]).find((item,at)=>(item.slotIndex??at)===index);slots.push({index,capacity,current:current?.name?{name:current.name,star:Number(current.star)||0}:null,candidates,fixedCondition:'unconfirmed',exchangeability:'unconfirmed'})}else if(catalog.length)blockedSlots++;
  }
  const zeroCapacity=valid&&profile.slots.slice(0,profile.count).every(capacity=>Number.isFinite(capacity)&&capacity===0),status=slots.length?'candidate':zeroCapacity?'blocked':unknownSlots||!catalog.length?'manual':'blocked';return [{ship:ship.ship,shipIndex,status,reason:status==='candidate'?'catalogue-targets':zeroCapacity?'no-positive-capacity':status==='manual'?'slot-information-unknown':'examined-examples-blocked',slots,unknownSlots:unknownSlots>0,blockedSlots}];
 });
 return {scope:'two-area-carrier-reference',map:plan.map,index:0,path,fleetTargetShips:goal.minCount,fleetEquippedShips:goal.count,rows,unknownHulls,inventoryStatus:inventoryKnown?'observed':'manual',inventoryRows:inventoryRows.slice(0,12),inventoryRemaining:Math.max(0,inventoryRows.length-12),inventoryTotals,inventoryUnknown,stockReference:{recipeName:stock.recipe.name,complete:stock.complete,parts:(stock.parts||[]).map(part=>({part:part.part,label:part.label,comparisonNeed:part.need,matched:part.have,items:[...(part.items||[])]}))},catalogueLimited:allCatalog.length>12,normalOnly:true,postSwapUnassessed:true};
}
function hdOCTwoAreaCarrierReferenceHtml(view){
 if(!view||view.scope!=='two-area-carrier-reference')return '';
 const esc=hdFEEsc,label=row=>row.name+(row.star?' ★'+row.star:''),reasons={'no-positive-capacity':'確認した通常枠には、航空機を運用できる正の搭載上限がありません。補強増設を含む別の配備は、この案内では評価していません。','slot-information-unknown':'艦・装備可否・搭載上限の情報が不足しているため、この案内の搭載先は未判定です。','examined-examples-blocked':'確認したカタログ例には合法な通常枠がありません。この艦の全機体への搭載不可や在庫不足を確定する判定ではありません。'};
 return `<div data-hd-oc-two-area-carrier-reference><b>任意の攻撃機配備目標に向けた搭載先の例</b><p>攻撃機を配備した空母の比較：現在${esc(view.fleetEquippedShips)} / 任意目標${esc(view.fleetTargetShips)}隻。既存の戦闘推奨目標を表示しています。攻撃機の任意個数、各艦の攻撃能力、数値の制空目標、経路必須条件とは分けて確認します。通行の必須隻数・装備の必要個数・確定調達数ではありません。</p><div data-hd-oc-two-area-carrier-inventory><b>登録・現在案で使用・この案の未使用の内訳</b>${view.inventoryStatus==='observed'?`<p>確認できた攻撃機の登録合計${esc(view.inventoryTotals.registered)} / 現在案で使用${esc(view.inventoryTotals.assigned)} / この案の未使用${esc(view.inventoryTotals.unused)}個。</p>${view.inventoryRows.map(row=>`<p data-hd-oc-two-area-carrier-stock>${esc(label(row))}：登録${esc(row.registered)} / 現在案で使用${esc(row.assigned)} / この案の未使用${esc(row.unused)}個。</p>`).join('')}${view.inventoryRemaining?`<small>改修別の明細は使用中を優先した12件まで（残り${esc(view.inventoryRemaining)}件）。合計は表示外も含みます。</small>`:''}${view.inventoryUnknown?'<small>未登録性能や数量未判定の登録があり、上の確認済み内訳へ含めていません。</small>':''}`:'<p>登録・使用・未使用の内訳を対応付けられないため、在庫の区分は未判定です。</p>'}<small>この案の未使用0だけで追加購入が必要とは判断しません。他の編成で使う装備の自由な転用、全候補の同時配備や他目標の維持は未評価です。登録がないことは、ゲーム内の非所持を確認した値ではありません。</small></div><div data-hd-oc-two-area-carrier-stock-reference><b>既存装備例「${esc(view.stockReference.recipeName)}」の比較内訳</b>${view.stockReference.parts.map(part=>`<p>${esc(part.label)}：比較目標に対応した構成${esc(part.comparisonNeed)} / 登録から照合できた${esc(part.matched)}個。${esc(part.items.length?'照合した登録名：'+part.items.join('、'):'対応する登録名を確認できません。')}</p>`).join('')}<small>ここは既存目標に対する照合結果です。通行必須数・購入数量・合法な同時配備を示すものではありません。</small></div>${view.rows.map(row=>`<p data-hd-oc-two-area-carrier-row="${esc(row.shipIndex)}" data-hd-oc-two-area-carrier-status="${esc(row.status)}" data-hd-oc-two-area-carrier-fixed-condition="manual">${esc(row.ship)}：${row.status==='candidate'?row.slots.map(slot=>`通常第${slot.index+1}枠（搭載上限${esc(slot.capacity)}）：${slot.candidates.map(esc).join('・')}。${slot.current?'現在装備'+esc(slot.current.name)+(slot.current.star?' ★'+esc(slot.current.star):''):'現在は空き枠'}（固定条件・交換可否は未判定）`).join(' / '):esc(reasons[row.reason]||'搭載条件を確認してください。')}</p>`).join('')}${view.unknownHulls?'<small>艦情報未確認の行の搭載先は表示していません。</small>':''}<small>搭載先は装備可否と搭載上限を照合した通常枠のカタログ例で、未所持品を含みます。登録名を優先して最大12種類を確認し、各枠は最大3名称だけを表示します。固定枠・変更してよい枠を識別する情報はこの案内で確認しておらず、合法搭載先をそのまま交換可能な枠と扱いません。搭載不可と、他の装備で枠を使う競合や情報不足は別です。競合を解消できる交換はまだ確認していません。各候補は別の選択肢で、全空母への同時配備や購入数量を示しません。補強増設を利用する配備は、この案内では評価していません。</small><small>現在配備や元目標を変更しません。交換後の制空・索敵・成立済み条件・利用者目標・元装備の保持は未評価で、自動適用しません。機数・熟練度・改修値・現在残機、道中・ボスを通る順番と連戦損耗も、この案内では評価していません。全戦闘の制空や攻撃継続を保証する数値ではありません。実際の攻撃可否、経路全体の到達・ランダム分岐、与ダメージ・撃破・勝利とは別に確認してください。</small></div>`;
}
function hdOCThreeThreeCarrierTargets(plan,goal){
 const starter=['1-3','1-4'].includes(plan?.map)&&hdOCStarterCarrierScope(plan,goal);
 if(['1-3','1-4'].includes(plan?.map)){if(!starter)return null;}else if(plan?.map==='3-1'){
  const contract=hdFERouteRequirementData(plan);if(contract?.map!=='3-1'||contract.index!==0||contract.path!=='CFG'||goal?.kind!=='cap-carrier-attack'||goal.generatedFromMap!==true||goal.purpose!=='recommendation')return null;
 }else if(!['3-3','3-4','4-1','4-2','4-4','4-5','5-1','5-2','5-5','6-2','6-5','7-2'].includes(plan?.map)||goal?.kind!=='cap-carrier-attack'||!goal.generatedFromMap||goal.purpose!=='recommendation'||hdFERouteRequirementData(plan)?.path!==({'3-3':'ACGM','3-4':'ACEGJP','4-1':'CFDGJ / ABDGJ','4-2':'ACL / BDCL','4-4':'AEIK','4-5':'ADHKT / CDHKT','5-1':'BCFJ','5-2':'BCEFO','5-5':'BKPS','6-2':'CEJK','6-5':'ACDGM','7-2':'BCDIM'}[plan.map]))return null;
 const kind=goal.kind;
 const catalog=hdFLCatalog().filter(item=>hdSEPartMatches('carrierAttackPlane',item));
 return (plan.ships||[]).flatMap((ship,shipIndex)=>{
  const db=hdFEFindShip(ship.ship);if(!['軽空母','正規空母','装甲空母'].includes(db?.type)||hdSECapabilityMeasure({ships:[ship]},kind).count>0)return [];
  const profile=hdShipDbSlotProfile(db),valid=!!profile&&Number.isInteger(profile.count)&&profile.count>=0&&Array.isArray(profile.slots),slots=[];let unknownSlots=!valid;
  if(valid)for(let index=0;index<profile.count;index++){
   const capacity=profile.slots[index];if(!Number.isFinite(capacity)||capacity<0){unknownSlots=true;continue}if(capacity===0)continue;
   const slot={si:shipIndex,index,db,profile,capacity},candidates=catalog.filter(item=>hdOCCompatible(slot,{item,star:0})).slice(0,3).map(item=>item.name);
   if(candidates.length)slots.push({index,candidates});
  }
  const row={ship:ship.ship,shipIndex,count:1,status:slots.length?'candidate':unknownSlots?'manual':'blocked',slots,unknownSlots};if(!starter)return [row];
  const positive=valid?profile.slots.slice(0,profile.count).filter(n=>Number.isFinite(n)&&n>0).length:0,hullCompatible=catalog.some(item=>hdShipDbEquipCompatible(item,db)),masterBlocked=catalog.length>0&&catalog.every(item=>hdShipDbMasterCompatible(item,db)===false);
  const reason=slots.length?'candidate':!valid?'profile-unknown':!positive&&!unknownSlots?'no-positive-capacity':!catalog.length?'catalogue-unknown':!hullCompatible?(masterBlocked?'hull-incompatible':'compatibility-unknown'):unknownSlots?'slot-info-unknown':'slot-restricted';
  return [{...row,status:reason==='candidate'?'candidate':['profile-unknown','slot-info-unknown','catalogue-unknown','compatibility-unknown'].includes(reason)?'manual':'blocked',placementScope:'starter-carrier',reason,normalOnly:true}];
 });
}
// Display one documented ASW recipe on actual hulls and distinct normal slots.
// This is a catalog inspection, not inventory allocation or an opening-ASW claim.
function hdOCOptionalAswProjection(plan,goal,stock,context){
 if(!(plan?.map==='1-6'||plan?.map==='7-5'&&Number(plan.routeIndex??plan.index)===2))return null;
 const targets=hdOCFourOneAswTargets(plan,goal,stock,context);if(!Array.isArray(targets)||targets.some(row=>row.placementScope!=='optional-asw'))return null;
 const known=Array.isArray(context?.inventory),inventory=known?context.inventory:[],assignedItems=hdOCAssigned(plan),parts=['sonar','projector'].map(part=>{const rows=inventory.filter(row=>hdSEPartMatches(part,row)),registered=known?rows.reduce((n,row)=>n+row.count,0):null,assigned=assignedItems.filter(item=>hdSEPartMatches(part,item)).length;return {part,label:HD_SE_PARTS[part].label,count:1,registered,assigned,unused:registered==null?null:Math.max(0,registered-assigned)};});
 return {scope:'owned-optional-asw',recipeId:stock.recipe.id,recipeName:stock.recipe.name,parts,targets,inventoryUnknown:!known||inventory.some(row=>row.count>0&&!hdFEFind(row.name)),registrationGap:parts.some(part=>part.registered!=null&&part.assigned>part.registered),sourceUnknown:(plan.preservationIssues||[]).length>0};
}
function hdOCOptionalAswHtml(view){
 if(view?.scope!=='owned-optional-asw')return '';
 const esc=hdFEEsc,label=item=>item.name+(item.star?' ★'+item.star:''),amount=value=>value==null?'未確認':value+'個',reasons={'hull-unknown':'艦情報が未判定です。','profile-unknown':'通常枠情報が未判定です。','identity-unknown':'艦・個体・通常枠の対応を確認できません。','recipe-ineligible':'この艦は、選択した装備例の適用対象外です。','context-unknown':'現在の登録在庫・使用できる通常枠の情報が未確認です。','context-identity-unknown':'受け取った通常枠と、実際の結果艦の対応が未確認です。','normal-slot-count':'通常枠数が足りず、2部品を別々の通常枠へ置けません。','permitted-slots':'現在の探索で使える通常枠に、2部品を別々に置く候補がありません。','equipment-incompatible':'この装備例の一部を載せる通常枠がありません。','compatibility-unknown':'艦・装備・通常枠の適合情報が未確認です。','slot-conflict':'部品ごとの候補はありますが、同じ艦の別々の通常枠へ組み合わせられません。'};
 return `<div data-hd-oc-asw-targets data-hd-oc-optional-asw><b>任意の対潜装備例：同じ艦の別々の通常枠</b><small>ソナー1個＋爆雷投射機1個は、この装備例1組の部品内訳です。既定の任意比較1組を、通行の必須組数・先制対潜人数・全編成への十分な組数・購入数量へ読み替えません。</small><div data-hd-oc-optional-asw-stock>${view.parts.map(part=>`<p><b>${esc(part.label)}：構成例${part.count}個</b> / 登録${amount(part.registered)} / 現在案${amount(part.assigned)} / 未使用${amount(part.unused)}</p>`).join('')}</div>${view.inventoryUnknown?'<p>性能未登録などの在庫情報が残ります。ここでは確認できた登録品だけを照合しています。</p>':''}${view.registrationGap?'<p>現在案の使用数が登録数を超える部品があります。現在配備と所持登録の対応を確認してください。</p>':''}${view.sourceUnknown?'<p>元の艦・装備情報に未確認があります。元データを保持して確認してください。</p>':''}${view.targets.map(target=>`<article data-hd-oc-optional-asw-row="${target.shipIndex}" data-hd-oc-optional-asw-status="${target.status}" data-hd-oc-optional-asw-reason="${target.reason}"><b>第${target.shipIndex+1}艦 ${esc(target.ship)}</b>${target.status==='candidate'?`<p>同じ艦の別々の通常枠に置くカタログ上の候補です。</p>${target.parts.map(part=>`<div data-hd-oc-optional-asw-part="${esc(part.part)}"><b>${esc(part.label)}${part.count}個</b>${part.slots.map(slot=>`<p>通常第${slot.index+1}枠 / 現在 ${slot.current?esc(label(slot.current)):'空き枠'}：${slot.candidateDetails.map(item=>`<span data-hd-oc-optional-asw-mode="${item.mode}">${esc(label(item))}（登録${item.registered} / 現在案${item.assigned} / 未使用${item.unused}個、${item.mode==='same'?'この枠の同じ装備を継続':item.mode==='empty'?'空き枠への配置を検討':'現在装備との交換対象'}）</span>`).join('・')}${slot.omitted?'（他の候補は表示を省略）':''}</p>`).join('')}</div>`).join('')}<p>同艦の組合せ：${target.pairs.map(pair=>`<span data-hd-oc-optional-asw-pair>ソナー通常第${pair.sonarSlot+1}枠＋投射機通常第${pair.projectorSlot+1}枠</span>`).join(' / ')}</p><p data-hd-oc-optional-asw-inventory>${target.inventoryStatus==='registered-pair'?'登録品で搭載条件に合う同艦・別枠の組合せが見つかりました。配備は変更していません。':'表示した通常枠に、登録品で揃う組合せは確認できていません。'}転用元の配備や他目標の維持は未評価です。</p>${target.unknownSlots?'<small>別に適合未確認の候補が残ります。確認できた組合せとは分けてください。</small>':''}`:`<p>${esc(reasons[target.reason]||'艦・装備・通常枠を確認してください。')}在庫不足や購入必須とは別に確認してください。</p>`}</article>`).join('')}<small>候補は1組の代替となる通常枠の検討先で、全候補艦への配備を求めません。補強増設を使う別の構成は、この案内では未評価です。現在装備がある枠は交換対象であり、固定枠と断定していません。枠や登録品は他目標・他艦と共用し、同じ装備を二重使用できません。未使用0個だけで追加購入が必要とは判断しません。登録品で組合せがあっても、条件を保つ実配備の成立を保証しません。</small><p>交換後の対潜値・先制対潜条件・成立済み条件と利用者指定目標の維持は未評価です。装備例の準備と、攻撃可否・発動・命中・撃破・勝利は別です。装備名は各枠で現在装備・登録品を優先した最大3種の例で、同名の改修別表示も限定します。全在庫・全候補の網羅ではありません。表示だけで配備や保存編成を変更せず、交換を自動適用しません。</p></div>`;
}
function hdOCFourOneAswTargets(plan,goal,stock,context=null){
 const scopedContract=['1-5','1-6','7-4','7-5'].includes(plan?.map)?hdFERouteRequirementData(plan):null,oneFive=plan?.map==='1-5'&&scopedContract?.map==='1-5'&&scopedContract.index===1&&scopedContract.path==='ADFGJ',oneSix=plan?.map==='1-6'&&scopedContract?.map==='1-6'&&scopedContract.index===0&&scopedContract.path==='AEGFBN',sevenFour=plan?.map==='7-4'&&scopedContract?.map==='7-4'&&scopedContract.index===0&&scopedContract.path==='ABEJLP',sevenFiveFirst=plan?.map==='7-5'&&scopedContract?.map==='7-5'&&scopedContract.index===0&&scopedContract.path==='ABDFGHK',sevenFiveSecond=plan?.map==='7-5'&&scopedContract?.map==='7-5'&&scopedContract.index===1&&scopedContract.path==='ABDFJOQ',sevenFiveThird=plan?.map==='7-5'&&scopedContract?.map==='7-5'&&scopedContract.index===2&&scopedContract.path==='ABDFJOPT',optional=oneSix||sevenFiveThird,scopedRecommendation=oneFive||oneSix||sevenFour||sevenFiveFirst||sevenFiveSecond||sevenFiveThird;
 const choice=oneFive&&typeof hdFEOneFiveAswSelection==='function'?hdFEOneFiveAswSelection(plan,[goal]):null,selectedUser=hdOCAswSetUserGoal(plan,goal,scopedContract);
 if(oneFive&&choice?.applicable&&(['off','unselected','invalid'].includes(choice.state)||choice.state==='count'&&!selectedUser))return null;
 if(!(['4-1','4-2','4-4','4-5','6-5','7-1','7-2'].includes(plan?.map)||scopedRecommendation)||goal?.kind!=='cap-asw'||!selectedUser&&(scopedRecommendation&&goal.generatedFromMap!==true||!goal.generatedFromMap||goal.purpose!=='recommendation')||!scopedRecommendation&&(plan.map==='7-2'?!['CEG','BCDIM'].includes(hdFERouteRequirementData(plan)?.path):hdFERouteRequirementData(plan)?.path!==({'4-1':'CFDGJ / ABDGJ','4-2':'ACL / BDCL','4-4':'AEIK','4-5':'ADHKT / CDHKT','6-5':'BFIJM','7-1':'DEGHK'}[plan.map]))||stock?.recipe?.id!=='sonar-projector'||(oneFive||sevenFiveSecond||optional)&&(stock.recipe.parts?.length!==2||stock.recipe.parts[0]!=='sonar'||stock.recipe.parts[1]!=='projector'))return null;
 if(optional){const canonical=typeof HD_SE_RECIPES!=='undefined'&&HD_SE_RECIPES['cap-asw']?.find(row=>row.id==='sonar-projector');if(!canonical||canonical.parts?.length!==2||canonical.parts[0]!=='sonar'||canonical.parts[1]!=='projector'||goal.minCount!==1||goal.ok||goal.unresolved||stock.recipe.ship!==canonical.ship||stock.recipe.attack!==canonical.attack||stock.parts?.length!==2||stock.parts.some((part,i)=>part.part!==canonical.parts[i]||part.need!==1))return null;}
 const catalog=hdFLCatalog(),parts=['sonar','projector'],knownContext=optional&&Array.isArray(context?.inventory)&&Array.isArray(context?.slots),inventory=knownContext?context.inventory:[],usage=optional?hdFOAssignedUsage(plan):null;
 return (plan.ships||[]).flatMap((ship,shipIndex)=>{
  const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db),base={ship:ship.ship,shipIndex};
  const issue=(status,reason)=>[{...base,status,reason,placementScope:'optional-asw',parts:[],pairs:[],inventoryStatus:'unconfirmed',unknownSlots:status==='manual'}];
  if(!db||!profile||!Number.isInteger(profile.count)||profile.count<0)return optional?issue('manual',!db?'hull-unknown':'profile-unknown'):[{ship:ship.ship,shipIndex,status:'manual',parts:[]}];
  let allowed=null;
  if(optional){
   const master=hdShipDbMasterRowFor(db);if(!master||!Array.isArray(profile.slots)||profile.count!==profile.slots.length||profile.count!==(master.slots||[]).length||Number(profile.id)!==Number(master.id)||Number(ship.masterId)&&Number(ship.masterId)!==Number(master.id))return issue('manual','identity-unknown');
   if(!hdSERecipeAllows(stock.recipe,ship))return issue('blocked','recipe-ineligible');
   if(!knownContext)return issue('manual','context-unknown');
   if(profile.count<2)return issue('blocked','normal-slot-count');
   const supplied=context.slots.filter(slot=>slot.si===shipIndex&&!slot.expansion);if(supplied.some(slot=>{const source=slot.db&&hdShipDbMasterRowFor(slot.db);return !source||Number(source.id)!==Number(master.id)||Number(slot.profile?.id)!==Number(profile.id)||slot.profile?.count!==profile.count||!Number.isInteger(slot.index)||slot.index<0||slot.index>=profile.count;}))return issue('manual','context-identity-unknown');
   allowed=new Set(supplied.map(slot=>slot.index));
   if(allowed.size<2)return issue('blocked','permitted-slots');
  }
  const rows=parts.map(part=>{
   const source=optional?catalog.filter(item=>hdSEPartMatches(part,item)):catalog;let unconfirmed=optional&&!source.length;
   const slots=Array.from({length:profile.count},(_,index)=>{
    const slot={si:shipIndex,index,db,profile,capacity:profile.slots?.[index]},items=source.filter(item=>{
     if(!hdSEPartMatches(part,item))return false;
     if(optional&&hdShipDbMasterCompatible(item,db)===null){if(allowed.has(index))unconfirmed=true;return false;}
     return hdOCCompatible(slot,{item,star:0});
    });
    const old=optional?(ship.items||[]).find(item=>item.slotIndex===index):null,current=old?.name?{name:old.name,star:Number(old.star)||0}:null;
    if(optional)items.sort((a,b)=>Number(!!current&&hdFLNorm(current.name)===hdFLNorm(b.name))-Number(!!current&&hdFLNorm(current.name)===hdFLNorm(a.name))||Number(inventory.some(row=>row.count>0&&hdFLNorm(row.item?.name||row.name)===hdFLNorm(b.name)))-Number(inventory.some(row=>row.count>0&&hdFLNorm(row.item?.name||row.name)===hdFLNorm(a.name))));
    const selected=items.slice(0,3),candidates=selected.map(item=>item.name);if(!optional)return {index,candidates};
    const candidateDetails=selected.flatMap(item=>{const owned=inventory.filter(row=>row.count>0&&hdFLNorm(row.item?.name||row.name)===hdFLNorm(item.name)).sort((a,b)=>Number(!!current&&hdFOStackKey(current)===b.key)-Number(!!current&&hdFOStackKey(current)===a.key)),entries=owned.length?owned.slice(0,3):[{name:item.name,star:0,count:0,key:hdFLInventoryStackKey(item.name,0)}];return entries.map(row=>{const assigned=usage[row.key]||0;return {name:row.name,star:Number(row.star)||0,registered:row.count,assigned,unused:Math.max(0,row.count-assigned),mode:current?hdFOStackKey(current)===row.key?'same':'replace':'empty'};});});
    return {index,candidates,current,candidateDetails,omitted:Math.max(0,items.length-selected.length)};
   }).filter(slot=>slot.candidates.length);
   return {part,count:1,label:HD_SE_PARTS[part].label,slots,...(optional?{unconfirmed}: {})};
  });
  // Reuse the existing two-part test: both parts must fit distinct normal
  // frames on the same hull. A zero aircraft capacity is valid for this set.
  const fullPair=optional&&rows[0].slots.some(a=>rows[1].slots.some(b=>a.index!==b.index));
  if(optional)for(const row of rows)row.slots=row.slots.filter(slot=>allowed.has(slot.index));
  const candidate=rows[0].slots.some(a=>rows[1].slots.some(b=>a.index!==b.index));
  if(optional&&!candidate){const definite=rows.some(row=>!row.slots.length&&!row.unconfirmed),unknown=rows.some(row=>row.unconfirmed);return issue(definite?'blocked':unknown?'manual':'blocked',definite?(fullPair?'permitted-slots':'equipment-incompatible'):unknown?'compatibility-unknown':fullPair?'permitted-slots':'slot-conflict');}
  const original=rows.map(row=>row.slots);for(let i=0;i<rows.length;i++)rows[i].slots=original[i].filter(a=>original[1-i].some(b=>a.index!==b.index));
  if(!optional)return candidate?[{ship:ship.ship,shipIndex,status:'candidate',parts:rows}]:[];
  const pairs=rows[0].slots.flatMap(a=>rows[1].slots.filter(b=>a.index!==b.index).map(b=>({sonarSlot:a.index,projectorSlot:b.index}))),registeredPair=pairs.some(pair=>rows[0].slots.find(slot=>slot.index===pair.sonarSlot).candidateDetails.some(a=>a.registered>0&&rows[1].slots.find(slot=>slot.index===pair.projectorSlot).candidateDetails.some(b=>b.registered>0&&(hdFLInventoryStackKey(a.name,a.star)!==hdFLInventoryStackKey(b.name,b.star)||a.registered>=2))));
  return [{...base,status:'candidate',reason:'normal-pair',placementScope:'optional-asw',parts:rows,pairs,inventoryStatus:registeredPair?'registered-pair':'not-confirmed',unknownSlots:rows.some(row=>row.unconfirmed)}];
 });
}
// The chosen auto-night recipe is one equipment example, not a new route goal.
// Two torpedoes must fit distinct normal slots on one eligible surface hull.
function hdOCSoftLandAcceptVariant(input){
 const {plan,before,after,goal,rechecks=[]}=input,failures=[],current=new Map([...(after.goals||[]),...(after.requiredChecks||[])].map(g=>[hdOCGoalIdentity(g),g]));
 const fail=(status,reason,label)=>failures.push({status,reason,labels:[label]});
 for(const g of [...(before.goals||[]),...(before.requiredChecks||[])]){
  const next=current.get(hdOCGoalIdentity(g)),partial=g.purpose!=='recommendation'||g.mandatory||g.kind==='port-attacker-set',label=g.label||g.kind;
  if(g.ok&&!g.unresolved){if(!next||next.unresolved)fail('manual','protected-unconfirmed',label);else if(!next.ok)fail('blocked','protected-goal-loss',label);}
  if(!partial)continue;
  if(!next){fail('manual','protected-unconfirmed',label);continue;}
  if(!g.unresolved&&next.unresolved)fail('manual','protected-unconfirmed',label);
  if(Number.isFinite(g.minCount)&&Number.isFinite(next.minCount)&&g.minCount!==next.minCount)fail('manual','protected-definition',label);
  for(const key of ['count','ratio'])if(Number.isFinite(g[key])){
   const limit=key==='ratio'?1:Number.isFinite(g.minCount)&&g.minCount>=0?g.minCount:Infinity,value=Math.min(g[key],limit);
   if(!Number.isFinite(next[key]))fail('manual','protected-unconfirmed',label);else if(Math.min(next[key],limit)<value)fail('blocked','protected-progress-loss',label);
  }
  if(g.kind==='port-attacker-set')for(const [part,limit]of Object.entries({main:2,recon:1,type3:1}))if(Number.isFinite(g.counts?.[part])){if(!Number.isFinite(next.counts?.[part]))fail('manual','protected-unconfirmed',label+' '+part);else if(Math.min(next.counts[part],limit)<Math.min(g.counts[part],limit))fail('blocked','assigned-set-progress-loss',label+' '+part);}
 }
 for(const text of rechecks)fail(/未確認|未判定/.test(text)?'manual':'blocked','opening-asw-change',text);
 const target=(after.goals||[]).find(g=>hdFLGoalMatch(g,goal));if(!target||target.unresolved)fail('manual','target-unconfirmed',goal.label);
 if(failures.length)return {ok:false,...failures[0],diagnostics:failures};
 const unresolved=[...new Set([...(plan.preservationIssues||[]),...(before.manual||[]),...(after.manual||[]),...(after.goals||[]).filter(g=>g.unresolved).map(g=>g.label)])],remaining=[...new Set((after.goals||[]).filter(g=>!g.ok&&!g.unresolved).map(g=>g.label))];
 return {ok:true,postReview:{targetReady:!!target?.ok,targetCount:target?.count??null,routeStatus:after.routeStatus||'manual',unresolved,remaining}};
}
function hdOCSoftLandProjection(c,plan,goal,requirements,measure,slots){
 const approved=c?.map==='4-3'&&c.index===0?'CDHN / CFHN':c?.map==='4-5'&&c.index===1?'ADHKT / CDHKT':null;
 if(!approved||goal?.kind!=='cap-land-soft'||goal.generatedFromMap!==true||goal.purpose!=='recommendation'||goal.ok||goal.unresolved)return null;
 const contract=hdFERouteRequirementData(plan);if(contract?.map!==c.map||contract.index!==c.index||contract.path!==approved||typeof hdFLSetRemedies!=='function')return null;
 const diagnostics=new Map(),report=event=>{const row={status:event.status||'manual',reason:event.reason||'variant-unconfirmed',shipIndex:event.shipIndex??null,recipeId:event.recipeId||'',labels:[...new Set(event.labels||[])]};diagnostics.set(JSON.stringify(row),row)},target={kind:goal.kind,label:goal.label,count:goal.count,minCount:goal.minCount};
 if(!Array.isArray(slots)){report({status:'manual',reason:'permitted-slots-unknown'});return {scope:'owned-soft-land',target,options:[],diagnostics:[...diagnostics.values()]};}
 const allowed=new Set(slots.filter(slot=>!slot.expansion).map(slot=>slot.si+':'+slot.index)),view={...plan,assessment:{requirements,measure}};
 const options=hdFLSetRemedies(view,goal,{oaswScope:(p,si)=>hdOCOaswScope(p,si),allowSlot:slot=>allowed.has(slot.si+':'+slot.index),acceptVariant:hdOCSoftLandAcceptVariant,report});
 if(plan.preservationIssues?.length)report({status:'manual',reason:'original-info-unconfirmed',labels:plan.preservationIssues});
 if(!options.length&&!diagnostics.size)report({status:'manual',reason:'no-confirmed-safe-variant'});
 return {scope:'owned-soft-land',target,options,diagnostics:[...diagnostics.values()]};
}
function hdOCSoftLandProjectionHtml(goal){
 const projection=goal.softLandProjection;if(projection?.scope!=='owned-soft-land')return '';
 const esc=hdFEEsc,routeLabels={ready:'登録条件を充足',partial:'一部条件のみ成立',missing:'不一致あり',manual:'未判定'},recipeLabels={type3:'三式弾系',rocket:'ロケット系'},routeText=value=>Object.hasOwn(routeLabels,value)?routeLabels[value]:'要確認',reasons={'profile-unknown':'艦・通常枠の情報が不足しています。','normal-slot-count-or-eligibility':'この構成例を置ける通常枠数や艦の適用条件を確認してください。','permitted-slots':'現在の探索で使える通常枠では、この構成例を配置できません。','permitted-slots-unknown':'現在の探索で使える通常枠の情報が未確認です。','compatibility-unconfirmed':'艦・装備・通常枠の適合情報が未確認です。','no-compatible-normal-slot':'確認した装備例を搭載できる通常枠がありません。','bounded-remedies':'既存の候補確認上限に達したため、未確認の組合せが残ります。','target-unconfirmed':'交換後の対地装備例の準備を確認できません。','no-target-improvement':'この交換では対地装備例の準備数が改善しません。','protected-unconfirmed':'維持すべき条件が交換後に未判定となるため、この案は採用候補にしません。','protected-definition':'維持すべき目標の対応を確認できないため、この案は採用候補にしません。','protected-goal-loss':'既に成立している条件を失うため、この案は採用候補にしません。','protected-progress-loss':'利用者目標や経路条件の進捗を失うため、この案は採用候補にしません。','assigned-set-progress-loss':'指定した担当艦セットの部品の進捗を失うため、この案は採用候補にしません。','opening-asw-change':'先制対潜の維持を確認できないため、この案は採用候補にしません。','original-info-unconfirmed':'元の艦・装備情報に未確認が残ります。','no-confirmed-safe-variant':'確認した範囲では、維持条件を保つ交換案を確定できません。'};
 return `<div data-hd-oc-soft-land><b>任意の対地装備例：条件を保つ交換候補</b><small>三式弾系とロケット系は別の装備例です。敵・艦・装備構成によって効果が異なり、同じダメージや撃破を保証しません。装備例の準備は実際の攻撃可否の確認とは別です。通行の必須装備数や十分な担当艦数ではありません。</small>${projection.options.map((option,i)=>`<section data-hd-oc-soft-option="${i}"><b>この任意案を選ぶ場合</b>${hdFLSetRemediesHtml(projection.target,[option],null)}<div data-hd-oc-soft-post-review data-hd-oc-soft-post-status="${option.postReview?.unresolved?.length?'manual':option.postReview?.remaining?.length?'partial':'prepared'}"><small>交換後の対地装備例の準備：${option.postReview?.targetReady?'確認':'未確認'}。経路条件の判定：${esc(routeText(option.postReview?.routeStatus))}。登録範囲内の判定で、経路全体の確定や勝利とは別です。</small>${(option.postReview?.unresolved||[]).map(text=>`<p>未確認：${esc(text)}</p>`).join('')}${(option.postReview?.remaining||[]).map(text=>`<p>残る目標：${esc(text)}</p>`).join('')}</div></section>`).join('')}${projection.options.length?'':'<p>安全に紹介できる交換案を確定していません。下の理由は所持不足や購入必須とは別です。</p>'}${projection.diagnostics.map(row=>`<p data-hd-oc-soft-diagnostic data-hd-oc-soft-status="${esc(row.status)}" data-hd-oc-soft-reason="${esc(row.reason)}">${Object.hasOwn(recipeLabels,row.recipeId)?esc(recipeLabels[row.recipeId])+'：':''}${esc(reasons[row.reason]||'条件と装備情報を確認してください。')}${row.labels.length?' '+row.labels.map(esc).join('・'):''}</p>`).join('')}<small>表示は確認した通常枠の交換案で、増設の別構成や未確認の組合せは残ります。現在の所持品・他の目標との競合を再確認してください。追加数はこの任意案を選ぶ場合だけの差で、全体の確定調達数ではありません。保存・調達への自動反映は行いません。</small></div>`;
}
function hdOCSurfaceNightTargets(plan,goal,stock){
 const paths={'5-1':'BCFJ','7-3':'ACE','7-4':'ABEJLP'},specs={'night-main':{parts:['nightMain','nightMain','nightMain'],attack:'main'},'night-main-secondary':{parts:['nightMain','nightMain','nightSecondary'],attack:'main-secondary'},'night-mixed':{parts:['nightMain','nightTorpedo'],attack:'mixed'}},recipe=stock?.recipe;
 if(!Object.hasOwn(paths,plan?.map)||goal?.kind!=='cap-night-auto'||goal.generatedFromMap!==true||goal.purpose!=='recommendation'||!recipe||!Object.hasOwn(specs,recipe.id))return null;
 const spec=specs[recipe.id],contract=hdFERouteRequirementData(plan);
 if(contract?.map!==plan.map||contract.index!==0||contract.path!==paths[plan.map]||plan.routeIndex!=null&&plan.routeIndex!==0||recipe.ship!=='night-surface'||recipe.attack!==spec.attack||typeof recipe.name!=='string'||!recipe.name||!Array.isArray(recipe.parts)||recipe.parts.length!==spec.parts.length||spec.parts.some((part,i)=>recipe.parts[i]!==part))return null;
 const catalog=typeof hdFLCatalog==='function'?hdFLCatalog():[],partInfo=typeof HD_SE_PARTS==='undefined'?null:HD_SE_PARTS;
 return (plan.ships||[]).flatMap((ship,shipIndex)=>{
  const row=(status,reason,parts=[])=>({ship:ship.ship,shipIndex,placementScope:'surface-night',recipeId:recipe.id,recipeName:recipe.name,status,reason,parts}),db=hdFEFindShip(ship.ship);
  if(!db)return [row('manual','hull-unknown')];
  const profile=hdShipDbSlotProfile(db),master=hdShipDbMasterRowFor(db),masterId=Number(master?.id),suppliedId=Number(ship.masterId),profileId=Number(profile?.id);
  if(!profile||!Number.isInteger(profile.count)||profile.count<0||!Array.isArray(profile.slots)||profile.slots.length!==profile.count)return [row('manual','profile-unknown')];
  if(!Number.isInteger(masterId)||masterId<=0||!Number.isInteger(profileId)||profileId<=0)return [row('manual','identity-unknown')];
  if(profileId!==masterId||suppliedId>0&&suppliedId!==masterId)return [row('manual','identity-mismatch')];
  const eligibility=hdSENightRecipeState({...ship,items:[],expansion:null},recipe);
  if(eligibility?.attack==='unsupported')return [row('blocked','model-unsupported')];
  const state=hdSENightRecipeState(ship,recipe);
  if(!eligibility||eligibility.status==='manual'||!state||state.status==='manual'||!hdSERecipeAllows(recipe,ship))return [row('manual','eligibility-unknown')];
  if(hdSENightStateReady(state,recipe))return [];
  if(profile.count<spec.parts.length)return [row('blocked','normal-slot-count')];
  if(!Array.isArray(catalog)||!partInfo||spec.parts.some(part=>typeof partInfo[part]?.label!=='string'||!partInfo[part].label))return [row('manual','catalogue-unknown')];
  const rows=spec.parts.map(part=>{
   const items=catalog.filter(item=>hdSEPartMatches(part,item)),slots=[];let unknown=!items.length;
   for(let index=0;index<profile.count;index++){
    const slot={si:shipIndex,index,db,profile,capacity:profile.slots[index]},candidates=[];
    for(const item of items){if(hdOCCompatible(slot,{item,star:0}))candidates.push(item.name);else if(hdShipDbMasterCompatible(item,db)===null&&!hdShipDbSlotRejects(profile,index,item))unknown=true;}
    if(candidates.length)slots.push({index,candidates:candidates.slice(0,3)});
   }
   return {part,label:partInfo[part].label,slots,unknown,catalogueMissing:!items.length};
  });
  const supported=rows.map(()=>new Set()),assign=(part,used=[])=>{
   if(part===rows.length){used.forEach((index,i)=>supported[i].add(index));return;}
   for(const slot of rows[part].slots)if(!used.includes(slot.index))assign(part+1,[...used,slot.index]);
  };assign(0);
  if(!supported[0].size){
   if(rows.some(part=>!part.slots.length&&!part.unknown))return [row('blocked','equipment-incompatible')];
   if(rows.some(part=>part.catalogueMissing))return [row('manual','catalogue-unknown')];
   if(rows.some(part=>part.unknown))return [row('manual','compatibility-unknown')];
   return [row('blocked','slot-conflict')];
  }
  const grouped=new Map();rows.forEach((part,i)=>{if(!grouped.has(part.part))grouped.set(part.part,{part:part.part,count:0,label:part.label,slots:[]});const group=grouped.get(part.part);group.count++;for(const slot of part.slots)if(supported[i].has(slot.index)&&!group.slots.some(x=>x.index===slot.index))group.slots.push({index:slot.index,candidates:slot.candidates.slice()});});
  return [row('candidate','candidate',[...grouped.values()])];
 });
}
function hdOCFiveOneNightTargets(plan,goal,stock){
 const contract=plan?.map==='5-1'||plan?.map==='7-3'||plan?.map==='7-4'?hdFERouteRequirementData(plan):null;
 if(!(plan?.map==='5-1'&&contract?.path==='BCFJ'||plan?.map==='7-3'&&contract?.map==='7-3'&&contract.index===0&&contract.path==='ACE'||plan?.map==='7-4'&&contract?.map==='7-4'&&contract.index===0&&contract.path==='ABEJLP')||goal?.kind!=='cap-night-auto'||plan?.map==='7-4'&&goal.generatedFromMap!==true||!goal.generatedFromMap||goal.purpose!=='recommendation'||stock?.recipe?.id!=='night-torpedo'||stock.recipe.parts?.length!==2||!stock.recipe.parts.every(x=>x==='nightTorpedo'))return null;
 const catalog=hdFLCatalog().filter(item=>hdSEPartMatches('nightTorpedo',item));
 return (plan.ships||[]).flatMap((ship,shipIndex)=>{
  const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);
  if(!db||!profile||!Number.isInteger(profile.count)||profile.count<0)return [{ship:ship.ship,shipIndex,status:'manual',count:2,slots:[]}];
  if(!hdSERecipeAllows(stock.recipe,ship)||hdSENightRecipeReady(ship,stock.recipe))return [];
  const slots=Array.from({length:profile.count},(_,index)=>{const slot={si:shipIndex,index,db,profile,capacity:profile.slots?.[index]},candidates=catalog.filter(item=>hdOCCompatible(slot,{item,star:0})).slice(0,3).map(item=>item.name);return {index,candidates}}).filter(slot=>slot.candidates.length);
  return slots.length>=2?[{ship:ship.ship,shipIndex,status:'candidate',count:2,slots}]:[];
 });
}
// The selected submarine CI recipe is one recommended equipment example.
// Its two parts must fit distinct legal normal slots on the same submarine.
function hdOCSixOneNightTargets(plan,goal,stock){
 const parts=({'sub-radar':['nightSubLate','nightSubRadar'],'sub-late':['nightSubLate','nightSubLate'],'sub-torpedo':['nightSubNormal','nightTorpedo']})[stock?.recipe?.id];
 if(plan?.map!=='6-1'||hdFERouteRequirementData(plan)?.path!=='AFGHK'||goal?.kind!=='cap-night-auto'||!goal.generatedFromMap||goal.purpose!=='recommendation'||stock?.recipe?.ship!=='night-sub'||!parts||stock.recipe.parts?.length!==2||parts.some((part,i)=>stock.recipe.parts[i]!==part))return null;
 const catalog=hdFLCatalog();
 return (plan.ships||[]).flatMap((ship,shipIndex)=>{
  const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);
  if(db&&!['潜水艦','潜水空母'].includes(db.type))return [];
  if(!db||!profile||!Number.isInteger(profile.count)||profile.count<0||!hdSERecipeAllows(stock.recipe,ship))return [{ship:ship.ship,shipIndex,status:'manual',parts:[]}];
  if(hdSENightRecipeReady(ship,stock.recipe))return [];
  const rows=parts.map(part=>({part,count:1,label:HD_SE_PARTS[part].label,slots:Array.from({length:profile.count},(_,index)=>{
   const slot={si:shipIndex,index,db,profile,capacity:profile.slots?.[index]},candidates=catalog.filter(item=>hdSEPartMatches(part,item)&&hdOCCompatible(slot,{item,star:0})).slice(0,3).map(item=>item.name);
   return {index,candidates};
  }).filter(slot=>slot.candidates.length)}));
  const candidate=rows[0].slots.some(a=>rows[1].slots.some(b=>a.index!==b.index));
  const original=rows.map(row=>row.slots);for(let i=0;i<rows.length;i++)rows[i].slots=original[i].filter(a=>original[1-i].some(b=>a.index!==b.index));
  if(!candidate)return [];
  return [{ship:ship.ship,shipIndex,status:'candidate',parts:parts[0]===parts[1]?[{...rows[0],count:2}]:rows}];
 });
}
// 6-3's generated water-bomber target is an optional combat equipment example.
// Resource reconnaissance success and the H route-scoring threshold are separate.
function hdOCSixThreeWaterTargets(plan,goal){
 const oneFiveContract=plan?.map==='1-5'?hdFERouteRequirementData(plan):null,oneFive=plan?.map==='1-5'&&oneFiveContract?.map==='1-5'&&oneFiveContract.index===1&&oneFiveContract.path==='ADFGJ';
 if(oneFive){if(goal?.kind!=='cap-water-attack'||goal.generatedFromMap!==true||goal.purpose!=='recommendation')return null}
 else if(plan?.map!=='6-3'||hdFERouteRequirementData(plan)?.path!=='ACEGHJ'||goal?.kind!=='cap-water-attack'||!goal.generatedFromMap||goal.purpose!=='recommendation')return null;
 const catalog=hdFLCatalog().filter(item=>hdSEPartMatches('waterAttackPlane',item));
 return (plan.ships||[]).flatMap((ship,shipIndex)=>{
  const db=hdFEFindShip(ship.ship);if(db?.type!==(oneFive?'航空戦艦':'水上機母艦')||hdSECapabilityMeasure({ships:[ship]},goal.kind).count>0)return [];
  const profile=hdShipDbSlotProfile(db),valid=!!profile&&Number.isInteger(profile.count)&&profile.count>=0&&Array.isArray(profile.slots),slots=[];let unknownSlots=!valid;
  if(valid)for(let index=0;index<profile.count;index++){
   const capacity=profile.slots[index];if(!Number.isFinite(capacity)||capacity<0){unknownSlots=true;continue}if(capacity===0)continue;
   const slot={si:shipIndex,index,db,profile,capacity},candidates=catalog.filter(item=>hdOCCompatible(slot,{item,star:0})).slice(0,3).map(item=>item.name);
   if(candidates.length)slots.push({index,candidates});
  }
  return [{ship:ship.ship,shipIndex,count:1,status:slots.length?'candidate':unknownSlots?'manual':'blocked',slots,unknownSlots}];
 });
}
// One selected mixed-installation recipe, on one hull and distinct normal slots.
// This is a catalog exchange example, not route equipment or a damage guarantee.
function hdOCSixFourLandTargets(plan,goal,stock){
 const parts=({'tank-amphibious':['tank','amphibious'],'tank-rocket':['tank','rocket']})[stock?.recipe?.id],contract=['6-4','7-5'].includes(plan?.map)?hdFERouteRequirementData(plan):null,sevenFiveSecond=plan?.map==='7-5'&&contract?.map==='7-5'&&contract.index===1&&contract.path==='ABDFJOQ';
 if(!(plan?.map==='6-4'&&contract?.path==='BDCFN'||sevenFiveSecond)||goal?.kind!=='cap-land-mixed'||sevenFiveSecond&&goal.generatedFromMap!==true||!goal.generatedFromMap||goal.purpose!=='recommendation'||!parts||stock.recipe.parts?.length!==2||parts.some((part,i)=>stock.recipe.parts[i]!==part))return null;
 const examples=Object.fromEntries(parts.map(part=>[part,HD_SE_PARTS[part].examples.map(name=>hdFEFind(name)).filter(Boolean)]));
 return (plan.ships||[]).flatMap((ship,shipIndex)=>{
  const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);
  if(!db||!profile||!Number.isInteger(profile.count)||profile.count<0)return [{ship:ship.ship,shipIndex,status:'manual',parts:[]}];
  const rows=parts.map(part=>({part,count:1,label:HD_SE_PARTS[part].label,slots:Array.from({length:profile.count},(_,index)=>{
   const slot={si:shipIndex,index,db,profile,capacity:profile.slots?.[index]},candidates=examples[part].filter(item=>hdOCCompatible(slot,{item,star:0})).slice(0,3).map(item=>item.name);
   return {index,candidates};
  }).filter(slot=>slot.candidates.length)}));
  const candidate=rows[0].slots.some(a=>rows[1].slots.some(b=>a.index!==b.index));
  if(!candidate)return rows.some(row=>row.slots.length)||profile.count<2?[{ship:ship.ship,shipIndex,status:'blocked',parts:[]}]:[];
  const original=rows.map(row=>row.slots);for(let i=0;i<rows.length;i++)rows[i].slots=original[i].filter(a=>original[1-i].some(b=>a.index!==b.index));
  return [{ship:ship.ship,shipIndex,status:'candidate',parts:rows}];
 });
}
// The selected PT recipe remains the existing generic comparison. This catalog
// inspection proves only a legal three-normal-slot alternative on one hull.
function hdOCSevenFiveSecondPTTargets(plan,goal,stock){
 const contract=plan?.map==='7-5'?hdFERouteRequirementData(plan):null,parts=({'pt-surface-lookout':['nightSecondary','ptMachineGun','nightLookout'],'pt-surface-water':['nightSecondary','ptMachineGun','ptWaterAir']})[stock?.recipe?.id];
 if(contract?.map!=='7-5'||contract.index!==1||contract.path!=='ABDFJOQ'||goal?.kind!=='cap-pt'||goal.generatedFromMap!==true||goal.purpose!=='recommendation'||stock?.recipe?.ship!=='pt-surface'||!parts||stock.recipe.parts?.length!==3||parts.some((part,i)=>stock.recipe.parts[i]!==part))return null;
 const catalog=hdFLCatalog();
 return (plan.ships||[]).flatMap((ship,shipIndex)=>{
  const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);
  if(!db||!profile||!Number.isInteger(profile.count)||profile.count<0||!Array.isArray(profile.slots))return [{ship:ship.ship,shipIndex,status:'manual',parts:[]}];
  if(!hdSERecipeAllows(stock.recipe,ship))return [];
  const rows=parts.map(part=>({part,count:1,label:HD_SE_PARTS[part].label,slots:Array.from({length:profile.count},(_,index)=>{
   const capacity=profile.slots[index],slot={si:shipIndex,index,db,profile,capacity},candidates=part==='ptWaterAir'&&!(Number(capacity)>0)?[]:catalog.filter(item=>hdSEPartMatches(part,item)&&hdOCCompatible(slot,{item,star:0})).slice(0,3).map(item=>item.name);
   return {index,candidates};
  }).filter(slot=>slot.candidates.length)}));
  // Pairwise room is insufficient for three parts. Retain only edges that
  // participate in a complete assignment of three distinct normal frames.
  const supported=rows.map(()=>new Set()),choose=(part,used=[])=>{
   if(part===rows.length){used.forEach((index,i)=>supported[i].add(index));return;}
   for(const slot of rows[part].slots)if(!used.includes(slot.index))choose(part+1,[...used,slot.index]);
  };choose(0);
  if(!supported[0].size)return [{ship:ship.ship,shipIndex,status:'blocked',parts:[]}];
  rows.forEach((row,i)=>row.slots=row.slots.filter(slot=>supported[i].has(slot.index)));
  return [{ship:ship.ship,shipIndex,status:'candidate',parts:rows}];
 });
}
function hdOCPlacementInfo(kind,inventory,slots,catalog){
 const owned=inventory.filter(x=>hdOCItemMatches(kind,x)),usable=owned.filter(x=>slots.some(slot=>hdOCCompatible(slot,x)));
 const blocked=owned.filter(x=>!usable.includes(x)).map(x=>({name:x.name,star:x.star,count:x.count}));
 // This is an upper bound: different targets may compete for the same slot.
 const compatibleSlots=slots.filter(slot=>catalog.some(item=>hdOCItemMatches(kind,item)&&hdOCCompatible(slot,{item,star:0}))||usable.some(x=>hdOCCompatible(slot,x))).length;
 return {usableOwned:usable.reduce((n,x)=>n+x.count,0),compatibleSlots,blocked};
}
// FGK's numeric route threshold is independent of the generic equipment-count
// recommendation. These are inspection candidates, never solved allocations.
// Generic item-count advice is separate from mandatory equipped-ship goals.
function hdOCRadarCountOptional(c,goal){
 if(c?.map!=='3-2'||!Number.isInteger(c.index)||![0,1].includes(c.index)||goal?.kind!=='電探'||(goal.goalKind||goal.kind)!=='電探'||goal.routeEquipment===true||goal.generatedFromMap!==true||goal.purpose!=='recommendation'||goal.minCount!==1)return false;
 try{
  if(typeof MAP_PLANS==='undefined'||typeof hdMapPresetRequirements!=='function'||!c.preset)return false;
  const canonical=MAP_PLANS[c.map]?.presets?.[c.index];if(!canonical)return false;
  for(const key of ['name','ships','gear','use','source','flagship'])if(c.preset[key]!==canonical[key])return false;
  const route=hdMapPresetRequirements(c.map,c.preset);return route?.map===c.map&&route.index===c.index&&route.path==='選択したC…L目標'&&route.engine==='verified-graph'&&route.equipmentKinds?.includes('電探')===true;
 }catch{return false;}
}
function hdOCRadarCountInspection(c,result){
 const goal=result?.measure?.goals?.find(row=>hdOCRadarCountOptional(c,row));
 if(!result?.plan||!goal)return null;
 const plan=result.plan,contract=hdFERouteRequirementData(plan);
 if(plan.map!==c.map||contract?.map!==c.map||contract.index!==c.index||contract.path!=='選択したC…L目標'||contract.engine!=='verified-graph')return null;
 // Build only a new readonly view of the delivered hulls. Keep the original
 // context, result, assignment, goals, inventory and persistent values intact.
 const fleet={...c.fleet,ships:(plan.ships||[]).map(ship=>{const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);return {ship:ship.ship,rosterId:ship.rosterId||'',gameShipId:ship.gameShipId||0,masterId:ship.masterId||0,gear:db&&!profile?'':hdOCShipGear(ship)};})},built=hdOCBuild({...c,fleet}),inventory=built.inventory,slots=built.slots,used=hdFOAssignedUsage(plan),unconfirmedHulls=(plan.ships||[]).filter(ship=>{const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db),master=db&&hdShipDbMasterRowFor(db);return !profile||!master||!Number.isInteger(profile.count)||profile.count<0||!Array.isArray(profile.slots)||profile.count!==profile.slots.length||profile.count!==(master.slots||[]).length||Number(profile.id)!==Number(master.id)||Number(ship.masterId)&&Number(ship.masterId)!==Number(master.id);}),unknown=[...new Set([...built.unknown,...unconfirmedHulls.map(ship=>ship.ship+'：艦・通常枠の対応が未確認'),...(plan.preservationIssues||[]),...inventory.filter(row=>row.count>0&&!hdFEFind(row.name)).map(row=>'装備性能が未登録：'+row.name),...(plan.ships||[]).filter(ship=>hdFEExpansionAvailability(ship).status==='manual').map(ship=>ship.ship+'：増設の開放状態が未確認')])];
 const inspect=(entry,source)=>{
  const destinations=[];let unknownSlots=0,blockedSlots=0;
  for(const slot of slots){
   const ship=plan.ships[slot.si],master=hdShipDbMasterRowFor(slot.db),profile=slot.profile;
   if(!master||Number(profile?.id)!==Number(master.id)||Number(ship.masterId)&&Number(ship.masterId)!==Number(master.id)||!Array.isArray(profile?.slots)||profile.count!==profile.slots.length||profile.count!==(master.slots||[]).length){unknownSlots++;continue;}
   if(slot.expansion){
    if(hdFEExpansionAvailability(ship).status!=='ready'||!hdShipDbMasterMeta(entry.item)){unknownSlots++;continue;}
    if(!hdShipDbExpansionInfo(entry.item,slot.db,entry.star).allowed){blockedSlots++;continue;}
   }else{const normal=hdShipDbMasterCompatible(entry.item,slot.db);if(normal===null){unknownSlots++;continue;}if(!normal){blockedSlots++;continue;}}
   // Radar is non-aircraft. Zero aircraft capacity is not a rejection reason.
   if(!hdOCCompatible(slot,entry)){blockedSlots++;continue;}
   const item=slot.expansion?ship.expansion:(ship.items||[]).find(row=>row.slotIndex===slot.index),current=item?.name?{name:item.name,star:Number(item.star)||0}:null;
   destinations.push({shipIndex:slot.si,ship:ship.ship,slotIndex:slot.index,expansion:slot.expansion===true,current,mode:current?hdFOStackKey(current)===entry.key?'same':'replace':'empty'});
  }
  const registered=source==='registered'?entry.count:0,assigned=used[entry.key]||0,status=destinations.length?'candidate':unknownSlots||unknown.length?'manual':'blocked';
  return {source,name:entry.name,star:entry.star,registered,assigned,unused:Math.max(0,registered-assigned),countsTowardRequiredShips:/電探/.test(entry.item?.category||''),status,reason:status==='candidate'?'confirmed-slot':status==='manual'?'slot-information-unknown':'equipment-incompatible',unknownSlots,blockedSlots,destinations};
 };
 const all=inventory.filter(row=>row.count>0&&hdOCItemMatches('電探',row)).sort((a,b)=>Number((used[b.key]||0)>0)-Number((used[a.key]||0)>0)),limit=12,rows=all.slice(0,limit).map(row=>inspect(row,'registered'));
 const currentAll=(plan.ships||[]).flatMap((ship,shipIndex)=>[...(ship.items||[]).map(item=>({item,expansion:false})),...(ship.expansion?[{item:ship.expansion,expansion:true}]:[])].flatMap(({item,expansion})=>{
  const meta=hdFEFind(item.name);if(!meta||!hdOCItemMatches('電探',meta))return [];
  const key=hdFOStackKey(item);return [{shipIndex,ship:ship.ship,slotIndex:expansion?null:Number.isInteger(item.slotIndex)?item.slotIndex:null,expansion,name:item.name,star:Number(item.star)||0,registered:inventory.find(row=>row.key===key)?.count||0,assigned:used[key]||0}];
 }));
 const registeredNames=new Set(inventory.filter(row=>row.count>0).map(row=>hdFLNorm(row.item?.name||row.name))),currentNames=new Set(currentAll.map(row=>hdFLNorm(row.name))),catalog=hdFLCatalog().filter(item=>hdOCItemMatches('電探',item)),shortage=result.shortages?.find(row=>row.kind==='電探'&&row.goalKind==='電探'),preferred=(shortage?.candidates||[]).map(name=>catalog.find(item=>hdFLNorm(item.name)===hdFLNorm(name))).filter(Boolean),seen=new Set(),pool=[...preferred,...catalog].filter(item=>{const key=hdFLNorm(item.name);if(seen.has(key)||registeredNames.has(key)||currentNames.has(key))return false;seen.add(key);return true;}),scanned=pool.slice(0,12).map(item=>inspect({name:item.name,star:0,key:hdFLInventoryStackKey(item.name,0),item},'catalog'));
 scanned.sort((a,b)=>({candidate:0,manual:1,blocked:2}[a.status])-({candidate:0,manual:1,blocked:2}[b.status]));
 const branch=hdFEBranchRoute(plan),required=(result.measure.goals||[]).find(row=>row.kind==='radar-ships');
 return {scope:'owned-radar-count-inspection',map:c.map,index:c.index,path:branch.path||contract.path,routeGoal:branch.goal||plan.routeGoal,rows,catalogExamples:scanned.slice(0,3),currentRadars:currentAll.slice(0,32),unknown,unconfirmedHullCount:unconfirmedHulls.length,remaining:Math.max(0,all.length-limit),currentRemaining:Math.max(0,currentAll.length-32),catalogueLimited:pool.length>12||scanned.length>3,catalogueScanned:Math.min(12,pool.length),assessment:{optionalCount:goal.count,optionalMin:goal.minCount,requiredRadarShips:Number(branch.requiredRadar)||0,requiredRadarDetail:required?.detail||(branch.goal==='normal'?'選択中の通常目標に必須の電探装備艦数はありません。実際の速力・電探による分岐先は別に判定します。':'選択目標の必須電探装備艦数は未確認です。登録済みの目標と分岐判定を確認してください。'),speedTarget:result.measure.speedTarget||0,branchStatus:branch.status,branchDetail:branch.detail}};
}
function hdOCRadarCountInspectionHtml(view){
 if(view?.scope!=='owned-radar-count-inspection')return '';
 const esc=hdFEEsc,label=item=>item.name+(item.star?' ★'+item.star:''),renderRows=(rows,source)=>rows.map((row,i)=>`<li data-hd-oc-radar-count-row="${i}" data-hd-oc-radar-count-source="${source}" data-hd-oc-radar-count-status="${row.status}" data-hd-oc-radar-count-reason="${row.reason}"><b>${esc(label(row))}</b>：${source==='catalog'?'台帳登録なし（非所持を確認した値ではありません）':`登録${row.registered}個 / 現在案${row.assigned}個 / 未使用${row.unused}個`}。${row.destinations.length?`<ul>${row.destinations.map(target=>`<li data-hd-oc-radar-count-destination data-hd-oc-radar-count-mode="${target.mode}">第${target.shipIndex+1}艦 ${esc(target.ship)} / ${target.expansion?'開放確認済み増設':'通常第'+(target.slotIndex+1)+'枠'}：${target.mode==='empty'?'空き枠への配置を検討':`現在 ${esc(label(target.current))}（${target.mode==='same'?'この枠の同じ装備を継続':'現在装備との交換対象・条件維持は未評価'}）`}</li>`).join('')}</ul>`:`<p>${row.status==='manual'?'艦・枠・装備・増設開放の情報が足りず、搭載先は未確認です。':'確認した通常枠・開放済み増設の艦別装備条件では、この装備の搭載先がありません。'}登録数の不足や追加購入の必要とは区別してください。</p>`}${row.unknownSlots?`<small>別に${row.unknownSlots}枠の搭載可否が未確認です。</small>`:''}${row.assigned>row.registered?'<small>現在案の使用数と登録数の対応を確認してください。</small>':''}</li>`).join('');
 return `<section data-hd-oc-radar-count-inspection><b>手持ちから検討する電探と搭載先</b><p>対象：${esc(view.path)}。任意の装備個数目安は配備${view.assessment.optionalCount} / 目安${view.assessment.optionalMin}個で、通行の必須個数や確定調達数ではありません。</p><p data-hd-oc-radar-count-required>${esc(view.assessment.requiredRadarDetail)}。現在案の判定の引用で、交換後の条件ではありません。電探の個数と電探装備艦の隻数は別です。同じ艦の複数電探を複数艦に数えません。</p><p data-hd-oc-radar-count-route>現在案の分岐判定：${esc(view.assessment.branchDetail)}。選択中の速力目標は${view.assessment.speedTarget?esc(hdFESpeedLabel(view.assessment.speedTarget))+'以上':view.routeGoal==='normal'?'必須指定なし':'未確認'}です。通常のH許容、H回避の高速＋以上・電探1艦、最速CEFLの最速・電探4艦を同じ条件へ置き換えません。先行する艦種・隻数条件、E/Gのランダム分岐、未確認理由も元の判定を確認してください。</p><div data-hd-oc-radar-count-current><b>現在案に配備した電探</b>${view.currentRadars.length?`<ul>${view.currentRadars.map(item=>`<li>第${item.shipIndex+1}艦 ${esc(item.ship)} / ${item.expansion?'増設':item.slotIndex==null?'通常枠未確認':'通常第'+(item.slotIndex+1)+'枠'}：${esc(label(item))}</li>`).join('')}</ul>`:'<p>現在案に確認できる電探はありません。情報未登録を、実際の非配備とは断定しません。</p>'}${view.currentRemaining?`<small>現在配備の表示は32件まで（残り${view.currentRemaining}件）。</small>`:''}</div><div data-hd-oc-radar-count-registered><b>登録在庫からの検討</b>${view.rows.length?`<ul>${renderRows(view.rows,'registered')}</ul>`:'<p>電探として確認できる登録装備がありません。登録なし・性能未登録を、手持ちでは不可能という判定へ変換しません。</p>'}${view.remaining?`<small>登録品は現在案で使う装備を優先した改修別12件まで（残り${view.remaining}件）。</small>`:''}</div><div data-hd-oc-radar-count-catalog><b>登録のないカタログ例（最大3種類）</b>${view.catalogExamples.length?`<ul>${renderRows(view.catalogExamples,'catalog')}</ul>`:'<p>この確認範囲で表示できるカタログ例はありません。全候補の不存在や購入の必要を示しません。</p>'}<small>登録なしは台帳との照合で、ゲーム内の非所持を確認した値ではありません。入手・購入の推奨や確定数量ではありません。カタログは最大12種類を確認し、最大3種類だけを表示します。${view.catalogueLimited?'未表示・未確認の候補が残ります。':''}</small></div>${view.unknown.length?'<p>元の艦・装備・増設情報に未確認が残ります。他の艦で確認できた搭載先や既知の条件不一致とは分けて判断してください。</p>':''}<p>通常枠の航空機搭載数0は、非航空機の電探を排除する理由ではありません。増設は実際の開放と、その艦・装備・改修値の許可を確認できた枠だけを表示しています。</p><p>未使用数は現在案との差です。他艦から移す場合も同じ装備を二重使用できず、各候補は缶・タービン、固定装備や他目標と枠を共用します。空き枠と現在装備の交換対象を分けていますが、全候補の同時配備、交換後の速力・必須電探装備艦数・索敵等の条件や利用者指定目標を保つ交換案は計算していません。装備できる枠数を必須の別艦数へ換算しません。</p><p>装備個数だけで経路成立、索敵値、勝利や購入必須を判断しません。表示だけで配備・元目標・保存編成を変更せず、交換を自動適用しません。変更した配備で既存条件を再確認してください。</p></section>`;
}

function hdOCScoutingInspection(c,result){
 const index=c?.index,paths={'2-5':{0:'BFJO'},'3-5':{1:'BDHK'},'4-5':{1:'ADHKT / CDHKT'},'5-5':{1:'BFDHNOS'},'6-5':{0:'ACDGM',1:'BFIJM'}},path=Number.isInteger(index)?paths[c?.map]?.[index]:null,upperCentral=hdOCUpperCentralScoutingScope(c);
 if(!path||!result?.plan||!result?.measure||['3-5','5-5'].includes(c?.map)&&!upperCentral)return null;
 const plan=result.plan,contract=hdFERouteRequirementData(plan);
 if(plan.map!==c.map||contract?.map!==c.map||contract.index!==index||contract.path!==path||contract.los?.kind!=='required'||result.measure.scoutingExempt||hdFEScoutingExemption(plan,contract)?.status==='ready')return null;
 // Inspect delivered hulls in a separate view. Candidate destinations are not
 // computed exchanges and never change assignments, targets or saved values.
 const fleet={...c.fleet,ships:(plan.ships||[]).map(ship=>{const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);return {ship:ship.ship,rosterId:ship.rosterId||'',gameShipId:ship.gameShipId||0,masterId:ship.masterId||0,gear:db&&!profile?'':hdOCShipGear(ship)};})},built=hdOCBuild({...c,fleet}),inventory=built.inventory,slots=built.slots,used=hdFOAssignedUsage(plan),additionalUnknown=upperCentral?[...(plan.ships||[]).filter(ship=>{const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db),master=db&&hdShipDbMasterRowFor(db);return !profile||!master||!Number.isInteger(profile.count)||profile.count<0||!Array.isArray(profile.slots)||profile.count!==profile.slots.length||profile.count!==(master.slots||[]).length||Number(profile.id)!==Number(master.id)||Number(ship.masterId)&&Number(ship.masterId)!==Number(master.id);}).map(ship=>ship.ship+'：艦・通常枠の対応が未確認'),...(plan.ships||[]).filter(ship=>hdFEExpansionAvailability(ship).status==='manual').map(ship=>ship.ship+'：増設の開放状態が未確認'),...inventory.filter(row=>row.count>0&&!hdFEFind(row.name)).map(row=>'装備性能が未登録：'+row.name)]:[],unknown=[...new Set([...built.unknown,...(plan.preservationIssues||[]),...additionalUnknown])],all=inventory.filter(x=>x.count>0&&(upperCentral?hdOCItemMatches('索敵',x):Number(x.item?.stats?.索敵)>0)),limit=12;
 const inspect=(x,source='registered')=>{
  const destinations=[];let unknownSlots=0,blockedSlots=0;
  for(const slot of slots){
   const ship=plan.ships[slot.si],master=hdShipDbMasterRowFor(slot.db),profile=slot.profile;
   if(!master||Number(profile?.id)!==Number(master.id)||Number(ship.masterId)&&Number(ship.masterId)!==Number(master.id)||!Array.isArray(profile?.slots)||profile.count!==profile.slots.length||upperCentral&&(!Number.isInteger(profile.count)||profile.count<0||profile.count!==(master.slots||[]).length)){unknownSlots++;continue;}
   if(slot.expansion){if(!hdShipDbMasterMeta(x.item)||upperCentral&&hdFEExpansionAvailability(ship).status!=='ready'){unknownSlots++;continue;}if(upperCentral){const expansion=hdShipDbExpansionInfo(x.item,slot.db,x.star);if(expansion.allowed===false){blockedSlots++;continue;}if(expansion.allowed!==true){unknownSlots++;continue;}}}
   else{const normal=hdShipDbMasterCompatible(x.item,slot.db);if(upperCentral&&normal===false){blockedSlots++;continue;}if(normal===null||upperCentral&&normal!==true||normal&&HD_FE_AIR_CATS.has(x.item.category)&&!Number.isFinite(slot.capacity)){unknownSlots++;continue;}}
   // The existing combat-aircraft categories require positive known capacity.
   // Water reconnaissance fit is separate from aircraft remaining, launch and LOS.
   // A permitted reconnaissance item or radar is not rejected just for capacity0.
   if(upperCentral&&HD_FE_AIR_CATS.has(x.item.category)){if(!Number.isFinite(slot.capacity)||slot.capacity<0){unknownSlots++;continue;}if(slot.capacity===0){blockedSlots++;continue;}}
   if(!hdOCCompatible(slot,x)){blockedSlots++;continue;}
   const current=slot.expansion?ship.expansion:(ship.items||[]).find(item=>item.slotIndex===slot.index),value=current?.name?{name:current.name,star:Number(current.star)||0}:null;
   destinations.push({shipIndex:slot.si,ship:ship.ship,slotIndex:slot.index,expansion:slot.expansion===true,mode:value?hdFOStackKey(current)===x.key?'same':'replace':'empty',current:value});
  }
  const assigned=used[x.key]||0,registered=source==='catalog'?0:x.count,status=destinations.length?'candidate':unknownSlots||unknown.length?'manual':'blocked';
  return {name:x.name,star:x.star,registered,assigned,unused:Math.max(0,registered-assigned),status,unknownSlots,blockedSlots,destinations,...(upperCentral?{source,reason:status==='candidate'?'confirmed-slot':status==='manual'?'slot-information-unknown':'equipment-incompatible'}:{})};
 };
 const rows=all.slice(0,limit).map(x=>inspect(x));let catalogFields={};
 if(upperCentral){
  const catalog=hdFLCatalog().filter(item=>hdOCItemMatches('索敵',item)),shortage=result.shortages?.find(row=>row.kind==='索敵'&&row.goalKind==='索敵'),preferred=(shortage?.candidates||[]).map(name=>catalog.find(item=>hdFLNorm(item.name)===hdFLNorm(name))).filter(Boolean),registeredNames=new Set(inventory.filter(row=>row.count>0).map(row=>hdFLNorm(row.item?.name||row.name))),currentNames=new Set((plan.ships||[]).flatMap(ship=>[...(ship.items||[]),...(ship.expansion?[ship.expansion]:[])]).filter(item=>item.name).map(item=>hdFLNorm(item.name))),seen=new Set(),pool=[...preferred,...catalog].filter(item=>{const key=hdFLNorm(item.name);if(seen.has(key)||registeredNames.has(key)||currentNames.has(key))return false;seen.add(key);return true;}),scanned=pool.slice(0,12).map(item=>inspect({name:item.name,star:0,key:hdFLInventoryStackKey(item.name,0),item},'catalog'));
  scanned.sort((a,b)=>({candidate:0,manual:1,blocked:2}[a.status])-({candidate:0,manual:1,blocked:2}[b.status]));
  catalogFields={catalogExamples:scanned.slice(0,3),catalogueScanned:Math.min(12,pool.length),catalogueLimited:pool.length>12||scanned.length>3};
 }
 const numeric=(result.measure.goals||[]).find(goal=>goal.kind==='los-value'),manual=(result.measure.manual||[]).find(text=>text.startsWith('索敵：'));
 return {scope:'owned-scouting-inspection',map:c.map,index,path,rows,unknown,remaining:Math.max(0,all.length-limit),assessment:{status:numeric&&!numeric.unresolved&&Number.isFinite(numeric.count)?'current':'manual',detail:numeric?.detail||manual||'現在案の索敵判定は未確認です。'},...catalogFields};
}
function hdOCScoutingInspectionHtml(view){
 if(!view||view.scope!=='owned-scouting-inspection')return '';
 const esc=hdFEEsc,label=item=>item.name+(item.star?' ★'+item.star:'');
 const catalogHtml=Array.isArray(view.catalogExamples)?`<div data-hd-oc-scouting-catalog><b>登録のないカタログ例と搭載先（最大3種類）</b>${view.catalogExamples.length?`<ul>${view.catalogExamples.map((row,i)=>`<li data-hd-oc-scouting-catalog-row="${i}" data-hd-oc-scouting-status="${row.status}" data-hd-oc-scouting-reason="${row.reason}"><b>${esc(label(row))}</b>：台帳登録なし（非所持を確認した値ではありません）。${row.destinations.length?`搭載条件に合う検討先：<ul>${row.destinations.map(target=>`<li data-hd-oc-scouting-destination data-hd-oc-scouting-source="catalog" data-hd-oc-scouting-mode="${target.mode}">第${target.shipIndex+1}艦 ${esc(target.ship)} / ${target.expansion?'開放確認済み増設':'通常第'+(target.slotIndex+1)+'枠'}：${target.mode==='empty'?'空き枠への配置を検討':`現在 ${esc(label(target.current))}（${target.mode==='same'?'この枠の同じ装備を継続':'現在装備との交換対象・条件維持は未評価'}）`}</li>`).join('')}</ul>`:row.status==='manual'?'確認済み枠に候補はなく、艦・枠・装備・増設情報に未確認が残ります。搭載不可や在庫不足とは断定しません。':'確認した通常枠・開放確認済み増設には、搭載許可またはこの案内の種類別搭載数条件に合う検討先がありません。装備を増やすだけで解決する不足とは限りません。'}${row.unknownSlots?`<small>別に${row.unknownSlots}枠の搭載可否が未確認です。</small>`:''}</li>`).join('')}</ul>`:'<p>この確認範囲で表示できる例はありません。全候補の不存在や購入の必要を示しません。</p>'}<small>カタログは任意目安の対象装備から最大12種類を確認し、最大3種類だけを表示します。${view.catalogueLimited?'未表示・未確認の候補が残ります。':''}この表示上限は探索の打切りとは別です。登録なしは台帳との照合で、入手・購入の推奨や確定調達数ではありません。索敵装備の個数目安と、経路の数値索敵条件を同じ必要数へ置き換えません。</small><p>この案内では、制空・航空攻撃として扱う装備は正の搭載数を確認できる枠だけを候補にします。水上偵察機や電探は艦・枠の装備許可をもとに表示し、搭載数0だけでは候補から外しません。装備できることと、現在の残機・発進・索敵分岐の成立は別です。残機・発進や交換後の33式索敵値は確認していません。増設は実際の開放と艦・装備・改修値の許可を確認できる枠だけを表示します。現在装備、固定装備や他の必須条件と枠を共用し、全候補の同時配備や条件を保つ交換案は計算していません。交換後の索敵値・ボーナス差分・速力等の条件維持は未評価です。表示だけで元の目標や保存編成を変更せず、交換を自動適用しません。</p></div>`:'';
 return `<div data-hd-oc-scouting-options data-hd-oc-scouting-inspection><b>手持ちから検討する索敵装備の交換候補</b><p>対象：${esc(view.path)}。登録経路の数値索敵条件と、任意の索敵装備数の目安を分けて確認します。装備数だけで経路成立や購入必須を判断しません。</p><p data-hd-oc-scouting-current>${esc(view.assessment.detail)}。これは現在案の判定で、交換後の値ではありません。</p><p>交換後の索敵値は未計算です。艦固有ボーナス差分も未確認です。以下は搭載条件を確認するための検討先で、成立済みの条件や利用者指定目標を保つ交換案を計算したものではありません。</p>${view.rows.length?`<ul>${view.rows.map((row,i)=>`<li data-hd-oc-scouting-row="${i}" data-hd-oc-scouting-status="${row.status}"><b>${esc(label(row))}</b>：登録${row.registered}個 / 現在案${row.assigned}個 / 未使用${row.unused}個。${row.destinations.length?`搭載条件に合う検討先：<ul>${row.destinations.map(target=>`<li data-hd-oc-scouting-destination data-hd-oc-scouting-mode="${target.mode}">第${target.shipIndex+1}艦 ${esc(target.ship)} / ${target.expansion?'確認済み増設':'通常'+(target.slotIndex+1)}：${target.mode==='empty'?'空き枠（新しく置く場合の検討先）':`現在 ${esc(label(target.current))}（${target.mode==='same'?'同じ装備を配備済み':'交換対象。既存条件の維持は未確認'}）`}</li>`).join('')}</ul>`:row.status==='manual'?'確認済み枠に候補はなく、未確認の艦・枠が残ります。搭載不可や所持不足とは断定しません。':'確認済みの通常枠・開放確認済み増設枠に、この装備の搭載候補はありません。装備を増やすだけで解決する不足とは限りません。'}${row.unknownSlots?`<small>別に${row.unknownSlots}枠の搭載可否が未確認です。</small>`:''}${row.assigned>row.registered?'<small>現在案の使用数が登録数を超えています。所持数と配備を確認してください。</small>':''}</li>`).join('')}</ul>`:'<p>登録台帳から表示できる交換候補はありません。性能未登録の装備も含め、所持情報を確認してください。手持ちでは不可能という判定ではありません。</p>'}${view.remaining?`<small>表示は12種類まで（残り${view.remaining}種類）。探索の打切りとは別です。</small>`:''}${catalogHtml}${view.unknown.length?'<p>艦・装備情報が足りない箇所は未確認として残しています。他の艦で確認できた搭載先とは分けて判断してください。</p>':''}<p>未使用数は現在案との差です。他艦から移す場合も同じ装備を二重使用できません。枠は他の必須装備・目標と共用するため、各候補を同時に置けることや条件維持を保証しません。増設は開放と装備条件を確認できた枠だけを表示しています。不足欄のカタログ候補は未所持品を含みます。</p><p>下の「この配備で制空・索敵を確認」から、表示した艦・枠と交換対象を確認して試してください。手動編集後は入力を前提とする参考値で、攻略条件は未判定です。新しい配備での素索敵＋ボーナス・司令部Lv・改修値と、成立済み条件・利用者指定目標を確認してから再探索してください。交換候補や計算画面の編集を保存編成へ自動適用しません。</p></div>`;
}
function hdOCSouthScouting(c){return c?.map==='3-5'&&Number(c.index)===0}
function hdOCAirCountPath(map){
 const paths={'2-1':'C(E)DH','2-2':'CE(GH)K','2-3':'ボス方面・経路ランダム','2-4':'ボス方面・経路ランダム','3-3':'ACGM','3-4':'ACEGJP'};
 return Object.hasOwn(paths,map)?paths[map]:null;
}
function hdOCAirCountOptional(c,goal){
 const path=hdOCAirCountPath(c?.map);if(!path||c?.index!==0||goal?.kind!=='制空'||(goal.goalKind||goal.kind)!=='制空'||goal.generatedFromMap!==true||goal.purpose!=='recommendation'||goal.minCount!==2)return false;
 try{
  if(typeof MAP_PLANS==='undefined'||typeof hdMapPresetRequirements!=='function'||!c.preset)return false;
  const canonical=MAP_PLANS[c.map]?.presets?.[0];if(!canonical)return false;
  for(const key of ['name','ships','gear','use','source','flagship'])if(c.preset[key]!==canonical[key])return false;
  const route=hdMapPresetRequirements(c.map,c.preset);return route?.map===c.map&&route.index===0&&route.path===path&&route.equipmentKinds?.includes('制空')===true;
 }catch{return false;}
}
function hdOCAirCountInspection(c,result){
 const goal=result?.measure?.goals?.find(row=>row.kind==='制空'&&row.generatedFromMap===true&&row.purpose==='recommendation');
 if(!result?.plan||!goal||!hdOCAirCountOptional(c,goal))return null;
 const plan=result.plan,contract=hdFERouteRequirementData(plan),path=hdOCAirCountPath(c.map);
 if(plan.map!==c.map||contract?.map!==c.map||contract.index!==0||contract.path!==path)return null;
 // Reuse the existing readonly build against delivered hulls, including an
 // alternative proposal. Do not change the original fleet, result, or stock.
 const fleet={...c.fleet,ships:(plan.ships||[]).map(ship=>{const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);return {ship:ship.ship,rosterId:ship.rosterId||'',gameShipId:ship.gameShipId||0,masterId:ship.masterId||0,gear:db&&!profile?'':hdOCShipGear(ship)};})},built=hdOCBuild({...c,fleet}),inventory=built.inventory,slots=built.slots,used=hdFOAssignedUsage(plan),unconfirmedHulls=(plan.ships||[]).filter(ship=>{const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db),master=db&&hdShipDbMasterRowFor(db);return !profile||!master||!Number.isInteger(profile.count)||profile.count<0||!Array.isArray(profile.slots)||profile.count!==profile.slots.length||profile.count!==(master.slots||[]).length||Number(profile.id)!==Number(master.id)||Number(ship.masterId)&&Number(ship.masterId)!==Number(master.id);}),unknown=[...new Set([...built.unknown,...unconfirmedHulls.map(ship=>ship.ship+'：艦・通常枠の対応が未確認'),...(plan.preservationIssues||[]),...inventory.filter(row=>row.count>0&&!hdFEFind(row.name)).map(row=>'装備性能が未登録：'+row.name)])];
 const inspect=(entry,source)=>{
  const destinations=[];let unknownSlots=0,blockedSlots=0,permitted=0,positive=0;
  for(const slot of slots){
   const ship=plan.ships[slot.si],master=hdShipDbMasterRowFor(slot.db),profile=slot.profile;
   if(!master||Number(profile?.id)!==Number(master.id)||Number(ship.masterId)&&Number(ship.masterId)!==Number(master.id)||!Array.isArray(profile?.slots)||profile.count!==profile.slots.length||profile.count!==(master.slots||[]).length){unknownSlots++;continue;}
   if(slot.expansion){if(!hdShipDbMasterMeta(entry.item)){unknownSlots++;continue;}if(!hdShipDbExpansionInfo(entry.item,slot.db,entry.star).allowed){blockedSlots++;continue;}}
   else{const normal=hdShipDbMasterCompatible(entry.item,slot.db);if(normal===null){unknownSlots++;continue;}if(!normal){blockedSlots++;continue;}}
   permitted++;
   if(!Number.isFinite(slot.capacity)||slot.capacity<0){unknownSlots++;continue;}
   if(slot.capacity===0){blockedSlots++;continue;}positive++;
   if(!hdOCCompatible(slot,entry)){blockedSlots++;continue;}
   const item=slot.expansion?ship.expansion:(ship.items||[]).find(row=>row.slotIndex===slot.index),current=item?.name?{name:item.name,star:Number(item.star)||0}:null;
   destinations.push({shipIndex:slot.si,ship:ship.ship,slotIndex:slot.index,expansion:slot.expansion===true,capacity:slot.capacity,current,mode:current?hdFOStackKey(current)===entry.key?'same':'replace':'empty'});
  }
  const registered=source==='registered'?entry.count:0,assigned=used[entry.key]||0,status=destinations.length?'candidate':unknownSlots||unconfirmedHulls.length?'manual':'blocked',reason=status==='candidate'?'confirmed-slot':status==='manual'?'slot-information-unknown':positive?'slot-restricted':permitted?'no-positive-capacity':'equipment-incompatible';
  return {source,name:entry.name,star:entry.star,registered,assigned,unused:Math.max(0,registered-assigned),status,reason,unknownSlots,blockedSlots,destinations};
 };
 const all=inventory.filter(row=>row.count>0&&hdOCItemMatches('制空',row)).sort((a,b)=>Number((used[b.key]||0)>0)-Number((used[a.key]||0)>0)),limit=12,rows=all.slice(0,limit).map(row=>inspect(row,'registered'));
 const currentAll=(plan.ships||[]).flatMap((ship,shipIndex)=>[...(ship.items||[]).map(item=>({item,expansion:false})),...(ship.expansion?[{item:ship.expansion,expansion:true}]:[])].flatMap(({item,expansion})=>{
  const meta=hdFEFind(item.name);if(!meta||!HD_FE_AIR_CATS.has(meta.category))return [];
  const key=hdFOStackKey(item);return [{shipIndex,ship:ship.ship,slotIndex:expansion?null:Number.isInteger(item.slotIndex)?item.slotIndex:null,expansion,name:item.name,star:Number(item.star)||0,registered:inventory.find(row=>row.key===key)?.count||0,assigned:used[key]||0,countsTowardRecommendation:hdOCItemMatches('制空',meta)}];
 }));
 const registeredNames=new Set(inventory.filter(row=>row.count>0).map(row=>hdFLNorm(row.item?.name||row.name))),currentNames=new Set(currentAll.map(row=>hdFLNorm(row.name))),catalog=hdFLCatalog().filter(item=>hdOCItemMatches('制空',item)),shortage=result.shortages?.find(row=>row.kind==='制空'&&row.goalKind==='制空'),preferred=(shortage?.candidates||[]).map(name=>catalog.find(item=>hdFLNorm(item.name)===hdFLNorm(name))).filter(Boolean),seen=new Set(),pool=[...preferred,...catalog].filter(item=>{const key=hdFLNorm(item.name);if(seen.has(key)||registeredNames.has(key)||currentNames.has(key))return false;seen.add(key);return true;}),scanned=pool.slice(0,12).map(item=>inspect({name:item.name,star:0,key:hdFLInventoryStackKey(item.name,0),item},'catalog'));
 scanned.sort((a,b)=>({candidate:0,manual:1,blocked:2}[a.status])-({candidate:0,manual:1,blocked:2}[b.status]));
 const numeric=(result.measure.goals||[]).find(row=>row.kind==='air-value'),manual=(result.measure.manual||[]).find(text=>text.startsWith('制空：'));
 return {scope:'owned-air-count-inspection',map:c.map,index:0,path,rows,catalogExamples:scanned.slice(0,3),currentAircraft:currentAll.slice(0,32),unknown,unconfirmedHullCount:unconfirmedHulls.length,remaining:Math.max(0,all.length-limit),currentRemaining:Math.max(0,currentAll.length-32),catalogueLimited:pool.length>12||scanned.length>3,catalogueScanned:Math.min(12,pool.length),assessment:{status:numeric&&!numeric.unresolved&&Number.isFinite(numeric.count)?'current':'manual',detail:numeric?.detail||manual||'現在案の数値制空目標は未設定または未確認です。'}};
}
function hdOCAirCountInspectionHtml(view){
 if(view?.scope!=='owned-air-count-inspection')return '';
 const esc=hdFEEsc,label=item=>item.name+(item.star?' ★'+item.star:''),reasons={'slot-information-unknown':'艦・枠・搭載数の情報が足りず、搭載先は未確認です。','slot-restricted':'確認した枠の装備制限により、搭載先がありません。','no-positive-capacity':'この航空機を運用できる正の搭載数の確認済み枠がありません。','equipment-incompatible':'確認した艦・装備条件では、この航空機の搭載先がありません。'};
 const renderRows=(rows,source)=>rows.map((row,i)=>`<li data-hd-oc-air-count-row="${i}" data-hd-oc-air-count-source="${source}" data-hd-oc-air-count-status="${row.status}" data-hd-oc-air-count-reason="${row.reason}"><b>${esc(label(row))}</b>：${source==='catalog'?'台帳登録なし（非所持を確認した値ではありません）':`登録${row.registered}個 / 現在案${row.assigned}個 / 未使用${row.unused}個`}。${row.destinations.length?`<ul>${row.destinations.map(target=>`<li data-hd-oc-air-count-destination data-hd-oc-air-count-mode="${target.mode}">第${target.shipIndex+1}艦 ${esc(target.ship)} / ${target.expansion?'確認済み増設':'通常第'+(target.slotIndex+1)+'枠'}（搭載上限${target.capacity}）：${target.mode==='empty'?'空き枠への配置を検討':`現在 ${esc(label(target.current))}（${target.mode==='same'?'この枠の同じ装備を継続':'現在装備との交換対象・条件維持は未評価'}）`}</li>`).join('')}</ul>`:`<p>${esc(reasons[row.reason]||'搭載条件を確認してください。')}登録数の不足や追加購入の必要とは区別してください。</p>`}${row.unknownSlots?`<small>別に${row.unknownSlots}枠の情報が未確認です。</small>`:''}${row.assigned>row.registered?'<small>現在案の使用数と登録数の対応を確認してください。</small>':''}</li>`).join('');
 return `<section data-hd-oc-air-count-inspection><b>手持ちから検討する制空用航空機と搭載先</b><p>対象：${esc(view.path)}。装備個数の任意目安と、選択した戦闘マス・敵編成・制空目標の数値条件は別です。</p><p data-hd-oc-air-count-assessment>${esc(view.assessment.detail)}。これは既存モデルによる現在案の判定の引用で、交換後の値ではありません。</p><div data-hd-oc-air-count-current-aircraft><b>現在案に配備した航空機</b>${view.currentAircraft.length?`<ul>${view.currentAircraft.map(item=>`<li>第${item.shipIndex+1}艦 ${esc(item.ship)} / ${item.expansion?'増設':item.slotIndex==null?'通常枠未確認':'通常第'+(item.slotIndex+1)+'枠'}：${esc(label(item))}（${item.countsTowardRecommendation?'制空装備の個数目安へ数える種類':'制空装備の個数目安へ数える対象外'}）</li>`).join('')}</ul>`:'<p>現在案に確認できる航空機はありません。情報未登録を、実際の非配備とは断定しません。</p>'}${view.currentRemaining?`<small>現在配備の表示は32件まで（残り${view.currentRemaining}件）。</small>`:''}<small>この航空機一覧自体は、制空値の充足・攻撃可否・艦ごとの攻撃機目標の達成を示すものではありません。</small></div><div data-hd-oc-air-count-registered><b>登録在庫からの検討</b>${view.rows.length?`<ul>${renderRows(view.rows,'registered')}</ul>`:'<p>制空装備として確認できる登録航空機がありません。登録なし・性能未登録を、手持ちでは不可能という判定へ変換しません。</p>'}${view.remaining?`<small>登録品は現在案で使う装備を優先した改修別12件まで（残り${view.remaining}件）。</small>`:''}</div><div data-hd-oc-air-count-catalog><b>登録のないカタログ例（最大3種類）</b>${view.catalogExamples.length?`<ul>${renderRows(view.catalogExamples,'catalog')}</ul>`:'<p>この確認範囲で表示できるカタログ例はありません。全候補の不存在や購入の必要を示しません。</p>'}<small>登録0は台帳に登録がないという照合で、ゲーム内の非所持を確認した値ではありません。入手・購入の推奨や確定数量ではありません。カタログは最大12種類を確認し、最大3種類だけを表示します。${view.catalogueLimited?'未表示・未確認の候補が残ります。':''}</small></div>${view.unknown.length?'<p>元の艦・装備情報や在庫に未確認が残ります。他の艦で確認できた搭載先とは分けて判断してください。</p>':''}<p>未使用数は現在案との差です。他艦から移す場合も同じ装備を二重使用できず、他目標や現在装備と枠を共用します。搭載先は正の搭載数と装備許可を確認した枠で、全候補の同時配備や成立済み条件・利用者目標を保つ交換案は計算していません。増設は開放・装備許可・正の搭載数まで確認できる場合だけ対象とし、未確認を搭載数0や全増設での搭載不可へ置き換えません。</p><p>搭載上限はマスターの枠情報で、現在残機を確認した値ではありません。ここでは交換後の制空値、★・熟練度・現在残機・選択した敵や通る順番を含む連戦損耗、全戦闘での充足は未計算です。下の「この配備で制空・索敵を確認」で艦・枠・現在装備を確認して検討し、手動編集後の数値は既存の参考値・攻略条件未判定として扱ってください。配備・元目標・保存編成を変更せず、交換を自動適用しません。</p></section>`;
}
// Only the two canonical added scouting contexts use this extension.
function hdOCUpperCentralScoutingScope(c){
 const path=c?.map==='3-5'?'BDHK':c?.map==='5-5'?'BFDHNOS':null;
 if(!path||c?.index!==1||!c.preset)return false;
 try{
  if(typeof MAP_PLANS==='undefined'||typeof hdMapPresetRequirements!=='function')return false;
  const canonical=MAP_PLANS[c.map]?.presets?.[1];if(!canonical)return false;
  for(const key of ['name','ships','gear','use','source','flagship'])if(c.preset[key]!==canonical[key])return false;
  const route=hdMapPresetRequirements(c.map,c.preset);return route?.map===c.map&&route.index===1&&route.path===path&&route.los?.kind==='required'&&route.equipmentKinds?.includes('索敵')===true;
 }catch{return false;}
}
function hdOCScoutingOptional(c,goal){
 const index=c?.index,added=Number.isInteger(index)&&(c?.map==='2-5'&&index===0||c?.map==='4-5'&&index===1||c?.map==='6-5'&&[0,1].includes(index)),upperCentral=hdOCUpperCentralScoutingScope(c)&&goal?.minCount===2;
 return (hdOCSouthScouting(c)||c?.map==='2-5'&&Number(c.index)===1||added||upperCentral)&&goal?.kind==='索敵'&&goal.generatedFromMap===true&&goal.purpose==='recommendation'&&(goal.goalKind||goal.kind)==='索敵';
}
function hdOCScoutingOptionsHtml(c,result){
 if(!hdOCSouthScouting(c)&&!(c?.map==='2-5'&&Number(c.index)===1)){const index=c?.index;if(!Number.isInteger(index)||!(c?.map==='2-5'&&index===0||c?.map==='4-5'&&index===1||c?.map==='6-5'&&[0,1].includes(index)||hdOCUpperCentralScoutingScope(c)))return '';const inspection=hdOCScoutingInspection(c,result);return inspection?hdOCScoutingInspectionHtml(inspection):'';}
 const {inventory,slots,unknown}=hdOCBuild(c),used=hdFOAssignedUsage(result.plan),esc=hdFEEsc;
 const rows=inventory.filter(x=>x.count>0&&Number(x.item?.stats?.索敵)>0),limit=12;
 const list=rows.slice(0,limit).map(x=>{
  const assigned=used[x.key]||0,compatible=slots.filter(slot=>hdOCCompatible(slot,x));
  const destinations=result.plan.ships.flatMap((ship,si)=>{
   const found=compatible.filter(slot=>slot.si===si);return found.length?[`第${si+1}艦 ${ship.ship}（${found.map(slot=>slot.expansion?'増設':'通常'+(slot.index+1)).join('・')}）`]:[];
  });
  return `<li><b>${esc(x.name)}${x.star?' ★'+x.star:''}</b>：登録${x.count}個 / 現在案${assigned}個 / 未使用${Math.max(0,x.count-assigned)}個。${esc(destinations.length?'搭載条件に合う枠：'+destinations.join(' / '):'確認済み枠には搭載できません。艦情報・通常枠・増設条件を確認してください')}</li>`;
 }).join('');
 return `<div data-hd-oc-scouting-options><b>手持ちから検討する索敵装備の交換候補</b>${c?.map==='2-5'&&Number(c.index)===1?'<p>Iで固定O条件を目指す追加索敵の検討です。ランダム域にいるだけで購入必須とは案内しません。司令部Lv120で確認した境界であり、他の分岐条件・戦闘勝利は別です。</p>':''}<p>交換後の索敵値は未計算です。各装備の艦固有ボーナス差分も未確認です。索敵不足の数値を装備の必要個数や購入必須へ換算しません。</p>${list?`<ul>${list}</ul>`:'<p>登録台帳から表示できる交換候補はありません。性能未登録の装備も含め、所持情報を確認してください。手持ちでは不可能という判定ではありません。</p>'}${rows.length>limit?`<small>表示は${limit}種類まで（残り${rows.length-limit}種類）。探索の打切りとは別です。</small>`:''}${unknown.length?'<p>艦情報が足りない枠は搭載可否を未確認として残しています。</p>':''}<p>未使用数は現在案との差です。他艦から移す場合も同じ装備を二重使用できません。上の枠は他の必須装備と共用し、同時配備の成立を保証しません。不足欄の「装備候補」はカタログ候補で、未所持品を含みます。</p><p>下の「この配備で制空・索敵を確認」から、艦・枠を確認して交換を試せます。手動編集の数値は入力を前提とした参考値で、攻略条件は未判定のまま保存・再表示できます。新しい配備での素索敵＋ボーナス、司令部Lv、改修値などを確認してから判断してください。同期なしでも検討を続けられます。計算画面の編集は保存編成への自動適用ではありません。</p></div>`;
}
function hdOCPlacementHtml(goal,c=null){
 if(!goal.blocked)return '';
 const esc=hdFEEsc,radarShips=c?.map==='3-2'&&goal.kind==='電探'&&goal.goalKind==='radar-ships'&&goal.routeEquipment===true&&goal.purpose==='route',numeric=radarShips||['air-value','los-value'].includes(goal.goalKind||goal.kind),airOptional=hdOCAirCountOptional(c,goal),radarOptional=hdOCRadarCountOptional(c,goal),optional=hdOCScoutingOptional(c,goal)||airOptional||radarOptional;
 const lines=[`この編成に装備できる手持ち ${goal.usableOwned}個 / 装備可能な枠は最大 ${goal.compatibleSlots}枠（他の条件と共用）`];
 if(radarShips)lines.push(`経路の目標は電探装備艦${goal.minCount}隻に対して現在${goal.count}隻です。同じ艦の複数電探は1隻です。上の在庫は物理的な装備個数、枠数は参考の上限で、必要な別艦数・同時配備・成立済み速力の維持や確定調達数を示しません`);
 if(goal.blocked.length)lines.push('この編成の確認済み枠に載せられない手持ち：'+goal.blocked.map(x=>`${x.name}${x.star?' ★'+x.star:''} ×${x.count}`).join('、')+'。艦種・スロット制限・搭載数・増設の条件を確認してね');
 if(optional)lines.push(radarOptional?`任意目安${goal.minCount}個に対する登録数の差です。通行の必須個数や確定調達数ではありません。選択中の速力と電探装備艦数を別に確認し、同じ艦の複数電探を複数艦に数えません`:airOptional?`任意目安${goal.minCount}個に対する登録数の差です。経路に必要な個数や確定調達数ではありません。装備個数ではなく、選択した戦闘マス・敵編成・制空目標に対する制空値と未確認理由を確認してください`:`任意目安${goal.minCount}個に対する登録数の差です。経路に必要な個数や確定調達数ではありません。装備数ではなく33式の数値と未確認理由を確認してください`);
 if(!optional&&!numeric&&goal.compatibleSlots<goal.minCount)lines.push(`必要な ${goal.minCount}個に対して枠が不足。装備を増やすだけでは解消できないので、編成や確認済みの増設枠を見直してね`);
 else if(!optional&&goal.usableOwned>=goal.minCount&&!numeric)lines.push('装備できる所持数は足りています。他の条件との両立や配置を見直してね。探索で組み合わせを見つけられない場合もあります');
 else if(!optional&&!numeric&&goal.compatibleSlots)lines.push(`装備できる同種の手持ちがあと ${Math.max(0,goal.minCount-goal.usableOwned)}個必要。候補の入手後も配備を再確認してね`);
 return `<div class="hd-oc-placement">${lines.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`;
}
function hdOCStockGap(goal){return !goal||goal.unresolved||goal.placement||(goal.kind==='高速化'||['opening-asw','air-value','los-value','speed-ship'].includes(goal.goalKind||goal.kind))?0:Math.max(0,Math.ceil(goal.minCount-(goal.usableOwned??goal.owned)))}
function hdOCCapabilityStockHtml(goal){
 const stock=goal.capability&&goal.stock;if(!stock?.parts?.length)return '';
 if(goal.optionalAswProjection?.scope==='owned-optional-asw')return hdOCOptionalAswHtml(goal.optionalAswProjection);
 const esc=hdFEEsc,softReference=goal.softLandProjection?.scope==='owned-soft-land',softHtml=softReference?hdOCSoftLandProjectionHtml(goal):'';
 const carrierReasons={'profile-unknown':'艦・通常スロット情報が未判定のため、搭載先を確認できません。','slot-info-unknown':'通常枠の搭載数が未判定です。搭載先や必要な調達数はまだ確定しません。','catalogue-unknown':'攻撃機候補の情報が不足しています。装備名や調達数はまだ確定しません。','compatibility-unknown':'艦と攻撃機の装備可否が未判定です。搭載不可や在庫不足とはまだ確定しません。','no-positive-capacity':'攻撃機を運用できる正の搭載数の通常枠がありません。艦・搭載枠を見直してください。','hull-incompatible':'確認した攻撃機候補は、この艦に搭載できません。艦・装備制限を見直してください。','slot-restricted':'確認した攻撃機候補を載せられる通常枠がありません。枠ごとの装備制限を見直してください。'};
 const targets=goal.carrierTargets?.length?`<div data-hd-oc-carrier-targets><b>未配備の空母ごとの搭載先候補</b>${goal.carrierTargets.map(t=>t.placementScope==='starter-carrier'?`<p data-hd-oc-carrier-target-row="${esc(t.shipIndex)}" data-hd-oc-carrier-target-status="${esc(t.status)}" data-hd-oc-carrier-target-reason="${esc(t.reason)}">${esc(t.ship)}：攻撃機の装備例${t.count}個。${t.status==='candidate'?t.slots.map(slot=>`通常第${slot.index+1}枠：${slot.candidates.map(esc).join('・')}`).join(' / '):esc(carrierReasons[t.reason]||'通常枠の装備条件を確認してください。')}${t.unknownSlots&&t.status==='candidate'?'（未確認の枠は候補から除外）':''}</p>`:`<p>${esc(t.ship)}：艦上攻撃機・艦上爆撃機${t.count}個。${t.status==='candidate'?t.slots.map(slot=>`第${slot.index+1}枠：${slot.candidates.map(esc).join('・')}`).join(' / '):t.status==='manual'?'スロット情報が未判定のため、搭載先を確認できません。':'登録した機体を搭載できる通常枠がありません。艦・搭載枠を見直してください。'}${t.unknownSlots&&t.status==='candidate'?'（未確認の枠は候補から除外）':''}</p>`).join('')}<small>戦闘上の推奨で、経路の必須条件ではありません。候補は未所持品を含むカタログ例です。表示枠は他の目標と共用し、現在の装備との交換を含みます。同時配備の成立や購入数量を保証しません。</small>${goal.carrierTargets.some(t=>t.placementScope==='starter-carrier')?'<small data-hd-oc-carrier-scope-note>各艦1個は、この任意目標に対する装備例です。通行の必須数や購入数量ではありません。搭載先は通常枠のみで、補強増設はこの攻撃機配備の対象に含めません。候補と現在の配備は別に確認してください。</small>':''}</div>`:'';
 const land=Array.isArray(goal.landTargets)?`<div data-hd-oc-land-targets><b>対地装備例の同じ艦への搭載先候補</b>${goal.landScopeNote?`<small>${esc(goal.landScopeNote)}</small>`:''}<small>以下は選ばれた1組の代替候補です。候補名はここで示す装備例に限定します。全候補艦への配備を求めるものではありません。必要組数は目標欄で確認してください。</small>${goal.landTargets.length?goal.landTargets.map(t=>`<p>${esc(t.ship)}：${t.status==='manual'?'艦・通常スロット情報が未判定のため、搭載先を確認できません。':t.status==='blocked'?'ここで示す装備例の2種類を同じ艦の別々の通常枠へ載せられる候補がありません。艦・装備制限・枠数を見直してください。':t.parts.map(part=>`${esc(part.label)}${part.count}個（${part.slots.map(slot=>`通常第${slot.index+1}枠：${slot.candidates.map(esc).join('・')}`).join(' / ')}）`).join('＋')+'。同じ艦の別々の通常枠へ配備します。'}</p>`).join(''):'<p>ここで示す装備例の2種類を同じ艦の別々の通常枠へ載せられる候補を確認できません。艦・装備制限・増設枠を見直してください。手持ちでは不可能という判定ではありません。</p>'}<small>戦闘上の推奨装備例で、経路の必須条件や全陸上型への十分な火力・勝利を保証しません。別の対地装備例・敵の種類・改修・配備艦数も確認してください。表示は通常枠だけで増設を含めず、未所持品・現在装備との交換を含みます。他の目標と枠を共用し、全目標の同時配備や購入数量を保証しません。</small></div>`:'';
 const oneFiveWater=goal.waterScope==='one-five-bbv'&&goal.generatedFromMap===true&&goal.purpose==='recommendation',water=goal.waterTargets?.length?`<div data-hd-oc-water-targets><b>${oneFiveWater?'未配備の航空戦艦ごとの搭載先候補':'未配備の水母ごとの搭載先候補'}</b>${goal.waterTargets.map(t=>`<p>${esc(t.ship)}：水上爆撃機${t.count}個。${t.status==='candidate'?t.slots.map(slot=>`通常第${slot.index+1}枠：${slot.candidates.map(esc).join('・')}`).join(' / '):t.status==='manual'?'スロット情報が未判定のため、搭載先を確認できません。':'水上爆撃機を搭載できる正の搭載数の通常枠がありません。艦・搭載枠を見直してください。'}${t.unknownSlots&&t.status==='candidate'?'（未確認の枠は候補から除外）':''}</p>`).join('')}<small>${oneFiveWater?'航空戦艦1隻に水上爆撃機1個という既存の任意配備例です。通行必須・先制対潜人数・対潜火力・撃破・勝利を保証しません。合法かつ正の搭載数の通常枠だけを示し、増設枠は含めません。水偵・回転翼機・対潜哨戒機など実ゲーム上の他の対潜手段は、この水上爆撃機モデルとは別に確認してください。候補は未所持品や現在装備との交換を含み、他の目標と枠を共用します。同時配備の成立や購入数量を保証しません。':'水上爆撃機1個ずつは戦闘上の推奨装備例で、経路の必須条件ではありません。水偵や回転翼機はこの装備例の代用にせず、増設枠は含めません。Hの33式索敵条件、G/Hの航空偵察成功・資源獲得や戦闘勝利を保証しません。候補は未所持品を含み、他の目標と枠を共用し、現在の装備との交換を含みます。同時配備の成立や購入数量を保証しません。'}</small></div>`:'';
 const asw=Array.isArray(goal.aswTargets)?`<div data-hd-oc-asw-targets><b>対潜装備例の同じ艦への搭載先候補</b>${goal.aswScopeNote?`<small>${esc(goal.aswScopeNote)}</small>`:''}<small>以下は1組の搭載先の候補です。全候補艦への配備を求めるものではありません。必要組数は目標欄で確認してください。</small>${goal.aswTargets.length?goal.aswTargets.map(t=>`<p>${esc(t.ship)}：${t.status==='manual'?'艦・通常スロット情報が未判定のため、搭載先を確認できません。':t.parts.map(part=>`${esc(part.label)}${part.count}個（${part.slots.map(slot=>`通常第${slot.index+1}枠：${slot.candidates.map(esc).join('・')}`).join(' / ')}）`).join('＋')+'。同じ艦の別々の通常枠へ配備します。'}</p>`).join(''):'<p>この装備例の2種類を同じ艦の別々の通常枠へ載せられる候補を確認できません。艦・装備制限・増設枠を見直してください。手持ちでは不可能という判定ではありません。</p>'}<small>戦闘上の推奨セットの候補で、経路の必須条件や先制対潜の成立人数ではありません。表示は通常枠の装備例で、増設枠は含めません。候補は未所持品を含み、他の目標と枠を共用し、現在の装備との交換を含みます。全目標の同時配備や購入数量を保証しません。</small></div>`:'';
 const pt=goal.ptScopeNote?`<div data-hd-oc-pt-targets><b>PT装備例の搭載先候補（任意の汎用比較）</b><small>${esc(goal.ptScopeNote)}</small>${Array.isArray(goal.ptTargets)?goal.ptTargets.length?goal.ptTargets.map(t=>`<p>${esc(t.ship)}：${t.status==='manual'?'艦・通常スロット情報が未判定のため、搭載先を確認できません。':t.status==='blocked'?'この3部品を同じ艦の別々の通常3枠へ載せられません。艦・装備制限・枠数を見直してください。':t.parts.map(part=>`${esc(part.label)}${part.count}個（${part.slots.map(slot=>`通常第${slot.index+1}枠：${slot.candidates.map(esc).join('・')}`).join(' / ')}）`).join('＋')+'。同じ艦の別々の通常3枠への代替候補です。'}</p>`).join(''):'<p>この装備例の3部品を同じ艦の別々の通常3枠へ載せられる候補を確認できません。編成・装備制限・枠数を見直してください。手持ちでは不可能という判定ではありません。</p>':'<p>この2部品などの汎用比較を、第2固有の3部品例や十分な対策の確認へ読み替えません。</p>'}<small>候補は未所持品・現在装備との交換を含むカタログ例です。全候補艦への配備を求めず、在庫・他目標との枠競合・同時配備・購入数量を保証しません。表示は通常枠のみで増設は含めません。水上機例の第2への十分性も未確認で、搭載数0や装備不可枠は候補から外します。未確認・搭載不可は在庫不足とは別です。</small></div>`:'';
 const surfaceNight=Array.isArray(goal.nightTargets)&&['night-main','night-main-secondary','night-mixed'].includes(stock.recipe.id),surfaceNightReasons={'hull-unknown':'艦情報が未判定のため、搭載先を確認できません。','profile-unknown':'通常スロット情報が未判定のため、搭載先を確認できません。','identity-unknown':'艦と通常スロットの対応情報が不足しています。個体と艦情報を確認してください。','identity-mismatch':'個体・艦名・通常スロットの対応が一致しません。元データを保持して確認してください。','eligibility-unknown':'艦・既存装備の夜戦条件が未判定です。装備例の適用を確認してください。','model-unsupported':'この艦は、この汎用CIモデルの対象外です。艦固有の夜戦攻撃は別に確認してください。','catalogue-unknown':'構成例の装備候補情報が不足しています。装備名や調達数はまだ確定しません。','compatibility-unknown':'艦・装備・枠の組合せが未判定です。搭載不可や在庫不足とはまだ確定しません。','normal-slot-count':'通常枠だけでは、この構成例の部品を別々の枠へ配置できません。合法な増設を使う別構成は別途確認してください。','equipment-incompatible':'この構成例の一部を搭載できる通常枠がありません。艦・装備制限を見直してください。','slot-conflict':'部品を個別に載せる候補はありますが、同じ艦の別々の通常枠へ同時に配置できません。装備制限と枠の競合を確認してください。'};
 const night=surfaceNight?`<div data-hd-oc-night-targets data-hd-oc-surface-night="${esc(stock.recipe.id)}"><b>選択した装備例「${esc(stock.recipe.name)}」の通常枠候補</b><small>各候補は同じ艦への構成例の代替案です。全候補艦への配備を求めません。必要組数は目標欄で確認してください。</small>${goal.nightTargets.length?goal.nightTargets.map(t=>`<p data-hd-oc-surface-night-row="${esc(t.shipIndex)}" data-hd-oc-surface-night-status="${esc(t.status)}" data-hd-oc-surface-night-reason="${esc(t.reason)}">${esc(t.ship)}：${t.status==='candidate'?t.parts.map(part=>`<span data-hd-oc-surface-night-part="${esc(part.part)}" data-hd-oc-surface-night-count="${part.count}">${esc(part.label)}${part.count}個（${part.slots.map(slot=>`通常第${slot.index+1}枠：${slot.candidates.map(esc).join('・')}`).join(' / ')}）</span>`).join('＋')+'。同じ艦の別々の通常枠へ配備する構成例です。':esc(surfaceNightReasons[t.reason]||'艦・装備・通常枠の条件を確認してください。')}</p>`).join(''):'<p>この装備例の通常枠候補はありません。既に準備できた艦の判定や、別の合法な構成は上の結果で確認してください。</p>'}<small data-hd-oc-surface-night-note>ここに示す部品数は選択した構成例の内訳で、通行の必須数や購入数量ではありません。装備条件の準備と、CIの発動・実戦の結果は別です。全装備による汎用CIの優先順・艦固有CIを配備後に再確認してください。発動率・命中・撃破・勝利は保証しません。通常枠だけの案内で、補強増設の主砲・副砲などの個別許可は、この案内では未評価です。候補は未所持品や現在装備との交換を含み、他の目標と枠を共用します。同時配備や購入数量を保証しません。</small></div>`:Array.isArray(goal.nightTargets)?`<div data-hd-oc-night-targets><b>魚雷2個の同じ艦への搭載先候補</b><small>以下は1組の代替候補です。全候補艦への配備を求めるものではありません。必要組数は目標欄で確認してください。</small>${goal.nightTargets.length?goal.nightTargets.map(t=>`<p>${esc(t.ship)}：${t.status==='manual'?'艦・通常スロット情報が未判定のため、搭載先を確認できません。':`魚雷${t.count}個を同じ艦の別々の通常枠へ配備。${t.slots.map(slot=>`通常第${slot.index+1}枠：${slot.candidates.map(esc).join('・')}`).join(' / ')}`}</p>`).join(''):'<p>魚雷2個を同じ艦の別々の通常枠へ載せられる候補を確認できません。艦・装備制限を見直してください。手持ちでは不可能という判定ではありません。</p>'}<small>選ばれた戦闘上の推奨装備例で、他の夜戦CI装備例もあります。経路必須やCIの発動率・命中・撃破は保証しません。他の主砲などを含む全装備の優先判定は配備後に再確認します。通常枠だけの候補で増設枠は含めず、未所持品・現在装備との交換を含みます。他の目標と枠を共用し、全目標の同時配備や購入数量を保証しません。</small></div>`:'';
 const subNight=Array.isArray(goal.subNightTargets)?`<div data-hd-oc-sub-night-targets><b>潜水艦CI装備例の同じ艦への搭載先候補</b><small>以下は1組の代替候補です。全候補艦への配備を求めるものではありません。必要組数は目標欄で確認してください。</small>${goal.subNightTargets.length?goal.subNightTargets.map(t=>`<p>${esc(t.ship)}：${t.status==='manual'?'艦・通常スロット情報が未判定のため、搭載先を確認できません。':t.parts.map(part=>`${esc(part.label)}${part.count}個（${part.slots.map(slot=>`通常第${slot.index+1}枠：${slot.candidates.map(esc).join('・')}`).join(' / ')}）`).join('＋')+'。同じ潜水艦の別々の通常枠へ配備します。'}</p>`).join(''):'<p>この装備例の2個を同じ潜水艦の別々の通常枠へ載せられる候補を確認できません。艦・装備制限を見直してください。手持ちでは不可能という判定ではありません。</p>'}<small>選ばれた戦闘上の推奨装備例で、経路必須ではありません。別のCI装備例や、他の装備を含む配備後の優先判定も確認してください。発動率・命中・撃破は保証しません。通常枠だけの候補で増設枠は含めず、未所持品・現在装備との交換を含みます。他の目標と枠を共用し、全目標の同時配備や購入数量を保証しません。</small></div>`:'';
 return `<div data-hd-oc-capability-stock><b>装備例「${esc(oneFiveWater?'航空戦艦：搭載枠に水上爆撃機':stock.recipe.name)}」の${softReference?'参考登録内訳':'所持内訳'}</b>${stock.parts.map(part=>{const gap=Math.max(0,part.need-part.have);return `<p><b>${esc(part.label)}：所持${part.have} / ${softReference?'構成例の内訳':'この装備例に必要'}${part.need}${gap&&!softReference?'・あと'+gap+'個':''}</b><br>${esc(part.items.length?'手持ち：'+part.items.join('、'):'候補：'+(HD_SE_PARTS[part.part]?.examples||[]).join('、'))}</p>`}).join('')}<small>${softReference?'登録数は参考の内訳で、調達数はまだ決まりません。条件を保つ具体案と未確認理由を下で確認してください。':stock.parts.every(p=>p.have>=p.need)?'この装備例の所持数は足りています。同じ艦のセット・装備枠・他の条件との両立を見直してください。':'この装備例の数量不足です。別の装備例や代替装備も含め、配備できるか再探索してください。'}所持数の内訳は、全目標を同時に満たす配備の保証ではありません。</small>${softHtml}${targets}${land}${water}${asw}${pt}${night}${subNight}</div>`;
}
function hdOCProcurementHtml(goal,index,attrs,c=null){
 const gap=hdOCStockGap(goal);if(!gap||!goal.candidates.length||typeof hdPLSave!=='function')return '';
 const radarShips=c?.map==='3-2'&&goal.kind==='電探'&&goal.goalKind==='radar-ships'&&goal.routeEquipment===true&&goal.purpose==='route',airOptional=hdOCAirCountOptional(c,goal),radarOptional=hdOCRadarCountOptional(c,goal),optional=hdOCScoutingOptional(c,goal)||airOptional||radarOptional;
 return `<div class="hd-oc-procurement"><label>${optional?'任意目安を補う候補':radarShips?'電探装備艦を改善する参考候補':'所持不足を補う候補'} <select data-hd-oc-target>${goal.candidates.map(name=>`<option value="${hdFEEsc(name)}">${hdFEEsc(name)}</option>`).join('')}</select></label><button type="button" class="ghost small" data-hd-oc-procure="${index}" ${attrs}>${optional?'任意目安の候補'+gap+'個を調達リストへ':radarShips?'参考候補'+gap+'個を調達リストへ':'候補をあと'+gap+'個、調達リストへ'}</button><small>${radarShips?'ここでの個数は登録した物理在庫との差を使う参考計画です。別々の艦への合法な配備、速力装備との枠競合や条件維持は未確認で、入手・購入による経路成立を保証しません。':radarOptional?'利用者が選ぶ任意の電探個数目安の計画です。H回避・最速CEFLの必須電探装備艦数・速力条件や、確定調達数・購入必須を示しません。':airOptional?'利用者が選ぶ装備個数の目安の計画です。選択した戦闘マス・敵編成・制空目標の充足、経路の必要数・購入必須を示しません。':optional?'利用者が選ぶ目安の計画です。経路の必要数・購入必須を示しません。':'候補の入手計画です。入手後に配備を再確認してね。'}</small></div>`;
}
function hdOCAddProcurement(c,result,index,target){
 const goal=result.shortages[index],gap=hdOCStockGap(goal);if(!gap||!goal.candidates.includes(target)||typeof hdPLSave!=='function')return false;
 const item=hdPLResolveWanted(target).item;if(!item||item.name!==target)return false;
 const source=JSON.stringify([c.fleet.id,goal.kind,goal.label]),method=hdPLMethodMeta(item),now=Date.now(),list=hdPLLoad(),old=list.find(x=>x.map===c.map);
 const added={map:c.map,ship:c.fleet.name||'保存編成',loadout:(hdOCScoutingOptional(c,goal)||hdOCAirCountOptional(c,goal)||hdOCRadarCountOptional(c,goal)?'任意目安（経路必要個数は未確定）：':'手持ち配備の不足：')+goal.label,wanted:target,target,kind:goal.kind,exact:true,methodKey:method.key,methodLabel:method.label,rank:method.rank,needed:hdPLOwnedCount(target)+gap,ownedPlanSource:source,ownedPlanRoute:c.index,sources:[c.fleet.name||'保存編成'],createdAt:now};
 const next={...old,id:old?.id||`pl-${now}-${Math.random().toString(16).slice(2)}`,map:c.map,kinds:old?.kinds||[],gearItems:[...(old?.gearItems||[]).filter(x=>!(x.ownedPlanSource===source&&(x.ownedPlanRoute==null||Number(x.ownedPlanRoute)===c.index))),added],createdAt:old?.createdAt||now,updatedAt:now};
 hdPLSave(old?list.map(x=>x.map===c.map?next:x):[next,...list]);return true;
}
function hdOCSavedGoal(c,result,item){
 if(!item.ownedPlanSource||(item.ownedPlanRoute!=null&&Number(item.ownedPlanRoute)!==c.index))return null;
 try{const source=JSON.parse(item.ownedPlanSource);if(!Array.isArray(source)||String(source[0])!==String(c.fleet.id))return null;return result.measure.goals.find(g=>g.kind===source[1]&&g.label===source[2])||null}catch{return null}
}
function hdOCProcurementUpdateHtml(c,result,attrs){
 if(typeof hdPLLoad!=='function')return '';
 const row=hdPLLoad().find(x=>x.map===c.map);if(!(row?.gearItems||[]).some(x=>hdOCSavedGoal(c,result,x)))return '';
 return `<div class="hd-oc-procurement"><button type="button" class="ghost small" data-hd-oc-procurement-update ${attrs}>現在の条件で調達計画を更新</button><small>この編成・ルートの保存済み候補を再確認します。同じ編成・条件の旧計画も更新します。所持不足が解消した計画は整理し、配備条件は上の結果で確認してね。</small></div>`;
}
function hdOCUpdateProcurement(c,result){
 if(result.signature!==hdOCSignature(c))return false;
 const list=hdPLLoad(),old=list.find(x=>x.map===c.map);if(!old)return {removed:0,updated:0};
 let removed=0,updated=0;
 const items=(old.gearItems||[]).flatMap(item=>{
  const goal=hdOCSavedGoal(c,result,item);if(!goal)return [item];
  const shortage=result.shortages.find(g=>(g.goalKind||g.kind)===goal.kind&&g.label===goal.label);
  if(goal.ok||shortage&&hdOCStockGap(shortage)===0){removed++;return []}
  const gap=hdOCStockGap(shortage);if(!gap)return [item];
  // Keep a previously chosen candidate even when its score drops outside the top three.
  const meta=hdFLCatalog().find(x=>x.name===item.target),slots=hdOCBuild(c).slots;
  if(!meta||!hdOCItemMatches(goal.kind,meta)||!slots.some(slot=>hdOCCompatible(slot,{item:meta,star:0})))return [item];
  const needed=hdPLOwnedCount(item.target)+gap;
  if(item.needed===needed&&item.ownedPlanRoute===c.index)return [item];
  updated++;return [{...item,needed,ownedPlanRoute:c.index}];
 });
 if(removed||updated){const next={...old,gearItems:items,updatedAt:Date.now()};hdPLSave(!items.length&&!(old.kinds||[]).length?list.filter(x=>x.map!==c.map):list.map(x=>x.map===c.map?next:x))}
 return {removed,updated};
}
// Match exact remodels and individual ships, never a remodel family or a reused row.
function hdOCShipOwnership(plan){
 const loaded=hdFERoster(),roster=Array.isArray(loaded)?loaded.filter(x=>x&&typeof x==='object'):[],ships=(plan?.ships||[]).map((ship,index)=>({ship,index})).filter(x=>x.ship?.ship);
 const master=(row,name)=>Number(row.masterId)||Number(hdShipDbMasterRowFor(name)?.id)||0;
 const physical=(row,index)=>Number(row.gameShipId)>0?'game:'+Number(row.gameShipId):row.id?'roster:'+String(row.id):'row:'+index;
 const checks=ships.map(({ship,index})=>{
  const expected=master(ship,ship.ship),named=Number(hdShipDbMasterRowFor(ship.ship)?.id)||0,gameId=Number(ship.gameShipId)||0,rosterId=String(ship.rosterId||'');
  const base={index,ship:ship.ship,status:'ready',detail:''};
  if(!roster.length)return {...base,status:'data',detail:'艦隊台帳が空のため、所持を確認できません。'};
  if(!expected||named&&named!==expected)return {...base,status:'data',detail:'艦名・マスターID・改造段階を確認できません。'};
  const identity=roster.map((row,i)=>({row,key:physical(row,i)})).filter(({row})=>gameId?Number(row.gameShipId)===gameId:rosterId?String(row.id||'')===rosterId:true);
  if((gameId||rosterId)&&!identity.length)return {...base,status:'data',detail:'保存編成が指定する個体を台帳で確認できません。同名の別個体には置き換えていません。'};
  const candidates=identity.filter(({row})=>master(row,row.name)===expected).map(x=>x.key);
  if(!candidates.length)return {...base,status:'missing',detail:'台帳に同じ改造段階の艦娘がありません。改造前・別形態の所持では、この配備を成立扱いにしません。'};
  return {...base,candidates};
 });
 // Reassign flexible name-only matches so that pinned individuals stay available.
 const assigned=new Map(),match=(index,seen)=>{
  for(const key of checks[index].candidates||[]){
   if(seen.has(key))continue;seen.add(key);
   if(!assigned.has(key)||match(assigned.get(key),seen)){assigned.set(key,index);return true}
  }
  return false;
 };
 for(const [index,check] of checks.entries())if(check.status==='ready'&&!match(index,new Set())){check.status='missing';check.detail='同じ個体の重複指定、または同じ改造段階の所持隻数が不足しています。1隻を複数枠に使用できません。'}
 return checks.map(({candidates,...check})=>check);
}
function hdOCReview(plan,measure){
 const rows=[],add=(id,kind,title,reason,next,action='',source='')=>rows.push({id,kind,title,reason,next,action,source}),items=hdOCAssigned(plan),air=hdFEAirCheck(plan.map,hdFEAir(items),plan),scouting=hdFEPlanScouting(plan,items),route=hdFERoute(plan),needs=hdSEChecks(plan.map).rows;
 const ownership=hdOCShipOwnership(plan);
 for(const kind of ['missing','data']){
  const issues=ownership.filter(x=>x.status===kind);if(!issues.length)continue;
  add('owned-ships-'+kind,kind,kind==='missing'?'手持ちの艦娘で編成を組めません':'艦娘の所持を確認できません',issues.map(x=>`第${x.index+1}艦 ${x.ship}：${x.detail}`).join(' / '),'ゲーム連携で艦隊台帳を更新し、保存編成の個体・改造段階・所持隻数を確認して再探索してね。',kind==='data'?'sync':'ships');
 }
 const asw=hdOCOaswMeasure(plan),aswSets=typeof hdFEOneFiveAswSelection==='function'?hdFEOneFiveAswSelection(plan,measure.goals):null;
 if(aswSets?.applicable&&['unselected','invalid'].includes(aswSets.state))add('asw-set-selection','manual',aswSets.state==='invalid'?'対潜組数の保存設定が未確認':'対潜セットの組数が未選択',aswSets.state==='invalid'?'保存した組数設定を確認できません。元の値を保持しています。':'対潜装備セットは組数未選択のため数量・調達を評価していません。','対潜装備セットの組数か「比較しない」を選んでください。先制対潜の人数は別設定です。');
 if(asw.minCount&&!asw.ok)add('opening-asw',asw.unresolved?'data':'missing','先制対潜艦の目標が未達',asw.detail,'下の艦別判定で装備条件・対潜値を確認。表示対潜値は同期値か実測値を使い、艦固有ボーナスを推測で加算しません。','equipment',HD_FE_OASW_SOURCE);
 for(const ship of plan.ships||[])if(!hdFEFindShip(ship.ship))add('ship:'+ship.ship,'data','艦娘情報が未登録',ship.ship+' のスロット・装備可否を確認できません。','艦娘名と改造段階を艦娘データベースで確認してね。','ships');
 const unknown=hdFLRows().filter(x=>Number(x.count)>0&&!hdFEFind(x.name));
 if(unknown.length){const used=new Set(items.map(x=>x.name)),required=unknown.filter(x=>used.has(x.name)),unused=unknown.filter(x=>!used.has(x.name));
  if(required.length)add('equipment-used','data','配備装備の性能が未登録',required.map(x=>x.name).join('、'),'装備台帳の名前を確認してから、もう一度配備を探してね。','equipment');
  if(unused.length)add('equipment-unused','info','未登録の所持装備',unused.map(x=>x.name).join('、')+'。この配備案には載せていません。','使いたい装備なら台帳の名前・性能データを確認してね。','equipment');
 }
 if(typeof hdSEAirOptional==='function'&&hdSEAirOptional(plan.map))add('air-optional','info','1-6下ルートの装備方針','制空優勢は必須ではありません。対空CI・対潜装備を優先する方針です。','水戦・水爆を使う場合は、搭載できる軽巡を選んでね。');
 else if(air.status==='manual'&&(air.enemy||needs.some(x=>x.kind==='制空')))add('air',air.reason==='route'?'manual':air.enemy?'data':'manual','制空値を判定できない',air.detail,air.reason==='anti-air'?'敵防空の不足情報を制空計算画面で確認してね。未計算箇所を含むため、充足とは判定しません。':air.reason==='route'?'制空計算画面で通る戦闘マスと目標を選んで、再探索してね。':air.enemy?'艦娘の搭載情報を同期してから再探索してね。':'制空計算画面で、進むルートの敵編成と目標制空値を確認してね。',['route','anti-air'].includes(air.reason)?'calculator':air.enemy?'sync':'calculator');
 if(air.routeLoss?.known){const chain=air.routeLoss;add('air-route-loss',chain.maxGap?'missing':'manual',chain.stage2Complete?'本隊の連戦制空（対空砲火モデル込み）':'本隊の連戦制空（部分計算）',`合計 ${chain.minLost}〜${chain.maxLost}機減少 / 最終基礎制空 ${chain.lower}〜${chain.upper}${chain.firstGap?` / 最初の不足 ${chain.firstGap.id}・${chain.firstGap.round}回目（大損耗側であと${chain.firstGap.gap}）`:''}。`,'確認したマス順の通常敵対空砲火モデル。登録射撃回避補正を反映・未登録機は回避なし・敵全艦生存・同名候補の最大を仮定。未登録敵・敵対空CI・敵連合・噴式機の対空砲火、熟練度低下・敵機削り・全滅確率は未計算。各マスの戦闘前制空を計算画面で確認してね。','calculator','https://wikiwiki.jp/kancolle/対空砲火#enemy_AAfire');if(!chain.stage2Complete)add('air-route-data','data','敵防空の計算情報が不足',chain.stage2Missing.join(' / '),'部分計算の残機だけでは充足としません。敵の形態・装備・陣形と特殊処理の登録が必要です。','calculator');}
 else if(air.routeLoss&&!air.routeLoss.known)add('air-route-order','manual','連戦制空の順番を確認してね',air.routeLoss.reason,'通るマスをルート順に並べ、「この順で進む」で確認してね。','calculator');
 if(!air.routeLoss?.known&&air.loss?.active)add('air-loss','manual','本隊の制空戦損耗（1回の範囲）',`${air.loss.minLost}〜${air.loss.maxLost}機減少 / 迎撃後の基礎制空 ${air.loss.lower}〜${air.loss.upper} / 目標 ${air.required}（厳しい側ではあと ${Math.max(0,air.required-air.loss.lower)}不足）。`,'制空戦だけの範囲。対空砲火・複数マスの累積・熟練度低下・敵機削りは含まず、全滅確率や到達時の保証ではありません。','calculator','https://wikiwiki.jp/kancolle/航空戦');
 if(!scouting.available&&!scouting.notRequired){
  if(scouting.reason==='hq-scope')add('scouting','manual','司令部Lvによる索敵分岐の適用範囲が未確認',scouting.detail,'司令部Lv120の境界や余裕推奨を、この入力の確定条件へ置き換えないでください。','calculator');
  else if(scouting.reason==='bonus')add('scouting','manual','索敵ボーナス差分が未確認',scouting.detail,'配備後の艦娘の索敵値を同期し、同じ装備で再確認してね。','sync');
  else if(scouting.reason==='sync'){const missing=[...(scouting.missing?.hq?['司令部Lv']:[]),...(scouting.missing?.ships||[]).map(x=>x+' の索敵値')];add('scouting','data','索敵計算に必要な情報が不足',missing.join('、'), 'ゲーム連携で母港・艦隊情報を同期し、配備を再探索すると自動計算できるよ。','sync');}
  else if(needs.some(x=>x.kind==='索敵')&&plan.map!=='1-6')add('scouting','manual','索敵の判定基準が未登録',scouting.detail,'索敵計算画面で、進むルートの係数・必要スコアを確認してね。','calculator');
 }
 if(route.status==='missing')add('route','missing','編成条件を満たしていない',route.detail,route.branch?.next||'攻略する編成例に合わせて艦種・隻数・速力を見直してね。','route');
 else if(route.status==='manual')add('route','manual','進むルートの条件を要確認',route.detail,route.branch?.next||'編成例を選び、攻略するルートの艦種・隻数条件を確認してね。','route');
 if(route.branch?.available)add('route-source','info','分岐条件の根拠と判定範囲',`${route.branch.path}の登録分岐 / ${route.branch.checkedAt}確認。${route.branch.detail}`,'他の経路・任務条件・戦闘勝利は別途確認してください。','route',route.branch.sources[0]||'');
 if(route.contract)add('route-contract-source','info','選択経路の必須条件と注意点',route.contract.detail,route.contract.data.notes.join(' / '),'route',route.contract.data.source);
 const target=hdFEPlanSpeedTarget(plan);
 if(target){const checks=(plan.ships||[]).filter(s=>s.ship).map(s=>hdFESpeedGoal(s,target)),unknown=checks.filter(g=>g.unresolved),missing=checks.filter(g=>!g.ok&&!g.unresolved);
  if(unknown.length)add('speed-data','data','速力の判定データが不足',unknown.map(g=>g.detail).join('。'),'艦娘名・改造段階を確認し、未登録の区分はゲーム側の速力で確認してね。','ships',HD_FE_SPEED_SOURCE);
  if(missing.length)add('speed','missing',hdFESpeedLabel(target)+'条件を満たしていない',missing.map(g=>g.detail).join('。'),'必要な缶の種類・改修値・配備枠を確認して再探索してね。到達不可の艦は入れ替えてね。','equipment',HD_FE_SPEED_SOURCE);
  if(!unknown.length&&!missing.length)add('speed','info','配備案の速力条件は確認済み',checks.map(g=>g.speed.detail).join(' / '),'保存後は、ゲーム側にも同じ装備・改修値を配備してね。','',HD_FE_SPEED_SOURCE);
 }
 const base=hdSEChecks(plan.map).adv?.base;
 if(base?.available){
  const state=typeof hdLBLoad==='function'?hdLBLoad()[plan.map]:null,corps=Array.isArray(state?.corps)?state.corps:[],sorties=corps.filter(x=>x.mode==='sortie'),problems=[],unconfirmed=[];
  if(!sorties.length)problems.push('出撃部隊が未設定');
  if(sorties.length>(Number(base.sorties)||1))problems.push(`出撃 ${sorties.length}部隊 / 海域上限 ${Number(base.sorties)||1}部隊`);
  const usage={...hdFOAssignedUsage(plan)},inventory=hdFLInventory();
  for(const [i,c] of corps.entries())for(const s of c.squads||[])if(s.name&&Number(s.slot)>0){const key=hdFLInventoryStackKey(s.name,s.star),count=(usage[key]||0)+1;usage[key]=count;}
  for(const [key,count] of Object.entries(usage)){if(count>(inventory.get(key)?.count||0)&&corps.some(c=>(c.squads||[]).some(s=>s.name&&Number(s.slot)>0&&hdFLInventoryStackKey(s.name,s.star)===key)))problems.push(`${key.split('@@')[0]}：艦隊・基地で計${count}個 / 所持${inventory.get(key)?.count||0}個`);}
  for(const c of sorties){const i=corps.indexOf(c)+1,squads=c.squads||[];
   const filled=squads.slice(0,4).filter(s=>{const item=typeof hdLBFind==='function'&&hdLBFind(s.name),slot=Number(s.slot);return item&&Number.isInteger(slot)&&slot>0&&slot<=hdLBDefaultSlot(item)});
   if(filled.length!==4||squads.length!==4)problems.push(`第${i}航空隊：機体・機数を確認できる中隊 ${filled.length}/4`);
   const radius=typeof hdLBActionRadius==='function'?hdLBActionRadius(c).radius:null,target=Number(base.bossRadius)||0;
   if(!target||radius==null)unconfirmed.push(`第${i}航空隊：${!target?'海域の必要半径':'機体の行動半径'}が未判定`);
   else if(radius<target)problems.push(`第${i}航空隊：行動半径 ${radius} / ボス必要半径 ${target}（あと${target-radius}）`);
  }
  if(problems.length||unconfirmed.length)add('base',!sorties.length?'data':problems.length?'missing':'manual','基地航空隊の計画を確認',[...problems,...unconfirmed].join('。'),'基地航空隊プランナーで機体・機数・出撃設定を直してね。半径は海域のボス必要半径で確認するよ。','base');
  else add('base','info','基地計画の基本条件は確認済み',`保存計画の出撃${sorties.length}部隊について、機体・機数・所持数・ボスへの行動半径を確認しました。`,'ゲーム側の配備と出撃先を合わせてね。敵編成と残機数のチェックは下の項目に表示します。','base');
  if(state?.defenseCheck?.enemyId&&typeof hdLBDefenseAssessment==='function'){const a=hdLBDefenseAssessment(plan.map,state);add('base-defense',a.status,'基地防空の合計制空目安',a.invalid?'防空部隊の機体・機数・★が未判定です。':a.enemy===null?'基地空襲の敵制空値が未入力です。':`${a.label}：防空${a.count}部隊の合計 ${a.ours} / 敵 ${a.enemy} / ${HD_LB_AIR_GOALS[a.goal]} ${a.required}${a.shortage?`、あと ${a.shortage}不足`:'、目安を充足'}。`,'基地計画で防空札・敵空襲編成・機数を確認してね。高高度・重爆補正には未対応です。','base',a.source);}
  if(typeof hdLBAirAssessment==='function')for(const [i,c] of corps.entries())if(c.mode==='sortie'){
   const a=hdLBAirAssessment(plan.map,c),name=`第${i+1}航空隊`;
   if(a.invalid.length)add('base-air:'+i,'data',name+'の制空は未判定',a.invalid.join('、'),'基地計画の機体・機数・★を直してね。','base');
   else if(a.enemy===null)add('base-air:'+i,'data',name+'の敵編成が未設定','基地用の敵制空値がないため、目標までの不足値を計算できません。','基地計画で敵編成を選ぶか、敵偵察機込みの基地用制空値を入力してね。','base');
   else add('base-air:'+i,a.status,name+'の基地制空目安',`${a.label}：敵 ${a.enemy} / 基地 ${a.ours}（${a.state}）。${HD_LB_AIR_GOALS[a.goal]}には ${a.required}${a.shortage?`、あと ${a.shortage}不足`:'、目安を充足'}。`,a.shortage?(a.fullPower>=a.required?'機数を補充すると目安を満たします。':'戦闘機・改修・熟練度・目標を見直してね。後続部隊は敵機削りを含まない保守的な比較です。'):'登録機数での簡易目安です。ゲーム側の敵編成・配備を合わせてね。','base',a.source);
   if(!a.invalid.length&&a.missing)add('base-loss:'+i,'missing',name+'の機数が満載未満',`補充 ${a.missing}機 / 燃料 ${a.fuel} / ボーキ ${a.bauxite}。制空 ${a.ours} → 満載目安 ${a.fullPower}。`,'出撃前に基地を補充してね。計画の機数を更新すると再計算します。','base');
   if(!a.invalid.length&&a.loss>0)add('base-scenario:'+i,a.scenarioShortage?'manual':'info',name+'の損耗を仮定した比較',`各中隊の機数を仮に${a.loss}%減らすと制空 ${a.scenarioPower}${a.enemy===null?' / 敵編成未設定':a.scenarioShortage?` / 目標まであと ${a.scenarioShortage}`:' / 目標維持'}。`,'実際の撃墜率・全滅確率ではありません。熟練度は維持、敵機削りは含まない仮定です。集中時の2回目へ損耗をそのまま持ち越す計算はしていません。','base');
  }
 }
 return rows;
}
function hdOCReadiness(plan,measure,rows=hdOCReview(plan,measure)){
 const checks=[],add=(id,status,detail)=>checks.push({id,status,detail});
 if(plan.preservationIssues?.length)add('source-data','manual',plan.preservationIssues.join(' / '));
 add('equipment',measure.goals.some(x=>!x.ok&&!x.unresolved&&!x.knownRandom)?'missing':measure.goals.some(x=>!x.ok&&x.unresolved)?'manual':measure.goals.some(x=>x.knownRandom)?'partial':measure.goals.length?'ready':'manual','装備・制空・索敵・先制対潜の登録目標');
 const route=hdFERoute(plan);add('route',route.status,route.detail);
 if(!(plan.ships||[]).some(s=>s.ship))add('fleet','missing','艦娘が未選択です');
 const stock=hdFLInventory(),usage=hdFOAssignedUsage(plan),gaps=Object.entries(usage).filter(([key,count])=>count>(stock.get(key)?.count||0));
 add('inventory',gaps.length?'missing':'ready',gaps.map(([key,count])=>`${key.split('@@')[0]}：必要${count} / 所持${stock.get(key)?.count||0}`).join(' / '));
 const master=hdFEMasterValidation(plan);add('compatibility',master.invalid.length?'missing':master.unresolved.length?'manual':'ready','装備可否');
 for(const row of rows)if(row.kind!=='info')add(row.id,row.kind==='missing'?'missing':'manual',row.reason);
 const ceioRandom=plan?.map==='2-5'&&route.contract?.data?.index===1&&route.contract.data.path==='CEIO'&&route.status==='partial',status=checks.some(x=>x.status==='missing')?'missing':checks.some(x=>x.status!=='ready')?ceioRandom&&checks.every(x=>['ready','partial'].includes(x.status))?'partial':'manual':'ready';
 return {status,checks,registeredReady:status==='ready',complete:false,detail:status==='missing'?'登録条件に不足があります':status==='partial'?'Iの索敵はランダム域です。固定O条件は未成立で、装備購入必須や経路全体・戦闘勝利を意味しません。':status==='manual'?ceioRandom?'Iの索敵はランダム域です。ほかの情報不足・未判定の条件も確認してください。':'情報不足・未判定の条件があります':'登録範囲の条件を充足。全ルート条件の網羅・戦闘勝利は保証できません'};
}
async function hdOCFindAlternatives(c,result,limits={}){
 const aswChoice=hdOCAswSetCapture(c);hdOCAswSetRequire(aswChoice,c);const signature=hdOCSignature(c,aswChoice);if(!result||result.signature!==signature)throw Object.assign(new Error('Stale proposal'),{code:'HD_OC_STALE'});
 hdOCRevalidateResult(result);
 const original=hdFEPlanFromSavedFleet(c.map,c.fleet),target=hdFSLevelTarget(c.map),live=hdFSLiveState();
 const roster=hdFERoster().filter(row=>hdFEFindShip(row.name)&&hdFSOperational(row,live).available);
 const levelRank=row=>{const lv=Number(row.level)||0;return !lv?1000:target.low&&lv<target.low?500+target.low-lv:Math.abs(lv-(target.high||90))};
 roster.sort((a,b)=>levelRank(a)-levelRank(b));
 // Different hulls can remove speed goals entirely. Compare mean achievement,
 // so extra already-satisfied goals cannot outweigh a verified route repair.
 const quality=r=>{const route=hdFERoute(r.plan);return r.measure.score/Math.max(1,r.measure.goals.length)-hdOCShipOwnership(r.plan).filter(x=>x.status!=='ready').length*500-(route.status==='missing'?200:route.status==='manual'?100:0)};
 let best=result,changed=false,examined=0,aswSelectionSkipped=0;const maxCandidates=Math.max(1,Math.min(40,Number(limits.maxCandidates)||24));
 const problems=hdOCShipOwnership(original),order=original.ships.map((s,i)=>i).sort((a,b)=>Number(problems.find(x=>x.index===b)?.status!=='ready')-Number(problems.find(x=>x.index===a)?.status!=='ready'));
 for(const index of order){
  let selected=best,considered=0;
  for(const row of roster){
   if(examined>=maxCandidates||considered>=Math.max(2,Math.floor(maxCandidates/order.length)))break;
   if(hdOCSignature(c)!==signature)throw Object.assign(new Error('Data changed'),{code:'HD_OC_STALE'});
   const ships=best.plan.ships.map(s=>({ship:s.ship,gameShipId:s.gameShipId,masterId:s.masterId,rosterId:s.rosterId||'',gear:hdOCShipGear(s)}));
   if(ships[index].gameShipId&&Number(ships[index].gameShipId)===Number(row.gameShipId)||ships[index].rosterId&&String(ships[index].rosterId)===String(row.id))continue;
   const db=hdFEFindShip(row.name),masterId=Number(row.masterId)||Number(hdShipDbMasterRowFor(db)?.id)||0;
   ships[index]={ship:row.name,gameShipId:Number(row.gameShipId)||0,masterId,rosterId:row.id||'',gear:ships[index].gear||row.gear||''};
   const fleet={...c.fleet,ships},plan=hdFEPlanFromSavedFleet(c.map,fleet);plan.routeInfo=c.preset?hdFSPresetInfo(c.preset):null;
   // Reject reusing an individual even if the remaining source fleet still has unowned ships.
   if(hdOCShipOwnership(plan).some(x=>x.status==='missing'&&x.detail.includes('1隻を複数枠')))continue;
   examined++;considered++;const candidateContext={...c,fleet},aswChoice=hdOCAswSetCapture(candidateContext);if(!hdOCAswSetCanSearch(aswChoice,candidateContext)){aswSelectionSkipped++;continue}const steps=hdOCSearchSteps(candidateContext,{maxExamined:limits.maxExamined||700,maxDepth:12},aswChoice);let step;
   do{step=steps.next();if(!step.done)await new Promise(resolve=>setTimeout(resolve,0));if(hdOCSignature(c)!==signature){steps.return();throw Object.assign(new Error('Data changed'),{code:'HD_OC_STALE'})}}while(!step.done);
   const candidate=step.value;candidate.signature=signature;
   if(!hdOCGoalRegressions(best.measure,candidate.measure).length&&quality(candidate)>quality(selected))selected=candidate;
  }
  if(selected!==best){best=selected;changed=true}
  if(examined>=maxCandidates)break;
 }
 const ownership=hdOCShipOwnership(best.plan),route=hdFERoute(best.plan),assessment=hdOCReadiness(best.plan,best.measure);
 if(!changed||ownership.some(x=>x.status!=='ready')||route.status!=='ready')return {proposal:null,examined,search:{status:'incomplete',exhaustive:false,examined,maxCandidates,reasons:[examined>=maxCandidates?'ship-candidate-limit':'bounded-ship-search',...(aswSelectionSkipped?['asw-set-target-unselected']:[])]},detail:'探索未完了：確認済みのルート条件と重複防止を満たす代替編成は見つかりませんでした。探索範囲外の組み合わせや不足艦の入手・育成も確認してね。'+(aswSelectionSkipped?` 対潜組数が未選択で他に比較する目標がない${aswSelectionSkipped}候補は比較対象外です。手持ちで不可能・購入必須という結果ではありません。`:'')};
 best.replacements=best.plan.ships.flatMap((s,index)=>s.ship!==original.ships[index]?.ship||Number(s.gameShipId)!==Number(original.ships[index]?.gameShipId)||s.rosterId!==original.ships[index]?.rosterId?[{index,from:original.ships[index]?.ship||'',to:s.ship,level:hdFEAswRoster(s)?.level||null}]:[]);
 best.alternativeAssessment=assessment;return {proposal:best,examined,detail:'艦種・隻数・速力の登録条件と所持個体を確認した代替案です。装備・索敵・制空・先制対潜の不足は別途表示します。'+(aswSelectionSkipped?` 対潜組数が未選択で他に比較する目標がない${aswSelectionSkipped}候補は比較対象外にしました。`:'')};
}
function hdOCOaswHtml(plan,attrs){
 const esc=hdFEEsc;
 return `<div data-hd-oc-asw-ships>${(plan.ships||[]).map((ship,index)=>{
  if(!ship.ship)return '';const scope=hdOCOaswScope(plan,index),state=hdFEOpeningAsw(ship,scope),row=hdFEAswRoster(ship),db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);
  const candidates=state.status==='ready'?[]:hdFLCatalog().filter(item=>Number(item.stats?.対潜)>0&&profile&&profile.slots.some((capacity,i)=>hdOCCompatible({si:index,index:i,db,profile,capacity},{item,star:0}))).sort((a,b)=>Number(b.stats.対潜)-Number(a.stats.対潜)).slice(0,3);
  return `<article><b>第${index+1}艦 ${esc(ship.ship)}・${esc(hdFSLevelText(row?.level,hdFSLevelTarget(plan.map)))}</b>${hdFEOpeningAswHtml(ship,scope,`${attrs} data-hd-oc-oasw-ship="${index}"`)}${candidates.length?`<details><summary>先制対潜用の装備候補・入手方法</summary>${candidates.map(item=>`<p>${esc(item.name)}：素対潜${Number(item.stats.対潜)} / 所持${hdFLRows().filter(x=>x.name===item.name).reduce((n,x)=>n+(Number(x.count)||0),0)}個。${esc(item.obtain||'入手経路を出典で確認')} <a href="${esc(hdEquipWikiUrl(item.name))}" target="_blank" rel="noopener">入手・改修方法</a></p>`).join('')}</details>`:''}</article>`;
 }).join('')}</div>`;
}
function hdOCMissingShipsHtml(plan){
 const checks=hdOCShipOwnership(plan),issues=checks.filter(x=>x.status!=='ready'),esc=hdFEEsc;if(!issues.length)return '';
 return `<div data-hd-oc-missing-ships><b>所持個体の割当確認 ${checks.length-issues.length} / 必要 ${checks.length}隻</b>${issues.map(x=>`<article><p>第${x.index+1}艦 ${esc(x.ship)}：${esc(x.detail)}</p>${typeof hdShipDbAcquisitionHtml==='function'?hdShipDbAcquisitionHtml(x.ship):''}</article>`).join('')}</div>`;
}
function hdOCSearchStatusHtml(result){
 if(result.measure.complete||result.search?.exhaustive!==false)return '';
 const s=result.search,reasons={'air-target-unselected':'制空の戦闘マス・目標が未選択（入力待ち）','port-seed-limit':'担当艦セットの操作上限','combination-limit':'通常探索の候補上限','depth-limit':'探索深さ上限','candidate-limit':'装備候補の絞込み','beam-limit':'途中候補の絞込み','bounded-search':'有限範囲の探索','route-radar-stock':'登録台帳の電探在庫0を確認。他の変更可能な目標は成立しているため、所持情報の確認へ','route-ship-data':'未登録艦の情報不足。他の変更可能な目標は成立しているため、艦情報の確認へ','five-four-fixed-stock':'登録台帳にない推奨装備目標が残っています。他の変更可能な目標は成立しているため、所持情報を確認してください','five-four-fixed-data':'未登録艦の情報不足と、登録台帳にない推奨装備目標が残っています。他の変更可能な目標は成立しているため、艦情報・所持情報を確認してください'},details=[];
 if(Number.isFinite(s.examined)&&Number.isFinite(s.maxExamined))details.push(`通常探索 ${s.examined}/${s.maxExamined}候補`);
 if(s.portSeed?.examined)details.push(`担当艦セット ${s.portSeed.examined}/${s.portSeed.maxOperations||800}操作${s.portSeed.limited?'（上限で打切り）':''}`);
 details.push(...(s.reasons||[]).map(x=>reasons[x]||'限定した探索範囲'));
 return `<p data-hd-oc-search-status>探索未完了：${s.reasons?.includes('air-target-unselected')?'制空の対象が未選択のため未判定です。艦種など他の不足は各条件欄を確認してください':s.reasons?.some(x=>['route-radar-stock','route-ship-data','five-four-fixed-stock','five-four-fixed-data'].includes(x))?'この固定編成の装備交換だけでは解消できない入力を確認しました':'限られた候補・組合せで条件を満たす配備を発見できませんでした'}。${hdFEEsc(details.join(' / '))}。${s.reasons?.some(x=>['five-four-fixed-stock','five-four-fixed-data'].includes(x))?'現在案は未充足・未判定を残したままです。手持ちで不可能・購入必須と断定した結果ではありません。':''}現在案の未充足は、手持ち装備の不足を証明するものではありません。所持数から確認できる不足と区別し、装備の配備先・代替艦・条件を確認してください。探索の網羅性・最適性は保証しません。</p>`;
}
function hdOCSavedSearchHtml(c){
 const s=c.fleet?.searchAssessment;if(!s||s.status!=='incomplete'||s.exhaustive!==false)return '';
 if(s.scope){if(s.scope.map!==c.map||Number(s.scope.routeIndex)!==Number(c.index))return ''}
 else {const saved=c.fleet.routePreset&&hdMapPresetRequirements(c.map,c.fleet.routePreset);if(!saved||saved.index!==c.index)return ''}
 return `<div data-hd-oc-saved-search><small>保存時の探索記録です。現在の台帳・担当艦指定・条件で再探索した結果ではありません。</small>${hdOCSearchStatusHtml({measure:{complete:false},search:s})}</div>`;
}
function hdOCReviewHeadline(measure,rows){
 if(!measure.goals.length)return 'この海域は装備条件を自動判定できません';
 if(!measure.complete)return measure.goals.some(g=>g.knownRandom)?'索敵ランダム域・未充足や未判定を含む配備案':'配備案に未充足・未判定の装備条件あり';
 if(rows.some(x=>x.kind==='missing'))return '登録済み装備目安は充足・編成や基地計画に未充足あり';
 if(rows.some(x=>x.id==='owned-ships-data'))return '登録済み装備目安は充足・所持艦の情報不足で未充足・未判定の項目あり';
 if(rows.some(x=>x.kind==='data'))return '登録済み装備目安は充足・情報不足で未判定の項目あり';
 if(rows.some(x=>x.kind==='manual'))return '登録済み装備目安は充足・自動判定できない項目あり';
 return '登録済み装備目安は充足';
}
function hdOCReviewHtml(rows,attrs){
 const groups=[['missing','条件を満たしていない'],['data','情報不足で未判定'],['manual','自動判定できない項目'],['info','攻略の参考情報']],labels={sync:'ゲーム連携を開く',equipment:'装備台帳を開く',ships:'艦娘データベースを開く',route:'編成例を選ぶ',calculator:'制空・索敵計算を開く',base:'基地航空隊の計画を開く'},esc=hdFEEsc;
 return `<div data-hd-oc-reviews>${groups.map(([kind,label])=>{const items=rows.filter(x=>x.kind===kind);if(!items.length)return '';return `<div class="hd-oc-review-group ${kind}" data-hd-oc-review-kind="${kind}"><b>${label} ${items.length}件</b>${items.map(x=>`<article data-hd-oc-review-id="${esc(x.id)}"><strong>${esc(x.title)}</strong><p>${esc(x.reason)}</p><p><b>次にすること：</b>${esc(x.next)}</p>${x.action?`<button type="button" class="ghost small" data-hd-oc-review="${x.action}" ${attrs}>${labels[x.action]}</button>`:''}${x.source?`<a class="guide-link" href="${esc(x.source)}" target="_blank" rel="noopener">条件の判定元 ↗</a>`:''}</article>`).join('')}</div>`}).join('')}</div>`;
}
function hdOCReviewRefresh(){
 for(const panel of document.querySelectorAll('.hd-oc-panel[data-hd-oc-map]')){const c=hdOCContext(panel.dataset.hdOcMap,panel.dataset.hdOcFleet,panel.dataset.hdOcRoute),result=HD_OC_CACHE.get(`${c.map}:${c.fleet?.id||''}:${c.index}`);if(!result||result.signature!==hdOCSignature(c))continue;
  const rows=hdOCReview(result.plan,result.measure),host=panel.querySelector('[data-hd-oc-reviews]'),headline=panel.querySelector('[data-hd-oc-headline]');if(host)host.outerHTML=hdOCReviewHtml(rows,`data-hd-oc-map="${hdFEEsc(c.map)}" data-hd-oc-fleet="${hdFEEsc(c.fleet.id)}" data-hd-oc-route="${c.index}"`);if(headline)headline.textContent=hdOCReviewHeadline(result.measure,rows);
 }
}
window.addEventListener('hd:land-base-changed',hdOCReviewRefresh);

function hdOCPanel(map,fleetId='',route=''){
 if(typeof hdFLInventory!=='function')return '';
 const c=hdOCContext(map,fleetId,route),aswChoice=hdOCAswSetCapture(c),aswCanSearch=hdOCAswSetCanSearch(aswChoice,c),key=`${map}:${c.fleet?.id||''}:${c.index}`,signature=hdOCSignature(c,aswChoice),cached=HD_OC_CACHE.get(key),result=aswCanSearch&&cached&&cached.signature===signature?cached:null,searching=HD_OC_PENDING.get(key)?.signature===signature,esc=hdFEEsc;
 const attrs=`data-hd-oc-map="${esc(map)}" data-hd-oc-fleet="${esc(c.fleet?.id||'')}" data-hd-oc-route="${c.index}"`;
 const reviews=result?hdOCReview(result.plan,result.measure):[],readiness=result?hdOCReadiness(result.plan,result.measure,reviews):null;
 return `<section class="hd-oc-panel" ${attrs}>${typeof hdSECapabilityHtml==='function'?(['6-5','7-2'].includes(map)||map==='1-5'&&c.index===1||map==='7-3'&&c.index===0||map==='7-4'&&c.index===0||map==='7-5'&&[0,1,2].includes(c.index)?hdSECapabilityHtml(map,c.fleet?.id||'',null,c.preset):hdSECapabilityHtml(map,c.fleet?.id||'')):''}${typeof hdSEOptionalAaAdviceHtml==='function'?hdSEOptionalAaAdviceHtml(c.map,{index:c.index,preset:c.preset}):''}<strong>手持ち装備で攻略条件を満たす</strong><p>${c.fleet?`対象：${esc(c.fleet.name||'保存編成')}。所持数・改修値・装備可否・空きスロットから配備案を探します。他の艦の装備も移し替える前提です。`:'先に自分用編成を保存・選択すると、艦ごとに手持ち装備を配備できます。'}</p>${hdMapRequirementsHtml(map,c.preset)}${hdOCRouteGoalHtml(c,attrs)}${hdOCAswSetHtml(c,attrs,aswChoice)}${hdOCOaswTargetHtml(c,attrs)}${hdOCPortHtml(c,result,attrs)}${result?'':hdOCSavedSearchHtml(c)}<button type="button" class="primary small" data-hd-oc-search ${attrs} ${c.fleet&&!searching&&aswCanSearch?'':'disabled'}>${searching?'手持ち装備を確認中…':'手持ちで条件を満たす配備を探す'}</button><button type="button" class="ghost small" data-hd-oc-select-fleet ${attrs}>艦隊を選ぶ・保存する</button>${result?`<div class="hd-oc-result"><b data-hd-oc-headline>${hdOCReviewHeadline(result.measure,reviews)}</b><p data-hd-oc-readiness>${esc(readiness.detail)}</p>${result.replacements?.length?`<p data-hd-oc-replacements>${result.replacements.map(x=>esc('第'+(x.index+1)+'艦：'+x.from+' → '+x.to+' Lv'+(x.level||'未確認'))).join(' / ')}</p>`:''}${hdOCSearchStatusHtml(result)}${hdOCRequiredChecksHtml(result.plan,result.measure)}${result.measure.goals.map(g=>`<div class="hd-oc-goal ${g.ok?'ready':g.knownRandom?'partial':g.unresolved?'manual':'missing'}"><strong>${esc(g.label)}：${g.ok?'充足':g.knownRandom?'ランダム域（固定O未成立）':g.unresolved?(g.kind==='los-value'?'未確認':'未判定'):'不足'}</strong><small>${g.routeAim==='fixed-O'?'固定Oを目指す追加索敵条件':g.purpose==='route'?'経路必須':g.purpose==='recommendation'?'戦闘推奨':'選択した方針の目標'}</small><span>${esc(g.detail)}</span></div>`).join('')}${hdOCScoutingOptionsHtml(c,result)}${hdOCAirCountInspectionHtml(hdOCAirCountInspection(c,result))}${hdOCRadarCountInspectionHtml(hdOCRadarCountInspection(c,result))}${result.shortages.map((g,index)=>`<div class="hd-oc-shortage"><b>${esc(hdOCScoutingOptional(c,g)||hdOCAirCountOptional(c,g)||hdOCRadarCountOptional(c,g)?g.label+'（任意目安）':g.label+'に必要なもの')}</b><p>${esc(g.detail)}。${hdOCRadarCountOptional(c,g)?'任意目安の未達です。装備個数の差を通行必須数・確定調達数へ換算しません':g.routeEquipment?(g.goalKind==='drum-ships'?'ドラム缶':'電探')+'装備艦があと'+Math.ceil(g.shortfall)+'隻必要。同じ艦の複数装備では増えません。装備可能な別の艦と空き枠も確認してください':g.asw?'艦別判定で必要装備・対潜値を確認。装備の個数に換算できない不足です':g.capability?'同じ艦の推奨セットが未完成。下の装備別不足・配備可否を確認してね':g.kind==='高速化'?(g.goalKind==='speed-ship'?'缶の種類・改修値・同じ艦への配備、到達可能な速力を確認':`同じ艦のセットがあと ${Math.ceil(g.shortfall)}組。タービン・缶の内訳を確認してね`):['制空','索敵'].includes(g.kind)&&['air-value','los-value'].includes(g.goalKind||g.kind)?'性能・搭載枠を増やす必要あり':`配備不足 ${Math.ceil(g.shortfall)}個 / 同種の所持 ${g.owned}個`}。${g.placement&&!g.blocked&&!g.capability?'所持数は足りています。装備可否・配備枠・他の条件との両立を見直してね。':''}${g.candidates.length?'装備候補：'+esc(g.candidates.join('、')):hdOCRadarCountOptional(c,g)?'この確認範囲で装備候補を確認できません。艦・枠・装備情報を見直してください。搭載不可や在庫不足とは断定しません。':'この編成に載せられる候補なし。艦種や装備枠を見直してね。'}</p><button type="button" class="ghost small" data-hd-oc-acquire="${esc(g.kind.startsWith('speed-')?'高速化':g.kind)}" ${attrs}>入手方法を見る</button>${hdOCPlacementHtml(g,c)}${g.twoAreaCarrierReference?hdOCTwoAreaCarrierReferenceHtml(g.twoAreaCarrierReference):hdOCCapabilityStockHtml(g)}${hdOCProcurementHtml(g,index,attrs,c)}</div>`).join('')}<div class="hd-oc-ships">${result.plan.ships.map(s=>`<p><b>${esc(s.ship)}</b><span>${esc([...s.items.map(x=>`第${x.slotIndex+1}：${x.name}${x.star?' ★'+x.star:''}`),...(s.expansion?[`増設：${s.expansion.name}${s.expansion.star?' ★'+s.expansion.star:''}`]:[])].join(' / ')||'配備なし')}</span></p>`).join('')}</div>${hdOCMissingShipsHtml(result.plan)}${hdOCOaswTarget(c)?hdOCOaswHtml(result.plan,attrs):''}${hdOCReviewHtml(reviews,attrs)}<button type="button" class="ghost small" data-hd-oc-alternatives ${attrs} ${searching?'disabled':''}>所持艦娘・代替装備で再探索</button>${result.alternativeNote?`<p data-hd-oc-alternative-note>${esc(result.alternativeNote)}</p>`:''}${hdOCProcurementUpdateHtml(c,result,attrs)}<button type="button" class="primary small" data-hd-oc-calculator ${attrs}>この配備で制空・索敵を確認</button><small>探索した配備案を制空・索敵プランナーへ反映済み。司令部Lvは同期値を使用します。</small><button type="button" class="ghost small" data-hd-oc-apply ${attrs}>${readiness.registeredReady?'この配備を保存編成に反映':readiness.status==='partial'?'ランダム域を含む配備案を保存':readiness.status==='manual'?'未確認を含む配備案を保存':'不足を残した配備案を保存'}</button><small>登録済み目安・制空は熟練度なしの推定。探索で見つからない組み合わせもあります。保存後はゲーム側の装備を変更し、基地航空隊・ルート条件も確認してね。</small></div>`:''}</section>`;
}
function hdOCInlineResult(map,fleetId){
 const c=hdOCContext(map,fleetId),result=HD_OC_CACHE.get(`${map}:${fleetId}:${c.index}`);
 return result&&result.signature===hdOCSignature(c)?result:null;
}
function hdOCInlineShipHtml(result,index){
 if(!result)return '';
 const ship=result.plan.ships[index];if(!ship)return '';
 const slots=[...ship.items.map(x=>`第${x.slotIndex+1}：${x.name}${x.star?' ★'+x.star:''}`),...(ship.expansion?[`増設：${ship.expansion.name}${ship.expansion.star?' ★'+ship.expansion.star:''}`]:[])];
 return `<div class="hd-oc-inline-ship"><b>手持ちの攻略配備案</b><span>${hdFEEsc(slots.join(' / ')||'配備できる手持ち装備なし')}</span><small>${result.measure.complete?'編成全体の登録済み装備目安は充足。確認項目も見てね':'編成全体に不足・未判定の条件あり。下の内訳を確認してね'}</small></div>`;
}
function hdOCInlinePanel(map,fleetId){
 const c=hdOCContext(map,fleetId),presets=typeof hdMSNPresets==='function'?hdMSNPresets(map):[];
 const choices=presets.length?`<label class="hd-oc-inline-route">攻略する編成例 <select data-hd-oc-inline-route data-hd-oc-map="${hdFEEsc(map)}">${presets.map((p,i)=>`<option value="${i}" ${i===c.index?'selected':''}>${hdFEEsc((p.name||`候補${i+1}`)+(p.use?' ｜ '+p.use:''))}</option>`).join('')}</select></label>`:'<p>編成例のルート条件は別途確認してね。</p>';
 return `<div class="hd-oc-inline">${choices}${hdOCPanel(map,fleetId,c.index)}</div>`;
}
function hdOCInlineRefresh(){if(typeof renderCustomFleets==='function'&&typeof selectedMap!=='undefined'&&selectedMap)renderCustomFleets(selectedMap)}
document.addEventListener('change',e=>{if(e.target.id==='hdMapStrategyRoute'){setTimeout(hdOCInlineRefresh,0);return}if(!e.target.matches?.('[data-hd-oc-inline-route]'))return;const map=e.target.dataset.hdOcMap,index=Number(e.target.value);if(typeof hdMapRouteSet==='function'){if(!hdMapRouteSet(map,index))hdOCRefresh();return}if(typeof hdMSNRouteByMap!=='undefined')hdMSNRouteByMap[map]=index;hdOCRefresh()});
window.addEventListener('hd:map-route-changed',hdOCRefresh);
['hd:night-ci-policy','hd:equipment-changed','hd:kancolle-sync','hd:custom-fleets-changed','hd:ship-identity-changed','hd:workspace-refresh'].forEach(event=>window.addEventListener(event,hdOCInlineRefresh));
window.addEventListener('storage',e=>{if(e.key==='harbordesk-map-routes-v1'){hdOCRefresh();return}if(e.key===null||[HD_SE_NIGHT_POLICY_KEY,HD_OC_ASW_SET_CHOICE_KEY,'harbordesk-custom-fleets-v1','harbordesk-equipment-v1','harbordesk-ship-roster-v1','harbordesk-kancolle-sync-v1'].includes(e.key))hdOCInlineRefresh()});
window.addEventListener('hd:map-air-changed',()=>hdOCRefresh());
function hdOCRefresh(){hdOCInlineRefresh();if(typeof hdRenderMapEquipmentRecommendations==='function')hdRenderMapEquipmentRecommendations();if(typeof hdMSNRender==='function')hdMSNRender()}
document.addEventListener('change',e=>{
 const aswSets=e.target.closest?.('[data-hd-oc-asw-sets]');if(aswSets){const c=hdOCContext(aswSets.dataset.hdOcMap,aswSets.dataset.hdOcFleet,aswSets.dataset.hdOcRoute);try{hdOCAswSetSave(c,aswSets.value);window.dispatchEvent(new Event('hd:asw-set-choice'));hdOCRefresh()}catch{hdToast('対潜組数設定を保存できませんでした。元の値を保持しています','warn');hdOCRefresh()}return}
 const port=e.target.closest?.('[data-hd-oc-port-ship]');if(port){const c=hdOCContext(port.dataset.hdOcMap,port.dataset.hdOcFleet,port.dataset.hdOcRoute);try{hdOCPortSave(c,Number(port.dataset.hdOcPortShip),port.checked);hdOCRefresh()}catch{port.checked=!port.checked;hdToast('担当艦を保存できませんでした。保存値・個体を確認して再操作してください','warn')}return}
 const route=e.target.closest?.('[data-hd-oc-route-goal]');if(route){const auto=String(route.dataset.hdOcFleet||'').startsWith('auto:')?HD_FL_CACHE[route.dataset.hdOcMap+':'+String(route.dataset.hdOcFleet).split(':').at(-1)]:null,c=auto?hdFLContext(auto):hdOCContext(route.dataset.hdOcMap,route.dataset.hdOcFleet,route.dataset.hdOcRoute);if(!MAP_PLANS[c.map]?.routeBranches?.goals?.[route.value])return;let stored={};try{stored=JSON.parse(localStorage.getItem(HD_OC_ROUTE_GOAL_KEY)||'{}');stored[`${c.map}:${c.fleet?.id||''}`]=route.value;localStorage.setItem(HD_OC_ROUTE_GOAL_KEY,JSON.stringify(stored))}catch{hdToast('ルート目標を保存できませんでした','warn');return}if(auto){const card=route.closest('.hd-fs-card');if(card){hdFLRender(auto.index,card);hdFSRender()}}else hdOCRefresh();return}
 const input=e.target.closest?.('[data-hd-oc-asw-target],[data-hd-oc-oasw-ship][data-hd-oasw-value]');if(!input)return;
 const c=hdOCContext(input.dataset.hdOcMap,input.dataset.hdOcFleet,input.dataset.hdOcRoute),key=`${c.map}:${c.fleet?.id||''}:${c.index}`;
 if(input.hasAttribute('data-hd-oc-asw-target')){
  const value=Number(input.value);if(!Number.isInteger(value)||value<0||value>7||input.value.trim()===''){input.setCustomValidity('0〜7隻の整数で指定してね');input.reportValidity();return}input.setCustomValidity('');
  const targets=hdOCOaswTargets();targets[key]=value;try{localStorage.setItem(HD_OC_ASW_TARGET_KEY,JSON.stringify(targets))}catch{hdToast('目標人数を保存できませんでした','warn');return}
  window.dispatchEvent(new Event('hd:opening-asw-target'));hdOCRefresh();return;
 }
 const result=HD_OC_CACHE.get(key),ship=result?.plan.ships[Number(input.dataset.hdOcOaswShip)];if(!result||result.signature!==hdOCSignature(c)||!ship){hdOCRefresh();return}
 const value=hdFEAswNumber(input.value);if(input.value.trim()!==''&&value==null){input.setCustomValidity('0〜500の整数で入力してね');input.reportValidity();return}input.setCustomValidity('');
 const scope=hdOCOaswScope(result.plan,Number(input.dataset.hdOcOaswShip)),confirmed=hdFEAswConfirmed(),id=hdFEAswKey(ship,scope);if(value==null)delete confirmed[id];else confirmed[id]=value;
 try{localStorage.setItem(HD_FE_OASW_CONFIRM_KEY,JSON.stringify(Object.fromEntries(Object.entries(confirmed).slice(-80))))}catch{hdToast('対潜値を保存できませんでした','warn');return}
 result.measure=hdOCMeasure(result.plan,hdSEChecks(c.map).rows.filter(x=>x.kind!=='基地航空隊'));result.signature=hdOCSignature(c);
 result.shortages=result.shortages.filter(x=>x.goalKind!=='opening-asw');const goal=result.measure.goals.find(x=>x.kind==='opening-asw');if(goal&&!goal.ok&&!goal.unresolved)result.shortages.push({...goal,goalKind:'opening-asw',kind:'対潜',owned:0,placement:false,shortfall:goal.minCount-goal.count,candidates:[],asw:true});
 if(typeof hdFCImportOwnedPlanForUI==='function')hdFCImportOwnedPlanForUI(c,result);hdOCRefresh();
});
window.addEventListener('hd:opening-asw-target',()=>{if(typeof hdFLInvalidate==='function')hdFLInvalidate()});
window.addEventListener('hd:asw-set-choice',()=>{if(typeof hdFLInvalidate==='function')hdFLInvalidate()});
document.addEventListener('click',e=>{
 const clear=e.target.closest?.('[data-hd-oc-port-clear]');if(clear){try{hdOCPortSave(hdOCContext(clear.dataset.hdOcMap,clear.dataset.hdOcFleet,clear.dataset.hdOcRoute),-1,false);hdOCRefresh()}catch{hdToast('担当艦を解除できませんでした。保存値を確認してください','warn')}return}
 const button=e.target.closest?.('[data-hd-oc-alternatives],[data-hd-oc-search],[data-hd-oc-calculator],[data-hd-oc-apply],[data-hd-oc-acquire],[data-hd-oc-select-fleet],[data-hd-oc-procure],[data-hd-oc-procurement-update],[data-hd-oc-review]');if(!button)return;
 if(button.hasAttribute('data-hd-oc-review')){
  const action=button.dataset.hdOcReview,map=button.dataset.hdOcMap;
  if(action==='route'){hdMSNOpen(map);return}
  if(action==='calculator'||action==='base'){
   if(action==='calculator'){
    const c=hdOCContext(map,button.dataset.hdOcFleet,button.dataset.hdOcRoute),result=HD_OC_CACHE.get(`${c.map}:${c.fleet?.id}:${c.index}`);
    if(!result){hdToast('最新の条件で配備を探してから計算してね','warn');return}if(typeof hdFCImportOwnedPlanForUI==='function'){const accepted=hdFCImportOwnedPlanForUI(c,result);if(accepted===null)return;if(!accepted){hdToast('最新の条件で配備を探してから計算してね','warn');return}}
   }
   if(typeof hdSelectGuideMap==='function')hdSelectGuideMap(map);
   if(typeof hdFEOpenCalculator==='function')hdFEOpenCalculator();
   if(action==='base'&&typeof hdFEDeferNavigation==='function')hdFEDeferNavigation(()=>document.getElementById('hdLandBasePlanner')?.scrollIntoView({behavior:'smooth',block:'start'}),120);
   return;
  }
  const target={sync:'kancolleImport',equipment:'equipmentBook',ships:'shipDatabase'}[action];if(target&&typeof hdQNJump==='function')hdQNJump(target);else if(target&&typeof hdWSShowElement==='function')hdWSShowElement(target,true);return;
 }
 if(button.hasAttribute('data-hd-oc-select-fleet')){hdOCOpenFleetPicker(button.dataset.hdOcMap,button.dataset.hdOcFleet);return}
 const c=hdOCContext(button.dataset.hdOcMap,button.dataset.hdOcFleet,button.dataset.hdOcRoute);if(!c.fleet)return;
 const key=`${c.map}:${c.fleet.id}:${c.index}`;
 if(button.hasAttribute('data-hd-oc-acquire')){if(typeof hdAGOpen==='function')hdAGOpen(button.dataset.hdOcAcquire,c.map);return}
 if(button.hasAttribute('data-hd-oc-search')){
  const aswChoice=hdOCAswSetCapture(c);if(!hdOCAswSetCanSearch(aswChoice,c)){hdToast(aswChoice?.selection?.state==='invalid'?'保存した対潜組数設定を確認できません。元の値を保持しています':'対潜装備セットの組数か「比較しない」を選んでください','warn');return}
  const signature=hdOCSignature(c,aswChoice);if(HD_OC_PENDING.get(key)?.signature===signature)return;
  const pending={signature};HD_OC_PENDING.set(key,pending);button.disabled=true;button.textContent='手持ち装備を確認中…';
  const finish=()=>{if(HD_OC_PENDING.get(key)===pending)HD_OC_PENDING.delete(key)};
  hdOCSearchAsync(c).then(result=>{finish();HD_OC_CACHE.set(key,result);if(typeof hdFCImportOwnedPlanForUI==='function')hdFCImportOwnedPlanForUI(c,result);hdOCRefresh()}).catch(err=>{
   finish();button.disabled=false;button.textContent='手持ちで条件を満たす配備を探す';hdOCRefresh();
   hdToast(err.code==='HD_OC_STALE'?'編成や台帳が更新されたので、もう一度配備を探してね':'配備案を作れなかったよ。編成と台帳を確認してね','warn');
  });return;
 }
 const result=HD_OC_CACHE.get(key);if(!result||result.signature!==hdOCSignature(c)){hdToast('編成や台帳が変わったので、もう一度配備を探してね','warn');hdOCRefresh();return}
 if(button.hasAttribute('data-hd-oc-calculator')){
  if(typeof hdFCImportOwnedPlanForUI==='function'&&!hdFCImportOwnedPlanForUI(c,result))return;
  if(typeof hdSelectGuideMap==='function')hdSelectGuideMap(c.map);
  if(typeof hdFEOpenCalculator==='function')hdFEOpenCalculator();return;
 }
 if(button.hasAttribute('data-hd-oc-procurement-update')){
  try{const change=hdOCUpdateProcurement(c,result);if(change){hdToast(change.removed||change.updated?`調達計画を更新したよ。所持不足解消 ${change.removed}件・必要数更新 ${change.updated}件`:'保存済みの調達計画は現在の必要数と一致しているよ','success');hdOCRefresh()}}
  catch{hdToast('調達計画を保存できなかったよ。計画は残しているので再試行してね','warn')}return;
 }
 if(button.hasAttribute('data-hd-oc-procure')){
  const target=button.closest('.hd-oc-shortage')?.querySelector('[data-hd-oc-target]')?.value;
  try{if(hdOCAddProcurement(c,result,Number(button.dataset.hdOcProcure),target)){hdToast('不足候補を調達リストに保存したよ。入手後に配備を再確認してね','success');if(typeof hdPLOpenList==='function')hdPLOpenList()}}
  catch{hdToast('調達リストを保存できなかったよ。もう一度試してね','warn')}return;
 }
 if(button.hasAttribute('data-hd-oc-alternatives')){
  if(HD_OC_PENDING.has(key))return;HD_OC_PENDING.set(key,{signature:result.signature});button.disabled=true;button.textContent='代替編成を確認中…';
  hdOCFindAlternatives(c,result).then(found=>{HD_OC_PENDING.delete(key);if(found.proposal){found.proposal.alternativeNote=found.detail;HD_OC_CACHE.set(key,found.proposal);hdFCImportOwnedPlanForUI(c,found.proposal)}else result.alternativeNote=found.detail;hdOCRefresh()}).catch(err=>{HD_OC_PENDING.delete(key);hdOCRefresh();hdToast(err.code==='HD_OC_STALE'?'台帳・条件が変わりました。最新の情報で再探索してね':'代替探索を完了できませんでした。再探索してね','warn')});return;
 }
 hdOCRevalidateResult(result);
 if(result.plan.preservationIssues?.length){hdToast('未登録の艦娘・装備を含むため、元の保存編成は上書きしません。台帳・マスター情報を確認してね','warn');return}
 let all;try{all=hdOCPortTargets(result.plan).length?hdOCPortReadFleets():loadCustomFleets()}catch{hdToast('保存編成を読み取れないため反映を中止しました','warn');return}const fleet=(all[c.map]||[]).find(x=>String(x.id)===String(c.fleet.id));if(!fleet){hdToast('自分用編成に保存してから反映してね','warn');return}
 try{hdOCOaswPreserveFleetGoal({...c,fleet})}catch{hdToast('以前の人数目標を保持できなかったので保存を中止しました。配備案は残しているので再試行してね','warn');return}
 let si=0;for(const ship of fleet.ships||[]){if(!String(ship.ship||'').trim()&&!String(ship.gear||'').trim())continue;const row=result.plan.ships[si++];if(!row)continue;if(result.replacements?.some(x=>x.index===si-1)){ship.ship=row.ship;ship.gameShipId=row.gameShipId||0;ship.masterId=row.masterId||0;ship.rosterId=row.rosterId||''}const normal=Array.from({length:Math.max(0,...row.items.map(x=>x.slotIndex+1))},(_,i)=>{const item=row.items.find(x=>x.slotIndex===i);return item?item.name+(item.star?' ★'+item.star:''):''});ship.gear=[...normal,...(row.expansion?[`[増設] ${row.expansion.name}${row.expansion.star?' ★'+row.expansion.star:''}`]:[])].join(' / ')}
 if(c.preset)fleet.routePreset={...c.preset};if(MAP_PLANS[c.map]?.routeBranches?.goals){fleet.routeGoal=result.plan.routeGoal;fleet.routeAssessment={status:hdFERoute(result.plan).status,branch:hdFEBranchRoute(result.plan),at:Date.now()}}fleet.searchAssessment=result.search||result.plan.search||null;fleet.openingAswCount=result.plan.openingAswCount??hdOCOaswTarget(c);if(hdFERouteContract(result.plan))fleet.routeAssessment={status:hdFERoute(result.plan).status,branch:hdFEBranchRoute(result.plan),contract:hdFERouteContract(result.plan),at:Date.now()};
 try{saveCustomFleets(all)}catch{hdToast('保存できなかったよ。配備案は残しているので再試行してね','warn');return}
 HD_OC_CACHE.delete(key);hdToast('配備案を保存したよ。ゲーム側でも装備を変更してね','success');hdOCRefresh();
});
const hdOCPrev=hdSortieEquipmentCheckHtml;hdSortieEquipmentCheckHtml=function(map){return hdOCPrev(map)+hdOCPanel(map)};
hdOCRefresh();
