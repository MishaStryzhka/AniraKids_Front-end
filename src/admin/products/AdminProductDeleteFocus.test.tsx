import {StrictMode} from 'react';
import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import {AdminProductCorePage} from './AdminProductCorePage';
import {getAdminProductDetail, updateAdminProduct, type AdminProduct} from '../api/products';
import {deleteProductPhoto} from '../api/productMedia';
import {AdminApiError} from '../api/errors';

jest.mock('axios', () => {
  class MockAxiosError extends Error {}
  return {__esModule: true, default: {isCancel: () => false}, AxiosError: MockAxiosError};
});
jest.mock('../api/client', () => ({adminApiClient: {}, buildAdminRequestConfig: jest.fn()}));
jest.mock('../../hooks/useAuth', () => ({useAuth: () => ({token: 'isolated-admin-token'})}));
const mockAccess = jest.fn(() => false);
jest.mock('../auth/AdminAccessBoundary', () => ({useAdminAccess: () => ({handleRequestError: mockAccess})}));
jest.mock('../api/products', () => ({createAdminProduct: jest.fn(), getAdminProductDetail: jest.fn(), updateAdminProduct: jest.fn()}));
jest.mock('../api/productMedia', () => ({
  ...jest.requireActual('../api/productMedia'), signProductPhoto: jest.fn(), completeProductPhoto: jest.fn(),
  updateProductPhotoAlt: jest.fn(), reorderProductPhotos: jest.fn(), deleteProductPhoto: jest.fn(),
}));
jest.mock('../media/productMediaProviderTransport', () => ({
  ...jest.requireActual('../media/productMediaProviderTransport'), uploadProductMedia: jest.fn(),
}));
const get = getAdminProductDetail as jest.MockedFunction<typeof getAdminProductDetail>;
const remove = deleteProductPhoto as jest.MockedFunction<typeof deleteProductPhoto>;
const patch = updateAdminProduct as jest.MockedFunction<typeof updateAdminProduct>;
function product(ids = ['a', 'b', 'c'], status: AdminProduct['status'] = 'draft'): AdminProduct {
  return {id: 'p1', name: 'Sofia', slug: 'p1', color: 'Bílá', occasion: [], ageTags: [], rentalEnabled: false,
    saleEnabled: false, defaultDeposit: 0, seo: {noIndex: true}, status, createdAt: '', updatedAt: '',
    photos: ids.map(publicId => ({publicId, url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', alt: publicId}))};
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(res => {resolve = res;});
  return {promise, resolve};
}
function row(id: string) {
  const element = Array.from(document.querySelectorAll<HTMLElement>('[data-photo-id]')).find(item => item.dataset.photoId === id);
  if (!element) throw new Error(`Missing photo ${id}`);
  return within(element);
}
async function mountEditor(seed = product(), strict = false) {
  get.mockResolvedValue({product: seed, variants: []});
  const router = createMemoryRouter([
    {path: '/admin/produkty', element: <h1>Products list</h1>},
    {path: '/admin/produkty/:productId', element: <AdminProductCorePage mode="edit"/>},
  ], {initialEntries: ['/admin/produkty/p1']});
  const element = <div id="root"><RouterProvider router={router}/></div>;
  const view = render(strict ? <StrictMode>{element}</StrictMode> : element);
  await screen.findByDisplayValue('Sofia');
  return {...view, router};
}
function confirm(id: string) {
  userEvent.click(row(id).getByRole('button', {name: 'Odebrat fotografii'}));
  userEvent.click(within(screen.getByRole('dialog')).getByRole('button', {name: 'Odebrat fotografii'}));
}
beforeEach(() => {
  jest.resetAllMocks();
  mockAccess.mockReturnValue(false);
  URL.createObjectURL = jest.fn(() => 'blob:fixture');
  URL.revokeObjectURL = jest.fn();
  jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});
afterEach(() => jest.restoreAllMocks());

test('success intent survives visible kind none and is consumed once after modal background cleanup', async () => {
  const response = deferred<{product: AdminProduct}>();
  remove.mockReturnValue(response.promise);
  const {router} = await mountEditor(product(), true);
  const frames: FrameRequestCallback[] = [];
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {frames.push(callback); return frames.length;});
  fireEvent.change(screen.getByLabelText('Barva'), {target: {value: 'Unsaved pink'}});
  confirm('b');
  userEvent.click(within(screen.getByRole('dialog')).getByRole('button', {name: 'Odebrat fotografii'}));
  expect(remove).toHaveBeenCalledTimes(1);
  await act(async () => {response.resolve({product: product(['a', 'c'])}); await response.promise;});
  expect(document.querySelector('[data-photo-id="b"]')).not.toBeInTheDocument();
  // The section has committed the new photos. Its settlement frame closes the page Dialog.
  act(() => frames.splice(0).forEach(callback => callback(0)));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.getElementById('root')).not.toHaveAttribute('inert');
  expect(document.getElementById('root')).not.toHaveAttribute('aria-hidden');
  expect(document.body.style.overflow).not.toBe('hidden');
  // Only Dialog's deferred restoration now applies focus, with visible kind already none.
  act(() => frames.splice(0).forEach(callback => callback(0)));
  expect(row('c').getByRole('button', {name: 'Upravit ALT'})).toHaveFocus();
  expect(screen.getByLabelText('Barva')).toHaveValue('Unsaved pink');
  expect(patch).not.toHaveBeenCalled();
  expect(screen.getByRole('button', {name: 'Uložit', exact: true})).toBeEnabled();
  fireEvent.change(screen.getByLabelText('Barva'), {target: {value: 'Bílá'}});
  expect(screen.getByRole('button', {name: 'Uložit', exact: true})).toBeDisabled();
  expect(router.state.location.pathname).toBe('/admin/produkty/p1');
});

test('previous-photo success fallback is not reused by a later cancel or rejected deletion', async () => {
  remove.mockResolvedValueOnce({product: product(['a', 'b'])});
  await mountEditor();
  confirm('c');
  await waitFor(() => expect(row('b').getByRole('button', {name: 'Upravit ALT'})).toHaveFocus());
  const trigger = row('a').getByRole('button', {name: 'Odebrat fotografii'});
  userEvent.click(trigger);
  userEvent.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(remove).toHaveBeenCalledTimes(1);
  remove.mockRejectedValueOnce(new AdminApiError({kind: 'unexpected', status: 409, code: 'PRODUCT_PHOTO_REQUIRED', message: 'Rejected'}));
  confirm('a');
  await screen.findByText('Fotografii nelze odebrat. Aktivní produkt musí mít alespoň jednu fotografii.');
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(document.querySelector('[data-photo-id="a"]')).toBeInTheDocument();
  expect(row('b').getByRole('button', {name: 'Upravit ALT'})).not.toHaveFocus();
});

test.each(['draft', 'archived'] as const)('%s final photo cancel restores trigger and success restores file trigger', async status => {
  remove.mockResolvedValueOnce({product: product([], status)});
  await mountEditor(product(['a'], status));
  const trigger = row('a').getByRole('button', {name: 'Odebrat fotografii'});
  userEvent.click(trigger);
  userEvent.click(within(screen.getByRole('dialog')).getByRole('button', {name: 'Zrušit'}));
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(remove).not.toHaveBeenCalled();
  confirm('a');
  await screen.findByText('Produkt zatím nemá žádné fotografie.');
  await waitFor(() => expect(screen.getByRole('button', {name: 'Přidat fotografii'})).toHaveFocus());
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(remove).toHaveBeenCalledTimes(1);
});

test('selected unsent file makes heading the legitimate final-photo focus fallback', async () => {
  remove.mockResolvedValueOnce({product: product([])});
  const {container} = await mountEditor(product(['a']));
  userEvent.upload(container.querySelector<HTMLInputElement>('input[type="file"]')!, new File(['fixture'], 'pending.jpg', {type: 'image/jpeg'}));
  expect(screen.getByRole('button', {name: 'Přidat fotografii'})).toBeDisabled();
  confirm('a');
  await screen.findByText('Produkt zatím nemá žádné fotografie.');
  await waitFor(() => expect(screen.getByRole('heading', {name: 'Fotografie'})).toHaveFocus());
  expect(screen.getByRole('heading', {name: 'Fotografie'})).toHaveAttribute('tabindex', '-1');
  expect(screen.getByRole('button', {name: 'Přidat fotografii'})).toBeDisabled();
});
