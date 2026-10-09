import {parseCsv,sections,lines,nextItem,aircraftNames} from './model.js';
import {originals,initial,initialCsv} from './seed.js';
import {downloadCsv} from './download.js';
const $=id=>document.getElementById(id), key='quickbook-ipad-v1';
let data=initial, position={aircraft:0,section:-1,item:0}, busy=false, savedCsv=null;
try{const saved=JSON.parse(localStorage.getItem(key));if(saved){data=parseCsv(saved.csv);position=saved.position;savedCsv=saved.csv;}}catch{}
if(!Number.isInteger(position?.aircraft)||position.aircraft<0||position.aircraft>1)position={aircraft:0,section:-1,item:0};
function save(csv=savedCsv){
  localStorage.setItem(key,JSON.stringify({csv,position}));savedCsv=csv;
}
function savePosition(){try{save();}catch{$('status').textContent='Couldn’t save position';}}
function button(text,action){const b=document.createElement('button');b.textContent=text;b.addEventListener('click',e=>{e.stopPropagation();action();});return b;}
function render(scroll=false){
  const cards=data[position.aircraft], layout=sections(cards,originals[position.aircraft],position.aircraft);
  if(!Number.isInteger(position.section)||position.section< -1||position.section>=layout.length)position.section=-1;
  $('aircraft').replaceChildren(...aircraftNames.map((name,a)=>{const b=button(name,()=>{position={aircraft:a,section:-1,item:0};savePosition();render(true);});b.setAttribute('aria-pressed',String(a===position.aircraft));return b;}));
  $('sections').replaceChildren(...layout.map((s,i)=>{const b=button(s.name,()=>{position.section=i;position.item=0;savePosition();render(true);});b.style.setProperty('--section-color',s.color);b.setAttribute('aria-pressed',String(i===position.section));return b;}));
  $('body').replaceChildren();
  if(position.section===-1){
    $('heading').textContent=cards[0].title;
    const chunks=cards[0].body.split('[Update]');
    chunks.forEach((text,i)=>{const p=document.createElement('div');p.className='title-text';p.textContent=text;$('body').append(p);if(i===0&&(chunks.length>1||chunks.length===1)){const b=button(busy?'Updating…':'Update',update);b.className='update';b.disabled=busy;$('body').append(b);}});
    if(scroll)$('card').scrollTop=0;return;
  }
  const entries=lines(cards,layout,position.section);
  position.item=Math.max(0,Math.min(entries.length-1,Number.isInteger(position.item)?position.item:0));
  const page=entries[position.item].page;
  $('heading').textContent=cards[page].title;
  $('body').style.setProperty('--section-color',layout[position.section].color);
  entries.forEach((entry,i)=>{if(entry.page!==page)return;const p=document.createElement('div');p.className='line';p.textContent=entry.text;if(i===position.item){p.setAttribute('aria-current','true');p.id='active-line';}$('body').append(p);});
  if(scroll)requestAnimationFrame(()=>$('active-line')?.scrollIntoView({block:'nearest'}));
}
function advance(){if(position.section<0)return;const cards=data[position.aircraft], layout=sections(cards,originals[position.aircraft],position.aircraft);position.item=nextItem(position.item,lines(cards,layout,position.section).length);savePosition();render(true);}
$('card').addEventListener('click',advance);
$('card').addEventListener('keydown',e=>{if(e.target!==$('card'))return;if(e.key===' '||e.key==='Enter'){e.preventDefault();advance();}});
$('home').addEventListener('click',()=>{position.section=-1;position.item=0;savePosition();render(true);});
async function update(){
  if(busy)return;busy=true;$('status').textContent='';render();
  const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),25000);
  try{
    const csv=await downloadCsv(controller.signal), replacement=parseCsv(csv), oldPosition=position;
    position={aircraft:position.aircraft,section:-1,item:0};
    try{save(csv);}catch(e){position=oldPosition;throw e;}
    data=replacement;$('status').textContent='Updated';
  }catch{$('status').textContent='Couldn’t update';}
  finally{clearTimeout(timer);busy=false;render(true);}
}
// Save initial content so navigation has the same validated local format as updates.
if(!savedCsv){try{save(initialCsv);}catch{$('status').textContent='Couldn’t save offline checklists';}}
render();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(async()=>{await navigator.serviceWorker.ready;navigator.serviceWorker.controller?.postMessage('check-ready');}).catch(()=>{$('status').textContent='Offline setup unavailable';});navigator.serviceWorker.addEventListener('message',e=>{if(e.data==='offline-ready'&&!$('status').textContent)$('status').textContent='Ready offline';});}
