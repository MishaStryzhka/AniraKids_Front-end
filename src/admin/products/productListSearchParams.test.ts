import {
  buildProductListSearchParams,
  canonicalizeProductListSearchParams,
  countActiveProductFilters,
  parseProductListSearchParams,
  toAdminProductListQuery,
} from './productListSearchParams';

test('parses only supported canonical browser state', () => {
  const state = parseProductListSearchParams(new URLSearchParams(
    'status=active&category=dress&gender=girls&rentalEnabled=false&page=4&limit=50&search=x&saleEnabled=true'
  ));

  expect(state).toEqual({
    status: 'active',
    category: 'dress',
    gender: 'girls',
    rentalEnabled: false,
    page: 4,
  });
  expect(countActiveProductFilters(state)).toBe(4);
});

test('canonicalization removes unknown, invalid, default page and browser-controlled limit', () => {
  const result = canonicalizeProductListSearchParams(new URLSearchParams(
    'limit=50&status=invalid&category=suit&page=1&unknown=yes'
  ));

  expect(result.changed).toBe(true);
  expect(result.searchParams.toString()).toBe('category=suit');
  expect(result.state.page).toBe(1);
});

test('invalid pages normalize to page 1 and page 1 is omitted from canonical URL', () => {
  for (const value of ['0', '-1', '1.5', 'nope']) {
    const state = parseProductListSearchParams(new URLSearchParams(`page=${value}`));
    expect(state.page).toBe(1);
    expect(buildProductListSearchParams(state).has('page')).toBe(false);
  }
});

test('API mapping cannot forward browser-only or unknown keys', () => {
  const state = parseProductListSearchParams(new URLSearchParams(
    'status=archived&rentalEnabled=true&page=2&limit=100&saleEnabled=false&search=hello'
  ));

  expect(toAdminProductListQuery(state)).toEqual({
    status: 'archived',
    rentalEnabled: true,
    page: 2,
  });
});
