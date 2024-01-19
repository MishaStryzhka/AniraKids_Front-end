import { createSlice } from '@reduxjs/toolkit';
import { updateLanguage } from './operations';

const initialState = {
  currentTheme: 'light',
  language: 'uk',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(updateLanguage.pending, state => {
        state.isRefreshing = true;
      })
      .addCase(updateLanguage.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.isFirstLogin = true;
      })
      .addCase(updateLanguage.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setLanguage } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;

export default settingsSlice.reducer;
