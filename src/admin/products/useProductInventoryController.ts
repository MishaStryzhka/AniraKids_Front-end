import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {AdminApiError} from '../api/errors';
import {
  activateAdminInventoryItem,
  createAdminInventoryItem,
  getAdminProductInventorySnapshot,
  moveAdminInventoryItemToMaintenance,
  retireAdminInventoryItem,
  updateAdminInventoryItem,
  type AdminInventoryItem,
  type AdminInventoryItemStatus,
  type AdminProductDetailVariant,
} from '../api/products';
import {
  EMPTY_INVENTORY_CREATE_DRAFT,
  buildInventorySnapshot,
  buildInventorySnapshotFromProjection,
  canonicalInventoryCode,
  deriveInventoryRiskMeta,
  findInventoryItem,
  inventoryCodeErrorCopy,
  inventoryEditBaseline,
  inventoryLifecycleTarget,
  isInventoryCreateDirty,
  isInventoryEditDirty,
  sameItemDirtyCondition,
  reconcileCreatedInventoryItem,
  reconcileLifecycleInventoryItem,
  reconcileUnknownInventoryCreate,
  reconcileUpdatedInventoryItem,
  serializeInventoryCreate,
  serializeInventoryPatch,
  validateInventoryCode,
  validateInventoryNotes,
  type InventoryCreateDraft,
  type InventoryEditDraft,
  type InventoryLifecycleAction,
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

export interface InventoryLifecycleOperation {
  generation:number;
  productId:string;
  variantId:string;
  inventoryItemId:string;
  sourceStatus:AdminInventoryItemStatus;
  targetStatus:AdminInventoryItemStatus;
  action:InventoryLifecycleAction;
}

export interface InventoryLifecycleUnknownOutcome {
  productId:string;
  variantId:string;
  inventoryItemId:string;
  sourceStatus:AdminInventoryItemStatus;
  requestedTargetStatus:AdminInventoryItemStatus;
}

export type InventoryLifecycleNotice =
  | {kind:'success';message:string}
  | {kind:'reservation-conflict'}
  | {kind:'damaged-activation'}
  | {kind:'invalid-transition';recoverable:true}
  | {kind:'invalid-id';recoverable:true}
  | {kind:'missing-item';recoverable:true}
  | {kind:'unknown';recoverable:true};

export interface InventoryLifecycleFocus {
  edit():HTMLElement|null|undefined;
  action(action:InventoryLifecycleAction):HTMLElement|null|undefined;
  condition():HTMLElement|null|undefined;
  heading():HTMLElement|null|undefined;
}

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
  const [lifecycleOperationsByItem,setLifecycleOperationsByItem]=useState<Record<string,InventoryLifecycleOperation>>({});
  const [unknownLifecycleByItem,setUnknownLifecycleByItem]=useState<Record<string,InventoryLifecycleUnknownOutcome>>({});
  const [lifecycleNoticeByItem,setLifecycleNoticeByItem]=useState<Record<string,InventoryLifecycleNotice>>({});

  const mounted=useRef(true),productRef=useRef(input.productId),triggerRef=useRef<HTMLElement|null>(null);
  const mutationGeneration=useRef(0),refreshGeneration=useRef(0),focusGeneration=useRef(0);
  const mutationController=useRef<AbortController|null>(null),mutationOperationRef=useRef<InventoryOperation>(null),refreshController=useRef<AbortController|null>(null);
  const lifecycleSequenceRef=useRef(0),lifecycleRevisionRef=useRef(0);
  const lifecycleGenerationByItemRef=useRef<Record<string,number>>({});
  const lifecycleControllerByItemRef=useRef<Record<string,AbortController>>({});
  const activeEditorRef=useRef(activeEditor),createDraftRef=useRef(createDraft),editDraftRef=useRef(editDraft),editBaselineRef=useRef(editBaseline);
  activeEditorRef.current=activeEditor;createDraftRef.current=createDraft;editDraftRef.current=editDraft;editBaselineRef.current=editBaseline;

  const invalidateLifetime=useCallback(()=>{
    mounted.current=false;
    mutationGeneration.current++;
    refreshGeneration.current++;
    focusGeneration.current++;
    mutationController.current?.abort();
    mutationOperationRef.current=null;
    refreshController.current?.abort();
    Object.values(lifecycleControllerByItemRef.current).forEach(controller=>controller.abort());
    lifecycleControllerByItemRef.current={};
    lifecycleGenerationByItemRef.current={};
    lifecycleRevisionRef.current++;
  }, []);

  useEffect(()=>{
    const productChanged=productRef.current!==input.productId;
    mounted.current=true;
    productRef.current=input.productId;
    if(productChanged){
      setSnapshot(buildInventorySnapshot(input.initialVariants));
      setActiveEditor(null);setCreateDraft({...EMPTY_INVENTORY_CREATE_DRAFT});setEditDraft(null);setEditBaseline(null);setEditIdentity(null);
      setFieldErrors({});setSubmitError(null);setDamagedError(false);setFeedback(null);setFeedbackVariantId(null);setOperation(null);setRefreshing(false);
      setRefreshReason(null);setUnknownCreate(null);setMissingItemId(null);setMissingVariantId(null);setProductMissing(false);
      setLifecycleOperationsByItem({});setUnknownLifecycleByItem({});setLifecycleNoticeByItem({});
      mutationController.current?.abort();refreshController.current?.abort();mutationController.current=null;mutationOperationRef.current=null;refreshController.current=null;
      Object.values(lifecycleControllerByItemRef.current).forEach(controller=>controller.abort());
      lifecycleControllerByItemRef.current={};lifecycleGenerationByItemRef.current={};
      mutationGeneration.current++;refreshGeneration.current++;focusGeneration.current++;lifecycleRevisionRef.current++;
    }
    return invalidateLifetime;
  // initial state is already seeded synchronously; only a real Product identity change resets this domain.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[input.productId,invalidateLifetime]);

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
  const editorPendingOrUnresolved=Boolean(operation||unknownCreate);
  const lifecyclePendingOrUnresolved=
    Object.keys(lifecycleOperationsByItem).length>0 || Object.keys(unknownLifecycleByItem).length>0;
  const riskMeta:InventoryRiskMeta=useMemo(()=>deriveInventoryRiskMeta({
    editorDirty,
    missingTargetDraft,
    editorPendingOrUnresolved,
    lifecyclePendingOrUnresolved,
  }),[editorDirty,missingTargetDraft,editorPendingOrUnresolved,lifecyclePendingOrUnresolved]);

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
    setOperation(null);mutationController.current=null;mutationOperationRef.current=null;
  };
  const beginMutation=(next:Exclude<InventoryOperation,null>)=>{
    if(operation||mutationController.current||refreshing||productMissing||unknownCreate||!input.token)return null;
    if(next.kind==='update'&&(lifecycleControllerByItemRef.current[next.inventoryItemId]||unknownLifecycleByItem[next.inventoryItemId]))return null;
    refreshGeneration.current++;refreshController.current?.abort();refreshController.current=null;setRefreshing(false);
    const generation=++mutationGeneration.current,controller=new AbortController();
    mutationController.current=controller;mutationOperationRef.current=next;setOperation(next);setSubmitError(null);setFieldErrors({});setDamagedError(false);setFeedback(null);
    return{generation,signal:controller.signal,productId:input.productId};
  };

  const handleMutationError=(error:unknown,kind:'create'|'update',variantId:string,itemId?:string)=>{
    if(input.onAccessError?.(error))return;
    if(!(error instanceof AdminApiError)){setSubmitError('Fyzický kus se nepodařilo uložit. Zkontrolujte zadané údaje.');return;}
    if(error.kind==='cancelled')return;
    if(error.code==='INVALID_ID'){
      if(kind==='create'){
        setMissingVariantId(variantId);setRefreshReason('missing-variant');return;
      }
      if(kind==='update'&&itemId){
        setMissingItemId(itemId);setRefreshReason('missing-item');return;
      }
    }
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

  const lifecycleSuccessMessage=(action:InventoryLifecycleAction)=>{
    if(action==='maintenance')return 'Fyzický kus byl přesunut do údržby.';
    if(action==='activate')return 'Fyzický kus byl aktivován.';
    return 'Fyzický kus byl vyřazen.';
  };

  const clearLifecycleNotice=(itemId:string)=>setLifecycleNoticeByItem(previous=>{
    if(!previous[itemId])return previous;
    const next={...previous};delete next[itemId];return next;
  });

  const transitionLifecycle=async(inputLifecycle:{
    variantId:string;
    inventoryItemId:string;
    action:InventoryLifecycleAction;
    focus:InventoryLifecycleFocus;
  })=>{
    const item=findInventoryItem(snapshot,inputLifecycle.variantId,inputLifecycle.inventoryItemId);
    if(!item||productMissing||!input.token)return false;
    const targetStatus=inventoryLifecycleTarget(inputLifecycle.action);
    if(item.status===targetStatus||item.status==='retired')return false;
    const basic=mutationOperationRef.current;
    if(basic?.kind==='update'&&basic.inventoryItemId===item.id)return false;
    if(lifecycleControllerByItemRef.current[item.id]||unknownLifecycleByItem[item.id])return false;
    if(inputLifecycle.action==='activate'&&sameItemDirtyCondition({
      editor:activeEditorRef.current,
      editDraft:editDraftRef.current,
      editBaseline:editBaselineRef.current,
      variantId:inputLifecycle.variantId,
      inventoryItemId:item.id,
    }))return false;

    const generation=++lifecycleSequenceRef.current;
    lifecycleGenerationByItemRef.current[item.id]=generation;
    lifecycleRevisionRef.current++;
    refreshGeneration.current++;
    refreshController.current?.abort();refreshController.current=null;setRefreshing(false);
    const controller=new AbortController();
    lifecycleControllerByItemRef.current[item.id]=controller;
    const operationState:InventoryLifecycleOperation={
      generation,
      productId:input.productId,
      variantId:inputLifecycle.variantId,
      inventoryItemId:item.id,
      sourceStatus:item.status,
      targetStatus,
      action:inputLifecycle.action,
    };
    setLifecycleOperationsByItem(previous=>({...previous,[item.id]:operationState}));
    clearLifecycleNotice(item.id);

    try{
      const request={token:input.token,inventoryItemId:item.id,signal:controller.signal};
      const returned=inputLifecycle.action==='maintenance'
        ? await moveAdminInventoryItemToMaintenance(request)
        : inputLifecycle.action==='activate'
          ? await activateAdminInventoryItem(request)
          : await retireAdminInventoryItem(request);
      if(!mounted.current||productRef.current!==operationState.productId||lifecycleGenerationByItemRef.current[item.id]!==generation)return false;
      if(returned.id!==item.id||returned.variantId!==inputLifecycle.variantId){
        setLifecycleNoticeByItem(previous=>({...previous,[item.id]:{kind:'invalid-id',recoverable:true}}));
        return false;
      }
      setSnapshot(previous=>reconcileLifecycleInventoryItem(previous,returned));
      setUnknownLifecycleByItem(previous=>{if(!previous[item.id])return previous;const next={...previous};delete next[item.id];return next;});
      setLifecycleNoticeByItem(previous=>({...previous,[item.id]:{kind:'success',message:lifecycleSuccessMessage(inputLifecycle.action)}}));
      scheduleFocus(()=>inputLifecycle.focus.edit());
      return true;
    }catch(error){
      if(!mounted.current||productRef.current!==operationState.productId||lifecycleGenerationByItemRef.current[item.id]!==generation)return false;
      if(input.onAccessError?.(error))return false;
      if(error instanceof AdminApiError&&error.kind==='cancelled')return false;
      if(error instanceof AdminApiError&&error.code==='INVENTORY_HAS_CURRENT_OR_FUTURE_RESERVATION'){
        setLifecycleNoticeByItem(previous=>({...previous,[item.id]:{kind:'reservation-conflict'}}));
        scheduleFocus(()=>inputLifecycle.focus.action(inputLifecycle.action));return false;
      }
      if(error instanceof AdminApiError&&error.code==='DAMAGED_ITEM_CANNOT_BE_ACTIVATED'){
        setLifecycleNoticeByItem(previous=>({...previous,[item.id]:{kind:'damaged-activation'}}));
        const editor=activeEditorRef.current;
        const sameEditor=editor?.kind==='edit'&&editor.variantId===inputLifecycle.variantId&&editor.inventoryItemId===item.id;
        scheduleFocus(()=>sameEditor?inputLifecycle.focus.condition():inputLifecycle.focus.edit());return false;
      }
      if(error instanceof AdminApiError&&error.code==='INVALID_INVENTORY_TRANSITION'){
        setLifecycleNoticeByItem(previous=>({...previous,[item.id]:{kind:'invalid-transition',recoverable:true}}));return false;
      }
      if(error instanceof AdminApiError&&error.code==='INVALID_ID'){
        setLifecycleNoticeByItem(previous=>({...previous,[item.id]:{kind:'invalid-id',recoverable:true}}));return false;
      }
      if(error instanceof AdminApiError&&error.code==='INVENTORY_ITEM_NOT_FOUND'){
        setLifecycleNoticeByItem(previous=>({...previous,[item.id]:{kind:'missing-item',recoverable:true}}));return false;
      }
      if(error instanceof AdminApiError&&error.kind==='network'){
        setUnknownLifecycleByItem(previous=>({...previous,[item.id]:{
          productId:operationState.productId,
          variantId:operationState.variantId,
          inventoryItemId:item.id,
          sourceStatus:operationState.sourceStatus,
          requestedTargetStatus:operationState.targetStatus,
        }}));
        setLifecycleNoticeByItem(previous=>({...previous,[item.id]:{kind:'unknown',recoverable:true}}));
        return false;
      }
      setLifecycleNoticeByItem(previous=>({...previous,[item.id]:{kind:'invalid-transition',recoverable:true}}));
      return false;
    }finally{
      if(lifecycleGenerationByItemRef.current[item.id]===generation){
        delete lifecycleControllerByItemRef.current[item.id];
        setLifecycleOperationsByItem(previous=>{if(!previous[item.id]||previous[item.id].generation!==generation)return previous;const next={...previous};delete next[item.id];return next;});
      }
    }
  };

  const refresh=async(resolveMissingFocus?:(variantId:string)=>HTMLElement|null|undefined)=>{
    if(operation||refreshing||refreshController.current||Object.keys(lifecycleOperationsByItem).length>0||!input.token)return;
    const generation=++refreshGeneration.current,observedMutation=mutationGeneration.current,observedLifecycleRevision=lifecycleRevisionRef.current,controller=new AbortController(),productId=input.productId;
    refreshController.current=controller;setRefreshing(true);setSubmitError(null);
    try{
      const projected=await getAdminProductInventorySnapshot({token:input.token,productId,signal:controller.signal});
      if(!mounted.current||productRef.current!==productId||refreshGeneration.current!==generation||mutationGeneration.current!==observedMutation||lifecycleRevisionRef.current!==observedLifecycleRevision)return;
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
      const unknownLifecycleEntries=Object.entries(unknownLifecycleByItem);
      if(unknownLifecycleEntries.length){
        const resolvedIds:string[]=[];
        const missingVariants:string[]=[];
        unknownLifecycleEntries.forEach(([itemId,outcome])=>{
          const observed=findInventoryItem(next,outcome.variantId,itemId);
          resolvedIds.push(itemId);
          if(!observed)missingVariants.push(outcome.variantId);
        });
        if(resolvedIds.length){
          setUnknownLifecycleByItem(previous=>{
            const copy={...previous};resolvedIds.forEach(id=>delete copy[id]);return copy;
          });
          setLifecycleNoticeByItem(previous=>{
            const copy={...previous};
            resolvedIds.forEach(id=>{
              const outcome=unknownLifecycleByItem[id];
              const observed=outcome?findInventoryItem(next,outcome.variantId,id):null;
              if(observed)copy[id]={kind:'success',message:'Aktuální fyzické kusy byly načteny.'};
              else delete copy[id];
            });
            return copy;
          });
        }
        if(missingVariants.length&&resolveMissingFocus)scheduleFocus(()=>resolveMissingFocus(missingVariants[0]));
      }

      const recoverableLifecycleIds=Object.entries(lifecycleNoticeByItem)
        .filter(([,notice])=>'recoverable' in notice&&notice.recoverable)
        .map(([id])=>id);
      if(recoverableLifecycleIds.length){
        const missingVariants=recoverableLifecycleIds.flatMap(id=>{
          const observedVariant=Object.entries(next).find(([,bucket])=>Boolean(bucket.byId[id]))?.[0];
          if(observedVariant)return [];
          const priorVariant=Object.entries(snapshot).find(([,bucket])=>Boolean(bucket.byId[id]))?.[0];
          return priorVariant?[priorVariant]:[];
        });
        setLifecycleNoticeByItem(previous=>{
          const copy={...previous};
          recoverableLifecycleIds.forEach(id=>{
            const owning=Object.entries(next).find(([,bucket])=>Boolean(bucket.byId[id]))?.[0];
            if(owning)copy[id]={kind:'success',message:'Aktuální fyzické kusy byly načteny.'};
            else delete copy[id];
          });
          return copy;
        });
        if(missingVariants.length&&resolveMissingFocus)scheduleFocus(()=>resolveMissingFocus(missingVariants[0]));
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
      if(!mounted.current||productRef.current!==productId||refreshGeneration.current!==generation||mutationGeneration.current!==observedMutation||lifecycleRevisionRef.current!==observedLifecycleRevision)return;
      if(input.onAccessError?.(error))return;
      if(error instanceof AdminApiError&&error.kind==='cancelled')return;
      if(error instanceof AdminApiError&&error.code==='PRODUCT_NOT_FOUND'){setProductMissing(true);return;}
      setRefreshReason('refresh-failed');setSubmitError('Fyzické kusy se nepodařilo načíst. Zkuste to znovu.');
    }finally{
      if(mounted.current&&productRef.current===productId&&refreshGeneration.current===generation&&mutationGeneration.current===observedMutation&&lifecycleRevisionRef.current===observedLifecycleRevision){setRefreshing(false);refreshController.current=null;}
    }
  };

  const lifecycleNoticeRecoverable=(itemId:string)=>{
    const notice=lifecycleNoticeByItem[itemId];
    return Boolean(notice&&'recoverable' in notice&&notice.recoverable);
  };
  const isLifecycleActionBlocked=(itemId:string)=>Boolean(
    lifecycleOperationsByItem[itemId]||unknownLifecycleByItem[itemId]||lifecycleNoticeRecoverable(itemId)
  );
  const isBasicWriteBlocked=(itemId:string)=>Boolean(
    lifecycleOperationsByItem[itemId]||unknownLifecycleByItem[itemId]
  );
  const isActivationBlocked=(variantId:string,itemId:string)=>sameItemDirtyCondition({
    editor:activeEditor,
    editDraft,
    editBaseline,
    variantId,
    inventoryItemId:itemId,
  });

  return{
    snapshot,activeEditor,createDraft,setCreateDraft,editDraft,setEditDraft,editBaseline,editIdentity,fieldErrors,submitError,damagedError,feedback,feedbackVariantId,
    operation,refreshing,refreshReason,unknownCreate,missingItemId,missingVariantId,productMissing,editorDirty,riskMeta,
    lifecycleOperationsByItem,unknownLifecycleByItem,lifecycleNoticeByItem,
    isLifecycleActionBlocked,isBasicWriteBlocked,isActivationBlocked,
    open,discardCurrent,cancel,saveCreate,saveEdit,refresh,transitionLifecycle,scheduleFocus,
  };
}

export type ProductInventoryController = ReturnType<typeof useProductInventoryController>;
