const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');
const {policy}=require('./payment-fixtures');
const APP='https://anirakids.cz';
const product={id:'111111111111111111111111',slug:'sofia',name:'Sofia',category:'dress',photos:[],variants:[{id:'222222222222222222222222',size:'98',pricing:{studio:null,external:{rentalPrice:800,deposit:2000,totalDue:2800}}}]};
const selection={productId:product.id,variantId:product.variants[0].id,rentalMode:'external',startDate:'2032-06-10',endDate:'2032-06-12'};
const point={id:'B10103',type:'BALIKOVNY',name:'Praha 10',address:'Černokostelecká 2020/20, Praha',zip:'10030'};
fs.mkdirSync('test-evidence/delivery',{recursive:true});
for(const width of [375,768,1440])test('delivery choice, point, submit and receipt '+width,async({page})=>{
 const posts=[],errors=[];let maps=0;
 page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width,height:1000});
 await page.addInitScript(({product,selection})=>{
  localStorage.setItem('anirak.analytics-consent.v1',JSON.stringify({version:1,choice:'denied',at:Date.now()}));
  if(!sessionStorage.getItem('anirakids.draft.v1'))sessionStorage.setItem('anirakids.draft.v1',JSON.stringify({version:1,selection,items:[{product,variantId:selection.variantId}]}));
 },{product,selection});
 await page.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.origin===APP){let f=path.join(process.cwd(),'build',u.pathname);if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(process.cwd(),'build/index.html');return route.fulfill({path:f,contentType:f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.html')?'text/html':undefined});}
  if(u.hostname==='b2c.cpost.cz'){maps++;return route.fulfill({contentType:'text/html',body:`<meta charset="utf-8"><button onclick='parent.postMessage(${JSON.stringify({message:'pickerResult',point})},"${APP}")'>Vybrat Balíkovnu</button>`});}
  if(u.pathname==='/api/v2/site-settings')return route.fulfill({json:{cooperationActive:false,sections:{girlsDresses:true,womenDresses:true,suits:true,familyLooks:false}}});
  if(u.pathname==='/api/v2/booking-policy')return route.fulfill({json:policy});
  if(u.pathname.endsWith('/availability-calendar')){const q=Object.fromEntries(u.searchParams);return route.fulfill({json:{calendar:{...q,productId:product.id,startDate:q.startDate||null,today:'2026-10-27',checkedAt:new Date().toISOString(),days:Array.from({length:new Date(Number(q.month.slice(0,4)),Number(q.month.slice(5)),0).getDate()},(_,i)=>({date:q.month+'-'+String(i+1).padStart(2,'0'),available:true}))}}});}
  if(u.pathname.endsWith('/availability'))return route.fulfill({json:{availability:{...selection,available:true,checkedAt:new Date().toISOString(),pricing:product.variants[0].pricing.external}}});
  if(u.pathname==='/api/v2/reservations'&&route.request().method()==='POST'){
   const body=route.request().postDataJSON();posts.push(body);
   const item={productId:product.id,variantId:selection.variantId,productName:'Sofia',size:'98',rentalPrice:800,deposit:2000};
   return route.fulfill({status:201,json:{guestAccessToken:'x'.repeat(43),reservation:{reservationNumber:'AK-2032-ABC123',status:'pending',rentalMode:'external',startDate:selection.startDate,endDate:selection.endDate,expiresAt:'2032-06-01T12:00:00Z',item,items:[item],subtotal:800,deposit:2000,totalDue:2800,paymentStatus:'unpaid',fulfillmentMethod:body.fulfillmentMethod,balikovnaPoint:body.balikovnaPoint}}});
  }
  return route.fulfill({status:401,json:{error:{code:'UNAUTHORIZED'}}});
 });
 await page.goto(APP+'/rezervace');
 await page.getByRole('button',{name:'Ověřit dostupnost'}).click();
 await expect(page.getByText('Termín je aktuálně dostupný',{exact:true})).toBeVisible();
 await page.getByLabel('Balíkovna',{exact:true}).check();expect(maps).toBe(0);
 await page.getByRole('button',{name:'Rezervovat',exact:true}).click();
 await expect(page.getByText('Vyberte výdejní místo Balíkovny.')).toBeVisible();expect(posts).toEqual([]);
 await page.getByRole('button',{name:'Vybrat výdejní místo',exact:true}).click();
 await page.frameLocator('iframe[title="Výběr výdejního místa Balíkovny"]').getByRole('button').click();
 await expect(page.getByText('Praha 10',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await page.getByRole('group',{name:'Způsob převzetí'}).screenshot({path:`test-evidence/delivery/choice-${width}.png`});
 await page.getByLabel('Jméno',{exact:true}).fill('Jana');await page.getByLabel('Příjmení').fill('Test');await page.getByLabel('E-mail',{exact:true}).fill('test@example.test');await page.getByLabel('Telefon',{exact:true}).fill('+420777123456');
 await page.getByRole('button',{name:'Rezervovat',exact:true}).click();
 await expect(page.getByRole('heading',{name:'AK-2032-ABC123'})).toBeVisible();
 expect(posts).toHaveLength(1);expect(posts[0]).toMatchObject({fulfillmentMethod:'balikovna',balikovnaPoint:{id:'B10103',zip:'10030'}});
 await expect(page.getByText(/Způsob převzetí:/)).toBeVisible();expect(errors).toEqual([]);
});
