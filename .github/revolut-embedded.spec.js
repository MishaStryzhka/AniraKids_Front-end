const {test,expect}=require('@playwright/test');
const {receiptPayment}=require('./payment-fixtures');
const APP=process.env.REVOLUT_TEST_APP||'http://127.0.0.1:4173',number='AK-2030-ABC123',token='a'.repeat(43);
const item={productId:'111111111111111111111111',variantId:'222222222222222222222222',productName:'Slavnostní šaty',size:'98',rentalPrice:500,deposit:1000};
async function fixture(page){
 const state={active:false,paid:false,creates:0,syncs:0,errors:[]};
 const receipt=()=>({reservationNumber:number,status:state.paid?'confirmed':'pending',rentalMode:'studio',startDate:'2030-10-24',endDate:'2030-10-24',expiresAt:state.paid?null:'2099-01-01T00:00:00Z',item,subtotal:500,deposit:1000,totalDue:1500,paymentStatus:'unpaid',payment:{...receiptPayment(number),advanceBalance:state.paid?0:200,rentalBalance:state.paid?300:500,paymentInstructions:state.paid||state.active?null:receiptPayment(number).paymentInstructions,cardPayment:{active:state.active,reviewRequired:false,kind:state.active?'advance':null}}});
 page.on('pageerror',e=>state.errors.push(e.message));
 await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP,async route=>{
  const req=route.request(),url=new URL(req.url()),p=url.pathname;
  const json=(body,status=200)=>route.fulfill({status,json:body});
  if(url.hostname==='sandbox-merchant.revolut.com'){
   if(p==='/version.js')return route.fulfill({contentType:'application/javascript',body:'window.__REV_PAY_VERSION__="fixture";'});
   return route.fulfill({contentType:'application/javascript',body:`window.RevolutCheckout=function(){};window.RevolutCheckout.embeddedCheckout=function(options){window.fixtureReturn=options.revolutPayOptions.mobileRedirectUrls.success;const button=document.createElement('button');button.textContent='Potvrdit testovací platbu';button.style.cssText='width:100%;min-height:48px';button.onclick=async function(){await options.createOrder();options.onSuccess({orderId:'untrusted-token'});};options.target.appendChild(button);return {destroy(){button.remove();}};};`});
  }
  if(p.endsWith('/payments/revolut/config'))return json({mode:'sandbox',publicKey:'pk_fixture'});
  if(p.endsWith('/revolut/create')){expect(req.headers().authorization).toBe('Reservation '+token);expect(req.postDataJSON()).toEqual({kind:'advance'});state.active=true;state.creates++;return json({publicId:'fixture-public-token'});}
  if(p.endsWith('/revolut/sync')){state.syncs++;return json({reservation:receipt()});}
  if(p.endsWith('/revolut/cancel')){state.active=false;return json({reservation:receipt()});}
  if(p.endsWith('/reservations/'+number))return json({reservation:receipt()});
  if(p.endsWith('/site-settings'))return json({sections:{girlsDresses:true,womenDresses:true,suits:false,familyLooks:false}});
  if(p==='/gsi/client')return route.fulfill({contentType:'application/javascript',body:''});
  return json({items:[]});
 });return state;
}
for(const width of [375,390,430,768,1024,1440])test('embedded payment stays on site and trusts server at '+width,async({page})=>{
 const state=await fixture(page);await page.setViewportSize({width,height:1000});
 await page.goto(APP+'/stav-rezervace#'+new URLSearchParams({reservation:number,token}));
 await page.getByRole('button',{name:/Zaplatit online/}).click();
 await expect(page.getByRole('button',{name:'Potvrdit testovací platbu'})).toBeVisible();
 expect(state.creates).toBe(1);expect(page.url()).toContain('/stav-rezervace#');
 await expect(page.getByRole('img',{name:/QR platba/})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Platbu jsem odeslal/a'})).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 if(width===390)await page.screenshot({path:'test-evidence/revolut/390.png',fullPage:true});
 await page.getByRole('button',{name:'Potvrdit testovací platbu'}).click();
 await expect(page.getByText(/Platba zatím není dokončena/)).toBeVisible();expect(state.syncs).toBe(1);
 const returnUrl=await page.evaluate(()=>window.fixtureReturn);expect(returnUrl).not.toContain(token);
 // Mobile return restores guest authorization from session; URL flags cannot mark paid.
 await page.goto(returnUrl+'&_rp_oid=fake&_rp_s=true');
 await expect(page.getByRole('button',{name:'Potvrdit testovací platbu'})).toBeVisible();
 expect(state.paid).toBe(false);
 state.active=false;state.paid=true;
 await page.getByRole('button',{name:'Ověřit platbu',exact:true}).click();
 await expect(page.getByRole('button',{name:'Potvrdit testovací platbu'})).toHaveCount(0);
 await expect(page.getByText('Stav: Potvrzená',{exact:true})).toBeVisible();
 expect(state.errors).toEqual([]);
});
