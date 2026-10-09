beforeEach(() => { Object.defineProperty(window, 'crypto', { configurable: true, value: { getRandomValues: array => require('crypto').randomFillSync(array) } }); });
import { hasSignedInOnDevice, rememberDeviceSignIn } from './deviceSignIn';
import { beginSeznamSignIn, consumeSeznamAttempt } from './seznamFlow';
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
test('new device defaults to registration and successful sign-in is remembered', () => {
  expect(hasSignedInOnDevice()).toBe(false);
  rememberDeviceSignIn(); expect(hasSignedInOnDevice()).toBe(true);
  expect(localStorage.getItem('anirak:has-signed-in')).toBe('1');
});
test('Seznam state is encoded, tab scoped, single use and rejects mismatch', () => {
  const url = new URL(beginSeznamSignIn('client', 'https://anirakids.cz'));
  expect(url.searchParams.get('redirect_uri')).toBe('https://anirakids.cz');
  const state = url.searchParams.get('state'); expect(state.length).toBe(64);
  expect(consumeSeznamAttempt(state, 'https://anirakids.cz')).toBe(true);
  expect(consumeSeznamAttempt(state, 'https://anirakids.cz')).toBe(false);
  beginSeznamSignIn('client'); expect(consumeSeznamAttempt('wrong')).toBe(false);
});
test('expired attempts and missing client configuration are rejected', () => {
  expect(() => beginSeznamSignIn(undefined)).toThrow();
  const url = new URL(beginSeznamSignIn('client'));
  const now = Date.now(); jest.spyOn(Date, 'now').mockReturnValue(now + 600001);
  expect(consumeSeznamAttempt(url.searchParams.get('state'))).toBe(false);
  jest.restoreAllMocks();
});
