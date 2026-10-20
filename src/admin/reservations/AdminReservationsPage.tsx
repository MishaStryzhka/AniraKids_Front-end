import {Search,SlidersHorizontal,Plus} from 'lucide-react';
import {IconButton} from '../../design-system/components/IconButton';
import {useAdminPageAction} from '../layout/AdminLayout';
import {ListToolbar,CountButton,FilterCount} from '../bookings/listToolbar';
import {AdminBookingDialog} from '../bookings/AdminBookingDialog';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
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
  reservationDateRange,
} from './reservationPresentation';
import { reservationSearchFromState } from './reservationNavigation';
import { useReservationRead } from './useReservationRead';
import { ReservationSourceBadge } from './ReservationSourceBadge';
import {
  ReservationCard,
  ReservationCardHeader,
  ReservationCardRow,
} from '../../components/reservations/reservationCardStyles';
import {
  ReservationPage,
  ReservationCopy,
  ReservationPanel,
  ReservationHeading,
  ReservationBadges,
  ReservationError,
  ReservationActions,
} from './reservationStyles';
const Filters = styled.form`
  display: grid;
  gap: ${t.space[4]};
  &[hidden] { display:none; }
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
const CardList = styled.ul`
  display: grid;
  gap: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
`;
const Card = styled(ReservationCard)`
  h2, p { margin: 0; }
  h2 { font-size: 20px; }
  p { line-height: 1.6; }
`;
const DetailLink = styled(NavigationLink)`
  min-block-size: 44px;
  color: ${t.color.text.primary};
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
  const [searchOpen,setSearchOpen]=useState(false),[filtersOpen,setFiltersOpen]=useState(false),[creating,setCreating]=useState(false);
  const searchInput=useRef<HTMLInputElement>(null);
  useEffect(()=>{if(searchOpen)searchInput.current?.focus();},[searchOpen]);
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
  const filterCount=[applied.status,applied.paymentStatus,applied.rentalMode,applied.from,applied.to].filter(Boolean).length;
  const toolbar=useMemo(()=><ListToolbar>
    <IconButton aria-label="Hledat rezervace" title="Hledat rezervace" aria-expanded={searchOpen} aria-controls="reservation-search" icon={<Search size={22}/>} onClick={()=>setSearchOpen(v=>!v)}/>
    <CountButton aria-label={filterCount?`Filtry (${filterCount})`:'Filtry'} title="Filtry" aria-expanded={filtersOpen} aria-controls="reservation-filters" icon={<><SlidersHorizontal size={22}/>{filterCount?<FilterCount>{filterCount}</FilterCount>:null}</>} onClick={()=>setFiltersOpen(v=>!v)}/>
    <Button variant="secondary" onClick={()=>setCreating(true)}><Plus size={20} aria-hidden="true"/> Nová rezervace</Button>
  </ListToolbar>,[searchOpen,filtersOpen,filterCount]);
  useAdminPageAction(toolbar);
  const data = state.kind === 'success' ? state.data : null;
  return (
    <ReservationPage data-admin-reservations-page>
      <Filters onSubmit={apply} hidden={!searchOpen&&!filtersOpen&&!appliedDateError}>
        <div id="reservation-search" hidden={!searchOpen}>
        <Input
          ref={searchInput}
          label="Hledat rezervaci"
          placeholder="Číslo rezervace, jméno, telefon nebo e-mail"
          maxLength={200}
          value={draft.q}
          onChange={event => setDraft({ ...draft, q: event.target.value })}
        />
        </div>
        <div id="reservation-filters" hidden={!filtersOpen&&!appliedDateError}>
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
        </div>
        {formError || appliedDateError ? (
          <ReservationError role="alert">
            {formError ?? appliedDateError}
          </ReservationError>
        ) : null}
        <ReservationActions>
          <Button type="submit">{filtersOpen?'Použít filtry':'Vyhledat'}</Button>
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
      {activeQ?<ReservationCopy>Hledání: {activeQ} <Button variant="secondary" onClick={()=>navigate({pathname:adminRoutes.reservations,search:buildReservationSearch({...applied,page:1}).toString()},{state:{reservationSearch:''}})}>Zrušit hledání</Button></ReservationCopy>:null}
      {creating?<AdminBookingDialog kind="reservation" onClose={()=>setCreating(false)} onCreated={result=>navigate(buildAdminReservationDetailPath(result.id))}/>:null}
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
                <CardList aria-label="Seznam rezervací">
                  {data.items.map(row => {
                    const payment = reservationPayment(row.paymentStatus);
                    const detailPath = buildAdminReservationDetailPath(row.id);
                    return (
                      <Card as="li" key={row.id}>
                        <ReservationCardHeader>
                          <ReservationCardRow>
                            <h2>
                              <DetailLink variant="plain" to={detailPath} state={backState}>
                                {row.reservationNumber}
                              </DetailLink>
                            </h2>
                            <Badges row={row} />
                          </ReservationCardRow>
                          <ReservationBadges>
                            <StatusBadge tone={payment.tone}>{payment.label}</StatusBadge>
                            <ReservationSourceBadge source={row.source} />
                          </ReservationBadges>
                        </ReservationCardHeader>
                        <p>
                          {reservationDateRange(row.startDate, row.endDate)} · {reservationMode(row.rentalMode)}
                        </p>
                        <p>
                          {customerName(row.customer)} · {row.customer.email || 'E-mail neuveden'} ·{' '}
                          {row.customer.phone || 'Telefon neuveden'}
                        </p>
                        <p>Položky: {row.itemCount}</p>
                        <p><strong>Celkem: {money(row.totalDue)}</strong></p>
                        {row.paymentReport?.status === 'pending' ? <ReservationCopy>
                          {row.paymentReport.kind === 'cash' ? 'Domluvena platba při převzetí' : 'Klient oznámil platbu — ověřit'}
                        </ReservationCopy> : null}
                        <ReservationCardRow>
                          <Button onClick={() => navigate(detailPath, { state: backState })}>
                            Otevřít rezervaci
                          </Button>
                        </ReservationCardRow>
                      </Card>
                    );
                  })}
                </CardList>
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
