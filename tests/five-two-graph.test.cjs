'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Read independently from the registered article's original map. A drawn edge
// establishes connectivity, not the fleet predicate or random branch outcome.
const expected=[['S','A'],['S','B'],['A','B'],['B','C'],['C','D'],['C','E'],['D','F'],['D','G'],['E','F'],['F','H'],['F','I'],['F','O'],['G','J'],['G','L'],['I','K'],['I','L'],['J','L'],['K','O'],['L','K'],['L','M'],['L','N'],['M','K']];
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}},HD_NODE_DETAIL_OVERRIDES:{}});for(const f of ['map-images.js','map-plans.js','map-node-data-2-7.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['5-2']",c);return c;}
const keys=rows=>Array.from(rows,e=>e.join('>')).sort();
test('5-2 structure follows twenty-two source arrows, boss O and the non-boss terminals',()=>{
 const c=context();assert.deepEqual(keys(c.graph.edges),keys(expected));assert.equal(new Set(keys(c.graph.edges)).size,22);assert.deepEqual(Array.from(c.hdMapStartLabels(c.graph)),['S']);assert.equal(c.graph.boss,'O');for(const node of ['H','N','O'])assert.equal(c.graph.edges.some(e=>e[0]===node),false,node);
});
test('5-2 node kinds separate aerial combat, resources and whirlpools from ordinary and mixed battles',()=>{
 const c=context();for(const [node,kind]of Object.entries({S:'start',A:'vortex',B:'safe',C:'air',D:'normal',E:'normal',F:'normal',G:'item',H:'safe',I:'normal',J:'item',K:'normal',L:'air',M:'vortex',N:'safe',O:'boss'}))assert.equal(c.hdMapKind(c.graph,node),kind,node);assert.equal((c.graph.night||[]).length,0);assert.equal((c.graph.sub||[]).length,0,'D has mixed surface/submarine patterns rather than a pure ASW battle');
});
test('registered BCEFO has the source connections without the old F to G boss shortcut',()=>{
 const c=context();assert.equal(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['5-2'][0].path",c),'BCEFO');const nodes=['S',...'BCEFO'];for(let i=1;i<nodes.length;i++)assert.ok(c.graph.edges.some(e=>e[0]===nodes[i-1]&&e[1]===nodes[i]),nodes[i-1]+'→'+nodes[i]);assert.equal(c.graph.edges.some(e=>e[0]==='F'&&e[1]==='G'),false);assert.deepEqual(Array.from(c.graph.edges.filter(e=>e[0]==='E'),e=>e[1]),['F']);
});
test('visible 5-2 node notes place scouting at F and resources at G rather than the old boss label',()=>{
 const c=context(),notes=c.HD_NODE_DETAIL_OVERRIDES['5-2'];assert.match(notes.C.enemy,/空襲戦/);assert.match(notes.C.branch,/索敵分岐はCではなくF/);assert.match(notes.F.branch,/33式係数2/);assert.match(notes.F.branch,/70以上/);assert.match(notes.G.enemy,/弾薬の資源/);assert.match(notes.O.enemy,/^ボス/);assert.match(notes.D.enemy,/混在編成/);assert.match(notes.L.branch,/未確認/);
});
