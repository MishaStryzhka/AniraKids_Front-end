import type {
  AdminInventoryCondition,
  AdminInventoryItem,
  AdminInventoryItemStatus,
  AdminProductDetailVariant,
  AdminProductInventorySnapshot,
  CreateAdminInventoryCondition,
  CreateAdminInventoryItemRequest,
  UpdateAdminInventoryItemRequest,
} from '../api/products';
import type {StatusBadgeTone} from '../../design-system/components/StatusBadge';

export interface InventoryVariantSnapshot {
  order: string[];
  byId: Record<string, AdminInventoryItem>;
}

export type ProductInventorySnapshot = Record<string, InventoryVariantSnapshot>;

export type InventoryEditorTarget =
  | {kind: 'add'; variantId: string}
  | {kind: 'edit'; variantId: string; inventoryItemId: string};

export interface InventoryCreateDraft {
  internalCode: string;
  condition: CreateAdminInventoryCondition;
  notes: string;
}

export interface InventoryEditDraft {
  condition: AdminInventoryCondition;
  notes: string;
}

export interface InventoryUnknownCreateAttempt {
  productId: string;
  variantId: string;
  internalCode: string;
  canonicalInternalCode: string;
  condition: CreateAdminInventoryCondition;
  notes: string;
}

export interface InventoryRiskMeta {
  hasRisk: boolean;
  hasDraft: boolean;
  missingTargetDraft: boolean;
  editorPendingOrUnresolved: boolean;
  lifecyclePendingOrUnresolved: boolean;
  pendingOrUnresolved: boolean;
}

export type InventoryCodeError = 'empty' | 'too-short' | 'too-long' | 'invalid-pattern' | null;
export type InventoryNotesError = 'too-long' | null;

export const EMPTY_INVENTORY_CREATE_DRAFT: InventoryCreateDraft = {
  internalCode: '',
  condition: 'good',
  notes: '',
};

export const INVENTORY_CONDITION_LABEL: Record<AdminInventoryCondition, string> = {
  excellent: 'Výborný',
  good: 'Dobrý',
  fair: 'Uspokojivý',
  damaged: 'Poškozený',
};

export const INVENTORY_STATUS_PRESENTATION: Record<AdminInventoryItemStatus, {label: string; tone: StatusBadgeTone}> = {
  active: {label: 'Aktivní', tone: 'success'},
  maintenance: {label: 'V údržbě', tone: 'warning'},
  retired: {label: 'Vyřazený', tone: 'neutral'},
};

export const CREATE_INVENTORY_CONDITIONS: CreateAdminInventoryCondition[] = ['excellent', 'good', 'fair'];

export function editInventoryConditions(status: AdminInventoryItemStatus): AdminInventoryCondition[] {
  return status === 'active' ? ['excellent', 'good', 'fair'] : ['excellent', 'good', 'fair', 'damaged'];
}

export function emptyInventoryVariantSnapshot(): InventoryVariantSnapshot {
  return {order: [], byId: {}};
}

function compareInventoryItems(left: AdminInventoryItem, right: AdminInventoryItem) {
  const created = (left.createdAt ?? '').localeCompare(right.createdAt ?? '');
  if (created) return created;
  return left.id.localeCompare(right.id);
}

export function inventoryBucketFromItems(items: AdminInventoryItem[]): InventoryVariantSnapshot {
  const ordered = [...items].sort(compareInventoryItems);
  return {
    order: ordered.map(item => item.id),
    byId: Object.fromEntries(ordered.map(item => [item.id, item])),
  };
}

export function buildInventorySnapshot(variants: AdminProductDetailVariant[]): ProductInventorySnapshot {
  return Object.fromEntries(variants.map(variant => [variant.id, inventoryBucketFromItems(variant.inventory)]));
}

export function buildInventorySnapshotFromProjection(input: AdminProductInventorySnapshot): ProductInventorySnapshot {
  return Object.fromEntries(input.variantIds.map(variantId => [
    variantId,
    inventoryBucketFromItems(input.inventoryByVariant[variantId] ?? []),
  ]));
}

export function inventoryItemsForVariant(snapshot: ProductInventorySnapshot, variantId: string): AdminInventoryItem[] {
  const bucket = snapshot[variantId] ?? emptyInventoryVariantSnapshot();
  return bucket.order.map(id => bucket.byId[id]).filter(Boolean);
}

export function normalizeInventoryCode(value: string) {
  return value.trim();
}

export function canonicalInventoryCode(value: string) {
  return normalizeInventoryCode(value).toUpperCase();
}

export function validateInventoryCode(value: string): InventoryCodeError {
  const normalized = normalizeInventoryCode(value);
  if (!normalized) return 'empty';
  if (normalized.length < 2) return 'too-short';
  if (normalized.length > 80) return 'too-long';
  if (!/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(normalized)) return 'invalid-pattern';
  return null;
}

export function inventoryCodeErrorCopy(error: InventoryCodeError) {
  if (error === 'empty') return 'Zadejte interní kód.';
  if (error === 'too-short') return 'Interní kód musí mít alespoň 2 znaky.';
  if (error === 'too-long') return 'Interní kód může mít maximálně 80 znaků.';
  if (error === 'invalid-pattern') return 'Použijte pouze písmena, číslice a spojovníky.';
  return null;
}

export function validateInventoryNotes(notes: string): InventoryNotesError {
  return notes.length > 1000 ? 'too-long' : null;
}

export function inventoryNotesErrorCopy(error: InventoryNotesError) {
  return error === 'too-long' ? 'Fyzický kus se nepodařilo uložit. Zkontrolujte zadané údaje.' : null;
}

export function isInventoryCreateDirty(draft: InventoryCreateDraft) {
  return normalizeInventoryCode(draft.internalCode) !== ''
    || draft.condition !== EMPTY_INVENTORY_CREATE_DRAFT.condition
    || draft.notes !== '';
}

export function inventoryEditBaseline(item: AdminInventoryItem): InventoryEditDraft {
  return {condition: item.condition, notes: item.notes ?? ''};
}

export function isInventoryEditDirty(draft: InventoryEditDraft, baseline: InventoryEditDraft) {
  return draft.condition !== baseline.condition || draft.notes !== baseline.notes;
}

export function serializeInventoryCreate(draft: InventoryCreateDraft): CreateAdminInventoryItemRequest {
  return {
    internalCode: normalizeInventoryCode(draft.internalCode),
    condition: draft.condition,
    ...(draft.notes !== '' ? {notes: draft.notes} : {}),
  };
}

export function serializeInventoryPatch(
  draft: InventoryEditDraft,
  baseline: InventoryEditDraft,
): UpdateAdminInventoryItemRequest | null {
  const body: UpdateAdminInventoryItemRequest = {};
  if (draft.condition !== baseline.condition) body.condition = draft.condition;
  if (draft.notes !== baseline.notes) body.notes = draft.notes;
  return Object.keys(body).length ? body : null;
}

export function reconcileCreatedInventoryItem(
  snapshot: ProductInventorySnapshot,
  item: AdminInventoryItem,
): ProductInventorySnapshot {
  const current = snapshot[item.variantId] ?? emptyInventoryVariantSnapshot();
  const items = current.order
    .map(id => current.byId[id])
    .filter(existing => existing && existing.id !== item.id);
  return {
    ...snapshot,
    [item.variantId]: inventoryBucketFromItems([...items, item]),
  };
}

export function reconcileUpdatedInventoryItem(
  snapshot: ProductInventorySnapshot,
  item: AdminInventoryItem,
): ProductInventorySnapshot {
  const current = snapshot[item.variantId];
  if (!current || !current.byId[item.id]) return snapshot;
  return {
    ...snapshot,
    [item.variantId]: inventoryBucketFromItems(
      current.order.map(id => id === item.id ? item : current.byId[id]).filter(Boolean),
    ),
  };
}

export function findInventoryItem(
  snapshot: ProductInventorySnapshot,
  variantId: string,
  inventoryItemId: string,
) {
  return snapshot[variantId]?.byId[inventoryItemId] ?? null;
}

export function reconcileUnknownInventoryCreate(input: {
  snapshot: ProductInventorySnapshot;
  attempt: InventoryUnknownCreateAttempt;
}) {
  const targetItems = inventoryItemsForVariant(input.snapshot, input.attempt.variantId);
  const target = targetItems.find(item =>
    canonicalInventoryCode(item.internalCode) === input.attempt.canonicalInternalCode,
  ) ?? null;
  if (target) return {kind: 'found-target' as const, item: target};

  for (const [variantId, bucket] of Object.entries(input.snapshot)) {
    if (variantId === input.attempt.variantId) continue;
    const item = bucket.order.map(id => bucket.byId[id]).find(candidate =>
      canonicalInventoryCode(candidate.internalCode) === input.attempt.canonicalInternalCode,
    );
    if (item) return {kind: 'found-other-variant' as const, item};
  }
  return {kind: 'absent' as const, item: null};
}


export type InventoryLifecycleAction = 'maintenance' | 'activate' | 'retire';

export interface InventoryLifecycleActionSpec {
  action: InventoryLifecycleAction;
  targetStatus: AdminInventoryItemStatus;
  label: string;
  pendingLabel: string;
  destructive: boolean;
}

export const INVENTORY_LIFECYCLE_ACTIONS: Record<InventoryLifecycleAction, InventoryLifecycleActionSpec> = {
  maintenance: {
    action: 'maintenance',
    targetStatus: 'maintenance',
    label: 'Přesunout do údržby',
    pendingLabel: 'Přesouvání…',
    destructive: false,
  },
  activate: {
    action: 'activate',
    targetStatus: 'active',
    label: 'Aktivovat',
    pendingLabel: 'Aktivování…',
    destructive: false,
  },
  retire: {
    action: 'retire',
    targetStatus: 'retired',
    label: 'Vyřadit',
    pendingLabel: 'Vyřazování…',
    destructive: true,
  },
};

export function inventoryLifecycleActionsForStatus(status: AdminInventoryItemStatus): InventoryLifecycleActionSpec[] {
  if (status === 'active') return [INVENTORY_LIFECYCLE_ACTIONS.maintenance, INVENTORY_LIFECYCLE_ACTIONS.retire];
  if (status === 'maintenance') return [INVENTORY_LIFECYCLE_ACTIONS.activate, INVENTORY_LIFECYCLE_ACTIONS.retire];
  return [];
}

export function inventoryLifecycleTarget(action: InventoryLifecycleAction): AdminInventoryItemStatus {
  return INVENTORY_LIFECYCLE_ACTIONS[action].targetStatus;
}

export function sameItemDirtyCondition(input: {
  editor: InventoryEditorTarget | null;
  editDraft: InventoryEditDraft | null;
  editBaseline: InventoryEditDraft | null;
  variantId: string;
  inventoryItemId: string;
}) {
  return Boolean(
    input.editor?.kind === 'edit'
    && input.editor.variantId === input.variantId
    && input.editor.inventoryItemId === input.inventoryItemId
    && input.editDraft
    && input.editBaseline
    && input.editDraft.condition !== input.editBaseline.condition
  );
}

export function reconcileLifecycleInventoryItem(
  snapshot: ProductInventorySnapshot,
  item: AdminInventoryItem,
): ProductInventorySnapshot {
  return reconcileUpdatedInventoryItem(snapshot, item);
}

export function deriveInventoryRiskMeta(input: {
  editorDirty: boolean;
  missingTargetDraft: boolean;
  editorPendingOrUnresolved: boolean;
  lifecyclePendingOrUnresolved: boolean;
}): InventoryRiskMeta {
  const hasDraft = input.editorDirty || input.missingTargetDraft;
  const pendingOrUnresolved = input.editorPendingOrUnresolved || input.lifecyclePendingOrUnresolved;
  return {
    hasRisk: hasDraft || pendingOrUnresolved,
    hasDraft,
    missingTargetDraft: input.missingTargetDraft,
    editorPendingOrUnresolved: input.editorPendingOrUnresolved,
    lifecyclePendingOrUnresolved: input.lifecyclePendingOrUnresolved,
    pendingOrUnresolved,
  };
}
