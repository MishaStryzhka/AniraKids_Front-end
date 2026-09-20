import axios from 'axios';

export function normalizeLegacyApiBaseUrl(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/+$/, '');
}

export function getLegacyApiBaseUrl() {
  return normalizeLegacyApiBaseUrl(process.env.REACT_APP_LEGACY_API_BASE_URL);
}

export function configureLegacyApiBaseUrl() {
  const baseURL = getLegacyApiBaseUrl();
  axios.defaults.baseURL = baseURL;
  return baseURL;
}