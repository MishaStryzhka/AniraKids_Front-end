import { draftItems } from './bookingModel';
import { routes } from '../../navigation/routes';
import { RouteLink } from '../storefrontStyles';
import { useBookingOptional } from './BookingProvider';

export function ResumeReservationLink({ productId, catalogueReturnTo }: {
  productId: string;
  catalogueReturnTo?: string;
}) {
  const booking = useBookingOptional();
  if (!booking?.draft || booking.stored || booking.busy ||
      booking.storageBlocked || booking.accountBlocked ||
      !draftItems(booking.draft).some(item => item.product.id === productId)) return null;
  return <RouteLink to={routes.reservation}
    state={catalogueReturnTo ? { catalogueReturnTo } : undefined}>
    Dokončit rezervaci
  </RouteLink>;
}
