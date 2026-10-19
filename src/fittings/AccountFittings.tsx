import {useState} from 'react';
import {usePublicRead} from '../storefront/usePublicRead';
import {fittingApi,fittingDateLabel,fittingStatusLabels,type Fitting} from './fittingApi';
import {Button} from '../design-system/components/Button';
import {Actions,Copy,Heading,Panel,RouteLink,Stack} from '../storefront/storefrontStyles';

export function AccountFittings({token}:{token:string}){
 const [page,setPage]=useState(1);
 const result=usePublicRead(token+':fittings:'+page,signal=>fittingApi<{items:Fitting[];total:number}>('/account/fittings?page='+page,{token,signal}));
 return <section aria-label="Zkoušky"><Stack><Heading>Zkoušky</Heading>
 {result.loading?<Copy role="status">Načítáme zkoušky…</Copy>:result.error?<Panel><Copy role="alert">Zkoušky se nepodařilo načíst.</Copy><Button onClick={result.reload}>Načíst zkoušky znovu</Button></Panel>:result.data?<>
 {result.data.items.length===0?<Copy>Zatím zde nejsou žádné zkoušky.</Copy>:null}
 {result.data.items.map(item=><Panel key={item.number}><Heading>{fittingDateLabel(item.date)} · {item.time}</Heading><Copy>{item.number} · {fittingStatusLabels[item.status]}</Copy><Copy>30 minut · 200 Kč · {item.paymentStatus==='paid'?'Zaplaceno':item.paymentStatus==='refunded'?'Platba vrácena':'Nezaplaceno'}</Copy>{item.product?<Copy>{item.product.name}</Copy>:null}<Actions>{item.status==='completed'&&item.paymentStatus==='paid'?<RouteLink to="/saty">Vybrat oblečení a ověřit slevu 200 Kč</RouteLink>:null}<RouteLink to={'/zkouska/'+item.number}>Platby a podrobnosti zkoušky</RouteLink></Actions></Panel>)}
 {result.data.total>20||page>1?<Actions aria-label="Stránkování zkoušek"><Button disabled={page===1} onClick={()=>setPage(p=>p-1)}>Předchozí zkoušky</Button><Copy>Strana {page}</Copy><Button disabled={page*20>=result.data.total} onClick={()=>setPage(p=>p+1)}>Další zkoušky</Button></Actions>:null}
 </>:null}</Stack></section>;
}
