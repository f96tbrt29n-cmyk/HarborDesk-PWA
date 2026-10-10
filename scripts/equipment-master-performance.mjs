// Base equipment values captured from api_start2, not ship-specific bonuses.
export function equipmentMasterPerformance(x,typeName=''){
 const fields={火力:'api_houg',雷装:'api_raig',爆装:'api_baku',対空:'api_tyku',対潜:'api_tais',索敵:'api_saku',命中:'api_houm',回避:'api_houk',装甲:'api_souk'};
 // For land fighters these API fields mean interception and anti-bomber.
 if(Number(x.api_type?.[2])===48){delete fields.命中;delete fields.回避;fields.迎撃='api_houm';fields.対爆='api_houk'}
 const stats={};for(const [label,key] of Object.entries(fields)){
  if(!Number.isFinite(x[key]))throw new Error(`Equipment ${x.api_id}: missing ${key}`);
  stats[label]=x[key];
 }
 return {id:Number(x.api_id),typeId:Number(x.api_type?.[2])||0,typeName,stats,range:['','短','中','長','超長','超長+'][Number(x.api_leng)]||'',...(Number.isFinite(x.api_distance)?{radius:x.api_distance}:{}),...(Number.isFinite(x.api_cost)?{cost:x.api_cost}:{})};
}
