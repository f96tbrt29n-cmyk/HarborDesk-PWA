const HD_DX_CRITICAL=['./app.js','./update-manager.js','./app-version.json','./manifest.webmanifest'];

function hdDXEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdDXBytes(n){n=Number(n)||0;if(n<1024)return `${n} B`;if(n<1024*1024)return `${(n/1024).toFixed(1)} KB`;return `${(n/1024/1024).toFixed(1)} MB`}
function hdDXLocalHealth(){
  if(typeof hdPHHealth==='function')return hdPHHealth();
  let keys=0,bytes=0,invalid=0;
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);if(!k?.startsWith('harbordesk'))continue;keys++;const v=localStorage.getItem(k)||'';bytes+=new Blob([v]).size;
    const t=v.trim();if(t.startsWith('{')||t.startsWith('[')){try{JSON.parse(v)}catch{invalid++}}
  }
  return {keys,bytes,invalid};
}
function hdDXModuleHealth(){
  const s=window.HD_MODULE_STATUS||{},rows=Object.entries(s),errors=rows.filter(([,v])=>v==='error').map(([k])=>k),loading=rows.filter(([,v])=>v==='loading').map(([k])=>k),ok=rows.filter(([,v])=>v==='ok').length;
  return {total:rows.length,ok,errors,loading};
}
async function hdDXCollect(){
  const local=hdDXLocalHealth(),modules=hdDXModuleHealth(),expected=`harbordesk-pwa-v${typeof HD_APP_BUILD!=='undefined'?HD_APP_BUILD:'?'}`;
  let swSupported='serviceWorker' in navigator,swControlled=!!navigator.serviceWorker?.controller,swRegistered=false,swActive=false;
  if(swSupported){try{const reg=await navigator.serviceWorker.getRegistration();swRegistered=!!reg;swActive=!!reg?.active}catch{}}
  let cacheNames=[],currentCache=false,criticalCached=0;
  try{cacheNames=(await caches.keys()).filter(x=>x.startsWith('harbordesk-pwa-'));currentCache=cacheNames.includes(expected);if(currentCache){const c=await caches.open(expected);for(const p of HD_DX_CRITICAL)if(await c.match(p))criticalCached++}}catch{}
  let usage=0,quota=0,persisted=null;
  try{const est=await navigator.storage?.estimate?.();usage=Number(est?.usage)||0;quota=Number(est?.quota)||0}catch{}
  try{persisted=await navigator.storage?.persisted?.()}catch{}
  let snapshots=0;try{if(typeof hdPHGetSnapshots==='function')snapshots=(await hdPHGetSnapshots()).length}catch{}
  const backupRaw=Number(localStorage.getItem('harbordesk-last-external-backup-v1'))||0,backupDays=backupRaw?Math.floor((Date.now()-backupRaw)/86400000):null;
  const issues=[];
  if(local.invalid)issues.push(`${local.invalid}件の保存データをJSONとして解析できない`);
  if(modules.errors.length)issues.push(`${modules.errors.length}件の追加モジュール読込エラー`);
  if(modules.loading.length)issues.push(`${modules.loading.length}件のモジュールが読込中のまま`);
  if(swSupported&&!swControlled)issues.push('Service Workerがこの画面を制御していない');
  if(!currentCache)issues.push(`現在版キャッシュ ${expected} が見つからない`);
  if(currentCache&&criticalCached<HD_DX_CRITICAL.length)issues.push(`主要キャッシュ ${criticalCached}/${HD_DX_CRITICAL.length}`);
  if(quota&&usage/quota>=0.8)issues.push('ブラウザ保存容量の使用率が80%以上');
  const status=issues.length?'warn':'ok';
  return {at:Date.now(),online:navigator.onLine,standalone:!!(window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone),local,modules,expected,swSupported,swControlled,swRegistered,swActive,cacheNames,currentCache,criticalCached,usage,quota,persisted,snapshots,backupDays,status,issues};
}
function hdDXMetric(label,value,sub,cls=''){
  return `<div class="hd-dx-metric ${cls}"><span>${hdDXEsc(label)}</span><strong>${hdDXEsc(value)}</strong><small>${hdDXEsc(sub||'')}</small></div>`;
}
async function hdDXRender(){
  const host=document.getElementById('hdDiagnosticsCenter');if(!host)return;
  host.innerHTML='<div class="empty">診断中…</div>';
  const d=await hdDXCollect();window.__hdDXLast=d;
  const storagePct=d.quota?Math.round(d.usage/d.quota*100):null;
  const modSub=d.modules.errors.length?`エラー: ${d.modules.errors.join(', ')}`:d.modules.loading.length?`読込中: ${d.modules.loading.join(', ')}`:'読込エラーなし';
  const cacheSub=d.currentCache?`主要 ${d.criticalCached}/${HD_DX_CRITICAL.length}`:`保持: ${d.cacheNames.join(', ')||'なし'}`;
  const issueHtml=d.issues.length?`<div class="hd-dx-issues"><strong>確認ポイント</strong>${d.issues.map(x=>`<div>• ${hdDXEsc(x)}</div>`).join('')}</div>`:'<div class="hd-dx-ok">主要チェックは正常だよ。</div>';
  host.innerHTML=`<div class="section-head"><div><div class="eyebrow">DIAGNOSTICS</div><h2>診断・復旧センター</h2></div><span class="hd-dx-state ${d.status}">${d.status==='ok'?'正常':'要確認'}</span></div><p class="muted">表示がおかしい時に、保存データを消さずにアプリ側だけ確認・復旧するための画面。</p><div class="hd-dx-grid">${hdDXMetric('アプリ版',`v${typeof HD_APP_VERSION!=='undefined'?HD_APP_VERSION:'?'}`,`build ${typeof HD_APP_BUILD!=='undefined'?HD_APP_BUILD:'?'}`,'ok')}${hdDXMetric('通信',d.online?'オンライン':'オフライン',d.standalone?'ホーム画面PWA':'ブラウザ表示',d.online?'ok':'warn')}${hdDXMetric('追加モジュール',`${d.modules.ok}/${d.modules.total} OK`,modSub,d.modules.errors.length||d.modules.loading.length?'warn':'ok')}${hdDXMetric('端末データ',`${d.local.keys}項目`,`${hdDXBytes(d.local.bytes)} / JSON異常 ${d.local.invalid}`,d.local.invalid?'warn':'ok')}${hdDXMetric('Service Worker',d.swControlled?'制御中':d.swRegistered?'登録済み':'未登録',d.swActive?'active':'inactive',d.swControlled?'ok':'warn')}${hdDXMetric('PWAキャッシュ',d.currentCache?'現行版あり':'現行版なし',cacheSub,d.currentCache&&d.criticalCached===HD_DX_CRITICAL.length?'ok':'warn')}${hdDXMetric('ブラウザ保存領域',storagePct==null?'取得不可':`${storagePct}% 使用`,d.quota?`${hdDXBytes(d.usage)} / ${hdDXBytes(d.quota)}`:'Safari側で取得不可',storagePct!=null&&storagePct>=80?'warn':'ok')}${hdDXMetric('端末内スナップショット',`${d.snapshots}世代`,d.persisted===true?'永続保存許可あり':d.persisted===false?'永続保存保証なし':'永続状態不明',d.snapshots?'ok':'warn')}${hdDXMetric('外部JSONバックアップ',d.backupDays==null?'未記録':d.backupDays===0?'今日':`${d.backupDays}日前`,'端末故障対策',d.backupDays!=null&&d.backupDays<14?'ok':'warn')}</div>${issueHtml}<div class="hd-dx-actions"><button type="button" class="ghost" data-dx-recheck>もう一度診断</button><button type="button" class="ghost" data-dx-reinit>画面だけ再初期化</button><button type="button" class="primary" data-dx-cache>アプリキャッシュを再構築</button><button type="button" class="ghost" data-dx-update>更新確認</button><button type="button" class="ghost" data-dx-copy>診断結果をコピー</button></div><div class="hd-dx-note">「画面だけ再初期化」と「アプリキャッシュを再構築」は、HarborDeskの艦娘・装備・任務・資源・ログなどの端末保存データを削除しないよ。</div>`;
}
function hdDXEnsure(){
  if(document.getElementById('diagnosticsCenter')){hdDXRender();return}
  const anchor=document.getElementById('personalHomeCenter')||document.getElementById('dashboard')||document.querySelector('main section');if(!anchor)return;
  const sec=document.createElement('section');sec.id='diagnosticsCenter';sec.className='advanced-section';sec.innerHTML='<div id="hdDiagnosticsCenter"></div>';anchor.insertAdjacentElement('afterend',sec);hdDXRender();
}
function hdDXReport(d=window.__hdDXLast){
  if(!d)return 'HarborDesk diagnostics: not collected';
  return [`HarborDesk Diagnostics`,`time=${new Date(d.at).toISOString()}`,`version=${typeof HD_APP_VERSION!=='undefined'?HD_APP_VERSION:'?'} build=${typeof HD_APP_BUILD!=='undefined'?HD_APP_BUILD:'?'}`,`online=${d.online} standalone=${d.standalone}`,`modules=${d.modules.ok}/${d.modules.total} errors=${d.modules.errors.join(',')||'none'} loading=${d.modules.loading.join(',')||'none'}`,`localStorageKeys=${d.local.keys} bytes=${d.local.bytes} invalidJson=${d.local.invalid}`,`serviceWorker=supported:${d.swSupported} registered:${d.swRegistered} active:${d.swActive} controlled:${d.swControlled}`,`cacheExpected=${d.expected} current=${d.currentCache} critical=${d.criticalCached}/${HD_DX_CRITICAL.length} caches=${d.cacheNames.join(',')||'none'}`,`storage=${d.usage}/${d.quota} persisted=${d.persisted}`,`snapshots=${d.snapshots} externalBackupDays=${d.backupDays==null?'none':d.backupDays}`,`issues=${d.issues.join(' | ')||'none'}`].join('\n');
}
async function hdDXCopy(){const text=hdDXReport();try{await navigator.clipboard.writeText(text);alert('診断結果をコピーしたよ')}catch{prompt('この診断結果をコピーしてね',text)}}
async function hdDXReinit(){try{if(typeof hdInitLoadedModules==='function')hdInitLoadedModules();window.dispatchEvent(new CustomEvent('hd:modules-ready',{detail:{manual:true}}));setTimeout(hdDXRender,250)}catch{setTimeout(hdDXRender,250)}}
async function hdDXCacheRepair(){if(!navigator.onLine){alert('オフライン中はキャッシュ再構築を実行しないよ。通信できる状態で試してね。');return}if(!confirm('アプリキャッシュだけ再構築する？\n艦娘・装備・任務・資源などの保存データは消さないよ。'))return;if(typeof hdForceUpdate==='function'){hdForceUpdate();return}try{const ks=await caches.keys();await Promise.all(ks.filter(k=>k.startsWith('harbordesk-pwa-')).map(k=>caches.delete(k)));location.reload()}catch{location.reload()}}

document.addEventListener('click',e=>{if(e.target.closest?.('[data-dx-recheck]')){hdDXRender();return}if(e.target.closest?.('[data-dx-reinit]')){hdDXReinit();return}if(e.target.closest?.('[data-dx-cache]')){hdDXCacheRepair();return}if(e.target.closest?.('[data-dx-update]')){if(typeof hdCheckForUpdate==='function')hdCheckForUpdate(true);return}if(e.target.closest?.('[data-dx-copy]')){hdDXCopy();return}});
window.addEventListener('online',()=>hdDXRender());window.addEventListener('offline',()=>hdDXRender());
window.addEventListener('hd:modules-ready',()=>setTimeout(hdDXEnsure,150));
window.addEventListener('load',()=>setTimeout(hdDXEnsure,1700));
