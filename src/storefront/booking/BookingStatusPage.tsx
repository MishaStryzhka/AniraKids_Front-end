import {useAuth} from '../../hooks/useAuth';
import {loadGuestReservationLinks} from './guestReservationLinks';
import {FulfillmentSummary} from './FulfillmentChoice';
import {useLiveReservation} from './useLiveReservation';
import {useEffect} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { routes } from '../../navigation/routes';
import { receiptItems, getAccountReservationStatus, getReservationStatus, isGuestAccessToken } from '../api/publicApi';
import { ReceiptPaymentInformation } from '../payments/PaymentInformation';
import { Actions, Copy, Heading, Page, Panel, RouteLink, Title } from '../storefrontStyles';
import { usePublicRead } from '../usePublicRead';
import { formatCalendarDay } from '../../admin/calendar/calendarDates';
import { statusLabel } from './bookingModel';

// The capability stays in the fragment: it is not sent in HTTP URLs/referrers.
export function reservationStatusPath(number: string, token: string) {
  return routes.reservation + '/' + encodeURIComponent(number) + '#' + new URLSearchParams({ token });
}

export function BookingStatusPage() {
  const { hash, search, pathname } = useLocation();
  const {reservationNumber}=useParams();
  const auth=useAuth();
  const accountNumber=reservationNumber??new URLSearchParams(search).get('reservation')??'';
  const navigate=useNavigate();
  const params = new URLSearchParams(hash.slice(1));
  const number = reservationNumber ?? params.get('reservation') ?? new URLSearchParams(search).get('paymentReservation') ?? accountNumber;
  let savedToken='';
  try { savedToken=loadGuestReservationLinks().find(link=>link.reservationNumber===number)?.guestAccessToken ?? ''; } catch { /* The saved private link still works if storage is unavailable. */ }
  const token = params.get('token') ?? savedToken;
  const accountMode=Boolean(accountNumber)&&!isGuestAccessToken(token);
  const valid = /^AK-\d{4}-[A-Z0-9]{6}$/.test(number) && (accountMode?auth.isLoggedIn&&!auth.isRefreshing&&Boolean(auth.token):isGuestAccessToken(token));
  useEffect(()=>{
    if(!valid)return;
    const canonical=accountMode?routes.reservation+'/'+encodeURIComponent(number):reservationStatusPath(number,token);
    if(pathname+search+hash!==canonical)navigate(canonical,{replace:true});
  },[valid,hash,search,pathname,number,token,navigate,accountMode]);
  const result = usePublicRead(valid ? number+(accountMode?auth.token:token) : null, signal => accountMode?getAccountReservationStatus(number,auth.token,signal):getReservationStatus(number, token, signal), true);
  useLiveReservation(valid?number+(accountMode?auth.token:token):null,()=>{if(!result.loading)result.reload();},false);
  return <Page>
    <Title>Vaše rezervace</Title>
    <Panel>
      {accountMode&&!auth.isLoggedIn?<Copy>Pro zobrazení rezervace se <RouteLink to="/ucet">přihlaste</RouteLink>.</Copy>:!valid ? <Copy role="alert">Odkaz na rezervaci není úplný. Otevřete svůj uložený odkaz nebo nás kontaktujte.</Copy>
        : result.loading && !result.data ? <Copy role="status">Ověřování aktuálního stavu…</Copy>
        : result.error ? <>
          <Copy role="alert">Rezervaci se nepodařilo načíst. Zkontrolujte odkaz nebo nás kontaktujte. Nevytvářejte kvůli tomu novou rezervaci.</Copy>
          <Button onClick={result.reload}>Zkusit znovu</Button>
        </> : result.data ? <>
          <Heading>{result.data.reservationNumber}</Heading>
          <Copy>Stav: {statusLabel(result.data.status)}</Copy>
          {receiptItems(result.data).map((item, index) => <div key={index}>
            <Heading>{item.productName}</Heading><Copy>Velikost: {item.size}</Copy>
          </div>)}
          <Copy>{formatCalendarDay(result.data.startDate)} – {formatCalendarDay(result.data.endDate)}</Copy>
          {result.data.fittingDiscount ? <Copy>Započtená platba za zkoušku {result.data.fittingDiscount.number}: −200 Kč</Copy> : null}
          <FulfillmentSummary value={result.data}/>
          <ReceiptPaymentInformation receipt={result.data} onUpdated={result.reload} access={accountMode?{kind:'account',token:auth.token}:{kind:'guest',token}} />
          <Button disabled={result.loading} onClick={result.reload}>{result.loading ? 'Ověřování stavu…' : 'Aktualizovat stav rezervace'}</Button>
          {!accountMode?<Copy>Tento soukromý odkaz si uložte. Každý, kdo jej získá, může zobrazit stav této rezervace a platební pokyny.</Copy>:null}
        </> : null}
      <Actions><RouteLink to={routes.contact}>Kontaktovat ANIRAK</RouteLink></Actions>
    </Panel>
  </Page>;
}
