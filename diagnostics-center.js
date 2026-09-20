const HD_DX_CRITICAL=['./app.js','./update-manager.js','./app-version.json','./manifest.webmanifest','./ship-master-snapshot.js'];

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
const HD_DX_UPSTREAM_KEY='harbordesk-dx-upstream-v1';
const HD_DX_UPSTREAM_TTL=30*60*1000;
async function hdDXGithubHead(repo,ref='master'){
  if(!repo)return null;
  const url=`https://api.github.com/repos/${repo}/commits/${encodeURIComponent(ref||'master')}`;
  const res=await fetch(url,{cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
  if(!res.ok)throw new Error(`GitHub ${res.status}`);
  const j=await res.json();
  return {sha:j.sha||'',date:j.commit?.committer?.date||j.commit?.author?.date||''};
}
async function hdDXUpstreamFreshness(masterSource,pickerSource,force=false){
  if(!navigator.onLine)return {checked:false,offline:true,stale:false};
  const key=JSON.stringify([masterSource?.repo||'',masterSource?.ref||'',masterSource?.commit||'',pickerSource?.repo||'',pickerSource?.ref||'',pickerSource?.commit||'']);
  if(!force){
    try{
      const cached=JSON.parse(localStorage.getItem(HD_DX_UPSTREAM_KEY)||'null');
      if(cached?.key===key&&Date.now()-Number(cached.at||0)<HD_DX_UPSTREAM_TTL)return {...cached.data,cached:true};
    }catch{}
  }
  const [a,b]=await Promise.allSettled([
    hdDXGithubHead(masterSource?.repo,masterSource?.ref||'master'),
    hdDXGithubHead(pickerSource?.repo,pickerSource?.ref||'master')
  ]);
  const source=a.status==='fulfilled'?a.value:null,picker=b.status==='fulfilled'?b.value:null;
  const sourceFresh=source&&masterSource?.commit?source.sha===masterSource.commit:null;
  const pickerFresh=picker&&pickerSource?.commit?picker.sha===pickerSource.commit:null;
  const data={
    checked:true,offline:false,cached:false,checkedAt:Date.now(),
    source:{local:masterSource?.commit||'',latest:source?.sha||'',latestDate:source?.date||'',fresh:sourceFresh,error:a.status==='rejected'?String(a.reason?.message||a.reason):''},
    picker:{local:pickerSource?.commit||'',latest:picker?.sha||'',latestDate:picker?.date||'',fresh:pickerFresh,error:b.status==='rejected'?String(b.reason?.message||b.reason):''},
    stale:sourceFresh===false||pickerFresh===false
  };
  try{localStorage.setItem(HD_DX_UPSTREAM_KEY,JSON.stringify({key,at:Date.now(),data}))}catch{}
  return data;
}
function hdDXShipIdentityHealth(){
 let roster=[],fleets={};try{roster=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]')||[]}catch{}try{fleets=JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1')||'{}')||{}}catch{}
 const refs=[];
 for(const row of (Array.isArray(roster)?roster:[]))if(row?.name)refs.push({source:'台帳',label:row.name,row});
 for(const [map,list] of Object.entries(fleets||{}))for(const fleet of (Array.isArray(list)?list:[]))for(const row of (fleet?.ships||[]))if(row?.ship)refs.push({source:`${map} / ${fleet.name||'保存編成'}`,label:row.ship,row:{name:row.ship,masterId:row.masterId}});
 const counts={exact:0,'missing-id':0,mismatch:0,'invalid-id':0,unresolved:0},details=[];
 for(const ref of refs){const s=typeof hdShipIdentityStatus==='function'?hdShipIdentityStatus(ref.row):{status:'unresolved'};counts[s.status]=(counts[s.status]||0)+1;if(s.status!=='exact')details.push({...ref,status:s.status,id:s.id||s.suggestedId||0,canonical:s.canonical||''})}
 return {total:refs.length,...counts,issues:details.length,details:details.slice(0,30)};
}
function hdDXRepairShipIdentity(){
 if(!confirm('艦隊台帳と保存編成のMASTER ID・艦名をマスターに合わせて修復する？\nLv・タグ・装備メモなどは変更しないよ。'))return 0;
 let changed=0,roster=[],fleets={};try{roster=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]')||[]}catch{}try{fleets=JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1')||'{}')||{}}catch{}
 for(const row of (Array.isArray(roster)?roster:[])){if(!row?.name)continue;const s=typeof hdShipIdentityStatus==='function'?hdShipIdentityStatus(row):null;if(!s?.master)continue;const id=Number(s.master.id)||0,name=String(s.master.name||row.name);if(Number(row.masterId)!==id||row.name!==name){row.masterId=id;row.name=name;row.updatedAt=Date.now();changed++}}
 for(const list of Object.values(fleets||{}))for(const fleet of (Array.isArray(list)?list:[]))for(const row of (fleet?.ships||[])){if(!row?.ship)continue;const s=typeof hdShipIdentityStatus==='function'?hdShipIdentityStatus({name:row.ship,masterId:row.masterId}):null;if(!s?.master)continue;const id=Number(s.master.id)||0,name=String(s.master.name||row.ship);if(Number(row.masterId)!==id||row.ship!==name){row.masterId=id;row.ship=name;changed++}}
 localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(roster));localStorage.setItem('harbordesk-custom-fleets-v1',JSON.stringify(fleets));
 if(typeof renderShipRoster==='function')renderShipRoster();if(typeof refreshShipRosterOptions==='function')refreshShipRosterOptions();if(typeof renderCustomFleets==='function'&&typeof selectedMap!=='undefined'&&selectedMap)renderCustomFleets(selectedMap);if(typeof hdSPSRender==='function')hdSPSRender();window.dispatchEvent(new CustomEvent('hd:ship-identity-changed',{detail:{changed}}));return changed;
}
async function hdDXCollect(forceFresh=false){
  const local=hdDXLocalHealth(),modules=hdDXModuleHealth(),identity=hdDXShipIdentityHealth(),imageIntegrity=typeof hdShipImageIntegrityAudit==='function'?await hdShipImageIntegrityAudit(false).catch(()=>null):null,expected=`harbordesk-pwa-v${typeof HD_APP_BUILD!=='undefined'?HD_APP_BUILD:'?'}`,master=(typeof HD_SHIP_MASTER_AUDIT!=='undefined'?HD_SHIP_MASTER_AUDIT:window.HD_SHIP_MASTER_AUDIT)||null;
  let swSupported='serviceWorker' in navigator,swControlled=!!navigator.serviceWorker?.controller,swRegistered=false,swActive=false;
  if(swSupported){try{const reg=await navigator.serviceWorker.getRegistration();swRegistered=!!reg;swActive=!!reg?.active}catch{}}
  let cacheNames=[],currentCache=false,criticalCached=0;
  try{cacheNames=(await caches.keys()).filter(x=>x.startsWith('harbordesk-pwa-'));currentCache=cacheNames.includes(expected);if(currentCache){const c=await caches.open(expected);for(const p of HD_DX_CRITICAL)if(await c.match(p))criticalCached++}}catch{}
  let usage=0,quota=0,persisted=null;
  try{const est=await navigator.storage?.estimate?.();usage=Number(est?.usage)||0;quota=Number(est?.quota)||0}catch{}
  try{persisted=await navigator.storage?.persisted?.()}catch{}
  let snapshots=0;try{if(typeof hdPHGetSnapshots==='function')snapshots=(await hdPHGetSnapshots()).length}catch{}
  const restoreSafety={
    indexedDB:'indexedDB' in window,
    snapshotApi:typeof hdPHCreateSnapshot==='function'&&typeof hdPHGetSnapshots==='function'&&typeof hdPHOpenDb==='function'&&typeof hdPHProbeSnapshotStore==='function',
    storeReady:false,
    probeOk:false,
    busy:!!window.__hdBackupRestoreBusy,
    error:''
  };
  if(restoreSafety.indexedDB&&restoreSafety.snapshotApi){
    try{
      const probe=await hdPHProbeSnapshotStore();
      restoreSafety.probeOk=!!probe?.ok;
      restoreSafety.storeReady=restoreSafety.probeOk;
      restoreSafety.error=restoreSafety.probeOk?'':String(probe?.error||'snapshot store probe failed');
    }catch(err){restoreSafety.error=String(err?.message||err||'snapshot store probe failed')}
  }
  restoreSafety.ready=restoreSafety.indexedDB&&restoreSafety.snapshotApi&&restoreSafety.storeReady&&restoreSafety.probeOk;
  const backupRaw=Number(localStorage.getItem('harbordesk-last-external-backup-v1'))||0,backupDays=backupRaw?Math.floor((Date.now()-backupRaw)/86400000):null;
  const masterSource=master?.source||null,pickerSource=master?.pickerSource||null;
  const masterChanges=window.HD_KANCOLLE_MASTER_SNAPSHOT?.changes||null;
  const masterUpdated=masterSource?.updated?new Date(masterSource.updated):null,pickerUpdated=pickerSource?.updated?new Date(pickerSource.updated):null;
  const masterDate=masterUpdated&&!Number.isNaN(masterUpdated.getTime())?masterUpdated.toLocaleDateString('ja-JP'):'不明';
  const pickerDate=pickerUpdated&&!Number.isNaN(pickerUpdated.getTime())?pickerUpdated.toLocaleDateString('ja-JP'):'不明';
  const upstream=await hdDXUpstreamFreshness(masterSource,pickerSource,forceFresh).catch(e=>({checked:false,offline:false,stale:false,error:String(e?.message||e)}));
  const issues=[];
  if(local.invalid)issues.push(`${local.invalid}件の保存データをJSONとして解析できない`);
  if(modules.errors.length)issues.push(`${modules.errors.length}件の追加モジュール読込エラー`);
  if(modules.loading.length)issues.push(`${modules.loading.length}件のモジュールが読込中のまま`);
  if(swSupported&&!swControlled)issues.push('Service Workerがこの画面を制御していない');
  if(!currentCache)issues.push(`現在版キャッシュ ${expected} が見つからない`);
  if(currentCache&&criticalCached<HD_DX_CRITICAL.length)issues.push(`主要キャッシュ ${criticalCached}/${HD_DX_CRITICAL.length}`);
  if(quota&&usage/quota>=0.8)issues.push('ブラウザ保存容量の使用率が80%以上');
  if(!restoreSafety.ready)issues.push('復元安全スナップショットを利用できない');
  if(master&&master.profiles!==master.ships)issues.push(`艦娘マスタープロファイル ${master.profiles}/${master.ships}`);
  if(master?.missingProfiles?.length)issues.push(`艦娘マスター未同期 ${master.missingProfiles.length}隻`);
  if(master?.badSlots?.length)issues.push(`スロットマスター異常 ${master.badSlots.length}件`);
  if(master?.snapshotLoaded&&!master?.pickerRulesLoaded)issues.push('装備pickerルール自動同期が未読込');
  if(identity.mismatch)issues.push(`艦MASTER IDと艦名の不一致 ${identity.mismatch}件`);
  if(identity['missing-id'])issues.push(`MASTER ID未設定 ${identity['missing-id']}件`);
  if(identity['invalid-id'])issues.push(`存在しないMASTER ID ${identity['invalid-id']}件`);
  if(identity.unresolved)issues.push(`艦マスター未解決 ${identity.unresolved}件`);
  if(imageIntegrity?.invalidId?.length)issues.push(`艦娘画像に存在しないMASTER ID ${imageIntegrity.invalidId.length}件`);
  if(imageIntegrity?.empty?.length)issues.push(`空の艦娘画像 ${imageIntegrity.empty.length}件`);
  if(imageIntegrity?.badType?.length)issues.push(`艦娘画像の形式異常 ${imageIntegrity.badType.length}件`);
  if(imageIntegrity?.mismatch?.length)issues.push(`艦娘画像のSHA-256不一致 ${imageIntegrity.mismatch.length}件`);
  if(upstream?.source?.fresh===false)issues.push('艦これマスターがupstream最新commitより遅れている');
  if(upstream?.picker?.fresh===false)issues.push('装備pickerルールがupstream最新commitより遅れている');
  const status=issues.length?'warn':'ok';
  return {at:Date.now(),master,masterSource,pickerSource,masterChanges,masterDate,pickerDate,upstream,online:navigator.onLine,standalone:!!(window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone),local,modules,identity,imageIntegrity,expected,swSupported,swControlled,swRegistered,swActive,cacheNames,currentCache,criticalCached,usage,quota,persisted,snapshots,restoreSafety,backupDays,status,issues};
}
function hdDXMetric(label,value,sub,cls=''){
  return `<div class="hd-dx-metric ${cls}"><span>${hdDXEsc(label)}</span><strong>${hdDXEsc(value)}</strong><small>${hdDXEsc(sub||'')}</small></div>`;
}
async function hdDXRender(forceFresh=false){
  const host=document.getElementById('hdDiagnosticsCenter');if(!host)return;
  host.innerHTML='<div class="empty">診断中…</div>';
  const d=await hdDXCollect(forceFresh);window.__hdDXLast=d;
  const storagePct=d.quota?Math.round(d.usage/d.quota*100):null;
  const modSub=d.modules.errors.length?`エラー: ${d.modules.errors.join(', ')}`:d.modules.loading.length?`読込中: ${d.modules.loading.join(', ')}`:'読込エラーなし';
  const cacheSub=d.currentCache?`主要 ${d.criticalCached}/${HD_DX_CRITICAL.length}`:`保持: ${d.cacheNames.join(', ')||'なし'}`;
  const issueHtml=d.issues.length?`<div class="hd-dx-issues"><strong>確認ポイント</strong>${d.issues.map(x=>`<div>• ${hdDXEsc(x)}</div>`).join('')}</div>`:'<div class="hd-dx-ok">主要チェックは正常だよ。</div>';
  const ch=d.masterChanges,shipDiff=ch?(ch.ships.added.length+ch.ships.removed.length+ch.ships.changed.length):0,equipDiff=ch?(ch.equipment.added.length+ch.equipment.removed.length+ch.equipment.changed.length):0;
  const diffMetric=hdDXMetric('前回マスター差分',!ch?'未記録':ch.baseline?'基準値':`艦${shipDiff} / 装備${equipDiff}`,!ch?'次回同期から記録':ch.baseline?'この版を差分比較の基準にする':`増設 ${ch.exslot?.itemRulesChanged||0} / 制限艦 ${ch.exslot?.limitShipsChanged||0} / picker ${ch.picker?.changed?'変更':'変更なし'}`,ch&&!ch.baseline&&(shipDiff||equipDiff||ch.exslot?.changed||ch.picker?.changed)?'warn':'ok');
  const changeNames=ch&&!ch.baseline?[...ch.ships.added.map(x=>'艦追加: '+x),...ch.ships.removed.map(x=>'艦削除: '+x),...ch.ships.changed.map(x=>'艦変更: '+x),...ch.equipment.added.slice(0,12).map(x=>'装備追加: '+x),...ch.equipment.removed.slice(0,12).map(x=>'装備削除: '+x),...ch.equipment.changed.slice(0,12).map(x=>'装備変更: '+x)]:[];
  const changeRest=ch&&!ch.baseline?Math.max(0,shipDiff+equipDiff-changeNames.length):0;
  const masterChangeHtml=ch?`<details class="hd-dx-master-changes"><summary>マスター差分を見る <span>${ch.baseline?'基準値':`艦${shipDiff}・装備${equipDiff}`}</span></summary><div><p>${ch.baseline?'現在のマスターを差分履歴の基準値として登録。次回更新から変更内容を表示するよ。':`api_start2 ${(ch.from||'').slice(0,7)||'—'} → ${(ch.to||'').slice(0,7)||'—'}`}</p>${changeNames.length?`<div class="hd-dx-change-list">${changeNames.map(x=>`<span>${hdDXEsc(x)}</span>`).join('')}${changeRest?`<span>ほか ${changeRest}件</span>`:''}</div>`:''}${!ch.baseline?`<small>補強増設ルール ${ch.exslot?.itemRulesChanged||0}件 / 増設制限艦 ${ch.exslot?.limitShipsChanged||0}件 / picker位置制限 ${ch.picker?.changed?'変更あり':'変更なし'}</small>`:''}</div></details>`:'';
  const up=d.upstream,srcShort=up?.source?.latest?(up.source.latest||'').slice(0,7):'—',pickShort=up?.picker?.latest?(up.picker.latest||'').slice(0,7):'—';
  const freshnessValue=!d.online?'オフライン':!up?.checked?'確認不可':up.stale?'更新待ち':'最新';
  const freshnessSub=!up?.checked?(up?.error||'通信時にupstreamを確認'):`api ${(d.masterSource?.commit||'').slice(0,7)||'—'} / ${srcShort}・picker ${(d.pickerSource?.commit||'').slice(0,7)||'—'} / ${pickShort}${up.cached?'（30分キャッシュ）':''}`;
  const freshnessMetric=hdDXMetric('マスター鮮度',freshnessValue,freshnessSub,up?.stale?'warn':up?.checked?'ok':'');
  host.innerHTML=`<div class="section-head"><div><div class="eyebrow">DIAGNOSTICS</div><h2>診断・復旧センター</h2></div><span class="hd-dx-state ${d.status}">${d.status==='ok'?'正常':'要確認'}</span></div><p class="muted">表示がおかしい時に、保存データを消さずにアプリ側だけ確認・復旧するための画面。</p><div class="hd-dx-grid">${hdDXMetric('アプリ版',`v${typeof HD_APP_VERSION!=='undefined'?HD_APP_VERSION:'?'}`,`build ${typeof HD_APP_BUILD!=='undefined'?HD_APP_BUILD:'?'}`,'ok')}${hdDXMetric('通信',d.online?'オンライン':'オフライン',d.standalone?'ホーム画面PWA':'ブラウザ表示',d.online?'ok':'warn')}${hdDXMetric('追加モジュール',`${d.modules.ok}/${d.modules.total} OK`,modSub,d.modules.errors.length||d.modules.loading.length?'warn':'ok')}${hdDXMetric('端末データ',`${d.local.keys}項目`,`${hdDXBytes(d.local.bytes)} / JSON異常 ${d.local.invalid}`,d.local.invalid?'warn':'ok')}${hdDXMetric('Service Worker',d.swControlled?'制御中':d.swRegistered?'登録済み':'未登録',d.swActive?'active':'inactive',d.swControlled?'ok':'warn')}${hdDXMetric('PWAキャッシュ',d.currentCache?'現行版あり':'現行版なし',cacheSub,d.currentCache&&d.criticalCached===HD_DX_CRITICAL.length?'ok':'warn')}${hdDXMetric('ブラウザ保存領域',storagePct==null?'取得不可':`${storagePct}% 使用`,d.quota?`${hdDXBytes(d.usage)} / ${hdDXBytes(d.quota)}`:'Safari側で取得不可',storagePct!=null&&storagePct>=80?'warn':'ok')}${hdDXMetric('端末内スナップショット',`${d.snapshots}世代`,d.persisted===true?'永続保存許可あり':d.persisted===false?'永続保存保証なし':'永続状態不明',d.snapshots?'ok':'warn')}${hdDXMetric('復元安全層',d.restoreSafety.busy?'復元処理中':d.restoreSafety.ready?'利用可能':'利用不可',d.restoreSafety.ready?'書込・読込・削除プローブ OK':d.restoreSafety.error||(!d.restoreSafety.indexedDB?'IndexedDB非対応':'安全API未準備'),d.restoreSafety.ready&&!d.restoreSafety.busy?'ok':'warn')}${hdDXMetric('外部JSONバックアップ',d.backupDays==null?'未記録':d.backupDays===0?'今日':`${d.backupDays}日前`,'端末故障対策',d.backupDays!=null&&d.backupDays<14?'ok':'warn')}${hdDXMetric('艦娘マスター',d.master?`${d.master.profiles}/${d.master.ships} 詳細・全${d.master.masterForms||0}形態`:'未読込',d.master?`${d.master.snapshotLoaded?'自動同期':'内蔵'} / 装備 ${d.master.equipmentMasterCount||0} / 増設 ${d.master.exslotRules||0} / 位置制限 ${d.master.slotRules||0}`:'ship-database未初期化',d.master&&d.master.profiles===d.master.ships&&!d.master.badSlots?.length?'ok':'warn')}${hdDXMetric('艦ID整合性',d.identity?.issues?`要確認 ${d.identity.issues}件`:`${d.identity?.total||0}件 正常`,d.identity?.issues?`不一致 ${d.identity.mismatch||0} / ID未設定 ${d.identity['missing-id']||0} / 無効ID ${d.identity['invalid-id']||0} / 未解決 ${d.identity.unresolved||0}`:'台帳・保存編成のMASTER ID一致',d.identity?.issues?'warn':'ok')}${hdDXMetric('艦娘画像整合性',d.imageIntegrity?d.imageIntegrity.issues?`要確認 ${d.imageIntegrity.issues}件`:`${d.imageIntegrity.total}件 正常`:'未確認',d.imageIntegrity?d.imageIntegrity.verifyEntries?`一致 ${d.imageIntegrity.verified?.length||0} / 不一致 ${d.imageIntegrity.mismatch?.length||0} / 未検証 ${d.imageIntegrity.unverified?.length||0} / 同一候補 ${d.imageIntegrity.duplicates?.length||0}組`:`検証表なし / 指紋未確認 ${d.imageIntegrity.unhashed?.length||0} / ${hdDXBytes(d.imageIntegrity.bytes||0)}`:'画像ライブラリ未読込',d.imageIntegrity?.issues?'warn':d.imageIntegrity?'ok':'')}${hdDXMetric('艦これマスター版',d.masterSource?.commit?(d.masterSource.commit||'').slice(0,7):'不明',d.masterSource?`${d.masterSource.repo||''} / upstream ${d.masterDate}`:'スナップショット未読込',d.masterSource?.commit?'ok':'warn')}${hdDXMetric('装備picker同期',d.master?.pickerRulesLoaded?'同期済み':'内蔵ルール',d.master?.pickerSource?`${d.master.pickerSource.repo||''} @ ${(d.master.pickerSource.commit||'').slice(0,7)}`:'スナップショットにpicker情報なし',d.master?.pickerRulesLoaded?'ok':'warn')}${freshnessMetric}${diffMetric}</div>${issueHtml}${masterChangeHtml}<div class="hd-dx-actions"><button type="button" class="ghost" data-dx-recheck>もう一度診断</button>${d.identity?.issues?'<button type="button" class="ghost" data-dx-ship-identity>艦ID/公式名を修復</button>':''}${d.imageIntegrity?'<button type="button" class="ghost" data-dx-ship-image-audit>艦娘画像を詳細監査</button>':''}<button type="button" class="ghost" data-dx-reinit>画面だけ再初期化</button><button type="button" class="primary" data-dx-cache>アプリキャッシュを再構築</button><button type="button" class="ghost" data-dx-update>更新確認</button><button type="button" class="ghost" data-dx-copy>診断結果をコピー</button></div><div class="hd-dx-note">「画面だけ再初期化」と「アプリキャッシュを再構築」は、HarborDeskの艦娘・装備・任務・資源・ログなどの端末保存データを削除しないよ。</div>`;
}
function hdDXEnsure(){
  if(document.getElementById('diagnosticsCenter')){hdDXRender();return}
  const anchor=document.getElementById('personalHomeCenter')||document.getElementById('dashboard')||document.querySelector('main section');if(!anchor)return;
  const sec=document.createElement('section');sec.id='diagnosticsCenter';sec.className='advanced-section';sec.innerHTML='<div id="hdDiagnosticsCenter"></div>';anchor.insertAdjacentElement('afterend',sec);hdDXRender();
}
function hdDXReport(d=window.__hdDXLast){
  if(!d)return 'HarborDesk diagnostics: not collected';
  return [`HarborDesk Diagnostics`,`time=${new Date(d.at).toISOString()}`,`version=${typeof HD_APP_VERSION!=='undefined'?HD_APP_VERSION:'?'} build=${typeof HD_APP_BUILD!=='undefined'?HD_APP_BUILD:'?'}`,`online=${d.online} standalone=${d.standalone}`,`modules=${d.modules.ok}/${d.modules.total} errors=${d.modules.errors.join(',')||'none'} loading=${d.modules.loading.join(',')||'none'}`,`localStorageKeys=${d.local.keys} bytes=${d.local.bytes} invalidJson=${d.local.invalid}`,`serviceWorker=supported:${d.swSupported} registered:${d.swRegistered} active:${d.swActive} controlled:${d.swControlled}`,`cacheExpected=${d.expected} current=${d.currentCache} critical=${d.criticalCached}/${HD_DX_CRITICAL.length} caches=${d.cacheNames.join(',')||'none'}`,`storage=${d.usage}/${d.quota} persisted=${d.persisted}`,`snapshots=${d.snapshots} restoreSafety=ready:${!!d.restoreSafety?.ready} indexedDB:${!!d.restoreSafety?.indexedDB} api:${!!d.restoreSafety?.snapshotApi} store:${!!d.restoreSafety?.storeReady} probe:${!!d.restoreSafety?.probeOk} busy:${!!d.restoreSafety?.busy} error:${d.restoreSafety?.error||'none'} externalBackupDays=${d.backupDays==null?'none':d.backupDays}`,`shipMaster=${d.master?`${d.master.profiles}/${d.master.ships} equipment=${d.master.equipmentMasterCount||0} exslot=${d.master.exslotRules||0} starRules=${d.master.starRules||0} source=${d.masterSource?.commit||'none'} sourceDate=${d.masterDate||'unknown'} upstream=${d.upstream?.source?.latest||'unknown'} pickerUpstream=${d.upstream?.picker?.latest||'unknown'} stale=${!!d.upstream?.stale} diff=${d.masterChanges?JSON.stringify(d.masterChanges):'none'}`:'unavailable'}`,`shipImages=${d.imageIntegrity?`total=${d.imageIntegrity.total} bytes=${d.imageIntegrity.bytes} invalidId=${d.imageIntegrity.invalidId.length} empty=${d.imageIntegrity.empty.length} badType=${d.imageIntegrity.badType.length} duplicateGroups=${d.imageIntegrity.duplicates.length} unhashed=${d.imageIntegrity.unhashed.length} verifyEntries=${d.imageIntegrity.verifyEntries||0} verified=${d.imageIntegrity.verified?.length||0} mismatch=${d.imageIntegrity.mismatch?.length||0} unverified=${d.imageIntegrity.unverified?.length||0}`:'unavailable'}`,`issues=${d.issues.join(' | ')||'none'}`].join('\n');
}
async function hdDXCopy(){const text=hdDXReport();try{await navigator.clipboard.writeText(text);alert('診断結果をコピーしたよ')}catch{prompt('この診断結果をコピーしてね',text)}}
async function hdDXReinit(){try{if(typeof hdInitLoadedModules==='function')hdInitLoadedModules();window.dispatchEvent(new CustomEvent('hd:modules-ready',{detail:{manual:true}}));setTimeout(hdDXRender,250)}catch{setTimeout(hdDXRender,250)}}
async function hdDXCacheRepair(){if(!navigator.onLine){alert('オフライン中はキャッシュ再構築を実行しないよ。通信できる状態で試してね。');return}if(!confirm('アプリキャッシュだけ再構築する？\n艦娘・装備・任務・資源などの保存データは消さないよ。'))return;if(typeof hdForceUpdate==='function'){hdForceUpdate();return}try{const ks=await caches.keys();await Promise.all(ks.filter(k=>k.startsWith('harbordesk-pwa-')).map(k=>caches.delete(k)));location.reload()}catch{location.reload()}}

document.addEventListener('click',e=>{if(e.target.closest?.('[data-dx-recheck]')){hdDXRender(true);return}if(e.target.closest?.('[data-dx-ship-identity]')){hdDXRepairShipIdentity();hdDXRender();return}if(e.target.closest?.('[data-dx-ship-image-audit]')){if(typeof hdShipImageIntegrityAudit==='function')hdShipImageIntegrityAudit(true).then(()=>hdDXRender());return}if(e.target.closest?.('[data-dx-reinit]')){hdDXReinit();return}if(e.target.closest?.('[data-dx-cache]')){hdDXCacheRepair();return}if(e.target.closest?.('[data-dx-update]')){if(typeof hdCheckForUpdate==='function')hdCheckForUpdate(true);return}if(e.target.closest?.('[data-dx-copy]')){hdDXCopy();return}});
window.addEventListener('online',()=>hdDXRender());window.addEventListener('offline',()=>hdDXRender());
window.addEventListener('hd:modules-ready',()=>setTimeout(hdDXEnsure,150));
window.addEventListener('load',()=>setTimeout(hdDXEnsure,1700));
