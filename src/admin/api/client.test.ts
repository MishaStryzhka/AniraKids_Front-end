jest.mock('axios', () => {
  class MockAxiosError extends Error {
    code?: string;
    response?: unknown;
  }
  const defaults = { baseURL: undefined, headers: { common: { Authorization: undefined } } };
  const instance = { get: jest.fn() };
  const mockAxios = {
    create: jest.fn(() => instance),
    defaults,
    isCancel: jest.fn(() => false),
  };
  return { __esModule: true, default: mockAxios, AxiosError: MockAxiosError };
});

import axios from 'axios';
import { adminApiClient, buildAdminRequestConfig, getAdminApiBaseUrl } from './client';
import { AdminApiError } from './errors';

const originalBaseUrl = process.env.REACT_APP_V2_API_BASE_URL;

afterEach(() => {
  if (originalBaseUrl === undefined) delete process.env.REACT_APP_V2_API_BASE_URL;
  else process.env.REACT_APP_V2_API_BASE_URL = originalBaseUrl;
});

test('uses the explicit V2 base URL and bearer token without mutating global axios defaults', () => {
  process.env.REACT_APP_V2_API_BASE_URL = 'https://preview.example/api/v2/';
  const globalBaseUrl = axios.defaults.baseURL;
  const globalAuthorization = axios.defaults.headers.common.Authorization;

  const config = buildAdminRequestConfig('test-token');

  expect(adminApiClient).not.toBe(axios);
  expect(getAdminApiBaseUrl()).toBe('https://preview.example/api/v2');
  expect(config.baseURL).toBe('https://preview.example/api/v2');
  expect(config.headers).toMatchObject({ Authorization: 'Bearer test-token' });
  expect(axios.defaults.baseURL).toBe(globalBaseUrl);
  expect(axios.defaults.headers.common.Authorization).toBe(globalAuthorization);
});

test('missing Admin API base URL produces a controlled configuration error', () => {
  delete process.env.REACT_APP_V2_API_BASE_URL;

  expect(() => buildAdminRequestConfig('test-token')).toThrow(AdminApiError);
  try {
    buildAdminRequestConfig('test-token');
  } catch (error) {
    expect(error).toMatchObject({ code: 'ADMIN_CLIENT_NOT_CONFIGURED', kind: 'configuration_error' });
  }
});