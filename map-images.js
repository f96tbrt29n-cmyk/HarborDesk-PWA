const HD_MAP_GRAPHS={
'1-1':{edges:[['S','A'],['A','B'],['A','C']],boss:'C'},
'1-2':{edges:[['S','A'],['S','B'],['A','D'],['A','E'],['B','C'],['C','E']],boss:'E',items:['B']},
'1-3':{edges:[['S','A'],['S','C'],['A','D'],['A','E'],['D','B'],['B','E'],['C','F'],['E','F'],['F','H'],['F','J'],['H','G'],['H','I'],['H','J']],boss:'J',items:['D','G'],vortex:['H'],safe:['A','B','I']},
'1-4':{edges:[['S','A'],['S','B'],['A','D'],['B','C'],['B','D'],['C','F'],['D','E'],['D','G'],['E','H'],['F','E'],['F','H'],['F','I'],['G','J'],['H','L'],['I','L'],['J','K'],['J','L']],boss:'L',items:['C','E','G'],safe:['A','F','K']},
'1-5':{edges:[['S','A'],['A','B'],['A','C'],['C','B'],['C','J'],['B','D'],['D','E'],['D','F'],['E','C'],['E','J'],['F','G'],['F','I'],['G','H'],['G','J'],['H','J']],boss:'J',sub:['A','C','D','F','H']},
'1-6':{edges:[['S','A'],['A','E'],['A','C'],['C','H'],['C','K'],['E','F'],['F','B'],['F','G'],['G','K'],['H','K'],['K','J'],['J','N'],['K','M'],['M','N']],goal:'N',air:['C','K']},
'2-1':{edges:[['S','C'],['S','D'],['C','E'],['D','E'],['E','F'],['E','G'],['F','H'],['G','H']],boss:'H'},
'2-2':{edges:[['S','A'],['S','B'],['A','C'],['A','D'],['C','E'],['D','E'],['B','E'],['E','F'],['E','G'],['F','H'],['G','H']],boss:'H',items:['B','C']},
'2-3':{edges:[['S','A'],['S','B'],['A','C'],['A','D'],['B','E'],['C','F'],['D','F'],['D','G'],['E','G'],['F','H'],['G','H'],['H','J'],['H','I'],['I','J']],boss:'J',items:['B','D']},
'2-4':{edges:[['S','B'],['B','C'],['B','G'],['C','F'],['C','G'],['F','A'],['F','J'],['G','H'],['H','L'],['H','I'],['I','E'],['I','K'],['E','D'],['J','L'],['J','M'],['K','L'],['K','N'],['K','O'],['L','M'],['L','P'],['M','P']],boss:'P',items:['A','D','G','N'],vortex:['C'],safe:['H','J','K','O']},
'2-5':{edges:[['S','A'],['S','B'],['A','C'],['A','D'],['B','E'],['C','E'],['D','F'],['E','F'],['E','G'],['F','H'],['G','H'],['H','I'],['H','J'],['I','O'],['J','O']],boss:'O'},
'3-1':{edges:[['S','A'],['S','C'],['A','B'],['A','D'],['C','D'],['D','E'],['D','F'],['E','G'],['F','G']],boss:'G'},
'3-2':{edges:[['S','C'],['C','E'],['C','G'],['E','F'],['G','F'],['G','H'],['H','F'],['F','L']],boss:'L',vortex:['G']},
'3-3':{edges:[['S','A'],['S','B'],['A','C'],['A','D'],['B','E'],['C','F'],['D','F'],['D','G'],['E','G'],['F','H'],['G','H'],['H','I'],['H','J']],boss:'J'},
'3-4':{edges:[['S','A'],['S','B'],['A','C'],['A','D'],['B','E'],['B','F'],['C','G'],['D','G'],['D','H'],['E','H'],['F','I'],['G','J'],['H','J'],['I','J']],boss:'J',vortex:['D']},
'3-5':{edges:[['S','A'],['S','B'],['A','C'],['A','D'],['B','E'],['C','F'],['D','F'],['D','G'],['E','G'],['F','H'],['G','K'],['H','K']],boss:'K',air:['D','G']},
'4-1':{edges:[['S','A'],['S','B'],['A','C'],['B','D'],['C','E'],['D','E'],['E','F'],['E','G'],['F','H'],['G','H']],boss:'H',sub:['C']},
'4-2':{edges:[['S','A'],['S','B'],['A','C'],['A','D'],['B','D'],['C','G'],['D','E'],['D','F'],['E','G'],['F','H'],['G','L'],['H','L']],boss:'L'},
'4-3':{edges:[['S','A'],['S','C'],['A','B'],['A','D'],['C','D'],['D','F'],['D','H'],['F','K'],['H','N'],['K','N']],boss:'N',sub:['D']},
'4-4':{edges:[['S','A'],['A','E'],['A','B'],['B','D'],['E','I'],['D','F'],['F','H'],['I','K'],['H','K']],boss:'K',sub:['H']},
'4-5':{edges:[['S','A'],['S','C'],['A','D'],['C','D'],['D','H'],['D','F'],['F','J'],['H','T'],['J','T']],boss:'T',sub:['D']},
'5-1':{edges:[['S','A'],['S','B'],['A','C'],['B','E'],['C','F'],['E','F'],['F','G'],['F','H'],['G','I'],['H','I']],boss:'I',night:['F','G']},
'5-2':{edges:[['S','A'],['S','B'],['A','C'],['B','C'],['C','D'],['C','E'],['D','F'],['E','F'],['F','G']],boss:'G'},
'5-3':{edges:[['S','D'],['S','G'],['D','G'],['D','F'],['G','I'],['F','I'],['I','J'],['J','K'],['K','Q']],boss:'Q',night:['I','J','K']},
'5-4':{edges:[['S','A'],['S','B'],['A','D'],['B','E'],['D','F'],['E','F'],['F','G'],['F','H'],['G','I'],['H','I'],['I','J']],boss:'J',night:['H']},
'5-5':{edges:[['START','B'],['START','A'],['A','D'],['B','K'],['B','F'],['D','H'],['F','J'],['H','N'],['J','M'],['K','P'],['M','S'],['N','S'],['P','S']],boss:'S',night:['N','P']},
'5-6':{edges:[['S','A'],['A','B'],['B','C'],['C','G1'],['G1','R'],['R','D'],['D','E'],['E','N'],['N','F'],['F','G'],['G','Z']],boss:'Z',goal:'G1',air:['R'],note:'輸送→R到達ギミック→第2戦力→最終戦力の段階攻略を簡略表示'},
'6-1':{edges:[['S','A'],['S','B'],['A','C'],['B','D'],['C','E'],['D','E'],['E','F'],['E','G'],['F','K'],['G','K']],boss:'K'},
'6-2':{edges:[['S','B'],['S','C'],['B','D'],['C','D'],['D','E'],['D','F'],['E','I'],['F','H'],['H','K'],['I','K']],boss:'K'},
'6-3':{edges:[['S','A'],['A','B'],['A','C'],['B','D'],['C','D'],['D','E'],['D','F'],['E','G'],['F','G']],boss:'G'},
'6-4':{edges:[['S1','A'],['S1','B'],['S2','M'],['A','D'],['B','D'],['D','C'],['D','F'],['M','K'],['K','J'],['J','I'],['I','N'],['F','N'],['C','N']],boss:'N',air:['D','J']},
'6-5':{edges:[['S','A'],['S','B'],['A','C'],['B','F'],['C','D'],['D','G'],['F','I'],['G','M'],['I','J'],['J','M']],boss:'M',air:['D','G','J']},
'7-1':{edges:[['S','D'],['D','E'],['D','F'],['E','G'],['F','G'],['G','H'],['G','K'],['H','K']],boss:'K',sub:['D','E','F']},
'7-2':{edges:[['S','A'],['A','B'],['B','C'],['C','G1'],['S2','D'],['D','E'],['E','F'],['F','I'],['I','G2']],boss:'G2',goal:'G1',sub:['A','B']},
'7-3':{edges:[['S','A'],['A','C'],['C','D'],['D','G1'],['S2','B'],['B','E'],['E','F'],['F','G'],['G','P']],boss:'P',goal:'G1'},
'7-4':{edges:[['S','A'],['A','B'],['A','C'],['B','D'],['C','E'],['D','F'],['E','F'],['F','J'],['J','K'],['K','P']],boss:'P',sub:['A','B','C','D'],air:['J']},
'7-5':{edges:[['S','A'],['A','B'],['B','C'],['C','G1'],['G1','D'],['D','E'],['E','M'],['M','Q'],['Q','G2'],['G2','R'],['R','T']],boss:'T',goal:'G1',note:'第1ゲージ→ギミック→第2ゲージ→第3ゲージの段階攻略を簡略表示'}
};

function hdMapEsc2(s){return typeof esc==='function'?esc(s):String(s??'')}
function hdMapStartLabels(graph){
 const edges=Array.isArray(graph?.edges)?graph.edges:[],incoming=new Set(edges.map(x=>x[1]));
 return [...new Set(edges.map(x=>x[0]).filter(Boolean))].filter(x=>!incoming.has(x));
}
function hdMapIsStartLabel(graph,label){return hdMapStartLabels(graph).includes(label)}
window.hdMapStartLabels=hdMapStartLabels;
window.hdMapIsStartLabel=hdMapIsStartLabel;
function hdMapKind(graph,label){
 if(hdMapIsStartLabel(graph,label))return 'start';
 if(graph.boss===label)return 'boss';
 if(graph.goal===label)return 'goal';
 if((graph.items||[]).includes(label))return 'item';
 if((graph.sub||[]).includes(label))return 'sub';
 if((graph.air||[]).includes(label))return 'air';
 if((graph.night||[]).includes(label))return 'night';
 if((graph.vortex||[]).includes(label))return 'vortex';
 if((graph.safe||[]).includes(label))return 'safe';
 return 'normal';
}
function hdMapLevels(graph){
 const labels=[...new Set(graph.edges.flat())];
 const starts=hdMapStartLabels(graph);
 const level={};starts.forEach(s=>level[s]=0);
 for(let pass=0;pass<labels.length*2;pass++){
  let changed=false;
  for(const [a,b] of graph.edges){
   if(level[a]!=null){const n=level[a]+1;if(level[b]==null||n<level[b]){level[b]=n;changed=true}}
  }
  if(!changed)break;
 }
 labels.forEach(x=>{if(level[x]==null)level[x]=1});
 return {labels,level};
}
function hdMapLayout(graph,w,h){
 const {labels,level}=hdMapLevels(graph);
 const max=Math.max(...Object.values(level),1);
 const groups={};labels.forEach(l=>(groups[level[l]]??=[]).push(l));
 const pos={};
 Object.entries(groups).forEach(([lv,arr])=>{
  arr.sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  const x=60+(Number(lv)/max)*(w-120);
  arr.forEach((label,i)=>{
   const gap=(h-120)/(arr.length+1);
   pos[label]={x,y:60+gap*(i+1)};
  });
 });
 return pos;
}
function hdMapSvg(map,detail,large=false){
 const graph=HD_MAP_GRAPHS[map]||{edges:[['S','A'],['A','B']],boss:'B'};
 const w=large?980:780,h=large?620:470;
 const pos=hdMapLayout(graph,w,h);
 const routes=graph.edges.map(([a,b])=>{
  const p=pos[a],q=pos[b]; if(!p||!q)return '';
  const cx=(p.x+q.x)/2;
  return `<path d="M ${p.x} ${p.y} C ${cx} ${p.y}, ${cx} ${q.y}, ${q.x} ${q.y}" class="hd-map-route"/>`;
 }).join('');
 const nodes=Object.keys(pos).map(label=>{
  const p=pos[label],kind=hdMapKind(graph,label);
  const shown=kind==='start'?'S':kind==='boss'?'B':kind==='goal'?'G':label;
  return `<g class="hd-map-node ${kind}" data-hd-node-id="${hdMapEsc2(label)}"><circle cx="${p.x}" cy="${p.y}" r="${kind==='boss'?25:kind==='start'?22:19}"/><text x="${p.x}" y="${p.y+5}" text-anchor="middle">${hdMapEsc2(shown)}</text></g>`;
 }).join('');
 const name=hdMapEsc2(detail?.name||map);
 return `<svg class="hd-map-svg${large?' large':''}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${hdMapEsc2(map)} ${name} 海域構造図">
 <defs><linearGradient id="sea-${map.replace('-','')}" x1="0" x2="1"><stop offset="0" stop-color="#0d3148"/><stop offset="1" stop-color="#081b2a"/></linearGradient></defs>
 <rect width="${w}" height="${h}" rx="22" fill="url(#sea-${map.replace('-','')})"/>
 <g>${routes}</g><g>${nodes}</g>
 <text x="30" y="36" class="hd-map-svg-title">${hdMapEsc2(map)} ${name}</text>
 <text x="${w-30}" y="36" text-anchor="end" class="hd-map-svg-badge">海域構造寄せ</text>
 </svg>`;
}
// The supplied KC3Kai mini-map assets preserve their source pixels and aspect ratio.
const HD_MAP_IMAGE_SOURCE='https://github.com/KC3Kai/KC3Kai/tree/6b0534d291c27220da1b6fe454e91fc96a6a7b27/src/assets/img/client/minimaps';
const HD_MAP_STAGE_KEY='harbordesk-map-stage-v1';
const HD_MAP_STAGE_INFO={
 '5-6':[
  {id:'1',label:'第一ゲージ',title:'輸送ゲージ',target:'G',detail:'Gマスの輸送ゲージ。TP最大値は約280。第一段階を完了すると次の攻略段階へ進む。'},
  {id:'2',label:'第二ゲージ',title:'R到達ギミック → 戦力ゲージ',target:'N',detail:'Rマスへ1回到達するとI〜Q2が出現。Nマスのボス旗艦を2回撃沈してゲージ破壊。'},
  {id:'3',label:'第三ゲージ',title:'最終戦力ゲージ',target:'Z',detail:'Zマスのボス旗艦を3回撃沈して海域クリア。'}
 ],
 '7-2':[
  {id:'1',label:'第一ゲージ',title:'戦力ゲージ',target:'G',detail:'Gマスのボス旗艦を3回撃沈。破壊後にH〜Mマスが出現する。'},
  {id:'2',label:'第二ゲージ',title:'最終戦力ゲージ',target:'M',detail:'Mマスのボス旗艦を4回撃沈して海域クリア。'}
 ],
 '7-3':[
  {id:'1',label:'第一ゲージ',title:'戦力ゲージ',target:'E',detail:'Eマスのボス旗艦を3回撃沈。破壊後にG〜Pマスが出現する。'},
  {id:'2',label:'第二ゲージ',title:'最終戦力ゲージ',target:'P',detail:'Pマスのボス旗艦を4回撃沈して海域クリア。'}
 ],
 '7-5':[
  {id:'1',label:'第一ゲージ',title:'戦力ゲージ',target:'K',detail:'Kマスのボス旗艦を2回撃沈。破壊後にL〜Qマスが出現する。'},
  {id:'2',label:'第二ゲージ',title:'戦力ゲージ＋第三ゲージ出現ギミック',target:'Q',detail:'Qマスの陸上型ボス旗艦を3回破壊。第三ゲージ出現にはMマスS勝利1回が必要。'},
  {id:'3',label:'第三ゲージ',title:'最終戦力ゲージ',target:'T',detail:'Tマスのボス旗艦を3回撃沈して海域クリア。'}
 ]
};
function hdMapStageLoad(){
 try{return JSON.parse(localStorage.getItem(HD_MAP_STAGE_KEY)||'{}')}catch{return {}}
}
function hdMapStageSave(map,id){
 const data=hdMapStageLoad();data[map]=String(id);localStorage.setItem(HD_MAP_STAGE_KEY,JSON.stringify(data));
}
function hdMapStageCurrent(map){
 const stages=HD_MAP_STAGE_INFO[map]||[];if(!stages.length)return null;
 const saved=hdMapStageLoad()[map];
 return stages.find(x=>x.id===saved)||stages[0];
}
function hdMapStageHtml(map){
 const stages=HD_MAP_STAGE_INFO[map]||[];if(!stages.length)return '';
 const active=hdMapStageCurrent(map)||stages[0];
 return `<section class="hd-map-stage-shell" aria-label="${hdMapEsc2(map)} 攻略段階">
  <div class="hd-map-stage-head"><div><div class="eyebrow">MAP PHASE</div><strong>攻略段階</strong></div><span>${stages.length}段階</span></div>
  <div class="hd-map-stage-tabs" role="tablist" aria-label="攻略段階を選択">${stages.map(s=>`<button type="button" class="hd-map-stage-btn ${s.id===active.id?'active':''}" data-hd-map-stage="${hdMapEsc2(map)}" data-hd-stage-id="${s.id}" role="tab" aria-selected="${s.id===active.id?'true':'false'}">${hdMapEsc2(s.label)}</button>`).join('')}</div>
  <article class="map-tab-card hd-map-stage-card"><div><span>目標マス</span><strong>${hdMapEsc2(active.target)}</strong></div><div><b>${hdMapEsc2(active.title)}</b><p>${hdMapEsc2(active.detail)}</p></div></article>
  <div class="hd-map-image-note">※段階ボタンは攻略状態の説明を切り替えるもの。下のKC3改参照画像は元データを改変せず表示しているため、段階ごとの追加マスは最新Wikiの実図でも確認してね。</div>
 </section>`;
}
function hdMapReferenceImage(map,detail){
 if(!Object.prototype.hasOwnProperty.call(HD_MAP_GRAPHS,map))return '<p class="empty">この海域の画像は未登録です。</p>';
 return `<img class="hd-map-reference-image" src="./assets/maps/${map}.png" alt="${hdMapEsc2(map)} ${hdMapEsc2(detail?.name||'')} 海域マップ（KC3改掲載画像）" decoding="async">`;
}
function hdMapImageHtml(map,detail){
 return `<section class="hd-map-image-section" data-hd-map-reference="${hdMapEsc2(map)}">
 ${hdMapStageHtml(map)}
 <button class="hd-map-image-button" type="button" data-hd-map-open="${hdMapEsc2(map)}" aria-label="${hdMapEsc2(map)}の海域マップを拡大表示">${hdMapReferenceImage(map,detail)}<span class="hd-map-zoom-label">タップで拡大</span></button>
 <div class="map-tab-card"><b>ルートメモ</b><p>${hdMapEsc2(detail?.route||'ルート情報を整理中')}</p></div>
 <details class="hd-map-structure-guide"><summary><span>操作用の構造ガイド</span><small>マス詳細・最短経路を見る</small></summary><div class="hd-map-structure-body">${hdMapSvg(map,detail,false)}</div></details>
 <div class="hd-map-image-note">KC3改の海域マップ画像を主表示にしているよ。下の構造ガイドはマス詳細や最短経路を操作するためのHarborDesk簡略図で、実際の地形・分岐は上の画像と最新攻略情報を優先してね。複数ゲージの海域は掲載画像の開放段階を示します。</div>
 <div><a class="guide-link" href="${HD_MAP_IMAGE_SOURCE}" target="_blank" rel="noopener">画像の出典 ↗</a> <a class="guide-link" href="${wikiMapUrl(map)}" target="_blank" rel="noopener">海域の攻略・開放条件 ↗</a></div>
 </section>`;
}
function hdEnsureMapDialog(){
 let d=document.getElementById('hdMapImageDialog');if(d)return d;
 d=document.createElement('dialog');d.id='hdMapImageDialog';d.className='hd-map-dialog';
 d.innerHTML='<div class="hd-map-dialog-head"><strong id="hdMapDialogTitle">海域マップ</strong><button class="ghost small" type="button" id="hdMapDialogClose">閉じる</button></div><div id="hdMapDialogBody"></div>';
 document.body.appendChild(d);document.getElementById('hdMapDialogClose').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d)d.close()});return d;
}
document.addEventListener('click',e=>{
 const btn=e.target.closest('[data-hd-map-stage][data-hd-stage-id]');if(!btn)return;
 const map=btn.dataset.hdMapStage,id=btn.dataset.hdStageId;if(!map||!id)return;
 hdMapStageSave(map,id);
 const shell=btn.closest('.hd-map-stage-shell'),stages=HD_MAP_STAGE_INFO[map]||[],active=stages.find(x=>x.id===id);if(!shell||!active)return;
 shell.querySelectorAll('.hd-map-stage-btn').forEach(x=>{const on=x.dataset.hdStageId===id;x.classList.toggle('active',on);x.setAttribute('aria-selected',on?'true':'false')});
 const card=shell.querySelector('.hd-map-stage-card');if(card)card.innerHTML=`<div><span>目標マス</span><strong>${hdMapEsc2(active.target)}</strong></div><div><b>${hdMapEsc2(active.title)}</b><p>${hdMapEsc2(active.detail)}</p></div>`;
});
document.addEventListener('click',e=>{const btn=e.target.closest('[data-hd-map-open]');if(!btn)return;const map=btn.dataset.hdMapOpen;const detail=typeof MAP_DETAILS!=='undefined'?MAP_DETAILS[map]:null;const d=hdEnsureMapDialog();document.getElementById('hdMapDialogTitle').textContent=`${map} ${detail?.name||''}`;document.getElementById('hdMapDialogBody').innerHTML=hdMapReferenceImage(map,detail);d.showModal()});
