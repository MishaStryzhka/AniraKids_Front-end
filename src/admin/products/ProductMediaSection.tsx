import {forwardRef, useImperativeHandle, useCallback, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {Pencil, Plus} from 'lucide-react';
import {Button} from '../../design-system/components/Button';
import {Dialog} from '../../design-system/components/Dialog';
import {IconButton} from '../../design-system/components/IconButton';
import {Divider} from '../../design-system/components/Divider';
import {Spinner} from '../../design-system/components/Spinner';
import {StatusBadge} from '../../design-system/components/StatusBadge';
import {designTokens as t} from '../../design-system/tokens/designTokens';
import type {AdminProductPhoto, AdminProductStatus} from '../api/products';
import type {ActivationDomainGuardSnapshot} from './productActivationModel';
import {useProductMediaController, type UploadPhase} from './useProductMediaController';
import {ProductPhotoEditor} from './ProductPhotoEditor';

const Section = styled.section`
  inline-size:100%;max-inline-size:840px;margin-block-start:${t.space[8]};display:grid;gap:${t.space[6]};min-inline-size:0;
`;
const HeadingRow = styled.div`
  margin-block-start:${t.space[2]};display:flex;align-items:center;justify-content:space-between;gap:${t.space[3]};
`;
const HeadingActions = styled.div`display:flex;align-items:center;gap:${t.space[2]};flex-shrink:0;`;
const H2 = styled.h2`&:focus{outline:2px solid ${t.color.focus.ring};outline-offset:2px;}margin:0;font:600 22px/30px ${t.font.family.ui};`;
const Copy = styled.p`margin:0;color:${t.color.text.secondary};font-size:${t.type.bodySm.size};line-height:${t.type.bodySm.lineHeight};`;
const PhotoCount = styled(Copy)`white-space:nowrap;font-variant-numeric:tabular-nums;`;
const List = styled.ol`list-style:none;margin:0;padding:0;border:1px solid ${t.color.border.subtle};border-radius:${t.radius[2]};overflow:visible;`;
const Item = styled.li`
  padding:${t.space[4]};display:grid;grid-template-columns:96px minmax(0,1fr);gap:${t.space[4]};min-inline-size:0;
  &+&{border-block-start:1px solid ${t.color.border.subtle};}
`;
const Preview = styled.img`
  inline-size:96px;block-size:128px;object-fit:contain;object-position:center;
  border-radius:${t.radius[2]};background:${t.color.bg.subtle};
`;
const Broken = styled.div`
  inline-size:96px;block-size:128px;display:grid;place-items:center;text-align:center;
  border-radius:${t.radius[2]};background:${t.color.bg.subtle};color:${t.color.text.secondary};font-size:12px;
`;
const Body = styled.div`min-inline-size:0;display:grid;align-content:start;gap:${t.space[3]};overflow-wrap:anywhere;`;
const MainBadge = styled(StatusBadge)`justify-self:start;`;
const Actions = styled.div`
  display:flex;flex-wrap:wrap;gap:${t.space[2]};
  @media(max-width:767px){display:grid;grid-template-columns:1fr 1fr;&>[data-wide]{grid-column:1/-1;}}
`;
const ItemActions = styled(Actions)`grid-column:1/-1;@media(min-width:768px){grid-column:2;}`;
const AltEditor = styled.div`
  grid-column:1/-1;display:grid;gap:${t.space[2]};
  textarea{inline-size:100%;min-block-size:96px;resize:vertical;padding:${t.space[3]};border:1px solid ${t.color.border.default};
    border-radius:${t.radius[2]};font:inherit;box-sizing:border-box;}
`;
const Upload = styled.div`display:grid;gap:${t.space[3]};min-inline-size:0;`;
const Selected = styled.div`
  display:grid;grid-template-columns:minmax(0,1fr);gap:${t.space[4]};align-items:start;overflow-wrap:anywhere;
  .selected-actions{grid-column:1/-1;min-inline-size:0;display:flex;flex-wrap:wrap;gap:${t.space[2]};}
  @media(max-width:767px){.selected-actions{display:grid;grid-template-columns:minmax(0,1fr);}}
`;
const UploadPreview = styled.img`
  display:block;inline-size:100%;block-size:240px;max-block-size:35dvh;object-fit:contain;
  border-radius:${t.radius[2]};background:${t.color.bg.subtle};
`;
const PreviewFrame = styled.div`position:relative;min-inline-size:0;`;
const EditPhotoButton = styled(IconButton)`
  position:absolute;inset-block-start:8px;inset-inline-end:8px;
  &:hover:not(:disabled),&:active:not(:disabled){background:transparent;color:${t.color.action.primary.bgHover};}
  &>svg{
    inline-size:20.7px;block-size:20.7px;
    filter:drop-shadow(0 0 1px ${t.color.bg.surface}) drop-shadow(0 1px 2px rgb(41 37 34 / 18%));
  }
`;
const FileChoice = styled.div`
  display:grid;justify-items:center;gap:${t.space[3]};padding:${t.space[6]};
  border:1px dashed ${t.color.border.default};border-radius:${t.radius[2]};text-align:center;
`;
const Progress = styled.progress`inline-size:100%;block-size:8px;accent-color:${t.color.action.primary.bg};`;
const Status = styled.div`min-block-size:20px;color:${t.color.text.secondary};font-size:${t.type.bodySm.size};overflow-wrap:anywhere;`;
const Empty = styled.div`display:grid;gap:${t.space[2]};padding:${t.space[6]};border:1px solid ${t.color.border.subtle};border-radius:${t.radius[2]};`;
const OrderActions = styled(Actions)`margin-block-start:-${t.space[2]};@media(max-width:767px){display:grid;grid-template-columns:1fr;}`;
const phaseCopy: Record<UploadPhase, string> = {
  idle: '', selected: 'Fotografie je připravena k nahrání.', signing: 'Připravujeme bezpečné nahrání fotografie…',
  uploading: 'Fotografie se nahrává…', completing: 'Ověřujeme připojení fotografie k produktu…',
  unknown: 'Výsledek nahrání se nepodařilo potvrdit.', 'provider-confirmed-unattached': 'Připojení fotografie není potvrzené',
  'identity-mismatch': 'Nahraná fotografie neodpovídá podepsanému identifikátoru. Připojení je zablokované.',
};

export interface MediaDeleteIntent {
  publicId: string;
  trigger: HTMLElement;
  distinctCount: number;
  isMain: boolean;
}
export interface MediaDeleteSettlement {
  publicId: string;
  nonce: number;
  success: boolean;
  resolveFocus(): HTMLElement | null;
}
export interface ProductMediaSectionProps {
  productId: string;
  productName: string;
  status?: AdminProductStatus;
  token: string;
  initialPhotos: AdminProductPhoto[];
  onRiskChange?(risk: boolean): void;
  onPendingRiskChange?(pending: boolean): void;
  onProductMissing?(): void;
  onAccessError?(error: unknown): boolean;
  onRequestDelete?(intent: MediaDeleteIntent): void;
  deleteRequest?: {publicId: string; nonce: number} | null;
  onDeleteSettled?(result: MediaDeleteSettlement): void;
  /** Leave/delete confirmations temporarily take over the single visible dialog. */
  uploadDialogSuspended?: boolean;
}

function available(element: HTMLElement | null | undefined): element is HTMLElement {
  if (!element?.isConnected || element.matches(':disabled,[aria-disabled="true"]') || element.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
  for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
  }
  return true;
}
function photoRow(root: HTMLElement, publicId: string) {
  // Identity comparison avoids interpreting public IDs as CSS selector syntax.
  return Array.from(root.querySelectorAll<HTMLElement>('[data-photo-id]')).find(row => row.dataset.photoId === publicId);
}
function enabledAction(row: HTMLElement | undefined, preferred?: string) {
  const actions = Array.from(row?.querySelectorAll<HTMLElement>('[data-media-action]') ?? []).filter(available);
  return actions.find(action => action.dataset.mediaAction === preferred) ?? actions[0] ?? null;
}

export interface ProductMediaSectionHandle {getActivationGuardSnapshot():ActivationDomainGuardSnapshot;}
export const ProductMediaSection = forwardRef<ProductMediaSectionHandle,ProductMediaSectionProps>(function ProductMediaSection(props,ref) {
  const c = useProductMediaController(props);
  useImperativeHandle(ref,()=>({getActivationGuardSnapshot:c.getActivationGuardSnapshot}),[c.getActivationGuardSnapshot]);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadBodyRef = useRef<HTMLDivElement>(null);
  const [choosingFile, setChoosingFile] = useState(false);
  const [uploadMinimized, setUploadMinimized] = useState(false);
  const [editingAttemptId, setEditingAttemptId] = useState<number|null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const lifetime = useRef({productId: props.productId, alive: true, generation: 0, frames: new Set<number>()});
  lifetime.current.productId = props.productId;
  const invalidateFocus = useCallback(() => {
    const scope = lifetime.current;
    scope.alive = false;
    scope.generation++;
    scope.frames.forEach(id => cancelAnimationFrame(id));
    scope.frames.clear();
  }, []);
  useEffect(() => {
    lifetime.current.alive = true;
    return invalidateFocus;
  }, [props.productId, invalidateFocus]);
  const scheduleCommitted = useCallback((callback: () => void) => {
    const scope = lifetime.current;
    const generation = scope.generation;
    const productId = scope.productId;
    const root = sectionRef.current;
    const id = requestAnimationFrame(() => {
      scope.frames.delete(id);
      if (scope.alive && scope.generation === generation && scope.productId === productId && root === sectionRef.current && root?.isConnected) callback();
    });
    scope.frames.add(id);
  }, []);
  const handledDelete = useRef(0);
  const latest = useRef({remove: c.remove, settled: props.onDeleteSettled, order: c.drafts.orderIds});
  latest.current = {remove: c.remove, settled: props.onDeleteSettled, order: c.drafts.orderIds};
  const request = props.deleteRequest;
  useEffect(() => {
    if (!request || request.nonce === handledDelete.current) return;
    handledDelete.current = request.nonce;
    const before = [...latest.current.order];
    const removedIndex = before.indexOf(request.publicId);
    const scope = lifetime.current;
    const generation = scope.generation;
    const productId = scope.productId;
    const valid = () => scope.alive && scope.generation === generation && scope.productId === productId && handledDelete.current === request.nonce;
    const resolveFocus = () => {
      const root = sectionRef.current;
      if (!valid() || !root?.isConnected) return null;
      const surviving = (ids: string[]) => ids.find(id => photoRow(root, id));
      const next = surviving(before.slice(removedIndex + 1));
      const previous = surviving(before.slice(0, Math.max(removedIndex, 0)).reverse());
      for (const id of [next, previous]) {
        const action = id ? enabledAction(photoRow(root, id)) : null;
        if (action) return action;
      }
      const fileTrigger = root.querySelector<HTMLElement>('[data-photo-file-trigger]');
      if (available(fileTrigger)) return fileTrigger;
      const heading = root.querySelector<HTMLElement>('#product-media-title');
      return available(heading) ? heading : null;
    };
    void latest.current.remove(request.publicId).then(success => {
      if (!valid()) return;
      scheduleCommitted(() => {
        if (valid()) latest.current.settled?.({publicId: request.publicId, nonce: request.nonce, success: Boolean(success), resolveFocus});
      });
    });
  }, [request, scheduleCommitted]);

  const ordered = c.drafts.orderIds.map(id => c.photos.find(photo => photo.publicId === id)).filter(Boolean) as AdminProductPhoto[];
  const busy = Boolean(c.operation);
  const pendingRisk = busy || !['idle','selected'].includes(c.uploadPhase);
  const onPendingRiskChange = props.onPendingRiskChange;
  useEffect(() => onPendingRiskChange?.(pendingRisk), [onPendingRiskChange, pendingRisk]);
  const disabled = c.guard !== 'available' || busy || !props.token;
  const uploadDialogOpen = (choosingFile || Boolean(c.attempt && !uploadMinimized)) && !props.uploadDialogSuspended;
  const editingPhoto = Boolean(c.attempt && editingAttemptId === c.attempt.attemptId && c.uploadPhase === 'selected');
  useEffect(() => {
    if (!uploadDialogOpen || editingPhoto) return;
    const body = uploadBodyRef.current;
    if (busy) body?.focus();
    else body?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
  }, [uploadDialogOpen, busy, c.attempt?.attemptId, editingPhoto]);
  const closeUpload = () => {
    if (busy || c.getActivationGuardSnapshot().pendingMutation) return;
    setChoosingFile(false);
    if (c.uploadPhase === 'selected' || c.uploadPhase === 'idle') c.discardUpload();
    else setUploadMinimized(true);
  };
  const cancelUpload = () => {
    if (busy || c.getActivationGuardSnapshot().pendingMutation) return;
    c.discardUpload();
    setChoosingFile(false);
    setUploadMinimized(false);
  };
  const statusText = [phaseCopy[c.uploadPhase], c.feedback].filter(Boolean).filter((value, i, values) => values.indexOf(value) === i).join(' ');
  const move = (publicId: string, delta: -1 | 1) => {
    if (disabled) return;
    c.move(publicId, delta);
    scheduleCommitted(() => {
      const root = sectionRef.current;
      if (!root || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const row = photoRow(root, publicId);
      const preferred = delta === -1 ? 'earlier' : 'later';
      const opposite = delta === -1 ? 'later' : 'earlier';
      const controls = Array.from(row?.querySelectorAll<HTMLElement>('[data-media-action]') ?? []).filter(available);
      const target = controls.find(control => control.dataset.mediaAction === preferred)
        ?? controls.find(control => control.dataset.mediaAction === opposite) ?? controls[0];
      target?.focus();
    });
  };

  return <Section data-product-media-section ref={sectionRef} aria-labelledby="product-media-title">
    <Divider/>
    <HeadingRow>
      <H2 id="product-media-title" tabIndex={-1}>Fotografie</H2>
      <HeadingActions>
        <PhotoCount aria-label={`${c.photos.length} z 10 fotografií`}>{c.photos.length}/10</PhotoCount>
        <IconButton data-photo-file-trigger aria-label="Přidat fotografii" title="Přidat fotografii" icon={<Plus aria-hidden="true"/>}
          disabled={disabled || c.photos.length >= 10 || c.uploadPhase !== 'idle'}
          onClick={() => {c.clearFeedback(); setUploadMinimized(false); setChoosingFile(true);}}/>
      </HeadingActions>
    </HeadingRow>
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden
      onChange={event => {const file = event.currentTarget.files?.[0]; if (file && !disabled) c.selectFile(file); event.currentTarget.value = '';}}/>
    {c.photos.length >= 10 ? <Status>Produkt může mít maximálně 10 fotografií.</Status> : null}
    {c.attempt && uploadMinimized ? <Button variant="secondary" onClick={() => setUploadMinimized(false)}>Pokračovat v nahrávání</Button> : null}
    <Dialog open={uploadDialogOpen && !editingPhoto} title="Přidat fotografii" description="Vyberte fotografii produktu a zkontrolujte její náhled před nahráním."
      onEscape={closeUpload} resolveRestoreFocus={() => sectionRef.current?.querySelector<HTMLElement>('button:not(:disabled)') ?? sectionRef.current?.querySelector<HTMLElement>('#product-media-title') ?? null}>
      <Upload data-product-photo-upload ref={uploadBodyRef} tabIndex={-1} onKeyDown={event => {
        if (busy && event.key === 'Tab') event.preventDefault();
      }}>
      {c.attempt ? <Selected>
        {c.attempt.previewUrl ? <PreviewFrame>
          <UploadPreview src={c.attempt.previewUrl} alt="Náhled vybrané fotografie"/>
          {c.uploadPhase === 'selected' ? <EditPhotoButton aria-label="Upravit fotografii" title="Upravit"
            disabled={disabled} icon={<Pencil aria-hidden="true"/>} onClick={() => {c.clearFeedback();setEditingAttemptId(c.attempt!.attemptId);}}/> : null}
        </PreviewFrame> : null}
        <strong>{c.attempt.filename}</strong>
        {c.uploadPhase === 'selected' ? <Button variant="secondary" disabled={disabled} onClick={() => inputRef.current?.click()}>Vybrat jinou fotografii</Button> : null}
        <Status role="status" aria-live="polite" aria-atomic="true">{statusText}</Status>
        <div className="selected-actions">
          {c.uploadPhase === 'selected' ? <Button disabled={disabled} onClick={() => {setChoosingFile(false); void c.upload();}}>Nahrát fotografii</Button> : null}
          {c.uploadPhase === 'unknown' ? <Button disabled={disabled || !c.attempt.candidate} onClick={c.recover}>Ověřit a připojit</Button> : null}
          {c.uploadPhase === 'provider-confirmed-unattached' ? <Button disabled={disabled || !c.attempt.providerPublicId} onClick={c.recover}>Zkusit připojit znovu</Button> : null}
          <Button variant="secondary" disabled={busy} onClick={cancelUpload}>Zrušit</Button>
          {!['idle','selected','signing','uploading','completing'].includes(c.uploadPhase) ? <Button variant="secondary" disabled={busy} onClick={closeUpload}>Zavřít</Button> : null}
        </div>
        {c.uploadPhase === 'uploading' ? <div style={{gridColumn: '1/-1'}}>
          <Progress aria-label="Průběh nahrávání fotografie" max={100} {...(c.progress === null ? {} : {value: c.progress})}/>
          <Copy>{c.progress === null ? 'Nahrávání…' : `${c.progress} %`}</Copy>
        </div> : null}
        {c.uploadPhase === 'signing' || c.uploadPhase === 'completing' ? <Spinner size="sm"/> : null}
      </Selected> : <>
        <FileChoice><strong>Fotografie produktu</strong><Copy>JPG, JPEG, PNG nebo WEBP, maximálně 15 MB.</Copy>
          <Button disabled={disabled} onClick={() => inputRef.current?.click()}>Vybrat fotografii</Button></FileChoice>
        <Status role="status" aria-live="polite" aria-atomic="true">{c.feedback}</Status>
        <Button variant="secondary" onClick={cancelUpload}>Zrušit</Button>
      </>}
      </Upload>
    </Dialog>
    {editingPhoto && c.attempt ? <ProductPhotoEditor key={c.attempt.attemptId} open={uploadDialogOpen}
      source={c.attempt.file} sourceUrl={c.attempt.previewUrl} onCancel={() => setEditingAttemptId(null)}
      onApply={file => {c.selectFile(file);setEditingAttemptId(null);}}/> : null}
    {c.photos.length === 0 ? <Empty><strong>Produkt zatím nemá žádné fotografie.</strong>
      <Copy>Přidejte první fotografii. Po připojení se automaticky stane hlavní fotografií produktu.</Copy></Empty>
      : <List data-photo-list>{ordered.map((photo, index) => <Item key={photo.publicId} data-photo-id={photo.publicId}>
        {broken[photo.publicId] ? <Broken>Náhled fotografie nelze zobrazit</Broken>
          : <Preview src={photo.url} alt={photo.alt || props.productName} onError={() => setBroken(previous => ({...previous, [photo.publicId]: true}))}/>}
        <Body>{index === 0 ? <MainBadge tone="neutral">Hlavní fotografie</MainBadge> : null}
          <div><strong>Alternativní text</strong><Copy>{photo.alt || props.productName}</Copy></div></Body>
        <ItemActions>
          <Button data-media-action="edit" data-wide size="compact" variant="secondary" disabled={disabled || Boolean(c.editingAlt && c.editingAlt !== photo.publicId)} onClick={() => c.startAlt(photo.publicId)}>Upravit ALT</Button>
          <Button data-media-action="delete" data-wide size="compact" variant="destructive" disabled={disabled}
            onClick={event => props.onRequestDelete?.({publicId: photo.publicId, trigger: event.currentTarget, distinctCount: new Set(c.photos.map(p => p.publicId)).size, isMain: index === 0})}>Odebrat fotografii</Button>
          <Button data-media-action="earlier" size="compact" variant="secondary" disabled={disabled || index === 0} onClick={() => move(photo.publicId, -1)}>Posunout dříve</Button>
          <Button data-media-action="later" size="compact" variant="secondary" disabled={disabled || index === ordered.length - 1} onClick={() => move(photo.publicId, 1)}>Posunout později</Button>
        </ItemActions>
        {c.editingAlt === photo.publicId ? <AltEditor>
          <label htmlFor={`alt-${photo.publicId}`}><strong>Alternativní text</strong></label>
          <textarea id={`alt-${photo.publicId}`} maxLength={180} disabled={disabled} value={c.drafts.altById[photo.publicId] ?? ''}
            onChange={event => {const value = event.currentTarget.value; c.setDrafts(d => ({...d, altById: {...d.altById, [photo.publicId]: value}}));}}/>
          <Actions><Button disabled={disabled} onClick={c.saveAlt}>Uložit ALT</Button>
            <Button variant="secondary" disabled={busy} onClick={c.cancelAlt}>Zrušit</Button></Actions>
        </AltEditor> : null}
      </Item>)}</List>}
    {c.orderDirty ? <OrderActions data-order-actions><Button disabled={disabled} onClick={c.saveOrder}>Uložit pořadí</Button>
      <Button variant="secondary" disabled={busy} onClick={c.cancelOrder}>Zrušit změny pořadí</Button></OrderActions> : null}
    {c.reconciliationNotice ? <Copy data-media-reconciliation-note>{c.reconciliationNotice}</Copy> : null}
    {c.lostAltNotice !== null ? <Empty><strong>Rozpracovaný ALT text</strong><Copy>{c.lostAltNotice || 'Prázdný ALT text'}</Copy></Empty> : null}
    {c.guard === 'product-missing' ? <Empty><strong>Produkt už není dostupný</strong><Copy>Produkt už nebyl nalezen. Další změny fotografií nelze uložit.</Copy>
      <Copy>Vaše neuložené změny na této stránce zůstávají zachované, dokud ji neopustíte.</Copy></Empty> : null}
    {c.refreshReason ? <Button variant="secondary" disabled={disabled} onClick={c.refresh}>Načíst aktuální fotografie</Button> : null}
    {!uploadDialogOpen ? <Status role="status" aria-live="polite" aria-atomic="true">{statusText}</Status> : null}
  </Section>;
});
