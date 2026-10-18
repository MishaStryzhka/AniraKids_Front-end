import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
const getAdminApiBaseUrl = () =>
  process.env.REACT_APP_V2_API_BASE_URL?.trim().replace(/\/+$/, '');
const KEY = 'anirak.referral.v1';
let latestCapture = 0;
export function getReferralToken(): string | undefined {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (
      value &&
      typeof value.token === 'string' &&
      value.token.length <= 1200 &&
      value.expiresAt > Date.now()
    )
      return value.token;
    localStorage.removeItem(KEY);
  } catch {}
  return undefined;
}
export function ReferralCapture() {
  const { search } = useLocation();
  useEffect(() => {
    const code = new URLSearchParams(search).get('ref'),
      base = getAdminApiBaseUrl();
    if (!base || !code || !/^[a-z0-9-]{2,80}$/.test(code)) return;
    const capture = ++latestCapture;
    fetch(base + '/referrals/' + encodeURIComponent(code), {
      cache: 'no-store',
    })
      .then(async response => {
        if (!response.ok) return;
        const value = await response.json();
        if (
          capture === latestCapture &&
          typeof value.token === 'string' &&
          Number.isSafeInteger(value.expiresAt)
        )
          try {
            localStorage.setItem(KEY, JSON.stringify(value));
          } catch {}
      })
      .catch(() => {});
    // Keep capture alive when the visitor immediately navigates into the catalogue.
  }, [search]);
  return null;
}
