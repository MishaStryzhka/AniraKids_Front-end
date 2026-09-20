export type PrimaryNavigationKey = 'saty' | 'obleky' | 'novinky' | 'pronajem';
export type ProductPrimaryCategory = 'saty' | 'obleky';
export type ActiveOverlay = 'none' | 'menu' | 'search';
export type AuthNavigationState = 'unresolved' | 'guest' | 'authenticated';

export const routes = {
  home: '/',
  dresses: '/saty',
  suits: '/obleky',
  newArrivals: '/novinky',
  rental: '/pronajem',
  rentalHowItWorks: '/pronajem#jak-funguje-pronajem',
  search: '/hledani',
  favourites: '/oblibene',
  reservation: '/rezervace',
  account: '/ucet',
  accountReservations: '/ucet/rezervace',
  faq: '/faq',
  rentalTerms: '/podminky-pronajmu',
  contact: '/kontakt',
  terms: '/obchodni-podminky',
  privacy: '/ochrana-osobnich-udaju',
  cookies: '/cookies',
  productPattern: '/produkt/:slug',
} as const;

export function productPath(slug: string) {
  return `/produkt/${encodeURIComponent(slug)}`;
}

export const primaryNavigationItems: ReadonlyArray<{
  key: PrimaryNavigationKey;
  label: string;
  to: string;
}> = [
  { key: 'saty', label: 'Dívčí šaty', to: routes.dresses },
  { key: 'obleky', label: 'Chlapecké obleky', to: routes.suits },
  { key: 'novinky', label: 'Novinky', to: routes.newArrivals },
  { key: 'pronajem', label: 'Pronájem', to: routes.rental },
];

export function resolvePrimaryNavigation(
  pathname: string,
  productPrimaryCategory: ProductPrimaryCategory | null,
): PrimaryNavigationKey | null {
  if (pathname === routes.dresses) return 'saty';
  if (pathname === routes.suits) return 'obleky';
  if (pathname === routes.newArrivals) return 'novinky';
  if (pathname === routes.rental) return 'pronajem';
  if (pathname.startsWith('/produkt/')) return productPrimaryCategory;
  return null;
}
