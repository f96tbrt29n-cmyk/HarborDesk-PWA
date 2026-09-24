// Card assets are pinned to an immutable upstream revision; never substitute remodel IDs.
const HD_SHIP_IMAGE_SOURCE={repository:'https://github.com/Nishisonic/gkcoi',revision:'c6265b152e17a8ad6529fd1215f84ccd0304fce5',baseUrl:'https://raw.githubusercontent.com/Nishisonic/gkcoi/c6265b152e17a8ad6529fd1215f84ccd0304fce5/static/ship/card/',ids:new Set([1,10,100,1000,1001,1002,1003,1005,1006,1007,1008,101,1010,102,1022,1023,1025,1027,1028,103,1030,1031,1033,1034,1035,1036,104,1040,1041,1044,1046,105,1051,1053,1055,1056,1058,106,1060,1061,1062,1065,1067,107,1070,1071,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,123,124,125,126,127,128,129,13,130,131,132,133,134,135,136,137,138,139,14,140,141,142,143,144,145,146,147,148,149,1496,15,150,151,152,153,154,155,156,157,158,159,16,160,161,162,163,164,165,166,167,168,169,17,170,171,172,173,174,175,176,177,178,179,18,180,181,182,183,184,185,186,187,188,189,19,190,191,192,193,194,195,196,197,198,199,2,20,200,201,202,203,204,205,206,207,208,209,21,210,211,212,213,214,215,216,217,218,219,22,220,221,222,223,224,225,226,227,228,229,23,230,231,232,233,234,235,236,237,238,239,24,240,241,242,243,244,245,246,247,248,249,25,250,251,252,253,254,255,256,257,258,259,26,260,261,262,263,264,265,266,267,268,269,27,270,271,272,273,274,275,276,277,278,279,28,280,281,282,283,284,285,286,287,288,289,29,290,291,292,293,294,295,296,297,299,30,300,301,302,303,304,305,306,307,308,309,31,310,311,312,313,314,316,317,318,319,32,320,321,322,323,324,325,326,327,328,329,33,330,331,332,334,34,343,344,345,346,347,348,349,35,350,351,352,353,354,355,356,357,358,359,36,360,361,362,363,364,365,366,367,368,369,37,370,371,372,373,374,375,376,377,378,379,38,380,381,382,383,384,385,386,387,39,390,391,392,393,394,395,396,397,398,399,40,400,401,402,403,404,405,406,407,408,409,41,410,411,412,413,414,415,416,417,418,419,42,420,421,422,423,424,425,426,427,428,429,43,430,431,432,433,434,435,436,437,438,439,44,440,441,442,443,444,445,446,447,448,449,45,450,451,452,453,454,455,456,457,458,459,46,460,461,462,463,464,465,466,467,468,469,47,470,471,472,473,474,475,476,477,478,479,48,480,481,483,484,485,486,487,488,489,49,490,491,492,493,494,495,496,497,498,499,50,500,501,502,503,504,506,507,508,509,51,511,512,513,514,515,516,517,518,519,52,520,521,522,524,525,526,527,528,529,53,530,531,532,533,534,535,536,537,538,539,54,540,541,542,543,544,545,546,547,548,549,55,550,551,552,553,554,555,556,557,558,559,56,560,561,562,563,564,565,566,567,568,569,57,570,571,572,573,574,575,576,577,578,579,58,580,581,582,583,584,585,586,587,588,589,59,590,591,592,593,594,595,596,597,598,599,6,60,600,601,602,603,604,605,606,607,609,61,610,611,612,613,614,615,616,617,618,619,62,620,621,622,623,624,625,626,627,628,629,63,630,631,632,633,634,635,636,637,638,639,64,640,641,642,643,644,645,646,647,648,649,65,650,651,652,653,654,655,656,657,658,659,66,660,662,663,665,666,667,668,67,670,671,674,675,678,679,68,680,681,684,685,686,687,688,689,69,690,691,692,693,694,695,696,697,698,699,7,70,700,701,702,703,704,705,706,707,708,709,71,710,711,712,713,714,715,716,717,718,719,72,720,721,722,723,724,725,726,727,728,729,73,730,731,732,733,734,735,736,737,738,739,74,740,741,742,743,744,745,746,747,748,749,75,76,77,78,79,80,81,82,83,84,85,86,87,877,878,879,88,881,882,883,884,885,886,887,888,889,89,891,892,893,894,895,896,897,898,899,9,90,900,901,903,904,905,906,908,909,91,910,911,913,915,916,918,92,920,921,922,923,924,925,926,927,928,929,93,930,931,932,933,934,935,936,937,938,939,94,940,941,942,943,944,945,948,949,95,951,952,953,954,955,956,957,958,959,96,960,961,962,963,964,965,966,967,968,969,97,970,971,972,973,975,976,977,978,979,98,981,982,983,984,985,986,987,988,989,99,990,991,992,993,994,995,996,997,998,999])};
const HD_SHIP_IMAGE_DB='harbordesk-ship-images-v1';
const HD_SHIP_IMAGE_STORE='images';
const HD_SHIP_IMAGE_CONFIG_KEY='harbordesk-ship-image-config-v1';
const HD_SHIP_IMAGE_VERIFY_KEY='harbordesk-ship-image-verify-v1';
const HD_SHIP_IMAGE_LAST_BACKUP_KEY='harbordesk-last-ship-image-backup-v1';
let HD_SHIP_IMAGE_DB_PROMISE=null;
const HD_SHIP_IMAGE_OBJECT_URLS=new Map();
const HD_SHIP_IMAGE_LOCAL_IDS=new Set();
let HD_SHIP_IMAGE_LOCAL_IDS_READY=false;

function hdShipImageEsc(s){return typeof hdShipDbEsc==='function'?hdShipDbEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdShipImageRows(){return Object.values(window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips||{})}
function hdShipImageResolve(ref){
 if(ref&&typeof ref==='object'&&ref.id!=null)return {id:Number(ref.id),name:String(ref.name||'')};
 const raw=String(ref??'').trim();if(!raw)return null;
 if(/^\d+$/.test(raw)){const row=window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips?.[raw];return row?{id:Number(row.id),name:String(row.name||'')}:{id:Number(raw),name:''}}
 const row=hdShipImageRows().find(x=>String(x.name||'').trim()===raw);
 return row?{id:Number(row.id),name:String(row.name||'')}:null;
}
function hdShipIdentityStatus(input){
 const name=String(input?.name??input?.ship??(typeof input==='string'?input:'')).trim(),id=Number(input?.masterId??input?.id)||0;
 const byId=id?window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips?.[String(id)]||null:null;
 const byName=name?hdShipImageRows().find(x=>String(x.name||'').trim()===name)||null:null;
 if(id&&byId){
  const canonical=String(byId.name||'');
  return {status:name&&name!==canonical?'mismatch':'exact',id:Number(byId.id),name,canonical,resolved:true,master:byId};
 }
 if(id&&!byId){
  return {status:byName?'invalid-id':'unresolved',id,name,canonical:String(byName?.name||''),resolved:!!byName,master:byName||null,suggestedId:Number(byName?.id)||0};
 }
 if(!id&&byName){
  return {status:'missing-id',id:0,name,canonical:String(byName.name||''),resolved:true,master:byName,suggestedId:Number(byName.id)||0};
 }
 return {status:'unresolved',id,name,canonical:'',resolved:false,master:null,suggestedId:0};
}
function hdShipIdentityRef(input){
 const s=hdShipIdentityStatus(input);
 if(s.id&&s.master)return {id:s.id,name:s.canonical||s.name};
 if(s.suggestedId&&s.master)return {id:s.suggestedId,name:s.canonical||s.name};
 return s.name||'';
}
function hdShipImageConfig(){
 try{const x=JSON.parse(localStorage.getItem(HD_SHIP_IMAGE_CONFIG_KEY)||'{}');return {remoteTemplate:String(x.remoteTemplate||'').trim(),autoSource:x.autoSource!==false}}catch{return {remoteTemplate:'',autoSource:true}}
}
function hdShipImageSaveConfig(v){localStorage.setItem(HD_SHIP_IMAGE_CONFIG_KEY,JSON.stringify({remoteTemplate:String(v?.remoteTemplate||'').trim(),autoSource:v?.autoSource??hdShipImageConfig().autoSource}));window.dispatchEvent(new CustomEvent('hd:ship-images-changed'))}
function hdShipImageVerifyLoad(){
 try{
  const raw=JSON.parse(localStorage.getItem(HD_SHIP_IMAGE_VERIFY_KEY)||'null');
  const hashes={};
  if(raw?.hashes&&typeof raw.hashes==='object')for(const [id,h] of Object.entries(raw.hashes)){const hash=String(h||'').toLowerCase().trim();if(/^\d+$/.test(id)&&/^[0-9a-f]{64}$/.test(hash))hashes[String(Number(id))]=hash}
  if(Array.isArray(raw?.entries))for(const x of raw.entries||[]){const id=Number(x?.id),hash=String(x?.sha256||x?.hash||'').toLowerCase().trim();if(id&&/^[0-9a-f]{64}$/.test(hash))hashes[String(id)]=hash}
  return {format:'harbordesk-ship-image-hashes',version:1,source:String(raw?.source||''),updatedAt:String(raw?.updatedAt||''),hashes};
 }catch{return {format:'harbordesk-ship-image-hashes',version:1,source:'',updatedAt:'',hashes:{}}}
}
function hdShipImageVerifySave(v){
 const hashes={};for(const [id,h] of Object.entries(v?.hashes||{})){const hash=String(h||'').toLowerCase().trim();if(/^\d+$/.test(id)&&/^[0-9a-f]{64}$/.test(hash))hashes[String(Number(id))]=hash}
 const out={format:'harbordesk-ship-image-hashes',version:1,source:String(v?.source||''),updatedAt:String(v?.updatedAt||new Date().toISOString()),hashes};
 localStorage.setItem(HD_SHIP_IMAGE_VERIFY_KEY,JSON.stringify(out));window.dispatchEvent(new CustomEvent('hd:ship-images-changed',{detail:{verifyManifest:true,count:Object.keys(hashes).length}}));return out;
}
function hdShipImageVerifyStatus(id,hash=''){
 const manifest=hdShipImageVerifyLoad(),expected=manifest.hashes[String(Number(id))]||'',actual=String(hash||'').toLowerCase();
 if(!expected)return {status:'unverified',expected:'',actual,source:manifest.source||''};
 if(!actual)return {status:'pending',expected,actual:'',source:manifest.source||''};
 return {status:actual===expected?'verified':'mismatch',expected,actual,source:manifest.source||''};
}
async function hdShipImageImportVerifyManifest(file){
 if(!file)throw new Error('検証表ファイルがない');
 const text=await file.text();let raw;try{raw=JSON.parse(text)}catch{throw new Error('JSONとして読めない')}
 const hashes={};
 if(raw?.hashes&&typeof raw.hashes==='object')for(const [id,h] of Object.entries(raw.hashes)){const hash=String(h||'').toLowerCase().trim();if(/^\d+$/.test(id)&&/^[0-9a-f]{64}$/.test(hash))hashes[String(Number(id))]=hash}
 if(Array.isArray(raw?.entries))for(const x of raw.entries){const id=Number(x?.id),hash=String(x?.sha256||x?.hash||'').toLowerCase().trim();if(id&&/^[0-9a-f]{64}$/.test(hash))hashes[String(id)]=hash}
 if(!Object.keys(hashes).length)throw new Error('有効なID→SHA-256が見つからない');
 return hdShipImageVerifySave({hashes,source:raw?.source||file.name,updatedAt:raw?.updatedAt||new Date().toISOString()});
}
function hdShipImageExportVerifyTemplate(){
 const rows=hdShipImageRows().sort((a,b)=>Number(a.id)-Number(b.id)).map(x=>({id:Number(x.id),name:String(x.name||''),sha256:''}));
 const out={format:'harbordesk-ship-image-hashes',version:1,source:'user-supplied-reference',updatedAt:new Date().toISOString(),entries:rows};
 const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='HarborDesk-ship-image-hash-template.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function hdShipImageDbError(err,fallback='艦娘画像DBでエラーが発生しました'){
 if(err instanceof Error)return err;
 const message=String(err?.message||err||fallback).trim()||fallback;
 return new Error(message);
}
function hdShipImageOpenDb(){
 if(HD_SHIP_IMAGE_DB_PROMISE)return HD_SHIP_IMAGE_DB_PROMISE;
 const pending=new Promise((resolve,reject)=>{
  let req;
  try{req=indexedDB.open(HD_SHIP_IMAGE_DB,1)}catch(err){reject(hdShipImageDbError(err,'艦娘画像DBを開けません'));return}
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(HD_SHIP_IMAGE_STORE))db.createObjectStore(HD_SHIP_IMAGE_STORE,{keyPath:'id'})};
  req.onsuccess=()=>{
   const db=req.result;
   db.onversionchange=()=>{try{db.close()}catch{}HD_SHIP_IMAGE_DB_PROMISE=null};
   resolve(db);
  };
  req.onerror=()=>reject(hdShipImageDbError(req.error,'艦娘画像DBを開けません'));
 });
 HD_SHIP_IMAGE_DB_PROMISE=pending.catch(err=>{HD_SHIP_IMAGE_DB_PROMISE=null;throw hdShipImageDbError(err,'艦娘画像DBを開けません')});
 return HD_SHIP_IMAGE_DB_PROMISE;
}
function hdShipImageHydrateStoredRow(row){
 if(!row)return null;
 if(row.blob instanceof Blob)return row;
 const raw=row.bytes;
 let bytes=null;
 if(raw instanceof ArrayBuffer)bytes=raw;
 else if(ArrayBuffer.isView(raw))bytes=raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength);
 if(!bytes)return row;
 return {...row,blob:new Blob([bytes],{type:String(row.type||'application/octet-stream')})};
}
async function hdShipImageStorageRow(row){
 if(!row)return row;
 const blob=row.blob instanceof Blob?row.blob:null;
 let bytes=row.bytes;
 if(blob)bytes=await blob.arrayBuffer();
 else if(ArrayBuffer.isView(bytes))bytes=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
 return {
  id:Number(row.id),name:String(row.name||''),bytes:bytes instanceof ArrayBuffer?bytes:new ArrayBuffer(0),
  type:String(row.type||blob?.type||''),hash:String(row.hash||''),updatedAt:Number(row.updatedAt)||Date.now()
 };
}
async function hdShipImageGet(id){
 try{
  const db=await hdShipImageOpenDb();
  const row=await new Promise((resolve,reject)=>{
   const tx=db.transaction(HD_SHIP_IMAGE_STORE,'readonly'),req=tx.objectStore(HD_SHIP_IMAGE_STORE).get(Number(id));
   req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)
  });
  return hdShipImageHydrateStoredRow(row)
 }catch{return null}
}
async function hdShipImageRefreshLocalIds(){
 try{
  const db=await hdShipImageOpenDb(),keys=await new Promise((resolve,reject)=>{const tx=db.transaction(HD_SHIP_IMAGE_STORE,'readonly'),req=tx.objectStore(HD_SHIP_IMAGE_STORE).getAllKeys();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error)});
  HD_SHIP_IMAGE_LOCAL_IDS.clear();for(const id of keys)HD_SHIP_IMAGE_LOCAL_IDS.add(Number(id));HD_SHIP_IMAGE_LOCAL_IDS_READY=true;return new Set(HD_SHIP_IMAGE_LOCAL_IDS);
 }catch{HD_SHIP_IMAGE_LOCAL_IDS_READY=true;return new Set()}
}
function hdShipImageHasLocalSync(ref){
 const row=hdShipImageResolve(ref);return !!(row?.id&&HD_SHIP_IMAGE_LOCAL_IDS.has(Number(row.id)));
}
async function hdShipImageCoverage(){
 if(!HD_SHIP_IMAGE_LOCAL_IDS_READY)await hdShipImageRefreshLocalIds();
 const total=hdShipImageRows().length,local=HD_SHIP_IMAGE_LOCAL_IDS.size;
 return {local,total,missing:Math.max(0,total-local)};
}
async function hdShipImagePut(id,file,name='',silent=false){
 const row=hdShipImageResolve(id)||{id:Number(id),name:String(name||'')};if(!row?.id||!file)return false;
 const hash=await hdShipImageHash(file),db=await hdShipImageOpenDb();
 const stored=await hdShipImageStorageRow({id:Number(row.id),name:row.name||String(name||''),blob:file,type:file.type||'',hash,updatedAt:Date.now()});
 await new Promise((resolve,reject)=>{
  let settled=false;
  const fail=err=>{if(settled)return;settled=true;reject(hdShipImageDbError(err,'艦娘画像の保存に失敗しました'))};
  let tx,req;
  try{
   tx=db.transaction(HD_SHIP_IMAGE_STORE,'readwrite');
   req=tx.objectStore(HD_SHIP_IMAGE_STORE).put(stored);
  }catch(err){fail(err);return}
  req.onerror=()=>fail(req.error||tx?.error);
  tx.onerror=()=>fail(tx.error||req?.error);
  tx.onabort=()=>fail(tx.error||req?.error);
  tx.oncomplete=()=>{if(settled)return;settled=true;resolve()};
 });
 HD_SHIP_IMAGE_LOCAL_IDS.add(Number(row.id));HD_SHIP_IMAGE_LOCAL_IDS_READY=true;hdShipImageRevoke(row.id);if(!silent)window.dispatchEvent(new CustomEvent('hd:ship-images-changed',{detail:{id:row.id,name:row.name}}));return true;
}
async function hdShipImageDelete(id){
 try{const db=await hdShipImageOpenDb();await new Promise((resolve,reject)=>{const tx=db.transaction(HD_SHIP_IMAGE_STORE,'readwrite');tx.objectStore(HD_SHIP_IMAGE_STORE).delete(Number(id));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});HD_SHIP_IMAGE_LOCAL_IDS.delete(Number(id));HD_SHIP_IMAGE_LOCAL_IDS_READY=true;hdShipImageRevoke(id);window.dispatchEvent(new CustomEvent('hd:ship-images-changed',{detail:{id:Number(id),deleted:true}}));return true}catch{return false}
}
async function hdShipImageCount(){
 if(!HD_SHIP_IMAGE_LOCAL_IDS_READY)await hdShipImageRefreshLocalIds();return HD_SHIP_IMAGE_LOCAL_IDS.size;
}
async function hdShipImageAll(){
 try{
  const db=await hdShipImageOpenDb();
  const rows=await new Promise((resolve,reject)=>{
   const tx=db.transaction(HD_SHIP_IMAGE_STORE,'readonly'),req=tx.objectStore(HD_SHIP_IMAGE_STORE).getAll();
   req.onsuccess=()=>resolve(Array.isArray(req.result)?req.result:[]);req.onerror=()=>reject(req.error)
  });
  return rows.map(hdShipImageHydrateStoredRow)
 }catch{return []}
}
async function hdShipImageHash(blob){
 if(!blob||!blob.size||!crypto?.subtle)return '';
 try{const buf=await blob.arrayBuffer(),digest=await crypto.subtle.digest('SHA-256',buf);return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch{return ''}
}
async function hdShipImagePersistAuditMeta(rows){
 if(!rows?.length)return;
 try{
  const stored=[];for(const row of rows)stored.push(await hdShipImageStorageRow(row));
  const db=await hdShipImageOpenDb();
  await new Promise((resolve,reject)=>{
   const tx=db.transaction(HD_SHIP_IMAGE_STORE,'readwrite'),store=tx.objectStore(HD_SHIP_IMAGE_STORE);
   for(const row of stored)store.put(row);
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)
  })
 }catch{}
}
async function hdShipImageIntegrityAudit(deep=false){
 const rows=await hdShipImageAll(),master=window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips||{},invalidId=[],empty=[],badType=[],nameMismatch=[],unhashed=[],changed=[],byHash=new Map();
 let bytes=0;
 for(const row of rows){
  const id=Number(row?.id)||0,m=master[String(id)]||null,blob=row?.blob||null,type=String(row?.type||blob?.type||'');
  bytes+=Number(blob?.size)||0;
  if(!id||!m)invalidId.push({id,name:String(row?.name||''),size:Number(blob?.size)||0});
  if(!blob||!(Number(blob.size)>0))empty.push({id,name:String(row?.name||'')});
  if(blob&&(!type.startsWith('image/')||!String(blob.type||type).startsWith('image/')))badType.push({id,name:String(row?.name||''),type});
  if(m&&row?.name&&String(row.name)!==String(m.name||''))nameMismatch.push({id,name:String(row.name),canonical:String(m.name||'')});
  let hash=String(row?.hash||'');
  if(deep&&blob?.size&& !hash){hash=await hdShipImageHash(blob);if(hash){row.hash=hash;changed.push(row)}}
  if(!hash&&blob?.size)unhashed.push({id,name:String(m?.name||row?.name||'')});
  if(hash){const arr=byHash.get(hash)||[];arr.push({id,name:String(m?.name||row?.name||''),size:Number(blob?.size)||0});byHash.set(hash,arr)}
 }
 if(changed.length)await hdShipImagePersistAuditMeta(changed);
 const duplicates=[...byHash.entries()].filter(([,items])=>items.length>1).map(([hash,items])=>({hash,items}));
 const verify=hdShipImageVerifyLoad(),verified=[],mismatch=[],unverified=[];
 for(const row of rows){const v=hdShipImageVerifyStatus(row.id,row.hash||'');if(v.status==='verified')verified.push({id:Number(row.id),name:String(master[String(row.id)]?.name||row.name||'')});else if(v.status==='mismatch')mismatch.push({id:Number(row.id),name:String(master[String(row.id)]?.name||row.name||''),expected:v.expected,actual:v.actual});else unverified.push({id:Number(row.id),name:String(master[String(row.id)]?.name||row.name||''),status:v.status})}
 const out={at:Date.now(),deep,total:rows.length,bytes,invalidId,empty,badType,nameMismatch,unhashed,duplicates,verifyEntries:Object.keys(verify.hashes||{}).length,verified,mismatch,unverified,issues:invalidId.length+empty.length+badType.length+mismatch.length};
 window.__hdShipImageIntegrityLast=out;return out;
}
function hdShipImageIntegritySummary(a){
 if(!a)return '未確認';
 const parts=[`${a.total}形態`,`壊れ/無効 ${a.issues}件`];
 if(a.verifyEntries)parts.push(`一致 ${a.verified.length} / 不一致 ${a.mismatch.length} / 未検証 ${a.unverified.length}`);
 if(a.deep)parts.push(`同一画像候補 ${a.duplicates.length}組`);
 else if(a.unhashed.length)parts.push(`指紋未確認 ${a.unhashed.length}件`);
 return parts.join('・');
}

async function hdShipImageBuildBackup(){
 const rows=(await hdShipImageAll()).filter(x=>x?.blob&&Number(x.id)>0).sort((a,b)=>Number(a.id)-Number(b.id));
 const entries=rows.map(x=>({id:Number(x.id),name:String(x.name||''),type:String(x.type||x.blob.type||'application/octet-stream'),size:Number(x.blob.size)||0}));
 const manifest={format:'harbordesk-ship-images',version:1,createdAt:new Date().toISOString(),masterSource:window.HD_KANCOLLE_MASTER_SNAPSHOT?.source||null,config:hdShipImageConfig(),verify:hdShipImageVerifyLoad(),entries};
 const enc=new TextEncoder(),magic=enc.encode('HDSI1\n'),meta=enc.encode(JSON.stringify(manifest)),len=new Uint8Array(4);new DataView(len.buffer).setUint32(0,meta.byteLength,true);
 return {blob:new Blob([magic,len,meta,...rows.map(x=>x.blob)],{type:'application/x-harbordesk-ship-images'}),manifest};
}
function hdShipImageBackupName(){return `HarborDesk-ship-images-${new Date().toISOString().slice(0,10)}.hdshipimg`}
function hdShipImageMarkBackup(){
 const at=Date.now();try{localStorage.setItem(HD_SHIP_IMAGE_LAST_BACKUP_KEY,String(at))}catch{}
 window.dispatchEvent(new CustomEvent('hd:ship-image-backup',{detail:{at}}));return at;
}
function hdShipImageDownloadBackup(out){
 if(!out?.manifest?.entries?.length)return false;
 const a=document.createElement('a'),url=URL.createObjectURL(out.blob);a.href=url;a.download=hdShipImageBackupName();document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);hdShipImageMarkBackup();return true;
}
async function hdShipImageExportBackup(){
 const out=await hdShipImageBuildBackup();if(!out.manifest.entries.length){alert?.('端末保存の艦娘画像がまだないよ');return false}
 return hdShipImageDownloadBackup(out);
}
async function hdShipImageShareBackup(){
 const out=await hdShipImageBuildBackup();if(!out.manifest.entries.length){alert?.('端末保存の艦娘画像がまだないよ');return false}
 try{
  if(typeof File==='function'&&typeof navigator.share==='function'){
   const file=new File([out.blob],hdShipImageBackupName(),{type:'application/x-harbordesk-ship-images'}),payload={title:'HarborDesk 艦娘画像バックアップ',files:[file]};
   if(typeof navigator.canShare!=='function'||navigator.canShare(payload)){await navigator.share(payload);hdShipImageMarkBackup();return true}
  }
 }catch(err){if(err?.name==='AbortError')return false}
 return hdShipImageDownloadBackup(out);
}
async function hdShipImageReadBackup(file){
 if(!file||file.size<10)throw new Error('バックアップファイルが短すぎる');
 const enc=new TextDecoder(),head=new Uint8Array(await file.slice(0,10).arrayBuffer());
 if(enc.decode(head.slice(0,6))!=='HDSI1\n')throw new Error('HarborDesk艦娘画像バックアップではない');
 const metaLen=new DataView(head.buffer,head.byteOffset+6,4).getUint32(0,true);
 if(!metaLen||metaLen>Math.min(file.size-10,5*1024*1024))throw new Error('マニフェスト長が不正');
 const manifest=JSON.parse(enc.decode(new Uint8Array(await file.slice(10,10+metaLen).arrayBuffer())));
 if(manifest?.format!=='harbordesk-ship-images'||Number(manifest.version)!==1||!Array.isArray(manifest.entries))throw new Error('未対応のバックアップ形式');
 if(manifest.entries.length>2000)throw new Error('画像件数が多すぎる');
 let cursor=10+metaLen;const items=[];
 for(const x of manifest.entries){
  const id=Number(x.id),size=Number(x.size),type=String(x.type||'application/octet-stream'),master=window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips?.[String(id)];
  if(!id||!master||!Number.isFinite(size)||size<0||cursor+size>file.size)throw new Error(`画像エントリが不正: ID ${id||'?'}`);
  if(!type.startsWith('image/'))throw new Error(`画像形式ではない: ID ${id}`);
  items.push({id,name:String(master.name||x.name||''),type,size,blob:file.slice(cursor,cursor+size,type)});cursor+=size;
 }
 return {manifest,items};
}
async function hdShipImageImportBackup(file){
 const parsed=await hdShipImageReadBackup(file);let ok=0;
 for(const x of parsed.items){if(await hdShipImagePut(x.id,x.blob,x.name,true))ok++}
 if(parsed.manifest?.config?.remoteTemplate!=null)localStorage.setItem(HD_SHIP_IMAGE_CONFIG_KEY,JSON.stringify({remoteTemplate:String(parsed.manifest.config.remoteTemplate||''),autoSource:parsed.manifest.config.autoSource!==false}));
 if(parsed.manifest?.verify?.hashes)hdShipImageVerifySave(parsed.manifest.verify);
 await hdShipImageRefreshLocalIds();window.dispatchEvent(new CustomEvent('hd:ship-images-changed',{detail:{restore:true,ok,total:parsed.items.length}}));
 return {ok,total:parsed.items.length,manifest:parsed.manifest};
}
function hdShipImageRevoke(id){
 const old=HD_SHIP_IMAGE_OBJECT_URLS.get(Number(id));if(old){
  // Cancel pending lazy loads before revoking a replaced/deleted local image.
  for(const img of document.querySelectorAll('[data-hd-ship-image-host] img')){
   if(img.getAttribute('src')!==old)continue;
   img.onload=null;img.onerror=null;img.removeAttribute('src');
   const host=img.closest('[data-hd-ship-image-host]');
   if(host){host.dataset.hdShipHydrateSeq=String((Number(host.dataset.hdShipHydrateSeq)||0)+1);host.classList.remove('loaded')}
  }
  try{URL.revokeObjectURL(old)}catch{}HD_SHIP_IMAGE_OBJECT_URLS.delete(Number(id))
 }
}
function hdShipImageObjectUrl(id,blob){
 const key=Number(id),old=HD_SHIP_IMAGE_OBJECT_URLS.get(key);if(old)return old;
 const url=URL.createObjectURL(blob);HD_SHIP_IMAGE_OBJECT_URLS.set(key,url);return url;
}
function hdShipImageRemoteUrl(id){
 const config=hdShipImageConfig(),t=config.remoteTemplate;
 if(!t)return config.autoSource&&HD_SHIP_IMAGE_SOURCE.ids.has(Number(id))?HD_SHIP_IMAGE_SOURCE.baseUrl+Number(id)+'.png':'';
 return t.includes('{id}')?t.replaceAll('{id}',String(id)):t.replace(/\/$/,'')+'/'+id+'.png';
}
function hdShipImageCardHtml(ref){
 const row=hdShipImageResolve(ref);if(!row)return '';
 return `<figure class="hd-ship-image-card" data-hd-ship-image-host="${row.id}"><div class="hd-ship-image-stage"><div class="hd-ship-image-fallback"><b>画像未登録</b><span>${hdShipImageEsc(row.name||'艦娘')} / ID ${row.id}</span></div><img alt="${hdShipImageEsc(row.name||'艦娘')} 艦娘画像" loading="lazy" decoding="async"></div><figcaption><span>MASTER ID ${row.id}</span><div><button type="button" class="ghost small" data-hd-ship-image-upload="${row.id}">画像を登録</button><button type="button" class="ghost small" data-hd-ship-image-delete="${row.id}" hidden>削除</button></div></figcaption></figure>`;
}
function hdShipImageThumbHtml(ref,context=''){
 const row=hdShipImageResolve(ref);if(!row)return '';
 return `<button type="button" class="hd-ship-image-thumb ${hdShipImageEsc(context)}" data-hd-ship-image-host="${row.id}" data-hd-ship-image-upload="${row.id}" title="${hdShipImageEsc(row.name||'艦娘')}の画像を登録・変更"><span class="hd-ship-image-thumb-fallback">ID ${row.id}</span><img alt="${hdShipImageEsc(row.name||'艦娘')} 画像" loading="lazy" decoding="async"></button>`;
}
async function hdShipImageHydrate(root=document){
 const hosts=[...root.querySelectorAll?.('[data-hd-ship-image-host]')||[]];
 await Promise.all(hosts.map(async host=>{
  const id=Number(host.dataset.hdShipImageHost),img=host.querySelector('img'),del=host.querySelector('[data-hd-ship-image-delete]'),upload=host.querySelector('[data-hd-ship-image-upload]');if(!id||!img)return;
  const seq=(Number(host.dataset.hdShipHydrateSeq)||0)+1;host.dataset.hdShipHydrateSeq=String(seq);
  const local=await hdShipImageGet(id);if(Number(host.dataset.hdShipHydrateSeq)!==seq)return;
  img.onload=null;img.onerror=null;
  host.classList.remove('loaded','remote','missing','verify-verified','verify-mismatch','verify-unverified','verify-pending');delete host.dataset.hdShipImageVerify;
  if(local?.blob){
   const url=hdShipImageObjectUrl(id,local.blob),v=hdShipImageVerifyStatus(id,local.hash||'');img.src=url;host.classList.add('loaded','verify-'+v.status);host.dataset.hdShipImageVerify=v.status;if(del)del.hidden=false;if(upload)upload.textContent='画像を変更';return;
  }
  img.removeAttribute('src');if(del)del.hidden=true;if(upload)upload.textContent='画像を登録';
  const remote=hdShipImageRemoteUrl(id);
  if(remote){
   img.onload=()=>{if(Number(host.dataset.hdShipHydrateSeq)!==seq)return;host.classList.add('loaded','remote');host.classList.remove('missing')};
   img.onerror=()=>{if(Number(host.dataset.hdShipHydrateSeq)!==seq)return;host.classList.remove('loaded','remote');host.classList.add('missing');img.removeAttribute('src')};
   img.src=remote
  } else host.classList.add('missing');
 }));
}
function hdShipImageEnsurePicker(){
 let input=document.getElementById('hdShipImageSingleInput');if(input)return input;
 input=document.createElement('input');input.id='hdShipImageSingleInput';input.type='file';input.accept='image/png,image/jpeg,image/webp';input.hidden=true;document.body.appendChild(input);return input;
}
function hdShipImageEnsureDialog(){
 let d=document.getElementById('hdShipImageDialog');if(d)return d;
 d=document.createElement('dialog');d.id='hdShipImageDialog';d.className='hd-ship-image-dialog';
 d.innerHTML=`<div class="hd-ship-image-dialog-head"><div><div class="eyebrow">SHIP IMAGE LIBRARY</div><h3>艦娘画像</h3></div><button type="button" class="icon-btn" data-hd-ship-image-close>×</button></div><p>画像はこの端末のブラウザ内に保存するよ。公式マスターIDで紐づけるから、通常・改・改二など別形態を取り違えない。</p><p>標準カード画像を艦娘IDごとに自動表示。<a href="https://github.com/Nishisonic/gkcoi" target="_blank" rel="noopener noreferrer">画像提供元：gkcoi</a>。提供元の画像をそのまま表示し、ゲームの最新絵柄との一致は未検証。端末に登録した画像を優先するよ。</p><label><input id="hdShipImageAutoSource" type="checkbox">標準カード画像を自動表示</label><div class="hd-ship-image-dialog-grid"><article><strong>一括取り込み</strong><p><code>541.png</code> のように「艦ID.拡張子」、または正確な艦名をファイル名にして複数選択。PNG/JPEG/WebP対応。</p><label class="primary hd-ship-image-file">画像を複数選択<input id="hdShipImageBulkInput" type="file" accept="image/png,image/jpeg,image/webp" multiple></label><span id="hdShipImageImportStatus"></span></article><article><strong>許諾済み画像URL</strong><p>自分で利用権を確認した画像サーバーがある場合だけ設定。<code>{id}</code> を艦IDに置換する。</p><input id="hdShipImageRemoteTemplate" type="url" placeholder="https://example.com/card/{id}.png"><button type="button" class="ghost" data-hd-ship-image-save-remote>URL設定を保存</button></article></div><div class="hd-ship-image-integrity"><div><strong>画像整合性</strong><p>壊れた画像・存在しないMASTER IDを確認。詳細確認ではSHA-256で同一画像候補も探すよ。</p></div><button type="button" class="ghost" data-hd-ship-image-audit>画像整合性を詳細確認</button><div id="hdShipImageIntegrityStatus" class="muted">未確認</div></div><div class="hd-ship-image-verify"><div><strong>正解指紋表</strong><p>自分で用意した「MASTER ID → SHA-256」JSONを読み込むと、画像を 一致 / 不一致 / 未検証 で判定できる。</p></div><div><label class="ghost hd-ship-image-verify-file">検証表を読み込む<input id="hdShipImageVerifyInput" type="file" accept=".json,application/json"></label><button type="button" class="ghost" data-hd-ship-image-verify-template>空テンプレート</button><button type="button" class="ghost" data-hd-ship-image-verify-clear>検証表を解除</button></div><span id="hdShipImageVerifyStatus"></span></div><div class="hd-ship-image-backup"><div><strong>画像ライブラリのバックアップ</strong><p>端末保存の画像をMASTER IDのまま1ファイルへ保存。復元は既存画像へ上書き統合するよ。</p></div><div><button type="button" class="ghost" data-hd-ship-image-share>共有して保存</button><button type="button" class="ghost" data-hd-ship-image-export>バックアップを書き出す</button><label class="ghost hd-ship-image-backup-file">バックアップを復元<input id="hdShipImageBackupInput" type="file" accept=".hdshipimg,application/x-harbordesk-ship-images"></label></div><span id="hdShipImageBackupStatus"></span></div><div class="hd-ship-image-dialog-status"><b>端末保存</b><span id="hdShipImageCount">確認中…</span></div><small>ゲーム内画像そのものを公開リポジトリへ同梱する機能ではないよ。利用する画像の権利・利用条件は画像提供元に従ってね。</small>`;
 document.body.appendChild(d);
 d.querySelector('#hdShipImageRemoteTemplate').value=hdShipImageConfig().remoteTemplate;d.querySelector('#hdShipImageAutoSource').checked=hdShipImageConfig().autoSource;
 return d;
}
async function hdShipImageOpenDialog(){
 const d=hdShipImageEnsureDialog(),[c,a]=await Promise.all([hdShipImageCoverage(),hdShipImageIntegrityAudit(false)]);d.querySelector('#hdShipImageCount').textContent=`${c.local}/${c.total}形態・未登録${c.missing}`;const status=d.querySelector('#hdShipImageIntegrityStatus');if(status)status.textContent=hdShipImageIntegritySummary(a);const manifest=hdShipImageVerifyLoad(),vs=d.querySelector('#hdShipImageVerifyStatus');if(vs)vs.textContent=Object.keys(manifest.hashes||{}).length?`検証表 ${Object.keys(manifest.hashes).length}件・${manifest.source||'source不明'}`:'検証表なし';if(!d.open)d.showModal();
}
async function hdShipImageImportFiles(files,targetId=0){
 let ok=0,skip=0;const skipped=[];
 for(const file of [...files||[]]){
  if(!file.type?.startsWith('image/')){skip++;skipped.push({file:file.name,reason:'画像形式ではない'});continue}
  let row=null;
  if(targetId)row=hdShipImageResolve(targetId);
  else{const stem=file.name.replace(/\.[^.]+$/,'').trim();row=hdShipImageResolve(stem)}
  if(!row?.id){skip++;skipped.push({file:file.name,reason:'艦ID/艦名を解決できない'});continue}
  if(await hdShipImagePut(row.id,file,row.name,true))ok++;else{skip++;skipped.push({file:file.name,reason:'保存に失敗'})}
 }
 if(ok)window.dispatchEvent(new CustomEvent('hd:ship-images-changed',{detail:{bulk:true,ok,skip}}));
 return {ok,skip,skipped};
}
document.addEventListener('click',async e=>{
 const upload=e.target.closest?.('[data-hd-ship-image-upload]');if(upload){
  const input=hdShipImageEnsurePicker();input.dataset.targetId=upload.dataset.hdShipImageUpload||'';input.value='';input.click();return;
 }
 const del=e.target.closest?.('[data-hd-ship-image-delete]');if(del){await hdShipImageDelete(del.dataset.hdShipImageDelete);return}
 if(e.target.closest?.('[data-hd-ship-image-settings]')){await hdShipImageOpenDialog();return}
 if(e.target.closest?.('[data-hd-ship-image-close]')){document.getElementById('hdShipImageDialog')?.close();return}
 if(e.target.closest?.('[data-hd-ship-image-audit]')){const d=hdShipImageEnsureDialog(),status=d.querySelector('#hdShipImageIntegrityStatus');if(status)status.textContent='画像指紋を確認中…';try{const a=await hdShipImageIntegrityAudit(true);if(status)status.innerHTML=`<b>${hdShipImageEsc(hdShipImageIntegritySummary(a))}</b>${a.duplicates.length?`<small>${a.duplicates.slice(0,8).map(g=>`同一候補: ${g.items.map(x=>`${hdShipImageEsc(x.name)}(ID ${x.id})`).join(' / ')}`).join('<br>')}${a.duplicates.length>8?`<br>ほか${a.duplicates.length-8}組`:''}</small>`:''}`}catch(err){if(status)status.textContent='確認に失敗: '+String(err?.message||err)}return}
 if(e.target.closest?.('[data-hd-ship-image-verify-template]')){hdShipImageExportVerifyTemplate();return}
 if(e.target.closest?.('[data-hd-ship-image-verify-clear]')){localStorage.removeItem(HD_SHIP_IMAGE_VERIFY_KEY);window.dispatchEvent(new CustomEvent('hd:ship-images-changed',{detail:{verifyManifest:true,cleared:true}}));const d=hdShipImageEnsureDialog(),s=d.querySelector('#hdShipImageVerifyStatus');if(s)s.textContent='検証表なし';return}
 if(e.target.closest?.('[data-hd-ship-image-share]')){const d=hdShipImageEnsureDialog(),status=d.querySelector('#hdShipImageBackupStatus');try{const ok=await hdShipImageShareBackup();if(status&&ok)status.textContent='画像バックアップを保存したよ'}catch(err){if(status)status.textContent='共有に失敗: '+String(err?.message||err)}return}
 if(e.target.closest?.('[data-hd-ship-image-export]')){const d=hdShipImageEnsureDialog(),status=d.querySelector('#hdShipImageBackupStatus');try{const ok=await hdShipImageExportBackup();if(status&&ok)status.textContent='バックアップを書き出したよ'}catch(err){if(status)status.textContent='書き出しに失敗: '+String(err?.message||err)}return}
 if(e.target.closest?.('[data-hd-ship-image-save-remote]')){const d=hdShipImageEnsureDialog(),input=d.querySelector('#hdShipImageRemoteTemplate');hdShipImageSaveConfig({remoteTemplate:input?.value||''});return}
});
document.addEventListener('change',async e=>{
 if(e.target.id==='hdShipImageAutoSource'){hdShipImageSaveConfig({...hdShipImageConfig(),autoSource:e.target.checked});return}
 if(e.target.id==='hdShipImageSingleInput'){
  const id=Number(e.target.dataset.targetId)||0,res=await hdShipImageImportFiles(e.target.files,id);if(res.ok)await hdShipImageHydrate(document);return;
 }
 if(e.target.id==='hdShipImageBulkInput'){
  const d=hdShipImageEnsureDialog(),status=d.querySelector('#hdShipImageImportStatus'),res=await hdShipImageImportFiles(e.target.files),c=await hdShipImageCoverage();
  if(status)status.innerHTML=`<b>取込 ${res.ok}件 / スキップ ${res.skip}件</b>${res.skipped.length?`<small>${res.skipped.slice(0,12).map(x=>`${hdShipImageEsc(x.file)}: ${hdShipImageEsc(x.reason)}`).join('<br>')}${res.skipped.length>12?`<br>ほか${res.skipped.length-12}件`:''}</small>`:''}`;
  const count=d.querySelector('#hdShipImageCount');if(count)count.textContent=`${c.local}/${c.total}形態・未登録${c.missing}`;await hdShipImageHydrate(document);return;
 }
 if(e.target.id==='hdShipImageVerifyInput'){
  const d=hdShipImageEnsureDialog(),status=d.querySelector('#hdShipImageVerifyStatus'),file=e.target.files?.[0];if(!file)return;
  try{const m=await hdShipImageImportVerifyManifest(file);if(status)status.textContent=`検証表 ${Object.keys(m.hashes||{}).length}件を読込`;await hdShipImageIntegrityAudit(true);await hdShipImageHydrate(document)}catch(err){if(status)status.textContent='読込失敗: '+String(err?.message||err)}finally{e.target.value=''}return;
 }
 if(e.target.id==='hdShipImageBackupInput'){
  const d=hdShipImageEnsureDialog(),status=d.querySelector('#hdShipImageBackupStatus'),file=e.target.files?.[0];if(!file)return;
  try{const res=await hdShipImageImportBackup(file),c=await hdShipImageCoverage();if(status)status.textContent=`復元 ${res.ok}/${res.total}件 完了`;const count=d.querySelector('#hdShipImageCount');if(count)count.textContent=`${c.local}/${c.total}形態・未登録${c.missing}`;d.querySelector('#hdShipImageRemoteTemplate').value=hdShipImageConfig().remoteTemplate;await hdShipImageHydrate(document)}catch(err){if(status)status.textContent='復元に失敗: '+String(err?.message||err)}finally{e.target.value=''}return;
 }
});
window.addEventListener('hd:ship-images-changed',()=>{hdShipImageHydrate(document);if(document.getElementById('hdShipImageDialog')?.open)hdShipImageCoverage().then(c=>{const x=document.getElementById('hdShipImageCount');if(x)x.textContent=`${c.local}/${c.total}形態・未登録${c.missing}`})});
hdShipImageRefreshLocalIds().then(()=>window.dispatchEvent(new CustomEvent('hd:ship-images-ready',{detail:{count:HD_SHIP_IMAGE_LOCAL_IDS.size}})));
