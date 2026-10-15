import {adminApiClient, buildAdminRequestConfig} from './client';
import {normalizeAdminApiError} from './errors';
import type {AdminProduct, AdminProductCategory, AdminProductGender} from './products';
import type {ProductMediaUploadDescriptor} from './productMedia';
export interface DraftPhoto {url:string;publicId:string}
export interface ProductSuggestion {description:string;colors:string[];category:AdminProductCategory|null;gender:AdminProductGender|null;ageTags:string[];note:string}
export async function draftRequest<T>(token:string,path:string,body:unknown={},signal?:AbortSignal):Promise<T>{
  try{return (await adminApiClient.post(`/admin/product-drafts${path}`,body,buildAdminRequestConfig(token,signal))).data;}
  catch(error){throw normalizeAdminApiError(error);}
}
export const startProductDraft=(token:string)=>draftRequest<{draftId:string}>(token,'');
export const signDraftPhoto=(token:string,id:string)=>draftRequest<{upload:ProductMediaUploadDescriptor}>(token,`/${id}/photos/sign`);
export const completeDraftPhoto=(token:string,id:string,publicId:string)=>draftRequest<{photos:DraftPhoto[]}>(token,`/${id}/photos/complete`,{publicId});
export const removeDraftPhoto=(token:string,id:string,publicId:string)=>draftRequest<{photos:DraftPhoto[]}>(token,`/${id}/photos/remove`,{publicId});
export const suggestDraft=(token:string,id:string)=>draftRequest<{suggestion:ProductSuggestion}>(token,`/${id}/suggest`);
export const saveProductDraft=(token:string,id:string,body:unknown,signal?:AbortSignal)=>draftRequest<{product:AdminProduct}>(token,`/${id}/save`,body,signal).then(r=>r.product);
