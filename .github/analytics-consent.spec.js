const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');
const APP='https://anirakids.cz';
fs.mkdirSync('test-evidence/analytics',{recursive:true});
async function setup(page){
 const tags=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.hostname==='www.googletagmanager.com'){tags.push(u.href);return route.fulfill({contentType:'application/javascript',body:'/* Google transport isolated from test traffic */'});}
  if(u.origin===APP){let f=path.join(process.cwd(),'build',u.pathname);if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(process.cwd(),'build/index.html');return route.fulfill({path:f,contentType:f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.html')?'text/html':undefined});}
  if(u.pathname==='/api/v2/site-settings')return route.fulfill({json:{cooperationActive:false,sections:{girlsDresses:true,womenDresses:true,suits:true,familyLooks:false}}});
  if(u.pathname==='/api/v2/catalogue/products')return route.fulfill({json:{items:[],page:1,limit:12,total:0,totalPages:0,facets:{colors:[],sizes:[]}}});
  if(u.pathname==='/gsi/client'||u.pathname==='/maps/api/js')return route.fulfill({contentType:'application/javascript',body:''});
  return route.fulfill({status:401,json:{error:{code:'UNAUTHORIZED'}}});
 });return {tags,errors};
}
const events=page=>page.evaluate(()=>(window.dataLayer||[]).map(x=>Array.from(x)).filter(x=>x[0]==='event'));
for(const width of [375,390,430,768,1024,1440])test('consent, withdrawal and private routes '+width,async({page})=>{
 const state=await setup(page);await page.setViewportSize({width,height:1000});
 await page.goto(APP+'/saty?email=PRIVATE#SECRET');
 await expect(page.getByRole('heading',{name:'Vaše soukromí'})).toBeVisible();expect(state.tags).toEqual([]);
 await expect(page.getByRole('heading',{name:'Sekci se nepodařilo načíst'})).toHaveCount(0);
 await expect(page.locator('footer a[href="/saty"]')).toBeVisible();
 const banner=page.getByRole('region',{name:'Vaše soukromí'});
 const bounds=await banner.boundingBox();
 expect(bounds.y+bounds.height).toBeLessThanOrEqual(1000);
 expect(1000-bounds.y-bounds.height).toBeLessThanOrEqual(25);
 expect(bounds.width).toBeLessThanOrEqual(480);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await page.screenshot({path:`test-evidence/analytics/banner-${width}.png`});
 await page.getByRole('button',{name:'Pouze nezbytné',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Vaše soukromí'})).toHaveCount(0);expect(state.tags).toEqual([]);
 await page.reload();await expect(page.getByRole('heading',{name:'Vaše soukromí'})).toHaveCount(0);expect(state.tags).toEqual([]);
 await page.locator('footer a[href="/cookies"]').click();
 await expect(page.getByRole('status').filter({hasText:'Analytika:'})).toHaveText('Analytika: odmítnuta.');
 await page.getByRole('button',{name:'Povolit analytiku',exact:true}).click();
 await expect.poll(()=>state.tags.length).toBe(1);expect((await events(page)).map(x=>x[1])).toEqual(['page_view']);
 expect(JSON.stringify(await events(page))).not.toMatch(/PRIVATE|SECRET/);
 await page.screenshot({path:`test-evidence/analytics/preferences-${width}.png`,fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await page.getByRole('button',{name:'Pouze nezbytné',exact:true}).click();
 expect(await page.evaluate(()=>window['ga-disable-G-2CC3J398BS'])).toBe(true);
 await page.reload();expect(state.tags.length).toBe(1);expect(await events(page)).toEqual([]);
 await page.goto(APP+'/ucet?email=PRIVATE');expect(await events(page)).toEqual([]);
 expect(state.errors).toEqual([]);
});
test('existing consent cannot initialize tag on private URLs',async({page})=>{
 const state=await setup(page);await page.addInitScript(()=>localStorage.setItem('anirak.analytics-consent.v1',JSON.stringify({version:1,choice:'granted',at:Date.now()})));
 for(const route of ['/admin','/ucet','/stav-rezervace?token=SECRET','/zkouska/ZK-SECRET#PRIVATE']){await page.goto(APP+route);expect(state.tags).toEqual([]);expect(await events(page)).toEqual([]);}
});
