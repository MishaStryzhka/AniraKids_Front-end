import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from '../components/theme';
import ModalRegister from '../components/Modals/ModalRegister/ModalRegister';
import { rememberDeviceSignIn } from './deviceSignIn';
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({ useDispatch: () => mockDispatch }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key }) }));
jest.mock('@react-oauth/google', () => ({ GoogleLogin: ({onSuccess, onError}) => <><button onClick={() => onSuccess({credential:'fixture'})}>Google success</button><button onClick={onError}>Google error</button></> }));
jest.mock('../redux/auth/operations', () => ({ authByGoogle: jest.fn() }));
jest.mock('../components/Forms/FormRegistrationEmail/FormRegistrationEmail', () => () => <p>Email registration form</p>);
jest.mock('../components/Forms/FormRegistrationPhoneNumber/FormRegistrationPhoneNumber', () => () => <p>Phone registration form</p>);
jest.mock('../components/Forms/AuthForm/AuthForm', () => () => <p>Sign in form</p>);
function show() { return render(<ThemeProvider theme={theme.light}><ModalRegister handleCloseModal={() => {}} /></ThemeProvider>); }
beforeEach(() => localStorage.clear());
test('first visit opens registration and manual switching still works', () => {
  show(); expect(screen.getByText('Email registration form')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name:'Authorization'})); expect(screen.getByText('Sign in form')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name:'Authorization'})); expect(screen.getByText('Sign in form')).toBeInTheDocument();
});
test('returning device immediately opens sign in and can still register', () => {
  rememberDeviceSignIn(); show(); expect(screen.getByText('Sign in form')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name:'Registration'})); expect(screen.getByText('Email registration form')).toBeInTheDocument();
});

test('callback error is inside the auth window with sign in selected', () => {
  render(<ThemeProvider theme={theme.light}><ModalRegister authNotice="Seznam failed" handleCloseModal={() => {}} /></ThemeProvider>);
  expect(screen.getByRole('alert')).toHaveTextContent('Seznam failed');
  expect(screen.getByText('Sign in form')).toBeInTheDocument();
});

test('failed Google exchange is explained inside the modal', async () => {
  mockDispatch.mockReturnValue({ unwrap: () => Promise.reject({ status: 401 }) });
  show(); fireEvent.click(screen.getByText('Google success'));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Přihlášení přes Google se nezdařilo'));
});
test('Google provider failure is explained and retry clears the error', async () => {
  mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  show(); fireEvent.click(screen.getByText('Google error'));
  expect(screen.getByRole('alert')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Google success'));
  await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
});
test('existing third party email gives a useful login instruction', async () => {
  mockDispatch.mockReturnValue({ unwrap: () => Promise.reject({ status: 409 }) });
  show(); fireEvent.click(screen.getByText('Google success'));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('původním způsobem'));
});
