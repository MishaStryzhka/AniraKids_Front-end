import { useContext, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ModalAuthContext } from '../../context/ModalAuthContext';
import { routes } from '../../navigation/routes';
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
    <Actions><RouteLink to={routes.account}>Můj profil</RouteLink></Actions>
    {isRefreshing ? <Copy role="status">Načítáme účet…</Copy> : !isLoggedIn ? <Panel><Copy>Pro zobrazení svých rezervací se přihlaste.</Copy><Button onClick={() => auth?.setIsOpenModalAuth(true)}>Přihlásit se</Button></Panel>
    : result.loading ? <Copy role="status">Načítáme rezervace…</Copy> : result.error ? <Panel><Copy role="alert">Rezervace se nepodařilo načíst. Zkuste to znovu; pokud přihlášení vypršelo, přihlaste se znovu.</Copy><Button onClick={result.reload}>Zkusit znovu</Button></Panel>
    : result.data ? <Stack>
      {result.data.total > 0 && <Copy>Celkem rezervací: {result.data.total}.</Copy>}
      {result.data.items.length === 0 && <Panel>
        <Copy>{page === 1 ? 'Zatím zde nejsou žádné rezervace.' : 'Na této stránce už nejsou žádné rezervace.'}</Copy>
        {page === 1 ? <Actions><RouteLink to={routes.newArrivals}>Prohlédnout nabídku</RouteLink></Actions>
          : <Button variant="secondary" onClick={() => setPage(1)}>Zpět na první stránku</Button>}
      </Panel>}
      {result.data.items.map(receipt => <Panel key={receipt.reservationNumber}>
        <Heading>{receipt.reservationNumber} · {statusLabel(receipt.status)}</Heading>
        <Copy>{receipt.item.productName} · Velikost {receipt.item.size}</Copy>
        <Copy>{formatCalendarDay(receipt.startDate)} – {formatCalendarDay(receipt.endDate)}</Copy>
        <details><summary style={{ minHeight: 44, cursor: 'pointer', padding: '12px 0' }}>Platby a podrobnosti</summary><ReceiptPaymentInformation receipt={receipt} /></details>
      </Panel>)}
      {(result.data.total > 20 || page > 1) && <Actions aria-label="Stránkování rezervací"><Button variant="secondary" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Předchozí</Button><Copy>Strana {page}</Copy><Button variant="secondary" disabled={page * 20 >= result.data.total} onClick={() => setPage(value => value + 1)}>Další</Button></Actions>}
      <details>
        <summary style={{ minHeight: 44, cursor: 'pointer', padding: '12px 0' }}>Rezervace bez přihlášení</summary>
        <Copy>Rezervace vytvořené bez přihlášení otevřete jejich soukromým odkazem.</Copy>
      </details>
      <Actions><Button variant="ghost" onClick={result.reload}>Aktualizovat seznam</Button></Actions>
    </Stack> : null}
  </Page>;
}
