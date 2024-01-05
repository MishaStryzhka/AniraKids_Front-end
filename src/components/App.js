import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import { Route, Routes } from 'react-router-dom';
import SharedLayout from './SharedLayout/SharedLayout';
import {
  AboutUsPage,
  DecorAndToysPage,
  ForChildrenPage,
  ForMenPage,
  ForWomenPage,
  MainPage,
  UserPage,
  NotFoundPage,
} from '../pages';
import { PrivateRoute } from './PrivateRoute';
import { useDispatch } from 'react-redux';
import { refreshUser } from '../redux/auth/operations';
import { useAuth } from 'hooks';
import Profile from 'pages/UserPage/Pages/Profile/Profile';
import Chat from 'pages/UserPage/Pages/Chat/Chat';
import Favorite from 'pages/UserPage/Pages/Favorite/Favorite';
import RentOut from 'pages/UserPage/Pages/RentOut/RentOut';
import RentIn from 'pages/UserPage/Pages/RentIn/RentIn';
import MyOrders from 'pages/UserPage/Pages/MyOrders/MyOrders';
import MyPurchases from 'pages/UserPage/Pages/MyPurchases/MyPurchases';
import Wallet from 'pages/UserPage/Pages/Wallet/Wallet';
import Order1 from 'pages/UserPage/Pages/Order1/Order1';

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
        <Route path="/" element={<SharedLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/forMen" element={<ForMenPage />} />
          <Route path="/forWomen" element={<ForWomenPage />} />
          <Route path="/forChildren" element={<ForChildrenPage />} />
          <Route path="/decorAndToys" element={<DecorAndToysPage />} />
          <Route path="/aboutUs" element={<AboutUsPage />} />
          <Route path="*" element={<NotFoundPage />} />
          {/* <Route
                        path='/login'
                        element={
                            <RestrictedRoute
                                redirectTo='/user'
                                component={<LoginPage />}
                            />
                        }
                    />
                    <Route
                        path='/register'
                        element={
                            <RestrictedRoute
                                redirectTo='/user'
                                component={<RegisterPage />}
                            />
                        }
                    /> */}
          <Route
            path="/my-account"
            element={
              <PrivateRoute
                redirectTo="/"
                redirectBack="/my-account"
                component={<UserPage />}
              />
            }
          >
            <Route index element={<Profile />} />
            <Route path="profile/" element={<Profile />} />
            <Route path="chat/" element={<Chat />} />
            <Route path="favorite/" element={<Favorite />} />
            <Route path="rent-out/" element={<RentOut />} />
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
