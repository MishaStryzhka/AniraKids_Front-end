import { object, money, string, PublicApiError } from './publicValidation';
export type BookingPolicy = {
  policyVersion: 1;
  advanceAmount: number;
  currency: 'CZK';
  confirmation: 'manual_after_payment';
  paymentMethod: 'bank_transfer';
  company: {
    name: string;
    ico: string;
    address: string;
    register: string;
    vatPayer: false;
  };
  bank: {
    iban: string;
    accountNumber: string;
    bic: string;
    beneficiary: string;
  } | null;
  cancellation: { feeAmount: number; automatic: false };
};
export type PaymentInstructions = NonNullable<BookingPolicy['bank']> & {
  amount: number;
  currency: 'CZK';
  message: string;
  qrPayload: string;
};
export type ReceiptPayment = {
  advanceRequired: number;
  advanceBalance: number;
  rentalBalance: number;
  depositRequired: number;
  depositHeld: number;
  paymentInstructions: PaymentInstructions | null;
};
const invalid = (): never => {
  throw new PublicApiError('INVALID_RESPONSE');
};
export function validCzechIban(value: unknown): value is string {
  if (typeof value !== 'string' || !/^CZ\d{22}$/.test(value)) return false;
  const numeric = (value.slice(4) + value.slice(0, 4)).replace(/[A-Z]/g, c =>
    String(c.charCodeAt(0) - 55)
  );
  let remainder = 0;
  for (const digit of numeric)
    remainder = (remainder * 10 + Number(digit)) % 97;
  return remainder === 1;
}
function bank(value: unknown): NonNullable<BookingPolicy['bank']> {
  if (
    !object(value) ||
    !validCzechIban(value.iban) ||
    !string(value.accountNumber, 40) ||
    !string(value.bic, 11) ||
    !string(value.beneficiary, 200)
  )
    return invalid();
  const match = /^(?:(\d{1,6})-)?(\d{1,10})\/(\d{4})$/.exec(
    value.accountNumber
  );
  if (
    !match ||
    match[3] !== value.iban.slice(4, 8) ||
    (match[1] ?? '').padStart(6, '0') !== value.iban.slice(8, 14) ||
    match[2].padStart(10, '0') !== value.iban.slice(14)
  )
    return invalid();
  return {
    iban: value.iban,
    accountNumber: value.accountNumber,
    bic: value.bic,
    beneficiary: value.beneficiary,
  };
}
export function parseBookingPolicy(value: unknown): BookingPolicy {
  if (
    !object(value) ||
    value.policyVersion !== 1 ||
    !money(value.advanceAmount) ||
    value.advanceAmount > 1000000 ||
    value.currency !== 'CZK' ||
    value.confirmation !== 'manual_after_payment' ||
    value.paymentMethod !== 'bank_transfer' ||
    !object(value.company) ||
    !['name', 'ico', 'address', 'register'].every(key =>
      string(
        value.company && (value.company as Record<string, unknown>)[key],
        500
      )
    ) ||
    value.company.vatPayer !== false ||
    !object(value.cancellation) ||
    !money(value.cancellation.feeAmount) ||
    value.cancellation.automatic !== false
  )
    return invalid();
  return {
    policyVersion: 1,
    advanceAmount: value.advanceAmount,
    currency: 'CZK',
    confirmation: 'manual_after_payment',
    paymentMethod: 'bank_transfer',
    company: {
      name: value.company.name as string,
      ico: value.company.ico as string,
      address: value.company.address as string,
      register: value.company.register as string,
      vatPayer: false,
    },
    bank: value.bank === null ? null : bank(value.bank),
    cancellation: { feeAmount: value.cancellation.feeAmount, automatic: false },
  };
}
export function parseReceiptPayment(
  value: unknown,
  receipt: {
    reservationNumber: string;
    subtotal: number;
    deposit: number;
    status: string;
    expiresAt: string | null;
  }
): ReceiptPayment {
  if (
    !object(value) ||
    ![
      'advanceRequired',
      'advanceBalance',
      'rentalBalance',
      'depositRequired',
      'depositHeld',
    ].every(key => money(value[key]))
  )
    return invalid();
  const p = value as Record<string, number>;
  if (
    p.advanceRequired > receipt.subtotal ||
    p.advanceBalance > p.advanceRequired ||
    p.rentalBalance > receipt.subtotal ||
    p.depositRequired !== receipt.deposit ||
    p.depositHeld > p.depositRequired
  )
    return invalid();
  let instructions: PaymentInstructions | null = null;
  if (value.paymentInstructions !== null) {
    const i = value.paymentInstructions;
    if (
      !object(i) ||
      !money(i.amount) ||
      i.amount <= 0 ||
      i.amount !== p.advanceBalance ||
      i.currency !== 'CZK' ||
      i.message !== receipt.reservationNumber ||
      receipt.status !== 'pending' ||
      !receipt.expiresAt
    )
      return invalid();
    const details = bank(i);
    const expected = `SPD*1.0*ACC:${details.iban}*AM:${i.amount.toFixed(2)}*CC:CZK*MSG:${i.message}*PT:IP`;
    if (i.qrPayload !== expected) return invalid();
    instructions = {
      ...details,
      amount: i.amount,
      currency: 'CZK',
      message: i.message as string,
      qrPayload: expected,
    };
  }
  return {
    advanceRequired: p.advanceRequired,
    advanceBalance: p.advanceBalance,
    rentalBalance: p.rentalBalance,
    depositRequired: p.depositRequired,
    depositHeld: p.depositHeld,
    paymentInstructions: instructions,
  };
}
