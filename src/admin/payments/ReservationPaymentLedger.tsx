import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../design-system/components/Button';
import { Dialog } from '../../design-system/components/Dialog';
import { Input } from '../../design-system/components/Input';
import { SelectField } from '../../design-system/components/SelectField';
import { TextareaField } from '../../design-system/components/TextareaField';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import {
  isFee,
  type PaymentOperation,
} from '../api/reservationPayments';
import { formatPragueLoadedAt } from '../calendar/reservationCalendarModel';
import { money } from '../reservations/reservationPresentation';
import {
  ReservationActions,
  ReservationCopy,
  ReservationError,
  ReservationFacts,
  ReservationHeading,
  ReservationPanel,
} from '../reservations/reservationStyles';
import {
  emptyPaymentDraft,
  isEmptyPaymentLedger,
  visiblePaymentTypes,
  methodLabel,
  paymentDraftErrors,
  paymentOperation,
  paymentTypeLabels,
} from './paymentModel';
import type { useReservationPayments } from './useReservationPayments';
import { PaymentConfirmationStatus } from '../../storefront/payments/PaymentConfirmationStatus';
import { PaymentQr } from '../../storefront/payments/PaymentInformation';
const Stack = styled.div`
  display: grid;
  gap: ${t.space[3]};
  min-inline-size: 0;
`;
const Facts = styled(ReservationFacts)`
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
const Disclosure = styled.details`
  min-inline-size: 0;
  > summary {
    cursor: pointer;
    min-height: 44px;
    padding-block: ${t.space[3]};
    font-weight: 600;
    &:focus-visible {
      outline: 2px solid ${t.color.focus.ring};
      outline-offset: 2px;
    }
  }
`;
const Summary = styled.div`
  display: grid;
  gap: ${t.space[4]};
  @media (min-width: 768px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  > section { min-inline-size: 0; }
  h3 { margin: 0 0 ${t.space[3]}; font-size: inherit; }
  dl { display: grid; gap: ${t.space[2]}; margin: 0; }
  dl > div { display: flex; justify-content: space-between; gap: ${t.space[3]}; }
  dt { min-inline-size: 0; }
  dd { margin: 0; white-space: nowrap; font-weight: 600; }
`;
const Announcement = styled(ReservationCopy)<{ $quiet: boolean; $success: boolean }>`
  ${({ $success }) => $success ? `color: ${t.color.status.success.fg}; font-weight: 600;` : ''}
  ${({ $quiet }) => $quiet ? 'position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%);' : ''}
`;
const FocusPanel = styled(ReservationPanel)`
  &:focus {
    outline: 2px solid ${t.color.focus.ring};
    outline-offset: 2px;
  }
`;
const List = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: ${t.space[4]};
  > li {
    display: grid;
    gap: ${t.space[2]};
    padding-block-end: ${t.space[4]};
    border-block-end: 1px solid ${t.color.border.subtle};
  }
`;
export function ReservationPaymentLedger({
  controller: state,
  status,
  externalBusy = false,
}: {
  controller: ReturnType<typeof useReservationPayments>;
  status: string;
  externalBusy?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [draft, setDraft] = useState(emptyPaymentDraft),
    [errors, setErrors] = useState<ReturnType<typeof paymentDraftErrors>>({}),
    [confirm, setConfirm] = useState<PaymentOperation | null>(null);
  const panel = useRef<HTMLElement>(null),
    form = useRef<HTMLDivElement>(null),
    safeFocus = useRef<HTMLElement | null>(null),
    previousAttempt = useRef(false),
    submitted = useRef(false),
    addButton = useRef<HTMLElement | null>(null);
  const payments = state.payments,
    blocked = Boolean(
      state.writing ||
        Boolean(state.error) ||
        state.storageBlocked ||
        state.loading ||
        state.attempt ||
        state.conflict ||
        payments?.legacyUnreconciled ||
        externalBusy
    );
  const empty = Boolean(payments && isEmptyPaymentLedger(payments));
  const types = payments ? visiblePaymentTypes(payments, status) : [];
  const settled = Boolean(payments && !payments.legacyUnreconciled && payments.rentalBalance <= 0 && payments.depositHeld >= payments.depositRequired);
  const EntryContainer = settled ? Disclosure : 'div';
  const selectedTypeAvailable = types.includes(draft.type);
  const { focus, ownsView } = state;
  useEffect(() => {
    if (!focus || confirm) return;
    const frame = requestAnimationFrame(() => {
      if (ownsView()) panel.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [focus, confirm, ownsView]);
  useEffect(() => {
    if (
      previousAttempt.current &&
      !state.attempt &&
      !state.conflict &&
      !state.error
    ) {
      setOpen(false);
      setDraft(emptyPaymentDraft());
    }
    previousAttempt.current = Boolean(state.attempt);
  }, [state.attempt, state.conflict, state.error]);
  const prepare = () => {
    if (!payments || blocked) return;
    const problems = paymentDraftErrors(draft, status, payments);
    if (!selectedTypeAvailable) problems.type = 'Tato operace už není dostupná. Vyberte jiný druh operace.';
    setErrors(problems);
    const first = Object.keys(problems)[0];
    if (first) {
      form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    submitted.current = false;
    setConfirm(paymentOperation(draft, payments));
  };
  const save = async () => {
    if (!confirm) return;
    submitted.current = true;
    const success = await state.write(confirm);
    if (!state.ownsView()) return;
    setConfirm(null);
    if (success) {
      setOpen(false);
      setDraft(emptyPaymentDraft());
    }
  };
  const error = (key: keyof typeof draft) =>
    errors[key] ? (
      <ReservationError id={`payment-${key}-error`}>
        {errors[key]}
      </ReservationError>
    ) : null;
  return (
    <FocusPanel ref={panel} tabIndex={-1} aria-label="Platební evidence">
      <ReservationHeading>Platby</ReservationHeading>
      {state.loading ? (
        <ReservationCopy role="status">
          Načítání platební evidence…
        </ReservationCopy>
      ) : null}
      {state.attempt && !state.writing ? (
        <Stack role="alert">
          <strong>Výsledek platební operace není potvrzený</strong>
          <ReservationCopy>
            Původní požadavek mohl být zpracován. Nezakládejte nový záznam
            stejné platby.
          </ReservationCopy>
          <ReservationCopy>
            {paymentTypeLabels[state.attempt.type]} ·{' '}
            {money(state.attempt.amount)}
          </ReservationCopy>
        </Stack>
      ) : null}
      {state.error ? (
        <ReservationError role="alert">{state.error}</ReservationError>
      ) : null}
      <Announcement $success={state.announcement.startsWith('Operace byla zaznamenána.')} $quiet={state.announcement === 'Aktuální platební evidence byla načtena.'} role="status" aria-live="polite">
        {state.announcement}
      </Announcement>
      {open || state.error || state.attempt || state.conflict || state.storageBlocked ? <ReservationActions>
        <Button
          variant="secondary"
          loading={state.loading}
          disabled={state.writing}
          onClick={() => void state.read()}
        >
          Aktualizovat platby
        </Button>
        {state.attempt && !state.writing ? (
          <Button
            variant="secondary"
            disabled={
              externalBusy ||
              state.loading ||
              !state.replayReady ||
              state.error?.includes('odlišné')
            }
            onClick={() => void state.write(state.attempt!, true)}
          >
            Zopakovat původní požadavek
          </Button>
        ) : null}
      </ReservationActions> : null}
      {payments ? (
        <>
          <PaymentConfirmationStatus paymentReport={payments.paymentReport} />
          {payments.paymentReport?.status === 'pending' ? (
            <Stack>
              <ReservationCopy>
                {payments.paymentReport.kind === 'cash'
                  ? 'Hotovost zapište až po skutečném převzetí peněz.'
                  : 'Nejdříve ověřte příjem na bankovním účtu, potom platbu zapište.'}
                {payments.paymentReport.pendingRental > 0 && payments.paymentReport.pendingDeposit > 0
                  ? ' Nájemné a vratnou kauci zapište samostatně.' : ''}
              </ReservationCopy>
              {!open ? <Button disabled={blocked} onClick={() => {
                const report = payments.paymentReport!;
                const rental = Math.min(report.pendingRental,payments.rentalBalance);
                setDraft({...emptyPaymentDraft(),
                  type:rental > 0 ? (report.kind === 'advance' && payments.advanceBalance > 0 ? 'advance_received' : 'rental_received') : 'deposit_received',
                  amount:String(rental > 0 ? rental : Math.max(0,payments.depositRequired-payments.depositHeld)),
                  method:report.kind === 'cash' ? 'cash' : 'bank_transfer',
                });
                setErrors({}); setOpen(true);
                requestAnimationFrame(() => {
                  if (ownsView()) form.current?.querySelector<HTMLElement>('[name="type"]')?.focus();
                });
              }}>{payments.paymentReport.kind === 'cash' ? 'Zapsat přijatou hotovost' : 'Zapsat ověřenou platbu'}</Button> : null}
            </Stack>
          ) : null}
          {payments.lastPayment || payments.fullPaymentInstructions ? <Disclosure>
            <summary>Platby a QR</summary>
            <PaymentConfirmationStatus lastPayment={payments.lastPayment} />
            {payments.fullPaymentInstructions ? <>
              <ReservationCopy>QR pro doplatek {money(payments.fullPaymentInstructions.amount)}. Je dostupný i při domluvené platbě hotově.</ReservationCopy>
              <PaymentQr instructions={payments.fullPaymentInstructions} />
            </> : null}
          </Disclosure> : null}
          {empty && !state.loading && !state.error && !state.attempt && !state.conflict && !state.storageBlocked ? <ReservationCopy>Zatím nebyla zaznamenána žádná platba.</ReservationCopy> : null}
          {!payments.legacyUnreconciled && !empty ? (
            <Summary>
              <section aria-label="Nájemné">
                <h3>Nájemné</h3>
                <dl>
                  <div><dt>Cena pronájmu</dt><dd>{money(payments.rentalTotal + (payments.fittingCredit ?? 0))}</dd></div>
                  {payments.fittingCredit ? <div><dt>Uplatněna sleva za zkoušku</dt><dd>−{money(payments.fittingCredit)}</dd></div> : null}
                  {payments.rentalNet !== 0 ? <div><dt>{payments.fittingCredit ? 'Další uhrazené nájemné po vrácení plateb' : 'Uhrazeno po vrácení plateb'}</dt><dd>{money(payments.rentalNet)}</dd></div> : null}
                  {payments.rentalBalance !== 0 ? <div><dt>Zbývá uhradit</dt><dd>{money(payments.rentalBalance)}</dd></div> : null}
                </dl>
                {payments.advanceBalance > 0 && status === 'pending' ? <ReservationCopy>
                  Z toho rezervační záloha: {money(payments.advanceBalance)}.
                </ReservationCopy> : null}
              </section>
              {payments.depositRequired > 0 || payments.depositHeld > 0 ? <section aria-label="Vratná kauce">
                <h3>Vratná kauce</h3>
                <dl>
                  <div><dt>Požadováno</dt><dd>{money(payments.depositRequired)}</dd></div>
                  <div><dt>Držíme</dt><dd>{money(payments.depositHeld)}</dd></div>
                </dl>
              </section> : null}
            </Summary>
          ) : null}
          {payments.legacyUnreconciled ? (
            <ReservationError role="alert">
              Starší stav platby nemá odpovídající historii. Částky je třeba
              nejprve účetně ověřit; nové zápisy jsou zablokované.
            </ReservationError>
          ) : null}
          {!open ? (
            <EntryContainer>
            {settled ? <summary>Vrácení plateb a další operace</summary> : null}
            <ReservationActions
              ref={node => {
                addButton.current = node?.querySelector('button') ?? null;
              }}
            >
              <Button
                disabled={blocked}
                onClick={() => {
                  setOpen(true);
                  setDraft({
                    ...emptyPaymentDraft(),
                    type: settled ? (types.includes('rental_refunded') ? 'rental_refunded' : types.includes('deposit_refunded') ? 'deposit_refunded' : 'rental_received') : types.includes('advance_received') && payments.advanceBalance > 0 ? 'advance_received' : 'rental_received',
                    amount: String(payments.advanceBalance > 0 && types.includes('advance_received') ? payments.advanceBalance : payments.rentalBalance),
                  });
                  requestAnimationFrame(() => {
                    if (ownsView())
                      form.current
                        ?.querySelector<HTMLElement>('[name="type"]')
                        ?.focus();
                  });
                }}
              >
                {settled ? 'Vybrat operaci' : 'Zapsat platbu'}
              </Button>
            </ReservationActions>
            </EntryContainer>
          ) : (
            <Stack ref={form}>
              <ReservationHeading>Zapsat platbu</ReservationHeading>
              <SelectField
                label="Druh operace"
                name="type"
                value={draft.type}
                disabled={blocked}
                aria-describedby={
                  errors.type ? 'payment-type-error' : undefined
                }
                onChange={e => {
                  setDraft({
                    ...draft,
                    type: e.target.value as typeof draft.type,
                    amount: e.target.value === 'deposit_received' ? String(Math.max(0,payments.depositRequired-payments.depositHeld)) : '',
                  });
                  setErrors({});
                }}
              >
                {!selectedTypeAvailable ? <option value={draft.type} disabled>Vyberte dostupnou operaci</option> : null}
                {types.map(type => (
                  <option
                    key={type}
                    value={type}
                    disabled={isFee(type) && status !== 'cancelled'}
                  >
                    {paymentTypeLabels[type]}
                  </option>
                ))}
              </SelectField>
              {error('type')}
              <Input
                name="amount"
                label="Částka (Kč)"
                inputMode="numeric"
                value={draft.amount}
                readOnly={draft.type === 'deposit_received'}
                disabled={blocked}
                error={Boolean(errors.amount)}
                aria-describedby={
                  errors.amount ? 'payment-amount-error' : undefined
                }
                onChange={e => {
                  setDraft({ ...draft, amount: e.target.value });
                  setErrors({});
                }}
              />
              {error('amount')}
              {!isFee(draft.type) ? (
                <SelectField
                  name="method"
                  label="Způsob platby"
                  value={draft.method}
                  disabled={blocked}
                  onChange={e =>
                    setDraft({
                      ...draft,
                      method: e.target.value as typeof draft.method,
                    })
                  }
                >
                  <option value="bank_transfer">Bankovním převodem</option>
                  <option value="cash">Hotově</option>
                  <option value="card">Kartou</option>
                </SelectField>
              ) : null}
              <Input
                name="reference"
                label="Reference platby"
                value={draft.reference}
                disabled={blocked}
                error={Boolean(errors.reference)}
                aria-describedby={
                  errors.reference ? 'payment-reference-error' : undefined
                }
                onChange={e => {
                  setDraft({ ...draft, reference: e.target.value });
                  setErrors({});
                }}
              />
              {error('reference')}
              <TextareaField
                name="note"
                label="Důvod / poznámka"
                value={draft.note}
                disabled={blocked}
                error={Boolean(errors.note)}
                aria-describedby={
                  errors.note ? 'payment-note-error' : undefined
                }
                onChange={e => {
                  setDraft({ ...draft, note: e.target.value });
                  setErrors({});
                }}
              />
              {error('note')}
              <ReservationActions>
                <Button
                  variant="secondary"
                  disabled={Boolean(state.writing || state.attempt)}
                  onClick={() => {
                    setOpen(false);
                    setDraft(emptyPaymentDraft());
                    requestAnimationFrame(() => {
                      if (ownsView()) addButton.current?.focus();
                    });
                  }}
                >
                  Zrušit
                </Button>
                <Button disabled={blocked} onClick={prepare}>
                  Zkontrolovat zápis
                </Button>
              </ReservationActions>
            </Stack>
          )}
          {payments.entries.length > 0 ? <Disclosure><summary>Historie plateb ({payments.entries.length})</summary>
          {payments.entries.length ? (
            <List>
              {[...payments.entries].reverse().map(entry => (
                <li key={entry.operationId}>
                  <strong>
                    {paymentTypeLabels[entry.type]} · {money(entry.amount)}
                  </strong>
                  <ReservationCopy>
                    {formatPragueLoadedAt(new Date(entry.recordedAt))}
                    {entry.method ? ` · ${methodLabel(entry.method)}` : ''}
                  </ReservationCopy>
                  {entry.reference ? (
                    <ReservationCopy>
                      Reference: {entry.reference}
                    </ReservationCopy>
                  ) : null}
                  {entry.note ? (
                    <ReservationCopy style={{ whiteSpace: 'pre-wrap' }}>
                      Důvod / poznámka: {entry.note}
                    </ReservationCopy>
                  ) : null}
                </li>
              ))}
            </List>
          ) : (
            <ReservationCopy>Žádné platební operace.</ReservationCopy>
          )}
</Disclosure> : null}
          {!payments.legacyUnreconciled && !empty ? <Disclosure>
            <summary>Podrobný rozpis</summary>
            <Facts>
              {([
                ['Rezervační záloha (součást nájemného)', payments.advanceRequired],
                ['Zbývá uhradit ze zálohy', payments.advanceBalance],
                ['Přijaté nájemné včetně zálohy', payments.rentalReceived],
                ['Vrácené nájemné', payments.rentalRefunded],
                ['Vrácená kauce', payments.depositRefunded],
                ['Uplatněný storno poplatek', payments.cancellationFee],
                ['Nájemné dostupné k vrácení', payments.refundableRental],
              ] as const).map(([label, amount]) => <div key={label}><dt>{label}</dt><dd>{money(amount)}</dd></div>)}
            </Facts>
          </Disclosure> : null}
        </>
      ) : null}
      <Dialog
        open={Boolean(confirm)}
        title="Potvrdit platební operaci"
        description="Zkontrolujte částku a druh operace. Zápis zůstane v historii."
        initialFocusRef={safeFocus}
        onEscape={() => {
          if (!state.writing) setConfirm(null);
        }}
        resolveRestoreFocus={previous =>
          ownsView() ? (submitted.current ? panel.current : previous) : null
        }
      >
        <Stack>
          {confirm ? (
            <>
              <strong>{paymentTypeLabels[confirm.type]}</strong>
              <ReservationCopy>
                {money(confirm.amount)}
                {confirm.method ? ` · ${methodLabel(confirm.method)}` : ''}
              </ReservationCopy>
              {confirm.note ? (
                <ReservationCopy>{confirm.note}</ReservationCopy>
              ) : null}
            </>
          ) : null}
          <ReservationActions>
            <div
              ref={node => {
                safeFocus.current = node?.querySelector('button') ?? null;
              }}
            >
              <Button
                variant="secondary"
                disabled={state.writing}
                onClick={() => setConfirm(null)}
              >
                Zpět
              </Button>
            </div>
            <Button
              loading={state.writing}
              disabled={externalBusy}
              onClick={() => void save()}
            >
              Potvrdit zápis
            </Button>
          </ReservationActions>
        </Stack>
      </Dialog>
    </FocusPanel>
  );
}
