import { routes } from '../navigation/routes';

const cataloguePaths = new Set<string>([
  routes.dresses, routes.suits, routes.newArrivals, routes.search,
  routes.favourites, '/forWomen', '/forMen', '/forChildren',
  '/popular', '/decorAndToys',
]);

/** Keep catalogue filters when returning from a product or reservation. */
export function getCatalogueReturnTo(state: unknown, category?: string): string {
  const fallback = category === 'dress' ? routes.dresses
    : category === 'suit' ? routes.suits : routes.newArrivals;
  if (!state || typeof state !== 'object' || Array.isArray(state)) return fallback;
  const candidate = (state as { catalogueReturnTo?: unknown }).catalogueReturnTo;
  if (typeof candidate !== 'string' || !candidate.startsWith('/') ||
      candidate.startsWith('//') || candidate.includes('\\')) return fallback;
  try {
    const url = new URL(candidate, 'https://catalogue.invalid');
    if (url.origin === 'https://catalogue.invalid' &&
        cataloguePaths.has(url.pathname.replace(/\/$/, ''))) {
      return url.pathname + url.search;
    }
  } catch {
    // Old or malformed history state must not prevent catalogue navigation.
  }
  return fallback;
}
