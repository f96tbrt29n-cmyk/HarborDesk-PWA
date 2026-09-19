const SHIP_ROSTER_KEY='harbordesk-ship-roster-v1';
let shipRosterEditId=null;
const SHIP_TAGS=['主力','育成中','改二待ち','任務用','イベント温存'];
const SHIP_ROSTER_TYPES=['','駆逐艦','海防艦','軽巡洋艦','重雷装巡洋艦','練習巡洋艦','重巡洋艦','航空巡洋艦','高速戦艦','戦艦','航空戦艦','軽空母','正規空母','装甲空母','水上機母艦','潜水艦','潜水空母','潜水母艦','補給艦','揚陸艦'];

function rosterLoad(){try{return JSON.parse(localStorage.getItem(SHIP_ROSTER_KEY))||[]}catch{return []}}
function rosterMasterRef(input){
 const name=typeof input==='object'?String(input?.name||''):String(input||''),id=Number(typeof input==='object'?input?.masterId:0)||0;
 if(id&&typeof hdShipImageResolve==='function')return hdShipImageResolve({id,name});
 if(name&&typeof hdShipImageResolve==='function')return hdShipImageResolve(name);
 return null;
}
function rosterMasterId(input){return Number(rosterMasterRef(input)?.id)||0}
function rosterMigrateMasterIds(){
 const rows=rosterLoad();let changed=false;
 for(const row of rows){if(Number(row.masterId)>0)continue;const id=rosterMasterId(row.name);if(id){row.masterId=id;changed=true}}
 if(changed)localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));return changed;
}
function rosterSave(items){localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(items));renderShipRoster();refreshShipRosterOptions()}
function rosterEsc(s){return typeof esc==='function'?esc(s):String(s)}
function rosterUid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2)}

function ensureShipRosterDialog(){
 if(document.getElementById('shipRosterDialog'))return;
 const d=document.createElement('dialog');d.id='shipRosterDialog';
 d.innerHTML=`<form method="dialog" id="shipRosterForm"><h3>艦娘を登録</h3>
 <label>艦娘名<input id="rosterName" required maxlength="40" placeholder="例：矢矧改二乙"></label>
 <div class="roster-two"><label>艦種<select id="rosterType">${SHIP_ROSTER_TYPES.map(x=>`<option value="${x}">${x||'自動判定 / 未設定'}</option>`).join('')}</select></label><label>Lv<input id="rosterLevel" type="number" min="1" max="180" inputmode="numeric" placeholder="99"></label></div>
 <label>改造状態<input id="rosterRemodel" maxlength="30" placeholder="例：改二乙"></label>
 <div><div class="roster-label">タグ</div><div id="rosterTagBox" class="roster-tags"></div></div>
 <label>よく使う装備メモ<textarea id="rosterGear" maxlength="300" placeholder="例：15.2改二 / 水偵乙熟練 / 甲標的 丁型改 / 水雷見張員"></textarea></label>
 <label>メモ<textarea id="rosterMemo" maxlength="300" placeholder="運改修済み、対潜100、など"></textarea></label>
 <div class="dialog-actions"><button value="cancel" class="ghost">キャンセル</button><button value="default" class="primary">保存</button></div></form>`;
 document.body.appendChild(d);
 document.getElementById('rosterTagBox').innerHTML=SHIP_TAGS.map(t=>`<label class="roster-tag-check"><input type="checkbox" value="${t}">${t}</label>`).join('');
 document.getElementById('shipRosterForm').addEventListener('submit',e=>{
  if(e.submitter?.value==='cancel')return;
  const name=document.getElementById('rosterName').value.trim();if(!name)return;
  const items=rosterLoad();
  const payload={name,masterId:rosterMasterId(name),type:document.getElementById('rosterType')?.value||'',level:document.getElementById('rosterLevel').value.trim(),remodel:document.getElementById('rosterRemodel').value.trim(),gear:document.getElementById('rosterGear').value.trim(),memo:document.getElementById('rosterMemo').value.trim(),tags:[...document.querySelectorAll('#rosterTagBox input:checked')].map(x=>x.value),updatedAt:Date.now()};
  if(shipRosterEditId){const i=items.findIndex(x=>x.id===shipRosterEditId);if(i>=0)items[i]={...items[i],...payload}}
  else items.push({id:rosterUid(),createdAt:Date.now(),...payload});
  shipRosterEditId=null;rosterSave(items);
 });
}

function openShipRosterDialog(item=null){
 ensureShipRosterDialog();shipRosterEditId=item?.id||null;
 document.querySelector('#shipRosterDialog h3').textContent=item?'艦娘を編集':'艦娘を登録';
 document.getElementById('rosterName').value=item?.name||'';document.getElementById('rosterType').value=item?.type||'';document.getElementById('rosterLevel').value=item?.level||'';document.getElementById('rosterRemodel').value=item?.remodel||'';document.getElementById('rosterGear').value=item?.gear||'';document.getElementById('rosterMemo').value=item?.memo||'';
 document.querySelectorAll('#rosterTagBox input').forEach(x=>x.checked=(item?.tags||[]).includes(x.value));
 document.getElementById('shipRosterDialog').showModal();
}

function refreshShipRosterOptions(){
 let dl=document.getElementById('shipRosterOptions');if(!dl){dl=document.createElement('datalist');dl.id='shipRosterOptions';document.body.appendChild(dl)}
 dl.innerHTML=rosterLoad().sort((a,b)=>a.name.localeCompare(b.name,'ja')).map(x=>`<option value="${rosterEsc(x.name)}"></option>`).join('');
}
function findRosterShip(name){return rosterLoad().find(x=>x.name===name)}

function renderShipRoster(){
 const host=document.getElementById('shipRosterList');if(!host)return;
 const q=(document.getElementById('shipRosterSearch')?.value||'').trim().toLowerCase();
 const active=document.querySelector('[data-roster-filter].active')?.dataset.rosterFilter||'all';
 const rows=rosterLoad().filter(x=>(active==='all'||(x.tags||[]).includes(active))&&(!q||`${x.name} ${x.remodel||''} ${(x.tags||[]).join(' ')} ${x.memo||''}`.toLowerCase().includes(q))).sort((a,b)=>Number(b.level||0)-Number(a.level||0)||a.name.localeCompare(b.name,'ja'));
 host.innerHTML=rows.length?rows.map(x=>{const image=typeof hdShipImageThumbHtml==='function'?hdShipImageThumbHtml(x.masterId?{id:x.masterId,name:x.name}:x.name,'roster-thumb'):'';return `<article class="roster-card"><div class="roster-card-head">${image}<div class="roster-card-main"><div><strong>${rosterEsc(x.name)}</strong><div class="muted">${x.type?`${rosterEsc(x.type)} ・ `:''}${x.level?`Lv.${rosterEsc(x.level)}`:''}${x.remodel?` ・ ${rosterEsc(x.remodel)}`:''}</div></div><div class="roster-actions"><button class="ghost small" data-roster-edit="${x.id}">編集</button><button class="ghost small" data-roster-delete="${x.id}">削除</button></div></div></div><div class="roster-badges">${(x.tags||[]).map(t=>`<span>${rosterEsc(t)}</span>`).join('')}</div>${x.gear?`<div class="roster-note"><b>装備:</b> ${rosterEsc(x.gear)}</div>`:''}${x.memo?`<div class="roster-note"><b>メモ:</b> ${rosterEsc(x.memo)}</div>`:''}</article>`}).join(''):'<div class="empty">まだ艦娘が登録されてないよ。「＋艦娘を登録」から追加してね。</div>';
 if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(host);
}

function initShipRoster(){
 rosterMigrateMasterIds();ensureShipRosterDialog();refreshShipRosterOptions();
 const filters=document.getElementById('shipRosterFilters');if(filters)filters.innerHTML=['all',...SHIP_TAGS].map((x,i)=>`<button class="guide-chip ${i===0?'active':''}" data-roster-filter="${x}">${x==='all'?'すべて':x}</button>`).join('');
 document.getElementById('addShipRoster')?.addEventListener('click',()=>openShipRosterDialog());
 document.getElementById('shipRosterSearch')?.addEventListener('input',renderShipRoster);renderShipRoster();
}

document.addEventListener('click',e=>{
 const f=e.target.closest('[data-roster-filter]');if(f){document.querySelectorAll('[data-roster-filter]').forEach(x=>x.classList.remove('active'));f.classList.add('active');renderShipRoster();return}
 const ed=e.target.closest('[data-roster-edit]');if(ed){const item=rosterLoad().find(x=>x.id===ed.dataset.rosterEdit);if(item)openShipRosterDialog(item);return}
 const del=e.target.closest('[data-roster-delete]');if(del){rosterSave(rosterLoad().filter(x=>x.id!==del.dataset.rosterDelete));}
});

document.addEventListener('DOMContentLoaded',initShipRoster);
window.addEventListener('hd:ship-images-changed',renderShipRoster);
window.addEventListener('hd:ship-images-ready',renderShipRoster);
