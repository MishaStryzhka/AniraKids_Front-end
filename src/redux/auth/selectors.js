export const selectIsLoggedIn = state => state.auth.isLoggedIn;

export const selectUser = state => state.auth.user;

export const selectIsRefreshing = state => state.auth.isRefreshing;

export const selectError = state => state.auth.error;

export const selectCurrentTheme = state => state.auth.currentTheme;

export const selectIsFirstLogin = state => state.auth.isFirstLogin;
