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
  const parseMap=body=>{const o={};for(const m of body.matchAll(/(\\d+)\\s*:\\s*(\\d+)/g))o[String(Number(m[1]))]=Number(m[2]);return o};
  const nums=s=>s?s.split(',').map(x=>Number(x.trim())).filter(Number.isFinite):[];
  const slotBody=between('slotExclusions: [','],\\n}'),slotExclusions=[];
  for(const m of slotBody.matchAll(/\\{([^{}]+)\\}/g)){
    const x=m[1],ships=x.match(/shipMstIds:\\s*\\[([^\\]]*)\\]/),slot=x.match(/slot:\\s*(\\d+)/);if(!ships||!slot)continue;
    const r={shipIds:nums(ships[1]),slot:Number(slot[1])};if(/fromSlot:\\s*true/.test(x))r.fromSlot=true;
    const ex=x.match(/exclude:\\s*\\[([^\\]]*)\\]/);if(ex)r.exclude=nums(ex[1]);
    const al=x.match(/allowOnly:\\s*\\[([^\\]]*)\\]/);if(al)r.allowOnly=nums(al[1]);slotExclusions.push(r);
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

const catalogFiles=['equipment-catalog.js','equipment-catalog-extra.js','equipment-catalog-extra2.js','equipment-catalog-extra3.js','equipment-catalog-extra4.js'];
const catalogNames=new Set();
for(const p of catalogFiles){const s=await text(p);for(const m of s.matchAll(/\{name:'([^']+)'/g))catalogNames.add(m[1])}
const itemByName=new Map((api.api_mst_slotitem||[]).map(x=>[x.api_name,x]));
const equipment={};
for(const name of [...catalogNames].sort((a,b)=>a.localeCompare(b,'ja'))){
  const x=itemByName.get(name);if(!x)continue;
  const typeId=Array.isArray(x.api_type)?Number(x.api_type[2]):0;
  equipment[name]={id:Number(x.api_id),typeId,typeName:typeNameById.get(typeId)||''};
}

const exslotBaseTypeIds=(api.api_mst_equip_exslot||[]).map(Number),exslotItemRules={},exslotGlobalItemIds=[];
for(const [id,rule] of Object.entries(api.api_mst_equip_exslot_ship||{})){
  const r={reqStar:Number(rule.api_req_level)||0,stypes:rule.api_stypes?Object.keys(rule.api_stypes).map(Number):[],ctypes:rule.api_ctypes?Object.keys(rule.api_ctypes).map(Number):[],shipIds:rule.api_ship_ids?Object.keys(rule.api_ship_ids).map(Number):[]};
  exslotItemRules[String(Number(id))]=r;if(r.stypes.includes(99))exslotGlobalItemIds.push(Number(id));
}
const exslotLimitTypeIds={};for(const [shipId,ids] of Object.entries(api.api_mst_equip_limit_exslot||{}))exslotLimitTypeIds[String(Number(shipId))]=(ids||[]).map(Number);

const snapshot={source:{repo:SOURCE_REPO,ref:SOURCE_REF,commit:commit.sha,updated:commit.commit?.committer?.date||commit.commit?.author?.date||'',basis:'api_start2'},clientRules:{source:{repo:PICKER_REPO,ref:PICKER_REF,path:PICKER_PATH,commit:pickerCommit.sha,updated:pickerCommit.commit?.committer?.date||pickerCommit.commit?.author?.date||''},...pickerTables},ships,equipment,exslotBaseTypeIds,exslotGlobalItemIds:[...new Set(exslotGlobalItemIds)].sort((a,b)=>a-b),exslotItemRules,exslotLimitTypeIds};
const out='/* Auto-generated by scripts/sync-kancolle-master.mjs. Do not edit by hand. */\nwindow.HD_KANCOLLE_MASTER_SNAPSHOT='+JSON.stringify(snapshot,null,2)+';\n';
const old=await fs.readFile(OUT,'utf8').catch(()=>null);
const write=process.argv.includes('--write');
if(old===out){console.log('Kancolle master snapshot is current:',commit.sha);process.exit(0)}
if(!write){console.error('Kancolle master snapshot is stale. Run: node scripts/sync-kancolle-master.mjs --write');process.exit(1)}
await fs.writeFile(OUT,out,'utf8');
console.log('Updated ship-master-snapshot.js from',commit.sha,'picker',pickerCommit.sha,'ships',Object.keys(ships).length,'equipment',Object.keys(equipment).length,'slotRules',pickerTables.slotExclusions.length);
