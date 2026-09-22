const HD_MAP_EQUIP_PRIORITY={
  '対潜':['四式水中聴音機','三式水中探信儀','試製東海','S-51J改','S-51J'],
  '制空':['零式艦戦53型(岩本隊)','試製烈風 後期型','二式水戦改(熟練)','烈風(六〇一空)'],
  '防空':['12cm30連装噴進砲改二','10cm連装高角砲＋高射装置','Bofors 40mm四連装機関砲','25mm三連装機銃 集中配備'],
  '対地':['特二式内火艇','大発動艇(八九式中戦車＆陸戦隊)','M4A1 DD','三式弾'],
  '索敵':['紫雲(熟練)','零式水上偵察機11型乙(熟練)','33号水上電探','SK＋SGレーダー'],
  '夜戦':['水雷戦隊 熟練見張員','九八式水上偵察機(夜偵)','照明弾','探照灯'],
  '輸送':['大発動艇','大発動艇(八九式中戦車＆陸戦隊)','特二式内火艇'],
  '高速化':['改良型艦本式タービン','新型高温高圧缶','強化型艦本式缶'],
  '電探':['33号水上電探','22号対水上電探改四','SK＋SGレーダー','FuMO25 レーダー'],
  '煙幕':['発煙装置(煙幕)']
};

function hdMapEquipEsc(s){
  if(typeof hdMapEsc==='function')return hdMapEsc(s);
  if(typeof esc==='function')return esc(s);
  return String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
}

function hdMapEquipText(map){
  const d=typeof MAP_DETAILS!=='undefined'?MAP_DETAILS[map]||{}:{};
  const nodes=typeof HD_NODE_DETAIL_OVERRIDES!=='undefined'?HD_NODE_DETAIL_OVERRIDES[map]||{}:{};
  const nodeText=Object.values(nodes).map(x=>`${x.enemy||''} ${x.air||''} ${x.branch||''}`).join(' ');
  return `${d.overview||''} ${d.route||''} ${d.air||''} ${d.note||d.caution||''} ${nodeText}`;
}
function hdMapEquipNeeds(map){
  const g=typeof HD_MAP_GRAPHS!=='undefined'?HD_MAP_GRAPHS[map]||{}:{};
  const adv=typeof HD_MAP_ADVANCED_DATA!=='undefined'?HD_MAP_ADVANCED_DATA[map]||{}:{};
  const text=hdMapEquipText(map);
  const needs=[];
  const add=(id,label,reason)=>{if(!needs.some(x=>x.id===id))needs.push({id,label,reason})};
  const subPositive=(g.sub||[]).length||/対潜|潜水マス|潜水艦との戦闘|潜水戦|敵[^。 ]*潜水|潜水(?:カ級|ヨ級|ソ級|新棲姫)/.test(text);
  if(subPositive)add('対潜','対潜','潜水マス・潜水艦対策。先制対潜や対潜シナジーを組みやすい装備を優先。');
  const airExplicitNone=/航空戦力(?:は|が)?(?:基本)?不要|制空(?:は|より)?[^。]*(?:不要|優先度が低い)/.test(text);
  const airPositive=(g.air||[]).length||(!airExplicitNone&&/航空戦(?!力)|空襲|航空優勢|航空均衡|制空値|制空確保|制空を(?:確保|取る|調整)|制空調整|制空重視|艦戦/.test(text));
  if(airPositive){
    add('制空','制空','航空優勢・拮抗などの制空調整用。艦戦/水戦から編成に合うものを選ぶ。');
    add('防空','防空','空襲・航空戦の被害軽減用。対空CIや噴進弾幕を組める艦では特に有効。');
  }
  if(/陸上型|対地|集積地|砲台|離島|飛行場姫/.test(text))add('対地','対地','陸上型への特効装備。艦種ごとの搭載可否と組み合わせを確認。');
  if(adv.los||/索敵/.test(text))add('索敵','索敵','ボス前などの索敵分岐対策。必要係数・閾値に余裕を持たせる。');
  if((g.night||[]).length||/夜戦/.test(text))add('夜戦','夜戦','夜戦マス・ボス夜戦向け。夜偵・見張員・照明弾などを編成に合わせて使用。');
  if(/輸送|TP/.test(text))add('輸送','輸送','TP輸送や輸送量増加に使える装備。対地装備と兼用できるものもある。');
  if(/高速\+|最速|高速統一|速力/.test(text))add('高速化','高速化','速力によるルート制御がある海域向け。タービンと缶の組み合わせを確認。');
  if((g.vortex||[]).length||/うずしお/.test(text))add('電探','電探','うずしお軽減や索敵・命中補助に使える電探候補。');
  if(/煙幕/.test(text))add('煙幕','煙幕','道中突破用の煙幕候補。発動条件と敵電探の有無に注意。');
  return {needs,adv};
}
function hdMapEquipFindByName(name){return typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG.find(x=>x.name===name):null}
function hdMapEquipPick(kind,limit=4){
  const preferred=(HD_MAP_EQUIP_PRIORITY[kind]||[]).map(hdMapEquipFindByName).filter(Boolean);
  const tagMatches=(typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG:[]).filter(x=>
    (x.tags||[]).some(t=>t===kind||t.includes(kind))||x.category?.includes(kind)
  );
  return [...new Map([...preferred,...tagMatches].map(x=>[x.name,x])).values()].slice(0,limit);
}
function hdMapBasePick(map,limit=5){
  if(typeof HD_EQUIPMENT_CATALOG==='undefined')return [];
  const adv=typeof HD_MAP_ADVANCED_DATA!=='undefined'?HD_MAP_ADVANCED_DATA[map]||{}:{};
  if(!adv.base?.available)return [];
  const need=Number(adv.base.bossRadius)||0;
  const all=HD_EQUIPMENT_CATALOG.filter(x=>(x.tags||[]).includes('基地航空隊')||['陸上攻撃機','陸軍戦闘機','局地戦闘機'].includes(x.category));
  const asw=((typeof HD_MAP_GRAPHS!=='undefined'?HD_MAP_GRAPHS[map]?.sub:[])||[]).length>0;
  const pref=asw?['試製東海','銀河','四式重爆 飛龍','一式戦 隼II型(64戦隊)','一式陸攻']:['銀河','四式重爆 飛龍','一式陸攻 三四型','一式戦 隼II型(64戦隊)','一式陸攻'];
  const sorted=[...all].sort((a,b)=>{
    const ai=pref.indexOf(a.name),bi=pref.indexOf(b.name);
    const ar=ai<0?99:ai,br=bi<0?99:bi;
    if(ar!==br)return ar-br;
    return (Number(b.radius)||0)-(Number(a.radius)||0);
  });
  return sorted.filter(x=>x.radius==null||Number(x.radius)>=need).slice(0,limit);
}
function hdMapEquipCard(item,reason){
  const stats=typeof hdEquipStatText==='function'?hdEquipStatText(item):[];
  return `<article class="hd-map-equip-card"><div class="hd-map-equip-card-head"><div><strong>${hdMapEquipEsc(item.name)}</strong><span>${hdMapEquipEsc(item.category||'')}</span></div><button class="ghost small" type="button" data-hd-map-equip-view="${hdMapEquipEsc(item.name)}">図鑑で見る</button></div>${stats.length?`<div class="hd-map-equip-stats">${stats.slice(0,7).map(s=>`<span>${hdMapEquipEsc(s)}</span>`).join('')}</div>`:''}<p>${hdMapEquipEsc(reason||item.role||'')}</p><div class="hd-map-equip-actions"><button class="primary small" type="button" data-hd-equip-add="${hdMapEquipEsc(item.name)}">台帳へ追加</button></div></article>`;
}
function hdMapEquipRecommendationsHtml(map){
  if(typeof HD_EQUIPMENT_CATALOG==='undefined')return '<div class="empty">装備データベースを読み込み中</div>';
  const {needs,adv}=hdMapEquipNeeds(map);
  const groups=[];
  needs.forEach(n=>{const items=hdMapEquipPick(n.id,n.id==='対地'?4:3);if(items.length)groups.push({label:n.label,reason:n.reason,items})});
  if(adv.base?.available){
    const items=hdMapBasePick(map,5);
    groups.push({label:'基地航空隊',reason:`出撃可能 ${adv.base.sorties||1}部隊。ボス必要半径 ${adv.base.bossRadius??'要確認'}。${adv.base.note||''}`,items});
  }
  if(!groups.length){
    groups.push({label:'基本装備',reason:'この海域は特殊装備要求が比較的少ないため、火力・命中・制空を編成に合わせて調整。',items:hdMapEquipPick('索敵',3)});
  }
  const los=adv.los?`<div class="hd-map-equip-alert"><b>索敵条件</b><span>${adv.los.coef!=null?`分岐点係数 ${adv.los.coef}｜`:''}${hdMapEquipEsc(adv.los.summary||'')}</span></div>`:'';
  return `<section class="hd-map-equip-recommend"><div class="hd-map-equip-title"><div><div class="eyebrow">MAP × EQUIPMENT</div><h4>この海域の装備候補</h4></div><button class="ghost small" type="button" data-hd-open-equip-db>装備図鑑を開く</button></div><p class="muted hd-map-equip-note">海域データから自動抽出した候補。固定の必須装備ではなく、編成・ルート・所持装備に合わせて調整してね。</p>${los}${groups.map(g=>`<div class="hd-map-equip-group"><div class="hd-map-equip-group-head"><strong>${hdMapEquipEsc(g.label)}</strong><p>${hdMapEquipEsc(g.reason)}</p></div><div class="hd-map-equip-grid">${g.items.map(x=>hdMapEquipCard(x,x.role)).join('')||'<div class="empty">候補装備を準備中</div>'}</div></div>`).join('')}</section>`;
}
function hdMapEquipRenderHost(){
  const fallback=document.querySelector('#hdFallbackGearTools #hdMapEquipRecommend');
  const normal=document.querySelector('[data-map-pane="gear"]:not(#hdFallbackGearTools) #hdMapEquipRecommend');
  if(fallback&&!document.querySelector('[data-map-tab="gear"]'))return fallback;
  return normal||fallback||document.getElementById('hdMapEquipRecommend');
}
function hdRenderMapEquipmentRecommendations(){
  const host=hdMapEquipRenderHost();
  if(!host||typeof selectedMap==='undefined'||!selectedMap)return;
  host.innerHTML=hdMapEquipRecommendationsHtml(selectedMap);
}
function hdOpenEquipmentDb(name=''){
  const target=document.getElementById('equipmentBook');
  if(!target)return;
  if(typeof hdWSShowElement==='function')hdWSShowElement('equipmentBook',true);else if(typeof hdQNJump==='function')hdQNJump('equipmentBook');else target.scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(()=>{
    const input=document.getElementById('hdEquipCatalogSearch');
    if(input&&name){input.value=name;if(typeof hdRenderEquipmentCatalog==='function')hdRenderEquipmentCatalog();input.focus()}
  },250);
}
document.addEventListener('click',e=>{
  const view=e.target.closest?.('[data-hd-map-equip-view]');if(view){hdOpenEquipmentDb(view.dataset.hdMapEquipView);return}
  if(e.target.closest?.('[data-hd-open-equip-db]')){hdOpenEquipmentDb();return}
  if(e.target.closest?.('[data-map-tab="gear"]'))setTimeout(hdRenderMapEquipmentRecommendations,0);
});
if(typeof hdApplyMapTabs==='function'){
  const hdMapEquipPrevApply=hdApplyMapTabs;
  hdApplyMapTabs=function(){hdMapEquipPrevApply();setTimeout(hdRenderMapEquipmentRecommendations,0)};
}
function hdMapEquipScheduleRender(delay=0){
  setTimeout(()=>{try{hdRenderMapEquipmentRecommendations()}catch{}},Math.max(0,Number(delay)||0));
}
window.addEventListener('load',()=>hdMapEquipScheduleRender(180));
window.addEventListener('hd:modules-ready',()=>hdMapEquipScheduleRender(0));
window.addEventListener('hd:map-rendered',()=>hdMapEquipScheduleRender(0));
window.addEventListener('hd:workspace-refresh',()=>hdMapEquipScheduleRender(0));

window.hdMapEquipRecommendationsHtml=hdMapEquipRecommendationsHtml;
window.hdRenderMapEquipmentRecommendations=hdRenderMapEquipmentRecommendations;
window.hdMapEquipScheduleRender=hdMapEquipScheduleRender;
hdMapEquipScheduleRender(0);
hdMapEquipScheduleRender(350);
