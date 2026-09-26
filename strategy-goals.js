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
 F43:{name:'中部海域「基地航空隊」展開！',needs:'ドラム缶(輸送用)2個を廃棄し、燃料1,200・ボーキサイト3,000・設営隊1個を消費。任務 F38・B62 達成後に出現。',maps:/^6-[4-5]$/,url:'https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99/%E5%B7%A5%E5%BB%A0%E4%BB%BB%E5%8B%99#id-F43',steps:[
  {ref:'F37',name:'「航空基地設営」事前準備',detail:'ドラム缶(輸送用)2個を廃棄し、7.7mm機銃・九六式艦戦を各2個準備。前提は B56。',url:'https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99/%E5%B7%A5%E5%BB%A0%E4%BB%BB%E5%8B%99#id-F37'},
  {ref:'B77',name:'水雷戦隊、南西諸島海域を哨戒せよ！',detail:'軽巡級旗艦・駆逐4隻・自由1隻で 2-2 と 2-3 のボスへ。各 S 勝利を目安に確認（A 勝利達成報告あり、要検証）。',url:'https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99/%E5%87%BA%E6%92%83%E4%BB%BB%E5%8B%99#id-B77'},
  {ref:'F38',name:'「陸攻」隊の増勢',detail:'7.7mm機銃と九九式艦爆を各2個準備。出現には F37 と B77 の達成が必要。',url:'https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99/%E5%B7%A5%E5%BB%A0%E4%BB%BB%E5%8B%99#id-F38'},
  {ref:'B62',name:'強襲上陸作戦用戦力を増強せよ！',detail:'6-3 ボス B 勝利以上。任務の出現には週任務 Bw9 と D19（検証中）の達成状況も確認。',url:'https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99/%E5%87%BA%E6%92%83%E4%BB%BB%E5%8B%99#id-B62'}]},
 B175:{name:'南西海域「基地航空隊」開設！',needs:'任務を受領し 2-1・2-2・2-3・7-3-2/P ボスを各1回 S勝利、7-4/O マスに到達。設営隊1個を消費。',maps:/^7-[4-5]$/,url:'https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99/%E5%87%BA%E6%92%83%E4%BB%BB%E5%8B%99#id-B175',steps:[
  {ref:'B113',name:'松輸送作戦、継続実施せよ！',detail:'B175 の出現条件として掲載（検証中）。未出現なら達成状況を確認。',url:'https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99/%E5%87%BA%E6%92%83%E4%BB%BB%E5%8B%99#id-B113'},
  {ref:'B131',name:'航空戦艦戦隊、戦闘哨戒！',detail:'B175 の出現条件として掲載（検証中）。未出現なら達成状況を確認。',url:'https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99/%E5%87%BA%E6%92%83%E4%BB%BB%E5%8B%99#id-B131'}],sorties:[
  {map:'2-1',node:'ボス',result:'S勝利'}, {map:'2-2',node:'ボス',result:'S勝利'},
  {map:'2-3',node:'ボス',result:'S勝利'}, {map:'7-3',node:'第2ボス/P',result:'S勝利'},
  {map:'7-4',node:'Oマス',result:'到達'}]}
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
function hdStrategyFleetHasShips(map){
 try{return hdMSNFleets(map).some(fleet=>(fleet.ships||[]).some(ship=>String(ship.ship||ship.name||'').trim()))}catch{return false}
}
function hdStrategyTrainingRows(map){
 try{
  const fleets=hdMSNFleets(map),fleet=fleets.find(x=>String(x.id)===String(hdMSNFleetId(map,fleets)));
  const names=new Set((fleet?.ships||[]).map(x=>String(x.ship||x.name||'').trim()).filter(Boolean));
  if(!names.size)return [];
  return hdTrainingRoster().map(ship=>{
   const plan=hdTrainingPlanFor(ship),lv=Math.max(1,Number(ship.level)||1);
   const target=plan.active?plan.target:Number(plan.db?.targetLv)||0;
   return {ship,plan,lv,target,inFleet:names.has(ship.name),gap:Math.max(0,target-lv)};
  }).filter(x=>x.inFleet&&x.target>0&&x.gap>0).sort((a,b)=>Number(b.plan.active)-Number(a.plan.active)||a.gap-b.gap).slice(0,10);
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
function hdStrategyPrerequisiteMaps(map){
 const seen=new Set([map]),rows=[];
 function visit(current){
  for(const previous of HD_STRATEGY_UNLOCKS[current]?.maps||[]){
   if(seen.has(previous))continue;
   seen.add(previous);visit(previous);
   rows.push({map:previous,direct:current===map});
  }
 }
 visit(map);
 return rows;
}
function hdStrategyCandidates(map){
 if(!map)return [];
 const rows=[],add=x=>{if(!rows.some(r=>r.sourceKey===x.sourceKey))rows.push(x)};
 const unlock=HD_STRATEGY_UNLOCKS[map];
 for(const {map:previous,direct} of hdStrategyPrerequisiteMaps(map))add(hdStrategyCandidate(map,'map','unlock',previous,`${previous} のクリアを確認`,map==='5-6'&&direct?'5-6 の出撃には今月の 5-5 ゲージ破壊が必要。クリア記録とは別にゲーム画面で確認。':direct?`${map} の開放に関わる海域。クリア状態は手動記録。`:`${map} の攻略に向けて先に進める海域。クリア状態は手動記録。`,{dependsOn:previous}));
 for(const id of new Set([...(unlock?.quests||[]),...Object.keys(HD_STRATEGY_UNLOCK_QUESTS).filter(k=>HD_STRATEGY_UNLOCK_QUESTS[k].maps.test(map))])){
  const q=HD_STRATEGY_UNLOCK_QUESTS[id];
  for(const step of q.steps)add(hdStrategyCandidate(map,'quest','oneTimeQuest',step.ref,`${step.name}を確認`,`${step.detail}完了はゲーム画面で確認。`,{sourceUrl:step.url}));
  add(hdStrategyCandidate(map,'quest','basePrep',`${id}-setup`,'設営隊を1個確保','開設任務で1個消費。B80「飛行場設営の準備を実施せよ！」などの報酬・手持ちを確認。B80 は 6-3 ボス S 勝利で達成。',{sourceUrl:'https://wikiwiki.jp/kancolle/%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0#ConstructionCorps'}));
  for(const sortie of q.sorties||[])add(hdStrategyCandidate(map,'quest','baseSortie',`${id}-${sortie.map}`,`${id}：${sortie.map} ${sortie.node} ${sortie.result}`,`任務「${q.name}」を受領してから ${sortie.map} ${sortie.node} ${sortie.result}を確認。任務進捗と達成はゲーム画面で確認。`,{targetMap:sortie.map,sourceUrl:q.url}));
  if(id==='F43')add(hdStrategyCandidate(map,'quest','basePrep','F43-materials','F43 の資源とドラム缶を準備','ドラム缶(輸送用)2個を廃棄。燃料1,200・ボーキサイト3,000 を消費。',{sourceUrl:q.url}));
  add(hdStrategyCandidate(map,'quest','oneTimeQuest',id,`${q.name}を確認`,`${q.needs}完了はゲーム画面で確認。`,{prereq:q.needs,sourceUrl:q.url}));
 }
 if(!hdStrategyFleetHasShips(map))
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
  add(hdStrategyCandidate(map,'gear','gear',key,`${label}を揃える`,`必要 ${gear.needed} / 所持 ${gear.owned} / あと ${gear.shortfall}。${gear.methodLabel||'入手方法を確認'}`,{status:gear.status,target:gear.target||gear.wanted}));
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
 if(task.source==='fleetSetup')return {detail:task.detail,ready:hdStrategyFleetHasShips(task.map),status:hdStrategyFleetHasShips(task.map)?'保存編成あり':'保存編成なし'};
 if(task.source==='gear'){
  const gear=hdStrategyGearRows(task.map).find(x=>String(typeof hdPLDemandKey==='function'?hdPLDemandKey(x,task.map):x.target)===String(task.ref));
  if(gear)return {detail:`必要 ${gear.needed} / 所持 ${gear.owned} / あと ${gear.shortfall}。${gear.methodLabel||'入手方法を確認'}`,ready:gear.shortfall===0,status:gear.shortfall===0?'所持数の目標達成':'装備不足'};
  if(live)return {detail:live.detail,ready:live.status==='ready',status:live.status==='ready'?'所持数の目標達成':'装備不足'};
 }
 if(task.source==='periodicQuest'&&live)return {detail:live.detail,ready:false,status:'今周期の進捗を確認'};
 if(task.source==='nav'&&live)return {detail:live.detail,ready:false,status:'不足・要確認'};
 return {detail:live?.detail||task.detail||'',ready:false,status:['oneTimeQuest','baseSortie','basePrep'].includes(task.source)?'ゲームで確認':''};
}
function hdStrategyTaskActions(task){
 if(task.source==='baseSortie')return `<button type="button" class="ghost small" data-hd-strategy-open-map="${hdStrategyEsc(task.targetMap)}">出撃先を見る →</button><a class="ghost small" href="${hdStrategyEsc(task.sourceUrl)}" target="_blank" rel="noopener">任務の条件 ↗</a>`;
 if(['oneTimeQuest','basePrep'].includes(task.source)&&task.sourceUrl)return `<a class="ghost small" href="${hdStrategyEsc(task.sourceUrl)}" target="_blank" rel="noopener">条件の詳細 ↗</a>`;
 if(task.source==='periodicQuest')return `<button type="button" class="ghost small" data-hd-strategy-open-quest="${hdStrategyEsc(task.ref)}">任務の条件・前提 →</button>`;
 if(task.source==='training')return `<button type="button" class="ghost small" data-hd-strategy-open-training="${hdStrategyEsc(task.shipId||task.ref)}">育成計画 →</button>`;
 if(task.source==='gear')return `<button type="button" class="ghost small" data-hd-strategy-open-gear="${hdStrategyEsc(task.sourceKey)}">この装備の入手方法 →</button><button type="button" class="ghost small" data-home-jump="hdEquipmentProcurement">装備の入手計画 →</button>`;
 if(task.source==='gearKind')return `<button type="button" class="ghost small" data-hd-strategy-open-kind="${hdStrategyEsc(task.ref)}" data-hd-strategy-gear-map="${hdStrategyEsc(task.map)}">代替装備を見る →</button><button type="button" class="ghost small" data-home-jump="hdEquipmentProcurement">装備の入手計画 →</button>`;
 if(task.source==='unlock')return `<button type="button" class="ghost small" data-hd-strategy-open-map="${hdStrategyEsc(task.ref)}">前提海域を見る →</button>`;
 if(['nav','fleetSetup'].includes(task.source))return `<button type="button" class="ghost small" data-hd-strategy-open-map="${hdStrategyEsc(task.map)}">攻略ナビで確認 →</button>`;
 return '';
}
function hdStrategyFingerprint(map){
 try{return JSON.stringify(hdStrategyCandidates(map).map(x=>[x.sourceKey,x.detail,x.status]));}catch{return ''}
}
function hdStrategyCandidateReady(row,state){
 if(row.source==='unlock')return row.map!=='5-6'&&state.cleared.includes(row.ref);
 return ['oneTimeQuest','basePrep','baseSortie'].includes(row.source)&&(state.done||[]).includes(typeof homeGuideGoalKey==='function'?homeGuideGoalKey(row):`shared:${row.source}:${row.ref}`);
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
function hdStrategyFocusRows(map,state,rows=hdStrategyCandidates(map)){
 const done=new Set(state.done||[]),custom=new Map((state.custom||[]).filter(x=>x.map===map&&x.sourceKey).map(x=>[x.sourceKey,x]));
 const pending=row=>{
  if(hdStrategyCandidateReady(row,state))return false;
  const saved=custom.get(row.sourceKey),task=saved||row;
  return !(typeof homeGuideGoalKey==='function'&&done.has(homeGuideGoalKey(task)))&&
   !(saved&&typeof hdStrategyTaskView==='function'&&hdStrategyTaskView(saved,rows,state.cleared||[]).ready);
 };
 const take=predicate=>rows.find(x=>predicate(x)&&pending(x));
 const choices=[
  take(x=>['oneTimeQuest','basePrep','baseSortie'].includes(x.source)),
  take(x=>x.source==='fleetSetup'),
  take(x=>x.source==='gear'),
  take(x=>x.source==='gearKind'),
  take(x=>x.source==='training'),
  take(x=>x.source==='nav'),
  take(x=>x.source==='periodicQuest')
 ];
 return choices.filter(Boolean).slice(0,2).map(row=>({row,existing:custom.has(row.sourceKey)}));
}
function hdStrategyFocusHtml(map,state,rows){
 const focus=hdStrategyFocusRows(map,state,rows);
 if(!focus.length)return '';
 return `<div class="hd-strategy-focus"><strong>次に進める準備</strong><small>未完了の任務・編成・装備・育成から表示。達成状況はゲーム画面でも確認してください。</small>${focus.map(({row,existing})=>`<div class="hd-strategy-preview-item"><div><b>${hdStrategyEsc(row.title)}</b><small>${hdStrategyEsc(row.detail)}</small></div><button type="button" class="ghost small" ${existing?`data-hd-strategy-focus-group="${hdStrategyEsc(row.category)}"`:`data-hd-strategy-import="${hdStrategyEsc(row.sourceKey)}"`}>${existing?'リストで見る':'目標に追加'}</button></div>`).join('')}</div>`;
}
function hdStrategyPreview(map,state){
 if(!map)return '';
 const rows=hdStrategyCandidates(map),existing=new Set(state.custom.filter(x=>x.map===map).map(x=>x.sourceKey)),pending=rows.filter(x=>!existing.has(x.sourceKey)&&!hdStrategyCandidateReady(x,state)),path=hdStrategyPendingPath(map,state),focus=hdStrategyFocusHtml(map,state,rows),grouped={unlock:[],nav:[],gear:[],level:[],quest:[]};
 for(const row of rows){const group=['unlock','oneTimeQuest','basePrep','baseSortie'].includes(row.source)?'unlock':row.source==='training'?'level':row.source==='periodicQuest'?'quest':row.source==='nav'?'nav':'gear';grouped[group].push(row)}
 const sections=[['unlock','前提海域・関連する単発任務'],['nav','保存編成との差分'],['gear','必要な装備'],['level','育成が必要な艦娘'],['quest','関連する定期任務']];
 return `<div class="hd-strategy-preview"><div class="hd-strategy-preview-head"><strong>${hdStrategyEsc(map)} の目標候補</strong><button type="button" class="primary small" data-hd-strategy-import-all="${hdStrategyEsc(map)}" ${pending.length?'':'disabled'}>未追加の目標をまとめて追加（${pending.length}件）</button></div>${path.length?`<div class="hd-strategy-preview-item"><div><b>前提海域の攻略順：${hdStrategyEsc(path.join(' → '))} → ${hdStrategyEsc(map)}</b><small>${map==='5-6'?'5-5 は今月のゲージ破壊をゲーム画面で確認。':'クリア記録をもとに未攻略の前提海域を表示。'} 次は ${hdStrategyEsc(path[0])} を確認。</small></div><button type="button" class="ghost small" data-hd-strategy-next-map="${hdStrategyEsc(path[0])}">${hdStrategyEsc(path[0])} を見る →</button></div>`:''}${focus}<small>保存編成・装備台帳・育成計画と攻略情報から作成。達成はゲーム画面でも確認してください。</small>${sections.map(([id,label])=>`<details class="hd-strategy-preview-section" ${id==='unlock'||id==='nav'?'open':''}><summary>${label}<span>${grouped[id].length}件</span></summary>${grouped[id].length?grouped[id].map(x=>`<div class="hd-strategy-preview-item"><div><b>${hdStrategyEsc(x.title)}</b><small>${hdStrategyEsc(x.detail)}</small></div><button type="button" class="ghost small" data-hd-strategy-import="${hdStrategyEsc(x.sourceKey)}" ${existing.has(x.sourceKey)||(x.source==='unlock'&&hdStrategyCandidateReady(x,state))?'disabled':''}>${existing.has(x.sourceKey)?'追加済み':hdStrategyCandidateReady(x,state)?x.source==='unlock'?'クリア記録済み':'達成済みを表示':'追加'}</button></div>`).join(''):'<p class="muted">現在の登録データから候補はありません。</p>'}</details>`).join('')}<div class="hd-strategy-preview-tools"><button type="button" class="ghost small" data-hd-strategy-procurement="${hdStrategyEsc(map)}">装備計画に不足種別を登録</button><button type="button" class="ghost small" data-home-jump="trainingPlanner">育成計画へ</button><a href="https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99" target="_blank" rel="noopener">任務の前提をWikiで確認 ↗</a></div></div>`;
}
function hdStrategyImportMap(map,onlyKey=''){
 if(typeof homeGuideState!=='function'||typeof homeGuideSave!=='function')return 0;
 const state=homeGuideState(),candidates=hdStrategyCandidates(map).filter(x=>(!onlyKey||x.sourceKey===onlyKey)&&(!hdStrategyCandidateReady(x,state)||(onlyKey&&x.source!=='unlock')));let added=0;
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
 const equipment=e.target.closest?.('[data-hd-strategy-open-gear]');if(equipment){
  const task=homeGuideState().custom.find(x=>x.sourceKey===equipment.dataset.hdStrategyOpenGear);
  if(task){
   const row=hdStrategyGearRows(task.map).find(x=>String(typeof hdPLDemandKey==='function'?hdPLDemandKey(x,task.map):x.target)===String(task.ref));
   const target=row?.target||row?.wanted||task.target||'';
   if(target&&typeof hdAGOpenItem==='function')hdAGOpenItem(target,task.map);
   else if(typeof hdPLOpenList==='function')hdPLOpenList();
  }return;
 }
 const kind=e.target.closest?.('[data-hd-strategy-open-kind]');if(kind){
  if(typeof hdAGOpen==='function')hdAGOpen(kind.dataset.hdStrategyOpenKind,kind.dataset.hdStrategyGearMap||'');
  else if(typeof hdPLOpenList==='function')hdPLOpenList();
  return;
 }
 const toMap=e.target.closest?.('[data-hd-strategy-open-map]');if(toMap){
  const map=toMap.dataset.hdStrategyOpenMap;if(typeof hdMSNOpen==='function')hdMSNOpen(map);return;
 }
 const focus=e.target.closest?.('[data-hd-strategy-focus-group]');if(focus){
  const group=[...document.querySelectorAll('#homeGuideSteps details.home-guide-group')].find(x=>x.dataset.group===focus.dataset.hdStrategyFocusGroup);
  if(group){group.open=true;group.scrollIntoView({behavior:'smooth',block:'start'})}return;
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
