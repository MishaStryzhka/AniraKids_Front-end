import { act, renderHook, waitFor } from '@testing-library/react';
import { AdminApiError } from '../api/errors';
import { useReservationRead } from './useReservationRead';
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const setup = () => {
  const props = {
    requestKey: 'list:1',
    token: 'first',
    revision: 0,
    read: jest
      .fn<Promise<string>, [AbortSignal]>()
      .mockResolvedValue('first data'),
    onAccessError: jest.fn(() => false),
    enabled: true,
  };
  return {
    ...renderHook(input => useReservationRead(input), { initialProps: props }),
    props,
  };
};
test('refresh removes previous result immediately and current error cannot leave stale data', async () => {
  const { result, rerender, props } = setup();
  await waitFor(() =>
    expect(result.current).toMatchObject({
      kind: 'success',
      data: 'first data',
    })
  );
  const pending = deferred<string>();
  props.read.mockReturnValue(pending.promise);
  rerender({ ...props, revision: 1 });
  expect(result.current.kind).toBe('loading');
  await act(async () => pending.reject(new Error('offline')));
  expect(result.current.kind).toBe('error');
  expect('data' in result.current).toBe(false);
});
test.each(['resolve', 'reject'] as const)(
  'old query %s cannot replace the newer result or escalate access',
  async outcome => {
    const { result, rerender, props } = setup();
    await waitFor(() => expect(props.read).toHaveBeenCalled());
    const pending = deferred<string>();
    props.read.mockReturnValueOnce(pending.promise);
    rerender({ ...props, requestKey: 'list:2' });
    await waitFor(() => expect(props.read).toHaveBeenCalledTimes(2));
    const signal = props.read.mock.calls[1][0];
    props.read.mockResolvedValueOnce('third data');
    rerender({ ...props, requestKey: 'list:3' });
    await waitFor(() =>
      expect(result.current).toMatchObject({
        kind: 'success',
        data: 'third data',
      })
    );
    expect(signal.aborted).toBe(true);
    await act(async () =>
      outcome === 'resolve'
        ? pending.resolve('stale')
        : pending.reject(new Error('stale403'))
    );
    expect(result.current).toMatchObject({
      kind: 'success',
      data: 'third data',
    });
    expect(props.onAccessError).not.toHaveBeenCalled();
  }
);
test('auth replacement excludes successful old data synchronously and rejects old pending ownership', async () => {
  const { result, rerender, props } = setup();
  await waitFor(() => expect(result.current.kind).toBe('success'));
  const second = deferred<string>();
  props.read.mockReturnValueOnce(second.promise);
  rerender({ ...props, token: 'second' });
  expect(result.current.kind).toBe('loading');
  await waitFor(() => expect(props.read).toHaveBeenCalledTimes(2));
  props.read.mockResolvedValueOnce('third');
  rerender({ ...props, token: 'third' });
  await waitFor(() =>
    expect(result.current).toMatchObject({ kind: 'success', data: 'third' })
  );
  await act(async () => second.reject(new Error('old401')));
  expect(result.current).toMatchObject({ kind: 'success', data: 'third' });
  expect(props.onAccessError).not.toHaveBeenCalled();
});
test('disabled invalid query never reads; re-enabled query succeeds and unmounted requests abort', async () => {
  const read = jest.fn().mockResolvedValue('valid'),
    onAccessError = jest.fn(() => false);
  const props = {
    requestKey: 'invalid',
    token: 'token',
    revision: 0,
    read,
    onAccessError,
    enabled: false,
  };
  const { rerender, result, unmount } = renderHook(
    input => useReservationRead(input),
    { initialProps: props }
  );
  expect(read).not.toHaveBeenCalled();
  rerender({ ...props, enabled: true });
  await waitFor(() => expect(result.current.kind).toBe('success'));
  const pending = deferred<string>();
  read.mockReturnValueOnce(pending.promise);
  rerender({ ...props, enabled: true, revision: 1 });
  await waitFor(() => expect(read).toHaveBeenCalledTimes(2));
  const signal = read.mock.calls[1][0];
  unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => pending.reject(new Error('old403')));
  expect(onAccessError).not.toHaveBeenCalled();
});
test('current detail404 is not-found and access errors go to the shared boundary', async () => {
  const read = jest
      .fn()
      .mockRejectedValue(
        new AdminApiError({
          status: 404,
          code: 'NOT_FOUND',
          kind: 'unexpected',
          message: 'missing',
        })
      ),
    onAccessError = jest.fn(() => false);
  const props = {
    requestKey: 'detail:r1',
    token: 'token',
    revision: 0,
    read,
    onAccessError,
    allowNotFound: true,
  };
  const { result, rerender } = renderHook(input => useReservationRead(input), {
    initialProps: props,
  });
  await waitFor(() => expect(result.current.kind).toBe('not-found'));
  onAccessError.mockReturnValue(true);
  read.mockRejectedValue(new Error('access'));
  rerender({ ...props, revision: 1 });
  await waitFor(() => expect(onAccessError).toHaveBeenCalledTimes(2));
  expect(result.current.kind).toBe('loading');
});
