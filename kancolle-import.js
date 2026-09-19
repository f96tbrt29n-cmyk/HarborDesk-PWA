const HD_KC_SYNC_KEY='harbordesk-kancolle-sync-v1';
const HD_KC_FLEETS_KEY='harbordesk-kancolle-fleets-v1';
const HD_KC_MATERIALS_KEY='harbordesk-kancolle-materials-v1';
let HD_KC_IMPORT_PREVIEW=null;

function hdKcEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdKcReadJson(raw){
 if(raw&&typeof raw==='object')return raw;
 let text=String(raw??'').trim();if(!text)throw new Error('JSONが空です');
 text=text.replace(/^\uFEFF/,'').trim();
 if(text.startsWith('svdata='))text=text.slice(7).trim();
 try{return JSON.parse(text)}catch{throw new Error('艦これAPIのJSONとして解析できません')}
}
function hdKcApiData(value){
 const obj=hdKcReadJson(value);
 if(obj&&typeof obj==='object'&&'api_result' in obj){
  if(Number(obj.api_result)!==1)throw new Error('api_result が成功ではありません');
  return obj.api_data;
 }
 return obj;
}
function hdKcMasterShip(id){return window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips?.[String(Number(id))]||null}
function hdKcMasterEquipMap(){
 const map=new Map(),rows=window.HD_KANCOLLE_MASTER_SNAPSHOT?.equipment||{};
 for(const [name,row] of Object.entries(rows))if(Number(row?.id)>0)map.set(Number(row.id),{id:Number(row.id),name,typeName:String(row.typeName||'')});
 return map;
}
function hdKcImportEmpty(){return {ships:new Map(),slotItems:new Map(),materials:new Map(),decks:new Map(),sources:new Set(),completeShips:false,completeSlotItems:false}}
function hdKcImportAdd(out,hint,payload){
 const h=String(hint||''),data=hdKcApiData(payload);if(data==null)return;
 out.sources.add(h||'auto');
 const shipRows=Array.isArray(data?.api_ship)?data.api_ship:Array.isArray(data?.api_ship_data)?data.api_ship_data:null;
 const deckRows=Array.isArray(data?.api_deck_port)?data.api_deck_port:Array.isArray(data?.api_deck_data)?data.api_deck_data:null;
 const matRows=Array.isArray(data?.api_material)?data.api_material:null;
 const slotRows=Array.isArray(data?.api_slot_item)?data.api_slot_item:null;
 if(shipRows)for(const x of shipRows)if(Number(x?.api_id)>0&&Number(x?.api_ship_id)>0)out.ships.set(Number(x.api_id),x);
 if(deckRows)for(const x of deckRows)if(Number(x?.api_id)>0)out.decks.set(Number(x.api_id),x);
 if(matRows)for(const x of matRows)if(Number(x?.api_id)>0)out.materials.set(Number(x.api_id),x);
 if(slotRows)for(const x of slotRows)if(Number(x?.api_id)>0&&Number(x?.api_slotitem_id)>0)out.slotItems.set(Number(x.api_id),x);
 if(Array.isArray(data)){
  const first=data.find(Boolean)||{};
  if('api_slotitem_id' in first){for(const x of data)if(Number(x?.api_id)>0&&Number(x?.api_slotitem_id)>0)out.slotItems.set(Number(x.api_id),x)}
  else if('api_ship_id' in first){for(const x of data)if(Number(x?.api_id)>0&&Number(x?.api_ship_id)>0)out.ships.set(Number(x.api_id),x)}
  else if('api_value' in first){for(const x of data)if(Number(x?.api_id)>0)out.materials.set(Number(x.api_id),x)}
 }
 if(/api_port\/port/.test(h)||/api_get_member\/ship2/.test(h)||(!h&&shipRows&&deckRows))out.completeShips=true;
 if(/api_get_member\/slot_item/.test(h)||(/require_info/.test(h)&&slotRows))out.completeSlotItems=true;
 if(Array.isArray(data)&&data.length&&'api_slotitem_id' in (data.find(Boolean)||{})&&!h)out.completeSlotItems=true;
 if(Array.isArray(data)&&data.length&&'api_ship_id' in (data.find(Boolean)||{})&&!h)out.completeShips=true;
}
function hdKcParseImport(raw){
 const root=hdKcReadJson(raw),out=hdKcImportEmpty();
 if(root?.format==='harbordesk-kancolle-import'&&root.endpoints&&typeof root.endpoints==='object'){
  for(const [k,v] of Object.entries(root.endpoints))hdKcImportAdd(out,k,v);
 }else if(Array.isArray(root?.records)){
  for(const r of root.records)hdKcImportAdd(out,r?.endpoint||r?.path||'',r?.payload??r?.response??r?.data);
 }else if(root&&typeof root==='object'&&!Array.isArray(root)&&!('api_result' in root)&&!('api_ship' in root)&&!('api_ship_data' in root)&&!('api_slot_item' in root)&&!('api_material' in root)){
  let matched=false;
  for(const [k,v] of Object.entries(root)){
   if(/api_(port|api_get_member|kcsapi)|\/kcsapi\//.test(k)||/^(port|ship2|slot_item|material|require_info)$/.test(k)){hdKcImportAdd(out,k,v);matched=true}
  }
  if(!matched)hdKcImportAdd(out,'',root);
 }else hdKcImportAdd(out,'',root);
 if(!out.ships.size&&!out.slotItems.size&&!out.materials.size&&!out.decks.size)throw new Error('艦娘・装備・資源・艦隊データを見つけられませんでした');
 return out;
}
function hdKcPreviewData(parsed){
 const equipMap=hdKcMasterEquipMap(),unknownShips=[...parsed.ships.values()].filter(x=>!hdKcMasterShip(x.api_ship_id)),unknownEquip=[...parsed.slotItems.values()].filter(x=>!equipMap.has(Number(x.api_slotitem_id)));
 return {
  parsed,
  ships:parsed.ships.size,
  slotItems:parsed.slotItems.size,
  materials:parsed.materials.size,
  decks:parsed.decks.size,
  unknownShips:unknownShips.length,
  unknownEquip:unknownEquip.length,
  completeShips:!!parsed.completeShips,
  completeSlotItems:!!parsed.completeSlotItems,
  sources:[...parsed.sources].filter(Boolean)
 };
}
function hdKcEquipLabel(instance,equipMap){
 const master=equipMap.get(Number(instance?.api_slotitem_id)),name=master?.name||`装備ID ${Number(instance?.api_slotitem_id)||'?'}`,star=Math.max(0,Number(instance?.api_level)||0);
 return name+(star?` ★${star}`:'');
}
function hdKcMergeRoster(parsed){
 const now=Date.now(),existing=(()=>{try{const x=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]');return Array.isArray(x)?x:[]}catch{return []}})(),equipMap=hdKcMasterEquipMap(),used=new Set(),gameIds=new Set(parsed.ships.keys()),next=[];
 const byGameId=new Map(existing.map((x,i)=>[Number(x.gameShipId)||0,i]).filter(([id])=>id));
 for(const ship of parsed.ships.values()){
  const gameId=Number(ship.api_id),masterId=Number(ship.api_ship_id),master=hdKcMasterShip(masterId);if(!master)continue;
  let idx=byGameId.get(gameId);
  if(idx==null){
   const same=existing.map((x,i)=>({x,i})).filter(({x,i})=>!used.has(i)&&!Number(x.gameShipId)&&Number(x.masterId)===masterId);
   const exactLv=same.find(({x})=>Number(x.level)===Number(ship.api_lv));idx=(exactLv||same[0])?.i;
  }
  if(idx!=null)used.add(idx);
  const old=idx!=null?existing[idx]:{};
  const slots=[...(Array.isArray(ship.api_slot)?ship.api_slot:[])];if(Number(ship.api_slot_ex)>0)slots.push(Number(ship.api_slot_ex));
  const labels=slots.filter(id=>Number(id)>0).map(id=>parsed.slotItems.get(Number(id))).filter(Boolean).map(x=>hdKcEquipLabel(x,equipMap));
  next.push({...old,
   id:old.id||`kc-ship-${gameId}`,name:String(master.name||old.name||''),masterId,type:String(master.type||old.type||''),level:Number(ship.api_lv)||0,
   gear:parsed.slotItems.size?labels.join(' / '):(old.gear||''),tags:Array.isArray(old.tags)?old.tags:[],memo:old.memo||'',remodel:old.remodel||'',
   source:'kancolle-import',gameShipId:gameId,gameHp:Number(ship.api_nowhp)||0,gameMaxHp:Number(ship.api_maxhp)||0,gameCond:Number(ship.api_cond)||0,
   gameLocked:Number(ship.api_locked)||0,gameSallyArea:Number(ship.api_sally_area)||0,gameSlotEx:Number(ship.api_slot_ex)||0,syncedAt:now
  });
 }
 for(let i=0;i<existing.length;i++){
  if(used.has(i))continue;
  const row=existing[i];
  if(parsed.completeShips&&row?.source==='kancolle-import'&&Number(row.gameShipId)>0&&!gameIds.has(Number(row.gameShipId)))continue;
  next.push(row);
 }
 localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(next));
 if(typeof renderShipRoster==='function')renderShipRoster();if(typeof refreshShipRosterOptions==='function')refreshShipRosterOptions();
 window.dispatchEvent(new CustomEvent('hd:ship-identity-changed',{detail:{source:'kancolle-import',ships:parsed.ships.size}}));
 return next.filter(x=>x.source==='kancolle-import').length;
}
function hdKcMergeEquipment(parsed){
 const equipMap=hdKcMasterEquipMap(),existing=(()=>{try{const x=JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]');return Array.isArray(x)?x:[]}catch{return []}})();
 const meta=new Map();
 for(const row of existing){const key=`${Number(row.masterEquipId)||0}@@${Math.max(0,Number(row.star)||0)}@@${String(row.name||'')}`;meta.set(key,row)}
 const groups=new Map(),details=[];
 for(const item of parsed.slotItems.values()){
  const mid=Number(item.api_slotitem_id),star=Math.max(0,Number(item.api_level)||0),master=equipMap.get(mid),name=master?.name||`装備ID ${mid}`,category=master?.typeName||'未解決',key=`${mid}@@${star}`;
  const cur=groups.get(key)||{masterEquipId:mid,name,category,star,count:0,proficiency:{}};
  cur.count++;const alv=Math.max(0,Number(item.api_alv)||0);cur.proficiency[alv]=(cur.proficiency[alv]||0)+1;groups.set(key,cur);
  details.push({gameEquipId:Number(item.api_id),masterEquipId:mid,star,alv});
 }
 const next=[];
 for(const g of groups.values()){
  const old=[...meta.values()].find(x=>(Number(x.masterEquipId)===g.masterEquipId||String(x.name)===g.name)&&Math.max(0,Number(x.star)||0)===g.star)||{};
  next.push({...old,id:old.id||`kc-equip-${g.masterEquipId}-${g.star}`,name:g.name,category:g.category,count:g.count,star:g.star,targetStar:Number.isFinite(Number(old.targetStar))?Number(old.targetStar):g.star,assigned:old.assigned||'',memo:old.memo||'',masterEquipId:g.masterEquipId,source:'kancolle-import',syncedAt:Date.now(),proficiency:g.proficiency});
 }
 if(!parsed.completeSlotItems){
  for(const row of existing)if(row.source!=='kancolle-import')next.push(row);
 }
 if(typeof hdSave==='function')hdSave('harbordesk-equipment-v1',next);else{localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(next));window.dispatchEvent(new CustomEvent('hd:equipment-changed'))}
 localStorage.setItem('harbordesk-kancolle-equipment-detail-v1',JSON.stringify(details));
 return next.length;
}
function hdKcApplyMaterials(parsed){
 const names={1:'fuel',2:'ammo',3:'steel',4:'bauxite',5:'instantBuild',6:'bucket',7:'devMaterial',8:'screw'},values={};
 for(const row of parsed.materials.values()){const key=names[Number(row.api_id)];if(key)values[key]=Math.max(0,Number(row.api_value)||0)}
 localStorage.setItem(HD_KC_MATERIALS_KEY,JSON.stringify({...values,syncedAt:Date.now()}));
 const base=(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-pwa-v1')||'null')}catch{return null}})()||{expeditions:[],docks:[],quests:[],resources:{}};
 base.resources=base.resources||{};
 for(const k of ['fuel','ammo','steel','bauxite'])if(k in values)base.resources[k]=values[k];
 base.resources.savedAt=Date.now();localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(base));
 try{if(typeof state!=='undefined'&&state?.resources){Object.assign(state.resources,base.resources);if(typeof save==='function')save();if(typeof renderResources==='function')renderResources()}}catch{}
 if(typeof renderDashboard==='function')renderDashboard();if(typeof renderHomeDashboard==='function')renderHomeDashboard();window.dispatchEvent(new CustomEvent('hd:workspace-refresh'));
 return Object.keys(values).length;
}
function hdKcApplyDecks(parsed){
 const ships=parsed.ships,rows=[...parsed.decks.values()].sort((a,b)=>Number(a.api_id)-Number(b.api_id)).map(deck=>({
  deckId:Number(deck.api_id),name:String(deck.api_name||`第${deck.api_id}艦隊`),mission:Array.isArray(deck.api_mission)?deck.api_mission.slice(0,4):[],
  ships:(Array.isArray(deck.api_ship)?deck.api_ship:[]).filter(id=>Number(id)>0).map(id=>{const s=ships.get(Number(id)),m=s?hdKcMasterShip(s.api_ship_id):null;return {gameShipId:Number(id),masterId:Number(s?.api_ship_id)||0,name:String(m?.name||''),level:Number(s?.api_lv)||0}}),
  syncedAt:Date.now()
 }));
 localStorage.setItem(HD_KC_FLEETS_KEY,JSON.stringify(rows));return rows.length;
}
function hdKcApplyImport(preview,opts={}){
 const parsed=preview?.parsed;if(!parsed)throw new Error('先にデータを解析してください');
 const result={ships:0,equipment:0,materials:0,decks:0};
 if(opts.ships!==false&&parsed.ships.size)result.ships=hdKcMergeRoster(parsed);
 if(opts.equipment!==false&&parsed.slotItems.size)result.equipment=hdKcMergeEquipment(parsed);
 if(opts.resources!==false&&parsed.materials.size)result.materials=hdKcApplyMaterials(parsed);
 if(opts.fleets!==false&&parsed.decks.size)result.decks=hdKcApplyDecks(parsed);
 const sync={syncedAt:Date.now(),sources:preview.sources,ships:result.ships,equipment:result.equipment,materials:result.materials,decks:result.decks,unknownShips:preview.unknownShips,unknownEquip:preview.unknownEquip};
 localStorage.setItem(HD_KC_SYNC_KEY,JSON.stringify(sync));window.dispatchEvent(new CustomEvent('hd:kancolle-sync',{detail:sync}));
 return sync;
}
function hdKcSyncStatus(){
 try{return JSON.parse(localStorage.getItem(HD_KC_SYNC_KEY)||'null')}catch{return null}
}
function hdKcPreviewHtml(p){
 if(!p)return '<div class="hd-kc-import-empty">JSONを読み込むと内容をここで確認できるよ</div>';
 return `<div class="hd-kc-import-stats"><div><span>艦娘</span><strong>${p.ships}</strong><small>${p.completeShips?'全件同期候補':'部分データ'}</small></div><div><span>装備個体</span><strong>${p.slotItems}</strong><small>${p.completeSlotItems?'全件同期候補':'部分データ'}</small></div><div><span>資源</span><strong>${p.materials}</strong></div><div><span>艦隊</span><strong>${p.decks}</strong></div></div>${p.unknownShips||p.unknownEquip?`<div class="hd-kc-import-warn">未解決: 艦娘 ${p.unknownShips} / 装備 ${p.unknownEquip}</div>`:''}<small>検出元: ${p.sources.map(hdKcEsc).join(' / ')||'自動判定'}</small>`;
}
function hdKcRenderSyncStatus(){
 const el=document.getElementById('hdKcSyncLast');if(!el)return;const s=hdKcSyncStatus();
 el.textContent=s?`最終同期 ${new Date(s.syncedAt).toLocaleString('ja-JP')} ・ 艦娘${s.ships} / 装備${s.equipment} / 資源${s.materials} / 艦隊${s.decks}`:'まだ同期してないよ';
}
function hdKcEnsureImport(){
 const wrap=document.getElementById('advancedToolsWrap'),backup=document.getElementById('backup');if(!wrap||!backup||document.getElementById('kancolleImport'))return;
 const sec=document.createElement('section');sec.id='kancolleImport';sec.className='advanced-section';sec.innerHTML=`
 <div class="section-head"><div><div class="eyebrow">GAME DATA IMPORT</div><h2>艦これゲーム内データ取込</h2></div><span class="muted">端末内処理</span></div>
 <div class="hd-kc-import card">
  <div class="hd-kc-import-note"><strong>DMMのID・パスワード・Cookieは不要</strong><p>艦これAPIレスポンスから艦娘・装備・資源・現在艦隊だけを抽出してHarborDeskへ反映する。貼り付けた生JSONは保存しないよ。</p></div>
  <div class="hd-kc-import-actions"><label class="ghost hd-kc-import-file">JSONファイルを選ぶ<input id="hdKcImportFile" type="file" accept=".json,.txt,application/json,text/plain"></label><button type="button" class="ghost" data-hd-kc-paste>クリップボードから貼る</button></div>
  <textarea id="hdKcImportText" spellcheck="false" placeholder="svdata={...} または複数APIをまとめたJSONを貼り付け"></textarea>
  <div class="hd-kc-import-actions"><button type="button" class="primary" data-hd-kc-parse>内容を解析</button><button type="button" class="ghost" data-hd-kc-clear>入力を消す</button></div>
  <div id="hdKcImportPreview" class="hd-kc-import-preview">${hdKcPreviewHtml(null)}</div>
  <div class="hd-kc-import-options"><label><input type="checkbox" id="hdKcApplyShips" checked>艦隊台帳</label><label><input type="checkbox" id="hdKcApplyEquipment" checked>装備台帳</label><label><input type="checkbox" id="hdKcApplyResources" checked>資源</label><label><input type="checkbox" id="hdKcApplyFleets" checked>現在艦隊</label></div>
  <button type="button" class="primary full" data-hd-kc-apply disabled>HarborDeskへ同期</button>
  <div id="hdKcImportResult" class="hd-kc-import-result muted"></div>
  <div class="hd-kc-import-supported"><b>対応:</b> api_port/port、api_get_member/ship2、api_get_member/slot_item、require_info内のapi_slot_item、api_material。<br><b>保存しない:</b> api_token、Cookie、DMM認証情報、貼り付けた生レスポンス。</div>
  <div id="hdKcSyncLast" class="muted"></div>
 </div>`;
 wrap.insertBefore(sec,backup);hdKcRenderSyncStatus();
}
async function hdKcReadAndPreview(raw){
 const p=hdKcPreviewData(hdKcParseImport(raw));HD_KC_IMPORT_PREVIEW=p;const el=document.getElementById('hdKcImportPreview');if(el)el.innerHTML=hdKcPreviewHtml(p);const btn=document.querySelector('[data-hd-kc-apply]');if(btn)btn.disabled=false;return p;
}
document.addEventListener('click',async e=>{
 if(e.target.closest?.('[data-hd-kc-parse]')){const raw=document.getElementById('hdKcImportText')?.value||'';try{await hdKcReadAndPreview(raw);document.getElementById('hdKcImportResult').textContent='解析できたよ。反映する項目を確認して「HarborDeskへ同期」を押してね。'}catch(err){HD_KC_IMPORT_PREVIEW=null;document.getElementById('hdKcImportResult').textContent='解析失敗: '+String(err?.message||err)}return}
 if(e.target.closest?.('[data-hd-kc-paste]')){try{const raw=await navigator.clipboard.readText();document.getElementById('hdKcImportText').value=raw;await hdKcReadAndPreview(raw);document.getElementById('hdKcImportResult').textContent='クリップボードから解析したよ'}catch(err){document.getElementById('hdKcImportResult').textContent='クリップボードを読めなかった: '+String(err?.message||err)}return}
 if(e.target.closest?.('[data-hd-kc-clear]')){HD_KC_IMPORT_PREVIEW=null;const ta=document.getElementById('hdKcImportText');if(ta)ta.value='';const p=document.getElementById('hdKcImportPreview');if(p)p.innerHTML=hdKcPreviewHtml(null);const b=document.querySelector('[data-hd-kc-apply]');if(b)b.disabled=true;return}
 if(e.target.closest?.('[data-hd-kc-apply]')){try{const s=hdKcApplyImport(HD_KC_IMPORT_PREVIEW,{ships:document.getElementById('hdKcApplyShips')?.checked,equipment:document.getElementById('hdKcApplyEquipment')?.checked,resources:document.getElementById('hdKcApplyResources')?.checked,fleets:document.getElementById('hdKcApplyFleets')?.checked});document.getElementById('hdKcImportResult').textContent=`同期完了: 艦娘 ${s.ships} / 装備 ${s.equipment} / 資源 ${s.materials} / 艦隊 ${s.decks}`;const ta=document.getElementById('hdKcImportText');if(ta)ta.value='';HD_KC_IMPORT_PREVIEW=null;hdKcRenderSyncStatus();if(typeof renderAllAdvanced==='function')renderAllAdvanced()}catch(err){document.getElementById('hdKcImportResult').textContent='同期失敗: '+String(err?.message||err)}return}
});
document.addEventListener('change',async e=>{
 if(e.target.id==='hdKcImportFile'){const file=e.target.files?.[0];if(!file)return;try{const raw=await file.text();document.getElementById('hdKcImportText').value=raw;await hdKcReadAndPreview(raw);document.getElementById('hdKcImportResult').textContent=`${file.name} を解析したよ`}catch(err){document.getElementById('hdKcImportResult').textContent='ファイルを読めなかった: '+String(err?.message||err)}finally{e.target.value=''}}
});
window.addEventListener('message',e=>{if(e?.data?.type!=='harbordesk-kancolle-import')return;try{hdKcEnsureImport();const raw=e.data.payload;hdKcReadAndPreview(raw);document.getElementById('hdKcImportResult').textContent='外部取込ブリッジからデータを受信したよ'}catch{}});
window.addEventListener('load',()=>setTimeout(hdKcEnsureImport,450));
hdKcEnsureImport();
