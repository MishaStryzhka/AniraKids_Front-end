import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { confirmUserEmail } from '../../redux/auth/operations';
import { Page, Title, Copy, Panel, Actions, RouteLink } from '../../storefront/storefrontStyles';
import { routes } from '../../navigation/routes';

const ConfirmEmailPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [changeEmail] = useState(() => searchParams.has('changeToken'));
  const [token] = useState(() => searchParams.get('changeToken') || searchParams.get('verifyToken') || searchParams.get('token'));
  const [status, setStatus] = useState(token ? 'pending' : 'invalid');
  const request = useRef(null);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!token) return;
    // Remove the link credential from the address bar; retain it only for this mounted page.
    if (searchParams.has('token') || searchParams.has('changeToken') || searchParams.has('verifyToken')) {
      const clean = new URLSearchParams(searchParams);
      clean.delete('token');
      clean.delete('changeToken');
      clean.delete('verifyToken');
      setSearchParams(clean, { replace: true });
    }
    if (!request.current) request.current = dispatch(confirmUserEmail({ token, changeEmail }));
    let active = true;
    request.current.then(action => {
      if (active) setStatus(action.meta.requestStatus === 'fulfilled' ? 'success' : 'error');
    });
    return () => { active = false; };
  }, [dispatch, token, changeEmail, searchParams, setSearchParams]);
  return <Page>
    <Title>Potvrzení e-mailu</Title>
    <Panel role={status === 'error' || status === 'invalid' ? 'alert' : 'status'}>
      <Copy>{status === 'pending' ? 'Potvrzujeme vaši e-mailovou adresu…' :
        status === 'success' ? 'Vaše e-mailová adresa byla úspěšně potvrzena.' :
        status === 'invalid' ? 'V odkazu chybí potvrzovací údaj. Otevřete odkaz z e-mailu nebo si v účtu vyžádejte nový.' :
        'E-mail se nepodařilo potvrdit. Odkaz mohl vypršet. Přihlaste se do účtu a vyžádejte si nový potvrzovací e-mail.'}</Copy>
    </Panel>
    <Actions><RouteLink to={routes.account}>Přejít do účtu</RouteLink><RouteLink to={routes.dresses}>Prohlédnout šaty</RouteLink></Actions>
  </Page>;
};
export default ConfirmEmailPage;
