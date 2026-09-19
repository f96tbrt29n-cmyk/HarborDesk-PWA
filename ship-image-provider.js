const HD_SHIP_IMAGE_DB='harbordesk-ship-images-v1';
const HD_SHIP_IMAGE_STORE='images';
const HD_SHIP_IMAGE_CONFIG_KEY='harbordesk-ship-image-config-v1';
let HD_SHIP_IMAGE_DB_PROMISE=null;
const HD_SHIP_IMAGE_OBJECT_URLS=new Map();

function hdShipImageEsc(s){return typeof hdShipDbEsc==='function'?hdShipDbEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdShipImageRows(){return Object.values(window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips||{})}
function hdShipImageResolve(ref){
 if(ref&&typeof ref==='object'&&ref.id!=null)return {id:Number(ref.id),name:String(ref.name||'')};
 const raw=String(ref??'').trim();if(!raw)return null;
 if(/^\d+$/.test(raw)){const row=window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips?.[raw];return row?{id:Number(row.id),name:String(row.name||'')}:{id:Number(raw),name:''}}
 const row=hdShipImageRows().find(x=>String(x.name||'').trim()===raw);
 return row?{id:Number(row.id),name:String(row.name||'')}:null;
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
async function hdShipImagePut(id,file,name=''){
 const row=hdShipImageResolve(id)||{id:Number(id),name:String(name||'')};if(!row?.id||!file)return false;
 const db=await hdShipImageOpenDb();
 await new Promise((resolve,reject)=>{const tx=db.transaction(HD_SHIP_IMAGE_STORE,'readwrite');tx.objectStore(HD_SHIP_IMAGE_STORE).put({id:Number(row.id),name:row.name||String(name||''),blob:file,type:file.type||'',updatedAt:Date.now()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
 hdShipImageRevoke(row.id);window.dispatchEvent(new CustomEvent('hd:ship-images-changed',{detail:{id:row.id,name:row.name}}));return true;
}
async function hdShipImageDelete(id){
 try{const db=await hdShipImageOpenDb();await new Promise((resolve,reject)=>{const tx=db.transaction(HD_SHIP_IMAGE_STORE,'readwrite');tx.objectStore(HD_SHIP_IMAGE_STORE).delete(Number(id));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});hdShipImageRevoke(id);window.dispatchEvent(new CustomEvent('hd:ship-images-changed',{detail:{id:Number(id),deleted:true}}));return true}catch{return false}
}
async function hdShipImageCount(){
 try{const db=await hdShipImageOpenDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(HD_SHIP_IMAGE_STORE,'readonly'),req=tx.objectStore(HD_SHIP_IMAGE_STORE).count();req.onsuccess=()=>resolve(Number(req.result)||0);req.onerror=()=>reject(req.error)})}catch{return 0}
}
function hdShipImageRevoke(id){
 const old=HD_SHIP_IMAGE_OBJECT_URLS.get(Number(id));if(old){try{URL.revokeObjectURL(old)}catch{}HD_SHIP_IMAGE_OBJECT_URLS.delete(Number(id))}
}
function hdShipImageRemoteUrl(id){
 const t=hdShipImageConfig().remoteTemplate;if(!t)return '';
 return t.includes('{id}')?t.replaceAll('{id}',String(id)):t.replace(/\/$/,'')+'/'+id+'.png';
}
function hdShipImageCardHtml(ref){
 const row=hdShipImageResolve(ref);if(!row)return '';
 return `<figure class="hd-ship-image-card" data-hd-ship-image-host="${row.id}"><div class="hd-ship-image-stage"><div class="hd-ship-image-fallback"><b>画像未登録</b><span>${hdShipImageEsc(row.name||'艦娘')} / ID ${row.id}</span></div><img alt="${hdShipImageEsc(row.name||'艦娘')} 艦娘画像" loading="lazy" decoding="async"></div><figcaption><span>MASTER ID ${row.id}</span><div><button type="button" class="ghost small" data-hd-ship-image-upload="${row.id}">画像を登録</button><button type="button" class="ghost small" data-hd-ship-image-delete="${row.id}" hidden>削除</button></div></figcaption></figure>`;
}
async function hdShipImageHydrate(root=document){
 const hosts=[...root.querySelectorAll?.('[data-hd-ship-image-host]')||[]];
 await Promise.all(hosts.map(async host=>{
  const id=Number(host.dataset.hdShipImageHost),img=host.querySelector('img'),del=host.querySelector('[data-hd-ship-image-delete]'),upload=host.querySelector('[data-hd-ship-image-upload]');if(!id||!img)return;
  host.classList.remove('loaded','remote','missing');img.removeAttribute('src');
  hdShipImageRevoke(id);
  const local=await hdShipImageGet(id);
  if(local?.blob){
   const url=URL.createObjectURL(local.blob);HD_SHIP_IMAGE_OBJECT_URLS.set(id,url);img.src=url;host.classList.add('loaded');if(del)del.hidden=false;if(upload)upload.textContent='画像を変更';return;
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
 d.innerHTML=`<div class="hd-ship-image-dialog-head"><div><div class="eyebrow">SHIP IMAGE LIBRARY</div><h3>艦娘画像</h3></div><button type="button" class="icon-btn" data-hd-ship-image-close>×</button></div><p>画像はこの端末のブラウザ内に保存するよ。公式マスターIDで紐づけるから、通常・改・改二など別形態を取り違えない。</p><div class="hd-ship-image-dialog-grid"><article><strong>一括取り込み</strong><p><code>541.png</code> のように「艦ID.拡張子」、または正確な艦名をファイル名にして複数選択。PNG/JPEG/WebP対応。</p><label class="primary hd-ship-image-file">画像を複数選択<input id="hdShipImageBulkInput" type="file" accept="image/png,image/jpeg,image/webp" multiple></label><span id="hdShipImageImportStatus"></span></article><article><strong>許諾済み画像URL</strong><p>自分で利用権を確認した画像サーバーがある場合だけ設定。<code>{id}</code> を艦IDに置換する。</p><input id="hdShipImageRemoteTemplate" type="url" placeholder="https://example.com/card/{id}.png"><button type="button" class="ghost" data-hd-ship-image-save-remote>URL設定を保存</button></article></div><div class="hd-ship-image-dialog-status"><b>端末保存</b><span id="hdShipImageCount">確認中…</span></div><small>ゲーム内画像そのものを公開リポジトリへ同梱する機能ではないよ。利用する画像の権利・利用条件は画像提供元に従ってね。</small>`;
 document.body.appendChild(d);
 d.querySelector('#hdShipImageRemoteTemplate').value=hdShipImageConfig().remoteTemplate;
 return d;
}
async function hdShipImageOpenDialog(){
 const d=hdShipImageEnsureDialog(),n=await hdShipImageCount();d.querySelector('#hdShipImageCount').textContent=`${n}形態`;if(!d.open)d.showModal();
}
async function hdShipImageImportFiles(files,targetId=0){
 let ok=0,skip=0;
 for(const file of [...files||[]]){
  if(!file.type?.startsWith('image/')){skip++;continue}
  let row=null;
  if(targetId)row=hdShipImageResolve(targetId);
  else{const stem=file.name.replace(/\.[^.]+$/,'').trim();row=hdShipImageResolve(stem)}
  if(!row?.id){skip++;continue}
  if(await hdShipImagePut(row.id,file,row.name))ok++;else skip++;
 }
 return {ok,skip};
}
document.addEventListener('click',async e=>{
 const upload=e.target.closest?.('[data-hd-ship-image-upload]');if(upload){
  const input=hdShipImageEnsurePicker();input.dataset.targetId=upload.dataset.hdShipImageUpload||'';input.value='';input.click();return;
 }
 const del=e.target.closest?.('[data-hd-ship-image-delete]');if(del){await hdShipImageDelete(del.dataset.hdShipImageDelete);return}
 if(e.target.closest?.('[data-hd-ship-image-settings]')){await hdShipImageOpenDialog();return}
 if(e.target.closest?.('[data-hd-ship-image-close]')){document.getElementById('hdShipImageDialog')?.close();return}
 if(e.target.closest?.('[data-hd-ship-image-save-remote]')){const d=hdShipImageEnsureDialog(),input=d.querySelector('#hdShipImageRemoteTemplate');hdShipImageSaveConfig({remoteTemplate:input?.value||''});return}
});
document.addEventListener('change',async e=>{
 if(e.target.id==='hdShipImageSingleInput'){
  const id=Number(e.target.dataset.targetId)||0,res=await hdShipImageImportFiles(e.target.files,id);if(res.ok)await hdShipImageHydrate(document);return;
 }
 if(e.target.id==='hdShipImageBulkInput'){
  const d=hdShipImageEnsureDialog(),status=d.querySelector('#hdShipImageImportStatus'),res=await hdShipImageImportFiles(e.target.files);if(status)status.textContent=`取込 ${res.ok}件 / スキップ ${res.skip}件`;const n=await hdShipImageCount();const count=d.querySelector('#hdShipImageCount');if(count)count.textContent=`${n}形態`;await hdShipImageHydrate(document);return;
 }
});
window.addEventListener('hd:ship-images-changed',()=>{hdShipImageHydrate(document);if(document.getElementById('hdShipImageDialog')?.open)hdShipImageCount().then(n=>{const x=document.getElementById('hdShipImageCount');if(x)x.textContent=`${n}形態`})});
