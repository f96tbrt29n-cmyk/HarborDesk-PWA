const KEY='harbordesk-pwa-v1';
const state=load();
let timerKind='expedition';
let notified=new Set();

function load(){
  try{return JSON.parse(localStorage.getItem(KEY))||{expeditions:[],docks:[],quests:[],resources:{fuel:'',ammo:'',steel:'',bauxite:'',savedAt:null}}}
  catch{return {expeditions:[],docks:[],quests:[],resources:{fuel:'',ammo:'',steel:'',bauxite:'',savedAt:null}}}
}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2)}
function fmt(ms){if(ms<=0)return '完了';const sec=Math.ceil(ms/1000),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return h>0?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`}

function renderTimers(kind){
  const arr=kind==='expedition'?state.expeditions:state.docks;
  const el=document.getElementById(kind==='expedition'?'expeditionList':'dockList');
  if(!arr.length){el.innerHTML='<div class="empty">まだタイマーはないよ</div>';return}
  const now=Date.now();
  el.innerHTML=arr.sort((a,b)=>a.endsAt-b.endsAt).map(t=>`<div class="timer ${t.endsAt<=now?'done':''}"><div class="timer-main"><div class="timer-name">${esc(t.name)}</div><div class="timer-time" data-end="${t.endsAt}">${fmt(t.endsAt-now)}</div></div><button class="icon-btn" data-delete-timer="${t.id}" data-kind="${kind}" aria-label="削除">×</button></div>`).join('');
}
function renderQuests(){
  const el=document.getElementById('questList');
  if(!state.quests.length){el.innerHTML='<div class="empty">任務を追加するとここに並ぶよ</div>';return}
  el.innerHTML=state.quests.map(q=>`<div class="quest"><input type="checkbox" data-quest-check="${q.id}" ${q.done?'checked':''}><div class="quest-main"><div class="quest-name" style="${q.done?'text-decoration:line-through;opacity:.6':''}">${esc(q.name)}</div></div><button class="icon-btn" data-delete-quest="${q.id}" aria-label="削除">×</button></div>`).join('')
}
function renderResources(){
  ['fuel','ammo','steel','bauxite'].forEach(k=>document.getElementById(k).value=state.resources[k]??'');
  document.getElementById('resourceSaved').textContent=state.resources.savedAt?`最終保存: ${new Date(state.resources.savedAt).toLocaleString('ja-JP')}`:'';
}
function render(){renderTimers('expedition');renderTimers('dock');renderQuests();renderResources()}

function openTimer(kind){timerKind=kind;document.getElementById('timerDialogTitle').textContent=kind==='expedition'?'遠征タイマー追加':'入渠タイマー追加';document.getElementById('timerName').value='';document.getElementById('timerMinutes').value='30';document.getElementById('timerDialog').showModal()}

document.getElementById('addExpedition').onclick=()=>openTimer('expedition');
document.getElementById('addDock').onclick=()=>openTimer('dock');
document.getElementById('addQuest').onclick=()=>{document.getElementById('questName').value='';document.getElementById('questDialog').showModal()};

document.getElementById('timerForm').addEventListener('submit',e=>{
  const submitter=e.submitter;if(submitter?.value==='cancel')return;
  const name=document.getElementById('timerName').value.trim(),mins=Number(document.getElementById('timerMinutes').value);if(!name||!mins)return;
  const item={id:uid(),name,endsAt:Date.now()+mins*60000};
  (timerKind==='expedition'?state.expeditions:state.docks).push(item);save();render();
});
document.getElementById('questForm').addEventListener('submit',e=>{
  if(e.submitter?.value==='cancel')return;const name=document.getElementById('questName').value.trim();if(!name)return;state.quests.push({id:uid(),name,done:false});save();renderQuests();
});
document.addEventListener('click',e=>{
  const del=e.target.closest('[data-delete-timer]');if(del){const k=del.dataset.kind,arr=k==='expedition'?state.expeditions:state.docks;const i=arr.findIndex(x=>x.id===del.dataset.deleteTimer);if(i>=0)arr.splice(i,1);save();renderTimers(k);return}
  const qd=e.target.closest('[data-delete-quest]');if(qd){state.quests=state.quests.filter(x=>x.id!==qd.dataset.deleteQuest);save();renderQuests();}
});
document.addEventListener('change',e=>{if(e.target.matches('[data-quest-check]')){const q=state.quests.find(x=>x.id===e.target.dataset.questCheck);if(q){q.done=e.target.checked;save();renderQuests()}}});

document.getElementById('saveResources').onclick=()=>{
  ['fuel','ammo','steel','bauxite'].forEach(k=>state.resources[k]=document.getElementById(k).value);state.resources.savedAt=Date.now();save();renderResources();
};

const secretaryLines=[
  '提督、遠征の帰投時刻はこっちで見てるよ。焦らずいこう。',
  '任務、ひとつずつ片付けよ。全部いっぺんにやらなくていいから。',
  '資源の記録、あとで効いてくるよ。今日の分だけ残しておこ。',
  'おかえり、提督。まずは母港の状況を確認してから動こっか。',
  'ちゃんと休憩も任務のうち。長時間の出撃は目も肩も固まるからね。'
];
document.getElementById('secretaryRefresh').onclick=()=>{document.getElementById('secretaryText').textContent=secretaryLines[Math.floor(Math.random()*secretaryLines.length)]};

document.getElementById('notifyBtn').onclick=async()=>{
  if(!('Notification'in window)){alert('このブラウザでは通知APIが使えないみたい');return}
  const result=await Notification.requestPermission();document.getElementById('notifyBtn').textContent=result==='granted'?'通知ON':'通知OFF';
};

function tick(){
  const now=Date.now();document.querySelectorAll('.timer-time').forEach(el=>{const end=Number(el.dataset.end);el.textContent=fmt(end-now);el.closest('.timer')?.classList.toggle('done',end<=now)});
  for(const [kind,arr] of [['遠征',state.expeditions],['入渠',state.docks]])for(const t of arr){if(t.endsAt<=now&&!notified.has(t.id)){notified.add(t.id);if(Notification.permission==='granted')new Notification(`HarborDesk: ${kind}完了`,{body:`${t.name} が完了したよ`});}}
}
setInterval(tick,1000);

if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();tick();
