jest.mock('./client', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  buildAdminRequestConfig: jest.fn(() => ({
    baseURL: 'https://admin.example.test/api/v2',
    headers: { Authorization: 'Bearer dummy-token' },
  })),
}));

jest.mock('./errors', () => ({
  normalizeAdminApiError: jest.fn((error: unknown) => error),
}));

import { adminApiClient, buildAdminRequestConfig } from './client';
import { normalizeAdminApiError } from './errors';
import {
  activateAdminProduct, getAdminProductActivationState, ADMIN_PRODUCTS_PAGE_SIZE,
  listAdminProducts,
  serializeAdminProductListParams,
  createAdminProduct,
  getAdminProductDetail,
  updateAdminProduct,
  createAdminVariant,
  updateAdminVariantSize,
  getAdminProductVariants,
  createAdminInventoryItem,
  updateAdminInventoryItem,
  getAdminProductInventorySnapshot,
  moveAdminInventoryItemToMaintenance,
  activateAdminInventoryItem,
  retireAdminInventoryItem,
} from './products';

const mockedGet = adminApiClient.get as jest.Mock;
const mockedPost = adminApiClient.post as jest.Mock;
const mockedPatch = adminApiClient.patch as jest.Mock;
const mockedBuildConfig = buildAdminRequestConfig as jest.Mock;
const mockedNormalizeError = normalizeAdminApiError as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockedBuildConfig.mockReturnValue({ baseURL: 'https://admin.example.test/api/v2', headers: { Authorization: 'Bearer dummy-token' } });
  mockedNormalizeError.mockImplementation((error: unknown) => error);
});

test('serializes only the supported product-list API query keys and fixes limit to 20', () => {
  const params = serializeAdminProductListParams({
    status: 'active',
    category: 'dress',
    gender: 'girls',
    rentalEnabled: false,
    page: 3,
    limit: 50,
    saleEnabled: true,
    search: 'Amelia',
    unknown: 'value',
  } as any);

  expect(params).toEqual({
    status: 'active',
    category: 'dress',
    gender: 'girls',
    rentalEnabled: 'false',
    page: 3,
    limit: 20,
  });
  expect(params).not.toHaveProperty('saleEnabled');
  expect(params).not.toHaveProperty('search');
  expect(params).not.toHaveProperty('unknown');
  expect(ADMIN_PRODUCTS_PAGE_SIZE).toBe(20);
});

test('listAdminProducts requests only /admin/products with isolated Admin config', async () => {
  const payload = {
    items: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  };
  mockedGet.mockResolvedValue({ data: payload });

  const signal = new AbortController().signal;
  const result = await listAdminProducts({
    token: 'dummy-token',
    signal,
    query: { page: 1, rentalEnabled: true },
  });

  expect(mockedBuildConfig).toHaveBeenCalledWith('dummy-token', signal);
  expect(mockedGet).toHaveBeenCalledWith(
    '/admin/products',
    expect.objectContaining({
      params: { rentalEnabled: 'true', page: 1, limit: 20 },
    })
  );
  expect(result).toEqual(payload);
});

const product={id:'p1',name:'Sofia',slug:'sofia',occasion:[],ageTags:[],rentalEnabled:false,saleEnabled:false,defaultDeposit:0,photos:[],status:'draft' as const,seo:{noIndex:false},createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z'};
test('createAdminProduct POSTs body with auth/signal and extracts product',async()=>{mockedPost.mockResolvedValue({data:{product}});const signal=new AbortController().signal;await expect(createAdminProduct({token:'dummy-token',body:{name:'Sofia'},signal})).resolves.toEqual(product);expect(mockedBuildConfig).toHaveBeenCalledWith('dummy-token',signal);expect(mockedPost).toHaveBeenCalledWith('/admin/products',{name:'Sofia'},expect.any(Object))});
test('getAdminProductDetail preserves product and variants transport contract',async()=>{const variants=[{id:'v1',size:'98'}];mockedGet.mockResolvedValue({data:{product,variants}});await expect(getAdminProductDetail({token:'dummy-token',productId:'p1'})).resolves.toEqual({product,variants});expect(mockedGet).toHaveBeenCalledWith('/admin/products/p1',expect.any(Object))});
test('updateAdminProduct PATCHes changed body and rejects empty PATCH',async()=>{mockedPatch.mockResolvedValue({data:{product}});await expect(updateAdminProduct({token:'dummy-token',productId:'p1',body:{name:'Sofia'}})).resolves.toEqual(product);expect(mockedPatch).toHaveBeenCalledWith('/admin/products/p1',{name:'Sofia'},expect.any(Object));await expect(updateAdminProduct({token:'dummy-token',productId:'p1',body:{}})).rejects.toThrow('empty product PATCH')});


const inventoryItem={id:'i1',variantId:'v1',internalCode:'AK-001',status:'active' as const,condition:'good' as const,notes:'ok'};
const variant={
  id:'v1',productId:'p1',size:'98-104',sku:'SKU-1',status:'active' as const,sortOrder:0,
  createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',
};
test('typed detail keeps active/inactive variants and inventory transport',async()=>{
  const variants=[
    {...variant,inventory:[inventoryItem]},
    {...variant,id:'v2',size:'110',status:'inactive' as const,inventory:[]},
  ];
  mockedGet.mockResolvedValue({data:{product,variants}});
  const result=await getAdminProductDetail({token:'dummy-token',productId:'p1'});
  expect(result.variants.map(v=>v.status)).toEqual(['active','inactive']);
  expect(result.variants[0].inventory).toEqual([inventoryItem]);
});
test('createAdminVariant POSTs exact size-only body and preserves signal',async()=>{
  mockedPost.mockResolvedValue({data:{variant}});
  const signal=new AbortController().signal;
  const result=await createAdminVariant({token:'dummy-token',productId:'p1',body:{size:'98-104'},signal});
  expect(result).toEqual(variant);
  expect(mockedBuildConfig).toHaveBeenCalledWith('dummy-token',signal);
  expect(mockedPost).toHaveBeenCalledWith('/admin/products/p1/variants',{size:'98-104'},expect.any(Object));
  expect(mockedPost.mock.calls[0][1]).toEqual({size:'98-104'});
});
test('updateAdminVariantSize PATCHes exact size-only body and preserves signal',async()=>{
  mockedPatch.mockResolvedValue({data:{variant:{...variant,size:'110'}}});
  const signal=new AbortController().signal;
  const result=await updateAdminVariantSize({token:'dummy-token',variantId:'v1',body:{size:'110'},signal});
  expect(result.size).toBe('110');
  expect(mockedBuildConfig).toHaveBeenCalledWith('dummy-token',signal);
  expect(mockedPatch).toHaveBeenCalledWith('/admin/variants/v1',{size:'110'},expect.any(Object));
  expect(mockedPatch.mock.calls[0][1]).toEqual({size:'110'});
});
test('getAdminProductVariants reuses detail GET and projects only variants to consumer',async()=>{
  const variants=[{...variant,inventory:[inventoryItem]}];
  mockedGet.mockResolvedValue({data:{product:{...product,name:'Ignore me'},variants}});
  await expect(getAdminProductVariants({token:'dummy-token',productId:'p1'})).resolves.toEqual(variants);
  expect(mockedGet).toHaveBeenCalledWith('/admin/products/p1',expect.any(Object));
});
test('variant API helpers normalize transport errors',async()=>{
  const failure=new Error('boom');
  mockedPost.mockRejectedValueOnce(failure);
  mockedPatch.mockRejectedValueOnce(failure);
  mockedGet.mockRejectedValueOnce(failure);
  await expect(createAdminVariant({token:'dummy-token',productId:'p1',body:{size:'98'}})).rejects.toBe(failure);
  await expect(updateAdminVariantSize({token:'dummy-token',variantId:'v1',body:{size:'98'}})).rejects.toBe(failure);
  await expect(getAdminProductVariants({token:'dummy-token',productId:'p1'})).rejects.toBe(failure);
  expect(mockedNormalizeError).toHaveBeenCalledTimes(3);
});


test('createAdminInventoryItem POSTs only approved body under exact Variant endpoint',async()=>{
  mockedPost.mockResolvedValue({data:{inventoryItem}});
  const signal=new AbortController().signal;
  const body={internalCode:'ak-001',condition:'good' as const,notes:'note'};
  await expect(createAdminInventoryItem({token:'dummy-token',variantId:'v1',body,signal})).resolves.toEqual(inventoryItem);
  expect(mockedBuildConfig).toHaveBeenCalledWith('dummy-token',signal);
  expect(mockedPost).toHaveBeenCalledWith('/admin/variants/v1/inventory-items',body,expect.any(Object));
  expect(mockedPost.mock.calls[0][1]).toEqual({internalCode:'ak-001',condition:'good',notes:'note'});
  expect(mockedPost.mock.calls[0][1]).not.toHaveProperty('variantId');
  expect(mockedPost.mock.calls[0][1]).not.toHaveProperty('acquiredAt');
});
test('updateAdminInventoryItem PATCHes changed inventory fields only and rejects empty body',async()=>{
  mockedPatch.mockResolvedValue({data:{inventoryItem:{...inventoryItem,condition:'fair'}}});
  const signal=new AbortController().signal;
  await expect(updateAdminInventoryItem({token:'dummy-token',inventoryItemId:'i1',body:{condition:'fair'},signal})).resolves.toEqual({...inventoryItem,condition:'fair'});
  expect(mockedPatch).toHaveBeenCalledWith('/admin/inventory-items/i1',{condition:'fair'},expect.any(Object));
  expect(mockedPatch.mock.calls[0][1]).not.toHaveProperty('internalCode');
  expect(mockedPatch.mock.calls[0][1]).not.toHaveProperty('acquiredAt');
  await expect(updateAdminInventoryItem({token:'dummy-token',inventoryItemId:'i1',body:{}})).rejects.toThrow('empty inventory PATCH');
});
test('getAdminProductInventorySnapshot reuses detail GET but projects only variant IDs and inventory',async()=>{
  const variants=[{...variant,inventory:[inventoryItem]},{...variant,id:'v2',size:'110',inventory:[]}];
  mockedGet.mockResolvedValue({data:{product:{...product,name:'Foreign core',photos:[{publicId:'x'}]},variants}});
  await expect(getAdminProductInventorySnapshot({token:'dummy-token',productId:'p1'})).resolves.toEqual({
    variantIds:['v1','v2'],inventoryByVariant:{v1:[inventoryItem],v2:[]},
  });
  expect(mockedGet).toHaveBeenCalledWith('/admin/products/p1',expect.any(Object));
});
test('inventory API helpers normalize transport errors',async()=>{
  const failure=new Error('inventory boom');
  mockedPost.mockRejectedValueOnce(failure);mockedPatch.mockRejectedValueOnce(failure);mockedGet.mockRejectedValueOnce(failure);
  await expect(createAdminInventoryItem({token:'dummy-token',variantId:'v1',body:{internalCode:'AK-1'}})).rejects.toBe(failure);
  await expect(updateAdminInventoryItem({token:'dummy-token',inventoryItemId:'i1',body:{notes:'x'}})).rejects.toBe(failure);
  await expect(getAdminProductInventorySnapshot({token:'dummy-token',productId:'p1'})).rejects.toBe(failure);
  expect(mockedNormalizeError).toHaveBeenCalledTimes(3);
});


describe('inventory lifecycle API bindings',()=>{
  const cases=[
    ['maintenance',moveAdminInventoryItemToMaintenance],
    ['activate',activateAdminInventoryItem],
    ['retire',retireAdminInventoryItem],
  ] as const;
  test.each(cases)('%s POST uses exact URL, no body, shared config, signal and extracts inventoryItem',async(action,fn)=>{
    mockedPost.mockResolvedValueOnce({data:{inventoryItem}});
    const signal=new AbortController().signal;
    await expect(fn({token:'dummy-token',inventoryItemId:'i1',signal})).resolves.toEqual(inventoryItem);
    expect(mockedBuildConfig).toHaveBeenCalledWith('dummy-token',signal);
    expect(mockedPost).toHaveBeenCalledWith(`/admin/inventory-items/i1/${action}`,undefined,expect.any(Object));
  });
  test.each(cases)('%s normalizes errors without global client mutation',async(_action,fn)=>{
    const failure=new Error('lifecycle failure');
    mockedPost.mockRejectedValueOnce(failure);
    await expect(fn({token:'dummy-token',inventoryItemId:'i1'})).rejects.toBe(failure);
    expect(mockedNormalizeError).toHaveBeenCalledWith(failure);
    expect(mockedGet).not.toHaveBeenCalled();
    expect(mockedPatch).not.toHaveBeenCalled();
  });
});


test('activation is bodyless, authenticated, cancellable, and exposes metadata only',async()=>{
 const signal=new AbortController().signal;
 mockedPost.mockResolvedValue({data:{product:{id:'p/1',status:'active',seo:{noIndex:false,title:'retained'},name:'discard',photos:['discard']},variants:['discard']}});
 expect(await activateAdminProduct({token:'token',productId:'p/1',signal})).toEqual({id:'p/1',status:'active',seoNoIndex:false});
 expect(mockedPost).toHaveBeenCalledWith('/admin/products/p%2F1/activate',undefined,expect.objectContaining({headers:{Authorization:'Bearer dummy-token'}}));
 expect(mockedBuildConfig).toHaveBeenCalledWith('token',signal);
});
test('metadata GET discards all other domains, and conflict passthrough preserves absent details',async()=>{
 mockedGet.mockResolvedValue({data:{product:{id:'p1',status:'draft',seo:{noIndex:true},name:'discard'},variants:['discard']}});
 expect(await getAdminProductActivationState({token:'token',productId:'p1'})).toEqual({id:'p1',status:'draft',seoNoIndex:true});
 const failure={status:409,code:'PRODUCT_STATE_CONFLICT'};mockedPost.mockRejectedValue(failure);
 await expect(activateAdminProduct({token:'token',productId:'p1'})).rejects.toBe(failure);
 expect(mockedNormalizeError).toHaveBeenCalledWith(failure);
});
