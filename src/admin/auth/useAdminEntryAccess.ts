import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { probeAdminAccess } from '../api/client';

// This only controls navigation visibility. Admin routes and API requests still
// perform their own authorization checks.
export function useAdminEntryState() {
  const { token, user, isLoggedIn, isRefreshing } = useAuth();
  const userId = user?.userID || user?._id;
  const [confirmed, setConfirmed] = useState<{ token: string; userId: string; allowed: boolean } | null>(null);

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
          if (!current.signal.aborted) setConfirmed({ token, userId, allowed: true });
        })
        .catch(error => {
          // Guests, customers and unavailable checks all keep the entry hidden.
          if (!current.signal.aborted) setConfirmed(error?.kind === 'forbidden' ? { token, userId, allowed: false } : null);
        });
    };
    check();
    window.addEventListener('focus', check);
    return () => {
      controller?.abort();
      window.removeEventListener('focus', check);
    };
  }, [isLoggedIn, isRefreshing, token, userId]);

  const current = Boolean(isLoggedIn && !isRefreshing && token && userId &&
    confirmed?.token === token && confirmed?.userId === userId);
  return { canAccessAdmin: current && confirmed?.allowed === true,
    canUsePartnerEntry: current && confirmed?.allowed === false };
}

export function useAdminEntryAccess() {
  return useAdminEntryState().canAccessAdmin;
}
