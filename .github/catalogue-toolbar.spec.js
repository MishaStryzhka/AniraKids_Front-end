const {test,expect}=require('@playwright/test');
const APP='http://127.0.0.1:4173';
for(const width of [390,768,1440]) test('catalogue header actions '+width,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP,async route=>{
  const u=new URL(route.request().url());
  if(u.pathname==='/api/v2/site-settings')return route.fulfill({json:{sections:{suits:true,familyLooks:false}}});
  if(u.pathname==='/api/v2/catalogue/products')return route.fulfill({json:{items:[{id:'111111111111111111111111',slug:'sofia',name:'Sofia',photos:[],rentalPriceFrom:500}],page:1,limit:12,total:1,totalPages:1,facets:{colors:['Bílá'],sizes:['74']}}});
  if(u.pathname.endsWith('/favorites/storefront'))return route.fulfill({json:{favorites:[]}});
  if(u.pathname==='/maps/api/js'||u.pathname==='/gsi/client')return route.fulfill({contentType:'application/javascript',body:''});
  return route.abort();
 });
 await page.setViewportSize({width,height:1000});
 for(const path of ['/saty','/obleky','/novinky','/hledani','/popular','/forWomen','/forMen','/forChildren','/decorAndToys']){
  await page.goto(APP+path);
  const filter=page.getByRole('button',{name:'Filtrovat',exact:true});
  const sort=page.getByRole('combobox',{name:'SEŘADIT PODLE'});
  await expect(filter).toBeVisible();await expect(sort).toBeAttached();
  const h=await page.getByRole('heading',{level:1}).boundingBox();
  for(const c of [filter,sort]){
   const b=await c.boundingBox();expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44);
   expect(Math.abs(b.y+b.height/2-h.y-h.height/2)).toBeLessThan(2);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await filter.click();await expect(page.getByRole('button',{name:'Použít filtry'})).toBeVisible();
  await page.locator('summary').filter({hasText:'BARVA'}).click();
  await page.getByRole('combobox',{name:'Barva',exact:true}).selectOption('Bílá');
  await page.getByRole('button',{name:'Použít filtry'}).click();
  await expect(page).toHaveURL(/color=B/);
  await expect(filter).toHaveAttribute('title','Filtrovat (1)');
  await filter.click();await expect(page.getByRole('button',{name:'Použít filtry'})).toBeHidden();
  await sort.selectOption('priceDesc');await expect(page).toHaveURL(/sort=priceDesc/);
  await expect(page).toHaveURL(/color=B/);
  if(path==='/saty')await page.screenshot({path:`test-evidence/catalogue-toolbar/header-${width}.png`});
 }
 expect(errors).toEqual([]);
});
