import { useCallback, useEffect, useRef, useState } from 'react';
import { getCatalogue, type Catalogue, type CatalogueQuery } from './api/publicApi';

export function useInfiniteCatalogue(key: string | null) {
  const current = useRef(key); current.current = key;
  const engine = useRef<{ key: string; load: () => void } | null>(null);
  const [state, setState] = useState<{ key: string | null; data: Catalogue | null; error: unknown; busy: boolean }>({ key: null, data: null, error: null, busy: false });
  useEffect(() => {
    if (key === null) return;
    const controller = new AbortController();
    const query: CatalogueQuery = JSON.parse(key);
    let data: Catalogue | null = null, busy = false;
    const owns = () => !controller.signal.aborted && current.current === key;
    const load = async () => {
      if (!owns() || busy || (data && data.page >= data.totalPages)) return;
      busy = true;
      setState({ key, data, error: null, busy: true });
      try {
        const next = await getCatalogue({ ...query, page: data ? data.page + 1 : 1 }, controller.signal);
        if (!owns()) return;
        const items = new Map((data?.items || []).map(item => [item.id, item]));
        next.items.forEach(item => items.set(item.id, item));
        data = { ...next, items: Array.from(items.values()) };
        setState({ key, data, error: null, busy: false });
      } catch (error) {
        if (owns()) setState({ key, data, error, busy: false });
      } finally { busy = false; }
    };
    engine.current = { key, load };
    void load();
    return () => { controller.abort(); };
  }, [key]);
  const loadMore = useCallback(() => {
    if (engine.current?.key === current.current) engine.current?.load();
  }, []);
  const owned = key !== null && state.key === key;
  const data = owned ? state.data : null;
  return { data, error: owned ? state.error : null,
    loading: key !== null && (!owned || (state.busy && !data)),
    loadingMore: owned && state.busy && !!data,
    hasMore: !!data && data.page < data.totalPages, loadMore, reload: loadMore };
}
