// v44 composition-check corrections layered after expedition-fleet-manager.js.
hdEFTypeRequirements=function(text){
 const s=String(text||''),req=[];
 const patterns=[
  ['駆/海防',/\(駆\/海防\)(\d+)/],
  ['護衛空母',/護衛空母(\d+)/],
  ['航戦',/航戦(\d+)/],['水母',/水母(\d+)/],['潜母艦',/潜母艦(\d+)/],['航巡',/航巡(\d+)/],['海防',/海防(\d+)/],
  ['駆',/(?:^|[＋(])駆(\d+)/],['軽',/(?:^|[＋(])軽(\d+)/],['重',/(?:^|[＋(])重(\d+)/],['雷',/(?:^|[＋(])雷(\d+)/],['練',/(?:^|[＋(])練(\d+)/],
  ['戦',/(?:^|[＋(])戦(\d+)/],['空母',/(?:^|[＋(])空母(\d+)/],['潜',/(?:^|[＋(])潜(\d+)/]
 ];
 for(const [key,re] of patterns){const m=s.match(re);if(m)req.push({key,count:Number(m[1])})}
 return req;
};
const hdEFCheckV44Base=hdEFCheck;
hdEFCheck=function(no,exp){
 const r=hdEFCheckV44Base(no,exp),ships=r.ships||[];
 const addHard=(label,ok,detail)=>{r.checks.push({label,ok,detail,manual:false});if(!ok&&!r.hard.includes(label))r.hard.push(label)};
 if(String(exp.id)==='44'){
  const carrier=hdEFGroupCount(ships,'空母'),water=hdEFGroupCount(ships,'水母');
  addHard('航空輸送枠',carrier>=2&&water>=1,`空母系(水母可) ${carrier}/2以上 ＋ 水母 ${water}/1以上（別枠）`);
 }
 if(String(exp.id)==='45'){
  const flag=ships[0]?.type||'',ok=['護衛空母','軽空母'].includes(flag);
  addHard('旗艦艦種',ok,`旗艦 ${flag||'未入力'} / 護衛空母または軽空母`);
 }
 r.canStart=r.hard.length===0;
 return r;
};
if(typeof hdEFRender==='function')setTimeout(hdEFRender,0);
