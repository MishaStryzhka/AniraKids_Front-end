import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { partnerApi } from './api';
export function PartnerEntry({token,isLoggedIn}:{token?:string;isLoggedIn:boolean}) {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    let active = true;
    setAllowed(false);
    if (token && isLoggedIn)
      partnerApi('access', token)
        .then(() => {
          if (active) setAllowed(true);
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, [token, isLoggedIn]);
  return allowed ? (
    <Link
      to="/partner"
      style={{ display: 'inline-flex', minHeight: 44, alignItems: 'center' }}
    >
      Blaze · Partnerský kabinet
    </Link>
  ) : null;
}
