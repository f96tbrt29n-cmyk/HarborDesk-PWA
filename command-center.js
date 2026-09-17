const HD_CC_PREF_KEY='harbordesk-command-center-v1';

function hdCCEsc(s){return typeof homeEsc==='function'?homeEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdCCJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
function hdCCNow(){return Date.now()}
function hdCCRemain(ms){if(ms<=0)return '完了';const sec=Math.ceil(ms/1000),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60);if(h)return `${h}時間${m}分`;return `${Math.max(1,m)}分`}
function hdCCJump(id){const el=document.getElementById(id);if(!el){location.hash=id;return}if(typeof hdWSShowElement==='function'){hdWSShowElement(el,true);history.replaceState(null,'',`#${id}`);return}el.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'',`#${id}`)}

function hdCCTimers(){
 const out=[];try{if(typeof state!=='undefined'){
  for(const x of state.expeditions||[])if(Number(x.endsAt)>hdCCNow())out.push({...x,kind:x.support?'支援':'遠征',target:'expeditions'});
  for(const x of state.docks||[])if(Number(x.endsAt)>hdCCNow())out.push({...x,kind:'入渠',target:'docks'});
 }}catch{}
 const builds=hdCCJson('harbordesk-construction-timers-v1',[]);for(const x of Array.isArray(builds)?builds:[]){const end=Number(x.endsAt||x.endAt||x.finishAt);if(end>hdCCNow())out.push({...x,endsAt:end,kind:'建造',target:'constructionDb'})}
 return out.sort((a,b)=>Number(a.endsAt)-Number(b.endsAt));
}
function hdCCQuestProgress(){
 if(typeof HD_QUESTS==='undefined')return [];
 const rows=[];
 for(const q of HD_QUESTS){
  let goals=[];try{goals=typeof hdQPGoals==='function'?hdQPGoals(q):[]}catch{}
  if(!goals.length)continue;
  let entry=null;try{entry=typeof hdQPEntry==='function'?hdQPEntry(q):null}catch{}
  if(!entry)continue;
  const vals=entry.values||[];const total=goals.reduce((a,g)=>a+(Number(g[1])||0),0),done=goals.reduce((a,g,i)=>a+Math.min(Number(g[1])||0,Number(vals[i])||0),0);
  if(done<=0||done>=total)continue;
  const pct=total?Math.round(done/total*100):0;rows.push({q,done,total,pct});
 }
 const cycleRank={daily:0,weekly:1,monthly:2,quarterly:3,yearly:4};
 return rows.sort((a,b)=>(cycleRank[a.q.cycle]??9)-(cycleRank[b.q.cycle]??9)||b.pct-a.pct);
}
function hdCCEO(){
 try{if(typeof hdEOLoad==='function'&&typeof HD_EO_MAPS!=='undefined'&&typeof hdEOProgress==='function'&&typeof hdEOComplete==='function'){
  const s=hdEOLoad(),maps=HD_EO_MAPS.map(m=>({m,p:hdEOProgress(m,s),complete:hdEOComplete(m,s)})),unfinished=maps.filter(x=>!x.complete).sort((a,b)=>b.p.pct-a.p.pct);
  return {completed:maps.filter(x=>x.complete).length,total:maps.length,next:unfinished[0]||null};
 }}catch{}
 return {completed:0,total:7,next:null};
}
function hdCCTraining(){
 const roster=hdCCJson('harbordesk-ship-roster-v1',[]),plans=hdCCJson('harbordesk-training-plans-v1',{}),rows=[];
 for(const ship of Array.isArray(roster)?roster:[]){const p=plans?.[ship.id];if(!p?.active)continue;const lv=Math.max(1,Number(ship.level)||1),target=Math.max(lv,Number(p.target)||99),gap=Math.max(0,target-lv);rows.push({ship,plan:p,lv,target,gap,priority:Number(p.priority)||2})}
 return rows.sort((a,b)=>b.priority-a.priority||a.gap-b.gap);
}
function hdCCShortages(){
 try{if(typeof hdMatShortages==='function'&&typeof HD_MATERIALS!=='undefined'){const s=hdMatShortages();return HD_MATERIALS.map(m=>({m,count:Number(s[m.id])||0})).filter(x=>x.count>0).sort((a,b)=>b.count-a.count)}}catch{}
 return [];
}
function hdCCFleetState(){
 const timers=hdCCTimers().filter(x=>x.kind==='遠征'||x.kind==='支援'),busy=new Set(timers.map(x=>Number(x.fleetNo)).filter(x=>[2,3,4].includes(x)));return {busy:[...busy],idle:[2,3,4].filter(n=>!busy.has(n))};
}
function hdCCPriorityItems(){
 const items=[],now=hdCCNow();
 for(const t of hdCCTimers().slice(0,4)){const mins=(Number(t.endsAt)-now)/60000;items.push({score:mins<=10?100:mins<=30?80:55,icon:t.kind==='入渠'?'🛁':t.kind==='建造'?'🏗️':t.kind==='支援'?'🎯':'⏱️',title:`${t.kind} ${t.name||''}`,detail:`あと ${hdCCRemain(Number(t.endsAt)-now)}`,target:t.target||'expeditions'})}
 for(const x of hdCCQuestProgress().slice(0,3))items.push({score:72+x.pct/10,icon:'📋',title:x.q.name,detail:`${x.done}/${x.total}・${x.pct}%`,target:'questDatabase'});
 const eo=hdCCEO();if(eo.next)items.push({score:65+eo.next.p.pct/10,icon:'🧭',title:`EO ${eo.next.m.id} ${eo.next.m.name}`,detail:`${eo.next.p.done}/${eo.next.p.total}・${eo.next.p.pct}%`,target:'eoTracker'});
 for(const x of hdCCTraining().filter(x=>x.gap>0).slice(0,2))items.push({score:50+x.priority*5+(x.gap<=3?8:0),icon:'📈',title:`${x.ship.name} Lv.${x.lv} → ${x.target}`,detail:`あと${x.gap}Lv・優先度 ${x.priority===3?'高':x.priority===1?'低':'中'}`,target:'trainingPlanner'});
 const short=hdCCShortages();if(short.length)items.push({score:68,icon:'🧰',title:`不足素材 ${short.length}種類`,detail:short.slice(0,3).map(x=>`${x.m.name}×${x.count}`).join(' / '),target:'materialPlanner'});
 return items.sort((a,b)=>b.score-a.score).slice(0,8);
}
function hdCCEnsure(){
 const home=document.getElementById('home');if(!home||document.getElementById('hdCommandCenter'))return;
 const box=document.createElement('section');box.id='hdCommandCenter';box.className='hd-cc';
 const summary=document.getElementById('homeSummary');if(summary)summary.insertAdjacentElement('afterend',box);else home.prepend(box);
 hdCCRender();
}
function hdCCRender(){
 const host=document.getElementById('hdCommandCenter');if(!host)return;
 const timers=hdCCTimers(),urgent=timers.filter(x=>Number(x.endsAt)-hdCCNow()<=10*60000).length,qp=hdCCQuestProgress(),eo=hdCCEO(),training=hdCCTraining(),short=hdCCShortages(),fleets=hdCCFleetState(),items=hdCCPriorityItems();
 const idleText=fleets.idle.length?fleets.idle.map(n=>'第'+n).join('・'):'全艦隊稼働中';
 host.innerHTML=`<div class="hd-cc-head"><div><div class="eyebrow">COMMAND CENTER</div><h3>作戦優先度</h3><p>HarborDeskの各機能から、今見るべき項目をまとめて表示。</p></div><button type="button" class="ghost small" data-hd-cc-refresh>再集計</button></div><div class="hd-cc-stats"><button data-hd-cc-jump="expeditions"><span>稼働タイマー</span><strong>${timers.length}</strong><small>${urgent?`10分以内 ${urgent}件`:'直近10分なし'}</small></button><button data-hd-cc-jump="questDatabase"><span>進行中の定期任務</span><strong>${qp.length}</strong><small>カウンター記録中</small></button><button data-hd-cc-jump="eoTracker"><span>EO</span><strong>${eo.completed}/${eo.total}</strong><small>今月クリア</small></button><button data-hd-cc-jump="trainingPlanner"><span>育成対象</span><strong>${training.length}</strong><small>${training.filter(x=>x.gap===0).length}隻 目標到達</small></button><button data-hd-cc-jump="materialPlanner"><span>不足素材</span><strong>${short.length}</strong><small>${short.length?'目標から集計':'不足なし'}</small></button><button data-hd-cc-jump="expeditions"><span>空き遠征艦隊</span><strong>${fleets.idle.length}</strong><small>${idleText}</small></button></div><div class="hd-cc-priority"><div class="hd-cc-title"><strong>優先リスト</strong><span>${items.length}件</span></div>${items.length?items.map((x,i)=>`<button type="button" class="hd-cc-item" data-hd-cc-jump="${hdCCEsc(x.target)}"><span class="hd-cc-rank">${i+1}</span><span class="hd-cc-icon">${x.icon}</span><span class="hd-cc-copy"><b>${hdCCEsc(x.title)}</b><small>${hdCCEsc(x.detail)}</small></span><span class="hd-cc-arrow">›</span></button>`).join(''):'<div class="hd-cc-clear"><b>いま急ぎの項目はないよ</b><span>任務・EO・育成目標を登録するとここに優先順で出る。</span></div>`}</div>`;
}

document.addEventListener('click',e=>{const j=e.target.closest?.('[data-hd-cc-jump]');if(j){hdCCJump(j.dataset.hdCcJump);return}if(e.target.closest?.('[data-hd-cc-refresh]'))hdCCRender()});
window.addEventListener('storage',()=>setTimeout(hdCCRender,0));
window.addEventListener('load',()=>setTimeout(()=>{hdCCEnsure();hdCCRender()},900));
setTimeout(hdCCEnsure,1200);
setInterval(hdCCRender,15000);