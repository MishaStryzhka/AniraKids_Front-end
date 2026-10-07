import { adminApiClient, buildAdminRequestConfig } from './client';
import {
  createAvailabilityBlock,
  deleteAvailabilityBlock,
  getAvailabilityBlocks,
  parseAvailabilityBlocks,
} from './availabilityBlocks';
import {
  blockFixture as block,
  validBlockDraft as draft,
} from '../availability/blockFixtures';
jest.mock('./client', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
  buildAdminRequestConfig: jest.fn(),
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
const get = adminApiClient.get as jest.Mock,
  post = adminApiClient.post as jest.Mock,
  remove = adminApiClient.delete as jest.Mock;
beforeEach(() => {
  jest.clearAllMocks();
  (buildAdminRequestConfig as jest.Mock).mockImplementation(
    (token, signal) => ({
      headers: { Authorization: `Bearer ${token}` },
      signal,
    })
  );
});
test('list omits from/to for server Prague default and preserves inclusive source dates', async () => {
  get.mockResolvedValue({ data: { items: [block] } });
  const signal = new AbortController().signal;
  expect(
    await getAvailabilityBlocks({
      token: 'token',
      inventoryItemId: 'i1',
      signal,
    })
  ).toEqual([block]);
  expect(get).toHaveBeenCalledWith(
    '/admin/inventory-items/i1/availability-blocks',
    { headers: { Authorization: 'Bearer token' }, signal }
  );
});
test('create trims optional notes and validates201 receipt; delete expects204 without parsingJSON', async () => {
  post.mockResolvedValue({ status: 201, data: { availabilityBlock: block } });
  await createAvailabilityBlock({
    token: 'token',
    inventoryItemId: 'i1',
    body: { ...draft, notes: '  Kontrola zipu  ' },
  });
  expect(post).toHaveBeenCalledWith(
    '/admin/inventory-items/i1/availability-blocks',
    draft,
    expect.any(Object)
  );
  remove.mockResolvedValue({ status: 204 });
  await deleteAvailabilityBlock({ token: 'token', blockId: 'b1' });
  expect(remove).toHaveBeenCalledWith(
    '/admin/availability-blocks/b1',
    expect.any(Object)
  );
  remove.mockResolvedValue({ status: 200 });
  await expect(
    deleteAvailabilityBlock({ token: 'token', blockId: 'b1' })
  ).rejects.toMatchObject({ code: 'ADMIN_BLOCK_INVALID_RESPONSE' });
});
test.each([
  null,
  { items: {} },
  { items: [{ ...block, inventoryItemId: 'wrong' }] },
  { items: [block, block] },
  { items: [{ ...block, startDate: '2026-02-30' }] },
  { items: [{ ...block, notes: 42 }] },
])('malformed lists fail closed (%j)', value =>
  expect(() => parseAvailabilityBlocks(value, 'i1')).toThrow()
);
test.each([
  { inventoryItemId: 'wrong' },
  { startDate: '2026-10-09' },
  { endDate: '2026-10-12' },
  { reason: 'other' },
  { notes: 'different' },
])('mismatched create receipt is ambiguous (%j)', async patch => {
  post.mockResolvedValue({
    status: 201,
    data: { availabilityBlock: { ...block, ...patch } },
  });
  await expect(
    createAvailabilityBlock({
      token: 'token',
      inventoryItemId: 'i1',
      body: draft,
    })
  ).rejects.toMatchObject({ code: 'ADMIN_BLOCK_INVALID_RESPONSE' });
  expect(post).toHaveBeenCalledTimes(1);
});
