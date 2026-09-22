const HD_OWNED_EQUIP_KEY='harbordesk-equipment-v1';

function hdOwnedEquipNormalize(name){
  return String(name||'').normalize('NFKC').replace(/\s+/g,'').replace(/･/g,'・');
}
function hdOwnedEquipRows(){
  try{
    const rows=JSON.parse(localStorage.getItem(HD_OWNED_EQUIP_KEY)||'[]');
    return Array.isArray(rows)?rows:[];
  }catch{return []}
}
function hdOwnedEquipSummary(name){
  const key=hdOwnedEquipNormalize(name);
  const rows=hdOwnedEquipRows().filter(x=>hdOwnedEquipNormalize(x.name)===key);
  const count=rows.reduce((sum,x)=>sum+Math.max(0,Number(x.count)||0),0);
  const maxStar=rows.reduce((m,x)=>Math.max(0,Number(x.count)||0)>0?Math.max(m,Math.max(0,Number(x.star)||0)):m,0);
  const targetStar=rows.reduce((m,x)=>Math.max(m,Math.max(0,Number(x.targetStar)||0)),0);
  return {owned:count>0,count,maxStar,targetStar,rows};
}
function hdOwnedEquipSort(items){
  return (items||[]).map((item,index)=>({item,index,own:hdOwnedEquipSummary(item.name)})).sort((a,b)=>{
    if(a.own.owned!==b.own.owned)return a.own.owned?-1:1;
    if(a.own.owned&&b.own.owned){
      if(a.own.maxStar!==b.own.maxStar)return b.own.maxStar-a.own.maxStar;
      if(a.own.count!==b.own.count)return b.own.count-a.own.count;
    }
    return a.index-b.index;
  }).map(x=>x.item);
}

if(typeof hdMapEquipPick==='function'){
  const hdOwnedPrevPick=hdMapEquipPick;
  hdMapEquipPick=function(kind,limit=4){
    const expanded=hdOwnedPrevPick(kind,Math.max(20,limit));
    return hdOwnedEquipSort(expanded).slice(0,limit);
  };
}
if(typeof hdMapBasePick==='function'){
  const hdOwnedPrevBasePick=hdMapBasePick;
  hdMapBasePick=function(map,limit=5){
    const expanded=hdOwnedPrevBasePick(map,Math.max(30,limit));
    return hdOwnedEquipSort(expanded).slice(0,limit);
  };
}

if(typeof hdMapEquipCard==='function'){
  hdMapEquipCard=function(item,reason){
    const stats=typeof hdEquipStatText==='function'?hdEquipStatText(item):[];
    const own=hdOwnedEquipSummary(item.name);
    const status=own.owned
      ?`<span class="hd-owned-badge owned">所持 ${own.count}${own.maxStar>0?` ・ 最高★${own.maxStar}`:''}</span>`
      :'<span class="hd-owned-badge missing">未所持</span>';
    const action=own.owned
      ?`<button class="ghost small" type="button" data-hd-owned-open="${hdMapEquipEsc(item.name)}">台帳で確認</button>`
      :`<button class="primary small" type="button" data-hd-equip-add="${hdMapEquipEsc(item.name)}">台帳へ追加</button>`;
    return `<article class="hd-map-equip-card ${own.owned?'hd-owned-card':'hd-missing-card'}" data-hd-owned="${own.owned?'yes':'no'}"><div class="hd-map-equip-card-head"><div><strong>${hdMapEquipEsc(item.name)}</strong><span>${hdMapEquipEsc(item.category||'')}</span></div><button class="ghost small" type="button" data-hd-map-equip-view="${hdMapEquipEsc(item.name)}">図鑑で見る</button></div><div class="hd-owned-status">${status}</div>${stats.length?`<div class="hd-map-equip-stats">${stats.slice(0,7).map(s=>`<span>${hdMapEquipEsc(s)}</span>`).join('')}</div>`:''}<p>${hdMapEquipEsc(reason||item.role||'')}</p><div class="hd-map-equip-actions">${action}</div></article>`;
  };
}

if(typeof hdMapEquipRecommendationsHtml==='function'){
  const hdOwnedPrevRecommendationsHtml=hdMapEquipRecommendationsHtml;
  hdMapEquipRecommendationsHtml=function(map){
    let html=hdOwnedPrevRecommendationsHtml(map);
    const owned=(html.match(/data-hd-owned="yes"/g)||[]).length;
    const missing=(html.match(/data-hd-owned="no"/g)||[]).length;
    const summary=`<div class="hd-owned-summary"><div><strong>手持ち装備で判定</strong><span>候補 ${owned+missing}件中、所持 ${owned}件 / 未所持 ${missing}件</span></div><div class="hd-owned-summary-actions"><button class="ghost small" type="button" data-hd-owned-only>手持ちだけ</button><button class="ghost small" type="button" data-hd-owned-refresh>再判定</button></div></div>`;
    return html.replace('<section class="hd-map-equip-recommend">',`<section class="hd-map-equip-recommend">${summary}`);
  };
}

function hdOwnedOpenLedger(name){
  const target=document.getElementById('equipmentBook');
  if(!target)return;
  if(typeof hdWSShowElement==='function')hdWSShowElement('equipmentBook',true);else if(typeof hdQNJump==='function')hdQNJump('equipmentBook');else target.scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(()=>{
    const input=document.getElementById('equipmentSearch');
    if(input){input.value=name;input.dispatchEvent(new Event('input',{bubbles:true}));input.focus()}
  },250);
}

document.addEventListener('click',e=>{
  const only=e.target.closest?.('[data-hd-owned-only]');
  if(only){
    const root=only.closest('.hd-map-equip-recommend');
    if(root){
      const active=root.classList.toggle('hd-owned-only');
      only.classList.toggle('active',active);
      only.textContent=active?'全候補を表示':'手持ちだけ';
    }
    return;
  }
  if(e.target.closest?.('[data-hd-owned-refresh]')){
    if(typeof hdRenderMapEquipmentRecommendations==='function')hdRenderMapEquipmentRecommendations();
    return;
  }
  const open=e.target.closest?.('[data-hd-owned-open]');
  if(open){hdOwnedOpenLedger(open.dataset.hdOwnedOpen);return}
});

window.addEventListener('storage',e=>{
  if(e.key===HD_OWNED_EQUIP_KEY&&typeof hdRenderMapEquipmentRecommendations==='function')hdRenderMapEquipmentRecommendations();
});
window.addEventListener('hd:equipment-changed',()=>{if(typeof hdRenderMapEquipmentRecommendations==='function')hdRenderMapEquipmentRecommendations()});
