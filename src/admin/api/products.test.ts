jest.mock('./client', () => ({
  adminApiClient: { get: jest.fn() },
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
} from './products';

const mockedGet = adminApiClient.get as jest.Mock;
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
    rentalEnabled: false,
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
      params: { rentalEnabled: true, page: 1, limit: 20 },
    })
  );
  expect(result).toEqual(payload);
});
