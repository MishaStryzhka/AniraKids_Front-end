import { Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useBookingOptional } from '../storefront/booking/BookingProvider';
import { productPath } from '../navigation/routes';
import { getCatalogueReturnTo } from '../storefront/catalogueNavigation';
import type { ReservationHelpAction } from '../components/navigation/FocusedReservationHeader/FocusedReservationHeader';
import { FocusedReservationHeader } from '../components/navigation/FocusedReservationHeader/FocusedReservationHeader';

export interface ReservationFlowLayoutProps {
  onBack?(): void;
  onExit?(): void;
  helpAction?: ReservationHelpAction;
}

export function ReservationFlowLayout({
  onBack,
  onExit,
  helpAction,
}: ReservationFlowLayoutProps) {
  const navigate = useNavigate();
  const booking = useBookingOptional();
  const location = useLocation();
  const catalogueReturnTo = getCatalogueReturnTo(location.state, booking?.draft?.product.category);
  const back =
    onBack ??
    (() =>
      navigate(
        booking?.draft ? productPath(booking.draft.product.slug) : catalogueReturnTo,
        { state: { catalogueReturnTo } }
      ));
  const exit = onExit ?? (() => navigate(catalogueReturnTo));
  return (
    <>
      <FocusedReservationHeader
        onBack={back}
        onExit={exit}
        helpAction={helpAction}
      />
      <main>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
