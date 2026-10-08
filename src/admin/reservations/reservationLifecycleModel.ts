import type {
  ReservationChange,
  ReservationTransition,
} from '../api/reservationMutations';
import { AdminApiError } from '../api/errors';
const next: Record<string, { action: ReservationTransition; label: string }> = {
  pending: { action: 'confirm', label: 'Potvrdit rezervaci' },
  confirmed: { action: 'prepare', label: 'Připravit rezervaci' },
  prepared: { action: 'rent', label: 'Předat zákazníkovi' },
  rented: { action: 'return', label: 'Přijmout vrácení' },
};
export const nextReservationAction = (status: string) =>
  Object.prototype.hasOwnProperty.call(next, status) ? next[status] : null;
export const canCancelReservation = (status: string) =>
  ['pending', 'confirmed', 'prepared'].includes(status);
export function canChangeReservation(
  status: string,
  change: ReservationChange
) {
  return (
    change.action === 'notes' ||
    (change.action === 'cancel' && canCancelReservation(status)) ||
    nextReservationAction(status)?.action === change.action
  );
}
export function cancellationReasonError(value: string) {
  return !value.trim()
    ? 'Zadejte důvod zrušení.'
    : value.trim().length > 500
      ? 'Důvod může mít maximálně 500 znaků.'
      : null;
}
export function reservationNotesError(value: string) {
  return value.trim().length > 1500
    ? 'Poznámky mohou mít maximálně 1500 znaků.'
    : null;
}
export function reservationConflictMessage(error: unknown) {
  const code = error instanceof AdminApiError ? error.code : '';
  if (code === 'PAYMENT_ADVANCE_REQUIRED')
    return 'Nejprve zaevidujte přijatou rezervační zálohu. Potvrzení rezervace je samostatná akce.';
  if (code === 'PAYMENT_RENTAL_REQUIRED')
    return 'Před předáním je třeba zaevidovat celé nájemné a vratnou kauci.';
  if (code === 'RESERVATION_CONFIRMATION_CONFLICT')
    return 'Rezervaci nelze potvrdit, protože některý fyzický kus je v daném termínu obsazený.';
  if (code === 'RESERVATION_INVENTORY_NOT_ACTIVE')
    return 'Změnu nelze provést, protože některý fyzický kus není aktivní.';
  return 'Stav rezervace se změnil. Načtěte aktuální stav rezervace.';
}
export const unknownReservationOutcome = (error: unknown) =>
  !(error instanceof AdminApiError) ||
  error.status === null ||
  error.status >= 500;
