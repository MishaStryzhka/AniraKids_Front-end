import type {AdminProductActivationState} from '../api/products';

export interface ActivationDomainGuardSnapshot {
  hasUnsavedWork: boolean;
  pendingMutation: boolean;
  unresolvedOutcome: boolean;
}
export const activationGuardBlocked = (guard?: ActivationDomainGuardSnapshot) => Boolean(guard &&
  (guard.hasUnsavedWork || guard.pendingMutation || guard.unresolvedOutcome));
export const activationRequirementCopy = {
  name: 'Doplňte platný název produktu.',
  slug: 'Doplňte platnou URL / slug.',
  description: 'Doplňte popis produktu.',
  category: 'Vyberte kategorii.',
  gender: 'Vyberte určení.',
  color: 'Doplňte barvu.',
  'rentalPrices.studio': 'Doplňte cenu pronájmu ve studiu.',
  'rentalPrices.external': 'Doplňte cenu externího pronájmu.',
  photos: 'Přidejte alespoň jednu fotografii.',
  variants: 'Přidejte alespoň jednu aktivní variantu.',
  inventory: 'Přidejte alespoň jeden aktivní fyzický kus k aktivní variantě.',
  status: 'Produkt musí být ve stavu Koncept.',
} as const;
export type KnownActivationRequirement = keyof typeof activationRequirementCopy;
export interface ActivationRequirement {key: string | null; copy: string; known: boolean;}
export const genericRequirementCopy = 'Je potřeba splnit další požadavek pro aktivaci.';
export function parseActivationRequirements(details: unknown): ActivationRequirement[] {
  const values = Array.isArray(details) ? details : [];
  const keys = values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  const known = Object.keys(activationRequirementCopy).filter(key => keys.includes(key));
  const unknown = keys.filter(key => !Object.prototype.hasOwnProperty.call(activationRequirementCopy, key));
  const result = [...known, ...Array.from(new Set(unknown))].map(key => ({
    key, known: Object.prototype.hasOwnProperty.call(activationRequirementCopy, key),
    copy: Object.prototype.hasOwnProperty.call(activationRequirementCopy, key) ? activationRequirementCopy[key as KnownActivationRequirement] : genericRequirementCopy,
  })) as ActivationRequirement[];
  if (!values.length || keys.length !== values.length) result.push({key: null, copy: genericRequirementCopy, known: false});
  return result;
}
export interface ActivationReadinessResult {
  attemptId: number; requirements: ActivationRequirement[]; contextRevisionAtAttempt: number; superseded: boolean;
}
export const isReadinessStale = (result: ActivationReadinessResult, revision: number) =>
  result.superseded || result.contextRevisionAtAttempt !== revision;
export function usableActivationMetadata(value: unknown, productId: string): value is AdminProductActivationState {
  if (!value || typeof value !== 'object') return false;
  const state = value as AdminProductActivationState;
  return state.id === productId && ['draft', 'active', 'archived'].includes(state.status) && typeof state.seoNoIndex === 'boolean';
}
export const requirementActions: Partial<Record<KnownActivationRequirement, string>> = {
  name: 'Přejít na Název', slug: 'Přejít na URL / slug', description: 'Přejít na Popis', category: 'Přejít na Kategorii',
  gender: 'Přejít na Určení', color: 'Přejít na Barvu', 'rentalPrices.studio': 'Přejít k cenám',
  'rentalPrices.external': 'Přejít k cenám', photos: 'Přejít k fotografiím', variants: 'Přejít k variantám', inventory: 'Přejít k variantám',
};
export const productConflictHeading = 'Produkt se mezitím změnil';
export const metadataRecoveryLabel = 'Načíst aktuální stav produktu';
