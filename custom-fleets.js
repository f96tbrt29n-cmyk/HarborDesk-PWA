const CUSTOM_FLEET_KEY='harbordesk-custom-fleets-v1';
let customFleetEditId=null;

function loadCustomFleets(){
  try{return JSON.parse(localStorage.getItem(CUSTOM_FLEET_KEY))||{}}
  catch{return {}}
}
function saveCustomFleets(data){localStorage.setItem(CUSTOM_FLEET_KEY,JSON.stringify(data))}
function cfEsc(s){return typeof esc==='function'?esc(s):String(s)}
function cfUid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2)}

function ensureCustomFleetDialog(){
  if(document.getElementById('customFleetDialog'))return;
  const dialog=document.createElement('dialog');
  dialog.id='customFleetDialog';
  dialog.innerHTML=`<form method="dialog" id="customFleetForm">
    <h3>自分用編成を保存</h3>
    <label>編成名<input id="customFleetName" maxlength="40" required placeholder="例：5-5 月次用"></label>
    <div id="customFleetRows" class="custom-fleet-form-grid"></div>
    <label>編成メモ<textarea id="customFleetMemo" maxlength="500" placeholder="支援あり、制空○○目安、など"></textarea></label>
    <div class="dialog-actions"><button value="cancel" class="ghost">キャンセル</button><button value="default" class="primary">保存</button></div>
  </form>`;
  document.body.appendChild(dialog);
  const rows=document.getElementById('customFleetRows');
  rows.innerHTML=Array.from({length:6},(_,i)=>`<div class="custom-fleet-row"><div class="custom-fleet-no">${i+1}</div><input id="cfShip${i}" maxlength="30" placeholder="艦娘名"><input id="cfGear${i}" maxlength="120" placeholder="装備メモ"></div>`).join('');
  document.getElementById('customFleetForm').addEventListener('submit',e=>{
    if(e.submitter?.value==='cancel')return;
    if(!selectedMap)return;
    const name=document.getElementById('customFleetName').value.trim();
    if(!name)return;
    const ships=Array.from({length:6},(_,i)=>({ship:document.getElementById(`cfShip${i}`).value.trim(),gear:document.getElementById(`cfGear${i}`).value.trim()}));
    const memo=document.getElementById('customFleetMemo').value.trim();
    const all=loadCustomFleets();
    all[selectedMap]=all[selectedMap]||[];
    if(customFleetEditId){
      const idx=all[selectedMap].findIndex(x=>x.id===customFleetEditId);
      if(idx>=0)all[selectedMap][idx]={...all[selectedMap][idx],name,ships,memo,updatedAt:Date.now()};
    }else{
      all[selectedMap].push({id:cfUid(),name,ships,memo,createdAt:Date.now(),updatedAt:Date.now()});
    }
    saveCustomFleets(all);
    customFleetEditId=null;
    setTimeout(()=>renderCustomFleets(selectedMap),0);
  });
}

function openCustomFleetDialog(item=null){
  ensureCustomFleetDialog();
  customFleetEditId=item?.id||null;
  document.getElementById('customFleetName').value=item?.name||'';
  document.getElementById('customFleetMemo').value=item?.memo||'';
  Array.from({length:6},(_,i)=>{
    document.getElementById(`cfShip${i}`).value=item?.ships?.[i]?.ship||'';
    document.getElementById(`cfGear${i}`).value=item?.ships?.[i]?.gear||'';
  });
  document.querySelector('#customFleetDialog h3').textContent=item?'自分用編成を編集':'自分用編成を保存';
  document.getElementById('customFleetDialog').showModal();
}

function renderCustomFleets(map){
  const card=document.getElementById('selectedMapCard');if(!card)return;
  let host=document.getElementById('customFleetPanel');
  if(!host){host=document.createElement('section');host.id='customFleetPanel';host.className='custom-fleet-section';card.appendChild(host)}
  if(!map){host.innerHTML='';return}
  const all=loadCustomFleets();
  const list=all[map]||[];
  const saved=list.length?list.map(item=>{
    const rows=(item.ships||[]).map((s,i)=>s.ship||s.gear?`<div class="custom-fleet-saved-row"><span>${i+1}</span><b>${cfEsc(s.ship||'未入力')}</b><small>${cfEsc(s.gear||'装備メモなし')}</small></div>`:'').join('');
    return `<article class="custom-fleet-card" data-cf-id="${item.id}"><div class="custom-fleet-head"><div><strong>${cfEsc(item.name)}</strong><div class="muted">${new Date(item.updatedAt||item.createdAt).toLocaleString('ja-JP')} 更新</div></div><div class="custom-fleet-actions"><button class="ghost small" data-cf-edit="${item.id}">編集</button><button class="ghost small" data-cf-delete="${item.id}">削除</button></div></div><div class="custom-fleet-saved-list">${rows||'<div class="muted">艦娘はまだ未入力</div>'}</div>${item.memo?`<p class="custom-fleet-memo">${cfEsc(item.memo)}</p>`:''}</article>`;
  }).join(''):'<div class="muted">この海域の自分用編成はまだ保存されてないよ。</div>';
  host.innerHTML=`<div class="custom-fleet-title"><div><div class="eyebrow">MY FLEET</div><h4>自分用編成</h4></div><button class="primary small" id="addCustomFleet">＋ 編成を保存</button></div>${saved}`;
  document.getElementById('addCustomFleet').onclick=()=>openCustomFleetDialog();
}

document.addEventListener('click',e=>{
  const edit=e.target.closest('[data-cf-edit]');
  if(edit&&selectedMap){const item=(loadCustomFleets()[selectedMap]||[]).find(x=>x.id===edit.dataset.cfEdit);if(item)openCustomFleetDialog(item);return}
  const del=e.target.closest('[data-cf-delete]');
  if(del&&selectedMap){
    const all=loadCustomFleets();
    all[selectedMap]=(all[selectedMap]||[]).filter(x=>x.id!==del.dataset.cfDelete);
    saveCustomFleets(all);renderCustomFleets(selectedMap);
  }
});

const prevRenderMapPickerCustom=renderMapPicker;
renderMapPicker=function(){prevRenderMapPickerCustom();renderCustomFleets(selectedMap)};
ensureCustomFleetDialog();
