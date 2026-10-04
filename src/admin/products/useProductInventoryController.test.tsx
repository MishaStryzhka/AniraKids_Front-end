import {act,renderHook} from '@testing-library/react';
import {AdminApiError} from '../api/errors';
import {createAdminInventoryItem,getAdminProductInventorySnapshot,updateAdminInventoryItem,type AdminInventoryItem,type AdminProductDetailVariant} from '../api/products';
import {useProductInventoryController} from './useProductInventoryController';

jest.mock('axios',()=>{class MockAxiosError extends Error{};return{__esModule:true,default:{isCancel:()=>false},AxiosError:MockAxiosError}});
jest.mock('../api/client',()=>({adminApiClient:{},buildAdminRequestConfig:jest.fn()}));
jest.mock('../api/products',()=>({
  ...jest.requireActual('../api/products'),
  createAdminInventoryItem:jest.fn(),
  getAdminProductInventorySnapshot:jest.fn(),
  updateAdminInventoryItem:jest.fn(),
}));
const createMock=createAdminInventoryItem as jest.MockedFunction<typeof createAdminInventoryItem>;
const updateMock=updateAdminInventoryItem as jest.MockedFunction<typeof updateAdminInventoryItem>;
const refreshMock=getAdminProductInventorySnapshot as jest.MockedFunction<typeof getAdminProductInventorySnapshot>;
const item=(id='i1',variantId='v1',code='AK-001',condition:'excellent'|'good'|'fair'|'damaged'='good'):AdminInventoryItem=>({id,variantId,internalCode:code,status:'active',condition,notes:'',createdAt:'2026-01-01'});
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
