import {useEffect, useRef, useState} from 'react';
import {useBlocker} from 'react-router-dom';
import styled from 'styled-components';
import {Eye, Users, Shirt} from 'lucide-react';
import {useAuth} from '../../hooks/useAuth';
import {useAdminAccess} from '../auth/AdminAccessBoundary';
import {getAdminSettings, saveAdminSettings} from '../api/settings';
import type {SiteSections} from '../../siteSettings/siteSettings';
import {Button} from '../../design-system/components/Button';
import {CheckboxField} from '../../design-system/components/CheckboxField';
import {Dialog} from '../../design-system/components/Dialog';
import {designTokens as t} from '../../design-system/tokens/designTokens';

const Page = styled.div`max-width:840px;display:grid;gap:24px;min-width:0;`;
const Card = styled.section`border:1px solid ${t.color.border.subtle};border-radius:12px;background:${t.color.bg.surface};padding:24px;min-width:0;h2{margin:0;font-size:20px;display:flex;align-items:center;gap:10px;}@media(max-width:767px){padding:16px;}`;
const Copy = styled.p`margin:10px 0 0;color:${t.color.text.secondary};font-size:14px;line-height:1.65;`;
const Fieldset = styled.fieldset`border:0;padding:0;margin:16px 0 0;min-width:0;`;
const Row = styled.div`padding:20px 0;display:grid;grid-template-columns:36px minmax(0,1fr);gap:12px;border-top:1px solid ${t.color.border.subtle};&>svg{margin-top:12px;color:${t.color.text.secondary};}label{font-weight:600;}p{margin:0;}`;
const Actions = styled.div`display:flex;gap:12px;flex-wrap:wrap;align-items:center;@media(max-width:767px){>button{width:100%;}}`;
const Feedback = styled.p`margin:0;line-height:1.6;`;
const keys: Array<keyof SiteSections> = ['suits','familyLooks'];

export function AdminSettingsPage() {
  const {token} = useAuth();
  const {handleRequestError} = useAdminAccess();
  const [baseline,setBaseline] = useState<SiteSections | null>(null);
  const [draft,setDraft] = useState<SiteSections | null>(null);
  const [revision,setRevision] = useState(0);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [success,setSuccess] = useState(false);
  const request = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const cancelButton = useRef<HTMLButtonElement | null>(null);
  const dirty = Boolean(draft && baseline && keys.some(key => draft[key] !== baseline[key]));
  const blocker = useBlocker(dirty || saving);
  useEffect(() => {
    if (!dirty && !saving) return;
    const warn = (event: BeforeUnloadEvent) => {event.preventDefault();event.returnValue='';};
    window.addEventListener('beforeunload',warn);
    return () => window.removeEventListener('beforeunload',warn);
  }, [dirty,saving]);
  useEffect(() => {
    const controller = new AbortController();request.current=controller;
    setLoading(true);setError('');setBaseline(null);setDraft(null);
    getAdminSettings(token ?? '',controller.signal).then(value => {
      if (!controller.signal.aborted) {setBaseline(value);setDraft(value);setLoading(false);}
    }).catch(error => {
      if (controller.signal.aborted || handleRequestError(error)) return;
      setError('Nastavení se nepodařilo načíst. Zkuste to znovu.');setLoading(false);
    });
    return () => {controller.abort();request.current?.abort();busy.current=false;};
  }, [token,revision,handleRequestError]);
  async function save() {
    if (!draft || !baseline || !dirty || busy.current) return;
    busy.current=true;setSaving(true);setError('');setSuccess(false);
    const controller=new AbortController();request.current=controller;
    const patch=Object.fromEntries(keys.filter(key => draft[key]!==baseline[key]).map(key => [key,draft[key]]));
    try {
      const value=await saveAdminSettings(token ?? '',patch,controller.signal);
      if (!controller.signal.aborted) {setDraft(value);setBaseline(value);setSuccess(true);}
    } catch(error) {
      if (!controller.signal.aborted && !handleRequestError(error)) setError('Uložení se nepodařilo potvrdit. Vaše volby zůstaly zachované. Zkuste je uložit znovu.');
    } finally {if (!controller.signal.aborted) {busy.current=false;setSaving(false);}}
  }
  if (loading) return <Page role="status">Načítání nastavení…</Page>;
  if (!draft) return <Page><Feedback role="alert">{error}</Feedback><Actions><Button onClick={()=>setRevision(x=>x+1)}>Zkusit znovu</Button></Actions></Page>;
  return <Page>
    <form onSubmit={event=>{event.preventDefault();void save();}}>
      <Card aria-labelledby="settings-sections">
        <h2 id="settings-sections"><Eye size={22} aria-hidden="true"/>Sekce na webu</h2>
        <Copy>Vyberte, které sekce se zobrazí v menu, na úvodní stránce a v patičce webu. Vypnutá sekce nebude dostupná ani přes přímý odkaz.</Copy>
        <Fieldset disabled={saving}>
          <legend style={{position:'absolute',width:1,height:1,overflow:'hidden',clip:'rect(0,0,0,0)'}}>Viditelnost sekcí</legend>
          <Row><Shirt size={24} aria-hidden="true"/><div><CheckboxField label="Chlapecké obleky" checked={draft.suits} aria-describedby="suits-help" onChange={event=>{setDraft({...draft,suits:event.target.checked});setSuccess(false);}}/><Copy id="suits-help">Samostatná nabídka chlapeckých obleků.</Copy></div></Row>
          <Row><Users size={24} aria-hidden="true"/><div><CheckboxField label="Family looky" checked={draft.familyLooks} aria-describedby="family-help" onChange={event=>{setDraft({...draft,familyLooks:event.target.checked});setSuccess(false);}}/><Copy id="family-help">Kolekce produktů zařazených do rodinného looku.</Copy></div></Row>
        </Fieldset>
        <Copy>Produkty zůstávají v celkové nabídce. Fotografie, fyzické kusy ani rezervace se nemění.</Copy>
      </Card>
      <Actions style={{marginTop:24}}><Button type="submit" disabled={!dirty||saving} aria-busy={saving||undefined}>{saving?'Ukládání…':'Uložit'}</Button><Button type="button" variant="secondary" disabled={!dirty||saving} onClick={()=>{setDraft(baseline);setError('');setSuccess(false);}}>Zrušit změny</Button></Actions>
    </form>
    {error?<Feedback role="alert">{error}</Feedback>:null}
    {success?<Feedback role="status">Nastavení bylo uloženo. Změny se projeví při dalším otevření nebo obnovení webu.</Feedback>:null}
    <Dialog open={blocker.state==='blocked'} title="Neuložené změny" description={saving?'Uložení probíhá. Opuštění stránky jej nemusí zastavit.':'Máte neuložené změny nastavení. Chcete je zahodit a odejít?'} initialFocusRef={cancelButton} onEscape={()=>blocker.state==='blocked'&&blocker.reset()}>
      <Actions ref={node=>{cancelButton.current=node?.querySelector<HTMLButtonElement>('button')??null;}}><Button onClick={()=>blocker.state==='blocked'&&blocker.reset()}>Zůstat</Button><Button variant="secondary" onClick={()=>blocker.state==='blocked'&&blocker.proceed()}>Odejít</Button></Actions>
    </Dialog>
  </Page>;
}
