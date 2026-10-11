import { StatusBadge } from '../../design-system/components/StatusBadge';
import { draftItems, modeLabel } from '../../storefront/booking/bookingModel';
import { useBookingOptional } from '../../storefront/booking/BookingProvider';
import { useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ModalAuthContext } from '../../context/ModalAuthContext';
import { routes } from '../../navigation/routes';
import { Button } from '../../design-system/components/Button';
import { getAccountReservations, claimReservation, receiptItems } from '../../storefront/api/publicApi';
import { usePublicRead } from '../../storefront/usePublicRead';
import { ReceiptPaymentInformation } from '../../storefront/payments/PaymentInformation';
import { statusLabel } from '../../storefront/booking/bookingModel';
import { formatCalendarDay } from '../../admin/calendar/calendarDates';
import { Page, Title, Panel, Copy, Heading, Stack, Actions, RouteLink } from '../../storefront/storefrontStyles';
export function AccountReservationsPage() {
  const { token, isLoggedIn, isRefreshing } = useAuth();
  const auth = useContext(ModalAuthContext);
  const booking = useBookingOptional();
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
  const result = usePublicRead(isLoggedIn && token && !isRefreshing ? `${token}:${page}` : null, signal => getAccountReservations(token, page, signal));
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
        setClaimState({ token: ownerToken, busy: false, error: 'Připojení rezervace se nepodařilo ověřit. Aktualizujte seznam nebo zkuste připojení znovu. Při opakování nevznikne nová rezervace.' });
    } finally {
      if (claimRequest.current === controller) claimRequest.current = null;
    }
  };
  const ownClaim = claimState?.token === token ? claimState : null;
  return <Page><Title>Moje rezervace</Title>
    <Actions><RouteLink to={routes.account}>Můj profil</RouteLink></Actions>
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
      <Actions><RouteLink to={routes.reservation}>Otevřít rezervaci</RouteLink></Actions>
    </Panel> : null}
    {isRefreshing ? <Copy role="status">Načítáme účet…</Copy> : !isLoggedIn ? <Panel><Copy>Pro zobrazení rezervací uložených v účtu se přihlaste.</Copy><Button onClick={() => auth?.setIsOpenModalAuth(true)}>Přihlásit se</Button></Panel>
    : result.loading ? <Copy role="status">Načítáme rezervace…</Copy> : result.error ? <Panel><Copy role="alert">Rezervace se nepodařilo načíst. Zkuste to znovu; pokud přihlášení vypršelo, přihlaste se znovu.</Copy><Button onClick={result.reload}>Zkusit znovu</Button></Panel>
    : result.data ? <Stack>
      {localReceipt && !result.data.items.some(item => item.reservationNumber === localReceipt.reservationNumber) && ownClaim?.claimed !== localReceipt.reservationNumber ? <Panel>
        <Heading>Rezervace z tohoto prohlížeče</Heading>
        <Copy>{localReceipt.reservationNumber} byla vytvořena jako host. Můžete ji připojit k právě přihlášenému účtu.</Copy>
        {ownClaim?.error ? <Copy role="alert">{ownClaim.error}</Copy> : null}
        <Actions><Button disabled={ownClaim?.busy} loading={ownClaim?.busy} onClick={() => void claim()}>Připojit rezervaci k účtu</Button>
          <RouteLink to={routes.reservation}>Otevřít rezervaci</RouteLink></Actions>
      </Panel> : null}
      {ownClaim?.claimed ? <Copy role="status">Rezervace byla připojena k vašemu účtu.</Copy> : null}
      {result.data.total > 0 && <Copy>Celkem rezervací: {result.data.total}.</Copy>}
      {result.data.items.length === 0 && (!draft || page > 1) && !needsRecovery && !localReceipt && <Panel>
        <Copy>{page === 1 ? 'Zatím zde nejsou žádné rezervace.' : 'Na této stránce už nejsou žádné rezervace.'}</Copy>
        {page === 1 ? <Actions><RouteLink to={routes.newArrivals}>Prohlédnout nabídku</RouteLink></Actions>
          : <Button variant="secondary" onClick={() => setPage(1)}>Zpět na první stránku</Button>}
      </Panel>}
      {result.data.items.map(receipt => <Panel key={receipt.reservationNumber}>
        <Heading>{receipt.reservationNumber} · {statusLabel(receipt.status)}</Heading>
        {receiptItems(receipt).map((item, index) => <Copy key={index}>{item.productName} · Velikost {item.size}</Copy>)}
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
