import { useAuth } from 'hooks';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';

/**
 * - If the route is private and the user is logged in, render the component
 * - Otherwise render <Navigate> to redirectTo
 */

export const PrivateRoute = ({
  component: Component,
  redirectTo = '/',
  redirectBack,
}) => {
  const [searchParams] = useSearchParams();
  const { isLoggedIn, isRefreshing } = useAuth();
  const shouldRedirect = !isLoggedIn && !isRefreshing;
  const location = useLocation();

  return shouldRedirect ? (
    <Navigate
      to={redirectTo}
      state={{
        filter: searchParams.get('filter'),
        redirectBack: location.pathname || redirectBack,
      }}
    />
  ) : (
    Component
  );
};
