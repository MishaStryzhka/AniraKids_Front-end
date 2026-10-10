import { getCatalogueReturnTo } from './catalogueNavigation';

test.each([
  '/saty?gender=girls&size=98&sort=price-asc',
  '/obleky?color=Modr%C3%A1',
  '/hledani?q=Sofia', '/oblibene', '/novinky',
  '/forWomen?size=M', '/forMen', '/forChildren', '/popular', '/decorAndToys',
])('preserves the catalogue URL %s', catalogueReturnTo => {
  expect(getCatalogueReturnTo({ catalogueReturnTo }, 'dress')).toBe(catalogueReturnTo);
});

test.each([
  null, undefined, [], 'wrong', {}, { catalogueReturnTo: 42 },
  { catalogueReturnTo: 'https://example.com/saty' },
  { catalogueReturnTo: '//example.com/saty' },
  { catalogueReturnTo: '/\\\\example.com/saty' },
  { catalogueReturnTo: '/admin/rezervace' },
  { catalogueReturnTo: '/pronajem' },
  { catalogueReturnTo: '/rezervace' },
  { catalogueReturnTo: '/saty/../admin' },
])('falls back safely for invalid or unrelated history state: %p', state => {
  expect(getCatalogueReturnTo(state, 'dress')).toBe('/novinky?category=dress');
  expect(getCatalogueReturnTo(state, 'suit')).toBe('/obleky');
  expect(getCatalogueReturnTo(state, 'accessory')).toBe('/novinky');
  expect(getCatalogueReturnTo(state)).toBe('/novinky');
});

test('drops a stale anchor without losing filters', () => {
  expect(getCatalogueReturnTo({ catalogueReturnTo: '/saty?size=98#old' })).toBe('/saty?size=98');
});
