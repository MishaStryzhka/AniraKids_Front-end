import { validFavoriteId } from './favoritesStorage';
export async function favoritesRequest(token: string, method = 'GET', ids?: string[], removeId?: string, signal?: AbortSignal): Promise<string[]> {
  const base = process.env.REACT_APP_LEGACY_API_BASE_URL?.trim().replace(/\/+$/, '');
  if (!base) throw new Error('Služba oblíbených nyní není dostupná.');
  const response = await fetch(base + '/api/users/favorites/storefront' + (removeId ? '/' + removeId : ''), {
    method, signal, credentials: 'omit',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(ids ? { 'Content-Type': 'application/json' } : {}) },
    ...(ids ? { body: JSON.stringify({ ids }) } : {}),
  });
  if (!response.ok) throw new Error(response.status === 409 ? 'Můžete uložit nejvýše 100 oblíbených produktů.' : 'Oblíbené se nepodařilo synchronizovat. Zkuste to znovu.');
  const data = await response.json();
  if (!Array.isArray(data.ids) || !data.ids.every(validFavoriteId)) throw new Error('Oblíbené se nepodařilo načíst.');
  return Array.from(new Set(data.ids as string[]));
}
