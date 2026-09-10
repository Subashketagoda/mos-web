// server/pushDaemon.js
// Standalone 24/7 Lock Screen Web Push Daemon for Mosphere Salon
// Listens directly to Cloud Firestore and dispatches native Lock Screen push alerts to admin devices even when the browser is closed.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, getDocs } from 'firebase/firestore';
import webpush from 'web-push';

const vapidPublicKey =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BGzWKJ8VD6koWDYTAw5bU7Y4d3nNa-t3p6Rg5n1J2w4LXV_Agvra4M98N-ODk8uxoEbO7NA_4xMEeSZjjRdn3S0';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'jKcf-C4CRZ3rUzNS641wRm13NsgAyhBJ8UVMy7YLQv8';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:concierge@mosphere.lk';

try {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} catch (e) {
  console.warn('VAPID init note:', e);
}

const firebaseConfig = {
  apiKey: Buffer.from('QUl6YVN5RHc2Nkx2aW5xcW9Helk1M2RpbGtDeXdQekEtbmpRSHpB', 'base64').toString('utf8'),
  authDomain: 'mos-web-eb5b1.firebaseapp.com',
  projectId: 'mos-web-eb5b1',
  storageBucket: 'mos-web-eb5b1.firebasestorage.app',
  messagingSenderId: '569927518656',
  appId: '1:569927518656:web:ff56df90019f628d15e025',
};

export function startPushDaemon() {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const knownIds = new Set();
  let isInitial = true;

  console.log('⚡ [PushDaemon] Watching Cloud Firestore bookings in real time...');

  onSnapshot(
    collection(db, 'bookings'),
    async (snapshot) => {
      // First snapshot: record existing documents so historical records don't trigger alerts
      if (isInitial) {
        snapshot.forEach((doc) => {
          knownIds.add(doc.id);
          const data = doc.data();
          if (data.bookingRef) knownIds.add(String(data.bookingRef).trim().toUpperCase());
        });
        isInitial = false;
        console.log(`⚡ [PushDaemon] Ready! (${knownIds.size} existing booking references stored).`);
        return;
      }

      // Detect new reservations
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const doc = change.doc;
          const data = doc.data();
          const refKey = data.bookingRef ? String(data.bookingRef).trim().toUpperCase() : doc.id;

          if (knownIds.has(doc.id) || (data.bookingRef && knownIds.has(refKey))) {
            continue;
          }

          knownIds.add(doc.id);
          if (data.bookingRef) knownIds.add(refKey);

          console.log(`🛎️ [PushDaemon] NEW BOOKING: ${data.customerName || 'Guest'} (${data.serviceName} on ${data.date} at ${data.startTime}) Ref: ${refKey}`);

          // Fetch push subscriptions
          try {
            const snap = await getDocs(collection(db, 'push_subscriptions'));
            const subscriptions = [];
            const seen = new Set();

            snap.forEach((d) => {
              const subData = d.data();
              if (subData.endpoint && subData.p256dh && subData.auth && !seen.has(subData.endpoint)) {
                seen.add(subData.endpoint);
                subscriptions.push({
                  endpoint: subData.endpoint,
                  keys: { p256dh: subData.p256dh, auth: subData.auth }
                });
              }
            });

            if (subscriptions.length === 0) {
              console.log('[PushDaemon] No push subscribers found in Firestore.');
              continue;
            }

            const payload = JSON.stringify({
              title: `💈 New Booking: ${data.customerName || 'Client'}`,
              body: `✂️ ${data.serviceName || 'Salon Service'}\n📅 ${data.date} at ${data.startTime}\n💰 LKR ${Number(data.price || 0).toLocaleString()} • Ref: ${refKey}\n📞 ${data.phone || ''}`,
              tag: `booking-${refKey}`,
              url: '/admin',
            });

            console.log(`📱 [PushDaemon] Delivering Lock Screen alert to ${subscriptions.length} registered device(s)...`);

            for (const sub of subscriptions) {
              try {
                const res = await webpush.sendNotification(sub, payload, {
                  TTL: 86400,
                  urgency: 'high'
                });
                console.log(`✅ [PushDaemon] Dispatched to ${sub.endpoint.slice(0, 35)}... (Status ${res.statusCode})`);
              } catch (pushErr) {
                console.warn(`⚠️ [PushDaemon] Push notice for ${sub.endpoint.slice(0, 35)}...:`, pushErr.statusCode || pushErr.message);
              }
            }
          } catch (fetchErr) {
            console.warn('[PushDaemon] Error fetching subscriptions:', fetchErr);
          }
        }
      }
    },
    (snapErr) => {
      console.warn('[PushDaemon] Snapshot error:', snapErr);
    }
  );
}

// Auto-start if invoked directly: node server/pushDaemon.js
if (process.argv[1] && process.argv[1].endsWith('pushDaemon.js')) {
  startPushDaemon();
  setInterval(() => {}, 60000); // keep alive
}
