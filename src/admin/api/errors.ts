import axios, { AxiosError } from 'axios';

export interface AdminApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
    details?: string[];
  };
}

export type AdminApiErrorKind =
  | 'unauthorized'
  | 'forbidden'
  | 'admin_disabled'
  | 'configuration_error'
  | 'network'
  | 'unexpected'
  | 'cancelled';

export class AdminApiError extends Error {
  readonly status: number | null;
  readonly code: string;
  readonly details?: string[];
  readonly kind: AdminApiErrorKind;

  constructor(input: { status?: number | null; code: string; message: string; details?: string[]; kind: AdminApiErrorKind }) {
    super(input.message);
    this.name = 'AdminApiError';
    this.status = input.status ?? null;
    this.code = input.code;
    this.details = input.details;
    this.kind = input.kind;
  }
}

export function createAdminClientNotConfiguredError() {
  return new AdminApiError({
    code: 'ADMIN_CLIENT_NOT_CONFIGURED',
    message: 'Admin API client is not configured.',
    kind: 'configuration_error',
  });
}

export function normalizeAdminApiError(error: unknown): AdminApiError {
  if (error instanceof AdminApiError) return error;

  if (axios.isCancel(error) || (error instanceof AxiosError && error.code === 'ERR_CANCELED')) {
    return new AdminApiError({ code: 'ADMIN_REQUEST_CANCELLED', message: 'Admin request was cancelled.', kind: 'cancelled' });
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status ?? null;
    const payload = error.response?.data as AdminApiErrorResponse | undefined;
    const code = payload?.error?.code ?? 'ADMIN_API_ERROR';
    const message = payload?.error?.message ?? error.message ?? 'Admin request failed.';
    const details = payload?.error?.details;

    if (status === 401 && code === 'ADMIN_UNAUTHORIZED') return new AdminApiError({ status, code, message, details, kind: 'unauthorized' });
    if (status === 403 && code === 'ADMIN_FORBIDDEN') return new AdminApiError({ status, code, message, details, kind: 'forbidden' });
    if (status === 503 && code === 'ADMIN_API_DISABLED') return new AdminApiError({ status, code, message, details, kind: 'admin_disabled' });
    if (status === 503 && code === 'ADMIN_API_CONFIGURATION_ERROR') return new AdminApiError({ status, code, message, details, kind: 'configuration_error' });

    if (!error.response) {
      return new AdminApiError({ status, code: 'ADMIN_NETWORK_ERROR', message: 'Admin API is unreachable.', kind: 'network' });
    }

    return new AdminApiError({ status, code, message, details, kind: 'unexpected' });
  }

  return new AdminApiError({
    code: 'ADMIN_UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'Unexpected Admin error.',
    kind: 'unexpected',
  });
}