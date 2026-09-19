const HD_EQUIP_KEY='harbordesk-equipment-v1';
const HD_EVENT_KEY='harbordesk-events-v1';
const HD_RESOURCE_HISTORY_KEY='harbordesk-resource-history-v1';

function hdLoad(key,fallback=[]){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function hdSave(key,value){localStorage.setItem(key,JSON.stringify(value));if(key===HD_EQUIP_KEY)window.dispatchEvent(new CustomEvent('hd:equipment-changed',{detail:{key,at:Date.now()}}))}
function hdEsc(s){return typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdUid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2)}
function hdFmtDate(ts){return new Date(ts).toLocaleString('ja-JP')}

function ensureAdvancedSections(){
 const main=document.querySelector('main');
 const resources=document.getElementById('resources');
 if(!main||!resources||document.getElementById('equipmentBook'))return;
 const wrap=document.createElement('div');
 wrap.id='advancedToolsWrap';
 wrap.innerHTML=`
 <section id="dashboard" class="advanced-section"><div class="section-head"><div><div class="eyebrow">COMMAND BOARD</div><h2>司令部ダッシュボード</h2></div><span class="muted">端末内データ集計</span></div><div id="dashboardCards" class="dashboard-grid"></div></section>
 <section id="equipmentBook" class="advanced-section"><div class="section-head"><div><div class="eyebrow">EQUIPMENT BOOK</div><h2>装備台帳・改修目標</h2></div><button id="addEquipment" class="primary small">＋装備</button></div><div class="advanced-toolbar"><input id="equipmentSearch" type="search" placeholder="装備名・カテゴリ・担当艦・メモで検索"></div><div id="equipmentList" class="advanced-list"></div></section>
 <section id="resourceHistory" class="advanced-section"><div class="section-head"><div><div class="eyebrow">RESOURCE LOG</div><h2>資源履歴</h2></div><button id="snapshotResources" class="ghost small">現在値を記録</button></div><div id="resourceTrend" class="dashboard-grid"></div><div id="resourceHistoryList" class="advanced-list"></div></section>
 <section id="eventLog" class="advanced-section"><div class="section-head"><div><div class="eyebrow">EVENT LOG</div><h2>イベント記録</h2></div><button id="addEventLog" class="primary small">＋記録</button></div><div id="eventLogList" class="advanced-list"></div></section>
 <section id="calculators" class="advanced-section"><div class="section-head"><div><div class="eyebrow">TOOLS</div><h2>計算ツール</h2></div><span class="muted">制空・遠征効率</span></div>
   <div class="tool-grid">
    <article class="tool-card"><h3>制空値かんたん計算</h3><p class="muted">各スロットの「対空値 × √搭載数 + 熟練度等の補正」を切り捨てて合計。</p><div id="airRows" class="air-rows"></div><button id="addAirRow" class="ghost small">＋スロット</button><div class="tool-result">合計制空値 <strong id="airPowerResult">0</strong></div></article>
    <article class="tool-card"><h3>遠征効率計算</h3><div class="calc-grid"><label>時間(分)<input id="effMinutes" type="number" min="1" value="30"></label><label>燃料<input id="effFuel" type="number" min="0" value="0"></label><label>弾薬<input id="effAmmo" type="number" min="0" value="0"></label><label>鋼材<input id="effSteel" type="number" min="0" value="0"></label><label>ボーキ<input id="effBauxite" type="number" min="0" value="0"></label></div><div id="effResult" class="tool-result"></div></article>
   </div>
 </section>
 <section id="backup" class="advanced-section"><div class="section-head"><div><div class="eyebrow">DATA</div><h2>バックアップ / 復元</h2></div><span class="muted">HarborDeskデータ</span></div><div class="backup-actions"><button id="exportBackup" class="primary">バックアップを書き出す</button><label class="ghost backup-file">バックアップを読み込む<input id="importBackup" type="file" accept="application/json,.json"></label></div><p class="muted">艦隊台帳、自分用編成、装備、イベント、資源履歴、任務、タイマーなどHarborDeskの端末内データをJSONで保存・復元できる。<b>艦娘画像は容量が大きいため別バックアップ</b>。艦娘DBの「艦娘画像」から書き出してね。</p></section>`;
 main.insertBefore(wrap,resources);
 ensureAdvancedDialogs();
 renderAllAdvanced();
 bindAdvancedEvents();
}

function ensureAdvancedDialogs(){
 if(!document.getElementById('equipmentDialog')){
  const d=document.createElement('dialog');d.id='equipmentDialog';d.innerHTML=`<form method="dialog" id="equipmentForm"><h3>装備を登録</h3><input id="equipmentId" type="hidden"><label>装備名<input id="equipmentName" required maxlength="60"></label><div class="dialog-two"><label>カテゴリ<input id="equipmentCategory" maxlength="30" placeholder="艦戦 / 主砲 / 電探など"></label><label>所持数<input id="equipmentCount" type="number" min="0" value="1"></label></div><div class="dialog-two"><label>現在改修★<input id="equipmentStar" type="number" min="0" max="10" value="0"></label><label>目標改修★<input id="equipmentTargetStar" type="number" min="0" max="10" value="10"></label></div><label>主な搭載艦<input id="equipmentAssigned" maxlength="80" placeholder="例：加賀改二"></label><label>改修メモ / 必要素材<textarea id="equipmentMemo" maxlength="500" placeholder="ネジ、改修餌、曜日など"></textarea></label><div class="dialog-actions"><button value="cancel" class="ghost">キャンセル</button><button value="default" class="primary">保存</button></div></form>`;document.body.appendChild(d);
 }
 if(!document.getElementById('eventDialog')){
  const d=document.createElement('dialog');d.id='eventDialog';d.innerHTML=`<form method="dialog" id="eventForm"><h3>イベント記録</h3><input id="eventId" type="hidden"><label>イベント名<input id="eventName" required maxlength="80" placeholder="例：2026夏イベント"></label><div class="dialog-two"><label>海域<input id="eventMap" maxlength="30" placeholder="E-1 / E-2-2"></label><label>難易度<select id="eventDifficulty"><option>甲</option><option>乙</option><option>丙</option><option>丁</option><option>未定</option></select></label></div><div class="dialog-two"><label>状態<select id="eventStatus"><option>攻略中</option><option>削り</option><option>ラスダン</option><option>クリア</option><option>掘り</option></select></label><label>ドロップ<input id="eventDrop" maxlength="60" placeholder="新艦・狙い艦など"></label></div><label>編成 / 基地 / 支援<textarea id="eventFleet" maxlength="700"></textarea></label><label>メモ<textarea id="eventMemo" maxlength="700" placeholder="ギミック、札、撤退原因など"></textarea></label><div class="dialog-actions"><button value="cancel" class="ghost">キャンセル</button><button value="default" class="primary">保存</button></div></form>`;document.body.appendChild(d);
 }
}

function renderDashboard(){
 const el=document.getElementById('dashboardCards');if(!el)return;
 const roster=hdLoad('harbordesk-ship-roster-v1',[]), eq=hdLoad(HD_EQUIP_KEY,[]), events=hdLoad(HD_EVENT_KEY,[]);
 let activeTimers=0,unfinished=0,res={fuel:'',ammo:'',steel:'',bauxite:''};
 try{if(typeof state!=='undefined'){activeTimers=(state.expeditions||[]).filter(x=>x.endsAt>Date.now()).length+(state.docks||[]).filter(x=>x.endsAt>Date.now()).length;unfinished=(state.quests||[]).filter(x=>!x.done).length;res=state.resources||res}}catch{}
 const vals=[['燃料',Number(res.fuel)||0],['弾薬',Number(res.ammo)||0],['鋼材',Number(res.steel)||0],['ボーキ',Number(res.bauxite)||0]];const low=vals.filter(x=>x[1]>0).sort((a,b)=>a[1]-b[1])[0];
 el.innerHTML=`<div class="dash-card"><span>艦娘登録</span><strong>${roster.length}</strong></div><div class="dash-card"><span>装備種類</span><strong>${eq.length}</strong></div><div class="dash-card"><span>稼働タイマー</span><strong>${activeTimers}</strong></div><div class="dash-card"><span>未完了任務</span><strong>${unfinished}</strong></div><div class="dash-card"><span>イベント記録</span><strong>${events.length}</strong></div><div class="dash-card"><span>最少資源</span><strong>${low?`${low[0]} ${low[1].toLocaleString()}`:'未記録'}</strong></div>`;
}

function renderEquipment(){
 const el=document.getElementById('equipmentList');if(!el)return;const q=(document.getElementById('equipmentSearch')?.value||'').toLowerCase();
 const rows=hdLoad(HD_EQUIP_KEY,[]).filter(x=>!q||`${x.name} ${x.category} ${x.assigned} ${x.memo}`.toLowerCase().includes(q));
 el.innerHTML=rows.length?rows.map(x=>`<article class="advanced-card"><div class="advanced-card-head"><div><strong>${hdEsc(x.name)}</strong><div class="muted">${hdEsc(x.category||'カテゴリ未設定')} ・ 所持 ${Number(x.count)||0}</div></div><div class="mini-actions"><button class="ghost small" data-eq-edit="${x.id}">編集</button><button class="ghost small" data-eq-delete="${x.id}">削除</button></div></div><div class="progress-line"><span>改修 ★${Number(x.star)||0} → 目標 ★${Number(x.targetStar)||0}</span><progress max="10" value="${Math.min(10,Number(x.star)||0)}"></progress></div>${x.assigned?`<div class="advanced-meta"><b>搭載:</b> ${hdEsc(x.assigned)}</div>`:''}${x.memo?`<p>${hdEsc(x.memo)}</p>`:''}</article>`).join(''):'<div class="empty">装備はまだ登録されてないよ</div>';
}
function openEquipment(item){const d=document.getElementById('equipmentDialog');document.getElementById('equipmentId').value=item?.id||'';document.getElementById('equipmentName').value=item?.name||'';document.getElementById('equipmentCategory').value=item?.category||'';document.getElementById('equipmentCount').value=item?.count??1;document.getElementById('equipmentStar').value=item?.star??0;document.getElementById('equipmentTargetStar').value=item?.targetStar??10;document.getElementById('equipmentAssigned').value=item?.assigned||'';document.getElementById('equipmentMemo').value=item?.memo||'';d.showModal()}

function hdRefreshResourceConsumers(){try{if(typeof hdRBRender==='function')hdRBRender();if(typeof hdCCRender==='function')hdCCRender();if(typeof renderHomeDashboard==='function')renderHomeDashboard();window.dispatchEvent(new CustomEvent('hd:workspace-refresh'))}catch{}}
function snapshotResources(){
 let res=null;try{if(typeof state!=='undefined')res=state.resources}catch{};if(!res)return;
 const row={id:hdUid(),at:Date.now(),fuel:Number(res.fuel)||0,ammo:Number(res.ammo)||0,steel:Number(res.steel)||0,bauxite:Number(res.bauxite)||0};const h=hdLoad(HD_RESOURCE_HISTORY_KEY,[]);h.unshift(row);hdSave(HD_RESOURCE_HISTORY_KEY,h.slice(0,120));renderResourceHistory();renderDashboard();hdRefreshResourceConsumers();
}
function renderResourceHistory(){
 const list=document.getElementById('resourceHistoryList'),trend=document.getElementById('resourceTrend');if(!list||!trend)return;const h=hdLoad(HD_RESOURCE_HISTORY_KEY,[]);const cur=h[0],prev=h[1];
 const keys=[['fuel','燃料'],['ammo','弾薬'],['steel','鋼材'],['bauxite','ボーキ']];trend.innerHTML=keys.map(([k,n])=>{const delta=cur&&prev?cur[k]-prev[k]:null;return `<div class="dash-card"><span>${n}</span><strong>${cur?cur[k].toLocaleString():'-'}</strong><small class="${delta>0?'plus':delta<0?'minus':''}">${delta==null?'差分なし':`${delta>=0?'+':''}${delta.toLocaleString()}`}</small></div>`}).join('');
 list.innerHTML=h.length?h.slice(0,12).map(x=>`<div class="history-row"><span>${hdFmtDate(x.at)}</span><span>燃 ${x.fuel.toLocaleString()} / 弾 ${x.ammo.toLocaleString()} / 鋼 ${x.steel.toLocaleString()} / ボ ${x.bauxite.toLocaleString()}</span><button class="icon-btn" data-history-delete="${x.id}">×</button></div>`).join(''):'<div class="empty">資源を保存したあと「現在値を記録」で推移を残せるよ</div>';
}

function renderEvents(){const el=document.getElementById('eventLogList');if(!el)return;const rows=hdLoad(HD_EVENT_KEY,[]);el.innerHTML=rows.length?rows.map(x=>`<article class="advanced-card"><div class="advanced-card-head"><div><strong>${hdEsc(x.eventName)} ${hdEsc(x.map||'')}</strong><div class="event-badges"><span>${hdEsc(x.difficulty)}</span><span>${hdEsc(x.status)}</span></div></div><div class="mini-actions"><button class="ghost small" data-event-edit="${x.id}">編集</button><button class="ghost small" data-event-delete="${x.id}">削除</button></div></div>${x.drop?`<div class="advanced-meta"><b>ドロップ:</b> ${hdEsc(x.drop)}</div>`:''}${x.fleet?`<div class="advanced-meta"><b>編成:</b> ${hdEsc(x.fleet)}</div>`:''}${x.memo?`<p>${hdEsc(x.memo)}</p>`:''}<div class="muted">${hdFmtDate(x.updatedAt||x.createdAt)}</div></article>`).join(''):'<div class="empty">イベント攻略や掘りの記録を残せるよ</div>'}
function openEvent(item){document.getElementById('eventId').value=item?.id||'';document.getElementById('eventName').value=item?.eventName||'';document.getElementById('eventMap').value=item?.map||'';document.getElementById('eventDifficulty').value=item?.difficulty||'甲';document.getElementById('eventStatus').value=item?.status||'攻略中';document.getElementById('eventDrop').value=item?.drop||'';document.getElementById('eventFleet').value=item?.fleet||'';document.getElementById('eventMemo').value=item?.memo||'';document.getElementById('eventDialog').showModal()}

function addAirRow(values={aa:0,slot:18,bonus:0}){const host=document.getElementById('airRows');const row=document.createElement('div');row.className='air-row';row.innerHTML=`<label>対空<input class="air-aa" type="number" step="0.1" value="${values.aa}"></label><label>搭載数<input class="air-slot" type="number" min="0" value="${values.slot}"></label><label>熟練度等補正<input class="air-bonus" type="number" step="0.1" value="${values.bonus}"></label><button class="icon-btn air-remove">×</button>`;host.appendChild(row);row.querySelectorAll('input').forEach(i=>i.addEventListener('input',calcAirPower));row.querySelector('.air-remove').onclick=()=>{row.remove();calcAirPower()};calcAirPower()}
function calcAirPower(){let total=0;document.querySelectorAll('.air-row').forEach(r=>{const aa=Number(r.querySelector('.air-aa').value)||0,slot=Number(r.querySelector('.air-slot').value)||0,bonus=Number(r.querySelector('.air-bonus').value)||0;total+=Math.floor(aa*Math.sqrt(Math.max(0,slot))+bonus)});const el=document.getElementById('airPowerResult');if(el)el.textContent=total}
function calcEfficiency(){const m=Number(document.getElementById('effMinutes')?.value)||0;const el=document.getElementById('effResult');if(!el)return;if(m<=0){el.textContent='時間を入力';return}const f=60/m;const vals=[['燃料','effFuel'],['弾薬','effAmmo'],['鋼材','effSteel'],['ボーキ','effBauxite']].map(([n,id])=>`${n} ${(Number(document.getElementById(id).value)||0)*f}`);el.textContent='1時間あたり: '+vals.map(s=>s.replace(/(\d+\.\d{2,}).*/,m=>Number(parseFloat(m)).toFixed(1))).join(' / ')}

function exportBackup(){const data={version:1,exportedAt:new Date().toISOString(),localStorage:{}};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('harbordesk'))data.localStorage[k]=localStorage.getItem(k)}const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`HarborDesk-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function hdApplyBackupLocalStorage(storage){if(!storage||typeof storage!=='object'||Array.isArray(storage))throw new Error('invalid backup storage');const entries=Object.entries(storage).filter(([k,v])=>k.startsWith('harbordesk')&&typeof v==='string'),keep=new Set(entries.map(([k])=>k));for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k?.startsWith('harbordesk')&&!keep.has(k))localStorage.removeItem(k)}for(const [k,v] of entries)localStorage.setItem(k,v);return entries.length}
async function importBackup(file){try{const obj=JSON.parse(await file.text());if(!obj?.localStorage)throw new Error();hdApplyBackupLocalStorage(obj.localStorage);alert('バックアップ時点のHarborDeskデータへ復元したよ。画面を再読み込みするね。');location.reload()}catch{alert('HarborDeskのバックアップJSONを読み込めなかったよ')}}

function bindAdvancedEvents(){
 document.getElementById('addEquipment').onclick=()=>openEquipment();document.getElementById('equipmentSearch').addEventListener('input',renderEquipment);
 document.getElementById('equipmentForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;const rows=hdLoad(HD_EQUIP_KEY,[]),id=document.getElementById('equipmentId').value||hdUid();const item={id,name:document.getElementById('equipmentName').value.trim(),category:document.getElementById('equipmentCategory').value.trim(),count:Number(document.getElementById('equipmentCount').value)||0,star:Number(document.getElementById('equipmentStar').value)||0,targetStar:Number(document.getElementById('equipmentTargetStar').value)||0,assigned:document.getElementById('equipmentAssigned').value.trim(),memo:document.getElementById('equipmentMemo').value.trim(),updatedAt:Date.now()};const i=rows.findIndex(x=>x.id===id);if(i>=0)rows[i]={...rows[i],...item};else rows.unshift({...item,createdAt:Date.now()});hdSave(HD_EQUIP_KEY,rows);setTimeout(()=>{renderEquipment();renderDashboard()},0)});
 document.getElementById('snapshotResources').onclick=snapshotResources;const sr=document.getElementById('saveResources');if(sr)sr.addEventListener('click',()=>setTimeout(snapshotResources,0));
 document.getElementById('addEventLog').onclick=()=>openEvent();document.getElementById('eventForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;const rows=hdLoad(HD_EVENT_KEY,[]),id=document.getElementById('eventId').value||hdUid();const item={id,eventName:document.getElementById('eventName').value.trim(),map:document.getElementById('eventMap').value.trim(),difficulty:document.getElementById('eventDifficulty').value,status:document.getElementById('eventStatus').value,drop:document.getElementById('eventDrop').value.trim(),fleet:document.getElementById('eventFleet').value.trim(),memo:document.getElementById('eventMemo').value.trim(),updatedAt:Date.now()};const i=rows.findIndex(x=>x.id===id);if(i>=0)rows[i]={...rows[i],...item};else rows.unshift({...item,createdAt:Date.now()});hdSave(HD_EVENT_KEY,rows);setTimeout(()=>{renderEvents();renderDashboard()},0)});
 document.addEventListener('click',e=>{
 const ee=e.target.closest('[data-eq-edit]');if(ee){openEquipment(hdLoad(HD_EQUIP_KEY,[]).find(x=>x.id===ee.dataset.eqEdit));return}
 const ed=e.target.closest('[data-eq-delete]');if(ed){
  const rows=hdLoad(HD_EQUIP_KEY,[]),i=rows.findIndex(x=>x.id===ed.dataset.eqDelete);if(i<0)return;const [item]=rows.splice(i,1);
  hdSave(HD_EQUIP_KEY,rows);renderEquipment();renderDashboard();
  window.hdToastAction?.(`${item.name||'装備'} を削除したよ`,'元に戻す',()=>{const current=hdLoad(HD_EQUIP_KEY,[]);if(!current.some(x=>x.id===item.id)){current.splice(Math.min(i,current.length),0,item);hdSave(HD_EQUIP_KEY,current);renderEquipment();renderDashboard();window.hdToast?.('元に戻したよ')}});return
 }
 const he=e.target.closest('[data-history-delete]');if(he){
  const rows=hdLoad(HD_RESOURCE_HISTORY_KEY,[]),i=rows.findIndex(x=>x.id===he.dataset.historyDelete);if(i<0)return;const [item]=rows.splice(i,1);
  hdSave(HD_RESOURCE_HISTORY_KEY,rows);renderResourceHistory();hdRefreshResourceConsumers();
  window.hdToastAction?.('資源履歴を削除したよ','元に戻す',()=>{const current=hdLoad(HD_RESOURCE_HISTORY_KEY,[]);if(!current.some(x=>x.id===item.id)){current.splice(Math.min(i,current.length),0,item);hdSave(HD_RESOURCE_HISTORY_KEY,current);renderResourceHistory();hdRefreshResourceConsumers();window.hdToast?.('元に戻したよ')}});return
 }
 const ev=e.target.closest('[data-event-edit]');if(ev){openEvent(hdLoad(HD_EVENT_KEY,[]).find(x=>x.id===ev.dataset.eventEdit));return}
 const dv=e.target.closest('[data-event-delete]');if(dv){
  const rows=hdLoad(HD_EVENT_KEY,[]),i=rows.findIndex(x=>x.id===dv.dataset.eventDelete);if(i<0)return;const [item]=rows.splice(i,1);
  hdSave(HD_EVENT_KEY,rows);renderEvents();renderDashboard();
  window.hdToastAction?.(`${item.eventName||'イベント記録'} を削除したよ`,'元に戻す',()=>{const current=hdLoad(HD_EVENT_KEY,[]);if(!current.some(x=>x.id===item.id)){current.splice(Math.min(i,current.length),0,item);hdSave(HD_EVENT_KEY,current);renderEvents();renderDashboard();window.hdToast?.('元に戻したよ')}});return
 }
});
 document.getElementById('addAirRow').onclick=()=>addAirRow();['effMinutes','effFuel','effAmmo','effSteel','effBauxite'].forEach(id=>document.getElementById(id).addEventListener('input',calcEfficiency));
 document.getElementById('exportBackup').onclick=exportBackup;document.getElementById('importBackup').onchange=e=>{const f=e.target.files?.[0];if(f)importBackup(f)};
}
function renderAllAdvanced(){renderDashboard();renderEquipment();renderResourceHistory();renderEvents();if(!document.querySelector('.air-row')){addAirRow({aa:10,slot:18,bonus:0});addAirRow({aa:10,slot:18,bonus:0})}calcEfficiency()}

ensureAdvancedSections();
