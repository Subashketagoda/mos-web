// public/sw.js
// Mosphere Luxury Salon - Service Worker for Lock Screen & Push Notifications

const CACHE_NAME = 'mosphere-sw-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification received from server (if Web Push protocol used)
self.addEventListener('push', (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: 'Mosphere Salon Alert', body: event.data.text() };
    }
  }

  const title = payload.title || '💈 Mosphere New Booking!';
  const bookingTag = payload.tag || 'mosphere-booking-alert';
  const options = {
    body: payload.body || 'A new appointment has been scheduled.',
    icon: payload.icon || '/apple-touch-icon.png',
    badge: payload.badge || '/images/mosphere-emblem-gold.png',
    vibrate: [300, 100, 300, 100, 500],
    tag: bookingTag,
    renotify: true,
    requireInteraction: true,
    data: payload.data || { url: '/admin' },
    actions: [
      { action: 'view', title: 'Open Admin' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// User clicked notification on Lock Screen or Notification Tray
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const rawUrl = (event.notification.data && event.notification.data.url) || 'admin';
  const targetUrl = new URL(rawUrl, self.registration.scope).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
