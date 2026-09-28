import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import {AdminApiError, type AdminApiErrorKind} from '../api/errors';
import {getAdminProductDetail, updateAdminProduct, type AdminProduct} from '../api/products';
import {completeProductPhoto, deleteProductPhoto, signProductPhoto, updateProductPhotoAlt} from '../api/productMedia';
import {uploadProductMedia} from '../media/productMediaProviderTransport';
import {AdminProductCorePage} from './AdminProductCorePage';
import {ProductMediaSection} from './ProductMediaSection';

// Real page, controller, candidate helper and error classes. No real network operation is allowed.
jest.mock('axios', () => {
  class MockAxiosError extends Error {}
  return {__esModule: true, default: {isCancel: () => false}, AxiosError: MockAxiosError};
});
jest.mock('../api/client', () => ({adminApiClient: {}, buildAdminRequestConfig: jest.fn()}));
jest.mock('../../hooks/useAuth', () => ({useAuth: () => ({token: 'fixture-token'})}));
const mockAccess = jest.fn();
jest.mock('../auth/AdminAccessBoundary', () => ({useAdminAccess: () => ({handleRequestError: mockAccess})}));
jest.mock('../api/products', () => ({createAdminProduct: jest.fn(), getAdminProductDetail: jest.fn(), updateAdminProduct: jest.fn()}));
jest.mock('../api/productMedia', () => ({
  ...jest.requireActual('../api/productMedia'), completeProductPhoto: jest.fn(), deleteProductPhoto: jest.fn(),
  reorderProductPhotos: jest.fn(), signProductPhoto: jest.fn(), updateProductPhotoAlt: jest.fn(),
}));
jest.mock('../media/productMediaProviderTransport', () => ({
  ...jest.requireActual('../media/productMediaProviderTransport'), uploadProductMedia: jest.fn(),
}));

const get = getAdminProductDetail as jest.MockedFunction<typeof getAdminProductDetail>;
const patch = updateAdminProduct as jest.MockedFunction<typeof updateAdminProduct>;
const sign = signProductPhoto as jest.MockedFunction<typeof signProductPhoto>;
const complete = completeProductPhoto as jest.MockedFunction<typeof completeProductPhoto>;
const remove = deleteProductPhoto as jest.MockedFunction<typeof deleteProductPhoto>;
const alt = updateProductPhotoAlt as jest.MockedFunction<typeof updateProductPhotoAlt>;
const provider = uploadProductMedia as jest.MockedFunction<typeof uploadProductMedia>;
const photo = (publicId: string) => ({publicId, url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', alt: publicId});
const product: AdminProduct = {
  id: 'p1', name: 'Sofia', slug: 'sofia', color: 'Bílá', occasion: [], ageTags: [], rentalEnabled: false,
  saleEnabled: false, defaultDeposit: 0, photos: [photo('a'), photo('b')], status: 'draft',
  seo: {noIndex: false}, createdAt: '', updatedAt: '',
};
const descriptor = {
  cloudName: 'fixture', apiKey: 'key', signature: 'sig', resourceType: 'image' as const,
  params: {timestamp: 1, folder: 'products/p1', public_id: 'x', overwrite: false as const, allowed_formats: 'jpg'},
};
const error = (code: string, status: number | null, kind: AdminApiErrorKind = 'unexpected') =>
  new AdminApiError({code, status, kind, message: 'fixture failure'});
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {resolve = yes; reject = no;});
  return {promise, resolve, reject};
}
const media = () => screen.getByRole('region', {name: 'Fotografie'});
const live = () => within(media()).getByRole('status');
async function open(p = product) {
  get.mockResolvedValueOnce({product: p, variants: []});
  const router = createMemoryRouter([
    {path: '/admin/produkty/:productId', element: <AdminProductCorePage mode="edit"/>},
    {path: '/admin/produkty', element: <div>List</div>},
  ], {initialEntries: ['/admin/produkty/p1']});
  const view = render(<RouterProvider router={router}/>);
  await screen.findByDisplayValue('Sofia');
  return {...view, router};
}
function selectFile() {
  const input = media().querySelector<HTMLInputElement>('input[type="file"]')!;
  fireEvent.change(input, {target: {files: [new File(['fixture'], 'x.jpg', {type: 'image/jpeg'})]}});
}
function startUpload() {
  selectFile();
  fireEvent.click(screen.getByRole('button', {name: 'Nahrát fotografii'}));
}
function retainedCore() {
  expect(screen.getByLabelText('Barva')).toHaveValue('Růžová');
  expect(patch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Barva'), {target: {value: 'Bílá'}});
  expect(screen.getByRole('button', {name: 'Uložit', exact: true})).toBeDisabled();
}
beforeEach(() => {
  jest.resetAllMocks();
  mockAccess.mockReturnValue(false);
  URL.createObjectURL = jest.fn(() => 'blob:fixture');
  URL.revokeObjectURL = jest.fn();
  jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});
afterEach(() => jest.restoreAllMocks());

test('real phase progression has one polite channel and progress ticks do not announce percentages', async () => {
  await open({...product, photos: []});
  const signed = deferred<Awaited<ReturnType<typeof signProductPhoto>>>();
  const uploaded = deferred<Awaited<ReturnType<typeof uploadProductMedia>>>();
  const attached = deferred<Awaited<ReturnType<typeof completeProductPhoto>>>();
  sign.mockReturnValueOnce(signed.promise);
  provider.mockReturnValueOnce(uploaded.promise);
  complete.mockReturnValueOnce(attached.promise);
  selectFile();
  expect(live()).toHaveTextContent('Fotografie je připravena k nahrání.');
  expect(live()).toHaveAttribute('aria-live', 'polite');
  expect(live()).toHaveAttribute('aria-atomic', 'true');
  fireEvent.click(screen.getByRole('button', {name: 'Nahrát fotografii'}));
  expect(live()).toHaveTextContent('Připravujeme bezpečné nahrání fotografie…');
  expect(within(media()).queryByText('Fotografie je připravena k nahrání.')).not.toBeInTheDocument();
  await act(async () => signed.resolve({upload: descriptor}));
  await waitFor(() => expect(live()).toHaveTextContent('Fotografie se nahrává…'));
  const progressCallback = provider.mock.calls[0][0].onProgress!;
  const announcement = live().textContent;
  const changed = jest.fn();
  const observer = new MutationObserver(changed);
  observer.observe(live(), {subtree: true, childList: true, characterData: true});
  await act(async () => {progressCallback(25);});
  expect(within(media()).getByRole('progressbar')).toHaveAttribute('value', '25');
  await act(async () => {progressCallback(75);});
  expect(within(media()).getByRole('progressbar')).toHaveAttribute('value', '75');
  expect(live().textContent).toBe(announcement);
  expect(live()).not.toHaveTextContent('%');
  expect(changed).not.toHaveBeenCalled();
  observer.disconnect();
  await act(async () => uploaded.resolve({publicId: 'products/p1/x'}));
  await waitFor(() => expect(live()).toHaveTextContent('Ověřujeme připojení fotografie k produktu…'));
  expect(within(media()).queryByRole('progressbar')).not.toBeInTheDocument();
  await act(async () => attached.reject(error('ADMIN_NETWORK_ERROR', null, 'network')));
  await waitFor(() => expect(live()).toHaveTextContent('Připojení fotografie není potvrzené'));
  expect(live()).toHaveTextContent('Fotografie byla nahrána, ale její připojení k produktu se nepodařilo potvrdit.');
  expect(within(media()).getAllByRole('status')).toHaveLength(1);
});

test('confirmed provider identity and category survive a failed 502 COMPLETE retry', async () => {
  await open({...product, photos: []});
  sign.mockResolvedValueOnce({upload: descriptor});
  provider.mockResolvedValueOnce({publicId: 'products/p1/x'});
  complete.mockRejectedValueOnce(error('ADMIN_NETWORK_ERROR', null, 'network'))
    .mockRejectedValueOnce(error('CLOUDINARY_OPERATION_FAILED', 502));
  startUpload();
  fireEvent.click(await screen.findByRole('button', {name: 'Zkusit připojit znovu'}));
  await waitFor(() => expect(live()).toHaveTextContent('Služba fotografie nepotvrdila'));
  expect(live()).toHaveTextContent('Připojení fotografie není potvrzené');
  expect(screen.getByRole('button', {name: 'Zkusit připojit znovu'})).toBeEnabled();
  expect(screen.queryByRole('button', {name: 'Ověřit a připojit'})).not.toBeInTheDocument();
  expect(complete.mock.calls.map(([request]) => request.publicId)).toEqual(['products/p1/x', 'products/p1/x']);
  expect(sign).toHaveBeenCalledTimes(1);
  expect(provider).toHaveBeenCalledTimes(1);
});

test.each([
  ['PRODUCT_NOT_FOUND', 404], ['MEDIA_CONFIGURATION_ERROR', 503],
] as const)('initial COMPLETE %s retains attempt but disables guarded recovery actions', async (code, status) => {
  await open({...product, photos: []});
  sign.mockResolvedValueOnce({upload: descriptor});
  provider.mockResolvedValueOnce({publicId: 'products/p1/x'});
  complete.mockRejectedValueOnce(error(code, status));
  startUpload();
  const retry = await screen.findByRole('button', {name: 'Zkusit připojit znovu'});
  await waitFor(() => expect(retry).toBeDisabled());
  expect(screen.getByText('x.jpg')).toBeInTheDocument();
  expect(screen.getByRole('button', {name: 'Přidat fotografii'})).toBeDisabled();
  fireEvent.click(retry);
  expect(complete).toHaveBeenCalledTimes(1);
});

test.each([
  [401, 'ADMIN_UNAUTHORIZED', 'unauthorized'], [403, 'ADMIN_FORBIDDEN', 'forbidden'],
  [503, 'ADMIN_API_DISABLED', 'admin_disabled'], [503, 'ADMIN_API_CONFIGURATION_ERROR', 'configuration_error'],
] as const)('initial COMPLETE %s %s delegates the actual access error without another upload', async (status, code, kind) => {
  await open({...product, photos: []});
  sign.mockResolvedValueOnce({upload: descriptor});
  provider.mockResolvedValueOnce({publicId: 'products/p1/x'});
  const failure = error(code, status, kind);
  complete.mockRejectedValueOnce(failure);
  mockAccess.mockImplementation(e => e === failure);
  startUpload();
  await waitFor(() => expect(mockAccess).toHaveBeenCalledWith(failure));
  expect(sign).toHaveBeenCalledTimes(1);
  expect(provider).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(1);
});

test('PHOTO_NOT_FOUND refresh retry preserves lost ALT context and re-enables surviving photo editor', async () => {
  await open();
  fireEvent.change(screen.getByLabelText('Barva'), {target: {value: 'Růžová'}});
  fireEvent.click(screen.getAllByRole('button', {name: 'Upravit ALT'})[0]);
  fireEvent.change(screen.getByLabelText('Alternativní text'), {target: {value: 'Unsaved ALT for a'}});
  alt.mockRejectedValueOnce(error('PHOTO_NOT_FOUND', 404));
  fireEvent.click(screen.getByRole('button', {name: 'Uložit ALT'}));
  await waitFor(() => expect(live()).toHaveTextContent('Fotografie už u produktu není.'));
  get.mockRejectedValueOnce(error('ADMIN_NETWORK_ERROR', null, 'network'));
  fireEvent.click(screen.getByRole('button', {name: 'Načíst aktuální fotografie'}));
  await waitFor(() => expect(live()).toHaveTextContent('Fotografie se nepodařilo znovu načíst.'));
  expect(screen.getByRole('button', {name: 'Načíst aktuální fotografie'})).toBeEnabled();
  get.mockResolvedValueOnce({product: {...product, color: 'Foreign Core', photos: [photo('b')]}, variants: []});
  fireEvent.click(screen.getByRole('button', {name: 'Načíst aktuální fotografie'}));
  await waitFor(() => expect(media().querySelector('[data-photo-id="a"]')).not.toBeInTheDocument());
  expect(within(media()).getByText('Unsaved ALT for a')).toBeInTheDocument();
  expect(screen.getByRole('button', {name: 'Upravit ALT'})).toBeEnabled();
  fireEvent.click(screen.getByRole('button', {name: 'Upravit ALT'}));
  expect(screen.getByLabelText('Alternativní text')).toHaveValue('b');
  expect(alt).toHaveBeenCalledTimes(1);
  retainedCore();
});

test('PRODUCT_PHOTO_REQUIRED keeps the rejected photo and uses exact rejection copy and reconciliation', async () => {
  await open({...product, status: 'active'});
  fireEvent.change(screen.getByLabelText('Barva'), {target: {value: 'Růžová'}});
  remove.mockRejectedValueOnce(error('PRODUCT_PHOTO_REQUIRED', 409));
  fireEvent.click(screen.getAllByRole('button', {name: 'Odebrat fotografii'})[0]);
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', {name: 'Odebrat fotografii'}));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(live()).toHaveTextContent('Fotografii nelze odebrat. Aktivní produkt musí mít alespoň jednu fotografii.');
  expect(media().querySelector('[data-photo-id="a"]')).toBeInTheDocument();
  expect(live()).not.toHaveTextContent('Fotografie se mezitím změnily jinde.');
  get.mockResolvedValueOnce({product: {...product, status: 'active', photos: [photo('a')]}, variants: []});
  fireEvent.click(screen.getByRole('button', {name: 'Načíst aktuální fotografie'}));
  await waitFor(() => expect(media().querySelector('[data-photo-id="b"]')).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', {name: 'Odebrat fotografii'}));
  expect(within(screen.getByRole('dialog')).queryByRole('button', {name: 'Odebrat fotografii'})).not.toBeInTheDocument();
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', {name: 'Zrušit'}));
  expect(remove).toHaveBeenCalledTimes(1);
  retainedCore();
});

test('unmounted real media section never calls a stale delete-settlement or schedules stale focus', async () => {
  const pending = deferred<Awaited<ReturnType<typeof deleteProductPhoto>>>();
  remove.mockReturnValueOnce(pending.promise);
  const settled = jest.fn();
  const frames = new Map<number, FrameRequestCallback>();
  let sequence = 0;
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {frames.set(++sequence, callback); return sequence;});
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => {frames.delete(id);});
  const photos = [photo('a')];
  const view = render(<ProductMediaSection productId="A" productName="A" status="draft" token="fixture"
    initialPhotos={photos} deleteRequest={{publicId: 'a', nonce: 1}} onDeleteSettled={settled}/>);
  expect(remove).toHaveBeenCalledTimes(1);
  const signal = remove.mock.calls[0][0].signal!;
  view.unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => {
    pending.resolve({product: {...product, id: 'A', photos: []}});
  });
  act(() => {for (const callback of frames.values()) callback(0); frames.clear();});
  expect(settled).not.toHaveBeenCalled();
});
