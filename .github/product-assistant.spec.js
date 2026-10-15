const {test,expect}=require('@playwright/test');
const APP='http://127.0.0.1:4173',id='111111111111111111111111';
const image='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2296%22 height=%22128%22%3E%3Crect width=%2296%22 height=%22128%22 fill=%22%23ddbcc8%22/%3E%3C/svg%3E';
const file={name:'photo.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=','base64')};
async function fixture(page,aiFails=false){
 const calls={saves:[],suggest:0,unexpected:[]};
 await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('admin-test-token')})));
 await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP,async route=>{
  const req=route.request(),u=new URL(req.url()),p=u.pathname;
  const json=(body,status=200)=>route.fulfill({status,json:body});
  if(p==='/api/users/current')return json({user:{_id:'admin-user'}});
  if(p.endsWith('/favorites/storefront'))return json({favorites:[]});
  if(p==='/maps/api/js'||p==='/gsi/client')return route.fulfill({contentType:'application/javascript',body:''});
  if(p==='/api/v2/admin/products')return json({items:[],pagination:{page:1,limit:1,total:0,pages:0}});
  if(p==='/api/v2/admin/product-drafts')return json({draftId:id});
  if(p.endsWith('/photos/sign'))return json({upload:{cloudName:'fixture',apiKey:'fixture',signature:'fixture',resourceType:'image',params:{timestamp:1,folder:'draft',public_id:'photo',overwrite:false,allowed_formats:'png'}}});
  if(u.origin==='https://api.cloudinary.com')return json({public_id:'draft/photo'});
  if(p.endsWith('/photos/complete'))return json({photos:[{url:image,publicId:'draft/photo'}]});
  if(p.endsWith('/suggest')){calls.suggest++;return aiFails?json({error:{code:'AI_NOT_CONFIGURED',message:'AI zatím není připojena. Údaje můžete vyplnit ručně.'}},503):json({suggestion:{description:'Růžové slavnostní šaty s jemnou sukní.',colors:['Růžová'],category:'dress',gender:'girls',ageTags:[],note:'Věk ověřte podle štítku.'}});}
  if(p.endsWith('/save')){calls.saves.push(req.postDataJSON());return json({product:{id,name:'DET31',slug:'det31',description:req.postDataJSON().description,category:'dress',gender:'girls',color:'Růžová',occasion:[],ageTags:[],photos:[{url:image,publicId:'draft/photo'}],rentalEnabled:false,saleEnabled:false,defaultDeposit:0,status:'draft',seo:{noIndex:true}}});}
  calls.unexpected.push(p);return route.abort();
 });return calls;
}
for(const width of [390,768,1440])test('photo first AI review and save '+width,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const calls=await fixture(page);await page.setViewportSize({width,height:1000});await page.goto(APP+'/admin/produkty/novy');
 await expect(page.getByLabel('Název',{exact:true})).toHaveCount(0);await expect(page.getByLabel('URL / slug')).toHaveCount(0);await expect(page.getByLabel('Rodinný look')).toHaveCount(0);
 const ai=page.getByRole('button',{name:'Navrhnout pomocí AI'});await expect(ai).toBeDisabled();
 await page.locator('input[type=file]').setInputFiles(file);await expect(page.getByAltText('Fotografie produktu 1')).toBeVisible();await expect(ai).toBeEnabled();
 await page.getByLabel('Popis',{exact:true}).fill('Ruční poznámka');await ai.click();await expect(page.getByRole('heading',{name:'Návrh AI'})).toBeVisible();await expect(page.getByLabel('Popis',{exact:true})).toHaveValue('Ruční poznámka');
 await page.getByRole('button',{name:'Použít návrh'}).click();await expect(page.getByLabel('Popis',{exact:true})).toHaveValue('Růžové slavnostní šaty s jemnou sukní.');await expect(page.getByLabel('Číselná řada')).toHaveValue('DET');
 await expect(page.getByLabel('SEO titulek',{exact:true})).toBeHidden();
 await page.getByText('Pokročilé nastavení',{exact:true}).click();
 await expect(page.getByLabel('SEO titulek',{exact:true})).toHaveAttribute('placeholder','Dívčí šaty | AniraKids');
 await page.getByLabel('SEO titulek',{exact:true}).fill('Vlastní titulek');
 await expect(page.getByLabel('Náhled pro vyhledávače')).toContainText('Vlastní titulek');
 await page.getByLabel('SEO titulek',{exact:true}).fill('');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await page.screenshot({path:`test-evidence/product-assistant/create-${width}.png`});
 await page.getByRole('button',{name:'Uložit',exact:true}).click();await expect(page).toHaveURL(new RegExp('/admin/produkty/'+id+'$'));await expect(page.getByText('/produkt/det31')).toBeVisible();
 await expect(page.getByRole('img',{name:'DET31',exact:true})).toBeVisible();
 await expect(page.getByText('Produkt zatím nemá žádné fotografie.',{exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Aktivovat produkt',exact:true})).toBeEnabled();
 expect(calls.saves).toHaveLength(1);expect(calls.saves[0]).not.toHaveProperty('name');expect(calls.saves[0]).not.toHaveProperty('slug');expect(calls.saves[0].prefix).toBe('DET');expect(errors).toEqual([]);expect(calls.unexpected).toEqual([]);
});
test('AI unavailable preserves manual values and permits save',async({page})=>{
 const calls=await fixture(page,true);await page.goto(APP+'/admin/produkty/novy');await page.locator('input[type=file]').setInputFiles(file);await page.getByLabel('Popis',{exact:true}).fill('Ruční popis');await page.getByRole('button',{name:'Navrhnout pomocí AI'}).click();await expect(page.getByText('AI zatím není připojena. Údaje můžete vyplnit ručně.')).toBeVisible();await expect(page.getByLabel('Popis',{exact:true})).toHaveValue('Ruční popis');await page.getByLabel('Kategorie',{exact:true}).selectOption('dress');await page.getByLabel('Určení',{exact:true}).selectOption('girls');await page.getByRole('button',{name:'Uložit',exact:true}).click();await expect(page).toHaveURL(new RegExp('/admin/produkty/'+id+'$'));expect(calls.saves[0].description).toBe('Ruční popis');
});
