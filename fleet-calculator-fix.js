(function(){
 if(typeof window.hdFCMutate==='function'&&!window.__hdFCMutateFix){
  window.hdFCMutate=function(map,fleetId,fn){
   const s=hdFCState(map,fleetId);fn(s);s.ships=Array.isArray(s.ships)?s.ships:[];const need=Math.max(6,Math.min(7,Number(s.shipCount)||6));while(s.ships.length<need)s.ships.push({name:'',los:0});hdFCSaveState(map,fleetId,s);hdFCRender();
  };
  window.__hdFCMutateFix=true;
 }
 if(typeof window.hdFCEquipCoef==='function'){
  window.hdFCEquipCoef=function(item){if(!item)return 0;const c=item.category||'';if(c==='艦上攻撃機')return .8;if(c==='艦上偵察機')return 1;if(c==='水上偵察機')return 1.2;if(c==='水上爆撃機')return 1.1;return Number(item.stats?.索敵)>0 ? .6 : 0};
 }
})();