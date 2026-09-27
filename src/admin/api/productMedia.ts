import {adminApiClient,buildAdminRequestConfig} from './client';
import {normalizeAdminApiError} from './errors';
import type {AdminProduct} from './products';

export interface ProductMediaUploadDescriptor {
 cloudName:string;apiKey:string;signature:string;resourceType:'image';
 params:{timestamp:number;folder:string;public_id:string;overwrite:false;allowed_formats:string;[key:string]:string|number|boolean};
}
export const productMediaCandidate=(upload:ProductMediaUploadDescriptor)=>`${upload.params.folder}/${upload.params.public_id}`;
const path=(productId:string,suffix='')=>`/admin/products/${encodeURIComponent(productId)}/photos${suffix}`;
async function request<T>(fn:()=>Promise<{data:T}>){try{return (await fn()).data}catch(error){throw normalizeAdminApiError(error)}}
export const signProductPhoto=(i:{token:string;productId:string;signal?:AbortSignal})=>request<{upload:ProductMediaUploadDescriptor}>(()=>adminApiClient.post(path(i.productId,'/sign'),{},buildAdminRequestConfig(i.token,i.signal)));
export const completeProductPhoto=(i:{token:string;productId:string;publicId:string;alt?:string;signal?:AbortSignal})=>request<{product:AdminProduct}>(()=>adminApiClient.post(path(i.productId,'/complete'),{publicId:i.publicId,...(i.alt?.trim()?{alt:i.alt.trim()}:{})},buildAdminRequestConfig(i.token,i.signal)));
export const updateProductPhotoAlt=(i:{token:string;productId:string;publicId:string;alt:string;signal?:AbortSignal})=>request<{product:AdminProduct}>(()=>adminApiClient.patch(path(i.productId),{publicId:i.publicId,alt:i.alt.trim()},buildAdminRequestConfig(i.token,i.signal)));
export const reorderProductPhotos=(i:{token:string;productId:string;publicIds:string[];signal?:AbortSignal})=>request<{product:AdminProduct}>(()=>adminApiClient.patch(path(i.productId,'/order'),{publicIds:i.publicIds},buildAdminRequestConfig(i.token,i.signal)));
export const deleteProductPhoto=(i:{token:string;productId:string;publicId:string;signal?:AbortSignal})=>request<{product:AdminProduct}>(()=>adminApiClient.delete(path(i.productId),{...buildAdminRequestConfig(i.token,i.signal),data:{publicId:i.publicId}}));
