export function invoiceAutomationMessage(value:unknown):string {
 if(!value||typeof value!=='object')return '';
 const v=value as {status?:string;emailStatus?:string;number?:string};
 if(v.status==='not_queued')return '';
 if(v.status==='issued'&&v.emailStatus==='sent')return ` Faktura ${v.number||''} byla vystavena a předána k odeslání.`;
 if(v.status==='issued')return ` Faktura ${v.number||''} je vystavena. Odeslání ověřte v části Faktury.`;
 return ' Platba zůstává potvrzena. Vystavení faktury je nutné dokončit v části Faktury.';
}
