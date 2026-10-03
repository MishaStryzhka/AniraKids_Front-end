jest.mock('./client', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  buildAdminRequestConfig: jest.fn(() => ({
    baseURL: 'https://admin.example.test/api/v2',
    headers: { Authorization: 'Bearer dummy-token' },
  })),
}));

jest.mock('./errors', () => ({
  normalizeAdminApiError: (error: unknown) => error,
}));

import { adminApiClient, buildAdminRequestConfig } from './client';
import {
  ADMIN_PRODUCTS_PAGE_SIZE,
  listAdminProducts,
  serializeAdminProductListParams,
  createAdminProduct,
  getAdminProductDetail,
  updateAdminProduct,
  createAdminVariant,
  updateAdminVariantSize,
  getAdminProductVariants,
} from './products';

const mockedGet = adminApiClient.get as jest.Mock;
const mockedPost = adminApiClient.post as jest.Mock;
const mockedPatch = adminApiClient.patch as jest.Mock;
const mockedBuildConfig = buildAdminRequestConfig as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockedBuildConfig.mockReturnValue({ baseURL: 'https://admin.example.test/api/v2', headers: { Authorization: 'Bearer dummy-token' } });
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


const variant={
  id:'v1',productId:'p1',size:'98-104',sku:'SKU-1',status:'active' as const,sortOrder:0,
  createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',
};
test('typed detail keeps active/inactive variants and inventory transport',async()=>{
  const variants=[
    {...variant,inventory:[{id:'i1'}]},
    {...variant,id:'v2',size:'110',status:'inactive' as const,inventory:[]},
  ];
  mockedGet.mockResolvedValue({data:{product,variants}});
  const result=await getAdminProductDetail({token:'dummy-token',productId:'p1'});
  expect(result.variants.map(v=>v.status)).toEqual(['active','inactive']);
  expect(result.variants[0].inventory).toEqual([{id:'i1'}]);
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
  const variants=[{...variant,inventory:[{id:'i1'}]}];
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
});
