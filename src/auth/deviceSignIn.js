const key = 'anirak:has-signed-in';
// Only a device preference; no identity or credentials.
export function hasSignedInOnDevice() {
  try { return localStorage.getItem(key) === '1'; } catch { return false; }
}
export function rememberDeviceSignIn() {
  try { localStorage.setItem(key, '1'); } catch { /* Storage may be disabled. */ }
}
