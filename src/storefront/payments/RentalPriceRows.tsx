import type { Receipt } from '../api/publicApi';
import { formatMoney } from '../booking/bookingModel';

export function RentalPriceRows({ rentalPrice, discount }: {
  rentalPrice: number;
  discount?: Receipt['fittingDiscount'];
}) {
  return <>
    <div>
      <dt>Cena pronájmu</dt>
      <dd>{formatMoney(rentalPrice + (discount?.amount ?? 0))}</dd>
    </div>
    {discount ? <div>
      <dt>Započtená platba za zkoušku {discount.number}</dt>
      <dd>−{formatMoney(discount.amount)}</dd>
    </div> : null}
  </>;
}
