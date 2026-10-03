import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';

jest.mock('axios', () => {
  class MockAxiosError extends Error {}
  return {__esModule: true, default: {isCancel: () => false}, AxiosError: MockAxiosError};
});
jest.mock('../api/client', () => ({adminApiClient: {}, buildAdminRequestConfig: jest.fn()}));
import {AdminApiError} from '../api/errors';
import {createAdminVariant, getAdminProductVariants, updateAdminVariantSize, type AdminProductDetailVariant} from '../api/products';
import {ProductVariantsSection, type ProductVariantsSectionHandle} from './ProductVariantsSection';
import {createRef} from 'react';

jest.mock('../api/products',()=>({
  ...jest.requireActual('../api/products'),
  createAdminVariant:jest.fn(),
  getAdminProductVariants:jest.fn(),
  updateAdminVariantSize:jest.fn(),
}));
const createMock=createAdminVariant as jest.MockedFunction<typeof createAdminVariant>;
const refreshMock=getAdminProductVariants as jest.MockedFunction<typeof getAdminProductVariants>;
const updateMock=updateAdminVariantSize as jest.MockedFunction<typeof updateAdminVariantSize>;
const v=(id:string,size:string,status:'active'|'inactive'='active',sku?:string):AdminProductDetailVariant=>({
  id,productId:'p1',size,sku,status,sortOrder:id==='a'?0:1,
  createdAt:`2026-01-0${id==='a'?1:2}T00:00:00Z`,updatedAt:'2026-01-01T00:00:00Z',inventory:[{ignored:true}],
});
const props=(variants:AdminProductDetailVariant[]=[])=>({
  productId:'p1',token:'token',initialVariants:variants,onAccessError:jest.fn(()=>false),
});
beforeEach(()=>{jest.clearAllMocks()});

test('renders semantic list with active/inactive status, SKU and grouped literal unchanged',()=>{
  render(<ProductVariantsSection {...props([v('a','98-104-110-116','active','SKU-LONG'),v('b','XS','inactive')])}/>);
  expect(screen.getByRole('heading',{name:'Varianty'})).toBeInTheDocument();
  expect(screen.getByRole('list')).toBeInTheDocument();
  expect(screen.getByText('98-104-110-116')).toBeInTheDocument();
  expect(screen.getByText('Aktivní')).toBeInTheDocument();
  expect(screen.getByText('Neaktivní')).toBeInTheDocument();
  expect(screen.getByText('SKU: SKU-LONG')).toBeInTheDocument();
  expect(screen.getByText('SKU: Neuvedeno')).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:/smazat|aktivovat|deaktivovat/i})).not.toBeInTheDocument();
});

test('empty state opens one Add editor and focuses Velikost',async()=>{
  render(<ProductVariantsSection {...props()}/>);
  expect(screen.getByText('Produkt zatím nemá žádné varianty')).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button',{name:'Přidat variantu'})[0]);
  await waitFor(()=>expect(screen.getByLabelText('Velikost')).toHaveFocus());
  expect(document.querySelectorAll('[data-variant-editor]')).toHaveLength(1);
});

test('Add trims, submits only size, shows loading/success and focuses created edit action',async()=>{
  let resolve!:(value:any)=>void;
  createMock.mockReturnValue(new Promise(r=>{resolve=r}) as any);
  render(<ProductVariantsSection {...props()}/>);
  fireEvent.click(screen.getAllByRole('button',{name:'Přidat variantu'})[0]);
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:' 98-104 '}});
  fireEvent.click(document.querySelector('[data-variant-submit]') as HTMLButtonElement);
  await waitFor(()=>expect(document.querySelector('[data-variant-submit]')).toHaveAttribute('aria-busy','true'));
  expect(createMock).toHaveBeenCalledWith(expect.objectContaining({productId:'p1',body:{size:'98-104'}}));
  resolve({...v('a','98-104'),inventory:undefined});
  await waitFor(()=>expect(screen.getByText('Varianta byla přidána.')).toBeInTheDocument());
  await waitFor(()=>expect(screen.getByRole('button',{name:'Upravit velikost'})).toHaveFocus());
});

test('Edit cancel restores trigger; save PATCHes size and focuses same variant action',async()=>{
  updateMock.mockResolvedValue({...v('a','104'),inventory:undefined} as any);
  render(<ProductVariantsSection {...props([v('a','98')])}/>);
  const trigger=screen.getByRole('button',{name:'Upravit velikost'});
  fireEvent.click(trigger);await waitFor(()=>expect(screen.getByLabelText('Velikost')).toHaveFocus());
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:' 104 '}});
  fireEvent.click(screen.getByRole('button',{name:'Zrušit'}));await waitFor(()=>expect(trigger).toHaveFocus());
  fireEvent.click(trigger);fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:' 104 '}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit velikost'}));
  await waitFor(()=>expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({variantId:'a',body:{size:'104'}})));
  await waitFor(()=>expect(screen.getByText('Velikost byla uložena.')).toBeInTheDocument());
  expect(screen.getByText('104')).toBeInTheDocument();
  await waitFor(()=>expect(screen.getByRole('button',{name:'Upravit velikost'})).toHaveFocus());
});

test('duplicate and max validation keep editor and focus Input',async()=>{
  render(<ProductVariantsSection {...props([v('a','98')])}/>);
  fireEvent.click(document.querySelector('[data-variant-submit]') as HTMLButtonElement);
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:' 98 '}});
  fireEvent.click(document.querySelector('[data-variant-submit]') as HTMLButtonElement);
  expect(await screen.findByText('Tato velikost už u produktu existuje.')).toBeInTheDocument();
  await waitFor(()=>expect(screen.getByLabelText('Velikost')).toHaveFocus());
  expect(createMock).not.toHaveBeenCalled();
});

test('dirty editor switch delegates to page and imperative discard opens requested editor',async()=>{
  const requestSwitch=jest.fn();
  const ref=createRef<ProductVariantsSectionHandle>();
  render(<ProductVariantsSection ref={ref} {...props([v('a','98'),v('b','110')])} onRequestEditorSwitch={requestSwitch}/>);
  const edits=screen.getAllByRole('button',{name:'Upravit velikost'});
  fireEvent.click(edits[0]);fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'99'}});
  fireEvent.click(edits[1]);
  expect(requestSwitch).toHaveBeenCalledWith({target:{kind:'edit',variantId:'b'}});
  expect(screen.getByLabelText('Velikost')).toHaveValue('99');
  ref.current?.discardAndOpen({kind:'edit',variantId:'b'});
  await waitFor(()=>expect(screen.getByLabelText('Velikost')).toHaveValue('110'));
  await waitFor(()=>expect(screen.getByLabelText('Velikost')).toHaveFocus());
});

test('ambiguous create never auto-replays POST and refresh reconciles found size',async()=>{
  createMock.mockRejectedValue(new AdminApiError({code:'ADMIN_NETWORK_ERROR',message:'network',kind:'network'}));
  refreshMock.mockResolvedValue([v('a','98')]);
  render(<ProductVariantsSection {...props()}/>);
  fireEvent.click(screen.getAllByRole('button',{name:'Přidat variantu'})[0]);
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'98'}});
  fireEvent.click(document.querySelector('[data-variant-submit]') as HTMLButtonElement);
  expect(await screen.findByText('Výsledek vytvoření varianty není potvrzený')).toBeInTheDocument();
  expect(createMock).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button',{name:'Načíst aktuální varianty'}));
  await waitFor(()=>expect(refreshMock).toHaveBeenCalledTimes(1));
  expect(createMock).toHaveBeenCalledTimes(1);
  expect(await screen.findByText('V aktuálních variantách už tato velikost existuje. Zkontrolujte stav před další akcí.')).toBeInTheDocument();
});

test('VARIANT_NOT_FOUND retains typed size, disables Save and offers refresh',async()=>{
  updateMock.mockRejectedValue(new AdminApiError({status:404,code:'VARIANT_NOT_FOUND',message:'missing',kind:'unexpected'}));
  render(<ProductVariantsSection {...props([v('a','98')])}/>);
  fireEvent.click(screen.getByRole('button',{name:'Upravit velikost'}));
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'104'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit velikost'}));
  expect(await screen.findByText('Varianta už není dostupná')).toBeInTheDocument();
  expect(screen.getByLabelText('Velikost')).toHaveValue('104');
  expect(screen.getByRole('button',{name:'Uložit velikost'})).toBeDisabled();
  expect(screen.getByRole('button',{name:'Načíst aktuální varianty'})).toBeEnabled();
});

test('PRODUCT_NOT_FOUND keeps loaded variants/draft visible and disables mutations',async()=>{
  updateMock.mockRejectedValue(new AdminApiError({status:404,code:'PRODUCT_NOT_FOUND',message:'missing',kind:'unexpected'}));
  render(<ProductVariantsSection {...props([v('a','98')])}/>);
  fireEvent.click(screen.getByRole('button',{name:'Upravit velikost'}));
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'104'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit velikost'}));
  expect(await screen.findByText('Produkt už není dostupný')).toBeInTheDocument();
  expect(screen.getByLabelText('Velikost')).toHaveValue('104');
  expect(screen.getByText('98')).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Uložit velikost'})).toBeDisabled();
});

test('access errors delegate unchanged to boundary',async()=>{
  const onAccessError=jest.fn(()=>true);
  updateMock.mockRejectedValue(new AdminApiError({status:403,code:'ADMIN_FORBIDDEN',message:'forbidden',kind:'forbidden'}));
  render(<ProductVariantsSection {...props([v('a','98')])} onAccessError={onAccessError}/>);
  fireEvent.click(screen.getByRole('button',{name:'Upravit velikost'}));
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'104'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit velikost'}));
  await waitFor(()=>expect(onAccessError).toHaveBeenCalled());
  expect(screen.queryByText('forbidden')).not.toBeInTheDocument();
});


test('unknown create refresh absent clears uncertainty and allows explicit retry only',async()=>{
  createMock.mockRejectedValueOnce(new AdminApiError({code:'ADMIN_NETWORK_ERROR',message:'network',kind:'network'}));
  refreshMock.mockResolvedValueOnce([]);
  render(<ProductVariantsSection {...props()}/>);
  fireEvent.click(screen.getAllByRole('button',{name:'Přidat variantu'})[0]);
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'98'}});
  fireEvent.click(document.querySelector('[data-variant-submit]') as HTMLButtonElement);
  await screen.findByText('Výsledek vytvoření varianty není potvrzený');
  expect(createMock).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button',{name:'Načíst aktuální varianty'}));
  await screen.findByText('Aktuální varianty byly načteny. Vytvoření můžete zkusit znovu.');
  expect(createMock).toHaveBeenCalledTimes(1);
  createMock.mockResolvedValue({...v('a','98'),inventory:undefined} as any);
  fireEvent.click(document.querySelector('[data-variant-submit]') as HTMLButtonElement);
  await waitFor(()=>expect(createMock).toHaveBeenCalledTimes(2));
});

test('SKU conflict is defensive local copy with refresh action and no raw backend English',async()=>{
  updateMock.mockRejectedValue(new AdminApiError({status:409,code:'SKU_ALREADY_EXISTS',message:'raw backend english',kind:'unexpected'}));
  render(<ProductVariantsSection {...props([v('a','98')])}/>);
  fireEvent.click(screen.getByRole('button',{name:'Upravit velikost'}));
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'104'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit velikost'}));
  expect(await screen.findByText(/Variantu se nepodařilo uložit kvůli konfliktu SKU/)).toBeInTheDocument();
  expect(screen.getByText(/SKU se v tomto kroku neupravuje/)).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Načíst aktuální varianty'})).toBeEnabled();
  expect(screen.queryByText('raw backend english')).not.toBeInTheDocument();
});

test('stale create completion after keyed Product switch cannot mutate the new section',async()=>{
  let resolve!:(value:any)=>void;
  createMock.mockReturnValue(new Promise(r=>{resolve=r}) as any);
  const view=render(<ProductVariantsSection key="p1" {...props()}/>);
  fireEvent.click(screen.getAllByRole('button',{name:'Přidat variantu'})[0]);
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'98'}});
  fireEvent.click(document.querySelector('[data-variant-submit]') as HTMLButtonElement);
  const p2Variant={...v('p2v','200'),productId:'p2',inventory:[]} as AdminProductDetailVariant;
  view.rerender(<ProductVariantsSection key="p2" {...props([p2Variant])} productId="p2"/>);
  expect(screen.getByText('200')).toBeInTheDocument();
  await act(async()=>resolve({...v('a','98'),inventory:undefined}));
  expect(screen.getByText('200')).toBeInTheDocument();
  expect(screen.queryByText('Varianta byla přidána.')).not.toBeInTheDocument();
  expect(screen.queryByText('98')).not.toBeInTheDocument();
});

test('stale refresh completion after keyed Product switch cannot mutate new canonical variants',async()=>{
  let resolve!:(value:any)=>void;
  refreshMock.mockReturnValue(new Promise(r=>{resolve=r}) as any);
  updateMock.mockRejectedValue(new AdminApiError({status:404,code:'VARIANT_NOT_FOUND',message:'missing',kind:'unexpected'}));
  const view=render(<ProductVariantsSection key="p1" {...props([v('a','98')])}/>);
  fireEvent.click(screen.getByRole('button',{name:'Upravit velikost'}));
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'104'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit velikost'}));
  await screen.findByRole('button',{name:'Načíst aktuální varianty'});
  fireEvent.click(screen.getByRole('button',{name:'Načíst aktuální varianty'}));
  const p2Variant={...v('p2v','200'),productId:'p2',inventory:[]} as AdminProductDetailVariant;
  view.rerender(<ProductVariantsSection key="p2" {...props([p2Variant])} productId="p2"/>);
  await act(async()=>resolve([v('old','999')]));
  expect(screen.getByText('200')).toBeInTheDocument();
  expect(screen.queryByText('999')).not.toBeInTheDocument();
});
