const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');
const APP='http://127.0.0.1:4173',API='http://admin-api.test';
const EVIDENCE=process.env.ADMIN_FE03A01_EVIDENCE_DIR||'test-evidence/admin-fe03a01';
fs.mkdirSync(EVIDENCE,{recursive:true});
const snapshot={inventoryItemId:'i1',productName:'Slavnostní dětské šaty Sofia s dlouhým názvem produktu',size:'98–104'};
const reservation=(id,status,startDate,endDate,occupiedThrough,extra={})=>({id,reservationNumber:'AK-2026-'+id,status,rentalMode:'external',startDate,endDate,occupiedThrough,customerName:'Jana Nováková-Svobodová s delším příjmením',items:[{...snapshot,inventoryItemId:'item-'+id}],...extra});
const fixtures=[
 reservation('001','returned','2026-09-29','2026-10-05','2026-10-09'),
 reservation('002','pending','2026-10-07','2026-10-07','2026-10-07',{rentalMode:'studio',expiresAt:'2026-10-07T12:15:00Z'}),
 reservation('003','confirmed','2026-10-07','2026-10-09','2026-10-12'),
 reservation('004','future_status','2026-10-07','2026-10-08','2026-10-08',{customerName:''}),
];
async function mocks(page,options={}){
 const state={requests:[],writes:[],pageErrors:[],fail:false,malformed:false,deferred:{}};
 page.on('pageerror',error=>state.pageErrors.push(error.message));
 await page.clock.setFixedTime(new Date('2026-10-07T12:00:00Z'));
 await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('admin-test-token')})));
 await page.route('**/api/users/current',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({user:{_id:'admin-user'}})}));
 await page.route(url=>url.origin===API,async route=>{
  const request=route.request(),url=new URL(request.url());
  const json=(status,body)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(request.method()!=='GET'){state.writes.push(request.method());return route.abort('failed');}
  if(url.pathname==='/api/v2/admin/products')return json(200,{items:[],pagination:{page:1,limit:1,total:0,pages:0}});
  if(url.pathname==='/api/v2/admin/reservations/calendar'){
   const from=url.searchParams.get('from'),to=url.searchParams.get('to');state.requests.push({from,to,keys:[...url.searchParams.keys()],authorization:request.headers().authorization});
   if(options.deferMonths?.includes(from))await new Promise(resolve=>{state.deferred[from]=resolve});
   if(state.fail)return json(503,{error:{code:'UPSTREAM_FAILURE',message:'Do not display raw backend message'}});
   if(state.malformed)return json(200,{items:[{...fixtures[0],endDate:'invalid'}]});
   if(options.access)return json(options.access,{error:{code:options.access===403?'ADMIN_FORBIDDEN':'ADMIN_UNAUTHORIZED'}});
   const items=options.empty?[]:fixtures.filter(item=>item.startDate<=to&&item.occupiedThrough>=from);
   return json(200,{items});
  }
  return route.abort('failed');
 });
 return state;
}
const day=(page,value)=>page.locator(`[data-calendar-day="${value}"]`);
const cards=page=>page.locator('[data-calendar-reservation]');
async function ready(page){await page.goto(APP+'/admin/kalendar');await expect(page.getByRole('heading',{name:'Kalendář pronájmů',exact:true})).toBeVisible();await expect(page.locator('[data-calendar-loaded]')).toBeVisible();}
async function capture(page,name){await page.screenshot({path:path.join(EVIDENCE,name+'.png'),fullPage:true});}
async function assertSelectedContrast(button){
 // Read the settled DS state; background colors use the existing short transition.
 await expect.poll(()=>button.evaluate(element=>{
  const style=getComputedStyle(element);
  const luminance=color=>{const channels=color.match(/[\d.]+/g).slice(0,3).map(Number).map(value=>{const unit=value/255;return unit<=0.04045?unit/12.92:Math.pow((unit+0.055)/1.055,2.4)});return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722};
  const foreground=luminance(style.color),background=luminance(style.backgroundColor);return (Math.max(foreground,background)+0.05)/(Math.min(foreground,background)+0.05);
 })).toBeGreaterThanOrEqual(4.5);
}

for(const width of [375,390,430,768,1024,1440])test('read-only calendar responsive '+width,async({page})=>{
 const state=await mocks(page);await page.setViewportSize({width,height:1000});await ready(page);await expect(cards(page)).toHaveCount(4);await expect(page.getByText('Vrácená',{exact:true})).toBeVisible();await expect(page.getByText('Čeká na potvrzení',{exact:true})).toBeVisible();await expect(page.getByText('Neznámý stav',{exact:true})).toBeVisible();await expect(page.getByText('Jméno neuvedeno',{exact:true})).toBeVisible();
 const select=page.getByLabel('Vybraný den');if(width<768){await expect(select).toBeVisible();await expect(day(page,'2026-10-07')).toBeHidden();await select.selectOption('2026-10-09');await expect(cards(page)).toHaveCount(2);}else{
  await expect(select).toBeHidden();await expect(day(page,'2026-10-07')).toHaveAttribute('aria-current','date');await expect(day(page,'2026-10-07')).toHaveAttribute('aria-pressed','true');
  for(const button of await page.locator('[data-calendar-day]').all()){const box=await button.boundingBox();expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);}
  await day(page,'2026-10-09').click();await expect(cards(page)).toHaveCount(2);await assertSelectedContrast(day(page,'2026-10-09'));
 }
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);expect(overflow).toBeLessThanOrEqual(1);await expect(page.getByText('Navazující obsazení / čištění',{exact:true})).toBeVisible();await capture(page,'calendar-'+width);
 fs.writeFileSync(path.join(EVIDENCE,'geometry-'+width+'.json'),JSON.stringify({width,overflow,daySelection:width<768?'native-select':'day-buttons',cards:await cards(page).count()},null,2));
 expect(state.requests).toEqual([{from:'2026-10-01',to:'2026-10-31',keys:['from','to'],authorization:'Bearer admin-test-token'}]);expect(state.writes).toEqual([]);expect(state.pageErrors).toEqual([]);
});
test('calendar day buttons are ordinary keyboard controls and preserve source ranges through cleaning',async({page})=>{
 await mocks(page);await page.setViewportSize({width:1024,height:1000});await ready(page);await day(page,'2026-10-09').focus();await page.keyboard.press('Enter');await expect(day(page,'2026-10-09')).toHaveAttribute('aria-pressed','true');await expect(day(page,'2026-10-09')).toBeFocused();await assertSelectedContrast(day(page,'2026-10-09'));await day(page,'2026-10-09').hover();await assertSelectedContrast(day(page,'2026-10-09'));await page.mouse.down();await assertSelectedContrast(day(page,'2026-10-09'));await page.mouse.up();await page.mouse.move(0,0);await assertSelectedContrast(day(page,'2026-10-09'));
 const returned=page.locator('[data-calendar-reservation="001"]');await expect(returned).toContainText('29. září 2026 – 5. října 2026');await expect(returned).toContainText('9. října 2026');await expect(returned.getByRole('link')).toHaveCount(0);await expect(page.getByRole('status')).toContainText('Počet rezervací: 2.');
});
test('month navigation clears old data and a late earlier request cannot overwrite the selected month',async({page})=>{
 const state=await mocks(page,{deferMonths:['2026-11-01']});await ready(page);await page.getByRole('button',{name:'Další měsíc'}).click();await expect(page.getByText('Načítání kalendáře…')).toBeVisible();await expect(cards(page)).toHaveCount(0);await expect.poll(()=>Boolean(state.deferred['2026-11-01'])).toBe(true);await page.getByRole('button',{name:'Další měsíc'}).click();await expect(page.getByRole('heading',{name:'prosinec 2026',exact:true})).toBeVisible();await expect(page.getByText('Žádné rezervace v tomto období')).toBeVisible();state.deferred['2026-11-01']();await expect(page.getByRole('heading',{name:'prosinec 2026',exact:true})).toBeVisible();await expect(cards(page)).toHaveCount(0);await page.getByRole('button',{name:'Dnes',exact:true}).click();await expect(cards(page)).toHaveCount(4);expect(state.writes).toEqual([]);
});
test('failed reload and malformed payload show error, never empty availability; manual retry recovers',async({page})=>{
 const state=await mocks(page);await ready(page);state.fail=true;await page.getByRole('button',{name:'Obnovit',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Kalendář se nepodařilo načíst');await expect(cards(page)).toHaveCount(0);await expect(page.getByText('Žádné rezervace v tomto období')).toHaveCount(0);await expect(page.getByText('Do not display raw backend message')).toHaveCount(0);state.fail=false;state.malformed=true;await page.getByRole('button',{name:'Zkusit znovu',exact:true}).click();await expect(page.getByRole('alert')).toBeVisible();state.malformed=false;await page.getByRole('button',{name:'Zkusit znovu',exact:true}).click();await expect(cards(page)).toHaveCount(4);expect(state.writes).toEqual([]);await capture(page,'recovered');
});
test('typed forbidden response uses the existing Admin access boundary',async({page})=>{
 const state=await mocks(page,{access:403});await page.goto(APP+'/admin/kalendar');await expect(page.getByText('Nemáte oprávnění k administraci.')).toBeVisible();await expect(cards(page)).toHaveCount(0);expect(state.writes).toEqual([]);
});
test('short viewport and enlarged text keep mobile actions readable without horizontal overflow',async({page})=>{
 await mocks(page);await page.setViewportSize({width:390,height:360});await ready(page);await page.addStyleTag({content:'[data-admin-calendar-page] {font-size:200%} [data-calendar-reservation] {font-size:200%;line-height:1.5}'});expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);await capture(page,'short-enlarged');
});
