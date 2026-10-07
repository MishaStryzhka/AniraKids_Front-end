import styled from 'styled-components';
import {Info} from 'lucide-react';
import {Button} from '../../design-system/components/Button';
import {Divider} from '../../design-system/components/Divider';
import {Spinner} from '../../design-system/components/Spinner';
import {designTokens as t} from '../../design-system/tokens/designTokens';
import type {AdminProductStatus} from '../api/products';
import {isReadinessStale, metadataRecoveryLabel, productConflictHeading, requirementActions, type KnownActivationRequirement} from './productActivationModel';
import type {ProductActivationController} from './useProductActivationController';

const Section = styled.section`display:grid;gap:${t.space[4]};min-inline-size:0;margin-block-start:${t.space[4]};max-inline-size:840px;>h2+p{margin-block-start:-${t.space[2]};}`;
const Heading = styled.h2`margin:${t.space[4]} 0 0;font:600 22px/30px ${t.font.family.ui};
  &:focus{outline:2px solid ${t.color.focus.ring};outline-offset:2px;}`;
const Title = styled.h3`margin:0;font:600 18px/28px ${t.font.family.ui};&:focus{outline:2px solid ${t.color.focus.ring};outline-offset:2px;}`;
const Copy = styled.p`margin:0;font-size:${t.type.bodySm.size};line-height:${t.type.bodySm.lineHeight};overflow-wrap:anywhere;`;
const Notice = styled.div<{$tone:'warning'|'info'|'success'}>`display:grid;gap:${t.space[3]};min-inline-size:0;padding:${t.space[4]};border-radius:${t.radius[2]};background:${p=>t.color.status[p.$tone].bg};color:${p=>t.color.status[p.$tone].strong};`;
const Requirements = styled.ul`list-style:none;padding:0;margin:0;`;
const Requirement = styled.li`display:flex;flex-wrap:wrap;align-items:center;gap:${t.space[4]};padding-block:${t.space[2]};min-inline-size:0;
  &+&{border-block-start:1px solid ${t.color.border.subtle};} >div{flex:1 1 240px;min-inline-size:0;overflow-wrap:anywhere;} >button{max-inline-size:100%;white-space:normal;}
  @media(max-width:767px){flex-direction:column;align-items:flex-start;>div{flex:auto;}}`;
const MainAction = styled.div`@media(max-width:767px){>button{inline-size:100%;white-space:normal;}}`;
const Stale = styled(Notice)`padding:${t.space[3]};`;
// The shared Button owns aria-busy through its generic loading mode, which hides
// its label. Match the existing Inventory pending-button pattern locally.
const PendingActivationButton=styled.button`min-inline-size:0;min-block-size:${t.control.height.compact};padding-inline:${t.component.button.paddingInline.compact};border:1px solid transparent;border-radius:${t.component.button.radius};display:inline-flex;align-items:center;justify-content:center;gap:${t.component.button.iconGap};font-family:${t.font.family.ui};font-size:${t.type.button.size};line-height:${t.type.button.lineHeight};font-weight:${t.type.button.weight};letter-spacing:${t.type.button.letterSpacing};color:${t.color.state.disabled.fg};background:${t.color.state.disabled.bg};cursor:not-allowed;white-space:normal;text-align:center;overflow-wrap:anywhere;`;
const feedbackCopy = {'confirmed-active':'Produkt byl aktivován.','observed-active':'Produkt je nyní aktivní.','observed-draft':'Produkt je stále ve stavu Koncept.','observed-archived':'Produkt je nyní ve stavu Archivovaný.'};
export function ProductActivationSection({status,controller:c,contextRevision,blocked,onGoToRequirement}: {
  status?:AdminProductStatus;controller:ProductActivationController;contextRevision:number;blocked:boolean;onGoToRequirement(key:KnownActivationRequirement):void;
}) {
  const showAction=status==='draft';
  // Recovery remains visible even when an independent observation changed status.
  if(!showAction&&!c.feedback&&!c.unknownOutcome&&!c.conflict&&!c.productMissing)return null;
  const pending=c.operation?.kind==='activate';
  return <Section aria-labelledby="product-activation-title" data-product-activation-section>
    <Divider/>
    <Heading id="product-activation-title" tabIndex={-1}>Aktivace produktu</Heading>
    {showAction?<Copy>Po kliknutí server ověří, zda produkt splňuje všechny požadavky pro aktivaci. Pokud něco chybí, zobrazíme konkrétní požadavky.</Copy>:null}
    {c.readiness?<Notice $tone="warning">
      <Title id="product-activation-result" tabIndex={-1}>Produkt zatím nelze aktivovat</Title>
      <Copy>Server při posledním pokusu zjistil, že chybí následující požadavky:</Copy>
      <Requirements>{c.readiness.requirements.map((requirement,index)=><Requirement key={requirement.key??`anonymous-${index}`}>
        <div><Copy>{requirement.copy}</Copy>{!requirement.known&&requirement.key?<Copy>Kód požadavku: {requirement.key}</Copy>:null}</div>
        {requirement.known&&requirementActions[requirement.key as KnownActivationRequirement]?<Button size="compact" variant="ghost" onClick={()=>onGoToRequirement(requirement.key as KnownActivationRequirement)}>{requirementActions[requirement.key as KnownActivationRequirement]}</Button>:null}
      </Requirement>)}</Requirements>
      {isReadinessStale(c.readiness,contextRevision)?<Stale $tone="info"><Info size={16} aria-hidden="true"/><Copy>Výsledek posledního pokusu už nemusí odpovídat aktuálním údajům.</Copy><Copy>Uložte nebo dokončete změny a spusťte aktivaci znovu pro novou kontrolu.</Copy></Stale>:null}
    </Notice>:null}
    {c.conflict?<Notice $tone="warning"><Title>{productConflictHeading}</Title><Copy>Aktivace nebyla provedena, protože se produkt během požadavku změnil. Načtěte aktuální stav produktu a potom aktivaci případně spusťte znovu.</Copy></Notice>:null}
    {c.unknownOutcome?<Notice $tone="info"><Title>Výsledek aktivace není potvrzený</Title><Copy>Požadavek mohl být zpracován. Načtěte aktuální stav produktu, než aktivaci zopakujete.</Copy></Notice>:null}
    {c.productMissing?<Notice $tone="warning"><Title>Produkt už není dostupný</Title><Copy>Produkt už nebyl nalezen. Aktivaci nelze provést ani ověřit.</Copy><Copy>Vaše rozpracované změny na této stránce zůstávají zachované, dokud stránku neopustíte.</Copy></Notice>:null}
    {(c.conflict||c.unknownOutcome)&&!c.productMissing?<MainAction aria-busy={c.operation?.kind==='reconcile'||undefined}><Button size="compact" variant="secondary" disabled={Boolean(c.operation)} aria-busy={c.operation?.kind==='reconcile'||undefined} onClick={c.reconcile}>{metadataRecoveryLabel}</Button></MainAction>:null}
    {c.error?<Copy role="alert">{c.error}</Copy>:null}
    {c.feedback?<Notice $tone={c.feedback==='confirmed-active'?'success':'info'} role="status">{feedbackCopy[c.feedback]}</Notice>:null}
    {showAction?<><MainAction>{pending?<PendingActivationButton type="button" disabled aria-busy="true"><Spinner size="xs"/>Aktivování…</PendingActivationButton>:<Button size="compact" variant="primary" disabled={blocked||!c.canActivate()} onClick={c.activate}>Aktivovat produkt</Button>}</MainAction>
      {blocked?<Copy>Nejprve uložte, dokončete nebo vyřešte rozpracovanou práci na této stránce.</Copy>:null}</>:null}
  </Section>;
}
