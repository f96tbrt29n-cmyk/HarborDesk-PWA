const HD_SPA_MODE_KEY='harbordesk-sortie-analytics-mode-v1';
const HD_SPA_MAP_KEY='harbordesk-sortie-analytics-map-v1';
const HD_SPA_WINDOW_KEY='harbordesk-sortie-analytics-window-v1';
const HD_SPA_OBJECTIVE_KEY='harbordesk-sortie-analytics-objective-v1';
const HD_SPA_STRATEGY_ORDER=['stable','firepower','route','boss','reserve','manual'];

function hdSPAEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdSPAMode(){try{const v=localStorage.getItem(HD_SPA_MODE_KEY)||'map';return ['map','strategy','fleet'].includes(v)?v:'map'}catch{return 'map'}}
function hdSPASetMode(v){try{localStorage.setItem(HD_SPA_MODE_KEY,v)}catch{}}
function hdSPAMap(){try{return localStorage.getItem(HD_SPA_MAP_KEY)||'all'}catch{return 'all'}}
function hdSPASetMap(v){try{localStorage.setItem(HD_SPA_MAP_KEY,v)}catch{}}
function hdSPAWindow(){try{const n=Number(localStorage.getItem(HD_SPA_WINDOW_KEY)||5);return [3,5,10].includes(n)?n:5}catch{return 5}}
function hdSPASetWindow(v){try{const n=Number(v);localStorage.setItem(HD_SPA_WINDOW_KEY,[3,5,10].includes(n)?String(n):'5')}catch{}}
function hdSPAObjective(){try{return localStorage.getItem(HD_SPA_OBJECTIVE_KEY)||'all'}catch{return 'all'}}
function hdSPASetObjective(v){try{localStorage.setItem(HD_SPA_OBJECTIVE_KEY,String(v||'all'))}catch{}}
function hdSPAObjectiveOptions(logs){
 const rows=Array.isArray(logs)?logs:[],targets=[...new Set(rows.map(x=>String(x?.objectiveTarget||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
 if(!targets.length)return [];
 const out=targets.map(value=>({value,label:'目標 '+value}));
 if(rows.some(x=>!String(x?.objectiveTarget||'').trim()))out.push({value:'__unrecorded__',label:'目標未記録'});
 return out;
}
function hdSPAActiveObjective(logs){
 const options=hdSPAObjectiveOptions(logs),saved=hdSPAObjective();
 return saved==='all'||options.some(x=>x.value===saved)?saved:'all';
}
function hdSPAFilterObjective(logs,objective){
 if(objective==='all')return logs;
 if(objective==='__unrecorded__')return logs.filter(x=>!String(x?.objectiveTarget||'').trim());
 return logs.filter(x=>String(x?.objectiveTarget||'').trim()===objective);
}
function hdSPALogs(){
 try{return (typeof hdSLLoad==='function'?hdSLLoad():JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]')).filter(x=>x&&String(x.map||'').trim())}catch{return []}
}
function hdSPAMapName(map){
 const sources=[typeof MAP_DETAILS!=='undefined'?MAP_DETAILS:null,typeof MAP_DETAILS_34!=='undefined'?MAP_DETAILS_34:null,typeof MAP_DETAILS_57!=='undefined'?MAP_DETAILS_57:null];
 for(const src of sources){if(src?.[map]?.name)return src[map].name}return '';
}
function hdSPASourceKind(row){if(row?.source==='kancolle-import')return 'game';if(row?.sessionId||row?.fleetId)return 'session';return 'manual'}
function hdSPASourceStats(rows){
 const out={game:0,session:0,manual:0};for(const row of rows||[])out[hdSPASourceKind(row)]++;return out;
}
function hdSPADropStats(rows){
 const drops=(rows||[]).filter(x=>String(x?.drop||'').trim()).sort((a,b)=>(Number(b.at)||0)-(Number(a.at)||0)),counts=new Map();
 for(const row of drops){const ship=String(row.drop).trim();counts.set(ship,(counts.get(ship)||0)+1)}
 const top=[...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'ja')).slice(0,6).map(([ship,count])=>({ship,count}));
 const recent=drops.slice(0,6).map(x=>({ship:String(x.drop).trim(),map:x.map||'',node:x.node||x.gameNodeLabel||'',result:x.result||'',at:Number(x.at)||0,source:hdSPASourceKind(x)}));
 return {count:drops.length,unique:counts.size,top,recent};
}
function hdSPANormalizeNode(v){return String(v||'').replace(/\s*ボス\s*/g,'').trim()}
function hdSPANodeStats(rows){
 const nodes=new Map(),ensure=(map,node)=>{const n=hdSPANormalizeNode(node);if(!n)return null;const key=String(map||'')+'|'+n;if(!nodes.has(key))nodes.set(key,{key,map:String(map||''),node:n,visits:0,battles:0,ranks:{S:0,A:0,B:0,C:0,D:0,E:0},retreats:0,drops:0});return nodes.get(key)};
 for(const row of rows||[]){
  const map=String(row?.map||''),route=Array.isArray(row?.gameRouteLabels)?row.gameRouteLabels.map(hdSPANormalizeNode).filter(Boolean):[];
  if(route.length){for(const node of route){const x=ensure(map,node);if(x)x.visits++}}
  const battles=Array.isArray(row?.gameBattleResults)?row.gameBattleResults:[];
  if(battles.length){
   for(const b of battles){const node=hdSPANormalizeNode(b?.nodeLabel||b?.nodeNo),x=ensure(map,node);if(!x)continue;if(!route.length)x.visits++;x.battles++;const rank=String(b?.rank||'').toUpperCase();if(Object.prototype.hasOwnProperty.call(x.ranks,rank))x.ranks[rank]++;if(String(b?.drop||'').trim())x.drops++}
  }else{
   const node=hdSPANormalizeNode(row?.gameNodeLabel||row?.node),x=ensure(map,node);
   if(x){if(!route.length)x.visits++;const rank=String(row?.result||'').toUpperCase();if(Object.prototype.hasOwnProperty.call(x.ranks,rank)){x.battles++;x.ranks[rank]++}if(String(row?.drop||'').trim())x.drops++}
  }
  if(row?.retreat||row?.result==='撤退'){const node=hdSPANormalizeNode(row?.gameNodeLabel||row?.node),x=ensure(map,node);if(x)x.retreats++}
 }
 return [...nodes.values()].map(x=>({...x,retreatRate:hdSPAPct(x.retreats,x.visits),sRate:hdSPAPct(x.ranks.S,x.battles),aRate:hdSPAPct(x.ranks.A,x.battles),bRate:hdSPAPct(x.ranks.B,x.battles),winRate:hdSPAPct(x.ranks.S+x.ranks.A+x.ranks.B,x.battles)})).sort((a,b)=>b.retreats-a.retreats||b.retreatRate-a.retreatRate||b.visits-a.visits||a.map.localeCompare(b.map,undefined,{numeric:true})||a.node.localeCompare(b.node,undefined,{numeric:true}));
}
function hdSPARouteStats(rows){
 const routes=new Map();
 for(const row of rows||[]){
  const labels=Array.isArray(row?.gameRouteLabels)?row.gameRouteLabels.map(hdSPANormalizeNode).filter(Boolean):[];if(!labels.length)continue;
  const map=String(row?.map||''),route=labels.join('→'),key=map+'|'+route;
  if(!routes.has(key))routes.set(key,{key,map,route,n:0,boss:0,retreats:0,s:0,wins:0,drops:0});
  const x=routes.get(key);x.n++;if(row?.boss)x.boss++;if(row?.retreat||row?.result==='撤退')x.retreats++;if(row?.result==='S')x.s++;if(['S','A','B'].includes(row?.result))x.wins++;if(String(row?.drop||'').trim())x.drops++;
 }
 return [...routes.values()].map(x=>({...x,bossRate:hdSPAPct(x.boss,x.n),retreatRate:hdSPAPct(x.retreats,x.n),sRate:hdSPAPct(x.s,x.n),winRate:hdSPAPct(x.wins,x.n),dropRate:hdSPAPct(x.drops,x.n)})).sort((a,b)=>b.n-a.n||b.bossRate-a.bossRate||a.map.localeCompare(b.map,undefined,{numeric:true})||a.route.localeCompare(b.route,'ja'));
}
function hdSPAStructuralRoute(map){
 const g=typeof HD_MAP_GRAPHS!=='undefined'?HD_MAP_GRAPHS?.[String(map||'')]:null;if(!g||!Array.isArray(g.edges))return [];
 const labels=[...new Set(g.edges.flat())],starts=labels.filter(x=>x==='S'||x==='S1'||x==='S2'),target=g.boss||g.goal;if(!starts.length||!target)return [];
 const q=starts.map(s=>[s,[s]]),seen=new Set(starts);
 while(q.length){const [node,path]=q.shift();if(node===target)return path.filter(x=>x!=='S'&&x!=='S1'&&x!=='S2');for(const [a,b] of g.edges){if(a===node&&!seen.has(b)){seen.add(b);q.push([b,[...path,b]])}}}
 return [];
}
function hdSPANodeTrend(rows,windowSize=hdSPAWindow()){
 const sorted=[...(rows||[])].sort((a,b)=>(Number(b.at)||0)-(Number(a.at)||0)),recent=sorted.slice(0,windowSize),previous=sorted.slice(windowSize,windowSize*2);
 if(recent.length<windowSize||previous.length<windowSize)return {ready:false,windowSize,recentCount:recent.length,previousCount:previous.length,items:[]};
 const a=new Map(hdSPANodeStats(recent).map(x=>[x.key,x])),b=new Map(hdSPANodeStats(previous).map(x=>[x.key,x])),items=[];
 for(const [key,cur] of a){const prev=b.get(key);if(!prev||!cur.visits||!prev.visits)continue;const delta=cur.retreatRate-prev.retreatRate;items.push({key,map:cur.map,node:cur.node,delta,recentRate:cur.retreatRate,previousRate:prev.retreatRate,recentVisits:cur.visits,previousVisits:prev.visits,recentRetreats:cur.retreats,previousRetreats:prev.retreats})}
 items.sort((x,y)=>y.delta-x.delta||y.recentRetreats-x.recentRetreats||y.recentVisits-x.recentVisits);
 return {ready:true,windowSize,recentCount:recent.length,previousCount:previous.length,items};
}
function hdSPARouteComparison(maps,routeStats){
 const list=(maps||[]).filter(Boolean);if(list.length!==1)return null;const map=list[0],reference=hdSPAStructuralRoute(map);if(!reference.length)return null;
 const referenceRoute=reference.join('→'),routes=Array.isArray(routeStats)?routeStats:[],actual=routes[0]||null,referenceStats=routes.find(x=>x.route===referenceRoute)||null;
 return {map,reference,referenceRoute,actual,referenceStats,matches:!!actual&&actual.route===referenceRoute};
}
function hdSPADangerNodes(nodeStats){return (nodeStats||[]).filter(x=>x.retreats>0).sort((a,b)=>b.retreats-a.retreats||b.retreatRate-a.retreatRate||b.visits-a.visits).slice(0,5)}
function hdSPARetreatReasonStats(rows){
 const counts=new Map(),retreatRows=(rows||[]).filter(x=>x?.retreat||x?.result==='撤退');
 for(const row of retreatRows){
  const reason=String(row?.retreatReason||'').trim()||'理由未記録';
  counts.set(reason,(counts.get(reason)||0)+1);
 }
 const items=[...counts.entries()].map(([reason,count])=>({reason,count,rate:hdSPAPct(count,retreatRows.length)})).sort((a,b)=>b.count-a.count||a.reason.localeCompare(b.reason,'ja'));
 return {total:retreatRows.length,known:retreatRows.filter(x=>String(x?.retreatReason||'').trim()).length,items};
}
function hdSPAStrategyLabel(id,row){
 if(row?.strategyLabel)return row.strategyLabel;
 if(typeof HD_SPM_STRATEGIES!=='undefined'&&HD_SPM_STRATEGIES[id])return HD_SPM_STRATEGIES[id].label;
 return {stable:'安定重視',firepower:'火力重視',route:'道中突破重視',boss:'ボス重視',reserve:'装備温存',manual:'手動編成'}[id]||id||'手動編成';
}
function hdSPAPct(n,d){return d?Math.round(n/d*100):0}
function hdSPANum(v){return Math.max(0,Number(v)||0)}
function hdSPAMetrics(rows){
 const n=rows.length,boss=rows.filter(x=>x.boss).length,s=rows.filter(x=>x.result==='S').length,wins=rows.filter(x=>['S','A','B'].includes(x.result)).length,retreat=rows.filter(x=>x.retreat||x.result==='撤退').length,drops=rows.filter(x=>String(x.drop||'').trim()).length;
 const objectiveRows=rows.filter(x=>String(x?.objectiveTarget||'').trim()),objectiveTarget=objectiveRows.length?String(objectiveRows[0].objectiveTarget||'').trim():'';
 const objectiveReached=objectiveTarget?rows.filter(x=>hdSPANormalizeNode(x?.node||x?.gameNodeLabel||'')===hdSPANormalizeNode(objectiveTarget)).length:0;
 const resourceRows=rows.filter(x=>x.source!=='kancolle-import'||[x.fuel,x.ammo,x.steel,x.bauxite,x.buckets].some(v=>Number(v)>0));
 const totalResource=resourceRows.reduce((a,x)=>a+hdSPANum(x.fuel)+hdSPANum(x.ammo)+hdSPANum(x.steel)+hdSPANum(x.bauxite),0);
 const buckets=resourceRows.reduce((a,x)=>a+hdSPANum(x.buckets),0);
 const durations=rows.map(x=>hdSPANum(x.durationMs)).filter(x=>x>0);
 const readiness=rows.map(x=>{const r=x.readinessSnapshot||{},den=(Number(r.autoTotal)||0)+(Number(r.manualTotal)||0),num=(Number(r.autoOk)||0)+(Number(r.manualDone)||0);return den?num/den:null}).filter(x=>x!=null);
 const dropStats=hdSPADropStats(rows),sourceStats=hdSPASourceStats(rows);
 return {
  n,bossRate:hdSPAPct(boss,n),objectiveTarget,objectiveReachedRate:objectiveTarget?hdSPAPct(objectiveReached,n):null,sRate:hdSPAPct(s,n),winRate:hdSPAPct(wins,n),retreatRate:hdSPAPct(retreat,n),dropRate:hdSPAPct(drops,n),drops,uniqueDrops:dropStats.unique,
  avgResource:resourceRows.length?Math.round(totalResource/resourceRows.length):null,avgBuckets:resourceRows.length?Number((buckets/resourceRows.length).toFixed(2)):null,
  avgDurationMin:durations.length?Number((durations.reduce((a,b)=>a+b,0)/durations.length/60000).toFixed(1)):null,
  avgReadiness:readiness.length?Math.round(readiness.reduce((a,b)=>a+b,0)/readiness.length*100):null,
  sourceStats
 };
}
function hdSPADelta(a,b){return a==null||b==null?null:Number((a-b).toFixed(1))}
function hdSPAPctChange(a,b){return a==null||b==null||b===0?null:Number(((a-b)/b*100).toFixed(1))}
function hdSPATrend(rows,windowSize=hdSPAWindow()){
 const sorted=[...(rows||[])].sort((a,b)=>(Number(b.at)||0)-(Number(a.at)||0));
 const recent=sorted.slice(0,windowSize),previous=sorted.slice(windowSize,windowSize*2);
 if(recent.length<windowSize||previous.length<windowSize)return {ready:false,windowSize,recentCount:recent.length,previousCount:previous.length};
 const a=hdSPAMetrics(recent),b=hdSPAMetrics(previous),delta={
  bossRate:hdSPADelta(a.bossRate,b.bossRate),sRate:hdSPADelta(a.sRate,b.sRate),winRate:hdSPADelta(a.winRate,b.winRate),
  retreatRate:hdSPADelta(a.retreatRate,b.retreatRate),avgResource:hdSPADelta(a.avgResource,b.avgResource),
  avgResourcePct:hdSPAPctChange(a.avgResource,b.avgResource),avgBuckets:hdSPADelta(a.avgBuckets,b.avgBuckets),
  avgDurationMin:hdSPADelta(a.avgDurationMin,b.avgDurationMin),avgDurationPct:hdSPAPctChange(a.avgDurationMin,b.avgDurationMin),
  avgReadiness:hdSPADelta(a.avgReadiness,b.avgReadiness)
 };
 const issues=[],improvements=[];
 if(delta.bossRate!=null&&delta.bossRate<=-15)issues.push('ボス到達率が15pt以上低下');
 if(delta.sRate!=null&&delta.sRate<=-15)issues.push('S率が15pt以上低下');
 if(delta.retreatRate!=null&&delta.retreatRate>=15)issues.push('撤退率が15pt以上上昇');
 if(delta.avgResourcePct!=null&&delta.avgResourcePct>=20)issues.push('平均資源消費が20%以上増加');
 if(delta.avgDurationPct!=null&&delta.avgDurationPct>=20)issues.push('平均時間が20%以上増加');
 if(delta.avgReadiness!=null&&delta.avgReadiness<=-10)issues.push('開始時確認率が10pt以上低下');
 if(delta.bossRate!=null&&delta.bossRate>=15)improvements.push('ボス到達率が改善');
 if(delta.sRate!=null&&delta.sRate>=15)improvements.push('S率が改善');
 if(delta.retreatRate!=null&&delta.retreatRate<=-15)improvements.push('撤退率が改善');
 if(delta.avgResourcePct!=null&&delta.avgResourcePct<=-20)improvements.push('資源効率が改善');
 if(delta.avgDurationPct!=null&&delta.avgDurationPct<=-20)improvements.push('平均時間が短縮');
 if(delta.avgReadiness!=null&&delta.avgReadiness>=10)improvements.push('開始時確認率が改善');
 return {ready:true,windowSize,recent,previous,recentMetrics:a,previousMetrics:b,delta,issues,improvements};
}
function hdSPARecentRef(rows){
 const latest=[...(rows||[])].sort((a,b)=>(Number(b.at)||0)-(Number(a.at)||0))[0];if(!latest)return null;
 const map=latest.map||'',fleetId=latest.fleetId||'',fleetName=latest.fleetName||'';
 let available=false;try{available=!!map&&!!fleetId&&typeof hdSPMFleets==='function'&&hdSPMFleets(map).some(x=>x.id===fleetId)}catch{}
 return {map,fleetId,fleetName,available};
}

function hdSPARecommendations(row){
 const t=row?.trend,d=t?.ready?(t.delta||{}):{},out=[],seen=new Set();
 const push=(id,title,reason,action,mode='')=>{const key=action==='optimize'?action+':'+mode:action+':'+id;if(seen.has(key))return;seen.add(key);out.push({id,title,reason,action,mode})};
 const reasons=(row?.retreatReasonStats?.items||[]).filter(x=>x.reason!=='理由未記録');
 const top=reasons[0]||null;
 if(top&&top.count>=2){
  const why=top.reason+'撤退 '+top.count+'回（撤退内'+top.rate+'%）';
  if(top.reason==='大破')push('reason-damage','道中の安定性を見直す',why,'optimize','route');
  else if(top.reason==='索敵不足')push('reason-los','索敵装備を見直す',why,'prep');
  else if(top.reason==='ルート逸れ')push('reason-route','ルート条件を見直す',why,'prep');
  else if(top.reason==='火力不足')push('reason-firepower','ボス火力を比較する',why,'optimize','boss');
  else if(top.reason==='制空不足')push('reason-air','制空・艦戦配分を見直す',why,'prep');
 }
 if(t?.ready){
  if(d.retreatRate!=null&&d.retreatRate>=15)push('route-retreat','道中突破重視を再検討','撤退率が'+d.retreatRate+'pt上昇','optimize','route');
  if(d.bossRate!=null&&d.bossRate<=-15)push('route-boss','道中到達を見直す','ボス到達率が'+Math.abs(d.bossRate)+'pt低下','optimize','route');
  if(d.sRate!=null&&d.sRate<=-15)push('boss-s','ボス重視を比較','S率が'+Math.abs(d.sRate)+'pt低下','optimize','boss');
  if(d.avgResourcePct!=null&&d.avgResourcePct>=20)push('reserve-resource','装備温存を比較','平均資源消費が'+d.avgResourcePct+'%増加','optimize','reserve');
  if(d.avgDurationPct!=null&&d.avgDurationPct>=20)push('route-time','周回時間を見直す','平均時間が'+d.avgDurationPct+'%増加','optimize','route');
  if(d.avgReadiness!=null&&d.avgReadiness<=-10)push('prep-readiness','出撃前チェックを見直す','開始時確認率が'+Math.abs(d.avgReadiness)+'pt低下','prep');
 }
 return out.slice(0,4);
}
function hdSPARecommendationHtml(row){
 const recs=hdSPARecommendations(row);if(!recs.length)return '';
 return '<div class="hd-spa-review"><div class="hd-spa-review-head"><strong>次の見直し候補</strong><span>トレンドから自動抽出</span></div><div class="hd-spa-review-list">'+recs.map(r=>'<div><div><strong>'+hdSPAEsc(r.title)+'</strong><small>'+hdSPAEsc(r.reason)+'</small></div><button type="button" class="ghost small" data-hd-spa-review="'+hdSPAEsc(row.key)+'" data-hd-spa-action="'+hdSPAEsc(r.action)+'" data-hd-spa-mode-target="'+hdSPAEsc(r.mode||'')+'">'+(r.action==='prep'?'準備表で確認':'再調整へ')+'</button></div>').join('')+'</div></div>';
}
function hdSPASelectContext(ref){
 if(!ref?.map)return false;
 try{
  if(typeof selectedWorld!=='undefined')selectedWorld=String(ref.map).split('-')[0];
  if(typeof selectedMap!=='undefined')selectedMap=ref.map;
  if(typeof renderMapPicker==='function')renderMapPicker();
  if(ref.available&&typeof hdSPMSelect==='function')hdSPMSelect(ref.map,ref.fleetId);
  return true;
 }catch{return false}
}
function hdSPAReview(key,action,mode){
 if(!['prep','optimize'].includes(action))return false;
 if(action==='optimize'&&mode&&!['stable','firepower','route','boss','reserve'].includes(mode))return false;
 const row=hdSPARows().find(x=>x.key===key),ref=row?.recentRef;if(!row||!ref?.map)return false;
 if(!hdSPASelectContext(ref))return false;
 if(action==='prep'){
  if(typeof hdSPSOpen==='function')hdSPSOpen();else if(typeof hdWSShowElement==='function')hdWSShowElement('hdSortiePreparation',true);
  return true;
 }
 if(action==='optimize'){
  try{if(typeof hdFOSetStoredMode==='function')hdFOSetStoredMode(mode||'stable');else localStorage.setItem('harbordesk-fleet-optimizer-mode-v1',mode||'stable')}catch{}
  if(typeof hdFSOpen==='function')hdFSOpen();else if(typeof hdWSShowElement==='function')hdWSShowElement('hdFleetSuggester',true);
  return true;
 }
 return false;
}

function hdSPAObjectiveSplitMaps(logs){
 const out=new Set();
 for(const row of logs||[]){if(String(row?.objectiveTarget||'').trim())out.add(String(row.map||''))}
 return out;
}
function hdSPAObjectiveLabel(row,split){
 if(!split)return '';
 const target=String(row?.objectiveTarget||'').trim();
 return '｜目標 '+(target||'未記録');
}
function hdSPAGroupKey(row,mode,splitObjective=false){
 let base;
 if(mode==='map')base=String(row.map||'unknown');
 else if(mode==='fleet')base=row.fleetId||row.fleetName||(hdSPASourceKind(row)==='game'?'game-sync':'manual-log');
 else base=row.strategy||(hdSPASourceKind(row)==='game'?'game-sync':'manual-log');
 return splitObjective?base+'|objective:'+(String(row.objectiveTarget||'').trim()||'unrecorded'):base;
}
function hdSPAGroupLabel(row,mode,splitObjective=false){
 let base;
 if(mode==='map'){const map=String(row.map||'');const name=hdSPAMapName(map);base=name?map+' '+name:map||'海域不明'}
 else if(mode==='fleet'){base=row.fleetName?row.fleetName:(hdSPASourceKind(row)==='game'?'ゲーム同期（編成未紐付け）':'手動ログ（編成未紐付け）')}
 else if(row.strategy)base=hdSPAStrategyLabel(row.strategy,row);
 else base=hdSPASourceKind(row)==='game'?'ゲーム同期':'手動ログ';
 return base;
}
function hdSPARows(){
 const mode=hdSPAMode(),map=hdSPAMap(),baseLogs=hdSPALogs().filter(x=>map==='all'||x.map===map),objective=hdSPAActiveObjective(baseLogs),logs=hdSPAFilterObjective(baseLogs,objective),groups=new Map(),objectiveMaps=hdSPAObjectiveSplitMaps(logs);
 for(const row of logs){
  const splitObjective=objective==='all'&&objectiveMaps.has(String(row.map||''))&&(mode==='map'||map!=='all'),key=hdSPAGroupKey(row,mode,splitObjective);
  if(!groups.has(key))groups.set(key,{key,label:hdSPAGroupLabel(row,mode,splitObjective),strategy:row.strategy||'manual',objectiveTarget:String(row.objectiveTarget||'').trim(),objectiveSplit:splitObjective,rows:[],maps:new Set()});
  const g=groups.get(key);g.rows.push(row);g.maps.add(row.map);
 }
 const out=[...groups.values()].map(g=>{const maps=[...g.maps],nodeStats=hdSPANodeStats(g.rows),routeStats=hdSPARouteStats(g.rows);return {...g,metrics:hdSPAMetrics(g.rows),dropStats:hdSPADropStats(g.rows),retreatReasonStats:hdSPARetreatReasonStats(g.rows),nodeStats,routeStats,dangerNodes:hdSPADangerNodes(nodeStats),nodeTrend:hdSPANodeTrend(g.rows),routeComparison:hdSPARouteComparison(maps,routeStats),trend:hdSPATrend(g.rows),recentRef:hdSPARecentRef(g.rows),maps}});
 out.sort((a,b)=>{
  if(mode==='strategy'){const ai=HD_SPA_STRATEGY_ORDER.indexOf(a.strategy),bi=HD_SPA_STRATEGY_ORDER.indexOf(b.strategy);if(ai!==bi)return (ai<0?99:ai)-(bi<0?99:bi)}
  return b.metrics.n-a.metrics.n||a.label.localeCompare(b.label,'ja');
 });
 return hdSPABadges(out);
}
function hdSPABadges(rows){
 if(!rows.length)return rows;
 const eligible=rows.filter(x=>x.metrics.n>0),maxBoss=Math.max(...eligible.map(x=>x.metrics.bossRate)),maxS=Math.max(...eligible.map(x=>x.metrics.sRate)),minRetreat=Math.min(...eligible.map(x=>x.metrics.retreatRate)),maxDrop=Math.max(...eligible.map(x=>x.metrics.dropRate));
 const resource=eligible.filter(x=>x.metrics.avgResource!=null),minResource=resource.length?Math.min(...resource.map(x=>x.metrics.avgResource)):null;
 const timed=eligible.filter(x=>x.metrics.avgDurationMin!=null),minDuration=timed.length?Math.min(...timed.map(x=>x.metrics.avgDurationMin)):null;
 return rows.map(x=>{const b=[];if(x.metrics.bossRate===maxBoss)b.push('ボス到達率最大');if(x.metrics.sRate===maxS)b.push('S率最大');if(x.metrics.retreatRate===minRetreat)b.push('撤退率最小');if(x.metrics.dropRate===maxDrop&&x.metrics.drops>0)b.push('ドロップ率最大');if(minResource!=null&&x.metrics.avgResource===minResource)b.push('資源消費最小');if(minDuration!=null&&x.metrics.avgDurationMin===minDuration)b.push('平均時間最短');return {...x,badges:b}});
}
function hdSPAMaps(){
 const maps=[...new Set(hdSPALogs().map(x=>x.map).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
 return maps;
}
function hdSPATrendDelta(label,value,suffix='',goodWhen='up'){
 if(value==null)return '<span>'+hdSPAEsc(label)+' <b>比較不可</b></span>';
 if(value===0)return '<span>'+hdSPAEsc(label)+' <b>±0'+hdSPAEsc(suffix)+'</b></span>';
 const good=goodWhen==='up'?value>0:value<0,sign=value>0?'+':'';
 return '<span class="'+(good?'good':'bad')+'">'+hdSPAEsc(label)+' <b>'+sign+value+hdSPAEsc(suffix)+'</b></span>';
}
function hdSPATrendHtml(row){
 const t=row.trend;if(!t)return '';
 if(!t.ready)return '<div class="hd-spa-trend pending"><strong>トレンド待ち</strong><span>直近'+t.windowSize+'周 vs 前'+t.windowSize+'周には合計'+(t.windowSize*2)+'周必要｜現在 '+(t.recentCount+t.previousCount)+'周</span></div>';
 const d=t.delta,signals=[...t.issues.map(x=>'<li class="bad">'+hdSPAEsc(x)+'</li>'),...t.improvements.map(x=>'<li class="good">'+hdSPAEsc(x)+'</li>')];
 return '<div class="hd-spa-trend"><div class="hd-spa-trend-head"><strong>直近'+t.windowSize+'周の変化</strong><span>その前'+t.windowSize+'周と比較</span></div><div class="hd-spa-trend-grid">'+
  hdSPATrendDelta('ボス',d.bossRate,'pt','up')+hdSPATrendDelta('S率',d.sRate,'pt','up')+hdSPATrendDelta('撤退',d.retreatRate,'pt','down')+
  hdSPATrendDelta('資源',d.avgResource,'','down')+hdSPATrendDelta('時間',d.avgDurationMin,'分','down')+hdSPATrendDelta('確認',d.avgReadiness,'pt','up')+
  '</div>'+(signals.length?'<ul class="hd-spa-signals">'+signals.join('')+'</ul>':'<div class="hd-spa-steady">大きな変化は検出していないよ。</div>')+'</div>';
}
function hdSPAFmtAt(ts){if(!Number(ts))return '';try{return new Date(Number(ts)).toLocaleString('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}catch{return ''}}
function hdSPASourceHtml(metrics){
 const s=metrics?.sourceStats||{},parts=[];if(s.game)parts.push('ゲーム同期 '+s.game);if(s.session)parts.push('実戦モード '+s.session);if(s.manual)parts.push('手動 '+s.manual);
 return parts.length?'<div class="hd-spa-sources">'+parts.map(x=>'<span>'+hdSPAEsc(x)+'</span>').join('')+'</div>':'';
}
function hdSPARetreatReasonHtml(row){
 const r=row?.retreatReasonStats;if(!r?.total)return '';
 const items=(r.items||[]).slice(0,6);
 return '<div class="hd-spa-retreat-reasons"><div class="hd-spa-detail-head"><strong>撤退理由</strong><span>'+r.total+'件中 '+r.known+'件を分類</span></div><div>'+items.map(x=>'<span class="'+(x.reason==='理由未記録'?'unknown':'')+'"><b>'+hdSPAEsc(x.reason)+'</b><em>'+x.count+'回 / '+x.rate+'%</em></span>').join('')+'</div></div>';
}
function hdSPADropHtml(row){
 const d=row.dropStats;if(!d?.count)return '<div class="hd-spa-drops empty"><strong>ドロップ履歴</strong><span>この集計範囲ではまだドロップ記録なし</span></div>';
 const top=d.top.map(x=>'<span><b>'+hdSPAEsc(x.ship)+'</b> ×'+x.count+'</span>').join('');
 const recent=d.recent.map(x=>'<li><div><b>'+hdSPAEsc(x.ship)+'</b><span>'+hdSPAEsc([x.map,x.node,x.result].filter(Boolean).join(' '))+'</span></div><small>'+hdSPAEsc(hdSPAFmtAt(x.at))+'</small></li>').join('');
 return '<div class="hd-spa-drops"><div class="hd-spa-drop-head"><strong>ドロップ履歴</strong><span>'+d.count+'件 / '+d.unique+'種類</span></div><div class="hd-spa-drop-top">'+top+'</div><ul>'+recent+'</ul></div>';
}
function hdSPANodeRouteHtml(row){
 const nodes=(row.nodeStats||[]).slice(0,8),routes=(row.routeStats||[]).slice(0,6),multi=(row.maps||[]).length>1;
 if(!nodes.length&&!routes.length)return '';
 const nodeHtml=nodes.length?'<div class="hd-spa-node-panel"><div class="hd-spa-detail-head"><strong>マス別分析</strong><span>撤退数の多い順</span></div><div class="hd-spa-node-list">'+nodes.map(x=>'<div class="'+(x.retreats?'danger':'')+'"><div><b>'+hdSPAEsc((multi?x.map+' ':'')+x.node)+'</b><small>到達 '+x.visits+' / 戦闘 '+x.battles+(x.drops?' / Drop '+x.drops:'')+'</small></div><span>S '+x.sRate+'%｜A '+x.aRate+'%｜B '+x.bRate+'%｜撤退 '+x.retreatRate+'%</span></div>').join('')+'</div></div>':'';
 const routeHtml=routes.length?'<div class="hd-spa-route-panel"><div class="hd-spa-detail-head"><strong>ルート別分析</strong><span>ゲーム同期で取得した経路</span></div><div class="hd-spa-route-list">'+routes.map(x=>'<div><div><b>'+hdSPAEsc((multi?x.map+' ':'')+x.route)+'</b><small>'+x.n+'周'+(x.drops?' / Drop '+x.drops:'')+'</small></div><span>ボス '+x.bossRate+'%｜撤退 '+x.retreatRate+'%｜S '+x.sRate+'%</span></div>').join('')+'</div></div>':'';
 return '<div class="hd-spa-route-node">'+nodeHtml+routeHtml+'</div>';
}
function hdSPAInsightHtml(row){
 const danger=(row.dangerNodes||[]).slice(0,3),nt=row.nodeTrend,compare=row.routeComparison,multi=(row.maps||[]).length>1;
 const dangerHtml=danger.length?'<div class="hd-spa-insight-block danger"><strong>危険マス</strong><div>'+danger.map(x=>'<span><b>'+hdSPAEsc((multi?x.map+' ':'')+x.node)+'</b> 撤退 '+x.retreats+'/'+x.visits+'（'+x.retreatRate+'%）</span>').join('')+'</div></div>':'<div class="hd-spa-insight-block"><strong>危険マス</strong><small>撤退記録なし</small></div>';
 let trendHtml='';
 if(!nt?.ready)trendHtml='<div class="hd-spa-insight-block"><strong>最近の悪化</strong><small>直近'+(nt?.windowSize||hdSPAWindow())+'周と前'+(nt?.windowSize||hdSPAWindow())+'周の比較待ち</small></div>';
 else{const worse=(nt.items||[]).filter(x=>x.delta>0).slice(0,3);trendHtml=worse.length?'<div class="hd-spa-insight-block warn"><strong>最近の悪化</strong><div>'+worse.map(x=>'<span><b>'+hdSPAEsc((multi?x.map+' ':'')+x.node)+'</b> +'+x.delta+'pt <small>('+x.previousRate+'%→'+x.recentRate+'%)</small></span>').join('')+'</div></div>':'<div class="hd-spa-insight-block"><strong>最近の悪化</strong><small>撤退率の悪化は検出していないよ</small></div>'}
 let routeHtml='';
 if(compare){const actual=compare.actual,refStats=compare.referenceStats;routeHtml='<div class="hd-spa-insight-block route"><strong>ルート差分</strong><span>構造図最短（参考） <b>'+hdSPAEsc(compare.referenceRoute)+'</b>'+(refStats?' <small>実績 '+refStats.n+'周 / ボス'+refStats.bossRate+'%</small>':' <small>実績なし</small>')+'</span>'+(actual?'<span>最多実績 <b>'+hdSPAEsc(actual.route)+'</b> <small>'+actual.n+'周 / ボス'+actual.bossRate+'% / 撤退'+actual.retreatRate+'%</small></span>':'<span>実績ルートなし</span>')+'<em class="'+(compare.matches?'match':'diff')+'">'+(compare.matches?'最多実績ルートは構造図最短と一致':'最多実績ルートは構造図最短と異なる')+'</em></div>';}
 if(!dangerHtml&&!trendHtml&&!routeHtml)return '';return '<div class="hd-spa-insights"><div class="hd-spa-detail-head"><strong>攻略インサイト</strong><span>実戦ログから自動検出</span></div>'+dangerHtml+trendHtml+routeHtml+'<small class="hd-spa-insight-note">構造図最短はHarborDesk内の海域グラフ上の参考経路。艦これの固定条件・確率分岐を含む「推奨ルート」判定ではないよ。</small></div>';
}
function hdSPACard(row){
 const m=row.metrics,sample=m.n<3?'<div class="hd-spa-sample warn">サンプル少なめ</div>':'<div class="hd-spa-sample">記録 '+m.n+'周</div>',badges=row.badges.length?'<div class="hd-spa-badges">'+row.badges.map(x=>'<span>'+hdSPAEsc(x)+'</span>').join('')+'</div>':'';
 const objective=row.objectiveSplit?'<span class="hd-spa-objective">目標 '+hdSPAEsc(row.objectiveTarget||'未記録')+'</span>':'';
 const reopen=row.recentRef?.available?'<button type="button" class="ghost small" data-hd-spa-reopen="'+hdSPAEsc(row.key)+'">この編成を準備表へ</button>':'';
 return `<article class="hd-spa-card" data-hd-spa-card="${hdSPAEsc(row.key)}">${badges}<div class="hd-spa-card-head"><div><strong>${hdSPAEsc(row.label)}</strong><div class="hd-spa-card-meta">${objective}<small>${hdSPAEsc(row.maps.join(' / '))}</small></div></div>${sample}</div>${hdSPASourceHtml(m)}<div class="hd-spa-metrics"><span>${row.objectiveSplit&&row.objectiveTarget?'目標到達':'ボス到達'} <b>${row.objectiveSplit&&row.objectiveTarget?m.objectiveReachedRate:m.bossRate}%</b></span><span>S勝利 <b>${m.sRate}%</b></span><span>B以上勝利 <b>${m.winRate}%</b></span><span>撤退 <b>${m.retreatRate}%</b></span><span>ドロップ <b>${m.dropRate}%</b></span><span>ドロップ種類 <b>${m.uniqueDrops}</b></span><span>平均資源 <b>${m.avgResource==null?'—':m.avgResource}</b></span><span>平均バケツ <b>${m.avgBuckets==null?'—':m.avgBuckets}</b></span><span>平均時間 <b>${m.avgDurationMin==null?'—':m.avgDurationMin+'分'}</b></span><span>開始時確認 <b>${m.avgReadiness==null?'—':m.avgReadiness+'%'}</b></span></div>${hdSPARetreatReasonHtml(row)}${hdSPADropHtml(row)}${hdSPAInsightHtml(row)}${hdSPANodeRouteHtml(row)}${hdSPATrendHtml(row)}${hdSPARecommendationHtml(row)}${reopen?'<div class="hd-spa-actions">'+reopen+'</div>':''}</article>`;
}
function hdSPAHtml(){
 const mode=hdSPAMode(),map=hdSPAMap(),windowSize=hdSPAWindow(),allLogs=hdSPALogs(),baseLogs=allLogs.filter(x=>map==='all'||x.map===map),objectiveOptions=hdSPAObjectiveOptions(baseLogs),objective=hdSPAActiveObjective(baseLogs),rows=hdSPARows(),maps=hdSPAMaps();
 if(!allLogs.length)return '<section class="hd-spa"><div class="hd-spa-head"><div><div class="eyebrow">SORTIE PERFORMANCE</div><strong>出撃データ分析</strong><span>ゲーム同期または出撃ログを記録すると、海域別の実績とドロップ履歴がここに出るよ。</span></div></div></section>';
 const objectiveSelect=objectiveOptions.length?'<select data-hd-spa-objective><option value="all">全目標</option>'+objectiveOptions.map(x=>'<option value="'+hdSPAEsc(x.value)+'" '+(objective===x.value?'selected':'')+'>'+hdSPAEsc(x.label)+'</option>').join('')+'</select>':'';
 return `<section class="hd-spa"><div class="hd-spa-head"><div><div class="eyebrow">SORTIE PERFORMANCE</div><strong>出撃データ分析</strong><span>ゲーム同期・実戦モード・手動ログをまとめて自動集計</span></div><div class="hd-spa-controls"><select data-hd-spa-mode><option value="map" ${mode==='map'?'selected':''}>海域別</option><option value="strategy" ${mode==='strategy'?'selected':''}>方針別</option><option value="fleet" ${mode==='fleet'?'selected':''}>保存編成別</option></select><select data-hd-spa-map><option value="all">全海域</option>${maps.map(x=>`<option value="${hdSPAEsc(x)}" ${map===x?'selected':''}>${hdSPAEsc(x)} ${hdSPAEsc(hdSPAMapName(x))}</option>`).join('')}</select>${objectiveSelect}<select data-hd-spa-window><option value="3" ${windowSize===3?'selected':''}>直近3周比較</option><option value="5" ${windowSize===5?'selected':''}>直近5周比較</option><option value="10" ${windowSize===10?'selected':''}>直近10周比較</option></select></div></div>${rows.length?'<div class="hd-spa-grid">'+rows.map(hdSPACard).join('')+'</div>':'<div class="hd-spa-empty">この条件に一致する出撃ログはまだないよ。</div>'}<p class="hd-spa-note">※ゲーム同期・実戦モード・手動ログを集計。複数攻略目標を記録した海域は目標ごとに分離・絞り込みできる。資源/バケツ・時間・開始時確認は値を持つログだけで平均する。マス別の勝敗はゲーム同期の各戦闘結果を優先し、撤退率はそのマスへの到達数に対する撤退回数。ルート別分析はゲーム同期で取得できた通過ルートだけを対象にする。</p></section>`;
}
function hdSPARender(){
 const root=document.getElementById('sortieLog');if(!root)return;
 root.querySelector('.hd-spa')?.remove();
 const summary=document.getElementById('hdSLSummary'),wrap=document.createElement('div');wrap.innerHTML=hdSPAHtml();const sec=wrap.firstElementChild;
 if(sec){if(summary)summary.insertAdjacentElement('afterend',sec);else root.appendChild(sec)}
}
function hdSPAInstall(){
 if(window.__hdSortiePerformanceInstalled||typeof hdSLRender!=='function')return false;
 window.__hdSortiePerformanceInstalled=true;const prev=hdSLRender;
 hdSLRender=function(){const v=prev.apply(this,arguments);setTimeout(hdSPARender,0);return v};
 setTimeout(hdSPARender,0);return true;
}
function hdSPAReopen(key){
 const row=hdSPARows().find(x=>x.key===key),ref=row?.recentRef;if(!ref?.available)return false;
 try{
  if(typeof selectedWorld!=='undefined')selectedWorld=String(ref.map).split('-')[0];
  if(typeof selectedMap!=='undefined')selectedMap=ref.map;
  if(typeof renderMapPicker==='function')renderMapPicker();
  if(typeof hdSPMSelect==='function')hdSPMSelect(ref.map,ref.fleetId);
  if(typeof hdSPSOpen==='function')hdSPSOpen();else if(typeof hdWSShowElement==='function')hdWSShowElement('hdSortiePreparation',true);
  return true;
 }catch{return false}
}
document.addEventListener('change',e=>{
 const m=e.target.closest?.('[data-hd-spa-mode]');if(m){hdSPASetMode(m.value);hdSPARender();return}
 const map=e.target.closest?.('[data-hd-spa-map]');if(map){hdSPASetMap(map.value);hdSPASetObjective('all');hdSPARender();return}
 const objective=e.target.closest?.('[data-hd-spa-objective]');if(objective){hdSPASetObjective(objective.value);hdSPARender();return}
 const win=e.target.closest?.('[data-hd-spa-window]');if(win){hdSPASetWindow(win.value);hdSPARender();return}
});
document.addEventListener('click',e=>{
 const b=e.target.closest?.('[data-hd-spa-reopen]');if(b){hdSPAReopen(b.dataset.hdSpaReopen);return}
 const r=e.target.closest?.('[data-hd-spa-review]');if(r){hdSPAReview(r.dataset.hdSpaReview,r.dataset.hdSpaAction,r.dataset.hdSpaModeTarget);return}
});
window.addEventListener('storage',e=>{if(e.key==='harbordesk-sortie-log-v1')hdSPARender()});
window.addEventListener('load',()=>setTimeout(()=>{if(!hdSPAInstall())setTimeout(hdSPAInstall,500)},1500));
hdSPAInstall();
