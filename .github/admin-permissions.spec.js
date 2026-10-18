const {test,expect}=require('@playwright/test');
const APP='http://127.0.0.1:4173',staffId='222222222222222222222222';
async function fixture(page,owner=true){
 const state={permissions:[],revision:0,writes:[],unexpected:[],errors:[],fail:false,missing:false};
 page.on('pageerror',e=>state.errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('permissions-fixture')})));
 await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP,async route=>{
  const req=route.request(),p=new URL(req.url()).pathname,json=(body,status=200)=>route.fulfill({status,json:body});
  const user=()=>({id:staffId,name:'Jana Nová',email:'jana@example.test',owner:false,permissions:state.permissions,revision:state.revision});
  if(p==='/api/users/current')return json({user:{_id:owner?'111111111111111111111111':staffId}});
  if(p.endsWith('/favorites/storefront'))return json({ids:[]});
  if(p==='/maps/api/js'||p==='/gsi/client')return route.fulfill({contentType:'application/javascript',body:''});
  if(p==='/api/v2/site-settings')return json({sections:{suits:true,familyLooks:false}});
  if(p==='/api/v2/admin/access')return json({owner,permissions:owner?['products','reservations','fittings','settings']:['fittings']});
  if(p==='/api/v2/admin/settings')return json({sections:{suits:true,familyLooks:false}});
  if(p==='/api/v2/admin/fitting-settings')return json({enabled:false,address:'',weekly:Array.from({length:7},(_,day)=>({day,enabled:false,start:'09:00',end:'17:00'})),blockedDates:[]});
  if(p==='/api/v2/admin/administrators')return json({owners:[{id:'111111111111111111111111',email:'owner@example.test',name:'Hlavní správce',owner:true,permissions:['products','reservations','fittings','settings'],revision:0}],items:state.revision?[user()]:[],total:state.revision?1:0});
  if(p==='/api/v2/admin/administrators/lookup')return state.missing?json({error:{code:'USER_NOT_FOUND'}},404):json(user());
  if(p==='/api/v2/admin/administrators/'+staffId){state.writes.push(req.postDataJSON());if(state.fail){state.fail=false;return json({error:{code:'ACCESS_CONFLICT'}},409);}state.permissions=req.postDataJSON().permissions;state.revision++;return json({ok:true,revision:state.revision});}
  if(p==='/api/v2/admin/fittings')return json({items:[],truncated:false});
  state.unexpected.push(p);return route.abort();
 });return state;
}
for(const width of [390,768,1440])test('owner manages granular access and revokes safely '+width,async({page})=>{
 const s=await fixture(page);await page.setViewportSize({width,height:1000});await page.goto(APP+'/admin/nastaveni');await page.locator('summary').filter({hasText:'Administrátoři'}).click();
 const card=page.getByRole('region',{name:'Administrátoři',exact:true});await expect(card.getByText('Hlavní správce')).toBeVisible();
 await card.getByLabel('E-mail uživatele').fill('jana@example.test');await card.getByRole('button',{name:'Vyhledat účet'}).click();
 await card.getByLabel('Produkty a sklad').check();await card.getByLabel('Zkoušky a jejich platby').check();
 await expect(card.getByRole('button',{name:'Vyhledat účet'})).toBeDisabled();
 await page.screenshot({path:`test-evidence/admin-permissions/settings-${width}.png`,fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await card.getByRole('button',{name:'Uložit oprávnění'}).click();await expect(card.getByRole('status').filter({hasText:'Oprávnění byla uložena.'})).toBeVisible();
 expect(s.writes[0]).toEqual({permissions:['products','fittings'],revision:0});
 await card.getByLabel('Produkty a sklad').uncheck();await card.getByLabel('Zkoušky a jejich platby').uncheck();
 await card.getByRole('button',{name:'Uložit oprávnění'}).click();await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('button',{name:'Ponechat přístup'}).click();expect(s.writes).toHaveLength(1);
 await card.getByRole('button',{name:'Uložit oprávnění'}).click();await page.getByRole('button',{name:'Odebrat přístup',exact:true}).click();
 await expect(card.getByRole('status').filter({hasText:'Přístup do administrace byl odebrán.'})).toBeVisible();expect(s.permissions).toEqual([]);
 expect(s.errors).toEqual([]);expect(s.unexpected).toEqual([]);
});
test('limited administrator lands on allowed section and cannot open settings',async({page})=>{
 const s=await fixture(page,false);await page.setViewportSize({width:1440,height:1000});await page.goto(APP+'/admin');await expect(page).toHaveURL(APP+'/admin/zkousky');
 const nav=page.getByRole('navigation',{name:'Navigace administrace'});await expect(nav.getByRole('link',{name:'Zkoušky'})).toBeVisible();await expect(nav.getByRole('link',{name:'Nastavení'})).toHaveCount(0);await expect(nav.getByRole('link',{name:'Produkty'})).toHaveCount(0);
 await page.goto(APP+'/admin/nastaveni');await expect(page.getByRole('alert')).toContainText('nemáte oprávnění');await expect(page.getByRole('region',{name:'Administrátoři'})).toHaveCount(0);expect(s.unexpected).toEqual([]);
});
test('lookup errors and conflicting saves preserve edits and require review',async({page})=>{
 const s=await fixture(page);await page.goto(APP+'/admin/nastaveni');await page.locator('summary').filter({hasText:'Administrátoři'}).click();const card=page.getByRole('region',{name:'Administrátoři',exact:true});
 s.missing=true;await card.getByLabel('E-mail uživatele').fill('missing@example.test');await card.getByRole('button',{name:'Vyhledat účet'}).click();await expect(card.getByRole('alert')).toContainText('nebyl nalezen');
 s.missing=false;await card.getByLabel('E-mail uživatele').fill('jana@example.test');await card.getByRole('button',{name:'Vyhledat účet'}).click();await card.getByLabel('Produkty a sklad').check();s.fail=true;await card.getByRole('button',{name:'Uložit oprávnění'}).click();await expect(card.getByRole('alert')).toContainText('mezitím změnila');await expect(card.getByLabel('Produkty a sklad')).toBeChecked();expect(s.permissions).toEqual([]);
});
