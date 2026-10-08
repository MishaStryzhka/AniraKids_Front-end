import type {
  PaymentOperation,
  ReservationPayments,
} from '../api/reservationPayments';
export const paymentOperationFixture: PaymentOperation = {
  operationId: '11111111-1111-4111-8111-111111111111',
  expectedRevision: 0,
  type: 'advance_received',
  amount: 200,
  method: 'bank_transfer',
};
export const paymentLedgerFixture: ReservationPayments = {
  reservationId: 'r1',
  revision: 0,
  currency: 'CZK',
  legacyUnreconciled: false,
  advanceRequired: 200,
  rentalTotal: 500,
  depositRequired: 2000,
  rentalReceived: 0,
  rentalRefunded: 0,
  rentalNet: 0,
  depositReceived: 0,
  depositRefunded: 0,
  depositHeld: 0,
  cancellationFee: 0,
  rentalBalance: 500,
  advanceBalance: 200,
  refundableRental: 0,
  entries: [],
};
export const recordedPaymentFixture: ReservationPayments = {
  ...paymentLedgerFixture,
  revision: 1,
  rentalReceived: 200,
  rentalNet: 200,
  rentalBalance: 300,
  advanceBalance: 0,
  refundableRental: 200,
  entries: [
    {
      operationId: paymentOperationFixture.operationId,
      type: paymentOperationFixture.type,
      amount: 200,
      method: 'bank_transfer',
      recordedAt: '2026-10-08T12:00:00Z',
      recordedBy: 'admin1',
    },
  ],
};
