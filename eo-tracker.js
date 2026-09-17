const HD_EO_KEY='harbordesk-eo-progress-v1';
const HD_EO_MAPS=[
 {id:'1-5',name:'鎮守府近海',score:75,medal:1,stages:[{id:'boss',label:'ボス旗艦撃沈',need:4}],note:'ボス旗艦撃沈4回でゲージ破壊。'},
 {id:'2-5',name:'沖ノ島沖',score:100,medal:1,stages:[{id:'boss',label:'ボス旗艦撃沈',need:4}],note:'索敵条件に注意。ボス旗艦撃沈4回でゲージ破壊。'},
 {id:'3-5',name:'北方AL海域',score:150,medal:1,stages:[{id:'boss',label:'ボス旗艦撃沈',need:4}],note:'ボス旗艦撃沈4回でゲージ破壊。'},
 {id:'4-5',name:'カレー洋リランカ島沖',score:180,medal:1,stages:[{id:'boss',label:'ボス旗艦撃沈',need:5}],note:'港湾棲姫を5回撃破でゲージ破壊。'},
 {id:'5-5',name:'サーモン海域北方',score:200,medal:1,stages:[{id:'boss',label:'ボス旗艦撃沈',need:5}],note:'ボス旗艦撃沈5回でゲージ破壊。'},
 {id:'6-5',name:'KW環礁沖海域',score:250,medal:1,stages:[{id:'boss',label:'ボス旗艦撃沈',need:6}],note:'基地航空隊を使用可能。ボス旗艦撃沈6回でゲージ破壊。'},
 {id:'7-5',name:'ジャワ島沖',score:170,medal:1,stages:[
   {id:'g1',label:'第1ゲージ K',need:2},
   {id:'g2',label:'第2ゲージ Q',need:3},
   {id:'m',label:'MマスS勝利ギミック',need:1},
   {id:'g3',label:'第3ゲージ T',need:3}
 ],note:'第1ゲージ2回→第2ゲージ3回、途中でMマスS勝利1回の第三ゲージ出現ギミック、最後に第3ゲージ3回。'}
];

function hdEOMonthKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function hdEOEmpty(month=hdEOMonthKey()){return {month,maps:{},credited:[],history:[]}}
function hdEOLoadRaw(){try{return JSON.parse(localStorage.getItem(HD_EO_KEY)||'null')}catch{return null}}
function hdEOSummary(state){let completed=0,score=0,medals=0;for(const m of HD_EO_MAPS){if(hdEOComplete(m,state)){completed++;score+=m.score;medals+=m.medal}}return {completed,score,medals}}
function hdEOLoad(){
 let s=hdEOLoadRaw()||hdEOEmpty();const now=hdEOMonthKey();
 if(s.month!==now){const old=hdEOSummary(s);const history=[...(s.history||[]),{month:s.month,...old}].slice(-12);s={...hdEOEmpty(now),history};hdEOSave(s)}
 s.maps=s.maps||{};s.credited=s.credited||[];s.history=s.history||[];return s;
}
function hdEOSave(s){localStorage.setItem(HD_EO_KEY,JSON.stringify(s))}
function hdEOEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdEOStageValue(map,stage,state){return Math.max(0,Math.min(stage.need,Number(state.maps?.[map.id]?.[stage.id])||0))}
function hdEOComplete(map,state){return map.stages.every(st=>hdEOStageValue(map,st,state)>=st.need)}
function hdEOProgress(map,state){const done=map.stages.reduce((a,st)=>a+hdEOStageValue(map,st,state),0),total=map.stages.reduce((a,st)=>a+st.need,0);return {done,total,pct:total?Math.round(done/total*100):0}}
function hdEOSetStage(mapId,stageId,delta){const s=hdEOLoad(),map=HD_EO_MAPS.find(x=>x.id===mapId),stage=map?.stages.find(x=>x.id===stageId);if(!map||!stage)return;s.maps[mapId]=s.maps[mapId]||{};const cur=Number(s.maps[mapId][stageId])||0;s.maps[mapId][stageId]=Math.max(0,Math.min(stage.need,cur+delta));hdEOSave(s);hdEORender()}
function hdEOMonthEnd(){const n=new Date(),last=new Date(n.getFullYear(),n.getMonth()+1,0,23,59,59);const ms=Math.max(0,last-n),days=Math.floor(ms/86400000),hours=Math.floor((ms%86400000)/3600000);return `${last.getMonth()+1}/${last.getDate()} 23:59まで（あと${days}日${hours}時間）`}
function hdEOSyncMedals(){
 const s=hdEOLoad();const eligible=HD_EO_MAPS.filter(m=>hdEOComplete(m,s)&&!s.credited.includes(m.id));if(!eligible.length){alert('素材在庫へ未反映のEO勲章はないよ');return}
 let stock={};try{stock=JSON.parse(localStorage.getItem('harbordesk-material-stock-v1')||'{}')||{}}catch{}
 const add=eligible.reduce((a,m)=>a+m.medal,0);stock.medal=(Number(stock.medal)||0)+add;localStorage.setItem('harbordesk-material-stock-v1',JSON.stringify(stock));s.credited.push(...eligible.map(m=>m.id));hdEOSave(s);if(typeof hdMatRenderInventory==='function')hdMatRenderInventory();alert(`完了EO ${eligible.length}海域分の勲章 ${add}個を素材在庫へ反映したよ`);hdEORender();
}
function hdEOResetCurrent(){if(!confirm('今月のEO進捗を0に戻す？ 素材在庫へ反映済みの勲章数は減らさないよ。'))return;const s=hdEOLoad();s.maps={};s.credited=[];hdEOSave(s);hdEORender()}
function hdEOGoGuide(mapId){const input=document.getElementById('guideQuery');if(input){input.value=mapId;input.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('guideSearchBtn')?.click()}document.getElementById('guide')?.scrollIntoView({behavior:'smooth',block:'start'})}
function hdEORender(){
 const list=document.getElementById('hdEOList');if(!list)return;const s=hdEOLoad(),sum=hdEOSummary(s);const totalScore=HD_EO_MAPS.reduce((a,m)=>a+m.score,0),totalMedals=HD_EO_MAPS.reduce((a,m)=>a+m.medal,0),creditable=HD_EO_MAPS.filter(m=>hdEOComplete(m,s)&&!s.credited.includes(m.id)).length;
 const month=document.getElementById('hdEOMonth');if(month)month.textContent=`${s.month.replace('-','年')}月`;
 const summary=document.getElementById('hdEOSummary');if(summary)summary.innerHTML=`<div><span>完了</span><strong>${sum.completed}/7</strong></div><div><span>勲章</span><strong>${sum.medals}/${totalMedals}</strong></div><div><span>特別戦果</span><strong>${sum.score}/${totalScore}</strong></div><div><span>月末</span><strong>${hdEOEsc(hdEOMonthEnd())}</strong></div>`;
 const sync=document.getElementById('hdEOSyncMedals');if(sync){sync.disabled=creditable===0;sync.textContent=creditable?`未反映の勲章 ${creditable}個を素材へ`:'勲章は素材へ反映済み'}
 list.innerHTML=HD_EO_MAPS.map(m=>{const p=hdEOProgress(m,s),complete=hdEOComplete(m,s),credited=s.credited.includes(m.id);return `<article class="hd-eo-card${complete?' complete':''}"><div class="hd-eo-head"><div><strong>${m.id} ${hdEOEsc(m.name)}</strong><span>勲章×${m.medal} / 特別戦果+${m.score}</span></div><div class="hd-eo-badge">${complete?'CLEAR':'進行中'}${credited?'<small>勲章反映済み</small>':''}</div></div><div class="hd-eo-progress"><progress max="100" value="${p.pct}"></progress><span>${p.done}/${p.total}</span></div><div class="hd-eo-stages">${m.stages.map(st=>{const v=hdEOStageValue(m,st,s);return `<div class="hd-eo-stage${v>=st.need?' done':''}"><div><strong>${hdEOEsc(st.label)}</strong><span>${v}/${st.need}</span></div><div><button type="button" class="ghost small" data-hd-eo-step="${m.id}" data-stage="${st.id}" data-delta="-1">−</button><button type="button" class="primary small" data-hd-eo-step="${m.id}" data-stage="${st.id}" data-delta="1" ${v>=st.need?'disabled':''}>＋1</button></div></div>`}).join('')}</div><p>${hdEOEsc(m.note)}</p><button type="button" class="ghost small" data-hd-eo-guide="${m.id}">${m.id}攻略を開く</button></article>`}).join('');
 const hist=document.getElementById('hdEOHistory');if(hist){const rows=(s.history||[]).slice().reverse().slice(0,6);hist.innerHTML=rows.length?rows.map(x=>`<span>${hdEOEsc(x.month)}：${x.completed}/7海域・勲章${x.medals}・戦果${x.score}</span>`).join(''):'<span>月が変わると前月の完了数をここに残すよ</span>'}
}
function hdEnsureEOTracker(){
 if(document.getElementById('eoTracker'))return;const anchor=document.getElementById('materialPlanner')||document.getElementById('shipDatabase')||document.getElementById('resources');if(!anchor)return;const sec=document.createElement('section');sec.id='eoTracker';sec.className='advanced-section hd-eo-section';
 sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">EXTRA OPERATION</div><h2>EO・月次ゲージ管理</h2></div><span id="hdEOMonth" class="muted"></span></div><div class="hd-eo-note">EOは月初にゲージが復活。特別戦果は原則月末21:59まで、勲章は月末23:59まで。進捗は端末内保存で、月が変わると自動で新しい月へ切り替えるよ。</div><div id="hdEOSummary" class="hd-eo-summary"></div><div class="hd-eo-actions"><button id="hdEOSyncMedals" class="primary" type="button">完了EOの勲章を素材へ</button><button id="hdEOReset" class="ghost" type="button">今月の進捗をリセット</button></div><div id="hdEOList" class="hd-eo-list"></div><div class="hd-eo-history"><div class="eyebrow">MONTHLY HISTORY</div><div id="hdEOHistory"></div></div><div class="hd-eo-source"><a class="guide-link" href="https://wikiwiki.jp/kancolle/%E7%9F%A5%E3%81%A3%E3%81%A6%E3%81%8A%E3%81%8D%E3%81%9F%E3%81%84%E6%A9%9F%E8%83%BD/%E7%89%B9%E6%AE%8A%E3%81%AA%E6%B5%B7%E5%9F%9F" target="_blank" rel="noopener">攻略Wiki EO仕様 ↗</a></div>`;
 anchor.insertAdjacentElement('beforebegin',sec);document.getElementById('hdEOSyncMedals').addEventListener('click',hdEOSyncMedals);document.getElementById('hdEOReset').addEventListener('click',hdEOResetCurrent);hdEORender();
}
document.addEventListener('click',e=>{const step=e.target.closest?.('[data-hd-eo-step]');if(step){hdEOSetStage(step.dataset.hdEoStep,step.dataset.stage,Number(step.dataset.delta)||0);return}const guide=e.target.closest?.('[data-hd-eo-guide]');if(guide)hdEOGoGuide(guide.dataset.hdEoGuide)});
window.addEventListener('load',()=>setTimeout(hdEnsureEOTracker,360));setTimeout(hdEnsureEOTracker,650);
