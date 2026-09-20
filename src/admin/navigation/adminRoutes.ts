import { matchPath } from 'react-router-dom';

export const adminRoutes = {
  root: '/admin',
  products: '/admin/produkty',
  productNew: '/admin/produkty/novy',
  productDetail: '/admin/produkty/:productId',
  reservations: '/admin/rezervace',
  reservationDetail: '/admin/rezervace/:reservationId',
  calendar: '/admin/kalendar',
} as const;

export type AdminNavigationKey = 'overview' | 'products' | 'reservations' | 'calendar';

export const adminNavigationItems: ReadonlyArray<{ key: AdminNavigationKey; label: string; to: string }> = [
  { key: 'overview', label: 'Přehled', to: adminRoutes.root },
  { key: 'products', label: 'Produkty', to: adminRoutes.products },
  { key: 'reservations', label: 'Rezervace', to: adminRoutes.reservations },
  { key: 'calendar', label: 'Kalendář', to: adminRoutes.calendar },
];

export function resolveAdminNavigation(pathname: string): AdminNavigationKey | null {
  if (matchPath({ path: adminRoutes.root, end: true }, pathname)) return 'overview';
  if (matchPath({ path: '/admin/produkty/*', end: false }, pathname)) return 'products';
  if (matchPath({ path: '/admin/rezervace/*', end: false }, pathname)) return 'reservations';
  if (matchPath({ path: adminRoutes.calendar, end: true }, pathname)) return 'calendar';
  return null;
}

export function resolveAdminPageTitle(pathname: string) {
  if (matchPath({ path: adminRoutes.productNew, end: true }, pathname)) return 'Nový produkt';
  if (matchPath({ path: adminRoutes.productDetail, end: true }, pathname)) return 'Detail produktu';
  if (matchPath({ path: adminRoutes.products, end: true }, pathname)) return 'Produkty';
  if (matchPath({ path: adminRoutes.reservationDetail, end: true }, pathname)) return 'Detail rezervace';
  if (matchPath({ path: adminRoutes.reservations, end: true }, pathname)) return 'Rezervace';
  if (matchPath({ path: adminRoutes.calendar, end: true }, pathname)) return 'Kalendář';
  return 'Přehled administrace';
}