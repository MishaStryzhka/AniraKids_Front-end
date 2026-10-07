import { useEffect, useId, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../design-system/components/Button';
import { Dialog } from '../../design-system/components/Dialog';
import { Input } from '../../design-system/components/Input';
import { SelectField } from '../../design-system/components/SelectField';
import { TextareaField } from '../../design-system/components/TextareaField';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import {
  blockReasons,
  type AvailabilityBlock,
} from '../api/availabilityBlocks';
import type { AdminInventoryItem } from '../api/products';
import type { ProductInventoryController } from '../products/useProductInventoryController';
import { formatCalendarDay, pragueToday } from '../calendar/calendarDates';
import {
  blockReasonLabel,
  validateBlockDraft,
  type BlockField,
} from './availabilityBlockModel';
import { useAvailabilityBlocks } from './useAvailabilityBlocks';
const Wrap = styled.div`
  margin-block-start: ${t.space[3]};
  min-inline-size: 0;
  @media (max-width: 767px) {
    > button {
      inline-size: 100%;
    }
  }
`;
const Panel = styled.section`
  margin-block-start: ${t.space[4]};
  padding: ${t.space[4]};
  border: 1px solid ${t.color.border.subtle};
  border-radius: ${t.radius[2]};
  display: grid;
  gap: ${t.space[4]};
  min-inline-size: 0;
  &[hidden] {
    display: none;
  }
`;
const Heading = styled.h4`
  margin: 0;
  font-size: ${t.type.bodyLg.size};
  line-height: ${t.type.bodyLg.lineHeight};
  &:focus {
    outline: 2px solid ${t.color.focus.ring};
    outline-offset: 2px;
  }
`;
const Copy = styled.p`
  margin: 0;
  font-size: ${t.type.bodySm.size};
  line-height: ${t.type.bodySm.lineHeight};
  overflow-wrap: anywhere;
`;
const Error = styled(Copy)`
  color: ${t.color.status.danger.strong};
`;
const Stack = styled.div`
  display: grid;
  gap: ${t.space[3]};
  min-inline-size: 0;
`;
const Dates = styled(Stack)`
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${t.space[2]};
  @media (max-width: 767px) {
    flex-direction: column;
    > button,
    > div,
    > div > button {
      inline-size: 100%;
    }
  }
`;
const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: ${t.space[4]};
  > li {
    min-inline-size: 0;
    display: grid;
    gap: ${t.space[2]};
    padding-block-end: ${t.space[3]};
    border-block-end: 1px solid ${t.color.border.subtle};
  }
`;
const Alert = styled(Stack)`
  padding: ${t.space[3]};
  border: 1px solid ${t.color.border.subtle};
  border-radius: ${t.radius[2]};
  &:focus {
    outline: 2px solid ${t.color.focus.ring};
    outline-offset: 2px;
  }
`;
export function InventoryAvailabilityBlocks({
  item,
  token,
  controller,
  onAccessError,
}: {
  item: AdminInventoryItem;
  token: string;
  controller: ProductInventoryController;
  onAccessError(error: unknown): boolean;
}) {
  const [open, setOpen] = useState(false),
    [deleting, setDeleting] = useState<AvailabilityBlock | null>(null);
  const generated = useId(),
    panelId = `manual-blocks-${generated.replace(/:/g, '')}`;
  const state = useAvailabilityBlocks({
    token,
    inventoryItemId: item.id,
    active: item.status === 'active',
    itemVersion: item,
    onAccessError,
    canWrite: () => controller.canWriteManualBlocks(item.id),
    onRisk: controller.reportManualBlockRisk,
  });
  const title = useRef<HTMLHeadingElement>(null),
    alert = useRef<HTMLDivElement>(null),
    start = useRef<HTMLInputElement>(null),
    end = useRef<HTMLInputElement>(null),
    reason = useRef<HTMLSelectElement>(null),
    notes = useRef<HTMLTextAreaElement>(null),
    safeFocus = useRef<HTMLElement | null>(null),
    deleteAttempted = useRef(false),
    addButton = useRef<HTMLElement | null>(null);
  const { focus, ownsView } = state;
  const blocked =
    Boolean(state.busy || state.recovery || state.missing) ||
    !controller.canWriteManualBlocks(item.id);
  const createAllowed = item.status === 'active' && !state.createDenied;
  useEffect(() => {
    if (!focus || !open || deleting) return;
    const frame = requestAnimationFrame(() => {
      if (ownsView()) (alert.current ?? title.current)?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [focus, open, deleting, ownsView]);
  const submit = async () => {
    const errors = validateBlockDraft(state.draft);
    await state.write('create');
    if (!ownsView()) return;
    const first = (Object.keys(errors) as BlockField[])[0];
    if (first)
      ({ startDate: start, endDate: end, reason, notes })[
        first
      ].current?.focus();
  };
  const remove = async () => {
    if (!deleting) return;
    deleteAttempted.current = true;
    const attempted = await state.write('delete', deleting.id);
    if (ownsView() && attempted) setDeleting(null);
  };
  const toggle = () => {
    setOpen(value => !value);
    if (!open && !state.loaded && !state.busy) void state.read();
  };
  const errorField = (field: BlockField) =>
    state.fieldErrors[field] ? (
      <Error id={`${panelId}-${field}-error`}>{state.fieldErrors[field]}</Error>
    ) : null;
  return (
    <Wrap data-manual-blocks-item={item.id}>
      <Button
        variant="secondary"
        size="compact"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        Ruční blokování
      </Button>
      <Panel id={panelId} hidden={!open} aria-labelledby={`${panelId}-title`}>
        {open ? (
          <>
            <Heading id={`${panelId}-title`} ref={title} tabIndex={-1}>
              Ruční blokování
            </Heading>
            <Copy>
              Fyzický kus: <strong>{item.internalCode}</strong>
            </Copy>
            {state.busy ? (
              <Copy role="status">
                {state.busy === 'read'
                  ? 'Načítání blokování…'
                  : 'Ukládání změny blokování…'}
              </Copy>
            ) : null}
            {state.error || state.recovery ? (
              <Alert ref={alert} tabIndex={-1} role="alert">
                {state.recovery === 'create' || state.recovery === 'delete' ? (
                  <>
                    <strong>
                      {state.recovery === 'create'
                        ? 'Výsledek vytvoření blokování není potvrzený'
                        : 'Výsledek odstranění blokování není potvrzený'}
                    </strong>
                    <Copy>
                      Požadavek mohl být zpracován. Načtěte aktuální blokování
                      před dalším pokusem.
                    </Copy>
                  </>
                ) : null}
                {state.error ? <Copy>{state.error}</Copy> : null}
                {state.createDenied && controller.manualRefreshBlocked ? (
                  <Copy>
                    Nejprve zrušte rozpracované blokování a potom načtěte
                    aktuální fyzické kusy.
                  </Copy>
                ) : null}
                {!state.missing ? (
                  <Actions>
                    <Button
                      variant="secondary"
                      disabled={Boolean(state.busy)}
                      onClick={() => void state.read()}
                    >
                      Načíst blokování
                    </Button>
                    {state.createDenied ? (
                      <Button
                        variant="secondary"
                        disabled={
                          controller.manualRefreshBlocked ||
                          controller.refreshing ||
                          Boolean(state.busy)
                        }
                        onClick={() =>
                          void controller.refresh(() => title.current)
                        }
                      >
                        Načíst aktuální fyzické kusy
                      </Button>
                    ) : null}
                  </Actions>
                ) : null}
              </Alert>
            ) : null}
            <Copy role="status" aria-live="polite">
              {state.announcement}
            </Copy>
            {state.loaded ? (
              <>
                <Heading>Naplánovaná blokování</Heading>
                {state.items.length ? (
                  <List>
                    {state.items.map(block => (
                      <li key={block.id} data-availability-block={block.id}>
                        <strong>{blockReasonLabel(block.reason)}</strong>
                        <Copy>
                          {formatCalendarDay(block.startDate)} –{' '}
                          {formatCalendarDay(block.endDate)}
                        </Copy>
                        {block.notes ? (
                          <Copy style={{ whiteSpace: 'pre-wrap' }}>
                            {block.notes}
                          </Copy>
                        ) : null}
                        <Actions>
                          <Button
                            variant="secondary"
                            disabled={blocked}
                            onClick={() => {
                              deleteAttempted.current = false;
                              setDeleting(block);
                            }}
                          >
                            Odstranit
                          </Button>
                        </Actions>
                      </li>
                    ))}
                  </List>
                ) : (
                  <Stack>
                    <strong>Žádná ruční blokování</strong>
                    <Copy>
                      Pro tento fyzický kus nejsou naplánována žádná blokování.
                    </Copy>
                  </Stack>
                )}
                {!createAllowed ? (
                  <Copy>
                    Nové blokování lze vytvořit pouze pro aktivní fyzický kus.
                  </Copy>
                ) : null}
                {!state.formOpen ? (
                  <Actions
                    ref={element => {
                      addButton.current =
                        element?.querySelector('button') ?? null;
                    }}
                  >
                    <Button
                      variant="secondary"
                      disabled={blocked || !createAllowed}
                      onClick={() => {
                        state.openForm();
                        requestAnimationFrame(() => {
                          if (ownsView()) start.current?.focus();
                        });
                      }}
                    >
                      Přidat blokování
                    </Button>
                  </Actions>
                ) : null}
              </>
            ) : null}
            {state.formOpen ? (
              <Stack data-block-create-form>
                <Heading>Nové blokování</Heading>
                <Dates>
                  <Stack>
                    <Input
                      ref={start}
                      label="Začátek"
                      type="date"
                      min={pragueToday()}
                      value={state.draft.startDate}
                      error={Boolean(state.fieldErrors.startDate)}
                      aria-describedby={
                        state.fieldErrors.startDate
                          ? `${panelId}-startDate-error`
                          : undefined
                      }
                      onChange={event =>
                        state.setDraft({
                          ...state.draft,
                          startDate: event.target.value,
                        })
                      }
                    />
                    {errorField('startDate')}
                  </Stack>
                  <Stack>
                    <Input
                      ref={end}
                      label="Konec"
                      type="date"
                      min={state.draft.startDate || pragueToday()}
                      value={state.draft.endDate}
                      error={Boolean(state.fieldErrors.endDate)}
                      aria-describedby={
                        state.fieldErrors.endDate
                          ? `${panelId}-endDate-error`
                          : undefined
                      }
                      onChange={event =>
                        state.setDraft({
                          ...state.draft,
                          endDate: event.target.value,
                        })
                      }
                    />
                    {errorField('endDate')}
                  </Stack>
                </Dates>
                <SelectField
                  ref={reason}
                  label="Důvod"
                  value={state.draft.reason}
                  aria-invalid={Boolean(state.fieldErrors.reason) || undefined}
                  aria-describedby={
                    state.fieldErrors.reason
                      ? `${panelId}-reason-error`
                      : undefined
                  }
                  onChange={event =>
                    state.setDraft({
                      ...state.draft,
                      reason: event.target.value as typeof state.draft.reason,
                    })
                  }
                >
                  {blockReasons.map(value => (
                    <option key={value} value={value}>
                      {blockReasonLabel(value)}
                    </option>
                  ))}
                </SelectField>
                {errorField('reason')}
                <TextareaField
                  ref={notes}
                  label="Poznámka"
                  value={state.draft.notes}
                  error={Boolean(state.fieldErrors.notes)}
                  aria-describedby={
                    state.fieldErrors.notes
                      ? `${panelId}-notes-error`
                      : `${panelId}-notes-help`
                  }
                  onChange={event =>
                    state.setDraft({
                      ...state.draft,
                      notes: event.target.value,
                    })
                  }
                />
                <Copy id={`${panelId}-notes-help`}>
                  Volitelné. Maximálně 1000 znaků.
                </Copy>
                {errorField('notes')}
                <Actions>
                  <Button
                    variant="secondary"
                    disabled={Boolean(state.busy || state.recovery)}
                    onClick={() => {
                      state.cancelForm();
                      requestAnimationFrame(() => {
                        if (ownsView()) addButton.current?.focus();
                      });
                    }}
                  >
                    Zrušit
                  </Button>
                  <Button
                    disabled={blocked || !createAllowed}
                    loading={state.busy === 'create'}
                    onClick={() => void submit()}
                  >
                    Uložit blokování
                  </Button>
                </Actions>
              </Stack>
            ) : null}
          </>
        ) : null}
      </Panel>
      <Dialog
        open={Boolean(deleting)}
        title="Odstranit blokování"
        description="Opravdu chcete toto blokování odstranit?"
        initialFocusRef={safeFocus}
        onEscape={() => {
          if (!state.busy) setDeleting(null);
        }}
        resolveRestoreFocus={previous =>
          ownsView()
            ? deleteAttempted.current
              ? (alert.current ?? title.current)
              : previous
            : null
        }
      >
        <Stack>
          <Copy>
            Fyzický kus: <strong>{item.internalCode}</strong>
          </Copy>
          {deleting ? (
            <Copy>
              {formatCalendarDay(deleting.startDate)} –{' '}
              {formatCalendarDay(deleting.endDate)} ·{' '}
              {blockReasonLabel(deleting.reason)}
            </Copy>
          ) : null}
          <Actions>
            <div
              ref={element => {
                safeFocus.current = element?.querySelector('button') ?? null;
              }}
            >
              <Button
                variant="secondary"
                disabled={Boolean(state.busy)}
                onClick={() => setDeleting(null)}
              >
                Zpět
              </Button>
            </div>
            <Button
              variant="destructive"
              disabled={blocked}
              loading={state.busy === 'delete'}
              onClick={() => void remove()}
            >
              Odstranit blokování
            </Button>
          </Actions>
        </Stack>
      </Dialog>
    </Wrap>
  );
}
