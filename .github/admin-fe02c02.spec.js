const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');
const APP='http://127.0.0.1:4173';
const EVIDENCE=process.env.ADMIN_FE02C02_EVIDENCE_DIR||'test-evidence/admin-fe02c02';
fs.mkdirSync(EVIDENCE,{recursive:true});
const output=(name,value)=>fs.writeFileSync(path.join(EVIDENCE,name),JSON.stringify(value,null,2));
const adminOrigin='http://admin-api.test';
const productsPath='/api/v2/admin/products';
const variantsPath='/api/v2/admin/variants';
const LOCAL_IMAGE='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2296%22 height=%22128%22%3E%3Crect width=%2296%22 height=%22128%22 fill=%22%23ddd%22/%3E%3C/svg%3E';
const photo={publicId:'photo-a',url:LOCAL_IMAGE,alt:'Sofia'};
const baseProduct={id:'p1',name:'Sofia',slug:'sofia',description:'',category:'dress',gender:'girls',color:'Bílá',occasion:[],ageTags:[],brand:'',familyLookGroup:'',rentalEnabled:false,saleEnabled:false,defaultDeposit:0,seo:{noIndex:false},photos:[photo],status:'draft',createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',rentalPrices:{}};
const variant=(id,size,status='active',sku)=>({id,productId:'p1',size,sku,status,sortOrder:id==='v1'?0:1,createdAt:id==='v1'?'2026-01-01T00:00:00Z':'2026-01-02T00:00:00Z',updatedAt:'2026-01-02T00:00:00Z',inventory:[{ignored:true}]});
const seedVariants=[
 variant('v1','98-104-110-116','active','SKU-VERY-LONG-WRAPPING-VALUE-1234567890'),
 variant('v2','XS','inactive'),
];
const matchesAdminVariantFeature=url=>url.origin===adminOrigin&&(url.pathname===productsPath||url.pathname.startsWith(productsPath+'/')||url.pathname.startsWith(variantsPath+'/'));
async function mocks(page,options={}){
 const state={product:structuredClone(baseProduct),variants:structuredClone(seedVariants),detail:0,create:0,update:0,unexpected:[]};
 await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('admin-test-token')})));
 await page.route('**/api/users/current',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({user:{_id:'admin-user'}})}));
 await page.route(matchesAdminVariantFeature,async r=>{
  const req=r.request(),u=new URL(req.url()),method=req.method(),detailPath=productsPath+'/p1';
  const json=(status,body)=>r.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(method==='GET'&&u.pathname===productsPath&&u.searchParams.get('limit')==='1')return json(200,{items:[],pagination:{page:1,limit:1,total:0,pages:0}});
  if(method==='GET'&&u.pathname===detailPath){state.detail++;return json(200,{product:options.refreshProduct??state.product,variants:state.variants})}
  if(method==='POST'&&u.pathname===detailPath+'/variants'){
    state.create++;const body=req.postDataJSON();
    if(options.createNetwork)return r.abort('failed');
    if(options.createDuplicate)return json(409,{error:{code:'VARIANT_SIZE_ALREADY_EXISTS',message:'duplicate'}});
    const created={...variant('v3',body.size,'active','SKU-3'),inventory:undefined,sortOrder:2};state.variants.push({...created,inventory:[]});return json(201,{variant:created});
  }
  if(method==='PATCH'&&u.pathname.startsWith('/api/v2/admin/variants/')){
    state.update++;const id=u.pathname.split('/').pop(),body=req.postDataJSON();
    if(options.updateNotFound)return json(404,{error:{code:'VARIANT_NOT_FOUND',message:'missing'}});
    if(options.updateNetwork)return r.abort('failed');
    const current=state.variants.find(v=>v.id===id);const updated={...current,size:body.size,inventory:undefined};state.variants=state.variants.map(v=>v.id===id?{...updated,inventory:[]}:v);return json(200,{variant:updated});
  }
  if(method==='PATCH'&&u.pathname===detailPath){const body=req.postDataJSON();state.product={...state.product,...body};return json(200,{product:state.product})}
  state.unexpected.push({method,path:u.pathname});return r.abort('failed');
 });
 return state;
}
test.afterEach(async({page})=>{});
const section=page=>page.locator('[data-product-variants-section]');

for(const width of [375,390,430,768,1024,1440])test('Varianty responsive '+width,async({page})=>{
 await mocks(page);await page.setViewportSize({width,height:1000});await page.goto(APP+'/admin/produkty/p1');
 const variants=section(page),photos=page.locator('[data-product-media-section]');
 await expect(variants.getByRole('heading',{name:'Varianty'})).toBeVisible();
 const vb=await variants.boundingBox(),pb=await photos.boundingBox(),divider=await variants.locator('hr').first().boundingBox();
 expect(Math.round(divider.y-(pb.y+pb.height))).toBe(32);
 expect(vb.width).toBeLessThanOrEqual(841);expect(Math.abs(vb.x-pb.x)).toBeLessThanOrEqual(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await expect(variants.getByText('98-104-110-116')).toBeVisible();
 await expect(variants.getByText('Aktivní')).toBeVisible();await expect(variants.getByText('Neaktivní')).toBeVisible();
 const first=variants.locator('[data-variant-id="v1"]'),size=first.getByText('98-104-110-116'),status=first.getByText('Aktivní'),sku=first.getByText(/SKU: SKU-VERY/),edit=first.getByRole('button',{name:'Upravit velikost'});
 const [sb,stb,skub,eb]=await Promise.all([size.boundingBox(),status.boundingBox(),sku.boundingBox(),edit.boundingBox()]);
 if(width<768){expect(eb.width).toBeGreaterThan(vb.width*0.8);expect(stb.y).toBeGreaterThan(sb.y);expect(skub.y).toBeGreaterThan(stb.y)}
 else if(width<1024){expect(Math.abs(sb.y-stb.y)).toBeLessThan(8);expect(Math.abs(skub.y-eb.y)).toBeLessThan(8);expect(skub.y).toBeGreaterThan(sb.y)}
 else {expect(Math.max(sb.y,stb.y,skub.y,eb.y)-Math.min(sb.y,stb.y,skub.y,eb.y)).toBeLessThan(12)}
 output('geometry-'+width+'.json',{width,variantSection:vb,photoSection:pb,divider,first:{size:sb,status:stb,sku:skub,edit:eb},scrollWidth:await page.evaluate(()=>document.documentElement.scrollWidth)});
 await page.screenshot({path:path.join(EVIDENCE,'responsive-'+width+'.png'),fullPage:true});
});
test('Add/Edit stay inline, only one editor exists, cancel and success focus correctly',async({page})=>{
 const state=await mocks(page);await page.goto(APP+'/admin/produkty/p1');const variants=section(page);
 const add=variants.getByRole('button',{name:'Přidat variantu'}).first();await add.click();await expect(variants.getByLabel('Velikost')).toBeFocused();expect(await variants.locator('[data-variant-editor]').count()).toBe(1);
 await variants.getByLabel('Velikost').fill(' 122 ');await variants.locator('[data-variant-submit]').click();await expect(variants.getByText('Varianta byla přidána.')).toBeVisible();expect(state.create).toBe(1);await expect(variants.locator('[data-variant-id="v3"] [data-variant-edit]')).toBeFocused();
 const edit=variants.locator('[data-variant-id="v1"]').getByRole('button',{name:'Upravit velikost'});await edit.click();await expect(variants.getByLabel('Velikost')).toBeFocused();await variants.getByLabel('Velikost').fill('99');await variants.getByRole('button',{name:'Zrušit'}).click();await expect(edit).toBeFocused();
});
test('dirty editor switch uses one page-owned Dialog and discard focuses requested editor',async({page})=>{
 await mocks(page);await page.goto(APP+'/admin/produkty/p1');const variants=section(page),edits=variants.getByRole('button',{name:'Upravit velikost'});
 await edits.nth(0).click();await variants.getByLabel('Velikost').fill('99');await edits.nth(1).click();
 const d=page.getByRole('dialog');await expect(d).toHaveCount(1);await expect(d.getByRole('heading',{name:'Neuložená změna varianty'})).toBeVisible();await expect(d.getByRole('button',{name:'Zůstat'})).toBeFocused();
 await d.getByRole('button',{name:'Zůstat'}).click();await expect(variants.getByLabel('Velikost')).toHaveValue('99');await expect(variants.getByLabel('Velikost')).toBeFocused();
 await edits.nth(1).click();await page.getByRole('dialog').getByRole('button',{name:'Zahodit změny a pokračovat'}).click();await expect(variants.getByLabel('Velikost')).toHaveValue('XS');await expect(variants.getByLabel('Velikost')).toBeFocused();expect(await variants.locator('[data-variant-editor]').count()).toBe(1);
});
test('duplicate validation focuses size and preserves draft without request',async({page})=>{
 const state=await mocks(page);await page.goto(APP+'/admin/produkty/p1');const variants=section(page);await variants.getByRole('button',{name:'Přidat variantu'}).first().click();await variants.getByLabel('Velikost').fill('98-104-110-116');await variants.locator('[data-variant-submit]').click();await expect(variants.getByText('Tato velikost už u produktu existuje.')).toBeVisible();await expect(variants.getByLabel('Velikost')).toBeFocused();expect(state.create).toBe(0);
});
test('combined Core plus Variant dirty state uses generic EDIT leave copy and Stay preserves both',async({page})=>{
 await mocks(page);await page.goto(APP+'/admin/produkty/p1');await page.getByLabel('Barva').fill('Růžová');const variants=section(page);await variants.getByRole('button',{name:'Upravit velikost'}).first().click();await variants.getByLabel('Velikost').fill('99');await page.getByRole('link',{name:'Produkty',exact:true}).click();const d=page.getByRole('dialog');await expect(d).toContainText('Máte neuložené změny nebo nedokončenou práci na této stránce.');await expect(d.getByRole('button',{name:'Zůstat'})).toBeFocused();await d.getByRole('button',{name:'Zůstat'}).click();await expect(page).toHaveURL(/\/admin\/produkty\/p1$/);await expect(page.getByLabel('Barva')).toHaveValue('Růžová');await expect(variants.getByLabel('Velikost')).toHaveValue('99');
});
test('dirty Core survives variant success and variant failure without Core PATCH',async({page})=>{
 const success=await mocks(page);await page.goto(APP+'/admin/produkty/p1');await page.getByLabel('Barva').fill('Růžová');let variants=section(page);await variants.getByRole('button',{name:'Přidat variantu'}).first().click();await variants.getByLabel('Velikost').fill('122');await variants.locator('[data-variant-submit]').click();await expect(variants.getByText('Varianta byla přidána.')).toBeVisible();await expect(page.getByLabel('Barva')).toHaveValue('Růžová');expect(success.product.color).toBe('Bílá');
});
test('dirty Core survives explicit variant update network failure and draft remains retryable',async({page})=>{
 const state=await mocks(page,{updateNetwork:true});await page.goto(APP+'/admin/produkty/p1');await page.getByLabel('Barva').fill('Růžová');const variants=section(page);await variants.getByRole('button',{name:'Upravit velikost'}).first().click();await variants.getByLabel('Velikost').fill('101');await variants.getByRole('button',{name:'Uložit velikost'}).click();await expect(variants.getByRole('alert')).toContainText('Zkontrolujte připojení');await expect(variants.getByLabel('Velikost')).toHaveValue('101');await expect(variants.getByRole('button',{name:'Uložit velikost'})).toBeEnabled();await expect(page.getByLabel('Barva')).toHaveValue('Růžová');expect(state.update).toBe(1);
});
test('unknown create never auto-replays POST and authoritative refresh is explicit',async({page})=>{
 const state=await mocks(page,{createNetwork:true});await page.goto(APP+'/admin/produkty/p1');const variants=section(page);await variants.getByRole('button',{name:'Přidat variantu'}).first().click();await variants.getByLabel('Velikost').fill('122');await variants.locator('[data-variant-submit]').click();await expect(variants.getByText('Výsledek vytvoření varianty není potvrzený')).toBeVisible();expect(state.create).toBe(1);await expect(variants.getByRole('button',{name:'Načíst aktuální varianty'})).toBeVisible();expect(state.create).toBe(1);
});
