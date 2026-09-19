// ==UserScript==
// @name         HarborDesk 艦これ連携
// @namespace    https://f96tbrt29n-cmyk.github.io/HarborDesk-PWA/
// @version      1.0.1
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
// @downloadURL  https://f96tbrt29n-cmyk.github.io/HarborDesk-PWA/HarborDesk-Kancolle.user.js
// @updateURL    https://f96tbrt29n-cmyk.github.io/HarborDesk-PWA/HarborDesk-Kancolle.meta.js
// ==/UserScript==

(function(){
'use strict';

const HD_VERSION='1.0.1';
const HARBOR_URL='https://f96tbrt29n-cmyk.github.io/HarborDesk-PWA/#kancolleImport';
const HARBOR_ORIGIN='https://f96tbrt29n-cmyk.github.io';
const RECORD_MESSAGE='harbordesk-kancolle-frame-record-v1';
const STATUS_MESSAGE='harbordesk-kancolle-frame-status-v1';
const MAX_RECORDS=120;

function wanted(url){
  return /\/kcsapi\/(?:api_port\/port|api_get_member\/(?:ship2|slot_item|require_info|material|ndock|questlist)|api_req_map\/(?:start|next)|api_req_(?:sortie|combined_battle)\/battleresult)(?:$|[?#])/.test(String(url||''));
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
  if(/\/api_port\/port$/.test(path)){
    base.api_data={
      api_ship:Array.isArray(data?.api_ship)?data.api_ship:[],
      api_deck_port:Array.isArray(data?.api_deck_port)?data.api_deck_port:[],
      api_ndock:Array.isArray(data?.api_ndock)?data.api_ndock:[],
      api_material:Array.isArray(data?.api_material)?data.api_material:[]
    };return base;
  }
  if(/\/api_get_member\/ship2$/.test(path)){
    base.api_data={
      api_ship_data:Array.isArray(data?.api_ship_data)?data.api_ship_data:(Array.isArray(data)?data:[]),
      api_deck_data:Array.isArray(data?.api_deck_data)?data.api_deck_data:[]
    };return base;
  }
  if(/\/api_get_member\/slot_item$/.test(path)){base.api_data=Array.isArray(data)?data:[];return base}
  if(/\/api_get_member\/require_info$/.test(path)){base.api_data={api_slot_item:Array.isArray(data?.api_slot_item)?data.api_slot_item:[]};return base}
  if(/\/api_get_member\/material$/.test(path)){base.api_data=Array.isArray(data)?data:[];return base}
  if(/\/api_get_member\/ndock$/.test(path)){base.api_data=Array.isArray(data)?data:[];return base}
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
let panel,countEl,statusEl,frameEl;
let frameHits=0;

function signature(r){
  try{return r.endpoint+'|'+JSON.stringify(r.payload)}catch{return r.endpoint+'|'+r.at}
}
function receiveRecord(r){
  if(!r||r.type!==RECORD_MESSAGE||!wanted(r.endpoint))return;
  const sig=signature(r);
  if(signatures.has(sig))return;
  signatures.add(sig);
  records.push({endpoint:r.endpoint,payload:r.payload,at:Number(r.at)||Date.now()});
  while(records.length>MAX_RECORDS){
    const removed=records.shift();
    try{signatures.delete(signature(removed))}catch{}
  }
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
  panel.innerHTML='<div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>HarborDesk 艦これ連携</b><button data-hd-hide style="background:none;border:0;color:#9eb7cb;font-size:18px">×</button></div>'+
    '<div style="margin:6px 0;color:#aac0d1"><b data-hd-status style="color:#9fe0b7">通信待機中</b><br>取得 <b data-hd-count>0</b>件 / 検出フレーム <b data-hd-frames>0</b><br><small>母港・装備・任務などを開くと自動で取得するよ。</small></div>'+
    '<div style="display:flex;gap:6px;flex-wrap:wrap"><button data-hd-send style="font-weight:700">HarborDeskへ送る</button><button data-hd-copy>JSONをコピー</button><button data-hd-clear>クリア</button></div>'+
    '<div style="margin-top:7px;color:#7f9aae"><small>api_token・Cookie・DMMログイン情報・リクエスト本文は保存しません。</small></div>';
  document.documentElement.appendChild(panel);
  countEl=panel.querySelector('[data-hd-count]');
  statusEl=panel.querySelector('[data-hd-status]');
  frameEl=panel.querySelector('[data-hd-frames]');
  panel.querySelector('[data-hd-hide]').onclick=()=>{panel.hidden=true};
  panel.querySelector('[data-hd-clear]').onclick=()=>{records.length=0;signatures.clear();render()};
  panel.querySelector('[data-hd-copy]').onclick=copy;
  panel.querySelector('[data-hd-send]').onclick=send;
  render();
}
function render(){
  if(countEl)countEl.textContent=String(records.length);
  if(frameEl)frameEl.textContent=String(frameHits);
  if(statusEl){
    statusEl.textContent=records.length?'取得中':'通信待機中';
    statusEl.style.color=records.length?'#9fe0b7':'#f0d590';
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
function send(){
  if(!records.length){
    alert('まだ取得データがないよ。母港・装備・任務などを一度開いてからもう一度押してね。');
    return;
  }
  const target=window.open(HARBOR_URL,'harbordesk-kancolle-import');
  if(!target){
    alert('HarborDeskを開けなかったよ。Safariのポップアップ設定を確認してね。');
    return;
  }
  const message={type:'harbordesk-kancolle-import',payload:exportObject()};
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    try{target.postMessage(message,HARBOR_ORIGIN)}catch{}
    if(tries>=20)clearInterval(timer);
  },350);
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
  show,
  send
};

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{if(isGameShell())show()},{once:true});
}else if(isGameShell())show();

setTimeout(()=>{if(isGameShell())show()},1200);
})();
