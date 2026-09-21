const HD_SS_KEY='harbordesk-active-sortie-session-v1';
const HD_SS_POST_KEY='harbordesk-post-sortie-review-v1';
const HD_SS_OBJECTIVE_PREF_KEY='harbordesk-sortie-objective-pref-v1';

function hdSSEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function hdSSLoad(){try{return JSON.parse(localStorage.getItem(HD_SS_KEY)||'null')}catch{return null}}
function hdSSSave(v){if(v)localStorage.setItem(HD_SS_KEY,JSON.stringify(v));else localStorage.removeItem(HD_SS_KEY)}
function hdSSPostLoad(){try{return JSON.parse(localStorage.getItem(HD_SS_POST_KEY)||'null')}catch{return null}}
function hdSSPostSave(v){if(v)localStorage.setItem(HD_SS_POST_KEY,JSON.stringify(v));else localStorage.removeItem(HD_SS_POST_KEY)}
function hdSSObjectivePrefs(){try{const x=JSON.parse(localStorage.getItem(HD_SS_OBJECTIVE_PREF_KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}}
function hdSSObjectivePref(map){return String(hdSSObjectivePrefs()[String(map||'')]||'').trim()}
function hdSSApplyObjectivePref(session,map){
 if(!session)return session;
 const objectiveTarget=hdSSObjectivePref(map);
 if(objectiveTarget)session.draft={...(session.draft||{}),objectiveTarget};
 return session;
}

function hdSSUid(){return crypto.randomUUID?crypto.randomUUID():'ss-'+Date.now()+'-'+Math.random().toString(16).slice(2)}
function hdSSMap(){return typeof hdSPSMap==='function'?hdSPSMap():(typeof selectedMap!=='undefined'?selectedMap:'')}
function hdSSFleet(map){
 try{const fleets=typeof hdSortieFleets==='function'?hdSortieFleets(map):(typeof loadCustomFleets==='function'?(loadCustomFleets()[map]||[]):[]),id=typeof hdSortieSelection==='function'?hdSortieSelection(map):'';return fleets.find(function(x){return x.id===id})||fleets[0]||null}catch{return null}
}
function hdSSStrategy(fleet){
 if(typeof hdSPMStrategy==='function')return hdSPMStrategy(fleet);
 return String(fleet&&fleet.strategy||'manual');
}
function hdSSStrategyLabel(fleet){
 if(fleet&&fleet.strategyLabel)return fleet.strategyLabel;
 const id=hdSSStrategy(fleet);
 if(typeof HD_SPM_STRATEGIES!=='undefined'&&HD_SPM_STRATEGIES[id])return HD_SPM_STRATEGIES[id].label;
 return id==='manual'?'手動編成':id;
}
function hdSSStats(map,fleet){
 if(typeof hdSPMStats==='function')return hdSPMStats(map,fleet);
 let auto={checks:[],adv:{}};try{if(typeof hdSortieAutoChecks==='function')auto=hdSortieAutoChecks(map,fleet)}catch{}
 let manual=[];try{if(typeof hdSortieManualChecks==='function')manual=hdSortieManualChecks(map,auto.adv||{})}catch{}
 let state={};try{if(typeof hdSortieState==='function')state=hdSortieState(map,fleet.id)||{}}catch{}
 const ships=(fleet.ships||[]).filter(function(x){return String(x.ship||'').trim()||String(x.gear||'').trim()});
 return {ships:ships,shipCount:ships.filter(function(x){return String(x.ship||'').trim()}).length,auto:auto,autoOk:(auto.checks||[]).filter(function(x){return x.state==='ok'}).length,autoTotal:(auto.checks||[]).length,unresolved:(auto.checks||[]).filter(function(x){return x.state!=='ok'}),manual:manual,manualDone:manual.filter(function(x){return state[x.id]}).length,manualTotal:manual.length};
}
function hdSSGate(map,fleet,stats){
 let raw=null;
 try{
  if(typeof hdFEPlanFromSavedFleet==='function'&&typeof hdFEEvaluate==='function'&&typeof hdFEGoNoGo==='function'){
   const plan=hdFEPlanFromSavedFleet(map,fleet),evaluation=hdFEEvaluate(plan);
   raw=hdFEGoNoGo(evaluation?.auto);
  }
 }catch{}
 const base=raw||{state:'hold',label:'要確認',detail:'統合出撃判定を取得できないため手動確認',blockers:[],cautions:[],actions:[]};
 const blockers=Array.isArray(base.blockers)?base.blockers:[],hard=blockers.filter(x=>x?.id==='health'||x?.id==='supply'),actions=[...(Array.isArray(base.actions)?base.actions:[])];
 const manualLeft=Math.max(0,(Number(stats?.manualTotal)||0)-(Number(stats?.manualDone)||0)),post=hdSSPostLoad(),postAwaiting=!!(post&&post.status==='awaiting-sync'&&String(post.map||'')===String(map||'')&&(!post.fleetId||!fleet?.id||String(post.fleetId)===String(fleet.id)));
 let state=base.state||'hold';
 if(manualLeft&&state==='go')state='hold';
 if(manualLeft)actions.push({id:'manual',label:'出撃直前チェック',status:'manual',action:'出撃直前の手動チェックを完了する',detail:`未確認 ${manualLeft}件`});
 if(postAwaiting){if(state==='go')state='hold';actions.unshift({id:'postSync',label:'帰還後同期',status:'manual',action:'艦これを再同期して帰還後の状態を確認',detail:'前回出撃後のライブ状態が未更新'});}
 const label=state==='go'?'出撃準備OK':state==='stop'?'修正必要':'要確認';
 const detail=hard.length?`安全上の修正が必要 ${hard.length}件`:postAwaiting&&state!=='stop'?'前回出撃後の再同期がまだ。次回出撃前にライブ状態を更新しよう':manualLeft&&state==='hold'?`手動確認が ${manualLeft}件残っている`:(base.detail||'確認が必要');
 return {state,label,detail,hardBlock:hard.length>0,hardBlockers:hard,blockers,cautions:Array.isArray(base.cautions)?base.cautions:[],actions,postAwaiting};
}
function hdSSTelemetry(map,fleet){
 try{
  if(typeof hdFEPlanFromSavedFleet!=='function'||typeof hdFEEvaluate!=='function')return null;
  const plan=hdFEPlanFromSavedFleet(map,fleet),evaluation=hdFEEvaluate(plan),auto=evaluation?.auto||null,gate=auto&&typeof hdFEGoNoGo==='function'?hdFEGoNoGo(auto):null,sync=(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-kancolle-sync-v1')||'null')}catch{return null}})();
  if(!auto)return null;
  return {
   capturedAt:Date.now(),syncAt:Number(sync?.syncedAt)||0,
   gate:gate?{state:gate.state||'hold',label:gate.label||'',detail:gate.detail||'',actions:(gate.actions||[]).slice(0,6).map(x=>({id:x.id||'',action:x.action||'',detail:x.detail||''}))}:null,
   live:auto.live?{status:auto.live.status||'',blocked:Number(auto.live.blocked)||0,caution:Number(auto.live.caution)||0,details:(auto.live.details||[]).map(x=>({name:x.name||'',status:x.status||'',labels:x.labels||[],hp:Number(x.hp)||0,maxHp:Number(x.maxHp)||0,cond:x.cond==null?null:Number(x.cond)}))}:null,
   supply:auto.supply?{status:auto.supply.status||'',low:Number(auto.supply.low)||0,empty:Number(auto.supply.empty)||0,rows:(auto.supply.rows||[]).map(x=>({name:x.name||'',currentFuel:Number(x.currentFuel)||0,currentAmmo:Number(x.currentAmmo)||0,maxFuel:Number(x.maxFuel)||0,maxAmmo:Number(x.maxAmmo)||0,known:!!x.known}))}:null,
   air:auto.air?{status:auto.air.status||'',ours:Number(auto.air.ours)||0,enemy:Number(auto.air.enemy)||0,depletedSlots:Number(auto.air.depletedSlots)||0}:null
  };
 }catch{return null}
}
function hdSSSnapshot(map){
 const fleet=hdSSFleet(map);if(!fleet)return null;
 const stats=hdSSStats(map,fleet),strategy=hdSSStrategy(fleet),gate=hdSSGate(map,fleet,stats),telemetry=hdSSTelemetry(map,fleet);
 return {
  id:hdSSUid(),map:map,startedAt:Date.now(),fleetId:fleet.id,fleetName:fleet.name||'名称なし',strategy:strategy,strategyLabel:hdSSStrategyLabel(fleet),
  fleetSnapshot:{id:fleet.id,name:fleet.name||'',strategy:strategy,strategyLabel:hdSSStrategyLabel(fleet),ships:JSON.parse(JSON.stringify(fleet.ships||[])),memo:fleet.memo||''},
  readinessSnapshot:{autoOk:stats.autoOk,autoTotal:stats.autoTotal,manualDone:stats.manualDone,manualTotal:stats.manualTotal,unresolved:(stats.unresolved||[]).map(function(x){return {label:x.label||'',state:x.state||'',detail:x.detail||''}}),gate:{state:gate.state,label:gate.label,detail:gate.detail,hardBlock:gate.hardBlock,actions:gate.actions.slice(0,8).map(x=>({id:x.id||'',action:x.action||'',detail:x.detail||''}))}},
  telemetrySnapshot:telemetry,
  shipCount:stats.shipCount,status:'active'
 };
}
function hdSSEmit(action,detail={}){try{window.dispatchEvent(new CustomEvent('hd:sortie-session-changed',{detail:{action,...detail}}))}catch{}}
function hdSSStart(map,options={}){
 if(hdSSLoad())return null;
 const fleet=hdSSFleet(map);if(!fleet)return null;
 const stats=hdSSStats(map,fleet),gate=hdSSGate(map,fleet,stats),force=!!options?.force;
 if(gate.hardBlock)return null;
 if(gate.state==='stop'&&!force)return null;
 const session=hdSSApplyObjectivePref(hdSSSnapshot(map),map);if(!session||!session.shipCount)return null;
 if(force&&session.readinessSnapshot?.gate)session.readinessSnapshot.gate.overridden=true;
 hdSSPostSave(null);hdSSSave(session);hdSSRender();hdSSEmit('start',{session,gate,forced:force});return session;
}
function hdSSClear(){const session=hdSSLoad();hdSSSave(null);hdSSRender();hdSSEmit('clear',{session});return true}
function hdSSDuration(ms){
 const m=Math.max(0,Math.floor((Number(ms)||0)/60000)),h=Math.floor(m/60),r=m%60;
 return h?h+'時間'+r+'分':m+'分';
}
function hdSSFinish(data){
 const session=hdSSLoad();if(!session||typeof hdSLRecordEntry!=='function')return null;
 const at=Date.now(),result=data&&data.result||'S',memoParts=[];
 if(session.strategyLabel)memoParts.push(session.strategyLabel);
 if(data&&String(data.memo||'').trim())memoParts.push(String(data.memo).trim());
 const entry=hdSLRecordEntry({
  map:session.map,node:data&&data.node||'',result:result,boss:!!(data&&data.boss),retreat:data&&data.retreat!=null?!!data.retreat:result==='撤退',
  battles:Math.max(0,Number(data&&data.battles)||0),drop:data&&data.drop||'',buckets:Math.max(0,Number(data&&data.buckets)||0),
  fuel:Math.max(0,Number(data&&data.fuel)||0),ammo:Math.max(0,Number(data&&data.ammo)||0),steel:Math.max(0,Number(data&&data.steel)||0),bauxite:Math.max(0,Number(data&&data.bauxite)||0),
  memo:memoParts.join('｜'),retreatReason:String(data&&data.retreatReason||''),objectiveTarget:String(data&&data.objectiveTarget||''),sessionId:session.id,fleetId:session.fleetId,fleetName:session.fleetName,strategy:session.strategy,strategyLabel:session.strategyLabel,
  startedAt:session.startedAt,durationMs:Math.max(0,at-session.startedAt),fleetSnapshot:session.fleetSnapshot,readinessSnapshot:session.readinessSnapshot,
  source:String(data&&data.source||''),gameSortieKey:String(data&&data.gameSortieKey||''),gameNodeNo:Number(data&&data.gameNodeNo)||0,gameNodeLabel:String(data&&data.gameNodeLabel||''),gameBossCellNo:Number(data&&data.gameBossCellNo)||0,gameBossCellLabel:String(data&&data.gameBossCellLabel||''),gameRouteNodes:Array.isArray(data&&data.gameRouteNodes)?data.gameRouteNodes:[],gameRouteLabels:Array.isArray(data&&data.gameRouteLabels)?data.gameRouteLabels:[],gameBattleResults:Array.isArray(data&&data.gameBattleResults)?data.gameBattleResults:[],
  huntId:String(data&&data.huntId||''),huntShip:String(data&&data.huntShip||''),targetObtained:!!(data&&data.targetObtained)
 });
 if(!entry)return null;
 hdSSPostSave({version:1,status:'awaiting-sync',sessionId:session.id,map:session.map,fleetId:session.fleetId,fleetName:session.fleetName,finishedAt:at,entryId:String(entry.id||''),fleetSnapshot:session.fleetSnapshot,startTelemetry:session.telemetrySnapshot||null});
 hdSSSave(null);try{if(typeof hdSPSRender==='function')hdSPSRender();if(typeof hdSLRender==='function')hdSLRender()}catch{}
 hdSSEmit('finish',{session,entry,postReview:hdSSPostLoad()});return entry;
}
function hdSSPostTryReview(sync){
 const post=hdSSPostLoad();if(!post||post.status!=='awaiting-sync')return post;
 const syncAt=Number(sync?.syncedAt)||(()=>{try{return Number(JSON.parse(localStorage.getItem('harbordesk-kancolle-sync-v1')||'null')?.syncedAt)||0}catch{return 0}})();
 if(!syncAt||syncAt<=Number(post.finishedAt||0))return post;
 const telemetry=hdSSTelemetry(post.map,post.fleetSnapshot);if(!telemetry)return post;
 const gate=telemetry.gate||{state:'hold',label:'要確認',detail:'帰還後判定を取得できない',actions:[]};
 const next={...post,status:'reviewed',reviewedAt:Date.now(),syncAt,review:{gate,live:telemetry.live,supply:telemetry.supply,air:telemetry.air}};
 hdSSPostSave(next);hdSSEmit('post-review',{postReview:next});return next;
}
function hdSSPostHtml(map){
 const post=hdSSPostLoad();if(!post)return '';
 const sameMap=!map||String(post.map||'')===String(map||''),title=sameMap?'前回出撃後':'前回 '+String(post.map||'')+' 出撃後';
 if(post.status==='awaiting-sync')return '<div class="hd-ss-post awaiting"><div><span>'+hdSSEsc(title)+'</span><strong>帰還後の再同期待ち</strong><small>艦状態・補給・艦載機損耗を更新すると、次の出撃可否を自動で再判定するよ。</small></div><div class="hd-ss-post-actions"><button type="button" class="primary small" data-hd-ss-post-sync>艦これ同期へ</button><button type="button" class="ghost small" data-hd-ss-post-clear>閉じる</button></div></div>';
 const review=post.review||{},gate=review.gate||{},state=gate.state||'hold',headline=state==='go'?'再出撃準備OK':state==='stop'?'連続出撃は修正必要':'再出撃前に確認',actions=(gate.actions||[]).slice(0,3);
 const meta=[];if(review.live)meta.push('艦状態 '+(review.live.blocked?('NG '+review.live.blocked+'隻'):review.live.caution?('注意 '+review.live.caution+'隻'):'OK'));if(review.supply)meta.push('補給 '+(review.supply.empty?('空 '+review.supply.empty+'隻'):review.supply.low?('不足 '+review.supply.low+'隻'):'OK'));if(review.air&&Number(review.air.depletedSlots)>0)meta.push('艦載機損耗 '+review.air.depletedSlots+'スロ');
 return '<div class="hd-ss-post '+hdSSEsc(state)+'"><div><span>'+hdSSEsc(title)+'</span><strong>'+hdSSEsc(headline)+'</strong><small>'+hdSSEsc(gate.detail||'帰還後の状態を再判定済み')+'</small>'+(meta.length?'<em>'+hdSSEsc(meta.join(' / '))+'</em>':'')+'</div>'+(actions.length?'<ul>'+actions.map(x=>'<li>'+hdSSEsc(x.action||x.detail||'確認')+'</li>').join('')+'</ul>':'')+'<div class="hd-ss-post-actions"><button type="button" class="ghost small" data-hd-ss-post-clear>確認済み</button></div></div>';
}
function hdSSSelectedSummary(map){
 const fleet=hdSSFleet(map);if(!fleet)return null;const stats=hdSSStats(map,fleet);
 return {fleet:fleet,stats:stats,strategyLabel:hdSSStrategyLabel(fleet)};
}
function hdSSIdleHtml(map){
 const row=hdSSSelectedSummary(map);
 if(!row)return '<section class="hd-ss"><div class="hd-ss-head"><div><div class="eyebrow">SORTIE SESSION</div><strong>実戦モード</strong><span>出撃編成を選ぶとセッションを開始できるよ。</span></div></div>'+hdSSPostHtml(map)+'</section>';
 const s=row.stats,gate=hdSSGate(map,row.fleet,s),manualReady=!s.manualTotal||s.manualDone===s.manualTotal,autoReady=!s.autoTotal||s.autoOk===s.autoTotal,ready=gate.state==='go'&&manualReady&&autoReady;
 const unresolved=(s.unresolved||[]).map(function(x){return x.label}).filter(Boolean).join('、'),next=gate.actions?.[0]?.action||'';
 const cls=gate.hardBlock||gate.state==='stop'?'stop':ready?'ready':'warn';
 let startButtons='';
 if(gate.hardBlock)startButtons='<button type="button" class="primary" disabled>安全確認が必要</button>';
 else if(gate.state==='stop')startButtons='<button type="button" class="primary" disabled>修正してから開始</button><button type="button" class="ghost small" data-hd-ss-start-override>それでも記録開始</button>';
 else startButtons='<button type="button" class="primary" data-hd-ss-start>'+(gate.state==='hold'?'要確認のまま出撃開始':'この編成で出撃開始')+'</button>';
 return '<section class="hd-ss '+cls+'"><div class="hd-ss-head"><div><div class="eyebrow">SORTIE SESSION</div><strong>実戦モード</strong><span>選択中の編成を固定して出撃記録へつなぐ</span></div><b>'+hdSSEsc(gate.label)+'</b></div>'+hdSSPostHtml(map)+'<div class="hd-ss-selected"><div><span>'+hdSSEsc(row.strategyLabel)+'</span><strong>'+hdSSEsc(row.fleet.name||'名称なし')+'</strong><small>'+s.shipCount+'隻</small></div><div class="hd-ss-readiness"><span>自動確認 <b>'+s.autoOk+'/'+s.autoTotal+'</b></span><span>手動確認 <b>'+s.manualDone+'/'+s.manualTotal+'</b></span></div></div><div class="hd-ss-gate '+hdSSEsc(gate.state)+'"><b>'+hdSSEsc(gate.detail)+'</b>'+(next?'<span>次: '+hdSSEsc(next)+'</span>':'')+'</div>'+(unresolved?'<p class="hd-ss-warning">要確認: '+hdSSEsc(unresolved)+'</p>':'')+'<div class="hd-ss-actions">'+startButtons+'<button type="button" class="ghost small" data-hd-ss-check>出撃前チェックを見る</button></div><p class="hd-ss-note">'+(gate.hardBlock?'大破・補給不足など安全上の修正が必要な間は、実戦セッションを開始しない。':gate.state==='stop'?'修正必要項目があるため通常開始は停止中。上書き開始は記録用途として明示的に選べる。':'開始時の編成・装備・判定状態をスナップショット保存する。')+'</p></section>';
}
function hdSSActiveHtml(session){
 const r=session.readinessSnapshot||{},unresolved=(r.unresolved||[]).map(function(x){return x.label}).filter(Boolean).join('、'),gate=r.gate||null,gateText=gate?(gate.label+(gate.overridden?'・上書き開始':'')):'';
 return '<section class="hd-ss active"><div class="hd-ss-head"><div><div class="eyebrow">SORTIE IN PROGRESS</div><strong>出撃中</strong><span>'+hdSSEsc(session.map)+'｜'+hdSSEsc(session.fleetName)+'</span></div><b>'+hdSSEsc(session.strategyLabel||'手動編成')+'</b></div><div class="hd-ss-active-meta">'+(gateText?'<span>開始判定 '+hdSSEsc(gateText)+'</span>':'')+'<span>開始 '+hdSSEsc(new Date(session.startedAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}))+'</span><span>自動 '+(r.autoOk||0)+'/'+(r.autoTotal||0)+'</span><span>手動 '+(r.manualDone||0)+'/'+(r.manualTotal||0)+'</span></div>'+(unresolved?'<p class="hd-ss-warning">開始時の要確認: '+hdSSEsc(unresolved)+'</p>':'')+'<div class="hd-ss-return"><div class="hd-ss-return-head"><strong>帰還結果</strong><span>手入力でもOK。帰還後に艦これ同期すると結果を自動取込</span></div><div class="hd-ss-form"><label>結果<select id="hdSSResult"><option>S</option><option>A</option><option>B</option><option>C</option><option>D</option><option>撤退</option></select></label><label>到達マス<input id="hdSSNode" placeholder="例 ボス / P"></label><label>戦闘数<input id="hdSSBattles" type="number" min="0" max="20" value="1"></label><label class="hd-ss-check"><input id="hdSSBoss" type="checkbox">ボス到達</label><label>ドロップ<input id="hdSSDrop" placeholder="艦名など"></label><label>バケツ<input id="hdSSBuckets" type="number" min="0" value="0"></label><label>燃料<input id="hdSSFuel" type="number" min="0" value="0"></label><label>弾薬<input id="hdSSAmmo" type="number" min="0" value="0"></label><label>鋼材<input id="hdSSSteel" type="number" min="0" value="0"></label><label>ボーキ<input id="hdSSBauxite" type="number" min="0" value="0"></label><label class="hd-ss-wide">メモ<input id="hdSSMemo" placeholder="撤退原因、装備変更など"></label></div><div class="hd-ss-actions"><button type="button" class="primary" data-hd-ss-finish>帰還結果を記録</button><button type="button" class="ghost small" data-hd-ss-cancel>このセッションを破棄</button></div></div><p class="hd-ss-note">出撃中に保存プリセットを切り替えても、このセッションは開始時の編成スナップショットを保持するよ。</p></section>';
}
function hdSSHtml(map){const active=hdSSLoad();return active?hdSSActiveHtml(active):hdSSIdleHtml(map)}
function hdSSRender(){
 const body=document.getElementById('hdSortiePreparationBody');if(!body)return;
 body.querySelector('.hd-ss')?.remove();const map=hdSSMap();if(!map&&!hdSSLoad())return;
 const overview=body.querySelector('.hd-sps-overview');if(!overview)return;
 const wrap=document.createElement('div');wrap.innerHTML=hdSSHtml(map);const sec=wrap.firstElementChild;if(sec)overview.insertAdjacentElement('afterend',sec);
}
function hdSSFormData(){
 const val=function(id){return document.getElementById(id)?.value||''},num=function(id){return Math.max(0,Number(val(id))||0)};
 return {result:val('hdSSResult')||'S',node:val('hdSSNode'),battles:num('hdSSBattles'),boss:!!document.getElementById('hdSSBoss')?.checked,drop:val('hdSSDrop'),buckets:num('hdSSBuckets'),fuel:num('hdSSFuel'),ammo:num('hdSSAmmo'),steel:num('hdSSSteel'),bauxite:num('hdSSBauxite'),memo:val('hdSSMemo')};
}
function hdSSInstall(){
 if(window.__hdSortieSessionInstalled||typeof hdSPSRender!=='function')return false;
 window.__hdSortieSessionInstalled=true;const prev=hdSPSRender;
 hdSPSRender=function(){const v=prev.apply(this,arguments);setTimeout(hdSSRender,0);return v};
 setTimeout(hdSSRender,0);return true;
}
window.hdSSLoad=hdSSLoad;
window.hdSSSave=hdSSSave;
window.hdSSPostLoad=hdSSPostLoad;
window.hdSSPostSave=hdSSPostSave;
window.hdSSPostTryReview=hdSSPostTryReview;
window.hdSSTelemetry=hdSSTelemetry;
window.hdSSMap=hdSSMap;
window.hdSSFleet=hdSSFleet;
window.hdSSStats=hdSSStats;
window.hdSSGate=hdSSGate;
window.hdSSSnapshot=hdSSSnapshot;
window.hdSSStart=hdSSStart;
window.hdSSClear=hdSSClear;
window.hdSSFinish=hdSSFinish;
window.hdSSDuration=hdSSDuration;
window.hdSSSelectedSummary=hdSSSelectedSummary;
window.hdSSRender=hdSSRender;
window.hdSSFormData=hdSSFormData;
window.hdSSInstall=hdSSInstall;

document.addEventListener('click',function(e){
 if(e.target.closest?.('[data-hd-ss-start]')){const session=hdSSStart(hdSSMap());if(session&&typeof window.hdSMOpen==='function')setTimeout(()=>window.hdSMOpen(),0);return}
 if(e.target.closest?.('[data-hd-ss-start-override]')){const session=hdSSStart(hdSSMap(),{force:true});if(session&&typeof window.hdSMOpen==='function')setTimeout(()=>window.hdSMOpen(),0);return}
 if(e.target.closest?.('[data-hd-ss-finish]')){hdSSFinish(hdSSFormData());return}
 if(e.target.closest?.('[data-hd-ss-cancel]')){hdSSClear();return}
 if(e.target.closest?.('[data-hd-ss-check]')){if(typeof hdSPSOpenMapTab==='function')hdSPSOpenMapTab('mine');return}
 if(e.target.closest?.('[data-hd-ss-post-sync]')){if(typeof hdWSShowElement==='function')hdWSShowElement('kancolleImport',true);else document.getElementById('kancolleImport')?.scrollIntoView({behavior:'smooth',block:'start'});return}
 if(e.target.closest?.('[data-hd-ss-post-clear]')){hdSSPostSave(null);hdSSRender();return}
});
window.addEventListener('storage',function(e){if([HD_SS_KEY,'harbordesk-custom-fleets-v1','harbordesk-sortie-selection-v1','harbordesk-sortie-readiness-v1'].includes(e.key))hdSSRender()});
window.addEventListener('hd:map-rendered',function(){setTimeout(hdSSRender,0)});
window.addEventListener('hd:kancolle-sync',function(e){hdSSPostTryReview(e?.detail);setTimeout(hdSSRender,0)});
window.addEventListener('load',function(){hdSSPostTryReview();setTimeout(function(){if(!hdSSInstall())setTimeout(hdSSInstall,500)},1000)});
hdSSInstall();
