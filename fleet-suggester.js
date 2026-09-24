const HD_FS_ROLE_BY_NEED={
 '対潜':['対潜','自動先制対潜'],
 '制空':['制空','制空補助','艦戦運用','航空火力'],
 '防空':['防空','対空CI','対空'],
 '対地':['対地','輸送','水戦'],
 '索敵':['制空補助','水戦'],
 '夜戦':['夜戦','夜戦CI','幸運艦','高運'],
 '輸送':['輸送'],
 '電探':['対空CI'],
 '高速化':[]
};
const HD_FS_TYPE_ALIASES={
 '駆逐':['駆逐艦'],'駆逐艦':['駆逐艦'],
 '海防艦':['海防艦'],
 '軽巡':['軽巡洋艦'],'軽巡洋艦':['軽巡洋艦'],
 '雷巡':['重雷装巡洋艦'],'重雷装巡洋艦':['重雷装巡洋艦'],
 '航巡':['航空巡洋艦'],'航空巡洋艦':['航空巡洋艦'],
 '重巡':['重巡洋艦','航空巡洋艦'],'重巡級':['重巡洋艦','航空巡洋艦'],
 '戦艦':['戦艦','高速戦艦','航空戦艦'],'戦艦級':['戦艦','高速戦艦','航空戦艦'],
 '航空戦艦':['航空戦艦'],
 '空母':['軽空母','正規空母','装甲空母'],'空母系':['軽空母','正規空母','装甲空母'],
 '正規空母':['正規空母','装甲空母'],'装甲空母':['装甲空母'],'軽空母':['軽空母'],
 '水母':['水上機母艦'],'水上機母艦':['水上機母艦'],
 '潜水艦':['潜水艦','潜水空母'],'潜水母艦':['潜水母艦']
};
function hdFSEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function hdFSMap(){return typeof selectedMap!=='undefined'?selectedMap:''}
function hdFSRoster(){try{return typeof rosterLoad==='function'?rosterLoad():JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]')}catch(e){return []}}
function hdFSDbFor(input){var row=typeof input==='object'?input:null,n=String(row?.name||input||'').trim();if(!n)return null;if(typeof hdShipDbResolveShip==='function')return hdShipDbResolveShip({name:n,masterId:Number(row?.masterId)||0});if(typeof HD_SHIP_DATABASE==='undefined')return null;return HD_SHIP_DATABASE.find(function(x){return n===x.base||n===x.final||n.startsWith(x.base)})||null}
function hdFSType(row){if(row&&row.type)return row.type;var db=hdFSDbFor(row);return db&&db.type||''}
function hdFSReadJson(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x??fallback}catch(e){return fallback}}
function hdFSLiveState(){
 var now=Date.now(),fleets=hdFSReadJson('harbordesk-kancolle-fleets-v1',[]),base=hdFSReadJson('harbordesk-pwa-v1',{}),expeditionShips=new Set(),dockedShips=new Set();
 (Array.isArray(fleets)?fleets:[]).forEach(function(deck){
  var m=Array.isArray(deck&&deck.mission)?deck.mission:[],active=Number(m[0])>0&&Number(m[2])>now;
  if(active)(deck.ships||[]).forEach(function(ship){var id=Number(ship&&ship.gameShipId)||0;if(id)expeditionShips.add(id)});
 });
 (Array.isArray(base&&base.docks)?base.docks:[]).forEach(function(dock){
  if(Number(dock&&dock.endsAt)>now){var id=Number(dock&&dock.gameShipId)||0;if(id)dockedShips.add(id)}
 });
 return {now:now,expeditionShips:expeditionShips,dockedShips:dockedShips};
}
function hdFSOperational(row,state){
 state=state||hdFSLiveState();var gameId=Number(row&&row.gameShipId)||0,hp=Number(row&&row.gameHp)||0,maxHp=Number(row&&row.gameMaxHp)||0,cond=Number(row&&row.gameCond),ratio=maxHp>0?hp/maxHp:null,reasons=[],labels=[],penalty=0,blocked=false;
 if(gameId&&state.expeditionShips.has(gameId)){blocked=true;reasons.push('遠征中')}
 if(gameId&&state.dockedShips.has(gameId)){blocked=true;reasons.push('入渠中')}
 if(ratio!=null&&ratio<=.25){blocked=true;reasons.push('大破')}
 else if(ratio!=null&&ratio<=.5){labels.push('中破');penalty-=28}
 else if(ratio!=null&&ratio<.75){labels.push('小破');penalty-=10}
 if(Number.isFinite(cond)){
  if(cond<20){labels.push('赤疲労');penalty-=35}
  else if(cond<30){labels.push('疲労');penalty-=22}
  else if(cond>=50){labels.push('キラ');penalty+=4}
 }
 var sally=Number(row&&row.gameSallyArea)||0;if(sally>0)labels.push('札'+sally);
 return {available:!blocked,blocked:blocked,reasons:reasons,labels:labels,penalty:penalty,hp:hp,maxHp:maxHp,hpRatio:ratio,cond:Number.isFinite(cond)?cond:null,sallyArea:sally};
}
function hdFSProfile(row,state){var db=hdFSDbFor(row),type=hdFSType(row),roles=db&&db.roles||[],tags=row.tags||[],master=db&&db._masterOnly?db._masterRow:null;return {row:row,db:db,master:master,type:type,roles:roles,tags:tags,level:Number(row.level)||0,speed:db&&db.speed||((type==='高速戦艦')?'高速':''),masterBacked:!!db,operational:hdFSOperational(row,state)}}
function hdFSTypeMatches(p,token){
 if(token==='対潜艦')return p.roles.some(function(r){return ['対潜','自動先制対潜','対潜補助','対潜護衛'].includes(r)})||['海防艦','駆逐艦','軽巡洋艦'].includes(p.type);
 var allowed=HD_FS_TYPE_ALIASES[token]||[token];return allowed.includes(p.type);
}
function hdFSRequirementPatterns(){return [
 ['航空戦艦',/航空戦艦\s*(\d+)/],['重巡級',/重巡級\s*(\d+)/],['戦艦級',/戦艦級\s*(\d+)/],['空母系',/空母系\s*(\d+)/],
 ['正規空母',/正規空母\s*(\d+)/],['軽空母',/軽空母\s*(\d+)/],['装甲空母',/装甲空母\s*(\d+)/],
 ['航巡',/航巡\s*(\d+)/],['重巡',/重巡(?!級)\s*(\d+)/],['軽巡',/軽巡\s*(\d+)/],['駆逐',/駆逐\s*(\d+)/],
 ['海防艦',/海防艦\s*(\d+)/],['対潜艦',/対潜艦\s*(\d+)/],['水母',/水母\s*(\d+)/],['潜水艦',/潜水艦\s*(\d+)/]
]}
function hdFSPresetInfo(preset){
 var text=String(preset&&preset.ships||'').replace(/ /g,'');var requirements=[];
 hdFSRequirementPatterns().forEach(function(pair){var m=text.match(pair[1]);if(m)requirements.push({token:pair[0],count:Math.max(1,Number(m[1])||1)})});
 var sum=requirements.reduce(function(s,x){return s+x.count},0),tm=text.match(/(\d+)隻/),total=tm?Number(tm[1]):(sum||6);total=Math.max(sum,Math.min(6,total||6));
 var preferred=[];Object.keys(HD_FS_TYPE_ALIASES).forEach(function(k){if(text.includes(k)&&!preferred.includes(k))preferred.push(k)});
 if(/水雷/.test(text)){preferred.push('軽巡','駆逐','雷巡')}
 return {text:text,requirements:requirements,total:total,preferred:Array.from(new Set(preferred)),speedRequired:/高速\+|高速以上|高速統一|高速\s*以上/.test(text),speedPreferred:/高速/.test(text)};
}
function hdFSNeeds(map){try{return typeof hdSEChecks==='function'?hdSEChecks(map).rows||[]:[]}catch(e){return []}}
function hdFSScore(p,info,needs){
 var score=p.level;
 if(p.tags.includes('主力'))score+=22;if(p.tags.includes('任務用'))score+=4;if(p.tags.includes('育成中'))score-=8;if(p.tags.includes('イベント温存'))score-=18;
 if(info.preferred.some(function(t){return hdFSTypeMatches(p,t)}))score+=35;
 var wanted=[];(needs||[]).forEach(function(n){wanted=wanted.concat(HD_FS_ROLE_BY_NEED[n.kind]||[])});
 p.roles.forEach(function(r){if(wanted.includes(r))score+=12});
 if(info.speedPreferred){if(p.speed==='高速'||p.type==='高速戦艦')score+=12;if(p.speed==='低速')score-=info.speedRequired?35:8}
 score+=Number(p.operational&&p.operational.penalty)||0;
 return score;
}
function hdFSPickBest(pool,used,predicate,info,needs){
 return pool.filter(function(p){return !used.has(p.row.id)&&p.operational?.available!==false&&(!predicate||predicate(p))}).sort(function(a,b){return hdFSScore(b,info,needs)-hdFSScore(a,info,needs)||b.level-a.level})[0]||null;
}
function hdFSOperationalSummary(pool){
 var blocked=pool.filter(function(p){return p.operational?.available===false}),counts={};
 blocked.forEach(function(p){(p.operational?.reasons||[]).forEach(function(r){counts[r]=(counts[r]||0)+1})});
 return {total:pool.length,available:pool.length-blocked.length,blocked:blocked.length,counts:counts};
}
function hdFSGenerate(map,preset,index){
 var info=hdFSPresetInfo(preset),needs=hdFSNeeds(map),live=hdFSLiveState(),pool=hdFSRoster().map(function(row){return hdFSProfile(row,live)}),operational=hdFSOperationalSummary(pool),used=new Set(),slots=[],missing=[];
 info.requirements.forEach(function(req){for(var i=0;i<req.count;i++){var p=hdFSPickBest(pool,used,function(x){return hdFSTypeMatches(x,req.token)},info,needs);if(p){used.add(p.row.id);slots.push({profile:p,required:req.token})}else{slots.push({profile:null,required:req.token});missing.push(req.token)}}});
 while(slots.length<info.total){var p=hdFSPickBest(pool,used,null,info,needs);if(!p)break;used.add(p.row.id);slots.push({profile:p,required:''})}
 while(slots.length<info.total)slots.push({profile:null,required:'自由枠'});
 var known=slots.filter(function(s){return s.profile&&s.profile.type}).length,filled=slots.filter(function(s){return s.profile}).length;
 var low=info.speedRequired?slots.filter(function(s){return s.profile&&s.profile.speed==='低速'}).map(function(s){return s.profile.row.name}):[];
 var masterBacked=slots.filter(function(s){return s.profile&&s.profile.masterBacked}).length;return {map:map,preset:preset,index:index,info:info,needs:needs,slots:slots,missing:missing,filled:filled,known:known,low:low,masterBacked:masterBacked,operational:operational};
}
function hdFSPlans(map){
 var p=(typeof MAP_PLANS!=='undefined'&&MAP_PLANS[map])||(typeof genericPlan==='function'?genericPlan(map):null);
 var presets=p&&p.presets||[];if(!presets.length){var d=typeof MAP_DETAILS!=='undefined'?MAP_DETAILS[map]||{}:{};presets=[{name:'基本候補',ships:d.fleet||d.formation||'6隻編成',gear:d.air||'',use:'通常攻略'}]}
 return presets.slice(0,3).map(function(x,i){return hdFSGenerate(map,x,i)});
}
function hdFSShipHtml(slot,i){
 if(!slot.profile)return '<div class="hd-fs-ship missing"><span>'+(i+1)+'</span><div><strong>'+hdFSEsc(slot.required||'自由枠')+' が不足</strong><small>艦隊台帳に候補を追加してね</small></div></div>';
 var p=slot.profile,r=p.row,op=p.operational||{},live=(op.hp&&op.maxHp?' ・ HP '+op.hp+'/'+op.maxHp:'')+(op.cond!=null?' ・ cond '+op.cond:'')+((op.labels||[]).length?' ・ '+op.labels.join(' / '):''),meta=(p.type||'艦種未設定')+(r.level?' ・ Lv.'+r.level:'')+(p.speed?' ・ '+p.speed:'')+(p.db&&p.db._masterOnly?' ・ MASTER':'')+live;
 var image=typeof hdShipImageThumbHtml==='function'?hdShipImageThumbHtml(Number(r.masterId)>0?{id:Number(r.masterId),name:r.name}:r.name,'fleet-thumb'):'';
 return '<div class="hd-fs-ship'+((op.labels||[]).length?' caution':'')+'"><span>'+(i+1)+'</span>'+image+'<div><strong>'+hdFSEsc(r.name)+'</strong><small>'+hdFSEsc(meta)+'</small><em>'+(slot.required?'担当: '+hdFSEsc(slot.required):'自由枠')+(r.gear?' ・ '+hdFSEsc(r.gear):'')+'</em></div></div>';
}
function hdFSMissingGearHtml(s){
 var missing=s.needs.filter(function(x){return x.status!=='ready'});if(!missing.length)return '<div class="hd-fs-good">主要装備カテゴリは台帳上準備あり</div>';
 return '<div class="hd-fs-needs"><span>装備要確認</span>'+missing.map(function(x){return '<button type="button" class="ghost small" data-hd-fs-acquire="'+hdFSEsc(x.kind)+'">'+hdFSEsc(x.label||x.kind)+'：'+(x.status==='partial'?'一部あり':'不足')+'</button>'}).join('')+'</div>';
}
function hdFSSuggestionHtml(s){
 var complete=s.missing.length===0&&s.filled===s.info.total,unknown=s.slots.filter(function(x){return x.profile&&!x.profile.type}).length;
 var status=complete?(unknown?'候補完成・艦種確認':'候補完成'):'不足あり';var cls=complete?'ok':'warn';
 var warnings=[];if(s.missing.length)warnings.push('不足艦種: '+Array.from(new Set(s.missing)).join(' / '));if(s.low.length)warnings.push('速力確認: '+s.low.join('、'));if(unknown)warnings.push('艦種未設定 '+unknown+'隻');
 var op=s.operational||{},excluded=Object.entries(op.counts||{}).map(function(x){return x[0]+' '+x[1]+'隻'}).join(' / ');if(excluded)warnings.push('候補から除外: '+excluded);
 return '<article class="hd-fs-card"><div class="hd-fs-card-head"><div><span>編成候補 '+(s.index+1)+'</span><strong>'+hdFSEsc(s.preset.name||'候補編成')+'</strong><small>'+hdFSEsc(s.preset.use||'')+'</small></div><b class="'+cls+'">'+status+'</b></div>'+
 '<div class="hd-fs-ships">'+s.slots.map(hdFSShipHtml).join('')+'</div>'+
 (warnings.length?'<div class="hd-fs-warning">'+hdFSEsc(warnings.join(' ｜ '))+'</div>':'')+hdFSMissingGearHtml(s)+
 '<div class="hd-fs-source"><b>アプリ内編成例:</b> '+hdFSEsc(s.preset.ships||'')+'<br><b>装備メモ:</b> '+hdFSEsc(s.preset.gear||'')+'</div>'+
 '<div class="hd-fs-actions"><button type="button" class="primary small" data-hd-fs-save="'+s.index+'">この候補を自分用編成に保存</button><button type="button" class="ghost small" data-hd-fs-roster>艦隊台帳を確認</button></div></article>';
}
function hdFSRender(preserveLoadouts=false){
 var host=document.getElementById('hdFleetSuggesterBody'),label=document.getElementById('hdFleetSuggesterMap');if(!host)return;var map=hdFSMap();
 if(!map){if(label)label.textContent='海域未選択';host.innerHTML='<div class="empty">海域を選ぶと、艦隊台帳から編成候補を作るよ。</div>';return}
 const saved=preserveLoadouts===true&&label?.textContent===map?[...host.querySelectorAll('.hd-fs-card')].map(card=>({index:card.querySelector('[data-hd-fl-generate]')?.getAttribute('data-hd-fl-generate'),plan:card.querySelector('.hd-fl-host')})).filter(x=>x.index!=null&&x.plan?.querySelector('.hd-fl-plan')):[];
 if(label)label.textContent=map;var roster=hdFSRoster();
 if(!roster.length){host.innerHTML='<div class="empty">艦隊台帳が空だよ。艦娘を登録すると、Lv・艦種・役割から候補を自動生成できる。</div><button type="button" class="primary small" data-hd-fs-roster>艦隊台帳を開く</button>';return}
 var plans=hdFSPlans(map),sync=(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-kancolle-sync-v1')||'null')}catch{return null}})(),equipItems=Number(sync?.equipmentItems??sync?.snapshot?.equipment??0)||0,op=plans[0]?.operational||{available:roster.length,total:roster.length};
 host.innerHTML='<div class="hd-fs-summary"><div><strong>'+hdFSEsc(map)+' 自動編成候補</strong><span>出撃候補 '+op.available+'/'+op.total+'隻（遠征中・入渠中・大破は自動除外）'+(sync?' ｜ 艦これ同期 装備'+equipItems+'個':'')+'</span></div><button type="button" class="ghost small" data-hd-fs-refresh>再生成</button></div><div class="hd-fs-list">'+plans.map(hdFSSuggestionHtml).join('')+'</div><p class="hd-fs-note">※中破・疲労艦は候補順位を下げ、遠征中・入渠中・大破艦は候補から外す。札は表示のみで、イベント海域の出撃可否はゲーム側で最終確認してね。</p>';
 for(const row of saved){const button=[...host.querySelectorAll('[data-hd-fl-generate]')].find(x=>x.getAttribute('data-hd-fl-generate')===row.index),placeholder=button?.closest('.hd-fs-card')?.querySelector('.hd-fl-host');if(placeholder)placeholder.replaceWith(row.plan)}
 if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(host);
}
function hdFSEnsure(){
 if(document.getElementById('hdFleetSuggester'))return;var anchor=document.getElementById('hdSortiePreparation')||document.getElementById('guide');if(!anchor)return;
 var sec=document.createElement('section');sec.id='hdFleetSuggester';sec.className='advanced-section hd-fs-section';sec.innerHTML='<div class="section-head"><div><div class="eyebrow">FLEET SUGGESTER</div><h2>手持ち艦隊・自動編成候補</h2></div><span id="hdFleetSuggesterMap" class="muted">海域未選択</span></div><div id="hdFleetSuggesterBody"></div>';anchor.insertAdjacentElement('afterend',sec);hdFSRender();
}
function hdFSSave(index){
 var map=hdFSMap(),s=hdFSPlans(map)[Number(index)];if(!map||!s)return;var all=typeof loadCustomFleets==='function'?loadCustomFleets():{};all[map]=all[map]||[];
 var name=map+' 自動提案｜'+(s.preset.name||('候補'+(s.index+1))),ships=Array.from({length:6},function(_,i){var slot=s.slots[i],p=slot&&slot.profile,r=p&&p.row,mid=Number(r&&r.masterId)||Number(p&&p.master&&p.master.id)||Number(typeof hdShipImageResolve==='function'&&r?.name?hdShipImageResolve(r.name)?.id:0)||0;return {ship:r&&r.name||'',masterId:mid,gear:r&&r.gear||''}});
 var memo='HarborDesk自動提案。'+(s.preset.use||'通常攻略')+'。アプリ内編成例を基にした候補で、ルート固定を保証しません。';
 var old=all[map].find(function(x){return x.name===name}),id=old&&old.id||(typeof cfUid==='function'?cfUid():'fs-'+Date.now()+'-'+Math.random().toString(16).slice(2));
 var item={id:id,name:name,ships:ships,memo:memo,createdAt:old&&old.createdAt||Date.now(),updatedAt:Date.now()};all[map]=old?all[map].map(function(x){return x.id===id?item:x}):all[map].concat(item);
 if(typeof saveCustomFleets==='function')saveCustomFleets(all);else localStorage.setItem('harbordesk-custom-fleets-v1',JSON.stringify(all));
 if(typeof hdSortieSetSelection==='function')hdSortieSetSelection(map,id);if(typeof renderCustomFleets==='function')renderCustomFleets(map);if(typeof hdSPSRender==='function')hdSPSRender();
 var btn=document.querySelector('[data-hd-fs-save="'+index+'"]');if(btn){btn.textContent='保存したよ';setTimeout(function(){btn.textContent='この候補を自分用編成に保存'},1300)}
}
function hdFSReveal(target){
 if(!target)return false;
 if(typeof window.hdRevealWorkspaceTarget==='function')return !!window.hdRevealWorkspaceTarget(target,true);
 target.hidden=false;target.classList?.remove('hd-ws-hidden');
 for(var p=target.parentElement;p&&p!==document.body;p=p.parentElement)p.classList?.remove('hd-ws-wrapper-hidden');
 target.scrollIntoView?.({behavior:'smooth',block:'start'});return true;
}
function hdFSStillSelected(target){
 try{
  var state=JSON.parse(localStorage.getItem('harbordesk-workspace-tabs-v1')||'{}');
  if(!state||!state.group)return !!target&&!target.hidden&&!target.classList.contains('hd-ws-hidden');
  return state.group==='guide'&&state.sections&&state.sections.guide===(target&&target.id);
 }catch(e){return !!target&&!target.hidden&&!target.classList.contains('hd-ws-hidden')}
}
function hdFSOpenRecoveryAllowed(target){
 if(!target||!document.contains(target)||hdFSStillSelected(target))return false;
 var state=window.hdWSState;
 if(!state||typeof state!=='object'){try{state=JSON.parse(localStorage.getItem('harbordesk-workspace-tabs-v1')||'{}')}catch(e){state={}}}
 var section=state&&state.sections&&state.sections.guide||'';
 return state&&state.group==='guide'&&(!section||section==='guide');
}
function hdFSOpen(){
 // Opening the suggester leaves the map fallback context on purpose.
 // Cancel any already-scheduled fallback restore so it cannot steal the
 // workspace back to the guide root after the user chose this tool.
 try{window.hdCoreClearFallbackState?.()}catch(e){}
 hdFSEnsure();var target=document.getElementById('hdFleetSuggester');if(!target)return false;
 var opened=typeof window.hdWSRevealElement==='function'&&window.hdWSRevealElement(target,true,{lockMs:15000})!==false;
 if(!opened&&typeof hdWSShowElement==='function')opened=hdWSShowElement(target,true,{lockMs:15000})!==false;
 if(!opened)opened=hdFSReveal(target);
 hdFSRender(true);
 var navEpoch=Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH)||0;
 var settle=function(){
  if((Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH)||0)!==navEpoch)return;
  if(hdFSStillSelected(target)){hdFSReveal(target);navEpoch=Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH)||navEpoch;return}
  if(!hdFSOpenRecoveryAllowed(target))return;
  if(typeof window.hdWSRevealElement==='function')window.hdWSRevealElement(target,true,{history:false,direct:false,lockMs:6500});
  else if(typeof hdWSShowElement==='function')hdWSShowElement(target,true);
  else hdFSReveal(target);
  navEpoch=Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH)||navEpoch;
 };
 requestAnimationFrame(settle);[80,420,1200,1900,3600,6500,9500,13500].forEach(function(ms){setTimeout(settle,ms)});
 return !!opened;
}
function hdFSOpenRoster(){if(typeof hdWSShowElement==='function'&&hdWSShowElement('roster',true))return true;return hdFSReveal(document.getElementById('roster'))}
function hdFSMapButton(){var head=document.querySelector('#selectedMapCard .map-tabs-head');if(!head||head.querySelector('[data-hd-fs-open]'))return;var b=document.createElement('button');b.type='button';b.className='ghost small';b.setAttribute('data-hd-fs-open','1');b.textContent='編成候補';head.appendChild(b)}
async function hdFSOpenAcquire(kind,button){
 if(!kind)return false;
 if(typeof hdAGOpen!=='function'&&typeof window.hdEnsureCurrentAssets==='function'){
  button&&button.setAttribute('aria-busy','true');
  try{await window.hdEnsureCurrentAssets()}catch(e){}
  finally{button&&button.removeAttribute('aria-busy')}
 }
 if(typeof hdAGOpen==='function'){hdAGOpen(kind,hdFSMap());return true}
 window.hdToast?.('入手ルートを読み込めなかったよ。アプリ更新を試してね','warn');return false;
}
document.addEventListener('click',function(e){
 var open=e.target.closest&&e.target.closest('[data-hd-fs-open]');
 if(open&&hdFSOpen())e.__hdFSOpenHandled=true;
},true);
document.addEventListener('click',function(e){
 if(e.target.closest('[data-hd-fs-open]')){if(e.__hdFSOpenHandled)return;hdFSOpen();return}
 if(e.target.closest('[data-hd-fs-refresh]')){hdFSRender();return}
 var save=e.target.closest('[data-hd-fs-save]');if(save){hdFSSave(save.getAttribute('data-hd-fs-save'));return}
 if(e.target.closest('[data-hd-fs-roster]')){hdFSOpenRoster();return}
 var acq=e.target.closest('[data-hd-fs-acquire]');if(acq){hdFSOpenAcquire(acq.getAttribute('data-hd-fs-acquire'),acq);return}
});
window.addEventListener('storage',function(e){if(['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-custom-fleets-v1'].includes(e.key))hdFSRender()});
window.addEventListener('hd:kancolle-sync',hdFSRender);
window.addEventListener('hd:ship-identity-changed',hdFSRender);
window.addEventListener('hd:workspace-refresh',hdFSRender);
window.addEventListener('hd:ship-images-changed',()=>hdFSRender(true));
window.addEventListener('hd:ship-images-ready',()=>hdFSRender(true));
window.addEventListener('hd:map-rendered',function(){hdFSMapButton();hdFSRender(true)});
window.addEventListener('load',function(){setTimeout(function(){hdFSEnsure();hdFSMapButton();hdFSRender(true)},560)});
