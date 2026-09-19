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
function hdFSDbFor(name){var n=String(name||'').trim();if(!n)return null;if(typeof hdShipDbResolveShip==='function')return hdShipDbResolveShip(n);if(typeof HD_SHIP_DATABASE==='undefined')return null;return HD_SHIP_DATABASE.find(function(x){return n===x.base||n===x.final||n.startsWith(x.base)})||null}
function hdFSType(row){if(row&&row.type)return row.type;var db=hdFSDbFor(row&&row.name);return db&&db.type||''}
function hdFSProfile(row){var db=hdFSDbFor(row.name),type=hdFSType(row),roles=db&&db.roles||[],tags=row.tags||[],master=db&&db._masterOnly?db._masterRow:null;return {row:row,db:db,master:master,type:type,roles:roles,tags:tags,level:Number(row.level)||0,speed:db&&db.speed||((type==='高速戦艦')?'高速':''),masterBacked:!!db}}
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
 return score;
}
function hdFSPickBest(pool,used,predicate,info,needs){
 return pool.filter(function(p){return !used.has(p.row.id)&&(!predicate||predicate(p))}).sort(function(a,b){return hdFSScore(b,info,needs)-hdFSScore(a,info,needs)||b.level-a.level})[0]||null;
}
function hdFSGenerate(map,preset,index){
 var info=hdFSPresetInfo(preset),needs=hdFSNeeds(map),pool=hdFSRoster().map(hdFSProfile),used=new Set(),slots=[],missing=[];
 info.requirements.forEach(function(req){for(var i=0;i<req.count;i++){var p=hdFSPickBest(pool,used,function(x){return hdFSTypeMatches(x,req.token)},info,needs);if(p){used.add(p.row.id);slots.push({profile:p,required:req.token})}else{slots.push({profile:null,required:req.token});missing.push(req.token)}}});
 while(slots.length<info.total){var p=hdFSPickBest(pool,used,null,info,needs);if(!p)break;used.add(p.row.id);slots.push({profile:p,required:''})}
 while(slots.length<info.total)slots.push({profile:null,required:'自由枠'});
 var known=slots.filter(function(s){return s.profile&&s.profile.type}).length,filled=slots.filter(function(s){return s.profile}).length;
 var low=info.speedRequired?slots.filter(function(s){return s.profile&&s.profile.speed==='低速'}).map(function(s){return s.profile.row.name}):[];
 var masterBacked=slots.filter(function(s){return s.profile&&s.profile.masterBacked}).length;return {map:map,preset:preset,index:index,info:info,needs:needs,slots:slots,missing:missing,filled:filled,known:known,low:low,masterBacked:masterBacked};
}
function hdFSPlans(map){
 var p=(typeof MAP_PLANS!=='undefined'&&MAP_PLANS[map])||(typeof genericPlan==='function'?genericPlan(map):null);
 var presets=p&&p.presets||[];if(!presets.length){var d=typeof MAP_DETAILS!=='undefined'?MAP_DETAILS[map]||{}:{};presets=[{name:'基本候補',ships:d.fleet||d.formation||'6隻編成',gear:d.air||'',use:'通常攻略'}]}
 return presets.slice(0,3).map(function(x,i){return hdFSGenerate(map,x,i)});
}
function hdFSShipHtml(slot,i){
 if(!slot.profile)return '<div class="hd-fs-ship missing"><span>'+(i+1)+'</span><div><strong>'+hdFSEsc(slot.required||'自由枠')+' が不足</strong><small>艦隊台帳に候補を追加してね</small></div></div>';
 var p=slot.profile,r=p.row,meta=(p.type||'艦種未設定')+(r.level?' ・ Lv.'+r.level:'')+(p.speed?' ・ '+p.speed:'')+(p.db&&p.db._masterOnly?' ・ MASTER':'');
 var image=typeof hdShipImageThumbHtml==='function'?hdShipImageThumbHtml(r.name,'fleet-thumb'):'';
 return '<div class="hd-fs-ship"><span>'+(i+1)+'</span>'+image+'<div><strong>'+hdFSEsc(r.name)+'</strong><small>'+hdFSEsc(meta)+'</small><em>'+(slot.required?'担当: '+hdFSEsc(slot.required):'自由枠')+(r.gear?' ・ '+hdFSEsc(r.gear):'')+'</em></div></div>';
}
function hdFSMissingGearHtml(s){
 var missing=s.needs.filter(function(x){return x.status!=='ready'});if(!missing.length)return '<div class="hd-fs-good">主要装備カテゴリは台帳上準備あり</div>';
 return '<div class="hd-fs-needs"><span>装備要確認</span>'+missing.map(function(x){return '<button type="button" class="ghost small" data-hd-fs-acquire="'+hdFSEsc(x.kind)+'">'+hdFSEsc(x.label||x.kind)+'：'+(x.status==='partial'?'一部あり':'不足')+'</button>'}).join('')+'</div>';
}
function hdFSSuggestionHtml(s){
 var complete=s.missing.length===0&&s.filled===s.info.total,unknown=s.slots.filter(function(x){return x.profile&&!x.profile.type}).length;
 var status=complete?(unknown?'候補完成・艦種確認':'候補完成'):'不足あり';var cls=complete?'ok':'warn';
 var warnings=[];if(s.missing.length)warnings.push('不足艦種: '+Array.from(new Set(s.missing)).join(' / '));if(s.low.length)warnings.push('速力確認: '+s.low.join('、'));if(unknown)warnings.push('艦種未設定 '+unknown+'隻');
 return '<article class="hd-fs-card"><div class="hd-fs-card-head"><div><span>編成候補 '+(s.index+1)+'</span><strong>'+hdFSEsc(s.preset.name||'候補編成')+'</strong><small>'+hdFSEsc(s.preset.use||'')+'</small></div><b class="'+cls+'">'+status+'</b></div>'+
 '<div class="hd-fs-ships">'+s.slots.map(hdFSShipHtml).join('')+'</div>'+
 (warnings.length?'<div class="hd-fs-warning">'+hdFSEsc(warnings.join(' ｜ '))+'</div>':'')+hdFSMissingGearHtml(s)+
 '<div class="hd-fs-source"><b>アプリ内編成例:</b> '+hdFSEsc(s.preset.ships||'')+'<br><b>装備メモ:</b> '+hdFSEsc(s.preset.gear||'')+'</div>'+
 '<div class="hd-fs-actions"><button type="button" class="primary small" data-hd-fs-save="'+s.index+'">この候補を自分用編成に保存</button><button type="button" class="ghost small" data-hd-fs-roster>艦隊台帳を確認</button></div></article>';
}
function hdFSRender(){
 var host=document.getElementById('hdFleetSuggesterBody'),label=document.getElementById('hdFleetSuggesterMap');if(!host)return;var map=hdFSMap();
 if(!map){if(label)label.textContent='海域未選択';host.innerHTML='<div class="empty">海域を選ぶと、艦隊台帳から編成候補を作るよ。</div>';return}
 if(label)label.textContent=map;var roster=hdFSRoster();
 if(!roster.length){host.innerHTML='<div class="empty">艦隊台帳が空だよ。艦娘を登録すると、Lv・艦種・役割から候補を自動生成できる。</div><button type="button" class="primary small" data-hd-fs-roster>艦隊台帳を開く</button>';return}
 var plans=hdFSPlans(map);host.innerHTML='<div class="hd-fs-summary"><div><strong>'+hdFSEsc(map)+' 自動編成候補</strong><span>艦隊台帳 '+roster.length+'隻から、詳細DB＋全865形態マスターで艦種・速力・役割を補完</span></div><button type="button" class="ghost small" data-hd-fs-refresh>再生成</button></div><div class="hd-fs-list">'+plans.map(hdFSSuggestionHtml).join('')+'</div><p class="hd-fs-note">※候補艦の艦種・速力・通常スロット/装備可否は公式マスターで補完。ルート固定・ランダム分岐、索敵スコア、イベント特効・札は出撃準備表と海域攻略情報で最終確認してね。</p>';
 if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(host);
}
function hdFSEnsure(){
 if(document.getElementById('hdFleetSuggester'))return;var anchor=document.getElementById('hdSortiePreparation')||document.getElementById('guide');if(!anchor)return;
 var sec=document.createElement('section');sec.id='hdFleetSuggester';sec.className='advanced-section hd-fs-section';sec.innerHTML='<div class="section-head"><div><div class="eyebrow">FLEET SUGGESTER</div><h2>手持ち艦隊・自動編成候補</h2></div><span id="hdFleetSuggesterMap" class="muted">海域未選択</span></div><div id="hdFleetSuggesterBody"></div>';anchor.insertAdjacentElement('afterend',sec);hdFSRender();
}
function hdFSSave(index){
 var map=hdFSMap(),s=hdFSPlans(map)[Number(index)];if(!map||!s)return;var all=typeof loadCustomFleets==='function'?loadCustomFleets():{};all[map]=all[map]||[];
 var name=map+' 自動提案｜'+(s.preset.name||('候補'+(s.index+1))),ships=Array.from({length:6},function(_,i){var slot=s.slots[i],r=slot&&slot.profile&&slot.profile.row;return {ship:r&&r.name||'',gear:r&&r.gear||''}});
 var memo='HarborDesk自動提案。'+(s.preset.use||'通常攻略')+'。アプリ内編成例を基にした候補で、ルート固定を保証しません。';
 var old=all[map].find(function(x){return x.name===name}),id=old&&old.id||(typeof cfUid==='function'?cfUid():'fs-'+Date.now()+'-'+Math.random().toString(16).slice(2));
 var item={id:id,name:name,ships:ships,memo:memo,createdAt:old&&old.createdAt||Date.now(),updatedAt:Date.now()};all[map]=old?all[map].map(function(x){return x.id===id?item:x}):all[map].concat(item);
 if(typeof saveCustomFleets==='function')saveCustomFleets(all);else localStorage.setItem('harbordesk-custom-fleets-v1',JSON.stringify(all));
 if(typeof hdSortieSetSelection==='function')hdSortieSetSelection(map,id);if(typeof renderCustomFleets==='function')renderCustomFleets(map);if(typeof hdSPSRender==='function')hdSPSRender();
 var btn=document.querySelector('[data-hd-fs-save="'+index+'"]');if(btn){btn.textContent='保存したよ';setTimeout(function(){btn.textContent='この候補を自分用編成に保存'},1300)}
}
function hdFSOpen(){hdFSEnsure();if(typeof hdWSShowElement==='function')hdWSShowElement('hdFleetSuggester',true);else document.getElementById('hdFleetSuggester').scrollIntoView({behavior:'smooth',block:'start'});setTimeout(hdFSRender,30)}
function hdFSMapButton(){var head=document.querySelector('#selectedMapCard .map-tabs-head');if(!head||head.querySelector('[data-hd-fs-open]'))return;var b=document.createElement('button');b.type='button';b.className='ghost small';b.setAttribute('data-hd-fs-open','1');b.textContent='編成候補';head.appendChild(b)}
document.addEventListener('click',function(e){
 if(e.target.closest('[data-hd-fs-open]')){hdFSOpen();return}
 if(e.target.closest('[data-hd-fs-refresh]')){hdFSRender();return}
 var save=e.target.closest('[data-hd-fs-save]');if(save){hdFSSave(save.getAttribute('data-hd-fs-save'));return}
 if(e.target.closest('[data-hd-fs-roster]')){if(typeof hdWSShowElement==='function')hdWSShowElement('roster',true);return}
 var acq=e.target.closest('[data-hd-fs-acquire]');if(acq&&typeof hdAGOpen==='function'){hdAGOpen(acq.getAttribute('data-hd-fs-acquire'),hdFSMap());return}
});
window.addEventListener('storage',function(e){if(['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-custom-fleets-v1'].includes(e.key))hdFSRender()});
window.addEventListener('hd:workspace-refresh',hdFSRender);
window.addEventListener('hd:ship-images-changed',hdFSRender);
window.addEventListener('hd:ship-images-ready',hdFSRender);
window.addEventListener('hd:map-rendered',function(){hdFSMapButton();hdFSRender()});
window.addEventListener('load',function(){setTimeout(function(){hdFSEnsure();hdFSMapButton();hdFSRender()},560)});