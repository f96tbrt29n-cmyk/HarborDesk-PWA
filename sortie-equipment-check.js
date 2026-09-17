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
 const cans=items.filter(x=>/缶$/.test(x.name)||(x.tags||[]).includes('機関'));
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
function hdSECheckKind(kind){
 if(kind==='高速化')return hdSEFastCheck();
 const rule=HD_SORTIE_EQUIP_RULES[kind]||{minCount:1,label:kind,hint:'候補装備を1つ以上用意'};
 const items=hdSECandidates(kind,24),count=hdSEOwnedCount(items),ownedTypes=hdSEOwnedTypes(items);
 let status=count>=rule.minCount?'ready':count>0?'partial':'missing';
 return {kind,label:rule.label,count,minCount:rule.minCount,ownedTypes,candidates:items,status,detail:`目安 ${rule.minCount}個 / 登録 ${count}個`,hint:rule.hint};
}
function hdSEChecks(map){
 const info=typeof hdMapEquipNeeds==='function'?hdMapEquipNeeds(map):{needs:[],adv:{}};
 const rows=(info.needs||[]).map(n=>hdSECheckKind(n.id));
 if(info.adv?.base?.available)rows.push(hdSEBaseCheck(map,info.adv));
 return {rows,adv:info.adv||{}};
}
function hdSEStatusLabel(status){return status==='ready'?'準備あり':status==='partial'?'一部あり':'不足'}
function hdSECard(row,adv){
 const examples=(row.ownedTypes||[]).slice(0,3).map(x=>{const o=hdSEOwned(x.name);return `${x.name}${o.maxStar? ` ★${o.maxStar}`:''} ×${o.count}`});
 const warning=row.kind==='索敵'&&adv?.los?'<small class="hd-se-manual">索敵分岐は艦隊全体の索敵スコアを別途確認</small>':'';
 return `<article class="hd-se-check ${row.status}">
   <div class="hd-se-check-head"><div><strong>${hdSEEsc(row.label)}</strong><span>${hdSEEsc(row.detail)}</span></div><b>${hdSEStatusLabel(row.status)}</b></div>
   <p>${hdSEEsc(row.hint)}</p>
   ${warning}
   <div class="hd-se-owned-list">${examples.length?examples.map(x=>`<span>${hdSEEsc(x)}</span>`).join(''):'<span class="missing">該当装備の登録なし</span>'}</div>
  </article>`;
}
function hdSortieEquipmentCheckHtml(map){
 const {rows,adv}=hdSEChecks(map);
 if(!rows.length)return `<div class="hd-se-panel"><div class="hd-se-summary"><div><strong>出撃装備チェック</strong><span>特殊装備の強い要求は検出されなかったよ</span></div></div></div>`;
 const ready=rows.filter(x=>x.status==='ready').length,partial=rows.filter(x=>x.status==='partial').length,missing=rows.filter(x=>x.status==='missing').length;
 const overall=missing?'不足あり':partial?'要確認':'準備あり';
 return `<div class="hd-se-panel" data-hd-se-map="${hdSEEsc(map)}">
  <div class="hd-se-summary"><div><div class="eyebrow">SORTIE EQUIPMENT CHECK</div><strong>${hdSEEsc(map)} 出撃装備チェック</strong><span>主要カテゴリ ${rows.length}件｜準備あり ${ready} / 一部あり ${partial} / 不足 ${missing}</span></div><div class="hd-se-summary-actions"><b class="${missing?'missing':partial?'partial':'ready'}">${overall}</b><button type="button" class="ghost small" data-hd-se-refresh>再判定</button></div></div>
  <p class="muted hd-se-note">装備台帳と海域データを突き合わせた準備目安。艦種・艦娘レベル・搭載数・敵編成・ルート条件まではこの判定だけでは確定しないよ。</p>
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
window.addEventListener('storage',e=>{if(e.key==='harbordesk-equipment-v1'&&typeof hdRenderMapEquipmentRecommendations==='function')hdRenderMapEquipmentRecommendations()});
window.addEventListener('load',()=>setTimeout(()=>{if(!hdSEInstall())setTimeout(hdSEInstall,500)},250));
hdSEInstall();
