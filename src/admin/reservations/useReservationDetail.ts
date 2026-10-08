import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getAdminReservationDetail,
  type ReservationDetail,
} from '../api/reservations';
import {
  changeAdminReservation,
  type ReservationChange,
} from '../api/reservationMutations';
import { AdminApiError } from '../api/errors';
import {
  canChangeReservation,
  cancellationReasonError,
  reservationNotesError,
  reservationConflictMessage,
  unknownReservationOutcome,
} from './reservationLifecycleModel';
import { reservationStatus } from './reservationPresentation';
import type { ReservationMutationLock } from '../payments/paymentModel';
type Scope = { reservationId: string; token: string };
type Recovery = { kind: 'unknown' | 'conflict' | 'refresh'; message: string };
type State = {
  owner: Scope;
  kind: 'loading' | 'success' | 'error' | 'not-found';
  reservation: ReservationDetail | null;
  busy: ReservationChange['action'] | 'read' | null;
  recovery: Recovery | null;
  error: string | null;
  announcement: string;
  notesDraft: string;
  notesRevision: number;
  focus: { revision: number; target: 'status' | 'error' } | null;
};
type Request = {
  owner: Scope;
  generation: number;
  controller: AbortController;
  mutation?: boolean;
};
const initial = (owner: Scope): State => ({
  owner,
  kind: 'loading',
  reservation: null,
  busy: null,
  recovery: null,
  error: null,
  announcement: '',
  notesDraft: '',
  notesRevision: 0,
  focus: null,
});
const focus = (previous: State, target: 'status' | 'error') => ({
  revision: (previous.focus?.revision ?? 0) + 1,
  target,
});

/** A detail view owns one GET or mutation chain at a time; no mutation is retried. */
export function useReservationDetail(input: {
  reservationId: string;
  token: string;
  onAccessError(error: unknown): boolean;
  mutationLock?: ReservationMutationLock;
  canMutate?(change: ReservationChange): boolean;
}) {
  const { reservationId, token, onAccessError } = input;
  const mutationOptions = useRef(input);
  mutationOptions.current = input;
  const scope = useMemo(
    () => ({ reservationId, token }),
    [reservationId, token]
  );
  const latest = useRef(scope);
  latest.current = scope;
  const mounted = useRef<Scope | null>(null),
    request = useRef<Request | null>(null),
    generation = useRef(0);
  const [state, setState] = useState(() => initial(scope));
  const current = useRef(state);
  const commit = useCallback(
    (update: (previous: State) => State) => {
      if (latest.current !== scope || mounted.current !== scope) return;
      const value = update(current.current);
      current.current = value;
      setState(value);
    },
    [scope]
  );
  const ownsView = useCallback(
    () => latest.current === scope && mounted.current === scope,
    [scope]
  );
  const owns = useCallback(
    (value: Request) =>
      ownsView() &&
      request.current === value &&
      value.generation === generation.current &&
      !value.controller.signal.aborted,
    [ownsView]
  );
  const start = useCallback(() => {
    if (!ownsView() || !scope.token || request.current) return null;
    const value = {
      owner: scope,
      generation: ++generation.current,
      controller: new AbortController(),
    };
    request.current = value;
    return value;
  }, [scope, ownsView]);
  const release = useCallback((value: Request) => {
    if (request.current === value) {
      request.current = null;
      if (
        value.mutation &&
        mutationOptions.current.mutationLock?.current === 'reservation'
      )
        mutationOptions.current.mutationLock.current = null;
    }
  }, []);
  const accept = useCallback(
    (
      value: ReservationDetail,
      before: State,
      notesSave: boolean,
      announcement: string
    ) => {
      commit(previous => ({
        ...previous,
        kind: 'success',
        reservation: value,
        busy: null,
        recovery: null,
        error: null,
        announcement,
        notesDraft:
          previous.notesRevision === before.notesRevision &&
          (!before.reservation ||
            notesSave ||
            before.notesDraft === (before.reservation.notes ?? ''))
            ? (value.notes ?? '')
            : previous.notesDraft,
        focus:
          before.reservation && !notesSave ? focus(previous, 'status') : null,
      }));
    },
    [commit]
  );
  const read = useCallback(async () => {
    const active = start();
    if (!active) return;
    const before = current.current;
    commit(previous => ({
      ...previous,
      busy: 'read',
      error: null,
      announcement: '',
    }));
    try {
      const value = await getAdminReservationDetail({
        ...scope,
        signal: active.controller.signal,
      });
      if (!owns(active)) return;
      accept(
        value,
        before,
        false,
        before.reservation ? 'Aktuální stav rezervace byl načten.' : ''
      );
    } catch (error) {
      if (!owns(active) || onAccessError(error)) return;
      if (
        error instanceof AdminApiError &&
        (error.status === 404 ||
          (error.status === 400 && error.code === 'INVALID_ID'))
      )
        commit(previous => ({
          ...previous,
          kind: 'not-found',
          reservation: null,
          busy: null,
          recovery: null,
          error: null,
          focus: focus(previous, 'status'),
        }));
      else
        commit(previous => ({
          ...previous,
          kind: previous.reservation ? 'success' : 'error',
          busy: null,
          error: previous.reservation
            ? 'Aktuální stav rezervace se nepodařilo načíst. Zkuste to prosím znovu.'
            : null,
          focus: focus(previous, 'error'),
        }));
    } finally {
      release(active);
    }
  }, [start, scope, commit, owns, accept, onAccessError, release]);
  useEffect(() => {
    mounted.current = scope;
    const value = initial(scope);
    current.current = value;
    setState(value);
    void read();
    return () => {
      mounted.current = null;
      if (request.current?.owner === scope) {
        request.current.controller.abort();
        if (
          request.current.mutation &&
          mutationOptions.current.mutationLock?.current === 'reservation'
        )
          mutationOptions.current.mutationLock.current = null;
        request.current = null;
      }
      generation.current += 1;
    };
  }, [scope, read]);
  const change = useCallback(
    async (change: ReservationChange): Promise<boolean> => {
      const before = current.current;
      if (
        mutationOptions.current.mutationLock?.current ||
        (mutationOptions.current.canMutate &&
          !mutationOptions.current.canMutate(change)) ||
        before.owner !== scope ||
        before.kind !== 'success' ||
        !before.reservation ||
        before.busy ||
        before.recovery ||
        !canChangeReservation(before.reservation.status, change)
      )
        return false;
      if (
        (change.action === 'cancel' &&
          cancellationReasonError(change.reason ?? '')) ||
        (change.action === 'notes' && reservationNotesError(change.notes))
      )
        return false;
      const active: Request | null = start();
      if (!active) return false;
      active.mutation = true;
      if (mutationOptions.current.mutationLock)
        mutationOptions.current.mutationLock.current = 'reservation';
      commit(previous => ({
        ...previous,
        busy: change.action,
        error: null,
        announcement: '',
        focus: null,
      }));
      let received = false;
      try {
        await changeAdminReservation({
          ...scope,
          change,
          signal: active.controller.signal,
        });
        if (!owns(active)) return false;
        received = true;
        const value = await getAdminReservationDetail({
          ...scope,
          signal: active.controller.signal,
        });
        if (!owns(active)) return false;
        accept(
          value,
          before,
          change.action === 'notes',
          change.action === 'notes'
            ? 'Poznámky byly uloženy.'
            : `Aktuální stav rezervace: ${reservationStatus(value.status).label}.`
        );
        return true;
      } catch (error) {
        if (!owns(active) || onAccessError(error)) return false;
        if (error instanceof AdminApiError && error.status === 404)
          commit(previous => ({
            ...previous,
            kind: 'not-found',
            reservation: null,
            busy: null,
            recovery: null,
            error: null,
            focus: focus(previous, 'status'),
          }));
        else if (received)
          commit(previous => ({
            ...previous,
            busy: null,
            recovery: {
              kind: 'refresh',
              message:
                'Změna byla přijata. Aktuální stav rezervace se nepodařilo načíst.',
            },
            focus: focus(previous, 'error'),
          }));
        else if (error instanceof AdminApiError && error.status === 409)
          commit(previous => ({
            ...previous,
            busy: null,
            recovery: {
              kind: 'conflict',
              message: reservationConflictMessage(error),
            },
            focus: focus(previous, 'error'),
          }));
        else if (unknownReservationOutcome(error))
          commit(previous => ({
            ...previous,
            busy: null,
            recovery: {
              kind: 'unknown',
              message:
                'Požadavek mohl být zpracován. Načtěte aktuální stav rezervace před další akcí.',
            },
            focus: focus(previous, 'error'),
          }));
        else
          commit(previous => ({
            ...previous,
            busy: null,
            error: 'Změnu rezervace se nepodařilo provést.',
            focus: focus(previous, 'error'),
          }));
        return true;
      } finally {
        release(active);
      }
    },
    [scope, start, commit, owns, accept, onAccessError, release]
  );
  const setNotesDraft = useCallback(
    (value: string) =>
      commit(previous => ({
        ...previous,
        notesDraft: value,
        notesRevision: previous.notesRevision + 1,
        announcement: '',
      })),
    [commit]
  );
  return {
    ...(state.owner === scope ? state : initial(scope)),
    read,
    change,
    setNotesDraft,
    ownsView,
  };
}
