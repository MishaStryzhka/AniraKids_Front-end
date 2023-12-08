import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentTheme: 'light',
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    // extraReducers: (builder) => {
    //     builder.addCase(register.fulfilled, (state, action) => {
    //         state.user = action.payload.user;
    //         state.token = action.payload.token;
    //         state.isLoggedIn = true;
    //         state.isFirstLogin = true;
    //     });
    // },
    reducers: {},
});

export const settingsReducer = settingsSlice.reducer;
