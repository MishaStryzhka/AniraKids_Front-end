import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import {AdminApiError, type AdminApiErrorKind} from '../api/errors';
import {activateAdminProduct, getAdminProductActivationState, activateAdminInventoryItem, createAdminInventoryItem, createAdminProduct, createAdminVariant, getAdminProductDetail, getAdminProductInventorySnapshot, getAdminProductVariants, moveAdminInventoryItemToMaintenance, retireAdminInventoryItem, updateAdminInventoryItem, updateAdminProduct, updateAdminVariantSize, type AdminInventoryItem, type AdminProduct, type AdminProductDetailVariant} from '../api/products';
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
  activateAdminProduct: jest.fn(),
  getAdminProductActivationState: jest.fn(),
  activateAdminInventoryItem: jest.fn(),
  createAdminInventoryItem: jest.fn(),
  createAdminProduct: jest.fn(),
  createAdminVariant: jest.fn(),
  getAdminProductDetail: jest.fn(),
  getAdminProductInventorySnapshot: jest.fn(),
  getAdminProductVariants: jest.fn(),
  moveAdminInventoryItemToMaintenance: jest.fn(),
  retireAdminInventoryItem: jest.fn(),
  updateAdminInventoryItem: jest.fn(),
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

const activateInventoryMock = activateAdminInventoryItem as jest.MockedFunction<typeof activateAdminInventoryItem>;
const createInventoryMock = createAdminInventoryItem as jest.MockedFunction<typeof createAdminInventoryItem>;
const maintenanceInventoryMock = moveAdminInventoryItemToMaintenance as jest.MockedFunction<typeof moveAdminInventoryItemToMaintenance>;
const retireInventoryMock = retireAdminInventoryItem as jest.MockedFunction<typeof retireAdminInventoryItem>;
const updateInventoryMock = updateAdminInventoryItem as jest.MockedFunction<typeof updateAdminInventoryItem>;
const refreshInventoryMock = getAdminProductInventorySnapshot as jest.MockedFunction<typeof getAdminProductInventorySnapshot>;
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
const inventoryItem = (id='i1', variantId='v1', internalCode='AK-001', condition:'excellent'|'good'|'fair'|'damaged'='good', status:'active'|'maintenance'|'retired'='active'): AdminInventoryItem => ({
  id, variantId, internalCode, status, condition, notes:'', createdAt:'2026-09-01T00:00:00Z', updatedAt:'2026-09-01T00:00:00Z',
});
const variant = (id='v1', size='98', status:'active'|'inactive'='active', inventory:AdminInventoryItem[]=[inventoryItem('i1',id)]): AdminProductDetailVariant => ({
  id, productId:'p1', size, sku:id==='v1'?'SKU-1':undefined, status, sortOrder:id==='v1'?0:1,
  createdAt:'2026-09-01T00:00:00Z', updatedAt:'2026-09-01T00:00:00Z', inventory,
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
async function openInventoryAdd() {
  const add = screen.getAllByRole('button',{name:'Přidat fyzický kus'})[0];
  expect(add).toBeEnabled();
  fireEvent.click(add);
  await waitFor(()=>expect(document.querySelector('[data-inventory-editor-kind="add"]')).toBeInTheDocument());
  return screen.getByLabelText('Interní kód');
}
async function openInventoryEdit() {
  const edit = screen.getAllByRole('button',{name:'Upravit',exact:true})[0];
  expect(edit).toBeEnabled();
  fireEvent.click(edit);
  await waitFor(()=>expect(document.querySelector('[data-inventory-editor-kind="edit"]')).toBeInTheDocument());
  return screen.getByLabelText('Poznámka');
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


test('dirty Core survives successful variant update and Core Save preserves active variant draft and risk', async () => {
  const p={...product,photos:[photo('a')]};
  getMock.mockResolvedValueOnce({product:p,variants:[variant('v1','98')]});
  updateVariantMock.mockResolvedValueOnce({...variant('v1','104'),inventory:undefined} as any);
  const router=renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');

  fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});
  fireEvent.click(screen.getByRole('button',{name:'Upravit velikost'}));
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'104'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit velikost'}));

  await screen.findByText('Velikost byla uložena.');
  await waitFor(()=>expect(screen.queryByLabelText('Velikost')).not.toBeInTheDocument());
  expect(screen.getByText('104')).toBeInTheDocument();
  expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
  expect(save()).toBeEnabled();

  fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Bílá'}});
  expect(save()).toBeDisabled();

  fireEvent.click(screen.getByRole('button',{name:'Upravit velikost'}));
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'105'}});
  expect(screen.getByLabelText('Velikost')).toHaveValue('105');

  fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});
  patchMock.mockResolvedValueOnce({...p,color:'Růžová'});
  fireEvent.click(save());
  await screen.findByText('Změny byly uloženy.');

  expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
  expect(save()).toBeDisabled();
  expect(screen.getByLabelText('Velikost')).toHaveValue('105');
  expect(document.querySelector('[data-variant-id="v1"] [data-variant-editor]')).toBeInTheDocument();
  expect(screen.getByText('104')).toBeInTheDocument();
  expect(updateVariantMock).toHaveBeenCalledTimes(1);
  expect(createVariantMock).not.toHaveBeenCalled();

  await act(async()=>router.navigate('/admin/produkty'));
  const dialog=screen.getByRole('dialog');
  expect(dialog).toHaveTextContent('Neuložené nebo nedokončené změny');
  expect(dialog).toHaveTextContent('Máte neuložené změny nebo nedokončenou práci na této stránce.');
  expect(within(dialog).getByRole('button',{name:'Zůstat'})).toHaveFocus();
  fireEvent.click(within(dialog).getByRole('button',{name:'Zůstat'}));
  expect(router.state.location.pathname).toBe('/admin/produkty/p1');
  expect(screen.getByLabelText('Velikost')).toHaveValue('105');
});

test('photo ALT mutation preserves active variant editor draft canonical variants and page risk', async () => {
  const a=photo('a');
  const p={...product,photos:[a]};
  getMock.mockResolvedValueOnce({product:p,variants:[variant('v1','98')]});
  const router=renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');

  fireEvent.click(screen.getByRole('button',{name:'Upravit velikost'}));
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'104'}});
  expect(document.querySelector('[data-variant-id="v1"] [data-variant-editor]')).toBeInTheDocument();
  expect(screen.getByLabelText('Velikost')).toHaveValue('104');
  expect(screen.getByText('98')).toBeInTheDocument();

  altMock.mockResolvedValueOnce({product:{...p,color:'Server-only',photos:[{...a,alt:'Nový ALT'}]}});
  fireEvent.click(screen.getByRole('button',{name:'Upravit ALT'}));
  fireEvent.change(screen.getByLabelText('Alternativní text'),{target:{value:'Nový ALT'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit ALT'}));
  await waitFor(()=>expect(status()).toHaveTextContent('Alternativní text byl uložen.'));
  expect(within(media()).getByText('Nový ALT')).toBeInTheDocument();

  expect(document.querySelector('[data-variant-id="v1"] [data-variant-editor]')).toBeInTheDocument();
  expect(screen.getByLabelText('Velikost')).toHaveValue('104');
  expect(screen.getByText('98')).toBeInTheDocument();
  expect(updateVariantMock).not.toHaveBeenCalled();
  expect(createVariantMock).not.toHaveBeenCalled();

  await act(async()=>router.navigate('/admin/produkty'));
  const dialog=screen.getByRole('dialog');
  expect(dialog).toHaveTextContent('Neuložené nebo nedokončené změny');
  expect(within(dialog).getByRole('button',{name:'Zůstat'})).toHaveFocus();
  fireEvent.click(within(dialog).getByRole('button',{name:'Zůstat'}));
  expect(router.state.location.pathname).toBe('/admin/produkty/p1');
  expect(screen.getByLabelText('Velikost')).toHaveValue('104');
});


test('initial Product detail seeds Inventory once before Variant projection', async () => {
  getMock.mockResolvedValueOnce({product:{...product,photos:[photo('a')]},variants:[variant('v1','98','active',[inventoryItem()])]});
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  expect(getMock).toHaveBeenCalledTimes(1);
  expect(screen.getByText('AK-001')).toBeInTheDocument();
  expect(screen.getByRole('heading',{name:'Fyzické kusy',level:3})).toBeInTheDocument();
  expect(screen.getByText('SKU: SKU-1')).toBeInTheDocument();
  expect(screen.getByText('1 / 10 uložených')).toBeInTheDocument();
});

test('dirty Core survives Inventory create success and failure without Core rebase', async () => {
  getMock.mockResolvedValueOnce({product,variants:[variant('v1','98','active',[])]});
  createInventoryMock
    .mockResolvedValueOnce(inventoryItem('i2','v1','AK-002'))
    .mockRejectedValueOnce(apiError(null,'ADMIN_NETWORK_ERROR','network'));
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});

  fireEvent.change(await openInventoryAdd(),{target:{value:'ak-002'}});
  fireEvent.click(document.querySelector('[data-inventory-submit]') as HTMLButtonElement);
  await screen.findByText('Fyzický kus byl přidán.');
  expect(screen.getByText('AK-002')).toBeInTheDocument();
  expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
  expect(save()).toBeEnabled();

  fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Bílá'}});
  expect(save()).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});

  fireEvent.change(await openInventoryAdd(),{target:{value:'AK-003'}});
  fireEvent.click(document.querySelector('[data-inventory-submit]') as HTMLButtonElement);
  await screen.findByText('Výsledek přidání fyzického kusu není potvrzený');
  expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
  expect(save()).toBeEnabled();
  expect(createInventoryMock).toHaveBeenCalledTimes(2);
  expect(patchMock).not.toHaveBeenCalled();
});

test('Photo ALT draft survives Inventory success and keeps combined page risk', async () => {
  const p={...product,photos:[photo('a')]};
  getMock.mockResolvedValueOnce({product:p,variants:[variant('v1','98','active',[])]});
  createInventoryMock.mockResolvedValueOnce(inventoryItem('i2','v1','AK-002'));
  const router=renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.click(screen.getByRole('button',{name:'Upravit ALT'}));
  fireEvent.change(screen.getByLabelText('Alternativní text'),{target:{value:'Rozpracovaný ALT'}});
  fireEvent.change(await openInventoryAdd(),{target:{value:'AK-002'}});
  fireEvent.click(document.querySelector('[data-inventory-submit]') as HTMLButtonElement);
  await screen.findByText('Fyzický kus byl přidán.');
  expect(screen.getByLabelText('Alternativní text')).toHaveValue('Rozpracovaný ALT');
  expect(screen.getByText('AK-002')).toBeInTheDocument();
  await act(async()=>router.navigate('/admin/produkty'));
  expect(screen.getByRole('dialog')).toHaveTextContent('Neuložené nebo nedokončené změny');
});

test('Inventory refresh applies only Inventory and preserves Core Photos and Variant canonical state', async () => {
  const p={...product,photos:[photo('a')]};
  getMock.mockResolvedValueOnce({product:p,variants:[variant('v1','98','active',[inventoryItem()])]});
  updateInventoryMock.mockRejectedValueOnce(apiError(404,'INVENTORY_ITEM_NOT_FOUND'));
  refreshInventoryMock.mockResolvedValueOnce({variantIds:['v1'],inventoryByVariant:{v1:[inventoryItem('i2','v1','AK-777','fair')]}});
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});
  fireEvent.change(await openInventoryEdit(),{target:{value:'typed'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit změny'}));
  await screen.findByText('Fyzický kus už není dostupný');
  fireEvent.click(screen.getByRole('button',{name:'Načíst aktuální fyzické kusy'}));
  await waitFor(()=>expect(refreshInventoryMock).toHaveBeenCalledTimes(1));
  expect(await screen.findByText('AK-777')).toBeInTheDocument();
  expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
  expect(screen.getByText('98')).toBeInTheDocument();
  expect(screen.getByText('SKU: SKU-1')).toBeInTheDocument();
  expect(screen.getByText('1 / 10 uložených')).toBeInTheDocument();
  expect(patchMock).not.toHaveBeenCalled();
});

test('dirty Inventory uses one page Dialog with approved switch copy and Stay restores Inventory focus', async () => {
  getMock.mockResolvedValueOnce({product,variants:[variant('v1','98','active',[])]});
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.change(await openInventoryAdd(),{target:{value:'AK-9'}});
  fireEvent.click(screen.getByRole('button',{name:'Upravit velikost'}));
  const dialog=screen.getByRole('dialog');
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(within(dialog).getByRole('heading',{name:'Neuložené změny fyzického kusu'})).toBeInTheDocument();
  expect(dialog).toHaveTextContent('Máte neuložené změny fyzického kusu. Chcete je zahodit a pokračovat?');
  expect(within(dialog).getByRole('button',{name:'Zůstat'})).toHaveFocus();
  fireEvent.click(within(dialog).getByRole('button',{name:'Zůstat'}));
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByLabelText('Interní kód')).toHaveValue('AK-9');
  await waitFor(()=>expect(screen.getByLabelText('Interní kód')).toHaveFocus());
});

test('Inventory-only draft and unresolved create select exact leave copy/actions', async () => {
  getMock.mockResolvedValueOnce({product,variants:[variant('v1','98','active',[])]});
  createInventoryMock.mockRejectedValueOnce(apiError(null,'ADMIN_NETWORK_ERROR','network'));
  const router=renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');

  fireEvent.change(await openInventoryAdd(),{target:{value:'AK-9'}});
  await act(async()=>router.navigate('/admin/produkty'));
  let dialog=screen.getByRole('dialog');
  expect(dialog).toHaveTextContent('Neuložené změny fyzického kusu');
  expect(within(dialog).getByRole('button',{name:'Odejít bez uložení'})).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button',{name:'Zůstat'}));

  fireEvent.click(document.querySelector('[data-inventory-submit]') as HTMLButtonElement);
  await screen.findByText('Výsledek přidání fyzického kusu není potvrzený');
  await act(async()=>router.navigate('/admin/produkty'));
  dialog=screen.getByRole('dialog');
  expect(dialog).toHaveTextContent('Nedokončená práce s fyzickým kusem');
  expect(dialog).toHaveTextContent('Opuštění stránky neznamená, že se probíhající požadavek vrátí zpět.');
  expect(within(dialog).getByRole('button',{name:'Odejít',exact:true})).toBeInTheDocument();
});

test('post-load Inventory PRODUCT_NOT_FOUND preserves mounted domains and disables Inventory writes', async () => {
  const p={...product,photos:[photo('a')]};
  getMock.mockResolvedValueOnce({product:p,variants:[variant()]});
  updateInventoryMock.mockRejectedValueOnce(apiError(404,'INVENTORY_ITEM_NOT_FOUND'));
  refreshInventoryMock.mockRejectedValueOnce(apiError(404,'PRODUCT_NOT_FOUND'));
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.change(await openInventoryEdit(),{target:{value:'typed'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit změny'}));
  await screen.findByText('Fyzický kus už není dostupný');
  fireEvent.click(screen.getByRole('button',{name:'Načíst aktuální fyzické kusy'}));
  await screen.findByText('Produkt už není dostupný');
  expect(screen.getByDisplayValue('Sofia')).toBeInTheDocument();
  expect(screen.getByText('1 / 10 uložených')).toBeInTheDocument();
  expect(screen.getByText('98')).toBeInTheDocument();
  expect(screen.getByLabelText('Poznámka')).toHaveValue('typed');
  expect(screen.getByRole('button',{name:'Uložit změny'})).toBeDisabled();
});

test('Inventory access errors delegate to existing Admin boundary without raw backend copy', async () => {
  mockHandleRequestError.mockReturnValue(true);
  getMock.mockResolvedValueOnce({product,variants:[variant()]});
  updateInventoryMock.mockRejectedValueOnce(apiError(403,'ADMIN_FORBIDDEN','forbidden'));
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.change(await openInventoryEdit(),{target:{value:'typed'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit změny'}));
  await waitFor(()=>expect(mockHandleRequestError).toHaveBeenCalled());
  expect(screen.queryByText('raw backend english')).not.toBeInTheDocument();
});


test('R1 A: dirty Core survives successful Inventory update and Core Save preserves a new dirty Inventory editor', async () => {
  getMock.mockResolvedValueOnce({product,variants:[variant('v1','98','active',[inventoryItem()])]});
  updateInventoryMock.mockResolvedValueOnce({...inventoryItem(),condition:'fair',notes:'saved'});
  const router=renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');

  fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});
  await openInventoryEdit();
  fireEvent.change(screen.getByLabelText('Stav kusu'),{target:{value:'fair'}});
  fireEvent.change(screen.getByLabelText('Poznámka'),{target:{value:'saved'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit změny'}));

  await screen.findByText('Změny fyzického kusu byly uloženy.');
  await waitFor(()=>expect(document.querySelector('[data-inventory-editor]')).not.toBeInTheDocument());
  const savedRow=document.querySelector<HTMLElement>('[data-inventory-id="i1"]')!;
  expect(within(savedRow.querySelector<HTMLElement>('[data-inventory-condition-cell]')!).getByText('Uspokojivý')).toBeInTheDocument();
  expect(within(savedRow).getByText(/saved/)).toBeInTheDocument();
  expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
  expect(save()).toBeEnabled();

  fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Bílá'}});
  expect(save()).toBeDisabled();

  await openInventoryEdit();
  fireEvent.change(screen.getByLabelText('Poznámka'),{target:{value:'draft-after-core-save'}});
  expect(screen.getByLabelText('Poznámka')).toHaveValue('draft-after-core-save');
  fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});
  patchMock.mockResolvedValueOnce({...product,color:'Růžová'});
  fireEvent.click(save());
  await screen.findByText('Změny byly uloženy.');

  expect(document.querySelector('[data-inventory-editor-kind="edit"]')).toBeInTheDocument();
  expect(screen.getByLabelText('Poznámka')).toHaveValue('draft-after-core-save');
  expect(within(document.querySelector<HTMLElement>('[data-inventory-id="i1"] [data-inventory-condition-cell]')!).getByText('Uspokojivý')).toBeInTheDocument();
  expect(updateInventoryMock).toHaveBeenCalledTimes(1);
  expect(createInventoryMock).not.toHaveBeenCalled();
  expect(save()).toBeDisabled();

  await act(async()=>router.navigate('/admin/produkty'));
  const dialog=screen.getByRole('dialog');
  expect(within(dialog).getByRole('heading',{name:'Neuložené změny fyzického kusu'})).toBeInTheDocument();
  expect(dialog).toHaveTextContent('Máte neuložené změny fyzického kusu. Opravdu chcete odejít?');
});

test('R1 B: real Photo ALT save preserves active dirty Inventory editor draft canonical item and leave risk', async () => {
  const a=photo('a');
  const p={...product,photos:[a]};
  getMock.mockResolvedValueOnce({product:p,variants:[variant('v1','98','active',[inventoryItem()])]});
  altMock.mockResolvedValueOnce({product:{...p,photos:[{...a,alt:'Photo saved'}]}});
  const router=renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');

  await openInventoryEdit();
  fireEvent.change(screen.getByLabelText('Poznámka'),{target:{value:'inventory-draft'}});
  expect(screen.getByLabelText('Poznámka')).toHaveValue('inventory-draft');
  expect(within(document.querySelector<HTMLElement>('[data-inventory-id="i1"] [data-inventory-condition-cell]')!).getByText('Dobrý')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button',{name:'Upravit ALT'}));
  fireEvent.change(screen.getByLabelText('Alternativní text'),{target:{value:'Photo saved'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit ALT'}));
  await waitFor(()=>expect(status()).toHaveTextContent('Alternativní text byl uložen.'));
  expect(within(media()).getByText('Photo saved')).toBeInTheDocument();

  const inventoryRow=document.querySelector<HTMLElement>('[data-inventory-id="i1"]')!;
  expect(document.querySelector('[data-inventory-editor-kind="edit"]')).toBeInTheDocument();
  expect(screen.getByLabelText('Poznámka')).toHaveValue('inventory-draft');
  expect(inventoryRow.dataset.inventoryId).toBe('i1');
  expect(within(inventoryRow.querySelector<HTMLElement>('[data-inventory-condition-cell]')!).getByText('Dobrý')).toBeInTheDocument();
  expect(updateInventoryMock).not.toHaveBeenCalled();
  expect(createInventoryMock).not.toHaveBeenCalled();

  await act(async()=>router.navigate('/admin/produkty'));
  expect(within(screen.getByRole('dialog')).getByRole('heading',{name:'Neuložené změny fyzického kusu'})).toBeInTheDocument();
});

test('R1 C: deferred Inventory refresh commits while active dirty Variant editor and draft remain untouched', async () => {
  getMock.mockResolvedValueOnce({product,variants:[variant('v1','98','active',[inventoryItem()])]});
  updateInventoryMock.mockRejectedValueOnce(apiError(404,'INVENTORY_ITEM_NOT_FOUND'));
  const pendingRefresh=deferred<Awaited<ReturnType<typeof getAdminProductInventorySnapshot>>>();
  refreshInventoryMock.mockReturnValueOnce(pendingRefresh.promise);
  const router=renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');

  fireEvent.change(await openInventoryEdit(),{target:{value:'inventory-draft-before-refresh'}});
  fireEvent.click(screen.getByRole('button',{name:'Uložit změny'}));
  await screen.findByText('Fyzický kus už není dostupný');
  fireEvent.click(screen.getByRole('button',{name:'Načíst aktuální fyzické kusy'}));
  await waitFor(()=>expect(refreshInventoryMock).toHaveBeenCalledTimes(1));

  fireEvent.click(screen.getByRole('button',{name:'Upravit velikost'}));
  const switchDialog=screen.getByRole('dialog');
  fireEvent.click(within(switchDialog).getByRole('button',{name:'Zahodit změny a pokračovat'}));
  await waitFor(()=>expect(screen.getByLabelText('Velikost')).toHaveFocus());
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'99'}});
  expect(screen.getByLabelText('Velikost')).toHaveValue('99');

  await act(async()=>pendingRefresh.resolve({
    variantIds:['v1'],
    inventoryByVariant:{v1:[inventoryItem('i2','v1','AK-777','fair')]},
  }));
  expect(await screen.findByText('AK-777')).toBeInTheDocument();
  expect(screen.getByLabelText('Velikost')).toHaveValue('99');
  expect(screen.getByText('98')).toBeInTheDocument();
  expect(screen.getByText('SKU: SKU-1')).toBeInTheDocument();
  expect(updateVariantMock).not.toHaveBeenCalled();
  expect(createVariantMock).not.toHaveBeenCalled();

  await act(async()=>router.navigate('/admin/produkty'));
  const leave=screen.getByRole('dialog');
  expect(within(leave).getByRole('heading',{name:'Neuložené nebo nedokončené změny'})).toBeInTheDocument();
});

test('R1 unknown Inventory create requires explicit retry after authoritative absence and commits success focus', async () => {
  getMock.mockResolvedValueOnce({product,variants:[variant('v1','98','active',[])]});
  createInventoryMock
    .mockRejectedValueOnce(apiError(null,'ADMIN_NETWORK_ERROR','network'))
    .mockResolvedValueOnce(inventoryItem('i9','v1','AK-009','fair'));
  refreshInventoryMock.mockResolvedValueOnce({variantIds:['v1'],inventoryByVariant:{v1:[]}});
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');

  const code=await openInventoryAdd();
  fireEvent.change(code,{target:{value:' ak-009 '}});
  fireEvent.change(screen.getByLabelText('Stav kusu'),{target:{value:'fair'}});
  fireEvent.change(screen.getByLabelText('Poznámka'),{target:{value:'memo'}});
  fireEvent.click(document.querySelector('[data-inventory-submit]') as HTMLButtonElement);
  await screen.findByText('Výsledek přidání fyzického kusu není potvrzený');
  expect(createInventoryMock).toHaveBeenCalledTimes(1);
  expect(createInventoryMock.mock.calls[0][0].body).toEqual({internalCode:'ak-009',condition:'fair',notes:'memo'});
  expect(screen.getByLabelText('Interní kód')).toHaveValue(' ak-009 ');
  expect(screen.getByLabelText('Poznámka')).toHaveValue('memo');

  fireEvent.click(screen.getByRole('button',{name:'Načíst aktuální fyzické kusy'}));
  await screen.findByText('Aktuální fyzické kusy byly načteny. Přidání můžete zkusit znovu.');
  expect(createInventoryMock).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('Interní kód')).toHaveValue(' ak-009 ');
  expect(screen.getByLabelText('Stav kusu')).toHaveValue('fair');
  expect(screen.getByLabelText('Poznámka')).toHaveValue('memo');

  fireEvent.click(document.querySelector('[data-inventory-submit]') as HTMLButtonElement);
  await screen.findByText('Fyzický kus byl přidán.');
  const row=document.querySelector<HTMLElement>('[data-inventory-id="i9"]')!;
  expect(row).not.toBeNull();
  expect(within(row).getByText('AK-009')).toBeInTheDocument();
  expect(within(row).getByText('Uspokojivý')).toBeInTheDocument();
  await waitFor(()=>expect(within(row).getByRole('button',{name:'Upravit'})).toHaveFocus());
  expect(document.querySelector('[data-inventory-editor]')).not.toBeInTheDocument();
  expect(createInventoryMock).toHaveBeenCalledTimes(2);
  expect(createInventoryMock.mock.calls[1][0].body).toEqual({internalCode:'ak-009',condition:'fair',notes:'memo'});
});


test('02D dirty same-item Inventory editor survives maintenance; only canonical status changes and focus returns to Upravit',async()=>{
  const active=inventoryItem('i1','v1','AK-001','good','active');
  getMock.mockResolvedValueOnce({product,variants:[variant('v1','98','active',[active])]});
  maintenanceInventoryMock.mockResolvedValueOnce({...active,status:'maintenance'});
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.change(await openInventoryEdit(),{target:{value:'typed-note'}});
  fireEvent.click(screen.getByRole('button',{name:'Přesunout do údržby'}));
  await screen.findByText('Fyzický kus byl přesunut do údržby.');
  expect(screen.getByLabelText('Poznámka')).toHaveValue('typed-note');
  expect(screen.getByLabelText('Stav kusu')).toHaveValue('good');
  expect(within(document.querySelector<HTMLElement>('[data-inventory-id="i1"] [data-inventory-status-cell]')!).getByText('V údržbě')).toBeInTheDocument();
  expect(updateInventoryMock).not.toHaveBeenCalled();
  await waitFor(()=>expect(screen.getByRole('button',{name:'Upravit',exact:true})).toHaveFocus());
});

test('02D notes-only dirty maintenance item can activate and draft survives',async()=>{
  const maintenance=inventoryItem('i1','v1','AK-001','good','maintenance');
  getMock.mockResolvedValueOnce({product,variants:[variant('v1','98','active',[maintenance])]});
  activateInventoryMock.mockResolvedValueOnce({...maintenance,status:'active'});
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.change(await openInventoryEdit(),{target:{value:'notes-only'}});
  expect(screen.getByRole('button',{name:'Aktivovat'})).toBeEnabled();
  fireEvent.click(screen.getByRole('button',{name:'Aktivovat'}));
  await screen.findByText('Fyzický kus byl aktivován.');
  expect(screen.getByLabelText('Poznámka')).toHaveValue('notes-only');
  expect(within(document.querySelector<HTMLElement>('[data-inventory-id="i1"] [data-inventory-status-cell]')!).getByText('Aktivní')).toBeInTheDocument();
});

test('02D dirty same-item condition disables activation and issues no lifecycle POST',async()=>{
  const maintenance=inventoryItem('i1','v1','AK-001','good','maintenance');
  getMock.mockResolvedValueOnce({product,variants:[variant('v1','98','active',[maintenance])]});
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.click(screen.getByRole('button',{name:'Upravit',exact:true}));
  await waitFor(()=>expect(screen.getByLabelText('Stav kusu')).toHaveFocus());
  fireEvent.change(screen.getByLabelText('Stav kusu'),{target:{value:'fair'}});
  const activate=screen.getByRole('button',{name:'Aktivovat'});
  expect(activate).toBeDisabled();
  expect(screen.getByText('Nejprve uložte nebo zrušte rozpracovanou změnu Stavu kusu.')).toBeInTheDocument();
  expect(activateInventoryMock).not.toHaveBeenCalled();
});

test('02D lifecycle preserves dirty Variant, dirty Core and Photo drafts across successful maintenance',async()=>{
  const a=photo('a'),active=inventoryItem();
  getMock.mockResolvedValueOnce({product:{...product,photos:[a]},variants:[variant('v1','98','active',[active])]});
  maintenanceInventoryMock.mockResolvedValue({...active,status:'maintenance'});
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');

  fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});
  fireEvent.click(screen.getByRole('button',{name:'Upravit velikost'}));
  fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'99'}});
  fireEvent.click(screen.getByRole('button',{name:'Upravit ALT'}));
  fireEvent.change(screen.getByLabelText('Alternativní text'),{target:{value:'draft-alt'}});

  fireEvent.click(screen.getByRole('button',{name:'Přesunout do údržby'}));
  await screen.findByText('Fyzický kus byl přesunut do údržby.');
  expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
  expect(screen.getByLabelText('Velikost')).toHaveValue('99');
  expect(screen.getByLabelText('Alternativní text')).toHaveValue('draft-alt');
  expect(screen.getByText('V údržbě')).toBeInTheDocument();
  expect(updateVariantMock).not.toHaveBeenCalled();expect(altMock).not.toHaveBeenCalled();expect(patchMock).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Bílá'}});
  expect(save()).toBeDisabled();
});

test('02D retire uses exactly one page Dialog, cancel restores trigger, confirm suppresses stale trigger and success focuses Upravit',async()=>{
  const active=inventoryItem();
  getMock.mockResolvedValueOnce({product,variants:[variant('v1','98','active',[active])]});
  retireInventoryMock.mockResolvedValueOnce({...active,status:'retired',retiredAt:'2026-10-04T00:00:00Z'});
  renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  const retire=screen.getByRole('button',{name:'Vyřadit'});
  fireEvent.click(retire);
  let dialog=screen.getByRole('dialog');
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(within(dialog).getByRole('heading',{name:'Vyřadit fyzický kus?'})).toBeInTheDocument();
  expect(dialog).toHaveTextContent('Fyzický kus AK-001 bude trvale převeden do stavu Vyřazený. Po vyřazení jej nelze znovu aktivovat.');
  expect(within(dialog).getByRole('button',{name:'Zrušit'})).toHaveFocus();
  fireEvent.click(within(dialog).getByRole('button',{name:'Zrušit'}));
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await waitFor(()=>expect(retire).toHaveFocus());

  fireEvent.click(retire);
  dialog=screen.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button',{name:'Vyřadit'}));
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await waitFor(()=>expect(retireInventoryMock).toHaveBeenCalledTimes(1));
  await screen.findByText('Fyzický kus byl vyřazen.');
  expect(screen.getByText('Vyřazený')).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Vyřadit'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Aktivovat'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Přesunout do údržby'})).not.toBeInTheDocument();
  await waitFor(()=>expect(screen.getByRole('button',{name:'Upravit',exact:true})).toHaveFocus());
});

test('02D blocked navigation never replaces retire Dialog; cancel resolves local Dialog then proceeds once when no risk remains',async()=>{
  getMock.mockResolvedValueOnce({product,variants:[variant()]});
  const router=renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.click(screen.getByRole('button',{name:'Vyřadit'}));
  await act(async()=>router.navigate('/admin/produkty'));
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(screen.getByRole('dialog')).toHaveTextContent('Vyřadit fyzický kus?');
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Zrušit'}));
  await waitFor(()=>expect(router.state.location.pathname).toBe('/admin/produkty'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(retireInventoryMock).not.toHaveBeenCalled();
});

test('02D lifecycle-only unknown risk uses exact leave copy; explicit Inventory refresh resolves observed status without replay',async()=>{
  const active=inventoryItem();
  getMock.mockResolvedValueOnce({product,variants:[variant('v1','98','active',[active])]});
  maintenanceInventoryMock.mockRejectedValueOnce(apiError(null,'ADMIN_NETWORK_ERROR','network'));
  refreshInventoryMock.mockResolvedValueOnce({variantIds:['v1'],inventoryByVariant:{v1:[{...active,status:'maintenance'}]}});
  const router=renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.click(screen.getByRole('button',{name:'Přesunout do údržby'}));
  await screen.findByText('Výsledek změny provozního stavu není potvrzený');
  expect(maintenanceInventoryMock).toHaveBeenCalledTimes(1);
  await act(async()=>router.navigate('/admin/produkty'));
  let dialog=screen.getByRole('dialog');
  expect(within(dialog).getByRole('heading',{name:'Nedokončená změna provozního stavu'})).toBeInTheDocument();
  expect(dialog).toHaveTextContent('Změna provozního stavu probíhá nebo její výsledek není potvrzený.');
  expect(within(dialog).getByRole('button',{name:'Odejít',exact:true})).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button',{name:'Zůstat'}));

  fireEvent.click(screen.getByRole('button',{name:'Načíst aktuální fyzické kusy'}));
  await screen.findByText('Aktuální fyzické kusy byly načteny.');
  expect(maintenanceInventoryMock).toHaveBeenCalledTimes(1);
  expect(screen.getByText('V údržbě')).toBeInTheDocument();
  await act(async()=>router.navigate('/admin/produkty'));
  await waitFor(()=>expect(router.state.location.pathname).toBe('/admin/produkty'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('02D mixed lifecycle unknown plus Core draft uses page-wide leave copy',async()=>{
  const active=inventoryItem();
  getMock.mockResolvedValueOnce({product,variants:[variant('v1','98','active',[active])]});
  maintenanceInventoryMock.mockRejectedValueOnce(apiError(null,'ADMIN_NETWORK_ERROR','network'));
  const router=renderRouter('/admin/produkty/p1');
  await screen.findByDisplayValue('Sofia');
  fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});
  fireEvent.click(screen.getByRole('button',{name:'Přesunout do údržby'}));
  await screen.findByText('Výsledek změny provozního stavu není potvrzený');
  await act(async()=>router.navigate('/admin/produkty'));
  const dialog=screen.getByRole('dialog');
  expect(within(dialog).getByRole('heading',{name:'Neuložené nebo nedokončené změny'})).toBeInTheDocument();
  expect(within(dialog).getByRole('button',{name:'Odejít',exact:true})).toBeInTheDocument();
});

const activationPostMock=activateAdminProduct as jest.MockedFunction<typeof activateAdminProduct>;
const activationGetMock=getAdminProductActivationState as jest.MockedFunction<typeof getAdminProductActivationState>;
const activationButton=()=>screen.getByRole('button',{name:'Aktivovat produkt',exact:true});
const activationRegion=()=>screen.getByRole('region',{name:'Aktivace produktu'});
const coreForm=()=>document.querySelector('[data-product-core-form]') as HTMLElement;
const coreRecovery=()=>within(coreForm()).getByRole('button',{name:'Načíst aktuální stav produktu'});
const activationRecovery=()=>within(activationRegion()).getByRole('button',{name:'Načíst aktuální stav produktu'});
const activationMetadata=(status:'draft'|'active'|'archived'='active')=>({id:'p1',status,seoNoIndex:status!=='active'});
async function openActivationPage(){getMock.mockResolvedValue(detail);renderRouter('/admin/produkty/p1');await screen.findByDisplayValue('Sofia');}

test('activation starts clean; new Core and Variant drafts survive its success, existing status receives focus',async()=>{
 const pending=deferred<ReturnType<typeof activationMetadata>>();activationPostMock.mockReturnValue(pending.promise);await openActivationPage();
 fireEvent.click(activationButton());fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});
 fireEvent.click(screen.getByRole('button',{name:'Přidat variantu',exact:true}));fireEvent.change(screen.getByLabelText('Velikost'),{target:{value:'104'}});
 await act(async()=>pending.resolve(activationMetadata()));expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');expect(screen.getByLabelText('Velikost')).toHaveValue('104');expect(save()).toBeEnabled();
 expect(document.querySelector('[data-product-status]')).toHaveTextContent('Aktivní');expect(screen.queryByRole('button',{name:'Aktivovat produkt'})).not.toBeInTheDocument();
 await waitFor(()=>expect(document.querySelector('[data-product-status]')).toHaveFocus());
});
test('Core Save remains allowed after activation begins; its stale status cannot revert active',async()=>{
 const activation=deferred<ReturnType<typeof activationMetadata>>(),patch=deferred<AdminProduct>();activationPostMock.mockReturnValue(activation.promise);patchMock.mockReturnValue(patch.promise);await openActivationPage();
 fireEvent.click(activationButton());fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});expect(save()).toBeEnabled();fireEvent.click(save());
 await act(async()=>activation.resolve(activationMetadata()));await act(async()=>patch.resolve({...product,color:'Růžová',status:'draft',seo:{noIndex:true}}));
 expect(document.querySelector('[data-product-status]')).toHaveTextContent('Aktivní');expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');expect(save()).toBeDisabled();
});
test('Core Save in flight blocks activation even when user restores the clean baseline',async()=>{
 const pending=deferred<AdminProduct>();patchMock.mockReturnValue(pending.promise);await openActivationPage();fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});fireEvent.click(save());fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Bílá'}});
 expect(activationButton()).toBeDisabled();fireEvent.click(activationButton());expect(activationPostMock).not.toHaveBeenCalled();await act(async()=>pending.resolve(product));
});
test('both writer conflicts coexist; recovering only Core preserves activation conflict and the dirty draft',async()=>{
 const activation=deferred<ReturnType<typeof activationMetadata>>(),patch=deferred<AdminProduct>();activationPostMock.mockReturnValue(activation.promise);patchMock.mockReturnValue(patch.promise);await openActivationPage();
 fireEvent.click(activationButton());fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});fireEvent.click(save());
 await act(async()=>{activation.reject(apiError(409,'PRODUCT_STATE_CONFLICT'));patch.reject(apiError(409,'PRODUCT_STATE_CONFLICT'));});
 expect(screen.getAllByText('Produkt se mezitím změnil')).toHaveLength(2);expect(save()).toBeDisabled();expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
 activationGetMock.mockResolvedValue(activationMetadata('draft'));fireEvent.click(coreRecovery());await waitFor(()=>expect(save()).toBeEnabled());expect(activationRecovery()).toBeInTheDocument();expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');expect(patchMock).toHaveBeenCalledTimes(1);expect(activationPostMock).toHaveBeenCalledTimes(1);
 fireEvent.click(activationRecovery());await waitFor(()=>expect(screen.queryByText('Produkt se mezitím změnil')).not.toBeInTheDocument());expect(activationButton()).toBeDisabled();
 fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Bílá'}});expect(save()).toBeDisabled();expect(activationButton()).toBeEnabled();
});
test('malformed Core conflict recovery preserves input/baseline and Save refresh block',async()=>{
 patchMock.mockRejectedValue(apiError(409,'PRODUCT_STATE_CONFLICT'));await openActivationPage();fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});fireEvent.click(save());await screen.findByText('Produkt se mezitím změnil');
 activationGetMock.mockResolvedValue({...activationMetadata('draft'),id:'other'});fireEvent.click(coreRecovery());await screen.findByText('Aktuální stav produktu se nepodařilo načíst. Zkuste to znovu.');expect(save()).toBeDisabled();expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
 fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Bílá'}});expect(save()).toBeDisabled();fireEvent.click(screen.getByRole('link',{name:'Zpět',exact:true}));await screen.findByText('Products list');expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
test('delayed Core recovery draft cannot downgrade a later confirmed activation or clear its conflict',async()=>{
 const activation=deferred<ReturnType<typeof activationMetadata>>(),recovery=deferred<ReturnType<typeof activationMetadata>>();activationPostMock.mockReturnValue(activation.promise);patchMock.mockRejectedValue(apiError(409,'PRODUCT_STATE_CONFLICT'));activationGetMock.mockReturnValue(recovery.promise);await openActivationPage();
 fireEvent.click(activationButton());fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});fireEvent.click(save());await screen.findByText('Produkt se mezitím změnil');fireEvent.click(coreRecovery());
 await act(async()=>activation.resolve(activationMetadata()));await act(async()=>recovery.resolve(activationMetadata('draft')));
 expect(document.querySelector('[data-product-status]')).toHaveTextContent('Aktivní');expect(coreRecovery()).toBeEnabled();expect(save()).toBeDisabled();
});
test('activation unknown recovery remains visible when independent Core recovery observes active',async()=>{
 const activation=deferred<ReturnType<typeof activationMetadata>>();activationPostMock.mockReturnValue(activation.promise);patchMock.mockRejectedValue(apiError(409,'PRODUCT_STATE_CONFLICT'));await openActivationPage();fireEvent.click(activationButton());fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});fireEvent.click(save());
 await screen.findByText('Produkt se mezitím změnil');await act(async()=>activation.reject(apiError(null,'ADMIN_NETWORK_ERROR','network')));activationGetMock.mockResolvedValue(activationMetadata());fireEvent.click(coreRecovery());await waitFor(()=>expect(document.querySelector('[data-product-status]')).toHaveTextContent('Aktivní'));
 expect(screen.getByText('Výsledek aktivace není potvrzený')).toBeInTheDocument();expect(activationRecovery()).toBeEnabled();expect(screen.queryByRole('button',{name:'Aktivovat produkt'})).not.toBeInTheDocument();expect(save()).toBeEnabled();
});
test('new Core unknown invalidates older activation-conflict GET; independent uncertainty keeps leave protection',async()=>{
 const activation=deferred<ReturnType<typeof activationMetadata>>(),patch=deferred<AdminProduct>(),recovery=deferred<ReturnType<typeof activationMetadata>>();activationPostMock.mockReturnValue(activation.promise);patchMock.mockReturnValue(patch.promise);activationGetMock.mockReturnValue(recovery.promise);await openActivationPage();fireEvent.click(activationButton());fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});fireEvent.click(save());
 await act(async()=>activation.reject(apiError(409,'PRODUCT_STATE_CONFLICT')));fireEvent.click(activationRecovery());await act(async()=>patch.reject(apiError(null,'ADMIN_NETWORK_ERROR','network')));await act(async()=>recovery.resolve(activationMetadata('draft')));
 expect(activationRecovery()).toBeEnabled();expect(screen.getByText('Produkt se mezitím změnil')).toBeInTheDocument();fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Bílá'}});fireEvent.click(screen.getByRole('link',{name:'Zpět',exact:true}));await screen.findByRole('dialog');
});
test('readiness is authoritative, focusable and stays stale after a dirty-to-clean episode',async()=>{
 activationPostMock.mockRejectedValue(apiError(409,'PRODUCT_NOT_READY','unexpected',['inventory','rentalPrices.external','name','photos','future-key']));await openActivationPage();fireEvent.click(activationButton());await screen.findByText('Produkt zatím nelze aktivovat');await waitFor(()=>expect(screen.getByRole('heading',{name:'Produkt zatím nelze aktivovat'})).toHaveFocus());
 fireEvent.click(screen.getByRole('button',{name:'Přejít na Název'}));expect(screen.getByLabelText('Název')).toHaveFocus();
 fireEvent.click(screen.getByRole('button',{name:'Přejít k cenám'}));expect(screen.getByLabelText('Nabízet produkt k pronájmu')).toHaveFocus();
 fireEvent.click(screen.getByRole('button',{name:'Přejít k fotografiím'}));expect(screen.getByRole('heading',{name:'Fotografie'})).toHaveFocus();
 fireEvent.click(screen.getByRole('button',{name:'Přejít k variantám'}));expect(screen.getByRole('heading',{name:'Varianty'})).toHaveFocus();
 fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Bílá'}});expect(screen.getByText('Výsledek posledního pokusu už nemusí odpovídat aktuálním údajům.')).toBeInTheDocument();expect(activationButton()).toBeEnabled();
});
test('activation-only pending uses one blocker; resolution proceeds requested navigation exactly once',async()=>{
 const pending=deferred<ReturnType<typeof activationMetadata>>();activationPostMock.mockReturnValue(pending.promise);await openActivationPage();fireEvent.click(activationButton());fireEvent.click(screen.getByRole('link',{name:'Zpět',exact:true}));
 expect(await screen.findByRole('dialog')).toHaveTextContent('Aktivace produktu není potvrzená');expect(screen.getAllByRole('dialog')).toHaveLength(1);await act(async()=>pending.resolve(activationMetadata()));await screen.findByText('Products list');
});
test('reconciliation does not steal focus after newer editing interaction',async()=>{
 activationPostMock.mockRejectedValue(new Error('network'));const pending=deferred<ReturnType<typeof activationMetadata>>();activationGetMock.mockReturnValue(pending.promise);await openActivationPage();fireEvent.click(activationButton());await screen.findByText('Výsledek aktivace není potvrzený');activationRecovery().focus();fireEvent.click(activationRecovery());screen.getByLabelText('Barva').focus();fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});await act(async()=>pending.resolve(activationMetadata()));await waitFor(()=>expect(document.querySelector('[data-product-status]')).toHaveTextContent('Aktivní'));expect(screen.getByLabelText('Barva')).toHaveFocus();
});
test('ambiguous Core save blocks activation after current draft is restored to baseline',async()=>{
 patchMock.mockRejectedValue(apiError(null,'ADMIN_NETWORK_ERROR','network'));await openActivationPage();fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Růžová'}});fireEvent.click(save());await screen.findByText('Produkt se nepodařilo uložit. Zkontrolujte připojení a zkuste to znovu.');fireEvent.change(screen.getByLabelText('Barva'),{target:{value:'Bílá'}});expect(save()).toBeDisabled();expect(activationButton()).toBeDisabled();fireEvent.click(activationButton());expect(activationPostMock).not.toHaveBeenCalled();
});
