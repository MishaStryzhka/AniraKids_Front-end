import { confirmUserEmail } from './operations';
import { createSlice } from '@reduxjs/toolkit';
import {
  register,
  logIn,
  logOut,
  refreshUser,
  updateUserInfo,
  updateUserEmail,
  verifiedEmail,
  authByGoogle,
  authBySeznam,
} from './operations';

const initialState = {
  user: null,
  token: null,
  isLoggedIn: false,
  isLoading: false,
  isDone: null,
  isRefreshing: false,
  refreshRequestId: null,
  refreshToken: null,
  refreshError: null,
  error: null,
  isFirstLogin: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearSession: state => {
      state.user = null; state.token = null; state.isLoggedIn = false; state.isRefreshing = false;
    },
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

      // authByGoogle
      .addCase(authByGoogle.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authByGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.isFirstLogin = true;
      })
      .addCase(authByGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // authBySeznam
      .addCase(authBySeznam.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authBySeznam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.isFirstLogin = true;
      })
      .addCase(authBySeznam.rejected, (state, action) => {
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
      .addCase(refreshUser.pending, (state, action) => {
        state.isRefreshing = true;
        state.refreshRequestId = action.meta.requestId;
        state.refreshToken = state.token;
        state.refreshError = null;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        if (state.refreshRequestId !== action.meta.requestId) return;
        state.isRefreshing = false;
        if (state.refreshToken !== state.token) return;
        if (!state.token) { state.isRefreshing = false; return; }
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.isRefreshing = false;
        state.isFirstLogin = false;
      })
      .addCase(refreshUser.rejected, (state, action) => {
        if (state.refreshRequestId !== action.meta.requestId) return;
        state.isRefreshing = false;
        if (state.refreshToken !== state.token) return;
        if (action.payload?.status === 401) {
          state.token = null;
          state.user = null;
          state.isLoggedIn = false;
        } else {
          state.refreshError = action.payload || { status: 0 };
        }
      })

      // updateUserInfo
      .addCase(updateUserInfo.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserInfo.fulfilled, (state, action) => {

        state.user = action.payload.user;
        state.isLoading = false;
      })
      .addCase(updateUserInfo.rejected, (state, action) => {
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
      })

      .addCase(confirmUserEmail.fulfilled, (state, action) => {
        if (action.meta.arg.changeEmail && state.user &&
            String(state.user.userID || state.user._id) === action.payload.user?.userID) {
          state.user.email = action.payload.user.email;
          state.user.emailVerified = true;
        } else if (!action.meta.arg.changeEmail && state.user?.email && state.user.email === action.payload.user?.email) {
          state.user.emailVerified = true;
        }
      })

      // verifiedEmail
      .addCase(verifiedEmail.pending, state => {
        state.isLoading = true;
      })
      .addCase(verifiedEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isDone = action.payload;
      })
      .addCase(verifiedEmail.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

export const authReducer = authSlice.reducer;
export const {
  clearError,
  clearSession,
  clearDone,
} = authSlice.actions;
