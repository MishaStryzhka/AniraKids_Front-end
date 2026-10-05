import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useBeforeUnload, useBlocker, useLocation, useNavigate, useNavigationType, useParams} from 'react-router-dom';
import styled from 'styled-components';
import {X} from 'lucide-react';
import {Button} from '../../design-system/components/Button';
import {IconButton} from '../../design-system/components/IconButton';
import {NavigationLink} from '../../design-system/components/NavigationLink';
import {Dialog} from '../../design-system/components/Dialog';
import {designTokens as t} from '../../design-system/tokens/designTokens';
import {useAuth} from '../../hooks/useAuth';
import {AdminApiError} from '../api/errors';
import {createAdminProduct, getAdminProductDetail, updateAdminProduct, type AdminProduct, type AdminProductDetailVariant, type AdminProductStatus} from '../api/products';
import {useAdminAccess} from '../auth/AdminAccessBoundary';
import {adminRoutes, buildAdminProductDetailPath} from '../navigation/adminRoutes';
import {ProductCoreForm, type ProductCoreFormHandle} from './ProductCoreForm';
import {ProductMediaSection, type MediaDeleteIntent, type MediaDeleteSettlement} from './ProductMediaSection';
import {ProductVariantsSection, type EditorSwitchIntent, type ProductVariantsSectionHandle, type VariantyEditorTarget} from './ProductVariantsSection';
import type {InventoryRetireIntent} from './ProductInventoryItems';
import type {InventoryRiskMeta} from './productInventoryModel';
import {coreFormStatesEquivalent, initialProductCoreFormState, productToCoreFormState, serializeAdminProductPatch, serializeCreateAdminProduct, type ProductCoreFormState} from './productCoreFormModel';
import {validateProductCoreForm, type ProductCoreErrors, type ProductCoreField, type ProductCoreFocusTarget} from './productCoreValidation';

const Page = styled.div`inline-size:100%;max-inline-size:840px;display:grid;gap:${t.space[4]};`;
const Guidance = styled.p`margin:0;color:${t.color.text.secondary};`;
const State = styled.section`max-inline-size:640px;display:grid;gap:${t.space[3]};`;
const Actions = styled.div`display:flex;flex-wrap:wrap;gap:${t.space[3]};`;
const RetireDialogActions = styled(Actions)`@media(max-width:767px){display:grid;grid-template-columns:minmax(0,1fr);inline-size:100%;>button{min-inline-size:0;inline-size:100%;}}`;
const Feedback = styled.div`
  display:flex;align-items:center;justify-content:space-between;gap:${t.space[3]};padding:${t.space[3]};
  border:1px solid ${t.color.status.success.fg};border-radius:${t.radius[2]};background:${t.color.status.success.bg};
`;
const backendFieldMap: Record<string, ProductCoreField> = {
  name:'name',slug:'slug',description:'description',category:'category',gender:'gender',color:'color',ageTags:'ageTags',
  brand:'brand',familyLookGroup:'familyLookGroup','rentalPrices.studio':'rentalStudioPrice','rentalPrices.external':'rentalExternalPrice',
  defaultSalePrice:'defaultSalePrice',defaultDeposit:'defaultDeposit','seo.title':'seoTitle','seo.description':'seoDescription',
};
const backendFieldFallback: Partial<Record<ProductCoreField, string>> = {
  name:'Zkontrolujte název.',slug:'Zkontrolujte URL / slug.',description:'Zkontrolujte popis.',category:'Zkontrolujte kategorii.',
  gender:'Zkontrolujte určení.',color:'Zkontrolujte barvu.',ageTags:'Zkontrolujte věková označení.',brand:'Zkontrolujte značku.',
  familyLookGroup:'Zkontrolujte rodinný look.',rentalStudioPrice:'Zkontrolujte cenu ve studiu.',rentalExternalPrice:'Zkontrolujte cenu mimo studio.',
  defaultSalePrice:'Zkontrolujte prodejní cenu.',defaultDeposit:'Zkontrolujte zálohu.',seoTitle:'Zkontrolujte SEO titulek.',seoDescription:'Zkontrolujte SEO popis.',
};
type FeedbackKind = 'created' | 'updated';
type ActiveDialog = {kind:'none'} | {kind:'leave'} | ({kind:'delete'} & MediaDeleteIntent)
  | {kind:'editor-switch';dirtyDomain:'variant'|'inventory';target:VariantyEditorTarget}
  | {kind:'inventory-retire';intent:InventoryRetireIntent};
const EMPTY_INVENTORY_RISK: InventoryRiskMeta = {
  hasRisk:false,
  hasDraft:false,
  missingTargetDraft:false,
  editorPendingOrUnresolved:false,
  lifecyclePendingOrUnresolved:false,
  pendingOrUnresolved:false,
};
function ProductSuccessFeedback({kind, onDismiss}: {kind: FeedbackKind; onDismiss(): void}) {
  return <Feedback aria-live="polite"><span>{kind === 'created' ? 'Produkt byl vytvořen.' : 'Změny byly uloženy.'}</span>
    <IconButton aria-label="Zavřít potvrzení" icon={<X aria-hidden="true"/>} onClick={onDismiss}/></Feedback>;
}
function isProduct(value: unknown): value is AdminProduct {
  return Boolean(value && typeof value === 'object' && typeof (value as AdminProduct).id === 'string' && typeof (value as AdminProduct).name === 'string');
}

export function AdminProductCorePage({mode}: {mode: 'create' | 'edit'}) {
  const {productId} = useParams();
  const {token} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const {handleRequestError} = useAdminAccess();
  const hydrationState = location.state as {adminProductCoreHydration?: unknown; adminProductCoreFeedback?: unknown} | null;
  const validHydration = mode === 'edit' && navigationType === 'REPLACE' && hydrationState?.adminProductCoreFeedback === 'created'
    && isProduct(hydrationState.adminProductCoreHydration) && hydrationState.adminProductCoreHydration.id === productId
    ? hydrationState.adminProductCoreHydration : null;
  const hydrated = validHydration ? productToCoreFormState(validHydration) : null;
  const [current, setCurrent] = useState<ProductCoreFormState>(() => hydrated ?? initialProductCoreFormState);
  const [baseline, setBaseline] = useState<ProductCoreFormState>(() => hydrated ?? initialProductCoreFormState);
  const [status, setStatus] = useState<AdminProductStatus | undefined>(() => validHydration?.status);
  const [mediaPhotos, setMediaPhotos] = useState(() => validHydration?.photos ?? []);
  const [mediaProductName, setMediaProductName] = useState(() => validHydration?.name ?? '');
  const [mediaRisk, setMediaRisk] = useState(false);
  const [mediaPending, setMediaPending] = useState(false);
  const [variantSeed, setVariantSeed] = useState<AdminProductDetailVariant[]>([]);
  const [variantRisk, setVariantRisk] = useState(false);
  const [variantPending, setVariantPending] = useState(false);
  const [inventoryRisk, setInventoryRisk] = useState<InventoryRiskMeta>(EMPTY_INVENTORY_RISK);
  const [retireStartPending,setRetireStartPending]=useState<InventoryRetireIntent|null>(null);
  const [loading, setLoading] = useState(mode === 'edit' && !validHydration);
  const [loadError, setLoadError] = useState<'not-found' | 'network' | null>(null);
  const [retryRevision, setRetryRevision] = useState(0);
  const [errors, setErrors] = useState<ProductCoreErrors>({});
  const [ageTagErrors, setAgeTagErrors] = useState<Record<number, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackKind | null>(validHydration ? 'created' : null);
  const formRef = useRef<ProductCoreFormHandle>(null);
  const variantsRef = useRef<ProductVariantsSectionHandle>(null);
  const saveInFlightRef = useRef(false);
  const saveControllerRef = useRef<AbortController | null>(null);
  const requestSequence = useRef(0);
  const bypassRef = useRef(false);
  const dirty = useMemo(() => !coreFormStatesEquivalent(current, baseline), [current, baseline]);
  const hasRisk = dirty || mediaRisk || variantRisk || inventoryRisk.hasRisk || Boolean(retireStartPending);
  const hasPendingOrUnresolved = submitting || mediaPending || variantPending || inventoryRisk.pendingOrUnresolved || Boolean(retireStartPending);
  const inventoryNonLifecycleRisk = inventoryRisk.hasDraft || inventoryRisk.missingTargetDraft || inventoryRisk.editorPendingOrUnresolved;
  const lifecycleOnlyRisk = (inventoryRisk.lifecyclePendingOrUnresolved || Boolean(retireStartPending))
    && !dirty && !mediaRisk && !variantRisk && !inventoryNonLifecycleRisk;
  const inventoryOnlyRisk = inventoryNonLifecycleRisk && !dirty && !mediaRisk && !variantRisk
    && !inventoryRisk.lifecyclePendingOrUnresolved && !retireStartPending;
  const localDialogOpen = useRef(false);
  const blocker = useBlocker(() => (hasRisk || localDialogOpen.current) && !bypassRef.current);

  // One page-owned dialog. Navigation cannot replace an unresolved deletion confirmation.
  const [dialogState, setDialogState] = useState<ActiveDialog>({kind: 'none'});
  localDialogOpen.current = dialogState.kind === 'delete' || dialogState.kind === 'editor-switch' || dialogState.kind === 'inventory-retire';
  const [deleteRequest, setDeleteRequest] = useState<{publicId: string; nonce: number} | null>(null);
  const deleteNonce = useRef(0);
  const pendingDelete = useRef<number | null>(null);
  const restoreTarget = useRef<(() => HTMLElement | null) | null>(null);
  const safeDialogButton = useRef<HTMLButtonElement | null>(null);
  const previousDialogKind = useRef<ActiveDialog['kind']>('none');
  const proceededLocation = useRef<string | null>(null);
  const scopeKey = `${mode}:${productId ?? ''}:${location.key}`;
  const scope = useRef({key: scopeKey, alive: true});
  scope.current.key = scopeKey;
  useEffect(() => {
    const lifecycle = scope.current;
    lifecycle.alive = true;
    return () => {lifecycle.alive = false; pendingDelete.current = null; restoreTarget.current = null;};
  }, [scopeKey]);
  useEffect(() => {
    if (blocker.state !== 'blocked') {proceededLocation.current = null; return;}
    if (dialogState.kind === 'delete' || dialogState.kind === 'editor-switch' || dialogState.kind === 'inventory-retire') return;
    if (!hasRisk) {
      if (proceededLocation.current !== blocker.location.key) {
        proceededLocation.current = blocker.location.key;
        restoreTarget.current = null;
        setDialogState({kind: 'none'});
        blocker.proceed();
      }
    } else if (dialogState.kind !== 'leave') setDialogState({kind: 'leave'});
  }, [blocker, dialogState.kind, hasRisk]);
  useEffect(() => {
    if ((previousDialogKind.current === 'delete' || previousDialogKind.current === 'editor-switch' || previousDialogKind.current === 'inventory-retire') && dialogState.kind === 'leave') safeDialogButton.current?.focus();
    previousDialogKind.current = dialogState.kind;
  }, [dialogState.kind]);

  useEffect(()=>{
    if(!retireStartPending||dialogState.kind!=='none')return;
    const intent=retireStartPending;
    const expectedScope=scopeKey;
    const first=window.requestAnimationFrame(()=>{
      if(!scope.current.alive||scope.current.key!==expectedScope)return;
      variantsRef.current?.retireInventoryItem({variantId:intent.variantId,inventoryItemId:intent.inventoryItemId});
      window.requestAnimationFrame(()=>{
        if(scope.current.alive&&scope.current.key===expectedScope){
          setRetireStartPending(current=>current===intent?null:current);
        }
      });
    });
    return()=>window.cancelAnimationFrame(first);
  },[retireStartPending,dialogState.kind,scopeKey]);

  useBeforeUnload(useCallback(event => {
    if (!hasRisk) return;
    event.preventDefault();
    event.returnValue = '';
  }, [hasRisk]));
  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(id);
  }, [feedback]);
  useEffect(() => () => saveControllerRef.current?.abort(), []);
  useEffect(() => {if (mode === 'edit' && validHydration) bypassRef.current = false;}, [mode, validHydration]);
  useEffect(() => {
    if (mode !== 'edit' || validHydration) return;
    if (!productId) {setLoading(false); setLoadError('not-found'); return;}
    const controller = new AbortController();
    const sequence = ++requestSequence.current;
    setLoading(true);
    setLoadError(null);
    getAdminProductDetail({token: token ?? '', productId, signal: controller.signal}).then(response => {
      const product = response.product;
      if (controller.signal.aborted || sequence !== requestSequence.current || product.id !== productId) return;
      const next = productToCoreFormState(product);
      setCurrent(next);
      setBaseline(next);
      setStatus(product.status);
      setMediaPhotos(product.photos);
      setMediaProductName(product.name);
      setVariantSeed(response.variants);
      setLoading(false);
    }).catch(error => {
      if (controller.signal.aborted || (error instanceof AdminApiError && error.kind === 'cancelled')) return;
      if (sequence !== requestSequence.current || handleRequestError(error)) return;
      setLoading(false);
      setLoadError(error instanceof AdminApiError && (error.status === 404 || (error.status === 400 && error.code === 'INVALID_ID')) ? 'not-found' : 'network');
    });
    return () => controller.abort();
  }, [mode, productId, retryRevision, token, handleRequestError, validHydration]);

  const submit = async () => {
    if (saveInFlightRef.current) return;
    const validation = validateProductCoreForm({mode, status, value: current});
    setErrors(validation.errors);
    setAgeTagErrors(validation.ageTagErrors);
    setSubmitError(null);
    if (!validation.valid) {
      if (validation.firstInvalid) requestAnimationFrame(() => formRef.current?.focus(validation.firstInvalid!));
      return;
    }
    const body = mode === 'create' ? serializeCreateAdminProduct(current) : serializeAdminProductPatch(current, baseline);
    if (mode === 'edit' && !Object.keys(body).length) {setSubmitError('Změny se nepodařilo připravit k uložení.'); return;}
    saveInFlightRef.current = true;
    setSubmitting(true);
    const controller = new AbortController();
    saveControllerRef.current = controller;
    const scrollY = window.scrollY;
    try {
      const product = mode === 'create'
        ? await createAdminProduct({token: token ?? '', body: body as Parameters<typeof createAdminProduct>[0]['body'], signal: controller.signal})
        : await updateAdminProduct({token: token ?? '', productId: productId!, body, signal: controller.signal});
      const next = productToCoreFormState(product);
      setCurrent(next);
      setBaseline(next);
      setStatus(product.status);
      setMediaProductName(product.name);
      setErrors({});
      setAgeTagErrors({});
      if (mode === 'create') {
        setFeedback('created');
        bypassRef.current = true;
        navigate(buildAdminProductDetailPath(product.id), {replace: true, state: {adminProductCoreHydration: product, adminProductCoreFeedback: 'created'}});
      } else {
        setFeedback('updated');
        requestAnimationFrame(() => window.scrollTo({top: scrollY}));
      }
    } catch (error) {
      if (controller.signal.aborted || (error instanceof AdminApiError && error.kind === 'cancelled')) return;
      if (handleRequestError(error)) return;
      const e = error as AdminApiError;
      if (e.status === 409 && e.code === 'SLUG_ALREADY_EXISTS') {
        setErrors(prev => ({...prev, slug: 'Tuto URL / slug už používá jiný produkt. Zvolte jiný.'}));
        requestAnimationFrame(() => formRef.current?.focus('slug'));
      } else if (e.status === 400 && e.code === 'VALIDATION_ERROR') {
        const path = e.details?.find(detail => backendFieldMap[detail]);
        if (path) {
          const field = backendFieldMap[path];
          const local = validateProductCoreForm({mode, status, value: current});
          const message = local.errors[field] ?? backendFieldFallback[field] ?? 'Zkontrolujte tuto hodnotu.';
          setErrors(prev => ({...prev, [field]: message}));
          const target: ProductCoreFocusTarget = field === 'ageTags' && current.ageTags.length ? {field: 'ageTag', index: 0} : field;
          requestAnimationFrame(() => formRef.current?.focus(target));
        } else setSubmitError('Produkt se nepodařilo uložit. Zkontrolujte zadané údaje.');
      } else if (mode === 'edit' && e.status === 404) setSubmitError('Produkt už nebyl nalezen. Vaše změny zůstaly zachované.');
      else setSubmitError('Produkt se nepodařilo uložit. Zkontrolujte připojení a zkuste to znovu.');
    } finally {
      saveInFlightRef.current = false;
      setSubmitting(false);
      saveControllerRef.current = null;
    }
  };

  const requestEditorSwitch = (intent: EditorSwitchIntent) => {
    if (dialogState.kind !== 'none') return;
    restoreTarget.current = () => variantsRef.current?.resolveCurrentEditorFocus() ?? null;
    setDialogState({kind:'editor-switch',dirtyDomain:intent.dirtyDomain,target:intent.target});
  };
  const stayEditorSwitch = () => {
    restoreTarget.current = () => variantsRef.current?.resolveCurrentEditorFocus() ?? null;
    setDialogState({kind:'none'});
  };
  const discardEditorSwitch = () => {
    if (dialogState.kind !== 'editor-switch') return;
    const target = dialogState.target;
    restoreTarget.current = null;
    variantsRef.current?.discardAndOpen(target);
    setDialogState({kind:'none'});
  };

  const requestInventoryRetire=(intent:InventoryRetireIntent)=>{
    if(dialogState.kind!=='none')return;
    restoreTarget.current=()=>intent.trigger;
    setDialogState({kind:'inventory-retire',intent});
  };
  const cancelInventoryRetire=()=>setDialogState({kind:'none'});
  const confirmInventoryRetire=()=>{
    if(dialogState.kind!=='inventory-retire')return;
    const intent=dialogState.intent;
    restoreTarget.current=()=>null;
    setRetireStartPending(intent);
    setDialogState({kind:'none'});
  };

  const requestDelete = (intent: MediaDeleteIntent) => {
    if (pendingDelete.current !== null || dialogState.kind !== 'none') return;
    restoreTarget.current = () => intent.trigger;
    setDialogState({kind: 'delete', ...intent});
  };
  const confirmDelete = () => {
    if (dialogState.kind !== 'delete' || pendingDelete.current !== null) return;
    const nonce = ++deleteNonce.current;
    pendingDelete.current = nonce;
    setDeleteRequest({publicId: dialogState.publicId, nonce});
  };
  const settleDelete = ({nonce, success, resolveFocus}: MediaDeleteSettlement) => {
    if (!scope.current.alive || scope.current.key !== scopeKey || pendingDelete.current !== nonce) return;
    if (success) restoreTarget.current = resolveFocus;
    pendingDelete.current = null;
    setDeleteRequest(null);
    setDialogState({kind: 'none'});
  };
  const cancelDelete = () => {if (pendingDelete.current === null) setDialogState({kind: 'none'});};
  const stay = () => {
    setDialogState({kind: 'none'});
    if (blocker.state === 'blocked') blocker.reset();
  };
  const leave = () => {
    restoreTarget.current = null;
    setDialogState({kind: 'none'});
    if (blocker.state === 'blocked') blocker.proceed();
  };
  const resolveRestoreFocus = (previous: HTMLElement | null) => {
    if (!scope.current.alive || scope.current.key !== scopeKey || blocker.state === 'proceeding') return null;
    const resolve = restoreTarget.current;
    restoreTarget.current = null;
    return resolve ? resolve() : previous;
  };
  const deleting = dialogState.kind === 'delete' ? dialogState : null;
  const switchingEditor = dialogState.kind === 'editor-switch' ? dialogState : null;
  const retiringInventory = dialogState.kind === 'inventory-retire' ? dialogState.intent : null;
  const DialogActionContainer = retiringInventory ? RetireDialogActions : Actions;
  const switchingInventory = switchingEditor?.dirtyDomain === 'inventory';
  const leaveTitle = mode === 'create'
    ? 'Neuložené změny'
    : lifecycleOnlyRisk
      ? 'Nedokončená změna provozního stavu'
      : inventoryOnlyRisk
        ? hasPendingOrUnresolved ? 'Nedokončená práce s fyzickým kusem' : 'Neuložené změny fyzického kusu'
        : 'Neuložené nebo nedokončené změny';
  const leaveDescription = mode === 'create'
    ? 'Máte neuložené změny. Opravdu chcete odejít?'
    : lifecycleOnlyRisk
      ? 'Změna provozního stavu probíhá nebo její výsledek není potvrzený. Pokud odejdete, požadavek už mohl být zpracován a opuštění stránky jej nevrátí zpět.'
      : inventoryOnlyRisk
        ? hasPendingOrUnresolved
          ? 'Výsledek operace s fyzickým kusem nemusí být potvrzený. Opuštění stránky neznamená, že se probíhající požadavek vrátí zpět.'
          : 'Máte neuložené změny fyzického kusu. Opravdu chcete odejít?'
        : 'Máte neuložené změny nebo nedokončenou práci na této stránce. Pokud odejdete, některé změny se nemusí uložit. Probíhající požadavek už ale mohl být zpracován.';
  const mixedWithInventory = inventoryRisk.hasRisk && (dirty || mediaRisk || variantRisk);
  const leaveAction = mode === 'create'
    ? 'Odejít bez uložení'
    : inventoryOnlyRisk
      ? hasPendingOrUnresolved ? 'Odejít' : 'Odejít bez uložení'
      : mixedWithInventory
        ? hasPendingOrUnresolved ? 'Odejít' : 'Odejít bez uložení'
        : 'Odejít';

  const protectedLastPhoto = Boolean(deleting && deleting.distinctCount === 1 && status === 'active');
  const deleteDescription = protectedLastPhoto ? 'Aktivní produkt musí mít alespoň jednu fotografii.'
    : deleting?.isMain && deleting.distinctCount > 1
      ? 'Fotografie bude odebrána z produktu. Tuto akci nelze v administraci vrátit zpět. Tato fotografie je nyní hlavní. Po odebrání se hlavní fotografií stane první zbývající fotografie.'
      : deleting?.distinctCount === 1
        ? 'Fotografie bude odebrána z produktu. Tuto akci nelze v administraci vrátit zpět. Je to jediná fotografie produktu. Po odebrání nebude mít produkt žádné fotografie.'
        : 'Fotografie bude odebrána z produktu. Tuto akci nelze v administraci vrátit zpět.';

  if (mode === 'edit' && loading) return <State role="status" aria-live="polite">Načítání produktu…</State>;
  if (mode === 'edit' && loadError === 'not-found') return <State><h2>Produkt nebyl nalezen</h2><p>Produkt už nemusí existovat nebo odkaz není platný.</p><NavigationLink variant="plain" to={adminRoutes.products}>Zpět na produkty</NavigationLink></State>;
  if (mode === 'edit' && loadError === 'network') return <State><h2>Produkt se nepodařilo načíst</h2><p>Zkuste to prosím znovu.</p><Actions><Button onClick={() => setRetryRevision(x => x + 1)}>Zkusit znovu</Button><NavigationLink variant="plain" to={adminRoutes.products}>Zpět na produkty</NavigationLink></Actions></State>;
  return <Page>
    {mode === 'create' ? <Guidance>Produkt se uloží jako koncept. Pro vytvoření je povinný pouze název; ostatní údaje můžete doplnit později.</Guidance> : null}
    {feedback ? <ProductSuccessFeedback kind={feedback} onDismiss={() => setFeedback(null)}/> : null}
    <ProductCoreForm ref={formRef} mode={mode} status={status} value={current} errors={errors} ageTagErrors={ageTagErrors}
      submitting={submitting} saveDisabled={submitting || (!dirty && mode === 'edit')} submitError={submitError}
      onChange={setCurrent} onSubmit={submit}/>
    {mode === 'edit' && productId ? <ProductMediaSection key={productId} productId={productId} productName={mediaProductName || current.name}
      status={status} token={token ?? ''} initialPhotos={mediaPhotos} onRiskChange={setMediaRisk} onPendingRiskChange={setMediaPending} onAccessError={handleRequestError}
      onRequestDelete={requestDelete} deleteRequest={deleteRequest} onDeleteSettled={settleDelete}/> : null}
    {mode === 'edit' && productId ? <ProductVariantsSection key={`variants:${productId}`} ref={variantsRef} productId={productId}
      token={token ?? ''} initialVariants={variantSeed} onRiskChange={setVariantRisk} onPendingRiskChange={setVariantPending}
      onInventoryRiskChange={setInventoryRisk} onRequestEditorSwitch={requestEditorSwitch}
      onRequestInventoryRetire={requestInventoryRetire} onAccessError={handleRequestError}/> : null}
    <Dialog open={dialogState.kind !== 'none'}
      title={deleting ? 'Odebrat fotografii?' : retiringInventory ? 'Vyřadit fyzický kus?' : switchingEditor ? switchingInventory ? 'Neuložené změny fyzického kusu' : 'Neuložená změna varianty' : leaveTitle}
      description={deleting ? deleteDescription : retiringInventory ? `Fyzický kus ${retiringInventory.internalCode} bude trvale převeden do stavu Vyřazený. Po vyřazení jej nelze znovu aktivovat.` : switchingEditor ? switchingInventory ? 'Máte neuložené změny fyzického kusu. Chcete je zahodit a pokračovat?' : 'Velikost má neuložené změny. Chcete je zahodit a pokračovat?' : leaveDescription}
      onEscape={deleting ? cancelDelete : retiringInventory ? cancelInventoryRetire : switchingEditor ? stayEditorSwitch : stay} resolveRestoreFocus={resolveRestoreFocus} initialFocusRef={safeDialogButton}>
      <DialogActionContainer ref={node => {safeDialogButton.current = node?.querySelector<HTMLButtonElement>('button') ?? null;}}>
        <Button disabled={Boolean(deleteRequest)} onClick={deleting ? cancelDelete : retiringInventory ? cancelInventoryRetire : switchingEditor ? stayEditorSwitch : stay}>{deleting || retiringInventory ? 'Zrušit' : 'Zůstat'}</Button>
        {deleting ? protectedLastPhoto ? null : <Button variant="destructive" disabled={Boolean(deleteRequest)} onClick={confirmDelete}>Odebrat fotografii</Button>
          : retiringInventory ? <Button variant="destructive" onClick={confirmInventoryRetire}>Vyřadit</Button>
          : switchingEditor ? <Button variant={switchingInventory ? 'secondary' : 'destructive'} onClick={discardEditorSwitch}>Zahodit změny a pokračovat</Button>
          : <Button variant="destructive" onClick={leave}>{leaveAction}</Button>}
      </DialogActionContainer>
    </Dialog>
  </Page>;
}
