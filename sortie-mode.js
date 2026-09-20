const HD_SM_SESSION_KEY='harbordesk-active-sortie-session-v1';

function hdSMEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function hdSMSession(){try{return typeof window.hdSSLoad==='function'?window.hdSSLoad():JSON.parse(localStorage.getItem(HD_SM_SESSION_KEY)||'null')}catch{return null}}
function hdSMMap(){try{return typeof window.hdSSMap==='function'?window.hdSSMap():(typeof selectedMap!=='undefined'?selectedMap:'')}catch{return ''}}
function hdSMMapDetail(map){try{return typeof MAP_DETAILS!=='undefined'?(MAP_DETAILS[map]||{}):{}}catch{return {}}}
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
 return '<div class="hd-sm-idle"><div class="hd-sm-map"><span>選択海域</span><strong>'+hdSMEsc(map)+' '+hdSMEsc(d.name||'')+'</strong></div><div class="hd-sm-status '+(ready?'ready':'warn')+'"><div><span>'+hdSMEsc(row.strategyLabel||'手動編成')+'</span><strong>'+hdSMEsc(row.fleet&&row.fleet.name||'名称なし')+'</strong><small>'+(Number(s.shipCount)||0)+'隻</small></div><b>'+(ready?'出撃前確認済み':'未確認あり')+'</b></div>'+hdSMReadinessHtml({autoOk:s.autoOk,autoTotal:s.autoTotal,manualDone:s.manualDone,manualTotal:s.manualTotal,unresolved:s.unresolved})+'<div class="hd-sm-actions"><button type="button" class="primary" data-hd-sm-start>この編成で出撃開始</button><button type="button" class="ghost" data-hd-sm-prep>出撃準備表</button><button type="button" class="ghost" data-hd-sm-guide>海域攻略</button></div><p class="hd-sm-note">開始すると、その時点の艦隊・装備・確認状態を固定して出撃中画面へ切り替えるよ。</p></div>';
}
function hdSMActiveHtml(session){
 const d=hdSMMapDetail(session.map),started=Number(session.startedAt)||Date.now();
 return '<div class="hd-sm-active"><div class="hd-sm-command"><div><span>出撃中</span><strong>'+hdSMEsc(session.map)+' '+hdSMEsc(d.name||'')+'</strong><small>'+hdSMEsc(session.fleetName||'名称なし')+'｜'+hdSMEsc(session.strategyLabel||'手動編成')+'</small></div><div class="hd-sm-clock"><span>経過</span><b data-hd-sm-elapsed>'+hdSMElapsed(Date.now()-started)+'</b><small>'+hdSMEsc(new Date(started).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}))+'開始</small></div></div>'+
 hdSMReadinessHtml(session.readinessSnapshot||{})+
 '<div class="hd-sm-panel"><div class="hd-sm-panel-head"><strong>開始時の艦隊</strong><span>出撃中にプリセットを変えてもここは固定</span></div>'+hdSMFleetHtml(session)+'</div>'+
 '<div class="hd-sm-panel"><div class="hd-sm-panel-head"><strong>出撃中ショートカット</strong><span>必要な情報だけすぐ開く</span></div><div class="hd-sm-shortcuts"><button type="button" data-hd-sm-action="map">マップ</button><button type="button" data-hd-sm-action="overview">攻略概要</button><button type="button" data-hd-sm-action="gear">装備</button><button type="button" data-hd-sm-action="prep">準備表</button><button type="button" data-hd-sm-action="log">出撃ログ</button></div></div>'+
 '<div class="hd-sm-panel hd-sm-return"><div class="hd-sm-panel-head"><strong>帰還結果</strong><span>記録すると出撃ログ・任務連動へ反映</span></div><div class="hd-sm-form"><label>結果<select id="hdSMResult"><option>S</option><option>A</option><option>B</option><option>C</option><option>D</option><option>撤退</option></select></label><label>到達マス<input id="hdSMNode" placeholder="例 ボス / P"></label><label>戦闘数<input id="hdSMBattles" type="number" min="0" max="20" value="1"></label><label class="check"><input id="hdSMBoss" type="checkbox">ボス到達</label><label>ドロップ<input id="hdSMDrop" placeholder="艦名など"></label><label>バケツ<input id="hdSMBuckets" type="number" min="0" value="0"></label><label class="wide">メモ<input id="hdSMMemo" placeholder="撤退原因、装備変更など"></label></div><details class="hd-sm-cost"><summary>資源消費も記録</summary><div><label>燃料<input id="hdSMFuel" type="number" min="0" value="0"></label><label>弾薬<input id="hdSMAmmo" type="number" min="0" value="0"></label><label>鋼材<input id="hdSMSteel" type="number" min="0" value="0"></label><label>ボーキ<input id="hdSMBauxite" type="number" min="0" value="0"></label></div></details><div class="hd-sm-finish-actions"><button type="button" class="primary" data-hd-sm-finish>帰還結果を記録</button><button type="button" class="ghost" data-hd-sm-cancel>セッションを破棄</button></div></div><p class="hd-sm-note">耐久・疲労・補給状態はゲーム画面が正。HarborDeskは出撃判断と記録の補助として使ってね。</p></div>';
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
 return {result:document.getElementById('hdSMResult')?.value||'S',node:document.getElementById('hdSMNode')?.value||'',battles:hdSMNum('hdSMBattles'),boss:!!document.getElementById('hdSMBoss')?.checked,drop:document.getElementById('hdSMDrop')?.value||'',buckets:hdSMNum('hdSMBuckets'),fuel:hdSMNum('hdSMFuel'),ammo:hdSMNum('hdSMAmmo'),steel:hdSMNum('hdSMSteel'),bauxite:hdSMNum('hdSMBauxite'),memo:document.getElementById('hdSMMemo')?.value||''};
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
function hdSMInstall(){hdSMEnsure();hdSMRender();return true}

document.addEventListener('click',function(e){
 if(e.target.closest?.('[data-hd-sm-start]')){const session=typeof window.hdSSStart==='function'?window.hdSSStart(hdSMMap()):null;if(session){hdSMRender();hdSMOpen()}else window.hdToast?.('出撃編成を選んでから開始してね','warn',1800);return}
 if(e.target.closest?.('[data-hd-sm-prep]')){hdSMAction('prep');return}
 if(e.target.closest?.('[data-hd-sm-guide]')){if(typeof window.hdWSShowElement==='function')window.hdWSShowElement('guide',true);return}
 const action=e.target.closest?.('[data-hd-sm-action]');if(action){hdSMAction(action.dataset.hdSmAction);return}
 if(e.target.closest?.('[data-hd-sm-finish]')){const entry=typeof window.hdSSFinish==='function'?window.hdSSFinish(hdSMFormData()):null;if(entry){window.hdToast?.('帰還結果を記録したよ','info',1600);hdSMRender()}return}
 if(e.target.closest?.('[data-hd-sm-cancel]')){if(confirm('この出撃セッションを記録せず破棄する？')){window.hdSSClear?.();hdSMRender()}return}
});
window.addEventListener('hd:sortie-session-changed',function(){hdSMRender()});
window.addEventListener('hd:map-rendered',function(){if(!hdSMSession())hdSMRender()});
window.addEventListener('storage',function(e){if(!e||e.key===HD_SM_SESSION_KEY)hdSMRender()});
window.addEventListener('hd:modules-ready',function(){setTimeout(hdSMInstall,0)});
window.addEventListener('load',function(){setTimeout(hdSMInstall,1100)});
setInterval(hdSMTick,1000);
setTimeout(hdSMInstall,1700);

window.hdSMEnsure=hdSMEnsure;
window.hdSMRender=hdSMRender;
window.hdSMOpen=hdSMOpen;
window.hdSMFormData=hdSMFormData;
window.hdSMTick=hdSMTick;
window.hdSMAction=hdSMAction;
window.hdSMInstall=hdSMInstall;
