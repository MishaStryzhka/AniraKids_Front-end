import { lazy, useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import theme from './theme';
import { PrivateRoute } from './PrivateRoute';
import { RestrictedRoute } from './RestrictedRoute';
import { refreshUser } from '../redux/auth/operations';
import { useAuth } from 'hooks';
import AddProduct from 'pages/UserPage/Pages/RentOut/Pages/AddProduct/AddProduct';
import PrivacyPolicyPage from 'pages/PrivacyPolicyPage/PrivacyPolicyPage';
import RefreshPasswordPage from 'pages/RefreshPasswordPage/RefreshPasswordPage';
import { GlobalStyles } from '../design-system/styles/GlobalStyles';
import { StorefrontLayout } from '../layouts/StorefrontLayout';
import { ReservationFlowLayout } from '../layouts/ReservationFlowLayout';
import { CanonicalRoutePlaceholder, ProductRoutePlaceholder } from '../pages/CanonicalRoutePlaceholder/CanonicalRoutePlaceholder';
import { routes } from '../navigation/routes';
import { ModalAuthContext } from '../context/ModalAuthContext';
import Modal from './Modals/Modal';
import ModalRegister from './Modals/ModalRegister/ModalRegister';
import { AdminAccessBoundary } from '../admin/auth/AdminAccessBoundary';
import { AdminLayout } from '../admin/layout/AdminLayout';
import { adminRoutes } from '../admin/navigation/adminRoutes';
import { AdminProductsPage } from '../admin/products/AdminProductsPage';
import {
  AdminHomePage,
  AdminProductCreatePlaceholder,
  AdminProductDetailPlaceholder,
  AdminReservationsPlaceholder,
  AdminReservationDetailPlaceholder,
  AdminCalendarPlaceholder,
} from '../admin/pages/AdminPlaceholders';

const AboutUsPage = lazy(() => import('../pages/AboutUsPage/AboutUsPage'));
const DecorAndToysPage = lazy(() => import('../pages/DecorAndToysPage/DecorAndToysPage'));
const ForChildrenPage = lazy(() => import('../pages/ForChildrenPage/ForChildrenPage'));
const ForMenPage = lazy(() => import('../pages/ForMenPage/ForMenPage'));
const ForWomenPage = lazy(() => import('../pages/ForWomenPage/ForWomenPage'));
const MainPage = lazy(() => import('../pages/MainPage/MainPage'));
const UserPage = lazy(() => import('../pages/UserPage/UserPage'));
const ConfirmEmailPage = lazy(() => import('../pages/ConfirmEmailPage/ConfirmEmailPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage/NotFoundPage'));
const Profile = lazy(() => import('../pages/UserPage/Pages/Profile/Profile'));
const Chat = lazy(() => import('../pages/UserPage/Pages/Chat/Chat'));
const Favorite = lazy(() => import('../pages/UserPage/Pages/Favorite/Favorite'));
const RentOut = lazy(() => import('../pages/UserPage/Pages/RentOut/RentOut'));
const UpdateProduct = lazy(() => import('../pages/UserPage/Pages/RentOut/Pages/UpdateProduct/UpdateProduct'));
const RentIn = lazy(() => import('../pages/UserPage/Pages/RentIn/RentIn'));
const MyOrders = lazy(() => import('../pages/UserPage/Pages/MyOrders/MyOrders'));
const MyPurchases = lazy(() => import('../pages/UserPage/Pages/MyPurchases/MyPurchases'));
const ViewOrder = lazy(() => import('../pages/UserPage/Pages/MyOrders/Pages/ViewOrder/ViewOrder'));
const ViewPurchase = lazy(() => import('../pages/UserPage/Pages/MyPurchases/Pages/ViewPurchase/ViewPurchase'));
const Wallet = lazy(() => import('../pages/UserPage/Pages/Wallet/Wallet'));
const Cart = lazy(() => import('../pages/UserPage/Pages/Cart/Cart'));
const ProductPage = lazy(() => import('../pages/ProductPage/ProductPage'));
const PopularPage = lazy(() => import('../pages/PopularPage/PopularPage'));

function App() {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isOpenModalAuth, setIsOpenModalAuth] = useState(false);
  const dispatch = useDispatch();
  const { token, isLoggedIn } = useAuth();

  if (false) setCurrentTheme('light');

  useEffect(() => {
    dispatch(refreshUser());
  }, [dispatch, token]);

  useEffect(() => {
    if (isLoggedIn && isOpenModalAuth) setIsOpenModalAuth(false);
  }, [isLoggedIn, isOpenModalAuth]);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <GlobalStyles />
      <ModalAuthContext.Provider value={{ isOpenModalAuth, setIsOpenModalAuth }}>
        <Routes>
          <Route
            element={
              <RestrictedRoute
                redirectTo="/"
                redirectBack="/my-account"
                component={<StorefrontLayout />}
              />
            }
          >
            <Route path={routes.home} element={<MainPage />} />

            {/* DESIGN-02 canonical storefront routes. Page UI is intentionally not invented here. */}
            <Route path={routes.dresses} element={<CanonicalRoutePlaceholder />} />
            <Route path={routes.suits} element={<CanonicalRoutePlaceholder />} />
            <Route path={routes.newArrivals} element={<CanonicalRoutePlaceholder />} />
            <Route path={routes.rental} element={<CanonicalRoutePlaceholder />} />
            <Route path={routes.search} element={<CanonicalRoutePlaceholder />} />
            <Route path={routes.favourites} element={<CanonicalRoutePlaceholder />} />
            <Route path={routes.account} element={<CanonicalRoutePlaceholder />} />
            <Route path={routes.accountReservations} element={<CanonicalRoutePlaceholder />} />
            <Route path={routes.faq} element={<CanonicalRoutePlaceholder />} />
            <Route path={routes.rentalTerms} element={<CanonicalRoutePlaceholder />} />
            <Route path={routes.contact} element={<CanonicalRoutePlaceholder />} />
            <Route path={routes.terms} element={<CanonicalRoutePlaceholder />} />
            <Route path={routes.privacy} element={<PrivacyPolicyPage />} />
            <Route path={routes.cookies} element={<CanonicalRoutePlaceholder />} />
            <Route path={routes.productPattern} element={<ProductRoutePlaceholder />} />

            {/* Legacy pages remain reachable during the controlled migration. */}
            <Route path="/popular" element={<PopularPage />} />
            <Route path="/forMen" element={<ForMenPage />}><Route path=":id" element={<ProductPage />} /></Route>
            <Route path="/forWomen" element={<ForWomenPage />}><Route path=":id" element={<ProductPage />} /></Route>
            <Route path="/forChildren" element={<ForChildrenPage />}><Route path=":id" element={<ProductPage />} /></Route>
            <Route path="/decorAndToys" element={<DecorAndToysPage />}><Route path=":id" element={<ProductPage />} /></Route>
            <Route path="/aboutUs" element={<AboutUsPage />} />
            <Route path="/confirmEmail" element={<ConfirmEmailPage />} />
            <Route path="/refreshPassword" element={<RefreshPasswordPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

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
              <Route path="favorite/" element={<Favorite />}><Route path=":id" element={<ProductPage />} /></Route>
              <Route path="rent-out/" element={<RentOut />}><Route path=":id" element={<ProductPage />} /></Route>
              <Route path="rent-out/add-product/" element={<AddProduct />} />
              <Route path="rent-out/update-product/:id" element={<UpdateProduct />} />
              <Route path="rent-in/" element={<RentIn />} />
              <Route path="my-orders/" element={<MyOrders />} />
              <Route path="my-orders/order/:id" element={<ViewOrder />} />
              <Route path="my-purchases/" element={<MyPurchases />} />
              <Route path="my-purchases/purchase/:id" element={<ViewPurchase />} />
              <Route path="wallet/" element={<Wallet />} />
              <Route path="cart/" element={<Cart />} />
            </Route>

            <Route path="favorite/" element={<Favorite />} />
            <Route path="cart/" element={<Cart />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path={adminRoutes.root} element={<AdminAccessBoundary />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminHomePage />} />
              <Route path={adminRoutes.products} element={<AdminProductsPage />} />
              <Route path={adminRoutes.productNew} element={<AdminProductCreatePlaceholder />} />
              <Route path={adminRoutes.productDetail} element={<AdminProductDetailPlaceholder />} />
              <Route path={adminRoutes.reservations} element={<AdminReservationsPlaceholder />} />
              <Route path={adminRoutes.reservationDetail} element={<AdminReservationDetailPlaceholder />} />
              <Route path={adminRoutes.calendar} element={<AdminCalendarPlaceholder />} />
            </Route>
          </Route>

          {/* Reservation action behavior remains a Reservation UX/domain dependency. The focused layout boundary is canonical now. */}
          <Route path={routes.reservation} element={<ReservationFlowLayout />}>
            <Route index element={<CanonicalRoutePlaceholder />} />
          </Route>
        </Routes>

        {isOpenModalAuth && !isLoggedIn ? (
          <Modal closeModal={() => setIsOpenModalAuth(false)}>
            <ModalRegister handleCloseModal={() => setIsOpenModalAuth(false)} />
          </Modal>
        ) : null}
      </ModalAuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;
