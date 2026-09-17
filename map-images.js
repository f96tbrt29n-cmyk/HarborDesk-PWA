function hdMapSeed(map){
  return String(map).split('').reduce((a,c)=>((a*31+c.charCodeAt(0))>>>0),2166136261)>>>0;
}
function hdMapRand(seed){
  let s=seed>>>0;
  return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
}
function hdMapNodeCount(map){
  if(map==='5-6')return 10;
  const n=Number(String(map).split('-')[1]||1);
  if(n>=5)return 9;
  if(n===4)return 8;
  if(n===3)return 7;
  return 6;
}
function hdMapSvg(map,detail,large=false){
  const rand=hdMapRand(hdMapSeed(map));
  const count=hdMapNodeCount(map);
  const w=large?920:760,h=large?560:430;
  const padX=70,padY=70;
  const nodes=[];
  nodes.push({x:padX,y:h/2,label:'START',kind:'start'});
  for(let i=1;i<count-1;i++){
    const t=i/(count-1);
    const x=padX+t*(w-padX*2)+(rand()-.5)*34;
    const band=(i%2===0?-1:1);
    const y=h/2+band*(58+rand()*68)+(rand()-.5)*36;
    nodes.push({x,y,label:String.fromCharCode(64+i),kind:'node'});
  }
  nodes.push({x:w-padX,y:h/2+(rand()-.5)*70,label:'BOSS',kind:'boss'});

  const links=[];
  for(let i=0;i<nodes.length-1;i++)links.push([i,i+1]);
  if(nodes.length>=7){links.push([1,3]);links.push([2,4]);}
  if(nodes.length>=9){links.push([3,6]);links.push([4,7]);}
  if(map==='5-6'){links.push([2,5]);links.push([5,8]);}

  const paths=links.map(([a,b])=>{
    const p=nodes[a],q=nodes[b];
    const cx=(p.x+q.x)/2, cy=(p.y+q.y)/2-18;
    return `<path d="M ${p.x} ${p.y} Q ${cx} ${cy} ${q.x} ${q.y}" class="hd-map-route"/>`;
  }).join('');
  const circles=nodes.map((n,i)=>{
    const cls=n.kind==='boss'?'boss':n.kind==='start'?'start':'normal';
    const r=n.kind==='boss'?25:n.kind==='start'?23:19;
    const text=n.kind==='start'?'S':n.kind==='boss'?'B':n.label;
    return `<g class="hd-map-node ${cls}"><circle cx="${n.x}" cy="${n.y}" r="${r}"/><text x="${n.x}" y="${n.y+5}" text-anchor="middle">${text}</text></g>`;
  }).join('');
  const islands=Array.from({length:7},(_,i)=>{
    const x=80+rand()*(w-160),y=55+rand()*(h-110),rx=20+rand()*48,ry=10+rand()*28,rot=Math.round(rand()*170);
    return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})" class="hd-map-island"/>`;
  }).join('');
  const name=hdMapEsc(detail?.name||map);
  return `<svg class="hd-map-svg${large?' large':''}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${hdMapEsc(map)} ${name} 海域概略図">
    <defs><linearGradient id="sea-${map.replace('-','')}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#0d3148"/><stop offset="1" stop-color="#081b2a"/></linearGradient></defs>
    <rect width="${w}" height="${h}" rx="22" fill="url(#sea-${map.replace('-','')})"/>
    <g opacity=".28">${islands}</g>
    <g>${paths}</g><g>${circles}</g>
    <text x="34" y="38" class="hd-map-svg-title">${hdMapEsc(map)} ${name}</text>
    <text x="${w-34}" y="38" text-anchor="end" class="hd-map-svg-badge">HarborDesk 概略図</text>
  </svg>`;
}
function hdMapImageHtml(map,detail){
  const route=detail?.route||'ルート情報を整理中';
  return `<section class="hd-map-image-section">
    <button class="hd-map-image-button" type="button" data-hd-map-open="${hdMapEsc(map)}" aria-label="${hdMapEsc(map)}の海域概略図を拡大表示">
      ${hdMapSvg(map,detail,false)}
      <span class="hd-map-zoom-label">タップで拡大</span>
    </button>
    <div class="map-tab-card"><b>ルートメモ</b><p>${hdMapEsc(route)}</p></div>
    <div class="hd-map-image-note">※この図はHarborDeskが作成する攻略補助用の概略図で、ゲーム内公式マップの配置をそのまま再現した画像ではないよ。正確な分岐・敵編成はWikiで確認してね。</div>
  </section>`;
}
function hdEnsureMapDialog(){
  let d=document.getElementById('hdMapImageDialog');
  if(d)return d;
  d=document.createElement('dialog');
  d.id='hdMapImageDialog';
  d.className='hd-map-dialog';
  d.innerHTML='<div class="hd-map-dialog-head"><strong id="hdMapDialogTitle">海域マップ</strong><button class="ghost small" type="button" id="hdMapDialogClose">閉じる</button></div><div id="hdMapDialogBody"></div>';
  document.body.appendChild(d);
  document.getElementById('hdMapDialogClose').onclick=()=>d.close();
  d.addEventListener('click',e=>{if(e.target===d)d.close()});
  return d;
}
document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-hd-map-open]');if(!btn)return;
  const map=btn.dataset.hdMapOpen;const detail=typeof MAP_DETAILS!=='undefined'?MAP_DETAILS[map]:null;
  const d=hdEnsureMapDialog();
  document.getElementById('hdMapDialogTitle').textContent=`${map} ${detail?.name||''}`;
  document.getElementById('hdMapDialogBody').innerHTML=hdMapSvg(map,detail,true);
  d.showModal();
});
