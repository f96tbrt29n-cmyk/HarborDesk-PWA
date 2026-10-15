const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const path = require('node:path');
function setup() {
 const data=new Map();
 const context=vm.createContext({window:{addEventListener(){},dispatchEvent(){}},document:{addEventListener(){}},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},CustomEvent:class{},URL,console});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../ship-master-snapshot.js'),'utf8'),context);
 const source=fs.readFileSync(path.join(__dirname,'../ship-image-provider.js'),'utf8');
 vm.runInContext(source.slice(0,source.lastIndexOf('hdShipImageRefreshLocalIds().then(')),context);
 return expr=>vm.runInContext(expr,context);
}
test('image rows retain every current master ID without duplicates',()=>{
 const run=setup();
 const ids=JSON.parse(run('JSON.stringify(hdShipImageRows().map(s=>Number(s.id)).sort((a,b)=>a-b))'));
 const masterIds=JSON.parse(run('JSON.stringify(Object.keys(window.HD_KANCOLLE_MASTER_SNAPSHOT.allShips).map(Number).sort((a,b)=>a-b))'));
 assert.ok(masterIds.length>0);
 assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual(ids,masterIds);
});
test('pinned image coverage includes every master except explicitly reviewed unavailable cards',()=>{
 const run=setup();
 // api_start2 23637be adds Sagiri Kai Ni (902). The existing gkcoi
 // c6265b1 card inventory has no 902.png (HTTP 404, 2026-10-15).
 // Keep this explicit: a new uncovered form must trigger another review.
 const uncovered=JSON.parse(run('JSON.stringify(hdShipImageRows().filter(s=>!HD_SHIP_IMAGE_SOURCE.ids.has(Number(s.id))).map(s=>Number(s.id)).sort((a,b)=>a-b))'));
 assert.deepEqual(uncovered,[902]);
 assert.equal(run('hdShipImageRows().every(s=>hdShipImageRemoteUrl(s.id)===(HD_SHIP_IMAGE_SOURCE.ids.has(Number(s.id))?HD_SHIP_IMAGE_SOURCE.baseUrl+Number(s.id)+".png":""))'),true);
 assert.notEqual(run('hdShipImageRemoteUrl(1)'),run('hdShipImageRemoteUrl(254)'));
 assert.equal(run('hdShipImageRemoteUrl(999999)'), '');
 assert.equal(run('hdShipImageVerifyStatus(1).status'),'unverified');
});
test('new master without a pinned card keeps its identity and image registration fallback',()=>{
 const run=setup();
 assert.equal(run('hdShipImageResolve(902).name'),'狭霧改二');
 assert.equal(run('hdShipImageResolve("狭霧改二").id'),902);
 assert.equal(run('hdShipImageRemoteUrl(902)'),'');
 assert.equal(run('hdShipImageVerifyStatus(902).status'),'unverified');
 const html=run('hdShipImageCardHtml(902)');
 assert.match(html,/画像未登録/);
 assert.match(html,/狭霧改二/);
 assert.match(html,/data-hd-ship-image-upload="902"/);
});
test('explicit custom URLs, opt-out and legacy settings remain usable',()=>{
 const run=setup();
 run('hdShipImageSaveConfig({autoSource:false})');
 assert.equal(run('hdShipImageRemoteUrl(1)'),'');
 run('hdShipImageSaveConfig({remoteTemplate:"https://example.com/{id}.png"})');
 assert.equal(run('hdShipImageRemoteUrl(1)'),'https://example.com/1.png');
 run('hdShipImageSaveConfig({remoteTemplate:""})');
 assert.equal(run('hdShipImageRemoteUrl(1)'),'');
 run('localStorage.setItem(HD_SHIP_IMAGE_CONFIG_KEY,JSON.stringify({remoteTemplate:""}))');
 assert.match(run('hdShipImageRemoteUrl(1)'),/\/static\/ship\/card\/1.png$/);
});
