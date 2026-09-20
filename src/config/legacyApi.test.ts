jest.mock('axios', () => {
  class MockAxiosError extends Error {
    code?: string;
    response?: unknown;
  }

  const defaults = {
    baseURL: undefined as string | undefined,
    headers: { common: { Authorization: undefined as string | undefined } },
  };
  const instance = {
    defaults: { baseURL: undefined as string | undefined },
    get: jest.fn(),
  };

  const mockAxios = {
    create: jest.fn(() => instance),
    defaults,
    isCancel: jest.fn(() => false),
    get: jest.fn().mockResolvedValue({ data: { ok: true } }),
  };

  return { __esModule: true, default: mockAxios, AxiosError: MockAxiosError };
});

import axios from 'axios';
import { adminApiClient } from '../admin/api/client';
import { getProducts } from '../api/product/getProducts';
import { configureLegacyApiBaseUrl, normalizeLegacyApiBaseUrl } from './legacyApi';

const originalLegacyBaseUrl = process.env.REACT_APP_LEGACY_API_BASE_URL;

beforeEach(() => {
  delete process.env.REACT_APP_LEGACY_API_BASE_URL;
  axios.defaults.baseURL = undefined;
  adminApiClient.defaults.baseURL = undefined;
  jest.mocked(axios.get).mockClear();
});

afterAll(() => {
  if (originalLegacyBaseUrl === undefined) delete process.env.REACT_APP_LEGACY_API_BASE_URL;
  else process.env.REACT_APP_LEGACY_API_BASE_URL = originalLegacyBaseUrl;
});

test('normalizes configured legacy API URL by trimming whitespace and trailing slash', () => {
  expect(normalizeLegacyApiBaseUrl('  https://example.test/  ')).toBe('https://example.test');
});

test('configured value sets global legacy axios base URL', () => {
  process.env.REACT_APP_LEGACY_API_BASE_URL = 'https://example.test/';
  expect(configureLegacyApiBaseUrl()).toBe('https://example.test');
  expect(axios.defaults.baseURL).toBe('https://example.test');
});

test('missing env clears a stale legacy base URL and never falls back to Production', () => {
  axios.defaults.baseURL = 'https://stale.example';
  delete process.env.REACT_APP_LEGACY_API_BASE_URL;

  expect(configureLegacyApiBaseUrl()).toBeUndefined();
  expect(axios.defaults.baseURL).toBeUndefined();
  expect(axios.defaults.baseURL).not.toBe('https://anira-kids-back-end.onrender.com');
});

test('Admin axios instance remains isolated from legacy global base configuration', () => {
  process.env.REACT_APP_LEGACY_API_BASE_URL = 'https://example.test';
  adminApiClient.defaults.baseURL = 'https://admin-isolated.test/api/v2';

  configureLegacyApiBaseUrl();

  expect(axios.defaults.baseURL).toBe('https://example.test');
  expect(adminApiClient.defaults.baseURL).toBe('https://admin-isolated.test/api/v2');
});

test('legacy Product request uses the globally configured environment origin', async () => {
  process.env.REACT_APP_LEGACY_API_BASE_URL = 'https://example.test/';
  configureLegacyApiBaseUrl();

  await getProducts({ page: 1 });

  expect(axios.defaults.baseURL).toBe('https://example.test');
  expect(axios.get).toHaveBeenCalledWith('api/product/getProducts', {
    params: { page: 1 },
  });
});