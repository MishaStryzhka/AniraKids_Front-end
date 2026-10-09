import { useEffect, useState, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { Page, Title, Panel, Copy, Stack } from '../../storefront/storefrontStyles';
import { ModalAuthContext } from '../../context/ModalAuthContext';
import { clearSession } from '../../redux/auth/slice';
export default function RefreshPasswordPage() {
  const [params, setParams] = useSearchParams();
  const [token] = useState(() => params.get('resetToken'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const { setIsOpenModalAuth } = useContext(ModalAuthContext);
  useEffect(() => {
    if (params.has('resetToken')) { const clean = new URLSearchParams(params); clean.delete('resetToken'); setParams(clean, { replace: true }); }
  }, [params, setParams]);
  const submit = async event => {
    event.preventDefault(); setError('');
    if (token && (password.length < 8 || password !== confirmation)) { setError('Heslo musí mít alespoň 8 znaků a obě zadaná hesla musí být stejná.'); return; }
    setBusy(true);
    try {
      await axios.post(token ? '/api/users/password/reset' : '/api/users/password/request-reset', token ? { token, password } : { email });
      if (token) { dispatch(clearSession()); delete axios.defaults.headers.common.Authorization; setPassword(''); setConfirmation(''); }
      setDone(true);
    } catch (failure) {
      setError(token ? 'Odkaz je neplatný nebo již vypršel. Vyžádejte si nový odkaz pro obnovení hesla.' : 'Požadavek se nepodařilo odeslat. Zkuste to prosím znovu.');
    } finally { setBusy(false); }
  };
  return <Page><Title>{token ? 'Nastavit nové heslo' : 'Obnovení hesla'}</Title><Panel>
    {done ? <Stack><Copy role="status">{token ? 'Heslo bylo změněno. Nyní se přihlaste novým heslem.' : 'Pokud pro tuto adresu existuje účet, pošleme vám odkaz pro obnovení hesla. Odkaz platí 30 minut. Zkontrolujte také složku Spam.'}</Copy>
      {token && <Button type="button" onClick={() => setIsOpenModalAuth(true)}>Přihlásit se</Button>}</Stack>
    : <form onSubmit={submit}><Stack>
      <Copy>{token ? 'Zvolte heslo s alespoň 8 znaky. Po změně budou předchozí přihlášení ukončena.' : 'Zadejte e-mail svého účtu. Pošleme vám odkaz pro bezpečné nastavení hesla.'}</Copy>
      {token ? <><Input label="Nové heslo" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
      <Input label="Zopakujte nové heslo" type="password" autoComplete="new-password" required value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={busy} /></>
      : <Input label="E-mail" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />}
      {error && <Copy role="alert">{error}</Copy>}
      <Button type="submit" disabled={busy}>{busy ? 'Zpracování…' : token ? 'Uložit nové heslo' : 'Poslat odkaz'}</Button>
      {token && error && <a href="/refreshPassword">Vyžádat nový odkaz</a>}
    </Stack></form>}
  </Panel></Page>;
}
