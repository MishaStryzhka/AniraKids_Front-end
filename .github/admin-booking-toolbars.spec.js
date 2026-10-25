const {test,expect}=require('@playwright/test');
const APP='http://127.0.0.1:4173',productId='222222222222222222222222',variantId='333333333333333333333333';
async function fixture(page){
 const state={writes:[],queries:[],errors:[],lost:true};
 page.on('pageerror',e=>state.errors.push(e.message));
 await page.clock.install({time:new Date('2030-01-01T08:00:00Z')});
 await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('fixture-admin')})));
 await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP,async route=>{
  const req=route.request(),u=new URL(req.url()),p=u.pathname,json=(body,status=200)=>route.fulfill({status,json:body});
  if(p==='/api/users/current')return json({user:{_id:'admin-user'}});
  if(p==='/api/v2/admin/access')return json({owner:true,permissions:['products','reservations','fittings','settings']});
  if(p==='/api/v2/admin/booking-catalogue')return json({items:[{id:productId,name:'Dámské šaty DAM001',variants:[{id:variantId,size:'M'}]}]});
  if(p.endsWith('/availability'))return json({availability:{...Object.fromEntries(u.searchParams),productId,available:true,checkedAt:'2030-01-01T08:00:00Z',pricing:{rentalPrice:600,deposit:0,totalDue:600}}});
  if(p==='/api/v2/admin/reservations'&&req.method()==='POST'){state.writes.push({body:req.postDataJSON(),key:req.headers()['idempotency-key']});if(state.lost){state.lost=false;return route.abort();}return json({id:'444444444444444444444444',reservationNumber:'AK-2030-ABC123'},201);}
  if(p==='/api/v2/admin/reservations'){state.queries.push(Object.fromEntries(u.searchParams));return json({items:[],pagination:{page:1,limit:20,total:0,pages:0}});}
  if(p.startsWith('/api/v2/admin/reservations/'))return json({error:{code:'RESERVATION_NOT_FOUND'}},404);
  if(p==='/api/v2/fittings/slots')return json({enabled:true,date:u.searchParams.get('date'),slots:['11:00','12:00'],durationMinutes:30,price:200});
  if(p==='/api/v2/admin/fittings'&&req.method()==='POST'){const b=req.postDataJSON();state.writes.push({body:b});return json({number:'ZK-ABCDEF123456',date:b.date,time:b.time},201);}
  if(p==='/api/v2/admin/fittings')return json({items:[7,9].map(day=>({id:'fit'+day,number:'ZK-ABCDEF12345'+day,date:'2030-01-0'+day,time:'11:00',durationMinutes:30,price:200,address:'Praha',status:'confirmed',paymentStatus:'paid',revision:0,customer:{name:day===7?'Jana Nová':'Eva Malá',email:day===7?'jana@example.test':'eva@example.test',phone:'+420123456789'},audit:[],credit:null}))});
  if(p==='/api/v2/admin/products')return json({items:[],pagination:{page:1,limit:1,total:0,pages:0}});
  if(p==='/api/v2/site-settings')return json({cooperationActive:true,sections:{suits:true,familyLooks:false}});
  if(p==='/gsi/client')return route.fulfill({contentType:'application/javascript',body:''});
  return json({error:{code:'NOT_FOUND'}},404);
 });return state;
}
for(const width of [390,768,1440])test('compact booking toolbars and admin creation '+width,async({page})=>{
 const state=await fixture(page);await page.setViewportSize({width,height:950});
 await page.goto(APP+'/admin/rezervace');
 await expect(page.getByLabel('Hledat rezervaci')).toBeHidden();await expect(page.getByLabel('Stav',{exact:true})).toBeHidden();
 await page.getByRole('button',{name:'Hledat rezervace',exact:true}).click();await expect(page.getByLabel('Hledat rezervaci')).toBeFocused();
 await page.getByLabel('Hledat rezervaci').fill('jana@example.test');await page.getByRole('button',{name:'Vyhledat',exact:true}).click();
 await expect.poll(()=>state.queries.at(-1)?.q).toBe('jana@example.test');expect(page.url()).not.toContain('jana');
 await page.getByRole('button',{name:'Filtry',exact:true}).click();await page.getByLabel('Stav',{exact:true}).selectOption('confirmed');await page.getByRole('button',{name:'Použít filtry'}).click();
 await expect(page.getByRole('button',{name:'Filtry (1)',exact:true})).toBeVisible();
 await page.screenshot({path:`test-evidence/admin-toolbars/reservations-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'Nová rezervace'}).click();const dialog=page.getByRole('dialog');
 await dialog.getByLabel('Produkt',{exact:true}).selectOption(productId);await dialog.getByLabel('Velikost',{exact:true}).selectOption(variantId);await dialog.getByRole('button',{name:'Přidat oblečení'}).click();
 await dialog.getByLabel('Jméno',{exact:true}).fill('Jana');await dialog.getByLabel('Příjmení',{exact:true}).fill('Nová');await dialog.getByLabel('E-mail',{exact:true}).fill('jana@example.test');await dialog.getByLabel('Telefon',{exact:true}).fill('+420123456789');
 await dialog.getByRole('button',{name:'Ověřit dostupnost a cenu'}).click();await dialog.getByRole('button',{name:'Potvrdit a vytvořit rezervaci'}).click();
 await expect(dialog.getByRole('alert')).toBeVisible();await dialog.getByRole('button',{name:'Ověřit vytvoření rezervace'}).click();
 await expect(page).toHaveURL(/\/admin\/rezervace\/444444444444444444444444$/);expect(state.writes).toHaveLength(2);expect(state.writes[0]).toEqual(state.writes[1]);
 await page.goto(APP+'/admin/zkousky');await expect(page.getByLabel('Měsíc',{exact:true})).toHaveCount(0);
 const cards=page.locator('h2').filter({hasText:/ledna 2030/});await expect(cards.first()).toContainText('7. ledna');
 await page.getByRole('button',{name:/Řazení:/}).click();await expect(cards.first()).toContainText('9. ledna');
 await page.getByRole('button',{name:'Hledat zkoušky',exact:true}).click();await page.getByLabel('Hledat zkoušky ve vybraném období').fill('nova');await expect(cards).toHaveCount(1);
 await page.getByRole('button',{name:'Zrušit hledání'}).click();await page.getByRole('button',{name:'Hledat zkoušky',exact:true}).click();
 await page.screenshot({path:`test-evidence/admin-toolbars/fittings-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'Nová zkouška',exact:true}).click();await dialog.getByLabel('Volný čas').selectOption('11:00');await dialog.getByLabel('Jméno a příjmení klienta').fill('Jana Nová');await dialog.getByLabel('E-mail klienta').fill('jana@example.test');await dialog.getByLabel('Telefon klienta').fill('+420123456789');
 await page.screenshot({path:`test-evidence/admin-toolbars/new-fitting-${width}.png`,fullPage:true});
 await dialog.getByRole('button',{name:'Rezervovat zkoušku',exact:true}).click();await expect(page.getByText('Zkouška byla vytvořena.')).toBeVisible();expect(state.writes).toHaveLength(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);expect(state.errors).toEqual([]);
});
