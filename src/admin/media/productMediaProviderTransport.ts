import type {ProductMediaUploadDescriptor} from '../api/productMedia';

export interface ProviderUploadResult {
  publicId: string;
}

export class ProviderUploadError extends Error {
  constructor(
    readonly outcome: 'known-failure' | 'unknown',
    message: string,
  ) {
    super(message);
    this.name = 'ProviderUploadError';
  }
}

export function buildProviderUploadUrl(upload: ProductMediaUploadDescriptor) {
  return `https://api.cloudinary.com/v1_1/${encodeURIComponent(upload.cloudName)}/${upload.resourceType}/upload`;
}

export function uploadProductMedia(input: {
  upload: ProductMediaUploadDescriptor;
  file: File;
  signal?: AbortSignal;
  onProgress?(value: number | null): void;
}): Promise<ProviderUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();

    Object.entries(input.upload.params).forEach(([key, value]) => form.append(key, String(value)));
    form.append('api_key', input.upload.apiKey);
    form.append('signature', input.upload.signature);
    form.append('file', input.file);

    xhr.open('POST', buildProviderUploadUrl(input.upload));
    xhr.withCredentials = false;

    const cleanup = () => input.signal?.removeEventListener('abort', abort);
    const abort = () => xhr.abort();
    input.signal?.addEventListener('abort', abort, {once: true});

    xhr.upload.onprogress = event => {
      input.onProgress?.(
        event.lengthComputable && event.total > 0
          ? Math.min(100, Math.round((event.loaded / event.total) * 100))
          : null,
      );
    };

    xhr.onerror = () => {
      cleanup();
      reject(new ProviderUploadError('unknown', 'Provider upload network outcome is unknown.'));
    };

    xhr.onabort = () => {
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };

    xhr.onload = () => {
      cleanup();

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText || '{}') as {public_id?: unknown};
          if (typeof data.public_id === 'string' && data.public_id.trim()) {
            resolve({publicId: data.public_id.trim()});
            return;
          }
        } catch {
          // A 2xx response may already have stored the asset. Keep outcome uncertain.
        }

        reject(new ProviderUploadError('unknown', 'Provider success response could not confirm the asset identity.'));
        return;
      }

      let message = 'Provider upload failed.';
      try {
        const data = JSON.parse(xhr.responseText || '{}') as {error?: {message?: unknown}};
        if (typeof data.error?.message === 'string' && data.error.message) message = data.error.message;
      } catch {
        // HTTP status remains authoritative for known 4xx vs uncertain 5xx.
      }

      reject(new ProviderUploadError(xhr.status >= 500 ? 'unknown' : 'known-failure', message));
    };

    xhr.send(form);
  });
}
