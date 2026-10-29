'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {previous,legacySession}=require('./fixtures/seven-two-legacy-sortie-consumers.cjs');
const root=path.resolve(__dirname,'..'),SESSION='harbordesk-active-sortie-session-v1',PREF='harbordesk-sortie-objective-pref-v1',LOG='harbordesk-sortie-log-v1',FLEETS='harbordesk-custom-fleets-v1',NOW=1700000002000;
const plain=x=>JSON.parse(JSON.stringify(x)),own=(x,k)=>Object.hasOwn(x,k);
function prefix(file){
 const s=fs.readFileSync(path.join(root,file),'utf8'),end=s.search(/\n(?:document|window)\.addEventListener\(/);
 assert.ok(end>0,'functions precede event installation: '+file);return s.slice(0,end);
}
function controlsFor(session){
 const d=session&&session.draft&&typeof session.draft==='object'&&!Array.isArray(session.draft)?session.draft:{},field={
  hdSMResult:['result','S'],hdSMNode:['node',''],hdSMBattles:['battles',1],hdSMDrop:['drop',''],hdSMBuckets:['buckets',0],hdSMFuel:['fuel',0],hdSMAmmo:['ammo',0],hdSMSteel:['steel',0],hdSMBauxite:['bauxite',0],hdSMMemo:['memo',''],hdSMRetreatReason:['retreatReason','']
 },out={};
 for(const [id,[key,fallback]]of Object.entries(field))out[id]={value:String(d[key]??fallback)};
 out.hdSMBoss={checked:!!d.boss};return out;
}
function context({old=false,session=legacySession(),prefs={'7-2':'G1','1-1':'B',metadata:{keep:'prefs'}},prefRaw,logRows}={}){
 const initialLog=logRows||[{id:'old-log-first',map:'7-2',node:'G1',objectiveTarget:'G1',battles:9,memo:'old first',metadata:{keep:'first'}},{id:'old-log-second',map:'7-2',node:'G2',objectiveTarget:'G2',battles:7,metadata:{keep:'second'}}];
 const data=new Map([[SESSION,JSON.stringify(session,null,2)],[PREF,prefRaw===undefined?JSON.stringify(prefs,null,2):prefRaw],[LOG,JSON.stringify(initialLog,null,2)],[FLEETS,JSON.stringify({'7-2':[{id:'other-fleet',metadata:{keep:true},ships:[{ship:'合成別艦',metadata:{keep:'other'}}]}],'1-1':[{id:'other-map',metadata:{keep:true}}]},null,2)],['unrelated-synthetic-key',' keep exact unrelated string ']]);
 const writes=[],events=[],reads=[],controls=controlsFor(session);let fault='',sessionReads=0;
 const storage={getItem(k){reads.push(k);if(k===SESSION){sessionReads++;if(fault==='session-second-read'&&sessionReads===2)throw Error('synthetic second session read failure')}if(fault==='pref-read'&&k===PREF)throw Error('synthetic preference read failure');return data.has(k)?data.get(k):null},setItem(k,v){if(fault==='pref-write'&&k===PREF)throw Error('synthetic preference write failure');writes.push({key:k,value:String(v)});data.set(k,String(v))},removeItem(k){writes.push({key:k,removed:true});data.delete(k)}};
 class FixedDate extends Date{static now(){return NOW}}
 const document={getElementById:id=>controls[id]||null,querySelector:()=>null,addEventListener(){}};
 const c=vm.createContext({window:{dispatchEvent:e=>events.push(e),addEventListener(){},hdToast(){}},document,localStorage:storage,Date:FixedDate,CustomEvent:class{constructor(type,o={}){this.type=type;this.detail=o.detail}},Event:class{constructor(type){this.type=type}},crypto:{randomUUID:()=> 'synthetic-new-log'},HD_NODE_DETAIL_OVERRIDES:{},MAP_DETAILS:{},clearTimeout(){},setTimeout(){throw Error('unexpected synthetic timer')},setInterval(){throw Error('unexpected synthetic interval')}});
 for(const file of ['map-images.js','map-node-data-2-7.js','map-details-57.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
 if(old){
  vm.runInContext("const HD_SM_SESSION_KEY='"+SESSION+"'; const HD_SM_OBJECTIVE_PREF_KEY='"+PREF+"';\n"+Object.values(previous.functions).join('\n'),c);
  c.window.hdSSLoad=()=>JSON.parse(storage.getItem(SESSION));c.window.hdSSSave=x=>storage.setItem(SESSION,JSON.stringify(x));
 }else{
  vm.runInContext(prefix('sortie-mode.js'),c,{filename:'sortie-mode.js'});
  vm.runInContext(prefix('sortie-session.js'),c,{filename:'sortie-session.js'});
  vm.runInContext(prefix('sortie-log.js'),c,{filename:'sortie-log.js'});
  c.window.hdSSLoad=c.hdSSLoad;c.window.hdSSSave=c.hdSSSave;
  c.hdSMRender=()=>true;c.hdSSRender=()=>{};c.hdSLRender=()=>{};
  c.hdSLApplyActivity=()=>[];c.hdSLApplyHunt=()=>null;
 }
 return {c,data,writes,events,reads,controls,initialLog:plain(initialLog),getSession:()=>JSON.parse(data.get(SESSION)),getPrefs:()=>JSON.parse(data.get(PREF)),fault:x=>{fault=x;sessionReads=0},snapshot:()=>Object.fromEntries(data),setControls(s){Object.assign(controls,controlsFor(s))}};
}
function preservedKeys(env,before,allowed=[]){
 for(const [key,value]of Object.entries(before))if(!allowed.includes(key))assert.equal(env.data.get(key),value,key+' original bytes');
}
function assertRawField(actual,expected,key){
 assert.equal(own(actual,key),own(expected,key),key+' property presence');
 if(own(expected,key)){assert.equal(typeof actual[key],typeof expected[key],key+' type');assert.deepEqual(plain(actual[key]),plain(expected[key]),key+' exact value');}
}
function assertHistory(actual,expected){
 for(const key of ['node','routeNodes','battles','boss','advanceGuard','routeGraph'])assertRawField(actual,expected,key);
}
test('synthetic previous public save functions overwrite an old target and reinterpret battle count under the candidate graph',()=>{
 const before=legacySession({target:'G1'}),e=context({old:true,session:before}),raw=e.snapshot();
 assert.equal(e.c.hdSMSelectedObjective('7-2',before.draft),'');
 assert.equal(e.c.hdSMFormData().objectiveTarget,'');
 assert.equal(e.c.hdSMDraft(before).battles,2);
 assert.equal(e.writes.length,0,'synthetic reads alone do not write');
 assert.equal(e.data.get(SESSION),raw[SESSION]);
 e.controls.hdSMMemo.value='edited memo';assert.equal(e.c.hdSMSaveDraft(),true);
 const actual=e.getSession(),expected=plain(before);expected.draft={...expected.draft,objectiveTarget:'',battles:2,memo:'edited memo',updatedAt:NOW};
 assert.deepEqual(actual,expected);
 assert.equal(actual.draft.routeNodes.join('/'),'A/B/C');
 preservedKeys(e,raw,[SESSION]);assert.equal(e.writes.length,1);
 // This is an isolated VM/storage-function counterexample with synthetic values.
 // It does not claim that a browser or real user's storage loss was observed.
});
test('7-2 objective resolution is source-scoped and separates raw aliases, unknowns, unselected and explicit empty',()=>{
 const e=context(),c=e.c,raw=e.snapshot();
 for(const [value,status,target]of [['G1','legacy','G'],['G2','legacy','M'],[' G1 ','legacy','G'],['G','current','G'],['M','current','M'],['OLD-UNKNOWN','unknown',''],['<old&unknown>','unknown',''],['','cleared',''],[undefined,'unselected',''],[null,'unknown',''],[42,'unknown',''],[{legacy:'X'},'unknown',''],[{toString:null},'unknown',''],['   ','unknown','']]){
  const state=c.hdSMObjectiveState('7-2',value);assert.equal(state.status,status);assert.equal(state.target,target);assert.equal(own(state,'raw'),true);
  if(value===undefined)assert.equal(state.raw,undefined);else assert.deepEqual(plain(state.raw),value);
 }
 assert.deepEqual(Array.from(c.hdSMObjectiveTargets('7-2')),['G','M']);
 assert.deepEqual(Array.from(c.hdSMObjectiveTargets('7-2','')),['G','M']);
 assert.deepEqual(Array.from(c.hdSMObjectiveTargets('7-2','G1')),['G']);
 assert.deepEqual(Array.from(c.hdSMObjectiveTargets('7-2','G2')),['M']);
 for(const unknown of ['OLD-UNKNOWN',null,42,false,{old:'target'}])assert.deepEqual(Array.from(c.hdSMObjectiveTargets('7-2',unknown)),[]);
 assert.equal(c.hdSMObjectiveTargets('7-2').includes('undefined'),false);
 assert.deepEqual(Array.from(c.hdSMObjectiveOptions('7-2'),x=>({label:x.label,type:x.type})),[{label:'G',type:'boss'},{label:'M',type:'boss'}]);
 assert.match(c.hdSMRouteTargetName('7-2','G1'),/G/);assert.match(c.hdSMRouteTargetName('7-2','OLD-UNKNOWN'),/旧目標/);assert.match(c.hdSMRouteTargetName('7-2','OLD-UNKNOWN'),/再選択|対応未確認/);
 assert.equal(e.writes.length,0);assert.deepEqual(e.snapshot(),raw);
});
test('reading, rendering and graph switching never normalize legacy preference or session bytes',()=>{
 for(const target of ['G1','G2',' G1 ','OLD-UNKNOWN',null,17,{legacy:'unknown'},{toString:null}]){
  const session=legacySession({target}),e=context({session,prefs:{'7-2':target,'1-1':'B',metadata:{keep:true}}}),raw=e.snapshot(),c=e.c;
  assert.deepEqual(plain(c.hdSMObjectivePreference('7-2')),target);assert.deepEqual(plain(c.hdSMSelectedObjective('7-2',session.draft)),target);
  c.hdSMObjectiveOptions('7-2');c.hdSMObjectivePickerHtml('7-2',session.draft);c.hdSMObjectivePrestartHtml('7-2');const preview=c.hdSMPrestartRoutePreviewHtml('7-2');if(c.hdSMObjectiveState('7-2',target).status==='unknown'){assert.match(preview,/旧目標/);assert.doesNotMatch(preview,/自動（攻略目標）/)}c.hdSMDraft(session);
  c.realGraph=vm.runInContext("HD_MAP_GRAPHS['7-2']",c);vm.runInContext("HD_MAP_GRAPHS['7-2']=("+previous.legacyGraphSource+")",c);c.hdSMObjectiveOptions('7-2');vm.runInContext("HD_MAP_GRAPHS['7-2']=realGraph",c);
  assert.equal(e.writes.length,0);assert.deepEqual(e.snapshot(),raw);
 }
});
test('legacy memo saves preserve every history field, target presence and typed raw values rather than manufacturing defaults',()=>{
 const variants=[legacySession({target:'G1'}),legacySession({target:' G2 '}),legacySession({target:'OLD-UNKNOWN'}),legacySession({target:null}),legacySession({target:{opaque:['old',1]}}),legacySession({target:{toString:null}}),legacySession({targetPresent:false}),legacySession({target:''}),legacySession({target:'G',routeGraph:'future-unrecognized',routeNodes:[' A ','',null,7,...Array.from({length:41},(_,i)=>'old-'+i)],battles:'09',boss:'legacy-flag'})];
 const empty=legacySession();empty.draft={metadata:{keep:'draft'}};variants.push(empty);const reason=legacySession();reason.draft.retreatReason='older reason kept with S result';variants.push(reason);
 for(const missing of ['node','routeNodes','battles','boss','advanceGuard','routeGraph']){const s=legacySession();delete s.draft[missing];variants.push(s)}
 for(const before of variants){
  const e=context({session:before}),raw=e.snapshot(),expected=plain(before),view=e.c.hdSMDraft(before);
  assert.equal(e.c.hdSMRetainedRoute(before),true);assert.ok(view&&typeof view==='object');assert.equal(e.writes.length,0);assert.deepEqual(e.snapshot(),raw);assert.equal(e.c.hdSMSaveDraft(),true);assert.equal(e.writes.length,0);assert.deepEqual(e.snapshot(),raw);
  e.controls.hdSMMemo.value='edited memo';assert.equal(e.c.hdSMSaveDraft(),true);
  expected.draft.memo='edited memo';expected.draft.updatedAt=NOW;
  const actual=e.getSession();assert.deepEqual(actual,expected);assertHistory(actual.draft,before.draft);assertRawField(actual.draft,before.draft,'objectiveTarget');
  preservedKeys(e,raw,[SESSION]);assert.deepEqual(e.writes.map(x=>x.key),[SESSION]);
  // Re-read the exact serialized save, as a new document would, without applying a migration.
  const serialized=e.data.get(SESSION),loaded=JSON.parse(serialized);e.c.hdSMDraft(loaded);assert.equal(e.data.get(SESSION),serialized);assertHistory(loaded.draft,before.draft);assertRawField(loaded.draft,before.draft,'objectiveTarget');
 }
});
test('undefined, null and unsupported objective changes cannot act as clear or reset malformed preference JSON',()=>{
 for(const candidate of [undefined,null,'OLD-UNKNOWN','   ',42,{target:'G'}]){
  const e=context(),raw=e.snapshot();assert.equal(e.c.hdSMSetObjectiveTarget(candidate),false);assert.equal(e.writes.length,0);assert.deepEqual(e.snapshot(),raw);assert.equal(e.c.hdSMSetObjectivePreference('7-2',candidate),false);assert.equal(e.writes.length,0);assert.deepEqual(e.snapshot(),raw);
 }
 for(const prefRaw of ['{invalid','[]','null','42','"old root"']){
  const e=context({prefRaw}),raw=e.snapshot();assert.equal(e.c.hdSMSetObjectiveTarget('M'),false);assert.equal(e.writes.length,0);assert.deepEqual(e.snapshot(),raw);
 }
 for(const fault of ['pref-read','pref-write']){
  const e=context(),raw=e.snapshot();e.fault(fault);assert.equal(e.c.hdSMSetObjectiveTarget('M'),false);assert.equal(e.writes.length,0);assert.deepEqual(e.snapshot(),raw);
 }
 for(const draft of [null,'opaque old draft',42,[]]){
  const session=legacySession();session.draft=draft;const e=context({session}),raw=e.snapshot();e.controls.hdSMMemo.value='edited memo';
  const html=e.c.hdSMActiveHtml(session);assert.match(html,/data-hd-sm-legacy-invalid/);assert.doesNotMatch(html,/id="hdSMResult"|data-hd-sm-finish/);assert.equal(e.c.hdSMSaveDraft(),false);assert.equal(e.c.hdSMSetObjectiveTarget('M'),false);assert.equal(e.c.hdSMSetNode('C'),false);assert.equal(e.c.hdSMUndoNode(),false);assert.deepEqual(plain(e.c.hdSSApplyObjectivePref(plain(session),'7-2')),session);assert.equal(e.c.hdSSFinish(e.c.hdSMFormData()),null);assert.equal(e.writes.length,0);assert.deepEqual(e.snapshot(),raw);
 }
});
test('an absent old draft stays absent on a no-change save and only an explicit memo edit creates that field',()=>{
 const before=legacySession();delete before.draft;const e=context({session:before}),raw=e.snapshot();
 assert.equal(e.c.hdSMRetainedRoute(before),true);e.c.hdSMDraft(before);assert.equal(e.c.hdSMSaveDraft(),true);assert.equal(e.writes.length,0);assert.deepEqual(e.snapshot(),raw);
 e.controls.hdSMMemo.value='edited memo';assert.equal(e.c.hdSMSaveDraft(),true);const expected=plain(before);expected.draft={memo:'edited memo',updatedAt:NOW};assert.deepEqual(e.getSession(),expected);preservedKeys(e,raw,[SESSION]);assert.deepEqual(e.writes.map(x=>x.key),[SESSION]);
});
test('explicit current target selection and empty clear retain old path, typed metadata and graph marker',()=>{
 for(const target of ['G','M','']){
  const before=legacySession({target:'G2'}),e=context({session:before,prefs:{'7-2':'G1','1-1':'B',metadata:{keep:'prefs'}}}),raw=e.snapshot(),expected=plain(before);
  assert.equal(e.c.hdSMSetObjectiveTarget(target),true);expected.draft.objectiveTarget=target;expected.draft.updatedAt=NOW;
  assert.deepEqual(e.getSession(),expected);assertHistory(e.getSession().draft,before.draft);assert.equal(e.c.hdSMRetainedRoute(e.getSession()),true);
  assert.deepEqual(e.getPrefs(),{'7-2':target,'1-1':'B',metadata:{keep:'prefs'}});assert.equal(own(e.getPrefs(),'7-2'),true,'empty preference is an explicit owned clear');
  preservedKeys(e,raw,[SESSION,PREF]);assert.deepEqual(e.writes.map(x=>x.key),[PREF,SESSION]);
 }
 for(const target of ['M','']){const p=context(),raw=p.snapshot();assert.equal(p.c.hdSMSetObjectivePreference('7-2',target),true);assert.equal(p.getPrefs()['7-2'],target);assert.equal(own(p.getPrefs(),'7-2'),true);preservedKeys(p,raw,[PREF]);assert.deepEqual(p.writes.map(x=>x.key),[PREF]);}
 const noTarget=legacySession({targetPresent:false}),e=context({session:noTarget,prefs:{'1-1':'B'}});e.controls.hdSMMemo.value='edited memo';assert.equal(e.c.hdSMSaveDraft(),true);assert.equal(own(e.getSession().draft,'objectiveTarget'),false);assert.equal(own(e.getPrefs(),'7-2'),false);
});
test('all unmarked or unrecognized 7-2 sessions retain old route state and reject new node, undo and advance changes without writes',()=>{
 for(const marker of [undefined,'future-v2']){
  const before=marker===undefined?legacySession():legacySession({routeGraph:marker}),e=context({session:before}),raw=e.snapshot();
  assert.equal(e.c.hdSMRetainedRoute(before),true);
  for(const action of [()=>e.c.hdSMSetNode('E'),()=>e.c.hdSMUndoNode(),()=>e.c.hdSMSetAdvanceGuard(true),()=>e.c.hdSMSetAdvanceGuard(false)]){
   assert.equal(action(),false);assert.deepEqual(e.snapshot(),raw);assert.equal(e.writes.length,0);
  }
 }
 const empty=legacySession({node:'',routeNodes:[]}),e=context({session:empty}),raw=e.snapshot();assert.equal(e.c.hdSMRetainedRoute(empty),true);assert.equal(e.c.hdSMSetNode('C'),false);assert.deepEqual(e.snapshot(),raw);assert.equal(e.writes.length,0);
});
test('new snapshots alone receive the real-graph marker and both real bosses are recorded as bosses',()=>{
 const e=context(),c=e.c;c.hdSSFleet=()=>({id:'new-fleet',name:'new fixture',ships:[],metadata:{keep:true}});c.hdSSStats=()=>({shipCount:1,autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]});c.hdSSStrategy=()=> 'manual';c.hdSSStrategyLabel=()=> 'fixture';c.hdSSGate=()=>({state:'go',label:'go',detail:'',hardBlock:false,actions:[]});c.hdSSTelemetry=()=>null;c.hdSSUid=()=> 'new-snapshot';
 const fresh=c.hdSSSnapshot('7-2');assert.equal(fresh.draft.routeGraph,'7-2-real-v1');assert.equal(c.hdSMRetainedRoute(fresh),false);assert.equal(own(c.hdSSSnapshot('1-1'),'draft'),false,'other map snapshot shape unchanged');assert.equal(e.writes.length,0);
 for(const boss of ['G','M']){
  const s=legacySession({target:boss,routeGraph:'7-2-real-v1',node:'',routeNodes:[],battles:0});e.data.set(SESSION,JSON.stringify(s));e.setControls(s);e.writes.length=0;
  assert.equal(c.hdSMSetNode(boss),true);const saved=e.getSession();assert.equal(saved.draft.boss,true);assert.deepEqual(saved.draft.routeNodes,[boss]);assert.equal(saved.draft.battles,1);assert.equal(saved.draft.routeGraph,'7-2-real-v1');assert.deepEqual(saved.metadata,s.metadata);
  assert.equal(c.hdSMUndoNode(),true);assert.deepEqual(e.getSession().draft.routeNodes,[]);assert.equal(e.getSession().draft.boss,false);assert.equal(e.getSession().draft.battles,0);
 }
});
test('new-session preference inheritance distinguishes missing, owned empty and typed unknown without rewriting the source key',()=>{
 for(const [prefs,present,value]of [[{'1-1':'B'},false,undefined],[{'7-2':'','1-1':'B'},true,''],[{'7-2':'G1','1-1':'B'},true,'G1'],[{'7-2':null,'1-1':'B'},true,null],[{'7-2':{old:'target'},'1-1':'B'},true,{old:'target'}]]){
  const e=context({prefs}),raw=e.snapshot(),session={id:'new',map:'7-2',status:'active',draft:{routeGraph:'7-2-real-v1',metadata:{keep:true}}},actual=e.c.hdSSApplyObjectivePref(session,'7-2');
  assert.equal(own(actual.draft,'objectiveTarget'),present);if(present)assert.deepEqual(plain(actual.draft.objectiveTarget),value);assert.deepEqual(plain(actual.draft.metadata),{keep:true});assert.equal(actual.draft.routeGraph,'7-2-real-v1');assert.equal(e.writes.length,0);assert.deepEqual(e.snapshot(),raw);
 }
});
test('owned targets including explicit empty are not replaced when a preference is applied to an existing session',()=>{
 for(const target of ['G2','','OLD-UNKNOWN',null,{old:'typed'}]){const before=legacySession({target}),e=context(),copy=plain(before),raw=e.snapshot();assert.deepEqual(plain(e.c.hdSSApplyObjectivePref(copy,'7-2')),before);assert.deepEqual(copy,before);assert.equal(e.writes.length,0);assert.deepEqual(e.snapshot(),raw);}
});
test('explicit return keeps a deep original legacy-session snapshot, raw goal and old logs without fabricating game-native history',()=>{
 const variants=[['G1','legacy'],[' G2 ','legacy'],['G','current'],['M','current'],['','cleared'],['OLD-UNKNOWN','unknown'],[null,'unknown'],[17,'unknown'],[{old:'unknown'},'unknown'],[{toString:null},'unknown']].map(([target,status])=>({before:legacySession({target}),status}));
 variants.push({before:legacySession({targetPresent:false}),status:'unselected'});
 for(const {before,status}of variants){
  const rawTarget=before.draft.objectiveTarget,e=context({session:before}),raw=e.snapshot(),snapshot=plain(before),form=e.c.hdSMFormData(),entry=e.c.hdSSFinish(form);
  assert.ok(entry);assert.deepEqual(plain(entry.legacyRouteSnapshot.session),snapshot);assert.equal(entry.legacyRouteSnapshot.status,status);
  assert.equal(entry.objectiveTarget,typeof rawTarget==='string'?rawTarget:'');
  for(const key of ['gameRouteNodes','gameRouteLabels','gameSortieKey'])assert.equal(own(entry,key),false);
  assert.equal(e.data.has(SESSION),false,'explicit return ends the active session');
  const rows=JSON.parse(e.data.get(LOG));assert.equal(rows.length,e.initialLog.length+1);assert.deepEqual(rows.slice(1),e.initialLog);assert.deepEqual(rows[0].legacyRouteSnapshot.session,snapshot);
  preservedKeys(e,raw,[SESSION,LOG,'harbordesk-post-sortie-review-v1']);
  assert.notEqual(rows[0].legacyRouteSnapshot.session,before);const finished=e.events.find(x=>x.type==='hd:sortie-session-changed'&&x.detail?.action==='finish');assert.ok(finished);assert.notEqual(entry.legacyRouteSnapshot.session,finished.detail.session);assert.notEqual(entry.legacyRouteSnapshot.session.draft,finished.detail.session.draft);finished.detail.session.draft.memo='mutated event-only fixture';assert.deepEqual(plain(entry.legacyRouteSnapshot.session),snapshot);
 }
});
test('raw old battle strings cannot insert markup and remain exact through an unrelated memo save',()=>{
 const value='"><img src=x onerror=synthetic()>',before=legacySession({battles:value}),e=context({session:before}),html=e.c.hdSMActiveHtml(before);assert.doesNotMatch(html,/<img/);assert.match(html,/data-hd-sm-legacy-route/);e.controls.hdSMMemo.value='edited memo';assert.equal(e.c.hdSMSaveDraft(),true);assert.equal(e.getSession().draft.battles,value);assertHistory(e.getSession().draft,before.draft);
});
test('temporary missing or old diagrams do not erase raw targets or reinterpret stored history, including a current marker',()=>{
 for(const marker of [undefined,'7-2-real-v1'])for(const mode of ['absent','null','old']){
  const before=marker===undefined?legacySession({target:'G1'}):legacySession({target:'G',routeGraph:marker}),e=context({session:before}),c=e.c,raw=e.snapshot();c.realGraph=vm.runInContext("HD_MAP_GRAPHS['7-2']",c);
  if(mode==='absent')vm.runInContext("delete HD_MAP_GRAPHS['7-2']",c);else vm.runInContext("HD_MAP_GRAPHS['7-2']="+(mode==='null'?'null':'('+previous.legacyGraphSource+')'),c);
  assert.equal(c.hdSMSelectedObjective('7-2',before.draft),before.draft.objectiveTarget);assert.equal(c.hdSMObjectivePreference('7-2'),'G1');assert.deepEqual(Array.from(c.hdSMObjectiveTargets('7-2')),[]);c.hdSMDraft(before);c.hdSMActiveHtml(before);assert.equal(e.writes.length,0);assert.deepEqual(e.snapshot(),raw);
  assert.equal(c.hdSMRetainedRoute(before),true);for(const action of [()=>c.hdSMSetNode('E'),()=>c.hdSMUndoNode(),()=>c.hdSMSetAdvanceGuard(true),()=>c.hdSMSetObjectiveTarget('M')]){assert.equal(action(),false);assert.equal(e.writes.length,0);assert.deepEqual(e.snapshot(),raw);}
  e.controls.hdSMMemo.value='edited memo';assert.equal(c.hdSMSaveDraft(),true);let expected=plain(before);expected.draft.memo='edited memo';expected.draft.updatedAt=NOW;assert.deepEqual(e.getSession(),expected);preservedKeys(e,raw,[SESSION]);assertHistory(e.getSession().draft,before.draft);
  assert.equal(c.hdSMSetObjectiveTarget(''),true);expected.draft.objectiveTarget='';assert.deepEqual(e.getSession(),expected);assertHistory(e.getSession().draft,before.draft);assert.equal(e.getPrefs()['7-2'],'');
  const serialized=e.data.get(SESSION);vm.runInContext("HD_MAP_GRAPHS['7-2']=realGraph",c);c.hdSMDraft(e.getSession());assert.equal(e.data.get(SESSION),serialized);assert.equal(c.hdSMRetainedRoute(e.getSession()),marker!=='7-2-real-v1');
 }
});
test('new marked sessions retain inherited raw goals at return and preserve cached fields after a second storage read fails',()=>{
 for(const target of [null,0,false,{old:'unknown'},{toString:null},'OLD-UNKNOWN','G1','G2',' G1 ',' M ','   ']){
  const before=legacySession({target,routeGraph:'7-2-real-v1',node:'E',routeNodes:['C','E'],battles:2}),e=context({session:before,prefs:{'7-2':target,'1-1':'B',metadata:{keep:'prefs'}}}),raw=e.snapshot(),entry=e.c.hdSSFinish(e.c.hdSMFormData());
  assert.ok(entry);assert.deepEqual(plain(entry.legacyRouteSnapshot.session),before);assert.equal(entry.legacyRouteSnapshot.status,e.c.hdSMObjectiveState('7-2',target).status);assert.equal(entry.objectiveTarget,typeof target==='string'?target:'');assert.equal(e.data.has(SESSION),false);for(const key of ['gameRouteNodes','gameRouteLabels','gameSortieKey'])assert.equal(own(entry,key),false);const rows=JSON.parse(e.data.get(LOG));assert.deepEqual(rows.slice(1),e.initialLog);assert.deepEqual(rows[0].legacyRouteSnapshot.session,before);preservedKeys(e,raw,[SESSION,LOG,'harbordesk-post-sortie-review-v1']);
 }
 for(const value of ['G','M','',undefined]){const before=value===undefined?legacySession({targetPresent:false,routeGraph:'7-2-real-v1',node:'E',routeNodes:['C','E'],battles:2}):legacySession({target:value,routeGraph:'7-2-real-v1',node:'E',routeNodes:['C','E'],battles:2}),e=context({session:before}),entry=e.c.hdSSFinish(e.c.hdSMFormData());assert.ok(entry);assert.equal(own(entry,'legacyRouteSnapshot'),false,'ordinary modern targets retain their existing log shape');assert.equal(entry.objectiveTarget,value||'');assert.deepEqual(JSON.parse(e.data.get(LOG)).slice(1),e.initialLog);}
 for(const modern of [false,true]){
  const before=modern?legacySession({target:null,routeGraph:'7-2-real-v1',node:'E',routeNodes:['C','E'],battles:2}):legacySession({target:'G1'});if(!modern)before.draft.retreatReason='keep old reason with S result';const e=context({session:before}),raw=e.snapshot(),expected=plain(before);e.controls.hdSMMemo.value='edited memo';e.fault('session-second-read');assert.equal(e.c.hdSMSaveDraft(),true);expected.draft.memo='edited memo';expected.draft.updatedAt=NOW;assert.deepEqual(e.getSession(),expected);assert.equal(e.reads.filter(k=>k===SESSION).length,2,'the second actual load is the injected failure');assertHistory(e.getSession().draft,before.draft);assertRawField(e.getSession().draft,before.draft,'objectiveTarget');preservedKeys(e,raw,[SESSION]);assert.deepEqual(e.writes.map(x=>x.key),[SESSION]);
 }
});
test('thirty-six other map objective contracts keep the previous public outputs and save behavior',()=>{
 const current=context(),old=context({old:true}),graphs=vm.runInContext('HD_MAP_GRAPHS',current.c),maps=Object.keys(graphs).filter(x=>x!=='7-2');assert.equal(maps.length,36);
 for(const map of maps){
  const graph=graphs[map],targets=['',graph.goal,graph.boss,'unregistered'].filter((x,i,a)=>a.indexOf(x)===i);
  assert.deepEqual(plain(current.c.hdSMObjectiveOptions(map)),plain(old.c.hdSMObjectiveOptions(map)),map+' options');
  for(const target of targets){
   assert.deepEqual(Array.from(current.c.hdSMObjectiveTargets(map,target)),Array.from(old.c.hdSMObjectiveTargets(map,target)),map+' targets');
   assert.equal(current.c.hdSMSelectedObjective(map,{objectiveTarget:target}),old.c.hdSMSelectedObjective(map,{objectiveTarget:target}),map+' selected');
   assert.equal(current.c.hdSMRouteTargetName(map,target),old.c.hdSMRouteTargetName(map,target),map+' name');
  }
 }
 const before=legacySession({target:'B'});before.map='1-1';const e=context({session:before}),legacy=context({old:true,session:before});e.controls.hdSMMemo.value=legacy.controls.hdSMMemo.value='edited memo';assert.equal(e.c.hdSMSaveDraft(),legacy.c.hdSMSaveDraft());assert.deepEqual(e.getSession(),legacy.getSession());assert.equal(e.c.hdSMRetainedRoute(before),false);
});
