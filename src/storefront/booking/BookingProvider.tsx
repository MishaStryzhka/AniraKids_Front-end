import { parseBookingPolicy, type BookingPolicy } from '../api/bookingPolicy';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  postReservation,
  getReservationStatus,
  PublicApiError,
  sameSelection,
  type Availability,
  type PublicProduct,
} from '../api/publicApi';
import {
  contactErrors,
  initialDraft,
  loadBooking,
  newAttempt,
  persistBooking,
  reservationBody,
  selectionErrors,
  type Attempt,
  type BookingDraft,
  type ContactDraft,
  type StoredBooking,
} from './bookingModel';
const contactFields = ['firstName', 'lastName', 'email', 'phone'] as const;
type ContactField = (typeof contactFields)[number];
type ContactProfile = {
  accountId: string;
} & Partial<Record<ContactField, unknown>>;
type Prefill = {
  accountId: string | null;
  edited: Set<ContactField>;
  filled: Partial<Record<ContactField, string>>;
};
const emptyPrefill = (): Prefill => ({ accountId: null, edited: new Set(), filled: {} });
type State = {
  draft: BookingDraft | null;
  stored: StoredBooking | null;
  busy: boolean;
  storageBlocked: boolean;
  error: string | null;
};
const storageMessage =
  'Rezervaci se nepodařilo bezpečně uložit v tomto prohlížeči. Zkuste to prosím znovu. Požadavek zůstává chráněný proti opakovanému vytvoření.';
function initial(): State {
  try {
    return {
      draft: null,
      stored: loadBooking(),
      busy: false,
      storageBlocked: false,
      error: null,
    };
  } catch {
    return {
      draft: null,
      stored: null,
      busy: false,
      storageBlocked: true,
      error: storageMessage,
    };
  }
}
function knownRejection(error: unknown) {
  return (
    error instanceof PublicApiError &&
    error.status !== null &&
    error.status < 500 &&
    [
      'VALIDATION_ERROR',
      'INVALID_DATE',
      'PAST_START_DATE',
      'VARIANT_PRODUCT_MISMATCH',
      'PRODUCT_NOT_FOUND',
      'VARIANT_NOT_FOUND',
      'PRODUCT_NOT_RENTABLE',
      'VARIANT_NOT_ACTIVE',
      'NO_AVAILABLE_INVENTORY',
      'INVENTORY_ITEM_NOT_AVAILABLE',
      'TOO_MANY_ACTIVE_PENDING_RESERVATIONS',
    ].includes(error.code)
  );
}
function rejectionCopy(error: PublicApiError) {
  if (
    ['NO_AVAILABLE_INVENTORY', 'INVENTORY_ITEM_NOT_AVAILABLE'].includes(
      error.code
    )
  )
    return 'Tento termín není dostupný. Vyberte prosím jiný termín.';
  if (error.code === 'TOO_MANY_ACTIVE_PENDING_RESERVATIONS')
    return 'Pro tento e-mail už čeká více rezervací na potvrzení. Novou rezervaci nyní nelze vytvořit.';
  if (
    [
      'PRODUCT_NOT_RENTABLE',
      'PRODUCT_NOT_FOUND',
      'VARIANT_NOT_FOUND',
      'VARIANT_NOT_ACTIVE',
    ].includes(error.code)
  )
    return 'Produkt nebo vybraná velikost už není dostupná. Vyberte prosím znovu.';
  return 'Zkontrolujte prosím zadané údaje a termín pronájmu.';
}
function useBookingController(contactProfile?: ContactProfile | null) {
  const prefill = useRef<Prefill>(emptyPrefill());
  const [state, setState] = useState(initial),
    current = useRef(state),
    request = useRef<AbortController | null>(null),
    mounted = useRef(true);
  current.current = state;
  const commit = useCallback((update: (before: State) => State) => {
    if (!mounted.current) return;
    const value = update(current.current);
    current.current = value;
    setState(value);
  }, []);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!state.busy && state.stored?.kind !== 'attempt') return;
    const guard = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [state.busy, state.stored]);
  useEffect(() => {
    // Undefined means the session is refreshing; do not use stale profile data.
    if (contactProfile === undefined || !state.draft || state.stored ||
        state.busy || state.storageBlocked) return;
    const metadata = prefill.current;
    const contact: ContactDraft = { ...state.draft.contact };
    const accountId = contactProfile?.accountId ?? null;
    if (metadata.accountId !== accountId) {
      // Remove only untouched automatic values when signing out/switching accounts.
      for (const field of contactFields) {
        if (!metadata.edited.has(field) && contact[field] === metadata.filled[field])
          contact[field] = '';
      }
      metadata.accountId = accountId;
      metadata.filled = {};
    }
    for (const field of contactFields) {
      const value = contactProfile?.[field];
      if (!metadata.edited.has(field) && contact[field] === '' &&
          typeof value === 'string' && value.trim()) {
        contact[field] = value.trim();
        metadata.filled[field] = contact[field];
      }
    }
    if (contactFields.some(field => contact[field] !== state.draft!.contact[field])) {
      commit(before => before.draft
        ? { ...before, draft: { ...before.draft, contact } }
        : before);
    }
  }, [contactProfile, state.draft, state.stored, state.busy, state.storageBlocked, commit]);
  const chooseProduct = (product: PublicProduct) => {
    if (
      current.current.stored ||
      current.current.busy ||
      current.current.storageBlocked
    )
      return false;
    if (current.current.draft?.product.id !== product.id) prefill.current = emptyPrefill();
    commit(before => ({
      ...before,
      draft:
        before.draft?.product.id === product.id
          ? { ...before.draft, product }
          : initialDraft(product),
      error: null,
    }));
    return true;
  };
  const updateDraft = (draft: BookingDraft) => {
    if (
      current.current.stored ||
      request.current ||
      current.current.storageBlocked
    )
      return;
    for (const field of contactFields) {
      if (draft.contact[field] !== current.current.draft?.contact[field])
        prefill.current.edited.add(field);
    }
    commit(before => ({ ...before, draft, error: null }));
  };
  const send = async (attempt: Attempt) => {
    if (request.current || current.current.storageBlocked) return;
    const controller = new AbortController();
    request.current = controller;
    try {
      persistBooking(attempt);
    } catch {
      request.current = null;
      commit(before => ({
        ...before,
        storageBlocked: true,
        error: storageMessage,
      }));
      return;
    }
    commit(before => ({ ...before, stored: attempt, busy: true, error: null }));
    try {
      const receipt = await postReservation(
        attempt.body,
        attempt.key,
        controller.signal
      );
      if (!mounted.current || request.current !== controller) return;
      const stored: StoredBooking = { version: 1, kind: 'receipt', receipt };
      let storageBlocked = false;
      try {
        persistBooking(stored);
      } catch {
        storageBlocked = true;
      }
      commit(before => ({
        ...before,
        stored,
        draft: null,
        busy: false,
        storageBlocked,
        error: storageBlocked ? storageMessage : null,
      }));
    } catch (error) {
      if (!mounted.current || request.current !== controller) return;
      if (knownRejection(error)) {
        try {
          persistBooking(null);
          commit(before => ({
            ...before,
            stored: null,
            busy: false,
            error: rejectionCopy(error as PublicApiError),
          }));
        } catch {
          commit(before => ({
            ...before,
            busy: false,
            storageBlocked: true,
            error: storageMessage,
          }));
        }
      } else
        commit(before => ({
          ...before,
          busy: false,
          error:
            error instanceof PublicApiError &&
            error.code === 'IDEMPOTENCY_KEY_REUSED'
              ? 'Původní požadavek nelze bezpečně změnit. Ověřte jeho stav stejným požadavkem.'
              : null,
        }));
    } finally {
      if (request.current === controller) request.current = null;
    }
  };
  const submit = async (
    quote: Availability | null,
    policy?: BookingPolicy | null
  ) => {
    const before = current.current,
      draft = before.draft;
    if (request.current || before.stored || before.storageBlocked || !draft)
      return;
    try {
      parseBookingPolicy(policy);
    } catch {
      commit(v => ({
        ...v,
        error: 'Nejprve načtěte aktuální informace o platbě a rezervaci.',
      }));
      return;
    }
    const variant = draft.product.variants.find(
      v => v.id === draft.selection.variantId
    );
    if (
      !quote?.available ||
      !sameSelection(quote, draft.selection) ||
      !variant?.pricing[draft.selection.rentalMode] ||
      Object.keys(selectionErrors(draft.selection)).length ||
      Object.keys(contactErrors(draft.contact)).length
    ) {
      commit(v => ({
        ...v,
        error: 'Zkontrolujte údaje a ověřte dostupnost vybraného termínu.',
      }));
      return;
    }
    let attempt: Attempt;
    try {
      attempt = newAttempt(reservationBody(draft));
    } catch {
      commit(v => ({ ...v, storageBlocked: true, error: storageMessage }));
      return;
    }
    await send(attempt);
  };
  const recover = async () => {
    const stored = current.current.stored;
    if (stored?.kind === 'attempt') await send(stored);
  };
  const refreshStatus = async () => {
    const stored = current.current.stored;
    if (request.current || stored?.kind !== 'receipt' || !stored.receipt.guestAccessToken) return;
    const controller = new AbortController();
    request.current = controller;
    commit(v => ({ ...v, busy: true, error: null }));
    try {
      const receipt = await getReservationStatus(stored.receipt.reservationNumber, stored.receipt.guestAccessToken, controller.signal);
      if (!mounted.current || request.current !== controller) return;
      const updated: StoredBooking = { version: 1, kind: 'receipt', receipt };
      let storageBlocked = false;
      try { persistBooking(updated); } catch { storageBlocked = true; }
      commit(v => ({ ...v, stored: updated, storageBlocked, error: storageBlocked ? storageMessage : null }));
    } catch {
      if (mounted.current && request.current === controller)
        commit(v => ({ ...v, error: 'Aktuální stav se nepodařilo ověřit. Zobrazeny jsou poslední uložené údaje. Zkuste to znovu nebo nás kontaktujte.' }));
    } finally {
      if (request.current === controller) {
        request.current = null;
        commit(v => ({ ...v, busy: false }));
      }
    }
  };
  const retryStorage = () => {
    if (request.current) return;
    try {
      const before = current.current;
      let stored = before.stored;
      if (stored) persistBooking(stored);
      else stored = loadBooking();
      commit(v => ({ ...v, stored, storageBlocked: false, error: null }));
    } catch {
      commit(v => ({ ...v, storageBlocked: true, error: storageMessage }));
    }
  };
  const startNew = () => {
    if (
      request.current ||
      current.current.stored?.kind === 'attempt' ||
      current.current.storageBlocked
    )
      return false;
    try {
      persistBooking(null);
    } catch {
      commit(v => ({ ...v, storageBlocked: true, error: storageMessage }));
      return false;
    }
    prefill.current = emptyPrefill();
    commit(v => ({ ...v, draft: null, stored: null, error: null }));
    return true;
  };
  return {
    ...state,
    chooseProduct,
    updateDraft,
    submit,
    recover,
    retryStorage,
    refreshStatus,
    startNew,
    hasActiveDraft: Boolean(state.draft || state.stored?.kind === 'attempt'),
  };
}
type BookingContextValue = ReturnType<typeof useBookingController>;
const BookingContext = createContext<BookingContextValue | null>(null);
export function BookingProvider({ children, contactProfile }: {
  children: ReactNode;
  contactProfile?: ContactProfile | null;
}) {
  const value = useBookingController(contactProfile);
  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}
export function useBookingOptional() {
  return useContext(BookingContext);
}
export function useBooking() {
  const value = useBookingOptional();
  if (!value) throw new Error('Booking provider missing');
  return value;
}
