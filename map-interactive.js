const HD_MAP_KIND_INFO={
 start:{label:'出撃地点',hint:'ここから出撃するよ。'},
 boss:{label:'ボスマス',hint:'攻略目標。ゲージ海域では撃破回数や段階条件を確認。'},
 goal:{label:'到達地点',hint:'ボス撃破ではなく到達が目的になる地点。'},
 item:{label:'資源・アイテム',hint:'資源やアイテムを獲得できるマス。'},
 sub:{label:'潜水戦',hint:'対潜装備や先制対潜が有効。'},
 air:{label:'航空戦・空襲',hint:'制空・対空カットイン・防空を意識。'},
 night:{label:'夜戦',hint:'夜戦装備や夜戦火力を意識。大破進軍はしない。'},
 vortex:{label:'うずしお',hint:'燃料・弾薬消費に注意。電探で軽減できる場合がある。'},
 safe:{label:'戦闘なし',hint:'戦闘が発生しない、または分岐・気のせい系のマス。'},
 normal:{label:'通常戦・分岐',hint:'通常戦闘またはルート分岐として扱うマス。'}
};

// 個別マスの敵編成・制空・分岐条件を正確に確認できたものから追加していく拡張用データ。
const HD_NODE_DETAIL_OVERRIDES={};

function hdInteractiveMap(){return typeof selectedMap!=='undefined'&&selectedMap?selectedMap:null}
function hdInteractiveGraph(map){return typeof HD_MAP_GRAPHS!=='undefined'?HD_MAP_GRAPHS[map]:null}
function hdInteractiveKind(map,label){const g=hdInteractiveGraph(map);return g&&typeof hdMapKind==='function'?hdMapKind(g,label):'normal'}
function hdNodeLabel(group){return group?.querySelector('text')?.textContent?.trim()||''}
function hdEnsureNodeInfoHost(){
  const pane=document.querySelector('[data-map-pane="map"]');if(!pane)return null;
  let host=pane.querySelector('#hdMapNodeInfo');
  if(!host){host=document.createElement('div');host.id='hdMapNodeInfo';host.className='hd-map-node-info';pane.appendChild(host)}
  return host;
}
function hdNodeLinks(map,label){
  const g=hdInteractiveGraph(map);if(!g)return {next:[],prev:[]};
  return {
    next:g.edges.filter(([a])=>a===label).map(([,b])=>b),
    prev:g.edges.filter(([,b])=>b===label).map(([a])=>a)
  };
}
function hdNodeOverride(map,label){return HD_NODE_DETAIL_OVERRIDES?.[map]?.[label]||{}}
function hdCurrentMapDetail(map){return typeof MAP_DETAILS!=='undefined'?MAP_DETAILS[map]||{}:{}}
function hdNodeBranchText(map,label,next,override){
  if(override.branch)return override.branch;
  if(next.length===0)return 'この先の分岐なし。';
  if(next.length===1)return `${label} → ${next[0]} へ進行。`;
  return `${next.join(' / ')} へ分岐。固定条件・確率分岐は「ルート」タブで確認してね。`;
}
function hdNodeEnemyText(kind,override){
  if(override.enemy)return override.enemy;
  if(kind==='start'||kind==='safe'||kind==='item'||kind==='vortex'||kind==='goal')return '戦闘編成なし。';
  return '敵編成詳細は未登録。誤情報を避けるため、確認済みデータだけ順次追加するよ。';
}
function hdNodeAirText(map,kind,override){
  if(override.air)return override.air;
  const d=hdCurrentMapDetail(map);
  if(kind==='air')return d.air||'航空戦マス。制空と対空装備を確認。';
  return d.air||'海域全体の制空・装備メモは「装備」タブで確認。';
}
function hdShowNodeInfo(map,label){
  const host=hdEnsureNodeInfoHost();if(!host)return;
  const kind=hdInteractiveKind(map,label),info=HD_MAP_KIND_INFO[kind]||HD_MAP_KIND_INFO.normal;
  const links=hdNodeLinks(map,label),override=hdNodeOverride(map,label);
  const next=links.next.length?links.next.join(' / '):'なし';
  const prev=links.prev.length?links.prev.join(' / '):'出撃地点';
  const enemy=hdNodeEnemyText(kind,override);
  const air=hdNodeAirText(map,kind,override);
  const branch=hdNodeBranchText(map,label,links.next,override);
  host.innerHTML=`<div class="eyebrow">MAP NODE DETAIL</div>
    <div class="hd-map-node-info-title"><strong>${label}</strong><span>${info.label}</span></div>
    <p class="hd-node-summary">${info.hint}</p>
    <div class="hd-node-detail-grid">
      <div><span>進入元</span><strong>${prev}</strong></div>
      <div><span>進行先</span><strong>${next}</strong></div>
      <div class="wide"><span>分岐・進行</span><strong>${branch}</strong></div>
      <div class="wide"><span>敵編成</span><strong>${enemy}</strong></div>
      <div class="wide"><span>制空・装備</span><strong>${air}</strong></div>
    </div>
    <div class="hd-node-actions"><button class="ghost small" type="button" data-open-route-tab>ルート条件を見る</button><a class="guide-link" href="${wikiMapUrl(map)}" target="_blank" rel="noopener">Wikiで最新情報 ↗</a></div>`;
}
function hdShortestPath(map){
  const g=hdInteractiveGraph(map);if(!g)return [];
  const starts=[...new Set(g.edges.flat())].filter(x=>x==='S'||x==='S1'||x==='S2');
  const target=g.boss||g.goal;if(!target)return [];
  const q=starts.map(s=>[s,[s]]),seen=new Set(starts);
  while(q.length){const [n,path]=q.shift();if(n===target)return path;for(const [a,b] of g.edges){if(a===n&&!seen.has(b)){seen.add(b);q.push([b,[...path,b]])}}}
  return [];
}
function hdClearRouteHighlight(){document.querySelectorAll('.hd-map-route').forEach(p=>p.classList.remove('highlight'))}
function hdHighlightShortest(map){
  hdClearRouteHighlight();const path=hdShortestPath(map);if(path.length<2)return;
  const pane=document.querySelector('[data-map-pane="map"]');
  const paths=[...(pane?.querySelectorAll('.hd-map-route')||[])],g=hdInteractiveGraph(map);if(!g)return;
  const wanted=new Set(path.slice(0,-1).map((a,i)=>`${a}>${path[i+1]}`));
  paths.forEach((el,i)=>{const edge=g.edges[i];if(edge&&wanted.has(`${edge[0]}>${edge[1]}`))el.classList.add('highlight')});
  const host=hdEnsureNodeInfoHost();if(host)host.innerHTML=`<div class="eyebrow">ROUTE GUIDE</div><div class="hd-map-node-info-title"><strong>${path.join(' → ')}</strong><span>構造上の最短経路</span></div><p>これはグラフ上の最短経路表示で、実際の固定条件や推奨編成を保証するものではないよ。出撃前に「ルート」タブも確認してね。</p><div class="hd-node-actions"><button class="ghost small" type="button" data-open-route-tab>ルート条件を見る</button></div>`;
}
function hdOpenRouteTab(){
  const btn=document.querySelector('[data-map-tab="route"]');if(!btn)return;
  btn.click();
}
function hdEnhanceMapPane(){
  const pane=document.querySelector('[data-map-pane="map"]');if(!pane||pane.dataset.hdEnhanced==='1')return;
  const imageSection=pane.querySelector('.hd-map-image-section');if(!imageSection)return;
  pane.dataset.hdEnhanced='1';
  const tools=document.createElement('div');tools.className='hd-map-tools';
  tools.innerHTML=`<div class="hd-map-legend"><span data-kind="normal">通常</span><span data-kind="sub">潜水</span><span data-kind="air">航空</span><span data-kind="night">夜戦</span><span data-kind="vortex">うずしお</span><span data-kind="item">資源</span><span data-kind="boss">ボス</span></div><button class="ghost small" type="button" id="hdRouteHighlight">最短経路を強調</button>`;
  imageSection.prepend(tools);
  tools.querySelector('#hdRouteHighlight')?.addEventListener('click',()=>hdHighlightShortest(hdInteractiveMap()));
  hdEnsureNodeInfoHost();
}

// Capture phase: node taps show details instead of triggering the parent map-zoom button.
document.addEventListener('click',e=>{
  const group=e.target.closest?.('[data-map-pane="map"] .hd-map-node');if(!group)return;
  e.preventDefault();e.stopPropagation();
  const map=hdInteractiveMap();if(!map)return;
  const raw=hdNodeLabel(group);let label=raw;
  if(raw==='B')label=hdInteractiveGraph(map)?.boss||'B';
  else if(raw==='G')label=hdInteractiveGraph(map)?.goal||'G';
  else if(raw==='S')label='S';
  hdShowNodeInfo(map,label);
},true);

document.addEventListener('click',e=>{if(e.target.closest('[data-open-route-tab]'))hdOpenRouteTab()});
document.addEventListener('click',e=>{if(e.target.closest('[data-map-tab="map"]'))setTimeout(hdEnhanceMapPane,0)});

const hdInteractivePrevRender=renderMapPicker;
renderMapPicker=function(){hdInteractivePrevRender();setTimeout(hdEnhanceMapPane,0)};
setTimeout(hdEnhanceMapPane,0);
