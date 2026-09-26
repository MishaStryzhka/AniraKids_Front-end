import type {
  AdminProductCategory,
  AdminProductGender,
  AdminProductListQuery,
  AdminProductStatus,
} from '../api/products';

export interface ProductListUrlState {
  status?: AdminProductStatus;
  category?: AdminProductCategory;
  gender?: AdminProductGender;
  rentalEnabled?: boolean;
  page: number;
}

export type ProductListFilterKey = 'status' | 'category' | 'gender' | 'rentalEnabled';

const statuses: readonly AdminProductStatus[] = ['draft', 'active', 'archived'];
const categories: readonly AdminProductCategory[] = ['dress', 'suit', 'set', 'accessory', 'other'];
const genders: readonly AdminProductGender[] = ['girls', 'boys', 'women', 'men', 'unisex'];

function oneOf<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return value !== null && allowed.includes(value as T) ? (value as T) : undefined;
}

function parsePage(value: string | null) {
  if (value === null || !/^\d+$/.test(value)) return 1;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 1 ? parsed : 1;
}

function parseRentalEnabled(value: string | null): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

export function parseProductListSearchParams(params: URLSearchParams): ProductListUrlState {
  return {
    status: oneOf(params.get('status'), statuses),
    category: oneOf(params.get('category'), categories),
    gender: oneOf(params.get('gender'), genders),
    rentalEnabled: parseRentalEnabled(params.get('rentalEnabled')),
    page: parsePage(params.get('page')),
  };
}

export function buildProductListSearchParams(state: ProductListUrlState) {
  const params = new URLSearchParams();

  if (state.status !== undefined) params.set('status', state.status);
  if (state.category !== undefined) params.set('category', state.category);
  if (state.gender !== undefined) params.set('gender', state.gender);
  if (state.rentalEnabled !== undefined) params.set('rentalEnabled', String(state.rentalEnabled));
  if (state.page > 1) params.set('page', String(state.page));

  return params;
}

export function canonicalizeProductListSearchParams(params: URLSearchParams) {
  const state = parseProductListSearchParams(params);
  const canonical = buildProductListSearchParams(state);

  return {
    state,
    searchParams: canonical,
    changed: params.toString() !== canonical.toString(),
  };
}

export function toAdminProductListQuery(state: ProductListUrlState): AdminProductListQuery {
  const query: AdminProductListQuery = { page: state.page };
  if (state.status !== undefined) query.status = state.status;
  if (state.category !== undefined) query.category = state.category;
  if (state.gender !== undefined) query.gender = state.gender;
  if (state.rentalEnabled !== undefined) query.rentalEnabled = state.rentalEnabled;
  return query;
}

export function countActiveProductFilters(state: ProductListUrlState) {
  return [state.status, state.category, state.gender, state.rentalEnabled]
    .filter(value => value !== undefined).length;
}
