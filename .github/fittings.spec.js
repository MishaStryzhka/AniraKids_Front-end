const {test,expect}=require('@playwright/test');
const APP='http://127.0.0.1:4173';
const settings=()=>({enabled:true,address:'Testovací 12, Praha',weekly:Array.from({length:7},(_,day)=>({day,enabled:day>0&&day<6,start:'09:00',end:'17:00'})),blockedDates:[]});
const number='ZK-123456ABCDEF';
async function setup(page,{admin=false,lost=false}={}){
 const state={settings:settings(),creates:[],actions:[],errors:[],unexpected:[],lost,receipt:null};
 await page.clock.install({time:new Date('2030-01-01T08:00:00Z')});
 page.on('pageerror',e=>state.errors.push(e.message));
 if(admin)await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('test-admin-token')})));
 await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP,async route=>{
  const req=route.request(),u=new URL(req.url()),p=u.pathname,json=(body,status=200)=>route.fulfill({status,json:body});
  if(p==='/gsi/client'||p==='/maps/api/js')return route.fulfill({contentType:'application/javascript',body:''});
  if(p==='/api/users/current')return json({user:{_id:'admin-user',firstName:'Jana',lastName:'Nová',email:'jana@example.test',primaryPhoneNumber:'+420123456789'}});
  if(p==='/api/v2/account/reservations')return json({items:[],total:0,page:1,limit:20});
  if(p==='/api/v2/account/fittings')return json({items:state.receipt?[state.receipt]:[],total:state.receipt?1:0,page:1,limit:20});
  if(p==='/api/v2/account/fittings/'+number)return json(state.receipt);
  if(p==='/api/v2/account/fittings/'+number+'/claim'){state.claim=req.postDataJSON();return json(state.receipt);}
  if(p==='/api/v2/account/fittings/'+number+'/payment-sent'){state.receipt={...state.receipt,status:'review',paymentInstructions:null};return json(state.receipt);}
  if(p==='/api/v2/account/fittings/'+number+'/cancel'){state.receipt={...state.receipt,status:'cancelled',paymentInstructions:null};return json(state.receipt);}
  if(p.endsWith('/favorites/storefront'))return json({ids:[]});
  if(p==='/api/v2/site-settings')return json({sections:{suits:true,familyLooks:false}});
  if(p==='/api/v2/partner/access')return json({error:{code:'FORBIDDEN'}},403);
  if(p==='/api/v2/admin/products')return json({items:[],pagination:{page:1,limit:1,total:0,pages:0}});
  if(p==='/api/v2/admin/settings')return json({sections:{suits:true,familyLooks:false}});
  if(p==='/api/v2/admin/fitting-settings'){if(req.method()==='PATCH')state.settings=req.postDataJSON();return json(state.settings);}
  if(p==='/api/v2/fittings/slots')return json({enabled:state.settings.enabled,date:u.searchParams.get('date'),slots:['11:00','11:30','12:00'],durationMinutes:30,price:200});
  if(p==='/api/v2/fittings'&&req.method()==='POST'){
   state.creates.push(req.postDataJSON());state.createAuth=req.headers().authorization;const b=req.postDataJSON();
   state.receipt={number,date:b.date,time:b.time,durationMinutes:30,price:200,address:state.settings.address,status:'pending',paymentStatus:'unpaid',expiresAt:'2030-01-01T09:00:00Z',paymentInstructions:{amount:200,accountNumber:'123456/0800',message:number,qrPayload:'SPD*1.0*ACC:CZ0708000000006644781399*AM:200.00*CC:CZK*MSG:'+number}};
   if(state.lost){state.lost=false;return route.abort();}return json(state.receipt);
  }
  if(p==='/api/v2/fittings/'+number)return json(state.receipt);
  if(p==='/api/v2/fittings/'+number+'/payment-sent'){state.receipt={...state.receipt,status:'review',paymentInstructions:null};return json(state.receipt);}
  if(p==='/api/v2/fittings/'+number+'/cancel'){state.receipt={...state.receipt,status:'cancelled',paymentInstructions:null};return json(state.receipt);}
  if(p==='/api/v2/admin/fittings')return json({items:[{...state.receipt,number,date:'2030-01-07',time:'11:00',durationMinutes:30,price:200,address:state.settings.address,status:state.adminStatus||'review',paymentStatus:state.adminStatus?'paid':'unpaid',id:'111111111111111111111111',revision:state.actions.length,customer:{name:'Jana Nová',email:'jana@example.test',phone:'+420123456789'},audit:[],credit:state.credited?{reservationId:'222222222222222222222222',reservationNumber:'AK-2030-ABC123'}:null}]});
  if(p==='/api/v2/admin/fittings/111111111111111111111111/actions'){state.actions.push(req.postDataJSON());if(req.postDataJSON().action==='confirm')state.adminStatus='confirmed';if(req.postDataJSON().action==='complete')state.adminStatus='completed';if(req.postDataJSON().action==='credit')state.credited=true;return json({ok:true});}
  state.unexpected.push(p);return route.abort();
 });await page.route('**/api/v2/admin/access',route=>{return route.fulfill({json:{owner:true,permissions:['products','reservations','fittings','settings']}});});await page.route('**/api/v2/admin/administrators?*',route=>route.fulfill({json:{owners:[],items:[],total:0}}));return state;
}
for(const width of [390,768,1440])test('fitting settings, booking QR and administration '+width,async({page})=>{
 const state=await setup(page,{admin:true});await page.setViewportSize({width,height:1000});
 await page.goto(APP+'/admin/nastaveni');await page.locator('summary').filter({hasText:'Zkoušky'}).click();const card=page.getByRole('region',{name:'Zkoušky',exact:true});
 await card.getByLabel('Adresa zkoušky').fill('Adresa zkoušky 22, Praha');
 await card.getByRole('button',{name:'Uložit zkoušky',exact:true}).click();await expect(card.getByRole('status')).toHaveText('Nastavení zkoušek bylo uloženo.');
 await page.screenshot({path:`test-evidence/fittings/settings-${width}.png`,fullPage:true});
 await page.goto(APP+'/zkouska?product=333333333333333333333333');await page.getByRole('button',{name:'11:00',exact:true}).click();
 await page.getByLabel('Jméno a příjmení').fill('Jana Nová');await page.getByLabel('E-mail',{exact:true}).fill('jana@example.test');await page.getByLabel('Telefon',{exact:true}).fill('+420123456789');
 await page.screenshot({path:`test-evidence/fittings/booking-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'Rezervovat a přejít k platbě 200 Kč'}).click();
 await expect(page).toHaveURL(new RegExp('/zkouska/'+number+'#[a-f0-9]{64}$'));
 expect(state.creates).toHaveLength(1);expect(state.creates[0].productId).toBe('333333333333333333333333');
 await expect(page.getByRole('img',{name:'QR platba za zkoušku 200 Kč'})).toHaveAttribute('src',/^data:image\/png/);
 await page.screenshot({path:`test-evidence/fittings/payment-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'Platba odeslána',exact:true}).click();await expect(page.getByRole('heading',{name:'Ověřujeme vaši platbu'})).toBeVisible();
 await expect(page.getByRole('img',{name:'QR platba za zkoušku 200 Kč'})).toHaveCount(0);expect(state.receipt.paymentStatus).toBe('unpaid');
 await page.reload();await expect(page.getByRole('heading',{name:'Ověřujeme vaši platbu'})).toBeVisible();
 await page.goto(APP+'/admin/zkousky');await page.getByRole('button',{name:'Potvrdit přijetí 200 Kč',exact:true}).click();
 await page.getByRole('dialog').getByRole('button',{name:'Potvrdit',exact:true}).click();await expect(page.getByText('Potvrzená',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Označit jako proběhlou'}).click();await page.getByRole('dialog').getByRole('button',{name:'Potvrdit',exact:true}).click();
 await page.getByRole('button',{name:'Uplatnit slevu za zkoušku'}).click();await page.getByLabel('Číslo rezervace').fill('AK-2030-ABC123');await page.getByRole('dialog').getByRole('button',{name:'Potvrdit',exact:true}).click();
 await expect(page.getByRole('link',{name:'AK-2030-ABC123'})).toBeVisible();
 await page.screenshot({path:`test-evidence/fittings/admin-${width}.png`,fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);expect(state.errors).toEqual([]);expect(state.unexpected).toEqual([]);
});
for(const width of [390,768,1440])test('account profile, fitting history and claim '+width,async({page})=>{
 const state=await setup(page,{admin:true});await page.setViewportSize({width,height:1000});
 await page.goto(APP+'/zkouska');
 await expect(page.getByLabel('Jméno a příjmení')).toHaveValue('Jana Nová');
 await expect(page.getByLabel('E-mail',{exact:true})).toHaveValue('jana@example.test');
 await expect(page.getByLabel('Telefon',{exact:true})).toHaveValue('+420123456789');
 await page.getByLabel('Telefon',{exact:true}).fill('+420987654321');
 await page.getByRole('button',{name:'11:00',exact:true}).click();
 await page.getByRole('button',{name:'Rezervovat a přejít k platbě 200 Kč'}).click();
 await expect(page.getByRole('heading',{name:'Vaše zkouška'})).toBeVisible();
 expect(state.createAuth).toBe('Bearer test-admin-token');expect(state.creates[0].phone).toBe('+420987654321');expect(state.creates[0].accountId).toBeUndefined();
 const privateUrl=page.url();
 await page.goto(APP+'/ucet/rezervace');
 const section=page.getByRole('region',{name:'Zkoušky',exact:true});
 await expect(section.getByText(number,{exact:false})).toBeVisible();
 await page.screenshot({path:`test-evidence/fittings/account-${width}.png`,fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await section.getByRole('link',{name:'Platby a podrobnosti zkoušky'}).click();
 await expect(page).toHaveURL(APP+'/zkouska/'+number);
 await page.getByRole('button',{name:'Platba odeslána',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Ověřujeme vaši platbu'})).toBeVisible();
 await page.goto(privateUrl);await page.getByRole('button',{name:'Připojit k účtu',exact:true}).click();
 await expect(page.getByText('Zkouška je uložená ve vašem účtu.')).toBeVisible();
 expect(state.claim.token).toBe(new URL(privateUrl).hash.slice(1));
 expect(state.errors).toEqual([]);expect(state.unexpected).toEqual([]);
});
test('fitting unknown create outcome survives reload and retries same private identity',async({page})=>{
 const state=await setup(page,{lost:true});await page.goto(APP+'/zkouska');
 await page.getByRole('button',{name:'11:30',exact:true}).click();await page.getByLabel('Jméno a příjmení').fill('Jana Nová');await page.getByLabel('E-mail',{exact:true}).fill('jana@example.test');await page.getByLabel('Telefon',{exact:true}).fill('+420123456789');
 await page.getByRole('button',{name:'Rezervovat a přejít k platbě 200 Kč'}).click();await expect(page.getByRole('button',{name:'Ověřit a pokračovat'})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Ověřit a pokračovat'}).click();await expect(page.getByRole('heading',{name:'Vaše zkouška'})).toBeVisible();
 expect(state.creates).toHaveLength(2);expect(state.creates[0]).toEqual(state.creates[1]);expect(state.errors).toEqual([]);
});
test('disabled fitting schedule does not offer submission',async({page})=>{
 const state=await setup(page);state.settings.enabled=false;await page.goto(APP+'/zkouska');await expect(page.getByText('Termíny zkoušek právě připravujeme.',{exact:false})).toBeVisible();await expect(page.getByRole('button',{name:'Rezervovat a přejít k platbě 200 Kč'})).toHaveCount(0);
});

async function fittingPushDestination(type,id){
 const handlers={};let notification,destination,work;
 const self={location:{origin:APP},addEventListener:(name,handler)=>{handlers[name]=handler;},
  registration:{showNotification:async(_title,options)=>{notification=options;}},
  clients:{matchAll:async()=>[],openWindow:async url=>{destination=url;}}};
 require('node:vm').runInNewContext(require('node:fs').readFileSync(require('node:path').join(__dirname,'../public/admin-push-sw.js'),'utf8'),{self,URL});
 handlers.push({data:{json:()=>({type,fittingId:id})},waitUntil:promise=>{work=promise;}});await work;
 handlers.notificationclick({notification:{close(){},data:notification.data},waitUntil:promise=>{work=promise;}});await work;
 expect(destination).toBe(APP+'/admin/zkousky/'+id);return destination;
}
const fittingIds=['aaaaaaaaaaaaaaaaaaaaaaaa','bbbbbbbbbbbbbbbbbbbbbbbb'];
async function detailSetup(page,{signedIn=true}={}){
 const state=await setup(page,{admin:signedIn});state.reads=[];state.detailActions=[];state.failure=null;
 const records=fittingIds.map((id,index)=>({id,number:index?'ZK-BBBBBBBBBBBB':'ZK-AAAAAAAAAAAA',
  date:index?'2030-05-21':'2030-04-14',time:'11:00',price:200,durationMinutes:30,address:'Testovací 12, Praha',
  status:index?'review':'pending',paymentStatus:'unpaid',revision:0,customer:{name:index?'Klient platby':'Klient nové zkoušky',email:'fixture@example.test',phone:'+420123456789'},audit:[],credit:null}));
 state.records=records;
 await page.route(/\/api\/v2\/admin\/fittings(?:\/[^/?]+(?:\/actions)?)?(?:\?.*)?$/,async route=>{
  const req=route.request(),p=new URL(req.url()).pathname,id=p.split('/')[5],record=records.find(r=>r.id===id);
  if(!id){state.reads.push('list');return route.fulfill({json:{items:records}});}
  if(req.method()==='POST'){
   const body=req.postDataJSON();state.detailActions.push({id,...body});expect(body.revision).toBe(record.revision);
   record.revision++;record.status='confirmed';record.paymentStatus='paid';return route.fulfill({json:{ok:true}});
  }
  state.reads.push(id);expect(req.headers().authorization).toBe('Bearer test-admin-token');
  if(state.failure||!record)return route.fulfill({status:state.failure||404,json:{error:{code:state.failure===503?'UNAVAILABLE':'FITTING_NOT_FOUND'}}});
  return route.fulfill({json:record});
 });return state;
}
for(const width of [375,390,430,768,1024,1440])for(const [index,type] of ['fitting_created','fitting_payment_reported'].entries()){
 test(`fitting push opens exact detail and confirms only that fitting ${type} ${width}`,async({page})=>{
  const state=await detailSetup(page);await page.setViewportSize({width,height:1000});
  const destination=await fittingPushDestination(type,fittingIds[index]);
  // Neither fitting belongs to the current month; an old date filter must not hide it.
  await page.goto(destination+'?date=2030-01-01');
  await expect(page.getByRole('heading',{name:'Detail zkoušky',exact:true})).toBeVisible();
  await expect(page.getByText(state.records[index].customer.name,{exact:true})).toBeVisible();
  await expect(page.getByText(state.records[1-index].customer.name,{exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Hledat zkoušky',exact:true})).toHaveCount(0);
  await expect(page.getByText('Platba nepotvrzena',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Potvrdit přijetí 200 Kč',exact:true}).click();
  const dialog=page.getByRole('dialog');await expect(dialog.getByText(state.records[index].number,{exact:false})).toBeVisible();
  expect(state.detailActions).toEqual([]);await dialog.getByRole('button',{name:'Potvrdit',exact:true}).click();
  await expect(page.getByText('Zaplaceno 200 Kč',{exact:true})).toBeVisible();
  expect(state.detailActions).toEqual([{id:fittingIds[index],action:'confirm',revision:0}]);
  expect(state.reads.every(id=>id===fittingIds[index])).toBe(true);
  expect(state.records[1-index].paymentStatus).toBe('unpaid');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({path:`test-evidence/fittings/push-${type}-${width}.png`,fullPage:true});
  await page.getByRole('link',{name:'Všechny zkoušky',exact:true}).click();
  await expect(page).toHaveURL(APP+'/admin/zkousky');await expect(page.getByRole('button',{name:'Hledat zkoušky',exact:true})).toBeVisible();
  expect(state.errors).toEqual([]);expect(state.unexpected).toEqual([]);
 });
}
test('fitting push keeps exact destination through login and guards staff permissions',async({page})=>{
 const state=await detailSetup(page,{signedIn:false}),destination=await fittingPushDestination('fitting_payment_reported',fittingIds[1]);
 await page.goto(destination);await expect(page.getByRole('button',{name:'Přihlásit se',exact:true})).toBeVisible();expect(state.reads).toEqual([]);
 await expect(page).toHaveURL(destination);
 await page.evaluate(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('test-admin-token')})));
 await page.route('**/api/v2/admin/access',route=>route.fulfill({json:{owner:false,permissions:['fittings']}}));
 await page.reload();await expect(page.getByText('Klient platby',{exact:true})).toBeVisible();
 await page.route('**/api/v2/admin/access',route=>route.fulfill({json:{owner:false,permissions:['reservations']}}));
 state.reads=[];await page.reload();await expect(page.getByText('Klient platby',{exact:true})).toHaveCount(0);
 await expect(page.getByRole('alert')).toHaveText('Pro tuto sekci nemáte oprávnění. Vyberte dostupnou sekci v menu.');expect(state.reads).toEqual([]);
});
test('fitting detail handles missing IDs and transient failure without showing another fitting or losing login',async({page})=>{
 const state=await detailSetup(page);
 for(const id of ['000000000000000000000000','not-an-id']){
  await page.goto(APP+'/admin/zkousky/'+id);await expect(page.getByRole('alert')).toHaveText('Zkouška nebyla nalezena.');
  await expect(page.getByRole('button',{name:'Potvrdit přijetí 200 Kč',exact:true})).toHaveCount(0);
 }
 expect(state.reads).toEqual(['000000000000000000000000']);
 state.failure=503;await page.goto(APP+'/admin/zkousky/'+fittingIds[0]);await expect(page.getByRole('alert')).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('persist:auth')).token)).toBe(JSON.stringify('test-admin-token'));
 state.failure=null;await page.reload();await expect(page.getByText('Klient nové zkoušky',{exact:true})).toBeVisible();
 expect(state.errors).toEqual([]);expect(state.unexpected).toEqual([]);
});
