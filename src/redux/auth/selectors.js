export const selectIsLoggedIn = state => state.auth.isLoggedIn;

export const selectIsLoading = state => state.auth.isLoading;

export const selectUser = state => state.auth.user;

export const selectIsRefreshing = state => state.auth.isRefreshing;

export const selectError = state => state.auth.error;

export const selectIsFirstLogin = state => state.auth.isFirstLogin;

export const selectIsDone = state => state.auth.isDone;
