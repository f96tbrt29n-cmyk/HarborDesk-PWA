'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Independently transcribed from the registered source map at original800x480
// and the ordered branch table. Edges express topology, not fixed routing.
const expected=[['S','A'],['S','B'],['S','D'],['A','C'],['B','H'],['C','B'],['C','E'],['C','F'],['D','H'],['E','G'],['F','G'],['F','I'],['F','J'],['F','M'],['G','J'],['H','G'],['H','L'],['J','P'],['L','J'],['L','N'],['L','O'],['M','K'],['M','P'],['N','P']];
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}}});vm.runInContext(fs.readFileSync(path.join(root,'map-images.js'),'utf8'),c);vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['3-4']",c);return c;}
const edgeKeys=rows=>Array.from(rows,e=>e.join('>')).sort();
test('3-4 structural graph matches all visible source edges without legacy shortcuts or fabricated terminal exits',()=>{
 const c=context(),g=c.graph;assert.deepEqual(edgeKeys(g.edges),edgeKeys(expected));assert.equal(new Set(edgeKeys(g.edges)).size,expected.length);
 assert.deepEqual(Array.from(c.hdMapStartLabels(g)),['S']);
 for(const terminal of ['I','K','O','P'])assert.equal(g.edges.some(e=>e[0]===terminal),false,terminal+' has no outgoing edge in the source map');
});
test('3-4 structural guide marks P boss, both whirlpools, item nodes and noncombat nodes correctly',()=>{
 const c=context(),g=c.graph;assert.equal(g.boss,'P');
 const kinds={S:'start',A:'normal',B:'normal',C:'normal',D:'vortex',E:'item',F:'vortex',G:'normal',H:'normal',I:'safe',J:'safe',K:'item',L:'safe',M:'normal',N:'normal',O:'item',P:'boss'};
 for(const [node,kind]of Object.entries(kinds))assert.equal(c.hdMapKind(g,node),kind,node);
});
test('registered ACEGJP is an actual ordered graph path ending at the source boss, not a generated shortcut',()=>{
 const c=context(),p=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['3-4'][0].path",c);assert.equal(p,'ACEGJP');
 const route=['S',...'ACEGJP'];for(let i=1;i<route.length;i++)assert.ok(c.graph.edges.some(e=>e[0]===route[i-1]&&e[1]===route[i]),route[i-1]+'→'+route[i]);
 assert.equal(route.at(-1),c.graph.boss);
});
