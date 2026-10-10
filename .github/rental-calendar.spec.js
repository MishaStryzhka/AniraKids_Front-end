const { test, expect } = require('@playwright/test');
const { policy } = require('./payment-fixtures');
const fs = require('fs');
const APP = 'http://127.0.0.1:4173', API = 'http://admin-api.test';
const EVIDENCE = 'test-evidence/rental-calendar';
fs.mkdirSync(EVIDENCE, { recursive: true });
const product = {
  id:'111111111111111111111111', slug:'sofia', name:'Sofia', category:'dress', photos:[],
  variants:[{id:'222222222222222222222222',size:'98',pricing:{studio:{rentalPrice:500,deposit:1000,totalDue:1500},external:null}},
    {id:'333333333333333333333333',size:'104',pricing:{studio:{rentalPrice:500,deposit:1000,totalDue:1500},external:null}}],
};
async function setup(page) {
  const state={posts:[],errors:[],reads:[],fail:false};
  await page.clock.install({time:new Date('2032-02-01T12:00:00Z')});
  page.on('pageerror',error=>state.errors.push(error.message));
  await page.route(url=>url.origin===API,async route=>{
    const request=route.request(),url=new URL(request.url()),q=Object.fromEntries(url.searchParams);
    const json=body=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
    if(request.method()!=='GET'){state.posts.push(url.pathname);return route.fulfill({status:500});}
    if(url.pathname==='/api/v2/booking-policy')return json(policy);
    if(url.pathname==='/api/v2/catalogue/products/sofia')return json({product});
    if(url.pathname.endsWith('/availability-calendar')) {
      state.reads.push(q);
      if(state.fail)return route.fulfill({status:503,contentType:'application/json',body:'{"error":{"code":"UNAVAILABLE"}}'});
      const length=new Date(q.month+'-01T00:00:00Z');length.setUTCMonth(length.getUTCMonth()+1,0);
      return json({calendar:{...q,productId:product.id,startDate:q.startDate||null,today:'2032-02-01',checkedAt:'2032-02-01T12:00:00Z',
        days:Array.from({length:length.getUTCDate()},(_,i)=>{
          const date=q.month+'-'+String(i+1).padStart(2,'0');
          return {date,available:date>='2032-02-01' && date!=='2032-02-04' &&
            (!q.startDate||(date>=q.startDate && !(q.startDate<='2032-02-04'&&date>='2032-02-04')))};
        })}});
    }
    if(url.pathname.endsWith('/availability'))return json({availability:{...q,productId:product.id,available:true,
      pricing:product.variants[0].pricing.studio,checkedAt:'2032-02-01T12:00:00Z'}});
    return route.fulfill({status:404,contentType:'application/json',body:'{"error":{"code":"NOT_FOUND"}}'});
  });
  await page.goto(APP+'/produkt/sofia');
  await page.getByRole('button',{name:'Vybrat velikost a termín'}).click();
  return state;
}
const day=(page,date)=>page.locator('[data-date="'+date+'"]');
for(const width of [375,390,430,768,1024,1440]) {
  test('available calendar and automatic quote at '+width,async({page})=>{
    await page.setViewportSize({width,height:1000});
    const state=await setup(page);
    expect(state.reads).toHaveLength(0);
    await page.getByLabel('Velikost',{exact:true}).selectOption(product.variants[0].id);
    await expect(day(page,'2032-02-06')).toHaveAttribute('aria-disabled','false');
    await expect(page.getByText('únor 2032',{exact:true})).toBeVisible();
    await expect(day(page,'2032-02-04')).toHaveAttribute('aria-disabled','true');
    await day(page,'2032-02-06').click();
    await expect(day(page,'2032-02-08')).toHaveAttribute('aria-disabled','false');
    expect(state.reads.at(-1).startDate).toBe('2032-02-06');
    await day(page,'2032-02-08').click();
    await expect(page.getByText('Termín je aktuálně dostupný',{exact:true})).toBeVisible();
    await expect(page.getByLabel('Od',{exact:true})).toHaveValue('2032-02-06');
    await expect(page.getByLabel('Do',{exact:true})).toHaveValue('2032-02-08');
    const calendar=page.getByLabel('Kalendář dostupnosti',{exact:true});
    for(const target of [day(page,'2032-02-06'),page.getByRole('button',{name:'Následující měsíc'})]) {
      const box=await target.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
    await calendar.screenshot({path:EVIDENCE+'/calendar-'+width+'.png'});
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:EVIDENCE+'/booking-'+width+'.png',fullPage:true});
    expect(state.posts).toEqual([]);
    expect(state.errors).toEqual([]);
  });
}
test('keyboard, continuous range and recoverable month failure',async({page})=>{
  const state=await setup(page);
  await page.getByLabel('Velikost',{exact:true}).selectOption(product.variants[0].id);
  await expect(day(page,'2032-02-03')).toHaveAttribute('aria-disabled','false');
  await day(page,'2032-02-02').focus();
  await page.keyboard.press('ArrowRight');
  await expect(day(page,'2032-02-03')).toBeFocused();
  expect(await day(page,'2032-02-03').evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');
  await page.keyboard.press('Enter');
  await expect(day(page,'2032-02-05')).toHaveAttribute('aria-disabled','true');
  await page.getByRole('button',{name:'Změnit začátek pronájmu'}).click();
  await expect(day(page,'2032-02-28')).toHaveAttribute('aria-disabled','false');
  await day(page,'2032-02-28').click();
  await page.getByRole('button',{name:'Následující měsíc'}).click();
  await expect(day(page,'2032-03-02')).toHaveAttribute('aria-disabled','false');
  await day(page,'2032-03-02').click();
  await expect(page.getByLabel('Do',{exact:true})).toHaveValue('2032-03-02');
  state.fail=true;
  await page.getByRole('button',{name:'Následující měsíc'}).click();
  await expect(page.getByText('Dostupné dny se nepodařilo načíst.')).toBeVisible();
  await expect(day(page,'2032-04-01')).toHaveAttribute('aria-disabled','true');
  state.fail=false;
  await page.getByRole('button',{name:'Načíst dostupné dny znovu'}).click();
  await expect(day(page,'2032-04-01')).toHaveAttribute('aria-disabled','false');
  expect(state.posts).toEqual([]);
  expect(state.errors).toEqual([]);
});
