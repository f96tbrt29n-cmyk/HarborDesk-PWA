'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Independently read from the registered 6-1 map, not from product output.
// Connections do not prove fleet conditions, random outcomes or victory.
const expected=[['START','A'],['START','B'],['START','C'],['A','D'],['A','F'],['B','C'],['C','F'],['D','F'],['F','G'],['G','H'],['G','I'],['H','E'],['H','J'],['H','K']];
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}},HD_NODE_DETAIL_OVERRIDES:{},MAP_DETAILS:{}});for(const f of ['map-images.js','map-node-data-2-7.js','map-details-57.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['6-1']",c);return c;}
const keys=rows=>Array.from(rows,e=>e.join('>')).sort();
test('6-1 graph preserves fourteen source edges, a distinct start and boss K',()=>{
 const c=context();assert.deepEqual(keys(c.graph.edges),keys(expected));assert.equal(new Set(keys(c.graph.edges)).size,14);assert.deepEqual(Array.from(c.hdMapStartLabels(c.graph)),['START']);assert.equal(c.graph.boss,'K');
 for(const node of ['E','I','J','K'])assert.equal(c.graph.edges.some(e=>e[0]===node),false,node+' is terminal');
 for(const [from,to]of [['A','C'],['B','D'],['C','E'],['D','E'],['E','F'],['E','G'],['F','K'],['G','K']])assert.equal(c.graph.edges.some(e=>e[0]===from&&e[1]===to),false,from+'→'+to+' is not a source connection');
});
test('6-1 node kinds keep A/G noncombat and F/H daytime battles without inventing a new green-node kind',()=>{
 const c=context();for(const [node,kind]of Object.entries({START:'start',A:'safe',B:'safe',C:'normal',D:'normal',E:'safe',F:'normal',G:'safe',H:'normal',I:'normal',J:'normal',K:'boss'}))assert.equal(c.hdMapKind(c.graph,node),kind,node);
 for(const node of ['A','B','E','G'])assert.match(c.HD_NODE_DETAIL_OVERRIDES['6-1'][node].enemy,/戦闘なし/);
 for(const node of ['F','H'])assert.match(c.HD_NODE_DETAIL_OVERRIDES['6-1'][node].enemy,/通常戦/);
});
test('6-1 selected AFGHK follows the source edges without F-to-K or G-to-K shortcuts',()=>{
 const c=context(),nodes=['START',...'AFGHK'];for(let i=1;i<nodes.length;i++)assert.ok(c.graph.edges.some(e=>e[0]===nodes[i-1]&&e[1]===nodes[i]),nodes[i-1]+'→'+nodes[i]);
 assert.deepEqual(Array.from(c.graph.edges.filter(e=>e[0]==='G'),e=>e[1]).sort(),['H','I']);assert.deepEqual(Array.from(c.graph.edges.filter(e=>e[0]==='H'),e=>e[1]).sort(),['E','J','K']);
});
test('6-1 notes distinguish AFGHK, earlier G/H scouting, random exits and battle recommendations',()=>{
 const c=context(),notes=c.HD_NODE_DETAIL_OVERRIDES['6-1'],details=c.MAP_DETAILS['6-1'];
 assert.match(notes.A.branch,/潜水母艦1隻以上でF/);assert.match(notes.A.branch,/AS.*SS\/SSV.*別艦種/);assert.match(notes.F.branch,/Gへ接続/);assert.match(notes.G.branch,/係数4・16以上でH/);assert.match(notes.G.branch,/ちょうど12.*出典表記差/);
 for(const text of ['25以上でK','20以上25未満はE/Kランダム','20未満はE','潜水母艦なし'])assert.ok(notes.H.branch.includes(text),text);
 assert.match(notes.K.branch,/K自身ではなく到達前のG\/H/);assert.match(notes.K.enemy,/ボス（通常戦）/);assert.match(details.overview,/A非戦闘→F通常戦→G非戦闘\/索敵→H通常戦→Kボス/);
 assert.match(details.fleet,/空母入りCFGHKは別経路/);assert.match(details.air,/戦闘上の推奨または利用者目標/);assert.match(details.note,/装備個数や購入必須へ換算せず/);
});
