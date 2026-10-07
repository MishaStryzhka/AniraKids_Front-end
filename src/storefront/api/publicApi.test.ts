import {
  getCatalogue,
  getPublicProduct,
  getAvailability,
  postReservation,
  parseCatalogue,
  parseProduct,
  parseAvailability,
  parseReceipt,
  PublicApiError,
} from './publicApi';
import { product, body, quote, receipt } from '../booking/bookingFixtures';
const fetchMock = jest.fn(),
  query = { sort: 'name' as const, page: 1, limit: 12 };
const response = (value: unknown, status = 200) => ({
  ok: status < 400,
  status,
  json: async () => value,
});
beforeEach(() => {
  process.env.REACT_APP_V2_API_BASE_URL = 'https://public.test/api/v2/';
  global.fetch = fetchMock;
  fetchMock.mockReset();
});
test('public reads use exact queries and omit all credentials and Authorization', async () => {
  fetchMock.mockResolvedValueOnce(
    response({ items: [product], page: 1, limit: 12, total: 1, totalPages: 1 })
  );
  await getCatalogue({ ...query, q: 'Sofia' });
  expect(fetchMock.mock.calls[0][0]).toBe(
    'https://public.test/api/v2/catalogue/products?sort=name&page=1&limit=12&q=Sofia'
  );
  expect(fetchMock.mock.calls[0][1]).toEqual(
    expect.objectContaining({
      credentials: 'omit',
      headers: { Accept: 'application/json' },
    })
  );
  fetchMock.mockResolvedValueOnce(response({ product }));
  expect(await getPublicProduct('sofia')).toEqual(product);
  fetchMock.mockResolvedValueOnce(response({ availability: quote }));
  expect(await getAvailability(body)).toEqual(quote);
  expect(fetchMock.mock.calls[2][0]).not.toContain('customer');
  expect(fetchMock.mock.calls[2][0]).not.toContain('example.test');
  expect(fetchMock.mock.calls[2][0]).toContain(
    'startDate=2030-10-10&endDate=2030-10-11'
  );
});
test('POST sends only approved body and key; receipt removes guest token and customer data', async () => {
  fetchMock.mockResolvedValue(
    response(
      {
        reservation: { ...receipt, customer: body.customer },
        guestAccessToken: 'secret-token',
      },
      201
    )
  );
  expect(await postReservation(body, 'key')).toEqual(receipt);
  expect(fetchMock.mock.calls[0][1]).toEqual(
    expect.objectContaining({
      credentials: 'omit',
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Idempotency-Key': 'key',
      },
    })
  );
});
test('receipt accepts later status and changed authoritative price on replay', () => {
  const later = {
    ...receipt,
    status: 'confirmed',
    subtotal: 700,
    totalDue: 1700,
    item: { ...receipt.item, rentalPrice: 700 },
  };
  expect(parseReceipt({ reservation: later }, body)).toEqual(later);
});
test.each([
  { ...receipt, item: { ...receipt.item, variantId: product.variants[1].id } },
  { ...receipt, totalDue: 1501 },
  { ...receipt, subtotal: 499 },
  { ...receipt, deposit: -1 },
  { ...receipt, startDate: '2030-02-30' },
  { ...receipt, rentalMode: 'other' },
  { ...receipt, expiresAt: undefined },
])('malformed or different receipt cannot confirm success %#', value => {
  expect(() => parseReceipt({ reservation: value }, body)).toThrow(
    PublicApiError
  );
});
test('malformed catalogue, pricing, availability identity and duplicate products fail closed', () => {
  expect(() =>
    parseCatalogue(
      {
        items: [product, product],
        page: 1,
        limit: 12,
        total: 2,
        totalPages: 1,
      },
      query
    )
  ).toThrow();
  expect(() =>
    parseCatalogue(
      { items: [], page: 2, limit: 12, total: 0, totalPages: 0 },
      query
    )
  ).toThrow();
  expect(() =>
    parseProduct({
      product: {
        ...product,
        variants: [
          {
            ...product.variants[0],
            pricing: {
              studio: { rentalPrice: 1, deposit: 2, totalDue: 4 },
              external: null,
            },
          },
        ],
      },
    })
  ).toThrow();
  expect(() =>
    parseAvailability(
      { availability: { ...quote, endDate: '2030-10-12' } },
      body
    )
  ).toThrow();
  expect(() =>
    parseProduct({
      product: {
        ...product,
        photos: [{ url: ['java', 'script:alert(1)'].join('') }],
      },
    })
  ).toThrow();
});
test('no configured API causes no request; errors expose safe code only', async () => {
  delete process.env.REACT_APP_V2_API_BASE_URL;
  await expect(getPublicProduct('sofia')).rejects.toMatchObject({
    code: 'NOT_CONFIGURED',
  });
  expect(fetchMock).not.toHaveBeenCalled();
  process.env.REACT_APP_V2_API_BASE_URL = 'https://public.test/api/v2';
  fetchMock.mockResolvedValue(
    response(
      { error: { code: 'NO_AVAILABLE_INVENTORY', message: 'private' } },
      409
    )
  );
  await expect(postReservation(body, 'key')).rejects.toMatchObject({
    code: 'NO_AVAILABLE_INVENTORY',
    message: 'NO_AVAILABLE_INVENTORY',
    status: 409,
  });
});
