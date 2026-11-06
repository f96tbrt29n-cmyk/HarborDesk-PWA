"use strict";
// Scoped actual-model extension: the browser loads details57 after details34.
// Keep the established common loader and its historical expectations unchanged.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createTwoFiveCeioModelContext}=require('./two-five-ceio-model-context.cjs');
function createSurfaceNightModelContext(options={}){
 const root=path.resolve(options.root||path.join(__dirname,'../..')),details=fs.readFileSync(path.join(root,'map-details-57.js'),'utf8'),base=fs.readFileSync(path.join(root,'tests/fixtures/two-five-ceio-model-context.cjs'),'utf8');
 assert.equal(base.includes('"file": "map-details-57.js"'),false,'remove scoped extension if the common loader gains this real module');let injected=0;
 const project=(file,source)=>{const actual=options.project?options.project(file,source):source;if(file!=='map-details-34.js')return actual;injected++;return actual+'\n'+(options.project?options.project('map-details-57.js',details):details)};
 const result=createTwoFiveCeioModelContext({...options,root,project});assert.equal(injected,1,'actual details57 is loaded once in browser order');return result;
}
module.exports={createSurfaceNightModelContext};
