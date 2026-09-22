const HD_FL_KEY='harbordesk-equipment-v1';
const HD_FL_CACHE={};

function hdFLEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdFLNorm(s){return String(s||'').normalize('NFKC').replace(/\s+/g,'').replace(/･/g,'・')}
function hdFLCatalog(){
 const cat=Array.isArray(window.HD_EQUIPMENT_CATALOG)?window.HD_EQUIPMENT_CATALOG:(typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG:[]);
 return Array.isArray(cat)?cat:[];
}
function hdFLRows(){try{const x=JSON.parse(localStorage.getItem(HD_FL_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function hdFLInventoryStackKey(name,star=0){return hdFLNorm(name)+'@@'+Math.max(0,Number(star)||0)}
function hdFLInventory(){
 const cat=hdFLCatalog(),byName=new Map(cat.map(x=>[hdFLNorm(x.name),x])),m=new Map();
 for(const row of hdFLRows()){
  const norm=hdFLNorm(row.name),star=Math.max(0,Number(row.star)||0),key=hdFLInventoryStackKey(row.name,star),count=Math.max(0,Number(row.count)||0);if(!norm||!count)continue;
  const meta=byName.get(norm)||{name:row.name,category:row.category||'',stats:{},tags:[],role:''},cur=m.get(key)||{key,norm,name:row.name,count:0,star,maxStar:star,item:meta};
  cur.count+=count;m.set(key,cur);
 }
 return m;
}
function hdFLType(slot){return slot?.profile?.type||''}
function hdFLRoles(slot){return slot?.profile?.roles||[]}
function hdFLIsCarrier(type){return ['軽空母','正規空母','装甲空母'].includes(type)}
function hdFLIsBattleship(type){return ['戦艦','高速戦艦','航空戦艦'].includes(type)}
function hdFLIsCruiser(type){return ['軽巡洋艦','重雷装巡洋艦','重巡洋艦','航空巡洋艦','練習巡洋艦'].includes(type)}
function hdFLIsDestroyer(type){return ['駆逐艦','海防艦'].includes(type)}
function hdFLShipDbItem(slot){
 const name=String(slot?.profile?.row?.name||'').trim();if(!name)return null;
 if(typeof hdShipDbResolveShip==='function')return hdShipDbResolveShip({name,type:slot?.profile?.type||'',masterId:Number(slot?.profile?.row?.masterId)||Number(slot?.profile?.master?.id)||0},slot?.profile?.roles||[]);
 if(typeof HD_SHIP_DATABASE==='undefined')return null;
 return HD_SHIP_DATABASE.find(x=>x.final===name)||null;
}
function hdFLMasterProfile(slot){
 const ship=hdFLShipDbItem(slot);
 return ship&&typeof hdShipDbSlotProfile==='function'?hdShipDbSlotProfile(ship):null;
}
function hdFLCompatibleAt(item,slot,index){
 if(!hdFLCompatible(item,slot))return false;
 const profile=hdFLMasterProfile(slot);
 if(profile&&typeof hdShipDbSlotRejects==='function'&&hdShipDbSlotRejects(profile,Number(index)||0,item))return false;
 return true;
}
function hdFLSlotCapacity(slot,index){
 const p=hdFLMasterProfile(slot);return p&&Array.isArray(p.slots)?p.slots[index]??null:null;
}
function hdFLCompatible(item,slot){
 const exact=hdFLShipDbItem(slot);
 if(exact&&typeof hdShipDbMasterCompatible==='function'){
  const master=hdShipDbMasterCompatible(item,exact);
  if(master!==null)return master;
 }
 const type=hdFLType(slot),cat=String(item.category||''),roles=hdFLRoles(slot);
 if(/陸上攻撃機|陸軍戦闘機|局地戦闘機/.test(cat))return false;
 if(/艦上戦闘機|艦上攻撃機|艦上爆撃機|艦上偵察機/.test(cat))return hdFLIsCarrier(type);
 if(/大口径主砲/.test(cat))return hdFLIsBattleship(type);
 if(/中口径主砲/.test(cat))return hdFLIsCruiser(type);
 if(/小口径主砲/.test(cat))return hdFLIsDestroyer(type)||['軽巡洋艦','練習巡洋艦'].includes(type);
 if(/水上戦闘機/.test(cat))return ['航空巡洋艦','航空戦艦','水上機母艦'].includes(type)||roles.includes('水戦')||roles.includes('制空補助');
 if(/水上偵察機/.test(cat))return hdFLIsBattleship(type)||['軽巡洋艦','重巡洋艦','航空巡洋艦','航空戦艦','水上機母艦'].includes(type);
 if(/対艦強化弾/.test(cat))return hdFLIsBattleship(type);
 if(/魚雷/.test(cat))return hdFLIsDestroyer(type)||['軽巡洋艦','重雷装巡洋艦','重巡洋艦','航空巡洋艦','潜水艦','潜水空母'].includes(type);
 if(/ソナー|爆雷/.test(cat))return hdFLIsDestroyer(type)||['軽巡洋艦','練習巡洋艦','軽空母'].includes(type)||roles.some(r=>String(r).includes('対潜'));
 if(/上陸用舟艇|特型内火艇/.test(cat))return roles.some(r=>['対地','輸送'].includes(r))||['水上機母艦','揚陸艦'].includes(type);
 if(/大型電探/.test(cat))return !hdFLIsDestroyer(type);
 return true;
}
function hdFLScoreBase(item,own){
 const s=item.stats||{};return (Number(s.火力)||0)*1.2+(Number(s.雷装)||0)*1.1+(Number(s.爆装)||0)+(Number(s.対空)||0)*.9+(Number(s.索敵)||0)*.75+(Number(s.対潜)||0)*.75+(Number(s.命中)||0)*.7+(own.maxStar||0)*.35;
}
function hdFLSlotKind(slot,index){
 const type=hdFLType(slot),profile=hdFLMasterProfile(slot);
 if(hdFLIsCarrier(type)){
  if(profile?.slots?.length){
   const order=profile.slots.map((cap,i)=>({cap,i})).sort((a,b)=>b.cap-a.cap||a.i-b.i);
   const min=[...order].sort((a,b)=>a.cap-b.cap||b.i-a.i)[0]?.i;
   if(index===min)return 'recon';
   if(index===order[0]?.i)return 'airAttack';
   if(index===order[1]?.i)return 'fighter';
   return 'airAttack';
  }
  return ['airAttack','fighter','airAttack','recon'][index]||'utility';
 }
 if(hdFLIsBattleship(type))return ['largeGun','largeGun','recon','ap','utility'][index]||'utility';
 if(type==='重雷装巡洋艦')return ['torpedo','torpedo','utility'][index]||'utility';
 if(['重巡洋艦','航空巡洋艦'].includes(type))return ['mediumGun','mediumGun','recon','utility'][index]||'utility';
 if(['軽巡洋艦','練習巡洋艦'].includes(type))return ['smallMediumGun','smallMediumGun','utility','utility','utility'][index]||'utility';
 if(hdFLIsDestroyer(type))return ['smallGun','smallGun','utility','utility'][index]||'utility';
 if(['潜水艦','潜水空母'].includes(type))return ['torpedo','torpedo'][index]||'utility';
 if(type==='水上機母艦')return ['waterAir','recon','utility','utility'][index]||'utility';
 return 'utility';
}
function hdFLSlotCount(slot){
 const master=hdFLMasterProfile(slot);if(master)return master.count;
 const type=hdFLType(slot),roles=hdFLRoles(slot),name=slot?.profile?.row?.name||'';
 if(roles.includes('4スロット')||/矢矧改二|夕張改二|最上改二特/.test(name))return 4;
 if(hdFLIsCarrier(type)||hdFLIsBattleship(type)||['重巡洋艦','航空巡洋艦','航空戦艦'].includes(type))return 4;
 if(['潜水艦','潜水空母'].includes(type))return 2;
 return 3;
}
function hdFLKindMatch(item,kind){
 const cat=String(item.category||''),tags=item.tags||[];
 if(kind==='smallGun')return /小口径主砲/.test(cat);
 if(kind==='mediumGun')return /中口径主砲/.test(cat);
 if(kind==='smallMediumGun')return /小口径主砲|中口径主砲/.test(cat);
 if(kind==='largeGun')return /大口径主砲/.test(cat);
 if(kind==='torpedo')return /魚雷/.test(cat)||tags.includes('甲標的');
 if(kind==='recon')return /水上偵察機|艦上偵察機/.test(cat)||tags.includes('索敵');
 if(kind==='fighter')return /艦上戦闘機/.test(cat)||tags.includes('艦戦');
 if(kind==='airAttack')return /艦上攻撃機|艦上爆撃機/.test(cat)||tags.includes('艦攻')||tags.includes('艦爆');
 if(kind==='waterAir')return /水上戦闘機|水上偵察機/.test(cat);
 if(kind==='ap')return /対艦強化弾/.test(cat)||tags.includes('徹甲弾');
 return true;
}
function hdFLNeedTags(needs){
 const map={
  '対潜':['対潜','ソナー','爆雷'],'制空':['制空','艦戦','水戦'],'防空':['防空','対空CI'],'対地':['対地','集積地','上陸'],
  '索敵':['索敵','電探','水偵','艦偵'],'夜戦':['夜戦','魚雷CI'],'輸送':['輸送'],'電探':['電探'],'高速化':['高速化','機関'],'煙幕':['煙幕']
 };
 return [...new Set((needs||[]).flatMap(n=>map[n.kind]||[]))];
}
function hdFLPick(inv,remaining,slot,slotIndex,kind,needTags,gearMemo){
 const candidates=[];
 for(const own of inv.values()){
  const left=remaining.get(own.key)||0;
  if(left<=0||!hdFLCompatibleAt(own.item,slot,slotIndex)||!hdFLKindMatch(own.item,kind))continue;
  const tags=own.item.tags||[],needHit=tags.filter(t=>needTags.includes(t)).length;
  let score=hdFLScoreBase(own.item,own)+needHit*16;
  if(kind==='utility'&&needHit===0)score-=8;
  if(gearMemo&&String(gearMemo).includes(own.name))score+=24;
  const cap=hdFLSlotCapacity(slot,slotIndex);
  if(cap!=null&&['airAttack','fighter'].includes(kind))score+=Math.sqrt(Math.max(0,cap))*2;
  if(cap!=null&&kind==='recon')score+=Math.max(0,12-cap)*.35;
  candidates.push({own,score});
 }
 candidates.sort((a,b)=>b.score-a.score||b.own.maxStar-a.own.maxStar||a.own.name.localeCompare(b.own.name,'ja'));
 const best=candidates[0];if(!best)return null;
 remaining.set(best.own.key,(remaining.get(best.own.key)||0)-1);return best.own;
}
function hdFLRebalanceExpansion(inv,remaining,suggestion,ships,targetIndex,ship,context=''){
 if(typeof hdShipDbExpansionInfo!=='function')return null;const candidates=[];
 for(let si=0;si<ships.length;si++){
  const sourceSlot=suggestion.slots[si];if(!sourceSlot?.profile)continue;
  for(const normal of (ships[si].items||[])){
   const own=inv.get(normal.stackKey);if(!own)continue;
   const info=hdShipDbExpansionInfo(own.item,ship,own.maxStar||0);
   if(!info.allowed||!(Number(info.reqStar)>0))continue;
   const replacements=[...inv.values()].filter(rep=>rep.key!==own.key&&rep.norm===own.norm&&(remaining.get(rep.key)||0)>0&&rep.maxStar<own.maxStar&&hdFLCompatibleAt(rep.item,sourceSlot,normal.slotIndex)&&hdFLKindMatch(rep.item,normal.kind));
   replacements.sort((a,b)=>b.maxStar-a.maxStar||a.name.localeCompare(b.name,'ja'));
   const replacement=replacements[0];if(!replacement)continue;
   const bonus=info.mode==='special'?24:info.mode==='global'?16:0,score=(typeof hdShipDbEquipPower==='function'?hdShipDbEquipPower(own.item,context):hdFLScoreBase(own.item,own))+(own.maxStar||0)*2+bonus-(own.maxStar-replacement.maxStar)*.25;
   candidates.push({sourceIndex:si,normal,own,replacement,info,score});
  }
 }
 candidates.sort((a,b)=>b.score-a.score||b.own.maxStar-a.own.maxStar||b.replacement.maxStar-a.replacement.maxStar);
 const best=candidates[0];if(!best)return null;
 remaining.set(best.replacement.key,Math.max(0,(remaining.get(best.replacement.key)||0)-1));
 remaining.set(best.own.key,(remaining.get(best.own.key)||0)+1);
 best.normal.name=best.replacement.name;best.normal.star=best.replacement.maxStar||0;best.normal.stackKey=best.replacement.key;best.normal.norm=best.replacement.norm;best.normal.category=best.replacement.item.category||best.normal.category||'';
 return best;
}
function hdFLExpansionMissingCandidate(ship,context=''){
 if(!ship||typeof hdShipDbExpansionInfo!=='function')return null;const rows=[];
 for(const item of hdFLCatalog()){
  let info=hdShipDbExpansionInfo(item,ship,0),reqStar=0;
  if(!info.allowed&&Number(info.reqStar)>0){reqStar=Number(info.reqStar)||0;info=hdShipDbExpansionInfo(item,ship,reqStar)}
  if(!info.allowed)continue;
  const bonus=info.mode==='special'?24:info.mode==='global'?16:0,score=(typeof hdShipDbEquipPower==='function'?hdShipDbEquipPower(item,context):0)+bonus-reqStar*.3;
  rows.push({name:item.name,item,reqStar,reason:info.reason||'',mode:info.mode||'',score});
 }
 rows.sort((a,b)=>b.score-a.score||a.reqStar-b.reqStar||a.name.localeCompare(b.name,'ja'));return rows[0]||null;
}
function hdFLRequiredTotalForName(ships,name){
 const key=hdFLNorm(name);if(!key)return 1;let n=0;
 for(const row of ships){for(const x of (row.items||[]))if(hdFLNorm(x.name)===key)n++;if(row.expansion&&hdFLNorm(row.expansion.name)===key)n++}
 return n+1;
}
function hdFLProcureExpansion(planIndex,shipIndex){
 const map=typeof hdFSMap==='function'?hdFSMap():'',key=map+':'+planIndex,plan=HD_FL_CACHE[key]||hdFLGenerate(planIndex),row=plan?.ships?.[Number(shipIndex)],miss=row?.expansionMissing;if(!map||!row||!miss)return false;
 if(typeof hdPLAddExpansionRequirement!=='function')return false;
 const ok=hdPLAddExpansionRequirement(map,row.ship,row.masterId,miss.name,miss.reqStar,miss.reason,miss.requiredTotal||1);
 if(ok&&typeof hdPLOpenList==='function')hdPLOpenList();return ok;
}
function hdFLGenerate(index){
 const map=typeof hdFSMap==='function'?hdFSMap():'',suggestion=typeof hdFSPlans==='function'?hdFSPlans(map)[Number(index)]:null;if(!map||!suggestion)return null;
 const inv=hdFLInventory(),remaining=new Map([...inv].map(([k,v])=>[k,v.count])),needTags=hdFLNeedTags(suggestion.needs),ships=[],missing=[];
 suggestion.slots.forEach((slot,i)=>{
  if(!slot.profile){ships.push({ship:'',type:'',items:[],missing:['艦娘未選択'],master:false,expansion:null});return}
  const count=hdFLSlotCount(slot),items=[],slotMissing=[],memo=slot.profile.row.gear||'',master=hdFLMasterProfile(slot);
  for(let n=0;n<count;n++){
   const kind=hdFLSlotKind(slot,n),picked=hdFLPick(inv,remaining,slot,n,kind,needTags,memo),capacity=hdFLSlotCapacity(slot,n);
   if(picked)items.push({name:picked.name,star:picked.maxStar,stackKey:picked.key,norm:picked.norm,category:picked.item.category||'',kind,slotIndex:n,capacity});
   else{slotMissing.push(kind);missing.push({ship:slot.profile.row.name,kind,slotIndex:n,capacity})}
  }
  ships.push({ship:slot.profile.row.name,masterId:Number(slot.profile.row.masterId)||Number(master?.id)||0,type:slot.profile.type||'',items,missing:slotMissing,master:!!master,expansion:null,expansionMissing:null});
 });
 // Optional expansion-slot suggestions, only after every normal slot has been allocated.
 ships.forEach((row,i)=>{
  const slot=suggestion.slots[i],ship=hdFLShipDbItem(slot);
  if(!ship||typeof hdShipDbExpansionCandidates!=='function')return;
  const context=[...(suggestion.needs||[]).map(x=>x.kind||''),slot?.profile?.row?.gear||''].join(' ');
  let pick=hdShipDbExpansionCandidates(ship,remaining,context)[0],rebalance=null;
  if(!pick){rebalance=hdFLRebalanceExpansion(inv,remaining,suggestion,ships,i,ship,context);if(rebalance){const rows=hdShipDbExpansionCandidates(ship,remaining,context);pick=rows.find(x=>x.own.key===rebalance.own.key)||rows[0]||null}}
  if(pick&&Number(pick.score)>0){
   const moved=rebalance&&pick.own.key===rebalance.own.key?`・★条件のため${ships[rebalance.sourceIndex].ship}の通常枠を★${rebalance.replacement.maxStar||0}へ自動入替`:'';
   row.expansion={name:pick.own.name,star:pick.own.maxStar||0,stackKey:pick.own.key,reason:(pick.info?.reason||'')+moved,mode:pick.info?.mode||'',rebalanced:!!moved};
   remaining.set(pick.own.key,Math.max(0,(remaining.get(pick.own.key)||0)-1));return;
  }
  const miss=hdFLExpansionMissingCandidate(ship,context);if(miss)row.expansionMissing={...miss,requiredTotal:hdFLRequiredTotalForName(ships,miss.name)};
 });
 const used={};for(const s of ships){for(const x of s.items)used[x.name]=(used[x.name]||0)+1;if(s.expansion)used[s.expansion.name]=(used[s.expansion.name]||0)+1}
 const owned={};for(const x of inv.values())owned[x.name]=(owned[x.name]||0)+x.count;
 const plan={map,index:Number(index),suggestion,ships,missing,used,owned,masterBacked:ships.filter(x=>x.master).length,createdAt:Date.now()};HD_FL_CACHE[map+':'+index]=plan;return plan;
}
function hdFLKindLabel(k){return ({smallGun:'小口径主砲',mediumGun:'中口径主砲',smallMediumGun:'主砲',largeGun:'大口径主砲',torpedo:'魚雷',recon:'偵察/索敵',fighter:'艦戦',airAttack:'艦攻/艦爆',waterAir:'水上機',ap:'徹甲弾',utility:'海域向け装備'})[k]||k}
function hdFLPlanHtml(plan){
 const used=Object.entries(plan.used).map(([n,c])=>`${hdFLEsc(n)} ×${c} / 所持${plan.owned[n]||0}`).join('、');
 return `<div class="hd-fl-plan">
  <div class="hd-fl-summary"><div><strong>手持ち装備の自動配備</strong><span>所持数＋艦別装備可否＋実スロット制限を反映</span></div><b class="${plan.missing.length?'warn':'ok'}">${plan.missing.length?`未配備 ${plan.missing.length}枠`:'主要枠を配備'}</b></div>
  <div class="hd-fl-master-status">マスター同期 ${plan.masterBacked||0}/${plan.ships.filter(x=>x.ship).length}隻</div>
  <div class="hd-fl-ships">${plan.ships.map((s,i)=>{const image=s.ship&&typeof hdShipImageThumbHtml==='function'?hdShipImageThumbHtml(Number(s.masterId)>0?{id:Number(s.masterId),name:s.ship}:s.ship,'loadout-thumb'):'';return `<div class="hd-fl-ship"><div class="hd-fl-ship-head"><span>${i+1}</span>${image}<div><strong>${hdFLEsc(s.ship||'艦娘未選択')}</strong><small>${hdFLEsc(s.type||'')}${s.master?'・マスター判定':''}</small></div></div><div class="hd-fl-items">${s.items.map(x=>`<span>${hdFLEsc(x.name)}${x.star?` ★${x.star}`:''}<small>第${(x.slotIndex??0)+1}スロ${x.capacity!=null?`・${x.capacity}機`:''}</small></span>`).join('')||'<em>配備なし</em>'}</div>${s.expansion?`<div class="hd-fl-expansion"><i>増設候補</i><b>${hdFLEsc(s.expansion.name)}${s.expansion.star?` ★${s.expansion.star}`:''}</b><small>${hdFLEsc(s.expansion.reason)}</small></div>`:''}${s.expansionMissing?`<div class="hd-fl-expansion missing"><i>増設不足</i><b>${hdFLEsc(s.expansionMissing.name)}${s.expansionMissing.reqStar?` ★${s.expansionMissing.reqStar}+`:''}</b><small>${hdFLEsc(s.expansionMissing.reason)}</small><button type="button" class="ghost small" data-hd-fl-procure-expansion="${plan.index}" data-hd-fl-ship-index="${i}">調達リストへ</button></div>`:''}${s.missing.length?`<small class="hd-fl-missing">未配備: ${s.missing.map(hdFLKindLabel).join(' / ')}</small>`:''}</div>`}).join('')}</div>
  ${used?`<div class="hd-fl-usage"><b>在庫使用:</b> ${used}</div>`:''}
  <div class="hd-fl-actions"><button type="button" class="primary small" data-hd-fl-save="${plan.index}">この装備込みで保存</button><button type="button" class="primary small" data-hd-fl-prepare="${plan.index}">保存して出撃準備へ</button><button type="button" class="ghost small" data-hd-fl-regenerate="${plan.index}">再配備</button><button type="button" class="ghost small" data-hd-fl-ledger>装備台帳</button></div>
  <p class="hd-fl-note">※詳細100隻に加え、公式マスター全865形態も通常スロット数・搭載数・装備カテゴリ可否を反映。位置別制限・補強増設ルールもマスターIDが解決できる艦は同じ判定を使う。</p>
 </div>`;
}
function hdFLRender(index,card){
 const plan=hdFLGenerate(index);if(!plan||!card)return;
 let host=card.querySelector('.hd-fl-host');if(!host){host=document.createElement('div');host.className='hd-fl-host';card.appendChild(host)}
 host.innerHTML=hdFLPlanHtml(plan);if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(host);host.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function hdFLInstall(){
 if(window.__hdFleetLoadoutInstalled||typeof hdFSSuggestionHtml!=='function')return false;window.__hdFleetLoadoutInstalled=true;
 const prev=hdFSSuggestionHtml;hdFSSuggestionHtml=function(s){
  let html=prev(s);
  const btn=`<button type="button" class="ghost small" data-hd-fl-generate="${s.index}">手持ち装備を自動配備</button>`;
  html=html.replace('</div></article>',`${btn}</div><div class="hd-fl-host"></div></article>`);return html;
 };
 if(typeof hdFSRender==='function')hdFSRender();return true;
}
function hdFLSave(index){
 const map=typeof hdFSMap==='function'?hdFSMap():'',key=map+':'+index,plan=HD_FL_CACHE[key]||hdFLGenerate(index);if(!map||!plan)return;
 const s=plan.suggestion,all=typeof loadCustomFleets==='function'?loadCustomFleets():{};all[map]=all[map]||[];
 const name=map+' 自動提案＋装備｜'+(s.preset.name||('候補'+(s.index+1)));
 const ships=Array.from({length:6},(_,i)=>{const slot=s.slots[i],r=slot?.profile?.row,p=plan.ships[i];const normal=(p?.items||[]).map(x=>x.name+(x.star?` ★${x.star}`:''));if(p?.expansion)normal.push(`[増設] ${p.expansion.name}${p.expansion.star?` ★${p.expansion.star}`:''}`);return {ship:r?.name||'',gameShipId:Number(r?.gameShipId)||0,masterId:Number(p?.masterId)||Number(r?.masterId)||0,gear:normal.join(' / ')}});
 const memo='HarborDesk手持ち装備自動配備。所持数に加え、詳細100隻＋公式マスター全865形態の通常スロット数・搭載数・装備可否を反映。';
 const old=all[map].find(x=>x.name===name),id=old?.id||(typeof cfUid==='function'?cfUid():'fl-'+Date.now()+'-'+Math.random().toString(16).slice(2));
 const item={id,name,ships,memo,createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};all[map]=old?all[map].map(x=>x.id===id?item:x):all[map].concat(item);
 if(typeof saveCustomFleets==='function')saveCustomFleets(all);else localStorage.setItem('harbordesk-custom-fleets-v1',JSON.stringify(all));
 if(typeof hdSortieSetSelection==='function')hdSortieSetSelection(map,id);if(typeof renderCustomFleets==='function')renderCustomFleets(map);if(typeof hdSPSRender==='function')hdSPSRender();
 const b=document.querySelector(`[data-hd-fl-save="${index}"]`);if(b){b.textContent='装備込みで保存したよ';setTimeout(()=>b.textContent='この装備込みで保存',1300)}
 return item;
}
function hdFLSaveAndPrepare(index){
 const saved=hdFLSave(index);if(!saved)return false;
 if(typeof hdSPSOpen==='function')setTimeout(()=>hdSPSOpen(),40);
 else if(typeof hdWSShowElement==='function')setTimeout(()=>hdWSShowElement('hdSortiePreparation',true),40);
 return true;
}
function hdFLInvalidate(){
 for(const k of Object.keys(HD_FL_CACHE))delete HD_FL_CACHE[k];
}
document.addEventListener('click',e=>{
 const gen=e.target.closest?.('[data-hd-fl-generate]');if(gen){hdFLRender(gen.dataset.hdFlGenerate,gen.closest('.hd-fs-card'));return}
 const regen=e.target.closest?.('[data-hd-fl-regenerate]');if(regen){hdFLRender(regen.dataset.hdFlRegenerate,regen.closest('.hd-fs-card'));return}
 const save=e.target.closest?.('[data-hd-fl-save]');if(save){hdFLSave(save.dataset.hdFlSave);return}
 const prepare=e.target.closest?.('[data-hd-fl-prepare]');if(prepare){hdFLSaveAndPrepare(prepare.dataset.hdFlPrepare);return}
 const procure=e.target.closest?.('[data-hd-fl-procure-expansion]');if(procure){hdFLProcureExpansion(procure.dataset.hdFlProcureExpansion,procure.dataset.hdFlShipIndex);return}
 if(e.target.closest?.('[data-hd-fl-ledger]')){if(typeof hdWSShowElement==='function')hdWSShowElement('equipmentBook',true);return}
});
window.addEventListener('storage',e=>{if(e.key===HD_FL_KEY)hdFLInvalidate()});
window.addEventListener('hd:ship-images-changed',()=>{document.querySelectorAll('.hd-fl-host').forEach(host=>{if(typeof hdShipImageHydrate==='function')hdShipImageHydrate(host)})});
window.addEventListener('hd:equipment-changed',hdFLInvalidate);
window.addEventListener('hd:kancolle-sync',hdFLInvalidate);
window.addEventListener('hd:ship-identity-changed',hdFLInvalidate);
window.addEventListener('load',()=>setTimeout(()=>{if(!hdFLInstall())setTimeout(hdFLInstall,500)},650));
hdFLInstall();
