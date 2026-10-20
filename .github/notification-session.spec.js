const {test,expect}=require('@playwright/test');
const APP='http://127.0.0.1:4173';
async function setup(page,{authFail=false}={}){
 const state={authFail,pushFail:true,saveFail:false,topics:['fitting_payment_reported'],writes:[]};
 await page.addInitScript(()=>{
  localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('session-fixture')}));
  window.permissionRequests=0;
  Object.defineProperty(window,'Notification',{configurable:true,value:{permission:'granted',requestPermission:async()=>{window.permissionRequests++;return 'granted';}}});
  Object.defineProperty(window,'PushManager',{configurable:true,value:function(){}});
  Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{register:async()=>({}),getRegistration:async()=>({pushManager:{getSubscription:async()=>({endpoint:'https://fcm.googleapis.com/fcm/send/fixture-endpoint-long-enough',toJSON:()=>({keys:{p256dh:'fixture-public-key',auth:'fixture-auth'}})})}})}});
 });
 await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP,async route=>{
  const p=new URL(route.request().url()).pathname,method=route.request().method();
  const json=(body,status=200)=>route.fulfill({status,json:body});
  if(p==='/api/users/current')return state.authFail?json({},503):json({user:{_id:'aaaaaaaaaaaaaaaaaaaaaaaa',email:'owner@example.test'}});
  if(p.endsWith('/admin/access'))return json({owner:true,permissions:['products','reservations','fittings','settings','partners']});
  if(p.endsWith('/admin/push/config'))return json({enabled:true,publicKey:'fixture'});
  if(p.endsWith('/admin/push/preferences'))return state.pushFail?json({},503):json({subscribed:true,topics:state.topics});
  if(p.endsWith('/admin/push/subscribe')){state.writes.push(route.request().postDataJSON());if(state.saveFail)return json({},503);state.topics=route.request().postDataJSON().topics;return json({ok:true});}
  if(p.endsWith('/admin/settings')||p.endsWith('/site-settings'))return json({sections:{girlsDresses:true,womenDresses:true,suits:true,familyLooks:false}});
  if(p.endsWith('/admin/fitting-settings'))return json({enabled:false,address:'',weekly:Array.from({length:7},(_,day)=>({day,enabled:false,start:'09:00',end:'17:00'})),blockedDates:[]});
  if(p.endsWith('/admin/administrators'))return json({owners:[],items:[],total:0});
  if(p.endsWith('/admin/fittings'))return json({items:[]});
  if(p.endsWith('/admin/products'))return json({items:[],pagination:{page:1,limit:1,total:0,pages:0}});
  if(p.endsWith('/partner/access'))return json({error:{code:'FORBIDDEN'}},403);
  if(p.endsWith('/favorites/storefront'))return json({ids:[]});
  if(p==='/gsi/client')return route.fulfill({contentType:'application/javascript',body:''});
  return json({items:[]});
 });
 return state;
}
for(const width of [375,390,430,768,1024,1440])test('notification settings preserve session and navigation '+width,async({page})=>{
 const state=await setup(page);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width,height:1000});await page.goto(APP+'/admin/zkousky');
 await page.getByRole('link',{name:'Nastavení zkoušek',exact:true}).click();
 await expect(page.locator('#zkousky')).toHaveAttribute('open','');
 await page.locator('summary').filter({hasText:'Upozornění'}).click();
 const region=page.getByLabel('Odběry upozornění na tomto zařízení');
 await expect(region.getByRole('button',{name:'Zkusit znovu'})).toBeVisible();state.pushFail=false;
 await region.getByRole('button',{name:'Zkusit znovu'}).click();
 const checkbox=region.getByRole('checkbox',{name:'Klient oznámil odeslání platby za zkoušku'});await expect(checkbox).toBeChecked();
 const created=region.getByRole('checkbox',{name:'Nová rezervace zkoušky'});await expect(created).not.toBeChecked();
 const transfer=region.getByRole('checkbox',{name:'Klient oznámil odeslání platby za pronájem'});
 const cash=region.getByRole('checkbox',{name:'Klient zvolil platbu hotově při převzetí'});
 await expect(transfer).not.toBeChecked();await expect(cash).not.toBeChecked();
 await created.click();await expect(created).toBeChecked();
 expect(state.topics).toEqual(['fitting_created','fitting_payment_reported']);
 state.saveFail=true;await checkbox.click();await expect(region).toContainText('Původní nastavení zůstalo zachované.');await expect(checkbox).toBeChecked();
 state.saveFail=false;await checkbox.click();await expect(checkbox).not.toBeChecked();
 await expect(page.getByRole('heading',{name:'Nastavení',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('persist:auth')).token)).toBe(JSON.stringify('session-fixture'));
 expect(await page.evaluate(()=>window.permissionRequests)).toBe(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await page.reload();await page.locator('summary').filter({hasText:'Upozornění'}).click();await expect(checkbox).not.toBeChecked();await expect(created).toBeChecked();
 expect(state.topics).toEqual(['fitting_created']);
 await cash.click();await expect(cash).toBeChecked();await expect(transfer).not.toBeChecked();
 state.saveFail=true;await transfer.click();await expect(region).toContainText('Původní nastavení zůstalo zachované.');await expect(transfer).not.toBeChecked();await expect(cash).toBeChecked();
 state.saveFail=false;await transfer.click();await expect(transfer).toBeChecked();
 expect(state.topics).toEqual(['fitting_created','reservation_payment_reported','reservation_cash_selected']);
 await page.reload();await page.locator('summary').filter({hasText:'Upozornění'}).click();await expect(transfer).toBeChecked();await expect(cash).toBeChecked();await expect(checkbox).not.toBeChecked();
 expect(await page.evaluate(()=>window.permissionRequests)).toBe(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await region.scrollIntoViewIfNeeded();
 await page.screenshot({path:'test-evidence/notification-session/settings-'+width+'.png'});
 expect(errors).toEqual([]);
});
test('cold admin session retries after 503 without losing persisted login',async({page})=>{
 const state=await setup(page,{authFail:true});await page.goto(APP+'/admin/nastaveni');
 await expect(page.getByText('Administraci se nepodařilo načíst')).toBeVisible();state.authFail=false;
 await page.getByRole('button',{name:'Zkusit znovu'}).click();
 await expect(page.getByRole('heading',{name:'Nastavení',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('persist:auth')).token)).toBe(JSON.stringify('session-fixture'));
});

test('admin entry never falls back to Blaze while admin permission is pending',async({page})=>{
 await setup(page);let release;
 await page.route('**/api/v2/partner/access',r=>r.fulfill({json:{enabled:true,partnerId:'blaze',role:'administrator',owner:true}}));
 await page.route('**/api/v2/admin/access',async r=>{await new Promise(resolve=>{release=resolve;});await r.fulfill({json:{owner:true,permissions:['settings']}});});
 await page.goto(APP+'/ucet');await expect.poll(()=>!!release).toBe(true);
 await expect(page.locator('a[href="/partner/blaze"]')).toHaveCount(0);
 release();await expect(page.getByRole('link',{name:'Administrace',exact:true})).toHaveAttribute('href','/admin');
});
for(const role of ['administrator','photographer','customer'])test('dashboard entry respects '+role,async({page})=>{
 await setup(page);
 await page.route('**/api/v2/admin/access',r=>r.fulfill({status:403,json:{error:{code:'ADMIN_FORBIDDEN'}}}));
 await page.route('**/api/v2/partner/access',r=>r.fulfill({status:role==='customer'?403:200,json:role==='customer'?{error:{code:'FORBIDDEN'}}:{enabled:true,partnerId:'blaze',role}}));
 await page.goto(APP+'/ucet');await expect(page.getByRole('heading',{name:'Můj účet',exact:true})).toBeVisible();
 if(role==='customer')await expect(page.getByRole('link',{name:'Administrace',exact:true})).toHaveCount(0);
 else await expect(page.getByRole('link',{name:'Administrace',exact:true})).toHaveAttribute('href','/partner/blaze');
});
test('admin API outage does not redirect an owner to Blaze',async({page})=>{
 await setup(page);
 await page.route('**/api/v2/admin/access',r=>r.fulfill({status:503,json:{error:{code:'ADMIN_API_DISABLED'}}}));
 await page.route('**/api/v2/partner/access',r=>r.fulfill({json:{enabled:true,partnerId:'blaze',role:'administrator',owner:true}}));
 await page.goto(APP+'/ucet');await expect(page.getByRole('heading',{name:'Můj účet',exact:true})).toBeVisible();
 await expect(page.locator('a[href="/partner/blaze"]')).toHaveCount(0);
});
