const {test,expect}=require('@playwright/test');
const APP='http://127.0.0.1:4173';
async function fixture(page,options={}){
 const state={sections:{suits:true,familyLooks:false},patches:[],queries:[],unexpected:[],fail:options.fail||false,readFail:options.readFail||false};
 if(!options.guest) await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('admin-test-token')})));
 await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP,async route=>{
  const req=route.request(),u=new URL(req.url()),p=u.pathname;
  const json=(body,status=200)=>route.fulfill({status,json:body});
  if(p==='/api/users/current')return json({user:{_id:'admin-user'}});
  if(p.endsWith('/favorites/storefront'))return json({ids:[]});
  if(p==='/maps/api/js'||p==='/gsi/client')return route.fulfill({contentType:'application/javascript',body:''});
  if(p==='/api/v2/admin/products')return json({items:[],pagination:{page:1,limit:1,total:0,pages:0}});
  if(p==='/api/v2/site-settings')return state.readFail?json({},503):json({sections:state.sections});
  if(p==='/api/v2/admin/settings'){
   if(req.method()==='PATCH'){
    state.patches.push(req.postDataJSON());
    if(state.fail){state.fail=false;return json({error:{code:'UPSTREAM_ERROR',message:'test'}},503);}
    Object.assign(state.sections,req.postDataJSON().sections);
   }
   return json({sections:state.sections});
  }
  if(p==='/api/v2/catalogue/products'){
   state.queries.push(Object.fromEntries(u.searchParams));
   return json({items:[],page:1,limit:12,total:0,totalPages:0,facets:{colors:[],sizes:[]}});
  }
  state.unexpected.push(p);return route.abort();
 });
 return state;
}
for(const width of [390,768,1024,1440])test('section settings persist and control storefront '+width,async({page})=>{
 const state=await fixture(page),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width,height:1000});await page.goto(APP+'/admin/nastaveni');
 await expect(page.getByRole('heading',{name:'Nastavení',exact:true})).toBeVisible();
 const suits=page.getByLabel('Chlapecké obleky',{exact:true}),family=page.getByLabel('Family looky',{exact:true}),save=page.getByRole('button',{name:'Uložit',exact:true});
 await expect(suits).toBeChecked();await expect(family).not.toBeChecked();await expect(save).toBeDisabled();
 await suits.uncheck();await family.check();await save.click();await expect(page.getByRole('status')).toContainText('Nastavení bylo uloženo');
 expect(state.patches).toEqual([{sections:{suits:false,familyLooks:true}}]);
 await page.reload();await expect(suits).not.toBeChecked();await expect(family).toBeChecked();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await page.screenshot({path:'test-evidence/site-settings/admin-'+width+'.png'});
 await page.goto(APP+'/');
 await expect(page.locator('footer a[href="/family-looky"]')).toBeVisible();
 await expect(page.locator('a[href="/obleky"]')).toHaveCount(0);
 await expect(page.locator('main a[href="/family-looky"]')).toBeVisible();
 await page.goto(APP+'/obleky');await expect(page.getByRole('heading',{name:'Tato sekce momentálně není dostupná'})).toBeVisible();
 await page.goto(APP+'/family-looky');await expect(page.getByRole('heading',{name:'Family looky',exact:true})).toBeVisible();
 await expect.poll(()=>state.queries.some(q=>q.familyLook==='true')).toBe(true);
 // All sections enabled: header must fit even with the admin entry.
 state.sections.suits=true;await page.reload();
 await expect(page.locator('footer a[href="/obleky"]')).toBeVisible();
 if(width<1024){
  await page.locator('[data-menu-trigger]:visible').click();
  await expect(page.locator('#mobile-menu a[href="/family-looky"]')).toBeVisible();
  await expect(page.locator('#mobile-menu a[href="/obleky"]')).toBeVisible();
 } else {
  const nav=page.getByRole('navigation',{name:'Hlavní navigace'});
  await expect(nav.getByRole('link',{name:'Family looky'})).toBeVisible();
  const last=await nav.getByRole('link').last().boundingBox(),utilities=await page.locator('[data-desktop-utilities]').boundingBox();
  expect(last.x+last.width).toBeLessThanOrEqual(utilities.x);

 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await page.screenshot({path:'test-evidence/site-settings/navigation-'+width+'.png'});
 expect(state.unexpected).toEqual([]);expect(errors).toEqual([]);
});
test('failed save preserves draft, dirty navigation asks, retry persists only changed key',async({page})=>{
 const state=await fixture(page,{fail:true});await page.setViewportSize({width:1440,height:1000});await page.goto(APP+'/admin/nastaveni');
 await page.getByLabel('Family looky',{exact:true}).check();
 await page.getByRole('link',{name:'Zpět na web',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'Neuložené změny'})).toBeVisible();
 await page.getByRole('button',{name:'Zůstat',exact:true}).click();await expect(page.getByLabel('Family looky',{exact:true})).toBeChecked();
 await page.getByRole('button',{name:'Uložit',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Uložení se nepodařilo potvrdit');
 await expect(page.getByLabel('Family looky',{exact:true})).toBeChecked();
 await page.getByRole('button',{name:'Uložit',exact:true}).click();await expect(page.getByRole('status')).toContainText('Nastavení bylo uloženo');
 expect(state.patches).toEqual([{sections:{familyLooks:true}},{sections:{familyLooks:true}}]);
 await page.getByRole('link',{name:'Zpět na web',exact:true}).click();await expect(page).toHaveURL(APP+'/');
});
test('unavailable settings hide optional links and retry restores current values',async({page})=>{
 const state=await fixture(page,{readFail:true});await page.goto(APP+'/obleky');
 await expect(page.getByRole('heading',{name:'Sekci se nepodařilo načíst'})).toBeVisible();
 await expect(page.locator('a[href="/obleky"]')).toHaveCount(0);
 await expect(page.locator('a[href="/family-looky"]')).toHaveCount(0);
 state.readFail=false;await page.getByRole('button',{name:'Zkusit znovu'}).click();
 await expect(page.getByRole('heading',{name:'Obleky',exact:true})).toBeVisible();
 await expect(page.locator('footer a[href="/obleky"]')).toBeVisible();
});

test('all section links fit the 1024 guest header',async({page})=>{
 const state=await fixture(page,{guest:true});state.sections.familyLooks=true;
 await page.setViewportSize({width:1024,height:1000});await page.goto(APP+'/family-looky');
 const nav=page.getByRole('navigation',{name:'Hlavní navigace'});
 await expect(nav.getByRole('link',{name:'Family looky'})).toBeVisible();
 const last=await nav.getByRole('link').last().boundingBox(),utilities=await page.locator('[data-desktop-utilities]').boundingBox();
 expect(last.x+last.width).toBeLessThanOrEqual(utilities.x);
});
