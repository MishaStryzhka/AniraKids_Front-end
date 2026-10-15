const {test,expect}=require('@playwright/test');
const APP='http://127.0.0.1:4173', id='111111111111111111111111';
const photo='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2296%22 height=%22128%22%3E%3Crect width=%2296%22 height=%22128%22 fill=%22%23ddbcc8%22/%3E%3C/svg%3E';
async function fixture(page,ambiguous=false){
 const state={hide:0,activate:0,unexpected:[],product:{id,name:'DAM1',slug:'dam1',description:'Společenské šaty.',category:'dress',gender:'women',color:'Růžová',occasion:[],ageTags:[],photos:[{url:photo,publicId:'photo'}],rentalEnabled:false,saleEnabled:false,defaultDeposit:0,status:'active',seo:{noIndex:false}}};
 await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('admin-test-token')})));
 await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP,async route=>{
  const req=route.request(),p=new URL(req.url()).pathname;
  const json=(body,status=200)=>route.fulfill({status,json:body});
  if(p==='/api/users/current')return json({user:{_id:'admin-user'}});
  if(p.endsWith('/favorites/storefront'))return json({favorites:[]});
  if(p==='/maps/api/js'||p==='/gsi/client')return route.fulfill({contentType:'application/javascript',body:''});
  if(p==='/api/v2/admin/products')return json({items:[],pagination:{page:1,limit:1,total:0,pages:0}});
  if(p==='/api/v2/admin/products/'+id&&req.method()==='GET')return json({product:state.product,variants:[]});
  if(p.endsWith('/hide')&&req.method()==='POST'){
   state.hide++;state.product.status='hidden';state.product.seo.noIndex=true;
   if(ambiguous)return route.abort('failed');
   return json({product:state.product});
  }
  if(p.endsWith('/activate')&&req.method()==='POST'){
   state.activate++;state.product.status='active';state.product.seo.noIndex=false;return json({product:state.product});
  }
  state.unexpected.push(p);return route.abort();
 });
 return state;
}
for(const width of [390,768,1440])test('hide and republish at '+width,async({page})=>{
 const state=await fixture(page),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.goto(APP+'/admin/produkty/'+id);
 const hide=page.getByRole('button',{name:'Skrýt z nabídky',exact:true});
 await expect(hide).toBeInViewport();
 await page.getByLabel('Popis',{exact:true}).fill('Neuložená změna');await expect(hide).toBeDisabled();
 await page.getByLabel('Popis',{exact:true}).fill('Společenské šaty.');await expect(hide).toBeEnabled();
 await hide.click();await expect(page.locator('[data-product-status]')).toContainText('Skrytý');
 await expect(page.getByRole('img',{name:'DAM1',exact:true})).toBeVisible();
 await page.reload();await expect(page.locator('[data-product-status]')).toContainText('Skrytý');
 await expect(page.getByRole('button',{name:'Znovu zveřejnit',exact:true})).toBeInViewport();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await page.screenshot({path:'test-evidence/product-visibility/hidden-'+width+'.png'});
 await page.getByRole('button',{name:'Znovu zveřejnit',exact:true}).click();
 await expect(page.locator('[data-product-status]')).toContainText('Aktivní');
 await expect(hide).toBeEnabled();expect(state.hide).toBe(1);expect(state.activate).toBe(1);
 expect(state.unexpected).toEqual([]);expect(errors).toEqual([]);
});
test('lost hide response requires read-back without replaying the mutation',async({page})=>{
 const state=await fixture(page,true);await page.goto(APP+'/admin/produkty/'+id);
 await page.getByRole('button',{name:'Skrýt z nabídky',exact:true}).click();
 await expect(page.getByText('Výsledek skrytí není potvrzený',{exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Skrýt z nabídky',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Načíst aktuální stav produktu',exact:true}).click();
 await expect(page.locator('[data-product-status]')).toContainText('Skrytý');
 await expect(page.getByRole('button',{name:'Znovu zveřejnit',exact:true})).toBeEnabled();
 expect(state.hide).toBe(1);expect(state.unexpected).toEqual([]);
});
