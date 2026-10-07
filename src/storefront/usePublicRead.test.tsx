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
