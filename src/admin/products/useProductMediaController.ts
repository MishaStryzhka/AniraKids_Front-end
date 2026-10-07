import {useCallback, useEffect, useRef, useState, type SetStateAction} from 'react';
import type {ActivationDomainGuardSnapshot} from './productActivationModel';
import {getAdminProductDetail, type AdminProduct, type AdminProductPhoto, type AdminProductStatus} from '../api/products';
import {
  completeProductPhoto, deleteProductPhoto, productMediaCandidate, reorderProductPhotos,
  signProductPhoto, updateProductPhotoAlt, type ProductMediaUploadDescriptor,
} from '../api/productMedia';
import {AdminApiError} from '../api/errors';
import {uploadProductMedia, ProviderUploadError} from '../media/productMediaProviderTransport';
import {
  distinctPhotoIds, isOrderDirty, moveId, photoIds, reconcileMediaDrafts, validateAlt,
  validatePhotoFile, type MediaGuardStatus, type ProductMediaDrafts,
} from './productMediaModel';

export type UploadPhase = 'idle' | 'selected' | 'signing' | 'uploading' | 'completing'
  | 'unknown' | 'provider-confirmed-unattached' | 'identity-mismatch';
interface Attempt {
  attemptId: number;
  productId: string;
  file: File;
  filename: string;
  previewUrl: string;
  descriptor?: ProductMediaUploadDescriptor;
  candidate?: string;
  providerPublicId?: string;
}
export interface ProductMediaControllerInput {
  productId: string;
  productName: string;
  status?: AdminProductStatus;
  token: string;
  initialPhotos: AdminProductPhoto[];
  onRiskChange?(risk: boolean): void;
  onProductMissing?(): void;
  onAccessError?(error: unknown): boolean;
}

export function useProductMediaController(input: ProductMediaControllerInput) {
  const {productId, initialPhotos, onRiskChange} = input;
  const [photos, setPhotos] = useState(initialPhotos);
  const [guard, setGuard] = useState<MediaGuardStatus>('available');
  const [drafts, commitDrafts] = useState<ProductMediaDrafts>({altById: {}, orderIds: photoIds(initialPhotos)});
  const [operation, setOperation] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshReason, setRefreshReason] = useState<'photo-missing' | 'conflict' | 'reconciled' | 'refresh-failed' | null>(null);
  const [lostAltNotice, setLostAltNotice] = useState<string | null>(null);
  const [reconciliationNotice, setReconciliationNotice] = useState<string | null>(null);
  const [recoveryFailed, setRecoveryFailed] = useState(false);
  const [uploadPhase, commitUploadPhase] = useState<UploadPhase>('idle');
  const uploadPhaseRef=useRef(uploadPhase);uploadPhaseRef.current=uploadPhase;
  const setUploadPhase=useCallback((next:UploadPhase)=>{uploadPhaseRef.current=next;commitUploadPhase(next);},[]);
  const [progress, setProgress] = useState<number | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const photosRef = useRef(photos);
  const draftsRef = useRef(drafts);
  const editingAltRef = useRef(editingAlt);
  photosRef.current = photos;
  draftsRef.current = drafts;
  const setDrafts=(next:SetStateAction<ProductMediaDrafts>)=>{const value=typeof next==='function'?next(draftsRef.current):next;draftsRef.current=value;commitDrafts(value);};
  editingAltRef.current = editingAlt;
  const writeGen = useRef(0);
  const refreshGen = useRef(0);
  const attemptSeq = useRef(0);
  const mounted = useRef(true);
  const controller = useRef<AbortController | null>(null);
  const refreshController = useRef<AbortController | null>(null);
  const productRef = useRef(productId);
  const snapshotProductRef = useRef(productId);

  const invalidateAll = useCallback(() => {
    mounted.current = false;
    writeGen.current++;
    refreshGen.current++;
    controller.current?.abort();
    refreshController.current?.abort();
  }, []);
  useEffect(() => {
    mounted.current = true;
    productRef.current = productId;
    return invalidateAll;
  }, [productId, invalidateAll]);
  useEffect(() => () => {
    if (attempt?.previewUrl) URL.revokeObjectURL(attempt.previewUrl);
  }, [attempt?.previewUrl]);
  useEffect(() => {
    if (snapshotProductRef.current !== productId) {
      // A cancelled A operation is not B's operation or draft.
      snapshotProductRef.current = productId;
      setPhotos(initialPhotos);
      setDrafts({altById: {}, orderIds: photoIds(initialPhotos)});
      setOperation(null);
      setProgress(null);
      setAttempt(null);
      setUploadPhase('idle');
      setEditingAlt(null);
      setGuard('available');
      setFeedback(null);
      setRefreshReason(null);
      setLostAltNotice(null);
      setReconciliationNotice(null);
      setRecoveryFailed(false);
      return;
    }
    const result = reconcileMediaDrafts({previousPhotos: photosRef.current, previousDrafts: draftsRef.current, nextPhotos: initialPhotos});
    const activeEditor = editingAltRef.current;
    if (activeEditor && result.missingAltTargetIds.includes(activeEditor)) {
      setLostAltNotice(draftsRef.current.altById[activeEditor] ?? '');
      setEditingAlt(null);
    }
    setPhotos(initialPhotos);
    setDrafts(result.drafts);
    if (result.membershipChanged) setRefreshReason('reconciled');
  }, [productId, initialPhotos, setUploadPhase]);

  const orderDirty = isOrderDirty(photos, drafts.orderIds);
  const savedAlt = photos.find(p => p.publicId === editingAlt)?.alt ?? '';
  const altDirty = editingAlt ? (drafts.altById[editingAlt] ?? savedAlt) !== savedAlt : false;
  const immediatePending = useRef(false);
  const risk = Boolean(operation || uploadPhase !== 'idle' || orderDirty || altDirty);
  immediatePending.current = Boolean(operation);
  const getActivationGuardSnapshot = ():ActivationDomainGuardSnapshot => ({hasUnsavedWork:isOrderDirty(photosRef.current,draftsRef.current.orderIds)||Boolean(editingAltRef.current&&(draftsRef.current.altById[editingAltRef.current]??savedAlt)!==savedAlt)||uploadPhaseRef.current==='selected',pendingMutation:immediatePending.current,unresolvedOutcome:!['idle','selected','signing','uploading','completing'].includes(uploadPhaseRef.current)});
  useEffect(() => onRiskChange?.(risk), [risk, onRiskChange]);
  const safe = (generation: number) => mounted.current && productRef.current === productId && generation === writeGen.current;
  const apply = (product: AdminProduct) => {
    const previousPhotos = photosRef.current;
    const previousDrafts = draftsRef.current;
    const result = reconcileMediaDrafts({previousPhotos, previousDrafts, nextPhotos: product.photos});
    // No side effects inside state updaters: replay must not overwrite success feedback.
    setPhotos(product.photos);
    setDrafts(result.drafts);
    if (result.membershipChanged) {
      setRefreshReason('reconciled');
      if (isOrderDirty(previousPhotos, previousDrafts.orderIds)) {
        setReconciliationNotice('Seznam fotografií se změnil. Pořadí bylo sjednoceno s aktuálním stavem.');
      }
    }
    if (editingAlt && result.missingAltTargetIds.includes(editingAlt)) {
      setLostAltNotice(previousDrafts.altById[editingAlt] ?? '');
      setEditingAlt(null);
      setReconciliationNotice('Upravovaná fotografie už u produktu není. Rozpracovaný ALT text nebyl znovu připojen.');
    }
    setGuard('available');
  };
  const fail = (error: unknown, generation: number, defaultCopy: string) => {
    if (!safe(generation) || input.onAccessError?.(error)) return;
    if (error instanceof AdminApiError) {
      if (error.code === 'PHOTO_NOT_FOUND') {
        setRefreshReason('photo-missing');
        setFeedback('Fotografie už u produktu není. Načtěte aktuální fotografie.');
        return;
      }
      if (error.code === 'PRODUCT_NOT_FOUND') {
        setGuard('product-missing');
        input.onProductMissing?.();
        setFeedback('Produkt už nebyl nalezen. Další změny fotografií nelze uložit.');
        return;
      }
      if (error.code === 'PRODUCT_PHOTO_REQUIRED') {
        setRefreshReason('reconciled');
        setFeedback('Fotografii nelze odebrat. Aktivní produkt musí mít alespoň jednu fotografii.');
        return;
      }
      if (error.code === 'MEDIA_CONFIGURATION_ERROR') {
        setGuard('configuration-error');
        setFeedback('Služba fotografií není správně nakonfigurovaná.');
        return;
      }
    }
    setFeedback(defaultCopy);
  };
  const begin = (name: string) => {
    immediatePending.current = true;
    const generation = ++writeGen.current;
    refreshGen.current++;
    refreshController.current?.abort();
    controller.current?.abort();
    controller.current = new AbortController();
    setOperation(name);
    setFeedback(null);
    return {generation, signal: controller.current.signal};
  };
  const finish = (generation: number) => {
    if (safe(generation)) {setOperation(null); setProgress(null);}
  };

  const selectFile = useCallback((file: File) => {
    const error = validatePhotoFile(file);
    if (error) {setFeedback(error); return;}
    if (photos.length >= 10) {setFeedback('Produkt může mít maximálně 10 fotografií.'); return;}
    if (attempt?.previewUrl) URL.revokeObjectURL(attempt.previewUrl);
    setAttempt({attemptId: ++attemptSeq.current, productId, file, filename: file.name, previewUrl: URL.createObjectURL(file)});
    setUploadPhase('selected');
    setRecoveryFailed(false);
    setFeedback(null);
  }, [photos.length, attempt, productId, setUploadPhase]);
  const discardUpload = () => {
    if (attempt?.previewUrl) URL.revokeObjectURL(attempt.previewUrl);
    setAttempt(null);
    setUploadPhase('idle');
    setProgress(null);
    setRecoveryFailed(false);
  };
  const upload = async () => {
    if (!attempt || guard !== 'available' || operation || uploadPhase !== 'selected') return;
    const {generation, signal} = begin('upload');
    let providerSucceeded = false;
    try {
      setUploadPhase('signing');
      const signed = await signProductPhoto({token: input.token, productId, signal});
      if (!safe(generation)) return;
      const descriptor = signed.upload;
      const candidate = productMediaCandidate(descriptor);
      setAttempt(a => a ? {...a, descriptor, candidate} : a);
      setUploadPhase('uploading');
      const provider = await uploadProductMedia({upload: descriptor, file: attempt.file, signal,
        onProgress: value => {if (safe(generation)) setProgress(value);}});
      providerSucceeded = true;
      if (!safe(generation)) return;
      setAttempt(a => a ? {...a, providerPublicId: provider.publicId} : a);
      if (provider.publicId !== candidate) {
        setUploadPhase('identity-mismatch');
        setFeedback('Výsledek nahrání se nepodařilo bezpečně přiřadit k podepsané fotografii. Fotografii znovu nenahrávejte.');
        return;
      }
      setProgress(null);
      setUploadPhase('completing');
      const completed = await completeProductPhoto({token: input.token, productId, publicId: provider.publicId, signal});
      if (!safe(generation)) return;
      apply(completed.product);
      setFeedback('Fotografie byla připojena k produktu.');
      discardUpload();
    } catch (error) {
      if (!safe(generation) || (error as {name?: string})?.name === 'AbortError') return;
      if (error instanceof ProviderUploadError && error.outcome === 'unknown') {
        setUploadPhase('unknown');
        setFeedback('Fotografie mohla být nahrána. Zatím ji znovu nenahrávejte.');
      } else if (providerSucceeded) {
        setUploadPhase('provider-confirmed-unattached');
        fail(error, generation, 'Fotografie byla nahrána, ale její připojení k produktu se nepodařilo potvrdit.');
      } else {
        setUploadPhase('selected');
        fail(error, generation, 'Fotografii se nepodařilo nahrát.');
      }
    } finally {finish(generation);}
  };
  const recover = async () => {
    if (!attempt || operation || guard !== 'available' || !['unknown', 'provider-confirmed-unattached'].includes(uploadPhase)) return;
    const previousPhase = uploadPhase;
    const publicId = previousPhase === 'provider-confirmed-unattached' ? attempt.providerPublicId : attempt.candidate;
    if (!publicId) {setFeedback('Výsledek nahrání se nepodařilo potvrdit.'); return;}
    const {generation, signal} = begin('recover');
    try {
      setUploadPhase('completing');
      const result = await completeProductPhoto({token: input.token, productId, publicId, signal});
      if (!safe(generation)) return;
      const attached = result.product.photos.some(p => p.publicId === publicId);
      apply(result.product);
      if (attached) {
        setFeedback('Fotografie byla připojena k produktu.');
        discardUpload();
      } else {
        setUploadPhase(previousPhase);
        setRecoveryFailed(true);
        setFeedback('Výsledek se stále nepodařilo ověřit');
      }
    } catch (error) {
      if (!safe(generation)) return;
      // A failed lookup cannot undo the already confirmed provider identity/category.
      setUploadPhase(previousPhase);
      setRecoveryFailed(true);
      if (error instanceof AdminApiError && error.status === 502 && error.code === 'CLOUDINARY_OPERATION_FAILED') {
        setFeedback('Služba fotografie nepotvrdila, zda soubor existuje. Fotografie zatím není potvrzeně připojena k produktu.');
      } else fail(error, generation, 'Výsledek se stále nepodařilo ověřit');
    } finally {finish(generation);}
  };
  const refresh = async () => {
    if (operation || guard !== 'available' || !input.token) return;
    const generation = ++refreshGen.current;
    const observedWrite = writeGen.current;
    refreshController.current?.abort();
    const ac = new AbortController();
    refreshController.current = ac;
    const current = () => mounted.current && productRef.current === productId && generation === refreshGen.current
      && observedWrite === writeGen.current && !ac.signal.aborted;
    setFeedback(null);
    try {
      const result = await getAdminProductDetail({token: input.token, productId, signal: ac.signal});
      if (!current()) return;
      const reconciliation = reconcileMediaDrafts({previousPhotos: photosRef.current, previousDrafts: draftsRef.current, nextPhotos: result.product.photos});
      apply(result.product);
      if (reconciliation.membershipChanged) {
        setRefreshReason('reconciled');
        setFeedback('Seznam fotografií se změnil. Pořadí bylo sjednoceno s aktuálním stavem.');
      } else {
        setRefreshReason(null);
        setFeedback('Aktuální fotografie byly načteny.');
      }
    } catch (error) {
      if (!current()) return;
      setRefreshReason('refresh-failed');
      fail(error, observedWrite, 'Fotografie se nepodařilo znovu načíst. Zkuste načíst aktuální fotografie znovu.');
    } finally {if (current()) refreshController.current = null;}
  };

  const startAlt = (id: string) => {
    if (operation || guard !== 'available') return;
    setEditingAlt(id);
    setDrafts(d => ({...d, altById: {...d.altById, [id]: photos.find(p => p.publicId === id)?.alt ?? ''}}));
  };
  const cancelAlt = () => {
    if (editingAlt) setDrafts(d => {
      const next = {...d.altById};
      delete next[editingAlt];
      return {...d, altById: next};
    });
    setEditingAlt(null);
  };
  const saveAlt = async () => {
    if (!editingAlt || operation || guard !== 'available') return;
    const value = drafts.altById[editingAlt] ?? '';
    const error = validateAlt(value);
    if (error) {setFeedback(error); return;}
    const {generation, signal} = begin('alt');
    try {
      const result = await updateProductPhotoAlt({token: input.token, productId, publicId: editingAlt, alt: value, signal});
      if (!safe(generation)) return;
      apply(result.product);
      setEditingAlt(null);
      setFeedback('Alternativní text byl uložen.');
    } catch (e) {fail(e, generation, 'Alternativní text se nepodařilo uložit.');}
    finally {finish(generation);}
  };
  const move = (id: string, delta: -1 | 1) => {
    if (operation || guard !== 'available') return;
    setDrafts(d => ({...d, orderIds: moveId(d.orderIds, id, delta)}));
  };
  const cancelOrder = () => setDrafts(d => ({...d, orderIds: photoIds(photos)}));
  const saveOrder = async () => {
    if (!orderDirty || operation || guard !== 'available') return;
    const {generation, signal} = begin('order');
    try {
      const result = await reorderProductPhotos({token: input.token, productId, publicIds: drafts.orderIds, signal});
      if (!safe(generation)) return;
      apply(result.product);
      setFeedback('Pořadí fotografií bylo uloženo.');
    } catch (error) {
      if (!safe(generation)) return;
      if (error instanceof AdminApiError && error.status === 409 && error.code === 'PHOTO_STATE_CONFLICT') {
        setRefreshReason('conflict');
        setFeedback('Fotografie se mezitím změnily jinde. Načtěte aktuální stav a zkontrolujte své změny.');
      } else fail(error, generation, 'Pořadí fotografií se nepodařilo uložit.');
    } finally {finish(generation);}
  };
  const remove = async (id: string) => {
    if (operation || guard !== 'available') return false;
    if (input.status === 'active' && distinctPhotoIds(photos).length === 1) {
      setFeedback('Fotografii nelze odebrat. Aktivní produkt musí mít alespoň jednu fotografii.');
      return false;
    }
    const {generation, signal} = begin('delete');
    try {
      const result = await deleteProductPhoto({token: input.token, productId, publicId: id, signal});
      if (!safe(generation)) return false;
      apply(result.product);
      setFeedback('Fotografie byla odebrána z produktu.');
      return true;
    } catch (error) {
      fail(error, generation, 'Fotografii se nepodařilo odebrat.');
      return false;
    } finally {finish(generation);}
  };
  return {
    getActivationGuardSnapshot, photos, guard, drafts, setDrafts, operation, feedback, refreshReason, lostAltNotice, reconciliationNotice, recoveryFailed, uploadPhase,
    progress, attempt, editingAlt, orderDirty, risk, selectFile, discardUpload, upload, recover,
    startAlt, cancelAlt, saveAlt, move, cancelOrder, saveOrder, remove, refresh,
  };
}
