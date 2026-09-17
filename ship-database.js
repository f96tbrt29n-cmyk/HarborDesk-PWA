const HD_SHIP_DATABASE=[
 {base:'長門',final:'長門改二',type:'戦艦',speed:'低速',targetLv:88,path:'長門 → 長門改(Lv30) → 長門改二(Lv88)',requirements:'Lv88＋改装設計図',roles:['特殊砲撃','対艦','高耐久'],note:'長門型特殊砲撃の中核。重量編成・高難度海域向け。'},
 {base:'陸奥',final:'陸奥改二',type:'戦艦',speed:'低速',targetLv:89,path:'陸奥 → 陸奥改(Lv30) → 陸奥改二(Lv89)',requirements:'Lv89＋改装設計図',roles:['特殊砲撃','対艦','高耐久'],note:'長門改二と組ませる特殊砲撃編成で使いやすい。'},
 {base:'大和',final:'大和改二',type:'戦艦',speed:'高速',targetLv:88,path:'大和 → 大和改(Lv60) → 大和改二(Lv88) ⇔ 大和改二重(Lv93)',requirements:'Lv88＋改装設計図×3＋新型砲熕兵装資材×3＋戦闘詳報＋新型高温高圧缶×2',roles:['特殊砲撃','最終海域','対地'],note:'改二は高速。Lv93で改二重へコンバート可能。'},
 {base:'武蔵',final:'武蔵改二',type:'戦艦',speed:'低速',targetLv:89,path:'武蔵 → 武蔵改(Lv40) → 武蔵改二(Lv89)',requirements:'Lv89＋改装設計図×3＋新型砲熕兵装資材×3＋戦闘詳報',roles:['特殊砲撃','最終海域','高耐久'],note:'大和型の重量級戦艦。高難度攻略の主力候補。'},
 {base:'伊勢',final:'伊勢改二',type:'航空戦艦',speed:'低速',targetLv:88,path:'伊勢 → 伊勢改(Lv10) → 伊勢改二(Lv88)',requirements:'Lv88＋改装設計図×2＋試製甲板カタパルト＋戦闘詳報',roles:['制空補助','航空戦艦','艦戦運用'],note:'航空戦艦ながら艦戦運用もでき、制空調整に便利。'},
 {base:'日向',final:'日向改二',type:'航空戦艦',speed:'低速',targetLv:90,path:'日向 → 日向改(Lv10) → 日向改二(Lv90)',requirements:'Lv90＋改装設計図×2＋試製甲板カタパルト＋戦闘詳報＋航空系資材',roles:['制空補助','航空戦艦','対潜補助'],note:'伊勢改二と同系統。装備構成で役割を大きく変えられる。'},
 {base:'赤城',final:'赤城改二',type:'正規空母',speed:'高速',targetLv:90,path:'赤城 → 赤城改(Lv30) → 赤城改二(Lv90) ⇔ 赤城改二戊(Lv92)',requirements:'Lv90＋改装設計図×2＋試製甲板カタパルト＋戦闘詳報＋新型航空兵装資材×2＋開発資材×100',roles:['制空','航空火力','夜間航空'],note:'改二戊は夜間航空運用向けのコンバート。'},
 {base:'加賀',final:'加賀改二',type:'正規空母',speed:'高速',targetLv:82,path:'加賀 → 加賀改(Lv30) → 加賀改二(Lv82) ⇔ 改二戊 / 改二護',requirements:'Lv82＋改装設計図×2＋試製甲板カタパルト＋戦闘詳報＋新型航空兵装資材×2＋開発資材×120',roles:['制空','航空火力','対潜護衛'],note:'改二戊・改二護へのコンバートで運用特性が変わる。'},
 {base:'翔鶴',final:'翔鶴改二甲',type:'装甲空母',speed:'高速',targetLv:88,path:'翔鶴 → 翔鶴改(Lv30) → 翔鶴改二(Lv80) ⇔ 翔鶴改二甲(Lv88)',requirements:'改二: Lv80＋改装設計図＋試製甲板カタパルト / 甲: Lv88',roles:['航空火力','装甲空母','制空'],note:'中破でも航空攻撃可能な装甲空母形態が高難度で有用。'},
 {base:'瑞鶴',final:'瑞鶴改二甲',type:'装甲空母',speed:'高速',targetLv:90,path:'瑞鶴 → 瑞鶴改(Lv25) → 瑞鶴改二(Lv77) ⇔ 瑞鶴改二甲(Lv90)',requirements:'改二: Lv77＋改装設計図＋試製甲板カタパルト / 甲: Lv90',roles:['航空火力','装甲空母','制空'],note:'翔鶴改二甲と並ぶ装甲空母の主力。'},
 {base:'最上',final:'最上改二特',type:'航空巡洋艦',speed:'高速',targetLv:90,path:'最上 → 最上改(Lv10) → 最上改二(Lv80) ⇔ 最上改二特(Lv90)',requirements:'改二: Lv80＋改装設計図＋新型航空兵装資材×2＋戦闘詳報＋開発資材×60 / 特: Lv90＋高速建造材×60＋開発資材×45',roles:['対地','甲標的','水戦','輸送'],note:'改二特は甲標的・大発・内火艇を搭載できる万能航巡。'},
 {base:'矢矧',final:'矢矧改二乙',type:'軽巡洋艦',speed:'高速',targetLv:90,path:'矢矧 → 矢矧改(Lv35) → 矢矧改二(Lv88) ⇔ 矢矧改二乙(Lv90)',requirements:'改二: Lv88＋改装設計図＋戦闘詳報＋高速建造材×88＋開発資材×88 / 乙: Lv90＋高速建造材×30＋開発資材×45',roles:['甲標的','水戦','対潜','夜戦'],note:'改二乙は4スロット・甲標的・水上機運用を両立する万能軽巡。'},
 {base:'夕張',final:'夕張改二特',type:'軽巡洋艦',speed:'高速',targetLv:86,path:'夕張 → 夕張改(Lv25) → 夕張改二(Lv84) ⇔ 改二特(Lv86) / 改二丁(Lv88)',requirements:'改二: Lv84＋改装設計図＋戦闘詳報',roles:['甲標的','対地','対潜','輸送'],note:'改二特は甲標的・大発系を扱える多用途軽巡。'},
 {base:'阿武隈',final:'阿武隈改二',type:'軽巡洋艦',speed:'高速',targetLv:75,path:'阿武隈 → 阿武隈改(Lv17) → 阿武隈改二(Lv75)',requirements:'Lv75＋改装設計図',roles:['甲標的','輸送','遠征'],note:'先制雷撃と大発運用ができ、遠征・輸送でも便利。'},
 {base:'北上',final:'北上改二',type:'重雷装巡洋艦',speed:'高速',targetLv:50,path:'北上 → 北上改(Lv10) → 北上改二(Lv50)',requirements:'Lv50',roles:['先制雷撃','夜戦CI','高雷装'],note:'低コストで高い雷装と夜戦火力を得られる。'},
 {base:'大井',final:'大井改二',type:'重雷装巡洋艦',speed:'高速',targetLv:50,path:'大井 → 大井改(Lv10) → 大井改二(Lv50)',requirements:'Lv50',roles:['先制雷撃','夜戦','高雷装'],note:'北上改二と並ぶ雷巡の定番。'},
 {base:'雪風',final:'雪風改二',type:'駆逐艦',speed:'高速',targetLv:88,path:'雪風 → 雪風改(Lv20) → 丹陽(Lv71) → 雪風改二(Lv88)',requirements:'丹陽: Lv71＋改装設計図＋新型兵装資材×2 / 雪風改二: Lv88＋改装設計図×2＋戦闘詳報',roles:['夜戦CI','幸運艦','対空'],note:'高い運を活かした魚雷CI運用に向く。'},
 {base:'時雨',final:'時雨改三',type:'駆逐艦',speed:'高速',targetLv:97,path:'時雨 → 時雨改(Lv20) → 時雨改二(Lv60) → 時雨改三(Lv97)',requirements:'Lv97＋改装設計図×2＋新型兵装資材×3＋戦闘詳報×2',roles:['夜戦CI','対潜','高運'],note:'高い運と対潜を持つ高水準の駆逐艦。'},
 {base:'霞',final:'霞改二乙',type:'駆逐艦',speed:'高速',targetLv:88,path:'霞 → 霞改(Lv20) → 霞改二(Lv75) ⇔ 霞改二乙(Lv88)',requirements:'改二: Lv75 / 乙: Lv88',roles:['輸送','司令部','対地'],note:'輸送や司令部施設運用で便利。コンバート可能。'},
 {base:'秋月',final:'秋月改二',type:'駆逐艦',speed:'高速',targetLv:85,path:'秋月 → 秋月改(Lv40) → 秋月改二(Lv85)',requirements:'Lv85＋改装設計図＋新型兵装資材×2＋戦闘詳報＋開発資材×30',roles:['防空','対空CI'],note:'防空駆逐艦。改二で4スロット化し、防空性能がさらに向上。'},
 {base:'初月',final:'初月改二',type:'駆逐艦',speed:'高速',targetLv:88,path:'初月 → 初月改(Lv40) → 初月改二(Lv88)',requirements:'Lv88＋改装設計図＋新型兵装資材×2＋戦闘詳報',roles:['防空','対空CI','4スロット'],note:'4スロットの防空駆逐艦で、対空以外にも柔軟に使える。'},
 {base:'Fletcher',final:'Fletcher Mk.II',type:'駆逐艦',speed:'高速',targetLv:90,path:'Fletcher → Fletcher改(Lv55) → Fletcher改 Mod.2(Lv88) ⇔ Fletcher Mk.II(Lv90)',requirements:'改: Lv55＋高速建造材×10＋開発資材×80 / Mod.2: Lv88＋改装設計図＋高速建造材×30＋開発資材×120 / Mk.II: Lv90＋高速建造材×30＋開発資材×180',roles:['対空CI','自動先制対潜','夜戦CI'],note:'対空・対潜・夜戦を高水準でこなす万能駆逐艦。'}
];

let hdShipDbType='すべて';
let hdShipDbMissingOnly=false;

function hdShipDbEsc(s){return typeof rosterEsc==='function'?rosterEsc(s):String(s??'')}
function hdShipDbRoster(){try{return JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]')||[]}catch{return []}}
function hdShipDbOwned(item){
 const rows=hdShipDbRoster().filter(x=>{const n=String(x.name||'').trim();return n===item.base||n===item.final||n.startsWith(item.base)});
 if(!rows.length)return null;
 return rows.sort((a,b)=>(Number(b.level)||0)-(Number(a.level)||0))[0];
}
function hdShipDbStatus(item){
 const own=hdShipDbOwned(item);if(!own)return {label:'未所持',cls:'missing',detail:''};
 const lv=Number(own.level)||0;
 if(String(own.name||'')===item.final)return {label:'改装済み',cls:'ready',detail:`${own.name}${lv?` Lv.${lv}`:''}`};
 if(lv>=item.targetLv)return {label:'Lv条件達成',cls:'ready',detail:`${own.name} Lv.${lv}`};
 return {label:'育成中',cls:'owned',detail:`${own.name}${lv?` Lv.${lv} / あと${Math.max(0,item.targetLv-lv)}Lv`:''}`};
}
function hdRenderShipDatabase(){
 const list=document.getElementById('hdShipDbList');if(!list)return;
 const q=(document.getElementById('hdShipDbSearch')?.value||'').trim().toLowerCase();
 let rows=HD_SHIP_DATABASE.filter(x=>(hdShipDbType==='すべて'||x.type===hdShipDbType)&&(!q||`${x.base} ${x.final} ${x.type} ${x.roles.join(' ')} ${x.note} ${x.path}`.toLowerCase().includes(q)));
 if(hdShipDbMissingOnly)rows=rows.filter(x=>!hdShipDbOwned(x));
 const count=document.getElementById('hdShipDbCount');if(count)count.textContent=`${rows.length}隻`;
 list.innerHTML=rows.map(x=>{const s=hdShipDbStatus(x);return `<article class="hd-shipdb-card"><div class="hd-shipdb-head"><div><strong>${hdShipDbEsc(x.final)}</strong><span>${hdShipDbEsc(x.type)}・${hdShipDbEsc(x.speed)}</span></div><div class="hd-shipdb-status ${s.cls}"><b>${s.label}</b>${s.detail?`<small>${hdShipDbEsc(s.detail)}</small>`:''}</div></div><div class="hd-shipdb-path">${hdShipDbEsc(x.path)}</div><div class="hd-shipdb-require"><span>改装条件</span><strong>${hdShipDbEsc(x.requirements)}</strong></div><div class="hd-shipdb-roles">${x.roles.map(r=>`<span>${hdShipDbEsc(r)}</span>`).join('')}</div><p>${hdShipDbEsc(x.note)}</p><div class="hd-shipdb-actions"><button class="primary small" type="button" data-hd-shipdb-add="${hdShipDbEsc(x.base)}">台帳へ追加</button><a class="guide-link" href="https://wikiwiki.jp/kancolle/${encodeURIComponent(x.final)}" target="_blank" rel="noopener">Wiki ↗</a></div></article>`}).join('')||'<div class="empty">条件に合う艦娘がいないよ</div>';
}
function hdEnsureShipDatabase(){
 if(document.getElementById('shipDatabase'))return;
 const roster=document.getElementById('roster');if(!roster)return;
 const sec=document.createElement('section');sec.id='shipDatabase';sec.className='advanced-section';
 const types=['すべて',...new Set(HD_SHIP_DATABASE.map(x=>x.type))];
 sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">SHIP DATABASE</div><h2>艦娘データベース・改装計画</h2></div><span id="hdShipDbCount" class="muted"></span></div><div class="hd-shipdb-note">主要艦の改装Lv・必要アイテム・役割を確認。艦隊台帳のLvと照合して「あと何Lv」「改装条件達成」も表示するよ。</div><div class="hd-shipdb-toolbar"><input id="hdShipDbSearch" type="search" placeholder="艦名・艦種・役割で検索"><label><input id="hdShipDbMissingOnly" type="checkbox"> 未所持だけ</label></div><div class="hd-shipdb-filters">${types.map((t,i)=>`<button class="ghost small${i===0?' active':''}" type="button" data-hd-shipdb-filter="${hdShipDbEsc(t)}">${hdShipDbEsc(t)}</button>`).join('')}</div><div id="hdShipDbList" class="hd-shipdb-list"></div><div><a class="guide-link" href="https://wikiwiki.jp/kancolle/%E6%94%B9%E9%80%A0/%E8%89%A6%E7%A8%AE%E5%88%A5%E4%B8%80%E8%A6%A7" target="_blank" rel="noopener">攻略Wiki 改造一覧で最新情報 ↗</a></div>`;
 roster.insertAdjacentElement('beforebegin',sec);
 document.getElementById('hdShipDbSearch').addEventListener('input',hdRenderShipDatabase);
 document.getElementById('hdShipDbMissingOnly').addEventListener('change',e=>{hdShipDbMissingOnly=e.target.checked;hdRenderShipDatabase()});
 hdRenderShipDatabase();
}
function hdShipDbAdd(base){
 const item=HD_SHIP_DATABASE.find(x=>x.base===base);if(!item)return;
 if(typeof openShipRosterDialog==='function')openShipRosterDialog();
 setTimeout(()=>{
  const name=document.getElementById('rosterName'),remodel=document.getElementById('rosterRemodel'),memo=document.getElementById('rosterMemo');
  if(name)name.value=item.base;if(remodel)remodel.value='育成中';if(memo) memo.value=`目標: ${item.final} / ${item.requirements}`;
 },0);
}
document.addEventListener('click',e=>{
 const f=e.target.closest?.('[data-hd-shipdb-filter]');if(f){hdShipDbType=f.dataset.hdShipdbFilter;document.querySelectorAll('[data-hd-shipdb-filter]').forEach(b=>b.classList.toggle('active',b===f));hdRenderShipDatabase();return}
 const add=e.target.closest?.('[data-hd-shipdb-add]');if(add){hdShipDbAdd(add.dataset.hdShipdbAdd);return}
});
window.addEventListener('load',()=>setTimeout(hdEnsureShipDatabase,300));setTimeout(hdEnsureShipDatabase,500);
