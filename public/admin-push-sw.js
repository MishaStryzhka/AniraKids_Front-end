/* ANIRAK admin-only notifications. This worker never reads auth tokens or stores customer data. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('push', event => {
  // Empty payloads are payment alerts from subscriptions created before event types.
  let type = 'fitting_payment_reported';
  let reservationId;
  let fittingId;
  try {
    if (event.data) {
      const payload = event.data.json();
      type = payload.type;
      if (typeof payload.fittingId === 'string' && payload.fittingId.length === 24 && /^[a-f\d]{24}$/i.test(payload.fittingId)) {
        fittingId = payload.fittingId.toLowerCase();
      }
      if (typeof payload.reservationId === 'string' && /^[a-f\d]{24}$/i.test(payload.reservationId)) {
        reservationId = payload.reservationId.toLowerCase();
      }
    }
  } catch { type = 'unknown'; }
  const created = type === 'fitting_created';
  const payment = type === 'fitting_payment_reported';
  const transfer = type === 'reservation_payment_reported';
  const cash = type === 'reservation_cash_selected';
  event.waitUntil(self.registration.showNotification(created ? 'ANIRAK · Nová zkouška' : cash ? 'ANIRAK · Platba hotově' : payment || transfer ? 'ANIRAK · Ověřit platbu' : 'ANIRAK · Zkoušky', {
    body: created ? 'Byla vytvořena nová rezervace zkoušky.' :
      payment ? 'Klient oznámil odeslání platby za zkoušku 200 Kč.' :
      transfer ? 'Klient oznámil odeslání platby za pronájem. Ověřte přijetí peněz.' :
      cash ? 'Klient zvolil platbu hotově při převzetí. Platba zatím není potvrzená.' :
      'Zkontrolujte aktuální stav zkoušek v administraci.',
    icon: '/logo192.png',
    data: {url: transfer || cash ? '/admin/rezervace' + (reservationId ? '/' + reservationId : '') : '/admin/zkousky' + ((created || payment) && fittingId ? '/' + fittingId : '')},
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const requested = event.notification.data?.url;
  const path = typeof requested === 'string' && /^\/admin\/(?:rezervace|zkousky)(?:\/[a-f\d]{24})?$/.test(requested)
    ? requested : '/admin/zkousky';
  const url = new URL(path, self.location.origin).href;
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
