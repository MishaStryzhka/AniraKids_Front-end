import {useEffect,useState} from 'react';
import {Dialog} from '../../design-system/components/Dialog';
import {Button} from '../../design-system/components/Button';
import {NewReservation,NewFitting} from '../../partner/BookingForms';
import {useAuth} from '../../hooks/useAuth';
import {adminBookingApi} from './adminBookingApi';
export function AdminBookingDialog({kind,onClose,onCreated}:{kind:'reservation'|'fitting';onClose:()=>void;onCreated:(result:any)=>void}){
 const {token,user}=useAuth();
 const [busy,setBusy]=useState(false),[catalogue,setCatalogue]=useState<any[]|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{if(kind!=='reservation')return;const c=new AbortController();setError('');adminBookingApi('catalogue',token||'',undefined,undefined,c.signal).then(v=>{if(!c.signal.aborted)setCatalogue(v.items);}).catch(e=>{if(!c.signal.aborted)setError(e.message);});return()=>c.abort();},[token,kind,retry]);
 return <Dialog open title={kind==='reservation'?'Nová rezervace':'Nová zkouška'} onEscape={()=>!busy&&onClose()}>
 {error?<p role="alert">{error} <Button onClick={()=>setRetry(v=>v+1)}>Zkusit znovu</Button></p>:null}
 {kind==='reservation'?(catalogue?<NewReservation scope="admin" catalogue={catalogue} token={token} userId={user?._id} onDone={onCreated} onBusyChange={setBusy}/>:!error?<p role="status">Načítání produktů…</p>:null):<NewFitting scope="admin" token={token} userId={user?._id} onDone={onCreated} onBusyChange={setBusy}/>}
 <Button variant="secondary" disabled={busy} onClick={onClose}>Zavřít</Button>
 </Dialog>;
}
