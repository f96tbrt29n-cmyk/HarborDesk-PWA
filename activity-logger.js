const HD_ACTIVITY_LOG_KEY='harbordesk-activity-log-v1';

const HD_ACTIVITY_ACTIONS=[
 {id:'sortie',group:'出撃',icon:'🚢',label:'出撃開始 +1',note:'あ号「出撃」',targets:[['Bw1',0]]},
 {id:'battle',group:'出撃',icon:'⚔️',label:'戦闘（勝利以外）+1',note:'敗北・撤退前など。勝利/S勝利ボタンとは重ねて押さない',targets:[['Bd2',0],['Bd3',0]]},
 {id:'win',group:'出撃',icon:'🏆',label:'戦闘勝利 +1',note:'通常勝利＋戦闘として記録',targets:[['Bd1',0],['Bd2',0],['Bd3',0]]},
 {id:'swin',group:'出撃',icon:'✨',label:'S勝利 +1',note:'勝利・戦闘・あ号S勝利',targets:[['Bd1',0],['Bd2',0],['Bd3',0],['Bw1',1]]},
 {id:'boss-arrive',group:'出撃',icon:'📍',label:'ボス到達 +1',note:'あ号「ボス到達」',targets:[['Bw1',2]]},
 {id:'boss-win',group:'出撃',icon:'👑',label:'ボス勝利 +1',note:'ボス到達＋ボス勝利をまとめて記録',targets:[['Bw1',2],['Bw1',3]]},
 {id:'southwest-boss',group:'撃沈・海域',icon:'🌊',label:'南西ボス勝利 +1',note:'2-1〜2-5のボスB勝利以上',targets:[['Bd7',0]]},
 {id:'carrier-kill',group:'撃沈・海域',icon:'✈️',label:'空母撃沈 +1',note:'敵空母/軽空母',targets:[['Bd4',0],['Bw2',0]]},
 {id:'transport-kill',group:'撃沈・海域',icon:'📦',label:'補給艦撃沈 +1',note:'デイリー/ウィークリー輸送艦系',targets:[['Bd5',0],['Bd6',0],['Bw3',0],['Bw4',0]]},
 {id:'sub-kill',group:'撃沈・海域',icon:'🌐',label:'潜水艦撃沈 +1',note:'潜水艦撃沈系',targets:[['Bd8',0],['Bw5',0]]},
 {id:'exp-success',group:'遠征',icon:'⏱️',label:'遠征成功 +1',note:'一般遠征成功',targets:[['Dd1',0],['Dd2',0],['Dw1',0]]},
 {id:'tokyo-success',group:'遠征',icon:'🚚',label:'東京急行系成功 +1',note:'一般遠征＋東急系週任務',targets:[['Dd1',0],['Dd2',0],['Dw1',0],['Dw2',0]]},
 {id:'escort-success',group:'遠征',icon:'🛡️',label:'海上護衛任務成功 +1',note:'遠征05＋月次護衛',targets:[['Dd1',0],['Dd2',0],['Dw1',0],['Dm1',0]]},
 {id:'develop',group:'工廠',icon:'🧪',label:'開発 +1',note:'開発回数',targets:[['Fd1',0],['Fd3',0]]},
 {id:'build',group:'工廠',icon:'🏗️',label:'建造 +1',note:'建造回数',targets:[['Fd2',0],['Fd4',0]]},
 {id:'dismantle',group:'工廠',icon:'🔧',label:'艦娘解体 +1隻',note:'軍縮条約対応',targets:[['Fd5',0]]},
 {id:'improve',group:'工廠',icon:'⭐',label:'装備改修 +1',note:'改修任務。受注中だけ反映',targets:[['Fd6',0],['Fd9',0]]},
 {id:'discard-op',group:'工廠',icon:'🗑️',label:'廃棄操作 +1',note:'まとめて廃棄は1操作',targets:[['Fw1',0]]},
 {id:'smallgun-discard',group:'工廠',icon:'🔩',label:'小口径主砲廃棄 +1個',note:'装備開発力の整備',targets:[['Fd7',0]]},
 {id:'mg-discard',group:'工廠',icon:'🔫',label:'機銃廃棄 +1個',note:'デイリー/ウィークリー機銃廃棄',targets:[['Fd8',0],['Fw2',0]]}
];

let hdALGroup='すべて';
function hdALEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdALLoad(){try{return JSON.parse(localStorage.getItem(HD_ACTIVITY_LOG_KEY)||'[]')||[]}catch{return []}}
function hdALSave(rows){localStorage.setItem(HD_ACTIVITY_LOG_KEY,JSON.stringify(rows.slice(0,100)))}
function hdALQuest(id){try{return typeof HD_QUESTS!=='undefined'?HD_QUESTS.find(q=>q.id===id):null}catch{return null}}
function hdALIsAccepted(q){try{return typeof hdQuestAcceptedInChecklist==='function'?hdQuestAcceptedInChecklist(q):(typeof state!=='undefined'&&(state.quests||[]).some(x=>!x.done&&(x.sourceId===q.id||x.name===q.name||x.name===`[${HD_QUEST_CYCLE_LABEL[q.cycle]}] ${q.name}`)))}catch{return false}}
function hdALStore(){try{return typeof hdQPStore==='function'?hdQPStore():JSON.parse(localStorage.getItem('harbordesk-quest-progress-v1')||'{}')||{}}catch{return {}}}
function hdALSaveStore(v){try{if(typeof hdQPSave==='function')hdQPSave(v);else localStorage.setItem('harbordesk-quest-progress-v1',JSON.stringify(v))}catch{}}
function hdALPeriodKey(q){try{return typeof hdQPPeriodKey==='function'?hdQPPeriodKey(q):''}catch{return ''}}
function hdALGoals(q){try{return typeof hdQPGoals==='function'?hdQPGoals(q):[]}catch{return []}}
function hdALApplyTarget(store,id,index,delta){
 const q=hdALQuest(id);if(!q||delta<=0||!hdALIsAccepted(q))return null;const goals=hdALGoals(q),goal=goals[index];if(!goal)return null;const key=hdALPeriodKey(q);let row=store[id];if(!row||row.periodKey!==key)row={periodKey:key,values:Array(goals.length).fill(0)};row.values=row.values||Array(goals.length).fill(0);while(row.values.length<goals.length)row.values.push(0);const before=Number(row.values[index])||0,max=Number(goal[1])||9999,after=Math.min(max,before+delta),actual=after-before;if(actual<=0)return null;row.values[index]=after;row.updatedAt=Date.now();store[id]=row;return {id,index,periodKey:key,delta:actual,label:goal[0]};
}
function hdALRecord(actionId){
 const action=HD_ACTIVITY_ACTIONS.find(x=>x.id===actionId);if(!action)return;const store=hdALStore(),changes=[];for(const [id,index] of action.targets){const c=hdALApplyTarget(store,id,index,1);if(c)changes.push(c)}hdALSaveStore(store);const rows=hdALLoad();rows.unshift({id:crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2),at:Date.now(),actionId,label:action.label,changes,undone:false});hdALSave(rows);hdALRender();try{if(typeof hdRenderQuestDb==='function')hdRenderQuestDb();if(typeof hdCCRender==='function')hdCCRender()}catch{}
}
function hdALUndo(logId){
 const rows=hdALLoad(),log=rows.find(x=>x.id===logId);if(!log||log.undone)return;const store=hdALStore();for(const c of log.changes||[]){const row=store[c.id];if(!row||row.periodKey!==c.periodKey)continue;row.values=row.values||[];row.values[c.index]=Math.max(0,(Number(row.values[c.index])||0)-(Number(c.delta)||0));row.updatedAt=Date.now();store[c.id]=row}hdALSaveStore(store);log.undone=true;log.undoneAt=Date.now();hdALSave(rows);hdALRender();try{if(typeof hdRenderQuestDb==='function')hdRenderQuestDb();if(typeof hdCCRender==='function')hdCCRender()}catch{}
}
function hdALAcceptedCount(action){return action.targets.reduce((n,[id])=>{const q=hdALQuest(id);return n+(q&&hdALIsAccepted(q)?1:0)},0)}
function hdALRender(){
 const host=document.getElementById('hdActivityLogger');if(!host)return;const groups=['すべて',...new Set(HD_ACTIVITY_ACTIONS.map(x=>x.group))],actions=HD_ACTIVITY_ACTIONS.filter(x=>hdALGroup==='すべて'||x.group===hdALGroup),logs=hdALLoad().slice(0,12);
 host.innerHTML=`<div class="section-head"><div><div class="eyebrow">ONE-TAP LOG</div><h2>任務連動・活動ログ</h2></div><span class="muted">受注中だけ自動反映</span></div><div class="hd-al-note">ゲーム側の任務受注状態は取得できないため、<b>任務DBからチェックリストに追加した未完了任務だけ</b>進捗へ反映するよ。任務の出現前・未受注状態で先にカウントしてしまうのを防ぐ仕組み。</div><div class="hd-al-toolbar">${groups.map(g=>`<button type="button" class="ghost small${g===hdALGroup?' active':''}" data-hd-al-group="${hdALEsc(g)}">${hdALEsc(g)}</button>`).join('')}<button type="button" class="ghost small" data-hd-al-quests>受注任務を管理</button></div><div class="hd-al-grid">${actions.map(a=>{const n=hdALAcceptedCount(a);return `<button type="button" class="hd-al-action" data-hd-al-action="${a.id}"><span class="hd-al-icon">${a.icon}</span><span><b>${hdALEsc(a.label)}</b><small>${hdALEsc(a.note)}</small></span><em>${n?`反映 ${n}件`:'記録のみ'}</em></button>`}).join('')}</div><div class="hd-al-history"><div class="hd-al-history-head"><strong>直近の活動</strong><span>${logs.length}件</span></div>${logs.length?logs.map(x=>`<div class="hd-al-log${x.undone?' undone':''}"><div><b>${hdALEsc(x.label)}</b><small>${new Date(x.at).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})}・${x.changes?.length?`任務 ${x.changes.length}件反映`:'任務反映なし'}${x.undone?'・取消済み':''}</small></div><button type="button" class="ghost small" data-hd-al-undo="${x.id}" ${x.undone?'disabled':''}>1手戻す</button></div>`).join(''):'<div class="empty">まだ活動ログはないよ</div>'}</div>`;
}
function hdALEnsure(){if(document.getElementById('activityLogger'))return;const anchor=document.getElementById('exerciseRoutine')||document.getElementById('questDatabase')||document.getElementById('quests');if(!anchor)return;const sec=document.createElement('section');sec.id='activityLogger';sec.className='advanced-section hd-al-section';sec.innerHTML='<div id="hdActivityLogger"></div>';anchor.insertAdjacentElement('beforebegin',sec);hdALRender()}

document.addEventListener('click',e=>{const g=e.target.closest?.('[data-hd-al-group]');if(g){hdALGroup=g.dataset.hdAlGroup;hdALRender();return}const a=e.target.closest?.('[data-hd-al-action]');if(a){hdALRecord(a.dataset.hdAlAction);return}const u=e.target.closest?.('[data-hd-al-undo]');if(u){hdALUndo(u.dataset.hdAlUndo);return}if(e.target.closest?.('[data-hd-al-quests]')){if(typeof hdWSApply==='function'){hdWSApply('quest','questDatabase',{scrollTop:true});setTimeout(()=>document.getElementById('questDatabase')?.scrollIntoView({behavior:'smooth',block:'start'}),30)}else if(typeof hdQNJump==='function')hdQNJump('questDatabase');else document.getElementById('questDatabase')?.scrollIntoView({behavior:'smooth',block:'start'})}});
window.addEventListener('load',()=>setTimeout(()=>{hdALEnsure();hdALRender()},1200));setTimeout(hdALEnsure,1600);window.addEventListener('storage',()=>setTimeout(hdALRender,0));