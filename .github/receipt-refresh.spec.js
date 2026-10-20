const {test,expect}=require('@playwright/test');
const APP='http://127.0.0.1:4173',number='AK-2030-ABC123',token='a'.repeat(43);
const bank={beneficiary:'GlamGarb Rentals s.r.o.',accountNumber:'6644781399/0800',iban:'CZ0708000000006644781399',bic:'GIBACZPX'};
const instructions=amount=>({...bank,amount,currency:'CZK',message:number,qrPayload:`SPD*1.0*ACC:${bank.iban}*AM:${amount.toFixed(2)}*CC:CZK*MSG:${number}*PT:IP`});
const item={productId:'111111111111111111111111',variantId:'222222222222222222222222',productName:'Dámské šaty DAM003',size:'S-M-L',rentalPrice:900,deposit:2000};
const original={reservationNumber:number,status:'pending',rentalMode:'external',startDate:'2030-10-25',endDate:'2030-10-25',expiresAt:'2099-01-01T00:00:00Z',item,subtotal:900,deposit:2000,totalDue:2900,paymentStatus:'unpaid',guestAccessToken:token,payment:{advanceRequired:200,advanceBalance:200,rentalBalance:900,depositRequired:2000,depositHeld:0,paymentInstructions:instructions(200),fullPaymentInstructions:instructions(2900)}};
for(const width of [390,768,1440])test('guest receipt refreshes after F5, focus and polling; stale QR stays hidden '+width,async({page})=>{
 await page.clock.install({time:new Date('2030-10-20T12:00:00Z')});
 await page.setViewportSize({width,height:1000});
 let current=structuredClone(original),reads=0,fail=false,release;
 let gate=new Promise(r=>{release=r;});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(receipt=>{if(!sessionStorage.getItem('anirakids.booking.v1'))sessionStorage.setItem('anirakids.booking.v1',JSON.stringify({version:1,kind:'receipt',receipt}));},original);
 await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP,async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;
  if(path.endsWith('/reservations/'+number)){
   reads++;expect(req.headers().authorization).toBe('Reservation '+token);await gate;
   if(fail)return route.fulfill({status:503,json:{error:{code:'UNAVAILABLE'}}});
   return route.fulfill({json:{reservation:current}});
  }
  if(path==='/gsi/client')return route.fulfill({contentType:'application/javascript',body:''});
  return route.fulfill({json:{items:[],sections:{girlsDresses:true,womenDresses:true,suits:false,familyLooks:false}}});
 });
 await page.goto(APP+'/rezervace');await expect.poll(()=>reads).toBe(1);
 await expect(page.getByRole('img',{name:'QR platba 200 Kč'})).toHaveCount(0);
 release();await expect(page.getByRole('img',{name:'QR platba 200 Kč'})).toBeVisible();
 current={...current,subtotal:700,totalDue:2700,fittingDiscount:{number:'ZK-ABCDEF123456',amount:200},payment:{...current.payment,advanceBalance:0,rentalBalance:700,paymentInstructions:null,fullPaymentInstructions:instructions(2700)}};
 await page.reload();await expect(page.getByRole('img',{name:'QR platba 2 700 Kč'})).toBeVisible();
 await expect(page.getByRole('img',{name:'QR platba 200 Kč'})).toHaveCount(0);
 await expect(page.getByRole('option',{name:/Povinná záloha/})).toHaveCount(0);
 expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('anirakids.booking.v1')).receipt.subtotal)).toBe(700);
 current={...current,status:'confirmed',expiresAt:null};await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await expect(page.getByText('Stav: Potvrzená',{exact:true})).toBeVisible();
 current={...current,status:'prepared'};await page.clock.runFor(30001);
 await expect(page.getByText('Stav: Připravená',{exact:true})).toBeVisible();
 fail=true;await page.reload();await expect(page.getByRole('alert').filter({hasText:'Aktuální stav se nepodařilo ověřit'})).toBeVisible();
 await expect(page.getByRole('img',{name:/QR platba/})).toHaveCount(0);
 fail=false;await page.getByRole('button',{name:'Aktualizovat stav rezervace',exact:true}).click();
 await expect(page.getByRole('img',{name:'QR platba 2 700 Kč'})).toBeVisible();
 await page.screenshot({path:`test-evidence/receipt-refresh/guest-${width}.png`,fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);expect(errors).toEqual([]);
});
