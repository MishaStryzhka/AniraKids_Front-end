import { useContext, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ModalAuthContext } from '../../context/ModalAuthContext';
import { Button } from '../../design-system/components/Button';
import { getAccountReservations } from '../../storefront/api/publicApi';
import { usePublicRead } from '../../storefront/usePublicRead';
import { ReceiptPaymentInformation } from '../../storefront/payments/PaymentInformation';
import { statusLabel } from '../../storefront/booking/bookingModel';
import { formatCalendarDay } from '../../admin/calendar/calendarDates';
import { Page, Title, Panel, Copy, Heading, Stack, Actions, RouteLink } from '../../storefront/storefrontStyles';
export function AccountReservationsPage() {
  const { token, isLoggedIn, isRefreshing } = useAuth();
  const auth = useContext(ModalAuthContext);
  const [page, setPage] = useState(1);
  const result = usePublicRead(isLoggedIn && token ? `${token}:${page}` : null, signal => getAccountReservations(token, page, signal));
  return <Page><Title>Moje rezervace</Title>
    <Actions><RouteLink to="/ucet">Můj profil</RouteLink><RouteLink to="/saty">Vybrat šaty</RouteLink></Actions>
    {isRefreshing ? <Copy role="status">Načítáme účet…</Copy> : !isLoggedIn ? <Panel><Copy>Pro zobrazení svých rezervací se přihlaste.</Copy><Button onClick={() => auth?.setIsOpenModalAuth(true)}>Přihlásit se</Button></Panel>
    : result.loading ? <Copy role="status">Načítáme rezervace…</Copy> : result.error ? <Panel><Copy role="alert">Rezervace se nepodařilo načíst. Zkuste to znovu; pokud přihlášení vypršelo, přihlaste se znovu.</Copy><Button onClick={result.reload}>Zkusit znovu</Button></Panel>
    : result.data ? <Stack>
      <Copy>Celkem rezervací: {result.data.total}. Zobrazují se rezervace vytvořené pod tímto účtem. Rezervace vytvořené bez přihlášení otevřete jejich soukromým odkazem.</Copy>
      {result.data.items.length === 0 && <Panel><Copy>Zatím zde nejsou žádné rezervace.</Copy><RouteLink to="/saty">Prohlédnout nabídku</RouteLink></Panel>}
      {result.data.items.map(receipt => <Panel key={receipt.reservationNumber}>
        <Heading>{receipt.reservationNumber} · {statusLabel(receipt.status)}</Heading>
        <Copy>{receipt.item.productName} · Velikost {receipt.item.size}</Copy>
        <Copy>{formatCalendarDay(receipt.startDate)} – {formatCalendarDay(receipt.endDate)}</Copy>
        <details><summary style={{ minHeight: 44, cursor: 'pointer', padding: '12px 0' }}>Platby a podrobnosti</summary><ReceiptPaymentInformation receipt={receipt} /></details>
      </Panel>)}
      <Actions><Button variant="secondary" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Předchozí</Button><Copy>Strana {page}</Copy><Button variant="secondary" disabled={page * 20 >= result.data.total} onClick={() => setPage(value => value + 1)}>Další</Button><Button variant="secondary" onClick={result.reload}>Aktualizovat</Button></Actions>
    </Stack> : null}
  </Page>;
}
