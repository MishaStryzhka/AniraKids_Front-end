const {test,expect}=require('@playwright/test');
for(const width of [390,1440])test(`invoice preview, issue, download and explicit send at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:1000});let items=[],writes=0,sends=0;const browserErrors=[];page.on('pageerror',e=>browserErrors.push(e.message));
 const snapshot={buyer:{name:'Žofie Černá',address:'Příčná 12, Praha',email:'invoice@example.test',ico:''},lines:[{description:'Osobní zkouška šatů',amount:200}],total:200,paid:200,balance:0,deposit:0,serviceDate:'2026-10-10'};
 await page.addInitScript(()=>localStorage.setItem('persist:auth',JSON.stringify({token:JSON.stringify('fixture-admin')})));
 await page.route(url=>url.origin!=='http://127.0.0.1:4173',async route=>{const req=route.request(),p=new URL(req.url()).pathname,json=x=>route.fulfill({json:x});
 if(p==='/api/users/current')return json({user:{_id:'admin1'}});
 if(p==='/api/users/favorites/storefront')return json({favorites:[]});
 if(p.endsWith('/admin/access'))return json({owner:true,permissions:[]});
 if(p.endsWith('/invoices/preview'))return json({snapshot,fingerprint:'a'.repeat(64)});
 if(p.endsWith('/invoices')&&req.method()==='POST'){expect(req.postDataJSON().fingerprint).toBe('a'.repeat(64));writes++;items=[{_id:'i1',number:'2026-0001',sourceType:'fitting',sourceNumber:'ZK-TEST',issuedAt:'2026-10-19',snapshot}];return json({invoice:items[0]});}
 if(p.endsWith('/invoices'))return json({items});
 if(p.endsWith('/i1/pdf'))return route.fulfill({contentType:'application/pdf',body:'%PDF-1.4 fixture'});
 if(p.endsWith('/i1/send')){sends++;items[0].email={status:'sent'};return json({sent:true});}
 return route.abort();});
 await page.goto('http://127.0.0.1:4173/admin/faktury');
 await page.getByLabel('Číslo zkoušky / rezervace').fill('ZK-TEST');await page.getByLabel('Jméno nebo firma odběratele').fill(snapshot.buyer.name);await page.getByLabel('Adresa odběratele').fill(snapshot.buyer.address);
 await page.getByRole('button',{name:'Zkontrolovat náhled'}).click();await expect(page.getByText('Náhled před vystavením')).toBeVisible();expect(writes).toBe(0);
 await page.getByRole('button',{name:'Vystavit fakturu',exact:true}).click();await expect(page.getByText('Faktura 2026-0001', {exact:true})).toBeVisible();expect(writes).toBe(1);expect(sends).toBe(0);
 const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Stáhnout PDF'}).click();expect((await downloaded).suggestedFilename()).toBe('2026-0001.pdf');
 await page.getByRole('button',{name:'Odeslat zákazníkovi'}).click();await expect(page.getByRole('dialog')).toContainText('invoice@example.test');expect(sends).toBe(0);await page.getByRole('button',{name:'Potvrdit',exact:true}).click();await expect(page.getByText('E-mail: odesláno')).toBeVisible();expect(sends).toBe(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);expect(browserErrors).toEqual([]);
 await page.screenshot({path:`/tmp/invoices-ui-${width}.png`,fullPage:true});
});
