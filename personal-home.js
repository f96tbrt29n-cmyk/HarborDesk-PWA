const HD_PH_LAST_EXPORT_KEY='harbordesk-last-external-backup-v1';
const HD_PH_DB='HarborDeskSafety';
const HD_PH_STORE='snapshots';
const HD_PH_MAX_SNAPSHOTS=3;
const HD_PH_COLLAPSE_KEY='harbordesk-home-collapse-v1';
const HD_PH_ORDER_KEY='harbordesk-personal-home-order-v1';
const HD_PH_ORDER_LEGACY_KEY='harbordesk-home-order-v1';
const HD_PH_COMPACT_KEY='harbordesk-home-compact-v1';
const HD_PH_RESOURCE_THRESHOLD_KEY='harbordesk-resource-thresholds-v1';

function hdPHCollapseLoad(){try{const x=JSON.parse(localStorage.getItem(HD_PH_COLLAPSE_KEY)||'{}');return x&&typeof x==='object'?x:{}}catch{return {}}}
function hdPHCollapseSave(v){try{localStorage.setItem(HD_PH_COLLAPSE_KEY,JSON.stringify(v||{}))}catch{}}
function hdPHCompactLoad(){try{const x=JSON.parse(localStorage.getItem(HD_PH_COMPACT_KEY)||'null');return x&&typeof x==='object'?x:{enabled:false,previous:null}}catch{return {enabled:false,previous:null}}}
function hdPHCompactSave(v){try{localStorage.setItem(HD_PH_COMPACT_KEY,JSON.stringify(v||{enabled:false,previous:null}))}catch{}}
function hdPHCompactState(){
 const coverage=hdPHSyncCoverage(),attention=hdPHAttentionItems(9),next=hdPHNextTimers(3),fleets=hdPHFleetSummary(),condition=hdPHFleetCondition();
 return {
  coverage:!!coverage.complete,
  attention:attention.length===0,
  next:next.length===0,
  resources:false,
  fleets:fleets.length===0||fleets.every(x=>!x.onMission),
  condition:!!condition.ready,
  usual:true,
  favorites:true,
  recent:true,
  snapshots:true
 };
}
function hdPHSetCompact(enabled){
 const meta=hdPHCompactLoad();
 if(enabled){
  if(!meta.enabled)meta.previous=hdPHCollapseLoad();
  meta.enabled=true;hdPHCompactSave(meta);hdPHCollapseSave(hdPHCompactState());
  window.hdToast?.('ホームをコンパクト表示にしたよ','info',1100);
 }else{
  const previous=meta.previous&&typeof meta.previous==='object'?meta.previous:{};
  hdPHCollapseSave(previous);hdPHCompactSave({enabled:false,previous:null});
  window.hdToast?.('ホームを通常表示に戻したよ','info',1100);
 }
 hdPHApplyCollapsed();return !!enabled;
}
function hdPHToggleCompact(){return hdPHSetCompact(!hdPHCompactLoad().enabled)}

function hdPHCollapseSpecs(){return [
 {key:'coverage',selector:'.hd-ph-coverage-block'},
 {key:'attention',selector:'.hd-ph-attention-block'},
 {key:'next',selector:'.hd-ph-next-block'},
 {key:'resources',selector:'.hd-ph-resource-block'},
 {key:'fleets',selector:'.hd-ph-fleet-block'},
 {key:'condition',selector:'.hd-ph-condition-block'},
 {key:'usual',selector:'.hd-ph-usual-block'},
 {key:'favorites',title:'★ よく使う機能'},
 {key:'recent',title:'最近使った機能'},
 {key:'snapshots',title:'端末内セーフティスナップショット'}
]}
function hdPHOrderDefault(){return ['coverage','attention','next','resources','fleets','condition']}
function hdPHOrderLoad(){
 const def=hdPHOrderDefault();try{
  let rows=null;
  try{const saved=JSON.parse(localStorage.getItem(HD_PH_ORDER_KEY)||'null');if(Array.isArray(saved))rows=saved}catch{}
  if(!Array.isArray(rows)){
   let legacy=[];try{const saved=JSON.parse(localStorage.getItem(HD_PH_ORDER_LEGACY_KEY)||'[]');legacy=Array.isArray(saved)?saved:[]}catch{}
   const looksPersonal=legacy.some(x=>def.includes(x)&&x!=='resources');
   rows=looksPersonal?legacy:[];
   if(looksPersonal)try{localStorage.setItem(HD_PH_ORDER_KEY,JSON.stringify(rows))}catch{}
  }
  const valid=rows.filter((x,i)=>def.includes(x)&&rows.indexOf(x)===i);
  return [...valid,...def.filter(x=>!valid.includes(x))];
 }catch{return def}
}
function hdPHOrderSave(rows){try{localStorage.setItem(HD_PH_ORDER_KEY,JSON.stringify(Array.isArray(rows)?rows:hdPHOrderDefault()))}catch{}}
function hdPHOrderSpecs(){const map=new Map(hdPHCollapseSpecs().map(x=>[x.key,x]));return hdPHOrderLoad().map(key=>map.get(key)).filter(Boolean)}
function hdPHApplyOrder(){
 const host=document.getElementById('hdPersonalHome');if(!host)return;
 const anchor=hdPHFindBlock(hdPHCollapseSpecs().find(x=>x.key==='usual'),host);
 if(!anchor)return;
 const order=hdPHOrderLoad();
 for(const key of order){const spec=hdPHCollapseSpecs().find(x=>x.key===key),block=hdPHFindBlock(spec,host);if(block)host.insertBefore(block,anchor)}
 for(let i=0;i<order.length;i++){
  const spec=hdPHCollapseSpecs().find(x=>x.key===order[i]),block=hdPHFindBlock(spec,host),actions=block?.querySelector(':scope > .hd-ph-sub > .hd-ph-collapse-actions');
  if(!actions)continue;
  let up=actions.querySelector('[data-ph-order-up]');if(!up){up=document.createElement('button');up.type='button';up.className='ghost small hd-ph-order-btn';up.dataset.phOrderUp=order[i];up.textContent='↑';actions.insertBefore(up,actions.querySelector('[data-ph-collapse]'))}
  let down=actions.querySelector('[data-ph-order-down]');if(!down){down=document.createElement('button');down.type='button';down.className='ghost small hd-ph-order-btn';down.dataset.phOrderDown=order[i];down.textContent='↓';actions.insertBefore(down,actions.querySelector('[data-ph-collapse]'))}
  up.dataset.phOrderUp=order[i];down.dataset.phOrderDown=order[i];up.disabled=i===0;down.disabled=i===order.length-1;
  up.setAttribute('aria-label',(block.querySelector(':scope > .hd-ph-sub > strong')?.textContent?.trim()||'カード')+'を上へ');
  down.setAttribute('aria-label',(block.querySelector(':scope > .hd-ph-sub > strong')?.textContent?.trim()||'カード')+'を下へ');
 }
 const top=host.querySelector(':scope > .section-head');
 if(top&&!top.querySelector('[data-ph-reset-order]')){const b=document.createElement('button');b.type='button';b.className='ghost small hd-ph-reset-order';b.dataset.phResetOrder='1';b.textContent='並びを戻す';top.appendChild(b)}
}
function hdPHMoveOrder(key,delta){
 const rows=hdPHOrderLoad(),i=rows.indexOf(String(key||'')),j=i+Number(delta||0);
 if(i<0||j<0||j>=rows.length)return false;
 [rows[i],rows[j]]=[rows[j],rows[i]];hdPHOrderSave(rows);hdPHApplyOrder();return true;
}
function hdPHResetOrder(){try{localStorage.removeItem(HD_PH_ORDER_KEY)}catch{}hdPHApplyOrder();window.hdToast?.('ホームの並び順を初期状態に戻したよ','info',1100);return true}

function hdPHFindBlock(spec,host=document.getElementById('hdPersonalHome')){
 if(!host)return null;
 if(spec?.selector)return host.querySelector(spec.selector);
 return [...host.querySelectorAll('.hd-ph-block')].find(x=>x.querySelector(':scope > .hd-ph-sub > strong')?.textContent?.trim()===spec?.title)||null;
}
function hdPHSetCollapsed(key,collapsed){
 const state=hdPHCollapseLoad();state[String(key||'')]=!!collapsed;hdPHCollapseSave(state);hdPHApplyCollapsed();return !!collapsed;
}
function hdPHToggleCollapsed(key){const state=hdPHCollapseLoad();return hdPHSetCollapsed(key,!state[String(key||'')])}
function hdPHExpandAll(){hdPHCollapseSave({});hdPHCompactSave({enabled:false,previous:null});hdPHApplyCollapsed();window.hdToast?.('ホームのカードをすべて開いたよ','info',1100);return true}
function hdPHApplyCollapsed(){
 const host=document.getElementById('hdPersonalHome');if(!host)return;
 const compactMeta=hdPHCompactLoad(),state=compactMeta.enabled?hdPHCompactState():hdPHCollapseLoad();
 if(compactMeta.enabled)hdPHCollapseSave(state);
 for(const spec of hdPHCollapseSpecs()){
  const block=hdPHFindBlock(spec,host);if(!block)continue;
  block.dataset.phCollapseKey=spec.key;
  const head=block.querySelector(':scope > .hd-ph-sub');if(!head)continue;
  let actions=head.querySelector(':scope > .hd-ph-collapse-actions');
  if(!actions){actions=document.createElement('div');actions.className='hd-ph-collapse-actions';
   for(const child of [...head.children]){
    if(child===head.querySelector(':scope > strong'))continue;
    if(child.tagName==='DIV'){while(child.firstChild)actions.appendChild(child.firstChild);child.remove()}
    else actions.appendChild(child);
   }
   head.appendChild(actions);
  }
  let btn=actions.querySelector('[data-ph-collapse]');if(!btn){btn=document.createElement('button');btn.type='button';btn.className='ghost small hd-ph-collapse-toggle';btn.dataset.phCollapse=spec.key;actions.appendChild(btn)}
  const collapsed=!!state[spec.key];block.classList.toggle('hd-ph-collapsed',collapsed);btn.textContent=collapsed?'開く':'閉じる';btn.setAttribute('aria-expanded',collapsed?'false':'true');btn.setAttribute('aria-label',(head.querySelector('strong')?.textContent?.trim()||'カード')+(collapsed?'を開く':'を閉じる'));
 }
 const top=host.querySelector(':scope > .section-head');
 if(top&&!top.querySelector('[data-ph-expand-all]')){const b=document.createElement('button');b.type='button';b.className='ghost small hd-ph-expand-all';b.dataset.phExpandAll='1';b.textContent='すべて開く';top.appendChild(b)}
 if(top&&!top.querySelector('[data-ph-compact]')){const b=document.createElement('button');b.type='button';b.className='ghost small hd-ph-compact-toggle';b.dataset.phCompact='1';top.appendChild(b)}
 const compactBtn=top?.querySelector('[data-ph-compact]'),compact=hdPHCompactLoad().enabled;
 if(compactBtn){compactBtn.textContent=compact?'通常表示':'コンパクト';compactBtn.setAttribute('aria-pressed',compact?'true':'false')}
 host.classList.toggle('hd-ph-compact-mode',compact);
 hdPHApplyOrder();
}
function hdPHEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdPHHarborData(){const data={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('harbordesk'))data[k]=localStorage.getItem(k)}return data}
function hdPHBytes(data){try{return new Blob([JSON.stringify(data)]).size}catch{return 0}}
function hdPHHealth(){const data=hdPHHarborData();let invalid=0;for(const [k,v] of Object.entries(data)){try{JSON.parse(v)}catch{if(k!==HD_PH_LAST_EXPORT_KEY)invalid++}}return {keys:Object.keys(data).length,bytes:hdPHBytes(data),invalid}}
function hdPHOpenDb(){return new Promise((resolve,reject)=>{if(!('indexedDB' in window)){reject(new Error('IndexedDB unsupported'));return}const req=indexedDB.open(HD_PH_DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(HD_PH_STORE)){const s=db.createObjectStore(HD_PH_STORE,{keyPath:'id'});s.createIndex('at','at')}};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function hdPHProbeSnapshotStore(){
 const id=`__hd-safety-probe-${Date.now()}-${Math.random().toString(16).slice(2)}`,row={id,at:Date.now(),reason:'診断プローブ',payload:{},bytes:0,probe:true};
 let db=null;
 const txDone=(mode,fn)=>new Promise((resolve,reject)=>{const tx=db.transaction(HD_PH_STORE,mode),store=tx.objectStore(HD_PH_STORE);try{fn(store,resolve,reject)}catch(err){reject(err);return}tx.onerror=()=>reject(tx.error||new Error('IndexedDB transaction failed'))});
 try{
  db=await hdPHOpenDb();
  await new Promise((resolve,reject)=>{const tx=db.transaction(HD_PH_STORE,'readwrite');tx.objectStore(HD_PH_STORE).put(row);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('probe write failed'))});
  const found=await new Promise((resolve,reject)=>{const tx=db.transaction(HD_PH_STORE,'readonly'),req=tx.objectStore(HD_PH_STORE).get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error||new Error('probe read failed'))});
  if(!found||found.id!==id||found.probe!==true)throw new Error('probe readback mismatch');
  await new Promise((resolve,reject)=>{const tx=db.transaction(HD_PH_STORE,'readwrite');tx.objectStore(HD_PH_STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('probe delete failed'))});
  return {ok:true,error:''}
 }catch(err){
  if(db){try{await new Promise((resolve,reject)=>{const tx=db.transaction(HD_PH_STORE,'readwrite');tx.objectStore(HD_PH_STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}catch{}}
  return {ok:false,error:String(err?.message||err||'snapshot store probe failed')}
 }finally{try{db?.close?.()}catch{}}
}
async function hdPHGetSnapshots(){try{const db=await hdPHOpenDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(HD_PH_STORE,'readonly'),req=tx.objectStore(HD_PH_STORE).getAll();req.onsuccess=()=>resolve((req.result||[]).sort((a,b)=>b.at-a.at));req.onerror=()=>reject(req.error)})}catch{return []}}
async function hdPHCreateSnapshot(reason='手動'){const payload=hdPHHarborData(),row={id:`${Date.now()}-${Math.random().toString(16).slice(2)}`,at:Date.now(),reason,payload,bytes:hdPHBytes(payload)};try{const db=await hdPHOpenDb();await new Promise((resolve,reject)=>{const tx=db.transaction(HD_PH_STORE,'readwrite');tx.objectStore(HD_PH_STORE).put(row);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});const rows=await hdPHGetSnapshots();if(rows.length>HD_PH_MAX_SNAPSHOTS){await new Promise((resolve,reject)=>{const tx=db.transaction(HD_PH_STORE,'readwrite'),store=tx.objectStore(HD_PH_STORE);rows.slice(HD_PH_MAX_SNAPSHOTS).forEach(x=>store.delete(x.id));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}await hdPHRender();return true}catch{return false}}
async function hdPHDeleteSnapshot(id){try{const db=await hdPHOpenDb();await new Promise((resolve,reject)=>{const tx=db.transaction(HD_PH_STORE,'readwrite');tx.objectStore(HD_PH_STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});await hdPHRender()}catch{}}
function hdPHValidateHarborData(payload){
 if(!payload||typeof payload!=='object'||Array.isArray(payload))return {ok:false,missing:[],mismatched:[],extra:[],reason:'invalid payload'};
 const expected=new Map(Object.entries(payload).filter(([k,v])=>k.startsWith('harbordesk')&&typeof v==='string')),current=new Map(Object.entries(hdPHHarborData()));
 const missing=[],mismatched=[],extra=[];
 for(const [k,v] of expected){if(!current.has(k))missing.push(k);else if(current.get(k)!==v)mismatched.push(k)}
 for(const k of current.keys())if(!expected.has(k))extra.push(k);
 return {ok:missing.length===0&&mismatched.length===0&&extra.length===0,missing,mismatched,extra}
}
function hdPHApplyHarborData(payload){
 if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new Error('invalid snapshot payload');
 const entries=Object.entries(payload).filter(([k,v])=>k.startsWith('harbordesk')&&typeof v==='string'),keep=new Set(entries.map(([k])=>k));
 for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k?.startsWith('harbordesk')&&!keep.has(k))localStorage.removeItem(k)}
 for(const [k,v] of entries)localStorage.setItem(k,v);
 return entries.length
}
function hdPHRestoreTransaction(payload,before=hdPHHarborData(),applyFn=hdPHApplyHarborData){
 try{
  applyFn(payload);
  const validation=hdPHValidateHarborData(payload);
  if(!validation.ok)throw Object.assign(new Error('snapshot restore validation failed'),{validation});
  return {ok:true,validation,rollback:null}
 }catch(error){
  let rollback={ok:false,missing:[],mismatched:[],extra:[]};
  try{hdPHApplyHarborData(before);rollback=hdPHValidateHarborData(before)}catch(rollbackError){rollback={ok:false,error:rollbackError,missing:[],mismatched:[],extra:[]}}
  return {ok:false,error,validation:error?.validation||null,rollback}
 }
}
async function hdPHRestoreSnapshot(id){
 const rows=await hdPHGetSnapshots(),row=rows.find(x=>x.id===id);if(!row)return false;
 if(!confirm(`${new Date(row.at).toLocaleString('ja-JP')} の端末内スナップショットへ戻す？\n現在のHarborDeskデータは復元前スナップショットとして先に保存するよ。`))return false;
 const safetyOk=await hdPHCreateSnapshot('復元直前');
 if(safetyOk===false){alert('復元前の安全スナップショットを保存できなかったため、復元を中止したよ。');return false}
 const before=hdPHHarborData(),result=hdPHRestoreTransaction(row.payload||{},before);
 if(!result.ok){
  console.warn('snapshot restore validation failed',result);
  if(result.rollback?.ok)alert('スナップショット復元後の検証で不一致を検出したため、直前のデータへ自動で戻したよ。');
  else alert('スナップショット復元後の検証に失敗し、自動で元へ戻しきれなかったよ。保存済みの別スナップショットかJSONバックアップから復元してね。');
  return false
 }
 location.reload();return true
}
function hdPHSectionTitle(id){const el=document.getElementById(id);return el?.querySelector(':scope > .section-head h2, :scope h2, :scope h3, :scope h4')?.textContent?.trim()||id}
function hdPHResumeRow(){
 const recent=typeof hdQNLoadRecent==='function'?hdQNLoadRecent():(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-quick-nav-recent-v1')||'[]')}catch{return []}})();
 const skip=new Set(['home','hdWorkspaceHero','personalHomeCenter']);
 const row=recent.find(x=>x?.id&&!skip.has(x.id)&&document.getElementById(x.id));
 if(!row)return null;
 const el=document.getElementById(row.id),group=typeof hdQNSectionGroup==='function'?hdQNSectionGroup(row.id):(el?.dataset?.hdWorkspaceGroup||'');
 const groupLabel=group&&typeof hdWSGroupLabel==='function'?hdWSGroupLabel(group):'';
 return {id:row.id,title:hdPHSectionTitle(row.id),group,groupLabel,at:Math.max(0,Number(row.at)||0)};
}
function hdPHSyncInfo(){
 try{
  if(typeof hdWSSyncInfo==='function')return hdWSSyncInfo();
  const raw=JSON.parse(localStorage.getItem('harbordesk-kancolle-sync-v1')||'null');
  if(!raw?.syncedAt)return {state:'missing',label:'未同期',shortLabel:'未同期',detail:'ゲームデータ未同期'};
  const age=Math.max(0,Date.now()-Number(raw.syncedAt||0));let label='たった今';
  if(age>=86400000)label=Math.floor(age/86400000)+'日前';else if(age>=3600000)label=Math.floor(age/3600000)+'時間前';else if(age>=60000)label=Math.floor(age/60000)+'分前';
  return {state:age>21600000?'stale':'fresh',label,shortLabel:label,detail:'ゲーム同期'};
 }catch{return {state:'missing',label:'未同期',shortLabel:'未同期',detail:'ゲームデータ未同期'}}
}
function hdPHOpenSync(){
 if(typeof hdWSOpenSyncStatus==='function')return !!hdWSOpenSyncStatus();
 if(typeof hdQNJump==='function')return !!hdQNJump('kancolleImport');
 const el=document.getElementById('kancolleImport');if(el){el.scrollIntoView({behavior:'smooth',block:'start'});return true}
 return false;
}
function hdPHCanReturnGame(){
 try{return typeof hdWSCanReturnGame==='function'&&!!hdWSCanReturnGame()}catch{return false}
}
function hdPHReturnGame(){
 try{
  if(typeof hdWSReturnToGame==='function'){hdWSReturnToGame();return true}
  location.href='https://play.games.dmm.com/game/kancolle';return true;
 }catch{return false}
}
function hdPHAttentionItems(limit=9){
 let rows=[];try{rows=typeof hdQNMobileAttentionItems==='function'?hdQNMobileAttentionItems():[]}catch{}
 return (Array.isArray(rows)?rows:[]).filter(x=>x&&x.id).slice(0,Math.max(1,Number(limit)||9));
}
function hdPHOpenAttentionItem(id){
 id=String(id||'');if(!id)return false;
 if(id==='kancolleImport'&&typeof hdWSOpenSyncStatus==='function')return !!hdWSOpenSyncStatus();
 if(typeof hdQNJump==='function')return !!hdQNJump(id);
 if(typeof hdWSShowElement==='function')return !!hdWSShowElement(id,true);
 const el=document.getElementById(id);if(el){el.scrollIntoView({behavior:'smooth',block:'start'});return true}
 return false;
}
function hdPHOpenAllAttention(){
 if(typeof hdQNOpenAttention==='function')return !!hdQNOpenAttention();
 const first=hdPHAttentionItems(1)[0];return first?hdPHOpenAttentionItem(first.id):false;
}
function hdPHNextTimers(limit=3){
 const now=Date.now(),rows=[];
 try{
  const appState=typeof window.hdGetAppState==='function'?window.hdGetAppState():{};
  const expeditions=Array.isArray(appState.expeditions)?appState.expeditions:[];
  const docks=Array.isArray(appState.docks)?appState.docks:[];
  for(const x of expeditions){const endsAt=Number(x?.endsAt)||0;if(endsAt>now)rows.push({id:'expeditions',kind:'遠征',icon:'↗',name:String(x?.name||'遠征'),endsAt})}
  for(const x of docks){const endsAt=Number(x?.endsAt)||0;if(endsAt>now)rows.push({id:'docks',kind:'入渠',icon:'♨',name:String(x?.name||'入渠'),endsAt})}
 }catch{}
 return rows.sort((a,b)=>a.endsAt-b.endsAt).slice(0,Math.max(1,Number(limit)||3));
}
function hdPHCountdownText(endsAt,now=Date.now()){
 const ms=Math.max(0,Number(endsAt||0)-Number(now||Date.now()));
 if(ms<=0)return '完了';
 const totalMin=Math.max(1,Math.ceil(ms/60000)),days=Math.floor(totalMin/1440),hours=Math.floor((totalMin%1440)/60),mins=totalMin%60;
 if(days>0)return `あと${days}日${hours?hours+'時間':''}`;
 if(hours>0)return `あと${hours}時間${mins?mins+'分':''}`;
 return `あと${mins}分`;
}
function hdPHUpdateCountdowns(){
 const now=Date.now();
 document.querySelectorAll('[data-ph-countdown]').forEach(el=>{el.textContent=hdPHCountdownText(Number(el.dataset.endsAt)||0,now)});
}
function hdPHClearUsage(){
 const ok=typeof hdQNClearUsage==='function'?hdQNClearUsage():(()=>{try{localStorage.removeItem('harbordesk-quick-nav-usage-v1');return true}catch{return false}})();
 hdPHRender();
 window.hdToast?.('利用回数をリセットしたよ','info',1200);
 return !!ok;
}
function hdPHResourceThresholds(){
 const def={fuel:0,ammo:0,steel:0,bauxite:0,bucket:0};
 try{
  const raw=JSON.parse(localStorage.getItem(HD_PH_RESOURCE_THRESHOLD_KEY)||'{}')||{};
  return Object.fromEntries(Object.keys(def).map(k=>[k,Math.max(0,Math.floor(Number(raw[k])||0))]));
 }catch{return def}
}
function hdPHEnsureResourceThresholdDialog(){
 let d=document.getElementById('hdPHResourceThresholdDialog');if(d)return d;
 d=document.createElement('dialog');d.id='hdPHResourceThresholdDialog';d.className='hd-ph-resource-dialog';
 const rows=[['fuel','燃料'],['ammo','弾薬'],['steel','鋼材'],['bauxite','ボーキ'],['bucket','バケツ']];
 d.innerHTML='<div class="hd-ph-resource-dialog-head"><div><div class="eyebrow">RESOURCE ALERT</div><h3>資源の最低ライン</h3></div><button type="button" class="ghost small" data-ph-resource-threshold-close>閉じる</button></div><p class="muted">0は警告OFF。現在値が設定値を下回るとホームと「要対応」で知らせるよ。</p><div class="hd-ph-resource-threshold-fields">'+rows.map(([key,label])=>'<label><span>'+label+'</span><input type="number" min="0" step="1" inputmode="numeric" data-ph-resource-threshold="'+key+'" value="0"></label>').join('')+'</div><div class="hd-ph-resource-dialog-actions"><button type="button" class="ghost" data-ph-resource-threshold-reset>すべてOFF</button><button type="button" class="primary" data-ph-resource-threshold-save>保存</button></div>';
 document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)d.close?.()});return d;
}
function hdPHOpenResourceThresholds(){
 const d=hdPHEnsureResourceThresholdDialog(),thresholds=hdPHResourceThresholds();
 d.querySelectorAll('[data-ph-resource-threshold]').forEach(input=>{input.value=String(thresholds[input.dataset.phResourceThreshold]||0)});
 if(typeof d.showModal==='function'){if(!d.open)d.showModal()}else d.setAttribute('open','');
 return true;
}
function hdPHSaveResourceThresholds(reset=false){
 const d=hdPHEnsureResourceThresholdDialog(),next={fuel:0,ammo:0,steel:0,bauxite:0,bucket:0};
 if(!reset)d.querySelectorAll('[data-ph-resource-threshold]').forEach(input=>{next[input.dataset.phResourceThreshold]=Math.max(0,Math.floor(Number(input.value)||0))});
 try{localStorage.setItem(HD_PH_RESOURCE_THRESHOLD_KEY,JSON.stringify(next))}catch{}
 if(typeof d.close==='function'&&d.open)d.close();else d.removeAttribute('open');
 window.dispatchEvent(new CustomEvent('hd:resource-thresholds',{detail:next}));
 hdPHRender();window.hdToast?.(reset?'資源の最低ラインをすべてOFFにしたよ':'資源の最低ラインを保存したよ','info',1200);return next;
}
function hdPHResourceSummary(){
 let stateResources={};try{stateResources=(typeof window.hdGetAppState==='function'?window.hdGetAppState()?.resources:null)||{}}catch{}
 let materials={};try{materials=JSON.parse(localStorage.getItem('harbordesk-kancolle-materials-v1')||'{}')||{}}catch{}
 const thresholds=hdPHResourceThresholds();
 const rows=[
  {key:'fuel',label:'燃料',icon:'⛽',value:stateResources.fuel},
  {key:'ammo',label:'弾薬',icon:'●',value:stateResources.ammo},
  {key:'steel',label:'鋼材',icon:'◆',value:stateResources.steel},
  {key:'bauxite',label:'ボーキ',icon:'▲',value:stateResources.bauxite},
  {key:'bucket',label:'バケツ',icon:'♨',value:materials.bucket}
 ].map(x=>{const number=(x.value===''||x.value==null||!Number.isFinite(Number(x.value)))?null:Math.max(0,Number(x.value)),threshold=Math.max(0,Number(thresholds[x.key])||0);return {...x,number,threshold,low:number!=null&&threshold>0&&number<threshold}});
 const savedAt=Math.max(0,Number(stateResources.savedAt)||0,Number(materials.syncedAt)||0),alerts=rows.filter(x=>x.low);
 return {rows,savedAt,alerts,hasAny:rows.some(x=>x.number!=null)};
}
function hdPHResourceAgeLabel(at){
 at=Math.max(0,Number(at)||0);if(!at)return '更新時刻なし';
 const age=Math.max(0,Date.now()-at);
 if(age<60000)return 'たった今';
 if(age<3600000)return Math.floor(age/60000)+'分前';
 if(age<86400000)return Math.floor(age/3600000)+'時間前';
 return Math.floor(age/86400000)+'日前';
}
function hdPHFleetSummary(){
 let rows=[];try{
  const raw=typeof hdKcCurrentFleets==='function'?hdKcCurrentFleets():JSON.parse(localStorage.getItem('harbordesk-kancolle-fleets-v1')||'[]');
  rows=Array.isArray(raw)?raw:[];
 }catch{}
 const now=Date.now();
 return rows.slice().sort((a,b)=>Number(a?.deckId||0)-Number(b?.deckId||0)).slice(0,4).map(deck=>{
  const ships=Array.isArray(deck?.ships)?deck.ships:[],flag=ships[0]||{},mission=Array.isArray(deck?.mission)?deck.mission:[];
  const stateCode=Number(mission[0])||0,missionId=Number(mission[1])||0,endsAt=Number(mission[2])||0;
  const onMission=stateCode>0&&missionId>0;
  let status='待機',detail=ships.length?ships.length+'隻':'編成なし';
  if(onMission){
   const name=typeof hdKcExpeditionName==='function'?hdKcExpeditionName(missionId):('遠征 '+missionId);
   status=endsAt>now?'遠征中':'帰投確認';
   detail=name+(endsAt>now?'・'+hdPHCountdownText(endsAt,now):'');
  }
  return {deckId:Number(deck?.deckId)||0,name:String(deck?.name||('第'+(Number(deck?.deckId)||'?')+'艦隊')),shipCount:ships.length,flagship:String(flag?.name||''),flagshipLevel:Math.max(0,Number(flag?.level)||0),status,detail,onMission,endsAt,syncedAt:Math.max(0,Number(deck?.syncedAt)||0)};
 });
}
function hdPHOpenGameFleets(){
 try{if(typeof hdKcEnsureImport==='function')hdKcEnsureImport()}catch{}
 if(typeof hdQNRecordRecent==='function')hdQNRecordRecent('kancolleImport');
 if(typeof hdWSShowElement==='function')hdWSShowElement('kancolleImport',true);
 else document.getElementById('kancolleImport')?.scrollIntoView({behavior:'smooth',block:'start'});
 setTimeout(()=>document.getElementById('hdKcCurrentFleets')?.scrollIntoView({behavior:'smooth',block:'start'}),100);
 return true;
}
function hdPHFleetHtml(rows){
 if(!Array.isArray(rows)||!rows.length)return '<div class="hd-ph-fleet-empty"><span>⚓</span><div><strong>現在艦隊は未同期</strong><small>母港を同期すると第1〜第4艦隊がここに出るよ。</small></div></div>';
 return rows.map(x=>'<button type="button" data-ph-fleets class="'+(x.onMission?'mission':'')+'"><span>第'+(x.deckId||'?')+'艦隊</span><strong>'+hdPHEsc(x.name)+'</strong><small>'+(x.flagship?hdPHEsc(x.flagship)+' Lv.'+x.flagshipLevel:'旗艦未取得')+' ・ '+x.shipCount+'隻</small><em>'+hdPHEsc(x.status)+'</em><i>'+hdPHEsc(x.detail)+'</i></button>').join('');
}

function hdPHFleetCondition(){
 let fleets=[];try{
  const raw=typeof hdKcCurrentFleets==='function'?hdKcCurrentFleets():JSON.parse(localStorage.getItem('harbordesk-kancolle-fleets-v1')||'[]');
  fleets=Array.isArray(raw)?raw:[];
 }catch{}
 const ships=fleets.flatMap(deck=>(Array.isArray(deck?.ships)?deck.ships:[]).map(ship=>({...ship,deckId:Number(deck?.deckId)||0,deckName:String(deck?.name||'')})));
 const hpLow=ships.filter(x=>Number(x?.maxHp)>0&&Number(x?.nowHp)>=0&&(Number(x.nowHp)/Number(x.maxHp))<0.5);
 const condLow=ships.filter(x=>x?.cond!=null&&Number.isFinite(Number(x.cond))&&Number(x.cond)<30);
 const affected=[...new Map([...hpLow,...condLow].map(x=>[Number(x?.gameShipId)>0?'id:'+Number(x.gameShipId):'fleet:'+Number(x?.deckId||0)+':'+String(x?.name||''),x])).values()];
 return {fleetCount:fleets.length,shipCount:ships.length,hpLowCount:hpLow.length,condLowCount:condLow.length,affected:affected.slice(0,3).map(x=>({name:String(x?.name||'未取得'),deckId:Number(x?.deckId)||0,nowHp:Math.max(0,Number(x?.nowHp)||0),maxHp:Math.max(0,Number(x?.maxHp)||0),cond:Math.max(0,Number(x?.cond)||0)})),ready:ships.length>0&&hpLow.length===0&&condLow.length===0,hasData:ships.length>0};
}
function hdPHFleetConditionHtml(x){
 if(!x?.hasData)return '<div class="hd-ph-condition-empty"><span>⚓</span><div><strong>コンディション未取得</strong><small>母港を同期するとHPとcondを確認できるよ。</small></div></div>';
 const items=[
  '<div class="hd-ph-condition-metric '+(x.hpLowCount?'warn':'ok')+'"><span>HP50%未満</span><strong>'+x.hpLowCount+'隻</strong></div>',
  '<div class="hd-ph-condition-metric '+(x.condLowCount?'warn':'ok')+'"><span>cond30未満</span><strong>'+x.condLowCount+'隻</strong></div>',
  '<div class="hd-ph-condition-metric"><span>同期艦</span><strong>'+x.shipCount+'隻</strong></div>'
 ].join('');
 const names=x.affected.length?'<div class="hd-ph-condition-names">'+x.affected.map(a=>'<span>'+hdPHEsc(a.name)+'<small> 第'+(a.deckId||'?')+'艦隊 ・ HP '+a.nowHp+'/'+a.maxHp+' ・ cond '+a.cond+'</small></span>').join('')+'</div>':'';
 return '<div class="hd-ph-condition-grid">'+items+'</div>'+names;
}
function hdPHSyncCoverage(){
 let sync=null;try{sync=JSON.parse(localStorage.getItem('harbordesk-kancolle-sync-v1')||'null')}catch{}
 const defs=[
  {key:'ships',label:'艦娘',countKey:'ships',core:true},
  {key:'equipment',label:'装備',countKey:'equipment',core:true},
  {key:'resources',label:'資源',countKey:'materials',core:true},
  {key:'fleets',label:'艦隊',countKey:'decks',core:true},
  {key:'quests',label:'任務',countKey:'quests',core:true},
  {key:'docks',label:'入渠',countKey:'docks',core:true},
  {key:'sorties',label:'出撃',countKey:'sorties',core:false}
 ];
 let coverage={};
 if(sync){
  try{coverage=typeof hdKcCoverageForSync==='function'?hdKcCoverageForSync(sync):(sync.coverage&&typeof sync.coverage==='object'?sync.coverage:{})}catch{coverage=sync.coverage||{}}
 }
 const rows=defs.map(d=>({...d,captured:!!coverage?.[d.key],count:Math.max(0,Number(sync?.[d.countKey])||0)}));
 const core=rows.filter(x=>x.core),coreDone=core.filter(x=>x.captured).length,missing=core.filter(x=>!x.captured);
 let recommendation={state:'missing',title:'まず艦これから同期',detail:'母港・装備・任務・入渠を一度開くと主要データを揃えられるよ。'};
 if(sync){
  try{if(typeof hdKcNextCaptureHint==='function')recommendation=hdKcNextCaptureHint(sync)}catch{}
  if(!recommendation?.title){
   const first=missing[0];recommendation=first?{state:'needed',title:first.label+'を取得',detail:'艦これ側の該当画面を開いてからHarborDeskへ送ってね。'}:{state:'complete',title:'主要データは取得済み',detail:'必要な時だけ再同期すればOK。'};
  }
 }
 return {sync,rows,coreDone,coreTotal:core.length,missingCore:missing.map(x=>x.key),complete:!!sync&&missing.length===0,optionalSorties:rows.find(x=>x.key==='sorties')?.captured||false,recommendation};
}
function hdPHSyncCoverageHtml(x){
 const rows=(x?.rows||[]).map(r=>'<span class="'+(r.captured?'ok':'missing')+(r.core?'':' optional')+'"><b>'+hdPHEsc(r.label)+'</b><i>'+(r.captured?(r.count>0?r.count:'取得済み・0'):(r.core?'未取得':'任意'))+'</i></span>').join('');
 const rec=x?.recommendation||{};
 return '<div class="hd-ph-coverage-chips">'+rows+'</div><div class="hd-ph-coverage-next '+hdPHEsc(rec.state||'')+'"><span>次のおすすめ</span><strong>'+hdPHEsc(rec.title||'同期状態を確認')+'</strong><small>'+hdPHEsc(rec.detail||'')+'</small></div>';
}
function hdPHShortcutRows(){
 const pins=typeof hdQNLoadPins==='function'?hdQNLoadPins():(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-quick-nav-pins-v1')||'[]')}catch{return []}})();
 const recent=typeof hdQNLoadRecent==='function'?hdQNLoadRecent():(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-quick-nav-recent-v1')||'[]')}catch{return []}})();
 const usage=typeof hdQNLoadUsage==='function'?hdQNLoadUsage():(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-quick-nav-usage-v1')||'{}')||{}}catch{return {}}})();
 const usual=Object.entries(usage).filter(([id,row])=>document.getElementById(id)&&id!=='personalHomeCenter'&&Math.max(0,Number(row?.count)||0)>0).map(([id,row])=>({id,count:Math.max(0,Number(row?.count)||0),lastAt:Math.max(0,Number(row?.lastAt)||0)})).sort((a,b)=>b.count-a.count||b.lastAt-a.lastAt).slice(0,4);
 const usualSet=new Set(usual.map(x=>x.id)),pinRows=pins.filter(id=>document.getElementById(id)).slice(0,8),pinSet=new Set(pinRows);
 const recentRows=recent.map(x=>x.id).filter(id=>document.getElementById(id)&&!pinSet.has(id)&&!usualSet.has(id)).slice(0,6);
 return {usual,pins:pinRows,recent:recentRows};
}
function hdPHExternalText(){
 const raw=localStorage.getItem(HD_PH_LAST_EXPORT_KEY),at=Number(raw)||0;
 let syncAt=0;try{syncAt=Math.max(0,Number(JSON.parse(localStorage.getItem('harbordesk-kancolle-sync-v1')||'null')?.syncedAt)||0)}catch{}
 if(!at)return {at:0,syncAt,days:null,afterSync:syncAt>0,label:'未記録',state:'warn',due:true,title:'外部バックアップ未作成',detail:'JSONを書き出して、Safariのデータ消去や端末故障に備えておこう。'};
 const days=Math.max(0,Math.floor((Date.now()-at)/86400000)),afterSync=syncAt>at,dueByAge=days>=14,due=afterSync||dueByAge;
 if(afterSync)return {at,syncAt,days,afterSync:true,label:'同期後未保存',state:'warn',due:true,title:'同期後のバックアップ未保存',detail:'艦これ同期後にデータが更新されてるよ。共有して保存しておこう。'};
 return {at,syncAt,days,afterSync:false,label:days===0?'今日':days===1?'1日前':`${days}日前`,state:due?'warn':'ok',due,title:due?'外部バックアップを更新':'外部バックアップは新しい',detail:due?`前回のJSON書き出しから${days}日。そろそろ更新がおすすめ。`:'最近JSONを書き出してあるよ。'};
}
async function hdPHRender(){const host=document.getElementById('hdPersonalHome');if(!host)return;const {usual,pins,recent}=hdPHShortcutRows(),resume=hdPHResumeRow(),sync=hdPHSyncInfo(),returnGame=hdPHCanReturnGame(),coverage=hdPHSyncCoverage(),attentionAll=hdPHAttentionItems(9),attention=attentionAll.slice(0,4),nextTimers=hdPHNextTimers(3),resource=hdPHResourceSummary(),fleets=hdPHFleetSummary(),condition=hdPHFleetCondition(),health=hdPHHealth(),snaps=await hdPHGetSnapshots(),ext=hdPHExternalText();const cards=(rows,empty)=>rows.length?rows.map(id=>`<button type="button" class="hd-ph-shortcut" data-ph-jump="${hdPHEsc(id)}"><strong>${hdPHEsc(hdPHSectionTitle(id))}</strong><small>${hdPHEsc(id)}</small></button>`).join(''):`<div class="empty">${empty}</div>`;const usualCards=usual.length?usual.map((x,index)=>`<button type="button" class="hd-ph-shortcut hd-ph-usual" data-ph-jump="${hdPHEsc(x.id)}"><span class="hd-ph-rank">${index+1}</span><strong>${hdPHEsc(hdPHSectionTitle(x.id))}</strong><small>利用 ${x.count}回</small></button>`).join(''):`<div class="empty">使うほど、よく開く機能がここに自動で並ぶよ。</div>`;host.innerHTML=`<div class="section-head"><div><div class="eyebrow">SHORTCUTS & SAFETY</div><h2>ショートカット・データ保全</h2></div><span class="muted">固定・履歴・バックアップ</span></div>${resume?`<button type="button" class="hd-ph-resume" data-ph-jump="${hdPHEsc(resume.id)}"><span>続きから</span><strong>${hdPHEsc(resume.title)}</strong><small>${resume.groupLabel?hdPHEsc(resume.groupLabel)+' ・ ':''}最後に使った機能</small><i>›</i></button>`:''}${returnGame?'<button type="button" class="hd-ph-return-game" data-ph-return-game aria-label="同期元の艦これへ戻る"><span>⚓</span><div><strong>艦これへ戻る</strong><small>同期元のゲーム画面へ1タップで戻る</small></div><i>›</i></button>':''}${ext.due?`<button type="button" class="hd-ph-backup-alert" data-ph-share-backup aria-label="${hdPHEsc(ext.title)}。JSONを書き出す"><span>⇩</span><div><strong>${hdPHEsc(ext.title)}</strong><small>${hdPHEsc(ext.detail)}</small></div><i>書き出す</i></button>`:''}<button type="button" class="hd-ph-sync ${hdPHEsc(sync.state||'missing')}" data-ph-sync aria-label="ゲーム同期 ${hdPHEsc(sync.label||'未同期')}。タップで同期状態を確認"><span>ゲーム同期</span><strong>${hdPHEsc(sync.shortLabel||sync.label||'未同期')}</strong><small>${sync.state==='fresh'?'最新状態':sync.state==='partial'?'一部未取得':sync.state==='stale'?'更新をおすすめ':'まだ未同期'}</small><i>${sync.state==='fresh'?'✓':'↻'}</i></button><div class="hd-ph-block hd-ph-coverage-block ${coverage.complete?'complete':coverage.sync?'partial':'missing'}"><div class="hd-ph-sub"><strong>同期カバレッジ</strong><div><span class="muted">主要 ${coverage.coreDone}/${coverage.coreTotal}</span><button type="button" class="ghost small" data-ph-sync>${coverage.complete?'詳細':'補完する'}</button></div></div>${hdPHSyncCoverageHtml(coverage)}</div><div class="hd-ph-block hd-ph-attention-block ${attentionAll.length?'has-items':'clear'}"><div class="hd-ph-sub"><strong>要対応</strong><div><span class="muted">${attentionAll.length?attentionAll.length+'件':'なし'}</span>${attentionAll.length?'<button type="button" class="ghost small" data-ph-attention-all>すべて確認</button>':''}</div></div><div class="hd-ph-attention-list">${attention.length?attention.map(x=>`<button type="button" class="tone-${hdPHEsc(x.tone||'normal')}" data-ph-attention="${hdPHEsc(x.id)}"><span>${hdPHEsc(x.icon||'!')}</span><div><strong>${hdPHEsc(x.title||'確認')}</strong><small>${hdPHEsc(x.detail||x.reason||'')}</small></div><i>›</i></button>`).join(''):'<div class="hd-ph-attention-clear"><span>✓</span><div><strong>いま要対応なし</strong><small>遠征・入渠・任務・同期状態をここで確認できるよ。</small></div></div>'}</div></div><div class="hd-ph-block hd-ph-next-block"><div class="hd-ph-sub"><strong>次の予定</strong><span class="muted">${nextTimers.length?nextTimers.length+'件表示':'待機中'}</span></div><div class="hd-ph-next-list">${nextTimers.length?nextTimers.map((x,index)=>`<button type="button" data-ph-jump="${hdPHEsc(x.id)}" class="${index===0?'next':''}"><span>${hdPHEsc(x.icon)}</span><div><strong>${hdPHEsc(x.name)}</strong><small>${hdPHEsc(x.kind)} ・ 完了予定 ${new Date(x.endsAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})}</small></div><b data-ph-countdown data-ends-at="${x.endsAt}">${hdPHEsc(hdPHCountdownText(x.endsAt))}</b></button>`).join(''):'<div class="hd-ph-next-empty"><span>✓</span><div><strong>稼働中タイマーなし</strong><small>遠征や入渠を登録すると、次の完了予定がここに出るよ。</small></div></div>'}</div></div><div class="hd-ph-block hd-ph-resource-block ${resource.alerts.length?'has-alert':''}"><div class="hd-ph-sub"><strong>資源サマリー</strong><div><span class="muted">${hdPHEsc(hdPHResourceAgeLabel(resource.savedAt))}${resource.alerts.length?'・不足 '+resource.alerts.length+'件':''}</span><button type="button" class="ghost small" data-ph-resource-threshold-open>基準</button></div></div><div class="hd-ph-resource-grid">${resource.rows.map(x=>`<button type="button" data-ph-jump="resources" class="${x.number==null?'missing ':''}${x.low?'low':''}" aria-label="${hdPHEsc(x.label)} ${x.number==null?'未取得':x.number.toLocaleString('ja-JP')}${x.threshold>0?' 最低ライン '+x.threshold.toLocaleString('ja-JP'):''}"><span>${hdPHEsc(x.icon)}</span><small>${hdPHEsc(x.label)}</small><strong>${x.number==null?'—':x.number.toLocaleString('ja-JP')}</strong>${x.threshold>0?`<em>最低 ${x.threshold.toLocaleString('ja-JP')}</em>`:''}</button>`).join('')}</div>${resource.hasAny?'':'<div class="hd-ph-resource-note">資源を保存するか、艦これから同期するとここに表示されるよ。</div>'}</div><div class="hd-ph-block hd-ph-fleet-block"><div class="hd-ph-sub"><strong>艦隊サマリー</strong><div><span class="muted">${fleets.length?fleets.length+'艦隊':'未同期'}</span>${fleets.length?'<button type="button" class="ghost small" data-ph-fleets>詳細</button>':''}</div></div><div class="hd-ph-fleet-grid">${hdPHFleetHtml(fleets)}</div></div><div class="hd-ph-block hd-ph-condition-block ${condition.ready?'ready':condition.hasData?'warn':'missing'}"><div class="hd-ph-sub"><strong>艦隊コンディション</strong><div><span class="muted">${condition.hasData?(condition.ready?'問題なし':'要確認'):'未同期'}</span>${condition.hasData?'<button type="button" class="ghost small" data-ph-fleets>艦隊を見る</button>':''}</div></div>${hdPHFleetConditionHtml(condition)}</div><div class="hd-ph-block hd-ph-usual-block"><div class="hd-ph-sub"><strong>いつもの機能</strong><div><span class="muted">利用回数から自動選出</span><button type="button" class="ghost small" data-ph-clear-usage>利用履歴をリセット</button></div></div><div class="hd-ph-shortcuts hd-ph-usual-shortcuts">${usualCards}</div></div><div class="hd-ph-block"><div class="hd-ph-sub"><strong>★ よく使う機能</strong><button type="button" class="ghost small" data-ph-open-nav>編集</button></div><div class="hd-ph-shortcuts">${cards(pins,'クイックナビで★を付けるとここに固定されるよ。')}</div></div><div class="hd-ph-block"><div class="hd-ph-sub"><strong>最近使った機能</strong></div><div class="hd-ph-shortcuts">${cards(recent,'クイックナビから機能を開くと履歴が出るよ。')}</div></div><div class="hd-ph-safety"><div class="hd-ph-metric ${health.invalid?'warn':'ok'}"><span>端末内データ</span><strong>${health.keys}項目</strong><small>${(health.bytes/1024).toFixed(1)} KB</small></div><div class="hd-ph-metric ${health.invalid?'warn':'ok'}"><span>JSON整合性</span><strong>${health.invalid?'要確認':'OK'}</strong><small>${health.invalid?`${health.invalid}件を解析できない`:'破損候補なし'}</small></div><button type="button" class="hd-ph-metric hd-ph-backup-metric ${ext.state}" data-ph-share-backup aria-label="外部バックアップ ${hdPHEsc(ext.label)}。JSONを書き出す"><span>外部バックアップ</span><strong>${hdPHEsc(ext.label)}</strong><small>${ext.due?'タップして更新':'端末故障対策'}</small></button></div><div class="hd-ph-block"><div class="hd-ph-sub"><strong>端末内セーフティスナップショット</strong><div><button type="button" class="ghost small" data-ph-snapshot>今すぐ保存</button><button type="button" class="ghost small" data-ph-share-backup>共有して保存</button><button type="button" class="primary small" data-ph-export>JSONを書き出す</button></div></div><p class="muted">最大3世代。誤操作・復元ミスから同じ端末で戻すためのもの。Safariのサイトデータ消去や端末故障にはJSONバックアップを使ってね。</p><div class="hd-ph-snaps">${snaps.length?snaps.map(x=>`<article><div><strong>${new Date(x.at).toLocaleString('ja-JP')}</strong><small>${hdPHEsc(x.reason)} ・ ${(Number(x.bytes||0)/1024).toFixed(1)} KB</small></div><div><button type="button" class="ghost small" data-ph-restore="${x.id}">復元</button><button type="button" class="ghost small" data-ph-snap-delete="${x.id}">削除</button></div></article>`).join(''):'<div class="empty">まだ端末内スナップショットはないよ。</div>'}</div></div>`;hdPHApplyCollapsed()}
function hdPHEnsure(){if(document.getElementById('personalHomeCenter')){hdPHRender();return}const anchor=document.getElementById('dashboard')||document.getElementById('dailyOpsCenter')||document.querySelector('main section');if(!anchor)return;const sec=document.createElement('section');sec.id='personalHomeCenter';sec.className='advanced-section';sec.innerHTML='<div id="hdPersonalHome"></div>';anchor.insertAdjacentElement('afterend',sec);hdPHRender()}
async function hdPHAutoSnapshot(){const rows=await hdPHGetSnapshots();if(!rows.length||Date.now()-rows[0].at>20*3600000)await hdPHCreateSnapshot('自動（日次）')}
function hdPHInstallBackupHooks(){
 if(window.__hdPHBackupHooks)return;window.__hdPHBackupHooks=true;
 const mark=()=>{localStorage.setItem(HD_PH_LAST_EXPORT_KEY,String(Date.now()));hdPHRender()};
 const oldExport=window.exportBackup;
 if(typeof oldExport==='function'){window.exportBackup=function(){const out=oldExport();mark();return out};const b=document.getElementById('exportBackup');if(b)b.onclick=window.exportBackup}
 const oldShare=window.shareBackup;
 if(typeof oldShare==='function'){window.shareBackup=async function(){const ok=await oldShare();if(ok!==false)mark();return ok};const b=document.getElementById('shareBackup');if(b)b.onclick=window.shareBackup}
 const oldImport=window.importBackup;
 if(typeof oldImport==='function'){window.importBackup=async function(file){return oldImport(file)};const input=document.getElementById('importBackup');if(input)input.onchange=e=>{const f=e.target.files?.[0];if(f)window.importBackup(f)}}
}

document.addEventListener('click',e=>{if(e.target.closest?.('[data-ph-resource-threshold-open]')){hdPHOpenResourceThresholds();return}if(e.target.closest?.('[data-ph-resource-threshold-close]')){const d=document.getElementById('hdPHResourceThresholdDialog');if(d?.open)d.close();else d?.removeAttribute('open');return}if(e.target.closest?.('[data-ph-resource-threshold-save]')){hdPHSaveResourceThresholds(false);return}if(e.target.closest?.('[data-ph-resource-threshold-reset]')){hdPHSaveResourceThresholds(true);return}if(e.target.closest?.('[data-ph-compact]')){hdPHToggleCompact();return}const up=e.target.closest?.('[data-ph-order-up]');if(up){hdPHMoveOrder(up.dataset.phOrderUp,-1);return}const down=e.target.closest?.('[data-ph-order-down]');if(down){hdPHMoveOrder(down.dataset.phOrderDown,1);return}if(e.target.closest?.('[data-ph-reset-order]')){hdPHResetOrder();return}const collapse=e.target.closest?.('[data-ph-collapse]');if(collapse){hdPHToggleCollapsed(collapse.dataset.phCollapse);return}if(e.target.closest?.('[data-ph-expand-all]')){hdPHExpandAll();return}const jump=e.target.closest?.('[data-ph-jump]');if(jump){if(typeof hdQNJump==='function')hdQNJump(jump.dataset.phJump);else document.getElementById(jump.dataset.phJump)?.scrollIntoView({behavior:'smooth',block:'start'});return}if(e.target.closest?.('[data-ph-open-nav]')){if(typeof hdQNOpen==='function')hdQNOpen();return}if(e.target.closest?.('[data-ph-clear-usage]')){hdPHClearUsage();return}if(e.target.closest?.('[data-ph-return-game]')){hdPHReturnGame();return}if(e.target.closest?.('[data-ph-sync]')){hdPHOpenSync();return}const attentionItem=e.target.closest?.('[data-ph-attention]');if(attentionItem){hdPHOpenAttentionItem(attentionItem.dataset.phAttention);return}if(e.target.closest?.('[data-ph-attention-all]')){hdPHOpenAllAttention();return}if(e.target.closest?.('[data-ph-fleets]')){hdPHOpenGameFleets();return}if(e.target.closest?.('[data-ph-snapshot]')){hdPHCreateSnapshot('手動');return}if(e.target.closest?.('[data-ph-share-backup]')){if(typeof window.shareBackup==='function')window.shareBackup();else if(typeof window.exportBackup==='function')window.exportBackup();return}if(e.target.closest?.('[data-ph-export]')){if(typeof window.exportBackup==='function')window.exportBackup();return}const restore=e.target.closest?.('[data-ph-restore]');if(restore){hdPHRestoreSnapshot(restore.dataset.phRestore);return}const del=e.target.closest?.('[data-ph-snap-delete]');if(del&&confirm('この端末内スナップショットを削除する？')){hdPHDeleteSnapshot(del.dataset.phSnapDelete);return}});
window.addEventListener('hd:quick-nav-updated',()=>hdPHRender());
window.addEventListener('hd:kancolle-sync',()=>hdPHRender());
window.addEventListener('hd:kancolle-return-ready',()=>hdPHRender());
window.addEventListener('hd:state-changed',()=>hdPHRender());
window.addEventListener('hd:quest-changed',()=>hdPHRender());
window.addEventListener('hd:timer-changed',()=>hdPHRender());
window.addEventListener('storage',e=>{if(e?.key==='harbordesk-kancolle-sync-v1')hdPHRender()});
window.addEventListener('pageshow',()=>hdPHRender());
window.addEventListener('hd:modules-ready',()=>{setTimeout(()=>{hdPHEnsure();hdPHInstallBackupHooks();hdPHAutoSnapshot()},100)});
window.addEventListener('load',()=>setTimeout(()=>{hdPHEnsure();hdPHInstallBackupHooks();hdPHAutoSnapshot()},1400));
setInterval(hdPHUpdateCountdowns,30000);
