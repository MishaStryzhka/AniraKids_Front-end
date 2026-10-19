import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {ReservationFittingDiscount} from './ReservationFittingDiscount';
import {fittingAdmin} from '../../fittings/fittingApi';
jest.mock('../../fittings/fittingApi',()=>({...jest.requireActual('../../fittings/fittingApi'),fittingAdmin:jest.fn()}));
jest.mock('../api/client',()=>({}));
jest.mock('../api/errors',()=>({}));
const api=fittingAdmin as jest.Mock;
const item={id:'f1',revision:2,number:'ZK-123456ABCDEF',date:'2026-10-10',time:'10:00'};
const options={eligible:true,applied:null,items:[item]};
function props(){return {token:'test-token',reservationId:'r1',reservationNumber:'AK-2026-123456',version:'1',blocked:false,mutationLock:{current:null} as {current:'discount'|null},onBusy:jest.fn(),onSaved:jest.fn(async()=>{}),onAccessError:jest.fn()};}
beforeEach(()=>api.mockReset());
it('selects a fitting and applies the linked discount once while saving',async()=>{
 let resolve!:()=>void;api.mockResolvedValue(options);const p=props();render(<ReservationFittingDiscount {...p}/>);
 expect(await screen.findByLabelText('Zaplacená a dokončená zkouška')).toHaveValue('f1');
 api.mockImplementation((_token,path)=>path.endsWith('/actions')?new Promise<void>(r=>{resolve=r;}):Promise.resolve({eligible:false,items:[],applied:{kind:'discount',number:item.number,amount:200}}));
 fireEvent.click(screen.getByRole('button',{name:'Uplatnit slevu'}));fireEvent.click(screen.getByRole('button',{name:'Ukládání…'}));
 expect(api.mock.calls.filter(x=>x[1].endsWith('/actions'))).toHaveLength(1);
 expect(api).toHaveBeenCalledWith('test-token','/admin/fittings/f1/actions',{action:'credit',revision:2,reservationNumber:'AK-2026-123456'});
 resolve();expect(await screen.findByText(/Uplatněná sleva −200 Kč/)).toBeInTheDocument();expect(p.onSaved).toHaveBeenCalled();expect(p.mutationLock.current).toBeNull();
});
it('has no apply button for an empty list or a historical credit',async()=>{
 api.mockResolvedValue({eligible:true,applied:null,items:[]});const p=props(),view=render(<ReservationFittingDiscount {...p}/>);
 expect(await screen.findByText(/Klient nemá dostupnou/)).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Uplatnit slevu'})).not.toBeInTheDocument();
 api.mockResolvedValue({eligible:false,items:[],applied:{kind:'legacy_credit',number:item.number,amount:200}});view.rerender(<ReservationFittingDiscount {...p} version="2"/>);
 expect(await screen.findByText(/Dřívější započtení platby/)).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Uplatnit slevu'})).not.toBeInTheDocument();
});
it('refreshes after an ambiguous failure and retains the error',async()=>{
 api.mockResolvedValue(options);const p=props();render(<ReservationFittingDiscount {...p}/>);await screen.findByRole('button',{name:'Uplatnit slevu'});
 api.mockImplementation((_token,path)=>path.endsWith('/actions')?Promise.reject({code:'PAYMENT_CONFLICT'}):Promise.resolve(options));fireEvent.click(screen.getByRole('button',{name:'Uplatnit slevu'}));
 await waitFor(()=>expect(p.onSaved).toHaveBeenCalled());expect(await screen.findByRole('alert')).toHaveTextContent('Platby se změnily');expect(p.mutationLock.current).toBeNull();
});
it('blocks applying while another reservation mutation is active',async()=>{
 api.mockResolvedValue(options);const p=props();p.mutationLock.current='discount';render(<ReservationFittingDiscount {...p}/>);fireEvent.click(await screen.findByRole('button',{name:'Uplatnit slevu'}));expect(api.mock.calls.filter(x=>x[1].endsWith('/actions'))).toHaveLength(0);
});
