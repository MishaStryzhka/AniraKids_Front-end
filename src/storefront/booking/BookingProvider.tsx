import {fulfillmentError} from './fulfillment';
import {trackBookingCreated} from '../../analytics/analytics';
import { parseBookingPolicy, type BookingPolicy } from '../api/bookingPolicy';
import { preserveGuestReservationLink } from './guestReservationLinks';
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
  getAccountReservationStatus,
  PublicApiError,
  sameSelection,
  type BookingQuote,
  type PublicProduct,
} from '../api/publicApi';
import {
  contactErrors,
  draftItems,
  draftSelections,
  draftSelectionsValid,
  initialDraft,
  loadBooking,
  loadDraft,
  persistDraft,
  newAttempt,
  persistBooking,
  reservationBody,
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
  draftStorageWarning?: boolean;
  stored: StoredBooking | null;
  busy: boolean;
  receiptVerified?: boolean;
  storageBlocked: boolean;
  error: string | null;
};
const storageMessage =
  'Rezervaci se nepodařilo bezpečně uložit v tomto prohlížeči. Zkuste to prosím znovu. Požadavek zůstává chráněný proti opakovanému vytvoření.';
function initial(): State {
  try {
    const stored = loadBooking();
    let draft: BookingDraft | null = null, draftStorageWarning = false;
    if (!stored) {
      try { draft = loadDraft(); } catch { draftStorageWarning = true; }
    }
    return {
      draft,
      draftStorageWarning,
      stored,
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
      'FITTING_DISCOUNT_UNAVAILABLE',
      'FITTING_DISCOUNT_MINIMUM',
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
  if(error.code==='FITTING_DISCOUNT_UNAVAILABLE')return 'Platbu za zkoušku nelze započíst nebo kontaktní e-mail neodpovídá zkoušce. Ověřte údaje a platbu znovu.';
  if(error.code==='FITTING_DISCOUNT_MINIMUM')return 'Pro započtení platby za zkoušku musí cena pronájmu dosahovat alespoň 200 Kč.';
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
type BookingSession = { accountId: string; token: string };
function useBookingController(contactProfile?: ContactProfile | null, session: BookingSession | null = null, sessionPending = false) {
  const sessionRef = useRef({ session, pending: sessionPending });
  sessionRef.current = { session, pending: sessionPending };
  const prefill = useRef<Prefill>(emptyPrefill());
  const [state, setState] = useState(initial),
    current = useRef(state),
    request = useRef<AbortController | null>(null),
    mounted = useRef(true);
  current.current = state;
  const commit = useCallback((update: (before: State) => State) => {
    if (!mounted.current) return;
    let value = update(current.current);
    if (value.draft !== current.current.draft || value.stored !== current.current.stored) {
      try {
        persistDraft(value.stored ? null : value.draft);
        value = { ...value, draftStorageWarning: false };
      } catch {
        value = { ...value, draftStorageWarning: true };
      }
    }
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
    const previous = current.current.draft;
    if (previous && !draftItems(previous).some(item => item.product.id === product.id) &&
        draftItems(previous).length >= 20) {
      commit(before => ({ ...before, error: 'Do jedné rezervace lze přidat nejvýše 20 produktů.' }));
      return false;
    }
    if (!previous) prefill.current = emptyPrefill();
    commit(before => ({
      ...before,
      draft: !before.draft ? initialDraft(product) :
        before.draft.product.id === product.id ? { ...before.draft, product } :
        before.draft.additionalItems?.some(item => item.product.id === product.id)
          ? { ...before.draft, additionalItems: before.draft.additionalItems.map(item =>
              item.product.id === product.id ? { ...item, product } : item) }
          : { ...before.draft, additionalItems: [...(before.draft.additionalItems ?? []), { product, variantId: '' }] },
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
  const removeProduct = (productId: string) => {
    const before = current.current;
    if (!before.draft || before.stored || before.busy || before.storageBlocked) return false;
    const items = draftItems(before.draft).filter(item => item.product.id !== productId);
    commit(value => ({ ...value, draft: items.length ? {
      ...before.draft!, product: items[0].product,
      selection: { ...before.draft!.selection, productId: items[0].product.id, variantId: items[0].variantId },
      additionalItems: items.slice(1),
    } : null, error: null }));
    if (!items.length) prefill.current = emptyPrefill();
    return true;
  };
  const send = async (attempt: Attempt) => {
    if (request.current || current.current.storageBlocked) return;
    const auth = sessionRef.current;
    if (attempt.accountId && (auth.pending || auth.session?.accountId !== attempt.accountId || !auth.session?.token)) {
      commit(v => ({ ...v, error: 'Pro ověření původní rezervace se přihlaste ke stejnému účtu.' }));
      return;
    }
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
        controller.signal,
        attempt.accountId ? auth.session!.token : undefined
      );
      if (!mounted.current || request.current !== controller) return;
      trackBookingCreated('rental', attempt.key);
      const stored: StoredBooking = { version: 1, kind: 'receipt', receipt, ...(attempt.accountId ? { accountId: attempt.accountId } : {}) };
      let storageBlocked = false;
      try {
        persistBooking(stored);
      } catch {
        storageBlocked = true;
      }
      commit(before => ({
        ...before,
        stored,
        receiptVerified: true,
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
            error instanceof PublicApiError && error.status === 401
              ? 'Přihlášení vypršelo. Přihlaste se ke stejnému účtu a ověřte původní rezervaci.'
              : error instanceof PublicApiError &&
            error.code === 'IDEMPOTENCY_KEY_REUSED'
              ? 'Původní požadavek nelze bezpečně změnit. Ověřte jeho stav stejným požadavkem.'
              : null,
        }));
    } finally {
      if (request.current === controller) request.current = null;
    }
  };
  const submit = async (
    quote: BookingQuote | null,
    policy?: BookingPolicy | null,
    fittingDiscount?: import('../../fittings/FittingDiscount').FittingDiscountSelection
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
      !draftSelectionsValid(draft) ||
      (draft.additionalItems?.length ? !quote.items || quote.items.length !== draftSelections(draft).length ||
        draftSelections(draft).some((selection, index) => !quote.items![index].available || !sameSelection(quote.items![index], selection)) : false) ||
      fulfillmentError(draft, draft.selection.rentalMode) ||
      Object.keys(contactErrors(draft.contact)).length
    ) {
      commit(v => ({
        ...v,
        error: 'Zkontrolujte údaje a ověřte dostupnost vybraného termínu.',
      }));
      return;
    }
    if (sessionRef.current.pending) {
      commit(v => ({ ...v, error: 'Počkejte prosím na ověření přihlášení.' }));
      return;
    }
    let attempt: Attempt;
    try {
      attempt = newAttempt({...reservationBody(draft),...(fittingDiscount?{fittingDiscount}:{})}, sessionRef.current.session?.accountId);
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
    if (request.current || stored?.kind !== 'receipt') return;
    const auth = sessionRef.current;
    if (stored.accountId && (auth.pending || auth.session?.accountId !== stored.accountId)) return;
    if (!stored.accountId && !stored.receipt.guestAccessToken) return;
    const controller = new AbortController();
    request.current = controller;
    commit(v => ({ ...v, busy: true, error: null }));
    try {
      const receipt = stored.accountId
        ? await getAccountReservationStatus(stored.receipt.reservationNumber, auth.session!.token, controller.signal)
        : await getReservationStatus(stored.receipt.reservationNumber, stored.receipt.guestAccessToken!, controller.signal);
      if (!mounted.current || request.current !== controller) return;
      const updated: StoredBooking = { version: 1, kind: 'receipt', receipt, ...(stored.accountId ? { accountId: stored.accountId } : {}) };
      let storageBlocked = false;
      try { persistBooking(updated); } catch { storageBlocked = true; }
      commit(v => ({ ...v, stored: updated, receiptVerified: true, storageBlocked, error: storageBlocked ? storageMessage : null }));
    } catch {
      if (mounted.current && request.current === controller)
        commit(v => ({ ...v, receiptVerified: false, error: 'Aktuální stav se nepodařilo ověřit. Zobrazeny jsou poslední uložené údaje. Zkuste to znovu nebo nás kontaktujte.' }));
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
    const stored = current.current.stored;
    const auth = sessionRef.current;
    if (
      request.current ||
      stored?.kind === 'attempt' ||
      (stored?.accountId && (auth.pending || stored.accountId !== auth.session?.accountId)) ||
      current.current.storageBlocked
    )
      return false;
    try {
      if (stored?.kind === 'receipt' && !stored.accountId)
        preserveGuestReservationLink(stored.receipt);
      persistBooking(null);
    } catch {
      commit(v => ({ ...v, storageBlocked: true, error: storageMessage }));
      return false;
    }
    prefill.current = emptyPrefill();
    commit(v => ({ ...v, draft: null, stored: null, error: null }));
    return true;
  };
  const accountBlocked = Boolean(state.stored?.accountId &&
    (sessionPending || state.stored.accountId !== session?.accountId));
  return {
    ...state,
    stored: accountBlocked ? null : state.stored,
    draft: accountBlocked ? null : state.draft,
    accountBlocked,
    chooseProduct,
    updateDraft,
    removeProduct,
    submit,
    discountAuthToken:sessionPending?undefined:session?.token,
    recover,
    retryStorage,
    refreshStatus,
    startNew,
    hasActiveDraft: Boolean(state.draft || state.stored?.kind === 'attempt'),
  };
}
type BookingContextValue = ReturnType<typeof useBookingController>;
const BookingContext = createContext<BookingContextValue | null>(null);
export function BookingProvider({ children, contactProfile, session, sessionPending }: {
  children: ReactNode;
  contactProfile?: ContactProfile | null;
  session?: BookingSession | null;
  sessionPending?: boolean;
}) {
  const value = useBookingController(contactProfile, session, sessionPending);
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
