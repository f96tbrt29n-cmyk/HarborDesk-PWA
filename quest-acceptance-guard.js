function hdAutoQuestAccepted(id){
 try{const q=typeof HD_QUESTS!=='undefined'?HD_QUESTS.find(x=>x.id===id):null;if(!q)return false;if(typeof hdQuestInChecklist==='function')return hdQuestInChecklist(q);return typeof state!=='undefined'&&(state.quests||[]).some(x=>x.sourceId===id&&!x.done)}catch{return false}
}
(function hdInstallExerciseAcceptanceGuard(){
 if(typeof window.hdERQuestDelta!=='function'||window.__hdExerciseAcceptanceGuard)return;
 const original=window.hdERQuestDelta;
 window.hdERQuestDelta=function(id,delta,periodKey){if(Number(delta)>0&&!hdAutoQuestAccepted(id))return;return original(id,delta,periodKey)};
 window.__hdExerciseAcceptanceGuard=true;
 const originalRender=window.hdERRender;
 if(typeof originalRender==='function')window.hdERRender=function(){const r=originalRender();const text=document.querySelector('#hdExerciseRoutine .hd-er-sync span');if(text)text.textContent='勝敗記録は、チェックリストへ追加した受注中の Cd1・Cd2・Cw1・Cm1 だけ任務進捗へ反映。';return r};
})();