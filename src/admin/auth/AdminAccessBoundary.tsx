import { useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../design-system/components/Button';
import { Container } from '../../design-system/components/Container';
import { NavigationLink } from '../../design-system/components/NavigationLink';
import { Spinner } from '../../design-system/components/Spinner';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { ModalAuthContext } from '../../context/ModalAuthContext';
import { useAuth } from '../../hooks/useAuth';
import { refreshUser } from '../../redux/auth/operations';
import { probeAdminAccess } from '../api/client';
import { AdminApiError, normalizeAdminApiError } from '../api/errors';

export type AdminAccessState =
  | 'auth_refreshing'
  | 'guest'
  | 'probing'
  | 'authorized'
  | 'unauthorized'
  | 'forbidden'
  | 'admin_disabled'
  | 'configuration_error'
  | 'network_error';

const Screen = styled.div`
  min-block-size: 100vh;
  display: grid;
  place-items: center;
  padding-block: ${t.space[8]};
  background: ${t.color.bg.canvas};
  color: ${t.color.text.primary};
  font-family: ${t.font.family.ui};
`;

const Panel = styled(Container)`max-inline-size: 560px;`;

const Card = styled.section`
  padding: ${t.space[6]};
  background: ${t.color.bg.surface};
  border: 1px solid ${t.color.border.subtle};
  border-radius: ${t.radius[3]};
`;

const Title = styled.h1`
  margin: 0 0 ${t.space[3]};
  font-family: ${t.font.family.ui};
  font-size: 24px;
  line-height: 32px;
  font-weight: ${t.font.weight.semibold};
`;

const Text = styled.p`
  margin: 0 0 ${t.space[4]};
  color: ${t.color.text.secondary};
  font-size: ${t.type.bodyMd.size};
  line-height: ${t.type.bodyMd.lineHeight};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${t.space[3]};
  align-items: center;
`;

const BackLink = styled(NavigationLink)`
  min-block-size: 44px;
  padding-inline: ${t.space[3]};
`;

function LoadingState({ label }: { label: string }) {
  return (
    <Screen>
      <Panel>
        <Card role="status" aria-live="polite">
          <Actions>
            <Spinner label={label} />
            <Text style={{ margin: 0 }}>{label}</Text>
          </Actions>
        </Card>
      </Panel>
    </Screen>
  );
}

function AccessStateView({
  state,
  onLogin,
  onRetry,
  onRecoverSession,
}: {
  state: Exclude<AdminAccessState, 'auth_refreshing' | 'probing' | 'authorized'>;
  onLogin(): void;
  onRetry(): void;
  onRecoverSession(): void;
}) {
  let title = 'Administrace';
  let text = '';
  let action: 'login' | 'retry' | 'recover' | null = null;

  if (state === 'guest') {
    text = 'Pro přístup do administrace se přihlaste.';
    action = 'login';
  } else if (state === 'unauthorized') {
    text = 'Přihlášení vypršelo nebo není platné.';
    action = 'recover';
  } else if (state === 'forbidden') {
    text = 'Nemáte oprávnění k administraci.';
  } else if (state === 'admin_disabled') {
    text = 'Administrace je momentálně nedostupná.';
  } else if (state === 'configuration_error') {
    text = 'Administrace není správně nakonfigurována.';
  } else {
    title = 'Administraci se nepodařilo načíst';
    text = 'Zkontrolujte připojení a zkuste to znovu.';
    action = 'retry';
  }

  return (
    <Screen>
      <Panel>
        <Card>
          <Title>{title}</Title>
          <Text>{text}</Text>
          <Actions>
            {action === 'login' ? <Button onClick={onLogin}>Přihlásit se</Button> : null}
            {action === 'retry' ? <Button onClick={onRetry}>Zkusit znovu</Button> : null}
            {action === 'recover' ? <Button onClick={onRecoverSession}>Obnovit přihlášení</Button> : null}
            <BackLink variant="plain" to="/">Zpět na web</BackLink>
          </Actions>
        </Card>
      </Panel>
    </Screen>
  );
}

export function stateFromAdminError(error: AdminApiError): AdminAccessState {
  if (error.kind === 'unauthorized') return 'unauthorized';
  if (error.kind === 'forbidden') return 'forbidden';
  if (error.kind === 'admin_disabled') return 'admin_disabled';
  if (error.kind === 'configuration_error') return 'configuration_error';
  return 'network_error';
}

export function AdminAccessBoundary() {
  const dispatch = useDispatch<any>();
  const { token, isLoggedIn, isRefreshing } = useAuth();
  const authModal = useContext(ModalAuthContext);
  const [state, setState] = useState<AdminAccessState>('auth_refreshing');
  const [retryRevision, setRetryRevision] = useState(0);

  useEffect(() => {
    if (isRefreshing || (token && !isLoggedIn)) {
      setState('auth_refreshing');
      return;
    }

    if (!isLoggedIn || !token) {
      setState('guest');
      return;
    }

    const controller = new AbortController();
    setState('probing');

    probeAdminAccess({ token, signal: controller.signal })
      .then(() => {
        if (!controller.signal.aborted) setState('authorized');
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        const normalized = normalizeAdminApiError(error);
        if (normalized.kind === 'cancelled') return;
        setState(stateFromAdminError(normalized));
      });

    return () => controller.abort();
  }, [isLoggedIn, isRefreshing, retryRevision, token]);

  const retry = useCallback(() => setRetryRevision(value => value + 1), []);
  const recoverSession = useCallback(() => { dispatch(refreshUser()); }, [dispatch]);

  if (state === 'auth_refreshing') return <LoadingState label="Ověřujeme přihlášení…" />;
  if (state === 'probing') return <LoadingState label="Ověřujeme přístup do administrace…" />;
  if (state === 'authorized') return <Outlet />;

  return (
    <AccessStateView
      state={state}
      onLogin={() => authModal?.setIsOpenModalAuth(true)}
      onRetry={retry}
      onRecoverSession={recoverSession}
    />
  );
}