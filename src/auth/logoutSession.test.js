import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import { authReducer } from '../redux/auth/slice';
import { logOut, refreshUser } from '../redux/auth/operations';
import { rememberDeviceSignIn, hasSignedInOnDevice } from './deviceSignIn';
jest.mock('axios', () => ({ defaults: { headers: { common: {} } }, post: jest.fn(), get: jest.fn() }));
function signedIn() { return configureStore({ reducer: { auth: authReducer }, preloadedState: { auth: { user: { email: 'test@example.invalid' }, token: 'test-token', isLoggedIn: true } } }); }
beforeEach(() => { localStorage.clear(); axios.post.mockReset(); });
test('logout removes session and Authorization but preserves returning-device preference', async () => {
  rememberDeviceSignIn(); axios.post.mockResolvedValue({ status: 204 }); const store = signedIn();
  await store.dispatch(logOut()).unwrap();
  expect(store.getState().auth).toMatchObject({ token: null, user: null, isLoggedIn: false });
  expect(axios.defaults.headers.common.Authorization).toBe(''); expect(hasSignedInOnDevice()).toBe(true);
  store.dispatch(refreshUser.fulfilled({ user: { email: 'stale@example.invalid' } }, 'old-request'));
  expect(store.getState().auth.isLoggedIn).toBe(false);
});
test('expired server session still permits local logout; network failure remains retryable', async () => {
  axios.post.mockRejectedValue({ response: { status: 401 } }); const expired = signedIn(); await expired.dispatch(logOut()).unwrap();
  expect(expired.getState().auth.token).toBeNull();
  axios.post.mockRejectedValue(new Error('offline')); const offline = signedIn(); await expect(offline.dispatch(logOut()).unwrap()).rejects.toBe('offline');
  expect(offline.getState().auth.isLoggedIn).toBe(true);
});
