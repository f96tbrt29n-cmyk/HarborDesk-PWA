const HD_QN_PIN_KEY='harbordesk-quick-nav-pins-v1';

function hdQNLoadPins(){try{return JSON.parse(localStorage.getItem(HD_QN_PIN_KEY)||'[]')||[]}catch{return []}}
function hdQNSavePins(v){localStorage.setItem(HD_QN_PIN_KEY,JSON.stringify(v))}
function hdQNEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdQNSections(){
  const seen=new Set(),rows=[];
  for(const el of document.querySelectorAll('section[id], #selectedMapCard')){
    if(!el.id||seen.has(el.id))continue;
    const title=el.querySelector(':scope > .section-head h2, :scope h2, :scope h3, :scope h4')?.textContent?.trim();
    if(!title)continue;
    seen.add(el.id);rows.push({id:el.id,title});
  }
  return rows;
}
function hdQNRenderList(filter=''){
  const host=document.getElementById('hdQNList');if(!host)return;
  const q=String(filter||'').trim().toLowerCase(),pins=hdQNLoadPins(),pinSet=new Set(pins),rows=hdQNSections().filter(x=>!q||x.title.toLowerCase().includes(q)||x.id.toLowerCase().includes(q));
  rows.sort((a,b)=>(pinSet.has(b.id)?1:0)-(pinSet.has(a.id)?1:0));
  host.innerHTML=rows.length?rows.map(x=>`<div class="hd-qn-row ${pinSet.has(x.id)?'pinned':''}"><button type="button" class="hd-qn-jump" data-hd-qn-jump="${hdQNEsc(x.id)}"><span>${hdQNEsc(x.title)}</span><small>${hdQNEsc(x.id)}</small></button><button type="button" class="hd-qn-pin" data-hd-qn-pin="${hdQNEsc(x.id)}" aria-label="${pinSet.has(x.id)?'ピン解除':'ピン留め'}">${pinSet.has(x.id)?'★':'☆'}</button></div>`).join(''):'<div class="empty">該当する機能がないよ。</div>';
}
function hdQNOpen(){
  hdQNEnsure();const d=document.getElementById('hdQuickNavDialog');if(!d)return;
  const input=document.getElementById('hdQNSearch');if(input)input.value='';hdQNRenderList('');
  if(typeof d.showModal==='function'){if(!d.open)d.showModal()}else d.setAttribute('open','');
  setTimeout(()=>input?.focus(),50);
}
function hdQNClose(){const d=document.getElementById('hdQuickNavDialog');if(!d)return;if(typeof d.close==='function'&&d.open)d.close();else d.removeAttribute('open')}
function hdQNJump(id){const target=document.getElementById(id);if(!target)return;hdQNClose();target.scrollIntoView({behavior:'smooth',block:'start'});target.classList.add('hd-qn-flash');setTimeout(()=>target.classList.remove('hd-qn-flash'),900)}
function hdQNTogglePin(id){const pins=hdQNLoadPins(),set=new Set(pins);set.has(id)?set.delete(id):set.add(id);hdQNSavePins([...set]);hdQNRenderList(document.getElementById('hdQNSearch')?.value||'')}
function hdQNEnsure(){
  if(document.getElementById('hdQuickNavButton'))return;
  const btn=document.createElement('button');btn.id='hdQuickNavButton';btn.type='button';btn.className='hd-qn-fab';btn.innerHTML='<span>☰</span><b>機能</b>';btn.addEventListener('click',hdQNOpen);document.body.appendChild(btn);
  const d=document.createElement('dialog');d.id='hdQuickNavDialog';d.className='hd-qn-dialog';d.innerHTML=`<div class="hd-qn-head"><div><div class="eyebrow">QUICK NAV</div><h3>機能をすぐ開く</h3></div><button type="button" class="ghost small" data-hd-qn-close>閉じる</button></div><div class="hd-qn-tools"><input id="hdQNSearch" type="search" placeholder="機能名で検索"><button type="button" class="ghost small" data-hd-qn-top>ページ上部</button></div><div id="hdQNList" class="hd-qn-list"></div><div class="hd-qn-foot">★を付けた機能は上に固定するよ。</div>`;document.body.appendChild(d);
  d.addEventListener('click',e=>{if(e.target===d)hdQNClose()});
  document.getElementById('hdQNSearch')?.addEventListener('input',e=>hdQNRenderList(e.target.value));
  hdQNRenderList();
}

document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-hd-qn-close]')){hdQNClose();return}
  if(e.target.closest?.('[data-hd-qn-top]')){hdQNClose();window.scrollTo({top:0,behavior:'smooth'});return}
  const jump=e.target.closest?.('[data-hd-qn-jump]');if(jump){hdQNJump(jump.dataset.hdQnJump);return}
  const pin=e.target.closest?.('[data-hd-qn-pin]');if(pin){hdQNTogglePin(pin.dataset.hdQnPin);return}
});
window.addEventListener('load',()=>setTimeout(hdQNEnsure,500));
setTimeout(hdQNEnsure,1200);
