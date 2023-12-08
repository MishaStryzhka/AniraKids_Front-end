import { useAuth } from 'hooks';
import { Navigate, useLocation } from 'react-router-dom';

export const RestrictedRoute = ({ component: Component, redirectTo = '/' }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  return isLoggedIn ? (
    <Navigate
      to={location?.state?.redirectBack || redirectTo}
      state={{ filter: location?.state?.filter }}
    />
  ) : (
    Component
  );
};
