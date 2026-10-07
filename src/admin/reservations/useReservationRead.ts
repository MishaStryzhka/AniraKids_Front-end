import { useEffect, useRef, useState } from 'react';
import { AdminApiError } from '../api/errors';
type State<T> =
  | { kind: 'loading'; key: string; ownerToken: string }
  | { kind: 'success'; key: string; ownerToken: string; data: T }
  | { kind: 'error' | 'not-found'; key: string; ownerToken: string };
interface Input<T> {
  requestKey: string;
  token: string;
  revision: number;
  read(signal: AbortSignal): Promise<T>;
  onAccessError(error: unknown): boolean;
  allowNotFound?: boolean;
  enabled?: boolean;
}
/** Request ownership is local to one read-only reservation view. */
export function useReservationRead<T>(input: Input<T>) {
  const key = `${input.requestKey}:${input.revision}`;
  const [state, setState] = useState<State<T>>({
    kind: 'loading',
    key,
    ownerToken: input.token,
  });
  const latest = useRef({ ...input, key });
  latest.current = { ...input, key };
  const sequence = useRef(0);
  const { token, onAccessError, allowNotFound, enabled = true } = input;
  useEffect(() => {
    const controller = new AbortController(),
      generation = ++sequence.current;
    const owns = () =>
      !controller.signal.aborted &&
      generation === sequence.current &&
      latest.current.key === key &&
      latest.current.token === token;
    setState({ kind: 'loading', key, ownerToken: token });
    if (token && enabled) {
      const read = latest.current.read;
      Promise.resolve()
        .then(() => read(controller.signal))
        .then(data => {
          if (owns())
            setState({ kind: 'success', key, ownerToken: token, data });
        })
        .catch(error => {
          if (!owns() || onAccessError(error)) return;
          const missing =
            allowNotFound &&
            error instanceof AdminApiError &&
            (error.status === 404 ||
              (error.status === 400 && error.code === 'INVALID_ID'));
          setState({
            kind: missing ? 'not-found' : 'error',
            key,
            ownerToken: token,
          });
        });
    }
    return () => controller.abort();
  }, [key, token, onAccessError, allowNotFound, enabled]);
  return enabled && state.key === key && state.ownerToken === token
    ? state
    : { kind: 'loading' as const, key, ownerToken: token };
}
