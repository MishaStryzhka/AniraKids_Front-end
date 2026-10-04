import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {AdminApiError} from '../api/errors';
import {
  createAdminInventoryItem,
  getAdminProductInventorySnapshot,
  updateAdminInventoryItem,
  type AdminInventoryItem,
  type AdminProductDetailVariant,
} from '../api/products';
import {
  EMPTY_INVENTORY_CREATE_DRAFT,
  buildInventorySnapshot,
  buildInventorySnapshotFromProjection,
  canonicalInventoryCode,
  findInventoryItem,
  inventoryCodeErrorCopy,
  inventoryEditBaseline,
  isInventoryCreateDirty,
  isInventoryEditDirty,
  reconcileCreatedInventoryItem,
  reconcileUnknownInventoryCreate,
  reconcileUpdatedInventoryItem,
  serializeInventoryCreate,
  serializeInventoryPatch,
  validateInventoryCode,
  validateInventoryNotes,
  type InventoryCreateDraft,
  type InventoryEditDraft,
  type InventoryEditorTarget,
  type InventoryRiskMeta,
  type InventoryUnknownCreateAttempt,
  type ProductInventorySnapshot,
} from './productInventoryModel';

type InventoryOperation =
  | {kind:'create';variantId:string}
  | {kind:'update';variantId:string;inventoryItemId:string}
  | null;

type RefreshReason='unknown-create'|'missing-item'|'missing-variant'|'refresh-failed'|null;
type InventoryField='internalCode'|'condition'|'notes';

export interface UseProductInventoryControllerInput{
  productId:string;
  token:string;
  initialVariants:AdminProductDetailVariant[];
  onAccessError?(error:unknown):boolean;
}

export function useProductInventoryController(input:UseProductInventoryControllerInput){
  const [snapshot,setSnapshot]=useState<ProductInventorySnapshot>(()=>buildInventorySnapshot(input.initialVariants));
  const [activeEditor,setActiveEditor]=useState<InventoryEditorTarget|null>(null);
  const [createDraft,setCreateDraft]=useState<InventoryCreateDraft>({...EMPTY_INVENTORY_CREATE_DRAFT});
  const [editDraft,setEditDraft]=useState<InventoryEditDraft|null>(null);
  const [editBaseline,setEditBaseline]=useState<InventoryEditDraft|null>(null);
  const [editIdentity,setEditIdentity]=useState<AdminInventoryItem|null>(null);
  const [fieldErrors,setFieldErrors]=useState<Partial<Record<InventoryField,string>>>({});
  const [submitError,setSubmitError]=useState<string|null>(null);
  const [damagedError,setDamagedError]=useState(false);
  const [feedback,setFeedback]=useState<string|null>(null);
  const [feedbackVariantId,setFeedbackVariantId]=useState<string|null>(null);
  const [operation,setOperation]=useState<InventoryOperation>(null);
  const [refreshing,setRefreshing]=useState(false);
  const [refreshReason,setRefreshReason]=useState<RefreshReason>(null);
  const [unknownCreate,setUnknownCreate]=useState<InventoryUnknownCreateAttempt|null>(null);
  const [missingItemId,setMissingItemId]=useState<string|null>(null);
  const [missingVariantId,setMissingVariantId]=useState<string|null>(null);
  const [productMissing,setProductMissing]=useState(false);

  const mounted=useRef(true),productRef=useRef(input.productId),triggerRef=useRef<HTMLElement|null>(null);
  const mutationGeneration=useRef(0),refreshGeneration=useRef(0),focusGeneration=useRef(0);
  const mutationController=useRef<AbortController|null>(null),refreshController=useRef<AbortController|null>(null);
  const activeEditorRef=useRef(activeEditor),createDraftRef=useRef(createDraft),editDraftRef=useRef(editDraft),editBaselineRef=useRef(editBaseline);
  activeEditorRef.current=activeEditor;createDraftRef.current=createDraft;editDraftRef.current=editDraft;editBaselineRef.current=editBaseline;

  useEffect(()=>{
    const productChanged=productRef.current!==input.productId;
    mounted.current=true;
    productRef.current=input.productId;
    if(productChanged){
      setSnapshot(buildInventorySnapshot(input.initialVariants));
      setActiveEditor(null);setCreateDraft({...EMPTY_INVENTORY_CREATE_DRAFT});setEditDraft(null);setEditBaseline(null);setEditIdentity(null);
      setFieldErrors({});setSubmitError(null);setDamagedError(false);setFeedback(null);setFeedbackVariantId(null);setOperation(null);setRefreshing(false);
      setRefreshReason(null);setUnknownCreate(null);setMissingItemId(null);setMissingVariantId(null);setProductMissing(false);
      mutationController.current?.abort();refreshController.current?.abort();mutationController.current=null;refreshController.current=null;
      mutationGeneration.current++;refreshGeneration.current++;focusGeneration.current++;
    }
    return()=>{mounted.current=false;mutationGeneration.current++;refreshGeneration.current++;focusGeneration.current++;mutationController.current?.abort();refreshController.current?.abort();};
  // initial state is already seeded synchronously; only a real Product identity change resets this domain.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[input.productId]);

  const scheduleFocus=useCallback((resolve:()=>HTMLElement|null|undefined)=>{
    const generation=++focusGeneration.current,productId=input.productId;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(!mounted.current||productRef.current!==productId||focusGeneration.current!==generation)return;
      if(document.querySelector('[role="dialog"][aria-modal="true"]'))return;
      const node=resolve();
      if(node?.isConnected&&!node.matches(':disabled,[aria-disabled="true"]')&&!node.closest('[hidden],[inert],[aria-hidden="true"]'))node.focus();
    }));
  },[input.productId]);

  const editorDirty=useMemo(()=>{
    if(!activeEditor)return false;
    if(activeEditor.kind==='add')return isInventoryCreateDirty(createDraft);
    return Boolean(editDraft&&editBaseline&&isInventoryEditDirty(editDraft,editBaseline));
  },[activeEditor,createDraft,editDraft,editBaseline]);
  const missingTargetDraft=Boolean(activeEditor&&(missingItemId||missingVariantId));
  const riskMeta:InventoryRiskMeta=useMemo(()=>({
    hasDraft:editorDirty||missingTargetDraft,
    pendingOrUnresolved:Boolean(operation||unknownCreate),
    missingTargetDraft,
    hasRisk:editorDirty||missingTargetDraft||Boolean(operation||unknownCreate),
  }),[editorDirty,missingTargetDraft,operation,unknownCreate]);

  const clearMessages=()=>{setFieldErrors({});setSubmitError(null);setDamagedError(false);setFeedback(null);setFeedbackVariantId(null);};
  const open=(target:InventoryEditorTarget,trigger?:HTMLElement|null)=>{
    if(operation||unknownCreate||productMissing)return false;
    triggerRef.current=trigger??null;clearMessages();setMissingItemId(null);setMissingVariantId(null);
    if(target.kind==='add'){
      setCreateDraft({...EMPTY_INVENTORY_CREATE_DRAFT});setEditDraft(null);setEditBaseline(null);setEditIdentity(null);setActiveEditor(target);return true;
    }
    const item=findInventoryItem(snapshot,target.variantId,target.inventoryItemId);
    if(!item)return false;
    const baseline=inventoryEditBaseline(item);
    setEditDraft({...baseline});setEditBaseline(baseline);setEditIdentity(item);setActiveEditor(target);return true;
  };
  const discardCurrent=()=>{setActiveEditor(null);setCreateDraft({...EMPTY_INVENTORY_CREATE_DRAFT});setEditDraft(null);setEditBaseline(null);setEditIdentity(null);setFieldErrors({});setSubmitError(null);setDamagedError(false);setMissingItemId(null);setMissingVariantId(null);triggerRef.current=null;};
  const cancel=(fallback:()=>HTMLElement|null|undefined)=>{
    if(operation||unknownCreate)return;
    const trigger=triggerRef.current;discardCurrent();scheduleFocus(()=>trigger?.isConnected?trigger:fallback());
  };

  const safeMutation=(generation:number,productId:string,variantId:string,itemId?:string)=>{
    if(!mounted.current||productRef.current!==productId||mutationGeneration.current!==generation)return false;
    const target=activeEditorRef.current;
    if(!target||target.variantId!==variantId)return false;
    if(itemId&&!(target.kind==='edit'&&target.inventoryItemId===itemId))return false;
    return true;
  };
  const finishMutation=(generation:number,productId:string,variantId:string,itemId?:string)=>{
    if(!safeMutation(generation,productId,variantId,itemId))return;
    setOperation(null);mutationController.current=null;
  };
  const beginMutation=(next:Exclude<InventoryOperation,null>)=>{
    if(operation||mutationController.current||refreshing||productMissing||unknownCreate||!input.token)return null;
    refreshGeneration.current++;refreshController.current?.abort();refreshController.current=null;setRefreshing(false);
    const generation=++mutationGeneration.current,controller=new AbortController();
    mutationController.current=controller;setOperation(next);setSubmitError(null);setFieldErrors({});setDamagedError(false);setFeedback(null);
    return{generation,signal:controller.signal,productId:input.productId};
  };

  const handleMutationError=(error:unknown,kind:'create'|'update',variantId:string,itemId?:string)=>{
    if(input.onAccessError?.(error))return;
    if(!(error instanceof AdminApiError)){setSubmitError('Fyzický kus se nepodařilo uložit. Zkontrolujte zadané údaje.');return;}
    if(error.kind==='cancelled')return;
    if(error.code==='INVENTORY_CODE_ALREADY_EXISTS'){
      setFieldErrors({internalCode:'Tento interní kód už používá jiný fyzický kus.'});return;
    }
    if(error.code==='DAMAGED_ITEM_REQUIRES_MAINTENANCE'){
      setDamagedError(true);return;
    }
    if(error.code==='VARIANT_NOT_FOUND'&&kind==='create'){
      setMissingVariantId(variantId);setRefreshReason('missing-variant');return;
    }
    if(error.code==='INVENTORY_ITEM_NOT_FOUND'&&kind==='update'&&itemId){
      setMissingItemId(itemId);setRefreshReason('missing-item');return;
    }
    if(error.code==='VALIDATION_ERROR'){
      const details=error.details??[];
      if(details.some(x=>x.includes('internalCode')))setFieldErrors({internalCode:'Fyzický kus se nepodařilo uložit. Zkontrolujte zadané údaje.'});
      else if(details.some(x=>x.includes('condition')))setFieldErrors({condition:'Fyzický kus se nepodařilo uložit. Zkontrolujte zadané údaje.'});
      else if(details.some(x=>x.includes('notes')))setFieldErrors({notes:'Fyzický kus se nepodařilo uložit. Zkontrolujte zadané údaje.'});
      else setSubmitError('Fyzický kus se nepodařilo uložit. Zkontrolujte zadané údaje.');
      return;
    }
    if(kind==='create'&&error.kind==='network'){
      const draft=createDraftRef.current,internalCode=draft.internalCode.trim();
      setUnknownCreate({productId:input.productId,variantId,internalCode,canonicalInternalCode:canonicalInventoryCode(internalCode),condition:draft.condition,notes:draft.notes});
      setRefreshReason('unknown-create');return;
    }
    if(kind==='update'&&error.kind==='network'){
      setSubmitError('Fyzický kus se nepodařilo uložit. Zkontrolujte připojení a zkuste to znovu.');return;
    }
    setSubmitError('Fyzický kus se nepodařilo uložit. Zkontrolujte zadané údaje.');
  };

  const saveCreate=async(resolveField:(field:InventoryField)=>HTMLElement|null|undefined,resolveSuccess:(item:AdminInventoryItem)=>HTMLElement|null|undefined)=>{
    const target=activeEditorRef.current;if(!target||target.kind!=='add')return;
    const codeError=validateInventoryCode(createDraftRef.current.internalCode);
    const notesError=validateInventoryNotes(createDraftRef.current.notes);
    if(codeError||notesError){
      setFieldErrors({...(codeError?{internalCode:inventoryCodeErrorCopy(codeError)!}:{}),...(notesError?{notes:'Fyzický kus se nepodařilo uložit. Zkontrolujte zadané údaje.'}:{})});
      scheduleFocus(()=>resolveField(codeError?'internalCode':'notes'));return;
    }
    const started=beginMutation({kind:'create',variantId:target.variantId});if(!started)return;
    try{
      const item=await createAdminInventoryItem({token:input.token,variantId:target.variantId,body:serializeInventoryCreate(createDraftRef.current),signal:started.signal});
      if(!safeMutation(started.generation,started.productId,target.variantId))return;
      if(item.variantId!==target.variantId){setSubmitError('Fyzický kus se nepodařilo uložit. Zkontrolujte zadané údaje.');return;}
      setSnapshot(prev=>reconcileCreatedInventoryItem(prev,item));setActiveEditor(null);setCreateDraft({...EMPTY_INVENTORY_CREATE_DRAFT});setUnknownCreate(null);setRefreshReason(null);setFeedback('Fyzický kus byl přidán.');setFeedbackVariantId(item.variantId);triggerRef.current=null;
      scheduleFocus(()=>resolveSuccess(item));
    }catch(error){
      if(!safeMutation(started.generation,started.productId,target.variantId))return;
      handleMutationError(error,'create',target.variantId);
      if(error instanceof AdminApiError&&error.code==='INVENTORY_CODE_ALREADY_EXISTS')scheduleFocus(()=>resolveField('internalCode'));
    }finally{finishMutation(started.generation,started.productId,target.variantId);}
  };

  const saveEdit=async(resolveField:(field:InventoryField)=>HTMLElement|null|undefined,resolveSuccess:(item:AdminInventoryItem)=>HTMLElement|null|undefined)=>{
    const target=activeEditorRef.current;if(!target||target.kind!=='edit'||!editDraftRef.current||!editBaselineRef.current)return;
    const item=findInventoryItem(snapshot,target.variantId,target.inventoryItemId);
    if(!item||missingItemId===target.inventoryItemId)return;
    if(item.status==='active'&&editDraftRef.current.condition==='damaged'){setDamagedError(true);scheduleFocus(()=>resolveField('condition'));return;}
    const notesError=validateInventoryNotes(editDraftRef.current.notes);
    if(notesError){setFieldErrors({notes:'Fyzický kus se nepodařilo uložit. Zkontrolujte zadané údaje.'});scheduleFocus(()=>resolveField('notes'));return;}
    const body=serializeInventoryPatch(editDraftRef.current,editBaselineRef.current);if(!body)return;
    const started=beginMutation({kind:'update',variantId:target.variantId,inventoryItemId:target.inventoryItemId});if(!started)return;
    try{
      const returned=await updateAdminInventoryItem({token:input.token,inventoryItemId:target.inventoryItemId,body,signal:started.signal});
      if(!safeMutation(started.generation,started.productId,target.variantId,target.inventoryItemId))return;
      if(returned.id!==target.inventoryItemId||returned.variantId!==target.variantId){setSubmitError('Fyzický kus se nepodařilo uložit. Zkontrolujte zadané údaje.');return;}
      setSnapshot(prev=>reconcileUpdatedInventoryItem(prev,returned));setActiveEditor(null);setEditDraft(null);setEditBaseline(null);setEditIdentity(null);setMissingItemId(null);setRefreshReason(null);setFeedback('Změny fyzického kusu byly uloženy.');setFeedbackVariantId(returned.variantId);triggerRef.current=null;
      scheduleFocus(()=>resolveSuccess(returned));
    }catch(error){
      if(!safeMutation(started.generation,started.productId,target.variantId,target.inventoryItemId))return;
      handleMutationError(error,'update',target.variantId,target.inventoryItemId);
      if(error instanceof AdminApiError&&error.code==='DAMAGED_ITEM_REQUIRES_MAINTENANCE')scheduleFocus(()=>resolveField('condition'));
    }finally{finishMutation(started.generation,started.productId,target.variantId,target.inventoryItemId);}
  };

  const refresh=async()=>{
    if(operation||refreshing||refreshController.current||!input.token)return;
    const generation=++refreshGeneration.current,observedMutation=mutationGeneration.current,controller=new AbortController(),productId=input.productId;
    refreshController.current=controller;setRefreshing(true);setSubmitError(null);
    try{
      const projected=await getAdminProductInventorySnapshot({token:input.token,productId,signal:controller.signal});
      if(!mounted.current||productRef.current!==productId||refreshGeneration.current!==generation||mutationGeneration.current!==observedMutation)return;
      const next=buildInventorySnapshotFromProjection(projected);setSnapshot(next);
      const target=activeEditorRef.current;
      if(target?.kind==='edit'){
        const item=findInventoryItem(next,target.variantId,target.inventoryItemId);
        if(item){
          const baseline=inventoryEditBaseline(item),dirty=Boolean(editDraftRef.current&&editBaselineRef.current&&isInventoryEditDirty(editDraftRef.current,editBaselineRef.current));
          setEditBaseline(baseline);setEditIdentity(item);if(!dirty)setEditDraft({...baseline});setMissingItemId(null);
        }else{setMissingItemId(target.inventoryItemId);setRefreshReason('missing-item');}
      }else if(target?.kind==='add'){
        if(!projected.variantIds.includes(target.variantId)){setMissingVariantId(target.variantId);setRefreshReason('missing-variant');}
        else setMissingVariantId(null);
      }
      if(unknownCreate){
        const result=reconcileUnknownInventoryCreate({snapshot:next,attempt:unknownCreate});
        if(result.kind==='found-target'){
          setUnknownCreate(null);setRefreshReason(null);setFeedback('Fyzický kus s tímto interním kódem je nyní v seznamu. Zkontrolujte jeho stav před další akcí.');setFeedbackVariantId(unknownCreate.variantId);
          setActiveEditor(null);setCreateDraft({...EMPTY_INVENTORY_CREATE_DRAFT});setFieldErrors({});
        }else if(result.kind==='found-other-variant'){
          setUnknownCreate(null);setRefreshReason(null);setFieldErrors({internalCode:'Tento interní kód už používá jiný fyzický kus.'});
        }else if(projected.variantIds.includes(unknownCreate.variantId)){
          setUnknownCreate(null);setRefreshReason(null);setFeedback('Aktuální fyzické kusy byly načteny. Přidání můžete zkusit znovu.');setFeedbackVariantId(unknownCreate.variantId);
        }else{setMissingVariantId(unknownCreate.variantId);setRefreshReason('missing-variant');}
      }else if(!refreshReason||refreshReason==='refresh-failed'){
        setRefreshReason(null);setFeedback('Aktuální fyzické kusy byly načteny.');setFeedbackVariantId(target?.variantId??null);
      }
    }catch(error){
      if(!mounted.current||productRef.current!==productId||refreshGeneration.current!==generation||mutationGeneration.current!==observedMutation)return;
      if(input.onAccessError?.(error))return;
      if(error instanceof AdminApiError&&error.kind==='cancelled')return;
      if(error instanceof AdminApiError&&error.code==='PRODUCT_NOT_FOUND'){setProductMissing(true);return;}
      setRefreshReason('refresh-failed');setSubmitError('Fyzické kusy se nepodařilo načíst. Zkuste to znovu.');
    }finally{
      if(mounted.current&&productRef.current===productId&&refreshGeneration.current===generation&&mutationGeneration.current===observedMutation){setRefreshing(false);refreshController.current=null;}
    }
  };

  return{
    snapshot,activeEditor,createDraft,setCreateDraft,editDraft,setEditDraft,editBaseline,editIdentity,fieldErrors,submitError,damagedError,feedback,feedbackVariantId,
    operation,refreshing,refreshReason,unknownCreate,missingItemId,missingVariantId,productMissing,editorDirty,riskMeta,
    open,discardCurrent,cancel,saveCreate,saveEdit,refresh,scheduleFocus,
  };
}

export type ProductInventoryController = ReturnType<typeof useProductInventoryController>;
