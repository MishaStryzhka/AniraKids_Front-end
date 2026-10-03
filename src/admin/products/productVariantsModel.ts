import type {AdminProductDetailVariant, AdminVariant} from '../api/products';

export const normalizeVariantSize = (value: string) => value.trim();

export type VariantSizeError = 'empty' | 'too-long' | 'duplicate' | null;

export function validateVariantSize(input: {
  value: string;
  variants: AdminVariant[];
  editingVariantId?: string;
}): {value: string; error: VariantSizeError} {
  const value = normalizeVariantSize(input.value);
  if (!value) return {value, error: 'empty'};
  if (value.length > 40) return {value, error: 'too-long'};
  const duplicate = input.variants.some(variant =>
    variant.id !== input.editingVariantId && variant.size === value,
  );
  return {value, error: duplicate ? 'duplicate' : null};
}

export function variantSizeErrorCopy(error: VariantSizeError) {
  if (error === 'empty') return 'Zadejte velikost.';
  if (error === 'too-long') return 'Velikost může mít maximálně 40 znaků.';
  if (error === 'duplicate') return 'Tato velikost už u produktu existuje.';
  return null;
}

export type VariantEditorTarget = {kind: 'add'} | {kind: 'edit'; variantId: string};

export function isVariantEditorDirty(input: {
  target: VariantEditorTarget | null;
  sizeDraft: string;
  variants: AdminVariant[];
}) {
  if (!input.target) return false;
  const normalized = normalizeVariantSize(input.sizeDraft);
  if (input.target.kind === 'add') return normalized !== '';
  const canonical = input.variants.find(variant => variant.id === input.target!.variantId);
  return canonical ? normalized !== canonical.size : normalized !== '';
}

export function projectDetailVariants(variants: AdminProductDetailVariant[]): AdminVariant[] {
  return variants.map(({inventory: _inventory, ...variant}) => variant);
}

export function sortAdminVariants(variants: AdminVariant[]) {
  return [...variants].sort((left, right) => {
    const order = left.sortOrder - right.sortOrder;
    if (order) return order;
    const created = left.createdAt.localeCompare(right.createdAt);
    if (created) return created;
    return left.id.localeCompare(right.id);
  });
}

export function reconcileCreatedVariant(variants: AdminVariant[], created: AdminVariant) {
  return sortAdminVariants([...variants.filter(variant => variant.id !== created.id), created]);
}

export function reconcileUpdatedVariant(variants: AdminVariant[], updated: AdminVariant) {
  return sortAdminVariants(variants.map(variant => variant.id === updated.id ? updated : variant));
}

export function reconcileUnknownCreate(input: {
  variants: AdminVariant[];
  attemptedSize: string | null;
}) {
  if (!input.attemptedSize) return {found: false, variant: null as AdminVariant | null};
  const variant = input.variants.find(item => item.size === input.attemptedSize) ?? null;
  return {found: Boolean(variant), variant};
}
