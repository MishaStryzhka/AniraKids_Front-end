jest.mock('axios', () => {
  const defaults = {
    baseURL: undefined,
    headers: { common: { Authorization: undefined } },
  };

  return {
    __esModule: true,
    default: {
      defaults,
      post: jest.fn(),
      get: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(() => ({ defaults: {}, get: jest.fn() })),
      isCancel: jest.fn(() => false),
    },
  };
});

const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
const { logIn } = require('./operations');

beforeEach(() => {
  jest.clearAllMocks();
  axios.defaults.headers.common.Authorization = undefined;
});

test('legacy auth operations source contains no console log/debug/info calls', () => {
  const source = fs.readFileSync(
    path.resolve(process.cwd(), 'src/redux/auth/operations.js'),
    'utf8'
  );

  expect(source).not.toMatch(/console\.(log|debug|info)\s*\(/);
});

test('successful logIn posts credentials, returns response data, and sets bearer Authorization header', async () => {
  const credentials = {
    email: 'user@example.test',
    password: 'dummy-password',
  };
  const responseData = {
    token: 'dummy-jwt-token',
    user: { id: 'dummy-user' },
  };
  axios.post.mockResolvedValue({ data: responseData });

  const dispatch = jest.fn();
  const getState = jest.fn(() => ({}));
  const result = await logIn(credentials)(dispatch, getState, undefined);

  expect(axios.post).toHaveBeenCalledWith('/api/users/login', credentials);
  expect(axios.defaults.headers.common.Authorization).toBe('Bearer dummy-jwt-token');
  expect(result.type).toBe('auth/login/fulfilled');
  expect(result.payload).toEqual(responseData);
});

test('failed logIn keeps existing rejectWithValue error contract', async () => {
  const credentials = {
    email: 'user@example.test',
    password: 'dummy-password',
  };
  axios.post.mockRejectedValue({
    response: {
      status: 401,
      data: { message: 'Invalid credentials' },
    },
  });

  const dispatch = jest.fn();
  const getState = jest.fn(() => ({}));
  const result = await logIn(credentials)(dispatch, getState, undefined);

  expect(axios.post).toHaveBeenCalledWith('/api/users/login', credentials);
  expect(result.type).toBe('auth/login/rejected');
  expect(result.meta.rejectedWithValue).toBe(true);
  expect(result.payload).toEqual({
    status: 401,
    message: 'Invalid credentials',
  });
  expect(axios.defaults.headers.common.Authorization).toBeUndefined();
});