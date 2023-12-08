import { useSelector } from 'react-redux';
import {
  selectError,
  selectIsFirstLogin,
  selectIsLoggedIn,
  selectIsRefreshing,
  selectUser,
} from '../redux/auth/selectors';
import { selectCurrentTheme } from '../redux/settings/selectors';

export const useAuth = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isRefreshing = useSelector(selectIsRefreshing);
  const user = useSelector(selectUser);
  const error = useSelector(selectError);
  const currentTheme = useSelector(selectCurrentTheme);
  const isFirstLogin = useSelector(selectIsFirstLogin);

  return {
    isLoggedIn,
    isRefreshing,
    user,
    error,
    currentTheme,
    isFirstLogin,
  };
};
