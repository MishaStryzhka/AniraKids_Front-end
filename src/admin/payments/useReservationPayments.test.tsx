import { act, renderHook, waitFor } from '@testing-library/react';
import { useReservationPayments } from './useReservationPayments';
import {
  appendReservationPayment,
  getReservationPayments,
} from '../api/reservationPayments';
import { AdminApiError } from '../api/errors';
import { loadPaymentAttempt } from './paymentAttemptStorage';
import {
  paymentLedgerFixture as ledger,
  paymentOperationFixture as operation,
  recordedPaymentFixture as recorded,
} from './paymentFixtures';
import type { ReservationMutationLock } from './paymentModel';
jest.mock('../api/reservationPayments', () => ({
  ...jest.requireActual('../api/reservationPayments'),
  appendReservationPayment: jest.fn(),
  getReservationPayments: jest.fn(),
}));
const get = getReservationPayments as jest.MockedFunction<
    typeof getReservationPayments
  >,
  post = appendReservationPayment as jest.MockedFunction<
    typeof appendReservationPayment
  >;
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function setup() {
  const mutationLock: ReservationMutationLock = { current: null },
    onAccessError = jest.fn(() => false);
  const props = {
    reservationId: 'r1',
    token: 'token1',
    adminId: 'admin1',
    version: 'pending',
    mutationLock,
    onAccessError,
    canWrite: () => true,
  };
  return {
    ...renderHook(input => useReservationPayments(input), {
      initialProps: props,
    }),
    props,
  };
}
beforeEach(() => {
  sessionStorage.clear();
  jest.clearAllMocks();
  get.mockResolvedValue(ledger);
  post.mockResolvedValue(recorded);
});
test('persists before POST and synchronously prevents duplicate or cross-controller write', async () => {
  const pending = deferred<typeof recorded>();
  post.mockImplementation(() => {
    expect(loadPaymentAttempt('admin1', 'r1')).toEqual(operation);
    return pending.promise;
  });
  const view = setup();
  await waitFor(() => expect(view.result.current.payments).not.toBeNull());
  let result!: Promise<boolean>;
  act(() => {
    result = view.result.current.write(operation);
    void view.result.current.write(operation);
  });
  expect(post).toHaveBeenCalledTimes(1);
  expect(view.props.mutationLock.current).toBe('payments');
  await act(async () => {
    pending.resolve(recorded);
    await result;
  });
  expect(view.result.current.attempt).toBeNull();
  expect(loadPaymentAttempt('admin1', 'r1')).toBeNull();
  expect(view.props.mutationLock.current).toBeNull();
});
test('unknown requires GET before exact replay and survives navigation/reload without new operationId', async () => {
  post.mockRejectedValueOnce(new Error('network'));
  let view = setup();
  await waitFor(() => expect(view.result.current.payments).not.toBeNull());
  await act(async () => {
    await view.result.current.write(operation);
  });
  await act(async () => {
    await view.result.current.write(operation, true);
  });
  expect(post).toHaveBeenCalledTimes(1);
  expect(view.result.current.canWriteNow()).toBe(false);
  view.unmount();
  view = setup();
  await waitFor(() => expect(view.result.current.replayReady).toBe(true));
  const restored = view.result.current.attempt!;
  expect(restored).toEqual(operation);
  await act(async () => {
    await view.result.current.write({
      ...operation,
      operationId: '22222222-2222-4222-8222-222222222222',
    });
  });
  expect(post).toHaveBeenCalledTimes(1);
  await act(async () => {
    await view.result.current.write(restored, true);
  });
  expect(post.mock.calls[1][0].operation).toEqual(operation);
  expect(view.result.current.attempt).toBeNull();
});
test('authoritative GET matching operation clears uncertain state and persisted barrier', async () => {
  post.mockRejectedValueOnce(new Error('unknown'));
  const view = setup();
  await waitFor(() => expect(view.result.current.payments).not.toBeNull());
  await act(async () => {
    await view.result.current.write(operation);
  });
  get.mockResolvedValueOnce(recorded);
  await act(async () => {
    await view.result.current.read();
  });
  expect(view.result.current.attempt).toBeNull();
  expect(loadPaymentAttempt('admin1', 'r1')).toBeNull();
  expect(view.result.current.canWriteNow()).toBe(true);
});
test('409 requires reconciliation and legacy ledger blocks append', async () => {
  post.mockRejectedValueOnce(
    new AdminApiError({
      code: 'PAYMENT_CONFLICT',
      message: 'conflict',
      status: 409,
      kind: 'unexpected',
    })
  );
  const view = setup();
  await waitFor(() => expect(view.result.current.payments).not.toBeNull());
  await act(async () => {
    await view.result.current.write(operation);
  });
  expect(view.result.current.conflict).toBe(true);
  expect(view.result.current.attempt).toBeNull();
  get.mockResolvedValueOnce({ ...ledger, legacyUnreconciled: true });
  await act(async () => {
    await view.result.current.read();
    await view.result.current.write(operation);
  });
  expect(post).toHaveBeenCalledTimes(1);
});
test('storage failure prevents dispatch; retry GET can release storage block safely', async () => {
  const view = setup();
  await waitFor(() => expect(view.result.current.payments).not.toBeNull());
  const spy = jest
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementation(() => {
      throw new Error('full');
    });
  await act(async () => {
    await view.result.current.write(operation);
  });
  expect(post).not.toHaveBeenCalled();
  expect(view.result.current.storageBlocked).toBe(true);
  spy.mockRestore();
  await act(async () => {
    await view.result.current.read();
  });
  expect(view.result.current.storageBlocked).toBe(false);
});
test('old token completion/access error cannot clear newer scope or invoke auth handler', async () => {
  const pending = deferred<typeof recorded>();
  post.mockReturnValueOnce(pending.promise);
  const view = setup();
  await waitFor(() => expect(view.result.current.payments).not.toBeNull());
  let task!: Promise<boolean>;
  act(() => {
    task = view.result.current.write(operation);
  });
  view.rerender({
    ...view.props,
    token: 'token2',
    adminId: 'admin2',
    reservationId: 'r2',
  });
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  await act(async () => {
    pending.reject(
      new AdminApiError({
        code: 'UNAUTHORIZED',
        status: 401,
        message: 'old',
        kind: 'unauthorized',
      })
    );
    await task;
  });
  expect(view.props.onAccessError).not.toHaveBeenCalled();
  expect(view.result.current.attempt).toBeNull();
  expect(loadPaymentAttempt('admin1', 'r1')).toEqual(operation);
});
test('version change synchronously blocks stale ledger and ignores older read', async () => {
  const pending = deferred<typeof ledger>();
  get.mockReturnValueOnce(pending.promise);
  const view = setup();
  view.rerender({ ...view.props, version: 'cancelled' });
  await waitFor(() => expect(view.result.current.version).toBe('cancelled'));
  await act(async () => {
    pending.resolve({ ...ledger, revision: 99 });
  });
  expect(view.result.current.payments?.revision).toBe(0);
});

jest.mock('../api/client', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn() },
  buildAdminRequestConfig: jest.fn(),
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
