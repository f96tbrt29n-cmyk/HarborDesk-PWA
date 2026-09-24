function hdEquipSignedValue(v){const n=Number(v);return Number.isFinite(n)?(n>0?`+${n}`:`${n}`):String(v)}
hdEquipStatText=function(item){const parts=Object.entries(item.stats||{}).map(([k,v])=>`${k}${hdEquipSignedValue(v)}`);if(item.range)parts.push(`射程 ${item.range}`);if(item.radius!=null)parts.push(`半径 ${item.radius}`);return parts};
hdRenderEquipmentCatalog=function(){
 const list=document.getElementById('hdEquipCatalogList');if(!list)return;
 const q=(document.getElementById('hdEquipCatalogSearch')?.value||'').trim().toLowerCase();
 const rows=HD_EQUIPMENT_CATALOG.filter(x=>(hdEquipCatalogFilter==='すべて'||x.category===hdEquipCatalogFilter)&&(!q||`${x.name} ${x.category} ${(x.tags||[]).join(' ')} ${x.role||''} ${x.obtain||''} ${x.update||''} ${x.equip||''} ${x.special||''}`.toLowerCase().includes(q)));
 const dirty=!!q||hdEquipCatalogFilter!=='すべて',reset=document.querySelector('.hd-equip-search [data-hd-equip-reset]');
 if(reset){reset.disabled=!dirty;reset.classList.toggle('is-active',dirty)}
 const summary=document.getElementById('hdEquipCatalogActiveFilters'),chips=[];if(q)chips.push('検索: '+q);if(hdEquipCatalogFilter!=='すべて')chips.push('カテゴリ: '+hdEquipCatalogFilter);
 if(summary){summary.hidden=!chips.length;summary.innerHTML=chips.length?chips.map(x=>`<span>${hdEsc(x)}</span>`).join('')+'<button type="button" class="ghost small" data-hd-equip-reset>クリア</button>':''}
 const count=document.getElementById('hdEquipCatalogCount');if(count)count.textContent=`${rows.length}件 / 全${HD_EQUIPMENT_CATALOG.length}件`;
 list.innerHTML=rows.map(x=>{
  const peekKey=String(x.name||''),peek=hdEquipCatalogPeekKey===peekKey?' hd-peek':'';
  return `<article class="hd-equip-ref-card${peek}" data-hd-equip-peek-key="${hdEsc(peekKey)}"><div class="hd-equip-ref-head"><div><strong>${hdEsc(x.name)}</strong><div class="muted">${hdEsc(x.category)}</div></div><button class="primary small" type="button" data-hd-equip-add="${hdEsc(x.name)}">台帳へ追加</button></div><div class="hd-equip-stats">${hdEquipStatText(x).map(s=>`<span>${hdEsc(s)}</span>`).join('')||'<span>特殊効果装備</span>'}</div><div class="hd-equip-tags">${(x.tags||[]).map(t=>`<span>${hdEsc(t)}</span>`).join('')}</div><p>${hdEsc(x.role||'')}</p><div class="hd-equip-ref-grid"><div><span>改修</span><strong>${hdEsc(x.improve||'未確認')}</strong></div><div><span>入手</span><strong>${hdEsc(x.obtain||'未確認')}</strong></div>${x.equip?`<div class="wide"><span>主な搭載</span><strong>${hdEsc(x.equip)}</strong></div>`:''}${x.special?`<div class="wide"><span>特殊効果・注意</span><strong>${hdEsc(x.special)}</strong></div>`:''}<div class="wide"><span>更新・補足</span><strong>${hdEsc(x.update||'なし')}</strong></div></div><a class="guide-link" href="${hdEquipWikiUrl(x.name)}" target="_blank" rel="noopener">攻略Wikiで詳細 ↗</a></article>`;
 }).join('')||'<div class="empty empty-action"><strong>条件に合う装備がないよ</strong><p>検索語かカテゴリを戻すと一覧へ戻れるよ。</p><button type="button" class="ghost small" data-hd-equip-reset>条件をクリア</button></div>';
};
function hdEquipOpenFn(){try{return typeof openEquipment==='function'?openEquipment:null}catch{return null}}
async function hdEquipOpenWhenReady(item,button=null){
 if(!item)return false;
 let open=hdEquipOpenFn();
 if(!open){
  button?.setAttribute('aria-busy','true');
  try{
   for(let i=0;i<25&&!open;i++){await new Promise(r=>setTimeout(r,80));open=hdEquipOpenFn()}
  }finally{button?.removeAttribute('aria-busy')}
 }
 if(!open){window.hdToast?.('装備登録画面を準備できなかったよ。もう一度試してね','warn');return false}
 open({name:item.name,category:item.category,count:1,star:0,targetStar:String(item.improve||'').includes('可')?10:0,assigned:'',memo:[`用途: ${item.role||''}`,item.equip?`主な搭載: ${item.equip}`:'',item.special?`特殊効果・注意: ${item.special}`:'',`入手: ${item.obtain||''}`,item.update||''].filter(Boolean).join('\n')});
 return true;
}
document.addEventListener('click',e=>{
 const a=e.target.closest?.('[data-hd-equip-add]');if(!a)return;
 const item=HD_EQUIPMENT_CATALOG.find(x=>x.name===a.dataset.hdEquipAdd);if(!item)return;
 e.preventDefault();e.stopImmediatePropagation();
 hdEquipOpenWhenReady(item,a);
},true);
window.addEventListener('load',()=>setTimeout(()=>{if(typeof hdRenderEquipmentCatalog==='function')hdRenderEquipmentCatalog()},120));
