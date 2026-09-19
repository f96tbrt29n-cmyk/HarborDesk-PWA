const HD_RECENT_MAPS_KEY='harbordesk-recent-maps-v1';

function homeEsc(s){return typeof esc==='function'?esc(s):String(s??'')}
function loadRecentMaps(){try{return JSON.parse(localStorage.getItem(HD_RECENT_MAPS_KEY))||[]}catch{return []}}
function saveRecentMap(map){if(!map)return;const rows=loadRecentMaps().filter(x=>x!==map);rows.unshift(map);localStorage.setItem(HD_RECENT_MAPS_KEY,JSON.stringify(rows.slice(0,6)))}
function homeJson(key,fallback=null){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
function homeRelative(ts){
 const d=Math.max(0,Date.now()-Number(ts||0));
 if(!ts)return '未同期';
 if(d<60000)return 'たった今';
 if(d<3600000)return Math.floor(d/60000)+'分前';
 if(d<86400000)return Math.floor(d/3600000)+'時間前';
 return Math.floor(d/86400000)+'日前';
}
function homeSyncInfo(){
 const s=homeJson('harbordesk-kancolle-sync-v1',null);
 if(!s)return {sync:null,label:'未同期',state:'warn',age:Infinity};
 const age=Date.now()-Number(s.syncedAt||0);
 return {sync:s,label:homeRelative(s.syncedAt),state:age>21600000?'warn':'ok',age};
}

function ensureHomeDashboard(){
 const main=document.querySelector('main');
 const hero=document.querySelector('.hero');
 if(!main||!hero||document.getElementById('home'))return;
 const section=document.createElement('section');
 section.id='home';
 section.className='home-dashboard';
 section.innerHTML=`
  <div class="section-head"><div><div class="eyebrow">HOME</div><h2>今日の司令部</h2></div><span class="muted" id="homeUpdated"></span></div>
  <article id="homeGameSync" class="home-sync-card"></article>
  <div id="homeSummary" class="home-summary"></div>
  <div class="home-grid">
   <article class="home-card"><div class="home-card-title"><strong>今日やること</strong><a href="#quests">任務へ</a></div><div id="homeTodo"></div></article>
   <article class="home-card"><div class="home-card-title"><strong>進行中タイマー</strong><a href="#expeditions">遠征へ</a></div><div id="homeTimers"></div></article>
  </div>
  <article class="home-card"><div class="home-card-title"><strong>資源</strong><a href="#resources">記録へ</a></div><div id="homeResources" class="home-resource-grid"></div></article>
  <article class="home-card"><div class="home-card-title"><strong>次の装備調達</strong><button type="button" class="ghost small" data-home-procurement-open>調達リストへ</button></div><div id="homeProcurement"></div></article>
  <article class="home-card"><div class="home-card-title"><strong>クイックアクセス</strong><span class="muted">1〜2タップで移動</span></div><div class="home-shortcuts">
    <a href="#kancolleImport">🎮 ゲーム同期</a><a href="#guide">🗺️ 攻略</a><a href="#roster">⚓ 艦隊</a><a href="#equipmentBook">🧰 装備</a><a href="#quests">✅ 任務</a><a href="#expeditions">⏱️ 遠征</a>
  </div></article>
  <article class="home-card"><div class="home-card-title"><strong>最近見た海域</strong><span class="muted">タップで攻略を開く</span></div><div id="homeRecentMaps" class="home-recent-maps"></div></article>`;
 hero.insertAdjacentElement('afterend',section);
 renderHomeDashboard();
}

function renderHomeDashboard(){
 if(!document.getElementById('home'))return;
 const now=Date.now();
 let expeditions=[],docks=[],quests=[],resources={fuel:'',ammo:'',steel:'',bauxite:''};
 try{if(typeof state!=='undefined'){expeditions=state.expeditions||[];docks=state.docks||[];quests=state.quests||[];resources=state.resources||resources}}catch{}
 const running=[...expeditions.map(x=>({...x,kind:'遠征'})),...docks.map(x=>({...x,kind:'入渠'}))].filter(x=>x.endsAt>now).sort((a,b)=>a.endsAt-b.endsAt);
 const todo=quests.filter(x=>!x.done);
 let rosterCount=0,equipCount=0,eventCount=0;
 try{rosterCount=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]').length}catch{}
 try{equipCount=JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]').length}catch{}
 try{eventCount=JSON.parse(localStorage.getItem('harbordesk-events-v1')||'[]').length}catch{}
 document.getElementById('homeUpdated').textContent=new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
 const syncInfo=homeSyncInfo(),sync=syncInfo.sync;
 const syncHost=document.getElementById('homeGameSync');
 if(syncHost){
  syncHost.className='home-sync-card '+syncInfo.state;
  syncHost.innerHTML=sync?`<div class="home-sync-main"><div><span>ゲーム同期</span><strong>${homeEsc(syncInfo.label)}</strong><small>艦娘 ${Number(sync.ships)||0} / 装備 ${Number(sync.equipment)||0} / 艦隊 ${Number(sync.decks)||0}</small></div><button type="button" class="ghost small" data-home-jump="kancolleImport">同期画面へ</button></div>${syncInfo.state==='warn'?'<div class="home-sync-note">少し時間が空いてるよ。艦これを開いた時にもう一度同期すると最新状態になる。</div>':''}`:`<div class="home-sync-main"><div><span>ゲーム同期</span><strong>まだ同期してないよ</strong><small>艦娘・装備・資源・現在艦隊をまとめて取り込める</small></div><button type="button" class="primary small" data-home-jump="kancolleImport">同期する</button></div>`;
 }
 document.getElementById('homeSummary').innerHTML=`
   <button type="button" class="home-summary-item" data-home-jump="quests"><span>未完了任務</span><strong>${todo.length}</strong><small>任務へ</small></button>
   <button type="button" class="home-summary-item" data-home-jump="expeditions"><span>稼働中</span><strong>${running.length}</strong><small>タイマーへ</small></button>
   <button type="button" class="home-summary-item" data-home-jump="roster"><span>艦娘</span><strong>${rosterCount}</strong><small>艦隊へ</small></button>
   <button type="button" class="home-summary-item" data-home-jump="equipmentBook"><span>装備</span><strong>${equipCount}</strong><small>装備へ</small></button>
   <button type="button" class="home-summary-item" data-home-jump="kancolleImport"><span>最終同期</span><strong class="home-sync-age">${homeEsc(syncInfo.label)}</strong><small>更新</small></button>`;
 document.getElementById('homeTodo').innerHTML=todo.length?todo.slice(0,5).map(q=>`<div class="home-row"><span>${homeEsc(q.name)}</span><small>未完了</small></div>`).join(''):'<div class="home-empty">未完了の任務はないよ</div>';
 document.getElementById('homeTimers').innerHTML=running.length?running.slice(0,5).map(t=>`<div class="home-row"><span><b>${t.kind}</b> ${homeEsc(t.name)}</span><small>${typeof fmt==='function'?fmt(t.endsAt-now):''}</small></div>`).join(''):'<div class="home-empty">動いているタイマーはないよ</div>';
 const res=[['燃料',resources.fuel],['弾薬',resources.ammo],['鋼材',resources.steel],['ボーキ',resources.bauxite]];
 document.getElementById('homeResources').innerHTML=res.map(([name,val])=>`<div><span>${name}</span><strong>${val!==''&&val!=null?Number(val).toLocaleString():'-'}</strong></div>`).join('');
 const procurement=document.getElementById('homeProcurement');
 if(procurement){
  let html='<div class="home-empty">不足装備を調達リストへ追加すると、次に揃える装備がここに出るよ</div>';
  if(typeof hdPLPriorityRows==='function'&&typeof hdPLNextActionMeta==='function'){
   const row=hdPLPriorityRows(undefined,1)?.[0],action=row?hdPLNextActionMeta(row):null;
   if(row&&action)html=`<div class="home-procurement-next"><div><small>${homeEsc(action.label)}</small><strong>${homeEsc(action.title||row.target||row.wanted)}</strong><span>${homeEsc(action.sub||'')}</span></div><b>あと ${Number(row.shortfall)||0}</b></div><p class="home-procurement-reason">${(row.priority?.reasons||[]).map(homeEsc).join('・')}</p>`;
  }
  procurement.innerHTML=html;
 }
 const recent=loadRecentMaps();
 document.getElementById('homeRecentMaps').innerHTML=recent.length?recent.map(m=>`<button class="recent-map-btn" data-home-map="${m}">${m}</button>`).join(''):'<div class="home-empty">海域を見るとここに履歴が出るよ</div>';
}

document.addEventListener('click',e=>{
 const jump=e.target.closest('[data-home-jump]');
 if(jump){
  const id=jump.dataset.homeJump;
  if(typeof hdWSShowElement==='function')hdWSShowElement(id,true);
  else{const target=document.getElementById(id);if(target)target.scrollIntoView({behavior:'smooth',block:'start'});else location.hash=id}
  return;
 }
 const mapButton=e.target.closest('[data-map]');
 if(mapButton?.dataset.map){saveRecentMap(mapButton.dataset.map);setTimeout(renderHomeDashboard,0)}
 const recent=e.target.closest('[data-home-map]');
 if(recent){const map=recent.dataset.homeMap;try{selectedWorld=map.split('-')[0];selectedMap=map;guideFilter='map';const q=document.getElementById('guideQuery');if(q)q.value=map;renderGuide();saveRecentMap(map);if(typeof hdWSShowElement==='function')hdWSShowElement('guide',false);else location.hash='guide';setTimeout(()=>document.getElementById('selectedMapCard')?.scrollIntoView({behavior:'smooth',block:'start'}),80)}catch{location.hash='guide'}}
 if(e.target.closest('[data-home-procurement-open]')){if(typeof hdPLOpenList==='function')hdPLOpenList();else location.hash='equipmentBook'}
});

window.addEventListener('storage',renderHomeDashboard);
window.addEventListener('hd:modules-ready',renderHomeDashboard);
window.addEventListener('hd:equipment-changed',renderHomeDashboard);
window.addEventListener('hd:procurement-changed',renderHomeDashboard);
window.addEventListener('hd:kancolle-sync',renderHomeDashboard);
window.addEventListener('hd:workspace-refresh',renderHomeDashboard);
setInterval(renderHomeDashboard,5000);
window.addEventListener('load',()=>setTimeout(renderHomeDashboard,300));
ensureHomeDashboard();
