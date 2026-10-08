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


test('expired paid advance warns that the slot is released instead of promising confirmation', () => {
  render(<ReceiptPaymentInformation receipt={{ ...receipt, expiresAt: '2020-01-01T00:00:00Z', payment: { ...payment, advanceBalance: 0, paymentInstructions: null } }} />);
  expect(screen.getByRole('status')).toHaveTextContent('Bez našeho potvrzení již termín není blokovaný');
  expect(screen.queryByText(/Rezervace čeká na ruční potvrzení/)).not.toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test('QR disappears when the deadline passes while the page stays open', async () => {
  jest.useFakeTimers();
  try {
    const { act } = require('@testing-library/react');
    render(<ReceiptPaymentInformation receipt={{ ...receipt, payment, expiresAt: new Date(Date.now() + 1000).toISOString() }} />);
    await act(async () => {});
    expect(screen.getByRole('img', { name: /QR platba/ })).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(1001); });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Lhůta předběžné rezervace uplynula');
  } finally { jest.useRealTimers(); }
});
