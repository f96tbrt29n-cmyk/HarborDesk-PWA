/* 海域攻略ナビと長期目標の接続。ゲーム内での達成は手動で確認する。 */
const HD_STRATEGY_UNLOCKS={
 '3-2':{maps:['3-1','1-5']},
 '3-3':{maps:['3-2','2-4']},
 '4-5':{maps:['4-4','5-1']},
 '5-6':{maps:['5-5']},
 '6-1':{maps:['5-4']},
 '6-2':{maps:['6-1']},
 '6-3':{maps:['6-2']},
 '6-4':{maps:['6-3']},
 '6-5':{maps:['6-4'],quests:['F43']},
 '7-1':{maps:['2-4']},
 '7-2':{maps:['7-1']},
 '7-3':{maps:['7-2']},
 '7-4':{maps:['7-3']},
 '7-5':{maps:['7-4']}
};
const HD_STRATEGY_UNLOCK_QUESTS={
 F43:{name:'中部海域「基地航空隊」展開！',needs:'設営隊の入手と前提任務を確認',maps:/^6-[4-5]$/,url:'https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99#id-F43'},
 B175:{name:'南西海域「基地航空隊」開設！',needs:'設営隊の入手と前提任務を確認',maps:/^7-[4-5]$/,url:'https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99#id-B175'}
};
const HD_STRATEGY_QUEST_EDGES={Bq10:['Bq2'],By7:['By6'],By8:['By6'],By9:['By8'],By10:['By9']};
function hdStrategyEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdStrategyCandidate(map,category,source,ref,title,detail,extra={}){
 return {id:`auto-${source}-${String(ref).replace(/[^a-zA-Z0-9_-]/g,'_')}`,sourceKey:`${map}:${source}:${ref}`,category,source,ref:String(ref),map,scope:'map',title,detail,...extra};
}
function hdStrategyNavChecks(map){
 try{
  const fleets=hdMSNFleets(map),fleet=fleets.find(x=>String(x.id)===String(hdMSNFleetId(map,fleets)));
  if(!fleet||typeof hdFEPlanFromSavedFleet!=='function'||typeof hdFEEvaluate!=='function')return [];
  const preset=hdMSNPresets(map)[hdMSNRouteIndex(map,hdMSNPresets(map))];
  const plan=hdFEPlanFromSavedFleet(map,fleet);if(preset){plan.preset=preset;plan.routeInfo=typeof hdFSPresetInfo==='function'?hdFSPresetInfo(preset):null}
  const result=hdFEEvaluate(plan);
  return (result.auto?.checks||[]).filter(x=>['route','equipment','air','scouting','master'].includes(x.id));
 }catch{return []}
}
function hdStrategyGearRows(map){
 try{const entry=hdPLLoad().find(x=>x.map===map);return entry&&typeof hdPLDemandRows==='function'?hdPLDemandRows(entry.gearItems||[]):[]}catch{return []}
}
function hdStrategyGearChecks(map){try{return typeof hdSEChecks==='function'?(hdSEChecks(map).rows||[]):[]}catch{return []}}
function hdStrategyTrainingRows(map){
 try{
  const fleet=hdMSNFleets(map).find(x=>String(x.id)===String(hdMSNFleetId(map,hdMSNFleets(map))));
  const names=new Set((fleet?.ships||[]).map(x=>String(x.ship||x.name||'').trim()).filter(Boolean));
  return hdTrainingRoster().map(ship=>{
   const plan=hdTrainingPlanFor(ship),lv=Math.max(1,Number(ship.level)||1);
   const inFleet=names.has(ship.name),target=plan.active?plan.target:inFleet?Number(plan.db?.targetLv)||0:0;
   return {ship,plan,lv,target,inFleet,gap:Math.max(0,target-lv)};
  }).filter(x=>x.target>0&&x.gap>0).sort((a,b)=>Number(b.inFleet)-Number(a.inFleet)||Number(b.plan.active)-Number(a.plan.active)||a.gap-b.gap).slice(0,10);
 }catch{return []}
}
function hdStrategyRelatedQuests(map){
 try{return HD_QUESTS.filter(q=>['quarterly','yearly'].includes(q.cycle)&&
   (q.progress||[]).some(([label])=>new RegExp('(^|[^0-9])'+map.replace('-','\\-')+'(?![0-9])').test(String(label)))).slice(0,8)}catch{return []}
}
function hdStrategyQuestProgress(q){
 try{const goals=hdQPGoals(q),row=hdQPStore()[q.id],valid=row?.periodKey===hdQPPeriodKey(q);
  const count=goals.filter((g,i)=>valid&&(Number(row.values?.[i])||0)>=Number(g[1])).length;
  return `${count}/${goals.length} 条件達成（任務の受領・報酬はゲームで確認）`;
 }catch{return '進捗を任務画面で確認'}
}
function hdStrategyCandidates(map){
 if(!map)return [];
 const rows=[],add=x=>{if(!rows.some(r=>r.sourceKey===x.sourceKey))rows.push(x)};
 const unlock=HD_STRATEGY_UNLOCKS[map];
 for(const previous of unlock?.maps||[])add(hdStrategyCandidate(map,'map','unlock',previous,`${previous} のクリアを確認`,map==='5-6'?'5-6 の出撃には今月の 5-5 ゲージ破壊が必要。クリア記録とは別にゲーム画面で確認。':`${map} の開放に関わる海域。クリア状態は手動記録。`,{dependsOn:previous}));
 for(const id of new Set([...(unlock?.quests||[]),...Object.keys(HD_STRATEGY_UNLOCK_QUESTS).filter(k=>HD_STRATEGY_UNLOCK_QUESTS[k].maps.test(map))])){
  const q=HD_STRATEGY_UNLOCK_QUESTS[id];add(hdStrategyCandidate(map,'quest','oneTimeQuest',id,`${q.name}を確認`,`${q.needs}。完了はゲーム画面で確認。`,{prereq:q.needs,sourceUrl:q.url}));
 }
 if(typeof hdMSNFleets==='function'&&!hdMSNFleets(map).length)
  add(hdStrategyCandidate(map,'formation','fleetSetup','saved',`${map} の保存編成を作る`,'艦隊と装備を保存すると、攻略ナビでルート・制空・索敵の差分を判定できます。'));
 for(const check of hdStrategyNavChecks(map).filter(x=>x.status!=='ready')){
  const category=['equipment','air','scouting','master'].includes(check.id)?'gear':'formation';
  add(hdStrategyCandidate(map,category,'nav',check.id,`${check.label}を確認・改善`,check.detail||'保存編成とルートを確認。',{status:check.status}));
 }
 for(const check of hdStrategyGearChecks(map).filter(x=>x.status!=='ready'))
  add(hdStrategyCandidate(map,'gear','gearKind',check.kind,`${check.label}を揃える`,`${check.detail||'装備台帳を確認'}${check.minCount?`・目安 ${check.minCount}個`:''}`,{status:check.status}));
 for(const gear of hdStrategyGearRows(map).filter(x=>(x.target||x.wanted)&&x.shortfall>0)){
  const key=typeof hdPLDemandKey==='function'?hdPLDemandKey(gear,map):gear.target;
  const label=typeof hdPLTargetLabel==='function'?hdPLTargetLabel(gear):gear.target;
  add(hdStrategyCandidate(map,'gear','gear',key,`${label}を揃える`,`必要 ${gear.needed} / 所持 ${gear.owned} / あと ${gear.shortfall}。${gear.methodLabel||'入手方法を確認'}`,{status:gear.status}));
 }
 for(const x of hdStrategyTrainingRows(map))add(hdStrategyCandidate(map,'level','training',x.ship.id,`${x.ship.name} を Lv.${x.target} まで育成`,`現在 Lv.${x.lv} / 目標 Lv.${x.target} / あと ${x.gap}。${x.inFleet?'保存編成の艦。':'育成計画の対象。'}`,{targetLv:x.target,shipId:x.ship.id}));
 const quests=hdStrategyRelatedQuests(map),byId=new Map(HD_QUESTS.map(q=>[q.id,q]));
 const addQuest=(q,stack=new Set())=>{
  if(!q||stack.has(q.id))return;stack.add(q.id);
  for(const id of HD_STRATEGY_QUEST_EDGES[q.id]||[])addQuest(byId.get(id),stack);
  const deps=(HD_STRATEGY_QUEST_EDGES[q.id]||[]).map(id=>byId.get(id)?.name||id);
  add(hdStrategyCandidate(map,'quest','periodicQuest',q.id,`${HD_QUEST_CYCLE_LABEL[q.cycle]}：${q.name}`,
   `${deps.length?`前提：${deps.join('、')}。`:q.prereq?`前提：${q.prereq}。`:''}${hdStrategyQuestProgress(q)}`,{prereq:q.prereq||'',questId:q.id}));
 };
 for(const q of quests)addQuest(q);
 return rows;
}
function hdStrategyTaskView(task,candidates,cleared){
 const live=candidates.find(x=>x.sourceKey===task.sourceKey);
 if(task.source==='unlock'&&task.map==='5-6')return {detail:live?.detail||task.detail,ready:false,status:'今月の 5-5 ゲージ破壊をゲームで確認'};
 if(task.source==='unlock')return {detail:live?.detail||task.detail,ready:cleared.includes(task.ref),status:cleared.includes(task.ref)?'前提海域クリア':'前提海域は未記録'};
 if(task.source==='training'){
  const ship=typeof hdTrainingRoster==='function'?hdTrainingRoster().find(x=>String(x.id)===String(task.shipId||task.ref)):null;
  if(!ship)return {detail:'艦隊台帳の対象艦が見つかりません。',ready:false,status:'台帳を確認'};
  const target=Math.max(1,Number(hdTrainingPlanFor(ship).active?hdTrainingPlanFor(ship).target:task.targetLv)||1),lv=Number(ship.level)||1;
  return {detail:`現在 Lv.${lv} / 目標 Lv.${target} / あと ${Math.max(0,target-lv)}。`,ready:lv>=target,status:lv>=target?'Lv目標達成':'育成中'};
 }
 if(task.source==='nav'){
  const check=hdStrategyNavChecks(task.map).find(x=>x.id===task.ref);
  if(check)return {detail:check.detail||task.detail,ready:check.status==='ready',status:check.status==='ready'?'自動判定OK':'不足・要確認'};
 }
 if(task.source==='gearKind'){
  const check=hdStrategyGearChecks(task.map).find(x=>String(x.kind)===String(task.ref));
  if(check)return {detail:check.detail||task.detail,ready:check.status==='ready',status:check.status==='ready'?'装備台帳で準備済み':'装備不足'};
 }
 if(task.source==='fleetSetup')return {detail:task.detail,ready:typeof hdMSNFleets==='function'&&hdMSNFleets(task.map).length>0,status:typeof hdMSNFleets==='function'&&hdMSNFleets(task.map).length>0?'保存編成あり':'保存編成なし'};
 if(task.source==='gear'){
  const gear=hdStrategyGearRows(task.map).find(x=>String(typeof hdPLDemandKey==='function'?hdPLDemandKey(x,task.map):x.target)===String(task.ref));
  if(gear)return {detail:`必要 ${gear.needed} / 所持 ${gear.owned} / あと ${gear.shortfall}。${gear.methodLabel||'入手方法を確認'}`,ready:gear.shortfall===0,status:gear.shortfall===0?'所持数の目標達成':'装備不足'};
  if(live)return {detail:live.detail,ready:live.status==='ready',status:live.status==='ready'?'所持数の目標達成':'装備不足'};
 }
 if(task.source==='periodicQuest'&&live)return {detail:live.detail,ready:false,status:'今周期の進捗を確認'};
 if(task.source==='nav'&&live)return {detail:live.detail,ready:false,status:'不足・要確認'};
 return {detail:live?.detail||task.detail||'',ready:false,status:task.source==='oneTimeQuest'?'ゲームで確認':''};
}
function hdStrategyTaskActions(task){
 if(task.source==='oneTimeQuest'&&task.sourceUrl)return `<a class="ghost small" href="${hdStrategyEsc(task.sourceUrl)}" target="_blank" rel="noopener">任務の詳細 ↗</a>`;
 if(task.source==='periodicQuest')return `<button type="button" class="ghost small" data-hd-strategy-open-quest="${hdStrategyEsc(task.ref)}">任務の条件・前提 →</button>`;
 if(task.source==='training')return `<button type="button" class="ghost small" data-hd-strategy-open-training="${hdStrategyEsc(task.shipId||task.ref)}">育成計画 →</button>`;
 if(['gear','gearKind'].includes(task.source))return '<button type="button" class="ghost small" data-home-jump="hdEquipmentProcurement">装備の入手計画 →</button>';
 if(task.source==='unlock')return `<button type="button" class="ghost small" data-hd-strategy-open-map="${hdStrategyEsc(task.ref)}">前提海域を見る →</button>`;
 if(['nav','fleetSetup'].includes(task.source))return `<button type="button" class="ghost small" data-hd-strategy-open-map="${hdStrategyEsc(task.map)}">攻略ナビで確認 →</button>`;
 return '';
}
function hdStrategyFingerprint(map){
 try{return JSON.stringify(hdStrategyCandidates(map).map(x=>[x.sourceKey,x.detail,x.status]));}catch{return ''}
}
function hdStrategyCandidateReady(row,state){
 return row.source==='unlock'&&row.map!=='5-6'&&state.cleared.includes(row.ref);
}
function hdStrategyPendingPath(map,state){
 const cleared=new Set(state.cleared||[]),visited=new Set(),path=[];
 function visit(current){
  if(visited.has(current))return;
  visited.add(current);
  for(const previous of HD_STRATEGY_UNLOCKS[current]?.maps||[]){
   if(!cleared.has(previous)||current==='5-6'){
    visit(previous);
    if(!path.includes(previous))path.push(previous);
   }
  }
 }
 visit(map);
 return path;
}
function hdStrategyPreview(map,state){
 if(!map)return '';
 const rows=hdStrategyCandidates(map),existing=new Set(state.custom.filter(x=>x.map===map).map(x=>x.sourceKey)),pending=rows.filter(x=>!existing.has(x.sourceKey)&&!hdStrategyCandidateReady(x,state)),path=hdStrategyPendingPath(map,state),grouped={unlock:[],nav:[],gear:[],level:[],quest:[]};
 for(const row of rows){const group=['unlock','oneTimeQuest'].includes(row.source)?'unlock':row.source==='training'?'level':row.source==='periodicQuest'?'quest':row.source==='nav'?'nav':'gear';grouped[group].push(row)}
 const sections=[['unlock','前提海域・関連する単発任務'],['nav','保存編成との差分'],['gear','必要な装備'],['level','育成が必要な艦娘'],['quest','関連する定期任務']];
 return `<div class="hd-strategy-preview"><div class="hd-strategy-preview-head"><strong>${hdStrategyEsc(map)} の目標候補</strong><button type="button" class="primary small" data-hd-strategy-import-all="${hdStrategyEsc(map)}" ${pending.length?'':'disabled'}>未追加の目標をまとめて追加（${pending.length}件）</button></div>${path.length?`<div class="hd-strategy-preview-item"><div><b>前提海域の攻略順：${hdStrategyEsc(path.join(' → '))} → ${hdStrategyEsc(map)}</b><small>${map==='5-6'?'5-5 は今月のゲージ破壊をゲーム画面で確認。':'クリア記録をもとに未攻略の前提海域を表示。'} 次は ${hdStrategyEsc(path[0])} を確認。</small></div><button type="button" class="ghost small" data-hd-strategy-next-map="${hdStrategyEsc(path[0])}">${hdStrategyEsc(path[0])} を見る →</button></div>`:''}<small>保存編成・装備台帳・育成計画と攻略情報から作成。達成はゲーム画面でも確認してください。</small>${sections.map(([id,label])=>`<details class="hd-strategy-preview-section" ${id==='unlock'||id==='nav'?'open':''}><summary>${label}<span>${grouped[id].length}件</span></summary>${grouped[id].length?grouped[id].map(x=>`<div class="hd-strategy-preview-item"><div><b>${hdStrategyEsc(x.title)}</b><small>${hdStrategyEsc(x.detail)}</small></div><button type="button" class="ghost small" data-hd-strategy-import="${hdStrategyEsc(x.sourceKey)}" ${existing.has(x.sourceKey)||hdStrategyCandidateReady(x,state)?'disabled':''}>${existing.has(x.sourceKey)?'追加済み':hdStrategyCandidateReady(x,state)?'クリア記録済み':'追加'}</button></div>`).join(''):'<p class="muted">現在の登録データから候補はありません。</p>'}</details>`).join('')}<div class="hd-strategy-preview-tools"><button type="button" class="ghost small" data-hd-strategy-procurement="${hdStrategyEsc(map)}">装備計画に不足種別を登録</button><button type="button" class="ghost small" data-home-jump="trainingPlanner">育成計画へ</button><a href="https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99" target="_blank" rel="noopener">任務の前提をWikiで確認 ↗</a></div></div>`;
}
function hdStrategyImportMap(map,onlyKey=''){
 if(typeof homeGuideState!=='function'||typeof homeGuideSave!=='function')return 0;
 const state=homeGuideState(),candidates=hdStrategyCandidates(map).filter(x=>(!onlyKey||x.sourceKey===onlyKey)&&!hdStrategyCandidateReady(x,state));let added=0;
 for(const x of candidates){const old=state.custom.find(y=>y.sourceKey===x.sourceKey);
  if(old){Object.assign(old,{title:x.title,detail:x.detail,targetLv:x.targetLv||old.targetLv,status:x.status});continue}
  state.custom.push(x);added++;
 }
 if(candidates.length)homeGuideSave(state);
 if(added&&typeof hdToast==='function')hdToast(`${map} の目標を ${added} 件追加したよ`,'success',2400);
 return added;
}
document.addEventListener('click',e=>{
 const next=e.target.closest?.('[data-hd-strategy-next-map]');if(next){
  if(typeof hdSelectGuideMap==='function')hdSelectGuideMap(next.dataset.hdStrategyNextMap);
  document.getElementById('homeGuideSteps')?.scrollIntoView({behavior:'smooth',block:'start'});return;
 }
 const q=e.target.closest?.('[data-hd-strategy-open-quest]');if(q){
  const id=q.dataset.hdStrategyOpenQuest,quest=HD_QUESTS.find(x=>x.id===id);
  if(quest&&typeof hdEnsureQuestDb==='function'){
   hdEnsureQuestDb();hdQuestCycle=quest.cycle;
   document.querySelectorAll('[data-hd-quest-cycle]').forEach(b=>b.classList.toggle('active',b.dataset.hdQuestCycle===quest.cycle));
   const input=document.getElementById('hdQuestDbSearch');if(input)input.value=id;
   hdRenderQuestDb();if(typeof hdWSShowElement==='function')hdWSShowElement('questDatabase',true);
  }return;
 }
 const training=e.target.closest?.('[data-hd-strategy-open-training]');if(training){
  const ship=hdTrainingRoster().find(x=>String(x.id)===training.dataset.hdStrategyOpenTraining);
  if(typeof hdEnsureTrainingPlanner==='function')hdEnsureTrainingPlanner();
  if(typeof hdWSShowElement==='function')hdWSShowElement('trainingPlanner',true);
  const input=document.getElementById('hdTrainingSearch');if(input&&ship){input.value=ship.name;hdRenderTrainingPlanner()}return;
 }
 const toMap=e.target.closest?.('[data-hd-strategy-open-map]');if(toMap){
  const map=toMap.dataset.hdStrategyOpenMap;if(typeof hdMSNOpen==='function')hdMSNOpen(map);return;
 }
 const one=e.target.closest?.('[data-hd-strategy-import]'),all=e.target.closest?.('[data-hd-strategy-import-all]'),nav=e.target.closest?.('[data-hd-msn-to-todo]');
 if(one||all||nav){const map=nav?.dataset.hdMsnToTodo||all?.dataset.hdStrategyImportAll||homeGuideActiveMap();
  if(nav&&typeof hdSelectGuideMap==='function')hdSelectGuideMap(map);
  hdStrategyImportMap(map,one?.dataset.hdStrategyImport||'');
  if(nav){if(typeof hdWSShowElement==='function')hdWSShowElement('home',true);document.getElementById('homeGuideSteps')?.scrollIntoView({behavior:'smooth',block:'start'})}return;
 }
 const procurement=e.target.closest?.('[data-hd-strategy-procurement]');if(procurement){
  const map=procurement.dataset.hdStrategyProcurement;if(typeof hdPLAddMap==='function')hdPLAddMap(map);
  if(typeof hdPLOpenList==='function')hdPLOpenList();if(typeof homeGuideRender==='function')homeGuideRender();
 }
});
