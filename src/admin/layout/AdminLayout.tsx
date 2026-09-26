import { Menu, X } from 'lucide-react';
import { createContext, useContext, useEffect, useLayoutEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { IconButton } from '../../design-system/components/IconButton';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { AdminNavigation } from '../navigation/AdminNavigation';
import { resolveAdminPageTitle } from '../navigation/adminRoutes';

const Shell = styled.div`
  min-block-size: 100vh;
  min-inline-size: 0;
  background: ${t.color.bg.canvas};
  color: ${t.color.text.primary};
  font-family: ${t.font.family.ui};

  @media (min-width: ${t.breakpoint.lg}) {
    display: grid;
    grid-template-columns: 248px minmax(0, 1fr);
  }
`;

const Sidebar = styled.aside`
  display: none;
  background: ${t.color.bg.surface};
  border-inline-end: 1px solid ${t.color.border.subtle};
  padding: ${t.space[6]} ${t.space[4]};

  @media (min-width: ${t.breakpoint.lg}) {
    display: block;
    min-block-size: 100vh;
  }
`;

const SidebarTitle = styled.p`
  margin: 0 0 ${t.space[6]};
  font-size: ${t.type.bodyLg.size};
  line-height: ${t.type.bodyLg.lineHeight};
  font-weight: ${t.font.weight.semibold};
`;

const MobileHeader = styled.header`
  min-block-size: 60px;
  display: flex;
  align-items: center;
  gap: ${t.space[3]};
  padding-inline: ${t.container.padding.mobile};
  background: ${t.color.bg.surface};
  border-block-end: 1px solid ${t.color.border.subtle};

  @media (min-width: ${t.breakpoint.md}) { padding-inline: ${t.container.padding.md}; }
  @media (min-width: ${t.breakpoint.lg}) { display: none; }
`;

const MobileTitle = styled.span`
  font-size: ${t.type.bodyMd.size};
  line-height: ${t.type.bodyMd.lineHeight};
  font-weight: ${t.font.weight.semibold};
`;

const MobileNavigationRegion = styled.div`
  padding: ${t.space[3]} ${t.container.padding.mobile} ${t.space[4]};
  background: ${t.color.bg.surface};
  border-block-end: 1px solid ${t.color.border.subtle};

  @media (min-width: ${t.breakpoint.md}) { padding-inline: ${t.container.padding.md}; }
  @media (min-width: ${t.breakpoint.lg}) { display: none; }
`;

const Content = styled.div`min-inline-size: 0;`;

const PageHeader = styled.div`
  padding: ${t.space[6]} ${t.container.padding.mobile} ${t.space[4]};
  display: grid;
  gap: ${t.space[4]};
  align-items: center;

  @media (min-width: ${t.breakpoint.md}) {
    grid-template-columns: minmax(0, 1fr) auto;
    padding-inline: ${t.container.padding.md};
  }

  @media (min-width: ${t.breakpoint.lg}) {
    padding: ${t.space[8]} ${t.container.padding.lg} ${t.space[6]};
  }

  @media (min-width: ${t.breakpoint.xl}) { padding-inline: ${t.container.padding.xl}; }
`;

const PageAction = styled.div`
  min-inline-size: 0;
  justify-self: start;

  @media (min-width: ${t.breakpoint.md}) {
    justify-self: end;
  }
`;

const Heading = styled.h1`
  margin: 0;
  font-family: ${t.font.family.ui};
  font-size: 28px;
  line-height: 36px;
  font-weight: ${t.font.weight.semibold};
`;

const Main = styled.main`
  min-inline-size: 0;
  padding: 0 ${t.container.padding.mobile} ${t.space[8]};
  @media (min-width: ${t.breakpoint.md}) { padding-inline: ${t.container.padding.md}; }
  @media (min-width: ${t.breakpoint.lg}) { padding-inline: ${t.container.padding.lg}; }
  @media (min-width: ${t.breakpoint.xl}) { padding-inline: ${t.container.padding.xl}; }
`;

type AdminPageActionSetter = Dispatch<SetStateAction<ReactNode>>;
const AdminPageActionContext = createContext<AdminPageActionSetter | null>(null);

export function useAdminPageAction(action: ReactNode) {
  const setPageAction = useContext(AdminPageActionContext);

  useLayoutEffect(() => {
    if (!setPageAction) return;
    setPageAction(action);
    return () => setPageAction(null);
  }, [action, setPageAction]);
}

export function AdminLayout() {
  const location = useLocation();
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [pageAction, setPageAction] = useState<ReactNode>(null);
  const pageTitle = resolveAdminPageTitle(location.pathname);

  useEffect(() => { setMobileNavigationOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavigationOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileNavigationOpen(false);
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[data-admin-nav-toggle]')?.focus({ preventScroll: true });
      });
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileNavigationOpen]);

  return (
    <Shell data-admin-layout>
      <Sidebar data-admin-sidebar>
        <SidebarTitle>Administrace</SidebarTitle>
        <AdminNavigation />
      </Sidebar>

      <AdminPageActionContext.Provider value={setPageAction}>
      <Content>
        <MobileHeader data-admin-mobile-header>
          <IconButton
            aria-label={mobileNavigationOpen ? 'Zavřít navigaci administrace' : 'Otevřít navigaci administrace'}
            aria-expanded={mobileNavigationOpen}
            aria-controls="admin-mobile-navigation"
            data-admin-nav-toggle
            icon={mobileNavigationOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            onClick={() => setMobileNavigationOpen(value => !value)}
          />
          <MobileTitle>Administrace</MobileTitle>
        </MobileHeader>

        {mobileNavigationOpen ? (
          <MobileNavigationRegion id="admin-mobile-navigation">
            <AdminNavigation />
          </MobileNavigationRegion>
        ) : null}

        <PageHeader>
          <Heading data-admin-page-title>{pageTitle}</Heading>
          {pageAction ? <PageAction data-admin-page-action>{pageAction}</PageAction> : null}
        </PageHeader>

        <Main><Outlet /></Main>
      </Content>
      </AdminPageActionContext.Provider>
    </Shell>
  );
}