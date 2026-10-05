const HD_SORTIE_EQUIP_RULES={
 '対潜':{minCount:2,label:'対潜装備',hint:'ソナー・爆雷などを2枠以上用意する目安'},
 '制空':{minCount:2,label:'制空装備',hint:'艦戦・水戦などを2枠以上用意する目安'},
 '防空':{minCount:1,label:'防空装備',hint:'対空CI・噴進弾幕などの防空手段を1つ以上'},
 '対地':{minCount:2,label:'対地装備',hint:'異なる対地装備を組み合わせやすいよう2個以上'},
 '索敵':{minCount:2,label:'索敵装備',hint:'水偵・電探などを2個以上。最終判定は艦隊全体の索敵値で確認'},
 '夜戦':{minCount:1,label:'夜戦補助',hint:'夜偵・見張員・照明弾などを1つ以上'},
 '輸送':{minCount:4,label:'輸送装備',hint:'大発系などを4個以上用意する目安'},
 '電探':{minCount:1,label:'電探',hint:'うずしお軽減・分岐補助用に1個以上'},
 '煙幕':{minCount:2,label:'煙幕',hint:'煙幕装置を複数用意すると展開を安定させやすい'}
};

function hdSEEsc(s){return typeof hdMapEsc==='function'?hdMapEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdSEOwned(name){
 if(typeof hdOwnedEquipSummary==='function')return hdOwnedEquipSummary(name);
 const key=String(name||'').normalize('NFKC').replace(/\s+/g,'').replace(/･/g,'・');
 try{
  const rows=JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]');
  const matches=(Array.isArray(rows)?rows:[]).filter(x=>String(x.name||'').normalize('NFKC').replace(/\s+/g,'').replace(/･/g,'・')===key);
  return {owned:matches.some(x=>(Number(x.count)||0)>0),count:matches.reduce((s,x)=>s+Math.max(0,Number(x.count)||0),0),maxStar:matches.reduce((m,x)=>Math.max(m,Number(x.star)||0),0)};
 }catch{return {owned:false,count:0,maxStar:0}}
}
function hdSECandidates(kind,limit=24){
 if(typeof hdMapEquipPick!=='function')return [];
 const rows=hdMapEquipPick(kind,limit)||[];
 return [...new Map(rows.map(x=>[x.name,x])).values()];
}
function hdSEOwnedCount(items){return (items||[]).reduce((sum,x)=>sum+(hdSEOwned(x.name).count||0),0)}
function hdSEOwnedTypes(items){return (items||[]).filter(x=>(hdSEOwned(x.name).count||0)>0)}
function hdSEFastCheck(){
 const items=typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG:[];
 const turbines=items.filter(x=>/タービン/.test(x.name)||(x.tags||[]).includes('タービン'));
 const cans=items.filter(x=>!/タービン/.test(x.name)&&(/缶$/.test(x.name)||(x.tags||[]).some(t=>String(t).includes('缶'))));
 const turbineCount=hdSEOwnedCount(turbines),canCount=hdSEOwnedCount(cans);
 return {kind:'高速化',label:'高速化セット',count:Math.min(turbineCount,canCount),minCount:1,ownedTypes:[...hdSEOwnedTypes(turbines),...hdSEOwnedTypes(cans)],candidates:[...turbines,...cans],status:turbineCount>0&&canCount>0?'ready':(turbineCount>0||canCount>0?'partial':'missing'),detail:`タービン ${turbineCount} / 缶 ${canCount}`,hint:'高速化はタービン＋缶の組み合わせが基本。艦ごとの速力条件も確認'};
}
function hdSEBaseCheck(map,adv){
 const items=typeof hdMapBasePick==='function'?hdMapBasePick(map,40):[];
 const count=hdSEOwnedCount(items);
 const sorties=Math.max(1,Number(adv?.base?.sorties)||1),minCount=sorties*4;
 const status=count>=minCount?'ready':count>0?'partial':'missing';
 return {kind:'基地航空隊',label:'基地航空隊',count,minCount,ownedTypes:hdSEOwnedTypes(items),candidates:items,status,detail:`必要目安 ${minCount}枠 / 登録 ${count}個`,hint:`出撃 ${sorties}部隊の4中隊構成を目安に判定。ボス半径 ${adv?.base?.bossRadius??'要確認'}`};
}
// Verified equipment examples. These are recommendations, not universal sortie gates.
const HD_SE_CAP_SOURCE={aa:'https://wikiwiki.jp/kancolle/対空砲火/対空カットイン一覧表',asw:'https://wikiwiki.jp/kancolle/対潜攻撃',land:'https://wikiwiki.jp/kancolle/対地攻撃'};
const HD_SE_PARTS={
 ha:{label:'高角砲',examples:['10cm連装高角砲']},
 specialHa:{label:'特殊高角砲（素対空8以上）',examples:['10cm連装高角砲＋高射装置']},
 aaRadar:{label:'対空電探（素対空2以上）',examples:['13号対空電探改','21号対空電探']},
 radar:{label:'電探',examples:['13号対空電探改','22号対水上電探']},
 director:{label:'独立した高射装置',examples:['91式高射装置','94式高射装置']},
 sonar:{label:'ソナー',examples:['三式水中探信儀','四式水中聴音機']},
 projector:{label:'爆雷投射機',examples:['三式爆雷投射機','九四式爆雷投射機']},
 type3:{label:'三式弾系',examples:['三式弾','三式弾改']},
 tank:{label:'陸戦隊系',examples:['大発動艇(八九式中戦車＆陸戦隊)','特大発動艇＋戦車第11連隊']},
 amphibious:{label:'内火艇系',examples:['特二式内火艇']},
 rocket:{label:'対地ロケット',examples:['WG42 (Wurfgerät 42)','艦載型 四式20cm対地噴進砲']}
};
const HD_SE_RECIPES={
 'cap-aa':[
  {id:'akizuki-radar',name:'秋月型：高角砲2＋電探',parts:['ha','ha','radar'],ship:'akizuki'},
  {id:'generic-two',name:'汎用：特殊高角砲2＋対空電探',parts:['specialHa','specialHa','aaRadar'],ship:'not-akizuki'},
  {id:'generic-one',name:'汎用：特殊高角砲＋対空電探',parts:['specialHa','aaRadar'],ship:'not-akizuki'},
  {id:'akizuki-two',name:'秋月型：高角砲2',parts:['ha','ha'],ship:'akizuki'},
  {id:'director-radar',name:'汎用：高角砲＋高射装置＋対空電探',parts:['ha','director','aaRadar'],ship:'not-akizuki'},
  {id:'director-two',name:'汎用：高角砲＋高射装置',parts:['ha','director']}
 ],
 'cap-asw':[{id:'sonar-projector',name:'ソナー＋爆雷投射機',parts:['sonar','projector']}],
 'cap-land-soft':[{id:'type3',name:'ソフトスキン向け：三式弾系',parts:['type3']},{id:'rocket',name:'軽量艦の対地補助：対地ロケット',parts:['rocket']}],
 'cap-land-mixed':[{id:'tank-amphibious',name:'陸戦隊系＋内火艇系',parts:['tank','amphibious']},{id:'tank-rocket',name:'陸戦隊系＋対地ロケット',parts:['tank','rocket']}]
};
function hdSEPartMatches(part,row){
 const item=row?.item||row?.meta||row||{},name=String(item.name||row?.name||''),cat=String(item.category||''),aa=Number(item.stats?.対空)||0;
 const ha=/高角砲|5inch.*Mk\.?\s*(?:12|30|38)/i.test(name);
 if(part==='ha')return ha;
 if(part==='specialHa')return ha&&aa>=8;
 if(part==='aaRadar')return /電探|レーダー/.test(cat)&&aa>=2;
 if(part==='radar')return /電探|レーダー/.test(cat);
 if(part==='director')return cat==='高射装置';
 if(part==='sonar')return /ソナー|水中聴音機|水中探信儀/.test(cat+' '+name);
 if(part==='projector')return /爆雷投射機/.test(name);
 if(part==='type3')return /^三式弾/.test(name);
 if(part==='tank')return /陸戦隊|戦車第11連隊|M4A1 DD/.test(name);
 if(part==='amphibious')return /内火艇/.test(cat+' '+name);
 if(part==='rocket')return /WG42|対地噴進砲/.test(name);
 return false;
}
function hdSEAkizuki(ship){
 const db=typeof hdFEFindShip==='function'?hdFEFindShip(ship.ship):null,row=db&&typeof hdShipDbMasterRowFor==='function'?hdShipDbMasterRowFor(db):null;
 return Number(row?.ctype)===54||/^(秋月|照月|初月|涼月|冬月|夏月|宵月|春月|若月|霜月)/.test(ship.ship||'');
}
function hdSERecipeAllows(recipe,ship){return !recipe.ship||(recipe.ship==='akizuki'?hdSEAkizuki(ship):!hdSEAkizuki(ship))}
function hdSEProfiles(map){
 const needs=typeof hdMapEquipNeeds==='function'?hdMapEquipNeeds(map).needs:[],ids=new Set(needs.map(x=>x.id)),rows=[];
 if(ids.has('防空'))rows.push({kind:'cap-aa',baseKind:'防空',label:'対空カットイン',importance:'安定化の推奨',reason:map==='1-6'?'F航空戦マスの被害を抑える防空役を1隻用意。下ルートでは制空優勢や対空CIの発動が通行条件ではありません。':'航空戦・空襲を通るルートの被害軽減用。同じ艦に発動条件を満たす装備を載せます。',note:'対応例の装備条件を確認します。発動は確率制で、ここにない艦固有の専用CIは出典で確認。機銃だけではこのCIセットの準備ありになりません。',source:HD_SE_CAP_SOURCE.aa});
 if(ids.has('対潜'))rows.push({kind:'cap-asw',baseKind:'対潜',label:'対潜シナジー',importance:'潜水艦対策の推奨',reason:'潜水艦と戦うルートで、同じ艦にソナーと爆雷投射機を組み合わせる装備例。',note:'先制対潜は別条件です。装備だけで確定せず、艦種・改造・表示対潜値・ソナー要否を出典で確認。爆雷を追加する3種シナジーも検討。',source:HD_SE_CAP_SOURCE.asw});
 if(ids.has('対地')){const soft=['3-5','4-3','4-5'].includes(map);rows.push({kind:soft?'cap-land-soft':'cap-land-mixed',baseKind:'対地',label:soft?'ソフトスキン向け対地装備':'対地装備の組み合わせ',importance:'陸上型対策の推奨',reason:soft?'北方棲姫・飛行場姫・港湾棲姫などを攻撃する艦に三式弾系を優先。軽量艦のロケットは補助の選択肢。':'陸戦隊系と内火艇系・ロケットを同じ艦に組み合わせる装備例。砲台・集積地など、対象ごとに有効装備が異なります。',note:'装備例の準備状況であり撃破火力の保証ではありません。通らないマスの対策は不要。敵の種類・改修★・配備艦数も確認。',source:soft?(map==='3-5'?'https://wikiwiki.jp/kancolle/北方海域/3-5':map==='4-5'?'https://wikiwiki.jp/kancolle/西方海域/4-5':HD_SE_CAP_SOURCE.land):map==='6-4'?'https://wikiwiki.jp/kancolle/中部海域/6-4':HD_SE_CAP_SOURCE.land})}
 return rows;
}
function hdSEPool(items){
 const pool=new Map();for(const row of items){const item=row.item||row.meta||row,key=typeof hdFLInventoryStackKey==='function'?hdFLInventoryStackKey(item.name,row.star):item.name+'@@'+(row.star||0),old=pool.get(key);if(old)old.count+=row.count==null?1:Number(row.count)||0;else pool.set(key,{key,name:item.name,star:Number(row.star)||0,item,count:row.count==null?1:Number(row.count)||0})}return [...pool.values()];
}
function hdSERecipeParts(recipe,pool){
 const used=new Map(),parts=[];
 for(const part of recipe.parts){const hit=pool.find(row=>row.count>(used.get(row.key)||0)&&hdSEPartMatches(part,row));if(hit)used.set(hit.key,(used.get(hit.key)||0)+1);const old=parts.find(x=>x.part===part);if(old){old.need++;old.have+=Number(!!hit);if(hit)old.items.push(hit.name)}else parts.push({part,label:HD_SE_PARTS[part].label,need:1,have:Number(!!hit),items:hit?[hit.name]:[]})}
 return {parts,matched:parts.reduce((n,x)=>n+x.have,0),total:recipe.parts.length,complete:parts.every(x=>x.have>=x.need)};
}
function hdSEShipPool(ship){
 const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);if(!profile)return [];
 const occupied=new Set(),rows=(ship.items||[]).filter((x,i)=>{const index=x.slotIndex??i,meta=x.name&&hdFEFind(x.name);if(!Number.isInteger(index)||index<0||index>=profile.count||occupied.has(index)||!meta||!hdShipDbEquipCompatible(meta,db)||hdShipDbSlotRejects(profile,index,meta))return false;occupied.add(index);return true});
 if(ship.expansion?.name){const meta=hdFEFind(ship.expansion.name);if(meta&&hdShipDbExpansionInfo(meta,db,ship.expansion.star||0).allowed)rows.push(ship.expansion)}
 return hdSEPool(rows.map(x=>({...x,item:hdFEFind(x.name)})));
}
function hdSECapabilityMeasure(plan,kind){
 const recipes=HD_SE_RECIPES[kind]||[],ships=plan?.ships||[],matched=[];let best=0;
 for(const ship of ships){const pool=hdSEShipPool(ship);let complete=false;for(const recipe of recipes){if(!hdSERecipeAllows(recipe,ship))continue;const r=hdSERecipeParts(recipe,pool);best=Math.max(best,r.matched/Math.max(1,r.total));if(r.complete)complete=true}if(complete)matched.push(ship.ship)}
 return {count:matched.length,ratio:Math.max(Math.min(1,matched.length),best),ships:matched};
}
function hdSECapabilityStock(plan,kind){
 const inventory=typeof hdFLInventory==='function'?[...hdFLInventory().values()]:[],recipes=HD_SE_RECIPES[kind]||[],ships=plan?.ships||[],options=[];
 for(const recipe of recipes){
  const stock=hdSERecipeParts(recipe,inventory);let bestUsable=null;
  for(const ship of ships){if(!hdSERecipeAllows(recipe,ship))continue;const db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db);if(!profile)continue;
   const live=hdFERosterForShip(ship),expanded=!!ship.expansion||live&&Number.isFinite(Number(live.gameSlotEx))&&Number(live.gameSlotEx)>=0;
   const slots=Array.from({length:profile.count},(_,index)=>({index,db,profile}));if(expanded)slots.push({index:0,db,profile,expansion:true});
   const options=recipe.parts.map(part=>({part,choices:slots.flatMap(slot=>inventory.filter(x=>hdSEPartMatches(part,x)&&(slot.expansion?hdShipDbExpansionInfo(x.item,db,x.star).allowed:hdShipDbEquipCompatible(x.item,db)&&!hdShipDbSlotRejects(profile,slot.index,x.item))).map(row=>({slot,row})))})).sort((a,b)=>a.choices.length-b.choices.length);
   const used=new Map(),taken=new Set();let matched=0,examined=0;
   const place=(index,count)=>{
    matched=Math.max(matched,count);if(count===recipe.parts.length)return true;if(index===options.length||++examined>3000)return false;
    for(const {slot,row} of options[index].choices){if(taken.has(slot)||(used.get(row.key)||0)>=row.count)continue;taken.add(slot);used.set(row.key,(used.get(row.key)||0)+1);if(place(index+1,count+1))return true;taken.delete(slot);used.set(row.key,used.get(row.key)-1)}
    return place(index+1,count);
   };place(0,0);
   if(!bestUsable||matched>bestUsable.matched)bestUsable={ship:ship.ship,matched,total:recipe.parts.length,complete:matched===recipe.parts.length};
  }
  options.push({recipe,...stock,usable:bestUsable,eligible:!!bestUsable});
 }
 options.sort((a,b)=>Number(!!b.usable?.complete)-Number(!!a.usable?.complete)||(ships.length?Number(b.eligible)-Number(a.eligible):0)||Number(b.complete)-Number(a.complete)||b.matched/b.total-a.matched/a.total);
 return options[0]||null;
}
function hdSECapabilityHtml(map,fleetId='',proposal=null){
 const profiles=hdSEProfiles(map);if(!profiles.length)return '';
 const fleets=typeof hdSPSFleets==='function'?hdSPSFleets(map):[],fleet=fleetId?fleets.find(x=>String(x.id)===String(fleetId)):(typeof hdSPSFleet==='function'?hdSPSFleet(map):null),plan=proposal||(fleet?hdFEPlanFromSavedFleet(map,fleet):null),esc=hdSEEsc;
 return `<div class="hd-se-capabilities"><strong>攻略で用意する装備・組み合わせ</strong><p>通るルートに合わせた推奨装備です。所持・同じ艦への配備・艦種条件を分けて確認します。</p>${profiles.map(p=>{
  const stock=hdSECapabilityStock(plan,p.kind),actual=hdSECapabilityMeasure(plan,p.kind),status=actual.count?'配備済み':stock?.usable?.complete?'手持ちで配備可能':stock?.complete?(plan?'艦種・装備枠の確認が必要':'所持セットあり・艦隊を選んで確認'):'所持不足';
  return `<article class="hd-se-capability ${actual.count?'ready':stock?.complete?'partial':'missing'}" data-hd-se-capability="${p.kind}"><div class="hd-se-check-head"><div><b>${esc(p.label)}</b><small>${esc(p.importance)}</small></div><strong>${esc(status)}</strong></div><p>${esc(p.reason)}</p>${stock?`<b>${esc(stock.recipe.name)}</b><div class="hd-se-cap-parts">${stock.parts.map(part=>{const gap=Math.max(0,part.need-part.have),examples=HD_SE_PARTS[part.part].examples;return `<div class="${gap?'missing':'ready'}"><b>${esc(part.label)}：${part.have}/${part.need}${gap?`・あと${gap}個`:''}</b><span>${esc(part.items.length?'手持ち：'+part.items.join('、'):'候補：'+examples.join(' / '))}</span></div>`}).join('')}</div>`:''}${actual.count?`<p>条件を満たす配備：${esc(actual.ships.join('、'))}</p>`:stock?.usable?.complete?`<p>同じ艦に載せられる候補：${esc(stock.usable.ship)}。下の探索で他の目安との両立を確認してね。</p>`:stock?.complete&&plan?'<p>所持品は揃っていますが、この編成に同じ艦のセットを確認できません。対応艦・スロット・増設枠を見直してね。</p>':''}<details><summary>別の装備例</summary>${(HD_SE_RECIPES[p.kind]||[]).map(r=>`<p>${esc(r.name)}${r.ship==='akizuki'?'（秋月型専用）':''}</p>`).join('')}</details><small>${esc(p.note)}</small><a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">装備条件の出典 ↗</a></article>`;
 }).join('')}</div>`;
}
function hdSEAirOptional(map){return map==='1-6'}

function hdSECheckKind(kind){
 if(kind==='高速化')return hdSEFastCheck();
 const rule=HD_SORTIE_EQUIP_RULES[kind]||{minCount:1,label:kind,hint:'候補装備を1つ以上用意'};
 const items=hdSECandidates(kind,24),count=hdSEOwnedCount(items),ownedTypes=hdSEOwnedTypes(items);
 let status=count>=rule.minCount?'ready':count>0?'partial':'missing';
 return {kind,label:rule.label,count,minCount:rule.minCount,ownedTypes,candidates:items,status,detail:`目安 ${rule.minCount}個 / 登録 ${count}個`,hint:rule.hint};
}
const HD_SE_CHECK_CACHE=new Map();
function hdSEChecks(map){
 const info=typeof hdMapEquipNeeds==='function'?hdMapEquipNeeds(map):{needs:[],adv:{}};
 const cacheKey=JSON.stringify([info,localStorage.getItem('harbordesk-equipment-v1'),typeof hdFLCatalog==='function'?hdFLCatalog().length:0]);const cached=HD_SE_CHECK_CACHE.get(map);if(cached?.key===cacheKey)return cached.value;
 const profiles=hdSEProfiles(map),replaced=new Set(profiles.map(x=>x.baseKind));
 const rows=(info.needs||[]).filter(n=>!replaced.has(n.id)&&!(map==='1-6'&&['制空','索敵','輸送'].includes(n.id))).map(n=>hdSECheckKind(n.id));
 for(const p of profiles){const stock=hdSECapabilityStock(null,p.kind);rows.push({...p,minCount:1,count:Number(!!stock?.complete),status:stock?.complete?'ready':stock?.matched?'partial':'missing',detail:'同じ艦の推奨セット 1組',hint:p.reason,candidates:[],ownedTypes:[]})}
 if(info.adv?.base?.available)rows.push(hdSEBaseCheck(map,info.adv));
 const value={rows,adv:info.adv||{}};HD_SE_CHECK_CACHE.set(map,{key:cacheKey,value});return value;
}
function hdSEStatusLabel(status){return status==='ready'?'準備あり':status==='partial'?'一部あり':'不足'}
function hdSECard(row,adv){
 if(HD_SE_RECIPES[row.kind]){const stock=hdSECapabilityStock(null,row.kind);return `<article class="hd-se-check ${row.status}"><div class="hd-se-check-head"><div><strong>${hdSEEsc(row.label)}</strong><span>${hdSEEsc(row.importance)}</span></div><b>${stock?.complete?'セット所持あり':'所持不足'}</b></div><p>${hdSEEsc(row.reason)}</p>${stock?`<b>${hdSEEsc(stock.recipe.name)}</b><div class="hd-se-owned-list">${stock.parts.map(x=>`<span class="${x.have<x.need?'missing':''}">${hdSEEsc(x.label)} ${x.have}/${x.need}${x.have<x.need?'・あと'+(x.need-x.have)+'個':''}</span>`).join('')}</div>`:''}<small>所持判定です。同じ艦への配備状況と別の装備例は下の内訳で確認してね。</small></article>`}

 const examples=(row.ownedTypes||[]).slice(0,3).map(x=>{const o=hdSEOwned(x.name);return `${x.name}${o.maxStar? ` ★${o.maxStar}`:''} ×${o.count}`});
 const warning=row.kind==='索敵'&&adv?.los?'<small class="hd-se-manual">索敵分岐は艦隊全体の索敵スコアを別途確認</small>':'';
 return `<article class="hd-se-check ${row.status}">
   <div class="hd-se-check-head"><div><strong>${hdSEEsc(row.label)}</strong><span>${hdSEEsc(row.detail)}</span></div><b>${hdSEStatusLabel(row.status)}</b></div>
   <p>${hdSEEsc(row.hint)}</p>
   ${warning}
   <div class="hd-se-owned-list">${examples.length?examples.map(x=>`<span>${hdSEEsc(x)}</span>`).join(''):'<span class="missing">該当装備の登録なし</span>'}</div>
  </article>`;
}
function hdSEAssignedSummary(map){
 if(typeof hdSPSFleet!=='function'||typeof hdFEPlanFromSavedFleet!=='function'||typeof hdFEEvaluate!=='function')return null;
 try{const fleet=hdSPSFleet(map);if(!fleet)return null;const e=hdFEEvaluate(hdFEPlanFromSavedFleet(map,fleet));if(!e.items.length)return null;return e}catch{return null}
}
function hdSortieEquipmentCheckHtml(map){
 const {rows,adv}=hdSEChecks(map),assigned=hdSEAssignedSummary(map);
 if(!rows.length)return `<div class="hd-se-panel"><div class="hd-se-summary"><div><strong>出撃装備チェック</strong><span>特殊装備の強い要求は検出されなかったよ</span></div></div></div>`;
 const ready=rows.filter(x=>x.status==='ready').length,partial=rows.filter(x=>x.status==='partial').length,missing=rows.filter(x=>x.status==='missing').length;
 const overall=missing?'不足あり':partial?'要確認':'準備あり';
 const actual=assigned?`<div class="hd-se-assigned ${assigned.master?.invalid?.length?'bad':assigned.master?.unresolved?.length?'warn':'ok'}"><div><b>選択艦隊の実配備</b><span>海域要求 ${assigned.ready}/${assigned.requirements.length}｜マスター違反 ${assigned.master?.invalid?.length||0} / 未解決 ${assigned.master?.unresolved?.length||0}</span></div><strong>基礎制空 ${assigned.air?.basePower||0}</strong></div>`:'';
 return `<div class="hd-se-panel" data-hd-se-map="${hdSEEsc(map)}">
  <div class="hd-se-summary"><div><div class="eyebrow">SORTIE EQUIPMENT CHECK</div><strong>${hdSEEsc(map)} 出撃装備チェック</strong><span>主要カテゴリ ${rows.length}件｜準備あり ${ready} / 一部あり ${partial} / 不足 ${missing}</span></div><div class="hd-se-summary-actions"><b class="${missing?'missing':partial?'partial':'ready'}">${overall}</b><button type="button" class="ghost small" data-hd-se-refresh>再判定</button></div></div>
  ${actual}<p class="muted hd-se-note">上段カードは装備台帳の所持目安。選択艦隊がある場合は実配備も100隻マスターのスロット・増設可否で再検証するよ。敵編成・疲労・熟練度などはゲーム画面で最終確認してね。</p>
  <div class="hd-se-grid">${rows.map(x=>hdSECard(x,adv)).join('')}</div>
  <div class="hd-se-footer"><button type="button" class="ghost small" data-hd-se-analyzer>装備戦力診断を開く</button>${adv?.los?'<button type="button" class="ghost small" data-hd-se-calculator>計算ツールを開く</button>':''}</div>
 </div>`;
}
function hdSEInstall(){
 if(window.__hdSortieEquipCheckInstalled||typeof hdMapEquipRecommendationsHtml!=='function')return false;
 window.__hdSortieEquipCheckInstalled=true;
 const prev=hdMapEquipRecommendationsHtml;
 hdMapEquipRecommendationsHtml=function(map){
  const html=prev(map);
  const panel=hdSortieEquipmentCheckHtml(map);
  return html.replace('<section class="hd-map-equip-recommend">',`<section class="hd-map-equip-recommend">${panel}`);
 };
 if(typeof hdRenderMapEquipmentRecommendations==='function')setTimeout(hdRenderMapEquipmentRecommendations,0);
 return true;
}
function hdSEOpenAnalyzer(){
 const target=document.getElementById('hdEquipAnalyzer');if(!target)return;
 if(typeof hdWSShowElement==='function')hdWSShowElement('hdEquipAnalyzer',true);else target.scrollIntoView({behavior:'smooth',block:'start'});
}
function hdSEOpenCalculator(){
 const target=document.getElementById('calculators');if(!target)return;
 if(typeof hdWSShowElement==='function')hdWSShowElement('calculators',true);else target.scrollIntoView({behavior:'smooth',block:'start'});
}
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-hd-se-refresh]')){if(typeof hdRenderMapEquipmentRecommendations==='function')hdRenderMapEquipmentRecommendations();return}
 if(e.target.closest?.('[data-hd-se-analyzer]')){hdSEOpenAnalyzer();return}
 if(e.target.closest?.('[data-hd-se-calculator]')){hdSEOpenCalculator();return}
});
function hdSEEnsure(){
 const installed=hdSEInstall();
 if((installed||window.__hdSortieEquipCheckInstalled)&&typeof hdRenderMapEquipmentRecommendations==='function')hdRenderMapEquipmentRecommendations();
 return !!window.__hdSortieEquipCheckInstalled;
}
window.addEventListener('storage',e=>{if(e.key==='harbordesk-equipment-v1')hdSEEnsure()});
window.addEventListener('hd:modules-ready',()=>hdSEEnsure());
window.addEventListener('hd:map-rendered',()=>hdSEEnsure());
window.addEventListener('hd:map-tab-changed',e=>{if(e.detail?.tab==='gear')hdSEEnsure()});
window.addEventListener('load',()=>setTimeout(hdSEEnsure,120));
hdSEEnsure();
