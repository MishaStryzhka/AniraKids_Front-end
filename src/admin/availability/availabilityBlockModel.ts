import {
  blockReasons,
  type BlockReason,
  type CreateAvailabilityBlock,
} from '../api/availabilityBlocks';
import { isDateOnly, pragueToday } from '../calendar/calendarDates';
export type BlockDraft = {
  startDate: string;
  endDate: string;
  reason: BlockReason;
  notes: string;
};
export type BlockField = keyof BlockDraft;
export type BlockRisk = {
  dirty: boolean;
  pending: boolean;
  unresolved: boolean;
};
export const emptyBlockDraft = (): BlockDraft => ({
  startDate: '',
  endDate: '',
  reason: 'other',
  notes: '',
});
export const blockDraftDirty = (value: BlockDraft) =>
  Boolean(
    value.startDate || value.endDate || value.reason !== 'other' || value.notes
  );
const labels: Record<BlockReason, string> = {
  cleaning: 'Čištění',
  repair: 'Oprava',
  internal_use: 'Interní použití',
  photoshoot: 'Focení',
  other: 'Jiný důvod',
};
export const blockReasonLabel = (value: string) =>
  Object.prototype.hasOwnProperty.call(labels, value)
    ? labels[value as BlockReason]
    : 'Neznámý důvod';
export function validateBlockDraft(
  value: BlockDraft,
  today = pragueToday()
): Partial<Record<BlockField, string>> {
  const errors: Partial<Record<BlockField, string>> = {};
  if (!isDateOnly(value.startDate))
    errors.startDate = 'Zadejte platné datum začátku.';
  else if (value.startDate < today)
    errors.startDate = 'Začátek nesmí být v minulosti.';
  if (!isDateOnly(value.endDate))
    errors.endDate = 'Zadejte platné datum konce.';
  else if (isDateOnly(value.startDate) && value.endDate < value.startDate)
    errors.endDate = 'Konec nesmí být dříve než začátek.';
  if (!blockReasons.includes(value.reason))
    errors.reason = 'Vyberte důvod blokování.';
  if (value.notes.trim().length > 1000)
    errors.notes = 'Poznámka může mít maximálně 1000 znaků.';
  return errors;
}
export const serializeBlockDraft = (
  value: BlockDraft
): CreateAvailabilityBlock => ({
  startDate: value.startDate,
  endDate: value.endDate,
  reason: value.reason,
  ...(value.notes.trim() ? { notes: value.notes.trim() } : {}),
});
