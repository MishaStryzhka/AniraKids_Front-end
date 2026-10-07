import {act, renderHook} from '@testing-library/react';
import {AdminApiError} from '../api/errors';
import {completeProductPhoto, deleteProductPhoto, signProductPhoto, updateProductPhotoAlt} from '../api/productMedia';
import type {ProductMediaUploadDescriptor} from '../api/productMedia';
import {getAdminProductDetail, type AdminProduct, type AdminProductPhoto} from '../api/products';
import {ProviderUploadError, uploadProductMedia} from '../media/productMediaProviderTransport';
import {useProductMediaController} from './useProductMediaController';

// Keep real domain errors and the pure candidate helper. Only I/O boundaries are mocked.
jest.mock('axios', () => {
  class MockAxiosError extends Error {}
  return {__esModule: true, default: {isCancel: () => false}, AxiosError: MockAxiosError};
});
jest.mock('../api/client', () => ({adminApiClient: {}, buildAdminRequestConfig: jest.fn()}));
jest.mock('../api/productMedia', () => {
  const actual = jest.requireActual('../api/productMedia');
  return {...actual, completeProductPhoto: jest.fn(), deleteProductPhoto: jest.fn(),
    reorderProductPhotos: jest.fn(), signProductPhoto: jest.fn(), updateProductPhotoAlt: jest.fn()};
});
jest.mock('../api/products', () => ({getAdminProductDetail: jest.fn()}));
jest.mock('../media/productMediaProviderTransport', () => {
  const actual = jest.requireActual('../media/productMediaProviderTransport');
  return {...actual, uploadProductMedia: jest.fn()};
});

const sign = signProductPhoto as jest.MockedFunction<typeof signProductPhoto>;
const complete = completeProductPhoto as jest.MockedFunction<typeof completeProductPhoto>;
const provider = uploadProductMedia as jest.MockedFunction<typeof uploadProductMedia>;
const detail = getAdminProductDetail as jest.MockedFunction<typeof getAdminProductDetail>;
const alt = updateProductPhotoAlt as jest.MockedFunction<typeof updateProductPhotoAlt>;
const remove = deleteProductPhoto as jest.MockedFunction<typeof deleteProductPhoto>;
const image = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const photo = (publicId: string): AdminProductPhoto => ({publicId, url: image, alt: publicId});
const product = (id: string, photos: AdminProductPhoto[]): AdminProduct => ({
  id, name: id, slug: id, occasion: [], ageTags: [], rentalEnabled: false, saleEnabled: false,
  defaultDeposit: 0, seo: {noIndex: false}, photos, status: 'draft', createdAt: '', updatedAt: '',
});
const descriptor: ProductMediaUploadDescriptor = {
  cloudName: 'fixture', apiKey: 'fixture-key', signature: 'fixture-signature', resourceType: 'image',
  params: {timestamp: 1, folder: 'products/p1', public_id: 'x', overwrite: false, allowed_formats: 'jpg'},
};
const file = () => new File(['fixture'], 'x.jpg', {type: 'image/jpeg'});
const error = (code: string, status: number | null = null) => new AdminApiError({
  code, status, message: 'fixture failure', kind: status === null ? 'network' : 'unexpected',
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {resolve = yes; reject = no;});
  return {promise, resolve, reject};
}
const props = (id = 'p1', photos: AdminProductPhoto[] = []) => ({
  productId: id, productName: id, status: 'draft' as const, token: 'fixture-token', initialPhotos: photos,
});
function setup(initial = props()) {
  return renderHook((input: ReturnType<typeof props>) => useProductMediaController(input), {initialProps: initial});
}

beforeEach(() => {
  jest.resetAllMocks();
  URL.createObjectURL = jest.fn(() => 'blob:fixture');
  URL.revokeObjectURL = jest.fn();
});

async function startConfirmedFailure() {
  sign.mockResolvedValue({upload: descriptor});
  provider.mockResolvedValue({publicId: 'products/p1/x'});
  complete.mockRejectedValue(error('ADMIN_NETWORK_ERROR'));
  const hook = setup();
  act(() => hook.result.current.selectFile(file()));
  await act(async () => {await hook.result.current.upload();});
  return hook;
}

test('same-ID COMPLETE retry never signs or uploads twice and applies saved photo once', async () => {
  const hook = await startConfirmedFailure();
  expect(hook.result.current.uploadPhase).toBe('provider-confirmed-unattached');
  expect(hook.result.current.attempt).toMatchObject({candidate: 'products/p1/x', providerPublicId: 'products/p1/x', filename: 'x.jpg'});
  complete.mockResolvedValueOnce({product: product('p1', [photo('products/p1/x')])});
  await act(async () => {await hook.result.current.recover();});
  expect(sign).toHaveBeenCalledTimes(1);
  expect(provider).toHaveBeenCalledTimes(1);
  expect(complete.mock.calls.map(([input]) => input.publicId)).toEqual(['products/p1/x', 'products/p1/x']);
  expect(hook.result.current.photos).toEqual([photo('products/p1/x')]);
  expect(hook.result.current.uploadPhase).toBe('idle');
  expect(hook.result.current.operation).toBeNull();
  expect(hook.result.current.attempt).toBeNull();
});

test('failed confirmed-provider recovery preserves identity context and remains actionable', async () => {
  const hook = await startConfirmedFailure();
  const attempt = hook.result.current.attempt;
  await act(async () => {await hook.result.current.recover();});
  expect(hook.result.current.uploadPhase).toBe('provider-confirmed-unattached');
  expect(hook.result.current.operation).toBeNull();
  expect(hook.result.current.attempt).toEqual(attempt);
  complete.mockResolvedValueOnce({product: product('p1', [photo('products/p1/x')])});
  await act(async () => {await hook.result.current.recover();});
  expect(hook.result.current.photos).toEqual([photo('products/p1/x')]);
  expect(sign).toHaveBeenCalledTimes(1);
  expect(provider).toHaveBeenCalledTimes(1);
});

test('real ProviderUploadError unknown retains candidate through failed and successful recovery', async () => {
  sign.mockResolvedValue({upload: descriptor});
  provider.mockRejectedValue(new ProviderUploadError('unknown', 'lost provider response'));
  complete.mockRejectedValueOnce(error('CLOUDINARY_OPERATION_FAILED', 502));
  const hook = setup();
  act(() => hook.result.current.selectFile(file()));
  await act(async () => {await hook.result.current.upload();});
  expect(hook.result.current.uploadPhase).toBe('unknown');
  expect(hook.result.current.attempt?.candidate).toBe('products/p1/x');
  expect(complete).not.toHaveBeenCalled();
  await act(async () => {await hook.result.current.recover();});
  expect(hook.result.current.uploadPhase).toBe('unknown');
  expect(hook.result.current.operation).toBeNull();
  complete.mockResolvedValueOnce({product: product('p1', [photo('products/p1/x')])});
  await act(async () => {await hook.result.current.recover();});
  expect(hook.result.current.photos).toEqual([photo('products/p1/x')]);
  expect(complete.mock.calls.map(([input]) => input.publicId)).toEqual(['products/p1/x', 'products/p1/x']);
  expect(sign).toHaveBeenCalledTimes(1);
  expect(provider).toHaveBeenCalledTimes(1);
});

test('mismatching returned ID is quarantined with original candidate and no COMPLETE', async () => {
  sign.mockResolvedValue({upload: descriptor});
  provider.mockResolvedValue({publicId: 'products/other/unexpected'});
  const hook = setup();
  act(() => hook.result.current.selectFile(file()));
  await act(async () => {await hook.result.current.upload();});
  expect(hook.result.current.uploadPhase).toBe('identity-mismatch');
  expect(hook.result.current.attempt?.candidate).toBe('products/p1/x');
  await act(async () => {await hook.result.current.recover();});
  expect(complete).not.toHaveBeenCalled();
  expect(sign).toHaveBeenCalledTimes(1);
  expect(provider).toHaveBeenCalledTimes(1);
});

test.each(['success', 'failure'] as const)('delayed A refresh %s cannot replace B photos drafts feedback or operation', async outcome => {
  const pending = deferred<Awaited<ReturnType<typeof getAdminProductDetail>>>();
  detail.mockReturnValueOnce(pending.promise);
  const hook = setup(props('A', [photo('a')]));
  let request!: Promise<void>;
  act(() => {request = hook.result.current.refresh();});
  const signal = detail.mock.calls[0][0].signal!;
  hook.rerender(props('B', [photo('b'), photo('c')]));
  act(() => hook.result.current.startAlt('b'));
  act(() => hook.result.current.setDrafts(d => ({...d, altById: {...d.altById, b: 'B draft'}})));
  act(() => hook.result.current.selectFile(new File(['bad'], 'bad.txt', {type: 'text/plain'})));
  const before = {photos: hook.result.current.photos, drafts: hook.result.current.drafts,
    feedback: hook.result.current.feedback, guard: hook.result.current.guard,
    operation: hook.result.current.operation, editor: hook.result.current.editingAlt};
  expect(before.photos.map(p => p.publicId)).toEqual(['b', 'c']);
  expect(before.drafts.altById.b).toBe('B draft');
  expect(signal.aborted).toBe(true);
  await act(async () => {
    if (outcome === 'success') pending.resolve({product: product('A', [photo('stale-a')]), variants: []});
    else pending.reject(error('PRODUCT_NOT_FOUND', 404));
    await request;
  });
  expect({photos: hook.result.current.photos, drafts: hook.result.current.drafts,
    feedback: hook.result.current.feedback, guard: hook.result.current.guard,
    operation: hook.result.current.operation, editor: hook.result.current.editingAlt}).toEqual(before);
});

test.each(['success', 'failure'] as const)('delayed A mutation %s cannot overwrite B or release B active operation', async outcome => {
  const old = deferred<Awaited<ReturnType<typeof updateProductPhotoAlt>>>();
  const next = deferred<Awaited<ReturnType<typeof updateProductPhotoAlt>>>();
  alt.mockReturnValueOnce(old.promise).mockReturnValueOnce(next.promise);
  const hook = setup(props('A', [photo('a')]));
  act(() => hook.result.current.startAlt('a'));
  act(() => hook.result.current.setDrafts(d => ({...d, altById: {a: 'A draft'}})));
  let aRequest!: Promise<void>;
  act(() => {aRequest = hook.result.current.saveAlt();});
  const aSignal = alt.mock.calls[0][0].signal!;
  hook.rerender(props('B', [photo('b')]));
  expect(hook.result.current.operation).toBeNull();
  act(() => hook.result.current.startAlt('b'));
  act(() => hook.result.current.setDrafts(d => ({...d, altById: {b: 'B draft'}})));
  let bRequest!: Promise<void>;
  act(() => {bRequest = hook.result.current.saveAlt();});
  const before = {photos: hook.result.current.photos, drafts: hook.result.current.drafts,
    feedback: hook.result.current.feedback, guard: hook.result.current.guard};
  expect(aSignal.aborted).toBe(true);
  await act(async () => {
    if (outcome === 'success') old.resolve({product: product('A', [photo('stale-a')])});
    else old.reject(error('PRODUCT_NOT_FOUND', 404));
    await aRequest;
  });
  expect({photos: hook.result.current.photos, drafts: hook.result.current.drafts,
    feedback: hook.result.current.feedback, guard: hook.result.current.guard}).toEqual(before);
  expect(hook.result.current.operation).toBe('alt');
  await act(async () => {next.resolve({product: product('B', [{...photo('b'), alt: 'B saved'}])}); await bRequest;});
  expect(hook.result.current.photos[0].alt).toBe('B saved');
  expect(hook.result.current.operation).toBeNull();
});

test('unmount aborts the operation signal and suppresses late access callbacks', async () => {
  const pending = deferred<Awaited<ReturnType<typeof deleteProductPhoto>>>();
  const access = jest.fn(() => false);
  const input = {...props('A', [photo('a')]), onAccessError: access};
  remove.mockReturnValueOnce(pending.promise);
  const hook = renderHook(() => useProductMediaController(input));
  let request!: ReturnType<typeof hook.result.current.remove>;
  act(() => {request = hook.result.current.remove('a');});
  const signal = remove.mock.calls[0][0].signal!;
  hook.unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => {pending.reject(error('PRODUCT_NOT_FOUND', 404)); await request;});
  expect(access).not.toHaveBeenCalled();
});
test('activation snapshot sees local file selection and mutation before parent risk effects run',async()=>{
 const pending=deferred<{upload:ProductMediaUploadDescriptor}>();sign.mockReturnValue(pending.promise);const hook=setup();
 act(()=>{hook.result.current.selectFile(file());expect(hook.result.current.getActivationGuardSnapshot().hasUnsavedWork).toBe(true);});
 act(()=>{void hook.result.current.upload();expect(hook.result.current.getActivationGuardSnapshot().pendingMutation).toBe(true);});
 await act(async()=>pending.reject(error('SIGN_FAILED',400)));
});
