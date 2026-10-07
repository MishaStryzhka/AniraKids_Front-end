import type { StatusBadgeTone } from '../../design-system/components/StatusBadge';
import type { ReservationCustomer } from '../api/reservations';
const statuses: Record<string, { label: string; tone: StatusBadgeTone }> = {
  pending: { label: 'Čeká na potvrzení', tone: 'warning' },
  confirmed: { label: 'Potvrzená', tone: 'info' },
  prepared: { label: 'Připravená', tone: 'info' },
  rented: { label: 'Vypůjčená', tone: 'success' },
  returned: { label: 'Vrácená', tone: 'neutral' },
  cancelled: { label: 'Zrušená', tone: 'neutral' },
};
const payments: Record<string, { label: string; tone: StatusBadgeTone }> = {
  unpaid: { label: 'Nezaplaceno', tone: 'warning' },
  paid: { label: 'Zaplaceno', tone: 'success' },
  refunded: { label: 'Vrácená platba', tone: 'neutral' },
};
export const reservationStatus = (status: string) =>
  Object.prototype.hasOwnProperty.call(statuses, status)
    ? statuses[status]
    : { label: 'Neznámý stav', tone: 'neutral' as StatusBadgeTone };
export const reservationPayment = (status: string) =>
  Object.prototype.hasOwnProperty.call(payments, status)
    ? payments[status]
    : { label: 'Neznámý stav platby', tone: 'neutral' as StatusBadgeTone };
export const reservationMode = (mode: string) =>
  mode === 'studio'
    ? 'Studio'
    : mode === 'external'
      ? 'Mimo studio'
      : 'Neznámý způsob pronájmu';
export const customerName = (customer: ReservationCustomer) =>
  [customer.firstName.trim(), customer.lastName.trim()]
    .filter(Boolean)
    .join(' ') || 'Jméno neuvedeno';
export const money = (amount: number) =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(amount);
export const inventoryStatus = (value: string) =>
  value === 'active'
    ? 'Aktivní'
    : value === 'maintenance'
      ? 'V údržbě'
      : value === 'retired'
        ? 'Vyřazený'
        : 'Neznámý stav';
export const inventoryCondition = (value: string) =>
  value === 'excellent'
    ? 'Výborný'
    : value === 'good'
      ? 'Dobrý'
      : value === 'fair'
        ? 'Uspokojivý'
        : value === 'damaged'
          ? 'Poškozený'
          : 'Neznámý stav kusu';
