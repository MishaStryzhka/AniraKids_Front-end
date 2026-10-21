import {useEffect,useLayoutEffect,useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {publicApiBase} from '../storefront/api/publicApi';
import {Button} from '../design-system/components/Button';
import {SelectField} from '../design-system/components/SelectField';
import {Copy,Panel,Stack,Heading} from '../storefront/storefrontStyles';
import {validFittingDiscount,type FittingDiscountSelection} from './fittingDiscountModel';
export type {FittingDiscountSelection} from './fittingDiscountModel';
const fittingDateLabel=(date:string)=>new Date(date+'T12:00:00Z').toLocaleDateString('cs-CZ',{timeZone:'UTC'});
const KEY='anirak.fitting-discount.v1';
function savedLink():FittingDiscountSelection|undefined {try{const d=JSON.parse(sessionStorage.getItem(KEY)||'null');if(validFittingDiscount(d)&&d.token)return d;}catch{}return undefined;}
export function FittingDiscountCapture(){
 const location=useLocation(),navigate=useNavigate();
 useLayoutEffect(()=>{const q=new URLSearchParams(location.hash.slice(1)),d={number:q.get('fitting'),token:q.get('token')};if(!validFittingDiscount(d)||!d.token)return;
 try{sessionStorage.setItem(KEY,JSON.stringify(d));}catch{}
 navigate({pathname:location.pathname,search:location.search,hash:''},{replace:true,state:location.state});
 },[location,navigate]);return null;
}
export function FittingDiscountPicker({token,disabled,total,selected,onChange}:{token?:string;disabled:boolean;total:number;selected:FittingDiscountSelection|undefined;onChange:(value:FittingDiscountSelection|undefined)=>void}){
 const [link]=useState(savedLink),[items,setItems]=useState<Array<{number:string;date:string;time:string}>>([]),[choice,setChoice]=useState(''),[loading,setLoading]=useState(false),[error,setError]=useState(false),[refresh,setRefresh]=useState(0);
 useEffect(()=>{onChange(undefined);setItems([]);setChoice('');if(!token&&!link)return;const c=new AbortController();setLoading(true);setError(false);
 const read=async(selection?:FittingDiscountSelection):Promise<{items:Array<{number:string;date:string;time:string}>}>=>{const response=await fetch(publicApiBase()+'/fitting-discounts/options',{method:'POST',body:JSON.stringify(selection?{selection}:{}),headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},credentials:'omit',cache:'no-store',signal:c.signal});if(!response.ok)throw new Error('Discount unavailable');const data=await response.json();if(!Array.isArray(data.items)||data.items.some((i:any)=>!validFittingDiscount({number:i.number})||typeof i.date!=='string'||typeof i.time!=='string'))throw new Error('Invalid discount response');return data;};
 Promise.all([token?read():Promise.resolve({items:[]}),link?read(link):Promise.resolve({items:[]})]).then(results=>{if(!c.signal.aborted){const merged=results.flatMap(r=>r.items).filter((v,i,a)=>a.findIndex(x=>x.number===v.number)===i);setItems(merged);setChoice(merged[0]?.number||'');}}).catch(()=>{if(!c.signal.aborted)setError(true);}).finally(()=>{if(!c.signal.aborted)setLoading(false);});return()=>c.abort();
 },[token,link,refresh,onChange]);
 useEffect(()=>{if(total<200&&selected)onChange(undefined);},[total,selected,onChange]);
 if(!token&&!link)return null;
 if(!loading&&!error&&!items.length&&!link)return null;
 return <Panel><Stack><Heading>Sleva za zkoušku</Heading>
 {loading?<Copy role="status">Ověřujeme platbu za zkoušku…</Copy>:error?<><Copy role="alert">Platbu za zkoušku se nepodařilo ověřit. Zkuste to znovu nebo nás kontaktujte, abychom propojení ověřili.</Copy><Button variant="secondary" disabled={disabled} onClick={()=>setRefresh(v=>v+1)}>Ověřit znovu</Button></>:items.length?<>
 <Copy>Po dokončené a zaplacené zkoušce můžete jednou uplatnit slevu 200 Kč na pronájem ve studiu Blaze. Použijte stejný kontaktní e-mail jako u zkoušky.</Copy>
 <SelectField label="Vyberte zkoušku" value={choice} disabled={disabled||!!selected} onChange={e=>setChoice(e.target.value)}>{items.map(i=><option key={i.number} value={i.number}>{fittingDateLabel(i.date)} · {i.number}</option>)}</SelectField>
 {selected?<><Copy role="status">Uplatněna sleva 200 Kč · {selected.number}</Copy><Button variant="secondary" disabled={disabled} onClick={()=>onChange(undefined)}>Odebrat slevu</Button></>:<Button disabled={disabled||total<200||!choice} onClick={()=>onChange(link?.number===choice?link:{number:choice})}>Uplatnit slevu</Button>}
 {total<200?<Copy>Platbu lze započíst při ceně pronájmu alespoň 200 Kč.</Copy>:null}
 </>:<Copy>Platbu z tohoto odkazu nyní nelze započíst. Zkouška musí být zaplacená, dokončená a nesmí být využita u jiné rezervace. Pokud potřebujete pomoc, kontaktujte nás.</Copy>}
 </Stack></Panel>;
}
