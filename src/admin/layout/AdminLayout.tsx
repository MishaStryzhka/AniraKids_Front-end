import { Menu } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { flushSync } from 'react-dom';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import {useAdminPermissions,canAccessAdminPath} from '../auth/permissions';
import {adminNavigationItems} from '../navigation/adminRoutes';
import styled from 'styled-components';
import { IconButton } from '../../design-system/components/IconButton';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { AdminNavigation } from '../navigation/AdminNavigation';
import { AdminMobileDrawer } from '../navigation/AdminMobileDrawer';
import { useMediaQuery } from '../../hooks/useMediaQuery';
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

const Content = styled.div`min-inline-size: 0;`;

const PageHeader = styled.div<{ $compactActions: boolean }>`
  padding: ${t.space[6]} ${t.container.padding.mobile} ${t.space[4]};
  display: grid;
  gap: ${t.space[4]};
  align-items: center;
  grid-template-columns: ${p => p.$compactActions ? 'minmax(0, 1fr) auto' : 'none'};

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
  const access=useAdminPermissions();
  const allowed=canAccessAdminPath(access,location.pathname);
  const firstAllowed=adminNavigationItems.find(item=>canAccessAdminPath(access,item.to))?.to;
  const shellRef = useRef<HTMLDivElement>(null);
  const [navigationEntry, setNavigationEntry] = useState<string | null>(null);
  const isDesktop = useMediaQuery(`(min-width: ${t.breakpoint.lg})`);
  const mobileNavigationOpen = !isDesktop && navigationEntry === location.key;
  const [pageAction, setPageAction] = useState<ReactNode>(null);
  const pageTitle = resolveAdminPageTitle(location.pathname);

  const closeNavigation = useCallback(() => setNavigationEntry(null), []);
  const resolveRestoreFocus = useCallback(() => {
    const toggle = shellRef.current?.querySelector<HTMLElement>('[data-admin-nav-toggle]');
    return toggle?.getClientRects().length ? toggle : shellRef.current?.querySelector<HTMLElement>('[data-admin-sidebar] a[aria-current="page"]') ?? null;
  }, []);
  const closeBeforeNavigation = useCallback(() => {
    // Release the drawer's focus/scroll ownership before a route's leave dialog opens.
    flushSync(() => setNavigationEntry(null));
    resolveRestoreFocus()?.focus({ preventScroll: true });
  }, [resolveRestoreFocus]);
  useEffect(() => { if (isDesktop) setNavigationEntry(null); }, [isDesktop]);

  useEffect(() => {
    if (!mobileNavigationOpen) return;
    window.addEventListener('popstate', closeBeforeNavigation, true);
    return () => window.removeEventListener('popstate', closeBeforeNavigation, true);
  }, [mobileNavigationOpen, closeBeforeNavigation]);

  return (
    <Shell data-admin-layout ref={shellRef}>
      <Sidebar data-admin-sidebar>
        <SidebarTitle>ANIRAK</SidebarTitle>
        <AdminNavigation />
      </Sidebar>

      <AdminPageActionContext.Provider value={setPageAction}>
      <Content>
        <MobileHeader data-admin-mobile-header>
          <IconButton
            aria-label="Otevřít navigaci administrace"
            aria-expanded={mobileNavigationOpen}
            aria-controls={mobileNavigationOpen ? 'admin-mobile-navigation' : undefined}
            data-admin-nav-toggle
            icon={<Menu aria-hidden="true" />}
            onClick={() => setNavigationEntry(location.key)}
          />
          <MobileTitle>ANIRAK Administrace</MobileTitle>
        </MobileHeader>

        {pageTitle!=='Přehled'?<PageHeader $compactActions={pageTitle === 'Produkty'}>
          <Heading data-admin-page-title>{pageTitle}</Heading>
          {pageAction ? <PageAction data-admin-page-action>{pageAction}</PageAction> : null}
        </PageHeader>:null}

        <Main>{allowed?<Outlet/>:location.pathname==='/admin'&&firstAllowed?<Navigate to={firstAllowed} replace/>:<p role="alert">Pro tuto sekci nemáte oprávnění. Vyberte dostupnou sekci v menu.</p>}</Main>
      </Content>
      </AdminPageActionContext.Provider>
      {mobileNavigationOpen ? <AdminMobileDrawer backgroundRef={shellRef} onClose={closeNavigation}
        onNavigate={closeBeforeNavigation} resolveRestoreFocus={resolveRestoreFocus}/> : null}
    </Shell>
  );
}
