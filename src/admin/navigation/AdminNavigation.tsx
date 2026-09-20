import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Divider } from '../../design-system/components/Divider';
import { NavigationLink } from '../../design-system/components/NavigationLink';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { adminNavigationItems, resolveAdminNavigation } from './adminRoutes';

const Root = styled.nav`
  display: grid;
  gap: ${t.space[1]};
  font-family: ${t.font.family.ui};
`;

const AdminLink = styled(NavigationLink)`
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
  inline-size: 100%;
  min-block-size: 44px;
  padding-inline: ${t.space[3]};
  color: ${t.color.text.secondary};
`;

const SpacedDivider = styled(Divider)`
  margin-block: ${t.space[3]};
`;

export function AdminNavigation() {
  const location = useLocation();
  const current = resolveAdminNavigation(location.pathname);

  return (
    <Root aria-label="Navigace administrace">
      {adminNavigationItems.map(item => (
        <AdminLink
          key={item.key}
          variant="plain"
          to={item.to}
          aria-current={current === item.key ? 'page' : undefined}
        >
          {item.label}
        </AdminLink>
      ))}
      <SpacedDivider />
      <BackLink variant="plain" to="/">Zpět na web</BackLink>
    </Root>
  );
}