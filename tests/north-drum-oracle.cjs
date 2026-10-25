// Independent finite domain for 2-5/index0/BFJO. Source facts: api_start2
// 23637be57ac23a7b4281f193b836fa568ead8ee4: item75/type30, stype6 permits
// drums, stype5 does not; ships503/504/319 each have four normal slots.
// Expansion is closed in the existing fixture. No production matcher or formula.
const positions=Object.freeze([
 {shipIndex:1,masterId:503,index:0}, {shipIndex:1,masterId:503,index:2},
 {shipIndex:2,masterId:504,index:0}, {shipIndex:2,masterId:504,index:2},
 {shipIndex:3,masterId:319,index:0}, {shipIndex:3,masterId:319,index:1},
 {shipIndex:1,masterId:503,index:0,expansion:true},
 {shipIndex:2,masterId:504,index:0,expansion:true},
 {shipIndex:1,masterId:503,index:4}, {shipIndex:2,masterId:504,index:4}
].map(Object.freeze));
function northDrumPlacements(){
 const legal=p=>!p.expansion&&[503,504].includes(p.masterId)&&p.index>=0&&p.index<4,answers=[];
 for(let first=0;first<positions.length;first++)for(let second=first+1;second<positions.length;second++){
  const slots=[positions[first],positions[second]],hulls=new Set(slots.filter(legal).map(p=>p.masterId));
  answers.push({id:first+'-'+second,slots,legal:slots.every(legal),drumHulls:hulls.size,drumsReady:hulls.size===2,synchronized:first===1&&second===3});
 }
 return answers;
}
module.exports={positions,northDrumPlacements};
