export type FittingDiscountSelection={number:string;token?:string};
export function validFittingDiscount(v:unknown):v is FittingDiscountSelection {
 const d=v as FittingDiscountSelection;return !!d&&typeof d==='object'&&/^ZK-[A-F0-9]{12}$/.test(d.number)&&(d.token===undefined||(typeof d.token==='string'&&/^[a-f0-9]{64}$/.test(d.token)));
}
