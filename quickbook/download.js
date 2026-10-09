export const SHEET='https://docs.google.com/spreadsheets/d/1g1Tv00WUTINVBoXSttWyR8v9uLf4Tw4b3MaL-ziFewI/export?format=csv&gid=452820701';
export async function downloadCsv(signal){
  const response=await fetch(SHEET,{signal,credentials:'omit',cache:'no-store'});
  if(!response.ok||!response.body)throw Error('Download failed');
  const reader=response.body.getReader(), chunks=[];let length=0;
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>524288){await reader.cancel();throw Error('Download too large');}chunks.push(value);}
  const bytes=new Uint8Array(length);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
}
