/* ANIRAK admin-only notifications. This worker never reads auth tokens or stores customer data. */
self.addEventListener('push', event => {
  event.waitUntil(self.registration.showNotification('ANIRAK · Ověřit platbu', {
    body: 'Klient nahlásil platbu za zkoušku 200 Kč.',
    icon: '/logo192.png',
    tag: 'anirak-fitting-payment-review',
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
