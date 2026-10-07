import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../design-system/components/Button';
import { NavigationLink } from '../../design-system/components/NavigationLink';
import { Spinner } from '../../design-system/components/Spinner';
import { StatusBadge } from '../../design-system/components/StatusBadge';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { useAuth } from '../../hooks/useAuth';
import { useAdminAccess } from '../auth/AdminAccessBoundary';
import { getAdminReservationDetail } from '../api/reservations';
import { adminRoutes } from '../navigation/adminRoutes';
import { formatCalendarDay } from '../calendar/calendarDates';
import { formatPragueLoadedAt } from '../calendar/reservationCalendarModel';
import {
  customerName,
  inventoryCondition,
  inventoryStatus,
  money,
  reservationMode,
  reservationPayment,
  reservationStatus,
} from './reservationPresentation';
import {
  reservationBackContext,
  reservationListBackLink,
} from './reservationNavigation';
import { useReservationRead } from './useReservationRead';
import {
  ReservationPage,
  ReservationCopy,
  ReservationPanel,
  ReservationHeading,
  ReservationBadges,
  ReservationFacts,
  ReservationActions,
} from './reservationStyles';
const Items = styled.ul`
  display: grid;
  gap: ${t.space[4]};
  list-style: none;
  padding: 0;
  margin: 0;
`;
const Item = styled.li`
  display: grid;
  gap: ${t.space[3]};
  min-inline-size: 0;
  & + & {
    border-block-start: 1px solid ${t.color.border.subtle};
    padding-block-start: ${t.space[4]};
  }
`;
const ItemTitle = styled.h3`
  font-size: ${t.type.bodyLg.size};
  line-height: ${t.type.bodyLg.lineHeight};
  margin: 0;
`;
const DetailFacts = styled(ReservationFacts)`
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
const Notes = styled.p`
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;
export function AdminReservationDetailPage() {
  const { reservationId } = useParams(),
    { token } = useAuth(),
    { handleRequestError } = useAdminAccess(),
    location = useLocation();
  const [revision, setRevision] = useState(0);
  const context = reservationBackContext(location.state),
    back = reservationListBackLink(context);
  const state = useReservationRead({
    token: token ?? '',
    requestKey: `detail:${reservationId ?? ''}`,
    revision,
    onAccessError: handleRequestError,
    allowNotFound: true,
    read: signal =>
      getAdminReservationDetail({
        token: token ?? '',
        reservationId: reservationId ?? '',
        signal,
      }),
  });
  const reservation = state.kind === 'success' ? state.data : null,
    status = reservation ? reservationStatus(reservation.status) : null,
    payment = reservation
      ? reservationPayment(reservation.paymentStatus)
      : null;
  return (
    <ReservationPage data-admin-reservation-detail>
      <ReservationActions>
        <NavigationLink variant="plain" to={back.to} state={back.state}>
          Zpět na rezervace
        </NavigationLink>
        {context?.kind === 'calendar' ? (
          <NavigationLink variant="plain" to={adminRoutes.calendar}>
            Zpět na kalendář
          </NavigationLink>
        ) : null}
      </ReservationActions>
      {state.kind === 'loading' ? (
        <ReservationPanel role="status">
          <ReservationBadges>
            <Spinner size="sm" />
            Načítání rezervace…
          </ReservationBadges>
        </ReservationPanel>
      ) : null}
      {state.kind === 'not-found' ? (
        <ReservationPanel>
          <ReservationHeading>Rezervace nebyla nalezena</ReservationHeading>
          <ReservationCopy>
            Rezervace už nemusí existovat nebo odkaz není platný.
          </ReservationCopy>
        </ReservationPanel>
      ) : null}
      {state.kind === 'error' ? (
        <ReservationPanel role="alert">
          <ReservationHeading>
            Rezervaci se nepodařilo načíst
          </ReservationHeading>
          <ReservationCopy>Zkuste to prosím znovu.</ReservationCopy>
          <Button onClick={() => setRevision(value => value + 1)}>
            Zkusit znovu
          </Button>
        </ReservationPanel>
      ) : null}
      {reservation && status && payment ? (
        <>
          <ReservationHeading>
            {reservation.reservationNumber}
          </ReservationHeading>
          <ReservationBadges>
            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
            {reservation.pendingExpired ? (
              <StatusBadge tone="warning">Čekání vypršelo</StatusBadge>
            ) : null}
          </ReservationBadges>
          <ReservationPanel>
            <ReservationHeading>Zákazník</ReservationHeading>
            <DetailFacts>
              <div>
                <dt>Jméno</dt>
                <dd>{customerName(reservation.customerSnapshot)}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>
                  {reservation.customerSnapshot.email || 'E-mail neuveden'}
                </dd>
              </div>
              <div>
                <dt>Telefon</dt>
                <dd>
                  {reservation.customerSnapshot.phone || 'Telefon neuveden'}
                </dd>
              </div>
            </DetailFacts>
          </ReservationPanel>
          <ReservationPanel>
            <ReservationHeading>Termín pronájmu</ReservationHeading>
            <DetailFacts>
              <div>
                <dt>Termín</dt>
                <dd>
                  {formatCalendarDay(reservation.startDate)} –{' '}
                  {formatCalendarDay(reservation.endDate)}
                </dd>
              </div>
              <div>
                <dt>Režim pronájmu</dt>
                <dd>{reservationMode(reservation.rentalMode)}</dd>
              </div>
              {reservation.expiresAt ? (
                <div>
                  <dt>Vypršení čekání</dt>
                  <dd>
                    {formatPragueLoadedAt(new Date(reservation.expiresAt))}
                  </dd>
                </div>
              ) : null}
              {reservation.fulfillmentMethod ? (
                <div>
                  <dt>Způsob předání</dt>
                  <dd>
                    {reservation.fulfillmentMethod === 'pickup'
                      ? 'Osobní vyzvednutí'
                      : 'Jiný způsob předání'}
                  </dd>
                </div>
              ) : null}
            </DetailFacts>
          </ReservationPanel>
          <ReservationPanel>
            <ReservationHeading>Položky</ReservationHeading>
            <Items>
              {reservation.items.map(item => (
                <Item key={item.inventoryItemId}>
                  <ItemTitle>{item.productNameSnapshot}</ItemTitle>
                  <DetailFacts>
                    <div>
                      <dt>Velikost</dt>
                      <dd>{item.sizeSnapshot}</dd>
                    </div>
                    <div>
                      <dt>Cena pronájmu</dt>
                      <dd>{money(item.rentalPriceSnapshot)}</dd>
                    </div>
                    <div>
                      <dt>Kauce</dt>
                      <dd>{money(item.depositSnapshot)}</dd>
                    </div>
                    {item.inventoryCurrent ? (
                      <>
                        <div>
                          <dt>Interní kód kusu</dt>
                          <dd>{item.inventoryCurrent.internalCode}</dd>
                        </div>
                        <div>
                          <dt>Provozní stav</dt>
                          <dd>
                            {inventoryStatus(item.inventoryCurrent.status)}
                          </dd>
                        </div>
                        <div>
                          <dt>Stav kusu</dt>
                          <dd>
                            {inventoryCondition(
                              item.inventoryCurrent.condition
                            )}
                          </dd>
                        </div>
                      </>
                    ) : null}
                  </DetailFacts>
                  {item.inventoryCurrent === null ? (
                    <ReservationCopy>
                      Aktuální údaje o fyzickém kusu nejsou k dispozici.
                    </ReservationCopy>
                  ) : null}
                </Item>
              ))}
            </Items>
          </ReservationPanel>
          <ReservationPanel>
            <ReservationHeading>Platba</ReservationHeading>
            <StatusBadge tone={payment.tone}>{payment.label}</StatusBadge>
            <DetailFacts>
              <div>
                <dt>Cena pronájmu</dt>
                <dd>{money(reservation.subtotal)}</dd>
              </div>
              <div>
                <dt>Kauce</dt>
                <dd>{money(reservation.deposit)}</dd>
              </div>
              <div>
                <dt>Celkem k úhradě</dt>
                <dd>{money(reservation.totalDue)}</dd>
              </div>
            </DetailFacts>
          </ReservationPanel>
          {reservation.notes ? (
            <ReservationPanel>
              <ReservationHeading>Poznámky</ReservationHeading>
              <Notes>{reservation.notes}</Notes>
            </ReservationPanel>
          ) : null}
          {reservation.cancelledAt || reservation.cancellationReason ? (
            <ReservationPanel>
              <ReservationHeading>Zrušení rezervace</ReservationHeading>
              {reservation.cancelledAt ? (
                <ReservationCopy>
                  {formatPragueLoadedAt(new Date(reservation.cancelledAt))}
                </ReservationCopy>
              ) : null}
              {reservation.cancellationReason ? (
                <Notes>{reservation.cancellationReason}</Notes>
              ) : null}
            </ReservationPanel>
          ) : null}
        </>
      ) : null}
    </ReservationPage>
  );
}
