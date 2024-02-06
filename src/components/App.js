import { lazy, useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import { Route, Routes } from 'react-router-dom';
import SharedLayout from './SharedLayout/SharedLayout';
import { PrivateRoute } from './PrivateRoute';
import { useDispatch } from 'react-redux';
import { refreshUser } from '../redux/auth/operations';
import { useAuth } from 'hooks';
import AddProduct from 'pages/UserPage/Pages/RentOut/Pages/AddProduct/AddProduct';
import PrivacyPolicyPage from 'pages/PrivacyPolicyPage/PrivacyPolicyPage';
import RefreshPasswordPage from 'pages/RefreshPasswordPage/RefreshPasswordPage';
import { RestrictedRoute } from './RestrictedRoute';

const AboutUsPage = lazy(() => import('../pages/AboutUsPage/AboutUsPage'));
const DecorAndToysPage = lazy(() =>
  import('../pages/DecorAndToysPage/DecorAndToysPage')
);
const ForChildrenPage = lazy(() =>
  import('../pages/ForChildrenPage/ForChildrenPage')
);
const ForMenPage = lazy(() => import('../pages/ForMenPage/ForMenPage'));
const ForWomenPage = lazy(() => import('../pages/ForWomenPage/ForWomenPage'));
const MainPage = lazy(() => import('../pages/MainPage/MainPage'));
const UserPage = lazy(() => import('../pages/UserPage/UserPage'));
const ConfirmEmailPage = lazy(() =>
  import('../pages/ConfirmEmailPage/ConfirmEmailPage')
);
const NotFoundPage = lazy(() => import('../pages/NotFoundPage/NotFoundPage'));

const Profile = lazy(() => import('../pages/UserPage/Pages/Profile/Profile'));
const Chat = lazy(() => import('../pages/UserPage/Pages/Chat/Chat'));
const Favorite = lazy(() =>
  import('../pages/UserPage/Pages/Favorite/Favorite')
);
const RentOut = lazy(() => import('../pages/UserPage/Pages/RentOut/RentOut'));
const RentIn = lazy(() => import('../pages/UserPage/Pages/RentIn/RentIn'));
const MyOrders = lazy(() =>
  import('../pages/UserPage/Pages/MyOrders/MyOrders')
);
const MyPurchases = lazy(() =>
  import('../pages/UserPage/Pages/MyPurchases/MyPurchases')
);
const Wallet = lazy(() => import('../pages/UserPage/Pages/Wallet/Wallet'));
const Order1 = lazy(() => import('../pages/UserPage/Pages/Order1/Order1'));
const ProductPage = lazy(() => import('../pages/ProductPage/ProductPage'));

function App() {
  const [currentTheme, setCurrentTheme] = useState('light');
  const dispatch = useDispatch();
  const { token } = useAuth();

  if (false) setCurrentTheme('light');

  useEffect(() => {
    dispatch(refreshUser());
  }, [dispatch, token]);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Routes>
        <Route
          path="/"
          element={
            <RestrictedRoute
              redirectTo="/"
              redirectBack="/my-account"
              component={<SharedLayout />}
            />
          }
        >
          <Route path="/" element={<MainPage />} />
          <Route path="/forMen" element={<ForMenPage />} />
          <Route path="/forWomen" element={<ForWomenPage />}>
            <Route path=":id" element={<ProductPage />} />
          </Route>
          <Route path="/forChildren" element={<ForChildrenPage />} />
          <Route path="/decorAndToys" element={<DecorAndToysPage />} />
          <Route path="/aboutUs" element={<AboutUsPage />} />
          <Route path="/confirmEmail" element={<ConfirmEmailPage />} />
          <Route path="/refreshPassword" element={<RefreshPasswordPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route
            path="/my-account"
            element={
              <PrivateRoute
                redirectTo="/"
                redirectBack="/my-account/profile"
                component={<UserPage />}
              />
            }
          >
            <Route index element={<Profile />} />
            <Route path="profile/" element={<Profile />} />
            <Route path="chat/" element={<Chat />} />
            <Route path="favorite/" element={<Favorite />} />
            <Route path="rent-out/" element={<RentOut />}>
              <Route path="add-product/" element={<AddProduct />} />
            </Route>
            <Route path="rent-in/" element={<RentIn />} />
            <Route path="my-orders/" element={<MyOrders />} />
            <Route path="my-purchases/" element={<MyPurchases />} />
            <Route path="wallet/" element={<Wallet />} />
            <Route path="order1/" element={<Order1 />} />
          </Route>
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
