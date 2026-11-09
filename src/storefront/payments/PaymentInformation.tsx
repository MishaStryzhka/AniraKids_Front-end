import {RevolutPayment} from './RevolutPayment';
import {getRevolutConfig,type RevolutConfig} from '../api/publicApi';
import { cancellationSummary } from './rentalPolicyCopy';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { SelectField } from '../../design-system/components/SelectField';
import styled from 'styled-components';
import {designTokens as t} from '../../design-system/tokens/designTokens';
import type { BookingPolicy, PaymentInstructions } from '../api/bookingPolicy';
import { getAccountReservationStatus, getReservationStatus, reportReservationPayment, type Receipt, type ReservationPaymentAccess } from '../api/publicApi';
import { Button } from '../../design-system/components/Button';
import { PaymentConfirmationStatus } from './PaymentConfirmationStatus';
import { Copy, Facts, Heading, Stack } from '../storefrontStyles';
import { formatMoney } from '../booking/bookingModel';
import { RentalPriceRows } from './RentalPriceRows';
const BookingDetails=styled.details`
  border-top:1px solid ${t.color.border.subtle};
  summary{display:list-item;cursor:pointer;min-height:44px;padding:12px 0;color:${t.color.text.brand};font-weight:600;font-size:14px;}
  summary:focus-visible{outline:2px solid ${t.color.focus.ring};outline-offset:3px;}
  > div{padding:4px 0 12px;font-size:14px;line-height:1.6;}
`;
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
  company, compact=false,
}: {
  compact?:boolean;
  company: BookingPolicy['company'];
}) {
  if(compact)return <BookingDetails><summary>Údaje o provozovateli</summary><div>{company.name} · IČO {company.ico}<br/>{company.address}<br/>{company.register}<br/>Nejsme plátci DPH.</div></BookingDetails>;
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
  delivery = 0,
}: {
  policy: BookingPolicy;
  rentalPrice?: number;
  hasDeposit?: boolean;
  fittingCredit?: number;
  delivery?: number;
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
          {fittingCredit > 0 ? 'Po započtení zkoušky zbývá doplatit ' : delivery ? 'Po uhrazení zálohy zbývá za pronájem a dopravu ' : 'Po uhrazení zálohy zbývá z nájemného '}
          {formatMoney((fittingCredit > 0 ? rentalPrice : rentalPrice - advance)+delivery)}. Před předáním je třeba uhradit
          celé nájemné{delivery ? ' a dopravu' : ''}{hasDeposit ? ' a vratnou kauci' : ''}.
        </Copy>
      ) : null}
      <BookingDetails><summary>Podrobnosti platby a storna</summary><Stack>
      <Copy>
        Po vytvoření rezervace si vyberete z dostupných způsobů platby. Zaplatit můžete zálohu nebo celou částku; záloha se při plné platbě nepřičítá navíc. Online platbu ověříme automaticky a platnou rezervaci potvrdíme po kontrole dostupnosti. Převod a hotovost ověřuje administrátor.
      </Copy>
      <Copy>Po absolvování zaplacené zkoušky můžete při rezervaci uplatnit slevu ve výši 200 Kč přes svůj účet nebo osobní odkaz z e-mailu. Pokud jste slevu neuplatnili, kontaktujte nás. Doplatek na místě lze uhradit také kartou.</Copy>
      <Copy>{cancellationSummary}</Copy>
      </Stack></BookingDetails>
    </Stack>
  );
}
export function PaymentQr({ instructions }: { instructions: PaymentInstructions }) {
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
export function ReceiptPaymentInformation({ receipt: source, showRentalPrice = true, access, onUpdated }: {
  receipt: Receipt; showRentalPrice?: boolean; access?: ReservationPaymentAccess; onUpdated?: () => void;
}) {
  const [updated, setUpdated] = useState<{source:Receipt;token?:string;receipt:Receipt}|null>(null);
  const receipt = updated?.source === source && updated.token === access?.token ? updated.receipt : source;
  const request = useRef<AbortController|null>(null);
  const attempt = useRef<{operationId:string;kind:'advance'|'full'|'cash';amount:number}|null>(null);
  const [busy,setBusy] = useState(false), [error,setError] = useState('');
  useEffect(() => {
    setBusy(false); setError(''); attempt.current = null;
    return () => {request.current?.abort();request.current = null;};
  }, [source.reservationNumber,access?.token]);
  const update = async (kind?:'advance'|'full'|'cash', amount?:number) => {
    if (!access || request.current) return;
    const controller = new AbortController(); request.current = controller;
    setBusy(true); setError('');
    try {
      let next: Receipt;
      if (kind && amount) {
        if (attempt.current?.kind !== kind || attempt.current.amount !== amount)
          attempt.current = {operationId:crypto.randomUUID(),kind,amount};
        next = await reportReservationPayment(receipt.reservationNumber,access,attempt.current,controller.signal);
      } else {
        next = await (access.kind === 'guest' ? getReservationStatus : getAccountReservationStatus)(
          receipt.reservationNumber,access.token,controller.signal);
      }
      if (!controller.signal.aborted) {
        setUpdated({source,token:access.token,receipt:next});
        onUpdated?.();
      }
    } catch {
      if (!controller.signal.aborted) setError('Výsledek se nepodařilo ověřit. Aktualizujte stav platby před dalším pokusem. Peníze znovu neposílejte.');
    } finally {
      if (request.current === controller) {request.current = null;setBusy(false);}
    }
  };
  const [cardConfig,setCardConfig]=useState<RevolutConfig|null>(null);
  const [cardSelected,setCardSelected]=useState<{balanceKey:string;kind:'advance'|'full'}|null>(null);
  useEffect(()=>{
    const controller=new AbortController();
    void getRevolutConfig(controller.signal).then(setCardConfig,()=>{});
    return ()=>controller.abort();
  },[]);
  useEffect(()=>{setCardSelected(null);},[source.reservationNumber,access?.token]);
  const payment = receipt.payment;
  const [now, setNow] = useState(Date.now);
  const [choice, setChoice] = useState('advance');
  const [method,setMethod]=useState<'online'|'qr'|null>(null);
  useEffect(()=>setMethod(null),[source.reservationNumber,access?.token]);
  useEffect(() => {
    setChoice(payment?.paymentReport?.kind === 'cash' && payment.paymentReport.status === 'pending' ? 'cash' : 'advance');
  }, [receipt.reservationNumber, payment?.advanceBalance, payment?.rentalBalance, payment?.depositHeld, payment?.paymentReport?.kind, payment?.paymentReport?.status]);
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
  const advanceAmount=payable&&receipt.status==='pending'?payment.advanceBalance:0;
  const fullAmount=payable?payment.rentalBalance+Math.max(0,payment.depositRequired-payment.depositHeld):0;
  const qrEnabled=payment.paymentOptions?.qrEnabled!==false;
  const onlineEnabled=payment.paymentOptions?.gateway!=='off';
  const selectedMethod=method??payment.paymentOptions?.defaultMethod??'qr';
  const cash = choice === 'cash' && payment.advanceBalance === 0 && fullAmount>0;
  const selected = cash ? 'cash' : choice === 'advance' && advanceAmount>0 ? 'advance' : 'full';
  const instructions = cash ? null : selected === 'advance' ? advanceInstructions : fullInstructions;
  const hasDeposit = payment.depositRequired > 0 || payment.depositHeld > 0;
  const remaining = payment.rentalBalance + Math.max(0,payment.depositRequired - payment.depositHeld);
  // A webhook can update the receipt after the SDK callback. Never carry the
  // customer's advance-payment selection over to a new balance payment.
  const balanceKey=JSON.stringify([receipt.reservationNumber,access?.token,payment.advanceBalance,payment.rentalBalance,payment.depositHeld]);
  const selectedCard=cardSelected?.balanceKey===balanceKey?cardSelected:null;
  const cardOpen=Boolean(access && (selectedCard || payment.cardPayment?.active));
  const pendingTransfer = payment.paymentReport?.status === 'pending' && payment.paymentReport.kind !== 'cash';
  const cashPlanned = payment.paymentReport?.status === 'pending' && payment.paymentReport.kind === 'cash';
  return (
    <Stack>
      <Heading>Platba rezervace</Heading>
      <PaymentFacts>
        {showRentalPrice ? <RentalPriceRows rentalPrice={receipt.subtotal-(receipt.shippingPrice||0)} discount={receipt.fittingDiscount} /> : null}
        <div>
          <dt>Rezervační záloha (součást nájemného)</dt>
          <dd>{formatMoney(payment.advanceRequired)}{payment.advanceRequired > 0 && payment.advanceBalance === 0 ? ' · uhrazeno' : ''}</dd>
        </div>
        {payment.advanceBalance > 0 && payment.advanceBalance < payment.advanceRequired ? <div>
          <dt>Zbývá uhradit ze zálohy</dt>
          <dd>{formatMoney(payment.advanceBalance)}</dd>
        </div> : null}
        {showRentalPrice && (receipt.shippingPrice||0)>0 ? <div><dt>Doprava</dt><dd>{formatMoney(receipt.shippingPrice!)}</dd></div> : null}
        {receipt.fittingDiscount || payment.rentalBalance !== receipt.subtotal ? <div>
          <dt>{receipt.shippingPrice ? 'Zbývá uhradit pronájem a dopravu' : 'Zbývá uhradit nájemné'}</dt>
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
      <PaymentConfirmationStatus {...payment} />
      {payable && !pendingTransfer && (advanceAmount>0 || fullAmount>0) ? (
        <SelectField label="Jak chcete zaplatit?" value={selected}
          disabled={busy || cardOpen}
          onChange={event => setChoice(event.target.value)}>
          {advanceAmount>0 ? <option value="advance">
            Povinná záloha – {formatMoney(advanceAmount)}
          </option> : null}
          {fullAmount>0 ? <option value="full">
            {payment.advanceBalance > 0 ? (hasDeposit ? 'Vše včetně kauce' : 'Celé nájemné') : (hasDeposit ? 'Doplatit včetně kauce' : 'Doplatit nájemné')} – {formatMoney(fullAmount)}
          </option> : null}
          {fullAmount>0 && payment.advanceBalance === 0 ? <option value="cash">
            Hotově při převzetí
          </option> : null}
        </SelectField>
      ) : null}
      {payment.paymentOptions && payable && !cardOpen && !pendingTransfer && !cash && !payment.cardPayment?.reviewRequired ?
       <SelectField label="Způsob platby" value={selectedMethod} disabled={busy} onChange={e=>setMethod(e.target.value as 'online'|'qr')}>
        {onlineEnabled?<option value="online">Online platba</option>:null}
        {qrEnabled?<option value="qr">Bankovní převod s QR kódem</option>:null}
       </SelectField>:null}
      {payable && selectedMethod==='online' && onlineEnabled && !cardConfig && !cardOpen ? <Copy role="status">Online platba momentálně není dostupná. Obnovte stránku{qrEnabled?' nebo zvolte QR převod':', případně nás kontaktujte'}.</Copy>:null}
      {payment.cardPayment?.reviewRequired ? <Copy role="alert">Platbu jsme přijali, ale potřebujeme ji zkontrolovat. Další platbu neposílejte; kontaktujte nás s číslem rezervace.</Copy> : null}
      {cardOpen && access ? <RevolutPayment number={receipt.reservationNumber} access={access}
        kind={payment.cardPayment?.kind ?? selectedCard?.kind ?? (selected==='advance'?'advance':'full')}
        config={cardConfig} canPay={payable && !payment.cardPayment?.reviewRequired}
        onReceipt={next=>{setUpdated({source,token:access.token,receipt:next});}}
        onClose={()=>{setCardSelected(null);onUpdated?.();}} /> : null}
      {!cardOpen && !payment.cardPayment?.reviewRequired && access && cardConfig && onlineEnabled && (!payment.paymentOptions||selectedMethod==='online') && payable && !pendingTransfer && !cash && (selected==='advance'?advanceAmount:fullAmount)>0 ?
        <Button disabled={busy} onClick={()=>setCardSelected({balanceKey,kind:selected==='advance'?'advance':'full'})}>Zaplatit online – {formatMoney(selected==='advance'?advanceAmount:fullAmount)}</Button> : null}
      {cardOpen || payment.cardPayment?.reviewRequired ? null : expired ? (
        <Copy role="status">
          Lhůta předběžné rezervace uplynula. Bez našeho potvrzení již termín není blokovaný.
          Neplaťte podle původního QR kódu. Pokud jste již zaplatili, kontaktujte
          nás s číslem rezervace; ověříme platbu a dostupnost termínu.
        </Copy>
      ) : pendingTransfer ? (
        <Copy>Platbu ověří AniraKids. Oznámení samo o sobě neznamená přijetí peněz ani potvrzení rezervace.</Copy>
      ) : cash ? (
        <Copy role="status">
          Zbývá doplatit {formatMoney(remaining)} hotově při převzetí{hasDeposit ? `: nájemné ${formatMoney(payment.rentalBalance)} a vratná kauce ${formatMoney(payment.depositRequired - payment.depositHeld)}` : ''}.
        </Copy>
      ) : payment.paymentOptions && selectedMethod==='online' ? null : qrEnabled && instructions ? (
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
      {access && !cardOpen && !payment.cardPayment?.reviewRequired && payable && !pendingTransfer && (cash ? fullAmount>0 : qrEnabled&&selectedMethod==='qr'&&instructions) ? (
        <Button disabled={busy || (cash && cashPlanned)} loading={busy}
          onClick={() => void update(cash ? 'cash' : selected === 'advance' ? 'advance' : 'full',
            cash ? fullAmount : instructions!.amount)}>
          {cash ? (cashPlanned ? 'Platba při převzetí je domluvena' : 'Zaplatím hotově při převzetí') : 'Platbu jsem odeslal/a'}
        </Button>
      ) : null}
      {error ? <Copy role="alert">{error}</Copy> : null}
      {access && !cardOpen ? <Button variant="secondary" disabled={busy} onClick={() => void update()}>Aktualizovat stav platby</Button> : null}
    </Stack>
  );
}
