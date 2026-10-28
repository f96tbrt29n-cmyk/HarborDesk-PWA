'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Independently read from the registered article/KC source maps. Connectivity
// does not establish fleet predicates, random outcomes or victory.
const expected=[['START','A'],['START','B'],['A','C'],['B','K'],['B','F'],['C','E'],['D','H'],['E','G'],['E','H'],['F','D'],['F','J'],['G','I'],['H','P'],['H','N'],['H','L'],['I','M'],['I','L'],['J','P'],['K','P'],['L','N'],['M','L'],['M','O'],['N','M'],['N','O'],['O','S'],['O','R'],['P','S'],['P','Q']];
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}},HD_NODE_DETAIL_OVERRIDES:{},MAP_DETAILS:{}});for(const f of ['map-images.js','map-plans.js','map-node-data-2-7.js','map-details-57.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['5-5']",c);return c;}
const keys=rows=>Array.from(rows,e=>e.join('>')).sort();
test('5-5 graph follows twenty-eight source connections with a distinct abstract start and boss S',()=>{
 const c=context();assert.deepEqual(keys(c.graph.edges),keys(expected));assert.equal(new Set(keys(c.graph.edges)).size,28);assert.deepEqual(Array.from(c.hdMapStartLabels(c.graph)),['START']);assert.equal(c.graph.boss,'S');for(const node of ['Q','R','S'])assert.equal(c.graph.edges.some(e=>e[0]===node),false,node);
 for(const [from,to]of [['A','D'],['D','E'],['J','M'],['M','N'],['M','S'],['N','S']])assert.equal(c.graph.edges.some(e=>e[0]===from&&e[1]===to),false,from+'→'+to);
});
test('5-5 node kinds keep B as ASW and P/N as daytime combat rather than the G/M night battles',()=>{
 const c=context();for(const [node,kind]of Object.entries({START:'start',A:'safe',B:'sub',C:'normal',D:'vortex',E:'item',F:'safe',G:'night',H:'normal',I:'safe',J:'normal',K:'normal',L:'vortex',M:'night',N:'normal',O:'safe',P:'normal',Q:'safe',R:'safe',S:'boss'}))assert.equal(c.hdMapKind(c.graph,node),kind,node);
 assert.deepEqual(Array.from(c.graph.night),['G','M']);assert.deepEqual(Array.from(c.graph.sub),['B']);
});
test('the shared 5-5 graph connects registered BKPS and BFDHNOS without making off-route shortcuts',()=>{
 const c=context();for(const [index,path]of [[0,'BKPS'],[1,'BFDHNOS']]){assert.equal(vm.runInContext(`HD_MAP_ROUTE_REQUIREMENTS['5-5'][${index}].path`,c),path);const nodes=['START',...path];for(let i=1;i<nodes.length;i++)assert.ok(c.graph.edges.some(e=>e[0]===nodes[i-1]&&e[1]===nodes[i]),nodes[i-1]+'→'+nodes[i]);}
 assert.deepEqual(Array.from(c.graph.edges.filter(e=>e[0]==='F'),e=>e[1]).sort(),['D','J']);assert.deepEqual(Array.from(c.graph.edges.filter(e=>e[0]==='L'),e=>e[1]),['N']);
});
test('5-5 visible notes explain the F choice, P daytime battle and pre-boss scouting without route or victory guarantees',()=>{
 const c=context(),notes=c.HD_NODE_DETAIL_OVERRIDES['5-5'];assert.match(notes.F.enemy,/戦闘なし.*能動分岐/);assert.match(notes.F.branch,/DまたはJ/);assert.match(notes.L.enemy,/うずしお.*燃料/);assert.match(notes.P.enemy,/通常戦（昼戦）/);assert.match(notes.N.enemy,/通常戦（昼戦）/);assert.match(notes.P.branch,/33式係数2・80以上/);assert.match(notes.P.branch,/73未満/);assert.match(notes.S.branch,/ボスS自身ではなく到達前のPまたはO/);assert.doesNotMatch(notes.S.enemy,/索敵判定もある/);
 const details=c.MAP_DETAILS['5-5'];assert.match(details.overview,/B対潜戦→K通常戦→P通常戦→Sボス/);assert.match(details.route,/F能動分岐/);assert.match(details.air,/戦闘上の推奨または利用者目標/);assert.match(details.note,/固定電探数や購入必須へ換算しない/);
});
