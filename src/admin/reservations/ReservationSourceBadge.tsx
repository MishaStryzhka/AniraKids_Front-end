import { StatusBadge } from '../../design-system/components/StatusBadge';

export function ReservationSourceBadge({ source }: { source?: string }) {
  const label = source === 'partner' ? 'Blaze' : source === 'anirak' ? 'ANIRAK' : 'Zdroj neuveden';
  return <StatusBadge tone="neutral" aria-label={`Zdroj klienta: ${label}`}>{label}</StatusBadge>;
}
