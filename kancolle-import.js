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
function hdKcImportEmpty(){return {ships:new Map(),slotItems:new Map(),materials:new Map(),decks:new Map(),ndocks:new Map(),quests:new Map(),questPages:new Set(),questPageCount:0,sortieEvents:[],captureId:'',sources:new Set(),completeShips:false,completeSlotItems:false,completeDecks:false,completeNdocks:false,completeQuests:false}}
function hdKcSortieEventData(h,data){
 if(/api_req_map\/(?:start|next)/.test(h))return {mapareaId:Number(data?.api_maparea_id)||0,mapinfoNo:Number(data?.api_mapinfo_no)||0,nodeNo:Number(data?.api_no)||0,colorNo:Number(data?.api_color_no)||0,eventId:Number(data?.api_event_id)||0,eventKind:Number(data?.api_event_kind)||0,bossCellNo:Number(data?.api_bosscell_no)||0};
 if(/api_req_(?:sortie|combined_battle)\/battleresult/.test(h))return {winRank:String(data?.api_win_rank||''),questName:String(data?.api_quest_name||''),dropShipId:Number(data?.api_get_ship?.api_ship_id)||0,dropShipName:String(data?.api_get_ship?.api_ship_name||'')};
 if(/api_port\/port/.test(h))return {port:true};
 return null;
}
function hdKcImportAdd(out,hint,payload,meta={}){
 const h=String(hint||''),data=hdKcApiData(payload);if(data==null)return;
 out.sources.add(h||'auto');
 const sortieEvent=hdKcSortieEventData(h,data);if(sortieEvent)out.sortieEvents.push({endpoint:h,at:Number(meta?.at)||0,index:Number(meta?.index)||0,data:sortieEvent});
 const shipRows=Array.isArray(data?.api_ship)?data.api_ship:Array.isArray(data?.api_ship_data)?data.api_ship_data:null;
 const deckRows=Array.isArray(data?.api_deck_port)?data.api_deck_port:Array.isArray(data?.api_deck_data)?data.api_deck_data:null;
 const dockRows=Array.isArray(data?.api_ndock)?data.api_ndock:null;
 const matRows=Array.isArray(data?.api_material)?data.api_material:null;
 const slotRows=Array.isArray(data?.api_slot_item)?data.api_slot_item:null;
 const questRows=Array.isArray(data?.api_list)?data.api_list:null;
 if(shipRows)for(const x of shipRows)if(Number(x?.api_id)>0&&Number(x?.api_ship_id)>0)out.ships.set(Number(x.api_id),x);
 if(deckRows)for(const x of deckRows)if(Number(x?.api_id)>0)out.decks.set(Number(x.api_id),x);
 if(dockRows)for(const x of dockRows)if(Number(x?.api_id)>0)out.ndocks.set(Number(x.api_id),x);
 if(matRows)for(const x of matRows)if(Number(x?.api_id)>0)out.materials.set(Number(x.api_id),x);
 if(slotRows)for(const x of slotRows)if(Number(x?.api_id)>0&&Number(x?.api_slotitem_id)>0)out.slotItems.set(Number(x.api_id),x);
 if(questRows){
  for(const x of questRows)if(x&&typeof x==='object'&&Number(x?.api_no)>0)out.quests.set(Number(x.api_no),x);
  if(/api_get_member\/questlist/.test(h)){
   const page=Number(data?.api_disp_page)||Number(data?.api_page_no)||0,pageCount=Number(data?.api_page_count)||0;
   if(page>0)out.questPages.add(page);if(pageCount>0)out.questPageCount=Math.max(out.questPageCount,pageCount);
   if(out.questPageCount>0&&out.questPages.size>=out.questPageCount)out.completeQuests=true;
  }
 }
 if(Array.isArray(data)){
  const first=data.find(Boolean)||{};
  if('api_slotitem_id' in first){for(const x of data)if(Number(x?.api_id)>0&&Number(x?.api_slotitem_id)>0)out.slotItems.set(Number(x.api_id),x)}
  else if('api_complete_time' in first&&'api_state' in first&&'api_ship_id' in first){for(const x of data)if(Number(x?.api_id)>0)out.ndocks.set(Number(x.api_id),x)}
  else if('api_ship_id' in first){for(const x of data)if(Number(x?.api_id)>0&&Number(x?.api_ship_id)>0)out.ships.set(Number(x.api_id),x)}
  else if('api_value' in first){for(const x of data)if(Number(x?.api_id)>0)out.materials.set(Number(x.api_id),x)}
 }
 if(/api_port\/port/.test(h)||/api_get_member\/ship2/.test(h)||(!h&&shipRows&&deckRows))out.completeShips=true;
 if(/api_port\/port/.test(h)||(/api_get_member\/ship2/.test(h)&&deckRows))out.completeDecks=true;
 if(/api_port\/port/.test(h)||/api_get_member\/ndock/.test(h))out.completeNdocks=true;
 if(/api_get_member\/slot_item/.test(h)||(/require_info/.test(h)&&slotRows))out.completeSlotItems=true;
 if(Array.isArray(data)&&data.length&&'api_slotitem_id' in (data.find(Boolean)||{})&&!h)out.completeSlotItems=true;
 if(Array.isArray(data)&&data.length&&'api_ship_id' in (data.find(Boolean)||{})&&!h)out.completeShips=true;
}
function hdKcParseImport(raw){
 const root=hdKcReadJson(raw),out=hdKcImportEmpty();
 if(root?.format==='harbordesk-kancolle-import'&&root.endpoints&&typeof root.endpoints==='object'){
  for(const [k,v] of Object.entries(root.endpoints))hdKcImportAdd(out,k,v);
 }else if(Array.isArray(root?.records)){
  out.captureId=String(root?.captureId||root?.createdAt||'');
  root.records.forEach((r,i)=>hdKcImportAdd(out,r?.endpoint||r?.path||'',r?.payload??r?.response??r?.data,{at:r?.at,index:i}));
 }else if(root&&typeof root==='object'&&!Array.isArray(root)&&!('api_result' in root)&&!('api_ship' in root)&&!('api_ship_data' in root)&&!('api_slot_item' in root)&&!('api_material' in root)&&!('api_ndock' in root)&&!('api_list' in root)){
  let matched=false;
  for(const [k,v] of Object.entries(root)){
   if(/api_(port|api_get_member|kcsapi)|\/kcsapi\//.test(k)||/^(port|ship2|slot_item|material|require_info|ndock|questlist)$/.test(k)){hdKcImportAdd(out,k,v);matched=true}
  }
  if(!matched)hdKcImportAdd(out,'',root);
 }else hdKcImportAdd(out,'',root);
 if(!out.ships.size&&!out.slotItems.size&&!out.materials.size&&!out.decks.size&&!out.ndocks.size&&!out.quests.size&&!out.sortieEvents.length)throw new Error('艦娘・装備・資源・艦隊・入渠・任務・出撃データを見つけられませんでした');
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
  expeditions:[...parsed.decks.values()].filter(x=>Array.isArray(x?.api_mission)&&Number(x.api_mission[0])>0&&Number(x.api_mission[1])>0&&Number(x.api_mission[2])>0).length,
  docks:[...parsed.ndocks.values()].filter(x=>Number(x?.api_state)===1&&Number(x?.api_complete_time)>0).length,
  quests:parsed.quests.size,
  activeQuests:[...parsed.quests.values()].filter(x=>[2,3].includes(Number(x?.api_state))&&Number(x?.api_invalid_flag)!==1).length,
  completeQuests:!!parsed.completeQuests,
  sortieStarts:parsed.sortieEvents.filter(x=>/api_req_map\/start/.test(x.endpoint)).length,
  battleResults:parsed.sortieEvents.filter(x=>/battleresult/.test(x.endpoint)).length,
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
 const equipMap=hdKcMasterEquipMap(),idByName=new Map([...equipMap.values()].map(x=>[String(x.name||''),Number(x.id)||0])),existing=(()=>{try{const x=JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]');return Array.isArray(x)?x:[]}catch{return []}})();
 const rowKey=row=>`${Number(row?.masterEquipId)||idByName.get(String(row?.name||''))||0}@@${Math.max(0,Number(row?.star)||0)}`,meta=new Map();
 for(const row of existing)meta.set(rowKey(row),row);

 let oldDetails=[];try{const x=JSON.parse(localStorage.getItem('harbordesk-kancolle-equipment-detail-v1')||'[]');oldDetails=Array.isArray(x)?x:[]}catch{}
 const oldById=new Map(oldDetails.map(x=>[Number(x?.gameEquipId)||0,x]).filter(([id])=>id)),incoming=[];
 for(const item of parsed.slotItems.values()){
  const mid=Number(item.api_slotitem_id),star=Math.max(0,Number(item.api_level)||0),alv=Math.max(0,Number(item.api_alv)||0);
  incoming.push({gameEquipId:Number(item.api_id),masterEquipId:mid,star,alv});
 }
 let mergedDetails=incoming;
 const changedOldKeys=new Set();
 if(!parsed.completeSlotItems){
  const byId=new Map(oldDetails.map(x=>[Number(x?.gameEquipId)||0,x]).filter(([id])=>id));
  for(const x of incoming){
   const old=oldById.get(Number(x.gameEquipId)||0);if(old)changedOldKeys.add(`${Number(old.masterEquipId)||0}@@${Math.max(0,Number(old.star)||0)}`);
   byId.set(Number(x.gameEquipId)||0,x);
  }
  mergedDetails=[...byId.values()];
 }

 const groups=new Map();
 for(const x of mergedDetails){
  const mid=Number(x.masterEquipId),star=Math.max(0,Number(x.star)||0),master=equipMap.get(mid),name=master?.name||`装備ID ${mid}`,category=master?.typeName||'未解決',key=`${mid}@@${star}`;
  const cur=groups.get(key)||{masterEquipId:mid,name,category,star,count:0,proficiency:{}};
  cur.count++;const alv=Math.max(0,Number(x.alv)||0);cur.proficiency[alv]=(cur.proficiency[alv]||0)+1;groups.set(key,cur);
 }

 const next=[],represented=new Set(groups.keys());
 for(const [key,g] of groups){
  const old=meta.get(key)||{};
  next.push({...old,id:old.id||`kc-equip-${g.masterEquipId}-${g.star}`,name:g.name,category:g.category,count:g.count,star:g.star,targetStar:Number.isFinite(Number(old.targetStar))?Number(old.targetStar):g.star,assigned:old.assigned||'',memo:old.memo||'',masterEquipId:g.masterEquipId,source:'kancolle-import',syncedAt:Date.now(),proficiency:g.proficiency});
 }
 if(!parsed.completeSlotItems){
  for(const row of existing){const key=rowKey(row);if(!represented.has(key)&&!changedOldKeys.has(key))next.push(row)}
 }

 if(typeof hdSave==='function')hdSave('harbordesk-equipment-v1',next);else{localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(next));window.dispatchEvent(new CustomEvent('hd:equipment-changed'))}
 localStorage.setItem('harbordesk-kancolle-equipment-detail-v1',JSON.stringify(mergedDetails));
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
 const ships=parsed.ships,equipMap=hdKcMasterEquipMap(),rows=[...parsed.decks.values()].sort((a,b)=>Number(a.api_id)-Number(b.api_id)).map(deck=>({
  deckId:Number(deck.api_id),name:String(deck.api_name||`第${deck.api_id}艦隊`),mission:Array.isArray(deck.api_mission)?deck.api_mission.slice(0,4):[],
  ships:(Array.isArray(deck.api_ship)?deck.api_ship:[]).filter(id=>Number(id)>0).map(id=>{
   const s=ships.get(Number(id)),m=s?hdKcMasterShip(s.api_ship_id):null,slotIds=[...(Array.isArray(s?.api_slot)?s.api_slot:[])];if(Number(s?.api_slot_ex)>0)slotIds.push(Number(s.api_slot_ex));
   const gear=slotIds.filter(x=>Number(x)>0).map(x=>parsed.slotItems.get(Number(x))).filter(Boolean).map(x=>hdKcEquipLabel(x,equipMap)).join(' / ');
   return {gameShipId:Number(id),masterId:Number(s?.api_ship_id)||0,name:String(m?.name||''),level:Number(s?.api_lv)||0,gear}
  }),
  syncedAt:Date.now()
 }));
 localStorage.setItem(HD_KC_FLEETS_KEY,JSON.stringify(rows));hdKcRenderCurrentFleets();return rows.length;
}
function hdKcCurrentFleets(){
 try{const x=JSON.parse(localStorage.getItem(HD_KC_FLEETS_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}
}
function hdKcCopyFleetToCustom(deckId,map=''){
 const deck=hdKcCurrentFleets().find(x=>Number(x.deckId)===Number(deckId)),target=String(map||(typeof selectedMap!=='undefined'?selectedMap:'')||'').trim();
 if(!deck)throw new Error('ゲーム艦隊が見つからない');
 if(!target)throw new Error('先に攻略海域を選んでね');
 const all=typeof loadCustomFleets==='function'?loadCustomFleets():(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1')||'{}')||{}}catch{return {}}})();
 all[target]=all[target]||[];
 const ships=Array.from({length:6},(_,i)=>{const s=deck.ships?.[i];return {ship:String(s?.name||''),masterId:Number(s?.masterId)||0,gear:String(s?.gear||'')}});
 const existing=all[target].findIndex(x=>Number(x.sourceDeckId)===Number(deck.deckId)&&x.source==='kancolle-import');
 const row={id:existing>=0?all[target][existing].id:(typeof cfUid==='function'?cfUid():`kc-fleet-${deck.deckId}-${Date.now()}`),name:`ゲーム同期｜${deck.name}`,ships,memo:`艦これゲーム内の${deck.name}から同期`,source:'kancolle-import',sourceDeckId:Number(deck.deckId),createdAt:existing>=0?all[target][existing].createdAt:Date.now(),updatedAt:Date.now()};
 if(existing>=0)all[target][existing]=row;else all[target].push(row);
 if(typeof saveCustomFleets==='function')saveCustomFleets(all);else localStorage.setItem('harbordesk-custom-fleets-v1',JSON.stringify(all));
 if(typeof renderCustomFleets==='function')renderCustomFleets(target);
 return row;
}
function hdKcRenderCurrentFleets(){
 const host=document.getElementById('hdKcCurrentFleets');if(!host)return;const rows=hdKcCurrentFleets();
 if(!rows.length){host.innerHTML='<div class="hd-kc-import-empty">現在艦隊はまだ同期されてないよ</div>';return}
 const map=typeof selectedMap!=='undefined'?selectedMap:'';
 host.innerHTML=rows.map(deck=>`<article class="hd-kc-deck"><div class="hd-kc-deck-head"><div><strong>${hdKcEsc(deck.name)}</strong><small>第${deck.deckId}艦隊 ・ ${deck.ships?.length||0}隻</small></div><button type="button" class="ghost small" data-hd-kc-copy-deck="${deck.deckId}">${map?`${hdKcEsc(map)}へコピー`:'海域を選んでコピー'}</button></div><div class="hd-kc-deck-ships">${(deck.ships||[]).map((s,i)=>{const image=s.name&&typeof hdShipImageThumbHtml==='function'?hdShipImageThumbHtml(Number(s.masterId)>0?{id:Number(s.masterId),name:s.name}:s.name,'kc-deck-thumb'):'';return `<div class="hd-kc-deck-ship"><span>${i+1}</span>${image}<div><b>${hdKcEsc(s.name||'未解決')}</b><small>Lv.${Number(s.level)||0}</small><em>${hdKcEsc(s.gear||'装備データなし')}</em></div></div>`}).join('')}</div></article>`).join('');
 if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(host);
}
function hdKcExpeditionName(id){
 const row=(typeof HD_EXPEDITIONS!=='undefined'?HD_EXPEDITIONS:[]).find(x=>String(x.id)===String(id)||Number(x.id)===Number(id));
 return row?`${row.id} ${row.name}`:`遠征 ${id}`;
}
function hdKcShipNameByGameId(parsed,gameShipId){
 const live=parsed?.ships?.get?.(Number(gameShipId));if(live){const m=hdKcMasterShip(live.api_ship_id);if(m?.name)return String(m.name)}
 try{const rows=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]');const hit=(Array.isArray(rows)?rows:[]).find(x=>Number(x.gameShipId)===Number(gameShipId));if(hit?.name)return String(hit.name)}catch{}
 return '';
}
function hdKcApplyTimers(parsed){
 const base=(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-pwa-v1')||'null')}catch{return null}})()||{expeditions:[],docks:[],quests:[],resources:{}};
 base.expeditions=Array.isArray(base.expeditions)?base.expeditions:[];base.docks=Array.isArray(base.docks)?base.docks:[];
 const now=Date.now();

 const incomingExp=[];
 for(const deck of parsed.decks.values()){
  const m=Array.isArray(deck?.api_mission)?deck.api_mission:[],stateCode=Number(m[0])||0,missionId=Number(m[1])||0,endsAt=Number(m[2])||0,fleetNo=Number(deck?.api_id)||0;
  if(stateCode<=0||missionId<=0||endsAt<=0||fleetNo<=0)continue;
  incomingExp.push({id:`kc-exp-${fleetNo}`,name:`${hdKcExpeditionName(missionId)}（第${fleetNo}艦隊）`,endsAt,expeditionId:String(missionId),fleetNo,source:'kancolle-import',gameState:stateCode,syncedAt:now});
 }
 if(parsed.completeDecks){
  base.expeditions=[...base.expeditions.filter(x=>x?.source!=='kancolle-import'),...incomingExp];
 }else{
  const touched=new Set([...parsed.decks.keys()].map(Number));
  base.expeditions=[...base.expeditions.filter(x=>!(x?.source==='kancolle-import'&&touched.has(Number(x.fleetNo)))),...incomingExp];
 }

 const incomingDock=[];
 for(const dock of parsed.ndocks.values()){
  const dockNo=Number(dock?.api_id)||0,stateCode=Number(dock?.api_state)||0,gameShipId=Number(dock?.api_ship_id)||0,endsAt=Number(dock?.api_complete_time)||0;
  if(dockNo<=0||stateCode!==1||gameShipId<=0||endsAt<=0)continue;
  const shipName=hdKcShipNameByGameId(parsed,gameShipId)||`艦ID ${gameShipId}`;
  incomingDock.push({id:`kc-dock-${dockNo}`,name:`${shipName}（第${dockNo}入渠ドック）`,endsAt,dockNo,gameShipId,source:'kancolle-import',syncedAt:now});
 }
 if(parsed.completeNdocks){
  base.docks=[...base.docks.filter(x=>x?.source!=='kancolle-import'),...incomingDock];
 }else{
  const touched=new Set([...parsed.ndocks.keys()].map(Number));
  base.docks=[...base.docks.filter(x=>!(x?.source==='kancolle-import'&&touched.has(Number(x.dockNo)))),...incomingDock];
 }

 localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(base));
 try{
  if(typeof state!=='undefined'&&state){state.expeditions=base.expeditions;state.docks=base.docks;if(typeof save==='function')save();if(typeof renderTimers==='function'){renderTimers('expedition');renderTimers('dock')}}
 }catch{}
 window.dispatchEvent(new CustomEvent('hd:workspace-refresh'));
 return {expeditions:incomingExp.length,docks:incomingDock.length};
}
function hdKcApplyQuests(parsed){
 const base=(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-pwa-v1')||'null')}catch{return null}})()||{expeditions:[],docks:[],quests:[],resources:{}};
 base.quests=Array.isArray(base.quests)?base.quests:[];const now=Date.now(),incoming=[];
 for(const q of parsed.quests.values()){
  const questNo=Number(q?.api_no)||0,stateCode=Number(q?.api_state)||0;if(questNo<=0||![2,3].includes(stateCode)||Number(q?.api_invalid_flag)===1)continue;
  incoming.push({id:`kc-quest-${questNo}`,name:String(q?.api_title||`任務 ${questNo}`),done:stateCode===3,questNo,questState:stateCode,progressFlag:Math.max(0,Number(q?.api_progress_flag)||0),category:Number(q?.api_category)||0,questType:Number(q?.api_type)||0,labelType:Number(q?.api_label_type)||0,detail:String(q?.api_detail||''),source:'kancolle-import',syncedAt:now});
 }
 if(parsed.completeQuests)base.quests=[...base.quests.filter(x=>x?.source!=='kancolle-import'),...incoming];
 else{
  const touched=new Set([...parsed.quests.keys()].map(Number));
  base.quests=[...base.quests.filter(x=>!(x?.source==='kancolle-import'&&touched.has(Number(x.questNo)))),...incoming];
 }
 base.quests.sort((a,b)=>(a?.source==='kancolle-import'?1:0)-(b?.source==='kancolle-import'?1:0)||(Number(a?.questNo)||999999)-(Number(b?.questNo)||999999));
 localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(base));
 try{if(typeof state!=='undefined'&&state){state.quests=base.quests;if(typeof save==='function')save();if(typeof renderQuests==='function')renderQuests()}}catch{}
 window.dispatchEvent(new CustomEvent('hd:workspace-refresh'));return incoming.length;
}

function hdKcApplySorties(parsed){
 if(!Array.isArray(parsed?.sortieEvents)||!parsed.sortieEvents.length||typeof hdSLRecordEntry!=='function')return 0;
 const existing=typeof hdSLLoad==='function'?hdSLLoad():(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]')||[]}catch{return []}})();
 const seen=new Set(existing.map(x=>String(x?.gameSortieKey||'')).filter(Boolean));let active=null,added=0;
 const nodeFrom=e=>({no:Number(e?.data?.nodeNo)||0,eventId:Number(e?.data?.eventId)||0,eventKind:Number(e?.data?.eventKind)||0,bossCellNo:Number(e?.data?.bossCellNo)||0});
 const finalize=(reason,eventIndex)=>{
  if(!active||!active.map||!active.battles)return;
  const key=active.key||`kc-sortie-${parsed.captureId||'bundle'}-${active.startIndex}`;if(seen.has(key)){active=null;return}
  const boss=active.lastNode>0&&active.bossCellNo>0&&active.lastNode===active.bossCellNo;
  const retreat=reason==='port'&&!boss&&active.battles>0&&active.lastEventId!==9;
  const route=active.route.filter(Boolean),node=active.lastNode?`#${active.lastNode}`:'';
  const memo=[`ゲーム同期`,route.length?`ルート ${route.map(n=>`#${n}`).join('→')}`:'',retreat?'帰投/撤退':''].filter(Boolean).join('｜');
  const entry=hdSLRecordEntry({map:active.map,node,result:active.lastResult||'不明',boss,retreat,battles:active.battles,drop:active.lastDrop||'',memo,source:'kancolle-import',gameSortieKey:key,gameNodeNo:active.lastNode,gameBossCellNo:active.bossCellNo,gameRouteNodes:route,gameBattleResults:active.results.slice(),startedAt:active.startedAt||0});
  if(entry){seen.add(key);added++}active=null;
 };
 parsed.sortieEvents.forEach((e,i)=>{
  const h=String(e?.endpoint||''),d=e?.data||{};
  if(/api_req_map\/start/.test(h)){
   finalize('new-start',i);
   const maparea=Number(d.mapareaId)||0,mapinfo=Number(d.mapinfoNo)||0,n=nodeFrom(e),at=Number(e.at)||0;
   active={map:maparea&&mapinfo?`${maparea}-${mapinfo}`:'',startIndex:Number(e.index)||i,startedAt:at,key:at?`kc-sortie-at-${at}`:`kc-sortie-${parsed.captureId||'bundle'}-${Number(e.index)||i}`,route:n.no?[n.no]:[],lastNode:n.no,lastEventId:n.eventId,bossCellNo:n.bossCellNo,battles:0,lastResult:'',lastDrop:'',results:[]};
   return;
  }
  if(!active)return;
  if(/api_req_map\/next/.test(h)){
   const n=nodeFrom(e);if(n.no)active.route.push(n.no);active.lastNode=n.no||active.lastNode;active.lastEventId=n.eventId||0;active.bossCellNo=n.bossCellNo||active.bossCellNo;return;
  }
  if(/battleresult/.test(h)){
   const rank=String(d.winRank||'');active.battles++;active.lastResult=rank||active.lastResult;active.lastDrop=String(d.dropShipName||'')||active.lastDrop;active.results.push({nodeNo:active.lastNode,rank:rank,drop:String(d.dropShipName||''),dropShipId:Number(d.dropShipId)||0});return;
  }
  if(/api_port\/port/.test(h))finalize('port',i);
 });
 return added;
}
function hdKcApplyImport(preview,opts={}){
 const parsed=preview?.parsed;if(!parsed)throw new Error('先にデータを解析してください');
 const result={ships:0,equipment:0,materials:0,decks:0,expeditions:0,docks:0,quests:0,sorties:0};
 if(opts.ships!==false&&parsed.ships.size)result.ships=hdKcMergeRoster(parsed);
 if(opts.equipment!==false&&parsed.slotItems.size)result.equipment=hdKcMergeEquipment(parsed);
 if(opts.resources!==false&&parsed.materials.size)result.materials=hdKcApplyMaterials(parsed);
 if(opts.fleets!==false&&parsed.decks.size)result.decks=hdKcApplyDecks(parsed);
 if(opts.timers!==false&&(parsed.decks.size||parsed.ndocks.size)){const t=hdKcApplyTimers(parsed);result.expeditions=t.expeditions;result.docks=t.docks}
 if(opts.quests!==false&&parsed.quests.size)result.quests=hdKcApplyQuests(parsed);
 if(opts.sorties!==false&&parsed.sortieEvents.length)result.sorties=hdKcApplySorties(parsed);
 const sync={syncedAt:Date.now(),sources:preview.sources,ships:result.ships,equipment:result.equipment,materials:result.materials,decks:result.decks,expeditions:result.expeditions,docks:result.docks,quests:result.quests,sorties:result.sorties,unknownShips:preview.unknownShips,unknownEquip:preview.unknownEquip};
 localStorage.setItem(HD_KC_SYNC_KEY,JSON.stringify(sync));window.dispatchEvent(new CustomEvent('hd:kancolle-sync',{detail:sync}));hdKcRenderCurrentFleets();
 return sync;
}
function hdKcSyncStatus(){
 try{return JSON.parse(localStorage.getItem(HD_KC_SYNC_KEY)||'null')}catch{return null}
}
function hdKcPreviewHtml(p){
 if(!p)return '<div class="hd-kc-import-empty">JSONを読み込むと内容をここで確認できるよ</div>';
 return `<div class="hd-kc-import-stats"><div><span>艦娘</span><strong>${p.ships}</strong><small>${p.completeShips?'全件同期候補':'部分データ'}</small></div><div><span>装備個体</span><strong>${p.slotItems}</strong><small>${p.completeSlotItems?'全件同期候補':'部分データ'}</small></div><div><span>資源</span><strong>${p.materials}</strong></div><div><span>艦隊</span><strong>${p.decks}</strong></div><div><span>遠征中</span><strong>${p.expeditions||0}</strong></div><div><span>入渠中</span><strong>${p.docks||0}</strong></div><div><span>任務</span><strong>${p.activeQuests||0}</strong><small>${p.completeQuests?'全ページ取得':'取得ページ内'}</small></div><div><span>出撃</span><strong>${p.sortieStarts||0}</strong><small>戦闘結果 ${p.battleResults||0}</small></div></div>${p.unknownShips||p.unknownEquip?`<div class="hd-kc-import-warn">未解決: 艦娘 ${p.unknownShips} / 装備 ${p.unknownEquip}</div>`:''}<small>検出元: ${p.sources.map(hdKcEsc).join(' / ')||'自動判定'}</small>`;
}
function hdKcRenderSyncStatus(){
 const el=document.getElementById('hdKcSyncLast');if(!el)return;const s=hdKcSyncStatus();
 el.textContent=s?`最終同期 ${new Date(s.syncedAt).toLocaleString('ja-JP')} ・ 艦娘${s.ships} / 装備${s.equipment} / 資源${s.materials} / 艦隊${s.decks} / 遠征${s.expeditions||0} / 入渠${s.docks||0} / 任務${s.quests||0} / 出撃${s.sorties||0}`:'まだ同期してないよ';
}
function hdKcCaptureBootstrap(){
 if(window.__HD_KC_CAPTURE?.show){window.__HD_KC_CAPTURE.show();return}
 const records=[],MAX_RECORDS=80,captureId='kc-cap-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),origFetch=window.fetch,proto=window.XMLHttpRequest?.prototype,origOpen=proto?.open,origSend=proto?.send;
 const wanted=url=>/\/kcsapi\/(?:api_port\/port|api_get_member\/(?:ship2|slot_item|require_info|material|ndock|questlist)|api_req_map\/(?:start|next)|api_req_(?:sortie|combined_battle)\/battleresult)(?:$|[?#])/.test(String(url||''));
 const pathOf=url=>{try{return new URL(String(url||''),location.href).pathname}catch{return String(url||'').split(/[?#]/)[0]}};
 const parse=text=>{let t=String(text??'').trim();if(t.startsWith('svdata='))t=t.slice(7);try{return JSON.parse(t)}catch{return null}};
 const minimize=(path,obj)=>{
  if(!obj||typeof obj!=='object')return null;const data=obj.api_data,base={api_result:Number(obj.api_result)||1,api_result_msg:String(obj.api_result_msg||'成功')};
  if(/\/api_port\/port$/.test(path)){base.api_data={api_ship:Array.isArray(data?.api_ship)?data.api_ship:[],api_deck_port:Array.isArray(data?.api_deck_port)?data.api_deck_port:[],api_ndock:Array.isArray(data?.api_ndock)?data.api_ndock:[],api_material:Array.isArray(data?.api_material)?data.api_material:[]};return base}
  if(/\/api_get_member\/ship2$/.test(path)){base.api_data={api_ship_data:Array.isArray(data?.api_ship_data)?data.api_ship_data:(Array.isArray(data)?data:[]),api_deck_data:Array.isArray(data?.api_deck_data)?data.api_deck_data:[]};return base}
  if(/\/api_get_member\/slot_item$/.test(path)){base.api_data=Array.isArray(data)?data:[];return base}
  if(/\/api_get_member\/require_info$/.test(path)){base.api_data={api_slot_item:Array.isArray(data?.api_slot_item)?data.api_slot_item:[]};return base}
  if(/\/api_get_member\/material$/.test(path)){base.api_data=Array.isArray(data)?data:[];return base}
  if(/\/api_get_member\/ndock$/.test(path)){base.api_data=Array.isArray(data)?data:[];return base}
  if(/\/api_get_member\/questlist$/.test(path)){
   const rows=(Array.isArray(data?.api_list)?data.api_list:[]).filter(q=>q&&typeof q==='object'&&Number(q.api_no)>0).map(q=>({api_no:Number(q.api_no)||0,api_category:Number(q.api_category)||0,api_type:Number(q.api_type)||0,api_label_type:Number(q.api_label_type)||0,api_state:Number(q.api_state)||0,api_title:String(q.api_title||''),api_detail:String(q.api_detail||''),api_progress_flag:Number(q.api_progress_flag)||0,api_invalid_flag:Number(q.api_invalid_flag)||0}));
   base.api_data={api_count:Number(data?.api_count)||0,api_page_count:Number(data?.api_page_count)||0,api_disp_page:Number(data?.api_disp_page)||0,api_list:rows};return base;
  }
  if(/\/api_req_map\/(?:start|next)$/.test(path)){base.api_data={api_maparea_id:Number(data?.api_maparea_id)||0,api_mapinfo_no:Number(data?.api_mapinfo_no)||0,api_no:Number(data?.api_no)||0,api_color_no:Number(data?.api_color_no)||0,api_event_id:Number(data?.api_event_id)||0,api_event_kind:Number(data?.api_event_kind)||0,api_bosscell_no:Number(data?.api_bosscell_no)||0};return base}
  if(/\/api_req_(?:sortie|combined_battle)\/battleresult$/.test(path)){base.api_data={api_win_rank:String(data?.api_win_rank||''),api_quest_name:String(data?.api_quest_name||''),api_get_ship:data?.api_get_ship?{api_ship_id:Number(data.api_get_ship.api_ship_id)||0,api_ship_name:String(data.api_get_ship.api_ship_name||'')}:null};return base}
  return null;
 };
 const exportObject=()=>({format:'harbordesk-kancolle-import',version:2,captureId,createdAt:new Date().toISOString(),records:records.map(x=>({endpoint:x.endpoint,payload:x.payload,at:x.at}))});
 let box=null,count=null;
 const render=()=>{if(count)count.textContent=String(records.length)};
 const capture=(url,text)=>{
  if(!wanted(url))return;const path=pathOf(url),obj=parse(text),payload=minimize(path,obj);if(!payload)return;
  records.push({endpoint:path,payload,at:Date.now()});while(records.length>MAX_RECORDS)records.shift();render();
 };
 const copy=async()=>{const text=JSON.stringify(exportObject());try{await navigator.clipboard.writeText(text);alert('HarborDesk用JSONをコピーしたよ')}catch{prompt('このJSONをコピーしてHarborDeskへ貼り付けてね',text)}};
 const download=()=>{const blob=new Blob([JSON.stringify(exportObject(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='HarborDesk-kancolle-capture.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200)};
 const show=()=>{
  if(box){box.hidden=false;return}
  box=document.createElement('div');box.id='hd-kc-capture-panel';box.style.cssText='position:fixed;z-index:2147483647;right:8px;bottom:8px;width:min(330px,calc(100vw - 16px));padding:10px;border:1px solid #5f7892;border-radius:12px;background:#071521;color:#eef6ff;font:12px/1.45 -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.45)';
  box.innerHTML='<div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>HarborDesk 艦これ受動キャプチャ</b><button data-hd-hide style="background:none;border:0;color:#9eb7cb;font-size:18px">×</button></div><div style="margin:6px 0;color:#aac0d1">取得済みレスポンス <b data-hd-count>0</b> 件<br><small>リクエスト本文・api_token・Cookieは記録しません。</small></div><div style="display:flex;gap:6px;flex-wrap:wrap"><button data-hd-copy>JSONをコピー</button><button data-hd-download>JSON保存</button><button data-hd-clear>クリア</button></div>';
  document.documentElement.appendChild(box);count=box.querySelector('[data-hd-count]');box.querySelector('[data-hd-copy]').onclick=copy;box.querySelector('[data-hd-download]').onclick=download;box.querySelector('[data-hd-clear]').onclick=()=>{records.length=0;render()};box.querySelector('[data-hd-hide]').onclick=()=>{box.hidden=true};render();
 };
 if(typeof origFetch==='function')window.fetch=async function(...args){const res=await origFetch.apply(this,args);try{const url=typeof args[0]==='string'?args[0]:args[0]?.url;if(wanted(url))res.clone().text().then(t=>capture(url,t)).catch(()=>{})}catch{}return res};
 if(proto&&origOpen&&origSend){proto.open=function(method,url,...rest){this.__hdKcCaptureUrl=url;return origOpen.call(this,method,url,...rest)};proto.send=function(...args){if(wanted(this.__hdKcCaptureUrl))this.addEventListener('load',()=>{try{const text=this.responseType==='json'?JSON.stringify(this.response):this.responseText;capture(this.__hdKcCaptureUrl,text)}catch{}},{once:true});return origSend.apply(this,args)}}
 const restore=()=>{if(typeof origFetch==='function')window.fetch=origFetch;if(proto&&origOpen)proto.open=origOpen;if(proto&&origSend)proto.send=origSend;if(box)box.remove();delete window.__HD_KC_CAPTURE};
 window.__HD_KC_CAPTURE={records,exportObject,show,clear:()=>{records.length=0;render()},restore,capture};
 show();
 for(const frame of document.querySelectorAll('iframe')){try{const w=frame.contentWindow;if(w&&w!==window&&!w.__HD_KC_CAPTURE)w.eval('('+hdKcCaptureBootstrap.toString()+')()')}catch{}}
}
function hdKcCaptureSource(){return '('+hdKcCaptureBootstrap.toString()+')()'}
function hdKcCaptureBookmarklet(){return 'javascript:'+hdKcCaptureSource().replace(/[\r\n]+/g,' ')}
async function hdKcCopyCaptureHelper(){
 const code=hdKcCaptureBookmarklet();try{await navigator.clipboard.writeText(code);return true}catch{return false}
}
function hdKcEnsureImport(){
 const wrap=document.getElementById('advancedToolsWrap'),backup=document.getElementById('backup');if(!wrap||!backup||document.getElementById('kancolleImport'))return;
 const sec=document.createElement('section');sec.id='kancolleImport';sec.className='advanced-section';sec.innerHTML=`
 <div class="section-head"><div><div class="eyebrow">GAME DATA IMPORT</div><h2>艦これゲーム内データ取込</h2></div><span class="muted">端末内処理</span></div>
 <div class="hd-kc-import card">
  <div class="hd-kc-import-note"><strong>DMMのID・パスワード・Cookieは不要</strong><p>艦これAPIレスポンスから艦娘・装備・資源・現在艦隊・遠征/入渠・任務・出撃結果を抽出してHarborDeskへ反映する。貼り付けた生JSONは保存しないよ。</p></div>
  <div class="hd-kc-import-actions"><label class="ghost hd-kc-import-file">JSONファイルを選ぶ<input id="hdKcImportFile" type="file" accept=".json,.txt,application/json,text/plain"></label><button type="button" class="ghost" data-hd-kc-paste>クリップボードから貼る</button></div>
  <details class="hd-kc-capture-guide"><summary>iPhone / Safariでゲーム通信を拾う（試験機能）</summary><div><p>SafariのブックマークURLとしてキャプチャ補助コードを登録すると、実行後の <code>/kcsapi/</code> レスポンスだけを端末内で拾ってHarborDesk用JSONにできる。DMM側のページ/iframe構成によっては動作しない場合があるよ。</p><button type="button" class="ghost" data-hd-kc-copy-capture>Safari用コードをコピー</button><ol><li>Safariで適当なページをブックマーク</li><li>そのブックマークを編集し、URLをコピーしたコードへ置換</li><li>艦これを開いてブックマークを実行</li><li>母港や装備画面を操作して取得件数を増やす</li><li>「JSONをコピー」→ HarborDeskの「クリップボードから貼る」</li></ol><small>補助コードはレスポンスを必要項目だけに縮小して保持し、リクエスト本文・api_token・Cookieは記録しない。</small></div></details>
  <textarea id="hdKcImportText" spellcheck="false" placeholder="svdata={...} または複数APIをまとめたJSONを貼り付け"></textarea>
  <div class="hd-kc-import-actions"><button type="button" class="primary" data-hd-kc-parse>内容を解析</button><button type="button" class="ghost" data-hd-kc-clear>入力を消す</button></div>
  <div id="hdKcImportPreview" class="hd-kc-import-preview">${hdKcPreviewHtml(null)}</div>
  <div class="hd-kc-import-options"><label><input type="checkbox" id="hdKcApplyShips" checked>艦隊台帳</label><label><input type="checkbox" id="hdKcApplyEquipment" checked>装備台帳</label><label><input type="checkbox" id="hdKcApplyResources" checked>資源</label><label><input type="checkbox" id="hdKcApplyFleets" checked>現在艦隊</label><label><input type="checkbox" id="hdKcApplyTimers" checked>遠征/入渠タイマー</label><label><input type="checkbox" id="hdKcApplyQuests" checked>任務</label><label><input type="checkbox" id="hdKcApplySorties" checked>出撃ログ</label></div>
  <button type="button" class="primary full" data-hd-kc-apply disabled>HarborDeskへ同期</button>
  <div id="hdKcImportResult" class="hd-kc-import-result muted"></div>
  <div class="hd-kc-import-supported"><b>対応:</b> 母港/艦娘/装備/資源/入渠/任務に加え、api_req_map/start・next、通常/連合艦隊のbattleresult。<br><b>保存しない:</b> api_token、Cookie、DMM認証情報、貼り付けた生レスポンス。</div>
  <div id="hdKcSyncLast" class="muted"></div>
  <div class="hd-kc-current"><div class="hd-kc-current-head"><strong>ゲーム現在艦隊</strong><small>同期した第1〜第4艦隊</small></div><div id="hdKcCurrentFleets"></div></div>
 </div>`;
 wrap.insertBefore(sec,backup);hdKcRenderSyncStatus();hdKcRenderCurrentFleets();
}
async function hdKcReadAndPreview(raw){
 const p=hdKcPreviewData(hdKcParseImport(raw));HD_KC_IMPORT_PREVIEW=p;const el=document.getElementById('hdKcImportPreview');if(el)el.innerHTML=hdKcPreviewHtml(p);const btn=document.querySelector('[data-hd-kc-apply]');if(btn)btn.disabled=false;return p;
}
document.addEventListener('click',async e=>{
 if(e.target.closest?.('[data-hd-kc-copy-capture]')){const ok=await hdKcCopyCaptureHelper();document.getElementById('hdKcImportResult').textContent=ok?'Safari用キャプチャコードをコピーしたよ。下の手順でブックマークURLへ貼ってね。':'コピーできなかったので、このブラウザではJSONファイル/貼り付け取込を使ってね。';return}
 const deck=e.target.closest?.('[data-hd-kc-copy-deck]');if(deck){try{const row=hdKcCopyFleetToCustom(deck.dataset.hdKcCopyDeck);document.getElementById('hdKcImportResult').textContent=`${row.name} を ${typeof selectedMap!=='undefined'?selectedMap:''} の自分用編成へコピーしたよ`}catch(err){document.getElementById('hdKcImportResult').textContent='コピーできなかった: '+String(err?.message||err)}return}
 if(e.target.closest?.('[data-hd-kc-parse]')){const raw=document.getElementById('hdKcImportText')?.value||'';try{await hdKcReadAndPreview(raw);document.getElementById('hdKcImportResult').textContent='解析できたよ。反映する項目を確認して「HarborDeskへ同期」を押してね。'}catch(err){HD_KC_IMPORT_PREVIEW=null;document.getElementById('hdKcImportResult').textContent='解析失敗: '+String(err?.message||err)}return}
 if(e.target.closest?.('[data-hd-kc-paste]')){try{const raw=await navigator.clipboard.readText();document.getElementById('hdKcImportText').value=raw;await hdKcReadAndPreview(raw);document.getElementById('hdKcImportResult').textContent='クリップボードから解析したよ'}catch(err){document.getElementById('hdKcImportResult').textContent='クリップボードを読めなかった: '+String(err?.message||err)}return}
 if(e.target.closest?.('[data-hd-kc-clear]')){HD_KC_IMPORT_PREVIEW=null;const ta=document.getElementById('hdKcImportText');if(ta)ta.value='';const p=document.getElementById('hdKcImportPreview');if(p)p.innerHTML=hdKcPreviewHtml(null);const b=document.querySelector('[data-hd-kc-apply]');if(b)b.disabled=true;return}
 if(e.target.closest?.('[data-hd-kc-apply]')){try{const s=hdKcApplyImport(HD_KC_IMPORT_PREVIEW,{ships:document.getElementById('hdKcApplyShips')?.checked,equipment:document.getElementById('hdKcApplyEquipment')?.checked,resources:document.getElementById('hdKcApplyResources')?.checked,fleets:document.getElementById('hdKcApplyFleets')?.checked,timers:document.getElementById('hdKcApplyTimers')?.checked,quests:document.getElementById('hdKcApplyQuests')?.checked,sorties:document.getElementById('hdKcApplySorties')?.checked});document.getElementById('hdKcImportResult').textContent=`同期完了: 艦娘 ${s.ships} / 装備 ${s.equipment} / 資源 ${s.materials} / 艦隊 ${s.decks} / 遠征 ${s.expeditions||0} / 入渠 ${s.docks||0} / 任務 ${s.quests||0} / 出撃 ${s.sorties||0}`;const ta=document.getElementById('hdKcImportText');if(ta)ta.value='';HD_KC_IMPORT_PREVIEW=null;hdKcRenderSyncStatus();if(typeof renderAllAdvanced==='function')renderAllAdvanced()}catch(err){document.getElementById('hdKcImportResult').textContent='同期失敗: '+String(err?.message||err)}return}
});
document.addEventListener('change',async e=>{
 if(e.target.id==='hdKcImportFile'){const file=e.target.files?.[0];if(!file)return;try{const raw=await file.text();document.getElementById('hdKcImportText').value=raw;await hdKcReadAndPreview(raw);document.getElementById('hdKcImportResult').textContent=`${file.name} を解析したよ`}catch(err){document.getElementById('hdKcImportResult').textContent='ファイルを読めなかった: '+String(err?.message||err)}finally{e.target.value=''}}
});
window.addEventListener('message',e=>{if(e?.data?.type!=='harbordesk-kancolle-import')return;try{hdKcEnsureImport();const raw=e.data.payload;hdKcReadAndPreview(raw);document.getElementById('hdKcImportResult').textContent='外部取込ブリッジからデータを受信したよ'}catch{}});
window.addEventListener('load',()=>setTimeout(hdKcEnsureImport,450));
hdKcEnsureImport();
