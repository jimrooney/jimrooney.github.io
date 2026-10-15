import {label} from './model.js';
// Reads Google Sheets' .xlsx export with the same rules as scripts/import_checklists.py:
// visible worksheets in order, row 1 heading, literal text in A/B, column A background.
const MAIN='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const DRAWING='http://schemas.openxmlformats.org/drawingml/2006/main';
const DEFAULT_COLOR='#2f80ed';
const MAX_UNZIPPED=8*1024*1024;

async function unzip(bytes){
  if(typeof DecompressionStream==='undefined')throw Error('Update needs iPadOS 16.4 or later');
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  let end=-1;
  for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(view.getUint32(i,true)===0x06054b50){end=i;break;}
  if(end<0)throw Error('download is not a spreadsheet');
  const files=new Map();let p=view.getUint32(end+16,true),total=0;
  for(let n=view.getUint16(end+10,true);n>0;n--){
    if(view.getUint32(p,true)!==0x02014b50)throw Error('damaged spreadsheet download');
    const method=view.getUint16(p+10,true),size=view.getUint32(p+20,true),nameLength=view.getUint16(p+28,true),offset=view.getUint32(p+42,true);
    total+=view.getUint32(p+24,true);if(total>MAX_UNZIPPED)throw Error('spreadsheet is too large');
    const name=new TextDecoder().decode(bytes.subarray(p+46,p+46+nameLength));
    const start=offset+30+view.getUint16(offset+26,true)+view.getUint16(offset+28,true);
    files.set(name,{method,data:bytes.subarray(start,start+size)});
    p+=46+nameLength+view.getUint16(p+30,true)+view.getUint16(p+32,true);
  }
  let inflated=0;
  return async name=>{
    const file=files.get(name);
    if(!file)return null;
    if(file.method===0)return new TextDecoder().decode(file.data);
    if(file.method!==8)throw Error('unsupported spreadsheet compression');
    // Count real output: zip headers may understate the uncompressed size.
    const reader=new Blob([file.data]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader(), chunks=[];
    for(let r=await reader.read();!r.done;r=await reader.read()){
      inflated+=r.value.length;
      if(inflated>MAX_UNZIPPED){await reader.cancel();throw Error('spreadsheet is too large');}
      chunks.push(r.value);
    }
    return new TextDecoder().decode(await new Blob(chunks).arrayBuffer());
  };
}

function parseXml(text){
  if(/<!DOCTYPE/i.test(text))throw Error('damaged spreadsheet download');
  const doc=new DOMParser().parseFromString(text,'application/xml');
  if(doc.getElementsByTagName('parsererror').length)throw Error('damaged spreadsheet download');
  return doc;
}
const all=(node,name,ns=MAIN)=>[...node.getElementsByTagNameNS(ns,name)];
const child=(node,name,ns=MAIN)=>[...node.children].find(c=>c.localName===name&&c.namespaceURI===ns);
const richText=node=>all(node,'t').filter(t=>t.parentNode.localName!=='rPh').map(t=>t.textContent).join('');

function rgbToHls([r,g,b]){
  const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2;
  if(max===min)return [0,l,0];
  const d=max-min,s=l<=.5?d/(max+min):d/(2-max-min);
  const h=r===max?(max-b)/d-(max-g)/d:g===max?2+(max-r)/d-(max-b)/d:4+(max-g)/d-(max-r)/d;
  return [((h/6)%1+1)%1,l,s];
}
function hlsToRgb([h,l,s]){
  if(s===0)return [l,l,l];
  const m2=l<=.5?l*(1+s):l+s-l*s,m1=2*l-m2;
  const v=hue=>{hue=((hue%1)+1)%1;return hue<1/6?m1+(m2-m1)*hue*6:hue<.5?m2:hue<2/3?m1+(m2-m1)*(2/3-hue)*6:m1;};
  return [v(h+1/3),v(h),v(h-1/3)];
}
// Excel tint: lighten toward white (positive) or darken toward black (negative).
function tinted(hex,tint){
  if(!tint)return hex;
  const [h,l,s]=rgbToHls(hex.slice(1).match(/../g).map(c=>parseInt(c,16)/255));
  return '#'+hlsToRgb([h,tint<0?l*(1+tint):l*(1-tint)+tint,s]).map(c=>Math.round(c*255).toString(16).padStart(2,'0')).join('');
}

function themeColors(doc){
  const scheme=doc&&all(doc,'clrScheme',DRAWING)[0];
  if(!scheme)return [];
  const colors=[...scheme.children].map(c=>{const v=child(c,'srgbClr',DRAWING)?.getAttribute('val')??child(c,'sysClr',DRAWING)?.getAttribute('lastClr');return v&&'#'+v.toLowerCase();});
  // Theme indexes 0-3 address lt1, dk1, lt2, dk2: the scheme lists dark before light.
  return [colors[1],colors[0],colors[3],colors[2],...colors.slice(4)];
}

function fillColors(styles,themes){
  // Only <fills> children: conditional-format fills elsewhere in styles.xml are not indexed by fillId.
  const fills=[...(child(styles.documentElement,'fills')?.children??[])].map(fill=>{
    const pattern=child(fill,'patternFill');
    if(pattern?.getAttribute('patternType')!=='solid')return DEFAULT_COLOR;
    const color=child(pattern,'fgColor');
    const rgb=color?.getAttribute('rgb');
    if(rgb&&/^([0-9a-f]{2})?[0-9a-f]{6}$/i.test(rgb))return tinted('#'+rgb.slice(-6).toLowerCase(),Number(color.getAttribute('tint')||0));
    const theme=color?.hasAttribute('theme')?themes[Number(color.getAttribute('theme'))]:undefined;
    if(theme)return tinted(theme,Number(color.getAttribute('tint')||0));
    return null;
  });
  const formats=child(styles.documentElement,'cellXfs');
  return formats?[...formats.children].map(xf=>fills[Number(xf.getAttribute('fillId')||0)]):[];
}

export async function readWorkbook(bytes){
  const read=await unzip(bytes);
  const text=async name=>{const value=await read(name);if(value===null)throw Error('download is not a spreadsheet');return value;};
  const workbook=parseXml(await text('xl/workbook.xml'));
  const rels=new Map(all(parseXml(await text('xl/_rels/workbook.xml.rels')),'Relationship','http://schemas.openxmlformats.org/package/2006/relationships').map(r=>[r.getAttribute('Id'),r]));
  const sharedXml=await read('xl/sharedStrings.xml'), themeXml=await read('xl/theme/theme1.xml');
  const shared=sharedXml?all(parseXml(sharedXml),'si').map(richText):[];
  const cellColors=fillColors(parseXml(await text('xl/styles.xml')),themeColors(themeXml&&parseXml(themeXml)));
  const result=[];
  for(const sheet of all(workbook,'sheet')){
    if((sheet.getAttribute('state')||'visible')!=='visible')continue;
    const name=sheet.getAttribute('name'), rel=rels.get(sheet.getAttributeNS(REL,'id'));
    if(!rel||!rel.getAttribute('Type').endsWith('/worksheet'))throw Error(`${name}: unsupported worksheet type`);
    const target=rel.getAttribute('Target');
    const rows=new Map();
    for(const row of all(parseXml(await text(target.startsWith('/')?target.slice(1):'xl/'+target)),'row')){
      const n=Number(row.getAttribute('r')), cells={};
      for(const c of row.children){
        const column=(c.getAttribute('r')||'').replace(/\d+$/,'');
        if(column==='A'||column==='B')cells[column]=c;
      }
      const values=['A','B'].map(column=>{
        const c=cells[column];if(!c)return '';
        const type=c.getAttribute('t'), value=child(c,'v');
        if(child(c,'f')||(type!=='s'&&type!=='inlineStr'&&value))throw Error(`${name} row ${n}: use plain text in columns A and B`);
        if(type==='inlineStr')return richText(child(c,'is')??c);
        return type==='s'&&value?shared[Number(value.textContent)]??'':'';
      });
      if(!values[0]&&!values[1]&&n!==1)continue;
      const [title,body]=values;
      if(!title.trim())throw Error(`${name} row ${n}: add a title in column A`);
      if(title.length>200||body.length>20000)throw Error(`${name} row ${n}: text is too long`);
      const color=cells.A?cellColors[Number(cells.A.getAttribute('s')||0)]:DEFAULT_COLOR;
      if(color===null)throw Error(`${name} row ${n}: unsupported background colour`);
      rows.set(n,{title,body,color:color??DEFAULT_COLOR});
    }
    if(!rows.has(1)||rows.size<2)throw Error(`${name}: needs a heading in row 1 and at least one checklist row`);
    result.push({name,label:label(name),cards:[...rows].sort((a,b)=>a[0]-b[0]).map(r=>r[1])});
  }
  if(!result.length)throw Error('no visible worksheets');
  return result;
}
