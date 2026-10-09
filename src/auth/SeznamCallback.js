import { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authBySeznam } from '../redux/auth/operations';
import { consumeSeznamAttempt } from './seznamFlow';
import { ModalAuthContext } from '../context/ModalAuthContext';
import { Button } from '../design-system/components/Button';
export default function SeznamCallback() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const [error, setError] = useState('');
  const dispatch = useDispatch(), navigate = useNavigate();
  const { setIsOpenModalAuth } = useContext(ModalAuthContext);
  const operation = useRef(null);
  const isCallback = params.has('code') || params.has('error');
  useEffect(() => {
    if (!isCallback) return;
    let active = true;
    if (!operation.current) {
      const clean = new URL(window.location.href);
      ['code', 'state', 'error', 'error_description'].forEach(key => clean.searchParams.delete(key));
      window.history.replaceState(window.history.state, '', clean.pathname + clean.search + clean.hash);
      const valid = consumeSeznamAttempt(params.get('state'));
      operation.current = !valid || params.has('error') || !params.get('code')
        ? Promise.reject(new Error('INVALID_ATTEMPT'))
        : dispatch(authBySeznam({ code: params.get('code'), redirect_uri: window.location.origin })).unwrap();
    }
    operation.current.then(() => { if (active) navigate('/ucet', { replace: true }); }, () => {
      if (active) setError('Přihlášení přes Seznam se nepodařilo dokončit. Zkuste se prosím přihlásit znovu.');
    });
    return () => { active = false; };
  }, [dispatch, isCallback, navigate, params]);
  if (!isCallback) return null;
  return <section aria-label="Přihlášení přes Seznam" style={{ padding: 24 }}>
    {error ? <><p role="alert">{error}</p><Button onClick={() => setIsOpenModalAuth(true)}>Zkusit přihlášení znovu</Button></> : <p role="status">Dokončujeme přihlášení přes Seznam…</p>}
  </section>;
}
