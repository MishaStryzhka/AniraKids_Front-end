import {useEffect,useRef,useState} from 'react';
import {Button} from '../design-system/components/Button';
import {Input} from '../design-system/components/Input';
import {Actions,Copy,Panel,RouteLink,Stack} from '../storefront/storefrontStyles';
import {fittingApi} from './fittingApi';

export function parseFittingLink(value:string){
 try{
  const url=new URL(value.trim());
  if(!['https://anirakids.cz','https://www.anirakids.cz',window.location.origin].includes(url.origin))return null;
  const match=/^\/zkouska\/(ZK-[A-F0-9]{12})\/?$/.exec(url.pathname);
  const token=url.hash.slice(1);
  return match&&/^[a-f0-9]{64}$/.test(token)?{number:match[1],token}:null;
 }catch{return null;}
}
export function FittingLinkRecovery({token,guestEmailAccess,onConnected}:{token:string;guestEmailAccess?:boolean;onConnected:()=>void}){
 const [link,setLink]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState(false);
 const locked=useRef(false),active=useRef(true);
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 async function connect(){
  if(locked.current)return;
  setError('');setDone(false);
  const parsed=parseFittingLink(link);
  if(!parsed){setError('Vložte celý soukromý odkaz na zkoušku včetně části za #.');return;}
  locked.current=true;setBusy(true);
  try{
   await fittingApi('/account/fittings/'+parsed.number+'/claim',{method:'POST',token,body:{token:parsed.token}});
   if(active.current){setLink('');setDone(true);onConnected();}
  }catch{if(active.current)setError('Zkoušku se nepodařilo připojit. Zkontrolujte celý odkaz. Zápis patřící jinému účtu nelze převzít.');}
  finally{locked.current=false;if(active.current)setBusy(false);}
 }
 return <Panel><details><summary style={{cursor:'pointer',padding:'10px 0',minHeight:44,boxSizing:'border-box'}}>Chybí zkouška vytvořená bez přihlášení?</summary><Stack>
 <Copy>{guestEmailAccess?'Zkoušky bez přiřazeného účtu zobrazujeme také podle vašeho ověřeného e-mailu. Soukromým odkazem můžete zkoušku trvale připojit k účtu.':'Pro zobrazení zkoušek vytvořených bez přihlášení ověřte svůj e-mail v profilu, nebo je připojte soukromým odkazem z potvrzovacího e-mailu.'}</Copy>
 {!guestEmailAccess?<Actions><RouteLink to="/ucet">Ověřit e-mail v profilu</RouteLink></Actions>:null}
 <form onSubmit={e=>{e.preventDefault();void connect();}}><Stack><Input label="Soukromý odkaz na zkoušku" type="url" autoComplete="off" value={link} disabled={busy} required onChange={e=>{setLink(e.target.value);setError('');setDone(false);}}/>
 <Actions><Button type="submit" disabled={busy||!link.trim()}>{busy?'Připojování…':'Připojit zkoušku'}</Button></Actions>
 {error?<Copy role="alert">{error}</Copy>:null}{done?<Copy role="status">Zkouška je připojena k vašemu účtu.</Copy>:null}</Stack></form>
 </Stack></details></Panel>;
}
