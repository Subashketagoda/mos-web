// public/sw.js
// Mosphere Luxury Salon - Service Worker for Lock Screen & Push Notifications

const CACHE_NAME = 'mosphere-sw-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification received from server (Web Push protocol)
self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    try {
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

      // Cross-platform options safe for iOS WebKit & Android/Desktop Chrome
      const options = {
        body: payload.body || 'A new appointment has been scheduled.',
        icon: payload.icon || '/apple-touch-icon.png',
        badge: payload.badge || '/images/mosphere-emblem-gold.png',
        tag: bookingTag,
        renotify: false,
        requireInteraction: false,
        data: payload.data || { url: '/admin' }
      };

      try {
        await self.registration.showNotification(title, options);
      } catch (displayErr) {
        // Fallback for strict browser engines
        try {
          await self.registration.showNotification(title, {
            body: options.body,
            tag: bookingTag
          });
        } catch (minErr) {
          console.warn('SW minimal notification notice:', minErr);
        }
      }
    } catch (pushErr) {
      console.warn('SW push handler notice:', pushErr);
    }
  })());
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
