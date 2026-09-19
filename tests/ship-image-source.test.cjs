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
test('every current master form has its own pinned card URL',()=>{
 const run=setup();
 assert.equal(run('hdShipImageRows().length'),865);
 assert.equal(run('hdShipImageRows().every(s=>hdShipImageRemoteUrl(s.id)===HD_SHIP_IMAGE_SOURCE.baseUrl+s.id+".png")'),true);
 assert.notEqual(run('hdShipImageRemoteUrl(1)'),run('hdShipImageRemoteUrl(254)'));
 assert.equal(run('hdShipImageRemoteUrl(999999)'), '');
 assert.equal(run('hdShipImageVerifyStatus(1).status'),'unverified');
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
