import {aircraftNames,worksheetNames} from './seed.js';
export {aircraftNames};
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
  if(JSON.stringify(rows.shift())!==JSON.stringify(['aircraft','page','title','body','color']))throw Error('Expected aircraft,page,title,body,color columns');
  const sets=worksheetNames.map(()=>new Map());
  for(const r of rows){
    if(r.every(v=>!v.trim()))continue;
    if(r.length!==5)throw Error('Expected five columns');
    const a=worksheetNames.indexOf(r[0].trim()), number=r[1].trim();
    if(a<0)throw Error('Unknown aircraft');
    if(!/^\+?\d+$/.test(number)||Number(number)<1||Number(number)>2147483647)throw Error('Invalid page number');
    const page=Number(number);
    if(sets[a].has(page))throw Error('Duplicate aircraft/page');
    if(!r[2].trim()||r[2].length>200||r[3].length>20000)throw Error('Invalid card text');
    if(!/^#[0-9a-f]{6}$/i.test(r[4]))throw Error('Invalid card color');
    sets[a].set(page,{title:r[2],body:r[3],color:r[4]});
  }
  return sets.map((set,a)=>{
    if(!set.has(1)||set.size<2)throw Error('Keep a title card and checklist for '+aircraftNames[a]);
    return [...set].sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
  });
}
export function foreground(color){
  const rgb=color.slice(1).match(/../g).map(c=>parseInt(c,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);
  const l=rgb.reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
  return (l+.05)/.05>=1.05/(l+.05)?'#000000':'#ffffff';
}
export function sections(cards) {
  return cards.slice(1).map((card,i)=>({name:card.title,start:i+1,color:card.color}));
}
export function lines(cards, layout, section) {
  const result=[], end=layout[section+1]?.start??cards.length;
  for(let page=layout[section].start;page<end;page++){
    const items=cards[page].body.split('\n').filter(s=>s.trim());
    for(const text of items.length?items:[cards[page].title])result.push({page,text});
  }
  return result;
}
export function nextItem(item, count){return Math.min(item+1,count-1);}
