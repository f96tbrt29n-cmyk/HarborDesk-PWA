'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../owned-equipment-planner.js'),'utf8');
function load(name,c){const start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',start+1);assert.ok(start>=0,name);vm.runInNewContext(source.slice(start,end<0?undefined:end),c);return c[name]}
function context(){const c={hdFEEsc:String,hdPLSave(){}};for(const n of ['hdOCSouthScouting','hdOCScoutingOptional','hdOCPlacementHtml','hdOCStockGap','hdOCProcurementHtml'])load(n,c);return c}
const south={map:'3-5',index:0};
const goal={kind:'索敵',goalKind:'索敵',generatedFromMap:true,purpose:'recommendation',minCount:2,owned:0,usableOwned:0,compatibleSlots:18,blocked:[],candidates:['radar']};
test('optional count is scoped to generated FGK recommendation, never a numeric route requirement',()=>{
 const c=context();assert.equal(c.hdOCScoutingOptional(south,goal),true);
 for(const [where,g] of [[{map:'3-5',index:1},goal],[{map:'2-5',index:0},goal],[south,{...goal,generatedFromMap:false}],[south,{...goal,purpose:'route'}],[south,{...goal,goalKind:'los-value'}]])assert.equal(c.hdOCScoutingOptional(where,g),false);
 assert.match(c.hdOCPlacementHtml(goal,south),/経路に必要な個数や確定調達数ではありません/);assert.doesNotMatch(c.hdOCPlacementHtml(goal,south),/あと 2個必要/);
 assert.match(c.hdOCProcurementHtml(goal,0,'',south),/任意目安の候補2個/);assert.match(c.hdOCProcurementHtml(goal,0,'',{map:'1-1',index:0}),/候補をあと2個/);
});
test('numeric gap and unknown still cannot become procurement quantity',()=>{
 const c=context();assert.equal(c.hdOCStockGap({...goal,goalKind:'los-value',shortfall:48,minCount:28}),0);assert.equal(c.hdOCStockGap({...goal,unresolved:true}),0);
 assert.equal(c.hdOCProcurementHtml({...goal,goalKind:'los-value'},0,'',south),'');
});
test('owned inspection list separates stack counts, compatibility and unknown bonus; never evaluates or mutates a plan',()=>{
 const c=context(),plan={ships:[{ship:'hull'}]},inventory=[{name:'radar',key:'r0',count:3,star:0,item:{stats:{索敵:5}}},{name:'blocked',key:'b4',count:1,star:4,item:{stats:{索敵:7}}}],slots=[{si:0,index:2}];
 c.hdOCBuild=()=>({inventory,slots,unknown:[]});c.hdFOAssignedUsage=()=>({r0:2});c.hdOCCompatible=(slot,x)=>x.key==='r0';const render=load('hdOCScoutingOptionsHtml',c),before=JSON.stringify({plan,inventory,slots}),html=render(south,{plan});
 assert.match(html,/登録3個 \/ 現在案2個 \/ 未使用1個/);assert.match(html,/通常3/);assert.match(html,/blocked ★4/);assert.match(html,/確認済み枠には搭載できません/);assert.match(html,/交換後の索敵値は未計算/);assert.match(html,/同期なしでも検討を続けられます/);assert.equal(JSON.stringify({plan,inventory,slots}),before);assert.equal(render({map:'3-5',index:1},{plan}),'');
});
test('bounded display and missing information never claim exhaustive impossibility',()=>{
 const c=context();c.hdOCBuild=()=>({inventory:[],slots:[],unknown:['profile']});c.hdFOAssignedUsage=()=>({});c.hdOCCompatible=()=>true;const render=load('hdOCScoutingOptionsHtml',c),result={plan:{ships:[]}};
 assert.match(render(south,result),/手持ちでは不可能という判定ではありません/);assert.match(render(south,result),/搭載可否を未確認/);
 c.hdOCBuild=()=>({inventory:Array.from({length:13},(_,i)=>({name:'item'+i,key:''+i,count:1,item:{stats:{索敵:1}}})),slots:[],unknown:[]});const html=render(south,result);assert.match(html,/表示は12種類まで（残り1種類）/);assert.doesNotMatch(html,/item12/);
});
