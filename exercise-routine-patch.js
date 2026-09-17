function hdERCurrent(){
 const all=hdERLoad(),key=hdERDayKey();
 if(!all[key]){
  all[key]=hdERDefaultDay(key);
  const keys=Object.keys(all).sort().slice(-14),keep={};
  for(const itemKey of keys)keep[itemKey]=all[itemKey];
  hdERSave(keep);
  return keep[key]||all[key];
 }
 return all[key];
}