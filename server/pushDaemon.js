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

  const daemonStartTime = Date.now();
  const knownIds = new Set();
  const alreadyPushedKeys = new Set();
  let isInitial = true;

  console.log('⚡ [PushDaemon] Watching Cloud Firestore bookings in real time...');

  // Pre-seed known IDs from Firestore immediately on start so existing records never trigger alerts
  getDocs(collection(db, 'bookings'))
    .then((existingSnap) => {
      existingSnap.forEach((doc) => {
        knownIds.add(doc.id);
        const data = doc.data();
        if (data.bookingRef) knownIds.add(String(data.bookingRef).trim().toUpperCase());
      });
      console.log(`⚡ [PushDaemon] Pre-seeded ${knownIds.size} historical booking keys.`);
    })
    .catch((e) => {
      console.warn('[PushDaemon] Notice pre-seeding bookings:', e);
    });

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

          // 1. Skip if already known/seen
          if (knownIds.has(doc.id) || (data.bookingRef && knownIds.has(refKey))) {
            continue;
          }

          // Mark known immediately
          knownIds.add(doc.id);
          if (data.bookingRef) knownIds.add(refKey);

          // 2. Parse createdAt timestamp
          let createdMs = 0;
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            createdMs = data.createdAt.toDate().getTime();
          } else if (typeof data.createdAt === 'string') {
            createdMs = new Date(data.createdAt).getTime();
          } else if (typeof data.createdAt === 'number') {
            createdMs = data.createdAt;
          }

          // 3. Skip if no valid timestamp
          if (!createdMs || isNaN(createdMs)) {
            console.log(`[PushDaemon] Skipping booking ${refKey} (no creation timestamp).`);
            continue;
          }

          // 4. Skip historical bookings created before this daemon started (10s buffer)
          if (createdMs < daemonStartTime - 10000) {
            console.log(`[PushDaemon] Skipping historical booking ${refKey} created in the past.`);
            continue;
          }

          // 5. Skip stale bookings (created > 5 minutes ago)
          if (Date.now() - createdMs > 5 * 60 * 1000) {
            console.log(`[PushDaemon] Skipping stale booking ${refKey} (older than 5m).`);
            continue;
          }

          // 6. Skip appointments scheduled on past dates
          const todayColombo = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo' }).format(new Date());
          if (data.date && data.date < todayColombo) {
            console.log(`[PushDaemon] Skipping past-dated booking ${refKey} (${data.date}).`);
            continue;
          }

          // 7. Skip cancelled or completed bookings
          if (data.status === 'cancelled' || data.status === 'completed') {
            continue;
          }

          // 8. Skip if already pushed
          if (alreadyPushedKeys.has(refKey) || alreadyPushedKeys.has(doc.id)) {
            continue;
          }
          alreadyPushedKeys.add(refKey);
          alreadyPushedKeys.add(doc.id);

          console.log(`🛎️ [PushDaemon] NEW REAL-TIME BOOKING: ${data.customerName || 'Guest'} (${data.serviceName} on ${data.date} at ${data.startTime}) Ref: ${refKey}`);

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
                  TTL: 180, // 3 minutes max - prevents APNs 24hr retry loops
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
