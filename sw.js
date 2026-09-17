const CACHE='harbordesk-pwa-v22';
const ASSETS=['./styles.css','./map-details.css','./map-plans.css','./custom-fleets.css','./ship-roster.css','./advanced-tools.css','./home-dashboard.css','./map-tabs.css','./map-images.css','./map-interactive.css','./update-manager.css','./app.js','./map-details.js','./map-details-34.js','./map-details-57.js','./map-plans.js','./ship-roster.js','./custom-fleets.js','./map-images.js','./map-tabs.js','./map-interactive.js','./map-node-data-1.js','./map-node-data-2-7.js','./advanced-tools.js','./home-dashboard.js','./update-manager.js','./app-version.json','./manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const req=event.request;
 const url=new URL(req.url);
 const isNavigation=req.mode==='navigate'||url.pathname.endsWith('/')||url.pathname.endsWith('/index.html');
 if(isNavigation){
  event.respondWith(fetch(req,{cache:'no-store'}).then(response=>{
   const clone=response.clone();caches.open(CACHE).then(c=>c.put('./index.html',clone));return response;
  }).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
  return;
 }
 event.respondWith(fetch(req,{cache:'no-store'}).then(response=>{
   const clone=response.clone();caches.open(CACHE).then(c=>c.put(req,clone));return response;
 }).catch(()=>caches.match(req)));
});