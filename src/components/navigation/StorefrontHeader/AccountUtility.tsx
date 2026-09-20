import { UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { IconButton } from '../../../design-system/components/IconButton';
import { designTokens as t } from '../../../design-system/tokens/designTokens';
import { routes, type AuthNavigationState } from '../../../navigation/routes';

const AccountLink = styled(Link)`
  inline-size: ${t.control.height.compact};
  block-size: ${t.control.height.compact};
  border-radius: ${t.radius[2]};
  display: inline-grid;
  place-items: center;
  color: ${t.color.action.ghost.fg};
  background: transparent;
  text-decoration: none;
  &:hover { background: ${t.color.action.ghost.bgHover}; }
  &:active { background: ${t.color.action.ghost.bgActive}; transform: translateY(1px); }
  &:focus-visible { outline: ${t.focus.ring.width} solid ${t.color.focus.ring}; outline-offset: ${t.focus.ring.offset}; }
  & > svg { inline-size: ${t.icon.size.md}; block-size: ${t.icon.size.md}; stroke-width: ${t.icon.strokeWidth}; }
`;
const Placeholder = styled.span`
  inline-size: ${t.control.height.compact};
  block-size: ${t.control.height.compact};
  display: inline-block;
`;

export function AccountUtility({ authState, onOpenAuth }: { authState: AuthNavigationState; onOpenAuth(): void }) {
  if (authState === 'unresolved') return <Placeholder aria-hidden="true" />;
  if (authState === 'authenticated') {
    return <AccountLink to={routes.account} aria-label="Můj účet"><UserRound aria-hidden="true" /></AccountLink>;
  }
  return <IconButton aria-label="Přihlásit se" icon={<UserRound aria-hidden="true" />} variant="ghost" onClick={onOpenAuth} />;
}
