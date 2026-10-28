'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Direction-confirmed source literals recorded before product execution.
// D/G is a visible connection with unconfirmed direction, not a verified absence.
const expected=[['S1','A'],['S1','B'],['S2','M'],['A','D'],['A','E'],['B','D'],['E','D'],['E','G'],['D','C'],['C','F'],['F','N'],['M','K'],['K','H'],['K','J'],['H','J'],['J','L'],['J','N'],['J','I'],['L','I'],['I','N']];
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}},HD_NODE_DETAIL_OVERRIDES:{},MAP_DETAILS:{}});for(const f of ['map-images.js','map-node-data-2-7.js','map-details-57.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['6-4']",c);return c;}
const keys=edges=>Array.from(edges,e=>e.join('>')).sort();
test('6-4 graph displays twenty direction-confirmed source edges without inventing the unresolved D-G direction',()=>{
 const c=context();assert.deepEqual(keys(c.graph.edges),keys(expected));assert.equal(new Set(keys(c.graph.edges)).size,20);assert.deepEqual(Array.from(c.hdMapStartLabels(c.graph)).sort(),['S1','S2']);assert.equal(c.graph.boss,'N');
 for(const [from,to]of [['C','N'],['D','F']])assert.equal(c.graph.edges.some(e=>e[0]===from&&e[1]===to),false,from+'→'+to+' is not in the preserved map');
 for(const [from,to]of [['D','G'],['G','D']])assert.equal(c.graph.edges.some(e=>e[0]===from&&e[1]===to),false,'unconfirmed direction must not be guessed');
 assert.match(c.graph.note,/D\/Gの接続は方向未確認/);assert.match(c.graph.note,/地図全体の分岐検証済みとはしない/);
});
test('6-4 existing kinds and layout retain boss N and distinguish B-C combat from D-F air raids',()=>{
 const c=context();for(const [node,kind]of Object.entries({S1:'start',S2:'start',B:'normal',D:'air',C:'normal',F:'air',G:'air',I:'air',J:'normal',N:'boss'}))assert.equal(c.hdMapKind(c.graph,node),kind,node);
 const pos=c.hdMapLayout(c.graph,780,470);for(const node of ['S1','B','D','C','F','N']){assert.ok(pos[node],node);assert.ok(Number.isFinite(pos[node].x)&&Number.isFinite(pos[node].y));assert.ok(pos[node].x>=0&&pos[node].x<=780&&pos[node].y>=0&&pos[node].y<=470);}
 assert.notDeepEqual(JSON.parse(JSON.stringify(pos.N)),JSON.parse(JSON.stringify(pos.C)));
 const n=c.HD_NODE_DETAIL_OVERRIDES['6-4'];for(const node of ['B','C'])assert.match(n[node].enemy,/通常戦/);for(const node of ['D','F'])assert.equal(n[node].enemy,'空襲戦。');assert.match(n.N.enemy,/ボス。陸上型を含む/);
});
test('6-4 selected BDCFN follows the confirmed C-to-F connection and retains the D-G evidence limit',()=>{
 const c=context(),nodes=['S1',...'BDCFN'];for(let i=1;i<nodes.length;i++)assert.ok(c.graph.edges.some(e=>e[0]===nodes[i-1]&&e[1]===nodes[i]),nodes[i-1]+'→'+nodes[i]);
 assert.deepEqual(Array.from(c.graph.edges.filter(e=>e[0]==='C'),e=>e[1]),['F']);assert.deepEqual(Array.from(c.graph.edges.filter(e=>e[0]==='F'),e=>e[1]),['N']);
 const n=c.HD_NODE_DETAIL_OVERRIDES['6-4'];assert.match(n.C.branch,/C→Nへ直接進む線は取得原図にない/);assert.match(n.D.branch,/D→Fの短絡は取得原図にない/);assert.match(n.D.branch,/D\/G間の接続は方向未確認/);assert.match(n.G.branch,/有向線を追加していない/);
 assert.match(n.S2.branch,/別経路の判定.*実操作確認済みへ拡張しない/);
});
test('6-4 guidance separates ordinary and named-pair routes, optional combat targets and conditional base range',()=>{
 const c=context(),n=c.HD_NODE_DETAIL_OVERRIDES['6-4'],d=c.MAP_DETAILS['6-4'];
 assert.match(d.overview,/B通常戦→D空襲→C通常戦→F空襲→N陸上型ボス/);assert.match(d.fleet,/軽巡2隻や重巡級・軽巡級・水母の出典内代替/);assert.match(d.fleet,/長門改二と陸奥改二の両方/);assert.match(d.fleet,/一般の戦艦2隻や改二でない艦へ広げない/);
 assert.match(n.S1.branch,/低速艦ありA、軽巡旗艦かつ駆逐3以上B、駆逐4以上B、その他Aの順/);assert.match(n.S1.branch,/練巡・雷巡を足さず/);
 assert.match(d.air,/掲載装備例の制空35と.*C優勢36\/拮抗17・N優勢168\/拮抗75.*区別する/);assert.match(d.air,/基地をNへ派遣する場合は行動半径5が必要/);assert.match(d.air,/派遣自体は戦術の選択で通行必須ではない/);
 assert.match(n.N.branch,/数値索敵閾値は出典にないため新設せず/);assert.match(d.note,/長門旗艦等を要する特殊攻撃.*軽巡旗艦の経路成立とは別/);assert.match(d.note,/情報不足・探索未完了/);assert.match(d.note,/最適性・撃破・勝利の保証にしない/);
});
