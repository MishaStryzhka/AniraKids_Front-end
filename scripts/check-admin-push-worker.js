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
  let closed=false;
  await dispatch('notificationclick',{notification:{close:()=>{closed=true;},data:{url:'https://example.test'}}});
  assert.equal(closed,true);assert.deepEqual(opened,['https://anirakids.cz/admin/zkousky']);
  console.log('PASS: new fitting/payment/legacy payloads, independent alerts, fixed admin navigation and malformed payload fallback');
})().catch(error=>{console.error(error);process.exitCode=1;});
