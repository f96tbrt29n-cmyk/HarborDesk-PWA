const HD_FE_AIR_CATS=new Set(['艦上戦闘機','艦上攻撃機','艦上爆撃機','水上戦闘機','水上爆撃機','噴式戦闘爆撃機']);

function hdFEEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdFECatalog(){return typeof hdFLCatalog==='function'?hdFLCatalog():(typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG:[])}
function hdFEFind(name){return hdFECatalog().find(x=>x.name===name)||null}
function hdFEAssigned(plan){
 const rows=[];
 for(const ship of plan?.ships||[]){
  for(const item of ship.items||[]){
   const meta=hdFEFind(item.name)||{name:item.name,category:item.category||'',stats:{},tags:[]};
   rows.push({ship:ship.ship||'',name:item.name,star:Number(item.star)||0,kind:item.kind||'',meta});
  }
 }
 return rows;
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
 return {count:air.length,antiAir:air.reduce((s,x)=>s+(Number(x.meta?.stats?.対空)||0),0),names:air.map(x=>x.name)};
}
function hdFENight(items,stats){
 const support=items.filter(x=>hdFEHasTag(x,'夜戦','魚雷CI','夜偵')||['探照灯','大型探照灯','照明弾'].includes(x.meta?.category)).length;
 return {equipmentAttack:(Number(stats.火力)||0)+(Number(stats.雷装)||0),support};
}
function hdFEEvaluate(plan){
 const map=plan?.map||'',items=hdFEAssigned(plan),stats=hdFEStats(items),air=hdFEAir(items),los=hdFELos(items,map),night=hdFENight(items,stats);
 const check=typeof hdSEChecks==='function'?hdSEChecks(map):{rows:[],adv:{}};
 const requirements=(check.rows||[]).filter(r=>r.kind!=='基地航空隊').map(r=>{
  const m=hdFEKindCount(r.kind,items),min=Math.max(1,Number(r.minCount)||1),count=Number(m.count)||0;
  const status=count>=min?'ready':(count>0||m.partial?'partial':'missing');
  return {kind:r.kind,label:r.label||r.kind,minCount:min,count,status,detail:m.detail||`${count} / 目安 ${min}`,hint:r.hint||''};
 });
 const ready=requirements.filter(x=>x.status==='ready').length;
 const partial=requirements.filter(x=>x.status==='partial').length;
 const missing=requirements.filter(x=>x.status==='missing').length;
 return {
  map,items,stats,air,los,night,requirements,ready,partial,missing,
  antiGround:hdFEKindCount('対地',items).count,
  radar:hdFEKindCount('電探',items).count,
  aswGear:hdFEKindCount('対潜',items).count,
  aswStat:stats.対潜||0,
  speed:hdFEKindCount('高速化',items),
  smoke:hdFEKindCount('煙幕',items).count
 };
}
function hdFEStatusLabel(s){return s==='ready'?'配置あり':s==='partial'?'一部配置':'未配置'}
function hdFEMetricHtml(label,value,note=''){
 return `<div class="hd-fe-metric"><span>${hdFEEsc(label)}</span><strong>${hdFEEsc(value)}</strong>${note?`<small>${hdFEEsc(note)}</small>`:''}</div>`;
}
function hdFERequirementHtml(r){
 return `<div class="hd-fe-req ${r.status}"><div><strong>${hdFEEsc(r.label)}</strong><small>${hdFEEsc(r.detail)}</small></div><b>${hdFEStatusLabel(r.status)}</b></div>`;
}
function hdFEHtml(plan){
 const e=hdFEEvaluate(plan),losText=e.los.weighted!=null?e.los.weighted.toFixed(2):e.los.raw.toFixed(2),losLabel=e.los.weighted!=null?`33式 装備項×係数`:'索敵 装備項';
 const requirementHtml=e.requirements.length?e.requirements.map(hdFERequirementHtml).join(''):'<div class="muted">この海域では主要な特殊装備要求を検出していないよ。</div>';
 const airNote=e.air.count?'搭載数がないため制空値そのものは未計算':'航空装備なし';
 const losNote=e.los.summary?e.los.summary:'艦娘素索敵・司令部Lvを含む最終33式は別計算';
 return `<section class="hd-fe-panel">
  <div class="hd-fe-head"><div><div class="eyebrow">FLEET READINESS SCORECARD</div><strong>編成・装備の数値評価</strong><span>実際にこの候補へ配備された装備だけを集計</span></div><b class="${e.missing?'warn':e.partial?'partial':'ok'}">配置 ${e.ready}/${e.requirements.length}</b></div>
  <div class="hd-fe-metrics">
   ${hdFEMetricHtml('装備 火力+雷装',e.night.equipmentAttack,'艦娘本体の火力・雷装は含まない')}
   ${hdFEMetricHtml('装備 対潜',e.aswStat,`対潜装備 ${e.aswGear}個`)}
   ${hdFEMetricHtml('航空装備 対空合計',e.air.antiAir,`${e.air.count}枠｜${airNote}`)}
   ${hdFEMetricHtml(losLabel,losText,e.los.coef?`分岐点係数 ${e.los.coef}｜最終33式ではない`:'最終33式ではない')}
   ${hdFEMetricHtml('対地装備',e.antiGround,`電探 ${e.radar} / 煙幕 ${e.smoke}`)}
   ${hdFEMetricHtml('夜戦補助',e.night.support,`高速化 ${e.speed.detail||e.speed.count+'組'}`)}
  </div>
  <div class="hd-fe-subhead"><strong>海域要求との照合</strong><span>装備配置だけで判定できる範囲</span></div>
  <div class="hd-fe-reqs">${requirementHtml}</div>
  ${e.los.summary?`<div class="hd-fe-caution"><b>索敵メモ</b><span>${hdFEEsc(losNote)}</span></div>`:''}
  <div class="hd-fe-caution"><b>制空について</b><span>${hdFEEsc(airNote)}。実際の制空値は各艦の搭載数・熟練度・敵制空値を含めて艦隊制空・索敵プランナーで確認してね。</span></div>
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
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-hd-fe-calculator]')){
  if(typeof hdWSShowElement==='function')hdWSShowElement('guide',true);
  setTimeout(()=>{document.querySelector('[data-map-tab="gear"]')?.click();setTimeout(()=>document.getElementById('hdFleetCalculator')?.scrollIntoView({behavior:'smooth',block:'start'}),80)},60);
  return;
 }
 if(e.target.closest?.('[data-hd-fe-prep]')){if(typeof hdSPSOpen==='function')hdSPSOpen();return}
});
window.addEventListener('load',()=>setTimeout(()=>{if(!hdFEInstall())setTimeout(hdFEInstall,500)},720));
hdFEInstall();
