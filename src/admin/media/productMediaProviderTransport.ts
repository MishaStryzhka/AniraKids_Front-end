import type {ProductMediaUploadDescriptor} from '../api/productMedia';
export interface ProviderUploadResult{publicId:string}
export class ProviderUploadError extends Error{constructor(readonly outcome:'known-failure'|'unknown',message:string){super(message);this.name='ProviderUploadError'}}
export function buildProviderUploadUrl(upload:ProductMediaUploadDescriptor){return `https://api.cloudinary.com/v1_1/${encodeURIComponent(upload.cloudName)}/${upload.resourceType}/upload`}
export function uploadProductMedia(input:{upload:ProductMediaUploadDescriptor;file:File;signal?:AbortSignal;onProgress?(value:number|null):void}):Promise<ProviderUploadResult>{
 return new Promise((resolve,reject)=>{const xhr=new XMLHttpRequest(),form=new FormData();Object.entries(input.upload.params).forEach(([k,v])=>form.append(k,String(v)));form.append('api_key',input.upload.apiKey);form.append('signature',input.upload.signature);form.append('file',input.file);
 xhr.open('POST',buildProviderUploadUrl(input.upload));xhr.withCredentials=false;
 const abort=()=>xhr.abort();input.signal?.addEventListener('abort',abort,{once:true});
 xhr.upload.onprogress=e=>input.onProgress?.(e.lengthComputable?Math.min(100,Math.round(e.loaded/e.total*100)):null);
 xhr.onerror=()=>reject(new ProviderUploadError('unknown','Provider upload network outcome is unknown.'));
 xhr.onabort=()=>reject(new DOMException('Aborted','AbortError'));
 xhr.onload=()=>{input.signal?.removeEventListener('abort',abort);let data:any={};try{data=JSON.parse(xhr.responseText||'{}')}catch{}if(xhr.status>=200&&xhr.status<300&&typeof data.public_id==='string')resolve({publicId:data.public_id});else reject(new ProviderUploadError(xhr.status>=500?'unknown':'known-failure',data?.error?.message||'Provider upload failed.'))};
 xhr.send(form);
 });
}
