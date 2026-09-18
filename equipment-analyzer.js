const HD_EQUIPMENT_COVERAGE=[
 {id:'制空',label:'制空',tags:['制空','艦戦','水戦'],note:'艦戦・水戦を中心に制空値を確保'},
 {id:'索敵',label:'索敵',tags:['索敵','水偵','電探'],note:'分岐条件や弾着観測を安定させる'},
 {id:'対潜',label:'対潜',tags:['対潜','ソナー','爆雷'],note:'先制対潜と潜水マス対策'},
 {id:'夜戦',label:'夜戦',tags:['夜戦','魚雷CI','夜襲CI'],note:'夜戦火力・カットイン・支援装備'},
 {id:'対地',label:'対地',tags:['対地','集積地','上陸'],note:'砲台・集積地・陸上型対策'},
 {id:'防空',label:'防空',tags:['防空','対空CI','噴進弾幕'],note:'空襲・航空戦の被害軽減'},
 {id:'高速化',label:'高速化',tags:['高速化','機関'],note:'高速＋・最速などのルート調整'},
 {id:'基地航空隊',label:'基地航空隊',tags:['基地航空隊','陸攻','局地戦闘機'],note:'陸攻・陸戦・局戦による基地運用'}
];
const HD_EQUIP_ANALYZER_KEY='harbordesk-equip-analyzer-v1';

function hdEAesc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdEAnormalize(s){return String(s||'').normalize('NFKC').replace(/\s+/g,'').replace(/･/g,'・')}
function hdEAownedRows(){try{const x=JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function hdEAownedMap(){
 const m=new Map();
 for(const row of hdEAownedRows()){
  const k=hdEAnormalize(row.name);if(!k)continue;
  const cur=m.get(k)||{count:0,maxStar:0,targetStar:0};
  cur.count+=Math.max(0,Number(row.count)||0);
  cur.maxStar=Math.max(cur.maxStar,Math.max(0,Number(row.star)||0));
  cur.targetStar=Math.max(cur.targetStar,Math.max(0,Number(row.targetStar)||0));
  m.set(k,cur);
 }
 return m;
}
function hdEAitemScore(item){
 const stats=item?.stats||{};
 let score=0;
 score+=(Number(stats.対空)||0)*1.3+(Number(stats.索敵)||0)*1.1+(Number(stats.対潜)||0)*1.1;
 score+=(Number(stats.火力)||0)*.55+(Number(stats.雷装)||0)*.55+(Number(stats.爆装)||0)*.45;
 score+=(Number(stats.命中)||0)*.8+(Number(stats.回避)||0)*.3+(Number(stats.装甲)||0)*.25;
 if(String(item?.improve||'').includes('可'))score+=2;
 if((item?.tags||[]).some(t=>['一点物','ネームド','上位','高火力','高命中'].includes(t)))score+=2;
 return score;
}
function hdEAmatches(item,group){
 const hay=[item.category,...(item.tags||[])].join(' ');
 return group.tags.some(t=>hay.includes(t));
}
function hdEAcandidates(group,limit=5){
 const cat=Array.isArray(window.HD_EQUIPMENT_CATALOG)?window.HD_EQUIPMENT_CATALOG:(typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG:[]);
 const owned=hdEAownedMap();
 return cat.filter(x=>hdEAmatches(x,group)).sort((a,b)=>{
  const ao=(owned.get(hdEAnormalize(a.name))?.count||0)>0,bo=(owned.get(hdEAnormalize(b.name))?.count||0)>0;
  if(ao!==bo)return ao?-1:1;
  return hdEAitemScore(b)-hdEAitemScore(a);
 }).slice(0,limit);
}
function hdEAsummary(){
 const owned=hdEAownedMap();
 return HD_EQUIPMENT_COVERAGE.map(g=>{
  const candidates=hdEAcandidates(g,6);
  const have=candidates.filter(x=>(owned.get(hdEAnormalize(x.name))?.count||0)>0);
  const total=have.reduce((s,x)=>s+(owned.get(hdEAnormalize(x.name))?.count||0),0);
  const improved=have.filter(x=>(owned.get(hdEAnormalize(x.name))?.maxStar||0)>0).length;
  const status=have.length>=3?'good':have.length>=1?'warn':'miss';
  return {group:g,candidates,have,total,improved,status};
 });
}
function hdEAbadge(status){return status==='good'?'十分':status==='warn'?'要確認':'不足'}
function hdEArenderCoverage(){
 const host=document.getElementById('hdEquipCoverageGrid');if(!host)return;
 const data=hdEAsummary(),missingOnly=document.getElementById('hdEquipMissingOnly')?.checked;
 const rows=missingOnly?data.filter(x=>x.status!=='good'):data;
 host.innerHTML=rows.map(x=>`<article class="hd-ea-card ${x.status}">
   <div class="hd-ea-card-head"><div><strong>${hdEAesc(x.group.label)}</strong><span>${hdEAesc(x.group.note)}</span></div><b>${hdEAbadge(x.status)}</b></div>
   <div class="hd-ea-metrics"><span>候補所持 <strong>${x.have.length}/${x.candidates.length}</strong></span><span>所持数 <strong>${x.total}</strong></span><span>改修済 <strong>${x.improved}</strong></span></div>
   <div class="hd-ea-candidates">${x.candidates.map(item=>{const o=hdEAownedMap().get(hdEAnormalize(item.name));return `<button type="button" class="${o?.count?'owned':'missing'}" data-hd-ea-pick="${hdEAesc(item.name)}"><span>${hdEAesc(item.name)}</span><small>${o?.count?`所持 ${o.count}${o.maxStar? ` / ★${o.maxStar}`:''}`:'未所持'}</small></button>`}).join('')}</div>
  </article>`).join('')||'<div class="empty">不足カテゴリはないよ</div>';
 const good=data.filter(x=>x.status==='good').length,warn=data.filter(x=>x.status==='warn').length,miss=data.filter(x=>x.status==='miss').length;
 const sum=document.getElementById('hdEquipCoverageSummary');if(sum)sum.textContent=`十分 ${good} / 要確認 ${warn} / 不足 ${miss}`;
}
function hdEAoptions(selected=''){
 const cat=Array.isArray(window.HD_EQUIPMENT_CATALOG)?window.HD_EQUIPMENT_CATALOG:(typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG:[]);
 return ['<option value="">装備を選択</option>',...cat.slice().sort((a,b)=>a.name.localeCompare(b.name,'ja')).map(x=>`<option value="${hdEAesc(x.name)}"${x.name===selected?' selected':''}>${hdEAesc(x.name)}</option>`)].join('');
}
function hdEAstatKeys(a,b){return [...new Set([...Object.keys(a?.stats||{}),...Object.keys(b?.stats||{})])]}
function hdEArenderCompare(){
 const cat=Array.isArray(window.HD_EQUIPMENT_CATALOG)?window.HD_EQUIPMENT_CATALOG:(typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG:[]);
 const a=cat.find(x=>x.name===document.getElementById('hdEquipCompareA')?.value),b=cat.find(x=>x.name===document.getElementById('hdEquipCompareB')?.value),host=document.getElementById('hdEquipCompareResult');
 if(!host)return;
 if(!a||!b){host.innerHTML='<div class="empty">比較する装備を2つ選んでね</div>';return}
 const keys=hdEAstatKeys(a,b);
 host.innerHTML=`<div class="hd-ea-compare-head"><div><strong>${hdEAesc(a.name)}</strong><span>${hdEAesc(a.category)}</span></div><b>VS</b><div><strong>${hdEAesc(b.name)}</strong><span>${hdEAesc(b.category)}</span></div></div>
 <div class="hd-ea-table"><div class="head">性能</div><div class="head">A</div><div class="head">B</div>${keys.map(k=>`<div>${hdEAesc(k)}</div><div>${Number(a.stats?.[k]||0)>=0?'+':''}${Number(a.stats?.[k]||0)}</div><div>${Number(b.stats?.[k]||0)>=0?'+':''}${Number(b.stats?.[k]||0)}</div>`).join('')}</div>
 <div class="hd-ea-compare-notes"><p><b>A:</b> ${hdEAesc(a.role||'')}</p><p><b>B:</b> ${hdEAesc(b.role||'')}</p></div>`;
}
function hdEAselectForCompare(name){
 const a=document.getElementById('hdEquipCompareA'),b=document.getElementById('hdEquipCompareB');if(!a||!b)return;
 if(!a.value)a.value=name;else if(!b.value&&a.value!==name)b.value=name;else{a.value=name;b.value=''}
 hdEArenderCompare();
 document.getElementById('hdEquipAnalyzer')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function hdEAensure(){
 if(document.getElementById('hdEquipAnalyzer'))return;
 const anchor=document.getElementById('equipmentBook');if(!anchor)return;
 const sec=document.createElement('section');sec.id='hdEquipAnalyzer';sec.className='advanced-section hd-ea-section';
 sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">EQUIPMENT ANALYZER</div><h2>装備戦力診断</h2></div><span id="hdEquipCoverageSummary" class="muted"></span></div>
 <div class="hd-ea-toolbar"><p>装備台帳の所持数と装備図鑑を照合して、主要攻略カテゴリの手薄なところを確認するよ。</p><label><input id="hdEquipMissingOnly" type="checkbox"> 不足・要確認だけ表示</label><button id="hdEquipAnalyzeRefresh" class="ghost small" type="button">再診断</button></div>
 <div id="hdEquipCoverageGrid" class="hd-ea-grid"></div>
 <div class="hd-ea-compare"><div class="section-head compact"><div><div class="eyebrow">COMPARE</div><h3>装備比較</h3></div></div><div class="hd-ea-selects"><select id="hdEquipCompareA"></select><span>↔</span><select id="hdEquipCompareB"></select></div><div id="hdEquipCompareResult"></div></div>`;
 anchor.insertAdjacentElement('afterend',sec);
 const a=document.getElementById('hdEquipCompareA'),b=document.getElementById('hdEquipCompareB');if(a)a.innerHTML=hdEAoptions();if(b)b.innerHTML=hdEAoptions();
 document.getElementById('hdEquipMissingOnly')?.addEventListener('change',hdEArenderCoverage);
 document.getElementById('hdEquipAnalyzeRefresh')?.addEventListener('click',hdEArenderCoverage);
 a?.addEventListener('change',hdEArenderCompare);b?.addEventListener('change',hdEArenderCompare);
 hdEArenderCoverage();hdEArenderCompare();
}
document.addEventListener('click',e=>{const pick=e.target.closest?.('[data-hd-ea-pick]');if(pick)hdEAselectForCompare(pick.dataset.hdEaPick)});
window.addEventListener('storage',e=>{if(e.key==='harbordesk-equipment-v1')hdEArenderCoverage()});
window.addEventListener('hd:workspace-refresh',()=>hdEArenderCoverage());
window.addEventListener('load',()=>setTimeout(hdEAensure,350));
