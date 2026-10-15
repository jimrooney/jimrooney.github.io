import {parseCsv,sections,lines,nextItem,foreground} from './model.js';
import {initialCsv} from './seed.js';
import {downloadCsv} from './download.js';
import {openStorage,isNative} from './storage.js';
const $=id=>document.getElementById(id);
const storage=await openStorage();
let data=parseCsv(initialCsv), position={aircraft:0,section:-1,item:0}, busy=false, savedCsv=null, downloaded=false, restoreFailed=false;
// Downloaded spreadsheet data is kept until the next Update; an older bundle is replaced by this one.
try{const saved=await storage.load();if(saved&&(saved.downloaded||saved.csv===initialCsv)){data=parseCsv(saved.csv);position=saved.position;savedCsv=saved.csv;downloaded=Boolean(saved.downloaded);}}catch{restoreFailed=true;$('status').textContent='Couldn’t restore saved checklists; showing bundled lists';}
if(!Number.isInteger(position?.aircraft)||position.aircraft<0||position.aircraft>=data.length)position={aircraft:0,section:-1,item:0};
async function save(csv=savedCsv,at=position,fromSheet=downloaded){
  await storage.save(fromSheet?{csv,position:at,downloaded:true}:{csv,position:at});savedCsv=csv;downloaded=fromSheet;
}
function savePosition(){if(!restoreFailed)save().catch(()=>{$('status').textContent='Couldn’t save position';});}
function button(text,action){const b=document.createElement('button');b.textContent=text;b.addEventListener('click',e=>{e.stopPropagation();if(!busy)action();});return b;}
function render(scroll=false){
  const cards=data[position.aircraft].cards, layout=sections(cards);
  if(!Number.isInteger(position.section)||position.section< -1||position.section>=layout.length)position.section=-1;
  $('aircraft').replaceChildren(...data.map(({label:name},a)=>{const b=button(name,()=>{position={aircraft:a,section:-1,item:0};savePosition();render(true);});b.setAttribute('aria-pressed',String(a===position.aircraft));return b;}));
  $('sections').replaceChildren(...layout.map((s,i)=>{const b=button(s.name,()=>{position.section=i;position.item=0;savePosition();render(true);});b.style.setProperty('--section-color',s.color);b.style.color=foreground(s.color);b.setAttribute('aria-pressed',String(i===position.section));return b;}));
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
  $('body').style.setProperty('--section-foreground',foreground(layout[position.section].color));
  let itemIndex=0;
  for(const text of cards[page].body.split('\n')){
    const p=document.createElement('div');p.className='line';p.textContent=text;
    if(text.trim()){
      if(itemIndex===position.item){p.setAttribute('aria-current','true');p.id='active-line';}
      itemIndex++;
    }else{p.classList.add('separator');}
    $('body').append(p);
  }
  if(!itemIndex){const p=document.createElement('div');p.className='line';p.id='active-line';p.setAttribute('aria-current','true');p.textContent=cards[page].title;$('body').append(p);}
  if(scroll)requestAnimationFrame(()=>$('active-line')?.scrollIntoView({block:'nearest'}));
}
function advance(){if(busy||position.section<0)return;const cards=data[position.aircraft].cards, layout=sections(cards);position.item=nextItem(position.item,lines(cards,layout,position.section).length);savePosition();render(true);}
$('card').addEventListener('click',advance);
$('card').addEventListener('keydown',e=>{if(e.target!==$('card'))return;if(e.key===' '||e.key==='Enter'){e.preventDefault();advance();}});
$('home').addEventListener('click',()=>{if(busy)return;position.section=-1;position.item=0;savePosition();render(true);});
async function update(){
  if(busy)return;busy=true;$('status').textContent='';render();
  const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),25000);
  try{
    const csv=await downloadCsv(controller.signal), replacement=parseCsv(csv);
    // Stay on the same worksheet by name when tabs are added, removed or reordered.
    const same=replacement.findIndex(s=>s.name===data[position.aircraft].name);
    const next={aircraft:same>=0?same:Math.min(position.aircraft,replacement.length-1),section:-1,item:0};
    await save(csv,next,true);
    position=next;data=replacement;restoreFailed=false;$('status').textContent='Updated';
  }catch(error){$('status').textContent='Couldn’t update — '+error.message;}
  finally{clearTimeout(timer);busy=false;render(true);}
}
// Save initial content so navigation has the same validated local format as updates.
if(!savedCsv&&!restoreFailed){try{await save(initialCsv);}catch{$('status').textContent='Couldn’t save offline checklists';}}
render();
if(isNative()&&!$('status').textContent){$('status').textContent='Ready offline';}
if(!isNative()&&'serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(async()=>{await navigator.serviceWorker.ready;navigator.serviceWorker.controller?.postMessage('check-ready');}).catch(()=>{$('status').textContent='Offline setup unavailable';});navigator.serviceWorker.addEventListener('message',e=>{if(e.data==='offline-ready'&&!$('status').textContent)$('status').textContent='Ready offline';});}
