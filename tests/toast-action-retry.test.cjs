const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function harness(){
 const timers=new Map();let next=0,created=0;
 function element(){
  const classes=new Set();return {children:[],textContent:'',setAttribute(){},
   classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},
   append(...nodes){this.children.push(...nodes)},addEventListener(type,fn,options){let used=false;this[type]=()=>{if(options?.once&&used)return;used=true;return fn()}}};
 }
 let host=null;
 const document={getElementById:()=>host,createElement:element,body:{appendChild(el){host=el}}};
 const context={document,window:{},setTimeout(fn,ms){created++;timers.set(++next,{fn,ms});return next},clearTimeout(id){timers.delete(id)}};
 const source=fs.readFileSync(require.resolve('../app.js'),'utf8');
 vm.runInNewContext('let HD_TOAST_TIMER=0;'+source.slice(source.indexOf('function hdToastAction('),source.indexOf('window.hdToastAction=hdToastAction;')+'window.hdToastAction=hdToastAction;'.length),context);
 return {action:context.window.hdToastAction,timers,get created(){return created}};
}
test('explicit false retains the same undo button and original 5000ms deadline until recovery',()=>{
 const h=harness();let calls=0;
 const host=h.action('deleted','undo',()=>++calls<3?false:undefined),button=host.children[1],timer=[...h.timers][0];
 button.click();button.click();assert.equal(calls,2);assert.equal(host.classList.contains('show'),true);
 assert.equal(host.children[1],button);assert.equal(h.created,1);assert.equal(h.timers.get(timer[0]),timer[1]);assert.equal(timer[1].ms,5000);
 button.click();button.click();assert.equal(calls,3);assert.equal(host.classList.contains('show'),false);assert.equal(h.timers.size,0);
});
test('failed undo cannot extend expiry or run after the original deadline',()=>{
 const h=harness();let calls=0;const host=h.action('deleted','undo',()=>{calls++;return false}),button=host.children[1];
 button.click();[...h.timers.values()][0].fn();button.click();
 assert.equal(calls,1);assert.equal(host.classList.contains('show'),false);assert.equal(h.created,1);
});
test('existing undefined result keeps one-shot success and explicit duration',()=>{
 const h=harness();let calls=0;const host=h.action('deleted','undo',()=>{calls++},6500),button=host.children[1];
 assert.equal([...h.timers.values()][0].ms,6500);button.click();button.click();assert.equal(calls,1);assert.equal(h.timers.size,0);
});
test('callback exceptions propagate and terminate the action rather than being swallowed',()=>{
 const h=harness(),error=new Error('original callback error');let calls=0;
 const host=h.action('deleted','undo',()=>{calls++;throw error}),button=host.children[1];
 assert.throws(()=>button.click(),e=>e===error);button.click();assert.equal(calls,1);assert.equal(host.classList.contains('show'),false);assert.equal(h.timers.size,0);
});
