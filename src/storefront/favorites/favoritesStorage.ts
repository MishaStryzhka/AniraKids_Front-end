export const guestFavoritesKey = 'anirak:favorites:v1';
export const validFavoriteId = (value: unknown): value is string => typeof value === 'string' && /^[a-f\d]{24}$/.test(value);
export function normalizeFavorites(value: unknown): string[] {
  return Array.isArray(value) ? Array.from(new Set(value.filter(validFavoriteId))).slice(0, 100) : [];
}
export function readGuestFavorites(): string[] {
  try { return normalizeFavorites(JSON.parse(localStorage.getItem(guestFavoritesKey) || '[]')); } catch { return []; }
}
export function writeGuestFavorites(ids: string[]): boolean {
  try { localStorage.setItem(guestFavoritesKey, JSON.stringify(normalizeFavorites(ids))); return true; } catch { return false; }
}
