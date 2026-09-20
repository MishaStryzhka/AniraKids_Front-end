import { Menu, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Container } from '../../../design-system/components/Container';
import { IconButton } from '../../../design-system/components/IconButton';
import { designTokens as t } from '../../../design-system/tokens/designTokens';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import type { ActiveOverlay, AuthNavigationState, PrimaryNavigationKey } from '../../../navigation/routes';
import { setInert } from '../hooks/useInert';
import { BrandLogo } from './BrandLogo';
import { DesktopPrimaryNavigation } from './DesktopPrimaryNavigation';
import { DesktopUtilities } from './DesktopUtilities';
import { ReservationUtility } from './ReservationUtility';

const Shell = styled.header<{ $scrolled: boolean }>`
  position: sticky;
  inset-block-start: 0;
  z-index: var(--layer-sticky);
  padding-block-start: env(safe-area-inset-top);
  background: ${t.color.bg.surface};
  box-shadow: ${({ $scrolled }) => $scrolled ? t.shadow.sm : t.shadow.none};
  font-family: ${t.font.family.ui};

  &::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    block-size: 1px;
    background: ${t.color.border.subtle};
    pointer-events: none;
  }

  @media (min-width: ${t.breakpoint.lg}) {
    padding-block-start: 0;
  }
`;

const MobileRow = styled(Container)`
  block-size: 60px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding-inline: ${t.container.padding.mobile};

  @media (min-width: ${t.breakpoint.md}) { padding-inline: ${t.container.padding.md}; }
  @media (min-width: ${t.breakpoint.lg}) { display: none; }
`;

const Left = styled.div`justify-self: start;`;
const Centre = styled.div`justify-self: center; min-inline-size: 0;`;
const Right = styled.div`justify-self: end; display: flex; align-items: center; gap: ${t.space[1]};`;

const DesktopRow = styled(Container)`
  display: none;

  @media (min-width: ${t.breakpoint.lg}) {
    block-size: 72px;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    column-gap: ${t.space[8]};
  }
`;

const PrimaryWrap = styled.div`min-inline-size: 0;`;

export interface StorefrontHeaderProps {
  activeOverlay: ActiveOverlay;
  currentPrimaryNavigation: PrimaryNavigationKey | null;
  authState: AuthNavigationState;
  hasActiveReservationDraft: boolean;
  onRequestOverlay(overlay: Exclude<ActiveOverlay, 'none'>): void;
  onCloseOverlay(): void;
  onOpenAuth(): void;
}

export function StorefrontHeader({
  activeOverlay,
  currentPrimaryNavigation,
  authState,
  hasActiveReservationDraft,
  onRequestOverlay,
  onCloseOverlay,
  onOpenAuth,
}: StorefrontHeaderProps) {
  const isDesktop = useMediaQuery(`(min-width: ${t.breakpoint.lg})`);
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 0);
  const mobileLeftRef = useRef<HTMLDivElement>(null);
  const mobileLogoRef = useRef<HTMLDivElement>(null);
  const mobileRightRef = useRef<HTMLDivElement>(null);
  const desktopLogoRef = useRef<HTMLDivElement>(null);
  const desktopPrimaryRef = useRef<HTMLDivElement>(null);
  const desktopUtilitiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    const menuOpen = activeOverlay === 'menu';
    const searchOpen = activeOverlay === 'search';
    const mobileLeft = mobileLeftRef.current;
    const mobileLogo = mobileLogoRef.current;
    const mobileRight = mobileRightRef.current;
    const desktopLogo = desktopLogoRef.current;
    const desktopPrimary = desktopPrimaryRef.current;
    const desktopUtilities = desktopUtilitiesRef.current;

    setInert(mobileLeft, searchOpen);
    setInert(mobileLogo, menuOpen || searchOpen);
    setInert(mobileRight, menuOpen || searchOpen);

    const desktopHeaderInert = isDesktop && (searchOpen || menuOpen);
    setInert(desktopLogo, desktopHeaderInert);
    setInert(desktopPrimary, desktopHeaderInert);
    setInert(desktopUtilities, desktopHeaderInert);

    return () => {
      [mobileLeft, mobileLogo, mobileRight, desktopLogo, desktopPrimary, desktopUtilities]
        .forEach(element => setInert(element, false));
    };
  }, [activeOverlay, isDesktop]);

  const menuOpen = activeOverlay === 'menu';

  return (
    <Shell $scrolled={scrolled} data-storefront-header>
      <MobileRow>
        <Left ref={mobileLeftRef}>
          <IconButton
            aria-label={menuOpen ? 'Zavřít menu' : 'Otevřít menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            icon={menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            variant="ghost"
            data-menu-trigger
            onClick={() => menuOpen ? onCloseOverlay() : onRequestOverlay('menu')}
          />
        </Left>

        <Centre ref={mobileLogoRef}><BrandLogo /></Centre>

        <Right ref={mobileRightRef}>
          <IconButton
            aria-label="Hledat"
            icon={<Search aria-hidden="true" />}
            variant="ghost"
            data-search-trigger
            onClick={() => onRequestOverlay('search')}
          />
          <ReservationUtility hasActiveDraft={hasActiveReservationDraft} presentation="collapsed" />
        </Right>
      </MobileRow>

      <DesktopRow>
        <div ref={desktopLogoRef}><BrandLogo /></div>
        <PrimaryWrap ref={desktopPrimaryRef}>
          <DesktopPrimaryNavigation currentPrimaryNavigation={currentPrimaryNavigation} />
        </PrimaryWrap>
        <div ref={desktopUtilitiesRef}>
          <DesktopUtilities
            authState={authState}
            hasActiveReservationDraft={hasActiveReservationDraft}
            onSearchOpen={() => onRequestOverlay('search')}
            onOpenAuth={onOpenAuth}
          />
        </div>
      </DesktopRow>
    </Shell>
  );
}
