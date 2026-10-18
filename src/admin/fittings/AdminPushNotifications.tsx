import {useEffect, useState} from 'react';
import {Bell} from 'lucide-react';
import styled from 'styled-components';
import {Button} from '../../design-system/components/Button';
import {CheckboxField} from '../../design-system/components/CheckboxField';
import {designTokens as t} from '../../design-system/tokens/designTokens';
import {fittingAdmin} from '../../fittings/fittingApi';

const Region = styled.div`
  display:flex;flex-wrap:wrap;align-items:center;gap:${t.space[3]};min-width:0;
  padding:${t.space[3]};border:1px solid ${t.color.border.subtle};
  border-radius:${t.radius[2]};background:${t.color.bg.surface};
`;
const Copy = styled.p`margin:0;color:${t.color.text.secondary};font-size:14px;line-height:20px;flex:1 1 240px;`;
const Topics = styled.div`inline-size:100%;display:grid;gap:${t.space[2]};padding-block-start:${t.space[3]};border-block-start:1px solid ${t.color.border.subtle};`;
const Detail = styled.p`margin:0;color:${t.color.text.secondary};font-size:14px;line-height:20px;`;
const TopicName = styled.strong`font-size:15px;`;
const topicOptions = [
  {id:'fitting_created',label:'Nová rezervace zkoušky'},
  {id:'fitting_payment_reported',label:'Klient oznámil odeslání platby za zkoušku'},
];
const defaultTopics = topicOptions.map(topic=>topic.id);
type PushPreferences = {subscribed:boolean;topics:string[]};
type PushConfig = {enabled:boolean;publicKey:string};
type State = 'loading'|'off'|'on'|'unsupported'|'unconfigured'|'denied'|'error';

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
  const [topics,setTopics]=useState<string[]>(defaultTopics);
  const [revision,setRevision]=useState(0);
  useEffect(()=>{
    if(!token)return;
    let mounted=true;
    setState('loading');setError('');
    if(!supported()){setState('unsupported');return;}
    if(Notification.permission==='denied'){setState('denied');return;}
    fittingAdmin<PushConfig>(token,'/admin/push/config').then(async result=>{
      if(!mounted)return;
      setConfig(result);
      if(!result.enabled){setState('unconfigured');return;}
      const registration=await navigator.serviceWorker.getRegistration('/admin-push-sw.js');
      // Check for the worker that understands event types, without prompting for permission.
      if(registration)await navigator.serviceWorker.register('/admin-push-sw.js');
      const subscription=await registration?.pushManager.getSubscription();
      if(!mounted)return;
      if(!subscription){setTopics(defaultTopics);setState('off');return;}
      const prefs=await fittingAdmin<PushPreferences>(token,'/admin/push/preferences',{endpoint:subscription.endpoint});
      if(!mounted)return;
      setTopics(prefs.subscribed ? prefs.topics : defaultTopics);
      setState(prefs.subscribed ? 'on' : 'off');
    }).catch(()=>{if(mounted)setState('error');});
    return()=>{mounted=false;};
  },[token,revision]);

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
      await fittingAdmin(token,'/admin/push/subscribe',{endpoint:subscription.endpoint,keys:subscription.toJSON().keys,topics});
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

  async function setTopic(topicId:string,enabled:boolean){
    if(busy)return;
    const next=topicOptions.map(topic=>topic.id).filter(id=>id===topicId?enabled:topics.includes(id));
    if(state!=='on'){setTopics(next);return;}
    setBusy(true);setError('');
    try{
      const registration=await navigator.serviceWorker.getRegistration('/admin-push-sw.js');
      const subscription=await registration?.pushManager.getSubscription();
      if(!subscription)throw new Error('PUSH_SUBSCRIPTION_MISSING');
      await fittingAdmin(token,'/admin/push/subscribe',{endpoint:subscription.endpoint,keys:subscription.toJSON().keys,topics:next});
      setTopics(next);
    }catch{setError('Změnu odběru se nepodařilo uložit. Původní nastavení zůstalo zachované.');}
    finally{setBusy(false);}
  }

  return <Region aria-label="Odběry upozornění na tomto zařízení">
    <Bell size={20} aria-hidden="true" color={t.color.text.brand}/>
    <Copy role="status">
      {state==='loading'?'Načítání upozornění…':
       state==='on'?'Push je zapnutý pro tento prohlížeč. Vyberte, které události chcete odebírat.':
       state==='unsupported'?'Prohlížeč nepodporuje push. Na iPhonu přidejte ANIRAK na plochu a otevřete jej z ikony.':
       state==='denied'?'Upozornění jsou zakázaná v nastavení prohlížeče.':
       state==='unconfigured'?'Push upozornění čekají na aktivaci serveru.':
       state==='error'?'Odběry se nepodařilo načíst. Zkontrolujte připojení a zkuste to znovu.':
       'Zapněte push pro toto zařízení. Potom vyberte, které události chcete odebírat.'}
      {error?' '+error:''}
    </Copy>
    {state==='error'?<Button variant="secondary" onClick={()=>setRevision(value=>value+1)}>Zkusit znovu</Button>:null}
    {state==='off'?<Button variant="secondary" disabled={busy||topics.length===0} onClick={()=>void enable()}>
      {busy?'Zapínání…':'Zapnout upozornění'}
    </Button>:null}
    {state==='on'?<Button variant="secondary" disabled={busy} onClick={()=>void disable()}>
      {busy?'Vypínání…':'Vypnout upozornění'}
    </Button>:null}
    <Topics role="group" aria-label="Typy upozornění">
      <TopicName>Zkoušky</TopicName>
      {topicOptions.map(topic=><CheckboxField key={topic.id} label={topic.label}
        checked={topics.includes(topic.id)} disabled={busy||!['on','off'].includes(state)}
        onChange={event=>{void setTopic(topic.id,event.target.checked);}}/>)}
      <Detail>Upozornění otevře seznam zkoušek. Oznámení o odeslání platby není potvrzením jejího přijetí — ověřte připsání 200 Kč.
      Každý prohlížeč má vlastní odběry.</Detail>
    </Topics>
  </Region>;
}
