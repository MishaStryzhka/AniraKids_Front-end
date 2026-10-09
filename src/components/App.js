import AccountPage from '../pages/AccountPage/AccountPage';
import { BookingInformationPage } from '../storefront/payments/BookingInformationPage';
import { lazy, useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { Navigate, Route, Routes } from 'react-router-dom';
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
import { CanonicalRoutePlaceholder } from '../pages/CanonicalRoutePlaceholder/CanonicalRoutePlaceholder';
import { routes } from '../navigation/routes';
import { ModalAuthContext } from '../context/ModalAuthContext';
import Modal from './Modals/Modal';
import ModalRegister from './Modals/ModalRegister/ModalRegister';
import { AdminAccessBoundary } from '../admin/auth/AdminAccessBoundary';
import { AdminLayout } from '../admin/layout/AdminLayout';
import { adminRoutes } from '../admin/navigation/adminRoutes';
import { AdminReservationsPage } from '../admin/reservations/AdminReservationsPage';
import { AdminReservationDetailPage } from '../admin/reservations/AdminReservationDetailPage';
import { AdminReservationCalendarPage } from '../admin/calendar/AdminReservationCalendarPage';
import { AdminProductsPage } from '../admin/products/AdminProductsPage';
import { AdminProductCorePage } from '../admin/products/AdminProductCorePage';
import { AdminHomePage } from '../admin/pages/AdminPlaceholders';

import { BookingProvider } from '../storefront/booking/BookingProvider';
import { CataloguePage } from '../storefront/CataloguePage';
import { ProductDetailPage } from '../storefront/ProductDetailPage';
import { BookingPage } from '../storefront/booking/BookingPage';
import { BookingStatusPage } from '../storefront/booking/BookingStatusPage';

const AboutUsPage = lazy(() => import('../pages/AboutUsPage/AboutUsPage'));
const MainPage = lazy(() => import('../pages/MainPage/MainPage'));
const UserPage = lazy(() => import('../pages/UserPage/UserPage'));
const ConfirmEmailPage = lazy(
  () => import('../pages/ConfirmEmailPage/ConfirmEmailPage')
);
const NotFoundPage = lazy(() => import('../pages/NotFoundPage/NotFoundPage'));
const Chat = lazy(() => import('../pages/UserPage/Pages/Chat/Chat'));
const Favorite = lazy(
  () => import('../pages/UserPage/Pages/Favorite/Favorite')
);
const RentOut = lazy(() => import('../pages/UserPage/Pages/RentOut/RentOut'));
const UpdateProduct = lazy(
  () =>
    import('../pages/UserPage/Pages/RentOut/Pages/UpdateProduct/UpdateProduct')
);
const RentIn = lazy(() => import('../pages/UserPage/Pages/RentIn/RentIn'));
const MyOrders = lazy(
  () => import('../pages/UserPage/Pages/MyOrders/MyOrders')
);
const MyPurchases = lazy(
  () => import('../pages/UserPage/Pages/MyPurchases/MyPurchases')
);
const ViewOrder = lazy(
  () => import('../pages/UserPage/Pages/MyOrders/Pages/ViewOrder/ViewOrder')
);
const ViewPurchase = lazy(
  () =>
    import(
      '../pages/UserPage/Pages/MyPurchases/Pages/ViewPurchase/ViewPurchase'
    )
);
const Wallet = lazy(() => import('../pages/UserPage/Pages/Wallet/Wallet'));
const Cart = lazy(() => import('../pages/UserPage/Pages/Cart/Cart'));
const ProductPage = lazy(() => import('../pages/ProductPage/ProductPage'));

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
      <ModalAuthContext.Provider
        value={{ isOpenModalAuth, setIsOpenModalAuth }}
      >
        <BookingProvider>
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

              {/* Canonical storefront routes. */}
              <Route path={routes.dresses} element={<CataloguePage />} />
              <Route path={routes.suits} element={<CataloguePage />} />
              <Route path={routes.newArrivals} element={<CataloguePage />} />
              <Route path={routes.rental} element={<CataloguePage />} />
              <Route path={routes.search} element={<CataloguePage />} />
              <Route
                path={routes.favourites}
                element={<CanonicalRoutePlaceholder />}
              />
              <Route
                path={routes.account}
                element={<AccountPage />}
              />
              <Route
                path={routes.accountReservations}
                element={<CanonicalRoutePlaceholder />}
              />
              <Route
                path={routes.faq}
                element={<CanonicalRoutePlaceholder />}
              />
              <Route
                path={routes.rentalTerms}
                element={<BookingInformationPage />}
              />
              <Route
                path={routes.contact}
                element={<CanonicalRoutePlaceholder />}
              />
              <Route path={routes.terms} element={<BookingInformationPage />} />
              <Route path={routes.privacy} element={<PrivacyPolicyPage />} />
              <Route
                path={routes.cookies}
                element={<CanonicalRoutePlaceholder />}
              />
              <Route
                path={routes.productPattern}
                element={<ProductDetailPage />}
              />

              {/* Legacy pages remain reachable during the controlled migration. */}
              {/* One catalogue and API for canonical and historical category links. */}
              <Route path="/popular" element={<CataloguePage />} />
              <Route path="/forMen/*" element={<CataloguePage />} />
              <Route path="/forWomen/*" element={<CataloguePage />} />
              <Route path="/forChildren/*" element={<CataloguePage />} />
              <Route path="/decorAndToys/*" element={<CataloguePage />} />
              <Route path="/aboutUs" element={<AboutUsPage />} />
              <Route path="/confirmEmail" element={<ConfirmEmailPage />} />
              <Route
                path="/refreshPassword"
                element={<RefreshPasswordPage />}
              />
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
                <Route index element={<Navigate to={routes.account} replace />} />
                <Route path="profile/" element={<Navigate to={routes.account} replace />} />
                <Route path="chat/" element={<Chat />} />
                <Route path="favorite/" element={<Favorite />}>
                  <Route path=":id" element={<ProductPage />} />
                </Route>
                <Route path="rent-out/" element={<RentOut />}>
                  <Route path=":id" element={<ProductPage />} />
                </Route>
                <Route path="rent-out/add-product/" element={<AddProduct />} />
                <Route
                  path="rent-out/update-product/:id"
                  element={<UpdateProduct />}
                />
                <Route path="rent-in/" element={<RentIn />} />
                <Route path="my-orders/" element={<MyOrders />} />
                <Route path="my-orders/order/:id" element={<ViewOrder />} />
                <Route path="my-purchases/" element={<MyPurchases />} />
                <Route
                  path="my-purchases/purchase/:id"
                  element={<ViewPurchase />}
                />
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
                <Route
                  path={adminRoutes.products}
                  element={<AdminProductsPage />}
                />
                <Route
                  path={adminRoutes.productNew}
                  element={<AdminProductCorePage mode="create" />}
                />
                <Route
                  path={adminRoutes.productDetail}
                  element={<AdminProductCorePage mode="edit" />}
                />
                <Route
                  path={adminRoutes.reservations}
                  element={<AdminReservationsPage />}
                />
                <Route
                  path={adminRoutes.reservationDetail}
                  element={<AdminReservationDetailPage />}
                />
                <Route
                  path={adminRoutes.calendar}
                  element={<AdminReservationCalendarPage />}
                />
              </Route>
            </Route>

            <Route path={routes.reservationStatus} element={<ReservationFlowLayout />}>
              <Route index element={<BookingStatusPage />} />
            </Route>
            {/* Focused customer reservation flow. */}
            <Route
              path={routes.reservation}
              element={<ReservationFlowLayout />}
            >
              <Route index element={<BookingPage />} />
            </Route>
          </Routes>
        </BookingProvider>

        {isOpenModalAuth && !isLoggedIn ? (
          <Modal
            authModal
            prohibitClosingByBackdrop
            closeModal={() => setIsOpenModalAuth(false)}
          >
            <ModalRegister handleCloseModal={() => setIsOpenModalAuth(false)} />
          </Modal>
        ) : null}
      </ModalAuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;
