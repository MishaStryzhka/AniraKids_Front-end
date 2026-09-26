import type {
  AdminProductCategory,
  AdminProductGender,
  AdminProductStatus,
} from '../api/products';

export const statusPresentation: Record<
  AdminProductStatus,
  { label: string; tone: 'info' | 'success' | 'neutral' }
> = {
  draft: { label: 'Koncept', tone: 'info' },
  active: { label: 'Aktivní', tone: 'success' },
  archived: { label: 'Archivovaný', tone: 'neutral' },
};

export const categoryLabels: Record<AdminProductCategory, string> = {
  dress: 'Šaty',
  suit: 'Obleky',
  set: 'Sety',
  accessory: 'Doplňky',
  other: 'Ostatní',
};

export const genderLabels: Record<AdminProductGender, string> = {
  girls: 'Dívky',
  boys: 'Chlapci',
  women: 'Ženy',
  men: 'Muži',
  unisex: 'Unisex',
};

export function productCategoryLabel(value?: AdminProductCategory) {
  return value ? categoryLabels[value] : 'Neuvedeno';
}

export function productGenderLabel(value?: AdminProductGender) {
  return value ? genderLabels[value] : 'Neuvedeno';
}

export function yesNo(value: boolean) {
  return value ? 'Ano' : 'Ne';
}

const updatedAtFormatter = new Intl.DateTimeFormat('cs-CZ', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatProductUpdatedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : updatedAtFormatter.format(date);
}
