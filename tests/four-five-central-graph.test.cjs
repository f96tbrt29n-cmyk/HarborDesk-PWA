'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Independently transcribed from the registered source's 800×480 map image.
// Topology alone does not implement every outer branch condition.
const expected=[['START','A'],['START','C'],['A','B'],['A','D'],['B','E'],['C','D'],['C','F'],['D','H'],['E','K'],['E','M'],['F','I'],['G','D'],['G','H'],['H','K'],['H','T'],['I','G'],['I','J'],['J','H'],['K','L'],['K','M'],['K','T'],['M','N'],['M','R'],['N','T'],['O','N'],['O','T'],['Q','N'],['Q','O'],['Q','P'],['R','N'],['R','S'],['S','Q']];
function context(){const c=vm.createContext({window:{},document:{addEventListener(){}}});for(const file of ['map-images.js','map-plans.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);c.graph=vm.runInContext("HD_MAP_GRAPHS['4-5']",c);return c;}
const keys=rows=>Array.from(rows,e=>e.join('>')).sort();
test('4-5 graph retains all thirty-two source arrows and distinguishes the actual S battle from the start',()=>{
 const c=context();assert.deepEqual(keys(c.graph.edges),keys(expected));assert.equal(new Set(keys(c.graph.edges)).size,32);assert.deepEqual(Array.from(c.hdMapStartLabels(c.graph)),['START']);assert.equal(c.hdMapKind(c.graph,'S'),'normal');assert.equal(c.hdMapKind(c.graph,'START'),'start');for(const terminal of ['L','P','T'])assert.equal(c.graph.edges.some(e=>e[0]===terminal),false,terminal);
});
test('4-5 graph separates submarine battles, noncombat nodes, fuel whirlpool and boss',()=>{
 const c=context();for(const node of ['B','D','F','O'])assert.equal(c.hdMapKind(c.graph,node),'sub',node);for(const node of ['A','C','I','L','M','P','Q'])assert.equal(c.hdMapKind(c.graph,node),'safe',node);assert.equal(c.hdMapKind(c.graph,'R'),'vortex');assert.equal(c.hdMapKind(c.graph,'T'),'boss');for(const node of ['E','G','H','J','K','N','S'])assert.equal(c.hdMapKind(c.graph,node),'normal',node);
});
test('both registered central prefixes contain H-K-T, while direct D-F is not fabricated',()=>{
 const c=context();assert.equal(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['4-5'][1].path",c),'ADHKT / CDHKT');for(const path of ['ADHKT','CDHKT']){const nodes=['START',...path];for(let i=1;i<nodes.length;i++)assert.ok(c.graph.edges.some(e=>e[0]===nodes[i-1]&&e[1]===nodes[i]),nodes[i-1]+'→'+nodes[i]);}assert.equal(c.graph.edges.some(e=>e[0]==='D'&&e[1]==='F'),false);assert.equal(c.graph.edges.some(e=>e[0]==='F'&&e[1]==='J'),false);
});
