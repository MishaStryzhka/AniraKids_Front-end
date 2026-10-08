import {
  BookingPaymentExplanation,
  ReceiptPaymentInformation,
  CompanyInformation,
} from '../payments/PaymentInformation';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  formatMoney,
  modeLabel,
  selectionErrors,
  statusLabel,
} from './bookingModel';
export function PriceSummary({ pricing }: { pricing: Pricing }) {
  return (
    <Facts>
      <div>
        <dt>Cena pronájmu</dt>
        <dd>{formatMoney(pricing.rentalPrice)}</dd>
      </div>
      <div>
        <dt>Vratná kauce</dt>
        <dd>{formatMoney(pricing.deposit)}</dd>
      </div>
      <div>
        <dt>Celkem k úhradě</dt>
        <dd>{formatMoney(pricing.totalDue)}</dd>
      </div>
    </Facts>
  );
}
const formatInstant = (value: string) =>
  new Intl.DateTimeFormat('cs-CZ', {
    timeZone: 'Europe/Prague',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
export function BookingPage() {
  const booking = useBooking(),
    navigate = useNavigate(),
    draft = booking.draft;
  const policy = usePublicRead(
    booking.stored ? null : 'booking-policy',
    getBookingPolicy
  );
  const [requested, setRequested] = useState<Selection | null>(null),
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
    sameSelection(requested, draft.selection) &&
    !booking.stored &&
    !booking.error
      ? JSON.stringify(requested)
      : null;
  const availability = usePublicRead(key, signal =>
    getAvailability(requested!, signal)
  );
  const quote = availability.data,
    variant = draft?.product.variants.find(
      v => v.id === draft.selection.variantId
    );
  const previousState = useRef('');
  const view = booking.storageBlocked
    ? 'storage'
    : booking.busy
      ? 'pending'
      : (booking.stored?.kind ?? (booking.error ? 'error' : 'draft'));
  useEffect(() => {
    if (previousState.current === view) return;
    previousState.current = view;
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
    booking.updateDraft({
      ...draft,
      selection: { ...draft.selection, [field]: value },
    });
  };
  const check = () => {
    if (!draft) return;
    const errors = selectionErrors(draft.selection);
    if (!variant?.pricing[draft.selection.rentalMode])
      errors.rentalMode =
        'Tento způsob pronájmu není dostupný pro vybranou velikost.';
    setSelectionValidation(errors);
    const first = Object.keys(errors)[0];
    if (first) {
      focusField(first);
      return;
    }
    booking.updateDraft(draft); // Explicit recheck clears a known rejection, never a frozen attempt.
    setRequested({ ...draft.selection });
    availability.reload();
  };
  const submit = async () => {
    if (!draft) return;
    const errors = contactErrors(draft.contact);
    setContactValidation(errors);
    const first = Object.keys(errors)[0];
    if (first) {
      focusField(first);
      return;
    }
    await booking.submit(quote, policy.data);
  };
  const errorFor = (
    field: string,
    errors: Record<string, string | undefined>
  ) =>
    errors[field] ? (
      <ErrorCopy id={`booking-${field}-error`}>{errors[field]}</ErrorCopy>
    ) : null;
  const stored = booking.stored;
  return (
    <Page>
      <div ref={root}>
        <Stack>
          <Title ref={title} tabIndex={-1}>
            {stored?.kind === 'receipt'
              ? 'Rezervace byla vytvořena'
              : 'Rezervace'}
          </Title>
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
              <Heading>{stored.receipt.item.productName}</Heading>
              <Facts>
                <div>
                  <dt>Velikost</dt>
                  <dd>{stored.receipt.item.size}</dd>
                </div>
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
              <PriceSummary
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
              <ReceiptPaymentInformation receipt={stored.receipt} />
              {booking.error && !booking.storageBlocked ? <Copy role="alert">{booking.error}</Copy> : null}
              {stored.receipt.guestAccessToken && (
                <Actions>
                  <Button disabled={booking.busy} onClick={booking.refreshStatus}>
                    {booking.busy ? 'Ověřování stavu…' : 'Aktualizovat stav rezervace'}
                  </Button>
                  <RouteLink to={reservationStatusPath(stored.receipt.reservationNumber, stored.receipt.guestAccessToken)}>
                    Otevřít aktuální stav rezervace
                  </RouteLink>
                </Actions>
              )}
              <Actions>
                <Button
                  disabled={booking.storageBlocked}
                  onClick={() => {
                    if (booking.startNew()) navigate(routes.rental);
                  }}
                >
                  Vytvořit novou rezervaci
                </Button>
                <RouteLink to={routes.rental}>Zpět na produkty</RouteLink>
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
                <Heading>{draft.product.name}</Heading>
                <Heading>Velikost a termín</Heading>
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
                    <option
                      value="studio"
                      disabled={Boolean(variant && !variant.pricing.studio)}
                    >
                      Studio
                    </option>
                    <option
                      value="external"
                      disabled={Boolean(variant && !variant.pricing.external)}
                    >
                      Mimo studio
                    </option>
                  </SelectField>
                  {errorFor('rentalMode', selectionValidation)}
                </Stack>
                <Heading>Termín pronájmu</Heading>
                {(['startDate', 'endDate'] as const).map(field => (
                  <Stack key={field}>
                    <Input
                      name={field}
                      label={field === 'startDate' ? 'Od' : 'Do'}
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
                <Actions>
                  <Button
                    variant="secondary"
                    loading={availability.loading}
                    disabled={booking.storageBlocked}
                    onClick={check}
                  >
                    Ověřit dostupnost
                  </Button>
                </Actions>
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
                ) : quote ? (
                  <Panel role="status">
                    <Heading>
                      {quote.available
                        ? 'Termín je aktuálně dostupný'
                        : 'Tento termín není dostupný'}
                    </Heading>
                    {quote.available ? (
                      <>
                        <Copy>
                          {draft.product.name} · velikost {variant?.size}
                        </Copy>
                        <Copy>
                          {modeLabel(quote.rentalMode)} ·{' '}
                          {formatCalendarDay(quote.startDate)} –{' '}
                          {formatCalendarDay(quote.endDate)}
                        </Copy>
                        <PriceSummary pricing={quote.pricing} />
                        <Copy>
                          Cena pronájmu je za rezervaci, nikoli za den.
                          Dostupnost a konečnou cenu ověříme při odeslání
                          rezervace.
                        </Copy>
                      </>
                    ) : (
                      <Copy>Vyberte prosím jiný termín.</Copy>
                    )}
                  </Panel>
                ) : null}
              </Stack>
              <Stack>
                <Heading>Kontaktní údaje</Heading>
                <form
                  noValidate
                  onSubmit={event => {
                    event.preventDefault();
                    void submit();
                  }}
                >
                  <Stack>
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
                          rentalPrice={
                            quote?.pricing.rentalPrice ??
                            variant?.pricing[draft.selection.rentalMode]
                              ?.rentalPrice
                          }
                        />
                        <CompanyInformation company={policy.data.company} />
                      </>
                    ) : null}
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
                <RouteLink to={routes.rental}>Prohlédnout produkty</RouteLink>
              </Actions>
            </Panel>
          ) : null}
        </Stack>
      </div>
    </Page>
  );
}
