'use strict';
// Source-extracted navigation/compatibility contract with a deterministic timer queue.
// DOM/layout and scheduling are synthetic; this is not a browser incident replay.
const {test}=require('node:test');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const workspace=fs.readFileSync(path.join(root,'workspace-tabs.js'),'utf8');
const compat=fs.readFileSync(path.join(root,'workspace-compat.js'),'utf8');
const msn=fs.readFileSync(path.join(root,'map-strategy-navigator.js'),'utf8');
function actualFunction(source,name){
 const marker='function '+name+'(',start=source.indexOf(marker);
 assert.ok(start>=0&&source.indexOf(marker,start+marker.length)<0,'unique function '+name);
 const end=source.indexOf('\nfunction ',start+marker.length);
 assert.ok(end>start,'bounded next function '+name);
 return source.slice(start,end);
}
const names=['hdWSMarkDirectNavigation','hdWSMarkUserNavigation','hdWSSetPin','hdWSClearPin','hdWSActivePin','hdWSSave','hdWSReflectLocationHash','hdWSCurrentSectionId','hdWSApply','hdWSRevealElement','hdWSShowElement','hdWSOpenAnchorId','hdWSHandleAnchor'];
const extracted=names.map(name=>actualFunction(workspace,name)).join('\n')+'\n'+actualFunction(msn,'hdMSNOpen');
const setup=`
const HD_WS_GROUPS=[{key:'guide'}],HD_WS_KEY='synthetic-workspace-state';
let hdWSState={group:'guide',sections:{guide:'guide'}},hdWSApplying=false,hdWSNavSeq=0,hdWSNavLockUntil=0,hdWSRefreshTimer=0,hdWSStartupContextHandled=true;
let hdWSPin={group:'',sectionId:'',until:0};
const timerQueue=[],nativeScrolls=[],workspaceChanges=[],writes=[];let nativeScrollFailure=null,scheduleFailure=null;
window=globalThis;
const body={closest(){return null}};
class Element{
 constructor(id){this.id=id;this.hidden=false;this.parentElement=body;this.dataset={hdWorkspaceGroup:'guide'};const flags=new Set();this.classList={contains:name=>flags.has(name),remove:name=>flags.delete(name),toggle(name,on){if(on)flags.add(name);else flags.delete(name)}}}
 matches(selector){return selector==='section'}
 closest(selector){return selector==='section'?this:null}
 scrollIntoView(...args){if(nativeScrollFailure)throw nativeScrollFailure;nativeScrolls.push({id:this.id,args});return 'native-scroll-return'}
}
const sections=[new Element('guide'),new Element('mapStrategyNavigator')];sections[1].classList.toggle('hd-ws-hidden',true);
const document={body,getElementById:id=>sections.find(el=>el.id===id)||null,querySelectorAll:()=>[]};
const location={origin:'https://synthetic.invalid',pathname:'/',search:'',hash:'#guide'};
const history={replaceState(_state,_title,url){location.hash=new URL(url,location.origin).hash}};
const localStorage={setItem:(key,value)=>writes.push({key,value})};
const Date={now:()=>1000};
function setTimeout(callback,delay){if(scheduleFailure)throw scheduleFailure;const item={callback,delay,ran:false};timerQueue.push(item);return timerQueue.length}
function clearTimeout(){}
function addEventListener(){}
function dispatchEvent(event){if(event.type==='hd:workspace-changed')workspaceChanges.push(event.detail)}
class CustomEvent{constructor(type,options){this.type=type;this.detail=options.detail}}
function hdWSEnsureUI(){}
function hdWSSections(){return sections}
function hdWSManagedSectionFor(el){return sections.includes(el)?el:null}
function hdWSGroupForSection(){return 'guide'}
function hdWSResolveSection(group,preferred){return sections.some(el=>el.id===preferred)?preferred:hdWSState.sections[group]||'guide'}
function hdWSDefaultSection(){return 'guide'}
function hdWSPushHistory(){}
function hdWSRenderSubtabs(){}
function hdWSUpdateWrappers(){}
function hdWSUpdateBadges(){}
function hdWSRevealTab(){}
function hdWSUnhideAncestors(){}
function hdWSScheduleRefresh(){}
function hdMSNSelectMap(){}
function hdMSNRender(){}
function hdMSNMapSelected(){return '2-5'}
`;

function realm(withCompat=true){
 const context=vm.createContext({URL});
 vm.runInContext(setup+'\n'+extracted,context);
 if(withCompat){
  vm.runInContext(compat,context);
  vm.runInContext("(()=>{const timer=timerQueue.find(x=>x.delay===1600);if(!timer)throw Error('compat install schedule absent');timer.ran=true;timer.callback()})()",context);
 }
 const run=source=>vm.runInContext(source,context);
 const snapshot=()=>JSON.parse(run('JSON.stringify({section:hdWSCurrentSectionId(),directEpoch:Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH)||0,navSeq:hdWSNavSeq,nativeScrollTargets:nativeScrolls.map(x=>x.id),nativeScrollBehaviors:nativeScrolls.map(x=>x.args[0]?.behavior),workspaceChangeTargets:workspaceChanges.map(x=>x.section)})'));
 return {context,run,snapshot};
}
function schedule(r,kind,id='guide'){
 r.context.pendingId=id;
 const value=r.run(kind==='anchor'?"hdWSOpenAnchorId(pendingId,true)":"hdWSHandleAnchor({getAttribute:()=> '#'+pendingId})");
 assert.equal(value,true);
 r.run(`pendingTimer=timerQueue.find(x=>!x.ran&&x.delay===${kind==='anchor'?0:70});if(!pendingTimer)throw Error('original scroll timer absent')`);
}
function flush(r){return r.run('pendingTimer.ran=true;pendingTimer.callback()')}
for(const kind of ['anchor','handle']){
 test(kind+': legitimate deferred scroll keeps its destination and native behavior',()=>{
  const r=realm();schedule(r,kind);flush(r);
  assert.equal(r.snapshot().section,'guide');
  assert.deepEqual(r.snapshot().nativeScrollTargets,['guide']);
  assert.deepEqual(r.snapshot().nativeScrollBehaviors,[kind==='anchor'?'auto':'smooth']);
 });
 test(kind+': old native scroll without compatibility cannot select a new destination',()=>{
  const r=realm(false);schedule(r,kind);r.run("hdMSNOpen('2-5')");flush(r);
  assert.equal(r.snapshot().section,'mapStrategyNavigator');
 });
 test(kind+': actual compatibility cannot reopen the old guide after newer MSN navigation',()=>{
  const r=realm();schedule(r,kind);r.run("hdMSNOpen('2-5')");const before=r.snapshot();flush(r);
  assert.equal(before.section,'mapStrategyNavigator');
  assert.equal(r.snapshot().section,'mapStrategyNavigator');
  assert.equal(r.snapshot().directEpoch,before.directEpoch);
  assert.deepEqual(r.snapshot().nativeScrollTargets,['mapStrategyNavigator']);
 });
 test(kind+': a newer explicit guide selection cancels an old navigator scroll',()=>{
  const r=realm();schedule(r,kind,'mapStrategyNavigator');r.run("hdWSShowElement('guide',false)");const before=r.snapshot();flush(r);
  assert.equal(r.snapshot().section,'guide');
  assert.equal(r.snapshot().directEpoch,before.directEpoch);
  assert.deepEqual(r.snapshot().nativeScrollTargets,[]);
 });
 test(kind+': background apply does not cancel a still-current scroll',()=>{
  const r=realm();schedule(r,kind);const before=r.snapshot();r.run("hdWSApply('guide','guide',{ignorePin:true})");const afterApply=r.snapshot();flush(r);
  assert.equal(afterApply.directEpoch,before.directEpoch);
  assert.ok(afterApply.navSeq>before.navSeq);
  assert.equal(r.snapshot().section,'guide');
  assert.deepEqual(r.snapshot().nativeScrollTargets,['guide']);
 });
 test(kind+': native exception identity is preserved for a still-current scroll',()=>{
  const r=realm(),sentinel=Object.freeze({kind:'native-scroll-failure'});schedule(r,kind);
  r.context.sentinel=sentinel;r.run('nativeScrollFailure=sentinel');
  assert.throws(()=>flush(r),error=>error===sentinel);
 });
}
test('anchor scroll=false neither schedules a scroll nor changes its return contract',()=>{
 const r=realm();assert.equal(r.run("hdWSOpenAnchorId('guide',false)"),true);
 assert.equal(r.run('timerQueue.filter(x=>!x.ran).length'),0);
 assert.deepEqual(r.snapshot().nativeScrollTargets,[]);
 assert.equal(r.snapshot().section,'guide');
});
test('invalid anchors remain false without scheduling or navigation',()=>{
 const r=realm();
 for(const source of ["hdWSOpenAnchorId('missing',true)","hdWSOpenAnchorId('kcimport=unchanged',true)","hdWSHandleAnchor({getAttribute:()=> '/not-a-hash'})","hdWSHandleAnchor({getAttribute:()=> '#'})"]){
  assert.equal(r.run(source),false);
 }
 assert.equal(r.run('timerQueue.filter(x=>!x.ran).length'),0);
 assert.equal(r.snapshot().directEpoch,0);
});
test('an original timer scheduling exception propagates unchanged',()=>{
 const r=realm(),sentinel=Object.freeze({kind:'timer-scheduling-failure'});r.context.sentinel=sentinel;r.run('scheduleFailure=sentinel');
 assert.throws(()=>r.run("hdWSOpenAnchorId('guide',true)"),error=>error===sentinel);
});
