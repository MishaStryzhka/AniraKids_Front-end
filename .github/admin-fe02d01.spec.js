const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');
const APP='http://127.0.0.1:4173';
const EVIDENCE=process.env.ADMIN_FE02D01_EVIDENCE_DIR||'test-evidence/admin-fe02d01';
fs.mkdirSync(EVIDENCE,{recursive:true});
const output=(name,value)=>fs.writeFileSync(path.join(EVIDENCE,name),JSON.stringify(value,null,2));
const adminOrigin='http://admin-api.test';
const productsPath='/api/v2/admin/products',inventoryPath='/api/v2/admin/inventory-items';
const IMAGE='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2296%22 height=%22128%22%3E%3Crect width=%2296%22 height=%22128%22 fill=%22%23ddd%22/%3E%3C/svg%3E';
const product={id:'p1',name:'Sofia',slug:'sofia',description:'',category:'dress',gender:'girls',color:'Bílá',occasion:[],ageTags:[],brand:'',familyLookGroup:'',rentalEnabled:false,saleEnabled:false,defaultDeposit:0,seo:{noIndex:false},photos:[{publicId:'photo-a',url:IMAGE,alt:'Sofia'}],status:'draft',createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',rentalPrices:{}};
const inv=(id,code,status='active',condition='good',notes='')=>({id,variantId:'v1',internalCode:code,status,condition,notes,createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z'});
const longCode='AK-'+('LONGCODE-'.repeat(8)).slice(0,77);
const variant=(inventory)=>({id:'v1',productId:'p1',size:'98-104',sku:'SKU-1',status:'active',sortOrder:0,createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',inventory});
const seed=()=>variant([
  inv('i1',longCode,'active','good','Aktivní kus'),
  inv('i2','AK-002','maintenance','good','Údržba'),
  inv('i3','AK-003','retired','fair','Vyřazený'),
]);
const matches=url=>url.origin===adminOrigin&&(url.pathname===productsPath||url.pathname.startsWith(productsPath+'/')||url.pathname.startsWith(inventoryPath+'/'));
async function mocks(page,options={}){
 const state={product:structuredClone(product),variants:[structuredClone(seed())],detail:0,lifecycle:[],inventoryUpdate:0,unexpected:[],release:null};
 await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('admin-test-token')})));
 await page.route('**/api/users/current',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({user:{_id:'admin-user'}})}));
 await page.route(matches,async r=>{
  const req=r.request(),u=new URL(req.url()),method=req.method(),detailPath=productsPath+'/p1';
  const json=(status,body)=>r.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(method==='GET'&&u.pathname===productsPath&&u.searchParams.get('limit')==='1')return json(200,{items:[],pagination:{page:1,limit:1,total:0,pages:0}});
  if(method==='GET'&&u.pathname===detailPath){
    state.detail++;
    if(options.unknownRefreshTarget&&state.detail>1){
      state.variants[0].inventory=state.variants[0].inventory.map(x=>x.id==='i1'?{...x,status:'maintenance'}:x);
    }
    return json(200,{product:state.product,variants:state.variants});
  }
  const lifecycleMatch=u.pathname.match(/^\/api\/v2\/admin\/inventory-items\/([^/]+)\/(maintenance|activate|retire)$/);
  if(method==='POST'&&lifecycleMatch){
    const [,id,action]=lifecycleMatch;state.lifecycle.push({id,action,body:req.postData()});
    const owner=state.variants[0],current=owner.inventory.find(x=>x.id===id);
    if(options.reservationConflict&&action===options.reservationConflict)return json(409,{error:{code:'INVENTORY_HAS_CURRENT_OR_FUTURE_RESERVATION',message:'blocked'}});
    if(options.damagedActivation&&action==='activate')return json(409,{error:{code:'DAMAGED_ITEM_CANNOT_BE_ACTIVATED',message:'damaged'}});
    if(options.unknownMaintenance&&action==='maintenance'&&state.lifecycle.filter(x=>x.action==='maintenance').length===1)return r.abort('failed');
    if(options.deferAction===action){
      await new Promise(resolve=>{state.release=resolve});
      state.release=null;
    }
    const target=action==='maintenance'?'maintenance':action==='activate'?'active':'retired';
    const updated={...current,status:target,...(target==='retired'?{retiredAt:'2026-10-04T00:00:00Z'}:{})};
    owner.inventory=owner.inventory.map(x=>x.id===id?updated:x);
    return json(200,{inventoryItem:updated});
  }
  if(method==='PATCH'&&u.pathname.startsWith(inventoryPath+'/')){
    state.inventoryUpdate++;const id=u.pathname.split('/').pop(),body=req.postDataJSON(),owner=state.variants[0],current=owner.inventory.find(x=>x.id===id),updated={...current,...body};
    owner.inventory=owner.inventory.map(x=>x.id===id?updated:x);return json(200,{inventoryItem:updated});
  }
  if(method==='PATCH'&&u.pathname===detailPath){const body=req.postDataJSON();state.product={...state.product,...body};return json(200,{product:state.product})}
  state.unexpected.push({method,path:u.pathname});return r.abort('failed');
 });
 return state;
}
const variants=page=>page.locator('[data-product-variants-section]');
const zone=page=>variants(page).locator('[data-inventory-variant="v1"]');
const row=(page,id)=>zone(page).locator(`[data-inventory-id="${id}"]`);

for(const width of [375,390,430,768,1024,1440])test('02D lifecycle responsive '+width,async({page})=>{
 await mocks(page);await page.setViewportSize({width,height:1100});await page.goto(APP+'/admin/produkty/p1');
 const active=row(page,'i1'),maintenance=row(page,'i2'),retired=row(page,'i3');
 await expect(active.getByRole('button',{name:'Upravit'})).toBeVisible();
 await expect(active.getByRole('button',{name:'Přesunout do údržby'})).toBeVisible();
 await expect(active.getByRole('button',{name:'Vyřadit'})).toBeVisible();
 await expect(active.getByRole('button',{name:'Aktivovat'})).toHaveCount(0);
 await expect(maintenance.getByRole('button',{name:'Aktivovat'})).toBeVisible();
 await expect(maintenance.getByRole('button',{name:'Vyřadit'})).toBeVisible();
 await expect(maintenance.getByRole('button',{name:'Přesunout do údržby'})).toHaveCount(0);
 await expect(retired.getByRole('button',{name:'Upravit'})).toBeVisible();
 await expect(retired.getByRole('button',{name:'Aktivovat'})).toHaveCount(0);await expect(retired.getByRole('button',{name:'Vyřadit'})).toHaveCount(0);
 await expect(active.getByText(longCode)).toBeVisible();
 const actions=active.locator('[data-inventory-actions]'),ab=await actions.boundingBox(),buttons=await actions.getByRole('button').all();
 const boxes=[];for(const b of buttons)boxes.push(await b.boundingBox());
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);expect(overflow).toBeLessThanOrEqual(1);
 if(width<768){for(const box of boxes)expect(box.width).toBeGreaterThan(ab.width*.85);expect(boxes[1].y).toBeGreaterThan(boxes[0].y);expect(boxes[2].y).toBeGreaterThan(boxes[1].y)}
 else {expect(await actions.evaluate(el=>getComputedStyle(el).display)).toBe('flex')}
 output('geometry-'+width+'.json',{width,actions:ab,buttons:boxes,overflow});
 await page.screenshot({path:path.join(EVIDENCE,'responsive-'+width+'.png'),fullPage:true});
});

test('maintenance pending keeps Spinner and visible text then commits status/focus',async({page})=>{
 const state=await mocks(page,{deferAction:'maintenance'});await page.goto(APP+'/admin/produkty/p1');const active=row(page,'i1');
 await active.getByRole('button',{name:'Přesunout do údržby'}).click();
 const pending=active.getByRole('button',{name:'Přesouvání…'});await expect(pending).toBeVisible();await expect(pending).toBeDisabled();await expect(pending).toHaveAttribute('aria-busy','true');expect(await pending.locator('[aria-hidden="true"]').count()).toBeGreaterThan(0);
 expect(state.lifecycle[0]).toEqual({id:'i1',action:'maintenance',body:null});
 state.release();await expect(active.getByText('V údržbě')).toBeVisible();await expect(active.getByText('Fyzický kus byl přesunut do údržby.')).toBeVisible();await expect(active.getByRole('button',{name:'Upravit'})).toBeFocused();
});

test('notes-only edit allows activate; dirty condition disables it with exact helper',async({page})=>{
 await mocks(page);await page.goto(APP+'/admin/produkty/p1');const maintenance=row(page,'i2');
 await maintenance.getByRole('button',{name:'Upravit'}).click();await maintenance.getByLabel('Poznámka').fill('notes-only');await expect(maintenance.getByRole('button',{name:'Aktivovat'})).toBeEnabled();
 await maintenance.getByLabel('Stav kusu').selectOption('fair');const activate=maintenance.getByRole('button',{name:'Aktivovat'});await expect(activate).toBeDisabled();await expect(maintenance.getByText('Nejprve uložte nebo zrušte rozpracovanou změnu Stavu kusu.')).toBeVisible();
});

test('reservation conflict is item-local and offers no override',async({page})=>{
 await mocks(page,{reservationConflict:'maintenance'});await page.goto(APP+'/admin/produkty/p1');const active=row(page,'i1');
 await active.getByRole('button',{name:'Přesunout do údržby'}).click();await expect(active.getByText('Provozní stav nelze změnit')).toBeVisible();await expect(active.getByText(/aktuální nebo budoucí rezervaci/)).toBeVisible();await expect(active.getByRole('button',{name:'Přesunout do údržby'})).toBeFocused();
});

test('damaged activation uses approved copy and no automatic repair',async({page})=>{
 const state=await mocks(page,{damagedActivation:true});state.variants[0].inventory=state.variants[0].inventory.map(x=>x.id==='i2'?{...x,condition:'damaged'}:x);
 await page.goto(APP+'/admin/produkty/p1');const maintenance=row(page,'i2');await maintenance.getByRole('button',{name:'Aktivovat'}).click();
 await expect(maintenance.getByText('Fyzický kus nelze aktivovat')).toBeVisible();await expect(maintenance.getByText(/označen jako Poškozený/)).toBeVisible();expect(state.inventoryUpdate).toBe(0);
});

test('unknown lifecycle disables replay until explicit refresh observes server status',async({page})=>{
 const state=await mocks(page,{unknownMaintenance:true,unknownRefreshTarget:true});await page.goto(APP+'/admin/produkty/p1');const active=row(page,'i1');
 await active.getByRole('button',{name:'Přesunout do údržby'}).click();await expect(active.getByText('Výsledek změny provozního stavu není potvrzený')).toBeVisible();expect(state.lifecycle).toHaveLength(1);
 await expect(active.getByRole('button',{name:'Přesunout do údržby'})).toBeDisabled();await active.getByRole('button',{name:'Načíst aktuální fyzické kusy'}).click();
 await expect(active.getByText('V údržbě')).toBeVisible();await expect(active.getByText('Aktuální fyzické kusy byly načteny.')).toBeVisible();expect(state.lifecycle).toHaveLength(1);
});

test('retire Dialog exact copy, initial focus, Escape restoration and successful retire focus',async({page})=>{
 const state=await mocks(page);await page.setViewportSize({width:390,height:360});await page.goto(APP+'/admin/produkty/p1');const active=row(page,'i1'),retire=active.getByRole('button',{name:'Vyřadit'});
 await retire.click();let d=page.getByRole('dialog');await expect(d.getByRole('heading',{name:'Vyřadit fyzický kus?'})).toBeVisible();await expect(d).toContainText('bude trvale převeden do stavu Vyřazený. Po vyřazení jej nelze znovu aktivovat.');
 const cancel=d.getByRole('button',{name:'Zrušit'}),confirm=d.getByRole('button',{name:'Vyřadit'});await expect(cancel).toBeVisible();await expect(confirm).toBeVisible();await expect(cancel).toBeFocused();
 const actions=cancel.locator('xpath=..'),cancelBox=await cancel.boundingBox(),confirmBox=await confirm.boundingBox(),actionsBox=await actions.boundingBox();
 expect(cancelBox).not.toBeNull();expect(confirmBox).not.toBeNull();expect(actionsBox).not.toBeNull();
 if(!cancelBox||!confirmBox||!actionsBox)throw new Error('Retire Dialog action geometry unavailable');
 expect(confirmBox.y-(cancelBox.y+cancelBox.height)).toBeGreaterThan(0);
 expect(cancelBox.width/actionsBox.width).toBeGreaterThanOrEqual(.95);expect(confirmBox.width/actionsBox.width).toBeGreaterThanOrEqual(.95);
 const overflow=await page.evaluate(()=>{const dialog=document.querySelector('[role="dialog"]');return{document:document.documentElement.scrollWidth-innerWidth,dialog:dialog?dialog.scrollWidth-dialog.clientWidth:0}});
 expect(overflow.document).toBeLessThanOrEqual(1);expect(overflow.dialog).toBeLessThanOrEqual(1);
 output('retire-dialog-390x360.json',{actions:actionsBox,cancel:cancelBox,retire:confirmBox,overflow});
 await d.screenshot({path:path.join(EVIDENCE,'retire-dialog-390x360.png')});
 await page.keyboard.press('Escape');await expect(d).toHaveCount(0);await expect(retire).toBeFocused();
 await retire.click();d=page.getByRole('dialog');await d.getByRole('button',{name:'Vyřadit'}).click();await expect(d).toHaveCount(0);await expect(active.getByText('Vyřazený')).toBeVisible();await expect(active.getByRole('button',{name:'Upravit'})).toBeFocused();await expect(active.getByRole('button',{name:'Vyřadit'})).toHaveCount(0);expect(state.lifecycle.filter(x=>x.action==='retire')).toHaveLength(1);
});

test('enlarged text keeps lifecycle actions wrapped without horizontal overflow',async({page})=>{
 await mocks(page);await page.setViewportSize({width:430,height:1000});await page.goto(APP+'/admin/produkty/p1');
 await page.addStyleTag({content:'[data-inventory-variant]{font-size:200%}[data-inventory-actions] button{font-size:200%;line-height:1.3}'});
 const active=row(page,'i1');await expect(active.getByText(longCode)).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 const buttons=active.locator('[data-inventory-actions]').getByRole('button');for(let i=0;i<await buttons.count();i++)await expect(buttons.nth(i)).toBeVisible();
});
