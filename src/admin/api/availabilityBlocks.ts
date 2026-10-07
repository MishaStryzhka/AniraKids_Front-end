import { adminApiClient, buildAdminRequestConfig } from './client';
import { AdminApiError, normalizeAdminApiError } from './errors';
import { isDateOnly } from '../calendar/calendarDates';
export const blockReasons = [
  'cleaning',
  'repair',
  'internal_use',
  'photoshoot',
  'other',
] as const;
export type BlockReason = (typeof blockReasons)[number];
export interface AvailabilityBlock {
  id: string;
  inventoryItemId: string;
  startDate: string;
  endDate: string;
  reason: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}
export interface CreateAvailabilityBlock {
  startDate: string;
  endDate: string;
  reason: BlockReason;
  notes?: string;
}
const object = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const invalid = (): never => {
  throw new AdminApiError({
    code: 'ADMIN_BLOCK_INVALID_RESPONSE',
    kind: 'unexpected',
    message: 'Unusable availability block response.',
  });
};
export function parseAvailabilityBlock(
  value: unknown,
  itemId: string
): AvailabilityBlock {
  if (
    !object(value) ||
    !text(value.id) ||
    value.inventoryItemId !== itemId ||
    !isDateOnly(value.startDate) ||
    !isDateOnly(value.endDate) ||
    value.startDate > value.endDate ||
    !text(value.reason) ||
    !text(value.createdBy) ||
    !text(value.createdAt) ||
    !Number.isFinite(Date.parse(value.createdAt)) ||
    (value.notes !== undefined && typeof value.notes !== 'string')
  )
    return invalid();
  return {
    id: value.id,
    inventoryItemId: itemId,
    startDate: value.startDate,
    endDate: value.endDate,
    reason: value.reason,
    createdBy: value.createdBy,
    createdAt: value.createdAt,
    ...(value.notes === undefined ? {} : { notes: value.notes as string }),
  };
}
export function parseAvailabilityBlocks(value: unknown, itemId: string) {
  if (!object(value) || !Array.isArray(value.items)) return invalid();
  const ids = new Set<string>();
  return value.items.map(item => {
    const block = parseAvailabilityBlock(item, itemId);
    if (ids.has(block.id)) return invalid();
    ids.add(block.id);
    return block;
  });
}
export async function getAvailabilityBlocks(input: {
  token: string;
  inventoryItemId: string;
  signal?: AbortSignal;
}) {
  try {
    const response = await adminApiClient.get(
      `/admin/inventory-items/${encodeURIComponent(input.inventoryItemId)}/availability-blocks`,
      buildAdminRequestConfig(input.token, input.signal)
    );
    return parseAvailabilityBlocks(response.data, input.inventoryItemId);
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}
export async function createAvailabilityBlock(input: {
  token: string;
  inventoryItemId: string;
  body: CreateAvailabilityBlock;
  signal?: AbortSignal;
}) {
  const body = {
    ...input.body,
    ...(input.body.notes?.trim()
      ? { notes: input.body.notes.trim() }
      : { notes: undefined }),
  };
  try {
    const response = await adminApiClient.post(
      `/admin/inventory-items/${encodeURIComponent(input.inventoryItemId)}/availability-blocks`,
      body,
      buildAdminRequestConfig(input.token, input.signal)
    );
    if (response.status !== 201 || !object(response.data)) return invalid();
    const result = parseAvailabilityBlock(
      response.data.availabilityBlock,
      input.inventoryItemId
    );
    if (
      result.startDate !== body.startDate ||
      result.endDate !== body.endDate ||
      result.reason !== body.reason ||
      (result.notes ?? '') !== (body.notes ?? '')
    )
      return invalid();
    return result;
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}
export async function deleteAvailabilityBlock(input: {
  token: string;
  blockId: string;
  signal?: AbortSignal;
}) {
  try {
    const response = await adminApiClient.delete(
      `/admin/availability-blocks/${encodeURIComponent(input.blockId)}`,
      buildAdminRequestConfig(input.token, input.signal)
    );
    if (response.status !== 204) return invalid();
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}
