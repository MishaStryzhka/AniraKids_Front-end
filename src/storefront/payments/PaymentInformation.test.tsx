import { render, screen, waitFor } from '@testing-library/react';
import QRCode from 'qrcode';
import {
  BookingPaymentExplanation,
  ReceiptPaymentInformation,
} from './PaymentInformation';
import {
  bookingPolicyFixture as policy,
  receipt,
  receiptPaymentFixture as payment,
} from '../booking/bookingFixtures';
jest.mock('qrcode', () => ({
  __esModule: true,
  default: {
    toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,fixture'),
  },
}));
test('advance is included in rental and capped for lower/free rentals', () => {
  const view = render(
    <BookingPaymentExplanation policy={policy} rentalPrice={100} />
  );
  expect(screen.getByText(/Rezervační záloha činí 100/)).toBeInTheDocument();
  expect(screen.getByText(/zbývá z nájemného 0/)).toBeInTheDocument();
  view.rerender(<BookingPaymentExplanation policy={policy} rentalPrice={0} />);
  expect(screen.getByText(/Rezervační záloha činí 0/)).toBeInTheDocument();
});
test('QR is local and matches validated server payload; no QR after paid/expired', async () => {
  const view = render(
    <ReceiptPaymentInformation
      receipt={{ ...receipt, payment, expiresAt: '2099-01-01T00:00:00Z' }}
    />
  );
  await screen.findByRole('img', { name: /QR platba/ });
  expect(QRCode.toDataURL).toHaveBeenCalledWith(
    payment.paymentInstructions.qrPayload,
    expect.objectContaining({ margin: 4 })
  );
  view.rerender(
    <ReceiptPaymentInformation
      receipt={{
        ...receipt,
        payment: { ...payment, advanceBalance: 0, paymentInstructions: null },
      }}
    />
  );
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.getByText(/čeká na ruční potvrzení/)).toBeInTheDocument();
  view.rerender(
    <ReceiptPaymentInformation
      receipt={{ ...receipt, payment, expiresAt: '2020-01-01T00:00:00Z' }}
    />
  );
  await waitFor(() =>
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  );
});

beforeEach(() => {
  (QRCode.toDataURL as jest.Mock).mockResolvedValue(
    'data:image/png;base64,fixture'
  );
});
