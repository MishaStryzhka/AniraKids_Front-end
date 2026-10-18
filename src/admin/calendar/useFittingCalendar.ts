import {useEffect,useState} from 'react';
import {fittingAdmin,type AdminFitting} from '../../fittings/fittingApi';
import {calendarMonthRange} from './calendarDates';
interface State {key:string;token:string;items:AdminFitting[];loading:boolean;error:boolean;truncated:boolean;}
export function useFittingCalendar(month:string,token:string,revision:number,enabled:boolean){
 const key=month+':'+revision+':'+enabled;
 const [state,setState]=useState<State>({key,token,items:[],loading:enabled,error:false,truncated:false});
 useEffect(()=>{
  const c=new AbortController();
  setState({key,token,items:[],loading:enabled,error:false,truncated:false});
  if(enabled&&token){const range=calendarMonthRange(month);
   fittingAdmin<{items:AdminFitting[];truncated?:boolean}>(token,`/admin/fittings?from=${range.from}&to=${range.to}`,undefined,c.signal)
    .then(v=>{if(!c.signal.aborted)setState({key,token,items:v.items,loading:false,error:false,truncated:!!v.truncated});})
    .catch(()=>{if(!c.signal.aborted)setState({key,token,items:[],loading:false,error:true,truncated:false});});
  }
  return ()=>c.abort();
 },[key,token,month,enabled]);
 return state.key===key&&state.token===token?state:{key,token,items:[],loading:enabled,error:false,truncated:false};
}
