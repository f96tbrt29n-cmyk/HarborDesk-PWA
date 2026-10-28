'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Independent literal reading of the registered 6-2 original map, before
// product execution. A line is neither a fleet predicate nor arrival proof.
const expected=[['START','B'],['START','C'],['B','C'],['B','D'],['C','A'],['C','D'],['C','E'],['D','F'],['D','H'],['E','F'],['E','I'],['E','J'],['F','I'],['H','G'],['H','K'],['I','G'],['I','K'],['J','K']];
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}},HD_NODE_DETAIL_OVERRIDES:{},MAP_DETAILS:{}});for(const f of ['map-images.js','map-node-data-2-7.js','map-details-57.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['6-2']",c);return c;}
const keys=edges=>Array.from(edges,e=>e.join('>')).sort();
test('6-2 graph preserves eighteen source edges and distinct start and boss K without false shortcuts',()=>{
 const c=context();assert.deepEqual(keys(c.graph.edges),keys(expected));assert.equal(new Set(keys(c.graph.edges)).size,18);assert.deepEqual(Array.from(c.hdMapStartLabels(c.graph)),['START']);assert.equal(c.graph.boss,'K');
 for(const node of ['A','G','K'])assert.equal(c.graph.edges.some(e=>e[0]===node),false,node+' is terminal');
 for(const [from,to]of [['START','A'],['D','E'],['F','H'],['E','K'],['C','K']])assert.equal(c.graph.edges.some(e=>e[0]===from&&e[1]===to),false,from+'→'+to+' is not a source connection');
});
test('6-2 kinds and existing layout distinguish noncombat, ammo vortex, daytime battles and restored J',()=>{
 const c=context();for(const [node,kind]of Object.entries({START:'start',A:'safe',B:'normal',C:'normal',D:'vortex',E:'safe',F:'normal',G:'safe',H:'normal',I:'normal',J:'normal',K:'boss'}))assert.equal(c.hdMapKind(c.graph,node),kind,node);
 const pos=c.hdMapLayout(c.graph,780,470);for(const node of ['START','C','E','J','K']){assert.ok(pos[node],node);assert.ok(Number.isFinite(pos[node].x)&&Number.isFinite(pos[node].y));assert.ok(pos[node].x>=0&&pos[node].x<=780&&pos[node].y>=0&&pos[node].y<=470);}
 assert.notDeepEqual(JSON.parse(JSON.stringify(pos.J)),JSON.parse(JSON.stringify(pos.I)));
 for(const node of ['A','E','G'])assert.match(c.HD_NODE_DETAIL_OVERRIDES['6-2'][node].enemy,/戦闘なし/);assert.match(c.HD_NODE_DETAIL_OVERRIDES['6-2'].D.enemy,/弾薬うずしお/);for(const node of ['C','J'])assert.match(c.HD_NODE_DETAIL_OVERRIDES['6-2'][node].enemy,/通常戦/);
});
test('6-2 selected CEJK is continuous and keeps the conditional E branch separate from fixed J-to-K',()=>{
 const c=context(),nodes=['START',...'CEJK'];for(let i=1;i<nodes.length;i++)assert.ok(c.graph.edges.some(e=>e[0]===nodes[i-1]&&e[1]===nodes[i]),nodes[i-1]+'→'+nodes[i]);
 assert.deepEqual(Array.from(c.graph.edges.filter(e=>e[0]==='E'),e=>e[1]).sort(),['F','I','J']);assert.deepEqual(Array.from(c.graph.edges.filter(e=>e[0]==='J'),e=>e[1]),['K']);
 const notes=c.HD_NODE_DETAIL_OVERRIDES['6-2'];for(const text of ['駆逐1以下','戦艦級2以上','空母系2以上','50以上でJ','43以上50未満はI/Jランダム','43未満はI'])assert.ok(notes.E.branch.includes(text),text);assert.match(notes.J.branch,/Kへ固定接続/);assert.match(notes.K.branch,/K自身ではなく到達前のE/);
});
test('6-2 guidance preserves source priority, selected route, unresolved other routes and recommendation distinctions',()=>{
 const c=context(),n=c.HD_NODE_DETAIL_OVERRIDES['6-2'],d=c.MAP_DETAILS['6-2'];
 assert.match(n.START.branch,/軽巡＋駆逐4隻以上→Bが最優先/);assert.match(n.H.branch,/40以上\?.*未確認/);assert.match(n.I.branch,/潜水艦・潜水空母4以上のGが索敵より先行/);assert.match(n.I.branch,/CEIK.*別経路/);
 assert.match(d.overview,/C通常戦→E非戦闘\/索敵→J通常戦→Kボス/);assert.match(d.fleet,/軽巡＋駆逐3以下/);assert.match(d.fleet,/雷巡2は登録例/);assert.match(d.air,/戦闘上の推奨または利用者目標/);assert.match(d.air,/D経由の場合/);assert.match(d.note,/速力統一.*必須としない/);assert.match(d.note,/装備個数\/購入必須へ換算しない/);assert.match(d.note,/情報不足・探索未完了/);
});
