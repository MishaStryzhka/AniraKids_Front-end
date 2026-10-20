import { formatMoney } from '../booking/bookingModel';
import type { PaymentConfirmation } from './paymentConfirmation';

export function PaymentConfirmationStatus({paymentReport: report, lastPayment}: PaymentConfirmation) {
  return <>
    {report?.status === 'pending' ? <p role="status">
      {report.kind === 'cash'
        ? `Klient zvolil platbu hotově při převzetí: ${formatMoney(report.amount)}. Čeká se na přijetí peněz. QR platba je nadále možná.`
        : `Klient oznámil odeslání platby ${formatMoney(report.amount)}. Čeká na ověření AniraKids.`}
    </p> : null}
    {lastPayment ? <p>
      Poslední potvrzená platba: {formatMoney(lastPayment.amount)} ·{' '}
      {lastPayment.method === 'cash' ? 'hotově' : lastPayment.method === 'card' ? 'kartou' : 'bankovním převodem'}
      {' · '}{new Date(lastPayment.recordedAt).toLocaleString('cs-CZ', {timeZone:'Europe/Prague'})}
    </p> : null}
  </>;
}
