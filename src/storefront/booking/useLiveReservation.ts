import {useEffect,useRef} from 'react';

// Refresh only visible reservation screens; keep the latest callback without
// restarting the timer whenever the response or loading state changes.
export function useLiveReservation(key:string|null, refresh:()=>unknown, initial=true) {
 const latest=useRef(refresh);latest.current=refresh;
 useEffect(()=>{
  if(!key)return;
  const update=()=>{if(document.visibilityState!=='hidden')void latest.current();};
  if(initial)update();
  const timer=window.setInterval(update,30000);
  window.addEventListener('focus',update);
  document.addEventListener('visibilitychange',update);
  return()=>{window.clearInterval(timer);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update);};
 },[key,initial]);
}
