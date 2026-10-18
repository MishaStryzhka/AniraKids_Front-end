import type { Availability } from '../storefront/api/publicApi';
export function discountQuotes(items: Availability[]): Availability[] {
  const eligible = items
    .map((item, index) => ({ item, index }))
    .filter(v => v.item.additionalDressDiscount === 20);
  const full = eligible.reduce(
    (best, v) =>
      !best || v.item.pricing.rentalPrice > best.item.pricing.rentalPrice
        ? v
        : best,
    undefined as (typeof eligible)[number] | undefined
  )?.index;
  return items.map((item, index) => {
    if (item.additionalDressDiscount !== 20 || index === full) return item;
    const rentalPrice = Math.round(item.pricing.rentalPrice * 0.8);
    return {
      ...item,
      pricing: {
        ...item.pricing,
        rentalPrice,
        totalDue: rentalPrice + item.pricing.deposit,
      },
    };
  });
}
