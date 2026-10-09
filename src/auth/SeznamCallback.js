import { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authBySeznam } from '../redux/auth/operations';
import { consumeSeznamAttempt } from './seznamFlow';
import { ModalAuthContext } from '../context/ModalAuthContext';
export default function SeznamCallback() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const dispatch = useDispatch(), navigate = useNavigate();
  const { setIsOpenModalAuth, setAuthNotice } = useContext(ModalAuthContext);
  const operation = useRef(null);
  const isCallback = params.has('code') || params.has('error');
  useEffect(() => {
    if (!isCallback) return;
    let active = true;
    if (!operation.current) {
      const clean = new URL(window.location.href);
      ['code', 'state', 'error', 'error_description', 'iss'].forEach(key => clean.searchParams.delete(key));
      window.history.replaceState(window.history.state, '', clean.pathname + clean.search + clean.hash);
      const valid = consumeSeznamAttempt(params.get('state'));
      operation.current = !valid || params.has('error') || !params.get('code')
        ? Promise.reject(new Error('INVALID_ATTEMPT'))
        : dispatch(authBySeznam({ code: params.get('code'), redirect_uri: window.location.origin })).unwrap();
    }
    operation.current.then(() => { if (active) navigate('/ucet', { replace: true }); }, () => {
      if (active) {
        setAuthNotice('Přihlášení přes Seznam se nepodařilo dokončit. Zkuste se prosím přihlásit znovu.');
        setIsOpenModalAuth(true);
      }
    });
    return () => { active = false; };
  }, [dispatch, isCallback, navigate, params, setAuthNotice, setIsOpenModalAuth]);
  return null;
}
