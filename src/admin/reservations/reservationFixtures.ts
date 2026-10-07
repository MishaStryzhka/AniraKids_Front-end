import type {
  ReservationDetail,
  ReservationListItem,
  ReservationListResponse,
} from '../api/reservations';
export const reservationCustomerFixture = {
  firstName: 'Jana',
  lastName: 'Nováková',
  email: 'fixture@example.test',
  phone: '+420 123 456 789',
};
export const reservationListFixture: ReservationListItem = {
  id: 'r1',
  reservationNumber: 'AK-2026-001',
  status: 'pending',
  paymentStatus: 'unpaid',
  rentalMode: 'external',
  startDate: '2026-12-30',
  endDate: '2027-01-02',
  expiresAt: '2026-12-01T12:15:00Z',
  pendingExpired: true,
  customer: reservationCustomerFixture,
  itemCount: 1,
  subtotal: 1200,
  deposit: 500,
  totalDue: 1700,
  createdAt: '2026-12-01T12:00:00Z',
  updatedAt: '2026-12-01T12:00:00Z',
};
export const reservationListResponseFixture: ReservationListResponse = {
  items: [reservationListFixture],
  pagination: { page: 1, limit: 20, total: 1, pages: 1 },
};
export const reservationDetailFixture: ReservationDetail = {
  id: 'r1',
  reservationNumber: 'AK-2026-001',
  status: 'pending',
  paymentStatus: 'unpaid',
  rentalMode: 'external',
  startDate: '2026-12-30',
  endDate: '2027-01-02',
  expiresAt: '2026-12-01T12:15:00Z',
  pendingExpired: true,
  customerSnapshot: reservationCustomerFixture,
  subtotal: 1200,
  deposit: 500,
  totalDue: 1700,
  items: [
    {
      productId: 'p1',
      variantId: 'v1',
      inventoryItemId: 'i1',
      productNameSnapshot: 'Slavnostní šaty Sofia',
      sizeSnapshot: '98',
      rentalPriceSnapshot: 1200,
      depositSnapshot: 500,
      inventoryCurrent: null,
    },
  ],
  notes: 'Zákaznice si přeje vyzvednout před polednem.',
  createdAt: '2026-12-01T12:00:00Z',
  updatedAt: '2026-12-01T12:00:00Z',
};
