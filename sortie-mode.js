const HD_SM_SESSION_KEY='harbordesk-active-sortie-session-v1';
const HD_SM_OBJECTIVE_PREF_KEY='harbordesk-sortie-objective-pref-v1';

function hdSMEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function hdSMSession(){try{return typeof window.hdSSLoad==='function'?window.hdSSLoad():JSON.parse(localStorage.getItem(HD_SM_SESSION_KEY)||'null')}catch{return null}}
function hdSMMap(){try{return typeof window.hdSSMap==='function'?window.hdSSMap():(typeof selectedMap!=='undefined'?selectedMap:'')}catch{return ''}}
function hdSMMapDetail(map){try{return typeof MAP_DETAILS!=='undefined'?(MAP_DETAILS[map]||{}):{}}catch{return {}}}
function hdSMGraph(map){try{return typeof HD_MAP_GRAPHS!=='undefined'?(HD_MAP_GRAPHS[map]||null):null}catch{return null}}
function hdSMNodeKind(graph,label){
 try{return graph&&typeof hdMapKind==='function'?hdMapKind(graph,label):(graph?.boss===label?'boss':graph?.goal===label?'goal':'normal')}catch{return 'normal'}
}
function hdSMNodeKindLabel(kind){return {boss:'ボス',goal:'到達',item:'資源',sub:'潜水',air:'航空',night:'夜戦',vortex:'渦潮',safe:'安全',normal:'通常'}[kind]||'通常'}
function hdSMEffectiveNodeKind(map,label,kind){
 const current=String(label||'').trim(),base=String(kind||hdSMNodeKind(hdSMGraph(map),current)||'normal');
 if(!current||base!=='normal')return base;
 let detail={};try{if(typeof HD_NODE_DETAIL_OVERRIDES!=='undefined')detail=HD_NODE_DETAIL_OVERRIDES?.[map]?.[current]||{}}catch{}
 const enemy=String(detail.enemy||'').trim();
 if(/うずしお/.test(enemy))return 'vortex';
 if(/^(戦闘なし|能動分岐)/.test(enemy)||/気のせいだった|敵影を見ず/.test(enemy)){
  if(/獲得|資源|アイテム|高速修復材|ボーキ|弾薬|燃料|鋼材/.test(enemy))return 'item';
  return 'safe';
 }
 return base;
}
function hdSMNodeRows(map){
 const graph=hdSMGraph(map);if(!graph||!Array.isArray(graph.edges))return [];
 const starts=new Set(['S','S1','S2']),labels=[...new Set(graph.edges.flat())].filter(x=>!starts.has(x));
 let level={};try{if(typeof hdMapLevels==='function')level=hdMapLevels(graph).level||{}}catch{}
 return labels.sort((a,b)=>(Number(level[a]??999)-Number(level[b]??999))||String(a).localeCompare(String(b),undefined,{numeric:true}))
  .map(label=>({label,kind:hdSMEffectiveNodeKind(map,label,hdSMNodeKind(graph,label))}));
}
function hdSMNextNodeRows(map,draft){
 const graph=hdSMGraph(map);if(!graph||!Array.isArray(graph.edges))return [];
 const current=String(draft?.node||'').trim();
 const from=current?[current]:[...new Set(graph.edges.map(x=>x[0]).filter(x=>x==='S'||x==='S1'||x==='S2'))];
 const labels=[...new Set(graph.edges.filter(([a])=>from.includes(a)).map(([,b])=>b))];
 return labels.map(label=>({label,kind:hdSMEffectiveNodeKind(map,label,hdSMNodeKind(graph,label))}));
}
function hdSMBossDistance(map,current,target){
 const graph=hdSMGraph(map),from=String(current||'').trim(),targets=hdSMObjectiveTargets(map,target);
 if(!graph||!Array.isArray(graph.edges)||!from||!targets.length)return null;
 if(targets.includes(from))return 0;
 const q=[[from,0]],seen=new Set([from]);
 while(q.length){
  const [node,d]=q.shift();
  for(const [a,b] of graph.edges){
   if(a!==node||seen.has(b))continue;
   if(targets.includes(b))return d+1;
   seen.add(b);q.push([b,d+1]);
  }
 }
 return null;
}
function hdSMBossBattleDistance(map,current,target){
 const graph=hdSMGraph(map),from=String(current||'').trim(),targets=hdSMObjectiveTargets(map,target);
 if(!graph||!Array.isArray(graph.edges)||!from||!targets.length)return null;
 if(targets.includes(from))return 0;
 const dist=new Map([[from,0]]),queue=[from];
 while(queue.length){
  queue.sort((a,b)=>(dist.get(a)||0)-(dist.get(b)||0));
  const node=queue.shift(),base=dist.get(node)||0;
  if(targets.includes(node))return base;
  for(const [a,b] of graph.edges){
   if(a!==node)continue;
   const next=base+(hdSMRequiresAdvanceCheck(map,b)?1:0),old=dist.get(b);
   if(old==null||next<old){dist.set(b,next);queue.push(b)}
  }
 }
 return null;
}
function hdSMCanReachBoss(map,label,target){
 const graph=hdSMGraph(map),from=String(label||'').trim(),targets=hdSMObjectiveTargets(map,target);
 if(!graph||!Array.isArray(graph.edges)||!from||!targets.length)return null;
 if(targets.includes(from))return true;
 const queue=[from],seen=new Set([from]);
 while(queue.length){
  const node=queue.shift();
  for(const [a,b] of graph.edges){
   if(a!==node||seen.has(b))continue;
   if(targets.includes(b))return true;
   seen.add(b);queue.push(b);
  }
 }
 return false;
}
function hdSMObjectiveTargets(map,target){
 const graph=hdSMGraph(map),all=[...new Set([graph?.goal,graph?.boss].map(String).map(x=>x.trim()).filter(Boolean))],chosen=String(target||'').trim();
 return chosen&&all.includes(chosen)?[chosen]:all;
}
function hdSMObjectiveOptions(map){
 const graph=hdSMGraph(map),out=[];
 const goal=String(graph?.goal||'').trim(),boss=String(graph?.boss||'').trim();
 if(goal)out.push({label:goal,type:'goal',name:goal+' 到達地点'});
 if(boss&&boss!==goal)out.push({label:boss,type:'boss',name:boss+' ボス'});
 return out;
}
function hdSMObjectiveStartStats(map,target){
 const graph=hdSMGraph(map),targets=hdSMObjectiveTargets(map,target);
 if(!graph||!Array.isArray(graph.edges)||!targets.length)return {steps:null,battles:null};
 const starts=[...new Set(graph.edges.map(x=>x[0]).filter(x=>x==='S'||x==='S1'||x==='S2'))];
 if(!starts.length)return {steps:null,battles:null};
 let steps=null;
 const q=starts.map(x=>[x,0]),seen=new Set(starts);
 while(q.length){
  const [node,d]=q.shift();
  if(targets.includes(node)){steps=d;break}
  for(const [a,b] of graph.edges){
   if(a!==node||seen.has(b))continue;
   if(targets.includes(b)){steps=d+1;q.length=0;break}
   seen.add(b);q.push([b,d+1]);
  }
 }
 const dist=new Map(starts.map(x=>[x,0])),open=[...starts];
 let battles=null;
 while(open.length){
  open.sort((a,b)=>(dist.get(a)||0)-(dist.get(b)||0));
  const node=open.shift(),base=dist.get(node)||0;
  if(targets.includes(node)){battles=base;break}
  for(const [a,b] of graph.edges){
   if(a!==node)continue;
   const next=base+(hdSMRequiresAdvanceCheck(map,b)?1:0),old=dist.get(b);
   if(old==null||next<old){dist.set(b,next);open.push(b)}
  }
 }
 return {steps,battles};
}
function hdSMObjectiveStatText(map,target){
 const s=hdSMObjectiveStartStats(map,target);
 return (s.steps==null?'距離—':'最短'+s.steps+'マス')+'・'+(s.battles==null?'戦闘—':'最少'+s.battles+'戦');
}
function hdSMObjectivePrefs(){
 try{const x=JSON.parse(localStorage.getItem(HD_SM_OBJECTIVE_PREF_KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}
}
function hdSMObjectivePreference(map){
 const chosen=String(hdSMObjectivePrefs()[String(map||'')]||'').trim(),allowed=hdSMObjectiveTargets(map);
 return allowed.includes(chosen)?chosen:'';
}
function hdSMSaveObjectivePreference(map,target){
 const key=String(map||''),chosen=String(target||'').trim(),allowed=hdSMObjectiveTargets(map),objectiveTarget=allowed.includes(chosen)?chosen:'';
 try{
  const prefs=hdSMObjectivePrefs();
  if(objectiveTarget)prefs[key]=objectiveTarget;else delete prefs[key];
  localStorage.setItem(HD_SM_OBJECTIVE_PREF_KEY,JSON.stringify(prefs));
 }catch{return ''}
 return objectiveTarget;
}
function hdSMSetObjectivePreference(map,target){
 hdSMSaveObjectivePreference(map,target);hdSMRender();return true;
}
function hdSMObjectivePrestartHtml(map){
 const options=hdSMObjectiveOptions(map);if(options.length<2)return '';
 const selected=hdSMObjectivePreference(map);
 const autoText=hdSMObjectiveStatText(map,'');
 return '<div class="hd-sm-objective-picker prestart"><div><span>OBJECTIVE</span><b>出撃目標</b><small>開始前に選択／次回も記憶</small></div><div><button type="button" class="'+(!selected?'active':'')+'" data-hd-sm-pre-objective="" data-hd-sm-objective-map="'+hdSMEsc(map)+'"><b>自動</b><small>'+hdSMEsc(autoText)+'</small></button>'+options.map(x=>'<button type="button" class="'+(selected===x.label?'active':'')+'" data-hd-sm-pre-objective="'+hdSMEsc(x.label)+'" data-hd-sm-objective-map="'+hdSMEsc(map)+'"><b>'+hdSMEsc(x.name)+'</b><small>'+hdSMEsc(hdSMObjectiveStatText(map,x.label))+'</small></button>').join('')+'</div></div>';
}
function hdSMSelectedObjective(map,draft){
 const chosen=String(draft?.objectiveTarget||'').trim(),targets=hdSMObjectiveTargets(map);
 return targets.includes(chosen)?chosen:'';
}
function hdSMRouteTargetName(map,target){
 const graph=hdSMGraph(map),chosen=String(target||'').trim();
 if(chosen&&chosen===String(graph?.goal||'').trim())return chosen+'到達地点';
 if(chosen&&chosen===String(graph?.boss||'').trim())return chosen+'ボス';
 const hasBoss=!!String(graph?.boss||'').trim(),hasGoal=!!String(graph?.goal||'').trim();
 return hasBoss&&hasGoal?'攻略目標':hasBoss?'ボス':hasGoal?'到達地点':'目標';
}
function hdSMObjectivePickerHtml(map,draft){
 const options=hdSMObjectiveOptions(map);if(options.length<2)return '';
 const selected=hdSMSelectedObjective(map,draft);
 return '<div class="hd-sm-objective-picker"><div><span>OBJECTIVE</span><b>今回の攻略目標</b><small>距離・経路判定／次回も記憶</small></div><div><button type="button" class="'+(!selected?'active':'')+'" data-hd-sm-objective="">自動</button>'+options.map(x=>'<button type="button" class="'+(selected===x.label?'active':'')+'" data-hd-sm-objective="'+hdSMEsc(x.label)+'">'+hdSMEsc(x.name)+'</button>').join('')+'</div></div>';
}
function hdSMSetObjectiveTarget(target){
 const session=hdSMSession();if(!session||session.status!=='active')return false;
 const prev=session.draft&&typeof session.draft==='object'?session.draft:{},objectiveTarget=hdSMSaveObjectivePreference(session.map,target);
 session.draft={...prev,objectiveTarget,updatedAt:Date.now()};
 try{if(typeof window.hdSSSave==='function')window.hdSSSave(session);else localStorage.setItem(HD_SM_SESSION_KEY,JSON.stringify(session))}catch{return false}
 try{window.dispatchEvent(new CustomEvent('hd:sortie-draft-saved',{detail:{sessionId:session.id,draft:session.draft}}))}catch{}
 hdSMRender();return true;
}
function hdSMBranchHint(map,draft){
 const graph=hdSMGraph(map),current=String(draft?.node||'').trim(),next=hdSMNextNodeRows(map,draft);
 if(!graph)return {title:'分岐情報',text:'海域構造データを取得できないよ。',source:''};
 let override={};
 try{if(current&&typeof HD_NODE_DETAIL_OVERRIDES!=='undefined')override=HD_NODE_DETAIL_OVERRIDES?.[map]?.[current]||{}}catch{}
 if(override.branch)return {title:current+'マスの分岐条件',text:String(override.branch),source:String(override.source||'')};
 if(!current){
  let startOverride={};try{if(typeof HD_NODE_DETAIL_OVERRIDES!=='undefined'){for(const s of ['S','S1','S2']){const row=HD_NODE_DETAIL_OVERRIDES?.[map]?.[s];if(row?.branch){startOverride=row;break}}}}catch{}
  if(startOverride.branch)return {title:'開始時の分岐条件',text:String(startOverride.branch),source:String(startOverride.source||'')};
 }
 if(next.length===1)return {title:(current||'開始地点')+'からの進行',text:next[0].label+'へ接続。固定条件・索敵・ランダム分岐などの詳細は攻略情報も確認してね。',source:''};
 if(next.length>1)return {title:(current||'開始地点')+'からの分岐',text:next.map(x=>x.label).join(' / ')+'へ分岐。編成条件や確率分岐の詳細は「攻略概要」または「ルート」で確認してね。',source:''};
 return {title:(current||'現在地')+'の先',text:'この先の接続候補は登録されていないよ。',source:''};
}
function hdSMBranchHintHtml(map,draft){
 const hint=hdSMBranchHint(map,draft);
 return '<div class="hd-sm-branch-hint"><div><span>ROUTE CONDITION</span><b>'+hdSMEsc(hint.title)+'</b></div><p>'+hdSMEsc(hint.text)+'</p>'+(hint.source?'<small>'+hdSMEsc(hint.source)+'</small>':'')+'</div>';
}
function hdSMFormationAdvice(kind,detail){
 kind=String(kind||'normal');detail=detail||{};
 if(kind==='sub')return {formation:'単横陣',formationReason:'対潜火力と対潜命中を優先する基本陣形。'};
 if(kind==='air')return {formation:'輪形陣',formationReason:'空襲・航空戦で対空を重視。通常艦隊では5隻以上で選択可能。'};
 if(kind==='night')return {formation:'単縦陣',formationReason:'夜戦での命中と殲滅を重視する基本案。'};
 if(kind==='boss')return {formation:'単縦陣',formationReason:'ボス撃破の砲雷撃戦火力を優先する基本陣形。'};
 if(kind==='vortex')return {formation:'選択なし',formationReason:'渦潮マスでは陣形選択なし。電探による損失軽減を確認。'};
 if(kind==='item'||kind==='safe'||kind==='goal')return {formation:'選択なし',formationReason:'戦闘のないマスでは陣形選択なし。'};
 return {formation:'単縦陣',formationReason:'通常戦の砲雷撃戦火力を優先する基本陣形。'};
}
function hdSMNodeIntel(map,row){
 row=row||{};const label=String(row.label||'').trim();
 let detail={};try{if(label&&typeof HD_NODE_DETAIL_OVERRIDES!=='undefined')detail=HD_NODE_DETAIL_OVERRIDES?.[map]?.[label]||{}}catch{}
 const kind=hdSMEffectiveNodeKind(map,label,String(row.kind||hdSMNodeKind(hdSMGraph(map),label)||'normal'));
 const enemy=String(detail.enemy||'').trim(),air=String(detail.air||'').trim(),source=String(detail.source||'').trim(),formation=hdSMFormationAdvice(kind,detail);
 const defaults={
  boss:'ボス戦候補。決戦火力・制空・夜戦要員を確認。',
  sub:'潜水マス候補。先制対潜とソナー・爆雷を確認。',
  air:'航空戦候補。制空値と対空カットインを確認。',
  night:'夜戦候補。大破進軍に注意し、夜戦装備を確認。',
  vortex:'渦潮候補。電探で資源損失を軽減。',
  item:'資源・アイテムマス候補。',
  safe:'戦闘なし候補。',
  goal:'到達地点候補。'
 };
 const summary=enemy||air||defaults[kind]||'通常戦候補。次マスの敵編成と制空を確認。';
 const badge=kind==='boss'?'高危険':(kind==='sub'||kind==='air'||kind==='night')?'要対策':(kind==='item'||kind==='safe'||kind==='goal'||kind==='vortex')?'非戦闘':'戦闘';
 const all=(enemy+' '+air).trim();
 let caution='砲雷撃戦 / 中大破確認';
 if(kind==='sub')caution='先制対潜 / ソナー・爆雷';
 else if(kind==='air')caution='防空 / 対空CI / 艦戦';
 else if(kind==='night')caution='大破進軍注意 / 夜偵・照明弾';
 else if(kind==='vortex')caution='電探で資源損失を軽減';
 else if(kind==='item'||kind==='safe'||kind==='goal')caution='戦闘なし';
 else if(kind==='boss'){
  if(/陸上型|港湾棲姫|対地/.test(all))caution='対地装備 / 制空 / 決戦火力';
  else if(/潜水/.test(all))caution='対潜 / 決戦火力';
  else if(air&&!/制空不要|敵航空戦力なし/.test(air))caution='制空 / 決戦火力 / 夜戦要員';
  else caution='決戦火力 / 夜戦要員';
 }else if(/潜水/.test(all))caution='対潜装備 / 水上火力の両立';
 else if(air&&!/制空不要|敵航空戦力なし/.test(air))caution='制空確認 / 弾着対策';
 return {label,kind,badge,summary,enemy,air,source,caution,...formation,hasDetail:!!(enemy||air)};
}
function hdSMNextNodeButtonHtml(map,row,locked=false,objectiveTarget=''){
 const intel=hdSMNodeIntel(map,row),reachable=hdSMCanReachBoss(map,intel.label,objectiveTarget),targetName=hdSMRouteTargetName(map,objectiveTarget),routeLabel=reachable===true?'構造図上 '+targetName+'接続':reachable===false?'構造図上 逸れ候補':'構造図上 経路不明';
 const detail=[intel.enemy?('敵 '+intel.enemy):'',intel.air?('制空 '+intel.air):''].filter(Boolean).join(' / ')||intel.summary;
 return '<button type="button" class="hd-sm-next '+hdSMEsc(intel.kind)+(locked?' locked':'')+'" data-hd-sm-next-node="'+hdSMEsc(intel.label)+'"'+(locked?' disabled aria-disabled="true"':'')+'><b>'+hdSMEsc(intel.label)+'</b><small>'+hdSMEsc(hdSMNodeKindLabel(intel.kind))+'</small><i>'+(locked?'確認待ち':'次へ')+'</i><span class="hd-sm-next-risk">'+hdSMEsc(intel.badge)+'</span><span class="hd-sm-next-formation">基本陣形 '+hdSMEsc(intel.formation)+'</span><span class="hd-sm-next-route '+(reachable===false?'off':reachable===true?'on':'unknown')+'">'+routeLabel+'</span><span class="hd-sm-next-caution">'+hdSMEsc(intel.caution)+'</span><em>'+hdSMEsc(detail)+'</em></button>';
}
function hdSMCurrentTacticHtml(map,draft){
 const current=String(draft?.node||'').trim();if(!current)return '';
 const graph=hdSMGraph(map),rawKind=hdSMNodeKind(graph,current),intel=hdSMNodeIntel(map,{label:current,kind:rawKind}),kind=intel.kind,nonBattle=['item','safe','vortex','goal'].includes(kind);
 const guideLabel=nonBattle?'NODE GUIDE':'BATTLE GUIDE',pointLabel=nonBattle?'確認ポイント':'警戒ポイント';
 return '<div class="hd-sm-current-tactic '+hdSMEsc(kind)+'"><div class="hd-sm-current-head"><span>'+guideLabel+'</span><b>'+hdSMEsc(current)+'マス</b><small>'+hdSMEsc(hdSMNodeKindLabel(kind))+'</small></div><div class="hd-sm-current-grid"><div><span>基本陣形</span><strong>'+hdSMEsc(intel.formation)+'</strong><small>'+hdSMEsc(intel.formationReason)+'</small></div><div><span>'+pointLabel+'</span><strong>'+hdSMEsc(intel.caution)+'</strong><small>'+hdSMEsc(intel.summary)+'</small></div></div>'+(intel.source?'<footer>'+hdSMEsc(intel.source)+'</footer>':'')+'</div>';
}
function hdSMStartHpState(session){
 const ships=(session?.fleetSnapshot?.ships||[]).filter(x=>Number(x?.maxHp)>0&&Number(x?.nowHp)>=0);
 if(!ships.length)return {available:false,rows:[],critical:[],damaged:[]};
 const rows=ships.map((x,i)=>{
  const now=Math.max(0,Number(x.nowHp)||0),max=Math.max(1,Number(x.maxHp)||1),ratio=now/max;
  const state=now<=0?'轟沈':ratio<=.25?'大破':ratio<=.5?'中破':ratio<1?'小破/損傷':'健在';
  return {index:i+1,name:String(x.ship||x.name||('第'+(i+1)+'艦')),now,max,ratio,state};
 });
 return {available:true,rows,critical:rows.filter(x=>x.state==='大破'||x.state==='轟沈'),damaged:rows.filter(x=>x.ratio<1)};
}
function hdSMRequiresAdvanceCheck(map,label){
 const current=String(label||'').trim();if(!current)return false;
 const graph=hdSMGraph(map),kind=hdSMEffectiveNodeKind(map,current,hdSMNodeKind(graph,current));
 return !['item','safe','vortex','goal'].includes(kind);
}
function hdSMAdvanceGuard(session,draft){
 const current=String(draft?.node||'').trim();
 if(!current)return {required:false,current:'',confirmed:true,retreat:false,skipped:false,at:0,startHp:hdSMStartHpState(session)};
 const required=hdSMRequiresAdvanceCheck(session?.map,current);
 if(!required)return {required:false,current,confirmed:true,retreat:false,skipped:true,at:0,startHp:hdSMStartHpState(session)};
 const row=draft?.advanceGuard&&typeof draft.advanceGuard==='object'?draft.advanceGuard:{};
 const same=String(row.node||'')===current;
 return {required:true,current,confirmed:!!(same&&row.safe===true),retreat:!!(same&&row.safe===false),skipped:false,at:same?Math.max(0,Number(row.at)||0):0,startHp:hdSMStartHpState(session)};
}
function hdSMAdvanceGuardHtml(session,draft){
 const g=hdSMAdvanceGuard(session,draft);if(!g.required)return '';
 const hp=g.startHp||{},critical=hp.critical||[],damaged=hp.damaged||[];
 let startHp='';
 if(hp.available){
  const text=critical.length?('開始時に大破相当: '+critical.map(x=>x.name+' '+x.now+'/'+x.max).join(' / ')):damaged.length?('開始時の損傷: '+damaged.map(x=>x.name+' '+x.now+'/'+x.max).join(' / ')):'開始時HPは全艦最大';
  startHp='<div class="hd-sm-advance-start '+(critical.length?'danger':'')+'"><b>参考</b><span>'+hdSMEsc(text)+'</span><small>これは出撃開始時の同期値。戦闘後HPの代わりにはしないでね。</small></div>';
 }
 const state=g.retreat?'stop':g.confirmed?'ready':'warn';
 const title=g.retreat?'大破あり・撤退':g.confirmed?'大破なし確認済み':'進撃前に大破確認';
 const desc=g.retreat?'次マスは選べない状態にしたよ。帰還結果を「撤退」で記録してね。':g.confirmed?'このマスの戦闘後HPを確認済み。次マスを選べるよ。':'ゲーム画面で全艦のHPを確認してね。大破艦が1隻でもいるなら進撃しない。';
 return '<div class="hd-sm-advance-guard '+state+'"><div class="hd-sm-advance-head"><div><span>ADVANCE CHECK</span><strong>'+hdSMEsc(title)+'</strong></div><b>'+hdSMEsc(g.current)+'マス後</b></div><p>'+hdSMEsc(desc)+'</p>'+startHp+'<div class="hd-sm-advance-actions"><button type="button" class="primary" data-hd-sm-safe-confirm>大破なしを確認</button><button type="button" class="ghost hd-sm-retreat-btn" data-hd-sm-damage-retreat>大破あり・撤退</button></div>'+(g.at?'<small class="hd-sm-advance-time">確認 '+hdSMEsc(new Date(g.at).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}))+'</small>':'')+'</div>';
}
function hdSMSetAdvanceGuard(safe){
 const session=hdSMSession();if(!session||session.status!=='active')return false;
 const prev=session.draft&&typeof session.draft==='object'?session.draft:{},node=String(prev.node||document.getElementById('hdSMNode')?.value||'').trim();if(!node)return false;
 const at=Date.now(),next={...prev,...hdSMFormData(),advanceGuard:{node,safe:!!safe,at},updatedAt:at};
 if(!safe){
  next.result='撤退';next.boss=false;next.retreatReason='大破';
  const memo=String(next.memo||'').trim();if(!/大破撤退/.test(memo))next.memo=(memo?memo+'｜':'')+'大破撤退';
 }
 session.draft=next;
 try{if(typeof window.hdSSSave==='function')window.hdSSSave(session);else localStorage.setItem(HD_SM_SESSION_KEY,JSON.stringify(session))}catch{return false}
 try{window.dispatchEvent(new CustomEvent('hd:sortie-draft-saved',{detail:{sessionId:session.id,draft:session.draft}}))}catch{}
 hdSMRender();return true;
}
function hdSMHudHtml(session,draft){
 const current=String(draft?.node||'').trim();if(!current)return '';
 const graph=hdSMGraph(session?.map),rawKind=hdSMNodeKind(graph,current),intel=hdSMNodeIntel(session?.map,{label:current,kind:rawKind}),kind=intel.kind,guard=hdSMAdvanceGuard(session,draft),branch=hdSMBranchHint(session?.map,draft);
 const state=guard.retreat?'stop':guard.confirmed?'ready':'warn',status=guard.retreat?'撤退':guard.skipped?'非戦闘':guard.confirmed?'大破確認済':'大破未確認',jump=guard.confirmed?'next':'guard';
 const objectiveTarget=hdSMSelectedObjective(session?.map,draft),next=guard.confirmed&&!guard.retreat?hdSMNextNodeRows(session?.map,draft):[],battleCount=hdSMBattleCount(session?.map,draft?.routeNodes||[]),bossDistance=hdSMBossDistance(session?.map,current,objectiveTarget),bossBattles=hdSMBossBattleDistance(session?.map,current,objectiveTarget);
 const nextHtml=next.length?'<div class="hd-sm-hud-next"><span>NEXT</span><div>'+next.slice(0,3).map(x=>{const ni=hdSMNodeIntel(session?.map,x),reachable=hdSMCanReachBoss(session?.map,x.label,objectiveTarget),targetName=hdSMRouteTargetName(session?.map,objectiveTarget);return '<button type="button" class="'+(reachable===false?'route-off':reachable===true?'route-on':'')+'" data-hd-sm-hud-node="'+hdSMEsc(x.label)+'"><b>'+hdSMEsc(x.label)+'</b><small>'+hdSMEsc(hdSMNodeKindLabel(ni.kind))+'・'+hdSMEsc(ni.formation)+'</small><em>'+(reachable===true?targetName+'接続':reachable===false?'逸れ候補':'経路不明')+'</em></button>'}).join('')+'</div>'+(next.length>3?'<em>+'+(next.length-3)+'</em>':'')+'</div>':'';
 const branchHtml=current&&branch?'<div class="hd-sm-hud-branch"><span>ROUTE</span><b>'+hdSMEsc(branch.title)+'</b><small>'+hdSMEsc(branch.text)+'</small></div>':'';
 const targetName=hdSMRouteTargetName(session?.map,objectiveTarget);
 const progressHtml='<div class="hd-sm-hud-progress"><span>戦闘 <b>'+battleCount+'</b></span><span>'+(bossDistance===0?targetName+'到達':bossDistance==null?targetName+'距離 —':'構造図最短 '+targetName+'まで <b>'+bossDistance+'マス</b>')+'</span><span>'+(bossBattles==null?'最少戦闘 —':bossBattles===0?'最少戦闘あと 0':'最少戦闘あと <b>'+bossBattles+'</b>')+'</span></div>';
 return '<div class="hd-sm-hud '+state+'"><div class="hd-sm-hud-node"><span>NOW</span><b>'+hdSMEsc(current)+'</b><small>'+hdSMEsc(hdSMNodeKindLabel(kind))+'</small></div><div class="hd-sm-hud-main"><span>基本陣形 <b>'+hdSMEsc(intel.formation)+'</b></span><strong>'+hdSMEsc(status)+'</strong></div><button type="button" class="ghost small" data-hd-sm-hud-jump="'+jump+'">'+(guard.confirmed?'詳細':'確認する')+'</button>'+progressHtml+branchHtml+nextHtml+'</div>';
}
function hdSMHudJump(target){
 const selector=target==='next'?'.hd-sm-next-wrap':'.hd-sm-advance-guard',el=document.querySelector('#hdSortieMode '+selector);
 if(!el)return false;try{el.scrollIntoView({behavior:'smooth',block:'center'})}catch{el.scrollIntoView()}return true;
}
function hdSMBattleCount(map,route){
 const nodes=Array.isArray(route)?route.map(String).filter(Boolean):[];
 return nodes.reduce((n,label)=>n+(hdSMRequiresAdvanceCheck(map,label)?1:0),0);
}
function hdSMQuickResult(result){
 const el=document.getElementById('hdSMResult');if(!el)return false;el.value=String(result||'S');
 const boss=document.getElementById('hdSMBoss'),reason=document.getElementById('hdSMRetreatReason');
 if(el.value==='撤退'){if(boss)boss.checked=false}
 else if(reason)reason.value='';
 hdSMSaveDraft();hdSMRender();return true;
}
function hdSMQuickRetreatReason(reason){
 const result=document.getElementById('hdSMResult'),boss=document.getElementById('hdSMBoss'),el=document.getElementById('hdSMRetreatReason');if(!result||!el)return false;
 result.value='撤退';if(boss)boss.checked=false;el.value=String(reason||'その他');hdSMSaveDraft();hdSMRender();return true;
}
function hdSMQuickBoss(){
 const el=document.getElementById('hdSMBoss');if(!el)return false;el.checked=!el.checked;hdSMSaveDraft();hdSMRender();return true;
}
function hdSMQuickDropNone(){
 const el=document.getElementById('hdSMDrop');if(!el)return false;el.value='なし';hdSMSaveDraft();return true;
}
function hdSMQuickBucket(delta=1){
 const el=document.getElementById('hdSMBuckets');if(!el)return false;el.value=String(Math.max(0,(Number(el.value)||0)+Number(delta||0)));hdSMSaveDraft();return true;
}
function hdSMElapsed(ms){
 const total=Math.max(0,Math.floor((Number(ms)||0)/1000)),s=total%60,m=Math.floor(total/60)%60,h=Math.floor(total/3600);
 return h?h+'時間'+String(m).padStart(2,'0')+'分':m+'分'+String(s).padStart(2,'0')+'秒';
}
function hdSMReadinessHtml(r){
 r=r||{};const unresolved=(r.unresolved||[]).map(function(x){return x&&x.label}).filter(Boolean);
 return '<div class="hd-sm-readiness"><span>自動確認 <b>'+(Number(r.autoOk)||0)+'/'+(Number(r.autoTotal)||0)+'</b></span><span>手動確認 <b>'+(Number(r.manualDone)||0)+'/'+(Number(r.manualTotal)||0)+'</b></span></div>'+
  (unresolved.length?'<div class="hd-sm-unresolved"><b>開始時の要確認</b><div>'+unresolved.map(function(x){return '<span>'+hdSMEsc(x)+'</span>'}).join('')+'</div></div>':'');
}
function hdSMFleetHtml(session){
 const rows=(session&&session.fleetSnapshot&&Array.isArray(session.fleetSnapshot.ships)?session.fleetSnapshot.ships:[]).filter(function(x){return String(x&&x.ship||'').trim()||String(x&&x.gear||'').trim()});
 if(!rows.length)return '<div class="empty">開始時の艦隊スナップショットは空だよ。</div>';
 return '<ol class="hd-sm-fleet">'+rows.map(function(x,i){
  const name=String(x&&x.ship||'未入力').trim()||'未入力';
  const raw=x&&x.gear;const gear=Array.isArray(raw)?raw.filter(Boolean).join(' / '):String(raw||'').trim();
  return '<li><span>'+(i+1)+'</span><div><b>'+hdSMEsc(name)+'</b>'+(gear?'<small>'+hdSMEsc(gear)+'</small>':'<small>装備メモなし</small>')+'</div></li>';
 }).join('')+'</ol>';
}
function hdSMIdleHtml(){
 const map=hdSMMap();
 if(!map)return '<div class="hd-sm-empty"><div><strong>海域を選んで出撃準備を始めよう</strong><p>攻略画面で海域を選ぶと、ここから準備表と実戦セッションへつなげられるよ。</p></div><button type="button" class="primary" data-hd-sm-guide>海域攻略を開く</button></div>';
 const d=hdSMMapDetail(map),row=typeof window.hdSSSelectedSummary==='function'?window.hdSSSelectedSummary(map):null;
 if(!row)return '<div class="hd-sm-idle"><div class="hd-sm-map"><span>選択海域</span><strong>'+hdSMEsc(map)+' '+hdSMEsc(d.name||'')+'</strong></div><div class="hd-sm-empty compact"><p>この海域で使う編成がまだ選ばれてないよ。出撃準備表で編成を決めよう。</p></div><div class="hd-sm-actions"><button type="button" class="primary" data-hd-sm-prep>出撃準備表を開く</button><button type="button" class="ghost" data-hd-sm-guide>海域攻略へ</button></div></div>';
 const s=row.stats||{},ready=(!s.autoTotal||s.autoOk===s.autoTotal)&&(!s.manualTotal||s.manualDone===s.manualTotal);
 return '<div class="hd-sm-idle"><div class="hd-sm-map"><span>選択海域</span><strong>'+hdSMEsc(map)+' '+hdSMEsc(d.name||'')+'</strong></div>'+hdSMObjectivePrestartHtml(map)+'<div class="hd-sm-status '+(ready?'ready':'warn')+'"><div><span>'+hdSMEsc(row.strategyLabel||'手動編成')+'</span><strong>'+hdSMEsc(row.fleet&&row.fleet.name||'名称なし')+'</strong><small>'+(Number(s.shipCount)||0)+'隻</small></div><b>'+(ready?'出撃前確認済み':'未確認あり')+'</b></div>'+hdSMReadinessHtml({autoOk:s.autoOk,autoTotal:s.autoTotal,manualDone:s.manualDone,manualTotal:s.manualTotal,unresolved:s.unresolved})+'<div class="hd-sm-actions"><button type="button" class="primary" data-hd-sm-start>この編成で出撃開始</button><button type="button" class="ghost" data-hd-sm-prep>出撃準備表</button><button type="button" class="ghost" data-hd-sm-guide>海域攻略</button></div><p class="hd-sm-note">開始すると、その時点の艦隊・装備・確認状態を固定して出撃中画面へ切り替えるよ。</p></div>';
}
function hdSMDraft(session){
 const d=session&&session.draft&&typeof session.draft==='object'?session.draft:{};
 const routeNodes=Array.isArray(d.routeNodes)?d.routeNodes.map(String).filter(Boolean).slice(-40):[];
 const storedBattles=(d.battles==null||d.battles==='')?1:Math.max(0,Number.isFinite(Number(d.battles))?Number(d.battles):1);
 const battles=routeNodes.length?hdSMBattleCount(session?.map,routeNodes):storedBattles;
 return {result:String(d.result||'S'),node:String(d.node||''),battles,boss:!!d.boss,drop:String(d.drop||''),buckets:Math.max(0,Number(d.buckets)||0),fuel:Math.max(0,Number(d.fuel)||0),ammo:Math.max(0,Number(d.ammo)||0),steel:Math.max(0,Number(d.steel)||0),bauxite:Math.max(0,Number(d.bauxite)||0),memo:String(d.memo||''),retreatReason:String(d.retreatReason||''),objectiveTarget:String(d.objectiveTarget||''),updatedAt:Math.max(0,Number(d.updatedAt)||0),routeNodes,advanceGuard:d.advanceGuard&&typeof d.advanceGuard==='object'?{node:String(d.advanceGuard.node||''),safe:d.advanceGuard.safe===true,at:Math.max(0,Number(d.advanceGuard.at)||0)}:null};
}
function hdSMNodePickerHtml(session,draft){
 const rows=hdSMNodeRows(session?.map),route=draft?.routeNodes||[],current=String(draft?.node||''),next=hdSMNextNodeRows(session?.map,draft),guard=hdSMAdvanceGuard(session,draft),locked=guard.required&&!guard.confirmed,objectiveTarget=hdSMSelectedObjective(session?.map,draft);
 if(!rows.length)return '';
 const nextTitle=current?'次に進める候補':'最初の進行候補';
 const nextHtml=next.length?'<div class="hd-sm-next-wrap '+(locked?'locked':'')+'"><div class="hd-sm-next-head"><b>'+nextTitle+'</b><small>'+(locked?'大破チェックを済ませると選べるよ。':'候補ごとに戦闘種別と、登録済みの敵・制空注意を表示するよ。')+'</small></div><div class="hd-sm-next-grid">'+next.map(function(x){return hdSMNextNodeButtonHtml(session?.map,x,locked,objectiveTarget)}).join('')+'</div></div>':'<div class="hd-sm-next-done">'+(current?'このマスから先の接続候補は登録されていないよ。':'開始地点の候補を取得できないよ。')+'</div>';
 return '<div class="hd-sm-panel hd-sm-node-panel"><div class="hd-sm-panel-head"><strong>現在マス</strong><span>普段は「次に進める候補」だけタップでOK</span></div>'+hdSMObjectivePickerHtml(session?.map,draft)+hdSMCurrentTacticHtml(session?.map,draft)+hdSMAdvanceGuardHtml(session,draft)+nextHtml+hdSMBranchHintHtml(session?.map,draft)+
  '<details class="hd-sm-all-nodes"><summary>'+(locked?'全マスから選ぶ（大破確認後）':'全マスから選ぶ')+'</summary><div class="hd-sm-node-grid">'+
  rows.map(function(x){const active=x.label===current,nodeLocked=!!(locked&&!active);return '<button type="button" class="hd-sm-node '+hdSMEsc(x.kind)+(active?' active':'')+(nodeLocked?' locked':'')+'" data-hd-sm-node="'+hdSMEsc(x.label)+'" aria-pressed="'+(active?'true':'false')+'"'+(nodeLocked?' disabled aria-disabled="true"':'')+'><b>'+hdSMEsc(x.label)+'</b><small>'+hdSMEsc(hdSMNodeKindLabel(x.kind))+'</small></button>'}).join('')+
  '</div></details>'+(route.length?'<div class="hd-sm-route-trail"><div><span>通過</span><b>'+route.map(hdSMEsc).join(' → ')+'</b></div><button type="button" class="ghost small" data-hd-sm-route-undo>1つ戻す</button></div>':'<div class="hd-sm-route-empty">次候補を押すと、ここに通過履歴を残すよ。</div>')+'</div>';
}
function hdSMResultOptions(current){
 return ['S','A','B','C','D','撤退'].map(function(v){return '<option'+(current===v?' selected':'')+'>'+v+'</option>'}).join('');
}
function hdSMActiveHtml(session){
 const d=hdSMMapDetail(session.map),started=Number(session.startedAt)||Date.now(),draft=hdSMDraft(session);
 const draftStatus=draft.updatedAt?'保存 '+new Date(draft.updatedAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}):'入力は自動保存';
 return '<div class="hd-sm-active"><div class="hd-sm-command"><div><span>出撃中</span><strong>'+hdSMEsc(session.map)+' '+hdSMEsc(d.name||'')+'</strong><small>'+hdSMEsc(session.fleetName||'名称なし')+'｜'+hdSMEsc(session.strategyLabel||'手動編成')+'</small></div><div class="hd-sm-clock"><span>経過</span><b data-hd-sm-elapsed>'+hdSMElapsed(Date.now()-started)+'</b><small>'+hdSMEsc(new Date(started).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}))+'開始</small></div></div>'+
 hdSMHudHtml(session,draft)+
 hdSMReadinessHtml(session.readinessSnapshot||{})+
 hdSMNodePickerHtml(session,draft)+
 '<div class="hd-sm-panel"><div class="hd-sm-panel-head"><strong>開始時の艦隊</strong><span>出撃中にプリセットを変えてもここは固定</span></div>'+hdSMFleetHtml(session)+'</div>'+
 '<div class="hd-sm-panel"><div class="hd-sm-panel-head"><strong>出撃中ショートカット</strong><span>必要な情報だけすぐ開く</span></div><div class="hd-sm-shortcuts"><button type="button" data-hd-sm-action="map">マップ</button><button type="button" data-hd-sm-action="overview">攻略概要</button><button type="button" data-hd-sm-action="gear">装備</button><button type="button" data-hd-sm-action="prep">準備表</button><button type="button" data-hd-sm-action="log">出撃ログ</button></div></div>'+
 '<div class="hd-sm-panel hd-sm-return"><div class="hd-sm-panel-head"><strong>帰還結果</strong><span data-hd-sm-draft-status>'+hdSMEsc(draftStatus)+'</span></div><div class="hd-sm-result-quick"><button type="button" data-hd-sm-quick-result="S">S勝利</button><button type="button" data-hd-sm-quick-result="A">A勝利</button><button type="button" data-hd-sm-quick-result="B">B勝利</button><button type="button" data-hd-sm-quick-result="撤退">撤退</button><button type="button" data-hd-sm-quick-boss>ボス到達</button><button type="button" data-hd-sm-quick-drop-none>ドロップなし</button><button type="button" data-hd-sm-quick-bucket="+1">バケツ +1</button></div><input id="hdSMRetreatReason" type="hidden" value="'+hdSMEsc(draft.retreatReason)+'"><div class="hd-sm-retreat-reasons '+(draft.result==='撤退'?'show':'')+'"><span>撤退理由</span><div><button type="button" data-hd-sm-retreat-reason="大破">大破</button><button type="button" data-hd-sm-retreat-reason="索敵不足">索敵不足</button><button type="button" data-hd-sm-retreat-reason="ルート逸れ">ルート逸れ</button><button type="button" data-hd-sm-retreat-reason="火力不足">火力不足</button><button type="button" data-hd-sm-retreat-reason="制空不足">制空不足</button><button type="button" data-hd-sm-retreat-reason="その他">その他</button></div>'+(draft.retreatReason?'<small>選択中: '+hdSMEsc(draft.retreatReason)+'</small>':'')+'</div><div class="hd-sm-form"><label>結果<select id="hdSMResult">'+hdSMResultOptions(draft.result)+'</select></label><label>到達マス<input id="hdSMNode" value="'+hdSMEsc(draft.node)+'" placeholder="例 ボス / P"></label><label>戦闘数<input id="hdSMBattles" type="number" min="0" max="20" value="'+draft.battles+'"></label><label class="check"><input id="hdSMBoss" type="checkbox"'+(draft.boss?' checked':'')+'>ボス到達</label><label>ドロップ<input id="hdSMDrop" value="'+hdSMEsc(draft.drop)+'" placeholder="艦名など"></label><label>バケツ<input id="hdSMBuckets" type="number" min="0" value="'+draft.buckets+'"></label><label class="wide">メモ<input id="hdSMMemo" value="'+hdSMEsc(draft.memo)+'" placeholder="撤退原因、装備変更など"></label></div><details class="hd-sm-cost"'+((draft.fuel||draft.ammo||draft.steel||draft.bauxite)?' open':'')+'><summary>資源消費も記録</summary><div><label>燃料<input id="hdSMFuel" type="number" min="0" value="'+draft.fuel+'"></label><label>弾薬<input id="hdSMAmmo" type="number" min="0" value="'+draft.ammo+'"></label><label>鋼材<input id="hdSMSteel" type="number" min="0" value="'+draft.steel+'"></label><label>ボーキ<input id="hdSMBauxite" type="number" min="0" value="'+draft.bauxite+'"></label></div></details><div class="hd-sm-finish-actions"><button type="button" class="primary" data-hd-sm-finish>帰還結果を記録</button><button type="button" class="ghost" data-hd-sm-cancel>セッションを破棄</button></div></div><p class="hd-sm-note">入力内容はこの出撃セッションへ自動保存。戦闘数は通過した戦闘マスから自動更新するよ。</p></div>';
}
function hdSMEnsure(){
 let sec=document.getElementById('hdSortieMode');if(sec)return sec;
 const anchor=document.getElementById('hdSortiePreparation')||document.getElementById('guide');if(!anchor)return null;
 sec=document.createElement('section');sec.id='hdSortieMode';sec.className='advanced-section hd-sm-section';
 sec.innerHTML='<div class="section-head"><div><div class="eyebrow">SORTIE COMMAND</div><h2>出撃モード</h2></div><span class="muted" data-hd-sm-heading>待機中</span></div><div id="hdSortieModeBody"></div>';
 anchor.insertAdjacentElement('afterend',sec);
 try{window.dispatchEvent(new CustomEvent('hd:workspace-refresh'))}catch{}
 return sec;
}
function hdSMRender(){
 const sec=hdSMEnsure(),host=document.getElementById('hdSortieModeBody'),heading=sec&&sec.querySelector('[data-hd-sm-heading]');if(!sec||!host)return false;
 const session=hdSMSession();
 if(heading)heading.textContent=session?'出撃中 '+String(session.map||''):'待機中';
 host.innerHTML=session?hdSMActiveHtml(session):hdSMIdleHtml();
 hdSMTick();return true;
}
function hdSMOpen(){
 hdSMEnsure();hdSMRender();
 if(typeof window.hdWSShowElement==='function')return !!window.hdWSShowElement('hdSortieMode',true);
 const el=document.getElementById('hdSortieMode');if(el){el.scrollIntoView({behavior:'smooth',block:'start'});return true}return false;
}
function hdSMNum(id){return Math.max(0,Number(document.getElementById(id)?.value)||0)}
function hdSMFormData(){
 const result=document.getElementById('hdSMResult')?.value||'S',session=hdSMSession();
 return {result,node:document.getElementById('hdSMNode')?.value||'',battles:hdSMNum('hdSMBattles'),boss:!!document.getElementById('hdSMBoss')?.checked,drop:document.getElementById('hdSMDrop')?.value||'',buckets:hdSMNum('hdSMBuckets'),fuel:hdSMNum('hdSMFuel'),ammo:hdSMNum('hdSMAmmo'),steel:hdSMNum('hdSMSteel'),bauxite:hdSMNum('hdSMBauxite'),memo:document.getElementById('hdSMMemo')?.value||'',retreatReason:result==='撤退'?(document.getElementById('hdSMRetreatReason')?.value||''):'',objectiveTarget:hdSMSelectedObjective(session?.map,session?.draft)};
}
let hdSMDraftTimer=0;
function hdSMSaveDraft(){
 const session=hdSMSession();if(!session||session.status!=='active'||!document.getElementById('hdSMResult'))return false;
 const prev=session.draft&&typeof session.draft==='object'?session.draft:{},routeNodes=Array.isArray(prev.routeNodes)?prev.routeNodes.map(String).filter(Boolean).slice(-40):[],form=hdSMFormData();
 const draft={...prev,...form,routeNodes,battles:routeNodes.length?hdSMBattleCount(session.map,routeNodes):form.battles};draft.updatedAt=Date.now();session.draft=draft;
 try{if(typeof window.hdSSSave==='function')window.hdSSSave(session);else localStorage.setItem(HD_SM_SESSION_KEY,JSON.stringify(session))}catch{return false}
 const status=document.querySelector('[data-hd-sm-draft-status]');if(status)status.textContent='保存 '+new Date(draft.updatedAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
 try{window.dispatchEvent(new CustomEvent('hd:sortie-draft-saved',{detail:{sessionId:session.id,draft}}))}catch{}
 return true;
}
function hdSMScheduleDraft(){clearTimeout(hdSMDraftTimer);hdSMDraftTimer=setTimeout(hdSMSaveDraft,180)}
function hdSMSetNode(label){
 clearTimeout(hdSMDraftTimer);label=String(label||'').trim();const session=hdSMSession();if(!label||!session||session.status!=='active')return false;
 const prev=session.draft&&typeof session.draft==='object'?session.draft:{},current=String(prev.node||'').trim(),guard=hdSMAdvanceGuard(session,prev);
 if(current&&label!==current&&guard.required&&!guard.confirmed){window.hdToast?.('進撃前に大破チェックを済ませてね','warn',1800);return false}
 const input=document.getElementById('hdSMNode'),boss=document.getElementById('hdSMBoss'),graph=hdSMGraph(session.map);
 if(input)input.value=label;if(boss)boss.checked=!!(graph&&graph.boss===label);
 const route=Array.isArray(prev.routeNodes)?prev.routeNodes.map(String).filter(Boolean).slice(-39):[];
 if(route[route.length-1]!==label)route.push(label);
 session.draft={...prev,...hdSMFormData(),node:label,boss:!!(graph&&graph.boss===label),battles:hdSMBattleCount(session.map,route),routeNodes:route,advanceGuard:null,updatedAt:Date.now()};
 try{if(typeof window.hdSSSave==='function')window.hdSSSave(session);else localStorage.setItem(HD_SM_SESSION_KEY,JSON.stringify(session))}catch{return false}
 try{window.dispatchEvent(new CustomEvent('hd:sortie-draft-saved',{detail:{sessionId:session.id,draft:session.draft}}))}catch{}
 hdSMRender();return true;
}
function hdSMUndoNode(){
 clearTimeout(hdSMDraftTimer);const session=hdSMSession();if(!session||session.status!=='active')return false;
 const prev=session.draft&&typeof session.draft==='object'?session.draft:{},route=Array.isArray(prev.routeNodes)?prev.routeNodes.map(String).filter(Boolean):[];
 if(!route.length)return false;route.pop();const node=route[route.length-1]||'',graph=hdSMGraph(session.map);
 session.draft={...prev,node,boss:!!(node&&graph&&graph.boss===node),battles:hdSMBattleCount(session.map,route),routeNodes:route.slice(-40),advanceGuard:null,updatedAt:Date.now()};
 try{if(typeof window.hdSSSave==='function')window.hdSSSave(session);else localStorage.setItem(HD_SM_SESSION_KEY,JSON.stringify(session))}catch{return false}
 try{window.dispatchEvent(new CustomEvent('hd:sortie-draft-saved',{detail:{sessionId:session.id,draft:session.draft}}))}catch{}
 hdSMRender();return true;
}
function hdSMTick(){
 const session=hdSMSession(),el=document.querySelector('[data-hd-sm-elapsed]');if(session&&el)el.textContent=hdSMElapsed(Date.now()-(Number(session.startedAt)||Date.now()));
}
function hdSMAction(action){
 if(action==='prep'){if(typeof window.hdWSShowElement==='function')return window.hdWSShowElement('hdSortiePreparation',true)}
 if(action==='log'){if(typeof window.hdWSShowElement==='function')return window.hdWSShowElement('sortieLog',true)}
 if(['map','overview','gear'].includes(action)&&typeof window.hdSPSOpenMapTab==='function'){window.hdSPSOpenMapTab(action);return true}
 return false;
}
let hdSMInstalled=false;
function hdSMInstall(){
 hdSMEnsure();
 if(hdSMInstalled){
  const body=document.getElementById('hdSortieModeBody');
  if(body&&!body.children.length)hdSMRender();
  return true;
 }
 hdSMInstalled=true;hdSMRender();return true;
}

document.addEventListener('input',function(e){if(e.target?.closest?.('#hdSortieModeBody input, #hdSortieModeBody select'))hdSMScheduleDraft()});
document.addEventListener('change',function(e){if(e.target?.closest?.('#hdSortieModeBody input, #hdSortieModeBody select'))hdSMScheduleDraft()});
document.addEventListener('click',function(e){
 const nextNode=e.target.closest?.('[data-hd-sm-next-node]');if(nextNode){hdSMSetNode(nextNode.dataset.hdSmNextNode);return}
 const node=e.target.closest?.('[data-hd-sm-node]');if(node){hdSMSetNode(node.dataset.hdSmNode);return}
 if(e.target.closest?.('[data-hd-sm-route-undo]')){hdSMUndoNode();return}
 if(e.target.closest?.('[data-hd-sm-safe-confirm]')){hdSMSetAdvanceGuard(true);return}
 if(e.target.closest?.('[data-hd-sm-damage-retreat]')){hdSMSetAdvanceGuard(false);return}
 const hudJump=e.target.closest?.('[data-hd-sm-hud-jump]');if(hudJump){hdSMHudJump(hudJump.dataset.hdSmHudJump);return}
 const hudNode=e.target.closest?.('[data-hd-sm-hud-node]');if(hudNode){hdSMSetNode(hudNode.dataset.hdSmHudNode);return}
 const objective=e.target.closest?.('[data-hd-sm-objective]');if(objective){hdSMSetObjectiveTarget(objective.dataset.hdSmObjective);return}
 const preObjective=e.target.closest?.('[data-hd-sm-pre-objective]');if(preObjective){hdSMSetObjectivePreference(preObjective.dataset.hdSmObjectiveMap,preObjective.dataset.hdSmPreObjective);return}
 const quickResult=e.target.closest?.('[data-hd-sm-quick-result]');if(quickResult){hdSMQuickResult(quickResult.dataset.hdSmQuickResult);return}
 if(e.target.closest?.('[data-hd-sm-quick-boss]')){hdSMQuickBoss();return}
 if(e.target.closest?.('[data-hd-sm-quick-drop-none]')){hdSMQuickDropNone();return}
 const quickBucket=e.target.closest?.('[data-hd-sm-quick-bucket]');if(quickBucket){hdSMQuickBucket(Number(quickBucket.dataset.hdSmQuickBucket)||1);return}
 const retreatReason=e.target.closest?.('[data-hd-sm-retreat-reason]');if(retreatReason){hdSMQuickRetreatReason(retreatReason.dataset.hdSmRetreatReason);return}
 if(e.target.closest?.('[data-hd-sm-start]')){const session=typeof window.hdSSStart==='function'?window.hdSSStart(hdSMMap()):null;if(session){hdSMRender();hdSMOpen()}else window.hdToast?.('出撃編成を選んでから開始してね','warn',1800);return}
 if(e.target.closest?.('[data-hd-sm-prep]')){hdSMAction('prep');return}
 if(e.target.closest?.('[data-hd-sm-guide]')){if(typeof window.hdWSShowElement==='function')window.hdWSShowElement('guide',true);return}
 const action=e.target.closest?.('[data-hd-sm-action]');if(action){hdSMAction(action.dataset.hdSmAction);return}
 if(e.target.closest?.('[data-hd-sm-finish]')){clearTimeout(hdSMDraftTimer);const entry=typeof window.hdSSFinish==='function'?window.hdSSFinish(hdSMFormData()):null;if(entry){window.hdToast?.('帰還結果を記録したよ','info',1600);hdSMRender()}return}
 if(e.target.closest?.('[data-hd-sm-cancel]')){if(confirm('この出撃セッションを記録せず破棄する？')){clearTimeout(hdSMDraftTimer);window.hdSSClear?.();hdSMRender()}return}
});
window.addEventListener('hd:sortie-session-changed',function(){hdSMRender()});
window.addEventListener('hd:map-rendered',function(){if(!hdSMSession())hdSMRender()});
window.addEventListener('storage',function(e){if(!e||e.key===HD_SM_SESSION_KEY)hdSMRender()});
window.addEventListener('pagehide',hdSMSaveDraft,{passive:true});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')hdSMSaveDraft()});
window.addEventListener('hd:modules-ready',function(){setTimeout(hdSMInstall,0)});
window.addEventListener('load',function(){setTimeout(hdSMInstall,1100)});
setInterval(hdSMTick,1000);
setTimeout(hdSMInstall,1700);

window.hdSMEnsure=hdSMEnsure;
window.hdSMRender=hdSMRender;
window.hdSMOpen=hdSMOpen;
window.hdSMFormData=hdSMFormData;
window.hdSMNodeRows=hdSMNodeRows;
window.hdSMNextNodeRows=hdSMNextNodeRows;
window.hdSMBranchHint=hdSMBranchHint;
window.hdSMFormationAdvice=hdSMFormationAdvice;
window.hdSMEffectiveNodeKind=hdSMEffectiveNodeKind;
window.hdSMNodeIntel=hdSMNodeIntel;
window.hdSMCurrentTacticHtml=hdSMCurrentTacticHtml;
window.hdSMStartHpState=hdSMStartHpState;
window.hdSMRequiresAdvanceCheck=hdSMRequiresAdvanceCheck;
window.hdSMAdvanceGuard=hdSMAdvanceGuard;
window.hdSMSetAdvanceGuard=hdSMSetAdvanceGuard;
window.hdSMBossDistance=hdSMBossDistance;
window.hdSMBossBattleDistance=hdSMBossBattleDistance;
window.hdSMCanReachBoss=hdSMCanReachBoss;
window.hdSMRouteTargetName=hdSMRouteTargetName;
window.hdSMObjectiveTargets=hdSMObjectiveTargets;
window.hdSMObjectiveOptions=hdSMObjectiveOptions;
window.hdSMObjectivePrefs=hdSMObjectivePrefs;
window.hdSMObjectivePreference=hdSMObjectivePreference;
window.hdSMSaveObjectivePreference=hdSMSaveObjectivePreference;
window.hdSMSetObjectivePreference=hdSMSetObjectivePreference;
window.hdSMObjectiveStartStats=hdSMObjectiveStartStats;
window.hdSMObjectiveStatText=hdSMObjectiveStatText;
window.hdSMObjectivePrestartHtml=hdSMObjectivePrestartHtml;
window.hdSMSelectedObjective=hdSMSelectedObjective;
window.hdSMObjectivePickerHtml=hdSMObjectivePickerHtml;
window.hdSMSetObjectiveTarget=hdSMSetObjectiveTarget;
window.hdSMHudHtml=hdSMHudHtml;
window.hdSMHudJump=hdSMHudJump;
window.hdSMBattleCount=hdSMBattleCount;
window.hdSMQuickResult=hdSMQuickResult;
window.hdSMQuickBoss=hdSMQuickBoss;
window.hdSMQuickDropNone=hdSMQuickDropNone;
window.hdSMQuickBucket=hdSMQuickBucket;
window.hdSMQuickRetreatReason=hdSMQuickRetreatReason;
window.hdSMSetNode=hdSMSetNode;
window.hdSMUndoNode=hdSMUndoNode;
window.hdSMSaveDraft=hdSMSaveDraft;
window.hdSMScheduleDraft=hdSMScheduleDraft;
window.hdSMTick=hdSMTick;
window.hdSMAction=hdSMAction;
window.hdSMInstall=hdSMInstall;
