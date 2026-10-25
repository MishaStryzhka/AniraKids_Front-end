const {test,expect}=require('@playwright/test');
const APP='http://127.0.0.1:4173';
async function fixture(page,options={}){
 const state={sections:{girlsDresses:true,womenDresses:true,suits:true,familyLooks:false},filters:{girlsDresses:['price','rentalMode','color','size'],womenDresses:['price','rentalMode','color','size'],suits:['gender','price','rentalMode','color','size'],familyLooks:['category','gender','price','rentalMode','color','size']},patches:[],queries:[],unexpected:[],fail:options.fail||false,readFail:options.readFail||false};
 if(!options.guest) await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('admin-test-token')})));
 await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP,async route=>{
  const req=route.request(),u=new URL(req.url()),p=u.pathname;
  const json=(body,status=200)=>route.fulfill({status,json:body});
  if(p==='/api/users/current')return json({user:{_id:'admin-user'}});
  if(p.endsWith('/favorites/storefront'))return json({ids:[]});
  if(p==='/api/v2/partner/access')return json({error:{code:'FORBIDDEN'}},403);
  if(p==='/maps/api/js'||p==='/gsi/client')return route.fulfill({contentType:'application/javascript',body:''});
  if(p==='/api/v2/admin/fitting-settings')return json({enabled:false,address:'',weekly:Array.from({length:7},(_,day)=>({day,enabled:false,start:'09:00',end:'17:00'})),blockedDates:[]});
  if(p==='/api/v2/admin/products')return json({items:[],pagination:{page:1,limit:1,total:0,pages:0}});
  if(p==='/api/v2/site-settings')return state.readFail?json({},503):json({cooperationActive:true,sections:state.sections,filters:state.filters});
  if(p==='/api/v2/admin/settings'){
   if(req.method()==='PATCH'){
    state.patches.push(req.postDataJSON());
    if(state.fail){state.fail=false;return json({error:{code:'UPSTREAM_ERROR',message:'test'}},503);}
    Object.assign(state.sections,req.postDataJSON().sections);Object.assign(state.filters,req.postDataJSON().filters);
   }
   return json({sections:state.sections,filters:state.filters});
  }
  if(p==='/api/v2/catalogue/products'){
   state.queries.push(Object.fromEntries(u.searchParams));
   return json({items:[],page:1,limit:12,total:0,totalPages:0,facets:{colors:[],sizes:[]}});
  }
  state.unexpected.push(p);return route.abort();
 });
 await page.route('**/api/v2/admin/access',route=>route.fulfill({json:{owner:true,permissions:['products','reservations','fittings','settings']}}));await page.route('**/api/v2/admin/administrators?*',route=>route.fulfill({json:{owners:[],items:[],total:0}}));return state;
}
for(const width of [390,768,1024,1440])test('section settings persist and control storefront '+width,async({page})=>{
 const state=await fixture(page),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width,height:1000});await page.goto(APP+'/admin/nastaveni');await page.locator('summary').filter({hasText:'Sekce na webu'}).click();
 await expect(page.getByRole('heading',{name:'Nastavení',exact:true})).toBeVisible();
 const suits=page.getByLabel('Chlapecké obleky',{exact:true}),family=page.getByLabel('Family looky',{exact:true}),save=page.getByRole('button',{name:'Uložit',exact:true});
 await expect(suits).toBeChecked();await expect(family).not.toBeChecked();await expect(save).toBeDisabled();
 await suits.uncheck();await family.check();await save.click();await expect(page.getByRole('status')).toContainText('Nastavení bylo uloženo');
 expect(state.patches).toEqual([{sections:{suits:false,familyLooks:true}}]);
 await page.reload();await page.locator('summary').filter({hasText:'Sekce na webu'}).click();await expect(suits).not.toBeChecked();await expect(family).toBeChecked();
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
 const state=await fixture(page,{fail:true});await page.setViewportSize({width:1440,height:1000});await page.goto(APP+'/admin/nastaveni');await page.locator('summary').filter({hasText:'Sekce na webu'}).click();
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

for(const width of [390,768,1440])test('collapsible settings preserve drafts and apply section filters '+width,async({page})=>{
 const s=await fixture(page);await page.setViewportSize({width,height:1000});await page.goto(APP+'/admin/nastaveni');
 const summary=page.locator('summary').filter({hasText:'Sekce na webu'});
 await expect(page.getByLabel('Dívčí šaty',{exact:true})).not.toBeVisible();
 await summary.click();await page.getByLabel('Dívčí šaty',{exact:true}).uncheck();
 const group=page.getByRole('group',{name:'Filtry: Dámské šaty',includeHidden:true});
 await group.locator('..').locator('summary').click();
 await group.getByLabel('Cena',{exact:true}).uncheck();await group.getByLabel('Způsob pronájmu',{exact:true}).uncheck();await group.getByLabel('Barva',{exact:true}).uncheck();
 await summary.click();await expect(summary).toContainText('Neuložené změny');await summary.click();
 await expect(page.getByLabel('Dívčí šaty',{exact:true})).not.toBeChecked();await expect(group.getByLabel('Velikost',{exact:true})).toBeChecked();
 await expect(group.getByLabel('Cena',{exact:true})).not.toBeChecked();
 await page.screenshot({path:`test-evidence/site-settings/filters-${width}.png`,fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await page.getByRole('button',{name:'Uložit',exact:true}).click();await expect(summary).not.toContainText('Neuložené změny');
 expect(s.patches).toEqual([{sections:{girlsDresses:false},filters:{womenDresses:['size']}}]);
 await page.goto(APP+'/saty');await expect(page.getByRole('heading',{name:'Tato sekce momentálně není dostupná'})).toBeVisible();await expect(page.locator('a[href="/saty"]')).toHaveCount(0);
 await page.goto(APP+'/forWomen?category=dress&color=Bílá&minPrice=bad&size=M');await expect(page.getByRole('heading',{name:'Dámské šaty',exact:true})).toBeVisible();
 await expect.poll(()=>new URL(page.url()).searchParams.has('minPrice')).toBe(false);await expect.poll(()=>new URL(page.url()).searchParams.has('color')).toBe(false);
 await page.getByRole('button',{name:'Filtrovat',exact:true}).click();await page.getByText('VELIKOST',{exact:true}).click();await expect(page.getByRole('combobox',{name:'Velikost',exact:true})).toBeVisible();await expect(page.getByRole('combobox',{name:'Barva',exact:true})).toHaveCount(0);await expect(page.getByLabel('Cena od (Kč)',{exact:true})).toHaveCount(0);
 await expect.poll(()=>s.queries.some(q=>q.gender==='women')).toBe(true);
 expect(s.queries.filter(q=>q.gender==='women').every(q=>q.category==='dress'&&!q.color&&!q.minPrice)).toBe(true);
 await page.getByRole('button',{name:'Zrušit filtry',exact:true}).first().click();await expect(page.getByRole('heading',{name:'Dámské šaty',exact:true})).toBeVisible();
 s.filters.womenDresses=[];await page.reload();await expect(page.getByRole('button',{name:'Filtrovat',exact:true})).toHaveCount(0);
 s.sections.womenDresses=false;await page.reload();await expect(page.getByRole('heading',{name:'Tato sekce momentálně není dostupná'})).toBeVisible();expect(s.unexpected).toEqual([]);
});
