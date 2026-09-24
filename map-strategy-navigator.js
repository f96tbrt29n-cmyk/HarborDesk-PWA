const HD_MSN_CHECK_IDS=['route','equipment','air','scouting','health','supply','gameMatch','master','freshness'];
let hdMSNMap='',hdMSNRouteByMap={},hdMSNFleetByMap={};
function hdMSNEsc(value){return typeof hdEsc==='function'?hdEsc(value):String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdMSNMaps(){return typeof MAPS==='undefined'?[]:Object.keys(MAPS).sort((a,b)=>Number(a)-Number(b)).flatMap(w=>MAPS[w]||[])}
function hdMSNDetail(map){return typeof MAP_DETAILS==='undefined'?null:MAP_DETAILS[map]||null}
function hdMSNPresets(map){return typeof MAP_PLANS!=='undefined'&&MAP_PLANS[map]?.presets?.length?MAP_PLANS[map].presets:(typeof genericPlan==='function'?genericPlan(map)?.presets||[]:[])}
function hdMSNFleets(map){try{return typeof loadCustomFleets==='function'?(loadCustomFleets()[map]||[]):[]}catch{return []}}
function hdMSNMapSelected(){return hdMSNMaps().includes(hdMSNMap)?hdMSNMap:''}
function hdMSNRouteIndex(map,rows){const i=Number(hdMSNRouteByMap[map]);return Number.isInteger(i)&&i>=0&&i<rows.length?i:0}
function hdMSNFleetId(map,rows){const saved=hdMSNFleetByMap[map]||'',defaultId=typeof hdSortieSelection==='function'?hdSortieSelection(map):'';return rows.find(x=>String(x.id)===String(saved))?.id||rows.find(x=>String(x.id)===String(defaultId))?.id||rows[0]?.id||''}
function hdMSNMapOptions(map){return `<option value="">攻略する海域を選ぶ</option>${hdMSNMaps().map(m=>`<option value="${hdMSNEsc(m)}" ${m===map?'selected':''}>${hdMSNEsc(m)} ${hdMSNEsc(hdMSNDetail(m)?.name||'')}</option>`).join('')}`}
function hdMSNRow(label,value){return `<div class="hd-msn-fact"><b>${hdMSNEsc(label)}</b><span>${hdMSNEsc(value||'海域情報を確認')}</span></div>`}
function hdMSNRouteInfo(preset,plan){
 if(!preset)return '<p class="muted">編成例を選ぶとルート条件の目安が表示されるよ。</p>';
 const parsed=typeof hdFSPresetInfo==='function'?hdFSPresetInfo(preset):null;
 const matched=plan&&typeof hdFEPresetRouteMatch==='function'?hdFEPresetRouteMatch(plan,preset):null;
 const reqs=matched?.reqs||parsed?.requirements||[];
 const pills=reqs.map(x=>{const need=Number(x.need||x.count)||1,got=Number(x.got)||0,cls=plan?(got>=need?'ok':'warn'):'';return `<span class="${cls}">${hdMSNEsc(x.token)} ${plan?`${got}/`:''}${need}</span>`}).join('');
 const speed=parsed?.speedRequired?'<span>高速以上の統一を確認</span>':'';
 const total=parsed?.total&&/\d+隻/.test(String(parsed.text||''))?`<span>計${Number(parsed.total)}隻${plan?` / 保存編成${plan.ships.length}隻`:''}</span>`:'';
 return `<p>${hdMSNEsc(preset.ships||'編成例の艦種条件を確認')}</p>${pills||speed||total?`<div class="hd-msn-pills">${pills}${speed}${total}</div>`:''}<small>編成例から読み取れる条件の目安。分岐の全条件を保証しないため、ルートタブとWikiで最終確認してね。</small>`;
}
function hdMSNCheckHtml(check){const label=typeof hdFEAutoStatusLabel==='function'?hdFEAutoStatusLabel(check.status):check.status;return `<div class="hd-msn-check ${hdMSNEsc(check.status)}"><div><b>${hdMSNEsc(check.label)}</b><small>${hdMSNEsc(check.detail||'')}</small></div><strong>${hdMSNEsc(label)}</strong></div>`}
function hdMSNEvaluation(map,fleet,preset){
 if(!fleet)return `<div class="hd-msn-empty"><strong>保存編成を選ぶと差分を判定できるよ</strong><span>この海域の「自分用編成」に艦娘と装備を保存してから確認してね。</span><button type="button" class="ghost small" data-hd-msn-action="fleet">自分用編成を開く</button></div>`;
 if(typeof hdFEPlanFromSavedFleet!=='function'||typeof hdFEEvaluate!=='function')return '<p class="muted">判定モジュールを読み込み中。少し待ってから再確認してね。</p>';
 try{
  const plan=hdFEPlanFromSavedFleet(map,fleet);
  if(preset){plan.preset=preset;plan.routeInfo=typeof hdFSPresetInfo==='function'?hdFSPresetInfo(preset):null}
  const result=hdFEEvaluate(plan),auto=result.auto,gate=typeof hdFEGoNoGo==='function'?hdFEGoNoGo(auto):null;
  const checks=HD_MSN_CHECK_IDS.map(id=>auto.checks.find(c=>c.id===id)).filter(Boolean);
  const routeParsed=preset&&typeof hdFSPresetInfo==='function'?hdFSPresetInfo(preset):null;
  if(routeParsed&&!routeParsed.requirements?.length){const route=checks.find(c=>c.id==='route');if(route){route.status='manual';route.detail='編成例から艦種条件を自動抽出できないためルートを確認'}}
  const actions=(gate?.actions||[]).filter(a=>a.id!=='route'||routeParsed?.requirements?.length).slice(0,4);
  const missing=checks.filter(x=>x.status==='missing').length,manual=checks.filter(x=>x.status==='manual'||x.status==='partial').length;
  const title=missing?`修正が必要 ${missing}件`:manual?`要確認 ${manual}件`:'自動判定の不足なし';
  return `<div class="hd-msn-evaluation"><div class="hd-msn-eval-head"><strong>${hdMSNEsc(title)}</strong><span>「${hdMSNEsc(fleet.name||'保存編成')}」の保存内容と同期情報から判定</span></div><div class="hd-msn-checks">${checks.map(hdMSNCheckHtml).join('')}</div><div class="hd-msn-actions"><b>次に確認すること</b><ol>${[...(routeParsed&&!routeParsed.requirements?.length?[{action:'選択した編成例のルート条件をWikiで確認する'}]:[]),...actions].slice(0,4).map(a=>`<li>${hdMSNEsc(a.action)}</li>`).join('')||'<li>ゲーム画面で損傷・装備・ルートを最終確認する</li>'}</ol></div><small>制空は登録済み敵編成からの目安。未同期の艦状態や装備は自動判定できないよ。</small></div>`;
 }catch(e){return '<p class="muted">保存編成を判定できなかったよ。艦名と装備メモを確認してね。</p>'}
}
function hdMSNRender(){
 const host=document.getElementById('hdMapStrategyBody');if(!host)return;
 const map=hdMSNMapSelected(),selector=document.getElementById('hdMapStrategyMap');if(selector)selector.innerHTML=hdMSNMapOptions(map);
 if(!map){host.innerHTML='<div class="empty">海域を選ぶと、ルート・編成例・必要な準備をまとめて見られるよ。</div>';return}
 const d=hdMSNDetail(map),presets=hdMSNPresets(map),ri=hdMSNRouteIndex(map,presets),preset=presets[ri]||null,fleets=hdMSNFleets(map),fid=hdMSNFleetId(map,fleets),fleet=fleets.find(x=>String(x.id)===String(fid))||null;
 const adv=typeof HD_MAP_ADVANCED_DATA!=='undefined'?HD_MAP_ADVANCED_DATA[map]:null,base=adv?.base;
 host.innerHTML=`<div class="hd-msn-overview"><div><span class="eyebrow">${hdMSNEsc(map)} 攻略</span><h3>${hdMSNEsc(d?.name||map)}</h3><p>${hdMSNEsc(d?.overview||'攻略データを整理中。最新のルートはWikiで確認してね。')}</p></div><a class="guide-link" href="${typeof wikiMapUrl==='function'?wikiMapUrl(map):'https://wikiwiki.jp/kancolle/'}" target="_blank" rel="noopener">最新のWiki ↗</a></div><div class="hd-msn-facts">${hdMSNRow('主なルート',d?.route)}${hdMSNRow('制空・装備',d?.air)}${hdMSNRow('索敵',adv?.los?.summary||'ルートタブで条件を確認')}${base?.available?hdMSNRow('基地航空隊',`出撃可能 ${base.sorties||1}部隊 / ボス必要半径 ${base.bossRadius??'要確認'}。${base.note||''}`):''}</div><div class="hd-msn-choices"><label>編成例<select id="hdMapStrategyRoute">${presets.map((p,i)=>`<option value="${i}" ${i===ri?'selected':''}>${hdMSNEsc(p.name||`候補${i+1}`)}</option>`).join('')||'<option value="">編成例なし</option>'}</select></label><label>自分用編成<select id="hdMapStrategyFleet"><option value="">保存編成を選ぶ</option>${fleets.map(f=>`<option value="${hdMSNEsc(f.id)}" ${String(f.id)===String(fid)?'selected':''}>${hdMSNEsc(f.name||'名称なし')}</option>`).join('')}</select></label></div><div class="hd-msn-route"><h4>${hdMSNEsc(preset?.name||'編成例')}</h4>${hdMSNRouteInfo(preset,fleet&&typeof hdFEPlanFromSavedFleet==='function'?hdFEPlanFromSavedFleet(map,fleet):null)}${preset?hdMSNRow('装備の方針',preset.gear):''}${preset?hdMSNRow('使いどころ',preset.use):''}</div><h4 class="hd-msn-subhead">出撃前の差分</h4>${hdMSNEvaluation(map,fleet,preset)}<div class="hd-msn-links"><button type="button" class="ghost small" data-hd-msn-action="route">ルート詳細</button><button type="button" class="ghost small" data-hd-msn-action="fleet">編成を編集</button><button type="button" class="ghost small" data-hd-msn-action="calculator">制空・索敵を計算</button><button type="button" class="ghost small" data-hd-msn-action="preparation">出撃準備表</button></div><p class="muted hd-msn-foot">編成例と自動判定は攻略の目安。海域の段階や敵編成で条件は変わるため、出撃直前はゲーム画面と最新情報を確認してね。</p>`;
}
function hdMSNSelectMap(map,syncGuide=false){if(!hdMSNMaps().includes(map))return;hdMSNMap=map;if(syncGuide&&typeof hdSelectGuideMap==='function')hdSelectGuideMap(map);hdMSNRender()}
function hdMSNGoGuide(tab){const map=hdMSNMapSelected();if(map&&typeof hdSelectGuideMap==='function')hdSelectGuideMap(map);if(typeof hdWSShowElement==='function')hdWSShowElement('guide',true);if(tab&&typeof hdMapActivateTab==='function')hdMapActivateTab(tab)}
function hdMSNOpen(map){if(map)hdMSNSelectMap(map,false);else if(!hdMSNMapSelected()&&typeof selectedMap!=='undefined'&&selectedMap)hdMSNSelectMap(selectedMap,false);if(typeof hdWSShowElement==='function')hdWSShowElement('mapStrategyNavigator',true);else document.getElementById('mapStrategyNavigator')?.scrollIntoView({behavior:'smooth'});hdMSNRender()}
function hdMSNAddEntry(){const head=document.querySelector('#selectedMapCard .map-tabs-head');if(head&&!head.querySelector('[data-hd-msn-open]')){const b=document.createElement('button');b.type='button';b.className='ghost small';b.dataset.hdMsnOpen='';b.textContent='攻略ナビ';head.appendChild(b)}}
document.addEventListener('change',e=>{if(e.target.id==='hdMapStrategyMap'){hdMSNSelectMap(e.target.value,true);return}if(e.target.id==='hdMapStrategyRoute'){hdMSNRouteByMap[hdMSNMapSelected()]=Number(e.target.value)||0;hdMSNRender();return}if(e.target.id==='hdMapStrategyFleet'){hdMSNFleetByMap[hdMSNMapSelected()]=e.target.value;hdMSNRender()}});
document.addEventListener('click',e=>{if(e.target.closest?.('[data-hd-msn-open]')){hdMSNOpen(typeof selectedMap!=='undefined'?selectedMap:'');return}const action=e.target.closest?.('[data-hd-msn-action]')?.dataset.hdMsnAction;if(!action)return;if(action==='route'||action==='fleet'){hdMSNGoGuide(action==='route'?'route':'mine');return}if(action==='calculator'){hdMSNGoGuide('gear');setTimeout(()=>document.getElementById('hdFleetCalculator')?.scrollIntoView({behavior:'smooth',block:'start'}),80);return}if(typeof hdWSShowElement==='function')hdWSShowElement('hdSortiePreparation',true)});
window.addEventListener('hd:guide-map-changed',e=>{if(e.detail?.map)hdMSNSelectMap(e.detail.map,false)});
window.addEventListener('hd:map-rendered',()=>hdMSNAddEntry());
window.addEventListener('hd:custom-fleets-changed',()=>hdMSNRender());
window.addEventListener('hd:modules-ready',()=>{hdMSNRender();hdMSNAddEntry()});
window.addEventListener('load',()=>{if(typeof selectedMap!=='undefined'&&selectedMap)hdMSNMap=selectedMap;hdMSNRender();hdMSNAddEntry()});
