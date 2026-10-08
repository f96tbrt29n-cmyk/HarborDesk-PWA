const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('map-strategy-navigator.js','utf8');
test('navigator dropdown persists the search fleet across reloads and rejects stale choices',()=>{
 const selections={},fleets=[{id:'first'},{id:'second'}];
 function boot(){
  const listeners={};
  const context={document:{addEventListener:(event,fn)=>listeners[event]=fn},window:{addEventListener(){}},MAPS:{1:['1-1']},loadCustomFleets:()=>({'1-1':fleets}),hdSortieSelection:map=>selections[map]||'first',hdSortieSetSelection:(map,id)=>selections[map]=id};
  vm.createContext(context);vm.runInContext(source,context);vm.runInContext("hdMSNMap='1-1';hdMSNRender=()=>{}",context);
  return {change:value=>listeners.change({target:{id:'hdMapStrategyFleet',value}}),selected:()=>context.hdMSNFleetId('1-1',fleets)};
 }
 let app=boot();assert.equal(app.selected(),'first');app.change('second');assert.equal(selections['1-1'],'second');
 app=boot();assert.equal(app.selected(),'second');app.change('deleted');assert.equal(app.selected(),'second');assert.equal(selections['1-1'],'second');
 app.change('first');assert.equal(boot().selected(),'first');
});
