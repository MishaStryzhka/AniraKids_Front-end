import {useEffect,useRef,useState} from 'react';
import {Button} from '../../design-system/components/Button';
import {Copy,Stack} from '../storefrontStyles';
import {createRevolutOrder,syncRevolutPayment,type Receipt,type ReservationPaymentAccess,type RevolutConfig} from '../api/publicApi';
import {preserveGuestReservationLink} from '../booking/guestReservationLinks';
import {routes} from '../../navigation/routes';

export function RevolutPayment({number,access,kind,config,canPay,onReceipt,onClose}:{
  number:string;access:ReservationPaymentAccess;kind:'advance'|'full';config:RevolutConfig|null;canPay:boolean;
  onReceipt:(receipt:Receipt)=>void;onClose:()=>void;
}) {
  const target=useRef<HTMLDivElement>(null);
  const callbacks=useRef({onReceipt,onClose});callbacks.current={onReceipt,onClose};
  const [message,setMessage]=useState('Připravujeme bezpečnou platbu…');
  const [busy,setBusy]=useState(false);
  const [preparing,setPreparing]=useState(Boolean(config && canPay));
  const action=useRef(false);
  const generation=useRef(0);
  const syncRef=useRef<(cancel?:boolean)=>Promise<void>>(async()=>{});
  syncRef.current=async(cancel=false)=>{
    if(action.current)return;
    action.current=true;setBusy(true);
    const current=generation.current;
    try {
      const receipt=await syncRevolutPayment(number,access,cancel);
      if(current!==generation.current)return;
      callbacks.current.onReceipt(receipt);
      if(!receipt.payment?.cardPayment?.active)callbacks.current.onClose();
      else setMessage('Platba zatím není dokončena. Pokud jste platbu potvrdili, peníze znovu neposílejte a aktualizujte stav.');
    }catch {if(current===generation.current)setMessage('Stav platby se nepodařilo ověřit. Peníze znovu neposílejte. Zkuste aktualizovat stav nebo nás kontaktujte.');}
    finally{action.current=false;if(current===generation.current)setBusy(false);}
  };
  const accessKind=access.kind,accessToken=access.token;
  useEffect(()=>{
    const version=generation.current;
    const paymentAccess={kind:accessKind,token:accessToken};
    let live=true;
    let widget:{destroy:()=>void}|undefined;
    const controller=new AbortController();
    const initialise=async()=>{
      if(!config || !canPay){setPreparing(false);setMessage('Ověřte stav rozpracované platby.');return;}
      setPreparing(true);
      try {
        // Persist guest access locally, never send the capability to Revolut.
        if(accessKind==='guest')preserveGuestReservationLink({reservationNumber:number,guestAccessToken:accessToken} as Receipt);
        const returnUrl=window.location.origin+(accessKind==='guest'?routes.reservationStatus+'?paymentReservation='+encodeURIComponent(number):routes.accountReservations);
        const {default:RevolutCheckout}=await import('@revolut/checkout');
        if(!live)return;
        // Prepare before the wallet button tap so Apple Pay retains user activation.
        const order=await createRevolutOrder(number,paymentAccess,kind,controller.signal);
        if(!live || !target.current)return;
        const options={publicToken:config.publicKey,mode:config.mode,locale:'cs',target:target.current,
          createOrder:async()=>order,
          revolutPayOptions:{mobileRedirectUrls:{success:returnUrl,failure:returnUrl,cancel:returnUrl}},
          onSuccess:()=>{if(live)void syncRef.current();},
          onCancel:()=>{if(live)void syncRef.current();},
          onError:()=>{if(live)void syncRef.current();},
        };
        widget=await RevolutCheckout.embeddedCheckout(options);
        if(!live)widget.destroy();else setMessage('Vyberte způsob platby. Dostupné peněženky se zobrazí podle vašeho zařízení.');
      }catch{if(live)setMessage('Platební formulář se nepodařilo připravit. Nejprve ověřte stav platby. Před změnou způsobu platby zrušte rozpracovanou platbu.');}
      finally{if(live)setPreparing(false);}
    };
    void initialise();
    return ()=>{live=false;generation.current=version+1;controller.abort();widget?.destroy();};
  },[number,accessKind,accessToken,kind,config,canPay]);
  return <Stack>
    <Copy role="status">{message}</Copy>
    <div ref={target} style={{width:'100%',minWidth:0}} />
    <Copy>Údaje karty zpracovává Revolut. Přijetí platby ověříme automaticky; rezervaci potvrdí AniraKids ručně.</Copy>
    <Button disabled={busy || preparing} onClick={()=>void syncRef.current()}>Ověřit platbu</Button>
    <Button variant="secondary" disabled={busy || preparing} onClick={()=>void syncRef.current(true)}>Zrušit rozpracovanou platbu a změnit způsob</Button>
  </Stack>;
}
