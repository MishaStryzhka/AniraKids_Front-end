// Fixture-only browser checks: no production payments or customer records.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const APP='http://127.0.0.1:4173';
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
 for(const width of [375,390,430,768,1024,1440]){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[],writes=[],paymentCreates=[];
  page.on('pageerror',e=>errors.push(e.message));
  let settings={gateway:'revolut',qrEnabled:true,defaultMethod:'qr',revision:0,configured:false,providers:{revolut:true,globalpayments:false}};
  await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('fixture-admin')})));
  await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP,async route=>{
   const req=route.request(),p=new URL(req.url()).pathname,json=body=>route.fulfill({json:body});
   if(p==='/api/users/current')return json({user:{_id:'111111111111111111111111',emailVerified:true}});
   if(p.endsWith('/favorites/storefront'))return json({ids:[]});
   if(p==='/api/v2/admin/access')return json({owner:false,permissions:['settings']});
   if(p==='/api/v2/site-settings'||p==='/api/v2/admin/settings')return json({sections:{girlsDresses:true,womenDresses:true,suits:true,familyLooks:false}});
   if(p==='/api/v2/admin/fitting-settings')return json({enabled:false,address:'Praha',weekly:Array.from({length:7},(_,day)=>({day,enabled:false,start:'09:00',end:'17:00'})),blockedDates:[]});
   if(p==='/api/v2/admin/payment-settings'){
    if(req.method()==='PATCH'){writes.push(req.postDataJSON());settings={...settings,...req.postDataJSON(),revision:settings.revision+1,configured:true};}
    return json(settings);
   }
   if(p==='/api/v2/payments/revolut/config')return json({mode:'sandbox',publicKey:'pk_fixture'});
   if(p==='/api/v2/fittings/ZK-123456789ABC')return json({number:'ZK-123456789ABC',date:'2030-01-01',time:'10:00',durationMinutes:30,price:200,address:'Praha',status:'pending',paymentStatus:'unpaid',expiresAt:'2099-01-01T00:00:00Z',paymentOptions:{gateway:'revolut',qrEnabled:false,defaultMethod:'online'},cardPayment:{active:false,reviewRequired:false},paymentInstructions:null});
   if(p==='/api/v2/fittings/ZK-123456789ABC/revolut/create'){paymentCreates.push(req.method());return route.fulfill({status:503,json:{error:{code:'FIXTURE_PROVIDER_UNAVAILABLE'}}});}
   if(p==='/api/v2/account/fittings/ZK-123456789ABC')return json({number:'ZK-123456789ABC'});
   return route.fulfill({status:404,json:{error:{code:'NOT_FOUND'}}});
  });
  await page.goto(APP+'/admin/nastaveni#platby');
  await page.getByLabel('Online platební brána').waitFor({state:'visible'});
  assert.equal(await page.locator('option[value="globalpayments"]').isDisabled(),true);
  await page.getByLabel('Povolit bankovní převod s QR kódem').uncheck();
  assert.equal(await page.getByLabel('Výchozí způsob platby').inputValue(),'online');
  await page.getByRole('button',{name:'Uložit platby',exact:true}).click();
  await page.getByText('Nastavení plateb bylo uloženo.').waitFor();
  assert.deepEqual(writes[0],{gateway:'revolut',qrEnabled:false,defaultMethod:'online',revision:0});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  fs.mkdirSync('test-evidence/payments',{recursive:true});
  await page.screenshot({path:`test-evidence/payments/settings-${width}.png`,fullPage:true});
  await page.goto(APP+'/zkouska/ZK-123456789ABC#'+'a'.repeat(64));
  await page.getByText('Platební formulář se nepodařilo připravit.',{exact:false}).waitFor();
  assert.deepEqual(paymentCreates,['POST']);
  const cancelIcon=page.getByRole('button',{name:'Zrušit zkoušku',exact:true});
  const box=await cancelIcon.boundingBox();
  assert.ok(box.width>=44&&box.height>=44);
  await cancelIcon.click();
  await page.getByRole('dialog',{name:'Opravdu chcete zrušit zkoušku?'}).waitFor();
  await page.getByRole('button',{name:'Ponechat zkoušku',exact:true}).click();
  assert.equal(await page.getByRole('dialog').count(),0);
  assert.equal(await page.getByRole('button',{name:'Zaplatit online – 200 Kč',exact:true}).count(),0);
  assert.equal(await page.getByLabel('Způsob platby',{exact:true}).count(),0);
  assert.equal(await page.getByRole('button',{name:'Platba odeslána',exact:true}).count(),0);
  assert.equal(await page.getByRole('button',{name:'Připojit k účtu',exact:true}).count(),0);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`test-evidence/payments/fitting-online-${width}.png`,fullPage:true});
  assert.deepEqual(errors,[]);await page.close();console.log('PASS payment settings and fitting '+width+'px');
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
