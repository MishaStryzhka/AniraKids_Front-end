import { bookingPolicyFixture as policy } from './bookingFixtures';
import { act, renderHook } from '@testing-library/react';
import { BookingProvider, useBooking } from './BookingProvider';
import { getReservationStatus, postReservation, PublicApiError } from '../api/publicApi';
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
