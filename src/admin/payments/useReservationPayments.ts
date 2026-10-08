import {
  loadPaymentAttempt,
  savePaymentAttempt,
} from './paymentAttemptStorage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  appendReservationPayment,
  getReservationPayments,
  operationMatches,
  type PaymentOperation,
  type ReservationPayments,
} from '../api/reservationPayments';
import { AdminApiError } from '../api/errors';
import type { ReservationMutationLock } from './paymentModel';
type Owner = { reservationId: string; token: string; adminId: string };
type State = {
  owner: Owner;
  payments: ReservationPayments | null;
  loading: boolean;
  writing: boolean;
  error: string | null;
  attempt: PaymentOperation | null;
  conflict: boolean;
  announcement: string;
  focus: number;
  version: string | null;
  replayReady: boolean;
  storageBlocked: boolean;
};
const initial = (owner: Owner): State => ({
  owner,
  payments: null,
  loading: false,
  writing: false,
  error: null,
  attempt: null,
  conflict: false,
  announcement: '',
  focus: 0,
  version: null,
  replayReady: false,
  storageBlocked: false,
});
export function useReservationPayments(input: {
  reservationId: string;
  token: string;
  adminId: string;
  onAccessError(error: unknown): boolean;
  mutationLock: ReservationMutationLock;
  canWrite(): boolean;
  version: string | null;
}) {
  const owner = useMemo(
    () => ({
      reservationId: input.reservationId,
      token: input.token,
      adminId: input.adminId,
    }),
    [input.reservationId, input.token, input.adminId]
  );
  const latest = useRef({ owner, input });
  latest.current = { owner, input };
  const mounted = useRef(false),
    request = useRef<AbortController | null>(null),
    generation = useRef(0);
  const [state, setState] = useState(() => initial(owner)),
    current = useRef(state);
  const commit = useCallback(
    (update: (s: State) => State) => {
      if (!mounted.current || latest.current.owner !== owner) return;
      const next = update(current.current);
      current.current = next;
      setState(next);
    },
    [owner]
  );
  const ownsView = useCallback(
    () => mounted.current && latest.current.owner === owner,
    [owner]
  );
  const read = useCallback(
    async (manual = true) => {
      if (
        !ownsView() ||
        request.current ||
        !owner.token ||
        latest.current.input.version === null ||
        latest.current.input.mutationLock.current
      )
        return;
      const version = latest.current.input.version;
      const controller = new AbortController(),
        epoch = ++generation.current;
      request.current = controller;
      commit(s => ({ ...s, loading: true, error: null, announcement: '' }));
      const owns = () =>
        ownsView() &&
        request.current === controller &&
        epoch === generation.current &&
        version === latest.current.input.version &&
        !controller.signal.aborted;
      try {
        const payments = await getReservationPayments({
          ...owner,
          signal: controller.signal,
        });
        if (!owns()) return;
        let attempt = current.current.attempt,
          storageBlocked = false;
        try {
          if (current.current.storageBlocked && !attempt)
            attempt = loadPaymentAttempt(owner.adminId, owner.reservationId);
        } catch {
          storageBlocked = true;
        }
        const entry = attempt
          ? payments.entries.find(e => e.operationId === attempt!.operationId)
          : undefined;
        let resolved = Boolean(
          entry && attempt && operationMatches(entry, attempt)
        );
        try {
          if (resolved)
            savePaymentAttempt(owner.adminId, owner.reservationId, null);
          else if (attempt)
            savePaymentAttempt(owner.adminId, owner.reservationId, attempt);
        } catch {
          resolved = false;
          storageBlocked = true;
        }
        commit(s => ({
          ...s,
          payments,
          version,
          storageBlocked,
          replayReady: Boolean(attempt && !entry && !storageBlocked),
          loading: false,
          conflict: false,
          attempt: resolved ? null : attempt,
          error: storageBlocked
            ? 'Platební operaci nelze bezpečně uložit v prohlížeči. Další zápis je zablokovaný.'
            : entry && !resolved
              ? 'Původní operace má odlišné údaje. Další zápis je zablokovaný.'
              : null,
          announcement: resolved
            ? 'Původní operace je zaznamenána v platební historii.'
            : 'Aktuální platební evidence byla načtena.',
          focus: manual ? s.focus + 1 : s.focus,
        }));
      } catch (error) {
        if (!owns() || latest.current.input.onAccessError(error)) return;
        commit(s => ({
          ...s,
          loading: false,
          error:
            'Platební evidenci se nepodařilo načíst. Zkuste to prosím znovu.',
          focus: manual ? s.focus + 1 : s.focus,
        }));
      } finally {
        if (request.current === controller) request.current = null;
      }
    },
    [owner, commit, ownsView]
  );
  useEffect(() => {
    mounted.current = true;
    const value = initial(owner);
    try {
      value.attempt = loadPaymentAttempt(owner.adminId, owner.reservationId);
    } catch {
      value.storageBlocked = true;
      value.error =
        'Původní platební operaci se nepodařilo bezpečně načíst. Další zápis je zablokovaný.';
    }
    current.current = value;
    setState(value);

    return () => {
      mounted.current = false;
      generation.current += 1;
      request.current?.abort();
      request.current = null;
      if (input.mutationLock.current === 'payments')
        input.mutationLock.current = null;
    };
  }, [owner, read, input.mutationLock]);
  useEffect(() => {
    if (request.current && !current.current.writing) {
      request.current.abort();
      request.current = null;
      generation.current += 1;
    }
    void read(false);
  }, [input.version, owner, read]);
  const write = async (operation: PaymentOperation, replay = false) => {
    const before = current.current;
    if (
      !ownsView() ||
      request.current ||
      before.writing ||
      before.loading ||
      before.storageBlocked ||
      Boolean(before.error) ||
      !before.payments ||
      before.version !== latest.current.input.version ||
      before.payments.legacyUnreconciled ||
      before.conflict ||
      latest.current.input.mutationLock.current ||
      !latest.current.input.canWrite() ||
      (!replay && before.attempt) ||
      (replay && (before.attempt !== operation || !before.replayReady))
    )
      return false;
    try {
      savePaymentAttempt(owner.adminId, owner.reservationId, operation);
    } catch {
      commit(s => ({
        ...s,
        storageBlocked: true,
        error:
          'Platební operaci nelze bezpečně uložit v prohlížeči. Požadavek nebyl odeslán.',
        focus: s.focus + 1,
      }));
      return false;
    }
    const controller = new AbortController(),
      epoch = ++generation.current;
    request.current = controller;
    latest.current.input.mutationLock.current = 'payments';
    commit(s => ({
      ...s,
      writing: true,
      error: null,
      announcement: '',
      attempt: operation,
      replayReady: false,
    }));
    const owns = () =>
      ownsView() &&
      request.current === controller &&
      generation.current === epoch &&
      !controller.signal.aborted;
    try {
      const payments = await appendReservationPayment({
        ...owner,
        operation,
        signal: controller.signal,
      });
      if (!owns()) return false;
      try {
        savePaymentAttempt(owner.adminId, owner.reservationId, null);
      } catch {
        commit(s => ({
          ...s,
          payments,
          writing: false,
          storageBlocked: true,
          error:
            'Operace byla zaznamenána, ale bezpečné uložení v prohlížeči selhalo. Načtěte platební evidenci.',
          focus: s.focus + 1,
        }));
        return false;
      }
      commit(s => ({
        ...s,
        payments,
        writing: false,
        attempt: null,
        conflict: false,
        announcement:
          'Operace byla zaznamenána. Evidence sama neprovádí bankovní převod.',
        focus: s.focus + 1,
      }));
      return true;
    } catch (error) {
      if (!owns() || latest.current.input.onAccessError(error)) return false;
      const code = error instanceof AdminApiError ? error.code : '';
      let definite =
        error instanceof AdminApiError &&
        error.status !== null &&
        error.status < 500 &&
        [
          'PAYMENT_CONFLICT',
          'PAYMENT_LIMIT_EXCEEDED',
          'PAYMENT_NOT_ALLOWED',
          'PAYMENT_LEGACY_RECONCILIATION_REQUIRED',
          'VALIDATION_ERROR',
        ].includes(code);
      let storageBlocked = false;
      if (definite) {
        try {
          savePaymentAttempt(owner.adminId, owner.reservationId, null);
        } catch {
          definite = false;
          storageBlocked = true;
        }
      }
      const message =
        code === 'PAYMENT_CONFLICT'
          ? 'Platební evidence se změnila. Načtěte aktuální stav.'
          : code === 'PAYMENT_LIMIT_EXCEEDED'
            ? 'Částka přesahuje povolený zůstatek. Načtěte aktuální stav.'
            : code === 'PAYMENT_NOT_ALLOWED'
              ? 'Tuto operaci nyní nelze provést. Načtěte aktuální stav.'
              : code === 'PAYMENT_LEGACY_RECONCILIATION_REQUIRED'
                ? 'Starší platby je třeba nejprve účetně ověřit. Další zápis je zablokovaný.'
                : code === 'VALIDATION_ERROR'
                  ? 'Zkontrolujte údaje platební operace.'
                  : code === 'PAYMENT_IDEMPOTENCY_CONFLICT'
                    ? 'Původní operace má odlišné údaje. Další zápis je zablokovaný.'
                    : 'Požadavek mohl být zpracován. Načtěte platební evidenci před dalším zápisem.';
      commit(s => ({
        ...s,
        writing: false,
        storageBlocked,
        error: message,
        attempt: definite ? null : s.attempt,
        conflict: definite,
        focus: s.focus + 1,
      }));
      return false;
    } finally {
      if (request.current === controller) {
        request.current = null;
        if (latest.current.input.mutationLock.current === 'payments')
          latest.current.input.mutationLock.current = null;
      }
    }
  };
  return {
    ...(state.owner === owner ? state : initial(owner)),
    payments:
      state.owner === owner && state.version === input.version
        ? state.payments
        : null,
    read,
    write,
    ownsView,
    canWriteNow: () =>
      ownsView() &&
      Boolean(current.current.payments) &&
      current.current.version === latest.current.input.version &&
      !current.current.error &&
      !current.current.storageBlocked &&
      !request.current &&
      !current.current.attempt &&
      !current.current.conflict,
  };
}
