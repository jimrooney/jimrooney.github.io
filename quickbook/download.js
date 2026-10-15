import {readWorkbook} from './sheet.js';
import {toCsv} from './model.js';
// Called only by the Update button. The spreadsheet is link-viewable, so no credentials are sent.
export const SHEET_URL='https://docs.google.com/spreadsheets/d/1g1Tv00WUTINVBoXSttWyR8v9uLf4Tw4b3MaL-ziFewI/export?format=xlsx';
const MAX_BYTES=2*1024*1024;
export async function downloadCsv(signal){
  let bytes;
  try{
    const response=await fetch(SHEET_URL,{signal,credentials:'omit',cache:'no-store'});
    if(!response.ok)throw Object.assign(Error(`Google Sheets returned HTTP ${response.status}`),{reported:true});
    bytes=new Uint8Array(await response.arrayBuffer());
  }catch(error){throw error.reported?error:Error('no connection to Google Sheets');}
  if(bytes.length>MAX_BYTES)throw Error('spreadsheet download is too large');
  return toCsv(await readWorkbook(bytes));
}
