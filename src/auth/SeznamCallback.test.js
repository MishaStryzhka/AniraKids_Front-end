beforeEach(() => { Object.defineProperty(window, 'crypto', { configurable: true, value: { getRandomValues: array => require('crypto').randomFillSync(array) } }); });
import React, { StrictMode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SeznamCallback from './SeznamCallback';
import { beginSeznamSignIn } from './seznamFlow';
import { ModalAuthContext } from '../context/ModalAuthContext';
const mockDispatch = jest.fn(), mockNavigate = jest.fn();
jest.mock('react-redux', () => ({ useDispatch: () => mockDispatch }));
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
jest.mock('../redux/auth/operations', () => ({ authBySeznam: payload => ({ type: 'seznam', payload }) }));
function mount() { return render(<StrictMode><ModalAuthContext.Provider value={{setIsOpenModalAuth:jest.fn()}}><SeznamCallback /></ModalAuthContext.Provider></StrictMode>); }
beforeEach(() => { mockDispatch.mockReset(); mockNavigate.mockReset(); sessionStorage.clear(); window.history.replaceState({}, '', '/'); });
function callback() { const url = new URL(beginSeznamSignIn('client')); window.history.replaceState({}, '', '/?code=test-code&state=' + url.searchParams.get('state')); }
test('StrictMode exchanges code once, clears URL, then navigates only after success', async () => {
  callback(); mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve({}) }); mount();
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/ucet', { replace: true }));
  expect(mockDispatch).toHaveBeenCalledTimes(1); expect(window.location.search).toBe('');
});
test('failed exchange does not loop or navigate and shows recovery', async () => {
  callback(); mockDispatch.mockReturnValue({ unwrap: () => Promise.reject(new Error('failed')) }); mount();
  expect(await screen.findByRole('alert')).toHaveTextContent('nepodařilo');
  expect(mockDispatch).toHaveBeenCalledTimes(1); expect(mockNavigate).not.toHaveBeenCalled();
});
test('mismatched state never reaches backend', async () => {
  window.history.replaceState({}, '', '/?code=test-code&state=wrong'); mount();
  await screen.findByRole('alert'); expect(mockDispatch).not.toHaveBeenCalled();
});
