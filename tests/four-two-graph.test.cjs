'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Independently transcribed from the original800x480 source image. These are
// possible connections, not an assertion that every fleet follows each edge.
const expected=[['S','A'],['S','B'],['A','C'],['A','E'],['B','D'],['C','G'],['C','L'],['D','C'],['D','H'],['E','G'],['F','J'],['G','F'],['G','I'],['G','L'],['H','G'],['H','K']];
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}}});vm.runInContext(fs.readFileSync(path.join(root,'map-images.js'),'utf8'),c);vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['4-2']",c);return c;}
const keys=rows=>Array.from(rows,e=>e.join('>')).sort();
test('4-2 structural graph has all sixteen source connections and no fabricated terminal exits',()=>{
 const c=context(),g=c.graph;assert.deepEqual(keys(g.edges),keys(expected));assert.equal(new Set(keys(g.edges)).size,16);assert.deepEqual(Array.from(c.hdMapStartLabels(g)),['S']);for(const terminal of ['I','J','K','L'])assert.equal(g.edges.some(e=>e[0]===terminal),false,terminal);
});
test('4-2 guide identifies L boss, submarine opponents, safe and item nodes without changing B consumption rules',()=>{
 const c=context(),g=c.graph;for(const [node,kind]of Object.entries({S:'start',A:'normal',B:'sub',C:'normal',D:'normal',E:'normal',F:'safe',G:'normal',H:'sub',I:'safe',J:'item',K:'item',L:'boss'}))assert.equal(c.hdMapKind(g,node),kind,node);
 // The diagram category describes the opposing fleet; the note explicitly
 // preserves B's normal-battle consumption instead of equating it with H.
 assert.ok(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['4-2'][0].notes.join(' / ')",c).includes('通常戦闘扱いの燃料・弾薬消費'));
});
test('both registered paths join at C and end at L; the B path has one extra opposing-submarine battle',()=>{
 const c=context();for(const index of [0,1])assert.equal(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['4-2']["+index+"].path",c),'ACL / BDCL');
 for(const path of ['ACL','BDCL']){const route=['S',...path];for(let i=1;i<route.length;i++)assert.ok(c.graph.edges.some(e=>e[0]===route[i-1]&&e[1]===route[i]),route[i-1]+'→'+route[i]);assert.equal(route.at(-1),c.graph.boss);assert.equal([...path].filter(n=>c.graph.sub.includes(n)).length,path==='ACL'?0:1);}
});
