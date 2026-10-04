const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');
const APP='http://127.0.0.1:4173';
const EVIDENCE=process.env.ADMIN_FE02C03_EVIDENCE_DIR||'test-evidence/admin-fe02c03';
fs.mkdirSync(EVIDENCE,{recursive:true});
const output=(name,value)=>fs.writeFileSync(path.join(EVIDENCE,name),JSON.stringify(value,null,2));
const adminOrigin='http://admin-api.test';
const productsPath='/api/v2/admin/products',variantsPath='/api/v2/admin/variants',inventoryPath='/api/v2/admin/inventory-items';
const IMAGE='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2296%22 height=%22128%22%3E%3Crect width=%2296%22 height=%22128%22 fill=%22%23ddd%22/%3E%3C/svg%3E';
const photo={publicId:'photo-a',url:IMAGE,alt:'Sofia'};
const product={id:'p1',name:'Sofia',slug:'sofia',description:'',category:'dress',gender:'girls',color:'Bílá',occasion:[],ageTags:[],brand:'',familyLookGroup:'',rentalEnabled:false,saleEnabled:false,defaultDeposit:0,seo:{noIndex:false},photos:[photo],status:'draft',createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',rentalPrices:{}};
const inv=(id,variantId,internalCode,status='active',condition='good',notes='')=>({id,variantId,internalCode,status,condition,notes,createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z'});
const variant=(id,size,status='active',sku,inventory=[])=>({id,productId:'p1',size,sku,status,sortOrder:id==='v1'?0:1,createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',inventory});
const longCode='AK-VERY-LONG-INTERNAL-CODE-1234567890-ABCDEFGHIJ-1234567890';
const seedVariants=[
 variant('v1','98-104-110-116','active','SKU-LONG',[inv('i1','v1',longCode,'active','good','Dlouhá poznámka pro ověření zalamování.'),inv('i2','v1','AK-002','maintenance','damaged')]),
 variant('v2','XS','inactive',undefined,[]),
];
const matches=url=>url.origin===adminOrigin&&(url.pathname===productsPath||url.pathname.startsWith(productsPath+'/')||url.pathname.startsWith(variantsPath+'/')||url.pathname.startsWith(inventoryPath+'/'));
async function mocks(page,options={}){
 const state={product:structuredClone(product),variants:structuredClone(seedVariants),detail:0,inventoryCreate:0,inventoryUpdate:0,variantUpdate:0,corePatch:0,unexpected:[]};
 await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('admin-test-token')})));
 await page.route('**/api/users/current',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({user:{_id:'admin-user'}})}));
 await page.route(matches,async r=>{
  const req=r.request(),u=new URL(req.url()),method=req.method(),detailPath=productsPath+'/p1';
  const json=(status,body)=>r.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(method==='GET'&&u.pathname===productsPath&&u.searchParams.get('limit')==='1')return json(200,{items:[],pagination:{page:1,limit:1,total:0,pages:0}});
  if(method==='GET'&&u.pathname===detailPath){
    state.detail++;
    if(options.refreshProductMissing&&state.detail>1)return json(404,{error:{code:'PRODUCT_NOT_FOUND',message:'missing'}});
    if(options.unknownAppears&&state.detail>1&&!state.variants[0].inventory.some(x=>x.internalCode==='AK-099'))state.variants[0].inventory.push(inv('i99','v1','AK-099'));
    return json(200,{product:state.product,variants:state.variants});
  }
  if(method==='POST'&&u.pathname.startsWith(variantsPath+'/')&&u.pathname.endsWith('/inventory-items')){
    state.inventoryCreate++;const variantId=u.pathname.split('/')[5],body=req.postDataJSON();
    if(options.inventoryCreateNetwork&&state.inventoryCreate===1)return r.abort('failed');
    const created=inv('i'+(90+state.inventoryCreate),variantId,body.internalCode.trim().toUpperCase(),'active',body.condition||'good',body.notes||'');
    const owner=state.variants.find(v=>v.id===variantId);owner.inventory.push(created);return json(201,{inventoryItem:created});
  }
  if(method==='PATCH'&&u.pathname.startsWith(inventoryPath+'/')){
    state.inventoryUpdate++;const id=u.pathname.split('/').pop(),body=req.postDataJSON();
    if(options.inventoryUpdateNotFound)return json(404,{error:{code:'INVENTORY_ITEM_NOT_FOUND',message:'missing'}});
    const owner=state.variants.find(v=>v.inventory.some(i=>i.id===id)),current=owner.inventory.find(i=>i.id===id),updated={...current,...body};
    owner.inventory=owner.inventory.map(i=>i.id===id?updated:i);return json(200,{inventoryItem:updated});
  }
  if(method==='PATCH'&&u.pathname.startsWith(variantsPath+'/')){
    state.variantUpdate++;const id=u.pathname.split('/').pop(),body=req.postDataJSON(),current=state.variants.find(v=>v.id===id),updated={...current,size:body.size};
    state.variants=state.variants.map(v=>v.id===id?updated:v);const {inventory,...dto}=updated;return json(200,{variant:dto});
  }
  if(method==='PATCH'&&u.pathname===detailPath){state.corePatch++;const body=req.postDataJSON();state.product={...state.product,...body};return json(200,{product:state.product})}
  state.unexpected.push({method,path:u.pathname});return r.abort('failed');
 });
 return state;
}
const variants=page=>page.locator('[data-product-variants-section]');
const inventory=page=>variants(page).locator('[data-inventory-variant="v1"]');
for(const width of [375,390,430,768,1024,1440])test('Inventory responsive '+width,async({page})=>{
 await mocks(page);await page.setViewportSize({width,height:1100});await page.goto(APP+'/admin/produkty/p1');
 const zone=inventory(page);await expect(zone.getByRole('heading',{name:'Fyzické kusy',level:3})).toBeVisible();await expect(zone.getByText(longCode)).toBeVisible();
 await expect(variants(page).locator('[data-variant-id="v2"]').getByText('Pro velikost XS zatím nejsou žádné fyzické kusy')).toBeVisible();
 const vb=await variants(page).boundingBox(),zb=await zone.boundingBox(),row=zone.locator('[data-inventory-id="i1"]');
 const code=await row.locator('strong').first().boundingBox(),status=await row.getByText('Aktivní',{exact:true}).boundingBox(),condition=await row.locator('[data-inventory-condition-cell]').boundingBox(),edit=await row.getByRole('button',{name:'Upravit'}).boundingBox();
 expect(vb.width).toBeLessThanOrEqual(841);expect(zb.width).toBeLessThanOrEqual(vb.width);expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 if(width<768){expect(edit.width).toBeGreaterThan(zb.width*.75);expect(status.y).toBeGreaterThan(code.y);expect(condition.y).toBeGreaterThan(status.y)}
 else if(width<1024){const cy=b=>b.y+b.height/2;expect(condition.y).toBeGreaterThan(code.y);expect(Math.abs(cy(edit)-cy(condition))).toBeLessThan(2)}
 else {const centers=[code,status,condition,edit].map(b=>b.y+b.height/2);expect(Math.max(...centers)-Math.min(...centers)).toBeLessThan(20)}
 output('geometry-'+width+'.json',{width,variant:vb,inventory:zb,row:{code,status,condition,edit},scrollWidth:await page.evaluate(()=>document.documentElement.scrollWidth)});
 await page.screenshot({path:path.join(EVIDENCE,'responsive-'+width+'.png'),fullPage:true});
});
test('Inventory create trims code, uses canonical response, closes editor and focuses returned Edit',async({page})=>{
 const state=await mocks(page);await page.goto(APP+'/admin/produkty/p1');const zone=inventory(page);
 await zone.getByRole('button',{name:'Přidat fyzický kus'}).first().click();await expect(zone.getByLabel('Interní kód')).toBeFocused();
 await expect(zone.getByLabel('Stav kusu')).toHaveValue('good');await expect(zone.getByRole('option',{name:'Poškozený'})).toHaveCount(0);
 await zone.getByLabel('Interní kód').fill(' ak-009 ');await zone.getByLabel('Poznámka').fill('memo');await zone.locator('[data-inventory-submit]').click();
 await expect(zone.getByText('Fyzický kus byl přidán.')).toBeVisible();await expect(zone.getByText('AK-009')).toBeVisible();expect(state.inventoryCreate).toBe(1);
 await expect(zone.locator('[data-inventory-id]').filter({hasText:'AK-009'}).getByRole('button',{name:'Upravit'})).toBeFocused();await expect(zone.locator('[data-inventory-editor]')).toHaveCount(0);
});
test('Inventory edit sends changed fields only, preserves identity and focuses same Edit',async({page})=>{
 const state=await mocks(page);await page.goto(APP+'/admin/produkty/p1');const row=inventory(page).locator('[data-inventory-id="i1"]');
 await row.getByRole('button',{name:'Upravit'}).click();await expect(row.getByLabel('Stav kusu')).toBeFocused();await expect(row.getByRole('button',{name:'Uložit změny'})).toBeDisabled();
 await row.getByLabel('Stav kusu').selectOption('fair');await row.getByLabel('Poznámka').fill('changed');await row.getByRole('button',{name:'Uložit změny'}).click();
 await expect(inventory(page).getByText('Změny fyzického kusu byly uloženy.')).toBeVisible();await expect(row.getByText(longCode)).toBeVisible();await expect(row.getByText('Uspokojivý')).toBeVisible();expect(state.inventoryUpdate).toBe(1);await expect(row.getByRole('button',{name:'Upravit'})).toBeFocused();
});
test('one editor across Variant and Inventory uses single page Dialog for dirty Inventory switch',async({page})=>{
 await mocks(page);await page.goto(APP+'/admin/produkty/p1');const zone=inventory(page);
 await zone.getByRole('button',{name:'Přidat fyzický kus'}).first().click();await zone.getByLabel('Interní kód').fill('AK-9');await variants(page).locator('[data-variant-id="v1"]').getByRole('button',{name:'Upravit velikost'}).click();
 const d=page.getByRole('dialog');await expect(d).toHaveCount(1);await expect(d.getByRole('heading',{name:'Neuložené změny fyzického kusu'})).toBeVisible();await expect(d.getByRole('button',{name:'Zůstat'})).toBeFocused();
 await d.getByRole('button',{name:'Zůstat'}).click();await expect(zone.getByLabel('Interní kód')).toHaveValue('AK-9');await expect(zone.getByLabel('Interní kód')).toBeFocused();
 await variants(page).locator('[data-variant-id="v1"]').getByRole('button',{name:'Upravit velikost'}).click();await page.getByRole('dialog').getByRole('button',{name:'Zahodit změny a pokračovat'}).click();
 await expect(variants(page).getByLabel('Velikost')).toBeFocused();expect(await page.locator('[data-variant-editor],[data-inventory-editor]').count()).toBe(1);
});
test('Inventory-only and mixed leave risk use approved copy/actions',async({page})=>{
 await mocks(page);await page.goto(APP+'/admin/produkty/p1');const zone=inventory(page);
 await zone.getByRole('button',{name:'Přidat fyzický kus'}).first().click();await zone.getByLabel('Interní kód').fill('AK-9');await page.getByRole('link',{name:'Produkty',exact:true}).click();
 let d=page.getByRole('dialog');await expect(d.getByRole('heading',{name:'Neuložené změny fyzického kusu'})).toBeVisible();await expect(d.getByRole('button',{name:'Odejít bez uložení'})).toBeVisible();await d.getByRole('button',{name:'Zůstat'}).click();
 await page.getByLabel('Barva').fill('Růžová');await page.getByRole('link',{name:'Produkty',exact:true}).click();d=page.getByRole('dialog');await expect(d.getByRole('heading',{name:'Neuložené nebo nedokončené změny'})).toBeVisible();await expect(d.getByRole('button',{name:'Odejít bez uložení'})).toBeVisible();
});
test('unknown Inventory create never auto-replays POST and reconciles explicitly',async({page})=>{
 const state=await mocks(page,{inventoryCreateNetwork:true});await page.goto(APP+'/admin/produkty/p1');const zone=inventory(page);
 await zone.getByRole('button',{name:'Přidat fyzický kus'}).first().click();await zone.getByLabel('Interní kód').fill('AK-099');await zone.locator('[data-inventory-submit]').click();
 await expect(zone.getByText('Výsledek přidání fyzického kusu není potvrzený')).toBeVisible();expect(state.inventoryCreate).toBe(1);await expect(zone.getByRole('button',{name:'Načíst aktuální fyzické kusy'})).toBeVisible();
 await zone.getByRole('button',{name:'Načíst aktuální fyzické kusy'}).click();await expect(zone.getByText('Aktuální fyzické kusy byly načteny. Přidání můžete zkusit znovu.')).toBeVisible();expect(state.inventoryCreate).toBe(1);await expect(zone.getByLabel('Interní kód')).toHaveValue('AK-099');
});
