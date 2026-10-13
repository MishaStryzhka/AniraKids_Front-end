import type {Area} from 'react-easy-crop';
import {validatePhotoFile} from './productMediaModel';

export class ProductPhotoCropError extends Error {}

/** Crop locally before the existing SIGN → upload → COMPLETE flow. */
export async function cropProductPhoto(sourceUrl: string, source: File, area: Area): Promise<File> {
  if (![area.x, area.y, area.width, area.height].every(Number.isFinite) || area.width <= 0 || area.height <= 0) {
    throw new ProductPhotoCropError('Nejprve vyberte výřez fotografie.');
  }
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new ProductPhotoCropError('Fotografii nelze načíst. Vyberte prosím jiný obrázek.'));
    img.src = sourceUrl;
  });
  const x = Math.max(0, Math.round(area.x));
  const y = Math.max(0, Math.round(area.y));
  const width = Math.min(Math.round(area.width), image.naturalWidth - x);
  const height = Math.min(Math.round(area.height), image.naturalHeight - y);
  if (width < 1 || height < 1) throw new ProductPhotoCropError('Vybraný výřez není platný.');
  // Limit the output canvas, without allocating another full-resolution canvas.
  const scale = Math.min(1, 4096 / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new ProductPhotoCropError('Oříznutí fotografie není v tomto prohlížeči dostupné.');
  context.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);
  const mime = ['image/png', 'image/webp'].includes(source.type) ? source.type : 'image/jpeg';
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => {
    if (result) resolve(result);
    else reject(new ProductPhotoCropError('Fotografii se nepodařilo zpracovat. Zkuste to prosím znovu.'));
  }, mime, 0.95));
  const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
  const name = source.name.replace(/\.[^.]+$/, '').replace(/-orez$/, '') || 'fotografie';
  const file = new File([blob], `${name}-orez.${extension}`, {type: blob.type});
  const error = validatePhotoFile(file);
  if (error) throw new ProductPhotoCropError('Výsledná fotografie je příliš velká. Zvolte menší výřez (maximálně 15 MB).');
  return file;
}
