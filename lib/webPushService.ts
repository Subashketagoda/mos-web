import webpush from 'web-push';
import { salonConfig } from './config';
import { query, initDatabase } from './db';
import { db as firestoreDb } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BGzWKJ8VD6koWDYTAw5bU7Y4d3nNa-t3p6Rg5n1J2w4LXV_Agvra4M98N-ODk8uxoEbO7NA_4xMEeSZjjRdn3S0';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'jKcf-C4CRZ3rUzNS641wRm13NsgAyhBJ8UVMy7YLQv8';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:concierge@mosphere.lk';

try {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} catch (e) {
  console.warn('VAPID initialization notice:', e);
}

export interface PushSubscriptionRecord {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Saves a browser push subscription to SQLite and Cloud Firestore
 */
export async function savePushSubscription(sub: PushSubscriptionRecord): Promise<boolean> {
  if (!sub || !sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return false;
  }

  // 1. Save to SQLite
  try {
    await initDatabase();
    await query.run(
      `INSERT OR REPLACE INTO push_subscriptions (id, endpoint, p256dh, auth, createdAt)
       VALUES (?, ?, ?, ?, ?)`,
      [
        sub.endpoint,
        sub.endpoint,
        sub.keys.p256dh,
        sub.keys.auth,
        new Date().toISOString()
      ]
    );
  } catch (err) {
    console.warn('SQLite push subscription save notice:', err);
  }

  // 2. Save to Cloud Firestore
  try {
    if (firestoreDb) {
      // Check if already exists in Firestore
      const snapshot = await getDocs(collection(firestoreDb, 'push_subscriptions'));
      let exists = false;
      snapshot.forEach((d) => {
        if (d.data().endpoint === sub.endpoint) {
          exists = true;
        }
      });

      if (!exists) {
        await addDoc(collection(firestoreDb, 'push_subscriptions'), {
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          createdAt: new Date().toISOString()
        });
      }
    }
  } catch (fsErr) {
    console.warn('Firestore push subscription save notice:', fsErr);
  }

  return true;
}

/**
 * Dispatches a native Lock Screen Web Push notification to all subscribed devices
 */
export async function sendPushToAllSubscribers(payload: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}): Promise<number> {
  const subscriptions: PushSubscriptionRecord[] = [];
  const seenEndpoints = new Set<string>();

  // 1. Read from SQLite
  try {
    await initDatabase();
    const rows = await query.all<any>('SELECT endpoint, p256dh, auth FROM push_subscriptions');
    for (const r of rows) {
      if (r.endpoint && !seenEndpoints.has(r.endpoint)) {
        seenEndpoints.add(r.endpoint);
        subscriptions.push({
          endpoint: r.endpoint,
          keys: { p256dh: r.p256dh, auth: r.auth }
        });
      }
    }
  } catch (e) {
    console.warn('Notice reading SQLite push subscriptions:', e);
  }

  // 2. Read from Cloud Firestore
  try {
    if (firestoreDb) {
      const snapshot = await getDocs(collection(firestoreDb, 'push_subscriptions'));
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.endpoint && !seenEndpoints.has(data.endpoint)) {
          seenEndpoints.add(data.endpoint);
          subscriptions.push({
            endpoint: data.endpoint,
            keys: { p256dh: data.p256dh, auth: data.auth }
          });
        }
      });
    }
  } catch (e) {
    console.warn('Notice reading Firestore push subscriptions:', e);
  }

  if (subscriptions.length === 0) {
    return 0;
  }

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: '/apple-touch-icon.png',
    badge: '/images/mosphere-emblem-gold.png',
    data: { url: payload.url || '/admin' },
    tag: payload.tag || `mosphere-${Date.now()}`
  });

  let sentCount = 0;
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth
            }
          },
          notificationPayload,
          {
            TTL: 180, // 3 minutes max - prevents APNs 24hr retry loops
            urgency: 'high'
          }
        );
        sentCount++;
      } catch (err: any) {
        // If expired or unsubscribed, remove from DB
        if (err.statusCode === 404 || err.statusCode === 410) {
          try {
            await query.run('DELETE FROM push_subscriptions WHERE endpoint = ?', [sub.endpoint]);
          } catch (delErr) {
            // ignore
          }
        }
        console.warn(`Push delivery note for ${sub.endpoint.slice(0, 30)}...:`, err.message);
      }
    })
  );

  return sentCount;
}

export { vapidPublicKey };
