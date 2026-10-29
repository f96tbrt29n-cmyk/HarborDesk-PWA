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
// Only a synchronous, read-only owned-search step opts in. Never retain this
// lookup table while yielding to UI/sync events or across separate searches.
let hdFEActiveShipLookup=null;
function hdFEWithShipLookup(action){
 const previous=hdFEActiveShipLookup;hdFEActiveShipLookup=new Map();
 try{return action()}finally{hdFEActiveShipLookup=previous}
}
function hdFEFindShip(name){
 if(!hdFEActiveShipLookup||typeof name!=='string')return hdFEFindShipUncached(name);
 if(!hdFEActiveShipLookup.has(name))hdFEActiveShipLookup.set(name,hdFEFindShipUncached(name));
 return hdFEActiveShipLookup.get(name);
}
function hdFEFindShipUncached(name){
 if(typeof hdShipDbResolveShip==='function')return hdShipDbResolveShip(String(name||'').trim());
 const rows=typeof HD_SHIP_DATABASE!=='undefined'?HD_SHIP_DATABASE:[];
 return rows.find(x=>x.final===name||x.base===name)||null;
}
// Leave the right-side whitespace for the next separator, preserving empty slots.
function hdFEGearTokens(gear){return String(gear||'').split(/\s+\/(?=\s|$)/).map(x=>x.trim())}
function hdFEParseGearLabel(label){
 let s=String(label||'').trim(),expansion=false,star=0;
 if(/^\[増設\]/.test(s)){expansion=true;s=s.replace(/^\[増設\]\s*/,'').trim()}
 const m=s.match(/\s+★(\d+)$/);if(m){star=Math.max(0,Number(m[1])||0);s=s.slice(0,m.index).trim()}
 return {name:s,star,expansion};
}
function hdFEPlanFromSavedFleet(map,fleet){
 const ships=(fleet?.ships||[]).filter(x=>String(x.ship||'').trim()||String(x.gear||'').trim()).map(row=>{
  const db=hdFEFindShip(String(row.ship||'').trim()),profile=db&&typeof hdShipDbSlotProfile==='function'?hdShipDbSlotProfile(db):null;
  const tokens=hdFEGearTokens(row.gear).map(hdFEParseGearLabel);
  const normal=tokens.filter(x=>!x.expansion),ex=tokens.find(x=>x.expansion)||null;
  const items=normal.map((x,i)=>({name:x.name,star:x.star,slotIndex:i,capacity:profile?.slots?.[i]??null,category:hdFEFind(x.name)?.category||''})).filter(x=>x.name);
  return {ship:String(row.ship||'').trim(),rosterId:row.rosterId||'',gameShipId:Number(row.gameShipId)||0,masterId:Number(row.masterId)||Number(db?.id)||0,type:db?.type||'',items,expansion:ex?{name:ex.name,star:ex.star}:null,missing:[],master:!!profile};
 });
 const presets=typeof MAP_PLANS!=='undefined'?(MAP_PLANS[map]?.presets||[]):[],preset=fleet?.routePreset||presets.find(p=>String(fleet?.name||'').includes(String(p?.name||'')))||null,routeInfo=preset&&typeof hdFSPresetInfo==='function'?hdFSPresetInfo(preset):null;
 return {map,ships,routeGoal:fleet?.routeGoal??'',missing:[],masterBacked:ships.filter(x=>x.master).length,createdAt:Date.now(),source:'saved-fleet',sourceFleet:fleet||null,search:fleet?.searchAssessment||null,preset,routeInfo};
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
function hdFEExpansionAvailability(ship){
 const pinned=Number(ship?.gameShipId)>0||!!ship?.rosterId,rows=hdFERoster();
 let matching=rows.filter(r=>Number(ship?.gameShipId)>0?Number(r.gameShipId)===Number(ship.gameShipId):ship?.rosterId?String(r.id||'')===String(ship.rosterId):Number(ship?.masterId)>0?Number(r.masterId)===Number(ship.masterId):r.name===ship?.ship);
 if(!pinned&&!matching.length)matching=rows.filter(r=>r.name===ship?.ship&&(!Number(ship?.masterId)||!Number(r.masterId)));
 // Unowned theoretical examples still describe equipment compatibility. Owned
 // readiness separately requires physical ships; never borrow another's unlock.
 if(!pinned&&!matching.length)return {status:'theoretical',allowed:true};
 const row=matching.length===1?matching[0]:null,value=row?.gameSlotEx;
 if(!row||Number(ship?.masterId)>0&&Number(row.masterId)>0&&Number(ship.masterId)!==Number(row.masterId)||value==null||String(value).trim()===''||!Number.isInteger(Number(value))||Number(value)<-1)return {status:'manual',allowed:false,reason:'増設の開放状態を同期情報で確認できません'};
 return Number(value)===0?{status:'missing',allowed:false,reason:'補強増設が未開放です'}:{status:'ready',allowed:true};
}
function hdFEMasterValidation(plan){
 const invalid=[],unresolved=[];let checked=0,shipsChecked=0;
 for(const row of plan?.ships||[]){
  const db=hdFEFindShip(row.ship),profile=db&&typeof hdShipDbSlotProfile==='function'?hdShipDbSlotProfile(db):null;
  if(!db||!profile){if(row.ship)unresolved.push({ship:row.ship,name:'艦娘マスター未登録',where:'ship'});continue}
  shipsChecked++;
  for(const [position,item] of (row.items||[]).entries()){
   const meta=hdFEFind(item.name);
   if(!meta){unresolved.push({ship:row.ship,name:item.name,where:`第${(Number(item.slotIndex)||0)+1}スロ`});continue}
   checked++;
   const index=Number(item.slotIndex??position),duplicate=(row.items||[]).filter((x,i)=>x.name&&Number(x.slotIndex??i)===index).length>1;
   if(!Number.isInteger(index)||index<0||index>=profile.count||duplicate){invalid.push({ship:row.ship,name:item.name,where:'通常スロット',reason:duplicate?'通常スロットの重複':'通常スロット範囲外'});continue}
   const compatible=typeof hdShipDbEquipCompatible==='function'?hdShipDbEquipCompatible(meta,db):true;
   const rejected=typeof hdShipDbSlotRejects==='function'?hdShipDbSlotRejects(profile,index,meta):false;
   if(!compatible||rejected)invalid.push({ship:row.ship,name:item.name,where:`第${(Number(item.slotIndex)||0)+1}スロ`,reason:!compatible?'通常装備不可':'スロット位置制限'});
  }
  if(row.expansion?.name){
   const available=hdFEExpansionAvailability(row);
   if(!available.allowed)(available.status==='manual'?unresolved:invalid).push({ship:row.ship,name:row.expansion.name,where:'補強増設',reason:available.reason});
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
// Generic surface night attacks, checked against KC3Kai Ship.estimateNightAttackType
// and https://wikiwiki.jp/kancolle/夜戦#dfcb6e1f (2026-10-12).
function hdFENightEquipment(ship){
 const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db),master=db&&hdShipDbMasterRowFor(db),result=detail=>({status:'manual',db,rows:[],detail});
 if(!db||!profile||Number(ship.masterId)>0&&Number(master?.id)!==Number(ship.masterId))return result('艦娘名・改造段階・マスター情報を確認してね。');
 const slots=new Set(),rows=(ship.items||[]).filter(x=>x.name);
 for(const row of rows){const index=Number(row.slotIndex),item=hdFEFind(row.name);if(!item||!Number.isInteger(index)||index<0||index>=profile.count||slots.has(index)||!hdShipDbEquipCompatible(item,db)||hdShipDbSlotRejects(profile,index,item))return result('装備性能・通常スロット位置・装備可否を確認してね。');slots.add(index)}
 if(ship.expansion?.name){const item=hdFEFind(ship.expansion.name);if(!item||!hdFLHasExpansion(hdFEAswRoster(ship))||!hdShipDbExpansionInfo(item,db,ship.expansion.star).allowed)return result('増設の開放状態・装備可否を確認してね。');rows.push(ship.expansion)}
 return {status:'known',db,rows};
}
function hdFENightCI(ship){
 const equipment=hdFENightEquipment(ship),db=equipment.db,base={main:0,secondary:0,torpedo:0},result=(status,attack,label,detail)=>({status,attack,label,detail,...base});
 if(equipment.status==='manual')return result('manual','unknown','未判定',equipment.detail);
 if(!['駆逐艦','軽巡洋艦','練習巡洋艦','重雷装巡洋艦','重巡洋艦','航空巡洋艦','戦艦','高速戦艦','航空戦艦','海防艦','海防戦艦'].includes(db.type))return result('manual','unsupported','未対応','この艦種の夜戦攻撃は別判定です。専用CIの条件を確認してね。');
 const rows=equipment.rows;
 for(const row of rows){const cat=hdFEFind(row.name).category||'';if(cat.includes('主砲'))base.main++;else if(cat.includes('副砲'))base.secondary++;else if(cat==='魚雷'||cat==='潜水艦魚雷')base.torpedo++}
 if(base.main>=3)return result('ready','main','主砲カットイン','主砲3以上。汎用CIでは主砲CIが優先されます。');
 if(base.main>=2&&base.secondary>=1)return result('ready','main-secondary','主副カットイン','主砲2以上＋副砲1以上。汎用CIでは魚雷CIより優先されます。');
 if(base.torpedo>=2)return result('ready','torpedo','魚雷カットイン','魚雷2以上。甲標的は魚雷の個数に含めません。');
 if(base.main>=1&&base.torpedo>=1)return result('ready','mixed','主魚カットイン','主砲1以上＋魚雷1以上。');
 if(base.main+base.secondary>=2)return result('missing','double','夜戦連撃','汎用CIの装備条件は未成立。主砲・副砲の合計2以上で連撃条件です。');
 return result('missing','normal','通常攻撃','汎用CI・連撃の装備条件が未成立です。');
}
// Destroyer special sets roll separately from the generic attack above.
// KC3Kai Ship.estimateNightAttackType/Gear.isSurfaceRadar (2026-10-12).
function hdFENightDD(ship){
 const db=hdFEFindShip(ship.ship),generic=hdFENightCI(ship),base={candidates:[],level:null,hitStatus:'manual',hitDetail:'レベル未確認。同期・艦娘台帳で確認してね。'};
 if(db?.type!=='駆逐艦')return {...base,status:'manual',detail:'駆逐艦専用の装備条件です。'};
 if(generic.status==='manual')return {...base,status:'manual',detail:generic.detail};
 const rows=[...(ship.items||[]),...(ship.expansion?[ship.expansion]:[])].filter(x=>x.name),items=rows.map(x=>hdFEFind(x.name)),has=part=>items.some(x=>hdSEPartMatches(part,x)),count=part=>items.filter(x=>hdSEPartMatches(part,x)).length,candidates=[];
 if(has('nightSmallMain')&&has('nightTorpedo')&&has('nightSurfaceRadar'))candidates.push({attack:'dd-main-radar',label:'主魚電CI'});
 if(has('nightTorpedo')&&has('nightLookout')&&has('nightSurfaceRadar'))candidates.push({attack:'dd-lookout-radar',label:'魚見電CI'});
 if(count('nightTorpedo')>=2&&has('nightWaterLookout'))candidates.push({attack:'dd-water-torpedo',label:'魚魚水CI'});
 if(has('nightTorpedo')&&has('nightDrum')&&has('nightWaterLookout'))candidates.push({attack:'dd-water-drum',label:'魚ド水CI'});
 const roster=hdFEAswRoster(ship),master=hdShipDbMasterRowFor(db),identity=roster&&(!Number(roster.masterId)||Number(roster.masterId)===Number(master?.id)),raw=identity?roster.level:!ship.gameShipId?ship.level:null,n=Number(raw),level=raw!=null&&String(raw).trim()!==''&&Number.isInteger(n)&&n>=1&&n<=200?n:null;
 return {...base,status:candidates.length?'ready':'missing',candidates,level,hitStatus:level==null?'manual':level>=80?'ready':'missing',hitDetail:level==null?base.hitDetail:level>=80?`Lv${level}：2回攻撃型のレベル条件を充足。1回攻撃型の判定もあります。`:`Lv${level}：専用CIは1回攻撃型。2回攻撃型にはLv80以上が必要。`,detail:candidates.length?'専用CIは成立する複数の装備セットを順に判定。汎用CIとは別の判定機会です。':'主砲・魚雷・水上電探、見張員などの組み合わせが未成立です。',dGun:items.some(x=>['12.7cm連装砲D型改二','12.7cm連装砲D型改三'].includes(x.name))};
}
function hdFENightDDHtml(ship){
 if(hdFEFindShip(ship.ship)?.type!=='駆逐艦')return '';
 const x=hdFENightDD(ship),esc=hdFEEsc;return `<section class="hd-fl-night ${x.status}"><b>駆逐艦専用CI装備条件：${x.status==='ready'?'成立':x.status==='manual'?'未判定':'未成立'}</b><p>${esc(x.candidates.map(c=>c.label).join(' → ')||x.detail)}</p>${x.candidates.length?`<small>${esc(x.detail)}</small>`:''}<p>攻撃回数の条件：${esc(x.hitDetail)}</p><small>水上艦目標向け。発動・命中・2回攻撃は確定しません。運・配置・損傷も確認してね。水上電探は素索敵5以上。通常の熟練見張員は魚魚水・魚ド水CI用の水雷戦隊 熟練見張員を代用できません。${x.dGun?'D型改二・改三の砲あり。主魚電・魚見電CIの威力補正対象です。':'D型砲は装備条件の必須ではありません。威力補正は別確認です。'}</small><a class="guide-link" href="https://wikiwiki.jp/kancolle/夜戦#dfcb6e1f" target="_blank" rel="noopener">駆逐艦専用CIの出典 ↗</a></section>`;
}
// The submarine radar set shadows the late-torpedo pair, which shadows the regular pair.
function hdFENightSub(ship){
 const equipment=hdFENightEquipment(ship),base={late:0,radar:0,torpedo:0},result=(status,attack,label,detail)=>({status,attack,label,detail,...base});
 if(!['潜水艦','潜水空母'].includes(equipment.db?.type))return result('manual','unsupported','未対応','潜水艦・潜水空母専用の装備条件です。');
 if(equipment.status==='manual')return result('manual','unknown','未判定',equipment.detail);
 for(const row of equipment.rows){const item=hdFEFind(row.name);if(!hdSENightSubMeta(item.name))return result('manual','unknown','未判定','装備のマスター区分が未確認です。');if(hdSEPartMatches('nightSubLate',item))base.late++;if(hdSEPartMatches('nightSubRadar',item))base.radar++;if(hdSEPartMatches('nightTorpedo',item))base.torpedo++}
 if(base.late>=1&&base.radar>=1)return result('ready','sub-radar','後期型魚雷＋潜水艦用電探CI','このセットが優先されます。後期型魚雷2本のCIとは重複して判定しません。');
 if(base.late>=2)return result('ready','sub-late','後期型魚雷2本CI','後期型魚雷2本。潜水艦用電探のセットがなければ、このCIを優先します。');
 if(base.torpedo>=2)return result('ready','sub-torpedo','通常魚雷2本CI','後期型の専用セットがない場合の通常魚雷CI。甲標的は魚雷に数えません。');
 return result('missing','normal','通常攻撃','後期型魚雷＋潜水艦用電探、後期型魚雷2本、通常魚雷2本のいずれも未成立です。');
}
function hdFENightSubHtml(ship){
 const x=hdFENightSub(ship),esc=hdFEEsc;return `<section class="hd-fl-night ${x.status}"><b>潜水艦夜戦CI装備条件：${x.status==='ready'?'成立':x.status==='manual'?'未判定':'未成立'}</b><p>${esc(x.label)}｜${esc(x.detail)}</p>${x.status!=='manual'?`<small>後期型魚雷 ${x.late}・潜水艦用電探 ${x.radar}・魚雷合計 ${x.torpedo}</small>`:''}<small>水上艦目標向けの装備条件です。発動率・命中・撃破火力は未計算。運・配置・損傷も確認してね。装備名に「後期型」「電探」があるだけでは専用セットと判定しません。潜水艦隊の特殊攻撃は別判定です。</small><a class="guide-link" href="https://wikiwiki.jp/kancolle/夜戦#dfcb6e1f" target="_blank" rel="noopener">潜水艦CIの出典 ↗</a></section>`;
}
// Equipment prerequisites only. KC3Kai Ship.canCarrierNightAirAttack / estimateNightAttackType.
// https://github.com/KC3Kai/KC3Kai/blob/6b0534d291c27220da1b6fe454e91fc96a6a7b27/src/library/objects/Ship.js
function hdFENightCarrier(ship){
 const equipment=hdFENightEquipment(ship),db=equipment.db,base={fighter:0,torpedo:0,bomber:0,photo:0,special:0,nightPlanes:0,crew:0,native:false,candidates:[],depleted:[],unknownCapacity:false},result=(status,detail)=>({...base,status,detail});
 if(!['正規空母','装甲空母','軽空母'].includes(db?.type))return result('manual','空母専用の装備条件です。');
 if(equipment.status==='manual')return result('manual',equipment.detail);
 const profile=hdShipDbSlotProfile(db),master=hdShipDbMasterRowFor(db),roster=hdFEAswRoster(ship),identity=roster&&(!Number(roster.masterId)||Number(roster.masterId)===Number(master.id)),live=identity&&Array.isArray(roster.gameOnslot)?roster.gameOnslot:[];
 if(roster?.masterId&&Number(roster.masterId)!==Number(master.id))return result('manual','同期された改造段階と配備案が違います。再配備して確認してね。');
 base.native=HD_SE_NATIVE_NIGHT_CARRIERS.has(Number(master.id));
 for(const row of equipment.rows){
  const item=hdFEFind(row.name);if(hdSEPartMatches('nightCarrierCrew',item))base.crew++;
  const fighter=hdSEPartMatches('nightCarrierFighter',item),torpedo=hdSEPartMatches('nightCarrierTorpedo',item),bomber=hdSEPartMatches('nightCarrierBomber',item),photo=hdSEPartMatches('nightCarrierPhoto',item),special=HD_SE_CARRIER_SPECIAL_IDS.has(Number(hdSENightSubMeta(item.name)?.id));if(!fighter&&!torpedo&&!bomber&&!photo&&!special)continue;
  const i=Number(row.slotIndex),raw=live[i],known=raw!=null&&String(raw).trim()!==''&&Number.isFinite(Number(raw))&&Number(raw)>=0,capacity=known?Number(raw):Number(profile.slots[i]);
  if(capacity<=0){base.depleted.push(row.name);continue}if(!Number.isFinite(capacity))return result('manual','航空機の搭載枠を確認してね。');
  if(!known)base.unknownCapacity=true;
  if(fighter)base.fighter++;if(torpedo)base.torpedo++;if(bomber)base.bomber++;if(photo)base.photo++;if(special)base.special++;
 }
 base.nightPlanes=base.fighter+base.torpedo+base.bomber+base.photo+base.special;
 if(!base.native&&!base.crew)return result('missing','この改造段階は夜間作戦航空要員系が必要です。');
 if(base.fighter>=2&&base.torpedo>=1)base.candidates.push({attack:'cv-fighter2',label:'夜間戦闘機2＋夜間攻撃機1CI'});
 if(base.fighter>=1&&base.torpedo>=1)base.candidates.push({attack:'cv-fighter1',label:'夜間戦闘機1＋夜間攻撃機1CI'});
 if((base.photo>=1&&(base.fighter>=1||base.torpedo>=1||base.bomber>=1))||(base.bomber>=1&&(base.fighter>=1||base.torpedo>=1))||base.bomber>=2)base.candidates.push({attack:'cv-bomber',label:'夜間爆撃機・光電管爆弾CI'});
 if(base.fighter>=1&&base.nightPlanes>=3&&!(base.fighter===2&&base.torpedo===1&&base.nightPlanes===3))base.candidates.push({attack:'cv-three',label:'夜間機3枠CI'});
 return result(base.candidates.length?'ready':'missing',base.candidates.length?'対応セットの装備条件が成立。複数成立時は順に判定されます。':'対応する夜間機の組み合わせが不足しています。');
}
function hdFENightCarrierHtml(ship){
 const x=hdFENightCarrier(ship),esc=hdFEEsc;return `<section class="hd-fl-night ${x.status}"><b>空母夜戦CI装備条件：${x.status==='ready'?'成立':x.status==='manual'?'未判定':'未成立'}</b><p>${esc(x.candidates.map(c=>c.label).join(' → ')||x.detail)}</p><small>夜間戦闘機 ${x.fighter}・夜間攻撃機 ${x.torpedo}・夜間爆撃機 ${x.bomber}・光電管爆弾 ${x.photo}・岩井隊爆戦／Swordfish系 ${x.special}・${x.native?'夜間作戦航空要員は不要な改造段階':'夜間作戦航空要員系 '+x.crew}</small>${x.fighter===2&&x.torpedo===1&&x.nightPlanes===3?'<p>夜間機3枠CIは対象外：夜間戦闘機2＋夜間攻撃機1の専用セットとして判定します。</p>':''}${x.depleted.length?`<p>搭載数0で判定から除外：${esc(x.depleted.join('、'))}。補給・残機を確認してね。</p>`:''}${x.unknownCapacity?'<p>残機未同期の枠は最大搭載数で装備条件を判定。出撃前に補給・残機を確認してね。</p>':''}<small>水上艦目標向け。発動率・撃破火力は未計算。通常・軽空母は中破で攻撃不可、装甲空母も大破で攻撃不可。損傷・連合艦隊の配置を別途確認してね。岩井隊爆戦・Swordfish系だけでは夜間機3枠CIは成立しません。通常の空母夜間砲撃・Ark RoyalのSwordfish単独による夜間攻撃は別判定です。</small><a class="guide-link" href="https://github.com/KC3Kai/KC3Kai/blob/master/src/library/objects/Ship.js" target="_blank" rel="noopener">空母夜戦CIの判定出典 ↗</a></section>`;
}
function hdFENightCIHtml(ship){
 if(['正規空母','装甲空母','軽空母'].includes(hdFEFindShip(ship.ship)?.type))return hdFENightCarrierHtml(ship);
 if(['潜水艦','潜水空母'].includes(hdFEFindShip(ship.ship)?.type))return hdFENightSubHtml(ship);
 const x=hdFENightCI(ship),esc=hdFEEsc;return `<section class="hd-fl-night ${x.status}"><b>夜戦汎用CI装備条件：${x.status==='ready'?'成立':x.status==='manual'?'未判定':'未成立'}</b><p>${esc(x.label)}｜${esc(x.detail)}</p>${x.status!=='manual'?`<small>主砲 ${x.main}・副砲 ${x.secondary}・魚雷 ${x.torpedo}</small>`:''}<small>水上艦目標向けの装備条件です。発動確定・発動率・撃破火力の判定ではありません。運・Lv・配置・損傷、敵の種類も確認してね。駆逐艦専用CIは下欄、夜間瑞雲・タッチなどは別判定です。</small><a class="guide-link" href="https://wikiwiki.jp/kancolle/夜戦#dfcb6e1f" target="_blank" rel="noopener">夜戦装備条件の出典 ↗</a></section>${hdFENightDDHtml(ship)}`;
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
  const live=fleets.flatMap(d=>d.ships||[]).find(s=>Number(s.gameShipId)===Number(row.gameShipId));
  if(!actualSlots||row.gameAswGearKnown===false||live?.gearKnown===false){unknown++;details.push({name:ship.ship,status:'unknown',mismatches,gameShipId:Number(row.gameShipId)});continue}
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
 const parts=[];if(fleetMatch)parts.push(`${deck.name||'ゲーム艦隊'}一致`);else if(deckOrderMismatch)parts.push('同じ艦だが並び順が違う');else if(fleetKnown)parts.push('現在艦隊と不一致');else parts.push('現在艦隊の照合待ち');if(gearMismatch)parts.push(`装備差 ${gearMismatch}件`);else if(!unknown)parts.push('装備一致');if(unknown)parts.push(`装備情報未確認 ${unknown}隻`);
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
 const expansion=ship.expansion?.name?hdFEExpansionAvailability(ship):null;
 const key=JSON.stringify([ship.ship,master?.id,base,type,(ship.items||[]).map(x=>[x.name,x.star,x.slotIndex]),ship.expansion,expansion?.status]),cached=HD_FE_SPEED_MEMO.get(ship);if(cached?.key===key)return cached.value;
 const entries=[...(ship.items||[]).map((x,i)=>({...x,slotIndex:x.slotIndex??i})),...(ship.expansion?.name?[{...ship.expansion,isExpansion:true}]:[])];
 for(const item of entries){const name=String(item.name||'').normalize('NFKC').replace(/\s+/g,'');if(!['改良型艦本式タービン','強化型艦本式缶','新型高温高圧缶'].includes(name))continue;
  if(item.isExpansion&&!expansion.allowed){invalid.push(item.name+'（'+expansion.reason+'）');continue}
  const speedDb=master?hdShipDbMasterAdapter({masterId:master.id}):db,meta=hdFEFind(item.name),profile=speedDb&&hdShipDbSlotProfile(speedDb),unique=item.isExpansion||entries.filter(x=>!x.isExpansion&&Number(x.slotIndex)===Number(item.slotIndex)).length===1,allowed=unique&&meta&&profile&&(item.isExpansion?hdShipDbExpansionInfo(meta,speedDb,item.star).allowed:hdShipDbEquipCompatible(meta,speedDb)&&Number.isInteger(Number(item.slotIndex))&&Number(item.slotIndex)>=0&&Number(item.slotIndex)<profile.count&&!hdShipDbSlotRejects(profile,Number(item.slotIndex),meta));
  if(!allowed){invalid.push(item.name+'（装備位置・装備可否が未充足）');continue}
  if(name==='改良型艦本式タービン')parts.t++;else{parts.c++;if(name==='新型高温高圧缶'){parts.n++;if(Number(item.star)>=7)parts.h++;}}
 }
 let rank=base;
 if(group)for(const target of [10,15,20])if(hdFESpeedRecipes(group,target,base).some(r=>Object.entries(r).every(([k,v])=>parts[k]>=v)))rank=Math.max(rank,target);
 const value={base,rank,group,parts,invalid,expansionUnconfirmed:expansion?.status==='manual',known:!!base,label:hdFESpeedLabel(rank),detail:`${ship.ship}：${hdFESpeedLabel(base)} → ${hdFESpeedLabel(rank)}${group?`（${group}）`:'（潜在速力区分が未登録）'}`};HD_FE_SPEED_MEMO.set(ship,{key,value});return value;
}
function hdFESpeedGoal(ship,target){
 const speed=hdFEShipSpeed(ship),recipes=hdFESpeedRecipes(speed.group,target,speed.base),ok=speed.known&&!speed.expansionUnconfirmed&&!speed.invalid.length&&speed.rank>=target,ratio=ok?1:Math.max(0,...recipes.map(r=>{const values=Object.entries(r);return values.length?values.reduce((n,[k,v])=>n+Math.min(1,speed.parts[k]/v),0)/values.length:0})),unresolved=!speed.known||speed.expansionUnconfirmed||!speed.group&&speed.rank<target;
 return {kind:'speed-ship',label:`${ship.ship} の${hdFESpeedLabel(target)}条件`,count:Number(ok),minCount:1,ok,ratio,speedActual:true,speed,unresolved,detail:`${speed.detail} / 必要 ${hdFESpeedLabel(target)}。${ok?'配備案の速力条件を満たす':unresolved?'艦娘名・改造段階・速力データを確認':recipes.length?'必要な組み合わせ：'+recipes.map(hdFESpeedRecipeText).join(' または '):'この艦の速力区分では到達できません。艦娘を入れ替えてね'}${speed.invalid.length?'。'+speed.invalid.join('、'):''}`};
}
function hdFERouteShips(plan){
 return (plan?.ships||[]).filter(x=>x?.ship).map(s=>{const row=hdFERosterForShip(s),db=hdFEFindShip(s.ship),speedInfo=hdFEShipSpeed(s);return {ship:s,type:db?.type||row?.type||s.type||'',typeKnown:!!db?.type&&db.type!=='海防戦艦',speed:speedInfo.label,speedInfo}});
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
// Three-valued predicates: a missing fact never becomes a satisfied condition.
function hdFEBranchPredicate(condition,ships,plan=null){
 const manual=detail=>({status:'manual',ratio:0,detail});
 if(!condition||typeof condition!=='object')return manual('分岐条件が未登録');
 const fields={always:[],unverified:[],fleetCount:['min','max'],typeCount:['types','min','max','matchPolicy','excludeMasterNames'],minSpeed:['rank'],slowBattleshipCount:['min','max'],speedCount:['rank','min','max'],namedCount:['names','min','max','matchPolicy'],flagshipType:['types'],equipmentShips:['match','min','max','slotPolicy'],scoutingValue:['min','coef'],airValue:['min']};
 const groups=['all','any','not'].filter(k=>Object.prototype.hasOwnProperty.call(condition,k)),supported=['kind','reason','state','source','sources','checkedAt',...groups,...(Array.isArray(fields[condition.kind])?fields[condition.kind]:[])];
 const extra=Object.keys(condition).filter(k=>!supported.includes(k));
 if(extra.length||groups.length>1||groups.length&&condition.kind||condition.state&&condition.state!=='verified')return manual('未対応・未確認の分岐条件：'+(extra.join('、')||condition.state||'条件式'));
 if(condition.kind==='always')return {status:'ready',ratio:1,detail:'他の優先条件に該当しない'};
 if(condition.not){const child=hdFEBranchPredicate(condition.not,ships,plan);return {...child,status:child.status==='ready'?'missing':child.status==='missing'?'ready':'manual',ratio:child.status==='missing'?1:0,detail:'否定条件: '+child.detail}}
 const group=Array.isArray(condition.all)?'all':Array.isArray(condition.any)?'any':null;
 if(group){
  const children=condition[group].map(x=>hdFEBranchPredicate(x,ships,plan));if(!children.length)return manual('分岐条件が空です');
  const status=group==='all'?(children.some(x=>x.status==='missing')?'missing':children.every(x=>x.status==='ready')?'ready':'manual'):(children.some(x=>x.status==='ready')?'ready':children.every(x=>x.status==='missing')?'missing':'manual');
  return {status,children,ratio:group==='all'?children.reduce((n,x)=>n+x.ratio,0)/children.length:Math.max(...children.map(x=>x.ratio)),detail:children.map(x=>x.detail).join(group==='all'?' / ':' または ')};
 }
 if(condition.kind==='unverified')return manual(condition.reason||'条件の根拠を確認してください');
 if(condition.kind==='flagshipType'){
  if(!Array.isArray(condition.types)||!condition.types.length||condition.types.some(x=>typeof x!=='string'))return manual('旗艦の艦種条件が未登録');
  const first=ships[0],known=first?.typeKnown,ok=known&&condition.types.includes(first.type);return {status:!first?'missing':known?(ok?'ready':'missing'):'manual',ratio:Number(ok),detail:`旗艦 ${first?.ship?.ship||'未選択'} / 必要 ${condition.types.join('・')}`};
 }
 if(['speedCount','namedCount','slowBattleshipCount'].includes(condition.kind)){
  if(!Number.isInteger(condition.min)||!Number.isInteger(condition.max)||condition.min<0||condition.max<condition.min||condition.max>7)return manual('艦数条件が未登録');
  if(condition.kind==='speedCount'&&![5,10,15,20].includes(condition.rank)||condition.kind==='namedCount'&&(!Array.isArray(condition.names)||!condition.names.length||condition.names.some(n=>typeof n!=='string'||!n)))return manual('速力・史実艦条件が未登録');
  if(condition.kind==='namedCount'&&Object.prototype.hasOwnProperty.call(condition,'matchPolicy')&&condition.matchPolicy!=='masterName')return manual('未対応の史実艦名照合です');
  let count=0,unknown=0;
  for(const row of ships){if(condition.kind==='slowBattleshipCount'){const master=typeof hdShipDbMasterRowFor==='function'?hdShipDbMasterRowFor({name:row.ship.ship,masterId:row.ship.masterId}):null;if(!row.typeKnown||!master||!Number.isInteger(master.stype)||master.stype<=0||String(master.name||'')!==String(row.ship.ship||''))unknown++;else if(master.stype===9)count++;}else if(condition.kind==='speedCount'){if(!row.speedInfo.known||row.speedInfo.invalid.length||[...(row.ship.items||[]),row.ship.expansion].some(i=>i?.name&&!hdFEFind(i.name)))unknown++;else if(row.speedInfo.rank===condition.rank)count++;}else{const db=hdFEFindShip(row.ship.ship),master=db&&hdShipDbMasterRowFor({name:row.ship.ship,masterId:row.ship.masterId});if(!db||!master||condition.matchPolicy==='masterName'&&String(master.name||'')!==String(row.ship.ship||''))unknown++;else if(condition.names.some(n=>String(master.name||row.ship.ship).startsWith(n)))count++;}}
  const {min,max}=condition,status=count>max||count+unknown<min?'missing':count>=min&&count+unknown<=max?'ready':'manual',label=condition.kind==='slowBattleshipCount'?'低速戦艦（元の艦種）':condition.kind==='speedCount'?hdFESpeedLabel(condition.rank)+'艦（配備後）':condition.names.join('・');
  return {status,count,min,max,ratio:condition.kind==='slowBattleshipCount'?(status==='ready'?1:status==='manual'?0:count>max?Math.max(0,1-(count-max)/Math.max(1,count)):Math.min(1,count/Math.max(1,min))):status==='ready'?1:Math.min(1,count/Math.max(1,min)),detail:condition.kind==='slowBattleshipCount'?`${label} ${count}隻 / 上限${max}隻${count>max?'（'+(count-max)+'隻超過）':''}${unknown?' / 未判定 '+unknown+'隻':''}`:`${label} ${count}/${min}隻${unknown?' / 未判定 '+unknown+'隻':''}`};
 }
 if(condition.kind==='equipmentShips'){
  if(!['radar','drum','landingCandidates'].includes(condition.match)||condition.slotPolicy&&condition.slotPolicy!=='valid'||!Number.isInteger(condition.min)||!Number.isInteger(condition.max)||condition.min<0||condition.max<condition.min||condition.max>7)return manual('装備艦数・搭載条件が未対応');
  if(condition.match==='landingCandidates'&&(condition.min!==0||condition.max!==3))return manual('大発系候補は3隻以下という上限確認だけに対応。個別装備の分岐算入は未確認です');
  let count=0,unknown=0;
  for(const row of ships){const ship=row.ship,db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);let has=false,unresolved=!profile;
   for(const [i,item] of [...(ship.items||[]).map((x,i)=>[i,x]),...(ship.expansion?.name?[[null,ship.expansion]]:[])]){if(!item.name)continue;const meta=hdFEFind(item.name);if(!meta){unresolved=true;continue}if(condition.match==='drum'?meta.name!=='ドラム缶(輸送用)':condition.match==='landingCandidates'?!['上陸用舟艇','特型内火艇'].includes(meta.category):!/電探/.test(meta.category||''))continue;
    const available=i===null?hdFEExpansionAvailability(ship):null;if(available&&!available.allowed){if(available.status==='manual')unresolved=true;continue}
    const slot=item.slotIndex??i,unique=i===null||(ship.items||[]).filter((x,j)=>Number(x.slotIndex??j)===slot).length===1,allowed=unique&&profile&&(i===null?hdShipDbExpansionInfo(meta,db,item.star).allowed:hdShipDbEquipCompatible(meta,db)&&Number.isInteger(slot)&&slot>=0&&slot<profile.count&&!hdShipDbSlotRejects(profile,slot,meta));if(allowed)has=true;
   }if(has)count++;else if(unresolved)unknown++;
  }
  const {min,max}=condition,status=count>max||count+unknown<min?'missing':count>=min&&count+unknown<=max?'ready':'manual';
  if(condition.match==='landingCandidates')return {status,count,min,max,gap:0,ratio:status==='ready'?1:status==='manual'?0:Math.max(0,1-(count-max)/Math.max(1,count)),detail:`大発系の候補装備艦 ${count}隻 / 上限${max}隻${unknown?' / 未判定 '+unknown+'隻':''}。同じ艦の複数装備は1隻。個別装備の分岐算入は未確定です`};
  const label=condition.match==='drum'?'ドラム缶':'電探',note=condition.match==='drum'?'同じ艦に複数積んでも1隻':'複数電探を同じ艦に積んでも1隻';return {status,count,min,max,gap:Math.max(0,min-count),ratio:status==='ready'?1:Math.min(1,count/Math.max(1,min)),detail:`${label}装備艦 ${count}/${min}隻${unknown?' / 未判定 '+unknown+'隻':''}${count<min?'（あと'+(min-count)+'隻）':''}。${note}`};
 }
 if(['scoutingValue','airValue'].includes(condition.kind)){
  if(!plan||!Number.isFinite(condition.min)||condition.min<0)return manual('数値分岐の根拠・入力が不足');
  if(condition.kind==='airValue')return manual('分岐到達時の制空値は、判定地点・全候補経路の損耗との接続が未対応。制空プランナーで確認してください');
  if(hdFEGameMatch(plan).status!=='ready')return manual('装備変更に伴う艦固有索敵ボーナスの差分が未確認。同期した同じ配備で再確認してください');
  const items=hdFEAssigned(plan),m=condition.kind==='scoutingValue'?hdFEScouting(plan,items):hdFEAir(items),value=condition.kind==='scoutingValue'?m.score:m.basePower;
  if(condition.kind==='scoutingValue'&&m.available===false)return manual(m.detail||'索敵計算に必要な情報が不足しています');
  if(condition.coef!=null&&(!Number.isInteger(condition.coef)||condition.coef<1||condition.coef>4||m.coef!==condition.coef))return manual('索敵の分岐点係数が一致していません');
  if(!Number.isFinite(value)||items.some(x=>x.name&&!hdFEFind(x.name))||m.status==='manual'||condition.kind==='airValue'&&m.capacityKnown<m.count)return manual('索敵・制空の計算情報が不足');
  return {status:value>=condition.min?'ready':'missing',ratio:Math.min(1,value/Math.max(1,condition.min)),count:value,min:condition.min,detail:`${condition.kind==='scoutingValue'?'索敵':'制空'} ${value}/${condition.min}（あと${Math.max(0,condition.min-value)}）`};
 }
 if(condition.kind==='minSpeed'){
  if(![10,15,20].includes(condition.rank)||!ships.length)return manual('速力条件を確認してください');
  const known=x=>x.speedInfo.known&&!x.speedInfo.invalid?.length&&!x.speedInfo.expansionUnconfirmed&&![...(x.ship.items||[]),x.ship.expansion].some(i=>i?.name&&!hdFEFind(i.name)),low=ships.filter(x=>known(x)&&x.speedInfo.rank<condition.rank),unknown=ships.filter(x=>!known(x));
  return {status:low.length?'missing':unknown.length?'manual':'ready',ratio:ships.filter(x=>known(x)&&x.speedInfo.rank>=condition.rank).length/ships.length,count:ships.length-low.length-unknown.length,need:ships.length,detail:`${hdFESpeedLabel(condition.rank)}統一 ${ships.length-low.length-unknown.length}/${ships.length}隻${low.length?' / 不足: '+low.map(x=>x.ship.ship).join('、'):''}${unknown.length?' / 速力未判定: '+unknown.map(x=>x.ship.ship).join('、'):''}`};
 }
 if(!['fleetCount','typeCount'].includes(condition.kind))return manual('未対応の分岐条件です');
 const {min,max}=condition;if(!Number.isInteger(min)||!Number.isInteger(max)||min<0||max<min||max>7)return manual('隻数条件が不明です');
 const exactTypes=['駆逐艦','海防艦','軽巡洋艦','重雷装巡洋艦','重巡洋艦','航空巡洋艦','戦艦','高速戦艦','航空戦艦','軽空母','正規空母','装甲空母','潜水艦','潜水空母','水上機母艦','揚陸艦','潜水母艦','練習巡洋艦','補給艦','工作艦'];
 if(condition.kind==='typeCount'&&(condition.matchPolicy&&condition.matchPolicy!=='exact'||!Array.isArray(condition.types)||!condition.types.length||condition.types.some(x=>typeof x!=='string'||(condition.matchPolicy==='exact'?!exactTypes.includes(x):!Object.prototype.hasOwnProperty.call(HD_FS_TYPE_ALIASES,x)||!Array.isArray(HD_FS_TYPE_ALIASES[x])))))return manual('艦種条件が未登録');
 if(Object.prototype.hasOwnProperty.call(condition,'excludeMasterNames')){
  const names=condition.excludeMasterNames;
  if(condition.kind!=='typeCount'||condition.matchPolicy!=='exact'||!Array.isArray(names)||!names.length||new Set(names).size!==names.length||names.some(x=>typeof x!=='string'||!x.trim()||x.trim()!==x))return manual('除外する完全マスター名の条件が不明です');
  let count=0,unknown=0;
  for(const row of ships){
   if(!row.typeKnown){unknown++;continue}if(!condition.types.includes(row.type))continue;
   const master=typeof hdShipDbMasterRowFor==='function'?hdShipDbMasterRowFor({name:row.ship.ship,masterId:row.ship.masterId}):null;
   if(!master||String(master.name||'')!==String(row.ship.ship||'')||master.type!==row.type){unknown++;continue}
   if(!names.includes(master.name))count++;
  }
  const status=count>max||count+unknown<min?'missing':unknown?'manual':'ready',gap=Math.max(0,min-count),excess=Math.max(0,count-max),label=names.join('・')+'以外の'+condition.types.join('＋');
  return {status,count,min,max,gap,excess,ratio:status==='ready'?1:unknown?0:count>max?Math.max(0,1-(count-max)/Math.max(1,count)):Math.min(1,count/Math.max(1,min)),detail:`${label} ${count}${unknown?'＋未判定'+unknown:''}隻 / 条件 ${min===max?min:min+'〜'+max}隻${gap&&!unknown?'（あと'+gap+'隻）':''}${excess?'（'+excess+'隻超過）':''}`};
 }
 const known=ships.filter(x=>x.typeKnown),unknown=condition.kind==='fleetCount'?0:ships.length-known.length;
 const count=condition.kind==='fleetCount'?ships.length:known.filter(x=>condition.matchPolicy==='exact'?condition.types.includes(x.type):condition.types.some(token=>hdFSTypeMatches({type:x.type,roles:[],tags:[],row:{name:x.ship.ship}},token))).length;
 const status=count>max||count+unknown<min?'missing':unknown?'manual':'ready',gap=Math.max(0,min-count),excess=Math.max(0,count-max),label=condition.kind==='fleetCount'?'編成':condition.types.join('＋');
 return {status,count,min,max,gap,excess,ratio:status==='ready'?1:unknown?0:count>max?Math.max(0,1-(count-max)/Math.max(1,count)):Math.min(1,count/Math.max(1,min)),detail:`${label} ${count}${unknown?'＋未判定'+unknown:''}隻 / 条件 ${min===max?min:min+'〜'+max}隻${gap&&!unknown?'（あと'+gap+'隻）':''}${excess?'（'+excess+'隻超過）':''}`};
}
function hdFEGraphRoute(data,ships,plan,goal){
 const graph=data.graph,paths=[],trace=[];let unknown=false,random=false;
 if(!graph||typeof graph.start!=='string'||typeof graph.target!=='string')return {status:'manual',paths:[],trace:[],hasRandom:false,arrivalGuaranteed:false,fixedPath:false,detail:'分岐グラフの始点・到達点が未登録'};
 const walk=(node,path)=>{
  if(path.includes(node)||path.length>16||paths.length>=64){unknown=true;return}
  const nextPath=[...path,node];if(node===graph.target||graph.terminals?.[node]==='nonboss'){paths.push(nextPath);return}
  if(goal?.allowed&&!goal.allowed.includes(node)){paths.push(nextPath);return}
  const rules=graph.nodes?.[node];if(!Array.isArray(rules)||!rules.length){unknown=true;paths.push(nextPath);return}
  let matched=false;
  for(const rule of rules){const condition=rule.condition||data.checks?.find(x=>x.id===rule.conditionRef)?.condition,result=hdFEBranchPredicate(condition,ships,plan);
   if(result.status==='missing')continue;
   const verified=!rule.state||rule.state==='verified';if(!verified||result.status==='manual'||rule.to?.length>1&&rule.random!==true){unknown=true}
   if(!Array.isArray(rule.to)||!rule.to.length){unknown=true;continue}
   random ||= rule.random===true;trace.push({from:node,to:rule.to,random:rule.random===true,state:verified?'verified':rule.state,status:verified?result.status:'manual',detail:(rule.reason?rule.reason+' / ':'')+result.detail,sources:rule.sources||data.sources});
   for(const to of rule.to)walk(to,nextPath);
   if(result.status==='ready'&&verified){matched=true;break}
  }if(!matched)unknown=true;
 };
 walk(graph.start,[]);const pathsUnique=[...new Map(paths.map(x=>[x.join('→'),x])).values()],allBoss=pathsUnique.length>0&&pathsUnique.every(p=>p[p.length-1]===graph.target&&(!goal?.allowed||p.every(n=>goal.allowed.includes(n))));
 return {status:unknown?'manual':allBoss?'ready':'missing',paths:pathsUnique,trace,hasRandom:random,arrivalGuaranteed:!unknown&&allBoss,fixedPath:!unknown&&allBoss&&pathsUnique.length===1&&!random,detail:pathsUnique.map(x=>x.filter(n=>n!==graph.start).join('')).join(' / ')+(unknown?'（未確認の分岐あり）':!allBoss?'（登録した目標経路への到達は保証できない）':random?'（経由はランダム。登録候補はボス方面）':'（登録分岐の固定経路）')};
}
function hdFEBranchGoal(data,id){
 const key=id==null||id===''?data?.defaultGoal:id;
 if(typeof key!=='string'||!data?.goals||!Object.prototype.hasOwnProperty.call(data.goals,key))return null;
 const goal=data.goals[key];return goal&&typeof goal==='object'&&!Array.isArray(goal)?goal:null;
}
function hdFEBranchRoute(plan){
 const data=typeof MAP_PLANS!=='undefined'?MAP_PLANS[String(plan?.map||'')]?.routeBranches:null;
 if(!data)return {available:false,status:'manual',checks:[],detail:'ルート分岐条件は未登録。編成例の基本条件だけでは固定経路を保証できません。',requiredSpeed:0};
 if(data.schemaVersion!==2)return {available:true,status:'manual',path:data.path||'登録経路',sources:data.sources||[],checkedAt:data.checkedAt||'',checks:[],graph:null,requiredSpeed:0,requiredRadar:0,arrivalGuaranteed:false,fixedPath:false,detail:'分岐データ形式が未対応のため未判定です。',next:'対応した分岐データへ更新してください'};
 const ships=hdFERouteShips(plan),goalId=plan?.routeGoal==null||plan.routeGoal===''?data.defaultGoal:plan.routeGoal,goal=hdFEBranchGoal(data,goalId),checks=[...(data.checks||[]),...(goal?.checks||[])].map(x=>({...x,...hdFEBranchPredicate(x.condition,ships,plan)}));
 const graph=data.graph&&checks.every(x=>x.status==='ready')&&(!data.goals||goal)?hdFEGraphRoute(data,ships,plan,goal):null;
 const status=!checks.length||data.goals&&!goal?'manual':checks.some(x=>x.status==='missing')?'missing':!checks.every(x=>x.status==='ready')?'manual':graph?.status||'ready';
 // Keep the speed target stable before and after equipping. The disputed low-speed
 // CL/DE variant stays manual instead of being declared impossible.
 const fallback=data.speedFallback,requiredSpeed=[10,15,20].includes(fallback?.rank)&&fallback.unless?.length&&fallback.unless.every(x=>hdFEBranchPredicate(x,ships).status==='missing')?fallback.rank:0;
 return {available:true,path:goal?.path||data.path,goal:goalId,sources:data.sources||[],checkedAt:data.checkedAt,checks,status,graph,next:goal?.next||(data.goals&&!goal?'登録済みのルート目標を選び直してください':''),requiredRadar:goal?.radar||0,requiredSpeed:Math.max(requiredSpeed,goal?.speed||0),arrivalGuaranteed:status==='ready'&&!!graph?.arrivalGuaranteed,fixedPath:status==='ready'&&!!graph?.fixedPath,detail:`${data.goals&&!goal?'未登録のルート目標 '+String(goalId):goal?.label||data.path+'固定'}: ${status==='ready'?'登録した分岐条件を充足':status==='missing'?'固定条件に不足（別経路・ランダム到達は別途確認）':'未判定'} / `+checks.filter(x=>status==='ready'||x.status!=='ready').map(x=>x.label+' '+x.detail+(x.status!=='ready'?'。'+x.next:'')).join(' / ')+(graph?' / '+graph.detail:'')};
}
function hdFEPlanSpeedTarget(plan){
 const data=typeof MAP_PLANS!=='undefined'?MAP_PLANS[plan?.map]?.routeBranches:null,goal=hdFEBranchGoal(data,plan?.routeGoal),fallback=data?.speedFallback;
 const required=fallback?.unless?.length&&fallback.unless.every(x=>hdFEBranchPredicate(x,hdFERouteShips(plan),plan).status==='missing')?fallback.rank:0;
 const contract=hdFERouteRequirementData(plan),conditional=contract?.conditionalSpeed&&hdFEBranchPredicate(contract.conditionalSpeed.when,hdFERouteShips(plan),plan).status==='ready'?contract.conditionalSpeed.rank:0;
 return Math.max(hdFESpeedTarget(plan?.routeInfo||plan?.suggestion?.info),goal?.speed||0,required||0,contract?.minimumSpeed||0,conditional);
}
function hdFERouteRequirementData(plan){
 if(typeof hdMapPresetRequirements!=='function')return null;
 let preset=plan?.suggestion?.preset||plan?.preset||plan?.sourceFleet?.routePreset;
 if(!preset){const inferred=hdFEInferRoute(plan);if(inferred.status==='matched')preset=inferred.match.preset;}
 return preset?hdMapPresetRequirements(plan.map,preset):null;
}
function hdFEEquipmentRequirements(plan,rows){
 const contract=hdFERouteRequirementData(plan),noLos=contract?.los.kind==='none'||hdFEScoutingExemption(plan,contract)?.status==='ready';
 const result=new Map((rows||[]).filter(r=>r.kind!=='基地航空隊').filter(r=>!r.generatedFromMap||r.kind.startsWith('cap-night-')&&hdSENightPolicy(plan.map)!=='auto'||(!contract?.equipmentKinds||contract.equipmentKinds.includes(r.baseKind||r.kind))&&!(noLos&&r.kind==='索敵')).map(r=>[r.kind,{...r,minCount:Math.max(1,Number(r.minCount)||1)}]));
 const recommended=(rows||[]).some(r=>r.generatedFromMap)||!rows?.length&&plan?.ships?.length&&hdFERouteBasic(plan).status==='ready';
 if(recommended&&contract?.carrierAttackTarget){const n=(plan.ships||[]).filter(s=>['軽空母','正規空母','装甲空母'].includes(hdFEFindShip(s.ship)?.type)).length;if(n)result.set('cap-carrier-attack',{kind:'cap-carrier-attack',baseKind:'航空攻撃',label:'空母の攻撃機配備',minCount:n,generatedFromMap:true});}
 if(recommended&&contract?.waterAttackTarget){const n=(plan.ships||[]).filter(s=>(contract.waterAttackTypes||['水上機母艦']).includes(hdFEFindShip(s.ship)?.type)).length;if(n)result.set('cap-water-attack',{kind:'cap-water-attack',baseKind:'航空攻撃',label:'水上爆撃機配備',minCount:n,generatedFromMap:true});}
 for(const r of hdFERouteRequirementData(plan)?.equipmentTargets||[]){const old=result.get(r.kind);result.set(r.kind,{...old,...r,minCount:Math.max(Number(old?.minCount)||0,r.minCount)});}
 return [...result.values()];
}
function hdFERouteContract(plan){
 const data=hdFERouteRequirementData(plan);if(!data||data.engine==='verified-graph')return null;
 const ships=hdFERouteShips(plan),checks=data.conditions.map(condition=>{const check=hdFEBranchPredicate(condition,ships,plan);return {condition,...check,detail:condition.reason&&!check.detail.startsWith(condition.reason)?condition.reason+'：'+check.detail:check.detail}});
 if(ships.some(s=>!s.typeKnown))checks.push({condition:{kind:'unverified'},status:'manual',ratio:0,detail:'艦娘の艦種データが未登録のため、この経路の条件は未判定。'});
 if(data.los.kind==='required'){const numeric={kind:'scoutingValue',min:data.los.checks[0].safe,coef:data.los.coef},condition=data.los.exemptWhen?{any:[data.los.exemptWhen,numeric],reason:data.los.exemptNote}:numeric;const check=hdFEBranchPredicate(condition,ships,plan);checks.push({condition,...check,...(data.los.exemptWhen&&check.children?.[0]?.status==='ready'?{detail:`${data.path}：索敵条件は非適用。${data.los.exemptNote}`}:{})});}
 if(data.scopeIncomplete){const reason=data.scopeIncompleteReason||'出典または分岐の網羅が検証中。成立保証は出しません。';checks.push({condition:{kind:'unverified',reason},status:'manual',ratio:0,detail:reason});}
 const status=checks.some(x=>x.status==='missing')?'missing':checks.every(x=>x.status==='ready')?'ready':'manual';
 return {data,checks,status,detail:`${data.path}：${checks.map(x=>x.detail).join(' / ')}${data.routing==='random'?'。羅針盤の逸れあり・ボス到達は未保証':data.routing==='multiple'?'。経由するマスは複数':''}`};
}
function hdFERouteBasic(plan){
 let info=plan?.suggestion?.info||plan?.routeInfo||null,inferred=null,presetName=plan?.suggestion?.preset?.name||plan?.preset?.name||'';
 if(!info){inferred=hdFEInferRoute(plan);if(inferred.status==='matched'){info=inferred.match.info;presetName=inferred.match.preset?.name||''}}
 if(!info)return {status:'manual',detail:inferred?.detail||'保存編成のルート条件を特定できないため攻略ルートを確認',requirements:[],inference:inferred};
 const ships=hdFERouteShips(plan),reqs=(info.requirements||[]).map(req=>{const got=ships.filter(x=>typeof hdFSTypeMatches==='function'?hdFSTypeMatches({type:x.type,speed:hdFESpeedLabel(x.speedInfo.base),roles:[],tags:[],row:{name:x.ship.ship}},req.token):x.type===req.token).length;return {token:req.token,need:Math.max(0,Number(req.count)||0),got,ok:Number(req.count)===0?got===0:got>=Number(req.count)}}),lows=hdFESpeedTarget(info)?ships.filter(x=>x.speedInfo.known&&x.speedInfo.rank<hdFESpeedTarget(info)&&!!x.speedInfo.group).map(x=>x.ship.ship):[],unknownSpeed=hdFESpeedTarget(info)?ships.filter(x=>!x.speedInfo.known||!x.speedInfo.group&&x.speedInfo.rank<hdFESpeedTarget(info)).map(x=>x.ship.ship):[],bad=reqs.filter(x=>!x.ok),prefix=inferred?.status==='matched'?`自動照合: ${presetName} / `:presetName?`${presetName} / `:'';
 const flagshipBad=!hdFERouteFlagshipOk(ships,info);
 const totalBad=!info.conditionManual&&Number(info.total)>0&&ships.length!==Number(info.total);
 return {status:bad.length||lows.length||totalBad||flagshipBad?'missing':info.conditionManual||unknownSpeed.length?'manual':'ready',requirements:reqs,lowSpeed:lows,unknownSpeed,speedTarget:hdFESpeedTarget(info),inference:inferred,presetName,detail:prefix+(flagshipBad?'旗艦条件未充足: '+info.flagship:bad.length?bad.map(x=>x.token+' '+x.got+'/'+x.need).join(' / '):(lows.length?hdFESpeedLabel(hdFESpeedTarget(info))+'条件未充足: '+lows.join('、'):totalBad?'編成隻数 '+ships.length+'/'+info.total:unknownSpeed.length?'速力未判定: '+unknownSpeed.join('、'):info.conditionManual?'艦種・隻数の条件を手動確認':'基本編成条件を満たす'))};
}
function hdFERoute(plan){
 const basic=hdFERouteBasic(plan),branch=hdFEBranchRoute(plan);
 if(!branch.available){const contract=hdFERouteContract(plan);if(!contract)return {...basic,branch};
  const info=plan?.suggestion?.info||plan?.routeInfo,general=contract.data.useExampleScope===false,canonical=hdFSPresetInfo(MAP_PLANS[plan.map].presets[contract.data.index]),conditionalExample=contract.data.map==='6-4'&&contract.data.index===0&&contract.data.useExampleFlagshipScope===false,keys=['text','requirements','total','conditionManual','speedRequired','flagship'];
  const customInfo=plan.routeInfo&&['requirements','total','conditionManual','speedRequired','flagship'].some(k=>JSON.stringify(plan.routeInfo[k])!==JSON.stringify(canonical[k]))||conditionalExample&&info&&keys.some(k=>JSON.stringify(info[k])!==JSON.stringify(canonical[k]));
  const chosenScopedInfo=contract.data.map==='6-5'&&[0,1].includes(contract.data.index)&&general&&!!info&&keys.some(k=>JSON.stringify(info[k])!==JSON.stringify(canonical[k]));
  const exampleFlagship=conditionalExample&&general&&!customInfo&&info&&keys.every(k=>JSON.stringify(info[k])===JSON.stringify(canonical[k])),flagshipBad=!exampleFlagship&&!hdFERouteFlagshipOk(hdFERouteShips(plan),info);
  const status=flagshipBad||contract.status==='missing'||customInfo&&basic.status==='missing'?'missing':contract.status!=='ready'||customInfo&&basic.status==='manual'||chosenScopedInfo&&basic.status!=='ready'?'manual':general?'ready':basic.status==='ready'?'ready':'manual';return {...basic,branch,contract,status,requirements:general&&!customInfo&&!chosenScopedInfo?[]:basic.requirements,detail:(customInfo||chosenScopedInfo?basic.detail+' / ':general?'':basic.status==='missing'?'編成例の登録範囲外。別例の分岐は未判定。 / ':basic.detail+' / ')+(flagshipBad?'旗艦条件未充足。 / ':'')+contract.detail};}
 const info=plan?.suggestion?.info||plan?.routeInfo;
 // The canonical preset is an example; verified AE alternatives need not contain
 // a light cruiser. Explicit quest/flagship constraints remain in force.
 const example=!info||MAP_PLANS[plan.map].presets.some(p=>{const canonical=hdFSPresetInfo(p);return ['text','requirements','total','conditionManual','speedRequired','flagship'].every(k=>JSON.stringify(info[k])===JSON.stringify(canonical[k]))});
 const status=example?branch.status:basic.status==='missing'||branch.status==='missing'?'missing':basic.status!=='ready'||branch.status!=='ready'?'manual':'ready';
 return {...basic,status,branch,requirements:example?[]:basic.requirements,speedTarget:hdFEPlanSpeedTarget(plan),detail:(example?'':basic.detail+' / ')+branch.detail};
}
function hdFEEnemyAirCandidates(map){
 if(typeof hdFCMapEnemyAirCandidates==='function')return hdFCMapEnemyAirCandidates(map);
 const vals=new Set(),add=t=>{for(const m of String(t||'').matchAll(/敵制空(?:値)?\s*(\d+)/g))vals.add(Number(m[1]))};
 try{Object.values(typeof HD_NODE_PATTERN_DATA!=='undefined'?(HD_NODE_PATTERN_DATA[map]||{}):{}).forEach(n=>(n.patterns||[]).forEach(p=>add(p.air)))}catch{}
 return [...vals].sort((a,b)=>a-b);
}
function hdFEAirCheck(map,air,plan=null){
 const contract=plan&&hdFERouteRequirementData(plan),branch=plan&&typeof MAP_PLANS!=='undefined'?MAP_PLANS[map]?.routeBranches:null,goalData=branch?.goals?.[plan?.routeGoal||branch.defaultGoal],goalNoAir=contract?.engine==='verified-graph'&&goalData?.airNotRequired===true;
 if(contract?.airNotRequired||goalNoAir)return {status:'ready',notRequired:true,enemy:0,required:0,ours:Number(air?.basePower)||0,goal:'superiority',reason:null,detail:(goalNoAir?goalData.path:contract.path)+'：この登録経路に敵航空機による数値制空目標なし。',ratio:1};
 const target=typeof hdMapAirTarget==='function'?hdMapAirTarget(map):null,enemies=hdFEEnemyAirCandidates(map),enemy=target?.known?target.enemy:enemies.length?Math.max(...enemies):null,ours=Number(air?.basePower)||0,known=Number(air?.capacityKnown)||0,total=Number(air?.count)||0,live=Number(air?.liveCapacityKnown)||0,depleted=Array.isArray(air?.depletedSlots)?air.depletedSlots.length:0,goal=target?.selected?target.goal:'superiority',required=enemy===null?null:typeof hdMapAirThreshold==='function'?hdMapAirThreshold(enemy,goal):Math.ceil(enemy*1.5),ratio=enemy?ours/enemy:0;
 const routeLoss=target?.known&&known===total&&typeof hdMapAirRouteLoss==='function'?hdMapAirRouteLoss(map,(air?.rows||[]).map(r=>({...r,slot:r.cap,category:r.meta?.category})),r=>r.slot>0?Math.floor(r.aa*Math.sqrt(r.slot)):0):null;
 const antiAirUnknown=routeLoss?.known&&routeLoss.stage2Complete===false;
 const routeUnknown=target?.selected&&!target.known||!!(typeof hdMapAirData==='function'&&hdMapAirData(map))&&!target?.selected&&enemy>0,reason=routeUnknown?'route':enemy===null?'enemy':known<total&&enemy>0?'capacity':antiAirUnknown?'anti-air':null,status=reason?'manual':ours>=required&&!routeLoss?.maxGap?'ready':ratio>2/3?'partial':'missing',label=target?.known&&!target.hasAir?'航空戦なし':enemy===null?'未判定':typeof hdMapAirLabel==='function'?hdMapAirLabel(ours,enemy):ratio>=1.5?'優勢':'喪失';
 const loss=target?.known&&target.hasAir&&known===total&&typeof hdMapAirLossBounds==='function'?hdMapAirLossBounds((air?.rows||[]).map(r=>({...r,slot:r.cap,category:r.meta?.category})),enemy,r=>r.slot>0?Math.floor(r.aa*Math.sqrt(r.slot)):0):null;
 return {status,loss,routeLoss,ours,enemy:enemy??0,required,goal,reason,ratio,liveCapacityKnown:live,depletedSlots:depleted,source:target?.source||'',detail:reason==='route'?`${target.detail}。海域最大 ${enemy??'?'} は参考値で、ルート充足とは判定しません。`:enemy===null?`敵制空値の数値データなし${live?`（現在搭載 ${live}/${total}スロ反映）`:''}`:`基礎制空 ${ours} / ${target?.known?target.detail:'確認敵制空最大'} ${enemy} → ${label} / ${typeof HD_MAP_AIR_GOALS!=='undefined'?HD_MAP_AIR_GOALS[goal]:'優勢以上'} ${required}（あと ${Math.max(0,required-ours)}）${live?` / 現在搭載 ${live}/${total}スロ`:''}${depleted?` / 損耗 ${depleted}スロ`:''}${reason==='capacity'?'（搭載数未解決あり）':reason==='anti-air'?`（敵防空未判定：${routeLoss.stage2Missing.join(' / ')}）`:''}${routeLoss?.known?` / 連戦モデル最終 ${routeLoss.lower}〜${routeLoss.upper}${routeLoss.firstGap?` / ${routeLoss.firstGap.id}・${routeLoss.firstGap.round}回目に大損耗側であと${routeLoss.firstGap.gap}不足`:''}（通常敵の対空砲火・登録射撃回避モデル、未登録機は回避なし、敵機削りなし）`:''}${loss?.active?` / 制空戦1回後の基礎制空 ${loss.lower}〜${loss.upper}（対空砲火・累積・敵機削りなし）`:''}`};
}
// Reference arithmetic for the synchronized ship inputs. A changed loadout can
// invalidate those inputs; candidate verdicts must use hdFEPlanScouting below.
function hdFEScoutingExemption(plan,contract=hdFERouteRequirementData(plan)){
 return contract?.los?.kind==='required'&&contract.los.exemptWhen?hdFEBranchPredicate(contract.los.exemptWhen,hdFERouteShips(plan),plan):null;
}
function hdFEScouting(plan,items){
 const map=String(plan?.map||''),contract=hdFERouteRequirementData(plan),fallback=typeof HD_MAP_ADVANCED_DATA!=='undefined'?HD_MAP_ADVANCED_DATA[map]?.los:null,adv=contract?.los?.kind==='required'?contract.los:fallback,coef=Number(adv?.coef)||0,checks=Array.isArray(adv?.checks)?adv.checks:[];
 if(contract?.los?.kind==='none')return {status:'ready',available:false,notRequired:true,reason:'not-required',score:null,checks:[],detail:`${contract.path}：${contract.los.note}`};
 if(hdFEScoutingExemption(plan,contract)?.status==='ready')return {status:'ready',available:false,notRequired:true,reason:'exempt',score:null,checks:[],detail:`${contract.path}：${contract.los.exemptLabel||'M→P'}の索敵条件は非適用。${contract.los.exemptNote}`};
 if(!contract&&typeof HD_MAP_ROUTE_REQUIREMENTS!=='undefined'&&HD_MAP_ROUTE_REQUIREMENTS[map]?.some(r=>r.los.kind==='required'))return {status:'manual',available:false,reason:'route',score:null,checks:[],detail:'登録済みの経路を特定できません。別経路の索敵値は流用せず、ルートを選び直してね。'};
 if(!coef||!checks.length)return {status:'manual',available:false,reason:'threshold',score:null,checks:[],detail:adv?.summary||'数値閾値なし'};
 const sync=(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-kancolle-sync-v1')||'null')}catch{return null}})(),hq=Number(sync?.admiralLevel)||0,ships=(plan?.ships||[]).filter(x=>x?.ship),losRows=ships.map(ship=>typeof hdFCProposalShipLos==='function'?hdFCProposalShipLos(ship):null);
 if(!hq||losRows.length!==ships.length||losRows.some(x=>x===null||!Number.isFinite(x)||x<0)){const missing={hq:!hq,ships:ships.filter((x,i)=>losRows[i]===null||!Number.isFinite(losRows[i])||losRows[i]<0).map(x=>x.ship)};return {status:'manual',available:false,reason:'sync',missing,score:null,checks,detail:'同期情報が不足：'+[...(missing.hq?['司令部Lv']:[]),...missing.ships.map(x=>x+' の索敵値')].join('、')+'。ゲーム連携で母港・艦隊情報を取得すると自動計算'};}
 const shipTerm=losRows.reduce((s,v)=>s+Math.sqrt(Math.max(0,v)),0);let equipRaw=0;
 for(const x of items||[]){const los=Number(x.meta?.stats?.索敵)||0,star=Math.max(0,Math.min(10,Number(x.star)||0));equipRaw+=(los+hdFEImproveCoef(x.meta)*Math.sqrt(star))*hdFEEquipCoef(x.meta)}
 const count=Math.max(1,Math.min(7,ships.length||6)),score=shipTerm+equipRaw*coef-Math.ceil(hq*.4)+2*(6-count);
 const rows=checks.map(x=>{const safe=Number(x.safe)||0,fail=Number(x.failBelow)||0,status=safe&&score>=safe?'ready':fail&&score<fail?'missing':'partial';return {...x,status,score}});
 const status=rows.some(x=>x.status==='missing')?'missing':rows.every(x=>x.status==='ready')?'ready':'partial';
 return {status,available:true,score,coef,hq,checks:rows,source:contract?.source||'',route:contract?.path||'',detail:`推定33式 ${score.toFixed(2)}（係数${coef} / 司令部Lv${hq}）${contract?' / '+contract.path+' / 必要 '+checks.map(x=>x.safe).join('・'):''}`};
}
function hdFEPlanScouting(plan,items){
 const scouting=hdFEScouting(plan,items);
 if(!scouting.available)return scouting;
 if(scouting.status!=='ready'&&hdFEScoutingExemption(plan)?.status==='manual')return {status:'manual',available:false,score:null,reason:'exemption',checks:scouting.checks.map(({score,status,...check})=>check),detail:hdFERouteRequirementData(plan)?.los?.exemptUnknownNote||'M→Pの高速＋以上統一による索敵免除は未確認。索敵安全域も未充足のため、この分岐は未判定です。速力・装備可否・索敵情報を確認してください。'};
 const numeric=c=>c?.kind==='scoutingValue'||c?.all?.some(numeric)||c?.any?.some(numeric)||c?.not&&numeric(c.not);
 const required=[...(hdFERouteContract(plan)?.checks||[]),...(hdFEBranchRoute(plan).checks||[])].some(x=>numeric(x.condition));
 if(!required||hdFEGameMatch(plan).status==='ready')return scouting;
 return {status:'manual',available:false,score:null,reason:'bonus',coef:scouting.coef,checks:scouting.checks.map(({score,status,...check})=>check),detail:'装備変更に伴う艦固有索敵ボーナスの差分が未確認。同期した同じ配備で再確認してください'};
}
function hdFEAutoVerdict(plan,e){
 const live=hdFELiveFleet(plan),supply=hdFESupply(plan),freshness=hdFESyncFreshness(),gameMatch=hdFEGameMatch(plan),route=hdFERoute(plan),air=hdFEAirCheck(plan?.map,e.air,plan),scouting=hdFEPlanScouting(plan,e.items),equipment={status:e.missing?'missing':e.partial?'partial':'ready',detail:`海域装備 ${e.ready}/${e.requirements.length} 準備`},master={status:e.master.invalid.length?'missing':e.master.unresolved.length?'partial':'ready',detail:e.master.invalid.length?`装備不可 ${e.master.invalid.length}件`:e.master.unresolved.length?`未解決 ${e.master.unresolved.length}件`:'装備可否OK'},unknownHealth=live.details.filter(x=>x.status==='unknown').length,health={status:live.status,detail:live.blocked?`出撃不可候補 ${live.blocked}隻（${Object.entries(live.reasons).map(x=>x[0]+' '+x[1]).join(' / ')}）`:live.caution?`注意艦 ${live.caution}隻${unknownHealth?` / 同期状態不明 ${unknownHealth}隻`:''}`:unknownHealth?`同期状態不明 ${unknownHealth}隻。ゲーム連携を確認`:'艦状態OK'};
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

// Opening ASW equipment conditions, separate from recommended ASW synergy.
// Sources: KC3Kai Ship.canDoOASW/isOaswShip and the linked verification table.
const HD_FE_OASW_SOURCE='https://wikiwiki.jp/kancolle/対潜攻撃#trigger_conditions';
const HD_FE_OASW_CONFIRM_KEY='harbordesk-oasw-confirmed-v1';
function hdFEAswRoster(ship){
 const rows=hdFERoster(),id=Number(ship.gameShipId)||0,master=Number(ship.masterId)||0,rosterId=String(ship.rosterId||'');
 const matches=rows.filter(r=>id?Number(r.gameShipId)===id:rosterId?String(r.id||'')===rosterId:master?Number(r.masterId)===master:String(r.name||'').trim()===String(ship.ship||'').trim());
 return matches.length===1?matches[0]:null;
}
function hdFEAswKey(ship,scope=''){
 const row=hdFEAswRoster(ship);
 return JSON.stringify([scope,ship.gameShipId||ship.masterId||ship.ship,ship.ship,row?.id,row?.gameShipId,row?.masterId,row?.level,row?.syncedAt,row?.gameAsw,row?.gameAswGearKnown,row?.gameGearSlots,row?.gameGearExpansion,row?.gameAswMods,row?.gameAswBaseline,(ship.items||[]).map(x=>[x.slotIndex,hdFEPlannedGearLabel(x)]).sort((a,b)=>a[0]-b[0]),hdFEPlannedGearLabel(ship.expansion)]);
}
function hdFEAswConfirmed(){try{const x=JSON.parse(localStorage.getItem(HD_FE_OASW_CONFIRM_KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}}
function hdFEAswNumber(value){if(value==null||String(value).trim()==='')return null;const n=Number(value);return Number.isInteger(n)&&n>=0&&n<=500?n:null}
function hdFEOpeningAsw(ship,scope=''){
 const result=(status,reason,extra={})=>({status,reason,...extra}),db=hdFEFindShip(ship.ship),master=db&&hdShipDbMasterRowFor(db),id=Number(master?.id)||Number(db?.id)||Number(ship.masterId)||0,type=db?.type||ship.type||'',name=ship.ship||'';
 if(!db)return result('manual','艦娘名・改造段階の情報が不足しています。');
 const liveIdentity=hdFEAswRoster(ship);if(liveIdentity?.masterId&&id&&Number(liveIdentity.masterId)!==id)return result('manual','同期された改造段階と配備案が違います。再配備して確認してね。');
 const automatic=new Set([141,478,394,893,906,681,920,562,689,596,692,628,629,726,737,624,1040,1062,1067]);
 if(automatic.has(id))return result('ready','この改造段階は、対潜値・装備を問わない艦固有の先制対潜条件を持ちます。',{automatic:true});
 const profile=hdShipDbSlotProfile(db),rows=[...(ship.items||[]).filter(x=>x.name),...(ship.expansion?.name?[ship.expansion]:[])],items=rows.map(x=>hdFEFind(x.name));
 if(items.some(x=>!x))return result('manual','配備装備の性能が未登録のため、装備条件を確認できません。');
 const normal=rows.filter(x=>x!==ship.expansion),indices=normal.map(x=>x.slotIndex);if(!profile||new Set(indices).size!==indices.length||normal.some((x,i)=>!Number.isInteger(x.slotIndex)||x.slotIndex<0||x.slotIndex>=profile.count||!hdShipDbEquipCompatible(items[rows.indexOf(x)],db)||hdShipDbSlotRejects(profile,x.slotIndex,items[rows.indexOf(x)])))return result('manual','配備枠・装備可否を確認できません。再配備してね。');
 if(ship.expansion?.name){const row=hdFEAswRoster(ship),meta=hdFEFind(ship.expansion.name);if(!hdShipDbExpansionInfo(meta,db,ship.expansion.star||0).allowed)return result('missing','この艦の増設に載せられない装備があります。');if(!row||row.gameSlotEx==null)return result('manual','増設の開放状態が未同期です。');if(!hdFLHasExpansion(row))return result('missing','未開放の増設枠に装備があります。再配備してね。')}
 const sonar=items.some(x=>/ソナー/.test(x.category)),rawAsw=items.reduce((n,x)=>n+(Number(x.stats?.対潜)||0),0);
 const aircraft=rows.flatMap((row,i)=>{const item=items[i];return row===ship.expansion||!(Number(profile?.slots?.[row.slotIndex])>0)?[]:[item]}),positive=x=>(Number(x.stats?.対潜)||0)>0;
 const attack=aircraft.some(x=>/艦上攻撃機|艦上爆撃機/.test(x.category)&&positive(x)),high=aircraft.some(x=>/艦上攻撃機/.test(x.category)&&(Number(x.stats?.対潜)||0)>=7||/回転翼機|対潜哨戒機/.test(x.category)&&positive(x)),rotor=aircraft.filter(x=>/回転翼機/.test(x.category)),water=aircraft.some(x=>/水上爆撃機|回転翼機/.test(x.category)&&positive(x)),anyAircraft=attack||high;
 if(name==='日向改二')return result(rotor.some(x=>/^S-51J/.test(x.name))||rotor.filter(x=>/カ号観測機|オ号観測機/.test(x.name)).length>=2?'ready':'missing','S-51J系1枠、またはカ号・オ号系2枠が必要です。対潜値100＋ソナーだけでは発動しません。',{equipmentCondition:true});
 if(name==='加賀改二護'||/^(大鷹|神鷹|雲鷹)改(?:二)?$/.test(name))return result(anyAircraft?'ready':'missing','対潜値1以上の艦攻・艦爆、対潜哨戒機、回転翼機のいずれかを搭載できる枠に配備してね。',{equipmentCondition:true});
 let paths=[];
 if(type==='海防艦')paths=[{threshold:60,gear:sonar,label:'ソナー＋表示対潜60以上'},{threshold:75,gear:rawAsw>=4,label:'装備の素対潜合計4以上＋表示対潜75以上'}];
 else if(type==='軽空母')paths=[...(!['鈴谷航改二','熊野航改二'].includes(name)?[{threshold:50,gear:sonar&&high,label:'ソナー＋高対潜艦攻など＋表示対潜50以上'},{threshold:65,gear:high,label:'高対潜艦攻など＋表示対潜65以上'}]:[]),{threshold:100,gear:sonar&&attack,label:'ソナー＋対潜値1以上の艦攻・艦爆＋表示対潜100以上'}];
 else if(['神州丸改','大和改二重'].includes(name))paths=[{threshold:100,gear:sonar&&water,label:'ソナー＋水爆・回転翼機＋表示対潜100以上'}];
 else if(/^熊野丸(?:改)?$/.test(name))paths=[{threshold:100,gear:sonar&&aircraft.some(x=>/艦上爆撃機|回転翼機|対潜哨戒機/.test(x.category)&&positive(x)),label:'ソナー＋対潜艦爆・回転翼機・対潜哨戒機＋表示対潜100以上'}];
 else if(/^(扶桑|山城)改二(?:補)?$/.test(name))paths=[{threshold:100,gear:sonar&&(water||items.some(x=>/爆雷/.test(x.category))),label:'ソナー＋水爆・回転翼機・爆雷系＋表示対潜100以上'}];
 else if(['駆逐艦','軽巡洋艦','練習巡洋艦','重雷装巡洋艦','補給艦'].includes(type)){
  if(type==='補給艦'&&aircraft.some(x=>/艦上攻撃機|艦上爆撃機/.test(x.category))&&!attack)return result('missing','対潜値0の航空攻撃機だけを載せた補給艦は、この先制対潜条件を満たしません。');
  paths=[{threshold:100,gear:sonar,label:'ソナー＋表示対潜100以上'}];
 }else return result(['重巡洋艦','戦艦','高速戦艦','正規空母','装甲空母','潜水艦','潜水空母'].includes(type)?'missing':'manual','この艦種・改造段階の先制対潜条件は'+(['重巡洋艦','戦艦','高速戦艦','正規空母','装甲空母','潜水艦','潜水空母'].includes(type)?'対象外です。':'未対応です。出典で確認してね。'));
 const eligible=paths.filter(x=>x.gear).sort((a,b)=>a.threshold-b.threshold),rules=paths.map(x=>x.label).join(' / ');
 if(!eligible.length)return result('missing','必要装備の条件を満たしていません。'+rules,{rules,equipmentCondition:true});
 const row=hdFEAswRoster(ship),key=hdFEAswKey(ship,scope),confirmed=hdFEAswNumber(hdFEAswConfirmed()[key]);let value=confirmed,source=confirmed==null?'':'入力したゲーム表示値';
 if(value==null&&row?.gameAswGearKnown===true&&Array.isArray(row.gameGearSlots)&&row.gameGearSlots.length===profile.count){
  const planned=Array.from({length:profile.count},(_,i)=>hdFEPlannedGearLabel((ship.items||[]).find(x=>x.slotIndex===i)));
  const actual=row.gameGearSlots.map(hdFENormGearLabel);
  if(JSON.stringify(planned.slice().sort())===JSON.stringify(actual.slice().sort())&&hdFEPlannedGearLabel(ship.expansion)===hdFENormGearLabel(row.gameGearExpansion)){value=hdFEAswNumber(row.gameAsw);if(value!=null)source='同じ装備での同期値'}
 }
 const threshold=eligible[0].threshold;
 // A naked synchronized stat gives a conservative floor without subtracting unknown bonuses.
 if(value==null&&row?.gameAswGearKnown===true){
  const naked=Array.isArray(row.gameGearSlots)&&row.gameGearSlots.length===profile.count&&row.gameGearSlots.every(x=>!String(x||'').trim())&&!String(row.gameGearExpansion||'').trim();
  const b=row.gameAswBaseline,valid=b&&b.slotCount===profile.count&&b.masterId===Number(row.masterId)&&b.level===Number(row.level)&&b.mods&&b.mods===row.gameAswMods;
  const base=hdFEAswNumber(naked?row.gameAsw:valid?b.value:null);
  if(base!=null){const lower=base+rawAsw,level=Number(row.level)||null;return result(lower>=threshold?'ready':'manual',`Lv${level||'未確認'}・装備なし同期値 ${base}＋装備素対潜 ${rawAsw}＝ボーナス除外下限 ${lower} / 必要 ${threshold}${lower<threshold?`（下限ではあと${threshold-lower}。艦固有ボーナス込みの表示値を要確認）`:''}。${eligible[0].label}`,{rules,value:lower,threshold,source:'装備なし同期値からの下限',lowerBound:true,shortfall:Math.max(0,threshold-lower),level,needsValue:true})}
 }
 if(value==null)return result('manual','配備案の表示対潜値が未確認です。同じ装備にして同期するか、ゲームの艦娘詳細に出る対潜値を入力してね。',{rules,threshold,needsValue:true});
 return result(value>=threshold?'ready':'missing',`${source} ${value} / 必要 ${threshold}${value<threshold?`（あと${threshold-value}）`:''}。${eligible[0].label}`,{rules,value,threshold,source,needsValue:true});
}
function hdFEOpeningAswHtml(ship,scope='',attrs='',remedies=''){
 const a=hdFEOpeningAsw(ship,scope),esc=hdFEEsc,manual=hdFEAswNumber(hdFEAswConfirmed()[hdFEAswKey(ship,scope)]);
 return `<section class="hd-fl-oasw ${a.status}" data-hd-oasw-scope="${esc(scope)}"><b>先制対潜：${a.status==='ready'?'可能':a.status==='missing'?'不可':'未判定'}</b><p>${esc(a.reason)}</p>${a.needsValue?`<label>${esc(ship.ship)}：この配備後のゲーム表示対潜値<input type="number" min="0" max="500" step="1" inputmode="numeric" value="${manual??''}" placeholder="未入力なら同期値で確認" data-hd-oasw-value ${attrs}></label><small>艦固有の装備ボーナスを含む表示値。装備や同期情報が変わると入力値は再確認します。</small>`:''}${remedies}<a class="guide-link" href="${HD_FE_OASW_SOURCE}" target="_blank" rel="noopener">発動条件の出典 ↗</a></section>`;
}
