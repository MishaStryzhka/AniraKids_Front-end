export type PaymentReport = {
  kind: 'advance' | 'full' | 'cash';
  amount: number;
  reportedAt: string;
  status: 'pending' | 'confirmed';
  pendingRental: number;
  pendingDeposit: number;
};
export type LastPayment = {
  amount: number;
  method: 'bank_transfer' | 'cash' | 'card';
  recordedAt: string;
};
export type PaymentConfirmation = {
  paymentReport?: PaymentReport | null;
  lastPayment?: LastPayment | null;
};
const object = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));
const amount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const instant = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
export function parsePaymentConfirmation(value: Record<string, unknown>, invalid: () => never): PaymentConfirmation {
  const report = value.paymentReport, last = value.lastPayment;
  if (report != null && (!object(report) ||
      !['advance','full','cash'].includes(report.kind as string) || !amount(report.amount) || report.amount === 0 ||
      !instant(report.reportedAt) || !['pending','confirmed'].includes(report.status as string) ||
      !amount(report.pendingRental) || !amount(report.pendingDeposit) ||
      report.pendingRental + report.pendingDeposit > report.amount ||
      (report.status === 'confirmed') !== (report.pendingRental + report.pendingDeposit === 0))) return invalid();
  if (last != null && (!object(last) || !amount(last.amount) || last.amount === 0 ||
      !['bank_transfer','cash','card'].includes(last.method as string) || !instant(last.recordedAt))) return invalid();
  return {
    ...(report === undefined ? {} : {paymentReport:report as PaymentReport | null}),
    ...(last === undefined ? {} : {lastPayment:last as LastPayment | null}),
  };
}
