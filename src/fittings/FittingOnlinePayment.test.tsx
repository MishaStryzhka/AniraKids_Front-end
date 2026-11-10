import {act,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {FittingOnlinePayment} from './FittingOnlinePayment';
import {FittingAccountClaim} from './FittingAccountClaim';
import {fittingApi,type Fitting} from './fittingApi';
import {getRevolutConfig} from '../storefront/api/publicApi';
import RevolutCheckout from '@revolut/checkout';
jest.mock('./fittingApi',()=>({fittingApi:jest.fn()}));
jest.mock('../storefront/api/publicApi',()=>({getRevolutConfig:jest.fn()}));
jest.mock('../hooks/useAuth',()=>({useAuth:()=>({token:'account-token',isLoggedIn:true,isRefreshing:false})}));
jest.mock('@revolut/checkout',()=>({__esModule:true,default:{embeddedCheckout:jest.fn()}}));
const data={number:'ZK-123456789ABC',status:'pending',paymentStatus:'unpaid',expiresAt:'2099-01-01',paymentOptions:{gateway:'revolut',qrEnabled:false,defaultMethod:'online'},cardPayment:{active:false,reviewRequired:false}} as Fitting;
const privateToken='a'.repeat(64);
beforeEach(()=>{jest.clearAllMocks();sessionStorage.clear();(getRevolutConfig as jest.Mock).mockResolvedValue({mode:'sandbox',publicKey:'pk_fixture'});(RevolutCheckout.embeddedCheckout as unknown as jest.Mock).mockResolvedValue({destroy:jest.fn()});(fittingApi as jest.Mock).mockResolvedValue({publicId:'fixture'});});
test('online fitting opens checkout immediately and never sends private access to the provider',async()=>{
 render(<FittingOnlinePayment data={data} endpoint={'/fittings/'+data.number} token={privateToken} onUpdate={jest.fn()} onMethod={jest.fn()}/>);
 expect(screen.queryByRole('button',{name:'Zaplatit online – 200 Kč'})).not.toBeInTheDocument();
 expect(screen.queryByLabelText('Způsob platby')).not.toBeInTheDocument();
 await waitFor(()=>expect(RevolutCheckout.embeddedCheckout).toHaveBeenCalledTimes(1));
 expect(screen.queryByRole('button',{name:'Ověřit platbu'})).not.toBeInTheDocument();
 expect(screen.getByRole('heading')).toHaveTextContent('Platba zkoušky 200 Kč');
 const options=(RevolutCheckout.embeddedCheckout as unknown as jest.Mock).mock.calls[0][0];
 expect(JSON.stringify({...options,target:null})).not.toContain(privateToken);
 expect(sessionStorage.getItem('anirakids.fitting-return.'+data.number)).toBe(privateToken);
 expect(fittingApi).toHaveBeenCalledWith('/fittings/'+data.number+'/revolut/create',expect.objectContaining({token:privateToken,method:'POST'}));
 (fittingApi as jest.Mock).mockResolvedValue({...data,status:'confirmed',cardPayment:{active:false,reviewRequired:false}});
 await act(async()=>options.onSuccess());
 expect(fittingApi).toHaveBeenLastCalledWith('/fittings/'+data.number+'/revolut/sync',expect.objectContaining({method:'POST'}));
});
test('review blocks any new online payment',async()=>{
 render(<FittingOnlinePayment data={{...data,cardPayment:{active:false,reviewRequired:true}}} endpoint="/fittings/fixture" token={privateToken} onUpdate={jest.fn()} onMethod={jest.fn()}/>);
 await act(async()=>{});
 expect(screen.queryByRole('button',{name:/Zaplatit online/})).not.toBeInTheDocument();expect(screen.getByRole('alert')).toHaveTextContent('Další platbu neposílejte');
});
test('already accessible guest fitting hides account claim',async()=>{
 (fittingApi as jest.Mock).mockResolvedValue(data);
 render(<FittingAccountClaim number={data.number} privateToken={privateToken}/>);
 await waitFor(()=>expect(fittingApi).toHaveBeenCalledWith('/account/fittings/'+data.number,expect.objectContaining({token:'account-token'})));
 expect(screen.queryByRole('button',{name:'Připojit k účtu'})).not.toBeInTheDocument();
});
test('private fitting can be claimed only after account read says missing',async()=>{
 (fittingApi as jest.Mock).mockRejectedValueOnce({status:404}).mockResolvedValue(data);
 render(<FittingAccountClaim number={data.number} privateToken={privateToken}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Připojit k účtu'}));
 await waitFor(()=>expect(screen.queryByRole('button',{name:'Připojit k účtu'})).not.toBeInTheDocument());
 expect(fittingApi).toHaveBeenLastCalledWith('/account/fittings/'+data.number+'/claim',expect.objectContaining({method:'POST',body:{token:privateToken}}));
});

test.each(['confirmed','cancelled','expired'])('does not open checkout for %s fitting',async status=>{
 render(<FittingOnlinePayment data={{...data,status} as Fitting} endpoint="/fittings/fixture" token={privateToken} onUpdate={jest.fn()} onMethod={jest.fn()}/>);
 await act(async()=>{});
 expect(fittingApi).not.toHaveBeenCalled();
 expect(RevolutCheckout.embeddedCheckout).not.toHaveBeenCalled();
});
test('QR-only fitting never creates an online payment',async()=>{
 render(<FittingOnlinePayment data={{...data,paymentOptions:{gateway:'off',qrEnabled:true,defaultMethod:'qr'}}} endpoint="/fittings/fixture" token={privateToken} onUpdate={jest.fn()} onMethod={jest.fn()}/>);
 await act(async()=>{});
 expect(fittingApi).not.toHaveBeenCalled();
 expect(RevolutCheckout.embeddedCheckout).not.toHaveBeenCalled();
});

test('pending verification reveals recovery actions without starting another order',async()=>{
 (fittingApi as jest.Mock).mockResolvedValueOnce({publicId:'fixture'}).mockResolvedValue({...data,cardPayment:{active:true,reviewRequired:false}});
 render(<FittingOnlinePayment data={data} endpoint="/fittings/fixture" token={privateToken} onUpdate={jest.fn()} onMethod={jest.fn()}/>);
 await waitFor(()=>expect(RevolutCheckout.embeddedCheckout).toHaveBeenCalledTimes(1));
 const options=(RevolutCheckout.embeddedCheckout as unknown as jest.Mock).mock.calls[0][0];
 await act(async()=>options.onSuccess());
 expect(screen.getByRole('button',{name:'Ověřit platbu'})).toBeEnabled();
 expect(screen.getByRole('button',{name:/Zrušit rozpracovanou/})).toBeEnabled();
 expect(RevolutCheckout.embeddedCheckout).toHaveBeenCalledTimes(1);
});
test('confirmed payment from refresh removes checkout without another payment',async()=>{
 const props={endpoint:'/fittings/fixture',token:privateToken,onUpdate:jest.fn(),onMethod:jest.fn()};
 const view=render(<FittingOnlinePayment {...props} data={data}/>);
 await waitFor(()=>expect(RevolutCheckout.embeddedCheckout).toHaveBeenCalledTimes(1));
 view.rerender(<FittingOnlinePayment {...props} data={{...data,status:'confirmed',paymentStatus:'paid'}}/>);
 expect(screen.queryByText(/Platba zkoušky/)).not.toBeInTheDocument();
 expect(fittingApi).toHaveBeenCalledTimes(1);
});
test('preparation failure offers safe recovery',async()=>{
 (fittingApi as jest.Mock).mockRejectedValue(new Error('network'));
 render(<FittingOnlinePayment data={data} endpoint="/fittings/fixture" token={privateToken} onUpdate={jest.fn()} onMethod={jest.fn()}/>);
 expect(await screen.findByRole('button',{name:'Ověřit platbu'})).toBeEnabled();
 expect(screen.getByText(/Platební formulář se nepodařilo/)).toBeInTheDocument();
});

test.each(['cancelled','expired'] as const)('inactive %s fitting hides stale active payment and review controls',async status=>{
 const view=render(<FittingOnlinePayment data={{...data,status,cardPayment:{active:true,reviewRequired:true}}} endpoint="/fittings/fixture" token={privateToken} onUpdate={jest.fn()} onMethod={jest.fn()}/>);
 await act(async()=>{});
 expect(view.container).toBeEmptyDOMElement();
 expect(getRevolutConfig).not.toHaveBeenCalled();
 expect(fittingApi).not.toHaveBeenCalled();
 expect(RevolutCheckout.embeddedCheckout).not.toHaveBeenCalled();
});
test('cancellation unmounts an already open checkout',async()=>{
 const destroy=jest.fn();(RevolutCheckout.embeddedCheckout as unknown as jest.Mock).mockResolvedValue({destroy});
 const props={endpoint:'/fittings/fixture',token:privateToken,onUpdate:jest.fn(),onMethod:jest.fn()};
 const view=render(<FittingOnlinePayment {...props} data={data}/>);
 await waitFor(()=>expect(RevolutCheckout.embeddedCheckout).toHaveBeenCalledTimes(1));
 view.rerender(<FittingOnlinePayment {...props} data={{...data,status:'cancelled',cardPayment:{active:true,reviewRequired:false}}}/>);
 expect(view.container).toBeEmptyDOMElement();expect(destroy).toHaveBeenCalled();
});
