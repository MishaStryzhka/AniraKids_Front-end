import {act,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {createMemoryRouter,RouterProvider} from 'react-router-dom';
import {AdminApiError} from '../api/errors';
import {createAdminProduct,getAdminProductDetail,updateAdminProduct} from '../api/products';
import {AdminProductCorePage} from './AdminProductCorePage';

jest.mock('../../hooks/useAuth',()=>({useAuth:()=>({token:'admin-token'})}));
const handleRequestError=jest.fn();
jest.mock('../auth/AdminAccessBoundary',()=>({useAdminAccess:()=>({handleRequestError})}));
jest.mock('../api/products',()=>{const actual=jest.requireActual('../api/products');return {...actual,createAdminProduct:jest.fn(),getAdminProductDetail:jest.fn(),updateAdminProduct:jest.fn()}});

const createMock=createAdminProduct as jest.MockedFunction<typeof createAdminProduct>;
const getMock=getAdminProductDetail as jest.MockedFunction<typeof getAdminProductDetail>;
const patchMock=updateAdminProduct as jest.MockedFunction<typeof updateAdminProduct>;
const product={id:'p1',name:'Sofia',slug:'sofia',description:'Jemné šaty',category:'dress' as const,gender:'girls' as const,color:'Bílá',occasion:['wedding' as const],ageTags:['3–4 roky'],brand:'',familyLookGroup:'',rentalEnabled:false,saleEnabled:false,defaultDeposit:0,photos:[],status:'draft' as const,seo:{noIndex:false},createdAt:'2026-09-01T00:00:00Z',updatedAt:'2026-09-01T00:00:00Z'};
const detail={product,variants:[{id:'ignored-variant'}]};
const apiError=(status:number|null,code:string,kind:'unauthorized'|'forbidden'|'admin_disabled'|'configuration_error'|'network'|'unexpected'|'cancelled'='unexpected',details?:string[])=>new AdminApiError({status,code,message:'raw backend english',kind,details});

function renderRouter(initial='/admin/produkty/novy'){
 const router=createMemoryRouter([
  {path:'/admin/produkty',element:<div>Products list</div>},
  {path:'/admin/produkty/novy',element:<><h1>Nový produkt</h1><AdminProductCorePage mode="create"/></>},
  {path:'/admin/produkty/:productId',element:<><h1>Upravit produkt</h1><AdminProductCorePage mode="edit"/></>},
 ],{initialEntries:[initial]});
 render(<RouterProvider router={router}/>);
 return router;
}
beforeEach(()=>{jest.clearAllMocks();handleRequestError.mockReturnValue(false)});

test('CREATE starts clean, posts only name, rebases from response, replaces into hydrated edit without GET or blocker and shows feedback',async()=>{
 createMock.mockResolvedValue(product);const router=renderRouter();
 expect(screen.getByRole('button',{name:'Uložit'})).toBeEnabled();
 fireEvent.change(screen.getByLabelText('Název'),{target:{value:' Sofia '}});
 fireEvent.click(screen.getByRole('button',{name:'Uložit'}));
 await waitFor(()=>expect(createMock).toHaveBeenCalledWith(expect.objectContaining({body:{name:'Sofia'}})));
 await waitFor(()=>expect(router.state.location.pathname).toBe('/admin/produkty/p1'));
 expect(router.state.historyAction).toBe('REPLACE');
 expect(getMock).not.toHaveBeenCalled();
 expect(screen.getByLabelText('URL / slug')).toHaveValue('sofia');
 expect(screen.getByRole('button',{name:'Uložit'})).toBeDisabled();
 expect(screen.getByText('Produkt byl vytvořen.')).toBeInTheDocument();
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('EDIT renders loading before GET, ignores variants, hydrates clean baseline and PATCHes only changed field',async()=>{
 let resolve!:(value:typeof detail)=>void;getMock.mockReturnValue(new Promise(r=>{resolve=r}));const router=renderRouter('/admin/produkty/p1');
 expect(screen.getByRole('status')).toHaveTextContent('Načítání produktu…');expect(screen.queryByLabelText('Název')).not.toBeInTheDocument();
 await act(async()=>resolve(detail));
 await screen.findByDisplayValue('Sofia');expect(screen.getByRole('button',{name:'Uložit'})).toBeDisabled();
 fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});expect(screen.getByRole('button',{name:'Uložit'})).toBeEnabled();
 patchMock.mockResolvedValue({...product,color:'Růžová'});fireEvent.click(screen.getByRole('button',{name:'Uložit'}));
 await waitFor(()=>expect(patchMock).toHaveBeenCalledWith(expect.objectContaining({productId:'p1',body:{color:'Růžová'}})));
 expect(router.state.location.pathname).toBe('/admin/produkty/p1');await screen.findByText('Změny byly uloženy.');expect(screen.getByRole('button',{name:'Uložit'})).toBeDisabled();
});

test('failed PATCH preserves current values and dirty state',async()=>{getMock.mockResolvedValue(detail);patchMock.mockRejectedValue(apiError(null,'ADMIN_NETWORK_ERROR','network'));renderRouter('/admin/produkty/p1');await screen.findByDisplayValue('Sofia');fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});fireEvent.click(screen.getByRole('button',{name:'Uložit'}));await screen.findByText('Produkt se nepodařilo uložit');expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');expect(screen.getByRole('button',{name:'Uložit'})).toBeEnabled()});

test('GET retry reloads after network error',async()=>{getMock.mockRejectedValueOnce(apiError(null,'ADMIN_NETWORK_ERROR','network')).mockResolvedValueOnce(detail);renderRouter('/admin/produkty/p1');await screen.findByText('Produkt se nepodařilo načíst');fireEvent.click(screen.getByRole('button',{name:'Zkusit znovu'}));expect(await screen.findByDisplayValue('Sofia')).toBeInTheDocument();expect(getMock).toHaveBeenCalledTimes(2)});
test.each([[404,'PRODUCT_NOT_FOUND'],[400,'INVALID_ID']])('GET %s %s renders frozen not-found state',async(status,code)=>{getMock.mockRejectedValue(apiError(status,code));renderRouter('/admin/produkty/bad');expect(await screen.findByText('Produkt nebyl nalezen')).toBeInTheDocument();expect(screen.getByText('Produkt už nemusí existovat nebo odkaz není platný.')).toBeInTheDocument();expect(screen.getByRole('link',{name:'Zpět na produkty'})).toBeInTheDocument()});
test('cancelled GET is silent',async()=>{getMock.mockRejectedValue(apiError(null,'ADMIN_REQUEST_CANCELLED','cancelled'));renderRouter('/admin/produkty/p1');await waitFor(()=>expect(getMock).toHaveBeenCalled());expect(screen.getByRole('status')).toHaveTextContent('Načítání produktu…');expect(screen.queryByText('Produkt se nepodařilo načíst')).not.toBeInTheDocument()});

test('slug conflict maps inline and focuses slug without raw backend copy',async()=>{createMock.mockRejectedValue(apiError(409,'SLUG_ALREADY_EXISTS'));renderRouter();fireEvent.change(screen.getByLabelText('Název'),{target:{value:'Sofia'}});fireEvent.change(screen.getByLabelText('URL / slug'),{target:{value:'sofia'}});fireEvent.click(screen.getByRole('button',{name:'Uložit'}));expect(await screen.findByText('Tuto URL / slug už používá jiný produkt. Zvolte jiný.')).toBeInTheDocument();await waitFor(()=>expect(screen.getByLabelText('URL / slug')).toHaveFocus());expect(screen.queryByText('raw backend english')).not.toBeInTheDocument()});

test('recognized VALIDATION_ERROR detail maps inline and focuses field',async()=>{createMock.mockRejectedValue(apiError(400,'VALIDATION_ERROR','unexpected',['seo.description']));renderRouter();fireEvent.change(screen.getByLabelText('Název'),{target:{value:'Sofia'}});fireEvent.click(screen.getByRole('button',{name:'Uložit'}));expect(await screen.findByText('Zkontrolujte SEO popis.')).toBeInTheDocument();await waitFor(()=>expect(screen.getByLabelText('SEO popis')).toHaveFocus())});
test('unsupported VALIDATION_ERROR uses safe form fallback',async()=>{createMock.mockRejectedValue(apiError(400,'VALIDATION_ERROR','unexpected',['variants.0.size']));renderRouter();fireEvent.change(screen.getByLabelText('Název'),{target:{value:'Sofia'}});fireEvent.click(screen.getByRole('button',{name:'Uložit'}));expect(await screen.findByText('Produkt se nepodařilo uložit. Zkontrolujte zadané údaje.')).toBeInTheDocument();expect(screen.queryByText('raw backend english')).not.toBeInTheDocument()});

test('PATCH 404 preserves edits and shows product-not-found save copy without replacing page',async()=>{getMock.mockResolvedValue(detail);patchMock.mockRejectedValue(apiError(404,'PRODUCT_NOT_FOUND'));const router=renderRouter('/admin/produkty/p1');await screen.findByDisplayValue('Sofia');fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});fireEvent.click(screen.getByRole('button',{name:'Uložit'}));expect(await screen.findByText('Produkt už nebyl nalezen. Vaše změny zůstaly zachované.')).toBeInTheDocument();expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');expect(screen.getByRole('button',{name:'Uložit'})).toBeEnabled();expect(router.state.location.pathname).toBe('/admin/produkty/p1')});

test.each([
 [401,'ADMIN_UNAUTHORIZED','unauthorized'],[403,'ADMIN_FORBIDDEN','forbidden'],[503,'ADMIN_API_DISABLED','admin_disabled'],[503,'ADMIN_API_CONFIGURATION_ERROR','configuration_error']
] as const)('access error %s %s is delegated to boundary context',async(status,code,kind)=>{const error=apiError(status,code,kind);handleRequestError.mockImplementation(e=>e===error);createMock.mockRejectedValue(error);renderRouter();fireEvent.change(screen.getByLabelText('Název'),{target:{value:'Sofia'}});fireEvent.click(screen.getByRole('button',{name:'Uložit'}));await waitFor(()=>expect(handleRequestError).toHaveBeenCalledWith(error));expect(screen.queryByText(/Produkt se nepodařilo uložit/)).not.toBeInTheDocument()});
test('network is not consumed by access context and uses save copy',async()=>{const error=apiError(null,'ADMIN_NETWORK_ERROR','network');createMock.mockRejectedValue(error);renderRouter();fireEvent.change(screen.getByLabelText('Název'),{target:{value:'Sofia'}});fireEvent.click(screen.getByRole('button',{name:'Uložit'}));expect(await screen.findByText('Produkt se nepodařilo uložit. Zkontrolujte připojení a zkuste to znovu.')).toBeInTheDocument();expect(handleRequestError).toHaveBeenCalledWith(error)});
