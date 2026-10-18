import {CalendarClock} from 'lucide-react';
import { LayoutDashboard, Shirt, ClipboardList, CalendarDays, Settings, ArrowLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import type { MouseEvent } from 'react';
import styled from 'styled-components';
import { Divider } from '../../design-system/components/Divider';
import { NavigationLink } from '../../design-system/components/NavigationLink';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { adminNavigationItems, resolveAdminNavigation } from './adminRoutes';
import {useAdminPermissions,permissionForPath} from '../auth/permissions';

const Root = styled.nav`
  display: grid;
  gap: ${t.space[1]};
  font-family: ${t.font.family.ui};
`;

const AdminLink = styled(NavigationLink)`
  gap: 12px;
  svg { flex-shrink: 0; }
  inline-size: 100%;
  min-block-size: 44px;
  padding-inline: ${t.space[3]};
  border-radius: ${t.radius[2]};
  color: ${t.color.text.secondary};

  &[aria-current='page'] {
    color: ${t.color.text.primary};
    background: ${t.color.bg.subtle};
    font-weight: ${t.font.weight.semibold};
  }

  &:hover { background: ${t.color.bg.subtle}; }
`;

const BackLink = styled(NavigationLink)`
  gap: 12px;
  svg { flex-shrink: 0; }
  inline-size: 100%;
  min-block-size: 44px;
  padding-inline: ${t.space[3]};
  color: ${t.color.text.secondary};
`;

const SpacedDivider = styled(Divider)`
  margin-block: ${t.space[3]};
`;

const icons = {fittings: CalendarClock,overview: LayoutDashboard, products: Shirt, reservations: ClipboardList, calendar: CalendarDays, settings: Settings};

export function AdminNavigation({ onNavigate }: { onNavigate?: () => void } = {}) {
  const location = useLocation();
  const access=useAdminPermissions();
  const current = resolveAdminNavigation(location.pathname);
  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) onNavigate?.();
  };

  return (
    <Root aria-label="Navigace administrace">
      {adminNavigationItems.filter(item=>access.owner||access.permissions.includes(permissionForPath(item.to)!)).map(item => {const Icon=icons[item.key]; return (
        <AdminLink
          key={item.key}
          variant="plain"
          to={item.to}
          onClick={navigate}
          aria-current={current === item.key ? 'page' : undefined}
        >
          <Icon size={20} strokeWidth={1.7} aria-hidden="true"/>{item.label}
        </AdminLink>
      );})}
      <SpacedDivider />
      <BackLink variant="plain" to="/" onClick={navigate}><ArrowLeft size={20} strokeWidth={1.7} aria-hidden="true"/>Zpět na web</BackLink>
    </Root>
  );
}
