import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

axios.defaults.baseURL = 'https://anira-kids-back-end.onrender.com';
// axios.defaults.baseURL = 'http://Localhost:4000';

// Utility to add JWT
const setAuthHeader = token => {
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};

// Utility to remove JWT
const clearAuthHeader = () => {
  axios.defaults.headers.common.Authorization = '';
};

/*
 * POST @ /users/register
 * body: { name, email, password }
 */
export const register = createAsyncThunk(
  'auth/register',
  async (credentials, thunkAPI) => {
    try {
      const res = await axios.post('api/users/register', credentials);
      // After successful registration, add the token to the HTTP header
      setAuthHeader(res.data.token);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        status: error.response.status,
        message: error.response.data.message,
      });
    }
  }
);

/*
 * POST @ /users/login
 * body: { email, password }
 */
export const logIn = createAsyncThunk(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const res = await axios.post('/api/users/login', credentials);
      // After successful login, add the token to the HTTP header
      setAuthHeader(res.data.token);
      console.log('res.data', res.data);

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        status: error.response.status,
        message: error.response.data.message,
      });
    }
  }
);

/*
 * POST @ /users/logout
 * headers: Authorization: Bearer token
 */
export const logOut = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await axios.post('/api/users/logout');
    // After a successful logout, remove the token from the HTTP header
    clearAuthHeader();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

/*
 * GET @ /users/current
 * headers: Authorization: Bearer token
 */
export const refreshUser = createAsyncThunk(
  'auth/refresh',
  async (_, thunkAPI) => {
    // Reading the token from the state via getState()
    const state = thunkAPI.getState();
    const persistedToken = state.auth.token;

    if (persistedToken === null) {
      // If there is no token, exit without performing any request
      return thunkAPI.rejectWithValue('Unable to fetch user');
    }

    try {
      // If there is a token, add it to the HTTP header and perform the request
      setAuthHeader(persistedToken);
      const res = await axios.get('/api/users/current');
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
export const updateUserInfo = createAsyncThunk(
  'auth/update',
  async (
    {
      avatarUrl: avatar,
      firstName,
      lastName,
      patronymic,
      companyName,
      nickname,
      primaryPhoneNumber,
      email,
      newPassword,
      confirmNewPassword,
    },
    thunkAPI
  ) => {
    try {
      const formData = new FormData();
      avatar && formData.append('avatar', avatar);
      firstName && formData.append('firstName', firstName);
      lastName && formData.append('lastName', lastName);
      patronymic && formData.append('patronymic', patronymic);
      companyName && formData.append('companyName', companyName);
      nickname && formData.append('nickname', nickname);
      primaryPhoneNumber &&
        formData.append('primaryPhoneNumber', primaryPhoneNumber);
      email && formData.append('email', email);
      newPassword && formData.append('newPassword', newPassword);
      confirmNewPassword &&
        formData.append('confirmNewPassword', confirmNewPassword);

      const response = await axios.patch(
        `/api/users/current/update`,
        formData,
        { headers: { 'content-type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        status: error.response.status,
        message: error.response.data.message,
      });
    }
  }
);

export const updateUserEmail = createAsyncThunk(
  'auth/updateEmail',
  async ({ email }, thunkAPI) => {
    try {
      const response = await axios.patch(
        `/api/users/current/refreshEmail?email=${email}`
      );

      console.log('response.data', response.data);

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        status: error.response.status,
        message: error.response.data.message,
      });
    }
  }
);

export const confirmUserEmail = createAsyncThunk(
  'auth/confirmEmail',
  async ({ token }, thunkAPI) => {
    token && setAuthHeader(token);

    try {
      const response = await axios.post(`/api/users/current/confirmEmail`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        status: error.response.status,
        message: error.response.data.message,
      });
    }
  }
);

export const addUserFavorite = createAsyncThunk(
  'auth/update/addFavorite',
  async ({ noticeId }, thunkAPI) => {
    try {
      const response = await axios.post(`/api/notices/favorites/${noticeId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        status: error.response.status,
        message: error.response.data.message,
      });
    }
  }
);

export const removeUserFavorite = createAsyncThunk(
  'auth/update/removeFavorite',
  async ({ noticeId }, thunkAPI) => {
    try {
      const response = await axios.delete(`/api/notices/favorites/${noticeId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        status: error.response.status,
        message: error.response.data.message,
      });
    }
  }
);
