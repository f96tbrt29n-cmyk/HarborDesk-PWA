// Enemy ordinary-fleet AA model. No ship aliases, enemy CI, jet assault,
// casualty selection or full-wipe probability are inferred.
const HD_ENEMY_AA_ATTACK_CATS=new Set(['艦上攻撃機','艦上爆撃機','水上爆撃機','噴式戦闘爆撃機']);
const HD_ENEMY_AA_FORMATIONS={'単縦陣':100,'複縦陣':120,'輪形陣':160,'梯形陣':100,'単横陣':100,'警戒陣':110};
function hdEnemyAANorm(value){return String(value||'').normalize('NFKC').replace(/\s+/g,'').replace(/―/g,'ー')}
function hdEnemyAAEvasion(row){
 const category=row?.category||row?.meta?.category,name=hdEnemyAANorm(row?.name||row?.meta?.name),metaName=hdEnemyAANorm(row?.meta?.name),data=typeof HD_AIRCRAFT_AA_EVASION_DATA==='undefined'?null:HD_AIRCRAFT_AA_EVASION_DATA,entry=data?.aircraft?.[name];
 // Never infer a bonus from a substring, an ID for an owned instance, or a conflicting label.
 if(entry&&entry.category===category&&(!metaName||metaName===name)&&[entry.weightedPercent,entry.fleetPercent].every(x=>Number.isInteger(x)&&x>0&&x<=100))return {registered:true,name:entry.name,weightedPercent:entry.weightedPercent,fleetPercent:entry.fleetPercent,source:data.source};
 return {registered:false,name:row?.name||row?.meta?.name||category||'名称不明',weightedPercent:100,fleetPercent:100,reason:'回避補正未登録（回避なしで計算）'};
}
function hdEnemyAARoster(node,pattern,seen=new Set()){
 const raw=hdEnemyAANorm(pattern?.enemy),ref=raw.match(/^パターン(\d+)と同じ$/);if(!ref)return raw;
 if(seen.has(ref[1]))return '';const next=new Set(seen);next.add(ref[1]);
 const candidates=(node?.patterns||[]).filter(p=>new RegExp('^パターン\\s*'+ref[1]+'(?:$|\\s)').test(p.name||'')),rosters=[...new Set(candidates.map(p=>hdEnemyAARoster(node,p,next)))];return rosters.length===1?rosters[0]:'';
}
function hdEnemyAATarget(map,id,rows=[{category:'艦上攻撃機',slot:1}]){
 const node=typeof hdMapAirData==='function'?hdMapAirData(map)?.nodes?.[id]:null,profile=typeof hdMapAirNodeProfile==='function'?hdMapAirNodeProfile(map,id):null,affected=(rows||[]).filter(r=>HD_ENEMY_AA_ATTACK_CATS.has(r?.category||r?.meta?.category)&&Number(r.slot)>0),none=reason=>({known:true,applicable:false,reason,affected:0,maxWeighted:0,maxFleet:0,missing:[],patterns:[]});
 if(!affected.length)return none('攻撃機なし。艦戦・水戦は対空砲火の対象外');
 if(profile?.rounds===0)return none('夜戦・対潜戦では本隊の対空砲火損耗を数えない');
 if(profile?.kind==='空襲戦')return none('空襲戦は本隊の攻撃を行わず、敵対空砲火なし（基地航空隊は別）');
 const missing=new Set(),patterns=[],data=typeof HD_ENEMY_AA_DATA==='undefined'?null:HD_ENEMY_AA_DATA;
 if(affected.some(r=>(r.category||r.meta?.category)==='噴式戦闘爆撃機'))missing.add('噴式機の強襲・特殊な迎撃処理は未対応');
 if(!node?.patterns?.length||!profile?.known)missing.add('戦闘マス・敵編成が未確定');
 for(const p of node?.patterns||[]){
  const names=hdEnemyAARoster(node,p).split(/[、,]/).map(hdEnemyAANorm).filter(Boolean),ships=[];
  if(!names.length)missing.add('敵艦名なし');
  if(names.length>6)missing.add('敵連合艦隊の迎撃補正は未対応');
  for(const name of names){
   if(/砲台小鬼|防空|軽巡ト級flagship|輸送ワ級II/.test(name))missing.add(name+'：敵対空カットインの補正が未確定');
   const ship=data?.ships?.[name];
   if(!ship?.known||!Number.isInteger(ship.weighted)||ship.weighted<0||!Number.isInteger(ship.bonus)||ship.bonus<0)missing.add(name+'：'+(ship?.reason||'装備・対空値が未登録'));else ships.push({...ship,name});
  }
  const forms=Array.isArray(p.formations)?p.formations:[];
  if(!forms.length)missing.add(p.name+'：敵陣形が未登録');
  for(const form of forms)if(!Object.hasOwn(HD_ENEMY_AA_FORMATIONS,form))missing.add(p.name+'：敵陣形未確定 '+form);
  if(ships.length!==names.length||!forms.length||forms.some(f=>!Object.hasOwn(HD_ENEMY_AA_FORMATIONS,f)))continue;
  const bonus=ships.reduce((n,s)=>n+s.bonus,0),weighted=Math.max(0,...ships.map(s=>s.weighted));
  patterns.push({name:p.name,formations:forms,maxWeighted:weighted,maxFleet:Math.max(...forms.map(f=>Math.floor(bonus*HD_ENEMY_AA_FORMATIONS[f]/100)*2)),ships});
 }
 return {known:missing.size===0&&patterns.length===(node?.patterns?.length||0),applicable:true,affected:affected.length,maxWeighted:patterns.length?Math.max(...patterns.map(p=>p.maxWeighted)):null,maxFleet:patterns.length?Math.max(...patterns.map(p=>p.maxFleet)):null,missing:[...missing],patterns,reason:[...missing].join(' / ')};
}
function hdEnemyAALossBounds(rows,target,power){
 if(!target?.known||!Array.isArray(rows)||typeof power!=='function'||!Number.isInteger(target.maxWeighted)||target.maxWeighted<0||!Number.isInteger(target.maxFleet)||target.maxFleet<0)return null;
 if(rows.some(r=>!Number.isInteger(Number(r.slot))||Number(r.slot)<0||Number(r.slot)>99))return null;
 let maxLost=0;const shots=[],bestRows=rows.map(r=>({...r,slot:Number(r.slot)})),worstRows=bestRows.map((r,index)=>{
  if(!target.applicable||!HD_ENEMY_AA_ATTACK_CATS.has(r.category||r.meta?.category)||!r.slot)return {...r};
  // Enemy side has no +1 minimum guarantee. Both rolls fail on the high path.
  const evasion=hdEnemyAAEvasion(r),weighted=Math.floor(target.maxWeighted*evasion.weightedPercent/100),fleet=Math.floor(target.maxFleet*evasion.fleetPercent/100),proportional=Math.floor(r.slot*weighted/400),fixed=Math.floor((weighted+fleet)*3/32),lost=Math.min(r.slot,proportional+fixed);maxLost+=lost;shots.push({slotIndex:r._aaSlot??index,name:evasion.name,before:r.slot,after:r.slot-lost,lost,weighted,fleet,evasion});return {...r,slot:r.slot-lost};
 });
 const lower=worstRows.reduce((n,r)=>n+power(r),0),upper=bestRows.reduce((n,r)=>n+power(r),0);if(!Number.isFinite(lower)||!Number.isFinite(upper))return null;
 return {minLost:0,maxLost,lower,upper,bestRows,worstRows,affected:target.affected,shots};
}
function hdEnemyAANodeHtml(map,id){
 const target=hdEnemyAATarget(map,id),esc=typeof hdEsc==='function'?hdEsc:s=>String(s);
 return `<p data-hd-enemy-aa-node="${esc(id)}"><b>攻撃機を使う場合の敵防空：</b>${!target.applicable?esc(target.reason):target.known?`最大加重対空 ${target.maxWeighted} / 最大艦隊防空 ${target.maxFleet}（全掲載編成・陣形・同名候補の最大）`:`未判定：${esc(target.reason)}`}</p><small>通常敵艦隊の推定式。機体ごとの登録射撃回避補正・未登録機は回避なし・敵全艦生存・同名候補の最大を仮定するモデル。敵対空CI・敵連合艦隊・噴式機は未対応。未登録の敵・陣形は0扱いにしません。</small><a class="guide-link" href="https://wikiwiki.jp/kancolle/対空砲火#enemy_AAfire" target="_blank" rel="noopener">敵防空の仕様 ↗</a>`;
}
