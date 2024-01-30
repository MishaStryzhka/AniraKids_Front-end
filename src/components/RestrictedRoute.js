import { useAuth } from 'hooks';
import { Navigate, useLocation } from 'react-router-dom';

export const RestrictedRoute = ({ component: Component, redirectTo = '/' }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (isLoggedIn && location?.state?.redirectBack) {
    document.body.style.overflow = 'auto';
  }

  return isLoggedIn && location?.state?.redirectBack ? (
    <Navigate
      to={location?.state?.redirectBack || redirectTo}
      state={{ filter: location?.state?.filter }}
    />
  ) : (
    Component
  );
};
