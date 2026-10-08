import { useLocation } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { routes } from '../../navigation/routes';
import { getReservationStatus, isGuestAccessToken } from '../api/publicApi';
import { ReceiptPaymentInformation } from '../payments/PaymentInformation';
import { Actions, Copy, Heading, Page, Panel, RouteLink, Title } from '../storefrontStyles';
import { usePublicRead } from '../usePublicRead';
import { formatCalendarDay } from '../../admin/calendar/calendarDates';
import { statusLabel } from './bookingModel';

// The capability stays in the fragment: it is not sent in HTTP URLs/referrers.
export function reservationStatusPath(number: string, token: string) {
  return routes.reservationStatus + '#' + new URLSearchParams({ reservation: number, token });
}

export function BookingStatusPage() {
  const { hash } = useLocation();
  const params = new URLSearchParams(hash.slice(1));
  const number = params.get('reservation') ?? '';
  const token = params.get('token') ?? '';
  const valid = /^AK-\d{4}-[A-Z0-9]{6}$/.test(number) && isGuestAccessToken(token);
  const result = usePublicRead(valid ? hash : null, signal => getReservationStatus(number, token, signal));
  return <Page>
    <Title>Stav rezervace</Title>
    <Panel>
      {!valid ? <Copy role="alert">Odkaz na rezervaci není úplný. Otevřete svůj uložený odkaz nebo nás kontaktujte.</Copy>
        : result.loading ? <Copy role="status">Ověřování aktuálního stavu…</Copy>
        : result.error ? <>
          <Copy role="alert">Rezervaci se nepodařilo načíst. Zkontrolujte odkaz nebo nás kontaktujte. Nevytvářejte kvůli tomu novou rezervaci.</Copy>
          <Button onClick={result.reload}>Zkusit znovu</Button>
        </> : result.data ? <>
          <Heading>{result.data.reservationNumber}</Heading>
          <Copy>Stav: {statusLabel(result.data.status)}</Copy>
          <Heading>{result.data.item.productName}</Heading>
          <Copy>Velikost: {result.data.item.size}</Copy>
          <Copy>{formatCalendarDay(result.data.startDate)} – {formatCalendarDay(result.data.endDate)}</Copy>
          <ReceiptPaymentInformation receipt={result.data} />
          <Button onClick={result.reload}>Aktualizovat stav rezervace</Button>
          <Copy>Tento soukromý odkaz si uložte. Každý, kdo jej získá, může zobrazit stav této rezervace a platební pokyny.</Copy>
        </> : null}
      <Actions><RouteLink to={routes.contact}>Kontaktovat ANIRAK</RouteLink></Actions>
    </Panel>
  </Page>;
}
