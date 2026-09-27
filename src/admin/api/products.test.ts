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
} from './products';

const mockedGet = adminApiClient.get as jest.Mock;
const mockedPost = adminApiClient.post as jest.Mock;
const mockedPatch = adminApiClient.patch as jest.Mock;
const mockedBuildConfig = buildAdminRequestConfig as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
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

const product={id:'p1',name:'Sofia',slug:'sofia',rentalEnabled:false,saleEnabled:false,photos:[],variants:[],status:'draft' as const,createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z'};
test('createAdminProduct POSTs body with auth/signal and extracts product',async()=>{mockedPost.mockResolvedValue({data:{product}});const signal=new AbortController().signal;await expect(createAdminProduct({token:'dummy-token',body:{name:'Sofia'},signal})).resolves.toEqual(product);expect(mockedBuildConfig).toHaveBeenCalledWith('dummy-token',signal);expect(mockedPost).toHaveBeenCalledWith('/admin/products',{name:'Sofia'},expect.any(Object))});
test('getAdminProductDetail GETs encoded detail path',async()=>{mockedGet.mockResolvedValue({data:{product}});await expect(getAdminProductDetail({token:'dummy-token',productId:'p1'})).resolves.toEqual(product);expect(mockedGet).toHaveBeenCalledWith('/admin/products/p1',expect.any(Object))});
test('updateAdminProduct PATCHes changed body and rejects empty PATCH',async()=>{mockedPatch.mockResolvedValue({data:{product}});await expect(updateAdminProduct({token:'dummy-token',productId:'p1',body:{name:'Sofia'}})).resolves.toEqual(product);expect(mockedPatch).toHaveBeenCalledWith('/admin/products/p1',{name:'Sofia'},expect.any(Object));await expect(updateAdminProduct({token:'dummy-token',productId:'p1',body:{}})).rejects.toThrow('empty product PATCH')});
