const policy = {
  policyVersion: 1,
  advanceAmount: 200,
  currency: 'CZK',
  confirmation: 'manual_after_payment',
  paymentMethod: 'bank_transfer',
  company: {
    name: 'GlamGarb Rentals s.r.o.',
    ico: '19970561',
    address: 'Bílkova 855/19, Staré Město, 110 00 Praha 1',
    register: 'Městský soud v Praze, oddíl C, vložka 394851',
    vatPayer: false,
  },
  bank: {
    iban: 'CZ0708000000006644781399',
    accountNumber: '6644781399/0800',
    bic: 'GIBACZPX',
    beneficiary: 'GlamGarb Rentals s.r.o.',
  },
  cancellation: { feeAmount: 200, automatic: false },
};
function ledger(id, advance = 0) {
  return {
    reservationId: id,
    revision: 0,
    currency: 'CZK',
    legacyUnreconciled: false,
    advanceRequired: advance,
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
    advanceBalance: advance,
    refundableRental: 0,
    entries: [],
  };
}
function receiptPayment(number, deposit = 1000) {
  return {
    advanceRequired: 200,
    advanceBalance: 200,
    rentalBalance: 500,
    depositRequired: deposit,
    depositHeld: 0,
    paymentInstructions: {
      ...policy.bank,
      amount: 200,
      currency: 'CZK',
      message: number,
      qrPayload: `SPD*1.0*ACC:${policy.bank.iban}*AM:200.00*CC:CZK*MSG:${number}*PT:IP`,
    },
  };
}
module.exports = { policy, ledger, receiptPayment };
