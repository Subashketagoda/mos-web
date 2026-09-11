// lib/pushBridge.ts
// Real-time Firestore to OS Lock Screen Web Push Daemon
// Wakes admin device and shows alerts even when the browser or tab is closed!

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, getDocs } from 'firebase/firestore';
import webpush from 'web-push';
import { firebaseConfig } from './firebase';

const vapidPublicKey =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BGzWKJ8VD6koWDYTAw5bU7Y4d3nNa-t3p6Rg5n1J2w4LXV_Agvra4M98N-ODk8uxoEbO7NA_4xMEeSZjjRdn3S0';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'jKcf-C4CRZ3rUzNS641wRm13NsgAyhBJ8UVMy7YLQv8';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:concierge@mosphere.lk';

try {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} catch (e) {
  console.warn('[PushBridge] VAPID initialization notice:', e);
}

let isBridgeActive = false;

export function startPushBridge(): void {
  if (isBridgeActive) return;
  isBridgeActive = true;

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const bridgeStartTime = Date.now();
    const knownIds = new Set<string>();
    const alreadyPushedKeys = new Set<string>();
    let isInitial = true;

    console.log('⚡ [PushBridge] Real-time Lock Screen Web Push daemon active. Watching Firestore...');

    // Pre-seed known IDs from Firestore immediately on boot so existing records never trigger alerts
    getDocs(collection(db, 'bookings'))
      .then((existingSnap) => {
        existingSnap.forEach((doc) => {
          knownIds.add(doc.id);
          const data = doc.data();
          if (data.bookingRef) knownIds.add(String(data.bookingRef).trim().toUpperCase());
        });
        console.log(`⚡ [PushBridge] Pre-seeded ${knownIds.size} historical booking keys.`);
      })
      .catch((e) => {
        console.warn('[PushBridge] Notice pre-seeding bookings:', e);
      });

    onSnapshot(
      collection(db, 'bookings'),
      async (snapshot) => {
        // Initial load: prime known IDs so existing historical bookings never trigger alerts
        if (isInitial) {
          snapshot.forEach((doc) => {
            knownIds.add(doc.id);
            const data = doc.data();
            if (data.bookingRef) knownIds.add(String(data.bookingRef).trim().toUpperCase());
          });
          isInitial = false;
          console.log(`⚡ [PushBridge] Synchronized ${knownIds.size} existing booking keys. Waiting for new reservations...`);
          return;
        }

        // Process real-time changes
        for (const change of snapshot.docChanges()) {
          if (change.type === 'added') {
            const doc = change.doc;
            const data = doc.data();
            const refKey = data.bookingRef ? String(data.bookingRef).trim().toUpperCase() : doc.id;

            // 1. Skip if already known/seen
            if (knownIds.has(doc.id) || (data.bookingRef && knownIds.has(refKey))) {
              continue;
            }

            // Always add to knownIds immediately to block duplicates
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
              console.log(`[PushBridge] Skipping booking ${refKey} (no creation timestamp).`);
              continue;
            }

            // 4. Skip historical bookings created before this server/bridge session started (10s buffer)
            if (createdMs < bridgeStartTime - 10000) {
              console.log(`[PushBridge] Skipping historical booking ${refKey} created in the past.`);
              continue;
            }

            // 5. Skip stale bookings (created > 5 minutes ago)
            if (Date.now() - createdMs > 5 * 60 * 1000) {
              console.log(`[PushBridge] Skipping stale booking ${refKey} (older than 5m).`);
              continue;
            }

            // 6. Skip appointments scheduled on past dates
            const todayColombo = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo' }).format(new Date());
            if (data.date && data.date < todayColombo) {
              console.log(`[PushBridge] Skipping past-dated booking ${refKey} (${data.date}).`);
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

            console.log(`🛎️ [PushBridge] Real-time new booking confirmed: ${data.customerName} - ${data.serviceName} on ${data.date} at ${data.startTime}`);

            // Retrieve registered push subscriptions from Firestore
            try {
              const subSnap = await getDocs(collection(db, 'push_subscriptions'));
              const subs: any[] = [];
              const seenEndpoints = new Set<string>();

              subSnap.forEach((s) => {
                const subData = s.data();
                if (subData.endpoint && subData.p256dh && subData.auth && !seenEndpoints.has(subData.endpoint)) {
                  seenEndpoints.add(subData.endpoint);
                  subs.push({
                    endpoint: subData.endpoint,
                    keys: { p256dh: subData.p256dh, auth: subData.auth },
                  });
                }
              });

              if (subs.length === 0) {
                console.log('[PushBridge] No active admin devices registered for push alerts.');
                continue;
              }

              const payload = JSON.stringify({
                title: `💈 New Booking: ${data.customerName || 'Client'}`,
                body: `✂️ ${data.serviceName || 'Salon Service'}\n📅 ${data.date} at ${data.startTime}\n💰 LKR ${Number(data.price || 0).toLocaleString()} • Ref: ${refKey}\n📞 ${data.phone || ''}`,
                tag: `booking-${refKey}`,
                url: '/admin',
              });

              console.log(`📱 [PushBridge] Broadcasting Lock Screen push to ${subs.length} device(s)...`);

              for (const sub of subs) {
                try {
                  const res = await webpush.sendNotification(sub, payload, {
                    TTL: 180, // 3 minutes max - prevents APNs from retrying stale notifications for 24 hours
                    urgency: 'high',
                  });
                  console.log(`✅ [PushBridge] Alert delivered to ${sub.endpoint.slice(0, 35)}... (HTTP ${res.statusCode})`);
                } catch (sendErr: any) {
                  console.warn(`⚠️ [PushBridge] Delivery notice for ${sub.endpoint.slice(0, 35)}...:`, sendErr.statusCode || sendErr.message);
                }
              }
            } catch (err) {
              console.warn('[PushBridge] Error reading push subscriptions:', err);
            }
          }
        }
      },
      (err) => {
        console.warn('[PushBridge] Firestore snapshot error:', err);
      }
    );
  } catch (initErr) {
    console.warn('[PushBridge] Initialization error:', initErr);
  }
}
