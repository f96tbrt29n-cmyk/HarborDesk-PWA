'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){if(file==='fleet-readiness-evaluator.js'&&name==='hdFEEquipmentRequirements'&&!c.hdFEOneFiveAswSelection)load(file,'hdFEOneFiveAswSelection',c);const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInContext(s.slice(a,b<0?undefined:b),c);}
// Manually transcribed source expectations, before product execution:
// https://zekamashi.net/kancolle-kouryaku/5-5/ and its KCwiki reference.
// These isolate branch predicates. Numeric/speed/type fixtures do not prove a
// real ship fit, inventory, search result, or exact off-route destination.
const sourceCases=[
 {"id":"start-dd3","node":"START","input":{"DD":3,"drumShips":0,"landingShips":0},"expected":"B"},
 {"id":"start-dd4","node":"START","input":{"DD":4,"drumShips":0,"landingShips":0},"expected":"A"},
 {"id":"start-drum3","node":"START","input":{"DD":0,"drumShips":3,"landingShips":0},"expected":"B"},
 {"id":"start-drum4","node":"START","input":{"DD":0,"drumShips":4,"landingShips":0},"expected":"A"},
 {"id":"start-dd-known-exclusion-dominates-unknown","node":"START","input":{"DDKnown":4,"otherHullType":"unknown","drumShips":"unknown","landingShips":"unknown"},"expected":"A"},
 {"id":"start-drum-known-exclusion-dominates-unknown","node":"START","input":{"DD":"unknown","drumShips":4,"landingShips":"unknown"},"expected":"A"},
 {"id":"start-landing-candidate4","node":"START","input":{"DD":0,"drumShips":0,"landingCandidateShips":4,"membership":"source scope unconfirmed"},"expected":"unknown"},
 {"id":"start-empty-known-equipment","node":"START","input":{"DD":1,"drumShips":0,"landingShips":0},"expected":"B"},
 {"id":"B-canonical","node":"B","input":{"BB":2,"CV":2,"CA":2,"DD":0},"expected":"K"},
 {"id":"B-dd1","node":"B","input":{"CV":2,"CA":2,"CL":1,"DD":1},"expected":"K"},
 {"id":"B-dd2-fallback","node":"B","input":{"BB":2,"CV":2,"DD":2},"expected":"F"},
 {"id":"B-cv3-priority","node":"B","input":{"CV":3,"CA":1,"DD":2},"expected":"K"},
 {"id":"B-cv2-cvb1-priority","node":"B","input":{"CV":2,"CVB":1,"CA":1,"DD":2},"expected":"K"},
 {"id":"B-cvl3-not-regular","node":"B","input":{"CVL":3,"CA":1,"DD":2},"expected":"F"},
 {"id":"B-bbv3-clt1-priority","node":"B","input":{"BBV":3,"CLT":1,"DD":2},"expected":"K"},
 {"id":"B-heavy-plus-clt3-below","node":"B","input":{"BB":1,"CLT":2,"CA":1,"DD":2},"expected":"F"},
 {"id":"B-clt3-dd2-conflict","node":"B","input":{"CLT":3,"CA":1,"DD":2},"expected":{"article":"K","kcwiki":"F","consensus":"unknown"}},
 {"id":"B-clt3-dd1-invariant","node":"B","input":{"CLT":3,"CA":2,"DD":1},"expected":"K"},
 {"id":"B-clt3-bb1-priority-resolves","node":"B","input":{"BB":1,"CLT":3,"DD":2},"expected":"K"},
 {"id":"B-known-cv3-dominates-unknown","node":"B","input":{"CVKnown":3,"DD":2,"otherHullType":"unknown"},"expected":"K"},
 {"id":"K-fixed-to-P","node":"K","input":{},"expected":"P"},
 {"id":"P-normal-below-fail-boundary","node":"P","input":{"fleetSpeed":10,"heavy":4,"SS":0,"coef":2,"HQ":120,"score":72.99},"expected":"Q"},
 {"id":"P-normal-exact-lower-random","node":"P","input":{"fleetSpeed":10,"heavy":4,"SS":0,"coef":2,"HQ":120,"score":73},"expected":"random Q/S"},
 {"id":"P-normal-just-below-safe","node":"P","input":{"fleetSpeed":10,"heavy":4,"SS":0,"coef":2,"HQ":120,"score":79.99},"expected":"random Q/S"},
 {"id":"P-normal-exact-safe","node":"P","input":{"fleetSpeed":10,"heavy":4,"SS":0,"coef":2,"HQ":120,"score":80},"expected":"S"},
 {"id":"P-normal-above-safe","node":"P","input":{"fleetSpeed":10,"heavy":4,"SS":0,"coef":2,"HQ":120,"score":80.01},"expected":"S"},
 {"id":"P-low-speed-allowed","node":"P","input":{"fleetSpeed":5,"heavy":4,"SS":0,"coef":2,"HQ":120,"score":80},"expected":"S"},
 {"id":"P-fastplus4-exempt","node":"P","input":{"fleetSpeed":15,"heavy":4,"SS":0,"coef":2,"HQ":120,"score":0},"expected":{"next":"S","scouting":"not applicable"}},
 {"id":"P-fastplus5-exempt-before-random","node":"P","input":{"fleetSpeed":15,"heavy":5,"SS":0,"coef":2,"HQ":120,"score":null},"expected":{"next":"S","scouting":"not applicable"}},
 {"id":"P-fastplus6-not-exempt","node":"P","input":{"fleetSpeed":15,"heavy":6,"SS":0,"coef":2,"HQ":120,"score":80},"expected":"random Q/S; preceding heavy>=5 Q chance"},
 {"id":"P-fastest6-exempt","node":"P","input":{"fleetSpeed":20,"heavy":6,"SS":0,"coef":2,"HQ":120,"score":null},"expected":{"next":"S","scouting":"not applicable"}},
 {"id":"P-fastest-overrides-sub","node":"P","input":{"fleetSpeed":20,"heavy":2,"SS":1,"coef":2,"HQ":120,"score":0},"expected":{"next":"S","scouting":"not applicable"}},
 {"id":"P-fastplus-overrides-sub","node":"P","input":{"fleetSpeed":15,"heavy":4,"SS":1,"coef":2,"HQ":120,"score":0},"expected":{"next":"S","scouting":"not applicable"}},
 {"id":"P-heavy5-normal-random","node":"P","input":{"fleetSpeed":10,"heavy":5,"SS":0,"coef":2,"HQ":120,"score":80},"expected":"random Q/S; preceding heavy>=5 Q chance"},
 {"id":"P-sub1-normal-random","node":"P","input":{"fleetSpeed":10,"heavy":4,"SS":1,"coef":2,"HQ":120,"score":80},"expected":"random Q/S; preceding SS>=1 Q chance"},
 {"id":"P-ssv1-normal-random","node":"P","input":{"fleetSpeed":10,"heavy":4,"SSV":1,"coef":2,"HQ":120,"score":80},"expected":"random Q/S; preceding SS>=1 Q chance"},
 {"id":"P-as-not-submarine","node":"P","input":{"fleetSpeed":10,"heavy":4,"AS":1,"SS":0,"coef":2,"HQ":120,"score":80},"expected":"S"},
 {"id":"P-fastplus-ssv-exemption-layer-only","node":"P","input":{"fleetSpeed":15,"heavy":4,"SSV":1,"coef":2,"HQ":120,"score":null},"expected":{"next":"S","scouting":"not applicable"}},
 {"id":"P-scouting-unknown-no-exemption","node":"P","input":{"fleetSpeed":10,"heavy":4,"SS":0,"coef":2,"HQ":120,"score":null},"expected":"unknown"},
 {"id":"P-speed-unknown-low-los","node":"P","input":{"fleetSpeed":"unknown","heavy":4,"SS":0,"coef":2,"HQ":120,"score":0},"expected":"unknown"},
 {"id":"P-speed-unknown-fallback-safe","node":"P","input":{"fleetSpeed":"unknown","heavy":4,"SS":0,"coef":2,"HQ":120,"score":80},"expected":"S; every possible speed branch resolves S"},
 {"id":"P-known-low-speed-plus-unknown-speed","node":"P","input":{"knownHullSpeed":5,"otherHullSpeed":"unknown","heavy":4,"SS":0,"coef":2,"HQ":120,"score":72},"expected":"Q; uniform fast+/fastest already impossible"},
 {"id":"P-wrong-coef","node":"P","input":{"fleetSpeed":10,"heavy":4,"SS":0,"coef":4,"HQ":120,"score":80},"expected":"unknown; cannot compare different coefficient"},
 {"id":"P-unknown-hq","node":"P","input":{"fleetSpeed":10,"heavy":4,"SS":0,"coef":2,"HQ":null,"score":null},"expected":"unknown"},
 {"id":"P-fastplus-unknown-los-hq","node":"P","input":{"fleetSpeed":15,"heavy":4,"SS":0,"coef":null,"HQ":null,"score":null},"expected":{"next":"S","scouting":"not applicable"}},
 {"id":"route-canonical-low80","node":"full-BKPS","input":{"types":["BB","BB","CV","CV","CA","CA"],"minSpeed":5,"drumShips":0,"landingShips":0,"coef":2,"score":80},"expected":"BKPS fixed"},
 {"id":"route-cav-alternative-low80","node":"full-BKPS","input":{"types":["BB","BB","CV","CV","CAV","CAV"],"minSpeed":5,"drumShips":0,"landingShips":0,"coef":2,"score":80},"expected":"BKPS fixed"},
 {"id":"route-cl-alternative-low80","node":"full-BKPS","input":{"types":["BB","BB","CV","CV","CAV","CL"],"minSpeed":5,"drumShips":0,"landingShips":0,"coef":2,"score":80},"expected":"BKPS fixed"},
 {"id":"route-heavy3cv1-low80","node":"full-BKPS","input":{"types":["BB","BB","BB","CV","CAV","CAV"],"minSpeed":5,"drumShips":0,"landingShips":0,"coef":2,"score":80},"expected":"BKPS fixed"},
 {"id":"route-dd2-toF","node":"full-BKPS","input":{"types":["BB","BB","CV","CV","DD","DD"],"minSpeed":10,"drumShips":0,"landingShips":0,"coef":2,"score":80},"expected":"not BKPS; B->F"},
 {"id":"route-dd4-upstreamA","node":"full-BKPS","input":{"types":["CA","CL","DD","DD","DD","DD"],"minSpeed":10,"drumShips":0,"landingShips":0,"coef":2,"score":80},"expected":"not BKPS; START->A"},
 {"id":"route-heavy5normal-not-fixed","node":"full-BKPS","input":{"types":["BB","BB","BB","CV","CV","CA"],"minSpeed":10,"drumShips":0,"landingShips":0,"coef":2,"score":80},"expected":"BKPS or BKPQ; not fixed"},
 {"id":"route-heavy5-fastplus","node":"full-BKPS","input":{"types":["BB","BB","BB","CV","CV","CA"],"minSpeed":15,"drumShips":0,"landingShips":0,"coef":2,"score":null},"expected":"BKPS fixed; LOS not applicable"},
 {"id":"route-heavy6-fastest","node":"full-BKPS","input":{"types":["BB","BB","BB","CV","CV","CV"],"minSpeed":20,"drumShips":0,"landingShips":0,"coef":2,"score":null},"expected":"BKPS fixed; LOS not applicable"},
 {"id":"route-known-dd4-unknown-other","node":"full-BKPS","input":{"knownTypes":["DD","DD","DD","DD","CL"],"unknownHulls":1,"minSpeed":"unknown","drumShips":"unknown","landingShips":"unknown","coef":2,"score":null},"expected":"not BKPS; known START->A despite other unknowns"},
 {"id":"route-lha-may-change-heavy4or5","node":"full-BKPS","input":{"types":["BB","BB","CV","CV","LHA","AS"],"minSpeed":10,"drumShips":0,"landingShips":0,"coef":2,"score":80},"expected":"unknown if LHA interpretation changes heavy4 fixed to heavy5 Q chance"},
 {"id":"route-lha-invariant-small-heavy","node":"full-BKPS","input":{"types":["BB","CV","LHA","CA","CL","AS"],"minSpeed":10,"drumShips":0,"landingShips":0,"coef":2,"score":80},"expected":"BKPS fixed across ordinary vs carrier LHA interpretations"},
 {"id":"P-cvl-normal-total5-regular4","node":"P","input":{"fleetSpeed":10,"BB_CV_CVB":4,"CVL":1,"SS":0,"coef":2,"score":80},"expected":{"article":"random Q/S because all-carrier total5","kcwikiLiteral":"S because regular heavy4","consensus":"unknown"}},
 {"id":"P-cvl-fastplus-total6-regular4","node":"P","input":{"fleetSpeed":15,"BB_CV_CVB":4,"CVL":2,"SS":0,"coef":2,"score":80},"expected":{"article":"random Q/S because total6 misses exemption","kcwikiLiteral":"S via fast+ and regular heavy4","consensus":"unknown"}},
 {"id":"P-cvl-fastplus-total5-invariant","node":"P","input":{"fleetSpeed":15,"BB_CV_CVB":4,"CVL":1,"SS":0,"coef":2,"score":null},"expected":{"next":"S","scouting":"not applicable under both source readings"}},
 {"id":"P-cvl-fastest-total6-invariant","node":"P","input":{"fleetSpeed":20,"BB_CV_CVB":4,"CVL":2,"SS":0,"coef":2,"score":null},"expected":{"next":"S","scouting":"not applicable under both source readings"}},
 {"id":"route-cvl-normal-heavy5-ambiguity","node":"full-BKPS","input":{"types":["BB","BB","BB","CV","CVL","CA"],"minSpeed":10,"drumShips":0,"landingShips":0,"coef":2,"score":80},"expected":"unknown; P all-carrier count5 vs KC literal regular count4 changes fixedness"},
 {"id":"route-cvl-fastplus-total6-ambiguity","node":"full-BKPS","input":{"types":["BB","BB","BB","CV","CVL","CVL"],"minSpeed":15,"drumShips":0,"landingShips":0,"coef":2,"score":80},"expected":"unknown; P all-carrier count6 vs KC literal regular count4 changes exemption"}
];

const TYPES={BB:'戦艦',FBB:'高速戦艦',BBV:'航空戦艦',CV:'正規空母',CVB:'装甲空母',CVL:'軽空母',CA:'重巡洋艦',CAV:'航空巡洋艦',CL:'軽巡洋艦',CLT:'重雷装巡洋艦',CT:'練習巡洋艦',DD:'駆逐艦',DE:'海防艦',SS:'潜水艦',SSV:'潜水空母',AS:'潜水母艦',AO:'補給艦',AV:'水上機母艦',LHA:'揚陸艦','?':'?'};
function context(){
 const known=new Map(),metas=new Map([['drum',{name:'ドラム缶(輸送用)',category:'輸送装備'}],['landing',{name:'大発動艇',category:'上陸用舟艇'}],['landing2',{name:'特二式内火艇',category:'特型内火艇'}],['radar',{name:'電探',category:'小型電探'}]]);
 const c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEFind:name=>metas.get(name)||null});
 vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);
 c.data=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['5-5'][0]",c);c.hdFERouteRequirementData=()=>c.data;
 c.hdFERouteShips=p=>p.ships.map(s=>({ship:s,type:s.type,typeKnown:s.type!=='?',speedInfo:{rank:s.rank,known:s.rank!=null,invalid:s.invalid?['invalid fitting']:[],expansionUnconfirmed:!!s.expansionUnknown}}));
 c.hdFEFindShip=name=>known.has(name)?{name,type:known.get(name).type}:null;
 c.hdShipDbSlotProfile=db=>db?{count:6,slots:[1,1,1,1,1,1]}:null;
 c.hdShipDbEquipCompatible=()=>true;c.hdShipDbSlotRejects=(profile,index,meta)=>!!meta.rejected;
 c.hdShipDbExpansionInfo=()=>({allowed:true});c.hdFEExpansionAvailability=()=>({allowed:true,status:'ready'});
 c.hdFEAssigned=()=>[];c.hdFEGameMatch=()=>({status:'ready'});
 c.hdFEScouting=p=>p.score==null?{available:false,status:'manual',detail:'synthetic numeric input missing'}:{available:true,status:'ready',score:p.score,coef:p.coef??2};
 for(const n of ['hdFESpeedLabel','hdFEBranchPredicate','hdFERouteContract','hdFEEquipmentRequirements'])load('fleet-readiness-evaluator.js',n,c);
 function make(types,{rank=10,score=80,coef=2,drums=0,landings=0}={}){
  const ships=types.map((k,i)=>{const name='source-'+k+'-'+i,row={ship:name,type:TYPES[k],items:[],rank:Array.isArray(rank)?rank[i]:rank};if(k!=='?')known.set(name,{name,type:TYPES[k],id:100+i});return row;});
  for(let i=0;i<drums;i++)ships[i].items.push({name:'drum',slotIndex:0});
  for(let i=0;i<landings;i++)ships[i].items.push({name:'landing',slotIndex:ships[i].items.length});
  return {map:'5-5',routeIndex:0,ships,score,coef};
 }
 return {c,make,metas};
}
function fromSource(h,row){
 const i=row.input;let types=[];
 if(i.types)types=[...i.types];
 else if(i.knownTypes)types=[...i.knownTypes,...Array(i.unknownHulls||0).fill('?')];
 else{
  for(const key of Object.keys(TYPES))if(key!=='?'&&Number.isInteger(i[key]))types.push(...Array(i[key]).fill(key));
  if(Number.isInteger(i.CVKnown))types.push(...Array(i.CVKnown).fill('CV'));
  if(Number.isInteger(i.DDKnown))types.push(...Array(i.DDKnown).fill('DD'));
  if(Number.isInteger(i.heavy))types.push(...Array(i.heavy).fill('BB'));
  if(Number.isInteger(i.BB_CV_CVB))types.push(...Array(i.BB_CV_CVB).fill('BB'));
  if(i.otherHullType==='unknown')types.push('?');
 }
 while(types.length<6)types.push('CA');
 let rank=i.minSpeed??i.fleetSpeed??10;if(typeof rank!=='number')rank=null;
 if(i.knownHullSpeed!=null)rank=types.map((_,n)=>n===0?i.knownHullSpeed:null);
 const score=Object.prototype.hasOwnProperty.call(i,'score')?i.score:80;
 return h.make(types,{rank,score,coef:i.coef??2,drums:Number.isInteger(i.drumShips)?i.drumShips:0,landings:i.landingCandidateShips||0});
}
function agree(statuses){return statuses.every(s=>s==='ready')?'ready':statuses.every(s=>s==='missing')?'missing':'manual'}
function expectedStatus(row){
 const e=row.expected;if(e&&typeof e==='object')return e.consensus==='unknown'?'manual':e.next==='S'?'ready':assert.fail('unsupported source expected '+row.id);
 if(e.startsWith('unknown'))return 'manual';
 if(row.node==='START')return e==='B'?'ready':'missing';
 if(row.node==='B')return e==='K'?'ready':'missing';
 if(row.node==='K')return 'ready';
 if(row.node==='P')return e==='S'||e.startsWith('S;')?'ready':'missing';
 return e.startsWith('BKPS fixed')?'ready':'missing';
}
test('5-5 independent source boundaries preserve START, B and higher-priority P fast paths',()=>{
 for(const row of sourceCases){
  const h=context(),p=fromSource(h,row),ships=h.c.hdFERouteShips(p),bp=h.c.data.conditions[4].any[0].all;let status;
  const evaluate=condition=>h.c.hdFEBranchPredicate(condition,ships,p).status;
  if(row.node==='START')status=evaluate({all:h.c.data.conditions.slice(1,4)});
  else if(row.node==='B')status=agree(bp.map(v=>evaluate(v.all[0])));
  else if(row.node==='K'){const source=fs.readFileSync(path.join(root,'map-images.js'),'utf8');vm.runInContext(source.slice(0,source.indexOf('function hdMapEsc2(')),h.c);status=vm.runInContext("HD_MAP_GRAPHS['5-5'].edges.some(([a,b])=>a==='K'&&b==='P')",h.c)?'ready':'missing';}
  else if(row.node==='P')status=agree(bp.map(v=>evaluate({all:[v.all[1],{any:[v.all[1].any[0],{kind:'scoutingValue',min:80,coef:2}]}]})));
  else status=h.c.hdFERouteContract(p).status;
  assert.equal(status,expectedStatus(row),row.id+' '+JSON.stringify(row.expected));
 }
});
test('5-5 landing categories prove only an upper bound, never four definite routing members',()=>{
 const h=context(),p=h.make(['CA','CA','CA','CA','CV','CV'],{landings:3});
 const start=()=>h.c.hdFEBranchPredicate({all:h.c.data.conditions.slice(1,4)},h.c.hdFERouteShips(p),p);
 assert.equal(start().status,'ready');
 p.ships[3].items.push({name:'landing2',slotIndex:0});assert.equal(start().status,'manual');
 p.ships[3].items=[{name:'not-registered',slotIndex:0}];assert.equal(start().status,'manual');
 p.ships[3].items=[];p.ships[0].items.push({name:'landing',slotIndex:1},{name:'landing2',slotIndex:2});assert.equal(start().status,'ready','same hull remains one candidate');
 p.ships[3].items=[{name:'radar',slotIndex:0}];assert.equal(start().status,'ready','radar is not a landing candidate');
 const bound=h.c.hdFEBranchPredicate(h.c.data.conditions[3].any[0],h.c.hdFERouteShips(p),p);assert.match(bound.detail,/候補装備艦 3隻 \/ 上限3隻/);assert.doesNotMatch(bound.detail,/0\/0|landingCandidates|あと/);
 for(let n=0;n<4;n++)p.ships[n].items=[{name:'drum',slotIndex:0}];assert.equal(start().status,'missing','known four drum ships dominate landing membership uncertainty');
});
test('5-5 type, equipment validity and known failure boundaries stay distinct',()=>{
 const h=context();assert.equal(h.c.data.useExampleScope,false);assert.equal(h.c.data.minimumSpeed,undefined);assert.equal(h.c.data.los.checks[0].failBelow,73);
 const invalid=h.make(['BB','BB','CV','CV','CA','CA'],{rank:15,score:0});invalid.ships[0].invalid=true;assert.equal(h.c.hdFERouteContract(invalid).status,'manual');
 const knownSlow=h.make(['BB','BB','CV','CV','CA','?'],{rank:[5,null,null,null,null,null],score:0});assert.equal(h.c.hdFERouteContract(knownSlow).status,'missing','known slow denies exemption, known LOS deficit remains');
 const noSpeedInfo=h.make(['BB','BB','CV','CV','CA','CA'],{rank:null,score:80});assert.equal(h.c.hdFERouteContract(noSpeedInfo).status,'ready','numeric fallback settles every possible speed');
 const scoreUnknown=h.make(['BB','BB','CV','CV','CA','CA'],{rank:15,score:null});assert.equal(h.c.hdFERouteContract(scoreUnknown).status,'ready','confirmed exemption does not need numeric input');
 const e=h.c.data.los.exemptWhen;assert.equal(h.c.hdFEBranchPredicate(e,h.c.hdFERouteShips(scoreUnknown),scoreUnknown).status,'ready');
 assert.ok(h.c.data.los.exemptNote.includes('P→S'));assert.ok(h.c.data.notes.join(' ').includes('73以上80未満'));assert.ok(h.c.data.notes.join(' ').includes('購入必須'));
});
test('5-5 audit keeps the independent 73/80 boundary and ordered exemption contract connected',()=>{
 const h=context(),audit=JSON.parse(fs.readFileSync(path.join(root,'docs/route-goal-guidance-audit.json'),'utf8')),row=audit.rows.find(x=>x.id==='5-5/0/default');
 assert.equal(audit.rows.length,59);assert.equal(row.path,'BKPS');assert.equal(row.verification,'partial');
 // The source literals above precede product execution: <73 is Q, [73,80)
 // random, >=80 S, unless a higher-priority speed branch makes LOS inapplicable.
 assert.equal(row.scouting.coef,2);assert.deepEqual(row.scouting.checks,[{label:'選択経路の索敵分岐',safe:80,failBelow:73}]);
 assert.equal(row.scouting.exemptLabel,'P→S');assert.equal(row.scouting.exemptWhen.any[0].all.length,6);
 for(const condition of row.scouting.exemptWhen.any[0].all){assert.equal(condition.any[0].rank,20);assert.equal(condition.any[1].all[0].rank,15);assert.equal(condition.any[1].all[1].max,5);}
 assert.deepEqual(JSON.parse(JSON.stringify(h.c.data.los)),row.scouting);
 assert.deepEqual(JSON.parse(JSON.stringify(h.c.data.conditions)),row.conditions);
 assert.equal(row.conditions[1].max,3);assert.deepEqual(row.conditions[2].not,{kind:'equipmentShips',match:'drum',min:4,max:7,slotPolicy:'valid'});
 assert.equal(row.conditions[3].any[0].match,'landingCandidates');assert.equal(row.conditions[3].any[0].max,3);assert.equal(row.conditions[3].any[1].kind,'unverified');
 assert.match(row.guidanceAudit['推奨セット'].detail,/利用者指定.*保持/);assert.match(row.guidanceAudit['速力'].detail,/一律必須指定はない/);
});
test('scouting exemption removes only generated LOS guidance and preserves explicit user rows',()=>{
 const h=context(),p=h.make(['BB','BB','CV','CV','CA','CA']);h.c.hdFEScoutingExemption=()=>({status:'ready'});
 const generated={kind:'索敵',generatedFromMap:true,minCount:2},explicit={kind:'索敵',label:'利用者指定の索敵装備',minCount:1};
 assert.equal(h.c.hdFEEquipmentRequirements(p,[generated]).some(x=>x.kind==='索敵'),false);
 const out=h.c.hdFEEquipmentRequirements(p,[generated,explicit]);assert.equal(out.find(x=>x.kind==='索敵').label,explicit.label);assert.equal(out.find(x=>x.kind==='索敵').minCount,1);
});
test('optional P label preserves existing 5-4 default exemption and uncertain text exactly',()=>{
 const h=context();load('fleet-readiness-evaluator.js','hdFEScouting',h.c);load('fleet-readiness-evaluator.js','hdFEPlanScouting',h.c);
 const oldNote='old note';h.c.data={path:'ADEHIJMP',los:{kind:'required',coef:2,checks:[{safe:45}],exemptWhen:{kind:'always'},exemptNote:oldNote}};h.c.hdFEScoutingExemption=()=>({status:'ready'});
 assert.equal(h.c.hdFEScouting({map:'5-4',ships:[]},[]).detail,'ADEHIJMP：M→Pの索敵条件は非適用。old note');
 h.c.data={path:'BKPS',los:{kind:'required',coef:2,checks:[{safe:80}],exemptWhen:{kind:'always'},exemptNote:'new note',exemptLabel:'P→S'}};
 const scouting=h.c.hdFEScouting({map:'5-5',ships:[]},[]);assert.equal(scouting.score,null);assert.equal(scouting.notRequired,true);assert.equal(scouting.available,false);assert.equal(scouting.detail,'BKPS：P→Sの索敵条件は非適用。new note');
 h.c.hdFEScouting=()=>({available:true,status:'partial',checks:[{score:0,status:'missing',safe:45}],score:0});h.c.hdFEScoutingExemption=()=>({status:'manual'});h.c.data={path:'ADEHIJMP',los:{kind:'required'}};
 assert.equal(h.c.hdFEPlanScouting({map:'5-4'},[]).detail,'M→Pの高速＋以上統一による索敵免除は未確認。索敵安全域も未充足のため、この分岐は未判定です。速力・装備可否・索敵情報を確認してください。');
 h.c.data.los.exemptUnknownNote='P→S uncertain';assert.equal(h.c.hdFEPlanScouting({map:'5-5'},[]).detail,'P→S uncertain');
});
