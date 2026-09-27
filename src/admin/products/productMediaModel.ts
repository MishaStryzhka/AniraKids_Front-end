import type {AdminProductPhoto} from '../api/products';
export type MediaGuardStatus='available'|'product-missing'|'configuration-error';
export interface ProductMediaSnapshot{photos:AdminProductPhoto[];mediaGuardStatus:MediaGuardStatus}
export interface ProductMediaDrafts{altById:Record<string,string>;orderIds:string[]}
export const photoIds=(photos:AdminProductPhoto[])=>photos.map(p=>p.publicId);
export const distinctPhotoIds=(photos:AdminProductPhoto[])=>Array.from(new Set(photoIds(photos)));
export const sameMembership=(a:string[],b:string[])=>a.length===b.length&&a.every(id=>b.includes(id));
export function reconcileMediaDrafts(previous:ProductMediaDrafts,nextPhotos:AdminProductPhoto[]):ProductMediaDrafts{
 const ids=photoIds(nextPhotos),alive=new Set(ids),altById:Record<string,string>={};
 Object.entries(previous.altById).forEach(([id,value])=>{if(alive.has(id))altById[id]=value});
 return {altById,orderIds:sameMembership(previous.orderIds,ids)?previous.orderIds:ids};
}
export const isOrderDirty=(photos:AdminProductPhoto[],orderIds:string[])=>photoIds(photos).join('\0')!==orderIds.join('\0');
export const moveId=(ids:string[],id:string,delta:-1|1)=>{const from=ids.indexOf(id),to=from+delta;if(from<0||to<0||to>=ids.length)return ids;const next=[...ids];[next[from],next[to]]=[next[to],next[from]];return next};
export function validatePhotoFile(file:File){const allowed=['image/jpeg','image/png','image/webp'];if(file.size>15*1024*1024)return 'Soubor může mít maximálně 15 MB.';if(!allowed.includes(file.type))return 'Použijte obrázek JPG, JPEG, PNG nebo WEBP.';return null}
export const validateAlt=(value:string)=>{const v=value.trim();return !v?'Alternativní text je povinný.':v.length>180?'Alternativní text může mít maximálně 180 znaků.':null};
