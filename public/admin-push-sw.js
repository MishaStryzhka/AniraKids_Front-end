/* ANIRAK admin-only notifications. This worker never reads auth tokens or stores customer data. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('push', event => {
  // Empty payloads are payment alerts from subscriptions created before event types.
  let type = 'fitting_payment_reported';
  try { if (event.data) type = event.data.json().type; } catch { type = 'unknown'; }
  const created = type === 'fitting_created';
  const payment = type === 'fitting_payment_reported';
  event.waitUntil(self.registration.showNotification(created ? 'ANIRAK · Nová zkouška' : payment ? 'ANIRAK · Ověřit platbu' : 'ANIRAK · Zkoušky', {
    body: created ? 'Byla vytvořena nová rezervace zkoušky.' : payment ? 'Klient oznámil odeslání platby za zkoušku 200 Kč.' : 'Zkontrolujte aktuální stav zkoušek v administraci.',
    icon: '/logo192.png',
    data: {url: '/admin/zkousky'},
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL('/admin/zkousky', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(async windows => {
    for (const client of windows) {
      if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
        await client.navigate(url);
        return client.focus();
      }
    }
    return self.clients.openWindow(url);
  }));
});
