import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import {FittingPage,FittingStatusPage} from './FittingPage';
import {AccountFittings} from './AccountFittings';
import {fittingApi,FittingApiError} from './fittingApi';
const mockAuth={token:'owner-session',isLoggedIn:true,isRefreshing:false,user:{_id:'owner',firstName:'Jana',lastName:'Nová',email:'jana@example.test',primaryPhoneNumber:'+420123456789'}};
jest.mock('../hooks/useAuth',()=>({useAuth:()=>mockAuth}));
jest.mock('./fittingApi',()=>({...jest.requireActual('./fittingApi'),fittingApi:jest.fn()}));
const api=fittingApi as jest.Mock;
jest.mock('../admin/api/client',()=>({}));
jest.mock('../admin/api/errors',()=>({}));
beforeEach(()=>{sessionStorage.clear();api.mockReset();mockAuth.isLoggedIn=true;mockAuth.isRefreshing=false;mockAuth.token='owner-session';api.mockResolvedValue({enabled:true,slots:['11:00']});});
test('profile prefills editable fields and logout removes profile-derived contacts',async()=>{
 const view=render(<MemoryRouter><FittingPage/></MemoryRouter>);
 expect(await screen.findByLabelText('Jméno a příjmení')).toHaveValue('Jana Nová');
 expect(screen.getByLabelText('E-mail')).toHaveValue('jana@example.test');
 fireEvent.change(screen.getByLabelText('Telefon'),{target:{value:'+420987654321'}});
 expect(screen.getByLabelText('Telefon')).toHaveValue('+420987654321');
 mockAuth.isLoggedIn=false;mockAuth.token='';view.rerender(<MemoryRouter><FittingPage/></MemoryRouter>);
 await waitFor(()=>expect(screen.getByLabelText('E-mail')).toHaveValue(''));
 expect(screen.getByLabelText('Jméno a příjmení')).toHaveValue('');expect(screen.getByLabelText('Telefon')).toHaveValue('');
});
test('refreshing session cannot submit as guest',async()=>{
 mockAuth.isRefreshing=true;
 render(<MemoryRouter><FittingPage/></MemoryRouter>);
 fireEvent.click(await screen.findByRole('button',{name:'11:00'}));
 expect(screen.getByRole('button',{name:'Rezervovat a přejít k platbě 200 Kč'})).toBeDisabled();
 expect(screen.getByLabelText('E-mail')).toHaveValue('');
});
test('stored submission cannot be retried under a different account',async()=>{
 sessionStorage.setItem('anirakids.fitting-attempt.v1',JSON.stringify({token:'a'.repeat(64),operationId:'operation',date:'2030-01-07',email:'guest@example.test',accountId:'other'}));
 render(<MemoryRouter><FittingPage/></MemoryRouter>);
 expect(screen.getByRole('button',{name:'Ověřit a pokračovat'})).toBeDisabled();
 expect(screen.getByRole('alert')).toHaveTextContent('jiné relaci');
 await waitFor(()=>expect(api).toHaveBeenCalled());
 expect(api.mock.calls.every(([,options])=>options.method!=='POST')).toBe(true);
});
test('account list renders a session-protected detail URL and isolates loading failure',async()=>{
 api.mockResolvedValue({items:[{number:'ZK-123456ABCDEF',date:'2030-01-07',time:'11:00',status:'confirmed',paymentStatus:'paid'}],total:1});
 const view=render(<MemoryRouter><AccountFittings token="owner-session"/></MemoryRouter>);
 expect(await screen.findByRole('link',{name:'Platby a podrobnosti zkoušky'})).toHaveAttribute('href','/zkouska/ZK-123456ABCDEF');
 expect(screen.queryByRole('link',{name:'Rezervovat zkoušku'})).not.toBeInTheDocument();
 expect(screen.queryByRole('button',{name:'Obnovit zkoušky'})).not.toBeInTheDocument();
 expect(api).toHaveBeenCalledWith('/account/fittings?page=1',expect.objectContaining({token:'owner-session'}));
 api.mockRejectedValue(new Error('offline'));view.rerender(<MemoryRouter><AccountFittings token="other-session"/></MemoryRouter>);
 expect(screen.queryByText('ZK-123456ABCDEF',{exact:false})).not.toBeInTheDocument();
 expect(await screen.findByRole('alert')).toHaveTextContent('nepodařilo');
});
test('account detail hides cached data immediately on logout',async()=>{
 api.mockResolvedValue({number:'ZK-123456ABCDEF',date:'2030-01-07',time:'11:00',status:'confirmed',paymentStatus:'paid',address:'Private address'});
 const tree=<MemoryRouter initialEntries={['/zkouska/ZK-123456ABCDEF']}><Routes><Route path="/zkouska/:number" element={<FittingStatusPage/>}/></Routes></MemoryRouter>;
 const view=render(tree);expect(await screen.findByText('Adresa: Private address')).toBeInTheDocument();
 mockAuth.isLoggedIn=false;mockAuth.token='';view.rerender(<MemoryRouter initialEntries={['/zkouska/ZK-123456ABCDEF']}><Routes><Route path="/zkouska/:number" element={<FittingStatusPage/>}/></Routes></MemoryRouter>);
 expect(screen.queryByText('Adresa: Private address')).not.toBeInTheDocument();expect(screen.getByRole('link',{name:'Přihlásit se'})).toBeInTheDocument();
});

test.each([true,false])('private link management is only shown to guests: signed in %s',async(signedIn)=>{
 mockAuth.isLoggedIn=signedIn;mockAuth.token=signedIn?'owner-session':'';
 api.mockResolvedValue({number:'ZK-123456ABCDEF',date:'2030-01-07',time:'11:00',status:'confirmed',paymentStatus:'paid',address:'Private address'});
 render(<MemoryRouter initialEntries={['/zkouska/ZK-123456ABCDEF#'+'a'.repeat(64)]}><Routes><Route path="/zkouska/:number" element={<FittingStatusPage/>}/></Routes></MemoryRouter>);
 await screen.findByText('Adresa: Private address');
 expect(Boolean(screen.queryByLabelText('Soukromý odkaz na zkoušku'))).toBe(!signedIn);
 expect(screen.queryByRole('link',{name:'Moje rezervace'})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Zrušit zkoušku',exact:true}));
 expect(screen.getByRole('dialog')).toBeInTheDocument();
});

 test.each([409,503])('submission failure is focused and preserves contacts or retry identity: %s',async(status)=>{
 const request={token:'a'.repeat(64),operationId:'operation',date:'2030-01-07',time:'11:00',name:'Edited Name',email:'edited@example.test',phone:'+420987654321',accountId:'owner'};
 sessionStorage.setItem('anirakids.fitting-attempt.v1',JSON.stringify(request));
 api.mockImplementation((_path,options)=>options?.method==='POST'?Promise.reject(new FittingApiError(status===409?'SLOT_OR_PENDING_CONFLICT':'UNAVAILABLE',status)):Promise.resolve({enabled:true,slots:['11:00']}));
 render(<MemoryRouter><FittingPage/></MemoryRouter>);
 fireEvent.click(screen.getByRole('button',{name:'Ověřit a pokračovat'}));
 const alert=await screen.findByRole('alert');
 await waitFor(()=>expect(alert).toHaveFocus());
 expect(screen.getByRole('link',{name:'Kontaktovat ANIRAK'})).toBeInTheDocument();
 if(status===409){
 expect(alert).toHaveTextContent('pro tento e-mail existuje jiná aktivní zkouška');
 expect(screen.getByLabelText('Jméno a příjmení')).toHaveValue(request.name);
 expect(screen.getByLabelText('E-mail')).toHaveValue(request.email);
 expect(screen.getByLabelText('Telefon')).toHaveValue(request.phone);
 expect(sessionStorage.getItem('anirakids.fitting-attempt.v1')).toBeNull();
 expect(screen.getByText('Pro pokračování vyberte čas zkoušky výše.')).toBeInTheDocument();
 }else{
 expect(alert).toHaveTextContent('Ověřte výsledek odeslání');
 expect(JSON.parse(sessionStorage.getItem('anirakids.fitting-attempt.v1')!)).toEqual(request);
 expect(screen.getByRole('button',{name:'Ověřit a pokračovat'})).toBeEnabled();
 }
 });

test('pending email conflict explains why changing dates cannot help',async()=>{
 sessionStorage.setItem('anirakids.fitting-attempt.v1',JSON.stringify({token:'a'.repeat(64),operationId:'operation',date:'2030-01-07',time:'11:00',name:'Jana Nová',email:'jana@example.test',phone:'+420123456789',accountId:'owner'}));
 api.mockImplementation((_path,options)=>options?.method==='POST'?Promise.reject(new FittingApiError('PENDING_FITTING_EXISTS',409)):Promise.resolve({enabled:true,slots:['11:00']}));
 render(<MemoryRouter><FittingPage/></MemoryRouter>);
 fireEvent.click(screen.getByRole('button',{name:'Ověřit a pokračovat'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Změna data ani času nevytvoří další zápis');
 expect(screen.queryByRole('button',{name:'Obnovit nabídku'})).not.toBeInTheDocument();
 expect(screen.getByRole('link',{name:'Moje zkoušky'})).toHaveAttribute('href','/ucet/rezervace');
});
