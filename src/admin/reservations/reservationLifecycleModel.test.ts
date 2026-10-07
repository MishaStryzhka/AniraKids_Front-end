import {
  canCancelReservation,
  canChangeReservation,
  cancellationReasonError,
  nextReservationAction,
  reservationNotesError,
} from './reservationLifecycleModel';
jest.mock('axios', () => ({
  __esModule: true,
  default: { isCancel: () => false },
  AxiosError: class extends Error {},
}));
test.each([
  ['pending', 'confirm', true],
  ['confirmed', 'prepare', true],
  ['prepared', 'rent', true],
  ['rented', 'return', false],
  ['returned', undefined, false],
  ['cancelled', undefined, false],
  ['future', undefined, false],
  ['__proto__', undefined, false],
])('action matrix for %s', (status, action, cancel) => {
  expect(nextReservationAction(status as string)?.action).toBe(action);
  expect(canCancelReservation(status as string)).toBe(cancel);
  expect(
    canChangeReservation(status as string, { action: 'notes', notes: '' })
  ).toBe(true);
});
test('reason and notes use trimmed limits and empty notes may clear', () => {
  expect(cancellationReasonError(' ')).toBe('Zadejte důvod zrušení.');
  expect(cancellationReasonError('x'.repeat(500))).toBeNull();
  expect(cancellationReasonError('x'.repeat(501))).toBe(
    'Důvod může mít maximálně 500 znaků.'
  );
  expect(reservationNotesError(' ')).toBeNull();
  expect(reservationNotesError('x'.repeat(1500))).toBeNull();
  expect(reservationNotesError('x'.repeat(1501))).not.toBeNull();
  expect(canChangeReservation('pending', { action: 'rent' })).toBe(false);
});
