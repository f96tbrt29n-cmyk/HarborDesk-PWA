'use strict';
// Frozen public renderer from PR152 base9f6861ef383bd8c8687139308b80ea1a12583e7d.
// sortie-equipment-check.js SHA-256: 938b2f8d4f734e6ec12f42ed7da3a882a093f40ede9a5cd0435099e17745c9fe
// Function SHA-256: e84ad5a3da7e3f5f312234dfa8dbb996c206ac09f204f2f88944b505768494bc
// Characterization fixture only; no saved values, private evidence or runtime paths.
module.exports=function hdSECapabilityHtml(map,fleetId='',proposal=null){
 const profiles=hdSEProfiles(map);if(!profiles.length)return hdSENightPolicyHtml(map);
 const fleets=typeof hdSPSFleets==='function'?hdSPSFleets(map):[],fleet=fleetId?fleets.find(x=>String(x.id)===String(fleetId)):(typeof hdSPSFleet==='function'?hdSPSFleet(map):null),plan=proposal||(fleet?hdFEPlanFromSavedFleet(map,fleet):null),esc=hdSEEsc;
 return `<div class="hd-se-capabilities">${hdSENightPolicyHtml(map)}<strong>攻略で用意する装備・組み合わせ</strong><p>通るルートに合わせた推奨装備です。所持・同じ艦への配備・艦種条件を分けて確認します。</p>${profiles.map(p=>{
  const stock=hdSECapabilityStock(plan,p.kind),actual=hdSECapabilityMeasure(plan,p.kind),status=actual.count?'配備済み':stock?.usable?.complete?'手持ちで配備可能':stock?.complete?(plan?'艦種・装備枠の確認が必要':'所持セットあり・艦隊を選んで確認'):'所持不足';
  return `<article class="hd-se-capability ${actual.count?'ready':stock?.complete?'partial':'missing'}" data-hd-se-capability="${p.kind}"><div class="hd-se-check-head"><div><b>${esc(p.label)}</b><small>${esc(p.importance)}</small></div><strong>${esc(status)}</strong></div><p>${esc(p.reason)}</p>${stock?`<b>${esc(stock.recipe.name)}</b><div class="hd-se-cap-parts">${stock.parts.map(part=>{const gap=Math.max(0,part.need-part.have),examples=HD_SE_PARTS[part.part].examples;return `<div class="${gap?'missing':'ready'}"><b>${esc(part.label)}：${part.have}/${part.need}${gap?`・あと${gap}個`:''}</b><span>${esc(part.items.length?'手持ち：'+part.items.join('、'):'候補：'+examples.join(' / '))}</span></div>`}).join('')}</div>`:''}${actual.count?`<p>条件を満たす配備：${esc(actual.ships.join('、'))}</p>`:stock?.usable?.complete?`<p>同じ艦に載せられる候補：${esc(stock.usable.ship)}。下の探索で他の目安との両立を確認してね。</p>`:stock?.complete&&plan?'<p>所持品は揃っていますが、この編成に同じ艦のセットを確認できません。対応艦・スロット・増設枠を見直してね。</p>':''}<details><summary>別の装備例</summary>${(HD_SE_RECIPES[p.kind]||[]).map(r=>`<p>${esc(r.name)}${r.ship==='akizuki'?'（秋月型専用）':''}</p>`).join('')}</details><small>${esc(p.note)}</small><a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">装備条件の出典 ↗</a></article>`;
 }).join('')}</div>`;
};
