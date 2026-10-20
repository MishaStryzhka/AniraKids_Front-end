import {NewReservation,NewFitting} from './BookingForms';
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  LayoutDashboard,
  CalendarDays,
  Shirt,
  Wallet,
  Users,
  Link as LinkIcon,
  Plus,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../design-system/components/Button';
import { Input } from '../design-system/components/Input';
import { SelectField } from '../design-system/components/SelectField';
import { designTokens as t } from '../design-system/tokens/designTokens';
import { partnerApi, PartnerApiError } from './api';
import { statusLabel } from '../storefront/booking/bookingModel';
import { fittingStatusLabels } from '../fittings/fittingApi';
import {
  pragueToday,
  formatCalendarDay,
} from '../admin/calendar/calendarDates';
import { PartnerCalendar } from './PartnerCalendar';
import { rentalsOnDay, fittingsOnDay } from './partnerCalendarModel';
import { PaymentConfirmationStatus } from '../storefront/payments/PaymentConfirmationStatus';
import {
  ReservationCard as Card,
  ReservationCardRow as Row,
  ReservationCardHeader as BookingHeader,
} from '../components/reservations/reservationCardStyles';
const formatMoney = (amount: number) =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
const RewardBreakdown = styled.dl`
  display: grid;
  gap: ${t.space[3]};
  margin: 0;
  > div { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: ${t.space[3]}; align-items: baseline; }
  dt { overflow-wrap: anywhere; }
  dd { margin: 0; white-space: nowrap; text-align: right; font-variant-numeric: tabular-nums; }
  > div:last-child { border-top: 1px solid ${t.color.border.subtle}; padding-top: ${t.space[3]}; font-weight: 600; }
`;
const Shell = styled.div`
  max-width: 1320px;
  margin: auto;
  padding: 24px;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 32px;
  align-items: start;
  @media (max-width: 767px) {
    padding: 16px;
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;
const Nav = styled.nav`
  display: grid;
  gap: 6px;
  position: sticky;
  top: 90px;
  a {
    display: flex;
    gap: 10px;
    align-items: center;
    min-height: 48px;
    padding: 10px 14px;
    border-radius: 10px;
    color: inherit;
    text-decoration: none;
  }
  a[aria-current='page'] {
    background: ${t.color.bg.surface};
    box-shadow: 0 1px 6px #0000000d;
    font-weight: 600;
  }
  @media (max-width: 767px) {
    position: static;
    display: flex;
    overflow: auto;
    a {
      flex-shrink: 0;
    }
  }
`;
const Main = styled.main`
  display: grid;
  gap: 20px;
  min-width: 0;
  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
  h1 {
    font-size: 28px;
  }
  h2 {
    font-size: 20px;
  }
  p {
    line-height: 1.6;
  }
`;
const SourceBadge = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  padding: 5px 12px;
  border: 1px solid ${t.color.border.subtle};
  border-radius: 20px;
  background: ${t.color.bg.subtle};
  color: ${t.color.text.secondary};
  font-size: 13px;
  font-weight: 600;
`;
const PaidBadge = styled(SourceBadge)`
  color: ${t.color.status.success.fg};
  background: ${t.color.status.success.bg};
`;
const Toolbar = styled(Row)`
  align-items: flex-end;
  @media (max-width: 479px) {
    > button {
      flex: 1 1 auto;
    }
  }
`;
const MonthFields = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, 1fr) 100px;
  gap: 12px;
  @media (max-width: 479px) {
    width: 100%;
  }
`;
const monthNames = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat('cs-CZ', { month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2026, index, 1))
  )
);
const years = Array.from({ length: 100 }, (_, index) => String(2000 + index));
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  min-width: 0;
`;
const Form = styled.form`
  display: grid;
  gap: 16px;
  fieldset {
    border: 0;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 16px;
    min-width: 0;
  }
`;
const labels: any = {
  overview: 'Přehled',
  fittings: 'Zkoušky',
  reservations: 'Rezervace',
  calendar: 'Kalendář',
  catalogue: 'Šaty ve studiu',
  balance: 'Platby a vyúčtování',
  members: 'Tým a odkazy',
};
const icons: any = {
  overview: LayoutDashboard,
  reservations: CalendarDays,
  calendar: CalendarDays,
  catalogue: Shirt,
  fittings: CalendarDays,
  balance: Wallet,
  members: Users,
};
function PaymentQr({ payload }: { payload: string }) {
  const [image, setImage] = useState('');
  useEffect(() => {
    let active = true;
    import('qrcode')
      .then(q => q.default.toDataURL(payload, { width: 240, margin: 2 }))
      .then(v => {
        if (active) setImage(v);
      })
      .catch(() => {
        if (active) setImage('');
      });
    return () => {
      active = false;
    };
  }, [payload]);
  return image ? (
    <img src={image} alt="QR kód" style={{ width: 240, maxWidth: '100%' }} />
  ) : null;
}
export function LegacyPartnerRedirect() {
  const location = useLocation();
  return (
    <Navigate replace to={'/partner/blaze' + location.search + location.hash} />
  );
}
type ActionResult = {path: string; kind: 'pending'|'success'|'error'; message: string; requestId?: string};
function ActionFeedback({result,onRefresh}:{result:ActionResult;onRefresh?:()=>void}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if(result.kind === 'error') ref.current?.focus(); }, [result]);
  return <div ref={ref} data-request-id={result.requestId} tabIndex={-1} role={result.kind === 'error' ? 'alert' : 'status'}>
    <p>{result.message}</p>
    {result.kind === 'error' && onRefresh ? <Button variant="secondary" onClick={onRefresh}>Obnovit stav</Button> : null}
  </div>;
}
export function PartnerPage() {
  const { token, isLoggedIn, isRefreshing } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get('section') || 'overview';
  const [access, setAccess] = useState<any>(null),
    [rawData, setData] = useState<any>(null),
    [loadedKey, setLoadedKey] = useState(''),
    [catalogue, setCatalogue] = useState<any[]>([]),
    [revision, setRevision] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [month, setMonth] = useState(pragueToday().slice(0, 7));
  const [actionResult, setActionResult] = useState<ActionResult|null>(null);
  useEffect(() => { setActionResult(null); }, [tab, month, token]);
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if(error) errorRef.current?.focus(); }, [error]);
  const refreshResult = () => { setActionResult(null); setRevision(v=>v+1); };
  const mutation = useRef(false);
  const dataKey = `${tab}:${month}:${revision}:${token}`;
  const data = loadedKey === dataKey ? rawData : null;
  const [calendarDay, setCalendarDay] = useState(pragueToday());
  const selectedDay = calendarDay.startsWith(month + '-')
    ? calendarDay
    : month + '-01';
  const rentalItems =
    tab === 'calendar'
      ? rentalsOnDay<any>(data?.items || [], selectedDay)
      : data?.items || [];
  const fittingItems =
    tab === 'calendar'
      ? fittingsOnDay<any>(data?.fittings || [], selectedDay)
      : data?.items || [];
  const [creating, setCreating] = useState(false);
  const [creatingFitting, setCreatingFitting] = useState(false);
  useEffect(() => {
    let active = true;
    setAccess(null);
    if (!token || !isLoggedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    partnerApi('access', token)
      .then(v => {
        if (active) {
          setAccess(v);
          setLoading(false);
        }
      })
      .catch(e => {
        if (active) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [token, isLoggedIn, revision]);
  useEffect(() => {
    let active = true;
    if (!access || !token) return;
    setLoading(true);
    setData(null);
    setError('');
    const path = ['overview', 'calendar'].includes(tab) ? 'reservations' : tab;
    Promise.all([
      partnerApi(
        path +
          (path === 'reservations' || path === 'fittings'
            ? '?month=' + month
            : ''),
        token
      ),
      partnerApi('catalogue', token),
      tab === 'calendar'
        ? partnerApi('fittings?month=' + month, token)
        : Promise.resolve({ items: [], truncated: false }),
    ])
      .then(([v, c, fittings]) => {
        if (active) {
          setData(
            tab === 'calendar'
              ? {
                  ...v,
                  fittings: fittings.items,
                  truncated: v.truncated || fittings.truncated,
                }
              : v
          );
          setLoadedKey(dataKey);
          setCatalogue(c.items);
          setLoading(false);
        }
      })
      .catch(e => {
        if (active) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [access, tab, month, token, dataKey]);
  async function act(path: string, body: any) {
    if (mutation.current) return;
    mutation.current = true;
    setBusy(true);
    setError('');
    setActionResult({path,kind:'pending',message:'Ukládání…'});
    try {
      await partnerApi(path, token, body);
      setActionResult({path,kind:'success',message:body.action === 'confirm' ? 'Potvrzení bylo úspěšně uloženo.' : 'Změna byla úspěšně uložena.'});
      setRevision(v => v + 1);
    } catch (e) {
      const requestId = e instanceof PartnerApiError ? e.requestId : undefined;
      setActionResult({path,kind:'error',message:(e as Error).message,requestId});
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  }
  if (isRefreshing)
    return (
      <Shell>
        <p role="status">Načítání účtu…</p>
      </Shell>
    );
  if (!isLoggedIn)
    return (
      <Shell>
        <Main>
          <h1>Partnerský kabinet</h1>
          <p>Pro vstup se přihlaste ke svému účtu.</p>
          <Link to="/ucet">Přihlásit se</Link>
        </Main>
      </Shell>
    );
  if (!access)
    return (
      <Shell>
        <Main>
          <h1>Partnerský kabinet</h1>
          <p role={loading ? 'status' : 'alert'}>
            {loading ? 'Ověřování přístupu…' : error}
          </p>
        </Main>
      </Shell>
    );
  const manager = access.role === 'administrator';
  const sections = Object.keys(labels).filter(
    k => manager || !['balance', 'members'].includes(k)
  );
  return (
    <Shell>
      <Nav aria-label="Partnerské menu">
        {sections.map(k => {
          const Icon = icons[k];
          return (
            <Link
              key={k}
              to={'?section=' + k}
              aria-current={tab === k ? 'page' : undefined}
            >
              <Icon size={20} />
              {labels[k]}
            </Link>
          );
        })}
      </Nav>
      <Main>
        <div>
          <p>ANIRAK · {access.name}</p>
          <h1>{labels[tab] || 'Partnerský kabinet'}</h1>
        </div>
        {!access.enabled ? (
          <Card>
            <p>
              Kabinet čeká na aktivaci. Po aktivaci se nové rezervace a zkoušky
              zahrnou do evidence Blaze.
            </p>
            {(access.owner || access.managePartners) ? (
              <Button
                disabled={busy}
                onClick={() => act('setup', { enabled: true })}
              >
                Aktivovat spolupráci Blaze
              </Button>
            ) : null}
          </Card>
        ) : null}
        {actionResult && (!data || !['reservations/','fittings/'].some(prefix=>actionResult.path.startsWith(prefix))) ? <Card><ActionFeedback result={actionResult} onRefresh={refreshResult}/></Card> : null}
        {error ? (
          <Card role="alert" ref={errorRef} tabIndex={-1}>
            {error}
            <Button variant="secondary" onClick={() => setRevision(v => v + 1)}>
              Obnovit
            </Button>
          </Card>
        ) : null}
        {['overview', 'reservations', 'calendar', 'fittings'].includes(tab) ? (
          <Toolbar>
            <MonthFields>
              <SelectField
                label="Měsíc"
                value={month.slice(5, 7)}
                onChange={e =>
                  setMonth(`${month.slice(0, 4)}-${e.target.value}`)
                }
              >
                {monthNames.map((name, index) => (
                  <option key={name} value={String(index + 1).padStart(2, '0')}>
                    {name}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Rok"
                value={month.slice(0, 4)}
                onChange={e =>
                  setMonth(`${e.target.value}-${month.slice(5, 7)}`)
                }
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </SelectField>
            </MonthFields>
            {tab !== 'calendar' ? (
              <>
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => setRevision(v => v + 1)}
                >
                  Obnovit
                </Button>
                {tab !== 'fittings' ? (
                  <Button
                    disabled={!access.enabled}
                    onClick={() => setCreating(v => !v)}
                  >
                    <Plus size={18} /> Nová rezervace
                  </Button>
                ) : (
                  <Button
                    disabled={!access.enabled}
                    onClick={() => setCreatingFitting(v => !v)}
                  >
                    <Plus size={18} aria-hidden="true" /> Nová zkouška
                  </Button>
                )}
              </>
            ) : null}
          </Toolbar>
        ) : null}
        {creating ? (
          <Card>
            <h2>Nová rezervace klienta Blaze</h2>
            <NewReservation
              catalogue={catalogue}
              token={token}
              userId={access.userId}
              onDone={() => {
                setCreating(false);
                setRevision(v => v + 1);
                setParams({ section: 'reservations' });
              }}
            />
          </Card>
        ) : null}
        {loading ? <p role="status">Načítání…</p> : null}
        {creatingFitting ? (
          <Card>
            <h2>Nová zkouška klienta Blaze</h2>
            <NewFitting
              token={token}
              userId={access.userId}
              onDone={() => {
                setCreatingFitting(false);
                setRevision(v => v + 1);
              }}
            />
          </Card>
        ) : null}
        {data?.truncated ? (
          <p role="alert">
            Zobrazeno prvních 500 záznamů každého typu. Počty nemusí být úplné.
          </p>
        ) : null}
        {tab === 'calendar' && data ? (
          <>
            <PartnerCalendar
              month={month}
              selectedDay={selectedDay}
              onSelectDay={setCalendarDay}
              rentals={data.items}
              fittings={data.fittings}
            />
            <h2>{formatCalendarDay(selectedDay, true)}</h2>
            <p role="status">
              Zkoušky: {fittingItems.length} · Pronájmy: {rentalItems.length}
            </p>
            <h2>Pronájmy</h2>
          </>
        ) : null}
        {['overview', 'reservations', 'calendar'].includes(tab) &&
        data?.items ? (
          <>
            {tab === 'overview' ? (
              <Grid>
                <Card>
                  <h2>{data.items.length}</h2>
                  <p>Rezervace ve vybraném měsíci</p>
                </Card>
                <Card>
                  <h2>
                    {
                      data.items.filter((r: any) => r.status === 'pending')
                        .length
                    }
                  </h2>
                  <p>Čekají na potvrzení</p>
                </Card>
              </Grid>
            ) : null}
            {!rentalItems.length ? (
              <Card>
                {tab === 'calendar'
                  ? 'V tento den nejsou žádné pronájmy.'
                  : 'V tomto měsíci nejsou žádné rezervace.'}
              </Card>
            ) : (
              rentalItems.map((r: any) => (
                <Card key={r.id}>
                  <BookingHeader>
                    <Row>
                      <h2>{r.number}</h2>
                      <span>{statusLabel(r.status)}</span>
                    </Row>
                    <Row>
                      {r.paymentStatus === 'paid' ? <PaidBadge>Uhrazeno</PaidBadge> : null}
                      <SourceBadge aria-label={`Zdroj klienta: ${r.source === 'partner' ? 'Blaze' : r.source === 'anirak' ? 'ANIRAK' : 'neuveden'}`}>
                        {r.source === 'partner' ? 'Blaze' : r.source === 'anirak' ? 'ANIRAK' : 'Zdroj neuveden'}
                      </SourceBadge>
                    </Row>
                  </BookingHeader>
                  <p>
                    {String(r.startDate).slice(0, 10)}
                    {String(r.startDate).slice(0, 10) !== String(r.endDate).slice(0, 10)
                      ? ' – ' + String(r.endDate).slice(0, 10) : ''} ·{' '}
                    {r.rentalMode === 'studio' ? 'Studio' : 'Mimo studio'}
                  </p>
                  <p>
                    {r.customer.firstName} {r.customer.lastName} ·{' '}
                    {r.customer.email} · {r.customer.phone}
                  </p>
                  {r.items.map((i: any, index: number) => (
                    <Row key={index}>
                      {catalogue.find(p => p.id === i.productId)?.photo ? (
                        <img
                          src={catalogue.find(p => p.id === i.productId).photo}
                          alt=""
                        />
                      ) : null}
                      <div>
                        <strong>{i.name}</strong>
                        <p>Velikost {i.size}</p>
                      </div>
                    </Row>
                  ))}
                  <p>
                    Cena pronájmu: {formatMoney(r.subtotal + (r.payment.fittingCredit ?? 0))}
                    {r.deposit > 0 ? ' · Kauce: ' + formatMoney(r.deposit) : ''}
                  </p>
                  <p>
                    <strong>
                      Zbývá doplatit nájemné: {formatMoney(r.payment.rentalBalance)}
                    </strong>
                  </p>
                  <PaymentConfirmationStatus paymentReport={r.payment.paymentReport} />
                  <Row>
                    {r.status === 'pending' && manager ? (
                      <Button
                        disabled={busy}
                        onClick={() =>
                          act('reservations/' + r.id, { action: 'confirm' })
                        }
                      >
                        Potvrdit rezervaci
                      </Button>
                    ) : null}
                    {(
                      {
                        confirmed: 'prepare',
                        prepared: 'rent',
                        rented: 'return',
                      } as any
                    )[r.status] ? (
                      <Button
                        disabled={busy}
                        onClick={() =>
                          act('reservations/' + r.id, {
                            action: (
                              {
                                confirmed: 'prepare',
                                prepared: 'rent',
                                rented: 'return',
                              } as any
                            )[r.status],
                          })
                        }
                      >
                        {
                          (
                            {
                              confirmed: 'Připraveno',
                              prepared: 'Vydat',
                              rented: 'Přijmout zpět',
                            } as any
                          )[r.status]
                        }
                      </Button>
                    ) : null}
                  </Row>
                  {actionResult?.path === 'reservations/'+r.id ? <ActionFeedback result={actionResult}/> : null}
                  <details>
                    <summary>Platby a QR</summary>
                    {r.payment.fittingCredit > 0 ? (
                      <p>
                        Rezervační záloha (součást nájemného):{' '}
                        {formatMoney(r.payment.fittingCredit)} · uhrazeno ze zkoušky
                      </p>
                    ) : null}
                    <PaymentConfirmationStatus lastPayment={r.payment.lastPayment} />
                    {r.payment.paymentReport?.kind === 'cash' && r.payment.paymentReport.status === 'pending' ? (
                      <p>Domluvenou hotovost lze nahradit QR platbou na aktuální doplatek.</p>
                    ) : null}
                    {(
                      r.instructions.fullPaymentInstructions ||
                      r.instructions.paymentInstructions
                    )?.qrPayload ? (
                      <PaymentQr
                        payload={
                          (
                            r.instructions.fullPaymentInstructions ||
                            r.instructions.paymentInstructions
                          ).qrPayload
                        }
                      />
                    ) : null}
                    {manager ? (
                      <CashPayment reservation={r} busy={busy} act={act} />
                    ) : null}
                  </details>
                  {(access.owner || access.managePartners) ? (
                    <details>
                      <summary>Správa rezervace</summary>
                      <SourceChange reservation={r} busy={busy} act={act} />
                      <Link to={'/admin/rezervace/' + r.id}>
                        Úplná správa a bankovní platby ANIRAK
                      </Link>
                    </details>
                  ) : null}
                </Card>
              ))
            )}
          </>
        ) : null}
        {tab === 'catalogue' && data?.items ? (
          <Grid>
            {data.items.map((p: any) => (
              <Card key={p.id}>
                <Row>
                  {p.photo ? <img src={p.photo} alt="" /> : null}
                  <Link to={'/produkt/' + p.slug}>{p.name}</Link>
                </Row>
                {p.variants.map((v: any) => (
                  <div key={v.id}>
                    <strong>Velikost {v.size}</strong>
                    {v.pieces.map((i: any) => (
                      <p key={i.id}>
                        {i.code} ·{' '}
                        {(
                          {
                            active: 'Aktivní',
                            maintenance: 'V údržbě',
                            retired: 'Vyřazený',
                          } as any
                        )[i.status] || i.status}
                      </p>
                    ))}
                  </div>
                ))}
              </Card>
            ))}
          </Grid>
        ) : null}
        {['fittings', 'calendar'].includes(tab) && data?.items ? (
          <>
            {tab === 'calendar' ? <h2>Zkoušky</h2> : null}
            {!fittingItems.length ? (
              <Card>
                {tab === 'calendar'
                  ? 'V tento den nejsou žádné zkoušky.'
                  : 'V tomto měsíci nejsou žádné zkoušky.'}
              </Card>
            ) : null}
            {fittingItems.map((f: any) => (
              <Card key={f.id}>
                {actionResult?.path === 'fittings/'+f.id ? <ActionFeedback result={actionResult} onRefresh={refreshResult}/> : null}
                <BookingHeader>
                  <h2>{f.date} · {f.time}</h2>
                  <SourceBadge aria-label={`Zdroj klienta: ${f.source === 'partner' ? 'Blaze' : f.source === 'anirak' ? 'ANIRAK' : 'neuveden'}`}>
                    {f.source === 'partner' ? 'Blaze' : f.source === 'anirak' ? 'ANIRAK' : 'Zdroj neuveden'}
                  </SourceBadge>
                </BookingHeader>
                <p>
                  {f.customer.name} · {f.customer.email} · {f.customer.phone}
                </p>
                <p>
                  {(fittingStatusLabels as any)[f.status]} · {f.number}
                </p>
                {f.paymentInstructions?.qrPayload ? (
                  <PaymentQr payload={f.paymentInstructions.qrPayload} />
                ) : null}
                {(access.owner || access.managePartners) && ['pending', 'review'].includes(f.status) ? (
                  <Button
                    disabled={busy}
                    onClick={() =>
                      act('fittings/' + f.id, {
                        action: 'confirm',
                        revision: f.revision,
                      })
                    }
                  >
                    Potvrdit přijatou platbu 200 Kč
                  </Button>
                ) : null}
                {f.status === 'confirmed' ? (
                  <Button
                    disabled={busy}
                    onClick={() =>
                      act('fittings/' + f.id, {
                        action: 'complete',
                        revision: f.revision,
                      })
                    }
                  >
                    Zkouška proběhla
                  </Button>
                ) : null}
                {f.status === 'completed' && f.paymentStatus === 'paid' ? (
                  <FittingCredit fitting={f} busy={busy} act={act} />
                ) : null}
              </Card>
            ))}
          </>
        ) : null}
        {tab === 'balance' && data && manager ? (
          <>
            <Grid>
              <Card>
                <h2>{formatMoney(data.earned)}</h2>
                <p>Získaná odměna</p>
              </Card>
              <Card>
                <h2>{formatMoney(data.collected)}</h2>
                <p>Hotovost přijatá studiem včetně kaucí</p>
              </Card>
              <Card>
                <h2>{formatMoney(Math.abs(data.balance))}</h2>
                <p>
                  {data.balance >= 0
                    ? 'ANIRAK má předat Blaze'
                    : 'Blaze má předat ANIRAK'}
                </p>
              </Card>
            </Grid>
            <p>
              Podíl z pronájmu se započítá po vrácení oblečení podle přijaté
              platby. Za dokončenou zaplacenou zkoušku náleží Blaze 200 Kč. Odměna se odečte pouze při navazujícím potvrzeném pronájmu ve studiu Blaze. Kauce není
              odměnou. U klienta ANIRAK činí odměna za pronájem 200 Kč; již započtená odměna za navazující zkoušku se odečte.
            </p>
            {(access.owner || access.managePartners) ? (
              <Settlement data={data} busy={busy} act={act} />
            ) : null}
            {data.lines.map((l: any) => (
              <Card key={l.kind + l.number}>
                <BookingHeader>
                  <Row>
                    <h2>{l.number}</h2>
                    <span>{l.kind === 'fitting' ? 'Zkouška' : 'Pronájem'}</span>
                  </Row>
                  <SourceBadge aria-label={`Zdroj klienta: ${l.source === 'partner' ? 'Blaze' : l.source === 'anirak' ? 'ANIRAK' : 'neuveden'}`}>
                    {l.source === 'partner' ? 'Blaze' : l.source === 'anirak' ? 'ANIRAK' : 'Zdroj neuveden'}
                  </SourceBadge>
                </BookingHeader>
                {l.kind === 'fitting' ? <RewardBreakdown>
                  <div><dt>Odměna za zkoušku</dt><dd>{formatMoney(l.amount + (l.reason === 'studio_rental' ? 200 : 0))}</dd></div>
                  {l.reason === 'studio_rental' ? <div>
                    <dt>Odečet odměny — navazující potvrzený pronájem ve studiu Blaze</dt>
                    <dd>−{formatMoney(200)}</dd>
                  </div> : null}
                  <div><dt>Celkem</dt><dd>{formatMoney(l.amount)}</dd></div>
                </RewardBreakdown> : <RewardBreakdown>
                  <div><dt>Cena pronájmu</dt><dd>{Number.isFinite(l.rentalPrice) ? formatMoney(l.rentalPrice) : '—'}</dd></div>
                  <div><dt>{l.rewardType === 'fixed' ? 'Odměna za pronájem' : 'Výpočet odměny Blaze'}
                    {l.status && l.status !== 'returned' ? <small style={{display:'block'}}>{l.status === 'cancelled' ? 'Zrušená rezervace — odměna se nezapočítává.' : 'Odměna se započítá po vrácení oděvu.'}</small> : null}
                  </dt><dd>{l.rewardType === 'fixed' ? formatMoney(l.rewardAmount) : Number.isFinite(l.rewardBasis) && Number.isFinite(l.rewardRate) ? <>{formatMoney(l.rewardBasis)} × {l.rewardRate} %</> : '—'}</dd></div>
                  {l.fittingDeduction > 0 ? <div>
                    <dt>Odměna již započtená za zkoušku {l.fittingNumber}</dt>
                    <dd>−{formatMoney(l.fittingDeduction)}</dd>
                  </div> : null}
                  <div><dt>Celkem</dt><dd>{formatMoney(l.amount)}</dd></div>
                </RewardBreakdown>}
              </Card>
            ))}
            <h2>Předání peněz</h2>
            {data.settlements.map((s: any) => (
              <Card key={s.operationId}>
                {s.direction === 'to_partner'
                  ? 'ANIRAK → Blaze'
                  : 'Blaze → ANIRAK'}{' '}
                · {formatMoney(s.amount)}
                <p>{s.note}</p>
              </Card>
            ))}
          </>
        ) : null}
        {tab === 'members' && data && manager ? (
          <>
            <Card>
              <h2>Odkaz studia</h2>
              <ReferralLink code="blaze" />
            </Card>
            {(access.owner || access.managePartners) ? <MemberForm busy={busy} act={act} /> : null}
            {data.items?.map((m: any) => (
              <Card key={m.id}>
                <h2>{m.email}</h2>
                <p>
                  {m.role === 'administrator' ? 'Administrátor' : 'Fotograf'} ·{' '}
                  {m.active ? 'Aktivní' : 'Přístup vypnutý'}
                </p>
                <ReferralLink code={m.referralCode} />
                {(access.owner || access.managePartners) ? (
                  <Row>
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onClick={() =>
                        act('save-member', { ...m, active: !m.active })
                      }
                    >
                      {m.active ? 'Vypnout přístup' : 'Obnovit přístup'}
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={busy}
                      onClick={() =>
                        act('save-member', {
                          ...m,
                          role:
                            m.role === 'administrator'
                              ? 'photographer'
                              : 'administrator',
                        })
                      }
                    >
                      Změnit roli
                    </Button>
                  </Row>
                ) : null}
              </Card>
            ))}
          </>
        ) : null}
        {!manager ? (
          <Card>
            <h2>Můj doporučující odkaz</h2>
            <ReferralLink code={access.referralCode} />
          </Card>
        ) : null}
      </Main>
    </Shell>
  );
}
function ReferralLink({ code }: { code: string }) {
  const url = window.location.origin + '/?ref=' + code;
  const [copied, setCopied] = useState(false);
  return (
    <>
      <p>{url}</p>
      <Row>
        <Button
          variant="secondary"
          onClick={() =>
            navigator.clipboard
              .writeText(url)
              .then(() => setCopied(true))
              .catch(() => setCopied(false))
          }
        >
          <LinkIcon size={18} />
          {copied ? 'Zkopírováno' : 'Kopírovat odkaz'}
        </Button>
      </Row>
      <PaymentQr payload={url} />
    </>
  );
}
function MemberForm({ busy, act }: any) {
  const [email, setEmail] = useState(''),
    [role, setRole] = useState('photographer');
  return (
    <Card>
      <h2>Přidat člena týmu</h2>
      <Form
        onSubmit={e => {
          e.preventDefault();
          act('save-member', { email, role, active: true, revision: 0 });
        }}
      >
        <Input
          label="E-mail registrovaného účtu"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <SelectField
          label="Role"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="photographer">Fotograf</option>
          <option value="administrator">Administrátor</option>
        </SelectField>
        <Button disabled={busy} type="submit">
          Uložit přístup
        </Button>
      </Form>
    </Card>
  );
}
function FittingCredit({ fitting: f, busy, act }: any) {
  const [number, setNumber] = useState('');
  return (
    <Form
      onSubmit={e => {
        e.preventDefault();
        act('fittings/' + f.id, {
          action: 'credit',
          revision: f.revision,
          reservationNumber: number.trim().toUpperCase(),
        });
      }}
    >
      <Input
        label="Číslo rezervace pro započtení 200 Kč"
        value={number}
        required
        onChange={e => setNumber(e.target.value)}
      />
      <Button type="submit" disabled={busy}>Započítat zkoušku</Button>
    </Form>
  );
}
function CashPayment({ reservation: r, busy, act }: any) {
  const [amount, setAmount] = useState(''),
    [type, setType] = useState('rental_received');
  const operation = useRef(crypto.randomUUID());
  const advanceAllowed = r.payment.advanceBalance > 0;
  const paymentType =
    type === 'advance_received' && !advanceAllowed ? 'rental_received' : type;
  return (
    <Form
      onSubmit={async e => {
        e.preventDefault();
        await act('reservations/' + r.id, {
          action: 'payment',
          payment: {
            operationId: operation.current,
            expectedRevision: r.payment.revision,
            type: paymentType,
            amount: paymentType === 'deposit_received' ? Math.max(0,r.deposit-r.payment.depositHeld) : Number(amount),
            method: 'cash',
          },
        });
      }}
    >
      <SelectField
        label="Druh hotovostní platby"
        value={paymentType}
        onChange={e => {
          setType(e.target.value);
          operation.current = crypto.randomUUID();
        }}
      >
        <option value="rental_received">Pronájem</option>
        {advanceAllowed ? <option value="advance_received">Záloha</option> : null}
        {r.deposit > r.payment.depositHeld ? <option value="deposit_received">Kauce</option> : null}
      </SelectField>
      <Input
        label="Přijatá hotovost v Kč"
        type="number"
        min={1}
        step={1}
        required
        value={paymentType === 'deposit_received' ? Math.max(0,r.deposit-r.payment.depositHeld) : amount}
        readOnly={paymentType === 'deposit_received'}
        onChange={e => {
          setAmount(e.target.value);
          operation.current = crypto.randomUUID();
        }}
      />
      {paymentType === 'deposit_received' ? <p>Kauci je nutné přijmout v celé uvedené výši. Záznam uložte až po skutečném převzetí peněz.</p> : null}
      <Button type="submit" disabled={busy}>Zaznamenat přijatou hotovost</Button>
    </Form>
  );
}
function Settlement({ data, busy, act }: any) {
  const [amount, setAmount] = useState(''),
    [note, setNote] = useState(''),
    [direction, setDirection] = useState('to_partner');
  const operation = useRef(crypto.randomUUID());
  return (
    <Card>
      <h2>Zaznamenat předání peněz</h2>
      <Form
        onSubmit={e => {
          e.preventDefault();
          act('settle', {
            operationId: operation.current,
            amount: Number(amount),
            note,
            direction,
            revision: data.revision,
          });
        }}
      >
        <SelectField
          label="Směr platby"
          value={direction}
          onChange={e => {
            setDirection(e.target.value);
            operation.current = crypto.randomUUID();
          }}
        >
          <option value="to_partner">ANIRAK → Blaze</option>
          <option value="to_anirak">Blaze → ANIRAK</option>
        </SelectField>
        <Input
          label="Částka v Kč"
          type="number"
          min={0.01}
          step={0.01}
          required
          value={amount}
          onChange={e => {
            setAmount(e.target.value);
            operation.current = crypto.randomUUID();
          }}
        />
        <Input
          label="Reference předání"
          required
          minLength={3}
          value={note}
          onChange={e => {
            setNote(e.target.value);
            operation.current = crypto.randomUUID();
          }}
        />
        <Button type="submit" disabled={busy}>Zaznamenat předání</Button>
      </Form>
    </Card>
  );
}
function SourceChange({ reservation: r, busy, act }: any) {
  const [source, setSource] = useState(r.source),
    [reason, setReason] = useState('');
  return (
    <Form
      onSubmit={e => {
        e.preventDefault();
        act('reservations/' + r.id, { action: 'source', source, reason });
      }}
    >
      <SelectField
        label="Kdo přivedl klienta"
        value={source}
        onChange={e => setSource(e.target.value)}
      >
        <option value="anirak">ANIRAK</option>
        <option value="partner">Blaze</option>
      </SelectField>
      <Input
        label="Důvod opravy zdroje klienta"
        required
        minLength={5}
        maxLength={200}
        value={reason}
        onChange={e => setReason(e.target.value)}
      />
      <p>Změna ovlivní rozdělení příjmu a zapíše se do historie.</p>
      <Button type="submit" disabled={busy || source === r.source}>
        Uložit opravu zdroje
      </Button>
    </Form>
  );
}
