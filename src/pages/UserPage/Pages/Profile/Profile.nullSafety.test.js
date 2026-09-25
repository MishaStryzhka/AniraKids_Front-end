jest.mock('axios', () => ({
  __esModule: true,
  default: {
    defaults: {
      baseURL: undefined,
      headers: { common: { Authorization: undefined } },
    },
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Profile from './Profile';
import { PrivateRoute } from '../../../../components/PrivateRoute';
import { authReducer } from '../../../../redux/auth/slice';
import { logOut } from '../../../../redux/auth/operations';

let mockAuthState;
const mockDispatch = jest.fn();

jest.mock('hooks', () => ({
  useAuth: () => mockAuthState,
}));

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key }),
}));

jest.mock('formik', () => {
  const React = require('react');
  return {
    Field: props => React.createElement('input', props),
    Formik: ({ children, initialValues }) =>
      React.createElement(
        React.Fragment,
        null,
        children({
          values: initialValues,
          errors: {},
          touched: {},
          setFieldValue: jest.fn(),
          setTouched: jest.fn(),
          handleChange: jest.fn(),
          handleBlur: jest.fn(),
          handleSubmit: jest.fn(),
        })
      ),
  };
});

jest.mock('./Profile.styled', () => {
  const React = require('react');
  const div = props => React.createElement('div', props, props.children);
  const button = props => React.createElement('button', props, props.children);
  const label = props => React.createElement('label', props, props.children);
  return {
    Avatar: props => React.createElement('img', props),
    AvatarDescription: div,
    AvatarLabel: label,
    AvatarWrap: label,
    ButtonEdit: button,
    ButtonShow: button,
    ButtonVerify: button,
    InputText: div,
    Label: label,
    Placeholder: div,
    ProfileForm: props => React.createElement('div', { ...props, 'data-testid': 'profile-form' }, props.children),
    SecondWrap: div,
    StyledButton: button,
    StyledIconPencil: div,
    Wrap: div,
    Wrapper: div,
    WrapperBiling: div,
  };
});

jest.mock('components/Forms/Form.styled', () => {
  const React = require('react');
  return {
    ErrorMessage: props => React.createElement('span', props, props.children),
    InputField: props => React.createElement('input', props),
  };
});

jest.mock('components/Modals/Modal', () => {
  const React = require('react');
  return props => React.createElement('div', props, props.children);
});
jest.mock('components/Modals/ModalAddAvatar/ModalAddAvatar', () => () => null);
jest.mock('components/Modals/ModalChangePhoneNumber/ModalChangePhoneNumber', () => () => null);
jest.mock('components/Modals/ModalChangeEmail/ModalChangeEmail', () => () => null);
jest.mock('components/Modals/ModalBecomeLandlord/ModalBecomeLandlord', () => () => null);
jest.mock('components/Forms/FormBillingDetails/FormBillingDetails', () => () => null);
jest.mock('components/Forms/FormBankAccount/FormBankAccount', () => () => null);

jest.mock('images/icons/IconEyeOpen', () => () => null);
jest.mock('images/icons/IconEyeClosed', () => () => null);
jest.mock('components/theme', () => ({ light: { color: { mainColor2: '#000' } } }));
jest.mock('schemas', () => ({ validationProfileSchema: undefined }));

jest.mock('react-spinners', () => ({ BeatLoader: () => null }));
jest.mock('components/Modals/Modal.styled', () => {
  const React = require('react');
  return { TextDone: props => React.createElement('div', props, props.children) };
});
jest.mock('components/Buttons/ButtonAdd/ButtonAdd', () => {
  const React = require('react');
  return props => React.createElement('button', props, props.children);
});
jest.mock('./SceletonProfile.styled', () => {
  const React = require('react');
  const div = props => React.createElement('div', props, props.children);
  return {
    SceletonAvatar: div,
    SceletonDescription: div,
    SceletonField: div,
    SceletonFieldInput: div,
    SceletonText: div,
  };
});
jest.mock('components/SectionAnswers/SectionAnswers.styled', () => {
  const React = require('react');
  const div = props => React.createElement('div', props, props.children);
  return { QuestionDescription: div, StyledIconArrowUp: div };
});

const authenticatedUser = {
  _id: 'user-1',
  firstName: 'Test',
  lastName: 'User',
  email: 'user@example.test',
  emailVerified: true,
  typeUser: 'customer',
  isFirstLogin: false,
  provider: 'email',
};

beforeEach(() => {
  mockDispatch.mockClear();
  mockAuthState = {
    user: authenticatedUser,
    currentTheme: 'light',
    isLoading: false,
    error: null,
    isDone: null,
    isLoggedIn: true,
    isRefreshing: false,
  };
});

test('Profile survives an authenticated-to-null user transition without throwing', () => {
  const { rerender } = render(<Profile />);
  expect(screen.getByTestId('profile-form')).toBeInTheDocument();

  mockAuthState = {
    ...mockAuthState,
    user: null,
    isLoggedIn: false,
  };

  expect(() => rerender(<Profile />)).not.toThrow();
  expect(screen.queryByTestId('profile-form')).not.toBeInTheDocument();
});

test('Profile with authenticated user still renders its form', () => {
  render(<Profile />);
  expect(screen.getByTestId('profile-form')).toBeInTheDocument();
});

test('logout fulfilled still clears user, token, and logged-in state', () => {
  const state = {
    user: authenticatedUser,
    token: 'dummy-token',
    isLoggedIn: true,
    isLoading: false,
    isDone: null,
    isRefreshing: false,
    error: null,
    isFirstLogin: false,
  };

  const next = authReducer(state, logOut.fulfilled(undefined, 'request-id'));

  expect(next.user).toBeNull();
  expect(next.token).toBeNull();
  expect(next.isLoggedIn).toBe(false);
});

test('PrivateRoute still redirects unauthenticated users', () => {
  mockAuthState = {
    ...mockAuthState,
    user: null,
    isLoggedIn: false,
    isRefreshing: false,
  };

  render(
    <MemoryRouter initialEntries={['/my-account/profile']}>
      <Routes>
        <Route
          path="/my-account/profile"
          element={<PrivateRoute component={<div>private profile</div>} redirectTo="/" />}
        />
        <Route path="/" element={<div>public home</div>} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText('public home')).toBeInTheDocument();
  expect(screen.queryByText('private profile')).not.toBeInTheDocument();
});