import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createAvailabilityBlock,
  deleteAvailabilityBlock,
  getAvailabilityBlocks,
  type AvailabilityBlock,
} from '../api/availabilityBlocks';
import { AdminApiError } from '../api/errors';
import {
  blockDraftDirty,
  emptyBlockDraft,
  serializeBlockDraft,
  validateBlockDraft,
  type BlockDraft,
  type BlockField,
  type BlockRisk,
} from './availabilityBlockModel';
type Scope = { token: string; inventoryItemId: string };
type State = {
  owner: Scope;
  loaded: boolean;
  items: AvailabilityBlock[];
  busy: 'read' | 'create' | 'delete' | null;
  recovery: null | 'create' | 'delete' | 'refresh' | 'conflict';
  error: string | null;
  missing: boolean;
  createDenied: boolean;
  formOpen: boolean;
  draft: BlockDraft;
  draftRevision: number;
  fieldErrors: Partial<Record<BlockField, string>>;
  announcement: string;
  focus: number;
};
const initial = (owner: Scope): State => ({
  owner,
  loaded: false,
  items: [],
  busy: null,
  recovery: null,
  error: null,
  missing: false,
  createDenied: false,
  formOpen: false,
  draft: emptyBlockDraft(),
  draftRevision: 0,
  fieldErrors: {},
  announcement: '',
  focus: 0,
});
const risk = (value: State): BlockRisk => ({
  dirty: value.formOpen && blockDraftDirty(value.draft),
  pending: value.busy === 'create' || value.busy === 'delete',
  unresolved: Boolean(value.recovery),
});
export function useAvailabilityBlocks(input: {
  token: string;
  inventoryItemId: string;
  active: boolean;
  itemVersion: unknown;
  onAccessError(error: unknown): boolean;
  canWrite(): boolean;
  onRisk(itemId: string, value: BlockRisk | null): void;
}) {
  const scope = useMemo(
    () => ({ token: input.token, inventoryItemId: input.inventoryItemId }),
    [input.token, input.inventoryItemId]
  );
  const latest = useRef(input);
  latest.current = input;
  const owner = useRef(scope);
  owner.current = scope;
  const mounted = useRef(false),
    sequence = useRef(0),
    request = useRef<{
      scope: Scope;
      generation: number;
      controller: AbortController;
    } | null>(null);
  const [state, setState] = useState(() => initial(scope));
  const current = useRef(state);
  const commit = useCallback(
    (update: (before: State) => State) => {
      if (!mounted.current || owner.current !== scope) return;
      const value = update(current.current);
      current.current = value;
      latest.current.onRisk(scope.inventoryItemId, risk(value));
      setState(value);
    },
    [scope]
  );
  const ownsView = useCallback(
    () => mounted.current && owner.current === scope,
    [scope]
  );
  useEffect(() => {
    mounted.current = true;
    const value = initial(scope);
    current.current = value;
    setState(value);
    const report = latest.current.onRisk;
    report(scope.inventoryItemId, null);
    return () => {
      mounted.current = false;
      // This counter owns requests, not a DOM node; invalidate all callbacks on unmount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      sequence.current++;
      if (request.current?.scope === scope) {
        request.current.controller.abort();
        request.current = null;
      }
      report(scope.inventoryItemId, null);
    };
  }, [scope]);
  useEffect(() => {
    commit(previous => ({ ...previous, createDenied: false }));
  }, [input.itemVersion, commit]);
  const begin = () => {
    if (!ownsView() || !scope.token || request.current) return null;
    const active = {
      scope,
      generation: ++sequence.current,
      controller: new AbortController(),
    };
    request.current = active;
    return active;
  };
  const owns = (active: NonNullable<typeof request.current>) =>
    ownsView() &&
    request.current === active &&
    sequence.current === active.generation &&
    !active.controller.signal.aborted;
  const finish = (active: NonNullable<typeof request.current>) => {
    if (request.current === active) request.current = null;
  };
  const read = async () => {
    const active = begin();
    if (!active) return;
    commit(previous => ({
      ...previous,
      busy: 'read',
      error: null,
      announcement: '',
    }));
    try {
      const items = await getAvailabilityBlocks({
        ...scope,
        signal: active.controller.signal,
      });
      if (!owns(active)) return;
      commit(previous => ({
        ...previous,
        loaded: true,
        items,
        busy: null,
        recovery: null,
        error: null,
        announcement: 'Aktuální blokování byla načtena.',
        focus:
          previous.loaded || previous.recovery
            ? previous.focus + 1
            : previous.focus,
      }));
    } catch (error) {
      if (!owns(active) || latest.current.onAccessError(error)) return;
      commit(previous => ({
        ...previous,
        busy: null,
        error: 'Blokování se nepodařilo načíst. Zkuste to prosím znovu.',
        missing:
          error instanceof AdminApiError &&
          error.code === 'INVENTORY_ITEM_NOT_FOUND',
        focus: previous.focus + 1,
      }));
    } finally {
      finish(active);
    }
  };
  const write = async (
    kind: 'create' | 'delete',
    blockId?: string
  ): Promise<boolean> => {
    const before = current.current;
    if (
      before.owner !== scope ||
      before.busy ||
      before.recovery ||
      before.missing ||
      !before.loaded ||
      !latest.current.canWrite() ||
      (kind === 'create' && (!latest.current.active || before.createDenied))
    )
      return false;
    if (kind === 'create') {
      const errors = validateBlockDraft(before.draft);
      if (Object.keys(errors).length) {
        commit(previous => ({ ...previous, fieldErrors: errors }));
        return false;
      }
    }
    if (kind === 'delete' && !before.items.some(item => item.id === blockId))
      return false;
    const active = begin();
    if (!active) return false;
    commit(previous => ({
      ...previous,
      busy: kind,
      error: null,
      announcement: '',
      fieldErrors: {},
    }));
    let received = false;
    try {
      if (kind === 'create')
        await createAvailabilityBlock({
          ...scope,
          body: serializeBlockDraft(before.draft),
          signal: active.controller.signal,
        });
      else
        await deleteAvailabilityBlock({
          token: scope.token,
          blockId: blockId!,
          signal: active.controller.signal,
        });
      if (!owns(active)) return false;
      received = true;
      const items = await getAvailabilityBlocks({
        ...scope,
        signal: active.controller.signal,
      });
      if (!owns(active)) return false;
      commit(previous => ({
        ...previous,
        items,
        busy: null,
        recovery: null,
        error: null,
        loaded: true,
        announcement:
          kind === 'create'
            ? 'Blokování bylo vytvořeno.'
            : 'Blokování bylo odstraněno.',
        draft:
          kind === 'create' && previous.draftRevision === before.draftRevision
            ? emptyBlockDraft()
            : previous.draft,
        formOpen:
          kind === 'create' && previous.draftRevision === before.draftRevision
            ? false
            : previous.formOpen,
        focus:
          kind === 'create' && previous.draftRevision !== before.draftRevision
            ? previous.focus
            : previous.focus + 1,
      }));
      return true;
    } catch (error) {
      if (!owns(active) || latest.current.onAccessError(error)) return false;
      if (received)
        commit(previous => ({
          ...previous,
          busy: null,
          recovery: 'refresh',
          error:
            'Změna byla přijata, ale aktuální blokování se nepodařilo načíst.',
          focus: previous.focus + 1,
        }));
      else if (
        !(error instanceof AdminApiError) ||
        error.status === null ||
        error.status >= 500
      )
        commit(previous => ({
          ...previous,
          busy: null,
          recovery: kind,
          error: null,
          focus: previous.focus + 1,
        }));
      else {
        const code = error.code;
        const message =
          code === 'AVAILABILITY_BLOCK_CONFLICT'
            ? 'Blokování nelze vytvořit, protože se termín překrývá s existujícím obsazením.'
            : code === 'INVENTORY_ITEM_NOT_ACTIVE'
              ? 'Nové blokování lze vytvořit pouze pro aktivní fyzický kus.'
              : code === 'INVENTORY_ITEM_NOT_FOUND'
                ? 'Fyzický kus už není dostupný.'
                : code === 'AVAILABILITY_BLOCK_NOT_FOUND'
                  ? 'Blokování už nebylo nalezeno. Načtěte aktuální blokování.'
                  : code === 'PAST_BLOCK_DATE'
                    ? 'Začátek nesmí být v minulosti.'
                    : code === 'INVALID_DATE'
                      ? 'Zkontrolujte datum začátku a konce.'
                      : 'Změnu blokování se nepodařilo provést.';
        commit(previous => ({
          ...previous,
          busy: null,
          error: message,
          recovery:
            code === 'AVAILABILITY_BLOCK_CONFLICT' ||
            code === 'AVAILABILITY_BLOCK_NOT_FOUND'
              ? 'conflict'
              : null,
          missing: code === 'INVENTORY_ITEM_NOT_FOUND',
          createDenied:
            code === 'INVENTORY_ITEM_NOT_ACTIVE' || previous.createDenied,
          focus: previous.focus + 1,
        }));
      }
      return true;
    } finally {
      finish(active);
    }
  };
  const setDraft = (draft: BlockDraft) =>
    commit(previous => ({
      ...previous,
      draft,
      draftRevision: previous.draftRevision + 1,
      fieldErrors: {},
      announcement: '',
    }));
  const openForm = () =>
    commit(previous => ({ ...previous, formOpen: true, announcement: '' }));
  const cancelForm = () => {
    if (current.current.busy || current.current.recovery) return;
    commit(previous => ({
      ...previous,
      formOpen: false,
      draft: emptyBlockDraft(),
      fieldErrors: {},
      draftRevision: previous.draftRevision + 1,
    }));
  };
  return {
    ...(state.owner === scope ? state : initial(scope)),
    read,
    write,
    setDraft,
    openForm,
    cancelForm,
    ownsView,
  };
}
