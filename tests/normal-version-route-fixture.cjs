'use strict';
const meta=require('../app-version.json');

// Route/save tests need normal version input, not an accidental 204 JSON failure.
// This fixed response is not evidence of the product's real network fetch.
function normalVersionRouteFixture(route){
 const request=route.request(),url=new URL(request.url());
 const versionUrl=(url.origin==='https://raw.githubusercontent.com'&&url.pathname==='/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json')||(url.origin==='http://127.0.0.1:4173'&&url.pathname==='/app-version.json');
 if(request.method()==='GET'&&versionUrl)return route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:meta.version,build:meta.build})});
 return ['localhost','127.0.0.1'].includes(url.hostname)?route.continue():route.fulfill({status:204,body:''});
}
module.exports={normalVersionRouteFixture};
