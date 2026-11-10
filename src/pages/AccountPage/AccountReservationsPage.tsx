import {ReservationToolbar, initialReservationFilters} from './ReservationToolbar';
import {FulfillmentSummary} from '../../storefront/booking/FulfillmentChoice';
import { StatusBadge } from '../../design-system/components/StatusBadge';
import {fittingDateLabel,fittingStatusLabels} from '../../fittings/fittingApi';
import {FittingLinkRecovery} from '../../fittings/FittingLinkRecovery';
import { loadGuestReservationLinks } from '../../storefront/booking/guestReservationLinks';
import { reservationStatusPath } from '../../storefront/booking/BookingStatusPage';
import { draftItems, modeLabel } from '../../storefront/booking/bookingModel';
import { useBookingOptional } from '../../storefront/booking/BookingProvider';
import { useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ModalAuthContext } from '../../context/ModalAuthContext';
import { routes } from '../../navigation/routes';
import { Button } from '../../design-system/components/Button';
import { getAccountBookings, claimReservation, receiptItems } from '../../storefront/api/publicApi';
import { usePublicRead } from '../../storefront/usePublicRead';
import { statusLabel } from '../../storefront/booking/bookingModel';
import { formatCalendarDay } from '../../admin/calendar/calendarDates';
import { Page, Title, Panel, Copy, Heading, Stack, Actions, RouteLink } from '../../storefront/storefrontStyles';
export function AccountReservationsPage() {
  const { token, isLoggedIn, isRefreshing } = useAuth();
  const auth = useContext(ModalAuthContext);
  const booking = useBookingOptional();
  const [savedGuestLinks] = useState(() => {
    try { return loadGuestReservationLinks(); } catch { return []; }
  });
  const draft = booking?.draft && !booking.stored && !booking.busy &&
    !booking.storageBlocked && !booking.accountBlocked ? booking.draft : null;
  const needsRecovery = Boolean(booking?.stored?.kind === 'attempt' ||
    booking?.storageBlocked || booking?.accountBlocked);
  const localReceipt = booking?.stored?.kind === 'receipt' && !booking.stored.accountId &&
    booking.stored.receipt.guestAccessToken ? booking.stored.receipt : null;
  const currentToken = useRef(token);
  currentToken.current = isLoggedIn && !isRefreshing ? token : null;
  const claimRequest = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const [claimState, setClaimState] = useState<{ token: string; busy: boolean; error?: string; claimed?: string } | null>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; claimRequest.current?.abort(); }; }, []);
  const [page, setPage] = useState(1);
  const [filters,setFilters] = useState(initialReservationFilters);
  const [search,setSearch] = useState('');
  useEffect(()=>{const timer=setTimeout(()=>{setSearch(filters.q);setPage(1);},250);return()=>clearTimeout(timer);},[filters.q]);
  const query=new URLSearchParams({q:search,status:filters.status,sort:filters.sort,kind:filters.kind}).toString();
  const result = usePublicRead(isLoggedIn && token && !isRefreshing ? `${token}:${page}:${query}` : null, signal => getAccountBookings(token, page, signal, query));
  const claim = async () => {
    if (!localReceipt?.guestAccessToken || !currentToken.current || claimRequest.current) return;
    const ownerToken = currentToken.current;
    const controller = new AbortController();
    claimRequest.current = controller;
    setClaimState({ token: ownerToken, busy: true });
    try {
      await claimReservation(localReceipt.reservationNumber, localReceipt.guestAccessToken, ownerToken, controller.signal);
      if (!mounted.current || currentToken.current !== ownerToken) return;
      setClaimState({ token: ownerToken, busy: false, claimed: localReceipt.reservationNumber });
      setPage(1);
      result.reload();
    } catch {
      if (mounted.current && currentToken.current === ownerToken)
        setClaimState({ token: ownerToken, busy: false, error: 'Připojení rezervace se nepodařilo ověřit. Obnovte stránku nebo zkuste připojení znovu. Při opakování nevznikne nová rezervace.' });
    } finally {
      if (claimRequest.current === controller) claimRequest.current = null;
    }
  };
  const ownClaim = claimState?.token === token ? claimState : null;
  const hasGuestReservation = Boolean(localReceipt && result.data &&
    !result.data.items.some(item => item.kind==='rental' && item.reservation.reservationNumber === localReceipt.reservationNumber) &&
    ownClaim?.claimed !== localReceipt.reservationNumber);
  return <Page><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}><Title>Moje rezervace</Title>
    <ReservationToolbar value={filters} onChange={value=>{setFilters(value);setPage(1);}}/></div>
    <section aria-label="Rezervace">
    {isLoggedIn&&result.data&&!result.data.guestEmailAccess?<FittingLinkRecovery token={token} guestEmailAccess={false} onConnected={()=>{setPage(1);result.reload();}}/>:null}
    {isLoggedIn&&result.data&&!result.data.guestEmailAccess?<details style={{marginBottom:16}}><summary style={{minHeight:44,cursor:'pointer'}}>Chybí rezervace vytvořená bez přihlášení?</summary><Copy>{result.data.guestEmailAccess?'Zobrazujeme také nepřiřazené rezervace se stejným ověřeným e-mailem. Pokud rezervaci nevidíte, zkontrolujte e-mail uvedený v objednávce.':'Rezervace vytvořené bez přihlášení zobrazíme po ověření stejného e-mailu v profilu.'}</Copy>{!result.data.guestEmailAccess?<RouteLink to="/ucet">Ověřit e-mail v profilu</RouteLink>:null}</details>:null}
    {booking?.draftStorageWarning && !booking.stored ? <Copy role="alert">
      Rozpracovaný výběr se nepodařilo uložit v tomto prohlížeči. Před dokončením nezavírejte ani neobnovujte stránku.
    </Copy> : null}
    {draft ? <Panel aria-label="Rozpracovaná rezervace">
      <div><StatusBadge tone="info">Rozpracované</StatusBadge></div>
      {draftItems(draft).map(item => <div key={item.product.id}>
        <Heading>{item.product.name}</Heading>
        {item.variantId ? <Copy>Velikost {item.product.variants.find(v => v.id === item.variantId)?.size}</Copy> : null}
      </div>)}
      <Copy>{modeLabel(draft.selection.rentalMode)}</Copy>
      {draft.selection.startDate && draft.selection.endDate ? <Copy>
        {formatCalendarDay(draft.selection.startDate)} – {formatCalendarDay(draft.selection.endDate)}
      </Copy> : null}
      <Actions><RouteLink to={routes.reservation}>Dokončit rezervaci</RouteLink></Actions>
    </Panel> : null}
    {needsRecovery ? <Panel>
      <Heading>{booking?.accountBlocked ? 'Rezervace vašeho účtu' :
        booking?.storageBlocked ? 'Uložení rezervace vyžaduje kontrolu' :
        booking?.busy ? 'Odesílání rezervace…' : 'Výsledek rezervace není potvrzený'}</Heading>
      <Actions><RouteLink to={routes.reservation}>Otevřít rezervaci</RouteLink></Actions>
    </Panel> : null}
    {!isLoggedIn && !isRefreshing && localReceipt ? <Panel>
      <Heading>{localReceipt.reservationNumber} · {statusLabel(localReceipt.status)}</Heading>
      {receiptItems(localReceipt).map((item, index) => <Copy key={index}>{item.productName} · Velikost {item.size}</Copy>)}
      <Copy>{modeLabel(localReceipt.rentalMode)}</Copy>
      <Actions><RouteLink to={routes.reservation}>Otevřít rezervaci</RouteLink></Actions>
    </Panel> : null}
    {savedGuestLinks.length > 0 ? <Panel>
      <Heading>Dřívější rezervace bez přihlášení</Heading>
      <Copy>Soukromé odkazy jsou uložené pro tuto relaci prohlížeče. Pro pozdější přístup si je uložte.</Copy>
      <Actions>{savedGuestLinks.map(link => <RouteLink key={link.reservationNumber}
        to={reservationStatusPath(link.reservationNumber, link.guestAccessToken)}>
        {link.reservationNumber}
      </RouteLink>)}</Actions>
    </Panel> : null}
    {isRefreshing ? <Copy role="status">Načítáme účet…</Copy> : !isLoggedIn ? <Panel><Copy>Pro zobrazení rezervací uložených v účtu se přihlaste.</Copy><Button onClick={() => auth?.setIsOpenModalAuth(true)}>Přihlásit se</Button></Panel>
    : result.loading ? <Copy role="status">Načítáme rezervace…</Copy> : result.error ? <Panel><Copy role="alert">Rezervace se nepodařilo načíst. Zkuste to znovu; pokud přihlášení vypršelo, přihlaste se znovu.</Copy><Button onClick={result.reload}>Zkusit znovu</Button></Panel>
    : result.data ? <Stack>
      {localReceipt && !result.data.items.some(item => item.kind==='rental' && item.reservation.reservationNumber === localReceipt.reservationNumber) && ownClaim?.claimed !== localReceipt.reservationNumber ? <Panel>
        <Heading>Rezervace z tohoto prohlížeče</Heading>
        <Copy>{localReceipt.reservationNumber} byla vytvořena jako host. Můžete ji připojit k právě přihlášenému účtu.</Copy>
        <Copy>{modeLabel(localReceipt.rentalMode)}</Copy>
        {ownClaim?.error ? <Copy role="alert">{ownClaim.error}</Copy> : null}
        <Actions><Button disabled={ownClaim?.busy} loading={ownClaim?.busy} onClick={() => void claim()}>Připojit rezervaci k účtu</Button>
          <RouteLink to={routes.reservation}>Otevřít rezervaci</RouteLink></Actions>
      </Panel> : null}
      {ownClaim?.claimed ? <Copy role="status">Rezervace byla připojena k vašemu účtu.</Copy> : null}
      {result.data.total > 0 && <Copy>Celkem rezervací: {result.data.total}.</Copy>}
      {result.data.items.length === 0 && (!draft || page > 1) && !needsRecovery && !localReceipt && savedGuestLinks.length === 0 && <Panel>
        <Copy>{page === 1 ? (search||filters.status!=='all'?'Žádná rezervace neodpovídá hledání nebo filtrům.':'Zatím zde nejsou žádné rezervace.') : 'Na této stránce už nejsou žádné rezervace.'}</Copy>
        {page === 1 ? <Actions><RouteLink to={routes.newArrivals}>Prohlédnout nabídku</RouteLink></Actions>
          : <Button variant="secondary" onClick={() => setPage(1)}>Zpět na první stránku</Button>}
      </Panel>}
      {result.data.items.map(entry => {
       if(entry.kind==='fitting'){
        const item=entry.fitting;
        return <Panel key={item.number}>
         <Copy>Zkouška · {fittingStatusLabels[item.status]}</Copy>
         <Heading>{fittingDateLabel(item.date)} · {item.time}</Heading>
         <Copy>{item.number}</Copy>
         <Copy>{item.durationMinutes} minut · {item.price} Kč · {item.paymentStatus==='paid'?'Zaplaceno':item.paymentStatus==='refunded'?'Platba vrácena':'Nezaplaceno'}</Copy>
         {item.product?<Copy>{item.product.name}</Copy>:null}
         {item.status==='completed'&&item.paymentStatus==='paid'?<Copy>Zaplacených 200 Kč za zkoušku můžete uplatnit při rezervaci šatů.</Copy>:null}
         <Actions><RouteLink to={'/zkouska/'+item.number}>Podrobnosti a platba</RouteLink></Actions>
        </Panel>;
       }
       const receipt=entry.reservation;
       return <Panel key={receipt.reservationNumber}>
        <Copy>Pronájem · {statusLabel(receipt.status)}</Copy>
        <Heading>{formatCalendarDay(receipt.startDate)} – {formatCalendarDay(receipt.endDate)}</Heading>
        <Copy>{receipt.reservationNumber}</Copy>
        {receiptItems(receipt).map((item,index)=><Copy key={index}>{item.productName} · Velikost {item.size}</Copy>)}
        <Copy>{modeLabel(receipt.rentalMode)}</Copy>
        <FulfillmentSummary value={receipt}/>
        <Actions><RouteLink to={routes.reservation+'/'+encodeURIComponent(receipt.reservationNumber)}>Podrobnosti a platba</RouteLink></Actions>
       </Panel>;
      })}
      {(result.data.total > 20 || page > 1) && <Actions aria-label="Stránkování rezervací"><Button variant="secondary" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Předchozí</Button><Copy>Strana {page}</Copy><Button variant="secondary" disabled={page * 20 >= result.data.total} onClick={() => setPage(value => value + 1)}>Další</Button></Actions>}
      {hasGuestReservation ? <details>
        <summary style={{ minHeight: 44, cursor: 'pointer', padding: '12px 0' }}>Rezervace bez přihlášení</summary>
        <Copy>Rezervace vytvořené bez přihlášení otevřete jejich soukromým odkazem.</Copy>
      </details> : null}
    </Stack> : null}
  </section></Page>;
}
