import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTheme: 'light',
  currentLanguage: 'uk',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
  },
});

export const { setLanguage } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;

export default settingsSlice.reducer;
