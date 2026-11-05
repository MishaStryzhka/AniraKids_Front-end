import QRCode from 'qrcode';
import {act,fireEvent,render,screen,waitFor} from '@testing-library/react';
import RevolutCheckout from '@revolut/checkout';
import {RevolutPayment} from './RevolutPayment';
import {ReceiptPaymentInformation} from './PaymentInformation';
import * as api from '../api/publicApi';
import {receipt,receiptPaymentFixture as payment} from '../booking/bookingFixtures';
const destroy=jest.fn();
jest.mock('@revolut/checkout',()=>({__esModule:true,default:{embeddedCheckout:jest.fn()}}));
jest.mock('../api/publicApi',()=>({...jest.requireActual('../api/publicApi'),getRevolutConfig:jest.fn(),createRevolutOrder:jest.fn(),syncRevolutPayment:jest.fn()}));
jest.mock('qrcode',()=>({__esModule:true,default:{toDataURL:jest.fn().mockResolvedValue('data:image/png;base64,test')}}));
const config={mode:'sandbox' as const,publicKey:'pk_fixture'};
const access={kind:'guest' as const,token:'a'.repeat(43)};
const activeReceipt={...receipt,expiresAt:'2099-01-01T00:00:00Z',payment:{...payment,cardPayment:{active:true,reviewRequired:false,kind:'advance' as const}}};
beforeEach(()=>{
 jest.clearAllMocks();sessionStorage.clear();
 (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,test');
 (api.getRevolutConfig as jest.Mock).mockResolvedValue(config);
 (api.createRevolutOrder as jest.Mock).mockResolvedValue({publicId:'public-fixture'});
 (api.syncRevolutPayment as jest.Mock).mockResolvedValue(activeReceipt);
 (RevolutCheckout.embeddedCheckout as unknown as jest.Mock).mockResolvedValue({destroy});
});
test('prepares once, supplies no guest credential to provider and destroys widget',async()=>{
 const view=render(<RevolutPayment number={receipt.reservationNumber} access={access} kind="advance" config={config} canPay onReceipt={jest.fn()} onClose={jest.fn()}/>);
 await waitFor(()=>expect(RevolutCheckout.embeddedCheckout).toHaveBeenCalledTimes(1));
 const options=(RevolutCheckout.embeddedCheckout as unknown as jest.Mock).mock.calls[0][0];
 expect(await options.createOrder()).toEqual({publicId:'public-fixture'});
 expect(await options.createOrder()).toEqual({publicId:'public-fixture'});
 expect(api.createRevolutOrder).toHaveBeenCalledTimes(1);
 expect(JSON.stringify({...options,target:undefined})).not.toContain(access.token);
 expect(options.revolutPayOptions.mobileRedirectUrls.success).toContain('paymentReservation='+receipt.reservationNumber);
 view.unmount();expect(destroy).toHaveBeenCalledTimes(1);
});
test('SDK success only requests server verification; pending never closes as paid',async()=>{
 const onReceipt=jest.fn(),onClose=jest.fn();
 render(<RevolutPayment number={receipt.reservationNumber} access={access} kind="advance" config={config} canPay onReceipt={onReceipt} onClose={onClose}/>);
 await waitFor(()=>expect(RevolutCheckout.embeddedCheckout).toHaveBeenCalled());
 const options=(RevolutCheckout.embeddedCheckout as unknown as jest.Mock).mock.calls[0][0];
 await act(async()=>{options.onSuccess({orderId:'untrusted-public-token'});});
 expect(api.syncRevolutPayment).toHaveBeenCalledWith(receipt.reservationNumber,access,false);
 expect(onReceipt).toHaveBeenCalledWith(activeReceipt);expect(onClose).not.toHaveBeenCalled();
 expect(screen.getByText(/Platba zatím není dokončena/)).toBeInTheDocument();
});
test('failed cancellation cannot unlock alternative payments',async()=>{
 (api.syncRevolutPayment as jest.Mock).mockRejectedValue(new Error('network'));
 const onClose=jest.fn();
 render(<RevolutPayment number={receipt.reservationNumber} access={access} kind="advance" config={null} canPay={false} onReceipt={jest.fn()} onClose={onClose}/>);
 fireEvent.click(screen.getByRole('button',{name:/Zrušit rozpracovanou/}));
 await screen.findByText(/Stav platby se nepodařilo/);expect(onClose).not.toHaveBeenCalled();
 expect(api.createRevolutOrder).not.toHaveBeenCalled();
});
test('active card hides QR/report and keeps cancellation available after expiry',async()=>{
 render(<ReceiptPaymentInformation receipt={{...activeReceipt,expiresAt:'2020-01-01T00:00:00Z'}} access={access}/>);
 await screen.findByRole('button',{name:/Zrušit rozpracovanou/});
 expect(screen.queryByRole('img',{name:/QR platba/})).not.toBeInTheDocument();
 expect(screen.queryByRole('button',{name:'Platbu jsem odeslal/a'})).not.toBeInTheDocument();
 expect(api.createRevolutOrder).not.toHaveBeenCalled();
});
test('disabled gateway retains QR and never offers online payment',async()=>{
 (api.getRevolutConfig as jest.Mock).mockResolvedValue(null);
 render(<ReceiptPaymentInformation receipt={{...receipt,expiresAt:'2099-01-01T00:00:00Z',payment}} access={access}/>);
 await screen.findByRole('img',{name:/QR platba/});
 expect(screen.queryByRole('button',{name:/Zaplatit online/})).not.toBeInTheDocument();
});

test('webhook refresh after paid advance closes checkout and requires explicit consent for balance',async()=>{
 const initial={...receipt,expiresAt:'2099-01-01T00:00:00Z',payment:{...payment,fullPaymentInstructions:{...payment.paymentInstructions,amount:1500}}};
 const view=render(<ReceiptPaymentInformation receipt={initial} access={access}/>);
 fireEvent.click(await screen.findByRole('button',{name:/Zaplatit online/}));
 await waitFor(()=>expect(api.createRevolutOrder).toHaveBeenCalledTimes(1));
 // The SDK returns before capture; the later receipt refresh observes the webhook.
 view.rerender(<ReceiptPaymentInformation receipt={{...initial,payment:{...initial.payment,cardPayment:{active:true,reviewRequired:false,kind:'advance'}}}} access={access}/>);
 view.rerender(<ReceiptPaymentInformation receipt={{...initial,status:'confirmed',expiresAt:null,payment:{...initial.payment,advanceBalance:0,rentalBalance:300,paymentInstructions:null,fullPaymentInstructions:{...payment.paymentInstructions,amount:1300},cardPayment:{active:false,reviewRequired:false,kind:null}}}} access={access}/>);
 await waitFor(()=>expect(screen.queryByRole('button',{name:'Ověřit platbu'})).not.toBeInTheDocument());
 expect(api.createRevolutOrder).toHaveBeenCalledTimes(1);
 fireEvent.click(screen.getByRole('button',{name:/Zaplatit online/}));
 await waitFor(()=>expect(api.createRevolutOrder).toHaveBeenCalledTimes(2));
 expect((api.createRevolutOrder as jest.Mock).mock.calls[1][2]).toBe('full');
});
