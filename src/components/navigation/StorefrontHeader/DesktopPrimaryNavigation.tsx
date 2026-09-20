import styled from 'styled-components';
import { NavigationLink } from '../../../design-system/components/NavigationLink';
import { designTokens as t } from '../../../design-system/tokens/designTokens';
import { primaryNavigationItems, type PrimaryNavigationKey } from '../../../navigation/routes';

const Nav = styled.nav`
  min-inline-size: 0;
`;
const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
  gap: ${t.space[2]};
  white-space: nowrap;
`;

export function DesktopPrimaryNavigation({ currentPrimaryNavigation }: { currentPrimaryNavigation: PrimaryNavigationKey | null }) {
  return (
    <Nav aria-label="Hlavní navigace">
      <List>
        {primaryNavigationItems.map(item => (
          <li key={item.key}>
            <NavigationLink
              variant="navigation"
              to={item.to}
              aria-current={item.key === currentPrimaryNavigation ? 'page' : undefined}
            >
              {item.label}
            </NavigationLink>
          </li>
        ))}
      </List>
    </Nav>
  );
}
