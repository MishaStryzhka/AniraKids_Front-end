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

const Main = styled.main`
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

export function StorefrontLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, token } = useAuth();
  const authModal = useContext(ModalAuthContext);
  const isDesktop = useMediaQuery(`(min-width: ${t.breakpoint.lg})`);

  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>('none');
  const [productPrimaryCategory, setProductPrimaryCategory] = useState<ProductPrimaryCategory | null>(null);
  const [query, setQuery] = useState('');

  const searchStatus: SearchStatus = 'idle';
  const suggestions: readonly SearchProductSuggestion[] = [];
  const hasActiveReservationDraft = false;

  const focusOriginRef = useRef<HTMLElement | null>(null);
  const focusOriginOverlayRef = useRef<Exclude<ActiveOverlay, 'none'> | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const previousDesktopRef = useRef(isDesktop);

  const authState: AuthNavigationState = isLoggedIn
    ? 'authenticated'
    : token
      ? 'unresolved'
      : 'guest';

  const currentPrimaryNavigation = resolvePrimaryNavigation(location.pathname, productPrimaryCategory);

  const requestOverlay = useCallback((overlay: Exclude<ActiveOverlay, 'none'>) => {
    const selector = overlay === 'menu' ? '[data-menu-trigger]' : '[data-search-trigger]';
    focusOriginRef.current = firstVisible(selector);
    focusOriginOverlayRef.current = overlay;
    setActiveOverlay(overlay);
  }, []);

  const closeOverlay = useCallback((options?: { restoreFocus?: boolean }) => {
    const origin = focusOriginRef.current;
    const originOverlay = focusOriginOverlayRef.current;

    focusOriginRef.current = null;
    focusOriginOverlayRef.current = null;
    setActiveOverlay('none');

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
    if (activeOverlay !== 'none') closeOverlay({ restoreFocus: false });
    // location.key changes for browser Back/Forward as well as ordinary route navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  useEffect(() => {
    const wasDesktop = previousDesktopRef.current;
    previousDesktopRef.current = isDesktop;

    if (!wasDesktop && isDesktop && activeOverlay === 'menu') {
      closeOverlay({ restoreFocus: false });
      window.requestAnimationFrame(() => {
        firstVisible('[data-brand-logo]')?.focus({ preventScroll: true });
      });
    }
  }, [activeOverlay, closeOverlay, isDesktop]);

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
    <>
      <StorefrontHeader
        activeOverlay={activeOverlay}
        currentPrimaryNavigation={currentPrimaryNavigation}
        authState={authState}
        hasActiveReservationDraft={hasActiveReservationDraft}
        onRequestOverlay={requestOverlay}
        onCloseOverlay={() => closeOverlay()}
        onOpenAuth={openAuth}
      />

      {activeOverlay === 'menu' && !isDesktop ? (
        <MobileMenu
          authState={authState}
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
    </>
  );
}
