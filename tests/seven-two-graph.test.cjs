'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Independent arrows and node roles from the acquired 7-2 original map,
// ordered source tables and explicit CEG / BCDIM descriptions.
const expected=[['S','A'],['S','B'],['S','C'],['A','B'],['B','C'],['C','D'],['C','E'],['D','H'],['D','I'],['E','F'],['E','G'],['H','I'],['I','J'],['I','L'],['I','M'],['J','K']];
const keys=edges=>Array.from(edges,e=>e.join('>')).sort();
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}},HD_NODE_DETAIL_OVERRIDES:{},MAP_DETAILS:{}});for(const f of ['map-images.js','map-node-data-2-7.js','map-details-57.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['7-2']",c);return c;}
test('7-2 graph has sixteen source-directed connections, one start and both selected real-boss paths',()=>{
 const c=context(),g=c.graph;assert.deepEqual(keys(g.edges),keys(expected));assert.equal(new Set(keys(g.edges)).size,16);assert.deepEqual(Array.from(c.hdMapStartLabels(g)),['S']);
 for(const nodes of [['S',...'CEG'],['S',...'BCDIM']])for(let i=1;i<nodes.length;i++)assert.ok(g.edges.some(([a,b])=>a===nodes[i-1]&&b===nodes[i]),nodes[i-1]+'→'+nodes[i]);
 for(const fake of ['S1','S2','G1','G2'])assert.equal(g.edges.some(e=>e.includes(fake)),false,fake);
 for(const node of ['F','G','K','L','M'])assert.equal(g.edges.some(e=>e[0]===node),false,node+' is terminal');
 const pos=c.hdMapLayout(g,780,470);assert.equal(Object.keys(pos).length,14);for(const node of ['S',...'ABCDEFGHIJKLM']){assert.ok(pos[node],node);assert.ok(Number.isFinite(pos[node].x)&&Number.isFinite(pos[node].y));assert.ok(pos[node].x>=0&&pos[node].x<=780&&pos[node].y>=0&&pos[node].y<=470);}
 assert.match(g.note,/当月の第1破壊による開放状態/);assert.match(g.note,/配備・実操作を確認済みとはしない/);assert.match(g.note,/I→Lの線を63未満の確定逸れの根拠にしない/);
});
test('7-2 both real bosses render as bosses while the existing first and second gauge targets remain G and M',()=>{
 const c=context(),g=c.graph;assert.equal(g.boss,'M');assert.deepEqual(Array.from(g.bosses),['G','M']);assert.equal(c.hdMapKind(g,'G'),'boss');assert.equal(c.hdMapKind(g,'M'),'boss');
 const svg=c.hdMapSvg('7-2',c.MAP_DETAILS['7-2']);for(const node of ['G','M'])assert.match(svg,new RegExp('class="hd-map-node boss" data-hd-node-id="'+node+'"><circle[^>]* r="25"/><text[^>]*>B</text>'));
 const stages=vm.runInContext("HD_MAP_STAGE_INFO['7-2']",c);assert.deepEqual(Array.from(stages,s=>s.target),['G','M']);assert.match(stages[0].detail,/Gマスのボス旗艦を3回撃沈/);assert.match(stages[0].detail,/破壊後にH〜Mマスが出現/);assert.match(stages[1].detail,/Mマスのボス旗艦を4回撃沈/);
 for(const bad of [null,{},'G',1])assert.equal(c.hdMapKind({edges:[['S','A']],boss:'M',goal:'G',bosses:bad},'G'),'goal');
 assert.equal(c.hdMapKind({edges:[['S','A']],boss:'M',goal:'G',bosses:['G','M']},'G'),'boss');
});
test('7-2 node and route guidance separates ASW, surface, noncombat and resource nodes from uncertain routing and optional gear',()=>{
 const c=context(),g=c.graph,n=c.HD_NODE_DETAIL_OVERRIDES['7-2'],d=c.MAP_DETAILS['7-2'];
 for(const [node,kind]of Object.entries({S:'start',A:'vortex',B:'normal',C:'sub',D:'safe',E:'sub',F:'safe',G:'boss',H:'air',I:'normal',J:'normal',K:'item',L:'safe',M:'boss'}))assert.equal(c.hdMapKind(g,node),kind,node);
 for(const node of ['C','E'])assert.match(n[node].enemy,/対潜戦/);for(const node of ['B','I','J'])assert.match(n[node].enemy,/通常戦/);for(const node of ['D','F','L'])assert.match(n[node].enemy,/非戦闘/);assert.match(n.A.enemy,/燃料のうずしお/);assert.match(n.K.enemy,/燃料獲得/);assert.match(n.H.enemy,/空襲戦/);assert.match(n.G.enemy,/潜水艦と水上随伴艦の混成/);assert.match(n.M.enemy,/第2ゲージの水上ボス/);
 assert.match(n.D.branch,/高速＋以上統一Iが最優先/);assert.match(n.D.branch,/軽空母の算入差が結論を変える場合は出典別候補・未判定/);assert.match(n.D.branch,/開放状態は編成\/装備成立と別/);
 assert.match(n.E.branch,/5隻以下G→駆逐＋海防艦5以上G→海防艦ちょうど3G→33式係数4・安全域47以上Gの順/);assert.match(n.E.branch,/索敵の数値条件は非適用/);
 assert.match(n.I.branch,/補給艦1以上J→水母1以上かつ駆逐＋海防艦3以上J→33式係数4・安全域69以上Mの順/);assert.match(n.I.branch,/69未満の行先は未確認/);
 assert.match(d.fleet,/始点CとC→Eの先行艦種条件を満たす範囲/);assert.match(d.fleet,/自由枠に.*無条件に加えられる意味ではなく/);assert.match(d.fleet,/明示低速例（戦艦1・空母なし等）/);assert.match(d.note,/2本のゲージは月初に復活/);assert.match(d.note,/当月の第1破壊が必要/);assert.match(d.note,/後続海域には翌月も出撃/);
 assert.match(d.note,/4隻初攻略例の先制対潜人数は未指定/);assert.match(n.G.branch,/全編成の必須4組へ読み替えず/);assert.match(d.note,/利用者人数・保存済み目標を保持/);for(const word of ['編成不一致','在庫不足','搭載不可','枠競合','情報不足','探索未完了'])assert.ok(d.note.includes(word),word);assert.match(d.note,/到達・勝利の保証としない/);
});
test('optional multiple-boss support preserves all thirty-six legacy maps, scalar bosses and goals without changing SVG output',()=>{
 const modern=context(),legacy=context(),graphs=vm.runInContext('HD_MAP_GRAPHS',modern);
 // Previous public priority contract; only the new optional array is absent.
 vm.runInContext(`hdMapKind=function(graph,label){if(hdMapIsStartLabel(graph,label))return 'start';if(graph.boss===label)return 'boss';if(graph.goal===label)return 'goal';if((graph.items||[]).includes(label))return 'item';if((graph.sub||[]).includes(label))return 'sub';if((graph.air||[]).includes(label))return 'air';if((graph.night||[]).includes(label))return 'night';if((graph.vortex||[]).includes(label))return 'vortex';if((graph.safe||[]).includes(label))return 'safe';return 'normal'}`,legacy);
 const maps=Object.keys(graphs).filter(map=>map!=='7-2');assert.equal(maps.length,36);
 for(const map of maps){const graph=graphs[map];assert.equal(Object.hasOwn(graph,'bosses'),false,map);const labels=[...new Set([...graph.edges.flat(),...modern.hdMapStartLabels(graph),graph.boss,graph.goal,'unregistered'].filter(x=>typeof x==='string'))];for(const node of labels)assert.equal(modern.hdMapKind(graph,node),legacy.hdMapKind(graph,node),map+'/'+node);for(const large of [false,true])assert.equal(modern.hdMapSvg(map,modern.MAP_DETAILS[map],large),legacy.hdMapSvg(map,legacy.MAP_DETAILS[map],large),map+'/'+large);}
});
