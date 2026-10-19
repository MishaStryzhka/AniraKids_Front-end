import {useRef,useState} from 'react';
import {useAuth} from '../hooks/useAuth';
import {fittingApi} from './fittingApi';
import {Button} from '../design-system/components/Button';
import {Actions,Copy,Panel} from '../storefront/storefrontStyles';

export function FittingAccountClaim({number,privateToken}:{number:string;privateToken:string}){
 const {token,isLoggedIn,isRefreshing}=useAuth();
 // Remount account-specific state when the session changes.
 return isLoggedIn&&!isRefreshing&&token?<Claim key={token+number+privateToken} number={number} privateToken={privateToken} token={token}/>:null;
}
function Claim({number,privateToken,token}:{number:string;privateToken:string;token:string}){
 const [state,setState]=useState<'idle'|'busy'|'done'|'error'>('idle');
 const lock=useRef(false);
 async function claim(){
  if(lock.current)return;lock.current=true;setState('busy');
  try{await fittingApi('/account/fittings/'+number+'/claim',{method:'POST',token,body:{token:privateToken}});setState('done');}
  catch{setState('error');}finally{lock.current=false;}
 }
 return <Panel><Copy>{state==='done'?'Zkouška je uložená ve vašem účtu.':'Chcete mít tuto zkoušku v přehledu svých rezervací?'}</Copy>
 {state==='error'?<Copy role="alert">Zkoušku se nepodařilo připojit. Ověřte přihlášení a celý soukromý odkaz. Zápis připojený k jinému účtu nelze převzít.</Copy>:null}
 <Actions>{state!=='done'?<Button disabled={state==='busy'} onClick={()=>void claim()}>Připojit k účtu</Button>:null}</Actions></Panel>;
}
