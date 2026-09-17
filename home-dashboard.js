const HD_RECENT_MAPS_KEY='harbordesk-recent-maps-v1';

function homeEsc(s){return typeof esc==='function'?esc(s):String(s??'')}
function loadRecentMaps(){try{return JSON.parse(localStorage.getItem(HD_RECENT_MAPS_KEY))||[]}catch{return []}}
function saveRecentMap(map){if(!map)return;const rows=loadRecentMaps().filter(x=>x!==map);rows.unshift(map);localStorage.setItem(HD_RECENT_MAPS_KEY,JSON.stringify(rows.slice(0,6)))}

function ensureHomeDashboard(){
 const main=document.querySelector('main');
 const hero=document.querySelector('.hero');
 if(!main||!hero||document.getElementById('home'))return;
 const section=document.createElement('section');
 section.id='home';
 section.className='home-dashboard';
 section.innerHTML=`
  <div class="section-head"><div><div class="eyebrow">HOME</div><h2>今日の司令部</h2></div><span class="muted" id="homeUpdated"></span></div>
  <div id="homeSummary" class="home-summary"></div>
  <div class="home-grid">
   <article class="home-card"><div class="home-card-title"><strong>今日やること</strong><a href="#quests">任務へ</a></div><div id="homeTodo"></div></article>
   <article class="home-card"><div class="home-card-title"><strong>進行中タイマー</strong><a href="#expeditions">遠征へ</a></div><div id="homeTimers"></div></article>
  </div>
  <article class="home-card"><div class="home-card-title"><strong>資源</strong><a href="#resources">記録へ</a></div><div id="homeResources" class="home-resource-grid"></div></article>
  <article class="home-card"><div class="home-card-title"><strong>クイックアクセス</strong><span class="muted">1〜2タップで移動</span></div><div class="home-shortcuts">
    <a href="#guide">🗺️ 攻略</a><a href="#roster">⚓ 艦隊</a><a href="#equipmentBook">🧰 装備</a><a href="#eventLog">🎯 イベント</a><a href="#calculators">🧮 計算</a><a href="#backup">💾 保存</a>
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
 document.getElementById('homeSummary').innerHTML=`
   <div><span>未完了任務</span><strong>${todo.length}</strong></div>
   <div><span>稼働中</span><strong>${running.length}</strong></div>
   <div><span>艦娘</span><strong>${rosterCount}</strong></div>
   <div><span>装備</span><strong>${equipCount}</strong></div>
   <div><span>イベント記録</span><strong>${eventCount}</strong></div>`;
 document.getElementById('homeTodo').innerHTML=todo.length?todo.slice(0,5).map(q=>`<div class="home-row"><span>${homeEsc(q.name)}</span><small>未完了</small></div>`).join(''):'<div class="home-empty">未完了の任務はないよ</div>';
 document.getElementById('homeTimers').innerHTML=running.length?running.slice(0,5).map(t=>`<div class="home-row"><span><b>${t.kind}</b> ${homeEsc(t.name)}</span><small>${typeof fmt==='function'?fmt(t.endsAt-now):''}</small></div>`).join(''):'<div class="home-empty">動いているタイマーはないよ</div>';
 const res=[['燃料',resources.fuel],['弾薬',resources.ammo],['鋼材',resources.steel],['ボーキ',resources.bauxite]];
 document.getElementById('homeResources').innerHTML=res.map(([name,val])=>`<div><span>${name}</span><strong>${val!==''&&val!=null?Number(val).toLocaleString():'-'}</strong></div>`).join('');
 const recent=loadRecentMaps();
 document.getElementById('homeRecentMaps').innerHTML=recent.length?recent.map(m=>`<button class="recent-map-btn" data-home-map="${m}">${m}</button>`).join(''):'<div class="home-empty">海域を見るとここに履歴が出るよ</div>';
}

document.addEventListener('click',e=>{
 const mapButton=e.target.closest('[data-map]');
 if(mapButton?.dataset.map){saveRecentMap(mapButton.dataset.map);setTimeout(renderHomeDashboard,0)}
 const recent=e.target.closest('[data-home-map]');
 if(recent){const map=recent.dataset.homeMap;try{selectedWorld=map.split('-')[0];selectedMap=map;guideFilter='map';const q=document.getElementById('guideQuery');if(q)q.value=map;renderGuide();saveRecentMap(map);location.hash='guide';setTimeout(()=>document.getElementById('selectedMapCard')?.scrollIntoView({behavior:'smooth',block:'start'}),80)}catch{location.hash='guide'}}
});

window.addEventListener('storage',renderHomeDashboard);
setInterval(renderHomeDashboard,5000);
window.addEventListener('load',()=>setTimeout(renderHomeDashboard,300));
ensureHomeDashboard();
