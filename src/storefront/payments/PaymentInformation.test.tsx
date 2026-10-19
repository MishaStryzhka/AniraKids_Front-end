import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

const fullPayment = (amount: number) => ({
  ...payment.paymentInstructions, amount,
  qrPayload: `SPD*1.0*ACC:${policy.bank.iban}*AM:${amount.toFixed(2)}*CC:CZK*MSG:${receipt.reservationNumber}*PT:IP`,
});
test('customer switches advance to full amount including deposit, then pays remaining by QR or cash', async () => {
  const full = fullPayment(1500);
  const view = render(<ReceiptPaymentInformation receipt={{ ...receipt, payment: {
    ...payment, fullPaymentInstructions: full } }} />);
  const select = screen.getByRole('combobox', { name: 'Jak chcete zaplatit?' });
  expect(select).toHaveValue('advance');
  expect(screen.queryByRole('option', { name: /hotově/ })).not.toBeInTheDocument();
  fireEvent.change(select, { target: { value: 'full' } });
  await waitFor(() => expect(QRCode.toDataURL).toHaveBeenLastCalledWith(full.qrPayload, expect.anything()));
  expect(screen.getByRole('status')).toHaveTextContent('vratnou kauci');
  view.rerender(<ReceiptPaymentInformation receipt={{ ...receipt, status: 'confirmed', expiresAt: null,
    payment: { ...payment, advanceBalance: 0, rentalBalance: 300,
      paymentInstructions: null, fullPaymentInstructions: fullPayment(1300) } }} />);
  await waitFor(() => expect(QRCode.toDataURL).toHaveBeenLastCalledWith(fullPayment(1300).qrPayload, expect.anything()));
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cash' } });
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('hotově při převzetí');
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'full' } });
  await screen.findByRole('img', { name: /QR platba/ });
  view.rerender(<ReceiptPaymentInformation receipt={{ ...receipt, status: 'confirmed',
    payment: { ...payment, advanceBalance: 0, rentalBalance: 0, depositHeld: 1000,
      paymentInstructions: null, fullPaymentInstructions: null } }} />);
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('uhrazeny');
});
test.each(['cancelled', 'rented', 'returned'] as const)('does not show even stale full QR in %s', status => {
  render(<ReceiptPaymentInformation receipt={{ ...receipt, status,
    payment: { ...payment, fullPaymentInstructions: fullPayment(1500) } }} />);
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
test('expired full payment instructions cannot be selected', () => {
  render(<ReceiptPaymentInformation receipt={{ ...receipt, expiresAt: '2020-01-01T00:00:00Z',
    payment: { ...payment, fullPaymentInstructions: fullPayment(1500) } }} />);
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test('studio advance, full QR and cash omit zero deposit copy and preserve 600 minus 200 balance', async () => {
 const studio={...receipt,rentalMode:'studio' as const,subtotal:600,deposit:0,totalDue:600,expiresAt:'2099-01-01T00:00:00Z',payment:{...payment,rentalBalance:600,depositRequired:0,depositHeld:0,fullPaymentInstructions:fullPayment(600)}};
 const view=render(<ReceiptPaymentInformation receipt={studio}/>);
 await screen.findByRole('img');
 expect(view.container.textContent).not.toMatch(/kauce|kauci/);
 expect(screen.getByRole('status').textContent?.replace(/\s/g,' ')).toMatch(/Po úhradě zálohy zbývá 400 Kč/);
 fireEvent.change(screen.getByRole('combobox'),{target:{value:'full'}});
 await waitFor(()=>expect(QRCode.toDataURL).toHaveBeenLastCalledWith(fullPayment(600).qrPayload,expect.anything()));
 expect(view.container.textContent).not.toMatch(/kauce|kauci/);
 view.rerender(<ReceiptPaymentInformation receipt={{...studio,status:'confirmed',payment:{...studio.payment,advanceBalance:0,rentalBalance:400,paymentInstructions:null,fullPaymentInstructions:fullPayment(400)}}}/>);
 fireEvent.change(screen.getByRole('combobox'),{target:{value:'cash'}});
 expect(screen.getByRole('status').textContent?.replace(/\s/g,' ')).toMatch(/Zbývá doplatit 400 Kč hotově/);
 expect(view.container.textContent).not.toMatch(/kauce|kauci/);
});

test('paid fitting covers the reservation advance and leaves only the 600 Kč remainder', async () => {
 const credited={...receipt,subtotal:600,deposit:0,totalDue:600,fittingDiscount:{number:'ZK-ABCDEF123456',amount:200},expiresAt:'2099-01-01T00:00:00Z',payment:{...payment,advanceBalance:0,paymentInstructions:null,rentalBalance:600,depositRequired:0,depositHeld:0,fullPaymentInstructions:fullPayment(600)}};
 const view=render(<ReceiptPaymentInformation receipt={credited}/>);
 const row=(label:string)=>screen.getByText(label,{exact:true}).closest('div');
 expect(row('Cena pronájmu')).toHaveTextContent('800 Kč');
 expect(row('Započtená platba za zkoušku ZK-ABCDEF123456')).toHaveTextContent('−200 Kč');
 expect(row('Zbývá uhradit nájemné')).toHaveTextContent('600 Kč');
 expect(row('Rezervační záloha (součást nájemného)')).toHaveTextContent('200 Kč · uhrazeno');
 expect(screen.queryByText('Nájemné po slevě')).not.toBeInTheDocument();
 expect(screen.queryByText('Zbývá uhradit ze zálohy')).not.toBeInTheDocument();
 expect(screen.queryByRole('option',{name:/Povinná záloha/})).not.toBeInTheDocument();
 await waitFor(()=>expect(QRCode.toDataURL).toHaveBeenLastCalledWith(fullPayment(600).qrPayload,expect.anything()));
 expect(screen.getByRole('status')).toHaveTextContent('zbývající nájemné 600 Kč');
 fireEvent.change(screen.getByRole('combobox'),{target:{value:'cash'}});
 expect(screen.getByRole('status')).toHaveTextContent('Zbývá doplatit 600 Kč hotově');
 // A separately recorded 200 Kč payment reduces the remainder only once.
 view.rerender(<ReceiptPaymentInformation receipt={{...credited,status:'confirmed',payment:{...credited.payment,rentalBalance:400,fullPaymentInstructions:fullPayment(400)}}}/>);
 expect(row('Zbývá uhradit nájemné')).toHaveTextContent('400 Kč');
 await waitFor(()=>expect(QRCode.toDataURL).toHaveBeenLastCalledWith(fullPayment(400).qrPayload,expect.anything()));
});

test('checkout explains the credited fitting without requesting another advance',()=>{
 render(<BookingPaymentExplanation policy={policy} rentalPrice={600} hasDeposit={false} fittingCredit={200}/>);
 expect(screen.getByText(/Zálohu znovu neplatíte/)).toBeInTheDocument();
 expect(screen.getByText(/Po započtení zkoušky zbývá doplatit/)).toHaveTextContent('600 Kč');
 expect(screen.queryByText(/Po uhrazení zálohy zbývá/)).not.toBeInTheDocument();
});

test('undiscounted receipts do not invent a fitting credit and partial advances remain explicit',()=>{
 render(<ReceiptPaymentInformation receipt={{...receipt,payment:{...payment,advanceBalance:100,rentalBalance:400,paymentInstructions:null}}}/>);
 expect(screen.getByText('Cena pronájmu').closest('div')).toHaveTextContent('500 Kč');
 expect(screen.queryByText(/Započtená platba za zkoušku/)).not.toBeInTheDocument();
 expect(screen.getByText('Zbývá uhradit ze zálohy').closest('div')).toHaveTextContent('100 Kč');
 expect(screen.getByText('Zbývá uhradit nájemné').closest('div')).toHaveTextContent('400 Kč');
});

test.each([0,2000])('deposit label follows confirmed receipt, held %s',async(depositHeld)=>{
 render(<ReceiptPaymentInformation receipt={{...receipt,expiresAt:'2099-01-01T00:00:00Z',payment:{...payment,depositRequired:2000,depositHeld}}}/>);
 expect(Boolean(screen.queryByText('Požadovaná vratná kauce'))).toBe(depositHeld===0);
 expect(Boolean(screen.queryByText('Přijatá vratná kauce'))).toBe(depositHeld===2000);
 expect(screen.queryByText('Držená vratná kauce')).not.toBeInTheDocument();
 await waitFor(()=>expect(QRCode.toDataURL).toHaveBeenCalled());
});
