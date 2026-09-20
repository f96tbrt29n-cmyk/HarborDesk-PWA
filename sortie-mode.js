const HD_SM_SESSION_KEY='harbordesk-active-sortie-session-v1';

function hdSMEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function hdSMSession(){try{return typeof window.hdSSLoad==='function'?window.hdSSLoad():JSON.parse(localStorage.getItem(HD_SM_SESSION_KEY)||'null')}catch{return null}}
function hdSMMap(){try{return typeof window.hdSSMap==='function'?window.hdSSMap():(typeof selectedMap!=='undefined'?selectedMap:'')}catch{return ''}}
function hdSMMapDetail(map){try{return typeof MAP_DETAILS!=='undefined'?(MAP_DETAILS[map]||{}):{}}catch{return {}}}
function hdSMGraph(map){try{return typeof HD_MAP_GRAPHS!=='undefined'?(HD_MAP_GRAPHS[map]||null):null}catch{return null}}
function hdSMNodeKind(graph,label){
 try{return graph&&typeof hdMapKind==='function'?hdMapKind(graph,label):(graph?.boss===label?'boss':graph?.goal===label?'goal':'normal')}catch{return 'normal'}
}
function hdSMNodeKindLabel(kind){return {boss:'ボス',goal:'到達',item:'資源',sub:'潜水',air:'航空',night:'夜戦',vortex:'渦潮',safe:'安全',normal:'通常'}[kind]||'通常'}
function hdSMNodeRows(map){
 const graph=hdSMGraph(map);if(!graph||!Array.isArray(graph.edges))return [];
 const starts=new Set(['S','S1','S2']),labels=[...new Set(graph.edges.flat())].filter(x=>!starts.has(x));
 let level={};try{if(typeof hdMapLevels==='function')level=hdMapLevels(graph).level||{}}catch{}
 return labels.sort((a,b)=>(Number(level[a]??999)-Number(level[b]??999))||String(a).localeCompare(String(b),undefined,{numeric:true}))
  .map(label=>({label,kind:hdSMNodeKind(graph,label)}));
}
function hdSMNextNodeRows(map,draft){
 const graph=hdSMGraph(map);if(!graph||!Array.isArray(graph.edges))return [];
 const current=String(draft?.node||'').trim();
 const from=current?[current]:[...new Set(graph.edges.map(x=>x[0]).filter(x=>x==='S'||x==='S1'||x==='S2'))];
 const labels=[...new Set(graph.edges.filter(([a])=>from.includes(a)).map(([,b])=>b))];
 return labels.map(label=>({label,kind:hdSMNodeKind(graph,label)}));
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
 return '<div class="hd-sm-idle"><div class="hd-sm-map"><span>選択海域</span><strong>'+hdSMEsc(map)+' '+hdSMEsc(d.name||'')+'</strong></div><div class="hd-sm-status '+(ready?'ready':'warn')+'"><div><span>'+hdSMEsc(row.strategyLabel||'手動編成')+'</span><strong>'+hdSMEsc(row.fleet&&row.fleet.name||'名称なし')+'</strong><small>'+(Number(s.shipCount)||0)+'隻</small></div><b>'+(ready?'出撃前確認済み':'未確認あり')+'</b></div>'+hdSMReadinessHtml({autoOk:s.autoOk,autoTotal:s.autoTotal,manualDone:s.manualDone,manualTotal:s.manualTotal,unresolved:s.unresolved})+'<div class="hd-sm-actions"><button type="button" class="primary" data-hd-sm-start>この編成で出撃開始</button><button type="button" class="ghost" data-hd-sm-prep>出撃準備表</button><button type="button" class="ghost" data-hd-sm-guide>海域攻略</button></div><p class="hd-sm-note">開始すると、その時点の艦隊・装備・確認状態を固定して出撃中画面へ切り替えるよ。</p></div>';
}
function hdSMDraft(session){
 const d=session&&session.draft&&typeof session.draft==='object'?session.draft:{};
 return {result:String(d.result||'S'),node:String(d.node||''),battles:Math.max(0,Number(d.battles)||1),boss:!!d.boss,drop:String(d.drop||''),buckets:Math.max(0,Number(d.buckets)||0),fuel:Math.max(0,Number(d.fuel)||0),ammo:Math.max(0,Number(d.ammo)||0),steel:Math.max(0,Number(d.steel)||0),bauxite:Math.max(0,Number(d.bauxite)||0),memo:String(d.memo||''),updatedAt:Math.max(0,Number(d.updatedAt)||0),routeNodes:Array.isArray(d.routeNodes)?d.routeNodes.map(String).filter(Boolean).slice(-40):[]};
}
function hdSMNodePickerHtml(session,draft){
 const rows=hdSMNodeRows(session?.map),route=draft?.routeNodes||[],current=String(draft?.node||''),next=hdSMNextNodeRows(session?.map,draft);
 if(!rows.length)return '';
 const nextTitle=current?'次に進める候補':'最初の進行候補';
 const nextHtml=next.length?'<div class="hd-sm-next-wrap"><div class="hd-sm-next-head"><b>'+nextTitle+'</b><small>海域構造上の接続候補。実際の分岐条件は攻略情報を優先。</small></div><div class="hd-sm-next-grid">'+next.map(function(x){return '<button type="button" class="hd-sm-next '+hdSMEsc(x.kind)+'" data-hd-sm-next-node="'+hdSMEsc(x.label)+'"><b>'+hdSMEsc(x.label)+'</b><small>'+hdSMEsc(hdSMNodeKindLabel(x.kind))+'</small><i>次へ</i></button>'}).join('')+'</div></div>':'<div class="hd-sm-next-done">'+(current?'このマスから先の接続候補は登録されていないよ。':'開始地点の候補を取得できないよ。')+'</div>';
 return '<div class="hd-sm-panel hd-sm-node-panel"><div class="hd-sm-panel-head"><strong>現在マス</strong><span>普段は「次に進める候補」だけタップでOK</span></div>'+nextHtml+
  '<details class="hd-sm-all-nodes"><summary>全マスから選ぶ</summary><div class="hd-sm-node-grid">'+
  rows.map(function(x){const active=x.label===current;return '<button type="button" class="hd-sm-node '+hdSMEsc(x.kind)+(active?' active':'')+'" data-hd-sm-node="'+hdSMEsc(x.label)+'" aria-pressed="'+(active?'true':'false')+'"><b>'+hdSMEsc(x.label)+'</b><small>'+hdSMEsc(hdSMNodeKindLabel(x.kind))+'</small></button>'}).join('')+
  '</div></details>'+(route.length?'<div class="hd-sm-route-trail"><div><span>通過</span><b>'+route.map(hdSMEsc).join(' → ')+'</b></div><button type="button" class="ghost small" data-hd-sm-route-undo>1つ戻す</button></div>':'<div class="hd-sm-route-empty">次候補を押すと、ここに通過履歴を残すよ。</div>')+'</div>';
}
function hdSMResultOptions(current){
 return ['S','A','B','C','D','撤退'].map(function(v){return '<option'+(current===v?' selected':'')+'>'+v+'</option>'}).join('');
}
function hdSMActiveHtml(session){
 const d=hdSMMapDetail(session.map),started=Number(session.startedAt)||Date.now(),draft=hdSMDraft(session);
 const draftStatus=draft.updatedAt?'保存 '+new Date(draft.updatedAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}):'入力は自動保存';
 return '<div class="hd-sm-active"><div class="hd-sm-command"><div><span>出撃中</span><strong>'+hdSMEsc(session.map)+' '+hdSMEsc(d.name||'')+'</strong><small>'+hdSMEsc(session.fleetName||'名称なし')+'｜'+hdSMEsc(session.strategyLabel||'手動編成')+'</small></div><div class="hd-sm-clock"><span>経過</span><b data-hd-sm-elapsed>'+hdSMElapsed(Date.now()-started)+'</b><small>'+hdSMEsc(new Date(started).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}))+'開始</small></div></div>'+
 hdSMReadinessHtml(session.readinessSnapshot||{})+
 hdSMNodePickerHtml(session,draft)+
 '<div class="hd-sm-panel"><div class="hd-sm-panel-head"><strong>開始時の艦隊</strong><span>出撃中にプリセットを変えてもここは固定</span></div>'+hdSMFleetHtml(session)+'</div>'+
 '<div class="hd-sm-panel"><div class="hd-sm-panel-head"><strong>出撃中ショートカット</strong><span>必要な情報だけすぐ開く</span></div><div class="hd-sm-shortcuts"><button type="button" data-hd-sm-action="map">マップ</button><button type="button" data-hd-sm-action="overview">攻略概要</button><button type="button" data-hd-sm-action="gear">装備</button><button type="button" data-hd-sm-action="prep">準備表</button><button type="button" data-hd-sm-action="log">出撃ログ</button></div></div>'+
 '<div class="hd-sm-panel hd-sm-return"><div class="hd-sm-panel-head"><strong>帰還結果</strong><span data-hd-sm-draft-status>'+hdSMEsc(draftStatus)+'</span></div><div class="hd-sm-form"><label>結果<select id="hdSMResult">'+hdSMResultOptions(draft.result)+'</select></label><label>到達マス<input id="hdSMNode" value="'+hdSMEsc(draft.node)+'" placeholder="例 ボス / P"></label><label>戦闘数<input id="hdSMBattles" type="number" min="0" max="20" value="'+draft.battles+'"></label><label class="check"><input id="hdSMBoss" type="checkbox"'+(draft.boss?' checked':'')+'>ボス到達</label><label>ドロップ<input id="hdSMDrop" value="'+hdSMEsc(draft.drop)+'" placeholder="艦名など"></label><label>バケツ<input id="hdSMBuckets" type="number" min="0" value="'+draft.buckets+'"></label><label class="wide">メモ<input id="hdSMMemo" value="'+hdSMEsc(draft.memo)+'" placeholder="撤退原因、装備変更など"></label></div><details class="hd-sm-cost"'+((draft.fuel||draft.ammo||draft.steel||draft.bauxite)?' open':'')+'><summary>資源消費も記録</summary><div><label>燃料<input id="hdSMFuel" type="number" min="0" value="'+draft.fuel+'"></label><label>弾薬<input id="hdSMAmmo" type="number" min="0" value="'+draft.ammo+'"></label><label>鋼材<input id="hdSMSteel" type="number" min="0" value="'+draft.steel+'"></label><label>ボーキ<input id="hdSMBauxite" type="number" min="0" value="'+draft.bauxite+'"></label></div></details><div class="hd-sm-finish-actions"><button type="button" class="primary" data-hd-sm-finish>帰還結果を記録</button><button type="button" class="ghost" data-hd-sm-cancel>セッションを破棄</button></div></div><p class="hd-sm-note">入力内容はこの出撃セッションへ自動保存。iPhoneで画面を離れたり再読み込みされても、同じセッションなら続きから入力できるよ。</p></div>';
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
let hdSMDraftTimer=0;
function hdSMSaveDraft(){
 const session=hdSMSession();if(!session||session.status!=='active'||!document.getElementById('hdSMResult'))return false;
 const prev=session.draft&&typeof session.draft==='object'?session.draft:{};
 const draft={...prev,...hdSMFormData(),routeNodes:Array.isArray(prev.routeNodes)?prev.routeNodes.map(String).filter(Boolean).slice(-40):[]};draft.updatedAt=Date.now();session.draft=draft;
 try{if(typeof window.hdSSSave==='function')window.hdSSSave(session);else localStorage.setItem(HD_SM_SESSION_KEY,JSON.stringify(session))}catch{return false}
 const status=document.querySelector('[data-hd-sm-draft-status]');if(status)status.textContent='保存 '+new Date(draft.updatedAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
 try{window.dispatchEvent(new CustomEvent('hd:sortie-draft-saved',{detail:{sessionId:session.id,draft}}))}catch{}
 return true;
}
function hdSMScheduleDraft(){clearTimeout(hdSMDraftTimer);hdSMDraftTimer=setTimeout(hdSMSaveDraft,180)}
function hdSMSetNode(label){
 label=String(label||'').trim();const session=hdSMSession();if(!label||!session||session.status!=='active')return false;
 const input=document.getElementById('hdSMNode'),boss=document.getElementById('hdSMBoss'),graph=hdSMGraph(session.map);
 if(input)input.value=label;if(boss)boss.checked=!!(graph&&graph.boss===label);
 const prev=session.draft&&typeof session.draft==='object'?session.draft:{},route=Array.isArray(prev.routeNodes)?prev.routeNodes.map(String).filter(Boolean).slice(-39):[];
 if(route[route.length-1]!==label)route.push(label);
 session.draft={...prev,...hdSMFormData(),node:label,boss:!!(graph&&graph.boss===label),routeNodes:route,updatedAt:Date.now()};
 try{if(typeof window.hdSSSave==='function')window.hdSSSave(session);else localStorage.setItem(HD_SM_SESSION_KEY,JSON.stringify(session))}catch{return false}
 try{window.dispatchEvent(new CustomEvent('hd:sortie-draft-saved',{detail:{sessionId:session.id,draft:session.draft}}))}catch{}
 hdSMRender();return true;
}
function hdSMUndoNode(){
 const session=hdSMSession();if(!session||session.status!=='active')return false;
 const prev=session.draft&&typeof session.draft==='object'?session.draft:{},route=Array.isArray(prev.routeNodes)?prev.routeNodes.map(String).filter(Boolean):[];
 if(!route.length)return false;route.pop();const node=route[route.length-1]||'',graph=hdSMGraph(session.map);
 session.draft={...prev,node,boss:!!(node&&graph&&graph.boss===node),routeNodes:route.slice(-40),updatedAt:Date.now()};
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
window.hdSMSetNode=hdSMSetNode;
window.hdSMUndoNode=hdSMUndoNode;
window.hdSMSaveDraft=hdSMSaveDraft;
window.hdSMScheduleDraft=hdSMScheduleDraft;
window.hdSMTick=hdSMTick;
window.hdSMAction=hdSMAction;
window.hdSMInstall=hdSMInstall;
