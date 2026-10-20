const {test,expect}=require('@playwright/test');
const fs=require('fs');
const APP='http://127.0.0.1:4173';
async function fixture(page){
 const state={reads:[],exports:[],writes:[],errors:[],processed:0};
 const snapshot={buyer:{name:'Žofie Černá',address:'Praha',email:'zofie@example.test',ico:''},lines:[{description:'Zkouška',amount:200}],total:200,paid:200,balance:0,deposit:0,serviceDate:'2030-04-10'};
 const items=[{_id:'i1',number:'2030-0001',sourceType:'fitting',sourceNumber:'ZK-FIRST',issuedAt:'2030-04-10T08:00:00Z',snapshot},
  {_id:'i2',number:'2030-0002',sourceType:'reservation',sourceNumber:'AK-SECOND',issuedAt:'2030-04-10T09:00:00Z',snapshot:{...snapshot,buyer:{...snapshot.buyer,name:'Jana Nová',email:'jana@example.test'}}}];
 await page.clock.setFixedTime(new Date('2030-04-15T12:00:00Z'));
 page.on('pageerror',e=>state.errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('fixture-admin')})));
 await page.route(url=>url.origin!==APP,async route=>{
  const req=route.request(),url=new URL(req.url()),p=url.pathname,json=x=>route.fulfill({json:x});
  if(req.method()==='POST')state.writes.push({path:p,body:req.postDataJSON()});
  if(p==='/api/users/current')return json({user:{_id:'admin1'}});
  if(p==='/api/users/favorites/storefront')return json({favorites:[]});
  if(p.endsWith('/admin/access'))return json({owner:true,permissions:[]});
  if(p.endsWith('/invoices/pending'))return json({items:[]});
  if(p.endsWith('/invoices/export')){state.exports.push(url.searchParams.get('period'));return route.fulfill({contentType:'application/zip',body:'fixture ZIP'});}
  if(p.endsWith('/invoices/process')){state.processed++;items.push({_id:'i3',number:'2030-0003',sourceType:'fitting',sourceNumber:'ZK-NEW',issuedAt:'2030-04-15T12:00:00Z',snapshot});return json({status:'issued',number:'2030-0003',emailStatus:'sent'});}
  if(p.endsWith('/invoices')){state.reads.push(url.searchParams.get('period'));return json({items});}
  return route.abort();
 });
 return state;
}
for(const width of [375,390,430,768,1024,1440])test(`compact invoice toolbar, search, period and dialog at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:1000});const state=await fixture(page);
 await page.goto(APP+'/admin/faktury');
 await expect(page.getByText('Faktura 2030-0001',{exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:/^Faktura /})).toHaveText(['Faktura 2030-0002','Faktura 2030-0001']);
 await expect(page.getByLabel('Měsíc vystavení')).toBeHidden();
 await expect(page.getByLabel('Číslo zkoušky / rezervace')).toHaveCount(0);
 const refresh=page.getByRole('button',{name:'Obnovit faktury',exact:true});
 const heading=page.getByRole('heading',{name:'Faktury',exact:true});
 expect((await refresh.boundingBox()).x).toBeLessThan((await heading.boundingBox()).x);
 await expect(page.getByRole('button',{name:'Nová faktura',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Hledat faktury',exact:true}).click();
 const search=page.getByRole('textbox',{name:'Hledat fakturu',exact:true});await expect(search).toBeFocused();
 for(const text of ['zofie cerna','ZK-FIRST','2030-0001','zofie@example.test']){
  await search.fill(text);await expect(page.getByText('Faktura 2030-0001',{exact:true})).toBeVisible();await expect(page.getByText('Faktura 2030-0002',{exact:true})).toHaveCount(0);
 }
 await search.fill('nenalezeno');await expect(page.getByText('Žádné faktury neodpovídají hledání v tomto období.')).toBeVisible();
 await page.getByRole('button',{name:'Vymazat hledání'}).click();await expect(page.getByText('Faktura 2030-0002',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Hledat faktury',exact:true}).click();
 await page.getByRole('button',{name:'Filtry',exact:true}).click();
 await page.getByLabel('Měsíc vystavení').fill('2029-12');await expect.poll(()=>state.reads.at(-1)).toBe('2029-12');
 await page.getByLabel('Celý rok').check();await expect.poll(()=>state.reads.at(-1)).toBe('2029');
 await page.getByRole('button',{name:'Filtry (1)',exact:true}).click();await expect(page.getByLabel('Měsíc vystavení')).toBeHidden();await expect(page.getByText('Období: 2029',{exact:true})).toBeVisible();
 const count=state.reads.length;await refresh.click();await expect.poll(()=>state.reads.length).toBe(count+1);expect(state.reads.at(-1)).toBe('2029');
 await expect(page.getByRole('heading',{name:/^Faktura /})).toHaveText(['Faktura 2030-0002','Faktura 2030-0001']);
 const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Export pro účetní (ZIP)'}).click();expect((await downloaded).suggestedFilename()).toBe('faktury-2029.zip');expect(state.exports).toEqual(['2029']);
 const create=page.getByRole('button',{name:'Nová faktura',exact:true});await create.click();
 const dialog=page.getByRole('dialog',{name:'Nová faktura',exact:true});await expect(dialog).toBeVisible();
 await dialog.getByLabel('Číslo zkoušky / rezervace').fill('ZK-DRAFT');
 expect(await dialog.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(false);
 fs.mkdirSync('test-evidence/payments',{recursive:true});await page.screenshot({path:`test-evidence/payments/invoice-dialog-${width}.png`,fullPage:true});
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(create).toBeFocused();
 await create.click();await expect(dialog.getByLabel('Číslo zkoušky / rezervace')).toHaveValue('ZK-DRAFT');await dialog.getByRole('button',{name:'Zavřít',exact:true}).click();await expect(create).toBeFocused();
 expect(state.writes).toEqual([]);expect(state.errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.screenshot({path:`test-evidence/payments/invoice-toolbar-${width}.png`,fullPage:true});
});
test('new invoice switches to automatic confirmation without stacked dialogs or losing its draft',async({page})=>{
 const state=await fixture(page);await page.goto(APP+'/admin/faktury');await page.getByRole('button',{name:'Nová faktura',exact:true}).click();
 await page.getByLabel('Číslo zkoušky / rezervace').fill('ZK-FIRST');await page.getByRole('button',{name:'Vystavit a odeslat z přijaté platby'}).click();
 await expect(page.getByRole('dialog')).toHaveCount(1);await expect(page.getByRole('dialog')).toHaveAccessibleName('Faktura z přijaté platby');expect(state.writes).toEqual([]);
 await page.getByRole('button',{name:'Zpět',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(1);await expect(page.getByLabel('Číslo zkoušky / rezervace')).toHaveValue('ZK-FIRST');
 await page.getByRole('button',{name:'Vystavit a odeslat z přijaté platby'}).click();await page.getByRole('button',{name:'Potvrdit vystavení a odeslání'}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByRole('button',{name:'Nová faktura',exact:true})).toBeFocused();expect(state.processed).toBe(1);expect(state.errors).toEqual([]);
 await expect(page.getByRole('heading',{name:/^Faktura /})).toHaveText(['Faktura 2030-0003','Faktura 2030-0002','Faktura 2030-0001']);
});
