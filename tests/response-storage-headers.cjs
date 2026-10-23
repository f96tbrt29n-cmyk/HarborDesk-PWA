// Test-only, opt-in response metadata. Never reads bodies or changes requests/SW.
const HEADER = 'clear-site-data';
const LIMIT = 512;
const MISSING_LIMIT = 128;
const DIRECTIVES = new Set(['*','storage','cache','cookies','executionContexts','prefetchCache','prerenderCache']);
function safeLocation(value) {
  try {
    const url = new URL(value);
    if (!['http:','https:'].includes(url.protocol)) return {url:'',origin:''};
    url.username='';url.password='';url.search='';url.hash='';
    return {url:url.href,origin:url.origin};
  } catch { return {url:'',origin:''}; }
}
function headerSummary(value) {
  if (value === null) return {presence:'absent'};
  if (typeof value !== 'string') throw new TypeError('Unexpected header result');
  const prefix=value.slice(0,512),directives=[];
  let unrecognized=0;
  for (const token of prefix.split(',')) {
    const match=/^\s*"([^"\r\n]*)"\s*$/.exec(token);
    if (match && DIRECTIVES.has(match[1])) {
      if (!directives.includes(match[1])) directives.push(match[1]);
    } else unrecognized++;
  }
  // Do not retain arbitrary contents even inside the selected header.
  return {presence:'present',directives,unrecognized,valueLength:value.length,truncated:value.length>prefix.length};
}
function observeStorageHeaders({now,limit=LIMIT}={}) {
  const rows=new Map();
  let closed=false,limited=0,observerErrors=0;
  const read = (response, source, info) => {
    if (closed) return;
    try {
      const existing=rows.get(info.id);
      if (existing) { if (!existing.sources.includes(source)) existing.sources.push(source);return; }
      if (rows.size>=limit) { limited++;return; }
      const row={id:info.id,...safeLocation(info.url),status:info.status,fromServiceWorker:info.fromServiceWorker,
        sources:[source],responseAt:now(),lookupStartedAt:null,lookupCompletedAt:null,outcome:'pending',header:null};
      rows.set(info.id,row);
      row.lookupStartedAt=now();
      const fail=error=>{
        if (closed) return;
        row.lookupCompletedAt=now();row.outcome='failed';
        row.errorName=['Error','TypeError','SecurityError','AbortError','TimeoutError'].includes(error?.name)?error.name:'Other';
      };
      let pending;
      try { pending=response.headerValue(HEADER); } catch(error) { fail(error);return; }
      // This observes only the diagnostic header lookup, never an app Promise.
      // Do not await it in an event handler or at artifact retention.
      Promise.resolve(pending).then(value=>{
        if (closed) return;
        try { row.header=headerSummary(value);row.lookupCompletedAt=now();row.outcome='obtained'; }
        catch(error) { fail(error); }
      },fail).catch(()=>{if(!closed)observerErrors++;});
    } catch { observerErrors++; }
  };
  const finish = events => {
    closed=true;
    const capturedAt=now(),requests=new Map(),responses=new Set();
    for (const e of events) {
      if (!Number.isInteger(e.id)) continue;
      if (['request','context-request'].includes(e.kind) && !requests.has(e.id))
        requests.set(e.id,{id:e.id,...safeLocation(e.url),requestAt:e.ms});
      if (['response','context-response'].includes(e.kind)) responses.add(e.id);
      if (['requestfailed','context-requestfailed','requestfinished','context-requestfinished'].includes(e.kind) && requests.has(e.id))
        requests.get(e.id)[e.kind.includes('failed')?'failedAt':'finishedAt']=e.ms;
    }
    const absent=[...requests.values()].filter(r=>!responses.has(r.id)).map(r=>({...r,
      requestOutcome:r.failedAt!==undefined?'failed':r.finishedAt!==undefined?'finished':'unfinished-at-capture-end'}));
    const records=[...rows.values()].map(r=>({...r,sources:r.sources.slice(),
      outcome:r.outcome==='pending'?'pending-at-capture-end':r.outcome,
      header:r.header?{...r.header,...(r.header.directives?{directives:r.header.directives.slice()}:{})}:null}));
    return {enabled:true,header:HEADER,clock:'Node monotonic ms since observeReload start; not document time',capturedAt,
      scope:'page response events plus the existing filtered context response events; no internal SW/network completeness guarantee',
      limit,recorded:records.length,limitedResponseEvents:limited,observerErrors,
      responseNotCollectedCount:[...responses].filter(id=>!rows.has(id)).length,
      requestCount:requests.size,responseNotObservedCount:absent.length,
      responseNotObserved:absent.slice(0,MISSING_LIMIT),responseNotObservedLimit:MISSING_LIMIT,
      responseNotObservedDropped:Math.max(0,absent.length-MISSING_LIMIT),records};
  };
  return {read,finish};
}
module.exports={observeStorageHeaders,HEADER,LIMIT};
