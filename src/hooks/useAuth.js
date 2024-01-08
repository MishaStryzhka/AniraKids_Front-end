import { useSelector } from 'react-redux';
import {
  selectError,
  selectIsFirstLogin,
  selectIsLoggedIn,
  selectIsRefreshing,
  selectUser,
  selectIsLoading,
  selectIsDone,
} from '../redux/auth/selectors';
import { selectCurrentTheme } from '../redux/settings/selectors';

export const useAuth = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isLoading = useSelector(selectIsLoading);
  const isRefreshing = useSelector(selectIsRefreshing);
  const user = useSelector(selectUser);
  const error = useSelector(selectError);
  const currentTheme = useSelector(selectCurrentTheme);
  const isFirstLogin = useSelector(selectIsFirstLogin);
  const isDone = useSelector(selectIsDone);

  return {
    isLoading,
    isLoggedIn,
    isRefreshing,
    user,
    error,
    currentTheme,
    isFirstLogin,
    isDone,
  };
};
