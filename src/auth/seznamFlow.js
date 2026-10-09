const key = 'anirak:seznam-attempt';
export function beginSeznamSignIn(clientId, origin = window.location.origin) {
  if (!clientId || clientId === 'undefined') throw new Error('SEZNAM_NOT_CONFIGURED');
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  const state = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
  sessionStorage.setItem(key, JSON.stringify({ state, createdAt: Date.now(), origin }));
  const url = new URL('https://login.szn.cz/api/v1/oauth/auth');
  url.search = new URLSearchParams({ client_id: clientId, scope: 'identity', response_type: 'code', redirect_uri: origin, state }).toString();
  return url.toString();
}
export function consumeSeznamAttempt(state, origin = window.location.origin) {
  try {
    const attempt = JSON.parse(sessionStorage.getItem(key));
    sessionStorage.removeItem(key);
    return !!(attempt && state && attempt.state === state && attempt.origin === origin && Date.now() >= attempt.createdAt && Date.now() - attempt.createdAt < 600000);
  } catch { return false; }
}
