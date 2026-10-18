import axios, { type AxiosRequestConfig } from 'axios';
import type {Access} from '../auth/permissions';
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
    const {data}=await adminApiClient.get<Access>('/admin/access',config);
    if(typeof data?.owner!=='boolean'||!Array.isArray(data.permissions)||data.permissions.some(p=>!['products','reservations','fittings','settings','partners'].includes(p)))throw new Error('Invalid admin access response');
    return data;
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}
