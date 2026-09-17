const HD_DROP_HUNT_KEY='harbordesk-drop-hunts-v1';
const HD_DROP_TARGETS=[
 {ship:'明石',type:'工作艦',locations:[
  {map:'1-5',node:'J ボス',rank:'S',note:'司令部Lv40以上。敵編成によってはドロップしない。2024/10/18以降は2隻目まで報告あり。'},
  {map:'2-5',node:'O ボス',rank:'A/S',note:'未所持向けの特別ドロップが継続。通常のドロップ報告もある。'},
  {map:'3-5',node:'H / Kボス',rank:'S',note:'Hは北方棲姫マス。Kボスでも確認。'},
  {map:'6-2',node:'I / J',rank:'S',note:'道中S勝利で確認。'}],source:'攻略Wiki 明石 / 各海域ページ',checked:'2026-09-17'},
 {ship:'大鯨',type:'潜水母艦',locations:[
  {map:'2-5',node:'O ボス',rank:'A/S',note:'ボスマスで確認。'},
  {map:'6-5',node:'E',rank:'S',note:'道中Eマスで確認。'}],source:'攻略Wiki 2-5 / 出撃ドロップ6-5',checked:'2026-09-17'},
 {ship:'大淀',type:'軽巡洋艦',locations:[
  {map:'1-6',node:'B / J',rank:'S',note:'非常に低確率。Bは強い敵編成での報告が多い。'}],source:'攻略Wiki 1-6',checked:'2026-09-17'},
 {ship:'朝雲',type:'駆逐艦',locations:[
  {map:'1-6',node:'B / J',rank:'S',note:'道中のためドロップ自体が発生しない場合あり。'}],source:'攻略Wiki 1-6',checked:'2026-09-17'},
 {ship:'天津風',type:'駆逐艦',locations:[
  {map:'3-5',node:'K ボス',rank:'S',note:'ゲージ強化後を含めボスSで確認。'},
  {map:'7-4',node:'H / Pボス',rank:'S',note:'H・Pで確認。'}],source:'攻略Wiki 3-5 / 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'風雲',type:'駆逐艦',locations:[
  {map:'3-5',node:'K ボス',rank:'S',note:'ボスSで確認。'}],source:'攻略Wiki 3-5',checked:'2026-09-17'},
 {ship:'まるゆ',type:'潜水艦',locations:[
  {map:'3-5',node:'H',rank:'S',note:'北方棲姫マスS勝利で確認。'}],source:'攻略Wiki 3-5',checked:'2026-09-17'},
 {ship:'雲龍',type:'正規空母',locations:[
  {map:'6-3',node:'J ボス',rank:'S',note:'通常海域では重要な入手機会。ボスS勝利が必要。'}],source:'攻略Wiki 6-3',checked:'2026-09-17'},
 {ship:'阿賀野',type:'軽巡洋艦',locations:[
  {map:'6-3',node:'J ボス',rank:'S',note:'2025/10/29以降、春雨と入れ替わる形でボスドロップ確認。'}],source:'攻略Wiki 6-3',checked:'2026-09-17'},
 {ship:'能代',type:'軽巡洋艦',locations:[
  {map:'6-3',node:'J ボス',rank:'S',note:'ボスSで確認。大型建造でも入手可能。'}],source:'攻略Wiki 6-3',checked:'2026-09-17'},
 {ship:'鹿島',type:'練習巡洋艦',locations:[
  {map:'6-5',node:'M ボス',rank:'S',note:'ボスマスで確認。'}],source:'攻略Wiki 出撃ドロップ6-5',checked:'2026-09-17'},
 {ship:'春雨',type:'駆逐艦',locations:[
  {map:'6-5',node:'M ボス',rank:'S',note:'6-5ボスで確認。6-3では2025/10/29以降ドロップしなくなった。'}],source:'攻略Wiki 6-3 / 出撃ドロップ6-5',checked:'2026-09-17'},
 {ship:'神威',type:'補給艦',locations:[
  {map:'7-4',node:'H / Pボス',rank:'S',note:'H・Pで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'春日丸',type:'軽空母',locations:[
  {map:'7-4',node:'P ボス',rank:'S',note:'ボスマスで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'対馬',type:'海防艦',locations:[
  {map:'7-4',node:'P ボス',rank:'S',note:'ボスマスで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'平戸',type:'海防艦',locations:[
  {map:'7-4',node:'P ボス',rank:'S',note:'ボスマスで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'御蔵',type:'海防艦',locations:[
  {map:'7-4',node:'P ボス',rank:'S',note:'ボスマスで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'日振',type:'海防艦',locations:[
  {map:'7-4',node:'H / Pボス',rank:'S',note:'H・Pで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'大東',type:'海防艦',locations:[
  {map:'7-4',node:'P ボス',rank:'S',note:'ボスマスで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'松輪',type:'海防艦',locations:[
  {map:'7-4',node:'H',rank:'S',note:'Hマスで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'},
 {ship:'佐渡',type:'海防艦',locations:[
  {map:'7-4',node:'H',rank:'S',note:'Hマスで確認。'}],source:'攻略Wiki 出撃ドロップ7-4',checked:'2026-09-17'}
];
let hdDropMap='すべて';
let hdDropMissingOnly=false;
function hdDropEsc(s){return typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdDropRosterNames(){try{return new Set((JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]')||[]).map(x=>String(x.name||'').trim()).filter(Boolean))}catch{return new Set()}}
function hdDropOwned(ship){const names=hdDropRosterNames();return [...names].some(n=>n===ship||n.startsWith(ship))}
function hdDropHunts(){try{return JSON.parse(localStorage.getItem(HD_DROP_HUNT_KEY)||'[]')||[]}catch{return []}}
function hdDropSave(v){localStorage.setItem(HD_DROP_HUNT_KEY,JSON.stringify(v));hdRenderDropHunts();hdRenderDropDb()}
function hdDropUid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2)}
function hdRenderDropDb(){
 const host=document.getElementById('hdDropDbList');if(!host)return;
 const q=(document.getElementById('hdDropSearch')?.value||'').trim().toLowerCase();
 const owned=hdDropRosterNames();
 let rows=HD_DROP_TARGETS.filter(x=>(hdDropMap==='すべて'||x.locations.some(l=>l.map===hdDropMap))&&(!q||`${x.ship} ${x.type} ${x.locations.map(l=>`${l.map} ${l.node} ${l.note}`).join(' ')}`.toLowerCase().includes(q)));
 if(hdDropMissingOnly)rows=rows.filter(x=>![...owned].some(n=>n===x.ship||n.startsWith(x.ship)));
 const count=document.getElementById('hdDropCount');if(count)count.textContent=`${rows.length}隻`;
 host.innerHTML=rows.map(x=>{const isOwned=hdDropOwned(x.ship);return `<article class="hd-drop-card"><div class="hd-drop-head"><div><strong>${hdDropEsc(x.ship)}</strong><span>${hdDropEsc(x.type)}</span></div><b class="${isOwned?'owned':'missing'}">${isOwned?'所持済み':'未所持'}</b></div><div class="hd-drop-locations">${x.locations.filter(l=>hdDropMap==='すべて'||l.map===hdDropMap).map((l,i)=>`<div class="hd-drop-location"><div><strong>${hdDropEsc(l.map)} ${hdDropEsc(l.node)}</strong><span>${hdDropEsc(l.rank)}勝利目安</span></div><p>${hdDropEsc(l.note)}</p><button class="primary small" type="button" data-hd-drop-target="${hdDropEsc(x.ship)}" data-hd-drop-map="${hdDropEsc(l.map)}" data-hd-drop-node="${hdDropEsc(l.node)}">ここを掘り目標にする</button></div>`).join('')}</div><div class="hd-drop-source">${hdDropEsc(x.source)}｜確認 ${hdDropEsc(x.checked)}</div></article>`}).join('')||'<div class="empty">条件に合うドロップ候補がないよ</div>';
}
function hdRenderDropHunts(){
 const host=document.getElementById('hdDropHuntList');if(!host)return;const rows=hdDropHunts();
 host.innerHTML=rows.length?rows.map(h=>`<article class="hd-hunt-card${h.obtained?' done':''}"><div class="hd-hunt-head"><div><strong>${hdDropEsc(h.ship)}</strong><span>${hdDropEsc(h.map)} ${hdDropEsc(h.node)}</span></div><button class="ghost small" type="button" data-hd-hunt-delete="${h.id}">削除</button></div><div class="hd-hunt-stats"><span>周回 <b>${h.runs||0}</b></span><span>S <b>${h.s||0}</b></span><span>A <b>${h.a||0}</b></span></div><div class="hd-hunt-actions"><button class="ghost small" data-hd-hunt-add="${h.id}" data-field="runs">＋1周</button><button class="ghost small" data-hd-hunt-add="${h.id}" data-field="s">＋S</button><button class="ghost small" data-hd-hunt-add="${h.id}" data-field="a">＋A</button><button class="primary small" data-hd-hunt-obtained="${h.id}">${h.obtained?'入手済み ✓':'入手した！'}</button></div>${h.obtained&&!hdDropOwned(h.ship)?`<button class="ghost small" data-hd-hunt-roster="${h.id}">艦隊台帳へ追加</button>`:''}</article>`).join(''):'<div class="empty">掘り目標はまだないよ。下の逆引きから追加できる。</div>';
}
function hdAddDropTarget(ship,map,node){const rows=hdDropHunts();if(rows.some(x=>x.ship===ship&&x.map===map&&x.node===node&&!x.obtained)){document.getElementById('hdDropHuntList')?.scrollIntoView({behavior:'smooth',block:'center'});return}rows.unshift({id:hdDropUid(),ship,map,node,runs:0,s:0,a:0,obtained:false,createdAt:Date.now()});hdDropSave(rows);document.getElementById('hdDropHuntList')?.scrollIntoView({behavior:'smooth',block:'center'})}
function hdEnsureDropDb(){
 if(document.getElementById('dropHuntingDb'))return;const anchor=document.getElementById('shipDatabase')||document.getElementById('roster');if(!anchor)return;
 const maps=['すべて',...new Set(HD_DROP_TARGETS.flatMap(x=>x.locations.map(l=>l.map)))].sort((a,b)=>a==='すべて'?-1:a.localeCompare(b,undefined,{numeric:true}));
 const sec=document.createElement('section');sec.id='dropHuntingDb';sec.className='advanced-section';sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">DROP / FARMING</div><h2>ドロップ逆引き・掘り記録</h2></div><span id="hdDropCount" class="muted"></span></div><div class="hd-drop-warning">ドロップはアップデートで変更されることがあるよ。ここでは現行Wikiで確認した主要な恒常候補を収録し、確認日を表示している。</div><div class="hd-drop-toolbar"><input id="hdDropSearch" type="search" placeholder="艦名・海域・マスで検索"><label><input id="hdDropMissingOnly" type="checkbox"> 未所持だけ</label></div><div class="hd-drop-filters">${maps.map(m=>`<button class="ghost small${m==='すべて'?' active':''}" type="button" data-hd-drop-mapfilter="${m}">${m}</button>`).join('')}</div><div class="hd-hunt-title"><strong>掘り目標</strong><span class="muted">周回・勝利数を端末内保存</span></div><div id="hdDropHuntList" class="hd-hunt-list"></div><div id="hdDropDbList" class="hd-drop-list"></div><div><a class="guide-link" href="https://wikiwiki.jp/kancolle/%E9%80%86%E5%BC%95%E3%81%8D%E8%89%A6%E5%A8%98%E3%83%89%E3%83%AD%E3%83%83%E3%83%97%E8%A1%A8" target="_blank" rel="noopener">攻略Wiki ドロップ逆引きで最新情報 ↗</a></div>`;anchor.insertAdjacentElement('afterend',sec);
 document.getElementById('hdDropSearch').addEventListener('input',hdRenderDropDb);document.getElementById('hdDropMissingOnly').addEventListener('change',e=>{hdDropMissingOnly=e.target.checked;hdRenderDropDb()});hdRenderDropHunts();hdRenderDropDb();
}
document.addEventListener('click',e=>{
 const mf=e.target.closest?.('[data-hd-drop-mapfilter]');if(mf){hdDropMap=mf.dataset.hdDropMapfilter;document.querySelectorAll('[data-hd-drop-mapfilter]').forEach(b=>b.classList.toggle('active',b===mf));hdRenderDropDb();return}
 const add=e.target.closest?.('[data-hd-drop-target]');if(add){hdAddDropTarget(add.dataset.hdDropTarget,add.dataset.hdDropMap,add.dataset.hdDropNode);return}
 const inc=e.target.closest?.('[data-hd-hunt-add]');if(inc){const rows=hdDropHunts(),h=rows.find(x=>x.id===inc.dataset.hdHuntAdd);if(h){h.runs=(h.runs||0)+1;if(inc.dataset.field==='s')h.s=(h.s||0)+1;if(inc.dataset.field==='a')h.a=(h.a||0)+1;hdDropSave(rows)}return}
 const got=e.target.closest?.('[data-hd-hunt-obtained]');if(got){const rows=hdDropHunts(),h=rows.find(x=>x.id===got.dataset.hdHuntObtained);if(h){h.obtained=!h.obtained;h.obtainedAt=h.obtained?Date.now():null;hdDropSave(rows)}return}
 const del=e.target.closest?.('[data-hd-hunt-delete]');if(del){hdDropSave(hdDropHunts().filter(x=>x.id!==del.dataset.hdHuntDelete));return}
 const rr=e.target.closest?.('[data-hd-hunt-roster]');if(rr){const h=hdDropHunts().find(x=>x.id===rr.dataset.hdHuntRoster);if(h&&typeof openShipRosterDialog==='function'){openShipRosterDialog({name:h.ship,memo:`${h.map} ${h.node}で入手。HarborDesk掘り記録 ${h.runs||0}周。`})}}
});
window.addEventListener('load',()=>setTimeout(hdEnsureDropDb,340));setTimeout(hdEnsureDropDb,520);
