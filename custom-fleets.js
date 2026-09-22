const CUSTOM_FLEET_KEY='harbordesk-custom-fleets-v1';
let customFleetEditId=null;

function loadCustomFleets(){
  try{return JSON.parse(localStorage.getItem(CUSTOM_FLEET_KEY))||{}}
  catch{return {}}
}
function saveCustomFleets(data){localStorage.setItem(CUSTOM_FLEET_KEY,JSON.stringify(data));window.dispatchEvent(new CustomEvent('hd:custom-fleets-changed',{detail:{at:Date.now()}}))}
function cfMasterId(name){return Number(typeof hdShipImageResolve==='function'?hdShipImageResolve(name)?.id:0)||0}
function cfShipRef(row){return Number(row?.masterId)>0?{id:Number(row.masterId),name:String(row.ship||'')}:String(row?.ship||'')}
function cfMigrateMasterIds(){
 const all=loadCustomFleets();let changed=false;
 for(const fleets of Object.values(all||{}))for(const fleet of (Array.isArray(fleets)?fleets:[]))for(const row of (fleet.ships||[])){if(Number(row.masterId)>0||!row.ship)continue;const id=cfMasterId(row.ship);if(id){row.masterId=id;changed=true}}
 if(changed)localStorage.setItem(CUSTOM_FLEET_KEY,JSON.stringify(all));return changed;
}
function cfEsc(s){return typeof esc==='function'?esc(s):String(s)}
function cfUid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2)}
function cfSyncedDecks(){try{const x=JSON.parse(localStorage.getItem('harbordesk-kancolle-fleets-v1')||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function cfShipsFromSyncedDeck(deck){
 return Array.from({length:6},(_,i)=>{
  const s=deck?.ships?.[i];
  return {ship:String(s?.name||''),gameShipId:Number(s?.gameShipId)||0,masterId:Number(s?.masterId)||0,level:Number(s?.level)||0,nowHp:Number(s?.nowHp)||0,maxHp:Number(s?.maxHp)||0,cond:s?.cond==null?null:Number(s.cond),gear:String(s?.gear||'')};
 });
}
function cfRelinkFleet(map,id){
 const target=String(map||''),fleetId=String(id||'');if(!target||!fleetId)return {ok:false,reason:'missing'};
 const all=loadCustomFleets(),list=all[target]||[],idx=list.findIndex(x=>String(x?.id||'')===fleetId);if(idx<0)return {ok:false,reason:'fleet-missing'};
 const old=list[idx],deckId=Number(old?.detachedSourceDeckId)||0,deck=cfSyncedDecks().find(x=>Number(x?.deckId)===deckId);
 if(!deckId||!deck)return {ok:false,reason:'deck-missing',deckId};
 const next={...old,ships:cfShipsFromSyncedDeck(deck),source:'kancolle-import',sourceDeckId:deckId,sourceSyncedAt:Number(deck.syncedAt)||Date.now(),updatedAt:Date.now()};
 delete next.detachedFromSource;delete next.detachedAt;delete next.detachedSourceDeckId;delete next.detachedSourceSyncedAt;
 list[idx]=next;all[target]=list;saveCustomFleets(all);return {ok:true,row:next};
}
function cfMergeEditedShips(previous=[],incoming=[]){
 let changed=false;
 const ships=Array.from({length:6},(_,i)=>{
  const old=previous?.[i]||{},next=incoming?.[i]||{ship:'',masterId:0,gear:''};
  const oldShip=String(old.ship||'').trim(),nextShip=String(next.ship||'').trim(),oldGear=String(old.gear||'').trim(),nextGear=String(next.gear||'').trim();
  const sameShip=oldShip===nextShip,sameGear=oldGear===nextGear;
  if(!sameShip||!sameGear)changed=true;
  if(sameShip)return {...old,ship:nextShip,masterId:Number(next.masterId)||Number(old.masterId)||0,gear:nextGear};
  return {ship:nextShip,masterId:Number(next.masterId)||0,gear:nextGear};
 });
 return {ships,changed};
}

function ensureCustomFleetDialog(){
  if(document.getElementById('customFleetDialog'))return;
  const dialog=document.createElement('dialog');
  dialog.id='customFleetDialog';
  dialog.innerHTML=`<form method="dialog" id="customFleetForm">
    <h3>自分用編成を保存</h3>
    <label>編成名<input id="customFleetName" maxlength="40" required placeholder="例：5-5 月次用"></label>
    <div class="muted">艦隊台帳に登録した艦娘は、艦娘名を入力すると候補に出るよ。</div>
    <div id="customFleetRows" class="custom-fleet-form-grid"></div>
    <label>編成メモ<textarea id="customFleetMemo" maxlength="500" placeholder="支援あり、制空○○目安、など"></textarea></label>
    <div class="dialog-actions"><button value="cancel" class="ghost">キャンセル</button><button value="default" class="primary">保存</button></div>
  </form>`;
  document.body.appendChild(dialog);
  const rows=document.getElementById('customFleetRows');
  rows.innerHTML=Array.from({length:6},(_,i)=>`<div class="custom-fleet-row"><div class="custom-fleet-no">${i+1}</div><input id="cfShip${i}" class="cf-ship-input" data-cf-index="${i}" list="shipRosterOptions" maxlength="40" placeholder="艦娘名"><input id="cfGear${i}" maxlength="160" placeholder="装備メモ"></div>`).join('');
  document.getElementById('customFleetForm').addEventListener('submit',e=>{
    if(e.submitter?.value==='cancel')return;
    if(!selectedMap)return;
    const name=document.getElementById('customFleetName').value.trim();
    if(!name)return;
    const inputShips=Array.from({length:6},(_,i)=>{const ship=document.getElementById(`cfShip${i}`).value.trim();return {ship,masterId:cfMasterId(ship),gear:document.getElementById(`cfGear${i}`).value.trim()}});
    const memo=document.getElementById('customFleetMemo').value.trim();
    const all=loadCustomFleets();
    all[selectedMap]=all[selectedMap]||[];
    let detached=false;
    if(customFleetEditId){
      const idx=all[selectedMap].findIndex(x=>x.id===customFleetEditId);
      if(idx>=0){
        const old=all[selectedMap][idx],merged=cfMergeEditedShips(old.ships||[],inputShips),next={...old,name,ships:merged.ships,memo,updatedAt:Date.now()};
        if(merged.changed&&old.source==='kancolle-import'){
          detached=true;next.source='manual';next.detachedFromSource='kancolle-import';next.detachedAt=Date.now();next.detachedSourceDeckId=Number(old.sourceDeckId)||0;next.detachedSourceSyncedAt=Number(old.sourceSyncedAt)||0;delete next.sourceDeckId;delete next.sourceSyncedAt;
        }
        all[selectedMap][idx]=next;
      }
    }else{
      all[selectedMap].push({id:cfUid(),name,ships:inputShips,memo,createdAt:Date.now(),updatedAt:Date.now()});
    }
    const editing=!!customFleetEditId;
    saveCustomFleets(all);
    customFleetEditId=null;
    window.hdToast?.(detached?'手動編集したのでゲーム同期の自動追従から切り離したよ':editing?'自分用編成を更新したよ':'自分用編成を保存したよ');
    setTimeout(()=>renderCustomFleets(selectedMap),0);
  });
}

function openCustomFleetDialog(item=null){
  ensureCustomFleetDialog();
  if(typeof refreshShipRosterOptions==='function')refreshShipRosterOptions();
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
    const rows=(item.ships||[]).map((s,i)=>{if(!s.ship&&!s.gear)return '';const image=s.ship&&typeof hdShipImageThumbHtml==='function'?hdShipImageThumbHtml(cfShipRef(s),'custom-fleet-thumb'):'';return `<div class="custom-fleet-saved-row"><span>${i+1}</span>${image}<div><b>${cfEsc(s.ship||'未入力')}</b><small>${cfEsc(s.gear||'装備メモなし')}</small></div></div>`}).join('');
    const linked=item.source==='kancolle-import'&&Number(item.sourceDeckId)>0,detached=item.detachedFromSource==='kancolle-import';
    const sourceMeta=linked?`<span class="custom-fleet-source sync">ゲーム同期・第${Number(item.sourceDeckId)}艦隊・自動追従</span>`:detached?'<span class="custom-fleet-source detached">手動編成・ゲーム同期から切り離し</span>':'<span class="custom-fleet-source manual">手動編成</span>';
    const relink=detached&&Number(item.detachedSourceDeckId)>0?`<button class="ghost small" data-cf-relink="${item.id}">ゲーム同期に戻す</button>`:'';
    return `<article class="custom-fleet-card" data-cf-id="${item.id}"><div class="custom-fleet-head"><div><strong>${cfEsc(item.name)}</strong><div class="custom-fleet-meta"><span class="muted">${new Date(item.updatedAt||item.createdAt).toLocaleString('ja-JP')} 更新</span>${sourceMeta}</div></div><div class="custom-fleet-actions">${relink}<button class="ghost small" data-cf-edit="${item.id}">編集</button><button class="ghost small" data-cf-delete="${item.id}">削除</button></div></div><div class="custom-fleet-saved-list">${rows||'<div class="muted">艦娘はまだ未入力</div>'}</div>${item.memo?`<p class="custom-fleet-memo">${cfEsc(item.memo)}</p>`:''}</article>`;
  }).join(''):'<div class="muted">この海域の自分用編成はまだ保存されてないよ。</div>';
  host.innerHTML=`<div class="custom-fleet-title"><div><div class="eyebrow">MY FLEET</div><h4>自分用編成</h4></div><button class="primary small" id="addCustomFleet">＋ 編成を保存</button></div>${saved}`;
  if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(host);
  document.getElementById('addCustomFleet').onclick=()=>openCustomFleetDialog();
}

document.addEventListener('change',e=>{
  if(e.target.matches('.cf-ship-input')&&typeof findRosterShip==='function'){
    const item=findRosterShip(e.target.value.trim());
    if(item){const gear=document.getElementById(`cfGear${e.target.dataset.cfIndex}`);if(gear&&!gear.value.trim()&&item.gear)gear.value=item.gear;}
  }
});

document.addEventListener('click',e=>{
  const relink=e.target.closest('[data-cf-relink]');
  if(relink&&selectedMap){const result=cfRelinkFleet(selectedMap,relink.dataset.cfRelink);if(result.ok){renderCustomFleets(selectedMap);window.hdToast?.('最新のゲーム同期艦隊へ戻したよ')}else window.hdToast?.('同期元の現在艦隊が見つからないよ。先にゲーム同期してね','warn');return}
  const edit=e.target.closest('[data-cf-edit]');
  if(edit&&selectedMap){const item=(loadCustomFleets()[selectedMap]||[]).find(x=>x.id===edit.dataset.cfEdit);if(item)openCustomFleetDialog(item);return}
  const del=e.target.closest('[data-cf-delete]');
  if(del&&selectedMap){
    const map=selectedMap,all=loadCustomFleets(),list=all[map]||[],i=list.findIndex(x=>x.id===del.dataset.cfDelete);if(i<0)return;
    const [item]=list.splice(i,1);all[map]=list;saveCustomFleets(all);renderCustomFleets(map);
    window.hdToastAction?.(`${item.name||'自分用編成'} を削除したよ`,'元に戻す',()=>{const current=loadCustomFleets(),rows=current[map]||[];if(!rows.some(x=>x.id===item.id)){rows.splice(Math.min(i,rows.length),0,item);current[map]=rows;saveCustomFleets(current);if(selectedMap===map)renderCustomFleets(map);window.hdToast?.('元に戻したよ')}});
  }
});

const prevRenderMapPickerCustom=renderMapPicker;
renderMapPicker=function(){prevRenderMapPickerCustom();renderCustomFleets(selectedMap)};
cfMigrateMasterIds();ensureCustomFleetDialog();
window.addEventListener('hd:ship-images-changed',()=>{if(typeof selectedMap!=='undefined'&&selectedMap)renderCustomFleets(selectedMap)});
window.addEventListener('hd:ship-images-ready',()=>{if(typeof selectedMap!=='undefined'&&selectedMap)renderCustomFleets(selectedMap)});

window.cfMergeEditedShips=cfMergeEditedShips;

function cfOpenMapPanel(){
 if(typeof selectedMap==='undefined'||!selectedMap)return false;
 const card=document.getElementById('selectedMapCard');if(!card)return false;
 let pane=document.getElementById('hdFallbackMineTools');
 if(!pane){pane=document.createElement('div');pane.id='hdFallbackMineTools';card.appendChild(pane)}
 pane.className='custom-fleet-fallback map-tab-pane active';
 pane.dataset.mapPane='mine';
 renderCustomFleets(selectedMap);
 const fleet=document.getElementById('customFleetPanel');
 if(fleet&&fleet.parentElement!==pane)pane.appendChild(fleet);
 if(typeof window.hdRenderSortieReadiness==='function')window.hdRenderSortieReadiness();
 if(typeof window.hdSPRender==='function')window.hdSPRender();
 if(typeof window.hdWSShowElement==='function')window.hdWSShowElement(pane,true);else pane.scrollIntoView({behavior:'smooth',block:'start'});
 return true;
}
window.cfOpenMapPanel=cfOpenMapPanel;

window.cfRelinkFleet=cfRelinkFleet;
