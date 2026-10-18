import {useEffect, useState} from 'react';
import {Bell} from 'lucide-react';
import styled from 'styled-components';
import {Button} from '../../design-system/components/Button';
import {designTokens as t} from '../../design-system/tokens/designTokens';
import {fittingAdmin} from '../../fittings/fittingApi';

const Region = styled.div`
  display:flex;flex-wrap:wrap;align-items:center;gap:${t.space[3]};min-width:0;
  padding:${t.space[3]};border:1px solid ${t.color.border.subtle};
  border-radius:${t.radius[2]};background:${t.color.bg.surface};
`;
const Copy = styled.p`margin:0;color:${t.color.text.secondary};font-size:14px;line-height:20px;flex:1 1 240px;`;
type PushConfig = {enabled:boolean;publicKey:string};
type State = 'loading'|'off'|'on'|'unsupported'|'unconfigured'|'denied';

const supported = () =>
  typeof window !== 'undefined' &&
  'Notification' in window &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  window.isSecureContext;

function decodePublicKey(key:string): Uint8Array {
  const padded = key.replace(/-/g,'+').replace(/_/g,'/') + '='.repeat((4-key.length%4)%4);
  return Uint8Array.from(atob(padded), character=>character.charCodeAt(0));
}

export function AdminPushNotifications({token}:{token:string}) {
  const [config,setConfig]=useState<PushConfig|null>(null);
  const [state,setState]=useState<State>('loading');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    if(!token)return;
    let mounted=true;
    if(!supported()){setState('unsupported');return;}
    if(Notification.permission==='denied'){setState('denied');return;}
    fittingAdmin<PushConfig>(token,'/admin/push/config').then(async result=>{
      if(!mounted)return;
      setConfig(result);
      if(!result.enabled){setState('unconfigured');return;}
      const registration=await navigator.serviceWorker.getRegistration('/admin-push-sw.js');
      const subscription=await registration?.pushManager.getSubscription();
      if(mounted)setState(subscription?'on':'off');
    }).catch(()=>{if(mounted)setState('unconfigured');});
    return()=>{mounted=false;};
  },[token]);

  async function enable(){
    if(!supported()||!config?.enabled||busy)return;
    setError('');
    setBusy(true);
    try {
      // Must happen on the direct user gesture; never request permission on page load.
      const permission=await Notification.requestPermission();
      if(permission!=='granted'){setState(permission==='denied'?'denied':'off');return;}
      const registration=await navigator.serviceWorker.register('/admin-push-sw.js');
      let subscription=await registration.pushManager.getSubscription();
      if(!subscription){
        subscription=await registration.pushManager.subscribe({
          userVisibleOnly:true,applicationServerKey:decodePublicKey(config.publicKey),
        });
      }
      await fittingAdmin(token,'/admin/push/subscribe',{endpoint:subscription.endpoint});
      setState('on');
    }catch{
      setError('Upozornění se nepodařilo zapnout. Zkuste to znovu.');
    }finally{setBusy(false);}
  }

  async function disable(){
    if(busy)return;
    setError('');
    setBusy(true);
    try {
      const registration=await navigator.serviceWorker.getRegistration('/admin-push-sw.js');
      const subscription=await registration?.pushManager.getSubscription();
      if(subscription){
        await fittingAdmin(token,'/admin/push/unsubscribe',{endpoint:subscription.endpoint});
        await subscription.unsubscribe();
      }
      setState('off');
    }catch{setError('Upozornění se nepodařilo vypnout. Zkuste to znovu.');}
    finally{setBusy(false);}
  }

  return <Region aria-label="Push upozornění na platby za zkoušky">
    <Bell size={20} aria-hidden="true" color={t.color.text.brand}/>
    <Copy role="status">
      {state==='loading'?'Načítání upozornění…':
       state==='on'?'Upozornění na nahlášené platby jsou zapnutá pro tento prohlížeč.':
       state==='unsupported'?'Prohlížeč nepodporuje push. Na iPhonu přidejte ANIRAK na plochu a otevřete jej z ikony.':
       state==='denied'?'Upozornění jsou zakázaná v nastavení prohlížeče.':
       state==='unconfigured'?'Push upozornění čekají na aktivaci serveru.':
       'Dostávejte upozornění, když klient označí platbu za zkoušku jako odeslanou.'}
      {error?' '+error:''}
    </Copy>
    {state==='off'?<Button variant="secondary" disabled={busy} onClick={()=>void enable()}>
      {busy?'Zapínání…':'Zapnout upozornění'}
    </Button>:null}
    {state==='on'?<Button variant="secondary" disabled={busy} onClick={()=>void disable()}>
      {busy?'Vypínání…':'Vypnout upozornění'}
    </Button>:null}
  </Region>;
}
