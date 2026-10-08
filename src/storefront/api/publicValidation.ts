export class PublicApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number | null = null
  ) {
    super(code);
    this.name = 'PublicApiError';
  }
}
export const object = (v: unknown): v is Record<string, unknown> =>
  Boolean(v && typeof v === 'object' && !Array.isArray(v));
export const string = (v: unknown, max = 10000): v is string =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= max;
export const money = (v: unknown): v is number =>
  typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
