const { test, expect } = require('@playwright/test');
const fs = require('fs');
const APP = 'http://127.0.0.1:4173';
const evidence = 'test-evidence/variant-fit-sizes';
fs.mkdirSync(evidence, {recursive:true});

for (const width of [390,768,1440]) test(`fit size editor preserves one physical piece at ${width}`, async ({page}) => {
  const product = {id:'p1',name:'Sofia',slug:'sofia',description:'',category:'dress',gender:'girls',color:'Bílá',occasion:[],ageTags:[],brand:'',familyLookGroup:'',rentalEnabled:false,saleEnabled:false,defaultDeposit:0,seo:{noIndex:false},photos:[],status:'draft',createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',rentalPrices:{}};
  let variant = {id:'v1',productId:'p1',size:'74-80-86',fitSizes:['74','80','86'],status:'active',sortOrder:0,createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',inventory:[{id:'i1',variantId:'v1',internalCode:'SOFIA-ONE',status:'active',condition:'good',notes:''}]};
  const writes=[],unexpected=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('test-admin')})));
  await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP, async route=>{
    const req=route.request(),u=new URL(req.url()),method=req.method();
    const json=body=>route.fulfill({json:body});
    if(method==='GET') {
      if((u.origin==='https://maps.googleapis.com'&&u.pathname==='/maps/api/js')||(u.origin==='https://accounts.google.com'&&u.pathname==='/gsi/client'))return route.fulfill({contentType:'application/javascript',body:'/* isolated SDK */'});
      if(u.origin==='https://example.test'&&u.pathname==='/api/users/current')return json({user:{_id:'admin'}});
      if(u.origin==='https://example.test'&&u.pathname==='/api/users/favorites/storefront')return json({favorites:[]});
      if(u.origin==='http://admin-api.test'&&u.pathname==='/api/v2/admin/products')return json({items:[],pagination:{page:1,limit:1,total:0,pages:0}});
      if(u.origin==='http://admin-api.test'&&u.pathname==='/api/v2/admin/products/p1')return json({product,variants:[variant]});
    }
    if(method==='PATCH'&&u.origin==='http://admin-api.test'&&u.pathname==='/api/v2/admin/variants/v1') {
      writes.push(req.postDataJSON()); variant={...variant,...req.postDataJSON()}; const {inventory,...saved}=variant;return json({variant:saved});
    }
    unexpected.push({method,path:u.pathname});return route.abort();
  });
  await page.setViewportSize({width,height:1000});await page.goto(APP+'/admin/produkty/p1');
  await page.getByRole('button',{name:'Upravit velikost',exact:true}).click();
  await page.getByRole('button',{name:'Odebrat velikost 80',exact:true}).click();
  await expect(page.getByLabel('Vhodné pro velikosti')).toBeFocused();
  await page.getByLabel('Vhodné pro velikosti').selectOption('92');
  await expect(page.getByRole('button',{name:'Odebrat velikost 92',exact:true})).toBeVisible();
  const editor=page.locator('[data-variant-editor]');await editor.scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  for(const button of await editor.getByRole('button').all()) { const b=await button.boundingBox();expect(b.height).toBeGreaterThanOrEqual(44); }
  await page.screenshot({path:`${evidence}/editor-${width}.png`});
  await page.getByRole('button',{name:'Uložit velikost',exact:true}).click();
  await expect(page.getByText('Pro filtr: 74, 86, 92')).toBeVisible();
  expect(writes).toEqual([{size:'74-80-86',fitSizes:['74','86','92']}]);
  expect(variant.inventory).toHaveLength(1);await expect(page.getByText('SOFIA-ONE',{exact:true})).toBeVisible();
  await page.reload();await page.getByRole('button',{name:'Upravit velikost',exact:true}).click();
  await expect(page.getByRole('button',{name:'Odebrat velikost 92',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Odebrat velikost 80',exact:true})).toHaveCount(0);
  expect(unexpected).toEqual([]);expect(errors).toEqual([]);
});
