'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Independently transcribed from the registered source image at 800×480.
// An edge describes topology, not arbitrary selection by a fleet.
const expected=[['S','A'],['S','B'],['A','E'],['B','A'],['B','D'],['B','F'],['D','E'],['E','C'],['E','G'],['E','I'],['F','H'],['F','I'],['G','C'],['G','I'],['G','J'],['I','H'],['I','K']];
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}}});vm.runInContext(fs.readFileSync(path.join(root,'map-images.js'),'utf8'),c);vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['4-4']",c);return c;}
const keys=rows=>Array.from(rows,e=>e.join('>')).sort();
test('4-4 structural graph matches all seventeen source arrows without fabricated terminal exits',()=>{
 const c=context();assert.deepEqual(keys(c.graph.edges),keys(expected));assert.equal(new Set(keys(c.graph.edges)).size,17);assert.deepEqual(Array.from(c.hdMapStartLabels(c.graph)),['S']);for(const terminal of ['C','H','J','K'])assert.equal(c.graph.edges.some(e=>e[0]===terminal),false,terminal);
});
test('4-4 guide distinguishes E submarine battle and D whirlpool from the normal H dead end',()=>{
 const c=context();for(const [node,kind]of Object.entries({S:'start',A:'normal',B:'normal',C:'item',D:'vortex',E:'sub',F:'normal',G:'normal',H:'normal',I:'normal',J:'item',K:'boss'}))assert.equal(c.hdMapKind(c.graph,node),kind,node);assert.equal(c.graph.boss,'K');
});
test('the registered AEIK path exists in order, while B and F alternatives are not silently shortened',()=>{
 const c=context();assert.equal(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['4-4'][0].path",c),'AEIK');const route=['S',...'AEIK'];for(let i=1;i<route.length;i++)assert.ok(c.graph.edges.some(e=>e[0]===route[i-1]&&e[1]===route[i]),route[i-1]+'→'+route[i]);assert.equal(c.graph.edges.some(e=>e[0]==='A'&&e[1]==='B'),false);assert.equal(c.graph.edges.some(e=>e[0]==='D'&&e[1]==='F'),false);
});
