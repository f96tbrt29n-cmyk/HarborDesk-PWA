const HD_EXP_STAT_RULES={
 '41':{firepower:60,aa:80,asw:210},
 '43':{firepower:500,aa:280,asw:280,los:170},
 '44':{aa:200,asw:200,los:150},
 '45':{aa:240,asw:300,los:180},
 '46':{firepower:350,aa:250,asw:220,los:190}
};
const HD_EXP_STAT_LABELS={firepower:'火力',aa:'対空',asw:'対潜',los:'索敵'};
const HD_EXP_FLAG_RULES={
 '24':['軽巡洋艦'],
 '43':['護衛空母','軽空母'],
 '45':['護衛空母','軽空母']
};

function hdEFStatValue(v){return v===''||v==null?null:Math.max(0,Number(v)||0)}
function hdEFStatCount(ships,type){return ships.filter(s=>s.type===type).length}
function hdEFStatDDDE(ships){return ships.filter(s=>s.type==='駆逐艦'||s.type==='海防艦').length}
function hdEFStatFormation(expId,ships){
 const dd=hdEFStatCount(ships,'駆逐艦'),de=hdEFStatCount(ships,'海防艦'),light=hdEFStatCount(ships,'軽巡洋艦'),train=hdEFStatCount(ships,'練習巡洋艦'),escort=hdEFStatCount(ships,'護衛空母'),lightCarrier=hdEFStatCount(ships,'軽空母'),water=hdEFStatCount(ships,'水上機母艦');
 const flag=ships[0]?.type||'';
 if(expId==='42'){
  const ok=(light>=1&&dd>=2)||(dd>=1&&de>=3)||(light>=1&&de>=2)||(escort>=1&&dd>=2)||(escort>=1&&de>=2)||(train>=1&&de>=2);
  return {ok,detail:ok?'船団護衛の有効編成パターンを確認':'軽1＋駆2、または海防艦/護衛空母/練巡を使う有効パターンが必要'};
 }
 if(expId==='43'){
  const escortPattern=flag==='護衛空母'&&(dd>=2||de>=2);
  const lightCarrierPattern=flag==='軽空母'&&((light>=1&&dd>=4)||(dd>=1&&de>=3)||(light>=1&&de>=2)||(train>=1&&de>=2)||(escort>=1&&dd>=2)||(escort>=1&&de>=2));
  const ok=ships.length===6&&(escortPattern||lightCarrierPattern);
  return {ok,detail:ok?'旗艦・護衛編成パターンを確認':'護衛空母旗艦＋駆2/海防2、または軽空母旗艦の有効護衛編成が必要'};
 }
 if(expId==='44'){
  const carrierNonWater=ships.filter(s=>['正規空母','装甲空母','軽空母','護衛空母'].includes(s.type)).length;
  const carrierAndWaterOk=water>=1&&(carrierNonWater>=1||water>=2);
  const ok=ships.length===6&&carrierAndWaterOk&&light>=1&&hdEFStatDDDE(ships)>=2;
  return {ok,detail:ok?'空母枠＋水母枠を別々に確保':'空母(水母/護母可)1＋水母1＋軽1＋(駆/海防)2＋他1が必要'};
 }
 if(expId==='45'){
  const ok=ships.length>=5&&['護衛空母','軽空母'].includes(flag)&&hdEFStatDDDE(ships)>=4;
  return {ok,detail:ok?'旗艦＋護衛艦4隻を確認':'護衛空母/軽空母を旗艦にして(駆/海防)4隻が必要'};
 }
 return null;
}

function hdEFStatsEnsureDialog(){
 if(typeof hdEFEnsureDialog!=='function')return;
 hdEFEnsureDialog();
 const rows=document.getElementById('hdEFRows');if(!rows||rows.dataset.hdStatsReady)return;
 rows.dataset.hdStatsReady='1';
 [...rows.querySelectorAll('.hd-ef-editrow')].forEach((row,i)=>{
  const stats=document.createElement('div');stats.className='hd-ef-statrow';
  stats.innerHTML=`<span>装備込み</span><label>火<input data-hd-ef-firepower="${i}" type="number" min="0" max="999" inputmode="numeric" placeholder="-"></label><label>対空<input data-hd-ef-aa="${i}" type="number" min="0" max="999" inputmode="numeric" placeholder="-"></label><label>対潜<input data-hd-ef-asw="${i}" type="number" min="0" max="999" inputmode="numeric" placeholder="-"></label><label>索敵<input data-hd-ef-los="${i}" type="number" min="0" max="999" inputmode="numeric" placeholder="-"></label>`;
  row.insertAdjacentElement('afterend',stats);
 });
 const note=document.querySelector('#hdExpFleetDialog .hd-ef-editnote');if(note)note.textContent='ドラム缶・キラに加えて、火力/対空/対潜/索敵はゲーム画面の「装備込み表示値」を入力。特殊遠征は6隻分を合計して自動判定するよ。';
 const form=document.getElementById('hdExpFleetForm');
 if(form&&!form.dataset.hdStatsSubmit){form.dataset.hdStatsSubmit='1';form.addEventListener('submit',e=>{
   if(e.submitter?.value==='cancel')return;
   const all=hdEFFleets(),fleet=all[hdExpFleetEditNo];if(!fleet)return;
   fleet.ships=(fleet.ships||[]).map((s,i)=>({...s,
    firepower:hdEFStatValue(document.querySelector(`[data-hd-ef-firepower="${i}"]`)?.value),
    aa:hdEFStatValue(document.querySelector(`[data-hd-ef-aa="${i}"]`)?.value),
    asw:hdEFStatValue(document.querySelector(`[data-hd-ef-asw="${i}"]`)?.value),
    los:hdEFStatValue(document.querySelector(`[data-hd-ef-los="${i}"]`)?.value)
   }));
   hdEFSave(HD_EXP_FLEET_KEY,all);setTimeout(hdEFRender,0);
  });}
}

function hdEFStatsPopulate(no){
 hdEFStatsEnsureDialog();const fleet=hdEFFleets()[no];
 Array.from({length:6},(_,i)=>{const s=fleet?.ships?.[i]||{};for(const [field,attr] of [['firepower','firepower'],['aa','aa'],['asw','asw'],['los','los']]){const el=document.querySelector(`[data-hd-ef-${attr}="${i}"]`);if(el)el.value=s[field]??''}});
}

function hdEFStatsInstall(){
 if(typeof hdEFCheck!=='function'||window.__hdEFStatsInstalled)return false;window.__hdEFStatsInstalled=true;
 const baseCheck=hdEFCheck;
 hdEFCheck=function(no,exp){
  const c=baseCheck(no,exp),id=String(exp.id),ships=c.ships||[];
  if(['42','43','44','45'].includes(id)){
   c.checks=c.checks.filter(x=>!String(x.label).startsWith('艦種 '));
   c.hard=c.hard.filter(x=>!String(x).startsWith('艦種 '));
   const f=hdEFStatFormation(id,ships);if(f){c.checks.push({label:'編成条件',ok:f.ok,detail:f.detail,manual:false});if(!f.ok)c.hard.push('編成条件')}
  }
  const flagAllowed=HD_EXP_FLAG_RULES[id];if(flagAllowed){const ft=ships[0]?.type||'',ok=flagAllowed.includes(ft);c.checks.push({label:'旗艦艦種',ok,detail:ok?`${ft}を旗艦に設定`:`必要: ${flagAllowed.join(' / ')}旗艦`,manual:false});if(!ok)c.hard.push('旗艦艦種')}
  const rule=HD_EXP_STAT_RULES[id];
  if(rule){
   c.checks=c.checks.filter(x=>x.label!=='艦隊ステータス');
   for(const [key,need] of Object.entries(rule)){
    const vals=ships.map(s=>s[key]),complete=ships.length>0&&vals.every(v=>v!==null&&v!==undefined&&v!==''),sum=vals.reduce((a,v)=>a+(Number(v)||0),0),ok=complete&&sum>=need,label=HD_EXP_STAT_LABELS[key];
    c.checks.push({label:`合計${label}`,ok,detail:complete?`${sum} / 必要${need}`:`${sum} / 必要${need}（未入力あり）`,manual:false});if(!ok)c.hard.push(`合計${label}`);
   }
  }
  const flagLv=Number(ships[0]?.level)||0,kira=c.kira||0;
  if(id==='41')c.big={ok:(flagLv>=33&&kira>=5)||(flagLv>=128&&kira>=4),label:`旗艦Lv${flagLv} / キラ${kira}隻`,need:'旗艦Lv33＋キラ5隻、または旗艦Lv128＋キラ4隻'};
  if(['43','45','46'].includes(id))c.big={ok:kira>=5||(flagLv>=128&&kira>=4),label:`旗艦Lv${flagLv} / キラ${kira}隻`,need:'キラ5隻、または旗艦Lv128＋キラ4隻'};
  c.hard=[...new Set(c.hard)];c.canStart=c.hard.length===0;return c;
 };
 const baseOpen=hdEFOpenDialog;hdEFOpenDialog=function(no){hdEFStatsEnsureDialog();baseOpen(no);hdEFStatsPopulate(no)};
 const baseRender=hdEFRender;hdEFRender=function(){baseRender();const note=document.querySelector('#hdExpFleetBoard .hd-ef-note');if(note)note.textContent='※41/43/44/45/46は装備込みの火力・対空・対潜・索敵を自動判定。艦載機補正があるため、ゲーム画面で確認した各艦の表示値を入力してね。'};
 hdEFStatsEnsureDialog();hdEFRender();return true;
}
window.addEventListener('load',()=>setTimeout(()=>{if(!hdEFStatsInstall())setTimeout(hdEFStatsInstall,500)},700));
setTimeout(()=>{if(typeof hdEFCheck==='function')hdEFStatsInstall()},900);
