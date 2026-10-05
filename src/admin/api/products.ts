import { adminApiClient, buildAdminRequestConfig } from './client';
import { normalizeAdminApiError } from './errors';

export const ADMIN_PRODUCTS_PAGE_SIZE = 20;

export type AdminProductStatus = 'draft' | 'active' | 'archived';
export type AdminProductCategory = 'dress' | 'suit' | 'set' | 'accessory' | 'other';
export type AdminProductGender = 'girls' | 'boys' | 'women' | 'men' | 'unisex';
export type AdminVariantStatus = 'active' | 'inactive';
export type AdminInventoryItemStatus = 'active' | 'maintenance' | 'retired';
export type AdminInventoryLifecycleTarget = AdminInventoryItemStatus;
export type AdminInventoryCondition = 'excellent' | 'good' | 'fair' | 'damaged';
export type CreateAdminInventoryCondition = Exclude<AdminInventoryCondition, 'damaged'>;

export interface AdminInventoryItem {
  id: string;
  variantId: string;
  internalCode: string;
  status: AdminInventoryItemStatus;
  condition: AdminInventoryCondition;
  notes?: string;
  acquiredAt?: string;
  retiredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminVariant {
  id: string;
  productId: string;
  size: string;
  sku?: string;
  rentalPriceOverrides?: {studio?: number; external?: number};
  salePriceOverride?: number;
  depositOverride?: number;
  status: AdminVariantStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductDetailVariant extends AdminVariant {
  inventory: AdminInventoryItem[];
}

export interface CreateAdminVariantRequest {
  size: string;
}

export interface UpdateAdminVariantSizeRequest {
  size: string;
}

export interface CreateAdminInventoryItemRequest {
  internalCode: string;
  condition?: CreateAdminInventoryCondition;
  notes?: string;
}

export interface UpdateAdminInventoryItemRequest {
  condition?: AdminInventoryCondition;
  notes?: string;
}

export interface AdminProductInventorySnapshot {
  variantIds: string[];
  inventoryByVariant: Record<string, AdminInventoryItem[]>;
}

export interface AdminProductPhoto {
  url: string;
  publicId: string;
  alt?: string;
}

export type AdminProductOccasion = 'wedding' | 'birthday' | 'christening' | 'photoshoot' | 'celebration' | 'other';
export interface AdminProductRentalPrices { studio?: number; external?: number; }
export interface AdminProductSeo { title?: string; description?: string; noIndex: boolean; }
export interface AdminProduct {
  id: string; name: string; slug: string; description?: string;
  category?: AdminProductCategory; gender?: AdminProductGender; color?: string;
  occasion: AdminProductOccasion[]; ageTags: string[]; brand?: string; familyLookGroup?: string;
  rentalEnabled: boolean; saleEnabled: boolean; rentalPrices?: AdminProductRentalPrices;
  defaultSalePrice?: number; defaultDeposit: number; seo: AdminProductSeo;
  status: AdminProductStatus; photos: AdminProductPhoto[];
  createdAt: string; updatedAt: string;
}
export interface AdminProductDetailResponse { product: AdminProduct; variants: AdminProductDetailVariant[]; }
export interface CreateAdminProductRequest {
 name:string;slug?:string;description?:string;category?:AdminProductCategory;gender?:AdminProductGender;color?:string;
 occasion?:AdminProductOccasion[];ageTags?:string[];brand?:string;familyLookGroup?:string;rentalEnabled?:boolean;saleEnabled?:boolean;
 rentalPrices?:AdminProductRentalPrices;defaultSalePrice?:number;defaultDeposit?:number;seo?:Omit<AdminProductSeo,'noIndex'>;
}
export interface UpdateAdminProductRequest {
 name?:string;slug?:string;description?:string;category?:AdminProductCategory|null;gender?:AdminProductGender|null;color?:string;
 occasion?:AdminProductOccasion[];ageTags?:string[];brand?:string;familyLookGroup?:string;rentalEnabled?:boolean;saleEnabled?:boolean;
 rentalPrices?:{studio?:number|null;external?:number|null};defaultSalePrice?:number|null;defaultDeposit?:number;seo?:Omit<AdminProductSeo,'noIndex'>;
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

function extractAdminProduct(data: AdminProduct | AdminProductDetailResponse): AdminProduct {
  return 'product' in data ? data.product : data;
}
export async function createAdminProduct(input:{token:string;body:CreateAdminProductRequest;signal?:AbortSignal}) {
 try { const response=await adminApiClient.post<AdminProduct|AdminProductDetailResponse>('/admin/products',input.body,buildAdminRequestConfig(input.token,input.signal)); return extractAdminProduct(response.data); }
 catch(error){throw normalizeAdminApiError(error)}
}
export async function getAdminProductDetail(input:{token:string;productId:string;signal?:AbortSignal}):Promise<AdminProductDetailResponse> {
 try { const response=await adminApiClient.get<AdminProductDetailResponse>(`/admin/products/${encodeURIComponent(input.productId)}`,buildAdminRequestConfig(input.token,input.signal)); return response.data; }
 catch(error){throw normalizeAdminApiError(error)}
}
export async function updateAdminProduct(input:{token:string;productId:string;body:UpdateAdminProductRequest;signal?:AbortSignal}) {
 if(!Object.keys(input.body).length) throw new Error('Invariant: empty product PATCH');
 try { const response=await adminApiClient.patch<AdminProduct|AdminProductDetailResponse>(`/admin/products/${encodeURIComponent(input.productId)}`,input.body,buildAdminRequestConfig(input.token,input.signal)); return extractAdminProduct(response.data); }
 catch(error){throw normalizeAdminApiError(error)}
}


export async function createAdminVariant(input: {
  token: string;
  productId: string;
  body: CreateAdminVariantRequest;
  signal?: AbortSignal;
}): Promise<AdminVariant> {
  try {
    const response = await adminApiClient.post<{variant: AdminVariant}>(
      `/admin/products/${encodeURIComponent(input.productId)}/variants`,
      input.body,
      buildAdminRequestConfig(input.token, input.signal),
    );
    return response.data.variant;
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}

export async function updateAdminVariantSize(input: {
  token: string;
  variantId: string;
  body: UpdateAdminVariantSizeRequest;
  signal?: AbortSignal;
}): Promise<AdminVariant> {
  try {
    const response = await adminApiClient.patch<{variant: AdminVariant}>(
      `/admin/variants/${encodeURIComponent(input.variantId)}`,
      input.body,
      buildAdminRequestConfig(input.token, input.signal),
    );
    return response.data.variant;
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}

export async function getAdminProductVariants(input: {
  token: string;
  productId: string;
  signal?: AbortSignal;
}): Promise<AdminProductDetailVariant[]> {
  const detail = await getAdminProductDetail(input);
  return detail.variants;
}


export async function createAdminInventoryItem(input: {
  token: string;
  variantId: string;
  body: CreateAdminInventoryItemRequest;
  signal?: AbortSignal;
}): Promise<AdminInventoryItem> {
  try {
    const response = await adminApiClient.post<{inventoryItem: AdminInventoryItem}>(
      `/admin/variants/${encodeURIComponent(input.variantId)}/inventory-items`,
      input.body,
      buildAdminRequestConfig(input.token, input.signal),
    );
    return response.data.inventoryItem;
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}

export async function updateAdminInventoryItem(input: {
  token: string;
  inventoryItemId: string;
  body: UpdateAdminInventoryItemRequest;
  signal?: AbortSignal;
}): Promise<AdminInventoryItem> {
  if (!Object.keys(input.body).length) throw new Error('Invariant: empty inventory PATCH');
  try {
    const response = await adminApiClient.patch<{inventoryItem: AdminInventoryItem}>(
      `/admin/inventory-items/${encodeURIComponent(input.inventoryItemId)}`,
      input.body,
      buildAdminRequestConfig(input.token, input.signal),
    );
    return response.data.inventoryItem;
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}

export async function getAdminProductInventorySnapshot(input: {
  token: string;
  productId: string;
  signal?: AbortSignal;
}): Promise<AdminProductInventorySnapshot> {
  const detail = await getAdminProductDetail(input);
  return {
    variantIds: detail.variants.map(variant => variant.id),
    inventoryByVariant: Object.fromEntries(
      detail.variants.map(variant => [variant.id, variant.inventory]),
    ),
  };
}


async function postAdminInventoryLifecycle(input: {
  token: string;
  inventoryItemId: string;
  action: 'maintenance' | 'activate' | 'retire';
  signal?: AbortSignal;
}): Promise<AdminInventoryItem> {
  try {
    const response = await adminApiClient.post<{inventoryItem: AdminInventoryItem}>(
      `/admin/inventory-items/${encodeURIComponent(input.inventoryItemId)}/${input.action}`,
      undefined,
      buildAdminRequestConfig(input.token, input.signal),
    );
    return response.data.inventoryItem;
  } catch (error) {
    throw normalizeAdminApiError(error);
  }
}

export function moveAdminInventoryItemToMaintenance(input: {
  token: string;
  inventoryItemId: string;
  signal?: AbortSignal;
}): Promise<AdminInventoryItem> {
  return postAdminInventoryLifecycle({...input, action: 'maintenance'});
}

export function activateAdminInventoryItem(input: {
  token: string;
  inventoryItemId: string;
  signal?: AbortSignal;
}): Promise<AdminInventoryItem> {
  return postAdminInventoryLifecycle({...input, action: 'activate'});
}

export function retireAdminInventoryItem(input: {
  token: string;
  inventoryItemId: string;
  signal?: AbortSignal;
}): Promise<AdminInventoryItem> {
  return postAdminInventoryLifecycle({...input, action: 'retire'});
}
