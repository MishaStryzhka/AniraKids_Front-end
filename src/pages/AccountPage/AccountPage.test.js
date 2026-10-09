import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccountPage from './AccountPage';
import { ModalAuthContext } from '../../context/ModalAuthContext';
let mockAuth;
const mockDispatch = jest.fn(), mockNavigate = jest.fn();
jest.mock('react-redux', () => ({ useDispatch: () => mockDispatch }));
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
jest.mock('../../redux/auth/operations', () => ({ logOut: () => ({type: 'logout'}) }));
jest.mock('hooks', () => ({ useAuth: () => mockAuth, useTitle: () => {} }));
jest.mock('../UserPage/Pages/Profile/Profile', () => ({ __esModule: true, default: () => <div>Existing profile</div> }));
const open = jest.fn();
function mount() { return render(<ModalAuthContext.Provider value={{ setIsOpenModalAuth: open }}><AccountPage /></ModalAuthContext.Provider>); }
beforeEach(() => { open.mockClear(); });
test('direct signed-out account entry offers authentication', () => {
  mockAuth = { isLoggedIn: false, isRefreshing: false, user: null };
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Přihlásit se' }));
  expect(open).toHaveBeenCalledWith(true);
});
test('refreshing session does not show a blank profile or sign-in prompt', () => {
  mockAuth = { isLoggedIn: false, isRefreshing: true, user: null };
  mount(); expect(screen.getByRole('status')).toHaveTextContent('Načítáme váš účet');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
test('authenticated account mounts real profile boundary and handles sign-out', async () => {
  mockAuth = { isLoggedIn: true, isRefreshing: false, user: { email: 'owner@example.test' } };
  const view = mount(); expect(await screen.findByText('Existing profile')).toBeInTheDocument();
  mockAuth = { isLoggedIn: false, isRefreshing: false, user: null };
  view.rerender(<ModalAuthContext.Provider value={{ setIsOpenModalAuth: open }}><AccountPage /></ModalAuthContext.Provider>);
  expect(screen.queryByText('Existing profile')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Přihlásit se' })).toBeInTheDocument();
});

test('logout waits for server confirmation and then returns home', async () => {
  mockAuth = { isLoggedIn: true, isRefreshing: false, user: {} };
  mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve() });
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Odhlásit se' }));
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', {replace:true}));
});
test('logout failure is visible and allows retry', async () => {
  mockAuth = { isLoggedIn: true, isRefreshing: false, user: {} };
  mockNavigate.mockClear(); mockDispatch.mockReturnValue({ unwrap: () => Promise.reject(new Error()) });
  mount(); fireEvent.click(screen.getByRole('button', { name: 'Odhlásit se' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Odhlášení se nezdařilo');
  expect(mockNavigate).not.toHaveBeenCalled();
});
