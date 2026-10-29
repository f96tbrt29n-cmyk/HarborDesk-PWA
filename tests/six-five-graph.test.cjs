'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Independent source literals preserved before product execution: original map
// anchors 1/2 are S1/S2, selected route names omit these non-combat anchors.
const expected=[['S1','A'],['S2','B'],['A','C'],['B','C'],['B','F'],['C','D'],['C','E'],['D','G'],['E','H'],['E','I'],['F','I'],['H','G'],['G','K'],['G','M'],['I','H'],['I','J'],['J','L'],['J','M']];
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}},HD_NODE_DETAIL_OVERRIDES:{},MAP_DETAILS:{}});for(const f of ['map-images.js','map-node-data-2-7.js','map-details-57.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['6-5']",c);return c;}
const keys=edges=>Array.from(edges,e=>e.join('>')).sort();
test('6-5 graph preserves eighteen source-directed edges and distinct upper and lower start anchors',()=>{
 const c=context();assert.deepEqual(keys(c.graph.edges),keys(expected));assert.equal(new Set(keys(c.graph.edges)).size,18);assert.deepEqual(Array.from(c.hdMapStartLabels(c.graph)).sort(),['S1','S2']);assert.equal(c.graph.boss,'M');
 assert.equal(c.graph.edges.some(([a,b])=>a==='G'&&b==='H'),false);assert.equal(c.graph.edges.some(([a,b])=>a==='H'&&b==='G'),true);assert.match(c.graph.note,/図の整合を全分岐・配備・実操作の確認済みとはしない/);
});
test('6-5 node kinds keep D ordinary and J night battle while separating submarine and air-raid stages',()=>{
 const c=context();for(const [node,kind]of Object.entries({S1:'start',S2:'start',A:'normal',B:'sub',C:'normal',D:'normal',E:'sub',F:'normal',G:'air',H:'air',I:'normal',J:'night',K:'safe',L:'safe',M:'boss'}))assert.equal(c.hdMapKind(c.graph,node),kind,node);
 const pos=c.hdMapLayout(c.graph,780,470);for(const node of ['S1','S2',...'ABCDEFGHIJKLM']){assert.ok(pos[node],node);assert.ok(Number.isFinite(pos[node].x)&&Number.isFinite(pos[node].y));assert.ok(pos[node].x>=0&&pos[node].x<=780&&pos[node].y>=0&&pos[node].y<=470);}
 const n=c.HD_NODE_DETAIL_OVERRIDES['6-5'];for(const node of ['A','C','D','F','I'])assert.match(n[node].enemy,/通常戦/);for(const node of ['B','E'])assert.match(n[node].enemy,/対潜戦/);for(const node of ['G','H'])assert.match(n[node].enemy,/空襲戦/);assert.match(n.J.enemy,/夜戦/);for(const node of ['K','L'])assert.match(n[node].enemy,/非戦闘終端/);
});
test('6-5 selected ACDGM and BFIJM remain connected without promoting other source alternatives to operation evidence',()=>{
 const c=context();for(const nodes of [['S1',...'ACDGM'],['S2',...'BFIJM']])for(let i=1;i<nodes.length;i++)assert.ok(c.graph.edges.some(e=>e[0]===nodes[i-1]&&e[1]===nodes[i]),nodes[i-1]+'→'+nodes[i]);
 for(const [node,next]of [['A','C'],['D','G'],['F','I']])assert.deepEqual(Array.from(c.graph.edges.filter(e=>e[0]===node),e=>e[1]),[next]);
 const n=c.HD_NODE_DETAIL_OVERRIDES['6-5'];assert.match(n.I.branch,/軽巡0H、駆逐2以上J、戦艦級1以上H/);assert.match(n.C.branch,/駆逐0E、戦艦級＋空母系4以上E、同＋重巡級5以上E、雷巡2E、その他Dの順/);assert.match(n.C.branch,/雷巡3以上.*記事表だけで確定しない/);assert.match(n.E.branch,/配備・保存操作確認済みへ広げない/);
});
test('6-5 guidance keeps G50 and J35 safe values separate from unknown lower failure bounds and optional base planning',()=>{
 const c=context(),n=c.HD_NODE_DETAIL_OVERRIDES['6-5'],d=c.MAP_DETAILS['6-5'];
 assert.match(n.G.branch,/分岐点係数3・50以上でM/);assert.match(n.J.branch,/分岐点係数3・35以上でM/);for(const node of ['G','J']){assert.match(n[node].branch,/ランダム域と確定逸れの下限は出典未確認/);assert.match(n[node].branch,/一律到達不可能・購入必須としない/);}
 assert.match(d.overview,/A\/C\/D通常戦→G空襲→Mボス/);assert.match(d.overview,/B対潜→F\/I通常戦→J夜戦→Mボス/);assert.match(d.fleet,/空母入りの掲載編成例に限定せず/);assert.match(n.S1.branch,/揚陸艦.*結論が変わる場合だけ未判定/);
 assert.match(d.air,/基地は開放後2部隊を出撃可能/);assert.match(d.air,/Mへ派遣する場合は行動半径5/);assert.match(d.air,/派遣や固定4機を通行必須へ変えない/);for(const word of ['情報不足','在庫不足','搭載不可','枠競合','探索未完了'])assert.ok(d.note.includes(word),word);assert.match(d.note,/到達・撃破・勝利の保証にしない/);
});
