const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
function app(){
 const values=new Map(),c={document:{addEventListener(){}},window:{addEventListener(){},dispatchEvent(){}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},CustomEvent:class{},hdEsc:s=>String(s)};
 vm.createContext(c);for(const f of ['map-air-data.js','enemy-anti-air-data.js','enemy-anti-air.js','map-air-check.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),c);return src=>JSON.parse(JSON.stringify(vm.runInContext(src,c)));
}
test('AA audit covers all original patterns and preserves typed uncertain formations',()=>{
 const run=app(),r=run(`(()=>{const nodes=Object.values(HD_MAP_AIR_DATA).flatMap(s=>Object.values(s.nodes)),patterns=nodes.flatMap(n=>n.patterns);return {nodes:nodes.length,patterns:patterns.length,typed:patterns.every(p=>Array.isArray(p.formations)&&p.formations.length&&p.formations.every(f=>typeof f==='string')),first:HD_MAP_AIR_DATA['1-1'].nodes.A.patterns[0].formations,ships:Object.values(HD_ENEMY_AA_DATA.ships).every(s=>!s.known||Number.isInteger(s.weighted)&&Number.isInteger(s.bonus)&&s.ids.length)}})()`);
 assert.equal(r.nodes,300);assert.equal(r.patterns,1259);assert.equal(r.typed,true);assert.deepEqual(r.first,['単縦陣']);assert.equal(r.ships,true);
});
test('enemy formula clips ordinary bomber losses and never adds friendly +1 guarantee',()=>{
 const run=app(),r=run(`(()=>{const target={known:true,applicable:true,affected:1,maxWeighted:92,maxFleet:12},rows=[{category:'艦上爆撃機',slot:18},{category:'艦上戦闘機',slot:18},{category:'水上戦闘機',slot:4}],before=JSON.stringify(rows),loss=hdEnemyAALossBounds(rows,target,r=>r.slot);return {loss,unchanged:before===JSON.stringify(rows),zero:hdEnemyAALossBounds([{category:'艦上爆撃機',slot:1}],{...target,maxWeighted:0,maxFleet:0},r=>r.slot)}})()`);
 assert.equal(r.loss.maxLost,13);assert.deepEqual(r.loss.worstRows.map(r=>r.slot),[5,18,4]);assert.deepEqual(r.loss.bestRows.map(r=>r.slot),[18,18,4]);assert.equal(r.zero.maxLost,0);assert.equal(r.unchanged,true);
});
test('unregistered enemy data are irrelevant for fighters night submarine and raids',()=>{
 const run=app(),r=run(`['G','J','B'].map(id=>hdEnemyAATarget('6-5',id,[{category:'艦上爆撃機',slot:18}])).concat(hdEnemyAATarget('6-4','H',[{category:'艦上戦闘機',slot:18}]))`);
 assert.equal(r.every(t=>t.known&&!t.applicable&&t.maxWeighted===0),true);
});
test('known Tsu defensive equipment and listed formations drive maximum model',()=>{
 const run=app(),r=run(`(()=>{HD_MAP_AIR_DATA['99-3']={nodes:{A:{label:'A 通常戦',patterns:[{name:'パターン1',enemy:'軽巡ツ級elite、駆逐イ級',air:0,formations:['単縦陣','輪形陣']}]}}};return hdEnemyAATarget('99-3','A')})()`);
 assert.equal(r.known,true);assert.equal(r.maxWeighted,92);assert.equal(r.maxFleet,18);
});
test('unconfirmed enemy formation CI jet and combined fleet stay unknown',()=>{
 const run=app(),r=run(`(()=>{HD_MAP_AIR_DATA['99-4']={nodes:{A:{label:'通常戦',patterns:[{name:'パターン1',enemy:'駆逐イ級',air:0}]},B:{label:'通常戦',patterns:[{name:'パターン1',enemy:'砲台小鬼',air:0,formations:['単縦陣']}]},C:{label:'通常戦',patterns:[{name:'パターン1',enemy:Array(12).fill('駆逐イ級').join('、'),air:0,formations:['輪形陣']}]}}};return [hdEnemyAATarget('99-4','A'),hdEnemyAATarget('99-4','B'),hdEnemyAATarget('99-4','C'),hdEnemyAATarget('1-4','L',[{category:'噴式戦闘爆撃機',slot:18}])]})()`);
 assert.equal(r.every(t=>!t.known),true);assert.match(r[0].reason,/陣形/);assert.match(r[1].reason,/カットイン/);assert.match(r[2].reason,/連合/);assert.match(r[3].reason,/噴式/);
});
test('same-pattern references resolve only unique rosters and reject cycles',()=>{
 const run=app(),r=run(`(()=>{const p={name:'パターン3',enemy:'パターン2と同じ'},a={patterns:[{name:'パターン2',enemy:'駆逐イ級'},p]},b={patterns:[{name:'パターン2',enemy:'駆逐イ級'},{name:'パターン2 低司令部',enemy:'駆逐ロ級'},p]},c={patterns:[{name:'パターン2',enemy:'パターン3と同じ'},p]};return [hdEnemyAARoster(a,p),hdEnemyAARoster(b,p),hdEnemyAARoster(c,p),hdEnemyAATarget('1-4','H')]})()`);
 assert.equal(r[0],'駆逐イ級');assert.equal(r[1],'');assert.equal(r[2],'');assert.equal(r[3].known,true);
});
test('cumulative stage two losses persist and preserve dead slot identity',()=>{
 const run=app(),r=run(`(()=>{HD_MAP_AIR_DATA['99-5']={nodes:Object.fromEntries(['A','B'].map(id=>[id,{label:'通常戦',patterns:[{name:'パターン1',enemy:'軽巡ツ級elite',air:0,formations:['単縦陣']}]}]))};hdMapAirSave('99-5','A',true);hdMapAirSave('99-5','B',true);hdMapAirConfirmOrder('99-5');return hdMapAirRouteLoss('99-5',[{name:'水爆',category:'水上爆撃機',slot:4},{name:'艦戦',category:'艦上戦闘機',slot:20}],r=>r.slot)})()`);
 assert.equal(r.stage2Complete,true);assert.equal(r.stage2MaxLost,4);assert.equal(r.lower,18);assert.equal(r.upper,24);assert.deepEqual(r.slotResults.map(s=>[s.name,s.min,s.max]),[['水爆',0,4],['艦戦',18,20]]);assert.equal(r.steps[1].antiAir.applicable,true);assert.equal(r.steps[1].antiAir.maxLost,0);
});
test('survival in the small-loss path still requires later enemy AA data',()=>{
 const run=app(),r=run(`(()=>{HD_MAP_AIR_DATA['99-10']={nodes:{A:{label:'通常戦',patterns:[{name:'パターン1',enemy:'軽巡ツ級elite',air:0,formations:['単縦陣']}]},B:{label:'通常戦',patterns:[{name:'パターン1',enemy:'未登録の敵',air:0,formations:['単縦陣']}]}}};hdMapAirSave('99-10','A',true);hdMapAirSave('99-10','B',true);hdMapAirConfirmOrder('99-10');return hdMapAirRouteLoss('99-10',[{category:'水上爆撃機',slot:4}],r=>r.slot)})()`);
 assert.equal(r.lower,0);assert.equal(r.upper,4);assert.equal(r.stage2Complete,false);assert.match(r.stage2Missing.join('/'),/B：.*未登録の敵/);
});
test('partial route model exposes missing data without claiming goal fulfilment',()=>{
 const run=app(),r=run(`(()=>{HD_MAP_AIR_DATA['99-6']={nodes:{A:{label:'通常戦',patterns:[{name:'パターン1',enemy:'未登録の敵',air:0,formations:['単縦陣']}]}}};hdMapAirSave('99-6','A',true);hdMapAirConfirmOrder('99-6');const loss=hdMapAirRouteLoss('99-6',[{category:'艦上爆撃機',slot:18}],r=>r.slot);return {loss,html:hdMapAirRouteHtml('99-6',loss)}})()`);
 assert.equal(r.loss.known,true);assert.equal(r.loss.stage2Complete,false);assert.match(r.loss.stage2Missing[0],/未登録の敵/);assert.match(r.html,/充足は未判定/);assert.doesNotMatch(r.html,/このモデル内では目標値以上/);
});
test('second aviation round begins with previous AA losses and raid has no enemy AA',()=>{
 const run=app(),r=run(`(()=>{HD_MAP_AIR_DATA['99-7']={nodes:{A:{label:'A 航空戦',patterns:[{name:'パターン1',enemy:'軽巡ツ級elite',air:0,formations:['単縦陣']}]},B:{label:'B 空襲戦',patterns:[{name:'パターン1',enemy:'軽巡ツ級elite',air:0,formations:['単縦陣']}]}}};hdMapAirSave('99-7','A',true);hdMapAirSave('99-7','B',true);hdMapAirConfirmOrder('99-7');return hdMapAirRouteLoss('99-7',[{category:'艦上爆撃機',slot:40}],r=>r.slot)})()`);
 assert.deepEqual(r.steps.map(s=>s.round),[1,2,1]);assert.equal(r.steps[0].afterLower,21);assert.equal(r.steps[1].beforeLower,21);assert.equal(r.steps[1].afterLower,7);assert.equal(r.steps[2].afterLower,7);assert.equal(r.steps[2].antiAir.applicable,false);
});
test('malformed slot or enemy coefficients do not produce known losses',()=>{
 const run=app(),r=run(`[hdEnemyAALossBounds([{category:'艦上爆撃機',slot:100}],{known:true,maxWeighted:92,maxFleet:12},r=>r.slot),hdEnemyAALossBounds([{category:'艦上爆撃機',slot:20}],{known:true,maxWeighted:null,maxFleet:12},r=>r.slot)]`);assert.deepEqual(r,[null,null]);
});
test('evasion floors both enemy coefficients before proportional and fixed losses',()=>{
 const run=app(),r=run(`(()=>{const rows=[{name:'零戦62型(爆戦／岩井隊)',category:'艦上爆撃機',slot:18},{name:'彗星(江草隊)',category:'艦上爆撃機',slot:18},{name:'瑞雲改二(六三四空／熟練)',category:'水上爆撃機',slot:18},{name:'彗星',category:'艦上爆撃機',slot:18}],before=JSON.stringify(rows),loss=hdEnemyAALossBounds(rows,{known:true,applicable:true,maxWeighted:92,maxFleet:12},r=>r.slot);return {loss,unchanged:before===JSON.stringify(rows)}})()`);
 assert.deepEqual(r.loss.worstRows.map(x=>x.slot),[11,11,12,5]);assert.deepEqual(r.loss.shots.map(x=>[x.weighted,x.fleet,x.lost]),[[55,8,7],[55,8,7],[46,6,6],[92,12,13]]);assert.equal(r.unchanged,true);
});
test('strict aircraft names and categories reject misleading evasion labels',()=>{
 const run=app(),r=run(`[{name:'彗星(江草隊)改',category:'艦上爆撃機'},{name:'彗星(江草隊)',category:'水上爆撃機'},{name:'彗星(江草隊)',category:'艦上爆撃機',meta:{name:'彗星'}},{meta:{name:'零戦62型(爆戦／岩井隊)',category:'艦上爆撃機'}},{name:'瑞雲改二（六三四空／熟練）',category:'水上爆撃機'}].map(hdEnemyAAEvasion)`);
 assert.deepEqual(r.map(x=>x.registered),[false,false,false,true,true]);assert.equal(r[0].weightedPercent,100);assert.equal(r[4].fleetPercent,50);
});
test('all registered aircraft match pinned master identity and reduce no loss below zero',()=>{
 const run=app(),entries=run('Object.values(HD_AIRCRAFT_AA_EVASION_DATA.aircraft)'),master=JSON.parse(fs.readFileSync(path.join(__dirname,'../ship-master-snapshot.js'),'utf8').split('window.HD_KANCOLLE_MASTER_SNAPSHOT=')[1].trim().replace(/;$/,''));
 assert.equal(entries.length,30);for(const e of entries){assert.equal(master.equipment[e.name].id,e.id);assert.equal(master.equipment[e.name].typeName,e.category)}
 const r=run(`Object.values(HD_AIRCRAFT_AA_EVASION_DATA.aircraft).every(e=>Array.from({length:100},(_,slot)=>{const row={name:e.name,category:e.category,slot},target={known:true,applicable:true,maxWeighted:92,maxFleet:12},a=hdEnemyAALossBounds([row],target,r=>r.slot),b=hdEnemyAALossBounds([{...row,name:'未登録機'}],target,r=>r.slot);return a.maxLost<=b.maxLost&&a.worstRows[0].slot>=0}).every(Boolean))`);assert.equal(r,true);
});
test('registered evasion persists through a route and appears beside residual slots',()=>{
 const run=app(),r=run(`(()=>{HD_MAP_AIR_DATA['99-11']={nodes:Object.fromEntries(['A','B'].map(id=>[id,{label:'通常戦',patterns:[{name:'パターン1',enemy:'軽巡ツ級elite',air:0,formations:['単縦陣']}]}]))};for(const id of ['A','B'])hdMapAirSave('99-11',id,true);hdMapAirConfirmOrder('99-11');const rows=[{name:'瑞雲改二(六三四空／熟練)',category:'水上爆撃機',slot:18}],loss=hdMapAirRouteLoss('99-11',rows,r=>r.slot),plain=hdMapAirRouteLoss('99-11',[{...rows[0],name:'未登録機'}],r=>r.slot);return {loss,plain,html:hdMapAirRouteHtml('99-11',loss)}})()`);
 assert.equal(r.loss.lower,7);assert.equal(r.plain.lower,0);assert.equal(r.loss.slotResults[0].evasion.registered,true);assert.match(r.html,/射撃回避：加重×0.5・防空×0.5/);assert.doesNotMatch(r.html,/射撃回避補正なし/);
});
