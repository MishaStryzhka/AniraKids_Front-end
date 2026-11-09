import styled from 'styled-components';
import {useEffect,useRef,useState} from 'react';
import {Button} from '../../design-system/components/Button';
import {Copy,Stack} from '../storefrontStyles';
import {createRevolutOrder,syncRevolutPayment,type Receipt,type ReservationPaymentAccess,type RevolutConfig} from '../api/publicApi';
import {preserveGuestReservationLink} from '../booking/guestReservationLinks';
import {routes} from '../../navigation/routes';

// Keep the provider iframe's intrinsic width out of the surrounding grid.
const PaymentStack = styled(Stack)`
  grid-template-columns: minmax(0, 1fr);
`;
const CheckoutHost = styled.div`
  inline-size: 100%;
  min-inline-size: 0;
  max-inline-size: 100%;
  contain: inline-size;
  // Revolut sets min-width:400px inline. Override only this embedded iframe;
  // leave its dynamic height and the provider's body-level auth popups intact.
  iframe {
    display: block;
    box-sizing: border-box;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }
`;
export interface CheckoutAdapter<T> {
 identity:string;
 create:(signal:AbortSignal)=>Promise<{publicId:string}>;
 sync:(cancel:boolean)=>Promise<T>;
 active:(result:T)=>boolean;
 returnUrl:string;
}
export function RevolutPayment({number,access,kind,config,canPay,onReceipt,onClose}:{
 number:string;access:ReservationPaymentAccess;kind:'advance'|'full';config:RevolutConfig|null;canPay:boolean;
 onReceipt:(receipt:Receipt)=>void;onClose:()=>void;
}) {
 const adapter:CheckoutAdapter<Receipt>={
  identity:JSON.stringify([number,access.kind,access.token,kind]),
  create:signal=>{if(access.kind==='guest')preserveGuestReservationLink({reservationNumber:number,guestAccessToken:access.token} as Receipt);return createRevolutOrder(number,access,kind,signal);},
  sync:cancel=>syncRevolutPayment(number,access,cancel),
  active:r=>Boolean(r.payment?.cardPayment?.active),
  returnUrl:window.location.origin+(access.kind==='guest'?routes.reservationStatus+'?paymentReservation='+encodeURIComponent(number):routes.accountReservations),
 };
 return <EmbeddedRevolutPayment adapter={adapter} config={config} canPay={canPay} onReceipt={onReceipt} onClose={onClose}/>;
}
export function EmbeddedRevolutPayment<T>({adapter,config,canPay,onReceipt,onClose}:{adapter:CheckoutAdapter<T>;config:RevolutConfig|null;canPay:boolean;onReceipt:(receipt:T)=>void;onClose:()=>void;}) {
 const adapterRef=useRef(adapter);adapterRef.current=adapter;
  const target=useRef<HTMLDivElement>(null);
  const callbacks=useRef({onReceipt,onClose});callbacks.current={onReceipt,onClose};
  const [message,setMessage]=useState('Připravujeme bezpečnou platbu…');
  const [busy,setBusy]=useState(false);
  const [checkoutError,setCheckoutError]=useState<string|null>(null);
  const [preparing,setPreparing]=useState(Boolean(config && canPay));
  const action=useRef(false);
  const generation=useRef(0);
  const syncRef=useRef<(cancel?:boolean)=>Promise<void>>(async()=>{});
  syncRef.current=async(cancel=false)=>{
    if(action.current)return;
    action.current=true;setBusy(true);
    const current=generation.current;
    try {
      const receipt=await adapterRef.current.sync(cancel);
      if(current!==generation.current)return;
      callbacks.current.onReceipt(receipt);
      if(!adapterRef.current.active(receipt))callbacks.current.onClose();
      else setMessage('Platba zatím není dokončena. Pokud jste platbu potvrdili, peníze znovu neposílejte a aktualizujte stav.');
    }catch {if(current===generation.current)setMessage('Stav platby se nepodařilo ověřit. Peníze znovu neposílejte. Zkuste aktualizovat stav nebo nás kontaktujte.');}
    finally{action.current=false;if(current===generation.current)setBusy(false);}
  };
  const identity=adapter.identity;
  useEffect(()=>{
    const version=generation.current;
    const paymentAdapter=adapterRef.current;
    let live=true;
    let widget:{destroy:()=>void}|undefined;
    const controller=new AbortController();
    const initialise=async()=>{
      if(!config || !canPay){setPreparing(false);setMessage('Ověřte stav rozpracované platby.');return;}
      setPreparing(true);setCheckoutError(null);
      try {
        const returnUrl=paymentAdapter.returnUrl;
        const {default:RevolutCheckout}=await import('@revolut/checkout');
        if(!live)return;
        // Prepare before the wallet button tap so Apple Pay retains user activation.
        const order=await paymentAdapter.create(controller.signal);
        if(!live || !target.current)return;
        const options={publicToken:config.publicKey,mode:config.mode,locale:'cs',target:target.current,
          createOrder:async()=>order,
          revolutPayOptions:{mobileRedirectUrls:{success:returnUrl,failure:returnUrl,cancel:returnUrl}},
          onSuccess:()=>{if(live){setCheckoutError(null);void syncRef.current();}},
          onCancel:()=>{if(live)void syncRef.current();},
          onError:({error}:{error:{type?:unknown;code?:unknown}})=>{if(live){
            const type=typeof error?.type==='string' && /^error\.[a-z-]{1,64}$/.test(error.type)?error.type:'error.unknown';
            const code=typeof error?.code==='number' && Number.isSafeInteger(error.code)?` (${error.code})`:'';
            setCheckoutError(type+code);void syncRef.current();
          }},
        };
        widget=await RevolutCheckout.embeddedCheckout(options);
        if(!live)widget.destroy();else setMessage('Vyberte způsob platby. Dostupné peněženky se zobrazí podle vašeho zařízení.');
      }catch{if(live)setMessage('Platební formulář se nepodařilo připravit. Nejprve ověřte stav platby. Před změnou způsobu platby zrušte rozpracovanou platbu.');}
      finally{if(live)setPreparing(false);}
    };
    void initialise();
    return ()=>{live=false;generation.current=version+1;controller.abort();widget?.destroy();};
  },[identity,config,canPay]);
  return <PaymentStack>
    <Copy role="status">{message}</Copy>
    <CheckoutHost ref={target} />
    {checkoutError && <div role="alert">
      <Copy>Platební brána oznámila chybu. Nejprve ověřte stav platby tlačítkem níže.</Copy>
      <details><summary>Podrobnosti pro podporu</summary><Copy>{checkoutError}</Copy></details>
    </div>}
    <Copy>Údaje karty zpracovává Revolut. Po ověření platby automaticky potvrdíme platnou rezervaci, pokud je termín stále dostupný. Případnou výjimku s vámi vyřešíme osobně.</Copy>
    <Button disabled={busy || preparing} onClick={()=>void syncRef.current()}>Ověřit platbu</Button>
    <Button variant="secondary" disabled={busy || preparing} onClick={()=>void syncRef.current(true)}>Zrušit rozpracovanou platbu a změnit způsob</Button>
  </PaymentStack>;
}
