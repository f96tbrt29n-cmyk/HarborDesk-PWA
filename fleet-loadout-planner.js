const HD_FL_KEY='harbordesk-equipment-v1';
const HD_FL_CACHE={};

function hdFLEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdFLNorm(s){return String(s||'').normalize('NFKC').replace(/\s+/g,'').replace(/･/g,'・')}
function hdFLCatalog(){
 const cat=Array.isArray(window.HD_EQUIPMENT_CATALOG)?window.HD_EQUIPMENT_CATALOG:(typeof HD_EQUIPMENT_CATALOG!=='undefined'?HD_EQUIPMENT_CATALOG:[]);
 return Array.isArray(cat)?cat:[];
}
function hdFLRows(){try{const x=JSON.parse(localStorage.getItem(HD_FL_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function hdFLInventory(){
 const cat=hdFLCatalog(),byName=new Map(cat.map(x=>[hdFLNorm(x.name),x])),m=new Map();
 for(const row of hdFLRows()){
  const key=hdFLNorm(row.name),count=Math.max(0,Number(row.count)||0);if(!key||!count)continue;
  const meta=byName.get(key)||{name:row.name,category:row.category||'',stats:{},tags:[],role:''},cur=m.get(key)||{key,name:row.name,count:0,maxStar:0,item:meta};
  cur.count+=count;cur.maxStar=Math.max(cur.maxStar,Math.max(0,Number(row.star)||0));m.set(key,cur);
 }
 return m;
}
function hdFLType(slot){return slot?.profile?.type||''}
function hdFLRoles(slot){return slot?.profile?.roles||[]}
function hdFLIsCarrier(type){return ['軽空母','正規空母','装甲空母'].includes(type)}
function hdFLIsBattleship(type){return ['戦艦','高速戦艦','航空戦艦'].includes(type)}
function hdFLIsCruiser(type){return ['軽巡洋艦','重雷装巡洋艦','重巡洋艦','航空巡洋艦','練習巡洋艦'].includes(type)}
function hdFLIsDestroyer(type){return ['駆逐艦','海防艦'].includes(type)}
function hdFLCompatible(item,slot){
 const type=hdFLType(slot),cat=String(item.category||''),tags=item.tags||[],roles=hdFLRoles(slot);
 if(/陸上攻撃機|陸軍戦闘機|局地戦闘機/.test(cat))return false;
 if(/艦上戦闘機|艦上攻撃機|艦上爆撃機|艦上偵察機/.test(cat))return hdFLIsCarrier(type);
 if(/大口径主砲/.test(cat))return hdFLIsBattleship(type);
 if(/中口径主砲/.test(cat))return hdFLIsCruiser(type)||['航空巡洋艦'].includes(type);
 if(/小口径主砲/.test(cat))return hdFLIsDestroyer(type)||['軽巡洋艦','練習巡洋艦'].includes(type);
 if(/水上戦闘機/.test(cat))return ['航空巡洋艦','航空戦艦','水上機母艦'].includes(type)||roles.includes('水戦')||roles.includes('制空補助');
 if(/水上偵察機/.test(cat))return hdFLIsBattleship(type)||['軽巡洋艦','重巡洋艦','航空巡洋艦','航空戦艦','水上機母艦'].includes(type);
 if(/対艦強化弾/.test(cat))return hdFLIsBattleship(type);
 if(/魚雷/.test(cat))return hdFLIsDestroyer(type)||['軽巡洋艦','重雷装巡洋艦','重巡洋艦','航空巡洋艦','潜水艦','潜水空母'].includes(type);
 if(/ソナー|爆雷/.test(cat))return hdFLIsDestroyer(type)||['軽巡洋艦','練習巡洋艦','軽空母'].includes(type)||roles.some(r=>String(r).includes('対潜'));
 if(/上陸用舟艇|特型内火艇/.test(cat))return roles.some(r=>['対地','輸送'].includes(r))||['水上機母艦','揚陸艦'].includes(type);
 if(/大型電探/.test(cat))return !hdFLIsDestroyer(type);
 if(/電探|機関部強化|対空機銃|探照灯|照明弾|熟練見張員|対空強化弾/.test(cat))return true;
 return !type||true;
}
function hdFLScoreBase(item,own){
 const s=item.stats||{};return (Number(s.火力)||0)*1.2+(Number(s.雷装)||0)*1.1+(Number(s.爆装)||0)+(Number(s.対空)||0)*.9+(Number(s.索敵)||0)*.75+(Number(s.対潜)||0)*.75+(Number(s.命中)||0)*.7+(own.maxStar||0)*.35;
}
function hdFLSlotKind(slot,index){
 const type=hdFLType(slot);
 if(hdFLIsCarrier(type))return ['airAttack','fighter','airAttack','recon'][index]||'utility';
 if(hdFLIsBattleship(type))return ['largeGun','largeGun','recon','ap'][index]||'utility';
 if(type==='重雷装巡洋艦')return ['torpedo','torpedo','utility'][index]||'utility';
 if(['重巡洋艦','航空巡洋艦'].includes(type))return ['mediumGun','mediumGun','recon','utility'][index]||'utility';
 if(['軽巡洋艦','練習巡洋艦'].includes(type))return ['smallMediumGun','smallMediumGun','utility'][index]||'utility';
 if(hdFLIsDestroyer(type))return ['smallGun','smallGun','utility'][index]||'utility';
 if(['潜水艦','潜水空母'].includes(type))return ['torpedo','torpedo'][index]||'utility';
 if(type==='水上機母艦')return ['waterAir','recon','utility'][index]||'utility';
 return 'utility';
}
function hdFLSlotCount(slot){
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
function hdFLPick(inv,remaining,slot,kind,needTags,gearMemo){
 const candidates=[];
 for(const own of inv.values()){
  const left=remaining.get(own.key)||0;if(left<=0||!hdFLCompatible(own.item,slot)||!hdFLKindMatch(own.item,kind))continue;
  const tags=own.item.tags||[],needHit=tags.filter(t=>needTags.includes(t)).length;
  let score=hdFLScoreBase(own.item,own)+needHit*16;
  if(kind==='utility'&&needHit===0)score-=8;
  if(gearMemo&&String(gearMemo).includes(own.name))score+=24;
  candidates.push({own,score});
 }
 candidates.sort((a,b)=>b.score-a.score||b.own.maxStar-a.own.maxStar||a.own.name.localeCompare(b.own.name,'ja'));
 const best=candidates[0];if(!best)return null;
 remaining.set(best.own.key,(remaining.get(best.own.key)||0)-1);return best.own;
}
function hdFLGenerate(index){
 const map=typeof hdFSMap==='function'?hdFSMap():'',suggestion=typeof hdFSPlans==='function'?hdFSPlans(map)[Number(index)]:null;if(!map||!suggestion)return null;
 const inv=hdFLInventory(),remaining=new Map([...inv].map(([k,v])=>[k,v.count])),needTags=hdFLNeedTags(suggestion.needs),ships=[],missing=[];
 suggestion.slots.forEach((slot,i)=>{
  if(!slot.profile){ships.push({ship:'',type:'',items:[],missing:['艦娘未選択']});return}
  const count=hdFLSlotCount(slot),items=[],slotMissing=[],memo=slot.profile.row.gear||'';
  for(let n=0;n<count;n++){
   const kind=hdFLSlotKind(slot,n),picked=hdFLPick(inv,remaining,slot,kind,needTags,memo);
   if(picked)items.push({name:picked.name,star:picked.maxStar,category:picked.item.category||'',kind});
   else{slotMissing.push(kind);missing.push({ship:slot.profile.row.name,kind})}
  }
  ships.push({ship:slot.profile.row.name,type:slot.profile.type||'',items,missing:slotMissing});
 });
 const used={};for(const s of ships)for(const x of s.items)used[x.name]=(used[x.name]||0)+1;
 const owned={};for(const x of inv.values())owned[x.name]=x.count;
 const plan={map,index:Number(index),suggestion,ships,missing,used,owned,createdAt:Date.now()};HD_FL_CACHE[map+':'+index]=plan;return plan;
}
function hdFLKindLabel(k){return ({smallGun:'小口径主砲',mediumGun:'中口径主砲',smallMediumGun:'主砲',largeGun:'大口径主砲',torpedo:'魚雷',recon:'偵察/索敵',fighter:'艦戦',airAttack:'艦攻/艦爆',waterAir:'水上機',ap:'徹甲弾',utility:'海域向け装備'})[k]||k}
function hdFLPlanHtml(plan){
 const used=Object.entries(plan.used).map(([n,c])=>`${hdFLEsc(n)} ×${c} / 所持${plan.owned[n]||0}`).join('、');
 return `<div class="hd-fl-plan">
  <div class="hd-fl-summary"><div><strong>手持ち装備の自動配備</strong><span>所持数を超えない範囲で主要装備を割り当て</span></div><b class="${plan.missing.length?'warn':'ok'}">${plan.missing.length?`未配備 ${plan.missing.length}枠`:'主要枠を配備'}</b></div>
  <div class="hd-fl-ships">${plan.ships.map((s,i)=>`<div class="hd-fl-ship"><div class="hd-fl-ship-head"><span>${i+1}</span><div><strong>${hdFLEsc(s.ship||'艦娘未選択')}</strong><small>${hdFLEsc(s.type||'')}</small></div></div><div class="hd-fl-items">${s.items.map(x=>`<span>${hdFLEsc(x.name)}${x.star?` ★${x.star}`:''}</span>`).join('')||'<em>配備なし</em>'}</div>${s.missing.length?`<small class="hd-fl-missing">未配備: ${s.missing.map(hdFLKindLabel).join(' / ')}</small>`:''}</div>`).join('')}</div>
  ${used?`<div class="hd-fl-usage"><b>在庫使用:</b> ${used}</div>`:''}
  <div class="hd-fl-actions"><button type="button" class="primary small" data-hd-fl-save="${plan.index}">この装備込みで保存</button><button type="button" class="ghost small" data-hd-fl-regenerate="${plan.index}">再配備</button><button type="button" class="ghost small" data-hd-fl-ledger>装備台帳</button></div>
  <p class="hd-fl-note">※艦種ごとの代表的な搭載分類で作る主要装備案。個艦の特殊搭載可否・補強増設・艦載機スロット数・熟練度などはゲーム画面で最終確認してね。</p>
 </div>`;
}
function hdFLRender(index,card){
 const plan=hdFLGenerate(index);if(!plan||!card)return;
 let host=card.querySelector('.hd-fl-host');if(!host){host=document.createElement('div');host.className='hd-fl-host';card.appendChild(host)}
 host.innerHTML=hdFLPlanHtml(plan);host.scrollIntoView({behavior:'smooth',block:'nearest'});
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
 const ships=Array.from({length:6},(_,i)=>{const slot=s.slots[i],r=slot?.profile?.row,p=plan.ships[i];return {ship:r?.name||'',gear:(p?.items||[]).map(x=>x.name+(x.star?` ★${x.star}`:'' )).join(' / ')}});
 const memo='HarborDesk手持ち装備自動配備。所持数制約を反映した主要装備案。ゲーム側で搭載可否・スロット数を最終確認。';
 const old=all[map].find(x=>x.name===name),id=old?.id||(typeof cfUid==='function'?cfUid():'fl-'+Date.now()+'-'+Math.random().toString(16).slice(2));
 const item={id,name,ships,memo,createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};all[map]=old?all[map].map(x=>x.id===id?item:x):all[map].concat(item);
 if(typeof saveCustomFleets==='function')saveCustomFleets(all);else localStorage.setItem('harbordesk-custom-fleets-v1',JSON.stringify(all));
 if(typeof hdSortieSetSelection==='function')hdSortieSetSelection(map,id);if(typeof renderCustomFleets==='function')renderCustomFleets(map);if(typeof hdSPSRender==='function')hdSPSRender();
 const b=document.querySelector(`[data-hd-fl-save="${index}"]`);if(b){b.textContent='装備込みで保存したよ';setTimeout(()=>b.textContent='この装備込みで保存',1300)}
}
document.addEventListener('click',e=>{
 const gen=e.target.closest?.('[data-hd-fl-generate]');if(gen){hdFLRender(gen.dataset.hdFlGenerate,gen.closest('.hd-fs-card'));return}
 const regen=e.target.closest?.('[data-hd-fl-regenerate]');if(regen){hdFLRender(regen.dataset.hdFlRegenerate,regen.closest('.hd-fs-card'));return}
 const save=e.target.closest?.('[data-hd-fl-save]');if(save){hdFLSave(save.dataset.hdFlSave);return}
 if(e.target.closest?.('[data-hd-fl-ledger]')){if(typeof hdWSShowElement==='function')hdWSShowElement('equipmentBook',true);return}
});
window.addEventListener('storage',e=>{if(e.key===HD_FL_KEY){for(const k of Object.keys(HD_FL_CACHE))delete HD_FL_CACHE[k]}});
window.addEventListener('load',()=>setTimeout(()=>{if(!hdFLInstall())setTimeout(hdFLInstall,500)},650));
hdFLInstall();
