import { isGuestAccessToken, object, type Receipt } from '../api/publicApi';

const KEY = 'anirakids.guest-reservation-links.v1';
type GuestReservationLink = { reservationNumber: string; guestAccessToken: string };

export function loadGuestReservationLinks(): GuestReservationLink[] {
  const raw = sessionStorage.getItem(KEY);
  if (raw === null) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value) || !value.every(item => object(item) &&
      typeof item.reservationNumber === 'string' && item.reservationNumber.length <= 100 &&
      isGuestAccessToken(item.guestAccessToken))) throw new Error('Invalid reservation links');
  return value.map(item => ({ reservationNumber: item.reservationNumber, guestAccessToken: item.guestAccessToken }));
}

// Keep guest access in the same tab before replacing its completed receipt.
// Store only the private status link, never contact or payment information.
export function preserveGuestReservationLink(receipt: Receipt) {
  if (!receipt.guestAccessToken) return;
  const links = loadGuestReservationLinks();
  const next = [{ reservationNumber: receipt.reservationNumber, guestAccessToken: receipt.guestAccessToken },
    ...links.filter(link => link.reservationNumber !== receipt.reservationNumber)];
  const raw = JSON.stringify(next);
  sessionStorage.setItem(KEY, raw);
  if (sessionStorage.getItem(KEY) !== raw) throw new Error('Storage unavailable');
}
