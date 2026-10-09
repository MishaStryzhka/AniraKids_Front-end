import { Heart } from 'lucide-react';
import { IconButton } from '../../design-system/components/IconButton';
import { Button } from '../../design-system/components/Button';
import { Alert, Copy } from '../storefrontStyles';
import { useFavorites } from './FavoritesProvider';
export function FavoriteButton({ id, name }: { id: string; name: string }) {
  const favorites = useFavorites(), selected = favorites.ids.includes(id);
  return <IconButton variant="secondary" aria-label={`${selected ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}: ${name}`} aria-pressed={selected} disabled={favorites.loading || !!favorites.error} onClick={() => favorites.toggle(id)} icon={<Heart aria-hidden="true" fill={selected ? 'currentColor' : 'none'} />} />;
}
export function FavoritesFeedback() {
  const { error, notice, retry } = useFavorites();
  return error ? <Alert role="alert"><Copy>{error}</Copy><Button variant="secondary" onClick={retry}>Zkusit znovu</Button></Alert> : notice ? <Copy role="status">{notice}</Copy> : null;
}
