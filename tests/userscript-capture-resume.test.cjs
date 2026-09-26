const fs=require('fs'),vm=require('vm'),assert=require('assert');
const raw=fs.readFileSync('HarborDesk-Kancolle.user.js','utf8');
const data=new Map(),localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
const port='/kcsapi/api_port/port',equip='/kcsapi/api_get_member/slot_item';
const portData={api_result:1,api_data:{api_ship:[{api_id:1,api_ship_id:1}],api_deck_port:[{api_id:1}]}};
const equipData={api_result:1,api_data:[{api_id:10,api_slotitem_id:1}]};
function boot(){const listeners={},links=[];const window={addEventListener:(n,f)=>listeners[n]=f};window.top=window;
 const context={window,localStorage,document:{readyState:'loading',addEventListener(){},createElement:()=>({style:{},click(){links.push(this.href)}}),documentElement:null},location:{href:'https://example.invalid'},setTimeout(){},URL,Date,TextEncoder,Buffer,btoa:x=>Buffer.from(x,'binary').toString('base64'),alert(){},console};
 vm.createContext(context);vm.runInContext(raw,context);return {api:window.__HARBORDESK_KANCOLLE_USERSCRIPT__,listeners,links,context};}
function record(run,endpoint,payload){run.listeners.message({data:{type:'harbordesk-kancolle-frame-record-v1',endpoint,payload}})}
(async()=>{let run=boot();record(run,port,portData);record(run,equip,equipData);
 assert.equal(run.api.ledgerReady(),true);assert.equal(run.api.exportObject().records.length,2);
 run=boot();assert.equal(run.api.ledgerReady(),true,'pending capture survives close');assert.equal(run.api.exportObject().records.length,2);
 run.context.document.documentElement={appendChild(){}};await run.api.send();assert.equal(run.links.length,1);assert.equal(run.api.ledgerReady(),false,'sent capture not offered as new');
 run=boot();assert.equal(run.api.ledgerReady(),false,'sent capture stays excluded after close');
 record(run,port,portData);record(run,equip,equipData);assert.equal(run.api.ledgerReady(),true,'same API payload received again counts as new');
 const old=JSON.parse(data.get('harbordesk-kc-capture-v1'));delete old.sentAt;data.set('harbordesk-kc-capture-v1',JSON.stringify(old));run=boot();assert.equal(run.api.ledgerReady(),false,'old script captures require explicit resend');
 console.log('pending capture resumes; sent and legacy captures not auto-reused; new identical response accepted');
})().catch(err=>{console.error(err);process.exitCode=1});
