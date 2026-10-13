import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { probeAdminAccess } from '../api/client';

// This only controls navigation visibility. Admin routes and API requests still
// perform their own authorization checks.
export function useAdminEntryAccess() {
  const { token, user, isLoggedIn, isRefreshing } = useAuth();
  const userId = user?.userID || user?._id;
  const [confirmed, setConfirmed] = useState<{ token: string; userId: string } | null>(null);

  useEffect(() => {
    setConfirmed(null);
    if (!isLoggedIn || isRefreshing || !token || !userId) return;

    let controller: AbortController | null = null;
    const check = () => {
      controller?.abort();
      const current = new AbortController();
      controller = current;
      setConfirmed(null);
      probeAdminAccess({ token, signal: current.signal })
        .then(() => {
          if (!current.signal.aborted) setConfirmed({ token, userId });
        })
        .catch(() => {
          // Guests, customers and unavailable checks all keep the entry hidden.
          if (!current.signal.aborted) setConfirmed(null);
        });
    };
    check();
    window.addEventListener('focus', check);
    return () => {
      controller?.abort();
      window.removeEventListener('focus', check);
    };
  }, [isLoggedIn, isRefreshing, token, userId]);

  return Boolean(isLoggedIn && !isRefreshing && token && userId &&
    confirmed?.token === token && confirmed?.userId === userId);
}
