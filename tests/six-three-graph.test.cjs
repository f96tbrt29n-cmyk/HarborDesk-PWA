'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Independent literal reading of the registered original map, recorded before
// product execution. Connections do not prove fleet validity, arrival or reward.
const expected=[['START','A'],['A','B'],['A','C'],['B','D'],['C','E'],['D','E'],['E','F'],['E','G'],['F','H'],['G','H'],['H','I'],['H','J']];
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}},HD_NODE_DETAIL_OVERRIDES:{},MAP_DETAILS:{}});for(const f of ['map-images.js','map-node-data-2-7.js','map-details-57.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['6-3']",c);return c;}
const keys=edges=>Array.from(edges,e=>e.join('>')).sort();
test('6-3 graph preserves twelve independent source connections and boss J without false shortcuts',()=>{
 const c=context();assert.deepEqual(keys(c.graph.edges),keys(expected));assert.equal(new Set(keys(c.graph.edges)).size,12);assert.deepEqual(Array.from(c.hdMapStartLabels(c.graph)),['START']);assert.equal(c.graph.boss,'J');
 for(const node of ['I','J'])assert.equal(c.graph.edges.some(e=>e[0]===node),false,node+' is terminal');
 for(const [from,to]of [['C','D'],['D','F'],['F','G'],['E','J'],['G','J']])assert.equal(c.graph.edges.some(e=>e[0]===from&&e[1]===to),false,from+'→'+to+' is not a source connection');
});
test('6-3 existing kinds and layout distinguish submarine combat, aviation reconnaissance and restored boss J',()=>{
 const c=context();for(const [node,kind]of Object.entries({START:'start',A:'safe',B:'normal',C:'sub',D:'normal',E:'normal',F:'normal',G:'safe',H:'safe',I:'safe',J:'boss'}))assert.equal(c.hdMapKind(c.graph,node),kind,node);
 const pos=c.hdMapLayout(c.graph,780,470);for(const node of ['START','A','C','E','G','H','J']){assert.ok(pos[node],node);assert.ok(Number.isFinite(pos[node].x)&&Number.isFinite(pos[node].y));assert.ok(pos[node].x>=0&&pos[node].x<=780&&pos[node].y>=0&&pos[node].y<=470);}
 assert.notDeepEqual(JSON.parse(JSON.stringify(pos.J)),JSON.parse(JSON.stringify(pos.I)));
 const n=c.HD_NODE_DETAIL_OVERRIDES['6-3'];assert.match(n.B.enemy,/潜水編成と水上編成の両方/);assert.match(n.C.enemy,/対潜戦/);assert.match(n.E.enemy,/通常戦/);
 for(const node of ['G','H'])assert.match(n[node].enemy,/航空偵察。航空戦ではない/);assert.match(n.I.enemy,/追加効果.*未確認/);
});
test('6-3 ACEGHJ stays continuous while active choice, ordered E fleet branches and H scouting remain separate',()=>{
 const c=context(),nodes=['START',...'ACEGHJ'];for(let i=1;i<nodes.length;i++)assert.ok(c.graph.edges.some(e=>e[0]===nodes[i-1]&&e[1]===nodes[i]),nodes[i-1]+'→'+nodes[i]);
 assert.deepEqual(Array.from(c.graph.edges.filter(e=>e[0]==='A'),e=>e[1]).sort(),['B','C']);assert.deepEqual(Array.from(c.graph.edges.filter(e=>e[0]==='H'),e=>e[1]).sort(),['I','J']);
 const n=c.HD_NODE_DETAIL_OVERRIDES['6-3'];assert.match(n.A.branch,/ACEGHJはCを選ぶ/);assert.match(n.A.branch,/Eを直接選ぶ分岐ではない/);
 for(const text of ['軽巡3以上→F','水母2以上→F','軽巡1以下かつ駆逐3以上→G','F60%/G40%','E分岐の軽巡へ練巡・雷巡を足さない'])assert.ok(n.E.branch.includes(text),text);
 for(const text of ['38以上→J','36以上38未満はI/Jランダム','36未満→I','別HQ減算0.35用の44','情報不足は未判定'])assert.ok(n.H.branch.includes(text),text);
 assert.match(n.J.branch,/J自身ではなく到達前のH/);
});
test('6-3 guidance separates admission and CT branch counts, reconnaissance rewards and combat recommendations',()=>{
 const c=context(),n=c.HD_NODE_DETAIL_OVERRIDES['6-3'],d=c.MAP_DETAILS['6-3'];
 assert.match(d.overview,/C対潜→E通常戦→G\/H航空偵察→Jボス/);assert.match(d.fleet,/練巡は出撃制限で合計するがEの軽巡には含めず/);assert.match(d.fleet,/雷巡・海防艦等は代用しない/);
 assert.match(d.air,/瑞雲1機で制空確保可能という記事の装備例/);assert.match(d.air,/水爆全般へ同じ効果を一般化しない/);assert.match(d.air,/戦闘上の推奨または利用者目標/);assert.match(d.air,/Hの通行索敵38や電探\/艦本体索敵を流用しない/);assert.match(n.G.branch,/資源の持帰りにはボスB勝利以上/);assert.match(n.H.air,/通行の38を偵察成功値へ流用しない/);
 for(const text of ['少数隻の成立は未確認','速力統一を必須とせず','装備個数/購入必須へ換算しない','情報不足・探索未完了','実到達・勝利・資源持帰り'])assert.ok(d.note.includes(text),text);
});
