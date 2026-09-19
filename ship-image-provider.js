const HD_SHIP_IMAGE_DB='harbordesk-ship-images-v1';
const HD_SHIP_IMAGE_STORE='images';
const HD_SHIP_IMAGE_CONFIG_KEY='harbordesk-ship-image-config-v1';
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
 try{const x=JSON.parse(localStorage.getItem(HD_SHIP_IMAGE_CONFIG_KEY)||'{}');return {remoteTemplate:String(x.remoteTemplate||'').trim()}}catch{return {remoteTemplate:''}}
}
function hdShipImageSaveConfig(v){localStorage.setItem(HD_SHIP_IMAGE_CONFIG_KEY,JSON.stringify({remoteTemplate:String(v?.remoteTemplate||'').trim()}));window.dispatchEvent(new CustomEvent('hd:ship-images-changed'))}
function hdShipImageOpenDb(){
 if(HD_SHIP_IMAGE_DB_PROMISE)return HD_SHIP_IMAGE_DB_PROMISE;
 HD_SHIP_IMAGE_DB_PROMISE=new Promise((resolve,reject)=>{
  const req=indexedDB.open(HD_SHIP_IMAGE_DB,1);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(HD_SHIP_IMAGE_STORE))db.createObjectStore(HD_SHIP_IMAGE_STORE,{keyPath:'id'})};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });
 return HD_SHIP_IMAGE_DB_PROMISE;
}
async function hdShipImageGet(id){
 try{const db=await hdShipImageOpenDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(HD_SHIP_IMAGE_STORE,'readonly'),req=tx.objectStore(HD_SHIP_IMAGE_STORE).get(Number(id));req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)})}catch{return null}
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
 const db=await hdShipImageOpenDb();
 await new Promise((resolve,reject)=>{const tx=db.transaction(HD_SHIP_IMAGE_STORE,'readwrite');tx.objectStore(HD_SHIP_IMAGE_STORE).put({id:Number(row.id),name:row.name||String(name||''),blob:file,type:file.type||'',updatedAt:Date.now()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
 HD_SHIP_IMAGE_LOCAL_IDS.add(Number(row.id));HD_SHIP_IMAGE_LOCAL_IDS_READY=true;hdShipImageRevoke(row.id);if(!silent)window.dispatchEvent(new CustomEvent('hd:ship-images-changed',{detail:{id:row.id,name:row.name}}));return true;
}
async function hdShipImageDelete(id){
 try{const db=await hdShipImageOpenDb();await new Promise((resolve,reject)=>{const tx=db.transaction(HD_SHIP_IMAGE_STORE,'readwrite');tx.objectStore(HD_SHIP_IMAGE_STORE).delete(Number(id));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});HD_SHIP_IMAGE_LOCAL_IDS.delete(Number(id));HD_SHIP_IMAGE_LOCAL_IDS_READY=true;hdShipImageRevoke(id);window.dispatchEvent(new CustomEvent('hd:ship-images-changed',{detail:{id:Number(id),deleted:true}}));return true}catch{return false}
}
async function hdShipImageCount(){
 if(!HD_SHIP_IMAGE_LOCAL_IDS_READY)await hdShipImageRefreshLocalIds();return HD_SHIP_IMAGE_LOCAL_IDS.size;
}
async function hdShipImageAll(){
 try{const db=await hdShipImageOpenDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(HD_SHIP_IMAGE_STORE,'readonly'),req=tx.objectStore(HD_SHIP_IMAGE_STORE).getAll();req.onsuccess=()=>resolve(Array.isArray(req.result)?req.result:[]);req.onerror=()=>reject(req.error)})}catch{return []}
}
async function hdShipImageBuildBackup(){
 const rows=(await hdShipImageAll()).filter(x=>x?.blob&&Number(x.id)>0).sort((a,b)=>Number(a.id)-Number(b.id));
 const entries=rows.map(x=>({id:Number(x.id),name:String(x.name||''),type:String(x.type||x.blob.type||'application/octet-stream'),size:Number(x.blob.size)||0}));
 const manifest={format:'harbordesk-ship-images',version:1,createdAt:new Date().toISOString(),masterSource:window.HD_KANCOLLE_MASTER_SNAPSHOT?.source||null,config:hdShipImageConfig(),entries};
 const enc=new TextEncoder(),magic=enc.encode('HDSI1\n'),meta=enc.encode(JSON.stringify(manifest)),len=new Uint8Array(4);new DataView(len.buffer).setUint32(0,meta.byteLength,true);
 return {blob:new Blob([magic,len,meta,...rows.map(x=>x.blob)],{type:'application/x-harbordesk-ship-images'}),manifest};
}
async function hdShipImageExportBackup(){
 const out=await hdShipImageBuildBackup();if(!out.manifest.entries.length){alert?.('端末保存の艦娘画像がまだないよ');return false}
 const a=document.createElement('a'),url=URL.createObjectURL(out.blob),day=new Date().toISOString().slice(0,10);a.href=url;a.download=`HarborDesk-ship-images-${day}.hdshipimg`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);return true;
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
 if(parsed.manifest?.config?.remoteTemplate!=null)localStorage.setItem(HD_SHIP_IMAGE_CONFIG_KEY,JSON.stringify({remoteTemplate:String(parsed.manifest.config.remoteTemplate||'')}));
 await hdShipImageRefreshLocalIds();window.dispatchEvent(new CustomEvent('hd:ship-images-changed',{detail:{restore:true,ok,total:parsed.items.length}}));
 return {ok,total:parsed.items.length,manifest:parsed.manifest};
}
function hdShipImageRevoke(id){
 const old=HD_SHIP_IMAGE_OBJECT_URLS.get(Number(id));if(old){try{URL.revokeObjectURL(old)}catch{}HD_SHIP_IMAGE_OBJECT_URLS.delete(Number(id))}
}
function hdShipImageObjectUrl(id,blob){
 const key=Number(id),old=HD_SHIP_IMAGE_OBJECT_URLS.get(key);if(old)return old;
 const url=URL.createObjectURL(blob);HD_SHIP_IMAGE_OBJECT_URLS.set(key,url);return url;
}
function hdShipImageRemoteUrl(id){
 const t=hdShipImageConfig().remoteTemplate;if(!t)return '';
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
  host.classList.remove('loaded','remote','missing');img.removeAttribute('src');
  const local=await hdShipImageGet(id);
  if(local?.blob){
   const url=hdShipImageObjectUrl(id,local.blob);img.src=url;host.classList.add('loaded');if(del)del.hidden=false;if(upload)upload.textContent='画像を変更';return;
  }
  if(del)del.hidden=true;if(upload)upload.textContent='画像を登録';
  const remote=hdShipImageRemoteUrl(id);
  if(remote){img.onload=()=>{host.classList.add('loaded','remote');host.classList.remove('missing')};img.onerror=()=>{host.classList.remove('loaded','remote');host.classList.add('missing');img.removeAttribute('src')};img.src=remote}
  else host.classList.add('missing');
 }));
}
function hdShipImageEnsurePicker(){
 let input=document.getElementById('hdShipImageSingleInput');if(input)return input;
 input=document.createElement('input');input.id='hdShipImageSingleInput';input.type='file';input.accept='image/png,image/jpeg,image/webp';input.hidden=true;document.body.appendChild(input);return input;
}
function hdShipImageEnsureDialog(){
 let d=document.getElementById('hdShipImageDialog');if(d)return d;
 d=document.createElement('dialog');d.id='hdShipImageDialog';d.className='hd-ship-image-dialog';
 d.innerHTML=`<div class="hd-ship-image-dialog-head"><div><div class="eyebrow">SHIP IMAGE LIBRARY</div><h3>艦娘画像</h3></div><button type="button" class="icon-btn" data-hd-ship-image-close>×</button></div><p>画像はこの端末のブラウザ内に保存するよ。公式マスターIDで紐づけるから、通常・改・改二など別形態を取り違えない。</p><div class="hd-ship-image-dialog-grid"><article><strong>一括取り込み</strong><p><code>541.png</code> のように「艦ID.拡張子」、または正確な艦名をファイル名にして複数選択。PNG/JPEG/WebP対応。</p><label class="primary hd-ship-image-file">画像を複数選択<input id="hdShipImageBulkInput" type="file" accept="image/png,image/jpeg,image/webp" multiple></label><span id="hdShipImageImportStatus"></span></article><article><strong>許諾済み画像URL</strong><p>自分で利用権を確認した画像サーバーがある場合だけ設定。<code>{id}</code> を艦IDに置換する。</p><input id="hdShipImageRemoteTemplate" type="url" placeholder="https://example.com/card/{id}.png"><button type="button" class="ghost" data-hd-ship-image-save-remote>URL設定を保存</button></article></div><div class="hd-ship-image-backup"><div><strong>画像ライブラリのバックアップ</strong><p>端末保存の画像をMASTER IDのまま1ファイルへ保存。復元は既存画像へ上書き統合するよ。</p></div><div><button type="button" class="ghost" data-hd-ship-image-export>バックアップを書き出す</button><label class="ghost hd-ship-image-backup-file">バックアップを復元<input id="hdShipImageBackupInput" type="file" accept=".hdshipimg,application/x-harbordesk-ship-images"></label></div><span id="hdShipImageBackupStatus"></span></div><div class="hd-ship-image-dialog-status"><b>端末保存</b><span id="hdShipImageCount">確認中…</span></div><small>ゲーム内画像そのものを公開リポジトリへ同梱する機能ではないよ。利用する画像の権利・利用条件は画像提供元に従ってね。</small>`;
 document.body.appendChild(d);
 d.querySelector('#hdShipImageRemoteTemplate').value=hdShipImageConfig().remoteTemplate;
 return d;
}
async function hdShipImageOpenDialog(){
 const d=hdShipImageEnsureDialog(),c=await hdShipImageCoverage();d.querySelector('#hdShipImageCount').textContent=`${c.local}/${c.total}形態・未登録${c.missing}`;if(!d.open)d.showModal();
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
 if(e.target.closest?.('[data-hd-ship-image-export]')){const d=hdShipImageEnsureDialog(),status=d.querySelector('#hdShipImageBackupStatus');try{const ok=await hdShipImageExportBackup();if(status&&ok)status.textContent='バックアップを書き出したよ'}catch(err){if(status)status.textContent='書き出しに失敗: '+String(err?.message||err)}return}
 if(e.target.closest?.('[data-hd-ship-image-save-remote]')){const d=hdShipImageEnsureDialog(),input=d.querySelector('#hdShipImageRemoteTemplate');hdShipImageSaveConfig({remoteTemplate:input?.value||''});return}
});
document.addEventListener('change',async e=>{
 if(e.target.id==='hdShipImageSingleInput'){
  const id=Number(e.target.dataset.targetId)||0,res=await hdShipImageImportFiles(e.target.files,id);if(res.ok)await hdShipImageHydrate(document);return;
 }
 if(e.target.id==='hdShipImageBulkInput'){
  const d=hdShipImageEnsureDialog(),status=d.querySelector('#hdShipImageImportStatus'),res=await hdShipImageImportFiles(e.target.files),c=await hdShipImageCoverage();
  if(status)status.innerHTML=`<b>取込 ${res.ok}件 / スキップ ${res.skip}件</b>${res.skipped.length?`<small>${res.skipped.slice(0,12).map(x=>`${hdShipImageEsc(x.file)}: ${hdShipImageEsc(x.reason)}`).join('<br>')}${res.skipped.length>12?`<br>ほか${res.skipped.length-12}件`:''}</small>`:''}`;
  const count=d.querySelector('#hdShipImageCount');if(count)count.textContent=`${c.local}/${c.total}形態・未登録${c.missing}`;await hdShipImageHydrate(document);return;
 }
 if(e.target.id==='hdShipImageBackupInput'){
  const d=hdShipImageEnsureDialog(),status=d.querySelector('#hdShipImageBackupStatus'),file=e.target.files?.[0];if(!file)return;
  try{const res=await hdShipImageImportBackup(file),c=await hdShipImageCoverage();if(status)status.textContent=`復元 ${res.ok}/${res.total}件 完了`;const count=d.querySelector('#hdShipImageCount');if(count)count.textContent=`${c.local}/${c.total}形態・未登録${c.missing}`;d.querySelector('#hdShipImageRemoteTemplate').value=hdShipImageConfig().remoteTemplate;await hdShipImageHydrate(document)}catch(err){if(status)status.textContent='復元に失敗: '+String(err?.message||err)}finally{e.target.value=''}return;
 }
});
window.addEventListener('hd:ship-images-changed',()=>{hdShipImageHydrate(document);if(document.getElementById('hdShipImageDialog')?.open)hdShipImageCoverage().then(c=>{const x=document.getElementById('hdShipImageCount');if(x)x.textContent=`${c.local}/${c.total}形態・未登録${c.missing}`})});
hdShipImageRefreshLocalIds().then(()=>window.dispatchEvent(new CustomEvent('hd:ship-images-ready',{detail:{count:HD_SHIP_IMAGE_LOCAL_IDS.size}})));
