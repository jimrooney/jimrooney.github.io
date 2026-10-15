import {aircraftNames,parseCsv} from './model.js';

export const storageKey='quickbook-ipad-v2';
export const isNative=()=>Boolean(globalThis.Capacitor?.isNativePlatform());

export function decodeState(value){
  if(value===null)return null;
  const state=JSON.parse(value);
  parseCsv(state.csv);
  const p=state.position;
  if(!p||!Number.isInteger(p.aircraft)||p.aircraft<0||p.aircraft>=aircraftNames.length||
    !Number.isInteger(p.section)||p.section< -1||!Number.isInteger(p.item)||p.item<0)
    throw Error('Invalid saved position');
  return state;
}

// Serialize complete snapshots so rapid taps cannot let an older write win.
// A failed write is reported to its caller without poisoning later saves.
export function createStorage(backend,legacy){
  let pending=Promise.resolve();
  return {
    async load(){
      const value=await backend.get();
      if(value!==null)return decodeState(value);
      if(!legacy)return null;
      const old=await legacy.get();
      const state=decodeState(old);
      if(state)await backend.set(old);
      return state;
    },
    save(state){
      const value=JSON.stringify(state);
      decodeState(value);
      const write=pending.then(()=>backend.set(value));
      pending=write.catch(()=>{});
      return write;
    }
  };
}

export async function openStorage(){
  const browser={get:()=>localStorage.getItem(storageKey),set:value=>localStorage.setItem(storageKey,value)};
  if(!isNative())return createStorage(browser);
  const {Preferences}=await import('./native.js');
  return createStorage({
    get:async()=>(await Preferences.get({key:storageKey})).value,
    set:value=>Preferences.set({key:storageKey,value})
  },browser);
}
