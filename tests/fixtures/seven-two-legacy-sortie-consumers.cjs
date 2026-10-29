'use strict';
// Exact previous public consumers, retained only as a synthetic VM counterexample.
// No user storage values, timers, browser instrumentation or private evidence are included.
const previous={
  "commit": "08ae92358c05d23b7d0044e22b3d36f51114623b",
  "sourcePath": "sortie-mode.js",
  "sourceSHA256": "4a00db4af73a57f9c7d0088ba92d80e533abe0ef4253695fb61784b5766f2c0e",
  "graphSourcePath": "map-images.js",
  "graphSourceSHA256": "8bd0277c90709933dc6bd49795103afe7a1c1aecd2fc1b093cc343bdb8e5307d",
  "functionNames": [
    "hdSMGraph",
    "hdSMNodeKind",
    "hdSMEffectiveNodeKind",
    "hdSMRequiresAdvanceCheck",
    "hdSMBattleCount",
    "hdSMSession",
    "hdSMNum",
    "hdSMObjectiveTargets",
    "hdSMObjectiveOptions",
    "hdSMObjectivePrefs",
    "hdSMObjectivePreference",
    "hdSMSelectedObjective",
    "hdSMRouteTargetName",
    "hdSMDraft",
    "hdSMFormData",
    "hdSMSaveDraft"
  ],
  "functions": {
    "hdSMGraph": "function hdSMGraph(map){try{return typeof HD_MAP_GRAPHS!=='undefined'?(HD_MAP_GRAPHS[map]||null):null}catch{return null}}\n",
    "hdSMNodeKind": "function hdSMNodeKind(graph,label){\n try{return graph&&typeof hdMapKind==='function'?hdMapKind(graph,label):(graph?.boss===label?'boss':graph?.goal===label?'goal':'normal')}catch{return 'normal'}\n}\n",
    "hdSMEffectiveNodeKind": "function hdSMEffectiveNodeKind(map,label,kind){\n const current=String(label||'').trim(),base=String(kind||hdSMNodeKind(hdSMGraph(map),current)||'normal');\n if(!current||base!=='normal')return base;\n let detail={};try{if(typeof HD_NODE_DETAIL_OVERRIDES!=='undefined')detail=HD_NODE_DETAIL_OVERRIDES?.[map]?.[current]||{}}catch{}\n const enemy=String(detail.enemy||'').trim();\n if(/うずしお/.test(enemy))return 'vortex';\n if(/^(戦闘なし|能動分岐)/.test(enemy)||/気のせいだった|敵影を見ず/.test(enemy)){\n  if(/獲得|資源|アイテム|高速修復材|ボーキ|弾薬|燃料|鋼材/.test(enemy))return 'item';\n  return 'safe';\n }\n return base;\n}\n",
    "hdSMRequiresAdvanceCheck": "function hdSMRequiresAdvanceCheck(map,label){\n const current=String(label||'').trim();if(!current)return false;\n const graph=hdSMGraph(map),kind=hdSMEffectiveNodeKind(map,current,hdSMNodeKind(graph,current));\n return !['item','safe','vortex','goal'].includes(kind);\n}\n",
    "hdSMBattleCount": "function hdSMBattleCount(map,route){\n const nodes=Array.isArray(route)?route.map(String).filter(Boolean):[];\n return nodes.reduce((n,label)=>n+(hdSMRequiresAdvanceCheck(map,label)?1:0),0);\n}\n",
    "hdSMSession": "function hdSMSession(){try{return typeof window.hdSSLoad==='function'?window.hdSSLoad():JSON.parse(localStorage.getItem(HD_SM_SESSION_KEY)||'null')}catch{return null}}\n",
    "hdSMNum": "function hdSMNum(id){return Math.max(0,Number(document.getElementById(id)?.value)||0)}\n",
    "hdSMObjectiveTargets": "function hdSMObjectiveTargets(map,target){\n const graph=hdSMGraph(map),all=[...new Set([graph?.goal,graph?.boss].map(String).map(x=>x.trim()).filter(Boolean))],chosen=String(target||'').trim();\n return chosen&&all.includes(chosen)?[chosen]:all;\n}\n",
    "hdSMObjectiveOptions": "function hdSMObjectiveOptions(map){\n const graph=hdSMGraph(map),out=[];\n const goal=String(graph?.goal||'').trim(),boss=String(graph?.boss||'').trim();\n if(goal)out.push({label:goal,type:'goal',name:goal+' 到達地点'});\n if(boss&&boss!==goal)out.push({label:boss,type:'boss',name:boss+' ボス'});\n return out;\n}\n",
    "hdSMObjectivePrefs": "function hdSMObjectivePrefs(){\n try{const x=JSON.parse(localStorage.getItem(HD_SM_OBJECTIVE_PREF_KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}\n}\n",
    "hdSMObjectivePreference": "function hdSMObjectivePreference(map){\n const chosen=String(hdSMObjectivePrefs()[String(map||'')]||'').trim(),allowed=hdSMObjectiveTargets(map);\n return allowed.includes(chosen)?chosen:'';\n}\n",
    "hdSMSelectedObjective": "function hdSMSelectedObjective(map,draft){\n const chosen=String(draft?.objectiveTarget||'').trim(),targets=hdSMObjectiveTargets(map);\n return targets.includes(chosen)?chosen:'';\n}\n",
    "hdSMRouteTargetName": "function hdSMRouteTargetName(map,target){\n const graph=hdSMGraph(map),chosen=String(target||'').trim();\n if(chosen&&chosen===String(graph?.goal||'').trim())return chosen+'到達地点';\n if(chosen&&chosen===String(graph?.boss||'').trim())return chosen+'ボス';\n const hasBoss=!!String(graph?.boss||'').trim(),hasGoal=!!String(graph?.goal||'').trim();\n return hasBoss&&hasGoal?'攻略目標':hasBoss?'ボス':hasGoal?'到達地点':'目標';\n}\n",
    "hdSMDraft": "function hdSMDraft(session){\n const d=session&&session.draft&&typeof session.draft==='object'?session.draft:{};\n const routeNodes=Array.isArray(d.routeNodes)?d.routeNodes.map(String).filter(Boolean).slice(-40):[];\n const storedBattles=(d.battles==null||d.battles==='')?1:Math.max(0,Number.isFinite(Number(d.battles))?Number(d.battles):1);\n const battles=routeNodes.length?hdSMBattleCount(session?.map,routeNodes):storedBattles;\n return {result:String(d.result||'S'),node:String(d.node||''),battles,boss:!!d.boss,drop:String(d.drop||''),buckets:Math.max(0,Number(d.buckets)||0),fuel:Math.max(0,Number(d.fuel)||0),ammo:Math.max(0,Number(d.ammo)||0),steel:Math.max(0,Number(d.steel)||0),bauxite:Math.max(0,Number(d.bauxite)||0),memo:String(d.memo||''),retreatReason:String(d.retreatReason||''),objectiveTarget:String(d.objectiveTarget||''),updatedAt:Math.max(0,Number(d.updatedAt)||0),routeNodes,advanceGuard:d.advanceGuard&&typeof d.advanceGuard==='object'?{node:String(d.advanceGuard.node||''),safe:d.advanceGuard.safe===true,at:Math.max(0,Number(d.advanceGuard.at)||0)}:null};\n}\n",
    "hdSMFormData": "function hdSMFormData(){\n const result=document.getElementById('hdSMResult')?.value||'S',session=hdSMSession();\n return {result,node:document.getElementById('hdSMNode')?.value||'',battles:hdSMNum('hdSMBattles'),boss:!!document.getElementById('hdSMBoss')?.checked,drop:document.getElementById('hdSMDrop')?.value||'',buckets:hdSMNum('hdSMBuckets'),fuel:hdSMNum('hdSMFuel'),ammo:hdSMNum('hdSMAmmo'),steel:hdSMNum('hdSMSteel'),bauxite:hdSMNum('hdSMBauxite'),memo:document.getElementById('hdSMMemo')?.value||'',retreatReason:result==='撤退'?(document.getElementById('hdSMRetreatReason')?.value||''):'',objectiveTarget:hdSMSelectedObjective(session?.map,session?.draft)};\n}\nlet hdSMDraftTimer=0;\n",
    "hdSMSaveDraft": "function hdSMSaveDraft(){\n const session=hdSMSession();if(!session||session.status!=='active'||!document.getElementById('hdSMResult'))return false;\n const prev=session.draft&&typeof session.draft==='object'?session.draft:{},routeNodes=Array.isArray(prev.routeNodes)?prev.routeNodes.map(String).filter(Boolean).slice(-40):[],form=hdSMFormData();\n const draft={...prev,...form,routeNodes,battles:routeNodes.length?hdSMBattleCount(session.map,routeNodes):form.battles};draft.updatedAt=Date.now();session.draft=draft;\n try{if(typeof window.hdSSSave==='function')window.hdSSSave(session);else localStorage.setItem(HD_SM_SESSION_KEY,JSON.stringify(session))}catch{return false}\n const status=document.querySelector('[data-hd-sm-draft-status]');if(status)status.textContent='保存 '+new Date(draft.updatedAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});\n try{window.dispatchEvent(new CustomEvent('hd:sortie-draft-saved',{detail:{sessionId:session.id,draft}}))}catch{}\n return true;\n}\n"
  },
  "legacyGraphSource": "{edges:[['S','A'],['A','B'],['B','C'],['C','G1'],['S2','D'],['D','E'],['E','F'],['F','I'],['I','G2']],boss:'G2',goal:'G1',sub:['A','B']}"
};

function legacySession(options={}){
 const target=Object.hasOwn(options,'target')?options.target:'G1';
 const session={
  id:'synthetic-seven-two-legacy',map:'7-2',status:'active',startedAt:1700000000000,
  fleetId:'synthetic-fleet',fleetName:'互換fixture',strategy:'manual',strategyLabel:'手動fixture',shipCount:1,
  fleetSnapshot:{id:'synthetic-fleet',name:'互換fixture',ships:[{ship:'合成艦',gear:'合成装備',gameShipId:19001,metadata:{keep:'ship'}}],metadata:{keep:'fleet'}},
  readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[],metadata:{keep:'readiness'}},
  metadata:{keep:'session',nested:[1,'two',{three:true}]},
  draft:{result:'S',node:'C',routeNodes:['A','B','C'],battles:9,boss:false,objectiveTarget:target,drop:'',buckets:2,fuel:3,ammo:4,steel:5,bauxite:6,memo:'keep memo',retreatReason:'',updatedAt:1700000000100,advanceGuard:{node:'C',safe:true,at:1700000000050,metadata:{keep:'guard'}},metadata:{keep:'draft'}}
 };
 if(options.targetPresent===false)delete session.draft.objectiveTarget;
 if(Object.hasOwn(options,'routeGraph'))session.draft.routeGraph=options.routeGraph;
 if(Object.hasOwn(options,'routeNodes'))session.draft.routeNodes=options.routeNodes;
 if(Object.hasOwn(options,'node'))session.draft.node=options.node;
 if(Object.hasOwn(options,'battles'))session.draft.battles=options.battles;
 if(Object.hasOwn(options,'boss'))session.draft.boss=options.boss;
 return JSON.parse(JSON.stringify(session));
}
module.exports={previous,legacySession};
