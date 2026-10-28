'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Independently transcribed from the registered source map image. These are
// structural arrows, not a proof of every fleet's route or battle outcome.
const expected=[['S','A'],['S','B'],['A','D'],['B','C'],['B','E'],['C','F'],['D','E'],['E','G'],['F','G'],['F','H'],['F','J'],['G','I'],['G','J']];
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}}});for(const f of ['map-images.js','map-plans.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['5-1']",c);return c;}
const keys=rows=>Array.from(rows,e=>e.join('>')).sort();
test('5-1 graph matches thirteen source arrows and retains the boss J and non-boss terminals',()=>{
 const c=context();assert.deepEqual(keys(c.graph.edges),keys(expected));assert.equal(new Set(keys(c.graph.edges)).size,13);assert.deepEqual(Array.from(c.hdMapStartLabels(c.graph)),['S']);assert.equal(c.graph.boss,'J');for(const node of ['H','I','J'])assert.equal(c.graph.edges.some(e=>e[0]===node),false,node);
});
test('5-1 node kinds distinguish the whirlpool, resources and submarine battle from ordinary day battles',()=>{
 const c=context();for(const [node,kind]of Object.entries({S:'start',A:'vortex',B:'normal',C:'item',D:'normal',E:'sub',F:'normal',G:'normal',H:'item',I:'safe',J:'boss'}))assert.equal(c.hdMapKind(c.graph,node),kind,node);assert.equal((c.graph.night||[]).length,0,'F/G are ordinary battles rather than night nodes');
});
test('the registered BCFJ route exists without inventing exits from H/I to the boss',()=>{
 const c=context();assert.equal(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['5-1'][0].path",c),'BCFJ');const nodes=['S',...'BCFJ'];for(let i=1;i<nodes.length;i++)assert.ok(c.graph.edges.some(e=>e[0]===nodes[i-1]&&e[1]===nodes[i]),nodes[i-1]+'→'+nodes[i]);for(const node of ['H','I'])assert.equal(c.graph.edges.some(e=>e[0]===node&&e[1]==='J'),false,node+'→J');
});
