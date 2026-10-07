import { act, renderHook } from '@testing-library/react';
import {
  createAvailabilityBlock,
  deleteAvailabilityBlock,
  getAvailabilityBlocks,
  type AvailabilityBlock,
} from '../api/availabilityBlocks';
import { AdminApiError } from '../api/errors';
import { useAvailabilityBlocks } from './useAvailabilityBlocks';
import {
  blockFixture as block,
  validBlockDraft as draft,
} from './blockFixtures';
jest.mock('../api/availabilityBlocks', () => ({
  getAvailabilityBlocks: jest.fn(),
  createAvailabilityBlock: jest.fn(),
  deleteAvailabilityBlock: jest.fn(),
  blockReasons: ['cleaning', 'repair', 'internal_use', 'photoshoot', 'other'],
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
jest.mock('../calendar/calendarDates', () => ({
  ...jest.requireActual('../calendar/calendarDates'),
  pragueToday: () => '2026-10-07',
}));
const get = getAvailabilityBlocks as jest.MockedFunction<
    typeof getAvailabilityBlocks
  >,
  create = createAvailabilityBlock as jest.MockedFunction<
    typeof createAvailabilityBlock
  >,
  remove = deleteAvailabilityBlock as jest.MockedFunction<
    typeof deleteAvailabilityBlock
  >;
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const failure = (status: number | null, code = 'FAILED') =>
  new AdminApiError({
    status,
    code,
    kind: status === null ? 'network' : 'unexpected',
    message: 'private error',
  });
function setup() {
  const props = {
    token: 'token',
    inventoryItemId: 'i1',
    active: true,
    itemVersion: {},
    onAccessError: jest.fn(() => false),
    canWrite: jest.fn(() => true),
    onRisk: jest.fn(),
  };
  return {
    ...renderHook(input => useAvailabilityBlocks(input), {
      initialProps: props,
    }),
    props,
  };
}
beforeEach(() => {
  jest.clearAllMocks();
  get.mockResolvedValue([]);
  create.mockResolvedValue(block);
  remove.mockResolvedValue(undefined);
});
async function ready() {
  const view = setup();
  expect(get).not.toHaveBeenCalled();
  await act(async () => {
    await view.result.current.read();
  });
  act(() => {
    view.result.current.openForm();
    view.result.current.setDraft(draft);
  });
  return view;
}
test('lazy read, one synchronous flight through create+GET, and authoritative delete+GET', async () => {
  const { result } = await ready();
  const pending = deferred<AvailabilityBlock>();
  create.mockReturnValueOnce(pending.promise);
  get.mockResolvedValueOnce([block]);
  let promise!: Promise<boolean>;
  act(() => {
    promise = result.current.write('create');
    void result.current.write('create');
  });
  expect(create).toHaveBeenCalledTimes(1);
  await act(async () => {
    pending.resolve(block);
    await promise;
  });
  expect(result.current.items).toEqual([block]);
  expect(result.current.formOpen).toBe(false);
  get.mockResolvedValueOnce([]);
  await act(async () => {
    await result.current.write('delete', 'b1');
  });
  expect(remove).toHaveBeenCalledTimes(1);
  expect(result.current.items).toEqual([]);
  expect(result.current.announcement).toBe('Blokování bylo odstraněno.');
});
test('inactive item can read/delete but cannot create', async () => {
  const { result, rerender, props } = setup();
  get.mockResolvedValueOnce([block]);
  rerender({ ...props, active: false });
  await act(async () => {
    await result.current.read();
  });
  act(() => result.current.setDraft(draft));
  await act(async () => {
    await result.current.write('create');
  });
  expect(create).not.toHaveBeenCalled();
  await act(async () => {
    await result.current.write('delete', 'b1');
  });
  expect(remove).toHaveBeenCalledTimes(1);
});
test.each(['create', 'delete'] as const)(
  'unknown %s preserves draft and blocks repeat writes until explicit GET',
  async kind => {
    const { result, props } = await ready();
    if (kind === 'delete') {
      get.mockResolvedValueOnce([block]);
      await act(async () => {
        await result.current.read();
      });
      remove.mockRejectedValueOnce(failure(null));
    } else create.mockRejectedValueOnce(failure(500));
    await act(async () => {
      await result.current.write(kind, 'b1');
    });
    expect(result.current.recovery).toBe(kind);
    expect(result.current.draft).toEqual(draft);
    expect(props.onRisk).toHaveBeenLastCalledWith(
      'i1',
      expect.objectContaining({ unresolved: true })
    );
    const reads = get.mock.calls.length;
    await act(async () => {
      await result.current.write(kind, 'b1');
    });
    expect(get).toHaveBeenCalledTimes(reads);
    get.mockRejectedValueOnce(failure(500));
    await act(async () => {
      await result.current.read();
    });
    expect(result.current.recovery).toBe(kind);
    get.mockResolvedValueOnce([block]);
    await act(async () => {
      await result.current.read();
    });
    expect(result.current.recovery).toBeNull();
    expect(result.current.announcement).toBe(
      'Aktuální blokování byla načtena.'
    );
    expect(result.current.draft).toEqual(draft);
  }
);
test('409 overlap and missing block404 require fresh list; inactive409 denies create; invalid date preserves input', async () => {
  const { result } = await ready();
  create.mockRejectedValueOnce(failure(409, 'AVAILABILITY_BLOCK_CONFLICT'));
  await act(async () => {
    await result.current.write('create');
  });
  expect(result.current.error).toContain('existujícím obsazením');
  expect(result.current.recovery).toBe('conflict');
  get.mockResolvedValueOnce([block]);
  await act(async () => {
    await result.current.read();
  });
  remove.mockRejectedValueOnce(failure(404, 'AVAILABILITY_BLOCK_NOT_FOUND'));
  await act(async () => {
    await result.current.write('delete', 'b1');
  });
  expect(result.current.recovery).toBe('conflict');
  await act(async () => {
    await result.current.read();
  });
  create.mockRejectedValueOnce(failure(409, 'INVENTORY_ITEM_NOT_ACTIVE'));
  await act(async () => {
    await result.current.write('create');
  });
  expect(result.current.createDenied).toBe(true);
  expect(result.current.draft).toEqual(draft);
});
test('valid mutation with failed list refresh stays blocked and never replays POST', async () => {
  const { result } = await ready();
  get.mockRejectedValueOnce(failure(500));
  await act(async () => {
    await result.current.write('create');
  });
  expect(result.current.recovery).toBe('refresh');
  await act(async () => {
    await result.current.write('create');
  });
  expect(create).toHaveBeenCalledTimes(1);
  await act(async () => {
    await result.current.read();
  });
  expect(result.current.recovery).toBeNull();
});
test.each(['resolve', 'reject'] as const)(
  'new token/item ignores old mutation %s and access errors',
  async outcome => {
    const { result, rerender, props } = await ready();
    const pending = deferred<AvailabilityBlock>();
    create.mockReturnValueOnce(pending.promise);
    let promise!: Promise<boolean>;
    act(() => {
      promise = result.current.write('create');
    });
    const signal = create.mock.calls[0][0].signal;
    rerender({ ...props, token: 'second', inventoryItemId: 'i2' });
    expect(result.current.items).toEqual([]);
    expect(result.current.loaded).toBe(false);
    await act(async () => {
      await result.current.read();
    });
    await act(async () => {
      outcome === 'resolve'
        ? pending.resolve(block)
        : pending.reject(failure(403));
      await promise;
    });
    expect(signal?.aborted).toBe(true);
    expect(result.current.owner.inventoryItemId).toBe('i2');
    expect(result.current.recovery).toBeNull();
    expect(props.onAccessError).not.toHaveBeenCalled();
  }
);
