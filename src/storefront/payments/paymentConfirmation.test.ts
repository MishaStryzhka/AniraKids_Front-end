import {parsePaymentConfirmation} from './paymentConfirmation';
const invalid = (): never => {throw new Error('invalid payment confirmation');};
const report = {kind:'full',amount:600,reportedAt:'2030-10-20T09:00:00Z',
  status:'pending',pendingRental:600,pendingDeposit:0};
test('keeps pending cash separate from actual cash collection and supports older responses',()=>{
  expect(parsePaymentConfirmation({},invalid)).toEqual({});
  expect(parsePaymentConfirmation({paymentReport:{...report,kind:'cash'},lastPayment:null},invalid))
    .toMatchObject({paymentReport:{kind:'cash',status:'pending'},lastPayment:null});
  expect(parsePaymentConfirmation({paymentReport:{...report,status:'confirmed',pendingRental:0},
    lastPayment:{amount:600,method:'cash',recordedAt:'2030-10-20T10:00:00Z'}},invalid))
    .toMatchObject({paymentReport:{status:'confirmed'},lastPayment:{amount:600,method:'cash'}});
});
test.each([
  {paymentReport:{...report,status:'confirmed'}},
  {paymentReport:{...report,pendingRental:601}},
  {paymentReport:{...report,kind:'paid'}},
  {lastPayment:{amount:600,method:'customer_claim',recordedAt:'2030-10-20T10:00:00Z'}},
])('rejects inconsistent confirmation metadata',value=>{
  expect(()=>parsePaymentConfirmation(value,invalid)).toThrow('invalid payment confirmation');
});
