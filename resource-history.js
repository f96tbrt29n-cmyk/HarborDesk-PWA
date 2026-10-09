/* Resource observations: unknown values remain unknown, including older four-resource rows. */
const HD_RH_KEYS=[['fuel','燃料','#73be88'],['ammo','弾薬','#d8b760'],['steel','鋼材','#a6b4ce'],['bauxite','ボーキサイト','#edaa75'],['devMaterial','開発資材','#6bc2cb'],['instantBuild','高速建造材','#e2b45c'],['bucket','高速修復材','#afd778'],['screw','改修資材','#bc9de0']];
const HD_RH_SETTINGS='harbordesk-resource-history-settings-v1';
let hdRHPage=1,hdRHPressed=null,hdRHPending=false;
function hdRHFinishPress(press,delay=0){if(!press)return;setTimeout(()=>{if(hdRHPressed!==press)return;hdRHPressed=null;if(hdRHPending){hdRHPending=false;hdRHRender()}},delay)}
document.addEventListener('pointerdown',e=>{if(e.target.closest?.('#resourceHistory'))hdRHPressed={id:e.pointerId}},true);
window.addEventListener('pointerup',e=>{if(hdRHPressed?.id===e.pointerId)hdRHFinishPress(hdRHPressed,500)},true);
window.addEventListener('pointercancel',e=>{if(hdRHPressed?.id===e.pointerId)hdRHFinishPress(hdRHPressed)},true);
document.addEventListener('click',()=>hdRHFinishPress(hdRHPressed),true);
window.addEventListener('blur',()=>hdRHFinishPress(hdRHPressed));
function hdRHSettings(){try{return JSON.parse(localStorage.getItem(HD_RH_SETTINGS)||'{}')||{}}catch{return {}}}
function hdRHGoals(){try{return JSON.parse(localStorage.getItem('harbordesk-resource-goals-v1')||'{}')||{}}catch{return {}}}
function hdRHValue(v){return v!==''&&v!=null&&Number.isFinite(Number(v))&&Number(v)>=0?Math.floor(Number(v)):null}
function hdRHRows(){try{const rows=JSON.parse(localStorage.getItem(HD_RESOURCE_HISTORY_KEY)||'[]');return (Array.isArray(rows)?rows:[]).filter(x=>Number(x.at)>0).map(x=>({...x,...Object.fromEntries(HD_RH_KEYS.map(([k])=>[k,hdRHValue(x[k])]))})).sort((a,b)=>Number(b.at)-Number(a.at))}catch{return []}}
function hdRHRefresh(){hdRHRender();if(typeof renderDashboard==='function')renderDashboard();if(typeof hdRefreshResourceConsumers==='function')hdRefreshResourceConsumers()}
function hdRHWrite(rows){localStorage.setItem(HD_RESOURCE_HISTORY_KEY,JSON.stringify(rows.sort((a,b)=>b.at-a.at)));hdRHRefresh()}
function hdRHCurrent(){let res={};try{res=state.resources||{}}catch{}let materials={};try{materials=JSON.parse(localStorage.getItem('harbordesk-kancolle-materials-v1')||'{}')||{}}catch{}return Object.fromEntries(HD_RH_KEYS.map(([k],i)=>[k,hdRHValue(i<4?res[k]:materials[k])]))}
function hdRHMarkSync(at){const s=hdRHSettings();s.lastCapturedAt=Math.max(Number(s.lastCapturedAt)||0,Number(at)||0);try{localStorage.setItem(HD_RH_SETTINGS,JSON.stringify(s))}catch{}}
function hdRHRecord(values,{source='manual',at=Date.now()}={}){
 if(source==='sync'&&hdRHSettings().automatic===false)return null;
 const data=Object.fromEntries(HD_RH_KEYS.map(([k])=>[k,hdRHValue(values?.[k])])),rows=hdRHRows();
 if(!HD_RH_KEYS.some(([k])=>data[k]!=null))return null;
 const last=rows.find(x=>x.source==='sync');
 if(source==='sync'&&last&&HD_RH_KEYS.every(([k])=>last[k]===data[k])&&new Date(last.at).toLocaleDateString('en-CA',{timeZone:'Asia/Tokyo'})===new Date(at).toLocaleDateString('en-CA',{timeZone:'Asia/Tokyo'})){hdRHMarkSync(at);return last;}
 const row={id:hdUid(),at:Number(at)||Date.now(),...data,source,memo:''};rows.unshift(row);hdRHWrite(rows);if(source==='sync')hdRHMarkSync(at);return row;
}
function hdRHFiltered(){const s=hdRHSettings(),cut=s.period&&s.period!=='all'?Date.now()-Number(s.period)*86400000:0;return hdRHRows().filter(x=>Number(x.at)>=cut&&(!s.month||new Date(x.at).toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'}).startsWith(s.month)))}
function hdRHDate(at){return new Date(at).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})}
function hdRHNumber(v){return v==null?'—':v.toLocaleString('ja-JP')}
function hdRHDelta(row,prev,k){return row[k]!=null&&prev?.[k]!=null?row[k]-prev[k]:null}
function hdRHChart(rows,keys,title){
 const goals=hdRHGoals(),show=hdRHSettings().goals!==false,points=rows.slice().reverse(),end=goals.deadline?Date.parse(goals.deadline+'T23:59:59+09:00'):0;
 const actual=points.flatMap(x=>keys.map(([k])=>x[k]).filter(v=>v!=null)),targets=show?keys.map(([k])=>hdRHValue(goals[k])).filter(v=>v>0):[];
 if(!actual.length)return `<article class="hd-rh-chart"><h3>${title}</h3><p class="muted">この期間の記録はまだないよ。</p></article>`;
 const max=actual.concat(targets).reduce((max,v)=>Math.max(max,v),1)*1.08,minAt=points[0].at,lastAt=points.at(-1).at,maxAt=Math.max(lastAt,show&&targets.length&&end>lastAt?end:0,minAt+3600000),x=at=>46+(at-minAt)/(maxAt-minAt)*302,y=v=>212-v/max*180;
 const grid=Array.from({length:5},(_,i)=>{const v=max*i/4,yy=y(v);return `<line x1="46" y1="${yy}" x2="348" y2="${yy}" stroke="currentColor" opacity=".15"/><text x="40" y="${yy+4}" text-anchor="end">${Math.round(v).toLocaleString('ja-JP')}</text>`}).join('');
 const lines=keys.map(([k,n,color])=>{
  // Unknown observations split the line; do not draw invented measurements through them.
  let segments=[],part=[];for(const r of points){if(r[k]==null){if(part.length)segments.push(part);part=[]}else part.push(r)}if(part.length)segments.push(part);
  const paths=segments.map(seg=>`<polyline fill="none" stroke="${color}" stroke-width="2.5" points="${seg.map(r=>x(r.at)+','+y(r[k])).join(' ')}"/>`).join('');
  const known=points.filter(r=>r[k]!=null),stride=Math.max(1,Math.ceil(known.length/200));
  const dots=known.filter((r,i)=>i%stride===0||i===known.length-1).map(r=>`<circle cx="${x(r.at)}" cy="${y(r[k])}" r="3" fill="${color}"><title>${hdEsc(n+' '+hdRHDate(r.at)+'：'+hdRHNumber(r[k]))}</title></circle>`).join('');
  const target=hdRHValue(goals[k]),last=points.at(-1),goal=show&&target>0?`<line x1="${end>lastAt&&last[k]!=null?x(lastAt):46}" y1="${end>lastAt&&last[k]!=null?y(last[k]):y(target)}" x2="348" y2="${y(target)}" stroke="${color}" stroke-width="1.8" stroke-dasharray="5 4"><title>${hdEsc(n+' 目標 '+hdRHNumber(target))}</title></line>`:'';
  return paths+dots+goal;
 }).join('');
 const date=at=>new Date(at).toLocaleDateString('ja-JP',{timeZone:'Asia/Tokyo',month:'numeric',day:'numeric'});
 return `<article class="hd-rh-chart"><h3>${title}</h3><div class="hd-rh-legend">${keys.map(([,n,c])=>`<span><i style="background:${c}"></i>${n}</span>`).join('')}</div><svg viewBox="0 0 360 246" role="img" aria-label="${title}。記録日時ごとの推移。詳細値は下の記録一覧。">${grid}${lines}<text x="46" y="238">${date(minAt)}</text><text x="348" y="238" text-anchor="end">${date(maxAt)}</text></svg>${show&&targets.length?'<small class="muted">点線は目標。実績や将来の予測ではありません。</small>':''}</article>`;
}
function hdRHRender(){
 if(hdRHPressed){hdRHPending=true;return}
 const host=document.getElementById('resourceHistory'),list=document.getElementById('resourceHistoryList'),trend=document.getElementById('resourceTrend');if(!host||!list||!trend)return;
 const opened=document.querySelector('.hd-rh-targets')?.open||false;
 const s=hdRHSettings(),rows=hdRHFiltered(),all=hdRHRows(),cur=all[0],prev=all[1],goals=hdRHGoals();
 let tools=document.getElementById('hdResourceHistoryTools');if(!tools){tools=document.createElement('div');tools.id='hdResourceHistoryTools';trend.before(tools)}
 const editing=tools.contains(document.activeElement)&&document.activeElement.matches('[data-hd-rh-target],[data-hd-rh-deadline]');
 if(!editing)tools.innerHTML=`<p class="muted">ゲームの資源同期で自動記録。変化がない受信は同日内でまとめるよ。日時は日本時間。</p><div class="hd-rh-toolbar"><label><input type="checkbox" data-hd-rh-auto ${s.automatic!==false?'checked':''}> 同期で自動記録</label><label>期間<select data-hd-rh-period>${[['all','全期間'],['7','7日'],['30','30日'],['90','90日'],['365','1年']].map(([v,n])=>`<option value="${v}" ${(s.period||'all')===v?'selected':''}>${n}</option>`).join('')}</select></label><label>月で絞る<input type="month" data-hd-rh-month value="${hdEsc(s.month||'')}"></label><button type="button" class="ghost small" data-hd-rh-clear>期間をリセット</button><label><input type="checkbox" data-hd-rh-goals ${s.goals!==false?'checked':''}> 目標を表示</label></div><details class="hd-rh-targets" ${opened?'open':''}><summary>資源・資材の目標を設定</summary><div class="hd-rh-fields">${HD_RH_KEYS.map(([k,n])=>`<label>${n}<input type="number" min="0" step="1" inputmode="numeric" data-hd-rh-target="${k}" value="${hdRHValue(goals[k])||''}" placeholder="未設定"></label>`).join('')}</div><label>目標日<input type="date" data-hd-rh-deadline value="${hdEsc(goals.deadline||'')}"></label></details><div class="hd-rh-charts">${hdRHChart(rows,HD_RH_KEYS.slice(0,4),'資源の推移')}${hdRHChart(rows,HD_RH_KEYS.slice(4),'資材の推移')}</div>`;
 trend.innerHTML=HD_RH_KEYS.map(([k,n])=>{const d=cur?hdRHDelta(cur,prev,k):null;return `<div class="dash-card"><span>${n}</span><strong>${hdRHNumber(cur?.[k])}</strong><small class="${d>0?'plus':d<0?'minus':''}">${d==null?'前回差なし':(d>0?'+':'')+hdRHNumber(d)}</small></div>`}).join('');
 const maxPage=Math.max(1,Math.ceil(rows.length/20));hdRHPage=Math.min(hdRHPage,maxPage);
 list.innerHTML=rows.length?rows.slice((hdRHPage-1)*20,hdRHPage*20).map(row=>{const p=all[all.findIndex(x=>x.id===row.id)+1];return `<article class="advanced-card hd-rh-record"><div class="advanced-card-head"><div><strong>${hdRHDate(row.at)}</strong><small>${row.source==='sync'?'ゲーム同期':row.source==='edited'?'編集済み':'手動記録'}</small></div><div class="mini-actions"><button type="button" class="ghost small" data-hd-rh-edit="${hdEsc(row.id)}">編集</button><button type="button" class="ghost small" data-history-delete="${hdEsc(row.id)}">削除</button></div></div><table><thead><tr><th>資源・資材</th><th>記録値</th><th>前回から</th></tr></thead><tbody>${HD_RH_KEYS.map(([k,n])=>{const d=hdRHDelta(row,p,k);return `<tr><th>${n}</th><td>${hdRHNumber(row[k])}</td><td class="${d>0?'plus':d<0?'minus':''}">${d==null?'—':(d>0?'+':'')+hdRHNumber(d)}</td></tr>`}).join('')}</tbody></table>${row.memo?`<p class="hd-rh-memo">${hdEsc(row.memo)}</p>`:''}</article>`}).join('')+`<div class="hd-rh-pagination"><button type="button" class="ghost small" data-hd-rh-page="-1" ${hdRHPage===1?'disabled':''}>前へ</button><span>${hdRHPage}/${maxPage} ・ ${rows.length}件</span><button type="button" class="ghost small" data-hd-rh-page="1" ${hdRHPage===maxPage?'disabled':''}>次へ</button></div>`:'<div class="empty"><strong>この期間の記録はまだないよ</strong><p>資源を同期するか「現在値を記録」で残せるよ。</p></div>';
}
function hdRHLocalDate(at){const d=new Date(Number(at)+9*3600000);return d.toISOString().slice(0,16)}
function hdRHEdit(id){
 const row=hdRHRows().find(x=>x.id===id);if(!row)return;let dialog=document.getElementById('hdResourceHistoryDialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='hdResourceHistoryDialog';document.body.append(dialog)}
 dialog.innerHTML=`<form><h3>資源の記録を編集</h3><label>記録日時（日本時間）<input name="at" type="datetime-local" required value="${hdRHLocalDate(row.at)}"></label><div class="hd-rh-fields">${HD_RH_KEYS.map(([k,n])=>`<label>${n}<input name="${k}" type="number" min="0" step="1" inputmode="numeric" value="${row[k]??''}" placeholder="未記録"></label>`).join('')}</div><label>メモ<textarea name="memo" maxlength="2000" rows="3">${hdEsc(row.memo||'')}</textarea></label><p class="muted">空欄は未記録。履歴の編集はゲームの現在値を変更しません。</p><div class="dialog-actions"><button type="button" class="ghost" data-hd-rh-cancel>キャンセル</button><button type="submit" class="primary">記録を保存</button></div></form>`;
 dialog.querySelector('[data-hd-rh-cancel]').onclick=()=>dialog.close();
 dialog.querySelector('form').onsubmit=e=>{e.preventDefault();const form=new FormData(e.target),at=Date.parse(form.get('at')+':00+09:00');if(!Number.isFinite(at))return;const rows=hdRHRows(),i=rows.findIndex(x=>x.id===id);if(i<0){dialog.close();return}const updated={...rows[i],at,memo:String(form.get('memo')||''),source:'edited',updatedAt:Date.now(),...Object.fromEntries(HD_RH_KEYS.map(([k])=>[k,hdRHValue(form.get(k))]))};rows[i]=updated;try{hdRHWrite(rows);dialog.close()}catch{hdToast('記録を保存できなかったよ。もう一度試してね','warn')}};
 dialog.showModal();
}
document.addEventListener('change',e=>{const t=e.target,s=hdRHSettings();if(t.matches('[data-hd-rh-target]')){hdRBSetGoal(t.dataset.hdRhTarget,t.value);hdRHRender();return}if(t.matches('[data-hd-rh-deadline]')){hdRBSetDeadline(t.value);hdRHRender();return}if(t.matches('[data-hd-rh-auto]'))s.automatic=t.checked;else if(t.matches('[data-hd-rh-goals]'))s.goals=t.checked;else if(t.matches('[data-hd-rh-period]'))s.period=t.value;else if(t.matches('[data-hd-rh-month]'))s.month=t.value;else return;localStorage.setItem(HD_RH_SETTINGS,JSON.stringify(s));hdRHPage=1;hdRHRender()});
document.addEventListener('click',e=>{const edit=e.target.closest('[data-hd-rh-edit]');if(edit){hdRHEdit(edit.dataset.hdRhEdit);return}const page=e.target.closest('[data-hd-rh-page]');if(page){hdRHPage+=Number(page.dataset.hdRhPage);hdRHRender();return}if(e.target.closest('[data-hd-rh-clear]')){const s=hdRHSettings();delete s.month;delete s.period;localStorage.setItem(HD_RH_SETTINGS,JSON.stringify(s));hdRHPage=1;hdRHRender()}});
document.addEventListener('focusout',e=>{if(e.target.matches?.('[data-hd-rh-target],[data-hd-rh-deadline]'))setTimeout(hdRHRender,0)});
window.addEventListener('storage',e=>{if(e.key===null||[HD_RESOURCE_HISTORY_KEY,HD_RH_SETTINGS,'harbordesk-resource-goals-v1'].includes(e.key))hdRHRender()});
window.addEventListener('hd:workspace-refresh',hdRHRender);
// Seed the latest known sync once when upgrading, without inventing old material counts.
try{const latest=JSON.parse(localStorage.getItem('harbordesk-kancolle-materials-v1')||'null');if(latest?.syncedAt&&Number(hdRHSettings().lastCapturedAt||0)<latest.syncedAt&&!hdRHRows().some(x=>x.source==='sync'&&x.at>=latest.syncedAt))hdRHRecord(latest,{source:'sync',at:latest.syncedAt})}catch{}
hdRHRender();
