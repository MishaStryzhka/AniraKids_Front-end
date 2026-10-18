import {SiteSettingsProvider} from '../siteSettings/SiteSettingsProvider';
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { designTokens as t } from '../design-system/tokens/designTokens';
import { Footer } from '../components/navigation/Footer/Footer';
import { MobileMenu } from '../components/navigation/MobileMenu/MobileMenu';
import { DesktopSearchLayer } from '../components/navigation/Search/DesktopSearchLayer';
import { MobileSearchShell } from '../components/navigation/Search/MobileSearchShell';
import type { SearchProductSuggestion, SearchStatus } from '../components/navigation/Search/SearchContent';
import { StorefrontHeader } from '../components/navigation/StorefrontHeader/StorefrontHeader';
import { setInert } from '../components/navigation/hooks/useInert';
import { useScrollLock } from '../components/navigation/hooks/useScrollLock';
import { ModalAuthContext } from '../context/ModalAuthContext';
import {
  routes,
  resolvePrimaryNavigation,
  type ActiveOverlay,
  type AuthNavigationState,
  type ProductPrimaryCategory,
} from '../navigation/routes';
import { useContext } from 'react';
import { useBookingOptional } from '../storefront/booking/BookingProvider';
import { getCatalogue } from '../storefront/api/publicApi';
import { usePublicRead } from '../storefront/usePublicRead';
import { useAdminEntryAccess } from '../admin/auth/useAdminEntryAccess';
import {usePartnerEntryAccess} from '../partner/usePartnerEntryAccess';

const placeholderImage: string = require('../images/photo-plug.jpg');

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  min-block-size: 100vh;
  min-block-size: 100dvh;
`;

const Main = styled.main`
  flex: 1 0 auto;
  min-inline-size: 0;
  min-block-size: 1px;
`;

export interface StorefrontOutletContextValue {
  productPrimaryCategory: ProductPrimaryCategory | null;
  setProductPrimaryCategory(value: ProductPrimaryCategory | null): void;
}

export function useStorefrontOutletContext() {
  return useOutletContext<StorefrontOutletContextValue>();
}

function isVisible(element: HTMLElement | null) {
  return Boolean(element && element.isConnected && element.getClientRects().length > 0);
}

function firstVisible(selector: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).find(isVisible) ?? null;
}

function canReceiveFocus(element: HTMLElement | null) {
  return Boolean(element && isVisible(element) && !element.closest('[inert]'));
}

export function StorefrontLayout() { return <SiteSettingsProvider><StorefrontShell/></SiteSettingsProvider>; }
function StorefrontShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, token } = useAuth();
  const canAccessAdmin = useAdminEntryAccess();
  const canAccessPartner=usePartnerEntryAccess();
  const adminHref=canAccessAdmin?'/admin':'/partner/blaze';
  const authModal = useContext(ModalAuthContext);
  const isDesktop = useMediaQuery(`(min-width: ${t.breakpoint.lg})`);

  const [overlay, setOverlay] = useState<{ type: ActiveOverlay; entry: string }>({ type: 'none', entry: location.key });
  // Release the scroll lock in the same commit as navigation, before the
  // shared route restoration runs. Closing it in a later effect restores stale scroll.
  const activeOverlay = overlay.entry === location.key ? overlay.type : 'none';
  const [productPrimaryCategory, setProductPrimaryCategory] = useState<ProductPrimaryCategory | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const normalizedQuery = query.trim();
  useEffect(() => {
    if (activeOverlay !== 'search') {
      setDebouncedQuery('');
      return;
    }
    const timer = window.setTimeout(() => setDebouncedQuery(normalizedQuery), 250);
    return () => window.clearTimeout(timer);
  }, [activeOverlay, normalizedQuery]);
  const searchKey = activeOverlay === 'search' && normalizedQuery.length >= 2 &&
    debouncedQuery === normalizedQuery ? normalizedQuery : null;
  const searchResult = usePublicRead(searchKey, signal => getCatalogue({
    q: normalizedQuery, sort: 'name', page: 1, limit: 4,
  }, signal));
  const searchStatus: SearchStatus = normalizedQuery.length < 2 ? 'idle' :
    !searchKey || searchResult.loading ? 'loading' : searchResult.error ? 'error' :
      searchResult.data?.items.length ? 'results' : 'empty';
  const suggestions: readonly SearchProductSuggestion[] = searchResult.data?.items.map(product => ({
    slug: product.slug,
    name: product.name,
    image: { src: product.photos[0]?.url || placeholderImage, alt: product.photos[0]?.alt || product.name },
    meta: product.color || '',
  })) ?? [];
  const hasActiveReservationDraft = useBookingOptional()?.hasActiveDraft ?? false;

  const focusOriginRef = useRef<HTMLElement | null>(null);
  const focusOriginOverlayRef = useRef<Exclude<ActiveOverlay, 'none'> | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const previousDesktopRef = useRef(isDesktop);
  const pendingResponsiveFocusRef = useRef(false);

  const authState: AuthNavigationState = isLoggedIn
    ? 'authenticated'
    : token
      ? 'unresolved'
      : 'guest';

  const currentPrimaryNavigation = resolvePrimaryNavigation(location.pathname, productPrimaryCategory, location.search);

  const requestOverlay = useCallback((overlay: Exclude<ActiveOverlay, 'none'>) => {
    if (overlay === 'search') {
      setQuery(location.pathname === routes.search ? new URLSearchParams(location.search).get('q') || '' : '');
    }
    const selector = overlay === 'menu' ? '[data-menu-trigger]' : '[data-search-trigger]';
    focusOriginRef.current = firstVisible(selector);
    focusOriginOverlayRef.current = overlay;
    setOverlay({ type: overlay, entry: location.key });
  }, [location.key, location.pathname, location.search]);

  const closeOverlay = useCallback((options?: { restoreFocus?: boolean }) => {
    const origin = focusOriginRef.current;
    const originOverlay = focusOriginOverlayRef.current;

    focusOriginRef.current = null;
    focusOriginOverlayRef.current = null;
    setOverlay(previous => ({ ...previous, type: 'none' }));

    if (options?.restoreFocus === false) return;

    window.requestAnimationFrame(() => {
      if (isVisible(origin)) {
        origin?.focus({ preventScroll: true });
        return;
      }

      if (originOverlay === 'search') {
        firstVisible('[data-search-trigger]')?.focus({ preventScroll: true });
        return;
      }

      if (originOverlay === 'menu') {
        firstVisible('[data-brand-logo]')?.focus({ preventScroll: true });
      }
    });
  }, []);

  useScrollLock(activeOverlay === 'menu' || (activeOverlay === 'search' && !isDesktop));

  useEffect(() => {
    const inert = activeOverlay !== 'none';
    const main = mainRef.current;
    const footer = footerRef.current;

    setInert(main, inert);
    setInert(footer, inert);

    return () => {
      setInert(main, false);
      setInert(footer, false);
    };
  }, [activeOverlay]);

  useEffect(() => {
    closeOverlay({ restoreFocus: false });
    // location.key changes for browser Back/Forward as well as ordinary route navigation.
  }, [location.key, closeOverlay]);

  useEffect(() => {
    const wasDesktop = previousDesktopRef.current;
    previousDesktopRef.current = isDesktop;

    if (!wasDesktop && isDesktop && activeOverlay === 'menu') {
      pendingResponsiveFocusRef.current = true;
      closeOverlay({ restoreFocus: false });
    }
  }, [activeOverlay, closeOverlay, isDesktop]);

  useEffect(() => {
    if (!isDesktop || activeOverlay !== 'none' || !pendingResponsiveFocusRef.current) return;

    const target = firstVisible('[data-brand-logo]');
    if (!canReceiveFocus(target)) return;

    pendingResponsiveFocusRef.current = false;
    target?.focus({ preventScroll: true });
  }, [activeOverlay, isDesktop]);

  useLayoutEffect(() => {
    setProductPrimaryCategory(null);
  }, [location.pathname]);

  const openAuth = useCallback(() => {
    authModal?.setIsOpenModalAuth(true);
  }, [authModal]);

  const loginFromMenu = useCallback(() => {
    closeOverlay({ restoreFocus: false });
    authModal?.setIsOpenModalAuth(true);
  }, [authModal, closeOverlay]);

  const submitSearch = useCallback(() => {
    const trimmed = query.trim();
    const suffix = trimmed ? `?q=${encodeURIComponent(trimmed)}` : '';
    navigate(`${routes.search}${suffix}`);
  }, [navigate, query]);

  const outletValue = useMemo<StorefrontOutletContextValue>(() => ({
    productPrimaryCategory,
    setProductPrimaryCategory,
  }), [productPrimaryCategory]);

  return (
    <Shell>
      <StorefrontHeader
        activeOverlay={activeOverlay}
        currentPrimaryNavigation={currentPrimaryNavigation}
        authState={authState}
        canAccessAdmin={canAccessAdmin||canAccessPartner}
        adminHref={adminHref}
        hasActiveReservationDraft={hasActiveReservationDraft}
        onRequestOverlay={requestOverlay}
        onCloseOverlay={() => closeOverlay()}
        onOpenAuth={openAuth}
      />

      {activeOverlay === 'menu' && !isDesktop ? (
        <MobileMenu
          authState={authState}
          canAccessAdmin={canAccessAdmin||canAccessPartner}
          adminHref={adminHref}
          currentPrimaryNavigation={currentPrimaryNavigation}
          onLogin={loginFromMenu}
          onClose={() => closeOverlay()}
        />
      ) : null}

      {activeOverlay === 'search'
        ? isDesktop
          ? (
            <DesktopSearchLayer
              query={query}
              status={searchStatus}
              suggestions={suggestions}
              onQueryChange={setQuery}
              onSubmit={submitSearch}
              onClose={() => closeOverlay()}
            />
          )
          : (
            <MobileSearchShell
              query={query}
              status={searchStatus}
              suggestions={suggestions}
              onQueryChange={setQuery}
              onSubmit={submitSearch}
              onClose={() => closeOverlay()}
            />
          )
        : null}

      <Main ref={mainRef}>
        <Suspense fallback={null}>
          <Outlet context={outletValue} />
        </Suspense>
      </Main>
      <Footer ref={footerRef} />
    </Shell>
  );
}
