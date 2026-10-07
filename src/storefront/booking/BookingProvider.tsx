import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  postReservation,
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
  type StoredBooking,
} from './bookingModel';
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
function useBookingController() {
  const [state, setState] = useState(initial),
    current = useRef(state),
    request = useRef<AbortController | null>(null),
    mounted = useRef(true);
  current.current = state;
  const commit = (update: (before: State) => State) => {
    if (!mounted.current) return;
    const value = update(current.current);
    current.current = value;
    setState(value);
  };
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
  const chooseProduct = (product: PublicProduct) => {
    if (
      current.current.stored ||
      current.current.busy ||
      current.current.storageBlocked
    )
      return false;
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
  const submit = async (quote: Availability | null) => {
    const before = current.current,
      draft = before.draft;
    if (request.current || before.stored || before.storageBlocked || !draft)
      return;
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
    startNew,
    hasActiveDraft: Boolean(state.draft || state.stored?.kind === 'attempt'),
  };
}
type BookingContextValue = ReturnType<typeof useBookingController>;
const BookingContext = createContext<BookingContextValue | null>(null);
export function BookingProvider({ children }: { children: ReactNode }) {
  const value = useBookingController();
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
