const HD_SS_KEY='harbordesk-active-sortie-session-v1';
const HD_SS_POST_KEY='harbordesk-post-sortie-review-v1';
const HD_SS_OBJECTIVE_PREF_KEY='harbordesk-sortie-objective-pref-v1';

function hdSSEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function hdSSLoad(){try{return JSON.parse(localStorage.getItem(HD_SS_KEY)||'null')}catch{return null}}
function hdSSSave(v){if(v)localStorage.setItem(HD_SS_KEY,JSON.stringify(v));else localStorage.removeItem(HD_SS_KEY)}
function hdSSPostLoad(){try{return JSON.parse(localStorage.getItem(HD_SS_POST_KEY)||'null')}catch{return null}}
function hdSSPostSave(v){if(v)localStorage.setItem(HD_SS_POST_KEY,JSON.stringify(v));else localStorage.removeItem(HD_SS_POST_KEY)}
function hdSSObjectivePrefs(){try{const x=JSON.parse(localStorage.getItem(HD_SS_OBJECTIVE_PREF_KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}}
function hdSSObjectivePref(map){return String(hdSSObjectivePrefs()[String(map||'')]||'').trim()}
function hdSSApplyObjectivePref(session,map){
 if(!session)return session;
 const objectiveTarget=hdSSObjectivePref(map);
 if(objectiveTarget)session.draft={...(session.draft||{}),objectiveTarget};
 return session;
}

function hdSSUid(){return crypto.randomUUID?crypto.randomUUID():'ss-'+Date.now()+'-'+Math.random().toString(16).slice(2)}
function hdSSMap(){return typeof hdSPSMap==='function'?hdSPSMap():(typeof selectedMap!=='undefined'?selectedMap:'')}
function hdSSFleet(map){
 try{const fleets=typeof hdSortieFleets==='function'?hdSortieFleets(map):(typeof loadCustomFleets==='function'?(loadCustomFleets()[map]||[]):[]),id=typeof hdSortieSelection==='function'?hdSortieSelection(map):'';return fleets.find(function(x){return x.id===id})||fleets[0]||null}catch{return null}
}
function hdSSStrategy(fleet){
 if(typeof hdSPMStrategy==='function')return hdSPMStrategy(fleet);
 return String(fleet&&fleet.strategy||'manual');
}
function hdSSStrategyLabel(fleet){
 if(fleet&&fleet.strategyLabel)return fleet.strategyLabel;
 const id=hdSSStrategy(fleet);
 if(typeof HD_SPM_STRATEGIES!=='undefined'&&HD_SPM_STRATEGIES[id])return HD_SPM_STRATEGIES[id].label;
 return id==='manual'?'手動編成':id;
}
function hdSSStats(map,fleet){
 if(typeof hdSPMStats==='function')return hdSPMStats(map,fleet);
 let auto={checks:[],adv:{}};try{if(typeof hdSortieAutoChecks==='function')auto=hdSortieAutoChecks(map,fleet)}catch{}
 let manual=[];try{if(typeof hdSortieManualChecks==='function')manual=hdSortieManualChecks(map,auto.adv||{})}catch{}
 let state={};try{if(typeof hdSortieState==='function')state=hdSortieState(map,fleet.id)||{}}catch{}
 const ships=(fleet.ships||[]).filter(function(x){return String(x.ship||'').trim()||String(x.gear||'').trim()});
 return {ships:ships,shipCount:ships.filter(function(x){return String(x.ship||'').trim()}).length,auto:auto,autoOk:(auto.checks||[]).filter(function(x){return x.state==='ok'}).length,autoTotal:(auto.checks||[]).length,unresolved:(auto.checks||[]).filter(function(x){return x.state!=='ok'}),manual:manual,manualDone:manual.filter(function(x){return state[x.id]}).length,manualTotal:manual.length};
}
function hdSSGate(map,fleet,stats){
 let raw=null;
 try{
  if(typeof hdFEPlanFromSavedFleet==='function'&&typeof hdFEEvaluate==='function'&&typeof hdFEGoNoGo==='function'){
   const plan=hdFEPlanFromSavedFleet(map,fleet),evaluation=hdFEEvaluate(plan);
   raw=hdFEGoNoGo(evaluation?.auto);
  }
 }catch{}
 const base=raw||{state:'hold',label:'要確認',detail:'統合出撃判定を取得できないため手動確認',blockers:[],cautions:[],actions:[]};
 const blockers=Array.isArray(base.blockers)?base.blockers:[],hard=blockers.filter(x=>x?.id==='health'||x?.id==='supply'),actions=[...(Array.isArray(base.actions)?base.actions:[])];
 const manualLeft=Math.max(0,(Number(stats?.manualTotal)||0)-(Number(stats?.manualDone)||0)),post=hdSSPostLoad(),postAwaiting=!!(post&&post.status==='awaiting-sync'&&String(post.map||'')===String(map||'')&&(!post.fleetId||!fleet?.id||String(post.fleetId)===String(fleet.id)));
 let state=base.state||'hold';
 if(manualLeft&&state==='go')state='hold';
 if(manualLeft)actions.push({id:'manual',label:'出撃直前チェック',status:'manual',action:'出撃直前の手動チェックを完了する',detail:`未確認 ${manualLeft}件`});
 if(postAwaiting){if(state==='go')state='hold';actions.unshift({id:'postSync',label:'帰還後同期',status:'manual',action:'艦これを再同期して帰還後の状態を確認',detail:'前回出撃後のライブ状態が未更新'});}
 const label=state==='go'?'出撃準備OK':state==='stop'?'修正必要':'要確認';
 const detail=hard.length?`安全上の修正が必要 ${hard.length}件`:postAwaiting&&state!=='stop'?'前回出撃後の再同期がまだ。次回出撃前にライブ状態を更新しよう':manualLeft&&state==='hold'?`手動確認が ${manualLeft}件残っている`:(base.detail||'確認が必要');
 return {state,label,detail,hardBlock:hard.length>0,hardBlockers:hard,blockers,cautions:Array.isArray(base.cautions)?base.cautions:[],actions,postAwaiting};
}
function hdSSTelemetry(map,fleet){
 try{
  if(typeof hdFEPlanFromSavedFleet!=='function'||typeof hdFEEvaluate!=='function')return null;
  const plan=hdFEPlanFromSavedFleet(map,fleet),evaluation=hdFEEvaluate(plan),auto=evaluation?.auto||null,gate=auto&&typeof hdFEGoNoGo==='function'?hdFEGoNoGo(auto):null,sync=(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-kancolle-sync-v1')||'null')}catch{return null}})();
  if(!auto)return null;
  return {
   capturedAt:Date.now(),syncAt:Number(sync?.syncedAt)||0,
   gate:gate?{state:gate.state||'hold',label:gate.label||'',detail:gate.detail||'',actions:(gate.actions||[]).slice(0,6).map(x=>({id:x.id||'',action:x.action||'',detail:x.detail||''}))}:null,
   live:auto.live?{status:auto.live.status||'',blocked:Number(auto.live.blocked)||0,caution:Number(auto.live.caution)||0,details:(auto.live.details||[]).map(x=>({name:x.name||'',status:x.status||'',labels:x.labels||[],hp:Number(x.hp)||0,maxHp:Number(x.maxHp)||0,cond:x.cond==null?null:Number(x.cond)}))}:null,
   supply:auto.supply?{status:auto.supply.status||'',low:Number(auto.supply.low)||0,empty:Number(auto.supply.empty)||0,rows:(auto.supply.rows||[]).map(x=>({name:x.name||'',currentFuel:Number(x.currentFuel)||0,currentAmmo:Number(x.currentAmmo)||0,maxFuel:Number(x.maxFuel)||0,maxAmmo:Number(x.maxAmmo)||0,known:!!x.known}))}:null,
   air:auto.air?{status:auto.air.status||'',ours:Number(auto.air.ours)||0,enemy:Number(auto.air.enemy)||0,depletedSlots:Number(auto.air.depletedSlots)||0}:null
  };
 }catch{return null}
}
function hdSSSnapshot(map){
 const fleet=hdSSFleet(map);if(!fleet)return null;
 const stats=hdSSStats(map,fleet),strategy=hdSSStrategy(fleet),gate=hdSSGate(map,fleet,stats),telemetry=hdSSTelemetry(map,fleet);
 return {
  id:hdSSUid(),map:map,startedAt:Date.now(),fleetId:fleet.id,fleetName:fleet.name||'名称なし',strategy:strategy,strategyLabel:hdSSStrategyLabel(fleet),
  fleetSnapshot:{id:fleet.id,name:fleet.name||'',strategy:strategy,strategyLabel:hdSSStrategyLabel(fleet),ships:JSON.parse(JSON.stringify(fleet.ships||[])),memo:fleet.memo||''},
  readinessSnapshot:{autoOk:stats.autoOk,autoTotal:stats.autoTotal,manualDone:stats.manualDone,manualTotal:stats.manualTotal,unresolved:(stats.unresolved||[]).map(function(x){return {label:x.label||'',state:x.state||'',detail:x.detail||''}}),gate:{state:gate.state,label:gate.label,detail:gate.detail,hardBlock:gate.hardBlock,actions:gate.actions.slice(0,8).map(x=>({id:x.id||'',action:x.action||'',detail:x.detail||''}))}},
  telemetrySnapshot:telemetry,
  shipCount:stats.shipCount,status:'active'
 };
}
function hdSSEmit(action,detail={}){try{window.dispatchEvent(new CustomEvent('hd:sortie-session-changed',{detail:{action,...detail}}))}catch{}}
function hdSSStart(map,options={}){
 if(hdSSLoad())return null;
 const fleet=hdSSFleet(map);if(!fleet)return null;
 const stats=hdSSStats(map,fleet),gate=hdSSGate(map,fleet,stats),force=!!options?.force;
 if(gate.hardBlock)return null;
 if(gate.state==='stop'&&!force)return null;
 const session=hdSSApplyObjectivePref(hdSSSnapshot(map),map);if(!session||!session.shipCount)return null;
 session.seriesId=String(options?.seriesId||session.id);
 session.cycleIndex=Math.max(1,Number(options?.cycleIndex)||1);
 session.previousSessionId=String(options?.previousSessionId||'');
 session.previousEntryId=String(options?.previousEntryId||'');
 if(force&&session.readinessSnapshot?.gate)session.readinessSnapshot.gate.overridden=true;
 hdSSPostSave(null);hdSSSave(session);hdSSRender();hdSSEmit('start',{session,gate,forced:force});return session;
}
function hdSSClear(){const session=hdSSLoad();hdSSSave(null);hdSSRender();hdSSEmit('clear',{session});return true}
function hdSSDuration(ms){
 const m=Math.max(0,Math.floor((Number(ms)||0)/60000)),h=Math.floor(m/60),r=m%60;
 return h?h+'時間'+r+'分':m+'分';
}
function hdSSFinish(data){
 const session=hdSSLoad();if(!session||typeof hdSLRecordEntry!=='function')return null;
 const at=Date.now(),retreat=data?.retreat!=null?!!data.retreat:String(data?.result||'')==='撤退',result=retreat?'撤退':(data&&data.result||'S'),memoParts=[];
 if(session.strategyLabel)memoParts.push(session.strategyLabel);
 if(data&&String(data.memo||'').trim())memoParts.push(String(data.memo).trim());
 const input={
  map:session.map,node:data&&data.node||'',result,boss:!!(data&&data.boss),retreat,
  battles:Math.max(0,Number(data&&data.battles)||0),drop:data&&data.drop||'',buckets:Math.max(0,Number(data&&data.buckets)||0),
  fuel:Math.max(0,Number(data&&data.fuel)||0),ammo:Math.max(0,Number(data&&data.ammo)||0),steel:Math.max(0,Number(data&&data.steel)||0),bauxite:Math.max(0,Number(data&&data.bauxite)||0),
  memo:memoParts.join('｜'),retreatReason:String(data&&data.retreatReason||''),objectiveTarget:String(data&&data.objectiveTarget||''),sessionId:session.id,fleetId:session.fleetId,fleetName:session.fleetName,strategy:session.strategy,strategyLabel:session.strategyLabel,
  seriesId:String(session.seriesId||session.id),cycleIndex:Math.max(1,Number(session.cycleIndex)||1),previousSessionId:String(session.previousSessionId||''),previousEntryId:String(session.previousEntryId||''),
  startedAt:session.startedAt,durationMs:Math.max(0,at-session.startedAt),fleetSnapshot:session.fleetSnapshot,readinessSnapshot:session.readinessSnapshot
 };
 for(const k of ['source','gameSortieKey','gameNodeNo','gameNodeLabel','gameBossCellNo','gameBossCellLabel','gameRouteNodes','gameRouteLabels','gameBattleResults']){
  if(data?.[k]!=null)input[k]=data[k];
 }
 if(data?.huntId!=null)input.huntId=data.huntId;if(data?.huntShip!=null)input.huntShip=data.huntShip;if(data?.targetObtained!=null)input.targetObtained=!!data.targetObtained;
 const entry=hdSLRecordEntry(input);
 if(!entry)return null;
 hdSSPostSave({version:1,status:'awaiting-sync',sessionId:session.id,map:session.map,fleetId:session.fleetId,fleetName:session.fleetName,seriesId:String(session.seriesId||session.id),cycleIndex:Math.max(1,Number(session.cycleIndex)||1),previousSessionId:String(session.previousSessionId||''),previousEntryId:String(session.previousEntryId||''),finishedAt:at,entryId:String(entry.id||''),fleetSnapshot:session.fleetSnapshot,startTelemetry:session.telemetrySnapshot||null,gameMatched:!!data?.gameSortieKey});
 hdSSSave(null);try{if(typeof hdSPSRender==='function')hdSPSRender();if(typeof hdSLRender==='function')hdSLRender()}catch{}
 hdSSEmit('finish',{session,entry,postReview:hdSSPostLoad(),gameMatched:!!data?.gameSortieKey});return entry;
}
function hdSSGameSortieMatches(sessionLike,payload){
 if(!sessionLike||!payload||String(sessionLike.map||'')!==String(payload.map||''))return false;
 const sessionAt=Number(sessionLike.startedAt||sessionLike.fleetSnapshot?.startedAt)||0,gameAt=Number(payload.startedAt)||0;
 if(!sessionAt||!gameAt)return true;
 const diff=gameAt-sessionAt;
 return diff>=-120000&&diff<=6*60*60*1000;
}
function hdSSMergeGameSortieIntoLog(post,payload){
 if(!post||!payload)return null;
 let rows=[];try{rows=typeof hdSLLoad==='function'?hdSLLoad():JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]')}catch{rows=[]}
 if(!Array.isArray(rows)||!rows.length)return null;
 const entryId=String(post.entryId||''),sessionId=String(post.sessionId||'');
 let index=entryId?rows.findIndex(x=>String(x?.id||'')===entryId):-1;
 if(index<0&&sessionId)index=rows.findIndex(x=>String(x?.sessionId||'')===sessionId);
 if(index<0)return null;
 const current=rows[index];
 if(!hdSSGameSortieMatches({map:current.map,startedAt:current.startedAt},payload))return null;
 const retreat=payload.retreat!=null?!!payload.retreat:String(payload.result||'')==='撤退',result=retreat?'撤退':String(payload.result||current.result||'不明');
 const gameFields={};
 for(const k of ['gameSortieKey','gameNodeNo','gameNodeLabel','gameBossCellNo','gameBossCellLabel','gameRouteNodes','gameRouteLabels','gameBattleResults'])if(payload[k]!=null)gameFields[k]=payload[k];
 rows[index]={...current,...gameFields,source:'session-game',node:String(payload.node||current.node||''),result,boss:!!payload.boss,retreat,battles:Math.max(0,Number(payload.battles)||0),drop:String(payload.drop||''),gameMatchedAt:Date.now()};
 if(payload.retreatReason)rows[index].retreatReason=String(payload.retreatReason);
 if(typeof hdSLSave==='function')hdSLSave(rows);else localStorage.setItem('harbordesk-sortie-log-v1',JSON.stringify(rows.slice(0,500)));
 try{if(typeof hdSLRender==='function')hdSLRender();if(typeof hdCCRender==='function')hdCCRender()}catch{}
 try{window.dispatchEvent(new CustomEvent('hd:sortie-game-result-matched',{detail:{entry:rows[index],payload}}))}catch{}
 return rows[index];
}
function hdSSIngestGameSortie(payload){
 if(!payload?.map)return null;
 const active=hdSSLoad();
 if(active&&active.status==='active'&&hdSSGameSortieMatches(active,payload)){
  return hdSSFinish({...payload,source:'session-game',autoGameResult:true});
 }
 const post=hdSSPostLoad();
 if(post&&['awaiting-sync','reviewed'].includes(String(post.status||''))&&String(post.map||'')===String(payload.map||'')){
  const merged=hdSSMergeGameSortieIntoLog(post,payload);
  if(merged){
   const next={...post,gameMatched:true,gameMatchedAt:Date.now(),gameSortieKey:String(payload.gameSortieKey||post.gameSortieKey||'')};
   hdSSPostSave(next);hdSSEmit('game-result-match',{entry:merged,postReview:next});return merged;
  }
 }
 return null;
}
function hdSSPostDelta(start,current){
 start=start||{};current=current||{};
 const sd=Array.isArray(start.live?.details)?start.live.details:[],cd=Array.isArray(current.live?.details)?current.live.details:[],ships=[];
 const rank={unknown:0,ready:1,caution:2,blocked:3};
 for(let i=0;i<cd.length;i++){
  const a=sd[i]||{},b=cd[i]||{},hpA=Number(a.hp)||0,hpB=Number(b.hp)||0,statusA=String(a.status||'unknown'),statusB=String(b.status||'unknown'),hpLoss=Math.max(0,hpA-hpB);
  if(hpLoss>0||(rank[statusB]||0)>(rank[statusA]||0))ships.push({name:b.name||a.name||`#${i+1}`,hpBefore:hpA,hpAfter:hpB,hpLoss,statusBefore:statusA,statusAfter:statusB,labels:b.labels||[]});
 }
 const ss=Array.isArray(start.supply?.rows)?start.supply.rows:[],cs=Array.isArray(current.supply?.rows)?current.supply.rows:[];let fuelUsed=0,ammoUsed=0,supplyKnown=0;
 for(let i=0;i<cs.length;i++){const a=ss[i]||{},b=cs[i]||{};if(a.known&&b.known){supplyKnown++;fuelUsed+=Math.max(0,(Number(a.currentFuel)||0)-(Number(b.currentFuel)||0));ammoUsed+=Math.max(0,(Number(a.currentAmmo)||0)-(Number(b.currentAmmo)||0))}}
 const airBefore=Number(start.air?.ours)||0,airAfter=Number(current.air?.ours)||0,airLoss=Math.max(0,airBefore-airAfter),depletedBefore=Number(start.air?.depletedSlots)||0,depletedAfter=Number(current.air?.depletedSlots)||0,depletedAdded=Math.max(0,depletedAfter-depletedBefore);
 const newBlocked=Math.max(0,(Number(current.live?.blocked)||0)-(Number(start.live?.blocked)||0)),newCaution=Math.max(0,(Number(current.live?.caution)||0)-(Number(start.live?.caution)||0)),newSupply=Math.max(0,((Number(current.supply?.empty)||0)+(Number(current.supply?.low)||0))-((Number(start.supply?.empty)||0)+(Number(start.supply?.low)||0)));
 const changed=!!(ships.length||fuelUsed||ammoUsed||airLoss||depletedAdded||newBlocked||newCaution||newSupply);
 return {changed,ships,fuelUsed,ammoUsed,supplyKnown,airBefore,airAfter,airLoss,depletedBefore,depletedAfter,depletedAdded,newBlocked,newCaution,newSupply};
}
function hdSSAttachReviewToLog(postReview){
 if(!postReview)return false;
 const entryId=String(postReview.entryId||''),sessionId=String(postReview.sessionId||'');
 let rows=[];
 try{rows=typeof hdSLLoad==='function'?hdSLLoad():JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]')}catch{rows=[]}
 if(!Array.isArray(rows)||!rows.length)return false;
 let index=entryId?rows.findIndex(x=>String(x?.id||'')===entryId):-1;
 if(index<0&&sessionId)index=rows.findIndex(x=>String(x?.sessionId||'')===sessionId);
 if(index<0)return false;
 const review=postReview.review||{},gate=review.gate||{},delta=review.delta||{};
 rows[index]={...rows[index],postSortieReview:{
  reviewedAt:Number(postReview.reviewedAt)||Date.now(),syncAt:Number(postReview.syncAt)||0,
  gate:{state:String(gate.state||'hold'),label:String(gate.label||''),detail:String(gate.detail||'')},
  delta:{
   changed:!!delta.changed,
   ships:Array.isArray(delta.ships)?delta.ships.map(x=>({name:String(x?.name||''),hpBefore:Number(x?.hpBefore)||0,hpAfter:Number(x?.hpAfter)||0,hpLoss:Number(x?.hpLoss)||0,statusBefore:String(x?.statusBefore||''),statusAfter:String(x?.statusAfter||'')})):[],
   fuelUsed:Number(delta.fuelUsed)||0,ammoUsed:Number(delta.ammoUsed)||0,supplyKnown:Number(delta.supplyKnown)||0,
   airBefore:Number(delta.airBefore)||0,airAfter:Number(delta.airAfter)||0,airLoss:Number(delta.airLoss)||0,
   depletedBefore:Number(delta.depletedBefore)||0,depletedAfter:Number(delta.depletedAfter)||0,depletedAdded:Number(delta.depletedAdded)||0,
   newBlocked:Number(delta.newBlocked)||0,newCaution:Number(delta.newCaution)||0,newSupply:Number(delta.newSupply)||0
  },
  live:review.live?{blocked:Number(review.live.blocked)||0,caution:Number(review.live.caution)||0,status:String(review.live.status||'')}:null,
  supply:review.supply?{empty:Number(review.supply.empty)||0,low:Number(review.supply.low)||0,status:String(review.supply.status||'')}:null,
  air:review.air?{ours:Number(review.air.ours)||0,enemy:Number(review.air.enemy)||0,depletedSlots:Number(review.air.depletedSlots)||0,status:String(review.air.status||'')}:null
 }};
 if(typeof hdSLSave==='function')hdSLSave(rows);else localStorage.setItem('harbordesk-sortie-log-v1',JSON.stringify(rows.slice(0,500)));
 try{if(typeof hdSLRender==='function')hdSLRender();if(typeof hdCCRender==='function')hdCCRender()}catch{}
 try{window.dispatchEvent(new CustomEvent('hd:sortie-post-review-saved',{detail:{entryId:rows[index].id,postSortieReview:rows[index].postSortieReview}}))}catch{}
 return true;
}
function hdSSPostQueueBuild(gate,previous=[]){
 const current=new Map((gate?.actions||[]).filter(x=>x?.id).slice(0,8).map(x=>[String(x.id),{id:String(x.id),action:String(x.action||''),detail:String(x.detail||'')}]))
 const out=[],now=Date.now();
 for(const old of Array.isArray(previous)?previous:[]){
  const id=String(old?.id||'');if(!id)continue;
  const hit=current.get(id);
  if(hit){out.push({...old,...hit,status:'pending',resolvedAt:null});current.delete(id)}
  else out.push({...old,status:'resolved',resolvedAt:Number(old?.resolvedAt)||now});
 }
 for(const hit of current.values())out.push({...hit,status:'pending',createdAt:now,resolvedAt:null});
 return out.slice(0,8);
}
function hdSSPostQueueSummary(queue){
 const rows=Array.isArray(queue)?queue:[],resolved=rows.filter(x=>x?.status==='resolved').length,pending=rows.filter(x=>x?.status!=='resolved').length;
 return {total:rows.length,resolved,pending,next:rows.find(x=>x?.status!=='resolved')||null};
}
function hdSSPostTryReview(sync){
 const post=hdSSPostLoad();if(!post||post.status!=='awaiting-sync')return post;
 const syncAt=Number(sync?.syncedAt)||(()=>{try{return Number(JSON.parse(localStorage.getItem('harbordesk-kancolle-sync-v1')||'null')?.syncedAt)||0}catch{return 0}})();
 if(!syncAt||syncAt<=Number(post.finishedAt||0))return post;
 const telemetry=hdSSTelemetry(post.map,post.fleetSnapshot);if(!telemetry)return post;
 const gate=telemetry.gate||{state:'hold',label:'要確認',detail:'帰還後判定を取得できない',actions:[]},queue=hdSSPostQueueBuild(gate,[]);
 const delta=hdSSPostDelta(post.startTelemetry,telemetry),next={...post,status:'reviewed',reviewedAt:Date.now(),syncAt,review:{gate,live:telemetry.live,supply:telemetry.supply,air:telemetry.air,delta,queue}};
 hdSSPostSave(next);hdSSAttachReviewToLog(next);hdSSEmit('post-review',{postReview:next});return next;
}
function hdSSPostRefreshReview(sync){
 const post=hdSSPostLoad();if(!post)return null;
 if(post.status==='awaiting-sync')return hdSSPostTryReview(sync);
 if(post.status!=='reviewed')return post;
 const telemetry=hdSSTelemetry(post.map,post.fleetSnapshot);if(!telemetry)return post;
 const gate=telemetry.gate||{state:'hold',label:'要確認',detail:'帰還後判定を取得できない',actions:[]},queue=hdSSPostQueueBuild(gate,post.review?.queue||[]);
 const syncAt=Math.max(Number(post.syncAt)||0,Number(sync?.syncedAt)||0,Number(telemetry.syncAt)||0),delta=hdSSPostDelta(post.startTelemetry,telemetry);
 const next={...post,reviewedAt:Date.now(),syncAt,review:{gate,live:telemetry.live,supply:telemetry.supply,air:telemetry.air,delta,queue}};
 hdSSPostSave(next);hdSSEmit('post-refresh',{postReview:next});return next;
}
function hdSSPostStartReprepare(){
 const post=hdSSPostLoad();if(!post||post.status!=='reviewed')return false;
 const summary=hdSSPostQueueSummary(post.review?.queue||[]),next=summary.next;if(!next)return false;
 hdSSPostSave({...post,reprepare:{startedAt:Number(post.reprepare?.startedAt)||Date.now(),currentId:next.id,updatedAt:Date.now()}});
 if(typeof hdFEOpenFix==='function')return !!hdFEOpenFix(next.id);
 return false;
}
function hdSSPostFleet(post){
 const map=String(post?.map||''),id=String(post?.fleetId||'');
 if(!map||!id)return null;
 try{
  const fleets=typeof hdSortieFleets==='function'?hdSortieFleets(map):(typeof loadCustomFleets==='function'?(loadCustomFleets()[map]||[]):[]);
  return fleets.find(x=>String(x?.id||'')===id)||null;
 }catch{return null}
}
function hdSSPostPreflightState(post){
 const fleet=hdSSPostFleet(post);if(!fleet)return {ready:false,state:'missing',detail:'前回使用編成が見つからない',fleet:null,stats:null,gate:null};
 const stats=hdSSStats(post.map,fleet),gate=hdSSGate(post.map,fleet,stats),manualLeft=Math.max(0,(Number(stats?.manualTotal)||0)-(Number(stats?.manualDone)||0));
 return {ready:gate.state==='go'&&!gate.hardBlock&&manualLeft===0,state:gate.state,detail:gate.detail||'',fleet,stats,gate,manualLeft};
}
function hdSSSeriesRows(post){
 const id=String(post?.seriesId||post?.sessionId||'').trim();if(!id)return [];
 try{
  const rows=typeof hdSPALogs==='function'?hdSPALogs():(typeof hdSLLoad==='function'?hdSLLoad():JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]'));
  return (Array.isArray(rows)?rows:[]).filter(x=>String(x?.seriesId||'')===id).sort((a,b)=>(Number(a.at)||0)-(Number(b.at)||0));
 }catch{return []}
}
function hdSSSeriesAdvice(post){
 const rows=hdSSSeriesRows(post);if(rows.length<2)return null;
 const meta=typeof hdSPASeriesMeta==='function'?hdSPASeriesMeta(rows):null,metrics=typeof hdSPAMetrics==='function'?hdSPAMetrics(rows):null,trend=typeof hdSPATrend==='function'?hdSPATrend(rows,3):null,recent=rows.slice(-3),recentMetrics=typeof hdSPAMetrics==='function'?hdSPAMetrics(recent):null;
 const issues=trend?.ready?[...(trend.issues||[])]:[],recentFix=recent.filter(x=>['hold','stop'].includes(String(x?.postSortieReview?.gate?.state||''))).length,targetObtained=rows.some(x=>x?.targetObtained===true);
 let state='go',label='続行目安',detail='大きな悪化シグナルはまだ出ていないよ';
 if(targetObtained){state='done';label='目標達成';detail='目標艦の取得記録あり。周回を終える候補だよ'}
 else if(issues.length>=2||recentFix>=2){state='warn';label='一旦見直し推奨';detail=issues.slice(0,2).join(' / ')||(recentFix+' / '+recent.length+'周で帰還後の再修正が必要')}
 else if(issues.length){state='warn';label='注意しながら続行';detail=issues[0]}
 else if(recentFix){state='warn';label='再準備を確認';detail=recentFix+' / '+recent.length+'周で帰還後の再修正あり'}
 const avgResource=Number(recentMetrics?.avgResource??metrics?.avgResource),avgBuckets=Number(recentMetrics?.avgBuckets??metrics?.avgBuckets),avgDuration=Number(recentMetrics?.avgDurationMin??metrics?.avgDurationMin),projection={
  cycles:5,
  resource:Number.isFinite(avgResource)?Math.round(avgResource*5):null,
  buckets:Number.isFinite(avgBuckets)?Number((avgBuckets*5).toFixed(1)):null,
  minutes:Number.isFinite(avgDuration)?Number((avgDuration*5).toFixed(1)):null
 };
 return {state,label,detail,rows:rows.length,issues,recentFix,targetObtained,meta,metrics,recentMetrics,trend,projection};
}
function hdSSSeriesAdviceHtml(post){
 const a=hdSSSeriesAdvice(post);if(!a)return '';
 const p=a.projection||{},bits=[];if(p.resource!=null)bits.push('資源 約'+p.resource);if(p.buckets!=null)bits.push('バケツ 約'+p.buckets);if(p.minutes!=null)bits.push('時間 約'+p.minutes+'分');
 return '<div class="hd-ss-series-advice '+hdSSEsc(a.state)+'"><div class="hd-ss-series-advice-head"><div><span>連続周回の次周目安</span><b>'+hdSSEsc(a.label)+'</b></div><button type="button" class="ghost small" data-hd-ss-series-analysis>周回分析を見る</button></div><small>'+hdSSEsc(a.detail)+'</small>'+(bits.length?'<div class="hd-ss-series-projection"><span>今の直近平均であと5周</span><b>'+hdSSEsc(bits.join(' / '))+'</b></div>':'')+(a.trend?.ready&&a.issues?.length?'<div class="hd-ss-series-signals">'+a.issues.slice(0,3).map(x=>'<span>'+hdSSEsc(x)+'</span>').join('')+'</div>':'')+'</div>';
}
function hdSSOpenSeriesAnalytics(post=hdSSPostLoad()){
 if(typeof hdSPASetMode==='function')hdSPASetMode('series');else try{localStorage.setItem('harbordesk-sortie-analytics-mode-v1','series')}catch{}
 if(post?.map&&typeof hdSPASetMap==='function')hdSPASetMap(post.map);
 if(typeof hdWSShowElement==='function')hdWSShowElement('sortieLog',true);else document.getElementById('sortieLog')?.scrollIntoView({behavior:'smooth',block:'start'});
 setTimeout(()=>{try{if(typeof hdSPARender==='function')hdSPARender()}catch{}},0);return true;
}
function hdSSPostPrepareNextRound(){
 const post=hdSSPostLoad();if(!post||post.status!=='reviewed')return false;
 const q=hdSSPostQueueSummary(post.review?.queue||[]);if(q.pending)return false;
 if(String(post.review?.gate?.state||'hold')!=='go')return false;
 const fleet=hdSSPostFleet(post);if(!fleet)return false;
 if(typeof hdSortieSetSelection==='function')hdSortieSetSelection(post.map,fleet.id);
 if(typeof hdSortieReset==='function')hdSortieReset(post.map,fleet.id);
 const now=Date.now(),next={...post,reprepare:{...(post.reprepare||{}),startedAt:Number(post.reprepare?.startedAt)||now,currentId:null,preflightAt:now,updatedAt:now}};
 hdSSPostSave(next);hdSSEmit('next-preflight',{postReview:next,fleet});hdSSRender();
 if(typeof hdSPSOpenMapTab==='function')setTimeout(()=>hdSPSOpenMapTab('mine'),0);
 return true;
}
function hdSSPostStartNextRound(){
 const post=hdSSPostLoad();if(!post||post.status!=='reviewed'||!Number(post.reprepare?.preflightAt))return null;
 const q=hdSSPostQueueSummary(post.review?.queue||[]);if(q.pending)return null;
 const fleet=hdSSPostFleet(post);if(!fleet)return null;
 if(typeof hdSortieSetSelection==='function')hdSortieSetSelection(post.map,fleet.id);
 const current=hdSSPostPreflightState(post);if(!current.ready)return null;
 const session=hdSSStart(post.map,{
  seriesId:String(post.seriesId||post.sessionId||''),
  cycleIndex:Math.max(1,Number(post.cycleIndex)||1)+1,
  previousSessionId:String(post.sessionId||''),
  previousEntryId:String(post.entryId||'')
 });
 if(session)hdSSEmit('next-start',{session,previousSessionId:String(post.sessionId||''),previousEntryId:String(post.entryId||'')});
 return session;
}
function hdSSPostHtml(map){
 const post=hdSSPostLoad();if(!post)return '';
 const sameMap=!map||String(post.map||'')===String(map||''),title=sameMap?'前回出撃後':'前回 '+String(post.map||'')+' 出撃後';
 if(post.status==='awaiting-sync')return '<div class="hd-ss-post awaiting"><div><span>'+hdSSEsc(title)+'</span><strong>帰還後の再同期待ち</strong><small>艦状態・補給・艦載機損耗を更新すると、次の出撃可否を自動で再判定するよ。</small></div><div class="hd-ss-post-actions"><button type="button" class="primary small" data-hd-ss-post-sync>艦これ同期へ</button><button type="button" class="ghost small" data-hd-ss-post-clear>閉じる</button></div></div>';
 const review=post.review||{},gate=review.gate||{},state=gate.state||'hold',headline=state==='go'?'再出撃準備OK':state==='stop'?'連続出撃は修正必要':'再出撃前に確認',delta=review.delta||null,queue=Array.isArray(review.queue)?review.queue:hdSSPostQueueBuild(gate,[]),q=hdSSPostQueueSummary(queue);
 const meta=[];if(review.live)meta.push('艦状態 '+(review.live.blocked?('NG '+review.live.blocked+'隻'):review.live.caution?('注意 '+review.live.caution+'隻'):'OK'));if(review.supply)meta.push('補給 '+(review.supply.empty?('空 '+review.supply.empty+'隻'):review.supply.low?('不足 '+review.supply.low+'隻'):'OK'));if(review.air&&Number(review.air.depletedSlots)>0)meta.push('艦載機損耗 '+review.air.depletedSlots+'スロ');
 const deltaBits=[];if(delta){if(delta.ships?.length)deltaBits.push('耐久/状態変化 '+delta.ships.length+'隻');if(delta.fuelUsed)deltaBits.push('燃料 -'+delta.fuelUsed);if(delta.ammoUsed)deltaBits.push('弾薬 -'+delta.ammoUsed);if(delta.airLoss)deltaBits.push('制空 -'+delta.airLoss);if(delta.depletedAdded)deltaBits.push('新規損耗 +'+delta.depletedAdded+'スロ')}
 const deltaHtml=delta&&delta.changed?'<div class="hd-ss-post-delta"><b>今回の出撃で変わったところ</b><div>'+deltaBits.map(x=>'<span>'+hdSSEsc(x)+'</span>').join('')+'</div>'+(delta.ships?.length?'<small>'+delta.ships.slice(0,4).map(x=>hdSSEsc(x.name)+' HP '+x.hpBefore+'→'+x.hpAfter+(x.statusAfter!==x.statusBefore?' / '+hdSSEsc(x.statusAfter):'')).join(' ・ ')+'</small>':'')+'</div>':'<div class="hd-ss-post-delta clear"><b>今回の差分</b><small>同期範囲では新しい損傷・補給減少・制空低下を検出していないよ。</small></div>';
 const queueHtml=q.total?'<div class="hd-ss-reprep"><div class="hd-ss-reprep-head"><div><b>再出撃の再準備</b><span>'+q.resolved+'/'+q.total+' 完了'+(q.pending?' ・ 残り '+q.pending:'')+'</span></div>'+(q.pending?'<button type="button" class="primary small" data-hd-ss-reprep>'+(post.reprepare?'次の修正へ':'再準備を開始')+'</button>':'<b class="done">完了 ✓</b>')+'</div><div class="hd-ss-post-fixes">'+queue.map((x,i)=>{const done=x.status==='resolved',fix=typeof hdFEFixActionInfo==='function'?hdFEFixActionInfo(x.id):{label:'確認する'};return '<div class="'+(done?'resolved':'pending')+'"><span><b>'+(done?'✓ ':'')+(i+1)+'. '+hdSSEsc(x.action||x.detail||'確認')+'</b><small>'+hdSSEsc(done?'修正済み':(x.detail||''))+'</small></span>'+(done?'':'<button type="button" class="ghost small" data-hd-ss-post-fix="'+hdSSEsc(x.id||'')+'">'+hdSSEsc(fix.label||'確認する')+'</button>')+'</div>'}).join('')+'</div></div>':'';
 const cycle=Math.max(1,Number(post.cycleIndex)||1),nextCycle=cycle+1,preflight=Number(post.reprepare?.preflightAt)?hdSSPostPreflightState(post):null,seriesAdviceHtml=hdSSSeriesAdviceHtml(post);
 const cycleHtml=state==='go'&&!q.pending?'<div class="hd-ss-cycle '+(preflight?.ready?'ready':preflight?'checking':'')+'"><div><span>連続出撃</span><b>第'+cycle+'周 → 第'+nextCycle+'周</b></div><small>'+(preflight?(preflight.ready?'次周の出撃前チェック完了':'次周チェック中'+(preflight.manualLeft?' ・ 手動残り '+preflight.manualLeft+'件':'')):'次周は手動チェックを新しく確認してから開始')+'</small></div>':'';
 let primary='';
 if(q.pending)primary='<button type="button" class="primary small" data-hd-ss-reprep>再準備を続ける</button>';
 else if(state==='go'&&!preflight)primary='<button type="button" class="primary small" data-hd-ss-next-preflight>第'+nextCycle+'周チェックを開始</button>';
 else if(state==='go'&&preflight?.ready)primary='<button type="button" class="primary small" data-hd-ss-next-start>第'+nextCycle+'周を開始</button>';
 else if(state==='go'&&preflight)primary='<button type="button" class="primary small" data-hd-ss-check>出撃前チェックを続ける</button>';
 return '<div class="hd-ss-post '+hdSSEsc(state)+'"><div><span>'+hdSSEsc(title)+'</span><strong>'+hdSSEsc(headline)+'</strong><small>'+hdSSEsc(gate.detail||'帰還後の状態を再判定済み')+'</small>'+(meta.length?'<em>'+hdSSEsc(meta.join(' / '))+'</em>':'')+'</div>'+deltaHtml+queueHtml+seriesAdviceHtml+cycleHtml+'<div class="hd-ss-post-actions">'+primary+'<button type="button" class="ghost small" data-hd-ss-post-recheck>再判定</button><button type="button" class="ghost small" data-hd-ss-post-clear>確認済み</button></div></div>';
}
function hdSSSelectedSummary(map){
 const fleet=hdSSFleet(map);if(!fleet)return null;const stats=hdSSStats(map,fleet);
 return {fleet:fleet,stats:stats,strategyLabel:hdSSStrategyLabel(fleet)};
}
function hdSSIdleHtml(map){
 const row=hdSSSelectedSummary(map);
 if(!row)return '<section class="hd-ss"><div class="hd-ss-head"><div><div class="eyebrow">SORTIE SESSION</div><strong>実戦モード</strong><span>出撃編成を選ぶとセッションを開始できるよ。</span></div></div>'+hdSSPostHtml(map)+'</section>';
 const s=row.stats,gate=hdSSGate(map,row.fleet,s),manualReady=!s.manualTotal||s.manualDone===s.manualTotal,autoReady=!s.autoTotal||s.autoOk===s.autoTotal,ready=gate.state==='go'&&manualReady&&autoReady;
 const unresolved=(s.unresolved||[]).map(function(x){return x.label}).filter(Boolean).join('、'),next=gate.actions?.[0]?.action||'';
 const cls=gate.hardBlock||gate.state==='stop'?'stop':ready?'ready':'warn';
 let startButtons='';
 if(gate.hardBlock)startButtons='<button type="button" class="primary" disabled>安全確認が必要</button>';
 else if(gate.state==='stop')startButtons='<button type="button" class="primary" disabled>修正してから開始</button><button type="button" class="ghost small" data-hd-ss-start-override>それでも記録開始</button>';
 else startButtons='<button type="button" class="primary" data-hd-ss-start>'+(gate.state==='hold'?'要確認のまま出撃開始':'この編成で出撃開始')+'</button>';
 return '<section class="hd-ss '+cls+'"><div class="hd-ss-head"><div><div class="eyebrow">SORTIE SESSION</div><strong>実戦モード</strong><span>選択中の編成を固定して出撃記録へつなぐ</span></div><b>'+hdSSEsc(gate.label)+'</b></div>'+hdSSPostHtml(map)+'<div class="hd-ss-selected"><div><span>'+hdSSEsc(row.strategyLabel)+'</span><strong>'+hdSSEsc(row.fleet.name||'名称なし')+'</strong><small>'+s.shipCount+'隻</small></div><div class="hd-ss-readiness"><span>自動確認 <b>'+s.autoOk+'/'+s.autoTotal+'</b></span><span>手動確認 <b>'+s.manualDone+'/'+s.manualTotal+'</b></span></div></div><div class="hd-ss-gate '+hdSSEsc(gate.state)+'"><b>'+hdSSEsc(gate.detail)+'</b>'+(next?'<span>次: '+hdSSEsc(next)+'</span>':'')+'</div>'+(unresolved?'<p class="hd-ss-warning">要確認: '+hdSSEsc(unresolved)+'</p>':'')+'<div class="hd-ss-actions">'+startButtons+'<button type="button" class="ghost small" data-hd-ss-check>出撃前チェックを見る</button></div><p class="hd-ss-note">'+(gate.hardBlock?'大破・補給不足など安全上の修正が必要な間は、実戦セッションを開始しない。':gate.state==='stop'?'修正必要項目があるため通常開始は停止中。上書き開始は記録用途として明示的に選べる。':'開始時の編成・装備・判定状態をスナップショット保存する。')+'</p></section>';
}
function hdSSActiveHtml(session){
 const r=session.readinessSnapshot||{},unresolved=(r.unresolved||[]).map(function(x){return x.label}).filter(Boolean).join('、'),gate=r.gate||null,gateText=gate?(gate.label+(gate.overridden?'・上書き開始':'')):'';
 return '<section class="hd-ss active"><div class="hd-ss-head"><div><div class="eyebrow">SORTIE IN PROGRESS</div><strong>出撃中</strong><span>'+hdSSEsc(session.map)+'｜'+hdSSEsc(session.fleetName)+'</span></div><b>'+hdSSEsc(session.strategyLabel||'手動編成')+'</b></div><div class="hd-ss-active-meta">'+(Number(session.cycleIndex)>1?'<span>連続出撃 第'+Number(session.cycleIndex)+'周</span>':'')+(gateText?'<span>開始判定 '+hdSSEsc(gateText)+'</span>':'')+'<span>開始 '+hdSSEsc(new Date(session.startedAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}))+'</span><span>自動 '+(r.autoOk||0)+'/'+(r.autoTotal||0)+'</span><span>手動 '+(r.manualDone||0)+'/'+(r.manualTotal||0)+'</span></div>'+(unresolved?'<p class="hd-ss-warning">開始時の要確認: '+hdSSEsc(unresolved)+'</p>':'')+'<div class="hd-ss-return"><div class="hd-ss-return-head"><strong>帰還結果</strong><span>記録すると既存の出撃ログ・任務連動へ反映</span></div><div class="hd-ss-form"><label>結果<select id="hdSSResult"><option>S</option><option>A</option><option>B</option><option>C</option><option>D</option><option>撤退</option></select></label><label>到達マス<input id="hdSSNode" placeholder="例 ボス / P"></label><label>戦闘数<input id="hdSSBattles" type="number" min="0" max="20" value="1"></label><label class="hd-ss-check"><input id="hdSSBoss" type="checkbox">ボス到達</label><label>ドロップ<input id="hdSSDrop" placeholder="艦名など"></label><label>バケツ<input id="hdSSBuckets" type="number" min="0" value="0"></label><label>燃料<input id="hdSSFuel" type="number" min="0" value="0"></label><label>弾薬<input id="hdSSAmmo" type="number" min="0" value="0"></label><label>鋼材<input id="hdSSSteel" type="number" min="0" value="0"></label><label>ボーキ<input id="hdSSBauxite" type="number" min="0" value="0"></label><label class="hd-ss-wide">メモ<input id="hdSSMemo" placeholder="撤退原因、装備変更など"></label></div><div class="hd-ss-actions"><button type="button" class="primary" data-hd-ss-finish>帰還結果を記録</button><button type="button" class="ghost small" data-hd-ss-cancel>このセッションを破棄</button></div></div><p class="hd-ss-note">出撃中に保存プリセットを切り替えても、このセッションは開始時の編成スナップショットを保持するよ。</p></section>';
}
function hdSSHtml(map){const active=hdSSLoad();return active?hdSSActiveHtml(active):hdSSIdleHtml(map)}
function hdSSRender(){
 const body=document.getElementById('hdSortiePreparationBody');if(!body)return;
 body.querySelector('.hd-ss')?.remove();const map=hdSSMap();if(!map&&!hdSSLoad())return;
 const overview=body.querySelector('.hd-sps-overview');if(!overview)return;
 const wrap=document.createElement('div');wrap.innerHTML=hdSSHtml(map);const sec=wrap.firstElementChild;if(sec)overview.insertAdjacentElement('afterend',sec);
}
function hdSSFormData(){
 const val=function(id){return document.getElementById(id)?.value||''},num=function(id){return Math.max(0,Number(val(id))||0)};
 return {result:val('hdSSResult')||'S',node:val('hdSSNode'),battles:num('hdSSBattles'),boss:!!document.getElementById('hdSSBoss')?.checked,drop:val('hdSSDrop'),buckets:num('hdSSBuckets'),fuel:num('hdSSFuel'),ammo:num('hdSSAmmo'),steel:num('hdSSSteel'),bauxite:num('hdSSBauxite'),memo:val('hdSSMemo')};
}
function hdSSInstall(){
 if(window.__hdSortieSessionInstalled||typeof hdSPSRender!=='function')return false;
 window.__hdSortieSessionInstalled=true;const prev=hdSPSRender;
 hdSPSRender=function(){const v=prev.apply(this,arguments);setTimeout(hdSSRender,0);return v};
 setTimeout(hdSSRender,0);return true;
}
window.hdSSLoad=hdSSLoad;
window.hdSSSave=hdSSSave;
window.hdSSPostLoad=hdSSPostLoad;
window.hdSSPostSave=hdSSPostSave;
window.hdSSPostTryReview=hdSSPostTryReview;
window.hdSSPostRefreshReview=hdSSPostRefreshReview;
window.hdSSPostQueueBuild=hdSSPostQueueBuild;
window.hdSSPostQueueSummary=hdSSPostQueueSummary;
window.hdSSPostStartReprepare=hdSSPostStartReprepare;
window.hdSSPostFleet=hdSSPostFleet;
window.hdSSPostPreflightState=hdSSPostPreflightState;
window.hdSSPostPrepareNextRound=hdSSPostPrepareNextRound;
window.hdSSPostStartNextRound=hdSSPostStartNextRound;
window.hdSSSeriesRows=hdSSSeriesRows;
window.hdSSSeriesAdvice=hdSSSeriesAdvice;
window.hdSSOpenSeriesAnalytics=hdSSOpenSeriesAnalytics;
window.hdSSPostDelta=hdSSPostDelta;
window.hdSSTelemetry=hdSSTelemetry;
window.hdSSMap=hdSSMap;
window.hdSSFleet=hdSSFleet;
window.hdSSStats=hdSSStats;
window.hdSSGate=hdSSGate;
window.hdSSSnapshot=hdSSSnapshot;
window.hdSSStart=hdSSStart;
window.hdSSClear=hdSSClear;
window.hdSSFinish=hdSSFinish;
window.hdSSDuration=hdSSDuration;
window.hdSSSelectedSummary=hdSSSelectedSummary;
window.hdSSRender=hdSSRender;
window.hdSSFormData=hdSSFormData;
window.hdSSInstall=hdSSInstall;

document.addEventListener('click',function(e){
 if(e.target.closest?.('[data-hd-ss-start]')){const session=hdSSStart(hdSSMap());if(session&&typeof window.hdSMOpen==='function')setTimeout(()=>window.hdSMOpen(),0);return}
 if(e.target.closest?.('[data-hd-ss-start-override]')){const session=hdSSStart(hdSSMap(),{force:true});if(session&&typeof window.hdSMOpen==='function')setTimeout(()=>window.hdSMOpen(),0);return}
 if(e.target.closest?.('[data-hd-ss-finish]')){hdSSFinish(hdSSFormData());return}
 if(e.target.closest?.('[data-hd-ss-cancel]')){hdSSClear();return}
 if(e.target.closest?.('[data-hd-ss-check]')){if(typeof hdSPSOpenMapTab==='function')hdSPSOpenMapTab('mine');return}
 if(e.target.closest?.('[data-hd-ss-post-sync]')){if(typeof hdWSShowElement==='function')hdWSShowElement('kancolleImport',true);else document.getElementById('kancolleImport')?.scrollIntoView({behavior:'smooth',block:'start'});return}
 const postFix=e.target.closest?.('[data-hd-ss-post-fix]');if(postFix){if(typeof hdFEOpenFix==='function')hdFEOpenFix(postFix.dataset.hdSsPostFix);return}
 if(e.target.closest?.('[data-hd-ss-reprep]')){hdSSPostStartReprepare();return}
 if(e.target.closest?.('[data-hd-ss-next-preflight]')){hdSSPostPrepareNextRound();return}
 if(e.target.closest?.('[data-hd-ss-next-start]')){const session=hdSSPostStartNextRound();if(session&&typeof window.hdSMOpen==='function')setTimeout(()=>window.hdSMOpen(),0);return}
 if(e.target.closest?.('[data-hd-ss-series-analysis]')){hdSSOpenSeriesAnalytics();return}
  if(e.target.closest?.('[data-hd-ss-post-recheck]')){hdSSPostRefreshReview();hdSSRender();return}
 if(e.target.closest?.('[data-hd-fe-recheck]')){setTimeout(()=>{hdSSPostRefreshReview();hdSSRender()},140)}
 if(e.target.closest?.('[data-hd-ss-post-clear]')){hdSSPostSave(null);hdSSRender();return}
});
window.addEventListener('storage',function(e){if([HD_SS_KEY,'harbordesk-custom-fleets-v1','harbordesk-sortie-selection-v1','harbordesk-sortie-readiness-v1'].includes(e.key))hdSSRender()});
window.addEventListener('hd:map-rendered',function(){setTimeout(hdSSRender,0)});
window.addEventListener('hd:kancolle-sync',function(e){const post=hdSSPostLoad();if(post?.status==='reviewed')hdSSPostRefreshReview(e?.detail);else hdSSPostTryReview(e?.detail);setTimeout(hdSSRender,0)});
['hd:equipment-changed','hd:ship-identity-changed'].forEach(function(name){window.addEventListener(name,function(){if(hdSSPostLoad()?.status==='reviewed')hdSSPostRefreshReview();setTimeout(hdSSRender,0)})});
window.addEventListener('load',function(){const post=hdSSPostLoad();if(post?.status==='reviewed')hdSSPostRefreshReview();else hdSSPostTryReview();setTimeout(function(){if(!hdSSInstall())setTimeout(hdSSInstall,500)},1000)});
hdSSInstall();
