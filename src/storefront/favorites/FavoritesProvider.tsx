import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { favoritesRequest } from './favoritesApi';
import { guestFavoritesKey, readGuestFavorites, writeGuestFavorites } from './favoritesStorage';
type Value = { ids: string[]; loading: boolean; error: string; notice: string; signedIn: boolean; toggle(id: string): Promise<void>; retry(): void };
const Context = createContext<Value>({ ids: [], loading: false, error: '', notice: '', signedIn: false, toggle: async () => {}, retry: () => {} });
export const useFavorites = () => useContext(Context);
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { token, isLoggedIn } = useAuth();
  const scope = token ? (isLoggedIn ? token : 'pending') : 'guest';
  const currentScope = useRef(scope); currentScope.current = scope;
  const [revision, setRevision] = useState(0);
  const guestMemory = useRef<string[]>(readGuestFavorites());
  const [state, setState] = useState(() => ({ scope: 'guest', ids: guestMemory.current, loading: false, error: '', notice: '' }));
  const locked = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    const owns = () => !controller.signal.aborted && currentScope.current === scope;
    locked.current = false;
    if (scope === 'guest') {
      setState({ scope, ids: guestMemory.current, loading: false, error: '', notice: '' });
      const onStorage = (event: StorageEvent) => { if (event.key === guestFavoritesKey || event.key === null) { guestMemory.current = readGuestFavorites(); setState(previous => ({ ...previous, ids: guestMemory.current })); } };
      window.addEventListener('storage', onStorage);
      return () => { controller.abort(); window.removeEventListener('storage', onStorage); };
    }
    setState({ scope, ids: [], loading: true, error: '', notice: '' });
    if (scope === 'pending') return () => controller.abort();
    const guest = guestMemory.current;
    favoritesRequest(scope, guest.length ? 'POST' : 'GET', guest.length ? guest : undefined, undefined, controller.signal).then(ids => {
      if (!owns()) return;
      // Clear only the transferred snapshot, preserving changes in another guest tab.
      if (guest.length) { guestMemory.current = readGuestFavorites().filter(id => !guest.includes(id)); writeGuestFavorites(guestMemory.current); }
      setState({ scope, ids, loading: false, error: '', notice: '' });
    }).catch(error => {
      if (owns()) setState({ scope, ids: [], loading: false, error: error.message || 'Oblíbené nejsou dostupné.', notice: '' });
    });
    return () => controller.abort();
  }, [scope, revision]);
  const owned = state.scope === scope;
  const toggle = async (id: string) => {
    if (!owned || state.loading || state.error || locked.current || scope === 'pending') return;
    const selected = state.ids.includes(id);
    if (!selected && state.ids.length >= 100) {
      setState(previous => ({ ...previous, notice: 'Můžete uložit nejvýše 100 oblíbených produktů.' })); return;
    }
    if (scope === 'guest') {
      const ids = selected ? state.ids.filter(value => value !== id) : [...state.ids, id];
      guestMemory.current = ids;
      const saved = writeGuestFavorites(ids);
      setState({ scope, ids, loading: false, error: '', notice: saved ? '' : 'Prohlížeč nepovoluje ukládání. Výběr zůstane jen do zavření stránky.' });
      return;
    }
    locked.current = true;
    setState(previous => ({ ...previous, loading: true, notice: '' }));
    try {
      const ids = await favoritesRequest(scope, selected ? 'DELETE' : 'POST', selected ? undefined : [id], selected ? id : undefined);
      if (currentScope.current === scope) setState({ scope, ids, loading: false, error: '', notice: '' });
    } catch (error) {
      if (currentScope.current === scope) setState(previous => ({ ...previous, loading: false, error: error instanceof Error ? error.message : 'Oblíbené se nepodařilo uložit.' }));
    } finally { if (currentScope.current === scope) locked.current = false; }
  };
  return <Context.Provider value={{ ids: owned ? state.ids : [], loading: !owned || state.loading, error: owned ? state.error : '', notice: owned ? state.notice : '', signedIn: !!token && isLoggedIn, toggle, retry: () => setRevision(value => value + 1) }}>{children}</Context.Provider>;
}
