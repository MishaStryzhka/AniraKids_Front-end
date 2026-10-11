import type { ComponentProps, ReactNode } from 'react';
import { bookingPolicyFixture as policy } from './bookingFixtures';
import { act, renderHook } from '@testing-library/react';
import { BookingProvider, useBooking } from './BookingProvider';
import { getReservationStatus, getAccountReservationStatus, postReservation, PublicApiError } from '../api/publicApi';
import { body, product, quote, receipt, deferred } from './bookingFixtures';
import {
  initialDraft,
  newAttempt,
  persistBooking,
  SESSION_KEY,
} from './bookingModel';
jest.mock('../api/publicApi', () => ({
  ...jest.requireActual('../api/publicApi'),
  postReservation: jest.fn(),
  getReservationStatus: jest.fn(),
  getAccountReservationStatus: jest.fn(),
}));
const post = postReservation as jest.MockedFunction<typeof postReservation>;
function setup() {
  return renderHook(() => useBooking(), { wrapper: BookingProvider });
}
function ready() {
  const view = setup();
  act(() => {
    view.result.current.chooseProduct(product);
  });
  act(() => {
    view.result.current.updateDraft({
      ...initialDraft(product),
      selection: quote,
      contact: { ...body.customer, notes: body.notes! },
    });
  });
  return view;
}
Object.defineProperty(globalThis, 'crypto', {
  value: require('crypto').webcrypto,
  configurable: true,
});
beforeEach(() => {
  sessionStorage.clear();
  post.mockReset();
  post.mockResolvedValue(receipt);
});
test('attempt is persisted before dispatch, double submit single-flight, receipt excludes contact', async () => {
  const pending = deferred<typeof receipt>();
  post.mockImplementation(() => {
    expect(JSON.parse(sessionStorage.getItem(SESSION_KEY)!)).toMatchObject({
      kind: 'attempt',
      body,
    });
    return pending.promise;
  });
  const view = ready();
  let operation!: Promise<void>;
  act(() => {
    operation = view.result.current.submit(quote, policy);
    void view.result.current.submit(quote, policy);
  });
  expect(post).toHaveBeenCalledTimes(1);
  expect(view.result.current.busy).toBe(true);
  act(() => {
    expect(
      view.result.current.chooseProduct({
        ...product,
        id: '444444444444444444444444',
      })
    ).toBe(false);
  });
  await act(async () => {
    pending.resolve(receipt);
    await operation;
  });
  expect(view.result.current.stored).toEqual({
    version: 1,
    kind: 'receipt',
    receipt,
  });
  expect(sessionStorage.getItem(SESSION_KEY)).not.toContain(
    body.customer.email
  );
  expect(view.result.current.draft).toBeNull();
  act(() => {
    expect(view.result.current.startNew()).toBe(true);
  });
  expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
});
test.each([
  new PublicApiError('NETWORK'),
  new PublicApiError('INVALID_RESPONSE'),
  new PublicApiError('INTERNAL_ERROR', 500),
  new PublicApiError('IDEMPOTENCY_KEY_REUSED', 409),
])(
  'unknown outcomes stay frozen until explicit same-key replay: %s',
  async error => {
    post.mockRejectedValueOnce(error);
    const view = ready();
    await act(async () => {
      await view.result.current.submit(quote, policy);
    });
    const attempt = view.result.current.stored;
    expect(attempt?.kind).toBe('attempt');
    expect(view.result.current.startNew()).toBe(false);
    expect(post).toHaveBeenCalledTimes(1);
    view.unmount();
    const { result: reloaded } = setup();
    expect(post).toHaveBeenCalledTimes(1);
    expect(reloaded.current.stored).toEqual(attempt);
    await act(async () => {
      await reloaded.current.recover();
    });
    expect(post.mock.calls[1][0]).toEqual(post.mock.calls[0][0]);
    expect(post.mock.calls[1][1]).toBe(post.mock.calls[0][1]);
    expect(reloaded.current.stored?.kind).toBe('receipt');
  }
);
test('known inventory conflict preserves editable contact draft, without retry', async () => {
  post.mockRejectedValue(new PublicApiError('NO_AVAILABLE_INVENTORY', 409));
  const view = ready();
  await act(async () => {
    await view.result.current.submit(quote, policy);
  });
  expect(view.result.current.stored).toBeNull();
  expect(view.result.current.draft?.contact.email).toBe(body.customer.email);
  expect(view.result.current.error).toMatch('Tento termín není dostupný');
  expect(post).toHaveBeenCalledTimes(1);
});
test('storage failure prevents POST, explicit storage recovery enables retry', async () => {
  const view = ready(),
    fail = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota');
    });
  await act(async () => {
    await view.result.current.submit(quote, policy);
  });
  expect(post).not.toHaveBeenCalled();
  expect(view.result.current.storageBlocked).toBe(true);
  fail.mockRestore();
  act(() => view.result.current.retryStorage());
  await act(async () => {
    await view.result.current.submit(quote, policy);
  });
  expect(post).toHaveBeenCalledTimes(1);
});
test('receipt persistence failure cannot open a new attempt; recovery persists sanitized receipt', async () => {
  const view = ready(),
    original = Storage.prototype.setItem;
  let calls = 0;
  const fail = jest
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementation(function (this: Storage, key, value) {
      if (++calls === 2) throw new Error('Quota');
      return original.call(this, key, value);
    });
  await act(async () => {
    await view.result.current.submit(quote, policy);
  });
  expect(view.result.current.stored?.kind).toBe('receipt');
  expect(view.result.current.storageBlocked).toBe(true);
  expect(view.result.current.startNew()).toBe(false);
  fail.mockRestore();
  act(() => view.result.current.retryStorage());
  expect(JSON.parse(sessionStorage.getItem(SESSION_KEY)!).kind).toBe('receipt');
  expect(view.result.current.storageBlocked).toBe(false);
});
test('unmount aborts client without discarding persisted unknown request', async () => {
  const pending = deferred<typeof receipt>();
  post.mockReturnValue(pending.promise);
  const view = ready();
  let operation!: Promise<void>;
  act(() => {
    operation = view.result.current.submit(quote, policy);
  });
  const raw = sessionStorage.getItem(SESSION_KEY);
  view.unmount();
  await act(async () => {
    pending.resolve(receipt);
    await operation;
  });
  expect(sessionStorage.getItem(SESSION_KEY)).toBe(raw);
  expect(post.mock.calls[0][2]?.aborted).toBe(true);
});
test('corrupt saved state and stale/unavailable quote cannot dispatch', async () => {
  sessionStorage.setItem(SESSION_KEY, 'bad');
  const { result: broken, unmount } = setup();
  expect(broken.current.storageBlocked).toBe(true);
  expect(broken.current.chooseProduct(product)).toBe(false);
  unmount();
  sessionStorage.clear();
  const view = ready();
  await act(async () => {
    await view.result.current.submit({
      ...quote,
      variantId: product.variants[1].id,
    });
  });
  expect(post).not.toHaveBeenCalled();
});
test('persisted receipt survives refresh without any request; unresolved original takes precedence over new selection', () => {
  persistBooking({ version: 1, kind: 'receipt', receipt });
  const { result: done, unmount } = setup();
  expect(done.current.stored?.kind).toBe('receipt');
  expect(post).not.toHaveBeenCalled();
  unmount();
  persistBooking(newAttempt(body));
  const { result: pending } = setup();
  expect(pending.current.chooseProduct(product)).toBe(false);
  expect(pending.current.hasActiveDraft).toBe(true);
});

test('new booking fails closed without valid policy; unresolved attempts remain recoverable', async () => {
  const view = ready();
  await act(async () => {
    await view.result.current.submit(quote);
  });
  expect(post).not.toHaveBeenCalled();
  expect(view.result.current.error).toContain('informace o platbě');
});

test('refresh reads current receipt and never repeats POST; failure retains old receipt with warning', async () => {
  const read = getReservationStatus as jest.MockedFunction<typeof getReservationStatus>;
  read.mockReset();
  const token = 'a'.repeat(43);
  const before = { ...receipt, guestAccessToken: token };
  persistBooking({ version: 1, kind: 'receipt', receipt: before });
  const view = setup();
  const after = { ...before, status: 'confirmed', expiresAt: null };
  read.mockResolvedValueOnce(after);
  await act(async () => { await view.result.current.refreshStatus(); });
  expect(view.result.current.stored).toEqual({ version: 1, kind: 'receipt', receipt: after });
  expect(post).not.toHaveBeenCalled();
  read.mockRejectedValueOnce(new Error('offline'));
  await act(async () => { await view.result.current.refreshStatus(); });
  expect(view.result.current.stored).toEqual({ version: 1, kind: 'receipt', receipt: after });
  expect(view.result.current.error).toContain('nepodařilo ověřit');
  expect(view.result.current.busy).toBe(false);
  read.mockReset();
});

type Profile = ComponentProps<typeof BookingProvider>['contactProfile'];
const profileFixture = {
  accountId: 'customer-1',
  firstName: 'Jana',
  lastName: 'Nováková',
  email: 'jana@example.test',
  phone: '+420777123456',
};
function profileView(profile: Profile) {
  const current = { profile };
  const view = renderHook(() => useBooking(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      <BookingProvider contactProfile={current.profile}>{children}</BookingProvider>,
  });
  return {
    ...view,
    setProfile(next: Profile) { current.profile = next; view.rerender(); },
  };
}
test('profile fills editable contacts without storing or submitting them', () => {
  const view = profileView(profileFixture);
  act(() => { view.result.current.chooseProduct(product); });
  expect(view.result.current.draft?.contact).toEqual({
    firstName: 'Jana', lastName: 'Nováková', email: 'jana@example.test',
    phone: '+420777123456', notes: '',
  });
  expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  expect(post).not.toHaveBeenCalled();
});
test('late profile never overwrites a manual edit or a deliberately cleared field, including returning to the product', () => {
  const view = profileView(undefined);
  act(() => { view.result.current.chooseProduct(product); });
  act(() => {
    const draft = view.result.current.draft!;
    view.result.current.updateDraft({ ...draft, contact: { ...draft.contact, firstName: 'Eva', email: 'typed@example.test' } });
  });
  act(() => {
    const draft = view.result.current.draft!;
    view.result.current.updateDraft({ ...draft, contact: { ...draft.contact, email: '' } });
  });
  view.setProfile(profileFixture);
  expect(view.result.current.draft?.contact).toMatchObject({ firstName: 'Eva', email: '', lastName: 'Nováková', phone: '+420777123456' });
  act(() => { view.result.current.chooseProduct(product); });
  expect(view.result.current.draft?.contact).toMatchObject({ firstName: 'Eva', email: '' });
  act(() => { view.result.current.chooseProduct({ ...product, id: 'another-product' }); });
  expect(view.result.current.draft?.contact.email).toBe('');
});
test('account switch and logout remove untouched automatic values but preserve manual contact edits', () => {
  const view = profileView(profileFixture);
  act(() => { view.result.current.chooseProduct(product); });
  act(() => {
    const draft = view.result.current.draft!;
    view.result.current.updateDraft({ ...draft, contact: { ...draft.contact, firstName: 'Eva', notes: 'Ruční poznámka' } });
  });
  view.setProfile(undefined); // Refreshing does not clear current fields.
  expect(view.result.current.draft?.contact.email).toBe('jana@example.test');
  view.setProfile({ accountId: 'customer-2', email: 'second@example.test', phone: null });
  expect(view.result.current.draft?.contact).toEqual({
    firstName: 'Eva', lastName: '', email: 'second@example.test', phone: '', notes: 'Ruční poznámka',
  });
  view.setProfile(null);
  expect(view.result.current.draft?.contact.email).toBe('');
  expect(view.result.current.draft?.contact.firstName).toBe('Eva');
});
test('profile changes cannot alter a pending request or its frozen recovery body', async () => {
  const pending = deferred<typeof receipt>();
  post.mockReturnValue(pending.promise);
  const view = profileView(profileFixture);
  act(() => { view.result.current.chooseProduct(product); });
  act(() => {
    const draft = view.result.current.draft!;
    view.result.current.updateDraft({ ...draft, selection: quote });
  });
  let operation!: Promise<void>;
  act(() => { operation = view.result.current.submit(quote, policy); });
  const saved = sessionStorage.getItem(SESSION_KEY);
  view.setProfile({ ...profileFixture, accountId: 'customer-2', email: 'other@example.test' });
  expect(sessionStorage.getItem(SESSION_KEY)).toBe(saved);
  expect(post.mock.calls[0][0].customer.email).toBe('jana@example.test');
  await act(async () => { pending.reject(new PublicApiError('NETWORK')); await operation; });
  view.setProfile(null);
  expect(sessionStorage.getItem(SESSION_KEY)).toBe(saved);
  expect(view.result.current.stored?.kind).toBe('attempt');
});

const ownerSession = { accountId: 'aaaaaaaaaaaaaaaaaaaaaaaa', token: 'owner-session-secret' };
function sessionView(initialSession: typeof ownerSession | null, pending = false) {
  const auth = { session: initialSession, pending };
  const view = renderHook(() => useBooking(), { wrapper: ({ children }: { children: ReactNode }) =>
    <BookingProvider session={auth.session} sessionPending={auth.pending}>{children}</BookingProvider> });
  return { ...view, changeSession(session: typeof ownerSession | null, nextPending = false) {
    auth.session = session; auth.pending = nextPending; view.rerender();
  } };
}
function fill(view: ReturnType<typeof sessionView>) {
  act(() => { view.result.current.chooseProduct(product); });
  act(() => { view.result.current.updateDraft({ ...initialDraft(product), selection: quote,
    contact: { ...body.customer, notes: body.notes! } }); });
}
test('signed-in booking sends bearer, persists owner but never token, and refreshes as owner', async () => {
  const view = sessionView(ownerSession); fill(view);
  await act(async () => { await view.result.current.submit(quote, policy); });
  expect(post.mock.calls[0][3]).toBe(ownerSession.token);
  expect(view.result.current.stored).toMatchObject({ kind: 'receipt', accountId: ownerSession.accountId });
  expect(sessionStorage.getItem(SESSION_KEY)).not.toContain(ownerSession.token);
  const read = getAccountReservationStatus as jest.Mock;
  read.mockResolvedValueOnce({ ...receipt, status: 'confirmed', expiresAt: null });
  await act(async () => { await view.result.current.refreshStatus(); });
  expect(read).toHaveBeenCalledWith(receipt.reservationNumber, ownerSession.token, expect.anything());
  expect(view.result.current.stored).toMatchObject({ accountId: ownerSession.accountId, receipt: { status: 'confirmed' } });
  view.changeSession(null);
  expect(view.result.current.accountBlocked).toBe(true);
  expect(view.result.current.stored).toBeNull();
  view.changeSession(ownerSession);
  expect(view.result.current.stored?.kind).toBe('receipt');
});
test('unknown authenticated attempt remains bound after account switch and reload', async () => {
  post.mockRejectedValueOnce(new PublicApiError('NETWORK'));
  const view = sessionView(ownerSession); fill(view);
  await act(async () => { await view.result.current.submit(quote, policy); });
  const saved = sessionStorage.getItem(SESSION_KEY);
  const key = post.mock.calls[0][1];
  view.changeSession({ accountId: 'bbbbbbbbbbbbbbbbbbbbbbbb', token: 'another-session' });
  expect(view.result.current.stored).toBeNull();
  await act(async () => { await view.result.current.recover(); });
  expect(post).toHaveBeenCalledTimes(1);
  expect(sessionStorage.getItem(SESSION_KEY)).toBe(saved);
  view.unmount();
  const restored = sessionView({ ...ownerSession, token: 'refreshed-session' });
  await act(async () => { await restored.result.current.recover(); });
  expect(post.mock.calls[1][1]).toBe(key);
  expect(post.mock.calls[1][3]).toBe('refreshed-session');
  expect(restored.result.current.stored?.kind).toBe('receipt');
});
test('session refresh blocks new booking, but legacy guest retry remains guest after sign-in', async () => {
  const view = sessionView(ownerSession, true); fill(view);
  await act(async () => { await view.result.current.submit(quote, policy); });
  expect(post).not.toHaveBeenCalled();
  expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  view.unmount();
  const attempt = newAttempt(body); persistBooking(attempt);
  const restored = sessionView(ownerSession);
  await act(async () => { await restored.result.current.recover(); });
  expect(post.mock.calls[0][1]).toBe(attempt.key);
  expect(post.mock.calls[0][3]).toBeUndefined();
});
test('late authenticated response remains hidden from a switched account', async () => {
  const pending = deferred<typeof receipt>(); post.mockReturnValueOnce(pending.promise);
  const view = sessionView(ownerSession); fill(view);
  let operation!: Promise<void>;
  act(() => { operation = view.result.current.submit(quote, policy); });
  view.changeSession({ accountId: 'bbbbbbbbbbbbbbbbbbbbbbbb', token: 'other' });
  await act(async () => { pending.resolve(receipt); await operation; });
  expect(view.result.current.stored).toBeNull();
  expect(JSON.parse(sessionStorage.getItem(SESSION_KEY)!).accountId).toBe(ownerSession.accountId);
  view.changeSession(ownerSession);
  expect(view.result.current.stored?.kind).toBe('receipt');
});

test('adding products retains shared dates and contacts; selecting again does not duplicate; removing primary promotes next', () => {
  const view = ready();
  const second = { ...product, id: '444444444444444444444444', slug: 'ema', name: 'Ema' };
  act(() => { view.result.current.chooseProduct(second); });
  expect(view.result.current.draft?.product.id).toBe(product.id);
  expect(view.result.current.draft?.additionalItems).toEqual([{ product: second, variantId: '' }]);
  expect(view.result.current.draft?.selection.startDate).toBe(body.startDate);
  expect(view.result.current.draft?.contact.email).toBe(body.customer.email);
  act(() => { view.result.current.chooseProduct(second); });
  expect(view.result.current.draft?.additionalItems).toHaveLength(1);
  act(() => { view.result.current.removeProduct(product.id); });
  expect(view.result.current.draft?.product.id).toBe(second.id);
  expect(view.result.current.draft?.selection).toMatchObject({ productId: second.id, variantId: '', startDate: body.startDate });
  act(() => { view.result.current.removeProduct(second.id); });
  expect(view.result.current.draft).toBeNull();
});
test('all-item quote required; unknown multi-item request freezes and replays complete basket with same key', async () => {
  const view = ready();
  const second = { ...product, id: '444444444444444444444444', name: 'Ema' };
  act(() => { view.result.current.chooseProduct(second); });
  await act(async () => { await view.result.current.submit(quote, policy); });
  expect(post).not.toHaveBeenCalled();
  act(() => { const draft = view.result.current.draft!;
    view.result.current.updateDraft({ ...draft, additionalItems: [{ product: second, variantId: second.variants[0].id }] });
  });
  await act(async () => { await view.result.current.submit(quote, policy); });
  expect(post).not.toHaveBeenCalled();
  const basketQuote = { ...quote, items: [quote, { ...quote, productId: second.id }],
    pricing: { rentalPrice: 1000, deposit: 2000, totalDue: 3000 } };
  post.mockRejectedValueOnce(new PublicApiError('NETWORK'));
  await act(async () => { await view.result.current.submit(basketQuote, policy); });
  const attempt = view.result.current.stored;
  expect(attempt).toMatchObject({ kind: 'attempt', body: { items: [
    { productId: product.id, variantId: product.variants[0].id },
    { productId: second.id, variantId: second.variants[0].id },
  ] } });
  act(() => { expect(view.result.current.removeProduct(product.id)).toBe(false); });
  view.unmount();
  const restored = setup();
  expect(restored.result.current.stored).toEqual(attempt);
  await act(async () => { await restored.result.current.recover(); });
  expect(post.mock.calls[1][0]).toEqual(post.mock.calls[0][0]);
  expect(post.mock.calls[1][1]).toBe(post.mock.calls[0][1]);
});
