'use strict';
// Pure model loader: actual product modules and their actual dependencies.
// Only browser UI/event-registration tails are excluded by unique source anchors.
// Storage is a synthetic read-only backing map. No semantic product helper is stubbed.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const SELECTORS=[
 {
  "file": "ship-master-snapshot.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "equipment-catalog.js",
  "parts": [
   {
    "from": null,
    "to": "const HD_EQUIP_CATALOG_VIEW_KEY='harbordesk-session-equip-catalog-view-v1';\nfunction hdEquipCatalogV"
   }
  ]
 },
 {
  "file": "equipment-catalog-extra.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "equipment-catalog-extra2.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "equipment-catalog-extra3.js",
  "parts": [
   {
    "from": null,
    "to": "hdEquipStatText=function(item){\n const parts=Object.entries(item.stats||{}).map(([k,v])=>`${k}${Numb"
   }
  ]
 },
 {
  "file": "equipment-catalog-extra4.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "ship-database.js",
  "parts": [
   {
    "from": null,
    "to": "window.HD_SHIP_MASTER_AUDIT=hdShipDbMasterAudit();\nfunction hdShipDbMapCandidates(detail){\n const te"
   },
   {
    "from": "function hdShipDbMapCandidates(detail){\n const text=[detail?.name,detail?.overview,detail?.fleet,det",
    "to": "const HD_SHIP_DB_VIEW_KEY='harbordesk-session-shipdb-view-v1';\nfunction hdShipDbViewLoad(){try{retur"
   }
  ]
 },
 {
  "file": "map-details.js",
  "parts": [
   {
    "from": null,
    "to": "\nconst HD_MAP_LEVEL_GUIDE={\n '1-1':{min:'Lv1〜',recommended:'平均Lv5〜10',note:'未改造でも攻略可能。まず操作と編成に慣れる海域。"
   }
  ]
 },
 {
  "file": "map-node-data-1.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "map-details-34.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "map-node-data-2-7.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "map-advanced-data.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "map-images.js",
  "parts": [
   {
    "from": null,
    "to": "function hdMapEsc2(s){return typeof esc==='function'?esc(s):String(s??'')}\nfunction hdMapStartLabels"
   }
  ]
 },
 {
  "file": "map-plans.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "fleet-suggester.js",
  "parts": [
   {
    "from": null,
    "to": "let hdFSPressedPointer=null,hdFSRenderPending=false,hdFSPendingPreserveLoadouts=true;\nfunction hdFSF"
   }
  ]
 },
 {
  "file": "fleet-readiness-evaluator.js",
  "parts": [
   {
    "from": null,
    "to": "document.addEventListener('click',e=>{\n const fix=e.target.closest?.('[data-hd-fe-fix]');if(fix){hdF"
   }
  ]
 },
 {
  "file": "fleet-readiness-evaluator.js",
  "parts": [
   {
    "from": "const HD_FE_OASW_CONFIRM_KEY='harbordesk-oasw-confirmed-v1';\nfunction hdFEAswRoster(ship){\n const ro",
    "to": "function hdFEOpeningAswHtml(ship,scope='',attrs='',remedies=''){"
   }
  ]
 },
 {
  "file": "fleet-calculator.js",
  "parts": [
   {
    "from": null,
    "to": "let hdFCRenderTimer=0;\nfunction hdFCScheduleRender(){clearTimeout(hdFCRenderTimer);hdFCRenderTimer=s"
   }
  ]
 },
 {
  "file": "fleet-loadout-planner.js",
  "parts": [
   {
    "from": null,
    "to": "document.addEventListener('click',e=>{\n const gen=e.target.closest?.('[data-hd-fl-generate]'),regen="
   }
  ]
 },
 {
  "file": "fleet-loadout-optimizer.js",
  "parts": [
   {
    "from": null,
    "to": "document.addEventListener('click',function(e){\n const opt=e.target.closest&&e.target.closest('[data-"
   }
  ]
 },
 {
  "file": "map-air-data.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "map-air-check.js",
  "parts": [
   {
    "from": null,
    "to": "function hdMapAirSave(map,id,checked,goal){\n let all={};try{all=JSON.parse(localStorage.getItem(HD_M"
   }
  ]
 },
 {
  "file": "map-equipment-recommend.js",
  "parts": [
   {
    "from": null,
    "to": "let hdMapEquipPressedPointer=null;\nconst hdMapEquipPendingRenders=new Map();\nfunction hdMapEquipFini"
   }
  ]
 },
 {
  "file": "sortie-equipment-check.js",
  "parts": [
   {
    "from": null,
    "to": "\ndocument.addEventListener('click',e=>{\n if(e.target.closest?.('[data-hd-se-refresh]')){if(typeof hd"
   }
  ]
 },
 {
  "file": "owned-equipment-planner.js",
  "parts": [
   {
    "from": null,
    "to": "\nwindow.addEventListener('hd:land-base-changed',hdOCReviewRefresh);\n\nfunction hdOCPanel(map,fleetId="
   }
  ]
 }
];
function createTwoFiveCeioModelContext(options={}){
 const root=path.resolve(options.root||path.join(__dirname,'../..')),store=new Map(),reads=[],writes=[];
 const storage={getItem(key){key=String(key);reads.push(key);return store.has(key)?store.get(key):null},setItem(key){writes.push(String(key));throw Error('read-only model must not write Storage')},removeItem(){throw Error('read-only model must not remove Storage')},clear(){throw Error('read-only model must not clear Storage')}};
 class UnitDate extends Date{constructor(...args){super(...(args.length?args:[1700000000000]))}static now(){return 1700000000000}}
 const c={localStorage:storage,MAP_DETAILS:{},HD_NODE_DETAIL_OVERRIDES:{},console,URL,Date:UnitDate,Math,Map,Set,WeakMap,WeakSet,performance:{timeOrigin:1700000000000,now:()=>0},setTimeout(){throw Error('unexpected unit timer')},setInterval(){throw Error('unexpected unit interval')},document:new Proxy({},{get(_target,key){throw Error('unexpected model DOM access '+String(key))}})};
 c.window=c;c.addEventListener=()=>{throw Error('unexpected UI listener initialization')};c.dispatchEvent=()=>{throw Error('unexpected UI dispatch')};vm.createContext(c);
 const sourceCache=new Map();
 for(const module of SELECTORS){
  let text=sourceCache.get(module.file);if(text===undefined){text=fs.readFileSync(path.join(root,module.file),'utf8');if(options.project)text=options.project(module.file,text);sourceCache.set(module.file,text)}
  const locate=anchor=>{assert.equal(text.split(anchor).length,2,module.file+' module boundary unique');return text.indexOf(anchor)};
  const code=module.parts.map(part=>{const a=part.from===null?0:locate(part.from),b=part.to===null?text.length:locate(part.to);assert.ok(b>a,module.file+' actual source segment');return text.slice(a,b)}).join('');
  vm.runInContext(code,c,{filename:module.file+'#actual-model'});
 }
 for(const name of ['hdFERoute','hdFERouteContract','hdFEScouting','hdFEPlanScouting','hdFEBranchPredicate','hdOCRequiredChecks','hdOCMeasure','hdOCReadiness','hdOCShortageGoals','hdShipDbSlotProfile','hdFEGameMatch'])assert.equal(typeof c[name],'function',name+' actual product loaded');
 return {c,store,reads,writes,value:expression=>vm.runInContext(expression,c),seed:(key,value)=>store.set(String(key),JSON.stringify(value))};
}
module.exports={createTwoFiveCeioModelContext};
