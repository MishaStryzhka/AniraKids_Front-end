import { Heart, LayoutDashboard, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { IconButton } from '../../../design-system/components/IconButton';
import { designTokens as t } from '../../../design-system/tokens/designTokens';
import { routes, type AuthNavigationState } from '../../../navigation/routes';
import { AccountUtility } from './AccountUtility';
import { ReservationUtility } from './ReservationUtility';
import { adminRoutes } from '../../../admin/navigation/adminRoutes';

const Utilities = styled.div`
  display: flex;
  align-items: center;
  gap: ${t.space[1]};
  white-space: nowrap;
`;

export const IconRouteLink = styled(Link)`
  inline-size: ${t.control.height.compact};
  block-size: ${t.control.height.compact};
  display: inline-grid;
  place-items: center;
  border-radius: ${t.radius[2]};
  color: ${t.color.action.ghost.fg};
  background: ${t.color.action.ghost.bg};
  text-decoration: none;
  transition:
    background-color ${t.motion.fast} ease,
    color ${t.motion.fast} ease,
    transform ${t.motion.fast} ease;

  &:hover { background: ${t.color.action.ghost.bgHover}; }
  &:active { background: ${t.color.action.ghost.bgActive}; transform: translateY(1px); }
  &:focus-visible { outline: ${t.focus.ring.width} solid ${t.color.focus.ring}; outline-offset: ${t.focus.ring.offset}; }

  & > svg {
    inline-size: ${t.icon.size.md};
    block-size: ${t.icon.size.md};
    stroke-width: ${t.icon.strokeWidth};
  }
`;

export interface DesktopUtilitiesProps {
  authState: AuthNavigationState;
  canAccessAdmin?: boolean;
  adminHref?: string;
  hasActiveReservationDraft: boolean;
  onSearchOpen(): void;
  onOpenAuth(): void;
}

export function DesktopUtilities({
  authState,
  canAccessAdmin = false,
  adminHref = adminRoutes.root,
  hasActiveReservationDraft,
  onSearchOpen,
  onOpenAuth,
}: DesktopUtilitiesProps) {
  return (
    <Utilities data-desktop-utilities>
      <IconButton
        aria-label="Hledat"
        icon={<Search aria-hidden="true" />}
        variant="ghost"
        data-search-trigger
        onClick={onSearchOpen}
      />
      <IconRouteLink to={routes.favourites} aria-label="Oblíbené">
        <Heart aria-hidden="true" />
      </IconRouteLink>
      <ReservationUtility hasActiveDraft={hasActiveReservationDraft} presentation="desktop" />
      <AccountUtility authState={authState} onOpenAuth={onOpenAuth} />
      {authState === 'authenticated' && canAccessAdmin ? (
        <IconRouteLink to={adminHref} aria-label="Administrace" title="Administrace">
          <LayoutDashboard aria-hidden="true" />
        </IconRouteLink>
      ) : null}
    </Utilities>
  );
}
