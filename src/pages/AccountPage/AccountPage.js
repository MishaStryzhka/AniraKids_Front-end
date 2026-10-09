import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logOut } from '../../redux/auth/operations';
import { lazy, Suspense, useContext, useState } from 'react';
import styled from 'styled-components';
import { useAuth, useTitle } from 'hooks';
import { ModalAuthContext } from '../../context/ModalAuthContext';
import { Button } from '../../design-system/components/Button';

const Profile = lazy(() => import('../UserPage/Pages/Profile/Profile'));
const Content = styled.section`
  width: 100%; max-width: 904px; margin: 0 auto;
  padding: 32px 24px 64px; min-height: 320px;
  h1 { margin: 0 0 24px; }
  p { margin: 0 0 20px; }
  @media (max-width: 767px) { padding: 24px 16px 40px; }
`;

export default function AccountPage() {
  const { isLoggedIn, isRefreshing, user } = useAuth();
  const { setIsOpenModalAuth } = useContext(ModalAuthContext);
  useTitle('Můj účet – ANIRAK');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const leave = async () => {
    setLeaving(true); setLogoutError('');
    try { await dispatch(logOut()).unwrap(); navigate('/', { replace: true }); }
    catch { setLogoutError('Odhlášení se nezdařilo. Zkuste to prosím znovu.'); }
    finally { setLeaving(false); }
  };
  return <Content aria-labelledby="account-title">
    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <h1 id="account-title">Můj účet</h1>
      {isLoggedIn && <Button type="button" variant="secondary" disabled={leaving} onClick={leave}>{leaving ? 'Odhlašování…' : 'Odhlásit se'}</Button>}
    </div>
    {logoutError && <p role="alert">{logoutError}</p>}
    {isRefreshing ? <p role="status">Načítáme váš účet…</p> :
      isLoggedIn && user ?
        <Suspense fallback={<p role="status">Načítáme profil…</p>}><Profile /></Suspense> :
        <><p>Pro zobrazení profilu se přihlaste.</p>
          <Button type="button" onClick={() => setIsOpenModalAuth(true)}>Přihlásit se</Button></>}
  </Content>;
}
