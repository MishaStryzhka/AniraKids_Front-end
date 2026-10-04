import {useRef,type MouseEvent as ReactMouseEvent} from 'react';
import {CircleAlert,CircleCheck,Info,TriangleAlert} from 'lucide-react';
import styled from 'styled-components';
import {Button} from '../../design-system/components/Button';
import {Divider} from '../../design-system/components/Divider';
import {Input} from '../../design-system/components/Input';
import {SelectField} from '../../design-system/components/SelectField';
import {Spinner} from '../../design-system/components/Spinner';
import {StatusBadge} from '../../design-system/components/StatusBadge';
import {TextareaField} from '../../design-system/components/TextareaField';
import {designTokens as t} from '../../design-system/tokens/designTokens';
import type {AdminInventoryItem,AdminVariant} from '../api/products';
import {
  CREATE_INVENTORY_CONDITIONS,
  INVENTORY_CONDITION_LABEL,
  INVENTORY_STATUS_PRESENTATION,
  editInventoryConditions,
  findInventoryItem,
  inventoryItemsForVariant,
  inventoryLifecycleActionsForStatus,
  isInventoryEditDirty,
  type InventoryEditorTarget,
  type InventoryLifecycleAction,
} from './productInventoryModel';
import type {InventoryLifecycleNotice,ProductInventoryController} from './useProductInventoryController';

const Section=styled.section`margin-block-start:${t.space[6]};min-inline-size:0;display:grid;gap:${t.space[4]};overflow:visible;`;
const Header=styled.div`display:flex;align-items:center;justify-content:space-between;gap:${t.space[4]};min-inline-size:0;@media(max-width:767px){align-items:stretch;flex-direction:column;>button{inline-size:100%;}}`;
const Heading=styled.h3`margin:0;font-size:${t.type.bodyMd.size};line-height:${t.type.bodyMd.lineHeight};font-weight:${t.font.weight.semibold};`;
const List=styled.ul`list-style:none;margin:0;padding:0;min-inline-size:0;overflow:visible;`;
const Item=styled.li`min-inline-size:0;padding-block:${t.space[3]};border-block-start:1px solid ${t.color.border.subtle};overflow:visible;`;
const Row=styled.div`display:grid;min-inline-size:0;align-items:center;gap:${t.space[3]};grid-template-areas:"code" "status" "condition";grid-template-columns:minmax(0,1fr);@media(min-width:768px) and (max-width:1023px){grid-template-areas:"code status" "condition condition";grid-template-columns:minmax(0,1fr) auto;column-gap:${t.space[6]};}@media(min-width:1024px){grid-template-areas:"code status condition";grid-template-columns:minmax(0,1fr) auto auto;column-gap:${t.space[6]};}`;
const Meta=styled.div`min-inline-size:0;display:grid;gap:${t.space[1]};`;
const Code=styled(Meta)`grid-area:code;>strong{overflow-wrap:anywhere;}`;
const Status=styled(Meta)`grid-area:status;justify-self:start;`;
const Condition=styled(Meta)<{$damaged:boolean}>`grid-area:condition;>strong{color:${({$damaged})=>$damaged?t.color.status.danger.strong:t.color.text.primary};}`;
const Label=styled.span`color:${t.color.text.secondary};font-size:${t.type.caption.size};line-height:${t.type.caption.lineHeight};`;
const Empty=styled.div`padding-block:${t.space[4]};border-block-start:1px solid ${t.color.border.subtle};display:grid;gap:${t.space[2]};color:${t.color.text.secondary};strong{color:${t.color.text.primary};}button{margin-block-start:${t.space[2]};justify-self:start;}@media(max-width:767px){button{inline-size:100%;justify-self:stretch;}}`;
const Editor=styled.div`min-inline-size:0;display:grid;gap:${t.space[4]};`;
const EditEditor=styled(Editor)`margin-block-start:${t.space[4]};padding-block-start:${t.space[4]};border-block-start:1px solid ${t.color.border.subtle};`;
const Fields=styled.div`display:grid;gap:${t.space[4]};min-inline-size:0;@media(min-width:768px){grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:${t.space[6]};}`;
const Field=styled.div`display:grid;gap:${t.space[1]};min-inline-size:0;`;
const Helper=styled.p`margin:0;color:${t.color.text.secondary};font-size:${t.type.caption.size};line-height:${t.type.caption.lineHeight};overflow-wrap:anywhere;`;
const ErrorText=styled.p`margin:0;color:${t.color.status.danger.strong};font-size:${t.type.bodySm.size};line-height:${t.type.bodySm.lineHeight};`;
const EditorActions=styled.div`display:flex;justify-content:flex-end;flex-wrap:wrap;gap:${t.space[2]};@media(max-width:767px){display:grid;grid-template-columns:1fr;>button{inline-size:100%;}}`;
const Operations=styled.div`margin-block-start:${t.space[3]};display:flex;justify-content:flex-end;align-items:flex-start;flex-wrap:wrap;gap:${t.space[2]};min-inline-size:0;@media(max-width:767px){display:grid;grid-template-columns:minmax(0,1fr);>button,>div>button{inline-size:100%;}}`;
const ActionWithHelper=styled.div`display:grid;gap:${t.space[1]};min-inline-size:0;@media(max-width:767px){inline-size:100%;}`;
const Notice=styled.div<{$tone:'success'|'warning'|'info'|'danger'}>`margin-block-start:${t.space[2]};padding:${t.space[3]};border-radius:${t.radius[2]};display:grid;grid-template-columns:auto minmax(0,1fr);gap:${t.space[2]};font-size:${t.type.bodySm.size};line-height:${t.type.bodySm.lineHeight};color:${({$tone})=>$tone==='success'?t.color.status.success.strong:$tone==='warning'?t.color.status.warning.strong:$tone==='info'?t.color.status.info.strong:t.color.status.danger.strong};background:${({$tone})=>$tone==='success'?t.color.status.success.bg:$tone==='warning'?t.color.status.warning.bg:$tone==='info'?t.color.status.info.bg:t.color.status.danger.bg};svg{inline-size:16px;block-size:16px;margin-block-start:2px;}strong{display:block;margin-block-end:${t.space[1]};}`;
const PendingLifecycleButton=styled.button<{$destructive?:boolean}>`min-inline-size:0;min-block-size:${t.control.height.compact};padding-inline:${t.component.button.paddingInline.compact};border:1px solid transparent;border-radius:${t.component.button.radius};display:inline-flex;align-items:center;justify-content:center;gap:${t.component.button.iconGap};font-family:${t.font.family.ui};font-size:${t.type.button.size};line-height:${t.type.button.lineHeight};font-weight:${t.type.button.weight};letter-spacing:${t.type.button.letterSpacing};color:${t.color.state.disabled.fg};background:${t.color.state.disabled.bg};border-color:${({$destructive})=>$destructive?'transparent':t.color.state.disabled.border};cursor:not-allowed;white-space:normal;text-align:center;overflow-wrap:anywhere;@media(max-width:767px){inline-size:100%;}`;
const Recovery=styled(Button)`margin-block-start:${t.space[2]};justify-self:start;@media(max-width:767px){inline-size:100%;justify-self:stretch;}`;

export interface InventoryRetireIntent{
  variantId:string;
  inventoryItemId:string;
  internalCode:string;
  trigger:HTMLElement;
}
export interface ProductInventoryItemsProps{
  variant:AdminVariant;
  controller:ProductInventoryController;
  onRequestOpen(target:InventoryEditorTarget,trigger:HTMLElement):void;
  onRequestRetire(intent:InventoryRetireIntent):void;
}

function row(root:HTMLElement|null,id:string){return Array.from(root?.querySelectorAll<HTMLElement>('[data-inventory-id]')??[]).find(node=>node.dataset.inventoryId===id)??null;}

export function ProductInventoryItems({variant,controller:c,onRequestOpen,onRequestRetire}:ProductInventoryItemsProps){
 const root=useRef<HTMLElement>(null),codeRef=useRef<HTMLInputElement>(null),conditionRef=useRef<HTMLSelectElement>(null),notesRef=useRef<HTMLTextAreaElement>(null);
 const key=variant.id.replace(/[^A-Za-z0-9_-]/g,'-'),headingId=`inventory-${key}-title`;
 const items=inventoryItemsForVariant(c.snapshot,variant.id);
 const target=c.activeEditor?.variantId===variant.id?c.activeEditor:null;
 const identity=target?.kind==='edit'?(findInventoryItem(c.snapshot,variant.id,target.inventoryItemId)??c.editIdentity):null;
 const pending=Boolean(c.operation),lifecycleAnyPending=Object.keys(c.lifecycleOperationsByItem).length>0,basicBlocked=pending||c.productMissing||Boolean(c.unknownCreate);
 const resolveField=(field:'internalCode'|'condition'|'notes')=>field==='internalCode'?codeRef.current:field==='condition'?conditionRef.current:notesRef.current;
 const fallback=()=>root.current?.querySelector<HTMLElement>(`#${headingId}`)??null;
 const itemRow=(id:string)=>row(root.current,id);
 const resolveEdit=(id:string)=>itemRow(id)?.querySelector<HTMLElement>('[data-inventory-edit]')??fallback();
 const resolveAction=(id:string,action:InventoryLifecycleAction)=>itemRow(id)?.querySelector<HTMLElement>(`[data-inventory-lifecycle="${action}"]`)??resolveEdit(id);
 const lifecycleFocus=(item:AdminInventoryItem)=>({
   edit:()=>resolveEdit(item.id),
   action:(action:InventoryLifecycleAction)=>resolveAction(item.id,action),
   condition:()=>target?.kind==='edit'&&target.inventoryItemId===item.id?conditionRef.current:resolveEdit(item.id),
   heading:fallback,
 });

 const basicNotice=()=>{
  if(c.productMissing)return <Notice $tone="warning"><TriangleAlert aria-hidden="true"/><div><strong>Produkt už není dostupný</strong>Další změny fyzických kusů nelze uložit.</div></Notice>;
  if(target?.kind==='add'&&c.missingVariantId===variant.id)return <><Notice $tone="warning"><TriangleAlert aria-hidden="true"/><div><strong>Varianta už není dostupná</strong>Fyzický kus nelze přidat, protože tato varianta už nebyla nalezena.</div></Notice><Recovery size="compact" variant="secondary" loading={c.refreshing} disabled={lifecycleAnyPending} onClick={()=>c.refresh(()=>fallback())}>Načíst aktuální fyzické kusy</Recovery></>;
  if(target?.kind==='edit'&&c.missingItemId===target.inventoryItemId)return <><Notice $tone="warning"><TriangleAlert aria-hidden="true"/><div><strong>Fyzický kus už není dostupný</strong>Změny nelze uložit, protože tento fyzický kus už nebyl nalezen.</div></Notice><Recovery size="compact" variant="secondary" loading={c.refreshing} disabled={lifecycleAnyPending} onClick={()=>c.refresh(()=>fallback())}>Načíst aktuální fyzické kusy</Recovery></>;
  if(c.unknownCreate?.variantId===variant.id)return <><Notice $tone="warning" data-inventory-unknown><TriangleAlert aria-hidden="true"/><div><strong>Výsledek přidání fyzického kusu není potvrzený</strong>Požadavek mohl být zpracován. Než kus přidáte znovu, načtěte aktuální fyzické kusy.</div></Notice><Recovery size="compact" loading={c.refreshing} disabled={lifecycleAnyPending} onClick={()=>c.refresh(()=>fallback())}>Načíst aktuální fyzické kusy</Recovery></>;
  if(c.damagedError)return <Notice $tone="danger"><CircleAlert aria-hidden="true"/><div><strong>Poškozený stav nelze uložit</strong>Aktivní fyzický kus nelze v tomto základním editoru označit jako poškozený. Změna provozního stavu do údržby není součástí této fáze.</div></Notice>;
  return null;
 };

 const lifecycleNotice=(item:AdminInventoryItem,notice:InventoryLifecycleNotice|null)=>{
  if(!notice)return null;
  const recover=()=>{
    return <Recovery size="compact" variant="secondary" disabled={c.refreshing||lifecycleAnyPending} onClick={()=>c.refresh(()=>fallback())}>Načíst aktuální fyzické kusy</Recovery>;
  };
  if(notice.kind==='success')return <Notice $tone="success" role="status" aria-live="polite"><CircleCheck aria-hidden="true"/><div>{notice.message}</div></Notice>;
  if(notice.kind==='reservation-conflict')return <Notice $tone="warning" role="status" aria-live="polite"><TriangleAlert aria-hidden="true"/><div><strong>Provozní stav nelze změnit</strong>Fyzický kus má aktuální nebo budoucí rezervaci, která této změně brání.</div></Notice>;
  if(notice.kind==='damaged-activation')return <Notice $tone="warning" role="status" aria-live="polite"><TriangleAlert aria-hidden="true"/><div><strong>Fyzický kus nelze aktivovat</strong>Fyzický kus je označen jako Poškozený. Nejprve upravte Stav kusu a změnu uložte.</div></Notice>;
  if(notice.kind==='invalid-transition')return <><Notice $tone="danger" role="status" aria-live="polite"><CircleAlert aria-hidden="true"/><div><strong>Tuto změnu provozního stavu nelze provést</strong>Provozní stav fyzického kusu se mohl mezitím změnit. Načtěte aktuální fyzické kusy a zkontrolujte stav.</div></Notice>{recover()}</>;
  if(notice.kind==='invalid-id')return <><Notice $tone="danger" role="status" aria-live="polite"><CircleAlert aria-hidden="true"/><div><strong>Fyzický kus nelze změnit</strong>Identifikátor fyzického kusu není platný. Načtěte aktuální fyzické kusy.</div></Notice>{recover()}</>;
  if(notice.kind==='missing-item')return <><Notice $tone="warning" role="status" aria-live="polite"><TriangleAlert aria-hidden="true"/><div><strong>Fyzický kus už není dostupný</strong>Akci nelze provést, protože tento fyzický kus už nebyl nalezen.</div></Notice>{recover()}</>;
  return <><Notice $tone="info" role="status" aria-live="polite"><Info aria-hidden="true"/><div><strong>Výsledek změny provozního stavu není potvrzený</strong>Požadavek mohl být zpracován. Než akci zopakujete, načtěte aktuální fyzické kusy.</div></Notice>{recover()}</>;
 };

 const editor=()=>{
  if(!target)return null;
  const isCreate=target.kind==='add',item=isCreate?null:identity,draft=isCreate?c.createDraft:c.editDraft;
  if(!isCreate&&!draft)return null;
  const options=isCreate?CREATE_INVENTORY_CONDITIONS:item?editInventoryConditions(item.status):[];
  const cleanEdit=Boolean(!isCreate&&c.editDraft&&c.editBaseline&&!isInventoryEditDirty(c.editDraft,c.editBaseline));
  const lifecycleWriteBlocked=Boolean(!isCreate&&target.kind==='edit'&&c.isBasicWriteBlocked(target.inventoryItemId));
  const saveDisabled=basicBlocked||lifecycleWriteBlocked||cleanEdit||(isCreate?c.missingVariantId===variant.id:c.missingItemId===target.inventoryItemId);
  const Body=isCreate?Editor:EditEditor;
  return <Body data-inventory-editor data-inventory-editor-kind={target.kind}>
   {!isCreate&&item?<Fields><Meta><Label>Interní kód</Label><strong>{item.internalCode}</strong></Meta><Meta><Label>Provozní stav</Label><StatusBadge tone={INVENTORY_STATUS_PRESENTATION[item.status].tone}>{INVENTORY_STATUS_PRESENTATION[item.status].label}</StatusBadge></Meta></Fields>:null}
   <Fields>
    {isCreate?<Field><Input ref={codeRef} data-inventory-code label="Interní kód" value={c.createDraft.internalCode} maxLength={80} disabled={basicBlocked} error={Boolean(c.fieldErrors.internalCode)} aria-describedby={c.fieldErrors.internalCode?`${headingId}-code-help ${headingId}-code-error`:`${headingId}-code-help`} onChange={e=>c.setCreateDraft({...c.createDraft,internalCode:e.currentTarget.value})}/><Helper id={`${headingId}-code-help`}>Unikátní kód fyzického kusu, např. AK-0001. Použijte 2–80 znaků: písmena, číslice a spojovníky.<br/>Po uložení se kód zobrazí velkými písmeny.</Helper>{c.fieldErrors.internalCode?<ErrorText id={`${headingId}-code-error`}>{c.fieldErrors.internalCode}</ErrorText>:null}</Field>:null}
    <Field><SelectField ref={conditionRef} data-inventory-condition label="Stav kusu" value={draft?.condition??'good'} disabled={basicBlocked||lifecycleWriteBlocked} aria-invalid={Boolean(c.fieldErrors.condition)||undefined} aria-describedby={c.fieldErrors.condition?`${headingId}-condition-help ${headingId}-condition-error`:`${headingId}-condition-help`} onChange={e=>isCreate?c.setCreateDraft({...c.createDraft,condition:e.currentTarget.value as typeof c.createDraft.condition}):c.setEditDraft(c.editDraft?{...c.editDraft,condition:e.currentTarget.value as any}:c.editDraft)}>{options.map(value=><option key={value} value={value}>{INVENTORY_CONDITION_LABEL[value]}</option>)}</SelectField><Helper id={`${headingId}-condition-help`}>{isCreate?'Nový fyzický kus bude vytvořen jako Aktivní. Poškozený stav proto při vytvoření nelze zvolit.':item?.status==='active'?'Aktivní fyzický kus nelze v tomto editoru označit jako poškozený.':''}</Helper>{c.fieldErrors.condition?<ErrorText id={`${headingId}-condition-error`}>{c.fieldErrors.condition}</ErrorText>:null}</Field>
   </Fields>
   <Field><TextareaField ref={notesRef} data-inventory-notes label="Poznámka" value={draft?.notes??''} maxLength={1000} disabled={basicBlocked||lifecycleWriteBlocked} error={Boolean(c.fieldErrors.notes)} aria-describedby={c.fieldErrors.notes?`${headingId}-notes-help ${headingId}-notes-error`:`${headingId}-notes-help`} onChange={e=>isCreate?c.setCreateDraft({...c.createDraft,notes:e.currentTarget.value}):c.setEditDraft(c.editDraft?{...c.editDraft,notes:e.currentTarget.value}:c.editDraft)}/><Helper id={`${headingId}-notes-help`}>Volitelné. Maximálně 1000 znaků.</Helper>{c.fieldErrors.notes?<ErrorText id={`${headingId}-notes-error`}>{c.fieldErrors.notes}</ErrorText>:null}</Field>
   {basicNotice()}{c.submitError?<ErrorText role="alert">{c.submitError}</ErrorText>:null}
   <EditorActions><Button size="compact" variant="secondary" disabled={pending||Boolean(c.unknownCreate)||lifecycleWriteBlocked} onClick={()=>c.cancel(fallback)}>Zrušit</Button><Button size="compact" data-inventory-submit loading={pending} disabled={Boolean(saveDisabled)} onClick={()=>isCreate?c.saveCreate(resolveField,item=>resolveEdit(item.id)):c.saveEdit(resolveField,item=>resolveEdit(item.id))}>{pending?(isCreate?'Přidávání…':'Ukládání…'):(isCreate?'Přidat kus':'Uložit změny')}</Button></EditorActions>
  </Body>;
 };

 const operations=(item:AdminInventoryItem)=>{
  const lifecycleOp=c.lifecycleOperationsByItem[item.id]??null;
  const lifecycleBlocked=c.isLifecycleActionBlocked(item.id);
  const basicSameItemPending=c.operation?.kind==='update'&&c.operation.inventoryItemId===item.id;
  const activationBlocked=c.isActivationBlocked(variant.id,item.id);
  const activationHelpId=`${headingId}-${item.id.replace(/[^A-Za-z0-9_-]/g,'-')}-activation-help`;
  const perform=(action:InventoryLifecycleAction)=>c.transitionLifecycle({variantId:variant.id,inventoryItemId:item.id,action,focus:lifecycleFocus(item)});
  return <Operations data-inventory-actions>
    <Button data-inventory-edit size="compact" variant="secondary" disabled={basicBlocked} onClick={(e:ReactMouseEvent<HTMLButtonElement>)=>onRequestOpen({kind:'edit',variantId:variant.id,inventoryItemId:item.id},e.currentTarget)}>Upravit</Button>
    {inventoryLifecycleActionsForStatus(item.status).map(spec=>{
      const isPending=lifecycleOp?.action===spec.action;
      const disabled=lifecycleBlocked||basicSameItemPending||(spec.action==='activate'&&activationBlocked);
      if(spec.action==='retire'){
        return isPending?<PendingLifecycleButton key={spec.action} $destructive disabled aria-busy="true" data-inventory-lifecycle="retire"><Spinner size="xs"/>{spec.pendingLabel}</PendingLifecycleButton>
          :<Button key={spec.action} size="compact" variant="destructive" disabled={disabled} data-inventory-lifecycle="retire" onClick={(e:ReactMouseEvent<HTMLButtonElement>)=>onRequestRetire({variantId:variant.id,inventoryItemId:item.id,internalCode:item.internalCode,trigger:e.currentTarget})}>{spec.label}</Button>;
      }
      const button=isPending?<PendingLifecycleButton disabled aria-busy="true" data-inventory-lifecycle={spec.action}><Spinner size="xs"/>{spec.pendingLabel}</PendingLifecycleButton>
        :<Button size="compact" variant="secondary" disabled={disabled} aria-describedby={spec.action==='activate'&&activationBlocked?activationHelpId:undefined} data-inventory-lifecycle={spec.action} onClick={()=>perform(spec.action)}>{spec.label}</Button>;
      return spec.action==='activate'&&activationBlocked?<ActionWithHelper key={spec.action}>{button}<Helper id={activationHelpId}>Nejprve uložte nebo zrušte rozpracovanou změnu Stavu kusu.</Helper></ActionWithHelper>:<div key={spec.action}>{button}</div>;
    })}
  </Operations>;
 };

 return <Section ref={root} aria-labelledby={headingId} data-inventory-variant={variant.id}>
  <Divider/><Header><Heading id={headingId} tabIndex={-1}>Fyzické kusy</Heading><Button data-inventory-add size="compact" variant="secondary" disabled={basicBlocked} onClick={(e:ReactMouseEvent<HTMLButtonElement>)=>onRequestOpen({kind:'add',variantId:variant.id},e.currentTarget)}>Přidat fyzický kus</Button></Header>
  {target?.kind==='add'?editor():null}
  {c.feedback&&c.feedbackVariantId===variant.id?<Notice $tone={c.feedback.startsWith('Fyzický kus s tímto interním kódem')?'info':'success'} role="status">{c.feedback.startsWith('Fyzický kus s tímto interním kódem')?<Info aria-hidden="true"/>:<CircleCheck aria-hidden="true"/>}<div>{c.feedback}</div></Notice>:null}
  {items.length===0?<Empty data-inventory-empty><strong>Pro velikost {variant.size} zatím nejsou žádné fyzické kusy</strong><span>Přidejte první fyzický kus této velikosti.</span><Button size="compact" variant="secondary" disabled={basicBlocked} onClick={(e:ReactMouseEvent<HTMLButtonElement>)=>onRequestOpen({kind:'add',variantId:variant.id},e.currentTarget)}>Přidat fyzický kus</Button></Empty>:<List>{items.map(item=>{const p=INVENTORY_STATUS_PRESENTATION[item.status];return <Item key={item.id} data-inventory-id={item.id}><Row><Code><Label>Interní kód</Label><strong>{item.internalCode}</strong></Code><Status data-inventory-status-cell><Label>Provozní stav</Label><StatusBadge tone={p.tone}>{p.label}</StatusBadge></Status><Condition data-inventory-condition-cell $damaged={item.condition==='damaged'}><Label>Stav kusu</Label><strong>{INVENTORY_CONDITION_LABEL[item.condition]}</strong></Condition></Row>{item.notes?<Helper data-inventory-notes-display><strong>Poznámka:</strong> {item.notes}</Helper>:null}{operations(item)}{lifecycleNotice(item,c.lifecycleNoticeByItem[item.id]??null)}{target?.kind==='edit'&&target.inventoryItemId===item.id?editor():null}</Item>})}</List>}
  {target?.kind==='edit'&&!items.some(item=>item.id===target.inventoryItemId)?editor():null}
 </Section>;
}
