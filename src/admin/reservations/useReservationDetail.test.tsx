import { act, renderHook, waitFor } from '@testing-library/react';
import {
  getAdminReservationDetail,
  type ReservationDetail,
} from '../api/reservations';
import { changeAdminReservation } from '../api/reservationMutations';
import { AdminApiError } from '../api/errors';
import { reservationDetailFixture as detail } from './reservationFixtures';
import { useReservationDetail } from './useReservationDetail';
jest.mock('../api/reservations', () => ({
  getAdminReservationDetail: jest.fn(),
}));
jest.mock('../api/reservationMutations', () => ({
  changeAdminReservation: jest.fn(),
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
const get = getAdminReservationDetail as jest.MockedFunction<
    typeof getAdminReservationDetail
  >,
  mutate = changeAdminReservation as jest.MockedFunction<
    typeof changeAdminReservation
  >;
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const receipt = {
  id: 'r1',
  reservationNumber: 'AK-2026-001',
  status: 'confirmed',
  paymentStatus: 'unpaid',
  pendingExpired: false,
};
const error = (status: number | null, code = 'FAILED') =>
  new AdminApiError({
    status,
    code,
    kind: status === null ? 'network' : 'unexpected',
    message: 'private raw message',
  });
async function setup() {
  const props = {
    reservationId: 'r1',
    token: 'first',
    onAccessError: jest.fn(() => false),
  };
  const view = renderHook(input => useReservationDetail(input), {
    initialProps: props,
  });
  await waitFor(() => expect(view.result.current.kind).toBe('success'));
  return { ...view, props };
}
beforeEach(() => {
  jest.clearAllMocks();
  get.mockResolvedValue(detail);
  mutate.mockResolvedValue(receipt);
});
test('synchronous single flight spans POST plus authoritative GET; mutation receipt never substitutes for full detail', async () => {
  const { result } = await setup();
  const response = deferred<typeof receipt>(),
    fresh = deferred<ReservationDetail>();
  mutate.mockReturnValue(response.promise);
  get.mockReturnValue(fresh.promise);
  let first!: Promise<boolean>;
  act(() => {
    first = result.current.change({ action: 'confirm' });
    void result.current.change({ action: 'confirm' });
    void result.current.read();
  });
  expect(mutate).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledTimes(1);
  await act(async () => response.resolve(receipt));
  expect(get).toHaveBeenCalledTimes(2);
  expect(result.current.reservation?.status).toBe('pending');
  expect(result.current.busy).toBe('confirm');
  await act(async () => {
    void result.current.change({ action: 'prepare' });
  });
  expect(mutate).toHaveBeenCalledTimes(1);
  await act(async () => {
    fresh.resolve({ ...detail, status: 'confirmed', pendingExpired: false });
    await first;
  });
  expect(result.current.reservation?.status).toBe('confirmed');
  expect(result.current.busy).toBeNull();
  expect(result.current.focus?.target).toBe('status');
});
test.each([
  error(null),
  error(500),
  error(null, 'ADMIN_RESERVATION_INVALID_RESPONSE'),
])(
  'unknown outcome blocks every mutation until explicit successful GET (%j)',
  async failure => {
    const { result } = await setup();
    mutate.mockRejectedValueOnce(failure);
    await act(async () => {
      await result.current.change({ action: 'confirm' });
    });
    expect(result.current.recovery?.kind).toBe('unknown');
    expect(get).toHaveBeenCalledTimes(1);
    await act(async () => {
      await result.current.change({ action: 'cancel', reason: 'why' });
      await result.current.change({ action: 'notes', notes: 'new' });
    });
    expect(mutate).toHaveBeenCalledTimes(1);
    get.mockRejectedValueOnce(error(500));
    await act(async () => {
      await result.current.read();
    });
    expect(result.current.recovery?.kind).toBe('unknown');
    get.mockResolvedValueOnce({ ...detail, status: 'confirmed' });
    await act(async () => {
      await result.current.read();
    });
    expect(result.current.recovery).toBeNull();
    expect(result.current.reservation?.status).toBe('confirmed');
    expect(result.current.announcement).toBe(
      'Aktuální stav rezervace byl načten.'
    );
    expect(mutate).toHaveBeenCalledTimes(1);
  }
);
test.each([
  'INVALID_RESERVATION_TRANSITION',
  'RESERVATION_CONFIRMATION_CONFLICT',
  'RESERVATION_INVENTORY_NOT_ACTIVE',
])('409 %s stays blocked until refreshed', async code => {
  const { result } = await setup();
  mutate.mockRejectedValueOnce(error(409, code));
  await act(async () => {
    await result.current.change({ action: 'confirm' });
  });
  expect(result.current.recovery?.kind).toBe('conflict');
  expect(result.current.recovery?.message).not.toContain('private');
  get.mockResolvedValueOnce({ ...detail, status: 'cancelled' });
  await act(async () => {
    await result.current.read();
  });
  expect(result.current.reservation?.status).toBe('cancelled');
  expect(result.current.recovery).toBeNull();
});
test('valid receipt with failed full GET stays blocked without a duplicate mutation', async () => {
  const { result } = await setup();
  get.mockRejectedValueOnce(error(500));
  await act(async () => {
    await result.current.change({ action: 'confirm' });
  });
  expect(result.current.recovery?.kind).toBe('refresh');
  await act(async () => {
    await result.current.change({ action: 'confirm' });
  });
  expect(mutate).toHaveBeenCalledTimes(1);
  get.mockResolvedValueOnce({ ...detail, status: 'confirmed' });
  await act(async () => {
    await result.current.read();
  });
  expect(result.current.recovery).toBeNull();
});
test('newer notes draft survives delayed save/GET, with no focus jump; empty save clears authoritatively', async () => {
  const { result } = await setup();
  act(() => result.current.setNotesDraft('submitted'));
  const response = deferred<typeof receipt>();
  mutate.mockReturnValueOnce(response.promise);
  get.mockResolvedValueOnce({ ...detail, notes: 'submitted' });
  let pending!: Promise<boolean>;
  act(() => {
    pending = result.current.change({
      action: 'notes',
      notes: result.current.notesDraft,
    });
  });
  act(() => result.current.setNotesDraft('newer draft'));
  await act(async () => {
    response.resolve({ ...receipt, notes: 'submitted' } as typeof receipt);
    await pending;
  });
  expect(result.current.notesDraft).toBe('newer draft');
  expect(result.current.reservation?.notes).toBe('submitted');
  expect(result.current.focus).toBeNull();
  act(() => result.current.setNotesDraft(''));
  get.mockResolvedValueOnce({ ...detail, notes: undefined });
  await act(async () => {
    await result.current.change({ action: 'notes', notes: '' });
  });
  expect(result.current.notesDraft).toBe('');
  expect(result.current.reservation?.notes).toBeUndefined();
  expect(result.current.announcement).toBe('Poznámky byly uloženy.');
});
test.each(['resolve', 'reject'] as const)(
  'route replacement ignores obsolete mutation %s and never clears newer request',
  async outcome => {
    const { result, rerender, props } = await setup();
    const old = deferred<typeof receipt>();
    mutate.mockReturnValueOnce(old.promise);
    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current.change({ action: 'confirm' });
    });
    const signal = mutate.mock.calls[0][0].signal;
    get.mockResolvedValueOnce({ ...detail, id: 'r2' });
    rerender({ ...props, reservationId: 'r2' });
    await waitFor(() => expect(result.current.reservation?.id).toBe('r2'));
    const newer = deferred<typeof receipt>();
    mutate.mockReturnValueOnce(newer.promise);
    act(() => {
      void result.current.change({ action: 'confirm' });
    });
    await act(async () => {
      outcome === 'resolve' ? old.resolve(receipt) : old.reject(error(403));
      await pending;
    });
    expect(signal?.aborted).toBe(true);
    expect(result.current.busy).toBe('confirm');
    expect(props.onAccessError).not.toHaveBeenCalled();
    await act(async () => newer.reject(error(null)));
    expect(result.current.recovery?.kind).toBe('unknown');
  }
);
test('new token hides old data immediately; delayed GET cannot restore old auth data or escalate old error', async () => {
  const { result, rerender, props } = await setup();
  const read = deferred<ReservationDetail>();
  get.mockReturnValueOnce(read.promise);
  act(() => {
    void result.current.read();
  });
  get.mockResolvedValueOnce({ ...detail, notes: 'new owner' });
  rerender({ ...props, token: 'second' });
  expect(result.current.reservation).toBeNull();
  await waitFor(() =>
    expect(result.current.reservation?.notes).toBe('new owner')
  );
  await act(async () => read.reject(error(401)));
  expect(result.current.reservation?.notes).toBe('new owner');
  expect(props.onAccessError).not.toHaveBeenCalled();
});
test('404 removes actions; current access error delegates; unmounted mutation cannot update anything', async () => {
  const first = await setup();
  mutate.mockRejectedValueOnce(error(404, 'RESERVATION_NOT_FOUND'));
  await act(async () => {
    await first.result.current.change({ action: 'confirm' });
  });
  expect(first.result.current.kind).toBe('not-found');
  expect(first.result.current.reservation).toBeNull();
  first.unmount();
  const second = await setup();
  second.props.onAccessError.mockReturnValue(true);
  mutate.mockRejectedValueOnce(error(403, 'ADMIN_FORBIDDEN'));
  await act(async () => {
    await second.result.current.change({ action: 'confirm' });
  });
  expect(second.props.onAccessError).toHaveBeenCalled();
  second.unmount();
  const third = await setup();
  const response = deferred<typeof receipt>();
  mutate.mockReturnValueOnce(response.promise);
  act(() => {
    void third.result.current.change({ action: 'confirm' });
  });
  const signal = mutate.mock.calls.at(-1)![0].signal;
  third.unmount();
  expect(signal?.aborted).toBe(true);
  await act(async () => response.reject(error(403)));
  expect(third.props.onAccessError).not.toHaveBeenCalled();
});
