import { useEffect, useRef, useState, type RefObject } from 'react';
import styled from 'styled-components';
import { Button } from '../../design-system/components/Button';
import { Dialog } from '../../design-system/components/Dialog';
import { TextareaField } from '../../design-system/components/TextareaField';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import {
  canCancelReservation,
  cancellationReasonError,
  nextReservationAction,
  reservationNotesError,
} from './reservationLifecycleModel';
import type { useReservationDetail } from './useReservationDetail';
import {
  ReservationActions,
  ReservationCopy,
  ReservationError,
  ReservationHeading,
  ReservationPanel,
} from './reservationStyles';
type Controller = ReturnType<typeof useReservationDetail>;
const DialogBody = styled.div`
  display: grid;
  gap: ${t.space[4]};
`;
const SafeButtonWrap = styled.div`
  @media (max-width: 767px) {
    inline-size: 100%;
    > button {
      inline-size: 100%;
    }
  }
`;
const FocusPanel = styled(ReservationPanel)`
  &:focus {
    outline: ${t.focus.ring.width} solid ${t.color.focus.ring};
    outline-offset: ${t.focus.ring.offset};
  }
`;
export function ReservationLifecycleControls({
  controller,
  statusRef,
  externalBlocked = false,
  advanceMissing = false,
}: {
  controller: Controller;
  statusRef: RefObject<HTMLDivElement>;
  externalBlocked?: boolean;
  advanceMissing?: boolean;
}) {
  const [cancelOpen, setCancelOpen] = useState(false),
    [reason, setReason] = useState(''),
    [reasonError, setReasonError] = useState<string | null>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null),
    errorRef = useRef<HTMLElement>(null);
  // Button intentionally has no forwarded ref; focus the existing safe native button through its wrapper.
  const safeFocus = useRef<HTMLElement | null>(null);
  const blocked = Boolean(
      controller.busy || controller.recovery || externalBlocked
    ),
    next = controller.reservation
      ? nextReservationAction(controller.reservation.status)
      : null;
  const close = () => {
    if (!controller.busy) setCancelOpen(false);
  };
  const { focus, ownsView } = controller;
  useEffect(() => {
    if (!focus || cancelOpen) return;
    const frame = requestAnimationFrame(() => {
      if (!ownsView()) return;
      const target =
        focus.target === 'error' ? errorRef.current : statusRef.current;
      (target ?? statusRef.current)?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [focus, cancelOpen, ownsView, statusRef]);
  const cancel = async () => {
    const error = cancellationReasonError(reason);
    setReasonError(error);
    if (error) {
      reasonRef.current?.focus();
      return;
    }
    const attempted = await controller.change({ action: 'cancel', reason });
    if (controller.ownsView() && attempted) setCancelOpen(false);
  };
  return (
    <>
      {next?.action === 'confirm' && advanceMissing ? (
        <ReservationCopy>
          Nejprve zaevidujte přijatou rezervační zálohu. Potvrzení rezervace
          probíhá samostatně.
        </ReservationCopy>
      ) : null}
      <ReservationActions aria-label="Akce rezervace">
        {next ? (
          <Button
            disabled={blocked || (next.action === 'confirm' && advanceMissing)}
            loading={controller.busy === next.action}
            onClick={() => void controller.change({ action: next.action })}
          >
            {next.label}
          </Button>
        ) : null}
        {controller.reservation &&
        canCancelReservation(controller.reservation.status) ? (
          <Button
            variant="secondary"
            disabled={blocked}
            onClick={() => {
              setReasonError(null);
              setCancelOpen(true);
            }}
          >
            Zrušit rezervaci
          </Button>
        ) : null}
      </ReservationActions>
      {controller.busy ? (
        <ReservationCopy role="status">
          {controller.busy === 'read'
            ? 'Načítání aktuálního stavu…'
            : 'Zpracování změny rezervace…'}
        </ReservationCopy>
      ) : null}
      {controller.recovery || controller.error ? (
        <FocusPanel role="alert" tabIndex={-1} ref={errorRef}>
          <ReservationHeading>
            {controller.recovery?.kind === 'unknown'
              ? 'Výsledek změny rezervace není potvrzený'
              : controller.recovery?.kind === 'conflict'
                ? 'Změnu rezervace nelze provést'
                : controller.recovery
                  ? 'Načtěte aktuální stav rezervace'
                  : 'Změnu rezervace se nepodařilo provést'}
          </ReservationHeading>
          {controller.recovery ? (
            <ReservationCopy>{controller.recovery.message}</ReservationCopy>
          ) : null}
          {controller.error ? (
            <ReservationCopy>{controller.error}</ReservationCopy>
          ) : null}
          {controller.recovery ? (
            <Button
              variant="secondary"
              disabled={Boolean(controller.busy)}
              onClick={() => void controller.read()}
            >
              Načíst aktuální stav
            </Button>
          ) : null}
        </FocusPanel>
      ) : null}
      <Dialog
        open={cancelOpen}
        title="Zrušit rezervaci"
        description="Opravdu chcete tuto rezervaci zrušit?"
        onEscape={close}
        initialFocusRef={safeFocus}
        resolveRestoreFocus={previous =>
          controller.ownsView()
            ? controller.focus?.target === 'error'
              ? errorRef.current
              : controller.focus?.target === 'status'
                ? statusRef.current
                : previous
            : null
        }
      >
        <DialogBody>
          <TextareaField
            ref={reasonRef}
            label="Důvod zrušení"
            value={reason}
            disabled={Boolean(controller.busy)}
            error={Boolean(reasonError)}
            aria-describedby={
              reasonError
                ? 'reservation-cancel-error'
                : 'reservation-cancel-help'
            }
            onChange={event => {
              setReason(event.target.value);
              setReasonError(null);
            }}
          />
          <ReservationCopy id="reservation-cancel-help">
            Maximálně 500 znaků.
          </ReservationCopy>
          {reasonError ? (
            <ReservationError id="reservation-cancel-error" role="alert">
              {reasonError}
            </ReservationError>
          ) : null}
          <ReservationActions>
            <SafeButtonWrap
              ref={element => {
                safeFocus.current = element?.querySelector('button') ?? null;
              }}
            >
              <Button
                variant="secondary"
                disabled={Boolean(controller.busy)}
                onClick={close}
              >
                Zpět
              </Button>
            </SafeButtonWrap>
            <Button
              variant="destructive"
              disabled={Boolean(controller.busy)}
              loading={controller.busy === 'cancel'}
              onClick={() => void cancel()}
            >
              Zrušit rezervaci
            </Button>
          </ReservationActions>
        </DialogBody>
      </Dialog>
    </>
  );
}
export function ReservationNotesEditor({
  controller,
  externalBlocked = false,
}: {
  controller: Controller;
  externalBlocked?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const save = () => {
    const nextError = reservationNotesError(controller.notesDraft);
    setError(nextError);
    if (nextError) {
      input.current?.focus();
      return;
    }
    void controller.change({ action: 'notes', notes: controller.notesDraft });
  };
  return (
    <ReservationPanel>
      <TextareaField
        ref={input}
        label="Poznámky"
        value={controller.notesDraft}
        error={Boolean(error)}
        aria-describedby={
          error ? 'reservation-notes-error' : 'reservation-notes-help'
        }
        onChange={event => {
          controller.setNotesDraft(event.target.value);
          setError(null);
        }}
      />
      <ReservationCopy id="reservation-notes-help">
        Maximálně 1500 znaků. Prázdné pole poznámky odstraní.
      </ReservationCopy>
      {error ? (
        <ReservationError id="reservation-notes-error" role="alert">
          {error}
        </ReservationError>
      ) : null}
      <ReservationActions>
        <Button
          variant="secondary"
          disabled={
            Boolean(
              controller.busy || controller.recovery || externalBlocked
            ) ||
            controller.notesDraft.trim() ===
              (controller.reservation?.notes ?? '')
          }
          loading={controller.busy === 'notes'}
          onClick={save}
        >
          Uložit poznámky
        </Button>
      </ReservationActions>
    </ReservationPanel>
  );
}
