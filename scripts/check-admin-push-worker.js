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
  console.log('PASS: fitting/rental-transfer/cash/legacy payloads, independent alerts, allowlisted admin navigation, window reuse and malformed payload fallback');
})().catch(error=>{console.error(error);process.exitCode=1;});
