const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const handlers={},notifications=[],opened=[];
const self={location:{origin:'https://anirakids.cz'},addEventListener:(name,handler)=>{handlers[name]=handler;},skipWaiting:async()=>{},
  registration:{showNotification:async(title,options)=>{notifications.push({title,options});}},
  clients:{claim:async()=>{},matchAll:async()=>[],openWindow:async url=>{opened.push(url);}}};
vm.runInNewContext(fs.readFileSync('public/admin-push-sw.js','utf8'),{self,URL});
async function dispatch(name,extra={}){let work;handlers[name]({...extra,waitUntil:promise=>{work=promise;}});await work;}
(async()=>{
  await dispatch('push',{data:{json:()=>({type:'fitting_created',url:'https://example.test'})}});
  await dispatch('push',{data:{json:()=>({type:'fitting_payment_reported'})}});
  await dispatch('push');
  await dispatch('push',{data:{json:()=>{throw new Error('invalid');}}});
  assert.equal(notifications[0].title,'ANIRAK · Nová zkouška');
  assert.equal(notifications[1].title,'ANIRAK · Ověřit platbu');
  assert.equal(notifications[2].title,'ANIRAK · Ověřit platbu');
  assert.equal(notifications[3].title,'ANIRAK · Zkoušky');
  assert.ok(notifications[1].options.body.includes('Klient oznámil odeslání platby'));
  assert.equal(notifications[0].options.tag,undefined,'distinct bookings must not replace each other');
  for(const notification of notifications)assert.equal(notification.options.data.url,'/admin/zkousky');
  await dispatch('push',{data:{json:()=>({type:'reservation_payment_reported',url:'https://example.test'})}});
  await dispatch('push',{data:{json:()=>({type:'reservation_cash_selected'})}});
  assert.equal(notifications[4].title,'ANIRAK · Ověřit platbu');
  assert.ok(notifications[4].options.body.includes('platby za pronájem'));
  assert.equal(notifications[5].title,'ANIRAK · Platba hotově');
  assert.ok(notifications[5].options.body.includes('Platba zatím není potvrzená'));
  for(const notification of notifications.slice(4)){
    assert.equal(notification.options.data.url,'/admin/rezervace');
    assert.equal(notification.options.tag,undefined);
  }
  let closed=false;
  await dispatch('notificationclick',{notification:{close:()=>{closed=true;},data:{url:'https://example.test'}}});
  assert.equal(closed,true);assert.deepEqual(opened,['https://anirakids.cz/admin/zkousky']);
  await dispatch('notificationclick',{notification:{close(){},data:notifications[4].options.data}});
  assert.equal(opened[1],'https://anirakids.cz/admin/rezervace');
  const navigated=[];let focused=0;
  self.clients.matchAll=async()=>[{url:'https://anirakids.cz/partner/blaze',navigate:async url=>{navigated.push(url);},focus:async()=>{focused++;}}];
  await dispatch('notificationclick',{notification:{close(){},data:notifications[5].options.data}});
  assert.deepEqual(navigated,['https://anirakids.cz/admin/rezervace']);assert.equal(focused,1);
  assert.equal(opened.length,2,'reuse existing ANIRAK window');
  const detailIds=['1234567890abcdef12345678','abcdef1234567890abcdef12'];
  for(const [index,type] of ['reservation_payment_reported','reservation_cash_selected'].entries()){
    await dispatch('push',{data:{json:()=>({type,reservationId:detailIds[index].toUpperCase(),url:'https://example.test'})}});
    const notification=notifications.at(-1);
    assert.equal(notification.options.data.url,'/admin/rezervace/'+detailIds[index]);
    await dispatch('notificationclick',{notification:{close(){},data:notification.options.data}});
    assert.equal(navigated.at(-1),'https://anirakids.cz/admin/rezervace/'+detailIds[index]);
  }
  assert.equal(focused,3,'detail links reuse and focus existing ANIRAK window');
  self.clients.matchAll=async()=>[];
  for(const id of detailIds){
    await dispatch('notificationclick',{notification:{close(){},data:{url:'/admin/rezervace/'+id}}});
    assert.equal(opened.at(-1),'https://anirakids.cz/admin/rezervace/'+id);
  }
  for(const reservationId of [null,{},42,'../zkousky','https://example.test',detailIds[0]+'?x=1',detailIds[0]+'/other','g'.repeat(24)]){
    await dispatch('push',{data:{json:()=>({type:'reservation_payment_reported',reservationId})}});
    assert.equal(notifications.at(-1).options.data.url,'/admin/rezervace','invalid ID safely opens the list');
  }
  await dispatch('push',{data:{json:()=>({type:'fitting_created',reservationId:detailIds[0]})}});
  assert.equal(notifications.at(-1).options.data.url,'/admin/zkousky');
  for(const url of ['https://example.test','//example.test','/admin/rezervace/../zkousky','/admin/rezervace/'+detailIds[0]+'?redirect=https://example.test','/admin/rezervace/%2e%2e']){
    await dispatch('notificationclick',{notification:{close(){},data:{url}}});
    assert.equal(opened.at(-1),'https://anirakids.cz/admin/zkousky','click accepts only fixed admin routes or exact reservation IDs');
  }
  console.log('PASS: exact transfer/cash reservation links, new/existing windows, legacy list fallback, unsafe ID/URL rejection and unchanged fitting navigation');
})().catch(error=>{console.error(error);process.exitCode=1;});
