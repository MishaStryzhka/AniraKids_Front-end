import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { SelectField } from '../../design-system/components/SelectField';
import { StatusBadge } from '../../design-system/components/StatusBadge';
import { NavigationLink } from '../../design-system/components/NavigationLink';
import { Pagination } from '../../design-system/components/Pagination';
import { Spinner } from '../../design-system/components/Spinner';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { useAuth } from '../../hooks/useAuth';
import { useAdminAccess } from '../auth/AdminAccessBoundary';
import {
  listAdminReservations,
  reservationStatuses,
  reservationPaymentStatuses,
  reservationRentalModes,
  type ReservationListItem,
} from '../api/reservations';
import {
  adminRoutes,
  buildAdminReservationDetailPath,
} from '../navigation/adminRoutes';
import { formatCalendarDay } from '../calendar/calendarDates';
import {
  buildReservationSearch,
  parseReservationSearch,
  validateReservationDates,
} from './reservationListQuery';
import {
  customerName,
  money,
  reservationMode,
  reservationPayment,
  reservationStatus,
} from './reservationPresentation';
import { reservationSearchFromState } from './reservationNavigation';
import { useReservationRead } from './useReservationRead';
import {
  ReservationPage,
  ReservationCopy,
  ReservationPanel,
  ReservationHeading,
  ReservationBadges,
  ReservationFacts,
  ReservationError,
  ReservationActions,
} from './reservationStyles';
const Filters = styled.form`
  display: grid;
  gap: ${t.space[4]};
`;
const Fields = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${t.space[4]};
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;
const TableWrap = styled.div`
  display: none;
  @media (min-width: 1440px) {
    display: block;
  }
`;
const Table = styled.table`
  inline-size: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: ${t.type.bodySm.size};
  th,
  td {
    padding: ${t.space[3]} ${t.space[2]};
    border-block-end: 1px solid ${t.color.border.subtle};
    text-align: start;
    vertical-align: top;
    overflow-wrap: anywhere;
  }
  th {
    font-weight: ${t.font.weight.semibold};
  }
  th:nth-child(1) {
    inline-size: 13%;
  }
  th:nth-child(2) {
    inline-size: 18%;
  }
  th:nth-child(3) {
    inline-size: 18%;
  }
  th:nth-child(4) {
    inline-size: 13%;
  }
  th:nth-child(5) {
    inline-size: 12%;
  }
  th:nth-child(6) {
    inline-size: 9%;
  }
  th:nth-child(7) {
    inline-size: 8%;
  }
  th:nth-child(8) {
    inline-size: 9%;
  }
  th,
  td:nth-child(4),
  td:nth-child(5),
  td:nth-child(8),
  td:nth-child(4) span,
  td:nth-child(5) span {
    overflow-wrap: normal;
  }
  td:nth-child(8) {
    white-space: nowrap;
  }
  td > a {
    min-block-size: 44px;
    display: inline-flex;
    align-items: center;
  }
  td > span {
    max-inline-size: 100%;
  }
`;
const MobileList = styled.ul`
  display: grid;
  gap: ${t.space[4]};
  margin: 0;
  padding: 0;
  list-style: none;
  @media (min-width: 1440px) {
    display: none;
  }
`;
const Card = styled.li`
  > span {
    justify-self: start;
  }
  padding: ${t.space[4]};
  border: 1px solid ${t.color.border.subtle};
  border-radius: ${t.radius[2]};
  background: ${t.color.bg.surface};
  display: grid;
  gap: ${t.space[3]};
  min-inline-size: 0;
  overflow-wrap: anywhere;
`;
const DetailLink = styled(NavigationLink)`
  justify-self: start;
  min-block-size: 44px;
  font-weight: ${t.font.weight.semibold};
`;
const labels = {
  previous: 'Předchozí',
  next: 'Další',
  navigation: 'Stránkování rezervací',
  goToPage: (page: number) => `Přejít na stránku ${page}`,
  currentPage: (page: number) => `Stránka ${page}, aktuální`,
};
function Badges({ row }: { row: ReservationListItem }) {
  const status = reservationStatus(row.status);
  return (
    <ReservationBadges>
      <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      {row.pendingExpired ? (
        <StatusBadge tone="warning">Čekání vypršelo</StatusBadge>
      ) : null}
    </ReservationBadges>
  );
}
export function AdminReservationsPage() {
  const location = useLocation();
  return <ReservationsView key={location.key} />;
}
function ReservationsView() {
  const { token } = useAuth(),
    { handleRequestError } = useAdminAccess(),
    location = useLocation(),
    navigate = useNavigate();
  const applied = parseReservationSearch(new URLSearchParams(location.search));
  const canonical = buildReservationSearch(applied).toString(),
    queryString = location.search.replace(/^\?/, '');
  const activeQ = reservationSearchFromState(location.state);
  const [draft, setDraft] = useState({
    ...applied,
    q: activeQ,
    from: applied.from ?? '',
    to: applied.to ?? '',
  });
  const [formError, setFormError] = useState<string | null>(null),
    [revision, setRevision] = useState(0);
  const appliedDateError = validateReservationDates(
    applied.from ?? '',
    applied.to ?? ''
  );
  const canonicalChanged = queryString !== canonical;
  useEffect(() => {
    if (canonicalChanged)
      navigate(
        { pathname: adminRoutes.reservations, search: canonical },
        { replace: true, state: { reservationSearch: activeQ } }
      );
  }, [canonicalChanged, canonical, activeQ, navigate]);
  const query = { ...applied, ...(activeQ ? { q: activeQ } : {}) };
  const state = useReservationRead({
    token: token ?? '',
    requestKey: JSON.stringify(query),
    revision,
    enabled: !canonicalChanged && !appliedDateError,
    onAccessError: handleRequestError,
    read: signal =>
      listAdminReservations({ token: token ?? '', query, signal }),
  });
  const changePage = (page: number) =>
    navigate(
      {
        pathname: adminRoutes.reservations,
        search: buildReservationSearch({ ...applied, page }).toString(),
      },
      { state: { reservationSearch: activeQ } }
    );
  const apply = (event: FormEvent) => {
    event.preventDefault();
    const error = validateReservationDates(draft.from, draft.to);
    if (error) {
      setFormError(error);
      return;
    }
    if (draft.q.trim().length > 200) {
      setFormError('Hledaný text může mít nejvýše 200 znaků.');
      return;
    }
    navigate(
      {
        pathname: adminRoutes.reservations,
        search: buildReservationSearch({
          ...draft,
          from: draft.from || undefined,
          to: draft.to || undefined,
          page: 1,
        }).toString(),
      },
      { state: { reservationSearch: draft.q.trim() } }
    );
  };
  const backState = {
    reservationBack: { kind: 'list', search: canonical, q: activeQ },
  };
  const filtered = Boolean(
    activeQ ||
      applied.status ||
      applied.paymentStatus ||
      applied.rentalMode ||
      applied.from ||
      applied.to
  );
  const data = state.kind === 'success' ? state.data : null;
  return (
    <ReservationPage data-admin-reservations-page>
      <Filters onSubmit={apply}>
        <Input
          label="Hledat rezervaci"
          placeholder="Číslo rezervace, jméno, telefon nebo e-mail"
          maxLength={200}
          value={draft.q}
          onChange={event => setDraft({ ...draft, q: event.target.value })}
        />
        <Fields>
          <SelectField
            label="Stav"
            value={draft.status ?? ''}
            onChange={event =>
              setDraft({
                ...draft,
                status: (event.target.value ||
                  undefined) as typeof draft.status,
              })
            }
          >
            <option value="">Vše</option>
            {reservationStatuses.map(value => (
              <option key={value} value={value}>
                {reservationStatus(value).label}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Platba"
            value={draft.paymentStatus ?? ''}
            onChange={event =>
              setDraft({
                ...draft,
                paymentStatus: (event.target.value ||
                  undefined) as typeof draft.paymentStatus,
              })
            }
          >
            <option value="">Vše</option>
            {reservationPaymentStatuses.map(value => (
              <option key={value} value={value}>
                {reservationPayment(value).label}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Režim pronájmu"
            value={draft.rentalMode ?? ''}
            onChange={event =>
              setDraft({
                ...draft,
                rentalMode: (event.target.value ||
                  undefined) as typeof draft.rentalMode,
              })
            }
          >
            <option value="">Vše</option>
            {reservationRentalModes.map(value => (
              <option key={value} value={value}>
                {reservationMode(value)}
              </option>
            ))}
          </SelectField>
          <Input
            label="Od"
            type="date"
            value={draft.from}
            aria-describedby="reservation-date-help"
            onChange={event => setDraft({ ...draft, from: event.target.value })}
          />
          <Input
            label="Do"
            type="date"
            value={draft.to}
            aria-describedby="reservation-date-help"
            onChange={event => setDraft({ ...draft, to: event.target.value })}
          />
        </Fields>
        <ReservationCopy id="reservation-date-help">
          Datum filtruje termín pronájmu, nikoli navazující čištění.
        </ReservationCopy>
        {formError || appliedDateError ? (
          <ReservationError role="alert">
            {formError ?? appliedDateError}
          </ReservationError>
        ) : null}
        <ReservationActions>
          <Button type="submit">Použít filtry</Button>
          <Button
            variant="secondary"
            onClick={() =>
              navigate(adminRoutes.reservations, {
                state: { reservationSearch: '' },
              })
            }
          >
            Vyčistit filtry
          </Button>
        </ReservationActions>
      </Filters>
      {!appliedDateError && !canonicalChanged ? (
        <>
          {state.kind === 'loading' ? (
            <ReservationPanel role="status">
              <ReservationBadges>
                <Spinner size="sm" />
                Načítání rezervací…
              </ReservationBadges>
            </ReservationPanel>
          ) : null}
          {state.kind === 'error' ? (
            <ReservationPanel role="alert">
              <ReservationHeading>
                Rezervace se nepodařilo načíst
              </ReservationHeading>
              <ReservationCopy>Zkuste to prosím znovu.</ReservationCopy>
              <Button onClick={() => setRevision(value => value + 1)}>
                Zkusit znovu
              </Button>
            </ReservationPanel>
          ) : null}
          {data ? (
            <>
              <ReservationCopy role="status">
                Počet rezervací: {data.pagination.total}
              </ReservationCopy>
              {!data.items.length ? (
                <ReservationPanel>
                  <ReservationHeading>
                    {data.pagination.total > 0
                      ? 'Na této stránce nejsou žádné rezervace'
                      : filtered
                        ? 'Žádné rezervace neodpovídají vyhledávání nebo filtrům'
                        : 'Žádné rezervace'}
                  </ReservationHeading>
                  {applied.page > 1 ? (
                    <Button variant="secondary" onClick={() => changePage(1)}>
                      Přejít na první stránku
                    </Button>
                  ) : null}
                </ReservationPanel>
              ) : (
                <>
                  <TableWrap>
                    <Table>
                      <caption style={{ textAlign: 'left' }}>
                        Seznam rezervací
                      </caption>
                      <thead>
                        <tr>
                          {[
                            'Rezervace',
                            'Zákazník',
                            'Termín',
                            'Stav',
                            'Platba',
                            'Režim',
                            'Položky',
                            'Celkem',
                          ].map(label => (
                            <th key={label} scope="col">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.items.map(row => {
                          const payment = reservationPayment(row.paymentStatus);
                          return (
                            <tr key={row.id}>
                              <td>
                                <NavigationLink
                                  variant="plain"
                                  to={buildAdminReservationDetailPath(row.id)}
                                  state={backState}
                                >
                                  {row.reservationNumber}
                                </NavigationLink>
                              </td>
                              <td>
                                {customerName(row.customer)}
                                <ReservationCopy>
                                  {row.customer.email || 'E-mail neuveden'}
                                </ReservationCopy>
                                <ReservationCopy>
                                  {row.customer.phone || 'Telefon neuveden'}
                                </ReservationCopy>
                              </td>
                              <td>
                                {formatCalendarDay(row.startDate)} –{' '}
                                {formatCalendarDay(row.endDate)}
                              </td>
                              <td>
                                <Badges row={row} />
                              </td>
                              <td>
                                <StatusBadge tone={payment.tone}>
                                  {payment.label}
                                </StatusBadge>
                              </td>
                              <td>{reservationMode(row.rentalMode)}</td>
                              <td>{row.itemCount}</td>
                              <td>{money(row.totalDue)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </TableWrap>
                  <MobileList aria-label="Seznam rezervací">
                    {data.items.map(row => {
                      const payment = reservationPayment(row.paymentStatus);
                      return (
                        <Card key={row.id}>
                          <DetailLink
                            variant="plain"
                            to={buildAdminReservationDetailPath(row.id)}
                            state={backState}
                          >
                            {row.reservationNumber}
                          </DetailLink>
                          <div>{customerName(row.customer)}</div>
                          <ReservationCopy>
                            {row.customer.email || 'E-mail neuveden'} ·{' '}
                            {row.customer.phone || 'Telefon neuveden'}
                          </ReservationCopy>
                          <Badges row={row} />
                          <StatusBadge tone={payment.tone}>
                            {payment.label}
                          </StatusBadge>
                          <ReservationFacts>
                            <div>
                              <dt>Termín</dt>
                              <dd>
                                {formatCalendarDay(row.startDate)} –{' '}
                                {formatCalendarDay(row.endDate)}
                              </dd>
                            </div>
                            <div>
                              <dt>Režim pronájmu</dt>
                              <dd>{reservationMode(row.rentalMode)}</dd>
                            </div>
                            <div>
                              <dt>Položky</dt>
                              <dd>{row.itemCount}</dd>
                            </div>
                            <div>
                              <dt>Celkem</dt>
                              <dd>{money(row.totalDue)}</dd>
                            </div>
                          </ReservationFacts>
                        </Card>
                      );
                    })}
                  </MobileList>
                </>
              )}
              {data.pagination.pages > 1 &&
              applied.page <= data.pagination.pages ? (
                <Pagination
                  page={applied.page}
                  pages={data.pagination.pages}
                  onPageChange={changePage}
                  labels={labels}
                />
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </ReservationPage>
  );
}
