import {FulfillmentChoice, FulfillmentSummary} from './FulfillmentChoice';
import {fulfillmentError} from './fulfillment';
import {trackAvailability} from '../../analytics/analytics';
import {useSiteSettings} from '../../siteSettings/SiteSettingsProvider';
import {useLiveReservation} from './useLiveReservation';
import {FittingDiscountPicker,type FittingDiscountSelection} from '../../fittings/FittingDiscount';
import { RentalPriceRows } from '../payments/RentalPriceRows';
import styled from 'styled-components';
import {discountQuotes} from '../../partner/discount';
import { X, Shirt } from 'lucide-react';
import { IconButton } from '../../design-system/components/IconButton';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { RentalCalendar } from './RentalCalendar';
import {
  BookingPaymentExplanation,
  ReceiptPaymentInformation,
  CompanyInformation,
} from '../payments/PaymentInformation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCatalogueReturnTo } from '../catalogueNavigation';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { SelectField } from '../../design-system/components/SelectField';
import { TextareaField } from '../../design-system/components/TextareaField';
import {
  formatCalendarDay,
  pragueToday,
} from '../../admin/calendar/calendarDates';
import { routes } from '../../navigation/routes';
import {
  getAvailability,
  getBookingPolicy,
  PublicApiError,
  sameSelection,
  receiptItems,
  type Pricing,
  type Selection,
} from '../api/publicApi';
import {
  Actions,
  Alert,
  Columns,
  Copy,
  ErrorCopy,
  Facts,
  Heading,
  Page,
  Panel,
  RouteLink,
  Stack,
  Title,
} from '../storefrontStyles';
import { usePublicRead } from '../usePublicRead';
import { useBooking } from './BookingProvider';
import { reservationStatusPath } from './BookingStatusPage';
import {
  contactErrors,
  draftItems,
  draftSelections,
  draftSelectionsValid,
  formatMoney,
  modeLabel,
  selectionErrors,
  statusLabel,
} from './bookingModel';
const ItemCard = styled(Stack)`
  gap: ${t.space[2]} ${t.space[3]};
  grid-template-columns:72px minmax(0,1fr);
  align-content:start;
  > :not(:first-child){grid-column:2;}
  @media(max-width:767px){grid-template-columns:60px minmax(0,1fr);h3{font-size:18px;line-height:1.4;}}
`;
const Thumbnail = styled.div`
  grid-column:1;grid-row:1 / span 3;align-self:start;aspect-ratio:3/4;overflow:hidden;border-radius:8px;background:${t.color.bg.subtle};display:grid;place-items:center;color:${t.color.text.muted};
  img{width:100%;height:100%;object-fit:cover;}
`;
function BookingThumbnail({url,name}:{url?:string;name:string}){
  const [failed,setFailed]=useState(false);
  return <Thumbnail>{url&&!failed?<img src={url} alt={'Fotografie: '+name} loading="lazy" onError={()=>setFailed(true)}/>:<Shirt aria-label="Fotografie není k dispozici" size={24}/>}</Thumbnail>;
}
const ItemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${t.space[2]};
  min-inline-size: 0;
  > h3 { min-inline-size: 0; align-self: center; }
`;
const SectionHeader = styled.div`
  display:flex;align-items:center;justify-content:space-between;gap:${t.space[3]};
`;
const DateFields = styled.div`
  display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${t.space[3]};
  input {min-inline-size:0;inline-size:100%;}
`;
const AvailabilityActions = styled.div`
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:${t.space[3]};
  > p {flex:1;min-inline-size:140px;font-size:${t.type.bodySm.size};font-weight:600;}
`;
const PriceFacts = styled(Facts)`
  > div { display: grid; grid-template-columns: minmax(0, 1fr) max-content; }
  dd { white-space: nowrap; }
`;
export function PriceSummary({ pricing, discount }: { pricing: Pricing; discount?: {number: string; amount: number} }) {
  return (
    <PriceFacts>
      <RentalPriceRows rentalPrice={pricing.rentalPrice} discount={discount} />
      {pricing.deposit > 0 ? <div>
        <dt>Vratná kauce</dt>
        <dd>{formatMoney(pricing.deposit)}</dd>
      </div> : null}
      <div>
        <dt>Celkem k úhradě</dt>
        <dd>{formatMoney(pricing.totalDue)}</dd>
      </div>
    </PriceFacts>
  );
}
const formatInstant = (value: string) =>
  new Intl.DateTimeFormat('cs-CZ', {
    timeZone: 'Europe/Prague',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
export function BookingPage() {
  const {cooperationActive, loading: settingsLoading, error: settingsError, reload: reloadSettings}=useSiteSettings();
  const booking = useBooking(),
    navigate = useNavigate(),
    location = useLocation(),
    draft = booking.draft;
  const receiptKey=booking.stored?.kind==='receipt' ? booking.stored.receipt.reservationNumber+':'+(booking.discountAuthToken??'guest') : null;
  useLiveReservation(receiptKey,booking.refreshStatus);
  const receiptReady=booking.receiptVerified && !booking.busy && !booking.error;
  const catalogueReturnTo = getCatalogueReturnTo(location.state, draft?.product.category);
  const policy = usePublicRead(
    booking.stored ? null : 'booking-policy',
    getBookingPolicy
  );
  const [fittingDiscount,setFittingDiscount]=useState<FittingDiscountSelection>();
  useEffect(()=>{if(draft?.selection.rentalMode!=='studio')setFittingDiscount(undefined);},[draft?.selection.rentalMode]);
  useEffect(()=>{
    if(cooperationActive===false && draft?.selection.rentalMode==='studio' && !booking.stored){
      booking.updateDraft({...draft,selection:{...draft.selection,rentalMode:'external'}});
      setRequested(null);
    }
  },[cooperationActive,draft,booking]);
  const [requested, setRequested] = useState<Selection[] | null>(null),
    [itemValidation, setItemValidation] = useState<Record<string, string>>({}),
    [selectionValidation, setSelectionValidation] = useState<
      ReturnType<typeof selectionErrors>
    >({}),
    [contactValidation, setContactValidation] = useState<
      ReturnType<typeof contactErrors>
    >({});
  const root = useRef<HTMLDivElement>(null),
    notice = useRef<HTMLDivElement>(null),
    title = useRef<HTMLHeadingElement>(null);
  const key =
    requested &&
    draft &&
    requested.length === draftSelections(draft).length &&
    requested.every((selection, index) => sameSelection(selection, draftSelections(draft)[index])) &&
    !booking.stored &&
    !booking.error
      ? JSON.stringify(requested)
      : null;
  const availability = usePublicRead(key, async signal => {
    const items = discountQuotes(await Promise.all(requested!.map(selection => getAvailability(selection, signal))));
    trackAvailability(items.every(item => item.available));
    return { ...items[0], items, available: items.every(item => item.available),
      pricing: items.reduce((sum, item) => ({
        rentalPrice: sum.rentalPrice + item.pricing.rentalPrice,
        deposit: sum.deposit + item.pricing.deposit, totalDue: sum.totalDue + item.pricing.totalDue,
      }), { rentalPrice: 0, deposit: 0, totalDue: 0 }) };
  });
  const quote = availability.data,
    variant = draft?.product.variants.find(
      v => v.id === draft.selection.variantId
    );
  const previousEntry = useRef<string | null>(null);
  const view = booking.storageBlocked
    ? 'storage'
    : booking.busy
      ? 'pending'
      : (booking.stored?.kind ?? (booking.error ? 'error' : 'draft'));
  useLayoutEffect(() => {
    if (!booking.stored && (settingsLoading || settingsError)) return;
    if (previousEntry.current === location.key) return;
    previousEntry.current = location.key;
    if (view === 'draft') {
      title.current?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }, [location.key, view, booking.stored, settingsLoading, settingsError]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (view === 'attempt' || view === 'storage' || view === 'error')
        notice.current?.focus();
      else if (view === 'receipt') title.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [view]);
  const focusField = (field: string) =>
    root.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
  const changeSelection = (field: keyof Selection, value: string) => {
    if (!draft) return;
    setRequested(null);
    setSelectionValidation({});
    setItemValidation({});
    booking.updateDraft({
      ...draft,
      selection: { ...draft.selection, [field]: value },
    });
  };
  const checkEditedDates = () => {
    if (!draft || booking.stored || booking.storageBlocked) return;
    if (!draftSelectionsValid(draft)) return;
    setRequested(draftSelections(draft));
  };
  const check = () => {
    if (!draft) return;
    const errors = selectionErrors(draft.selection);
    if (!variant?.pricing[draft.selection.rentalMode])
      errors.rentalMode =
        'Tento způsob pronájmu není dostupný pro vybranou velikost.';
    const itemErrors: Record<string, string> = {};
    for (const item of draft.additionalItems ?? []) {
      if (!item.product.variants.find(v => v.id === item.variantId)?.pricing[draft.selection.rentalMode])
        itemErrors[item.product.id] = 'Vyberte dostupnou velikost pro tento způsob pronájmu.';
    }
    setItemValidation(itemErrors);
    setSelectionValidation(errors);
    const first = Object.keys(errors)[0];
    if (first) {
      focusField(first);
      return;
    }
    if (Object.keys(itemErrors).length) {
      focusField('variant-' + Object.keys(itemErrors)[0]);
      return;
    }
    booking.updateDraft(draft); // Explicit recheck clears a known rejection, never a frozen attempt.
    setRequested(draftSelections(draft));
    availability.reload();
  };
  const [deliveryError,setDeliveryError] = useState<string>();
  const submit = async () => {
    if (!draft) return;
    const deliveryError = fulfillmentError(draft, draft.selection.rentalMode);
    setDeliveryError(deliveryError);
    if(deliveryError){document.querySelector<HTMLButtonElement>('[data-delivery] button')?.focus();return;}
    const errors = contactErrors(draft.contact);
    setContactValidation(errors);
    const first = Object.keys(errors)[0];
    if (first) {
      focusField(first);
      return;
    }
    if(fittingDiscount&&(quote?.pricing.rentalPrice??0)<200){setFittingDiscount(undefined);return;}
    await booking.submit(quote, policy.data, fittingDiscount);
  };
  const errorFor = (
    field: string,
    errors: Record<string, string | undefined>
  ) =>
    errors[field] ? (
      <ErrorCopy id={`booking-${field}-error`}>{errors[field]}</ErrorCopy>
    ) : null;
  const stored = booking.stored;
  if (!stored && (settingsLoading || settingsError)) return <Page><Title>Rezervace</Title>
    {settingsError ? <Alert role="alert"><Copy>Nastavení pronájmu se nepodařilo načíst.</Copy><Button onClick={reloadSettings}>Načíst nastavení znovu</Button></Alert>
      : <Copy role="status">Načítáme možnosti pronájmu…</Copy>}
  </Page>;
  if (booking.accountBlocked) return <Page><Title>Rezervace vašeho účtu</Title>
    <Panel><Copy>Pro zobrazení nebo ověření této rezervace se přihlaste ke stejnému účtu, ze kterého byla vytvořena.</Copy>
      <RouteLink to={routes.account}>Přejít k přihlášení</RouteLink>
    </Panel></Page>;
  return (
    <Page>
      <div ref={root}>
        <Stack>
          <Title ref={title} tabIndex={-1}>
            {stored?.kind === 'receipt'
              ? 'Rezervace byla vytvořena'
              : 'Rezervace'}
          </Title>
          {booking.draftStorageWarning && !booking.stored ? <Copy role="alert">
            Rozpracovaný výběr se nepodařilo uložit v tomto prohlížeči. Před dokončením nezavírejte ani neobnovujte stránku.
          </Copy> : null}
          {booking.storageBlocked ? (
            <Alert ref={notice} role="alert" tabIndex={-1}>
              <Heading>Rezervaci nyní nelze bezpečně odeslat</Heading>
              <Copy>{booking.error}</Copy>
              <Actions>
                <Button onClick={booking.retryStorage}>Zkusit znovu</Button>
              </Actions>
            </Alert>
          ) : null}
          {stored?.kind === 'receipt' ? (
            <Panel>
              <Heading>{stored.receipt.reservationNumber}</Heading>
              <Copy role="status">
                Stav: {statusLabel(stored.receipt.status)}
              </Copy>
              {receiptItems(stored.receipt).map((item, index) => <div key={index}>
                <Heading>{item.productName}</Heading><Copy>Velikost {item.size}</Copy>
              </div>)}
              <Facts>
                <div>
                  <dt>Způsob pronájmu</dt>
                  <dd>{modeLabel(stored.receipt.rentalMode)}</dd>
                </div>
                <div>
                  <dt>Termín pronájmu</dt>
                  <dd>
                    {formatCalendarDay(stored.receipt.startDate)} –{' '}
                    {formatCalendarDay(stored.receipt.endDate)}
                  </dd>
                </div>
              </Facts>
              <FulfillmentSummary value={stored.receipt}/>
              {receiptReady ? <>
              <PriceSummary
                discount={stored.receipt.fittingDiscount}
                pricing={{
                  rentalPrice: stored.receipt.subtotal,
                  deposit: stored.receipt.deposit,
                  totalDue: stored.receipt.totalDue,
                }}
              />
              {stored.receipt.status === 'pending' &&
              stored.receipt.expiresAt ? (
                <Copy>
                  Předběžná rezervace platí do{' '}
                  {formatInstant(stored.receipt.expiresAt)} (Praha).
                </Copy>
              ) : null}
              <Copy>
                Platba:{' '}
                {stored.receipt.paymentStatus === 'paid'
                  ? 'Zaplaceno'
                  : stored.receipt.paymentStatus === 'unpaid'
                    ? 'Nezaplaceno'
                    : stored.receipt.paymentStatus === 'refunded'
                      ? 'Vrácená platba'
                      : 'Neznámý stav platby'}
              </Copy>
              <ReceiptPaymentInformation receipt={stored.receipt} showRentalPrice={false}
                onUpdated={() => void booking.refreshStatus()}
                access={stored.accountId && booking.discountAuthToken
                  ? {kind:'account',token:booking.discountAuthToken}
                  : stored.receipt.guestAccessToken ? {kind:'guest',token:stored.receipt.guestAccessToken} : undefined} />
              </> : <Copy role="status">{booking.busy ? 'Ověřujeme aktuální cenu a platební údaje…' : 'Platební údaje zobrazíme až po ověření aktuálního stavu rezervace.'}</Copy>}
              {booking.error && !booking.storageBlocked ? <Copy role="alert">{booking.error}</Copy> : null}
              {(stored.receipt.guestAccessToken || stored.accountId) && (
                <Actions>
                  <Button disabled={booking.busy} onClick={booking.refreshStatus}>
                    {booking.busy ? 'Ověřování stavu…' : 'Aktualizovat stav rezervace'}
                  </Button>
                  <RouteLink to={stored.accountId ? routes.accountReservations : reservationStatusPath(stored.receipt.reservationNumber, stored.receipt.guestAccessToken!)}>
                    Otevřít aktuální stav rezervace
                  </RouteLink>
                </Actions>
              )}
              <Actions>
                <Button
                  disabled={booking.storageBlocked}
                  onClick={() => {
                    if (booking.startNew()) navigate(catalogueReturnTo);
                  }}
                >
                  Vytvořit novou rezervaci
                </Button>
                <RouteLink to={catalogueReturnTo}>Zpět na produkty</RouteLink>
              </Actions>
            </Panel>
          ) : stored?.kind === 'attempt' ? (
            <Alert
              ref={notice}
              role={booking.busy ? 'status' : 'alert'}
              tabIndex={-1}
            >
              <Heading>
                {booking.busy
                  ? 'Odesílání rezervace…'
                  : 'Výsledek rezervace není potvrzený'}
              </Heading>
              <Copy>
                Požadavek mohl být zpracován. Ověřte stav původní rezervace před
                vytvořením nové. Ověření používá stejný požadavek, aby nevznikla
                duplicitní rezervace.
              </Copy>
              <Copy>
                {modeLabel(stored.body.rentalMode)} ·{' '}
                {formatCalendarDay(stored.body.startDate)} –{' '}
                {formatCalendarDay(stored.body.endDate)}
              </Copy>
              <FulfillmentSummary value={stored.body}/>
              {booking.error && !booking.storageBlocked ? (
                <Copy>{booking.error}</Copy>
              ) : null}
              <Actions>
                <Button
                  disabled={booking.busy || booking.storageBlocked}
                  loading={booking.busy}
                  onClick={() => void booking.recover()}
                >
                  Ověřit stav rezervace
                </Button>
              </Actions>
            </Alert>
          ) : draft ? (
            <Columns>
              <Stack>
                <SectionHeader><Heading>Položky</Heading><RouteLink to={catalogueReturnTo} aria-label="Přidat další produkt">Přidat</RouteLink></SectionHeader>
                <ItemCard role="group" aria-label={draft.product.name}>
                  <BookingThumbnail key={draft.product.photos[0]?.url||draft.product.id} url={draft.product.photos[0]?.url} name={draft.product.name}/>
                  <ItemHeader>
                    <Heading as="h3">{draft.product.name}</Heading>
                    <IconButton aria-label={'Odebrat ' + draft.product.name} icon={<X aria-hidden="true" />}
                      onClick={() => { setRequested(null); booking.removeProduct(draft.product.id); }} />
                  </ItemHeader>
                <Stack>
                  <SelectField
                    label="Velikost"
                    name="variantId"
                    value={draft.selection.variantId}
                    aria-invalid={
                      Boolean(selectionValidation.variantId) || undefined
                    }
                    aria-describedby={
                      selectionValidation.variantId
                        ? 'booking-variantId-error'
                        : undefined
                    }
                    onChange={event =>
                      changeSelection('variantId', event.target.value)
                    }
                  >
                    <option value="">Vyberte velikost</option>
                    {draft.product.variants.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.size}
                      </option>
                    ))}
                  </SelectField>
                  {errorFor('variantId', selectionValidation)}
                </Stack>
                </ItemCard>
                {(draft.additionalItems ?? []).map(item => <ItemCard key={item.product.id} role="group" aria-label={item.product.name}>
                  <BookingThumbnail key={item.product.photos[0]?.url||item.product.id} url={item.product.photos[0]?.url} name={item.product.name}/>
                  <ItemHeader>
                    <Heading as="h3">{item.product.name}</Heading>
                    <IconButton aria-label={'Odebrat ' + item.product.name} icon={<X aria-hidden="true" />}
                      onClick={() => { setRequested(null); booking.removeProduct(item.product.id); }} />
                  </ItemHeader>
                  <SelectField label="Velikost" name={'variant-' + item.product.id}
                    value={item.variantId} aria-invalid={Boolean(itemValidation[item.product.id]) || undefined}
                    aria-describedby={itemValidation[item.product.id] ? 'booking-variant-' + item.product.id + '-error' : undefined}
                    onChange={event => {
                      setRequested(null); setItemValidation({});
                      booking.updateDraft({ ...draft, additionalItems: draft.additionalItems!.map(row =>
                        row.product.id === item.product.id ? { ...row, variantId: event.target.value } : row) });
                    }}>
                    <option value="">Vyberte velikost</option>
                    {item.product.variants.map(v => <option key={v.id} value={v.id}>{v.size}</option>)}
                  </SelectField>
                  {itemValidation[item.product.id] ? <ErrorCopy id={'booking-variant-' + item.product.id + '-error'}>{itemValidation[item.product.id]}</ErrorCopy> : null}
                </ItemCard>)}

                <Stack>
                  <SelectField
                    label="Způsob pronájmu"
                    name="rentalMode"
                    value={draft.selection.rentalMode}
                    aria-invalid={
                      Boolean(selectionValidation.rentalMode) || undefined
                    }
                    aria-describedby={
                      selectionValidation.rentalMode
                        ? 'booking-rentalMode-error'
                        : undefined
                    }
                    onChange={event =>
                      changeSelection('rentalMode', event.target.value)
                    }
                  >
                    {cooperationActive && <option
                      value="studio"
                      disabled={Boolean(variant && !variant.pricing.studio)}
                    >
                      Studio (Blaze)
                    </option>}
                    <option
                      value="external"
                      disabled={Boolean(variant && !variant.pricing.external)}
                    >
                      Mimo studio
                    </option>
                  </SelectField>
                  {errorFor('rentalMode', selectionValidation)}
                </Stack>
                <Heading>{draft.additionalItems?.length ? 'Společný termín pronájmu' : 'Termín pronájmu'}</Heading>
                <RentalCalendar selection={draft.selection} selections={draftSelections(draft)}
                  enabled={draftItems(draft).every(item => Boolean(item.product.variants.find(v => v.id === item.variantId)?.pricing[draft.selection.rentalMode])) && !booking.storageBlocked}
                  onChange={(startDate, endDate) => {
                    const selection = { ...draft.selection, startDate, endDate };
                    setSelectionValidation({});
                    booking.updateDraft({ ...draft, selection });
                    setRequested(startDate && endDate ? draftSelections({ ...draft, selection }) : null);
                  }}
                />
                <DateFields>
                {(['startDate', 'endDate'] as const).map(field => (
                  <Stack key={field}>
                    <Input
                      name={field}
                      label={field === 'startDate' ? 'Od' : 'Do'}
                      onBlur={checkEditedDates}
                      type="date"
                      min={
                        field === 'endDate'
                          ? draft.selection.startDate || pragueToday()
                          : pragueToday()
                      }
                      value={draft.selection[field]}
                      error={Boolean(selectionValidation[field])}
                      aria-describedby={
                        selectionValidation[field]
                          ? `booking-${field}-error`
                          : undefined
                      }
                      onChange={event =>
                        changeSelection(field, event.target.value)
                      }
                    />
                    {errorFor(field, selectionValidation)}
                  </Stack>
                ))}
                </DateFields>
                <AvailabilityActions>
                  <Button
                    variant="secondary"
                    loading={availability.loading}
                    disabled={booking.storageBlocked}
                    onClick={check}
                  >
                    Ověřit dostupnost
                  </Button>
                  {quote ? <Copy role="status">{quote.available ? 'Termín je aktuálně dostupný' : 'Tento termín není dostupný'}</Copy> : null}
                </AvailabilityActions>
                {availability.error ? (
                  <Alert role="alert">
                    <Copy>
                      {availability.error instanceof PublicApiError &&
                      availability.error.status === 404
                        ? 'Produkt není dostupný.'
                        : availability.error instanceof PublicApiError &&
                            availability.error.code ===
                              'RENTAL_MODE_UNAVAILABLE'
                          ? 'Tento způsob pronájmu není dostupný.'
                          : 'Dostupnost se nepodařilo ověřit. Zkuste to prosím znovu.'}
                    </Copy>
                    <Button variant="secondary" onClick={check}>
                      Zkusit znovu
                    </Button>
                  </Alert>
                ) : quote && !quote.available ? <Copy>Vyberte prosím jiný termín.</Copy> : null}
              </Stack>
              <Stack>
                <form
                  noValidate
                  onSubmit={event => {
                    event.preventDefault();
                    void submit();
                  }}
                >
                  <Stack>
                    {draft.selection.rentalMode === 'external' ? <div data-delivery><FulfillmentChoice value={draft} disabled={booking.busy} error={deliveryError} onChange={value=>{setDeliveryError(undefined);booking.updateDraft({...draft,fulfillmentMethod:value.fulfillmentMethod,balikovnaPoint:value.balikovnaPoint});}}/></div> : null}
                    <Heading>Kontaktní údaje</Heading>
                    {(['firstName', 'lastName', 'email', 'phone'] as const).map(
                      field => (
                        <Stack key={field}>
                          <Input
                            name={field}
                            label={
                              {
                                firstName: 'Jméno',
                                lastName: 'Příjmení',
                                email: 'E-mail',
                                phone: 'Telefon',
                              }[field]
                            }
                            type={
                              field === 'email'
                                ? 'email'
                                : field === 'phone'
                                  ? 'tel'
                                  : 'text'
                            }
                            autoComplete={
                              {
                                firstName: 'given-name',
                                lastName: 'family-name',
                                email: 'email',
                                phone: 'tel',
                              }[field]
                            }
                            value={draft.contact[field]}
                            error={Boolean(contactValidation[field])}
                            aria-describedby={
                              contactValidation[field]
                                ? `booking-${field}-error`
                                : undefined
                            }
                            onChange={event => {
                              setContactValidation({});
                              booking.updateDraft({
                                ...draft,
                                contact: {
                                  ...draft.contact,
                                  [field]: event.target.value,
                                },
                              });
                            }}
                          />
                          {errorFor(field, contactValidation)}
                        </Stack>
                      )
                    )}
                    <TextareaField
                      name="notes"
                      label="Poznámka"
                      value={draft.contact.notes}
                      error={Boolean(contactValidation.notes)}
                      aria-describedby={
                        contactValidation.notes
                          ? 'booking-notes-error'
                          : 'booking-notes-help'
                      }
                      onChange={event => {
                        setContactValidation({});
                        booking.updateDraft({
                          ...draft,
                          contact: {
                            ...draft.contact,
                            notes: event.target.value,
                          },
                        });
                      }}
                    />
                    <Copy id="booking-notes-help">
                      Volitelné. Maximálně 1500 znaků.
                    </Copy>
                    {errorFor('notes', contactValidation)}
                    {draft.selection.rentalMode === 'studio' ? <FittingDiscountPicker token={booking.discountAuthToken} disabled={booking.busy} total={quote?.pricing.rentalPrice??0} selected={fittingDiscount} onChange={setFittingDiscount}/> : <Copy>Sleva za zkoušku platí pouze pro pronájem ve studiu Blaze. Pokud jste zkoušku absolvovali, sdělte nám její číslo pro propojení rezervace.</Copy>}
                    {policy.loading ? (
                      <Copy role="status">Načítání informací o platbě…</Copy>
                    ) : policy.error ? (
                      <Alert role="alert">
                        <Copy>
                          Informace o platbě se nepodařilo načíst. Před
                          odesláním rezervace je načtěte znovu.
                        </Copy>
                        <Button variant="secondary" onClick={policy.reload}>
                          Načíst informace o platbě
                        </Button>
                      </Alert>
                    ) : policy.data ? (
                      <>
                        <BookingPaymentExplanation
                          policy={policy.data}
                          hasDeposit={draft.selection.rentalMode !== 'studio'}
                          fittingCredit={fittingDiscount ? 200 : 0}
                          rentalPrice={
                            quote ? quote.pricing.rentalPrice - (fittingDiscount ? 200 : 0) : undefined
                          }
                        />
                        <CompanyInformation company={policy.data.company} />
                      </>
                    ) : null}
                    {quote?.available ? <Panel aria-label="Souhrn rezervace">
                      <Heading>Souhrn rezervace</Heading>
                      <Copy>{draftItems(draft).map(item => item.product.name + ' · velikost ' + item.product.variants.find(v => v.id === item.variantId)?.size).join(', ')}</Copy>
                      <Copy>{modeLabel(quote.rentalMode)} · {formatCalendarDay(quote.startDate)} – {formatCalendarDay(quote.endDate)}</Copy>
                      <PriceSummary discount={fittingDiscount ? {number:fittingDiscount.number,amount:200} : undefined} pricing={fittingDiscount?{...quote.pricing,rentalPrice:quote.pricing.rentalPrice-200,totalDue:quote.pricing.totalDue-200}:quote.pricing} />
                      <Copy>Cena pronájmu je za rezervaci, nikoli za den. Dostupnost a konečnou cenu ověříme při odeslání rezervace.</Copy>
                    </Panel> : null}
                    <Copy>
                      Odesláním vytvoříte rezervaci čekající na potvrzení.
                    </Copy>
                    <RouteLink to={routes.privacy}>
                      Ochrana osobních údajů
                    </RouteLink>
                    {booking.error && !booking.storageBlocked ? (
                      <Alert ref={notice} role="alert" tabIndex={-1}>
                        {booking.error}
                      </Alert>
                    ) : null}
                    <Button
                      type="submit"
                      disabled={
                        !quote?.available ||
                        booking.storageBlocked ||
                        !policy.data
                      }
                      loading={booking.busy}
                    >
                      Rezervovat
                    </Button>
                    {!quote?.available ? (
                      <Copy>
                        Nejprve ověřte dostupnost vybrané velikosti a termínu.
                      </Copy>
                    ) : null}
                  </Stack>
                </form>
              </Stack>
            </Columns>
          ) : !booking.storageBlocked ? (
            <Panel>
              <Heading>Vyberte produkt k pronájmu</Heading>
              <Copy>
                V katalogu si vyberte produkt a pokračujte výběrem velikosti a
                termínu.
              </Copy>
              {booking.error ? <Copy role="alert">{booking.error}</Copy> : null}
              <Actions>
                <RouteLink to={catalogueReturnTo}>Prohlédnout produkty</RouteLink>
              </Actions>
            </Panel>
          ) : null}
        </Stack>
      </div>
    </Page>
  );
}
