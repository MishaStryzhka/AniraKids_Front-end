import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import styled from 'styled-components';
import type { BookingPolicy, PaymentInstructions } from '../api/bookingPolicy';
import type { Receipt } from '../api/publicApi';
import { Copy, Facts, Heading, Stack } from '../storefrontStyles';
import { formatMoney } from '../booking/bookingModel';
const Qr = styled.img`
  display: block;
  width: 256px;
  max-width: 100%;
  height: auto;
  background: white;
`;
export function CompanyInformation({
  company,
}: {
  company: BookingPolicy['company'];
}) {
  return (
    <Stack>
      <Heading>Provozovatel</Heading>
      <Copy>
        {company.name} · IČO {company.ico}
      </Copy>
      <Copy>{company.address}</Copy>
      <Copy>{company.register}</Copy>
      <Copy>Nejsme plátci DPH.</Copy>
    </Stack>
  );
}
export function BookingPaymentExplanation({
  policy,
  rentalPrice,
}: {
  policy: BookingPolicy;
  rentalPrice?: number;
}) {
  const advance =
    rentalPrice === undefined
      ? policy.advanceAmount
      : Math.min(policy.advanceAmount, rentalPrice);
  return (
    <Stack>
      <Heading>Platba a potvrzení rezervace</Heading>
      <Copy>
        Rezervační záloha činí {formatMoney(advance)} a započítává se do ceny
        pronájmu. Vratná kauce je samostatná částka.
      </Copy>
      {rentalPrice !== undefined ? (
        <Copy>
          Po uhrazení zálohy zbývá z nájemného{' '}
          {formatMoney(rentalPrice - advance)}. Před předáním je třeba uhradit
          celé nájemné a vratnou kauci.
        </Copy>
      ) : null}
      <Copy>
        Zálohu můžete uhradit bankovním převodem pomocí QR kódu nebo po domluvě
        osobně v hotovosti. Po přijetí zálohy rezervaci potvrdíme ručně. Samotné odeslání rezervace
        ani platby neznamená potvrzení.
      </Copy>
      <Copy>
        Případný storno poplatek až {formatMoney(policy.cancellation.feeAmount)}{' '}
        se posuzuje individuálně; neúčtuje se automaticky.
      </Copy>
    </Stack>
  );
}
function PaymentQr({ instructions }: { instructions: PaymentInstructions }) {
  const [image, setImage] = useState<{ payload: string; url: string } | null>(
    null
  );
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(instructions.qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 4,
      width: 256,
    }).then(
      url => {
        if (active) setImage({ payload: instructions.qrPayload, url });
      },
      () => {
        if (active) setImage(null);
      }
    );
    return () => {
      active = false;
    };
  }, [instructions.qrPayload]);
  return image?.payload === instructions.qrPayload ? (
    <Qr
      src={image.url}
      alt={`QR platba rezervační zálohy ${formatMoney(instructions.amount)}`}
    />
  ) : (
    <Copy>Pro platbu můžete použít níže uvedené bankovní údaje.</Copy>
  );
}
export function ReceiptPaymentInformation({ receipt }: { receipt: Receipt }) {
  const payment = receipt.payment;
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!receipt.expiresAt) return;
    const delay = Date.parse(receipt.expiresAt) - Date.now();
    if (delay <= 0) {
      if (now < Date.parse(receipt.expiresAt)) setNow(Date.now());
      return;
    }
    const timer = window.setTimeout(
      () => setNow(Date.now()),
      Math.min(delay + 1, 2147483647)
    );
    return () => clearTimeout(timer);
  }, [receipt.expiresAt, now]);
  if (!payment) return null;
  const expired = receipt.status === 'pending' && Boolean(receipt.expiresAt) &&
    Date.parse(receipt.expiresAt!) <= now;
  const instructions =
    receipt.status === 'pending' &&
    receipt.expiresAt &&
    Date.parse(receipt.expiresAt) > now
      ? payment.paymentInstructions
      : null;
  return (
    <Stack>
      <Heading>Platba rezervace</Heading>
      <Facts>
        <div>
          <dt>Rezervační záloha (součást nájemného)</dt>
          <dd>{formatMoney(payment.advanceRequired)}</dd>
        </div>
        <div>
          <dt>Zbývá uhradit ze zálohy</dt>
          <dd>{formatMoney(payment.advanceBalance)}</dd>
        </div>
        <div>
          <dt>Zbývá uhradit nájemné</dt>
          <dd>{formatMoney(payment.rentalBalance)}</dd>
        </div>
        <div>
          <dt>Požadovaná vratná kauce</dt>
          <dd>{formatMoney(payment.depositRequired)}</dd>
        </div>
        <div>
          <dt>Držená vratná kauce</dt>
          <dd>{formatMoney(payment.depositHeld)}</dd>
        </div>
      </Facts>
      {expired ? (
        <Copy role="status">
          Lhůta předběžné rezervace uplynula. Bez našeho potvrzení již termín není blokovaný.
          Neplaťte podle původního QR kódu. Pokud jste již zaplatili, kontaktujte
          nás s číslem rezervace; ověříme platbu a dostupnost termínu.
        </Copy>
      ) : instructions ? (
        <>
          <Heading>Úhrada rezervační zálohy</Heading>
          <Copy>
            Uhraďte {formatMoney(instructions.amount)} bankovním převodem. Před
            potvrzením platby zkontrolujte příjemce, částku a zprávu pro
            příjemce. Platbu odešlete co nejdříve, abychom ji mohli ověřit
            a rezervaci potvrdit před uvedeným koncem předběžné rezervace.
          </Copy>
          <PaymentQr instructions={instructions} />
          <Facts>
            <div>
              <dt>Příjemce</dt>
              <dd>{instructions.beneficiary}</dd>
            </div>
            <div>
              <dt>Číslo účtu</dt>
              <dd>{instructions.accountNumber}</dd>
            </div>
            <div>
              <dt>IBAN</dt>
              <dd>{instructions.iban}</dd>
            </div>
            <div>
              <dt>BIC</dt>
              <dd>{instructions.bic}</dd>
            </div>
            <div>
              <dt>Částka</dt>
              <dd>{formatMoney(instructions.amount)}</dd>
            </div>
            <div>
              <dt>Zpráva pro příjemce</dt>
              <dd>{instructions.message}</dd>
            </div>
          </Facts>
          <Copy>
            Po přijetí zálohy následuje ruční potvrzení rezervace. Vratnou kauci
            tento QR kód nezahrnuje. Pokud jste platbu již odeslali nebo uhradili
            v hotovosti, neplaťte znovu. Stav na této stránce se po našem
            potvrzení zatím automaticky neaktualizuje.
          </Copy>
        </>
      ) : receipt.status === 'pending' && payment.advanceBalance === 0 ? (
        <Copy>
          Rezervační záloha je podle posledního načteného stavu uhrazena.
          Rezervace čeká na ruční potvrzení.
        </Copy>
      ) : (
        <Copy>
          Pro tento stav rezervace nejsou k dispozici pokyny k úhradě zálohy.
          Neodesílejte platbu podle dřívějšího QR kódu.
        </Copy>
      )}
      <Copy>Částky a stav odpovídají poslednímu načtení rezervace.</Copy>
    </Stack>
  );
}
