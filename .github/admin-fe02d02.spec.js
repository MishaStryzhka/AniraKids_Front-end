const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');
const APP='http://127.0.0.1:4173',API='http://admin-api.test';
const EVIDENCE=process.env.ADMIN_FE02D02_EVIDENCE_DIR||'test-evidence/admin-fe02d02';
fs.mkdirSync(EVIDENCE,{recursive:true});
const product={id:'p1',name:'Sofia',slug:'sofia',description:'Jemné šaty',category:'dress',gender:'girls',color:'Bílá',occasion:[],ageTags:[],brand:'',familyLookGroup:'',rentalEnabled:false,saleEnabled:false,defaultDeposit:0,seo:{noIndex:true,title:'SEO title'},photos:[],status:'draft',createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z'};
const variant={id:'v1',productId:'p1',size:'98',status:'active',sortOrder:0,createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',inventory:[]};
const longKey='future_requirement_'+('very_long_requirement_'.repeat(18));
async function mocks(page,options={}){
 const state={product:structuredClone(product),variants:[structuredClone(variant)],posts:[],patches:[],gets:0,release:null,releasePatch:null,unexpected:[],pageErrors:[]};
 page.on('pageerror',error=>state.pageErrors.push(error.message));
 await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('admin-test-token')})));
 await page.route('**/api/users/current',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({user:{_id:'admin-user'}})}));
 await page.route(url=>url.origin===API,async r=>{
  const req=r.request(),u=new URL(req.url()),method=req.method();
  const json=(status,body)=>r.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(method==='GET'&&u.pathname==='/api/v2/admin/products')return json(200,{items:[],pagination:{page:1,limit:1,total:0,pages:0}});
  if(method==='GET'&&u.pathname==='/api/v2/admin/products/p1'){
   state.gets++;
   const recovery=state.gets>1&&options.recoveryStatus;
   return json(200,{product:recovery?{...state.product,name:'SERVER VALUE MUST NOT REPLACE DRAFT',status:options.recoveryStatus,seo:{noIndex:options.recoveryStatus!=='active'}}:state.product,variants:state.variants});
  }
  if(method==='POST'&&u.pathname==='/api/v2/admin/products/p1/activate'){
   state.posts.push({body:req.postData(),authorization:req.headers().authorization});
   if(options.defer)await new Promise(resolve=>{state.release=resolve});
   if(options.activation==='unknown')return r.abort('failed');
   if(options.activation==='conflict')return json(409,{error:{code:'PRODUCT_STATE_CONFLICT'}});
   if(options.activation==='success'){
    state.product={...state.product,status:'active',seo:{...state.product.seo,noIndex:false}};return json(200,{product:state.product});
   }
   return json(409,{error:{code:'PRODUCT_NOT_READY',details:options.requirements||['name','photos','inventory','rentalPrices.external',longKey]}});
  }
  if(method==='PATCH'&&u.pathname==='/api/v2/admin/products/p1'){
   const body=req.postDataJSON(),snapshot={...state.product,...body};state.patches.push(body);
   if(options.deferPatch)await new Promise(resolve=>{state.releasePatch=resolve});
   if(options.patchConflict)return json(409,{error:{code:'PRODUCT_STATE_CONFLICT'}});
   state.product={...state.product,...body};return json(200,{product:snapshot});
  }
  state.unexpected.push({method,path:u.pathname});return r.abort('failed');
 });
 return state;
}
const activation=page=>page.locator('[data-product-activation-section]');
const activate=page=>activation(page).getByRole('button',{name:'Aktivovat produkt',exact:true});
const save=page=>page.getByRole('button',{name:'Uložit',exact:true});
const status=page=>page.locator('[data-product-status]');
async function ready(page){await page.goto(APP+'/admin/produkty/p1');await expect(activate(page)).toBeEnabled();}
async function capture(page,name){await page.screenshot({path:path.join(EVIDENCE,name+'.png'),fullPage:true});}
for(const width of [375,390,430,768,1024,1440])test('activation requirements responsive '+width,async({page})=>{
 const state=await mocks(page);await page.setViewportSize({width,height:1000});await ready(page);await activate(page).click();
 await expect(activation(page).getByRole('heading',{name:'Produkt zatím nelze aktivovat'})).toBeFocused();
 await expect(activation(page).getByText('Kód požadavku: '+longKey)).toBeVisible();
 const action=await activate(page).boundingBox(),section=await activation(page).boundingBox();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);expect(overflow).toBeLessThanOrEqual(1);
 expect(section.width).toBeLessThanOrEqual(840);if(width<768)expect(action.width).toBeGreaterThan(section.width*.98);
 for(const button of await activation(page).getByRole('button').all()){const box=await button.boundingBox();expect(box.height).toBeGreaterThanOrEqual(44);}
 await capture(page,'activation-'+width);fs.writeFileSync(path.join(EVIDENCE,'geometry-'+width+'.json'),JSON.stringify({width,section,action,overflow},null,2));
 expect(state.posts).toEqual([{body:null,authorization:'Bearer admin-test-token'}]);expect(state.unexpected).toEqual([]);expect(state.pageErrors).toEqual([]);
});
test('short viewport and enlarged text retain single flow, visible actions and no horizontal overflow',async({page})=>{
 await mocks(page);await page.setViewportSize({width:390,height:360});await ready(page);await activate(page).click();
 await page.addStyleTag({content:'[data-product-activation-section] p,[data-product-activation-section] button {font-size:200%;line-height:1.5}'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);await activate(page).scrollIntoViewIfNeeded();await expect(activate(page)).toBeVisible();await capture(page,'short-enlarged');
});
test('go-to targets use visible focus including hidden rental fallback and inventory to Varianty',async({page})=>{
 await mocks(page);await ready(page);await activate(page).click();
 await activation(page).getByRole('button',{name:'Přejít na Název'}).click();await expect(page.getByLabel('Název',{exact:true})).toBeFocused();
 await activation(page).getByRole('button',{name:'Přejít k cenám'}).click();await expect(page.getByLabel('Nabízet produkt k pronájmu')).toBeFocused();
 await activation(page).getByRole('button',{name:'Přejít k fotografiím'}).click();await expect(page.getByRole('heading',{name:'Fotografie',exact:true})).toBeFocused();
 await activation(page).getByRole('button',{name:'Přejít k variantám'}).click();await expect(page.getByRole('heading',{name:'Varianty',exact:true})).toBeFocused();
 expect(await page.getByRole('heading',{name:'Varianty',exact:true}).evaluate(el=>getComputedStyle(el).outlineWidth)).toBe('2px');
});
test('activation pending allows new Core Save; success preserves drafts and stale PATCH cannot revert status',async({page})=>{
 const state=await mocks(page,{activation:'success',defer:true,deferPatch:true});await ready(page);await activate(page).click();
 const pending=activation(page).getByRole('button',{name:'Aktivování…'});await expect(pending).toBeVisible();await expect(pending).toHaveAttribute('aria-busy','true');await expect(pending).toBeDisabled();
 await page.getByLabel('Barva',{exact:true}).fill('Růžová');await expect(save(page)).toBeEnabled();await save(page).click();await expect.poll(()=>state.patches.length).toBe(1);
 state.release();await expect(status(page)).toHaveText('Stav: Aktivní');await expect(status(page)).toBeFocused();state.releasePatch();await expect(page.getByText('Změny byly uloženy.')).toBeVisible();await expect(status(page)).toHaveText('Stav: Aktivní');await expect(page.getByLabel('Barva',{exact:true})).toHaveValue('Růžová');await expect(activate(page)).toHaveCount(0);await capture(page,'confirmed-active');
});
test('readiness history stays stale after dirty draft returns clean',async({page})=>{
 await mocks(page);await ready(page);await activate(page).click();await expect(page.getByText('Produkt zatím nelze aktivovat')).toBeVisible();await page.getByLabel('Barva',{exact:true}).fill('Růžová');await expect(activate(page)).toBeDisabled();await page.getByLabel('Barva',{exact:true}).fill('Bílá');await expect(activate(page)).toBeEnabled();await expect(page.getByText('Výsledek posledního pokusu už nemusí odpovídat aktuálním údajům.')).toBeVisible();
});
test('unknown recovery only observes metadata and preserves a new dirty Core draft',async({page})=>{
 const state=await mocks(page,{activation:'unknown',recoveryStatus:'active'});await ready(page);await activate(page).click();await expect(page.getByText('Výsledek aktivace není potvrzený')).toBeVisible();await page.getByLabel('Barva',{exact:true}).fill('Růžová');await activation(page).getByRole('button',{name:'Načíst aktuální stav produktu'}).click();await expect(page.getByText('Produkt je nyní aktivní.')).toBeVisible();await expect(page.getByLabel('Název',{exact:true})).toHaveValue('Sofia');await expect(page.getByLabel('Barva',{exact:true})).toHaveValue('Růžová');await expect(save(page)).toBeEnabled();expect(state.posts).toHaveLength(1);expect(state.patches).toEqual([]);await capture(page,'observed-active');
});
test('independent Core and activation conflicts require separate manual recovery',async({page})=>{
 const state=await mocks(page,{activation:'conflict',defer:true,patchConflict:true,recoveryStatus:'draft'});await ready(page);await activate(page).click();await page.getByLabel('Barva',{exact:true}).fill('Růžová');await save(page).click();await expect(page.locator('[data-product-core-form]').getByText('Produkt se mezitím změnil')).toBeVisible();state.release();await expect(activation(page).getByText('Produkt se mezitím změnil')).toBeVisible();
 await page.locator('[data-product-core-form]').getByRole('button',{name:'Načíst aktuální stav produktu'}).click();await expect(save(page)).toBeEnabled();await expect(activation(page).getByText('Produkt se mezitím změnil')).toBeVisible();expect(state.patches).toHaveLength(1);expect(state.posts).toHaveLength(1);await capture(page,'independent-conflicts');
});
test('pending activation uses one leave Dialog and confirmed settlement proceeds once',async({page})=>{
 const state=await mocks(page,{activation:'success',defer:true});await ready(page);await activate(page).click();await page.getByRole('link',{name:'Zpět',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(1);await expect(page.getByRole('dialog')).toContainText('Aktivace produktu není potvrzená');state.release();await expect(page).toHaveURL(APP+'/admin/produkty');await expect(page.getByRole('dialog')).toHaveCount(0);
});
