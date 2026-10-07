import { useEffect, useRef, useState } from 'react';
export function usePublicRead<T>(
  key: string | null,
  read: (signal: AbortSignal) => Promise<T>
) {
  const [revision, setRevision] = useState(0),
    [state, setState] = useState<{
      key: string | null;
      revision: number;
      data: T | null;
      error: unknown;
      loading: boolean;
    }>({ key: null, revision: 0, data: null, error: null, loading: false });
  const sequence = useRef(0),
    latest = useRef({ key, read, revision });
  latest.current = { key, read, revision };
  useEffect(() => {
    if (key === null) return;
    const generation = ++sequence.current,
      controller = new AbortController();
    const owns = () =>
      !controller.signal.aborted &&
      sequence.current === generation &&
      latest.current.key === key &&
      latest.current.revision === revision;
    setState({ key, revision, data: null, error: null, loading: true });
    latest.current.read(controller.signal).then(
      data => {
        if (owns())
          setState({ key, revision, data, error: null, loading: false });
      },
      error => {
        if (owns())
          setState({ key, revision, data: null, error, loading: false });
      }
    );
    return () => controller.abort();
  }, [key, revision]);
  const owned =
    key !== null && state.key === key && state.revision === revision;
  return {
    data: owned ? state.data : null,
    error: owned ? state.error : null,
    loading: key !== null && (!owned || state.loading),
    reload: () => setRevision(value => value + 1),
  };
}
