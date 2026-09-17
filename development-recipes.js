const HD_DEV_RECIPES=[
 {id:'air-all',category:'艦載機',title:'艦載機 万能レシピ',fuel:20,ammo:60,steel:10,bauxite:110,secretary:'空母系',hq:'20目安・高レアは30以上',targets:['流星改','試製烈風 後期型','彗星一二型甲','紫電改二','彩雲'],rates:'流星改 約2.2% / 試製烈風 約2.4% / 彗星一二型甲 約2.2% / 紫電改二 約2.3% / 彩雲 約4.0%',note:'多くのレア艦載機をまとめて狙う定番。観測機は開発条件が別。'},
 {id:'fighter',category:'艦載機',title:'艦戦狙い',fuel:20,ammo:20,steel:10,bauxite:90,secretary:'空母系',hq:'20目安・高レアは30以上',targets:['試製烈風 後期型','紫電改二','零式艦戦52型'],rates:'試製烈風 約2.4% / 紫電改二 約1.9%',note:'戦闘機を絞って狙う。ボーキ110で彩雲も候補に加わる。'},
 {id:'saiun',category:'艦載機',title:'彩雲狙い撃ち',fuel:20,ammo:10,steel:10,bauxite:110,secretary:'空母系',hq:'20目安・高レアは30以上',targets:['彩雲'],rates:'Wiki掲載の狙い撃ちレシピ',note:'失敗率はそこそこ高め。'},
 {id:'46gun',category:'主砲・砲弾',title:'46cm三連装砲狙い',fuel:10,ammo:251,steel:250,bauxite:10,secretary:'戦艦系（航空戦艦除く）/ 工作艦',hq:'20目安・高レアは30以上',targets:['46cm三連装砲','九一式徹甲弾'],rates:'46cm砲 約4.0% / 九一式徹甲弾 約2.0%',note:'15.5cm副砲・甲標的なども候補。弾薬300では46cm砲の報告率約5.1%。'},
 {id:'shell-mix',category:'主砲・砲弾',title:'砲・砲弾 複合',fuel:10,ammo:90,steel:90,bauxite:30,secretary:'戦艦 / 重巡 / 工作艦',hq:'20目安',targets:['九一式徹甲弾','三式弾','15.5cm三連装砲(主砲)','15.5cm三連装砲(副砲)'],rates:'三式弾 約5.2% / 九一式徹甲弾 約3.8%',note:'徹甲弾と三式弾をまとめて狙える。'},
 {id:'10cm',category:'主砲・砲弾',title:'10cm連装高角砲狙い',fuel:10,ammo:10,steel:30,bauxite:10,secretary:'駆逐 / 軽巡',hq:'20目安',targets:['10cm連装高角砲'],rates:'約9.6%（Wiki集計）',note:'機銃やドラム缶も候補。失敗率は高め。'},
 {id:'sonar',category:'対潜',title:'三式ソナー狙い',fuel:10,ammo:10,steel:10,bauxite:20,secretary:'水雷系',hq:'10目安・高レアは20以上',targets:['三式水中探信儀','九三式水中聴音機'],rates:'三式ソナー 約1.9% / 九三式ソナー 約5.1%',note:'回数を回しやすい定番。失敗率は約6割。'},
 {id:'depth',category:'対潜',title:'爆雷投射機狙い',fuel:10,ammo:30,steel:10,bauxite:10,secretary:'水雷系',hq:'10目安・高レアは20以上',targets:['三式爆雷投射機','九四式爆雷投射機'],rates:'三式 約2.3% / 九四式 約11.8%',note:'25mm機銃系列も候補。'},
 {id:'asw-mix',category:'対潜',title:'ソナー＋爆雷 複合',fuel:10,ammo:30,steel:10,bauxite:31,secretary:'水雷系',hq:'10目安・高レアは20以上',targets:['三式水中探信儀','九三式水中聴音機','三式爆雷投射機','九四式爆雷投射機'],rates:'三式ソナー 約2.2% / 九三ソナー 約5.8% / 三式投射機 約2.0% / 九四式投射機 約9.9%',note:'対潜装備をまとめて揃えたい時向け。'},
 {id:'radar-all',category:'電探',title:'電探 全種狙い',fuel:10,ammo:10,steel:250,bauxite:250,secretary:'空母系推奨',hq:'30目安・42号は40以上',targets:['33号対水上電探','32号対水上電探','42号対空電探'],rates:'33号 約2.2% / 32号 約2.1% / 42号 約2.1%',note:'空母系なら全種候補。戦艦/重巡/工作艦では22号に制限あり。'},
 {id:'radar-small',category:'電探',title:'小型電探狙い',fuel:10,ammo:10,steel:200,bauxite:150,secretary:'空母系 / 水雷系など',hq:'30目安',targets:['13号対空電探','22号対水上電探','33号対水上電探'],rates:'13号 約2.9% / 22号 約0.9% / 33号 約2.0%',note:'大型電探を外して小型電探に絞る。秘書艦タイプで候補が変わる。'},
 {id:'bulge',category:'バルジ',title:'増設バルジ狙い',fuel:10,ammo:10,steel:300,bauxite:10,secretary:'戦艦 / 重巡 / 工作艦',hq:'20以上',targets:['増設バルジ(中型艦)','増設バルジ(大型艦)'],rates:'中型 約4.4% / 大型 約1.8%',note:'鋼材120なら中型のみを狙える。'},
 {id:'engine',category:'機関',title:'缶・タービン狙い',fuel:100,ammo:10,steel:200,bauxite:10,secretary:'戦艦 / 空母系',hq:'10以上',targets:['強化型艦本式缶','改良型艦本式タービン'],rates:'強化缶 約2.9% / タービン 約4.2%',note:'高速化用。戦艦秘書では中型バルジも候補。'},
 {id:'drum',category:'輸送',title:'ドラム缶 最低値',fuel:10,ammo:10,steel:10,bauxite:10,secretary:'水雷系 / 潜水系',hq:'低Lvから可',targets:['ドラム缶(輸送用)'],rates:'約4.0%',note:'デイリー開発にも使いやすい最低値。週任務「資源の再利用」でも入手可能。'},
 {id:'land-bomber',category:'基地航空隊',title:'九六式陸攻 最低値',fuel:240,ammo:260,steel:10,bauxite:250,secretary:'空母系のみ',hq:'10以上',targets:['九六式陸攻'],rates:'約6.8〜8.3%（集計条件により差）',note:'艦載機も一通り候補。開発資源は重め。'}
];

let hdDevCategory='すべて';
let hdDevMissingOnly=false;

function hdDevEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdDevOwnedMap(){
 const rows=(()=>{try{return JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]')}catch{return []}})();
 const map=new Map();for(const x of rows){const name=String(x.name||'').trim();if(!name)continue;map.set(name,(map.get(name)||0)+(Number(x.count)||0))}return map;
}
function hdDevRecipeText(r){return `${r.fuel}/${r.ammo}/${r.steel}/${r.bauxite}`}
function hdDevTargetHtml(name,owned){
 const n=owned.get(name)||0;return `<button class="hd-dev-target ${n>0?'owned':'missing'}" type="button" data-hd-dev-equip="${hdDevEsc(name)}">${hdDevEsc(name)} <small>${n>0?`所持${n}`:'未所持'}</small></button>`;
}
function hdRenderDevelopment(){
 const list=document.getElementById('hdDevelopmentList');if(!list)return;
 const q=(document.getElementById('hdDevelopmentSearch')?.value||'').trim().toLowerCase();
 const owned=hdDevOwnedMap();
 let rows=HD_DEV_RECIPES.filter(r=>(hdDevCategory==='すべて'||r.category===hdDevCategory)&&(!q||`${r.title} ${r.category} ${r.secretary} ${r.targets.join(' ')} ${r.note}`.toLowerCase().includes(q)));
 if(hdDevMissingOnly)rows=rows.filter(r=>r.targets.some(t=>(owned.get(t)||0)<=0));
 const count=document.getElementById('hdDevelopmentCount');if(count)count.textContent=`${rows.length}件`;
 list.innerHTML=rows.map(r=>`<article class="hd-dev-card"><div class="hd-dev-head"><div><strong>${hdDevEsc(r.title)}</strong><span>${hdDevEsc(r.category)}</span></div><button class="primary small" type="button" data-hd-dev-copy="${r.id}">資材をコピー</button></div><div class="hd-dev-recipe"><span>燃 <b>${r.fuel}</b></span><span>弾 <b>${r.ammo}</b></span><span>鋼 <b>${r.steel}</b></span><span>ボ <b>${r.bauxite}</b></span></div><div class="hd-dev-meta"><div><span>秘書艦</span><strong>${hdDevEsc(r.secretary)}</strong></div><div><span>司令部Lv</span><strong>${hdDevEsc(r.hq)}</strong></div></div><div class="hd-dev-targets">${r.targets.map(t=>hdDevTargetHtml(t,owned)).join('')}</div><p>${hdDevEsc(r.note)}</p><div class="hd-dev-rate">目安: ${hdDevEsc(r.rates)}</div></article>`).join('')||'<div class="empty">条件に合う開発レシピがないよ</div>';
}
function hdEnsureDevelopment(){
 if(document.getElementById('developmentLab'))return;
 const book=document.getElementById('equipmentBook');if(!book)return;
 const sec=document.createElement('section');sec.id='developmentLab';sec.className='advanced-section';
 const cats=['すべて',...new Set(HD_DEV_RECIPES.map(x=>x.category))];
 sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">DEVELOPMENT LAB</div><h2>装備開発レシピ</h2></div><span id="hdDevelopmentCount" class="muted"></span></div><div class="hd-dev-warning">開発レシピは成功を保証しないよ。秘書艦・司令部Lv・資材テーブルなどで候補が変わるため、ここでは現行Wikiの代表レシピを要約して表示。</div><div class="hd-dev-toolbar"><input id="hdDevelopmentSearch" type="search" placeholder="装備名・カテゴリ・秘書艦で検索"><label class="hd-dev-check"><input id="hdDevMissingOnly" type="checkbox"> 未所持を含むレシピだけ</label></div><div id="hdDevelopmentFilters" class="hd-dev-filters">${cats.map(c=>`<button class="ghost small${c==='すべて'?' active':''}" type="button" data-hd-dev-filter="${hdDevEsc(c)}">${hdDevEsc(c)}</button>`).join('')}</div><div id="hdDevelopmentList" class="hd-dev-list"></div><div class="hd-dev-source"><a class="guide-link" href="https://wikiwiki.jp/kancolle/%E9%96%8B%E7%99%BA%E3%83%AC%E3%82%B7%E3%83%94" target="_blank" rel="noopener">攻略Wiki 開発レシピで最新情報 ↗</a></div>`;
 book.parentNode.insertBefore(sec,book);
 document.getElementById('hdDevelopmentSearch').addEventListener('input',hdRenderDevelopment);
 document.getElementById('hdDevMissingOnly').addEventListener('change',e=>{hdDevMissingOnly=e.target.checked;hdRenderDevelopment()});
 hdRenderDevelopment();
}
async function hdDevCopy(r){
 const text=`${r.fuel}/${r.ammo}/${r.steel}/${r.bauxite}`;
 try{await navigator.clipboard.writeText(text);alert(`${r.title}\n${text}\nをコピーしたよ`)}catch{prompt('この資材配分をコピーしてね',text)}
}
document.addEventListener('click',e=>{
 const f=e.target.closest?.('[data-hd-dev-filter]');if(f){hdDevCategory=f.dataset.hdDevFilter;document.querySelectorAll('[data-hd-dev-filter]').forEach(b=>b.classList.toggle('active',b===f));hdRenderDevelopment();return}
 const c=e.target.closest?.('[data-hd-dev-copy]');if(c){const r=HD_DEV_RECIPES.find(x=>x.id===c.dataset.hdDevCopy);if(r)hdDevCopy(r);return}
 const eq=e.target.closest?.('[data-hd-dev-equip]');if(eq){const name=eq.dataset.hdDevEquip;if(typeof hdOpenEquipmentDb==='function')hdOpenEquipmentDb(name);else document.getElementById('equipmentBook')?.scrollIntoView({behavior:'smooth'});}
});
window.addEventListener('load',()=>setTimeout(hdEnsureDevelopment,180));
setTimeout(hdEnsureDevelopment,500);
