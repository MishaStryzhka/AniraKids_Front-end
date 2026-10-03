import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import {AdminApiError, type AdminApiErrorKind} from '../api/errors';
import {createAdminProduct, createAdminVariant, getAdminProductDetail, getAdminProductVariants, updateAdminProduct, updateAdminVariantSize, type AdminProduct, type AdminProductDetailVariant} from '../api/products';
import {completeProductPhoto, deleteProductPhoto, reorderProductPhotos, signProductPhoto, updateProductPhotoAlt} from '../api/productMedia';
import {ProviderUploadError, uploadProductMedia} from '../media/productMediaProviderTransport';
import {AdminProductCorePage} from './AdminProductCorePage';

jest.mock('axios', () => {
  class MockAxiosError extends Error {}
  return {__esModule: true, default: {isCancel: () => false}, AxiosError: MockAxiosError};
});
jest.mock('../api/client', () => ({adminApiClient: {}, buildAdminRequestConfig: jest.fn()}));
jest.mock('../../hooks/useAuth', () => ({useAuth: () => ({token: 'fixture-token'})}));
const mockHandleRequestError = jest.fn();
jest.mock('../auth/AdminAccessBoundary', () => ({useAdminAccess: () => ({handleRequestError: mockHandleRequestError})}));
jest.mock('../api/products', () => ({
  createAdminProduct: jest.fn(),
  createAdminVariant: jest.fn(),
  getAdminProductDetail: jest.fn(),
  getAdminProductVariants: jest.fn(),
  updateAdminProduct: jest.fn(),
  updateAdminVariantSize: jest.fn(),
}));
jest.mock('../media/productMediaProviderTransport', () => {
  const actual = jest.requireActual('../media/productMediaProviderTransport');
  return {...actual, uploadProductMedia: jest.fn()};
});
jest.mock('../api/productMedia', () => {
  const actual = jest.requireActual('../api/productMedia');
  return {...actual, completeProductPhoto: jest.fn(), deleteProductPhoto: jest.fn(),
    reorderProductPhotos: jest.fn(), signProductPhoto: jest.fn(), updateProductPhotoAlt: jest.fn()};
});

const createMock = createAdminProduct as jest.MockedFunction<typeof createAdminProduct>;
const createVariantMock = createAdminVariant as jest.MockedFunction<typeof createAdminVariant>;
const refreshVariantsMock = getAdminProductVariants as jest.MockedFunction<typeof getAdminProductVariants>;
const updateVariantMock = updateAdminVariantSize as jest.MockedFunction<typeof updateAdminVariantSize>;
const getMock = getAdminProductDetail as jest.MockedFunction<typeof getAdminProductDetail>;
const patchMock = updateAdminProduct as jest.MockedFunction<typeof updateAdminProduct>;
const signMock = signProductPhoto as jest.MockedFunction<typeof signProductPhoto>;
const completeMock = completeProductPhoto as jest.MockedFunction<typeof completeProductPhoto>;
const altMock = updateProductPhotoAlt as jest.MockedFunction<typeof updateProductPhotoAlt>;
const deleteMock = deleteProductPhoto as jest.MockedFunction<typeof deleteProductPhoto>;
const providerMock = uploadProductMedia as jest.MockedFunction<typeof uploadProductMedia>;
const reorderMock = reorderProductPhotos as jest.MockedFunction<typeof reorderProductPhotos>;
const product: AdminProduct = {id: 'p1', name: 'Sofia', slug: 'sofia', description: 'Jemné šaty', category: 'dress',
  gender: 'girls', color: 'Bílá', occasion: ['wedding'], ageTags: ['3–4 roky'], brand: '', familyLookGroup: '',
  rentalEnabled: false, saleEnabled: false, defaultDeposit: 0, photos: [], status: 'draft', seo: {noIndex: false},
  createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z'};
const variant = (id='v1', size='98', status:'active'|'inactive'='active'): AdminProductDetailVariant => ({
  id, productId:'p1', size, sku:id==='v1'?'SKU-1':undefined, status, sortOrder:id==='v1'?0:1,
  createdAt:'2026-09-01T00:00:00Z', updatedAt:'2026-09-01T00:00:00Z', inventory:[{ignored:true}],
});
const detail = {product, variants: [variant()]};
const apiError = (status: number | null, code: string, kind: AdminApiErrorKind = 'unexpected', details?: string[]) =>
  new AdminApiError({status, code, message: 'raw backend english', kind, details});
const photo = (publicId: string) => ({publicId, url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', alt: publicId});
const media = () => screen.getByRole('region', {name: 'Fotografie'});
const status = () => within(media()).getByRole('status');
const save = () => screen.getByRole('button', {name: 'Uložit', exact: true});
function renderRouter(initial = '/admin/produkty/novy') {
  const router = createMemoryRouter([
    {path: '/admin/produkty', element: <div>Products list</div>},
    {path: '/admin/produkty/novy', element: <><h1>Nový produkt</h1><AdminProductCorePage mode="create"/></>},
    {path: '/admin/produkty/:productId', element: <><h1>Upravit produkt</h1><AdminProductCorePage mode="edit"/></>},
  ], {initialEntries: [initial]});
  render(<RouterProvider router={router}/>);
  return router;
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {resolve = yes; reject = no;});
  return {promise, resolve, reject};
}
function checkCoreUntouched() {
  expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
  expect(patchMock).not.toHaveBeenCalled();
  expect(save()).toBeEnabled();
  fireEvent.change(screen.getByLabelText('Barva'), {target: {value: 'Bílá'}});
  expect(save()).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Barva'), {target: {value: 'Růžová'}});
}
async function openDirty(p: AdminProduct) {
  getMock.mockResolvedValueOnce({product: p, variants: []});
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.change(screen.getByLabelText('Barva'), {target: {value: 'Růžová'}});
}
function selectAndUpload() {
  // Native file chooser is hidden behind the visible selection button.
  const input = media().querySelector<HTMLInputElement>('input[type="file"]');
  expect(input).not.toBeNull();
  fireEvent.change(input!, {target: {files: [new File(['fixture'], 'x.jpg', {type: 'image/jpeg'})]}});
  fireEvent.click(screen.getByRole('button', {name: 'Nahrát fotografii'}));
}
function configureUpload() {
  signMock.mockResolvedValue({upload: {cloudName: 'fixture', apiKey: 'key', signature: 'sig', resourceType: 'image',
    params: {timestamp: 1, folder: 'products/p1', public_id: 'x', overwrite: false, allowed_formats: 'jpg'}}});
  providerMock.mockResolvedValue({publicId: 'products/p1/x'});
}
beforeEach(() => {
  jest.resetAllMocks();
  mockHandleRequestError.mockReturnValue(false);
  URL.createObjectURL = jest.fn(() => 'blob:fixture');
  URL.revokeObjectURL = jest.fn();
  jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});
afterEach(() => jest.restoreAllMocks());

test('CREATE starts clean, posts only name, rebases from response, replaces into hydrated edit without GET or blocker and shows feedback', async () => {
  createMock.mockResolvedValue(product);
  const router = renderRouter();
  expect(save()).toBeEnabled();
  fireEvent.change(screen.getByLabelText('Název'), {target: {value: ' Sofia '}});
  fireEvent.click(save());
  await waitFor(() => expect(createMock).toHaveBeenCalledWith(expect.objectContaining({body: {name: 'Sofia'}})));
  await waitFor(() => expect(router.state.location.pathname).toBe('/admin/produkty/p1'));
  expect(router.state.historyAction).toBe('REPLACE');
  expect(getMock).not.toHaveBeenCalled();
  expect(screen.getByLabelText('URL / slug')).toHaveValue('sofia');
  expect(save()).toBeDisabled();
  expect(screen.getByText('Produkt byl vytvořen.')).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
test('EDIT seeds Varianty from the same detail GET, hydrates clean baseline and PATCHes only changed Core field', async () => {
  const pending = deferred<typeof detail>();
  getMock.mockReturnValueOnce(pending.promise);
  const router = renderRouter('/admin/produkty/p1');
  expect(screen.getByRole('status')).toHaveTextContent('Načítání produktu…');
  expect(screen.queryByLabelText('Název')).not.toBeInTheDocument();
  await act(async () => pending.resolve(detail));
  await screen.findByDisplayValue('Sofia');
  expect(save()).toBeDisabled();
  expect(screen.getByRole('heading', {name: 'Varianty'})).toBeInTheDocument();
  expect(screen.getByText('SKU: SKU-1')).toBeInTheDocument();
  expect(getMock).toHaveBeenCalledTimes(1);
  fireEvent.change(screen.getByLabelText('Barva'), {target: {value: 'Růžová'}});
  patchMock.mockResolvedValue({...product, color: 'Růžová'});
  fireEvent.click(save());
  await screen.findByText('Změny byly uloženy.');
  expect(patchMock).toHaveBeenCalledWith(expect.objectContaining({productId: 'p1', body: {color: 'Růžová'}}));
  expect(router.state.location.pathname).toBe('/admin/produkty/p1');
  expect(save()).toBeDisabled();
});
test('failed PATCH preserves current values and dirty state', async () => {
  await openDirty(product);
  patchMock.mockRejectedValue(apiError(null, 'ADMIN_NETWORK_ERROR', 'network'));
  fireEvent.click(save());
  await screen.findByText('Produkt se nepodařilo uložit. Zkontrolujte připojení a zkuste to znovu.');
  expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
  expect(save()).toBeEnabled();
});
test('GET retry reloads after network error', async () => {
  getMock.mockRejectedValueOnce(apiError(null, 'ADMIN_NETWORK_ERROR', 'network')).mockResolvedValueOnce(detail);
  renderRouter('/admin/produkty/p1');
  await screen.findByText('Produkt se nepodařilo načíst');
  fireEvent.click(screen.getByRole('button', {name: 'Zkusit znovu'}));
  expect(await screen.findByDisplayValue('Sofia')).toBeInTheDocument();
  expect(getMock).toHaveBeenCalledTimes(2);
});
test.each([[404, 'PRODUCT_NOT_FOUND'], [400, 'INVALID_ID']] as const)('GET %s %s renders frozen not-found state', async (httpStatus, code) => {
  getMock.mockRejectedValue(apiError(httpStatus, code));
  renderRouter('/admin/produkty/bad');
  expect(await screen.findByText('Produkt nebyl nalezen')).toBeInTheDocument();
  expect(screen.getByText('Produkt už nemusí existovat nebo odkaz není platný.')).toBeInTheDocument();
  expect(screen.getByRole('link', {name: 'Zpět na produkty'})).toBeInTheDocument();
});
test('cancelled GET is silent', async () => {
  getMock.mockRejectedValue(apiError(null, 'ADMIN_REQUEST_CANCELLED', 'cancelled'));
  renderRouter('/admin/produkty/p1');
  await waitFor(() => expect(getMock).toHaveBeenCalled());
  expect(screen.getByRole('status')).toHaveTextContent('Načítání produktu…');
  expect(screen.queryByText('Produkt se nepodařilo načíst')).not.toBeInTheDocument();
});
test('slug conflict maps inline and focuses slug without raw backend copy', async () => {
  createMock.mockRejectedValue(apiError(409, 'SLUG_ALREADY_EXISTS'));
  renderRouter();
  fireEvent.change(screen.getByLabelText('Název'), {target: {value: 'Sofia'}});
  fireEvent.change(screen.getByLabelText('URL / slug'), {target: {value: 'sofia'}});
  fireEvent.click(save());
  await screen.findByText('Tuto URL / slug už používá jiný produkt. Zvolte jiný.');
  await waitFor(() => expect(screen.getByLabelText('URL / slug')).toHaveFocus());
  expect(screen.queryByText('raw backend english')).not.toBeInTheDocument();
});
test('recognized VALIDATION_ERROR detail maps inline and focuses field', async () => {
  createMock.mockRejectedValue(apiError(400, 'VALIDATION_ERROR', 'unexpected', ['seo.description']));
  renderRouter();
  fireEvent.change(screen.getByLabelText('Název'), {target: {value: 'Sofia'}});
  fireEvent.click(save());
  await screen.findByText('Zkontrolujte SEO popis.');
  await waitFor(() => expect(screen.getByLabelText('SEO popis')).toHaveFocus());
});
test('unsupported VALIDATION_ERROR uses safe form fallback', async () => {
  createMock.mockRejectedValue(apiError(400, 'VALIDATION_ERROR', 'unexpected', ['variants.0.size']));
  renderRouter();
  fireEvent.change(screen.getByLabelText('Název'), {target: {value: 'Sofia'}});
  fireEvent.click(save());
  await screen.findByText('Produkt se nepodařilo uložit. Zkontrolujte zadané údaje.');
  expect(screen.queryByText('raw backend english')).not.toBeInTheDocument();
});
test('PATCH 404 preserves edits and shows product-not-found save copy without replacing page', async () => {
  await openDirty(product);
  patchMock.mockRejectedValue(apiError(404, 'PRODUCT_NOT_FOUND'));
  fireEvent.click(save());
  await screen.findByText('Produkt už nebyl nalezen. Vaše změny zůstaly zachované.');
  expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
  expect(save()).toBeEnabled();
});
test.each([
  [401, 'ADMIN_UNAUTHORIZED', 'unauthorized'], [403, 'ADMIN_FORBIDDEN', 'forbidden'],
  [503, 'ADMIN_API_DISABLED', 'admin_disabled'], [503, 'ADMIN_API_CONFIGURATION_ERROR', 'configuration_error'],
] as const)('access error %s %s is delegated to boundary context', async (httpStatus, code, kind) => {
  const failure = apiError(httpStatus, code, kind);
  mockHandleRequestError.mockImplementation(e => e === failure);
  createMock.mockRejectedValue(failure);
  renderRouter();
  fireEvent.change(screen.getByLabelText('Název'), {target: {value: 'Sofia'}});
  fireEvent.click(save());
  await waitFor(() => expect(mockHandleRequestError).toHaveBeenCalledWith(failure));
  expect(screen.queryByText(/Produkt se nepodařilo uložit/)).not.toBeInTheDocument();
});
test('network is not consumed by access context and uses save copy', async () => {
  const failure = apiError(null, 'ADMIN_NETWORK_ERROR', 'network');
  createMock.mockRejectedValue(failure);
  renderRouter();
  fireEvent.change(screen.getByLabelText('Název'), {target: {value: 'Sofia'}});
  fireEvent.click(save());
  await screen.findByText('Produkt se nepodařilo uložit. Zkontrolujte připojení a zkuste to znovu.');
  expect(mockHandleRequestError).toHaveBeenCalledWith(failure);
});

test('dirty Core baseline survives applied order success conflict and media refresh with foreign Core values', async () => {
  const a = photo('a'), b = photo('b');
  await openDirty({...product, photos: [a, b]});
  reorderMock.mockResolvedValueOnce({product: {...product, color: 'Server-only', photos: [b, a]}});
  fireEvent.click(screen.getAllByRole('button', {name: 'Posunout později'})[0]);
  fireEvent.click(screen.getByRole('button', {name: 'Uložit pořadí'}));
  await waitFor(() => expect(status()).toHaveTextContent('Pořadí fotografií bylo uloženo.'));
  await waitFor(() => expect(screen.queryByRole('button', {name: 'Uložit pořadí'})).not.toBeInTheDocument());
  checkCoreUntouched();
  reorderMock.mockRejectedValueOnce(apiError(409, 'PHOTO_STATE_CONFLICT'));
  fireEvent.click(screen.getAllByRole('button', {name: 'Posunout později'})[0]);
  fireEvent.click(screen.getByRole('button', {name: 'Uložit pořadí'}));
  await waitFor(() => expect(status()).toHaveTextContent('Fotografie se mezitím změnily jinde.'));
  checkCoreUntouched();
  const fresh = deferred<Awaited<ReturnType<typeof getAdminProductDetail>>>();
  getMock.mockReturnValueOnce(fresh.promise);
  fireEvent.click(screen.getByRole('button', {name: 'Načíst aktuální fotografie'}));
  await act(async () => fresh.resolve({product: {...product, color: 'Do not hydrate', photos: [b, photo('c')]}, variants: []}));
  await waitFor(() => expect(media().querySelector('[data-photo-id="c"]')).toBeInTheDocument());
  expect(media().querySelector('[data-photo-id="a"]')).not.toBeInTheDocument();
  checkCoreUntouched();
});

test('dirty Core survives applied ALT success and failed delete then refresh without losing baseline or validation', async () => {
  const a = photo('a');
  await openDirty({...product, photos: [a]});
  altMock.mockResolvedValueOnce({product: {...product, color: 'Do not hydrate', photos: [{...a, alt: 'Nový ALT'}]}});
  fireEvent.click(screen.getByRole('button', {name: 'Upravit ALT'}));
  fireEvent.change(screen.getByLabelText('Alternativní text'), {target: {value: 'Nový ALT'}});
  fireEvent.click(screen.getByRole('button', {name: 'Uložit ALT'}));
  await waitFor(() => expect(status()).toHaveTextContent('Alternativní text byl uložen.'));
  expect(screen.queryByRole('button', {name: 'Uložit ALT'})).not.toBeInTheDocument();
  expect(within(media()).getByText('Nový ALT')).toBeInTheDocument();
  checkCoreUntouched();
  fireEvent.change(screen.getByLabelText('Název'), {target: {value: ''}});
  fireEvent.click(save());
  expect(screen.getByText('Název je povinný.')).toBeInTheDocument();
  deleteMock.mockRejectedValueOnce(apiError(404, 'PHOTO_NOT_FOUND'));
  fireEvent.click(screen.getByRole('button', {name: 'Odebrat fotografii'}));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', {name: 'Odebrat fotografii'}));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await waitFor(() => expect(status()).toHaveTextContent('Fotografie už u produktu není.'));
  expect(media().querySelector('[data-photo-id="a"]')).toBeInTheDocument();
  getMock.mockResolvedValueOnce({product: {...product, color: 'Server-only', photos: []}, variants: []});
  fireEvent.click(screen.getByRole('button', {name: 'Načíst aktuální fotografie'}));
  await within(media()).findByText('Produkt zatím nemá žádné fotografie.');
  expect(screen.getByText('Název je povinný.')).toBeInTheDocument();
  expect(screen.getByLabelText('Název')).toHaveValue('');
  expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
  expect(patchMock).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Název'), {target: {value: 'Sofia'}});
  checkCoreUntouched();
});

test('successful delete reconciles photos while independent Core Save only PATCHes changed Core field', async () => {
  const a = photo('a'), b = photo('b');
  await openDirty({...product, photos: [a, b]});
  deleteMock.mockResolvedValueOnce({product: {...product, color: 'Foreign', photos: [b]}});
  fireEvent.click(screen.getAllByRole('button', {name: 'Odebrat fotografii'})[0]);
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', {name: 'Odebrat fotografii'}));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await waitFor(() => expect(media().querySelector('[data-photo-id="a"]')).not.toBeInTheDocument());
  expect(media().querySelector('[data-photo-id="b"]')).toBeInTheDocument();
  checkCoreUntouched();
  patchMock.mockResolvedValueOnce({...product, color: 'Růžová', photos: [a, b]});
  fireEvent.click(save());
  await screen.findByText('Změny byly uloženy.');
  expect(patchMock).toHaveBeenCalledWith(expect.objectContaining({body: {color: 'Růžová'}}));
  expect(save()).toBeDisabled();
  expect(media().querySelector('[data-photo-id="a"]')).not.toBeInTheDocument();
});

test('real candidate helper allows upload COMPLETE; retained same-ID retry applies once and preserves dirty Core', async () => {
  await openDirty(product);
  configureUpload();
  completeMock.mockRejectedValueOnce(apiError(null, 'ADMIN_NETWORK_ERROR', 'network'));
  selectAndUpload();
  await screen.findByRole('button', {name: 'Zkusit připojit znovu'});
  await waitFor(() => expect(status()).toHaveTextContent('Připojení fotografie není potvrzené'));
  checkCoreUntouched();
  completeMock.mockResolvedValueOnce({product: {...product, color: 'Foreign', photos: [photo('products/p1/x')]}});
  fireEvent.click(screen.getByRole('button', {name: 'Zkusit připojit znovu'}));
  await within(media()).findByText('1 / 10 uložených');
  await waitFor(() => expect(status()).toHaveTextContent('Fotografie byla připojena k produktu.'));
  expect(media().querySelectorAll('[data-photo-id="products/p1/x"]')).toHaveLength(1);
  expect(completeMock.mock.calls.map(([input]) => input.publicId)).toEqual(['products/p1/x', 'products/p1/x']);
  expect(signMock).toHaveBeenCalledTimes(1);
  expect(providerMock).toHaveBeenCalledTimes(1);
  checkCoreUntouched();
});

test('mismatching provider ID blocks attachment while preserving candidate guard and dirty Core', async () => {
  await openDirty(product);
  configureUpload();
  providerMock.mockResolvedValueOnce({publicId: 'products/other/unexpected'});
  selectAndUpload();
  await waitFor(() => expect(status()).toHaveTextContent('Připojení je zablokované.'));
  expect(completeMock).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', {name: 'Nahrát fotografii'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button', {name: 'Zkusit připojit znovu'})).not.toBeInTheDocument();
  checkCoreUntouched();
});

test('unknown provider and 502 recovery keep one actionable retry using the real error class', async () => {
  await openDirty(product);
  configureUpload();
  providerMock.mockRejectedValueOnce(new ProviderUploadError('unknown', 'lost response'));
  completeMock.mockRejectedValueOnce(apiError(502, 'CLOUDINARY_OPERATION_FAILED'));
  selectAndUpload();
  const firstRetry = await screen.findByRole('button', {name: 'Ověřit a připojit'});
  fireEvent.click(firstRetry);
  await waitFor(() => expect(status()).toHaveTextContent('Služba fotografie nepotvrdila'));
  const retries = within(media()).getAllByRole('button').filter(button => /Ověřit a připojit|Zkusit ověřit znovu/.test(button.textContent ?? ''));
  expect(retries).toHaveLength(1);
  expect(retries[0]).toBeEnabled();
  expect(completeMock.mock.calls[0][0].publicId).toBe('products/p1/x');
  expect(signMock).toHaveBeenCalledTimes(1);
  expect(providerMock).toHaveBeenCalledTimes(1);
  checkCoreUntouched();
});


test('CREATE to EDIT seeds empty Varianty without redundant detail GET', async () => {
  createMock.mockResolvedValue(product);
  renderRouter();
  fireEvent.change(screen.getByLabelText('Název'), {target: {value: 'Sofia'}});
  fireEvent.click(save());
  await screen.findByText('Produkt byl vytvořen.');
  expect(getMock).not.toHaveBeenCalled();
  expect(screen.getByRole('heading', {name: 'Varianty'})).toBeInTheDocument();
  expect(screen.getByText('Produkt zatím nemá žádné varianty')).toBeInTheDocument();
});

test('dirty Core and existing Photos survive successful variant create; Core baseline remains independently dirty', async () => {
  const p={...product,photos:[photo('a')]};
  getMock.mockResolvedValueOnce({product:p,variants:[variant()]});
  createVariantMock.mockResolvedValue({
    id:'v2',productId:'p1',size:'110',status:'active',sortOrder:1,
    createdAt:'2026-09-02T00:00:00Z',updatedAt:'2026-09-02T00:00:00Z',
  });
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.change(screen.getByLabelText('Barva'), {target:{value:'Růžová'}});
  fireEvent.click(screen.getByRole('button',{name:'Přidat variantu'}));
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:' 110 '}});
  fireEvent.click(document.querySelector('[data-variant-submit]') as HTMLButtonElement);
  await screen.findByText('Varianta byla přidána.');
  expect(createVariantMock).toHaveBeenCalledWith(expect.objectContaining({productId:'p1',body:{size:'110'}}));
  expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
  expect(save()).toBeEnabled();
  expect(screen.getByText('1 / 10 uložených')).toBeInTheDocument();
  expect(await screen.findByText('110')).toBeInTheDocument();
  expect(patchMock).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Barva'), {target:{value:'Bílá'}});
  expect(save()).toBeDisabled();
});

test('dirty Core and Photos survive variant update and variant refresh ignores Product/photo payloads', async () => {
  const p={...product,photos:[photo('a')]};
  getMock.mockResolvedValueOnce({product:p,variants:[variant()]});
  updateVariantMock.mockRejectedValueOnce(apiError(404,'VARIANT_NOT_FOUND'));
  refreshVariantsMock.mockResolvedValueOnce([variant('v2','110','inactive')]);
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});
  fireEvent.click(screen.getByRole('button',{name:'Upravit velikost'}));
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'104'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit velikost'}));
  await screen.findByText('Varianta už není dostupná');
  fireEvent.click(screen.getByRole('button',{name:'Načíst aktuální varianty'}));
  await waitFor(()=>expect(refreshVariantsMock).toHaveBeenCalledTimes(1));
  expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
  expect(screen.getByText('1 / 10 uložených')).toBeInTheDocument();
  expect(await screen.findByText('110')).toBeInTheDocument();
  expect(await screen.findByText('Neaktivní')).toBeInTheDocument();
  expect(patchMock).not.toHaveBeenCalled();
});

test('dirty variant editor uses the single page-owned switch Dialog with exact copy and Stay preserves draft/focus', async () => {
  getMock.mockResolvedValueOnce({product,variants:[variant('v1','98'),variant('v2','110')]});
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  const edits=screen.getAllByRole('button',{name:'Upravit velikost'});
  fireEvent.click(edits[0]);
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'99'}});
  fireEvent.click(edits[1]);
  const dialog=screen.getByRole('dialog');
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(within(dialog).getByRole('heading',{name:'Neuložená změna varianty'})).toBeInTheDocument();
  expect(dialog).toHaveTextContent('Velikost má neuložené změny. Chcete je zahodit a pokračovat?');
  expect(within(dialog).getByRole('button',{name:'Zůstat'})).toHaveFocus();
  fireEvent.click(within(dialog).getByRole('button',{name:'Zůstat'}));
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByLabelText('Velikost')).toHaveValue('99');
  await waitFor(()=>expect(screen.getByLabelText('Velikost')).toHaveFocus());
});

test('dirty variant switch discard opens requested editor and combined navigation uses page-wide EDIT leave copy', async () => {
  getMock.mockResolvedValueOnce({product,variants:[variant('v1','98'),variant('v2','110')]});
  const router=renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  const edits=screen.getAllByRole('button',{name:'Upravit velikost'});
  fireEvent.click(edits[0]);
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'99'}});
  fireEvent.click(edits[1]);
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Zahodit změny a pokračovat'}));
  await waitFor(()=>expect(screen.getByLabelText('Velikost')).toHaveValue('110'));
  await waitFor(()=>expect(screen.getByLabelText('Velikost')).toHaveFocus());
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'111'}});
  await act(async()=>router.navigate('/admin/produkty'));
  const leaveDialog=screen.getByRole('dialog');
  expect(leaveDialog).toHaveTextContent('Máte neuložené změny nebo nedokončenou práci na této stránce.');
  expect(within(leaveDialog).getByRole('button',{name:'Zůstat'})).toHaveFocus();
  fireEvent.click(within(leaveDialog).getByRole('button',{name:'Zůstat'}));
  expect(router.state.location.pathname).toBe('/admin/produkty/p1');
  expect(screen.getByLabelText('Velikost')).toHaveValue('111');
});

test('ambiguous variant create is page risk and never auto-replays POST', async () => {
  getMock.mockResolvedValueOnce({product,variants:[]});
  createVariantMock.mockRejectedValue(apiError(null,'ADMIN_NETWORK_ERROR','network'));
  const router=renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.click(screen.getAllByRole('button',{name:'Přidat variantu'})[0]);
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'98'}});
  fireEvent.click(document.querySelector('[data-variant-submit]') as HTMLButtonElement);
  await screen.findByText('Výsledek vytvoření varianty není potvrzený');
  expect(createVariantMock).toHaveBeenCalledTimes(1);
  await act(async()=>router.navigate('/admin/produkty'));
  expect(screen.getByRole('dialog')).toHaveTextContent('Neuložené nebo nedokončené změny');
  expect(createVariantMock).toHaveBeenCalledTimes(1);
});

test('post-load variant PRODUCT_NOT_FOUND keeps Core Photos and draft mounted and delegates access errors', async () => {
  const p={...product,photos:[photo('a')]};
  getMock.mockResolvedValueOnce({product:p,variants:[variant()]});
  updateVariantMock.mockRejectedValueOnce(apiError(404,'PRODUCT_NOT_FOUND'));
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.click(screen.getByRole('button',{name:'Upravit velikost'}));
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'104'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit velikost'}));
  await screen.findByText('Produkt už není dostupný');
  expect(screen.getByDisplayValue('Sofia')).toBeInTheDocument();
  expect(screen.getByText('1 / 10 uložených')).toBeInTheDocument();
  expect(screen.getByLabelText('Velikost')).toHaveValue('104');
});
