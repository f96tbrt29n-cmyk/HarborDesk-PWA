const HD_FE_AIR_CATS=new Set(['艦上戦闘機','艦上攻撃機','艦上爆撃機','水上戦闘機','水上爆撃機','噴式戦闘爆撃機']);

function hdFEEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdFECatalog(){return typeof hdFLCatalog==='function'?hdFLCatalog():(typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG:[])}
let hdFEEquipmentIndex=null;
function hdFEFind(name){
 const aliases={'10cm高角砲＋高射装置':'10cm連装高角砲＋高射装置'},norm=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'');
 const canonical=Object.keys(aliases).find(x=>norm(x)===norm(name)),target=canonical?aliases[canonical]:name;
 const catalog=hdFECatalog(),coverage=window.HD_EQUIPMENT_PERFORMANCE_COVERAGE;
 if(!hdFEEquipmentIndex||hdFEEquipmentIndex.catalog!==catalog||hdFEEquipmentIndex.length!==catalog.length||hdFEEquipmentIndex.coverage!==coverage){
  const exact=new Map(),normalized=new Map();
  for(const item of catalog){if(!exact.has(item.name))exact.set(item.name,item);const key=norm(item.name);if(!normalized.has(key))normalized.set(key,item)}
  hdFEEquipmentIndex={catalog,length:catalog.length,coverage,exact,normalized};
 }
 return hdFEEquipmentIndex.exact.get(target)||hdFEEquipmentIndex.normalized.get(norm(target))||null;
}
function hdFEFindShip(name){
 if(typeof hdShipDbResolveShip==='function')return hdShipDbResolveShip(String(name||'').trim());
 const rows=typeof HD_SHIP_DATABASE!=='undefined'?HD_SHIP_DATABASE:[];
 return rows.find(x=>x.final===name||x.base===name)||null;
}
function hdFEParseGearLabel(label){
 let s=String(label||'').trim(),expansion=false,star=0;
 if(/^\[増設\]/.test(s)){expansion=true;s=s.replace(/^\[増設\]\s*/,'').trim()}
 const m=s.match(/\s+★(\d+)$/);if(m){star=Math.max(0,Number(m[1])||0);s=s.slice(0,m.index).trim()}
 return {name:s,star,expansion};
}
function hdFEPlanFromSavedFleet(map,fleet){
 const ships=(fleet?.ships||[]).filter(x=>String(x.ship||'').trim()||String(x.gear||'').trim()).map(row=>{
  const db=hdFEFindShip(String(row.ship||'').trim()),profile=db&&typeof hdShipDbSlotProfile==='function'?hdShipDbSlotProfile(db):null;
  const tokens=String(row.gear||'').split(/\s+\/\s+/).map(hdFEParseGearLabel);
  const normal=tokens.filter(x=>!x.expansion),ex=tokens.find(x=>x.expansion)||null;
  const items=normal.map((x,i)=>({name:x.name,star:x.star,slotIndex:i,capacity:profile?.slots?.[i]??null,category:hdFEFind(x.name)?.category||''})).filter(x=>x.name);
  return {ship:String(row.ship||'').trim(),gameShipId:Number(row.gameShipId)||0,masterId:Number(row.masterId)||Number(db?.id)||0,type:db?.type||'',items,expansion:ex?{name:ex.name,star:ex.star}:null,missing:[],master:!!profile};
 });
 const presets=typeof MAP_PLANS!=='undefined'?(MAP_PLANS[map]?.presets||[]):[],preset=fleet?.routePreset||presets.find(p=>String(fleet?.name||'').includes(String(p?.name||'')))||null,routeInfo=preset&&typeof hdFSPresetInfo==='function'?hdFSPresetInfo(preset):null;
 return {map,ships,missing:[],masterBacked:ships.filter(x=>x.master).length,createdAt:Date.now(),source:'saved-fleet',sourceFleet:fleet||null,preset,routeInfo};
}
function hdFEAssigned(plan){
 const rows=[];
 for(const ship of plan?.ships||[]){
  const live=hdFERosterForShip(ship),liveSlots=Array.isArray(live?.gameOnslot)?live.gameOnslot:[];
  for(const item of ship.items||[]){
   const meta=hdFEFind(item.name)||{name:item.name,category:item.category||'',stats:{},tags:[]},slotIndex=Number.isFinite(Number(item.slotIndex))?Number(item.slotIndex):null,liveCap=slotIndex!=null&&Number.isFinite(Number(liveSlots[slotIndex]))?Math.max(0,Number(liveSlots[slotIndex])):null,masterCap=item.capacity==null?null:Math.max(0,Number(item.capacity));
   rows.push({ship:ship.ship||'',name:item.name,star:Number(item.star)||0,kind:item.kind||'',slotIndex,capacity:liveCap!=null?liveCap:masterCap,masterCapacity:masterCap,capacitySource:liveCap!=null?'live':masterCap!=null?'master':'unknown',isExpansion:false,meta});
  }
  if(ship.expansion?.name){
   const x=ship.expansion,meta=hdFEFind(x.name)||{name:x.name,category:'',stats:{},tags:[]};
   rows.push({ship:ship.ship||'',name:x.name,star:Number(x.star)||0,kind:'expansion',slotIndex:null,capacity:null,masterCapacity:null,capacitySource:'none',isExpansion:true,meta});
  }
 }
 return rows;
}
function hdFEMasterValidation(plan){
 const invalid=[],unresolved=[];let checked=0,shipsChecked=0;
 for(const row of plan?.ships||[]){
  const db=hdFEFindShip(row.ship),profile=db&&typeof hdShipDbSlotProfile==='function'?hdShipDbSlotProfile(db):null;
  if(!db||!profile){if(row.ship)unresolved.push({ship:row.ship,name:'艦娘マスター未登録',where:'ship'});continue}
  shipsChecked++;
  for(const item of row.items||[]){
   const meta=hdFEFind(item.name);
   if(!meta){unresolved.push({ship:row.ship,name:item.name,where:`第${(Number(item.slotIndex)||0)+1}スロ`});continue}
   checked++;
   const compatible=typeof hdShipDbEquipCompatible==='function'?hdShipDbEquipCompatible(meta,db):true;
   const rejected=typeof hdShipDbSlotRejects==='function'?hdShipDbSlotRejects(profile,Number(item.slotIndex)||0,meta):false;
   if(!compatible||rejected)invalid.push({ship:row.ship,name:item.name,where:`第${(Number(item.slotIndex)||0)+1}スロ`,reason:!compatible?'通常装備不可':'スロット位置制限'});
  }
  if(row.expansion?.name){
   const meta=hdFEFind(row.expansion.name);
   if(!meta){unresolved.push({ship:row.ship,name:row.expansion.name,where:'補強増設'});continue}
   checked++;
   const info=typeof hdShipDbExpansionInfo==='function'?hdShipDbExpansionInfo(meta,db,Number(row.expansion.star)||0):{allowed:true,reason:''};
   if(!info.allowed)invalid.push({ship:row.ship,name:row.expansion.name,where:'補強増設',reason:info.reason||'増設不可'});
  }
 }
 return {checked,shipsChecked,invalid,unresolved,valid:invalid.length===0&&unresolved.length===0};
}
function hdFEStats(items){
 const keys=['火力','雷装','爆装','対空','索敵','対潜','命中','回避','装甲'];
 const out=Object.fromEntries(keys.map(k=>[k,0]));
 for(const x of items)for(const k of keys)out[k]+=Number(x.meta?.stats?.[k])||0;
 return out;
}
function hdFEHasTag(x,...tags){const xs=x.meta?.tags||[];return tags.some(t=>xs.some(v=>String(v).includes(t)))}
function hdFEKindCount(kind,items){
 if(kind==='高速化'){
  const turbines=items.filter(x=>/タービン/.test(x.name)||hdFEHasTag(x,'タービン')).length;
  const cans=items.filter(x=>!/タービン/.test(x.name)&&(/缶$/.test(x.name)||hdFEHasTag(x,'缶'))).length;
  return {count:Math.min(turbines,cans),detail:`タービン ${turbines} / 缶 ${cans}`,partial:turbines>0||cans>0};
 }
 if(kind==='対潜')return {count:items.filter(x=>(Number(x.meta?.stats?.対潜)||0)>0||hdFEHasTag(x,'対潜','ソナー','爆雷')).length};
 if(kind==='制空')return {count:items.filter(x=>HD_FE_AIR_CATS.has(x.meta?.category)&&((Number(x.meta?.stats?.対空)||0)>0||hdFEHasTag(x,'制空','艦戦','水戦'))).length};
 if(kind==='防空')return {count:items.filter(x=>hdFEHasTag(x,'防空','対空CI','高角砲','噴進')||/高角砲|対空電探/.test(x.meta?.category||'')).length};
 if(kind==='対地')return {count:items.filter(x=>hdFEHasTag(x,'対地','集積地','上陸')||['上陸用舟艇','特型内火艇','対地装備'].includes(x.meta?.category)).length};
 if(kind==='索敵')return {count:items.filter(x=>(Number(x.meta?.stats?.索敵)||0)>0||hdFEHasTag(x,'索敵','電探','水偵','艦偵')).length};
 if(kind==='夜戦')return {count:items.filter(x=>hdFEHasTag(x,'夜戦','魚雷CI','夜偵')||['探照灯','大型探照灯','照明弾'].includes(x.meta?.category)).length};
 if(kind==='輸送')return {count:items.filter(x=>hdFEHasTag(x,'輸送')||['上陸用舟艇','特型内火艇'].includes(x.meta?.category)).length};
 if(kind==='電探')return {count:items.filter(x=>/電探/.test(x.meta?.category||'')||hdFEHasTag(x,'電探')).length};
 if(kind==='煙幕')return {count:items.filter(x=>hdFEHasTag(x,'煙幕')||/煙幕/.test(x.name)).length};
 return {count:0};
}
function hdFEEquipCoef(item){
 if(typeof hdFCEquipCoef==='function')return hdFCEquipCoef(item);
 const c=item?.category||'';if(c==='艦上攻撃機')return .8;if(c==='艦上偵察機')return 1;if(c==='水上偵察機')return 1.2;if(c==='水上爆撃機')return 1.1;return Number(item?.stats?.索敵)>0?.6:0;
}
function hdFEImproveCoef(item){
 if(typeof hdFCImproveCoef==='function')return hdFCImproveCoef(item);
 const c=item?.category||'';if(c==='大型飛行艇'||c==='水上偵察機'||c==='艦上偵察機')return 1.2;if(c==='水上爆撃機')return 1.15;if(c==='対潜哨戒機')return 1;if(/小型.*電探|小型水上電探|小型対空電探/.test(c))return 1.25;if(/大型.*電探|大型水上電探|大型対空電探/.test(c))return 1.4;return 0;
}
function hdFELos(items,map){
 let raw=0;
 for(const x of items){
  const los=Number(x.meta?.stats?.索敵)||0,star=Math.max(0,Math.min(10,Number(x.star)||0));
  raw+=(los+hdFEImproveCoef(x.meta)*Math.sqrt(star))*hdFEEquipCoef(x.meta);
 }
 const adv=typeof HD_MAP_ADVANCED_DATA!=='undefined'?HD_MAP_ADVANCED_DATA[map]?.los:null;
 const coef=Number(adv?.coef)||null;
 return {raw,coef,weighted:coef?raw*coef:null,summary:adv?.summary||''};
}
function hdFEAir(items){
 const air=items.filter(x=>HD_FE_AIR_CATS.has(x.meta?.category));
 const rows=air.map(x=>{const aa=Number(x.meta?.stats?.対空)||0,cap=Math.max(0,Number(x.capacity)||0),power=cap>0&&aa>0?Math.floor(aa*Math.sqrt(cap)):0;return {...x,aa,cap,power}});
 return {
  count:air.length,
  antiAir:air.reduce((s,x)=>s+(Number(x.meta?.stats?.対空)||0),0),
  names:air.map(x=>x.name),
  basePower:rows.reduce((s,x)=>s+x.power,0),
  capacityKnown:rows.filter(x=>x.capacitySource!=='unknown').length,
  liveCapacityKnown:rows.filter(x=>x.capacitySource==='live').length,
  masterCapacityKnown:rows.filter(x=>x.capacitySource==='master').length,
  depletedSlots:rows.filter(x=>x.capacitySource==='live'&&Number(x.masterCapacity)>0&&x.cap<Number(x.masterCapacity)).map(x=>({ship:x.ship,name:x.name,slotIndex:x.slotIndex,live:x.cap,max:Number(x.masterCapacity),power:x.power})),
  rows
 };
}
function hdFENight(items,stats){
 const support=items.filter(x=>hdFEHasTag(x,'夜戦','魚雷CI','夜偵')||['探照灯','大型探照灯','照明弾'].includes(x.meta?.category)).length;
 return {equipmentAttack:(Number(stats.火力)||0)+(Number(stats.雷装)||0),support};
}
function hdFERoster(){
 try{return typeof rosterLoad==='function'?rosterLoad():JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]')}catch{return []}
}
function hdFERosterForShip(ship){
 const rows=hdFERoster(),gameId=Number(ship?.gameShipId)||0,id=Number(ship?.masterId)||0,name=String(ship?.ship||'').trim();
 return rows.find(x=>gameId&&Number(x?.gameShipId)===gameId)||rows.find(x=>id&&Number(x?.masterId)===id)||rows.find(x=>String(x?.name||'').trim()===name)||null;
}
function hdFELiveFleet(plan){
 const state=typeof hdFSLiveState==='function'?hdFSLiveState():undefined,rows=(plan?.ships||[]).filter(x=>x?.ship).map(ship=>({ship,row:hdFERosterForShip(ship)})),details=[],reasons={};let blocked=0,caution=0;
 for(const x of rows){
  let op=null;
  if(x.row&&typeof hdFSOperational==='function')op=hdFSOperational(x.row,state);
  else if(x.row){const hp=Number(x.row.gameHp)||0,max=Number(x.row.gameMaxHp)||0,ratio=max>0?hp/max:null;op={available:!(ratio!=null&&ratio<=.25),reasons:ratio!=null&&ratio<=.25?['大破']:[],labels:ratio!=null&&ratio<=.5?['中破']:[],penalty:0,hp,maxHp:max,cond:Number(x.row.gameCond)||null}}
  if(!op){details.push({name:x.ship.ship,status:'unknown',labels:['同期状態不明']});continue}
  const known=Number(x.row?.gameMaxHp)>0&&x.row?.gameHp!=null&&Number.isFinite(Number(x.row.gameHp))&&x.row?.gameCond!=null&&Number.isFinite(Number(x.row.gameCond));
  if(op.available===false){blocked++;for(const r of op.reasons||[])reasons[r]=(reasons[r]||0)+1}
  else if((op.labels||[]).some(v=>/中破|小破|疲労/.test(v)))caution++;
  details.push({name:x.ship.ship,status:op.available===false?'blocked':!known?'unknown':((op.labels||[]).some(v=>/中破|小破|疲労/.test(v))?'caution':'ready'),labels:[...(op.reasons||[]),...(op.labels||[]),...(!known?['同期状態不明']:[])],hp:op.hp,maxHp:op.maxHp,cond:op.cond});
 }
 const status=blocked?'missing':caution?'partial':(details.length&&details.every(x=>x.status!=='unknown')?'ready':'manual');
 return {status,blocked,caution,reasons,details,total:rows.length};
}
function hdFESupply(plan){
 const rows=(plan?.ships||[]).filter(x=>x?.ship).map(ship=>{
  const row=hdFERosterForShip(ship),masterId=Number(row?.masterId)||Number(ship?.masterId)||0,master=window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips?.[String(masterId)]||null;
  const currentFuel=Number(row?.gameFuel),currentAmmo=Number(row?.gameAmmo),maxFuel=Number(master?.fuel),maxAmmo=Number(master?.ammo);
  const known=!!row&&row.gameFuel!=null&&row.gameAmmo!=null&&maxFuel>0&&maxAmmo>0&&Number.isFinite(currentFuel)&&Number.isFinite(currentAmmo),fuelRatio=known?currentFuel/maxFuel:null,ammoRatio=known?currentAmmo/maxAmmo:null;
  return {name:ship.ship,currentFuel,currentAmmo,maxFuel,maxAmmo,known,fuelRatio,ammoRatio};
 });
 const known=rows.filter(x=>x.known),empty=known.filter(x=>x.fuelRatio<=0||x.ammoRatio<=0),low=known.filter(x=>x.fuelRatio>0&&x.ammoRatio>0&&(x.fuelRatio<1||x.ammoRatio<1));
 const status=!rows.length||known.length<rows.length?'manual':empty.length?'missing':low.length?'partial':'ready';
 const detail=status==='manual'?'補給量を同期できた艦のみ判定':empty.length?`燃料/弾薬0の艦 ${empty.length}隻`:low.length?`未補給 ${low.length}隻`:'全艦補給済み';
 return {status,rows,known:known.length,empty:empty.length,low:low.length,detail};
}
function hdFENormGearLabel(value){
 return String(value||'').replace(/^\[増設\]\s*/,'').replace(/\s+/g,' ').trim();
}
function hdFEPlannedGearLabel(item){
 const name=String(item?.name||'').trim(),star=Math.max(0,Number(item?.star)||0);
 return hdFENormGearLabel(name+(star?` ★${star}`:''));
}
function hdFEGameMatch(plan){
 const ships=(plan?.ships||[]).filter(x=>x?.ship),fleets=(()=>{try{const x=JSON.parse(localStorage.getItem('harbordesk-kancolle-fleets-v1')||'[]');return Array.isArray(x)?x:[]}catch{return []}})(),details=[],ids=[];let unknown=0,gearMismatch=0;
 for(const ship of ships){
  const row=hdFERosterForShip(ship);
  if(!row||!Number(row.gameShipId)){unknown++;details.push({name:ship.ship,status:'unknown',mismatches:[]});continue}
  ids.push(Number(row.gameShipId));
  const mismatches=[],actualSlots=Array.isArray(row.gameGearSlots)?row.gameGearSlots:null;
  if(!actualSlots){unknown++;details.push({name:ship.ship,status:'unknown',mismatches,gameShipId:Number(row.gameShipId)});continue}
  const plannedBySlot=new Map((ship.items||[]).map(item=>[Number.isFinite(Number(item.slotIndex))?Number(item.slotIndex):0,hdFEPlannedGearLabel(item)])),maxPlanned=plannedBySlot.size?Math.max(...plannedBySlot.keys())+1:0,slotCount=Math.max(actualSlots.length,maxPlanned);
  for(let idx=0;idx<slotCount;idx++){
   const planned=plannedBySlot.get(idx)||'',actual=hdFENormGearLabel(actualSlots[idx]||'');
   if(planned!==actual)mismatches.push({slotIndex:idx,planned,actual});
  }
  const plannedExpansion=ship.expansion?.name?hdFEPlannedGearLabel(ship.expansion):'',actualExpansion=hdFENormGearLabel(row.gameGearExpansion||'');
  if(plannedExpansion!==actualExpansion)mismatches.push({slotIndex:'ex',planned:plannedExpansion,actual:actualExpansion});
  gearMismatch+=mismatches.length;details.push({name:ship.ship,status:mismatches.length?'mismatch':'ready',mismatches,gameShipId:Number(row.gameShipId)});
 }
 let deck=null,deckOrderMismatch=false;
 if(ids.length===ships.length&&ids.length){
  deck=fleets.find(d=>{const xs=(d.ships||[]).map(x=>Number(x.gameShipId)||0).filter(Boolean);return xs.length===ids.length&&xs.every((id,i)=>id===ids[i])})||null;
  if(!deck){
   const target=[...ids].sort((a,b)=>a-b).join(',');
   deckOrderMismatch=fleets.some(d=>(d.ships||[]).map(x=>Number(x.gameShipId)||0).filter(Boolean).sort((a,b)=>a-b).join(',')===target);
  }
 }
 const fleetKnown=fleets.length>0&&ids.length===ships.length&&ids.length>0,fleetMatch=!!deck,status=gearMismatch||(!fleetMatch&&fleetKnown)?'partial':unknown||!fleetKnown?'manual':'ready';
 const parts=[];if(fleetMatch)parts.push(`${deck.name||'ゲーム艦隊'}一致`);else if(deckOrderMismatch)parts.push('同じ艦だが並び順が違う');else if(fleetKnown)parts.push('現在艦隊と不一致');else parts.push('現在艦隊の照合待ち');if(gearMismatch)parts.push(`装備差 ${gearMismatch}件`);else if(!unknown)parts.push('装備一致');
 return {status,detail:parts.join(' / '),fleetMatch,deckId:Number(deck?.deckId)||0,deckName:String(deck?.name||''),deckOrderMismatch,gearMismatch,unknown,details};
}
function hdFESyncFreshness(){
 let sync=null;try{sync=JSON.parse(localStorage.getItem('harbordesk-kancolle-sync-v1')||'null')}catch{}
 const syncedAt=Number(sync?.syncedAt)||0;
 if(!syncedAt)return {status:'manual',syncedAt:0,ageMinutes:null,detail:'同期時刻が不明。出撃直前に艦これ同期を確認'};
 if(syncedAt>Date.now()+60000)return {status:'manual',syncedAt,ageMinutes:null,detail:'同期時刻が端末の現在時刻より未来。時計設定とゲーム連携を確認'};
 const ageMinutes=Math.max(0,Math.floor((Date.now()-syncedAt)/60000)),status=ageMinutes<=10?'ready':'partial';
 return {status,syncedAt,ageMinutes,detail:ageMinutes<1?'たった今同期':`同期から ${ageMinutes}分${ageMinutes>10?'。出撃直前は再同期推奨':''}`};
}
function hdFEGameMatchHtml(match){
 if(!match)return '';
 const rows=[];
 if(match.deckOrderMismatch)rows.push('<div class="hd-fe-game-diff warn"><b>艦隊順</b><span>同じ艦は揃っているけど並び順がゲーム側と違う</span></div>');
 for(const ship of match.details||[]){
  if(ship.status==='unknown')rows.push(`<div class="hd-fe-game-diff warn"><b>${hdFEEsc(ship.name)}</b><span>ゲーム装備の同期データが不足</span></div>`);
  for(const diff of ship.mismatches||[]){
   const where=diff.slotIndex==='ex'?'補強増設':`第${Number(diff.slotIndex)+1}スロ`,planned=diff.planned||'空き',actual=diff.actual||'空き';
   rows.push(`<div class="hd-fe-game-diff bad"><b>${hdFEEsc(ship.name)}｜${hdFEEsc(where)}</b><span>予定: ${hdFEEsc(planned)} → ゲーム: ${hdFEEsc(actual)}</span></div>`);
  }
 }
 if(!rows.length)return '';
 return `<div class="hd-fe-game-diffs"><div class="hd-fe-auto-detail-title">ゲームとの差分</div>${rows.join('')}</div>`;
}
// Rules checked against the speed table on 2026-10-07; master speed takes precedence
// over the curated database (e.g. Yubari Kai Ni Toku). Unknown groups stay unresolved.
const HD_FE_SPEED_SOURCE='https://wikiwiki.jp/kancolle/速力';
function hdFESpeedTarget(info){const text=String(info?.text||'').normalize('NFKC');return /最速/.test(text)?20:/高速\+/.test(text)?15:info?.speedRequired?10:0}
function hdFESpeedLabel(rank){return ({5:'低速',10:'高速',15:'高速+',20:'最速'})[rank]||'未判定'}
function hdFESpeedGroup(name,base,type){
 const n=String(name).normalize('NFKC');
 if(base===10){
  if(/^(翔鶴|瑞鶴|大鳳|最上|三隈|鈴谷|熊野|利根|筑摩|島風|天津風改二|Ташкент|Vautour|Visby|飛龍改三)/.test(n)||/^吹雪改三護\(六式\)$/.test(n))return 'HA';
  if(/^(加賀|Samuel B\.Roberts)/.test(n)||/^夕張(?:改)?$/.test(n)||type==='水上機母艦')return 'HC';
  if(/^(金剛|比叡|榛名|霧島|Iowa|蒼龍|飛龍|雲龍|天城|Algérie|阿賀野|能代|矢矧|酒匂|天津風|北上改三|吹雪改三)/.test(n)||n==='大和改二')return 'HB1';
  if(['戦艦','高速戦艦','正規空母','装甲空母','軽空母','重巡洋艦','航空巡洋艦','軽巡洋艦','重雷装巡洋艦','駆逐艦'].includes(type))return 'HB2';
 }else if(base===5){
  if(n==='夕張改二特'||/^Samuel B\.Roberts(?:改)?$/.test(n))return 'LS';
  if(/^鳳翔改二(?:戦)?$/.test(n))return 'LE';
  if(/^(伊201|伊203)(?:改)?$/.test(n)||n==='稲木改二')return 'LD';
  if(/^(大和|武蔵|長門改二|陸奥改二)/.test(n))return 'LA';
  if(/^(Béarn|あきつ丸|明石|速吸|まるゆ改)/.test(n)||['潜水艦','潜水空母'].includes(type)&&n!=='まるゆ')return 'LC';
  if(['戦艦','高速戦艦','航空戦艦','軽空母','水上機母艦','練習巡洋艦','潜水母艦','海防戦艦'].includes(type)||/^(神威|神州丸|朝日|Norge|Eidsvold|Thonburi)/.test(n))return 'LB';
  if(type==='海防艦'||n==='まるゆ')return 'blocked';
 }
 return '';
}
function hdFESpeedRecipes(group,target,base){
 if(base>=target)return [{}];
 if(target===10)return group==='LS'?[{t:1}]:['LD','LE'].includes(group)?[{n:1},{t:1,c:1}]:group&&group!=='blocked'?[{t:1,c:1}]:[];
 if(target===15)return group==='HA'?[{n:1,h:1},{t:1,c:1}]:/^HB|HC$/.test(group)?[{t:1,c:1}]:group==='LA'?[{t:1,n:1,h:1},{t:1,n:1,c:2}]:['LB','LS'].includes(group)?[{t:1,n:2},{t:1,c:3}]:['LD','LE'].includes(group)?[{t:1,n:1},{t:1,c:3}]:[];
 if(target===20)return group==='HA'?[{n:2,h:2},{t:1,n:1},{t:1,c:2}]:group==='HB1'?[{t:1,n:1,c:2}]:group==='HB2'?[{t:1,n:2},{t:1,c:3}]:group==='LA'?[{t:1,n:2,h:2},{t:1,n:1,c:3}]:group==='LE'?[{t:1,n:2},{t:1,n:1,c:3}]:[];
 return [];
}
function hdFESpeedRecipeText(r){return [r.t?`タービン${r.t}個`:'',r.n?`新型高温高圧缶${r.n}個以上${r.h?`（うち★7以上${r.h}個）`:''}`:'',r.c?`強化型缶・新型缶の合計${r.c}個以上`:''].filter(Boolean).join('＋')||'追加装備なし'}
const HD_FE_SPEED_MEMO=new WeakMap();
function hdFEShipSpeed(ship){
 const master=typeof hdShipDbMasterRowFor==='function'?hdShipDbMasterRowFor({name:ship.ship,masterId:ship.masterId}):null,db=hdFEFindShip(ship.ship),exact=db&&(db.final===ship.ship||db.base===ship.ship),base=Number(master?.speed)||({低速:5,高速:10})[exact?db.speed:'']||0,type=master?.type||(exact?db.type:'')||'',group=hdFESpeedGroup(master?.name||ship.ship,base,type),parts={t:0,n:0,h:0,c:0},invalid=[];
 const key=JSON.stringify([ship.ship,master?.id,base,type,(ship.items||[]).map(x=>[x.name,x.star,x.slotIndex]),ship.expansion]),cached=HD_FE_SPEED_MEMO.get(ship);if(cached?.key===key)return cached.value;
 const entries=[...(ship.items||[]).map((x,i)=>({...x,slotIndex:x.slotIndex??i})),...(ship.expansion?.name?[{...ship.expansion,isExpansion:true}]:[])];
 for(const item of entries){const name=String(item.name||'').normalize('NFKC').replace(/\s+/g,'');if(!['改良型艦本式タービン','強化型艦本式缶','新型高温高圧缶'].includes(name))continue;
  const speedDb=master?hdShipDbMasterAdapter({masterId:master.id}):db,meta=hdFEFind(item.name),profile=speedDb&&hdShipDbSlotProfile(speedDb),unique=item.isExpansion||entries.filter(x=>!x.isExpansion&&Number(x.slotIndex)===Number(item.slotIndex)).length===1,allowed=unique&&meta&&profile&&(item.isExpansion?hdShipDbExpansionInfo(meta,speedDb,item.star).allowed:hdShipDbEquipCompatible(meta,speedDb)&&Number.isInteger(Number(item.slotIndex))&&Number(item.slotIndex)>=0&&Number(item.slotIndex)<profile.count&&!hdShipDbSlotRejects(profile,Number(item.slotIndex),meta));
  if(!allowed){invalid.push(item.name+'（装備位置・装備可否が未充足）');continue}
  if(name==='改良型艦本式タービン')parts.t++;else{parts.c++;if(name==='新型高温高圧缶'){parts.n++;if(Number(item.star)>=7)parts.h++;}}
 }
 let rank=base;
 if(group)for(const target of [10,15,20])if(hdFESpeedRecipes(group,target,base).some(r=>Object.entries(r).every(([k,v])=>parts[k]>=v)))rank=Math.max(rank,target);
 const value={base,rank,group,parts,invalid,known:!!base,label:hdFESpeedLabel(rank),detail:`${ship.ship}：${hdFESpeedLabel(base)} → ${hdFESpeedLabel(rank)}${group?`（${group}）`:'（潜在速力区分が未登録）'}`};HD_FE_SPEED_MEMO.set(ship,{key,value});return value;
}
function hdFESpeedGoal(ship,target){
 const speed=hdFEShipSpeed(ship),recipes=hdFESpeedRecipes(speed.group,target,speed.base),ok=speed.known&&speed.rank>=target,ratio=ok?1:Math.max(0,...recipes.map(r=>{const values=Object.entries(r);return values.length?values.reduce((n,[k,v])=>n+Math.min(1,speed.parts[k]/v),0)/values.length:0})),unresolved=!speed.known||!speed.group&&speed.rank<target;
 return {kind:'speed-ship',label:`${ship.ship} の${hdFESpeedLabel(target)}条件`,count:Number(ok),minCount:1,ok,ratio,speedActual:true,speed,unresolved,detail:`${speed.detail} / 必要 ${hdFESpeedLabel(target)}。${ok?'配備案の速力条件を満たす':unresolved?'艦娘名・改造段階・速力データを確認':recipes.length?'必要な組み合わせ：'+recipes.map(hdFESpeedRecipeText).join(' または '):'この艦の速力区分では到達できません。艦娘を入れ替えてね'}${speed.invalid.length?'。'+speed.invalid.join('、'):''}`};
}
function hdFERouteShips(plan){
 return (plan?.ships||[]).filter(x=>x?.ship).map(s=>{const row=hdFERosterForShip(s),db=hdFEFindShip(s.ship),speedInfo=hdFEShipSpeed(s);return {ship:s,type:db?.type||row?.type||s.type||'',speed:speedInfo.label,speedInfo}});
}
function hdFERouteFlagshipOk(ships,info){return !info?.flagship||!!ships[0]&&hdFSTypeMatches({type:ships[0].type,speed:hdFESpeedLabel(ships[0].speedInfo.base),roles:[],tags:[],row:{name:ships[0].ship.ship}},info.flagship)}
function hdFEPresetRouteMatch(plan,preset,index=0){
 if(typeof hdFSPresetInfo!=='function')return null;
 const ships=hdFERouteShips(plan),info=hdFSPresetInfo(preset),reqs=(info.requirements||[]).map(req=>{const need=Math.max(0,Number(req.count)||0),got=ships.filter(x=>typeof hdFSTypeMatches==='function'?hdFSTypeMatches({type:x.type,speed:hdFESpeedLabel(x.speedInfo.base),roles:[],tags:[],row:{name:x.ship.ship}},req.token):x.type===req.token).length;return {token:req.token,need,got,ok:need===0?got===0:got>=need}}),required=reqs.reduce((n,x)=>n+x.need,0),coverage=ships.length?required/ships.length:0,explicitTotal=!info.conditionManual||/\d+隻/.test(String(info.text||'')),totalOk=!explicitTotal||ships.length===Number(info.total),lows=hdFESpeedTarget(info)?ships.filter(x=>x.speedInfo.known&&x.speedInfo.rank<hdFESpeedTarget(info)&&!!x.speedInfo.group).map(x=>x.ship.ship):[],unknownSpeed=hdFESpeedTarget(info)?ships.filter(x=>!x.speedInfo.known||!x.speedInfo.group&&x.speedInfo.rank<hdFESpeedTarget(info)).map(x=>x.ship.ship):[],bad=reqs.filter(x=>!x.ok),strong=required>=2&&coverage>=.5;
 return {preset,index,info,reqs,required,coverage,explicitTotal,totalOk,lows,bad,strong,exact:hdFERouteFlagshipOk(ships,info)&&!info.conditionManual&&strong&&totalOk&&!bad.length&&!lows.length&&!unknownSpeed.length};
}
function hdFEInferRoute(plan){
 const presets=typeof MAP_PLANS!=='undefined'?(MAP_PLANS[String(plan?.map||'')]?.presets||[]):[];
 if(!presets.length||typeof hdFSPresetInfo!=='function')return {status:'none',matches:[],detail:'構造化された編成例なし'};
 const rows=presets.map((p,i)=>hdFEPresetRouteMatch(plan,p,i)).filter(Boolean),matches=rows.filter(x=>x.exact);
 if(matches.length===1)return {status:'matched',match:matches[0],matches,rows,detail:`編成から「${matches[0].preset?.name||'編成例'}」に一意一致`};
 if(matches.length>1)return {status:'ambiguous',matches,rows,detail:`複数の編成例に一致: ${matches.map(x=>x.preset?.name||('候補'+(x.index+1))).join(' / ')}`};
 const close=rows.filter(x=>x.strong&&x.totalOk).sort((a,b)=>a.bad.length-b.bad.length||b.coverage-a.coverage);
 return {status:'none',matches:[],rows,closest:close[0]||null,detail:close[0]?`近い編成例: ${close[0].preset?.name||'候補'}（条件未一致）`:'編成条件の自動特定に必要な具体条件が不足'};
}
function hdFERoute(plan){
 let info=plan?.suggestion?.info||plan?.routeInfo||null,inferred=null,presetName=plan?.suggestion?.preset?.name||plan?.preset?.name||'';
 if(!info){inferred=hdFEInferRoute(plan);if(inferred.status==='matched'){info=inferred.match.info;presetName=inferred.match.preset?.name||''}}
 if(!info)return {status:'manual',detail:inferred?.detail||'保存編成のルート条件を特定できないため攻略ルートを確認',requirements:[],inference:inferred};
 const ships=hdFERouteShips(plan),reqs=(info.requirements||[]).map(req=>{const got=ships.filter(x=>typeof hdFSTypeMatches==='function'?hdFSTypeMatches({type:x.type,speed:hdFESpeedLabel(x.speedInfo.base),roles:[],tags:[],row:{name:x.ship.ship}},req.token):x.type===req.token).length;return {token:req.token,need:Math.max(0,Number(req.count)||0),got,ok:Number(req.count)===0?got===0:got>=Number(req.count)}}),lows=hdFESpeedTarget(info)?ships.filter(x=>x.speedInfo.known&&x.speedInfo.rank<hdFESpeedTarget(info)&&!!x.speedInfo.group).map(x=>x.ship.ship):[],unknownSpeed=hdFESpeedTarget(info)?ships.filter(x=>!x.speedInfo.known||!x.speedInfo.group&&x.speedInfo.rank<hdFESpeedTarget(info)).map(x=>x.ship.ship):[],bad=reqs.filter(x=>!x.ok),prefix=inferred?.status==='matched'?`自動照合: ${presetName} / `:presetName?`${presetName} / `:'';
 const flagshipBad=!hdFERouteFlagshipOk(ships,info);
 const totalBad=!info.conditionManual&&Number(info.total)>0&&ships.length!==Number(info.total);
 return {status:bad.length||lows.length||totalBad||flagshipBad?'missing':info.conditionManual||unknownSpeed.length?'manual':'ready',requirements:reqs,lowSpeed:lows,unknownSpeed,speedTarget:hdFESpeedTarget(info),inference:inferred,presetName,detail:prefix+(flagshipBad?'旗艦条件未充足: '+info.flagship:bad.length?bad.map(x=>x.token+' '+x.got+'/'+x.need).join(' / '):(lows.length?hdFESpeedLabel(hdFESpeedTarget(info))+'条件未充足: '+lows.join('、'):totalBad?'編成隻数 '+ships.length+'/'+info.total:unknownSpeed.length?'速力未判定: '+unknownSpeed.join('、'):info.conditionManual?'艦種・隻数の条件を手動確認':'基本編成条件を満たす'))};
}
function hdFEEnemyAirCandidates(map){
 if(typeof hdFCMapEnemyAirCandidates==='function')return hdFCMapEnemyAirCandidates(map);
 const vals=new Set(),add=t=>{for(const m of String(t||'').matchAll(/敵制空(?:値)?\s*(\d+)/g))vals.add(Number(m[1]))};
 try{Object.values(typeof HD_NODE_PATTERN_DATA!=='undefined'?(HD_NODE_PATTERN_DATA[map]||{}):{}).forEach(n=>(n.patterns||[]).forEach(p=>add(p.air)))}catch{}
 return [...vals].sort((a,b)=>a-b);
}
function hdFEAirCheck(map,air){
 const target=typeof hdMapAirTarget==='function'?hdMapAirTarget(map):null,enemies=hdFEEnemyAirCandidates(map),enemy=target?.known?target.enemy:enemies.length?Math.max(...enemies):null,ours=Number(air?.basePower)||0,known=Number(air?.capacityKnown)||0,total=Number(air?.count)||0,live=Number(air?.liveCapacityKnown)||0,depleted=Array.isArray(air?.depletedSlots)?air.depletedSlots.length:0,goal=target?.selected?target.goal:'superiority',required=enemy===null?null:typeof hdMapAirThreshold==='function'?hdMapAirThreshold(enemy,goal):Math.ceil(enemy*1.5),ratio=enemy?ours/enemy:0;
 const routeLoss=target?.known&&known===total&&typeof hdMapAirRouteLoss==='function'?hdMapAirRouteLoss(map,(air?.rows||[]).map(r=>({...r,slot:r.cap,category:r.meta?.category})),r=>r.slot>0?Math.floor(r.aa*Math.sqrt(r.slot)):0):null;
 const antiAirUnknown=routeLoss?.known&&routeLoss.stage2Complete===false;
 const routeUnknown=target?.selected&&!target.known||!!(typeof hdMapAirData==='function'&&hdMapAirData(map))&&!target?.selected&&enemy>0,reason=routeUnknown?'route':enemy===null?'enemy':known<total&&enemy>0?'capacity':antiAirUnknown?'anti-air':null,status=reason?'manual':ours>=required&&!routeLoss?.maxGap?'ready':ratio>2/3?'partial':'missing',label=target?.known&&!target.hasAir?'航空戦なし':enemy===null?'未判定':typeof hdMapAirLabel==='function'?hdMapAirLabel(ours,enemy):ratio>=1.5?'優勢':'喪失';
 const loss=target?.known&&target.hasAir&&known===total&&typeof hdMapAirLossBounds==='function'?hdMapAirLossBounds((air?.rows||[]).map(r=>({...r,slot:r.cap,category:r.meta?.category})),enemy,r=>r.slot>0?Math.floor(r.aa*Math.sqrt(r.slot)):0):null;
 return {status,loss,routeLoss,ours,enemy:enemy??0,required,goal,reason,ratio,liveCapacityKnown:live,depletedSlots:depleted,source:target?.source||'',detail:reason==='route'?`${target.detail}。海域最大 ${enemy??'?'} は参考値で、ルート充足とは判定しません。`:enemy===null?`敵制空値の数値データなし${live?`（現在搭載 ${live}/${total}スロ反映）`:''}`:`基礎制空 ${ours} / ${target?.known?target.detail:'確認敵制空最大'} ${enemy} → ${label} / ${typeof HD_MAP_AIR_GOALS!=='undefined'?HD_MAP_AIR_GOALS[goal]:'優勢以上'} ${required}（あと ${Math.max(0,required-ours)}）${live?` / 現在搭載 ${live}/${total}スロ`:''}${depleted?` / 損耗 ${depleted}スロ`:''}${reason==='capacity'?'（搭載数未解決あり）':reason==='anti-air'?`（敵防空未判定：${routeLoss.stage2Missing.join(' / ')}）`:''}${routeLoss?.known?` / 連戦モデル最終 ${routeLoss.lower}〜${routeLoss.upper}${routeLoss.firstGap?` / ${routeLoss.firstGap.id}・${routeLoss.firstGap.round}回目に大損耗側であと${routeLoss.firstGap.gap}不足`:''}（通常敵の対空砲火・登録射撃回避モデル、未登録機は回避なし、敵機削りなし）`:''}${loss?.active?` / 制空戦1回後の基礎制空 ${loss.lower}〜${loss.upper}（対空砲火・累積・敵機削りなし）`:''}`};
}
function hdFEScouting(plan,items){
 const map=String(plan?.map||''),adv=typeof HD_MAP_ADVANCED_DATA!=='undefined'?HD_MAP_ADVANCED_DATA[map]?.los:null,coef=Number(adv?.coef)||0,checks=Array.isArray(adv?.checks)?adv.checks:[];
 if(!coef||!checks.length)return {status:'manual',available:false,reason:'threshold',score:null,checks:[],detail:adv?.summary||'数値閾値なし'};
 const sync=(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-kancolle-sync-v1')||'null')}catch{return null}})(),hq=Number(sync?.admiralLevel)||0,ships=(plan?.ships||[]).filter(x=>x?.ship),losRows=ships.map(ship=>typeof hdFCProposalShipLos==='function'?hdFCProposalShipLos(ship):null);
 if(!hq||losRows.length!==ships.length||losRows.some(x=>x===null||!Number.isFinite(x)||x<0)){const missing={hq:!hq,ships:ships.filter((x,i)=>losRows[i]===null||!Number.isFinite(losRows[i])||losRows[i]<0).map(x=>x.ship)};return {status:'manual',available:false,reason:'sync',missing,score:null,checks,detail:'同期情報が不足：'+[...(missing.hq?['司令部Lv']:[]),...missing.ships.map(x=>x+' の索敵値')].join('、')+'。ゲーム連携で母港・艦隊情報を取得すると自動計算'};}
 const shipTerm=losRows.reduce((s,v)=>s+Math.sqrt(Math.max(0,v)),0);let equipRaw=0;
 for(const x of items||[]){const los=Number(x.meta?.stats?.索敵)||0,star=Math.max(0,Math.min(10,Number(x.star)||0));equipRaw+=(los+hdFEImproveCoef(x.meta)*Math.sqrt(star))*hdFEEquipCoef(x.meta)}
 const count=Math.max(1,Math.min(7,ships.length||6)),score=shipTerm+equipRaw*coef-Math.ceil(hq*.4)+2*(6-count);
 const rows=checks.map(x=>{const safe=Number(x.safe)||0,fail=Number(x.failBelow)||0,status=safe&&score>=safe?'ready':fail&&score<fail?'missing':'partial';return {...x,status,score}});
 const status=rows.some(x=>x.status==='missing')?'missing':rows.every(x=>x.status==='ready')?'ready':'partial';
 return {status,available:true,score,coef,hq,checks:rows,detail:`推定33式 ${score.toFixed(2)}（係数${coef} / 司令部Lv${hq}）`};
}
function hdFEAutoVerdict(plan,e){
 const live=hdFELiveFleet(plan),supply=hdFESupply(plan),freshness=hdFESyncFreshness(),gameMatch=hdFEGameMatch(plan),route=hdFERoute(plan),air=hdFEAirCheck(plan?.map,e.air),scouting=hdFEScouting(plan,e.items),equipment={status:e.missing?'missing':e.partial?'partial':'ready',detail:`海域装備 ${e.ready}/${e.requirements.length} 準備`},master={status:e.master.invalid.length?'missing':e.master.unresolved.length?'partial':'ready',detail:e.master.invalid.length?`装備不可 ${e.master.invalid.length}件`:e.master.unresolved.length?`未解決 ${e.master.unresolved.length}件`:'装備可否OK'},unknownHealth=live.details.filter(x=>x.status==='unknown').length,health={status:live.status,detail:live.blocked?`出撃不可候補 ${live.blocked}隻（${Object.entries(live.reasons).map(x=>x[0]+' '+x[1]).join(' / ')}）`:live.caution?`注意艦 ${live.caution}隻${unknownHealth?` / 同期状態不明 ${unknownHealth}隻`:''}`:unknownHealth?`同期状態不明 ${unknownHealth}隻。ゲーム連携を確認`:'艦状態OK'};
 if(typeof hdSEAirOptional==='function'&&hdSEAirOptional(plan?.map)){air.status='manual';air.detail='1-6下ルートは制空優勢が必須ではありません。防空・対潜を優先し、水戦/水爆は編成に応じた選択肢'}
 const checks=[{id:'health',label:'艦状態',...health},{id:'supply',label:'補給',...supply},{id:'freshness',label:'同期鮮度',...freshness},{id:'gameMatch',label:'ゲーム反映',...gameMatch},{id:'route',label:'編成条件',...route},{id:'equipment',label:'装備',...equipment},{id:'air',label:'制空',...air},{id:'scouting',label:'索敵',...scouting},{id:'master',label:'装備可否',...master}],ranked={missing:3,partial:2,manual:1,ready:0},worst=checks.reduce((a,x)=>(ranked[x.status]??1)>(ranked[a.status]??0)?x:a,{status:'ready'});
 return {status:worst.status,checks,live,supply,freshness,gameMatch,route,air,scouting,master,equipment};
}
function hdFEAutoStatusLabel(s){return s==='ready'?'OK':s==='missing'?'不足/不可':s==='partial'?'注意':'要確認'}
function hdFEActionForCheck(check){
 if(!check||check.status==='ready')return '';
 const actions={
  health:check.status==='missing'?'大破・遠征中・入渠中の艦を編成から外す':'損傷・疲労している艦を確認する',
  supply:'燃料・弾薬を補給する',
  freshness:'艦これ連携を再同期して最新状態にする',
  gameMatch:'ゲーム側の艦隊順・装備をHarborDeskの予定と合わせる',
  route:check.status==='manual'?'攻略ルートの編成条件を確認する':'編成条件を満たすよう艦種・速力を直す',
  equipment:'不足している海域向け装備を準備する',
  air:check.status==='manual'?'敵制空値・搭載数を確認する':'制空値を増やす',
  scouting:check.status==='manual'?'索敵分岐条件を確認する':'索敵値を増やす',
  master:check.status==='missing'?'装備不可の組み合わせを修正する':'未解決の装備可否を確認する'
 };
 return actions[check.id]||(`${check.label||'項目'}を確認する`);
}
function hdFEGoNoGo(auto){
 const checks=auto?.checks||[],blockers=checks.filter(x=>x.status==='missing'),cautions=checks.filter(x=>x.status==='partial'||x.status==='manual'),state=blockers.length?'stop':cautions.length?'hold':'go';
 const order={health:1,supply:2,gameMatch:3,route:4,equipment:5,air:6,scouting:7,master:8,freshness:9};
 const actionChecks=[...blockers,...cautions].sort((a,b)=>(order[a.id]||99)-(order[b.id]||99)),seen=new Set(),actions=[];
 for(const x of actionChecks){const action=hdFEActionForCheck(x);if(action&&!seen.has(action)){seen.add(action);actions.push({id:x.id,label:x.label,status:x.status,action,detail:x.detail||''})}}
 const label=state==='go'?'出撃準備OK':state==='stop'?'修正必要':'要確認',detail=state==='go'?'自動判定で未解決項目なし':state==='stop'?`修正が必要な項目 ${blockers.length}件`:`確認が必要な項目 ${cautions.length}件`;
 return {state,label,detail,blockers,cautions,actions};
}
function hdFEFixActionInfo(id){
 const map={
  health:{label:'同期状態を見る',target:'kancolleImport'},
  supply:{label:'同期状態を見る',target:'kancolleImport'},
  freshness:{label:'再同期へ',target:'kancolleImport'},
  gameMatch:{label:'現在艦隊を見る',target:'kancolleImport'},
  route:{label:'攻略へ',target:'guide'},
  equipment:{label:'装備台帳へ',target:'equipmentBook'},
  master:{label:'装備台帳へ',target:'equipmentBook'},
  air:{label:'制空計算へ',target:'calculator'},
  scouting:{label:'索敵計算へ',target:'calculator'}
 };
 return map[String(id||'')]||{label:'確認する',target:'prep'};
}
const HD_FE_FIX_FLOW_KEY='harbordesk-sortie-fix-flow-v1';
function hdFEFixFlowMap(){
 try{
  if(typeof hdSPSMap==='function'){const x=String(hdSPSMap()||'').trim();if(x)return x}
  if(typeof hdFSMap==='function'){const x=String(hdFSMap()||'').trim();if(x)return x}
  if(typeof selectedMap!=='undefined')return String(selectedMap||'').trim();
 }catch{}
 return '';
}
function hdFEFixFlowLoad(){
 try{
  const x=JSON.parse(sessionStorage.getItem(HD_FE_FIX_FLOW_KEY)||'null');
  if(!x||!x.id)return null;
  if(Date.now()-Number(x.startedAt||0)>45*60*1000){sessionStorage.removeItem(HD_FE_FIX_FLOW_KEY);return null}
  const map=hdFEFixFlowMap();if(x.map&&x.map!==map)return null;
  return x;
 }catch{return null}
}
function hdFEFixFlowSave(value){
 try{if(value)sessionStorage.setItem(HD_FE_FIX_FLOW_KEY,JSON.stringify(value));else sessionStorage.removeItem(HD_FE_FIX_FLOW_KEY)}catch{}
 return value||null;
}
function hdFEStartFixFlow(id,auto=null){
 auto=auto||window.__hdFELastAuto||null;
 const key=String(id||''),check=(auto?.checks||[]).find(x=>String(x.id)===key)||null;
 return hdFEFixFlowSave({id:key,map:hdFEFixFlowMap(),startedAt:Date.now(),beforeStatus:String(check?.status||''),beforeDetail:String(check?.detail||''),label:String(check?.label||'')});
}
function hdFEFixFlowState(auto){
 const flow=hdFEFixFlowLoad();if(!flow)return null;
 const check=(auto?.checks||[]).find(x=>String(x.id)===String(flow.id))||null,status=String(check?.status||'manual'),resolved=status==='ready',changed=!!flow.beforeStatus&&flow.beforeStatus!==status;
 return {...flow,currentStatus:status,currentDetail:String(check?.detail||''),currentLabel:String(check?.label||flow.label||''),resolved,changed};
}
function hdFEFixFlowHtml(auto){
 const flow=hdFEFixFlowState(auto);if(!flow)return '';
 const info=hdFEFixActionInfo(flow.id),label=flow.currentLabel||flow.label||flow.id;
 if(flow.resolved)return `<div class="hd-fe-fix-return resolved"><div><b>修正反映済み ✓</b><span>${hdFEEsc(label)} がOKになったよ。次の判定へ進める。</span></div><div><button type="button" class="primary small" data-hd-fe-recheck>次を再判定</button><button type="button" class="ghost small" data-hd-fe-fix-dismiss>閉じる</button></div></div>`;
 const changedText=flow.changed?`状態が ${hdFEAutoStatusLabel(flow.beforeStatus)} → ${hdFEAutoStatusLabel(flow.currentStatus)} に変化`:`現在も ${hdFEAutoStatusLabel(flow.currentStatus)}`;
 return `<div class="hd-fe-fix-return pending"><div><b>${hdFEEsc(info.label)} の修正確認</b><span>${hdFEEsc(label)}｜${hdFEEsc(changedText)}${flow.currentDetail?'｜'+hdFEEsc(flow.currentDetail):''}</span></div><div><button type="button" class="primary small" data-hd-fe-recheck>再判定</button><button type="button" class="ghost small" data-hd-fe-fix-dismiss>閉じる</button></div></div>`;
}
function hdFERecheckFixFlow(){
 try{if(typeof hdSPSOpen==='function')hdSPSOpen();else if(typeof hdWSShowElement==='function')hdWSShowElement('guide',true)}catch{}
 setTimeout(()=>{try{if(typeof hdSPSRender==='function')hdSPSRender()}catch{}setTimeout(()=>document.querySelector('.hd-fe-gate')?.scrollIntoView({behavior:'smooth',block:'start'}),50)},40);
 return true;
}
function hdFERefreshPendingFix(){
 if(!hdFEFixFlowLoad())return false;
 setTimeout(()=>{try{if(document.querySelector('.hd-sps-auto')&&typeof hdSPSRender==='function')hdSPSRender()}catch{}},80);
 return true;
}
function hdFERevealTarget(target,scroll=true){
 const el=typeof target==='string'?document.getElementById(target):target;
 if(!el)return false;
 let opened=false;
 if(typeof window.hdRevealWorkspaceTarget==='function')opened=window.hdRevealWorkspaceTarget(el,scroll)!==false;
 if(!opened&&typeof hdWSShowElement==='function')opened=hdWSShowElement(el,scroll)!==false;
 if(!opened){
  el.hidden=false;el.classList?.remove('hd-ws-hidden');
  for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement)p.classList?.remove('hd-ws-wrapper-hidden');
  if(scroll)el.scrollIntoView?.({behavior:'smooth',block:'start'});
  opened=true;
 }
 return opened;
}
// A newer workspace choice cancels scrolling scheduled by the previous choice.
function hdFEDeferNavigation(run,delay){
 const epoch=Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH)||0;
 return setTimeout(()=>{if(epoch===(Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH)||0))run()},delay);
}
function hdFEOpenFix(id,auto=null){
 hdFEStartFixFlow(id,auto);
 const info=hdFEFixActionInfo(id),target=info.target;
 if(target==='calculator')return hdFEOpenCalculator();
 if(target==='guide'){
  hdFERevealTarget('guide',true);
  hdFEDeferNavigation(()=>document.getElementById('selectedMapCard')?.scrollIntoView({behavior:'smooth',block:'start'}),60);return true;
 }
 if(target==='kancolleImport'){
  hdFERevealTarget('kancolleImport',true);
  hdFEDeferNavigation(()=>{const focus=String(id)==='gameMatch'?document.getElementById('hdKcCurrentFleets'):document.getElementById('hdKcSyncStatus');(focus||document.getElementById('kancolleImport'))?.scrollIntoView({behavior:'smooth',block:'start'})},60);return true;
 }
 if(target==='equipmentBook'){
  hdFERevealTarget('equipmentBook',true);
  hdFEDeferNavigation(()=>document.getElementById('equipmentBook')?.scrollIntoView({behavior:'smooth',block:'start'}),60);return true;
 }
 if(typeof hdSPSOpen==='function')hdSPSOpen();return true;
}
function hdFEGateHtml(auto){
 window.__hdFELastAuto=auto||null;
 const gate=hdFEGoNoGo(auto),items=gate.actions.slice(0,6),flow=hdFEFixFlowHtml(auto);
 return `<div class="hd-fe-gate ${gate.state}"><div class="hd-fe-gate-head"><div><span>出撃判定</span><strong>${hdFEEsc(gate.label)}</strong></div><small>${hdFEEsc(gate.detail)}</small></div>${flow}${items.length?`<div class="hd-fe-gate-actions">${items.map((x,i)=>{const fix=hdFEFixActionInfo(x.id);return `<div class="${x.status}"><div><b>${i+1}. ${hdFEEsc(x.action)}</b><span>${hdFEEsc(x.label)}｜${hdFEEsc(x.detail)}</span></div><button type="button" class="ghost small" data-hd-fe-fix="${hdFEEsc(x.id)}">${hdFEEsc(fix.label)}</button></div>`}).join('')}</div>`:'<div class="hd-fe-gate-clear">この判定範囲では追加作業なし</div>'}</div>`;
}
function hdFEAutoHtml(v){
 return `<div class="hd-fe-auto ${v.status}">${hdFEGateHtml(v)}<div class="hd-fe-auto-head"><div><b>出撃自動判定</b><span>艦状態・補給・同期鮮度・ゲーム反映・編成・装備・制空・索敵を統合</span></div><strong>${hdFEAutoStatusLabel(v.status)}</strong></div><div class="hd-fe-auto-grid">${v.checks.map(x=>`<div class="${x.status}"><span>${hdFEEsc(x.label)}</span><b>${hdFEAutoStatusLabel(x.status)}</b><small>${hdFEEsc(x.detail||'')}</small></div>`).join('')}</div>${hdFEGameMatchHtml(v.gameMatch)}${v.scouting?.available&&v.scouting.checks?.length?`<div class="hd-fe-auto-detail"><b>索敵分岐</b>${v.scouting.checks.map(x=>`<span class="${x.status}">${hdFEEsc(x.label)}：${v.scouting.score.toFixed(2)} / 安全域 ${x.safe}${x.failBelow?`（${x.failBelow}未満は逸れ域）`:''}</span>`).join('')}</div>`:''}</div>`;
}
function hdFEEvaluate(plan){
 const map=plan?.map||'',items=hdFEAssigned(plan),stats=hdFEStats(items),air=hdFEAir(items),los=hdFELos(items,map),night=hdFENight(items,stats),master=hdFEMasterValidation(plan);
 const check=typeof hdSEChecks==='function'?hdSEChecks(map):{rows:[],adv:{}};
 const requirements=(check.rows||[]).filter(r=>r.kind!=='基地航空隊').map(r=>{
  const m=typeof HD_SE_RECIPES!=='undefined'&&HD_SE_RECIPES[r.kind]?hdSECapabilityMeasure(plan,r.kind):hdFEKindCount(r.kind,items),min=Math.max(1,Number(r.minCount)||1),count=Number(m.count)||0;
  const status=count>=min?'ready':(count>0||m.partial?'partial':'missing');
  return {kind:r.kind,label:r.label||r.kind,minCount:min,count,status,detail:m.detail||`${count} / 目安 ${min}`,hint:r.hint||''};
 });
 const ready=requirements.filter(x=>x.status==='ready').length;
 const partial=requirements.filter(x=>x.status==='partial').length;
 const missing=requirements.filter(x=>x.status==='missing').length;
 const result={
  map,items,stats,air,los,night,master,requirements,ready,partial,missing,
  antiGround:hdFEKindCount('対地',items).count,
  radar:hdFEKindCount('電探',items).count,
  aswGear:hdFEKindCount('対潜',items).count,
  aswStat:stats.対潜||0,
  speed:hdFEKindCount('高速化',items),
  smoke:hdFEKindCount('煙幕',items).count
 };
 result.auto=hdFEAutoVerdict(plan,result);return result;
}
function hdFEStatusLabel(s){return s==='ready'?'配置あり':s==='partial'?'一部配置':'未配置'}
function hdFEMetricHtml(label,value,note=''){
 return `<div class="hd-fe-metric"><span>${hdFEEsc(label)}</span><strong>${hdFEEsc(value)}</strong>${note?`<small>${hdFEEsc(note)}</small>`:''}</div>`;
}
function hdFERequirementHtml(r){
 return `<div class="hd-fe-req ${r.status}"><div><strong>${hdFEEsc(r.label)}</strong><small>${hdFEEsc(r.detail)}</small></div><b>${hdFEStatusLabel(r.status)}</b></div>`;
}
function hdFEHtml(plan){
 const e=hdFEEvaluate(plan),losText=e.los.weighted!=null?e.los.weighted.toFixed(2):e.los.raw.toFixed(2),losLabel=e.los.weighted!=null?'33式 装備項×係数':'索敵 装備項';
 const requirementHtml=e.requirements.length?e.requirements.map(hdFERequirementHtml).join(''):'<div class="muted">この海域では主要な特殊装備要求を検出していないよ。</div>';
 const airNote=e.air.count?`搭載数判明 ${e.air.capacityKnown}/${e.air.count}枠｜熟練度なし基礎制空 ${e.air.basePower}`:'航空装備なし';
 const losNote=e.los.summary?e.los.summary:'艦娘素索敵・司令部Lvを含む最終33式は別計算';
 const masterClass=e.master.invalid.length?'warn':e.master.unresolved.length?'partial':'ok';
 const masterLabel=e.master.invalid.length?`違反 ${e.master.invalid.length}`:e.master.unresolved.length?`未解決 ${e.master.unresolved.length}`:`正常 ${e.master.checked}件`;
 const masterRows=[...e.master.invalid.map(x=>({...x,kind:'bad'})),...e.master.unresolved.map(x=>({...x,kind:'unknown'}))].slice(0,8);
 return `<section class="hd-fe-panel">
  <div class="hd-fe-head"><div><div class="eyebrow">FLEET READINESS SCORECARD</div><strong>編成・装備の数値評価</strong><span>選択艦隊へ実際に配備された通常枠＋補強増設を集計</span></div><b class="${e.auto?.status==='missing'?'warn':e.auto?.status==='partial'||e.auto?.status==='manual'?'partial':'ok'}">自動判定 ${hdFEAutoStatusLabel(e.auto?.status||'manual')}</b></div>
  ${hdFEAutoHtml(e.auto)}
  <div class="hd-fe-master ${masterClass}"><div><b>マスター装備可否</b><span>${masterLabel}｜同期艦 ${e.master.shipsChecked}/${plan?.ships?.filter(x=>x.ship).length||0}</span></div>${masterRows.length?`<div class="hd-fe-master-rows">${masterRows.map(x=>`<span class="${x.kind}">${hdFEEsc(x.ship)}｜${hdFEEsc(x.where)}｜${hdFEEsc(x.name)}${x.reason?`｜${hdFEEsc(x.reason)}`:''}</span>`).join('')}</div>`:''}</div>
  <div class="hd-fe-metrics">
   ${hdFEMetricHtml('装備 火力+雷装',e.night.equipmentAttack,'艦娘本体の火力・雷装は含まない')}
   ${hdFEMetricHtml('装備 対潜',e.aswStat,`対潜装備 ${e.aswGear}個`)}
   ${hdFEMetricHtml('基礎制空',e.air.basePower,`${e.air.count}航空枠｜熟練度なし`)}
   ${hdFEMetricHtml(losLabel,losText,e.los.coef?`分岐点係数 ${e.los.coef}｜最終33式ではない`:'最終33式ではない')}
   ${hdFEMetricHtml('対地装備',e.antiGround,`電探 ${e.radar} / 煙幕 ${e.smoke}`)}
   ${hdFEMetricHtml('夜戦補助',e.night.support,`高速化 ${e.speed.detail||e.speed.count+'組'}`)}
  </div>
  <div class="hd-fe-subhead"><strong>海域要求との照合</strong><span>実配備された装備で判定</span></div>
  <div class="hd-fe-reqs">${requirementHtml}</div>
  ${e.los.summary?`<div class="hd-fe-caution"><b>索敵メモ</b><span>${hdFEEsc(losNote)}</span></div>`:''}
  <div class="hd-fe-caution"><b>制空について</b><span>基礎制空 ${e.air.basePower} は装備対空×√搭載数の熟練度なし目安。艦載機熟練度・改修補正・敵制空値を含む最終判定は艦隊制空・索敵プランナーで確認してね。</span></div>
  <div class="hd-fe-actions"><button type="button" class="ghost small" data-hd-fe-calculator>艦隊制空・索敵プランナー</button><button type="button" class="ghost small" data-hd-fe-prep>出撃準備表</button></div>
 </section>`;
}
function hdFEInstall(){
 if(window.__hdFleetEvaluatorInstalled||typeof hdFLPlanHtml!=='function')return false;
 window.__hdFleetEvaluatorInstalled=true;
 const prev=hdFLPlanHtml;
 hdFLPlanHtml=function(plan){
  const html=prev(plan),panel=hdFEHtml(plan);
  return html.replace('<div class="hd-fl-actions">',panel+'<div class="hd-fl-actions">');
 };
 return true;
}
function hdFEOpenCalculator(){
 hdFERevealTarget('guide',false);
 // Activate the tab in the same navigation turn; a later guide reveal must not
 // cancel opening the calculator while its saved tab is still the overview.
 let opened=false;
 if(typeof window.hdCoreMapAction==='function'){
  try{
   const result=window.hdCoreMapAction('gear');
   if(result&&typeof result.then==='function')result.catch(()=>{});
   opened=result!==false;
  }catch{}
 }
 if(!opened&&typeof hdSortieOpenTab==='function')opened=hdSortieOpenTab('gear')!==false;
 if(!opened){const btn=document.querySelector('[data-map-tab="gear"]');if(btn){btn.click();opened=true}}
 hdFEDeferNavigation(()=>document.getElementById('hdFleetCalculator')?.scrollIntoView({behavior:'smooth',block:'start'}),80);
 return true;
}
function hdFEOpenPreparation(){
 if(typeof hdSPSOpen==='function'){hdSPSOpen();return true}
 return hdFERevealTarget('guide',true);
}
document.addEventListener('click',e=>{
 const fix=e.target.closest?.('[data-hd-fe-fix]');if(fix){hdFEOpenFix(fix.dataset.hdFeFix);return}
 if(e.target.closest?.('[data-hd-fe-recheck]')){hdFERecheckFixFlow();return}
 if(e.target.closest?.('[data-hd-fe-fix-dismiss]')){hdFEFixFlowSave(null);try{if(typeof hdSPSRender==='function')hdSPSRender()}catch{}return}
 if(e.target.closest?.('[data-hd-fe-calculator]')){hdFEOpenCalculator();return}
 if(e.target.closest?.('[data-hd-fe-prep]')){hdFEOpenPreparation();return}
});
window.hdFEFixActionInfo=hdFEFixActionInfo;
window.hdFEOpenFix=hdFEOpenFix;
window.hdFEStartFixFlow=hdFEStartFixFlow;
window.hdFEFixFlowLoad=hdFEFixFlowLoad;
window.hdFEFixFlowState=hdFEFixFlowState;
window.hdFEFixFlowSave=hdFEFixFlowSave;
window.hdFEGateHtml=hdFEGateHtml;
window.hdFERecheckFixFlow=hdFERecheckFixFlow;
window.hdFEOpenCalculator=hdFEOpenCalculator;
window.hdFEOpenPreparation=hdFEOpenPreparation;
['hd:kancolle-sync','hd:equipment-changed','hd:ship-identity-changed','hd:map-air-changed'].forEach(evt=>window.addEventListener(evt,hdFERefreshPendingFix));
window.addEventListener('load',()=>setTimeout(()=>{if(!hdFEInstall())setTimeout(hdFEInstall,500)},720));
hdFEInstall();
