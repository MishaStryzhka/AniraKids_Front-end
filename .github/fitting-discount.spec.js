const {test}=require('@playwright/test');
const assert=require('node:assert/strict');
for(const width of [375,390,430,768,1024,1440])test(`fitting discount at ${width}`,async({page})=>{
await page.setViewportSize({width,height:1000});const errors=[];page.on('pageerror',e=>errors.push(e.message));let applied=false,writes=0;
await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('fixture-admin')})));
await page.route(url=>url.origin!=='http://127.0.0.1:4173',async route=>{const req=route.request(),u=new URL(req.url());const json=x=>route.fulfill({json:x});
if(u.pathname==='/api/users/current')return json({user:{_id:'admin1'}});
if(u.pathname==='/api/users/favorites/storefront')return json({favorites:[]});
if(u.pathname.endsWith('/admin/access'))return json({owner:true,permissions:['reservations','fittings']});
if(u.pathname.endsWith('/fitting-discount'))return json({eligible:!applied,applied:applied?{kind:'discount',number:'ZK-123456ABCDEF',amount:200}:null,items:applied?[]:[{id:'f1',number:'ZK-123456ABCDEF',date:'2026-10-10',time:'10:00',revision:2}]});
if(u.pathname.endsWith('/fittings/f1/actions')){assert.equal(req.method(),'POST');assert.deepEqual(req.postDataJSON(),{action:'credit',revision:2,reservationNumber:'AK-2030-001'});writes++;applied=true;return json({ok:true});}
if(u.pathname.endsWith('/payments'))return json({payments:{reservationId:'r1',revision:applied?1:0,currency:'CZK',legacyUnreconciled:false,advanceRequired:200,rentalTotal:applied?600:800,depositRequired:2000,rentalReceived:0,rentalRefunded:0,rentalNet:0,depositReceived:0,depositRefunded:0,depositHeld:0,cancellationFee:0,rentalBalance:applied?600:800,advanceBalance:applied?0:200,fittingCredit:applied?200:0,refundableRental:0,entries:[]}});
if(u.pathname.endsWith('/reservations/r1'))return json({id:'r1',reservationNumber:'AK-2030-001',status:'confirmed',paymentStatus:'unpaid',pendingExpired:false,expiresAt:null,rentalMode:'external',startDate:'2030-10-10',endDate:'2030-10-11',customerSnapshot:{firstName:'Jana',lastName:'Nováková',email:'fixture@example.test',phone:'+420777123456'},items:[{productId:'p1',variantId:'v1',inventoryItemId:'i1',productNameSnapshot:'Šaty DET001',sizeSnapshot:'98',rentalPriceSnapshot:800,depositSnapshot:2000,inventoryCurrent:null}],subtotal:applied?600:800,deposit:2000,totalDue:applied?2600:2800,updatedAt:applied?'2026-10-19T20:01:00Z':'2026-10-19T20:00:00Z'});
if(u.pathname.endsWith('/admin/products'))return json({items:[],pagination:{page:1,limit:1,total:0,pages:0}});
return route.abort();});
await page.goto('http://127.0.0.1:4173/admin/rezervace/r1');const button=page.getByRole('button',{name:'Započíst platbu',exact:true});await button.waitFor({timeout:10000}).catch(async e=>{console.log(await page.locator('body').innerText());console.log(errors);throw e;});await button.scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);const box=await button.boundingBox();assert.ok(box.height>=44);
await button.click();await page.getByText(/Započtená platba 200 Kč/).waitFor();await page.waitForFunction(()=>document.body.innerText.includes('600'));
await page.getByRole('button',{name:'Zapsat platbu',exact:true}).waitFor();
const summary=page.locator('section[aria-label="Nájemné"]');assert.match(await summary.innerText(),/800\sKč/);assert.match(await summary.innerText(),/Započtená platba za zkoušku/);assert.match(await summary.innerText(),/600\sKč/);
await summary.screenshot({path:`test-evidence/account-payment/admin-${width}.png`});assert.equal(await page.getByRole('button',{name:'Zapsat platbu',exact:true}).isEnabled(),true);assert.equal(writes,1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);console.log('PASS discount selection/apply/refreshed payments, width '+width);await page.close();
});
