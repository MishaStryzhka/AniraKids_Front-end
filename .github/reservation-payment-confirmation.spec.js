const {test,expect}=require('@playwright/test');
const {policy}=require('./payment-fixtures');
const APP='http://127.0.0.1:4173', number='AK-2030-ABC123', id='555555555555555555555555';
async function paymentPushDestination(type){
  // Replay the deployed worker's push + click handlers without contacting a push
  // provider; the resulting URL is then opened in the real browser UI below.
  const handlers={};let notification,destination,work;
  const self={location:{origin:APP},addEventListener:(name,handler)=>{handlers[name]=handler;},
    registration:{showNotification:async(_title,options)=>{notification=options;}},
    clients:{matchAll:async()=>[],openWindow:async url=>{destination=url;}}};
  require('node:vm').runInNewContext(require('node:fs').readFileSync(require('node:path').join(__dirname,'../public/admin-push-sw.js'),'utf8'),{self,URL});
  handlers.push({data:{json:()=>({type,reservationId:id})},waitUntil:promise=>{work=promise;}});await work;
  handlers.notificationclick({notification:{close(){},data:notification.data},waitUntil:promise=>{work=promise;}});await work;
  expect(destination).toBe(APP+'/admin/rezervace/'+id);
  return destination;
}
const instructions=amount=>({...policy.bank,amount,currency:'CZK',message:number,
  qrPayload:`SPD*1.0*ACC:${policy.bank.iban}*AM:${amount.toFixed(2)}*CC:CZK*MSG:${number}*PT:IP`});
async function fixture(page,{signedIn=true}={}){
  const state={role:'customer',paid:0,revision:0,report:null,entries:[],writes:[],errors:[],failReport:false};
  const customer={firstName:'Jana',lastName:'Nová',email:'fixture@example.test',phone:'+420777111222'};
  const item={productId:'111111111111111111111111',variantId:'222222222222222222222222',
    productName:'Dámské šaty DAM006',size:'S-M-L',rentalPrice:800,deposit:0};
  const payment=()=>({
    reservationId:id,revision:state.revision,currency:'CZK',legacyUnreconciled:false,
    advanceRequired:200,advanceBalance:0,fittingCredit:200,rentalTotal:600,
    rentalReceived:state.paid,rentalRefunded:0,rentalNet:state.paid,rentalBalance:600-state.paid,
    depositRequired:0,depositReceived:0,depositRefunded:0,depositHeld:0,cancellationFee:0,refundableRental:state.paid,
    entries:state.entries,paymentInstructions:null,fullPaymentInstructions:state.paid===600?null:instructions(600-state.paid),
    paymentReport:state.report?{...state.report,status:state.paid===600?'confirmed':'pending',pendingRental:600-state.paid,pendingDeposit:0}:null,
    lastPayment:state.entries.length?{amount:state.entries.at(-1).amount,method:state.entries.at(-1).method,recordedAt:state.entries.at(-1).recordedAt}:null,
  });
  const receipt=()=>({reservationNumber:number,status:'confirmed',rentalMode:'studio',
    startDate:'2030-10-24',endDate:'2030-10-24',expiresAt:null,item,subtotal:600,deposit:0,totalDue:600,
    paymentStatus:state.paid===600?'paid':'unpaid',fittingDiscount:{number:'ZK-ABCDEF123456',amount:200},payment:payment()});
  const record=input=>{
    state.writes.push(input);state.paid+=input.amount;state.revision++;
    state.entries.push({...input,recordedAt:'2030-10-20T10:00:00Z',recordedBy:'admin-fixture'});
  };
  page.on('pageerror',e=>state.errors.push(e.message));
  if(signedIn)await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('confirmation-fixture')})));
  await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP,async route=>{
    const req=route.request(),p=new URL(req.url()).pathname;
    const json=(body,status=200)=>route.fulfill({status,json:body});
    if(p==='/api/users/current')return json({user:{_id:'aaaaaaaaaaaaaaaaaaaaaaaa',firstName:'Jana'}});
    if(p.endsWith('/favorites/storefront'))return json({ids:[]});
    if(p.endsWith('/site-settings'))return json({sections:{girlsDresses:true,womenDresses:true,suits:false,familyLooks:false}});
    if(p==='/gsi/client')return route.fulfill({contentType:'application/javascript',body:''});
    if(p.endsWith('/admin/access'))return state.role==='admin'?json({owner:true,permissions:['reservations','fittings']}):json({error:{code:'FORBIDDEN'}},403);
    if(p.endsWith('/partner/access'))return state.role==='blaze'?json({userId:'aaaaaaaaaaaaaaaaaaaaaaaa',owner:false,role:'administrator',
      partnerId:'blaze',name:'Blaze Photostudio',enabled:true,referralCode:'blaze-fixture'}):json({error:{code:'FORBIDDEN'}},403);
    if(p.endsWith('/account/reservations'))return json({items:[{reservation:receipt()}],total:1,page:1});
    if(p.endsWith('/account/fittings'))return json({items:[],total:0,page:1});
    if(p.endsWith(`/reservations/${number}/payment-report`)){
      if(state.failReport)return route.abort('failed');
      expect(req.headers().authorization).toBe('Bearer confirmation-fixture');
      const body=req.postDataJSON();expect(body.amount).toBe(600);expect(body.operationId).toMatch(/^[a-f\d-]{36}$/);
      state.report={kind:body.kind,amount:body.amount,reportedAt:'2030-10-20T09:00:00Z'};state.revision++;
      return json({reservation:receipt()});
    }
    if(p.endsWith(`/reservations/${number}`))return json({reservation:receipt()});
    if(p.endsWith('/fitting-discount'))return json({eligible:false,applied:{kind:'discount',number:'ZK-ABCDEF123456',amount:200},items:[]});
    if(p.endsWith(`/admin/reservations/${id}/payments`)){
      if(req.method()==='POST')record(req.postDataJSON());
      return json({payments:payment()});
    }
    if(p.endsWith(`/admin/reservations/${id}`))return json({
      ...receipt(),id,pendingExpired:false,customerSnapshot:customer,updatedAt:'2030-10-20T10:00:00Z',
      items:[{productId:item.productId,variantId:item.variantId,inventoryItemId:'333333333333333333333333',
        productNameSnapshot:item.productName,sizeSnapshot:item.size,rentalPriceSnapshot:800,depositSnapshot:0,inventoryCurrent:null}],
    });
    if(p.endsWith('/admin/products'))return json({items:[],pagination:{page:1,limit:1,total:0,pages:0}});
    if(p.endsWith('/partner/catalogue')||p.endsWith('/partner/members')||p.endsWith('/partner/fittings'))return json({items:[]});
    if(p.endsWith('/partner/reservations'))return json({items:[{id,number,status:'confirmed',
      startDate:'2030-10-24',endDate:'2030-10-24',rentalMode:'studio',customer,
      items:[{productId:item.productId,name:item.productName,size:item.size}],subtotal:600,deposit:0,
      source:'partner',payment:payment(),instructions:payment()}]});
    if(p.endsWith(`/partner/reservations/${id}`)){
      const body=req.postDataJSON();expect(body.action).toBe('payment');record(body.payment);return json({ok:true});
    }
    return json({items:[]});
  });
  return state;
}
async function openCustomer(page){
  await page.goto(APP+'/ucet/rezervace');
  await page.getByText('Platby a podrobnosti',{exact:true}).click();
}
async function checkWidth(page){
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
}
for(const width of [375,390,430,768,1024,1440]){
  test('customer transfer, ANIRAK approval, and Blaze balance '+width,async({page})=>{
    const state=await fixture(page);await page.setViewportSize({width,height:1000});
    await openCustomer(page);
    await page.getByRole('button',{name:'Platbu jsem odeslal/a',exact:true}).click();
    await expect(page.getByText(/Klient oznámil odeslání platby 600\sKč/)).toBeVisible();
    expect(state.paid).toBe(0);expect(state.writes).toEqual([]);
    await expect(page.getByRole('img',{name:'QR platba 600 Kč'})).toHaveCount(0);
    await checkWidth(page);
    state.role='admin';await page.goto(await paymentPushDestination('reservation_payment_reported'));
    await expect(page.getByText(/Čeká na ověření AniraKids/)).toBeVisible();
    await page.getByText('Ukázat QR pro doplatek 600 Kč',{exact:true}).click();
    await expect(page.getByRole('img',{name:'QR platba 600 Kč'})).toBeVisible();
    await page.getByRole('button',{name:'Zapsat ověřenou platbu',exact:true}).click();
    await expect(page.getByLabel('Částka (Kč)',{exact:true})).toHaveValue('600');
    await expect(page.getByLabel('Způsob platby',{exact:true})).toHaveValue('bank_transfer');
    await page.getByRole('button',{name:'Zkontrolovat zápis',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Potvrdit platební operaci'});
    await expect(dialog).toContainText('600 Kč');
    expect(state.paid).toBe(0);
    await dialog.getByRole('button',{name:'Potvrdit zápis',exact:true}).click();
    await expect.poll(()=>state.paid).toBe(600);
    await expect(page.getByText(/Poslední potvrzená platba: 600\sKč · bankovním převodem/)).toBeVisible();
    await checkWidth(page);
    await page.locator('section[aria-label="Platební evidence"]').screenshot({path:`test-evidence/payment-confirmation/bank-admin-${width}.png`});
    state.role='blaze';await page.goto(APP+'/partner/blaze?section=reservations');
    await expect(page.getByText('Zbývá doplatit nájemné: 0 Kč',{exact:true})).toBeVisible();
    await expect(page.getByText(/Poslední potvrzená platba: 600\sKč · bankovním převodem/)).toBeVisible();
    await checkWidth(page);
    state.role='customer';await openCustomer(page);
    await expect(page.getByText('Nájemné je podle posledního načteného stavu uhrazeno.',{exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Platbu jsem odeslal/a',exact:true})).toHaveCount(0);
    expect(state.writes).toHaveLength(1);expect(state.errors).toEqual([]);
  });
  test('cash choice preserves ANIRAK and Blaze QR until actual receipt '+width,async({page})=>{
    const state=await fixture(page);await page.setViewportSize({width,height:1000});
    await openCustomer(page);
    await page.getByLabel('Jak chcete zaplatit?').selectOption('cash');
    await page.getByRole('button',{name:'Zaplatím hotově při převzetí',exact:true}).click();
    await expect(page.getByText(/Klient zvolil platbu hotově při převzetí: 600\sKč/)).toBeVisible();
    expect(state.paid).toBe(0);expect(state.writes).toEqual([]);
    await page.reload();await page.getByText('Platby a podrobnosti',{exact:true}).click();
    await expect(page.getByRole('button',{name:'Platba při převzetí je domluvena'})).toBeDisabled();
    state.role='admin';await page.goto(await paymentPushDestination('reservation_cash_selected'));
    await page.getByText('Ukázat QR pro doplatek 600 Kč',{exact:true}).click();
    await expect(page.getByRole('img',{name:'QR platba 600 Kč'})).toBeVisible();
    await expect(page.getByRole('button',{name:'Zapsat přijatou hotovost',exact:true})).toBeVisible();
    await checkWidth(page);
    state.role='blaze';await page.goto(APP+'/partner/blaze?section=reservations');
    await expect(page.getByText('Zbývá doplatit nájemné: 600 Kč',{exact:true})).toBeVisible();
    await expect(page.getByText(/Klient zvolil platbu hotově při převzetí/)).toBeVisible();
    await page.getByText('Platby a QR',{exact:true}).click();
    await expect(page.getByRole('img',{name:'QR kód',exact:true})).toBeVisible();
    await checkWidth(page);
    await page.screenshot({path:`test-evidence/payment-confirmation/cash-blaze-${width}.png`,fullPage:true});
    await page.getByLabel('Přijatá hotovost v Kč').fill('600');
    await page.getByRole('button',{name:'Zaznamenat přijatou hotovost',exact:true}).click();
    await expect(page.getByText('Zbývá doplatit nájemné: 0 Kč',{exact:true})).toBeVisible();
    await expect(page.getByText(/Poslední potvrzená platba: 600\sKč · hotově/)).toBeVisible();
    expect(state.writes[0]).toMatchObject({type:'rental_received',amount:600,method:'cash'});
    expect(state.errors).toEqual([]);
  });
}
test('cash choice can change to reported QR transfer without recording money',async({page})=>{
  const state=await fixture(page);await openCustomer(page);
  await page.getByLabel('Jak chcete zaplatit?').selectOption('cash');
  await page.getByRole('button',{name:'Zaplatím hotově při převzetí',exact:true}).click();
  await expect(page.getByText(/Klient zvolil platbu hotově/)).toBeVisible();
  await page.getByLabel('Jak chcete zaplatit?').selectOption('full');
  await expect(page.getByRole('img',{name:'QR platba 600 Kč'})).toBeVisible();
  await page.getByRole('button',{name:'Platbu jsem odeslal/a',exact:true}).click();
  await expect(page.getByText(/Čeká na ověření AniraKids/)).toBeVisible();
  expect(state.report.kind).toBe('full');expect(state.paid).toBe(0);expect(state.writes).toEqual([]);
});
test('failed customer report never presents a payment as confirmed',async({page})=>{
  const state=await fixture(page);state.failReport=true;await openCustomer(page);
  await page.getByRole('button',{name:'Platbu jsem odeslal/a',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Výsledek se nepodařilo ověřit');
  expect(state.paid).toBe(0);expect(state.report).toBeNull();
  await expect(page.getByText(/Poslední potvrzená platba/)).toHaveCount(0);
  await expect(page.getByLabel('Jak chcete zaplatit?')).toBeEnabled();
});

test('payment push detail preserves its destination while requiring admin login',async({page})=>{
  const state=await fixture(page,{signedIn:false});state.role='admin';
  const destination=await paymentPushDestination('reservation_payment_reported');
  await page.goto(destination);
  await expect(page.getByText('Pro přístup do administrace se přihlaste.')).toBeVisible();
  await expect(page).toHaveURL(destination);
  await expect(page.getByRole('button',{name:'Přihlásit se',exact:true})).toBeVisible();
  expect(state.writes).toEqual([]);
});
