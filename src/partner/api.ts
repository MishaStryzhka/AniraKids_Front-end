const getAdminApiBaseUrl = () =>
  process.env.REACT_APP_V2_API_BASE_URL?.trim().replace(/\/+$/, '');
export class PartnerApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly requestId?: string
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
  let response: Response;
  try { response = await fetch(base + '/partner/' + path, {
    method: body === undefined ? 'GET' : 'POST',
    cache: 'no-store',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      ...(key ? { 'Idempotency-Key': key } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  } catch {
    throw new PartnerApiError('Spojení se serverem selhalo. Výsledek operace není ověřený. Obnovte přehled před dalším pokusem.', 0, 'NETWORK_ERROR');
  }
  let data;
  try { data = await response.json(); } catch {
    throw new PartnerApiError('Server vrátil neplatnou odpověď. Výsledek operace není ověřený. Obnovte přehled před dalším pokusem.', response.status, 'INVALID_RESPONSE');
  }
  if (!response.ok) {
    const code = data.error?.code;
    throw new PartnerApiError(
      (
        {
          BILLING_START_PERIOD_PAST: 'První období nesmí být před aktuálním měsícem.',
          BILLING_CHANGED: 'Nastavení změnil jiný uživatel. Obnovte faktury.',
          BILLING_SERIES_LOCKED: 'Po zahájení evidence nelze měnit řadu ani první období.',
          BILLING_PERIOD_OPEN: 'Tento měsíc ještě neskončil.',
          BILLING_NOT_ENABLED: 'Nejprve nastavte a zapněte fakturaci.',
          BILLING_TRACKING_ERROR: 'Evidence odměn obsahuje chybu. Kontaktujte správce.',
          BILLING_BEFORE_START: 'Toto období předchází zahájení evidence.',
          BILLING_PREVIOUS_PERIOD_MISSING: 'Nejprve uzavřete předchozí období.',
          BILLING_EMAIL_CHANGED: 'Stav odeslání se změnil. Obnovte faktury.',
          BILLING_EMAIL_IN_PROGRESS: 'Odesílání ještě probíhá. Zkontrolujte stav za 10 minut.',
          BILLING_EMAIL_UNCERTAIN: 'Doručení není potvrzeno. Před opakováním zkontrolujte poštu příjemce.',
          UNAUTHORIZED: 'Přihlaste se ke svému účtu.',
          FORBIDDEN: 'K této funkci nemáte přístup.',
          USER_NOT_FOUND:
            'Účet s tímto e-mailem neexistuje. Nejdříve se musí zaregistrovat.',
          CONFLICT: 'Údaje se změnily. Obnovte přehled.',
          PAYMENT_FULL_DEPOSIT_REQUIRED: 'Vratnou kauci je nutné přijmout v celé požadované výši. Načtěte aktuální stav.',
          PAYMENT_ADVANCE_REQUIRED: 'Rezervaci nelze potvrdit: nejprve zaznamenejte přijetí požadované zálohy v části Platby a QR.',
          INVALID_RESERVATION_TRANSITION: 'Tuto akci nelze provést v aktuálním stavu rezervace. Obnovte přehled.',
          RESERVATION_CONFIRMATION_CONFLICT: 'Rezervaci nelze potvrdit: oblečení již není v tomto termínu dostupné.',
          RESERVATION_INVENTORY_NOT_ACTIVE: 'Rezervaci nelze potvrdit: fyzický kus není aktivní.',
          RESERVATION_NOT_FOUND: 'Rezervace nebyla nalezena. Obnovte přehled.',
          VALIDATION_ERROR: 'Zkontrolujte vyplněné údaje.',
          PAYMENT_RENTAL_REQUIRED:
            'Před vydáním musí být zaznamenána celá platba a případná kauce.',
          NO_AVAILABLE_INVENTORY: 'Oblečení není v tomto termínu dostupné.',
        } as Record<string, string>
      )[code] ||
        'Operaci se nepodařilo potvrdit. Obnovte přehled před dalším pokusem.',
      response.status, code,
      typeof data.error?.requestId === 'string' && /^[a-f0-9-]{36}$/.test(data.error.requestId) ? data.error.requestId : undefined
    );
  }
  return data;
}

export async function downloadPartnerInvoice(token:string,id:string,number:string){
 const base=getAdminApiBaseUrl();if(!base)throw new Error('Připojení není nastavené.');
 const response=await fetch(base+'/partner/billing-pdf?id='+encodeURIComponent(id),{cache:'no-store',headers:{Authorization:'Bearer '+token}});
 if(!response.ok)throw new Error('Fakturu se nepodařilo stáhnout. Obnovte přehled.');
 const blob=await response.blob();const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=number+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
