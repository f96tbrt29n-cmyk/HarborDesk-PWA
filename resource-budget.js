const HD_RESOURCE_GOALS_KEY='harbordesk-resource-goals-v1';
const HD_RB_KEYS=[['fuel','燃料'],['ammo','弾薬'],['steel','鋼材'],['bauxite','ボーキ']];

function hdRBLoad(){try{return JSON.parse(localStorage.getItem(HD_RESOURCE_GOALS_KEY)||'{}')||{}}catch{return {}}}
function hdRBSave(v){localStorage.setItem(HD_RESOURCE_GOALS_KEY,JSON.stringify(v))}
function hdRBHistory(){try{return (JSON.parse(localStorage.getItem('harbordesk-resource-history-v1')||'[]')||[]).filter(x=>Number(x.at)>0).sort((a,b)=>Number(a.at)-Number(b.at))}catch{return []}}
function hdRBEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdRBCurrent(){
 let r=null;try{if(typeof state!=='undefined')r=state.resources}catch{}
 const hist=hdRBHistory(),last=hist.at(-1)||{};const out={};
 for(const [k] of HD_RB_KEYS){const v=r?.[k];out[k]=v!==''&&v!=null?Math.max(0,Number(v)||0):Math.max(0,Number(last[k])||0)}
 return out;
}
function hdRBRate(key){
 const h=hdRBHistory(),now=Date.now(),cut=now-14*86400000;let rows=h.filter(x=>Number(x.at)>=cut);
 if(rows.length<2)rows=h.slice(-2);if(rows.length<2)return null;
 const first=rows[0],last=rows.at(-1),days=(Number(last.at)-Number(first.at))/86400000;if(days<0.5)return null;
 return (Number(last[key]||0)-Number(first[key]||0))/days;
}
function hdRBFmt(n){return Math.round(Number(n)||0).toLocaleString('ja-JP')}
function hdRBSign(n){const v=Math.round(Number(n)||0);return `${v>0?'+':''}${v.toLocaleString('ja-JP')}`}
function hdRBDeadlineInfo(key,current,target,rate,deadline){
 const gap=Math.max(0,target-current);if(gap<=0)return {text:'目標達成',cls:'ok',needDaily:0};
 let needDaily=null,daysLeft=null;if(deadline){const end=new Date(`${deadline}T23:59:59`);if(!Number.isNaN(end.getTime())){daysLeft=Math.max(0,(end-Date.now())/86400000);needDaily=daysLeft>0?gap/daysLeft:Infinity}}
 if(needDaily!=null){if(!Number.isFinite(needDaily))return {text:'期限超過',cls:'bad',needDaily};if(rate!=null&&rate>=needDaily)return {text:`期限ペースOK（必要 +${hdRBFmt(needDaily)}/日）`,cls:'ok',needDaily};return {text:`必要 +${hdRBFmt(needDaily)}/日`,cls:'warn',needDaily}}
 if(rate==null)return {text:'履歴を2回以上記録すると予測',cls:'muted',needDaily:null};
 if(rate<=0)return {text:'現在のペースでは増加していない',cls:'warn',needDaily:null};
 const eta=gap/rate,date=new Date(Date.now()+eta*86400000);return {text:`約${Math.ceil(eta)}日 → ${date.getMonth()+1}/${date.getDate()}頃`,cls:'ok',needDaily:null};
}
function hdRBStats(){
 const goals=hdRBLoad(),cur=hdRBCurrent();return HD_RB_KEYS.map(([key,name])=>{const target=Math.max(0,Number(goals[key])||0),current=cur[key],gap=Math.max(0,target-current),rate=hdRBRate(key),deadline=goals.deadline||'',info=hdRBDeadlineInfo(key,current,target,rate,deadline);return {key,name,target,current,gap,rate,deadline,info}});
}
function hdRBRecentHtml(){
 const h=hdRBHistory().slice(-7).reverse();if(!h.length)return '<div class="hd-rb-empty">まだ履歴がないよ。「現在値を記録」で推移を残せる。</div>';
 return h.map((x,i)=>{const prev=h[i+1];const d=prev?HD_RB_KEYS.map(([k,n])=>`${n.slice(0,1)} ${hdRBSign((Number(x[k])||0)-(Number(prev[k])||0))}`).join(' / '):'最初の記録';return `<div class="hd-rb-history"><span>${new Date(x.at).toLocaleDateString('ja-JP',{month:'numeric',day:'numeric'})}</span><b>${d}</b></div>`}).join('');
}
function hdRBRender(){
 const host=document.getElementById('hdResourceBudget');if(!host)return;const goals=hdRBLoad(),stats=hdRBStats(),deadline=goals.deadline||'';
 host.innerHTML=`<div class="hd-rb-head"><div><div class="eyebrow">RESOURCE BUDGET</div><h3>資源目標・備蓄ペース</h3><p>資源履歴から直近14日の増減ペースを計算。目標日を入れると必要な1日増加量も出すよ。</p></div><button type="button" class="ghost small" data-hd-rb-snapshot>現在値を記録</button></div><div class="hd-rb-toolbar"><label>目標日（任意）<input type="date" data-hd-rb-deadline value="${hdRBEsc(deadline)}"></label><div class="hd-rb-presets"><button type="button" class="ghost small" data-hd-rb-preset="50000">全資源 5万</button><button type="button" class="ghost small" data-hd-rb-preset="100000">10万</button><button type="button" class="ghost small" data-hd-rb-preset="200000">20万</button><button type="button" class="ghost small" data-hd-rb-preset="300000">30万</button></div></div><div class="hd-rb-grid">${stats.map(x=>{const pct=x.target>0?Math.min(100,Math.round(x.current/x.target*100)):0;return `<article class="hd-rb-card ${x.gap===0&&x.target>0?'done':''}"><div class="hd-rb-card-head"><strong>${x.name}</strong><span class="${x.info.cls}">${hdRBEsc(x.info.text)}</span></div><div class="hd-rb-values"><div><span>現在</span><b>${hdRBFmt(x.current)}</b></div><div><span>目標</span><input type="number" min="0" max="999999" inputmode="numeric" value="${x.target||''}" placeholder="未設定" data-hd-rb-goal="${x.key}"></div><div><span>不足</span><b>${x.target?hdRBFmt(x.gap):'-'}</b></div><div><span>14日ペース</span><b class="${x.rate>0?'plus':x.rate<0?'minus':''}">${x.rate==null?'-':`${hdRBSign(x.rate)}/日`}</b></div></div>${x.target?`<progress max="100" value="${pct}"></progress><small>${pct}%</small>`:'<div class="hd-rb-no-goal">目標値を入れると進捗を計算するよ</div>'}</article>`}).join('')}</div><div class="hd-rb-recent"><div class="hd-rb-title"><strong>直近の記録差分</strong><a href="#resourceHistory">資源履歴を開く</a></div>${hdRBRecentHtml()}</div>`;
}
function hdRBEnsure(){
 const anchor=document.getElementById('resourceHistory');if(!anchor||document.getElementById('hdResourceBudget'))return;const sec=document.createElement('section');sec.id='hdResourceBudget';sec.className='advanced-section hd-rb';anchor.insertAdjacentElement('beforebegin',sec);hdRBRender();hdRBInstallCommandCenterPatch();
}
function hdRBSetGoal(key,value){const g=hdRBLoad();g[key]=Math.max(0,Math.floor(Number(value)||0));hdRBSave(g);hdRBRender();if(typeof hdCCRender==='function')hdCCRender()}
function hdRBSetDeadline(value){const g=hdRBLoad();g.deadline=value||'';hdRBSave(g);hdRBRender();if(typeof hdCCRender==='function')hdCCRender()}
function hdRBSnapshot(){if(typeof snapshotResources==='function'){snapshotResources();hdRBRender();if(typeof hdCCRender==='function')hdCCRender();return}let r=hdRBCurrent();const h=hdRBHistory();h.push({id:crypto.randomUUID?crypto.randomUUID():Date.now().toString(),at:Date.now(),...r});localStorage.setItem('harbordesk-resource-history-v1',JSON.stringify(h.slice(-120).reverse()));hdRBRender()}
function hdRBCommandItems(){return hdRBStats().filter(x=>x.target>0&&x.gap>0).map(x=>{let score=58;const need=x.info.needDaily;if(need!=null&&Number.isFinite(need)&&((x.rate??-Infinity)<need))score=74;else if(x.rate!=null&&x.rate<=0)score=70;return {score,icon:'⛽',title:`${x.name} あと${hdRBFmt(x.gap)}`,detail:x.info.text,target:'hdResourceBudget'}})}
function hdRBInstallCommandCenterPatch(){
 if(window.__hdRBCommandPatch||typeof window.hdCCPriorityItems!=='function')return;window.__hdRBCommandPatch=true;const base=window.hdCCPriorityItems;window.hdCCPriorityItems=function(){const rows=base();return [...rows,...hdRBCommandItems()].sort((a,b)=>b.score-a.score).slice(0,8)};if(typeof hdCCRender==='function')hdCCRender();
}

document.addEventListener('change',e=>{const g=e.target.closest?.('[data-hd-rb-goal]');if(g){hdRBSetGoal(g.dataset.hdRbGoal,g.value);return}const d=e.target.closest?.('[data-hd-rb-deadline]');if(d)hdRBSetDeadline(d.value)});
document.addEventListener('click',e=>{if(e.target.closest?.('[data-hd-rb-snapshot]')){hdRBSnapshot();return}const p=e.target.closest?.('[data-hd-rb-preset]');if(p){const n=Math.max(0,Number(p.dataset.hdRbPreset)||0),g=hdRBLoad();for(const [k] of HD_RB_KEYS)g[k]=n;hdRBSave(g);hdRBRender();if(typeof hdCCRender==='function')hdCCRender()}});
window.addEventListener('storage',()=>{hdRBRender();if(typeof hdCCRender==='function')hdCCRender()});
window.addEventListener('load',()=>setTimeout(()=>{hdRBEnsure();hdRBInstallCommandCenterPatch()},1000));setTimeout(()=>{hdRBEnsure();hdRBInstallCommandCenterPatch()},1400);