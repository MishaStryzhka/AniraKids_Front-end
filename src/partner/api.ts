const getAdminApiBaseUrl = () =>
  process.env.REACT_APP_V2_API_BASE_URL?.trim().replace(/\/+$/, '');
export class PartnerApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}
export async function partnerApi(
  path: string,
  token: string,
  body?: unknown,
  key?: string
) {
  const base = getAdminApiBaseUrl();
  if (!base) throw new Error('Připojení není nastavené.');
  const response = await fetch(base + '/partner/' + path, {
    method: body === undefined ? 'GET' : 'POST',
    cache: 'no-store',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      ...(key ? { 'Idempotency-Key': key } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok) {
    const code = data.error?.code;
    throw new PartnerApiError(
      (
        {
          UNAUTHORIZED: 'Přihlaste se ke svému účtu.',
          FORBIDDEN: 'K této funkci nemáte přístup.',
          USER_NOT_FOUND:
            'Účet s tímto e-mailem neexistuje. Nejdříve se musí zaregistrovat.',
          CONFLICT: 'Údaje se změnily. Obnovte přehled.',
          PAYMENT_RENTAL_REQUIRED:
            'Před vydáním musí být zaznamenána celá platba a případná kauce.',
          NO_AVAILABLE_INVENTORY: 'Oblečení není v tomto termínu dostupné.',
        } as Record<string, string>
      )[code] ||
        'Operaci se nepodařilo potvrdit. Obnovte přehled před dalším pokusem.',
      response.status
    );
  }
  return data;
}
