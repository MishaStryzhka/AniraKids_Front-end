import {useCallback,useEffect,useRef,useState} from 'react';
import {Button} from '../../design-system/components/Button';
import {SelectField} from '../../design-system/components/SelectField';
import {fittingAdmin,fittingDateLabel,fittingError} from '../../fittings/fittingApi';
import type {ReservationMutationLock} from '../payments/paymentModel';
import {ReservationPanel,ReservationHeading,ReservationCopy,ReservationActions} from '../reservations/reservationStyles';

type Options={eligible:boolean;applied:{number:string;amount:number;kind:'discount'|'legacy_credit'}|null;items:Array<{id:string;number:string;date:string;time:string;revision:number}>};
export function ReservationFittingDiscount({token,reservationId,reservationNumber,version,blocked,mutationLock,onBusy,onSaved,onAccessError}:{
 token:string;reservationId:string;reservationNumber:string;version:string;blocked:boolean;mutationLock:ReservationMutationLock;
 onBusy:(busy:boolean)=>void;onSaved:()=>Promise<unknown>;onAccessError:(error:any)=>unknown;
}){
 const [data,setData]=useState<Options|null>(null),[selected,setSelected]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[refresh,setRefresh]=useState(0);
 const active=useRef(true),working=useRef(false),callbacks=useRef({onBusy,onSaved,onAccessError});callbacks.current={onBusy,onSaved,onAccessError};
 useEffect(()=>{active.current=true;return()=>{active.current=false;if(mutationLock.current==='discount')mutationLock.current=null;};},[mutationLock]);
 useEffect(()=>{const controller=new AbortController();setLoading(true);setData(null);setSelected('');
 fittingAdmin<Options>(token,`/admin/reservations/${reservationId}/fitting-discount`,undefined,controller.signal).then(value=>{if(!controller.signal.aborted){setData(value);setSelected(value.items[0]?.id||'');}}).catch(e=>{if(!controller.signal.aborted){callbacks.current.onAccessError(e);setError(fittingError(e));}}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();
 },[token,reservationId,version,refresh]);
 const apply=useCallback(async()=>{const item=data?.items.find(x=>x.id===selected);if(!item||blocked||loading||working.current||mutationLock.current)return;
 working.current=true;mutationLock.current='discount';setBusy(true);callbacks.current.onBusy(true);setError('');setNotice('');
 try{await fittingAdmin(token,`/admin/fittings/${item.id}/actions`,{action:'credit',revision:item.revision,reservationNumber});if(active.current)setNotice('Platba 200 Kč byla započtena jako záloha.');}
 catch(e){if(active.current){callbacks.current.onAccessError(e);setError(fittingError(e));}}
 finally{if(mutationLock.current==='discount')mutationLock.current=null;try{if(active.current)await callbacks.current.onSaved();}finally{working.current=false;if(mutationLock.current==='discount')mutationLock.current=null;if(active.current){setBusy(false);callbacks.current.onBusy(false);setRefresh(x=>x+1);}}}
 },[data,selected,blocked,loading,mutationLock,token,reservationNumber]);
 return <ReservationPanel><ReservationHeading>Započtení platby za zkoušku</ReservationHeading>
 {loading?<ReservationCopy role="status">Načítání zkoušek klienta…</ReservationCopy>:null}
 {data?.applied?<ReservationCopy>{data.applied.kind==='discount'?'Započtená platba 200 Kč':'Dřívější započtení platby 200 Kč'} · {data.applied.number}. {data.applied.kind==='discount'?'Platba za zkoušku pokrývá rezervační zálohu. Klient ji znovu neplatí.':'Původní platební záznam zůstává zachován.'}</ReservationCopy>:data?.eligible?<>
 {data.items.length?<><SelectField label="Zaplacená a dokončená zkouška" value={selected} disabled={busy||blocked} onChange={e=>setSelected(e.target.value)}>{data.items.map(f=><option key={f.id} value={f.id}>{fittingDateLabel(f.date)} · {f.time} · {f.number}</option>)}</SelectField><ReservationCopy>Platba za zkoušku pokryje rezervační zálohu a sníží zbývající doplatek o 200 Kč. Nejde o novou platbu. Vratná kauce se nemění. Každou zkoušku lze využít jednou. U již uhrazeného pronájmu vznikne přeplatek; vratku zaznamenejte samostatně v platbách.</ReservationCopy><Button disabled={busy||blocked||loading||!selected} onClick={()=>void apply()}>{busy?'Ukládání…':'Započíst platbu'}</Button></>:<ReservationCopy>Klient nemá dostupnou zaplacenou a dokončenou zkoušku. Zkouška musí mít shodný e-mail a nesmí být použita u jiné rezervace.</ReservationCopy>}
 </>:data?<ReservationCopy>Platbu lze započíst u otevřené rezervace, pokud cena pronájmu dosahuje alespoň 200 Kč a platby jsou ověřené.</ReservationCopy>:null}
 {error?<ReservationCopy role="alert">{error}</ReservationCopy>:null}{notice?<ReservationCopy role="status">{notice}</ReservationCopy>:null}
 <ReservationActions><Button variant="secondary" disabled={busy||loading||blocked} onClick={()=>setRefresh(x=>x+1)}>Obnovit zkoušky</Button></ReservationActions>
 </ReservationPanel>;
}
