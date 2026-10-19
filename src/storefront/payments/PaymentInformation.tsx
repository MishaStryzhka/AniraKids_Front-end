import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { SelectField } from '../../design-system/components/SelectField';
import styled from 'styled-components';
import type { BookingPolicy, PaymentInstructions } from '../api/bookingPolicy';
import type { Receipt } from '../api/publicApi';
import { Copy, Facts, Heading, Stack } from '../storefrontStyles';
import { formatMoney } from '../booking/bookingModel';
import { RentalPriceRows } from './RentalPriceRows';
const PaymentFacts = styled(Facts)`
  > div { display: grid; grid-template-columns: minmax(0, 1fr) max-content; }
  dd { white-space: nowrap; }
`;
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
  hasDeposit = true,
  fittingCredit = 0,
}: {
  policy: BookingPolicy;
  rentalPrice?: number;
  hasDeposit?: boolean;
  fittingCredit?: number;
}) {
  const advance =
    rentalPrice === undefined
      ? policy.advanceAmount
      : Math.min(policy.advanceAmount, rentalPrice);
  return (
    <Stack>
      <Heading>Platba a potvrzení rezervace</Heading>
      <Copy>
        {fittingCredit > 0
          ? `Zaplacenou zkoušku ${formatMoney(fittingCredit)} započteme jako rezervační zálohu. Zálohu znovu neplatíte.`
          : `Rezervační záloha činí ${formatMoney(advance)} a započítává se do ceny pronájmu.`}
        {hasDeposit ? ' Vratná kauce je samostatná částka.' : ''}
      </Copy>
      {rentalPrice !== undefined ? (
        <Copy>
          {fittingCredit > 0 ? 'Po započtení zkoušky zbývá doplatit ' : 'Po uhrazení zálohy zbývá z nájemného '}
          {formatMoney(fittingCredit > 0 ? rentalPrice : rentalPrice - advance)}. Před předáním je třeba uhradit
          celé nájemné{hasDeposit ? ' a vratnou kauci' : ''}.
        </Copy>
      ) : null}
      <Copy>
        {fittingCredit > 0 ? 'Po vytvoření rezervace můžete doplatek uhradit QR platbou nebo při převzetí.' : `Po vytvoření rezervace si vyberete QR platbu povinné zálohy, nebo celé částky${hasDeposit ? ' včetně vratné kauce' : ''}. Záloha se při plné platbě nepřičítá navíc. Zbytek můžete doplatit QR platbou nebo hotově při převzetí. Zálohu lze po domluvě uhradit také osobně v hotovosti.`}
        Po přijetí zálohy rezervaci potvrdíme ručně. Samotné odeslání rezervace
        ani platby neznamená potvrzení.
      </Copy>
      <Copy>Platbu 200 Kč za absolvovanou zkoušku můžete započíst jako zálohu při rezervaci přes svůj účet nebo osobní odkaz z e-mailu. Pokud jste ji nezapočetli, kontaktujte nás. Doplatek na místě lze uhradit také kartou.</Copy>
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
      alt={`QR platba ${formatMoney(instructions.amount)}`}
    />
  ) : (
    <Copy>Pro platbu můžete použít níže uvedené bankovní údaje.</Copy>
  );
}
export function ReceiptPaymentInformation({ receipt, showRentalPrice = true }: { receipt: Receipt; showRentalPrice?: boolean }) {
  const payment = receipt.payment;
  const [now, setNow] = useState(Date.now);
  const [choice, setChoice] = useState('advance');
  useEffect(() => {
    setChoice('advance');
  }, [receipt.reservationNumber, payment?.advanceBalance, payment?.rentalBalance, payment?.depositHeld]);
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
  const payable = (receipt.status === 'pending' && Boolean(receipt.expiresAt) &&
    Date.parse(receipt.expiresAt!) > now) ||
    receipt.status === 'confirmed' || receipt.status === 'prepared';
  const advanceInstructions = payable && receipt.status === 'pending' ? payment.paymentInstructions : null;
  const fullInstructions = payable ? payment.fullPaymentInstructions : null;
  const cash = choice === 'cash' && payment.advanceBalance === 0 && Boolean(fullInstructions);
  const selected = cash ? 'cash' : choice === 'advance' && advanceInstructions ? 'advance' : 'full';
  const instructions = cash ? null : selected === 'advance' ? advanceInstructions : fullInstructions;
  const hasDeposit = payment.depositRequired > 0 || payment.depositHeld > 0;
  const remaining = payment.rentalBalance + payment.depositRequired - payment.depositHeld;
  return (
    <Stack>
      <Heading>Platba rezervace</Heading>
      <PaymentFacts>
        {showRentalPrice ? <RentalPriceRows rentalPrice={receipt.subtotal} discount={receipt.fittingDiscount} /> : null}
        <div>
          <dt>Rezervační záloha (součást nájemného)</dt>
          <dd>{formatMoney(payment.advanceRequired)}{receipt.fittingDiscount && payment.advanceBalance === 0 ? ' · uhrazeno' : ''}</dd>
        </div>
        {payment.advanceBalance > 0 && payment.advanceBalance < payment.advanceRequired ? <div>
          <dt>Zbývá uhradit ze zálohy</dt>
          <dd>{formatMoney(payment.advanceBalance)}</dd>
        </div> : null}
        {receipt.fittingDiscount || payment.rentalBalance !== receipt.subtotal ? <div>
          <dt>Zbývá uhradit nájemné</dt>
          <dd>{formatMoney(payment.rentalBalance)}</dd>
        </div> : null}
        {payment.depositRequired > payment.depositHeld ? <div>
          <dt>Požadovaná vratná kauce</dt>
          <dd>{formatMoney(payment.depositRequired)}</dd>
        </div> : null}
        {payment.depositHeld > 0 ? <div>
          <dt>Přijatá vratná kauce</dt>
          <dd>{formatMoney(payment.depositHeld)}</dd>
        </div> : null}
      </PaymentFacts>
      {payable && (advanceInstructions || fullInstructions) ? (
        <SelectField label="Jak chcete zaplatit?" value={selected}
          onChange={event => setChoice(event.target.value)}>
          {advanceInstructions ? <option value="advance">
            Povinná záloha – {formatMoney(advanceInstructions.amount)}
          </option> : null}
          {fullInstructions ? <option value="full">
            {payment.advanceBalance > 0 ? (hasDeposit ? 'Vše včetně kauce' : 'Celé nájemné') : (hasDeposit ? 'Doplatit včetně kauce' : 'Doplatit nájemné')} – {formatMoney(fullInstructions.amount)}
          </option> : null}
          {fullInstructions && payment.advanceBalance === 0 ? <option value="cash">
            Hotově při převzetí
          </option> : null}
        </SelectField>
      ) : null}
      {expired ? (
        <Copy role="status">
          Lhůta předběžné rezervace uplynula. Bez našeho potvrzení již termín není blokovaný.
          Neplaťte podle původního QR kódu. Pokud jste již zaplatili, kontaktujte
          nás s číslem rezervace; ověříme platbu a dostupnost termínu.
        </Copy>
      ) : cash ? (
        <Copy role="status">
          Zbývá doplatit {formatMoney(remaining)} hotově při převzetí{hasDeposit ? `: nájemné ${formatMoney(payment.rentalBalance)} a vratná kauce ${formatMoney(payment.depositRequired - payment.depositHeld)}` : ''}.
        </Copy>
      ) : instructions ? (
        <>
          <Heading>{selected === 'advance' ? 'Úhrada rezervační zálohy' : (hasDeposit ? 'Úhrada nájemného a vratné kauce' : 'Úhrada nájemného')}</Heading>
          <Copy role="status">
            {selected === 'advance'
              ? `Po úhradě zálohy zbývá ${formatMoney(remaining - instructions.amount)}${hasDeposit ? ' včetně kauce' : ''}. Zbytek lze doplatit hotově při převzetí nebo QR platbou po zaevidování zálohy.`
              : `Částka zahrnuje zbývající nájemné ${formatMoney(payment.rentalBalance)}${hasDeposit ? ` a vratnou kauci ${formatMoney(payment.depositRequired - payment.depositHeld)}` : ''}. Záloha je již součástí nájemného.`}
          </Copy>
          <Copy>
            Uhraďte {formatMoney(instructions.amount)} bankovním převodem. Před
            potvrzením platby zkontrolujte příjemce, částku a zprávu pro
            příjemce.
            {receipt.status === 'pending' ? ' Platbu odešlete co nejdříve, abychom ji mohli ověřit a rezervaci potvrdit před uvedeným koncem předběžné rezervace.' : ' Doplatek je třeba uhradit před předáním oděvu.'}
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
            Platby ověřujeme a evidujeme ručně. Pokud jste již zaplatili,
            neodesílejte další platbu ani neměňte QR na vyšší částku.
            Nejprve aktualizujte stav rezervace a vyčkejte na zaevidování platby.
            Samotné zobrazení QR kódu ani volba hotovosti neznamenají zaplacení.
          </Copy>
        </>
      ) : payable && remaining === 0 ? (
        <Copy role="status">{hasDeposit ? 'Nájemné a vratná kauce jsou podle posledního načteného stavu uhrazeny.' : 'Nájemné je podle posledního načteného stavu uhrazeno.'}</Copy>
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
    </Stack>
  );
}
