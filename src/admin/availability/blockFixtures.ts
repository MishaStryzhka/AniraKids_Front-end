import type { AvailabilityBlock } from '../api/availabilityBlocks';
export const blockFixture: AvailabilityBlock = {
  id: 'b1',
  inventoryItemId: 'i1',
  startDate: '2026-10-10',
  endDate: '2026-10-11',
  reason: 'repair',
  notes: 'Kontrola zipu',
  createdBy: 'internal-admin-id',
  createdAt: '2026-10-07T12:00:00Z',
};
export const validBlockDraft = {
  startDate: '2026-10-10',
  endDate: '2026-10-11',
  reason: 'repair' as const,
  notes: 'Kontrola zipu',
};
