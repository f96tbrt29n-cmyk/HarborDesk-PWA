const KEY='harbordesk-pwa-v1';
const FAV_KEY='harbordesk-guide-favs-v1';
const state=load();
let timerKind='expedition';
let notified=new Set();
let guideFilter='all';
const guideFavs=new Set(JSON.parse(localStorage.getItem(FAV_KEY)||'[]'));

const GUIDE=[
{id:'maps',type:'map',title:'通常海域 攻略入口',subtitle:'海域',summary:'通常海域の攻略情報を確認。個別海域カードは今後追加予定。',keywords:'海域 1-1 2-4 3-2 5-5 6-5 7-5 攻略',url:'https://wikiwiki.jp/kancolle/'},
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
function esc(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2)}
function fmt(ms){if(ms<=0)return '完了';const sec=Math.ceil(ms/1000),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return h>0?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`}

function renderGuide(){
 const filters=document.getElementById('guideFilters');
 filters.innerHTML=Object.entries(guideLabels).map(([k,v])=>`<button class="guide-chip ${guideFilter===k?'active':''}" data-guide-filter="${k}">${v}</button>`).join('');
 const q=document.getElementById('guideQuery').value.trim().toLowerCase();
 const rows=GUIDE.filter(x=>(guideFilter==='all'||(guideFilter==='fav'?guideFavs.has(x.id):x.type===guideFilter))&&(!q||`${x.title} ${x.subtitle} ${x.summary} ${x.keywords}`.toLowerCase().includes(q)));
 document.getElementById('guideResults').innerHTML=rows.length?rows.map(x=>`<article class="guide-card"><div class="guide-card-top"><div><span class="guide-tag">${guideLabels[x.type]}</span><h3>${esc(x.title)}</h3><div class="muted">${esc(x.subtitle)}</div></div><button class="guide-fav" data-guide-fav="${x.id}" aria-label="お気に入り">${guideFavs.has(x.id)?'★':'☆'}</button></div><p>${esc(x.summary)}</p><a class="guide-link" href="${x.url}" target="_blank" rel="noopener">攻略Wikiで詳しく見る ↗</a></article>`).join(''):'<div class="empty">該当する攻略情報がないよ</div>';
}

document.addEventListener('click',e=>{
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

const secretaryLines=['提督、攻略で迷ったら上の検索からすぐ探せるよ。','遠征の帰投時刻はこっちで見てるよ。焦らずいこう。','任務、ひとつずつ片付けよ。全部いっぺんにやらなくていいから。','資源の記録、あとで効いてくるよ。今日の分だけ残しておこ。'];
document.getElementById('secretaryRefresh').onclick=()=>{document.getElementById('secretaryText').textContent=secretaryLines[Math.floor(Math.random()*secretaryLines.length)]};
document.getElementById('notifyBtn').onclick=async()=>{if(!('Notification'in window)){alert('このブラウザでは通知APIが使えないみたい');return}const result=await Notification.requestPermission();document.getElementById('notifyBtn').textContent=result==='granted'?'通知ON':'通知OFF'};
function tick(){const now=Date.now();document.querySelectorAll('.timer-time').forEach(el=>{const end=Number(el.dataset.end);el.textContent=fmt(end-now);el.closest('.timer')?.classList.toggle('done',end<=now)});for(const [kind,arr] of [['遠征',state.expeditions],['入渠',state.docks]])for(const t of arr){if(t.endsAt<=now&&!notified.has(t.id)){notified.add(t.id);if(Notification.permission==='granted')new Notification(`HarborDesk: ${kind}完了`,{body:`${t.name} が完了したよ`})}}}
setInterval(tick,1000);if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));render();tick();
