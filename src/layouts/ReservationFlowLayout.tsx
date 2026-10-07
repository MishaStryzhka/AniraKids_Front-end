import { Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useBookingOptional } from '../storefront/booking/BookingProvider';
import { productPath, routes } from '../navigation/routes';
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
  const back =
    onBack ??
    (() =>
      navigate(
        booking?.draft ? productPath(booking.draft.product.slug) : routes.rental
      ));
  const exit = onExit ?? (() => navigate(routes.rental));
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
