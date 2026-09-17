const KEY='harbordesk-pwa-v1';
const FAV_KEY='harbordesk-guide-favs-v1';
const state=load();
let timerKind='expedition';
let notified=new Set();
let guideFilter='all';
let selectedWorld='1';
let selectedMap='';
const guideFavs=new Set(JSON.parse(localStorage.getItem(FAV_KEY)||'[]'));

const MAPS={
 '1':['1-1','1-2','1-3','1-4','1-5','1-6'],
 '2':['2-1','2-2','2-3','2-4','2-5'],
 '3':['3-1','3-2','3-3','3-4','3-5'],
 '4':['4-1','4-2','4-3','4-4','4-5'],
 '5':['5-1','5-2','5-3','5-4','5-5'],
 '6':['6-1','6-2','6-3','6-4','6-5'],
 '7':['7-1','7-2','7-3','7-4','7-5']
};
const WORLD_NAMES={'1':'鎮守府海域','2':'南西諸島海域','3':'北方海域','4':'西方海域','5':'南方海域','6':'中部海域','7':'南西海域'};

const MAP_DETAILS={
 '3-2':{
  name:'キス島撤退作戦',
  overview:'駆逐艦主体の特殊な海域。ボス到達には艦種条件が厳しく、基本は6隻編成で挑む。',
  formation:'軽巡1＋駆逐5、または駆逐6が基本候補。駆逐4を必須とするボス到達編成もある。',
  route:'代表例は CEFL / CGFL。G経由ではうずしおがあり、高速統一＋電探搭載艦がいる場合はF/H分岐。',
  air:'通常攻略では制空より、道中突破・電探・速度条件を優先。',
  caution:'Hマスの戦艦ル級eliteなどで大破撤退が起きやすい。Gうずしお対策として複数艦への電探搭載も有効。',
  sourceDate:'攻略Wiki 最終更新 2026-08-12'
 },
 '5-5':{
  name:'第二次サーモン海戦',
  overview:'高難度のExtra Operation。ボス旗艦撃沈でゲージが20%減少し、5回撃沈でクリア。',
  formation:'編成は目的・ルート・任務条件で大きく変わるため、重量編成や中央/下ルート系などから手持ちに合わせて選ぶ。',
  route:'複数の実用ルートがあり、任務条件やゲージ破壊前後で最適解が変わる。',
  air:'空母を使う編成では制空調整が重要。ボス編成やゲージ状態により要求が変化するため、出撃前に最新値を確認。',
  caution:'道中・ボスとも強力。必要に応じて道中支援/決戦支援、キラ付け、装備調整を検討。',
  sourceDate:'攻略Wiki 最終更新 2026-09-06'
 },
 '6-5':{
  name:'空母機動部隊迎撃戦',
  overview:'基地航空隊と協同するExtra Operation。ボス旗艦撃沈でゲージが1/6減少し、6回撃沈でクリア。',
  formation:'上ルート・下ルートなど複数の攻略形があり、基地航空隊と本隊の役割分担が重要。',
  route:'出撃には6-4クリアに加え、基地航空隊の開放が必要。',
  air:'敵航空戦力が強いため、本隊制空と基地航空隊の配分を合わせて調整する。',
  caution:'ボスは連合艦隊12隻。夜戦で主力艦隊を狙うためにも護衛部隊を昼戦までに減らす意識が重要。',
  sourceDate:'攻略Wiki 最終更新 2026-09-05'
 },
 '7-5':{
  name:'スラバヤ沖海戦・バタビア沖海戦',
  overview:'複数ゲージ＋ギミック式の海域。第1→ギミック→第2→第3ゲージと段階的に進む。',
  formation:'ゲージごとに敵性質が違うため、同じ編成を使い続けるより段階ごとに組み替える前提で考える。',
  route:'第1ゲージ破壊後にL〜Qが出現。MマスS勝利1回で第三ゲージ出現ギミックを進める。',
  air:'段階により航空戦・対地の比重が変わるため、選択中のゲージに合わせて装備を変更。',
  caution:'第2ゲージ旗艦は陸上型。対地装備を忘れず、現在どのゲージを攻略中か確認して出撃する。',
  sourceDate:'攻略Wiki 2026-09-17参照'
 }
};

const GUIDE=[
{id:'maps',type:'map',title:'通常海域 攻略入口',subtitle:'海域',summary:'通常海域の攻略情報を確認。上の海域セレクタから個別海域を選択できる。',keywords:'海域 1-1 2-4 3-2 5-5 6-5 7-5 攻略',url:'https://wikiwiki.jp/kancolle/'},
{id:'early',type:'map',title:'序盤海域攻略指南',subtitle:'初心者向け',summary:'序盤の進め方、遠征開放、任務消化などをまとめて確認。',keywords:'序盤 初心者 海域 遠征 任務',url:'https://wikiwiki.jp/kancolle/%E5%BA%8F%E7%9B%A4%E6%B5%B7%E5%9F%9F%E6%94%BB%E7%95%A5%E6%8C%87%E5%8D%97'},
{id:'exp-main',type:'expedition',title:'遠征 総合ガイド',subtitle:'遠征',summary:'遠征の概要、開放条件、海域別一覧への入口。',keywords:'遠征 資源 燃料 弾薬 鋼材 ボーキ 開放',url:'https://wikiwiki.jp/kancolle/%E9%81%A0%E5%BE%81'},
{id:'exp-detail',type:'expedition',title:'遠征 詳細一覧表',subtitle:'時間・条件・報酬',summary:'遠征時間、必要編成、必要Lv、消費、獲得資源などを一覧で確認。',keywords:'遠征 時間 編成 報酬 大成功 旗艦 レベル',url:'https://wikiwiki.jp/kancolle/%E9%81%A0%E5%BE%81/%E8%A9%B3%E7%B4%B0%E4%B8%80%E8%A6%A7%E8%A1%A8'},
{id:'exp-05',type:'expedition',title:'05 海上護衛任務',subtitle:'鎮守府海域',summary:'資源回収でよく参照される遠征。詳細条件と報酬は一覧表から確認。',keywords:'05 海上護衛任務 燃料 弾薬 資源',url:'https://wikiwiki.jp/kancolle/%E9%81%A0%E5%BE%81/%E8%A9%B3%E7%B4%B0%E4%B8%80%E8%A6%A7%E8%A1%A8'},
{id:'quest-exp',type:'quest',title:'遠征任務一覧',subtitle:'任務',summary:'単発・デイリー・ウィークリー・マンスリーなどの遠征任務を確認。',keywords:'任務 遠征 デイリー ウィークリー マンスリー クォータリー イヤーリー',url:'https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99/%E9%81%A0%E5%BE%81%E4%BB%BB%E5%8B%99'},
{id:'quest-main',type:'quest',title:'任務 攻略入口',subtitle:'任務',summary:'任務の条件、前提任務、報酬を探す入口。',keywords:'任務 デイリー ウィークリー マンスリー 単発 あ号 ろ号',url:'https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99'}
];
const guideLabels={all:'すべて',map:'海域',quest:'任務',expedition:'遠征',fav:'★ お気に入り'};

function load(){try{return JSON.parse(localStorage.getItem(KEY))||blankState()}catch{return blankState()}}
function blankState(){return{expeditions:[],docks:[],quests:[],resources:{fuel:'',ammo:'',steel:'',bauxite:'',savedAt:null}}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s){return String(s).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]||c))}
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2)}
function fmt(ms){if(ms<=0)return '完了';const sec=Math.ceil(ms/1000),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return h>0?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`}
function wikiMapUrl(map){const world=map.split('-')[0];return `https://wikiwiki.jp/kancolle/${encodeURIComponent(WORLD_NAMES[world])}/${map}`}

function renderMapPicker(){
 document.getElementById('worldPicker').innerHTML=Object.keys(MAPS).map(w=>`<button class="world-chip ${selectedWorld===w?'active':''}" data-world="${w}">${w}海域</button>`).join('');
 document.getElementById('mapPicker').innerHTML=MAPS[selectedWorld].map(m=>`<button class="map-button ${selectedMap===m?'active':''}" data-map="${m}">${m}</button>`).join('');
 const card=document.getElementById('selectedMapCard');
 if(!selectedMap){card.innerHTML='<div class="empty">海域を選ぶとここに攻略情報が出るよ</div>';return}
 const d=MAP_DETAILS[selectedMap];
 if(!d){
  card.innerHTML=`<article class="guide-card selected"><div class="guide-card-top"><div><span class="guide-tag">${WORLD_NAMES[selectedWorld]}</span><h3>${selectedMap} 攻略</h3><div class="muted">攻略データ拡充中</div></div></div><p>${selectedMap} の詳細攻略データは順次追加中。現在は元Wikiからルート・敵編成・制空・ドロップを確認できるよ。</p><a class="guide-link" href="${wikiMapUrl(selectedMap)}" target="_blank" rel="noopener">${selectedMap} の攻略Wikiを見る ↗</a></article>`;
  return;
 }
 card.innerHTML=`<article class="map-detail-card"><div class="map-detail-title"><div><span class="guide-tag">${WORLD_NAMES[selectedWorld]}</span><h3>${selectedMap} ${esc(d.name)}</h3><div class="muted">${esc(d.sourceDate)}</div></div></div><div class="map-detail-section"><strong>概要</strong><p>${esc(d.overview)}</p></div><div class="map-detail-grid"><div class="map-detail-section"><strong>おすすめ編成</strong><p>${esc(d.formation)}</p></div><div class="map-detail-section"><strong>主なルート</strong><p>${esc(d.route)}</p></div><div class="map-detail-section"><strong>制空・航空</strong><p>${esc(d.air)}</p></div><div class="map-detail-section warn"><strong>注意点</strong><p>${esc(d.caution)}</p></div></div><div class="map-detail-actions"><a class="guide-link" href="${wikiMapUrl(selectedMap)}" target="_blank" rel="noopener">最新の攻略Wikiを確認 ↗</a></div></article>`;
}

function renderGuide(){
 renderMapPicker();
 const filters=document.getElementById('guideFilters');
 filters.innerHTML=Object.entries(guideLabels).map(([k,v])=>`<button class="guide-chip ${guideFilter===k?'active':''}" data-guide-filter="${k}">${v}</button>`).join('');
 const q=document.getElementById('guideQuery').value.trim().toLowerCase();
 const rows=GUIDE.filter(x=>(guideFilter==='all'||(guideFilter==='fav'?guideFavs.has(x.id):x.type===guideFilter))&&(!q||`${x.title} ${x.subtitle} ${x.summary} ${x.keywords}`.toLowerCase().includes(q)));
 document.getElementById('guideResults').innerHTML=rows.length?rows.map(x=>`<article class="guide-card"><div class="guide-card-top"><div><span class="guide-tag">${guideLabels[x.type]}</span><h3>${esc(x.title)}</h3><div class="muted">${esc(x.subtitle)}</div></div><button class="guide-fav" data-guide-fav="${x.id}" aria-label="お気に入り">${guideFavs.has(x.id)?'★':'☆'}</button></div><p>${esc(x.summary)}</p><a class="guide-link" href="${x.url}" target="_blank" rel="noopener">攻略Wikiで詳しく見る ↗</a></article>`).join(''):'<div class="empty">該当する攻略情報がないよ</div>';
}

document.addEventListener('click',e=>{
 const world=e.target.closest('[data-world]');if(world){selectedWorld=world.dataset.world;selectedMap='';renderMapPicker();return}
 const map=e.target.closest('[data-map]');if(map){selectedMap=map.dataset.map;selectedWorld=selectedMap.split('-')[0];renderMapPicker();document.getElementById('selectedMapCard').scrollIntoView({behavior:'smooth',block:'center'});return}
 const gf=e.target.closest('[data-guide-filter]');if(gf){guideFilter=gf.dataset.guideFilter;renderGuide();return}
 const fav=e.target.closest('[data-guide-fav]');if(fav){const id=fav.dataset.guideFav;guideFavs.has(id)?guideFavs.delete(id):guideFavs.add(id);localStorage.setItem(FAV_KEY,JSON.stringify([...guideFavs]));renderGuide();return}
 const del=e.target.closest('[data-delete-timer]');if(del){const k=del.dataset.kind,arr=k==='expedition'?state.expeditions:state.docks;const i=arr.findIndex(x=>x.id===del.dataset.deleteTimer);if(i>=0)arr.splice(i,1);save();renderTimers(k);return}
 const qd=e.target.closest('[data-delete-quest]');if(qd){state.quests=state.quests.filter(x=>x.id!==qd.dataset.deleteQuest);save();renderQuests();}
});
document.getElementById('guideQuery').addEventListener('input',renderGuide);
document.getElementById('guideSearchBtn').onclick=renderGuide;

function renderTimers(kind){const arr=kind==='expedition'?state.expeditions:state.docks;const el=document.getElementById(kind==='expedition'?'expeditionList':'dockList');if(!arr.length){el.innerHTML='<div class="empty">まだタイマーはないよ</div>';return}const now=Date.now();el.innerHTML=arr.sort((a,b)=>a.endsAt-b.endsAt).map(t=>`<div class="timer ${t.endsAt<=now?'done':''}"><div class="timer-main"><div class="timer-name">${esc(t.name)}</div><div class="timer-time" data-end="${t.endsAt}">${fmt(t.endsAt-now)}</div></div><button class="icon-btn" data-delete-timer="${t.id}" data-kind="${kind}">×</button></div>`).join('')}
function renderQuests(){const el=document.getElementById('questList');if(!state.quests.length){el.innerHTML='<div class="empty">任務を追加するとここに並ぶよ</div>';return}el.innerHTML=state.quests.map(q=>`<div class="quest"><input type="checkbox" data-quest-check="${q.id}" ${q.done?'checked':''}><div class="quest-main"><div class="quest-name" style="${q.done?'text-decoration:line-through;opacity:.6':''}">${esc(q.name)}</div></div><button class="icon-btn" data-delete-quest="${q.id}">×</button></div>`).join('')}
function renderResources(){['fuel','ammo','steel','bauxite'].forEach(k=>document.getElementById(k).value=state.resources[k]??'');document.getElementById('resourceSaved').textContent=state.resources.savedAt?`最終保存: ${new Date(state.resources.savedAt).toLocaleString('ja-JP')}`:''}
function render(){renderGuide();renderTimers('expedition');renderTimers('dock');renderQuests();renderResources()}
function openTimer(kind){timerKind=kind;document.getElementById('timerDialogTitle').textContent=kind==='expedition'?'遠征タイマー追加':'入渠タイマー追加';document.getElementById('timerName').value='';document.getElementById('timerMinutes').value='30';document.getElementById('timerDialog').showModal()}

document.getElementById('addExpedition').onclick=()=>openTimer('expedition');document.getElementById('addDock').onclick=()=>openTimer('dock');document.getElementById('addQuest').onclick=()=>{document.getElementById('questName').value='';document.getElementById('questDialog').showModal()};
document.getElementById('timerForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;const name=document.getElementById('timerName').value.trim(),mins=Number(document.getElementById('timerMinutes').value);if(!name||!mins)return;(timerKind==='expedition'?state.expeditions:state.docks).push({id:uid(),name,endsAt:Date.now()+mins*60000});save();render()});
document.getElementById('questForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;const name=document.getElementById('questName').value.trim();if(!name)return;state.quests.push({id:uid(),name,done:false});save();renderQuests()});
document.addEventListener('change',e=>{if(e.target.matches('[data-quest-check]')){const q=state.quests.find(x=>x.id===e.target.dataset.questCheck);if(q){q.done=e.target.checked;save();renderQuests()}}});
document.getElementById('saveResources').onclick=()=>{['fuel','ammo','steel','bauxite'].forEach(k=>state.resources[k]=document.getElementById(k).value);state.resources.savedAt=Date.now();save();renderResources()};

const secretaryLines=['提督、3-2・5-5・6-5・7-5はアプリ内で攻略要点まで見られるようにしたよ。','攻略で迷ったら上の海域ボタンから選んで。必要なところだけ一緒に見よ。','遠征の帰投時刻はこっちで見てるよ。焦らずいこう。','任務、ひとつずつ片付けよ。全部いっぺんにやらなくていいから。','資源の記録、あとで効いてくるよ。今日の分だけ残しておこ。'];
document.getElementById('secretaryRefresh').onclick=()=>{document.getElementById('secretaryText').textContent=secretaryLines[Math.floor(Math.random()*secretaryLines.length)]};
document.getElementById('notifyBtn').onclick=async()=>{if(!('Notification'in window)){alert('このブラウザでは通知APIが使えないみたい');return}const result=await Notification.requestPermission();document.getElementById('notifyBtn').textContent=result==='granted'?'通知ON':'通知OFF'};
function tick(){const now=Date.now();document.querySelectorAll('.timer-time').forEach(el=>{const end=Number(el.dataset.end);el.textContent=fmt(end-now);el.closest('.timer')?.classList.toggle('done',end<=now)});for(const [kind,arr] of [['遠征',state.expeditions],['入渠',state.docks]])for(const t of arr){if(t.endsAt<=now&&!notified.has(t.id)){notified.add(t.id);if(Notification.permission==='granted')new Notification(`HarborDesk: ${kind}完了`,{body:`${t.name} が完了したよ`})}}}
setInterval(tick,1000);if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));render();tick();
