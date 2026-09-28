import type {AdminProductPhoto} from '../api/products';

export type MediaGuardStatus = 'available' | 'product-missing' | 'configuration-error';

export interface ProductMediaSnapshot {
  photos: AdminProductPhoto[];
  mediaGuardStatus: MediaGuardStatus;
}

export interface ProductMediaDrafts {
  altById: Record<string, string>;
  orderIds: string[];
}

export interface MediaReconcileResult {
  drafts: ProductMediaDrafts;
  membershipChanged: boolean;
  missingAltTargetIds: string[];
}

export const photoIds = (photos: AdminProductPhoto[]) => photos.map(photo => photo.publicId);
export const distinctPhotoIds = (photos: AdminProductPhoto[]) => Array.from(new Set(photoIds(photos)));

export const sameMembership = (left: string[], right: string[]) =>
  left.length === right.length && left.every(id => right.includes(id));

export function reconcileMediaDrafts(input: {
  previousPhotos: AdminProductPhoto[];
  previousDrafts: ProductMediaDrafts;
  nextPhotos: AdminProductPhoto[];
}): MediaReconcileResult {
  const previousIds = photoIds(input.previousPhotos);
  const nextIds = photoIds(input.nextPhotos);
  const membershipChanged = !sameMembership(previousIds, nextIds);
  const orderWasDirty = previousIds.join('\0') !== input.previousDrafts.orderIds.join('\0');
  const alive = new Set(nextIds);
  const altById: Record<string, string> = {};
  const missingAltTargetIds: string[] = [];

  Object.entries(input.previousDrafts.altById).forEach(([id, value]) => {
    if (alive.has(id)) altById[id] = value;
    else missingAltTargetIds.push(id);
  });

  return {
    drafts: {
      altById,
      orderIds: membershipChanged
        ? nextIds
        : orderWasDirty
          ? input.previousDrafts.orderIds
          : nextIds,
    },
    membershipChanged,
    missingAltTargetIds,
  };
}

export const isOrderDirty = (photos: AdminProductPhoto[], orderIds: string[]) =>
  photoIds(photos).join('\0') !== orderIds.join('\0');

export const moveId = (ids: string[], id: string, delta: -1 | 1) => {
  const from = ids.indexOf(id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= ids.length) return ids;

  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
};

export function validatePhotoFile(file: File) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (file.size > 15 * 1024 * 1024) return 'Soubor může mít maximálně 15 MB.';
  if (!allowed.includes(file.type)) return 'Použijte obrázek JPG, JPEG, PNG nebo WEBP.';
  return null;
}

export const validateAlt = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 'Alternativní text je povinný.';
  if (trimmed.length > 180) return 'Alternativní text může mít maximálně 180 znaků.';
  return null;
};
