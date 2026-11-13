'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {normalVersionRouteFixture}=require('./normal-version-route-fixture.cjs');
const meta=require('../app-version.json');
const targets=['https://raw.githubusercontent.com/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json','http://127.0.0.1:4173/app-version.json'];
function request(url,method='GET'){
 const returned={};let action=null;
 const route={request(){return {url(){return url},method(){return method}}},fulfill(options){action={kind:'fulfill',options};return returned},continue(){action={kind:'continue'};return returned}};
 assert.equal(normalVersionRouteFixture(route),returned);
 return action;
}

test('normal version input is JSON with CORS for exactly both registered GET targets and their queries',()=>{
 for(const target of targets)for(const query of ['', '?t=123', '?unrelated=1&t=456']){
  const action=request(target+query);
  assert.deepEqual(action,{kind:'fulfill',options:{status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:meta.version,build:meta.build})}});
  assert.deepEqual(Object.keys(JSON.parse(action.options.body)),['version','build']);
 }
});

test('non-target URLs and non-GET methods retain the original local/204 policy',()=>{
 const cases=[
  ['https://raw.githubusercontent.com/f96tbrt29n-cmyk/HarborDesk-PWA/main/other.json','GET','empty'],
  ['https://raw.githubusercontent.com/other/HarborDesk-PWA/main/app-version.json','GET','empty'],
  ['https://other.test/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json','GET','empty'],
  ['http://raw.githubusercontent.com/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json','GET','empty'],
  ['http://127.0.0.1:4174/app-version.json','GET','continue'],
  ['http://localhost:4173/app-version.json','GET','continue'],
  ['http://127.0.0.1:4173/other/app-version.json','GET','continue'],
  ['http://127.0.0.1:4173/assets/local.png','GET','continue'],
  [targets[0],'HEAD','empty'],[targets[0],'POST','empty'],
  [targets[1],'HEAD','continue'],[targets[1],'POST','continue']
 ];
 for(const [url,method,expected]of cases)assert.deepEqual(request(url,method),expected==='continue'?{kind:'continue'}:{kind:'fulfill',options:{status:204,body:''}});
});

test('the unchanged product version reader consumes fixed JSON without changing its network options',async()=>{
 const seen=[],context=vm.createContext({window:{},fetch:async(url,options)=>{
  const absolute=new URL(url,'http://127.0.0.1:4173/').href;
  const action=request(absolute);assert.equal(action.options.status,200);
  seen.push({url:absolute.split('?')[0],options:JSON.parse(JSON.stringify(options))});
  return {ok:true,json:async()=>JSON.parse(action.options.body)};
 }});
 const source=fs.readFileSync(require.resolve('../update-manager.js'),'utf8').split('function hdBuildAssetUrl')[0];
 vm.runInContext(source,context);
 const actual=JSON.parse(JSON.stringify(await vm.runInContext('hdFetchLatestVersion()',context)));
 assert.deepEqual(actual,{version:meta.version,build:meta.build,sourceBuild:meta.build,sourceVersion:meta.version,publishedBuild:meta.build,publishedVersion:meta.version,publishedReady:true});
 assert.deepEqual(seen.map(x=>x.url),targets);
 assert.deepEqual(seen.map(x=>x.options),[{cache:'no-store'},{cache:'no-store'}]);
});
