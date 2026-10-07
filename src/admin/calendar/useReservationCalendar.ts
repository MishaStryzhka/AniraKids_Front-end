import {useEffect, useRef, useState} from 'react';
import {getAdminReservationCalendar, type CalendarReservation} from '../api/reservationCalendar';
import {calendarMonthRange, type CalendarMonth} from './calendarDates';
interface Input {month: CalendarMonth; token: string; revision: number; onAccessError(error: unknown): boolean;}
type State =
  | {kind: 'loading'; key: string; ownerToken: string}
  | {kind: 'error'; key: string; ownerToken: string}
  | {kind: 'success'; key: string; ownerToken: string; items: CalendarReservation[]; loadedAt: Date};
export function useReservationCalendar({month, token, revision, onAccessError}: Input) {
  const key = `${month}:${revision}`;
  const [state, setState] = useState<State>({kind: 'loading', key, ownerToken: token});
  const latest = useRef({key, token}); latest.current = {key, token};
  const sequence = useRef(0);
  useEffect(() => {
    const controller = new AbortController(), generation = ++sequence.current;
    const ownsRequest = () => !controller.signal.aborted && sequence.current === generation && latest.current.key === key && latest.current.token === token;
    setState({kind: 'loading', key, ownerToken: token});
    if (!token) return () => controller.abort();
    getAdminReservationCalendar({token, ...calendarMonthRange(month), signal: controller.signal}).then(response => {
      if (ownsRequest()) setState({kind: 'success', key, ownerToken: token, items: response.items, loadedAt: new Date()});
    }).catch(error => {
      if (!ownsRequest()) return;
      if (onAccessError(error)) return;
      setState({kind: 'error', key, ownerToken: token});
    });
    return () => controller.abort();
  }, [key, month, token, onAccessError]);
  // Rendering a new key is immediately loading, before the new effect runs.
  return state.key === key && state.ownerToken === token ? state : {kind: 'loading' as const, key, ownerToken: token};
}
