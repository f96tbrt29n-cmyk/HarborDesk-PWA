'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Independent literals from the ordered START/B/D/H tables and explicit
// DEGHK/FGHK paths. The two undirected dashed source links are not arrows.
const expected=[['S','B'],['S','D'],['S','F'],['B','A'],['B','C'],['D','C'],['D','E'],['E','G'],['F','G'],['G','H'],['H','I'],['H','J'],['H','K']];
const keys=edges=>Array.from(edges,e=>e.join('>')).sort();
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}},HD_NODE_DETAIL_OVERRIDES:{},MAP_DETAILS:{}});for(const f of ['map-images.js','map-node-data-2-7.js','map-details-57.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['7-1']",c);return c;}
test('7-1 graph keeps thirteen source-directed connections and leaves two source-link directions unconfirmed',()=>{
 const c=context();assert.deepEqual(keys(c.graph.edges),keys(expected));assert.equal(new Set(keys(c.graph.edges)).size,13);assert.deepEqual(Array.from(c.hdMapStartLabels(c.graph)),['S']);assert.equal(c.graph.boss,'K');
 for(const [a,b]of [['D','F'],['G','K'],['A','C'],['C','A'],['C','E'],['E','C']])assert.equal(c.graph.edges.some(e=>e[0]===a&&e[1]===b),false,a+'→'+b);
 assert.match(c.graph.note,/A-C\/C-Eは方向未確認/);assert.match(c.graph.note,/全分岐・配備・実操作の確認済みとはしない/);
});
test('7-1 node roles distinguish E fuel and G surface combat from D F H and boss anti-submarine combat',()=>{
 const c=context(),n=c.HD_NODE_DETAIL_OVERRIDES['7-1'];
 for(const [node,kind]of Object.entries({S:'start',A:'vortex',B:'normal',C:'normal',D:'sub',E:'item',F:'sub',G:'normal',H:'sub',I:'item',J:'safe',K:'boss'}))assert.equal(c.hdMapKind(c.graph,node),kind,node);
 for(const node of ['D','F','H'])assert.match(n[node].enemy,/対潜戦/);assert.match(n.K.enemy,/ボス対潜戦/);assert.match(n.E.enemy,/燃料獲得。対潜戦ではない/);assert.match(n.G.enemy,/通常戦/);assert.match(n.A.enemy,/弾薬のうずしお/);assert.match(n.I.enemy,/燃料獲得の終端/);assert.match(n.J.enemy,/非戦闘終端/);
 const pos=c.hdMapLayout(c.graph,780,470);for(const node of ['S',...'ABCDEFGHIJK']){assert.ok(pos[node],node);assert.ok(Number.isFinite(pos[node].x)&&Number.isFinite(pos[node].y));assert.ok(pos[node].x>=0&&pos[node].x<=780&&pos[node].y>=0&&pos[node].y<=470);}
});
test('7-1 selected DEGHK and separate FGHK preserve H before the K I J alternatives',()=>{
 const c=context();for(const nodes of [['S',...'DEGHK'],['S',...'FGHK']])for(let i=1;i<nodes.length;i++)assert.ok(c.graph.edges.some(e=>e[0]===nodes[i-1]&&e[1]===nodes[i]),nodes[i-1]+'→'+nodes[i]);
 for(const [node,next]of [['E',['G']],['F',['G']],['G',['H']],['H',['I','J','K']]])assert.deepEqual(Array.from(c.graph.edges.filter(e=>e[0]===node),e=>e[1]).sort(),next);
 const n=c.HD_NODE_DETAIL_OVERRIDES['7-1'];assert.match(n.F.branch,/4隻例をDEGHKと記す記事内の不一致/);assert.match(n.G.branch,/G→Kを追加してHの分岐を省略しない/);assert.match(n.C.air,/海域全体へ広げない/);assert.match(n.B.branch,/配備・保存確認済みとはしない/);
});
test('7-1 guidance separates ordered hull conditions from optional OASW goals and source-uncertain branches',()=>{
 const c=context(),n=c.HD_NODE_DETAIL_OVERRIDES['7-1'],d=c.MAP_DETAILS['7-1'];
 assert.match(n.S.branch,/潜水艦・潜水空母のランダムを先/);assert.match(n.S.branch,/潜水母艦を潜水系へ足さない/);assert.match(n.D.branch,/駆逐＋海防艦5でEを最優先/);assert.match(n.D.branch,/水母のC\/Eランダムより先/);assert.match(n.H.branch,/軽巡1かつ駆逐4以上K、駆逐1以上かつ海防艦3以上K、戦艦級＋空母条件3以上J/);assert.match(n.H.branch,/補給艦・潜水母艦等の追加影響は未確認/);assert.match(n.H.branch,/ランダムを到達不可能・購入必須としない/);
 assert.match(d.overview,/D対潜→E燃料獲得→G通常戦→H対潜→K対潜ボス/);assert.match(d.fleet,/軽巡1＋駆逐1＋海防艦3、駆逐2＋海防艦3/);assert.match(d.note,/先制対潜4〜5隻は攻略案の一つ/);assert.match(d.note,/初攻略例では2隻/);assert.match(d.note,/人数とソナー・投射機の装備組数を同一扱いせず/);assert.match(d.note,/保存済みの利用者目標を上書きしない/);assert.match(d.air,/通行必須の装備個数ではない/);assert.match(d.note,/数値索敵・速力統一を一律必須にせず/);
 for(const word of ['情報不足','在庫不足','搭載不可','枠競合','探索未完了'])assert.ok(d.note.includes(word),word);assert.match(d.note,/到達・撃破・勝利の保証へ変えない/);
});
