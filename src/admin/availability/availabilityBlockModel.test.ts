import {
  blockReasonLabel,
  serializeBlockDraft,
  validateBlockDraft,
} from './availabilityBlockModel';
import { validBlockDraft as draft } from './blockFixtures';
jest.mock('../api/client', () => ({
  adminApiClient: {},
  buildAdminRequestConfig: jest.fn(),
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
test('inclusive same-day and leap-day are valid; past/malformed/reversed dates are rejected', () => {
  expect(
    validateBlockDraft({ ...draft, endDate: draft.startDate }, '2026-10-07')
  ).toEqual({});
  expect(
    validateBlockDraft(
      { ...draft, startDate: '2028-02-29', endDate: '2028-02-29' },
      '2028-02-29'
    )
  ).toEqual({});
  expect(
    validateBlockDraft({ ...draft, startDate: '2026-10-06' }, '2026-10-07')
  ).toHaveProperty('startDate');
  expect(
    validateBlockDraft({ ...draft, startDate: '2026-02-29' }, '2026-01-01')
  ).toHaveProperty('startDate');
  expect(
    validateBlockDraft({ ...draft, endDate: '2026-10-09' }, '2026-10-07')
  ).toHaveProperty('endDate');
});
test('reason membership and normalized notes limit are strict without creator label invention', () => {
  expect(
    validateBlockDraft({ ...draft, reason: 'future' as any }, '2026-10-07')
  ).toHaveProperty('reason');
  expect(
    validateBlockDraft({ ...draft, notes: 'x'.repeat(1000) }, '2026-10-07')
  ).toEqual({});
  expect(
    validateBlockDraft({ ...draft, notes: 'x'.repeat(1001) }, '2026-10-07')
  ).toHaveProperty('notes');
  expect(serializeBlockDraft({ ...draft, notes: ' ' })).toEqual({
    startDate: draft.startDate,
    endDate: draft.endDate,
    reason: draft.reason,
  });
  expect(blockReasonLabel('__proto__')).toBe('Neznámý důvod');
});
