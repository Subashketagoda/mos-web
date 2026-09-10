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

    const knownIds = new Set<string>();
    let isInitial = true;

    console.log('⚡ [PushBridge] Real-time Lock Screen Web Push daemon active. Watching Firestore...');

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

            if (knownIds.has(doc.id) || (data.bookingRef && knownIds.has(refKey))) {
              continue;
            }

            knownIds.add(doc.id);
            if (data.bookingRef) knownIds.add(refKey);

            console.log(`🛎️ [PushBridge] New booking detected: ${data.customerName} - ${data.serviceName} on ${data.date} at ${data.startTime}`);

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
                    TTL: 86400,
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
