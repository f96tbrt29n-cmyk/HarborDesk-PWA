const HD_SORTIE_LOG_KEY='harbordesk-sortie-log-v1';
let hdSLFilter='all';

function hdSLEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdSLLoad(){try{return JSON.parse(localStorage.getItem(HD_SORTIE_LOG_KEY)||'[]')||[]}catch{return []}}
function hdSLSave(v){localStorage.setItem(HD_SORTIE_LOG_KEY,JSON.stringify((Array.isArray(v)?v:[]).slice(0,500)))}
function hdSLHunts(){try{return JSON.parse(localStorage.getItem('harbordesk-drop-hunts-v1')||'[]')||[]}catch{return []}}
function hdSLSaveHunts(v){localStorage.setItem('harbordesk-drop-hunts-v1',JSON.stringify(v));try{if(typeof hdRenderDropHunts==='function')hdRenderDropHunts();if(typeof hdRenderDropDb==='function')hdRenderDropDb()}catch{}}
function hdSLUid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2)}
function hdSLNum(id){return Math.max(0,Number(document.getElementById(id)?.value)||0)}
function hdSLSelectedHunt(){const id=document.getElementById('hdSLHunt')?.value||'';return hdSLHunts().find(x=>x.id===id)||null}
function hdSLFmtAt(ts){return new Date(ts).toLocaleString('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}
function hdSLResultWin(r){return ['S','A','B'].includes(r)}

function hdSLActivity(actionId){
 if(typeof hdALRecord!=='function')return null;
 let before=[];try{before=JSON.parse(localStorage.getItem('harbordesk-activity-log-v1')||'[]')||[]}catch{}
 const oldFirst=before[0]?.id||null;hdALRecord(actionId);
 let after=[];try{after=JSON.parse(localStorage.getItem('harbordesk-activity-log-v1')||'[]')||[]}catch{}
 const first=after[0];return first&&first.id!==oldFirst?first.id:null;
}
function hdSLApplyActivity(entry){
 const ids=[];const push=id=>{const x=hdSLActivity(id);if(x)ids.push(x)};
 push('sortie');
 const battles=Math.max(0,Number(entry.battles)||0);
 if(entry.result==='S')push('swin');else if(hdSLResultWin(entry.result))push('win');else if(battles>0)push('battle');
 const counted=(entry.result==='S'||hdSLResultWin(entry.result)||battles>0)?1:0;
 for(let i=counted;i<battles;i++)push('battle');
 if(entry.boss){push('boss-arrive');if(hdSLResultWin(entry.result))push('boss-win')}
 if(entry.boss&&hdSLResultWin(entry.result)&&/^2-[1-5]$/.test(entry.map))push('southwest-boss');
 return ids;
}
function hdSLApplyHunt(entry){
 if(!entry.huntId)return null;const rows=hdSLHunts(),h=rows.find(x=>x.id===entry.huntId);if(!h)return null;
 const delta={runs:1,s:entry.result==='S'?1:0,a:entry.result==='A'?1:0,obtainedChanged:false};h.runs=(Number(h.runs)||0)+1;h.s=(Number(h.s)||0)+delta.s;h.a=(Number(h.a)||0)+delta.a;
 if(entry.targetObtained&&!h.obtained){h.obtained=true;h.obtainedAt=entry.at;delta.obtainedChanged=true}
 hdSLSaveHunts(rows);return delta;
}
function hdSLUndoHunt(log,remaining){
 if(!log.huntId||!log.huntDelta)return;const rows=hdSLHunts(),h=rows.find(x=>x.id===log.huntId);if(!h)return;const d=log.huntDelta;h.runs=Math.max(0,(Number(h.runs)||0)-(Number(d.runs)||0));h.s=Math.max(0,(Number(h.s)||0)-(Number(d.s)||0));h.a=Math.max(0,(Number(h.a)||0)-(Number(d.a)||0));
 if(d.obtainedChanged&&!remaining.some(x=>x.huntId===log.huntId&&x.targetObtained)){h.obtained=false;delete h.obtainedAt}hdSLSaveHunts(rows);
}
function hdSLResetForm(){
 const map=document.getElementById('hdSLMap'),node=document.getElementById('hdSLNode'),drop=document.getElementById('hdSLDrop'),memo=document.getElementById('hdSLMemo');if(map)map.value='';if(node)node.value='';if(drop)drop.value='';if(memo)memo.value='';
 for(const id of ['hdSLBuckets','hdSLFuel','hdSLAmmo','hdSLSteel','hdSLBauxite']){const el=document.getElementById(id);if(el)el.value='0'}const battles=document.getElementById('hdSLBattles');if(battles)battles.value='1';const boss=document.getElementById('hdSLBoss');if(boss)boss.checked=false;const obtained=document.getElementById('hdSLTargetObtained');if(obtained)obtained.checked=false;
}
function hdSLRecord(){
 const hunt=hdSLSelectedHunt(),map=(document.getElementById('hdSLMap')?.value||hunt?.map||'').trim(),node=(document.getElementById('hdSLNode')?.value||hunt?.node||'').trim(),result=document.getElementById('hdSLResult')?.value||'S';
 if(!map){alert('海域を入力してね');return}
 const entry={id:hdSLUid(),at:Date.now(),map,node,result,boss:!!document.getElementById('hdSLBoss')?.checked,retreat:result==='撤退',battles:Math.max(0,Math.min(20,hdSLNum('hdSLBattles'))),drop:(document.getElementById('hdSLDrop')?.value||'').trim(),buckets:hdSLNum('hdSLBuckets'),fuel:hdSLNum('hdSLFuel'),ammo:hdSLNum('hdSLAmmo'),steel:hdSLNum('hdSLSteel'),bauxite:hdSLNum('hdSLBauxite'),memo:(document.getElementById('hdSLMemo')?.value||'').trim(),huntId:hunt?.id||'',huntShip:hunt?.ship||'',targetObtained:!!document.getElementById('hdSLTargetObtained')?.checked};
 entry.activityLogIds=hdSLApplyActivity(entry);entry.huntDelta=hdSLApplyHunt(entry);const rows=hdSLLoad();rows.unshift(entry);hdSLSave(rows);hdSLResetForm();if(hunt){const sel=document.getElementById('hdSLHunt');if(sel)sel.value=hunt.id;hdSLFillFromHunt()}hdSLRender();try{if(typeof hdCCRender==='function')hdCCRender()}catch{}
}
function hdSLDelete(id){
 const rows=hdSLLoad(),log=rows.find(x=>x.id===id);if(!log)return;if(!confirm('この出撃ログを削除して、連動した掘り/任務カウントも戻す？'))return;const remaining=rows.filter(x=>x.id!==id);for(const aid of log.activityLogIds||[]){try{if(typeof hdALUndo==='function')hdALUndo(aid)}catch{}}hdSLUndoHunt(log,remaining);hdSLSave(remaining);hdSLRender();try{if(typeof hdCCRender==='function')hdCCRender()}catch{}
}
function hdSLFillFromHunt(){const h=hdSLSelectedHunt();if(!h)return;const map=document.getElementById('hdSLMap'),node=document.getElementById('hdSLNode');if(map)map.value=h.map||'';if(node)node.value=h.node||'';hdSLRenderTargetHint()}
function hdSLRenderTargetHint(){const h=hdSLSelectedHunt(),hint=document.getElementById('hdSLTargetHint');if(hint)hint.textContent=h?`目標: ${h.ship}｜${h.map} ${h.node}`:'掘り目標を選ぶと周回数にも連動する';const box=document.getElementById('hdSLTargetObtainedWrap');if(box)box.hidden=!h}
function hdSLFiltered(){const rows=hdSLLoad();if(hdSLFilter==='all')return rows;if(hdSLFilter==='today'){const d=new Date(),start=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();return rows.filter(x=>x.at>=start)}if(hdSLFilter==='hunt')return rows.filter(x=>x.huntId);return rows.filter(x=>x.map===hdSLFilter)}
function hdSLStats(rows){const n=rows.length,boss=rows.filter(x=>x.boss).length,s=rows.filter(x=>x.result==='S').length,a=rows.filter(x=>x.result==='A').length,retreat=rows.filter(x=>x.retreat||x.result==='撤退').length,buckets=rows.reduce((a,x)=>a+(Number(x.buckets)||0),0);return {n,boss,s,a,retreat,buckets,fuel:rows.reduce((a,x)=>a+(Number(x.fuel)||0),0),ammo:rows.reduce((a,x)=>a+(Number(x.ammo)||0),0),steel:rows.reduce((a,x)=>a+(Number(x.steel)||0),0),bauxite:rows.reduce((a,x)=>a+(Number(x.bauxite)||0),0)}}
function hdSLRender(){
 const host=document.getElementById('hdSortieLog');if(!host)return;const rows=hdSLFiltered(),st=hdSLStats(rows),all=hdSLLoad(),hunts=hdSLHunts().filter(x=>!x.obtained),maps=[...new Set(all.map(x=>x.map).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
 const huntSel=document.getElementById('hdSLHunt');if(huntSel){const v=huntSel.value;huntSel.innerHTML=`<option value="">連動しない</option>${hunts.map(h=>`<option value="${hdSLEsc(h.id)}">${hdSLEsc(h.ship)}｜${hdSLEsc(h.map)} ${hdSLEsc(h.node)}</option>`).join('')}`;if(hunts.some(h=>h.id===v))huntSel.value=v}
 const filters=document.getElementById('hdSLFilters');if(filters)filters.innerHTML=[['all','全期間'],['today','今日'],['hunt','掘りのみ'],...maps.map(m=>[m,m])].map(([id,label])=>`<button type="button" class="ghost small${hdSLFilter===id?' active':''}" data-hd-sl-filter="${hdSLEsc(id)}">${hdSLEsc(label)}</button>`).join('');
 const sum=document.getElementById('hdSLSummary');if(sum)sum.innerHTML=`<div><span>周回</span><strong>${st.n}</strong></div><div><span>ボス到達</span><strong>${st.n?Math.round(st.boss/st.n*100):0}%</strong></div><div><span>S勝利</span><strong>${st.n?Math.round(st.s/st.n*100):0}%</strong></div><div><span>撤退</span><strong>${st.n?Math.round(st.retreat/st.n*100):0}%</strong></div><div><span>バケツ</span><strong>${st.buckets}</strong><small>${st.n?(st.buckets/st.n).toFixed(2):'0.00'}/周</small></div><div><span>資源消費</span><strong>${st.fuel+st.ammo+st.steel+st.bauxite}</strong><small>燃${st.fuel} 弾${st.ammo} 鋼${st.steel} ボ${st.bauxite}</small></div>`;
 const list=document.getElementById('hdSLList');if(list)list.innerHTML=rows.slice(0,30).map(x=>`<article class="hd-sl-row"><div class="hd-sl-main"><div><strong>${hdSLEsc(x.map)} ${hdSLEsc(x.node||'')}</strong><span class="hd-sl-result ${x.result==='S'?'s':x.result==='撤退'?'retreat':''}">${hdSLEsc(x.result)}</span>${x.boss?'<span class="hd-sl-badge">ボス</span>':''}${x.huntShip?`<span class="hd-sl-badge hunt">掘り ${hdSLEsc(x.huntShip)}</span>`:''}</div><small>${hdSLFmtAt(x.at)}${x.drop?`・Drop ${hdSLEsc(x.drop)}`:''}${x.buckets?`・バケツ${x.buckets}`:''}</small></div><div class="hd-sl-cost">${(x.fuel||x.ammo||x.steel||x.bauxite)?`燃${x.fuel||0} 弾${x.ammo||0} 鋼${x.steel||0} ボ${x.bauxite||0}`:'資源未記録'}</div>${x.memo?`<p>${hdSLEsc(x.memo)}</p>`:''}<button type="button" class="ghost small" data-hd-sl-delete="${x.id}">削除・連動を戻す</button></article>`).join('')||'<div class="empty">まだ出撃ログはないよ。上のフォームから1周ずつ記録できる。</div>';hdSLRenderTargetHint();
}
function hdSLEnsure(){
 if(document.getElementById('sortieLog'))return;const anchor=document.getElementById('dropHuntingDb')||document.getElementById('activityLogger')||document.getElementById('eventLog');if(!anchor)return;const sec=document.createElement('section');sec.id='sortieLog';sec.className='advanced-section hd-sl-section';
 sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">SORTIE / FARMING ANALYTICS</div><h2>出撃・周回ログ</h2></div><span class="muted">任務・掘り記録と連動</span></div><div class="hd-sl-note">1周をまとめて記録。任務連動はチェックリストへ追加した受注中任務だけ。資源消費は任意入力で、補給・修理など実際に減った量を入れる目安。</div><div class="hd-sl-form"><label>掘り目標<select id="hdSLHunt"><option value="">連動しない</option></select></label><label>海域<input id="hdSLMap" placeholder="例 7-4"></label><label>到達マス<input id="hdSLNode" placeholder="例 P ボス"></label><label>結果<select id="hdSLResult"><option>S</option><option>A</option><option>B</option><option>C</option><option>D</option><option>撤退</option></select></label><label>戦闘数<input id="hdSLBattles" type="number" min="0" max="20" value="1"></label><label class="hd-sl-check"><input id="hdSLBoss" type="checkbox">ボス到達</label><label>ドロップ<input id="hdSLDrop" placeholder="艦名など"></label><label>バケツ<input id="hdSLBuckets" type="number" min="0" value="0"></label><label>燃料消費<input id="hdSLFuel" type="number" min="0" value="0"></label><label>弾薬消費<input id="hdSLAmmo" type="number" min="0" value="0"></label><label>鋼材消費<input id="hdSLSteel" type="number" min="0" value="0"></label><label>ボーキ消費<input id="hdSLBauxite" type="number" min="0" value="0"></label><label class="hd-sl-wide">メモ<input id="hdSLMemo" placeholder="撤退原因、編成変更など"></label><label id="hdSLTargetObtainedWrap" class="hd-sl-check hd-sl-wide" hidden><input id="hdSLTargetObtained" type="checkbox">この周回で目標艦を入手</label><div id="hdSLTargetHint" class="hd-sl-hint hd-sl-wide"></div><button type="button" class="primary hd-sl-wide" data-hd-sl-save>この1周を記録</button></div><div id="hdSLFilters" class="hd-sl-filters"></div><div id="hdSLSummary" class="hd-sl-summary"></div><div id="hdSLList" class="hd-sl-list"></div>`;anchor.insertAdjacentElement('beforebegin',sec);hdSLRender();
}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-hd-sl-save]')){hdSLRecord();return}const f=e.target.closest?.('[data-hd-sl-filter]');if(f){hdSLFilter=f.dataset.hdSlFilter;hdSLRender();return}const d=e.target.closest?.('[data-hd-sl-delete]');if(d){hdSLDelete(d.dataset.hdSlDelete);return}});
document.addEventListener('change',e=>{if(e.target?.id==='hdSLHunt')hdSLFillFromHunt()});
window.addEventListener('load',()=>setTimeout(()=>{hdSLEnsure();hdSLRender()},1400));setTimeout(hdSLEnsure,1900);window.addEventListener('storage',()=>setTimeout(hdSLRender,0));
