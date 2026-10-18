import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { partnerApi } from './api';

export function usePartnerEntryAccess() {
  const { token, user, isLoggedIn, isRefreshing } = useAuth();
  const userId = user?.userID || user?._id;
  const [confirmed, setConfirmed] = useState<{
    token: string;
    userId: string;
  } | null>(null);
  useEffect(() => {
    setConfirmed(null);
    if (!token || !userId || !isLoggedIn || isRefreshing) return;
    let generation = 0;
    const check = () => {
      const current = ++generation;
      setConfirmed(null);
      partnerApi('access', token)
        .then(access => {
          if (
            current === generation &&
            access.enabled === true &&
            access.partnerId === 'blaze' &&
            access.owner !== true &&
            access.managePartners !== true &&
            ['administrator', 'photographer'].includes(access.role)
          )
            setConfirmed({ token, userId });
        })
        .catch(() => {});
    };
    check();
    window.addEventListener('focus', check);
    return () => {
      generation++;
      window.removeEventListener('focus', check);
    };
  }, [token, userId, isLoggedIn, isRefreshing]);
  return Boolean(
    isLoggedIn &&
    !isRefreshing &&
    token &&
    userId &&
    confirmed?.token === token &&
    confirmed?.userId === userId
  );
}
