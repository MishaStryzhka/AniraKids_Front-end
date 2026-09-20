import axios, { type AxiosRequestConfig } from 'axios';
import { createAdminClientNotConfiguredError, normalizeAdminApiError } from './errors';

export const adminApiClient = axios.create();

export function getAdminApiBaseUrl() {
  const configured = process.env.REACT_APP_V2_API_BASE_URL?.trim();
  return configured ? configured.replace(/\/+$/, '') : null;
}

export function buildAdminRequestConfig(token: string, signal?: AbortSignal): AxiosRequestConfig {
  const baseURL = getAdminApiBaseUrl();
  if (!baseURL) throw createAdminClientNotConfiguredError();

  return {
    baseURL,
    signal,
    headers: { Authorization: `Bearer ${token}` },
  };
}

export async function probeAdminAccess(input: { token: string; signal?: AbortSignal }) {
  try {
    const config = buildAdminRequestConfig(input.token, input.signal);
    await adminApiClient.get('/admin/products', {
      ...config,
      params: { page: 1, limit: 1 },
    });
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}