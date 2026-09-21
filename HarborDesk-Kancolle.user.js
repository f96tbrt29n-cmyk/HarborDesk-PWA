// ==UserScript==
// @name         HarborDesk 艦これ連携
// @namespace    https://f96tbrt29n-cmyk.github.io/HarborDesk-PWA/
// @version      1.0.14
// @description  艦これの対応APIレスポンスを端末内で抽出し、HarborDeskへ送る。
// @match        http://*.dmm.com/*
// @match        https://*.dmm.com/*
// @match        http://*.dmm.co.jp/*
// @match        https://*.dmm.co.jp/*
// @match        http://*.kancolle-server.com/*
// @match        https://*.kancolle-server.com/*
// @include      /^https?:\/\/(?:203\.104|125\.6)\.\d{1,3}\.\d{1,3}\//
// @run-at       document-start
// @inject-into  page
// @weight       999
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/f96tbrt29n-cmyk/HarborDesk-PWA/main/HarborDesk-Kancolle.user.js
// @updateURL    https://raw.githubusercontent.com/f96tbrt29n-cmyk/HarborDesk-PWA/main/HarborDesk-Kancolle.meta.js
// ==/UserScript==

(function(){
'use strict';

const HD_VERSION='1.0.14';
const HARBOR_URL='https://f96tbrt29n-cmyk.github.io/HarborDesk-PWA/';
const HARBOR_ORIGIN=new URL(HARBOR_URL).origin;
const BRIDGE_IMPORT_MESSAGE='harbordesk-kancolle-import';
const BRIDGE_READY_MESSAGE='harbordesk-kancolle-import-ready-v1';
const BRIDGE_ACK_MESSAGE='harbordesk-kancolle-import-ack-v1';
const RECORD_MESSAGE='harbordesk-kancolle-frame-record-v1';
const STATUS_MESSAGE='harbordesk-kancolle-frame-status-v1';
const MAX_RECORDS=120;
const HD_PANEL_MIN_KEY='harbordesk-kc-panel-minimized-v1';
const HD_CAPTURE_STORE_KEY='harbordesk-kc-capture-v1';
const HD_CAPTURE_MAX_AGE=6*60*60*1000;

function wanted(url){
  return /\/kcsapi\/(?:api_port\/port|api_get_member\/(?:ship2|slot_item|slotitem|require_info|material|ndock|questlist)|api_req_map\/(?:start|next)|api_req_(?:sortie|combined_battle)\/battleresult)(?:$|[?#])/.test(String(url||''));
}
function pathOf(url){
  try{return new URL(String(url||''),location.href).pathname}catch{return String(url||'').split(/[?#]/)[0]}
}
function parse(text){
  let t=String(text??'').trim();
  if(t.startsWith('svdata='))t=t.slice(7);
  try{return JSON.parse(t)}catch{return null}
}
function minimize(path,obj){
  if(!obj||typeof obj!=='object')return null;
  const data=obj.api_data;
  const base={api_result:Number(obj.api_result)||1,api_result_msg:String(obj.api_result_msg||'成功')};
  const ship=x=>x&&typeof x==='object'?{
    api_id:Number(x.api_id)||0,api_ship_id:Number(x.api_ship_id)||0,api_lv:Number(x.api_lv)||0,
    api_nowhp:Number(x.api_nowhp)||0,api_maxhp:Number(x.api_maxhp)||0,api_cond:Number(x.api_cond)||0,
    api_locked:Number(x.api_locked)||0,api_sally_area:Number(x.api_sally_area)||0,
    api_sakuteki:Array.isArray(x.api_sakuteki)?x.api_sakuteki.slice(0,2).map(Number):(Number.isFinite(Number(x.api_sakuteki))?Number(x.api_sakuteki):null),
    api_onslot:Array.isArray(x.api_onslot)?x.api_onslot.map(Number):[],
    api_fuel:Number(x.api_fuel)||0,api_bull:Number(x.api_bull)||0,
    api_slot:Array.isArray(x.api_slot)?x.api_slot.map(Number):[],api_slot_ex:Number(x.api_slot_ex)||0
  }:null;
  const deck=x=>x&&typeof x==='object'?{
    api_id:Number(x.api_id)||0,api_name:String(x.api_name||''),
    api_mission:Array.isArray(x.api_mission)?x.api_mission.slice(0,4).map(Number):[],
    api_ship:Array.isArray(x.api_ship)?x.api_ship.map(Number):[]
  }:null;
  const ndock=x=>x&&typeof x==='object'?{
    api_id:Number(x.api_id)||0,api_state:Number(x.api_state)||0,api_ship_id:Number(x.api_ship_id)||0,
    api_complete_time:Number(x.api_complete_time)||0
  }:null;
  const material=x=>x&&typeof x==='object'?{api_id:Number(x.api_id)||0,api_value:Number(x.api_value)||0}:null;
  const slot=x=>x&&typeof x==='object'?{
    api_id:Number(x.api_id)||0,api_slotitem_id:Number(x.api_slotitem_id)||0,
    api_level:Number(x.api_level)||0,api_alv:Number(x.api_alv)||0
  }:null;
  if(/\/api_port\/port$/.test(path)){
    base.api_data={
      api_basic:data?.api_basic&&typeof data.api_basic==='object'?{api_level:Number(data.api_basic.api_level)||0}:null,
      api_ship:(Array.isArray(data?.api_ship)?data.api_ship:[]).map(ship).filter(Boolean),
      api_deck_port:(Array.isArray(data?.api_deck_port)?data.api_deck_port:[]).map(deck).filter(Boolean),
      api_ndock:(Array.isArray(data?.api_ndock)?data.api_ndock:[]).map(ndock).filter(Boolean),
      api_material:(Array.isArray(data?.api_material)?data.api_material:[]).map(material).filter(Boolean)
    };return base;
  }
  if(/\/api_get_member\/ship2$/.test(path)){
    base.api_data={
      api_ship_data:(Array.isArray(data?.api_ship_data)?data.api_ship_data:(Array.isArray(data)?data:[])).map(ship).filter(Boolean),
      api_deck_data:(Array.isArray(data?.api_deck_data)?data.api_deck_data:[]).map(deck).filter(Boolean)
    };return base;
  }
  if(/\/api_get_member\/(?:slot_item|slotitem)$/.test(path)){base.api_data=(Array.isArray(data)?data:[]).map(slot).filter(Boolean);return base}
  if(/\/api_get_member\/require_info$/.test(path)){base.api_data={api_slot_item:(Array.isArray(data?.api_slot_item)?data.api_slot_item:[]).map(slot).filter(Boolean)};return base}
  if(/\/api_get_member\/material$/.test(path)){base.api_data=(Array.isArray(data)?data:[]).map(material).filter(Boolean);return base}
  if(/\/api_get_member\/ndock$/.test(path)){base.api_data=(Array.isArray(data)?data:[]).map(ndock).filter(Boolean);return base}
  if(/\/api_get_member\/questlist$/.test(path)){
    const rows=(Array.isArray(data?.api_list)?data.api_list:[])
      .filter(q=>q&&typeof q==='object'&&Number(q.api_no)>0)
      .map(q=>({
        api_no:Number(q.api_no)||0,
        api_category:Number(q.api_category)||0,
        api_type:Number(q.api_type)||0,
        api_label_type:Number(q.api_label_type)||0,
        api_state:Number(q.api_state)||0,
        api_title:String(q.api_title||''),
        api_detail:String(q.api_detail||''),
        api_progress_flag:Number(q.api_progress_flag)||0,
        api_invalid_flag:Number(q.api_invalid_flag)||0
      }));
    base.api_data={
      api_count:Number(data?.api_count)||0,
      api_page_count:Number(data?.api_page_count)||0,
      api_disp_page:Number(data?.api_disp_page)||0,
      api_list:rows
    };return base;
  }
  if(/\/api_req_map\/(?:start|next)$/.test(path)){
    base.api_data={
      api_maparea_id:Number(data?.api_maparea_id)||0,
      api_mapinfo_no:Number(data?.api_mapinfo_no)||0,
      api_no:Number(data?.api_no)||0,
      api_color_no:Number(data?.api_color_no)||0,
      api_event_id:Number(data?.api_event_id)||0,
      api_event_kind:Number(data?.api_event_kind)||0,
      api_bosscell_no:Number(data?.api_bosscell_no)||0
    };return base;
  }
  if(/\/api_req_(?:sortie|combined_battle)\/battleresult$/.test(path)){
    base.api_data={
      api_win_rank:String(data?.api_win_rank||''),
      api_quest_name:String(data?.api_quest_name||''),
      api_get_ship:data?.api_get_ship?{
        api_ship_id:Number(data.api_get_ship.api_ship_id)||0,
        api_ship_name:String(data.api_get_ship.api_ship_name||'')
      }:null
    };return base;
  }
  return null;
}

function emitRecord(url,text){
  if(!wanted(url))return;
  const endpoint=pathOf(url),obj=parse(text),payload=minimize(endpoint,obj);
  if(!payload)return;
  const msg={type:RECORD_MESSAGE,endpoint,payload,at:Date.now(),frame:location.href};
  try{
    if(window===window.top)receiveRecord(msg);
    else window.top.postMessage(msg,'*');
  }catch{}
}

const originalFetch=window.fetch;
if(typeof originalFetch==='function'&&!window.__HD_US_FETCH_PATCHED){
  window.__HD_US_FETCH_PATCHED=true;
  window.fetch=async function(...args){
    const res=await originalFetch.apply(this,args);
    try{
      const url=typeof args[0]==='string'?args[0]:args[0]?.url;
      if(wanted(url))res.clone().text().then(t=>emitRecord(url,t)).catch(()=>{});
    }catch{}
    return res;
  };
}

const xp=window.XMLHttpRequest?.prototype;
if(xp&&!window.__HD_US_XHR_PATCHED){
  window.__HD_US_XHR_PATCHED=true;
  const open=xp.open,send=xp.send;
  xp.open=function(method,url,...rest){this.__hdUserscriptUrl=url;return open.call(this,method,url,...rest)};
  xp.send=function(...args){
    if(wanted(this.__hdUserscriptUrl)){
      this.addEventListener('load',()=>{
        try{
          const text=this.responseType==='json'?JSON.stringify(this.response):this.responseText;
          emitRecord(this.__hdUserscriptUrl,text);
        }catch{}
      },{once:true});
    }
    return send.apply(this,args);
  };
}

try{
  if(window!==window.top){
    window.top.postMessage({type:STATUS_MESSAGE,frame:location.href,at:Date.now()},'*');
    return;
  }
}catch{}

const records=[];
const signatures=new Set();
const captureId='kc-userscript-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
let panel,countEl,statusEl,frameEl,coverageEl,hintEl,sendEl,miniCountEl,minimizeEl,panelBodyEl;
let frameHits=0,minimized=false;

function rebuildSignatures(){
  signatures.clear();
  for(const row of records)signatures.add(signature(row));
}
function latestSnapshotEndpoint(endpoint){
  return /\/api_port\/port$|\/api_get_member\/(?:ship2|slot_item|slotitem|require_info|material|ndock)$/.test(String(endpoint||''));
}
function persistCapture(){
  try{localStorage.setItem(HD_CAPTURE_STORE_KEY,JSON.stringify({savedAt:Date.now(),records:records.slice(-MAX_RECORDS)}))}catch{}
}
function restoreCapture(){
  try{
    const saved=JSON.parse(localStorage.getItem(HD_CAPTURE_STORE_KEY)||'null');
    if(!saved||!Array.isArray(saved.records)||Date.now()-Number(saved.savedAt||0)>HD_CAPTURE_MAX_AGE){
      localStorage.removeItem(HD_CAPTURE_STORE_KEY);return 0;
    }
    for(const row of saved.records){
      if(!row||!wanted(row.endpoint))continue;
      records.push({endpoint:String(row.endpoint||''),payload:row.payload,at:Number(row.at)||Date.now()});
    }
    while(records.length>MAX_RECORDS)records.shift();
    rebuildSignatures();return records.length;
  }catch{return 0}
}
function clearCapture(){
  records.length=0;signatures.clear();try{localStorage.removeItem(HD_CAPTURE_STORE_KEY)}catch{}
}

function captureCoverage(){
  const endpoints=records.map(x=>String(x.endpoint||''));
  const has=re=>endpoints.some(x=>re.test(x));
  return {
    port:has(/api_port\/port|api_get_member\/ship2/),
    equipment:has(/api_get_member\/(?:slot_item|slotitem|require_info)/),
    resources:has(/api_port\/port|api_get_member\/material/),
    quests:has(/api_get_member\/questlist/),
    docks:has(/api_port\/port|api_get_member\/ndock/),
    sorties:has(/api_req_map\/(?:start|next)|api_req_(?:sortie|combined_battle)\/battleresult/)
  };
}
function ledgerReady(c=captureCoverage()){
  return !!(c.port&&c.equipment);
}
function coverageHtml(){
  const c=captureCoverage(),rows=[['母港',c.port],['装備',c.equipment],['任務',c.quests],['入渠',c.docks],['出撃',c.sorties]];
  return rows.map(([name,ok])=>'<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 6px;border-radius:999px;border:1px solid '+(ok?'rgba(110,224,159,.45)':'rgba(255,255,255,.12)')+';background:'+(ok?'rgba(29,92,60,.3)':'rgba(255,255,255,.04)')+';color:'+(ok?'#bcefd0':'#8298aa')+'"><b>'+name+'</b> '+(ok?'✓':'—')+'</span>').join('');
}

function nextCaptureHint(c=captureCoverage()){
  if(!c.port)return '台帳同期に必要: 母港を一度表示して艦娘・艦隊データを取得してね';
  if(!c.equipment)return '台帳同期に必要: 装備画面を一度開いて装備個体・改修★を取得してね';
  if(!c.quests)return '艦隊台帳・装備台帳は同期OK。任務も入れるなら任務画面を開いてね';
  if(!c.docks)return '台帳同期OK。入渠タイマーも入れるなら入渠画面を開いてね';
  if(!c.sorties)return '台帳同期OK。出撃後にもう一度送ると出撃記録も追加できるよ';
  return '台帳を含む主要データ取得済み。このままHarborDeskへ送ってOK';
}

function signature(r){
  try{return r.endpoint+'|'+JSON.stringify(r.payload)}catch{return r.endpoint+'|'+r.at}
}
function receiveRecord(r){
  if(!r||r.type!==RECORD_MESSAGE||!wanted(r.endpoint))return;
  const endpoint=String(r.endpoint||''),row={endpoint,payload:r.payload,at:Number(r.at)||Date.now()},sig=signature(row);
  if(signatures.has(sig))return;
  if(latestSnapshotEndpoint(endpoint)){
    for(let i=records.length-1;i>=0;i--)if(String(records[i]?.endpoint||'')===endpoint)records.splice(i,1);
    rebuildSignatures();
  }
  signatures.add(sig);records.push(row);
  while(records.length>MAX_RECORDS)records.shift();
  rebuildSignatures();persistCapture();
  render();
  show();
}
function exportObject(){
  return {
    format:'harbordesk-kancolle-import',
    version:2,
    source:'userscripts',
    userscriptVersion:HD_VERSION,
    captureId,
    createdAt:new Date().toISOString(),
    records:records.map(x=>({endpoint:x.endpoint,payload:x.payload,at:x.at}))
  };
}
function isGameShell(){
  return /(?:kancolle|app_id(?:=|%3D)854854|\/netgame\/social)/i.test(location.href);
}
function ensurePanel(){
  if(panel||!document.documentElement)return;
  panel=document.createElement('div');
  panel.id='hd-kc-userscript-panel';
  panel.style.cssText='position:fixed;z-index:2147483647;right:8px;bottom:8px;width:min(350px,calc(100vw - 16px));padding:10px;border:1px solid #5f7892;border-radius:12px;background:#071521;color:#eef6ff;font:12px/1.45 -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.45)';
  panel.innerHTML='<div data-hd-panel-head style="display:flex;justify-content:space-between;gap:8px;align-items:center;cursor:pointer"><b><span data-hd-panel-name>HarborDesk 艦これ連携</span> <small style="color:#7f9aae">v'+HD_VERSION+'</small> <em data-hd-mini-count style="font-style:normal;font-size:10px;color:#9fe0b7">0件</em></b><button data-hd-minimize aria-label="パネルを最小化" style="background:none;border:0;color:#9eb7cb;font-size:18px;min-width:30px;min-height:30px">−</button></div>'+
    '<div data-hd-panel-body>'+
      '<div style="margin:6px 0;color:#aac0d1"><b data-hd-status style="color:#9fe0b7">通信待機中</b><br>取得 <b data-hd-count>0</b>件 / 検出フレーム <b data-hd-frames>0</b><br><small>母港・装備・任務などを開くと自動で取得するよ。</small></div>'+
      '<div data-hd-coverage style="display:flex;gap:4px;flex-wrap:wrap;margin:7px 0 7px"></div>'+
      '<div data-hd-next-hint style="margin:0 0 9px;padding:7px 8px;border-radius:9px;background:rgba(255,255,255,.05);color:#d8e8f5;font-size:11px"></div>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap"><button data-hd-send style="font-weight:700">HarborDeskへ送る</button><button data-hd-copy>JSONをコピー</button><button data-hd-clear>クリア</button></div>'+
      '<div style="margin-top:7px;color:#7f9aae"><small>api_token・Cookie・DMMログイン情報・リクエスト本文は保存しません。</small></div>'+
    '</div>';
  document.documentElement.appendChild(panel);
  countEl=panel.querySelector('[data-hd-count]');
  statusEl=panel.querySelector('[data-hd-status]');
  frameEl=panel.querySelector('[data-hd-frames]');
  coverageEl=panel.querySelector('[data-hd-coverage]');
  hintEl=panel.querySelector('[data-hd-next-hint]');
  sendEl=panel.querySelector('[data-hd-send]');
  miniCountEl=panel.querySelector('[data-hd-mini-count]');
  minimizeEl=panel.querySelector('[data-hd-minimize]');
  panelBodyEl=panel.querySelector('[data-hd-panel-body]');
  minimizeEl.onclick=e=>{e.stopPropagation();setMinimized(!minimized)};
  panel.querySelector('[data-hd-panel-head]').onclick=e=>{if(minimized&&!e.target.closest('button'))setMinimized(false)};
  panel.querySelector('[data-hd-clear]').onclick=()=>{clearCapture();render()};
  panel.querySelector('[data-hd-copy]').onclick=copy;
  panel.querySelector('[data-hd-send]').onclick=send;
  let savedMinimized=false;try{savedMinimized=localStorage.getItem(HD_PANEL_MIN_KEY)==='1'}catch{}
  setMinimized(savedMinimized,false);
  render();
}
function setMinimized(next,persist=true){
  minimized=!!next;
  if(persist){try{localStorage.setItem(HD_PANEL_MIN_KEY,minimized?'1':'0')}catch{}}
  if(!panel)return minimized;
  if(panelBodyEl)panelBodyEl.hidden=minimized;
  panel.style.width=minimized?'auto':'min(350px,calc(100vw - 16px))';
  panel.style.padding=minimized?'7px 8px':'10px';
  panel.style.borderRadius=minimized?'999px':'12px';
  const name=panel.querySelector('[data-hd-panel-name]');if(name)name.textContent=minimized?'HD 艦これ':'HarborDesk 艦これ連携';
  if(minimizeEl){minimizeEl.textContent=minimized?'＋':'−';minimizeEl.setAttribute('aria-label',minimized?'パネルを展開':'パネルを最小化')}
  render();return minimized;
}
function render(){
  const c=captureCoverage(),ledger=ledgerReady(c),core=ledger&&c.quests;
  if(countEl)countEl.textContent=String(records.length);
  if(miniCountEl){miniCountEl.textContent=records.length+(ledger?'件 ✓':'件');miniCountEl.style.color=ledger?'#9fe0b7':'#f0d590'}
  if(frameEl)frameEl.textContent=String(frameHits);
  if(coverageEl)coverageEl.innerHTML=coverageHtml();
  if(hintEl){hintEl.textContent=records.length?nextCaptureHint(c):'まず母港と装備画面を開いて、艦隊台帳・装備台帳の同期材料を揃えてね';hintEl.style.color=ledger?'#bcefd0':'#f0d590'}
  if(sendEl){sendEl.disabled=!ledger;sendEl.textContent=ledger?'台帳をHarborDeskへ同期（'+records.length+'件）':'台帳データ待ち';sendEl.style.opacity=ledger?'1':'.55'}
  if(statusEl){
    statusEl.textContent=records.length?(ledger?(core?'台帳＋基本データ取得済み':'台帳同期準備OK'):'台帳データ取得中'):'通信待機中';
    statusEl.style.color=ledger?'#9fe0b7':'#f0d590';
  }
}
function show(){
  ensurePanel();
  if(panel)panel.hidden=false;
}
async function copy(){
  const text=JSON.stringify(exportObject());
  try{
    await navigator.clipboard.writeText(text);
    alert('HarborDesk用JSONをコピーしたよ');
  }catch{
    prompt('このJSONをコピーしてHarborDeskへ貼り付けてね',text);
  }
}
function bytesToBase64Url(bytes){
  let binary='';
  for(let i=0;i<bytes.length;i+=0x8000){
    binary+=String.fromCharCode(...bytes.subarray(i,Math.min(bytes.length,i+0x8000)));
  }
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function encodeHandoff(value){
  const raw=new TextEncoder().encode(JSON.stringify(value));
  if(typeof CompressionStream==='function'){
    const compressedStream=new Blob([raw]).stream().pipeThrough(new CompressionStream('gzip'));
    const compressed=new Uint8Array(await new Response(compressedStream).arrayBuffer());
    return 'g.'+bytesToBase64Url(compressed);
  }
  return 'j.'+bytesToBase64Url(raw);
}
async function send(){
  const c=captureCoverage();
  if(!records.length){
    alert('まだ取得データがないよ。まず母港と装備画面を開いてね。');
    return;
  }
  if(!ledgerReady(c)){
    const missing=[!c.port?'母港（艦娘・艦隊）':'',!c.equipment?'装備':''].filter(Boolean).join(' と ');
    if(statusEl)statusEl.textContent='台帳同期データ不足';
    alert('艦隊台帳・装備台帳を埋めるため、'+missing+'のデータが必要だよ。ゲーム内で該当画面を一度開いてから再度同期してね。');
    return;
  }
  const value=exportObject(),payload=JSON.stringify(value);
  let target=null;
  try{target=window.open(HARBOR_URL+'#kancolleImport','HarborDeskSync')}catch{}
  if(target){
    if(statusEl)statusEl.textContent='HarborDeskへ送信中';
    let done=false;
    const timers=[];
    const cleanup=()=>{while(timers.length)clearTimeout(timers.pop());window.removeEventListener('message',onBridgeMessage)};
    const post=()=>{if(done)return;try{target.postMessage({type:BRIDGE_IMPORT_MESSAGE,payload,captureId,userscriptVersion:HD_VERSION},HARBOR_ORIGIN)}catch{}};
    const onBridgeMessage=e=>{
      if(e.origin!==HARBOR_ORIGIN)return;
      const d=e?.data||{};
      if(d.type===BRIDGE_READY_MESSAGE){post();return}
      if(d.type!==BRIDGE_ACK_MESSAGE||String(d.captureId||'')!==captureId)return;
      done=true;cleanup();
      if(statusEl)statusEl.textContent=d.ok?'HarborDesk同期完了':'HarborDesk受信失敗';
      if(!d.ok)alert('HarborDesk側で同期できなかったよ: '+String(d.error||'受信エラー'));
    };
    window.addEventListener('message',onBridgeMessage);
    [0,300,800,1600,2800,4500].forEach(ms=>timers.push(setTimeout(post,ms)));
    timers.push(setTimeout(()=>{if(!done&&statusEl)statusEl.textContent='HarborDeskで同期結果を確認してね';cleanup()},15000));
    return;
  }
  try{
    if(statusEl)statusEl.textContent='データ圧縮中';
    const token=await encodeHandoff(value);
    if(statusEl)statusEl.textContent='送信OK → HarborDeskへ移動';
    const a=document.createElement('a');
    a.href=HARBOR_URL+'#kcimport='+token;
    a.target='_self';
    a.style.display='none';
    document.documentElement.appendChild(a);
    a.click();
  }catch(err){
    if(statusEl)statusEl.textContent='送信失敗';
    alert('HarborDeskへの受け渡しに失敗したよ: '+String(err&&err.message||err));
  }
}
window.addEventListener('message',e=>{
  const d=e?.data;
  if(d?.type===RECORD_MESSAGE)receiveRecord(d);
  else if(d?.type===STATUS_MESSAGE){frameHits++;render();if(isGameShell())show()}
});
window.__HARBORDESK_KANCOLLE_USERSCRIPT__={
  version:HD_VERSION,
  records,
  exportObject,
  captureCoverage,
  ledgerReady,
  nextCaptureHint,
  setMinimized,
  isMinimized:()=>minimized,
  show,
  send
};

restoreCapture();
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{if(isGameShell())show()},{once:true});
}else if(isGameShell())show();

setTimeout(()=>{if(isGameShell())show()},1200);
})();
