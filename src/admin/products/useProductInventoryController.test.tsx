import {act,renderHook} from '@testing-library/react';
import {AdminApiError} from '../api/errors';
import {activateAdminInventoryItem,createAdminInventoryItem,getAdminProductInventorySnapshot,moveAdminInventoryItemToMaintenance,retireAdminInventoryItem,updateAdminInventoryItem,type AdminInventoryItem,type AdminProductDetailVariant} from '../api/products';
import {useProductInventoryController} from './useProductInventoryController';

jest.mock('axios',()=>{class MockAxiosError extends Error{};return{__esModule:true,default:{isCancel:()=>false},AxiosError:MockAxiosError}});
jest.mock('../api/client',()=>({adminApiClient:{},buildAdminRequestConfig:jest.fn()}));
jest.mock('../api/products',()=>({
  ...jest.requireActual('../api/products'),
  activateAdminInventoryItem:jest.fn(),
  createAdminInventoryItem:jest.fn(),
  getAdminProductInventorySnapshot:jest.fn(),
  moveAdminInventoryItemToMaintenance:jest.fn(),
  retireAdminInventoryItem:jest.fn(),
  updateAdminInventoryItem:jest.fn(),
}));
const activateMock=activateAdminInventoryItem as jest.MockedFunction<typeof activateAdminInventoryItem>;
const createMock=createAdminInventoryItem as jest.MockedFunction<typeof createAdminInventoryItem>;
const maintenanceMock=moveAdminInventoryItemToMaintenance as jest.MockedFunction<typeof moveAdminInventoryItemToMaintenance>;
const retireMock=retireAdminInventoryItem as jest.MockedFunction<typeof retireAdminInventoryItem>;
const updateMock=updateAdminInventoryItem as jest.MockedFunction<typeof updateAdminInventoryItem>;
const refreshMock=getAdminProductInventorySnapshot as jest.MockedFunction<typeof getAdminProductInventorySnapshot>;
const item=(id='i1',variantId='v1',code='AK-001',condition:'excellent'|'good'|'fair'|'damaged'='good'):AdminInventoryItem=>({id,variantId,internalCode:code,status:'active',condition,notes:'',createdAt:'2026-01-01'});
const lifeItem=(status:'active'|'maintenance'|'retired',id='i1',condition:'excellent'|'good'|'fair'|'damaged'='good',variantId='v1'):AdminInventoryItem=>({...item(id,variantId,id==='i1'?'AK-001':`AK-${id}`,condition),status});
const variant=(id='v1',inventory:AdminInventoryItem[]=[item()]):AdminProductDetailVariant=>({id,productId:'p1',size:'98',status:'active',sortOrder:0,createdAt:'',updatedAt:'',inventory});
const props=(productId='p1',variants=[variant()])=>({productId,token:'token',initialVariants:variants,onAccessError:jest.fn(()=>false)});
const error=(code:string,status:number|null=null,kind:any=status===null?'network':'unexpected')=>new AdminApiError({code,status,message:'raw',kind});
function deferred<T>(){let resolve!:(value:T)=>void,reject!:(reason:any)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no});return{promise,resolve,reject}}
const setup=(initial=props())=>renderHook((input:ReturnType<typeof props>)=>useProductInventoryController(input),{initialProps:initial});
beforeEach(()=>jest.clearAllMocks());

test('initial seed is independent and grouped by real variant/item IDs',()=>{
 const hook=setup(props('p1',[variant('v1',[item('i1'),item('i2','v1','AK-002')]),variant('v2',[])]));
 expect(hook.result.current.snapshot.v1.order).toEqual(['i1','i2']);
 expect(hook.result.current.snapshot.v2.order).toEqual([]);
});
test('create success reconciles returned canonical item once and clears editor',async()=>{
 createMock.mockResolvedValue({...item('i2','v1','AK-002'),internalCode:'AK-002'});
 const hook=setup();act(()=>hook.result.current.open({kind:'add',variantId:'v1'}));
 act(()=>hook.result.current.setCreateDraft({internalCode:' ak-002 ',condition:'good',notes:'note'}));
 await act(async()=>hook.result.current.saveCreate(()=>null,()=>null));
 expect(createMock).toHaveBeenCalledWith(expect.objectContaining({variantId:'v1',body:{internalCode:'ak-002',condition:'good',notes:'note'}}));
 expect(hook.result.current.snapshot.v1.byId.i2.internalCode).toBe('AK-002');
 expect(hook.result.current.activeEditor).toBeNull();expect(hook.result.current.feedback).toBe('Fyzický kus byl přidán.');
});
test('edit success PATCHes changed subset only and immutable identity stays canonical',async()=>{
 updateMock.mockResolvedValue({...item(),condition:'fair',notes:'new'});
 const hook=setup();act(()=>hook.result.current.open({kind:'edit',variantId:'v1',inventoryItemId:'i1'}));
 act(()=>hook.result.current.setEditDraft({condition:'fair',notes:'new'}));
 await act(async()=>hook.result.current.saveEdit(()=>null,()=>null));
 expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({inventoryItemId:'i1',body:{condition:'fair',notes:'new'}}));
 expect(hook.result.current.snapshot.v1.byId.i1.internalCode).toBe('AK-001');
 expect(hook.result.current.activeEditor).toBeNull();
});
test('duplicate code preserves complete draft and focuses field contract',async()=>{
 createMock.mockRejectedValue(error('INVENTORY_CODE_ALREADY_EXISTS',409));
 const hook=setup();act(()=>hook.result.current.open({kind:'add',variantId:'v1'}));
 act(()=>hook.result.current.setCreateDraft({internalCode:'ak-9',condition:'fair',notes:'memo'}));
 await act(async()=>hook.result.current.saveCreate(()=>null,()=>null));
 expect(hook.result.current.createDraft).toEqual({internalCode:'ak-9',condition:'fair',notes:'memo'});
 expect(hook.result.current.fieldErrors.internalCode).toBe('Tento interní kód už používá jiný fyzický kus.');
});
test('missing Variant and missing item preserve draft and expose Inventory refresh',async()=>{
 createMock.mockRejectedValueOnce(error('VARIANT_NOT_FOUND',404));
 const createHook=setup();act(()=>createHook.result.current.open({kind:'add',variantId:'v1'}));act(()=>createHook.result.current.setCreateDraft({internalCode:'AK-9',condition:'fair',notes:'memo'}));
 await act(async()=>createHook.result.current.saveCreate(()=>null,()=>null));
 expect(createHook.result.current.missingVariantId).toBe('v1');expect(createHook.result.current.createDraft.notes).toBe('memo');

 updateMock.mockRejectedValueOnce(error('INVENTORY_ITEM_NOT_FOUND',404));
 const editHook=setup();act(()=>editHook.result.current.open({kind:'edit',variantId:'v1',inventoryItemId:'i1'}));act(()=>editHook.result.current.setEditDraft({condition:'fair',notes:'typed'}));
 await act(async()=>editHook.result.current.saveEdit(()=>null,()=>null));
 expect(editHook.result.current.missingItemId).toBe('i1');expect(editHook.result.current.editDraft?.notes).toBe('typed');
});
test('unknown CREATE absent reconciliation allows only explicit retry with retained full attempt context',async()=>{
 createMock.mockRejectedValueOnce(error('ADMIN_NETWORK_ERROR')).mockResolvedValueOnce(item('i9','v1','AK-9','fair'));
 const successFocus=jest.fn(()=>null);
 const hook=setup();act(()=>hook.result.current.open({kind:'add',variantId:'v1'}));act(()=>hook.result.current.setCreateDraft({internalCode:' ak-9 ',condition:'fair',notes:'memo'}));
 await act(async()=>hook.result.current.saveCreate(()=>null,successFocus));
 expect(hook.result.current.unknownCreate).toEqual({productId:'p1',variantId:'v1',internalCode:'ak-9',canonicalInternalCode:'AK-9',condition:'fair',notes:'memo'});
 expect(createMock).toHaveBeenCalledTimes(1);
 refreshMock.mockResolvedValueOnce({variantIds:['v1'],inventoryByVariant:{v1:[]}});
 await act(async()=>hook.result.current.refresh());
 expect(hook.result.current.feedback).toBe('Aktuální fyzické kusy byly načteny. Přidání můžete zkusit znovu.');
 expect(createMock).toHaveBeenCalledTimes(1);
 expect(hook.result.current.unknownCreate).toBeNull();
 expect(hook.result.current.createDraft).toEqual({internalCode:' ak-9 ',condition:'fair',notes:'memo'});
 await act(async()=>hook.result.current.saveCreate(()=>null,successFocus));
 expect(createMock).toHaveBeenCalledTimes(2);
 expect(createMock.mock.calls[1][0].body).toEqual({internalCode:'ak-9',condition:'fair',notes:'memo'});
 expect(hook.result.current.snapshot.v1.byId.i9).toMatchObject({id:'i9',variantId:'v1',internalCode:'AK-9',condition:'fair'});
 expect(hook.result.current.activeEditor).toBeNull();
 expect(hook.result.current.feedback).toBe('Fyzický kus byl přidán.');
});
test('unknown create refresh reports observed matching code without claiming authorship',async()=>{
 createMock.mockRejectedValue(error('ADMIN_NETWORK_ERROR'));const hook=setup();act(()=>hook.result.current.open({kind:'add',variantId:'v1'}));act(()=>hook.result.current.setCreateDraft({internalCode:'ak-9',condition:'good',notes:'memo'}));
 await act(async()=>hook.result.current.saveCreate(()=>null,()=>null));
 refreshMock.mockResolvedValueOnce({variantIds:['v1'],inventoryByVariant:{v1:[item('i9','v1','AK-9')]}});
 await act(async()=>hook.result.current.refresh());
 expect(hook.result.current.feedback).toContain('je nyní v seznamu');expect(hook.result.current.feedback).not.toContain('úspěšně');expect(createMock).toHaveBeenCalledTimes(1);
});
test('refresh updates Inventory only and preserves dirty active edit draft while rebasing canonical baseline',async()=>{
 const hook=setup();act(()=>hook.result.current.open({kind:'edit',variantId:'v1',inventoryItemId:'i1'}));act(()=>hook.result.current.setEditDraft({condition:'fair',notes:'typed'}));
 refreshMock.mockResolvedValueOnce({variantIds:['v1'],inventoryByVariant:{v1:[{...item(),condition:'excellent',notes:'server'}]}});
 await act(async()=>hook.result.current.refresh());
 expect(hook.result.current.snapshot.v1.byId.i1.condition).toBe('excellent');
 expect(hook.result.current.editDraft).toEqual({condition:'fair',notes:'typed'});
 expect(hook.result.current.editBaseline).toEqual({condition:'excellent',notes:'server'});
});
test.each(['create','update','refresh'] as const)('stale %s response after Product switch cannot mutate new Product',async kind=>{
 const pending=deferred<any>();
 if(kind==='create')createMock.mockReturnValueOnce(pending.promise);
 if(kind==='update')updateMock.mockReturnValueOnce(pending.promise);
 if(kind==='refresh')refreshMock.mockReturnValueOnce(pending.promise);
 const hook=setup();
 let request:Promise<any>;
 if(kind==='create'){act(()=>hook.result.current.open({kind:'add',variantId:'v1'}));act(()=>hook.result.current.setCreateDraft({internalCode:'AK-9',condition:'good',notes:''}));act(()=>{request=hook.result.current.saveCreate(()=>null,()=>null)})}
 else if(kind==='update'){act(()=>hook.result.current.open({kind:'edit',variantId:'v1',inventoryItemId:'i1'}));act(()=>hook.result.current.setEditDraft({condition:'fair',notes:''}));act(()=>{request=hook.result.current.saveEdit(()=>null,()=>null)})}
 else act(()=>{request=hook.result.current.refresh()});
 hook.rerender(props('p2',[{...variant('v2',[item('j1','v2','P2-1')]),productId:'p2'}]));
 await act(async()=>{if(kind==='refresh')pending.resolve({variantIds:['v1'],inventoryByVariant:{v1:[item('old')]}});else pending.resolve(item('old'));await request!});
 expect(hook.result.current.snapshot.v2.byId.j1.internalCode).toBe('P2-1');expect(hook.result.current.snapshot.v1).toBeUndefined();
});
test('unmount aborts request and stale finally cannot apply access/error state',async()=>{
 const pending=deferred<AdminInventoryItem>();createMock.mockReturnValueOnce(pending.promise);const access=jest.fn(()=>false);
 const hook=renderHook(()=>useProductInventoryController({...props(),onAccessError:access}));
 act(()=>hook.result.current.open({kind:'add',variantId:'v1'}));act(()=>hook.result.current.setCreateDraft({internalCode:'AK-9',condition:'good',notes:''}));
 let request!:Promise<void>;act(()=>{request=hook.result.current.saveCreate(()=>null,()=>null)});const signal=createMock.mock.calls[0][0].signal!;hook.unmount();expect(signal.aborted).toBe(true);
 await act(async()=>{pending.reject(error('PRODUCT_NOT_FOUND',404));await request});expect(access).not.toHaveBeenCalled();
});


test('CREATE INVALID_ID becomes missing Variant recovery, preserves draft and never auto-replays POST',async()=>{
 createMock.mockRejectedValueOnce(error('INVALID_ID',400));
 const hook=setup();act(()=>hook.result.current.open({kind:'add',variantId:'bad-variant'}));act(()=>hook.result.current.setCreateDraft({internalCode:'AK-9',condition:'fair',notes:'memo'}));
 await act(async()=>hook.result.current.saveCreate(()=>null,()=>null));
 expect(hook.result.current.missingVariantId).toBe('bad-variant');
 expect(hook.result.current.refreshReason).toBe('missing-variant');
 expect(hook.result.current.createDraft).toEqual({internalCode:'AK-9',condition:'fair',notes:'memo'});
 expect(hook.result.current.submitError).toBeNull();
 expect(hook.result.current.fieldErrors).toEqual({});
 expect(createMock).toHaveBeenCalledTimes(1);
});

test('UPDATE INVALID_ID becomes missing InventoryItem recovery, preserves draft and never auto-replays PATCH',async()=>{
 updateMock.mockRejectedValueOnce(error('INVALID_ID',400));
 const hook=setup();act(()=>hook.result.current.open({kind:'edit',variantId:'v1',inventoryItemId:'i1'}));act(()=>hook.result.current.setEditDraft({condition:'fair',notes:'typed'}));
 await act(async()=>hook.result.current.saveEdit(()=>null,()=>null));
 expect(hook.result.current.missingItemId).toBe('i1');
 expect(hook.result.current.refreshReason).toBe('missing-item');
 expect(hook.result.current.editDraft).toEqual({condition:'fair',notes:'typed'});
 expect(hook.result.current.submitError).toBeNull();
 expect(hook.result.current.fieldErrors).toEqual({});
 expect(updateMock).toHaveBeenCalledTimes(1);
});


const lifecycleFocus=()=>({edit:jest.fn(()=>null),action:jest.fn(()=>null),condition:jest.fn(()=>null),heading:jest.fn(()=>null)});

test.each([
  ['maintenance','active','maintenance','Fyzický kus byl přesunut do údržby.'],
  ['activate','maintenance','active','Fyzický kus byl aktivován.'],
  ['retire','active','retired','Fyzický kus byl vyřazen.'],
] as const)('lifecycle %s success reconciles exact returned item only',async(action,source,target,message)=>{
  const initial=lifeItem(source);
  const returned={...initial,status:target} as AdminInventoryItem;
  if(action==='maintenance')maintenanceMock.mockResolvedValueOnce(returned);
  if(action==='activate')activateMock.mockResolvedValueOnce(returned);
  if(action==='retire')retireMock.mockResolvedValueOnce(returned);
  const hook=setup(props('p1',[variant('v1',[initial,lifeItem('active','i2')])]));
  await act(async()=>hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action,focus:lifecycleFocus()}));
  expect(hook.result.current.snapshot.v1.byId.i1.status).toBe(target);
  expect(hook.result.current.snapshot.v1.byId.i2.status).toBe('active');
  expect(hook.result.current.lifecycleNoticeByItem.i1).toEqual({kind:'success',message});
});

test('lifecycle response identity mismatch never reconciles and requires refresh',async()=>{
  maintenanceMock.mockResolvedValueOnce({...lifeItem('maintenance','other'),variantId:'v1'});
  const hook=setup();
  await act(async()=>hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:lifecycleFocus()}));
  expect(hook.result.current.snapshot.v1.byId.i1.status).toBe('active');
  expect(hook.result.current.lifecycleNoticeByItem.i1).toEqual({kind:'invalid-id',recoverable:true});
  expect(hook.result.current.isLifecycleActionBlocked('i1')).toBe(true);
});

test('same-item duplicate and competing lifecycle submissions are synchronously prevented while another item remains operable',async()=>{
  const pending=deferred<AdminInventoryItem>();
  maintenanceMock.mockReturnValueOnce(pending.promise);
  retireMock.mockResolvedValueOnce(lifeItem('retired','i2'));
  const hook=setup(props('p1',[variant('v1',[lifeItem('active','i1'),lifeItem('active','i2')])]));
  let first!:Promise<boolean>;
  act(()=>{first=hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:lifecycleFocus()})});
  await act(async()=>{
    expect(await hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:lifecycleFocus()})).toBe(false);
    expect(await hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'retire',focus:lifecycleFocus()})).toBe(false);
    expect(await hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i2',action:'retire',focus:lifecycleFocus()})).toBe(true);
  });
  expect(maintenanceMock).toHaveBeenCalledTimes(1);expect(retireMock).toHaveBeenCalledTimes(1);
  await act(async()=>{pending.resolve(lifeItem('maintenance','i1'));await first});
  expect(hook.result.current.snapshot.v1.byId.i1.status).toBe('maintenance');
  expect(hook.result.current.snapshot.v1.byId.i2.status).toBe('retired');
});

test('same-item Basic Inventory PATCH and lifecycle POST cannot overlap in either direction',async()=>{
  const updatePending=deferred<AdminInventoryItem>();
  updateMock.mockReturnValueOnce(updatePending.promise);
  const hook=setup();
  act(()=>hook.result.current.open({kind:'edit',variantId:'v1',inventoryItemId:'i1'}));
  act(()=>hook.result.current.setEditDraft({condition:'fair',notes:''}));
  let save!:Promise<void>;act(()=>{save=hook.result.current.saveEdit(()=>null,()=>null)});
  await act(async()=>expect(await hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:lifecycleFocus()})).toBe(false));
  expect(maintenanceMock).not.toHaveBeenCalled();
  await act(async()=>{updatePending.resolve({...lifeItem('active'),condition:'fair'});await save});

  const lifecyclePending=deferred<AdminInventoryItem>();maintenanceMock.mockReturnValueOnce(lifecyclePending.promise);
  const second=setup();act(()=>second.result.current.open({kind:'edit',variantId:'v1',inventoryItemId:'i1'}));act(()=>second.result.current.setEditDraft({condition:'fair',notes:''}));
  let lifecycle!:Promise<boolean>;act(()=>{lifecycle=second.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:lifecycleFocus()})});
  await act(async()=>second.result.current.saveEdit(()=>null,()=>null));
  expect(updateMock).toHaveBeenCalledTimes(1);
  await act(async()=>{lifecyclePending.resolve(lifeItem('maintenance'));await lifecycle});
});

test('dirty condition blocks same-item activation while notes-only draft allows it and draft/baseline survive success',async()=>{
  const damaged=lifeItem('maintenance','i1','good');
  const blocked=setup(props('p1',[variant('v1',[damaged])]));
  act(()=>blocked.result.current.open({kind:'edit',variantId:'v1',inventoryItemId:'i1'}));
  act(()=>blocked.result.current.setEditDraft({condition:'fair',notes:''}));
  expect(blocked.result.current.isActivationBlocked('v1','i1')).toBe(true);
  await act(async()=>expect(await blocked.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'activate',focus:lifecycleFocus()})).toBe(false));
  expect(activateMock).not.toHaveBeenCalled();

  activateMock.mockResolvedValueOnce({...damaged,status:'active'});
  const allowed=setup(props('p1',[variant('v1',[damaged])]));
  act(()=>allowed.result.current.open({kind:'edit',variantId:'v1',inventoryItemId:'i1'}));
  act(()=>allowed.result.current.setEditDraft({condition:'good',notes:'typed'}));
  const baseline=allowed.result.current.editBaseline;
  await act(async()=>allowed.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'activate',focus:lifecycleFocus()}));
  expect(activateMock).toHaveBeenCalledTimes(1);
  expect(allowed.result.current.activeEditor).toEqual({kind:'edit',variantId:'v1',inventoryItemId:'i1'});
  expect(allowed.result.current.editDraft).toEqual({condition:'good',notes:'typed'});
  expect(allowed.result.current.editBaseline).toEqual(baseline);
});

test.each([
 ['INVENTORY_HAS_CURRENT_OR_FUTURE_RESERVATION',409,'reservation-conflict'],
 ['DAMAGED_ITEM_CANNOT_BE_ACTIVATED',409,'damaged-activation'],
 ['INVALID_INVENTORY_TRANSITION',400,'invalid-transition'],
 ['INVALID_ID',400,'invalid-id'],
 ['INVENTORY_ITEM_NOT_FOUND',404,'missing-item'],
] as const)('lifecycle error %s maps to item-local notice without replay',async(code,httpStatus,kind)=>{
  const initial=code==='DAMAGED_ITEM_CANNOT_BE_ACTIVATED'?lifeItem('maintenance','i1','damaged'):lifeItem('active');
  const fn=code==='DAMAGED_ITEM_CANNOT_BE_ACTIVATED'?activateMock:maintenanceMock;
  fn.mockRejectedValueOnce(error(code,httpStatus));
  const hook=setup(props('p1',[variant('v1',[initial])]));
  await act(async()=>hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:code==='DAMAGED_ITEM_CANNOT_BE_ACTIVATED'?'activate':'maintenance',focus:lifecycleFocus()}));
  expect(hook.result.current.lifecycleNoticeByItem.i1?.kind).toBe(kind);
  expect(fn).toHaveBeenCalledTimes(1);
});

test('lifecycle access error delegates, cancelled is silent',async()=>{
  const access=jest.fn(()=>true);maintenanceMock.mockRejectedValueOnce(error('ADMIN_FORBIDDEN',403,'forbidden'));
  const hook=renderHook(()=>useProductInventoryController({...props(),onAccessError:access}));
  await act(async()=>hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:lifecycleFocus()}));
  expect(access).toHaveBeenCalled();expect(hook.result.current.lifecycleNoticeByItem.i1).toBeUndefined();

  maintenanceMock.mockRejectedValueOnce(error('ADMIN_REQUEST_CANCELLED',null,'cancelled'));
  const silent=setup();await act(async()=>silent.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:lifecycleFocus()}));
  expect(silent.result.current.lifecycleNoticeByItem.i1).toBeUndefined();
});

test('unknown lifecycle retains full context, blocks replay, and explicit refresh resolves observed target/other/missing states',async()=>{
  maintenanceMock.mockRejectedValueOnce(error('ADMIN_NETWORK_ERROR'));
  const hook=setup();
  await act(async()=>hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:lifecycleFocus()}));
  expect(hook.result.current.unknownLifecycleByItem.i1).toEqual({productId:'p1',variantId:'v1',inventoryItemId:'i1',sourceStatus:'active',requestedTargetStatus:'maintenance'});
  expect(hook.result.current.riskMeta.lifecyclePendingOrUnresolved).toBe(true);
  expect(maintenanceMock).toHaveBeenCalledTimes(1);
  await act(async()=>hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:lifecycleFocus()}));
  expect(maintenanceMock).toHaveBeenCalledTimes(1);
  refreshMock.mockResolvedValueOnce({variantIds:['v1'],inventoryByVariant:{v1:[lifeItem('maintenance')]}});
  await act(async()=>hook.result.current.refresh());
  expect(hook.result.current.unknownLifecycleByItem.i1).toBeUndefined();
  expect(hook.result.current.snapshot.v1.byId.i1.status).toBe('maintenance');
  expect(hook.result.current.lifecycleNoticeByItem.i1).toEqual({kind:'success',message:'Aktuální fyzické kusy byly načteny.'});
  expect(hook.result.current.riskMeta.lifecyclePendingOrUnresolved).toBe(false);
});

test('unknown lifecycle refresh with unchanged status re-enables actions; missing item removes it',async()=>{
  maintenanceMock.mockRejectedValueOnce(error('ADMIN_NETWORK_ERROR'));
  const unchanged=setup();await act(async()=>unchanged.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:lifecycleFocus()}));
  refreshMock.mockResolvedValueOnce({variantIds:['v1'],inventoryByVariant:{v1:[lifeItem('active')]}});
  await act(async()=>unchanged.result.current.refresh());
  expect(unchanged.result.current.snapshot.v1.byId.i1.status).toBe('active');
  expect(unchanged.result.current.isLifecycleActionBlocked('i1')).toBe(false);

  maintenanceMock.mockRejectedValueOnce(error('ADMIN_NETWORK_ERROR'));
  const missing=setup();await act(async()=>missing.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:lifecycleFocus()}));
  refreshMock.mockResolvedValueOnce({variantIds:['v1'],inventoryByVariant:{v1:[]}});
  await act(async()=>missing.result.current.refresh());
  expect(missing.result.current.snapshot.v1.byId.i1).toBeUndefined();
  expect(missing.result.current.unknownLifecycleByItem.i1).toBeUndefined();
});

test('lifecycle start invalidates older Inventory refresh so stale refresh cannot overwrite newer lifecycle success',async()=>{
  const oldRefresh=deferred<any>();refreshMock.mockReturnValueOnce(oldRefresh.promise);
  const lifecycle=deferred<AdminInventoryItem>();maintenanceMock.mockReturnValueOnce(lifecycle.promise);
  const hook=setup();
  let refreshPromise!:Promise<void>;act(()=>{refreshPromise=hook.result.current.refresh()});
  let lifecyclePromise!:Promise<boolean>;act(()=>{lifecyclePromise=hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:lifecycleFocus()})});
  await act(async()=>{lifecycle.resolve(lifeItem('maintenance'));await lifecyclePromise});
  await act(async()=>{oldRefresh.resolve({variantIds:['v1'],inventoryByVariant:{v1:[lifeItem('active')]}});await refreshPromise});
  expect(hook.result.current.snapshot.v1.byId.i1.status).toBe('maintenance');
});

test('stale lifecycle response after Product switch and unmount cannot apply',async()=>{
  const pending=deferred<AdminInventoryItem>();maintenanceMock.mockReturnValueOnce(pending.promise);
  const hook=setup();let request!:Promise<boolean>;act(()=>{request=hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:lifecycleFocus()})});
  hook.rerender(props('p2',[{...variant('v2',[lifeItem('active','j1','good','v2')]),productId:'p2'}]));
  await act(async()=>{pending.resolve(lifeItem('maintenance'));await request});
  expect(hook.result.current.snapshot.v2.byId.j1.status).toBe('active');
  expect(hook.result.current.snapshot.v1).toBeUndefined();

  const pending2=deferred<AdminInventoryItem>();maintenanceMock.mockReturnValueOnce(pending2.promise);
  const unmounted=setup();let request2!:Promise<boolean>;act(()=>{request2=unmounted.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:lifecycleFocus()})});
  const signal=maintenanceMock.mock.calls.slice(-1)[0][0].signal!;unmounted.unmount();expect(signal.aborted).toBe(true);
  await act(async()=>{pending2.resolve(lifeItem('maintenance'));await request2});
});
test('activation snapshot sees same-tick draft and lifecycle request without parent mirrors',async()=>{
 const pending=deferred<AdminInventoryItem>();maintenanceMock.mockReturnValue(pending.promise);const hook=setup();act(()=>hook.result.current.open({kind:'add',variantId:'v1'}));
 act(()=>{hook.result.current.setCreateDraft({internalCode:'AK-NEW',condition:'good',notes:''});expect(hook.result.current.getActivationGuardSnapshot().hasUnsavedWork).toBe(true);});
 act(()=>{void hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus:{edit:()=>null,action:()=>null,condition:()=>null,heading:()=>null}});expect(hook.result.current.getActivationGuardSnapshot().pendingMutation).toBe(true);});
 await act(async()=>pending.resolve(lifeItem('maintenance')));
});

test('manual block risk synchronously interlocks only its item, feeds activation/leave and blocks removing inventory refresh',async()=>{
 const hook=setup(props('p1',[variant('v1',[item('i1'),item('i2')])]));
 act(()=>hook.result.current.reportManualBlockRisk('i1',{dirty:true,pending:false,unresolved:false}));
 expect(hook.result.current.getActivationGuardSnapshot().hasUnsavedWork).toBe(true);expect(hook.result.current.riskMeta.hasRisk).toBe(true);
 const pending=deferred<any>();refreshMock.mockReturnValue(pending.promise);await act(async()=>hook.result.current.refresh());expect(refreshMock).not.toHaveBeenCalled();
 act(()=>hook.result.current.reportManualBlockRisk('i1',{dirty:true,pending:true,unresolved:false}));expect(hook.result.current.isBasicWriteBlocked('i1')).toBe(true);expect(hook.result.current.isLifecycleActionBlocked('i1')).toBe(true);expect(hook.result.current.isBasicWriteBlocked('i2')).toBe(false);
 const focus={edit:()=>null,action:()=>null,condition:()=>null,heading:()=>null};await act(async()=>hook.result.current.transitionLifecycle({variantId:'v1',inventoryItemId:'i1',action:'maintenance',focus}));expect(maintenanceMock).not.toHaveBeenCalled();
 act(()=>hook.result.current.reportManualBlockRisk('i1',{dirty:true,pending:false,unresolved:true}));expect(hook.result.current.getActivationGuardSnapshot().unresolvedOutcome).toBe(true);expect(hook.result.current.riskMeta.pendingOrUnresolved).toBe(true);
});
test('an inventory GET started before block draft cannot remove the item or clear its risk',async()=>{
 const hook=setup();const pending=deferred<any>();refreshMock.mockReturnValueOnce(pending.promise);let promise!:Promise<void>;act(()=>{promise=hook.result.current.refresh();});act(()=>hook.result.current.reportManualBlockRisk('i1',{dirty:false,pending:true,unresolved:false}));await act(async()=>{pending.resolve({variantIds:[],items:[]});await promise;});expect(hook.result.current.snapshot.v1.order).toEqual(['i1']);expect(hook.result.current.getActivationGuardSnapshot().pendingMutation).toBe(true);expect(hook.result.current.refreshing).toBe(false);
});
