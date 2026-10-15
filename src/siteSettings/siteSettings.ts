export interface SiteSections { suits: boolean; familyLooks: boolean; }
export const defaultSiteSections: SiteSections = {suits: true, familyLooks: false};
export function parseSiteSections(value: unknown): SiteSections {
  const sections = (value as {sections?: Partial<SiteSections>} | null)?.sections;
  if (!sections || typeof sections.suits !== 'boolean' || typeof sections.familyLooks !== 'boolean') {
    throw new Error('Invalid site settings response');
  }
  return {suits: sections.suits, familyLooks: sections.familyLooks};
}
export async function readPublicSiteSections(signal: AbortSignal): Promise<SiteSections> {
  const base = process.env.REACT_APP_V2_API_BASE_URL?.trim().replace(/\/+$/, '');
  if (!base) throw new Error('Site settings unavailable');
  const response = await fetch(base + '/site-settings', {signal, credentials: 'omit', cache: 'no-store'});
  if (!response.ok) throw new Error('Site settings unavailable');
  return parseSiteSections(await response.json());
}
