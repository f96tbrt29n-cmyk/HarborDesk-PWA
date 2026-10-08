import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {bumpHarborDeskVersion} from '../scripts/bump-app-version.mjs';

async function fixture(t, recovery='const BUILD=547;'){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'harbordesk-version-'));
 t.after(()=>fs.rm(dir,{recursive:true,force:true}));
 const files={'app-version.json':JSON.stringify({version:'1.0.548',build:548}), 'update-manager.js':"const HD_APP_VERSION='1.0.548';\nconst HD_APP_BUILD=548;",'sw.js':"const CACHE='harbordesk-pwa-v548';",'package.json':JSON.stringify({name:'harbordesk-pwa',version:'1.0.547',scripts:{test:'keep'}}),'refresh.html':recovery};
 await Promise.all(Object.entries(files).map(([name,content])=>fs.writeFile(path.join(dir,name),content)));
 return {root:pathToFileURL(dir+path.sep),read:name=>fs.readFile(path.join(dir,name),'utf8'),files};
}

test('master release aligns all five version markers and preserves package settings',async t=>{
 const f=await fixture(t);
 assert.deepEqual(await bumpHarborDeskVersion('source','picker',null,f.root),{version:'1.0.549',build:549});
 const app=JSON.parse(await f.read('app-version.json'));
 assert.equal(app.version,'1.0.549');assert.equal(app.build,549);
 assert.ok(Number.isFinite(Date.parse(app.releasedAt)));
 const pkg=JSON.parse(await f.read('package.json'));
 assert.equal(pkg.version,app.version);assert.deepEqual(pkg.scripts,{test:'keep'});
 assert.match(await f.read('update-manager.js'),/HD_APP_VERSION='1\.0\.549';\nconst HD_APP_BUILD=549;/);
 assert.match(await f.read('sw.js'),/harbordesk-pwa-v549/);
 assert.match(await f.read('refresh.html'),/const BUILD=549;/);
});

test('invalid recovery marker fails before writing any release files',async t=>{
 const f=await fixture(t,'missing marker');
 await assert.rejects(bumpHarborDeskVersion('source','picker',null,f.root),/refresh build marker not found/);
 for(const [name,content] of Object.entries(f.files))assert.equal(await f.read(name),content);
});
