const { test, expect } = require('@playwright/test');
const fs = require('fs');
const APP = 'http://127.0.0.1:4173';
const evidence = 'test-evidence/overview-workday';
fs.mkdirSync(evidence, {recursive:true});

for (const width of [390,768,1440]) test(`workday overview and menu at ${width}`, async ({page}) => {
  const row={id:'r1',number:'AK-2026-001',name:'Klára Nováková',product:'Dětské šaty DET002',startDate:'2026-10-23',endDate:'2026-10-24',status:'pending'};
  const empty={total:0,items:[]};
  let overview={today:'2026-10-14',loadedAt:'2026-10-14T20:54:00Z',pending:{total:1,items:[row]},pickups:empty,returns:empty,deposits:empty,unpaid:2,overdue:0,maintenance:0,drafts:4};
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
      if(u.origin==='http://admin-api.test'&&u.pathname==='/api/v2/admin/overview')return json(overview);
    }
    unexpected.push({method,path:u.pathname});return route.abort();
  });
  await page.setViewportSize({width,height:1000});await page.goto(APP+'/admin');
  await expect(page.getByRole('heading',{name:'Přehled',exact:true})).toHaveCount(1);
  await expect(page.getByText('Klára Nováková')).toBeVisible();
  const card=page.getByRole('link',{name:'Otevřít rezervaci AK-2026-001'});
  expect(await card.getAttribute('href')).toBe('/admin/rezervace/r1');
  const bounds=await card.boundingBox();expect(bounds.y+bounds.height).toBeLessThan(750);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await expect(page.getByText('K vyřízení',{exact:true})).toHaveCount(0);
  await page.screenshot({path:`${evidence}/overview-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'K vrácení 0'}).click();
  await expect(page.getByText('Dnes není nic k vrácení')).toBeVisible();
  await page.getByRole('button',{name:'Nevypořádané kauce 0'}).click();
  await expect(page.getByText('Žádné evidované kauce k vypořádání.')).toBeVisible();
  if(width<1024){
    await page.getByRole('button',{name:'Otevřít navigaci administrace'}).click();
    const nav=page.getByRole('navigation',{name:'Navigace administrace'});
    await expect(nav.getByRole('link',{name:'Produkty',exact:true})).toBeVisible();
    expect(await nav.getByRole('link',{name:'Produkty',exact:true}).locator('svg').count()).toBe(1);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button',{name:'Otevřít navigaci administrace'})).toBeFocused();
  }
  overview={...overview,overdue:1,returns:{total:1,items:[{...row,id:'r2',number:'AK-LATE',startDate:'2026-10-10',endDate:'2026-10-12',status:'picked_up'}]}};
  await page.getByRole('button',{name:'Obnovit',exact:true}).click();
  await expect(page.getByText('Po termínu vrácení: 1')).toBeVisible();
  await page.getByRole('button',{name:'Zobrazit nevyřízená vrácení'}).click();
  await expect(page.getByRole('button',{name:'K vrácení 1'})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('link',{name:'Otevřít rezervaci AK-LATE'})).toBeVisible();
  expect(unexpected).toEqual([]);expect(errors).toEqual([]);
});
