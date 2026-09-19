import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const fail=(errors)=>{for(const e of errors)console.error('ERROR:',e);process.exit(1)};

function parseSnapshot(src){
  const m=src.match(/window\.HD_KANCOLLE_MASTER_SNAPSHOT=(\{[\s\S]*\});\s*$/);
  if(!m)throw new Error('ship-master-snapshot.js payload not found');
  return JSON.parse(m[1]);
}
function detailedFinals(src){
  const a=src.indexOf('const HD_SHIP_DATABASE=['),b=src.indexOf('const HD_SHIP_STATS=');
  if(a<0||b<0||b<=a)throw new Error('HD_SHIP_DATABASE bounds not found');
  return [...src.slice(a,b).matchAll(/final:'([^']+)'/g)].map(m=>m[1]);
}
function versionState(){
  const app=JSON.parse(read('app-version.json'));
  const update=read('update-manager.js'),sw=read('sw.js');
  return {
    appVersion:app.version,
    appBuild:Number(app.build)||0,
    updateVersion:update.match(/const HD_APP_VERSION='([^']+)'/)?.[1]||'',
    updateBuild:Number(update.match(/const HD_APP_BUILD=(\d+)/)?.[1])||0,
    cacheBuild:Number(sw.match(/const CACHE='harbordesk-pwa-v(\d+)'/)?.[1])||0
  };
}

const errors=[],warnings=[];
const snap=parseSnapshot(read('ship-master-snapshot.js'));
const finals=detailedFinals(read('ship-database.js'));
const detailed=snap.ships||{},allShips=snap.allShips||{},equipment=snap.equipment||{};
const allRows=Object.values(allShips),allIds=new Set(Object.keys(allShips).map(Number));
const equipmentRows=Object.values(equipment),equipmentIds=new Set(equipmentRows.map(x=>Number(x.id)).filter(Number.isFinite));

if(!snap.source?.commit)errors.push('master source commit is missing');
if(!snap.clientRules?.source?.commit)errors.push('picker source commit is missing');
if(!finals.length)errors.push('detailed ship database is empty');
if(new Set(finals).size!==finals.length)errors.push('duplicate final ship names exist in detailed DB');
if(Object.keys(detailed).length!==finals.length)errors.push(`detailed snapshot count ${Object.keys(detailed).length} != detailed DB ${finals.length}`);
if(allRows.length<finals.length)errors.push(`allShips ${allRows.length} < detailed ships ${finals.length}`);
if(equipmentRows.length<100)errors.push(`equipment master unexpectedly small: ${equipmentRows.length}`);

for(const name of finals){
  const p=detailed[name];
  if(!p){errors.push(`missing detailed master profile: ${name}`);continue}
  const row=allShips[String(p.id)];
  if(!row){errors.push(`detailed ship ${name} id ${p.id} missing from allShips`);continue}
  if(row.name!==name)errors.push(`ship name mismatch id ${p.id}: detailed=${name}, allShips=${row.name}`);
  if(JSON.stringify(row.slots||[])!==JSON.stringify(p.slots||[]))errors.push(`slot mismatch: ${name}`);
  if(!Number.isInteger(Number(p.stype))||Number(p.stype)<=0)errors.push(`invalid stype: ${name}`);
  if(Object.keys(p.equipRules||{}).length!==(p.allowedTypes||[]).length)warnings.push(`equip rule/type label count differs: ${name}`);
}
for(const [id,row] of Object.entries(allShips)){
  if(Number(id)!==Number(row.id))errors.push(`allShips key/id mismatch: ${id}/${row.id}`);
  if(!row.name)errors.push(`allShips name missing: ${id}`);
  if(!Array.isArray(row.slots))errors.push(`allShips slots missing: ${row.name||id}`);
  else if(row.slots.some(x=>!Number.isFinite(Number(x))||Number(x)<0))errors.push(`invalid slot capacity: ${row.name||id}`);
}
const seenEquipIds=new Map();
for(const [name,row] of Object.entries(equipment)){
  const id=Number(row.id);
  if(!(id>0&&id<1500))errors.push(`invalid player equipment id: ${name}=${row.id}`);
  if(!Number.isInteger(Number(row.typeId))||Number(row.typeId)<=0)errors.push(`invalid equipment type: ${name}`);
  if(seenEquipIds.has(id)&&seenEquipIds.get(id)!==name)errors.push(`duplicate equipment id ${id}: ${seenEquipIds.get(id)} / ${name}`);
  seenEquipIds.set(id,name);
}
for(const id of Object.keys(snap.exslotItemRules||{}).map(Number)){
  if(!equipmentIds.has(id))errors.push(`exslot item rule references missing equipment id: ${id}`);
}
for(const shipId of Object.keys(snap.exslotLimitTypeIds||{}).map(Number)){
  if(!allIds.has(shipId))errors.push(`exslot limit references missing ship id: ${shipId}`);
}
for(const [i,r] of (snap.clientRules?.slotExclusions||[]).entries()){
  if(!Array.isArray(r.shipIds)||!r.shipIds.length)errors.push(`picker slot rule ${i} has no shipIds`);
  for(const shipId of r.shipIds||[])if(!allIds.has(Number(shipId)))errors.push(`picker slot rule ${i} references missing ship id: ${shipId}`);
  if(!Number.isInteger(Number(r.slot))||Number(r.slot)<0)errors.push(`picker slot rule ${i} has invalid slot`);
}
if(snap.changes?.masterForms!=null&&Number(snap.changes.masterForms)!==allRows.length){
  errors.push(`change summary masterForms ${snap.changes.masterForms} != allShips ${allRows.length}`);
}

const v=versionState();
if(v.appVersion!==v.updateVersion||v.appBuild!==v.updateBuild||v.appBuild!==v.cacheBuild){
  errors.push(`version mismatch app=${v.appVersion}/${v.appBuild} update=${v.updateVersion}/${v.updateBuild} cache=${v.cacheBuild}`);
}
if(!read('sw.js').includes("'./ship-master-snapshot.js'"))errors.push('ship-master-snapshot.js missing from Service Worker cache');

console.log(JSON.stringify({
  source:(snap.source?.commit||'').slice(0,12),
  picker:(snap.clientRules?.source?.commit||'').slice(0,12),
  detailedShips:finals.length,
  masterForms:allRows.length,
  equipment:equipmentRows.length,
  exslotBaseTypes:(snap.exslotBaseTypeIds||[]).length,
  exslotItemRules:Object.keys(snap.exslotItemRules||{}).length,
  exslotLimitShips:Object.keys(snap.exslotLimitTypeIds||{}).length,
  pickerSlotRules:(snap.clientRules?.slotExclusions||[]).length,
  version:v,
  warnings:warnings.slice(0,30)
},null,2));
if(warnings.length)console.warn(`WARN: ${warnings.length} non-fatal master audit warnings`);
if(errors.length)fail(errors);
console.log('Kancolle master semantic audit: OK');
