export interface PaymentOptions {gateway:'off'|'revolut';qrEnabled:boolean;defaultMethod:'online'|'qr';}
export function parsePaymentOptions(value:unknown):PaymentOptions|undefined {
 if(value===undefined)return undefined;
 const v=value as PaymentOptions;
 if(!v||!['off','revolut'].includes(v.gateway)||typeof v.qrEnabled!=='boolean'||!['online','qr'].includes(v.defaultMethod))throw new Error('Invalid payment options');
 return {gateway:v.gateway,qrEnabled:v.qrEnabled,defaultMethod:v.defaultMethod};
}
