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
function hdNodeLabel(group,map){
  const direct=group?.dataset?.hdNodeId;if(direct)return direct;
  const g=hdInteractiveGraph(map);
  if(g&&typeof hdMapLayout==='function'){
    const svg=group?.closest?.('svg');
    const groups=[...(svg?.querySelectorAll?.('.hd-map-node')||[])];
    const idx=groups.indexOf(group);
    const labels=Object.keys(hdMapLayout(g,780,470));
    if(idx>=0&&labels[idx])return labels[idx];
  }
  return group?.querySelector('text')?.textContent?.trim()||'';
}
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
function hdMapAdvanced(map){return typeof HD_MAP_ADVANCED_DATA!=='undefined'?HD_MAP_ADVANCED_DATA[map]||{}:{}}
function hdEscAdv(s){return typeof hdMapEsc2==='function'?hdMapEsc2(s):String(s??'')}
function hdNodeBranchText(map,label,next,override){
  if(override.branch)return override.branch;
  if(next.length===0)return 'この先の分岐なし。';
  if(next.length===1)return `${label} → ${next[0]} へ進行。`;
  return `${next.join(' / ')} へ分岐。固定条件・確率分岐は「ルート」タブで確認してね。`;
}
function hdNodeEnemyText(kind,override){
  if(override.enemy)return override.enemy;
  if(Array.isArray(override.patterns)&&override.patterns.length)return `${override.patterns.length}パターンの確認済みデータあり。下の「敵編成パターン」を参照。`;
  if(kind==='start'||kind==='safe'||kind==='item'||kind==='vortex'||kind==='goal')return '戦闘編成なし。';
  return '敵編成詳細は未登録。誤情報を避けるため、確認済みデータだけ順次追加するよ。';
}
function hdNodeAirText(map,kind,override){
  if(override.air)return override.air;
  const d=hdCurrentMapDetail(map);
  if(kind==='air')return d.air||'航空戦マス。制空と対空装備を確認。';
  return d.air||'海域全体の制空・装備メモは「装備」タブで確認。';
}
function hdPatternsHtml(override){
  if(!Array.isArray(override.patterns)||!override.patterns.length)return '';
  return `<section class="hd-node-patterns"><div class="eyebrow">ENEMY PATTERNS</div><h4>確認済み敵編成パターン</h4><div class="hd-pattern-list">${override.patterns.map(p=>`<article class="hd-pattern-card"><div class="hd-pattern-head"><strong>${hdEscAdv(p.name||'パターン')}</strong>${p.formation?`<span>${hdEscAdv(p.formation)}</span>`:''}</div><p>${hdEscAdv(p.enemy||'')}</p>${p.air?`<div class="hd-pattern-air">${hdEscAdv(p.air)}</div>`:''}</article>`).join('')}</div></section>`;
}
function hdAdvancedHtml(map){
  const adv=hdMapAdvanced(map);
  const los=adv.los;
  const base=adv.base;
  const losText=los?.summary||'この海域ではHarborDeskに数値ボーダーを登録していないよ。必要なら「ルート」タブで固定条件を確認してね。';
  const coef=los&&los.coef!=null?`分岐点係数 ${los.coef}`:'係数の数値登録なし';
  let baseTitle='基地航空隊データ未登録';
  let baseText='この海域ではHarborDeskに基地航空隊の数値情報を登録していないよ。';
  if(base?.available===false){baseTitle='基地航空隊なし';baseText=base.note||'通常攻略では基地航空隊を使用しない海域。'}
  if(base?.available===true){
    baseTitle=`基地航空隊：${base.sorties||1}部隊出撃`;
    const radius=base.bossRadius!=null?`ボス必要半径 ${base.bossRadius}。`:'';
    baseText=`${radius}${base.note||''}`;
  }
  return `<section class="hd-map-advanced"><div class="eyebrow">MAP REQUIREMENTS</div><div class="hd-map-advanced-grid"><article><span>索敵</span><strong>${hdEscAdv(coef)}</strong><p>${hdEscAdv(losText)}</p></article><article><span>基地航空隊</span><strong>${hdEscAdv(baseTitle)}</strong><p>${hdEscAdv(baseText)}</p></article></div></section>`;
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
  const source=override.source?`<div class="hd-node-source">データ出典: ${hdEscAdv(override.source)}</div>`:'';
  host.innerHTML=`<div class="eyebrow">MAP NODE DETAIL</div>
    <div class="hd-map-node-info-title"><strong>${hdEscAdv(label==='START'?'出撃地点':label)}</strong><span>${hdEscAdv(info.label)}</span></div>
    <p class="hd-node-summary">${hdEscAdv(info.hint)}</p>
    <div class="hd-node-detail-grid">
      <div><span>進入元</span><strong>${hdEscAdv(prev)}</strong></div>
      <div><span>進行先</span><strong>${hdEscAdv(next)}</strong></div>
      <div class="wide"><span>分岐・進行</span><strong>${hdEscAdv(branch)}</strong></div>
      <div class="wide"><span>敵編成</span><strong>${hdEscAdv(enemy)}</strong></div>
      <div class="wide"><span>制空・装備</span><strong>${hdEscAdv(air)}</strong></div>
    </div>
    ${hdPatternsHtml(override)}
    ${hdAdvancedHtml(map)}
    ${source}
    <div class="hd-node-actions"><button class="ghost small" type="button" data-open-route-tab>ルート条件を見る</button><a class="guide-link" href="${wikiMapUrl(map)}" target="_blank" rel="noopener">Wikiで最新情報 ↗</a></div>`;
}
function hdShortestPath(map){
  const g=hdInteractiveGraph(map);if(!g)return [];
  const starts=typeof window.hdMapStartLabels==='function'?window.hdMapStartLabels(g):[...new Set(g.edges.map(x=>x[0]).filter(Boolean))];
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
  const host=hdEnsureNodeInfoHost();if(host)host.innerHTML=`<div class="eyebrow">ROUTE GUIDE</div><div class="hd-map-node-info-title"><strong>${hdEscAdv(path.map(x=>x==='START'?'出撃':x).join(' → '))}</strong><span>構造上の最短経路</span></div><p>これはグラフ上の最短経路表示で、実際の固定条件や推奨編成を保証するものではないよ。出撃前に「ルート」タブも確認してね。</p>${hdAdvancedHtml(map)}<div class="hd-node-actions"><button class="ghost small" type="button" data-open-route-tab>ルート条件を見る</button></div>`;
}
function hdOpenRouteTab(){
  const btn=document.querySelector('[data-map-tab="route"]');if(!btn)return;
  btn.click();
}
function hdEnhanceMapPane(){
  const pane=document.querySelector('[data-map-pane="map"]');if(!pane||pane.dataset.hdEnhanced==='1')return;
  const imageSection=pane.querySelector('.hd-map-image-section');if(!imageSection)return;
  const structure=imageSection.querySelector('.hd-map-structure-guide')||imageSection;
  pane.dataset.hdEnhanced='1';
  const tools=document.createElement('div');tools.className='hd-map-tools';
  tools.innerHTML=`<div class="hd-map-legend"><span data-kind="normal">通常</span><span data-kind="sub">潜水</span><span data-kind="air">航空</span><span data-kind="night">夜戦</span><span data-kind="vortex">うずしお</span><span data-kind="item">資源</span><span data-kind="boss">ボス</span></div><button class="ghost small" type="button" id="hdRouteHighlight">最短経路を強調</button>`;
  const body=structure.querySelector?.('.hd-map-structure-body')||structure;
  body.prepend(tools);
  tools.querySelector('#hdRouteHighlight')?.addEventListener('click',()=>{
    if(structure.tagName==='DETAILS')structure.open=true;
    hdHighlightShortest(hdInteractiveMap());
  });
  const host=hdEnsureNodeInfoHost();
  if(host&&!host.innerHTML)host.innerHTML=`<div class="eyebrow">MAP GUIDE</div><p>「操作用の構造ガイド」を開いてマスをタップすると、敵編成・制空・索敵・基地航空隊情報を表示するよ。</p>${hdAdvancedHtml(hdInteractiveMap())}`;
}

// Capture phase: node taps show details instead of triggering the parent map-zoom button.
document.addEventListener('click',e=>{
  const group=e.target.closest?.('[data-map-pane="map"] .hd-map-node');if(!group)return;
  e.preventDefault();e.stopPropagation();
  const map=hdInteractiveMap();if(!map)return;
  const label=hdNodeLabel(group,map);
  if(!label)return;
  hdShowNodeInfo(map,label);
},true);

document.addEventListener('click',e=>{if(e.target.closest('[data-open-route-tab]'))hdOpenRouteTab()});
document.addEventListener('click',e=>{if(e.target.closest('[data-map-tab="map"]'))setTimeout(hdEnhanceMapPane,0)});

const hdInteractivePrevRender=renderMapPicker;
renderMapPicker=function(){hdInteractivePrevRender();setTimeout(hdEnhanceMapPane,0)};
setTimeout(hdEnhanceMapPane,0);
