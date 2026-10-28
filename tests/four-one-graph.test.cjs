'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Topology transcribed independently from the source map at original800x480.
// An edge is not a guarantee that a given fleet follows it.
const expected=[['S','A'],['S','C'],['A','B'],['B','D'],['C','E'],['C','F'],['F','D'],['F','H'],['D','G'],['D','H'],['G','J'],['H','I'],['H','J']];
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}}});vm.runInContext(fs.readFileSync(path.join(root,'map-images.js'),'utf8'),c);vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['4-1']",c);return c;}
const edgeKeys=rows=>Array.from(rows,e=>e.join('>')).sort();
test('4-1 structural graph has the thirteen source connections and no fabricated terminal exits',()=>{
 const c=context(),g=c.graph;assert.deepEqual(edgeKeys(g.edges),edgeKeys(expected));assert.equal(new Set(edgeKeys(g.edges)).size,13);assert.deepEqual(Array.from(c.hdMapStartLabels(g)),['S']);
 for(const terminal of ['E','I','J'])assert.equal(g.edges.some(e=>e[0]===terminal),false,terminal+' is terminal');
});
test('4-1 structural guide marks J boss, D submarine battle, B resource and F/I noncombat',()=>{
 const c=context(),g=c.graph;assert.equal(g.boss,'J');
 for(const [node,kind]of Object.entries({S:'start',A:'normal',B:'item',C:'normal',D:'sub',E:'normal',F:'safe',G:'normal',H:'normal',I:'safe',J:'boss'}))assert.equal(c.hdMapKind(g,node),kind,node);
});
test('both registered random-start alternatives join at D and end at the actual boss J',()=>{
 const c=context();assert.equal(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['4-1'][0].path",c),'CFDGJ / ABDGJ');
 for(const path of ['CFDGJ','ABDGJ']){const route=['S',...path];for(let i=1;i<route.length;i++)assert.ok(c.graph.edges.some(e=>e[0]===route[i-1]&&e[1]===route[i]),route[i-1]+'→'+route[i]);assert.equal(route.at(-1),c.graph.boss);}
});
