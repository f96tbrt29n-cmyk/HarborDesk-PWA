const HD_STABILITY_VERSION='1.0.54';

function hdStabLoad(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
function hdStabEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdStabRoster(){return hdStabLoad('harbordesk-ship-roster-v1',[])}
function hdStabProfiles(){return hdStabLoad('harbordesk-ship-profiles-v1',{})}
function hdStabProfileForName(name){const n=String(name||'').trim(),r=hdStabRoster().find(x=>String(x.name||'').trim()===n);return r?{roster:r,profile:hdStabProfiles()[r.id]||{}}:null}

function hdStabInstallProfileIntegration(){
 if(window.__hdStabProfileInstalled)return true;
 if(typeof window.hdEFInferType!=='function'||typeof window.hdSPInferType!=='function')return false;
 const expBase=window.hdEFInferType,supportBase=window.hdSPInferType;
 window.hdEFInferType=function(name){const x=hdStabProfileForName(name);return x?.profile?.type||expBase(name)};
 window.hdSPInferType=function(name){const x=hdStabProfileForName(name);return x?.profile?.type||supportBase(name)};
 document.addEventListener('change',e=>{
   const exp=e.target.closest?.('[data-hd-ef-name]');
   if(exp){const i=Number(exp.dataset.hdEfName),x=hdStabProfileForName(exp.value);if(x){const type=document.querySelector(`[data-hd-ef-type="${i}"]`),lv=document.querySelector(`[data-hd-ef-lv="${i}"]`),asw=document.querySelector(`[data-hd-ef-asw="${i}"]`),los=document.querySelector(`[data-hd-ef-los="${i}"]`);if(type&&x.profile.type)type.value=x.profile.type;if(lv&&x.roster.level)lv.value=Number(x.roster.level)||lv.value;if(asw&&x.profile.asw&&!asw.value)asw.value=Number(x.profile.asw)||'';if(los&&x.profile.los&&!los.value)los.value=Number(x.profile.los)||''}return}
   const sp=e.target.closest?.('[data-hd-sp-name]');
   if(sp){const kind=sp.dataset.hdSpName,i=Number(sp.dataset.i),x=hdStabProfileForName(sp.value);if(x){const type=document.querySelector(`[data-hd-sp-type="${kind}"][data-i="${i}"]`),lv=document.querySelector(`[data-hd-sp-lv="${kind}"][data-i="${i}"]`);if(type&&x.profile.type)type.value=x.profile.type;if(lv&&x.roster.level)lv.value=Number(x.roster.level)||lv.value}}
 });
 window.__hdStabProfileInstalled=true;return true;
}

function hdStabInstallEventOpsFixes(){
 if(window.__hdStabEventInstalled)return true;
 if(typeof window.hdEOpsRosterOptions!=='function'||typeof window.hdEOpsLedger!=='function')return false;
 const optionsBase=window.hdEOpsRosterOptions,ledgerBase=window.hdEOpsLedger;
 window.hdEOpsRosterOptions=function(selected=''){
   const rows=hdStabRoster(),html=optionsBase(selected);if(selected&&!rows.some(x=>x.name===selected))return `<option value="${hdStabEsc(selected)}" selected>${hdStabEsc(selected)}（台帳未登録）</option>${html}`;return html;
 };
 window.hdEOpsLedger=function(){const raw=ledgerBase(),m=new Map();for(const x of raw){const name=String(x.name||'').trim();if(!name)continue;const cur=m.get(name)||{...x,name,count:0,star:0};cur.count+=(Number(x.count)||0);cur.star=Math.max(Number(cur.star)||0,Number(x.star)||0);m.set(name,cur)}return [...m.values()].sort((a,b)=>String(a.name).localeCompare(String(b.name),'ja'))};
 document.addEventListener('click',e=>{
   if(e.target.closest?.('[data-go-support]')){const el=document.getElementById('hdSupportPlanner');if(el){el.scrollIntoView({behavior:'smooth',block:'start'})}else{const p=typeof hdEOpsCurrent==='function'?hdEOpsCurrent():null;alert(p&&/^E/i.test(String(p.area||''))?'イベント作戦の支援は作戦室の「道中支援/決戦支援」で管理中。通常海域の支援艦隊プランナーは5-x海域を開くと表示されるよ。':'5-x海域の「自分用」タブを開くと支援艦隊プランナーが表示されるよ。')} }
   if(e.target.closest?.('[data-go-base]')){const el=document.getElementById('hdLandBasePlanner');if(el){el.scrollIntoView({behavior:'smooth',block:'start'})}else{alert('基地航空隊を使える通常海域の「装備」タブを開くと基地航空隊プランナーが表示されるよ。イベント分は作戦室の基地航空隊メモに残してね。')}}
 },true);
 window.__hdStabEventInstalled=true;return true;
}

function hdStabInstallReadinessIntegration(){
 if(window.__hdStabReadyInstalled)return true;
 if(typeof window.hdSortieAutoChecks!=='function')return false;
 const base=window.hdSortieAutoChecks;
 window.hdSortieAutoChecks=function(map,fleet){
   const out=base(map,fleet);
   try{
     if(typeof hdLBMapInfo==='function'&&typeof hdLBState==='function'&&typeof hdLBActionRadius==='function'){
       const info=hdLBMapInfo(map);if(info?.available){const s=hdLBState(map),limit=Math.max(1,Number(info.sorties)||1),sortie=(s.corps||[]).filter(x=>x.mode==='sortie');let ok=sortie.length>0&&sortie.length<=limit,detail=`出撃設定 ${sortie.length}/${limit}部隊`;
         if(sortie.length){const radius=sortie.map((c,i)=>{const r=hdLBActionRadius(c),target=Math.max(0,Number(c.targetRadius)||Number(info.bossRadius)||0),reach=r.radius!=null&&(!target||r.radius>=target);if(!reach)ok=false;return `第${(s.corps||[]).indexOf(c)+1}:${r.radius??'?'}${target?`/${target}`:''}${reach?'✓':'!'}`});detail+=`・半径 ${radius.join(' ')}`}
         out.checks.push({label:'基地航空隊プラン',state:ok?'ok':sortie.length?'warn':'note',detail:sortie.length?detail:'出撃航空隊が未設定'});
       }
     }
   }catch{}
   try{
     const all=hdStabLoad('harbordesk-fleet-calculator-v1',{}),key=`${map}:${fleet?.id||''}`,s=all[key];if(s&&typeof hdFCLOS==='function'&&typeof hdFCAirPower==='function'){
       const los=hdFCLOS(s);out.checks.push({label:'33式索敵メモ',state:'note',detail:`保存計算 ${Number(los.score).toFixed(2)}（係数${los.coef}）・分岐条件はルート別に最終確認`});
       const air=hdFCAirPower(s),enemy=Number(s.enemyAir)||0;if(enemy>0&&typeof hdFCAirStatus==='function'){const st=hdFCAirStatus(air,enemy),good=['secure','superior'].includes(st.cls);out.checks.push({label:'制空計算メモ',state:good?'ok':'note',detail:`自軍${air} / 敵${enemy} → ${st.label}`})}else if(air>0)out.checks.push({label:'制空計算メモ',state:'note',detail:`自軍制空 ${air}・敵制空値は未設定`});
     }
   }catch{}
   return out;
 };
 window.__hdStabReadyInstalled=true;return true;
}

function hdStabInstallAuditIntegration(){
 if(window.__hdStabAuditInstalled)return true;
 if(typeof window.hdDOAuditIssues!=='function')return false;
 const base=window.hdDOAuditIssues;
 window.hdDOAuditIssues=function(){const issues=base();const status=window.HD_MODULE_STATUS||{};for(const [src,state] of Object.entries(status))if(state==='error')issues.unshift({level:'warn',text:`追加モジュールの読込失敗: ${src}`});const variants=hdStabLoad('harbordesk-equipment-variants-v1',{}),ledger=hdStabLoad('harbordesk-equipment-v1',[]),totals={};for(const x of ledger){const n=String(x.name||'').trim();if(n)totals[n]=(totals[n]||0)+(Number(x.count)||0)}for(const [name,row] of Object.entries(variants)){const v=Object.values(row||{}).reduce((a,n)=>a+(Number(n)||0),0);if(totals[name]!=null&&v!==totals[name])issues.push({level:'info',text:`★別在庫 ${name}: ★別合計${v} / 台帳合計${totals[name]}`})}return issues};
 window.__hdStabAuditInstalled=true;return true;
}

function hdStabInstall(){const jobs=[hdStabInstallProfileIntegration,hdStabInstallEventOpsFixes,hdStabInstallReadinessIntegration,hdStabInstallAuditIntegration];let pending=0;for(const fn of jobs)if(!fn())pending++;try{if(typeof hdRenderSortieReadiness==='function')hdRenderSortieReadiness();if(typeof hdVariantRender==='function')hdVariantRender();if(typeof hdDOAuditRender==='function')hdDOAuditRender()}catch{}return pending===0}
window.hdStabInstall=hdStabInstall;
window.addEventListener('hd:modules-ready',()=>setTimeout(hdStabInstall,0));
window.addEventListener('load',()=>setTimeout(()=>{if(!hdStabInstall())setTimeout(hdStabInstall,1000)},1900));
setTimeout(()=>{if(!hdStabInstall())setTimeout(hdStabInstall,1200)},2400);
