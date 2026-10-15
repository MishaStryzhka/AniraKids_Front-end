const { test, expect } = require('@playwright/test');
const { policy } = require('./payment-fixtures');
const fs = require('fs');
const APP = 'http://127.0.0.1:4173', API = 'http://admin-api.test';
const EVIDENCE = 'test-evidence/rental-calendar';
fs.mkdirSync(EVIDENCE, { recursive: true });
const product = {
  id:'111111111111111111111111', slug:'sofia', name:'Sofia', category:'dress', photos:[],
  variants:[{id:'222222222222222222222222',size:'98',pricing:{studio:{rentalPrice:500,deposit:1000,totalDue:1500},external:null}},
    {id:'333333333333333333333333',size:'104',pricing:{studio:{rentalPrice:500,deposit:1000,totalDue:1500},external:null}}],
};
async function setup(page) {
  const state={posts:[],errors:[],reads:[],fail:false};
  await page.clock.install({time:new Date('2032-02-01T12:00:00Z')});
  page.on('pageerror',error=>state.errors.push(error.message));
  await page.route(url=>url.origin===API,async route=>{
    const request=route.request(),url=new URL(request.url()),q=Object.fromEntries(url.searchParams);
    const json=body=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
    if(request.method()!=='GET'){state.posts.push(url.pathname);return route.fulfill({status:500});}
    if(url.pathname==='/api/v2/booking-policy')return json(policy);
    if(url.pathname==='/api/v2/catalogue/products/sofia')return json({product});
    if(url.pathname.endsWith('/availability-calendar')) {
      state.reads.push(q);
      if(state.fail)return route.fulfill({status:503,contentType:'application/json',body:'{"error":{"code":"UNAVAILABLE"}}'});
      const length=new Date(q.month+'-01T00:00:00Z');length.setUTCMonth(length.getUTCMonth()+1,0);
      return json({calendar:{...q,productId:product.id,startDate:q.startDate||null,today:'2032-02-01',checkedAt:'2032-02-01T12:00:00Z',
        days:Array.from({length:length.getUTCDate()},(_,i)=>{
          const date=q.month+'-'+String(i+1).padStart(2,'0');
          return {date,available:date>='2032-02-01' && date!=='2032-02-04' &&
            (!q.startDate||(date>=q.startDate && !(q.startDate<='2032-02-04'&&date>='2032-02-04')))};
        })}});
    }
    if(url.pathname.endsWith('/availability'))return json({availability:{...q,productId:product.id,available:true,
      pricing:product.variants[0].pricing.studio,checkedAt:'2032-02-01T12:00:00Z'}});
    return route.fulfill({status:404,contentType:'application/json',body:'{"error":{"code":"NOT_FOUND"}}'});
  });
  await page.goto(APP+'/produkt/sofia');
  await page.getByRole('button',{name:'Rezervovat'}).click();
  return state;
}
const day=(page,date)=>page.locator('[data-date="'+date+'"]');
for(const width of [375,390,430,768,1024,1440]) {
  test('available calendar and automatic quote at '+width,async({page})=>{
    await page.setViewportSize({width,height:1000});
    const state=await setup(page);
    expect(state.reads).toHaveLength(0);
    await page.getByLabel('Velikost',{exact:true}).selectOption(product.variants[0].id);
    await expect(day(page,'2032-02-06')).toHaveAttribute('aria-disabled','false');
    await expect(page.getByText('únor 2032',{exact:true})).toBeVisible();
    await expect(day(page,'2032-02-04')).toHaveAttribute('aria-disabled','true');
    await day(page,'2032-02-06').click();
    await expect(day(page,'2032-02-08')).toHaveAttribute('aria-disabled','false');
    expect(state.reads.at(-1).startDate).toBe('2032-02-06');
    await day(page,'2032-02-08').click();
    await expect(page.getByText('Termín je aktuálně dostupný',{exact:true})).toBeVisible();
    await expect(page.getByLabel('Od',{exact:true})).toHaveValue('2032-02-06');
    await expect(page.getByLabel('Do',{exact:true})).toHaveValue('2032-02-08');
    const calendar=page.getByLabel('Kalendář dostupnosti',{exact:true});
    for(const target of [day(page,'2032-02-06'),page.getByRole('button',{name:'Následující měsíc'})]) {
      const box=await target.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
    await calendar.screenshot({path:EVIDENCE+'/calendar-'+width+'.png'});
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:EVIDENCE+'/booking-'+width+'.png',fullPage:true});
    expect(state.posts).toEqual([]);
    expect(state.errors).toEqual([]);
  });
}
test('keyboard, continuous range and recoverable month failure',async({page})=>{
  const state=await setup(page);
  await page.getByLabel('Velikost',{exact:true}).selectOption(product.variants[0].id);
  await expect(day(page,'2032-02-03')).toHaveAttribute('aria-disabled','false');
  await day(page,'2032-02-02').focus();
  await page.keyboard.press('ArrowRight');
  await expect(day(page,'2032-02-03')).toBeFocused();
  expect(await day(page,'2032-02-03').evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');
  await page.keyboard.press('Enter');
  await expect(day(page,'2032-02-05')).toHaveAttribute('aria-disabled','true');
  await page.getByRole('button',{name:'Změnit začátek pronájmu'}).click();
  await expect(day(page,'2032-02-28')).toHaveAttribute('aria-disabled','false');
  await day(page,'2032-02-28').click();
  await page.getByRole('button',{name:'Následující měsíc'}).click();
  await expect(day(page,'2032-03-02')).toHaveAttribute('aria-disabled','false');
  await day(page,'2032-03-02').click();
  await expect(page.getByLabel('Do',{exact:true})).toHaveValue('2032-03-02');
  state.fail=true;
  await page.getByRole('button',{name:'Následující měsíc'}).click();
  await expect(page.getByText('Dostupné dny se nepodařilo načíst.')).toBeVisible();
  await expect(day(page,'2032-04-01')).toHaveAttribute('aria-disabled','true');
  state.fail=false;
  await page.getByRole('button',{name:'Načíst dostupné dny znovu'}).click();
  await expect(day(page,'2032-04-01')).toHaveAttribute('aria-disabled','false');
  expect(state.posts).toEqual([]);
  expect(state.errors).toEqual([]);
});

for (const width of [390,768,1440]) {
  test('manual date edit checks on blur at '+width, async({page})=>{
    await page.setViewportSize({width,height:1000});
    const state=await setup(page);
    await page.getByLabel('Velikost',{exact:true}).selectOption(product.variants[0].id);
    await page.getByLabel('Od',{exact:true}).fill('2032-02-06');
    await page.getByLabel('Do',{exact:true}).fill('2032-02-08');
    await page.getByLabel('Jméno',{exact:true}).focus();
    await expect(page.getByText('Termín je aktuálně dostupný',{exact:true})).toBeVisible();
    await page.getByLabel('Do',{exact:true}).fill('2032-02-09');
    await expect(page.getByRole('button',{name:'Rezervovat',exact:true})).toBeDisabled();
    await page.getByLabel('Jméno',{exact:true}).focus();
    await expect(page.getByText('Termín je aktuálně dostupný',{exact:true})).toBeVisible();
    await page.getByLabel('Do',{exact:true}).fill('2032-02-05');
    await page.getByLabel('Jméno',{exact:true}).focus();
    await expect(page.getByRole('button',{name:'Rezervovat',exact:true})).toBeDisabled();
    expect(state.posts).toEqual([]);
    expect(state.errors).toEqual([]);
  });
}
test('direct women product highlights its audience, not girls',async({page})=>{
  await setup(page);
  await page.route(API+'/api/v2/catalogue/products/sofia', route=>route.fulfill({
    status:200,contentType:'application/json',body:JSON.stringify({product:{...product,gender:'women'}})
  }));
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(APP+'/produkt/sofia');
  const nav=page.getByRole('navigation',{name:'Hlavní navigace'});
  await expect(nav.getByRole('link',{name:'Dámské šaty',exact:true})).toHaveAttribute('aria-current','page');
  await expect(nav.getByRole('link',{name:'Dívčí šaty',exact:true})).not.toHaveAttribute('aria-current','page');
  await page.setViewportSize({width:390,height:1000});
  await page.getByRole('button',{name:'Otevřít menu'}).click();
  await expect(page.getByRole('navigation',{name:'Menu',exact:true}).getByRole('link',{name:'Dámské šaty',exact:true})).toHaveAttribute('aria-current','page');
});

test('Czech headings and navigation use custom glyphs without fallback',async({page})=>{
  await setup(page);
  await page.goto(APP+'/saty');
  await page.evaluate(async()=>{
    const h=document.querySelector('h1');
    h.textContent='Dívčí šaty — Příliš žluťoučký kůň úpěl ďábelské ódy — ČĎĚŇŘŠŤŮŽ';
    await document.fonts.ready;
  });
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const fontsFor=async selector=>{
    const {root}=await cdp.send('DOM.getDocument');
    const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector});
    return (await cdp.send('CSS.getPlatformFontsForNode',{nodeId})).fonts.filter(f=>f.glyphCount>0);
  };
  for(const width of [390,768,1024,1440]){
    await page.setViewportSize({width,height:1000});
    await page.evaluate(()=>document.fonts.ready);
    const editorial=await fontsFor('h1');
    expect(editorial.length).toBeGreaterThan(0);
    expect(editorial.every(f=>f.isCustomFont && /Lora/i.test(f.familyName))).toBe(true);
    if(width<1024)await page.getByRole('button',{name:'Otevřít menu'}).click();
    const nav=page.getByRole('navigation',{name:width<1024?'Menu':'Hlavní navigace',exact:true});
    const women=nav.getByRole('link',{name:'Dámské šaty',exact:true});
    await women.evaluate(e=>e.setAttribute('data-font-check',''));
    await page.evaluate(()=>document.fonts.ready);
    const ui=await fontsFor('[data-font-check]');
    expect(ui.length).toBeGreaterThan(0);
    expect(ui.every(f=>f.isCustomFont && /Inter/i.test(f.familyName))).toBe(true);
    await women.evaluate(e=>e.removeAttribute('data-font-check'));
    const box=await women.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    if(width>=1024){
      const end=await nav.getByRole('link',{name:'Pronájem',exact:true}).boundingBox();
      const utilities=await page.locator('[data-desktop-utilities]').boundingBox();
      expect(end.x+end.width).toBeLessThanOrEqual(utilities.x);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({path:EVIDENCE+'/czech-fonts-'+width+'.png',fullPage:true});
    console.log(JSON.stringify({width,editorial,ui}));
    if(width<1024)await page.getByRole('button',{name:'Zavřít menu'}).click();
  }
});

for (const width of [390,768,1440]) {
  test('full payment includes deposit and remaining cash/QR at '+width, async ({page}) => {
    await page.setViewportSize({width,height:1000});
    const state=await setup(page);
    const number='AK-2032-PAY001';
    const instructions=amount=>({...policy.bank,amount,currency:'CZK',message:number,
      qrPayload:`SPD*1.0*ACC:${policy.bank.iban}*AM:${amount.toFixed(2)}*CC:CZK*MSG:${number}*PT:IP`});
    let receipt={reservationNumber:number,status:'pending',rentalMode:'studio',
      startDate:'2032-02-06',endDate:'2032-02-08',expiresAt:'2032-02-02T12:00:00Z',
      item:{productId:product.id,variantId:product.variants[0].id,productName:'Sofia',
        size:'98',rentalPrice:700,deposit:2000},
      subtotal:700,deposit:2000,totalDue:2700,paymentStatus:'unpaid',
      payment:{advanceRequired:200,advanceBalance:200,rentalBalance:700,
        depositRequired:2000,depositHeld:0,paymentInstructions:instructions(200),
        fullPaymentInstructions:instructions(2700)}};
    await page.route(API+'/api/v2/reservations/'+number,route=>route.fulfill({
      status:200,contentType:'application/json',body:JSON.stringify({reservation:receipt})}));
    await page.goto(APP+'/stav-rezervace#'+new URLSearchParams({reservation:number,token:'a'.repeat(43)}));
    const select=page.getByRole('combobox',{name:'Jak chcete zaplatit?'});
    await expect(select).toHaveValue('advance');
    await expect(page.getByRole('img',{name:/QR platba 200/})).toBeVisible();
    await select.selectOption('full');
    await expect(page.getByRole('img',{name:/QR platba 2.700/})).toBeVisible();
    await select.scrollIntoViewIfNeeded();
    await select.focus();
    const metrics=await select.evaluate(e=>({height:e.getBoundingClientRect().height,
      outline:getComputedStyle(e).outlineWidth}));
    expect(metrics.height).toBeGreaterThanOrEqual(44);
    expect(parseFloat(metrics.outline)).toBeGreaterThanOrEqual(2);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({path:EVIDENCE+'/full-payment-'+width+'.png',fullPage:true});
    receipt={...receipt,status:'confirmed',expiresAt:null,payment:{...receipt.payment,
      advanceBalance:0,rentalBalance:500,paymentInstructions:null,fullPaymentInstructions:instructions(2500)}};
    await page.getByRole('button',{name:'Aktualizovat stav rezervace'}).click();
    await expect(page.getByRole('img',{name:/QR platba 2.500/})).toBeVisible();
    await select.selectOption('cash');
    await expect(page.getByRole('img',{name:/QR platba/})).toHaveCount(0);
    await expect(page.getByRole('status')).toContainText('hotově při převzetí');
    await select.selectOption('full');
    await expect(page.getByRole('img',{name:/QR platba 2.500/})).toBeVisible();
    receipt={...receipt,paymentStatus:'paid',payment:{...receipt.payment,rentalBalance:0,
      depositHeld:2000,fullPaymentInstructions:null}};
    await page.getByRole('button',{name:'Aktualizovat stav rezervace'}).click();
    await expect(page.getByRole('status')).toContainText('uhrazeny');
    await expect(select).toHaveCount(0);
    await expect(page.getByRole('img',{name:/QR platba/})).toHaveCount(0);
    expect(state.posts).toEqual([]);
    expect(state.errors).toEqual([]);
  });
}

for(const width of [390,768,1440])test('reservation shows photos for every item '+width,async({page})=>{
 const state=await setup(page);await page.setViewportSize({width,height:1000});
 await page.route(APP+'/fixtures/booking-photo.jpg',route=>route.fulfill({contentType:'image/jpeg',body:fs.readFileSync('src/images/product-card-1.jpg')}));
 await page.evaluate(({product,photo})=>{
  const second={...product,id:'444444444444444444444444',slug:'second',name:'Dámské šaty DAM011',photos:[{url:photo}]};
  sessionStorage.setItem('anirakids.draft.v1',JSON.stringify({version:1,selection:{rentalMode:'studio',startDate:'',endDate:''},items:[{product:{...product,name:'Dětské šaty DET30',photos:[{url:photo}]},variantId:''},{product:second,variantId:''}]}));
 },{product,photo:APP+'/fixtures/booking-photo.jpg'});
 await page.reload();
 for(const name of ['Dětské šaty DET30','Dámské šaty DAM011']){
  const row=page.getByRole('group',{name,exact:true}),photo=row.getByRole('img',{name:'Fotografie: '+name});
  await expect(photo).toBeVisible();await expect(row.getByLabel('Velikost',{exact:true})).toBeVisible();
  expect(await photo.evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
 }
 await page.screenshot({path:`test-evidence/rental-calendar/item-photos-${width}.png`,fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);expect(state.posts).toEqual([]);expect(state.errors).toEqual([]);
});
