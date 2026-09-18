const HD_SS_KEY='harbordesk-active-sortie-session-v1';

function hdSSEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function hdSSLoad(){try{return JSON.parse(localStorage.getItem(HD_SS_KEY)||'null')}catch{return null}}
function hdSSSave(v){if(v)localStorage.setItem(HD_SS_KEY,JSON.stringify(v));else localStorage.removeItem(HD_SS_KEY)}
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
function hdSSSnapshot(map){
 const fleet=hdSSFleet(map);if(!fleet)return null;
 const stats=hdSSStats(map,fleet),strategy=hdSSStrategy(fleet);
 return {
  id:hdSSUid(),map:map,startedAt:Date.now(),fleetId:fleet.id,fleetName:fleet.name||'名称なし',strategy:strategy,strategyLabel:hdSSStrategyLabel(fleet),
  fleetSnapshot:{id:fleet.id,name:fleet.name||'',strategy:strategy,strategyLabel:hdSSStrategyLabel(fleet),ships:JSON.parse(JSON.stringify(fleet.ships||[])),memo:fleet.memo||''},
  readinessSnapshot:{autoOk:stats.autoOk,autoTotal:stats.autoTotal,manualDone:stats.manualDone,manualTotal:stats.manualTotal,unresolved:(stats.unresolved||[]).map(function(x){return {label:x.label||'',state:x.state||'',detail:x.detail||''}})},
  shipCount:stats.shipCount,status:'active'
 };
}
function hdSSStart(map){
 if(hdSSLoad())return null;
 const session=hdSSSnapshot(map);if(!session||!session.shipCount)return null;
 hdSSSave(session);hdSSRender();return session;
}
function hdSSClear(){hdSSSave(null);hdSSRender()}
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
  map:session.map,node:data&&data.node||'',result:result,boss:!!(data&&data.boss),retreat:result==='撤退',
  battles:Math.max(0,Number(data&&data.battles)||0),drop:data&&data.drop||'',buckets:Math.max(0,Number(data&&data.buckets)||0),
  fuel:Math.max(0,Number(data&&data.fuel)||0),ammo:Math.max(0,Number(data&&data.ammo)||0),steel:Math.max(0,Number(data&&data.steel)||0),bauxite:Math.max(0,Number(data&&data.bauxite)||0),
  memo:memoParts.join('｜'),sessionId:session.id,fleetId:session.fleetId,fleetName:session.fleetName,strategy:session.strategy,strategyLabel:session.strategyLabel,
  startedAt:session.startedAt,durationMs:Math.max(0,at-session.startedAt),fleetSnapshot:session.fleetSnapshot,readinessSnapshot:session.readinessSnapshot
 });
 if(!entry)return null;
 hdSSSave(null);try{if(typeof hdSPSRender==='function')hdSPSRender();if(typeof hdSLRender==='function')hdSLRender()}catch{}
 return entry;
}
function hdSSSelectedSummary(map){
 const fleet=hdSSFleet(map);if(!fleet)return null;const stats=hdSSStats(map,fleet);
 return {fleet:fleet,stats:stats,strategyLabel:hdSSStrategyLabel(fleet)};
}
function hdSSIdleHtml(map){
 const row=hdSSSelectedSummary(map);
 if(!row)return '<section class="hd-ss"><div class="hd-ss-head"><div><div class="eyebrow">SORTIE SESSION</div><strong>実戦モード</strong><span>出撃編成を選ぶとセッションを開始できるよ。</span></div></div></section>';
 const s=row.stats,manualReady=!s.manualTotal||s.manualDone===s.manualTotal,autoReady=!s.autoTotal||s.autoOk===s.autoTotal,ready=manualReady&&autoReady;
 const unresolved=(s.unresolved||[]).map(function(x){return x.label}).filter(Boolean).join('、');
 return '<section class="hd-ss '+(ready?'ready':'warn')+'"><div class="hd-ss-head"><div><div class="eyebrow">SORTIE SESSION</div><strong>実戦モード</strong><span>選択中の編成を固定して出撃記録へつなぐ</span></div><b>'+(ready?'確認済み':'未確認あり')+'</b></div><div class="hd-ss-selected"><div><span>'+hdSSEsc(row.strategyLabel)+'</span><strong>'+hdSSEsc(row.fleet.name||'名称なし')+'</strong><small>'+s.shipCount+'隻</small></div><div class="hd-ss-readiness"><span>自動確認 <b>'+s.autoOk+'/'+s.autoTotal+'</b></span><span>手動確認 <b>'+s.manualDone+'/'+s.manualTotal+'</b></span></div></div>'+(unresolved?'<p class="hd-ss-warning">要確認: '+hdSSEsc(unresolved)+'</p>':'')+'<div class="hd-ss-actions"><button type="button" class="primary" data-hd-ss-start>この編成で出撃開始</button><button type="button" class="ghost small" data-hd-ss-check>出撃前チェックを見る</button></div><p class="hd-ss-note">開始時の編成・装備・確認状態をスナップショット保存。未確認が残っていても開始できるけど、ゲーム画面で最終確認してね。</p></section>';
}
function hdSSActiveHtml(session){
 const r=session.readinessSnapshot||{},unresolved=(r.unresolved||[]).map(function(x){return x.label}).filter(Boolean).join('、');
 return '<section class="hd-ss active"><div class="hd-ss-head"><div><div class="eyebrow">SORTIE IN PROGRESS</div><strong>出撃中</strong><span>'+hdSSEsc(session.map)+'｜'+hdSSEsc(session.fleetName)+'</span></div><b>'+hdSSEsc(session.strategyLabel||'手動編成')+'</b></div><div class="hd-ss-active-meta"><span>開始 '+hdSSEsc(new Date(session.startedAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}))+'</span><span>自動 '+(r.autoOk||0)+'/'+(r.autoTotal||0)+'</span><span>手動 '+(r.manualDone||0)+'/'+(r.manualTotal||0)+'</span></div>'+(unresolved?'<p class="hd-ss-warning">開始時の要確認: '+hdSSEsc(unresolved)+'</p>':'')+'<div class="hd-ss-return"><div class="hd-ss-return-head"><strong>帰還結果</strong><span>記録すると既存の出撃ログ・任務連動へ反映</span></div><div class="hd-ss-form"><label>結果<select id="hdSSResult"><option>S</option><option>A</option><option>B</option><option>C</option><option>D</option><option>撤退</option></select></label><label>到達マス<input id="hdSSNode" placeholder="例 ボス / P"></label><label>戦闘数<input id="hdSSBattles" type="number" min="0" max="20" value="1"></label><label class="hd-ss-check"><input id="hdSSBoss" type="checkbox">ボス到達</label><label>ドロップ<input id="hdSSDrop" placeholder="艦名など"></label><label>バケツ<input id="hdSSBuckets" type="number" min="0" value="0"></label><label>燃料<input id="hdSSFuel" type="number" min="0" value="0"></label><label>弾薬<input id="hdSSAmmo" type="number" min="0" value="0"></label><label>鋼材<input id="hdSSSteel" type="number" min="0" value="0"></label><label>ボーキ<input id="hdSSBauxite" type="number" min="0" value="0"></label><label class="hd-ss-wide">メモ<input id="hdSSMemo" placeholder="撤退原因、装備変更など"></label></div><div class="hd-ss-actions"><button type="button" class="primary" data-hd-ss-finish>帰還結果を記録</button><button type="button" class="ghost small" data-hd-ss-cancel>このセッションを破棄</button></div></div><p class="hd-ss-note">出撃中に保存プリセットを切り替えても、このセッションは開始時の編成スナップショットを保持するよ。</p></section>';
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
document.addEventListener('click',function(e){
 if(e.target.closest?.('[data-hd-ss-start]')){hdSSStart(hdSSMap());return}
 if(e.target.closest?.('[data-hd-ss-finish]')){hdSSFinish(hdSSFormData());return}
 if(e.target.closest?.('[data-hd-ss-cancel]')){hdSSClear();return}
 if(e.target.closest?.('[data-hd-ss-check]')){if(typeof hdSPSOpenMapTab==='function')hdSPSOpenMapTab('mine');return}
});
window.addEventListener('storage',function(e){if([HD_SS_KEY,'harbordesk-custom-fleets-v1','harbordesk-sortie-selection-v1','harbordesk-sortie-readiness-v1'].includes(e.key))hdSSRender()});
window.addEventListener('hd:map-rendered',function(){setTimeout(hdSSRender,0)});
window.addEventListener('load',function(){setTimeout(function(){if(!hdSSInstall())setTimeout(hdSSInstall,500)},1000)});
hdSSInstall();
