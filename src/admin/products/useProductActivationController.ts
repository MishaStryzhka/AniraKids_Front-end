import {useCallback, useEffect, useRef, useState, type MutableRefObject} from 'react';
import {activateAdminProduct, getAdminProductActivationState, type AdminProductActivationState, type AdminProductStatus} from '../api/products';
import {AdminApiError} from '../api/errors';
import {parseActivationRequirements, usableActivationMetadata, type ActivationReadinessResult} from './productActivationModel';

type Attempt = {productId: string; attemptId: number; generation: number};
type Feedback = 'confirmed-active' | 'observed-active' | 'observed-draft' | 'observed-archived' | null;
interface State {
  operation: (Attempt & {kind: 'activate' | 'reconcile'}) | null;
  readiness: ActivationReadinessResult | null;
  unknownOutcome: Attempt | null;
  conflict: Attempt | null;
  productMissing: boolean;
  error: string | null;
  feedback: Feedback;
}
const initialState = (): State => ({operation: null, readiness: null, unknownOutcome: null, conflict: null, productMissing: false, error: null, feedback: null});
interface Input {
  productId: string; token: string; status?: AdminProductStatus; scopeKey: string;
  contextRevision: number;
  canStart(): boolean;
  metadataGeneration: MutableRefObject<number>;
  onMetadata(value: AdminProductActivationState): void;
  onAccessError(error: unknown): boolean;
  onFocus(target: 'status' | 'result' | 'heading', owner?: Element | null): void;
}
export function useProductActivationController(input: Input) {
  const [state, setState] = useState<State>(initialState);
  const stateRef = useRef(state);
  const latest = useRef(input); latest.current = input;
  const generation = useRef(0), sequence = useRef(0);
  const request = useRef<AbortController | null>(null);
  const alive = useRef(true);
  const publish = (update: (previous: State) => State) => {stateRef.current = update(stateRef.current); setState(stateRef.current);};
  const invalidateLifetime=useCallback(()=>{alive.current=false;generation.current++;request.current?.abort();request.current=null;},[]);
  useEffect(() => {
    alive.current = true;
    generation.current++;
    stateRef.current = initialState(); setState(stateRef.current);
    return invalidateLifetime;
  }, [input.scopeKey,invalidateLifetime]);
  const fresh = (attempt: Attempt, scopeKey: string) => alive.current && latest.current.scopeKey === scopeKey &&
    latest.current.productId === attempt.productId && generation.current === attempt.generation;
  const invalidateReadiness = () => publish(previous => ({...previous,
    readiness: previous.readiness ? {...previous.readiness, superseded: true} : null,
  }));
  const canActivate = () => {
    const current = stateRef.current;
    return current.feedback !== 'confirmed-active' && latest.current.status === 'draft' && Boolean(latest.current.token) && latest.current.canStart() &&
      !current.operation && !request.current && !current.unknownOutcome && !current.conflict && !current.productMissing;
  };
  const activate = async () => {
    if (!canActivate()) return;
    const scopeKey = latest.current.scopeKey;
    const attempt: Attempt = {productId: latest.current.productId, attemptId: ++sequence.current, generation: ++generation.current};
    const revision = latest.current.contextRevision;
    const controller = new AbortController(); request.current = controller;
    publish(previous => ({...previous, operation: {...attempt, kind: 'activate'}, error: null, feedback: null,
      readiness: previous.readiness ? {...previous.readiness, superseded: true} : null}));
    try {
      const metadata = await activateAdminProduct({productId: attempt.productId, token: latest.current.token, signal: controller.signal});
      if (!fresh(attempt, scopeKey)) return;
      if (!usableActivationMetadata(metadata, attempt.productId) || metadata.status !== 'active' || metadata.seoNoIndex !== false) throw new Error('Unusable activation response');
      latest.current.metadataGeneration.current++;
      latest.current.onMetadata(metadata);
      publish(previous => ({...previous, readiness: null, unknownOutcome: null, conflict: null, feedback: 'confirmed-active'}));
      latest.current.onFocus('status');
    } catch (error) {
      if (!fresh(attempt, scopeKey)) return;
      if (latest.current.onAccessError(error)) return;
      if (error instanceof AdminApiError && error.status === 409 && error.code === 'PRODUCT_NOT_READY') {
        const requirements=parseActivationRequirements(error.details);
        publish(previous => ({...previous, readiness: {attemptId: attempt.attemptId, requirements, contextRevisionAtAttempt: revision, superseded: false}}));
        latest.current.onFocus('result');
      } else if (error instanceof AdminApiError && error.status === 409 && error.code === 'PRODUCT_STATE_CONFLICT') {
        publish(previous => ({...previous, conflict: attempt}));
      } else if (error instanceof AdminApiError && error.status === 404 && error.code === 'PRODUCT_NOT_FOUND') {
        publish(previous => ({...previous, productMissing: true}));
      } else if (error instanceof AdminApiError && error.status === 400 && ['INVALID_ID', 'VALIDATION_ERROR'].includes(error.code)) {
        publish(previous => ({...previous, error: 'Aktivaci se nepodařilo provést. Zkontrolujte zadané údaje.'}));
      } else {
        // An unusable response, cancellation or generic server failure cannot prove no commit.
        latest.current.metadataGeneration.current++;
        publish(previous => ({...previous, unknownOutcome: attempt}));
      }
    } finally {
      if (fresh(attempt, scopeKey)) {request.current = null; publish(previous => ({...previous, operation: null}));}
    }
  };
  const reconcile = async () => {
    const captured = stateRef.current.conflict ?? stateRef.current.unknownOutcome;
    if (!captured || request.current || stateRef.current.productMissing || !latest.current.token) return;
    const wasConflict = stateRef.current.conflict === captured;
    const scopeKey = latest.current.scopeKey, metadataGeneration = latest.current.metadataGeneration.current;
    const owner = document.activeElement;
    const controller = new AbortController(); request.current = controller;
    publish(previous => ({...previous, operation: {...captured, kind: 'reconcile'}, error: null}));
    const ownsRecord = () => fresh(captured, scopeKey) &&
      (wasConflict ? stateRef.current.conflict : stateRef.current.unknownOutcome) === captured;
    try {
      const metadata = await getAdminProductActivationState({productId: captured.productId, token: latest.current.token, signal: controller.signal});
      if (!ownsRecord() || metadataGeneration !== latest.current.metadataGeneration.current) return;
      if (!usableActivationMetadata(metadata, captured.productId)) throw new Error('Unusable recovery response');
      latest.current.metadataGeneration.current++;
      latest.current.onMetadata(metadata);
      publish(previous => ({...previous, conflict: wasConflict ? null : previous.conflict,
        unknownOutcome: wasConflict ? previous.unknownOutcome : null, feedback: `observed-${metadata.status}`,
        readiness: previous.readiness ? {...previous.readiness, superseded: true} : null}));
      latest.current.onFocus(metadata.status === 'draft' ? 'heading' : 'status', owner);
    } catch (error) {
      if (!ownsRecord() || metadataGeneration !== latest.current.metadataGeneration.current || latest.current.onAccessError(error)) return;
      if (error instanceof AdminApiError && error.status === 404 && error.code === 'PRODUCT_NOT_FOUND') {
        publish(previous => ({...previous, productMissing: true}));
      } else publish(previous => ({...previous, error: 'Aktuální stav produktu se nepodařilo načíst. Zkuste to znovu.'}));
    } finally {
      if (fresh(captured, scopeKey)) {request.current = null; publish(previous => ({...previous, operation: null}));}
    }
  };
  return {...state, activate, reconcile, canActivate, invalidateReadiness,
    hasRisk: state.operation?.kind === 'activate' || Boolean(state.unknownOutcome),
    hasImmediateRisk: () => stateRef.current.operation?.kind === 'activate' || Boolean(stateRef.current.unknownOutcome),
  };
}
export type ProductActivationController = ReturnType<typeof useProductActivationController>;
