const HD_APP_VERSION='1.0.33';
const HD_APP_BUILD=33;

async function hdFetchLatestVersion(){
  const res=await fetch(`./app-version.json?t=${Date.now()}`,{cache:'no-store'});
  if(!res.ok)throw new Error('version fetch failed');
  return res.json();
}

function hdEnsureUpdateUI(){
  if(document.getElementById('hdUpdateBanner'))return;
  const banner=document.createElement('div');
  banner.id='hdUpdateBanner';
  banner.className='hd-update-banner';
  banner.hidden=true;
  banner.innerHTML=`<div><strong>HarborDeskの最新版があります</strong><div id="hdUpdateText" class="muted"></div></div><button id="hdUpdateNow" class="primary small">今すぐ更新</button>`;
  document.body.appendChild(banner);
  const header=document.querySelector('.topbar');
  if(header&&!document.getElementById('hdUpdateCheck')){
    const controls=document.createElement('div');
    controls.className='hd-version-controls';
    controls.innerHTML=`<span class="hd-version-badge">v${HD_APP_VERSION}</span><button id="hdUpdateCheck" class="ghost small">更新確認</button>`;
    header.appendChild(controls);
  }
  document.getElementById('hdUpdateNow')?.addEventListener('click',hdForceUpdate);
  document.getElementById('hdUpdateCheck')?.addEventListener('click',()=>hdCheckForUpdate(true));
}
async function hdCheckForUpdate(showResult=false){
  hdEnsureUpdateUI();const btn=document.getElementById('hdUpdateCheck');
  try{
    if(btn){btn.disabled=true;btn.textContent='確認中…'}
    const latest=await hdFetchLatestVersion();const newer=Number(latest.build||0)>HD_APP_BUILD;
    const banner=document.getElementById('hdUpdateBanner'),text=document.getElementById('hdUpdateText');
    if(newer){if(text)text.textContent=`v${HD_APP_VERSION} → v${latest.version}${latest.notes?`｜${latest.notes}`:''}`;if(banner)banner.hidden=false}
    else{if(banner)banner.hidden=true;if(showResult)alert(`HarborDesk v${HD_APP_VERSION} は最新版だよ`)}
  }catch(err){if(showResult)alert('更新情報を確認できなかったよ。通信状態を確認してもう一度試してね。')}
  finally{if(btn){btn.disabled=false;btn.textContent='更新確認'}}
}
async function hdForceUpdate(){
  const btn=document.getElementById('hdUpdateNow');
  try{
    if(btn){btn.disabled=true;btn.textContent='更新中…'}
    if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.update().catch(()=>null)))}
    const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('harbordesk-pwa-')).map(k=>caches.delete(k)));
  }catch{}
  const url=new URL(location.href);url.searchParams.set('v',Date.now().toString());location.replace(url.toString());
}
window.addEventListener('load',()=>{hdEnsureUpdateUI();setTimeout(()=>hdCheckForUpdate(false),1200)});
