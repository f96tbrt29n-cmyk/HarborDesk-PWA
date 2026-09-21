const HD_KC_SYNC_KEY='harbordesk-kancolle-sync-v1';
const HD_KC_USERSCRIPT_VERSION='1.0.13';
const HD_KC_FLEETS_KEY='harbordesk-kancolle-fleets-v1';
const HD_KC_MATERIALS_KEY='harbordesk-kancolle-materials-v1';
const HD_KC_NODE_LABEL_SOURCE='KC3Kai edges.json @ 6b0534d291c27220da1b6fe454e91fc96a6a7b27';
const HD_KC_NODE_LABELS={"1-1":{"1":"A","2":"B","3":"C"},"1-2":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"E"},"1-3":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"E","12":"F","13":"J"},"1-4":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"D","14":"E","15":"H","16":"L","17":"L"},"1-5":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"J","12":"J"},"1-6":{"1":"A","2":"C","3":"E","4":"G","5":"H","6":"K","7":"M","8":"L","9":"J","10":"I","11":"D","12":"F","13":"B","14":"N","15":"K","16":"D","17":"N"},"2-1":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"D","10":"H","11":"H"},"2-2":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"H","13":"K","14":"K"},"2-3":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"M","14":"N","15":"D","16":"F","17":"F","18":"G","19":"K","20":"N"},"2-4":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"M","14":"N","15":"O","16":"P","17":"G","18":"L","19":"L","20":"M","21":"P"},"2-5":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"M","14":"N","15":"O","16":"E","17":"H","18":"I","19":"O","20":"O"},"3-1":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"F","9":"G"},"3-2":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"A","14":"F","15":"F"},"3-3":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"M","14":"G","15":"G","16":"M","17":"M"},"3-4":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"M","14":"N","15":"O","16":"P","17":"B","18":"G","19":"G","20":"H","21":"J","22":"J","23":"P","24":"P"},"3-5":{"1":"B","2":"A","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"J","10":"I","11":"K","12":"E","13":"F","14":"H","15":"K"},"4-1":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"D","12":"H","13":"J"},"4-2":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"C","14":"G","15":"G","16":"L"},"4-3":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"M","14":"N","15":"D","16":"D","17":"G","18":"H","19":"H","20":"I","21":"N","22":"N"},"4-4":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"A","13":"C","14":"E","15":"H","16":"I","17":"I"},"4-5":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"M","14":"N","15":"O","16":"P","17":"Q","18":"R","19":"S","20":"T","21":"D","22":"D","23":"H","24":"H","25":"K","26":"M","27":"N","28":"N","29":"N","30":"T","31":"T","32":"T"},"5-1":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"E","12":"G","13":"J"},"5-2":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"M","14":"N","15":"O","16":"B","17":"F","18":"K","19":"L","20":"O","21":"O"},"5-3":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"M","14":"N","15":"O","16":"P","17":"Q","18":"D","19":"E","20":"J","21":"K","22":"O","23":"O"},"5-4":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"M","14":"N","15":"O","16":"P","17":"D","18":"E","19":"F","20":"H","21":"L","22":"P"},"5-5":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"M","14":"N","15":"O","16":"P","17":"Q","18":"R","19":"S","20":"H","21":"L","22":"L","23":"M","24":"N","25":"O","26":"P","27":"P","28":"S"},"5-6":{"1":"A1","2":"A2","3":"A","4":"B","5":"C1","6":"C2","7":"C","8":"D","9":"E","10":"F","11":"G","12":"A2","13":"B","14":"C2","15":"C2","16":"C","17":"C","18":"H","19":"R","20":"I","21":"J","22":"K1","23":"K","24":"K2","25":"L","26":"M","27":"N","28":"O","29":"P","30":"Q","31":"Q1","32":"Q2","33":"K","34":"L","35":"Start 2","36":"S","37":"T","38":"U","39":"V","40":"W","41":"X","42":"Y","43":"Z","44":"X","45":"X","46":"Q2","47":"T","48":"W"},"6-1":{"1":"B","2":"A","3":"C","4":"D","5":"F","6":"G","7":"I","8":"H","9":"E","10":"J","11":"K","12":"F","13":"F"},"6-2":{"1":"B","2":"C","3":"A","4":"D","5":"F","6":"E","7":"H","8":"G","9":"I","10":"J","11":"K","12":"C","13":"D","14":"F","15":"G","16":"I","17":"K","18":"K"},"6-3":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"E","12":"H"},"6-4":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"M","14":"N","15":"D","16":"D","17":"D","18":"J","19":"I","20":"N","21":"N"},"6-5":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"M","14":"C","15":"G","16":"H","17":"I","18":"M"},"7-1":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"C","13":"C","14":"E","15":"G"},"7-2":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"B","9":"C","10":"H","11":"I","12":"J","13":"K","14":"L","15":"M","16":"I"},"7-3":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"C","8":"E","9":"G","10":"H","11":"I","12":"J","13":"K","14":"L","15":"M","16":"N","17":"O","18":"P","19":"I","20":"J","21":"M","22":"M","23":"P","24":"P","25":"P"},"7-4":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L","13":"M","14":"N","15":"O","16":"P","17":"E","18":"J","19":"K","20":"L","21":"P","22":"P","23":"P"},"7-5":{"1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"D","13":"F","14":"L","15":"M","16":"N","17":"O","18":"P","19":"Q","20":"M","21":"O","22":"R","23":"S","24":"T","25":"T"}};
function hdKcNodeLabel(map,nodeNo){const n=Number(nodeNo)||0;if(!n)return '';return String(HD_KC_NODE_LABELS?.[String(map)]?.[String(n)]||`#${n}`)}
function hdKcHuntNodeMatches(nodeText,label){const l=String(label||'').trim().toUpperCase();if(!l)return false;const tokens=String(nodeText||'').toUpperCase().replace(/ボス/g,'').split(/[\\/／・,、\\s]+/).map(x=>x.trim()).filter(Boolean);return !tokens.length||tokens.includes(l)}
function hdKcMatchingHunt(map,label){try{const rows=typeof hdSLHunts==='function'?hdSLHunts():JSON.parse(localStorage.getItem('harbordesk-drop-hunts-v1')||'[]');return (Array.isArray(rows)?rows:[]).find(h=>!h?.obtained&&String(h?.map||'')===String(map)&&hdKcHuntNodeMatches(h?.node,label))||null}catch{return null}}
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
function hdKcImportEmpty(){return {ships:new Map(),slotItems:new Map(),materials:new Map(),decks:new Map(),ndocks:new Map(),quests:new Map(),questPages:new Set(),questPageCount:0,sortieEvents:[],captureId:'',userscriptVersion:'',admiralLevel:0,sources:new Set(),completeShips:false,completeSlotItems:false,completeDecks:false,completeNdocks:false,completeQuests:false}}
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
 if(Number(data?.api_basic?.api_level)>0)out.admiralLevel=Number(data.api_basic.api_level);
 const fullShips=/api_port\/port/.test(h)||/api_get_member\/ship2/.test(h)||(!h&&shipRows&&deckRows);
 const fullDecks=/api_port\/port/.test(h)||(/api_get_member\/ship2/.test(h)&&deckRows);
 const fullDocks=/api_port\/port/.test(h)||/api_get_member\/ndock/.test(h);
 const fullMaterials=/api_port\/port/.test(h)||/api_get_member\/material/.test(h);
 const fullSlotItems=/api_get_member\/(?:slot_item|slotitem)/.test(h)||(/require_info/.test(h)&&slotRows);
 if(fullShips&&shipRows)out.ships.clear();
 if(fullDecks&&deckRows)out.decks.clear();
 if(fullDocks&&dockRows)out.ndocks.clear();
 if(fullMaterials&&(matRows||Array.isArray(data)))out.materials.clear();
 if(fullSlotItems&&(slotRows||Array.isArray(data)))out.slotItems.clear();
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
 if(/api_get_member\/(?:slot_item|slotitem)/.test(h)||(/require_info/.test(h)&&slotRows))out.completeSlotItems=true;
 if(Array.isArray(data)&&data.length&&'api_slotitem_id' in (data.find(Boolean)||{})&&!h)out.completeSlotItems=true;
 if(Array.isArray(data)&&data.length&&'api_ship_id' in (data.find(Boolean)||{})&&!h)out.completeShips=true;
}
function hdKcParseImport(raw){
 const root=hdKcReadJson(raw),out=hdKcImportEmpty();
 if(root?.format==='harbordesk-kancolle-import'&&root.endpoints&&typeof root.endpoints==='object'){
  for(const [k,v] of Object.entries(root.endpoints))hdKcImportAdd(out,k,v);
 }else if(Array.isArray(root?.records)){
  out.captureId=String(root?.captureId||root?.createdAt||'');
  out.userscriptVersion=String(root?.userscriptVersion||'');
  root.records.forEach((r,i)=>hdKcImportAdd(out,r?.endpoint||r?.path||'',r?.payload??r?.response??r?.data,{at:r?.at,index:i}));
 }else if(root&&typeof root==='object'&&!Array.isArray(root)&&!('api_result' in root)&&!('api_ship' in root)&&!('api_ship_data' in root)&&!('api_slot_item' in root)&&!('api_material' in root)&&!('api_ndock' in root)&&!('api_list' in root)){
  let matched=false;
  for(const [k,v] of Object.entries(root)){
   if(/api_(port|api_get_member|kcsapi)|\/kcsapi\//.test(k)||/^(port|ship2|slot_item|slotitem|material|require_info|ndock|questlist)$/.test(k)){hdKcImportAdd(out,k,v);matched=true}
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
  sources:[...parsed.sources].filter(Boolean),
  userscriptVersion:String(parsed.userscriptVersion||'')
 };
}
function hdKcCoverageFromSources(sources=[],parsed=null){
 const src=(Array.isArray(sources)?sources:[]).map(String),has=re=>src.some(x=>re.test(x));
 return {
  ships:!!parsed?.completeShips||has(/api_port\/port|api_get_member\/ship2/),
  equipment:!!parsed?.completeSlotItems||has(/api_get_member\/(?:slot_item|slotitem|require_info)/),
  resources:has(/api_port\/port|api_get_member\/material/),
  fleets:!!parsed?.completeDecks||has(/api_port\/port|api_get_member\/ship2/),
  quests:has(/api_get_member\/questlist/),
  docks:!!parsed?.completeNdocks||has(/api_port\/port|api_get_member\/ndock/),
  sorties:has(/api_req_map\/(?:start|next)|api_req_(?:sortie|combined_battle)\/battleresult/)
 };
}
function hdKcCoverageForSync(sync){
 if(sync?.coverage&&typeof sync.coverage==='object')return sync.coverage;
 const c=hdKcCoverageFromSources(sync?.sources||[],null);
 if(Number(sync?.ships)>0)c.ships=true;if(Number(sync?.equipment)>0)c.equipment=true;if(Number(sync?.materials)>0)c.resources=true;if(Number(sync?.decks)>0)c.fleets=true;
 if(Number(sync?.quests)>0)c.quests=true;if(Number(sync?.docks)>0)c.docks=true;if(Number(sync?.sorties)>0)c.sorties=true;
 return c;
}
function hdKcNextCaptureHint(sync){
 const c=hdKcCoverageForSync(sync);
 if(!c.ships||!c.resources||!c.fleets)return {state:'needed',title:'母港を一度表示',detail:'艦娘・資源・現在艦隊の基本データを揃えられるよ。'};
 if(!c.equipment)return {state:'needed',title:'装備画面を一度開く',detail:'装備個体と改修★をより完全に同期できるよ。'};
 if(!c.quests)return {state:'needed',title:'任務画面を一度開く',detail:'受注中・達成済みの任務状態も同期できるよ。'};
 if(!c.docks)return {state:'needed',title:'入渠画面を一度開く',detail:'入渠タイマーを同期できるよ。'};
 if(!c.sorties)return {state:'optional',title:'次の出撃後にもう一度同期',detail:'ルート・戦闘結果・ドロップの出撃記録も自動追加できるよ。'};
 return {state:'complete',title:'主要データは取得済み',detail:'このままHarborDeskを使えるよ。必要な時だけ再同期すればOK。'};
}
function hdKcEquipLabel(instance,equipMap){
 const master=equipMap.get(Number(instance?.api_slotitem_id)),name=master?.name||`装備ID ${Number(instance?.api_slotitem_id)||'?'}`,star=Math.max(0,Number(instance?.api_level)||0);
 return name+(star?` ★${star}`:'');
}
function hdKcMergeRoster(parsed){
 const now=Date.now(),existing=(()=>{try{const x=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]');return Array.isArray(x)?x:[]}catch{return []}})(),equipMap=hdKcMasterEquipMap(),used=new Set(),gameIds=new Set(parsed.ships.keys()),next=[];
 const byGameId=new Map(existing.map((x,i)=>[Number(x.gameShipId)||0,i]).filter(([id])=>id));
 for(const ship of parsed.ships.values()){
  const gameId=Number(ship.api_id),masterId=Number(ship.api_ship_id),master=hdKcMasterShip(masterId);
  let idx=byGameId.get(gameId);
  if(idx==null){
   const same=existing.map((x,i)=>({x,i})).filter(({x,i})=>!used.has(i)&&!Number(x.gameShipId)&&Number(x.masterId)===masterId);
   const exactLv=same.find(({x})=>Number(x.level)===Number(ship.api_lv));idx=(exactLv||same[0])?.i;
  }
  if(idx!=null)used.add(idx);
  const old=idx!=null?existing[idx]:{};
  const normalSlotIds=[...(Array.isArray(ship.api_slot)?ship.api_slot:[])],gameGearSlots=normalSlotIds.map(id=>{const item=Number(id)>0?parsed.slotItems.get(Number(id)):null;return item?hdKcEquipLabel(item,equipMap):''}),expansionItem=Number(ship.api_slot_ex)>0?parsed.slotItems.get(Number(ship.api_slot_ex)):null,gameGearExpansion=expansionItem?hdKcEquipLabel(expansionItem,equipMap):'',labels=[...gameGearSlots.filter(Boolean),gameGearExpansion].filter(Boolean);
  next.push({...old,
   id:old.id||`kc-ship-${gameId}`,name:String(master?.name||old.name||`艦娘ID ${masterId||'?'}`),masterId,type:String(master?.type||old.type||'未解決'),level:Number(ship.api_lv)||0,
   gear:parsed.slotItems.size?labels.join(' / '):(old.gear||''),gameGearSlots:parsed.slotItems.size?gameGearSlots:(Array.isArray(old.gameGearSlots)?old.gameGearSlots:[]),gameGearExpansion:parsed.slotItems.size?gameGearExpansion:String(old.gameGearExpansion||''),tags:Array.isArray(old.tags)?old.tags:[],memo:old.memo||'',remodel:old.remodel||'',
   source:'kancolle-import',gameShipId:gameId,gameHp:Number(ship.api_nowhp)||0,gameMaxHp:Number(ship.api_maxhp)||0,gameCond:Number(ship.api_cond)||0,
   gameLos:Array.isArray(ship.api_sakuteki)?Number(ship.api_sakuteki[0])||0:Number(ship.api_sakuteki)||0,gameOnslot:Array.isArray(ship.api_onslot)?ship.api_onslot.map(Number):[],gameFuel:ship.api_fuel==null?null:Number(ship.api_fuel)||0,gameAmmo:ship.api_bull==null?null:Number(ship.api_bull)||0,
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
function hdKcEquipmentHasUserPlan(row){
 if(!row||typeof row!=='object')return false;
 const source=String(row.source||'');
 const memo=String(row.memo||'').trim(),assigned=String(row.assigned||'').trim();
 const star=Math.max(0,Number(row.star)||0),target=Number.isFinite(Number(row.targetStar))?Math.max(0,Number(row.targetStar)):star;
 return source!=='kancolle-import'||!!memo||!!assigned||target!==star;
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
 }else{
  for(const row of existing){
   const key=rowKey(row);if(represented.has(key)||!hdKcEquipmentHasUserPlan(row))continue;
   next.push({...row,count:0,source:'equipment-plan',syncMissing:true,lastOwnedCount:Math.max(0,Number(row?.count)||0),syncedAt:Date.now(),proficiency:{}});
  }
 }

 if(typeof hdSave==='function')hdSave('harbordesk-equipment-v1',next);else{localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(next));window.dispatchEvent(new CustomEvent('hd:equipment-changed'))}
 localStorage.setItem('harbordesk-kancolle-equipment-detail-v1',JSON.stringify(mergedDetails));
 if(typeof renderEquipment==='function')renderEquipment();if(typeof renderDashboard==='function')renderDashboard();
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
function hdKcFleetShipsForCustom(deck){
 return Array.from({length:6},(_,i)=>{
  const s=deck?.ships?.[i];
  return {ship:String(s?.name||''),gameShipId:Number(s?.gameShipId)||0,masterId:Number(s?.masterId)||0,level:Number(s?.level)||0,nowHp:Number(s?.nowHp)||0,maxHp:Number(s?.maxHp)||0,cond:s?.cond==null?null:Number(s.cond),gear:String(s?.gear||'')};
 });
}
function hdKcRefreshLinkedCustomFleets(rows=[]){
 const decks=new Map((Array.isArray(rows)?rows:[]).map(x=>[Number(x?.deckId)||0,x]).filter(([id])=>id));
 if(!decks.size)return 0;
 const all=typeof loadCustomFleets==='function'?loadCustomFleets():(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1')||'{}')||{}}catch{return {}}})();
 let updated=0;
 for(const list of Object.values(all||{})){
  if(!Array.isArray(list))continue;
  for(let i=0;i<list.length;i++){
   const row=list[i];
   if(row?.source!=='kancolle-import')continue;
   const deck=decks.get(Number(row.sourceDeckId)||0);if(!deck)continue;
   const ships=hdKcFleetShipsForCustom(deck),sourceSyncedAt=Number(deck.syncedAt)||Date.now();
   const changed=JSON.stringify(Array.isArray(row.ships)?row.ships:[])!==JSON.stringify(ships);
   if(!changed&&Number(row.sourceSyncedAt)===sourceSyncedAt)continue;
   list[i]={...row,ships,sourceSyncedAt,updatedAt:changed?Date.now():(Number(row.updatedAt)||Date.now())};
   updated++;
  }
 }
 if(updated){
  if(typeof saveCustomFleets==='function')saveCustomFleets(all);else localStorage.setItem('harbordesk-custom-fleets-v1',JSON.stringify(all));
  try{if(typeof selectedMap!=='undefined'&&selectedMap&&typeof renderCustomFleets==='function')renderCustomFleets(selectedMap)}catch{}
  window.dispatchEvent(new CustomEvent('hd:kancolle-linked-fleets-sync',{detail:{updated,deckIds:[...decks.keys()]}}));
 }
 return updated;
}
function hdKcApplyDecks(parsed){
 const ships=parsed.ships,equipMap=hdKcMasterEquipMap(),rows=[...parsed.decks.values()].sort((a,b)=>Number(a.api_id)-Number(b.api_id)).map(deck=>({
  deckId:Number(deck.api_id),name:String(deck.api_name||`第${deck.api_id}艦隊`),mission:Array.isArray(deck.api_mission)?deck.api_mission.slice(0,4):[],
  ships:(Array.isArray(deck.api_ship)?deck.api_ship:[]).filter(id=>Number(id)>0).map(id=>{
   const s=ships.get(Number(id)),m=s?hdKcMasterShip(s.api_ship_id):null,normalIds=[...(Array.isArray(s?.api_slot)?s.api_slot:[])],gearSlots=normalIds.map(x=>{const item=Number(x)>0?parsed.slotItems.get(Number(x)):null;return item?hdKcEquipLabel(item,equipMap):''}),expItem=Number(s?.api_slot_ex)>0?parsed.slotItems.get(Number(s.api_slot_ex)):null,gearExpansion=expItem?hdKcEquipLabel(expItem,equipMap):'',gear=[...gearSlots.filter(Boolean),gearExpansion].filter(Boolean).join(' / ');
   return {gameShipId:Number(id),masterId:Number(s?.api_ship_id)||0,name:String(m?.name||''),level:Number(s?.api_lv)||0,nowHp:Number(s?.api_nowhp)||0,maxHp:Number(s?.api_maxhp)||0,cond:Number(s?.api_cond)||0,gear,gearSlots,gearExpansion}
  }),
  syncedAt:Date.now()
 }));
 localStorage.setItem(HD_KC_FLEETS_KEY,JSON.stringify(rows));hdKcRefreshLinkedCustomFleets(rows);hdKcRenderCurrentFleets();return rows.length;
}
function hdKcCurrentFleets(){
 try{const x=JSON.parse(localStorage.getItem(HD_KC_FLEETS_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}
}
function hdKcOpenShipFromFleet(name){
 const ship=String(name||'').trim();if(!ship)return false;
 if(typeof hdQNRecordRecent==='function')hdQNRecordRecent('shipDatabase');
 if(typeof hdShipDbJumpTo==='function'){hdShipDbJumpTo(ship);return true}
 if(typeof hdWSShowElement==='function')hdWSShowElement('shipDatabase',true);
 else document.getElementById('shipDatabase')?.scrollIntoView({behavior:'smooth',block:'start'});
 setTimeout(()=>{const input=document.getElementById('hdShipDbSearch');if(input){input.value=ship;if(typeof hdShipDbViewSave==='function')hdShipDbViewSave({query:ship});input.dispatchEvent(new Event('input',{bubbles:true}))}},80);
 return true;
}
function hdKcCopyFleetToCustom(deckId,map=''){
 const deck=hdKcCurrentFleets().find(x=>Number(x.deckId)===Number(deckId)),target=String(map||(typeof selectedMap!=='undefined'?selectedMap:'')||'').trim();
 if(!deck)throw new Error('ゲーム艦隊が見つからない');
 if(!target)throw new Error('先に攻略海域を選んでね');
 const all=typeof loadCustomFleets==='function'?loadCustomFleets():(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1')||'{}')||{}}catch{return {}}})();
 all[target]=all[target]||[];
 const ships=hdKcFleetShipsForCustom(deck);
 const existing=all[target].findIndex(x=>Number(x.sourceDeckId)===Number(deck.deckId)&&x.source==='kancolle-import');
 const row={id:existing>=0?all[target][existing].id:(typeof cfUid==='function'?cfUid():`kc-fleet-${deck.deckId}-${Date.now()}`),name:`ゲーム同期｜${deck.name}`,ships,memo:`艦これゲーム内の${deck.name}から同期`,source:'kancolle-import',sourceDeckId:Number(deck.deckId),sourceSyncedAt:Number(deck.syncedAt)||Date.now(),createdAt:existing>=0?all[target][existing].createdAt:Date.now(),updatedAt:Date.now()};
 if(existing>=0)all[target][existing]=row;else all[target].push(row);
 if(typeof saveCustomFleets==='function')saveCustomFleets(all);else localStorage.setItem('harbordesk-custom-fleets-v1',JSON.stringify(all));
 if(typeof renderCustomFleets==='function')renderCustomFleets(target);
 return row;
}
function hdKcSelectFleetForSortie(map,fleetId){
 const target=String(map||'').trim(),id=String(fleetId||'');if(!target||!id)return false;
 if(typeof hdSortieSetSelection==='function'){hdSortieSetSelection(target,id);return true}
 try{const all=JSON.parse(localStorage.getItem('harbordesk-sortie-selection-v1')||'{}')||{};all[target]=id;localStorage.setItem('harbordesk-sortie-selection-v1',JSON.stringify(all));return true}catch{return false}
}
function hdKcPrepareCurrentFleet(deckId,map=''){
 const target=String(map||(typeof selectedMap!=='undefined'?selectedMap:'')||'').trim();if(!target)throw new Error('先に攻略海域を選んでね');
 const row=hdKcCopyFleetToCustom(deckId,target);hdKcSelectFleetForSortie(target,row.id);
 if(typeof hdSPSOpen==='function')setTimeout(()=>hdSPSOpen(),40);
 else if(typeof hdWSShowElement==='function')setTimeout(()=>hdWSShowElement('hdSortiePreparation',true),40);
 return row;
}
function hdKcRenderCurrentFleets(){
 const host=document.getElementById('hdKcCurrentFleets');if(!host)return;const rows=hdKcCurrentFleets();
 if(!rows.length){host.innerHTML='<div class="hd-kc-import-empty">現在艦隊はまだ同期されてないよ</div>';return}
 const map=typeof selectedMap!=='undefined'?selectedMap:'';
 host.innerHTML=rows.map(deck=>`<article class="hd-kc-deck"><div class="hd-kc-deck-head"><div><strong>${hdKcEsc(deck.name)}</strong><small>第${deck.deckId}艦隊 ・ ${deck.ships?.length||0}隻</small></div></div><div class="hd-kc-deck-actions"><button type="button" class="ghost small" data-hd-kc-jump="roster">艦隊台帳</button><button type="button" class="ghost small" data-hd-kc-jump="guide">攻略</button><button type="button" class="ghost small" data-hd-kc-copy-deck="${deck.deckId}">${map?`${hdKcEsc(map)}へコピー`:'海域を選んでコピー'}</button><button type="button" class="primary small" data-hd-kc-prepare-deck="${deck.deckId}">${map?'この艦隊で出撃準備':'海域を選んで出撃準備'}</button></div><div class="hd-kc-deck-ships">${(deck.ships||[]).map((s,i)=>{const image=s.name&&typeof hdShipImageThumbHtml==='function'?hdShipImageThumbHtml(Number(s.masterId)>0?{id:Number(s.masterId),name:s.name}:s.name,'kc-deck-thumb'):'';return `<button type="button" class="hd-kc-deck-ship" data-hd-kc-ship="${hdKcEsc(s.name||'')}"><span>${i+1}</span>${image}<div><b>${hdKcEsc(s.name||'未解決')}</b><small>Lv.${Number(s.level)||0}</small><em>${hdKcEsc(s.gear||'装備データなし')}</em></div><i aria-hidden="true">›</i></button>`}).join('')}</div></article>`).join('');
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
  const route=active.route.filter(Boolean),routeLabels=route.map(n=>hdKcNodeLabel(active.map,n)),lastLabel=hdKcNodeLabel(active.map,active.lastNode),node=lastLabel?(lastLabel+(boss?' ボス':'')):'';
  const hunt=hdKcMatchingHunt(active.map,lastLabel),targetObtained=!!(hunt&&active.lastDrop&&String(hunt.ship||'')===String(active.lastDrop));
  const memo=[`ゲーム同期`,routeLabels.length?`ルート ${routeLabels.join('→')}`:'',retreat?'帰投/撤退':''].filter(Boolean).join('｜');
  const payload={map:active.map,node,result:retreat?'撤退':(active.lastResult||'不明'),boss,retreat,battles:active.battles,drop:active.lastDrop||'',memo,huntId:hunt?.id||'',huntShip:hunt?.ship||'',targetObtained,source:'kancolle-import',gameSortieKey:key,gameNodeNo:active.lastNode,gameNodeLabel:lastLabel,gameBossCellNo:active.bossCellNo,gameBossCellLabel:hdKcNodeLabel(active.map,active.bossCellNo),gameRouteNodes:route,gameRouteLabels:routeLabels,gameBattleResults:active.results.map(x=>({...x,nodeLabel:hdKcNodeLabel(active.map,x.nodeNo)})),startedAt:active.startedAt||0};
  const matched=typeof hdSSIngestGameSortie==='function'?hdSSIngestGameSortie(payload):null;
  const entry=matched||hdSLRecordEntry(payload);
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
function hdKcStateSnapshot(){
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
 const roster=read('harbordesk-ship-roster-v1',[]),equipment=read('harbordesk-equipment-v1',[]),materials=read(HD_KC_MATERIALS_KEY,{});
 const equipRows=Array.isArray(equipment)?equipment:[];
 return {
  ships:Array.isArray(roster)?roster.length:0,
  equipmentRows:equipRows.length,
  equipment:equipRows.reduce((sum,x)=>sum+Math.max(0,Number(x?.count)||0),0),
  resources:Object.fromEntries(['fuel','ammo','steel','bauxite','instantBuild','bucket','devMaterial','screw'].map(k=>[k,Number.isFinite(Number(materials?.[k]))?Number(materials[k]):null]))
 };
}
function hdKcSyncDelta(before,after,parsed,opts,hasBaseline){
 const delta={baseline:!!hasBaseline,ships:null,equipment:null,resources:{}};
 if(opts.ships!==false&&parsed.ships.size)delta.ships=Number(after.ships||0)-Number(before.ships||0);
 if(opts.equipment!==false&&parsed.slotItems.size)delta.equipment=Number(after.equipment||0)-Number(before.equipment||0);
 if(opts.resources!==false&&parsed.materials.size){
  for(const k of ['fuel','ammo','steel','bauxite','instantBuild','bucket','devMaterial','screw']){
   const a=before.resources?.[k],b=after.resources?.[k];if(a!=null&&b!=null)delta.resources[k]=b-a;
  }
 }
 return delta;
}
function hdKcSigned(n){const v=Number(n)||0;return v>0?'+'+v.toLocaleString('ja-JP'):v.toLocaleString('ja-JP')}
function hdKcDeltaParts(sync){
 const d=sync?.delta;if(!d?.baseline)return [];
 const parts=[];
 if(Number(d.ships))parts.push('艦娘 '+hdKcSigned(d.ships));
 if(Number(d.equipment))parts.push('装備 '+hdKcSigned(d.equipment));
 const labels={fuel:'燃料',ammo:'弾薬',steel:'鋼材',bauxite:'ボーキ',instantBuild:'高速建造',bucket:'バケツ',devMaterial:'開発資材',screw:'ネジ'};
 for(const k of ['fuel','ammo','steel','bauxite','instantBuild','bucket','devMaterial','screw'])if(Number(d.resources?.[k]))parts.push(labels[k]+' '+hdKcSigned(d.resources[k]));
 return parts;
}
function hdKcDeltaHtml(sync){
 if(!sync?.delta)return '';
 if(!sync.delta.baseline)return '<span class="hd-kc-sync-delta-first">初回同期の基準を保存したよ</span>';
 const parts=hdKcDeltaParts(sync);return parts.length?parts.map(x=>'<span>'+hdKcEsc(x)+'</span>').join(''):'<span class="hd-kc-sync-delta-none">前回同期から大きな変化なし</span>';
}
function hdKcApplyImport(preview,opts={}){
 const parsed=preview?.parsed;if(!parsed)throw new Error('先にデータを解析してください');
 const previous=hdKcSyncStatus(),before=hdKcStateSnapshot();
 const result={ships:0,equipment:0,materials:0,decks:0,expeditions:0,docks:0,quests:0,sorties:0};
 if(opts.ships!==false&&parsed.ships.size)result.ships=hdKcMergeRoster(parsed);
 if(opts.equipment!==false&&parsed.slotItems.size)result.equipment=hdKcMergeEquipment(parsed);
 if(opts.resources!==false&&parsed.materials.size)result.materials=hdKcApplyMaterials(parsed);
 if(opts.fleets!==false&&parsed.decks.size)result.decks=hdKcApplyDecks(parsed);
 if(opts.timers!==false&&(parsed.decks.size||parsed.ndocks.size)){const t=hdKcApplyTimers(parsed);result.expeditions=t.expeditions;result.docks=t.docks}
 if(opts.quests!==false&&parsed.quests.size)result.quests=hdKcApplyQuests(parsed);
 if(opts.sorties!==false&&parsed.sortieEvents.length)result.sorties=hdKcApplySorties(parsed);
 const snapshot=hdKcStateSnapshot(),delta=hdKcSyncDelta(before,snapshot,parsed,opts,!!previous),coverage=hdKcCoverageFromSources(preview.sources,parsed);
 const integrity={
  ships:{source:parsed.ships.size,saved:result.ships,complete:!!parsed.completeShips,ok:!parsed.completeShips||result.ships===parsed.ships.size},
  equipment:{source:parsed.slotItems.size,saved:snapshot.equipment,rows:snapshot.equipmentRows,complete:!!parsed.completeSlotItems,ok:!parsed.completeSlotItems||snapshot.equipment===parsed.slotItems.size}
 };
 integrity.verified=integrity.ships.complete&&integrity.equipment.complete;
 integrity.ok=(!integrity.ships.complete||integrity.ships.ok)&&(!integrity.equipment.complete||integrity.equipment.ok);
 const sync={syncedAt:Date.now(),sources:preview.sources,userscriptVersion:String(preview.userscriptVersion||''),admiralLevel:Number(parsed.admiralLevel)||Number(previous?.admiralLevel)||0,coverage,ships:result.ships,equipment:result.equipment,equipmentRows:snapshot.equipmentRows,equipmentItems:snapshot.equipment,materials:result.materials,decks:result.decks,expeditions:result.expeditions,docks:result.docks,quests:result.quests,sorties:result.sorties,unknownShips:preview.unknownShips,unknownEquip:preview.unknownEquip,snapshot,integrity,delta};
 localStorage.setItem(HD_KC_SYNC_KEY,JSON.stringify(sync));window.dispatchEvent(new CustomEvent('hd:kancolle-sync',{detail:sync}));hdKcRenderSyncStatus();hdKcRenderCurrentFleets();hdKcNotifySyncSuccess(sync);
 return sync;
}
function hdKcVersionCompare(a,b){
 const pa=String(a||'').split('.').map(x=>Number(x)||0),pb=String(b||'').split('.').map(x=>Number(x)||0),n=Math.max(pa.length,pb.length);
 for(let i=0;i<n;i++){const d=(pa[i]||0)-(pb[i]||0);if(d)return d>0?1:-1}
 return 0;
}
function hdKcRenderUserscriptStatus(sync){
 const el=document.getElementById('hdKcUserscriptStatus');if(!el)return;
 const v=String(sync?.userscriptVersion||'');
 if(!sync){el.hidden=true;return}
 el.hidden=false;
 if(!v){el.className='hd-kc-userscript-status unknown';el.innerHTML='<span>Userscript</span><strong>バージョン不明</strong><small>次回同期すると確認できるよ。</small>';return}
 const old=hdKcVersionCompare(v,HD_KC_USERSCRIPT_VERSION)<0;
 el.className='hd-kc-userscript-status '+(old?'outdated':'current');
 el.innerHTML=old?`<span>Userscript</span><strong>v${hdKcEsc(v)} → v${HD_KC_USERSCRIPT_VERSION}</strong><small>連携スクリプトの更新があります。</small><a class="ghost small" href="./HarborDesk-Kancolle.user.js" target="_blank" rel="noopener">更新する</a>`:`<span>Userscript</span><strong>v${hdKcEsc(v)} 最新</strong><small>連携スクリプトは最新だよ。</small>`;
}
function hdKcSyncStatus(){
 try{return JSON.parse(localStorage.getItem(HD_KC_SYNC_KEY)||'null')}catch{return null}
}
function hdKcNotifySyncSuccess(sync){
 if(!sync)return;
 const delta=sync.delta,parts=hdKcDeltaParts(sync);
 let message='';
 if(!delta?.baseline)message='同期完了：初回同期の基準を保存したよ';
 else if(parts.length)message='同期完了：'+parts.slice(0,3).join(' / ')+(parts.length>3?' ほか':'' );
 else message='同期完了：前回から大きな変化なし';

 let target='kancolleImport',label='同期詳細';
 if(delta?.baseline&&Number(delta.ships)){target='roster';label='艦隊を見る'}
 else if(delta?.baseline&&Number(delta.equipment)){target='equipmentBook';label='装備を見る'}
 else if(delta?.baseline&&Object.values(delta.resources||{}).some(v=>Number(v))){target='resources';label='資源を見る'}

 const open=()=>{
  if(typeof hdQNRecordRecent==='function')hdQNRecordRecent(target);
  if(typeof hdWSShowElement==='function'&&hdWSShowElement(target,true))return;
  document.getElementById(target)?.scrollIntoView({behavior:'smooth',block:'start'});
 };
 if(typeof window.hdToastAction==='function')window.hdToastAction(message,label,open,7000);
 else if(typeof window.hdToast==='function')window.hdToast(message,'ok',4500);
}
function hdKcPreviewHtml(p){
 if(!p)return '<div class="hd-kc-import-empty">JSONを読み込むと内容をここで確認できるよ</div>';
 return `<div class="hd-kc-import-stats"><div><span>艦娘</span><strong>${p.ships}</strong><small>${p.completeShips?'全件同期候補':'部分データ'}</small></div><div><span>装備個体</span><strong>${p.slotItems}</strong><small>${p.completeSlotItems?'全件同期候補':'部分データ'}</small></div><div><span>資源</span><strong>${p.materials}</strong></div><div><span>艦隊</span><strong>${p.decks}</strong></div><div><span>遠征中</span><strong>${p.expeditions||0}</strong></div><div><span>入渠中</span><strong>${p.docks||0}</strong></div><div><span>任務</span><strong>${p.activeQuests||0}</strong><small>${p.completeQuests?'全ページ取得':'取得ページ内'}</small></div><div><span>出撃</span><strong>${p.sortieStarts||0}</strong><small>戦闘結果 ${p.battleResults||0}</small></div></div>${p.unknownShips||p.unknownEquip?`<div class="hd-kc-import-warn">未解決: 艦娘 ${p.unknownShips} / 装備 ${p.unknownEquip}</div>`:''}<small>検出元: ${p.sources.map(hdKcEsc).join(' / ')||'自動判定'}</small>`;
}
function hdKcRenderSyncStatus(){
 const el=document.getElementById('hdKcSyncLast'),headline=document.getElementById('hdKcSyncHeadline'),box=document.querySelector('.hd-kc-sync-overview'),s=hdKcSyncStatus();
 const equipRows=s?Number(s.equipmentRows??s.equipment)||0:0,equipItems=s?Number(s.equipmentItems??s.snapshot?.equipment??s.equipment)||0:0;
 if(el)el.textContent=s?`最終同期 ${new Date(s.syncedAt).toLocaleString('ja-JP')} ・ 艦娘${s.ships} / 装備台帳${equipRows}種類・${equipItems}個 / 資源${s.materials} / 艦隊${s.decks} / 遠征${s.expeditions||0} / 入渠${s.docks||0} / 任務${s.quests||0} / 出撃${s.sorties||0}`:'まだ同期してないよ';
 if(headline)headline.textContent=s?'艦これデータは同期済み':'まず艦これから同期しよう';
 if(box)box.classList.toggle('is-synced',!!s);
 const delta=document.getElementById('hdKcSyncDelta');if(delta){delta.hidden=!s;delta.innerHTML=s?hdKcDeltaHtml(s):''}
 const coverage=document.getElementById('hdKcSyncCoverage');
 if(coverage){
  if(!s)coverage.innerHTML='<span class="muted">同期すると取得状況がここに出るよ</span>';
  else{
   const c=hdKcCoverageForSync(s),rows=[['艦娘','ships',s.ships],['装備','equipment',{rows:equipRows,items:equipItems}],['資源','resources',s.materials],['艦隊','fleets',s.decks],['任務','quests',s.quests],['入渠','docks',s.docks],['出撃','sorties',s.sorties]];
   const integrity=s.integrity,check=integrity?.verified?(integrity.ok?`台帳反映確認: 艦隊 ${integrity.ships.saved}/${integrity.ships.source}隻・装備 ${integrity.equipment.saved}/${integrity.equipment.source}個 ✓`:`台帳反映に差異あり: 艦隊 ${integrity.ships.saved}/${integrity.ships.source}・装備 ${integrity.equipment.saved}/${integrity.equipment.source}`):'';
   coverage.innerHTML='<div class="hd-kc-coverage-chips">'+rows.map(([name,key,count])=>{const captured=!!c[key],isEquip=key==='equipment',n=isEquip?Number(count?.items)||0:Number(count)||0,label=!captured?'未取得':isEquip?(n>0?`${Number(count?.rows)||0}種類・${n}個`:'取得済み・0'):(n>0?String(n):'取得済み・0');return `<span class="${captured?'ok':'missing'}"><b>${name}</b> ${label}</span>`}).join('')+`</div><small>「取得済み・0」は通信を取得した上で該当データが0件。「未取得」はその画面の通信をまだ拾っていない状態だよ。${check?'<br>'+hdKcEsc(check):''}</small>`;
  }
 }
 const recommendation=document.getElementById('hdKcSyncRecommendation');
 if(recommendation){
  if(!s)recommendation.hidden=true;
  else{const r=hdKcNextCaptureHint(s);recommendation.hidden=false;recommendation.className='hd-kc-sync-recommendation '+r.state;recommendation.innerHTML=`<span>次のおすすめ</span><strong>${hdKcEsc(r.title)}</strong><small>${hdKcEsc(r.detail)}</small>`;}
 }
 const back=document.querySelector('[data-hd-kc-return-game]');if(back)back.hidden=sessionStorage.getItem('harbordesk-kc-return-game-v1')!=='1';
 hdKcRenderUserscriptStatus(s);
 const next=document.getElementById('hdKcNextActions');if(next)next.hidden=!s;
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
function hdKcBase64UrlBytes(text){
 const s=String(text||'').replace(/-/g,'+').replace(/_/g,'/');const pad=s+'='.repeat((4-s.length%4)%4),bin=atob(pad),out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;
}
async function hdKcDecodeHandoff(token){
 const dot=String(token||'').indexOf('.');if(dot<1)throw new Error('連携データ形式が不正です');
 const mode=token.slice(0,dot),bytes=hdKcBase64UrlBytes(token.slice(dot+1));let raw=bytes;
 if(mode==='g'){
  if(typeof DecompressionStream!=='function')throw new Error('このSafariは圧縮連携データの展開に対応していません');
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  raw=new Uint8Array(await new Response(stream).arrayBuffer());
 }else if(mode!=='j')throw new Error('未知の連携データ形式です');
 return new TextDecoder().decode(raw);
}
let HD_KC_HASH_IMPORT_CONSUMED=false;
async function hdKcConsumeWindowNameImport(){
 const prefix='HARBORDESK_KC_IMPORT_V1:';const value=String(window.name||'');if(!value.startsWith(prefix))return false;
 window.name='';
 try{
  hdKcEnsureImport();
  const preview=await hdKcReadAndPreview(value.slice(prefix.length));
  const sync=hdKcApplyImport(preview,{ships:true,equipment:true,resources:true,fleets:true,timers:true,quests:true,sorties:true});
  const result=document.getElementById('hdKcImportResult');
  if(result)result.textContent=`Userscriptsから自動同期完了: 艦娘 ${sync.ships} / 装備 ${sync.equipment} / 資源 ${sync.materials} / 艦隊 ${sync.decks} / 遠征 ${sync.expeditions||0} / 入渠 ${sync.docks||0} / 任務 ${sync.quests||0} / 出撃 ${sync.sorties||0}`;
  const sec=document.getElementById('kancolleImport');if(sec)sec.scrollIntoView({block:'start'});
  sessionStorage.setItem('harbordesk-kc-return-game-v1','1');
  window.dispatchEvent(new CustomEvent('hd:kancolle-return-ready'));
  HD_KC_IMPORT_PREVIEW=null;hdKcRenderSyncStatus();if(typeof renderAllAdvanced==='function')renderAllAdvanced();
  return true;
 }catch(err){
  const result=document.getElementById('hdKcImportResult');if(result)result.textContent='Userscripts連携データの取込失敗: '+String(err?.message||err);
  return false;
 }
}
async function hdKcConsumeHashImport(){
 if(HD_KC_HASH_IMPORT_CONSUMED)return false;
 const m=String(location.hash||'').match(/^#kcimport=([gj]\.[A-Za-z0-9_-]+)$/);if(!m)return false;
 HD_KC_HASH_IMPORT_CONSUMED=true;
 try{history.replaceState(null,'',location.pathname+location.search+'#kancolleImport')}catch{}
 try{
  const raw=await hdKcDecodeHandoff(m[1]);
  hdKcEnsureImport();
  const preview=await hdKcReadAndPreview(raw);
  const sync=hdKcApplyImport(preview,{ships:true,equipment:true,resources:true,fleets:true,timers:true,quests:true,sorties:true});
  const result=document.getElementById('hdKcImportResult');
  if(result)result.textContent=`Userscriptsから自動同期完了: 艦娘 ${sync.ships} / 装備 ${sync.equipment} / 資源 ${sync.materials} / 艦隊 ${sync.decks} / 遠征 ${sync.expeditions||0} / 入渠 ${sync.docks||0} / 任務 ${sync.quests||0} / 出撃 ${sync.sorties||0}`;
  const sec=document.getElementById('kancolleImport');if(sec)sec.scrollIntoView({block:'start'});
  sessionStorage.setItem('harbordesk-kc-return-game-v1','1');
  window.dispatchEvent(new CustomEvent('hd:kancolle-return-ready'));
  HD_KC_IMPORT_PREVIEW=null;hdKcRenderSyncStatus();if(typeof renderAllAdvanced==='function')renderAllAdvanced();
  return true;
 }catch(err){
  hdKcEnsureImport();
  const result=document.getElementById('hdKcImportResult');if(result)result.textContent='Userscripts連携データの取込失敗: '+String(err?.message||err);
  return false;
 }
}
function hdKcEnsureImport(){
 const wrap=document.getElementById('advancedToolsWrap'),backup=document.getElementById('backup');if(!wrap||!backup||document.getElementById('kancolleImport'))return;
 const synced=!!hdKcSyncStatus();
 const sec=document.createElement('section');sec.id='kancolleImport';sec.className='advanced-section';sec.innerHTML=`
 <div class="section-head"><div><div class="eyebrow">GAME DATA IMPORT</div><h2>艦これゲーム内データ取込</h2></div><span class="muted">端末内処理</span></div>
 <div class="hd-kc-import card">
  <div class="hd-kc-sync-overview"><div><span>連携状態</span><strong id="hdKcSyncHeadline">確認中…</strong></div><div class="hd-kc-sync-side"><div id="hdKcSyncLast" class="muted"></div><button type="button" class="ghost small" data-hd-kc-return-game hidden>艦これへ戻る</button></div></div><div id="hdKcSyncDelta" class="hd-kc-sync-delta"></div><div id="hdKcSyncCoverage" class="hd-kc-sync-coverage"></div><div id="hdKcSyncRecommendation" class="hd-kc-sync-recommendation" hidden></div><div id="hdKcUserscriptStatus" class="hd-kc-userscript-status" hidden></div><div id="hdKcNextActions" class="hd-kc-next-actions" hidden><span>次に見る</span><div><button type="button" class="ghost small" data-hd-kc-jump="roster">艦隊台帳</button><button type="button" class="ghost small" data-hd-kc-jump="equipmentBook">装備台帳</button><button type="button" class="ghost small" data-hd-kc-jump="quests">任務</button><button type="button" class="ghost small" data-hd-kc-jump="sortieLog">出撃記録</button></div></div>
  <div id="hdKcImportResult" class="hd-kc-import-result muted" aria-live="polite"></div>
  <details class="hd-kc-capture-guide" data-hd-kc-auto-guide open><summary>Userscripts 自動連携</summary><div><p>艦これを開くだけで対応APIを自動取得。ゲーム画面の「HarborDeskへ送る」でそのまま同期できるよ。</p><div class="hd-kc-import-actions"><a class="primary" href="./HarborDesk-Kancolle.user.js" target="_blank" rel="noopener">Userscripts版を確認・更新</a></div><ol><li>Userscriptsを有効にする</li><li>艦これを開き直す</li><li>母港・装備・任務などを一度開く</li><li>「HarborDeskへ送る」を押す</li></ol><small>リクエスト本文・api_token・Cookie・DMMログイン情報は保存しない。</small></div></details>
  <details class="hd-kc-capture-guide"><summary>その他の取込方法</summary><div>
   <div class="hd-kc-import-actions"><label class="ghost hd-kc-import-file">JSONファイルを選ぶ<input id="hdKcImportFile" type="file" accept=".json,.txt,application/json,text/plain"></label><button type="button" class="ghost" data-hd-kc-paste>クリップボードから貼る</button></div>
   <details class="hd-kc-manual-panel"><summary>手動JSON取込の詳細</summary><div>
    <textarea id="hdKcImportText" spellcheck="false" placeholder="svdata={...} または複数APIをまとめたJSONを貼り付け"></textarea>
    <div class="hd-kc-import-actions"><button type="button" class="primary" data-hd-kc-parse>内容を解析</button><button type="button" class="ghost" data-hd-kc-clear>入力を消す</button></div>
    <div id="hdKcImportPreview" class="hd-kc-import-preview">${hdKcPreviewHtml(null)}</div>
    <div class="hd-kc-import-options"><label><input type="checkbox" id="hdKcApplyShips" checked>艦隊台帳</label><label><input type="checkbox" id="hdKcApplyEquipment" checked>装備台帳</label><label><input type="checkbox" id="hdKcApplyResources" checked>資源</label><label><input type="checkbox" id="hdKcApplyFleets" checked>現在艦隊</label><label><input type="checkbox" id="hdKcApplyTimers" checked>遠征/入渠タイマー</label><label><input type="checkbox" id="hdKcApplyQuests" checked>任務</label><label><input type="checkbox" id="hdKcApplySorties" checked>出撃ログ</label></div>
    <button type="button" class="primary full" data-hd-kc-apply disabled>HarborDeskへ同期</button>
   </div></details>
  </div></details>
  <details class="hd-kc-capture-guide"><summary>Safariブックマーク方式（予備）</summary><div><p>Userscriptsが使えない時だけ使う予備方式。</p><button type="button" class="ghost" data-hd-kc-copy-capture>Safari用コードをコピー</button></div></details>
  <div class="hd-kc-import-supported"><b>対応:</b> 母港/艦娘/装備/資源/入渠/任務、出撃開始・進行、通常/連合艦隊の戦闘結果。<br><b>保存しない:</b> api_token、Cookie、DMM認証情報、生レスポンス。</div>
  <div class="hd-kc-current"><div class="hd-kc-current-head"><strong>ゲーム現在艦隊</strong><small>同期した第1〜第4艦隊</small></div><div id="hdKcCurrentFleets"></div></div>
 </div>`;
 wrap.insertBefore(sec,backup);if(synced)sec.querySelector('[data-hd-kc-auto-guide]')?.removeAttribute('open');hdKcRenderSyncStatus();hdKcRenderCurrentFleets();
}
async function hdKcReadAndPreview(raw){
 const p=hdKcPreviewData(hdKcParseImport(raw));HD_KC_IMPORT_PREVIEW=p;const el=document.getElementById('hdKcImportPreview');if(el)el.innerHTML=hdKcPreviewHtml(p);const btn=document.querySelector('[data-hd-kc-apply]');if(btn)btn.disabled=false;return p;
}
document.addEventListener('click',async e=>{
 const ship=e.target.closest?.('[data-hd-kc-ship]');if(ship){hdKcOpenShipFromFleet(ship.dataset.hdKcShip);return}
 const jump=e.target.closest?.('[data-hd-kc-jump]');if(jump){const id=jump.dataset.hdKcJump;if(typeof hdQNRecordRecent==='function')hdQNRecordRecent(id);if(typeof hdWSShowElement==='function')hdWSShowElement(id,true);else document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});return}
 if(e.target.closest?.('[data-hd-kc-return-game]')){
  sessionStorage.removeItem('harbordesk-kc-return-game-v1');
  const here=location.href;
  try{history.back()}catch{}
  setTimeout(()=>{if(location.href===here)location.href='https://play.games.dmm.com/game/kancolle'},500);
  return;
 }
 if(e.target.closest?.('[data-hd-kc-copy-capture]')){const ok=await hdKcCopyCaptureHelper();document.getElementById('hdKcImportResult').textContent=ok?'Safari用キャプチャコードをコピーしたよ。下の手順でブックマークURLへ貼ってね。':'コピーできなかったので、このブラウザではJSONファイル/貼り付け取込を使ってね。';return}
 const prepare=e.target.closest?.('[data-hd-kc-prepare-deck]');if(prepare){const map=String(typeof selectedMap!=='undefined'?selectedMap:'').trim();if(!map){document.getElementById('hdKcImportResult').textContent='先に攻略から海域を選んでね。選んだ後、現在艦隊をそのまま出撃準備判定へ送れるよ。';if(typeof hdWSShowElement==='function')hdWSShowElement('guide',true);else document.getElementById('guide')?.scrollIntoView({behavior:'smooth',block:'start'});return}try{const row=hdKcPrepareCurrentFleet(prepare.dataset.hdKcPrepareDeck,map);document.getElementById('hdKcImportResult').textContent=`${row.name} を選択して ${map} の出撃準備表を開くよ`}catch(err){document.getElementById('hdKcImportResult').textContent='出撃準備へ送れなかった: '+String(err?.message||err)}return}
  const deck=e.target.closest?.('[data-hd-kc-copy-deck]');if(deck){const map=String(typeof selectedMap!=='undefined'?selectedMap:'').trim();if(!map){document.getElementById('hdKcImportResult').textContent='先に攻略から海域を選んでね。選んだ後、この艦隊をその海域へコピーできるよ。';if(typeof hdWSShowElement==='function')hdWSShowElement('guide',true);else document.getElementById('guide')?.scrollIntoView({behavior:'smooth',block:'start'});return}try{const row=hdKcCopyFleetToCustom(deck.dataset.hdKcCopyDeck,map);document.getElementById('hdKcImportResult').textContent=`${row.name} を ${map} の自分用編成へコピーしたよ`}catch(err){document.getElementById('hdKcImportResult').textContent='コピーできなかった: '+String(err?.message||err)}return}
 if(e.target.closest?.('[data-hd-kc-parse]')){const raw=document.getElementById('hdKcImportText')?.value||'';try{await hdKcReadAndPreview(raw);document.getElementById('hdKcImportResult').textContent='解析できたよ。反映する項目を確認して「HarborDeskへ同期」を押してね。'}catch(err){HD_KC_IMPORT_PREVIEW=null;document.getElementById('hdKcImportResult').textContent='解析失敗: '+String(err?.message||err)}return}
 if(e.target.closest?.('[data-hd-kc-paste]')){try{const raw=await navigator.clipboard.readText();document.getElementById('hdKcImportText').value=raw;await hdKcReadAndPreview(raw);document.getElementById('hdKcImportResult').textContent='クリップボードから解析したよ'}catch(err){document.getElementById('hdKcImportResult').textContent='クリップボードを読めなかった: '+String(err?.message||err)}return}
 if(e.target.closest?.('[data-hd-kc-clear]')){HD_KC_IMPORT_PREVIEW=null;const ta=document.getElementById('hdKcImportText');if(ta)ta.value='';const p=document.getElementById('hdKcImportPreview');if(p)p.innerHTML=hdKcPreviewHtml(null);const b=document.querySelector('[data-hd-kc-apply]');if(b)b.disabled=true;return}
 if(e.target.closest?.('[data-hd-kc-apply]')){try{const s=hdKcApplyImport(HD_KC_IMPORT_PREVIEW,{ships:document.getElementById('hdKcApplyShips')?.checked,equipment:document.getElementById('hdKcApplyEquipment')?.checked,resources:document.getElementById('hdKcApplyResources')?.checked,fleets:document.getElementById('hdKcApplyFleets')?.checked,timers:document.getElementById('hdKcApplyTimers')?.checked,quests:document.getElementById('hdKcApplyQuests')?.checked,sorties:document.getElementById('hdKcApplySorties')?.checked});document.getElementById('hdKcImportResult').textContent=`同期完了: 艦娘 ${s.ships} / 装備 ${s.equipment} / 資源 ${s.materials} / 艦隊 ${s.decks} / 遠征 ${s.expeditions||0} / 入渠 ${s.docks||0} / 任務 ${s.quests||0} / 出撃 ${s.sorties||0}`;const ta=document.getElementById('hdKcImportText');if(ta)ta.value='';HD_KC_IMPORT_PREVIEW=null;hdKcRenderSyncStatus();if(typeof renderAllAdvanced==='function')renderAllAdvanced()}catch(err){document.getElementById('hdKcImportResult').textContent='同期失敗: '+String(err?.message||err)}return}
});
document.addEventListener('change',async e=>{
 if(e.target.id==='hdKcImportFile'){const file=e.target.files?.[0];if(!file)return;try{const raw=await file.text();document.getElementById('hdKcImportText').value=raw;await hdKcReadAndPreview(raw);document.getElementById('hdKcImportResult').textContent=`${file.name} を解析したよ`}catch(err){document.getElementById('hdKcImportResult').textContent='ファイルを読めなかった: '+String(err?.message||err)}finally{e.target.value=''}}
});
window.addEventListener('message',e=>{if(e?.data?.type!=='harbordesk-kancolle-import')return;try{hdKcEnsureImport();const raw=e.data.payload;hdKcReadAndPreview(raw);document.getElementById('hdKcImportResult').textContent='外部取込ブリッジからデータを受信したよ'}catch{}});
window.addEventListener('load',()=>setTimeout(async()=>{hdKcEnsureImport();if(!(await hdKcConsumeWindowNameImport()))await hdKcConsumeHashImport()},450));
hdKcEnsureImport();setTimeout(async()=>{if(!(await hdKcConsumeWindowNameImport()))await hdKcConsumeHashImport()},80);

window.hdKcParseImport=hdKcParseImport;
window.hdKcPreviewData=hdKcPreviewData;
window.hdKcApplyImport=hdKcApplyImport;
window.hdKcMergeRoster=hdKcMergeRoster;
window.hdKcMergeEquipment=hdKcMergeEquipment;
window.hdKcEquipmentHasUserPlan=hdKcEquipmentHasUserPlan;
window.hdKcCurrentFleets=hdKcCurrentFleets;
window.hdKcCopyFleetToCustom=hdKcCopyFleetToCustom;
window.hdKcPrepareCurrentFleet=hdKcPrepareCurrentFleet;
window.hdKcRefreshLinkedCustomFleets=hdKcRefreshLinkedCustomFleets;
