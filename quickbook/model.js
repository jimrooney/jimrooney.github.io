export const aircraftNames = ['172L', '172P'];
export const metadata = [
  {names:['Preflight','Before Start','Start','Taxi','Runup','Lineup','Takeoff','Downwind','Emergencies','GPS','Passenger Information','Limits'],starts:[1,2,3,4,5,6,7,8,9,16,18,20],colors:['#2f80ed','#8bd9a8','#27ae60','#4db6ac','#f2c94c','#ffb74d','#2f80ed','#f2c94c','#eb5757','#9b51e0','#6fcf97','#e67e9b']},
  {names:['Preflight','Start','Runup','Takeoff','Flight','Emergencies','GPS','Passenger Information','Limits'],starts:[1,5,6,7,8,10,17,19,21],colors:['#2f80ed','#27ae60','#f2c94c','#f2994a','#56ccf2','#eb5757','#9b51e0','#6fcf97','#e67e9b']}
];
export function parseCsv(csv) {
  if (new TextEncoder().encode(csv).length > 524288) throw Error('Download is too large');
  csv = csv.replace(/^\uFEFF/, '');
  const rows=[]; let row=[], cell='', quoted=false, closed=false;
  for(let i=0;i<csv.length;i++) {
    const c=csv[i];
    if(quoted) {
      if(c==='"') {if(csv[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}
      else cell+=c;
    } else if(c==='"') {
      if(cell||closed) throw Error('Invalid CSV quote'); quoted=true;
    } else if(c===','||c==='\n'||c==='\r') {
      row.push(cell);cell='';closed=false;
      if(c!==','){if(c==='\r'&&csv[i+1]==='\n')i++;rows.push(row);row=[];}
    } else {if(closed)throw Error('Unexpected text after quote');cell+=c;}
  }
  if(quoted)throw Error('Unclosed CSV quote');
  if(cell||closed||row.length){row.push(cell);rows.push(row);}
  if(JSON.stringify(rows.shift())!==JSON.stringify(['aircraft','page','title','body']))throw Error('Expected aircraft,page,title,body columns');
  const sets=[new Map(),new Map()];
  for(const r of rows){
    if(r.every(v=>!v.trim()))continue;
    if(r.length!==4)throw Error('Expected four columns');
    const a=aircraftNames.indexOf(r[0].trim()), number=r[1].trim();
    if(a<0)throw Error('Unknown aircraft');
    if(!/^\+?\d+$/.test(number)||Number(number)<1||Number(number)>2147483647)throw Error('Invalid page number');
    const page=Number(number);
    if(sets[a].has(page))throw Error('Duplicate aircraft/page');
    if(!r[2].trim()||r[2].length>200||r[3].length>20000)throw Error('Invalid card text');
    sets[a].set(page,{title:r[2],body:r[3]});
  }
  return sets.map((set,a)=>{
    if(!set.has(1)||set.size<2)throw Error('Keep a title card and checklist for '+aircraftNames[a]);
    return [...set].sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
  });
}
export function sections(cards, originals, aircraft) {
  const m=metadata[aircraft], result=[];let previous=-2;
  for(let page=1;page<cards.length;page++){
    const old=originals.findIndex(c=>c.title===cards[page].title);let group=-1;
    if(old>0)m.starts.forEach((start,i)=>{if(old>=start)group=i;});
    if(group<0||group!==previous)result.push({name:group>=0?m.names[group]:cards[page].title,start:page,color:group>=0?m.colors[group]:m.colors[result.length%m.colors.length]});
    previous=group;
  }
  return result;
}
export function lines(cards, layout, section) {
  const result=[], end=layout[section+1]?.start??cards.length;
  for(let page=layout[section].start;page<end;page++){
    const items=cards[page].body.replaceAll('; ','\n').replaceAll('. ','.\n').split('\n').map(s=>s.trim()).filter(Boolean);
    for(const text of items.length?items:[cards[page].title])result.push({page,text});
  }
  return result;
}
export function nextItem(item, count){return Math.min(item+1,count-1);}
