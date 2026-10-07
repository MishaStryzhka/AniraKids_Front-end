import {act,renderHook} from '@testing-library/react';
import {activateAdminProduct,getAdminProductActivationState,type AdminProductActivationState,type AdminProductStatus} from '../api/products';
import {AdminApiError} from '../api/errors';
import {useProductActivationController} from './useProductActivationController';
import {isReadinessStale} from './productActivationModel';
jest.mock('axios',()=>({__esModule:true,default:{isCancel:()=>false},AxiosError:class extends Error{}}));
jest.mock('../api/client',()=>({adminApiClient:{},buildAdminRequestConfig:jest.fn()}));
jest.mock('../api/products',()=>({activateAdminProduct:jest.fn(),getAdminProductActivationState:jest.fn()}));
const post=activateAdminProduct as jest.MockedFunction<typeof activateAdminProduct>,get=getAdminProductActivationState as jest.MockedFunction<typeof getAdminProductActivationState>;
const error=(code:string,status=409,details?:string[])=>new AdminApiError({code,status,details,message:'raw backend',kind:'unexpected'});
function deferred<T>(){let resolve!:(value:T)=>void,reject!:(error:unknown)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no});return{promise,resolve,reject};}
const active={id:'p1',status:'active' as const,seoNoIndex:false};
function setup(){
 const input={productId:'p1',token:'token',status:'draft' as AdminProductStatus,scopeKey:'p1',contextRevision:0,canStart:jest.fn(()=>true),metadataGeneration:{current:0},onMetadata:jest.fn(),onAccessError:jest.fn(()=>false),onFocus:jest.fn()};
 const hook=renderHook((props)=>useProductActivationController(props),{initialProps:input});return{...hook,input};
}
beforeEach(()=>jest.clearAllMocks());
test('same-tick duplicate is blocked; success writes narrow metadata once',async()=>{
 const pending=deferred<AdminProductActivationState>();post.mockReturnValue(pending.promise);const {result,input}=setup();
 act(()=>{void result.current.activate();void result.current.activate()});expect(post).toHaveBeenCalledTimes(1);expect(result.current.hasRisk).toBe(true);
 await act(async()=>pending.resolve(active));expect(input.onMetadata).toHaveBeenCalledWith(active);expect(result.current.feedback).toBe('confirmed-active');expect(result.current.hasRisk).toBe(false);
});
test('start guard blocks requests without inferring any missing fields',async()=>{
 const {result,input}=setup();input.canStart.mockReturnValue(false);await act(async()=>result.current.activate());expect(post).not.toHaveBeenCalled();
});
test('readiness replacement remains stale during a new attempt and after a risk episode',async()=>{
 post.mockRejectedValueOnce(error('PRODUCT_NOT_READY',409,['photos']));const {result,input,rerender}=setup();
 await act(async()=>result.current.activate());expect(result.current.readiness?.requirements[0].key).toBe('photos');
 const pending=deferred<AdminProductActivationState>();post.mockReturnValue(pending.promise);act(()=>{void result.current.activate()});expect(result.current.readiness?.superseded).toBe(true);
 rerender({...input,contextRevision:1});await act(async()=>pending.reject(error('PRODUCT_NOT_READY',409,['variants'])));
 expect(result.current.readiness?.requirements[0].key).toBe('variants');expect(isReadinessStale(result.current.readiness!,1)).toBe(true);
});
test('state conflict is known no-commit, contributes no leave risk and never fabricates readiness',async()=>{
 post.mockRejectedValue(error('PRODUCT_STATE_CONFLICT'));const {result,input}=setup();await act(async()=>result.current.activate());
 expect(result.current.conflict).not.toBeNull();expect(result.current.unknownOutcome).toBeNull();expect(result.current.readiness).toBeNull();expect(result.current.hasRisk).toBe(false);expect(input.onMetadata).not.toHaveBeenCalled();
 await act(async()=>result.current.activate());expect(post).toHaveBeenCalledTimes(1);
});
test.each([error('UPSTREAM_ERROR',503),new Error('network'),error('ADMIN_REQUEST_CANCELLED',0),{id:'other',status:'active',seoNoIndex:false},{id:'p1',status:'active',seoNoIndex:true},{id:'p1',status:'active'}])('ambiguous POST remains unknown and cannot replay (%j)',async failure=>{
 if('id' in failure)post.mockResolvedValue(failure as AdminProductActivationState);else post.mockRejectedValue(failure);
 const {result,input}=setup();await act(async()=>result.current.activate());expect(result.current.unknownOutcome).not.toBeNull();expect(result.current.hasRisk).toBe(true);expect(input.onMetadata).not.toHaveBeenCalled();
 await act(async()=>result.current.activate());expect(post).toHaveBeenCalledTimes(1);
});
test.each(['draft','active','archived'] as const)('reconcile observes %s without replay',async status=>{
 post.mockRejectedValue(new Error('network'));get.mockResolvedValue({id:'p1',status,seoNoIndex:status!=='active'});const {result,input}=setup();
 await act(async()=>result.current.activate());await act(async()=>result.current.reconcile());expect(result.current.unknownOutcome).toBeNull();expect(result.current.feedback).toBe(`observed-${status}`);expect(post).toHaveBeenCalledTimes(1);expect(input.onMetadata).toHaveBeenCalledTimes(1);
});
test.each(['conflict','unknown'])('failed/malformed/cancelled GET preserves %s',async kind=>{
 post.mockRejectedValue(kind==='conflict'?error('PRODUCT_STATE_CONFLICT'):new Error('network'));const {result}=setup();await act(async()=>result.current.activate());
 for(const failure of [new Error('network'),error('CANCELLED',0),{id:'other',status:'draft',seoNoIndex:true}]){
  if('id' in failure)get.mockResolvedValue(failure as AdminProductActivationState);else get.mockRejectedValue(failure);
  await act(async()=>result.current.reconcile());expect(kind==='conflict'?result.current.conflict:result.current.unknownOutcome).not.toBeNull();expect(result.current.canActivate()).toBe(false);
 }
});
test('metadata generation defeats older GET without clearing captured conflict',async()=>{
 post.mockRejectedValue(error('PRODUCT_STATE_CONFLICT'));const pending=deferred<AdminProductActivationState>();get.mockReturnValue(pending.promise);const {result,input}=setup();await act(async()=>result.current.activate());act(()=>{void result.current.reconcile()});input.metadataGeneration.current++;
 await act(async()=>pending.resolve({id:'p1',status:'draft',seoNoIndex:true}));expect(result.current.conflict).not.toBeNull();expect(input.onMetadata).not.toHaveBeenCalled();expect(result.current.operation).toBeNull();
});
test.each(['resolve','reject'] as const)('old route %s cannot change a new route or clear its pending attempt',async outcome=>{
 const old=deferred<AdminProductActivationState>(),next=deferred<AdminProductActivationState>();post.mockReturnValueOnce(old.promise).mockReturnValueOnce(next.promise);const {result,input,rerender}=setup();act(()=>{void result.current.activate()});
 rerender({...input,productId:'p2',scopeKey:'p2'});act(()=>{void result.current.activate()});await act(async()=>outcome==='resolve'?old.resolve(active):old.reject(new Error('network')));
 expect(result.current.operation?.productId).toBe('p2');expect(result.current.unknownOutcome).toBeNull();expect(input.onMetadata).not.toHaveBeenCalled();await act(async()=>next.resolve({...active,id:'p2'}));expect(input.onMetadata).toHaveBeenCalledTimes(1);
});
test('400 is a confirmed rejection; post-load missing blocks without replacing page; access escalates',async()=>{
 const {result,input}=setup();post.mockRejectedValueOnce(error('VALIDATION_ERROR',400));await act(async()=>result.current.activate());expect(result.current.unknownOutcome).toBeNull();expect(result.current.error).toBeTruthy();
 input.onAccessError.mockReturnValueOnce(true);post.mockRejectedValueOnce(error('ADMIN_FORBIDDEN',403));await act(async()=>result.current.activate());expect(result.current.unknownOutcome).toBeNull();
 post.mockRejectedValueOnce(error('PRODUCT_NOT_FOUND',404));await act(async()=>result.current.activate());expect(result.current.productMissing).toBe(true);expect(result.current.canActivate()).toBe(false);
});
test('older recovery 404 cannot mark Product missing after a newer metadata generation',async()=>{
 post.mockRejectedValue(error('PRODUCT_STATE_CONFLICT'));const pending=deferred<AdminProductActivationState>();get.mockReturnValue(pending.promise);const {result,input}=setup();await act(async()=>result.current.activate());act(()=>{void result.current.reconcile()});input.metadataGeneration.current++;
 await act(async()=>pending.reject(error('PRODUCT_NOT_FOUND',404)));expect(result.current.productMissing).toBe(false);expect(result.current.conflict).not.toBeNull();expect(result.current.operation).toBeNull();
});
