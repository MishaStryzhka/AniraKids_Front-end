import { act, renderHook } from '@testing-library/react';
import { usePublicRead } from './usePublicRead';
import { deferred } from './booking/bookingFixtures';
test.each(['resolve', 'reject'] as const)(
  'changed selection immediately hides old result and ignores stale %s',
  async mode => {
    const old = deferred<string>(),
      next = deferred<string>();
    const { result, rerender } = renderHook(
      ({ key }) =>
        usePublicRead(key, () => (key === 'old' ? old.promise : next.promise)),
      { initialProps: { key: 'old' as string | null } }
    );
    rerender({ key: 'next' });
    expect(result.current.data).toBeNull();
    await act(async () => {
      if (mode === 'resolve') old.resolve('old');
      else old.reject(new Error('old'));
    });
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    await act(async () => next.resolve('next'));
    expect(result.current.data).toBe('next');
    rerender({ key: null });
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  }
);
test('opt-in refresh keeps same-key data, but errors and changed credentials hide it', async () => {
  const refresh = deferred<string>();
  const read = jest.fn().mockResolvedValueOnce('verified').mockReturnValueOnce(refresh.promise);
  const {result, rerender} = renderHook(({key}) => usePublicRead(key, read, true), {
    initialProps: {key: 'reservation:token-one'},
  });
  await act(async () => {});
  act(() => result.current.reload());
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toBe('verified');
  await act(async () => refresh.reject(new Error('offline')));
  expect(result.current.data).toBeNull();
  expect(result.current.error).toBeTruthy();
  read.mockResolvedValueOnce('verified-again');
  act(() => result.current.reload());
  await act(async () => {});
  expect(result.current.data).toBe('verified-again');
  read.mockReturnValue(new Promise(() => {}));
  rerender({key: 'reservation:token-two'});
  expect(result.current.data).toBeNull();
});
