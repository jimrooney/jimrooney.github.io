// Wait briefly to distinguish a tap from a double tap without advancing first.
export function checklistTaps(forward,backward,clock=globalThis){
  let pending=null;
  function cancel(){if(pending!==null){clock.clearTimeout(pending);pending=null;}}
  function tap(){
    if(pending!==null){cancel();backward();return;}
    pending=clock.setTimeout(()=>{pending=null;forward();},320);
  }
  return {tap,cancel};
}
