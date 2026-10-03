import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import styled from 'styled-components';
import {Button} from '../../design-system/components/Button';
import {Divider} from '../../design-system/components/Divider';
import {Input} from '../../design-system/components/Input';
import {StatusBadge} from '../../design-system/components/StatusBadge';
import {designTokens as t} from '../../design-system/tokens/designTokens';
import {AdminApiError} from '../api/errors';
import {
  createAdminVariant,
  getAdminProductVariants,
  updateAdminVariantSize,
  type AdminProductDetailVariant,
  type AdminVariant,
} from '../api/products';
import {
  isVariantEditorDirty,
  projectDetailVariants,
  reconcileCreatedVariant,
  reconcileUnknownCreate,
  reconcileUpdatedVariant,
  sortAdminVariants,
  validateVariantSize,
  variantSizeErrorCopy,
  type VariantEditorTarget,
} from './productVariantsModel';

const Section = styled.section`
  inline-size: 100%;
  max-inline-size: 840px;
  min-inline-size: 0;
  margin-block-start: ${t.space[4]};
  display: grid;
  gap: ${t.space[6]};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${t.space[4]};

  @media (max-width: 767px) {
    align-items: stretch;
    flex-direction: column;

    > button { inline-size: 100%; }
  }
`;

const Heading = styled.h2`
  margin: 0;
  font: 600 22px/30px ${t.font.family.ui};
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid ${t.color.border.subtle};
  border-radius: ${t.radius[2]};
  overflow: visible;
`;

const Item = styled.li`
  padding: ${t.space[4]};
  min-inline-size: 0;

  & + & { border-block-start: 1px solid ${t.color.border.subtle}; }
`;

const Row = styled.div`
  display: grid;
  grid-template-areas:
    "size"
    "status"
    "sku"
    "edit";
  grid-template-columns: minmax(0, 1fr);
  gap: ${t.space[3]};
  align-items: center;
  min-inline-size: 0;

  @media (min-width: 768px) and (max-width: 1023px) {
    grid-template-areas:
      "size status"
      "sku edit";
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: ${t.space[6]};
  }

  @media (min-width: 1024px) {
    grid-template-areas: "size status sku edit";
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto;
    column-gap: ${t.space[6]};
  }
`;

const Size = styled.div`
  grid-area: size;
  min-inline-size: 0;
  display: grid;
  gap: ${t.space[1]};
  overflow-wrap: anywhere;

  > span:first-child {
    color: ${t.color.text.secondary};
    font-size: ${t.type.caption.size};
    line-height: ${t.type.caption.lineHeight};
  }

  > span:last-child { font-weight: ${t.font.weight.semibold}; }
`;
const VariantStatus = styled.div`grid-area: status; justify-self: start;`;
const Sku = styled.div`
  grid-area: sku;
  min-inline-size: 0;
  color: ${t.color.text.secondary};
  overflow-wrap: anywhere;
`;
const EditAction = styled.div`
  grid-area: edit;

  @media (max-width: 767px) {
    > button { inline-size: 100%; }
  }
`;

const Editor = styled.div`
  margin-block-start: ${t.space[4]};
  display: grid;
  gap: ${t.space[3]};
  min-inline-size: 0;
`;

const EditorActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${t.space[2]};

  @media (max-width: 767px) {
    display: grid;
    grid-template-columns: 1fr;

    > button { inline-size: 100%; }
  }
`;

const Empty = styled.div`
  padding: ${t.space[6]};
  display: grid;
  gap: ${t.space[3]};
  border: 1px solid ${t.color.border.subtle};
  border-radius: ${t.radius[2]};
  color: ${t.color.text.secondary};

  strong { color: ${t.color.text.primary}; }

  @media (max-width: 767px) {
    > button { inline-size: 100%; }
  }
`;

const Message = styled.p`
  margin: 0;
  color: ${t.color.text.secondary};
  overflow-wrap: anywhere;
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${t.color.status.danger.strong};
  font-size: ${t.type.bodySm.size};
  line-height: ${t.type.bodySm.lineHeight};
`;

export interface VariantSwitchIntent {
  target: VariantEditorTarget;
}

export interface ProductVariantsSectionHandle {
  resolveCurrentEditorFocus(): HTMLElement | null;
  focusCurrentEditor(): void;
  discardAndOpen(target: VariantEditorTarget): void;
}

export interface ProductVariantsSectionProps {
  productId: string;
  token: string;
  initialVariants: AdminProductDetailVariant[];
  onRiskChange?(risk: boolean): void;
  onRequestEditorSwitch?(intent: VariantSwitchIntent): void;
  onAccessError?(error: unknown): boolean;
}

type Operation = null | 'create' | `update:${string}`;
type RefreshReason = null | 'unknown-create' | 'missing-variant' | 'sku-conflict' | 'refresh-failed';

function available(element: HTMLElement | null | undefined): element is HTMLElement {
  if (!element?.isConnected || element.matches(':disabled,[aria-disabled="true"]') || element.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
  const style = getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

export const ProductVariantsSection = forwardRef<ProductVariantsSectionHandle, ProductVariantsSectionProps>(
  function ProductVariantsSection(props, ref) {
    const [canonicalVariants, setCanonicalVariants] = useState<AdminVariant[]>(() =>
      sortAdminVariants(projectDetailVariants(props.initialVariants)),
    );
    const [activeEditor, setActiveEditor] = useState<VariantEditorTarget | null>(null);
    const [sizeDraft, setSizeDraft] = useState('');
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [operation, setOperation] = useState<Operation>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshReason, setRefreshReason] = useState<RefreshReason>(null);
    const [unknownCreate, setUnknownCreate] = useState<string | null>(null);
    const [missingVariantId, setMissingVariantId] = useState<string | null>(null);
    const [productMissing, setProductMissing] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const editorTriggerRef = useRef<HTMLElement | null>(null);
    const pendingSwitchTriggerRef = useRef<HTMLElement | null>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const mounted = useRef(true);
    const productRef = useRef(props.productId);
    const mutationGeneration = useRef(0);
    const refreshGeneration = useRef(0);
    const mutationController = useRef<AbortController | null>(null);
    const refreshController = useRef<AbortController | null>(null);
    const focusGeneration = useRef(0);

    const editorDirty = useMemo(() => isVariantEditorDirty({
      target: activeEditor,
      sizeDraft,
      variants: canonicalVariants,
    }), [activeEditor, canonicalVariants, sizeDraft]);
    const risk = editorDirty || operation !== null || unknownCreate !== null;

    useEffect(() => props.onRiskChange?.(risk), [props.onRiskChange, risk]);

    useEffect(() => {
      mounted.current = true;
      productRef.current = props.productId;
      return () => {
        mounted.current = false;
        mutationGeneration.current += 1;
        refreshGeneration.current += 1;
        focusGeneration.current += 1;
        mutationController.current?.abort();
        refreshController.current?.abort();
      };
    }, [props.productId]);

    const scheduleFocus = (resolve: () => HTMLElement | null | undefined) => {
      const generation = ++focusGeneration.current;
      const productId = props.productId;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!mounted.current || productRef.current !== productId || focusGeneration.current !== generation) return;
        if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
        const target = resolve();
        if (available(target)) target.focus();
      }));
    };

    const fallbackFocus = () => {
      const root = sectionRef.current;
      if (!root) return null;
      const control = Array.from(root.querySelectorAll<HTMLElement>('button,input')).find(available);
      return control ?? root.querySelector<HTMLElement>('#product-variants-title');
    };

    const focusEditButton = (variantId: string) => scheduleFocus(() => {
      const root = sectionRef.current;
      const row = Array.from(root?.querySelectorAll<HTMLElement>('[data-variant-id]') ?? [])
        .find(item => item.dataset.variantId === variantId);
      return row?.querySelector<HTMLElement>('[data-variant-edit]') ?? fallbackFocus();
    });

    const openEditor = (target: VariantEditorTarget, trigger?: HTMLElement | null) => {
      if (operation || productMissing) return;
      editorTriggerRef.current = trigger ?? pendingSwitchTriggerRef.current;
      pendingSwitchTriggerRef.current = null;
      setActiveEditor(target);
      setSizeDraft(target.kind === 'add'
        ? ''
        : canonicalVariants.find(variant => variant.id === target.variantId)?.size ?? '');
      setFieldError(null);
      setSubmitError(null);
      setMissingVariantId(null);
      setFeedback(null);
      scheduleFocus(() => inputRef.current ?? fallbackFocus());
    };

    const requestEditor = (target: VariantEditorTarget, trigger: HTMLElement) => {
      if (operation || productMissing) return;
      const same = activeEditor?.kind === target.kind &&
        (target.kind === 'add' || (activeEditor?.kind === 'edit' && activeEditor.variantId === target.variantId));
      if (same) return;
      if (editorDirty) {
        pendingSwitchTriggerRef.current = trigger;
        props.onRequestEditorSwitch?.({target});
        return;
      }
      openEditor(target, trigger);
    };

    const cancelEditor = () => {
      if (operation) return;
      const trigger = editorTriggerRef.current;
      setActiveEditor(null);
      setSizeDraft('');
      setFieldError(null);
      setSubmitError(null);
      setMissingVariantId(null);
      setFeedback(null);
      editorTriggerRef.current = null;
      scheduleFocus(() => available(trigger) ? trigger : fallbackFocus());
    };

    useImperativeHandle(ref, () => ({
      resolveCurrentEditorFocus() {
        return available(inputRef.current) ? inputRef.current : fallbackFocus();
      },
      focusCurrentEditor() {
        scheduleFocus(() => inputRef.current ?? fallbackFocus());
      },
      discardAndOpen(target) {
        setActiveEditor(null);
        setSizeDraft('');
        setFieldError(null);
        setSubmitError(null);
        setMissingVariantId(null);
        requestAnimationFrame(() => {
          if (!mounted.current || productRef.current !== props.productId) return;
          openEditor(target, pendingSwitchTriggerRef.current);
        });
      },
    }), [canonicalVariants, operation, productMissing, props.productId]);

    const mutationAllowed = () => !operation && !productMissing && Boolean(props.token);

    const beginMutation = (next: Exclude<Operation, null>) => {
      if (!mutationAllowed()) return null;
      const generation = ++mutationGeneration.current;
      refreshGeneration.current += 1;
      refreshController.current?.abort();
      mutationController.current?.abort();
      const controller = new AbortController();
      mutationController.current = controller;
      setOperation(next);
      setFieldError(null);
      setSubmitError(null);
      setFeedback(null);
      return {generation, signal: controller.signal, productId: props.productId};
    };

    const mutationSafe = (generation: number, productId: string) =>
      mounted.current && productRef.current === productId && mutationGeneration.current === generation;

    const finishMutation = (generation: number, productId: string) => {
      if (!mutationSafe(generation, productId)) return;
      setOperation(null);
      mutationController.current = null;
    };

    const handleError = (error: unknown, context: 'create' | 'update', variantId?: string) => {
      if (props.onAccessError?.(error)) return;
      if (!(error instanceof AdminApiError)) {
        setSubmitError('Variantu se nepodařilo uložit. Zkontrolujte zadané údaje.');
        return;
      }
      if (error.kind === 'cancelled') return;
      if (error.code === 'PRODUCT_NOT_FOUND') {
        setProductMissing(true);
        setSubmitError(null);
        return;
      }
      if (error.code === 'VARIANT_SIZE_ALREADY_EXISTS') {
        setFieldError('Tato velikost už u produktu existuje.');
        scheduleFocus(() => inputRef.current);
        return;
      }
      if (error.code === 'VARIANT_NOT_FOUND' && variantId) {
        setMissingVariantId(variantId);
        setRefreshReason('missing-variant');
        setSubmitError('Velikost nelze uložit, protože varianta už nebyla nalezena.');
        return;
      }
      if (error.code === 'SKU_ALREADY_EXISTS') {
        setSubmitError('Variantu se nepodařilo uložit kvůli konfliktu SKU. SKU se v tomto kroku neupravuje. Načtěte aktuální varianty a zkontrolujte stav.');
        setRefreshReason('sku-conflict');
        return;
      }
      if (error.code === 'VALIDATION_ERROR') {
        setSubmitError('Variantu se nepodařilo uložit. Zkontrolujte zadané údaje.');
        scheduleFocus(() => inputRef.current);
        return;
      }
      if (context === 'create' && error.kind === 'network') {
        const attempted = normalizeDraft();
        setUnknownCreate(attempted);
        setRefreshReason('unknown-create');
        setSubmitError(null);
        return;
      }
      if (context === 'update' && error.kind === 'network') {
        setSubmitError('Variantu se nepodařilo uložit. Zkontrolujte připojení a zkuste to znovu.');
        return;
      }
      setSubmitError('Variantu se nepodařilo uložit. Zkontrolujte zadané údaje.');
    };

    const normalizeDraft = () => sizeDraft.trim();

    const save = async () => {
      if (!activeEditor || !mutationAllowed()) return;
      if (activeEditor.kind === 'edit' && missingVariantId === activeEditor.variantId) return;
      const validation = validateVariantSize({
        value: sizeDraft,
        variants: canonicalVariants,
        editingVariantId: activeEditor.kind === 'edit' ? activeEditor.variantId : undefined,
      });
      if (validation.error) {
        setFieldError(variantSizeErrorCopy(validation.error));
        scheduleFocus(() => inputRef.current);
        return;
      }

      if (activeEditor.kind === 'add') {
        const started = beginMutation('create');
        if (!started) return;
        try {
          const variant = await createAdminVariant({
            token: props.token,
            productId: started.productId,
            body: {size: validation.value},
            signal: started.signal,
          });
          if (!mutationSafe(started.generation, started.productId)) return;
          if (variant.productId !== started.productId) {
            setSubmitError('Variantu se nepodařilo uložit. Zkontrolujte zadané údaje.');
            return;
          }
          setCanonicalVariants(previous => reconcileCreatedVariant(previous, variant));
          setActiveEditor(null);
          setSizeDraft('');
          setUnknownCreate(null);
          setRefreshReason(null);
          setFeedback('Varianta byla přidána.');
          editorTriggerRef.current = null;
          focusEditButton(variant.id);
        } catch (error) {
          if (!mutationSafe(started.generation, started.productId)) return;
          handleError(error, 'create');
        } finally {
          finishMutation(started.generation, started.productId);
        }
        return;
      }

      const variantId = activeEditor.variantId;
      const started = beginMutation(`update:${variantId}`);
      if (!started) return;
      try {
        const variant = await updateAdminVariantSize({
          token: props.token,
          variantId,
          body: {size: validation.value},
          signal: started.signal,
        });
        if (!mutationSafe(started.generation, started.productId)) return;
        if (variant.id !== variantId || variant.productId !== started.productId) {
          setSubmitError('Variantu se nepodařilo uložit. Zkontrolujte zadané údaje.');
          return;
        }
        setCanonicalVariants(previous => reconcileUpdatedVariant(previous, variant));
        setActiveEditor(null);
        setSizeDraft('');
        setMissingVariantId(null);
        setRefreshReason(null);
        setFeedback('Velikost byla uložena.');
        editorTriggerRef.current = null;
        focusEditButton(variant.id);
      } catch (error) {
        if (!mutationSafe(started.generation, started.productId)) return;
        handleError(error, 'update', variantId);
      } finally {
        finishMutation(started.generation, started.productId);
      }
    };

    const refresh = async () => {
      if (operation || refreshing || !props.token) return;
      const generation = ++refreshGeneration.current;
      const observedMutation = mutationGeneration.current;
      refreshController.current?.abort();
      const controller = new AbortController();
      refreshController.current = controller;
      const productId = props.productId;
      setRefreshing(true);
      setSubmitError(null);
      try {
        const detailVariants = await getAdminProductVariants({token: props.token, productId, signal: controller.signal});
        if (!mounted.current || productRef.current !== productId || refreshGeneration.current !== generation ||
          mutationGeneration.current !== observedMutation) return;
        const variants = sortAdminVariants(projectDetailVariants(detailVariants));
        setCanonicalVariants(variants);
        if (unknownCreate) {
          const result = reconcileUnknownCreate({variants, attemptedSize: unknownCreate});
          setUnknownCreate(null);
          setRefreshReason(null);
          if (result.found) {
            setFieldError('Tato velikost už u produktu existuje.');
            setFeedback('V aktuálních variantách už tato velikost existuje. Zkontrolujte stav před další akcí.');
          } else {
            setFieldError(null);
            setFeedback('Aktuální varianty byly načteny. Vytvoření můžete zkusit znovu.');
          }
        } else if (missingVariantId) {
          if (variants.some(variant => variant.id === missingVariantId)) {
            setMissingVariantId(null);
            setRefreshReason(null);
            setSubmitError(null);
            setFeedback('Aktuální varianty byly načteny.');
          } else {
            setRefreshReason('missing-variant');
            setFeedback('Varianta už není dostupná.');
          }
        } else {
          setRefreshReason(null);
          setFeedback('Aktuální varianty byly načteny.');
        }
      } catch (error) {
        if (!mounted.current || productRef.current !== productId || refreshGeneration.current !== generation ||
          mutationGeneration.current !== observedMutation) return;
        if (props.onAccessError?.(error)) return;
        if (error instanceof AdminApiError && error.kind === 'cancelled') return;
        if (error instanceof AdminApiError && error.code === 'PRODUCT_NOT_FOUND') {
          setProductMissing(true);
          return;
        }
        setRefreshReason('refresh-failed');
        setSubmitError('Varianty se nepodařilo načíst. Zkuste to znovu.');
      } finally {
        if (mounted.current && productRef.current === productId && refreshGeneration.current === generation &&
          mutationGeneration.current === observedMutation) {
          setRefreshing(false);
          refreshController.current = null;
        }
      }
    };

    const renderEditor = (target: VariantEditorTarget) => {
      const isUpdate = target.kind === 'edit';
      const targetMissing = isUpdate && missingVariantId === target.variantId;
      const loading = operation === 'create' || (isUpdate && operation === `update:${target.variantId}`);
      return <Editor data-variant-editor>
        <Input
          ref={inputRef}
          label="Velikost"
          value={sizeDraft}
          maxLength={40}
          disabled={Boolean(operation) || productMissing}
          error={Boolean(fieldError)}
          aria-describedby={fieldError ? 'variant-size-error' : undefined}
          onChange={event => {
            setSizeDraft(event.currentTarget.value);
            setFieldError(null);
            setSubmitError(null);
          }}
        />
        {fieldError ? <ErrorText id="variant-size-error">{fieldError}</ErrorText> : null}
        {targetMissing ? <Message><strong>Varianta už není dostupná</strong><br/>Velikost nelze uložit, protože varianta už nebyla nalezena.</Message> : null}
        <EditorActions>
          <Button variant="secondary" disabled={Boolean(operation)} onClick={cancelEditor}>Zrušit</Button>
          <Button
            data-variant-submit
            loading={loading}
            disabled={Boolean(operation) || productMissing || Boolean(targetMissing)}
            onClick={save}
          >
            {loading ? (isUpdate ? 'Ukládání…' : 'Přidávání…') : (isUpdate ? 'Uložit velikost' : 'Přidat variantu')}
          </Button>
        </EditorActions>
      </Editor>;
    };

    return <Section ref={sectionRef} data-product-variants-section aria-labelledby="product-variants-title">
      <Divider/>
      <Header>
        <Heading id="product-variants-title" tabIndex={-1}>Varianty</Heading>
        <Button
          data-variant-add
          disabled={Boolean(operation) || productMissing}
          onClick={(event: ReactMouseEvent<HTMLButtonElement>) => requestEditor({kind: 'add'}, event.currentTarget)}
        >
          Přidat variantu
        </Button>
      </Header>

      {activeEditor?.kind === 'add' ? renderEditor(activeEditor) : null}

      {canonicalVariants.length === 0 ? <Empty data-variant-empty>
        <strong>Produkt zatím nemá žádné varianty</strong>
        <span>Přidejte první velikost produktu.</span>
        <Button
          disabled={Boolean(operation) || productMissing}
          onClick={(event: ReactMouseEvent<HTMLButtonElement>) => requestEditor({kind: 'add'}, event.currentTarget)}
        >
          Přidat variantu
        </Button>
      </Empty> : <List data-variant-list>
        {canonicalVariants.map(variant => <Item key={variant.id} data-variant-id={variant.id}>
          <Row>
            <Size><span>Velikost</span><span data-variant-size>{variant.size}</span></Size>
            <VariantStatus>
              <StatusBadge tone={variant.status === 'active' ? 'success' : 'neutral'}>
                {variant.status === 'active' ? 'Aktivní' : 'Neaktivní'}
              </StatusBadge>
            </VariantStatus>
            <Sku>SKU: {variant.sku || 'Neuvedeno'}</Sku>
            <EditAction>
              <Button
                data-variant-edit
                size="compact"
                variant="secondary"
                disabled={Boolean(operation) || productMissing}
                onClick={(event: ReactMouseEvent<HTMLButtonElement>) =>
                  requestEditor({kind: 'edit', variantId: variant.id}, event.currentTarget)}
              >
                Upravit velikost
              </Button>
            </EditAction>
          </Row>
          {activeEditor?.kind === 'edit' && activeEditor.variantId === variant.id ? renderEditor(activeEditor) : null}
        </Item>)}
      </List>}

      {unknownCreate ? <Message data-variant-unknown>
        <strong>Výsledek vytvoření varianty není potvrzený</strong><br/>
        Požadavek mohl být zpracován. Než variantu vytvoříte znovu, načtěte aktuální varianty.
      </Message> : null}

      {productMissing ? <Message data-variant-product-missing>
        <strong>Produkt už není dostupný</strong><br/>
        Produkt už nebyl nalezen. Další změny variant nelze uložit.
      </Message> : null}

      {submitError ? <ErrorText role="alert">{submitError}</ErrorText> : null}
      {feedback ? <Message role="status" aria-live="polite">{feedback}</Message> : null}

      {refreshReason ? <Button variant="secondary" loading={refreshing} disabled={Boolean(operation)} onClick={refresh}>
        Načíst aktuální varianty
      </Button> : null}
    </Section>;
  },
);
