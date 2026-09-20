import { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { Divider } from '../../../design-system/components/Divider';
import { NavigationLink } from '../../../design-system/components/NavigationLink';
import { designTokens as t } from '../../../design-system/tokens/designTokens';
import { primaryNavigationItems, routes, type AuthNavigationState, type PrimaryNavigationKey } from '../../../navigation/routes';
import { useFocusScope } from '../hooks/useFocusScope';

const Layer = styled.nav`
  position: fixed;
  inset-inline: 0;
  inset-block-start: calc(env(safe-area-inset-top) + 60px);
  inset-block-end: 0;
  z-index: var(--layer-navigation);
  overflow-y: auto;
  overscroll-behavior: contain;
  background: ${t.color.bg.surface};
  font-family: ${t.font.family.ui};
  padding: ${t.space[6]} ${t.container.padding.mobile} calc(${t.space[8]} + env(safe-area-inset-bottom));

  @media (min-width: ${t.breakpoint.md}) {
    padding-inline: ${t.container.padding.md};
  }

  @media (min-width: ${t.breakpoint.lg}) {
    display: none;
  }
`;

const Inner = styled.div`
  inline-size: 100%;
  max-inline-size: ${t.container.max};
  margin-inline: auto;
`;

const Group = styled.section`
  display: grid;
  gap: ${t.space[2]};
`;

const GroupLabel = styled.h2`
  margin: 0;
  color: ${t.color.text.secondary};
  font-size: ${t.type.caption.size};
  line-height: ${t.type.caption.lineHeight};
  font-weight: ${t.type.caption.weight};
  letter-spacing: ${t.type.caption.letterSpacing};
`;

const GroupList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuLink = styled(NavigationLink)<{ $browse?: boolean }>`
  inline-size: 100%;
  min-block-size: ${t.control.height.compact};
  font-family: ${t.font.family.ui};
  font-size: ${({ $browse }) => $browse ? t.type.bodyLg.size : t.type.bodyMd.size};
  line-height: ${({ $browse }) => $browse ? t.type.bodyLg.lineHeight : t.type.bodyMd.lineHeight};
  font-weight: ${t.font.weight.regular};
  color: ${t.color.text.primary};
`;

const Action = styled.button`
  inline-size: 100%;
  min-block-size: ${t.control.height.compact};
  padding: 0;
  border: 0;
  border-radius: ${t.radius[1]};
  display: flex;
  align-items: center;
  color: ${t.color.text.primary};
  background: transparent;
  font-family: ${t.font.family.ui};
  font-size: ${t.type.bodyMd.size};
  line-height: ${t.type.bodyMd.lineHeight};
  font-weight: ${t.type.bodyMd.weight};
  text-align: start;
  cursor: pointer;

  &:hover { color: ${t.color.action.ghost.fg}; }
  &:active { color: ${t.color.action.primary.bgActive}; }
  &:focus-visible { outline: ${t.focus.ring.width} solid ${t.color.focus.ring}; outline-offset: ${t.focus.ring.offset}; }
`;

const Separator = styled(Divider)`margin-block: ${t.space[6]};`;

export interface MobileMenuProps {
  authState: AuthNavigationState;
  currentPrimaryNavigation: PrimaryNavigationKey | null;
  onLogin(): void;
  onClose(): void;
}

export function MobileMenu({ authState, currentPrimaryNavigation, onLogin, onClose }: MobileMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const getContainers = useCallback(() => {
    const trigger = Array.from(document.querySelectorAll<HTMLElement>('[data-menu-trigger]'))
      .find(element => element.getClientRects().length > 0) ?? null;
    return [trigger, rootRef.current].filter((value): value is HTMLElement => Boolean(value));
  }, []);
  const getInitialFocus = useCallback(() => {
    return Array.from(document.querySelectorAll<HTMLElement>('[data-menu-trigger]'))
      .find(element => element.getClientRects().length > 0) ?? null;
  }, []);

  useFocusScope({ active: true, getContainers, getInitialFocus, onEscape: onClose });

  return (
    <Layer id="mobile-menu" ref={rootRef} aria-label="Menu">
      <Inner>
        <Group aria-labelledby="mobile-menu-account">
          <GroupLabel id="mobile-menu-account">Účet</GroupLabel>
          <GroupList>
            {authState === 'authenticated' ? (
              <>
                <li><MenuLink variant="plain" to={routes.account}>Můj účet</MenuLink></li>
                <li><MenuLink variant="plain" to={routes.accountReservations}>Moje rezervace</MenuLink></li>
              </>
            ) : authState === 'guest' ? (
              <li><Action type="button" onClick={onLogin}>Přihlásit se</Action></li>
            ) : null}
            <li><MenuLink variant="plain" to={routes.favourites}>Oblíbené</MenuLink></li>
          </GroupList>
        </Group>

        <Separator />

        <Group aria-labelledby="mobile-menu-browse">
          <GroupLabel id="mobile-menu-browse">Procházet</GroupLabel>
          <GroupList>
            {primaryNavigationItems.map(item => (
              <li key={item.key}>
                <MenuLink
                  variant="plain"
                  to={item.to}
                  $browse
                  aria-current={item.key === currentPrimaryNavigation ? 'page' : undefined}
                >
                  {item.label}
                </MenuLink>
              </li>
            ))}
          </GroupList>
        </Group>

        <Separator />

        <Group aria-labelledby="mobile-menu-help">
          <GroupLabel id="mobile-menu-help">Pomoc</GroupLabel>
          <GroupList>
            <li><MenuLink variant="plain" to={routes.rentalHowItWorks}>Jak funguje pronájem</MenuLink></li>
            <li><MenuLink variant="plain" to={routes.faq}>FAQ</MenuLink></li>
            <li><MenuLink variant="plain" to={routes.contact}>Kontakt</MenuLink></li>
          </GroupList>
        </Group>
      </Inner>
    </Layer>
  );
}
