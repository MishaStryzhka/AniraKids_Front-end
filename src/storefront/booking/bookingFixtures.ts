import type {
  Availability,
  PublicProduct,
  Receipt,
  ReservationBody,
} from '../api/publicApi';
export const product: PublicProduct = {
  id: '111111111111111111111111',
  slug: 'sofia',
  name: 'Sofia',
  category: 'dress',
  color: 'Bílá',
  description: 'Slavnostní šaty.',
  photos: [],
  variants: [
    {
      id: '222222222222222222222222',
      size: '98',
      pricing: {
        studio: { rentalPrice: 500, deposit: 1000, totalDue: 1500 },
        external: { rentalPrice: 800, deposit: 1000, totalDue: 1800 },
      },
    },
    {
      id: '333333333333333333333333',
      size: '104',
      pricing: {
        studio: null,
        external: { rentalPrice: 900, deposit: 1200, totalDue: 2100 },
      },
    },
  ],
};
export const body: ReservationBody = {
  productId: product.id,
  variantId: product.variants[0].id,
  rentalMode: 'studio',
  startDate: '2030-10-10',
  endDate: '2030-10-11',
  customer: {
    firstName: 'Jana',
    lastName: 'Nováková',
    email: 'jana@example.test',
    phone: '+420777123456',
  },
  notes: 'Prosím připravit.',
};
export const quote: Availability = {
  productId: body.productId,
  variantId: body.variantId,
  rentalMode: body.rentalMode,
  startDate: body.startDate,
  endDate: body.endDate,
  available: true,
  checkedAt: '2030-10-07T12:00:00Z',
  pricing: { rentalPrice: 500, deposit: 1000, totalDue: 1500 },
};
export const receipt: Receipt = {
  reservationNumber: 'AK-2030-001',
  status: 'pending',
  rentalMode: body.rentalMode,
  startDate: body.startDate,
  endDate: body.endDate,
  expiresAt: '2030-10-07T13:00:00Z',
  item: {
    productId: body.productId,
    variantId: body.variantId,
    productName: product.name,
    size: '98',
    rentalPrice: 500,
    deposit: 1000,
  },
  subtotal: 500,
  deposit: 1000,
  totalDue: 1500,
  paymentStatus: 'unpaid',
};
export function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (value: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
export const bookingPolicyFixture = {
  policyVersion: 1 as const,
  advanceAmount: 200,
  currency: 'CZK' as const,
  confirmation: 'manual_after_payment' as const,
  paymentMethod: 'bank_transfer' as const,
  company: {
    name: 'GlamGarb Rentals s.r.o.',
    ico: '19970561',
    address: 'Bílkova 855/19, Staré Město, 110 00 Praha 1',
    register: 'Městský soud v Praze, oddíl C, vložka 394851',
    vatPayer: false as const,
  },
  bank: {
    iban: 'CZ0708000000006644781399',
    accountNumber: '6644781399/0800',
    bic: 'GIBACZPX',
    beneficiary: 'GlamGarb Rentals s.r.o.',
  },
  cancellation: { feeAmount: 200, automatic: false as const },
};
export const receiptPaymentFixture = {
  advanceRequired: 200,
  advanceBalance: 200,
  rentalBalance: 500,
  depositRequired: 1000,
  depositHeld: 0,
  paymentInstructions: {
    ...bookingPolicyFixture.bank,
    amount: 200,
    currency: 'CZK' as const,
    message: receipt.reservationNumber,
    qrPayload: `SPD*1.0*ACC:${bookingPolicyFixture.bank.iban}*AM:200.00*CC:CZK*MSG:${receipt.reservationNumber}*PT:IP`,
  },
};
