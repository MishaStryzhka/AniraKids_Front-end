import {createContext, useCallback, useContext, useEffect, useState, type ReactNode} from 'react';
import {useLocation} from 'react-router-dom';
import {Button} from '../design-system/components/Button';
import {primaryNavigationItems, routes} from '../navigation/routes';
import {Page, Title, Copy, Actions, RouteLink} from '../storefront/storefrontStyles';
import {defaultSiteSections, defaultCatalogueFilters, readPublicSiteSettings, type SiteSections, type CatalogueFilters} from './siteSettings';

interface SettingsState {cooperationActive?:boolean;sections: SiteSections; filters:CatalogueFilters; loading: boolean; error: boolean; reload(): void;}
const closed: SiteSections = {girlsDresses:false,womenDresses:false,suits: false, familyLooks: false};
const Context = createContext<SettingsState>({sections: defaultSiteSections, filters:defaultCatalogueFilters, loading: false, error: false, reload() {}});
export const useSiteSettings = () => useContext(Context);

export function SiteSettingsProvider({children}: {children: ReactNode}) {
  const {pathname} = useLocation();
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({sections: closed, filters:defaultCatalogueFilters, loading: true, error: false});
  const reload = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    window.addEventListener('focus', reload);
    return () => window.removeEventListener('focus', reload);
  }, [reload]);
  useEffect(() => {
    const controller = new AbortController();
    readPublicSiteSettings(controller.signal).then(settings => {
      if (!controller.signal.aborted) setState({...settings, loading: false, error: false});
    }).catch(() => {
      if (!controller.signal.aborted) setState({sections: closed, filters:defaultCatalogueFilters, loading: false, error: true});
    });
    return () => controller.abort();
  }, [pathname, revision]);
  return <Context.Provider value={{...state, reload}}>{children}</Context.Provider>;
}
export function useSiteNavigation() {
  const {sections} = useSiteSettings();
  return primaryNavigationItems.filter(item =>
    item.key === 'saty' ? sections.girlsDresses : item.key === 'damskeSaty' ? sections.womenDresses : item.key === 'obleky' ? sections.suits : item.key === 'familyLooks' ? sections.familyLooks : true);
}
export function SiteSectionGate({section, children}: {section: keyof SiteSections; children: ReactNode}) {
  const {sections, loading, error, reload} = useSiteSettings();
  if (loading) return <Page><Copy role="status">Načítání sekce…</Copy></Page>;
  if (error) return <Page><Title>Sekci se nepodařilo načíst</Title><Button onClick={reload}>Zkusit znovu</Button></Page>;
  if (!sections[section]) return <Page><Title>Tato sekce momentálně není dostupná</Title><Copy>Prohlédněte si naši aktuální nabídku.</Copy><Actions><RouteLink to={routes.newArrivals}>Přejít do nabídky</RouteLink></Actions></Page>;
  return <>{children}</>;
}
