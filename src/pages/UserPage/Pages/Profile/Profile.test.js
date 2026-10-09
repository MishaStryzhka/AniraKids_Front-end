import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from 'components/theme';
import Profile from './Profile';

const mockUnwrap = jest.fn();
const mockDispatch = jest.fn(() => ({ unwrap: mockUnwrap }));
const mockAuth = { user: { email: 'fixture@seznam.cz', provider: 'seznam', isFirstLogin: false, emailVerified: true }, currentTheme: 'light', isLoading: false, error: { message: 'Email in use' } };
jest.mock('hooks', () => ({ useAuth: () => mockAuth }));
jest.mock('react-redux', () => ({ useDispatch: () => mockDispatch }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key }) }));
jest.mock('../../../../redux/auth/operations', () => ({ updateUserInfo: values => values, verifiedEmail: jest.fn(), updateUserEmail: values => values }));
jest.mock('components/Forms/FormBillingDetails/FormBillingDetails', () => () => null);
jest.mock('components/Forms/FormBankAccount/FormBankAccount', () => () => null);
jest.mock('components/Modals/ModalBecomeLandlord/ModalBecomeLandlord', () => () => null);

beforeEach(() => { mockDispatch.mockReset(); mockDispatch.mockImplementation(() => ({ unwrap: mockUnwrap })); mockUnwrap.mockReset(); const portal = document.createElement('div'); portal.id = 'modal'; document.body.appendChild(portal); });
afterEach(() => document.getElementById('modal')?.remove());
function view() { return render(<ThemeProvider theme={theme.light}><Profile /></ThemeProvider>); }
function fillProfile() {
  fireEvent.change(screen.getByLabelText('firstName'), { target: { value: 'Mykhailo' } });
  fireEvent.change(screen.getByLabelText('lastName'), { target: { value: 'Stryzhka' } });
  fireEvent.change(screen.getByLabelText('Nickname'), { target: { value: '@mykhailo.test' } });
}
test('repeat profile save is available and a server error is shown next to the form', async () => {
  mockUnwrap.mockRejectedValue({ message: 'Phone number in use' });
  view(); fillProfile();
  fireEvent.click(screen.getByRole('button', { name: 'saveChanges' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Toto telefonní číslo je již používáno.');
  expect(mockUnwrap).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('firstName')).toHaveValue('Mykhailo');
});
test('successful save confirms completion and clears dirty state', async () => {
  mockUnwrap.mockResolvedValue({ user: mockAuth.user });
  view(); fillProfile();
  fireEvent.click(screen.getByRole('button', { name: 'saveChanges' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Změny byly uloženy.');
  await waitFor(() => expect(screen.getByRole('button', { name: 'saveChanges' })).toBeDisabled());
});
test('email text does not activate editing and opening editor does not inherit profile errors', () => {
  view();
  fireEvent.click(screen.getByText('fixture@seznam.cz'));
  expect(screen.queryByText('changeEmailTitle')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Změnit e-mail' }));
  expect(screen.getByText('changeEmailTitle')).toBeInTheDocument();
  expect(screen.queryByText('Email in use')).not.toBeInTheDocument();
});
