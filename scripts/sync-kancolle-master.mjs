import fs from 'node:fs/promises';

const SOURCE_REPO='Tibowl/api_start2';
const SOURCE_REF='master';
const RAW_URL='https://raw.githubusercontent.com/Tibowl/api_start2/master/start2.json';
const COMMIT_URL='https://api.github.com/repos/Tibowl/api_start2/commits/master';
const PICKER_REPO='poooi/poi';
const PICKER_REF='master';
const PICKER_PATH='views/utils/game-selector/tables.ts';
const PICKER_RAW_URL=`https://raw.githubusercontent.com/${PICKER_REPO}/${PICKER_REF}/${PICKER_PATH}`;
const PICKER_COMMIT_URL=`https://api.github.com/repos/${PICKER_REPO}/commits/${PICKER_REF}`;
const OUT=new URL('../ship-master-snapshot.js',import.meta.url);
const APP_VERSION_FILE=new URL('../app-version.json',import.meta.url);
const UPDATE_MANAGER_FILE=new URL('../update-manager.js',import.meta.url);
const SW_FILE=new URL('../sw.js',import.meta.url);

const text=async p=>fs.readFile(new URL('../'+p,import.meta.url),'utf8');
const headers={'User-Agent':'HarborDesk-master-sync',...(process.env.GITHUB_TOKEN?{Authorization:'Bearer '+process.env.GITHUB_TOKEN}:{})};

async function json(url){
  const r=await fetch(url,{headers});if(!r.ok)throw new Error(url+' -> '+r.status);return r.json();
}
async function rawText(url){
  const r=await fetch(url,{headers});if(!r.ok)throw new Error(url+' -> '+r.status);return r.text();
}
function normalizeRule(v){if(v==null)return null;if(Array.isArray(v))return v.map(Number);return null}
function parsePickerTables(src){
  const between=(a,b)=>{const i=src.indexOf(a);if(i<0)throw new Error('picker table missing: '+a);const j=src.indexOf(b,i+a.length);if(j<0)throw new Error('picker table missing: '+b);return src.slice(i+a.length,j)};
  const parseMap=body=>{const o={};for(const m of body.matchAll(/(\d+)\s*:\s*(\d+)/g))o[String(Number(m[1]))]=Number(m[2]);return o};
  const nums=s=>s?s.split(',').map(x=>Number(x.trim())).filter(Number.isFinite):[];
  const slotBody=between('slotExclusions: [','],\n}'),slotExclusions=[];
  for(const m of slotBody.matchAll(/\{([^{}]+)\}/g)){
    const x=m[1],ships=x.match(/shipMstIds:\s*\[([^\]]*)\]/),slot=x.match(/slot:\s*(\d+)/);if(!ships||!slot)continue;
    const r={shipIds:nums(ships[1]),slot:Number(slot[1])};if(/fromSlot:\s*true/.test(x))r.fromSlot=true;
    const ex=x.match(/exclude:\s*\[([^\]]*)\]/);if(ex)r.exclude=nums(ex[1]);
    const al=x.match(/allowOnly:\s*\[([^\]]*)\]/);if(al)r.allowOnly=nums(al[1]);slotExclusions.push(r);
  }
  return {equipTypeSpOverrides:parseMap(between('equipTypeSpOverrides: {','filterTypeSplits:')),pickerTypeOverrides:parseMap(between('pickerTypeOverrides: {','// The only field replaced outright')),slotExclusions};
}
function flagsForTypes(names){
  const set=new Set(names),out=[],add=(n,l)=>{if(set.has(n)&&!out.includes(l))out.push(l)};
  add('艦上戦闘機','艦戦');add('艦上攻撃機','艦攻');add('艦上爆撃機','艦爆');add('艦上偵察機','艦偵');
  add('水上戦闘機','水戦');add('水上爆撃機','水爆');add('特殊潜航艇','甲標的');add('上陸用舟艇','大発');
  add('特型内火艇','内火艇');add('オートジャイロ','回転翼機');add('対潜哨戒機','対潜哨戒機');add('大型ソナー','大型ソナー');
  if(names.some(x=>String(x).includes('噴式')))out.push('噴式');return out;
}

function jstIsoNow(){
 const d=new Date(Date.now()+9*60*60*1000);
 return d.toISOString().replace('Z','+09:00');
}
async function bumpHarborDeskVersion(sourceCommit,pickerCommit,changes=null){
 const app=JSON.parse(await fs.readFile(APP_VERSION_FILE,'utf8'));
 const update=await fs.readFile(UPDATE_MANAGER_FILE,'utf8');
 const sw=await fs.readFile(SW_FILE,'utf8');
 const builds=[
  Number(app.build)||0,
  Number(update.match(/const HD_APP_BUILD=(\d+)/)?.[1])||0,
  Number(sw.match(/const CACHE='harbordesk-pwa-v(\d+)'/)?.[1])||0
 ];
 const build=Math.max(...builds)+1,version=`1.0.${build}`;
 app.version=version;app.build=build;app.releasedAt=jstIsoNow();
 const shipDiff=changes?(changes.ships.added.length+changes.ships.removed.length+changes.ships.changed.length):0,equipAdd=changes?.equipment?.added?.length||0,equipChanged=changes?(changes.equipment.removed.length+changes.equipment.changed.length):0,exDiff=changes?(changes.exslot?.itemRulesChanged||0)+(changes.exslot?.limitShipsChanged||0):0;
 app.notes=`艦これマスター自動同期。api_start2 ${String(sourceCommit||'').slice(0,7)} / 装備picker ${String(pickerCommit||'').slice(0,7)} を反映。艦娘変更 ${shipDiff}件 / 新装備 ${equipAdd}件 / 装備変更 ${equipChanged}件 / 増設ルール ${exDiff}件${changes?.picker?.changed?' / picker位置制限変更':''}。`;
 app.masterChanges=changes||null;
 const nextUpdate=update.replace(/const HD_APP_VERSION='[^']+';/,`const HD_APP_VERSION='${version}';`).replace(/const HD_APP_BUILD=\d+;/,`const HD_APP_BUILD=${build};`);
 const nextSw=sw.replace(/const CACHE='harbordesk-pwa-v\d+';/,`const CACHE='harbordesk-pwa-v${build}';`);
 if(nextUpdate===update)throw new Error('update-manager version marker not found');
 if(nextSw===sw)throw new Error('sw cache marker not found');
 await Promise.all([
  fs.writeFile(APP_VERSION_FILE,JSON.stringify(app,null,2)+'\n','utf8'),
  fs.writeFile(UPDATE_MANAGER_FILE,nextUpdate,'utf8'),
  fs.writeFile(SW_FILE,nextSw,'utf8')
 ]);
 console.log('Bumped HarborDesk to',version,'build',build);
 return {version,build};
}

const [api,commit,pickerSource,pickerCommit]=await Promise.all([json(RAW_URL),json(COMMIT_URL),rawText(PICKER_RAW_URL),json(PICKER_COMMIT_URL)]);
const pickerTables=parsePickerTables(pickerSource);
const shipDb=await text('ship-database.js');
const finals=[...shipDb.matchAll(/final:'([^']+)'/g)].map(m=>m[1]);
const shipByName=new Map((api.api_mst_ship||[]).map(x=>[x.api_name,x]));
const typeNameById=new Map((api.api_mst_slotitem_equiptype||[]).map(x=>[Number(x.api_id),x.api_name]));
const stypeById=new Map((api.api_mst_stype||[]).map(x=>[Number(x.api_id),x]));
const equipShip=api.api_mst_equip_ship||{};

function equipRulesForShip(x){
  const override=equipShip[String(x.api_id)]?.api_equip_type;
  if(override){const o={};for(const [k,v] of Object.entries(override))o[String(Number(k))]=normalizeRule(v);return o}
  const base=stypeById.get(Number(x.api_stype))?.api_equip_type||{},o={};
  for(const [k,v] of Object.entries(base))if(v)o[String(Number(k))]=null;return o;
}

const ships={},missing=[];
for(const name of finals){
  const x=shipByName.get(name);if(!x){missing.push(name);continue}
  const equipRules=equipRulesForShip(x);
  const allowedTypes=Object.keys(equipRules).map(Number).map(id=>typeNameById.get(id)).filter(Boolean);
  ships[name]={id:Number(x.api_id),ctype:Number(x.api_ctype)||0,stype:Number(x.api_stype)||0,slots:(x.api_maxeq||[]).slice(0,Number(x.api_slot_num)||0).map(Number),equipRules,allowedTypes,flags:flagsForTypes(allowedTypes)};
}
if(missing.length)throw new Error('Master ships missing: '+missing.join(', '));

const stypeEquipRules={};
for(const x of (api.api_mst_stype||[])){
  const rules={};
  for(const [k,v] of Object.entries(x.api_equip_type||{}))if(v)rules[String(Number(k))]=null;
  stypeEquipRules[String(Number(x.api_id))]=rules;
}
const shipEquipOverrides={};
for(const [shipId,row] of Object.entries(api.api_mst_equip_ship||{})){
  const rules={};
  for(const [k,v] of Object.entries(row?.api_equip_type||{}))rules[String(Number(k))]=normalizeRule(v);
  shipEquipOverrides[String(Number(shipId))]=rules;
}
const allShips={};
for(const x of (api.api_mst_ship||[])){
  const id=Number(x.api_id)||0,stype=Number(x.api_stype)||0;
  if(!(id>0&&id<1500)||!x.api_name||!(stype>0))continue;
  const s=stypeById.get(stype);
  allShips[String(id)]={
    id,
    name:String(x.api_name),
    stype,
    type:String(s?.api_name||''),
    ctype:Number(x.api_ctype)||0,
    sortno:Number(x.api_sortno)||0,
    afterLv:Number(x.api_afterlv)||0,
    afterId:Number(x.api_aftershipid)||0,
    speed:Number(x.api_soku)||0,
    range:Number(x.api_leng)||0,
    fuel:Number(x.api_fuel_max)||0,
    ammo:Number(x.api_bull_max)||0,
    slots:(x.api_maxeq||[]).slice(0,Number(x.api_slot_num)||0).map(Number),
    stats:{
      hp:Number(x.api_taik?.[0])||0,
      armor:Number(x.api_souk?.[1])||0,
      fire:Number(x.api_houg?.[1])||0,
      torp:Number(x.api_raig?.[1])||0,
      aa:Number(x.api_tyku?.[1])||0,
      luck:Number(x.api_luck?.[1])||0
    }
  };
}

const ENEMY_SLOT_BORDER=1500;
const equipment={};
for(const x of (api.api_mst_slotitem||[])){
  const id=Number(x.api_id)||0;if(!(id>0&&id<ENEMY_SLOT_BORDER)||!x.api_name)continue;
  const typeId=Array.isArray(x.api_type)?Number(x.api_type[2])||0:0;
  equipment[x.api_name]={id,typeId,typeName:typeNameById.get(typeId)||''};
}

const exslotBaseTypeIds=(api.api_mst_equip_exslot||[]).map(Number),exslotItemRules={},exslotGlobalItemIds=[];
for(const [id,rule] of Object.entries(api.api_mst_equip_exslot_ship||{})){
  const r={reqStar:Number(rule.api_req_level)||0,stypes:rule.api_stypes?Object.keys(rule.api_stypes).map(Number):[],ctypes:rule.api_ctypes?Object.keys(rule.api_ctypes).map(Number):[],shipIds:rule.api_ship_ids?Object.keys(rule.api_ship_ids).map(Number):[]};
  exslotItemRules[String(Number(id))]=r;if(r.stypes.includes(99))exslotGlobalItemIds.push(Number(id));
}
const exslotLimitTypeIds={};for(const [shipId,ids] of Object.entries(api.api_mst_equip_limit_exslot||{}))exslotLimitTypeIds[String(Number(shipId))]=(ids||[]).map(Number);

function parseSnapshotFile(src){
 if(!src)return null;
 const m=src.match(/window\.HD_KANCOLLE_MASTER_SNAPSHOT=(\{[\s\S]*\});\s*$/);
 if(!m)return null;
 try{return JSON.parse(m[1])}catch{return null}
}
function stable(v){return JSON.stringify(v)}
function diffKeys(oldObj={},newObj={}){
 const oldKeys=new Set(Object.keys(oldObj||{})),newKeys=new Set(Object.keys(newObj||{}));
 const added=[...newKeys].filter(k=>!oldKeys.has(k)),removed=[...oldKeys].filter(k=>!newKeys.has(k));
 const changed=[...newKeys].filter(k=>oldKeys.has(k)&&stable(oldObj[k])!==stable(newObj[k]));
 return {added,removed,changed};
}
function buildChangeSummary(oldSnap,next){
 if(!oldSnap)return {baseline:true,from:null,to:next.source?.commit||'',at:new Date().toISOString(),ships:{added:[],removed:[],changed:[]},equipment:{added:[],removed:[],changed:[]},exslot:{changed:false,itemRulesChanged:0,limitShipsChanged:0},picker:{changed:false,slotRulesChanged:0,overrideChanged:0}};
 const shipsDiff=diffKeys(oldSnap.allShips||oldSnap.ships,next.allShips||next.ships),equipmentDiff=diffKeys(oldSnap.equipment,next.equipment);
 const exItem=diffKeys(oldSnap.exslotItemRules,next.exslotItemRules),exLimit=diffKeys(oldSnap.exslotLimitTypeIds,next.exslotLimitTypeIds);
 const oldPicker=oldSnap.clientRules||{},newPicker=next.clientRules||{};
 const slotChanged=stable(oldPicker.slotExclusions||[])!==stable(newPicker.slotExclusions||[]);
 const spChanged=stable(oldPicker.equipTypeSpOverrides||{})!==stable(newPicker.equipTypeSpOverrides||{});
 const pChanged=stable(oldPicker.pickerTypeOverrides||{})!==stable(newPicker.pickerTypeOverrides||{});
 return {
  baseline:false,
  from:oldSnap.source?.commit||'',
  to:next.source?.commit||'',
  at:new Date().toISOString(),
  ships:shipsDiff,
  equipment:equipmentDiff,
  exslot:{
   changed:stable(oldSnap.exslotBaseTypeIds)!==stable(next.exslotBaseTypeIds)||stable(oldSnap.exslotGlobalItemIds)!==stable(next.exslotGlobalItemIds)||exItem.added.length+exItem.removed.length+exItem.changed.length+exLimit.added.length+exLimit.removed.length+exLimit.changed.length>0,
   itemRulesChanged:exItem.added.length+exItem.removed.length+exItem.changed.length,
   limitShipsChanged:exLimit.added.length+exLimit.removed.length+exLimit.changed.length
  },
  picker:{
   changed:slotChanged||spChanged||pChanged,
   slotRulesChanged:slotChanged?1:0,
   overrideChanged:(spChanged?1:0)+(pChanged?1:0)
  }
 };
}

const snapshot={source:{repo:SOURCE_REPO,ref:SOURCE_REF,commit:commit.sha,updated:commit.commit?.committer?.date||commit.commit?.author?.date||'',basis:'api_start2 / player equipment api_id < 1500'},clientRules:{source:{repo:PICKER_REPO,ref:PICKER_REF,path:PICKER_PATH,commit:pickerCommit.sha,updated:pickerCommit.commit?.committer?.date||pickerCommit.commit?.author?.date||''},...pickerTables},ships,equipment,exslotBaseTypeIds,exslotGlobalItemIds:[...new Set(exslotGlobalItemIds)].sort((a,b)=>a-b),exslotItemRules,exslotLimitTypeIds,stypeEquipRules,shipEquipOverrides,allShips};
const old=await fs.readFile(OUT,'utf8').catch(()=>null),oldSnapshot=parseSnapshotFile(old);
snapshot.changes=buildChangeSummary(oldSnapshot,snapshot);
const out='/* Auto-generated by scripts/sync-kancolle-master.mjs. Do not edit by hand. */\nwindow.HD_KANCOLLE_MASTER_SNAPSHOT='+JSON.stringify(snapshot,null,2)+';\n';
const write=process.argv.includes('--write'),bump=process.argv.includes('--bump-app');
const semanticallyCurrent=oldSnapshot&&oldSnapshot.source?.commit===snapshot.source?.commit&&oldSnapshot.clientRules?.source?.commit===snapshot.clientRules?.source?.commit&&stable(oldSnapshot.ships)===stable(snapshot.ships)&&stable(oldSnapshot.equipment)===stable(snapshot.equipment)&&stable(oldSnapshot.exslotBaseTypeIds)===stable(snapshot.exslotBaseTypeIds)&&stable(oldSnapshot.exslotGlobalItemIds)===stable(snapshot.exslotGlobalItemIds)&&stable(oldSnapshot.exslotItemRules)===stable(snapshot.exslotItemRules)&&stable(oldSnapshot.exslotLimitTypeIds)===stable(snapshot.exslotLimitTypeIds)&&stable(oldSnapshot.stypeEquipRules||{})===stable(snapshot.stypeEquipRules)&&stable(oldSnapshot.shipEquipOverrides||{})===stable(snapshot.shipEquipOverrides)&&stable(oldSnapshot.allShips||{})===stable(snapshot.allShips)&&stable(oldSnapshot.clientRules?.slotExclusions||[])===stable(snapshot.clientRules?.slotExclusions||[])&&stable(oldSnapshot.clientRules?.equipTypeSpOverrides||{})===stable(snapshot.clientRules?.equipTypeSpOverrides||{})&&stable(oldSnapshot.clientRules?.pickerTypeOverrides||{})===stable(snapshot.clientRules?.pickerTypeOverrides||{});
if(semanticallyCurrent&&oldSnapshot?.changes){console.log('Kancolle master snapshot is current:',commit.sha);process.exit(0)}
if(!write){console.error('Kancolle master snapshot is stale. Run: node scripts/sync-kancolle-master.mjs --write --bump-app');process.exit(1)}
await fs.writeFile(OUT,out,'utf8');
if(bump)await bumpHarborDeskVersion(commit.sha,pickerCommit.sha,snapshot.changes);
console.log('Updated ship-master-snapshot.js from',commit.sha,'picker',pickerCommit.sha,'detailShips',Object.keys(ships).length,'allShipForms',Object.keys(allShips).length,'equipment',Object.keys(equipment).length,'slotRules',pickerTables.slotExclusions.length,'bumpApp',bump);
