import { createSlice } from '@reduxjs/toolkit';
import {
  register,
  logIn,
  logOut,
  refreshUser,
  updateUserInfo,
  updateUserEmail,
  updateUserBillingDetails,
} from './operations';

const initialState = {
  user: null,
  token: null,
  isLoggedIn: false,
  isLoading: false,
  isDone: null,
  isRefreshing: false,
  error: null,
  isFirstLogin: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearDone: state => {
      state.isDone = null;
    },
  },
  extraReducers: builder => {
    builder
      // register
      .addCase(register.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.isFirstLogin = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // logIn
      .addCase(logIn.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.isFirstLogin = false;
      })
      .addCase(logIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // logOut
      .addCase(logOut.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.isLoggedIn = false;
        state.isFirstLogin = false;
      })
      // refreshUser
      .addCase(refreshUser.pending, state => {
        state.isRefreshing = true;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.isRefreshing = false;
        state.isFirstLogin = false;
      })
      .addCase(refreshUser.rejected, state => {
        state.isRefreshing = false;
        state.token = null;
      })

      // updateUserInfo
      .addCase(updateUserInfo.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        console.log('action.payload', action.payload);

        state.user = action.payload.user;
        state.isLoading = false;
      })
      .addCase(updateUserInfo.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      // updateUserBillingDetails
      .addCase(updateUserBillingDetails.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserBillingDetails.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isLoading = false;
        state.isDone = true;
      })
      .addCase(updateUserBillingDetails.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      // updateUserEmail
      .addCase(updateUserEmail.pending, state => {
        state.isLoading = true;
      })
      .addCase(updateUserEmail.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isLoading = false;
        state.isDone = true;
      })
      .addCase(updateUserEmail.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

export const authReducer = authSlice.reducer;
export const { clearError, clearDone } = authSlice.actions;
