import { Heart } from 'lucide-react';
import styled from 'styled-components';
import { IconButton } from '../../design-system/components/IconButton';
import { Button } from '../../design-system/components/Button';
import { designTokens as t } from '../../design-system/tokens/designTokens';
import { Alert, Copy } from '../storefrontStyles';
import { useFavorites } from './FavoritesProvider';

const HeartButton = styled(IconButton)`
  &[aria-pressed='true']:not(:disabled) { color: ${t.color.action.primary.bg}; }
  &:hover:not(:disabled), &:active:not(:disabled) {
    background: transparent;
    color: ${t.color.action.primary.bgHover};
  }
  & > svg {
    inline-size: 22px;
    block-size: 22px;
    stroke-width: 1.75;
    filter: drop-shadow(0 0 1px ${t.color.bg.surface}) drop-shadow(0 1px 2px rgb(41 37 34 / 18%));
  }
`;

export function FavoriteButton({ id, name }: { id: string; name: string }) {
  const favorites = useFavorites(), selected = favorites.ids.includes(id);
  const label = `${selected ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}: ${name}`;
  return <HeartButton aria-label={label} title={label} aria-pressed={selected} disabled={favorites.loading || !!favorites.error} onClick={() => favorites.toggle(id)} icon={<Heart aria-hidden="true" fill={selected ? 'currentColor' : 'none'} />} />;
}
export function FavoritesFeedback() {
  const { error, notice, retry } = useFavorites();
  return error ? <Alert role="alert"><Copy>{error}</Copy><Button variant="secondary" onClick={retry}>Zkusit znovu</Button></Alert> : notice ? <Copy role="status">{notice}</Copy> : null;
}
