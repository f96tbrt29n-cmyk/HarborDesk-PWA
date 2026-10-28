'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {install,snapshot}=require('./route-navigation-observer.cjs');

function setup(){
 const element=(id,parent=null)=>({id,parentElement:parent,hidden:false,display:'block',visibility:'visible',getClientRects(){for(let p=this;p;p=p.parentElement)if(p.hidden||p.display==='none'||p.visibility==='hidden')return [];return [{}]}});
 const html=element(''),body=element('',html),main=element('appMain',body),nav=element('mapStrategyNavigator',main),guide=element('guide',main),panel=element('',nav),button=element('',panel),select={value:'mapStrategyNavigator'};
 guide.display='none';button.closest=()=>nav;
 for(const el of [html,body,main,nav,guide,panel,button])for(const name of ['textContent','innerText'])Object.defineProperty(el,name,{get(){throw Error('page text must not be read')}});
 const elements={guide,mapStrategyNavigator:nav,hdWorkspaceSectionSelect:select};
 const document={getElementById:id=>elements[id]||null,querySelector:selector=>selector==='#mapStrategyNavigator .hd-oc-panel [data-hd-oc-search]'?button:null,querySelectorAll:selector=>selector==='section[data-hd-workspace-group]'?[nav,guide]:[]};
 const forbidden=()=>{throw Error('new asynchronous or external work is forbidden')};
 const c=vm.createContext({document,performance:{timeOrigin:123,now:()=>7},getComputedStyle:el=>({display:el.display,visibility:el.visibility}),localStorage:new Proxy({},{get(){throw Error('Storage access')}}),sessionStorage:new Proxy({},{get(){throw Error('Storage access')}}),location:new Proxy({},{get(){throw Error('URL access')}}),setTimeout:forbidden,setInterval:forbidden,queueMicrotask:forbidden,fetch:forbidden,console:{debug:forbidden,log:forbidden},Error:class extends Error{constructor(){super();this.stack='Error\n at deferredCaller (http://127.0.0.1:4173/workspace-tabs.js?token=private-query#fragment:42:7)'}},hdWSApply:function(){},hdWSRevealElement:function(){}});
 return {c,document,nav,guide,button,select,install:()=>vm.runInContext('('+install.toString()+')()',c),snapshot:()=>vm.runInContext('('+snapshot.toString()+')()',c)};
}

test('navigation entrance wrappers preserve receiver, argument and return identities, including strict undefined this',()=>{
 const h=setup(),receiver={},arg=Object.defineProperty({},'privateValue',{enumerable:true,get(){throw Error('arguments must not be inspected')}}),calls=[];
 h.c.hdWSApply=function(value){'use strict';calls.push({receiver:this,value});h.select.value='guide';return value};
 h.c.hdWSRevealElement=function(){'use strict';return this};
 const installed=h.install();assert.equal(installed.installed.hdWSApply,true);assert.equal(installed.installed.hdWSRevealElement,true);
 assert.equal(h.c.hdWSApply.call(receiver,arg),arg);assert.equal(calls.length,1);assert.equal(calls[0].receiver,receiver);assert.equal(calls[0].value,arg);
 assert.equal(h.c.hdWSRevealElement.call(undefined),undefined);
 const events=h.snapshot().events;assert.equal(events[1].before,'mapStrategyNavigator');assert.equal(events[1].after,'guide');
 assert.ok(events[1].stack.includes('deferredCaller'));assert.ok(events[1].stack.includes('workspace-tabs.js:42:7'));assert.ok(!events[1].stack.includes('private-query'));assert.ok(!events[1].stack.includes('?token='));
});

test('nested calls and original exceptions remain intact without wrapping promises or asynchronous callbacks',()=>{
 const h=setup(),receiver={},value={};h.c.result=value;
 vm.runInContext("hdWSApply=function(v){'use strict';document.getElementById('hdWorkspaceSectionSelect').value='guide';return v};hdWSRevealElement=function(v){'use strict';return hdWSApply.call(this,v)}",h.c);
 h.install();assert.equal(h.c.hdWSRevealElement.call(receiver,value),value);
 assert.deepEqual(Array.from(h.snapshot().events,e=>e.entry),['installed','hdWSApply','hdWSRevealElement']);
 const promiseLike=Object.defineProperty({},'then',{get(){throw Error('return value must not be inspected')}}),h2=setup(),originalError={privateValue:'exception body must not be collected'};
 h2.c.hdWSApply=()=>promiseLike;h2.c.hdWSRevealElement=()=>{throw originalError};h2.install();assert.equal(h2.c.hdWSApply(),promiseLike);
 assert.throws(()=>h2.c.hdWSRevealElement(),error=>error===originalError);assert.equal(h2.snapshot().events.length,3);assert.ok(!JSON.stringify(h2.snapshot()).includes(originalError.privateValue));
});

test('the per-document cap and installation are bounded and idempotent while every original call still executes',()=>{
 const h=setup();let originalCalls=0;h.c.hdWSApply=()=>++originalCalls;
 h.install();const wrapped=h.c.hdWSApply;h.install();assert.equal(h.c.hdWSApply,wrapped);
 for(let i=0;i<70;i++)h.c.hdWSApply();
 const out=h.snapshot();assert.equal(originalCalls,70);assert.equal(out.cap,64);assert.equal(out.events.length,64);assert.equal(out.sequence,71);assert.equal(out.drop,7);assert.equal(out.failures,0);
 assert.deepEqual(Array.from(out.events,e=>e.sequence),Array.from({length:64},(_,i)=>i+1));
 const other=setup();other.install();assert.equal(other.snapshot().drop,0);assert.equal(other.snapshot().events.length,1);
});

test('collector failures cannot replace an original return or exception and missing entrances are explicit',()=>{
 const h=setup(),value={},originalError={privateValue:'original exception'};h.c.hdWSApply=()=>value;h.c.hdWSRevealElement=()=>{throw originalError};h.install();
 const get=h.document.getElementById;h.document.getElementById=()=>{throw Error('collector failed')};
 assert.equal(h.c.hdWSApply(),value);assert.throws(()=>h.c.hdWSRevealElement(),error=>error===originalError);h.document.getElementById=get;
 assert.ok(h.snapshot().failures>=4);
 const missing=setup();missing.c.hdWSRevealElement=undefined;const result=missing.install();assert.equal(result.installed.hdWSApply,true);assert.equal(result.installed.hdWSRevealElement,false);assert.equal(result.failures,1);
});

test('snapshot records only bounded IDs and visibility metadata and returns independent copies',()=>{
 const h=setup();h.install();h.nav.display='none';h.guide.display='block';
 const out=h.snapshot();assert.equal(out.selectedId,'mapStrategyNavigator');assert.deepEqual(Array.from(out.visibleSectionIds),['guide']);assert.equal(out.button.present,true);assert.equal(out.button.hidden,true);assert.equal(out.button.targetSectionId,'mapStrategyNavigator');assert.deepEqual(Array.from(out.button.hiddenAncestorIds),['mapStrategyNavigator']);
 assert.equal(out.sectionStates.find(x=>x.id==='mapStrategyNavigator').hidden,true);assert.equal(out.failures,0);
 out.events[0].before='changed copy';assert.equal(h.snapshot().events[0].before,'mapStrategyNavigator');
 h.select.value='guide?token=private-query';assert.equal(h.snapshot().selectedId,null);
});

test('uninstalled documents and unwrapped bypass entrances remain identifiable limits rather than inferred caller evidence',()=>{
 const h=setup(),cached=h.c.hdWSApply,refresh=function(){},timerCallback=function(){};h.c.hdWSRefresh=refresh;h.c.existingCallback=timerCallback;
 assert.equal(h.snapshot().installed,false);h.install();assert.equal(h.c.hdWSRefresh,refresh);assert.equal(h.c.existingCallback,timerCallback);
 const before=h.snapshot().events.length;cached();assert.equal(h.snapshot().events.length,before);
});
