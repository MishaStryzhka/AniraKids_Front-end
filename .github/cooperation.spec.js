const {test,expect}=require('@playwright/test');
const APP='http://127.0.0.1:4173';
for(const width of [375,390,430,768,1024,1440])test('cooperation activation and fitting location '+width,async({page})=>{
 let active=false;const writes=[],errors=[];
 const address=()=>active?'Plzeňská 782/112, 150 00 Praha':'Kytlická 862/2, Praha';
 await page.setViewportSize({width,height:1000});
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('test-admin-token')})));
 await page.route(url=>/^https?:$/.test(url.protocol)&&url.origin!==APP,async route=>{
  const req=route.request(),p=new URL(req.url()).pathname,json=(body,status=200)=>route.fulfill({status,json:body});
  if(p==='/gsi/client'||p==='/maps/api/js')return route.fulfill({contentType:'application/javascript',body:''});
  if(p==='/api/users/current')return json({user:{_id:'admin-user',firstName:'Jana',lastName:'Nová',email:'jana@example.test'}});
  if(p==='/api/v2/admin/access')return json({owner:true,permissions:['settings','partners','fittings']});
  if(p==='/api/v2/admin/administrators')return json({owners:[],items:[],total:0});
  if(p==='/api/v2/site-settings'||p==='/api/v2/admin/settings')return json({sections:{suits:true,familyLooks:false},cooperationActive:active});
  if(p==='/api/v2/partner/access')return json({owner:true,role:'administrator',partnerId:'blaze',enabled:true,cooperationActive:active});
  if(p==='/api/v2/partner/cooperation'){writes.push(req.postDataJSON());active=req.postDataJSON().active;return json({ok:true});}
  if(p==='/api/v2/admin/fitting-settings')return json({enabled:true,address:address(),weekly:Array.from({length:7},(_,day)=>({day,enabled:true,start:'09:00',end:'17:00'})),blockedDates:[]});
  if(p==='/api/v2/fittings/slots')return json({enabled:true,address:address(),placeName:active?'Blaze Photostudio':'ANIRAK',date:new URL(req.url()).searchParams.get('date'),slots:['12:00'],durationMinutes:30,price:200});
  if(p.endsWith('/favorites/storefront'))return json({ids:[]});
  if(p==='/api/v2/admin/products')return json({items:[],pagination:{page:1,limit:1,total:0,pages:0}});
  return json({items:[],total:0});
 });
 await page.goto(APP+'/zkouska');
 await expect(page.getByText('Kytlická 862/2, Praha',{exact:false})).toBeVisible();
 await page.goto(APP+'/admin/nastaveni#partneri');
 const activate=page.getByRole('button',{name:'Aktivovat spolupráci',exact:true});
 await expect(activate).toBeEnabled();expect(writes).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await activate.click();await expect(page.getByRole('button',{name:'Deaktivovat spolupráci',exact:true})).toBeEnabled();
 expect(writes).toEqual([{active:true}]);
 await page.goto(APP+'/zkouska');await expect(page.getByText('Plzeňská 782/112, 150 00 Praha',{exact:false})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 await page.goto(APP+'/admin/nastaveni#partneri');await page.getByRole('button',{name:'Deaktivovat spolupráci',exact:true}).click();await expect(page.getByRole('button',{name:'Aktivovat spolupráci',exact:true})).toBeEnabled();
 await page.goto(APP+'/zkouska');await expect(page.getByText('Kytlická 862/2, Praha',{exact:false})).toBeVisible();
 expect(errors).toEqual([]);
});
