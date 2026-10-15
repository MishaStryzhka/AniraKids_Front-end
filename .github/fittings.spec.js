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
  if(p==='/api/users/current')return json({user:{_id:'admin-user'}});
  if(p.endsWith('/favorites/storefront'))return json({ids:[]});
  if(p==='/api/v2/site-settings')return json({sections:{suits:true,familyLooks:false}});
  if(p==='/api/v2/admin/products')return json({items:[],pagination:{page:1,limit:1,total:0,pages:0}});
  if(p==='/api/v2/admin/settings')return json({sections:{suits:true,familyLooks:false}});
  if(p==='/api/v2/admin/fitting-settings'){if(req.method()==='PATCH')state.settings=req.postDataJSON();return json(state.settings);}
  if(p==='/api/v2/fittings/slots')return json({enabled:state.settings.enabled,date:u.searchParams.get('date'),slots:['11:00','11:30','12:00'],durationMinutes:30,price:200});
  if(p==='/api/v2/fittings'&&req.method()==='POST'){
   state.creates.push(req.postDataJSON());const b=req.postDataJSON();
   state.receipt={number,date:b.date,time:b.time,durationMinutes:30,price:200,address:state.settings.address,status:'pending',paymentStatus:'unpaid',expiresAt:'2030-01-01T08:30:00Z',paymentInstructions:{amount:200,accountNumber:'123456/0800',message:number,qrPayload:'SPD*1.0*ACC:CZ0708000000006644781399*AM:200.00*CC:CZK*MSG:'+number}};
   if(state.lost){state.lost=false;return route.abort();}return json(state.receipt);
  }
  if(p==='/api/v2/fittings/'+number)return json(state.receipt);
  if(p==='/api/v2/fittings/'+number+'/payment-sent'){state.receipt={...state.receipt,status:'review',paymentInstructions:null};return json(state.receipt);}
  if(p==='/api/v2/fittings/'+number+'/cancel'){state.receipt={...state.receipt,status:'cancelled',paymentInstructions:null};return json(state.receipt);}
  if(p==='/api/v2/admin/fittings')return json({items:[{...state.receipt,number,date:'2030-01-07',time:'11:00',durationMinutes:30,price:200,address:state.settings.address,status:state.adminStatus||'review',paymentStatus:state.adminStatus?'paid':'unpaid',id:'111111111111111111111111',revision:state.actions.length,customer:{name:'Jana Nová',email:'jana@example.test',phone:'+420123456789'},audit:[],credit:state.credited?{reservationId:'222222222222222222222222',reservationNumber:'AK-2030-ABC123'}:null}]});
  if(p==='/api/v2/admin/fittings/111111111111111111111111/actions'){state.actions.push(req.postDataJSON());if(req.postDataJSON().action==='confirm')state.adminStatus='confirmed';if(req.postDataJSON().action==='complete')state.adminStatus='completed';if(req.postDataJSON().action==='credit')state.credited=true;return json({ok:true});}
  state.unexpected.push(p);return route.abort();
 });return state;
}
for(const width of [390,768,1440])test('fitting settings, booking QR and administration '+width,async({page})=>{
 const state=await setup(page,{admin:true});await page.setViewportSize({width,height:1000});
 await page.goto(APP+'/admin/nastaveni');const card=page.getByRole('region',{name:'Zkoušky',exact:true});
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
 await page.getByRole('button',{name:'Započíst 200 Kč do pronájmu'}).click();await page.getByLabel('Číslo rezervace').fill('AK-2030-ABC123');await page.getByRole('dialog').getByRole('button',{name:'Potvrdit',exact:true}).click();
 await expect(page.getByRole('link',{name:'AK-2030-ABC123'})).toBeVisible();
 await page.screenshot({path:`test-evidence/fittings/admin-${width}.png`,fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);expect(state.errors).toEqual([]);expect(state.unexpected).toEqual([]);
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
