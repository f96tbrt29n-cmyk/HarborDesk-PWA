import fs from 'node:fs/promises';

function jstIsoNow(){
 const d=new Date(Date.now()+9*60*60*1000);
 return d.toISOString().replace('Z','+09:00');
}
export async function bumpHarborDeskVersion(sourceCommit,pickerCommit,changes=null,root=new URL('../',import.meta.url)){
 const APP_VERSION_FILE=new URL('app-version.json',root),UPDATE_MANAGER_FILE=new URL('update-manager.js',root),SW_FILE=new URL('sw.js',root),PACKAGE_FILE=new URL('package.json',root),RECOVERY_FILE=new URL('refresh.html',root),INDEX_FILE=new URL('index.html',root);
 const app=JSON.parse(await fs.readFile(APP_VERSION_FILE,'utf8'));
 const update=await fs.readFile(UPDATE_MANAGER_FILE,'utf8');
 const sw=await fs.readFile(SW_FILE,'utf8');
 const pkg=JSON.parse(await fs.readFile(PACKAGE_FILE,'utf8'));
 const recovery=await fs.readFile(RECOVERY_FILE,'utf8');
 const index=await fs.readFile(INDEX_FILE,'utf8');
 const builds=[
  Number(app.build)||0,
  Number(update.match(/const HD_APP_BUILD=(\d+)/)?.[1])||0,
  Number(sw.match(/const CACHE='harbordesk-pwa-v(\d+)'/)?.[1])||0,
  Number(pkg.version?.split('.')[2])||0,
  Number(recovery.match(/const BUILD=(\d+)/)?.[1])||0
 ];
 const build=Math.max(...builds)+1,version=`1.0.${build}`;
 pkg.version=version;
 app.version=version;app.build=build;app.releasedAt=jstIsoNow();
 const shipDiff=changes?(changes.ships.added.length+changes.ships.removed.length+changes.ships.changed.length):0,equipAdd=changes?.equipment?.added?.length||0,equipChanged=changes?(changes.equipment.removed.length+changes.equipment.changed.length):0,exDiff=changes?(changes.exslot?.itemRulesChanged||0)+(changes.exslot?.limitShipsChanged||0):0;
 app.notes=`艦これマスター自動同期。api_start2 ${String(sourceCommit||'').slice(0,7)} / 装備picker ${String(pickerCommit||'').slice(0,7)} を反映。艦娘変更 ${shipDiff}件 / 新装備 ${equipAdd}件 / 装備変更 ${equipChanged}件 / 増設ルール ${exDiff}件${changes?.picker?.changed?' / picker位置制限変更':''}。`;
 app.masterChanges=changes||null;
 const nextUpdate=update.replace(/const HD_APP_VERSION='[^']+';/,`const HD_APP_VERSION='${version}';`).replace(/const HD_APP_BUILD=\d+;/,`const HD_APP_BUILD=${build};`);
 const nextSw=sw.replace(/const CACHE='harbordesk-pwa-v\d+';/,`const CACHE='harbordesk-pwa-v${build}';`);
 const nextRecovery=recovery.replace(/const BUILD=\d+;/,`const BUILD=${build};`);
 const nextIndex=index.replace(/((?:src|href)=["'][^"']+\.(?:js|css)\?v=)\d+/g,`$1${build}`);
 if(nextIndex===index)throw new Error('index asset version markers not found');
 if(nextRecovery===recovery)throw new Error('refresh build marker not found');
 if(nextUpdate===update)throw new Error('update-manager version marker not found');
 if(nextSw===sw)throw new Error('sw cache marker not found');
 await Promise.all([
  fs.writeFile(APP_VERSION_FILE,JSON.stringify(app,null,2)+'\n','utf8'),
  fs.writeFile(UPDATE_MANAGER_FILE,nextUpdate,'utf8'),
  fs.writeFile(SW_FILE,nextSw,'utf8'),
  fs.writeFile(PACKAGE_FILE,JSON.stringify(pkg,null,2)+'\n','utf8'),
  fs.writeFile(RECOVERY_FILE,nextRecovery,'utf8'),
  fs.writeFile(INDEX_FILE,nextIndex,'utf8')
 ]);
 console.log('Bumped HarborDesk to',version,'build',build);
 return {version,build};
}
