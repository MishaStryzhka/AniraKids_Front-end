import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from 'hooks';

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

    return shouldRedirect ? (
        <Navigate
            to={redirectTo}
            state={{ filter: searchParams.get('filter'), redirectBack }}
        />
    ) : (
        Component
    );
};
