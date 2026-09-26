import { adminApiClient, buildAdminRequestConfig } from './client';
import { normalizeAdminApiError } from './errors';

export const ADMIN_PRODUCTS_PAGE_SIZE = 20;

export type AdminProductStatus = 'draft' | 'active' | 'archived';
export type AdminProductCategory = 'dress' | 'suit' | 'set' | 'accessory' | 'other';
export type AdminProductGender = 'girls' | 'boys' | 'women' | 'men' | 'unisex';

export interface AdminProductPhoto {
  url: string;
  publicId: string;
  alt?: string;
}

export interface AdminProductListItem {
  id: string;
  name: string;
  slug?: string;
  category?: AdminProductCategory;
  gender?: AdminProductGender;
  rentalEnabled: boolean;
  saleEnabled: boolean;
  photos: AdminProductPhoto[];
  status: AdminProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductListPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminProductListResponse {
  items: AdminProductListItem[];
  pagination: AdminProductListPagination;
}

export interface AdminProductListQuery {
  status?: AdminProductStatus;
  category?: AdminProductCategory;
  gender?: AdminProductGender;
  rentalEnabled?: boolean;
  page: number;
}

export function serializeAdminProductListParams(query: AdminProductListQuery) {
  const params: {
    status?: AdminProductStatus;
    category?: AdminProductCategory;
    gender?: AdminProductGender;
    rentalEnabled?: 'true' | 'false';
    page: number;
    limit: number;
  } = {
    page: query.page,
    limit: ADMIN_PRODUCTS_PAGE_SIZE,
  };

  if (query.status !== undefined) params.status = query.status;
  if (query.category !== undefined) params.category = query.category;
  if (query.gender !== undefined) params.gender = query.gender;
  if (query.rentalEnabled !== undefined) params.rentalEnabled = query.rentalEnabled ? 'true' : 'false';

  return params;
}

export async function listAdminProducts(input: {
  token: string;
  query: AdminProductListQuery;
  signal?: AbortSignal;
}) {
  try {
    const config = buildAdminRequestConfig(input.token, input.signal);
    const response = await adminApiClient.get<AdminProductListResponse>('/admin/products', {
      ...config,
      params: serializeAdminProductListParams(input.query),
    });

    return response.data;
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}
