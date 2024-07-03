import { createSlice } from '@reduxjs/toolkit';
import {
  register,
  logIn,
  logOut,
  refreshUser,
  updateUserInfo,
  updateUserEmail,
  updateUserBillingDetails,
  updateUserBankAccount,
  verifiedEmail,
  addToFavorites,
  removeFromFavorites,
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
  error: null,
  isFirstLogin: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    addOrderIdToUserCart: (state, { payload }) => {
      const orderIdExists = state.user.cart.some(order => order === payload);
      if (!orderIdExists) {
        state.user.cart.push(payload);
      }
    },
    removeOrderIdFromUserCart: (state, { payload }) => {
      state.user.cart = state.user.cart.filter(order => order !== payload);
    },
    clearError: state => {
      state.error = null;
    },
    clearDone: state => {
      state.isDone = null;
    },
    addPickupAddress: ({ user }, { payload }) =>
      user.pickupAddresses.push(payload),
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
        state.user.billingDetails = action.payload.billingDetails;
        state.isLoading = false;
        state.isDone = true;
      })
      .addCase(updateUserBillingDetails.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      // updateUserBillingDetails
      .addCase(updateUserBankAccount.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserBankAccount.fulfilled, (state, action) => {
        console.log('action.payload', action.payload);

        state.user.bankAccount = action.payload.bankAccount;
        state.user.typeUser = action.payload.typeUser;

        state.isLoading = false;
        state.isDone = true;
      })
      .addCase(updateUserBankAccount.rejected, (state, action) => {
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
      })

      // addToFavorites
      .addCase(addToFavorites.pending, state => {
        state.isLoading = true;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.user.favorites.push(action.payload.id);
        state.isLoading = false;
        state.isDone = true;
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })

      // removeFromFavorites
      .addCase(removeFromFavorites.pending, state => {
        state.isLoading = true;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.user.favorites = state.user.favorites.filter(
          item => item !== action.payload.id
        );
        state.isLoading = false;
        state.isDone = true;
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

export const authReducer = authSlice.reducer;
export const {
  addOrderIdToUserCart,
  removeOrderIdFromUserCart,
  clearError,
  clearDone,
  addPickupAddress,
} = authSlice.actions;
