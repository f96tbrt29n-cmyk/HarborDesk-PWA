const HD_SPA_MODE_KEY='harbordesk-sortie-analytics-mode-v1';
const HD_SPA_MAP_KEY='harbordesk-sortie-analytics-map-v1';
const HD_SPA_STRATEGY_ORDER=['stable','firepower','route','boss','reserve','manual'];

function hdSPAEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdSPAMode(){try{return localStorage.getItem(HD_SPA_MODE_KEY)||'strategy'}catch{return 'strategy'}}
function hdSPASetMode(v){try{localStorage.setItem(HD_SPA_MODE_KEY,v)}catch{}}
function hdSPAMap(){try{return localStorage.getItem(HD_SPA_MAP_KEY)||'all'}catch{return 'all'}}
function hdSPASetMap(v){try{localStorage.setItem(HD_SPA_MAP_KEY,v)}catch{}}
function hdSPALogs(){
 try{return (typeof hdSLLoad==='function'?hdSLLoad():JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]')).filter(x=>x&&x.sessionId&&x.fleetId)}catch{return []}
}
function hdSPAStrategyLabel(id,row){
 if(row?.strategyLabel)return row.strategyLabel;
 if(typeof HD_SPM_STRATEGIES!=='undefined'&&HD_SPM_STRATEGIES[id])return HD_SPM_STRATEGIES[id].label;
 return {stable:'安定重視',firepower:'火力重視',route:'道中突破重視',boss:'ボス重視',reserve:'装備温存',manual:'手動編成'}[id]||id||'手動編成';
}
function hdSPAPct(n,d){return d?Math.round(n/d*100):0}
function hdSPANum(v){return Math.max(0,Number(v)||0)}
function hdSPAMetrics(rows){
 const n=rows.length,boss=rows.filter(x=>x.boss).length,s=rows.filter(x=>x.result==='S').length,wins=rows.filter(x=>['S','A','B'].includes(x.result)).length,retreat=rows.filter(x=>x.retreat||x.result==='撤退').length;
 const totalResource=rows.reduce((a,x)=>a+hdSPANum(x.fuel)+hdSPANum(x.ammo)+hdSPANum(x.steel)+hdSPANum(x.bauxite),0);
 const buckets=rows.reduce((a,x)=>a+hdSPANum(x.buckets),0);
 const durations=rows.map(x=>hdSPANum(x.durationMs)).filter(x=>x>0);
 const readiness=rows.map(x=>{const r=x.readinessSnapshot||{},den=(Number(r.autoTotal)||0)+(Number(r.manualTotal)||0),num=(Number(r.autoOk)||0)+(Number(r.manualDone)||0);return den?num/den:null}).filter(x=>x!=null);
 return {
  n,bossRate:hdSPAPct(boss,n),sRate:hdSPAPct(s,n),winRate:hdSPAPct(wins,n),retreatRate:hdSPAPct(retreat,n),
  avgResource:n?Math.round(totalResource/n):0,avgBuckets:n?Number((buckets/n).toFixed(2)):0,
  avgDurationMin:durations.length?Number((durations.reduce((a,b)=>a+b,0)/durations.length/60000).toFixed(1)):null,
  avgReadiness:readiness.length?Math.round(readiness.reduce((a,b)=>a+b,0)/readiness.length*100):null
 };
}
function hdSPAGroupKey(row,mode){
 if(mode==='fleet')return row.fleetId||row.fleetName||'unknown';
 return row.strategy||'manual';
}
function hdSPAGroupLabel(row,mode){
 return mode==='fleet'?(row.fleetName||'名称なし'):hdSPAStrategyLabel(row.strategy||'manual',row);
}
function hdSPARows(){
 const mode=hdSPAMode(),map=hdSPAMap(),logs=hdSPALogs().filter(x=>map==='all'||x.map===map),groups=new Map();
 for(const row of logs){
  const key=hdSPAGroupKey(row,mode);
  if(!groups.has(key))groups.set(key,{key,label:hdSPAGroupLabel(row,mode),strategy:row.strategy||'manual',rows:[],maps:new Set()});
  const g=groups.get(key);g.rows.push(row);g.maps.add(row.map);
 }
 const out=[...groups.values()].map(g=>({...g,metrics:hdSPAMetrics(g.rows),maps:[...g.maps]}));
 out.sort((a,b)=>{
  if(mode==='strategy'){const ai=HD_SPA_STRATEGY_ORDER.indexOf(a.strategy),bi=HD_SPA_STRATEGY_ORDER.indexOf(b.strategy);if(ai!==bi)return (ai<0?99:ai)-(bi<0?99:bi)}
  return b.metrics.n-a.metrics.n||a.label.localeCompare(b.label,'ja');
 });
 return hdSPABadges(out);
}
function hdSPABadges(rows){
 if(!rows.length)return rows;
 const eligible=rows.filter(x=>x.metrics.n>0),maxBoss=Math.max(...eligible.map(x=>x.metrics.bossRate)),maxS=Math.max(...eligible.map(x=>x.metrics.sRate)),minRetreat=Math.min(...eligible.map(x=>x.metrics.retreatRate)),minResource=Math.min(...eligible.map(x=>x.metrics.avgResource));
 const timed=eligible.filter(x=>x.metrics.avgDurationMin!=null),minDuration=timed.length?Math.min(...timed.map(x=>x.metrics.avgDurationMin)):null;
 return rows.map(x=>{const b=[];if(x.metrics.bossRate===maxBoss)b.push('ボス到達率最大');if(x.metrics.sRate===maxS)b.push('S率最大');if(x.metrics.retreatRate===minRetreat)b.push('撤退率最小');if(x.metrics.avgResource===minResource)b.push('資源消費最小');if(minDuration!=null&&x.metrics.avgDurationMin===minDuration)b.push('平均時間最短');return {...x,badges:b}});
}
function hdSPAMaps(){
 const maps=[...new Set(hdSPALogs().map(x=>x.map).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
 return maps;
}
function hdSPACard(row){
 const m=row.metrics,sample=m.n<3?'<div class="hd-spa-sample warn">サンプル少なめ</div>':'<div class="hd-spa-sample">記録 '+m.n+'周</div>',badges=row.badges.length?'<div class="hd-spa-badges">'+row.badges.map(x=>'<span>'+hdSPAEsc(x)+'</span>').join('')+'</div>':'';
 return `<article class="hd-spa-card" data-hd-spa-card="${hdSPAEsc(row.key)}">${badges}<div class="hd-spa-card-head"><div><strong>${hdSPAEsc(row.label)}</strong><small>${hdSPAEsc(row.maps.join(' / '))}</small></div>${sample}</div><div class="hd-spa-metrics"><span>ボス到達 <b>${m.bossRate}%</b></span><span>S勝利 <b>${m.sRate}%</b></span><span>B以上勝利 <b>${m.winRate}%</b></span><span>撤退 <b>${m.retreatRate}%</b></span><span>平均資源 <b>${m.avgResource}</b></span><span>平均バケツ <b>${m.avgBuckets}</b></span><span>平均時間 <b>${m.avgDurationMin==null?'—':m.avgDurationMin+'分'}</b></span><span>開始時確認 <b>${m.avgReadiness==null?'—':m.avgReadiness+'%'}</b></span></div></article>`;
}
function hdSPAHtml(){
 const mode=hdSPAMode(),map=hdSPAMap(),rows=hdSPARows(),maps=hdSPAMaps();
 if(!hdSPALogs().length)return '<section class="hd-spa"><div class="hd-spa-head"><div><div class="eyebrow">SORTIE PERFORMANCE</div><strong>実戦データ分析</strong><span>実戦モードで帰還結果を記録すると、ここに方針別の実績が出るよ。</span></div></div></section>';
 return `<section class="hd-spa"><div class="hd-spa-head"><div><div class="eyebrow">SORTIE PERFORMANCE</div><strong>実戦データ分析</strong><span>実際の出撃結果を方針・保存編成ごとに比較</span></div><div class="hd-spa-controls"><select data-hd-spa-mode><option value="strategy" ${mode==='strategy'?'selected':''}>方針別</option><option value="fleet" ${mode==='fleet'?'selected':''}>保存編成別</option></select><select data-hd-spa-map><option value="all">全海域</option>${maps.map(x=>`<option value="${hdSPAEsc(x)}" ${map===x?'selected':''}>${hdSPAEsc(x)}</option>`).join('')}</select></div></div>${rows.length?'<div class="hd-spa-grid">'+rows.map(hdSPACard).join('')+'</div>':'<div class="hd-spa-empty">この条件に一致する実戦ログはまだないよ。</div>'}<p class="hd-spa-note">※各バッジはその表示範囲内の指標最大・最小を示すだけ。記録数が少ないうちは傾向として見てね。通常フォームから手入力した旧ログは方針情報がないため、この比較には含めないよ。</p></section>`;
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
document.addEventListener('change',e=>{
 const m=e.target.closest?.('[data-hd-spa-mode]');if(m){hdSPASetMode(m.value);hdSPARender();return}
 const map=e.target.closest?.('[data-hd-spa-map]');if(map){hdSPASetMap(map.value);hdSPARender();return}
});
window.addEventListener('storage',e=>{if(e.key==='harbordesk-sortie-log-v1')hdSPARender()});
window.addEventListener('load',()=>setTimeout(()=>{if(!hdSPAInstall())setTimeout(hdSPAInstall,500)},1500));
hdSPAInstall();
